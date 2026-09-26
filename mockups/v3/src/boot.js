/* ============================== boot.js ==============================
   The last file the build appends. It reads what the URL pins (the theme, the first run, the phone
   preview and the hash), then renders once. A narrow screen gets the phone layout on its own. */
(function () {
  var saved = null;
  try { saved = localStorage.getItem("v3-theme"); } catch (e) { /* storage blocked */ }
  setTheme(BOOT.theme || saved || null);
  var mq = null;
  try { mq = matchMedia("(max-width: 760px)"); } catch (e) { /* no matchMedia */ }
  S.preview = BOOT.phone && !(mq && mq.matches);
  S.phone = BOOT.phone || !!(mq && mq.matches);
  if (mq && mq.addEventListener) mq.addEventListener("change", function () { if (!S.preview) { S.phone = mq.matches; render(); } });
  applyHash();
  render();
})();
