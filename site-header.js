/* ==========================================================================
   Psyche — shared header partial (the white nav from front-v2.html)
   Include where the page's <nav id="nav"> used to be:
       <script src="site-header.js"></script>
   Renders synchronously in place, so page scripts that bind #menuBtn,
   #collapseBtn, #newChat, #recents, #recentsLabel, #helpBtn, #acctMenu,
   #acctSettings, #acctSignout and #account keep working unchanged.
   Toggle contract preserved: .hidden / .open on nav#nav.
   Icons are the landing's own strokes (stroke 1.05, viewBox 22).
   ========================================================================== */
(function () {
  var I = {
    chat:'<rect x="2.8" y="4.6" width="11.6" height="8.6" rx="2"></rect><path d="M7.6 15.6h9a2 2 0 0 0 2-2V8.4"></path>',
    chart:'<line x1="4" y1="18.4" x2="18" y2="18.4"></line><rect x="6" y="12" width="2.6" height="6.4"></rect><rect x="10.2" y="8.6" width="2.6" height="9.8"></rect><rect x="14.4" y="5.2" width="2.6" height="13.2"></rect>',
    spark:'<line x1="11" y1="3.2" x2="11" y2="18.8"></line><line x1="3.2" y1="11" x2="18.8" y2="11"></line><line x1="5.8" y1="5.8" x2="16.2" y2="16.2"></line><line x1="16.2" y1="5.8" x2="5.8" y2="16.2"></line>',
    route:'<circle cx="6" cy="5.6" r="2.4"></circle><circle cx="16" cy="16.4" r="2.4"></circle><path d="M6 8v4.4a3.6 3.6 0 0 0 3.6 3.6H13.6"></path>',
    book:'<path d="M4.4 4.6h5.2a1.4 1.4 0 0 1 1.4 1.4v11.4a1.4 1.4 0 0 0-1.4-1.4H4.4z"></path><path d="M17.6 4.6h-5.2a1.4 1.4 0 0 0-1.4 1.4v11.4a1.4 1.4 0 0 1 1.4-1.4h5.2z"></path>',
    lotus:'<path d="M11 18.6c-3.8 0-6.8-2.4-6.8-5.4 1.9 0 3.6.7 4.8 1.8"></path><path d="M11 18.6c3.8 0 6.8-2.4 6.8-5.4-1.9 0-3.6.7-4.8 1.8"></path><path d="M11 18.6c-2.2-2-3.4-4.4-3.4-7 0-2.6 1.4-4.6 3.4-6.2 2 1.6 3.4 3.6 3.4 6.2 0 2.6-1.2 5-3.4 7z"></path>',
    person:'<circle cx="11" cy="7.4" r="3.4"></circle><path d="M4.6 18.8c1.1-3.4 3.6-5.2 6.4-5.2s5.3 1.8 6.4 5.2"></path>',
    coin:'<circle cx="11" cy="11" r="8.4"></circle><path d="M13.4 8.2a2.6 2.6 0 1 0-2.4 3.4 2.6 2.6 0 1 1-2.4 3.4"></path>',
    scroll:'<rect x="5" y="3.4" width="12" height="15.2" rx="1.6"></rect><line x1="8" y1="7.6" x2="14" y2="7.6"></line><line x1="8" y1="11" x2="14" y2="11"></line><line x1="8" y1="14.4" x2="12" y2="14.4"></line>',
    ring:'<circle cx="11" cy="11" r="8.4"></circle><circle cx="11" cy="11" r="3"></circle>',
    question:'<circle cx="11" cy="11" r="8.4"></circle><path d="M8.8 8.6a2.2 2.2 0 1 1 3.4 1.9c-.8.5-1.2 1-1.2 1.9"></path><line x1="11" y1="15.4" x2="11" y2="15.5"></line>'
  };
  function svg(k){ return '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.05" stroke-linecap="round">' + I[k] + '</svg>'; }

  // canonical app nav (the newest variant found across pages)
  var items = [
    { route:'assessment.html', icon:'chart',  label:'My assessment' },
    { route:'reveal.html',     icon:'spark',  label:'My reveal' },
    { route:'practice.html',   icon:'route',  label:'Your practice' },
    { route:'library.html',    icon:'book',   label:'Library' },
    { route:'soon.html?t=Daily%20pearls', icon:'lotus',  label:'Daily pearls' },
    { route:'soon.html?t=Your%20avatar',  icon:'person', label:'Your avatar' },
    { route:'account.html',    icon:'coin',   label:'Account &amp; earnings' },
    { soon:true,               icon:'lotus',  label:'Meditations' },
    { soon:true,               icon:'scroll', label:'Education' },
    { route:'pricing.html',    icon:'ring',   label:'Upgrade', cls:'upgrade' }
  ];

  var here = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '');
  function isActive(route){ return route && route.split('?')[0].replace(/\.html$/, '') === here; }

  function row(it){
    var cls = 'navitem row' + (it.soon ? ' soon' : '') + (it.cls ? ' ' + it.cls : '') + (isActive(it.route) ? ' active' : '');
    return '<div class="' + cls + '"' + (it.route ? ' data-route="' + it.route + '"' : '') + '>' +
      '<span class="side-icon">' + svg(it.icon) + '</span>' +
      '<span class="row-label">' + it.label + '</span>' +
      (it.soon ? '<span class="pill">soon</span>' : '') + '</div>';
  }

  // Desktop opens expanded unless the visitor collapsed it last time; mobile starts as a closed drawer.
  var desktop = window.matchMedia('(min-width:1024px)').matches;
  var remembered = null; try { remembered = localStorage.getItem('psyche:nav'); } catch (e) {}
  var initial = (desktop && remembered !== 'collapsed') ? 'open' : 'hidden';

  var html =
    '<nav id="nav" class="side site-nav ' + initial + '">' +
      '<div class="side-sticky">' +
        '<div class="nav-top"><span class="side-mark wordmark-side">PSYCHE</span>' +
          '<button class="collapse" id="collapseBtn" title="Hide sidebar">&#10094;</button></div>' +
        '<button class="newchat row" id="newChat">' +
          '<span class="side-icon">' + svg('chat') + '</span><span class="row-label">New conversation</span></button>' +
        '<div class="side-group"><p class="side-group-title">Your path</p><div class="side-list">' +
          items.map(row).join('') +
        '</div></div>' +
        '<p class="side-group-title navlabel" id="recentsLabel">Recents</p>' +
        '<div id="recents"></div>' +
        '<div class="navspacer"></div>' +
        '<nav class="side-foot">' +
          '<div class="navitem help row row-loose' + (isActive('help.html') ? ' active' : '') + '" id="helpBtn" data-route="help.html">' +
            '<span class="side-icon">' + svg('question') + '</span><span class="row-label">Help &amp; feedback</span></div>' +
          '<div class="acctwrap">' +
            '<div class="acctmenu" id="acctMenu">' +
              '<button id="acctSettings">Settings</button>' +
              '<button id="acctSignout">Sign out</button>' +
            '</div>' +
            '<div class="account row row-loose" id="account">' +
              '<div class="avatar-dot">&middot;</div>' +
              '<div class="meta">Guest<br><span class="plan">Sign in</span></div>' +
            '</div>' +
          '</div>' +
        '</nav>' +
      '</div>' +
    '</nav>';

  var s = document.currentScript;
  s.insertAdjacentHTML('beforebegin', html +
    '<div class="site-topbar"><button class="menu-btn" id="menuBtn" aria-label="Menu">&#9776;</button><span class="wordmark">PSYCHE</span></div>');
  document.body.classList.add('has-side');

  // remember the desktop collapse state across pages (observes the class the page JS toggles)
  (function () {
    var nav = document.getElementById('nav');
    new MutationObserver(function () {
      if (!window.matchMedia('(min-width:1024px)').matches) return;
      try { localStorage.setItem('psyche:nav', nav.classList.contains('hidden') ? 'collapsed' : 'open'); } catch (e) {}
    }).observe(nav, { attributes: true, attributeFilter: ['class'] });
  })();

  // Pages that never had their own drawer toggling (data-toggle on the script
  // tag) get a minimal one here; app pages keep binding #menuBtn themselves.
  if (s.hasAttribute('data-toggle')) {
    var nav = document.getElementById('nav');
    function toggle(){ nav.classList.toggle('hidden'); nav.classList.toggle('open'); }
    document.getElementById('menuBtn').addEventListener('click', toggle);
    document.getElementById('collapseBtn').addEventListener('click', toggle);
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && e.target.id !== 'menuBtn') toggle();
    });
  }
})();
