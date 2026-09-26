/* ============================== boot.js ==============================
   The last file the build appends. It reads what the URL pins (the theme, the first run, the phone
   preview and the hash), then renders once. A narrow screen gets the phone layout on its own. */
(function () {
  var saved = null;
  try { saved = localStorage.getItem("v3-theme"); } catch (e) { /* storage blocked */ }
  // A host that stamps data-theme on the root keeps it unless the URL or a saved choice says otherwise.
  if (BOOT.theme || saved) setTheme(BOOT.theme || saved);
  else S.theme = document.documentElement.getAttribute("data-theme") || null;
  var mq = null;
  try { mq = matchMedia("(max-width: 760px)"); } catch (e) { /* no matchMedia */ }
  S.preview = BOOT.phone && !(mq && mq.matches);
  S.phone = BOOT.phone || !!(mq && mq.matches);
  if (mq && mq.addEventListener) mq.addEventListener("change", function () { if (!S.preview) { S.phone = mq.matches; render(); } });
  // The mockup states the review pill switches can also come in the query: ?health=drifted, ?as=amara.
  if (HEALTH.indexOf(BOOT.q.health) >= 0) S.health = BOOT.q.health;
  if (BOOT.q.as && PEOPLE[BOOT.q.as]) S.viewer = BOOT.q.as;
  applyHash();
  render();
})();
