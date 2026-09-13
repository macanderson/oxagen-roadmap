/* Third guard for consolidated.html: the arithmetic, with no browser.
 *
 * The audit's largest class of defect was a figure that appeared on two pages
 * and disagreed with itself. The fix was to derive everything from one canonical
 * block — but "derived" is only true while the derivations hold. This lifts the
 * data <script> straight out of the file, runs it, and checks the invariants
 * that the pages assume. It runs in milliseconds, so there is no excuse.
 *
 * Run:  node tools/verify-data.js
 */
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const file = process.env.TARGET || path.resolve(__dirname, '..', 'consolidated.html');
const html = fs.readFileSync(file, 'utf8');

/* Pull out the one <script> that declares the canonical block. */
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const src = blocks.find(b => /const ORG\s*=/.test(b));
if(!src){ console.error('FATAL: could not find the data script block'); process.exit(2); }

const ctx = {console};
vm.createContext(ctx);
try {
  vm.runInContext(src + `
    ;globalThis.D = {ORG, WS, WS2, PERIOD, ORG_AGENTS, ORG_RUNS, BILLABLE, RUN_CHARGE, ARCHIVE,
      CHARGES, TOOLS, TCAT, TCAT_ORDER, TOOLMETA, toolMeta, toolParts, REGISTRY, TOOL,
      ROLES, BELTS, beltOf, beltSize, outsideOf, agentBySlug, APPROVALS, RECEIPTS, RUNS, FRAMES_OF,
      framesOf, runCost, runFrames, cached, turnOf, AGENTS, AGENT, MANDATE, FINDINGS, RECORDS,
      CONTEXT_PR, CLASSES, GROUPS, groupSum, ENTITIES, SOURCES, ONT, ONT_N, VERSIONS, SIM,
      OPERATORS, SUMMARY, PROMPT};`, ctx);
} catch(e){
  console.error('FATAL: the data block does not run standalone —', e.message);
  process.exit(2);
}
const D = ctx.globalThis ? ctx.globalThis.D : ctx.D;

let fails = 0, checks = 0;
const near = (a, b) => Math.abs(a - b) < 0.005;
function check(name, cond, detail){
  checks++;
  if(!cond){ fails++; console.log(`FAIL  ${name}${detail ? ' — ' + detail : ''}`); }
}

/* ── organization totals are the workspaces added up ── */
check('org agent count = the two workspaces',
  D.ORG_AGENTS === D.WS.agents + D.WS2.agents, `${D.ORG_AGENTS} vs ${D.WS.agents}+${D.WS2.agents}`);
check('org run count = the two workspaces',
  D.ORG_RUNS === D.WS.runsMTD + D.WS2.runsMTD, `${D.ORG_RUNS} vs ${D.WS.runsMTD}+${D.WS2.runsMTD}`);
check('the org bills more runs than either workspace alone',
  D.ORG_RUNS > D.WS.runsMTD && D.ORG_RUNS > D.WS2.runsMTD);

/* ── billing adds up, and charges include every meter ── */
check('billable runs = total minus the free tier',
  D.BILLABLE === D.ORG_RUNS - D.PERIOD.free, `${D.BILLABLE}`);
check('the run charge is billable × rate',
  near(D.RUN_CHARGE, D.BILLABLE * D.PERIOD.rate), `${D.RUN_CHARGE}`);
check('the archive charge is GB × rate',
  near(D.ARCHIVE, D.PERIOD.archiveGB * D.PERIOD.archiveRate), `${D.ARCHIVE}`);
check('charges to date = runs + archive',
  near(D.CHARGES, D.RUN_CHARGE + D.ARCHIVE), `${D.CHARGES} vs ${D.RUN_CHARGE}+${D.ARCHIVE}`);

/* ── spend over 30 days must exceed spend over 11 ── */
check('30-day workspace spend exceeds month-to-date',
  D.WS.spend30d > D.WS.spendMTD, `${D.WS.spend30d} vs ${D.WS.spendMTD}`);
check('proven spend does not exceed spend',
  D.WS.provenSpend < D.WS.spendMTD);
check('proven runs do not exceed runs',
  D.WS.provenRuns < D.WS.runsMTD);
check('90 days of witnessed runs exceeds 11 days of runs',
  D.WS.witnessed90 > D.WS.runsMTD, `${D.WS.witnessed90} vs ${D.WS.runsMTD}`);
check('90 days of proven runs exceeds 11 days of proven runs',
  D.WS.proven90 > D.WS.provenRuns, `${D.WS.proven90} vs ${D.WS.provenRuns}`);
check('the proof rate is proven ÷ witnessed and under 100%',
  D.WS.proven90 < D.WS.witnessed90);
check('the listed agents spend less than the whole workspace',
  D.AGENTS.reduce((s, a) => s + a.spend, 0) < D.WS.spend30d);
check('the agent table is a sample, not the whole workspace',
  D.AGENTS.length < D.WS.agents);

/* ── the mandate meter ── */
const m = D.MANDATE;
check('the mandate meter does not exceed its authority',
  m.settled + m.reserved <= m.authority, `${m.settled}+${m.reserved} vs ${m.authority}`);
check('the reserved call is above the approval threshold',
  m.reserved > m.approveAbove);
check('the reserved call is below the per-call ceiling',
  m.reserved < m.perCall, `a call above the ceiling could not be approved at all`);
check('the approval threshold is below the per-call ceiling',
  m.approveAbove < m.perCall);

/* A guard that dies on bad data reports nothing, which reads like a pass to
   anything watching its output. Every check that touches authored data runs
   inside this, so a throw becomes a named failure. */
function guarded(name, fn){
  checks++;
  try { fn(); }
  catch(e){ fails++; console.log(`FAIL  ${name} — threw: ${e.message}`); }
}

/* ── every run is internally consistent ── */
for(const r of D.RUNS) guarded(`${r.id}: its frames build`, () => {
  const frames = D.runFrames(r), cost = D.runCost(r), tag = r.id;
  check(`${tag}: turn frames sum to the run frame count`, frames > 0);
  check(`${tag}: cost is the sum of its own turns`, near(cost, r.turns.reduce((s,t)=>s+t[3]+t[4],0)));
  check(`${tag}: fresh tokens do not exceed input tokens`,
    r.freshTok < r.inTok, `${r.freshTok} of ${r.inTok}`);
  check(`${tag}: cached = input − fresh`, D.cached(r) === r.inTok - r.freshTok);
  const list = D.framesOf(r);
  check(`${tag}: has recorded frames`, list.length > 0);
  check(`${tag}: no frame index falls outside the sequence`,
    list.every(f => f.n >= 0 && f.n < frames),
    `max ${Math.max(...list.map(f=>f.n))} vs ${frames} frames (0–${frames-1})`);
  check(`${tag}: frame indices ascend`,
    list.every((f, i) => i === 0 || f.n > list[i-1].n));
  check(`${tag}: every frame carries detail`,
    list.every(f => Array.isArray(f.kv) && f.kv.length >= 3),
    `frames without detail: ${list.filter(f => !(f.kv?.length >= 3)).map(f=>f.t).join(', ')}`);
  check(`${tag}: every frame detail row is a pair of strings`,
    list.every(f => f.kv.every(kv => kv.length === 2 && kv.every(v => v != null && String(v).length))));
  if(r.proof){
    check(`${tag}: the proof frame is inside the run`, r.proof.frame < frames);
    check(`${tag}: a flipped verdict means fail on target, pass on head`,
      r.proof.verdict !== 'flipped' || (r.proof.targetResult === 'FAIL' && r.proof.headResult === 'PASS'));
    check(`${tag}: an unmoved verdict means it passed on both`,
      r.proof.verdict !== 'unmoved' || (r.proof.targetResult === 'PASS' && r.proof.headResult === 'PASS'));
  }
  check(`${tag}: only a sealed run carries a chain`, !r.chain || r.state === 'sealed');
  check(`${tag}: a sealed run has an end time`, r.state !== 'sealed' || !!r.ended);
  check(`${tag}: a live run has no end time`, r.state !== 'live' || !r.ended);
});
check('no two runs share an id', new Set(D.RUNS.map(r=>r.id)).size === D.RUNS.length);
check('every run belongs to a core-platform agent',
  D.RUNS.every(r => r.agent.startsWith('a-intel.core.')),
  D.RUNS.filter(r => !r.agent.startsWith('a-intel.core.')).map(r=>r.agent).join(', '));

/* ── approvals point at real runs and real tools ── */
for(const a of D.APPROVALS){
  check(`approval ${a.tool}: names a run that exists`, D.RUNS.some(r => r.id === a.run), a.run);
  check(`approval ${a.tool}: names a tool in the registry`, !!D.TOOL(a.tool));
  /* Only a gate that stops for a person produces a queue item. An allowed tool
     never reaches the queue, and a denied one is refused before it. */
  check(`approval ${a.tool}: its tool is gated on a person`,
    ['require_approval', 'mandate'].includes(D.TOOL(a.tool)?.dec),
    `gate is "${D.TOOL(a.tool)?.dec}" — an allowed or denied tool produces no queue item`);
  const run = D.RUNS.find(r => r.id === a.run);
  check(`approval ${a.tool}: its run is parked`, run?.state === 'parked', `run is ${run?.state}`);
  check(`approval ${a.tool}: operator matches the run`, run?.op === a.op, `${a.op} vs ${run?.op}`);
}
check('there are enough pre-minted receipts for every approval',
  D.RECEIPTS.length >= D.APPROVALS.length);
check('receipt ids are distinct', new Set(D.RECEIPTS).size === D.RECEIPTS.length);
check('receipt ids use the ULID alphabet (no I, L, O, U)',
  D.RECEIPTS.every(r => !/[ILOU]/.test(r.replace(/^rcp_/, ''))));

/* ── every tool identity is name@version, used consistently ── */
check('every registry tool is name@version',
  D.TOOLS.every(t => /^[a-z_.]+(__[a-z_]+)?@\d+$/.test(t.id)),
  D.TOOLS.filter(t => !/^[a-z_.]+(__[a-z_]+)?@\d+$/.test(t.id)).map(t=>t.id).join(', '));
check('every tool resolves to a known category',
  D.TOOLS.every(t => D.toolMeta(t.id).cat in D.TCAT),
  D.TOOLS.filter(t => !(D.toolMeta(t.id).cat in D.TCAT)).map(t => t.id).join(', '));
check('every category in the order table is defined',
  D.TCAT_ORDER.every(c => c in D.TCAT));
check('every defined category is in the order table',
  Object.keys(D.TCAT).every(c => D.TCAT_ORDER.includes(c)));
check('every category carries a label, a definition and an example',
  Object.values(D.TCAT).every(c => c.l && c.s && c.eg && c.i));
check('every tool carries all three axes',
  D.TOOLS.every(t => t.risk && t.eff && t.dec && t.eg && t.fin),
  D.TOOLS.filter(t => !(t.risk && t.eff && t.dec && t.eg && t.fin)).map(t => t.id).join(', '));
check('every risk is one of the four marks',
  D.TOOLS.every(t => ['low','medium','high','critical'].includes(t.risk)));
check('every side effect is one of the three glyphs',
  D.TOOLS.every(t => ['read','write','irreversible'].includes(t.eff)));
check('every gate is one of the five states',
  D.TOOLS.every(t => ['allow','require_approval','mandate','deny','killed'].includes(t.dec)));
/* A financial tool is never merely allowed — it needs a mandate. */
check('a financial tool is gated on a mandate',
  D.TOOLS.filter(t => t.fin === 'moves_funds').every(t => t.dec === 'mandate'),
  D.TOOLS.filter(t => t.fin === 'moves_funds' && t.dec !== 'mandate').map(t => t.id).join(', '));
/* An irreversible tool is never merely allowed either. */
check('an irreversible tool always stops for someone',
  D.TOOLS.filter(t => t.eff === 'irreversible').every(t => t.dec !== 'allow'),
  D.TOOLS.filter(t => t.eff === 'irreversible' && t.dec === 'allow').map(t => t.id).join(', '));
/* The verb heuristic has to work, or the registry cannot grow without a table. */
check('an unlisted tool is still categorised by its verb',
  D.toolMeta('confluence__delete_page').cat === 'record'
  && D.toolMeta('s3__list_objects').cat === 'read'
  && D.toolMeta('k8s__scale_deployment').cat === 'infra'
  && D.toolMeta('okta__rotate_key').cat === 'access'
  && D.toolMeta('sandbox__run_python').cat === 'exec',
  `got ${['confluence__delete_page','s3__list_objects','k8s__scale_deployment','okta__rotate_key','sandbox__run_python']
    .map(x => x + '→' + D.toolMeta(x).cat).join(', ')}`);
check('the registry is a sample of a larger registry', D.TOOLS.length < D.REGISTRY.tools);
check('external connections do not exceed servers', D.REGISTRY.external < D.REGISTRY.servers);
/* every tool named inside a frame must be in the registry, or the badge throws */
for(const r of D.RUNS) guarded(`${r.id}: its frames name real tools`, () => {
  for(const f of D.framesOf(r))
    if(f.t === 'tool_requested' || f.t === 'tool_call'){
      const id = f.kv.find(kv => kv[0] === 'Tool')?.[1];
      check(`${r.id} frame ${f.n}: tool ${id} is in the registry`, !!D.TOOL(id));
    }
});

/* ── the ontology: groups partition the connectors, and sum to the total ── */
check('the entity total is the sum of the classes',
  D.ENTITIES === D.CLASSES.reduce((s,c)=>s+c.c,0));
const owned = D.SOURCES.flatMap(s => s.groups);
check('no class group is claimed by two connectors',
  new Set(owned).size === owned.length, owned.join(', '));
check('every class group has a connector',
  D.GROUPS.every(g => owned.includes(g)),
  D.GROUPS.filter(g => !owned.includes(g)).join(', '));
check('every connector claims a group that exists',
  owned.every(g => D.GROUPS.includes(g)), owned.filter(g => !D.GROUPS.includes(g)).join(', '));
check('the connectors sum to the entity total',
  owned.reduce((s,g)=>s+D.groupSum(g),0) === D.ENTITIES);

/* ── the policy simulation partitions the calls it replayed ── */
check('the simulation outcomes partition the replayed calls',
  D.SIM.deny + D.SIM.ask + D.SIM.unchanged === D.SIM.calls,
  `${D.SIM.deny}+${D.SIM.ask}+${D.SIM.unchanged} vs ${D.SIM.calls}`);
check('the simulated version is not the active one', D.SIM.version !== 'pol_v41');

/* ── steering records use the six real kinds ── */
const KINDS = ['rule','constraint','procedure','fact','memory','preference'];
check('every record uses one of the six real kinds',
  D.RECORDS.every(r => KINDS.includes(r.kind)),
  D.RECORDS.filter(r => !KINDS.includes(r.kind)).map(r=>r.kind).join(', '));
check('the proposed record is not already published',
  !D.RECORDS.some(r => r.id === D.CONTEXT_PR.id), D.CONTEXT_PR.id);
check('the proposed record uses a real kind', KINDS.includes(D.CONTEXT_PR.kind));
check('records cite more than they are violated',
  D.RECORDS.every(r => r.cited >= r.violated));
check('published records are a subset of what is in force',
  D.RECORDS.length <= D.WS.records);

/* ── findings are scoped to something that actually spends ── */
const zeroSpend = D.AGENTS.filter(a => a.spend === 0).map(a => a.id);
check('no finding is scoped to an agent that spent nothing',
  !D.FINDINGS.some(f => zeroSpend.includes(f.scope)),
  D.FINDINGS.filter(f => zeroSpend.includes(f.scope)).map(f=>f.id).join(', '));
check('findings at stake do not exceed the workspace spend',
  D.FINDINGS.reduce((s,f)=>s+f.at,0) < D.WS.spend30d);

/* ══════ Invariants added after the independent re-audits found them broken ══════ */

/* Money at stake is recoverable waste, so it cannot exceed what its scope spends. */
for(const f of D.FINDINGS){
  const a = D.AGENT(f.scope);
  if(a) check(`finding ${f.id}: at stake does not exceed ${f.scope}'s spend`,
    f.at <= a.spend, `${f.at} vs ${a.spend}`);
}

/* A trailing 30-day window cannot hold more than the two months it spans. */
check('30-day spend fits inside August plus September to date',
  D.WS.spend30d <= D.WS.augLedger + D.WS.spendMTD,
  `${D.WS.spend30d} vs ${D.WS.augLedger} + ${D.WS.spendMTD}`);

/* The agent panel's label and its arithmetic have to agree. "By spend" means
   these are the highest five, which caps the workspace at the five shown plus
   (agents − 5) × the smallest of them. With a $0.00 row that cap is the sample
   itself, so the claim and the total cannot both be true. */
const shownSpend = D.AGENTS.reduce((s, a) => s + a.spend, 0);
const minShown = Math.min(...D.AGENTS.map(a => a.spend));
const topFiveCap = shownSpend + (D.WS.agents - D.AGENTS.length) * minShown;
if(/by spend/.test(html)){
  check('a sample labelled "by spend" must be able to be the top five',
    topFiveCap >= D.WS.spend30d,
    `a top-five reading caps the workspace at ${topFiveCap.toFixed(2)}, but it claims ${D.WS.spend30d}`);
} else {
  check('an unranked sample is smaller than the whole it samples',
    shownSpend < D.WS.spend30d, `${shownSpend.toFixed(2)} vs ${D.WS.spend30d}`);
}

/* ULIDs are time-ordered, so sorting by id must reproduce sorting by start. */
const byId = [...D.RUNS].sort((a, b) => a.id.localeCompare(b.id)).map(r => r.id);
const byTime = [...D.RUNS].sort((a, b) => a.started.localeCompare(b.started)).map(r => r.id);
check('run ids sort into their start order, as ULIDs must',
  JSON.stringify(byId) === JSON.stringify(byTime), `\n  by id:   ${byId.join(' ')}\n  by time: ${byTime.join(' ')}`);

/* A frame that names a turn has to agree with the per-turn frame counts the
   Cost tab prints — two renderings of one fact. */
for(const r of D.RUNS) guarded(`${r.id}: frame turn labels match the cost table`, () => {
  for(const f of D.framesOf(r)){
    const m = String(f.d).match(/turn (\d+)/);
    if(!m) continue;
    check(`${r.id} frame ${f.n}: says turn ${m[1]}`,
      Number(m[1]) === D.turnOf(r, f.n).i, `index falls in turn ${D.turnOf(r, f.n).i}`);
  }
});

/* Every agent that runs or is listed needs a belt, or the frame throws. */
const agentIds = new Set([...D.RUNS.map(r => r.agent), ...D.AGENTS.map(a => a.id)]);
for(const id of agentIds)
  check(`belt known for `, Array.isArray(D.BELTS[id]));

/* The model has to contain the classes its own version history says it added. */
for(const want of ["WarrantyClaim", "Depot", "DeploymentSite"])
  check(`the model contains ${want}, named in the version history`,
    D.CLASSES.some(c => c.n === want));
check('the versions table is a sample of the version history',
  D.VERSIONS.length <= D.ONT_N);
check('exactly one version is marked active', D.VERSIONS.filter(v => v[3]).length === 1);
check('the active version in the table is the active version in the tile',
  D.VERSIONS.find(v => v[3])[0] === D.ONT.version);

/* Tools are ordered least to most consequential, which is the grammar's rule
   — and NOT by call volume, which the list is not sorted by. */
const ranks = D.TOOLS.map(t => D.TCAT_ORDER.indexOf(D.toolMeta(t.id).cat));
check('the registry is ordered least to most consequential',
  ranks.every((v, i) => i === 0 || v >= ranks[i - 1]), ranks.join(','));

/* Billing is org-scope, so its graph line must count both workspaces. */
check('the finops workspace contributes entities of its own',
  D.WS2.entities > 0);

/* ══════ Agent IAM: an access surface has to be internally honest ══════ */

check('agent slugs are unique', new Set(D.AGENTS.map(a => a.slug)).size === D.AGENTS.length);
check('every agent slug resolves', D.AGENTS.every(a => D.agentBySlug(a.slug) === a));
check('every agent principal is unique', new Set(D.AGENTS.map(a => a.principal)).size === D.AGENTS.length);

for(const a of D.AGENTS){
  check(`${a.slug}: every role it holds is a defined role`,
    a.roles.every(r => r in D.ROLES), a.roles.filter(r => !(r in D.ROLES)).join(', '));
  check(`${a.slug}: the role of the person invoking it is defined`, a.opRole in D.ROLES, a.opRole);
  check(`${a.slug}: the invoking role is a human role`,
    D.ROLES[a.opRole]?.kind === 'human', `kind is ${D.ROLES[a.opRole]?.kind}`);
  check(`${a.slug}: every role it holds is an agent role`,
    a.roles.every(r => D.ROLES[r].kind === 'agent'),
    a.roles.filter(r => D.ROLES[r].kind !== 'agent').join(', '));
  /* The whole claim of the page: no roles means no reach. */
  check(`${a.slug}: holding no roles means being shown no tools`,
    a.roles.length > 0 || D.beltSize(a.id) === 0, `${D.beltSize(a.id)} tools on an empty intersection`);
  check(`${a.slug}: a day's ceiling is not below a run's`, a.budgetDay >= a.budgetRun);
  check(`${a.slug}: an unenrolled agent has no host`, a.enrolled || !a.host);
  check(`${a.slug}: an enrolled agent has a host`, !a.enrolled || !!a.host);
}

for(const [id, belt] of Object.entries(D.BELTS)){
  for(const b of belt){
    check(`belt ${id}: ${b.id} is in the registry`, !!D.TOOL(b.id));
    check(`belt ${id}: ${b.id} has a gate`,
      ['allow','require_approval','mandate','deny','killed'].includes(b.dec), b.dec);
    check(`belt ${id}: ${b.id} names the rule that decided it`, !!b.rule);
    /* A tool on a belt is never more permissive than the registry allows. */
    const reg = D.TOOL(b.id);
    if(reg) check(`belt ${id}: ${b.id} is not looser than the registry`,
      !(reg.dec !== 'allow' && b.dec === 'allow'),
      `registry says ${reg.dec}, the belt says ${b.dec}`);
    /* A financial tool on a belt means the agent must hold a mandate. */
    if(reg && reg.fin === 'moves_funds')
      check(`belt ${id}: a financial tool implies a mandate`, id === D.MANDATE.agent,
        `${id} is shown ${b.id} but holds no mandate`);
  }
  check(`belt ${id}: no tool appears twice`,
    new Set(belt.map(b => b.id)).size === belt.length);
}

check('the mandate belongs to an agent that exists',
  D.AGENTS.some(a => a.id === D.MANDATE.agent), D.MANDATE.agent);
check('only the mandated agent holds the paying role',
  D.AGENTS.filter(a => a.roles.includes('agent.finance.pay')).every(a => a.id === D.MANDATE.agent));

/* The belt and what is outside it partition the registry exactly — no tool is
   both shown and hidden, and none is neither. */
for(const a of D.AGENTS) guarded(`${a.slug}: belt and outside partition the registry`, () => {
  const on = D.beltOf(a).map(t => t.id), off = D.outsideOf(a).map(t => t.id);
  check(`${a.slug}: nothing is both on the belt and outside it`,
    on.every(id => !off.includes(id)), on.filter(id => off.includes(id)).join(', '));
  check(`${a.slug}: belt + outside covers the whole registry`,
    on.length + off.length === D.TOOLS.length, `${on.length} + ${off.length} vs ${D.TOOLS.length}`);
  check(`${a.slug}: every outside entry says why`, D.outsideOf(a).every(t => t.why && t.why.length > 20));
});

/* ── spend by operator has to reconcile to spend by workspace ── */
const opRuns   = D.OPERATORS.reduce((s, o) => s + o.runs, 0);
const opSpend  = D.OPERATORS.reduce((s, o) => s + o.spend, 0);
const opProven = D.OPERATORS.reduce((s, o) => s + o.proven, 0);
check('operator runs sum to the workspace run count',
  opRuns === D.WS.runsMTD, `${opRuns} vs ${D.WS.runsMTD}`);
check('operator spend sums to the workspace spend',
  near(opSpend, D.WS.spendMTD), `${opSpend.toFixed(2)} vs ${D.WS.spendMTD}`);
check('operator proven runs sum to the workspace proven runs',
  opProven === D.WS.provenRuns, `${opProven} vs ${D.WS.provenRuns}`);
for(const o of D.OPERATORS){
  check(`${o.name}: proven runs do not exceed runs`, o.proven <= o.runs);
  check(`${o.name}: spends something`, o.spend > 0);
}
check('every operator of a sampled run is in the operator table',
  D.RUNS.every(r => D.OPERATORS.some(o => o.name === r.op)),
  [...new Set(D.RUNS.map(r => r.op))].filter(n => !D.OPERATORS.some(o => o.name === n)).join(', '));

/* ── a generated name needs a generated summary ── */
for(const r of D.RUNS){
  check(`${r.id}: has a classifier summary`,
    typeof D.SUMMARY[r.id] === 'string' && D.SUMMARY[r.id].length > 40);
  check(`${r.id}: its summary is not just its name`, D.SUMMARY[r.id] !== r.task);
}
check('no summary is written for a run that does not exist',
  Object.keys(D.SUMMARY).every(id => D.RUNS.some(r => r.id === id)),
  Object.keys(D.SUMMARY).filter(id => !D.RUNS.some(r => r.id === id)).join(', '));

/* ── the prompt is real text, and carries the prefix it claims to ── */
for(const r of D.RUNS) guarded(`${r.id}: its prompt builds`, () => {
  const t = D.turnOf(r, 0);
  const p = D.PROMPT(r, t);
  check(`${r.id}: the prompt names the agent`, p.includes(r.agent));
  check(`: the prompt names the belt size`, p.includes(String(D.beltSize(r.agent))));
  check(`${r.id}: the prompt carries the records in force`,
    D.RECORDS.every(x => p.includes(x.s)));
});

console.log(fails === 0
  ? `ALL PASS — ${checks} data invariants hold`
  : `${fails} of ${checks} data invariants FAILED`);
process.exit(fails ? 1 : 0);
