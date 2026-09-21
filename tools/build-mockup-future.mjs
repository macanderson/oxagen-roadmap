#!/usr/bin/env node
// mockups/future_state_mockups/missioncontrol.html is the future-state mockup (the first version,
// with the witness runner, proof and the definition of done), built from its own sources. Same URL
// contract as the master (see build-mockup.mjs).
//
//   node tools/build-mockup-future.mjs        # write mockups/future_state_mockups/missioncontrol.html
//   node tools/build-mockup-future.mjs --check
//   node tools/build-mockup-future.mjs --out X
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildMockup, root } from "./build-mockup.mjs";

const DIR = path.join(root, "mockups/future_state_mockups");
export const OUT_FUTURE = path.join(DIR, "missioncontrol.html");
export function buildMockupFuture() {
  return buildMockup({ src: path.join(DIR, "src"), fix: path.join(DIR, "fixtures") });
}

function main() {
  const args = process.argv.slice(2);
  const out = args.includes("--out") ? path.resolve(args[args.indexOf("--out") + 1]) : OUT_FUTURE;
  const html = buildMockupFuture();
  if (args.includes("--check")) {
    if (!existsSync(out) || readFileSync(out, "utf8") !== html) { console.error(`DIFF ${path.relative(root, out)} is stale. Run: node tools/build-mockup-future.mjs`); process.exit(1); }
    console.log(`ok   ${path.relative(root, out)} matches the sources`);
  } else {
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, html);
    console.log(`wrote ${path.relative(root, out)} (${Math.round(html.length / 1024)} KB)`);
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
