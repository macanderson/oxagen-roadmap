/* ===================== Run metrics =====================
   One deterministic derivation behind every instrument on this page, so no two
   panels can disagree. Anchored on the run record: cost, cache rate, turns and
   steps are the run's own; tokens are derived from cost at the effective price
   the Cost tab publishes, and everything else is seeded from the run id so the
   numbers do not move between renders. */
var TOOLPOOL={
 "a-intel.core.release-manager":[["github__list_pull_requests@3",5],["github__get_file_contents@2",4],["recall_context@1",3],
   ["search_graph@1",2],["edit__file@1",3],["write__file@1",2],["bash__run@1",2],["linear__get_issue@1",1],["github__create_release@2",1]],
 "a-intel.core.stella-ci":[["bash__run@1",7],["github__get_file_contents@2",3],["search_graph@1",2],["write__file@1",1],["linear__get_issue@1",1]],
 "a-intel.core.triage":[["linear__get_issue@1",4],["search_graph@1",4],["github__get_file_contents@2",3],["recall_context@1",2],["linear__update_issue@2",2]],
 "a-intel.finops.invoice-bot":[["aws_billing__get_cost_and_usage@1",4],["recall_context@1",2],["stripe__create_payment@5",1],["slack__post_message@2",1]],
 "a-intel.core.docs-writer":[["github__get_file_contents@2",4],["recall_context@1",3],["edit__file@1",3],["write__file@1",2],["search_graph@1",1]]
};
/* cost of one run, split across the token classes at the published effective prices */
var PRICE={inEff:1.88e-6, out:75e-6, outLight:5e-6};
function rngOf(seed){var x=seed>>>0;return function(){x=(x*1664525+1013904223)>>>0;return x/4294967296;};}
function runMetrics(R){
  if(R._m&&R._m.v===3)return R._m;
  var s=runSeries(R), seed=11, i;
  for(i=0;i<R.id.length;i++)seed=(seed*31+R.id.charCodeAt(i))>>>0;
  var rnd=rngOf(seed), cost=parseFloat(R.cost)||0, light=/haiku|flash|light/i.test(R.model||"");

  /* --- tokens: input is two thirds of the calls but a third of the money --- */
  var outPrice=light?PRICE.outLight:PRICE.out;
  var tokIn=Math.round(cost/3/PRICE.inEff), tokOut=Math.round(cost*2/3/outPrice);
  var cacheRead=Math.round(tokIn*(R.cache||0)), fresh=tokIn-cacheRead, cacheWrite=0;
  var reasoning=Math.round(tokOut*(light?0.05:0.34));
  var perCall=Math.round(tokIn/Math.max(1,s.modelN));

  /* --- the prompt: what the operator wrote, and what it became --- */
  var words=String(R.taskTitle||"").split(/\s+/).filter(Boolean).length+18;
  var promptTok=Math.round(words*1.35), sysTok=2118+1340;

  /* --- tool calls: drawn from the agent's belt, batched, some run in parallel --- */
  var pool=TOOLPOOL[R.agent]||TOOLPOOL["a-intel.core.release-manager"], bag=[];
  pool.forEach(function(p){for(var k=0;k<p[1];k++)bag.push(p[0]);});
  var calls=[],n=s.toolN;
  for(i=0;i<n;i++){var id=bag[Math.floor(rnd()*bag.length)];
    calls.push({id:id,cat:toolMeta(id).cat,ms:Math.round(180+rnd()*2600),err:rnd()<0.055});}
  /* batches: a model call may ask for more than one tool and the gateway runs them together */
  var batches=[],b=0;
  while(b<calls.length){var want=rnd(),k=want>0.88?3:want>0.66?2:1;k=Math.min(k,calls.length-b);
    batches.push(calls.slice(b,b+k));b+=k;}
  var par=batches.filter(function(x){return x.length>1;}).length;
  var maxPar=batches.reduce(function(a,x){return Math.max(a,x.length);},0);
  var fan=calls.length/Math.max(1,batches.length);
  var hist={};batches.forEach(function(x){hist[x.length]=(hist[x.length]||0)+1;});
  var errs=calls.filter(function(c){return c.err;}).length;
  /* wall clock a batch costs is its slowest call, not the sum — that is the point of running them together */
  var toolMs=batches.reduce(function(a,x){return a+x.reduce(function(m,c){return Math.max(m,c.ms);},0);},0);
  var serialMs=calls.reduce(function(a,c){return a+c.ms;},0);

  /* --- by family, ranked; identity is the icon and the label, never the bar colour --- */
  var fam={};calls.forEach(function(c){var f=fam[c.cat]||(fam[c.cat]={cat:c.cat,n:0,ms:0,err:0,names:{}});
    f.n++;f.ms+=c.ms;if(c.err)f.err++;f.names[toolParts(c.id).n]=1;});
  var families=Object.keys(fam).map(function(k){var f=fam[k];f.tools=Object.keys(f.names).length;
    f.share=f.n/Math.max(1,calls.length);return f;}).sort(function(a,b){return b.n-a.n||TCAT_ORDER.indexOf(a.cat)-TCAT_ORDER.indexOf(b.cat);});

  /* --- speculative prefetch: a read the harness starts before the step is final ---
     Only read-shaped families are eligible: a discarded write would be a real effect. */
  var eligible=calls.filter(function(c){return c.cat==="read"||c.cat==="query";}).length;
  var started=Math.round(eligible*0.72), used=Math.round(started*0.73), discarded=started-used;
  var savedMs=used*Math.round(240+rnd()*300);

  /* --- wall clock --- */
  var modelMs=0;for(i=0;i<s.modelN;i++)modelMs+=Math.round(3400+rnd()*7200);
  var parked=0;FRAMES.forEach(function(f){if(f.kind==="policy_decision"&&/approve/.test(f.sum))parked++;});
  var waitMs=parked?parked*600000:0, overMs=Math.round(s.modelN*240+calls.length*90);
  var wall=modelMs+toolMs+waitMs+overMs;

  /* --- diffstat, straight off the files the harness reported --- */
  var g=runGraphOf(R),add=0,del=0,fileRows=(g.files||[]).map(function(f){
    var st=diffStat(txDiffRows(f.before,f.after));add+=st.add;del+=st.del;return {path:f.path,add:st.add,del:st.del};});

  return R._m={v:3,tokIn:tokIn,tokOut:tokOut,cacheRead:cacheRead,fresh:fresh,cacheWrite:cacheWrite,reasoning:reasoning,
    perCall:perCall,promptTok:promptTok,sysTok:sysTok,tokTotal:tokIn+tokOut,
    calls:calls,batches:batches,par:par,maxPar:maxPar,fan:fan,hist:hist,errs:errs,families:families,
    toolMs:toolMs,serialMs:serialMs,modelMs:modelMs,waitMs:waitMs,overMs:overMs,wall:wall,parked:parked,
    started:started,used:used,discarded:discarded,savedMs:savedMs,eligible:eligible,
    add:add,del:del,fileRows:fileRows,series:s};
}
function msDur(ms){
  var s=Math.round(ms/1000);
  if(s<60)return s+"s";
  var m=Math.floor(s/60),r=s%60;
  if(m<60)return m+"m"+(r?" "+r+"s":"");
  return Math.floor(m/60)+"h "+(m%60)+"m";
}
function pct(a,b){return b?Math.round(a/b*100)+"%":"0%";}

/* ---- the six instruments ---- */
function instTile(k,basis,value,sub,chart,foot){
  return '<div class="inst"><div class="ih"><span class="k">'+k+'</span><span class="basis">'+basis+'</span></div>'+
   '<div class="iv">'+value+'</div>'+(sub?'<div class="is">'+sub+'</div>':'')+(chart||'')+(foot?'<div class="is">'+foot+'</div>':'')+'</div>';
}
function stack3(parts,total){
  return '<div class="stk">'+parts.map(function(p){return p[1]<=0?'':'<i class="'+p[2]+'" style="flex:'+p[1]+'"'+tipAttr(p[0]+" · "+p[3])+'></i>';}).join("")+'</div>';
}
function stackLeg(parts){
  return '<div class="leg">'+parts.filter(function(p){return p[1]>0;}).map(function(p){
    return '<span><i class="'+p[2]+'"></i>'+p[0]+' <b>'+p[3]+'</b></span>';}).join("")+'</div>';
}
function runInstruments(R){
  var m=runMetrics(R),s=m.series,a=agent(R.agent),total=parseFloat(R.cost)||0,mx=Math.max.apply(null,s.cost)||1;
  var medRun=a?parseFloat(a.spend30)/Math.max(1,a.runs30):null;

  /* 1 · cost, per turn */
  var costCols=s.cost.map(function(c,i){
    return '<button type="button" class="c fk-model'+(i===s.n-1&&R.status==="live"?" cur":"")+'"'+tipAttr("Turn "+(i+1)+" · $"+c.toFixed(2)+" · cache "+per(s.cache[i])+(i===s.peak?" · dearest turn":""))+' aria-label="turn '+(i+1)+' $'+c.toFixed(2)+'" onclick="S.tab.run=\'cost\';render()">'+
      (i===s.peak?'<span class="lab">$'+c.toFixed(2)+'</span>':'')+'<i style="height:'+Math.max(4,Math.round(c/mx*100))+'%"></i></button>';}).join("");
  var t1=instTile("Cost so far",h(R.basis),usd(R.cost)+'<small>USD</small>',
    '<b>$'+s.perTurn.toFixed(2)+'</b> per turn · turn '+(s.peak+1)+' was the dearest'+(medRun!=null?' · '+deltaHtml(total,medRun,function(d){return "$"+d.toFixed(2);},false)+' vs this agent’s median run $'+medRun.toFixed(2):''),
    '<div class="cols">'+costCols+'<span class="base"></span></div><div class="ax"><span>turn 1</span><span>turn '+s.n+(R.status==="live"?" · live":"")+'</span></div>',
    'cache hit <b>'+per(R.cache)+'</b> · saved ≈ <b>$'+s.saved.toFixed(2)+'</b> against an uncached prompt');

  /* 2 · wall clock — model, tool, waiting on a person, harness */
  var wp=[["model",m.modelMs,"fk-model",msDur(m.modelMs)],["tool",m.toolMs,"fk-tool",msDur(m.toolMs)],
          ["waiting on a person",m.waitMs,"fk-gov",msDur(m.waitMs)],["harness",m.overMs,"neu",msDur(m.overMs)]];
  var lead=wp.slice().sort(function(x,y){return y[1]-x[1];})[0];
  var t2=instTile("Wall clock",R.status==="live"?"so far":"start to seal",msDur(m.wall)+'<small>elapsed</small>',
    '<b>'+pct(lead[1],m.wall)+'</b> of it '+(lead[0]==="waiting on a person"?'waiting on a person':lead[0]==="model"?'in the model':'in '+lead[0]+' calls')+
    (m.parked?' · '+m.parked+' call'+(m.parked===1?'':'s')+' parked for approval':''),
    stack3(wp,m.wall)+stackLeg(wp),
    'Running '+m.batches.length+' batch'+(m.batches.length===1?'':'es')+' together cost <b>'+msDur(m.toolMs)+'</b> of wall clock against <b>'+msDur(m.serialMs)+'</b> one at a time.');

  /* 3 · tokens */
  var tp=[["cache read",m.cacheRead,"fk-model",tokn(m.cacheRead)],["fresh input",m.fresh,"fk-tool",tokn(m.fresh)],["output",m.tokOut,"fk-gov",tokn(m.tokOut)]];
  var t3=instTile("Tokens","in and out",tokn(m.tokTotal)+'<small>tokens</small>',
    '<b>'+tokn(m.tokIn)+'</b> in · <b>'+tokn(m.tokOut)+'</b> out'+(m.reasoning?' · '+tokn(m.reasoning)+' of the output was reasoning':''),
    stack3(tp,m.tokIn+m.tokOut)+stackLeg(tp),
    'Cache hit <b>'+per(R.cache)+'</b> of input · <b>'+tokn(m.perCall)+'</b> tokens per model call · effective input price $1.88 per million'+(m.cacheWrite?'':' · nothing written to cache'));

  /* 4 · steps and calls */
  var stepMx=Math.max.apply(null,s.steps)||1;
  var stepCols=s.steps.map(function(n,i){var mh=s.model[i]/stepMx*100,th=s.tool[i]/stepMx*100;
    return '<button type="button" class="c" style="height:100%"'+tipAttr("Turn "+(i+1)+" · "+n+" steps · "+s.model[i]+" model · "+s.tool[i]+" tool")+' aria-label="turn '+(i+1)+' '+n+' steps" onclick="S.tab.run=\'player\';render()">'+
      (n===stepMx?'<span class="lab">'+n+'</span>':'')+'<i class="fk-tool" style="height:'+Math.max(2,Math.round(th))+'%"></i><i class="fk-model" style="height:'+Math.max(2,Math.round(mh))+'%"></i></button>';}).join("");
  var t4=instTile("Shape of the run",FRAMES.length+' frames in view',
    R.turn+'<small>turns</small><span class="sep">·</span>'+R.steps+'<small>steps</small><span class="sep">·</span>'+R.frames+'<small>frames</small>',
    'A step is one model call or one tool call; a frame is one recorded event.',
    '<div class="cols">'+stepCols+'<span class="base"></span></div><div class="ax"><span>turn 1</span><span>turn '+s.n+'</span></div>'+
    stackLeg([["model calls",s.modelN,"fk-model",s.modelN],["tool calls",s.toolN,"fk-tool",s.toolN]]),
    '<b>'+m.fan.toFixed(1)+'</b> tools per batch · <b>'+(s.toolN/Math.max(1,s.modelN)).toFixed(2)+'</b> tool calls per model call');

  /* 5 · tool calls by family — magnitude in one hue, identity in the icon and the label */
  var fmx=m.families.length?m.families[0].n:1;
  var famRows=m.families.slice(0,4).map(function(f){
    return '<button type="button" class="frow t-'+f.cat+'"'+tipAttr(TCAT[f.cat].l+" · "+f.n+" calls · "+f.tools+" distinct tools · "+msDur(f.ms)+(f.err?" · "+f.err+" failed":""))+' onclick="S.tab.run=\'cost\';render()">'+
     '<span class="ti">'+catSvg(f.cat)+'</span><span class="fl">'+h(TCAT[f.cat].l)+'</span>'+
     '<span class="fb"><i style="width:'+Math.round(f.n/fmx*100)+'%"></i></span><span class="fn">'+f.n+'</span></button>';}).join("");
  var rest=m.families.slice(4).reduce(function(a,f){return a+f.n;},0);
  var t5=instTile("Tool calls",m.families.length+' famil'+(m.families.length===1?'y':'ies'),
    m.calls.length+'<small>calls</small>'+(m.errs?'<small>'+deltaHtml(m.errs,0,function(d){return d+" failed";},false)+'</small>':''),
    '', '<div class="fams">'+famRows+(rest?'<div class="frow rest"><span class="ti"></span><span class="fl">other</span><span class="fb"><i style="width:'+Math.round(rest/fmx*100)+'%"></i></span><span class="fn">'+rest+'</span></div>':'')+'</div>',
    '<b>'+m.par+'</b> of '+m.batches.length+' batches ran in parallel · up to <b>'+m.maxPar+'</b> at once');

  /* 6 · productive ratio */
  var ref=a?a.ratio:null;
  var t6=instTile("Productive ratio","steps that advanced the task",
    per(R.ratio)+(ref!=null?'<small>'+deltaHtml(R.ratio*100,ref*100,function(d){return Math.round(d)+" pts";},true)+' vs 30-day '+per(ref)+'</small>':''),
    '',
    '<div class="stk"><i class="fk-model" style="flex:'+s.adv+'"'+tipAttr(s.adv+" steps advanced the task")+'></i><i style="flex:'+s.idle+';background:var(--rule)"'+tipAttr(s.idle+" steps did not: retries, re-reads and waits")+'></i>'+
    (ref!=null?'<span class="ref" style="left:'+Math.round(ref*100)+'%"'+tipAttr("this agent’s 30-day productive ratio · "+per(ref))+'></span>':'')+'</div>'+
    stackLeg([["advanced",s.adv,"fk-model",s.adv],["did not",s.idle,"neu",s.idle]]),
    s.idle?'<b>'+s.idle+'</b> steps did not move the task: '+Math.ceil(s.idle*0.55)+' retries, '+Math.floor(s.idle*0.3)+' re-reads, '+Math.max(0,s.idle-Math.ceil(s.idle*0.55)-Math.floor(s.idle*0.3))+' waits.':'Every step advanced the task.');

  return '<div class="inst-grid">'+t1+t2+t3+t4+t5+t6+'</div>';
}

/* ---- the prompt: what the operator wrote, and what reached the model ---- */
function promptRow(R){
  var m=runMetrics(R),op=PEOPLE[R.op],win=m.perCall;
  var parts=[["operator’s words",m.promptTok],["tools and steering",m.sysTok],["context and conversation",Math.max(0,win-m.promptTok-m.sysTok)]];
  return '<div class="panel pr-row"><div class="panel-h"><h3>The prompt</h3>'+
   '<span class="mono dim" style="font-size:11px">'+tokn(m.promptTok)+' tok written · '+tokn(win)+' tok sent</span>'+
   '<button class="btn sm" style="margin-left:auto" onclick="S.tab.run=\'context\';render()">Open the window</button></div>'+
   '<div class="panel-b pr-b">'+
    '<div class="pr-text"><p class="eyebrow q">Written by '+h(op?op.name:R.op)+'</p><p class="q">“'+h(R.taskTitle)+(R.task?'. Task '+h(R.task)+'.':'')+'”</p></div>'+
    '<div class="pr-exp"><p class="eyebrow q">What reached the model on the last call</p>'+
     '<div class="pr-bars">'+parts.map(function(p,i){return '<div class="pr-bar"'+tipAttr(p[0]+" · "+tokn(p[1])+" tok · "+pct(p[1],win))+'><span class="l">'+p[0]+'</span><span class="t"><i style="width:'+Math.round(p[1]/win*100)+'%;opacity:'+(1-i*0.28)+'"></i></span><span class="v">'+tokn(p[1])+'</span></div>';}).join("")+'</div>'+
     '<p class="muted" style="font-size:11.5px;margin:8px 0 0">One sentence expanded to '+tokn(win)+' tokens; '+per(R.cache)+' of it came from cache, so it was paid for once.</p></div>'+
   '</div></div>';
}

/* ---- calls, concurrency and prefetch ---- */
function callsPanel(R){
  var m=runMetrics(R),fmx=m.families.length?m.families[0].n:1;
  var rows=m.families.map(function(f){
    return '<tr><td><span class="fcell t-'+f.cat+'"><span class="ti">'+catSvg(f.cat)+'</span><span class="fx"><b>'+h(TCAT[f.cat].l)+'</b><span>'+f.tools+' distinct tool'+(f.tools===1?'':'s')+'</span></span></span></td>'+
     '<td class="num">'+f.n+'</td><td class="fbc"><span class="fb"'+tipAttr(TCAT[f.cat].l+" · "+pct(f.n,m.calls.length)+" of calls")+'><i style="width:'+Math.round(f.n/fmx*100)+'%"></i></span></td>'+
     '<td class="num">'+pct(f.n,m.calls.length)+'</td><td class="num">'+msDur(f.ms)+'</td>'+
     '<td class="num">'+(f.err?'<span class="b b-denied"><span class="d"></span>'+f.err+'</span>':'<span class="dim">0</span>')+'</td></tr>';}).join("");
  var hmx=Math.max.apply(null,Object.keys(m.hist).map(function(k){return m.hist[k];}));
  var hrows=Object.keys(m.hist).sort().map(function(k){
    return '<div class="hrow"><span class="hk">'+k+' tool'+(k==="1"?"":"s")+'</span><span class="fb"'+tipAttr(m.hist[k]+" batches asked for "+k+" tool"+(k==="1"?"":"s")+" at once")+'><i style="width:'+Math.round(m.hist[k]/hmx*100)+'%"></i></span><span class="hv">'+m.hist[k]+'</span></div>';}).join("");
  return '<div class="panel" style="margin-bottom:16px"><div class="panel-h"><h3>Calls, concurrency and prefetch</h3>'+
   '<span class="mono dim" style="font-size:11px;margin-left:auto">'+m.calls.length+' calls · '+m.batches.length+' batches · '+m.families.length+' families</span></div>'+
   '<div class="cc">'+
    '<div class="cc-c wide"><p class="eyebrow q">By family · what the calls acted on</p>'+
     '<div class="tw"><table class="narrow" data-lt="off"><thead><tr><th>Family</th><th class="num">Calls</th><th></th><th class="num">Share</th><th class="num">Wall clock</th><th class="num">Failed</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
     '<p class="muted" style="font-size:11.5px;margin:9px 0 0">A family says what a tool <b>acts on</b>. It is orthogonal to the hazard and to what the belt decided.</p></div>'+
    '<div class="cc-c"><p class="eyebrow q">Concurrency · tools per batch</p>'+
     '<div class="hist">'+hrows+'</div>'+
     '<dl class="kv" style="margin-top:12px"><dt>Batches</dt><dd>'+m.batches.length+' · <b>'+m.par+'</b> ran more than one tool</dd>'+
     '<dt>Widest batch</dt><dd>'+m.maxPar+' tools at once</dd>'+
     '<dt>Mean fan-out</dt><dd>'+m.fan.toFixed(2)+' tools per batch</dd>'+
     '<dt>Wall clock won</dt><dd><b>'+msDur(m.serialMs-m.toolMs)+'</b> · '+msDur(m.toolMs)+' together against '+msDur(m.serialMs)+' in turn</dd></dl></div>'+
    '<div class="cc-c"><p class="eyebrow q">Speculative prefetch · started before the step was final</p>'+
     '<div class="spec"><div class="sv">'+m.used+'<small> of '+m.started+' used</small></div>'+
      '<div class="stk"><i class="fk-model" style="flex:'+m.used+'"'+tipAttr(m.used+" prefetched reads the model went on to ask for")+'></i><i style="flex:'+Math.max(0,m.discarded)+';background:var(--rule)"'+tipAttr(m.discarded+" discarded unread")+'></i></div>'+
      stackLeg([["used",m.used,"fk-model",m.used],["discarded",m.discarded,"neu",m.discarded]])+'</div>'+
     '<dl class="kv" style="margin-top:12px"><dt>Eligible</dt><dd>'+m.eligible+' read-only calls · a write is never speculated</dd>'+
     '<dt>Hit rate</dt><dd>'+pct(m.used,Math.max(1,m.started))+'</dd>'+
     '<dt>Wall clock saved</dt><dd><b>'+msDur(m.savedMs)+'</b></dd>'+
     '<dt>Billed</dt><dd>discarded reads are recorded and billed; nothing is hidden</dd></dl>'+
     '<div class="note" style="margin-top:11px">The harness starts a read it expects the model to ask for before the step is final. Only read-only families are eligible: a discarded write would be an effect nobody asked for, and policy runs on the speculated call exactly as it would on a real one.</div></div>'+
   '</div></div>';
}

