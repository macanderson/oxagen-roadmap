#!/usr/bin/env node
// Opens every design reference page (mockups/typography.html, colors.html, prose.html,
// components.html and mockups/components/*.html) in headless Chromium, in both themes and at desktop
// and phone widths, and fails on what would make a page wrong or unusable:
//   - a script error, or a stylesheet or font that did not load
//   - anything other than one h1, or Space Grotesk on an element that is not an h1 or a wordmark
//   - a story whose template rendered nothing, or a missing audit prompt or copy button
//   - a page that scrolls sideways at 390px
//   - an em dash, an en dash used as a separator, a semicolon, or an exclamation point in visible prose
//
//   node tools/check-design-docs.mjs            # every page
//   node tools/check-design-docs.mjs --only stat # pages whose path contains "stat"
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { launchChromium } from "./lib/playwright.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

const TOP = ["typography.html", "colors.html", "prose.html", "components.html"].map((f) => path.join(root, "mockups", f));
const COMP = path.join(root, "mockups/components");
const pages = [...TOP, ...(existsSync(COMP) ? readdirSync(COMP).filter((f) => f.endsWith(".html")).sort().map((f) => path.join(COMP, f)) : [])]
  .filter((p) => existsSync(p) && (!only || p.includes(only)));

// A component page must carry its reference sections; the four top pages carry their own.
const COMPONENT_SECTIONS = ["anatomy", "examples", "usage", "a11y", "audit"];

const browser = await launchChromium(root);
let fails = 0;
const fail = (page, msg) => { fails++; console.log(`FAIL ${path.relative(root, page)}: ${msg}`); };

for (const file of pages) {
  for (const [theme, width] of [["dark", 1440], ["light", 1440], ["dark", 390]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e.message || e)));
    page.on("requestfailed", (r) => { if (!/fonts\.(googleapis|gstatic)\.com/.test(r.url())) errors.push("did not load: " + r.url()); });
    await page.goto(`file://${file}?theme=${theme}`);
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForTimeout(150);
    const r = await page.evaluate(() => {
      const vis = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
      // Examples may hold a page header of their own, so an h1 inside one does not count.
      const SPECIMEN = ".dx-canvas,.dx-ex,.dx-spec .sample,.smp,[data-specimen]";
      const h1 = [...document.querySelectorAll("h1")].filter((el) => vis(el) && !el.closest(SPECIMEN)).length;
      const grotesk = [...document.querySelectorAll("body *")]
        .filter((el) => vis(el) && el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
        .filter((el) => /^\s*"?Space Grotesk/.test(getComputedStyle(el).fontFamily))
        .filter((el) => !el.closest("h1") && !el.closest("[style*='font-display'],.dx-dont,.dx-spec .sample") && !el.closest(".stl-name,.stl-ask,.ox-name"))
        .map((el) => el.tagName.toLowerCase() + "." + el.className + " " + el.textContent.trim().slice(0, 40));
      const mono = getComputedStyle(document.createElement("code")).fontFamily;
      const code = document.querySelector("code");
      const monoFace = code ? getComputedStyle(code).fontFamily : "";
      const monaspace = document.fonts ? document.fonts.check('12px "Monaspace Neon"') : true;
      const emptyStories = [...document.querySelectorAll(".dx-story")].filter((f) => !f.querySelector(".dx-canvas")?.children.length).map((f) => f.id || f.querySelector("b")?.textContent);
      const off = document.createElement("style");
      // Examples are product markup, which check-copy.mjs reads by its own rules (an empty value is
      // a dash there), so the prose scan skips them along with code.
      off.textContent = "pre,code,.mono,kbd,template,.dx-code,.dx-canvas,.dx-ex,[data-bad-example]{display:none!important}";
      document.head.appendChild(off);
      const text = document.body.innerText;
      off.remove();
      const dashes = [...text.matchAll(/.{0,30}(—|\s–\s|--\s|!(?=\s|$)|;\s).{0,30}/g)].map((m) => m[0]);
      return {
        h1, grotesk, monoFace, monaspace, emptyStories, dashes,
        hscroll: document.documentElement.scrollWidth > window.innerWidth + 1,
        prompt: !!document.querySelector("#audit-prompt") && !!document.querySelector('button[data-copy="#audit-prompt"]'),
        sections: [...document.querySelectorAll(".dx-sec>h2[id]")].map((h) => h.id),
        title: document.title,
        themed: document.documentElement.getAttribute("data-theme"),
      };
    });
    const tag = `${theme} ${width}px`;
    for (const e of errors) fail(file, `${tag}: ${e}`);
    if (r.h1 !== 1) fail(file, `${tag}: ${r.h1} h1 elements, expected 1`);
    for (const g of r.grotesk) fail(file, `${tag}: Space Grotesk outside an h1: ${g}`);
    if (!/Monaspace Neon/.test(r.monoFace)) fail(file, `${tag}: code computes to ${r.monoFace}`);
    if (!r.monaspace) fail(file, `${tag}: Monaspace Neon did not load`);
    for (const s of r.emptyStories) fail(file, `${tag}: story rendered nothing: ${s}`);
    if (r.hscroll) fail(file, `${tag}: the page scrolls sideways`);
    if (!r.prompt) fail(file, `${tag}: no audit prompt with a copy button`);
    if (r.themed !== theme) fail(file, `${tag}: ?theme=${theme} did not apply`);
    if (!r.title || r.title.split(/\s+/).length > 4) fail(file, `${tag}: title "${r.title}" is not a two to four word name`);
    for (const d of r.dashes) fail(file, `${tag}: dash, semicolon, or exclamation in prose: …${d}…`);
    if (file.startsWith(COMP + path.sep) && width === 1440 && theme === "dark")
      for (const s of COMPONENT_SECTIONS) if (!r.sections.includes(s)) fail(file, `missing section #${s}`);
    await page.close();
  }
}
await browser.close();
console.log(`${pages.length} pages, ${fails} failures`);
process.exit(fails ? 1 : 0);
