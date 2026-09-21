#!/usr/bin/env node
// mockups/v3/missioncontrol.html is the v1 master rebuilt from its own copy of the sources,
// mockups/v3/src and mockups/v3/fixtures. Same URL contract as v1 (see build-mockup.mjs).
//
//   node tools/build-mockup-v3.mjs            # write mockups/v3/missioncontrol.html
//   node tools/build-mockup-v3.mjs --check    # exit 1 if the committed file is stale
//   node tools/build-mockup-v3.mjs --out X
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildMockup, root } from "./build-mockup.mjs";

const DIR = path.join(root, "mockups/v3");
export const OUT3 = path.join(DIR, "missioncontrol.html");
export function buildMockupV3() {
  return buildMockup({ src: path.join(DIR, "src"), fix: path.join(DIR, "fixtures") });
}

function main() {
  const args = process.argv.slice(2);
  const out = args.includes("--out") ? path.resolve(args[args.indexOf("--out") + 1]) : OUT3;
  const html = buildMockupV3();
  if (args.includes("--check")) {
    if (!existsSync(out) || readFileSync(out, "utf8") !== html) { console.error(`DIFF ${path.relative(root, out)} is stale. Run: node tools/build-mockup-v3.mjs`); process.exit(1); }
    console.log(`ok   ${path.relative(root, out)} matches the sources`);
  } else {
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, html);
    console.log(`wrote ${path.relative(root, out)} (${Math.round(html.length / 1024)} KB)`);
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
