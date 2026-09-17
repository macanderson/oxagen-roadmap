#!/usr/bin/env node
// The context record, all the way: the wizard writes it, a Context PR carries it, six checks run,
// a person merges, and only then does it steer anything. This walks that path in one browser
// session and asserts the things that make it a governed publication rather than a save button.
//
//   node tools/check-record-e2e.mjs           # the whole path
//   node tools/check-record-e2e.mjs --shots   # a screenshot at each stage
//
// What it is really guarding, and why each is here rather than assumed:
//   * the record does NOT exist in Records, in the bundle or on its own page while the PR is open
//   * merge is blocked until every check reports — the button is disabled, and clicking does nothing
//   * merge publishes exactly once: Records gains one row, the bundle gains one rule and one version
//   * the promoter's pull request is untouched by any of it
//   * closing without merging leaves nothing behind
//   * a lineage that is already published FAILS its check, and nothing merges (PR #36 review, P1)
//   * a second operator PR does not erase the first (P2)
//   * a statement with a quote still produces a file that parses as TOML (P3)
// Counts are read before and after and compared, never read back out of the thing under test.
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = "file://" + path.join(root, "mockups/missioncontrol.html");
const shots = process.argv.includes("--shots") ? path.join(root, ".claude/shots") : null;
if (shots) mkdirSync(shots, { recursive: true });

const mod = ["/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright/index.js",
  "/opt/homebrew/lib/node_modules/playwright/index.js",
  path.join(root, "node_modules/playwright/index.js")].find(existsSync);
if (!mod) { console.error("playwright not found"); process.exit(2); }
const pw = (await import(mod)).default ?? (await import(mod));
const cache = path.join(os.homedir(), "Library/Caches/ms-playwright");
const exe = ["chromium_headless_shell-1234", "chromium_headless_shell-1223"]
  .flatMap(d => ["chrome-headless-shell-mac-arm64", "chrome-headless-shell-mac-x64"].map(s => path.join(cache, d, s, "chrome-headless-shell")))
  .find(existsSync);

const browser = await pw.chromium.launch(exe ? { executablePath: exe } : {});
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
  ok(opened.hasRecpr, "a Context PR exists");
  ok(!(await page.evaluate(() => !!document.querySelector("#layer .dlg"))), "the wizard closed");
  ok(await page.evaluate(() => location.hash.endsWith("/steering")), "it landed on Steering, got " + await page.evaluate(() => location.hash));
  ok(await page.evaluate(() => S.tab.steering) === "prs", "on the Context PRs tab");
  ok(/^a-intel\/platform#\d+$/.test(opened.prNumber), "the PR has a number on the main repo, got " + opened.prNumber);
  ok(opened.prNumber !== "a-intel/platform#519", "and it is not the promoter's number");
  ok(/^ctx\./.test(opened.lineage), "the lineage is derived, got " + opened.lineage);

  // THE point: an open PR steers nothing.
  ok(opened.records === before.records, "Records is unchanged while the PR is open");
  ok(opened.bundleV === before.bundleV, "the bundle version is unchanged while the PR is open");
  ok(opened.bundleRules === before.bundleRules, "the bundle has no new rule while the PR is open");
  ok(opened.audit === before.audit, "nothing was audited as published while the PR is open");

  let txt = await pgText(page);
  ok(txt.includes(opened.prNumber), "the tab shows the new PR");
  ok(/Opened by/.test(txt), "the table says who opened each PR");
  ok(txt.includes("a-intel/platform#519"), "the promoter's PR is still listed beside it");
  ok(/What merge will do/.test(txt), "it says what merge will do, before it does it");
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
    "Conflict against active records", "constraint_effect"];
  checkNames.forEach(n => ok(txt.includes(n), "check listed: " + n));
  ok(/constraint_effect = forbid/.test(txt), "the constraint check reports this record's own effect");
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
  await page.evaluate(() => { S.tab.steering = "records"; S.prSel = null; go("#/a-intel/core-platform/steering"); });
  await page.waitForTimeout(400);
  ok((await pgText(page)).includes("hand-edit a generated migration"), "it appears in Published records");
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
  ok(/no Context PR yet|Open and recent/.test(await pgText(page)), "the tab falls back to the promoter's view");
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
  ok(!/constraint_effect = /.test(txt), "and claims no constraint_effect");
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

await browser.close();
console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
