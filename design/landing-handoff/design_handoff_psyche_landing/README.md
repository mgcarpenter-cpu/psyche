# Handoff: Psyche Landing Page

## Overview
Marketing landing page for Psyche — an AI wisdom coach for mental and spiritual wellbeing, presented as a catalogue of animal avatars speaking short "pearls" of counsel. The page sells two things: try the coach right now (a live ask box), and become one of 1,000 founding members who earn a commission by sharing.

## About the Design Files
The files in this bundle are **design references created in HTML** — a prototype showing intended look and behavior, NOT production code to copy directly. The task is to **recreate this design in the target codebase's environment** (React, Vue, native, etc.) using its established patterns — or, if no codebase exists yet, choose an appropriate framework and implement it there.

`Psyche Landing v1.dc.html` is the canonical reference. It is written in a proprietary streaming-component format: the markup lives between `<x-dc>` tags with `{{ hole }}` bindings, and all styles are computed in the `Component` class at the bottom of the file (renderVals() returns style strings). Read the logic class for exact values; ignore `support.js` (prototype runtime, not part of the design).

## Fidelity
**High-fidelity.** Colors, typography, spacing and interactions are final. Recreate pixel-perfectly.

## Layout (single page, two columns)
- **Left: white sidebar** — `clamp(360px, 30vw, 540px)` wide, `position: sticky; top: 0; height: 100vh`, internal scroll with a thin 6px scrollbar. Background #ffffff, ink #111014. Padding `clamp(24px,4vh,56px) clamp(34px,2.8vw,52px)`.
- **Right: black main column** — flex-grows, background #000000 (page base #050507), three stacked sections.
- **Floating CTA** — fixed top-right (24px/24px, z-index 80): "DOWNLOAD FREE", exactly 54px tall, padding 0 40px, NO scaling with viewport, square corners, white 16.5px Jost 500 uppercase .18em, gradient `linear-gradient(180deg,#3a5fce 0%,#1d3891 55%,#132a6b 100%)`, shadow `0 10px 28px rgba(0,0,0,.45)`. Hidden below 768px viewport width (CSS media query, must respond to live resize).

## Sidebar contents (top to bottom)
1. **PSYCHE** wordmark — Jost 500, `clamp(22px,3.2vh,40px)`, letter-spacing .09em.
2. **Log in** row (person icon) and **Join & download** row (download-tray icon). Row padding `clamp(5px,.85vh,16px) 0`.
3. Nav: **Questions / FAQ** (question-circle icon).
4. **HOW IT WORKS** — Jost 300 uppercase `clamp(16px,2vh,26px)`, .14em tracking. Below it 8 expandable rows (native `<details>`), each: icon (28px stroke SVG), title, and a chevron that rotates 45° when open. Titles/labels all `clamp(17px,2.3vh,28px)` Jost 400; drop-down lines same size, ink #111014, indented under the icon.
   Steps: What it is / Speak your mind / Guided meditations / Teachings / Trace the feeling / Find your way / Bring anything / A path to follow (each with 2 bullet lines — copy is in the file's `features` array).
5. **HOW YOU EARN** — same pattern, 5 rows:
   - Real money — "Paid on everyone who joins through you" / "Month after month, for as long as they stay"
   - Your own link — "psyche.ai/you — everyone through it is credited to you" / "Share it anywhere, no following needed"
   - Content made for you — "Ready to post, automated" / "One tap from your phone"
   - No selling — "Pass on what helped you" / "No pitching, no cold outreach"
   - Fully automated payments — "Direct to your account" / "Paid via Paddle"
6. **Footer group**, pushed to the bottom (margin-top auto): Private & secure (shield), Terms & conditions (circle-slash), Need urgent help (mic), then an **account row**: 28px outlined circle holding the user's initial ("G") + label ("Guest"; shows the signed-in name/initial when authenticated).

No rules/dividers anywhere in the sidebar — grouping is by spacing only.

## Black sections (main column)
All three share: bottom fade `linear-gradient(0deg,#3e3a34 0%,#2a2723 28%,#151413 58%,#000 100%)` rendered as a 300px-tall bottom-anchored background band (hero uses `min(300px,26%)`); heading style Poiret One 400, `clamp(56px,6.8vw,116px)`; horizontal shell max-width 1180px (fluid gutter `clamp(24px, 4vw, 96px)`-ish — see `fluidGutter` in file).

### 1. Hero — "Find clarity"
- min-height **85vh**, content vertically centred, text-align center.
- H1 "Find clarity", then kicker "YOUR PERSONAL AI WISDOM COACH" (Poiret One, `clamp(16px,1.9vw,28px)`... see `kicker`), 28px gaps.
- **Ask box** ~232px below kicker, width min(100%, 820px), height `clamp(72px,6vw,112px)`, solid #ffffff, square corners, border 1px #c9c5bd, padding-left 30px, right inset `clamp(16px,1.4vw,26px)`.
  - Input: Jost, `clamp(24px,2vw,34px)`, ink #111014, placeholder "Ask Psyche anything…" at rgba(17,16,20,.5).
  - Voice glyph: 5 vertical bars (widths in file), dark ink, transparent ground, `clamp(34px,3vw,48px)` wide.
  - Send: dark square #111014 `clamp(46px,3.8vw,64px)`, white up-arrow, 4–8px gap from voice glyph.
  - Behavior: Enter or click calls the AI (prototype uses a Claude endpoint with the exact system prompt in `askPsyche()`); reply renders below on a hairline rule, label "PSYCHE", then "That's one pearl. Membership opens the rest." Markdown must be stripped from replies.
- Hero at 85vh means the top of the next section's cards peeks above the fold.

### 2. Earn real money
- min-height max(43vh,612px). Heading "Earn real money", sub "Share a pearl. Earn from everyone who joins through you." (Jost, ~clamp(17,1.4vw,23px), muted cream).
- **Avatar cards**: 6 across on `repeat(auto-fit,minmax(min(150px,100%),1fr))`, gap ~24px, 88px below heading. Card = 7:10 aspect frame, 1px border rgba(237,230,220,.14), video object-fit cover, bottom scrim `linear-gradient(to top,rgba(5,5,7,.5),transparent 40%)`.
  - Rank numeral top-left (Poiret One ~40px, cream), duration top-right (Jost small).
  - **Play mark centred at top:30%** — translucent cream disc (clamp(46px,4vw,68px)) with dark triangle.
  - Caption BELOW the frame, white: meta line "LION · COURAGE" etc, Jost uppercase `fl(14→18px)` .16em.
  - Click toggles sound: unmutes+plays that video, mutes all others, hides its play mark while sounding.
  - Videos: owl-v2 2.mp4, wolf-v2.mp4, stag-v2.mp4, panda-v2.mp4 (in /uploads; two Lion cards have no clip yet — show a centred placeholder label at 46% height).
- Cards/meta: Meeting the storm (Lion·Courage 2:14), The quiet after (Owl·Stillness 3:02), Walking alone well (Wolf·Solitude 1:47), The tool and the hand (Stag·Patience 2:38), Share what moved you (Panda·Gentleness 4:05), Where fear points (Lion·Courage 2:51).

### 3. Founding Members Wanted
- min-height max(22vh,306px) — deliberately half the earn band. Same fade.
- Heading "Founding Members Wanted" + note "Get in first. Earn from everyone who follows." (Jost, max-width 34ch).
- Three cards on `repeat(3,minmax(150px,1fr))`: big word (Poiret One `fl(30→46px)`, rgba(237,230,220,.4)) over a line (Jost `fl(15→20px)`, rgba(237,230,220,.82)), each on a top hairline rgba(237,230,220,.22):
  - **First** — 1,000 founding places. Then the price rises.
  - **Real** — Money, month after month, fully automated.
  - **Zero** — Selling. The content is made for you.
- No CTA button in this section (the floating Download free is the page's only button).

## Interactions & Behavior
- Sidebar `<details>` accordions: chevron rotates -135°/45° on open; no animation required beyond that.
- Ask box: see hero section. Disable double-submits while a reply is pending ("Listening" label state).
- Avatar sound toggle: one video sounding at a time; all autoplay muted+looping on load.
- Floating CTA: media-query hidden <768px; must track live resize.
- No pop-ups/modals — removed by design.

## State
- `asking` (bool), `reply` (string) for the ask box; `playing` (rank | null) for avatar sound; account name for the sidebar avatar row.

## Design Tokens
- Black page base: #050507 (sections #000000)
- Cream (text on black): #ede6dc; muted cream rgba(237,230,220,.6–.82); hairlines rgba(237,230,220,.14–.22)
- White panel: #ffffff; ink #111014; muted ink rgba(17,16,20,.5)
- CTA blue gradient: #3a5fce → #1d3891 → #132a6b
- Fade greys: #3e3a34 / #2a2723 / #151413
- Fonts: **Poiret One** (display: headings, rank numerals, founders words) and **Jost** 300/400/500 (all UI/labels/body). Google Fonts.
- Global type multiplier 1.3 is already baked into the fl() clamp values in the file.
- Square corners everywhere except the account initial circle and play disc.

## Assets
- /uploads/*.mp4 — four avatar videos (client-supplied)
- All icons are inline stroke SVGs defined in the `I` map in the logic class (stroke-width 1.1–1.5, currentColor) — copy the paths verbatim.

## Files
- `Psyche Landing v1.dc.html` — the full design (markup + all computed styles + behavior)
- `uploads/` videos are NOT included in this bundle; request them from the client.
