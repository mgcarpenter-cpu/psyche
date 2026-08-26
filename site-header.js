/* ==========================================================================
   Psyche — shared header partial (the white nav from front-v2.html)
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
    lotus:'<path d="M11 18.6c-3.8 0-6.8-2.4-6.8-5.4 1.9 0 3.6.7 4.8 1.8"></path><path d="M11 18.6c3.8 0 6.8-2.4 6.8-5.4-1.9 0-3.6.7-4.8 1.8"></path><path d="M11 18.6c-2.2-2-3.4-4.4-3.4-7 0-2.6 1.4-4.6 3.4-6.2 2 1.6 3.4 3.6 3.4 6.2 0 2.6-1.2 5-3.4 7z"></path>',
    coin:'<circle cx="11" cy="11" r="8.4"></circle><line x1="11" y1="5.2" x2="11" y2="16.8"></line><path d="M13.6 8.2a2.7 2.7 0 1 0-2.6 3.4 2.7 2.7 0 1 1-2.6 3.4"></path>',
    doc:'<rect x="5" y="3.6" width="12" height="14.8"></rect><path d="M8.2 8h5.6M8.2 11.2h5.6M8.2 14.4h3.6"></path>',
    lock:'<rect x="4.6" y="9.6" width="12.8" height="10" rx="1.6"></rect><path d="M7.8 9.6V6.8a3.2 3.2 0 0 1 6.4 0v2.8"></path><circle cx="11" cy="14.4" r="1.1"></circle>',
    cross:'<circle cx="11" cy="11" r="8.4"></circle><path d="M11 7.4v7.2M7.4 11h7.2"></path>',
    target:'<circle cx="11" cy="11" r="8.4"></circle><circle cx="11" cy="11" r="3"></circle>'
  };
  function svg(k){ return '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.05" stroke-linecap="round">' + I[k] + '</svg>'; }

  // canonical app nav (psyche-chat-sidebar 1.html)
  var path = [
    { route:'assessment.html', icon:'chart', label:'Know yourself' },
    { soon:true,               icon:'lotus', label:'Meditations' },
    { soon:true,               icon:'doc',   label:'Education' }
  ];
  var earn = [
    { route:'library.html',    icon:'book',  label:'Avatar library' },
    { route:'account.html',    icon:'coin',  label:'Account &amp; earnings' }
  ];
  var membership = [
    { route:'pricing.html', icon:'target', label:'Membership' }
  ];
  var foot = [
    { route:'privacy.html', icon:'lock',  label:'Private &amp; secure' },
    { route:'terms.html',   icon:'doc',   label:'Terms &amp; conditions' },
    { route:'urgent.html',  icon:'cross', label:'Need urgent help' }
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
        '<p class="side-group-title first">Chats &amp; practice</p>' +
        '<button class="newchat row" id="newChat">' +
          '<span class="side-icon">' + svg('chat') + '</span><span class="row-label">New conversation</span></button>' +
        '<div class="row recents-head" id="recentsLabel">' +
          '<span class="side-icon">' + svg('clock') + '</span><span class="row-label">Recents</span></div>' +
        '<div id="recents" class="clamped"></div>' +
        '<div class="recents-more" id="recentsMore" style="display:none"></div>' +
        '<p class="side-group-title">Your path</p>' +
        '<div class="side-list">' + path.map(row).join('') + '</div>' +
        '<p class="side-group-title">Share &amp; earn</p>' +
        '<div class="side-list">' + earn.map(row).join('') + '</div>' +
        '<div class="side-list" style="margin-top:clamp(10px,1.6vh,18px)">' + membership.map(row).join('') + '</div>' +
        '<nav class="side-foot">' +
          foot.map(row).join('') +
          '<div class="acctwrap">' +
            '<div class="acctmenu" id="acctMenu">' +
              '<button id="acctSettings">Settings</button>' +
              '<button id="acctSignout">Sign out</button>' +
            '</div>' +
            '<div class="account row" id="account">' +
              '<div class="avatar-dot">&middot;</div>' +
              '<div class="meta">Guest<br><span class="plan">Sign in</span></div>' +
            '</div>' +
          '</div>' +
        '</nav>' +
      '</div>' +
    '</nav>';

  var s = document.currentScript;
  s.insertAdjacentHTML('beforebegin', html +
    '<div class="site-topbar"><button class="menu-btn" id="menuBtn" aria-label="Menu">' +
      '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><line x1="3" y1="3.5" x2="19" y2="3.5"></line><line x1="3" y1="11" x2="19" y2="11"></line><line x1="3" y1="18.5" x2="19" y2="18.5"></line></svg>' +
      '</button><span class="wordmark">PSYCHE</span></div>');
  document.body.classList.add('has-side');

  // remember the desktop collapse state across pages (observes the class the page JS toggles)
  (function () {
    var nav = document.getElementById('nav');
    new MutationObserver(function () {
      if (!window.matchMedia('(min-width:1024px)').matches) return;
      try { localStorage.setItem('psyche:nav', nav.classList.contains('hidden') ? 'collapsed' : 'open'); } catch (e) {}
    }).observe(nav, { attributes: true, attributeFilter: ['class'] });
  })();

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
