
/* ============================== volume ==============================
   Anderson Intelligence Corp. is a business, not a five-agent demo. The hand-authored records
   above carry the story (the transcripts, the evidence, the flip, the parked payment); this block
   fills in the rest of the organization around them so every list pages, every total is
   business-sized, and nothing above has to know. It is deterministic: a seeded generator, so the
   same rows appear on every load and a screenshot is reproducible. Seed rows always come first. */
(function volume(){
  var seed=0xA11E7;
  function rnd(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
  function ri(a,b){return a+Math.floor(rnd()*(b-a+1));}
  function rf(a,b){return a+rnd()*(b-a);}
  function pick(arr){return arr[Math.floor(rnd()*arr.length)];}
  function wpick(pairs){var s=0,i;for(i=0;i<pairs.length;i++)s+=pairs[i][1];var r=rnd()*s;for(i=0;i<pairs.length;i++){r-=pairs[i][1];if(r<=0)return pairs[i][0];}return pairs[pairs.length-1][0];}
  function skew(lo,hi,k){var u=rnd();return lo+(hi-lo)*Math.pow(u,k||2.6);}   /* long tail: most small, a few big */
  function m2(n){return n.toFixed(2);}
  function mc(n){return n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});}
  function ic(n){return Math.round(n).toLocaleString("en-US");}
  function num$(v){return parseFloat(String(v).replace(/,/g,""))||0;}
  var B32="0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  function ulid(n){var s="";for(var i=0;i<n;i++)s+=B32[Math.floor(rnd()*32)];return s;}
  function hex(n){var s="";for(var i=0;i<n;i++)s+="0123456789abcdef"[Math.floor(rnd()*16)];return s;}
  function pad(n){return (n<10?"0":"")+n;}
  function title(s){return s.split("-").map(function(w){return w.charAt(0).toUpperCase()+w.slice(1);}).join(" ");}
  /* the story's clock: 2026-09-11, a little after 09:14 UTC. daysAgo 0 renders as a bare time, like the seed rows. */
  var TODAY=Date.UTC(2026,8,11), NOW_SEC=9*3600+14*60;
  function dstr(ms){var d=new Date(ms);return d.getUTCFullYear()+"-"+pad(d.getUTCMonth()+1)+"-"+pad(d.getUTCDate());}
  function when(daysAgo,sec,withSec){
    var h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;
    if(daysAgo===0) return pad(h)+":"+pad(m)+":"+pad(s);
    return dstr(TODAY-daysAgo*86400000)+" "+pad(h)+":"+pad(m)+(withSec?":"+pad(s):"");
  }
  function stamp(daysAgo,sec){var h=Math.floor(sec/3600),m=Math.floor(sec%3600/60);return dstr(TODAY-daysAgo*86400000)+" "+pad(h)+":"+pad(m);}
  function anyDay(){ /* recent-weighted, inside the 30-day window */ return Math.floor(skew(0,30,1.8)); }
  function daySec(daysAgo){ return daysAgo===0?ri(0,NOW_SEC):ri(5*3600,23*3600+59*60); }

  /* ---------- people ---------- */
  var FIRST=["Amara","Jonas","Ines","Tobias","Leila","Mateo","Yuki","Noor","Felix","Chiara","Ravi","Saoirse","Tomas","Ayesha","Kwame","Elin","Diego","Hana","Oskar","Zainab",
    "Luca","Mei","Bastian","Farah","Nikolai","Adaeze","Ruben","Sana","Anders","Imani","Pavel","Thandiwe","Emil","Rosa","Idris","Greta","Callum","Aiko","Sebastian","Nadia",
    "Hugo","Leonie","Omar","Sigrid","Tariq","Wren","Mikael","Beatriz"];
  var LAST=["Lindqvist","Okoro","Haddad","Brennan","Castellanos","Nakamura","Petrov","Mensah","Kowalski","Duarte","Iyer","Fontaine","Achterberg","Rahimi","Sørensen","Nwosu",
    "Marchetti","Oyelaran","Halvorsen","Delacroix","Tanaka","Abubakar","Novak","Ferreira","Quist","Bhattacharya","Eriksen","Moreau","Adichie","Varga","Lindgren","Osei",
    "Kaczmarek","Yılmaz","Berger","Mwangi","Rossi","Sato","Albrecht","Diallo","Weiss","Jansen","Nkemelu","Holm","Costa","Ibrahim","Larsen","Vieira"];
  var TONES=["solid","soft","line"], FONTS=["sans","serif","mono"];
  var people=[], usedKeys={priya:1,marcus:1,dana:1};
  for(var pi=0;pi<FIRST.length;pi++){
    var fn=FIRST[pi], ln=LAST[pi], key=fn.toLowerCase().replace(/[^a-z]/g,"");
    if(usedKeys[key])key=key+ln.charAt(0).toLowerCase(); usedKeys[key]=1;
    people.push({key:key,first:fn,last:ln,initials:fn.charAt(0)+ln.charAt(0)});
  }

  /* ---------- workspaces ---------- */
  WS[0].linked=["a-intel/billing","a-intel/mobile","a-intel/infra"];
  var newWS=[
    {slug:"data-platform",name:"Data platform",main:"a-intel/data-platform",branch:"main",linked:["a-intel/warehouse","a-intel/pipelines"],pre:"data",head:"c4d81a0"},
    {slug:"support",name:"Customer support",main:"a-intel/support-console",branch:"main",linked:["a-intel/help-center"],pre:"support",head:"9b02e7f"},
    {slug:"security",name:"Security",main:"a-intel/security-tools",branch:"main",linked:["a-intel/infra"],pre:"sec",head:"e17c530"},
    {slug:"growth",name:"Growth",main:"a-intel/growth-site",branch:"production",linked:["a-intel/crm-sync"],pre:"growth",head:"51fa9d2"},
    {slug:"mobile",name:"Mobile",main:"a-intel/mobile",branch:"release",linked:[],pre:"mobile",head:"c02fa77"},
    {slug:"research",name:"Research",main:"a-intel/ml-research",branch:"main",linked:["a-intel/eval-harness"],pre:"research",head:"7a3e0b9"},
    {slug:"infra",name:"Infrastructure",main:"a-intel/infra",branch:"main",linked:["a-intel/platform"],pre:"infra",head:"0d9c4e1"}
  ];
  var WSX={"core-platform":{pre:"core",head:"a4c91e2",owner:"marcus",target:64},finops:{pre:"finops",head:"7e0b331",owner:"dana",target:21}};
  var targets={"data-platform":47,support:33,security:18,growth:26,mobile:22,research:15,infra:28};
  var pcur=0;
  newWS.forEach(function(w){
    var owner=people[pcur++]; w.owner=owner.first+" "+owner.last; w.agents=0;
    WSX[w.slug]={pre:w.pre,head:w.head,owner:owner.key,target:targets[w.slug]};
    PEOPLE[owner.key]={name:w.owner,role:"workspace.owner · "+w.slug,initials:owner.initials,email:(owner.first+"."+owner.last).toLowerCase().replace(/[^a-z.]/g,"")+"@a-intel.example",
      mfa:pick(["passkey","passkey + TOTP","hardware key"]),avatar:{kind:"initials",text:owner.initials,font:FONTS[pcur%3],tone:TONES[pcur%3]}};
    MEMBERS.push({p:owner.key,ws:w.slug,status:"active",last:stamp(ri(0,2),daySec(1)),mfa:PEOPLE[owner.key].mfa,sso:"Okta"});
    WS.push({slug:w.slug,name:w.name,main:w.main,branch:w.branch,linked:w.linked,agents:0,owner:w.owner});
  });
  /* the rest of the people: members, a few auditors and billing holders, one more org owner */
  var allWs=WS.map(function(w){return w.slug;});
  var extraRoles=[["org.owner",1],["org.billing",2],["org.auditor",3]];
  for(;pcur<people.length;pcur++){
    var p=people[pcur], role, wsOf;
    var ex=extraRoles.filter(function(r){return r[1]>0;})[0];
    if(ex&&rnd()<0.35){ex[1]--; role=ex[0]; wsOf="all";}
    else { wsOf=pick(allWs); role=(rnd()<0.18?"workspace.owner · ":"workspace.member · ")+wsOf; }
    var last=ri(0,9);
    PEOPLE[p.key]={name:p.first+" "+p.last,role:role,initials:p.initials,email:(p.first+"."+p.last).toLowerCase().replace(/[^a-z.]/g,"")+"@a-intel.example",
      mfa:pick(["TOTP","passkey","passkey + TOTP","hardware key"]),avatar:{kind:"initials",text:p.initials,font:FONTS[pcur%3],tone:TONES[(pcur>>1)%3]}};
    MEMBERS.push({p:p.key,ws:wsOf,status:last>7?"invited · pending SCIM":"active",last:last>7?"never":stamp(last,daySec(last)),mfa:PEOPLE[p.key].mfa,sso:rnd()<0.92?"Okta":"—"});
  }
  var OPS=Object.keys(PEOPLE);
  /* operators per workspace: the owner runs most of it, members run the rest */
  function operatorsFor(slug){
    var own=WSX[slug].owner, mem=MEMBERS.filter(function(m){return m.ws===slug&&m.p!==own&&m.status==="active";}).map(function(m){return m.p;});
    return [[own,5]].concat(mem.map(function(k){return [k,1];}));
  }

  /* ---------- agents ---------- */
  var ROLES_BY={
    core:["pr-reviewer","dependency-bot","changelog-writer","flaky-hunter","schema-guard","migration-planner","perf-watch","oncall-scribe","api-linter","test-author","incident-scribe","backport-bot","release-verifier","lockfile-updater","deprecation-sweeper"],
    finops:["cost-reporter","ledger-reconciler","invoice-matcher","po-checker","savings-planner","vendor-auditor","budget-sentinel","chargeback-writer","forecast-bot"],
    data:["pipeline-doctor","schema-drift-watch","dbt-runner","freshness-monitor","backfill-planner","quality-gate","lineage-mapper","warehouse-tuner","partition-groomer","dashboard-checker","source-onboarder"],
    support:["ticket-triage","refund-desk","kb-writer","sla-watch","escalation-router","csat-reader","macro-author","churn-flagger","order-lookup"],
    sec:["secret-scanner","cve-watch","access-reviewer","policy-tester","phish-triage","iam-drift-watch","dependency-auditor","log-sentinel"],
    growth:["campaign-planner","seo-writer","ab-analyst","lead-scorer","crm-sync-bot","landing-page-tester","email-drafter","attribution-checker"],
    mobile:["crash-triage","store-release-bot","screenshot-diff","localization-checker","build-doctor","review-reader"],
    research:["eval-runner","paper-scout","ablation-planner","dataset-curator","notebook-cleaner","benchmark-scribe"],
    infra:["terraform-planner","drift-detector","cost-optimizer","k8s-doctor","runbook-writer","cert-rotator","capacity-planner","alert-tuner","dns-auditor"]
  };
  var GENERIC=["summarizer","weekly-digest","meeting-scribe","doc-linker","label-bot","stale-closer","owner-finder","backlog-groomer","status-poster"];
  var SUFFIX=["us","eu","apac","2","3","batch","nightly","canary"];
  var HARN=[["claude-code","Claude Code",42],["codex-cli","Codex CLI",16],["stella","Stella",14],["claude-agent-sdk","Claude Agent SDK",12],["openai-agents","OpenAI Agents SDK",7],["langgraph","LangGraph",5],["custom","Custom (SDK-wrapped)",4]];
  var DESC={
    "pr-reviewer":"Reviews every pull request against the workspace rules and leaves one comment per finding. Never approves, never merges.",
    "dependency-bot":"Opens one pull request per dependency bump with the changelog inlined. Waits for CI; a person merges.",
    "cost-reporter":"Writes the daily spend digest from the frames and posts it to #finops. Reads only.",
    "ticket-triage":"Labels, routes and drafts a first reply for incoming tickets. Sends nothing without a human click.",
    "secret-scanner":"Scans every push for credentials and opens an incident when one lands. Revokes nothing on its own.",
    "terraform-planner":"Runs plan on every infrastructure pull request and annotates the diff. Apply is a person's action.",
    "eval-runner":"Runs the evaluation ladder on every candidate checkpoint and files the scorecard.",
    "crash-triage":"Groups new crash reports, finds the introducing commit and opens the issue.",
    "campaign-planner":"Drafts campaign briefs from the quarter's targets. Spend is committed by a person under a mandate."
  };
  var usedSlug={"release-manager":1,"stella-ci":1,triage:1,"invoice-bot":1,"docs-writer":1};
  var ICONS=["rocket","compass","microscope","stethoscope","pencil-line","receipt","wrench","flask-conical","key-round","package","satellite","bot","bird","bug","sprout","cog","brain","search","radio-tower","wand-sparkles","brick-wall","target","folder-tree","shield-check"];
  var perWsAgents={}, madeAgents=[];
  AGENTS.forEach(function(a){(perWsAgents[a.ws]=perWsAgents[a.ws]||[]).push(a);});
  WS.forEach(function(w){
    var x=WSX[w.slug], have=(perWsAgents[w.slug]||[]).length, pool=ROLES_BY[x.pre].concat(GENERIC), ops=operatorsFor(w.slug), n=0;
    perWsAgents[w.slug]=perWsAgents[w.slug]||[];
    while(have+n<x.target){
      var base=pool[n%pool.length], slug=base, k=0;
      while(usedSlug[slug]){slug=base+"-"+SUFFIX[k%SUFFIX.length]+(k>=SUFFIX.length?String(Math.floor(k/SUFFIX.length)+1):"");k++;}
      usedSlug[slug]=1;
      var hn=wpick(HARN.map(function(h){return [h,h[2]];}));
      var runs30=Math.round(skew(3,1400,2.2)), perRun=rf(0.35,6.4), spend=runs30*perRun, ratio=Math.round(rf(0.04,0.9)*100)/100, proven=spend*ratio*rf(0.5,1.0);
      var tier=wpick([["gateway",84],["harness",11],["observe",5]]), tierNative=wpick([["harness",45],["gateway",35],["observe",20]]);
      var incidents=wpick([[0,94],[1,5],[2,1]]);
      var av=rnd()<0.62?{kind:"icon",icon:ICONS[(n*7+w.slug.length)%ICONS.length],tone:TONES[n%3]}:{kind:"initials",text:slug.split("-").map(function(s){return s.charAt(0).toUpperCase();}).join("").slice(0,3),font:FONTS[n%3],tone:TONES[(n+1)%3]};
      var made={key:"a-intel."+x.pre+"."+slug,name:title(slug),harness:hn[0],harnessLabel:hn[1],ws:w.slug,operator:wpick(ops),status:"enrolled",
        tier:tier,tierNative:tierNative,belt:ri(3,58),beltMode:rnd()<0.72?"full":"searchable",runs30:runs30,spend30:m2(spend),proven30:m2(proven),ratio:ratio,
        digest:"sha256:"+hex(16),commit:x.head,budget:m2(pick([0.4,0.6,0.8,1,1.5,2,3])),budgetUsed:Math.round(rf(0.05,0.98)*100)/100,
        desc:DESC[base]||("Runs "+title(base).toLowerCase()+" for "+w.name+". Opens a pull request or a proposal; never merges, never pays."),
        avatar:av,mandates:[],incidents:incidents,model:rnd()<0.6?"complex":"light"};
      perWsAgents[w.slug].push(made); madeAgents.push(made);
      n++;
    }
    w.agents=have+n;
  });
  madeAgents.forEach(function(a){AGENTS.push(a);});
  /* two more finops agents hold mandates, so the ledger has more than one line */
  var fin=perWsAgents.finops.filter(function(a){return a.key!=="a-intel.finops.invoice-bot";});
  fin[0].mandates=["mnd_3R8WQ1"]; fin[1].mandates=["mnd_9C4LZ7"];
  MANDATES.push(
    {id:"mnd_3R8WQ1",agent:fin[0].key,by:"Dana Okafor",roleAt:"org.billing",effect:"commits_spend",currency:"USD",perCall:"1,000.00",perPeriod:"40,000.00",period:"monthly",callsPerDay:20,
     used:"18,212.40",reserved:"0.00",remaining:"21,787.60",allow:"vendor:aws, vendor:gcp",deny:"*",tools:"aws_billing__purchase_savings_plan@2",approvalAbove:"500.00",alwaysFor:"commits_spend",approvers:"role:org.billing",
     purpose:"reserved capacity purchases, FY26 plan",from:"2026-07-01",to:"2027-06-30",twoPerson:true,second:"Priya Natarajan",status:"active"},
    {id:"mnd_9C4LZ7",agent:fin[1].key,by:PEOPLE[WSX.finops.owner].name,roleAt:"org.billing",effect:"moves_funds",currency:"USD",perCall:"50.00",perPeriod:"2,500.00",period:"monthly",callsPerDay:200,
     used:"1,926.00",reserved:"0.00",remaining:"574.00",allow:"customer:*",deny:"vendor:*",tools:"stripe__create_refund@*",approvalAbove:"50.00",alwaysFor:"—",approvers:"role:org.billing",
     purpose:"goodwill refunds under the support policy",from:"2026-09-01",to:"2026-09-30",twoPerson:false,second:"—",status:"active"},
    {id:"mnd_5T2HVX",agent:"a-intel.finops.invoice-bot",by:"Dana Okafor",roleAt:"org.billing",effect:"moves_funds",currency:"USD",perCall:"250.00",perPeriod:"5,000.00",period:"monthly",callsPerDay:50,
     used:"4,988.10",reserved:"0.00",remaining:"11.90",allow:"vendor:aws, vendor:github",deny:"*",tools:"stripe__create_payment@*",approvalAbove:"100.00",alwaysFor:"moves_funds",approvers:"role:org.billing",
     purpose:"monthly infrastructure invoices, PO-4471 (August)",from:"2026-08-01",to:"2026-08-31",twoPerson:true,second:"Priya Natarajan",status:"expired"});
  /* Each mandate carries its own ledger. The seed mandate's four rows are the hand-authored
     ones the page used to hardcode, including the reservation that matches the parked payment. */
  MANDATES.forEach(function(m){
    if(m.id==="mnd_7K2ETQ4"){
      /* the base mc.html carries the seed mandate's own ledger (settled and released by the approval flow); keep it */
      if(m.ledger) return;
      m.ledger=[
       {when:"08:40:19",call:"stripe__create_payment@4",amount:"2,450.00",state:"reserved",ext:"— awaiting approval",rcp:null},
       {when:"2026-09-04",call:"stripe__create_payment@4",amount:"884.60",state:"settled",ext:"pi_3QaL8f2Xk",rcp:"rcp_01K4X8…"},
       {when:"2026-09-02",call:"aws_billing__purchase_savings_plan@2",amount:"400.00",state:"settled",ext:"sp-0a4f91c",rcp:"rcp_01K4W2…"},
       {when:"2026-09-01",call:"stripe__create_payment@4",amount:"0.00",state:"released",ext:"dispatch failed · released",rcp:"rcp_01K4V7…"}];
      return;
    }
    var tool=m.tools.split(",")[0].trim().replace(/@\*$/,"@4"), rows=[], n=ri(4,11);
    for(var q=0;q<n;q++){
      var d=ri(1,28), amt=Math.min(num$(m.perCall),rf(18,num$(m.perCall)));
      var st=m.status==="expired"?"settled":wpick([["settled",82],["released",11],["reserved",7]]);
      rows.push({when:dstr(TODAY-d*86400000),call:tool,amount:st==="released"?"0.00":mc(amt),state:st,
        ext:st==="settled"?(/stripe/.test(tool)?"pi_"+ulid(10):/aws/.test(tool)?"sp-"+hex(7):"ext_"+ulid(8)):st==="reserved"?"— awaiting approval":"dispatch failed · released",
        rcp:st==="reserved"?null:"rcp_01K"+ulid(4)+"…",_d:d});
    }
    rows.sort(function(a,b){return a._d-b._d;});
    rows.forEach(function(x){delete x._d;});
    m.ledger=rows;
  });
  var agentsBy={}; AGENTS.forEach(function(a){agentsBy[a.key]=a;});

  /* ---------- repos, branches, sources, ontology ---------- */
  var repoSeen={}; REPOS.forEach(function(r){repoSeen[r.n]=1;});
  newWS.forEach(function(w){[w.main].concat(w.linked).forEach(function(rn){
    if(repoSeen[rn])return; repoSeen[rn]=1;
    var sym=ri(4000,90000), main=rn===w.main;
    REPOS.push({n:rn,role:main?"main":"linked",branch:main?w.branch:"main",head:main?w.head:hex(7),indexed:pick(["2 min ago","4 min ago","9 min ago","31 min ago","1 h ago"]),
      issues:rnd()<0.7?"enabled · "+ic(ri(120,4200))+" imported":"disabled",events:"ok · "+ic(ri(200,9000))+" deliveries / 30d · "+(rnd()<0.8?"0 gaps":"1 gap recovered"),symbols:sym,drift:rnd()<0.7?"none":ri(1,4)+" data-layer finding"+(rnd()<0.5?"":"s")});
    SOURCES.push({n:"GitHub · "+rn,kind:"github",records:ri(9000,160000),last:pick(["2 min ago","6 min ago","14 min ago","1 h ago"]),health:rnd()<0.9?"ok":"degraded",cursor:"delivery "+hex(8),entities:main?"Repository, PullRequest, Issue, File, Symbol":"Repository, PullRequest, Issue"});
  });});
  SOURCES.push({n:"Zendesk · support",kind:"zendesk",records:184201,last:"3 min ago",health:"ok",cursor:"cursor 2026-09-11T09:11Z",entities:"Ticket, Customer, Macro"},
    {n:"Salesforce · sales cloud",kind:"salesforce",records:61340,last:"12 min ago",health:"ok",cursor:"SystemModstamp 2026-09-11T09:02Z",entities:"Account, Opportunity, Contract"},
    {n:"Snowflake · analytics (14 tables)",kind:"snowflake",records:2210044,last:"41 min ago",health:"ok",cursor:"stream offset 91,204",entities:"Customer, Device, Event"},
    {n:"Datadog · monitors",kind:"datadog",records:3122,last:"1 min ago",health:"ok",cursor:"monitor.modified 2026-09-11T09:13Z",entities:"Monitor, Service, Incident"},
    {n:"PagerDuty · a-intel",kind:"pagerduty",records:1188,last:"5 min ago",health:"ok",cursor:"page 12",entities:"Incident, Service, Schedule"});
  CLASSES.push({n:"Service",ents:212,fresh:"1 min",src:"Datadog, PagerDuty, GitHub",rel:"OWNED_BY, DEPLOYS_FROM, ALERTS_ON",cited:1502,rules:5,proven:44,drift:0,builtin:false},
    {n:"Account",ents:9114,fresh:"12 min",src:"Salesforce",rel:"HAS_CONTRACT, OWNS_DEVICE, RAISED_TICKET",cited:2210,rules:3,proven:18,drift:1,builtin:false},
    {n:"Opportunity",ents:3402,fresh:"12 min",src:"Salesforce",rel:"FOR_ACCOUNT, OWNED_BY",cited:640,rules:2,proven:2,drift:0,builtin:false},
    {n:"Monitor",ents:3122,fresh:"1 min",src:"Datadog",rel:"WATCHES_SERVICE, PAGES",cited:880,rules:4,proven:31,drift:0,builtin:false},
    {n:"Pipeline",ents:1408,fresh:"4 min",src:"GitHub (dbt), Snowflake",rel:"READS, WRITES, SCHEDULED_BY",cited:1930,rules:6,proven:52,drift:2,builtin:false},
    {n:"Macro",ents:612,fresh:"3 min",src:"Zendesk",rel:"USED_ON, WRITTEN_BY",cited:410,rules:1,proven:0,drift:0,builtin:false});
  ONTVERSIONS.push({v:"v16",state:"superseded",commit:hex(7),at:"2026-08-04 15:10",by:"Priya Natarajan",pr:"a-intel/platform#402",diff:"+3 classes (Service, Monitor, Pipeline), +6 relations"},
    {v:"v15",state:"superseded",commit:hex(7),at:"2026-07-11 10:40",by:PEOPLE[WSX["data-platform"].owner].name,pr:"a-intel/platform#361",diff:"+2 classes (Account, Opportunity), Salesforce source bound"},
    {v:"v14",state:"superseded",commit:hex(7),at:"2026-06-20 09:05",by:"Marcus Bell",pr:"a-intel/platform#318",diff:"+1 class (Macro), +2 properties on Ticket"},
    {v:"v13",state:"superseded",commit:hex(7),at:"2026-05-30 16:22",by:"Marcus Bell",pr:"a-intel/platform#270",diff:"+4 properties on Customer, retired 1 relation"});
  BRANCHES.push({name:"agents/triage-reproduce-first",pr:"a-intel/platform#521",ahead:3,by:"marcus",when:"3 hours ago"},
    {name:"context/ctx.core.migration-order",pr:"a-intel/platform#520",ahead:1,by:"marcus",when:"yesterday"},
    {name:"agents/pr-reviewer-belt-narrow",pr:null,ahead:2,by:people[8].key,when:"yesterday"},
    {name:"ops/slack-schema-approval",pr:"a-intel/platform#515",ahead:6,by:"priya",when:"2 days ago"},
    {name:"agents/dependency-bot-weekly",pr:"a-intel/platform#509",ahead:1,by:people[3].key,when:"4 days ago"});

  /* ---------- tool servers and the registry ---------- */
  var SRV_TOOLS={
    github:["create_issue","list_issues","get_issue","update_issue","add_issue_comment","list_commits","get_commit","create_branch","list_branches","push_files","search_code","list_releases","get_release","request_review","fork_repository","delete_file","create_repository","get_me","list_workflows","run_workflow","get_workflow_run","list_tags","get_tag","search_repositories","list_collaborators","add_collaborator","remove_collaborator","create_label","update_pull_request","list_pull_request_files","get_pull_request_diff","create_review","dismiss_review","list_deployments","create_deployment","list_secrets","set_secret","list_webhooks","create_webhook","get_repository"],
    linear:["create_issue","get_issue","list_issues","search_issues","add_comment","list_projects","get_project","create_project","update_project","list_cycles","get_cycle","list_teams","list_users","assign_issue","set_priority","link_issue","archive_issue"],
    stripe:["get_payment","list_payments","get_customer","list_customers","create_customer","update_customer","list_invoices","get_invoice","finalize_invoice","void_invoice","create_payout","list_payouts","get_balance","list_charges","get_charge","list_disputes","submit_dispute_evidence","create_subscription","cancel_subscription","list_prices","list_products"],
    "aws-billing":["get_forecast","list_budgets","update_budget","get_reservation_coverage","list_savings_plans","get_anomalies","get_rightsizing","tag_resource"],
    slack:["get_channel","list_users","get_user","send_dm","update_message","delete_message","add_reaction","pin_message","create_channel","archive_channel","set_topic","search_messages"],
    snowflake:["list_tables","describe_table","list_schemas","get_query_history","cancel_query","create_stage"],
    oxagen:["expand_entity","recall_context","get_run","list_runs","read_frame","list_frames","propose_record","open_context_pr","get_agent","list_agents","get_policy","simulate_policy","list_receipts","get_receipt","export_bundle","verify_bundle","get_budget","set_preferences","list_mandates","draw_mandate","get_witness","run_witness","search_tools","describe_tool","request_approval","check_approval","get_ontology","diff_ontology","list_sources","get_source_cursor","score_candidates","compose_context","summarize_run","reflect_run","promote_finding","list_findings","get_spend","list_switches","read_switch","enqueue_export"],
    harness:["Read","Edit","Write","Glob","Grep","WebFetch","WebSearch","Agent","NotebookEdit","apply_patch","shell","update_plan","view_image","exec","file_write","file_read","git_commit","git_diff"],
    jira:["create_issue","get_issue","search_issues","update_issue","transition_issue","add_comment","list_boards","get_sprint","list_sprints","assign_issue","link_issues","add_attachment","list_projects","get_project","create_version","list_components","add_watcher","get_changelog","list_filters","run_filter","bulk_update","delete_issue","create_epic","list_epics","get_worklog","add_worklog"],
    datadog:["list_monitors","get_monitor","mute_monitor","unmute_monitor","create_monitor","query_metrics","search_logs","list_incidents","get_incident","create_incident","list_dashboards","get_dashboard","list_slos","get_slo","list_services","get_service","post_event"],
    pagerduty:["list_incidents","get_incident","acknowledge_incident","resolve_incident","create_incident","list_schedules","get_oncall","list_services","add_note","escalate_incident","snooze_incident"],
    salesforce:["query","get_account","update_account","list_accounts","get_opportunity","update_opportunity","create_opportunity","get_contact","create_contact","update_contact","list_contracts","get_contract","create_task","list_cases","get_case","update_case","create_case","close_case","describe_object","get_report","run_report","list_leads","convert_lead","send_email"],
    gdrive:["search_files","get_file","read_file","create_file","update_file","copy_file","move_file","trash_file","share_file","list_permissions","export_file","list_recent","get_folder","create_folder","list_revisions"],
    "postgres-prod":["run_query","explain","list_tables","describe_table","list_indexes","get_table_stats","list_slow_queries","kill_query"],
    kubernetes:["list_pods","get_pod","get_logs","describe_pod","delete_pod","list_deployments","get_deployment","scale_deployment","rollout_restart","rollout_undo","list_services","list_nodes","get_node","cordon_node","drain_node","list_events","apply_manifest","list_jobs","create_job","get_configmap","list_namespaces"],
    sentry:["list_issues","get_issue","resolve_issue","ignore_issue","assign_issue","list_events","get_event","search_events","list_releases","create_release","list_projects","get_project_stats"],
    hubspot:["get_contact","search_contacts","create_contact","update_contact","get_company","search_companies","update_company","list_deals","get_deal","update_deal","create_deal","list_sequences","enroll_contact","send_email","list_lists","add_to_list","get_engagement","create_note","list_owners"],
    notion:["search","get_page","create_page","update_page","get_database","query_database","create_database_item","update_database_item","append_block","get_block","delete_block","list_users","get_comments"],
    zendesk:["get_ticket","search_tickets","update_ticket","create_ticket","add_comment","assign_ticket","merge_tickets","list_macros","apply_macro","get_user","search_users","suspend_user","list_views","run_view","get_satisfaction","send_reply"]
  };
  var SRV_META={
    github:{cred:"github_app → installation token",eg:"third_party"}, linear:{cred:"oauth → token exchange",eg:"third_party"}, stripe:{cred:"api_key → restricted key",eg:"third_party"},
    "aws-billing":{cred:"cloud_role → STS session policy",eg:"third_party"}, slack:{cred:"oauth → token exchange",eg:"third_party"}, snowflake:{cred:"api_key → none",eg:"internal"},
    oxagen:{cred:"none",eg:"none"}, harness:{cred:"none",eg:"none"}, jira:{cred:"oauth → token exchange",eg:"third_party"}, datadog:{cred:"api_key → scoped app key",eg:"third_party"},
    pagerduty:{cred:"oauth → token exchange",eg:"third_party"}, salesforce:{cred:"oauth → token exchange",eg:"third_party"}, gdrive:{cred:"oauth → token exchange",eg:"third_party"},
    "postgres-prod":{cred:"cloud_role → IAM auth token",eg:"internal"}, kubernetes:{cred:"cloud_role → short-lived kubeconfig",eg:"internal"}, sentry:{cred:"api_key → org token",eg:"third_party"},
    hubspot:{cred:"oauth → token exchange",eg:"third_party"}, notion:{cred:"oauth → token exchange",eg:"third_party"}, zendesk:{cred:"oauth → token exchange",eg:"third_party"}
  };
  var NEW_SRV=[
    {id:"jira",name:"jira",kind:"MCP",transport:"streamable-http",url:"https://mcp.atlassian.com/a-intel",health:"ok",imported:"2026-08-21 10:02 UTC",conn:"Atlassian OAuth · a-intel",schemas:"declared"},
    {id:"datadog",name:"datadog",kind:"MCP",transport:"streamable-http",url:"https://mcp.datadoghq.com",health:"ok",imported:"2026-09-01 07:40 UTC",conn:"Datadog app key · infra",schemas:"declared"},
    {id:"pagerduty",name:"pagerduty",kind:"MCP",transport:"streamable-http",url:"https://mcp.pagerduty.com",health:"ok",imported:"2026-08-11 12:18 UTC",conn:"PagerDuty OAuth · a-intel",schemas:"declared"},
    {id:"salesforce",name:"salesforce",kind:"MCP",transport:"streamable-http",url:"https://mcp.salesforce.com/a-intel",health:"ok",imported:"2026-08-30 15:55 UTC",conn:"Salesforce connected app · growth",schemas:"declared"},
    {id:"gdrive",name:"gdrive",kind:"MCP",transport:"streamable-http",url:"https://mcp.google.com/drive",health:"ok",imported:"2026-07-19 09:12 UTC",conn:"Google Workspace OAuth · a-intel",schemas:"declared"},
    {id:"postgres-prod",name:"postgres-prod",kind:"HTTP",transport:"https",url:"https://tools.a-intel.internal/pg",health:"ok",imported:"2026-06-02 08:30 UTC",conn:"IAM auth · aintel_prod read replica",schemas:"declared by admin"},
    {id:"kubernetes",name:"kubernetes",kind:"MCP",transport:"stdio",url:"oxagen-run k8s-mcp@2.3.1",health:"degraded",imported:"2026-09-08 18:05 UTC",conn:"short-lived kubeconfig · prod-east",schemas:"2 observed, awaiting approval"},
    {id:"sentry",name:"sentry",kind:"MCP",transport:"streamable-http",url:"https://mcp.sentry.dev",health:"ok",imported:"2026-08-26 11:44 UTC",conn:"Sentry org token · mobile",schemas:"declared"},
    {id:"hubspot",name:"hubspot",kind:"MCP",transport:"streamable-http",url:"https://mcp.hubspot.com",health:"ok",imported:"2026-09-03 13:20 UTC",conn:"HubSpot OAuth · growth",schemas:"declared"},
    {id:"notion",name:"notion",kind:"MCP",transport:"streamable-http",url:"https://mcp.notion.com",health:"ok",imported:"2026-07-28 16:01 UTC",conn:"Notion OAuth · a-intel",schemas:"declared"},
    {id:"zendesk",name:"zendesk",kind:"MCP",transport:"streamable-http",url:"https://mcp.zendesk.com/a-intel",health:"ok",imported:"2026-08-15 09:48 UTC",conn:"Zendesk OAuth · support",schemas:"declared"}
  ];
  NEW_SRV.forEach(function(s){s.tools=0;s.versions=0;SERVERS.push(s);});
  var srvBy={}; SERVERS.forEach(function(s){srvBy[s.id]=s;});
  var toolSeen={}; TOOLS.forEach(function(t){toolSeen[t.n+"@"+t.v]=1;});
  var IRREV=/^(delete|drain|kill|void|cancel|merge|resolve|close|payout|convert|create_release|rollout_undo|suspend|remove|trash|purge|destroy)/;
  var WRITE=/^(create|update|add|set|push|apply|scale|assign|transition|send|post|mute|unmute|acknowledge|escalate|snooze|enroll|share|move|copy|append|finalize|submit|tag|pin|archive|fork|run_workflow|run_|write|edit|dismiss|link|bulk|open|propose|draw|request|enqueue|compose|promote|reflect|summarize|score|cordon|Edit|Write|NotebookEdit|apply_patch|exec|shell|file_write|git_commit)/;
  var toolPool=[];
  Object.keys(SRV_TOOLS).forEach(function(sid){
    var s=srvBy[sid], meta=SRV_META[sid];
    SRV_TOOLS[sid].forEach(function(local,i){
      var n=(sid==="harness"?(i<9?"claude_code__":"codex_cli__"):sid.replace(/-/g,"_")+"__")+local;
      var eff=IRREV.test(local)?"irreversible":WRITE.test(local)?"write":"read";
      var fin=/payout|refund|payment|purchase/.test(local)?(/purchase/.test(local)?"commits_spend":"moves_funds"):"none";
      var risk=eff==="irreversible"?(rnd()<0.6?"critical":"high"):eff==="write"?(rnd()<0.75?"medium":"high"):(rnd()<0.85?"low":"medium");
      if(fin!=="none")risk="critical";
      var nv=wpick([[1,34],[2,28],[3,20],[4,12],[5,6]]), top=ri(1,8);
      for(var v=0;v<nv;v++){
        var ver=String(top-v>0?top-v:1), id=n+"@"+ver; if(toolSeen[id])continue; toolSeen[id]=1;
        var cur=v===0, calls=cur?Math.round(skew(0,9000,3)):Math.round(skew(0,400,3));
        var origin=sid==="oxagen"||sid==="harness"||sid==="postgres-prod"||sid==="aws-billing"?"declared":wpick([["imported",86],["observed_approved",10],["observed",4]]);
        var row={n:n,v:ver,s:sid,risk:risk,eff:eff,eg:meta.eg,fin:fin,origin:origin,dig:origin==="observed"?"sha256:pending":"sha256:"+hex(6)+"…",
          price:sid==="snowflake"||sid==="postgres-prod"?"0.04":sid==="aws-billing"||sid==="datadog"?"0.01":"0.00",cred:meta.cred,belts:cur?ri(0,34):ri(0,6),calls30:calls};
        if(origin==="observed")row.proposal=true;
        if(fin!=="none"){row.amount="$.amount";row.currency="$.currency";row.party=fin==="moves_funds"?"$.destination":"vendor:aws";row.idem="$.idempotency_key";}
        TOOLS.push(row); if(cur)toolPool.push(row);
      }
    });
  });
  SERVERS.forEach(function(s){var ns={},nv=0;TOOLS.forEach(function(t){if(t.s===s.id){ns[t.n]=1;nv++;}});s.tools=Object.keys(ns).length;s.versions=nv;});
  var CONN_KIND={jira:"oauth",datadog:"api_key",pagerduty:"oauth",salesforce:"oauth",gdrive:"oauth","postgres-prod":"cloud_role",kubernetes:"cloud_role",sentry:"api_key",hubspot:"oauth",notion:"oauth",zendesk:"oauth"};
  var ci=0;
  NEW_SRV.forEach(function(s){
    var kind=CONN_KIND[s.id], owner=pick(OPS), rev=ri(10,110);
    CONNECTIONS.push({id:"con_01K"+ulid(3),kind:kind,name:{oauth:title(s.id)+" · a-intel workspace",api_key:title(s.id)+" · scoped key",cloud_role:title(s.id)+" · role, "+(s.id==="kubernetes"?"prod-east":"read replica")}[kind],owner:PEOPLE[owner].name,
      servers:s.id,reviewed:dstr(TODAY-rev*86400000),next:dstr(TODAY+(90-rev)*86400000),grants30:Math.round(skew(20,9000,2.4)),status:rev>85?"review due":"active",downscope:{oauth:"token exchange",api_key:"scoped key",cloud_role:"session policy"}[kind]});
    ci++;
  });

  /* ---------- policies, records, proposals ---------- */
  var POL_NOTES=["Adds the datadog and pagerduty servers to the infra class; mute_monitor needs approval.","Requires two approvers for any moves_funds call above $1,000.","Narrows every support agent to read-only on customer PII fields.",
    "Raises kubernetes delete_pod and drain_node to approval in prod-east.","Denies salesforce send_email for every agent; a person sends.","Adds the hubspot server; enroll_contact requires approval."];
  POL_NOTES.forEach(function(note,i){
    var v=39-i, d=TODAY-(18+i*11)*86400000;
    POLICIES.push({v:"pol_v"+v,state:"superseded",by:pick(["Priya Natarajan","Marcus Bell",PEOPLE[WSX.security.owner].name]),at:dstr(d)+" "+pad(ri(8,18))+":"+pad(ri(0,59)),rules:36-i,tests:(38-i)+" / "+(38-i)+" pass",note:note});
  });
  var REC_ST={
    rule:["Every pull request description names the issue it closes and the test that proves it.","Post to a shared channel only after the run has a sealed verdict.","Prefer the workspace's own retry helper over ad-hoc loops.","Cite the receipt id when reporting money moved.","Group release notes by surface, never by author.","Ask before touching a file outside the task's directory.","Write the reproduction command into the issue before labelling it."],
    constraint:["Never merge. A person merges.","Never send email to a customer address; draft only.","Never write to a production table; read replicas only.","Never delete a pod in prod-east without an approval token.","No agent may rotate a credential it holds.","Refunds above the mandate ceiling go to a human, not to deny."],
    procedure:["Reproduce, then bisect, then open the issue with the introducing commit.","Plan, wait for review, apply only after the plan comment is approved.","Read the runbook page named by the alert before any remediation call.","Backfill in day-sized partitions; verify row counts after each."],
    fact:["The production branch of a-intel/mobile is release, not main.","Invoices for PO-4471 arrive on the 3rd business day of the month.","prod-east has three availability zones; prod-west has two.","The support SLA is four hours for priority one, one business day otherwise.","aintel_prod.customers has 1.46M rows and a soft-delete column."],
    memory:["The July savings-plan purchase was reverted; do not recommend the same term again.","Slack shipped an unapproved schema change on 2026-09-10; the server switch is on.","Customer 8841 asked never to be contacted by email.","The eval harness's baseline moved on 2026-08-19; compare against v3 numbers."],
    preference:["Marcus prefers release notes in past tense.","The support team wants macros suggested, not applied.","Growth prefers campaign briefs as a table, not prose.","Dana wants spend digests before 07:00 UTC."]
  };
  var REC_AREA={"core-platform":"core",finops:"finops","data-platform":"data",support:"support",security:"sec",growth:"growth",mobile:"mobile",research:"research",infra:"infra"};
  var recSeen={}; RECORDS.forEach(function(r){recSeen[r.id]=1;});
  var recN=0;
  WS.forEach(function(w){
    var n=ri(4,9);
    for(var i=0;i<n;i++){
      var kind=wpick([["rule",34],["constraint",22],["procedure",12],["fact",14],["memory",10],["preference",8]]);
      var st=REC_ST[kind][(recN+i)%REC_ST[kind].length], id="ctx."+REC_AREA[w.slug]+"."+st.toLowerCase().replace(/[^a-z0-9 ]/g,"").split(" ").filter(Boolean).slice(0,4).join("-");
      var k2=0; while(recSeen[id]){id=id+"-"+(++k2+1);} recSeen[id]=1;
      var force=kind==="constraint"?"must":kind==="rule"||kind==="procedure"?(rnd()<0.75?"should":"must"):kind==="preference"?"may":"info";
      var row={id:id,kind:kind,force:force,scope:wpick([["workspace",60],["repository",25],["organization",15]]),status:rnd()<0.86?"published":"archived",st:st,
        effect:"rendered "+ic(ri(20,2400))+" · cited "+ic(ri(5,1800))+" · violated "+ri(0,9),commit:WSX[w.slug].head,pub:dstr(TODAY-ri(2,200)*86400000)};
      if(kind==="constraint")row.ce=rnd()<0.7?"forbid":"require"; else if(kind==="rule"&&rnd()<0.5)row.ce="require";
      RECORDS.push(row); recN++;
    }
  });
  PROPOSALS.push({id:"prp_01K5RV1D",lineage:"ctx.support.reply-in-customers-language",kind:"rule",force:"should",from:"findings job · fnd_01K5RU9Q",st:"Draft the first reply in the language the ticket was written in.",support:"212 tickets re-routed for language in 30 days",state:"open Context PR",pr:"a-intel/support-console#188",checks:"6 / 6 pass"},
    {id:"prp_01K5RV3F",lineage:"ctx.infra.plan-before-apply",kind:"procedure",force:"must",from:"reflector · run_01K5R"+ulid(11),st:"Post the plan and wait for a review comment before any apply call.",support:"3 halted runs, 1 incident",state:"candidate",pr:"—",checks:"—"},
    {id:"prp_01K5RV6H",lineage:"ctx.data.backfill-partitions",kind:"procedure",force:"should",from:PEOPLE[WSX["data-platform"].owner].name,st:"Backfill in day-sized partitions and verify row counts after each.",support:"2 quality-gate failures traced to whole-table backfills",state:"open Context PR",pr:"a-intel/data-platform#341",checks:"5 / 5 pass"},
    {id:"prp_01K5RV8K",lineage:"ctx.sec.never-rotate-own-credential",kind:"constraint",force:"must",from:PEOPLE[WSX.security.owner].name,st:"No agent may rotate a credential it holds.",support:"policy review 2026-09",state:"merged",pr:"a-intel/security-tools#77",checks:"7 / 7 pass"},
    {id:"prp_01K5RW0M",lineage:"ctx.growth.brief-as-table",kind:"preference",force:"may",from:"reflector · 14 runs",st:"Campaign briefs are a table of channel, audience, budget and owner.",support:"9 briefs rewritten by hand",state:"candidate",pr:"—",checks:"—"},
    {id:"prp_01K5RW2P",lineage:"ctx.mobile.release-branch",kind:"fact",force:"info",from:"ontology engine",st:"The production branch of a-intel/mobile is release, not main.",support:"4 runs targeted main",state:"open Context PR",pr:"a-intel/mobile#96",checks:"4 / 4 pass"});

  /* ---------- runs ---------- */
  var TASKS={
    core:["Review {pr}","Bump {dep} to {ver}","Backport {ver} to release","Reproduce: {bug}","Draft notes for {ver}","Fix flaky {test}","Migration plan: {table}","Label: {bug}"],
    finops:["{month} infrastructure invoices","Reconcile {vendor} statement","Daily spend digest","Forecast Q4 reserved capacity","PO-{po} match","Chargeback report · {ws}"],
    data:["Backfill {table} · {day}","Freshness alert · {table}","dbt run · {model}","Schema drift · {table}","Quality gate · {model}","Onboard source · {vendor}"],
    support:["Ticket #{tk} · {topic}","Refund request · order {ord}","KB draft · {topic}","SLA breach risk · #{tk}","Escalate #{tk}","Macro review · {topic}"],
    sec:["CVE-2026-{cve} · {dep}","Access review · {ws}","Secret found in {repo}","Phish report #{tk}","IAM drift · prod-east","Policy test · pol_v42"],
    growth:["Campaign brief · {camp}","Lead scoring · weekly","A/B readout · {camp}","CRM sync · {vendor}","Landing page test · {camp}","SEO draft · {topic}"],
    mobile:["Crash group #{tk}","Store release {ver}","Screenshot diff · {ver}","Localization check · {ver}","Build failure · {ver}","Review digest"],
    research:["Eval run · {model}","Ablation · {model}","Dataset curation · {topic}","Benchmark · {model}","Paper scout · weekly","Notebook cleanup"],
    infra:["Terraform plan · {pr}","Drift · prod-east","Cert rotation · {topic}","Capacity · Q4","k8s doctor · {ws}","Alert tuning · {topic}","Runbook · {topic}"]
  };
  var FILL={dep:["openssl","pydantic","react","next","tokio","serde","postgres client","grpc"],ver:["4.11.1","4.12.0","4.11.2","5.0.0-rc1","2.9.3","3.1.0"],
    bug:["checkout 500","worker restart","stale cache","timezone off by one","duplicate webhook","retry storm"],test:["test_idempotency_key","notes.contract.test.ts","test_retry_budget","export.bundle.spec"],
    table:["customers","events","invoices","devices","contracts","sessions"],month:["September","August"],vendor:["aws","gcp","datadog","snowflake","twilio","stripe"],ws:["core-platform","support","growth","infra"],
    model:["stg_orders","fct_revenue","dim_customer","eval-v3","checkpoint-0912","reranker-b"],topic:["billing","onboarding","exports","API keys","retention","SSO"],camp:["autumn-launch","q4-webinar","partner-promo","founders-letter"],
    repo:["a-intel/platform","a-intel/infra","a-intel/growth-site"]};
  function fillT(t,wsSlug){
    var wsRepos=(function(){var w=null;WS.forEach(function(x){if(x.slug===wsSlug)w=x;});return w?[w.main].concat(w.linked):["a-intel/platform"];})();
    return t.replace(/\{(\w+)\}/g,function(_,k){
    if(k==="pr")return pick(wsRepos)+"#"+ri(1200,1912);
    if(k==="po")return String(ri(4400,4499)); if(k==="tk")return String(ri(18000,24999)); if(k==="ord")return String(ri(300000,399999)); if(k==="cve")return String(ri(10000,39999)); if(k==="day")return dstr(TODAY-ri(1,40)*86400000);
    if(k==="repo")return pick(wsRepos);
    return pick(FILL[k]||["—"]);});}
  var TOUCH=["src/{x}.ts","packages/{x}/index.ts","docs/{x}.md","migrations/{n}_{x}.sql","infra/{x}.tf","models/{x}.sql","app/{x}.tsx"];
  var runIds={}; RUNS.forEach(function(r){runIds[r.id]=1;});
  var genRuns=[];
  WS.forEach(function(w){
    var ag=perWsAgents[w.slug], n=Math.round(w.agents*4.2), pre=WSX[w.slug].pre, byW=ag.map(function(a){return [a,Math.max(1,a.runs30)];});
    for(var i=0;i<n;i++){
      var a=wpick(byW), d=anyDay(), sec=daySec(d), status=wpick([["sealed",80],["live",d===0?10:0],["parked",d===0?7:0],["halted",5],["compacted",3]]);
      if(d>0&&status==="live")status="sealed";
      var verdict=status==="sealed"?wpick([["flipped",34],["unmoved",21],["waived",23],["failing",10],["unsatisfied",9],["tampered",1],[null,2]]):status==="halted"?wpick([["unsatisfied",60],[null,40]]):status==="compacted"?wpick([["flipped",50],["waived",50]]):null;
      var frames=ri(9,320), steps=Math.max(2,Math.round(frames*rf(0.18,0.32))), turn=Math.max(1,Math.round(steps*rf(0.15,0.4)));
      var cost=Math.max(0.04,frames*rf(0.006,0.03)); if(status==="halted")cost*=0.4;
      var task=fillT(pick(TASKS[pre]),w.slug), tref=/#\d+/.test(task)?task.match(/[\w./-]*#\d+/)[0]:/PO-\d+/.test(task)?task.match(/PO-\d+/)[0]:"LIN-"+ri(1200,4800);
      var id="run_01K"+(d<7?"5":d<20?"4":"3")+ulid(12), k=0; while(runIds[id]){id="run_01K5"+ulid(12);} runIds[id]=1;
      var grade=status==="compacted"?"ledger":wpick([["full",80],["partial",11],["digest",5],["ledger",4]]);
      var ratio=Math.round(rf(0.2,0.9)*100)/100, sealedAt=status==="live"||status==="parked"?null:when(d,Math.min(sec+ri(60,2400),86399),true).replace(/^\d{4}-\d\d-\d\d /,"");
      var model=a.model==="light"?wpick([["claude-haiku-4-5",70],["claude-sonnet-5",30]]):wpick([["claude-opus-5",58],["claude-sonnet-5",34],["claude-haiku-4-5",8]]);
      genRuns.push({id:id,agent:a.key,op:a.operator,ws:w.slug,status:status,turn:turn,steps:steps,frames:frames,cost:m2(cost),basis:wpick([["gateway_observed",88],["client_attested",12]]),tier:a.tier,
        grade:grade,verdict:verdict,task:tref,taskTitle:task,
        summary:(status==="live"?"In progress. ":status==="parked"?"Parked on approval. ":status==="halted"?"Halted before completion. ":"")+a.name+" worked "+task.toLowerCase()+" in "+steps+" steps over "+turn+" turn"+(turn===1?"":"s")+
          (verdict==="flipped"?"; the witness flipped from failing to passing.":verdict==="failing"?"; the witness never flipped.":verdict==="waived"?"; no test oracle applies, so the verdict is waived.":verdict==="unsatisfied"?"; the task's own check was not met.":verdict==="tampered"?"; the witness fingerprint moved, so the seal reads tampered.":"."),
        touched:[tref,pick(TOUCH).replace(/\{x\}/g,pick(["billing","export","worker","notes","retry","schema","auth","cache"])).replace(/\{n\}/,String(ri(100,240)))],
        gen:{model:"claude-haiku-4-5",when:sealedAt?"at seal "+sealedAt:"turn "+turn+" · regenerated at each turn boundary",frames:frames},
        started:when(d,sec,true),model:model,cache:Math.round(rf(0.55,0.94)*100)/100,provenSpend:verdict==="flipped"?m2(cost*rf(0.5,1)):"0.00",ratio:ratio,sealed:sealedAt,_d:d,_s:sec});
    }
  });
  genRuns.sort(function(a,b){return (a._d-b._d)||(b._s-a._s);});
  genRuns.forEach(function(r){delete r._d;delete r._s;RUNS.push(r);});

  /* a handful of parked calls in other workspaces, so the approvals queue is not one workspace's */
  var parked=genRuns.filter(function(r){return r.status==="parked";}).slice(0,14);
  parked.forEach(function(r,i){
    var a=agentsBy[r.agent], w=r.ws, fin=w==="finops"||w==="support";
    var tool=fin?(w==="support"?"stripe__create_refund@3":"aws_billing__purchase_savings_plan@2"):pick(["github__merge_pull_request@4","kubernetes__delete_pod@2","salesforce__send_email@1","datadog__mute_monitor@1","jira__delete_issue@1"]);
    var amt=fin?(w==="support"?rf(12,49):rf(600,4800)):null;
    APPROVALS.push({id:"apr_01K5R"+ulid(4),run:r.id,agent:r.agent,op:r.op,ws:w,tool:tool,risk:fin?"critical":"high",side:"irreversible",egress:tool.indexOf("kubernetes")===0?"internal":"third_party",
      amount:amt!=null?mc(amt):null,currency:amt!=null?"USD":null,counterparty:fin?(w==="support"?"customer:cus_"+ulid(6):"vendor:aws"):(tool.indexOf("github")===0?"a-intel/platform":tool.split("__")[0]),
      rule:fin?"mandate "+(w==="support"?"mnd_9C4LZ7":"mnd_3R8WQ1")+" · approval.above_micros":"role_grant rg_0"+ri(100,140)+" · effect = require_approval on side_effect:irreversible",
      mandate:fin?(w==="support"?"mnd_9C4LZ7":"mnd_3R8WQ1"):null,policy:"pol_v41",digest:"sha256:"+hex(16),waited:ri(0,8)+"m "+ri(0,59)+"s",timeout:"10m",tainted:rnd()<0.15,tier:"gateway",parkedAt:r.started.slice(-8)+"Z",
      approvers:fin?"role:org.billing — Dana Okafor, Priya Natarajan":"role:workspace.owner — "+PEOPLE[WSX[w].owner].name+", Priya Natarajan",
      rules:[{id:fin?"mandate.approval.always_for":"role_grant.effect",v:"approve",text:fin?"The mandate requires approval for every call whose financial effect is "+(w==="support"?"moves_funds":"commits_spend")+".":"The grant that admits "+tool+" requires approval for irreversible side effects."},
             {id:"policy.taint",v:"allow",text:"No argument of this call was copied from a tool output; the call is untainted."},
             {id:"fin.no_self_approval",v:"constrain",text:PEOPLE[r.op].name+" is the operator of this run and cannot resolve its own approval."}]});
  });

  /* ---------- receipts ---------- */
  var sealed=genRuns.filter(function(r){return r.status!=="live";});
  var toolW=toolPool.map(function(t){return [t,Math.max(1,t.calls30)];});
  for(var ri_=0;ri_<340;ri_++){
    var r=pick(sealed), t=wpick(toolW), a=agentsBy[r.agent], finT=t.fin!=="none";
    var dec=finT?wpick([["approve",64],["allow",22],["deny",14]])
      :t.eff==="irreversible"?wpick([["approve",48],["allow",38],["deny",14]])
      :t.eff==="write"?wpick([["allow",84],["approve",8],["deny",8]])
      :wpick([["allow",94],["deny",6]]);
    var amt=finT?rf(8,2400):null, eff=dec==="deny"?"—":t.eff==="read"?"—":t.s+"_"+ulid(8).toLowerCase();
    var ds=r.started.length>8?r.started.slice(0,10):dstr(TODAY), tm=r.started.slice(-8);
    RECEIPTS.push({id:"rcp_01K"+ulid(9),at:ds+" "+tm+"."+pad(ri(0,99))+ri(0,9)+"Z",agent:a.key,operator:PEOPLE[a.operator].name,tool:t.n+"@"+t.v,decision:dec,tier:a.tier,
      effect:eff,amount:finT?"$"+mc(amt)+" USD":"—",ws:r.ws,runId:r.id,
      who:[["Operator",PEOPLE[a.operator].name+" · usr_01K"+ulid(5)+" · "+PEOPLE[a.operator].role.split(" · ")[0]],["Agent",a.key+" · prn_01K"+ulid(4),1],["Run · turn · step",r.id+" · "+ri(1,r.turn)+" · "+ri(1,r.steps),1],["Task",r.task+" · "+r.taskTitle]],
      what:[["Tool version",t.n+"@"+t.v,1],["Schema digest","sha256:"+hex(16),1],["Input digest","sha256:"+hex(16),1]].concat(finT?[["Amount ($.amount)",Math.round(amt*1e6)+" micro-USD → $"+mc(amt)+" USD"],["Counterparty",t.fin==="moves_funds"?"customer:cus_"+ulid(6):"vendor:aws",1]]:[]).concat([["Input","retained in full · content_exact · "+ri(1,6)+" fields"]]),
      authority:[["Decision",dec==="deny"?"denied · rule rg_0"+ri(80,140):dec==="approve"?"approved by "+PEOPLE[WSX[r.ws].owner].name+" · apr_01K5R"+ulid(4):"allowed · rule rg_0"+ri(80,140)+" · "+ri(3,14)+" ms"],["Policy","pol_v41",1],["Belt",a.key+" · "+a.belt+" tool versions · "+a.beltMode],["Taint",rnd()<0.9?"untainted":"tainted · raised to approval"]],
      credential:dec==="deny"?[["Grant","none — the call never dispatched"]]:[["Grant","cg_01K5R"+ulid(4)+" · "+t.cred,1],["TTL","5 minutes · single use"],["Scope",t.s+" · "+(t.eg==="internal"?"internal":"third party")]],
      effectRows:dec==="deny"?[["External effect","none"]]:[["External effect",eff,1],["Dispatched",ds+" "+tm+"Z"],["Latency",ri(80,2400)+" ms"]],
      integrity:[["Frame",r.id+" · seq "+ri(2,r.frames),1],["Frame hash","sha256:"+hex(16),1],["Signed by",ORG.attester,1],["Segment",(r.status==="compacted"?"archived · seg_01K"+ulid(6):"hot · not yet archived")]]});
  }
  RECEIPTS.sort(function(a,b){return a.at<b.at?1:a.at>b.at?-1:0;});

  /* ---------- audit ---------- */
  var EV=[["approval.requested",10,"agent"],["approval.resolved",9,"human"],["run.proven",11,"agent"],["run.sealed",14,"agent"],["run.halted",4,"agent"],["tool_call.denied",6,"agent"],
    ["budget.breached",2,"agent"],["agent.registered",3,"human"],["agent.deregistered",1,"human"],["role.assigned",3,"human"],["role.revoked",1,"human"],["api_key.created",1,"human"],["api_key.revoked",1,"human"],
    ["invitation.sent",2,"human"],["invitation.accepted",2,"human"],["connection.reviewed",2,"human"],["credential.granted",8,"service"],["export.created",2,"human"],["export.downloaded",1,"human"],
    ["steering_published",3,"human"],["context_pr.opened",3,"service"],["policy_version.simulated",1,"human"],["kill_switch.flipped",1,"human"],["kill_switch.cleared",1,"human"],["hold.placed",1,"human"],
    ["erasure.requested",1,"human"],["reconciliation.matched",3,"service"],["schema.proposed",2,"service"],["schema.approved",1,"human"],["session.signed_in",6,"human"],["preferences.set",2,"human"]];
  var evW=EV.map(function(e){return [e,e[1]];});
  var humans=Object.keys(PEOPLE).map(function(k){return PEOPLE[k].name;}), svcs=["svc_terraform","svc_ci","svc_finops_export","reconciler","archiver","verifier","gateway","policy engine","assurance suite"];
  var riskyPool=toolPool.filter(function(t){return t.eff!=="read";});
  if(!riskyPool.length)riskyPool=toolPool;
  function evWhat(ev,who,r){
    var t=pick(/approval|denied|kill_switch|credential/.test(ev)?riskyPool:toolPool), p=pick(humans);
    switch(ev){
      case "approval.requested": return t.n+"@"+t.v+" on "+pick(REPOS).n;
      case "approval.resolved": return pick(["approved","denied","expired"])+" · apr_01K5R"+ulid(4)+" · "+t.n+"@"+t.v;
      case "run.proven": return "verdict flipped · oracle test_flip · "+r.task;
      case "run.sealed": return "verdict "+(r.verdict||"none")+" · "+r.frames+" frames · "+r.task;
      case "run.halted": return pick(["kill switch · server slack","budget reached at turn "+r.turn,"operator pause","hooks_removed"])+" · "+r.task;
      case "tool_call.denied": return t.n+"@"+t.v+" · "+pick(["outside the belt","tainted argument","mandate ceiling","kill switch"]);
      case "budget.breached": return "$"+m2(rf(0.4,3))+" per run reached at turn "+r.turn+" · paused at the model proxy";
      case "agent.registered": return r.agent+" · "+agentsBy[r.agent].harnessLabel+" · gateway tier";
      case "agent.deregistered": return "a-intel."+pick(["core","data","growth"])+"."+pick(["stale-closer","weekly-digest","summarizer"])+"-old · runs retained";
      case "role.assigned": return p+" · "+pick(["workspace.member","workspace.owner","org.auditor"])+" · "+pick(allWs);
      case "role.revoked": return p+" · workspace.member · "+pick(allWs);
      case "api_key.created": return "svc_"+pick(["export","ci","terraform","auditor"])+"_"+ulid(4).toLowerCase()+" · grants run.read · expires "+dstr(TODAY+ri(30,180)*86400000);
      case "api_key.revoked": return "svc_ci_"+ulid(4).toLowerCase()+" · unused 90 days";
      case "invitation.sent": return pick(FIRST).toLowerCase()+"@a-intel.example · "+pick(["workspace.member","org.auditor"])+" · expires "+dstr(TODAY+7*86400000);
      case "invitation.accepted": return p+" · SCIM provisioned · Okta";
      case "connection.reviewed": return pick(CONNECTIONS).name+" · next review in 90 days";
      case "credential.granted": return "cg_01K5R"+ulid(4)+" · "+t.cred+" · TTL 5m · "+t.s;
      case "export.created": return "exp_01K5R"+ulid(4)+" · "+pick(["receipt export","evidence bundle"])+" · "+pick(allWs);
      case "export.downloaded": return "exp_01K5R"+ulid(4)+" · signature verified";
      case "steering_published": return pick(RECORDS).id+" · "+pick(REPOS).n+"#"+ri(300,1900)+" merged";
      case "context_pr.opened": return pick(REPOS).n+"#"+ri(300,1900)+" · proposed by the promoter · "+ri(3,40)+" runs in support";
      case "policy_version.simulated": return "pol_v42 replayed over "+ic(ri(300000,480000))+" calls / 30 days";
      case "kill_switch.flipped": return pick(["tool version "+t.n+"@"+t.v,"agent "+r.agent,"tool server kubernetes"])+" · "+pick(["schema regression","runaway retries","operator request"]);
      case "kill_switch.cleared": return "tool server kubernetes · schema approved";
      case "hold.placed": return "hld_01K"+ulid(5)+" · "+pick(allWs)+" · retention pinned";
      case "erasure.requested": return "ers_01K"+ulid(5)+" · data subject · hashed dsr-"+ri(8000,9999);
      case "reconciliation.matched": return pick(["anthropic key pk_"+hex(4),"openai key pk_"+hex(4),"stripe · finops"])+" · "+dstr(TODAY-ri(1,3)*86400000)+" · variance $0.00";
      case "schema.proposed": return t.n+"@"+t.v+" · output schema observed, not declared";
      case "schema.approved": return t.n+"@"+t.v+" · proposal accepted by "+p;
      case "session.signed_in": return "Okta · "+pick(["macOS · Chrome","macOS · Safari","Windows · Edge","iOS · app"])+" · MFA "+pick(["passkey","TOTP"]);
      case "preferences.set": return pick(["digest hour 07:00 UTC","theme system","notifications: approvals only"]);
    }
    return "";
  }
  var genAudit=[];
  for(var ai=0;ai<430;ai++){
    var e=wpick(evW), d=anyDay(), sec=daySec(d), r=pick(genRuns.concat(RUNS.slice(0,14)));
    var who=e[2]==="agent"?r.agent:e[2]==="service"?pick(svcs):pick(humans);
    var sev=e[0]==="tool_call.denied"||e[0]==="run.halted"||e[0]==="kill_switch.flipped"||e[0]==="budget.breached"?"warning":e[0]==="approval.resolved"&&rnd()<0.2?"warning":"info";
    if(rnd()<0.012)sev="critical";
    var ref=e[0].indexOf("run.")===0||e[0]==="approval.requested"?r.id:e[0].indexOf("api_key")===0?"svc_"+ulid(6).toLowerCase():e[0].indexOf("export")===0?"exp_01K5R"+ulid(4):e[0].indexOf("hold")===0?"hld_01K"+ulid(5):e[0]==="steering_published"?hex(7):"evt_01K"+ulid(6);
    genAudit.push({t:when(d,sec,d===0),ev:e[0],who:who,what:evWhat(e[0],who,r),sev:sev,ref:ref,_k:(30-d)*86400+sec});
  }
  function auditKey(t){var m=t.match(/^(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d)/); if(m){var d=Math.round((TODAY-Date.UTC(+m[1],+m[2]-1,+m[3]))/86400000);return (30-d)*86400+(+m[4])*3600+(+m[5])*60;} var h=t.match(/^(\d\d):(\d\d)(?::(\d\d))?$/); return h?30*86400+(+h[1])*3600+(+h[2])*60+(+h[3]||0):0;}
  var seedAudit=AUDIT.splice(0,AUDIT.length).map(function(e){e._k=auditKey(e.t);return e;});
  seedAudit.concat(genAudit).sort(function(a,b){return b._k-a._k;}).forEach(function(e){delete e._k;AUDIT.push(e);});

  /* ---------- incidents, holds, exports, erasure, keys ---------- */
  var INC=[["warning","Kill switch flipped on a tool server","kill_switch","tool server kubernetes · 2 observed output schemas","k8s-mcp 2.3.1 changed the shape of get_logs and list_pods output. The gateway recorded the outputs, inferred a schema and parked both as proposals; the server switch is on until an admin approves."],
    ["critical","Budget breached three times in one hour","budget_breach","{agent} · {ws}","The agent hit its per-run ceiling on three consecutive runs while retrying the same failing command. Each run paused at the model proxy before the next call; no tool call was dispatched past the ceiling."],
    ["warning","Approval expired with money reserved","approval_expired","{agent} · finops","No approver resolved the parked payment inside ten minutes. The mandate released the reservation; nothing moved. The operator was paged by the reconciler."],
    ["info","Tainted argument raised to approval","taint_raised","{agent} · {ws}","A shell argument was copied byte-for-byte from a tool result. Policy raised the call to approval; the operator denied it and the run halted cleanly."],
    ["warning","Client-attested frames with no provider request id","attestation_gap","{agent} · harness tier","Nine frames from a harness-tier agent carry no provider request id and match the provider ledger only at level 2. Reconciliation for the key-day reports a variance under the threshold."],
    ["critical","Hooks removed on an enrolled host","hooks_removed","{agent} · mbp-{n}","The host's harness settings lost the Oxagen hooks between two checkpoints. The collector halted the run at the next boundary and the agent's tier fell to observe until re-enrolment."],
    ["info","Runaway retries on a read tool","retry_storm","{agent} · {ws}","The agent called the same read tool 212 times in one turn after a 429. The belt's retry budget denied the 213th; the run sealed unsatisfied."],
    ["warning","Access review overdue on a governed connection","review_overdue","{conn}","The quarterly review of this connection is past due. Grants continue; the connection is flagged on the Tools page until an owner reviews it."]];
  for(var ii=0;ii<19;ii++){
    var inc=INC[ii%INC.length], r=pick(genRuns), d=ri(0,60), open=d<9?rnd()<0.7:rnd()<0.12;
    var scope=inc[3].replace("{agent}",r.agent).replace("{ws}",r.ws).replace("{n}",pad(ri(2,40))).replace("{conn}",pick(CONNECTIONS).name);
    INCIDENTS.push({id:"inc_01K"+ulid(6),sev:inc[0],title:inc[1],kind:inc[2],at:stamp(d,daySec(d)),by:pick(["reconciler","assurance suite","gateway","policy engine",pick(humans)]),scope:scope,detail:inc[4],
      resolution:open?"Open. "+PEOPLE[WSX[r.ws].owner].name+" owns it; the next step is recorded on the incident when it happens.":"Resolved. "+pick(["The schema proposal was approved and the switch cleared.","The agent's definition was narrowed in a merged pull request.","The connection was reviewed and its scope narrowed.","The host was re-enrolled and the tier restored."]),
      status:open?"open":"resolved",owner:PEOPLE[WSX[r.ws].owner].name,due:open?dstr(TODAY+ri(2,20)*86400000):"",closedAt:open?"":stamp(Math.max(0,d-ri(1,6)),daySec(1)),closedBy:open?"":PEOPLE[WSX[r.ws].owner].name,runs:ri(0,14)});
  }
  /* Tamper incidents are read off the register (agentTamper: a TAMPER_KINDS kind whose scope
     starts with the agent key), so an agent's count and the register can never disagree. Give
     every generated agent flagged with incidents that many register rows, then derive the count
     back from the register rather than trusting the flag. Seed agents are left as authored. */
  var TK=["hooks_removed","chain_break","unknown_tool","credential_probe","witness_probe","seq_conflict"];
  var TK_DETAIL={
    hooks_removed:"The host's harness settings lost the Oxagen hooks between two checkpoints. The collector halted the run at the next boundary and the agent's tier fell to observe until re-enrolment.",
    chain_break:"A frame arrived whose previous-hash did not match the sealed frame before it. Every later frame on the run was marked unverifiable and the run sealed tampered.",
    unknown_tool:"The agent called nine tool names that are not on its belt inside one turn. Each was denied before dispatch; the burst tripped the detector and paused the run.",
    credential_probe:"The agent tried to read the credential grant behind a tool call instead of calling the tool. The broker refused, and the attempt is recorded as a security event.",
    witness_probe:"The agent read the witness test's expected output before the witness ran. The verdict for the run was withheld and the run sealed unsatisfied.",
    seq_conflict:"Two frames arrived with the same sequence number and different hashes. The second was rejected and the run sealed with a gap noted in its completeness record."};
  var tkSeen=0;
  madeAgents.forEach(function(a){
    for(var q=0;q<(a.incidents||0);q++){
      var kind=TK[(tkSeen++)%TK.length], d=ri(1,80), open=d<10&&rnd()<0.5;
      INCIDENTS.push({id:"inc_01K"+ulid(6),sev:kind==="hooks_removed"||kind==="chain_break"?"critical":"warning",title:title(kind.replace(/_/g,"-"))+" on "+a.name,kind:kind,
        at:stamp(d,daySec(d)),by:kind==="hooks_removed"?"collector":"gateway",scope:a.key+" · "+(kind==="hooks_removed"?"host mbp-"+pad(ri(2,40)):"run_01K"+ulid(12)),detail:TK_DETAIL[kind],
        resolution:open?"Open. "+PEOPLE[a.operator].name+" owns it; the agent stays at observe tier until it closes.":"Resolved. The host was re-enrolled and the next run verified end to end.",
        status:open?"open":"resolved",owner:PEOPLE[a.operator].name,due:open?dstr(TODAY+ri(2,14)*86400000):"",
        closedAt:open?"":stamp(Math.max(0,d-ri(1,5)),daySec(1)),closedBy:open?"":PEOPLE[a.operator].name,runs:ri(1,6)});
    }
  });
  var TAMPER=(typeof TAMPER_KINDS!=="undefined"&&TAMPER_KINDS)||{hooks_removed:1,chain_break:1,credential_probe:1,witness_tampered:1,unknown_tool:1,witness_probe:1,receipt_modified:1,seq_conflict:1};
  madeAgents.forEach(function(a){
    a.incidents=INCIDENTS.filter(function(i){return TAMPER[i.kind]&&String(i.scope).indexOf(a.key)===0;}).length;
  });
  HOLDS.push({id:"hld_01K5Q2RT",matter:"Customer dispute — refunds, August",scope:"agent "+fin[1].key+" · runs 2026-08-01 to 2026-08-31",by:"Priya Natarajan",placed:"2026-09-02 10:15",released:"—",st:"active",note:"Blocks erasure and retention expiry for 212 runs while the dispute is open."},
    {id:"hld_01K4M7QA",matter:"Security review — prod-east access",scope:"workspace infra · all runs",by:PEOPLE[WSX.security.owner].name,placed:"2026-08-20 14:00",released:"—",st:"active",note:"Placed after the hooks_removed incident; released when the review closes."},
    {id:"hld_01K2Z9XD",matter:"SOC 2 evidence window",scope:"organization · all runs 2026-04-01 to 2026-06-30",by:"Priya Natarajan",placed:"2026-07-01 09:00",released:"2026-08-12 17:30",st:"released",note:"Auditor sampled 240 receipts; released after the report."});
  var EXP_WHAT=["Receipt export — {m}, financial class (CSV + JSON)","Evidence bundle — {ws}, {m}","Audit events — {m} (JSON)","Evidence bundle — all runs of {agent}","Spend attribution — {m} (CSV)","Receipt export — {ws}, {m}"];
  for(var ei=0;ei<9;ei++){
    var r=pick(genRuns), m=pick(["July 2026","August 2026","June 2026","Q2 2026"]), what=pick(EXP_WHAT).replace("{m}",m).replace("{ws}",r.ws).replace("{agent}",r.agent), d=ri(1,70);
    EXPORTS.push({id:"exp_01K"+ulid(6),what:what,range:m.indexOf("Q2")===0?"2026-04-01 → 2026-06-30":m.indexOf("June")===0?"2026-06-01 → 2026-06-30":m.indexOf("July")===0?"2026-07-01 → 2026-07-31":"2026-08-01 → 2026-08-31",
      runs:/Receipt|Audit|Spend/.test(what)?ic(ri(2000,90000))+" "+(/Audit/.test(what)?"events":/Spend/.test(what)?"cost records":"receipts"):ic(ri(400,6000))+" runs · "+ri(8,140)+" archive segments · "+ic(ri(40000,1400000))+" frames",
      size:/bundle/.test(what)?(rf(0.4,6.2)).toFixed(1)+" GB":ri(8,410)+" MB",at:stamp(d,daySec(d)),by:pick(["Sofia Ruiz","Dana Okafor","Priya Natarajan",pick(humans)]),st:rnd()<0.9?"ready":"expired",sig:"ed25519:"+ulid(6)+"…"+hex(4),keys:"kek_aintel_2026Q"+ri(2,3)});
  }
  for(var xi=0;xi<5;xi++){var d=ri(12,120);ERASURE.push({id:"ers_01K"+ulid(5),subject:"data subject · "+pick(["customer contact","former contractor","support requester","trial signup"])+" (hashed dsr-"+ri(7000,8800)+")",at:stamp(d,daySec(d)),by:pick(["Sofia Ruiz","Priya Natarajan"]),st:"keys destroyed",when:stamp(d-1,2*3600),scope:ic(ri(40,2600))+" bodies · "+ri(1,5)+" tombstone frames written",note:"—"});}
  var KEYN=[["Data platform exports","svc_data_export",["cost.read","run.read","export.create"]],["Grafana read-only","svc_grafana",["run.read","frame.read"]],["Support console","svc_support_console",["run.read","receipt.read"]],["Security SIEM feed","svc_siem",["audit.read","receipt.read"]],
    ["Terraform · staging","svc_terraform_stg",["workspace.write","agent.write"]],["Release pipeline","svc_release",["run.read","export.create"]],["Growth CRM sync","svc_crm_sync",["run.read"]],["Mobile CI","svc_mobile_ci",["run.read"]],["Auditor read-only — Halden LLP","svc_auditor_hll",["audit.read","receipt.read","export.read"]],["Backfill runner","svc_backfill",["run.read","cost.read"]]];
  KEYN.forEach(function(k,i){var st=wpick([["ok",70],["expiring",15],["unused",15]]),d=ri(0,20);APIKEYS.push({name:k[0],key:"ox_live_"+hex(4)+"…"+hex(3),principal:k[1],grants:k[2],by:pick(humans),last:st==="unused"?"never used":stamp(d,daySec(d))+"Z",n30:st==="unused"?0:Math.round(skew(3,9000,2.5)),expires:dstr(TODAY+(st==="expiring"?ri(5,25):ri(40,400))*86400000),st:st});});
  for(var vi=0;vi<11;vi++){var f=pick(FIRST).toLowerCase(),s=ri(0,6);INVITES.push({email:f+"."+pick(LAST).toLowerCase().replace(/[^a-z]/g,"")+"@a-intel.example",role:pick(["workspace.member · "+pick(allWs),"org.auditor","workspace.owner · "+pick(allWs)]),by:pick(humans),sent:dstr(TODAY-s*86400000),expires:dstr(TODAY+(7-s)*86400000)});}
  if(parked.length)NOTIFS.push({kind:"approval.requested",tone:"approval",unread:true,t:"15:41",title:"Approval waiting · kubernetes__delete_pod@2",body:"a-intel.infra.k8s-doctor on "+parked[0].id+" wants to delete a crash-looping pod in prod-east. Rule role_grant rg_0121. Expires 15:51."});
  NOTIFS.push(
    {kind:"run.proven",tone:"allowed",unread:false,t:"15:30",title:"Run proven · "+genRuns[3].id,body:"Witness flipped on "+genRuns[3].task+". Oracle test_flip, disclosure grain L0."},
    {kind:"budget.breached",tone:"failed",unread:false,t:"14:52",title:"Hard budget reached · "+fin[0].key,body:"$1.50 per run reached at turn 5. The run was paused at the model proxy before the call."},
    {kind:"repository.indexed",tone:"allowed",unread:false,t:"14:20",title:"Code graph current · a-intel/data-platform",body:"Push "+hex(7)+" to main indexed in 58 s. 41 files re-parsed, 190 symbols versioned."},
    {kind:"context_pr.opened",tone:"gold",unread:false,t:"11:48",title:"Context PR opened · a-intel/support-console#188",body:"The promoter proposed a rule on lineage ctx.support.reply-in-customers-language, supported by 212 tickets."});

  /* ---------- spend, billing, the numbers every page quotes ---------- */
  var spendTot=0,provenTot=0,runsTot=0; AGENTS.forEach(function(a){spendTot+=num$(a.spend30);provenTot+=num$(a.proven30);runsTot+=a.runs30;});
  var accepted=spendTot*0.17, unproven=spendTot-provenTot-accepted;
  SPEND.spend=mc(spendTot); SPEND.proven=mc(provenTot); SPEND.accepted=mc(accepted); SPEND.unproven=mc(unproven);
  SPEND.ratio=Math.round(provenTot/spendTot*100)/100; SPEND.runs=runsTot; SPEND.actions=Math.round(runsTot*14.7); SPEND.variance=mc(spendTot*0.0011); SPEND.exceptions=2;
  var byOp={}; AGENTS.forEach(function(a){var o=byOp[a.operator]=byOp[a.operator]||{p:a.operator,agents:0,runs:0,spend:0,proven:0,list:[]};o.agents++;o.runs+=a.runs30;o.spend+=num$(a.spend30);o.proven+=num$(a.proven30);o.list.push(a);});
  var ops=Object.keys(byOp).map(function(k){return byOp[k];}).sort(function(a,b){return b.spend-a.spend;});
  SPEND.byOperator=ops.map(function(o){var budget=Math.ceil(o.spend/rf(0.55,0.92)/500)*500;return {p:o.p,agents:o.agents,runs:o.runs,spend:mc(o.spend),proven:mc(o.proven),ratio:Math.round(o.proven/Math.max(1,o.spend)*100)/100,budget:mc(budget),used:Math.round(o.spend/budget*100)/100};});
  var top=AGENTS.slice().sort(function(a,b){return num$(b.spend30)-num$(a.spend30);});
  /* A seed row can carry fields the page reads beyond these (stella-ci's flipped count feeds its
     spend-per-proven-run history); rebuild the figures, keep what the seed row authored. */
  var seedByAgent={}; (SPEND.byAgent||[]).forEach(function(x){seedByAgent[x.k]=x;});
  SPEND.byAgent=top.map(function(a){var sp=num$(a.spend30),pv=num$(a.proven30);return Object.assign({},seedByAgent[a.key]||{},{k:a.key,runs:a.runs30,spend:mc(sp),proven:mc(pv),perProven:pv>0?m2(sp/Math.max(1,a.runs30*a.ratio)):"—",trend:(rnd()<0.55?"+":"-")+ri(0,18)+"%"});});
  var callsTot=Math.round(runsTot*31);
  SPEND.byModel=[{m:"claude-opus-5",calls:Math.round(callsTot*0.31),spend:mc(spendTot*0.62),cache:0.84},{m:"claude-sonnet-5",calls:Math.round(callsTot*0.33),spend:mc(spendTot*0.24),cache:0.81},
    {m:"claude-haiku-4-5",calls:Math.round(callsTot*0.34),spend:mc(spendTot*0.09),cache:0.76},{m:"z-ai/glm-latest (assistant)",calls:Math.round(callsTot*0.02),spend:mc(spendTot*0.05),cache:0.62}];
  var oldTool=SPEND.byTool.reduce(function(s,t){return s+t.spend;},0), kT=spendTot*0.78/oldTool;
  SPEND.byTool.forEach(function(t){t.calls=Math.round(t.calls*kT);t.runs=Math.round(t.runs*kT);t.spend=Math.round(t.spend*kT*100)/100;});
  toolPool.slice().sort(function(a,b){return b.calls30-a.calls30;}).slice(0,26).forEach(function(t){if(SPEND.byTool.some(function(x){return x.t===t.n;}))return;var calls=t.calls30*Math.max(1,Math.round(kT/3)),pc=rf(0.12,1.9);SPEND.byTool.push({t:t.n,s:t.s,calls:calls,runs:Math.round(calls*rf(0.3,0.95)),spend:Math.round(calls*pc*100)/100,perCall:Math.round(pc*100)/100,perRun:Math.round(pc*rf(1,3)*100)/100,note:"—"});});
  SPEND.byTool.sort(function(a,b){return b.spend-a.spend;});
  function cuts(list,key,val,n){var s=list.slice().sort(function(a,b){return val(b)-val(a);}),head=s.slice(0,n).map(function(x){return [key(x),Math.round(val(x)*100)/100];}),rest=s.slice(n).reduce(function(t,x){return t+val(x);},0);if(s.length>n)head.push([(s.length-n)+" other "+(key===agentKey?"agents":"tools"),Math.round(rest*100)/100]);return head;}
  function agentKey(a){return a.key;}
  ops.forEach(function(o){
    var sp=o.spend, tools=SPEND.byTool.slice(0,5).map(function(t){return [t.t,Math.round(sp*rf(0.04,0.22)*100)/100];}); tools.push(["(no tool call)",Math.round(sp*rf(0.1,0.25)*100)/100]);
    SPEND_DETAIL["operator:"+o.p]={cache:Math.round(rf(0.7,0.9)*100)/100,wasted:Math.round(sp*rf(0.08,0.24)*100)/100,accepted:Math.round(sp*0.17*100)/100,unproven:Math.round((sp-o.proven-sp*0.17)*100)/100,perRun:Math.round(sp/Math.max(1,o.runs)*100)/100,
      trend:(rnd()<0.6?"+":"-")+ri(0,14)+"% vs August",modelCalls:Math.round(o.runs*31),toolCalls:Math.round(o.runs*9.4),agents:cuts(o.list,agentKey,function(a){return num$(a.spend30);},4),tools:tools,
      models:[["claude-opus-5",Math.round(sp*0.62*100)/100],["claude-sonnet-5",Math.round(sp*0.24*100)/100],["claude-haiku-4-5",Math.round(sp*0.09*100)/100],["z-ai/glm-latest (assistant)",Math.round(sp*0.05*100)/100]]};
  });
  top.forEach(function(a){
    if(SPEND_DETAIL["agent:"+a.key])return; var sp=num$(a.spend30), pv=num$(a.proven30);
    SPEND_DETAIL["agent:"+a.key]={cache:Math.round(rf(0.68,0.92)*100)/100,wasted:Math.round(sp*rf(0.05,0.3)*100)/100,accepted:Math.round(sp*rf(0,0.2)*100)/100,unproven:Math.round(Math.max(0,sp-pv)*0.7*100)/100,perRun:Math.round(sp/Math.max(1,a.runs30)*100)/100,ratio:a.ratio,
      trend:(rnd()<0.55?"+":"-")+ri(0,16)+"% vs August",modelCalls:Math.round(a.runs30*rf(18,44)),toolCalls:Math.round(a.runs30*rf(4,16)),operators:[[a.operator,Math.round(sp*100)/100]],
      tools:SPEND.byTool.slice(0,4).map(function(t){return [t.t,Math.round(sp*rf(0.05,0.3)*100)/100];}).concat([["(no tool call)",Math.round(sp*rf(0.08,0.2)*100)/100]]),
      models:a.model==="light"?[["claude-haiku-4-5",Math.round(sp*0.7*100)/100],["claude-sonnet-5",Math.round(sp*0.3*100)/100]]:[["claude-opus-5",Math.round(sp*0.66*100)/100],["claude-sonnet-5",Math.round(sp*0.3*100)/100],["claude-haiku-4-5",Math.round(sp*0.04*100)/100]]};
  });
  var billable=runsTot-BILLING.runsIncluded, amount=billable*0.30, disc=amount*0.2;
  BILLING.runsUsed=runsTot; BILLING.billable=billable; BILLING.tier2=ic(billable)+" × $0.30"; BILLING.amount=mc(amount); BILLING.discountAmount="-"+mc(disc); BILLING.total=mc(amount-disc);
  BILLING.retention="13 months included · "+(spendTot/420).toFixed(1)+" GB · $0.00";
  BILLING.invoices=[]; var mon=["August","July","June","May","April","March","February","January"], base=runsTot*0.93;
  mon.forEach(function(m,i){var runs=Math.round(base*Math.pow(0.91,i)*rf(0.97,1.03)),bill=Math.max(0,runs-1000)*0.3*0.8;BILLING.invoices.push({n:"INV-2026-"+pad(8-i),p:m+" 2026",runs:runs,amt:mc(bill),st:i===0&&rnd()<0.3?"open":"paid",d:"2026-"+pad(9-i)+"-01"});});
  BILLING.meters=[{m:"Sealed runs with at least one model call",v:ic(runsTot),note:"the billable unit"},{m:"Governed actions",v:ic(SPEND.actions),note:"reported, not priced"},{m:"Retained evidence",v:(spendTot/420).toFixed(1)+" GB",note:"13 months included"},
    {m:"Runs Oxagen halted before any model call",v:ic(Math.round(runsTot*0.009)),note:"free"},{m:"In-app agent runs",v:ic(Math.round(runsTot*0.1)),note:"free"},{m:"Witness runs",v:ic(Math.round(runsTot*0.45)),note:"free"}];
  SIM.calls=SPEND.actions; SIM.nowDenied=Math.round(SIM.calls*0.0051); SIM.nowApproval=Math.round(SIM.calls*0.0264); SIM.wasDeniedNowAllowed=Math.round(SIM.calls*0.0002); SIM.unchanged=SIM.calls-SIM.nowDenied-SIM.nowApproval-SIM.wasDeniedNowAllowed;
  SIM.agentsAffected=["a-intel.core.release-manager","a-intel.core.triage","a-intel.core.docs-writer"].concat(top.slice(5,14).map(agentKey));
  SWITCHES.forEach(function(s){
    if(s.id==="ks_org")s.stops=AGENTS.length+" agents · "+ic(TOOLS.length)+" tool versions";
    if(s.id==="ks_ws")s.stops=(WS[0].agents-7)+" agents · "+ic(Math.round(TOOLS.length*0.38))+" tool versions";
    if(s.id==="ks_cls_irrev")s.stops=TOOLS.filter(function(t){return t.eff==="irreversible";}).length+" tool versions · "+Math.round(AGENTS.length*0.48)+" agents · "+RUNS.filter(function(r){return r.status==="live";}).length+" runs in flight";
    if(s.id==="ks_cls_egress")s.stops=TOOLS.filter(function(t){return t.eg==="third_party";}).length+" tool versions · "+Math.round(AGENTS.length*0.9)+" agents · "+RUNS.filter(function(r){return r.status==="live"||r.status==="parked";}).length+" runs in flight";
  });
  /* ---------- spend findings ----------
     One finding per real waste pattern the frames would show, spread across tools, agents,
     operators and workspaces. `kind` is reused from FIX so every card's Fix dialog resolves,
     and each carries the full evidence record the Evidence dialog reads. */
  var FKINDS=[
   ["Unpaged results","tool","result tokens per tool call","the whole result body enters the context on every call and every later turn pays input price on it again",
    "Request grouped totals; page rows only on drill-down."],
   ["Repeated shell commands","tool","identical command digests inside a turn window","the same command re-ran while its result was still in the window with an identical digest",
    "Cache identical command results inside a turn window; re-run only after a write."],
   ["Refetching a stable list","tool","calls per run for an unchanged list","a list that changes weekly is fetched once per run and enters every context",
    "Cache the list at the workspace with a 24-hour TTL."],
   ["Duplicate tool calls","agent","identical input digests per run","the same read is issued several times in one run with an identical input digest",
    "Open a steering proposal: read once and reuse the result inside a run."],
   ["Tool-list bloat","agent","tool_definition_tokens per model call","most of the belt was never called, and every definition is paid for on every model call",
    "Narrow the grants to the tools actually used."],
   ["Wrong tier","agent","share of classification-shaped steps on a flagship model","classification-shaped steps went to a flagship model after a retry",
    "Pin the fallback route to the light tier."],
   ["Unproductive tail","agent","steps after the last kept side effect","steps kept coming after the last one that produced a kept side effect",
    "Set a stop rule after two consecutive unproductive steps."],
   ["Cache writes never read","operator","cache_write on a final turn","cache was written on the last turn of one-turn runs and nothing read the prefix inside the TTL",
    "Stop writing cache for one-turn runs."],
   ["Cache misses after a stable prefix changed","workspace","cache_read rate around a publish","publishing steering mid-day changed the system-context digest and cache_read fell for two days",
    "Publish steering at the start of a window, not mid-day."]
  ];
  var fndTools=toolPool.slice().sort(function(a,b){return b.calls30-a.calls30;}).slice(0,14);
  var fndAgents=top.slice(0,40);
  var made=[], fi=0;
  function pushFinding(kind,level,subject,save,agentKey_,opKey,frames,measured,baseline,extra){
    var meta=null; for(var q=0;q<FKINDS.length;q++){if(FKINDS[q][0]===kind)meta=FKINDS[q];}
    var id="fnd_01K5R"+ulid(4);
    made.push({id:id,kind:kind,level:level,subject:subject,save:m2(save),window:"last 30 days",
      why:extra,fix:meta[4],frames:frames});
    var rr=[];
    for(var q=0;q<3;q++){var r=pick(genRuns.filter(function(x){return x.agent===agentKey_;}))||pick(genRuns);
      rr.push([r.id,r.ws+" · "+r.taskTitle,(r.started.length>8?r.started.slice(0,16):dstr(TODAY)+" "+r.started.slice(0,5)),m2(num$(r.cost)),m2(num$(r.cost)*rf(0.2,0.6)),pick(["result re-read on later turns","identical digest, second call","definitions dominate the call","no kept side effect after this step"])]);}
    EVIDENCE[id]={confidence:wpick([["high",62],["medium",38]]),trend:(rnd()<0.6?"+":"-")+ri(1,19)+"% over 30 days",basis:"gateway_observed",
      signal:meta[2],measured:measured,baseline:baseline,counterfactual:meta[4].replace(/\.$/,"").toLowerCase(),
      method:[["Measured","Every frame in the window was counted, not sampled: "+measured+" against a baseline of "+baseline+"."],
              ["Re-read","The result stays in the window, so each later turn on the run paid input price on it again."],
              ["Never used","The frames show the output summarised and the detail never cited."],
              ["Counterfactual",meta[4]+" The saving is that difference, priced at what each call actually cost."]],
      who:{agent:agentKey_,operator:opKey,note:"Inherited from the shape the operator first wrote by hand; the agent kept it."},
      runs:rr};
    fi++;
  }
  fndTools.slice(0,6).forEach(function(t){
    var users=AGENTS.filter(function(a){return a.belt>10;}), a=pick(users);
    var kind=t.eff==="read"?pick(["Unpaged results","Refetching a stable list"]):"Repeated shell commands";
    pushFinding(kind,"tool",t.n,skew(120,4200,1.9),a.key,a.operator,
      ic(Math.round(t.calls30*rf(0.2,0.9)))+" runs · "+ic(t.calls30)+" tool calls",
      ic(ri(9000,52000))+" tok",ic(ri(400,3200))+" tok (grouped)",
      "Across "+ic(t.calls30)+" calls in 30 days the result body averaged "+ic(ri(9,48))+"k tokens and re-entered the context on every later turn of the run.");
  });
  fndAgents.slice(0,14).forEach(function(a,k){
    var kind=["Tool-list bloat","Duplicate tool calls","Wrong tier","Unproductive tail"][k%4];
    pushFinding(kind,"agent",a.key,skew(40,2600,2.0),a.key,a.operator,
      ic(a.runs30)+" runs · "+ic(Math.round(a.runs30*rf(3,11)))+" model calls",
      kind==="Tool-list bloat"?ic(ri(3000,12000))+" tok":kind==="Wrong tier"?ri(8,31)+"%":ri(3,14)+" steps",
      kind==="Tool-list bloat"?ic(ri(600,2400))+" tok":kind==="Wrong tier"?"0%":"1 step",
      kind==="Tool-list bloat"?("tool_definition_tokens averages "+ic(ri(3000,12000))+" per model call; "+ri(Math.max(1,Math.round(a.belt*0.45)),Math.max(2,a.belt-2))+" of the "+a.belt+" tools on the belt were never called in "+ic(a.runs30)+" runs.")
      :kind==="Duplicate tool calls"?("The same read was issued with an identical input digest "+rf(1.8,4.6).toFixed(1)+" times per run on average across "+ic(a.runs30)+" runs.")
      :kind==="Wrong tier"?(ri(78,96)+"% of this agent's steps are classification-shaped, but "+ri(8,31)+"% of its model calls went to a flagship model after a retry.")
      :("On "+ic(Math.round(a.runs30*rf(0.2,0.7)))+" of "+ic(a.runs30)+" runs, more than six steps followed the last step that produced a kept side effect."));
  });
  ops.slice(0,4).forEach(function(o){
    pushFinding("Cache writes never read","operator",PEOPLE[o.p].name,skew(20,420,1.8),o.list[0].key,o.p,
      ic(Math.round(o.runs*0.04))+" runs","cache_write_5m on the final turn","no read inside the TTL",
      "cache_write_5m on the last turn of "+ic(Math.round(o.runs*0.04))+" one-turn runs; nothing read the prefix inside the TTL.");
  });
  WS.slice(2,6).forEach(function(w){
    var a=perWsAgents[w.slug][0];
    pushFinding("Cache misses after a stable prefix changed","workspace",w.slug,skew(30,900,1.7),a.key,a.operator,
      ic(ri(120,2400))+" runs · "+ic(ri(900,9000))+" model calls",ri(48,72)+"%",ri(84,94)+"%",
      "Publishing a steering record mid-day changed the system-context digest on "+ic(ri(120,2400))+" runs in "+w.name+"; cache_read fell for two days before it settled.");
  });
  made.sort(function(a,b){return num$(b.save)-num$(a.save);}).forEach(function(f){FINDINGS.push(f);});
  FINDINGS.sort(function(a,b){return num$(b.save)-num$(a.save);});

  ORG.agents=AGENTS.length; ORG.events30=Math.round(SPEND.actions*0.28); ORG.receipts=Math.round(SPEND.actions*0.86);
})();
