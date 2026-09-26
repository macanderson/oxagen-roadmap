#!/usr/bin/env node
// Walks the v3 mockup in headless Chromium and fails on anything that reads or works wrong.
//
//   node tools/check-mockup-v3.mjs              # every check
//   node tools/check-mockup-v3.mjs --shots DIR  # also save a screenshot of every view, theme and shell
//
// It builds the page from mockups/v3/src and mockups/v3/fixtures first, so it never reads a stale
// build. What it holds the mockup to:
//   - every view renders in both themes, desktop and phone, with a heading, no script error and no
//     sideways scroll; a session's transcript starts in the first viewport
//   - each of the four transcripts replays from the start to the end in its own harness's look
//   - the Claude Code session's question can be approved and denied from the page, and the
//     transcript and the work item follow
//   - sending a work item to an agent opens its session
//   - every drawer and dialog opens, and the first run renders every view's empty state
//   - money reconciles: a transcript's cost is the sum of its requests, and every Spend grouping
//     sums to the month total, to the cent
//   - the copy outside the terminal follows the house rules (no em dash, no mid-dot label, no
//     "undefined", no capitalized brand name, no "1 sessions")
import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildMockupV3 } from "./build-mockup-v3.mjs";
import { launchChromium } from "./lib/playwright.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const shots = args.includes("--shots") ? path.resolve(args[args.indexOf("--shots") + 1]) : null;
if (shots) mkdirSync(shots, { recursive: true });
const FILE = path.join(os.tmpdir(), `check-mockup-v3-${process.pid}.html`);
writeFileSync(FILE, buildMockupV3());
const URL0 = "file://" + FILE;
const BASE = "/a-intel/core-platform";
const FLAGSHIP = "ses_01K5RS7M2E8FJ3QW";
const TRANSCRIPTS = { [FLAGSHIP]: "claude-code", ses_01K5QX4B9C7XTN2P: "codex-cli", ses_01K5RP2D6H4KLM8V: "cursor", ses_01K5RN8F3J2GHY6T: "stella" };
const VIEWS = {
  work: BASE + "/work", sessions: BASE + "/sessions", agents: BASE + "/agents", steering: BASE + "/steering", servers: BASE + "/servers", spend: BASE + "/spend",
  ...Object.fromEntries(Object.keys(TRANSCRIPTS).map((id) => ["session-" + TRANSCRIPTS[id], BASE + "/sessions/" + id])),
};
const SHELLS = { desktop: { width: 1440, height: 1000 }, phone: { width: 400, height: 860 } };

let passes = 0, failures = 0;
const ok = (cond, what) => { if (cond) passes++; else { failures++; console.error("FAIL " + what); } };

const browser = await launchChromium(root);
const errors = [];
async function open(page, hash, q = "") {
  await page.goto("about:blank");
  await page.goto(`${URL0}?island=0${q}#${hash}`);
  await page.waitForFunction(() => document.querySelector("#app h1, #app h2"), null, { timeout: 15000 });
}
function watch(page, label) {
  page.on("pageerror", (e) => errors.push(`${label}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${label}: console ${m.text()}`); });
  page.on("dialog", (d) => { errors.push(`${label}: a browser dialog opened (${d.message()})`); d.dismiss(); });
}

// The copy rules, over the page text outside the terminal (the terminal is the harness's own output).
const COPY = [
  ["empty value", /\bundefined\b|\bNaN\b|\bnull\b/],
  ["em or en dash", /[—–]/],
  ["mid-dot", /·/],
  ["brand case", /Oxagen|Stella|Mission Control/],
  ["plural", /\b1 (sessions|requests|items|agents|servers|tools|loads|suggestions|conflicts|keys|entries|work items)\b/],
  ["thousands separator", /\$\d{4,}\.\d{2}/],
  ["US spelling", /colour|behaviour|labelling|cancelled|licence/i],
];
async function copyCheck(page, label) {
  const text = await page.evaluate(() => {
    const off = document.createElement("style");
    off.textContent = ".tc, pre, code, .pill, textarea { display: none !important; }";
    document.head.appendChild(off);
    const t = document.body.innerText;
    off.remove();
    return t;
  });
  for (const [name, re] of COPY) { const m = text.match(re); ok(!m, `${label}: copy rule "${name}" matched ${JSON.stringify(m && text.slice(Math.max(0, m.index - 40), m.index + 40))}`); }
}

// 1. Every view, both themes, both shells.
for (const [shell, vp] of Object.entries(SHELLS)) {
  for (const theme of ["dark", "light"]) {
    const page = await browser.newPage({ viewport: vp });
    watch(page, `${shell}/${theme}`);
    for (const [name, hash] of Object.entries(VIEWS)) {
      const label = `${name} ${shell} ${theme}`;
      await open(page, hash, `&theme=${theme}${shell === "phone" ? "" : ""}`);
      await page.waitForTimeout(250);
      const m = await page.evaluate(() => {
        const b = document.getElementById("rp-body");
        return {
          h1: !!document.querySelector("#app h1"), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
          body: b ? b.getBoundingClientRect().top : null, rows: document.querySelectorAll("#rp-body .tr").length,
          phone: document.getElementById("viewport").classList.contains("phone"), theme: document.documentElement.getAttribute("data-theme"),
        };
      });
      ok(m.h1, `${label}: no heading`);
      ok(m.sw <= m.cw + 1, `${label}: the page scrolls sideways (${m.sw} > ${m.cw})`);
      ok(m.phone === (shell === "phone"), `${label}: the ${shell} shell did not apply`);
      ok(m.theme === theme, `${label}: the ${theme} theme did not apply`);
      if (name.startsWith("session-")) {
        ok(m.body !== null && m.body < vp.height * (shell === "phone" ? 0.62 : 0.4), `${label}: the transcript starts at ${m.body}px, below the first viewport`);
        ok(m.rows > 5, `${label}: the transcript shows ${m.rows} rows`);
      }
      if (shell === "desktop") await copyCheck(page, label);
      if (shots) await page.screenshot({ path: path.join(shots, `${name}-${shell}-${theme}.png`) });
    }
    await page.close();
  }
}

// 2. Replays, the question, sending work, drawers, dialogs, money.
const page = await browser.newPage({ viewport: SHELLS.desktop });
watch(page, "flows");

for (const [id, harness] of Object.entries(TRANSCRIPTS)) {
  await open(page, `${BASE}/sessions/${id}`, "&theme=dark");
  const skin = { "claude-code": ".cc", "codex-cli": ".cx", cursor: ".cu", stella: ".st" }[harness];
  ok(await page.$(`.term${skin}`), `${harness}: the terminal is not in its own skin`);
  await page.selectOption('select[data-change="rp-speed"]', "16");
  await page.click('[data-act="rp-restart"]');
  await page.waitForTimeout(400);
  const early = await page.evaluate(() => ({ vt: RP.vt, total: RP.total, rows: document.querySelectorAll("#rp-body .tr").length, playing: RP.playing }));
  ok(early.playing && early.vt < early.total, `${harness}: the replay did not start from the beginning`);
  await page.waitForFunction(() => !RP.playing, null, { timeout: 60000 });
  const end = await page.evaluate(() => ({ vt: RP.vt, total: RP.total, rows: document.querySelectorAll("#rp-body .tr").length, cost: document.getElementById("rp-cost").textContent }));
  ok(Math.abs(end.vt - end.total) < 1e-6, `${harness}: the replay stopped before the end`);
  ok(end.rows > early.rows, `${harness}: the replay added no rows (${early.rows} to ${end.rows})`);
  const recon = await page.evaluate((sid) => {
    const s = sessionBy(sid), led = transcriptLedger(transcriptBy(sid));
    return { sum: led.reqs.reduce((t, q) => t + q.cost.total, 0), cost: s.cost.total, shown: money(s.cost.total) };
  }, id);
  ok(Math.abs(recon.sum - recon.cost) < 1e-9, `${harness}: the session cost ${recon.cost} is not the sum of its requests ${recon.sum}`);
  ok(end.cost === recon.shown, `${harness}: the rail shows ${end.cost} at the end, not ${recon.shown}`);
}

// The question: Claude Code's own permission prompt, answered from the page.
await open(page, `${BASE}/sessions/${FLAGSHIP}`, "&theme=dark");
ok(await page.$(".cc-perm"), "claude-code: the permission prompt is not on screen at rest");
ok(await page.$('[data-act="rp-approve"]'), "claude-code: there is no Approve beside the question");
await page.click('[data-act="rp-approve"]');
await page.waitForFunction(() => !RP.playing, null, { timeout: 30000 });
let t = await page.evaluate(() => ({ perm: !!document.querySelector(".cc-perm"), text: document.getElementById("rp-body").innerText, status: sessionBy("ses_01K5RS7M2E8FJ3QW").status, ny: needsYou().length }));
ok(!t.perm && /draft release is up/.test(t.text), "claude-code: approving did not finish the session in the transcript");
ok(t.status === "done" && t.ny === 0, "claude-code: approving left the session waiting");
await page.evaluate(() => go("work", null));
await page.click('[data-act="worktab"][data-tab="review"]');
ok(/Draft release v4\.11\.0/.test(await page.innerText("#app")), "work: the approved release did not move its work item to Review");

await open(page, `${BASE}/sessions/${FLAGSHIP}`, "&theme=dark");
await page.click('[data-act="rp-deny"]');
await page.waitForFunction(() => !RP.playing, null, { timeout: 30000 });
t = await page.evaluate(() => document.getElementById("rp-body").innerText);
ok(/No \(tell Claude what to do differently\)/.test(t) && /left the release uncreated/.test(t), "claude-code: denying did not reach the transcript");

// Sending a work item opens a session for it.
await open(page, `${BASE}/work`, "&theme=dark");
const before = await page.evaluate(() => sessions().length);
await page.click('tr [data-act="send"]');
await page.waitForSelector(".dlg");
await page.click('[data-act="send-agent"][data-agent="triage"]');
await page.click('[data-act="send-go"]');
await page.waitForFunction(() => S.area === "sessions" && S.id && S.id.indexOf("ses_01K5S") === 0, null, { timeout: 10000 });
t = await page.evaluate(() => ({ n: sessions().length, h1: document.querySelector("#app h1").innerText, running: workItems().filter((w) => w.state === "running").length }));
ok(t.n === before + 1, "send: no session was created");
ok(/Bump undici/.test(t.h1), `send: the session page shows "${t.h1}"`);
ok(t.running === 3, "send: the work item did not move to Running");

// Drawers and dialogs.
await open(page, `${BASE}/work`, "&theme=dark");
const OPENERS = [
  ["drawer workitem", "openDrawer('workitem', 'PLAT-231')", ".drawer"],
  ["drawer agent", "openDrawer('agent', 'triage')", ".drawer"],
  ["drawer steering item", "openDrawer('steeritem', 'instructions')", ".drawer"],
  ["drawer skill", "openDrawer('steeritem', 'release-notes-from-prs')", ".drawer"],
  ["drawer server", "openDrawer('server', 'github')", ".drawer"],
  ...["send", "newwork", "connect", "steerimport", "serverimport", "addserver", "newsteer", "account"].map((d) => [`dialog ${d}`, `openDialog('${d}')`, ".dlg"]),
  ["dialog steer", `openDialog('steer', '${FLAGSHIP}')`, ".dlg"],
];
for (const [name, js, sel] of OPENERS) {
  await page.evaluate(js);
  const has = await page.$(sel);
  ok(has, `${name}: did not open`);
  if (has) await copyCheck(page, name);
  await page.evaluate(() => closeDialog());
}
// The unused-tool fix-up on a server: turning them off leaves none unused.
await page.evaluate(() => openDrawer("server", "github"));
if (await page.$('[data-act="tools-off"]')) {
  await page.click('[data-act="tools-off"]');
  ok(await page.evaluate(() => serverStats("github").unused.length === 0), "server: Turn them off left tools unused");
} else ok(false, "server: GitHub shows no unused tools to turn off");
await page.evaluate(() => closeDialog());

// Money: every Spend grouping sums to the month, to the cent.
const money = await page.evaluate(() => {
  const total = monthTotal(), all = sessions().reduce((t, s) => t + s.cost.total, 0);
  return { total, all, groups: SPEND_BY.map((b) => [b.key, spendRows(b.key).reduce((t, r) => t + r.cost, 0)]) };
});
ok(Math.abs(money.total - money.all) < 1e-9, "spend: the month total is not the sum of its sessions");
for (const [k, sum] of money.groups) ok(Math.round(sum * 100) === Math.round(money.total * 100), `spend: grouping ${k} sums to ${sum}, not ${money.total}`);

// The first run: every view renders its empty state.
for (const [name, hash] of Object.entries(VIEWS)) {
  if (name.startsWith("session-")) continue;
  await open(page, hash, "&state=empty&theme=dark");
  const e = await page.evaluate(() => ({ state: !!document.querySelector(".state-wrap, .onb"), rows: document.querySelectorAll("tbody tr").length }));
  ok(e.state, `first run ${name}: no empty state`);
  await copyCheck(page, `first run ${name}`);
}

await browser.close();
for (const e of errors) { failures++; console.error("FAIL " + e); }
console.log(`${failures ? "FAIL" : "ok  "} v3: ${passes} checks passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
