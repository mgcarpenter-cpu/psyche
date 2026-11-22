// Vercel serverless function — the gift link: /g/<id> (vercel.json rewrites it to /api/g?id=<id>).
// Sends gift.html with the link-preview tags filled in for this gift, so a pasted link in a text, WhatsApp,
// Messenger, Instagram or Facebook shows the wide card (api/gift-image.js) and "[Name] gave you a free month of Sussuri".
// A gift older than 7 days still opens, and the page says it has run out. A gift that doesn't exist goes to the front page.
// Preview links, nothing saved: /g/preview-card and /g/preview-old (run out); add ?from=<name> to try a name.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getGift, sampleGift, giftName, expired, esc, selfBase } from "./_gifts.js";

export const config = { maxDuration: 15 };

let PAGE = null;
export default async function handler(req, res) {
  const q = req.query || {};
  const id = String(q.id || "");
  const g = sampleGift(id, q.from) || await getGift(id);
  if (!g) { res.statusCode = 302; res.setHeader("Location", "/"); return res.end(); }
  if (!PAGE) PAGE = readFileSync(join(process.cwd(), "gift.html"), "utf8");

  const name = giftName(g), base = selfBase(req);
  const title = `${name} gave you a free month of Sussuri`;
  const desc = "Life coaching, in your pocket.";
  const img = `${base}/api/gift-image?id=${encodeURIComponent(g.id)}${g.sample ? `&from=${encodeURIComponent(name)}` : ""}&v=2`;
  const meta = [
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Sussuri">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:image" content="${esc(img)}">`,
    `<meta property="og:image:type" content="image/png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(`Your friend ${name} gave you a free month of Sussuri, worth $39.`)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="description" content="${esc(desc)}">`,
    `<script>window.GIFT=${JSON.stringify({ id: g.id, from: name, photo: g.photo || null, expired: expired(g) }).replace(/</g, "\\u003c")};</script>`
  ].join("\n");
  const html = PAGE.replace("<!--GIFT_META-->", meta).replace("<title>A gift for you · Sussuri</title>", `<title>${esc(title)}</title>`);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");
  return res.status(200).send(html);
}
