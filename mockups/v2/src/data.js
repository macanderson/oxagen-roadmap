/* Presentation fixtures only. Token efficiency = cached input / total input.
   Cost is a client-reported estimate, never a provider invoice. */
var V2_HARNESSES = {
  'codex': {label:'Codex', model:'GPT-5.3 Codex', effort:'High'},
  'claude-code': {label:'Claude Code', model:'Claude Opus 4.6', effort:'High'},
  'cursor': {label:'Cursor', model:'Claude Sonnet 4.6', effort:null},
  'stella': {label:'Stella', model:'Claude Sonnet 4.6', effort:'Medium'},
  'claude-desktop': {label:'Claude Desktop', model:'Claude Opus 4.6', effort:null},
  'chatgpt': {label:'ChatGPT', model:'GPT-5.2', effort:'Extended'}
};
var V2_TASKS = [
 ['Fix checkout retry loop','Checking that a failed payment retries once and preserves the cart.','commerce',418,'src/checkout/retry.ts'],
 ['Tighten workspace permissions','Testing workspace boundaries before updating the access checks.','platform',482,'src/auth/workspace.ts'],
 ['Make search feel instant','Removing duplicate requests and validating cached search results.','console',206,'src/search/query.ts'],
 ['Explain the weekly spend increase','Tracing expensive tool calls back to their operators and repositories.','analytics',null,'queries/spend.sql'],
 ['Ship the release notes','Grouping merged changes and preparing the next release draft.','platform',489,'CHANGELOG.md'],
 ['Improve onboarding recovery','Adding a clear recovery path when an organization invite expires.','console',214,'src/invites/accept.ts'],
 ['Reduce oversized tool responses','Measuring result payloads and keeping only the fields the agent uses.','agent-sdk',93,'src/tools/results.ts'],
 ['Repair flaky webhook tests','Reproducing the timing failure and checking deterministic retries.','platform',493,'tests/webhook.test.ts'],
 ['Refresh the support playbook','Comparing recent support traces and updating troubleshooting context.','knowledge',null,'support/playbook.md'],
 ['Add keyboard navigation','Walking the run table with the keyboard and checking focus order.','console',218,'src/runs/table.tsx'],
 ['Verify the billing migration','Comparing billing totals before and after the schema change.','analytics',77,'migrations/billing.sql'],
 ['Trim the agent context','Finding repeated instructions and measuring the smaller prompt.','agent-sdk',99,'context/default.md']
];
function v2Timestamp(iso) {
  var d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return {date:'Not recorded',time:'',iso:''};
  var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var hr=d.getUTCHours();
  return {date:months[d.getUTCMonth()]+' '+d.getUTCDate()+' '+d.getUTCFullYear(),time:(hr%12||12)+':'+String(d.getUTCMinutes()).padStart(2,'0')+' '+(hr<12?'AM':'PM'),iso:d.toISOString()};
}
function v2Filter(rows, filter) {
  var q=(filter.q||'').trim().toLowerCase();
  return rows.filter(function(r){return (!filter.operator||r.op===filter.operator)&&(!filter.harness||r.harness===filter.harness)&&(!filter.repo||r.repo===filter.repo)&&
    (filter.status!=='active'||['live','parked','paused'].includes(r.status))&&
    (!q||[r.title,r.description,r.agentName,r.operator,r.repo,r.pr,r.model,r.harnessLabel].join(' ').toLowerCase().includes(q));});
}
function v2Paginate(rows, page, size) {
  size=[10,25,50].includes(+size)?+size:25;
  var pages=Math.max(1,Math.ceil(rows.length/size));page=Math.max(1,Math.min(pages,+page||1));
  return {rows:rows.slice((page-1)*size,page*size),page:page,pages:pages,size:size,total:rows.length,start:rows.length?(page-1)*size+1:0,end:Math.min(page*size,rows.length)};
}
function v2Rollup(rows) {
  var input=rows.reduce(function(n,r){return n+r.input;},0),cached=rows.reduce(function(n,r){return n+r.cached;},0);
  var metered=rows.filter(function(r){return r.cost!==null;});
  return {active:rows.filter(function(r){return r.status==='live';}).length,cost:metered.reduce(function(n,r){return n+r.cost;},0),input:input,cached:cached,efficiency:input?Math.round(cached/input*100):null,unmetered:rows.length-metered.length};
}
function v2MakeRuns(source, people, agents) {
  var keys=Object.keys(V2_HARNESSES),ops=Object.keys(people).slice(0,5);
  return source.map(function(r,i){
    var task=V2_TASKS[i%V2_TASKS.length], harness=keys[i%keys.length],spec=V2_HARNESSES[harness];
    var op=people[r.op]?r.op:ops[i%ops.length],a=agents.find(function(x){return x.key===r.agent;});
    harness=a&&V2_HARNESSES[a.harness]?a.harness:a&&a.harness==='codex-cli'?'codex':['cursor','claude-desktop','chatgpt'][Math.max(0,agents.indexOf(a))%3];spec=V2_HARNESSES[harness];
    var input=24500+(i%60)*871,cached=Math.round(input*(typeof r.cache==='number'?r.cache:.51+(i%7)*.065));
    var title=r.taskTitle||task[0], description=(r.summary||task[1]).split(/(?<=\.)\s/)[0];
    var noCode=/no code changed|labeled|label:|spend|support/i.test(title+' '+(r.summary||description));
    var prOutput=(r.outputs||[]).find(function(o){return o.kind==='pr';}),prMatch=prOutput&&String(prOutput.name).match(/#(\d+)/);
    if(!prMatch&&/pull request|\bPR\b/i.test(title+' '+description))prMatch=(title+' '+description).match(/#(\d+)/);
    var fileOutput=(r.outputs||[]).find(function(o){return o.kind==='file';});
    var repo=r.task&&r.task.includes('/')?r.task.split('#')[0]:'a-intel/'+task[2];
    return {id:r.id,ws:r.ws,agent:r.agent,agentName:a?a.name:'Workspace agent',op:op,operator:people[op].name,
      title:title,description:description,
      harness:harness,harnessLabel:spec.label,model:(harness==='codex'||harness==='chatgpt'||harness==='cursor')?spec.model:(r.model||spec.model).replace(/^claude-/,'Claude ').replace('opus-','Opus ').replace('sonnet-','Sonnet ').replace('haiku-','Haiku ').replace(/(\d)-(\d)/,'$1.$2'),effort:spec.effort,
      status:r.status,repo:repo,pr:noCode?null:prMatch?Number(prMatch[1]):null,
      files:noCode?0:1+i%9,added:noCode?0:24+(i%60)*7,removed:noCode?0:3+(i%60)*2,file:fileOutput?fileOutput.name:task[4],input:input,cached:cached,output:3100+i*39,
      cost:harness==='cursor'?null:Number(r.cost||0),toolCost:Number((Number(r.cost||0)*.12).toFixed(2)),
      calls:18+i%32,started:new Date(Date.UTC(2026,8,19,18,33)-i*23*60000).toISOString()};
  });
}
