// Runs after `next build`. Builds the Storybook catalog at the repo root (`npm run build-storybook`,
// installing the root dependencies first when they are absent) and copies storybook-static/ to
// out/storybook/, the target of the sidebar's Catalog link, so the export carries every page it links.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { REPO, SITE } from "./lib.mjs";

const run = (cmd) => execSync(cmd, { cwd: REPO, stdio: "inherit" });
if (!fs.existsSync(path.join(REPO, "node_modules", "storybook"))) run("npm ci --no-audit --no-fund");
run("npm run build-storybook");

const from = path.join(REPO, "storybook-static");
const to = path.join(SITE, "out", "storybook");
if (!fs.existsSync(path.join(from, "index.html"))) throw new Error(`catalog: ${from}/index.html missing after build-storybook`);
fs.rmSync(to, { recursive: true, force: true });
fs.cpSync(from, to, { recursive: true });
console.log(`catalog: storybook-static/ -> out/storybook/`);
