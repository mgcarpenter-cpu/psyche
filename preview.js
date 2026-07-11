// Psyche dev preview mode — bypasses auth guards across every page for visual QA.
// Activated by ?preview=1, persists via sessionStorage, NEVER touches Supabase or real user data.
(function () {
  try {
    var qs = new URLSearchParams(location.search);
    if (qs.get("preview") === "1") sessionStorage.setItem("psychePreview", "1");
  } catch (e) {}

  var active = false;
  try { active = sessionStorage.getItem("psychePreview") === "1"; } catch (e) {}

  window.PSYCHE_PREVIEW = active;
  window.PSYCHE_PREVIEW_LIMIT = 20;
  window.PSYCHE_PREVIEW_PROFILE = {
    id: "preview-user",
    email: "preview@psyche.app",
    display_name: "Preview",
    plan: "free",
    message_count: 3,
    count_reset_at: new Date(0).toISOString()
  };

  if (!active) return;

  function addTag() {
    if (document.getElementById("psychePreviewTag")) return;
    var tag = document.createElement("div");
    tag.id = "psychePreviewTag";
    tag.textContent = "PREVIEW";
    tag.style.cssText = [
      "position:fixed", "left:12px", "bottom:12px", "z-index:2147483647",
      'font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif',
      "font-size:10.5px", "font-weight:700", "letter-spacing:.14em",
      "color:#faf8f3", "background:#e0503a",
      "padding:5px 11px", "border-radius:20px",
      "box-shadow:0 4px 14px rgba(0,0,0,.35)",
      "pointer-events:none", "user-select:none"
    ].join(";");
    (document.body || document.documentElement).appendChild(tag);
  }
  if (document.body) addTag();
  else document.addEventListener("DOMContentLoaded", addTag);
})();
