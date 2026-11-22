// Vercel serverless function — Give a gift.
//   POST /api/gift   (signed-in member; Authorization: Bearer <supabase access token>)
//        body { from: name, photo?: "data:image/jpeg;base64,..." }
//        -> saves a new gift (each press of "Send to a friend" makes a new one), returns { id, url }
//   GET  /api/gift?id=<id>   (no sign-in) -> what the friend's page needs: { id, from, photo, expired }
//        The sender's account id is never sent to the browser.
//
// A gift link works for 7 days from when it was made (api/_gifts.js expired()).
// Required Vercel env vars: SUPABASE_SERVICE_ROLE_KEY (already set), ANTHROPIC_API_KEY (already set, checks the name).
// Optional: GIFT_LINK_BASE (e.g. https://www.sussuri.com) — see api/_gifts.js.
// Table: supabase/gifts.sql (run once in Supabase).

import { verifyUser, memberPlan, getGift, insertGift, newId, wordingOk, cleanLine, cleanPhoto, linkBase, expired, giftName } from "./_gifts.js";

export const config = { maxDuration: 20 };

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") {
    const g = await getGift(req.query && req.query.id);
    if (!g) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ id: g.id, from: giftName(g), photo: g.photo || null, expired: expired(g) });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: "The link could not be made just now. Please try again." });

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const user = await verifyUser(token);
  if (!user) return res.status(401).json({ error: "Please sign in again, then try once more." });
  const plan = await memberPlan(user.id);
  if (!plan || plan === "free") return res.status(403).json({ error: "Giving gifts is for members." });

  const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const from = cleanLine(b.from, 20) || "A friend";
  const photo = cleanPhoto(b.photo);

  if (!(await wordingOk(from))) {
    return res.status(422).json({ error: "That name can't go on a gift card. Please change it and try again." });
  }

  for (let i = 0; i < 4; i++) {
    const id = newId();
    const st = await insertGift({ id, sender: user.id, kind: "card", from_name: from, message: "", photo });
    if (st === 201) return res.status(200).json({ id, url: `${linkBase(req)}/g/${id}` });
    if (st !== 409) break;
  }
  return res.status(500).json({ error: "The link could not be made just now. Please try again." });
}
