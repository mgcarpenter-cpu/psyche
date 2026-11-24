// Shared by api/gift.js, api/g.js and api/gift-image.js (files starting with _ are not routes on Vercel).
// Gifts live in the Supabase table public.gifts (supabase/gifts.sql). Only these server functions read or
// write it, with the service-role key; the browser never touches the table.

import { readFileSync } from "node:fs";
import { join } from "node:path";

export const SUPABASE_URL = "https://hydzekyzbqhcvajnuegh.supabase.co";
export const SUPABASE_ANON = "sb_publishable_4OMJbKxYkzEapBMABHuThw_E60ZNWEb";
const ROOT = process.cwd();

function svc() {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { apikey: k, Authorization: `Bearer ${k}`, "Content-Type": "application/json" };
}

export async function verifyUser(token) {
  if (!token) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON } });
    const u = await r.json();
    return r.ok && u && u.id ? u : null;
  } catch (e) { return null; }
}

export async function memberPlan(uid) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(uid)}&select=plan`, { headers: svc() });
  const rows = r.ok ? await r.json() : [];
  return rows && rows[0] ? rows[0].plan || "free" : "free";
}

export async function getGift(id) {
  if (!/^[A-Za-z0-9]{4,16}$/.test(String(id || ""))) return null;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/gifts?id=eq.${id}&select=id,kind,meditation,from_name,message,photo,created_at`, { headers: svc() });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows && rows[0] ? rows[0] : null;
}

export async function insertGift(row) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/gifts`, { method: "POST", headers: { ...svc(), Prefer: "return=minimal" }, body: JSON.stringify(row) });
  return r.status;   // 201 saved, 409 the id is taken
}

// A gift does not run out (24 Nov 2026): a gift link works for as long as its row exists.
export function giftName(g) { return cleanLine(g && g.from_name, 20) || "A friend"; }

// Preview link, nothing saved: /g/preview-card.
// ?from=<name> tries another name on the preview (20 letters at most), so the page, the card and the picture can be checked.
export function sampleGift(id, from) {
  if (id !== "preview-card") return null;
  const name = cleanLine(from, 20) || "Mark";
  return { id, kind: "card", from_name: name, photo: null, created_at: new Date().toISOString(), sample: true };
}
// the photo: a small square JPEG made in the browser (give-a-gift.html), kept with the gift
export function cleanPhoto(v) {
  const s = String(v || "");
  return /^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(s) && s.length <= 40000 ? s : null;
}

// short, unguessable id for the link: 7 letters and numbers
export function newId() {
  const A = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const b = new Uint8Array(7);
  crypto.getRandomValues(b);
  for (const x of b) s += A[x % A.length];
  return s;
}

// the meditations, from the same file the Meditations page uses
let SESS = null;
export function sessions() {
  if (SESS) return SESS;
  try {
    const t = readFileSync(join(ROOT, "meditation-sessions.js"), "utf8");
    const m = t.match(/window\.SUSSURI_SESSIONS\s*=\s*(\[[\s\S]*?\n\]);/);
    SESS = m ? JSON.parse(m[1]) : [];
  } catch (e) { SESS = []; }
  return SESS;
}
export function firstSentence(t) { const m = /^(.*?[.!?])(\s|$)/.exec(String(t || "")); return m ? m[1] : String(t || ""); }

// the words on the card (same as gift-card.js words())
export function cardWords(g) {
  if (g.kind === "know") return { gift: "Know yourself: find out who you really are", about: "Pick the images you are drawn to and see how your mind works. Fun, and a little eye-opening.", cta: "Open your gift" };
  if (g.kind === "med") {
    const it = sessions().find(s => s.slug === g.meditation);
    if (it) return { gift: `${it.title}, a ${parseInt(it.length, 10)} minute meditation`, about: firstSentence(it.about), cta: "Open your gift", med: it };
  }
  return { gift: "What is Sussuri?", about: "A guide for your mind: coaching, meditations and training that help you feel calm and reach your goals.", cta: "Start my free month" };
}

// ---- the basic wording check ----
// 1) a short list of words that never go on a card; 2) a quick look by Claude for abuse, threats, sexual
// content, hate, self-harm encouragement or scams. If Claude can't be reached, the word list alone decides.
const BLOCK = ["fuck", "cunt", "nigger", "nigga", "faggot", "retard", "whore", "slut", "kill yourself", "kys", "rape", "bitch", "wanker", "twat", "porn", "nazi"];
function listCheck(t) {
  const s = " " + String(t || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ") + " ";
  return !BLOCK.some(w => s.includes(" " + w + " ") || s.includes(" " + w + "s ") || s.includes(" " + w + "ing ") || s.includes(" " + w + "er "));
}
export async function wordingOk(text) {
  const t = String(text || "").trim();
  if (!t) return true;
  if (!listCheck(t)) return false;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return true;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", signal: ctl.signal,
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 5,
        system: "You check short gift messages that one person sends a friend on a wellbeing app's card. Reply with exactly one word: OK if the message is fine to send, or BLOCK if it is abusive, insulting, threatening, sexual, hateful, encourages self-harm, or looks like a scam or spam. Mild warmth, jokes and everyday words are OK.",
        messages: [{ role: "user", content: `Message: """${t.slice(0, 200)}"""` }]
      })
    });
    clearTimeout(timer);
    const d = await r.json();
    const out = (d && d.content && d.content[0] && d.content[0].text || "").trim().toUpperCase();
    return !out.startsWith("BLOCK");
  } catch (e) { return true; }
}

export function cleanLine(v, max) { return String(v || "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
export function esc(s) { return String(s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

// where gift links point. Set GIFT_LINK_BASE=https://www.sussuri.com in Vercel once sussuri.com forwards /g/ here;
// until then the link uses this site's own address.
export function linkBase(req) {
  const env = (process.env.GIFT_LINK_BASE || "").replace(/\/+$/, "");
  if (env) return env;
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
  return `${proto}://${req.headers["x-forwarded-host"] || req.headers.host}`;
}
export function selfBase(req) {
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
  return `${proto}://${req.headers["x-forwarded-host"] || req.headers.host}`;
}
