/* ==========================================================================
   Sussuri: one link per member (site walk fixes, 24 Nov 2026)
   Every page that shows a member's link (Account & earnings, Give a gift) gets it from here,
   so the same account always shows the same link. The name typed on the gift card never changes it.

   THE RULE
     1. If the account already has a link name saved (user_metadata.link_slug), that is the link. It never changes.
     2. Otherwise it is made once from the sign-in email, the part before the @ (letters and numbers only,
        lower case, 20 at most), and then saved to the account (keep()) and to this browser
        (localStorage "sussuri:link:<user id>") so it stays the same from then on.
     3. Preview mode (no real account): "preview".
   It never reads display_name or first_name: those change when a member retypes their name.

     sussuriLink.slug(user)        user = the Supabase user ({ id, email, user_metadata }); returns the link name
     sussuriLink.text(user)        "sussuri.com/j/<name>"          (what the page shows)
     sussuriLink.url(user)         "https://sussuri.com/j/<name>"  (what Copy and Share send)
     sussuriLink.keep(sb, user)    saves the name to the account the first time (call once after sign-in is known)

   STILL TO BUILD: nothing answers at sussuri.com/j/<name> yet, and nothing checks that two members
   with the same email name (mark@gmail.com, mark@outlook.com) get different links.
   ========================================================================== */
(function () {
  var SITE = 'sussuri.com';
  function clean(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20); }
  function slug(user) {
    if (window.PSYCHE_PREVIEW || !user || !user.id) return 'preview';
    var saved = clean(user.user_metadata && user.user_metadata.link_slug);
    if (saved) return saved;
    var key = 'sussuri:link:' + user.id, local = '';
    try { local = clean(localStorage.getItem(key)); } catch (e) {}
    if (local) return local;
    var made = clean(String(user.email || '').split('@')[0]) || 'member' + clean(user.id).slice(0, 8);
    try { localStorage.setItem(key, made); } catch (e) {}
    return made;
  }
  function keep(sb, user) {
    if (window.PSYCHE_PREVIEW || !sb || !user || !user.id) return;
    if (user.user_metadata && user.user_metadata.link_slug) return;
    try { sb.auth.updateUser({ data: { link_slug: slug(user) } }).catch(function () {}); } catch (e) {}
  }
  window.sussuriLink = {
    slug: slug, keep: keep,
    text: function (user) { return SITE + '/j/' + slug(user); },
    url: function (user) { return 'https://' + SITE + '/j/' + slug(user); }
  };
})();
