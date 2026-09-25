#!/usr/bin/env node
// mockups/missioncontrol.html is one self-contained file built from the sources in mockups/src
// and the dataset in mockups/fixtures. It is the master and the authoritative design of rev1: every page, every dialog, the auth
// screens, the guided scenarios and the mockup chrome, opened from disk or served.
//
//   node tools/build-mockup.mjs            # write mockups/missioncontrol.html
//   node tools/build-mockup.mjs --check    # exit 1 if the committed file is not what the sources produce
//   node tools/build-mockup.mjs --out X    # write somewhere else (the Storybook static build does)
//
// What a URL pins is read at runtime by the engine (see BOOT at the top of engine.js):
//   ?product=1          the product build: no scenario rail, no onboarding demo
//   ?state=loaded       loaded | empty | loading | error | denied
//   ?mobile=1           the mobile shell (thumb bar, bottom sheets, card tables); 0 pins desktop
//   ?theme=dark         dark | light
//   ?phone=1            the 400px phone preview the review island's Mobile view switch opens
//   ?help=1             component help on: a ? on every page part, opening its mockups/help spec
//   ?island=0           no review island (Storybook frames and the copy check)
//   #/a-intel/...       the page; a scenario is #/a-intel/<ws>/scenarios/<id>/<step>
// so the product build, every page in every state in either shell, and every W flow are URLs of
// this one file rather than copies of it. Storybook (npm run storybook) is the catalog of those URLs.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { monoFontFace } from "./lib/house-fonts.mjs";
import { reviewData } from "./lib/review.mjs";
import { PAGES, ALL } from "../mockups/catalog.mjs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "mockups/src");
const FIX = path.join(root, "mockups/fixtures");
const PAGES_DIR = path.join(root, "mockups/pages");
const HELP_DIR = path.join(root, "mockups/help");
export const OUT = path.join(root, "mockups/missioncontrol.html");

export const TITLE = "Oxagen";
export const FONT = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap">';

// Every fixtures/*.json, keyed by its name in upper snake case: spend-detail.json → SPEND_DETAIL.
export function fixtures(fix = FIX) {
  const out = {};
  for (const f of readdirSync(fix).filter(f => f.endsWith(".json")).sort()) {
    out[f.replace(/\.json$/, "").toUpperCase().replace(/-/g, "_")] = JSON.parse(readFileSync(path.join(fix, f), "utf8"));
  }
  return out;
}

// The fixtures as one classic script, for a page that loads the engine by <script src>.
export function fixturesScript(fix = FIX) {
  return `/* generated from mockups/fixtures/*.json; do not edit */\nvar FIXTURES=${JSON.stringify(fixtures(fix))};\n`;
}

function once(haystack, needle, what) {
  const n = haystack.split(needle).length - 1;
  if (n !== 1) throw new Error(`mockups/src: expected exactly one ${what}, found ${n}`);
}

// Another version (mockups/future_state_mockups) is the same build over its own src and fixtures.
// The views the fleet operations wedge adds (docs/fleet-operations-wedge.md) live in their own file
// beside the engine and load after it, in the same script. The review island (island.js, its
// island.css, and the REVIEW data from mockups/pages and mockups/help) loads before boot.js, which
// renders first. A version without a file builds as before.
const EXTRA_JS = ["wedge.js", "island.js", "boot.js"];

// The island's data as one classic script: the catalog pages with their spec title and Job
// paragraph, and every section of mockups/help/*.md rendered to HTML.
export function reviewScript() {
  const data = reviewData({ pages: PAGES, pagesDir: PAGES_DIR, helpDir: HELP_DIR, states: ALL });
  return `/* generated from mockups/catalog.mjs, mockups/pages/*.md and mockups/help/*.md; do not edit */\nvar REVIEW=${JSON.stringify(data)};\n`;
}

export function buildMockup({ src = SRC, fix = FIX } = {}) {
  const island = existsSync(path.join(src, "island.js"));
  const css = readFileSync(path.join(src, "engine.css"), "utf8") +
    (island && existsSync(path.join(src, "island.css")) ? "\n" + readFileSync(path.join(src, "island.css"), "utf8") : "");
  const shell = readFileSync(path.join(src, "shell.html"), "utf8").trim();
  const js = [readFileSync(path.join(src, "engine.js"), "utf8").trimEnd()]
    .concat(EXTRA_JS.filter(f => existsSync(path.join(src, f))).map(f => readFileSync(path.join(src, f), "utf8").trimEnd()))
    .join("\n\n");
  once(js, "var BOOT=(function(){", "BOOT block");
  once(js, "var PRODUCT=BOOT.product;", "PRODUCT line");
  if (!island) once(shell, '<div id="chrome">', "#chrome block");
  const fx = (fixturesScript(fix) + (island ? reviewScript() : "")).replace(/<\/script/gi, "<\\/script");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#000000">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>${TITLE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${FONT}
<style>
${monoFontFace()}
${css.trim()}
</style>
</head>
<body>
${shell}
<script>${fx}</script>
<script>
${js.trim().replace(/<\/script/gi, "<\\/script")}
</script>
</body>
</html>
`;
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const out = args.includes("--out") ? path.resolve(args[args.indexOf("--out") + 1]) : OUT;
  const html = buildMockup();
  if (check) {
    const same = existsSync(out) && readFileSync(out, "utf8") === html;
    if (!same) { console.error(`DIFF ${path.relative(root, out)} is not what mockups/src + fixtures produce. Run: node tools/build-mockup.mjs`); process.exit(1); }
    console.log(`ok   ${path.relative(root, out)} matches the sources`);
  } else {
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, html);
    console.log(`wrote ${path.relative(root, out)} (${Math.round(html.length / 1024)} KB)`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
