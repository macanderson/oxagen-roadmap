/* ============================== boot ==============================
   The last file the build appends, after engine.js and wedge.js, so every view and every dialog is
   registered before the first render. What a URL pins is read here: ?state, ?mobile, ?theme, the
   hash, ?future=1 (outline every field no contract carries today), ?drawer=approvals|stella, and
   the review island's ?phone=1 and ?help=1 (src/island.js). */
if(BOOT.state)S.state=BOOT.state;
S.mobile=BOOT.mobile!=null?!!BOOT.mobile:mobileMedia();
if(BOOT.phone)S.phone=true;
if(BOOT.theme)setTheme(BOOT.theme);
if(BOOT.future)document.documentElement.classList.add("show-future");
if(!location.hash)location.hash=BOOT.hash||"#/a-intel/core-platform/work";
applyHashTab();
if(BOOT.drawer==="approvals")S.apd.open=true;
render();
if(BOOT.drawer==="stella")asstToggle(true);
