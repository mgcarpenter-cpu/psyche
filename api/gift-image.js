// Vercel serverless function — the link-preview picture for a gift: /api/gift-image?id=<id>  (PNG, 1200 x 683)
// The same card as gift-card.js: the front page composition with the From name, the gift and the message.
// Text is laid out by satori (fonts in /fonts); the wheel is the card's own SVG, taken from gift-card.js;
// resvg turns the whole thing into a PNG.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { getGift, cardWords } from "./_gifts.js";

export const config = { maxDuration: 20 };

const ROOT = process.cwd();
const F = n => join(ROOT, "fonts", n);
let FONTS = null, WHEEL = null, DEFS = null, WIDTHS = null;
function assets() {
  if (FONTS) return;
  FONTS = [
    { name: "Jost", data: readFileSync(F("Jost-300.ttf")), weight: 300, style: "normal" },
    { name: "Jost", data: readFileSync(F("Jost-400.ttf")), weight: 400, style: "normal" },
    { name: "Jost", data: readFileSync(F("Jost-500.ttf")), weight: 500, style: "normal" },
    { name: "Poiret One", data: readFileSync(F("PoiretOne.ttf")), weight: 400, style: "normal" }
  ];
  WIDTHS = JSON.parse(readFileSync(F("poiret-widths.json"), "utf8"));
  const js = readFileSync(join(ROOT, "gift-card.js"), "utf8");
  DEFS = JSON.parse(js.match(/var DEFS = (".*?");\n/)[1]);
  const card = JSON.parse(js.match(/var CARD = (".*?");\n/)[1]);
  WHEEL = card.slice(card.indexOf("<svg"), card.indexOf("</svg>") + 6);
}

const SAMPLES = {
  "preview-know": { kind: "know", from_name: "Mark", message: "This shows you how your mind works. It’s quick, it’s fun, and it got me thinking. Have a go." },
  "preview-med": { kind: "med", meditation: "fall-asleep", from_name: "Mark", message: "This one helps me switch off at night. Have a listen." },
  "preview-card": { kind: "card", from_name: "Mark", message: "A calm mind sees clearly. I’ve been using Sussuri to find mine. Try it with me, you get a month free." }
};

// the wheel, standing still with one part lit (as gift-card.js light(), rest 135)
const LIT = { know: 6, med: 1, card: 4 };
function wheel(kind) {
  const k = LIT[kind] ?? 4, mod = a => ((a % 360) + 360) % 360;
  let s = WHEEL.replace(/<g class="rotO">/g, `<g class="rotO" transform="rotate(${k * 45 + 135})">`)
               .replace(/<g class="rotI">/g, `<g class="rotI" transform="rotate(${135 - k * 45})">`);
  s = s.replace(/<g class="seg" data-i="(\d)">([\s\S]*?)(?=<g class="seg" data-i="|<\/g><\/g><\/g>)/g, (m, i, body) => {
    i = +i; const th = mod(135 + 45 * (k - i)), top = th <= 90 || th >= 270, on = i === k;
    body = body.replace(/<path class="hit"[^>]*\/>/, "")
      .replace(/<path class="lit"/, `<path fill="#f4f4f4" opacity="${on ? 1 : 0}"`)
      .replace(/<text class="lbl up"/, `<text font-family="Poiret One" font-size="${on ? 25 : 22}" letter-spacing="4" fill="${on ? "#000" : "#f4f4f4"}" opacity="${top ? 1 : 0}"`)
      .replace(/<text class="lbl dn"/, `<text font-family="Poiret One" font-size="${on ? 25 : 22}" letter-spacing="4" fill="${on ? "#000" : "#f4f4f4"}" opacity="${top ? 0 : 1}"`);
    return `<g data-i="${i}">${body}`;
  });
  // the card's CSS, written onto the elements (class names stay; resvg reads these attributes reliably)
  s = s.replace(/class="ln f"/g, 'fill="none" stroke="#f4f4f4" stroke-width=".7"')
       .replace(/class="ln"/g, 'fill="none" stroke="#f4f4f4" stroke-width="1"')
       .replace(/<g class="dots">/g, '<g fill="#f4f4f4">')
       .replace(/class="dial dup"/g, 'fill="none" stroke="#8a8a8a" stroke-width=".8"')
       .replace(/class="dial dlow"/g, 'fill="none" stroke="#777" stroke-width=".8"')
       .replace(/class="reg"/g, 'stroke-width=".7"');
  s = s.replace(/<svg class="wheel"[^>]*>/, `<svg x="18.6" y="97.4" width="625.2" height="625.2" viewBox="-16 -16 672 672" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${DEFS.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "")}`);
  return s;
}

// "From [name]" in Poiret One at 58px, smaller for a long name so it stays on one line (box width 559px)
function nameSize(text) {
  let w = 0; for (const ch of text) w += (WIDTHS[ch] ?? .55) + .06;
  return Math.max(24, Math.min(58, Math.floor(559 / w)));
}

const h = (type, style, children) => ({ type, props: { style, children } });
function layout(g) {
  const w = cardWords(g), from = g.from_name || "a friend", name = `From ${from}`;
  const abs = (o) => ({ position: "absolute", display: "flex", ...o });
  const corner = (o) => abs({ width: 16, height: 16, borderColor: "#000", borderStyle: "solid", ...o });
  return h("div", { width: 1440, height: 820, display: "flex", position: "relative", fontFamily: "Jost", fontWeight: 300, fontSize: 17, color: "#000" }, [
    h("div", abs({ left: 40, top: -5, fontFamily: "Poiret One", fontSize: 328, lineHeight: 1, letterSpacing: 16.4, color: "#f4f4f4", whiteSpace: "nowrap" }), "sussuri"),
    h("div", abs({ right: 51.5, top: 72, width: 350, background: "#b3261e", color: "#fff", borderRadius: 8, padding: "22px 26px", flexDirection: "column" }), [
      h("div", { fontWeight: 500, fontSize: 35, lineHeight: 1.1 }, "One whole month"),
      h("div", { fontFamily: "Poiret One", fontSize: 124, lineHeight: .95, letterSpacing: 5, margin: "2px 0 12px -4px" }, "free"),
      h("div", { fontWeight: 400, fontSize: 20, lineHeight: 1.3 }, "Calm, clarity and the training to reach your goals.")
    ]),
    h("div", abs({ left: 520, top: 556.4, width: 237.3, height: 1, background: "#000" }), ""),
    h("div", abs({ left: 757.3, top: 428, width: 631.2, height: 368, padding: "22px 36px 24px", flexDirection: "column" }), [
      h("div", corner({ left: 0, top: 0, borderWidth: "1px 0 0 1px", borderTopLeftRadius: 7 }), ""),
      h("div", corner({ right: 0, top: 0, borderWidth: "1px 1px 0 0", borderTopRightRadius: 7 }), ""),
      h("div", corner({ left: 0, bottom: 0, borderWidth: "0 0 1px 1px", borderBottomLeftRadius: 7 }), ""),
      h("div", corner({ right: 0, bottom: 0, borderWidth: "0 1px 1px 0", borderBottomRightRadius: 7 }), ""),
      h("div", { display: "flex", justifyContent: "space-between", fontWeight: 400, fontSize: 12, lineHeight: 1, height: 12, letterSpacing: 1.1, textTransform: "uppercase" }, [
        h("span", {}, "A gift for you"), h("span", {}, "Written and developed by humans, powered by AI")
      ]),
      h("div", { display: "flex", alignItems: "flex-end", marginTop: 6, height: 60, fontFamily: "Poiret One", fontSize: nameSize(name), lineHeight: 1, letterSpacing: "0.06em", whiteSpace: "nowrap" }, name),
      h("div", { display: "block", marginTop: 8, fontSize: 24, lineHeight: "30px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, w.gift),
      h("div", { display: "block", fontSize: 18.5, lineHeight: "24px", color: "#222", fontWeight: 400, lineClamp: 2 }, w.about),
      g.message ? h("div", { display: "block", marginTop: 8, fontSize: 20, lineHeight: "26px", fontWeight: 400, lineClamp: 3 }, `“${g.message}”`) : h("div", {}, ""),
      h("div", abs({ left: 36, bottom: 26, width: 300, minHeight: 46, alignItems: "center", fontSize: 13, lineHeight: 1.35, color: "#6a6a6a" }), `${from} earns from Sussuri if you become a paying member.`),
      h("div", abs({ right: 36, bottom: 26, height: 48, borderRadius: 8, padding: "0 24px", alignItems: "center", background: "#000", color: "#fff", fontWeight: 500, fontSize: 14.5, letterSpacing: "0.2em", textTransform: "uppercase" }), w.cta)
    ])
  ]);
}

export async function renderPng(g) {
  assets();
  const text = await satori(layout(g), { width: 1440, height: 820, fonts: FONTS });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1440" height="820" viewBox="0 0 1440 820">` +
    `<rect width="1440" height="410" fill="#000"/><rect y="410" width="1440" height="410" fill="#fff"/>` +
    wheel(g.kind) + text.replace(/^<svg[^>]*>/, `<svg x="0" y="0" width="1440" height="820" viewBox="0 0 1440 820">`) + `</svg>`;
  const r = new Resvg(svg, { fitTo: { mode: "width", value: 1200 }, font: { fontFiles: [F("PoiretOne.ttf"), F("Jost-400.ttf")], loadSystemFonts: false, defaultFontFamily: "Poiret One" } });
  return r.render().asPng();
}

export default async function handler(req, res) {
  const id = String((req.query && req.query.id) || "");
  const g = SAMPLES[id] || await getGift(id);
  if (!g) return res.status(404).send("not found");
  try {
    const png = await renderPng(g);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    return res.status(200).send(Buffer.from(png));
  } catch (e) {
    console.error("gift-image failed", e);
    return res.status(500).send("could not draw the card");
  }
}
