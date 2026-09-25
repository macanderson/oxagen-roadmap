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
  ok(/Import tools from a provider/.test(d.title), "importer opened, got " + d.title);
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
  ok(/Nothing on this toolbelt parks|Nothing picked/.test(d.body), "agent belt: says what parks");
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
  ok(has("Limits."), kind + ": says what the kind cannot do, under Limits");
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
  const { page, errs } = await open("#/a-intel/core-platform/steering/sources/skill/a-intel.release-notes-from-prs");
  const r = await page.evaluate(() => ({
    h1: document.querySelector("#pg h1")?.textContent || "",
    bar: document.querySelector("#pg .ced")?.innerText || document.getElementById("pg").innerText,
    tab: document.querySelector('#pg .tabs .tab[aria-selected="true"]')?.textContent || "",
    ced: !!document.getElementById("cedT"),
    gutter: (g => g ? (g.children.length || g.textContent.split("\n").filter(Boolean).length) : 0)(document.getElementById("cedG")),
    hl: document.querySelectorAll("#cedH span").length,
    txt: document.getElementById("cedT")?.value || "",
  }));
  ok(/a-intel\.release-notes-from-prs/.test(r.h1), "skill source: the skill's id is the heading, got " + r.h1);
  ok(/\.oxagen\/skills\/release-notes-from-prs\/SKILL\.md/.test(r.bar), "skill source: the editor names the SKILL.md path");
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
    ["#/a-intel/core-platform/agents", "Write a new agent…"],
    ["#/a-intel/core-platform/steering?kind=skill", "New source"],
    ["#/a-intel/core-platform/steering", "New source"],
    ["#/a-intel/core-platform/steering", "Import Markdown"],
  ];
  for (const [hash, label] of cases) {
    await page.evaluate(hh => { location.hash = hh; }, hash);
    await page.waitForTimeout(250);
    const found = await page.evaluate(l => [...document.querySelectorAll("#pg .acts .btn")].some(b => b.textContent.trim() === l), label);
    ok(found, "entry point: " + label + " on " + hash);
  }
  await page.evaluate(() => openDialog("newsrc"));
  await page.waitForTimeout(150);
  const kinds = await page.evaluate(() => [...document.querySelectorAll("#layer .wz-card b")].map(b => b.textContent).join("|"));
  ok(/Steering record/.test(kinds) && /Skill/.test(kinds) && /Document/.test(kinds) && /Glossary term/.test(kinds), "new source: a card per authored kind, got " + kinds);
  await page.evaluate(() => { closeDialog(); openDialog("create"); });
  await page.waitForTimeout(150);
  const cards = await page.evaluate(() => document.querySelectorAll("#layer .wz-card").length);
  ok(cards === 6, "create chooser: six cards, got " + cards);
  await shot(page, "create-chooser");
  ok(errs.length === 0, "entry point errors: " + errs.join(" | "));
  await page.close();
}

/* ---------------- the Markdown import ----------------
   The sample directory holds five files and four things the importer must skip. stella's reading of
   it is fixed by the fixture: 24 candidates, three of them duplicates that start rejected, and one
   that joins an existing memory. Every expectation below is a string the fixture puts there. */
{
  const { page, errs } = await open("#/a-intel/core-platform/steering");
  const body = () => page.evaluate(() => document.querySelector("#layer .dlg-b")?.innerText.replace(/\s+/g, " ") || "");
  const card = (src) => page.evaluate((s) => {
    const c = [...document.querySelectorAll("#layer .imp-c")].find((x) => x.querySelector(".imp-src").textContent === s);
    return c ? { st: c.dataset.impSt, as: c.dataset.impAs, text: c.innerText.replace(/\s+/g, " "), force: !!c.querySelector('select[aria-label="Force"]'), mark: c.querySelector("mark")?.textContent || "" } : null;
  }, src);
  const press = (src, label) => page.evaluate(([s, l]) => {
    const c = [...document.querySelectorAll("#layer .imp-c")].find((x) => x.querySelector(".imp-src").textContent === s);
    [...c.querySelectorAll("button")].find((b) => b.textContent.trim() === l).click();
  }, [src, label]);
  const counts = () => page.evaluate(() => document.querySelector("#layer [data-imp-counts]")?.dataset.impCounts || "");

  await page.evaluate(() => wzOpen("import"));
  await page.waitForTimeout(150);
  let d = await dlg(page);
  ok(d.steps.length === 3 && /Files$/.test(d.steps[0]) && /Review$/.test(d.steps[1]) && /Publish$/.test(d.steps[2]), "import: three steps, got " + d.steps.join("|"));
  ok(d.foot.some((b) => b.t === "Parse with stella" && b.dis), "import: Parse is disabled until a file is listed");
  await page.evaluate(() => [...document.querySelectorAll("#layer .imp-drop button")].find((b) => /sample directory/.test(b.textContent)).click());
  await page.waitForTimeout(150);
  let t = await body();
  ok(await page.evaluate(() => document.querySelectorAll("#layer .imp-files tbody tr").length) === 5, "import: the sample lists five files");
  ok(/node_modules\//.test(t) && /\.git\//.test(t) && /not Markdown/.test(t) && /CHANGELOG\.md \(412 KB\)/.test(t) && /over the 200 KB limit/.test(t),
    "import: the skipped list names each path and why, body: " + t.slice(0, 300));
  ok(/stella reads 5 files, about \d+ tokens/.test(t) && /usage credits, billed to /.test(t), "import: the cost is stated before stella reads anything");
  await page.evaluate(() => document.querySelectorAll("#layer .imp-files tbody input[type=checkbox]")[4].click());
  await page.waitForTimeout(100);
  ok(/stella reads 4 files/.test(await body()), "import: unticking a file takes it out of the estimate");
  await page.evaluate(() => document.querySelectorAll("#layer .imp-files tbody input[type=checkbox]")[4].click());
  await page.waitForTimeout(100);
  await shot(page, "import-files");

  ok(await primary(page), "import: Parse with stella is enabled");
  await page.waitForTimeout(200);
  d = await dlg(page);
  ok(/Review$/.test(d.cur), "import: parsing lands on Review, got " + d.cur);
  const n = await page.evaluate(() => ({ all: document.querySelectorAll("#layer .imp-c").length, rej: document.querySelectorAll('#layer .imp-c[data-imp-st="reject"]').length }));
  ok(n.all === 24, "import: 24 candidates, got " + n.all);
  ok(n.rej === 3 && (await counts()) === "0/3/21", "import: the three duplicates start rejected, got " + n.rej + " and " + (await counts()));
  let c = await card("CLAUDE.md:L7");
  ok(c && c.mark === "Never" && /“never” reads as a constraint that forbids/.test(c.text), "import: an inference names the word it read, got " + (c && c.text.slice(0, 160)));
  c = await card("AGENTS.md:L7");
  ok(c && c.st === "reject" && /Repeats CLAUDE\.md:L7 \(100% word overlap\)/.test(c.text), "import: a repeat across files names the first one");
  c = await card("CLAUDE.md:L28");
  ok(c && c.st === "reject" && /Already published as/.test(c.text) && /82% word overlap/.test(c.text), "import: a published duplicate names the record");
  c = await card("apps/api/CLAUDE.md:L3");
  ok(c && c.as === "memory" && /Joins .* as a saying \(89% word overlap\)/.test(c.text) && /A memory caps at may/.test(c.text),
    "import: a line close to a memory joins it, and the cap is stated, got " + (c && c.text));
  c = await card("AGENTS.md:L14-17");
  ok(c && /numbered steps, so a procedure/.test(c.text), "import: a numbered list is one procedure");
  ok(!(await card("apps/api/CLAUDE.md:L8")) && !(await card("apps/api/CLAUDE.md:L9")), "import: a fenced block is skipped");
  ok(!(await card("README.md:L3")) && !!(await card("README.md:L9")), "import: prose without an instruction word is skipped");

  await press("CLAUDE.md:L32", "Memory");
  await page.waitForTimeout(100);
  c = await card("CLAUDE.md:L32");
  ok(c && c.as === "memory" && !c.force && /\binfo\b/.test(c.text), "import: a memory shows its force and offers no select, got " + (c && c.text));
  await page.evaluate(() => { document.querySelector("#layer .dlg-b").scrollTop = 900; });
  const y0 = await page.evaluate(() => document.querySelector("#layer .dlg-b").scrollTop);
  await press("docs/runbooks/release.md:L15", "Accept");
  await page.waitForTimeout(100);
  const y1 = await page.evaluate(() => document.querySelector("#layer .dlg-b").scrollTop);
  ok(y0 > 0 && Math.abs(y1 - y0) < 2, "import: a row decision keeps the scroll position, " + y0 + " then " + y1);
  await press("docs/runbooks/release.md:L15", "Accept");
  await page.waitForTimeout(100);
  ok((await card("docs/runbooks/release.md:L15")).st === "open", "import: pressing Accept again clears it");

  await page.selectOption("#impCandsAs", "memories");
  await page.waitForTimeout(100);
  ok(await page.evaluate(() => [...document.querySelectorAll("#layer .imp-c")].every((x) => x.dataset.impAs === "memory")), "import: the batch override sets every candidate");
  await page.selectOption("#impCandsAs", "");
  await page.waitForTimeout(100);
  ok((await card("CLAUDE.md:L7")).as === "record" && (await card("apps/api/CLAUDE.md:L3")).as === "memory",
    "import: each file's choice puts back the file's setting and keeps the fold");
  await press("CLAUDE.md:L32", "Memory");
  await page.waitForTimeout(100);

  await page.evaluate(() => [...document.querySelectorAll("#layer .imp-bar button")].find((b) => b.textContent.trim() === "Accept all").click());
  await page.waitForTimeout(100);
  ok((await counts()) === "21/3/0", "import: Accept all leaves the duplicates rejected, got " + (await counts()));
  await page.evaluate(() => [...document.querySelectorAll("#layer .imp-gh")].find((g) => /README\.md/.test(g.textContent)).querySelectorAll("button")[1].click());
  await page.waitForTimeout(100);
  ok((await counts()) === "20/4/0", "import: Reject file rejects that file's candidates, got " + (await counts()));
  await shot(page, "import-review");

  ok(await primary(page), "import: Review what publishes is enabled");
  await page.waitForTimeout(200);
  t = await body();
  d = await dlg(page);
  const prs = await page.evaluate(() => [...document.querySelectorAll("#layer [data-imp-pr]")].map((x) => x.dataset.impPr));
  ok(prs.join("|") === "CLAUDE.md|AGENTS.md|apps/api/CLAUDE.md|docs/runbooks/release.md", "import: one pull request per source file, got " + prs.join("|"));
  ok(/context\/import-docs-runbooks-release/.test(t) && /\.oxagen\/rules\/ctx\.core\./.test(t), "import: each branch and file is named");
  ok(/mem_01K5R0N2/.test(t) && /a saying from apps\/api\/CLAUDE\.md:L3/.test(t) && /mem\.import\./.test(t), "import: the memories list the fold and the new memory");
  ok(d.foot.some((b) => b.t === "Open 4 pull requests and write 2 memories"), "import: the button counts both, got " + d.foot.map((b) => b.t).join("|"));
  await shot(page, "import-publish");

  const before = await page.evaluate(() => ({ prs: RECPRS.length, mem: MEMORY.length }));
  ok(await primary(page), "import: publish is enabled");
  await page.waitForTimeout(250);
  const after = await page.evaluate(() => {
    const m = memById("mem_01K5R0N2");
    return { prs: RECPRS.length, mem: MEMORY.length, dlg: S.dlg, toast: S.toast, ev: AUDIT[0].ev, hash: location.hash,
      claude: (RECPRS.find((p) => p.src === "CLAUDE.md") || {}).records?.length, say: (m.sayings || []).some((x) => x.file === "apps/api/CLAUDE.md" && x.line === 3),
      prov: MEMORY[0].provenance, force: MEMORY[0].force };
  });
  ok(after.prs - before.prs === 4 && after.mem - before.mem === 1 && after.dlg === null, "import: 4 pull requests and 1 memory, got " + JSON.stringify(after));
  ok(after.claude === 8, "import: CLAUDE.md's pull request carries its 8 records, got " + after.claude);
  ok(after.say && /^CLAUDE\.md:L32 · import by /.test(after.prov) && after.force === "info", "import: the fold and the new memory keep file and line");
  ok(/^Opened 4 pull requests for 18 records\. Wrote 1 memory\. Added 1 saying to existing memories\./.test(after.toast), "import: the toast counts what happened, got " + after.toast);
  ok(after.ev === "steering_imported" && /\/steering\/proposals\/prs$/.test(after.hash), "import: it is audited and lands on the pull requests, got " + after.hash);

  await page.evaluate(() => openDialog("memory", "mem_01K5R0N2"));
  await page.waitForTimeout(150);
  ok(await page.evaluate(() => [...document.querySelectorAll("#layer [data-mem-src]")].some((x) => x.textContent === "apps/api/CLAUDE.md:L3")), "import: the memory shows the imported saying's source");
  await page.evaluate(() => { const m = MEMORY[0]; openDialog("memory", m.id); });
  await page.waitForTimeout(150);
  ok(/Not recalled yet/.test(await body()), "import: a new memory reads as not recalled yet");
  ok(errs.length === 0, "import: no JavaScript error: " + errs.join(" | "));
  await page.close();

  const ph = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pe = []; ph.on("pageerror", (e) => pe.push(String(e.message || e)));
  await ph.goto(FILE + "?product=1&state=loaded&mobile=1&theme=dark#/a-intel/core-platform/steering");
  await ph.waitForTimeout(300);
  await ph.evaluate(() => { wzOpen("import"); impSample(); impParse(); wzGo(2); });
  await ph.waitForTimeout(200);
  const r = await ph.evaluate(() => ({ over: document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth,
    dlgOver: (b => b.scrollWidth - b.clientWidth)(document.querySelector("#layer .dlg-b")),
    tap: Math.min(...[...document.querySelectorAll("#layer .imp-ctl .btn")].map((b) => b.getBoundingClientRect().height)) }));
  ok(r.over <= 1 && r.dlgOver <= 1, "import phone: no horizontal overflow, got " + r.over + " and " + r.dlgOver);
  ok(r.tap >= 43, "import phone: row buttons are tap targets, got " + r.tap + "px");
  await shot(ph, "import-phone-dark");
  ok(pe.length === 0, "import phone: no JavaScript error: " + pe.join(" | "));
  await ph.close();
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

  ok(/Draft new version/.test(await page.evaluate(() => document.body.innerText)), "policy: the panel header drafts a version");
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

// A kill switch is created over the three identities an incident names: an agent, the device it
// runs on, or everything one operator answers for. The switches that ship with the workspace are
// the ones that must not be removable, and a denying switch is cleared before it is removed.
{
  const { page, errs } = await open("#/a-intel/core-platform/tools/switches");
  const dtxt = () => page.evaluate(() => { const d = document.querySelector("#layer .dlg"); return d ? d.innerText : ""; });
  const pg = () => page.evaluate(() => document.body.innerText);

  ok(/Create a switch/.test(await pg()), "switches: the scoped section creates a switch");
  ok(/core-platform/.test(await pg()), "switches: the workspace-wide switch is there on day one");

  await page.evaluate(() => openDialog("switchnew"));
  await page.waitForTimeout(150);
  ok(/Create a kill switch/.test(await dtxt()), "switches: the create dialog opens");
  const scopes = await page.evaluate(() => [...document.querySelectorAll("#ks-kind option")].map((o) => o.value).join("|"));
  ok(/Agent/.test(scopes) && /Device/.test(scopes) && /Operator/.test(scopes), "switches: agent, device and operator are the scopes, got " + scopes);

  // A device switch names the host, and its blast radius counts the agents enrolled on it.
  await page.evaluate(() => { document.getElementById("ks-kind").value = "Device"; ksRefresh(); });
  await page.waitForTimeout(120);
  const devs = await page.evaluate(() => [...document.querySelectorAll("#ks-target option")].map((o) => o.value).join("|"));
  ok(/mbp-01/.test(devs), "switches: an enrolled host is offered, got " + devs);
  ok(/agent/.test(await dtxt()), "switches: the device blast radius counts agents");

  await page.evaluate(() => { document.getElementById("ks-target").value = "mbp-01"; ksRefresh(); document.getElementById("ks-why").value = "Held ready for an incident on this host"; ksCreate(); });
  await page.waitForTimeout(250);
  ok(/mbp-01/.test(await pg()), "switches: the new switch is on the page");
  ok(/calls allowed/.test(await pg()), "switches: a new switch is created off");

  // Nothing may cover the same target twice.
  await page.evaluate(() => openDialog("switchnew"));
  await page.waitForTimeout(120);
  await page.evaluate(() => { document.getElementById("ks-kind").value = "Device"; ksRefresh(); });
  await page.waitForTimeout(100);
  await page.evaluate(() => { document.getElementById("ks-target").value = "mbp-01"; ksCreate(); });
  await page.waitForTimeout(150);
  ok(await page.evaluate(() => !!document.getElementById("ks-target")), "switches: a second switch on the same target is refused");
  await page.evaluate(() => closeDialog());

  const made = await page.evaluate(() => (SWITCHES.filter((x) => x.made)[0] || {}).id);
  ok(!!made, "switches: the created switch is marked as one you made");

  await page.evaluate((id) => openDialog("switchedit", id), made);
  await page.waitForTimeout(120);
  ok(/Edit the switch/.test(await dtxt()), "switches: a switch you made edits");
  await page.evaluate((id) => { document.getElementById("ks-why").value = "Rotated to the CI host"; ksSave(id); }, made);
  await page.waitForTimeout(200);

  // The shipped switches refuse both.
  await page.evaluate(() => openDialog("switchedit", "ks_ws"));
  await page.waitForTimeout(120);
  ok(/cannot be edited/.test(await dtxt()), "switches: the workspace switch refuses an edit");
  await page.evaluate(() => openDialog("switchdel", "ks_ws"));
  await page.waitForTimeout(120);
  ok(/cannot be removed/.test(await dtxt()), "switches: the workspace switch refuses a removal");
  await page.evaluate(() => closeDialog());

  // Denying first: a removal that would silently allow traffic is refused.
  await page.evaluate((id) => { S.switches[id] = true; openDialog("switchdel", id); }, made);
  await page.waitForTimeout(120);
  ok(/Clear it before you remove it/.test(await dtxt()), "switches: a denying switch is cleared before it is removed");
  await page.evaluate((id) => { S.switches[id] = false; openDialog("switchdel", id); }, made);
  await page.waitForTimeout(120);
  ok(/Remove the switch/.test(await dtxt()), "switches: an allowing switch removes");
  await page.evaluate((id) => ksRemove(id), made);
  await page.waitForTimeout(250);
  const cards = await page.evaluate(() => [...document.querySelectorAll(".panel-h h3")].map((x) => x.textContent).join("|"));
  ok(!/mbp-01/.test(cards), "switches: the created switch card is gone, got " + cards);
  ok(/core-platform/.test(cards) && /[Ee]very irreversible tool/.test(cards), "switches: the shipped switches are untouched");
  ok(errs.length === 0, "switches: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

// A glossary term (an ontology note until the fleet operations wedge) is a file on the workspace
// repository, so writing, changing and retiring one each open a pull request and nothing on the page
// claims a merge it has not seen. Terms are a source kind on Steering › Sources.
{
  const { page, errs } = await open("#/a-intel/core-platform/steering?kind=glossary");
  const dtxt = () => page.evaluate(() => { const d = document.querySelector("#layer .dlg"); return d ? d.innerText : ""; });
  const terms = () => page.evaluate(() => [...document.querySelectorAll("table tbody tr .src-t")].map((x) => x.textContent).join("|"));
  const prs = () => page.evaluate(() => OXPRS.filter((x) => x.kind === "ontology").map((x) => x.files[0][0] + ":" + x.files[0][1]).join("|"));

  ok(/release train/.test(await terms()), "ontology: the shipped definitions are listed");
  await page.evaluate(() => openDialog("newsrc"));
  await page.waitForTimeout(150);
  ok(await page.evaluate(() => !!document.querySelector("#layer [onclick*=\"ontnew\"]")), "ontology: New source writes a new definition");
  await page.evaluate(() => closeDialog());
  ok(!(await page.evaluate(() => [...document.querySelectorAll(".panel-h h3")].map((x) => x.textContent).join("|"))).includes("Index"), "ontology: the Index roadmap panel is gone");

  // Opening a row reads the note; it offers both writes.
  await page.evaluate(() => openDialog("ontology", "ont.release-train"));
  await page.waitForTimeout(150);
  ok(/grants nothing/.test(await dtxt()), "ontology: the drill-down says the note grants nothing");
  ok(/Edit/.test(await dtxt()) && /Retire/.test(await dtxt()), "ontology: the drill-down edits and retires");

  // Writing one.
  await page.evaluate(() => openDialog("ontnew"));
  await page.waitForTimeout(150);
  ok(/Define a glossary term/.test(await dtxt()), "ontology: the create dialog opens");
  const kinds = await page.evaluate(() => [...document.querySelectorAll("#on-kind option")].map((o) => o.value).join("|"));
  ok(/term/.test(kinds) && /entity/.test(kinds) && /alias/.test(kinds) && /boundary/.test(kinds), "ontology: the four note kinds are offered, got " + kinds);

  await page.evaluate(() => ontCreate());
  await page.waitForTimeout(120);
  ok(/Name the term/.test(await page.evaluate(() => document.body.innerText)), "ontology: a note with no term is refused");

  // The wand rewrites what you wrote; it does not decide what the term means.
  await page.evaluate(() => { document.getElementById("on-term").value = "freeze window"; document.getElementById("on-body").value = "the hours before a cut when nothing lands"; ontWand("on"); });
  await page.waitForTimeout(120);
  const tightened = await page.evaluate(() => document.getElementById("on-body").value);
  ok(/^The hours/.test(tightened) && /grants nothing/.test(tightened), "ontology: the wand tightens the definition, got " + tightened);

  await page.evaluate(() => { document.getElementById("on-ent").value = "a-intel/platform"; ontCreate(); });
  await page.waitForTimeout(250);
  ok(/freeze window/.test(await terms()), "ontology: the new definition is in the table");
  ok(/add:\.oxagen\/ontology\/freeze-window\.toml/.test(await prs()), "ontology: writing one opens a pull request that adds the file, got " + (await prs()));
  const cost = await page.evaluate(() => (ONTOLOGY.filter((x) => x.term === "freeze window")[0] || {}).token_cost);
  ok(cost > 0, "ontology: the token cost is computed from the words, got " + cost);

  // Two notes may not define the same term.
  await page.evaluate(() => openDialog("ontnew"));
  await page.waitForTimeout(120);
  await page.evaluate(() => { document.getElementById("on-term").value = "freeze window"; document.getElementById("on-body").value = "Something else entirely."; ontCreate(); });
  await page.waitForTimeout(150);
  ok(await page.evaluate(() => !!document.getElementById("on-term")), "ontology: a second definition of the same term is refused");
  await page.evaluate(() => closeDialog());

  // Changing one.
  await page.evaluate(() => openDialog("ontedit", "ont.freeze-window"));
  await page.waitForTimeout(150);
  ok(/Edit freeze window/.test(await dtxt()), "ontology: a note edits");
  await page.evaluate(() => { document.getElementById("oe-term").value = "release freeze"; ontSave("ont.freeze-window"); });
  await page.waitForTimeout(250);
  ok(/release freeze/.test(await terms()), "ontology: the changed term is in the table");
  ok(/mod:\.oxagen\/ontology\/release-freeze\.toml/.test(await prs()), "ontology: changing one opens a pull request that modifies the file, got " + (await prs()));

  // Retiring one. The note keeps informing the model until the removal merges.
  await page.evaluate(() => openDialog("ontretire", "ont.freeze-window"));
  await page.waitForTimeout(150);
  ok(/removes/.test(await dtxt()), "ontology: retiring a note says it removes the file");
  await page.evaluate(() => ontRetire("ont.freeze-window"));
  await page.waitForTimeout(250);
  ok(/del:\.oxagen\/ontology\/release-freeze\.toml/.test(await prs()), "ontology: retiring one opens a pull request that removes the file, got " + (await prs()));
  ok(/release freeze/.test(await terms()), "ontology: a note being retired is still in the table");
  ok(await page.evaluate(() => [...document.querySelectorAll("table tbody tr")].some((r) => /release freeze/.test(r.innerText) && /retiring/.test(r.innerText))), "ontology: its row says it is being retired");

  // A second retirement, and an edit against one, both refuse.
  await page.evaluate(() => openDialog("ontedit", "ont.freeze-window"));
  await page.waitForTimeout(120);
  ok(/Close that pull request/.test(await dtxt()), "ontology: a note being retired refuses an edit");
  await page.evaluate(() => openDialog("ontretire", "ont.freeze-window"));
  await page.waitForTimeout(120);
  ok(/already being retired/.test(await dtxt()), "ontology: a note being retired refuses a second retirement");
  await page.evaluate(() => closeDialog());

  ok(errs.length === 0, "ontology: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

// What a run ran on prints above the fold, and where the record argues the model or the effort
// setting was the wrong size, the run says so in both directions. Effort prints a value only where
// Oxagen proxied the model call and could read the request body.
{
  const { page, errs } = await open("#/a-intel/core-platform/runs/run_01K5RN8F3J2GHY6T");
  const rig = () => page.evaluate(() => { const r = document.querySelector(".rig"); return r ? r.innerText : ""; });
  const panel = () => page.evaluate(() => {
    const h = [...document.querySelectorAll(".panel-h h3")].find((x) => x.textContent === "Model fit");
    return h ? h.closest(".panel").innerText : "";
  });
  const fitOf = (id, k) => page.evaluate(([i, key]) => runFit(RUNS.find((r) => r.id === i))[key].verdict, [id, k]);

  // The header strip. This run is gateway tier, so all three print.
  ok(/OpenAI Agents SDK/.test(await rig()), "run rig: the harness prints above the fold, got " + (await rig()));
  ok(/claude-opus-5/.test(await rig()), "run rig: the model prints above the fold");
  ok(/effort high/.test(await rig()), "run rig: the effort setting prints above the fold");
  ok(await page.evaluate(() => {
    const r = document.querySelector(".rig"), t = document.querySelector(".tabs");
    return !!r && (!t || r.getBoundingClientRect().top < t.getBoundingClientRect().bottom + 40);
  }), "run rig: the strip sits above the tab bar");

  // Both readings, and the change each asks for.
  ok(/Heavier model than needed/.test(await rig()), "run rig: an overkill model is badged in the header");
  ok(/More effort than needed/.test(await rig()), "run rig: an overkill effort setting is badged in the header");
  await page.evaluate(() => { S.tab.run = "cost"; render(); });
  await page.waitForTimeout(200);
  ok(/Generated estimate/.test(await panel()), "run fit: the panel says the reading is generated");
  ok(/Read from this run only/.test(await panel()), "run fit: the panel cites what it read");
  ok(/Move this agent to/.test(await panel()), "run fit: the model card offers the change");
  ok(/Set effort to/.test(await panel()), "run fit: the effort card offers the change");

  // The change is a pull request against the agent definition, never a write from this page.
  const before = await page.evaluate(() => OXPRS.length);
  await page.evaluate(() => openDialog("fitchange", "run_01K5RN8F3J2GHY6T:model"));
  await page.waitForTimeout(150);
  const fd = await page.evaluate(() => { const d = document.querySelector("#layer .dlg"); return d ? d.innerText : ""; });
  ok(/\.oxagen\/agents\//.test(fd), "run fit: the change is a pull request against the agent file, got " + fd.slice(0, 120));
  ok(/sealed/.test(fd) || /this run/.test(fd), "run fit: the dialog says the sealed run keeps the model it ran on");
  await page.evaluate(() => fitPr("run_01K5RN8F3J2GHY6T:model"));
  await page.waitForTimeout(150);
  ok((await page.evaluate(() => OXPRS.length)) === before + 1, "run fit: the change opens exactly one pull request");
  ok(await page.evaluate(() => /^mod$/.test(OXPRS[0].files[0][0]) && /\.oxagen\/agents\//.test(OXPRS[0].files[0][1])),
    "run fit: the pull request modifies the agent definition");

  // Both directions fire somewhere in the record, so neither branch is dead code.
  const verdicts = await page.evaluate(() => {
    const t = {};
    RUNS.forEach((r) => { const f = runFit(r); t["m:" + f.model.verdict] = 1; t["e:" + f.effort.verdict] = 1; });
    return Object.keys(t).sort().join("|");
  });
  ok(/m:over/.test(verdicts), "run fit: the model-overkill direction fires, got " + verdicts);
  ok(/m:under/.test(verdicts), "run fit: the model-undersized direction fires, got " + verdicts);
  ok(/e:over/.test(verdicts), "run fit: the effort-overkill direction fires, got " + verdicts);
  ok(/e:under/.test(verdicts), "run fit: the effort-undersized direction fires, got " + verdicts);

  // Effort is read out of the request body, so a harness-tier run says it was not captured and
  // never guesses a value.
  ok((await fitOf("run_01K5RM1A5Z9QWE4R", "effort")) === "unseen", "run fit: a harness-tier run captures no effort");
  ok(await page.evaluate(() => !runEffort(RUNS.find((r) => r.id === "run_01K5RM1A5Z9QWE4R")).v),
    "run fit: an uncaptured effort holds no value");
  await page.close();
  ok(errs.length === 0, "run fit: no JavaScript error: " + errs.join(" | "));
}

{
  const { page, errs } = await open("#/a-intel/core-platform/runs/run_01K5RM1A5Z9QWE4R");
  const rig = await page.evaluate(() => { const r = document.querySelector(".rig"); return r ? r.innerText : ""; });
  ok(/not captured/.test(rig), "run rig: a harness-tier run reads not captured, got " + rig);
  ok(!/effort (low|medium|high)/.test(rig), "run rig: a harness-tier run prints no effort value");
  await page.evaluate(() => { S.tab.run = "cost"; render(); });
  await page.waitForTimeout(200);
  const txt = await page.evaluate(() => {
    const h = [...document.querySelectorAll(".panel-h h3")].find((x) => x.textContent === "Model fit");
    return h ? h.closest(".panel").innerText : "";
  });
  ok(/did not capture the effort setting/.test(txt), "run fit: the panel says why the effort setting was not captured");
  ok(/gateway and contained tiers/.test(txt), "run fit: the panel names the tiers where effort is captured");
  ok(errs.length === 0, "run fit: no JavaScript error on a harness-tier run: " + errs.join(" | "));
  await page.close();
}

// A person reading a sealed run has to be able to walk to the work: the repository, the branch, the
// pull requests, and the directory on the machine the agent ran on, each one a link or a copy.
{
  const { page, errs } = await open("#/a-intel/core-platform/runs/run_01K5RQ4B9C7XTN2P");
  const where = () => page.evaluate(() => { const w = document.querySelector(".where"); return w ? w.innerText : ""; });
  const hrefs = () => page.evaluate(() => [...document.querySelectorAll(".where a")].map((a) => a.getAttribute("href")).join(" "));

  ok(/a-intel\/platform/.test(await where()), "run where: the repository prints, got " + (await where()));
  ok(/github\.com\/a-intel\/platform(\s|$)/.test(await hrefs()), "run where: the repository links out, got " + (await hrefs()));
  ok(/refs\/pull\/482\/head/.test(await where()), "run where: the branch prints");
  ok(/a-intel\/platform#482/.test(await where()), "run where: the pull request prints");
  ok(/\/pull\/482$/m.test((await hrefs()).split(" ").pop() || "") || /\/pull\/482\b/.test(await hrefs()),
    "run where: the pull request links out, got " + (await hrefs()));
  ok(/ci-runner-07:/.test(await where()), "run where: the machine prints");
  ok(/\/home\/runner\/work\/platform/.test(await where()), "run where: the checkout path prints");

  // A pull request head has no /tree address, so the branch chip links to the pull request instead.
  ok(!/\/tree\/refs\/pull/.test(await hrefs()), "run where: a pull request head is not linked as a branch");

  // The path is a copy target, and copying says so.
  await page.evaluate(() => copyPath("/tmp/x"));
  await page.waitForTimeout(120);
  ok(/Copied \/tmp\/x/.test(await page.evaluate(() => document.body.innerText)), "run where: the path copies");

  // The whole strip sits in the header, above the tab bar.
  ok(await page.evaluate(() => {
    const w = document.querySelector(".where"), t = document.querySelector(".tabs");
    return !!w && !!t && w.getBoundingClientRect().top < t.getBoundingClientRect().top;
  }), "run where: the strip sits above the tab bar");

  // Linked work reached no screen before this; the Issues tab is where it lives.
  await page.evaluate(() => { S.tab.run = "issues"; render(); });
  await page.waitForTimeout(250);
  const heads = await page.evaluate(() => [...document.querySelectorAll(".panel-h h3")].map((x) => x.textContent).join("|"));
  ok(/Pull requests and artifacts/.test(heads), "run where: the artifacts panel renders, got " + heads);
  ok(/Repositories/.test(heads), "run where: the repositories panel renders");
  ok((heads.match(/Issues/g) || []).length === 1, "run where: the issues list is not printed twice, got " + heads);
  ok(await page.evaluate(() => [...document.querySelectorAll(".lw-item a")].some((a) => /github\.com/.test(a.getAttribute("href")))),
    "run where: an artifact links to the forge");
  ok(errs.length === 0, "run where: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

// A run with no recorded checkout on its host says the path was worked out, and never presents it
// as a fact Oxagen holds.
{
  const { page, errs } = await open("#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW");
  const w = await page.evaluate(() => { const x = document.querySelector(".where"); return x ? x.innerText : ""; });
  ok(/derived/.test(w), "run where: an unrecorded checkout is marked derived, got " + w);
  ok(/mbell-mbp-16:/.test(w), "run where: the derived path names the host the agent ran on");
  ok(/no pull request/.test(w), "run where: a run that opened none says so");
  ok(errs.length === 0, "run where: no JavaScript error on a derived path: " + errs.join(" | "));
  await page.close();
}

// The Changes panel and the header strip read the same run, so they must name the same pull
// request. The panel used to print "none yet" on a run that pushed to a pull request head.
{
  const { page, errs } = await open("#/a-intel/core-platform/runs/run_01K5RQ4B9C7XTN2P");
  const panel = () => page.evaluate(() => {
    const hs = [...document.querySelectorAll(".panel")];
    const p = hs.find((x) => /Changes/.test(x.querySelector(".panel-h h3")?.textContent || ""));
    return p ? p.innerText : "";
  });
  const t = await panel();
  ok(t !== "", "run changes: the panel renders");
  ok(/a-intel\/platform#482/.test(t), "run changes: the pull request the run pushed to prints, got " + t);
  ok(!/none yet/.test(t), "run changes: a run with a pull request does not read none yet");
  ok(/Base\s*\n?\s*main/.test(t), "run changes: the base branch prints, got " + t);

  // The pull request is a link out, and the strip above agrees with it.
  ok(await page.evaluate(() => {
    const p = [...document.querySelectorAll(".panel")].find((x) => /Changes/.test(x.querySelector(".panel-h h3")?.textContent || ""));
    return !!p && [...p.querySelectorAll("a")].some((a) => /\/pull\/482/.test(a.getAttribute("href") || ""));
  }), "run changes: the pull request links out");

  // The strip carries the repository and the branch, so the panel no longer repeats them.
  const heads = await page.evaluate(() => [...document.querySelectorAll(".panel-h h3")].map((x) => x.textContent).join("|"));
  ok(!/^Repository$|\|Repository\|/.test(heads), "run changes: the old Repository panel is gone, got " + heads);
  ok(!/\bRepository\b/.test(t), "run changes: the panel does not repeat the repository row");
  ok(!/^Branch\b/m.test(t), "run changes: the panel does not repeat the branch row");
  ok(errs.length === 0, "run changes: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

// The policy page never answered where a version is kept or what reads it, and it named a policy
// language instead.
{
  const { page, errs } = await open("#/a-intel/core-platform/tools/policy");
  const txt = await page.evaluate(() => document.body.innerText);
  ok(!/Cedar/i.test(txt), "policy: the page names no policy language");
  ok(!/tools\.policy_versions/.test(txt), "policy: the page names no storage table");

  const heads = await page.evaluate(() => [...document.querySelectorAll(".panel-h h3")].map((x) => x.textContent).join("|"));
  ok(/Where a version lives/.test(heads), "policy: the storage panel renders, got " + heads);

  const where = await page.evaluate(() => {
    const p = [...document.querySelectorAll(".panel")].find((x) => /Where a version lives/.test(x.querySelector(".panel-h h3")?.textContent || ""));
    return p ? p.innerText : "";
  });
  for (const row of ["Store", "In regulated mode", "Compiled from", "Who reads it", "What it writes"]) {
    ok(new RegExp(row).test(where), "policy: the storage panel states " + row);
  }
  ok(/not a Steering record/.test(where), "policy: a version is distinguished from a Steering record");
  ok(/\.oxagen\/policy\//.test(where), "policy: regulated mode names the file");
  ok(/policy\.decision/.test(where), "policy: the frame it writes is named");

  // The rule sample is glossed in plain words before the source.
  ok(await page.evaluate(() => {
    const pre = [...document.querySelectorAll("pre")].find((x) => /forbid/.test(x.textContent));
    if (!pre) return false;
    const prev = pre.previousElementSibling;
    return !!prev && /denies a payment unless/.test(prev.textContent);
  }), "policy: the rule sample carries a plain sentence above it");

  // Opening a version says where it is kept.
  await page.evaluate(() => openDialog("policyver", POLICIES.filter((p) => p.state === "active")[0].v));
  await page.waitForTimeout(200);
  const dtext = await page.evaluate(() => { const d = document.querySelector("#layer .dlg"); return d ? d.innerText : ""; });
  ok(/Stored in/.test(dtext), "policy: the version dialog says where it is stored, got " + dtext.slice(0, 200));
  ok(!/Cedar/i.test(dtext), "policy: the version dialog names no policy language");
  ok(errs.length === 0, "policy: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

// The mandate page wired Change limits to the grant wizard, so editing opened a form that creates
// a second mandate, and Revoke was a toast that reported a write it never made. The mandate page is
// now Delegation on the agent's Permissions tab, and its old address lands there.
{
  const { page, errs } = await open("#/a-intel/finops/agents/invoice-bot/mandates/mnd_7K2ETQ4");
  ok(/permissions\?delegation=mnd_7K2ETQ4/.test(await page.evaluate(() => location.hash)), "mandate: the old address lands on Delegation");
  const acts = await page.evaluate(() =>
    [...document.querySelectorAll(".dlg-m .dlg-m-h button")].map((b) => b.getAttribute("onclick") + "|" + b.textContent.trim()));
  ok(acts.some((a) => /openDialog\('mandateedit','mnd_7K2ETQ4'\)\|Change limits/.test(a)),
    "mandate: Change limits opens the edit dialog on this mandate, got " + acts.join(" ~ "));
  ok(acts.some((a) => /openDialog\('mandaterevoke','mnd_7K2ETQ4'\)\|Revoke/.test(a)),
    "mandate: Revoke opens the revoke dialog on this mandate, got " + acts.join(" ~ "));
  ok(!acts.some((a) => /openDialog\('mandate'[,)]/.test(a)), "mandate: no header button opens the grant wizard");
  ok(!acts.some((a) => /\bact\(/.test(a)), "mandate: no header button is a toast stub, got " + acts.join(" ~ "));

  await page.evaluate(() => openDialog("mandateedit", "mnd_7K2ETQ4"));
  await page.waitForTimeout(250);
  const ed = await page.evaluate(() => { const d = document.querySelector("#layer .dlg"); return d ? d.innerText : ""; });
  ok(/Edit mnd_7K2ETQ4/.test(ed), "mandate: the edit dialog names this mandate, got " + ed.slice(0, 120));
  ok(/Auto-approve limit per call/.test(ed) && /Monthly limit/.test(ed), "mandate: the edit dialog carries the auto-approve limit and the period limit");
  ok(!/auto-approval/i.test(ed), "mandate: the edit hint does not defer to auto-approval rules, which are cut");

  await page.evaluate(() => { closeDialog(); openDialog("mandaterevoke", "mnd_7K2ETQ4"); });
  await page.waitForTimeout(250);
  const rv = await page.evaluate(() => { const d = document.querySelector("#layer .dlg"); return d ? d.innerText : ""; });
  ok(/Revoke mnd_7K2ETQ4/.test(rv), "mandate: the revoke dialog names this mandate, got " + rv.slice(0, 120));
  ok(/reserved/.test(rv) && /settled/.test(rv), "mandate: the revoke dialog says what is reserved and what settled");
  ok(/ledger is kept, never deleted/i.test(rv), "mandate: the revoke dialog keeps the ledger");
  ok(errs.length === 0, "mandate: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

// The connection drill uniquely holds the recent grants, the review date and what the broker mints.
// Cutting the standalone Connections tab left nothing that reached it.
{
  const { page, errs } = await open("#/a-intel/core-platform/tools/servers");
  const linked = await page.evaluate(() =>
    [...document.querySelectorAll(".grant-row")].map((r) => {
      const a = r.children[3].querySelector("a");
      return a ? a.getAttribute("onclick") || "" : "no link";
    }));
  ok(linked.length > 0 && linked.every((a) => /openDialog\('conn','con_/.test(a)),
    "grants log: every connection cell opens its drill, got " + linked.join(" ~ "));

  await page.evaluate(() => openDialog("conn", "con_01K2A9"));
  await page.waitForTimeout(250);
  const cd = await page.evaluate(() => { const d = document.querySelector("#layer .dlg"); return d ? d.innerText : ""; });
  ok(/con_01K2A9/.test(cd), "connection drill: it opens on the connection asked for, got " + cd.slice(0, 80));
  ok(/Downscope/.test(cd), "connection drill: the downscope prints");
  ok(/Recent grants/i.test(cd), "connection drill: the recent grants print");
  ok(/next 20\d\d-\d\d-\d\d/.test(cd), "connection drill: the next review date prints");
  const cacts = await page.evaluate(() => {
    const d = document.querySelector("#layer .dlg");
    return d ? [...d.querySelectorAll("button,a")].map((b) => b.getAttribute("onclick") || "").join(" ") : "";
  });
  ok(/connedit/.test(cacts), "connection drill: it reaches the editor, got " + cacts.slice(0, 200));
  ok(/connrevoke/.test(cacts), "connection drill: it reaches revoke, got " + cacts.slice(0, 200));

  // The server drill names its connection, so it must reach the drill too.
  await page.evaluate(() => { closeDialog(); openDialog("server", "jira"); });
  await page.waitForTimeout(250);
  const sv = await page.evaluate(() => {
    const d = document.querySelector("#layer .dlg");
    if (!d) return "nodialog";
    const a = [...d.querySelectorAll("a")].find((x) => /openDialog\('conn'/.test(x.getAttribute("onclick") || ""));
    return a ? a.getAttribute("onclick") : "none";
  });
  ok(/openDialog\('conn','con_/.test(sv), "server drill: the connection name opens its drill, got " + sv);
  ok(errs.length === 0, "connection drill: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

// The Data plane tab went out with a commit that named every other tab it cut and never named this
// one, while organization.md still lists it as backed today.
{
  const { page, errs } = await open("#/a-intel");
  const tabs = await page.evaluate(() =>
    [...document.querySelectorAll('[role="tab"]')].map((t) => t.textContent.replace(/\d+$/, "").trim()));
  ok(tabs.includes("Data plane"), "organization: the Data plane tab is present, got " + tabs.join(" ~ "));
  ok(tabs.includes("Cost centers"), "organization: the Cost centers tab is present, got " + tabs.join(" ~ "));
  ok(tabs.length === 8, "organization: eight tabs, got " + tabs.length + ": " + tabs.join(" ~ "));

  const sub = await page.evaluate(() => {
    const ps = [...document.querySelectorAll(".phead .t p")];
    return ps.length ? ps[ps.length - 1].textContent.trim() : "";
  });
  for (const word of ["People", "roles", "invitations", "workspaces", "API keys"]) {
    ok(sub.includes(word), "organization: the subtext names " + word + ", got " + sub);
  }

  // Task #24 cut the Model key and In-firewall routes panels and moved the key facts into
  // Funding source. The spec described the old shape for four commits.
  await page.evaluate(() => orgTab("funding"));
  await page.waitForTimeout(350);
  const fheads = await page.evaluate(() => [...document.querySelectorAll(".panel-h h3")].map((x) => x.textContent.trim()));
  ok(fheads.join(" ~ ") === "Funding source ~ Model routes",
    "funding: Funding source then Model routes, got " + fheads.join(" ~ "));
  const ftxt = await page.evaluate(() =>
    [...document.querySelectorAll(".panel")].map((x) => x.innerText).join("\n"));
  ok(/reported by harness|observed by gateway/i.test(ftxt), "funding: the Total row names its basis");
  ok(/Rotate/.test(ftxt) && /Revoke/.test(ftxt), "funding: the held key carries rotate and revoke");

  await page.evaluate(() => orgTab("plane"));
  await page.waitForTimeout(350);
  const heads = await page.evaluate(() => [...document.querySelectorAll(".panel-h h3")].map((x) => x.textContent.trim()));
  for (const head of ["Data plane", "Retention", "Tenant isolation"]) {
    ok(heads.includes(head), "data plane: the " + head + " panel renders, got " + heads.join(" ~ "));
  }
  const ptxt = await page.evaluate(() =>
    [...document.querySelectorAll(".panel")].map((x) => x.innerText).join("\n"));
  for (const word of ["Shared", "Dedicated", "Behind the firewall", "Request a change of plane", "Rotate keys"]) {
    ok(ptxt.includes(word), "data plane: " + word + " prints");
  }
  ok(!/In-firewall routes/.test(ptxt), "data plane: it does not point at the In-firewall routes panel, which is cut");
  ok(!/—/.test(ptxt), "data plane: no em dash on the tab");

  await page.evaluate(() => openDialog("plane"));
  await page.waitForTimeout(250);
  const pd = await page.evaluate(() => { const d = document.querySelector("#layer .dlg"); return d ? d.innerText : ""; });
  ok(/Request a change of data plane/.test(pd), "data plane: the dialog opens, got " + pd.slice(0, 120));
  ok(!/—/.test(pd), "data plane: no em dash in the dialog");
  ok(errs.length === 0, "data plane: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

// The Edit identity dialog (formerly Change identity) listed the roles as plain badges and told you to go edit them on the
// panel behind it. A drill-down that cannot write is a dead end.
{
  const { page, errs } = await open("#/a-intel/core-platform/agents/summarizer");
  const key = await page.evaluate(() => AGENTS[0].key);
  await page.evaluate((k) => openDialog("identity", k), key);
  await page.waitForTimeout(300);
  const chips = await page.evaluate(() => document.querySelectorAll("#layer .dlg .rl-chip button").length);
  ok(chips > 0, "identity: each role chip carries its own remove, got " + chips);
  const btns = await page.evaluate(() =>
    [...document.querySelectorAll("#layer .dlg button")].map((b) => b.textContent.trim()));
  ok(btns.includes("Assign role"), "identity: the dialog assigns a role, got " + btns.join(" ~ "));
  const txt = await page.evaluate(() => document.querySelector("#layer .dlg").innerText);
  ok(!/from the Identity panel/.test(txt), "identity: the dialog does not send you to another panel to edit");
  ok(errs.length === 0, "identity: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

// Steering › Gates is gone: a gate notice is a policy source on Sources, and each row links to where
// its gate is edited. No link carries a mid-dot or points at the cut Mandates ledger.
{
  const { page, errs } = await open("#/a-intel/core-platform/steering?kind=policy");
  const homes = await page.evaluate(() =>
    [...document.querySelectorAll("table tbody tr td:last-child a")].map((a) => a.textContent.trim() + "|" + a.getAttribute("href")));
  ok(homes.length > 0, "gates: each gate notice links to where its gate is edited");
  ok(!homes.some((l) => /·/.test(l.split("|")[0])), "gates: no link carries a mid-dot, got " + homes.join(" ~ "));
  ok(!homes.some((l) => /Mandates/.test(l)), "gates: no link points at the cut Mandates ledger, got " + homes.join(" ~ "));
  for (const [label, href] of [["Tools › Policy", /tools\/policy$/], ["Tools › Kill switches", /tools\/switches$/], ["Steering record", /sources\/record\//]]) {
    ok(homes.some((l) => l.startsWith(label + "|") && href.test(l.split("|")[1])), "gates: " + label + " is linked, got " + homes.join(" ~ "));
  }
  ok(errs.length === 0, "gates: no JavaScript error: " + errs.join(" | "));
  await page.close();
}


// A skill could be written and edited and never retired. One written here is a file; one installed
// is a line in workspace.toml. Both are a pull request, and the drill-down offers it either way.
{
  const { page, errs } = await open("#/a-intel/core-platform/steering?kind=skill");
  const foot = async (kind, arg) => {
    await page.evaluate(([k, a]) => { closeDialog(); openDialog(k, a); }, [kind, arg]);
    await page.waitForTimeout(220);
    return await page.evaluate(() =>
      [...document.querySelectorAll("#layer .dlg .dlg-f button")].map((b) => b.textContent.trim()));
  };
  const inTree = await foot("skill", "a-intel.release-notes-from-prs");
  ok(inTree.includes("Retire"), "skills: a file-backed skill offers Retire, got " + inTree.join(" ~ "));
  ok(inTree.indexOf("Close") < inTree.indexOf("Retire"),
    "skills: Close comes before Retire, as in every other drill-down, got " + inTree.join(" ~ "));
  ok(inTree.filter((b) => /^(Edit the file|Send the digest for approval)$/.test(b)).length === 1,
    "skills: the footer keeps exactly one primary, got " + inTree.join(" ~ "));
  const installed = await foot("skill", "oxagen.pdf-extract");
  ok(installed.includes("Retire"), "skills: an installed skill offers Retire too, got " + installed.join(" ~ "));

  await page.evaluate(() => { closeDialog(); openDialog("skretire", "a-intel.release-notes-from-prs"); });
  await page.waitForTimeout(220);
  const rt = await page.evaluate(() => document.querySelector("#layer .dlg").innerText);
  ok(/\.oxagen\/skills\/release-notes-from-prs\/SKILL\.md/.test(rt),
    "skills: the confirm names the file the pull request removes, got " + rt.slice(0, 160));
  ok(/digest/.test(rt), "skills: the confirm says the runs that cited it keep their digest");
  await page.evaluate(() => { closeDialog(); openDialog("skretire", "oxagen.pdf-extract"); });
  await page.waitForTimeout(220);
  const it = await page.evaluate(() => document.querySelector("#layer .dlg").innerText);
  ok(/workspace\.toml/.test(it), "skills: retiring an installed skill edits workspace.toml, got " + it.slice(0, 160));
  ok(!/SKILL\.md/.test(it), "skills: an installed skill has no SKILL.md in this tree to remove");

  const before = await page.evaluate(() => OXPRS.length);
  const pr = await page.evaluate(() => {
    closeDialog(); skRetire("a-intel.release-notes-from-prs");
    return { n: OXPRS.length, kind: OXPRS[0].kind, op: OXPRS[0].files[0][0], file: OXPRS[0].files[0][1] };
  });
  await page.waitForTimeout(300);
  ok(pr.n === before + 1, "skills: retiring opens one pull request, got " + before + " -> " + pr.n);
  ok(pr.kind === "skill" && pr.op === "del", "skills: it is a skill pull request that deletes, got " + pr.kind + "/" + pr.op);
  ok(/SKILL\.md$/.test(pr.file), "skills: it removes the SKILL.md, got " + pr.file);
  const rows = await page.evaluate(() => document.body.innerText.toLowerCase());
  ok(/retiring/.test(rows), "skills: the row says it is being retired while the pull request is open");
  await page.evaluate(() => { closeDialog(); openDialog("skretire", "a-intel.release-notes-from-prs"); });
  await page.waitForTimeout(220);
  const again = await page.evaluate(() => document.querySelector(".dlg-h h2").textContent);
  ok(/already being retired/.test(again), "skills: a second retire does not open a second pull request, got " + again);
  ok(errs.length === 0, "skills: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

// A repository could be seen and never unlinked, and one sitting there available could never be
// linked. Main is neither: moving main is an owner action and this dialog never offers it.
{
  const { page, errs } = await open("#/a-intel/core-platform/repositories");
  const foot = async (n) => {
    await page.evaluate((x) => { closeDialog(); openDialog("repo", x); }, n);
    await page.waitForTimeout(220);
    return await page.evaluate(() =>
      [...document.querySelectorAll("#layer .dlg .dlg-f button")].map((b) => b.textContent.trim()));
  };
  const main = await foot("a-intel/platform");
  ok(!main.includes("Unlink"), "repositories: the main repo cannot be unlinked here, got " + main.join(" ~ "));
  const linked = await foot("a-intel/billing");
  ok(linked.includes("Unlink"), "repositories: a linked repo offers Unlink, got " + linked.join(" ~ "));
  const avail = await foot("a-intel/ledger-service");
  ok(avail.includes("Link to this workspace"), "repositories: an available repo offers Link, got " + avail.join(" ~ "));
  ok(!avail.includes("Unlink"), "repositories: an unlinked repo has nothing to unlink, got " + avail.join(" ~ "));
  ok(avail.filter((b) => b === "Link to this workspace" || b === "Add .oxagen/").length === 2,
    "repositories: Link and Add .oxagen/ are both offered, got " + avail.join(" ~ "));
  const primaries = await page.evaluate(() =>
    document.querySelectorAll("#layer .dlg .dlg-f button.primary").length);
  ok(primaries === 1, "repositories: the footer carries one primary, got " + primaries);

  await page.evaluate(() => { closeDialog(); openDialog("repounlink", "a-intel/billing"); });
  await page.waitForTimeout(220);
  const ut = await page.evaluate(() => document.querySelector("#layer .dlg").innerText);
  ok(/nothing is deleted/i.test(ut), "repositories: the confirm says the repository is untouched, got " + ut.slice(0, 160));
  const trip = await page.evaluate(() => {
    closeDialog(); repoUnlink("a-intel/billing");
    const off = { linked: ws().linked.indexOf("a-intel/billing") >= 0, role: repoByName("a-intel/billing").role };
    repoLink("a-intel/billing");
    return { off, on: { linked: ws().linked.indexOf("a-intel/billing") >= 0, role: repoByName("a-intel/billing").role } };
  });
  await page.waitForTimeout(300);
  ok(trip.off.linked === false && trip.off.role === "available",
    "repositories: unlinking drops it from the workspace and leaves it available, got " + JSON.stringify(trip.off));
  ok(trip.on.linked === true && trip.on.role === "linked",
    "repositories: linking it back is the same round trip, got " + JSON.stringify(trip.on));
  ok(errs.length === 0, "repositories: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

// A working copy could be connected and never disconnected. The link is one gitignored file on a
// laptop, so this is not a pull request and the confirm has to say so.
{
  const { page, errs } = await open("#/a-intel/core-platform/repositories/working-copies");
  const cid = await page.evaluate(() => wsCopies()[0].id);
  await page.evaluate((i) => { closeDialog(); openDialog("workcopy", i); }, cid);
  await page.waitForTimeout(220);
  const foot = await page.evaluate(() =>
    [...document.querySelectorAll("#layer .dlg .dlg-f button")].map((b) => b.textContent.trim()));
  ok(foot.includes("Disconnect"), "copies: the drill-down disconnects the copy, got " + foot.join(" ~ "));
  await page.evaluate((i) => { closeDialog(); openDialog("copyoff", i); }, cid);
  await page.waitForTimeout(220);
  const ct = await page.evaluate(() => document.querySelector("#layer .dlg").innerText);
  ok(/workspace\.json/.test(ct), "copies: the confirm names the gitignored link file, got " + ct.slice(0, 160));
  ok(/nothing on disk is deleted/i.test(ct), "copies: the confirm says the directory is left alone");
  ok(/oxagen init/.test(ct), "copies: the confirm says how to link it back");
  ok(!/pull request/i.test(ct), "copies: disconnecting is not a pull request, got " + ct.slice(0, 200));
  const n = await page.evaluate((i) => {
    const before = WORKCOPIES.length; closeDialog(); copyDisconnect(i);
    return { before, after: WORKCOPIES.length };
  }, cid);
  await page.waitForTimeout(300);
  ok(n.after === n.before - 1, "copies: disconnecting removes the row, got " + n.before + " -> " + n.after);
  const left = await page.evaluate(() => [...document.querySelectorAll("table tbody tr")].length);
  ok(left >= 0, "copies: the table renders after the row goes, got " + left + " rows");
  ok(errs.length === 0, "copies: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

// The archived status was rendered in three places and produced by nothing, so a record could be
// published and amended but never taken out of force.
{
  const { page, errs } = await open("#/a-intel/core-platform/steering/records");
  const rid = await page.evaluate(() => RECORDS.filter((r) => r.status === "published")[0].id);
  await page.goto(FILE + "?product=1&state=loaded&mobile=0#/a-intel/core-platform/steering/records/" + encodeURIComponent(rid));
  await page.waitForTimeout(400);
  const acts = await page.evaluate(() =>
    [...document.querySelectorAll(".phead .acts button")].map((b) => b.textContent.trim()));
  ok(acts.includes("Archive"), "records: the record page archives the record, got " + acts.join(" ~ "));
  ok(acts.includes("Propose a change"), "records: it still proposes a change, got " + acts.join(" ~ "));

  await page.evaluate((i) => { closeDialog(); openDialog("crecarchive", i); }, rid);
  await page.waitForTimeout(220);
  const at = await page.evaluate(() => document.querySelector("#layer .dlg").innerText);
  ok(/status = "archived"/.test(at), "records: the confirm names the field it sets, got " + at.slice(0, 200));
  ok(/in force until/i.test(at), "records: the confirm says it steers runs until the merge");
  ok(/nothing is deleted/i.test(at), "records: the confirm says the file and the lineage stay");

  const pr = await page.evaluate((i) => {
    const before = OXPRS.length; closeDialog(); crecArchive(i);
    return { before, after: OXPRS.length, kind: OXPRS[0].kind, file: OXPRS[0].files[0][1],
      note: OXPRS[0].files[0][2], pend: S.recPending[i] ? S.recPending[i].branch : null };
  }, rid);
  await page.waitForTimeout(400);
  ok(pr.after === pr.before + 1, "records: archiving opens one pull request, got " + pr.before + " -> " + pr.after);
  ok(pr.kind === "record", "records: it is a context record pull request, got " + pr.kind);
  ok(/^\.oxagen\/rules\//.test(pr.file), "records: it edits the record file, got " + pr.file);
  ok(/archived/.test(pr.note), "records: the change is the status, got " + pr.note);
  ok(/\.archive$/.test(pr.pend || ""), "records: the page shows the branch while it is open, got " + pr.pend);

  await page.evaluate((i) => { closeDialog(); openDialog("crecarchive", i); }, rid);
  await page.waitForTimeout(220);
  const twice = await page.evaluate(() => document.querySelector(".dlg-h h2").textContent);
  ok(/already has a pull request open/.test(twice),
    "records: two changes are never proposed over the same file, got " + twice);

  const arch = await page.evaluate(() => {
    const r = RECORDS.filter((x) => x.status === "archived")[0];
    return r ? r.id : null;
  });
  if (arch) {
    await page.evaluate((i) => { closeDialog(); openDialog("crecarchive", i); }, arch);
    await page.waitForTimeout(220);
    const done = await page.evaluate(() => document.querySelector(".dlg-h h2").textContent);
    ok(/is already archived/.test(done), "records: an archived record is not archived twice, got " + done);
  }
  ok(errs.length === 0, "records: no JavaScript error: " + errs.join(" | "));
  await page.close();
}


// The memory tab told you to promote a memory and no row offered it, and nothing forgot one:
// a fact an agent got wrong kept being recalled with no way to stop it.
{
  const { page, errs } = await open("#/a-intel/core-platform/steering?kind=memory");
  const clickable = await page.evaluate(() => document.querySelectorAll("table tbody tr.click").length);
  const total = await page.evaluate(() => stgMemory("core-platform").length);
  ok(clickable === total, "memory: every row opens its item, got " + clickable + " of " + total);
  const mid = await page.evaluate(() => MEMORY[0].id);
  await page.evaluate((i) => { closeDialog(); openDialog("memory", i); }, mid);
  await page.waitForTimeout(250);
  const foot = await page.evaluate(() =>
    [...document.querySelectorAll("#layer .dlg .dlg-f button")].map((b) => b.textContent.trim()));
  for (const b of ["Close", "Forget", "Promote to a record"]) {
    ok(foot.includes(b), "memory: the drill-down offers " + b + ", got " + foot.join(" ~ "));
  }
  const mt = await page.evaluate(() => document.querySelector("#layer .dlg").innerText);
  ok(/Where it came from/.test(mt), "memory: the drill-down names the run that left it, got " + mt.slice(0, 160));
  ok(/times in 30 days/.test(mt), "memory: it says how often the memory is recalled");
  ok(/tokens every time it is selected/.test(mt), "memory: it says what a recall costs");
  ok(/published record/i.test(mt), "memory: it says where the memory sits against a published record");

  await page.evaluate((i) => { closeDialog(); openDialog("memforget", i); }, mid);
  await page.waitForTimeout(250);
  const ft = await page.evaluate(() => document.querySelector("#layer .dlg").innerText);
  ok(/every frame stays/.test(ft), "memory: forgetting leaves the runs alone, got " + ft.slice(0, 200));
  ok(/Promote is the other answer/.test(ft), "memory: the confirm offers the other answer");
  const n = await page.evaluate((i) => {
    const before = MEMORY.length; closeDialog(); memForget(i);
    return { before, after: MEMORY.length, rows: document.querySelectorAll("table tbody tr.click").length };
  }, mid);
  await page.waitForTimeout(300);
  ok(n.after === n.before - 1, "memory: forgetting drops the memory, got " + n.before + " -> " + n.after);
  ok(n.rows === n.after, "memory: the table re-renders without it, got " + n.rows + " rows for " + n.after);

  const mid2 = await page.evaluate(() => MEMORY[0].id);
  const body = await page.evaluate((i) => memById(i).body, mid2);
  await page.evaluate((i) => { closeDialog(); memPromote(i); }, mid2);
  await page.waitForTimeout(350);
  const title = await page.evaluate(() => document.querySelector(".dlg-h h2").textContent);
  ok(/Steering record/i.test(title), "memory: promoting opens the record wizard, got " + title);
  const wz = await page.evaluate(() => S.wz && { kind: S.wz.kind, from: S.wz.fromMemory, desc: S.wz.desc });
  ok(wz && wz.kind === "record" && wz.from === mid2,
    "memory: the wizard knows which memory it came from, got " + JSON.stringify(wz && { k: wz.kind, f: wz.from }));
  ok(wz && wz.desc === body, "memory: the wizard is seeded with the memory, not left empty");
  const fields = await page.evaluate(() =>
    [...document.querySelectorAll("#layer .dlg textarea, #layer .dlg input")].map((x) => x.value).join(" ~ "));
  ok(fields.includes(body), "memory: the seeded text reaches the field, got " + fields.slice(0, 160));
  ok(errs.length === 0, "memory: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

// Memories fold by concept. A memory keeps every saying that said the same thing, its dialog lists
// them, and a memory that reached the workspace setting opens the proposal those sayings support.
// The Memory shelf with its fold tile and setting left with the fleet operations wedge.
{
  const { page, errs } = await open("#/a-intel/core-platform/steering");
  const f = await page.evaluate(() => {
    const L = stgMemory("core-platform");
    return { n: L.length, sum: L.reduce((n, m) => n + (m.sayings || []).length, 0), want: L.filter(m => m.proposedAs).length,
      ready: L.filter(m => memFoldOf(m).st === "ready").length, proposed: L.filter(m => memFoldOf(m).st === "proposed").length };
  });
  ok(f.sum > f.n, "fold: memories hold more sayings than there are memories, got " + f.sum + " for " + f.n);
  ok(f.proposed === f.want && f.want > 0, "fold: a proposed memory reads proposed, got " + f.proposed + " of " + f.want);
  await page.evaluate(() => { S.memFold.sayings = 3; openDialog("memory", "mem_01K5R0N2"); });
  await page.waitForTimeout(250);
  const d = await page.evaluate(() => ({
    says: +document.querySelector("#layer [data-mem-says]")?.dataset.memSays,
    text: document.querySelector("#layer .dlg").innerText,
    foot: [...document.querySelectorAll("#layer .dlg .dlg-f button")].map(b => b.textContent.trim()) }));
  ok(d.says === 3, "fold: the memory lists its three sayings, got " + d.says);
  ok(/Remember to not use the latest version of node/.test(d.text) && /Use Node version 20/.test(d.text),
    "fold: both sayings keep their own words");
  ok(d.foot.includes("Open the proposal") && !d.foot.includes("Promote to a record"),
    "fold: a proposed memory opens its proposal instead of a second one, got " + d.foot.join(" ~ "));
  await page.evaluate(() => [...document.querySelectorAll("#layer .dlg .dlg-f button")].find(b => /Open the proposal/.test(b.textContent)).click());
  await page.waitForTimeout(350);
  const p = await page.evaluate(() => ({ sel: S.prpSel, hash: location.hash,
    rows: +document.querySelector("[data-prp-rows]")?.getAttribute("data-prp-rows"),
    text: document.querySelector("main")?.innerText || document.body.innerText }));
  ok(p.sel === "prp_01K5RX1N" && /\/steering\/proposals$/.test(p.hash), "fold: the proposal opens, got " + p.sel + " on " + p.hash);
  ok(p.rows === 3, "fold: the proposal cites each saying as a supporting run, got " + p.rows);
  ok(/Remember to not use the latest version of node/.test(p.text), "fold: the evidence quotes the sayings");
  ok(errs.length === 0, "fold: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

// The Run page has a Memories tab: what the run started, what it joined, and the self-grade, which
// only research.read reads. Marcus is refused and sees what was captured; Priya reads the axes.
{
  const RD1X = "#/a-intel/core-platform/runs/run_01K5RD1X8N7BVF3G/memory";
  const { page, errs } = await open(RD1X);
  const m = await page.evaluate(() => {
    const R = run("run_01K5RD1X8N7BVF3G");
    return { tab: S.tab.run, shown: +document.querySelector("[data-run-memories]")?.dataset.runMemories,
      want: MEMORY.reduce((n, x) => n + (x.sayings || []).filter(y => y.run === R.id).length, 0),
      text: document.querySelector(".run-main").innerText,
      sg: document.querySelector("[data-sg]")?.dataset.sg, axes: document.querySelectorAll(".run-main .sx-rax").length,
      tabBtn: [...document.querySelectorAll(".tabs .tab")].map(b => b.textContent) };
  });
  ok(m.tab === "memory" && m.tabBtn.some(t => /^Memories/.test(t)), "run memories: the route opens the tab, got " + m.tab);
  ok(m.want > 0 && m.shown === m.want, "run memories: one row per saying the run left, got " + m.shown + " of " + m.want);
  ok(/\bnew\b/.test(m.text) && /\bjoined\b/.test(m.text), "run memories: it tells a started memory from a joined one");
  ok(m.sg === "refused" && m.axes === 0, "run memories: without research.read the self-grade is refused, got " + m.sg + " with " + m.axes + " axes");
  ok(/research\.read/.test(m.text) && /Request access/.test(m.text) && /rfl_v3/.test(m.text),
    "run memories: the refusal names the grant and shows what was captured");
  ok(errs.length === 0, "run memories: no JavaScript error: " + errs.join(" | "));
  await page.close();

  const pg = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const e2 = []; pg.on("pageerror", e => e2.push(String(e.message || e)));
  await pg.goto(FILE + "?product=1&state=loaded&mobile=0&as=priya" + RD1X);
  await pg.waitForTimeout(300);
  const q = await pg.evaluate(() => ({ who: me().name, sg: document.querySelector("[data-sg]")?.dataset.sg,
    axes: document.querySelectorAll(".run-main .sx-rax").length,
    promote: [...document.querySelectorAll(".run-main button")].filter(b => /promote/i.test(b.textContent)).length }));
  ok(q.who === "Priya Natarajan" && q.sg === "read" && q.axes === 4, "run memories: ?as=priya reads the four axes, got " + JSON.stringify(q));
  ok(q.promote === 0, "run memories: nothing on the tab promotes a self-grade");
  for (const [id, re, what] of [["run_01K5RS7M2E8FJ3QW", /Nothing is written until the seal[\s\S]*Captured after the seal/, "a live run writes nothing yet"],
                                ["run_01K4QJ9E4T6YUI1O", /Deleted on 2025-12-29/, "a self-grade past retention is deleted"],
                                ["run_01K5RQ4B9C7XTN2P", /joined/, "a saying link lands on the run that said it"]]) {
    await pg.evaluate((h) => { location.hash = h; }, "#/a-intel/core-platform/runs/" + id + "/memory");
    await pg.waitForTimeout(250);
    const t = await pg.evaluate(() => document.querySelector(".run-main").innerText);
    ok(re.test(t), "run memories: " + what + ", got " + t.slice(0, 160).replace(/\s+/g, " "));
  }
  /* The Reflection page under Steering › Skills left with the fleet operations wedge; the self-grade is read on the run. */
  ok(e2.length === 0, "run memories: no JavaScript error as priya: " + e2.join(" | "));
  await pg.close();
}

// Cost centers (ADR-142): the labels on Organization, the charge on an agent's Identity tab, and the
// Cost center grouping on Spend. An organization Owner, Admin or Billing member writes. Marcus, a
// workspace owner, reads, and every write he tries names who can. The grouping must sum to the month's
// spend to the cent, which only holds if it is derived from the generated fleet rather than typed in,
// and it must read the same labels the Organization page edits.
{
  const as = async (who, hash) => {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errs = []; pg.on("pageerror", e => errs.push(String(e.message || e)));
    await pg.goto(FILE + "?product=1&state=loaded&mobile=0" + (who ? "&as=" + who : "") + hash);
    await pg.waitForTimeout(300);
    return { pg, errs };
  };
  const toast = pg => pg.evaluate(() => S.toast || "");
  const rows = pg => pg.evaluate(() => [...document.querySelectorAll("tr[data-cost-center]")].map(t => t.dataset.costCenter));

  const m = await as("", "#/a-intel");
  await m.pg.evaluate(() => orgTab("costcenters")); await m.pg.waitForTimeout(150);
  const r = await m.pg.evaluate(() => ({
    tab: [...document.querySelectorAll(".tabs .tab")].map(b => b.textContent).find(t => /^Cost centers/.test(t)) || "",
    ro: document.querySelector("[data-cc-readonly]")?.innerText || "",
    ws: document.querySelectorAll("tr[data-cc-ws]").length, wsWant: WS.length,
  }));
  ok(r.tab === "Cost centers 4", "cost centers: Organization has the tab with its count, got " + r.tab);
  ok((await rows(m.pg)).join() === "ENG-1001,ENG-1040,FIN-2040,MKT-3300", "cost centers: the four labels list, got " + (await rows(m.pg)).join());
  ok(/Owner, Admin or Billing/.test(r.ro) && /Dana Okafor/.test(r.ro), "cost centers: a reader is told who can change the list, got " + r.ro);
  ok(r.ws === r.wsWant, "cost centers: every workspace has a row, got " + r.ws + " of " + r.wsWant);
  await m.pg.evaluate(() => [...document.querySelectorAll("[data-cc-panel] button")].find(b => /Add a cost center/.test(b.textContent)).click());
  ok(/^Only an organization Owner, Admin or Billing member/.test(await toast(m.pg)) && !(await dlg(m.pg)),
    "cost centers: a reader's add is refused without a dialog, got " + (await toast(m.pg)));
  await m.pg.evaluate(() => { location.hash = "#/a-intel/core-platform/spend?by=cost_center&key=ENG-1001"; }); await m.pg.waitForTimeout(250);
  await m.pg.evaluate(() => [...document.querySelectorAll(".sp-side button")].find(b => b.textContent === "Export the statement").click());
  ok(/can export the chargeback statement/.test(await toast(m.pg)), "cost centers: a reader's export is refused, got " + (await toast(m.pg)));
  ok(m.errs.length === 0, "cost centers: no JavaScript error as marcus: " + m.errs.join(" | "));
  await m.pg.close();

  const d = await as("dana", "#/a-intel");
  await d.pg.evaluate(() => orgTab("costcenters")); await d.pg.waitForTimeout(150);
  const cells = await d.pg.evaluate(() => Object.fromEntries([...document.querySelectorAll("tr[data-cost-center]")].map(t =>
    [t.dataset.costCenter, [...t.querySelectorAll("td.num")].map(c => +c.textContent).join("/")])));
  ok(!(await d.pg.evaluate(() => document.querySelector("[data-cc-readonly]"))), "cost centers: a Billing member gets no read-only note");
  ok(cells["ENG-1001"] === "19/1" && cells["ENG-1040"] === "3/0" && cells["FIN-2040"] === "0/1" && cells["MKT-3300"] === "0/0",
    "cost centers: each label counts the agents and workspaces that name it, got " + JSON.stringify(cells));

  for (const [label, re, what] of [["bad label", /A label is 1 to 64 letters/, "a label with a space is refused"],
                                   ["ENG-1001", /ENG-1001 is already on the list/, "a duplicate label is refused"]]) {
    await d.pg.evaluate(() => openDialog("ccadd")); await d.pg.waitForTimeout(80);
    await type(d.pg, "#cc-label", label);
    await d.pg.evaluate(() => ccAdd());
    const e = await d.pg.evaluate(() => document.getElementById("cc-err")?.textContent || "");
    ok(re.test(e), "cost centers: " + what + ", got " + e);
    await d.pg.evaluate(() => closeDialog());
  }
  await d.pg.evaluate(() => openDialog("ccadd")); await d.pg.waitForTimeout(80);
  await type(d.pg, "#cc-label", "OPS-5100"); await type(d.pg, "#cc-desc", "Operations");
  await d.pg.evaluate(() => ccAdd()); await d.pg.waitForTimeout(80);
  ok(/^Added OPS-5100\./.test(await toast(d.pg)), "cost centers: adding a label says so, got " + (await toast(d.pg)));
  ok((await rows(d.pg)).includes("OPS-5100"), "cost centers: the new label lists");
  ok(await d.pg.evaluate(() => AUDIT[0].ev === "cost_center_created" && /OPS-5100/.test(AUDIT[0].what)), "cost centers: adding a label writes cost_center_created");

  await d.pg.evaluate(() => openDialog("ccdel", "ENG-1040")); await d.pg.waitForTimeout(80);
  const dc = await d.pg.evaluate(() => document.querySelector("[data-cc-del-count]")?.textContent || "");
  ok(dc === "3 agents and 0 workspaces name ENG-1040 today.", "cost centers: deleting names what still points at the label, got " + dc);
  await d.pg.evaluate(() => [...document.querySelectorAll("#layer .dlg-f button")].find(b => b.textContent === "Delete").click());
  await d.pg.waitForTimeout(80);
  ok(/^Deleted ENG-1040\. Runs already rolled up keep it\. 3 agents fall back/.test(await toast(d.pg)), "cost centers: deleting says where the agents go, got " + (await toast(d.pg)));
  ok(!(await rows(d.pg)).includes("ENG-1040") && await d.pg.evaluate(() => !Object.values(CC.agents).includes("ENG-1040")),
    "cost centers: a deleted label leaves the list and every agent that named it");
  ok(await d.pg.evaluate(() => AUDIT[0].ev === "cost_center_deleted"), "cost centers: deleting writes cost_center_deleted");

  await d.pg.evaluate(() => openDialog("ccws", "growth")); await d.pg.waitForTimeout(80);
  await d.pg.selectOption("#cc-pick", "MKT-3300");
  await d.pg.evaluate(() => ccSetWs("growth")); await d.pg.waitForTimeout(80);
  ok(/^Growth is charged to MKT-3300\./.test(await toast(d.pg)), "cost centers: charging a workspace says so, got " + (await toast(d.pg)));
  ok(await d.pg.evaluate(() => document.querySelector('tr[data-cc-ws="growth"]').innerText.includes("MKT-3300")), "cost centers: the workspace row shows its new label");

  await d.pg.evaluate(() => { location.hash = "#/a-intel/core-platform/spend/cost_center"; }); await d.pg.waitForTimeout(250);
  const s = await d.pg.evaluate(() => {
    const rs = [...document.querySelectorAll("#pg table tbody tr")];
    const label = r => r.cells[0].querySelector(".mono")?.textContent || "";
    return { hash: location.hash, heading: [...document.querySelectorAll("#pg .panel h3")].map(x => x.textContent).find(t => /^By /.test(t)),
      labels: rs.map(label), deleted: rs.filter(r => /deleted/.test(r.cells[0].textContent)).map(label),
      sum: Math.round(spendRows("cost_center").reduce((n, r) => n + r.usd, 0) * 100), want: Math.round(n$(SPEND.spend) * 100),
      agents: rs.reduce((n, r) => n + +r.cells[1].textContent, 0), wantAgents: SPEND.byAgent.length };
  });
  ok(/\/spend\?by=cost_center$/.test(s.hash) && s.heading === "By cost center", "cost centers: the old route opens Spend grouped by cost center, got " + s.hash + " ~ " + s.heading);
  ok(s.labels.includes("ENG-1001") && s.labels.includes("~none"), "cost centers: Spend groups by the fixture's labels and ~none, got " + s.labels.join());
  ok(s.sum === s.want, "cost centers: the rows sum to the month's spend to the cent, got " + s.sum + " of " + s.want);
  ok(s.agents === s.wantAgents, "cost centers: every agent lands in exactly one row, got " + s.agents + " of " + s.wantAgents);
  ok(s.deleted.join() === "ENG-1040", "cost centers: a deleted label keeps the runs already rolled up, got " + s.deleted.join());
  await d.pg.evaluate(() => { location.hash = "#/a-intel/core-platform/spend?by=agent&key=a-intel.core.triage"; }); await d.pg.waitForTimeout(250);
  const side = await d.pg.evaluate(() => [...document.querySelectorAll(".sp-side dt")].find(t => t.textContent === "Cost center")?.nextElementSibling.textContent);
  ok(side === "ENG-1001", "cost centers: an agent's side panel shows the label Organization set, got " + side);
  await d.pg.evaluate(() => { location.hash = "#/a-intel/core-platform/spend?by=cost_center&key=ENG-1001"; }); await d.pg.waitForTimeout(250);
  await d.pg.evaluate(() => [...document.querySelectorAll(".sp-side button")].find(b => b.textContent === "Export the statement").click());
  await d.pg.waitForTimeout(80);
  ok(/cost_micros/.test((await dlg(d.pg))?.body || ""), "cost centers: the export lists its columns");
  await d.pg.evaluate(() => ccExport()); await d.pg.waitForTimeout(80);
  ok(/^Exported cost-centers-2026-09\.csv\./.test(await toast(d.pg)) && await d.pg.evaluate(() => AUDIT[0].ev === "cost_center_statement_exported"),
    "cost centers: exporting says so and writes cost_center_statement_exported, got " + (await toast(d.pg)));

  for (const [ws, pick, from, re] of [["core-platform", "a-intel.core.stella-ci", "agent", /its own label, which wins over the workspace/],
                                      ["data-platform", null, "workspace", /inherited from workspace data-platform/],
                                      ["security", null, "none", /~none row/]]) {
    const key = await d.pg.evaluate(([w, k]) => k || AGENTS.find(a => a.ws === w && !CC.agents[a.key]).key, [ws, pick]);
    await d.pg.evaluate(([w, k]) => { location.hash = "#/a-intel/" + w + "/agents/" + k.split(".").pop() + "/identity"; }, [ws, key]);
    await d.pg.waitForTimeout(250);
    const c = await d.pg.evaluate(() => ({ from: document.querySelector("[data-cc-from]")?.dataset.ccFrom, text: document.querySelector("[data-cc-cell]")?.innerText || "" }));
    ok(c.from === from && re.test(c.text), "cost centers: an agent's Identity tab says where its runs roll up (" + from + "), got " + JSON.stringify(c));
  }
  ok(d.errs.length === 0, "cost centers: no JavaScript error as dana: " + d.errs.join(" | "));
  await d.pg.close();

  const ph = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const pe = []; ph.on("pageerror", e => pe.push(String(e.message || e)));
  for (const hash of ["#/a-intel", "#/a-intel/core-platform/spend?by=cost_center&key=ENG-1001"]) {
    await ph.goto(FILE + "?product=1&state=loaded&mobile=1&theme=dark&as=dana" + hash);
    await ph.waitForTimeout(300);
    if (hash === "#/a-intel") { await ph.evaluate(() => orgTab("costcenters")); await ph.waitForTimeout(150); }
    const over = await ph.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(over <= 0, "cost centers: no sideways scroll on a phone in the dark theme at " + hash + ", got " + over + "px");
  }
  ok(pe.length === 0, "cost centers: no JavaScript error on a phone: " + pe.join(" | "));
  await ph.close();
}

/* ---------------- notifications: selecting one marks it read ----------------
   The bell's label, the dialog footer and the unread rows must all move together, one at a time. */
{
  const { page, errs } = await open("#/a-intel/core-platform");
  const read = () => page.evaluate(() => ({
    bell: document.querySelector('[aria-label^="Notifications,"]')?.getAttribute("aria-label") || "",
    dot: !!document.querySelector('[aria-label^="Notifications,"] .dot'),
    rows: document.querySelectorAll("#layer .li[data-notif]").length,
    foot: document.querySelector("#layer .dlg-f .grow")?.textContent || "",
    focus: document.activeElement?.hasAttribute("data-notif") || false,
    all: [...document.querySelectorAll("#layer .dlg-f button")].find(b => /Mark all read/.test(b.textContent))?.disabled,
  }));
  await page.evaluate(() => openDialog("notifs")); await page.waitForTimeout(120);
  const a = await read();
  const n = a.rows;
  ok(n >= 2, "notifications: the fixture opens with at least two unread, got " + n);
  ok(a.bell === "Notifications, " + n + " unread" && a.dot, "notifications: the bell names the unread count and shows the dot, got " + a.bell);
  ok(a.foot === n + " unread · select one to mark it read", "notifications: the footer names the count and how to mark one, got " + a.foot);
  ok(await page.evaluate(() => [...document.querySelectorAll("#layer .li[data-notif]")].every(e => e.getAttribute("role") === "button" && /^Mark read: /.test(e.getAttribute("aria-label")))),
    "notifications: every unread item is a button labelled Mark read");

  await page.click("#layer .li[data-notif]"); await page.waitForTimeout(120);
  const b = await read();
  ok(b.rows === n - 1, "notifications: a click marks exactly one read, got " + b.rows + " of " + n);
  ok(b.bell === "Notifications, " + (n - 1) + " unread", "notifications: the bell count drops with it, got " + b.bell);
  ok(b.foot === (n - 1) + " unread · select one to mark it read", "notifications: the footer count drops with it, got " + b.foot);
  ok(b.focus, "notifications: focus moves to the next unread item");
  const ev1 = await page.evaluate(() => AUDIT[0] || {});
  ok(ev1.ev === "notification_read" && /^Read “/.test(ev1.what), "notifications: marking one read records a notification_read audit event, got " + JSON.stringify(ev1));
  ok(await page.evaluate(() => [...document.querySelectorAll("#layer .li:not(.unread)")].every(e => !e.hasAttribute("role"))),
    "notifications: a read item is plain text, not a button");

  await page.keyboard.press("Enter"); await page.waitForTimeout(120);
  ok((await read()).rows === n - 2, "notifications: Enter on the focused item marks it read");

  await page.evaluate(() => [...document.querySelectorAll("#layer .dlg-f button")].find(b => /Mark all read/.test(b.textContent)).click());
  await page.waitForTimeout(150);
  const said = await page.evaluate(() => S.toast || "");
  ok(/^All notifications marked read\. Audit records who read each one\./.test(said), "notifications: Mark all read says Audit records it, got " + said);
  const evAll = await page.evaluate(k => AUDIT.slice(0, k).filter(e => e.ev === "notification_read" && /^Read “/.test(e.what)).length, n - 2);
  ok(evAll === n - 2, "notifications: Mark all read records one read event per item, got " + evAll + " of " + (n - 2));
  const c = await read();
  ok(c.bell === "Notifications, 0 unread" && !c.dot, "notifications: the bell reads 0 unread with no dot, got " + c.bell);
  await page.evaluate(() => openDialog("notifs")); await page.waitForTimeout(120);
  const d = await read();
  ok(d.foot === "All read" && d.all === true && d.rows === 0, "notifications: the reopened dialog reads All read with Mark all read disabled, got " + JSON.stringify(d));
  await page.evaluate(() => { closeDialog(); NOTIFS[0].unread = true; openDialog("notifs"); }); await page.waitForTimeout(120);
  await page.click("#layer .li[data-notif]"); await page.waitForTimeout(120);
  ok(await page.evaluate(() => document.activeElement?.matches(".dlg .x") || false), "notifications: marking the last unread one moves focus to the close button");
  ok(errs.length === 0, "notifications: no JavaScript error: " + errs.join(" | "));
  await page.close();
}

await browser.close();
console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
