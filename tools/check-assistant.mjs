#!/usr/bin/env node
// The in-app agent (spec §4.4) and the organization's model key (§4.5) in headless Chromium.
// check-mockup.mjs opens pages and check-creation.mjs opens dialogs; the assistant is neither — it
// is a permanent host beside #layer that render() reclasses but never rebuilds, which is exactly
// the property most likely to be broken by someone tidying render().
//
//   node tools/check-assistant.mjs           # the flyout, its states, the key, reconciliation
//   node tools/check-assistant.mjs --shots   # also write a screenshot per state to .claude/shots/
//
// The load-bearing assertions, and why each is here rather than assumed:
//   * a half-typed message survives a re-render — the whole reason the host is permanent
//   * the host is the same DOM node across renders — a rebuilt node cannot run a CSS transition
//   * the assistant's turn never links into the tenant's run index — its runs are Oxagen's
//   * with no key the panel refuses by name and charges nothing, rather than degrading quietly
//   * reconciliation shows two independent numbers, not one derived from the other
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

async function open(hash = "#/a-intel/core-platform", opts = {}) {
  const page = await browser.newPage(opts.mobile
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 1000 } });
  const errs = [];
  page.on("pageerror", e => errs.push(String(e.message || e)));
  page.on("dialog", d => d.dismiss());
  await page.goto(FILE + "?product=1&island=0&state=loaded&mobile=" + (opts.mobile ? 1 : 0) + (opts.theme ? "&theme=" + opts.theme : "") + hash);
  await page.waitForTimeout(350);
  return { page, errs };
}
const host = async page => await page.evaluate(() => {
  const a = document.getElementById("asst");
  if (!a) return null;
  const l = document.querySelector(".asst-launch");
  return {
    open: a.classList.contains("open"),
    hidden: a.getAttribute("aria-hidden"),
    inert: a.hasAttribute("inert"),
    launcher: !!l,
    expanded: l ? l.getAttribute("aria-expanded") : null,
    launcherText: l ? l.innerText.replace(/\s+/g, " ") : "",
    text: a.innerText.replace(/\s+/g, " "),
    disabled: !!a.querySelector("textarea[disabled]"),
    links: [...a.querySelectorAll("a[href]")].map(x => x.getAttribute("href")),
    zPanel: getComputedStyle(a).zIndex,
    zSide: (() => { const s = document.querySelector(".side"); return s ? getComputedStyle(s).zIndex : null; })(),
    closeGap: (() => { const hd = a.querySelector(".asst-h"), x = hd && hd.querySelector(".iconbtn");
      return hd && x ? Math.round(hd.getBoundingClientRect().right - x.getBoundingClientRect().right) : -1; })(),
  };
});
const shot = async (page, name) => { if (shots) await page.screenshot({ path: path.join(shots, name + ".png") }); };

/* ---------------- it exists, it is closed, and it opens ---------------- */
{
  const { page, errs } = await open();
  let h = await host(page);
  ok(h, "the host exists beside #layer");
  ok(h.launcher, "the sidebar carries the launcher");
  ok(!h.open && h.hidden === "true" && h.inert, "closed by default: no .open, aria-hidden, inert");
  ok(h.expanded === "false", "the launcher reports collapsed");
  ok(/oxagen’s in-app AI assistant/.test(h.launcherText), "the launcher's second line says whose agent it is, got " + h.launcherText);
  ok(!/engine down|no model key/i.test(h.launcherText), "a healthy launcher carries no fault line, got " + h.launcherText);
  ok(!(await page.$(".asst-launch .asst-g.bad")), "a healthy launcher carries no fault dot");
  // tucked behind the rail rather than over it
  ok(Number(h.zPanel) < Number(h.zSide), "the panel paints under the rail (" + h.zPanel + " < " + h.zSide + ")");

  const ctls = await page.evaluate(() => [...document.querySelectorAll('[aria-controls="asst"]')]
    .map(x => (x.closest(".top") ? "top" : x.closest(".side") ? "side" : "loose")));
  ok(ctls.length === 1 && ctls[0] === "side", "the sidebar launcher is the only way in, got " + ctls.join(","));

  await page.evaluate(() => document.querySelector(".asst-launch").click());
  await page.waitForTimeout(450);
  h = await host(page);
  ok(h.open && h.hidden === "false" && !h.inert, "opening sets .open, unhides and un-inerts");
  ok(h.expanded === "true", "the launcher reports expanded");
  const focused = await page.evaluate(() => document.activeElement && document.activeElement.tagName === "TEXTAREA");
  ok(focused, "focus lands in the message box");
  await shot(page, "asst-open");

  /* the reason the host is permanent: a half-typed message must survive a re-render */
  await page.evaluate(() => { window.__n = document.getElementById("asst"); });
  await page.evaluate(() => { document.querySelector("#asst textarea").value = "half a question about run_01K5"; });
  await page.evaluate(() => render());
  await page.waitForTimeout(200);
  const kept = await page.evaluate(() => document.querySelector("#asst textarea").value);
  ok(kept === "half a question about run_01K5", "a half-typed message survives a re-render, got " + JSON.stringify(kept));
  const same = await page.evaluate(() => window.__n === document.getElementById("asst"));
  ok(same, "the host is the same DOM node after a render — a rebuilt node cannot run the transition");

  /* its runs are Oxagen's: nothing in the panel links into the tenant's run index by the turn id */
  ok(!h.links.some(x => /runs\/run_01K5RT9X4M2/.test(x)), "the turn id is not a link into the tenant's run index");
  const badge = await page.evaluate(() => document.querySelector("#asst .msg .who .b")?.textContent || "");
  ok(/oxagen’s run/i.test(badge), "the turn badge says whose run it is, got " + badge);

  /* Escape closes it, and does not fall through to a route change */
  const before = await page.evaluate(() => location.hash);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  h = await host(page);
  ok(!h.open && h.inert, "Escape closes the panel");
  ok(await page.evaluate(() => location.hash) === before, "Escape did not also change the route");
  ok(errs.length === 0, "open/close errors: " + errs.join(" | "));
  await page.close();
}

/* ---------------- the engine is a required service ---------------- */
{
  const { page, errs } = await open();
  await page.evaluate(() => { S.asstEngine = "down"; asstToggle(true); });
  await page.waitForTimeout(400);
  const h = await host(page);
  ok(/not answering/i.test(h.text), "engine down: the panel says so by name");
  ok(/503/.test(h.text), "engine down: it names the code");
  ok(h.disabled, "engine down: the message box is disabled rather than accepting a turn that cannot run");
  ok(/engine down/i.test(h.launcherText), "engine down: the launcher says so too, got " + h.launcherText);
  ok(!!(await page.$(".asst-launch .asst-g.bad")), "engine down: the launcher mark carries the fault dot");
  ok(h.closeGap >= 0 && h.closeGap <= 20, "engine down: the close button sits at the right edge, " + h.closeGap + "px in");
  await shot(page, "asst-engine-down");
  await page.evaluate(() => { [...document.querySelectorAll("#asst .btn")].find(b => /Retry/.test(b.textContent)).click(); });
  await page.waitForTimeout(300);
  ok(/Narrow its toolbelt/.test((await host(page)).text), "Retry brings the conversation back");
  ok(errs.length === 0, "engine-down errors: " + errs.join(" | "));
  await page.close();
}

/* ---------------- no model key: it refuses by name and charges nothing ---------------- */
{
  const { page, errs } = await open();
  await page.evaluate(() => { ORG_KEY.source = "none"; ORG_KEY.provisionedId = null; asstToggle(true); });
  await page.waitForTimeout(400);
  const h = await host(page);
  ok(/no model key/i.test(h.text) || /has no model key/i.test(h.text), "no key: the panel says so");
  ok(/nothing has been charged/i.test(h.text), "no key: it says nothing was charged");
  ok(h.disabled, "no key: the message box is disabled");
  ok(/no model key/i.test(h.launcherText), "no key: the launcher says so, got " + h.launcherText);
  ok(!!(await page.$(".asst-launch .asst-g.bad")), "no key: the launcher mark carries the fault dot");
  ok(h.closeGap >= 0 && h.closeGap <= 20, "no key: the close button sits at the right edge, " + h.closeGap + "px in");
  await shot(page, "asst-no-key");
  ok(errs.length === 0, "no-key errors: " + errs.join(" | "));
  await page.close();
}

/* ---------------- the organization's funding source, and what it is for ---------------- */
{
  const { page, errs } = await open("#/a-intel");
  await page.evaluate(() => { S.tab.organization = "funding"; render(); });
  await page.waitForTimeout(350);
  const r = await page.evaluate(() => {
    const p = [...document.querySelectorAll("#pg .panel")].find(x => /Funding source/.test(x.querySelector(".panel-h h3")?.textContent || ""));
    return { found: !!p, text: p ? p.innerText.replace(/\s+/g, " ") : "" };
  });
  ok(r.found, "the funding tab carries a Funding source panel");
  ok(/platform_minted/.test(r.text), "it names the minted source");
  ok(/sk-or-v1-a3f1/.test(r.text) && !/sk-or-v1-a3f1\w{8}/.test(r.text), "it shows a prefix, not a secret");
  // That the secret is never returned is in the Funding source help, not on the panel.
  ok(!/never returned/.test(r.text), "the panel leaves the explanation to the component help");
  ok(/key_01K5RW8Q2N/.test(r.text), "it shows the provisioned id reconciliation joins on");
  ok(/Reconciliation/i.test(r.text), "it carries the reconciliation block");
  ok(/OpenRouter reports/.test(r.text) && /credit ledger/.test(r.text), "reconciliation names two independent sources");
  ok(/engine\.oxagen\.sh/.test(r.text), "it names the engine the key is spent through");
  await shot(page, "org-funding-source");

  // Each dialog says what its action does; mintkey shows the request it writes.
  for (const [dlg, want] of [["mintkey", /POST https:\/\/openrouter\.ai\/api\/v1\/keys/], ["rotateorgkey", /Rotation/i], ["revokeorgkey", /stops for everyone/i]]) {
    await page.evaluate(k => openDialog(k), dlg);
    await page.waitForTimeout(200);
    const b = await page.evaluate(() => document.querySelector("#layer .dlg")?.innerText.replace(/\s+/g, " ") || "");
    ok(want.test(b), dlg + ": its dialog explains what it does, got " + b.slice(0, 90));
    await page.evaluate(() => closeDialog());
    await page.waitForTimeout(120);
  }
  // the panel itself carries the picker, and picking customer_key asks for a key
  const src = await page.evaluate(() => {
    const sel = document.getElementById("orgFundSrc");
    return sel ? { opts: [...sel.options].map(o => o.value), on: sel.value } : null;
  });
  ok(!!src, "the panel carries the funding-source picker");
  for (const v of ["platform_minted", "platform", "customer_key"]) ok(src.opts.includes(v), "the picker offers " + v);
  ok(src.on === "platform_minted", "this organization is on its own minted key");

  const byok = await page.evaluate(() => {
    orgKeySourceSet("customer_key");
    const before = { held: orgKeyHeld(), state: orgKeyState(), field: !!document.getElementById("byokKey") };
    document.getElementById("byokKey").value = "sk-or-v1-abcdef0123456789";
    orgKeySave();
    const after = { prefix: ORG_KEY.customerPrefix, state: orgKeyState() };
    orgKeyClear();
    const cleared = orgKeyState();
    orgKeySourceSet("platform_minted");
    return { before, after, cleared };
  });
  ok(byok.before.field, "customer_key shows a field to paste your own key into");
  ok(!byok.before.held && byok.before.state === "none", "until you save one, no key is held and nothing is charged");
  ok(byok.after.prefix === "sk-or-v1-abcd" && byok.after.state === "ok", "saving a key holds a prefix, never the secret");
  ok(byok.cleared === "none", "removing it leaves the organization without a key");

  // revoking turns the assistant off, and the panel says so rather than erroring
  await page.evaluate(() => { openDialog("revokeorgkey"); });
  await page.waitForTimeout(200);
  await page.evaluate(() => { [...document.querySelectorAll("#layer .dlg-f .btn")].find(b => /Revoke/.test(b.textContent)).click(); });
  await page.waitForTimeout(300);
  await page.evaluate(() => asstToggle(true));
  await page.waitForTimeout(400);
  ok(/no model key/i.test((await host(page)).text), "after revoke the panel refuses by name");
  ok(errs.length === 0, "model-key errors: " + errs.join(" | "));
  await page.close();
}

/* ---------------- on a phone, and in the dark ---------------- */
for (const theme of ["light", "dark"]) {
  const { page, errs } = await open("#/a-intel/core-platform", { mobile: true, theme });
  await page.evaluate(() => asstToggle(true));
  await page.waitForTimeout(450);
  const r = await page.evaluate(() => {
    const a = document.getElementById("asst"), w = document.scrollingElement;
    return { phone: a.classList.contains("phone"), open: a.classList.contains("open"),
      overflow: w.scrollWidth - w.clientWidth, width: Math.round(a.getBoundingClientRect().width) };
  });
  ok(r.phone, theme + " phone: the panel takes its phone shape");
  ok(r.open, theme + " phone: it opens");
  ok(r.overflow <= 1, theme + " phone: no horizontal overflow, got " + r.overflow + "px");
  ok(r.width <= 400, theme + " phone: it stays inside the column, got " + r.width + "px");
  await shot(page, "asst-phone-" + theme);
  ok(errs.length === 0, theme + " phone errors: " + errs.join(" | "));
  await page.close();
}

/* ---------------- Stella's marks ----------------
   The header carries the wordmark, not the word "Assistant", and its letters follow the page's
   theme while the asterisk stays gold. The launcher shows the icon and "Ask stella*" in the
   wordmark's face. The kit's adaptive SVG switches ink by prefers-color-scheme, which ignores
   ?theme=, so a forced theme is the case that proves the inlined marks read the tokens instead. */
const GOLD = "rgb(212, 175, 55)";
const sum = c => (c.match(/\d+/g) || []).slice(0, 3).reduce((a, n) => a + Number(n), 0);
for (const theme of ["light", "dark"]) {
  const { page, errs } = await open("#/a-intel/core-platform", { theme });
  await page.evaluate(() => asstToggle(true));
  await page.waitForTimeout(450);
  const m = await page.evaluate(() => {
    const hd = document.querySelector("#asst .asst-h"), wm = hd && hd.querySelector("svg.stl-wm");
    const paths = wm ? wm.querySelectorAll("path") : [];
    const b = document.querySelector(".asst-launch .tx b"), ast = b && b.querySelector(".ast");
    const x = hd && hd.querySelector(".iconbtn");
    return {
      label: wm ? wm.getAttribute("aria-label") : null,
      height: wm ? Math.round(wm.getBoundingClientRect().height) : 0,
      letters: paths[0] ? getComputedStyle(paths[0]).fill : "",
      asterisk: paths[1] ? getComputedStyle(paths[1]).fill : "",
      headText: hd ? hd.innerText : "",
      launch: b ? b.innerText.replace(/\s+/g, " ").trim() : "",
      face: b ? getComputedStyle(b).fontFamily : "",
      textAst: ast ? getComputedStyle(ast).color : "",
      icon: !!document.querySelector(".asst-launch .asst-g svg.stl-mk"),
      iconAst: (() => { const p = document.querySelector(".asst-launch .stl-mk path"); return p ? getComputedStyle(p).fill : ""; })(),
      sub: (() => { const s = document.querySelector(".asst-launch .tx .sub"); return s ? s.innerText.replace(/\s+/g, " ").trim() : ""; })(),
      subSize: (() => { const s = document.querySelector(".asst-launch .tx .sub"); return s ? parseFloat(getComputedStyle(s).fontSize) : 0; })(),
      askSize: b ? parseFloat(getComputedStyle(b).fontSize) : 0,
      oxFace: (() => { const o = document.querySelector(".asst-launch .ox-name"); return o ? getComputedStyle(o).fontFamily : ""; })(),
      oxX: (() => { const x = document.querySelector(".asst-launch .ox-name .x"); return x ? [x.textContent, getComputedStyle(x).color] : []; })(),
      closeGap: hd && x ? Math.round(hd.getBoundingClientRect().right - x.getBoundingClientRect().right) : -1,
    };
  });
  ok(m.label === "stella", theme + ": the header carries the stella wordmark, got " + m.label);
  ok(m.height >= 14, theme + ": the wordmark has height, got " + m.height + "px");
  ok(!/assistant/i.test(m.headText), theme + ": the header no longer says Assistant, got " + JSON.stringify(m.headText));
  ok(theme === "dark" ? sum(m.letters) > 450 : sum(m.letters) < 300, theme + ": the wordmark letters follow the theme, got " + m.letters);
  ok(m.asterisk === GOLD, theme + ": the wordmark asterisk is gold, got " + m.asterisk);
  ok(m.launch === "Ask stella*", theme + ": the launcher reads Ask stella*, got " + JSON.stringify(m.launch));
  ok(/Space Grotesk/.test(m.face), theme + ": the launcher is set in Space Grotesk, got " + m.face);
  ok(m.textAst === GOLD, theme + ": the launcher asterisk is gold, got " + m.textAst);
  ok(m.icon && m.iconAst === GOLD, theme + ": the launcher shows Stella's icon, got " + m.iconAst);
  ok(m.sub === "oxagen’s in-app AI assistant", theme + ": line 2 reads oxagen’s in-app AI assistant, got " + JSON.stringify(m.sub));
  ok(m.subSize > 0 && m.subSize < m.askSize, theme + ": line 2 is smaller than line 1, " + m.subSize + " < " + m.askSize);
  ok(/Space Grotesk/.test(m.oxFace), theme + ": oxagen on line 2 is set in Space Grotesk, got " + m.oxFace);
  ok(m.oxX[0] === "x" && m.oxX[1] === GOLD, theme + ": the x in oxagen is gold, got " + m.oxX.join(" "));
  ok(m.closeGap >= 0 && m.closeGap <= 20, theme + ": the close button sits at the right edge, " + m.closeGap + "px in");
  await shot(page, "asst-brand-" + theme);
  ok(errs.length === 0, theme + " marks errors: " + errs.join(" | "));
  await page.close();
}
{
  const { page, errs } = await open("#/a-intel/core-platform", { mobile: true });
  await page.evaluate(() => openDialog("more"));
  await page.waitForTimeout(400);
  const { tile, face, sub, others } = await page.evaluate(() => {
    const all = [...document.querySelectorAll(".mtile")], t = all.find(x => x.querySelector(".stl-mk"));
    const b = t && t.querySelector(".tx b");
    const sub = t && t.querySelector(".tx > span");
    return { tile: b ? b.innerText.replace(/\s+/g, " ").trim() : null, face: b ? getComputedStyle(b).fontFamily : "",
      sub: sub ? sub.innerText.replace(/\s+/g, " ").trim() : null,
      others: all.filter(x => x !== t).map(x => getComputedStyle(x.querySelector(".tx b")).fontFamily).filter(f => /Space Grotesk/.test(f)).length };
  });
  ok(tile === "Ask stella*", "phone More sheet: the tile reads Ask stella*, got " + JSON.stringify(tile));
  ok(/Space Grotesk/.test(face), "phone More sheet: the Stella tile is set in Space Grotesk, got " + face);
  ok(sub === "oxagen’s in-app AI assistant", "phone More sheet: the tile's second line matches the launcher, got " + JSON.stringify(sub));
  ok(others === 0, "phone More sheet: the other tiles keep the UI face, " + others + " took Space Grotesk");
  await shot(page, "asst-more-sheet");
  await page.evaluate(() => [...document.querySelectorAll(".mtile")].find(x => x.querySelector(".stl-mk")).click());
  await page.waitForTimeout(450);
  ok((await host(page)).open, "phone More sheet: the tile opens the panel");
  ok(errs.length === 0, "More sheet errors: " + errs.join(" | "));
  await page.close();
}

/* ---------------- the drawer widens from its right edge, never below where it opened ---------------- */
{
  const { page, errs } = await open();
  await page.evaluate(() => { try { localStorage.removeItem("mc.asstW"); } catch (e) {} S.asstW = ASST_MIN; asstToggle(true); });
  await page.waitForTimeout(450);
  const geo = () => page.evaluate(() => {
    const a = document.getElementById("asst"), g = a.querySelector(".asst-grip"), r = a.getBoundingClientRect();
    return { w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right), vw: innerWidth,
      role: g && g.getAttribute("role"), orient: g && g.getAttribute("aria-orientation"),
      cursor: g ? getComputedStyle(g).cursor : "", now: g ? Number(g.getAttribute("aria-valuenow")) : 0,
      gx: g ? Math.round(g.getBoundingClientRect().left + g.getBoundingClientRect().width / 2) : 0 };
  });
  let g = await geo();
  ok(g.w === 430, "the drawer opens at 430px, got " + g.w);
  ok(g.role === "separator" && g.orient === "vertical", "the right edge is a vertical separator, got " + g.role + "/" + g.orient);
  ok(g.cursor === "ew-resize", "hovering the edge shows the resize cursor, got " + g.cursor);
  ok(g.now === 430, "the separator reports its width, got " + g.now);

  await page.focus("#asst .asst-grip");
  await page.keyboard.press("ArrowRight");
  ok((await geo()).w === 446, "ArrowRight widens by 16px, got " + (await geo()).w);
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowLeft");
  ok((await geo()).w === 430, "ArrowLeft at the floor stays at 430px, got " + (await geo()).w);
  await page.keyboard.press("End");
  g = await geo();
  ok(g.right === g.vw - 56, "End widens to leave 56px of page, right edge " + g.right + " of " + g.vw);

  await page.keyboard.press("Home");
  g = await geo();
  await page.mouse.move(g.gx, 400);
  await page.mouse.down();
  await page.mouse.move(g.gx + 200, 400, { steps: 5 });
  await page.mouse.up();
  ok(Math.abs((await geo()).w - 630) <= 2, "dragging the edge 200px right widens to about 630px, got " + (await geo()).w);
  g = await geo();
  await page.mouse.move(g.gx, 400);
  await page.mouse.down();
  await page.mouse.move(g.gx - 600, 400, { steps: 5 });
  await page.mouse.up();
  ok((await geo()).w === 430, "dragging far left stops at 430px, got " + (await geo()).w);

  await page.evaluate(() => asstSetW(560, true));
  await page.reload();
  await page.waitForTimeout(350);
  await page.evaluate(() => asstToggle(true));
  await page.waitForTimeout(450);
  ok((await geo()).w === 560, "the width survives a reload in this browser, got " + (await geo()).w);
  await shot(page, "asst-resized");
  await page.evaluate(() => { try { localStorage.removeItem("mc.asstW"); } catch (e) {} });
  ok(errs.length === 0, "resize errors: " + errs.join(" | "));
  await page.close();
}
{
  const { page, errs } = await open("#/a-intel/core-platform", { mobile: true });
  await page.evaluate(() => asstToggle(true));
  await page.waitForTimeout(450);
  const p = await page.evaluate(() => {
    const a = document.getElementById("asst"), g = a.querySelector(".asst-grip");
    return { phone: a.classList.contains("phone"), grip: g ? getComputedStyle(g).display : "none" };
  });
  ok(p.phone && p.grip === "none", "phone: the drawer shows no resize edge, got " + JSON.stringify(p));
  ok(errs.length === 0, "phone resize errors: " + errs.join(" | "));
  await page.close();
}

await browser.close();
console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
