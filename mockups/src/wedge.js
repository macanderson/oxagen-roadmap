/* ==================================================================================================
   The fleet operations wedge (docs/fleet-operations-wedge.md). Work is the primary surface and a run
   is the child record of one work order. Steering Sources stay durable; the SteeringFrames resolved
   from them are what a run received, each with its source, version and hash. The Decision trace is
   the one explanation of a run. Spend has three views. Loaded state first.

   Every field no contract in macanderson/oxagen carries today is marked with data-future (fut()).
   ?future=1 outlines them; the page specs in mockups/pages/ say field by field what ships.
   ================================================================================================== */

/* ---- future-only marks ---- */
function fut(why){return ' data-future="'+h(why||"no contract carries this today")+'"';}

/* ---- addresses ---- */
function wsBase(slug){return "#/"+ORG.slug+"/"+(slug||S.ws);}
function workHash(t){return wsBase()+"/work"+(t&&t!=="backlog"?"/"+t:"");}

/* ============================== direct work orders ==============================
   Every run is a child of exactly one work order (D2). A run an operator started outside Oxagen, from
   their own terminal, is filed under a direct work order that Oxagen opens at the run's first frame,
   titled from the run's task reference. The run ledger has no work order id today, so every direct work
   order is future-only. Dispatched work orders are the ones a person sent from Work. */
var WO_BY_RUN={};
function runDay(R){
  var s=String(R.started||"");
  return /^\d\d:\d\d/.test(s)?"2026-09-11 "+s.slice(0,5):s.slice(0,16);
}
function runRepo(R){
  var m=String(R.task||"").match(/^([\w.-]+\/[\w.-]+)#/);
  return m?m[1]:(R.ws==="finops"?"a-intel/billing":R.ws==="mobile"?"a-intel/mobile":"a-intel/platform");
}
function fileDirect(R){
  var live=R.status==="live"||R.status==="parked"||R.status==="paused";
  var t=null; TASKS.forEach(function(x){if(x.num===R.task)t=x;});
  var w={id:"wo_"+R.id.slice(4),ws:R.ws,kind:"direct",title:R.taskTitle||R.task||"Run on "+(R.agent||"").split(".").pop(),
    tasks:t?[t.id]:[],target:{kind:"agent",id:R.agent},by:R.op,sent:runDay(R),
    status:live?"in progress":R.status==="halted"?"stopped":"closed",stage:1,returns:0,repos:[runRepo(R)],
    digest:null,ref:R.task||null,runs:[{stage:1,run:R.id,state:live?"live":"sealed",pr:"",note:""}],claims:[]};
  WORKORDERS.push(w); WO_BY_RUN[R.id]=w;
  return w;
}
/* Files every run that has no work order yet. Runs arrive after load (the onboarding smoke session),
   so Work and the run page call it rather than trusting the list built at start. */
function fileRuns(){ RUNS.forEach(function(R){ if(!WO_BY_RUN[R.id]) fileDirect(R); }); }
(function directWorkOrders(){
  WORKORDERS.forEach(function(w){
    if(!w.kind) w.kind="dispatched";
    (w.runs||[]).forEach(function(x){WO_BY_RUN[x.run]=w;});
  });
  fileRuns();
})();
/* A direct work order whose run a scenario took back out is not shown. */
function woShown(w){ return w.kind!=="direct"||(w.runs||[]).some(function(x){return !!run(x.run);}); }
function runParent(R){ if(!R) return null; if(!WO_BY_RUN[R.id]&&RUNS.indexOf(R)>=0) fileDirect(R); return WO_BY_RUN[R.id]||null; }
function woRuns(w){return (w.runs||[]).map(function(x){return {x:x,R:run(x.run)};});}
/* A work order is live when one of its runs is live now, read off the run itself where the run is in view. */
function woLive(w){return (w.runs||[]).some(function(x){var R=run(x.run);return R?runStatus(R)==="live":x.state==="live";});}
/* Live and parked runs in a workspace: one count for every tile that shows them. */
function wsRunCounts(wslug){
  var L=RUNS.filter(function(r){return r.ws===wslug;});
  /* a workflow stage's run that only its work order records counts too, so Work and Agents agree */
  var only=0; WORKORDERS.forEach(function(w){ if(w.ws!==wslug) return; (w.runs||[]).forEach(function(x){ if(!run(x.run)&&x.state==="live") only++; }); });
  return {live:L.filter(function(r){return runStatus(r)==="live";}).length+only,parked:L.filter(function(r){return runStatus(r)==="parked";}).length};
}
function woSpend(w){var s=0;woRuns(w).forEach(function(o){if(o.R)s+=parseFloat(o.R.cost)||0;});return s;}
function woKindBadge(w){
  return w.kind==="direct"
    ?'<span class="b b-q" title="Oxagen opened it for a run started outside Oxagen"'+fut("direct work orders")+'>direct</span>'
    :'<span class="b b-q" title="A person sent it from Work">dispatched</span>';
}

/* ============================== Work ============================== */
var WORK_TABS=[["backlog","Backlog"],["orders","Work orders"],["workflows","Workflows"],["findings","Findings"]];
function pWork(r){
  var w=ws(), t=r&&r.tab||S.tab.work||"backlog";
  if(S.state==="loading") return skeleton();
  if(S.state==="error") return errorState("Work","503 work_index_unavailable");
  if(S.state==="denied") return deniedState("this workspace\u2019s work","work.read on "+w.slug);
  if(S.state==="empty") return emptyState("No work in "+w.name+" yet",
    "Work arrives from a connected issue provider, from a finding a person picks up, or written here. A run an agent starts on its own is filed under a direct work order.",
    '<button class="btn primary" onclick="openDialog(\'intake\',\'providers\')">Connect an issue provider</button>');
  fileRuns();
  /* First run (W1): straight after onboarding the workspace holds one run, the smoke session, filed
     under a direct work order. Work opens on it alone. S.firstRun is cleared to see the seeded workspace. */
  var fr=obFirstRun(w); if(fr) t="orders";
  var counts={backlog:tkWaiting(),orders:woWaiting(),workflows:0,findings:findingsOpen().length};
  var tabs='<div class="tabs" role="tablist" aria-label="Work">'+WORK_TABS.map(function(x){
    return '<button class="tab" role="tab" aria-selected="'+(t===x[0])+'" onclick="go(\''+workHash(x[0])+'\')">'+x[1]+
      (counts[x[0]]?'<span class="n">'+counts[x[0]]+'</span>':'')+'</button>';}).join("")+'</div>';
  var sel=Object.keys(S.tsel).filter(function(k){return S.tsel[k];});
  var acts=t==="backlog"?'<button class="btn" onclick="openDialog(\'intake\',\'providers\')">Intake</button>'+dispatchButton(sel)
    :t==="workflows"?'<button class="btn primary" onclick="wfzOpen()">New workflow</button>':'';
  var body=t==="orders"?workOrdersTab(fr):t==="workflows"?'<div'+fut("workflows")+'>'+tkWfTab()+'</div>':t==="findings"?findingsTab():backlogTab();
  return '<div class="phead"><div class="t"><p class="eyebrow">'+h(w.name)+'</p><h1>Work</h1>'+
   '<p>What the agents work on, and what waits on you.</p></div><div class="acts">'+acts+'</div></div>'+
   obFirstBanners(w,fr)+(fr?obOfferCard(fr):'')+tabs+body;
}

/* ---- Backlog: every open work item ---- */
function woOf(t){return t.wo?woById(t.wo):null;}
function backlogTab(){
  var rows=wsTasks();
  var ready=rows.filter(function(t){return t.ready==="ready";}).length,
      drafts=rows.filter(function(t){return t.ready==="draft"||t.ready==="changed";}).length,
      inwo=rows.filter(function(t){return t.ready==="sent";}).length;
  var orders=wsWorkOrders(), live=orders.filter(woLive), toAccept=woWaiting();
  var parked=wsRunCounts(S.ws).parked;
  var changed=rows.filter(function(t){return t.ready==="changed";});
  var nsel=Object.keys(S.tsel).length;
  var banner=changed.length?'<div class="banner" style="margin-bottom:14px"><span class="b b-denied" style="flex:none"><span class="d"></span>changed</span>'+
    '<div class="grow"><b>'+changed.length+' work item'+(changed.length>1?'s':'')+' changed after certification</b>'+
    h(changed[0].num)+' was edited upstream on '+h(changed[0].updatedAt)+'. It left ready until somebody certifies its definition of done again.</div>'+
    '<button class="btn" onclick="go(\''+taskUrl(changed[0])+'\')">Review it</button></div>':'';
  var trs=rows.map(function(t){
    var ok=tkSelectable(t), on=!!S.tsel[t.id], wo=woOf(t);
    return '<tr '+rowClick("go('"+taskUrl(t)+"')","Open "+t.num)+(on?' aria-selected="true"':'')+'>'+
     '<td class="ck" onclick="event.stopPropagation()"><input type="checkbox" aria-label="Select '+h(t.num)+'"'+(on?' checked':'')+(ok?'':' disabled title="'+h(tkWhyNot(t))+'"')+
       ' onclick="event.stopPropagation()" onchange="tkToggle(\''+t.id+'\',this.checked)"></td>'+
     '<td><span class="tk-t">'+wiLogo(t,14)+'<span class="mono dim" style="font-size:11.5px">'+h(t.num)+'</span></span><div class="tk-s">'+h(t.subject)+'</div></td>'+
     '<td>'+lblChips(t.labels)+'</td>'+
     '<td>'+tStatusBadge(t.status)+'</td>'+
     '<td>'+tkPerson(t.owner)+'</td>'+
     '<td>'+readyBadge(t)+'</td>'+
     '<td'+fut("work orders")+'>'+(wo?'<a class="mono" style="font-size:11.5px" href="'+woUrl(wo)+'" onclick="event.stopPropagation()">'+h(wo.id)+'</a>'+(woLive(wo)?' <span class="b b-allowed"><span class="d"></span>live</span>':''):'<span class="dim">\u2014</span>')+'</td>'+
     '<td class="mono dim" style="font-size:11.5px">'+h(t.updatedAt)+'</td></tr>';}).join("");
  return '<div class="grid g4" style="margin-bottom:16px"'+fut("work items and work orders")+'>'+
     tile("Ready to send",ready,"certified and open")+
     tile("Waiting on you",drafts+toAccept,drafts+" to certify \u00b7 "+toAccept+" to accept",(drafts+toAccept)?"var(--st-approval)":null)+
     tile("In work orders",inwo,"sent to an agent or a workflow")+
     '<button class="stat click" onclick="go(\''+workHash("orders")+'\')" aria-label="Open the work orders with a live run"><span class="k">Live now</span><span class="v">'+live.length+'</span>'+
      '<span class="s">work orders with a live run'+(parked?' \u00b7 '+parked+' parked on a person':'')+'</span></button></div>'+
   banner+
   '<div class="panel"><div class="panel-h"><div style="flex:1;min-width:0"><h3>Backlog</h3>'+
   '<p class="muted" style="margin:2px 0 0;font-size:12px">Only a ready work item can be selected and sent.</p></div>'+
   '<div class="sp">'+(nsel?'<span class="b b-q">'+nsel+' selected</span><button class="btn sm" onclick="S.tsel={};render()">Clear</button>':'')+'</div></div>'+
   '<div class="tw"><table><thead><tr><th class="ck"><span class="vh">Select</span></th><th>Work item</th><th>Labels</th><th>Status</th><th>Owner</th><th>Readiness</th><th>Work order</th><th>Updated</th></tr></thead><tbody>'+trs+'</tbody></table></div>'+
   '<div class="panel-b" style="border-top:1px solid var(--border)"><div class="note">oxagen.assistant drafts a definition of done for every work item a provider imports or a finding opens. A person certifies it, and the item is ready from that moment. A ready item goes to an agent only inside a work order, and only to an agent you operate.</div></div></div>';
}
/* A work item written in Oxagen, or opened from a finding, carries the Oxagen mark where a provider item carries its provider's. */
function wiLogo(t,size){
  if(t.kind!=="oxagen") return ipLogo(t.kind,size);
  size=size||15;
  return '<span class="ipl" title="Written in Oxagen"><svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" role="img" aria-label="Oxagen"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/></svg></span>';
}

/* ---- Work orders: dispatched and direct ---- */
function workOrdersTab(fr){
  var all=(fr?[runParent(fr)]:wsWorkOrders().filter(woShown)).slice().sort(function(a,b){return (a.sent<b.sent?1:a.sent>b.sent?-1:0);});
  var f=S.woFilter||"all";
  var rows=all.filter(function(w){return f==="all"||(f==="live"?woLive(w):w.kind===f);});
  var n={all:all.length,dispatched:all.filter(function(w){return w.kind==="dispatched";}).length,direct:all.filter(function(w){return w.kind==="direct";}).length,live:all.filter(woLive).length};
  var trs=rows.map(function(w){
    var items=woItems(w).length, rs=woRuns(w), lastR=rs.length?rs[rs.length-1]:null, sp=woSpend(w);
    return '<tr '+rowClick("go('"+woUrl(w)+"')","Open "+w.id)+'>'+
     '<td><b>'+h(w.title)+'</b><div class="row" style="gap:6px;margin-top:3px"><span class="dim mono" style="font-size:11px">'+h(w.id)+'</span>'+woKindBadge(w)+'</div></td>'+
     '<td>'+(w.tasks.length?w.tasks.map(function(id){var t=taskById(id);return t?'<span class="tk-t">'+wiLogo(t,12)+'<span class="mono" style="font-size:11.5px">'+h(t.num)+'</span></span>':"";}).join("<br>")
        :'<span class="dim mono" style="font-size:11px">'+h(w.ref||"none")+'</span>')+'</td>'+
     '<td>'+woTargetCell(w)+'</td>'+
     '<td>'+(lastR?'<span class="mono" style="font-size:11.5px">'+(lastR.R?'<a href="'+wsBase(w.ws)+'/runs/'+h(lastR.x.run)+'" onclick="event.stopPropagation()">'+h(lastR.x.run)+'</a>':h(lastR.x.run))+'</span>'+
        (lastR.x.state==="live"?' <span class="b b-allowed"><span class="d"></span>live</span>':'')+(rs.length>1?'<div class="dim" style="font-size:11px">'+rs.length+' runs</div>':''):'<span class="dim">none yet</span>')+'</td>'+
     '<td class="num">'+(items?woClaimed(w)+' / '+items:'<span class="dim">\u2014</span>')+'</td>'+
     '<td>'+woBadge(w)+'</td>'+
     '<td class="num">'+(sp?usd(sp.toFixed(2)):'<span class="dim">\u2014</span>')+'</td>'+
     '<td><span class="tkp">'+personAv(w.by,20)+'<span>'+h((PEOPLE[w.by]||{}).name||w.by)+'</span></span><div class="dim mono" style="font-size:11px">'+h(w.sent)+'</div></td></tr>';}).join("");
  var chips=[["all","All"],["dispatched","Dispatched"],["direct","Direct"],["live","Live"]].map(function(x){
    return '<button class="btn sm'+(f===x[0]?' sel':'')+'" onclick="S.woFilter=\''+x[0]+'\';render()">'+x[1]+' <span class="dim">'+n[x[0]]+'</span></button>';}).join("");
  return '<div class="panel"><div class="panel-h"><div style="flex:1;min-width:0"><h3>Work orders</h3>'+
   '<p class="muted" style="margin:2px 0 0;font-size:12px">Every run belongs to one. A run started outside Oxagen gets a direct work order.</p></div>'+
   '<div class="sp">'+chips+'</div></div>'+
   '<div class="tw"><table><thead><tr><th>Work order</th><th>Work items</th><th>Sent to</th><th>Latest run</th><th class="num">Items claimed</th><th>State</th><th class="num">Spend</th><th>Sent by</th></tr></thead><tbody>'+trs+'</tbody></table></div>'+
   '<div class="panel-b" style="border-top:1px solid var(--border)"><div class="note">An agent claims an item with evidence, and a person accepts it. A work order is done when you accept every item, and nothing merges without a person. A direct work order has no definition of done until you attach it to a backlog item.</div></div></div>';
}

/* ---- Findings: a recorded problem with money behind it becomes work ---- */
var FINDING_KINDS_SHIPPED={"Cache writes never read":1,"Duplicate tool calls":1,"Repeated shell commands":1,"Unpaged results":1};
function findingItem(f){for(var i=0;i<TASKS.length;i++){if(TASKS[i].finding===f.id)return TASKS[i];}return null;}
function findingsOpen(){return FINDINGS.filter(function(f){return !findingItem(f);});}
function findingsTab(){
  var total=FINDINGS.reduce(function(s,f){return s+n$(f.save);},0), top=Math.max.apply(null,FINDINGS.map(function(f){return n$(f.save);}));
  var spendN=spendMonthTotal(), picked=FINDINGS.filter(findingItem).length;
  var cards=FINDINGS.map(function(f,i){
    var it=findingItem(f), card=fndCard(f,i,total,top);
    var extra=it?'<a class="btn sm" href="'+taskUrl(it)+'"'+fut("finding to work item")+'>In work \u00b7 '+h(it.num)+'</a>'
      :'<button class="btn sm" onclick="findingToWork(\''+h(f.id)+'\')"'+fut("finding to work item")+'>Create work item</button>';
    card=card.replace('<div class="acts">','<div class="acts">'+extra);
    if(!FINDING_KINDS_SHIPPED[f.kind]) card=card.replace('<b>'+h(f.kind)+'</b>','<b'+fut("list_findings kinds: cache writes never read, duplicate tool calls, repeated shell commands, unpaged results")+'>'+h(f.kind)+'</b>');
    return card;}).join("");
  return '<div class="grid g4" style="margin-bottom:16px">'+
     tile("At stake",usd(fmt2(total)),(total/spendN*100).toFixed(1)+'% of '+usd(fmt2(spendN))+' this month')+
     tile("Findings",FINDINGS.length,FINDINGS.length-picked+' open \u00b7 '+picked+' in work')+
     tile("Evidence","every one","opens to the runs it cites")+
     tile("Basis","measured","minus the counterfactual, at the price each call paid")+'</div>'+
   '<div class="grid" style="gap:10px">'+cards+'</div>'+
   '<div class="note" style="margin-top:14px">A finding becomes work when a person picks it up: Create work item opens a backlog item with the finding as its source and a drafted definition of done. Fix records the change directly when no agent needs to do it.</div>';
}
function findingToWork(id){
  var f=findingById(id); if(!f) return;
  var n=TASKS.filter(function(t){return t.kind==="oxagen";}).length+14;
  var t={id:"tsk_"+id.slice(4),kind:"oxagen",num:"WI-"+n,repo:"a-intel/platform",subject:f.fix,body:"Picked up from finding "+f.id+". "+f.why,
    labels:["p2","improvement"],owner:"lin:marcus",createdBy:"lin:marcus",createdAt:"2026-09-11 09:31",updatedBy:"lin:marcus",updatedAt:"2026-09-11 09:31",
    closedAt:null,status:"open",resolution:null,ready:"drafting",finding:f.id,dod:[],notes:[]};
  TASKS.unshift(t); render();
  act("Work item "+t.num+" opened from "+f.id+". oxagen.assistant is drafting its definition of done.","gold");
}

/* ============================== SteeringFrames ==============================
   A Steering Source is durable material a person or an agent wrote. A SteeringFrame is what the
   assembler resolved from one source, at one version, for one run at one injection point, with its
   provenance: source, version and hash. The two never collapse (D4). Eight frame types (D5). */
var FT=[
 {id:"goal",d:"The outcome the work serves"},
 {id:"invariant",d:"Holds for every run in its scope. No narrower source, work order or steer relaxes it"},
 {id:"constraint",d:"A requirement or prohibition for this scope"},
 {id:"delegation",d:"Authority a person delegated: what, how much and until when"},
 {id:"procedure",d:"How to do something"},
 {id:"context",d:"A fact the agent needs"},
 {id:"invocation",d:"What the agent was asked to do, and by whom"},
 {id:"capability",d:"A callable the agent may use, described. Oxagen never runs it"}];
var FT_ORDER={}, FT_DESC={}; FT.forEach(function(x,i){FT_ORDER[x.id]=i;FT_DESC[x.id]=x.d;});
function ftBadge(t){return '<span class="ft ft-'+h(t)+'" title="'+h(FT_DESC[t]||"")+'">'+h(t)+'</span>';}
/* The source kinds, with the page that manages each (D4: a frame links to its source, never the reverse). */
var SRC_KIND={
 record:{l:"Steering record",home:"Steering"},
 skill:{l:"Skill",home:"Steering"},
 adr:{l:"ADR",home:"Steering"},
 vision:{l:"Product vision",home:"Steering"},
 agent:{l:"Agent definition",home:"Agents"},
 instruction:{l:"Workspace instructions",home:"Steering"},
 glossary:{l:"Glossary term",home:"Steering"},
 memory:{l:"Memory",home:"Steering"},
 policy:{l:"Policy",home:"Tools"},
 mandate:{l:"Mandate",home:"Agents"},
 toolbelt:{l:"Toolbelt",home:"Tools"},
 work_order:{l:"Work order",home:"Work"},
 stage:{l:"Workflow stage",home:"Work"},
 steer:{l:"Operator steer",home:"Run"}};
var REC_TYPE={rule:"constraint",constraint:"constraint",procedure:"procedure",fact:"context",preference:"context",memory:"context"};
var POINTS=[
 ["session_start","Session start","the stable prefix, delivered in the signed bundle"],
 ["prompt","Prompt","the brief the run started with"],
 ["prompt_submit","Prompt submit","the volatile selection, picked for this prompt"],
 ["model_request","Model request","added at the gateway, between turns"],
 ["files","Checkout files","synced into the checkout, loaded by the harness"],
 ["tools","Tool list","the tool definitions the belt shows the model"]];
var POINT_LABEL={}; POINTS.forEach(function(p){POINT_LABEL[p[0]]=p[1];});
/* A harness's own tools (Bash in Claude Code, a shell in Codex CLI) are not frames: Oxagen did not put them there. */
var HARNESS_TOOL_RE=/^(claude_code|codex_cli|codex|cursor|stella)__/;
var SOURCES=FIXTURES.SOURCES;
function srcHash(s){return "sha256:"+frHex(String(s),16);}
/* One frame. src is {kind,id,version,path}; the hash is over the canonical body, so the same source at the
   same version always yields the same frame (the determinism the trace depends on). */
function frameOf(type,src,body,o){
  o=o||{};
  var hash=o.hash||srcHash(type+"|"+src.kind+"|"+src.id+"|"+body);
  return {id:type+":"+src.id+"@"+hash.slice(7,19),type:type,src:src,body:body,force:o.force||"should",
    tok:o.tok!=null?o.tok:stgTokOf(body),point:o.point||"session_start",hash:hash,enforced:o.enforced||null,
    reason:o.reason||null,why:o.why||null,score:o.score!=null?o.score:null,future:o.future!==false};
}
function srcOfItem(it){
  var p=String(it.provenance||""), at=p.indexOf(" @ ");
  var kind=it.kind==="record"?"record":it.kind==="ontology"?"glossary":it.kind;
  /* the assembler keys a skill's description line as skill:<id>; the source is the skill at its version */
  if(kind==="skill"){ var sid=String(it.id).replace(/^skill:/,""), sk=skillOf(sid);
    return {kind:"skill",id:sid,version:sk?sk.ver:(it.valid_from||""),path:sk?sk.path:p}; }
  return {kind:kind,id:it.id,version:at>0?p.slice(at+3):(it.valid_from||""),path:at>0?p.slice(0,at):p};
}
function itemFrame(it,point,extra){
  var t=it.kind==="record"?(REC_TYPE[String(it.sub||"rule").toLowerCase()]||"constraint")
    :it.kind==="policy"?"constraint":it.kind==="instruction"?"procedure":it.kind==="skill"?"procedure":"context";
  /* a record at force info binds nothing, so it reads as context whatever its kind */
  if(t==="constraint"&&it.force==="info") t="context";
  return frameOf(t,srcOfItem(it),it.body,Object.assign({force:it.force,tok:it.tok,point:point,hash:it.hash||null,
    enforced:it.kind==="policy"?(it.sub||"gate"):null,score:it.score},extra||{}));
}
/* The closed vocabulary of exclusion reasons (wedge spec, Exclusion reasons). */
var XR={over_budget:"It did not fit the token budget",below_relevance_floor:"It scored under the floor for this prompt",
 out_of_scope:"Its scope does not match the run",superseded:"A newer version of the same lineage won",
 overridden_by_gate:"A gate disagrees, and the gate's notice is delivered instead",overridden_by_must:"A published must outranks recalled memory",
 steering_drift:"Its hash does not match its source version",unapproved_digest:"A skill whose digest changed after a person approved it",
 widens_workspace_scope:"A repository source tried to widen a workspace source",prefix_overflow:"The session-start prefix is full",
 duplicate:"Another frame carries the same body",source_unavailable:"Its source did not answer in time",tier:"Not carried by the session-start delivery"};
var XR_SHIPPED={over_budget:1,superseded:1,tier:1};
function xrBadge(r){return '<span class="b b-q mono" title="'+h(XR[r]||"")+'"'+(XR_SHIPPED[r]?'':fut("steering.manifest records tier, budget and superseded today"))+'>'+h(r)+'</span>';}
function mapCut(c){
  var r=c.reason==="out of scope"?"out_of_scope":c.reason==="superseded"?"superseded":c.reason==="lower precedence"?"overridden_by_must"
    :(c.it.score===0?"below_relevance_floor":"over_budget");
  return r;
}
function docsFor(wslug){return (SOURCES.documents||[]).filter(function(d){return d.ws===wslug;});}
function docSrc(d){return {kind:d.kind,id:d.id,version:d.commit,path:d.repo+":"+d.path};}
/* A work order's send emits the brief, the goal and its constraints (D5). */
function woFrames(w){
  if(!w||w.kind==="direct") return [];
  var src={kind:"work_order",id:w.id,version:w.digest,path:"sent "+w.sent};
  var out=[frameOf("invocation",src,woSentPrompt(w),{force:"must",point:"prompt"})];
  w.tasks.forEach(function(id){var t=taskById(id); if(t) out.push(frameOf("goal",src,t.subject+(t.num?" ("+t.num+")":""),{force:"must",point:"prompt"}));});
  woItems(w).forEach(function(it){out.push(frameOf("constraint",src,it.t,{force:"must",point:"prompt"}));});
  out.push(frameOf("constraint",src,"Change only "+w.repos.join(", ")+", on branches and pull requests. The production branch is never pushed.",{force:"must",point:"prompt"}));
  if(w.cap) out.push(frameOf("constraint",src,"Spend at most "+usd(w.cap)+" across this work order.",{force:"must",point:"prompt"}));
  return out;
}
/* The envelope for one agent and one brief: the frames each injection point carries, and what was
   excluded, with the reason and the numbers that decided it. Built on the one assembler (assembleSteering),
   so the Compiler and the Decision trace can never disagree about the same inputs. */
function resolveEnvelope(slug,brief,opt){
  opt=opt||{};
  var M=assembleSteering(slug,brief||"",{repo:opt.repo,asOf:opt.asOf}), a=M.agent, wslug=a.ws, sel=[], cut=[];
  M.gates.forEach(function(g){sel.push(itemFrame(g,"session_start"));});
  M.prefix.forEach(function(it){sel.push(itemFrame(it,"session_start"));});
  /* The volatile selection is repacked here, because a registered document's sections compete in it
     with the records, memory and terms the assembler ranked. One ranking and one budget, so the meter
     can never read over its cap. A candidate that scores nothing for the brief is under the floor. */
  var volC=[];
  M.volatile.forEach(function(it){volC.push(itemFrame(it,"prompt_submit"));});
  M.cut.forEach(function(c){
    var vol=(c.it.force==="may"||c.it.force==="info")&&c.it.kind!=="policy";
    if(vol&&c.reason==="over budget") volC.push(itemFrame(c.it,"prompt_submit"));
    else cut.push(itemFrame(c.it,vol?"prompt_submit":"session_start",{reason:mapCut(c),why:c.why}));});
  docsFor(wslug).forEach(function(d){
    if(d.status==="superseded") return;
    d.sections.forEach(function(sec){
      if(!sec.emits) return;
      var vol=sec.force==="may"||sec.force==="info", f=frameOf(sec.emits,docSrc(d),sec.body,{force:sec.force,point:vol?"prompt_submit":"session_start",enforced:sec.enforcedBy||null});
      if(vol){ f.score=stgScore({about:sec.about,body:sec.body},stgWords(brief||"")); volC.push(f); } else sel.push(f);});});
  volC.sort(function(x,y){return ((y.score||0)-(x.score||0))||frameOrder(x,y);});
  var left=M.budget.volatileTok, ranked=volC.filter(function(f){return (f.score||0)>0;}).length;
  volC.forEach(function(f,i){
    if(!(f.score>0)){ f.reason="below_relevance_floor"; f.why="relevance 0 for this brief"; cut.push(f); return; }
    if(f.tok>left){ f.reason="over_budget"; f.why="ranked "+(i+1)+" of "+ranked+" for this brief, relevance "+f.score+". "+tokn(f.tok)+" tok did not fit in the "+tokn(left)+" left"; cut.push(f); return; }
    left-=f.tok; sel.push(f);});
  /* the agent definition's instructions */
  var def=defDoc(defSlug(a)).doc||{}, ins=def.instructions&&def.instructions.body;
  if(ins) sel.push(frameOf("procedure",{kind:"agent",id:".oxagen/agents/"+defSlug(a)+".toml",version:a.commit||"main",path:".oxagen/agents/"+defSlug(a)+".toml"},String(ins).replace(/\s+/g," ").trim(),{force:"should",point:"session_start"}));
  /* mandates: one delegation frame per active mandate the agent holds */
  MANDATES.filter(function(m){return m.agent===a.key&&m.status==="active";}).forEach(function(m){
    sel.push(frameOf("delegation",{kind:"mandate",id:m.id,version:"grant v"+(m.grantV||3),path:"granted by "+m.by},
      m.purpose+": up to "+usd(m.perCall)+" "+m.currency+" a call and "+usd(m.perPeriod)+" a "+String(m.period).replace(/ly$/,"")+", "+m.tools+", until "+m.to+". Above "+usd(m.approvalAbove)+" a person approves.",{force:"must",point:"session_start"}));});
  /* skills: the bundle synced into the checkout; withheld skills emit nothing and are listed as exclusions */
  M.skills.forEach(function(s){
    var B=(SOURCES.bundles||{})[s.id]; var src={kind:"skill",id:s.id,version:s.ver,path:s.path};
    sel.push(frameOf("procedure",src,"SKILL.md: "+s.st,{force:"info",point:"files",tok:B?B.instructions.tok:s.tokens,hash:s.digest}));
    if(B){ B.references.forEach(function(r){sel.push(frameOf("context",src,r.path+": "+r.body,{force:"info",point:"files",tok:r.tok}));});
      B.entrypoints.forEach(function(e){sel.push(frameOf("capability",src,e.name+" "+e.args+" → "+e.returns+". "+e.desc,{force:"info",point:"files",tok:0,hash:e.digest,enforced:"descriptor"}));}); }});
  (SOURCES.withheld||[]).filter(function(x){return SK_ON[wslug]&&(x.ws||"core-platform")===wslug;}).forEach(function(x){
    cut.push(frameOf("procedure",{kind:"skill",id:x.id,version:x.ver,path:".oxagen/skills/"+x.id.split(".").pop()+"/SKILL.md"},"Withheld before ranking. The agent is told the count and the reason, never the name.",
      {force:"info",point:"files",reason:x.reason,why:x.why,tok:0}));});
  /* the toolbelt: one capability frame per tool Oxagen shows the model; a harness's own tools are not frames */
  var belts=TOOLBELT_ASSIGN[a.key]||[];
  beltOf(a).forEach(function(m){
    if(HARNESS_TOOL_RE.test(m.id)) return;
    /* the source is the named belt that puts the tool on this agent; the searchable belt's meta-tools come from the definition */
    var bid=belts.filter(function(id){var b=beltCatalogById(id);return b&&b.tools.indexOf(m.id)>=0;})[0], b=bid?beltCatalogById(bid):null;
    var src=b?{kind:"toolbelt",id:b.id,version:"updated "+String(b.updated).slice(0,10),path:b.name}
      :{kind:"agent",id:".oxagen/agents/"+defSlug(a)+".toml",version:a.commit||"main",path:"the searchable belt's meta-tools"};
    var f=frameOf("capability",src,m.id+": "+m.d,{force:"info",point:"tools",tok:Math.max(60,Math.round(String(m.d).length*1.6)),enforced:m.dec});
    if(m.dec==="deny"){ f.reason="overridden_by_gate"; f.why=m.rule; cut.push(f); } else sel.push(f);});
  /* the work order the run belongs to, and the steers it received */
  woFrames(opt.wo).forEach(function(f){sel.push(f);});
  (opt.steers||[]).forEach(function(s){sel.push(frameOf("invocation",{kind:"steer",id:s.id,version:"seq "+s.seq,path:"steered by "+s.by},s.text,{force:"must",point:"model_request",tok:s.tok}));});
  sel.sort(frameOrder); cut.sort(function(x,y){return (x.reason<y.reason?-1:x.reason>y.reason?1:0)||frameOrder(x,y);});
  var byPoint={}; POINTS.forEach(function(p){byPoint[p[0]]=sel.filter(function(f){return f.point===p[0];});});
  var tok=function(L){return L.reduce(function(s,f){return s+(f.tok||0);},0);};
  return {agent:a,slug:slug,repo:M.repo,brief:brief,sel:sel,cut:cut,byPoint:byPoint,M:M,B:M.budget,
    prefixTok:M.tok.header+tok(byPoint.session_start),volatileTok:tok(byPoint.prompt_submit),
    prefixCap:Math.floor(M.budget.sessionStartBytes/M.budget.bytesPerTok),volatileCap:M.budget.volatileTok};
}
var FORCE_ORDER={must:0,should:1,may:2,info:3};
function frameOrder(x,y){return (FT_ORDER[x.type]-FT_ORDER[y.type])||((FORCE_ORDER[x.force]||0)-(FORCE_ORDER[y.force]||0))||(x.id<y.id?-1:x.id>y.id?1:0);}
function mandateHref(id){var m=MANDATES.filter(function(x){return x.id===id;})[0], ag=m?agent(m.agent):null;
  return ag?agentUrl(ag)+"/permissions?delegation="+encodeURIComponent(id):null;}
function srcHref(src){
  if(src.kind==="record") return wsBase()+"/steering/sources/record/"+encodeURIComponent(src.id);
  if(src.kind==="skill") return wsBase()+"/steering/sources/skill/"+encodeURIComponent(src.id);
  if(src.kind==="adr"||src.kind==="vision") return wsBase()+"/steering/sources/"+src.kind+"/"+encodeURIComponent(src.id);
  if(src.kind==="memory"||src.kind==="glossary"||src.kind==="instruction") return wsBase()+"/steering/sources/"+src.kind+"/"+encodeURIComponent(src.id);
  if(src.kind==="toolbelt") return wsBase()+"/tools/toolbelts?belt="+encodeURIComponent(src.id);
  if(src.kind==="policy"){
    /* a gate is edited where it lives: a kill switch on Kill switches, a record's grant on the record, a mandate on its agent */
    var g=GATES.filter(function(x){return x.id===src.id;})[0], gs=g?String(g.source||""):"";
    if(g&&g.gate==="kill switch") return wsBase()+"/tools/switches";
    if(g&&/enforcement grant/.test(gs)) return wsBase()+"/steering/sources/record/"+encodeURIComponent(gs.split(" · ")[0]);
    if(g&&g.gate==="mandate"&&/^mnd_/.test(gs)) return mandateHref(gs)||wsBase()+"/agents";
    return wsBase()+"/tools/policy";
  }
  if(src.kind==="mandate") return mandateHref(src.id)||wsBase()+"/agents";
  if(src.kind==="agent") return wsBase()+"/agents/"+src.id.replace(/^.*\/|\.toml$/g,"")+"/source";
  if(src.kind==="work_order") return woUrl({id:src.id});
  return null;
}
/* Provenance on every frame: the source kind, its id, the source version and the frame's own hash. */
function shortHash(x){x=String(x||"");return /^sha256:/.test(x)?x.slice(0,15):x;}
function srcCell(src,hash){
  var k=SRC_KIND[src.kind]||{l:src.kind}, href=srcHref(src), id=String(src.id).replace(/^skill:/,"");
  return '<div class="src-cell"><span class="dim" style="font-size:11px">'+h(k.l)+'</span>'+
    (href?'<a class="mono" href="'+href+'">'+h(id)+'</a>':'<span class="mono">'+h(id)+'</span>')+
    '<span class="mono dim" style="font-size:10.5px" title="'+h((src.version||"")+(hash?" · frame "+hash:""))+'">'+h(shortHash(src.version))+
      (hash?'<span'+fut("per-frame provenance")+'> · #'+h(String(hash).replace(/^sha256:/,"").slice(0,8))+'</span>':'')+'</span></div>';
}
/* A frame row: type, what it says, its source with version and hash, force or exclusion reason, tokens. */
function frameRow(f,o){
  o=o||{};
  return '<tr><td>'+ftBadge(f.type)+'</td>'+
   '<td class="fr-td"><div class="fr-body">'+h(f.body)+'</div>'+(f.enforced&&f.type!=="capability"?'<div class="dim" style="font-size:11px;margin-top:3px">enforced by '+h(f.enforced)+'</div>':'')+
     (o.point?'<div class="dim" style="font-size:11px;margin-top:3px">'+h(POINT_LABEL[f.point]||f.point)+'</div>':'')+'</td>'+
   '<td>'+srcCell(f.src,f.hash)+'</td>'+
   (o.reason?'<td>'+xrBadge(f.reason)+'<div class="dim" style="font-size:11px;margin-top:3px;max-width:30ch">'+h(f.why||XR[f.reason]||"")+'</div></td>':'<td>'+forceBadge(f.force)+'</td>')+
   '<td class="num">'+(f.tok?tokn(f.tok):'<span class="dim">—</span>')+'</td></tr>';
}
/* A long list shows its first rows and a button for the rest, so a section reads at a glance. */
function frameTable(L,o){
  o=o||{};
  if(!L.length) return '<div class="panel-b"><p class="muted" style="margin:0;font-size:12.5px">'+h(o.empty||"None.")+'</p></div>';
  var cap=o.cap||0, open=!cap||(S.dtAll||{})[o.key]||L.length<=cap+1, rows=open?L:L.slice(0,cap);
  return '<div class="tw"><table class="fr-t" data-lt="'+(o.lt||"off")+'"><thead><tr><th>Type</th><th>SteeringFrame</th><th>Source</th>'+
    (o.reason?'<th>Reason</th>':'<th>Force</th>')+'<th class="num">Tokens</th></tr></thead><tbody>'+
    rows.map(function(f){return frameRow(f,o);}).join("")+'</tbody></table></div>'+
    (cap&&L.length>cap+1?'<button class="lnk fr-more" onclick="dtAll(\''+h(o.key)+'\')">'+(open?'Show the first '+cap:'Show all '+L.length)+'</button>':'');
}
function dtAll(k){S.dtAll=S.dtAll||{}; S.dtAll[k]=!S.dtAll[k]; render();}
/* The type filter belongs to the view it was set on: a run's trace, the Compiler, or an agent's Steering tab. */
function ftOn(ctx){return (S.ftype||{})[ctx]||null;}
function dtType(t,ctx){ctx=ctx||"run"; S.ftype=S.ftype||{}; S.ftype[ctx]=S.ftype[ctx]===t?null:t; render();}
/* A count that follows the filter: "9 procedure of 53 SteeringFrames" with one on, "53 SteeringFrames" without. */
function ftLead(L,ctx,noun){var t=ftOn(ctx); if(!t) return L.length+" "+noun;
  return L.filter(function(f){return f.type===t;}).length+' <span class="mono">'+h(t)+'</span> of '+L.length+" "+noun;}
/* Counts by type, as a strip of badges. With a view, each badge filters that view's frames by its type. */
function typeStrip(L,ctx){
  var c={}, on=ctx?ftOn(ctx):null; L.forEach(function(f){c[f.type]=(c[f.type]||0)+1;});
  return '<div class="ft-strip">'+FT.map(function(x){
    if(!c[x.id]) return '';
    var inner=ftBadge(x.id)+'<b>'+c[x.id]+'</b>';
    return ctx?'<button class="ft-n ft-pick'+(on===x.id?' on':'')+'" aria-pressed="'+(on===x.id)+'" onclick="dtType(\''+x.id+'\',\''+ctx+'\')">'+inner+'</button>'
      :'<span class="ft-n">'+inner+'</span>';}).join("")+
    (ctx&&on?'<button class="lnk" style="font-size:12px" onclick="dtType(\''+on+'\',\''+ctx+'\')">Show every type</button>':'')+'</div>';
}

/* ---- the work order's own panels ---- */
function woRunsPanel(w,wf){
  var rs=w.runs||[];
  var trs=rs.map(function(x){
    var R=run(x.run), a=R?agent(R.agent):null, st=wf&&wf.stages[x.stage-1];
    return '<tr'+(R?' class="click" onclick="go(\''+wsBase(w.ws)+'/runs/'+h(x.run)+'\')"':'')+'>'+
     '<td>'+(R?'<a class="mono" href="'+wsBase(w.ws)+'/runs/'+h(x.run)+'" onclick="event.stopPropagation()">'+h(x.run)+'</a>':'<span class="mono">'+h(x.run)+'</span>')+
       (R&&R.taskTitle?'<div class="dim" style="font-size:11.5px">'+h(R.taskTitle)+'</div>':'')+'</td>'+
     '<td>'+(st?h(st.role)+(x.returned?' <span class="dim">returned</span>':''):'<span class="dim">—</span>')+'</td>'+
     '<td>'+(a?agentCard(a,{layout:"list",sub:"",sz:22,link:true,onclick:"event.stopPropagation()"}):st?'<span class="mono" style="font-size:12px">'+h(String(st.agent).split(".").pop())+'</span>':'')+'</td>'+
     '<td>'+(R?statusBadge(runStatus(R)):'<span class="b '+(x.state==="live"?'b-allowed':'b-q')+'"><span class="d"></span>'+h(x.state)+'</span>')+'</td>'+
     '<td>'+(R?tierBadge(R.tier):'<span class="dim">—</span>')+'</td>'+
     '<td class="num">'+(R?usd(R.cost)+'<div class="dim mono" style="font-size:10px">'+h(R.basis)+'</div>':'<span class="dim">—</span>')+'</td>'+
     '<td class="mono dim" style="font-size:11px">'+(R?h(runDay(R)):'')+'</td></tr>';}).join("");
  return '<div class="panel" style="margin-bottom:14px"><div class="panel-h"><div style="flex:1;min-width:0"><h3>Runs</h3>'+
   '<p class="muted" style="margin:2px 0 0;font-size:12px">'+rs.length+' run'+(rs.length===1?'':'s')+'. Each is a child record of this work order.</p></div></div>'+
   (rs.length?'<div class="tw"><table data-lt="off"><thead><tr><th>Run</th><th>Stage</th><th>Agent</th><th>Status</th><th>Tier</th><th class="num">Cost</th><th>Started</th></tr></thead><tbody>'+trs+'</tbody></table></div>'
     :'<div class="panel-b"><p class="muted" style="margin:0">No run yet. The runtime starts the first one with <span class="mono">oxagen work start '+h(w.id)+'</span>.</p></div>')+'</div>';
}
function woFramesPanel(w){
  var L=woFrames(w);
  if(!L.length) return '';
  return '<div class="panel"'+fut("work order frames")+'><div class="panel-h"><div style="flex:1;min-width:0"><h3>SteeringFrames from this send</h3>'+
   '<p class="muted" style="margin:2px 0 0;font-size:12px">What the send put in front of the agent, each with this work order as its source.</p></div></div>'+
   '<div class="panel-b"><ul class="fr-list">'+L.map(function(f){return '<li>'+ftBadge(f.type)+'<span>'+h(f.type==="invocation"?"The brief as sent, "+tokn(f.tok)+" tokens":f.body)+'</span><span class="mono dim" style="font-size:10.5px">'+h(f.hash.slice(0,19))+'</span></li>';}).join("")+'</ul>'+
   '<div class="note" style="margin-top:10px">Provenance on every frame: <span class="mono">'+h(w.id)+'</span> and the brief digest <span class="mono">'+h(w.digest||"")+'</span>. A sent brief cannot change, so these frames cannot either.</div></div></div>';
}
function wiOrdersPanel(t){
  var L=WORKORDERS.filter(function(w){return w.tasks.indexOf(t.id)>=0;});
  return '<div class="panel" style="margin-bottom:14px"'+fut("work orders")+'><div class="panel-h"><h3>Work orders</h3></div><div class="panel-b">'+
   (L.length?L.map(function(w){
     return '<div class="wi-wo"><a class="mono" href="'+woUrl(w)+'">'+h(w.id)+'</a> '+woBadge(w)+'<div class="dim" style="font-size:12px;margin-top:3px">'+h(w.title)+'</div>'+
       (w.runs||[]).map(function(x){return '<div class="row" style="gap:6px;margin-top:4px;font-size:12px"><span class="dim">run</span>'+runLink(x.run)+(x.state==="live"?' <span class="b b-allowed"><span class="d"></span>live</span>':'')+'</div>';}).join("")+'</div>';}).join("")
     :'<p class="muted" style="margin:0;font-size:12.5px">Not sent yet. A certified item goes to an agent inside a work order.</p>')+'</div></div>';
}

/* ---- run tabs navigate, so a tab has an address ---- */
function runTab(t){
  S.tab.run=t; var id=S.runTabFor;
  var hh=wsBase()+"/runs/"+id+(t==="trace"?"":"/"+t);
  if(location.hash!==hh) go(hh); else render();
}
/* The frame inspector replaces the player: one recorded frame, its envelope and body, with the
   frames before and after it. Stepping is reading, not playback. */
function openFrame(i){
  var R=run(S.runTabFor)||RUNS[0], L=runFrames(R);
  S.frame=Math.max(0,Math.min(+i||0,L.length-1)); S.frameRun=R.id; openDialog("frame");
}
/* Opens the frame with sequence number seq on the run in view (a scenario names frames by number). */
function openFrameSeq(seq){
  var R=run(S.runTabFor)||RUNS[0], L=runFrames(R);
  for(var i=0;i<L.length;i++){ if(L[i].seq===seq) return openFrame(i); }
  openFrame(0);
}
function openFrameIn(runId,i){
  S.dlg=null; S.frame=+i||0; S.frameRun=runId; S.pendingFrame={run:runId,i:+i||0};
  go(wsBase()+"/runs/"+runId);
}
DLG_EXT.frame=function(){
  var R=run(S.frameRun)||RUNS[0], L=runFrames(R), i=Math.max(0,Math.min(S.frame||0,L.length-1)), f=L[i];
  if(!f) return {t:"Frame",w:true,b:'<p class="muted" style="margin:0">No frame recorded here.</p>',f:'<button class="btn" onclick="closeDialog()">Close</button>'};
  FRAMES=L;
  return {t:"Frame "+f.seq+" · "+f.kind,s:R.id+" · "+f.t,w:true,
   b:'<p style="margin:0 0 14px">'+h(f.sum)+'</p>'+frameDetail(f),
   f:'<span class="grow mono dim" style="font-size:11px">frame '+(i+1)+' of '+L.length+' shown · '+R.frames+' in the run</span>'+
     '<button class="btn" '+(i>0?'':'disabled ')+'onclick="S.frame='+(i-1)+';render()">Previous</button>'+
     '<button class="btn" '+(i<L.length-1?'':'disabled ')+'onclick="S.frame='+(i+1)+';render()">Next</button>'+
     '<button class="btn primary" onclick="closeDialog()">Close</button>'};
};

/* ============================== Decision trace ==============================
   The one explanation of a run (D8). It reads the record: the steering manifests, the frames, the work
   order's send and the harness's own records. It adds no inference, no score and no model-written account
   of why. Oxagen has no access to a model's hidden reasoning, and the trace never presents returned
   thinking as how the model decided. Plan changes and self-reported doubts appear only when recorded. */
function runClock(R,t){
  var m=/^(\d\d):(\d\d):(\d\d)/.exec(String(R.started||"09:14:02")); if(!m) return "";
  var s=(+m[1])*3600+(+m[2])*60+(+m[3])+Math.round(+t||0);
  function p(n){return (n<10?"0":"")+n;}
  return p(Math.floor(s/3600)%24)+":"+p(Math.floor(s/60)%60)+":"+p(s%60);
}
function runSteers(R){
  return runFrames(R).filter(function(f){return f.kind==="control.steer";}).map(function(f){
    var m=/“([^”]+)”/.exec(f.sum||""), by=String(f.sum||"").split(" · ")[0];
    return {id:"cmd_"+R.id.slice(4,12)+"_"+f.seq,seq:f.seq,text:m?m[1]:f.sum,by:by,tok:steerTok(m?m[1]:f.sum)};});
}
function runEnvelope(R){
  var a=agent(R.agent), slug=a?defSlug(a):"release-manager", wo=runParent(R);
  var brief=wo&&wo.kind==="dispatched"?woSentPrompt(wo):(R.taskTitle||"");
  /* the bundle the run started on: a record merged later is not in what it received */
  var m=(typeof STG_MANIFESTS!=="undefined"&&STG_MANIFESTS[R.id])||{};
  return resolveEnvelope(slug,brief,{repo:runRepo(R),wo:wo,steers:runSteers(R),asOf:m.bundle||41});
}
/* The calls the agent chose, read off the transcript's tool entries and their policy decisions. */
function runChoices(R){
  var out=[], E=TRANSCRIPTS[R.id]||[];
  E.forEach(function(e){
    if(e.kind!=="tool"||e.title==="TodoWrite") return;
    var nm=e.title, harness=!/__/.test(nm)||/^(claude_code|codex|cursor|stella)__/.test(nm), g=e.gov||null;
    var ans=e.parked?"routed":g?(g.o==="allow"?"allowed":g.o==="approve"?"routed":g.o==="deny"?"denied":g.o):"allowed";
    var by=e.parked?"rule "+g.rule+" · pol_v41":g?(/^rg_/.test(g.rule)?"rule "+g.rule+" · pol_v41":g.rule):"the bundle's permissions (PreToolUse)";
    out.push({t:e.t,at:runClock(R,e.t),tool:nm,arg:e.arg||"",answer:ans,by:by,fr:(g&&g.fr!=null)?g.fr:(e.fr!=null?e.fr:null),
      harness:harness,failed:!!(e.res&&e.res.err),parked:e.parked||null,report:nm==="oxagen__report_status"});
  });
  return out;
}
function runPlan(R){
  return (TRANSCRIPTS[R.id]||[]).filter(function(e){return e.kind==="tool"&&e.title==="TodoWrite"&&e.plan;})
    .map(function(e){return {v:e.plan.v,t:e.t,at:runClock(R,e.t),items:e.plan.items};});
}
function runDoubts(R){
  var out=[];
  (TRANSCRIPTS[R.id]||[]).forEach(function(e){
    if(e.kind!=="tool"||e.title!=="oxagen__report_status") return;
    var raw={}; try{raw=JSON.parse(e.raw||"{}");}catch(x){}
    (raw.uncertain||[]).forEach(function(q){out.push({q:q,at:runClock(R,e.t),ref:((e.res&&e.res.body)||"").split(" · ").pop(),status:raw.status});});});
  return out;
}
function planDiff(prev,cur){
  var was={}; (prev||[]).forEach(function(x){was[x[0]]=x[1];});
  return cur.map(function(x){var p=was[x[0]];return {text:x[0],st:x[1],change:p==null?"added":p!==x[1]?"now "+x[1].replace("_"," "):""};});
}
var ANSWER={allowed:["b-allowed","allowed"],routed:["b-approval","routed to a person"],denied:["b-denied","denied"]};
function dtSection(n,title,sub,inner,right,futWhy){
  return '<section class="dt-sec"'+(futWhy?fut(futWhy):'')+'><div class="dt-h"><span class="dt-n">'+n+'</span><div style="min-width:0;flex:1"><h3>'+h(title)+'</h3>'+
    (sub?'<p>'+sub+'</p>':'')+'</div>'+(right?'<div class="sp">'+right+'</div>':'')+'</div>'+inner+'</section>';
}
function decisionTrace(R){
  var E=runEnvelope(R), wo=runParent(R), ch=runChoices(R), plan=runPlan(R), doubts=runDoubts(R);
  var res=(SOURCES.resolutions||{})[R.id]||null, L=runFrames(R), a=agent(R.agent);
  var manifests=L.filter(function(f){return f.kind==="steering.manifest"||f.kind==="context.assembled";}).length||1;
  var intro='<div class="dt-read"><div><b>Read from the record.</b> '+tokn(R.frames)+' frames, '+manifests+' steering manifest'+(manifests===1?'':'s')+
    (wo&&wo.kind==="dispatched"?', and the send of <a class="mono" href="'+woUrl(wo)+'">'+h(wo.id)+'</a>':'')+'. Tier '+tierBadge(R.tier)+': '+
    (R.tier==="observe"?'recorded, not enforced.':'calls routed through Oxagen were checked and recorded.')+'</div>'+
    '<div class="dim">Oxagen has no access to the model’s hidden reasoning. Thinking a provider returns is in the Transcript, labelled as the provider’s text.</div></div>';

  /* 1. Envelope, by injection point, and 2. what was excluded: the Compiler's own renderers */
  var s1=dtSection(1,"Envelope",ftLead(E.sel,"run","SteeringFrames")+" reached this run, by where they entered.",
    envelopeHtml(E,"run"),null,"frame types and per-frame provenance");
  var s2=dtSection(2,"Exclusions",ftLead(E.cut,"run","resolved")+" and not delivered, each with its reason.",
    exclusionsHtml(E,"run"),null,null);

  /* 3. Choices */
  var capN=E.byPoint.tools.length;
  var rows=ch.map(function(c){
    var an=ANSWER[c.answer]||["b-q",c.answer];
    return '<tr><td class="mono dim" style="font-size:11px;white-space:nowrap">'+h(c.at)+'</td>'+
     '<td><span class="mono" style="font-size:12px">'+h(c.tool)+'</span>'+(c.harness?' <span class="dim" style="font-size:11px">harness tool</span>':'')+
       '<div class="dim" style="font-size:11.5px">'+h(c.arg)+'</div></td>'+
     '<td><span class="b '+an[0]+'"><span class="d"></span>'+h(an[1])+'</span>'+(c.failed?' <span class="b b-denied">failed</span>':'')+
       (c.parked?'<div class="dim mono" style="font-size:11px;margin-top:3px">'+h(c.parked.ap)+' · waiting</div>':'')+'</td>'+
     '<td class="mono" style="font-size:11.5px">'+h(c.by)+'</td>'+
     '<td>'+(c.fr!=null?'<button class="lnk mono" style="font-size:11.5px" onclick="openFrame('+c.fr+')">frame '+c.fr+'</button>':'<span class="dim">—</span>')+'</td></tr>';}).join("");
  var skill=res?'<div class="dt-skill"'+fut("skill resolution frames")+'><div class="dt-point-h"><b>Skills</b><span class="dim">'+h(res.config)+'</span></div>'+
     '<ul class="fr-list">'+
      res.synced.map(function(x){return '<li><span class="b b-q">synced</span><span class="mono">'+h(x)+'</span><span class="dim">in the checkout</span></li>';}).join("")+
      (SOURCES.withheld||[]).map(function(x){return '<li><span class="b b-denied">withheld</span><span class="mono">'+h(x.id+"@"+x.ver)+'</span><span class="dim">'+h(x.reason)+'. The agent was told the count and the reason, never the name.</span></li>';}).join("")+
      res.loaded.map(function(x){return '<li><span class="b b-allowed">loaded</span><span class="mono">'+h(x.id+"@"+x.ver)+'</span><span class="dim">'+h(runClock(R,x.t))+' · '+h(x.how)+'</span></li>';}).join("")+
     '</ul></div>':'';
  var s3=dtSection(3,"Choices","The belt offered "+capN+" tool"+(capN===1?"":"s")+" from Oxagen, and the harness adds its own. Each call below with the rule's answer.",
    (rows?'<div class="tw"><table data-lt="off"><thead><tr><th>At</th><th>Call</th><th>Answer</th><th>Decided by</th><th>Frame</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
      :'<p class="muted" style="margin:0;font-size:12.5px">No call is in view for this run. Its frames are in the Transcript.</p>')+skill,null,null);

  /* 4. Frames */
  var c=fkCounts(L);
  var s4=dtSection(4,"Frames",tokn(R.frames)+" recorded, "+L.length+" in view. Each opens the frame it names.",
    runTimeline(R)+'<div class="dt-fk">'+FK_ORDER.map(function(k){return c[k]?'<span class="dt-fkc fk-'+k+'"><i></i>'+h(FK_LABEL[k])+' <b>'+c[k]+'</b></span>':'';}).join("")+
    '<button class="btn sm" style="margin-left:auto" onclick="runTab(\'transcript\')">Open the transcript</button></div>',null,null);

  /* 5. Plan changes, only when the harness recorded a plan */
  var s5="";
  if(plan.length){
    var prev=null;
    s5=dtSection(5,"Plan changes",plan.length+" versions, recorded by "+h((a&&a.harnessLabel)||"the harness")+" as TodoWrite calls.",
      '<ol class="dt-plan">'+plan.map(function(p){var d=planDiff(prev&&prev.items,p.items); prev=p;
        return '<li><div class="dt-plan-h"><b>Version '+p.v+'</b><span class="mono dim">'+h(p.at)+'</span></div><ul>'+
          d.map(function(x){return '<li class="st-'+h(x.st)+'"><span class="dt-ck" aria-hidden="true"></span><span>'+h(x.text)+'</span>'+(x.change&&p.v>1?'<span class="b b-q">'+h(x.change)+'</span>':'')+'</li>';}).join("")+'</ul></li>';}).join("")+'</ol>',null,"a plan-version frame");
  }
  /* 6. Self-reported uncertainty, only when the agent reported it in a structured field */
  var s6="";
  if(doubts.length){
    s6=dtSection(6,"Self-reported uncertainty","Quoted from the agent’s own report. Oxagen does not estimate confidence.",
      doubts.map(function(d){return '<blockquote class="dt-quote"><p>'+h(d.q)+'</p><footer><span class="mono">oxagen__report_status</span> · '+h(d.at)+' · <span class="mono">'+h(d.ref)+'</span></footer></blockquote>';}).join(""),
      null,"report_status");
  }
  var none=!plan.length&&!doubts.length?'<p class="muted" style="margin:0 0 14px;font-size:12.5px">The harness recorded no plan, and the agent reported no uncertainty.</p>':'';

  /* 7. Evidence, in short; the Evidence tab has all of it */
  var items=wo?woItems(wo):[], claimed=wo?woClaimed(wo):0;
  var pend=APPROVALS.filter(function(x){return x.run===R.id&&apState(x.id).status==="pending";});
  var outs=(R.outputs||[]).filter(roDurable);
  var s7=dtSection(7,"Evidence","What supports the outcome so far.",
    '<dl class="kv dt-ev">'+
     '<dt>Outputs</dt><dd>'+(outs.length?outs.map(function(o){return '<span class="mono" style="font-size:12px">'+h(o.name)+'</span> <span class="dim">'+h(o.state)+'</span>';}).join('<br>'):'<span class="dim">none recorded</span>')+'</dd>'+
     '<dt>Definition of done</dt><dd'+fut("work orders")+'>'+(items.length?claimed+' of '+items.length+' claimed by the agent · '+(wo.claims||[]).filter(function(c){return c&&c.ok;}).length+' accepted by a person':'<span class="dim">none: a direct work order</span>')+'</dd>'+
     '<dt>Approvals</dt><dd>'+(pend.length?pend.map(function(x){return '<span class="mono">'+h(x.id)+'</span> waiting on a person for <span class="mono">'+h(x.tool)+'</span>';}).join('<br>'):'<span class="dim">none waiting</span>')+'</dd>'+
     '<dt>Record</dt><dd>'+tokn(R.frames)+' frames, hash-chained with no gaps · '+(R.sealed?'sealed '+h(R.sealed):'not sealed yet, the run is live')+'</dd></dl>'+
    '<div class="row" style="margin-top:10px"><button class="btn sm" onclick="runTab(\'evidence\')">Open Evidence</button></div>',null,null);

  return '<div class="dt">'+intro+s1+s2+s3+s4+s5+s6+none+s7+'</div>';
}

/* ============================== Evidence ============================== */
function runEvidence(R,compacted){
  var wo=runParent(R), items=wo?woItems(wo):[];
  var done=APPROVALS.filter(function(x){return x.run===R.id;});
  var dod=items.length?'<div class="panel" style="margin-bottom:14px"'+fut("work orders")+'><div class="panel-h"><div style="flex:1;min-width:0"><h3>Definition of done</h3>'+
     '<p class="muted" style="margin:2px 0 0;font-size:12px">From <a class="mono" href="'+woUrl(wo)+'">'+h(wo.id)+'</a>. A claim is the agent’s word. An acceptance is a person’s.</p></div></div>'+
     '<div class="tw"><table data-lt="off"><thead><tr><th>Item</th><th>State</th><th>Evidence</th></tr></thead><tbody>'+items.map(function(it,i){var c=(wo.claims||[])[i];
       return '<tr><td>'+h(it.t)+'</td><td>'+(c&&c.ok?'<span class="b b-allowed"><span class="d"></span>accepted</span>':c?'<span class="b b-approval"><span class="d"></span>claimed</span>':'<span class="b b-q"><span class="d"></span>open</span>')+'</td>'+
         '<td style="font-size:12px">'+(c?h(c.ev):'<span class="dim">—</span>')+'</td></tr>';}).join("")+'</tbody></table></div></div>':'';
  var ap=done.length?'<div class="panel" style="margin-bottom:14px"><div class="panel-h"><h3>Approvals</h3></div><div class="panel-b">'+done.map(approvalCardSm).join("")+'</div></div>':'';
  var seg=compacted&&!S.seg[R.id]?'<div class="warn" style="margin-bottom:14px"><b>Compacted.</b> Frame nodes for this run left the graph after the thirteen-month hot window. The archive segment holds the same bytes, written once at seal.</div>':'';
  return seg+dod+ap+issuesTab(R)+linkedWork(R)+chainTab(R);
}

/* ============================== Steering ==============================
   Sources, Assignments, Compiler and Proposals. Sources lists durable material. The Compiler, an
   agent's Steering tab and a run's Decision trace show the frames the assembler resolved from it. A
   source row links to the frames it emits, and a frame row links back to its source (D2). */
var STG_TABS=[["sources","Sources"],["assignments","Assignments"],["compiler","Compiler"],["proposals","Proposals"]];
var SRC_FILTERS=[["","All"],["record","Steering records"],["doc","Documents"],["skill","Skills"],["agent","Agent definitions"],
  ["instruction","Instructions"],["glossary","Glossary"],["memory","Memory"],["policy","Policy"],["mandate","Mandates"],["toolbelt","Toolbelts"]];
/* An old tab or shelf still lands where it went (docs/fleet-operations-routes.md). */
var STG_OLD_TAB={library:"sources",records:"sources",skills:"sources",memory:"sources",ontology:"sources",instructions:"sources",
  preview:"compiler",deliveries:"assignments"};
var STG_OLD_FILTER={records:"record",skills:"skill",memory:"memory",ontology:"glossary",instructions:"instruction"};
function stgHash(t,wslug){
  var base="#/"+ORG.slug+"/"+(wslug||S.ws)+"/steering";
  if(t==="gates"||t==="policy") return "#/"+ORG.slug+"/"+(wslug||S.ws)+"/tools/policy";
  if(STG_OLD_FILTER[t]) return base+"?kind="+STG_OLD_FILTER[t];
  t=STG_OLD_TAB[t]||t;
  if(t==="prs") return base+"/proposals/prs";
  if(t==="compiler") return base+"/compiler/"+encodeURIComponent(S.pv.agent);
  if(t==="assignments"||t==="proposals") return base+"/"+t;
  return base+(S.srcKind?"?kind="+S.srcKind:"");
}
function stgTab(t){
  if(STG_OLD_FILTER[t]) S.srcKind=STG_OLD_FILTER[t];
  var hsh=stgHash(t);
  /* inside a scenario the address belongs to the scenario, so a Steering tab re-renders in place */
  if(S.scn&&!/\/tools\//.test(hsh)){ S.tab.steering=STG_OLD_TAB[t]||t; render(); return; }
  if(location.hash===hsh) render(); else go(hsh);
}
function srcKindPick(k){ S.srcKind=k; stgTab("sources"); }
function srcUrl(kind,id,wslug){ return "#/"+ORG.slug+"/"+(wslug||S.ws)+"/steering/sources/"+kind+"/"+encodeURIComponent(id); }

/* ---- every source in a workspace, in one shape ---- */
function recType(kind,force){ var t=REC_TYPE[String(kind||"rule").toLowerCase()]||"constraint"; return t==="constraint"&&force==="info"?"context":t; }
function one(t){ var o={}; o[t]=1; return o; }
function wsAgentsOf(wslug){ return AGENTS.filter(function(a){return a.ws===wslug;}); }
function agentRepo(a){ return stgAgent(defSlug(a)).repo; }
/* Which agents a source can reach, read off its scope alone. The Compiler decides what a brief selects. */
function reachOf(o){
  if(o.agentsList) return function(a){return o.agentsList.indexOf(defSlug(a))>=0||o.agentsList.indexOf(a.key)>=0;};
  if(o.scope==="agent") return function(a){return defSlug(a)===o.agent||a.key===o.agent;};
  if(o.scope==="repository") return function(a){return agentRepo(a)===o.repo;};
  return function(){return true;};
}
function steeringSources(wslug){
  var out=[], main=(wsBySlug(wslug)||ws()).main;
  function add(o){ o.emitN=Object.keys(o.emits).reduce(function(s,k){return s+o.emits[k];},0); o.reach=reachOf(o); out.push(o); }
  if(wslug==="core-platform"){
    var seen={};
    /* newest publication first, so a record merged a moment ago leads the list */
    RECORDS.slice().sort(function(x,y){return String(y.pub||"")<String(x.pub||"")?-1:String(y.pub||"")>String(x.pub||"")?1:0;}).forEach(function(r){
      seen[r.id]=1; var on=r.status==="published";
      add({g:"record",kind:"record",id:r.id,title:r.st,path:".oxagen/rules/"+r.id+".toml",emits:on?one(recType(r.kind,r.force)):{},force:r.force,
        scope:stgScope(r),repo:r.repo||(stgScope(r)==="repository"?main:null),agent:r.agent,version:r.commit||"",hash:r.hash||"",status:on?"published":"archived",pend:!!S.recPending[r.id],
        href:srcUrl("record",r.id,wslug),home:"Steering"});});
    STEER_BUNDLE.rules.forEach(function(b){
      if(seen[b.id]||(b.since||0)>STEER_BUNDLE.v) return;
      add({g:"record",kind:"record",id:b.id,title:b.st,path:".oxagen/rules/"+b.id+".toml",emits:one(recType("rule",b.force)),force:b.force,
        scope:stgScope(b),repo:b.repo,agent:b.agent,version:"bundle v"+STEER_BUNDLE.v,hash:STEER_BUNDLE.digest[STEER_BUNDLE.v]||"",status:"published",
        href:srcUrl("record",b.id,wslug),home:"Steering"});});
  }
  docsFor(wslug).forEach(function(d){
    var em={}; if(d.status!=="superseded") d.sections.forEach(function(x){if(x.emits)em[x.emits]=(em[x.emits]||0)+1;});
    add({g:"doc",kind:d.kind,id:d.id,title:d.title,path:d.path,emits:em,scope:"repository",repo:d.repo,version:d.commit,hash:srcHash(d.id+"@"+d.commit),
      status:d.status,why:d.status==="superseded"?"superseded by "+d.supersededBy:"",href:srcUrl(d.kind,d.id,wslug),home:"Steering",future:"vision and ADR sources"});});
  if(SK_ON[wslug]){
    SKILLS.forEach(function(s){
      var B=(SOURCES.bundles||{})[s.id], em={procedure:1}, ok=s.state==="ok";
      if(B){ if(B.references.length) em.context=B.references.length; if(B.entrypoints.length) em.capability=B.entrypoints.length; }
      add({g:"skill",kind:"skill",id:s.id,title:s.st,path:s.path.replace(/SKILL\.md$/,""),emits:ok?em:{},scope:"workspace",version:s.ver,hash:s.digest,
        status:s.retiring?"retiring":ok?"approved":s.state==="scope"?"out of scope":"unapproved",why:ok?"":s.state==="scope"?"scoped to another workspace":"no person approved its digest",
        pend:!!s.retiring,
        href:srcUrl("skill",s.id,wslug),home:"Steering"});});
    (SOURCES.withheld||[]).filter(function(x){return (x.ws||"core-platform")===wslug;}).forEach(function(x){
      add({g:"skill",kind:"skill",id:x.id,title:x.why,path:".oxagen/skills/"+x.id.split(".").pop()+"/",emits:{},scope:"workspace",version:x.ver,hash:"",
        status:"withheld",why:"withheld as "+x.reason,href:srcUrl("skill",x.id,wslug),home:"Steering"});});
  }
  wsAgentsOf(wslug).forEach(function(a){
    var slug=defSlug(a);
    add({g:"agent",kind:"agent",id:".oxagen/agents/"+slug+".toml",title:a.name+" instructions",path:".oxagen/agents/"+slug+".toml",emits:{procedure:1},
      scope:"agent",agent:slug,version:a.commit||"main",hash:"",status:"in force",href:"#/"+ORG.slug+"/"+a.ws+"/agents/"+slug+"/source",home:"Agents"});});
  STG_PREVIEW.instructions.filter(function(x){return stgInWs(x,wslug);}).forEach(function(x){
    add({g:"instruction",kind:"instruction",id:x.id,title:x.body,path:"workspace settings",emits:{procedure:1},force:x.force,scope:stgScope(x),
      version:x.valid_from||"",hash:x.hash||"",status:"in force",href:srcUrl("instruction",x.id,wslug),home:"Steering"});});
  stgOntology(wslug).forEach(function(x){
    var at=String(x.provenance||"").split(" @ ");
    add({g:"glossary",kind:"glossary",id:x.id,title:(x.term?x.term+": ":"")+x.body,path:at[0],emits:{context:1},force:x.force,scope:stgScope(x),
      version:at[1]||x.valid_from||"",hash:x.hash||"",status:x.retiring?"retiring":x.valid_from==="pending the merge"?"pending merge":"published",
      href:srcUrl("glossary",x.id,wslug),home:"Steering"});});
  stgMemory(wslug).forEach(function(x){
    add({g:"memory",kind:"memory",id:x.id,title:x.body,path:x.provenance,emits:{context:1},force:x.force,scope:stgScope(x),agent:x.agent,
      version:x.valid_from||"",hash:x.hash||"",status:x.yieldsTo?"yields":"recorded",why:x.yieldsTo?"yields to "+x.yieldsTo:"",
      href:srcUrl("memory",x.id,wslug),home:"Steering"});});
  stgGates(wslug).forEach(function(x){
    var ed=gateHome(x,wslug);
    add({g:"policy",kind:"policy",id:x.id,title:x.body,path:x.source||"",emits:{constraint:1},force:x.force,scope:stgScope(x),repo:x.repo,agent:x.agent,
      agentsList:x.agents||null,version:String(x.source||"").split(" · ")[0],hash:x.hash||"",status:"in force",href:ed[1],home:ed[0]});});
  MANDATES.filter(function(m){var a=agent(m.agent);return a&&a.ws===wslug;}).forEach(function(m){
    var a=agent(m.agent), slug=defSlug(a), on=m.status==="active";
    add({g:"mandate",kind:"mandate",id:m.id,title:m.purpose,path:"granted by "+m.by,emits:on?{delegation:1}:{},scope:"agent",agent:slug,
      version:"grant v"+(m.grantV||3),hash:"",status:m.status,href:"#/"+ORG.slug+"/"+a.ws+"/agents/"+slug+"/permissions?delegation="+encodeURIComponent(m.id),
      home:"Agent › Permissions"});});
  TOOLBELTS.forEach(function(b){
    var who=Object.keys(TOOLBELT_ASSIGN).filter(function(k){var a=agent(k);return a&&a.ws===wslug&&TOOLBELT_ASSIGN[k].indexOf(b.id)>=0;});
    if(!who.length) return;
    var shown=b.tools.filter(function(t){return !HARNESS_TOOL_RE.test(t);}).length;
    add({g:"toolbelt",kind:"toolbelt",id:b.id,title:b.name+". "+b.desc,path:b.tools.length+" tools",emits:shown?{capability:shown}:{},scope:"assigned",
      agentsList:who,version:"updated "+String(b.updated).slice(0,10),hash:"",status:"in force",href:"#/"+ORG.slug+"/"+wslug+"/tools/toolbelts?belt="+encodeURIComponent(b.id),home:"Tools › Toolbelts"});});
  return out;
}
/* A gate notice is managed where its gate is edited: the policy, a kill switch, the record whose grant
   compiled it, or the agent's Permissions for a mandate. */
function gateHome(x,wslug){
  var b="#/"+ORG.slug+"/"+wslug;
  if(x.edit==="tools/switches") return ["Tools › Kill switches",b+"/tools/switches"];
  if(x.edit==="record"){ var id=String(x.source||"").split(" · ")[0]; return ["Steering record",srcUrl("record",id,wslug)]; }
  if(x.edit==="mandate"){ var m=MANDATES.filter(function(y){return y.id===x.source;})[0], a=m&&agent(m.agent);
    return ["Agent › Permissions",a?"#/"+ORG.slug+"/"+a.ws+"/agents/"+defSlug(a)+"/permissions?delegation="+encodeURIComponent(m.id):b+"/agents"]; }
  if(x.edit==="agents") return ["Agents",b+"/agents"];
  return ["Tools › Policy",b+"/tools/policy"];
}
function emitsCell(o){
  if(!o.emitN) return '<span class="dim">nothing</span>'+(o.why?'<div class="dim" style="font-size:11px">'+h(o.why)+'</div>':'');
  return '<div class="ft-strip" style="margin:0;gap:5px">'+FT.map(function(x){var n=o.emits[x.id];
    return n?'<span class="ft-n">'+ftBadge(x.id)+(n>1?'<b>'+n+'</b>':'')+'</span>':'';}).join("")+'</div>';
}
var SRC_ST={published:"b-allowed",approved:"b-allowed","in force":"b-allowed",retiring:"b-approval","pending merge":"b-approval",accepted:"b-allowed",registered:"b-allowed",active:"b-allowed",
  recorded:"b-q",yields:"b-q",archived:"b-q",superseded:"b-q",withheld:"b-denied",unapproved:"b-denied","out of scope":"b-q",expired:"b-q",revoked:"b-q"};
function srcStatus(o){ return '<span class="b '+(SRC_ST[o.status]||"b-q")+'"><span class="d"></span>'+h(o.status)+'</span>'+(o.pend?' <span class="b b-approval">pull request open</span>':''); }
function scopeCell(o){
  return h(o.scope)+(o.repo?'<span class="sub mono">'+h(o.repo)+'</span>':'')+(o.agent&&o.scope==="agent"?'<span class="sub mono">'+h(o.agent)+'</span>':'')+
    (o.agentsList?'<span class="sub">'+o.agentsList.length+' named agent'+(o.agentsList.length===1?'':'s')+'</span>':'');
}
function stgSourcesTab(w){
  var all=steeringSources(w.slug), k=S.srcKind||"", L=k?all.filter(function(o){return o.g===k;}):all, A=wsAgentsOf(w.slug);
  var cnt={}; all.forEach(function(o){cnt[o.g]=(cnt[o.g]||0)+1;});
  var chips='<div class="kf stg-seg" role="group" aria-label="Source kind">'+SRC_FILTERS.filter(function(x){return !x[0]||cnt[x[0]];}).map(function(x){
    return '<button class="btn sm" aria-pressed="'+(k===x[0])+'" onclick="srcKindPick(\''+x[0]+'\')">'+h(x[1])+' <span class="dim">'+(x[0]?cnt[x[0]]:all.length)+'</span></button>';}).join("")+'</div>';
  var em={}, silent=0; L.forEach(function(o){ if(!o.emitN) silent++; Object.keys(o.emits).forEach(function(t){em[t]=(em[t]||0)+o.emits[t];}); });
  var strip='<div class="ft-strip" style="margin:0">'+FT.map(function(x){return em[x.id]?'<span class="ft-n">'+ftBadge(x.id)+'<b>'+em[x.id]+'</b></span>':'';}).join("")+'</div>';
  var rows=L.map(function(o){
    var n=A.filter(o.reach).length;
    return '<tr class="click" onclick="go(\''+o.href+'\')"'+(o.future?fut(o.future):'')+'>'+
     '<td data-v="'+h(o.id)+'" style="max-width:46ch"><span class="dim" style="font-size:11px">'+h((SRC_KIND[o.kind]||{l:o.kind}).l)+'</span>'+
       '<div class="src-t">'+h(o.title)+'</div><a class="mono sub" href="'+o.href+'" onclick="event.stopPropagation()">'+h(o.id)+'</a></td>'+
     '<td'+fut("frame types")+'>'+emitsCell(o)+'</td>'+
     '<td data-v="'+h(o.scope)+'">'+scopeCell(o)+'</td>'+
     '<td class="mono" style="font-size:11px;white-space:nowrap">'+h(shortHash(o.version))+(o.hash?'<div class="dim">#'+h(String(o.hash).replace(/^sha256:/,"").slice(0,8))+'</div>':'')+'</td>'+
     '<td data-v="'+h(o.status)+'">'+srcStatus(o)+'</td>'+
     '<td class="num">'+(o.emitN?n.toLocaleString():'<span class="dim">0</span>')+'</td>'+
     '<td style="font-size:12px">'+(o.home==="Steering"?'<span class="dim">Steering</span>':'<a href="'+o.href+'" onclick="event.stopPropagation()">'+h(o.home)+'</a>')+'</td></tr>';}).join("");
  return chips+
   '<div class="panel"><div class="panel-h"><div style="flex:1;min-width:0"><h3>'+h(k?SRC_FILTERS.filter(function(x){return x[0]===k;})[0][1]:"All sources")+'</h3>'+
     '<p class="muted" style="margin:2px 0 0;font-size:12px">'+L.length+' source'+(L.length===1?'':'s')+(silent?', '+silent+' emitting nothing':'')+
     '. Agents counts the agents in '+h(w.name)+' each source can reach by its scope.</p></div><div'+fut("frame types")+'>'+strip+'</div></div>'+
   '<div class="tw"><table><thead><tr><th>Source</th><th'+fut("frame types")+'>Emits</th><th>Scope</th><th>Version</th><th>Status</th><th class="num">Agents</th><th>Managed in</th></tr></thead><tbody>'+
   rows+'</tbody></table></div></div>';
}

/* ---- Assignments: which sources reach which agents ---- */
function typeCounts(L){ var em={}; L.forEach(function(o){Object.keys(o.emits).forEach(function(t){em[t]=(em[t]||0)+o.emits[t];});}); return em; }
function typeCountStrip(em){
  var any=FT.some(function(x){return em[x.id];});
  return any?'<div class="ft-strip" style="margin:0;gap:5px">'+FT.map(function(x){return em[x.id]?'<span class="ft-n">'+ftBadge(x.id)+'<b>'+em[x.id]+'</b></span>':'';}).join("")+'</div>':'<span class="dim">none</span>';
}
function stgAssignmentsTab(w){
  var all=steeringSources(w.slug).filter(function(o){return o.emitN;}), A=wsAgentsOf(w.slug);
  var groups={}, order=[];
  all.forEach(function(o){
    var key=o.agentsList?"named":o.scope==="agent"?"agent":o.scope==="repository"?"repo:"+o.repo:o.scope==="org"?"org":"workspace";
    if(!groups[key]){groups[key]={key:key,L:[],o:o};order.push(key);} groups[key].L.push(o);});
  var rank=function(k){return k==="org"?0:k==="workspace"?1:/^repo:/.test(k)?2:k==="agent"?3:4;};
  order.sort(function(x,y){return (rank(x)-rank(y))||(x<y?-1:1);});
  var byScope=order.map(function(key){
    var g=groups[key], o=g.o, n=A.filter(function(a){return g.L.some(function(x){return x.reach(a);});}).length;
    var label=key==="org"?"Organization":key==="workspace"?"Workspace "+h(w.name):/^repo:/.test(key)?'Repository <span class="mono">'+h(o.repo)+'</span>'
      :key==="agent"?'One agent each<div class="dim" style="font-size:11.5px">agent definitions, agent-scoped records and memory, mandates</div>'
      :'Named agents<div class="dim" style="font-size:11.5px">toolbelt assignments and kill switches that name agents</div>';
    return '<tr><td>'+label+'</td><td class="num">'+g.L.length+'</td><td'+fut("frame types")+'>'+typeCountStrip(typeCounts(g.L))+'</td><td class="num">'+n.toLocaleString()+'</td></tr>';}).join("");
  var agRows=A.map(function(a){
    var mine=all.filter(function(o){return o.reach(a);}), slug=defSlug(a), obs=a.tier==="observe";
    return '<tr><td>'+agentCard(a,{layout:"list",sub:"",sz:22})+'</td><td>'+tierBadge(a.tier)+(obs?'<div class="dim" style="font-size:11px">assembled, not delivered</div>':'')+'</td>'+
     '<td class="num">'+mine.length+'</td><td'+fut("frame types")+'>'+typeCountStrip(typeCounts(mine))+'</td>'+
     '<td><a href="#/'+ORG.slug+'/'+w.slug+'/steering/compiler/'+encodeURIComponent(slug)+'">Compiler</a></td></tr>';}).join("");
  return '<div class="panel" style="margin-bottom:14px"><div class="panel-h"><div style="flex:1;min-width:0"><h3>By scope</h3>'+
    '<p class="muted" style="margin:2px 0 0;font-size:12px">Frames each scope can emit, and the agents in '+h(w.name)+' it reaches. A narrower scope narrows a wider one and never widens it.</p></div></div>'+
    '<div class="tw"><table data-lt="off"><thead><tr><th>Scope</th><th class="num">Sources</th><th>Frames by type</th><th class="num">Agents</th></tr></thead><tbody>'+byScope+'</tbody></table></div></div>'+
   '<div class="panel"><div class="panel-h"><div style="flex:1;min-width:0"><h3>By agent</h3>'+
    '<p class="muted" style="margin:2px 0 0;font-size:12px">What each agent is eligible for before budget. The Compiler shows what one brief selects.</p></div></div>'+
    '<div class="tw"><table><thead><tr><th>Agent</th><th>Tier</th><th class="num">Sources</th><th>Frames by type</th><th>Resolve</th></tr></thead><tbody>'+agRows+'</tbody></table></div></div>';
}

/* ---- the envelope, shared by the Compiler and the Decision trace ---- */
function envelopeHtml(E,keyPre){
  var ft=ftOn(keyPre), pickT=function(F){return ft?F.filter(function(f){return f.type===ft;}):F;};
  var env=POINTS.map(function(p){
    var F=pickT(E.byPoint[p[0]]); if(!F.length) return "";
    var tk=F.reduce(function(s,f){return s+(f.tok||0);},0);
    return '<div class="dt-point"><div class="dt-point-h"><b>'+h(p[1])+'</b><span class="dim">'+h(p[2])+'</span>'+
      '<span class="sp mono dim" style="font-size:11px">'+F.length+' frame'+(F.length===1?'':'s')+(tk?' · '+tokn(tk)+' tok':'')+'</span></div>'+
      frameTable(F,{cap:ft?0:4,key:keyPre+"."+p[0]})+'</div>';}).join("");
  var meters='<div class="dt-meters">'+stgMeter("Session-start prefix",E.prefixTok,E.prefixCap,"tok","16 KiB in the signed bundle, header included")+
    stgMeter("Volatile selection",E.volatileTok,E.volatileCap,"tok","picked for this brief under the workspace budget")+'</div>';
  return meters+typeStrip(E.sel,keyPre)+env;
}
function exclusionsHtml(E,keyPre){
  var ft=ftOn(keyPre), L=ft?E.cut.filter(function(f){return f.type===ft;}):E.cut;
  return frameTable(L,{reason:true,point:true,cap:ft?0:6,key:keyPre+".cut",empty:ft?"Nothing of this type was excluded.":"Nothing was excluded."});
}

/* ---- Compiler: resolve one agent and one brief, send nothing ---- */
function pvAgent(slug){ S.pv.agent=slug; var A=stgAgent(slug); if(S.pv.text==null) S.pv.preset=A.prompt; stgTab("compiler"); }
/* typing repaints the result and nothing else, so the caret stays where it is */
function pvInput(v){ S.pv.text=v; var o=el("pvOut"); if(o){ o.innerHTML=compilerOut(); listify(); if(isPhone()) cardTables(); } }
function compilerOut(){
  var E=resolveEnvelope(S.pv.agent,pvPrompt(),{});
  return '<div class="dt"><section class="dt-sec"'+fut("frame types and per-frame provenance")+'><div class="dt-h"><span class="dt-n">1</span><div style="min-width:0;flex:1"><h3>Envelope</h3>'+
     '<p>'+ftLead(E.sel,"cmp","SteeringFrames")+' for <span class="mono">'+h(E.slug)+'</span> in <span class="mono">'+h(E.repo)+'</span>.</p></div></div>'+envelopeHtml(E,"cmp")+'</section>'+
   '<section class="dt-sec"'+fut("a capability that resolves without delivering (#3879)")+'><div class="dt-h"><span class="dt-n">2</span><div style="min-width:0;flex:1"><h3>Exclusions</h3>'+
     '<p>'+ftLead(E.cut,"cmp","resolved")+' and not delivered, each with its reason.</p></div></div>'+exclusionsHtml(E,"cmp")+'</section></div>';
}
function stgCompilerTab(w){
  var L=AGENTS.filter(function(a){return a.ws===w.slug;}).map(function(a){return stgAgent(defSlug(a));}).filter(Boolean);
  if(!L.length) return '<div class="panel pad"><p class="muted" style="margin:0">No agent is registered in this workspace.</p></div>';
  var cur=agentBySlug(S.pv.agent);
  if(!cur||cur.ws!==w.slug){ S.pv.agent=L[0].slug; S.pv.text=null; S.pv.preset=L[0].prompt||null; }
  var A=stgAgent(S.pv.agent), chips=STG_PREVIEW.prompts.filter(function(p){return (p.ws||"core-platform")===w.slug;});
  return '<div class="panel pad" style="margin-bottom:14px"><div class="stg-pv">'+
   '<div class="field" style="margin:0"><label for="pvSel">Agent</label><select id="pvSel" onchange="pvAgent(this.value)">'+L.map(function(x){
     return '<option value="'+h(x.slug)+'"'+(x.slug===S.pv.agent?' selected':'')+'>'+h(x.a.name)+' · '+h(x.a.harnessLabel)+'</option>';}).join("")+'</select>'+
    '<div class="hint">'+tierBadge(A.a.tier)+' works in <span class="mono">'+h(A.repo)+'</span></div></div>'+
   '<div class="field" style="margin:0"><label for="pvText">Brief</label><textarea id="pvText" rows="2" oninput="pvInput(this.value)" placeholder="What a work order would send">'+h(pvPrompt())+'</textarea>'+
    '<div class="hint">Sends nothing. Nothing here reaches an agent.</div></div></div>'+
   (chips.length?'<div class="kf" role="group" aria-label="Pick a brief" style="padding:10px 0 0;border:0">'+chips.map(function(p){
     return '<button class="btn sm" aria-pressed="'+(S.pv.text==null&&S.pv.preset===p.id)+'" onclick="pvPreset(\''+p.id+'\')">'+h(p.text)+'</button>';}).join("")+'</div>':'')+'</div>'+
   '<div id="pvOut">'+compilerOut()+'</div>';
}

/* ---- Proposals and their pull requests ---- */
function stgProposalsTab(w,t){
  var openPRs=stgOpenCount();
  var seg='<div class="kf stg-seg" role="group" aria-label="Proposals or pull requests">'+
   '<button class="btn sm" aria-pressed="'+(t==="proposals")+'" onclick="stgTab(\'proposals\')">Proposals <span class="dim">'+PROPOSALS.length+'</span></button>'+
   '<button class="btn sm" aria-pressed="'+(t==="prs")+'" onclick="stgTab(\'prs\')">Pull requests <span class="dim">'+openPRs+'</span></button>'+
   '<span class="dim" style="font-size:12px;margin-left:6px;align-self:center">A proposal becomes a pull request. A merge publishes it.</span></div>';
  if(t==="prs") return seg+ctxprTab();
  var sel=S.prpSel&&prpById(S.prpSel);
  if(sel) return seg+prpDetail(sel);
  return seg+'<div class="panel"><div class="panel-h"><div style="flex:1;min-width:0"><h3>Proposals</h3>'+
   '<p class="muted" style="margin:2px 0 0;font-size:12px">Candidates from memory, findings, steers and people. A proposal steers nothing until its pull request merges.</p></div></div>'+
   '<div class="recs">'+PROPOSALS.map(function(p){
     var s=prpStats(p.id);
     return recordCard({kind:p.kind,force:p.force,st:p.st,scope:"workspace",id:p.lineage},{
       right:prpBadge(p)+'<button class="btn sm" onclick="S.prpSel=\''+h(p.id)+'\';render()">Review</button>',
       meta:'<span>from <b>'+h(p.from)+'</b></span><span>'+h(s.meta.support?s.meta.support(s):p.support)+'</span><span class="mono">'+h(p.id)+'</span>'});}).join("")+
   '</div></div>';
}

/* ---- the Steering page ---- */
function stgOpenPrCount(){ return stgOpenCount(); }
/* The Steering nav count: what waits on a person there, the same figure the Proposals tab shows. */
function stgNavCount(wslug){ return PROPOSALS.length+recprOpenCount(); }
function newSourceBtn(primary){ return '<button class="btn'+(primary?' primary':'')+'" onclick="openDialog(\'newsrc\')">New source</button>'; }
function pSteering(){
  var w=ws(), t=tab("steering","sources");
  if(!{sources:1,assignments:1,compiler:1,proposals:1,prs:1}[t]) t="sources";
  if(S.state==="loading") return skeleton();
  if(S.state==="error") return errorState("Steering","503 record_index_unavailable");
  if(S.state==="denied") return deniedState("this workspace’s steering","steering.read on "+w.slug);
  var on=t==="prs"?"proposals":t;
  var all=steeringSources(w.slug);
  var n={sources:all.length,assignments:"",compiler:"",proposals:PROPOSALS.length+stgOpenCount()};
  var tabs='<div class="tabs stg-tabs" role="tablist" aria-label="Steering">'+STG_TABS.map(function(x){
    return '<button class="tab" role="tab" aria-selected="'+(on===x[0])+'" onclick="stgTab(\''+x[0]+'\')">'+x[1]+
     (n[x[0]]?'<span class="n">'+n[x[0]]+'</span>':'')+'</button>';}).join("")+'</div>';
  var body=S.state==="empty"?emptyState("Nothing steers this workspace yet",
      "A source becomes one by being merged into "+h(w.main)+", or recorded by a governed write. Nothing saved here is a source until then.",newSourceBtn(true))
    :t==="assignments"?stgAssignmentsTab(w):t==="compiler"?stgCompilerTab(w):t==="sources"?stgSourcesTab(w):stgProposalsTab(w,t);
  return '<div class="phead"><div class="t"><p class="eyebrow">'+h(w.name)+'</p><h1>Steering</h1>'+
   '<p>Every source that can steer an agent here, and the frames it emits.</p></div>'+
   '<div class="acts">'+govChip(w)+(SK_ON[w.slug]?'<button class="btn sm gov-chip" onclick="openDialog(\'skcfg\')" title="How skills resolve in this workspace">Skills: <span class="mono">'+h(SK_CFG.ver)+'</span></button>':'')+
    '<button class="btn" onclick="wzOpen(\'import\')">Import Markdown</button>'+newSourceBtn(t!=="prs")+'</div></div>'+tabs+body;
}
DLG_EXT.newsrc=function(){
  var w=ws();
  var cards=[
   ["Steering record","A rule, constraint, procedure, fact or preference in .oxagen/rules/. It publishes when its pull request merges.","closeDialog();wzOpen('record')","Write one"],
   ["Document","Name a document, such as docs/VISION.md or an ADR, in .oxagen/sources.toml, and say which sections emit which frame types.","openDialog('srcreg')","Register one"],
   ["Skill","A folder under .oxagen/skills/ with skill.toml, SKILL.md, references and optional entrypoints. Oxagen describes an entrypoint and never runs it.","closeDialog();wzOpen('skill')","Add one"],
   ["Glossary term","One term the way this workspace uses it, in .oxagen/ontology/.","openDialog('ontnew')","Define one"]];
  return {t:"New source",s:"Every source changes by a pull request against "+w.main,w:true,
   b:'<div class="wz-pick" style="grid-template-columns:1fr">'+cards.map(function(c){
     return '<button class="wz-card" onclick="'+c[2]+'"><span class="tx"><b>'+h(c[0])+'</b><span class="d">'+h(c[1])+'</span></span><span class="b b-q">'+h(c[3])+'</span></button>';}).join("")+'</div>'+
    '<div class="note" style="margin-top:12px">An agent appends memory, and Import Markdown writes it from a file. A memory becomes a Steering record only through a proposal. Policy, mandates and toolbelts are managed in Tools and on the agent’s Permissions tab.</div>',
   f:'<button class="btn" onclick="closeDialog()">Cancel</button>'};
};
DLG_EXT.srcreg=function(){
  var R=SOURCES.registration||{};
  var toml='[[source]]\nid = "ADR-034"\nkind = "adr"\npath = "docs/adr/ADR-034-release-freeze.md"\n\n  [[source.section]]\n  heading = "Decision"\n  emits = "procedure"\n  force = "should"\n\n  [[source.section]]\n  heading = "Invariants"\n  emits = "invariant"\n  enforced_by = "gate.never-merge"';
  return {t:"Register a document",s:R.path+" on "+R.repo,w:true,
   b:'<p style="margin:0 0 10px">A document emits frames only from the sections this file names. Oxagen reads the declared structure and never asks a model what a document means.</p>'+
    '<pre'+fut(".oxagen/sources.toml")+'>'+h(toml)+'</pre>'+
    '<div class="note" style="margin-top:10px">Last changed by <span class="mono">'+h(R.pr||"")+'</span>, merged '+h(R.merged||"")+'. An invariant needs a section the ADR declares as its invariants, and a superseded ADR emits nothing.</div>',
   f:'<button class="btn" onclick="closeDialog()">Cancel</button><button class="btn primary" onclick="closeDialog();act(\'Pull request opened on \'+ws().main+\' to register ADR-034. It emits nothing until that merges.\',\'gold\')">Open the pull request</button>'};
};

/* ---- one source ----
   A Steering record and a skill keep their editors. A document shows its registered sections, and a
   memory, a glossary term and the workspace instructions show their body. Every kind lists the frames
   it emits, with the hashes a run will name, and the agents its scope reaches. */
function srcRowOf(kind,id,wslug){
  var L=steeringSources(wslug||S.ws), g=kind==="adr"||kind==="vision"?"doc":kind;
  for(var i=0;i<L.length;i++){ if(L[i].g===g&&L[i].id===id) return L[i]; }
  return null;
}
function srcFramesOf(o){
  if(!o||!o.emitN) return [];
  var wslug=S.ws;
  if(o.g==="doc"){ var d=docsFor(wslug).filter(function(x){return x.id===o.id;})[0]; if(!d) return [];
    return d.sections.filter(function(x){return x.emits;}).map(function(x){var vol=x.force==="may"||x.force==="info";
      return frameOf(x.emits,docSrc(d),x.body,{force:x.force,point:vol?"prompt_submit":"session_start",enforced:x.enforcedBy||null});}); }
  if(o.g==="skill"){ var s=skillOf(o.id), B=(SOURCES.bundles||{})[o.id], src={kind:"skill",id:o.id,version:o.version,path:o.path}; if(!s) return [];
    var out=[frameOf("procedure",src,"SKILL.md: "+s.st,{force:"info",point:"files",tok:B?B.instructions.tok:s.tokens,hash:s.digest})];
    var desc=stgItemById(wslug,"skill:"+o.id); if(desc) out.unshift(itemFrame(desc,"prompt_submit"));
    if(B){ B.references.forEach(function(r){out.push(frameOf("context",src,r.path+": "+r.body,{force:"info",point:"files",tok:r.tok}));});
      B.entrypoints.forEach(function(e){out.push(frameOf("capability",src,e.name+" "+e.args+" → "+e.returns+". "+e.desc,{force:"info",point:"files",tok:0,hash:e.digest,enforced:"descriptor"}));}); }
    return out; }
  var it=stgItemById(wslug,o.id)||stgItemById(wslug,"skill:"+o.id);
  if(it) return [itemFrame(it,it.force==="must"||it.force==="should"?"session_start":"prompt_submit")];
  return [frameOf(Object.keys(o.emits)[0],{kind:o.kind,id:o.id,version:o.version,path:o.path},o.title,{force:o.force||"should"})];
}
function srcFramesPanel(o){
  var L=srcFramesOf(o);
  return '<div class="panel" style="margin-bottom:14px"'+fut("frame types and per-frame provenance")+'><div class="panel-h"><div style="flex:1;min-width:0"><h3>Frames it emits</h3>'+
   '<p class="muted" style="margin:2px 0 0;font-size:12px">'+(L.length?L.length+' at this version. The same source at the same version always emits these frames, with these hashes.':'None. '+h(o&&o.why?o.why:'It emits nothing at this version.'))+'</p></div></div>'+
   (L.length?'<ul class="sf-list">'+L.map(function(f){
     return '<li><div class="sf-h">'+ftBadge(f.type)+forceBadge(f.force)+'<span class="dim">'+h(POINT_LABEL[f.point]||f.point)+'</span>'+
       (f.tok?'<span class="sp mono dim">'+tokn(f.tok)+' tok</span>':'<span class="sp mono dim">descriptor</span>')+'</div>'+
       '<div class="sf-b">'+h(f.body)+'</div>'+(f.enforced&&f.type!=="capability"?'<div class="dim" style="font-size:11px">enforced by '+h(f.enforced)+'</div>':'')+
       '<div class="mono dim sf-id">'+h(f.id)+'</div></li>';}).join("")+'</ul>':'')+'</div>';
}
function srcReachPanel(o){
  var A=o?wsAgentsOf(S.ws).filter(o.reach):[], first=A.slice(0,5);
  return '<div class="panel" style="margin-bottom:14px"><div class="panel-h"><div style="flex:1;min-width:0"><h3>Agents it reaches</h3>'+
   '<p class="muted" style="margin:2px 0 0;font-size:12px">'+(o&&o.emitN?A.length+' in '+h(ws().name)+' by its scope, '+h(o.scope)+'.':'None while it emits nothing.')+'</p></div></div>'+
   (o&&o.emitN&&first.length?'<div class="panel-b" style="display:grid;gap:8px">'+first.map(function(a){
     return '<div class="row" style="justify-content:space-between;gap:8px">'+agentCard(a,{layout:"list",sub:"",sz:22,link:true})+
       '<a style="font-size:12px" href="#/'+ORG.slug+'/'+S.ws+'/steering/compiler/'+encodeURIComponent(defSlug(a))+'">Compiler</a></div>';}).join("")+
     (A.length>first.length?'<a style="font-size:12px" href="#/'+ORG.slug+'/'+S.ws+'/steering/assignments">'+(A.length-first.length)+' more on Assignments</a>':'')+'</div>':'')+'</div>';
}
function srcHead(o,kindLabel,title,badges,lead,acts){
  var back=stgHash("sources").replace(/\?.*$/,"")+"?kind="+(o?o.g:"");
  return '<div class="phead"><div class="t"><p class="eyebrow"><a href="'+back+'">Steering</a> · '+h(kindLabel)+'</p>'+
   '<h1'+(title.length>90?' style="font-size:19px"':'')+'>'+h(title)+'</h1>'+
   '<div class="row" style="margin-top:8px">'+badges+'</div>'+(lead?'<p style="margin-top:8px">'+lead+'</p>':'')+'</div>'+
   '<div class="acts">'+(acts||'')+'</div></div>';
}
function pSource(r){
  var w=ws(), kind=r.kind, id=r.id;
  if(S.state==="loading") return skeleton();
  if(S.state==="error") return errorState("This source","503 record_index_unavailable");
  if(S.state==="denied") return deniedState("this source","steering.read on "+w.slug);
  if(kind==="record") return pRecord({id:encodeURIComponent(id)});
  if(kind==="skill") return skillOf(id)?pSkillSource({id:encodeURIComponent(id)}):pSkillWithheld(id);
  var o=srcRowOf(kind,id,w.slug);
  if(!o) return emptyState("No source here","Nothing in "+h(w.name)+" is named "+h(id)+". It may have been archived, or it belongs to another workspace.",
    '<button class="btn" onclick="go(\''+stgHash("sources")+'\')">Back to Sources</button>');
  if(o.g==="doc") return pDocSource(o);
  return pItemSource(o);
}
function pDocSource(o){
  var w=ws(), d=docsFor(w.slug).filter(function(x){return x.id===o.id;})[0], R=SOURCES.registration||{};
  var sup=d.status==="superseded";
  var secs='<div class="panel" style="margin-bottom:14px"><div class="panel-h"><div style="flex:1;min-width:0"><h3>Sections</h3>'+
   '<p class="muted" style="margin:2px 0 0;font-size:12px">What <span class="mono">'+h(R.path)+'</span> says each section emits. A section it does not name emits nothing.</p></div></div>'+
   '<div class="tw"><table data-lt="off"><thead><tr><th>Section</th><th>Emits</th><th>Force</th><th>Text</th></tr></thead><tbody>'+
   d.sections.map(function(x){return '<tr><td><b style="font-weight:500">'+h(x.h)+'</b></td><td>'+(x.emits&&!sup?ftBadge(x.emits):'<span class="dim">nothing</span>')+
     (x.enforcedBy?'<div class="dim" style="font-size:11px;margin-top:3px">enforced by '+h(x.enforcedBy)+'</div>':'')+'</td>'+
     '<td>'+(x.force?forceBadge(x.force):'<span class="dim">—</span>')+'</td><td style="font-size:12.5px;max-width:52ch">'+h(x.body)+'</td></tr>';}).join("")+'</tbody></table></div></div>';
  var hist='<div class="panel"><div class="panel-h"><h3>Record</h3></div><div class="panel-b"><dl class="kv">'+
   '<dt>File</dt><dd><span class="mono">'+h(d.path)+'</span> on '+h(d.repo)+'</dd>'+
   '<dt>Version</dt><dd><span class="mono">'+h(d.commit)+'</span>, '+h(d.updated)+'</dd>'+
   '<dt>Owner</dt><dd>'+h((PEOPLE[d.owner]||{name:d.owner}).name)+'</dd>'+
   '<dt>Registered by</dt><dd><span class="mono">'+h(R.pr)+'</span>, merged '+h(R.merged)+'</dd>'+
   (d.supersedes?'<dt>Supersedes</dt><dd><a class="mono" href="'+srcUrl("adr",d.supersedes)+'">'+h(d.supersedes)+'</a></dd>':'')+
   (d.supersededBy?'<dt>Superseded by</dt><dd><a class="mono" href="'+srcUrl("adr",d.supersededBy)+'">'+h(d.supersededBy)+'</a></dd>':'')+
   '</dl></div></div>';
  var badges=srcStatus(o)+'<span class="b b-q mono">'+h(d.id)+'</span><span class="b b-q mono">@'+h(d.commit)+'</span><span class="b b-q">repository <span class="mono">'+h(d.repo)+'</span></span>';
  return '<div'+fut("vision and ADR sources")+'>'+srcHead(o,SRC_KIND[d.kind].l,d.title,badges,
    sup?'Superseded by '+h(d.supersededBy)+', so it emits nothing. Runs that received its frames before still name them.':'An '+(d.kind==="adr"?'accepted ADR':'registered document')+' emits frames only from the sections the registration names.',
    '<button class="btn" onclick="act(\'Opened '+h(d.path)+' on '+h(d.repo)+'. A change is a pull request.\')">Open the file</button>')+
   '<div class="crec-grid"><div>'+secs+hist+'</div><div>'+srcFramesPanel(o)+srcReachPanel(o)+'</div></div></div>';
}
function pItemSource(o){
  var w=ws(), lab=(SRC_KIND[o.kind]||{l:o.kind}).l, m=o.g==="memory"?MEMORY.filter(function(x){return x.id===o.id;})[0]:null;
  var badges=srcStatus(o)+(o.force?forceBadge(o.force):'')+'<span class="b b-q">'+h(o.scope)+'</span><span class="b b-q mono">'+h(o.version)+'</span>'+
    (o.hash?'<span class="b b-q mono">'+h(shortHash(o.hash))+'</span>':'');
  var lead=o.g==="memory"?(/ · import by /.test(m.provenance||"")?'Imported from a Markdown file.':'Appended by an agent’s run.')+' It competes as context at force <span class="mono">'+h(o.force)+'</span> and never above <span class="mono">may</span>. It becomes a Steering record only through a proposal.'
    :o.g==="glossary"?'A term the way this workspace uses it. It changes by a pull request against '+h(w.main)+'.'
    :'Workspace settings. It reaches every agent in '+h(w.name)+' as a procedure at force <span class="mono">should</span>.';
  var acts=o.g==="memory"?'<button class="btn" onclick="openDialog(\'memforget\',\''+h(o.id)+'\')">Forget</button>'+
      /* A memory the fold already proposed has its proposal. A second one would argue the same record twice. */
      (m.proposedAs?'<button class="btn primary" onclick="memOpenProposal(\''+h(m.proposedAs)+'\')">Open the proposal</button>'
       :'<button class="btn primary" onclick="memPromote(\''+h(o.id)+'\')">Propose as a Steering record</button>')
    :o.g==="glossary"?'<button class="btn primary" onclick="openDialog(\'ontedit\',\''+h(o.id)+'\')">Propose a change</button>':'';
  var rec='<div class="panel"><div class="panel-h"><h3>Record</h3></div><div class="panel-b"><dl class="kv">'+
   '<dt>Kind</dt><dd>'+h(lab)+'</dd><dt>Where</dt><dd><span class="mono" style="font-size:12px">'+h(o.path)+'</span></dd>'+
   (m?'<dt>Recalled</dt><dd>'+h(m.recalls30)+' times in 30 days, last '+h(m.lastRecalled)+'</dd>':'')+
   (m&&m.yieldsTo?'<dt>Yields to</dt><dd><a class="mono" href="'+srcUrl("record",m.yieldsTo)+'">'+h(m.yieldsTo)+'</a>, a published <span class="mono">must</span>, and is excluded as <span class="mono">overridden_by_must</span></dd>':'')+
   '</dl></div></div>';
  var says=m&&memSayings(m).length?'<div class="panel" style="margin-top:14px" data-mem-page-says><div class="panel-h"><h3>Sayings</h3>'+
    '<span class="b b-q" style="margin-left:auto">'+memSayings(m).length+'</span></div><div class="panel-b">'+memSaysList(m,false)+'</div></div>':'';
  return srcHead(o,lab,o.title,badges,lead,acts)+
   '<div class="crec-grid"><div>'+rec+says+'</div><div>'+srcFramesPanel(o)+srcReachPanel(o)+'</div></div>';
}
function pSkillWithheld(id){
  var o=srcRowOf("skill",id,S.ws), x=(SOURCES.withheld||[]).filter(function(y){return y.id===id;})[0];
  if(!o||!x) return emptyState("No skill here","Nothing in this workspace is named "+h(id)+".",'<button class="btn" onclick="go(\''+stgHash("sources")+'\')">Back to Sources</button>');
  return srcHead(o,"Skill",id,srcStatus(o)+'<span class="b b-q mono">@'+h(x.ver)+'</span><span class="b b-q mono">'+h(x.reason)+'</span>',
    h(x.why)+' A withheld skill emits nothing. The agent is told how many skills were withheld and why, never which.',
    x.reason==="unapproved_digest"?'<button class="btn primary" onclick="act(\'Approval requested for '+h(id)+'@'+h(x.ver)+'. It stays withheld until a person approves its digest.\',\'gold\')">Request approval</button>':'')+
   '<div class="crec-grid"><div>'+srcFramesPanel(o)+'</div><div>'+srcReachPanel(o)+'</div></div>';
}

/* ============================== Spend ==============================
   Overview, Budgets and Optimization. One grouping replaces the seven tabs and the drill pages, and a
   row opens a side panel on the same page (D14). Findings live in Work. No person is scored or
   ranked: operator habits are written as rules the operator can adopt (D15). */
var SPEND_BY=[["work","Work order"],["operator","Operator"],["agent","Agent"],["model","Model"],["tool","Tool"],["cost_center","Cost center"]];
/* ADR-142: the label an agent's month rolled up to (its own, else its workspace's), else the reserved key
   ~none. The labels come from cost-centers.json through ccReady() in engine.js, the same ones the
   Organization page and an agent's Identity tab edit, so the three never disagree. */
function ccOf(k){ ccReady(); return CC.rolledBy[k]||"~none"; }
function spendHref2(by,key,view){
  var base="#/"+ORG.slug+"/"+S.ws+"/spend"+(view&&view!=="overview"?"/"+view:""), q=[];
  if(!view||view==="overview"){ if(by&&by!=="work") q.push("by="+by); if(key) q.push("key="+encodeURIComponent(key)); }
  return base+(q.length?"?"+q.join("&"):"");
}
function spendBy(by){ go(spendHref2(by,null)); }
function spendKey(key){ go(spendHref2(S.spendBy,key===S.spendKey?null:key)); }
function spendView(v){ go(spendHref2(S.spendBy,null,v)); }
function spendPartGo(x){ go("#/"+ORG.slug+"/"+S.ws+"/spend/optimization"+(x&&x!=="waste"?"?part="+x:"")); }
/* The month to date by day, from the daily rollup. Seeded from the month's total so it never moves. */
function spendDays(total){
  var n=24, seed=11, w=[], s=0, i;
  function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  for(i=0;i<n;i++){ var d=new Date(Date.UTC(2026,8,i+1)).getUTCDay(), x=(d===0||d===6?0.45:1)*(0.8+rnd()*0.45); w.push(x); s+=x; }
  return w.map(function(x,i){return {day:i+1,usd:total*x/s};});
}
function spendDayChart(total){
  var D=spendDays(total), mx=Math.max.apply(null,D.map(function(d){return d.usd;}));
  return '<div class="panel" style="margin-bottom:14px"><div class="panel-h"><div style="flex:1;min-width:0"><h3>September by day</h3>'+
   '<p class="muted" style="margin:2px 0 0;font-size:12px">From the daily rollup, rebuilt from frames. Weekends run lighter.</p></div>'+
   '<span class="sp mono dim" style="font-size:11px">'+fmt$(total)+' to date</span></div>'+
   '<div class="panel-b"><div class="sp-days" role="img" aria-label="Spend by day, 1 to 24 September">'+D.map(function(d){
     return '<i style="height:'+Math.max(4,Math.round(d.usd/mx*100))+'%"'+tipAttr("Sep "+d.day+" · "+fmt$(d.usd))+'></i>';}).join("")+'</div>'+
   '<div class="sp-days-x"><span>Sep 1</span><span>Sep 12</span><span>Sep 24</span></div></div></div>';
}
/* ---- the grouped table ---- */
function spendRows(by){
  if(by==="operator") return SPEND.byOperator.map(function(o){var p=PEOPLE[o.p]||{name:o.p,role:""}, t=operatorTok(o.p);
    return {key:o.p,usd:n$(o.spend),cells:['<b style="font-weight:500">'+h(p.name)+'</b><div class="mono dim" style="font-size:11px">'+h(p.role||"")+'</div>',
      '<td class="num">'+o.agents+'</td>','<td class="num">'+o.runs.toLocaleString()+'</td>','<td class="num">'+tokn(t.total)+'</td>','<td class="num">'+per(t.cacheRate)+'</td>',
      '<td style="min-width:150px"><div class="bar"><i style="width:'+Math.round(o.used*100)+'%;background:'+(o.used>0.8?"var(--st-critical)":"var(--st-allowed)")+'"></i></div><div class="dim" style="font-size:11px">'+per(o.used)+' of '+usd(o.budget)+'</div></td>']};});
  if(by==="agent") return SPEND.byAgent.map(function(a){var t=agentTok(a.k);
    return {key:a.k,usd:n$(a.spend),cells:[agentCard(a.k,{key:a.k,sub:"",sz:22}),'<td class="num">'+a.runs.toLocaleString()+'</td>',
      '<td class="num">'+(t?tokn(t.perRun):'—')+'</td>','<td class="num">'+(t?per(t.cacheRate):'—')+'</td>',
      '<td><span class="b b-'+(a.trend.charAt(0)==="-"?"allowed":"approval")+'">'+h(a.trend)+'</span></td>']};});
  if(by==="model") return spendModelRows().map(function(m){var k=spendKeyOf(m.m,m.tier);
    return {key:m.m,usd:n$(m.spend),cells:['<span class="tkey" style="font-size:12px">'+h(m.m)+'</span>'+(m.route?'<div class="dim" style="font-size:11px">Oxagen’s own work · '+h(m.provider)+'</div>':''),
      '<td class="mono" style="font-size:11.5px">'+(k?h(k.id):'—')+'</td>','<td class="num">'+(m.calls!=null?Number(m.calls).toLocaleString():'—')+'</td>',
      '<td class="num">'+(m.cache==null?'<span class="dim">—</span>':per(m.cache))+'</td>']};});
  if(by==="tool") return SPEND.byTool.filter(function(t){return t.perCall!==null;}).map(function(t){
    return {key:t.t,usd:+t.spend,cells:['<span class="mono" style="font-size:12px">'+h(t.t)+'</span><div class="dim" style="font-size:11px">'+h(t.s)+'</div>',
      '<td class="num">'+t.calls.toLocaleString()+'</td>','<td class="num">'+t.runs.toLocaleString()+'</td>','<td class="num">'+fmt$(t.perCall)+'</td>']};});
  if(by==="cost_center"){ var g={}; SPEND.byAgent.forEach(function(a){var c=ccOf(a.k); g[c]=g[c]||{usd:0,agents:0,ws:{}}; g[c].usd+=n$(a.spend); g[c].agents++; var x=agent(a.k); if(x) g[c].ws[x.ws]=1;});
    return Object.keys(g).map(function(c){return {key:c,usd:g[c].usd,cells:['<span class="mono">'+h(c)+'</span>'+(c==="~none"?'<div class="dim" style="font-size:11px">no agent or workspace label</div>':ccFind(c)?'':' <span class="b b-q">deleted</span>'),
      '<td class="num">'+g[c].agents+'</td>','<td>'+Object.keys(g[c].ws).map(function(x){return '<span class="mono" style="font-size:11.5px">'+h(x)+'</span>';}).join(", ")+'</td>']};}); }
  return WORKORDERS.map(function(w){var s=woSpend(w), items=woItems(w), ok=(w.claims||[]).filter(function(c){return c&&c.ok;}).length, who=PEOPLE[w.by]||{name:w.by};
    return {key:w.id,usd:s,cells:['<span class="mono" style="font-size:12px">'+h(w.id)+'</span><div style="font-size:12px">'+h(w.title)+'</div>',
      '<td>'+woKindBadge(w)+'</td>','<td style="font-size:12px">'+h(who.name)+'</td>','<td class="num">'+(w.runs||[]).length+'</td>',
      '<td class="num">'+(items.length?ok+' of '+items.length:'<span class="dim">—</span>')+'</td>','<td class="num">'+(ok?fmt$(s/ok):'<span class="dim">—</span>')+'</td>']};});
}
var SPEND_HEAD={work:["Work order","Kind","Sent by","<span class=\"num\">Runs</span>","Items accepted","Per accepted item"],
  operator:["Operator","Agents","Runs","Tokens","Cache hit","Budget position"],agent:["Agent","Runs","Tokens per run","Cache hit","Trend"],
  model:["Model","Provider key","Model calls","Cache hit"],tool:["Tool","Calls","Runs","Per call"],cost_center:["Cost center","Agents","Workspaces"]};
var SPEND_NUM={work:[3,4,5],operator:[1,2,3,4],agent:[1,2,3],model:[2,3],tool:[1,2,3],cost_center:[1]};
function spendTable(by){
  /* with a row open, the table narrows to the name and the money, and the side panel carries the rest */
  var R=spendRows(by).sort(function(a,b){return b.usd-a.usd;}), tot=R.reduce(function(s,r){return s+r.usd;},0), H=SPEND_HEAD[by], narrow=!!S.spendKey;
  if(narrow){ H=H.slice(0,1); R=R.map(function(r){return {key:r.key,usd:r.usd,cells:r.cells.slice(0,1)};}); }
  var heads=H.map(function(x,i){var num=SPEND_NUM[by].indexOf(i)>=0;return '<th'+(num?' class="num"':'')+'>'+x.replace(/<[^>]+>/g,"")+'</th>';}).join("");
  var share=by!=="work";
  return '<div class="tw"><table><thead><tr>'+heads+'<th class="num">Spend</th>'+(share?'<th class="num">Share</th>':'')+'</tr></thead><tbody>'+R.map(function(r){
    var on=S.spendKey===r.key;
    return '<tr class="click'+(on?' on':'')+'" aria-selected="'+on+'" onclick="spendKey(\''+h(String(r.key)).replace(/'/g,"\\'")+'\')"><td>'+r.cells[0]+'</td>'+r.cells.slice(1).join("")+
      '<td class="num">'+fmt$(r.usd)+'</td>'+(share?'<td class="num dim">'+(tot?per(r.usd/tot):'—')+'</td>':'')+'</tr>';}).join("")+'</tbody></table></div>';
}
/* ---- the side panel for one row ---- */
function spendSide(by,key){
  var row=spendRows(by).filter(function(r){return String(r.key)===String(key);})[0]; if(!row) return '';
  var head='', kv='', foot='', title=key;
  if(by==="operator"){ var p=PEOPLE[key]||{name:key}, o=SPEND.byOperator.filter(function(x){return x.p===key;})[0], mine=AGENTS.filter(function(a){return a.operator===key;});
    var wos=WORKORDERS.filter(function(w){return w.by===key&&w.kind==="dispatched";}), acc=0, wsp=0;
    wos.forEach(function(w){acc+=(w.claims||[]).filter(function(c){return c&&c.ok;}).length; wsp+=woSpend(w);});
    title=p.name;
    kv='<dt>Role</dt><dd class="mono">'+h(p.role||"")+'</dd><dt>Agents</dt><dd>'+o.agents+' operated, '+mine.length+' in view</dd><dt>Runs</dt><dd>'+o.runs.toLocaleString()+'</dd>'+
      '<dt>Spend</dt><dd>'+usd(o.spend)+'</dd><dt>Budget</dt><dd>'+per(o.used)+' of '+usd(o.budget)+'</dd>'+
      '<dt>Bounded tasks</dt><dd'+fut("work orders")+'>'+(wos.length?wos.length+' work order'+(wos.length===1?'':'s')+' sent, '+acc+' item'+(acc===1?'':'s')+' accepted'+(acc?', '+fmt$(wsp/acc)+' per accepted item':''):'none sent in view')+'</dd>';
    foot='<p class="muted" style="margin:0 0 8px;font-size:12px">The record, not a grade. Habits and the rules they suggest are on Optimization.</p>'+
      '<button class="btn sm" onclick="spendPartGo(\'habits\')">Open the habits</button>'; }
  else if(by==="agent"){ var a=agent(key), t=agentTok(key), ag=SPEND.byAgent.filter(function(x){return x.k===key;})[0], rec=a?coachAgent(a):[];
    head=agentCard(a||key,{layout:"compact",key:key}); title="";
    kv='<dt>Runs</dt><dd>'+ag.runs.toLocaleString()+'</dd><dt>Spend</dt><dd>'+usd(ag.spend)+', '+h(ag.trend)+' on last month</dd>'+
      (t?'<dt>Tokens per run</dt><dd>'+tokn(t.perRun)+'</dd><dt>Cache hit</dt><dd>'+per(t.cacheRate)+'</dd><dt>Tool definitions</dt><dd>'+per(t.shares.tools)+' of every request</dd>':'')+
      '<dt>Cost center</dt><dd class="mono">'+h(ccOf(key))+'</dd>';
    foot=(rec.length?'<p class="muted" style="margin:0 0 8px;font-size:12px">'+rec.length+' recommendation'+(rec.length===1?'':'s')+' for this agent on Optimization.</p>':'')+
      '<div class="row">'+(a?'<button class="btn sm" onclick="go(agentUrl(agent(\''+h(key)+'\')))">Open the agent</button>':'')+(rec.length?'<button class="btn sm" onclick="spendPartGo(\'agents\')">Recommendations</button>':'')+'</div>'; }
  else if(by==="model"){ var m=spendModelRows().filter(function(x){return x.m===key;})[0], k=spendKeyOf(m.m,m.tier);
    kv='<dt>Model calls</dt><dd>'+(m.calls!=null?Number(m.calls).toLocaleString():'—')+'</dd><dt>Spend</dt><dd>'+usd(m.spend)+'</dd><dt>Cache hit</dt><dd>'+(m.cache==null?'—':per(m.cache))+'</dd>'+
      '<dt>Provider key</dt><dd>'+(k?'<span class="mono">'+h(k.src)+'</span>':'—')+'</dd>';
    foot='<button class="btn sm" onclick="go(\'#/'+ORG.slug+'\')">Model routes</button>'; }
  else if(by==="tool"){ var x=SPEND.byTool.filter(function(y){return y.t===key;})[0];
    kv='<dt>Kind</dt><dd>'+h(x.s)+'</dd><dt>Calls</dt><dd>'+x.calls.toLocaleString()+' in '+x.runs.toLocaleString()+' runs</dd><dt>Per call</dt><dd>'+fmt$(x.perCall)+'</dd><dt>Per run</dt><dd>'+fmt$(x.perRun)+'</dd>'+
      (x.note?'<dt>Record</dt><dd>'+h(x.note)+'</dd>':''); }
  else if(by==="cost_center"){ var L=SPEND.byAgent.filter(function(a){return ccOf(a.k)===key;});
    kv='<dt>Agents</dt><dd>'+L.length+'</dd><dt>Spend</dt><dd>'+fmt$(row.usd)+'</dd><dt>Resolved from</dt><dd>'+(key==="~none"?'no label on the agent or its workspace':'the agent’s label, else its workspace’s')+'</dd>';
    foot='<button class="btn sm" onclick="'+(ccCanEdit()?'openDialog(\'ccexport\')':'ccDenied(\'can export the chargeback statement\')')+'">Export the statement</button>'; }
  else { var w=woById(key), rs=w?(w.runs||[]):[];
    title=w?w.title:key;
    kv='<dt>Work order</dt><dd><a class="mono" href="'+woUrl(w)+'">'+h(w.id)+'</a> '+woKindBadge(w)+'</dd><dt>Sent by</dt><dd>'+h((PEOPLE[w.by]||{name:w.by}).name)+'</dd>'+
      '<dt>Runs</dt><dd>'+(rs.length?rs.map(function(x){return runLink(x.run);}).join("<br>"):'none')+'</dd><dt>Spend</dt><dd>'+fmt$(row.usd)+(w.cap?' of a '+usd(w.cap)+' cap':'')+'</dd>';
    foot='<button class="btn sm" onclick="go(woUrl(woById(\''+h(key)+'\')))">Open the work order</button>'; }
  return '<aside class="panel sp-side" aria-label="'+h(title||key)+'"><div class="panel-h"><div style="flex:1;min-width:0">'+(head||'<h3>'+h(title)+'</h3>')+'</div>'+
    '<button class="btn sm" onclick="spendKey(null)" aria-label="Close">Close</button></div>'+
    '<div class="panel-b"><dl class="kv">'+kv+'</dl>'+(foot?'<div style="margin-top:12px">'+foot+'</div>':'')+'</div></aside>';
}
function spendOverview(){
  var by=S.spendBy||"work", key=S.spendKey, total=spendMonthTotal();
  var seg='<div class="kf stg-seg" role="group" aria-label="Group by"><span class="dim" style="font-size:12px;align-self:center;margin-right:4px">Group by</span>'+
   SPEND_BY.map(function(x){return '<button class="btn sm" aria-pressed="'+(by===x[0])+'" onclick="spendBy(\''+x[0]+'\')">'+h(x[1])+'</button>';}).join("")+'</div>';
  var note=by==="work"?'<div class="panel-b" style="border-top:1px solid var(--border)"><p class="muted" style="margin:0;font-size:12px">'+WORKORDERS.length.toLocaleString()+' work orders in view, most of them direct: a run started from an operator’s own terminal. The rest of the month’s runs roll up the same way.</p></div>'
    :by==="cost_center"?'<div class="panel-b" style="border-top:1px solid var(--border)"><p class="muted" style="margin:0;font-size:12px">A run with no label is charged to <span class="mono">~none</span>, so the centers sum to the month (ADR-142).</p></div>':'';
  var table='<div class="panel"'+(by==="work"?fut("work orders"):'')+'><div class="panel-h"><div style="flex:1;min-width:0"><h3>By '+h(SPEND_BY.filter(function(x){return x[0]===by;})[0][1].toLowerCase())+'</h3>'+
   '<p class="muted" style="margin:2px 0 0;font-size:12px">Select a row to open it here. There is no drill page.</p></div></div>'+spendTable(by)+note+'</div>';
  return spendDayChart(total)+seg+(key?'<div class="sp-cols"><div style="min-width:0">'+table+'</div>'+spendSide(by,key)+'</div>':table);
}
function spendBudgets(){
  return '<div class="panel"><div class="panel-h"><h3>Budgets</h3>'+
   '<button class="btn sm" style="margin-left:auto" onclick="openDialog(\'budget\')">Set a budget</button></div><div class="tw"><table>'+
   '<thead><tr><th>Scope</th><th>Period</th><th class="num">Limit</th><th class="num">Used</th><th>Mode</th><th>Position</th><th></th></tr></thead><tbody>'+
   SPEND.budgets.map(function(b,i){
    var u=n$(b.used)/n$(b.limit);
    return '<tr><td class="tkey" style="font-size:12px">'+h(b.scope)+'</td><td>'+h(b.period)+'</td>'+
     '<td class="num">'+usd(b.limit)+'</td><td class="num">'+usd(b.used)+'</td>'+
     '<td><span class="b b-'+(b.mode==="hard"?"denied":"approval")+'">'+h(b.mode)+'</span></td>'+
     '<td style="min-width:170px"><div class="bar"><i style="width:'+Math.round(u*100)+'%;background:'+(u>0.8?"var(--st-critical)":"var(--st-allowed)")+'"></i></div>'+
     '<div class="dim" style="font-size:11px">'+per(u)+'</div></td>'+
     '<td class="num" style="white-space:nowrap"><button class="btn sm" onclick="openDialog(\'budgetedit\',\''+i+'\')">Edit</button> '+
     '<button class="btn sm danger" onclick="openDialog(\'budgetdel\',\''+i+'\')">Remove</button></td></tr>';}).join("")+
   '</tbody></table></div><div class="panel-b"><div class="note">A hard budget is checked at each hook boundary, from a running counter fed by the usage each harness reports. A breach is a <span class="mono">policy.decision</span> frame and a pause, never a silent stop. A soft budget sends a notice.</div></div></div>';
}
/* ---- Optimization ---- */
/* A prompt habit is read off the recorded turns of an operator's runs. It is written as a rule the
   operator can adopt, never as a grade, and the list is in the operators' alphabetical order. */
function operatorHabits(p){
  var who=PEOPLE[p]; if(!who) return [];
  return coachOperator(p).filter(function(c){return c.k==="prompts";}).map(function(c){
    var reread=/re-read/i.test(c.title);
    return {p:p,name:who.name,habit:reread?"Briefs ask the agent to confirm what it already has":"Sessions take more than one prompt",
      record:c.signal,usd:c.usd,
      rule:reread?"Write a fact the agent needs into a Steering record once, and leave it out of the brief.":"Settle the design and write down the missing context before the run, so the first prompt carries the task.",
      act:reread?["Propose the record","wzOpen('record')"]:null};});
}
function spendOptimization(){
  var w=ws(), WT=wsTok(w.slug);
  var mine=AGENTS.filter(function(a){return a.ws===w.slug;});
  var ops={}; mine.forEach(function(a){if(PEOPLE[a.operator]) ops[a.operator]=1;});
  var habits=[]; Object.keys(ops).sort(function(x,y){return PEOPLE[x].name<PEOPLE[y].name?-1:1;}).forEach(function(p){habits=habits.concat(operatorHabits(p));});
  var recs=[]; mine.forEach(function(a){coachAgent(a).forEach(function(c){recs.push({a:a,c:c});});});
  recs.sort(function(x,y){return y.c.usd-x.c.usd;});
  var recHtml='<div class="panel" style="margin-bottom:14px"><div class="panel-h"><div style="flex:1;min-width:0"><h3>Recommendations for agents</h3>'+
    '<p class="muted" style="margin:2px 0 0;font-size:12px">'+recs.length+' across '+mine.length+' agents in '+h(w.name)+'. Each names the signal it came from and the change that moves it.</p></div></div>'+
    '<div class="tw"><table><thead><tr><th>Agent</th><th>Recommendation</th><th>The record</th><th class="num">A month</th><th></th></tr></thead><tbody>'+
    recs.map(function(x){return '<tr><td>'+agentCard(x.a,{sub:"",sz:22,link:true})+'</td><td><b style="font-weight:500">'+h(x.c.title)+'</b><div class="dim" style="font-size:11.5px;max-width:52ch">'+h(x.c.say)+'</div></td>'+
      '<td class="mono dim" style="font-size:11px;max-width:30ch">'+x.c.signal+'</td><td class="num">'+(x.c.usd?fmt$(x.c.usd):'<span class="dim">—</span>')+'</td>'+
      '<td><button class="btn sm" onclick="'+x.c.act[1]+'">'+h(x.c.act[0])+'</button></td></tr>';}).join("")+'</tbody></table></div></div>';
  var habHtml='<div class="panel" style="margin-bottom:14px" id="habits"><div class="panel-h"><div style="flex:1;min-width:0"><h3>Operator habits</h3>'+
    '<p class="muted" style="margin:2px 0 0;font-size:12px">Read from the recorded turns and written as rules to adopt. Listed by name. The record shows what happened. It never grades the person.</p></div></div>'+
    (habits.length?'<div class="hab-list">'+habits.map(function(x){
      return '<article class="hab"><div class="hab-h"><b>'+h(x.name)+'</b><span class="dim">'+h(x.habit)+'</span></div>'+
       '<p class="mono dim hab-rec">'+x.record+(x.usd?' · '+fmt$(x.usd)+' in the record':'')+'</p>'+
       '<blockquote class="hab-rule">'+h(x.rule)+'</blockquote>'+
       '<div class="row">'+(x.act?'<button class="btn sm" onclick="'+x.act[1]+'">'+h(x.act[0])+'</button>':'')+
       '<button class="btn sm" onclick="act(\'Rule shared with '+h(x.name)+'. It quotes the turns it was read from.\')">Share with '+h(x.name.split(" ")[0])+'</button></div></article>';}).join("")+'</div>'
     :'<div class="panel-b"><p class="muted" style="margin:0">No prompt habit stands out in this workspace’s recorded turns.</p></div>')+'</div>';
  var part=S.spendPart||"waste";
  var seg='<div class="kf stg-seg" role="group" aria-label="Optimization">'+[["waste","Wasted spend"],["tokens","Tokens and cache"],["agents","Agents",recs.length],["habits","Operator habits",habits.length]].map(function(x){
    return '<button class="btn sm" aria-pressed="'+(part===x[0])+'" onclick="spendPartGo(\''+x[0]+'\')">'+h(x[1])+(x[2]!=null?' <span class="dim">'+x[2]+'</span>':'')+'</button>';}).join("")+'</div>';
  return seg+(part==="tokens"?spendTokens(WT):part==="agents"?recHtml:part==="habits"?habHtml:spendWaste("body"));
}
/* The share is computed from the two figures it relates, so the tile cannot disagree with them. */
function wasteShareText(){ var x=n$(SPEND.wasteTotal)/spendMonthTotal()*100; return (x<10?x.toFixed(1):Math.round(x))+"%"; }
function pSpend(){
  var w=ws(), t=tab("spend","overview"), WT=wsTok(w.slug);
  if(!{overview:1,budgets:1,optimization:1}[t]) t="overview";
  if(S.state==="loading") return skeleton();
  if(S.state==="error") return errorState("Spend","504 rollup_rebuild_in_progress");
  if(S.state==="denied") return deniedState("this workspace’s spend","spend.read on "+w.slug);
  if(S.state==="empty") return emptyState("No spend to report yet",
    "Rollups are rebuilt from frames. With no model call recorded there is nothing to roll up, and nothing billable.",
    '<button class="btn" onclick="go(\'#/'+ORG.slug+'/'+w.slug+'/work\')">Open Work</button>');
  var tabs='<div class="tabs" role="tablist">'+[["overview","Overview"],["budgets","Budgets",SPEND.budgets.length],["optimization","Optimization"]].map(function(x){
    return '<button class="tab" role="tab" aria-selected="'+(t===x[0])+'" onclick="spendView(\''+x[0]+'\')">'+x[1]+(x[2]?'<span class="n">'+x[2]+'</span>':'')+'</button>';}).join("")+'</div>';
  var strip='<div class="grid g4" style="margin-bottom:16px">'+
   '<div class="stat"><span class="k">Spend</span><span class="v">'+usd(fmt2(spendMonthTotal()))+'</span><span class="s"><span class="basis">gateway_observed</span> + <span class="basis">client_attested</span> · USD</span></div>'+
   '<div class="stat"><span class="k">Tokens</span><span class="v">'+tokn(WT.total)+'</span><span class="s">'+per(WT.cacheRate)+' served from cache</span></div>'+
   '<div class="stat"><span class="k">Observed by the gateway</span><span class="v">'+per(WT.observed)+'</span><span class="s">of tokens counted by the proxy</span></div>'+
   '<div class="stat click" onclick="spendView(\'optimization\')"><span class="k">Wasted</span><span class="v" style="color:var(--st-critical)">'+usd(SPEND.wasteTotal)+'</span><span class="s">'+wasteShareText()+' of spend · Optimization</span></div></div>';
  var body=t==="budgets"?spendBudgets():t==="optimization"?spendOptimization():spendOverview();
  return '<div class="phead"><div class="t"><p class="eyebrow">'+h(w.name)+'</p><h1>Spend</h1>'+
   '<p>What the tokens bought, with the basis on every number.</p></div>'+
   '<div class="acts"><button class="btn" onclick="openDialog(\'spendexport\')">Export report</button>'+
   '<button class="btn primary" onclick="openDialog(\'budget\')">Set a budget</button></div></div>'+strip+tabs+body;
}

/* ============================== Agents ==============================
   The fleet as one population (D10): the tiles the Fleet page held, the roster, Steer and Register
   agent. An agent's Steering tab shows the frames it receives, Permissions carries every mandate as
   Delegation (D11), and Activity lists the work orders it worked. */
function agentsTiles(w,list){
  var rc=wsRunCounts(w.slug), live={length:rc.live}, parked={length:rc.parked};
  var wait=APPROVALS.filter(function(x){var r=run(x.run);return apState(x.id).status==="pending"&&(!r||r.ws===w.slug);});
  var b=SPEND.budgets.filter(function(x){return x.scope==="workspace · "+w.slug;})[0], used=b?n$(b.used)/n$(b.limit):null;
  var held=MANDATES.filter(function(m){var a=agent(m.agent);return m.status==="active"&&a&&a.ws===w.slug;});
  return '<div class="grid g4" style="margin-bottom:16px">'+
   '<div class="stat click" onclick="go(\'#/'+ORG.slug+'/'+w.slug+'/work/orders\')"><span class="k">Live now</span><span class="v">'+live.length+'</span><span class="s">'+
     (parked.length?parked.length+' parked on a person · ':'')+list.length+' agents registered</span></div>'+
   '<div class="stat click" onclick="apdToggle(true)"><span class="k">Waiting on you</span><span class="v">'+wait.length+'</span><span class="s">approval'+(wait.length===1?'':'s')+' in the drawer</span></div>'+
   '<div class="stat click" onclick="go(\'#/'+ORG.slug+'/'+w.slug+'/spend/budgets\')"><span class="k">Spend against budget</span><span class="v">'+(b?per(used):'—')+'</span><span class="s">'+
     (b?usd(b.used)+' of '+usd(b.limit)+' · '+h(b.mode)+' · '+h(b.period):'no workspace budget set')+'</span></div>'+
   '<div class="stat"><span class="k">Delegations held</span><span class="v">'+held.length+'</span><span class="s">'+
     (held.length?held.map(function(m){return h(m.agent.split(".").pop());}).join(", "):'no agent here holds a mandate')+'</span></div></div>';
}

/* ---- Steering: the frames this agent receives ---- */
function agentBrief(slug){
  var A=stgAgent(slug), P=STG_PREVIEW.prompts;
  for(var i=0;i<P.length;i++){ if(P[i].id===A.prompt) return P[i].text; }
  return A&&A.a?String(A.a.desc||""):"";
}
function aSteering(a,r){
  var slug=defSlug(a), brief=agentBrief(slug), E=resolveEnvelope(slug,brief,{});
  var srcs={}, order=[];
  E.sel.forEach(function(f){var k=f.src.kind+"|"+f.src.id; if(!srcs[k]){srcs[k]={src:f.src,n:0,types:{}};order.push(k);} srcs[k].n++; srcs[k].types[f.type]=1;});
  var obs=a.tier==="observe";
  var srcRows=order.map(function(k){var x=srcs[k], href=srcHref(x.src);
    return '<tr><td>'+srcCell(x.src)+'</td><td>'+FT.filter(function(t){return x.types[t.id];}).map(function(t){return ftBadge(t.id);}).join(" ")+'</td><td class="num">'+x.n+'</td>'+
      '<td style="font-size:12px">'+h((SRC_KIND[x.src.kind]||{home:""}).home)+'</td></tr>';}).join("");
  return (obs?'<div class="warn" style="margin-bottom:14px"><b>Assembled, not delivered.</b> This agent is on the <span class="mono">observe</span> tier. No hook is installed, so nothing below reaches it.</div>':'')+
   '<div class="dt"><section class="dt-sec"'+fut("frame types and per-frame provenance")+'><div class="dt-h"><span class="dt-n">1</span><div style="min-width:0;flex:1"><h3>What it receives</h3>'+
     '<p>'+ftLead(E.sel,"ag","SteeringFrames")+' for its standing brief'+(brief?', “'+h(brief)+'”':'')+'.</p></div>'+
     '<div class="sp"><a class="btn sm" href="#/'+ORG.slug+'/'+a.ws+'/steering/compiler/'+encodeURIComponent(slug)+'">Open in the Compiler</a></div></div>'+envelopeHtml(E,"ag")+'</section>'+
   '<section class="dt-sec"><div class="dt-h"><span class="dt-n">2</span><div style="min-width:0;flex:1"><h3>Excluded</h3><p>'+ftLead(E.cut,"ag","resolved")+' for this agent and not delivered, each with its reason.</p></div></div>'+exclusionsHtml(E,"ag")+'</section>'+
   '<section class="dt-sec"><div class="dt-h"><span class="dt-n">3</span><div style="min-width:0;flex:1"><h3>Sources</h3><p>'+order.length+' sources reach this agent, each managed where it lives.</p></div></div>'+
     '<div class="tw"><table><thead><tr><th>Source</th><th>Emits here</th><th class="num">Frames</th><th>Managed in</th></tr></thead><tbody>'+srcRows+'</tbody></table></div></section></div>';
}

/* ---- Permissions: roles, budgets, and Delegation ---- */
function aPermissions(a,r){
  return '<div class="grid">'+'<div class="grid g2">'+permRoles(a)+permBudgets(a)+'</div>'+permDelegation(a)+'</div>';
}
function mandateFrame(m){
  return frameOf("delegation",{kind:"mandate",id:m.id,version:"grant v"+(m.grantV||3),path:"granted by "+m.by},
    m.purpose+": up to "+usd(m.perCall)+" "+m.currency+" a call and "+usd(m.perPeriod)+" a "+String(m.period).replace(/ly$/,"")+", "+m.tools+", until "+m.to+". Above "+usd(m.approvalAbove)+" a person approves.",{force:"must",point:"session_start"});
}
function permDelegation(a){
  var mine=MANDATES.filter(function(m){return m.agent===a.key;});
  if(!mine.length) return permMandates(a);
  var sel=S.delegationSel, base='#/'+ORG.slug+'/'+S.ws+'/agents/'+defSlug(a)+'/permissions';
  return '<div class="panel"><div class="panel-h"><div style="flex:1;min-width:0"><h3>Delegation</h3>'+
   '<p class="muted" style="margin:2px 0 0;font-size:12px">Authority a person delegated to this agent. Each active mandate reaches it as a delegation frame, and the gate enforces the same limits on every call.</p></div>'+
   '<span class="b b-approval" style="margin-left:auto"><span class="d"></span>'+mine.filter(function(m){return m.status==="active";}).length+' active</span></div>'+
   mine.map(function(m){
     var on=sel===m.id||mine.length===1, f=mandateFrame(m), P=PEOPLE, grant=m.by+(m.roleAt?' ('+m.roleAt+')':''), usedN=money(m.used), resN=money(m.reserved), cap=money(m.perPeriod);
     var bar='<div class="bar" style="margin-top:4px"><i style="width:'+Math.round(usedN/cap*100)+'%;background:var(--st-allowed)"></i><i style="width:'+Math.round(resN/cap*100)+'%;background:var(--st-approval)"></i></div>';
     return '<div class="dlg-m'+(sel===m.id?' on':'')+'" id="'+h(m.id)+'">'+
      '<div class="dlg-m-h"><span class="mono">'+h(m.id)+'</span><span class="b b-'+(m.status==="active"?'allowed':'q')+'"><span class="d"></span>'+h(m.status)+'</span>'+
       '<span class="dim" style="font-size:12px">'+h(m.purpose)+'</span>'+
       '<span class="sp"><button class="btn sm" onclick="openDialog(\'mandateedit\',\''+h(m.id)+'\')">Change limits</button> '+
       '<button class="btn sm danger" onclick="openDialog(\'mandaterevoke\',\''+h(m.id)+'\')">Revoke</button></span></div>'+
      '<div class="grid g2" style="gap:14px"><dl class="kv">'+
       '<dt>Granted by</dt><dd>'+h(grant)+', second approver '+h(m.second||"none")+'</dd>'+
       '<dt>Window</dt><dd>'+h(m.from)+' to '+h(m.to)+'</dd>'+
       '<dt>Effect</dt><dd class="mono" style="font-size:12px">'+h(m.effect)+'</dd>'+
       '<dt>Limits</dt><dd>'+usd(m.perCall)+' a call · '+usd(m.perPeriod)+' '+h(m.period)+' · '+h(m.callsPerDay)+' calls a day</dd>'+
       '<dt>Position</dt><dd>'+usd(m.used)+' settled, '+usd(m.reserved)+' reserved, <b>'+usd(m.remaining)+'</b> left'+bar+'</dd></dl>'+
      '<dl class="kv"><dt>Tools</dt><dd class="mono" style="font-size:12px">'+h(m.tools)+'</dd>'+
       '<dt>Counterparties</dt><dd>allow <span class="mono">'+h(m.allow)+'</span>, deny <span class="mono">'+h(m.deny)+'</span></dd>'+
       '<dt>Approval</dt><dd>above '+usd(m.approvalAbove)+', always for <span class="mono">'+h(m.alwaysFor)+'</span>, by <span class="mono">'+h(m.approvers)+'</span></dd>'+
       '<dt>SteeringFrame</dt><dd'+fut("delegation frames")+'>'+ftBadge("delegation")+' <span class="mono dim" style="font-size:11px">'+h(f.id)+'</span><div style="font-size:12.5px;margin-top:4px">'+h(f.body)+'</div></dd></dl></div>'+
      (on?'<div class="tw" style="margin-top:10px"><table data-lt="off"><thead><tr><th>When</th><th>Call</th><th class="num">Amount</th><th>State</th><th>External</th><th>Receipt</th></tr></thead><tbody>'+
        (m.ledger||[]).map(function(x){var sb={settled:"allowed",reserved:"approval",released:"denied"}[x.state]||"q";
          return '<tr><td class="mono" style="font-size:11.5px">'+h(x.when)+'</td><td class="mono" style="font-size:11.5px">'+h(x.call)+'</td><td class="num">'+usd(x.amount)+'</td>'+
           '<td><span class="b b-'+sb+'"><span class="d"></span>'+h(x.state)+'</span></td><td class="mono dim" style="font-size:11px">'+h(x.ext)+'</td>'+
           '<td>'+(x.rcp?receiptLink(x.rcp):'<span class="dim">—</span>')+'</td></tr>';}).join("")+'</tbody></table></div>'
       :'<button class="lnk" style="font-size:12px;margin-top:8px" onclick="go(\''+base+'?delegation='+encodeURIComponent(m.id)+'\')">Show the ledger</button>')+
      '</div>';}).join("")+
   '<div class="panel-b"><div class="note">A mandate is the only thing that lets this agent move money. Every draw reserves, then settles or releases. Its tools appear on the belt gated <span class="mono">mandate + approval</span>, never plain <span class="mono">allowed</span>.</div></div></div>';
}

/* ---- Activity: the work orders this agent worked ---- */
function aActivity(a,r){ return '<div class="grid">'+actWork(a)+actAccounting(a)+actIncidents(a)+'</div>'; }
function actWork(a){
  var rr=RUNS.filter(function(x){return x.agent===a.key;});
  if(!rr.length) return '<div class="panel"><div class="panel-h"><h3>Work orders</h3></div><div class="panel-b">'+
   '<p class="muted" style="margin:0;font-size:12.5px">No run of this agent is in view. It has '+a.runs30.toLocaleString()+' in the last 30 days, and every one is in the audit record.</p></div></div>';
  var g={}, order=[];
  rr.forEach(function(x){var w=runParent(x), k=w?w.id:"—"; if(!g[k]){g[k]={w:w,runs:[]};order.push(k);} g[k].runs.push(x);});
  return '<div class="panel"'+fut("work orders")+'><div class="panel-h"><div style="flex:1;min-width:0"><h3>Work orders</h3>'+
   '<p class="muted" style="margin:2px 0 0;font-size:12px">'+order.length+' work order'+(order.length===1?'':'s')+' with '+rr.length+' run'+(rr.length===1?'':'s')+' in view. A direct one holds a run started from a terminal.</p></div></div>'+
   '<div class="tw"><table><thead><tr><th>Work order</th><th>Kind</th><th>Runs</th><th>Status</th><th class="num">Cost</th><th>Started</th></tr></thead><tbody>'+
   order.map(function(k){var x=g[k], w=x.w, R=x.runs, cost=R.reduce(function(s,y){return s+(parseFloat(y.cost)||0);},0), last=R[R.length-1];
     return '<tr class="click" onclick="go(\''+(w?woUrl(w):'#/'+ORG.slug+'/'+last.ws+'/runs/'+last.id)+'\')"><td>'+(w?'<span class="mono" style="font-size:12px">'+h(w.id)+'</span><div style="font-size:12px">'+h(w.title)+'</div>':'<span class="dim">—</span>')+'</td>'+
      '<td>'+(w?woKindBadge(w):'')+'</td><td>'+R.map(function(y){return '<a class="mono" style="font-size:11.5px" href="#/'+ORG.slug+'/'+y.ws+'/runs/'+y.id+'" onclick="event.stopPropagation()">'+h(y.id)+'</a>';}).join("<br>")+'</td>'+
      '<td>'+statusBadge(runStatus(last))+'</td><td class="num">'+usd(cost.toFixed(2))+'</td><td class="mono dim" style="font-size:11px">'+h(last.started)+'</td></tr>';}).join("")+
   '</tbody></table></div></div>';
}

/* ============================== Intake ==============================
   The Providers, Fields and People tabs of the old Tasks page, as one dialog on Backlog. It opens on
   the part its address names: #/…/work?intake=fields. */
var INTAKE_PARTS=[["providers","Providers"],["fields","Fields"],["people","People"]];
function intakePart(x){ S.dlgArg=x; render(); }
DLG_EXT.intake=function(){
  var part=INTAKE_PARTS.some(function(x){return x[0]===S.dlgArg;})?S.dlgArg:"providers";
  var n=wsProviders().length;
  var seg='<div class="kf stg-seg" role="group" aria-label="Intake" style="margin-bottom:14px">'+INTAKE_PARTS.map(function(x){
    return '<button class="btn sm" aria-pressed="'+(part===x[0])+'" onclick="intakePart(\''+x[0]+'\')">'+h(x[1])+'</button>';}).join("")+'</div>';
  return {t:"Intake",s:n+" issue provider"+(n===1?"":"s")+" connected to "+ws().name+". Each imported issue becomes a work item.",w:true,
   b:seg+(part==="fields"?tkFieldsTab():part==="people"?tkPeopleTab():tkProvTab()),
   f:'<button class="btn" onclick="ipzOpen()">Connect an issue provider</button><button class="btn primary" onclick="closeDialog()">Done</button>'};
};
