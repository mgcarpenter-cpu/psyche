// Vercel serverless function — the gift link: /g/<id> (vercel.json rewrites it to /api/g?id=<id>).
// The friend lands on the front page, with a small card from their friend on it (24 Nov 2026). This sends
// front-v2.html with the link-preview tags filled in for this gift, so a pasted link in a text, WhatsApp,
// Messenger, Instagram or Facebook shows the wide card (api/gift-image.js) and "[Name] gave you a free month of Sussuri",
// and with window.GIFT set, which the front page reads to draw the card and the claim button.
// A gift does not run out. A gift that doesn't exist goes to the plain front page.
// Preview link, nothing saved: /g/preview-card; add ?from=<name> to try a name.
//
// NEEDS front-v2.html in this function's files (vercel.json -> functions -> "api/g.js" -> includeFiles).
// Until it is there, the page can't be read here, and the link forwards to /front-v2?gift=<id> instead:
// the friend sees the same page, but a pasted link shows no picture.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getGift, sampleGift, giftName, esc, selfBase } from "./_gifts.js";

export const config = { maxDuration: 15 };

let PAGE = null;
export default async function handler(req, res) {
  const q = req.query || {};
  const id = String(q.id || "");
  const g = sampleGift(id, q.from) || await getGift(id);
  if (!g) { res.statusCode = 302; res.setHeader("Location", "/"); return res.end(); }
  const name = giftName(g);
  if (PAGE === null) { try { PAGE = readFileSync(join(process.cwd(), "front-v2.html"), "utf8"); } catch (e) { PAGE = ""; } }
  if (!PAGE) {
    res.statusCode = 302;
    res.setHeader("Location", `/front-v2?gift=${encodeURIComponent(g.id)}${g.sample && q.from ? `&from=${encodeURIComponent(name)}` : ""}`);
    return res.end();
  }

  const base = selfBase(req);
  const title = `${name} gave you a free month of Sussuri`;
  const desc = "Life coaching, in your pocket.";
  const img = `${base}/api/gift-image?id=${encodeURIComponent(g.id)}${g.sample ? `&from=${encodeURIComponent(name)}` : ""}&v=3`;
  const meta = [
    `<base href="/">`,                                   // the page's own files (site.css, site-header.js) sit at the top of the site
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
    `<script>window.GIFT=${JSON.stringify({ id: g.id, from: name, photo: g.photo || null }).replace(/</g, "\\u003c")};</script>`
  ].join("\n");
  const html = PAGE.replace("<head>", "<head>\n" + meta).replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");
  return res.status(200).send(html);
}
