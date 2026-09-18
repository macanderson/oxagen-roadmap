// Builds index.html (the roadmap app) from roadmap/app.html and roadmap/data.json.
//
//   node tools/build-roadmap.mjs          write index.html
//   node tools/build-roadmap.mjs --check  exit 1 if index.html is not what the sources produce
//
// The app is one file so that the same index.html is served by GitHub Pages at the repo root
// (next to mockups/ and docs/, which it frames) and published as the claude.ai artifact, where
// the runtime capabilities (Claude, the shared store, the GitHub connector, comments) light up.
// Edit the sources, never index.html.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const template = readFileSync(resolve(root, "roadmap/app.html"), "utf8");
const data = JSON.parse(readFileSync(resolve(root, "roadmap/data.json"), "utf8"));

const marker = "/*__DATA__*/";
if (!template.includes(marker)) throw new Error("roadmap/app.html has no /*__DATA__*/ marker");
// `</script` inside a JSON string would end the data block early; escape the slash.
const json = JSON.stringify(data).replace(/<\//g, "<\\/");
const out = template.replace(marker, json);

const target = resolve(root, "index.html");
if (check) {
  let current = "";
  try { current = readFileSync(target, "utf8"); } catch {}
  if (current !== out) { console.error("index.html is stale: run `node tools/build-roadmap.mjs`"); process.exit(1); }
  console.log("index.html is up to date");
} else {
  writeFileSync(target, out);
  console.log(`wrote index.html (${(out.length / 1024).toFixed(0)} KB, ${data.surfaces.length} surfaces, ${data.decisions.length} decisions, ${Object.keys(data.issue_annotations).length} issue annotations)`);
}
