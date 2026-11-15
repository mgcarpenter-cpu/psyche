// Vercel serverless function — the gift link: /g/<id> (vercel.json rewrites it to /api/g?id=<id>).
// Sends gift.html with the link-preview tags filled in for this gift, so a pasted link in a text, WhatsApp,
// Messenger, Instagram or Facebook shows the card (api/gift-image.js) and "[Name] has given you a free month of Sussuri".
// A link to a gift that no longer exists goes to the front page.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getGift, cardWords, esc, selfBase } from "./_gifts.js";

export const config = { maxDuration: 15 };

const SAMPLES = {   // preview links, nothing saved: /g/preview-know, /g/preview-med, /g/preview-card
  "preview-know": { id: "preview-know", kind: "know", from_name: "Mark", message: "This shows you how your mind works. It\u2019s quick, it\u2019s fun, and it got me thinking. Have a go." },
  "preview-med": { id: "preview-med", kind: "med", meditation: "fall-asleep", from_name: "Mark", message: "This one helps me switch off at night. Have a listen." },
  "preview-card": { id: "preview-card", kind: "card", from_name: "Mark", message: "A calm mind sees clearly. I\u2019ve been using Sussuri to find mine. Try it with me, you get a month free." }
};

let PAGE = null;
export default async function handler(req, res) {
  const id = String((req.query && req.query.id) || "");
  const g = SAMPLES[id] || await getGift(id);
  if (!g) { res.statusCode = 302; res.setHeader("Location", "/"); return res.end(); }
  if (!PAGE) PAGE = readFileSync(join(process.cwd(), "gift.html"), "utf8");

  const w = cardWords(g), base = selfBase(req);
  const title = `${g.from_name} has given you a free month of Sussuri`;
  const desc = g.message ? `\u201c${g.message}\u201d` : w.gift;
  const img = `${base}/api/gift-image?id=${encodeURIComponent(g.id)}`;
  const meta = [
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Sussuri">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:image" content="${esc(img)}">`,
    `<meta property="og:image:type" content="image/png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="683">`,
    `<meta property="og:image:alt" content="${esc(`A gift from ${g.from_name}: ${w.gift}`)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="description" content="${esc(desc)}">`,
    `<script>window.GIFT=${JSON.stringify({ id: g.id, kind: g.kind, meditation: g.meditation || null, from: g.from_name, message: g.message || "" }).replace(/</g, "\\u003c")};</script>`
  ].join("\n");
  const html = PAGE.replace("<!--GIFT_META-->", meta).replace("<title>A gift for you · Sussuri</title>", `<title>${esc(title)}</title>`);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");
  return res.status(200).send(html);
}
