// Vercel serverless function — Give a gift.
//   POST /api/gift   (signed-in member; Authorization: Bearer <supabase access token>)
//        body { kind: 'know'|'med'|'card', meditation?: slug, from: name, message: text }
//        -> checks the wording, saves the gift, returns { id, url }
//   GET  /api/gift?id=<id>   (no sign-in) -> what the friend's page needs: { id, kind, meditation, from, message }
//        The sender's account id is never sent to the browser.
//
// Required Vercel env vars: SUPABASE_SERVICE_ROLE_KEY (already set), ANTHROPIC_API_KEY (already set).
// Optional: GIFT_LINK_BASE (e.g. https://www.sussuri.com) — see api/_gifts.js.
// Table: supabase/gifts.sql (run once in Supabase).

import { verifyUser, memberPlan, getGift, insertGift, newId, sessions, wordingOk, cleanLine, linkBase } from "./_gifts.js";

export const config = { maxDuration: 20 };

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") {
    const g = await getGift(req.query && req.query.id);
    if (!g) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ id: g.id, kind: g.kind, meditation: g.meditation, from: g.from_name, message: g.message });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: "The link could not be made just now. Please try again." });

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const user = await verifyUser(token);
  if (!user) return res.status(401).json({ error: "Please sign in again, then try once more." });
  const plan = await memberPlan(user.id);
  if (!plan || plan === "free") return res.status(403).json({ error: "Giving gifts is for members." });

  const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const kind = ["know", "med", "card"].includes(b.kind) ? b.kind : null;
  const from = cleanLine(b.from, 20), message = cleanLine(b.message, 140);
  let meditation = null;
  if (!kind) return res.status(400).json({ error: "Choose a gift first." });
  if (!from) return res.status(400).json({ error: "Add your first name, so your friend knows who it is from." });
  if (kind === "med") {
    meditation = String(b.meditation || "");
    if (!sessions().some(s => s.slug === meditation)) return res.status(400).json({ error: "Choose a meditation first." });
  }

  if (!(await wordingOk(from + "\n" + message))) {
    return res.status(422).json({ error: "Some of those words can't go on a gift card. Please change the message and try again." });
  }

  for (let i = 0; i < 4; i++) {
    const id = newId();
    const st = await insertGift({ id, sender: user.id, kind, meditation, from_name: from, message });
    if (st === 201) return res.status(200).json({ id, url: `${linkBase(req)}/g/${id}` });
    if (st !== 409) break;
  }
  return res.status(500).json({ error: "The link could not be made just now. Please try again." });
}
