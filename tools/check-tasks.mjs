#!/usr/bin/env node
// Walks the Tasks surface of mockups/missioncontrol.html in headless Chromium, in the order an operator
// meets it, and asserts what each step must show. The spec is docs/tasks-spec.md; the pages are
// mockups/pages/tasks.md, tasks-providers.md, task.md and work-order.md. check-mockup.mjs opens every
// page in every state; the wizard, the definition of done and the work order are interactions it never
// reaches.
//
//   node tools/check-tasks.mjs            # every flow
//   node tools/check-tasks.mjs --shots    # also write a screenshot per step to .claude/shots/tasks/
//
// The flows, in order:
//   1. connect Jira through the six-step wizard, create one value in Jira, leave one account not mapped,
//      and see it on Trackers
//  1b. connect ServiceNow with creation off, and see its column on Fields
//   2. draft a definition of done with the assistant, edit it, and certify it
//   3. a certified task that changes in its tracker is no longer ready
//   4. only ready tasks can be selected; the send menu lists only agents you operate, with harness marks
//   5. the work order merges every definition of done, drafts a prompt, resolves @ mentions, and will not
//      send until the repositories are confirmed; sending tags the tasks and opens the work order
//   6. a workflow chains stages and ends with a person; the builder drafts stages from a sentence
//   7. labels carry a colour and a mapping, a resolution can be created in a provider, and a claimed work
//      order can be accepted
//   8. the task and the work order each copy a prompt that names the other
// Every assertion names a string the surface is supposed to render, never a value read back out of
// the control under test.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { launchChromium } from "./lib/playwright.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = "file://" + path.join(root, "mockups/missioncontrol.html");
const shots = process.argv.includes("--shots") ? path.join(root, ".claude/shots/tasks") : null;
if (shots) mkdirSync(shots, { recursive: true });
const H = "#/a-intel/core-platform/tasks";

const browser = await launchChromium(root);
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log("FAIL " + m); } };

async function open(hash) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = [];
  page.on("pageerror", e => errs.push(String(e.message || e)));
  page.on("dialog", d => d.dismiss());
  await page.goto(FILE + "?product=1&state=loaded&mobile=0" + hash);
  await page.waitForTimeout(300);
  return { page, errs };
}
const text = async (page, sel = "#app") => (await page.evaluate(s => (document.querySelector(s)?.innerText || ""), sel)).replace(/\s+/g, " ");
const dlgText = page => text(page, "#layer .dlg");
const shot = async (page, name) => { if (shots) await page.screenshot({ path: path.join(shots, name + ".png") }); };
const footBtn = (page, label) => page.locator("#layer .dlg-f button", { hasText: label });
const done = async (page, errs, name) => { ok(errs.length === 0, `${name}: no JavaScript error (${errs.slice(0, 2).join(" | ")})`); await page.close(); };

/* 1. connecting Jira */
{
  const { page, errs } = await open(H + "/providers");
  let t = await text(page);
  ok(/GitHub/.test(t) && /Linear/.test(t), "providers: GitHub and Linear are connected");
  ok(/Jira/.test(t) && /Connect/.test(t), "providers: Jira is offered");
  ok((await page.locator(".ipl svg").count()) >= 3, "providers: every provider shows its logo as an SVG");
  await page.click("text=Connect an issue tracker");
  let d = await dlgText(page);
  ok(/Tracker Authorize Scope Fields People Review/.test(d.replace(/[0-9]/g, "").replace(/\s+/g, " ")) || (await page.locator(".wz-st").count()) === 6, "wizard: six steps");
  ok((await page.locator(".ipz-card").count()) === 6, "wizard: six providers to choose from");
  ok(/Issue trackers/.test(d) && /Help desks/.test(d) && /ServiceNow/.test(d) && /Salesforce/.test(d) && /Zendesk/.test(d), "wizard: offers the help desks beside the trackers");
  ok(await footBtn(page, "Next").isDisabled(), "wizard: Next waits for a choice");
  await page.click(".ipz-card >> nth=2");
  await footBtn(page, "Next").click();
  d = await dlgText(page);
  ok(/read:jira-work/.test(d) && /offline_access/.test(d), "wizard: Jira names the scopes it asks for");
  ok(/Create values in Jira/.test(d) && /manage:jira-configuration/.test(d), "wizard: creating values asks for the Jira admin scope");
  ok(/every write appears under the account that authorizes/.test(d), "wizard: says Jira writes carry the authorizing account");
  ok(/What it still cannot do/.test(d), "wizard: says what the token still cannot do");
  ok(/credential store/.test(d), "wizard: says where the token is kept");
  ok(await footBtn(page, "Next").isDisabled(), "wizard: Next waits for authorization");
  await page.click("text=Authorize with Atlassian");
  await page.waitForTimeout(900);
  ok(/Jira is authorized/.test(await dlgText(page)), "wizard: authorization lands");
  await shot(page, "01-authorize");
  await footBtn(page, "Next").click();
  ok(/OPS/.test(await dlgText(page)) && /JQL filter/.test(await dlgText(page)), "wizard: scope lists projects and a JQL filter");
  await footBtn(page, "Next").click();
  d = await dlgText(page);
  ok(/Statuses/.test(d) && /Resolutions/.test(d) && /Labels/.test(d), "wizard: maps statuses, resolutions and labels");
  ok(/issue type Bug/.test(d) && /priority Highest/.test(d), "wizard: suggests Jira values for the labels");
  ok(/Post the definition of done as a comment/.test(d), "wizard: write-back switches");
  ok(/Close the issue as Done when you accept the work/.test(d), "wizard: closing says Done");
  ok((await page.locator("#layer .dlg option", { hasText: /^Create “/ }).count()) >= 1, "wizard: a value Jira lacks can be created there");
  ok(/Only in Jira/.test(d) && /Add “security”/.test(d) && !/Add “Bug”/.test(d), "wizard: a value only Jira has can be added to Oxagen, and a mapped one is not offered");
  await page.selectOption('#layer .dlg select[aria-label="Chore"]', "__create");
  ok(/1 to create in Jira/.test(await dlgText(page)), "wizard: counts what it will create");
  await footBtn(page, "Next").click();
  d = await dlgText(page);
  ok(/Tobias Brennan/.test(d) && /Automation for Jira/.test(d), "wizard: lists the accounts in scope");
  ok(/never mapped/.test(d), "wizard: a bot is never mapped");
  await page.selectOption('select[aria-label="Member for Priya Natarajan"]', "");
  d = await dlgText(page);
  ok(/2 mapped, 2 not mapped/.test(d), "wizard: an account can be left not mapped (" + (d.match(/\d mapped, \d not mapped/) || [""])[0] + ")");
  await shot(page, "02-people");
  await footBtn(page, "Next").click();
  d = await dlgText(page);
  ok(/2 mapped, 2 not mapped/.test(d), "wizard: review repeats the mapping");
  ok(/Nothing is sent to an agent/.test(d), "wizard: review says nothing is sent to an agent");
  ok(/1 to create in Jira/.test(d) && /create_provider_value/.test(d), "wizard: review names the value it creates");
  await footBtn(page, "Connect Jira").click();
  await page.waitForTimeout(200);
  t = await text(page);
  ok(/a-intel\.atlassian\.net/.test(t) && /Jira Cloud site/.test(t), "providers: Jira is connected after the wizard");
  await page.click("text=People");
  await page.fill(".lt-q", "Jira");
  await page.waitForTimeout(100);
  t = await text(page);
  ok(/Automation for Jira/.test(t) && /not mapped/i.test(t), "people: the new accounts are listed, one not mapped");
  await done(page, errs, "connect");
}

/* 1b. connecting a help desk */
{
  const { page, errs } = await open(H + "/providers");
  await page.click("text=Connect an issue tracker");
  await page.click(".ipz-card >> text=ServiceNow");
  await footBtn(page, "Next").click();
  let d = await dlgText(page);
  ok(/Instance/.test(d) && /itil role/.test(d) && /personalize_choices role/.test(d), "help desk: ServiceNow names its instance, role, and the role creating needs");
  ok(/reply to a requester/.test(d) && /work note/.test(d), "help desk: says every work note is internal");
  await page.click("#ipzCreate");
  ok(!/personalize_choices role/.test(await text(page, "#layer .dlg table")), "help desk: turning creation off drops the admin role from the permissions");
  await page.click("text=Authorize with ServiceNow");
  await page.waitForTimeout(900);
  await footBtn(page, "Next").click();
  ok(/Assignment groups/.test(await dlgText(page)) && /open incidents/.test(await dlgText(page)), "help desk: scope lists assignment groups and incidents");
  await footBtn(page, "Next").click();
  d = await dlgText(page);
  ok(/Post the definition of done as a work note/.test(d) && /Close the incident as Done/.test(d), "help desk: writes use ServiceNow's words");
  ok(/email the caller/.test(d), "help desk: says resolving emails the caller");
  ok((await page.locator("#layer .dlg option", { hasText: /^Create “/ }).count()) === 0, "help desk: nothing to create once creation is off");
  await footBtn(page, "Next").click();
  d = await dlgText(page);
  ok(/requester/.test(d) && /never maps one/.test(d), "help desk: a requester is never mapped");
  await footBtn(page, "Next").click();
  await footBtn(page, "Connect ServiceNow").click();
  await page.waitForTimeout(200);
  ok(/a-intel\.service-now\.com/.test(await text(page)) && /ServiceNow instance/.test(await text(page)), "providers: ServiceNow is connected after the wizard");
  await page.click("text=Fields");
  await page.waitForTimeout(100);
  ok(/close code Solution provided/.test(await text(page)), "fields: a connected help desk gets its own column");
  await done(page, errs, "help desk");
}

/* 2. drafting and certifying a definition of done */
{
  const { page, errs } = await open(H + "/tsk_01K6SA3G9Z");
  let t = await text(page);
  ok(/oxagen\.assistant is reading the task/.test(t), "draft: a new task is being drafted");
  await page.click("text=Draft it now");
  await page.waitForTimeout(1200);
  t = await text(page);
  ok(/A draft\. Certify it to make this task ready/.test(t), "draft: the draft lands");
  ok(/one row per agent/.test((await page.locator(".dod-in").evaluateAll(xs => xs.map(x => x.value).join(" ")))), "draft: items from the task are drafted");
  await page.fill("#dodNew", "The export runs as a governed action");
  await page.click("text=Add item");
  ok((await page.locator(".dod-in").count()) >= 6, "draft: a person adds an item");
  await page.click("text=Certify definition of done");
  let d = await dlgText(page);
  ok(/The export runs as a governed action/.test(d), "certify: the dialog lists the added item");
  ok(/certify_task_dod/.test(d), "certify: names the governed action");
  ok(await footBtn(page, "Certify").isDisabled(), "certify: waits for I read every item");
  await page.check("#certOk");
  await footBtn(page, "Certify").click();
  t = await text(page);
  ok(/Certified by Marcus Bell/.test(t), "certify: the task is certified");
  ok(/\bready\b/i.test(await text(page, ".phead")) || /Send to an agent/.test(t), "certify: the task can be sent");
  await shot(page, "03-certified");
  await done(page, errs, "certify");
}

/* 3. changed since certification */
{
  const { page, errs } = await open(H + "/tsk_01K6SC1Y5M");
  const t = await text(page);
  ok(/The description changed after certification/.test(t), "changed: says why it is no longer ready");
  ok(/Certified against/.test(t) && /Now/.test(t), "changed: shows both versions");
  ok(/Changed since certified/.test(t) && /Certify definition of done/.test(t), "changed: offers to certify again");
  await done(page, errs, "changed");
}

/* 4 and 5. selecting, the send menu, and the work order */
{
  const { page, errs } = await open(H);
  ok(await page.locator("#dspBtn").isDisabled(), "send: disabled with nothing selected");
  ok(await page.locator('input[aria-label="Select a-intel/platform#633"]').isDisabled(), "send: a draft cannot be selected");
  await page.click('input[aria-label="Select a-intel/platform#612"]');
  await page.click('input[aria-label="Select PLAT-231"]');
  await page.click("#dspBtn");
  const menu = await text(page, ".dsp-menu");
  ok(/Send 2 tasks to/.test(menu), "send: the menu counts the selection");
  ok(/Bug fixer/.test(menu) && /Claude Code/.test(menu) && /Documenter/.test(menu) && /Cursor/.test(menu), "send: agents with their harness");
  ok(!/Docs writer/.test(menu), "send: an agent somebody else operates is not offered");
  ok((await page.locator(".dsp-menu .hx svg").count()) >= 4, "send: each agent carries its harness mark");
  ok(/Fix, validate, document, review/.test(menu), "send: published workflows are offered");
  await shot(page, "04-menu");
  await page.click(".dsp-i >> nth=0");
  let d = await dlgText(page);
  ok(/2 tasks to Bug fixer/.test(await text(page, "#layer .dlg-h")), "work order: names the tasks and the agent");
  ok(/8 items from 2 tasks/.test(d), "work order: merges both definitions of done");
  ok(/#612/.test(d) && /PLAT-231/.test(d), "work order: tags each item with its task");
  const prompt = await page.inputValue("#woPrompt");
  ok(/Definition of done/.test(prompt) && /claim_dod_item/.test(prompt), "work order: drafts a prompt with the items and the claim tool");
  ok(/ctx\.release\.never-merge/.test(await text(page, "#woRefs")), "work order: the drafted mention resolves to a context record");
  await page.click("#woPrompt");
  await page.keyboard.press("Control+End");
  await page.keyboard.type("\nHand review questions to @valid");
  ok(/@a-intel\.core\.validator/.test(await text(page, "#woMent")), "mention: @ offers matching agent profiles");
  await page.keyboard.press("Enter");
  ok(/@a-intel\.core\.validator /.test(await page.inputValue("#woPrompt")), "mention: Enter inserts the mention");
  ok(/Validator/.test(await text(page, "#woRefs")), "mention: the profile appears in References");
  await page.keyboard.type("and follow @ctx.platform.retry");
  await page.keyboard.press("Enter");
  ok(/ctx\.platform\.retry-budget/.test(await text(page, "#woRefs")), "mention: context records are mentionable too");
  ok(/outside Bug fixer/.test(await dlgText(page)), "repositories: one outside the agent's toolbelt is refused");
  ok(await page.locator("#woSend").isDisabled(), "send: waits for the repositories to be confirmed");
  await page.check("#woOk");
  ok(!(await page.locator("#woSend").isDisabled()), "send: enabled once confirmed");
  await shot(page, "05-work-order");
  await page.click("#woSend");
  await page.waitForTimeout(200);
  const t = await text(page);
  ok(/Sent by Marcus Bell/.test(t) && /Bug fixer/.test(t), "sent: the work order page opens");
  ok(/0 \/ 8/.test(t), "sent: nothing is claimed yet");
  ok(/Hand review questions to @a-intel\.core\.validator/.test(t), "sent: the prompt is kept as sent");
  await page.goto(FILE + "?product=1&state=loaded&mobile=0" + H + "/tsk_01K6S2M4QF");
  await page.waitForTimeout(200);
  ok(/in a work order/i.test(await text(page)), "sent: the task is tagged to the work order");
  await done(page, errs, "work order");
}

/* 6. workflows */
{
  const { page, errs } = await open(H);
  await page.click('input[aria-label="Select a-intel/platform#618"]');
  await page.click("#dspBtn");
  await page.click("text=Fix, validate, document, review");
  const d = await dlgText(page);
  ok(/fix/i.test(d) && /validate/i.test(d) && /document/i.test(d) && /review/i.test(d) && /accept/i.test(d) && (await page.locator("#layer .stage").count()) === 5, "workflow: five stages, the last a person");
  ok(/Validate/.test(await text(page, "#layer .dod-list")), "workflow: each item names the stage that owns it");
  await page.close();
  const w = await open(H + "/workflows");
  await w.page.click("text=New workflow");
  await w.page.fill("#wfDesc", "A bug fixer passes a fix to a validator, which passes it to a documenter, which passes it to an architect for final review.");
  await w.page.click('button[aria-label="Have the assistant draft the stages"]');
  const b = await dlgText(w.page);
  ok((await w.page.locator(".wf-st").count()) === 5, "builder: four drafted stages and the person");
  ok(/role = "Validate"/.test(b) && /max_returns = 2/.test(b), "builder: the file carries the stages and the return bound");
  ok(/by = "operator"/.test(b), "builder: the file ends with the operator");
  await footBtn(w.page, "Open pull request").click();
  ok(/In review/.test(await text(w.page)), "builder: a workflow exists as a pull request until it merges");
  await done(w.page, [...errs, ...w.errs], "workflow");
}

/* 7. labels and acceptance */
{
  const { page, errs } = await open(H + "/fields");
  const t = await text(page);
  ok(/P0/.test(t) && /P3/.test(t) && /New Feature/.test(t) && /Documentation/.test(t) && /Chore/.test(t), "fields: the default labels ship");
  ok((await page.locator("td b", { hasText: /^Done$/ }).count()) >= 1 && /Won't do/.test(t) && /Duplicate/.test(t) && /Canceled/.test(t) && /Other/.test(t), "fields: the default resolutions ship");
  ok(!/Won't fix|\bFixed\b/.test(t.replace(/Done, Fixed|Won't Do, Won't Fix/g, "")), "fields: no resolution is named Fixed or Won't fix");
  ok(/Open/.test(t) && /Blocked/.test(t) && /Closed/.test(t), "fields: the three status categories");
  await page.click("text=New Feature >> nth=0");
  const d = await dlgText(page);
  ok(/Definition of done items/.test(d) && (await page.locator('#layer .dlg [title="Coming soon"]').count()) >= 1, "label: definition-of-done items are marked coming soon");
  await page.click('button[aria-label="Color #9D8BE3"]');
  await footBtn(page, "Save label").click();
  ok(/#9D8BE3/.test(await text(page)), "label: the color is saved");
  await page.locator("td b", { hasText: /^Won't do$/ }).click();
  let r = await dlgText(page);
  ok(/Creating one needs write/.test(r), "resolution: Linear without the write scope says what creating needs");
  await page.click("#layer .dlg >> text=Create in GitHub");
  await footBtn(page, "Save resolution").click();
  ok(/create_provider_value for GitHub/.test(await text(page, "#toast")), "resolution: saving creates the value in GitHub");
  ok(/label Won't do/.test(await text(page)), "resolution: the GitHub mapping names the label Oxagen creates");
  await page.close();
  const w = await open(H + "/work-orders/wo_01K6TA2M");
  ok(!(await w.page.locator(".phead button", { hasText: "Accept all items" }).isDisabled()), "accept: enabled when every item is claimed");
  await w.page.click(".phead >> text=Accept all items");
  await footBtn(w.page, "Accept all items").click();
  ok(/3 \/ 3/.test(await text(w.page)) && /Accepted/.test(await text(w.page)), "accept: every item accepted");
  await done(w.page, [...errs, ...w.errs], "accept");
}

/* 8. copy prompt */
{
  // The clipboard of a headless file:// page refuses writes, so the check keeps what the page sends it.
  const grab = page => page.evaluate(() => {
    window.__copied = null;
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: t => { window.__copied = t; return Promise.resolve(); } } });
  });
  const copied = page => page.evaluate(() => window.__copied || "");
  const w = await open(H + "/work-orders/wo_01K6T9QX");
  await grab(w.page);
  await w.page.click(".phead >> text=Copy prompt");
  await w.page.waitForTimeout(100);
  let c = await copied(w.page);
  ok(/You have a work order from Marcus Bell/.test(c) && /claim_dod_item/.test(c), "copy: the work order copies the prompt as sent");
  ok(/Work order wo_01K6T9QX: Same-minute migration stamps/.test(c) && /sha256:ab41c7e09f3d2865/.test(c), "copy: the work order names itself and its digest");
  ok(/Task a-intel\/platform#587/.test(c) && /tsk_01K6SF2W6Q: https:\/\/app\.oxagen\.sh\/a-intel\/core-platform\/tasks\/tsk_01K6SF2W6Q/.test(c), "copy: the work order links its task");
  ok(/Prompt copied, with 1 task\./.test(await text(w.page, "#toast")), "copy: the work order toast counts the tasks");
  await done(w.page, w.errs, "copy work order");
  const t = await open(H + "/tsk_01K6SF2W6Q");
  await grab(t.page);
  await t.page.click(".phead >> text=Copy prompt");
  await t.page.waitForTimeout(100);
  c = await copied(t.page);
  ok(/Task a-intel\/platform#587/.test(c) && /https:\/\/github\.com\/a-intel\/platform\/issues\/587/.test(c), "copy: the task names its issue");
  ok(/Certified by Marcus Bell/.test(c) && /\[test\] A test covers a same-minute pair/.test(c), "copy: the task carries its certified definition of done");
  ok(/wo_01K6T9QX: Same-minute migration stamps/.test(c) && /tasks\/work-orders\/wo_01K6T9QX/.test(c), "copy: the task links its work order");
  ok(/Prompt copied, with 1 work order\./.test(await text(t.page, "#toast")), "copy: the task toast counts the work orders");
  await t.page.close();
  const d = await open(H + "/tsk_01K6S7C5PA");
  await grab(d.page);
  await d.page.click(".phead >> text=Copy prompt");
  await d.page.waitForTimeout(100);
  c = await copied(d.page);
  ok(/A draft\. Nobody has certified it\./.test(c) && !/Certified by/.test(c), "copy: a draft is not called certified");
  ok(/No work order carries this task/.test(c), "copy: a task in no work order says so");
  await done(d.page, [...t.errs, ...d.errs], "copy task");
}

await browser.close();
console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
