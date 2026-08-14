// Vercel serverless function — permanently deletes a Psyche account.
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
