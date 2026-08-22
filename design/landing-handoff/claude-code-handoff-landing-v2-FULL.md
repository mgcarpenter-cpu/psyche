# PSYCHE landing page v2 — Claude Code handoff (desktop build)

## Attach to the session
1. The Claude Design bundle: `design_handoff_psyche_landing/` (README.md + `Psyche Landing v1.dc.html` + support.js from `Awaiting_answers_to_proceed_6.zip`)
2. This file

## The task
Build a single self-contained static HTML file `landing-v2.html` as a REFERENCE FILE for my review. Do not touch the live index, do not deploy, do not overwrite anything until I approve it in the browser. No frameworks — clean HTML/CSS/JS.

The bundle's README.md is the spec — pixel values, tokens, layout, copy, and interactions are all in there and in the `.dc.html` logic class. Follow it exactly, with the overrides below.

## OVERRIDES — these beat the README where they conflict

### 1. Ask box: NO live AI (this supersedes the README's askPsyche section)
The README describes the ask box calling a Claude endpoint and rendering a reply ("That's one pearl…"). That mechanic is dead. Build instead:
- No API call, no chat, no reply from Psyche — ever, on this page.
- Placeholder: "Ask Psyche anything…"
- On submit (Enter or send button): store the typed question in localStorage under key `psyche_q`, then show a single line below the box on a hairline rule:
  "Psyche is ready to answer this properly — in the app, free to download. Your question will be waiting."
  followed by a "Download free" text link (same #download target as the CTA).
- One submit only; further submits re-show the same line. No "Listening" state, no pending state — nothing is being waited for.

### 2. Scope: desktop only
Target ≥1024px. Do not build mobile layouts this session — mobile (drawer nav, stacked hero, bottom download bar) is a separate later task. The README's "hide CTA below 768px" media query is fine to include.

### 3. CTA destination
The floating "DOWNLOAD FREE" button links to `#download` for now. Routing (per-platform download/install) is a later task.

### 4. Videos
The four avatar mp4s (owl, wolf, stag, panda) are not in the bundle. Locate them in the repo (they are deployed with the existing site); wire them per the README's card map. If you cannot find them, use the placeholder-slot treatment on all six cards and tell me — do not hunt outside the repo or guess filenames.

## Hard rules
- No figures or percentages anywhere in earn/founder copy (Fair Trading).
- No pop-ups, modals, timers, or scroll triggers — the README confirms this; do not reintroduce anything from older page versions.
- The floating DOWNLOAD FREE is the page's only button-styled action.
- Discuss anything ambiguous before building. One pass, then my review.

## After I approve
(not this session — listed so you know what's parked)
- Byte-for-byte overwrite of the live landing page
- Mobile build
- Download routing + auth flow
- Ask-box question pickup inside the app (`psyche_q`)

## Update CLAUDe.md now with these locked decisions
- Single CTA: "Download free", fixed top-right, 54px, indigo gradient (#3a5fce→#1d3891→#132a6b), page's only button
- Ask box = download router storing `psyche_q`; NOT live chat; no API calls on the landing page
- Founders band: preview only — heading "Founding Members Wanted", three stats (First / Real / Zero), no button, no modal
- Band 2 heading: "Earn real money"
- Sidebar "How you earn": Real money / Your own link / Content made for you / No selling / Fully automated payments (copy as per README)
- No income figures or percentages anywhere on the landing page
- Hero 85vh so avatar card tops break the fold; play discs at top 30% of cards
