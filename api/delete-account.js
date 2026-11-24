// Vercel serverless function — permanently deletes a Sussuri account.
//
// This is a REAL server-side delete, not a client-side flag:
//   1) deletes the person's `profiles` row (their plan, api_key, contact_email,
//      pearl settings, etc. all live on this one row — once it's gone there is
//      nothing left to ever pay out, which is how pending commission is
//      forfeited; there's no separate payouts ledger yet to write a formal
//      forfeiture record to, see the note in delete-account.html)
//   2) deletes the underlying Supabase Auth user itself via the Auth Admin API,
//      so the account can never be signed back into. This step requires the
//      service-role key and can only happen server-side — the client never
//      sees or holds that key.
//
// Required Vercel env vars (already set for other functions in this project):
//   SUPABASE_SERVICE_ROLE_KEY
//
// Note: reveals, assessment results, practice history, and library share state
// are NOT stored in Supabase today — they live in the browser's localStorage
// (see index.html/practice.html/library.html etc). This function removes the
// real server-side account (profile + auth user); the client is responsible
// for clearing its own local psyche:* storage once this call succeeds.

export const config = { maxDuration: 30 };

const SUPABASE_URL = "https://hydzekyzbqhcvajnuegh.supabase.co";
const SUPABASE_ANON = "sb_publishable_4OMJbKxYkzEapBMABHuThw_E60ZNWEb";

async function verifyUser(token) {
  if (!token) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON }
    });
    const user = await res.json();
    if (!res.ok || !user || !user.id) return null;
    return user;
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return res.status(500).json({ error: "Account deletion not configured" });

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const user = await verifyUser(token);
  if (!user || !user.id) return res.status(401).json({ error: "Not signed in" });
  const uid = user.id;

  // 0) Closing the account also ends the membership (site walk fixes, 24 Nov 2026): if this person has a
  //    subscription with the payment provider, cancel it now, so nothing is charged after the account is gone.
  //    Needs PADDLE_API_KEY (the same one api/portal.js uses). If the cancel fails the account is NOT deleted,
  //    so nobody is left paying for an account they can no longer open.
  try {
    const sRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(uid)}&select=paddle_subscription_id`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
    });
    const rows = sRes.ok ? await sRes.json() : [];
    const subId = rows && rows[0] && rows[0].paddle_subscription_id;
    if (subId) {
      const paddleKey = process.env.PADDLE_API_KEY;
      if (!paddleKey) return res.status(500).json({ error: "Could not end the membership (payment provider not configured). The account was not closed." });
      const base = process.env.PADDLE_ENV === "production" ? "https://api.paddle.com" : "https://sandbox-api.paddle.com";
      const cRes = await fetch(`${base}/subscriptions/${subId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${paddleKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ effective_from: "immediately" })
      });
      if (!cRes.ok) {
        const body = await cRes.json().catch(() => ({}));
        const code = body && body.error && body.error.code;
        // already cancelled is fine; anything else stops here
        if (code !== "subscription_update_when_canceled" && code !== "subscription_locked_pending_changes") {
          console.error("delete-account: subscription cancel failed:", cRes.status, code);
          return res.status(502).json({ error: "Could not end the membership, so the account was not closed. Please try again." });
        }
      }
    }
  } catch (e) {
    console.error("delete-account: subscription lookup/cancel error:", e);
    return res.status(502).json({ error: "Could not end the membership, so the account was not closed. Please try again." });
  }

  // 1) Delete the profile row.
  try {
    const pRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(uid)}`, {
      method: "DELETE",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: "return=minimal" }
    });
    if (!pRes.ok) {
      const txt = await pRes.text();
      console.error("delete-account: profile delete failed:", pRes.status, txt);
      // Keep going — removing the auth user below is what actually matters for
      // "can this person still sign in"; a stray profile row with no auth user
      // behind it is inert and harmless either way.
    }
  } catch (e) {
    console.error("delete-account: profile delete error:", e);
  }

  // 2) Delete the Supabase Auth user itself — the real account.
  try {
    const aRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${uid}`, {
      method: "DELETE",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
    });
    if (!aRes.ok) {
      const txt = await aRes.text();
      console.error("delete-account: auth user delete failed:", aRes.status, txt);
      return res.status(502).json({ error: "Could not fully delete the account — please try again or contact support." });
    }
  } catch (e) {
    console.error("delete-account: auth user delete error:", e);
    return res.status(500).json({ error: "Account deletion failed" });
  }

  return res.status(200).json({ ok: true });
}
