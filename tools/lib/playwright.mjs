// Opens headless Chromium for the check scripts, from the playwright this repo installed.
//
// Four scripts each carried their own copy of this, and every copy named two browser revisions by
// hand. Playwright moves the revision on most releases, so the list went stale and the launch died
// on a path nobody had written: on 2026-09-20 the scripts asked for 1234 or 1223 while 1243 was
// installed, then fell back to a global playwright whose own revision was 1232. This reads the
// revision out of the copy it is about to import, so the number is never written down twice.
import { existsSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const CACHE = path.join(os.homedir(), "Library/Caches/ms-playwright");
const PLATFORMS = ["chrome-headless-shell-mac-arm64", "chrome-headless-shell-mac-x64", "chrome-headless-shell-linux"];

// The repo's own playwright comes first. A globally installed one is a different version asking for
// a different browser revision, and `npx playwright install` fetches what the local copy asks for,
// so preferring the global one launches a shell that was never downloaded.
function findModule(root) {
  return ["node_modules/playwright",
    "/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright",
    "/opt/homebrew/lib/node_modules/playwright"]
    .map((d) => (path.isAbsolute(d) ? d : path.join(root, d)))
    .find((d) => existsSync(path.join(d, "index.js")));
}

const shellAt = (rev) => PLATFORMS
  .map((p) => path.join(CACHE, `chromium_headless_shell-${rev}`, p, "chrome-headless-shell"))
  .find(existsSync);

/**
 * Launch headless Chromium, or exit 2 with the command that installs it.
 *
 * `root` is the repo root. Any other installed revision is the fallback, and none at all leaves the
 * executable path unset so playwright itself names the download it wants.
 */
export async function launchChromium(root, options = {}) {
  const dir = findModule(root);
  if (!dir) {
    console.error("playwright not found. Run: npm ci && npx playwright install chromium --only-shell");
    process.exit(2);
  }
  const pw = (await import(path.join(dir, "index.js"))).default ?? (await import(path.join(dir, "index.js")));

  let want = null;
  try {
    const manifest = JSON.parse(await readFile(path.join(dir, "..", "playwright-core", "browsers.json"), "utf8"));
    want = manifest.browsers.find((b) => b.name === "chromium-headless-shell")?.revision ?? null;
  } catch { /* an unreadable manifest is not fatal: fall through to whatever is installed */ }

  const installed = existsSync(CACHE)
    ? readdirSync(CACHE).filter((d) => d.startsWith("chromium_headless_shell-")).map((d) => d.slice("chromium_headless_shell-".length))
    : [];
  const exe = (want && shellAt(want)) || installed.map(shellAt).find(Boolean);
  if (want && !shellAt(want) && exe) console.log(`note: chromium ${want} is not installed, using ${exe}`);

  return pw.chromium.launch(exe ? { ...options, executablePath: exe } : options);
}
