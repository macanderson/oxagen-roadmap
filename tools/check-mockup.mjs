#!/usr/bin/env node
// Opens mockups/missioncontrol.html in headless Chromium, once per view in mockups/catalog.mjs,
// and asserts each view is what its URL says: the page, in the state, in the shell, with nothing
// from the mockup chrome, which only ?debug=true brings back; then walks every guided scenario step by step.
//
//   node tools/check-mockup.mjs                    # every page × state × shell, then every scenario
//   node tools/check-mockup.mjs --only work-backlog # one page id, or one scenario id
//   node tools/check-mockup.mjs --pages            # pages only
//   node tools/check-mockup.mjs --scenarios        # scenarios only
//   node tools/check-mockup.mjs --shots out/       # also write a screenshot per view
//
// Per page view: no JavaScript error; PRODUCT is true and the #chrome bar, the scenario rail,
// the Scenarios nav item and every piece of onboarding-demo copy are gone; S.state and S.mobile
// are pinned to what the URL says; the state's own markup is on screen (the skeleton, the empty /
// error / denied panel, or a loaded page with a heading and no state panel); a mobile shell page
// has the thumb bar and never scrolls sideways. Then, on the loaded mobile workspace root (Work), the mobile
// shell's own guarantees: five thumb-bar slots at least 44 px tall in the bottom quarter, More
// opening as a full-width bottom sheet with the rest of the app in it, the drawer over a scrim
// that closes it, list tables as cards, every input 16 px or larger.
//
// Per scenario: step 1 opens, and for every step the rail is on screen and names the step, the
// page under it rendered, the step's act runs, Next closes any dialog the act opened and lands on
// the following step, no page error fired; then phone mode has no horizontal overflow and both
// themes render. A scenario that is missing fails; nothing skips.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { launchChromium } from "./lib/playwright.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// MOCKUP=future checks mockups/future_state_mockups (its own catalog and file); unset, the master.
const VERSION = process.env.MOCKUP === "future" ? "future_state_mockups" : "";
const CATALOG = VERSION ? `../mockups/${VERSION}/catalog.mjs` : "../mockups/catalog.mjs";
const { PAGES, SCENARIOS, mockupUrl, scenarioHash, ORG } = await import(CATALOG);
const FILE = "file://" + path.join(root, VERSION ? `mockups/${VERSION}/missioncontrol.html` : "mockups/missioncontrol.html");
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const shots = args.includes("--shots") ? args[args.indexOf("--shots") + 1] : null;
const doPages = !args.includes("--scenarios");
const doScenarios = !args.includes("--pages");
if (shots) mkdirSync(shots, { recursive: true });

const browser = await launchChromium(root);
let failures = 0, passes = 0;
const ok = (cond, msg) => { if (cond) passes++; else { failures++; console.log("FAIL " + msg); } };

const DESKTOP = { viewport: { width: 1440, height: 1000 } };
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const AUTH = /^(signup|verify-email|login|two-factor|forgot-password|reset-password|accept-invitation|installer)$/;
const GATE = /^(onboarding-|register-)/;

async function checkView(url, { state, mobile, shellPage, drawer, future, tag }) {
  const page = await browser.newPage(mobile ? MOBILE : DESKTOP);
  const errors = [];
  page.on("pageerror", e => errors.push(String(e.message || e)));
  page.on("dialog", d => d.dismiss());
  await page.goto("about:blank");
  await page.goto(url);
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
      apd: !!document.querySelector("#apdrawer.open"),
      asst: !!document.querySelector("#asst.open"),
      future: document.documentElement.classList.contains("show-future"),
      futureN: document.querySelectorAll("#app [data-future]").length,
      text: t,
      scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
      scen: !!document.querySelector(".scn"),
      exitDemo: /Exit demo|Onboarding demo|Clickable demo only|mockup-state bar/.test(t),
      navScenarios: !![].slice.call(document.querySelectorAll(".navitem")).find(b => /Scenarios/.test(b.textContent)),
      len: t.length,
    };
  });
  ok(errors.length === 0, `${tag}: no JS errors (${errors.slice(0, 2).join(" | ")})`);
  ok(!r.chrome && r.product, `${tag}: PRODUCT view without the #chrome bar`);
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
  if (drawer === "approvals") ok(r.apd, `${tag}: the Approvals drawer is open`);
  if (drawer === "stella") ok(r.asst, `${tag}: the Stella drawer is open`);
  if (future) ok(r.future && r.futureN > 0, `${tag}: future-only fields outlined (${r.futureN} marked)`);
  if (shots) await page.screenshot({ path: path.join(shots, tag.replace(/[^a-z0-9-]+/gi, "_") + ".png"), fullPage: false });
  await page.close();
}

if (doPages) {
  if (!only) {
    await checkView(mockupUrl(FILE, {}), { state: "loaded", mobile: null, shellPage: true, tag: "product" });
    await checkView(mockupUrl(FILE, { state: "loaded", mobile: false }), { state: "loaded", mobile: false, shellPage: true, tag: "product-desktop" });
    await checkView(mockupUrl(FILE, { state: "loaded", mobile: true }), { state: "loaded", mobile: true, shellPage: true, tag: "product-mobile" });
  }
  for (const p of PAGES) {
    if (only && only !== p.id) continue;
    const shellPage = !AUTH.test(p.id) && !GATE.test(p.id);
    for (const st of p.states) {
      await checkView(mockupUrl(FILE, { state: st, mobile: false, hash: p.hash, drawer: p.drawer }), { state: st, mobile: false, shellPage, drawer: p.drawer, tag: `${p.id}-${st}` });
      await checkView(mockupUrl(FILE, { state: st, mobile: true, hash: p.hash, drawer: p.drawer }), { state: st, mobile: true, shellPage, drawer: p.drawer, tag: `${p.id}-${st}-mobile` });
    }
    /* the future-only story: the same loaded view with every future-only field outlined and tagged */
    if (p.future) {
      await checkView(mockupUrl(FILE, { state: "loaded", mobile: false, hash: p.hash, future: true }), { state: "loaded", mobile: false, shellPage, future: true, tag: `${p.id}-loaded-future` });
    }
  }

  if (!only || only === "work-backlog") {
    const page = await browser.newPage(MOBILE);
    const errors = [];
    page.on("pageerror", e => errors.push(String(e.message || e)));
    await page.goto(mockupUrl(FILE, { state: "loaded", mobile: true }));
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
    ok(sheet && sheet.tiles >= 9, `mobile: More lists the rest of the app (${sheet && sheet.tiles} tiles)`);
    if (shots) await page.screenshot({ path: path.join(shots, "mobile-more-sheet.png") });
    await page.evaluate(() => closeDialog());
    await page.click(".hamburger");
    await page.waitForTimeout(200);
    const drawer = await page.evaluate(() => ({ scrim: !!document.querySelector(".side-scrim"), open: !!document.querySelector(".side.open") }));
    ok(drawer.scrim && drawer.open, `mobile: drawer opens over a scrim`);
    if (shots) await page.screenshot({ path: path.join(shots, "mobile-drawer.png") });
    await page.mouse.click(375, 500);
    await page.waitForTimeout(200);
    ok(!(await page.evaluate(() => !!document.querySelector(".side.open"))), `mobile: tapping the scrim closes the drawer`);
    ok(errors.length === 0, `mobile: no JS errors during nav (${errors.slice(0, 2).join(" | ")})`);
    await page.close();
  }
}

if (doScenarios) for (const s of SCENARIOS) {
  const id = s.id;
  if (only && only !== id) continue;
  const page = await browser.newPage(DESKTOP);
  const errors = [];
  page.on("pageerror", e => errors.push(String(e.message || e)));
  page.on("dialog", d => d.dismiss());
  await page.goto("about:blank");
  await page.goto(mockupUrl(FILE, { debug: true, hash: scenarioHash(s) }));
  await page.waitForTimeout(300);
  const meta = await page.evaluate(id => {
    const sc = SCENARIOS[id];
    return sc ? { slug: ORG.slug, ws: sc.ws, n: sc.steps.length, acts: sc.steps.map(x => x.act ? x.act[0] : null) } : null;
  }, id);
  ok(meta, `W${s.n}: SCENARIOS["${id}"] exists`);
  if (!meta) { await page.close(); continue; }
  ok(meta.ws === s.ws, `${id}: catalog workspace "${s.ws}" matches the scenario's "${meta.ws}"`);
  ok(meta.n >= 4 && meta.n <= 8, `${id}: 4-8 steps (has ${meta.n})`);
  for (let i = 1; i <= meta.n; i++) {
    const tag = `${id} step ${i}/${meta.n}`;
    const before = errors.length;
    await page.evaluate(h => { location.hash = h; }, `#/${meta.slug}/${meta.ws}/scenarios/${id}/${i}`);
    await page.waitForTimeout(250);
    const st = await page.evaluate(() => {
      const rail = document.querySelector(".scn");
      const app = document.getElementById("app");
      return { rail: !!rail, ct: rail ? (rail.querySelector(".scn-ct") || {}).textContent : null,
        body: app ? app.innerText.replace(/\s+/g, " ").length : 0, scn: S.scn };
    });
    ok(st.rail, `${tag}: scenario rail on screen`);
    ok(st.scn && st.scn.id === id && st.scn.step === i, `${tag}: S.scn is this step`);
    ok(st.ct && st.ct.trim().startsWith(i + " of " + meta.n), `${tag}: rail says "${i} of ${meta.n}" (says "${st.ct}")`);
    ok(st.body > 400, `${tag}: page under the rail rendered (${st.body} chars)`);
    if (shots) await page.screenshot({ path: path.join(shots, `${id}-${i}.png`) });
    if (meta.acts[i - 1]) {
      const label = meta.acts[i - 1];
      const clicked = await page.evaluate(label => {
        const b = [...document.querySelectorAll(".scn .scn-f button")].find(x => x.textContent.trim() === label);
        if (!b) return false; b.click(); return true;
      }, label);
      await page.waitForTimeout(250);
      ok(clicked, `${tag}: act button "${label}" is in the rail`);
      if (shots) await page.screenshot({ path: path.join(shots, `${id}-${i}-act.png`) });
      if (i < meta.n) {
        await page.evaluate(i => {
          if (S.scn && S.scn.step !== i) return;
          const b = [...document.querySelectorAll(".scn .scn-f button")].find(x => x.textContent.trim() === "Next");
          if (b) b.click();
        }, i);
        await page.waitForTimeout(250);
        const after = await page.evaluate(() => ({ dlg: S.dlg, step: S.scn && S.scn.step }));
        ok(after.step === i + 1, `${tag}: Next after the act lands on step ${i + 1} (on ${after.step})`);
        ok(!after.dlg, `${tag}: Next closed the act's dialog (still open: ${after.dlg})`);
      }
    }
    ok(errors.length === before, `${tag}: no page errors${errors.length > before ? " — " + errors.slice(before).join(" | ") : ""}`);
  }
  await page.evaluate(h => { location.hash = h; }, `#/${meta.slug}/${meta.ws}/scenarios/${id}/1`);
  await page.waitForTimeout(200);
  const phone = await page.evaluate(() => {
    S.phone = true; render();
    const pg = document.getElementById("pg") || document.getElementById("app");
    const over = pg ? pg.scrollWidth - pg.clientWidth : 0;
    S.phone = false; render();
    return over;
  });
  ok(phone <= 1, `${id}: no horizontal overflow in phone mode (${phone}px)`);
  for (const theme of ["dark", "light"]) {
    const before = errors.length;
    await page.evaluate(t => { document.documentElement.setAttribute("data-theme", t); render(); }, theme);
    ok(errors.length === before, `${id}: renders in ${theme} theme`);
  }
  console.log(`${errors.length ? "FAIL" : "ok  "} W${s.n} ${id}: ${meta.n} steps walked`);
  await page.close();
}

await browser.close();
console.log(`${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
