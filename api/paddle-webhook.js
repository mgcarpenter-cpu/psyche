// Vercel serverless function — receives Paddle webhooks and updates the user's plan
// in Supabase when a subscription becomes active / changes / cancels.
//
// Security: verifies Paddle's signature (HMAC-SHA256) using PADDLE_WEBHOOK_SECRET,
// so only genuine Paddle events can change a plan. Updates Supabase with the
// service-role key (SUPABASE_SERVICE_ROLE_KEY) via the REST API.
//
// Required Vercel env vars:
//   PADDLE_WEBHOOK_SECRET      — the signing secret from the Paddle webhook destination
//   SUPABASE_SERVICE_ROLE_KEY  — Supabase project service-role key (secret!)

import crypto from "crypto";

export const config = { api: { bodyParser: false }, maxDuration: 30 };

const SUPABASE_URL = "https://hydzekyzbqhcvajnuegh.supabase.co";

// price id -> plan
const PRICE_TO_PLAN = {
  "pri_01kw0rqt339scen89r0k1wpp02": "plus",
  "pri_01kw0rx0p6wak5k2pfx774bre7": "pro"
};

async function readRaw(req) {
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === "string" ? Buffer.from(c) : c);
  return Buffer.concat(chunks).toString("utf8");
}

function verifySignature(rawBody, sigHeader, secret) {
  if (!sigHeader) return false;
  const parts = {};
  for (const kv of String(sigHeader).split(";")) {
    const i = kv.indexOf("=");
    if (i > -1) parts[kv.slice(0, i).trim()] = kv.slice(i + 1).trim();
  }
  const ts = parts.ts, h1 = parts.h1;
  if (!ts || !h1) return false;
  const digest = crypto.createHmac("sha256", secret).update(`${ts}:${rawBody}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(h1));
  } catch (e) {
    return false;
  }
}

function planFromData(data) {
  const items = data.items || [];
  for (const it of items) {
    const pid = (it.price && it.price.id) || it.price_id;
    if (pid && PRICE_TO_PLAN[pid]) return PRICE_TO_PLAN[pid];
  }
  if (data.custom_data && data.custom_data.plan) return data.custom_data.plan;
  return null;
}

async function patchProfile(uid, patch) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const body = {};
  for (const k in patch) if (patch[k] != null) body[k] = patch[k];
  if (!Object.keys(body).length) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(uid)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "return=minimal"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase update failed (${res.status}): ${txt}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Webhook not configured" });
  }

  const raw = await readRaw(req);
  if (!verifySignature(raw, req.headers["paddle-signature"], secret)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  let evt;
  try { evt = JSON.parse(raw); } catch (e) { return res.status(400).json({ error: "Bad JSON" }); }

  const type = evt.event_type;
  const data = evt.data || {};
  const uid = data.custom_data && data.custom_data.user_id;

  try {
    let plan = null;
    if (type === "subscription.activated" || type === "subscription.created" || type === "subscription.updated") {
      plan = planFromData(data);
    } else if (type === "subscription.canceled") {
      plan = "free";
    }
    if (plan && uid) {
      // also remember the Paddle customer + subscription ids so we can open the portal later
      await patchProfile(uid, {
        plan,
        paddle_customer_id: data.customer_id,
        paddle_subscription_id: type.indexOf("subscription") === 0 ? data.id : undefined
      });
      console.log(`paddle-webhook: set ${uid} -> ${plan} (${type})`);
    }
  } catch (err) {
    console.error("paddle-webhook error:", err);
    // Still 200 so Paddle doesn't hammer retries on a transient issue; we logged it.
  }

  return res.status(200).json({ ok: true });
}
