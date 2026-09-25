#!/usr/bin/env node
// Opens every view of the master mockup with component help on (?help=1) and fails when a page part
// carries a ? that no section of mockups/help/*.md answers. The review island (mockups/src/island.js)
// decides what a page part is and which key it carries; this reads the keys it put on screen.
//
//   node tools/check-help.mjs                  # every catalog page in every state, both shells, the drawers and the dialogs
//   node tools/check-help.mjs --only agents    # one catalog page id, or the dialogs whose kind contains the word
//   node tools/check-help.mjs --pages          # catalog pages only
//   node tools/check-help.mjs --dialogs        # drawers and dialogs only
//   node tools/check-help.mjs --list           # print every key found and where, not only the missing ones
//
// A dialog is opened by the first `openDialog('<kind>'[, '<arg>'])` the sources carry for it, on the
// route the catalog lists first for the workspace. A dialog that needs state that call does not set
// renders nothing and is reported as not opened, which is not a failure. A help section no view
// reached is listed as unreached, also not a failure: a tab's fallback or a dialog opened only
// from a flow lands there.
import { readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildMockup } from "./build-mockup.mjs";
import { launchChromium } from "./lib/playwright.mjs";
import { PAGES, mockupUrl, HOME } from "../mockups/catalog.mjs";
import { helpOpeners } from "./lib/review.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const doPages = !args.includes("--dialogs");
const doDialogs = !args.includes("--pages");
const list = args.includes("--list");

const FILE = path.join(os.tmpdir(), `check-help-${process.pid}.html`);
writeFileSync(FILE, buildMockup());
const URL0 = "file://" + FILE;

// Every dialog kind the sources open, with the argument of its first call.
const SRC = ["engine.js", "wedge.js"].map((f) => readFileSync(path.join(root, "mockups/src", f), "utf8")).join("\n");
const KINDS = new Map();
for (const m of SRC.matchAll(/openDialog\(\\?'([\w-]+)\\?'(?:\s*,\s*\\?'([^'\\]*)\\?')?/g)) if (!KINDS.has(m[1]) || (KINDS.get(m[1]) == null && m[2] != null)) KINDS.set(m[1], m[2] ?? null);
// The dialogs a function of their own opens: the creation wizards, the work order, the tracker
// connection wizard, the workflow editor, the avatar editor, and a frame.
const OPENERS = [
  ...[...new Set([...SRC.matchAll(/wzOpen\(\\?'(\w+)/g)].map((m) => m[1]))].map((k) => [`wizard ${k}`, `wzOpen(${JSON.stringify(k)})`, "wz"]),
  ["work order", "S.dspIds=[TASKS.filter(function(t){return t.status==='ready'||t.state==='ready';})[0]||TASKS[0]].map(function(t){return t.id;}); woOpen({kind:'agent',id:'a-intel.core.triage'})", "wo"],
  ["tracker wizard", "ipzOpen()", "ipwz"],
  ["workflow editor", "wfzOpen()", "wfnew"],
  ["avatar editor", "openAvatar('me')", null],
];

const browser = await launchChromium(root);
const seen = new Map();      // key → [where…]
const missing = new Map();   // key → [where…]
const reached = new Set();   // help sections a ? opened, after the fallback to the page's family
const notOpened = [];
const errors = [];
const note = (map, k, where) => { if (!map.has(k)) map.set(k, []); map.get(k).push(where); };

async function collect(page, where) {
  const found = await page.evaluate(() => [...document.querySelectorAll(".hq")].map((b) => [b.dataset.key, b.dataset.spec || null]));
  for (const [k, spec] of found) { note(seen, k, where); if (spec) reached.add(spec); else note(missing, k, where); }
  return found.length;
}

async function open(url, mobile) {
  const page = await browser.newPage(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 1000 } });
  page.setDefaultNavigationTimeout(120000);
  page.on("pageerror", (e) => errors.push(String(e.message || e)));
  page.on("dialog", (d) => d.dismiss());
  await page.goto(url);
  await page.waitForTimeout(300);
  return page;
}
const withHelp = (u) => u.replace(/\?/, "?help=1&");

if (doPages) {
  for (const p of PAGES) {
    if (only && only !== p.id) continue;
    for (const st of p.states) for (const mobile of [false, true]) {
      if (mobile && st !== "loaded") continue;
      const page = await open(withHelp(mockupUrl(URL0, { state: st, mobile, hash: p.hash, drawer: p.drawer })), mobile);
      const n = await collect(page, `${p.id} ${st}${mobile ? " mobile" : ""}`);
      if (!n) errors.push(`${p.id} ${st}: no ? on the page`);
      await page.close();
    }
  }
}

if (doDialogs && (!only || !PAGES.some((p) => p.id === only))) {
  const overlays = [["approvals drawer", "apdToggle(true)"], ["approval", "apdToggle(true); var p=apdPending()[0]; if(p) apdSelect(p.id)"], ["stella drawer", "asstToggle(true)"]]
    .filter(([n]) => !only || n.includes(only));
  for (const [name, js, kind] of OPENERS) if (!only || name.includes(only)) overlays.push([name, js, kind]);
  // A help section's `<!-- open: … -->` wins over the first call the sources carry.
  const told = new Map(helpOpeners(path.join(root, "mockups/help")).filter((o) => o.key.startsWith("dialog/")).map((o) => [o.key.slice(7), o.js]));
  for (const [kind, arg] of KINDS) {
    if (only && !kind.includes(only)) continue;
    overlays.push([`dialog ${kind}`, told.get(kind) || `openDialog(${JSON.stringify(kind)}${arg != null ? "," + JSON.stringify(arg) : ""})`, kind]);
  }
  for (const [kind, js] of told) if (!KINDS.has(kind) && !kind.startsWith("wz-") && (!only || kind.includes(only))) overlays.push([`dialog ${kind}`, js, kind]);
  const page = await open(withHelp(mockupUrl(URL0, { state: "loaded", mobile: false, hash: HOME + "/work" })), false);
  for (const [name, js, kind] of overlays) {
    await page.evaluate(() => { try { if (S.dlg) { S.dlg = null; S.dlgArg = null; S.dlgBack = null; } if (S.apd) S.apd.open = false; if (typeof asstToggle === "function") asstToggle(false); location.hash = "#/a-intel/core-platform/work"; render(); } catch (e) {} });
    await page.waitForTimeout(60);
    try { await page.evaluate(js); } catch (e) { notOpened.push(`${name} (${e.message.split("\n")[0]})`); continue; }
    await page.waitForTimeout(120);
    const shown = await page.evaluate((k) => (k ? S.dlg === k && !!document.querySelector("#layer .scrim, #layer [role=dialog]") : true), kind || null);
    if (!shown) { notOpened.push(name); continue; }
    await collect(page, name);
  }
  await page.close();
}
await browser.close();

const H = JSON.parse(/var REVIEW=(\{.*\});\n/.exec(readFileSync(FILE, "utf8"))[1]).help;
const unreached = Object.keys(H).filter((k) => !reached.has(k));

if (list) for (const [k, w] of [...seen].sort()) console.log(`${missing.has(k) ? "MISS" : "ok  "} ${k}  (${w[0]}${w.length > 1 ? ` +${w.length - 1}` : ""})`);
for (const [k, w] of [...missing].sort()) console.log(`MISSING ${k}  (${w[0]}${w.length > 1 ? ` +${w.length - 1} more` : ""})`);
if (notOpened.length) console.log(`\nnot opened (${notOpened.length}): ${notOpened.join(", ")}`);
if (unreached.length && !only) console.log(`\nunreached help sections (${unreached.length}): ${unreached.join(", ")}`);
for (const e of [...new Set(errors)]) console.log("PAGE ERROR " + e);
console.log(`\n${seen.size} keys on screen, ${missing.size} without a spec, ${Object.keys(H).length} help sections, ${errors.length} page errors`);
process.exit(missing.size || errors.length ? 1 : 0);
