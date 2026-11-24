// Vercel serverless function — the link-preview picture for a gift: /api/gift-image?id=<id>  (PNG, 1200 x 630)
// The wide card from design-7-give-a-gift.html (24 Nov 2026; drawn at 900 x 472), every size scaled by 4/3:
// black band with "sussuri"; the sender's circle (photo or initial), twice the old size, across the join between
// the black and the white, on the right, with a white ring; white below with the sentence (only its first line
// makes room for the circle), the reading line, the small print, and the black Claim button. A gift does not run out.
// Text is laid out by satori (fonts in /fonts); resvg turns it into a PNG. Keep it under 300 KB (WhatsApp).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { getGift, sampleGift, giftName } from "./_gifts.js";

export const config = { maxDuration: 20 };

const ROOT = process.cwd();
const F = n => join(ROOT, "fonts", n);
const K = 1200 / 900;          // design px -> picture px
const W = 1200, H = 630, RED = "#b3261e";
let FONTS = null, WIDTHS = null;
function assets() {
  if (FONTS) return;
  FONTS = [
    { name: "Jost", data: readFileSync(F("Jost-300.ttf")), weight: 300, style: "normal" },
    { name: "Jost", data: readFileSync(F("Jost-500.ttf")), weight: 500, style: "normal" },
    { name: "Poiret One", data: readFileSync(F("PoiretOne.ttf")), weight: 400, style: "normal" },
    { name: "JetBrains Mono", data: readFileSync(F("JetBrainsMono-400.ttf")), weight: 400, style: "normal" }
  ];
  WIDTHS = JSON.parse(readFileSync(F("poiret-widths.json"), "utf8"));
}

// ---- the sentence, broken into lines by hand so "free month" can sit in its red box ----
// Poiret One advance widths (em) from fonts/poiret-widths.json, plus the .03em letter spacing.
const LS = 0.02;
function emWidth(t) { let w = 0; for (const ch of t) w += (WIDTHS[ch] ?? 0.55) + LS; return w; }
function lines(name, size, maxW, firstW) {
  const words = ["Your", "friend", ...name.split(/\s+/).filter(Boolean), "gave", "you", "a", "\u0000", "of", "Sussuri,", "worth", "$39."];
  const sp = emWidth(" ") * size, out = [[]];
  let x = 0;
  for (const w of words) {
    const ww = w === "\u0000" ? (emWidth("free month") + 0.36) * size : emWidth(w) * size;
    if (out[out.length - 1].length && x + sp + ww > (out.length === 1 ? firstW : maxW)) { out.push([]); x = 0; }
    x += (out[out.length - 1].length ? sp : 0) + ww;
    out[out.length - 1].push(w);
  }
  return out;
}

const h = (type, style, children, extra) => ({ type, props: { style, children, ...(extra || {}) } });
function layout(g) {
  const name = giftName(g);
  const padX = 46 * K, padY = 30 * K, band = 132 * K;
  const textW = W - 2 * padX;
  // the sentence: 45px in the design, two lines for most names; smaller only if it would need more than three lines.
  // The first line stops short of the circle (178px in the design).
  let size = 45 * K, ls;
  while ((ls = lines(name, size, textW - 4, textW - 178 * K - 4)).length > 3 && size > 30 * K) size -= 1;
  const lh = size * 1.28;
  const sentence = ls.map(row => h("div", { display: "flex", height: lh, alignItems: "center", whiteSpace: "nowrap" },
    row.map((w, i) => w === "\u0000"
      ? h("div", { display: "flex", background: RED, color: "#fff", borderRadius: 6 * K, padding: `${0.05 * size}px ${0.18 * size}px ${0.1 * size}px`, lineHeight: 1, marginLeft: i ? emWidth(" ") * size : 0, position: "relative", top: 0.05 * size }, "free month")
      : h("div", { display: "flex", marginLeft: i ? emWidth(" ") * size : 0 }, w))));

  // the circle: 152px, a 2px white ring, and a hairline of black outside it so the ring shows on the white too
  const av = 152 * K, ring = 2 * K, edge = 1 * K;
  const inner = g.photo
    ? h("img", { width: av - 2 * ring, height: av - 2 * ring, borderRadius: av / 2, objectFit: "cover" }, undefined, { src: g.photo, width: av - 2 * ring, height: av - 2 * ring })
    : h("div", { display: "flex", fontFamily: "Poiret One", fontSize: 76 * K, lineHeight: 1, color: "#fff" }, name.charAt(0).toUpperCase());
  const circle = h("div", { display: "flex", position: "absolute", right: 46 * K - edge, top: 56 * K - edge, width: av + 2 * edge, height: av + 2 * edge, borderRadius: av, background: "#000", alignItems: "center", justifyContent: "center" }, [
    h("div", { display: "flex", width: av, height: av, borderRadius: av / 2, border: `${ring}px solid #fff`, background: "#000", alignItems: "center", justifyContent: "center", overflow: "hidden" }, [inner])
  ]);

  return h("div", { width: W, height: H, display: "flex", flexDirection: "column", position: "relative", fontFamily: "Jost", fontWeight: 300 }, [
    h("div", { display: "flex", height: band, background: "#000", padding: `0 ${padX}px`, alignItems: "center" }, [
      h("div", { display: "flex", fontFamily: "Poiret One", fontSize: 84 * K, letterSpacing: "0.05em", lineHeight: 1, color: "#fff", position: "relative", top: -9 * K }, "sussuri")
    ]),
    h("div", { display: "flex", flexDirection: "column", flexGrow: 1, background: "#fff", color: "#000", padding: `${padY}px ${padX}px` }, [
      h("div", { display: "flex", flexDirection: "column", fontFamily: "Poiret One", fontSize: size, letterSpacing: `${LS}em` }, sentence),
      h("div", { display: "flex", fontSize: 25 * K, lineHeight: 1.3, marginTop: 10 * K, color: "#000" }, "Life coaching, in your pocket. Be sure to say thanks!"),
      h("div", { display: "flex", marginTop: "auto", alignItems: "flex-end", justifyContent: "space-between" }, [
        h("div", { display: "flex", width: 440 * K, fontSize: 13.5 * K, lineHeight: 1.35, color: "#6a6a6a", wordBreak: "break-word" }, `Sussuri is an AI-powered life coach. ${name} earns from Sussuri if you become a paying member.`),
        h("div", { display: "flex", height: 56 * K, padding: `0 ${30 * K}px`, alignItems: "center", background: "#000", color: "#fff", borderRadius: 8 * K, fontWeight: 500, fontSize: 16 * K, letterSpacing: "0.2em", whiteSpace: "nowrap" }, "CLAIM MY FREE MONTH")
      ])
    ]),
    circle
  ]);
}

export async function renderPng(g) {
  assets();
  const svg = await satori(layout(g), { width: W, height: H, fonts: FONTS });
  return new Resvg(svg, { fitTo: { mode: "width", value: W }, font: { loadSystemFonts: false } }).render().asPng();
}

export default async function handler(req, res) {
  const id = String((req.query && req.query.id) || "");
  const g = sampleGift(id, req.query && req.query.from) || await getGift(id);
  if (!g) return res.status(404).send("not found");
  try {
    const png = await renderPng(g);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", g.sample ? "public, max-age=300" : "public, max-age=86400, immutable");
    return res.status(200).send(Buffer.from(png));
  } catch (e) {
    console.error("gift-image failed", e);
    return res.status(500).send("could not draw the card");
  }
}
