/* The behaviour of the design reference pages. It loads in the head, without defer, so the theme is
   set before the first paint. Everything that touches the page body waits for DOMContentLoaded.
   - Theme: ?theme=dark|light pins it, the System/Dark/Light control changes it, and the choice is
     kept per browser. Storage can be missing (a private window), so every read and write is guarded.
   - Stories: each <figure class="dx-story"> holds its markup in a <template>. The page renders the
     template into the figure's canvas and prints the same markup under "Markup", so the example and
     its code cannot drift. A later component Storybook can read the same templates.
   - Copy: a button with data-copy="#id" copies that element's text, with a fallback for file://. The
     button then shows a check and "Copied" for 1.6s.
   - Contents: the left column lists the page's h2 sections and marks the one in view. */
(function(){
  var KEY="ox-docs-theme";
  var root=document.documentElement;
  function stored(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function store(v){try{localStorage.setItem(KEY,v)}catch(e){}}
  function pinned(){var m=location.search.match(/[?&]theme=(dark|light)\b/);return m?m[1]:null}
  function applyTheme(v){
    if(v==="dark"||v==="light")root.setAttribute("data-theme",v);else root.removeAttribute("data-theme");
    var btns=document.querySelectorAll("[data-theme-set]");
    for(var i=0;i<btns.length;i++)btns[i].setAttribute("aria-pressed",String(btns[i].getAttribute("data-theme-set")===(v||"system")));
    try{document.dispatchEvent(new CustomEvent("dx:theme",{detail:v||"system"}))}catch(e){}
  }
  applyTheme(pinned()||stored()||"system");

  var LOGO='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 574.244 106.313" role="img" aria-label="oxagen"><g transform="translate(0,0) scale(2.842952)"><path d="M6.300 0.000L12.600 3.320L12.600 9.960L6.300 13.280L0.000 9.960L0.000 3.320ZM1.000 3.885L1.000 9.395L6.300 12.150L11.600 9.395L11.600 3.885L6.300 1.130Z M19.376 0.000L25.676 3.320L25.676 9.960L19.376 13.280L13.076 9.960L13.076 3.320ZM14.076 3.885L14.076 9.395L19.376 12.150L24.676 9.395L24.676 3.885L19.376 1.130Z M12.838 10.240L19.138 13.560L19.138 20.200L12.838 23.520L6.538 20.200L6.538 13.560ZM7.538 14.125L7.538 19.635L12.838 22.390L18.138 19.635L18.138 14.125L12.838 11.370Z M19.376 20.480L25.676 23.800L25.676 30.440L19.376 33.760L13.076 30.440L13.076 23.800ZM14.076 24.365L14.076 29.875L19.376 32.630L24.676 29.875L24.676 24.365L19.376 21.610Z" fill="currentColor"/><path d="M25.914 10.240L32.214 13.560L32.214 20.200L25.914 23.520L19.614 20.200L19.614 13.560Z M6.300 20.480L12.600 23.800L12.600 30.440L6.300 33.760L0.000 30.440L0.000 23.800Z" fill="#D4AF37"/></g><g transform="translate(120.376,13.067)"><path d="M33.9083 68.758Q24.1657 68.758 16.4786 64.7737Q8.79142 60.7894 4.39571 53.2965Q0 45.8035 0 35.3862V33.3718Q0 22.9544 4.39571 15.4615Q8.79142 7.96854 16.4786 3.98427Q24.1657 0 33.9083 0Q43.6509 0 51.3381 3.98427Q59.0252 7.96854 63.4209 15.4615Q67.8166 22.9544 67.8166 33.3718V35.3862Q67.8166 45.8035 63.4209 53.2965Q59.0252 60.7894 51.3381 64.7737Q43.6509 68.758 33.9083 68.758ZM33.9083 55.3486Q42.1895 55.3486 47.4689 50.0198Q52.7484 44.691 52.7484 35.0142V33.7437Q52.7484 24.067 47.5233 18.7382Q42.2981 13.4094 33.9083 13.4094Q25.6502 13.4094 20.3592 18.7382Q15.0683 24.067 15.0683 33.7437V35.0142Q15.0683 44.691 20.3592 50.0198Q25.6502 55.3486 33.9083 55.3486Z M176.569 68.758Q169.637 68.758 164.119 66.3453Q158.601 63.9327 155.387 59.2935Q152.173 54.6542 152.173 48.0088Q152.173 41.3403 155.387 36.8558Q158.601 32.3712 164.27 30.1017Q169.94 27.8323 177.174 27.8323H196.047V23.8925Q196.047 18.7316 192.874 15.5274Q189.701 12.3232 182.99 12.3232Q176.411 12.3232 173.049 15.3842Q169.686 18.4452 168.627 23.3593L154.691 18.7315Q156.27 13.6133 159.748 9.39702Q163.225 5.18071 169.049 2.59035Q174.874 0 183.208 0Q195.972 0 203.326 6.42816Q210.681 12.8563 210.681 24.9392V50.4707Q210.681 54.4204 214.368 54.4204H219.795V66.9148H209.197Q204.464 66.9148 201.442 64.5334Q198.42 62.1521 198.42 58.1563V57.8864H196.126Q195.392 59.6967 193.399 62.2985Q191.406 64.9004 187.388 66.8292Q183.369 68.758 176.569 68.758ZM179.05 56.4348Q186.581 56.4348 191.314 52.1592Q196.047 47.8837 196.047 40.6031V39.2405H178.175Q173.175 39.2405 170.208 41.3881Q167.241 43.5358 167.241 47.5513Q167.241 51.5668 170.34 54.0008Q173.439 56.4348 179.05 56.4348Z M227.767 34.6423V32.6279Q227.767 22.3817 231.86 15.0863Q235.953 7.79081 242.768 3.8954Q249.582 0 257.706 0Q266.935 0 271.762 3.33256Q276.589 6.66512 278.81 10.4107H281.042V1.8432H295.801V79.33Q295.801 85.6989 292.104 89.4725Q288.408 93.2462 282.079 93.2462H238.369V80.0541H277.023Q280.779 80.0541 280.779 76.1043V57.2775H278.547Q277.161 59.5683 274.665 61.8904Q272.168 64.2125 268.057 65.7414Q263.946 67.2702 257.706 67.2702Q249.582 67.2702 242.756 63.3748Q235.93 59.4794 231.848 52.1724Q227.767 44.8655 227.767 34.6423ZM261.938 54.0781Q270.151 54.0781 275.573 48.8612Q280.996 43.6443 280.996 34.2704V32.9999Q280.996 23.4943 275.627 18.3432Q270.259 13.1921 261.938 13.1921Q253.749 13.1921 248.315 18.3432Q242.881 23.4943 242.881 32.9999V34.2704Q242.881 43.6443 248.315 48.8612Q253.749 54.0781 261.938 54.0781Z M344.764 68.758Q334.998 68.758 327.583 64.6108Q320.167 60.4636 316.031 52.9048Q311.896 45.346 311.896 35.1689V33.589Q311.896 23.3889 315.977 15.8416Q320.059 8.2944 327.397 4.1472Q334.735 0 344.385 0Q353.881 0 360.956 4.1867Q368.031 8.37341 371.981 15.8515Q375.931 23.3297 375.931 33.2895V38.6974H327.181Q327.468 46.3334 332.587 50.9496Q337.707 55.5658 345.198 55.5658Q352.522 55.5658 356.101 52.3534Q359.681 49.141 361.553 45.0629L373.985 51.4813Q372.119 55.0656 368.63 59.1042Q365.141 63.1428 359.394 65.9504Q353.648 68.758 344.764 68.758ZM327.313 27.2892H360.622Q360.095 20.7986 355.7 16.9954Q351.304 13.1921 344.277 13.1921Q337.055 13.1921 332.691 16.9954Q328.327 20.7986 327.313 27.2892Z M391.548 66.9148V1.8432H406.353V10.9769H408.585Q410.303 7.25429 414.832 3.99908Q419.361 0.743866 428.435 0.743866Q435.956 0.743866 441.695 4.12911Q447.434 7.51435 450.651 13.5903Q453.868 19.6663 453.868 27.9442V66.9148H438.8V29.1226Q438.8 21.1969 434.891 17.3492Q430.983 13.5015 423.9 13.5015Q415.872 13.5015 411.244 18.8237Q406.617 24.146 406.617 33.9445V66.9148Z" fill="currentColor"/><path d="M73.9979 66.9148 98.2261 34.0696 74.3764 1.8432H91.9626L107.9 24.3499H110.131L126.068 1.8432H143.654L119.805 34.0696L144.033 66.9148H126.206L110.131 44.0065H107.9L91.8244 66.9148Z" fill="#D4AF37"/></g></svg>';

  function dedent(s){
    var lines=s.replace(/^\s*\n/,"").replace(/\s+$/,"").split("\n");
    var min=Infinity;
    lines.forEach(function(l){if(l.trim()){var n=l.match(/^\s*/)[0].length;if(n<min)min=n;}});
    return lines.map(function(l){return l.slice(min===Infinity?0:min)}).join("\n");
  }
  function say(msg){
    var n=document.querySelector(".dx-live");
    if(!n){n=document.createElement("div");n.className="dx-live";n.setAttribute("role","status");n.setAttribute("aria-live","polite");document.body.appendChild(n);}
    n.textContent=msg;n.classList.add("on");
    clearTimeout(say.t);say.t=setTimeout(function(){n.classList.remove("on")},1600);
  }
  function copyText(text){
    if(navigator.clipboard&&window.isSecureContext){return navigator.clipboard.writeText(text)}
    return new Promise(function(ok,fail){
      var t=document.createElement("textarea");t.value=text;t.setAttribute("readonly","");
      t.style.position="fixed";t.style.top="-1000px";document.body.appendChild(t);t.select();
      try{document.execCommand("copy")?ok():fail(new Error("copy refused"))}catch(e){fail(e)}
      document.body.removeChild(t);
    });
  }
  /* The same copied state as the engine's copiedState(): a check and "Copied" for 1.6s, drawn by .btn.copied
     in engine.css. A second press inside the 1.6s keeps the first label. */
  var COPIED='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3L13 5"/></svg>Copied';
  function wireCopy(btn){
    var label=null,t=null;
    btn.addEventListener("click",function(){
      var sel=btn.getAttribute("data-copy"),src=sel&&document.querySelector(sel);
      if(!src)return;
      var text=src.tagName==="TEMPLATE"?dedent(src.innerHTML):src.textContent.replace(/^\n/,"");
      copyText(text).then(function(){
        if(label===null){label=btn.innerHTML;btn.style.minWidth=btn.offsetWidth+"px";}
        btn.innerHTML=COPIED;btn.classList.add("copied");say(btn.getAttribute("data-copied")||"Copied to the clipboard");
        clearTimeout(t);t=setTimeout(function(){btn.innerHTML=label;btn.classList.remove("copied");btn.style.minWidth="";label=null},1600);
      },function(){say("Copy failed. Select the text and copy it by hand.")});
    });
  }
  var storyN=0;
  function renderStory(fig){
    var tpl=fig.querySelector("template"),canvas=fig.querySelector(".dx-canvas");
    if(!tpl||!canvas)return;
    canvas.appendChild(tpl.content.cloneNode(true));
    if(fig.hasAttribute("data-no-code"))return;
    if(!tpl.id)tpl.id="dx-tpl-"+(++storyN);
    var d=document.createElement("details");d.className="dx-code";
    var s=document.createElement("summary");s.textContent="Markup";
    var b=document.createElement("button");b.type="button";b.className="btn sm ghost";b.textContent="Copy markup";
    b.setAttribute("data-copy","#"+tpl.id);b.setAttribute("data-copied","Markup copied");
    b.classList.add("dx-wired");
    b.addEventListener("click",function(e){e.preventDefault()});
    s.appendChild(b);d.appendChild(s);
    var pre=document.createElement("pre"),code=document.createElement("code");
    code.style.background="none";code.style.padding="0";code.style.fontSize="inherit";
    code.textContent=dedent(tpl.innerHTML);pre.appendChild(code);d.appendChild(pre);
    fig.appendChild(d);wireCopy(b);
  }
  function buildToc(){
    var toc=document.querySelector(".dx-toc ol");if(!toc)return;
    var heads=document.querySelectorAll(".dx-main .dx-sec>h2[id], .dx-main h2.dx-h2[id]");
    var links=[];
    Array.prototype.forEach.call(heads,function(h){
      var li=document.createElement("li"),a=document.createElement("a");
      a.href="#"+h.id;a.textContent=h.getAttribute("data-toc")||h.textContent;li.appendChild(a);toc.appendChild(li);links.push([h,a]);
    });
    if(!("IntersectionObserver" in window)||!links.length)return;
    var current=null;
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){if(en.isIntersecting)current=en.target});
      if(!current)return;
      links.forEach(function(p){p[1].setAttribute("aria-current",String(p[0]===current))});
    },{rootMargin:"-70px 0px -70% 0px"});
    links.forEach(function(p){io.observe(p[0])});
  }
  document.addEventListener("DOMContentLoaded",function(){
    document.body.classList.add("dx");
    var logo=document.querySelectorAll(".dx-logo");
    for(var i=0;i<logo.length;i++)logo[i].innerHTML=LOGO;
    Array.prototype.forEach.call(document.querySelectorAll("[data-theme-set]"),function(b){
      b.addEventListener("click",function(){var v=b.getAttribute("data-theme-set");store(v);applyTheme(v)});
    });
    applyTheme(pinned()||stored()||"system");
    Array.prototype.forEach.call(document.querySelectorAll(".dx-story"),renderStory);
    Array.prototype.forEach.call(document.querySelectorAll("button[data-copy]:not(.dx-wired)"),function(b){b.classList.add("dx-wired");wireCopy(b)});
    Array.prototype.forEach.call(document.querySelectorAll("[data-expand]"),function(b){
      b.addEventListener("click",function(){
        var box=document.querySelector(b.getAttribute("data-expand"));if(!box)return;
        var open=box.classList.toggle("open");b.textContent=open?"Collapse":"Show all";b.setAttribute("aria-expanded",String(open));
      });
    });
    buildToc();
  });
})();
