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
//   1. connect Jira through the six-step wizard, leave one account not mapped, and see it on Providers
//   2. draft a definition of done with the assistant, edit it, and certify it
//   3. a certified task that changes upstream leaves ready
//   4. only ready tasks can be selected; the send menu lists only agents you operate, with harness marks
//   5. the work order merges every definition of done, drafts a prompt, resolves @ mentions, and will not
//      send until the repositories are confirmed; sending tags the tasks and opens the work order
//   6. a workflow chains stages and ends with a person; the builder drafts stages from a sentence
//   7. labels carry a colour and a mapping, and a claimed work order can be accepted
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
  await page.click("text=Connect an issue provider");
  let d = await dlgText(page);
  ok(/Provider Authorize Scope Fields People Review/.test(d.replace(/[0-9]/g, "").replace(/\s+/g, " ")) || (await page.locator(".wz-st").count()) === 6, "wizard: six steps");
  ok((await page.locator(".ipz-card").count()) === 3, "wizard: three providers to choose from");
  ok(await footBtn(page, "Next").isDisabled(), "wizard: Next waits for a choice");
  await page.click(".ipz-card >> nth=2");
  await footBtn(page, "Next").click();
  d = await dlgText(page);
  ok(/read:jira-work/.test(d) && /offline_access/.test(d), "wizard: Jira names the scopes it asks for");
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
  await footBtn(page, "Connect Jira").click();
  await page.waitForTimeout(200);
  t = await text(page);
  ok(/a-intel\.atlassian\.net/.test(t) && /Jira Cloud site/.test(t), "providers: Jira is connected after the wizard");
  await page.click("text=People");
  await page.fill(".lt-q", "Jira");
  await page.waitForTimeout(100);
  t = await text(page);
  ok(/Automation for Jira/.test(t) && /not mapped/.test(t), "people: the new accounts are listed, one not mapped");
  await done(page, errs, "connect");
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
  ok(/ready/.test(await text(page, ".phead")) || /Create work order and send to agent/.test(t), "certify: the task can be sent");
  await shot(page, "03-certified");
  await done(page, errs, "certify");
}

/* 3. changed since certification */
{
  const { page, errs } = await open(H + "/tsk_01K6SC1Y5M");
  const t = await text(page);
  ok(/The description changed after certification/.test(t), "changed: says why it left ready");
  ok(/Certified against/.test(t) && /Now/.test(t), "changed: shows both versions");
  ok(/Certify again/.test(t), "changed: offers to certify again");
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
  ok(/in a work order/.test(await text(page)), "sent: the task is tagged to the work order");
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
  ok(/pull request open/.test(await text(w.page)), "builder: a workflow exists as a pull request until it merges");
  await done(w.page, [...errs, ...w.errs], "workflow");
}

/* 7. labels and acceptance */
{
  const { page, errs } = await open(H + "/fields");
  const t = await text(page);
  ok(/P0/.test(t) && /P3/.test(t) && /New Feature/.test(t) && /Documentation/.test(t) && /Chore/.test(t), "fields: the default labels ship");
  ok(/Fixed/.test(t) && /Won't fix/.test(t) && /Duplicate/.test(t) && /Cancelled/.test(t) && /Other/.test(t), "fields: the default resolutions ship");
  ok(/Open/.test(t) && /Blocked/.test(t) && /Closed/.test(t), "fields: the three status categories");
  await page.click("text=New Feature >> nth=0");
  const d = await dlgText(page);
  ok(/A label will carry definition-of-done items/.test(d), "label: says labels will carry definition-of-done items");
  await page.click('button[aria-label="Colour #9D8BE3"]');
  await footBtn(page, "Save label").click();
  ok(/#9D8BE3/.test(await text(page)), "label: the colour is saved");
  await page.close();
  const w = await open(H + "/work-orders/wo_01K6TA2M");
  ok(!(await w.page.locator(".phead button", { hasText: "Accept the work" }).isDisabled()), "accept: enabled when every item is claimed");
  await w.page.click(".phead >> text=Accept the work");
  await footBtn(w.page, "Accept every item").click();
  ok(/3 \/ 3/.test(await text(w.page)) && /accepted/.test(await text(w.page)), "accept: every item accepted");
  await done(w.page, [...errs, ...w.errs], "accept");
}

await browser.close();
console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
