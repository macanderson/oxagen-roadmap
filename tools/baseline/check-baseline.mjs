#!/usr/bin/env node
// Browser check that mc.html is the design baseline every lane builds from:
// Agent IAM + small approval cards + sidebar flyout + runMetrics(R) instruments.
//
//   node tools/baseline/check-baseline.mjs [mc.html] [--shots DIR]
//
// Each numeric assertion compares two independent sources (a derivation against the
// run record, or a tile against the rows it summarises), so it can fail. Exit 1 on any
// failure; a check that cannot find its subject fails, it never skips.
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const file = path.resolve(process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "mc.html");
const shotsAt = process.argv.indexOf("--shots");
const shots = shotsAt > 0 ? process.argv[shotsAt + 1] : null;

const mod = ["/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright/index.js",
  "/opt/homebrew/lib/node_modules/playwright/index.js"].find(existsSync);
if (!mod) { console.error("playwright not found"); process.exit(2); }
const pw = (await import(mod)).default ?? (await import(mod));
const cache = path.join(os.homedir(), "Library/Caches/ms-playwright");
const exe = ["chromium_headless_shell-1234", "chromium_headless_shell-1223"]
  .flatMap(d => ["chrome-headless-shell-mac-arm64", "chrome-headless-shell-mac-x64"].map(s => path.join(cache, d, s, "chrome-headless-shell")))
  .find(existsSync);

const browser = await pw.chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", e => errors.push(String(e.message || e)));
let failed = 0;
const ok = (cond, label, detail) => {
  console.log((cond ? "ok   " : "FAIL ") + label + (cond || detail === undefined ? "" : "  → " + JSON.stringify(detail)));
  if (!cond) failed++;
};

await page.goto("file://" + file + "#/a-intel/core-platform");
await page.waitForFunction(() => document.querySelector("#app")?.children.length > 0);

// --- shell: Agent IAM naming, small approvals, flyout ---------------------------------
const shell = await page.evaluate(() => ({
  nav: [...document.querySelectorAll(".side, nav")].map(n => n.textContent).join(" "),
  apsm: document.querySelectorAll(".apsm").length,
  dock: !!document.querySelector(".asst-bar, #dock"),
  host: !!document.getElementById("asst"),
}));
ok(/Agent IAM/.test(shell.nav), "nav names the Agent IAM section");
ok(shell.apsm > 0, "fleet renders approvals as small cards", shell.apsm);
ok(!shell.dock && shell.host, "agent is the sidebar flyout host, not a bottom dock", shell);

const fly = await page.evaluate(() => {
  asstToggle(true);
  const host = document.getElementById("asst"), t = host.querySelector("textarea:not([disabled])");
  const open = host.classList.contains("open") && !host.hasAttribute("inert");
  if (t) t.value = "half-typed";
  render();
  const kept = host.querySelector("textarea:not([disabled])")?.value;
  asstToggle(false);
  return { open, kept, closedInert: host.hasAttribute("inert") };
});
ok(fly.open && fly.kept === "half-typed" && fly.closedInert, "flyout opens, keeps typed text across render(), closes inert", fly);

// --- the tsec/dur shadowing stays fixed ----------------------------------------------
const fmt = await page.evaluate(() => ({ dur90: dur(90), ms: typeof msDur === "function" ? msDur(90000) : null, tsec: tsec("00:01:30") }));
ok(fmt.dur90 === "1m 30s", "dur() still formats seconds (not shadowed by the ms formatter)", fmt);
ok(fmt.ms === "1m 30s", "msDur() formats milliseconds", fmt);
ok(fmt.tsec === 90, "tsec parses a frame clock", fmt);

// --- scenarios ------------------------------------------------------------------------
const scn = await page.evaluate(async () => {
  location.hash = "#/a-intel/core-platform/scenarios/stop-it-steer-it/0";
  await new Promise(r => setTimeout(r, 60));
  const on = !!document.querySelector("[class*='scn-']");
  location.hash = "#/a-intel/core-platform";
  await new Promise(r => setTimeout(r, 60));
  return { on, offAfter: !document.querySelector("[class*='scn-']") };
});
ok(scn.on && scn.offAfter, "scenario rail shows on a scenario route and is gone after leaving", scn);

// --- the in-app agent's turns are recorded but not the tenant's runs (issue #11) --------
// Fleet's rows and its "Spend, runs shown" tile are read from the DOM, ASST_RUNS from the data,
// so the three can disagree. Each assistant run must still open by id, as a receipt would open it.
const asst = await page.evaluate(async () => {
  const out = { seeded: ASST_RUNS.length, inRuns: RUNS.filter(r => r.agent === ASST_KEY).map(r => r.id), listed: [], tiles: [] };
  for (const ws of [...new Set(ASST_RUNS.map(r => r.ws))]) {
    S.runFilter = null; location.hash = "#/a-intel/" + ws;
    await new Promise(r => setTimeout(r, 60));
    // the list controls page the table at 10 rows; the tile sums every run listed, so show them all
    const per = document.querySelector(".lt-per");
    if (per) { per.value = "0"; per.dispatchEvent(new Event("change", { bubbles: true })); }
    const rows = [...document.querySelectorAll(".tw tbody tr")].filter(tr => tr.querySelector(".tid"));
    rows.forEach(tr => { if (tr.querySelector(".tkey")?.textContent === ASST_KEY) out.listed.push(ws + " " + tr.querySelector(".tid").textContent); });
    const tile = [...document.querySelectorAll(".stat")].find(t => t.querySelector(".k")?.textContent === "Spend, runs shown");
    const sum = rows.reduce((a, tr) => a + parseFloat(tr.querySelector("td.num").textContent.replace(/[^0-9.]/g, "")), 0);
    out.tiles.push({ ws, rows: rows.length, tile: tile ? parseFloat(tile.querySelector(".v").textContent.replace(/[^0-9.]/g, "")) : null, sum: +sum.toFixed(2) });
  }
  out.opens = ASST_RUNS.map(r => run(r.id) === r && !!r.summary);
  location.hash = "#/a-intel/core-platform"; await new Promise(r => setTimeout(r, 60));
  return out;
});
ok(asst.seeded > 0 && asst.inRuns.length === 0, "no run of the in-app agent is in RUNS (" + asst.seeded + " live in ASST_RUNS)", asst.inRuns);
ok(asst.listed.length === 0, "Fleet lists no run of the in-app agent", asst.listed);
ok(asst.tiles.length > 0 && asst.tiles.every(t => t.rows > 0 && t.tile !== null && Math.abs(t.tile - t.sum) < 0.006), "Fleet's spend tile equals the sum of the rows shown", asst.tiles);
ok(asst.opens.length === asst.seeded && asst.opens.every(Boolean), "every assistant run still resolves by id for receipts and turn bars", asst.opens);

// --- governance: a run's tool calls are calls its agent's belt could make -------------
// Two independent records: the calls runMetrics shows (drawn from TOOLPOOL, or recorded frames)
// against AGENT_BELTS + the BELT decision + the TOOLS registry.
const gov = await page.evaluate(() => {
  const bad = (agent, id) => {
    const why = [];
    if (!(AGENT_BELTS[agent] || []).includes(id)) why.push("not on belt");
    if (!toolById(id)) why.push("not in TOOLS");
    if ((beltById(id) || {}).dec === "deny") why.push("denied");
    return why.length ? agent + " " + id + ": " + why.join(", ") : null;
  };
  const pool = Object.entries(TOOLPOOL).flatMap(([a, xs]) => xs.map(x => bad(a, x[0]))).filter(Boolean);
  const runs = RUNS.filter(R => AGENT_BELTS[R.agent]).flatMap(R => [...new Set(runMetrics(R).calls.map(c => c.id))].map(id => bad(R.agent, id))).filter(Boolean);
  return { pool, runs: [...new Set(runs)], checked: RUNS.filter(R => AGENT_BELTS[R.agent]).length };
});
ok(gov.pool.length === 0, "every TOOLPOOL tool is on its agent's belt, registered, and not denied", gov.pool);
ok(gov.checked > 0 && gov.runs.length === 0, "every run's tool calls are ones its agent's belt could make (" + gov.checked + " runs)", gov.runs);

// --- every run page: six instruments, prompt, calls panel, and the numbers agree ------
const runs = await page.evaluate(() => RUNS.concat(ASST_RUNS).map(r => ({ id: r.id, ws: r.ws })));
ok(runs.length > 0, "RUNS is not empty", runs.length);
for (const run of runs) {
  const r = await page.evaluate(async ({ id, ws }) => {
    S.phone = false;
    S.tab.run = "player";
    location.hash = "#/a-intel/" + (ws || "core-platform") + "/runs/" + id;
    await new Promise(res => setTimeout(res, 40));
    const R = run(id), m = runMetrics(R);
    const tiles = [...document.querySelectorAll(".inst-grid .inst")];
    const tileText = k => tiles.find(t => t.querySelector(".k")?.textContent === k)?.querySelector(".iv")?.textContent || "";
    const light = /haiku|flash|light/i.test(R.model || "");
    const priced = m.tokIn * 1.88e-6 + m.tokOut * (light ? 5e-6 : 75e-6);
    // Files changed: header diffstat against the per-file summaries
    const dsum = document.querySelector(".lw-files .dsum");
    const perFile = [...document.querySelectorAll(".lw-files summary .dstat")].map(d => d.textContent);
    const addRows = perFile.reduce((a, t) => a + (+(t.match(/\+(\d+)/) || [0, 0])[1]), 0);
    const out = {
      tiles: tiles.length, prompt: !!document.querySelector(".pr-row"),
      cost: parseFloat(R.cost) || 0, priced,
      wallTile: tileText("Wall clock"), wall: msDur(m.wall),
      famSum: m.families.reduce((a, f) => a + f.n, 0), calls: m.calls.length,
      files: (runGraphOf(R).files || []).length, dsum: dsum ? dsum.textContent : null, addRows, perFile: perFile.length,
    };
    // timeline: no turn label and no mark may sit on top of another label or mark
    const boxes = [...document.querySelectorAll(".rt-turns span, .rt-band .t, .rt-mark")].map(n => {
      const b = n.getBoundingClientRect(); return { t: n.textContent, l: b.left, r: b.right, top: b.top, bot: b.bottom };
    }).filter(b => b.r > b.l);
    out.labelHits = [];
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.l < b.r - 1 && b.l < a.r - 1 && a.top < b.bot - 1 && b.top < a.bot - 1) out.labelHits.push(a.t + " × " + b.t);
    }
    out.labels = boxes.length;
    S.tab.run = "cost"; render();
    const rows = [...document.querySelectorAll(".cc-c.wide tbody tr")].map(tr => +tr.children[1].textContent);
    out.cc = !!document.querySelector(".cc");
    out.tableSum = rows.reduce((a, b) => a + b, 0);
    out.toolTile = parseInt(tiles.length ? document.querySelector(".inst-grid").textContent.match(/(\d+)calls/)?.[1] : "", 10);
    S.phone = true; render();
    const vp = document.getElementById("viewport");
    out.phoneOverflow = vp.scrollWidth - vp.clientWidth;
    S.phone = false; S.tab.run = "player"; render();
    return out;
  }, run);
  const tag = run.id;
  ok(r.tiles === 6, tag + ": six instruments", r.tiles);
  ok(r.prompt, tag + ": prompt panel under the instruments");
  ok(r.cc, tag + ": calls, concurrency and prefetch panel on the Cost tab");
  ok(Math.abs(r.priced - r.cost) <= Math.max(0.011, r.cost * 0.001), tag + ": tokens × published price reproduce the recorded cost", { priced: r.priced, cost: r.cost });
  ok(r.wallTile.startsWith(r.wall), tag + ": wall-clock tile shows msDur(wall)", { tile: r.wallTile, wall: r.wall });
  ok(r.famSum === r.calls && r.tableSum === r.calls && r.toolTile === r.calls, tag + ": tile, family table and derivation agree on tool calls", r);
  if (r.files) ok(r.dsum && r.dsum.includes("+" + r.addRows) && r.perFile === r.files, tag + ": Files changed diffstat equals the sum of the files", r);
  ok(r.labels > 0 && r.labelHits.length === 0, tag + ": timeline labels and marks do not overlap", r.labelHits);
  ok(r.phoneOverflow <= 0, tag + ": no horizontal overflow in phone mode", r.phoneOverflow);
}

if (shots) {
  const first = runs[0];
  for (const theme of ["light", "dark"]) for (const tab of ["player", "cost"]) {
    await page.evaluate(({ id, theme, tab }) => {
      S.theme = theme; document.documentElement.setAttribute("data-theme", theme);
      S.tab.run = tab; location.hash = "#/a-intel/core-platform/runs/" + id; render();
      document.querySelectorAll("*").forEach(n => { if (n.scrollTop) n.scrollTop = 0; }); window.scrollTo(0, 0);
    }, { id: first.id, theme, tab });
    await page.waitForTimeout(80);
    await page.evaluate(t => document.querySelector(t === "cost" ? ".cc" : ".inst-grid")?.scrollIntoView(), tab);
    await page.screenshot({ path: path.join(shots, "run-" + tab + "-" + theme + ".png"), fullPage: false });
  }
}

ok(errors.length === 0, "no page errors", errors.slice(0, 5));
await browser.close();
console.log(failed ? `\n${failed} failed` : "\nall checks passed");
process.exit(failed ? 1 : 0);
