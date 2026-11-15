// Vercel serverless function — makes a one-time sign-in link for the signed-in member, so the code on the
// "You're in" screen can open Sussuri on their phone already signed in.
// Verifies the caller's Supabase token, then asks Supabase (service role) for a magic link for that same person.
// The link works once and expires on Supabase's usual magic-link timer.
//
// Required Vercel env var:
//   SUPABASE_SERVICE_ROLE_KEY  — already set for the webhook
// The address it returns to (/youre-in.html) must be in Supabase's allowed redirect URLs.

export const config = { maxDuration: 30 };

const SUPABASE_URL = "https://hydzekyzbqhcvajnuegh.supabase.co";
const SUPABASE_ANON = "sb_publishable_4OMJbKxYkzEapBMABHuThw_E60ZNWEb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return res.status(500).json({ error: "Not configured" });

  // 1) who is asking
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Not signed in" });
  let email;
  try {
    const ures = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON } });
    const user = await ures.json();
    if (!ures.ok || !user || !user.email) return res.status(401).json({ error: "Invalid session" });
    email = user.email;
  } catch (e) {
    return res.status(401).json({ error: "Could not verify session" });
  }

  // 2) a one-time sign-in link for that person, landing back on the "You're in" screen
  const origin = (req.headers.origin && /^https?:\/\//.test(req.headers.origin)) ? req.headers.origin : `https://${req.headers.host}`;
  try {
    const gres = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ type: "magiclink", email, redirect_to: `${origin}/youre-in.html` })
    });
    const data = await gres.json();
    const url = data && (data.action_link || (data.properties && data.properties.action_link));
    if (!gres.ok || !url) return res.status(502).json({ error: "Could not make the link" });
    return res.status(200).json({ url });
  } catch (e) {
    return res.status(500).json({ error: "Link request failed" });
  }
}
