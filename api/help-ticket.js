// Vercel serverless function — captures a Help-page escalation as a support ticket in
// Supabase, classifies it into a tag, and increments a recurring-question counter so
// Mark can later see which questions come up most.
//
// Required Vercel env vars (already set for other functions in this project):
//   ANTHROPIC_API_KEY          — for the small tag-classification call
//   SUPABASE_SERVICE_ROLE_KEY  — service-role key, bypasses RLS for the writes below
//
// Expected Supabase tables (create these before tickets will actually persist —
// this function degrades to a clear error response if they don't exist yet):
//
//   help_tickets (
//     id uuid primary key default gen_random_uuid(),
//     user_id uuid,                 -- null for a signed-out visitor
//     question text,
//     tag text,                     -- question | bug | billing | account | idea
//     source text,                  -- thumbs_down | unanswered | free_text
//     account_context jsonb,        -- snapshot of plan/payout/etc at ticket time
//     created_at timestamptz default now()
//   )
//
//   help_question_log (
//     id uuid primary key default gen_random_uuid(),
//     question_key text,            -- normalized (lowercased/trimmed) question
//     sample_question text,         -- original casing, for display
//     count int default 1,
//     last_seen_at timestamptz default now()
//   )

export const config = { maxDuration: 30 };

const SUPABASE_URL = "https://hydzekyzbqhcvajnuegh.supabase.co";
const SUPABASE_ANON = "sb_publishable_4OMJbKxYkzEapBMABHuThw_E60ZNWEb";
const VALID_TAGS = ["question", "bug", "billing", "account", "idea"];

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

async function classifyTag(question) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return "question";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 10,
        system: "Classify the following support question into exactly one word from this list: question, bug, billing, account, idea. Reply with only that one lowercase word, nothing else.",
        messages: [{ role: "user", content: String(question).slice(0, 1000) }]
      })
    });
    const data = await res.json();
    const text = ((data.content || []).map(c => c.text || "").join("") || "").trim().toLowerCase();
    return VALID_TAGS.includes(text) ? text : "question";
  } catch (e) {
    return "question";
  }
}

async function sbFetch(path, opts) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, Object.assign({}, opts, {
    headers: Object.assign({
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`
    }, (opts && opts.headers) || {})
  }));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Ticket capture not configured" });
  }

  const { question, source, accountContext } = req.body || {};
  if (!question || !String(question).trim()) {
    return res.status(400).json({ error: "Missing question" });
  }

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const user = await verifyUser(token);
  const uid = user && user.id ? user.id : null;

  const tag = await classifyTag(question);

  try {
    const ticketRes = await sbFetch("help_tickets", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        user_id: uid,
        question: String(question).slice(0, 2000),
        tag,
        source: source || "unknown",
        account_context: accountContext || null
      })
    });
    if (!ticketRes.ok) {
      const txt = await ticketRes.text();
      console.error("help_tickets insert failed:", ticketRes.status, txt);
      return res.status(502).json({ error: "Could not save ticket — has the help_tickets table been created in Supabase yet?" });
    }
  } catch (e) {
    console.error("help_tickets insert error:", e);
    return res.status(500).json({ error: "Ticket save failed" });
  }

  // Recurring-question log — find-or-increment by a normalized question key.
  try {
    const qkey = String(question).trim().toLowerCase().replace(/\s+/g, " ").slice(0, 300);
    const findRes = await sbFetch(`help_question_log?question_key=eq.${encodeURIComponent(qkey)}&select=id,count`);
    const rows = findRes.ok ? await findRes.json() : [];
    if (rows && rows[0]) {
      await sbFetch(`help_question_log?id=eq.${rows[0].id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ count: (rows[0].count || 1) + 1, last_seen_at: new Date().toISOString() })
      });
    } else {
      await sbFetch("help_question_log", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ question_key: qkey, sample_question: String(question).slice(0, 500), count: 1 })
      });
    }
  } catch (e) {
    // Non-fatal — the ticket itself already saved, the recurring-question count is a bonus.
    console.error("help_question_log update failed:", e);
  }

  return res.status(200).json({ ok: true, tag });
}
