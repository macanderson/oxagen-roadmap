#!/usr/bin/env node
// The Steering record, all the way: the wizard writes it, a pull request carries it, six checks run,
// a person merges, and only then does it steer anything. This walks that path in one browser
// session and asserts the things that make it a governed publication rather than a save button.
//
//   node tools/check-record-e2e.mjs           # the whole path
//   node tools/check-record-e2e.mjs --shots   # a screenshot at each stage
//
// What it is really guarding, and why each is here rather than assumed:
//   * the record does NOT exist in Sources, in the bundle or on its own page while the PR is open
//   * merge is blocked until every check reports — the button is disabled, and clicking does nothing
//   * merge publishes exactly once: Sources gains one row, the bundle gains one rule and one version
//   * the promoter's pull request is untouched by any of it
//   * closing without merging leaves nothing behind
//   * a lineage that is already published FAILS its check, and nothing merges (PR #36 review, P1)
//   * a second operator PR does not erase the first (P2)
//   * a statement with a quote still produces a file that parses as TOML (P3)
//   * two OPEN pull requests cannot both publish one lineage — the later one fails, and the
//     uniqueness check is re-run at merge, not only when the check first ran (second review, P1)
//   * every compiled bundle version gets its own digest, so a panel claiming it was re-signed
//     renders one (second review, P2)
//   * every string shape round-trips through the TOML writer and the reader: quotes, backslashes,
//     newlines, and a trailing newline (second review, P2)
// Counts are read before and after and compared, never read back out of the thing under test.
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

const STATEMENT = "Never hand-edit a generated migration; regenerate it from the schema.";

async function open(hash = "#/a-intel/core-platform") {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errs = [];
  page.on("pageerror", e => errs.push(String(e.message || e)));
  page.on("dialog", d => d.dismiss());
  await page.goto(FILE + "?product=1&state=loaded&mobile=0" + hash);
  await page.waitForTimeout(350);
  return { page, errs };
}
// The world as the app holds it, read the same way before and after so a diff means something.
const world = async page => await page.evaluate(() => ({
  records: RECORDS.length,
  published: RECORDS.filter(r => r.status === "published").length,
  bundleV: STEER_BUNDLE.v,
  bundleRules: STEER_BUNDLE.rules.length,
  audit: AUDIT.filter(a => a.ev === "steering_published").length,
  ctxprState: S.ctxpr.st,
  recprState: recprCur() ? recprSt(recprCur()).st : "none",
  hasRecpr: RECPRS.length > 0,
  openPrs: RECPRS.length,
  prNumber: recprCur() ? recprCur().pr : null,
  lineage: recprCur() ? recprCur().record.id : null,
  // two independent readings of the same claim: how many published records hold this lineage
  dupes: recprCur() ? RECORDS.filter(r => r.status === "published" && r.id === recprCur().record.id).length : 0,
  ruleDupes: recprCur() ? STEER_BUNDLE.rules.filter(r => r.id === recprCur().record.id).length : 0,
}));
const shot = async (page, name) => { if (shots) await page.screenshot({ path: path.join(shots, name + ".png"), fullPage: true }); };
const primary = async page => await page.evaluate(() => {
  const b = [...document.querySelectorAll("#layer .dlg-f button.primary")].pop();
  if (!b || b.disabled) return false;
  b.click(); return true;
});
const pgText = async page => await page.evaluate(() => document.getElementById("pg").innerText.replace(/\s+/g, " "));
// Click a button on the page by its label. Returns false rather than throwing when it is absent,
// so a mutation that removes a control fails the assertion it belongs to instead of killing the run.
const clickPg = async (page, re) => await page.evaluate(src => {
  const b = [...document.querySelectorAll("#pg button")].find(x => new RegExp(src).test(x.textContent));
  if (!b || b.disabled) return false;
  b.click(); return true;
}, re.source);

{
  const { page, errs } = await open();
  const before = await world(page);
  ok(before.hasRecpr === false, "nothing is open before the wizard runs");

  /* ---------- the wizard ---------- */
  await page.evaluate(() => wzOpen("record"));
  await page.waitForTimeout(200);
  await page.fill("#wzDesc", STATEMENT);
  await page.evaluate(s => { const t = document.getElementById("wzDesc"); t.value = s; t.dispatchEvent(new Event("input", { bubbles: true })); }, STATEMENT);
  // the wand writes the prose the record carries, and step 2 opens when it has
  await page.evaluate(() => document.getElementById("wzWandBtn").click());
  await page.waitForTimeout(120);
  ok(await primary(page), "step 1 advances once there is a description");
  await page.waitForTimeout(200);

  ok((await page.evaluate(() => [...document.querySelectorAll("#layer .dlg-f button.primary")].pop().disabled)) === true,
     "step 2 will not advance without a kind");
  await page.evaluate(() => { [...document.querySelectorAll("#layer .wz-kind")].find(b => /constraint/.test(b.textContent)).click(); });
  await page.waitForTimeout(150);
  ok(await primary(page), "step 2 advances once a kind is picked");
  await page.waitForTimeout(250);

  const statement = await page.evaluate(() => document.getElementById("cedT").value);
  ok(statement.includes("hand-edit a generated migration"), "step 3 seeds the statement from the description, got " + JSON.stringify(statement.slice(0, 50)));
  await shot(page, "rec-e2e-1-statement");
  ok(await primary(page), "step 3 advances");
  await page.waitForTimeout(200);
  ok(/Lineage uniqueness/.test(await page.evaluate(() => document.querySelector("#layer .dlg-b").innerText)), "step 4 names the checks");
  ok(await primary(page), "step 4 advances");
  await page.waitForTimeout(200);

  /* ---------- open the pull request ---------- */
  const mid = await world(page);
  ok(mid.records === before.records, "the wizard wrote no record on the way to the PR");
  ok(await primary(page), "the last step opens the pull request");
  await page.waitForTimeout(400);

  const opened = await world(page);
  ok(opened.hasRecpr, "a pull request exists");
  ok(!(await page.evaluate(() => !!document.querySelector("#layer .dlg"))), "the wizard closed");
  ok(await page.evaluate(() => location.hash.endsWith("/steering/proposals/prs")), "it landed on Steering, on the pull requests view of Proposals, got " + await page.evaluate(() => location.hash));
  ok(await page.evaluate(() => S.tab.steering) === "prs", "on the Pull requests view");
  ok(/^a-intel\/platform#\d+$/.test(opened.prNumber), "the PR has a number on the main repo, got " + opened.prNumber);
  ok(opened.prNumber !== "a-intel/platform#519", "and it is not the promoter's number");
  ok(/^ctx\./.test(opened.lineage), "the lineage is derived, got " + opened.lineage);

  // THE point: an open PR steers nothing.
  ok(opened.records === before.records, "the published records are unchanged while the PR is open");
  ok(opened.bundleV === before.bundleV, "the bundle version is unchanged while the PR is open");
  ok(opened.bundleRules === before.bundleRules, "the bundle has no new rule while the PR is open");
  ok(opened.audit === before.audit, "nothing was audited as published while the PR is open");

  let txt = await pgText(page);
  ok(txt.includes(opened.prNumber), "the tab shows the new PR");
  ok(/Opened by/.test(txt), "the table says who opened each PR");
  ok(txt.includes("a-intel/platform#519"), "the promoter's PR is still listed beside it");
  ok(/Merge effects/.test(txt), "it says what merge will do, before it does it");
  ok(/checks/.test(txt), "each row says where its checks stand");
  await shot(page, "rec-e2e-2-pr-open");

  // merge is blocked until the checks report, and the block is real
  const blocked = await page.evaluate(() => {
    const b = [...document.querySelectorAll("#pg button")].find(x => /Merge pull request/.test(x.textContent));
    return b ? { found: true, disabled: b.disabled } : { found: false };
  });
  ok(blocked.found, "there is a merge button");
  ok(blocked.disabled === true, "merge is disabled while the checks run");
  await page.evaluate(() => recprMerge());     // and clicking through anyway does nothing
  await page.waitForTimeout(150);
  ok((await world(page)).records === before.records, "forcing a merge while checks run publishes nothing");

  /* ---------- the checks ---------- */
  await page.waitForFunction(() => recprCur() && recprSt(recprCur()).st === "passed", null, { timeout: 15000 }).catch(() => {});
  const passed = await world(page);
  ok(passed.recprState === "passed", "every check reported, got " + passed.recprState);
  txt = await pgText(page);
  const checkNames = ["Schema", "Lineage uniqueness", "record_hash recomputation", "Secret and PII scan",
    "Conflict against active records", "Constraint is require or forbid"];
  checkNames.forEach(n => ok(txt.includes(n), "check listed: " + n));
  ok(/constraint forbid/.test(txt), "the constraint check reports this record's own effect");
  ok(passed.records === before.records, "passing checks still publishes nothing");
  await shot(page, "rec-e2e-3-checks-passed");

  /* ---------- merge ---------- */
  ok(await clickPg(page, /Merge pull request/), "the merge button is there and enabled once the checks pass");
  await page.waitForTimeout(400);
  const merged = await world(page);
  ok(merged.recprState === "merged", "the PR is merged");
  ok(merged.records === before.records + 1, "exactly one record was published, got " + (merged.records - before.records));
  ok(merged.bundleV === before.bundleV + 1, "the bundle bumped exactly one version");
  ok(merged.bundleRules === before.bundleRules + 1, "the bundle gained exactly one rule");
  ok(merged.audit === before.audit + 1, "one steering_published audit event");
  ok(merged.ctxprState === before.ctxprState, "the promoter's PR is untouched, " + before.ctxprState + " → " + merged.ctxprState);

  txt = await pgText(page);
  ok(/promotion_event/.test(txt), "the promotion event is shown");
  ok(/authored . published|authored → published/.test(txt), "it records authored → published");
  ok(new RegExp("v" + before.bundleV + " . v" + merged.bundleV).test(txt), "it names the bundle bump " + before.bundleV + " → " + merged.bundleV);
  await shot(page, "rec-e2e-4-merged");

  /* ---------- and now it is in force ---------- */
  ok(await clickPg(page, /Open the record/), "the merged PR offers a way to the record it published");
  await page.waitForTimeout(400);
  const rec = await page.evaluate(() => ({
    h1: document.querySelector("#pg h1")?.textContent || "",
    txt: document.getElementById("pg").innerText.replace(/\s+/g, " "),
    ced: !!document.getElementById("cedT"),
    bound: document.querySelectorAll(".crec-bound").length,
  }));
  ok(rec.h1.includes("hand-edit a generated migration"), "the record page leads with the statement, got " + rec.h1.slice(0, 60));
  ok(rec.ced, "its statement is editable there");
  ok(rec.bound === 1, "a constraint shows its boundary block");
  ok(/published/.test(rec.txt), "it reads as published");
  await shot(page, "rec-e2e-5-record-page");

  // and it is in the list it belongs to
  await page.evaluate(() => { S.prSel = null; go("#/a-intel/core-platform/steering/records"); });
  await page.waitForTimeout(400);
  ok((await pgText(page)).includes("hand-edit a generated migration"), "it appears in Sources, newest first");
  ok(errs.length === 0, "no page errors across the whole path: " + errs.join(" | "));
  await page.close();
}

/* ---------- closing without merging leaves nothing behind ---------- */
{
  const { page, errs } = await open();
  const before = await world(page);
  await page.evaluate(s => {
    wzOpen("record"); S.wz.desc = s; S.wz.rkind = "preference"; wzGo(3); wzGo(5); wzRecOpenPr();
  }, "Prefer short branch names.");
  await page.waitForTimeout(400);
  ok((await world(page)).hasRecpr, "a PR was opened");
  await page.evaluate(() => recprDiscard());
  await page.waitForTimeout(300);
  const after = await world(page);
  ok(after.hasRecpr === false, "closing removes the PR");
  ok(after.records === before.records, "and publishes nothing");
  ok(after.bundleV === before.bundleV, "and leaves the bundle alone");
  const rest = await pgText(page);
  ok(/a-intel\/platform#519/.test(rest) && !/Prefer short branch names/.test(rest),
    "the discarded PR is gone and the promoter's are still listed");
  ok(errs.length === 0, "no errors on discard: " + errs.join(" | "));
  await page.close();
}

/* ---------- a kind that constrains nothing takes the other branch ---------- */
{
  const { page, errs } = await open();
  await page.evaluate(s => {
    wzOpen("record"); S.wz.desc = s; S.wz.rkind = "memory"; wzGo(3); wzGo(5); wzRecOpenPr();
  }, "The checkout suite flaked on Safari through August.");
  await page.waitForTimeout(400);
  await page.waitForFunction(() => recprCur() && recprSt(recprCur()).st === "passed", null, { timeout: 15000 }).catch(() => {});
  const txt = await pgText(page);
  ok(/not a constraining kind/.test(txt), "a memory passes the constraint check by not having one");
  ok(!/constraint (require|forbid) /.test(txt), "and claims no constraint effect");
  ok(/no \[enforcement\] table/.test(txt), "its file says why it has no enforcement table");
  // and the structural fact, not only the sentence about it
  const f = await page.evaluate(() => { const d = recprCur(); return { text: recprFileText(d), ce: d.record.ce }; });
  ok(f.ce === null, "a memory carries no constraint effect");
  ok(!/^\[enforcement\]/m.test(f.text), "and its file has no [enforcement] table at all");
  ok(!/constraint_effect\s*=/.test(f.text), "and never writes a constraint_effect key");
  ok(/info/.test(txt), "a memory carries info force");
  ok(errs.length === 0, "no errors on the memory path: " + errs.join(" | "));
  await page.close();
}

/* ---------- P1: a lineage that is already published must fail its check ---------- */
{
  const { page, errs } = await open();
  const write = async desc => {
    await page.evaluate(d => { wzOpen("record"); S.wz.desc = d; S.wz.rkind = "constraint"; wzGo(3); wzGo(5); wzRecOpenPr(); }, desc);
    await page.waitForFunction(() => recprCur() && /passed|failed/.test(recprSt(recprCur()).st), null, { timeout: 15000 }).catch(() => {});
  };
  await write("Never hand-edit a generated migration; regenerate it from the schema.");
  const first = await world(page);
  ok(first.recprState === "passed", "the first record's checks pass");
  await page.evaluate(() => recprMerge());
  await page.waitForTimeout(300);
  const afterOne = await world(page);
  ok(afterOne.dupes === 1, "one published record holds the lineage");

  // a different sentence that slugs to the same lineage
  await write("Never hand-edit a generated migration under any circumstances whatsoever.");
  const second = await world(page);
  ok(second.lineage === first.lineage, "the two descriptions do collide on one lineage, got " + second.lineage);
  ok(second.recprState === "failed", "the second pull request FAILS its lineage check, got " + second.recprState);
  const txt2 = await pgText(page);
  ok(/already published/.test(txt2), "the failing check says why");
  ok(/check failed/.test(txt2), "the state badge says a check failed");
  const mergeBtn = await page.evaluate(() => {
    const b = [...document.querySelectorAll("#pg button")].find(x => /Merge pull request/.test(x.textContent));
    return b ? b.disabled : null;
  });
  ok(mergeBtn === true, "merge stays disabled on a failed check");
  await page.evaluate(() => recprMerge());     // and forcing it does nothing
  await page.waitForTimeout(200);
  const afterTwo = await world(page);
  ok(afterTwo.dupes === 1, "still exactly one record holds the lineage, got " + afterTwo.dupes);
  ok(afterTwo.ruleDupes === 1, "and exactly one compiled rule, got " + afterTwo.ruleDupes);
  ok(afterTwo.bundleV === afterOne.bundleV, "the bundle version did not move on the failed PR");
  await shot(page, "rec-e2e-6-lineage-taken");
  ok(errs.length === 0, "no errors on the duplicate-lineage path: " + errs.join(" | "));
  await page.close();
}

/* ---------- P2: a second pull request does not erase the first ---------- */
{
  const { page, errs } = await open();
  await page.evaluate(() => { wzOpen("record"); S.wz.desc = "First concern, entirely its own."; S.wz.rkind = "rule"; wzGo(3); wzGo(5); wzRecOpenPr(); });
  await page.waitForTimeout(300);
  const one = await page.evaluate(() => recprCur().pr);
  await page.evaluate(() => { wzOpen("record"); S.wz.desc = "Second concern, unrelated to the first."; S.wz.rkind = "rule"; wzGo(3); wzGo(5); wzRecOpenPr(); });
  await page.waitForTimeout(300);
  const two = await page.evaluate(() => recprCur().pr);
  ok(one !== two, "the second pull request gets its own number, " + one + " then " + two);
  ok((await world(page)).openPrs === 2, "both are open");
  const txt = await pgText(page);
  ok(txt.includes(one), "the first is still listed after the second opens");
  ok(txt.includes(two), "and so is the second");
  // and each keeps its own state and its own file
  await page.evaluate(p => prSelect(p), one);
  await page.waitForTimeout(250);
  ok((await pgText(page)).includes("First concern"), "selecting the first shows the first's statement");
  await page.evaluate(p => prSelect(p), two);
  await page.waitForTimeout(250);
  ok((await pgText(page)).includes("Second concern"), "selecting the second shows the second's");
  await shot(page, "rec-e2e-7-two-open");
  ok(errs.length === 0, "no errors with two open: " + errs.join(" | "));
  await page.close();
}

/* ---------- P3: operator text is serialised as TOML, not just HTML-escaped ---------- */
{
  const { page, errs } = await open();
  const tricky = 'Always say "ready" before a deploy, and never use a \\ in a branch name.';
  await page.evaluate(d => { wzOpen("record"); S.wz.desc = d; S.wz.rkind = "rule"; wzGo(3); wzGo(5); wzRecOpenPr(); }, tricky);
  await page.waitForTimeout(400);
  // the file the PR carries must parse with the app's own TOML reader — two independent things:
  // what is rendered, and what the parser makes of it.
  const r = await page.evaluate(() => {
    const def = recprCur(), text = recprFileText(def);
    let parsed = null, err = null;
    try { parsed = tomlParse(text); } catch (e) { err = String(e.message || e); }
    return { text, err, statement: parsed && parsed.statement, rendered: document.querySelector("#pg pre").innerText };
  });
  ok(r.err === null, "the record file parses as TOML, got " + r.err);
  ok(r.statement === (await page.evaluate(() => recprCur().record.st)),
     "and round-trips the statement exactly, got " + JSON.stringify(r.statement));
  ok(/\\"ready\\"/.test(r.text) || r.text.includes('\\"ready\\"'), "the quotes are escaped in the file, got " + JSON.stringify(r.text.split("\n").find(l => /statement/.test(l))));
  await page.waitForFunction(() => recprCur() && recprSt(recprCur()).st === "passed", null, { timeout: 15000 }).catch(() => {});
  ok((await world(page)).recprState === "passed", "and its schema check passes honestly");
  await shot(page, "rec-e2e-8-quoted-statement");
  ok(errs.length === 0, "no errors on the quoted-statement path: " + errs.join(" | "));
  await page.close();
}

/* ---------- second review, P1: two OPEN pull requests racing for one lineage ---------- */
{
  const { page, errs } = await open();
  const before = await world(page);
  // both opened before either merges, so both run their checks against a world with neither in it
  await page.evaluate(() => { wzOpen("record"); S.wz.desc = "Never hand-edit a generated migration; regenerate it."; S.wz.rkind = "constraint"; wzGo(3); wzGo(5); wzRecOpenPr(); });
  await page.evaluate(() => { wzOpen("record"); S.wz.desc = "Never hand-edit a generated migration under any circumstance."; S.wz.rkind = "constraint"; wzGo(3); wzGo(5); wzRecOpenPr(); });
  await page.waitForFunction(() => RECPRS.length === 2 && RECPRS.every(d => /passed|failed/.test(recprSt(d).st)), null, { timeout: 15000 }).catch(() => {});
  const st = await page.evaluate(() => RECPRS.map(d => ({ pr: d.pr, id: d.record.id, st: recprSt(d).st })));
  ok(st.length === 2 && st[0].id === st[1].id, "the two do claim one lineage, got " + JSON.stringify(st.map(x => x.id)));
  ok(st.filter(x => x.st === "passed").length === 1, "exactly one of them passes, got " + JSON.stringify(st.map(x => x.st)));
  ok(st.filter(x => x.st === "failed").length === 1, "and exactly one fails");
  ok(/opened first/.test(await pgText(page)), "the loser is told which pull request claimed it first");

  // merging both, oldest first, must still publish once
  await page.evaluate(() => { RECPRS.slice().reverse().forEach(d => recprMerge(d.pr)); });
  await page.waitForTimeout(400);
  const after = await world(page);
  ok(after.records === before.records + 1, "one record published from two competing PRs, got " + (after.records - before.records));
  ok(after.dupes === 1, "one published record holds the lineage, got " + after.dupes);
  ok(after.ruleDupes === 1, "and one compiled rule, got " + after.ruleDupes);
  ok(after.bundleV === before.bundleV + 1, "and the bundle moved exactly one version");
  ok(errs.length === 0, "no errors racing two PRs: " + errs.join(" | "));
  await page.close();
}

/* ---------- second review, P1b: a check that passed is re-run at merge ---------- */
{
  const { page, errs } = await open();
  const before = await world(page);
  // one PR goes green, then the lineage is taken out from under it by a direct publication
  await page.evaluate(() => { wzOpen("record"); S.wz.desc = "Rotate the signing key every ninety days."; S.wz.rkind = "rule"; wzGo(3); wzGo(5); wzRecOpenPr(); });
  await page.waitForFunction(() => recprCur() && recprSt(recprCur()).st === "passed", null, { timeout: 15000 }).catch(() => {});
  ok((await world(page)).recprState === "passed", "it went green");
  await page.evaluate(() => {
    const id = recprCur().record.id;
    RECORDS.push({ id, kind: "rule", force: "should", scope: "workspace", status: "published",
      st: "Something else got there first.", effect: "rendered 0", commit: "aaaaaaa", pub: "2026-09-11" });
  });
  await page.evaluate(() => recprMerge());
  await page.waitForTimeout(300);
  const after = await world(page);
  ok(after.recprState === "failed", "merging re-runs the check and it now fails, got " + after.recprState);
  ok(after.dupes === 1, "and nothing was published on top of the record that got there first, got " + after.dupes);
  ok(after.bundleV === before.bundleV, "and the bundle did not move");
  ok(/no longer does|already published/.test(await page.evaluate(() => document.getElementById("toast").innerText + " " + document.getElementById("pg").innerText)),
     "and the operator is told why");
  ok(errs.length === 0, "no errors on the stale-check path: " + errs.join(" | "));
  await page.close();
}

/* ---------- second review, P2: every compiled version has a digest ---------- */
{
  const { page, errs } = await open();
  const merge = async d => {
    await page.evaluate(x => { wzOpen("record"); S.wz.desc = x; S.wz.rkind = "rule"; wzGo(3); wzGo(5); wzRecOpenPr(); }, d);
    await page.waitForFunction(() => recprCur() && /passed|failed/.test(recprSt(recprCur()).st), null, { timeout: 15000 }).catch(() => {});
    await page.evaluate(() => recprMerge());
    await page.waitForTimeout(250);
  };
  await merge("Freeze main before cutting a release tag.");
  await merge("Label every flaky test with its owning team.");
  const d = await page.evaluate(() => ({ v: STEER_BUNDLE.v, digest: stgBundle().digest, all: STEER_BUNDLE.digest }));
  ok(typeof d.digest === "string" && /^sha256:/.test(d.digest),
     "the bundle has a digest after a second merge, got " + d.digest);
  const vals = Object.values(d.all);
  ok(new Set(vals).size === vals.length, "each version's digest is its own, got " + JSON.stringify(d.all));
  const shown = await pgText(page);
  ok(!/re-signed/.test(shown), "the promotion panel names a digest rather than the word re-signed");
  ok(new RegExp(d.digest).test(shown), "and it is the digest the bundle actually holds");
  ok(errs.length === 0, "no errors across two merges: " + errs.join(" | "));
  await page.close();
}

/* ---------- second review, P2b: the TOML writer and reader agree on every shape ---------- */
{
  const { page, errs } = await open();
  const cases = await page.evaluate(() => {
    const vs = ["plain one liner", 'has a "quote" in it', "has a \\ backslash", "two\nlines",
                "two\nlines with a \\ backslash", 'multi\nline with "quotes" and \\ and a trailing newline\n'];
    return vs.map(v => {
      const doc = "k = " + (/\n/.test(v) ? tomlMulti(v) : tomlStr(v)) + "\n";
      let back = null, err = null;
      try { back = tomlParse(doc).k; } catch (e) { err = String(e.message || e); }
      return { v, back, err, equal: back === v };
    });
  });
  cases.forEach(c => ok(c.equal, "TOML round-trip " + JSON.stringify(c.v) + (c.equal ? "" : " -> " + JSON.stringify(c.back) + (c.err ? " err=" + c.err : ""))));
  // and the same through the record the wizard actually writes
  const rec = await page.evaluate(() => {
    const body = "Deploy from the bundle at:\nPath:\\deploy\\q and never by hand.";
    wzOpen("record"); S.wz.desc = "Deploy from the bundle path."; S.wz.rkind = "rule"; wzGo(3);
    S.cedVal["wz:record"] = body; wzGo(5); wzRecOpenPr();
    const def = recprCur(); let parsed = null, err = null;
    try { parsed = tomlParse(recprFileText(def)); } catch (e) { err = String(e.message || e); }
    return { err, equal: parsed && parsed.statement === def.record.st, statement: parsed && parsed.statement };
  });
  ok(rec.err === null, "a multi-line statement with a backslash still parses, got " + rec.err);
  ok(rec.equal, "and round-trips exactly, got " + JSON.stringify(rec.statement));
  ok(errs.length === 0, "no errors on the TOML path: " + errs.join(" | "));
  await page.close();
}

await browser.close();
console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
