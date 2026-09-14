#!/usr/bin/env node
// Opens every file tools/build-pages.mjs generates in headless Chromium and asserts that it is what
// its name says: the page, in the state, in the shell, with nothing from the mockup chrome left in.
//
//   node tools/check-pages.mjs                 # every page file, desktop and mobile
//   node tools/check-pages.mjs --only fleet    # one page id
//   node tools/check-pages.mjs --shots out/    # also write a screenshot per file
//
// Per file: no JavaScript error; the state's own markup is on screen (skeleton, the empty / error /
// denied panel, or the loaded page with a heading); the thumb bar is present on a mobile shell
// page and absent on desktop; the #chrome bar, the scenario rail and "Exit demo" are gone; and a
// mobile page never scrolls sideways. The three consolidated files are checked the same way.
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { PAGES } from "./build-pages.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const shots = args.includes("--shots") ? args[args.indexOf("--shots") + 1] : null;
if (shots) mkdirSync(shots, { recursive: true });

const mod = ["/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright/index.js",
  "/opt/homebrew/lib/node_modules/playwright/index.js"].find(existsSync);
if (!mod) { console.error("playwright not found"); process.exit(2); }
const pw = (await import(mod)).default ?? (await import(mod));
const cache = path.join(os.homedir(), "Library/Caches/ms-playwright");
const exe = ["chromium_headless_shell-1234", "chromium_headless_shell-1223"]
  .flatMap(d => ["chrome-headless-shell-mac-arm64", "chrome-headless-shell-mac-x64"].map(s => path.join(cache, d, s, "chrome-headless-shell")))
  .find(existsSync);

const browser = await pw.chromium.launch(exe ? { executablePath: exe } : {});
let failures = 0, passes = 0;
const ok = (cond, msg) => { if (cond) passes++; else { failures++; console.log("FAIL " + msg); } };

const DESKTOP = { viewport: { width: 1440, height: 1000 } };
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const AUTH = /^(signup|verify-email|login|two-factor|forgot-password|reset-password|accept-invitation|installer)$/;
const GATE = /^(onboarding-|register-)/;

async function checkFile(file, { state, mobile, shellPage, tag }) {
  const page = await browser.newPage(mobile ? MOBILE : DESKTOP);
  const errors = [];
  page.on("pageerror", e => errors.push(String(e.message || e)));
  page.on("dialog", d => d.dismiss());
  await page.goto("file://" + path.join(root, file));
  await page.waitForTimeout(350);
  const r = await page.evaluate(() => {
    const app = document.getElementById("app");
    const t = app ? app.innerText.replace(/\s+/g, " ") : "";
    return {
      chrome: !!document.getElementById("chrome"),
      product: typeof PRODUCT !== "undefined" && PRODUCT === true,
      state: typeof S !== "undefined" ? S.state : null,
      mobileFlag: typeof S !== "undefined" ? S.mobile : null,
      vp: (document.getElementById("viewport") || {}).className || "",
      mnav: !!document.querySelector(".mnav"),
      skeleton: !!document.querySelector(".sk"),
      stateWrap: !!document.querySelector(".state-wrap"),
      regErr: !!document.querySelector(".reg-err,.ob-err,.ob-state.deny"),
      spin: !!document.querySelector(".ob-spin,[aria-disabled='true'].primary"),
      h1: !!app && !!app.querySelector("h1,h2"),
      text: t,
      scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
      scen: !!document.querySelector(".scn"),
      exitDemo: /Exit demo|Onboarding demo|Clickable demo only|mockup-state bar/.test(t),
      navScenarios: !![].slice.call(document.querySelectorAll(".navitem")).find(b => /Scenarios/.test(b.textContent)),
      len: t.length,
    };
  });
  ok(errors.length === 0, `${tag}: no JS errors (${errors.slice(0, 2).join(" | ")})`);
  ok(!r.chrome && r.product, `${tag}: PRODUCT build without the #chrome bar`);
  ok(!r.scen && !r.exitDemo && !r.navScenarios, `${tag}: no scenario rail, Scenarios nav item or onboarding-demo copy`);
  ok(r.len > 40, `${tag}: renders something (${r.len} chars)`);
  if (state) ok(r.state === state, `${tag}: S.state pinned to ${state} (is ${r.state})`);
  if (mobile != null) {
    ok(r.mobileFlag === mobile, `${tag}: S.mobile pinned to ${mobile} (is ${r.mobileFlag})`);
    ok(mobile ? /\bmobile\b/.test(r.vp) && /\bphone\b/.test(r.vp) : r.vp === "", `${tag}: viewport class "${r.vp}"`);
    if (shellPage) ok(r.mnav === mobile, `${tag}: thumb bar ${mobile ? "present" : "absent"}`);
    if (mobile) ok(r.scrollW <= r.innerW + 1, `${tag}: no sideways scroll (${r.scrollW} > ${r.innerW})`);
  }
  if (state === "loading") ok(r.skeleton || r.spin, `${tag}: skeleton or busy control on screen`);
  if (state === "empty") ok(r.stateWrap && /No |never|Nothing|no frames|no workspaces|no runs/i.test(r.text), `${tag}: empty panel`);
  if (state === "error") ok((r.stateWrap && /could not be loaded/.test(r.text)) || r.regErr, `${tag}: error panel`);
  if (state === "denied") ok((r.stateWrap && /You cannot see/.test(r.text)) || r.regErr, `${tag}: denied panel`);
  if (state === "loaded") ok(r.h1 && !r.stateWrap && !r.skeleton, `${tag}: loaded page with a heading and no state panel`);
  if (shots) await page.screenshot({ path: path.join(shots, file.replace(/[\/]/g, "_").replace(/\.html$/, ".png")), fullPage: false });
  await page.close();
}

for (const [file, cfg] of [
  ["consolidated.html", { state: "loaded", mobile: null, shellPage: true, tag: "consolidated.html" }],
  ["consolidated-loaded.html", { state: "loaded", mobile: false, shellPage: true, tag: "consolidated-loaded.html" }],
  ["consolidated-loaded-mobile.html", { state: "loaded", mobile: true, shellPage: true, tag: "consolidated-loaded-mobile.html" }],
]) { if (!only) await checkFile(file, cfg); }

for (const p of PAGES) {
  if (only && only !== p.id) continue;
  const shellPage = !AUTH.test(p.id) && !GATE.test(p.id);
  for (const st of p.states) {
    await checkFile(`pages/${p.id}-${st}.html`, { state: st, mobile: false, shellPage, tag: `${p.id}-${st}` });
    await checkFile(`pages/${p.id}-${st}-mobile.html`, { state: st, mobile: true, shellPage, tag: `${p.id}-${st}-mobile` });
  }
}

// The mobile shell's own guarantees, on the loaded fleet: every thumb-bar slot is at least 44px
// tall and sits in the bottom quarter of the screen; More opens a sheet from the bottom edge;
// the drawer opens with a scrim behind it; a list table has become cards.
if (!only || only === "fleet") {
  const page = await browser.newPage(MOBILE);
  const errors = [];
  page.on("pageerror", e => errors.push(String(e.message || e)));
  await page.goto("file://" + path.join(root, "consolidated-loaded-mobile.html"));
  await page.waitForTimeout(350);
  const m = await page.evaluate(() => {
    const slots = [].slice.call(document.querySelectorAll(".mnav .mn")).map(b => b.getBoundingClientRect());
    const cards = document.querySelectorAll("#pg table.cards").length, tables = document.querySelectorAll("#pg table").length;
    return { n: slots.length, minH: Math.min(...slots.map(s => s.height)), top: Math.min(...slots.map(s => s.top)), h: innerHeight, cards, tables,
      inputs: [].slice.call(document.querySelectorAll("#pg input,#pg select")).every(i => parseFloat(getComputedStyle(i).fontSize) >= 16) };
  });
  ok(m.n === 5, `mobile: five thumb-bar slots (${m.n})`);
  ok(m.minH >= 44, `mobile: every slot ≥ 44px (${m.minH})`);
  ok(m.top >= m.h * 0.75, `mobile: bar in the bottom quarter (top ${m.top} of ${m.h})`);
  ok(m.tables === 0 || m.cards > 0, `mobile: list tables render as cards (${m.cards}/${m.tables})`);
  ok(m.inputs, `mobile: every input is 16px or larger (no iOS focus zoom)`);
  await page.click(".mnav .mn:last-child");
  await page.waitForTimeout(350);
  const sheet = await page.evaluate(() => {
    const d = document.querySelector("#layer .dlg"); if (!d) return null;
    const r = d.getBoundingClientRect();
    return { bottom: Math.round(r.bottom), h: innerHeight, tiles: d.querySelectorAll(".mtile").length, w: Math.round(r.width), iw: innerWidth };
  });
  ok(sheet && sheet.bottom >= sheet.h - 1 && sheet.w === sheet.iw, `mobile: More is a full-width sheet on the bottom edge (${JSON.stringify(sheet)})`);
  ok(sheet && sheet.tiles >= 10, `mobile: More lists the rest of the app (${sheet && sheet.tiles} tiles)`);
  if (shots) await page.screenshot({ path: path.join(shots, "mobile-more-sheet.png") });
  await page.evaluate(() => closeDialog());
  await page.click(".hamburger");
  await page.waitForTimeout(200);
  const drawer = await page.evaluate(() => ({ scrim: !!document.querySelector(".side-scrim"), open: !!document.querySelector(".side.open") }));
  ok(drawer.scrim && drawer.open, `mobile: drawer opens over a scrim`);
  if (shots) await page.screenshot({ path: path.join(shots, "mobile-drawer.png") });
  await page.mouse.click(375, 500); /* the scrim, to the right of the 300px drawer */
  await page.waitForTimeout(200);
  ok(!(await page.evaluate(() => !!document.querySelector(".side.open"))), `mobile: tapping the scrim closes the drawer`);
  ok(errors.length === 0, `mobile: no JS errors during nav (${errors.slice(0, 2).join(" | ")})`);
  await page.close();
}

await browser.close();
console.log(`${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
