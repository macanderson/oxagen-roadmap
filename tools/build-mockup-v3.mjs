#!/usr/bin/env node
// mockups/v3/index.html is the v3 mockup: one self-contained page built from mockups/v3/src and
// mockups/v3/fixtures, opened from disk or served. It clones the rev1 master's design system and
// demo record and is a separate, smaller design (mockups/v3/README.md). The rev1 master is
// untouched.
//
//   node tools/build-mockup-v3.mjs              # write mockups/v3/index.html
//   node tools/build-mockup-v3.mjs --check      # exit 1 if the committed page is not what the sources produce
//   node tools/build-mockup-v3.mjs --out X      # write somewhere else
//   node tools/build-mockup-v3.mjs --artifact X # write the page as an Artifact body: no doctype, html, head or body tags
//
// What a URL pins is read at runtime (src/core.js, BOOT): ?theme=dark|light, ?state=empty (the
// first run), ?phone=1 (the 400px phone preview), ?island=0 (no review pill), and the hash:
// #/a-intel/core-platform/<area>[/<id>], or a bare word (#work, #sessions, #replay, #agents,
// #steering, #servers, #spend) where a host passes only a plain anchor.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { root, FONT, fixturesScript } from "./build-mockup.mjs";
import { monoFontFace } from "./lib/house-fonts.mjs";

const DIR = path.join(root, "mockups/v3");
const SRC = path.join(DIR, "src");
export const OUT_V3 = path.join(DIR, "index.html");
export const TITLE_V3 = "Oxagen v3";
// Concatenated in this order into one classic script: the marks and the ledger first, the
// renderers next, and boot last, so every view is defined before the first render.
const JS = ["marks.js", "ledger.js", "core.js", "data.js", "replay.js", "views.js", "boot.js"];

function parts() {
  const css = readFileSync(path.join(SRC, "v3.css"), "utf8").trim();
  const shell = readFileSync(path.join(SRC, "shell.html"), "utf8").trim();
  const js = JS.map((f) => readFileSync(path.join(SRC, f), "utf8").trimEnd()).join("\n\n");
  const fx = fixturesScript(path.join(DIR, "fixtures")).replace(/<\/script/gi, "<\\/script");
  return { css, shell, js: js.replace(/<\/script/gi, "<\\/script"), fx };
}

function body({ css, shell, js, fx }) {
  return `<style>
${monoFontFace()}
${css}
</style>
${shell}
<script>${fx}</script>
<script>
${js}
</script>
`;
}

export function buildMockupV3() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#000000">
<title>${TITLE_V3}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${FONT}
</head>
<body>
${body(parts())}</body>
</html>
`;
}

// An Artifact host wraps the page in its own document, so the body carries the title, the font
// link and everything else inline.
export function buildArtifactV3() {
  return `<title>${TITLE_V3}</title>
${FONT}
${body(parts())}`;
}

function main() {
  const args = process.argv.slice(2);
  const flag = (f) => (args.includes(f) ? path.resolve(args[args.indexOf(f) + 1]) : null);
  if (flag("--artifact")) {
    const out = flag("--artifact");
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, buildArtifactV3());
    console.log(`wrote ${out} (artifact body)`);
    return;
  }
  const out = flag("--out") || OUT_V3;
  const html = buildMockupV3();
  if (args.includes("--check")) {
    if (!existsSync(out) || readFileSync(out, "utf8") !== html) {
      console.error(`DIFF ${path.relative(root, out)} is not what mockups/v3/src + fixtures produce. Run: node tools/build-mockup-v3.mjs`);
      process.exit(1);
    }
    console.log(`ok   ${path.relative(root, out)} matches the sources`);
    return;
  }
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`wrote ${path.relative(root, out)} (${Math.round(html.length / 1024)} KB)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
