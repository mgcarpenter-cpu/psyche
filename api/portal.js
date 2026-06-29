// Vercel serverless function — opens a Paddle customer portal session so a logged-in
// user can manage or cancel their own subscription. Verifies the user's Supabase token,
// looks up their Paddle customer id, then asks Paddle for a portal URL.
//
// Required Vercel env vars:
//   PADDLE_API_KEY             — Paddle secret API key (Developer Tools > Authentication > API keys)
//   SUPABASE_SERVICE_ROLE_KEY  — already set for the webhook
//   PADDLE_ENV (optional)      — "production" to hit live Paddle; defaults to sandbox

export const config = { maxDuration: 30 };

const SUPABASE_URL = "https://hydzekyzbqhcvajnuegh.supabase.co";
const SUPABASE_ANON = "sb_publishable_4OMJbKxYkzEapBMABHuThw_E60ZNWEb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.PADDLE_API_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey || !serviceKey) return res.status(500).json({ error: "Portal not configured" });

  // 1) Verify the caller via their Supabase access token.
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Not signed in" });

  let uid;
  try {
    const ures = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON }
    });
    const user = await ures.json();
    if (!ures.ok || !user || !user.id) return res.status(401).json({ error: "Invalid session" });
    uid = user.id;
  } catch (e) {
    return res.status(401).json({ error: "Could not verify session" });
  }

  // 2) Look up this user's Paddle customer id (service role bypasses RLS).
  let customerId, subId;
  try {
    const pres = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(uid)}&select=paddle_customer_id,paddle_subscription_id`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const rows = await pres.json();
    customerId = rows && rows[0] && rows[0].paddle_customer_id;
    subId = rows && rows[0] && rows[0].paddle_subscription_id;
  } catch (e) {
    return res.status(500).json({ error: "Lookup failed" });
  }
  if (!customerId) return res.status(404).json({ error: "No subscription on file" });

  // 3) Create a Paddle portal session for that customer.
  const base = process.env.PADDLE_ENV === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
  try {
    const psres = await fetch(`${base}/customers/${customerId}/portal-sessions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(subId ? { subscription_ids: [subId] } : {})
    });
    const ps = await psres.json();
    const urls = ps && ps.data && ps.data.urls;
    const url = urls && (urls.general && urls.general.overview);
    if (!url) return res.status(502).json({ error: "Could not open portal", detail: ps && ps.error });
    return res.status(200).json({ url });
  } catch (e) {
    return res.status(500).json({ error: "Portal request failed" });
  }
}
