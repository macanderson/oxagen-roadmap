#!/usr/bin/env node
// Walks every guided scenario in mc.html the way a presenter would, in a real browser.
//
//   node tools/check-scenarios.mjs [mc.html] [--only id] [--shots DIR]
//
// For each W flow in tools/build-w.mjs it opens step 1, and for every step asserts: no page
// error, the scenario rail is on screen and names the step it is on, the page under it rendered
// something, the step's act (if any) runs without an error, a dialog the act opened is closed by
// Next, and Next lands on the following step. Then it checks phone mode has no horizontal
// overflow and both themes render. A scenario that is missing fails; nothing skips.
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { W } from "./build-w.mjs";

const args = process.argv.slice(2);
const file = path.resolve(args[0] && !args[0].startsWith("--") ? args[0] : "mc.html");
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
const ok = (cond, msg) => { if (cond) { passes++; } else { failures++; console.log("FAIL " + msg); } };

for (const [wfile, id] of W) {
  if (only && only !== id) continue;
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e.message || e)));
  page.on("dialog", d => d.dismiss());
  await page.goto("file://" + file);
  await page.waitForTimeout(300);
  const meta = await page.evaluate(id => {
    const s = SCENARIOS[id];
    return s ? { ws: s.ws, n: s.steps.length, acts: s.steps.map(x => x.act ? x.act[0] : null) } : null;
  }, id);
  ok(meta, `${wfile}: SCENARIOS["${id}"] exists`);
  if (!meta) { await page.close(); continue; }
  ok(meta.n >= 4 && meta.n <= 8, `${id}: 4-8 steps (has ${meta.n})`);
  for (let i = 1; i <= meta.n; i++) {
    const tag = `${id} step ${i}/${meta.n}`;
    const before = errors.length;
    await page.evaluate(h => { location.hash = h; }, `#/acme/${meta.ws}/scenarios/${id}/${i}`);
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
        await page.evaluate(() => {
          const b = [...document.querySelectorAll(".scn .scn-f button")].find(x => x.textContent.trim() === "Next");
          if (b) b.click();
        });
        await page.waitForTimeout(250);
        const after = await page.evaluate(() => ({ dlg: S.dlg, step: S.scn && S.scn.step }));
        ok(after.step === i + 1, `${tag}: Next after the act lands on step ${i + 1} (on ${after.step})`);
        ok(!after.dlg, `${tag}: Next closed the act's dialog (still open: ${after.dlg})`);
      }
    }
    ok(errors.length === before, `${tag}: no page errors${errors.length > before ? " — " + errors.slice(before).join(" | ") : ""}`);
  }
  // phone and themes on step 1
  await page.evaluate(h => { location.hash = h; }, `#/acme/${meta.ws}/scenarios/${id}/1`);
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
  console.log(`${errors.length ? "FAIL" : "ok  "} ${id}: ${meta.n} steps walked`);
  await page.close();
}
await browser.close();
console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
