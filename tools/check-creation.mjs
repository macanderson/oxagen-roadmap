#!/usr/bin/env node
// Walks every creation wizard in mockups/missioncontrol.html end to end in headless Chromium, then
// the two pages they end at, and asserts what each step must show. check-mockup.mjs opens pages;
// the wizards are dialogs, so nothing there ever reaches them.
//
//   node tools/check-creation.mjs           # every wizard, both editing pages, the entry points
//   node tools/check-creation.mjs --shots   # also write a screenshot per step to .claude/shots/
//
// Every assertion names a string the surface is supposed to render, never a value read back out of
// the field the bug would corrupt — a check that reads its expectation out of the thing under test
// can never fail. The three mutations this was written against, each of which it catches:
//   * collapse crecPanel's six kind branches into one  -> 12 fails
//   * put mcpMatch back on substring matching          -> the no-match path never reaches the manifest
//   * make the editor gutter empty                     -> 11 fails
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { launchChromium } from "./lib/playwright.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = "file://" + path.join(root, "mockups/missioncontrol.html");
const shots = process.argv.includes("--shots") ? path.join(root, ".claude/shots") : null;
if (shots) mkdirSync(shots, { recursive: true });

const browser = await launchChromium(root);
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log("FAIL " + m); } };

async function open(hash = "#/a-intel/core-platform") {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = [];
  page.on("pageerror", e => errs.push(String(e.message || e)));
  page.on("dialog", d => d.dismiss());
  await page.goto(FILE + "?product=1&state=loaded&mobile=0" + hash.replace("#", "#"));
  await page.waitForTimeout(300);
  return { page, errs };
}
const dlg = async page => await page.evaluate(() => {
  const d = document.querySelector("#layer .dlg");
  if (!d) return null;
  return {
    title: d.querySelector(".dlg-h h2")?.textContent || "",
    body: d.querySelector(".dlg-b")?.innerText.replace(/\s+/g, " ") || "",
    steps: [...d.querySelectorAll(".wz-st")].map(s => s.textContent.trim()),
    cur: d.querySelector(".wz-st.on")?.textContent.trim() || "",
    foot: [...d.querySelectorAll(".dlg-f button")].map(b => ({ t: b.textContent.trim(), dis: b.disabled })),
    ced: !!d.querySelector("#cedT"),
    gutter: (g => g ? (g.children.length || g.textContent.split("\n").filter(Boolean).length) : 0)(d.querySelector("#cedG")),
    hl: d.querySelectorAll("#cedH span").length,
  };
});
const primary = async page => await page.evaluate(() => {
  const bs = [...document.querySelectorAll("#layer .dlg-f button.primary")];
  const b = bs[bs.length - 1];
  if (!b || b.disabled) return false;
  b.click(); return true;
});
async function type(page, sel, text) {
  await page.fill(sel, text);
  await page.evaluate(([s, t]) => { const e = document.querySelector(s); e.value = t; e.dispatchEvent(new Event("input", { bubbles: true })); }, [sel, text]);
  if (sel === "#wzDesc") await wand(page);
}
/* oxagen.assistant rewrites the description in place, and the next step opens when it has. */
async function wand(page) {
  const pressed = await page.evaluate(() => { const b = document.getElementById("wzWandBtn"); if (!b) return false; b.click(); return true; });
  ok(pressed, "the describe step carries the wand");
  await page.waitForTimeout(120);
}
const shot = async (page, name) => { if (shots) await page.screenshot({ path: path.join(shots, name + ".png"), fullPage: true }); };

/* ---------------- tool: the import answer ---------------- */
{
  const { page, errs } = await open();
  await page.evaluate(() => wzOpen("tool"));
  let d = await dlg(page);
  ok(d && d.steps.length === 5, "tool: five steps, got " + (d && d.steps.length));
  ok(d && /Describe/.test(d.cur), "tool step 1 current");
  ok(d && d.foot.some(b => b.t === "Match it" && b.dis), "tool: Match it disabled with no description");
  await type(page, "#wzDesc", "I want to process Stripe refunds against a charge when support asks");
  await page.evaluate(() => { document.querySelector("#layer .dlg-f button.primary").click(); });
  await page.waitForTimeout(150);
  d = await dlg(page);
  ok(/Stripe/.test(d.body), "tool step 2 names Stripe");
  ok(/recommended/.test(d.body), "tool step 2 marks a recommendation");
  ok(/create_refund/.test(d.body), "tool step 2 names the matched tool");
  ok(/Build it/.test(d.body), "tool step 2 offers the custom path");
  await shot(page, "tool-2-recommendation");
  // take the import path
  await page.evaluate(() => { [...document.querySelectorAll("#layer .wz-opt")].find(b => /Import/.test(b.textContent)).click(); });
  await page.waitForTimeout(100);
  await primary(page);
  await page.waitForTimeout(150);
  d = await dlg(page);
  ok(/mcp\.stripe\.com/.test(d.body), "tool import step names the server url");
  ok(/moves money/.test(d.body), "tool import warns on a financial server");
  ok(d.foot.some(b => /Open the importer/.test(b.t)), "tool import hands off to the importer");
  await page.evaluate(() => { [...document.querySelectorAll("#layer .dlg-f button")].find(b => /Open the importer/.test(b.textContent)).click(); });
  await page.waitForTimeout(150);
  d = await dlg(page);
  ok(/Import tools from an MCP server/.test(d.title), "importer opened, got " + d.title);
  ok(errs.length === 0, "tool import path errors: " + errs.join(" | "));
  await page.close();
}

/* ---------------- tool: the build answer ---------------- */
{
  const { page, errs } = await open();
  await page.evaluate(() => wzOpen("tool"));
  await type(page, "#wzDesc", "retire a feature flag in our own admin api");
  await primary(page); await page.waitForTimeout(150);
  let d = await dlg(page);
  ok(/nothing matched|Nothing in the catalogue/i.test(d.body), "tool: no match recommends building");
  await primary(page); await page.waitForTimeout(200);
  d = await dlg(page);
  ok(d.ced, "tool manifest: the editor is mounted");
  ok(d.gutter > 10, "tool manifest: real gutter, got " + d.gutter + " lines");
  ok(d.hl > 20, "tool manifest: syntax highlighted, got " + d.hl + " spans");
  ok(/\[classification\]/.test(d.body), "tool manifest has a classification table");
  const chips = await page.evaluate(() => document.querySelector("#layer .wz-derived").innerText.replace(/\s+/g, " "));
  ok(!/does not parse/.test(chips), "tool manifest parses, chips: " + chips);
  await shot(page, "tool-3-manifest");
  // mutation: break the TOML and the chips must say so
  await page.evaluate(() => { const t = document.getElementById("cedT"); t.value = "name = \"x\"\n[classification\n"; t.dispatchEvent(new Event("input", { bubbles: true })); render(); });
  await page.waitForTimeout(120);
  const broken = await page.evaluate(() => document.querySelector("#layer .wz-derived").innerText);
  ok(/does not parse/.test(broken), "tool manifest: a broken file is reported, got " + broken);
  const nextDis = await page.evaluate(() => [...document.querySelectorAll("#layer .dlg-f button.primary")].pop().disabled);
  ok(nextDis === true, "tool manifest: Next is blocked while the file does not parse");
  // put it back
  await page.evaluate(() => { cedReseed("wz:tool:manifest", wzToolManifest()); render(); });
  await page.waitForTimeout(120);
  await primary(page); await page.waitForTimeout(200);
  d = await dlg(page);
  ok(/TypeScript/.test(d.body) && /Python/.test(d.body) && /Go/.test(d.body) && /Rust/.test(d.body), "tool code: four languages");
  ok(/JSON Schema/.test(d.body), "tool code: the input schema is shown");
  for (const L of ["Python", "Go", "Rust"]) {
    await page.evaluate(l => { [...document.querySelectorAll("#layer .wz-langs .tab")].find(b => b.textContent === l).click(); }, L);
    await page.waitForTimeout(90);
    const body = await page.evaluate(() => document.querySelector("#layer .sx-cfg pre").innerText);
    ok(body.length > 200, "tool code " + L + " renders, " + body.length + " chars");
    ok(/x-oxagen-grant/.test(body), "tool code " + L + " reads the grant off the call");
  }
  await shot(page, "tool-4-code");
  await primary(page); await page.waitForTimeout(150);
  d = await dlg(page);
  ok(/\.oxagen\/tools\//.test(d.body), "tool pr: names the manifest path");
  ok(/Secret and PII scan/.test(d.body), "tool pr: lists the checks");
  await shot(page, "tool-5-pr");
  await page.evaluate(() => { [...document.querySelectorAll("#layer .dlg-f button")].find(b => /Open the pull request/.test(b.textContent)).click(); });
  await page.waitForTimeout(200);
  const closed = await page.evaluate(() => !document.querySelector("#layer .dlg"));
  ok(closed, "tool pr: the wizard closes on open");
  const toast = await page.evaluate(() => document.getElementById("toast").innerText);
  ok(/opened/.test(toast), "tool pr: a receipt in the toast, got " + toast);
  ok(errs.length === 0, "tool build path errors: " + errs.join(" | "));
  await page.close();
}

/* ---------------- skill: registry, describe, upload ---------------- */
{
  const { page, errs } = await open();
  await page.evaluate(() => wzOpen("skill"));
  let d = await dlg(page);
  ok(d.steps.length === 4, "skill: four steps");
  ok(/Search the registry/.test(d.body) && /Describe it/.test(d.body) && /Upload a bundle/.test(d.body), "skill: three ways in");
  await page.evaluate(() => { [...document.querySelectorAll("#layer .wz-opt")].find(b => /Search the registry/.test(b.textContent)).click(); });
  await page.waitForTimeout(100);
  await primary(page); await page.waitForTimeout(150);
  d = await dlg(page);
  ok(/oxagen\./.test(d.body), "skill registry: rows render");
  await type(page, "#wzq", "refund");
  await page.waitForTimeout(150);
  const res = await page.evaluate(() => document.getElementById("wzres").innerText);
  ok(/refund-with-a-mandate/.test(res), "skill search narrows to the refund skill");
  ok(!/triage-a-flaky-test/.test(res), "skill search excludes what does not match");
  await shot(page, "skill-2-registry");
  await page.evaluate(() => { [...document.querySelectorAll("#wzres .btn")].find(b => /^Pin/.test(b.textContent)).click(); });
  await page.waitForTimeout(150);
  await primary(page); await page.waitForTimeout(200);
  d = await dlg(page);
  ok(d.ced && d.gutter > 4, "skill review: editor with a gutter, " + d.gutter + " lines");
  ok(/tok to load/.test(d.body), "skill review prices the load");
  await shot(page, "skill-3-review");
  await primary(page); await page.waitForTimeout(150);
  d = await dlg(page);
  ok(/skills\.toml/.test(d.body), "skill pr: pins in skills.toml");
  ok(errs.length === 0, "skill registry errors: " + errs.join(" | "));
  await page.close();
}
{
  const { page, errs } = await open();
  await page.evaluate(() => { wzOpen("skill"); S.wz.path = "upload"; S.wz.replaces = "a-intel.release-notes-from-prs"; wzGo(2); });
  await page.waitForTimeout(150);
  let d = await dlg(page);
  ok(/Upload a bundle/.test(d.title), "skill upload step, got " + d.title);
  await page.evaluate(() => { [...document.querySelectorAll("#layer .wz-drop .btn")].find(b => /sample/.test(b.textContent)).click(); });
  await page.waitForTimeout(200);
  d = await dlg(page);
  ok(/2\.1\.0/.test(d.body) && /2\.2\.0/.test(d.body), "skill upload: bumps the pinned version, body: " + d.body.slice(0, 260));
  ok(/sha256:/.test(d.body), "skill upload: shows a digest");
  await shot(page, "skill-2-upload");
  await primary(page); await page.waitForTimeout(200);
  await primary(page); await page.waitForTimeout(200);
  d = await dlg(page);
  ok(/2\.1\.0 → 2\.2\.0|version 2\.1\.0/.test(d.body), "skill upload pr: names the bump, body: " + d.body.slice(0, 300));
  ok(errs.length === 0, "skill upload errors: " + errs.join(" | "));
  await page.close();
}

/* ---------------- agent ---------------- */
{
  const { page, errs } = await open();
  await page.evaluate(() => wzOpen("agent"));
  await type(page, "#wzDesc", "watch the performance budget on every pull request and comment with the regression");
  await primary(page); await page.waitForTimeout(150);
  let d = await dlg(page);
  ok(/a-intel\.core\./.test(d.body), "agent identity: shows the derived key");
  await shot(page, "agent-2-identity");
  await primary(page); await page.waitForTimeout(200);
  d = await dlg(page);
  ok(d.ced && d.gutter > 15, "agent definition: editor, " + d.gutter + " lines");
  ok(/\[instructions\]/.test(d.body), "agent definition has instructions");
  await primary(page); await page.waitForTimeout(200);
  d = await dlg(page);
  ok(/Nothing on this belt parks|Nothing picked/.test(d.body), "agent belt: says what parks");
  await page.evaluate(() => { document.querySelectorAll("#layer .imp-tool input")[2].click(); });
  await page.waitForTimeout(200);
  d = await dlg(page);
  ok(/park/.test(d.body), "agent belt: picking a tool changes the parking line");
  await shot(page, "agent-4-belt");
  await primary(page); await page.waitForTimeout(200);
  d = await dlg(page);
  ok(/\.oxagen\/agents\//.test(d.body), "agent pr: names the definition file");
  ok(/Key uniqueness/.test(d.body), "agent pr: lists the checks");
  ok(errs.length === 0, "agent errors: " + errs.join(" | "));
  await page.close();
}

/* ---------------- context record ---------------- */
{
  const { page, errs } = await open();
  await page.evaluate(() => wzOpen("record"));
  await type(page, "#wzDesc", "do not re-read CHANGELOG.md more than once in a run");
  await primary(page); await page.waitForTimeout(150);
  let d = await dlg(page);
  ok(d.body.match(/rule/) && d.body.match(/constraint/) && d.body.match(/procedure/) && d.body.match(/fact/) && d.body.match(/memory/) && d.body.match(/preference/), "record: six kinds offered");
  const kinds = await page.evaluate(() => document.querySelectorAll("#layer .wz-kind").length);
  ok(kinds === 6, "record: six kind cards, got " + kinds);
  const hues = await page.evaluate(() => [...document.querySelectorAll("#layer .wz-kind")].map(e => getComputedStyle(e).borderLeftColor));
  ok(new Set(hues).size === 6, "record: each kind carries its own hue, got " + new Set(hues).size);
  await shot(page, "record-2-kinds");
  const nextDis = await page.evaluate(() => [...document.querySelectorAll("#layer .dlg-f button.primary")].pop().disabled);
  ok(nextDis === true, "record: cannot proceed without picking a kind");
  await page.evaluate(() => { [...document.querySelectorAll("#layer .wz-kind")].find(b => /constraint/.test(b.textContent)).click(); });
  await page.waitForTimeout(120);
  await primary(page); await page.waitForTimeout(200);
  d = await dlg(page);
  ok(d.ced, "record statement: the editor is mounted");
  ok(d.gutter >= 1, "record statement: gutter");
  ok(/Constraint effect/.test(d.body), "record statement: a constraint gets its effect field");
  ok(/forbid/.test(d.body), "record statement: forbid is offered");
  await shot(page, "record-3-statement");
  await primary(page); await page.waitForTimeout(150);
  d = await dlg(page);
  ok(/Lineage uniqueness/.test(d.body) && /record_hash/.test(d.body), "record checks: six named");
  await primary(page); await page.waitForTimeout(150);
  d = await dlg(page);
  ok(/\.oxagen\/rules\//.test(d.body), "record pr: names the file");
  ok(errs.length === 0, "record errors: " + errs.join(" | "));
  await page.close();
}

/* ---------------- the record page, per kind ---------------- */
// Each kind's panel carries a heading only that branch emits. Comparing the panel text to itself
// would pass while all six shared one treatment (the per-record numbers differ either way), so the
// assertion names the phrase and the kind separately.
const KINDS = {
  rule:       ["ctx.release.notes-format",      "Where it sits"],
  constraint: ["ctx.release.never-merge",       "Conflicts"],
  procedure:  ["ctx.platform.release-order",    "The steps, in order"],
  fact:       ["ctx.platform.changelog-once",   "The claim, and how it is checked"],
  memory:     ["ctx.platform.safari-e2e-flake", "When it happened"],
  preference: ["ctx.triage.short-labels",       "Soft, and recorded as soft"],
};
const seen = new Set();
for (const [kind, [id, signature]] of Object.entries(KINDS)) {
  const { page, errs } = await open("#/a-intel/core-platform/steering/records/" + id);
  const r = await page.evaluate(() => ({
    h1: document.querySelector("#pg h1")?.textContent || "",
    panel: document.querySelector(".crec-grid > div:last-child .panel .panel-b")?.innerText.replace(/\s+/g, " ") || "",
    ced: !!document.getElementById("cedT"),
    gutter: (g => g ? (g.children.length || g.textContent.split("\n").filter(Boolean).length) : 0)(document.getElementById("cedG")),
    hl: document.querySelectorAll("#cedH span").length,
    kt: getComputedStyle(document.querySelector(".crec-hl .kt")).color,
    steps: document.querySelectorAll(".crec-steps li").length,
    bound: document.querySelectorAll(".crec-bound").length,
    // prose wraps, so the gutter's rows are measured rather than a fixed height. Compare the two
    // independently: every number's top must sit on its own line's top.
    wraps: document.getElementById("ced")?.classList.contains("wrap") || false,
    noSideScroll: (() => { const e = document.querySelector("#ced .ed-scroll"); return e ? e.scrollWidth <= e.clientWidth + 1 : false; })(),
    align: (() => {
      const g = document.getElementById("cedG"), hl = document.getElementById("cedH");
      if (!g || !hl || !g.children.length) return null;
      const gb = g.getBoundingClientRect(), hb = hl.getBoundingClientRect();
      let worst = 0;
      for (let i = 0; i < g.children.length; i++) {
        const a = g.children[i].getBoundingClientRect().top - gb.top;
        const b = hl.children[i] ? hl.children[i].getBoundingClientRect().top - hb.top : a;
        worst = Math.max(worst, Math.abs(a - b));
      }
      return { rows: g.children.length, worst };
    })(),
  }));
  ok(r.h1.length > 20, kind + ": the statement is the headline, got " + r.h1.slice(0, 40));
  ok(r.ced && r.gutter >= 1, kind + ": statement editor with a gutter");
  ok(r.panel.length > 120, kind + ": a kind panel with content, " + r.panel.length + " chars");
  // .eyebrow uppercases, and innerText returns what is rendered, so the comparison is case-blind.
  const panel = r.panel.toLowerCase();
  const has = sig => panel.includes(sig.toLowerCase());
  ok(has(signature), kind + ': its own treatment \u2014 the panel must contain "' + signature + '"');
  for (const [other, pair] of Object.entries(KINDS))
    if (other !== kind) ok(!has(pair[1]), kind + ": must not borrow " + other + "'s treatment (" + pair[1] + ")");
  seen.add(signature);
  ok(has("can never do"), kind + ": says what the kind can never do");
  ok(r.wraps, kind + ": the statement editor wraps — prose that scrolls sideways cannot be read");
  ok(r.noSideScroll, kind + ": the statement editor has no horizontal scroll");
  ok(r.align && r.align.rows >= 1 && r.align.worst <= 1,
     kind + ": every gutter number sits on its own line, worst offset " + (r.align ? r.align.worst : "no gutter") + "px");
  if (kind === "procedure") ok(r.steps >= 3, "procedure: the statement is rendered as ordered steps, got " + r.steps);
  if (kind === "constraint") ok(r.bound === 1, "constraint: the boundary block is shown");
  if (kind !== "constraint") ok(r.bound === 0, kind + ": no boundary block");
  ok(errs.length === 0, kind + " page errors: " + errs.join(" | "));
  await shot(page, "record-page-" + kind);
  await page.close();
}
ok(seen.size === 6, "six kinds, six different treatments, got " + seen.size);

/* ---------------- editing: the record statement and a skill file ---------------- */
{
  const { page, errs } = await open("#/a-intel/core-platform/steering/records/ctx.release.notes-format");
  const before = await page.evaluate(() => document.querySelector("#pg .acts .btn.primary").textContent.trim());
  ok(/Propose a change/.test(before), "record page: the primary action is a proposal, got " + before);
  const disc = await page.evaluate(() => [...document.querySelectorAll("#pg .acts .btn")].find(b => /Discard/.test(b.textContent)).disabled);
  ok(disc === true, "record page: Discard is off until something changes");
  await page.evaluate(() => { const t = document.getElementById("cedT"); t.value = t.value + "\nAnd link the issue too."; t.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.waitForTimeout(150);
  const disc2 = await page.evaluate(() => [...document.querySelectorAll("#pg .acts .btn")].find(b => /Discard/.test(b.textContent)).disabled);
  ok(disc2 === false, "record page: Discard turns on when the file is modified");
  await page.evaluate(() => { document.querySelector("#pg .acts .btn.primary").click(); });
  await page.waitForTimeout(200);
  const d = await dlg(page);
  ok(/Propose a change to this record/.test(d.title), "record edit: the proposal dialog, got " + d.title);
  ok(/link the issue too/.test(d.body), "record edit: the diff shows the new line");
  await shot(page, "record-edit-diff");
  await page.evaluate(() => { [...document.querySelectorAll("#layer .dlg-f button")].find(b => /Open the pull request/.test(b.textContent)).click(); });
  await page.waitForTimeout(250);
  const badge = await page.evaluate(() => document.querySelector("#pg .phead")?.innerText || "");
  ok(/context\/ctx\.release\.notes-format\.amend/.test(badge), "record edit: the branch shows as pending, got " + badge.slice(0, 200));
  ok(errs.length === 0, "record edit errors: " + errs.join(" | "));
  await page.close();
}
{
  const { page, errs } = await open("#/a-intel/core-platform/steering/skills/a-intel.release-notes-from-prs/source");
  const r = await page.evaluate(() => ({
    h1: document.querySelector("#pg h1")?.textContent || "",
    tab: document.querySelector('#pg .tabs .tab[aria-selected="true"]')?.textContent || "",
    ced: !!document.getElementById("cedT"),
    gutter: (g => g ? (g.children.length || g.textContent.split("\n").filter(Boolean).length) : 0)(document.getElementById("cedG")),
    hl: document.querySelectorAll("#cedH span").length,
    txt: document.getElementById("cedT")?.value || "",
  }));
  ok(/SKILL\.md/.test(r.h1), "skill source: the path is the heading, got " + r.h1);
  ok(r.ced && r.gutter > 8, "skill source: editor with a gutter, " + r.gutter + " lines");
  ok(r.hl > 5, "skill source: markdown highlighted, " + r.hl + " spans");
  ok(!/<span/.test(r.txt), "skill source: the editor holds text, not markup");
  ok(/^---/.test(r.txt), "skill source: frontmatter survived, got " + r.txt.slice(0, 20));
  await shot(page, "skill-source");
  await page.evaluate(() => { const t = document.getElementById("cedT"); t.value = t.value + "\n6. Link the milestone.\n"; t.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.waitForTimeout(120);
  await page.evaluate(() => { document.querySelector("#pg .acts .btn.primary").click(); });
  await page.waitForTimeout(200);
  const d = await dlg(page);
  ok(/2\.1\.0/.test(d.body) && /2\.1\.1/.test(d.body), "skill edit: the version bumps, body: " + d.body.slice(0, 200));
  ok(errs.length === 0, "skill source errors: " + errs.join(" | "));
  await page.close();
}

/* ---------------- entry points ---------------- */
{
  const { page, errs } = await open();
  const cases = [
    ["#/a-intel/core-platform/tools", "New tool"],
    ["#/a-intel/core-platform/agents", "New agent"],
    ["#/a-intel/core-platform/steering/skills", "Add a skill"],
    ["#/a-intel/core-platform/steering", "Write a context record"],
  ];
  for (const [hash, label] of cases) {
    await page.evaluate(hh => { location.hash = hh; }, hash);
    await page.waitForTimeout(250);
    const found = await page.evaluate(l => [...document.querySelectorAll("#pg .acts .btn")].some(b => b.textContent.trim() === l), label);
    ok(found, "entry point: " + label + " on " + hash);
  }
  await page.evaluate(() => openDialog("create"));
  await page.waitForTimeout(150);
  const cards = await page.evaluate(() => document.querySelectorAll("#layer .wz-card").length);
  ok(cards === 5, "create chooser: five cards, got " + cards);
  await shot(page, "create-chooser");
  ok(errs.length === 0, "entry point errors: " + errs.join(" | "));
  await page.close();
}

/* ---------------- the wizards on a phone, and in the dark ---------------- */
for (const theme of ["light", "dark"]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs = [];
  page.on("pageerror", e => errs.push(String(e.message || e)));
  await page.goto(FILE + "?product=1&state=loaded&mobile=1&theme=" + theme + "#/a-intel/core-platform");
  await page.waitForTimeout(350);
  for (const kind of ["record", "tool", "skill", "agent"]) {
    await page.evaluate(k => { wzOpen(k); if (k === "record") { S.wz.desc = "one sentence"; wzGo(2); } }, kind);
    await page.waitForTimeout(200);
    const r = await page.evaluate(() => {
      const d = document.querySelector("#layer .dlg");
      const w = document.scrollingElement;
      const cards = [...document.querySelectorAll("#layer .wz-kind, #layer .wz-opt")];
      return {
        open: !!d,
        overflow: w.scrollWidth - w.clientWidth,
        rail: document.querySelectorAll("#layer .wz-st").length,
        // stacked, not side by side: every card starts at the same x
        stacked: cards.length < 2 || new Set(cards.map(c => Math.round(c.getBoundingClientRect().left))).size === 1,
        bg: getComputedStyle(document.body).backgroundColor,
      };
    });
    ok(r.open, theme + " phone " + kind + ": the wizard opens");
    ok(r.overflow <= 1, theme + " phone " + kind + ": no horizontal overflow, got " + r.overflow + "px");
    ok(r.rail >= 3, theme + " phone " + kind + ": the step rail survives, got " + r.rail);
    ok(r.stacked, theme + " phone " + kind + ": cards stack in one column");
    if (kind === "record") {
      // Dark means a near-black ground, whatever its exact value: every channel under 40.
      const dark = (r.bg.match(/\d+/g) || []).slice(0, 3).every((c) => Number(c) < 40);
      ok(theme === "dark" ? dark : !dark, theme + ": the theme is actually " + theme + ", body is " + r.bg);
    }
  }
  ok(errs.length === 0, theme + " phone errors: " + errs.join(" | "));
  await page.close();
}

// A policy version is created, edited and discarded from the Policy tab rather than a wizard, and
// the constraint is the point: a draft is the only version that edits or deletes, because an active
// or superseded one is cited by every decision it made.
{
  const { page, errs } = await open("#/a-intel/core-platform/tools/policy");
  const dtxt = () => page.evaluate(() => { const d = document.querySelector("#layer .dlg"); return d ? d.innerText : ""; });
  const rows = () => page.evaluate(() => [...document.querySelectorAll("table tbody tr")].map((r) => r.innerText).join("|"));

  ok(/Draft a version/.test(await page.evaluate(() => document.body.innerText)), "policy: the panel header drafts a version");
  ok(/Discard/.test(await rows()), "policy: the draft row carries Discard");

  await page.evaluate(() => openDialog("policynew"));
  await page.waitForTimeout(120);
  ok(/Draft a policy version/.test(await dtxt()), "policy: the create dialog opens");
  await page.evaluate(() => { document.getElementById("pn-note").value = ""; policyDraft(); });
  await page.waitForTimeout(120);
  ok(await page.evaluate(() => !!document.getElementById("pn-note")), "policy: a draft with no sentence is refused");
  await page.evaluate(() => { document.getElementById("pn-note").value = "Raises any egress call to approval"; policyDraft(); });
  await page.waitForTimeout(200);
  ok(/pol_v43/.test(await rows()), "policy: the new draft is listed");
  ok(/Raises any egress call to approval/.test(await rows()), "policy: its sentence is listed");
  ok(/not run yet/.test(await rows()), "policy: a fresh draft has no test run behind it");

  await page.evaluate(() => openDialog("policyedit", "pol_v43"));
  await page.waitForTimeout(120);
  ok(/Edit pol_v43/.test(await dtxt()), "policy: a draft edits");
  await page.evaluate(() => { document.getElementById("pe-note").value = "Raises any egress call, and any tainted write"; policySaveDraft("pol_v43"); });
  await page.waitForTimeout(200);
  ok(/any tainted write/.test(await rows()), "policy: the edit is saved");

  await page.evaluate(() => openDialog("policyedit", "pol_v41"));
  await page.waitForTimeout(120);
  ok(/cannot be edited/.test(await dtxt()), "policy: the active version refuses an edit");
  await page.evaluate(() => openDialog("policydiscard", "pol_v41"));
  await page.waitForTimeout(120);
  ok(/cannot be discarded/.test(await dtxt()), "policy: the active version refuses a discard");
  await page.evaluate(() => closeDialog());

  await page.evaluate(() => openDialog("policydiscard", "pol_v43"));
  await page.waitForTimeout(120);
  ok(/Discard pol_v43/.test(await dtxt()), "policy: the discard dialog opens");
  await page.evaluate(() => policyDiscard("pol_v43"));
  await page.waitForTimeout(200);
  const left = await rows();
  ok(!/pol_v43/.test(left), "policy: the draft row is gone");
  ok(/pol_v41/.test(left) && /pol_v42/.test(left), "policy: the other versions are untouched");
  ok(errs.length === 0, "policy: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

await browser.close();
console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
