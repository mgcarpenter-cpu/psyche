/* ==========================================================================
   Sussuri — shared header partial (the white nav from front-v2.html)
   Include where the page's <nav id="nav"> used to be:
       <script src="site-header.js"></script>
   Renders synchronously in place, so page scripts that bind #menuBtn,
   #collapseBtn, #newChat, #recents, #recentsLabel, #acctMenu,
   #acctSettings, #acctSignout and #account keep working unchanged.
   Toggle contract preserved: .hidden / .open on nav#nav.
   Icons are the landing's own strokes (stroke 1.05, viewBox 22).
   Layout follows psyche-chat-sidebar.html: Recents (clamped to 3 with a
   Show more toggle) sits above "Your path"; the footer is the landing's
   Private & secure / Terms / Need urgent help rows plus the account row.
   ========================================================================== */
(function () {
  var I = {
    chat:'<rect x="2.8" y="4.6" width="11.6" height="8.6" rx="2"></rect><path d="M7.6 15.6h9a2 2 0 0 0 2-2V8.4"></path>',
    clock:'<circle cx="11" cy="11" r="8.4"></circle><path d="M11 6.4V11l3.2 2.2"></path>',
    chart:'<line x1="4" y1="18.4" x2="18" y2="18.4"></line><rect x="6" y="12" width="2.6" height="6.4"></rect><rect x="10.2" y="8.6" width="2.6" height="9.8"></rect><rect x="14.4" y="5.2" width="2.6" height="13.2"></rect>',
    book:'<path d="M4.4 4.6h5.2a1.4 1.4 0 0 1 1.4 1.4v11.4a1.4 1.4 0 0 0-1.4-1.4H4.4z"></path><path d="M17.6 4.6h-5.2a1.4 1.4 0 0 0-1.4 1.4v11.4a1.4 1.4 0 0 1 1.4-1.4h5.2z"></path>',
    cards:'<path d="M5 5.4h9.4a1.8 1.8 0 0 1 1.8 1.8v9.4H6.8A1.8 1.8 0 0 1 5 14.8z"></path><path d="M5 5.4v9.4"></path>',
    openbook:'<path d="M4.4 6.2c2.4-1.2 4.8-1.2 6.6 0v11.2c-1.8-1.2-4.2-1.2-6.6 0z"></path><path d="M17.6 6.2c-2.4-1.2-4.8-1.2-6.6 0v11.2c1.8-1.2 4.2-1.2 6.6 0z"></path>',
    lotus:'<path d="M11 18.6c-3.8 0-6.8-2.4-6.8-5.4 1.9 0 3.6.7 4.8 1.8"></path><path d="M11 18.6c3.8 0 6.8-2.4 6.8-5.4-1.9 0-3.6.7-4.8 1.8"></path><path d="M11 18.6c-2.2-2-3.4-4.4-3.4-7 0-2.6 1.4-4.6 3.4-6.2 2 1.6 3.4 3.6 3.4 6.2 0 2.6-1.2 5-3.4 7z"></path>',
    coin:'<circle cx="11" cy="11" r="8.4"></circle><line x1="11" y1="5.2" x2="11" y2="16.8"></line><path d="M13.6 8.2a2.7 2.7 0 1 0-2.6 3.4 2.7 2.7 0 1 1-2.6 3.4"></path>',
    doc:'<rect x="5" y="3.6" width="12" height="14.8"></rect><path d="M8.2 8h5.6M8.2 11.2h5.6M8.2 14.4h3.6"></path>',
    lock:'<rect x="4.6" y="9.6" width="12.8" height="10" rx="1.6"></rect><path d="M7.8 9.6V6.8a3.2 3.2 0 0 1 6.4 0v2.8"></path><circle cx="11" cy="14.4" r="1.1"></circle>',
    cross:'<circle cx="11" cy="11" r="8.4"></circle><path d="M11 7.4v7.2M7.4 11h7.2"></path>',
    target:'<circle cx="11" cy="11" r="8.4"></circle><circle cx="11" cy="11" r="3"></circle>',
    person:'<circle cx="11" cy="7.4" r="3.2"></circle><path d="M4.6 18.6c0-3.4 2.8-5.8 6.4-5.8s6.4 2.4 6.4 5.8"></path>',
    flag:'<path d="M5.6 18.8V3.6"></path><path d="M5.6 4.6h11l-2.6 3.6 2.6 3.6h-11"></path>',
    info:'<circle cx="11" cy="11" r="8.4"></circle><path d="M11 10.2v5.2"></path><circle cx="11" cy="7.2" r=".5"></circle>',
    list:'<path d="M4.2 6.4l1.4 1.4 2.4-2.8M4.2 12.4l1.4 1.4 2.4-2.8"></path><path d="M11 6.6h6.8M11 12.6h6.8M4.6 17.8h3M11 17.8h6.8"></path>',
    share:'<circle cx="6" cy="11" r="2.2"></circle><circle cx="16" cy="5.6" r="2.2"></circle><circle cx="16" cy="16.4" r="2.2"></circle><path d="M8 10l6-3.3M8 12l6 3.3"></path>',
    calendar:'<rect x="3.6" y="5" width="14.8" height="13.4" rx="1.6"></rect><path d="M3.6 9.2h14.8M7.4 3.2v3.4M14.6 3.2v3.4"></path>',
    question:'<circle cx="11" cy="11" r="8.4"></circle><path d="M8.5 8.8a2.5 2.5 0 1 1 3.7 2.2c-.8.5-1.2 1-1.2 1.9"></path><circle cx="11" cy="15.6" r=".5"></circle>'
  };
  function svg(k){ return '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.05" stroke-linecap="round">' + I[k] + '</svg>'; }

  // THE MENU. One list, in the order it is drawn. Every item has its own switch:
  // show:true draws it, show:false hides it. Nothing else needs touching; the
  // layout closes up by itself, and a group with nothing showing loses its title.
  // (Hiding an item only takes the link away. Its page still exists.)
  var MENU = [
    { title:'Chats &amp; practice', items:[
      { show:true,  id:'newChat', route:'chat.html',       icon:'chat',     label:'New conversation' },
      { show:true,  route:'practice.html',                 icon:'calendar', label:'Practice &amp; schedule' }
    ]},
    { title:'Your path', items:[
      { show:true,  route:'assessment.html',               icon:'chart',    label:'Know yourself' },
      { show:true,  route:'your-goals.html',               icon:'flag',     label:'Your goals' },
      { show:true,  route:'personal-meditations.html',     icon:'person',   label:'Personal meditations' },
      { show:true,  route:'meditations.html',              icon:'lotus',    label:'Meditations' },
      { show:true,  route:'education.html',                icon:'doc',      label:'Education' }
    ]},
    { title:'Affiliate program', items:[
      { show:true,  route:'how-it-works.html',             icon:'info',     label:'How it works' },
      { show:true,  route:'your-plan.html',                icon:'list',     label:'Your plan' },
      { show:true,  route:'share-cards.html',              icon:'share',    label:'Share cards' },
      { show:false, route:'library.html',                  icon:'cards',    label:'Avatar library' },
      { show:false, route:'teaching-library.html',         icon:'openbook', label:'Teaching library' },
      { show:true,  route:'meditation-library.html',       icon:'lotus',    label:'Meditation library' }
    ]},
    { title:'Your account', items:[
      { show:true,  route:'pricing.html',                  icon:'target',   label:'Membership' },
      { show:true,  route:'account.html',                  icon:'coin',     label:'Account &amp; earnings' }
    ]},
    { foot:true, items:[
      { show:true,  route:'help.html',                     icon:'question', label:'Help' },
      { show:true,  route:'privacy.html',                  icon:'lock',     label:'Private &amp; secure' },
      { show:true,  route:'terms.html',                    icon:'doc',      label:'Terms &amp; conditions' },
      { show:true,  route:'urgent.html',                   icon:'cross',    label:'Need urgent help' }
    ]}
  ];
  function shown(g){ return g.items.filter(function (it) { return it.show !== false; }); }

  var here = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '');
  // Pages with no menu item of their own belong to one that has: the black band sits on that item,
  // and the top bar names both ("Your account / Settings"), so people always know where they are.
  var parentOf = { settings:'account', 'delete-account':'account', creator:'account', 'payment-terms':'terms', support:'urgent' };
  var home = parentOf[here] || here;
  function isActive(route){ return route && route.split('?')[0].replace(/\.html$/, '') === home; }

  function row(it){
    if (it.id === 'newChat') return '<button class="newchat row' + (home === 'chat' ? ' active' : '') + '" id="newChat"' + (it.show === false ? ' style="display:none"' : '') + '>' +
      '<span class="side-icon">' + svg(it.icon) + '</span><span class="row-label">' + it.label + '</span></button>';
    var cls = 'navitem row' + (it.soon ? ' soon' : '') + (it.cls ? ' ' + it.cls : '') + (isActive(it.route) ? ' active' : '');
    return '<div class="' + cls + '"' + (it.route ? ' data-route="' + it.route + '"' : '') + '>' +
      '<span class="side-icon">' + svg(it.icon) + '</span>' +
      '<span class="row-label">' + it.label + '</span>' +
      (it.soon ? '<span class="pill">soon</span>' : '') + '</div>';
  }

  // Desktop: the menu is fixed and always open. Phone: it starts as a closed drawer.
  var desktop = window.matchMedia('(min-width:1024px)').matches;
  // <script src="site-header.js" data-drawer>: the front page. The same menu, but only as a panel that slides
  // in over the page when its own three lines are tapped (window.sussuriMenu.toggle()). No top bar, no frame.
  var drawerOnly = document.currentScript.hasAttribute('data-drawer');
  var initial = (desktop && !drawerOnly) ? 'open' : 'hidden';

  // top bar: tabs on Chat / Practice, otherwise the section name (or the page's own name)
  var section = {
    assessment:'Your path', meditations:'Your path', education:'Your path', 'personal-meditations':'Your path', 'your-goals':'Your path',
    'how-it-works':'Affiliate program', 'your-plan':'Affiliate program', 'share-cards':'Affiliate program',
    library:'Affiliate program', 'teaching-library':'Affiliate program', 'meditation-library':'Affiliate program',
    pricing:'Membership', account:'Your account', settings:'Your account', 'delete-account':'Your account', creator:'Your account'
  };
  function pageName(){
    return (document.title || '').replace(/sussuri/i, '').replace(/[\u00b7\u2014\u2013|-]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  var barLeft = (here === 'chat' || here === 'practice')
    ? '<a class="tab' + (here === 'chat' ? ' on' : '') + '" href="chat.html">Chat</a>' +
      '<a class="tab' + (here === 'practice' ? ' on' : '') + '" href="practice.html">Practice &amp; schedule</a>'
    : '<span class="sb-name">' + (section[here] || pageName()) + '</span>' +
      ((section[here] && parentOf[here]) ? '<span class="sb-sep" aria-hidden="true">/</span><span class="sb-here">' + pageName() + '</span>' : '');
  // WHO IS LOOKING. Three kinds of person, worked out once here for every page:
  //   visitor = not signed in
  //   trial   = signed in, in the free month (30 days from the day they signed up), not paying
  //   member  = signed in with a paid plan
  // Payments are connected later; until then the paid plan comes from the profile's "plan" field.
  var FREE_DAYS = 30;
  var SB_REF = 'hydzekyzbqhcvajnuegh', SB_URL = 'https://' + SB_REF + '.supabase.co', SB_KEY = 'sb_publishable_4OMJbKxYkzEapBMABHuThw_E60ZNWEb';
  var pushed = null;   // what a page has told us about the signed-in person (plan, name)
  function stored(k){ try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  // "Keep me signed in" (the tick box on the sign-in page). Unticked there means: signed out when the browser closes.
  // A cookie with no end date lasts only until the browser closes. If it is missing, the browser has been reopened,
  // so a person who chose not to stay signed in is signed out on this device here, before the page reads who they are.
  try {
    if (!/(?:^|; )sussuri_live=1/.test(document.cookie)) {
      if (localStorage.getItem('sussuri:keep') === '0') localStorage.removeItem('sb-' + SB_REF + '-auth-token');
      document.cookie = 'sussuri_live=1; path=/; SameSite=Lax';
    }
  } catch (e) {}
  function who(){
    if (window.PSYCHE_PREVIEW) {   // preview mode: ?as=visitor | trial | member picks the person to look at
      var as = 'trial';
      try { var q = new URLSearchParams(location.search).get('as'); if (q) sessionStorage.setItem('psycheAs', q); as = sessionStorage.getItem('psycheAs') || as; } catch (e) {}
      if (as === 'visitor') return { state:'visitor', name:'', days:0 };
      return { state: as === 'member' ? 'member' : 'trial', name:'Preview', days:23 };
    }
    var sess = stored('sb-' + SB_REF + '-auth-token'), u = sess && sess.user;
    if (!u) return { state:'visitor', name:'', days:0 };
    var c = stored('sussuri:acct'); if (!c || c.id !== u.id) c = {};
    if (pushed && pushed.id === u.id) { c.plan = pushed.plan || c.plan; c.name = pushed.name || c.name; }
    var age = Math.floor((Date.now() - Date.parse(u.created_at || '')) / 864e5);
    var days = isNaN(age) ? FREE_DAYS : Math.max(0, FREE_DAYS - age);
    return { state: (c.plan && c.plan !== 'free') ? 'member' : 'trial', name: c.name || u.email || '', days: days, id: u.id, token: sess.access_token };
  }
  function daysText(n){ return n + (n === 1 ? ' day left' : ' days left'); }
  function escH(t){ return String(t || '').replace(/[&<>"]/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }

  // the top-right slot: one item, depending on the person (none on the Membership page for people who are not members yet)
  function slotHTML(w){
    if (here === 'auth') return '';   // the sign-in page keeps the slot empty
    if (w.state === 'member') return '<a class="site-cta" id="siteCta" href="account.html">Give a free month</a>';   // until the share-link page exists
    if (here === 'pricing') return '';
    if (w.state === 'trial') return (w.days > 0 ? '<span class="sb-days">' + daysText(w.days) + '</span>' : '') + '<a class="site-cta" id="siteCta" href="pricing.html">Become a member</a>';
    return '<a class="site-cta" id="siteCta" href="pricing.html">Start free month</a>';
  }
  // the account block at the bottom of the menu
  function acctHTML(w){
    var label = w.state === 'visitor' ? 'Guest' : (w.name || 'Account');
    var sub = w.state === 'visitor' ? 'Sign in' : w.state === 'member' ? 'Member' : (w.days > 0 ? 'Free month \u00b7 ' + daysText(w.days) : 'Free month ended');
    return '<div class="avatar-dot">' + escH(((label.trim()[0]) || '\u00b7').toUpperCase()) + '</div>' +
      '<div class="meta">' + escH(label) + '<br><span class="plan">' + escH(sub) + '</span></div>';
  }
  var cta = '<div class="sb-slot" id="siteSlot">' + slotHTML(who()) + '</div>';

  var html =
    '<nav id="nav" class="site-nav ' + (drawerOnly ? 'site-drawer ' : '') + initial + '" aria-label="Main menu">' +
      '<div class="nav-scroll">' +
        '<div class="nav-top"><a class="side-mark wordmark-side" href="/" aria-label="sussuri, front page">sussuri</a>' +   // the name leads back to the front page
          '<button class="collapse" id="collapseBtn" title="Close menu" aria-label="Close menu">&#10094;</button></div>' +
        MENU.map(function (g, gi) {
          if (g.foot) return '';
          var its = gi === 0 ? g.items : shown(g);   // the first group always draws: it also holds Recents
          if (!its.length) return '';
          return '<div class="nav-grp"><p class="side-group-title' + (gi === 0 ? ' first' : '') + '">' + g.title + '</p>' + its.map(row).join('') +
            (gi === 0 ? '<div class="row recents-head" id="recentsLabel"><span class="side-icon">' + svg('clock') + '</span><span class="row-label">Recents</span></div>' +
              '<div id="recents" class="clamped"></div><div class="recents-more" id="recentsMore" style="display:none"></div>' : '') + '</div>';
        }).join('') +
        '<div class="side-foot">' +
          MENU.filter(function (g) { return g.foot; }).map(function (g) { return shown(g).map(row).join(''); }).join('') +
          '<div class="acctwrap">' +
            '<div class="acctmenu" id="acctMenu">' +
              '<button id="acctSettings">Settings</button>' +
              '<button id="acctSignout">Sign out</button>' +
            '</div>' +
            '<div class="account row" id="account">' + acctHTML(who()) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</nav>';

  // Top bar. Desktop: one strip (section name or tabs at the left, sales button at the right).
  // Phone: two fixed strips (menu lines + name + sales button, then the section name or tabs).
  var s = document.currentScript;
  if (drawerOnly) {
    s.insertAdjacentHTML('beforebegin', html + '<div class="site-scrim" id="siteScrim"></div>');
    (function () {
      var nav = document.getElementById('nav'), scrim = document.getElementById('siteScrim'), listeners = [];
      function set(open, byKey) {
        nav.classList.toggle('open', open); nav.classList.toggle('hidden', !open); scrim.classList.toggle('on', open);
        listeners.forEach(function (f) { f(open, !!byKey); });
      }
      window.sussuriMenu = {
        open: function () { set(true); }, close: function () { set(false); },
        toggle: function () { set(!nav.classList.contains('open')); },
        isOpen: function () { return nav.classList.contains('open'); },
        onChange: function (f) { listeners.push(f); }
      };
      scrim.addEventListener('click', function () { set(false); });
      document.getElementById('collapseBtn').addEventListener('click', function () { set(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) set(false, true); });
      // this page has no app scripts, so the two rows they would normally wire up get plain links here
      document.getElementById('newChat').addEventListener('click', function () { location.href = 'chat.html'; });
      document.getElementById('account').addEventListener('click', function () { location.href = who().state === 'visitor' ? 'auth.html' : 'account.html'; });
      document.getElementById('recentsLabel').style.display = 'none';
    })();
  } else {
    s.insertAdjacentHTML('beforebegin', html +
      '<header class="site-bar" id="siteBar">' +
        '<div class="sb-strip1"><button class="menu-btn" id="menuBtn" aria-label="Menu">' +
          '<svg aria-hidden="true" width="22" height="14" viewBox="0 0 22 14" fill="none" stroke="currentColor"><path d="M0 1h22M0 7h22M0 13h22"/></svg>' +
          '</button><a class="wordmark" href="/" aria-label="sussuri, front page">sussuri</a></div>' +
        '<div class="sb-left">' + barLeft + '</div>' + cta +
      '</header>');
    document.body.classList.add('has-side');
  }

  // Note which part of the site was opened today (the Practice page shows "Done today" beside it). Kept in this browser.
  try {
    var used = stored('sussuri:used') || {}, d = new Date(), today = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    if (!drawerOnly) { used[here] = today; localStorage.setItem('sussuri:used', JSON.stringify(used)); }
  } catch (e) {}

  // Keep the slot and the account block right. Pages still draw the account block their own way when they
  // learn who is signed in; whenever they do, it is redrawn here so every page says the same thing.
  (function () {
    var box = document.getElementById('account'), slot = document.getElementById('siteSlot'), listeners = [];
    var tmp = document.createElement('div');
    function norm(h) { tmp.innerHTML = h; return tmp.innerHTML; }   // as the browser writes it back, so the comparison below is exact
    function paint() {
      var w = who(), a = norm(acctHTML(w));
      if (box.innerHTML !== a) box.innerHTML = a;
      if (slot) { var h = norm(slotHTML(w)); if (slot.innerHTML !== h) slot.innerHTML = h; slot.style.display = h ? '' : 'none'; }
      listeners.forEach(function (f) { f(w); });
    }
    new MutationObserver(paint).observe(box, { childList: true, subtree: true, characterData: true });
    window.sussuriAccount = {
      get: who,
      update: function (p) { pushed = p; try { localStorage.setItem('sussuri:acct', JSON.stringify({ id: p.id, plan: p.plan, name: p.name })); } catch (e) {} paint(); },
      onChange: function (f) { listeners.push(f); }
    };
    paint();
    // ask the account for the plan and name (pages without their own sign-in code get it from here)
    var w = who();
    if (w.id && w.token && window.fetch) {
      fetch(SB_URL + '/rest/v1/profiles?id=eq.' + encodeURIComponent(w.id) + '&select=plan,display_name', { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + w.token } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (rows) { if (rows && rows[0]) window.sussuriAccount.update({ id: w.id, plan: rows[0].plan || 'free', name: rows[0].display_name || '' }); })
        .catch(function () {});
    }
  })();

  // The arrow beside the name hides the menu on a computer too; the three lines in the top strip bring it back.
  if (!drawerOnly) {
    var wide = window.matchMedia('(min-width:1024px)');
    document.getElementById('collapseBtn').addEventListener('click', function () { if (wide.matches) document.body.classList.add('menu-off'); });
    document.getElementById('menuBtn').addEventListener('click', function () { if (wide.matches) document.body.classList.remove('menu-off'); });
  }

  // Recents clamp: pages render into #recents however they like; only the first
  // three show until "Show more" is toggled. Re-syncs whenever #recents changes.
  (function () {
    var box = document.getElementById('recents'), more = document.getElementById('recentsMore');
    var open = false;
    function sync() {
      var n = box.children.length;
      more.style.display = n > 3 ? '' : 'none';
      box.classList.toggle('clamped', !open);
      more.innerHTML = (open ? 'Show less ' : 'Show more ') + '<span class="arrow">' + (open ? '&#9652;' : '&#9662;') + '</span>';
    }
    more.addEventListener('click', function () { open = !open; sync(); });
    new MutationObserver(sync).observe(box, { childList: true });
    sync();
  })();

  // Fallback navigation for the rows this partial renders. Pages that rebind
  // [data-route] with their own onclick still win (both handlers target the
  // same href, so double-firing is harmless); pages without a binder (urgent)
  // get working links from this alone.
  document.querySelectorAll('#nav [data-route]').forEach(function (el) {
    el.addEventListener('click', function () { location.href = el.getAttribute('data-route'); });
  });

  // Pages that never had their own drawer toggling (data-toggle on the script
  // tag) get a minimal one here; app pages keep binding #menuBtn themselves.
  if (!drawerOnly && s.hasAttribute('data-toggle')) {
    var nav = document.getElementById('nav');
    function toggle(){ nav.classList.toggle('hidden'); nav.classList.toggle('open'); }
    document.getElementById('menuBtn').addEventListener('click', toggle);
    document.getElementById('collapseBtn').addEventListener('click', toggle);
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && e.target.id !== 'menuBtn') toggle();
    });
  }
})();
