/* ==========================================================================
   Sussuri: the guided meditation sessions, and the one cover every session gets.
   Used by meditations.html (Your path) and meditation-library.html (Affiliate program).

   TO ADD A SESSION: add one entry to the list below (title, card, category, length, about, audio).
   "card" is the one sentence on the card: what the meditation helps with, a full sentence, without the length.
   Its cover is built from its title, so nothing else is needed.
   The audio lives on sussuri.com (the files are large).
   ========================================================================== */
window.SUSSURI_SESSIONS = [
  {
    "slug": "calm-anxiety-now",
    "card": "Settle anxious feelings and come back to calm.",
    "title": "Calm Anxiety Now",
    "label": "Guided meditation",
    "length": "20 mins",
    "about": "A gentle twenty-minute guided meditation to settle anxious feeling and rest in calm. You'll be guided down into a warm meadow at the edge of an old wood, where calm and peace wash through every part of you.",
    "audio": "https://www.sussuri.com/media/calm-anxiety-now-20.mp3",
    "extra_credit": "",
    "category": "Calm"
  },
  {
    "slug": "fall-asleep",
    "card": "Let your mind go quiet and drift off to sleep.",
    "title": "Fall Asleep",
    "label": "Guided meditation",
    "length": "20 mins",
    "about": "A gentle twenty-minute guided meditation for sleep. Let your mind drift into a quiet meadow at night, beside a softly bubbling stream under the moon and stars, and fall asleep within the dream.",
    "audio": "https://www.sussuri.com/media/fall-asleep-20.mp3",
    "extra_credit": "",
    "category": "Sleep"
  },
  {
    "slug": "let-go-of-the-day",
    "card": "Put down what you have been carrying and rest at the end of the day.",
    "title": "Let Go of the Day",
    "label": "Guided meditation",
    "length": "30 mins",
    "about": "A gentle thirty-minute guided meditation for the end of the day. Walk a quiet river path at dusk, letting each thing you've been carrying drift away on a golden leaf, then rest beneath the evening sky.",
    "audio": "https://www.sussuri.com/media/let-go-of-the-day-30.mp3",
    "extra_credit": "",
    "category": "Sleep"
  },
  {
    "slug": "quiet-an-overthinking-mind",
    "card": "Slow a busy, overthinking mind until it comes to rest.",
    "title": "Quiet an Overthinking Mind",
    "label": "Guided meditation",
    "length": "35 mins",
    "about": "A gentle thirty-five-minute guided meditation for a busy, overthinking mind. Walk a slow path through an old wood, letting your steps and your thoughts slow together, hear the single clear note of a bellbird, then rest beside a small, quiet pool.",
    "audio": "https://www.sussuri.com/media/quiet-an-overthinking-mind-35.mp3",
    "extra_credit": "Bird song: Department of Conservation (NZ)",
    "category": "Calm"
  },
  {
    "slug": "settle-the-nervous-system",
    "card": "Settle your whole body until calm feels like home.",
    "title": "Settle the Nervous System",
    "label": "Guided meditation",
    "length": "35 mins",
    "about": "A gentle thirty-five-minute guided meditation to settle your whole body. Walk slowly down a warm green hillside into a sheltered hollow, let warm sunlight move through you from head to feet, and rest on the steady earth until calm feels like home.",
    "audio": "https://www.sussuri.com/media/settle-the-nervous-system-35.mp3",
    "extra_credit": "",
    "category": "Calm"
  },
  {
    "slug": "grief",
    "card": "Find some comfort when you are missing someone you love.",
    "title": "Grief",
    "label": "Guided meditation",
    "length": "38 mins",
    "about": "A gentle thirty-eight-minute guided meditation for when you are missing someone you love. Walk a quiet garden path to a great old tree, let warm morning light soften your body, and allow the love you share to rest around your heart, as steady as the tree itself.",
    "audio": "https://www.sussuri.com/media/grief-38.mp3",
    "extra_credit": "",
    "category": "Grief"
  },
  {
    "slug": "confidence-now",
    "card": "Build a steady, quiet confidence you can carry into your day.",
    "title": "Confidence Now",
    "label": "Guided meditation",
    "length": "42 mins",
    "about": "A gentle forty-two-minute guided meditation for steady, quiet confidence. Walk a warm mountain path to a wide flat rock, let the morning sun soften your body, and allow yourself to become as solid and settled as the mountain itself, carrying that steadiness into every part of your day.",
    "audio": "https://www.sussuri.com/media/confidence-now-42.mp3",
    "extra_credit": "",
    "category": "Confidence"
  },
  {
    "slug": "stop-beating-yourself-up",
    "card": "Soften your inner voice and be kinder to yourself.",
    "title": "Stop Beating Yourself Up",
    "label": "Guided meditation",
    "length": "41 mins",
    "about": "A gentle forty-one-minute guided meditation for being kinder to yourself. Walk a warm sandy path down to a quiet bay, let the afternoon sun soften your body, and allow your inner voice to slow and speak to you the way you would speak to a small puppy, with patience, warmth and kindness.",
    "audio": "https://www.sussuri.com/media/stop-beating-yourself-up-41.mp3",
    "extra_credit": "",
    "category": "Confidence"
  },
  {
    "slug": "focus-before-work",
    "card": "Gather your mind before work and begin clear and focused.",
    "title": "Focus Before Work",
    "label": "Guided meditation",
    "length": "20 mins",
    "about": "A twenty-minute guided meditation to gather your mind before work. Settle your body, rest your attention on the simple coming and going of the breath, and let each return grow steadier, so you begin your day clear, calm and focused.",
    "audio": "https://www.sussuri.com/media/focus-before-work-20.mp3",
    "extra_credit": "",
    "category": "Focus"
  }
];

// category buttons, in this order (a new category on a session is added after these)
window.SUSSURI_CATEGORIES = ['Sleep','Calm','Confidence','Focus','Grief'];

(function () {
  function esc(s){ return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  var MANDALA = 'images/meditation-mandala.png';   // cut from the Fall Asleep cover, as one image
  // the cover, from the title alone (styles: meditation-cover.css)
  window.sussuriCover = function (it) {
    return '<span class="cover"><span class="c-top"><span class="c-mark">sussuri</span><span class="c-pres">presents</span></span>' +
      '<span class="c-title">' + esc(it.title) + '</span><img class="c-mandala" alt="" src="' + MANDALA + '"></span>';
  };
  // card label: CATEGORY · NN MINS
  window.sussuriCardTag = function (it) { return [it.category, it.length].filter(Boolean).join(' \u00b7 '); };
  // the card shows the session's own one-sentence line ("card"): what it helps with, never cut off
  window.sussuriCardLine = function (it) { return it.card || window.sussuriShort(it.about); };
  window.sussuriShort = function (t) { var m = /^(.*?[.!?])(\s|$)/.exec(String(t||'')); return m ? m[1] : String(t||''); };

  // The same cover as a picture file (1920 x 1080), for sharing. Same layout as the cover on the page.
  window.sussuriCoverImage = function (it) {
    var W = 1920, H = 1080, u = W / 100, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var x = cv.getContext('2d');
    function spaced(text, cx, y, font, ls, color) {   // centred text with letter spacing
      x.font = font; x.fillStyle = color; x.textBaseline = 'alphabetic'; x.textAlign = 'left';
      var w = 0, i; for (i = 0; i < text.length; i++) w += x.measureText(text[i]).width + ls; w -= ls;
      var px = cx - w / 2; for (i = 0; i < text.length; i++) { x.fillText(text[i], px, y); px += x.measureText(text[i]).width + ls; }
      return w;
    }
    function width(text, font, ls) { x.font = font; var w = 0; for (var i = 0; i < text.length; i++) w += x.measureText(text[i]).width + ls; return w - ls; }
    return (document.fonts ? document.fonts.load('8px "Poiret One"').then(function () { return document.fonts.load('8px "JetBrains Mono"'); }) : Promise.resolve()).then(function () {
      return new Promise(function (done, fail) { var im = new Image(); im.onload = function () { done(im); }; im.onerror = fail; im.src = MANDALA; });
    }).then(function (im) {
      x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
      // sussuri presents
      var f1 = (3.3 * u) + 'px "Poiret One"', f2 = (1.45 * u) + 'px "JetBrains Mono", monospace';
      var w1 = width('sussuri', f1, 3.3 * u * .12), w2 = width('PRESENTS', f2, 1.45 * u * .14), gap = 1.2 * u, left = W / 2 - (w1 + gap + w2) / 2, base = 6.4 * u + 3.3 * u * .78;
      spaced('sussuri', left + w1 / 2, base, f1, 3.3 * u * .12, '#d6d6d6');
      spaced('PRESENTS', left + w1 + gap + w2 / 2, base, f2, 1.45 * u * .14, '#a8a8a8');
      // title: one size; two balanced lines when it is too long for one
      var ft = (8 * u) + 'px "Poiret One"', ls = 8 * u * .02, max = 88 * u, words = String(it.title).split(/\s+/), lines = [it.title];
      if (width(it.title, ft, ls) > max && words.length > 1) {
        var best = null;
        for (var k = 1; k < words.length; k++) { var a = words.slice(0, k).join(' '), b = words.slice(k).join(' '), dif = Math.abs(width(a, ft, ls) - width(b, ft, ls)); if (!best || dif < best.d) best = { d: dif, l: [a, b] }; }
        lines = best.l;
      }
      var lh = 8 * u * 1.1, mid = (11.5 * u + (H - 24.6 * u)) / 2, top = mid - lines.length * lh / 2;
      lines.forEach(function (l, i) { spaced(l, W / 2, top + i * lh + lh * .76, ft, ls, '#fff'); });
      // mandala
      var mw = 45 * u, mh = mw * im.naturalHeight / im.naturalWidth; x.drawImage(im, W / 2 - mw / 2, H - mh, mw, mh);
      return new Promise(function (r) { cv.toBlob(r, 'image/png'); });
    });
  };
})();
