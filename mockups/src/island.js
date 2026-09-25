/* ============================== review island ==============================
   The floating review toolbar. It is not product UI: it sits outside #app, on every page, and the
   app underneath renders exactly as it would without it. Expanded, it names the page (route, title,
   the Job paragraph of mockups/pages/<id>.md), links that spec, and switches the state, the mobile
   view, the theme and component help. Hide removes it until the page reloads; nothing about it is
   stored except where you dragged it.

   Component help puts a ? on every page part and opens that part's spec from mockups/help/*.md,
   which the build inlines as REVIEW.help. A part is found by the rules in islTargets(): an explicit
   data-help key first, then the page header, tile strips, panels by their heading, the run summary,
   the page's tab bar, the shell, the drawers and the open dialog. `?help=1` turns help on at load
   and `?island=0` leaves the island out (Storybook frames and the copy check). */
var ISL={on:BOOT.island!==false,open:false,help:!!BOOT.help,r:null,drag:null,pos:null,scanQ:false,more:false};

/* route() runs on every render; the island reads the route it last returned instead of calling it,
   because route() rewrites old addresses and opens dialogs a query names. */
route=(function(orig){return function(){var r=orig.apply(this,arguments);ISL.r=r;return r;};})(route);
render=(function(orig){return function(){var out=orig.apply(this,arguments);islSync();return out;};})(render);

/* The page spec a route renders: an id in mockups/catalog.mjs and a file in mockups/pages/. */
function islPageId(r,under){
  if(!r) return null;
  var p=r.page;
  if(p==="welcome") return ({signup:"signup",verify:"verify-email",login:"login","two-factor":"two-factor",forgot:"forgot-password",
    reset:"reset-password",invite:"accept-invitation",organization:"onboarding-organization",wrap:"onboarding-wrap",run:"onboarding-run",installer:"installer"})[r.step]||null;
  if(p==="register") return "register-"+(r.step||"name");
  if(p==="organization") return S.tab.organization==="keys"?"organization-api-keys":S.tab.organization==="roles"?"organization-roles":"organization";
  if(p==="billing"||p==="audit"||p==="agents") return p;
  if(p==="work"){ if(S.dlg==="intake"&&!under) return "work-intake"; return "work-"+({orders:"orders",workflows:"workflows",findings:"findings"}[r.tab]||"backlog"); }
  if(p==="workitem") return "work-item";
  if(p==="workorder") return "work-order";
  if(p==="run"){ if(typeof SKRUN!=="undefined"&&r.id===SKRUN.id) return "run-interjection";
    return ({trace:"run",transcript:"run-transcript",cost:"run-cost",memory:"run-memories",evidence:"run-evidence"})[S.tab.run]||"run"; }
  if(p==="agent"){ var at=S.tab.agent||"overview"; return at==="overview"?"agent":at==="definition"?"agent-source":"agent-"+at; }
  if(p==="agentsource") return "agent-source";
  if(p==="tools"){ var tt=S.tab.tools||"tools"; return tt==="tools"?"tools":"tools-"+tt; }
  if(p==="source") return r.kind==="skill"?"steering-source-skill":"steering-source";
  if(p==="steering") return r.tab&&r.tab!=="sources"?"steering-"+r.tab:"steering";
  if(p==="runtimes") return r.id?"runtime":"runtimes";
  if(p==="spend") return S.tab.spend==="budgets"?"spend-budgets":S.tab.spend==="optimization"?"spend-optimization":"spend";
  if(p==="repositories") return ({copies:"repositories-copies",changes:"repositories-changes",config:"repositories-config"})[S.tab.repositories]||"repositories";
  return null;
}
/* A tab of a page shares its header and tab bar with the page it belongs to, so a key that is not
   written for the tab falls back to the family's first page. */
function islFamily(id){
  if(!id) return null;
  var m=/^(agent|run|tools|steering|spend|repositories|organization|work|register|onboarding)(-|$)/.exec(id);
  if(!m) return id==="runtime"?"runtimes":id;
  return ({agent:"agent",run:"run",tools:"tools",steering:"steering",spend:"spend",repositories:"repositories",
    organization:"organization",work:"work-backlog",register:"register-name",onboarding:"onboarding-organization"})[m[1]];
}
function islSlug(s){return String(s||"").toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");}
function islHelp(key){
  var H=REVIEW.help;
  if(H[key]) return {key:key,e:H[key]};
  var i=key.indexOf("/"), ns=key.slice(0,i), rest=key.slice(i+1), fam=islFamily(ns);
  if(fam&&fam!==ns&&H[fam+"/"+rest]) return {key:fam+"/"+rest,e:H[fam+"/"+rest]};
  return null;
}
/* The text a heading shows, without the counts, pills and buttons nested in it. */
function islHeadText(hd){
  var t="";
  [].forEach.call(hd.childNodes,function(n){if(n.nodeType===3)t+=n.nodeValue;else if(n.nodeType===1&&/^(B|I|EM|STRONG|A)$/.test(n.tagName))t+=n.textContent;});
  t=t.replace(/\s+/g," ").trim();
  return t||hd.textContent.replace(/\s+/g," ").trim();
}

/* Every page part that gets a ?: [element, key, heading or null]. */
function islTargets(){
  /* the page under a dialog keeps its own keys: the Intake dialog makes the island name work-intake,
     but the Backlog under it is still work-backlog */
  var pid=islPageId(ISL.r,true)||"page", out=[], seen=[];
  function add(elm,key,hd){ if(!elm||seen.indexOf(elm)>=0) return; seen.push(elm); out.push([elm,key,hd||null]); }
  function ownKey(v){return v.indexOf("/")>=0?v:pid+"/"+v;}
  function headOf(x){return x.querySelector(":scope > .panel-h h3, :scope > .panel-h h2, :scope > .t > h1, :scope > .dlg-h h2, :scope > .dlg-h .grow > h2, :scope > h1, :scope > h2, :scope > h3");}
  var app=el("app"), layer=el("layer");
  /* an explicit key wins everywhere, including inside dialogs and drawers */
  document.querySelectorAll("#app [data-help], #layer [data-help], #apdrawer [data-help], #asst [data-help]").forEach(function(x){add(x,ownKey(x.getAttribute("data-help")),headOf(x));});
  /* the shell */
  var side=document.querySelector("#app .side"); if(side) add(side,"shell/sidebar",null);
  var top=document.querySelector("#app .top"); if(top) add(top,"shell/top-bar",null);
  var mn=document.querySelector("#app .mnav"); if(mn) add(mn,"shell/thumb-bar",null);
  var apd=document.querySelector("#apdrawer.open"); if(apd) add(apd,"approvals-drawer/drawer",apd.querySelector("h2, h3"));
  var asst=document.querySelector("#asst.open"); if(asst) add(asst,"stella-drawer/drawer",null);
  /* the page */
  var pg=document.querySelector("#pg")||app;
  if(pg){
    /* the ? sits after the eyebrow when the header has one: an h1 may hold a whole card */
    pg.querySelectorAll(".phead").forEach(function(x){ if(!x.closest("#layer")) add(x,pid+"/header",x.querySelector(".t > .eyebrow, .eyebrow, .t h1, h1")); });
    pg.querySelectorAll(".sumry").forEach(function(x){add(x,pid+"/summary",null);});
    var strips=[];
    pg.querySelectorAll(".stat").forEach(function(s){var p=s.parentElement; if(p&&!p.closest(".panel")&&strips.indexOf(p)<0) strips.push(p);});
    strips.forEach(function(p,i){add(p,pid+"/tiles"+(i?"-"+(i+1):""),null);});
    pg.querySelectorAll(".tabs").forEach(function(t){ if(!t.closest(".panel")&&!t.closest(".dlg")&&!t.closest("[data-help]")) add(t,pid+"/tabs",null); });
    pg.querySelectorAll(".panel").forEach(function(x){
      var hd=x.querySelector(":scope > .panel-h h3, :scope > .panel-h h2"); if(!hd) return;
      add(x,pid+"/"+islSlug(islHeadText(hd)),hd);
    });
  }
  /* the open dialog: one ? for the whole dialog */
  if(layer&&S.dlg){ var d=layer.querySelector(".dlg, .cmd, [role=dialog]");
    if(d) add(d,"dialog/"+(S.dlg==="wz"&&S.wz?"wz-"+S.wz.kind:S.dlg),d.querySelector(".dlg-h h2")); }
  return out;
}

function islScan(){
  ISL.scanQ=false;
  if(!ISL.help){ document.querySelectorAll(".hq").forEach(function(b){b.remove();}); document.querySelectorAll(".hq-host").forEach(function(x){x.classList.remove("hq-host","hq-rel");}); return; }
  var ts=islTargets(), live=[];
  ts.forEach(function(t){
    var elm=t[0], key=t[1], hd=t[2], found=islHelp(key);
    var host=hd||elm, b=null;
    [].some.call(host.children,function(c){if(c.classList.contains("hq")){b=c;return true;}return false;});
    if(!b){
      b=document.createElement("button");
      b.type="button"; b.className="hq"+(hd?"":" abs");
      /* a corner ? needs a positioned host; a fixed or sticky host (a drawer, the top bar) already is */
      if(!hd&&!elm.classList.contains("hq-host")){ elm.classList.add("hq-host"); if(getComputedStyle(elm).position==="static") elm.classList.add("hq-rel"); }
      host.appendChild(b);
    }
    b.setAttribute("data-key",key);
    if(found) b.setAttribute("data-spec",found.key); else b.removeAttribute("data-spec");
    b.classList.toggle("missing",!found);
    b.setAttribute("aria-label","Spec: "+(found?found.e.t:key));
    b.title=found?found.e.t:"No spec written for "+key;
    live.push(b);
  });
  document.querySelectorAll(".hq").forEach(function(b){if(live.indexOf(b)<0)b.remove();});
}
function islQueueScan(){ if(ISL.scanQ) return; ISL.scanQ=true; (window.requestAnimationFrame||setTimeout)(islScan); }

/* ---- the help dialog: a native <dialog>, so it stacks over the app's own dialogs without
   touching S.dlg, and Escape closes it alone ---- */
function islHelpOpen(key){
  var f=islHelp(key), d=el("islHelp"), pid=islPageId(ISL.r);
  var ns=f?f.key.slice(0,f.key.indexOf("/")):key.slice(0,key.indexOf("/"));
  var specId=REVIEW.pages[ns]?ns:pid;
  var pg=REVIEW.pages[specId];
  d.innerHTML='<div class="ih-h"><div class="grow"><p class="ih-eb">'+h(ns==="dialog"?"Dialog":ns==="shell"?"App shell":(REVIEW.pages[ns]||{}).t||ns)+'</p>'+
    '<h2>'+h(f?f.e.t:"No spec yet")+'</h2></div><button class="ih-x" type="button" aria-label="Close" onclick="islHelpClose()"></button></div>'+
    '<div class="ih-b">'+(f?f.e.h:'<p>No section in <code>mockups/help/</code> answers the key <code>'+h(key)+'</code>. Add a <code>## </code> section whose heading slugs to it, or give the element a <code>data-help</code> key that one does.</p>')+'</div>'+
    '<div class="ih-f"><code class="grow">'+h(f?f.key:key)+'</code>'+
    (pg?'<a class="ih-spec" href="'+h(REVIEW.spec+specId+".md")+'" target="_blank" rel="noopener">Open the '+h(pg.t)+' spec</a>':'')+
    '<button class="ih-close" type="button" onclick="islHelpClose()">Close</button></div>';
  if(!d.open){ try{d.showModal();}catch(e){d.setAttribute("open","");} }
  d.querySelector(".ih-b").scrollTop=0;
}
function islHelpClose(){var d=el("islHelp"); if(d&&d.open){try{d.close();}catch(e){d.removeAttribute("open");}}}

/* ---- the island ---- */
function islStates(pid){var p=REVIEW.pages[pid];return p?p.states:REVIEW.states;}
function islSeg(label,items,cur,fn){
  return '<div class="isl-row"><span class="isl-lab">'+h(label)+'</span><div class="isl-seg" role="group" aria-label="'+h(label)+'">'+
    items.map(function(it){return '<button type="button" data-v="'+h(it[0])+'" aria-pressed="'+(it[0]===cur?"true":"false")+'"'+(it[2]?' disabled title="'+h(it[2])+'"':'')+' onclick="'+fn+'(this.getAttribute(\'data-v\'))">'+h(it[1])+'</button>';}).join("")+
    '</div></div>';
}
function islSwitch(label,on,fn){
  return '<div class="isl-row"><span class="isl-lab">'+h(label)+'</span><button type="button" class="isl-sw" role="switch" aria-checked="'+(on?"true":"false")+'" aria-label="'+h(label)+'" onclick="'+fn+'()"><i></i></button></div>';
}
function islMenu(){
  var pid=islPageId(ISL.r), pg=pid?REVIEW.pages[pid]:null, sts=islStates(pid);
  var theme=S.theme||"system";
  return '<div class="isl-mh"><div class="grow"><p class="isl-eb">'+h(pg?pg.g:"Mockup")+'</p><h2>'+h(pg?pg.t:"No page spec")+'</h2></div>'+
     '<button type="button" class="isl-x" aria-label="Collapse" onclick="islToggle(false)"></button></div>'+
    '<div class="isl-mb">'+
     '<div class="isl-route"><span class="isl-lab">Route</span><code>'+h(location.hash||"#/")+'</code></div>'+
     (pg?'<div class="isl-desc'+(ISL.more?' all':'')+'">'+pg.job+'</div>'+
        (pg.jobLong?'<button type="button" class="isl-more" onclick="ISL.more=!ISL.more;islPaint()">'+(ISL.more?"Show less":"Show all")+'</button>':'')+
        '<a class="isl-spec" href="'+h(REVIEW.spec+pid+".md")+'" target="_blank" rel="noopener">Open the page spec</a>'
       :'<p class="isl-desc">This view has no page in mockups/pages.</p>')+
     islSeg("State",REVIEW.states.map(function(s){return [s,s,sts.indexOf(s)<0?"This page has no "+s+" state":null];}),S.state,"islState")+
     islSwitch("Mobile view",isPhone(),"islMobile")+
     islSwitch("Component help",ISL.help,"islHelpToggle")+
     islSeg("Theme",[["system","System"],["light","Light"],["dark","Dark"]],theme,"islTheme")+
     (DEBUG?'<div class="isl-row isl-dbg"><button type="button" onclick="openDialog(\'cmd\')">Screens</button><button type="button" onclick="islResetApprovals()">Reset approvals</button></div>':'')+
    '</div>'+
    '<div class="isl-mf"><button type="button" class="isl-hide" onclick="islHide()">Hide</button><span>Returns when the page reloads</span></div>';
}
function islPaint(){
  var root=el("island"); if(!root) return;
  var pid=islPageId(ISL.r), pg=pid?REVIEW.pages[pid]:null;
  root.querySelector(".isl-t").textContent=pg?pg.t:"Mockup";
  root.querySelector(".isl-st").innerHTML=[S.state].concat(isPhone()?["mobile"]:[],ISL.help?["help"]:[]).map(function(t){return "<span>"+h(t)+"</span>";}).join("");
  root.querySelector(".isl-pill").setAttribute("aria-expanded",ISL.open?"true":"false");
  var m=root.querySelector(".isl-menu");
  m.hidden=!ISL.open;
  if(ISL.open){ m.innerHTML=islMenu(); islPlaceMenu(); }
}
function islSync(){ if(!ISL.on) return; islPaint(); islQueueScan(); }

function islUrl(){
  try{
    var u=new URL(location.href), q=u.searchParams;
    q.set("state",S.state);
    if(S.phone) q.set("phone","1"); else q.delete("phone");
    if(!isPhone()) q.delete("mobile");
    if(S.theme&&S.theme!=="system") q.set("theme",S.theme); else q.delete("theme");
    if(ISL.help) q.set("help","1"); else q.delete("help");
    var qs=q.toString();
    history.replaceState(history.state,"",u.pathname+(qs?"?"+qs:"")+location.hash);
  }catch(e){}
}
function islState(v){S.state=v;islUrl();render();}
function islMobile(){ if(isPhone()){S.phone=false;S.mobile=false;} else S.phone=true; S.side=false; islUrl(); render(); }
function islTheme(v){setTheme(v);S.layer=null;islUrl();render();}
function islHelpToggle(){ISL.help=!ISL.help;islUrl();islPaint();islScan();}
function islResetApprovals(){seedApprovals();SKS.answered=null;SKS.picked=null;S.dlg=null;S.dlgArg=null;render();
  toast("Approvals reset. Every parked call is pending again with a fresh clock, and the question is waiting again.","gold");}
function islToggle(v){ISL.open=v==null?!ISL.open:!!v;islPaint();}
function islHide(){
  ISL.on=false; ISL.open=false;
  if(ISL.help){ISL.help=false;islUrl();islScan();}
  var root=el("island"); if(root) root.remove();
}

/* ---- position: dragged anywhere, clamped to the window, remembered across reloads ---- */
var ISL_POS_KEY="oxagen.mockup.island.pos";
function islClamp(x,y){
  var root=el("island"), pill=root.querySelector(".isl-pill"), w=pill.offsetWidth||200, hh=pill.offsetHeight||40;
  return {x:Math.max(8,Math.min(window.innerWidth-w-8,x)),y:Math.max(8,Math.min(window.innerHeight-hh-8,y))};
}
function islMove(x,y){
  var root=el("island"); if(!root) return;
  var p=islClamp(x,y); ISL.pos=p;
  root.style.left=p.x+"px"; root.style.top=p.y+"px"; root.style.right="auto"; root.style.bottom="auto";
  if(ISL.open) islPlaceMenu();
}
function islPlaceMenu(){
  var root=el("island"); if(!root) return;
  var r=root.getBoundingClientRect(), m=root.querySelector(".isl-menu");
  root.classList.toggle("up",r.top+r.height/2>window.innerHeight/2);
  root.classList.toggle("left",r.left+r.width/2>window.innerWidth/2);
  m.style.maxHeight=Math.max(220,(root.classList.contains("up")?r.top:window.innerHeight-r.bottom)-20)+"px";
}
function islDown(e){
  if(e.button!=null&&e.button!==0) return;
  var root=el("island"), r=root.getBoundingClientRect();
  ISL.drag={sx:e.clientX,sy:e.clientY,ox:r.left,oy:r.top,moved:false,id:e.pointerId};
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch(x){}
}
function islPointerMove(e){
  var d=ISL.drag; if(!d) return;
  var dx=e.clientX-d.sx, dy=e.clientY-d.sy;
  if(!d.moved&&Math.abs(dx)+Math.abs(dy)<5) return;
  d.moved=true; el("island").classList.add("dragging");
  islMove(d.ox+dx,d.oy+dy);
}
function islUp(e){
  var d=ISL.drag; ISL.drag=null; if(!d) return;
  el("island").classList.remove("dragging");
  if(d.moved){ try{localStorage.setItem(ISL_POS_KEY,JSON.stringify(ISL.pos));}catch(x){} }
  else if(e.currentTarget.classList.contains("isl-pill")) islToggle();
}
function islKey(e){
  if(e.key==="Escape"&&ISL.open){e.stopPropagation();islToggle(false);el("island").querySelector(".isl-pill").focus();}
  var step=e.shiftKey?40:10, mv={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[e.key];
  if(mv&&e.target.classList.contains("isl-pill")&&e.altKey){e.preventDefault();var r=el("island").getBoundingClientRect();islMove(r.left+mv[0],r.top+mv[1]);
    try{localStorage.setItem(ISL_POS_KEY,JSON.stringify(ISL.pos));}catch(x){}}
}

function islMount(){
  var dlg=document.createElement("dialog");
  dlg.id="islHelp"; dlg.className="ih"; dlg.setAttribute("aria-label","Component spec");
  dlg.addEventListener("click",function(e){if(e.target===dlg)islHelpClose();});
  document.body.appendChild(dlg);
  /* a ? is inside a heading that may sit in a clickable header: it opens the spec and nothing else */
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest(".hq"); if(!b) return;
    e.preventDefault(); e.stopPropagation(); islHelpOpen(b.getAttribute("data-key"));
  },true);
  /* Escape closes the spec dialog before the app sees it, so the dialog under it stays open */
  window.addEventListener("keydown",function(e){
    if(e.key==="Escape"&&dlg.open){e.stopImmediatePropagation();e.preventDefault();islHelpClose();}
  },true);
  if(!ISL.on) return;
  var root=document.createElement("div");
  root.id="island"; root.className="isl";
  root.setAttribute("role","region"); root.setAttribute("aria-label","Review toolbar");
  root.innerHTML='<button type="button" class="isl-pill" aria-expanded="false" aria-haspopup="true" title="Drag to move. Alt and the arrow keys move it too.">'+
    '<span class="isl-grip" aria-hidden="true"></span><span class="isl-dot" aria-hidden="true"></span>'+
    '<span class="isl-t"></span><span class="isl-st"></span></button><div class="isl-menu" hidden></div>';
  document.body.appendChild(root);
  var pill=root.querySelector(".isl-pill");
  pill.addEventListener("pointerdown",islDown);
  pill.addEventListener("pointermove",islPointerMove);
  pill.addEventListener("pointerup",islUp);
  pill.addEventListener("pointercancel",function(){ISL.drag=null;root.classList.remove("dragging");});
  pill.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();islToggle();}});
  root.addEventListener("keydown",islKey);
  document.addEventListener("pointerdown",function(e){if(ISL.open&&!root.contains(e.target)&&!(el("islHelp")||{}).open)islToggle(false);});
  try{var sp=JSON.parse(localStorage.getItem(ISL_POS_KEY)||"null"); if(sp&&typeof sp.x==="number") requestAnimationFrame(function(){islMove(sp.x,sp.y);});}catch(x){}
  window.addEventListener("resize",function(){if(ISL.pos)islMove(ISL.pos.x,ISL.pos.y);else if(ISL.open)islPlaceMenu();});
  /* a handler that rewrites part of the page without render() still gets its ? buttons */
  new MutationObserver(function(recs){
    if(!ISL.help) return;
    for(var i=0;i<recs.length;i++){var rc=recs[i], t=rc.target;
      if(rc.type==="attributes"&&!(t.id==="apdrawer"||t.id==="asst")) continue;
      if(!(t.closest&&(t.closest("#island")||t.closest("#islHelp")||t.classList.contains("hq")))){islQueueScan();return;}}
  }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
}
islMount();
