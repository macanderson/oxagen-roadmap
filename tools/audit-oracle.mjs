/* Oracle for the adversarial audit of consolidated.html.
   One assertion per finding, run against the real page in Chromium.
   Each finding is isolated, so one broken step cannot hide the other 43.
   Exit 0 only when every finding is fixed. */
/* Run:  PW_EXE="<chromium binary>" node tools/audit-oracle.mjs
   The Homebrew Playwright nests playwright-core under @playwright/cli, and
   launch() needs an explicit executablePath from the ms-playwright cache. */
import { pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PW = process.env.PW_CORE
  || '/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.js';
const pw = await import(pathToFileURL(PW).href);
const { chromium } = pw.default ?? pw;

const HERE = dirname(fileURLToPath(import.meta.url));
const FILE = process.env.TARGET
  || pathToFileURL(resolve(HERE, '..', 'consolidated.html')).href;

const results = [];
const ok  = (n, m) => results.push({n, pass:true,  m});
const bad = (n, m) => results.push({n, pass:false, m});
const is  = (n, cond, m) => cond ? ok(n, m) : bad(n, m);
const eq  = (n, a, b, m) => a === b ? ok(n, `${m} — ${JSON.stringify(a)}`)
                                    : bad(n, `${m} — got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
const n_ = s => Number(String(s ?? '').replace(/,/g, ''));

const browser = await chromium.launch({ executablePath: process.env.PW_EXE });
const ctx = await browser.newContext({ viewport:{width:1440, height:980} });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); });

/* A goto that differs only in the fragment does NOT reload, so state leaks
   between steps. `fresh` reloads; `go` is an in-page route change. */
const fresh = async hash => { await page.goto('about:blank'); await page.goto(FILE + hash); await page.waitForTimeout(90); };
const go    = async hash => { await page.evaluate(h => { location.hash = h; }, hash.replace(/^#/, '')); await page.waitForTimeout(70); };
const setAsst = open => page.evaluate(o => toggleAsst(o), open);
const setView = v => page.evaluate(x => { S.view = x; render(); }, v);
const body  = async () => (await page.locator('#view').innerText()).replace(/\s+/g, ' ').trim();
const text  = async sel => (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim();

async function step(n, fn){
  try { await fn(); }
  catch(e){ bad(n, 'threw: ' + String(e.message ?? e).split('\n')[0]); }
}

/* ═══ 1 · the assistant dock was never hidden ═══ */
await step(1, async () => {
  await fresh('#/fleet');
  const d = await page.evaluate(() => getComputedStyle(document.querySelector('#asst')).display);
  eq(1, d, 'none', 'assistant dock computes to display:none while hidden');
  /* The invariant is that nothing scrolls past the content. A short page still
     reports a full-viewport document because the sidebar is 100vh — that is the
     shell, not phantom scroll, so the bar is max(viewport, content bottom). */
  let worst = 0, worstPage = '';
  for(const p of ['fleet','run/run_01K5XQ7M4A','agents','tools','spend','billing','audit','ontology','steering','organization']){
    await fresh('#/' + p);
    const m = await page.evaluate(() => ({ doc: document.documentElement.scrollHeight,
      vp: document.documentElement.clientHeight,
      bottom: Math.round(document.querySelector('.canvas').getBoundingClientRect().bottom) }));
    const slack = m.doc - Math.max(m.vp, m.bottom);
    if(slack > worst){ worst = slack; worstPage = p; }
  }
  is(1, worst <= 8, `nothing scrolls past the content on any page (worst slack ${Math.round(worst)}px${worstPage ? ' on ' + worstPage : ''})`);
});

/* ═══ 2 · no viewport meta, so real phones got the desktop layout ═══ */
await step(2, async () => {
  await fresh('#/fleet');
  const h = await page.evaluate(() => ({ doctype: !!document.doctype, lang: document.documentElement.lang,
    charset: document.characterSet, viewport: document.querySelector('meta[name=viewport]')?.content ?? null }));
  is(2, h.doctype && h.lang === 'en' && h.charset === 'UTF-8' && /width=device-width/.test(h.viewport || ''),
    `document preamble present (lang=${h.lang}, ${h.charset}, viewport=${h.viewport})`);
});

const phoneCtx = await browser.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:3, isMobile:true, hasTouch:true });
const pp = await phoneCtx.newPage();
await step(2, async () => {
  await pp.goto(FILE + '#/fleet'); await pp.waitForTimeout(120);
  const s = await pp.evaluate(() => ({ cw: document.documentElement.clientWidth,
    cols: getComputedStyle(document.querySelector('#app')).gridTemplateColumns.trim(),
    toggle: getComputedStyle(document.querySelector('#navToggle')).display }));
  is(2, s.cw === 390 && s.toggle !== 'none' && !/\s/.test(s.cols),
    `a 390px device lays out at 390px, one column, hamburger visible (${JSON.stringify(s)})`);
});

/* ═══ 3 · the approval demanding attention is not already granted ═══ */
await step(3, async () => {
  await fresh('#/audit');
  is(3, !/approval\.granted[\s\S]{0,90}\$18,420/.test(await body()),
    'the audit log does not record the pending $18,420 approval as granted');
  await go('#/fleet'); await setAsst(true); await page.waitForTimeout(60);
  const t = (await page.locator('#asstBody').innerText()).replace(/\s+/g, ' ');
  is(3, /still parked/.test(t) && !/approved it 5 minutes later/.test(t), 'the assistant says the call is still parked');
  await setAsst(false);
});

/* ═══ 4 · the workspace has one agent count ═══ */
await step(4, async () => {
  await fresh('#/agents');
  const a = await body();
  is(4, /Agents here 41/i.test(a) && /50 in the organization/i.test(a), 'Agents reports 41 here, 50 in the org');
  await go('#/organization');
  const o = await body();
  is(4, /core-platform[\s\S]{0,140}41/.test(o) && /finops[\s\S]{0,140}\b9\b/.test(o), 'Organization: 41 + 9 = 50');
  await go('#/fleet');
  is(4, /41 agents/.test(await body()), 'the Fleet tile basis says 41 agents');
});

/* ═══ 5 · thirty days of agent spend vs eleven days of workspace spend ═══ */
await step(5, async () => {
  await fresh('#/agents');
  const a = await body();
  const s30 = a.match(/Spend · last 30 days \$([\d,]+\.\d\d)/i)?.[1];
  is(5, /5 of 41 · one of each state and tier/.test(a) && !/by spend/.test(a),
    'the agent table says what kind of sample it is, and does not claim to be the top five');
  /* "by spend" would mean these are the highest five, which a $0.00 fifth row
     makes impossible against any workspace total. */
  const plaus = await page.evaluate(() => {
    const shown = AGENTS.reduce((s, x) => s + x.spend, 0);
    const min = Math.min(...AGENTS.map(x => x.spend));
    return {shown, min, agents: WS.agents, total: WS.spend30d,
      ceilingIfTopFive: shown + (WS.agents - AGENTS.length) * min};
  });
  is(5, plaus.shown < plaus.total && plaus.ceilingIfTopFive < plaus.total,
    `the sample is smaller than the whole, and could not be the top five (${JSON.stringify(plaus)})`);
  await go('#/spend');
  const mtd = (await body()).match(/Spent \$([\d,]+\.\d\d)/i)?.[1];
  is(5, n_(s30) > n_(mtd), `30-day spend $${s30} exceeds 11-day spend $${mtd}`);
  /* A trailing 30 days cannot exceed the two months it spans. */
  const window30 = await page.evaluate(() => ({s30: WS.spend30d, aug: WS.augLedger, mtd: WS.spendMTD}));
  is(5, window30.s30 <= window30.aug + window30.mtd,
    `the 30-day window fits inside August plus September (${JSON.stringify(window30)})`);
});

/* ═══ 6 · the Runs panel shows what it claims ═══ */
await step(6, async () => {
  await fresh('#/fleet');
  const rows = await page.locator('#view table tbody tr[data-go]').count();
  const note = await page.evaluate(() => [...document.querySelectorAll('.panel-h')]
    .find(h => h.querySelector('h2')?.textContent === 'Runs')?.querySelector('.note')?.textContent);
  /* `N of N` is a fraction compared to itself and can never disagree — the
     denominator has to be the whole the panel is a sample of. */
  const m = String(note).match(/^(\d+) of ([\d,]+) this month · newest first$/);
  is(6, m && Number(m[1]) === rows && n_(m[2]) > rows,
    `the Runs note names the rows shown against the whole month ("${note}", ${rows} rows)`);
  /* And "newest first" has to be true, not merely printed. */
  const order = await page.evaluate(() => [...document.querySelectorAll('#view tr[data-go]')]
    .map(r => RUNS.find(x => x.id === r.dataset.go.split('/').pop()).started));
  const sorted = [...order].sort().reverse();
  is(6, order.length > 1 && JSON.stringify(order) === JSON.stringify(sorted),
    `the rows really are newest first (${order[0]} → ${order[order.length - 1]})`);
  is(6, (await body()).includes('run_01K6QW6H3D'), 'the cancelled run named in the audit log is in the table');
});

/* ═══ 7 · "Runs live" counts live runs ═══ */
await step(7, async () => {
  await fresh('#/fleet');
  const tile = Number((await body()).match(/Runs live (\d+)/i)?.[1]);
  const live = await page.locator('#view tr[data-go]').evaluateAll(r =>
    r.filter(x => /\blive\b/.test(x.children[3].textContent)).length);
  eq(7, tile, live, 'the live tile equals the rows in state live');
});

/* ═══ 8 · one run, one harness version ═══ */
await step(8, async () => {
  await fresh('#/fleet');
  const fleetRow = await page.evaluate(() => [...document.querySelectorAll('tr[data-go]')]
    .find(r => r.textContent.includes('run_01K5XQ7M4A')).children[1].textContent);
  await go('#/run/run_01K5XQ7M4A');
  const head = await text('.head');
  is(8, head.includes('Claude Code 2.1.4') && fleetRow.includes('Claude Code 2.1.4') && !head.includes('2.4.1'),
    'the run header and the Fleet row agree on Claude Code 2.1.4');
});

/* ═══ 9 · one input-token count for one model call ═══ */
await step(9, async () => {
  await fresh('#/run/run_01K5XQ7M4A');
  await page.click('[data-frame="13"]'); await page.waitForTimeout(50);
  const t = await body();
  is(9, /260,322 in/.test(t) && /260,322 · 18,342 fresh · 241,980 cached/.test(t) && !/2,216,660/.test(t),
    'frame 13 reports 260,322 in, in the list and in its own detail');
});

/* ═══ 10 · a run-level cache rate is run-level ═══ */
await step(10, async () => {
  await fresh('#/run/run_01K5XQ7M4A');
  const m = (await body()).match(/([\d,]+) of ([\d,]+) input tokens, across the run/);
  is(10, m && n_(m[2]) > 260322, `the run cache basis is run-wide (${m?.[2]} input tokens), not one call's`);
});

/* ═══ 11 · frame numbering matches the seal ═══ */
await step(11, async () => {
  await fresh('#/run/run_01K5XQ7M4A');
  const last = Number(await page.locator('[data-frame]').last().getAttribute('data-frame'));
  await page.click('[role="tab"][data-val="Chain"]'); await page.waitForTimeout(60);
  const c = await body();
  const total = n_(c.match(/every one of ([\d,]+) verified/)?.[1]);
  is(11, /every one of 126 verified/.test(c) && /dense 0–125/.test(c), 'the chain says 126 frames, dense 0–125');
  eq(11, last, total - 1, 'the last recorded frame index is inside the sealed sequence');
});

/* ═══ 12 · one mandate ceiling ═══ */
await step(12, async () => {
  await fresh('#/fleet');
  const f = await body();
  is(12, /above the \$10,000\.00 approval threshold/.test(f) && !/per-call ceiling/.test(f),
    'the approval cites the threshold it actually crossed');
  await go('#/agents/invoice-bot/Mandate');
  is(12, /Per call \$25,000\.00 ceiling/.test(await body()), 'the mandate still states its $25,000 per-call ceiling');
  await go('#/fleet'); await setAsst(true); await page.waitForTimeout(60);
  const t = (await page.locator('#asstBody').innerText()).replace(/\s+/g, ' ');
  is(12, /above \$10,000\.00 to a person/.test(t) && !/ceiling is \$10,000/.test(t),
    'the assistant calls $10,000 a threshold, not a ceiling');
  await setAsst(false);
});

/* ═══ 13 · the merge rule and the merge calls agree ═══ */
await step(13, async () => {
  await fresh('#/steering');
  is(13, /without a person's approval/.test(await body()), 'the merge record permits approved merges');
  await go('#/tools');
  is(13, /github__merge_pull_request@3[\s\S]{0,140}needs approval/.test(await body()), 'merges are gated on approval');
});

/* ═══ 14 · a proposed record is not already published ═══ */
await step(14, async () => {
  await fresh('#/steering');
  const t = await body();
  const pr = t.match(/id\s*=\s*"(ctx\.core\.[a-z0-9-]+)"/)?.[1];
  const published = [...t.matchAll(/ctx\.core\.[a-z0-9-]+/g)].map(m => m[0]);
  is(14, pr && published.filter(p => p === pr).length === 1,
    `the Context PR proposes a record not already in the published list (${pr})`);
});

/* ═══ 15 · ninety days holds more than eleven days ═══ */
await step(15, async () => {
  await fresh('#/steering');
  const s = await body();
  const w90 = n_(s.match(/of ([\d,]+) witnessed runs · 90 days/)?.[1]);
  const p90 = n_(s.match(/([\d,]+) proven of/)?.[1]);
  await go('#/spend');
  const sp = await body();
  const mtd = n_(sp.match(/([\d,]+) runs ·/)?.[1]);
  const pmtd = n_(sp.match(/([\d,]+) runs flipped a witness/)?.[1]);
  is(15, w90 > mtd && p90 > pmtd,
    `90 days (${w90} witnessed, ${p90} proven) exceeds 11 days (${mtd} runs, ${pmtd} proven)`);
});

/* ═══ 16 · nothing claims more sealed than ran ═══ */
await step(16, async () => {
  await fresh('#/fleet');
  is(16, !/sealed this month/.test(await body()), 'the Fleet tile no longer claims a sealed count above the run count');
});

/* ═══ 17 · the organization bills more than one workspace ═══ */
await step(17, async () => {
  await fresh('#/spend');
  const mtd = n_((await body()).match(/([\d,]+) runs ·/)?.[1]);
  await go('#/billing');
  const orgRuns = n_((await body()).match(/This period ([\d,]+) runs/i)?.[1]);
  is(17, orgRuns > mtd, `the org bills ${orgRuns} runs, more than core-platform's ${mtd}`);
});

/* ═══ 18 · charges include the meters the basis cites ═══ */
await step(18, async () => {
  await fresh('#/billing');
  const b = await body();
  eq(18, b.match(/Charges to date \$([\d,]+\.\d\d)/i)?.[1], b.match(/Total \$([\d,]+\.\d\d)/)?.[1],
    'the charges tile equals the table total');
});

/* ═══ 19 · one activation date per policy version ═══ */
await step(19, async () => {
  await fresh('#/audit');
  is(19, !/policy\.activated[\s\S]{0,70}pol_v41/.test(await body()),
    'the audit log no longer activates pol_v41 nine days after the frame says it activated');
});

/* ═══ 20 · the class count matches the classes drawn ═══ */
await step(20, async () => {
  await fresh('#/ontology');
  const o = await body();
  const cards = await page.locator('#panel-ontTab [style*="minmax(150px"] > div').count();
  eq(20, Number(o.match(/Classes (\d+)/i)?.[1]), cards, 'the Classes tile equals the classes drawn');
  const groups = await page.locator('#panel-ontTab .eyebrow').count();
  eq(20, Number(o.match(/(\d+) schemas/)?.[1]), groups, 'the schema count equals the groups drawn');
});

/* ═══ 21 · no entity counted under two connectors ═══ */
await step(21, async () => {
  await fresh('#/ontology');
  const entities = n_((await body()).match(/Entities ([\d,]+)/i)?.[1]);
  await page.click('[role="tab"][data-val="Sources"]'); await page.waitForTimeout(60);
  const rows = await page.locator('#panel-ontTab tbody tr').evaluateAll(r =>
    r.map(x => [x.children[0].querySelector('b').textContent, Number(x.children[3].textContent.replace(/,/g, ''))]));
  eq(21, rows.reduce((s, [, v]) => s + v, 0), entities, 'the connectors sum exactly to the entity total');
  const gs = (await page.locator('#panel-ontTab tbody tr .s.mono').evaluateAll(e => e.map(x => x.textContent)))
    .flatMap(g => g.split(' · '));
  is(21, new Set(gs).size === gs.length, `each class group belongs to exactly one connector (${gs.join(', ')})`);
});

/* ═══ 22 · a finding is scoped to something that spends ═══ */
await step(22, async () => {
  await fresh('#/spend');
  const scopes = [...(await body()).matchAll(/fnd_[0-9a-f]+ (acme\.[a-z.-]+|provider key \S+)/g)].map(m => m[1]);
  await go('#/agents');
  const zero = await page.locator('#view table tbody tr').evaluateAll(r => r
    .filter(x => /\$0\.00/.test(x.children[5].textContent)).map(x => x.querySelector('.s.mono').textContent));
  is(22, scopes.length > 0 && !scopes.some(s => zero.includes(s)),
    `no finding is scoped to an agent that spent nothing (zero-spend: ${zero.join(', ') || 'none'})`);
});

/* ═══ 23 · a denied tool produces no approval queue item ═══ */
await step(23, async () => {
  await fresh('#/tools');
  const t = await body();
  is(23, /bash@1[\s\S]{0,140}needs approval/.test(t) && !/denied on irreversible paths/.test(t),
    'bash@1 is gated on approval, which is what the queue item shows');
});

/* ═══ 24 · operators only run what they have a grant for ═══ */
await step(24, async () => {
  await fresh('#/fleet');
  const agents = await page.locator('#view tr[data-go]').evaluateAll(r =>
    r.map(x => x.children[1].textContent.trim().split('\n')[0].trim()));
  is(24, agents.every(a => a.startsWith('acme.core.')),
    `every run in core-platform belongs to a core-platform agent (${[...new Set(agents)].join(', ')})`);
  await setView('denied');
  is(24, !/Dana Okafor/.test(await body()), 'the denied persona is not an operator of this workspace');
  await setView('loaded');
});

/* ═══ 25 · the org and workspace switchers answer ═══ */
await step(25, async () => {
  await fresh('#/fleet');
  await page.click('#orgSw'); await page.waitForTimeout(70);
  is(25, (await text('#orgSw')).includes('Not in this mockup'), 'the org switcher answers with the stub message');
  await page.waitForTimeout(1600);
  is(25, (await text('#orgSw')).includes('Acme Robotics'), 'and restores its own label, chevron and all');
  await page.click('#wsSw'); await page.waitForTimeout(70);
  is(25, (await text('#wsSw')).includes('Not in this mockup'), 'the workspace switcher answers too');
  await page.waitForTimeout(1600);
});

/* ═══ 26 · a row opens its own run ═══ */
const runHrefs = [];
await step(26, async () => {
  await fresh('#/fleet');
  /* Compare two INDEPENDENT sources: the id printed in the row's own cell, and
     the heading of the page that row opens. Reading the id back out of the
     data-go attribute — the very thing the defect corrupts — cannot fail. */
  const rows = await page.locator('#view tr[data-go]').evaluateAll(r =>
    r.map(x => ({ id: x.querySelector('td a.rowlink').textContent.trim(), go: x.dataset.go })));
  runHrefs.push(...rows.map(r => r.go));
  const distinct = new Set(rows.map(r => r.go)).size === rows.length;
  const miss = [];
  for(const row of rows){
    await go(row.go);
    const h1 = await text('.head h1');
    if(!h1.startsWith(row.id)) miss.push([row.id, row.go, h1.split(' ')[0]]);
  }
  is(26, rows.length > 1 && distinct && miss.length === 0,
    `all ${rows.length} rows open their own run, and no two rows share a destination`
    + (!distinct ? ' — DESTINATIONS NOT DISTINCT' : '')
    + (miss.length ? ` — ${JSON.stringify(miss)}` : ''));
});

/* ═══ 27 · no frame is a dead end ═══ */
await step(27, async () => {
  const dead = []; let checked = 0;
  for(const href of runHrefs){
    await fresh(href);
    const frames = await page.locator('[data-frame]').evaluateAll(b => b.map(x => x.dataset.frame));
    for(const f of frames){
      const want = await page.locator(`[data-frame="${f}"] .frt`).innerText();
      await page.click(`[data-frame="${f}"]`); await page.waitForTimeout(20);
      const kv = await page.locator('#panel-runTab .kv').last().innerText();
      /* Not just "the pane has content" — it has to be THIS frame's content, or
         a regression that always shows frame 0 passes. */
      const head = await page.locator('#panel-runTab .panel-h h2').last().innerText();
      const note = await page.locator('#panel-runTab .panel-h .note').last().innerText();
      checked++;
      if(/Select a frame/.test(kv) || kv.trim().length < 30) dead.push([href.split('/').pop(), f, 'empty']);
      else if(head.trim() !== want.trim() || note.trim() !== `frame ${f}`)
        dead.push([href.split('/').pop(), f, `showed "${head}" / "${note}"`]);
    }
  }
  is(27, checked > 40 && dead.length === 0,
    `all ${checked} frames across ${runHrefs.length} runs open detail` + (dead.length ? ` — dead: ${JSON.stringify(dead)}` : ''));
});

/* ═══ 28 · approvals survive being approved ═══ */
await step(28, async () => {
  await fresh('#/fleet');
  await page.click('[data-act="approve"][data-i="0"]'); await page.waitForTimeout(70);
  await page.click('[data-act="deny"][data-i="1"]'); await page.waitForTimeout(70);
  const after = await page.evaluate(() => [document.querySelector('#navApprovals').textContent,
    document.querySelector('#view').innerText.match(/Waiting on a person\s+(\d+)/i)?.[1]]);
  is(28, after[0] === '1' && after[1] === '1', `badge and tile both fall to 1 (got ${after.join(' / ')})`);
  await go('#/spend'); await go('#/fleet');
  const back = await body();
  is(28, /approved/.test(back) && /denied/.test(back) && /Waiting on a person 1/i.test(back),
    'the receipts are still there after leaving the page and coming back');
});

/* ═══ 29 · every receipt is distinct ═══ */
await step(29, async () => {
  const r = [...(await body()).matchAll(/receipt (rcp_\w+)/g)].map(m => m[1]);
  is(29, r.length >= 2 && new Set(r).size === r.length, `receipts are distinct (${r.join(', ')})`);
});

/* ═══ 30 · the policy button answers ═══ */
await step(30, async () => {
  await fresh('#/tools');
  await page.click('[role="tab"][data-val="Policy"]'); await page.waitForTimeout(60);
  const b = page.locator('[data-act="open-affected"]');
  is(30, await b.count() === 1, 'the affected-runs button has a handler');
  await b.click(); await page.waitForTimeout(70);
  is(30, (await b.innerText()).includes('Not in this mockup'), 'and it answers with the stub message');
  await page.waitForTimeout(1600);
});

/* ═══ 31 · Enter works in the command menu ═══ */
await step(31, async () => {
  await fresh('#/fleet');
  await page.click('#cmdBtn'); await page.waitForTimeout(70);
  await page.fill('#cmdIn', 'spend'); await page.waitForTimeout(70);
  await page.press('#cmdIn', 'Enter'); await page.waitForTimeout(150);
  is(31, page.url().endsWith('#/spend'), `Enter navigates (landed on ${page.url().split('#')[1]})`);
  await page.click('#cmdBtn'); await page.fill('#cmdIn', 'Go to'); await page.waitForTimeout(70);
  const first = await page.locator('[role="option"][aria-selected="true"]').innerText();
  await page.press('#cmdIn', 'ArrowDown'); await page.waitForTimeout(60);
  const second = await page.locator('[role="option"][aria-selected="true"]').innerText();
  is(31, first !== second, `arrow keys move the selection (${first.split('\n')[0]} → ${second.split('\n')[0]})`);
  await page.press('#cmdIn', 'Escape'); await page.waitForTimeout(70);
});

/* ═══ 32 · a double click does not stick the label ═══ */
await step(32, async () => {
  await fresh('#/fleet');
  const b = page.locator('[data-act="steer-all"]');
  const label = (await b.innerText()).trim();
  await b.click(); await page.waitForTimeout(40); await b.click({force:true});
  await page.waitForTimeout(1800);
  eq(32, (await b.innerText()).trim(), label, 'the label comes back after a double click');
});

/* ═══ 33 · the assistant does not swallow input ═══ */
await step(33, async () => {
  await fresh('#/fleet');
  await setAsst(true); await page.waitForTimeout(60);
  await page.fill('#asstIn', 'cap triage at $2 a run');
  await page.press('#asstIn', 'Enter'); await page.waitForTimeout(100);
  const t = await page.locator('#asstBody').innerText();
  is(33, t.includes('cap triage at $2 a run') && /Not in this mockup/.test(t)
     && (await page.inputValue('#asstIn')) === '', 'the typed message is shown, answered and cleared');
  await setAsst(false);
});

/* ═══ 34 · the container query measures the canvas ═══ */
await step(34, async () => {
  const c = await browser.newContext({ viewport:{width:1100, height:900} });
  const np = await c.newPage();
  await np.goto(FILE + '#/run/run_01K5XQ7M4A'); await np.waitForTimeout(120);
  const closed = await np.evaluate(() => getComputedStyle(document.querySelector('.split')).gridTemplateColumns);
  await np.click('#asstBtn'); await np.waitForTimeout(160);
  const o = await np.evaluate(() => ({
    cols: getComputedStyle(document.querySelector('.split')).gridTemplateColumns.trim(),
    canvas: Math.round(document.querySelector('.canvas').getBoundingClientRect().width),
    inspector: Math.round(document.querySelectorAll('.split > section')[1].getBoundingClientRect().width) }));
  is(34, !/\s/.test(o.cols) && o.inspector > 300,
    `with the assistant open the split collapses (canvas ${o.canvas}px, inspector ${o.inspector}px, was "${closed.trim()}")`);
  await c.close();
});

/* ═══ 35 · the retired vocabulary is gone ═══ */
await step(35, async () => {
  const hits = [];
  for(const p of ['fleet','run/run_01K5XQ7M4A','agents','tools','ontology','steering','spend','organization','billing','audit']){
    await fresh('#/' + p);
    for(const tab of await page.locator('[role="tab"]').evaluateAll(b => b.map(x => x.dataset.val))){
      await page.click(`[role="tab"][data-val="${tab}"]`); await page.waitForTimeout(40);
      const t = await body();
      for(const w of ['directive','knowledge','session','execution','invocation'])
        if(new RegExp(`\\b${w}s?\\b`, 'i').test(t)) hits.push(`${p}/${tab}:${w}`);
    }
    const t = await body();
    for(const w of ['directive','knowledge','session','execution','invocation'])
      if(new RegExp(`\\b${w}s?\\b`, 'i').test(t)) hits.push(`${p}:${w}`);
  }
  is(35, hits.length === 0, 'no retired or banned vocabulary on any page or tab' + (hits.length ? ` — ${[...new Set(hits)].join(', ')}` : ''));
  await fresh('#/steering');
  is(35, /\brule\b/.test(await body()) && /\bprocedure\b/.test(await body()), 'records carry real kinds');
});

/* ═══ 36 · gold never encodes state ═══ */
await step(36, async () => {
  await fresh('#/tools');
  const g = await page.evaluate(() => {
    const hex = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim().replace('#','');
    const gold = `rgb(${parseInt(hex.slice(0,2),16)}, ${parseInt(hex.slice(2,4),16)}, ${parseInt(hex.slice(4,6),16)})`;
    const tab = document.querySelector('[role="tab"][aria-selected="true"]');
    const nav = document.querySelector('.navsec a[aria-current="page"]');
    const out = [];
    if(getComputedStyle(tab).borderBottomColor === gold) out.push('selected tab border');
    if(getComputedStyle(nav).color === gold) out.push('current nav colour');
    if(getComputedStyle(nav, '::before').backgroundColor === gold) out.push('current nav spine');
    if(getComputedStyle(nav.querySelector('svg')).color === gold) out.push('current nav icon');
    return {gold, out};
  });
  is(36, g.out.length === 0, `gold ${g.gold} is not used for tab or nav state` + (g.out.length ? ` — ${g.out.join(', ')}` : ''));
  await setAsst(true); await page.waitForTimeout(50);
  const p = await page.evaluate(() => { const s = getComputedStyle(document.querySelector('#asstBtn'));
    return [s.color, s.backgroundColor, s.borderTopColor]; });
  is(36, !p.some(v => /214, 150, 44|130, 85, 17/.test(v)), `the pressed Assistant button is not gold (${p.join(' / ')})`);
  await setAsst(false);
  await page.click('#acctBtn'); await page.waitForTimeout(70);
  const t = await page.evaluate(() => { const b = document.querySelector('#themeRow button[aria-pressed="true"]');
    const s = getComputedStyle(b); return [s.color, s.borderTopColor, s.backgroundColor]; });
  is(36, !t.some(v => /214, 150, 44|130, 85, 17/.test(v)), `the active theme button is not gold (${t.join(' / ')})`);
  await page.click('[data-close="acct"]'); await page.waitForTimeout(50);
});

/* ═══ 37 · one tool grammar ═══ */
await step(37, async () => {
  await fresh('#/tools');
  const ids = await page.locator('.tc > .mono').evaluateAll(e => e.map(x => x.textContent.trim()));
  is(37, ids.length >= 5 && ids.every(t => /^[a-z_.]+(__[a-z_]+)?@\d+$/.test(t)),
    `every tool identity is name@version (${ids.join(', ')})`);
  const badges = await page.locator('#panel-toolsTab tbody tr .tcb').count();
  is(37, badges >= ids.length, `every registry row carries a category badge (${badges} badges for ${ids.length} tools)`);
  await go('#/fleet');
  const a = await page.locator('.appr .tc > .mono').evaluateAll(e => e.map(x => x.textContent.trim()));
  is(37, a.length === 3 && a.every(t => /@\d+$/.test(t)), `approvals use the same grammar (${a.join(', ')})`);
});

/* ═══ 38 · three tiles per page ═══ */
await step(38, async () => {
  const over = [];
  for(const p of ['fleet','run/run_01K5XQ7M4A','agents','tools','ontology','steering','spend','organization','billing','audit']){
    await fresh('#/' + p);
    const tabList = await page.locator('[role="tab"]').evaluateAll(b => b.map(x => x.dataset.val));
    for(const tab of tabList.length ? tabList : [null]){
      if(tab){ await page.click(`[role="tab"][data-val="${tab}"]`); await page.waitForTimeout(40); }
      const c = await page.locator('#view .summary > div').count();
      if(c > 3) over.push(`${p}/${tab ?? '-'}:${c}`);
    }
  }
  is(38, over.length === 0, 'no page or tab exceeds three tiles' + (over.length ? ` — ${over.join(', ')}` : ''));
});

/* ═══ 39 · the mockup chrome can be dismissed ═══ */
await step(39, async () => {
  await fresh('#/fleet');
  const tall = await page.evaluate(() => Math.round(document.querySelector('#chrome').getBoundingClientRect().height));
  await page.click('#chromeFold'); await page.waitForTimeout(70);
  const f = await page.evaluate(() => ({ hidden: document.querySelector('#chromeBody').hidden,
    h: Math.round(document.querySelector('#chrome').getBoundingClientRect().height),
    label: document.querySelector('#chromeFold').textContent }));
  is(39, f.hidden && f.h < tall / 2, `the chrome folds from ${tall}px to ${f.h}px and offers "${f.label}"`);
  await page.click('#chromeFold'); await page.waitForTimeout(70);
  is(39, !(await page.evaluate(() => document.querySelector('#chromeBody').hidden)), 'and unfolds again');
});

/* ═══ 40 · the run page keeps its bearings ═══ */
await step(40, async () => {
  await fresh('#/run/run_01K5XQ7M4A');
  const b = await page.evaluate(() => ({
    current: document.querySelector('.navsec a[aria-current="page"]')?.dataset.nav ?? null,
    crumb: document.querySelector('#crumbTail').innerText.replace(/\s+/g, ' ').trim(),
    fleetLink: !!document.querySelector('#crumbTail a[href="#/fleet"]') }));
  is(40, b.current === 'fleet' && b.fleetLink,
    `the run page lights Fleet and offers it in the breadcrumb (${b.crumb})`);
});

/* ═══ 41 · denied and empty know their scope ═══ */
await step(41, async () => {
  const copy = {};
  for(const p of ['billing','audit','organization','fleet','spend','agents']){
    await fresh('#/' + p);
    copy[p] = await page.evaluate(() => { const o = {};
      for(const v of ['denied','empty']){ S.view = v; render(); o[v] = document.querySelector('#view').innerText.replace(/\s+/g, ' '); }
      S.view = 'loaded'; render(); return o; });
  }
  const orgBad = ['billing','audit','organization'].filter(p =>
    /core-platform/.test(copy[p].denied) || /in this workspace/.test(copy[p].empty));
  const wsBad = ['fleet','spend','agents'].filter(p => !/core-platform/.test(copy[p].denied));
  is(41, orgBad.length === 0 && wsBad.length === 0,
    'denied and empty copy matches the scope of the page'
    + (orgBad.length || wsBad.length ? ` — org leaks:[${orgBad}] ws missing:[${wsBad}]` : ''));
});

/* ═══ 42 · every input has an accessible name ═══ */
await step(42, async () => {
  await fresh('#/fleet');
  await setAsst(true);
  await page.click('#cmdBtn'); await page.waitForTimeout(70);
  const names = await page.evaluate(() => {
    const name = el => {
      if(el.getAttribute('aria-label')) return el.getAttribute('aria-label');
      const l = el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if(l && !l.hidden && getComputedStyle(l).display !== 'none') return l.textContent.trim();
      return null;
    };
    return [...document.querySelectorAll('input')].map(i => [i.id, name(i)]);
  });
  is(42, names.length >= 2 && names.every(([, v]) => v && v.length > 2), `every input is named (${JSON.stringify(names)})`);
  const sr = await page.evaluate(() => [...document.styleSheets].some(s => {
    try { return [...s.cssRules].some(r => r.selectorText === '.sr'); } catch { return false; } }));
  is(42, sr, 'a .sr rule actually exists in the stylesheet');
  await page.press('#cmdIn', 'Escape'); await page.waitForTimeout(60);
  await setAsst(false);
});

/* ═══ 43 · the tab pattern is complete ═══ */
await step(43, async () => {
  await fresh('#/tools');
  const w = await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    return { tabs: tabs.length,
      bad: tabs.filter(t => !document.getElementById(t.getAttribute('aria-controls') ?? '')).length,
      panels: document.querySelectorAll('[role="tabpanel"]').length,
      labelled: [...document.querySelectorAll('[role="tabpanel"]')]
        .every(p => !!document.getElementById(p.getAttribute('aria-labelledby') ?? '')),
      roving: tabs.filter(t => t.tabIndex === (t.getAttribute('aria-selected') === 'true' ? 0 : -1)).length };
  });
  is(43, w.bad === 0 && w.panels > 0 && w.labelled && w.roving === w.tabs,
    `tabs control real panels with roving tabindex (${JSON.stringify(w)})`);
  /* `.click()` moves aria-selected by itself, so asserting on aria-selected
     alone cannot catch a lost-focus regression. Read activeElement, and press
     twice — every one of these bugs works exactly once. */
  await page.locator('[role="tab"][aria-selected="true"]').focus();
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(120);
  const one = await page.evaluate(() => ({sel: document.querySelector('[role="tab"][aria-selected="true"]')?.dataset.val,
    active: document.activeElement?.dataset?.val ?? document.activeElement?.tagName}));
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(120);
  const two = await page.evaluate(() => ({sel: document.querySelector('[role="tab"][aria-selected="true"]')?.dataset.val,
    active: document.activeElement?.dataset?.val ?? document.activeElement?.tagName}));
  is(43, one.sel === 'Connections' && one.active === 'Connections'
      && two.sel === 'Policy' && two.active === 'Policy',
    `arrow keys move twice and focus follows (${JSON.stringify(one)} then ${JSON.stringify(two)})`);
});

/* ═══ 44a · contrast ═══ */
await step(44, async () => {
  await fresh('#/fleet');
  const t = await page.evaluate(() => { const s = getComputedStyle(document.documentElement);
    return Object.fromEntries(['--dim','--muted','--ok','--crit','--neutral'].map(k => [k, s.getPropertyValue(k).trim()])); });
  is(44, t['--dim'].toUpperCase() === '#6D675C' && t['--muted'].toUpperCase() === '#5F5B54',
    `contrast-solved tokens are in force (${JSON.stringify(t)})`);
});

/* ═══ 44b · the phone drawer has a way out ═══ */
await step(44, async () => {
  await pp.goto('about:blank'); await pp.goto(FILE + '#/fleet'); await pp.waitForTimeout(120);
  await pp.click('#navToggle'); await pp.waitForTimeout(260);
  const open1 = await pp.evaluate(() => ({ nav: document.body.dataset.nav,
    scrim: !document.querySelector('#scrim').hidden,
    focusInRail: document.querySelector('#rail').contains(document.activeElement) }));
  await pp.keyboard.press('Escape'); await pp.waitForTimeout(240);
  const afterEsc = await pp.evaluate(() => document.body.dataset.nav);
  await pp.click('#navToggle'); await pp.waitForTimeout(260);
  await pp.click('#scrim', {force:true}); await pp.waitForTimeout(240);
  const afterScrim = await pp.evaluate(() => document.body.dataset.nav);
  is(44, open1.nav === 'open' && open1.scrim && open1.focusInRail && afterEsc === '' && afterScrim === '',
    `the drawer has a scrim, takes focus, and closes on Escape and on the page behind (${JSON.stringify(open1)})`);
});

/* ═══ 44c · skip link ═══ */
await step(44, async () => {
  await fresh('#/fleet');
  await page.keyboard.press('Tab'); await page.waitForTimeout(70);
  const f = await page.evaluate(() => ({ cls: document.activeElement.className,
    text: document.activeElement.textContent.trim(),
    onScreen: document.activeElement.getBoundingClientRect().left > -100 }));
  is(44, /skip/.test(f.cls) && f.onScreen, `the first tab stop is a visible skip link ("${f.text}")`);
});

/* ═══ 44d · two copy defects ═══ */
await step(44, async () => {
  await fresh('#/billing');
  is(44, !/Prepay annually/.test(await body()), 'billing does not sell an annual prepay to an annual customer');
  await go('#/spend');
  const r = await body();
  is(44, /matched, one line held out/.test(r) && !/matched to the cent/.test(r),
    'reconciliation describes the held-out line honestly');
});

/* ═════════ Second round: findings from the independent re-audits ═════════ */

/* ═══ 45 · every run is reachable without a mouse ═══ */
await step(45, async () => {
  await fresh('#/fleet');
  const links = await page.evaluate(() => [...document.querySelectorAll('#view tr[data-go]')]
    .map(r => ({ go: r.dataset.go, href: r.querySelector('a[href]')?.getAttribute('href') ?? null })));
  is(45, links.length > 1 && links.every(l => l.href === l.go),
    `every run row carries a real link to its own run (${links.filter(l => !l.href).length} without one)`);
  /* Walk the tab order and confirm each run id is actually reached. */
  const seen = new Set();
  await page.evaluate(() => document.body.focus());
  for(let i = 0; i < 60; i++){
    await page.keyboard.press('Tab');
    const h = await page.evaluate(() => document.activeElement?.getAttribute?.('href') ?? null);
    if(h && h.startsWith('#/run/')) seen.add(h);
  }
  is(45, links.every(l => seen.has(l.go)),
    `a keyboard walk reaches all ${links.length} runs (reached ${seen.size})`);
});

/* ═══ 46 · state changes are announced ═══ */
await step(46, async () => {
  await fresh('#/fleet');
  const region = await page.evaluate(() => {
    const el = document.querySelector('[role="status"][aria-live], [aria-live]');
    return el ? {id: el.id, live: el.getAttribute('aria-live')} : null;
  });
  is(46, region && region.live === 'polite', `a polite live region exists (${JSON.stringify(region)})`);
  await page.click('[data-act="approve"][data-i="0"]');
  await page.waitForTimeout(220);
  const said = await page.evaluate(() => document.querySelector('#say').textContent);
  is(46, /Approved/.test(said) && /rcp_/.test(said) && /waiting on a person/.test(said),
    `approving is announced with its receipt ("${said}")`);
  await page.click('[data-act="steer-all"]'); await page.waitForTimeout(220);
  is(46, /Not in this mockup/.test(await page.evaluate(() => document.querySelector('#say').textContent)),
    'the stub message is announced, not only drawn');
  await page.waitForTimeout(1500);
});

/* ═══ 47 · focus survives the re-render ═══ */
await step(47, async () => {
  await fresh('#/run/run_01K5XQ7M4A');
  await page.locator('[data-frame="13"]').focus();
  await page.keyboard.press('Enter'); await page.waitForTimeout(120);
  const afterFrame = await page.evaluate(() => document.activeElement?.dataset?.frame ?? document.activeElement.tagName);
  is(47, afterFrame === '13', `selecting a frame by keyboard keeps focus on it (${afterFrame})`);
  await fresh('#/fleet');
  await page.locator('[data-act="approve"][data-i="0"]').focus();
  await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  const afterApprove = await page.evaluate(() => {
    const a = document.activeElement;
    return {tag: a.tagName, act: a.dataset?.act ?? null, i: a.dataset?.i ?? null, inView: document.querySelector('#view').contains(a)};
  });
  is(47, afterApprove.inView && afterApprove.tag !== 'BODY',
    `approving by keyboard does not dump focus to the document (${JSON.stringify(afterApprove)})`);
});

/* ═══ 48 · the in-page phone simulator contains its own overlays ═══ */
await step(48, async () => {
  await fresh('#/fleet');
  await page.click('[data-width="phone"]'); await page.waitForTimeout(200);
  await page.click('#navToggle'); await page.waitForTimeout(280);
  const r = await page.evaluate(() => {
    const box = el => { const b = el.getBoundingClientRect(); return {l: Math.round(b.left), w: Math.round(b.width)}; };
    return {frame: box(document.querySelector('.frame')), rail: box(document.querySelector('#rail')),
      scrim: box(document.querySelector('#scrim'))};
  });
  is(48, r.rail.l >= r.frame.l - 1 && r.scrim.w <= r.frame.w + 2,
    `the drawer and the scrim stay inside the simulated device (${JSON.stringify(r)})`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  await page.click('[data-width="desktop"]'); await page.waitForTimeout(150);
});

/* ═══ 49 · a finding cannot claim more than its scope spends ═══ */
await step(49, async () => {
  await fresh('#/spend');
  const bad = await page.evaluate(() => FINDINGS
    .filter(f => AGENT(f.scope) && f.at > AGENT(f.scope).spend)
    .map(f => `${f.id}: ${f.at} > ${AGENT(f.scope).spend}`));
  is(49, bad.length === 0, 'no finding claims more monthly waste than its agent spends'
    + (bad.length ? ` — ${bad.join(', ')}` : ''));
});

/* ═══ 50 · a frame's turn label matches the cost table ═══ */
await step(50, async () => {
  await fresh('#/fleet');
  const bad = await page.evaluate(() => {
    const out = [];
    for(const r of RUNS) for(const f of framesOf(r)){
      const m = String(f.d).match(/turn (\d+)/);
      if(!m) continue;
      if(Number(m[1]) !== turnOf(r, f.n).i)
        out.push(`${r.id} frame ${f.n}: says turn ${m[1]}, index is in turn ${turnOf(r, f.n).i}`);
    }
    return out;
  });
  is(50, bad.length === 0, 'every frame that names a turn agrees with the per-turn frame counts'
    + (bad.length ? ` — ${bad.join('; ')}` : ''));
});

/* ═══ 51 · ULIDs sort the way their timestamps do ═══ */
await step(51, async () => {
  await fresh('#/fleet');
  const r = await page.evaluate(() => {
    const byId = [...RUNS].sort((a, b) => a.id.localeCompare(b.id)).map(x => x.id);
    const byTime = [...RUNS].sort((a, b) => a.started.localeCompare(b.started)).map(x => x.id);
    return {byId, byTime};
  });
  is(51, JSON.stringify(r.byId) === JSON.stringify(r.byTime),
    'run ids sort into their start order, as ULIDs must');
});

/* ═══ 52 · the empty state teaches the path into THIS page ═══ */
await step(52, async () => {
  const wrong = [];
  for(const p of ['fleet','agents','tools','ontology','steering','spend','billing','audit','organization']){
    await fresh('#/' + p);
    const t = await page.evaluate(() => { S.view = 'empty'; render();
      const v = document.querySelector('#view');
      return {text: v.innerText.replace(/\s+/g, ' '), cta: v.querySelector('.btn-primary')?.textContent.trim()}; });
    if(p !== 'fleet' && /first run in this workspace|The first run appears here/.test(t.text) && p !== 'spend')
      wrong.push(`${p}: run-shaped copy`);
    if(p === 'ontology' && !/[Cc]onnect/.test(t.cta ?? "")) wrong.push('ontology: wrong call to action — ' + t.cta);
    if(p === 'tools' && !/Import/.test(t.cta ?? "")) wrong.push('tools: wrong call to action — ' + t.cta);
    if(p === 'steering' && !/Context PR/.test(t.cta ?? "")) wrong.push('steering: wrong call to action — ' + t.cta);
  }
  is(52, wrong.length === 0, 'each empty state names its own way in' + (wrong.length ? ` — ${wrong.join('; ')}` : ''));
});

/* ═══ 53 · the denied state changes the shell, not only the body ═══ */
await step(53, async () => {
  await fresh('#/billing');
  const shell = await page.evaluate(() => { S.view = 'denied'; render();
    return {name: document.querySelector('#acctName').textContent,
      role: document.querySelector('#acctRole').textContent,
      badge: document.querySelector('#navApprovals').hidden,
      body: document.querySelector('#view').innerText.replace(/\s+/g, ' ')}; });
  is(53, shell.name !== 'Marcus Bell' && shell.badge === true && !/Marcus Bell, its owner/.test(shell.body),
    `the rail identity and the waiting badge follow the denied viewer (${shell.name} · ${shell.role} · badge hidden ${shell.badge})`);
  await page.evaluate(() => { S.view = 'loaded'; render(); });
  const back = await page.evaluate(() => document.querySelector('#acctName').textContent);
  is(53, back === 'Marcus Bell', 'and the shell comes back when the state does');
});

/* ═══ 54 · the sidebar scrolls when the viewport is short ═══ */
await step(54, async () => {
  const zoom = await browser.newContext({ viewport:{width:320, height:256} });
  const zp = await zoom.newPage();
  await zp.goto(FILE + '#/fleet'); await zp.waitForTimeout(140);
  await zp.click('#navToggle'); await zp.waitForTimeout(260);
  const r = await zp.evaluate(() => {
    const rail = document.querySelector('#rail');
    return {scrollable: rail.scrollHeight > rail.clientHeight,
      overflow: getComputedStyle(rail).overflowY,
      canScroll: (rail.scrollTop = 9999, rail.scrollTop > 0)};
  });
  is(54, r.overflow === 'auto' && (!r.scrollable || r.canScroll),
    `the rail can be scrolled to its last destination (${JSON.stringify(r)})`);
  await zoom.close();
});

/* ═══ 55 · the assistant dock is modal where it covers the page ═══ */
await step(55, async () => {
  await pp.goto('about:blank'); await pp.goto(FILE + '#/fleet'); await pp.waitForTimeout(140);
  await pp.click('#asstBtn'); await pp.waitForTimeout(200);
  const covers = await pp.evaluate(() => {
    const b = document.querySelector('#asst').getBoundingClientRect();
    return Math.round(b.width) >= document.documentElement.clientWidth - 1;
  });
  await pp.keyboard.press('Escape'); await pp.waitForTimeout(200);
  const closed = await pp.evaluate(() => document.querySelector('#asst').hidden);
  is(55, covers && closed, `the full-screen dock closes on Escape (covers ${covers}, closed ${closed})`);
  await pp.click('#asstBtn'); await pp.waitForTimeout(200);
  for(let i = 0; i < 12; i++) await pp.keyboard.press('Tab');
  const inside = await pp.evaluate(() => document.querySelector('#asst').contains(document.activeElement));
  is(55, inside, 'and Tab stays inside it');
  await pp.keyboard.press('Escape');
});

/* ═══ 56 · the command listbox is structurally valid ═══ */
await step(56, async () => {
  await fresh('#/fleet');
  await page.click('#cmdBtn'); await page.waitForTimeout(90);
  const good = await page.evaluate(() => {
    const opts = [...document.querySelectorAll('[role="option"]')];
    return {opts: opts.length,
      focusableInside: opts.filter(o => o.querySelector('a,button,input')).length,
      expanded: document.querySelector('#cmdIn').getAttribute('aria-expanded')};
  });
  is(56, good.opts > 0 && good.focusableInside === 0 && good.expanded === 'true',
    `options hold no focusable descendants (${JSON.stringify(good)})`);
  await page.fill('#cmdIn', 'zzzzzzz'); await page.waitForTimeout(90);
  const none = await page.evaluate(() => ({
    opts: document.querySelectorAll('[role="option"]').length,
    expanded: document.querySelector('#cmdIn').getAttribute('aria-expanded'),
    active: document.querySelector('#cmdIn').getAttribute('aria-activedescendant'),
    status: document.querySelector('#cmdNone').textContent.trim()}));
  is(56, none.opts === 0 && none.expanded === 'false' && none.active === null && /Nothing matches/.test(none.status),
    `a no-match is a status, not a selectable option (${JSON.stringify(none)})`);
  await page.press('#cmdIn', 'Escape'); await page.waitForTimeout(80);
});

/* ═══ 57 · the model contains what its version history says it added ═══ */
await step(57, async () => {
  await fresh('#/ontology');
  const missing = await page.evaluate(() => {
    const names = CLASSES.map(c => c.n);
    return ['WarrantyClaim', 'Depot', 'DeploymentSite'].filter(n => !names.includes(n));
  });
  is(57, missing.length === 0, 'the classes named in the version history are in the model'
    + (missing.length ? ` — missing ${missing.join(', ')}` : ''));
});

/* ═══ 58 · hover feedback only where hovering leads somewhere ═══ */
await step(58, async () => {
  /* The defect is in the hover GROUND, so reading the cursor cannot catch it.
     Hover a row that goes nowhere and a row that does, and require them to
     differ — a positive control, so this cannot pass by the rule being absent. */
  const groundOf = async (route, sel) => {
    await fresh(route);
    await page.locator(sel).first().hover();
    await page.waitForTimeout(120);
    return page.evaluate(s => {
      const tr = document.querySelector(s);
      return {go: !!tr.dataset.go, bg: getComputedStyle(tr.querySelector('td')).backgroundColor};
    }, sel);
  };
  const plain = await groundOf('#/tools', '#view tbody tr');
  const navigable = await groundOf('#/fleet', '#view tbody tr[data-go]');
  const base = await page.evaluate(() => getComputedStyle(document.querySelector('#view .panel')).backgroundColor);
  is(58, !plain.go && navigable.go && plain.bg !== navigable.bg && navigable.bg !== base,
    `only a navigable row lights up on hover (plain ${plain.bg}, navigable ${navigable.bg}, panel ${base})`);
});

/* ═══ 59 · targets are big enough to hit ═══ */
await step(59, async () => {
  await fresh('#/fleet');
  await page.keyboard.press('Tab'); await page.waitForTimeout(80);
  const skip = await page.evaluate(() => {
    const b = document.activeElement.getBoundingClientRect();
    return {w: Math.round(b.width), h: Math.round(b.height)};
  });
  const fold = await page.evaluate(() => {
    const b = document.querySelector('#chromeFold').getBoundingClientRect();
    return {w: Math.round(b.width), h: Math.round(b.height)};
  });
  is(59, skip.h >= 24 && fold.h >= 24, `skip link ${skip.h}px and chrome toggle ${fold.h}px clear 24px`);
});

/* ═══ 60 · approving moves the run it is about ═══ */
await step(60, async () => {
  await fresh('#/fleet');
  const runId = await page.evaluate(() => APPROVALS[0].run);
  await go('#/run/' + runId);
  const before = await text('.head h1');
  await go('#/fleet');
  await page.click('[data-act="approve"][data-i="0"]'); await page.waitForTimeout(120);
  await go('#/run/' + runId);
  const after = await body();
  is(60, /parked/.test(before) && !/parked/.test(after.split('\n')[0]) && /dispatched/.test(after),
    `the approved run leaves the parked state (${runId})`);
  const frame = await page.evaluate(() => framesOf(theRun()).map(f => f.t).join(','));
  is(60, /approval\.granted/.test(frame) && !/approval\.requested/.test(frame),
    `and its last frame becomes the decision (${frame.split(',').pop()})`);
  await setAsst(true); await page.waitForTimeout(80);
  const asst = (await page.locator('#asstBody').innerText()).replace(/\s+/g, ' ');
  is(60, !/still parked/.test(asst) && /resumed/.test(asst),
    'and the assistant stops insisting it is still parked');
  await setAsst(false);
});

/* ═══ 61 · the chrome does not open on top of the primary action ═══ */
await step(61, async () => {
  await pp.goto('about:blank'); await pp.goto(FILE + '#/fleet'); await pp.waitForTimeout(160);
  const r = await pp.evaluate(() => {
    const c = document.querySelector('#chrome').getBoundingClientRect();
    const p = document.querySelector('.btn-primary')?.getBoundingClientRect();
    const hit = p && !(c.right < p.left || c.left > p.right || c.bottom < p.top || c.top > p.bottom);
    return {folded: document.querySelector('#chromeBody').hidden, overlaps: !!hit, h: Math.round(c.height)};
  });
  is(61, r.folded && !r.overlaps, `on a small viewport the chrome starts folded and clears the primary action (${JSON.stringify(r)})`);
});

/* ═══ 62 · what a full-screen overlay covers is inert ═══ */
await step(62, async () => {
  await pp.goto('about:blank'); await pp.goto(FILE + '#/fleet'); await pp.waitForTimeout(160);
  await pp.click('#navToggle'); await pp.waitForTimeout(240);
  const drawer = await pp.evaluate(() => ({main: document.querySelector('#main').inert,
    rail: document.querySelector('#rail').inert}));
  await pp.keyboard.press('Escape'); await pp.waitForTimeout(200);
  const afterDrawer = await pp.evaluate(() => document.querySelector('#main').inert);
  await pp.click('#asstBtn'); await pp.waitForTimeout(240);
  const dock = await pp.evaluate(() => ({main: document.querySelector('#main').inert,
    rail: document.querySelector('#rail').inert}));
  await pp.keyboard.press('Escape'); await pp.waitForTimeout(200);
  const afterDock = await pp.evaluate(() => ({main: document.querySelector('#main').inert,
    rail: document.querySelector('#rail').inert}));
  is(62, drawer.main && !drawer.rail && !afterDrawer && dock.main && dock.rail && !afterDock.main && !afterDock.rail,
    `the drawer and the dock each inert what they cover, and release it on close (drawer ${JSON.stringify(drawer)}, dock ${JSON.stringify(dock)})`);
});

/* ═════════ Feedback items built after the audit closed ═════════ */

/* ═══ 63 · the cost is a large total by the run name, basis one click away ═══ */
await step(63, async () => {
  await fresh('#/run/run_01K5XQ7M4A');
  const head = await page.evaluate(() => {
    const n = document.querySelector('.runcost .rc-n');
    const h1 = document.querySelector('.head h1');
    return {text: n?.textContent.trim(), size: n ? parseFloat(getComputedStyle(n).fontSize) : 0,
      nearName: !!n && !!h1 && n.getBoundingClientRect().top - h1.getBoundingClientRect().bottom < 160};
  });
  is(63, head.text === '$4.87' && head.size >= 28 && head.nearName,
    `the total is large and next to the run name (${JSON.stringify(head)})`);
  /* And it is the same arithmetic the Cost tab shows. */
  await page.click('[role="tab"][data-val="Cost"]'); await page.waitForTimeout(70);
  const tab = await text('#panel-runTab .panel-h h2');
  is(63, tab.includes(head.text), `the Cost tab names the same total (${tab})`);
  await page.click('[role="tab"][data-val="Timeline"]'); await page.waitForTimeout(70);
  /* Click the button a person sees, not the attribute that wires it up — a
     handler taken off the button should fail this cleanly, not time out. */
  await page.click('.runcost .rc-b'); await page.waitForTimeout(140);
  const dlg = await page.evaluate(() => ({open: document.querySelector('#basis').open,
    title: document.querySelector('#basisTitle').textContent,
    body: document.querySelector('#basisBody').innerText.replace(/\s+/g, ' ')}));
  is(63, dlg.open && dlg.title.includes('$4.87') && /Model calls/.test(dlg.body) && /gateway observed/.test(dlg.body),
    `the basis opens on click rather than sitting under the number (${dlg.title})`);
  /* The split has to add back up to the total it explains. */
  const parts = [...dlg.body.matchAll(/\$([\d,]+\.\d\d)/g)].map(m => n_(m[1]));
  is(63, parts.length >= 2 && Math.abs(parts[0] + parts[1] - 4.87) < 0.005,
    `model plus tools equals the total (${parts.slice(0,2).join(' + ')})`);
  await page.click('[data-close="basis"]'); await page.waitForTimeout(80);
});

/* ═══ 64 · the prompt is inspectable, and not open on load ═══ */
await step(64, async () => {
  await fresh('#/run/run_01K5XQ7M4A');
  await page.click('[data-frame="12"]'); await page.waitForTimeout(80);
  const shut = await page.evaluate(() => {
    const d = document.querySelector('#panel-runTab details.more');
    if(!d) return {present: false};
    /* A closed <details> in Chromium uses content-visibility:hidden, so the
       body keeps an offsetParent — measure the element instead, which is just
       the summary line when shut. */
    return {present: true, open: d.open,
      h: Math.round(d.getBoundingClientRect().height),
      shown: d.querySelector('pre').checkVisibility?.({contentVisibilityAuto: true}) ?? null};
  });
  is(64, shut.present && !shut.open && shut.h < 70 && shut.shown !== true,
    `the prompt is there and closed when the page loads (${JSON.stringify(shut)})`);
  await page.click('#panel-runTab details.more summary'); await page.waitForTimeout(120);
  const open = await page.evaluate(() => {
    const d = document.querySelector('#panel-runTab details.more');
    return {open: d.open, body: d.querySelector('pre').innerText};
  });
  is(64, open.open && /stable prefix/.test(open.body) && /acme\.core\.release-manager/.test(open.body)
      && /never merges to main/.test(open.body),
    `and it opens to the real prefix, with the records in force in it (${open.body.length} chars)`);
  /* A frame with no prompt must not grow an empty disclosure. */
  await page.click('[data-frame="118"]'); await page.waitForTimeout(80);
  const other = await page.locator('#panel-runTab details.more').count();
  is(64, other === 0, 'a frame that carries no prompt shows no disclosure');
});

/* ═══ 65 · spend by operator reconciles to spend by workspace ═══ */
await step(65, async () => {
  await fresh('#/spend');
  const tile = n_((await body()).match(/Spent \$([\d,]+\.\d\d)/i)?.[1]);
  const rows = await page.evaluate(() => [...document.querySelectorAll('#view tbody tr')]
    .filter(r => r.children.length === 6 && /operator|owner|billing/.test(r.children[1].textContent))
    .map(r => Number(r.children[4].textContent.replace(/[$,]/g, ''))));
  const sum = rows.reduce((s, v) => s + v, 0);
  is(65, rows.length >= 3 && Math.abs(sum - tile) < 0.005,
    `the operators sum to the workspace spend (${rows.length} operators, $${sum.toFixed(2)} vs $${tile})`);
  const t = await body();
  is(65, /Spend by operator/i.test(t) && /a run is an agent, a person and a prompt/.test(t),
    'and the panel says what it is counting');
});

/* ═══ 66 · a name a model wrote is marked as one ═══ */
await step(66, async () => {
  await fresh('#/fleet');
  const marked = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#view tr[data-go]')];
    return {rows: rows.length, withMark: rows.filter(r => r.querySelector('.gen')).length};
  });
  is(66, marked.rows > 1 && marked.withMark === marked.rows,
    `every generated run name carries its marker (${marked.withMark} of ${marked.rows})`);
  await go('#/run/run_01K5XQ7M4A');
  const run = await page.evaluate(() => ({
    summary: document.querySelector('.head-t p:nth-of-type(2)')?.innerText.replace(/\s+/g, ' ').trim() ?? '',
    marked: !!document.querySelector('.head-t .gen')}));
  is(66, run.marked && run.summary.length > 60 && /retry budget/.test(run.summary),
    `the run page carries the generated summary, marked (${run.summary.slice(0, 60)}…)`);
});

/* ═════════ The Agent IAM surface ═════════ */

/* ═══ 67 · the sidebar says what the destination is ═══ */
await step(67, async () => {
  await fresh('#/fleet');
  const label = await page.evaluate(() => document.querySelector('.navsec a[data-nav="agents"]').textContent.trim());
  is(67, /IAM/.test(label) && /Agents/.test(label), `the nav names both the agents and the surface ("${label}")`);
  const title = await page.evaluate(() => { location.hash = '#/agents'; return null; });
  await page.waitForTimeout(90);
  is(67, /IAM/.test(await page.title()), `and the document title carries it too ("${await page.title()}")`);
});

/* ═══ 68 · an agent row opens that agent's access surface ═══ */
await step(68, async () => {
  await fresh('#/agents');
  /* Read the LINK, not the data-go beside it — the row's mouse affordance is
     not the thing a keyboard follows, and reading the attribute a defect does
     not corrupt is how this assertion passed with every link pointing at one
     agent. Compare it against the agent key printed in the row itself. */
  const rows = await page.locator('#view tr[data-go]').evaluateAll(r =>
    r.map(x => ({ key: x.querySelector('td .s.mono').textContent.trim(),
                  href: x.querySelector('td a.rowlink').getAttribute('href'),
                  go: x.dataset.go })));
  is(68, rows.length === 5
      && new Set(rows.map(r => r.href)).size === rows.length
      && rows.every(r => r.href === r.go),
    `every agent row links somewhere of its own, and the row and its link agree (${rows.length} rows)`);
  const miss = [];
  for(const row of rows){
    await go(row.href);
    const h1 = await text('.phead h1');
    if(h1 !== row.key) miss.push([row.key, row.href, h1]);
  }
  is(68, miss.length === 0, `each opens the principal its own row names`
    + (miss.length ? ` — ${JSON.stringify(miss)}` : ''));
});

/* ═══ 69 · effective permission is shown as the intersection it is ═══ */
await step(69, async () => {
  await fresh('#/agents/release-manager/Identity');
  const w = await page.evaluate(() => {
    const el = document.querySelector('.iamw');
    return el ? {terms: [...el.querySelectorAll('.t')].map(t => t.textContent.trim()),
      ops: el.querySelectorAll('.op').length, out: el.querySelector('.t.out')?.textContent.trim() ?? null} : null;
  });
  /* n terms joined by n-1 intersection operators, and the last one is the result. */
  is(69, w && w.terms.length >= 3 && w.ops === w.terms.length - 2 && w.out,
    `the formula reads as an intersection (${w?.terms.length} terms, ${w?.ops} operators)`);
  is(69, /tool versions/.test(w?.out ?? ''), `and resolves to the belt (${w?.out})`);
  /* The person invoking it is one of the terms — that is the delegation ceiling. */
  is(69, w.terms.some(t => /Marcus Bell/.test(t)),
    'the person invoking it is a term, so the ceiling is visible');
  const sr = await page.evaluate(() => document.querySelector('.iamw .sr')?.textContent ?? '');
  is(69, /intersected with/.test(sr), 'and the operator is read out, not left as a glyph');
});

/* ═══ 70 · no roles means no reach, and the page says so ═══ */
await step(70, async () => {
  await fresh('#/agents/docs-writer/Identity');
  const t = await body();
  is(70, /none held/.test(t), 'an agent with no roles says it holds none');
  const nil = await page.locator('.iamw .t.nil').count();
  is(70, nil === 1, 'and the intersection resolves to the empty result, marked as such');
  await go('#/agents/docs-writer/Toolbelt');
  const belt = await body();
  is(70, /shown no tools at all/.test(belt) && /cannot reach a single tool server/.test(belt),
    'its belt is empty, and the page explains what that means');
});

/* ═══ 71 · the belt and what is hidden partition the registry ═══ */
await step(71, async () => {
  await fresh('#/agents/release-manager/Toolbelt');
  const r = await page.evaluate(() => {
    const tables = [...document.querySelectorAll('#panel-agentTab table')];
    const ids = t => [...t.querySelectorAll('tbody tr td:first-child .tc > .mono')].map(x => x.textContent.trim());
    return {belt: ids(tables[0]), outside: ids(tables[1]), registry: TOOLS.length};
  });
  is(71, r.belt.length > 0 && r.outside.length > 0
      && r.belt.length + r.outside.length === r.registry
      && r.belt.every(id => !r.outside.includes(id)),
    `${r.belt.length} shown + ${r.outside.length} hidden = ${r.registry} in the registry, with no overlap`);
  const reasons = await page.evaluate(() => {
    const t = [...document.querySelectorAll('#panel-agentTab table')][1];
    return [...t.querySelectorAll('tbody tr td:last-child')].map(x => x.textContent.trim());
  });
  is(71, reasons.length === r.outside.length && reasons.every(x => x.length > 20),
    'and every hidden tool says why it is hidden');
});

/* ═══ 72 · a refusal shows its reasoning ═══ */
await step(72, async () => {
  await fresh('#/agents/release-manager/Mandate');
  const steps = await page.evaluate(() => [...document.querySelectorAll('.iamc li')]
    .map(li => ({l: li.querySelector('.l').textContent.trim(), v: li.querySelector('.v').textContent.trim()})));
  is(72, steps.length === 4 && steps[0].l === 'Call' && /Decision/.test(steps[3].l),
    `the denial is a numbered walk from the call to the decision (${steps.length} steps)`);
  is(72, /no_mandate/.test(steps[3]?.v ?? '') && /denied/.test(steps[3]?.v ?? ''),
    'and the last step names the gate and the reason');
  /* The agent that does hold one shows the mandate instead. */
  await go('#/agents/invoice-bot/Mandate');
  const m = await body();
  is(72, /Per call/.test(m) && !/no_mandate/.test(m), 'the mandated agent shows its mandate, not a denial');
});

/* ═══ 73 · a tab of an agent is a place you can send somebody ═══ */
await step(73, async () => {
  await fresh('#/agents/release-manager/Identity');
  await page.click('[role="tab"][data-val="Toolbelt"]'); await page.waitForTimeout(140);
  is(73, page.url().endsWith('#/agents/release-manager/Toolbelt'),
    `clicking a tab writes the hash (${page.url().split('#')[1]})`);
  /* And the deep link opens on that tab, not on the default. */
  await fresh('#/agents/invoice-bot/Mandate');
  const sel = await page.evaluate(() => document.querySelector('[role="tab"][aria-selected="true"]')?.dataset.val);
  is(73, sel === 'Mandate', `a deep link opens on its own tab (${sel})`);
  /* A slug that does not exist falls back rather than throwing. */
  await fresh('#/agents/not-an-agent');
  is(73, !(await body()).includes('undefined'), 'an unknown agent slug falls back to the list');
});

/* ═══ 74 · the tool grammar is the same everywhere it appears ═══ */
await step(74, async () => {
  await fresh('#/tools');
  const reg = await page.evaluate(() => ({
    badges: document.querySelectorAll("#panel-toolsTab tbody tr .tcb").length,
    distinct: new Set([...document.querySelectorAll("#panel-toolsTab .tcb")].map(x => x.textContent.trim())).size,
    allCats: TCAT_ORDER.length,
    hazards: document.querySelectorAll("#panel-toolsTab .hz").length,
    gates: document.querySelectorAll("#panel-toolsTab .gt").length,
    rows: document.querySelectorAll("#panel-toolsTab tbody tr").length }));
  is(74, reg.badges === reg.rows && reg.gates === reg.rows && reg.hazards === reg.rows * 2,
    `every registry row carries one category, one gate and both hazard marks (${JSON.stringify(reg)})`);
  is(74, reg.distinct === reg.allCats,
    `and the sample covers every category the grammar defines (${reg.distinct} of ${reg.allCats})`);
  /* A dashed gate means a person stands in the way — and only then. */
  const dashed = await page.evaluate(() => [...document.querySelectorAll('#panel-toolsTab .gt')]
    .map(g => ({cls: g.className, dashed: getComputedStyle(g).borderStyle === 'dashed'})));
  is(74, dashed.every(g => g.dashed === /g-(require_approval|mandate)/.test(g.cls)),
    'a dashed border appears on exactly the gates that stop for a person');
  /* And the same grammar renders on the belt and in an approval. */
  await go('#/agents/release-manager/Toolbelt');
  const belt = await page.evaluate(() => document.querySelectorAll('#panel-agentTab .tcb').length);
  await go('#/fleet');
  const appr = await page.evaluate(() => document.querySelectorAll('.appr .tcb').length);
  is(74, belt > 0 && appr === 3, `the belt (${belt}) and the approvals (${appr}) use the same badge`);
});

/* ═══ the contrast guard runs as part of this one ═══ */
await step(44, async () => {
  const { execFileSync } = await import('node:child_process');
  const { dirname: dn, resolve: rs } = await import('node:path');
  const { fileURLToPath: f2u } = await import('node:url');
  const here = dn(f2u(import.meta.url));
  try {
    const out = execFileSync(process.execPath, [rs(here, 'verify-contrast.js')],
      {encoding:'utf8', env:{...process.env, TARGET: FILE.replace('file://', '')}});
    is(44, /ALL PASS/.test(out), out.trim().split('\n').pop());
  } catch(e){
    bad(44, 'the contrast guard failed: ' + String(e.stdout ?? e.message).trim().split('\n').slice(-3).join(' | '));
  }
});

/* ═══ no console errors anywhere ═══ */
is(0, errors.length === 0, 'no console or page errors' + (errors.length ? `: ${[...new Set(errors)].slice(0,5).join(' | ')}` : ''));

await browser.close();

const fail = results.filter(r => !r.pass);
for(const r of results) console.log(`${r.pass ? 'ok  ' : 'FAIL'} ${String(r.n).padStart(2)}  ${r.m}`);
console.log(`\n${results.length - fail.length}/${results.length} assertions pass` + (fail.length ? `  ·  ${fail.length} FAILING` : ''));
process.exit(fail.length ? 1 : 0);
