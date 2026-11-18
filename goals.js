/* ==========================================================================
   Sussuri Goals: what the four Goals pages share.
     your-goals.html      1 Talk it through
     goals-plan.html      2 Plan
     goals-schedule.html  3 Schedule
     goals-today.html     4 Today

   WHAT IS SAVED, one record per member (window.G.data):
     areas[8]   { left, chat:[{r:'s'|'y'|'g'|'h', t, n, ok}], lines:[4 confirmed lines or null], state }
                state = 'not started' | 'part done' | 'done' | 'left for now'
                chat roles: s = Sussuri, y = member, g = a gathered line waiting for Yes / Not quite (n = which box),
                h = hidden note sent to Sussuri but not shown ("Yes, that's it")
     plan       { items:[{ id, area, kind:'inside'|'outside', what, often, time, long, keep, med, made }], built:[area numbers] }
                often / time / long are positions in OFTEN / TOD / LONG below; med = library slug; made = made for you
     gaps       [{ area, need, at }]   a meditation the library did not have, recorded each time
     sched      { lines:{ itemId:{ days:'1111111', time:'7:00 am' or '', remind, from:'often-time' } }, run:2, early:0, start:'2026-11-18' }
     ticks      { '2026-11-18': { itemId:1 } }   a tick is done; no tick by the end of the day = not done
   Kept in this browser (localStorage sussuri:goals:<user id>) and in Supabase table member_goals
   (supabase/member-goals.sql: row level security, a member can only read and write their own row).
   ========================================================================== */
(function () {
  var AREAS = ['Body and health', 'Mind and learning', 'Emotional life', 'Relationships and family', 'Work and purpose', 'Money', 'Character', 'Inner life'];
  var NEED = ['What you want, and why', 'What is stopping you', 'What you bring', 'Time you can give'];
  var OFTEN = ['Every day', '5 days a week', '3 days a week', '2 days a week', 'Once a week'];
  var TOD = ['Morning', 'Midday', 'Afternoon', 'Evening', 'Bedtime', 'Any time'];
  var LONG = ['2 min', '5 min', '10 min', '15 min', '20 min', '1 hour', 'No set time'];
  var DAYS_PER = [7, 5, 3, 2, 1], MINS = [2, 5, 10, 15, 20, 60, 0];
  var DAY_PATTERN = ['1111111', '1111100', '1010100', '0100100', '0001000'];
  var SLOT_START = ['7:00 am', '12:30 pm', '3:30 pm', '6:30 pm', '10:00 pm', ''];
  var RUNS = [1, 2, 4], EARLY = ['5 minutes before', '10 minutes before', '15 minutes before', 'At the time'], EARLY_MIN = [5, 10, 15, 0];
  // made-for-you meditations a member can have a month. PLACEHOLDER: Mark to set.
  var MADE_PER_MONTH = 2;
  var PAGES = [['your-goals.html', 'Talk it through'], ['goals-plan.html', 'Plan'], ['goals-schedule.html', 'Schedule'], ['goals-today.html', 'Today']];
  // the same message allowance as the main chat (chat.html)
  var PLAN_LIMITS = { free: 30, plus: 300, pro: 1000 }, VISITOR_MAX = 3, VK = 'sussuri:visitor';

  var SB_URL = 'https://hydzekyzbqhcvajnuegh.supabase.co', SB_KEY = 'sb_publishable_4OMJbKxYkzEapBMABHuThw_E60ZNWEb';
  var sb = (window.supabase && !window.PSYCHE_PREVIEW) ? window.supabase.createClient(SB_URL, SB_KEY) : null;
  var uid = window.PSYCHE_PREVIEW ? 'preview' : null, profile = null, saveTimer = null;

  function blank() {
    return { v: 1, areas: AREAS.map(function () { return { left: false, chat: [], lines: [null, null, null, null] }; }), plan: null, gaps: [],
      sched: { lines: {}, run: 2, early: 0, start: null }, ticks: {}, updated: 0 };
  }
  function fix(d) {   // fill in anything missing, so an older or partial record still works
    var b = blank(); d = d && typeof d === 'object' ? d : b;
    if (!Array.isArray(d.areas) || d.areas.length !== 8) d.areas = b.areas;
    d.areas.forEach(function (a) { a.chat = a.chat || []; a.lines = a.lines || [null, null, null, null]; });
    d.gaps = d.gaps || []; d.sched = Object.assign(b.sched, d.sched || {}); d.sched.lines = d.sched.lines || {}; d.ticks = d.ticks || {};
    return d;
  }
  function key() { return 'sussuri:goals:' + uid; }
  function readLocal() { try { return JSON.parse(localStorage.getItem(key())); } catch (e) { return null; } }

  function got(a) { return a.lines.filter(Boolean).length; }
  function state(a) { return a.left ? 'left for now' : got(a) === 4 ? 'done' : got(a) ? 'part done' : 'not started'; }

  var G = window.G = {
    AREAS: AREAS, NEED: NEED, PAGES: PAGES, REVIEW_PAGES: [['goals-review.html', 'Review'], PAGES[1], PAGES[2], PAGES[3]], OFTEN: OFTEN, TOD: TOD, LONG: LONG, RUNS: RUNS, EARLY: EARLY, EARLY_MIN: EARLY_MIN, MADE_PER_MONTH: MADE_PER_MONTH,
    data: blank(), got: got, state: state,
    save: function () {
      var d = G.data; d.updated = Date.now(); d.areas.forEach(function (a) { a.state = state(a); });
      try { localStorage.setItem(key(), JSON.stringify(d)); } catch (e) {}
      clearTimeout(saveTimer); saveTimer = setTimeout(G.push, 800);
    },
    push: function (keepalive) {
      clearTimeout(saveTimer); saveTimer = null;
      if (!sb || !uid) return;
      sb.from('member_goals').upsert({ user_id: uid, data: G.data, updated_at: new Date().toISOString() })
        .then(function (r) { if (r.error) console.error('goals save failed:', r.error); });
    },
    // ---- dates ----
    ymd: function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
    parse: function (s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); },
    add: function (d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); },
    today: function () { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); },
    // ---- the plan ----
    // an item is in the plan while its area is talked through (all four ticked) and not left for now
    inPlan: function (it) { var a = G.data.areas[it.area]; return !!a && state(a) === 'done'; },
    kept: function () { return (G.data.plan && G.data.plan.items || []).filter(function (it) { return it.keep && G.inPlan(it); }); },
    minutesADay: function (items) {
      var wk = 0; items.forEach(function (it) { wk += DAYS_PER[it.often] * MINS[it.long]; });
      return Math.round(wk / 7 / 5) * 5;
    },
    newId: function () { return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },
    // ---- the schedule: one line per kept item, laid out from how often + time of day ----
    syncSchedule: function () {
      var lines = G.data.sched.lines, items = G.kept(), seen = {}, slotUse = {};
      items.forEach(function (it) {
        seen[it.id] = 1;
        var from = it.often + '-' + it.time, l = lines[it.id];
        if (!l || l.from !== from) {
          var n = slotUse[it.time] || 0, t = SLOT_START[it.time];
          lines[it.id] = { days: DAY_PATTERN[it.often], time: t ? G.shift(t, n * 15) : '', remind: l ? l.remind : !!t, from: from };
        }
        slotUse[it.time] = (slotUse[it.time] || 0) + 1;
      });
      Object.keys(lines).forEach(function (id) { if (!seen[id]) lines[id].gone = true; else delete lines[id].gone; });
    },
    mins: function (t) { var m = /^(\d+):(\d\d) (am|pm)$/.exec(t); if (!m) return 9999; var h = +m[1] % 12 + (m[3] === 'pm' ? 12 : 0); return h * 60 + +m[2]; },
    fmt: function (x) { x = (x + 1440) % 1440; var h = Math.floor(x / 60), m = x % 60; return ((h % 12) || 12) + ':' + String(m).padStart(2, '0') + (h < 12 ? ' am' : ' pm'); },
    shift: function (t, n) { return G.fmt(G.mins(t) + n); },
    times: function () { var o = []; for (var x = 5 * 60; x < 24 * 60; x += 15) o.push(G.fmt(x)); return o; },
    scheduleRows: function () {   // kept items with their schedule line, in time order ("Any time" last)
      G.syncSchedule();
      return G.kept().map(function (it) { return { it: it, l: G.data.sched.lines[it.id] }; })
        .sort(function (a, b) { return G.mins(a.l.time) - G.mins(b.l.time); });
    },
    // the run: from the day Today was first opened, for run weeks; the review is the day after it ends
    runEnd: function () { return G.data.sched.start ? G.add(G.parse(G.data.sched.start), G.data.sched.run * 7 - 1) : null; },
    reviewDue: function () { var e = G.runEnd(); return !!e && G.today() > e; },
    // how often an item was scheduled and ticked between two dates (both included), up to today
    count: function (it, from, to) {
      var l = G.data.sched.lines[it.id], d = 0, t = 0, last = to < G.today() ? to : G.today();
      if (!l) return [0, 0];
      for (var x = new Date(from); x <= last; x = G.add(x, 1)) {
        if (l.days[(x.getDay() + 6) % 7] !== '1') continue;
        t++; if ((G.data.ticks[G.ymd(x)] || {})[it.id]) d++;
      }
      return [d, t];
    },
    reviewDate: function () {
      var s = G.data.sched.start ? G.parse(G.data.sched.start) : G.today();
      return G.add(s, G.data.sched.run * 7);
    },
    // ---- the one navigation row ----
    nav: function (n, pages) {
      var el = document.getElementById('gnav'), PAGES = pages || G.PAGES; if (!el) return;
      var h = '<div class="tn">';
      PAGES.forEach(function (p, i) {
        if (i) h += '<i aria-hidden="true">&rarr;</i>';
        h += i === n ? '<span class="cur" aria-current="page"><b>' + (i + 1) + '</b><em>' + p[1] + '</em></span>'
          : '<a class="' + (i < n ? 'was' : '') + '" href="' + p[0] + '"><b>' + (i + 1) + '</b><em>' + p[1] + '</em></a>';
      });
      h += '</div><div class="tgo">';
      if (n > 0) h += '<a href="' + PAGES[n - 1][0] + '">&larr; Back</a>';
      if (n < 3) h += '<a class="fw" href="' + PAGES[n + 1][0] + '">Next &rarr;</a>';
      el.innerHTML = h + '</div>';
      el.addEventListener('click', function (e) { if (e.target.closest('a')) G.push(); });
    },
    // ---- a drop-down in the site's style: a box with the value and a small arrow, a black list underneath ----
    dd: function (opts, val, onPick, cls) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'gdd ' + (cls || '');
      b.innerHTML = '<span></span><i aria-hidden="true">&#9662;</i>'; b.firstChild.textContent = opts[val] == null ? '' : opts[val];
      b.setAttribute('aria-haspopup', 'listbox');
      b.addEventListener('click', function (e) { e.stopPropagation(); G.ddOpen(b, opts, val, function (i) { val = i; b.firstChild.textContent = opts[i]; onPick(i); }); });
      return b;
    },
    ddOpen: function (b, opts, val, pick) {
      G.ddClose();
      var r = b.getBoundingClientRect(), f = document.createElement('div'); f.className = 'gddf'; f.setAttribute('role', 'listbox');
      opts.forEach(function (o, i) {
        var d = document.createElement('div'); d.className = 'gddo' + (i === val ? ' sel' : ''); d.textContent = o; d.setAttribute('role', 'option'); d.tabIndex = -1;
        d.addEventListener('click', function (e) { e.stopPropagation(); G.ddClose(); pick(i); });
        f.appendChild(d);
      });
      document.body.appendChild(f);
      var w = Math.max(r.width, 150), below = innerHeight - r.bottom - 12, h = Math.min(f.scrollHeight, 320);
      f.style.minWidth = w + 'px'; f.style.left = Math.min(r.left, innerWidth - w - 8) + 'px';
      if (below < h && r.top > below) { f.style.bottom = (innerHeight - r.top + 4) + 'px'; f.style.maxHeight = Math.min(320, r.top - 12) + 'px'; }
      else { f.style.top = (r.bottom + 4) + 'px'; f.style.maxHeight = Math.max(160, Math.min(320, below)) + 'px'; }
      var s = f.querySelector('.sel'); if (s) { s.scrollIntoView({ block: 'nearest' }); s.focus(); }
      G._dd = f; G._ddBtn = b;
    },
    ddClose: function () { if (G._dd) { G._dd.remove(); G._dd = null; } },
    // ---- the thin grey scroll line, as on the chat page ----
    rail: function (scroller, thumb) {
      function bar() {
        var r = scroller.clientHeight / scroller.scrollHeight;
        thumb.parentNode.style.display = r >= 1 ? 'none' : '';
        thumb.style.height = (r * 100) + '%'; thumb.style.top = (scroller.scrollTop / scroller.scrollHeight * 100) + '%';
      }
      scroller.addEventListener('scroll', bar); addEventListener('resize', bar); return bar;
    },
    // ---- talking to Sussuri: the same AI and the same message allowance as the main chat ----
    canSend: function () {
      if (window.PSYCHE_PREVIEW) return true;
      var st = window.sussuriAccount ? window.sussuriAccount.get().state : 'visitor';
      if (st === 'visitor' || st === 'nocard') { var v = {}; try { v = JSON.parse(localStorage.getItem(VK)) || {}; } catch (e) {} return (Number(v.n) || 0) < VISITOR_MAX; }
      return !profile || profile.message_count < (PLAN_LIMITS[profile.plan] || PLAN_LIMITS.free);
    },
    countMessage: function () {   // a typed message counts, exactly as in the main chat
      if (window.PSYCHE_PREVIEW) return;
      var st = window.sussuriAccount ? window.sussuriAccount.get().state : 'visitor';
      if (st === 'visitor' || st === 'nocard') { var v = {}; try { v = JSON.parse(localStorage.getItem(VK)) || {}; } catch (e) {} v.n = (Number(v.n) || 0) + 1; try { localStorage.setItem(VK, JSON.stringify(v)); } catch (e) {} return; }
      if (profile && sb) { profile.message_count++; sb.from('profiles').update({ message_count: profile.message_count }).eq('id', profile.id).then(function (r) { if (r.error) console.error('message_count update failed:', r.error); }); }
    },
    ask: function (system, messages, maxTokens) {
      return fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: system, max_tokens: maxTokens || 500, name: (profile && profile.display_name) || '', messages: messages }) })
        .then(function (r) { return r.json(); })
        .then(function (d) { return { text: (d.content && d.content[0] && d.content[0].text) || '', crisis: !!d.crisis, error: d.error }; });
    },
    // ---- start: who is signed in, then their saved goals ----
    ready: function (fn) {
      if (window.PSYCHE_PREVIEW) { G.data = fix(readLocal()); fn(); return; }
      sb.auth.getSession().then(function (r) {
        var s = r.data && r.data.session;
        if (!s) { location.replace('auth.html'); return; }
        uid = s.user.id;
        var local = readLocal();
        G.data = fix(local);
        // members only, like Education and Meditations: a free plan (no card yet) goes to the Join page
        sb.from('profiles').select('plan,message_count,display_name').eq('id', uid).single().then(function (p) {
          if (p.data) profile = { id: uid, plan: p.data.plan || 'free', message_count: Number(p.data.message_count) || 0, display_name: p.data.display_name || '' };
          if (!profile || profile.plan === 'free') { location.replace('pricing.html'); return; }
          loadGoals();
        });
        function loadGoals() {
        sb.from('member_goals').select('data').eq('user_id', uid).maybeSingle().then(function (q) {
          if (q.error) console.error('goals load failed:', q.error);
          var remote = q.data && q.data.data;
          if (remote && (!local || (remote.updated || 0) > (local.updated || 0))) { G.data = fix(remote); try { localStorage.setItem(key(), JSON.stringify(G.data)); } catch (e) {} }
          else if (local && (!remote || (local.updated || 0) > (remote.updated || 0))) G.push();
          fn();
        });
        }
      });
    }
  };
  document.addEventListener('click', function (e) { if (G._dd && !G._dd.contains(e.target)) G.ddClose(); });
  document.addEventListener('keydown', function (e) {
    if (!G._dd) return;
    var os = [].slice.call(G._dd.children), i = os.indexOf(document.activeElement);
    if (e.key === 'Escape') { G.ddClose(); G._ddBtn.focus(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); var n = os[Math.max(0, Math.min(os.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))]; if (n) n.focus(); }
    else if (e.key === 'Enter' && i >= 0) { e.preventDefault(); os[i].click(); G._ddBtn && G._ddBtn.focus(); }
  });
  addEventListener('scroll', function (e) { if (G._dd && !G._dd.contains(e.target)) G.ddClose(); }, true);
  addEventListener('pagehide', function () { if (saveTimer) G.push(true); });
})();
