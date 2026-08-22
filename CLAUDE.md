# CLAUDE.md — Psyche

Orientation for future sessions. Keep this file current as the project evolves.

## What Psyche is

A sutta-grounded AI coaching webapp. A "contemplative guide" chat experience grounded
in the Buddha's teachings (delivered in plain modern English — never Pali, never
scripture name-drops). The conceptual core the AI teaches: the engine of suffering —
**contact → feeling-tone (pleasant/unpleasant/neutral) → reaction (grasp/push/dim) →
suffering**, and the way through is meeting the feeling-tone without reacting, maturing
into equanimity.

The product is framed as an **eight-step path** (mapped to the Noble Eightfold Path but
never named as such in the UI), grouped under Wisdom / Conduct / Inner work. Each theme
is its own chat thread that "remembers" the person.

## Stack

- **Frontend:** single-file static `index.html` — vanilla HTML/CSS/JS, no build step,
  no framework. All CSS and JS are inline. Fonts from Google Fonts (Cinzel, Cormorant
  Garamond, Caveat). State persists in `localStorage` (`psyche:thread:<key>`).
- **Backend:** Vercel serverless functions in `api/`.
  - `api/chat.js` — proxies the Anthropic Messages API, hiding `ANTHROPIC_API_KEY`.
    Model **`claude-sonnet-4-6`**. Browser POSTs `{messages, system, max_tokens}` to
    `/api/chat`; function adds the key + `anthropic-version: 2023-06-01`. `maxDuration: 60`.
  - `api/gemini-token.js` — mints a short-lived ephemeral token for Gemini Live
    (voice prototype). Uses `@google/genai`, model
    `gemini-2.5-flash-native-audio-preview-09-2025`, hides `GEMINI_API_KEY`.
- **Deploy:** push to GitHub → Vercel auto-builds. No CI, no tests.
- **Config:** `vercel.json` (`cleanUrls: true`, `api/chat.js` maxDuration 60).
  `package.json` (`type: module`, only dep `@google/genai`).

## Files

- `index.html` — the working app (landing + chat + path + progress screens, drawer,
  reflection panel, bottom tabs). ~530 lines; line 277 is a ~95KB embedded data-URI
  hero image, so read this file in ranges, not whole.
- `voice.html` — parked voice prototype. Mic → Gemini Live native-audio → spoken
  replies. Standalone, Chrome-only, uses its own system prompt (same Psyche persona,
  tuned for spoken/heard replies). Not linked from the main app.
- `api/chat.js`, `api/gemini-token.js` — see above.
- `images/` — themed reflection images named by tier: `t1_*` (wealth/comfort: yacht,
  ferrari, penthouse), `t2_*` (conflict/hardship), `t3_*` (nature/reflection),
  `t4_*` (spiritual/helping/meditation). Currently the reflection grid uses CSS
  gradients + text labels, NOT these images yet — they appear staged for future use.

## How the app works (index.html)

- **Screens** (`.screen`, toggled by `go(id)`): `land`, `chat`, `path`, `progress`.
  Plus a sliding `drawer` (thread list), a `refl` reflection panel, and bottom `tabs`.
- **Themes:** `THEMES` object maps 8 keys (e.g. `seeing-clearly`, `heart-leans`) to
  `{name, focus}`. Only the first two are "unlocked" in the demo; the rest render locked.
- **Chat flow:** `openThreadByKey` loads/seeds history → `sendMsg` → `callPsyche()`
  POSTs to `/api/chat` with `SYSTEM(name, focus)` (a template-string system prompt) and
  the message history. Reply rendered as a `psyche` bubble. History saved to localStorage.
- **System prompt:** built by `SYSTEM(n,f)` in the inline script — defines the persona,
  the suffering-engine teaching, "say less ask more" manner, cross-conversation memory,
  and a non-therapist / crisis-referral safety clause. Keep `api/chat.js`, the
  `index.html` SYSTEM, and `voice.html` SYSTEM consistent when editing the persona.
- **Reflection:** image/word tiles → `reflToChat()` seeds a chat message from the
  selections.

## Conventions & style

- Single-file, dependency-light, no build tooling. Vanilla JS, inline `onclick`
  handlers, terse function names (`go`, `acc`, `drawer`, `autscale`). Match this style.
- Visual language: taupe/cream `#eeeae4` background, indigo `#19305a` accent, ink text;
  Cinzel for uppercase headings, italic Cormorant for body/voice. Quiet, contemplative,
  unhurried tone in both UI copy and the AI persona.
- API keys live only in Vercel env vars, never in client code — preserve this. Any new
  provider call goes through a serverless function in `api/`.
- Prices shown ($12/mo, $/month) are placeholders ("placeholder price").

## Landing page v2 — locked decisions (2026-08-21)

Source of truth: `design/landing-handoff/` (Claude Design bundle + `claude-code-handoff-landing-v2-FULL.md`).
Built as `landing-v2.html` — a **reference file for review**, desktop-only (>=1024px).
The live landing page is untouched until this is approved.

- **Single CTA:** "Download free", fixed top-right, exactly 54px tall, indigo gradient
  `#3a5fce -> #1d3891 -> #132a6b`. The page's only button-styled action. Hidden below 768px.
- **Ask box is a download router, not chat.** No API call on the landing page, ever.
  On submit it stores the question in `localStorage` under `psyche_q` and shows one line on a
  hairline rule: "Psyche is ready to answer this properly — in the app, free to download.
  Your question will be waiting." + a "Download free" text link. No pending/"Listening" state.
  The README's `askPsyche()` live-AI section is superseded and dead.
- **Founders band is preview only:** heading "Founding Members Wanted", three stats
  (First / Real / Zero), no button, no modal.
- **Band 2 heading:** "Earn real money".
- **Sidebar "How you earn"** (5 rows, copy per README): Real money / Your own link /
  Content made for you / No selling / Fully automated payments.
- **No income figures or percentages anywhere on the landing page.** ("1,000 founding places"
  stands — a scarcity count, not an earnings claim.)
- **Hero is 85vh** so the avatar card tops break the fold; play discs sit at `top:30%` of cards.
- Where the bundle's README and `Psyche Landing v1.dc.html` disagree, **the .dc.html wins**
  (it is what was visually approved). Notably: send button `#6f6c66`, wordmark weight 700, and
  the body/UI font stack leads with **Poiret One**, not Jost — Jost is used only by the CTA and
  the two sidebar section headings.

Parked, not this session: byte-for-byte overwrite of the live landing page; mobile build
(drawer nav, stacked hero, bottom download bar); download routing + auth flow; voice glyph
wiring; picking up `psyche_q` inside the app.

## Planned next steps (NOT yet built — understand, don't implement unprompted)

1. **Supabase** — auth, usage limits (the "15 minutes free, no email" free tier needs
   enforcement), and feedback logging.
2. **Paddle** — subscription billing for the $12/mo plan.
3. **5 new designed pages** not yet in the repo: auth, pricing, account, privacy, terms.
4. **Voice** — graduate `voice.html` from parked prototype into the product (chat has a
   disabled 🎙 "voice — coming soon" button ready for it).

## Notes / open questions

- The user described "per-message feedback" as a current feature, but the committed
  `index.html` has **no feedback UI** (no thumbs/rating markup or handlers found). Either
  it's planned (ties to Supabase feedback logging) or lives in an uncommitted version —
  confirm before assuming it exists.
- No automated tests or linting. Verification is manual / via Vercel preview deploys.
