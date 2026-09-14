#!/usr/bin/env node
// The product files are mc.html with the mockup chrome taken off.
//
//   node tools/build-pages.mjs           # regenerate consolidated*.html and pages/ from mc.html
//   node tools/build-pages.mjs --check   # exit 1 if any output is not exactly what mc.html produces
//
// Outputs, all derived from mc.html and never edited by hand:
//
//   consolidated.html                 the product: every page, every dialog, the auth screens; the
//                                     mockup state bar, the scenario rail and the onboarding demo
//                                     entry points removed (PRODUCT=true). Lays itself out for a
//                                     phone when the viewport is one.
//   consolidated-loaded.html          the same, pinned to the loaded state and the desktop shell.
//   consolidated-loaded-mobile.html   the same, pinned to the loaded state and the mobile shell:
//                                     the thumb bar, bottom-sheet dialogs, card tables.
//   pages/<page>-<state>.html         one file per page per state it can be in (loaded, empty,
//   pages/<page>-<state>-mobile.html  loading, error, denied), desktop and mobile. These are thin:
//                                     the shell markup plus a BOOT object, loading the shared engine
//                                     in pages/_engine/ (the product stylesheet and script, split out
//                                     of consolidated.html). A self-contained copy would be 1.4 MB
//                                     each, 300 MB for the set; the thin form is a few KB each and
//                                     cannot drift from consolidated.html because it is the same
//                                     bytes. Open them from disk or serve the folder.
//   pages/index.html                  the map of every page and state.
//
// A file differs from mc.html in four places only: PRODUCT is true, the #chrome block and its
// stylesheet are gone, the BOOT object pins state/shell/hash, and the <title>. Everything else,
// including every component, token, dataset and dialog, is mc.html byte for byte. To change what a
// generated file shows, change mc.html and rebuild.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");

const ALL = ["loaded", "empty", "loading", "error", "denied"];
const NO_EMPTY = ["loaded", "loading", "error", "denied"];

// Every page, the hash it opens on, and the states its renderer implements. The states listed here
// are the ones mc.html branches on for that page (S.state checks in its pX / obX function); a
// state a page does not implement is not generated, so no file shows a state the design lacks.
export const PAGES = [
  // workspace scope (Appendix F, pages 1–7)
  { id: "fleet",             title: "Fleet",                       hash: "/{org}/core-platform",                                  states: ALL },
  { id: "run",               title: "Run",                         hash: "/{org}/core-platform/runs/run_01K5RS7M2E8FJ3QW",         states: ALL },
  { id: "agents",            title: "Agent IAM",                   hash: "/{org}/core-platform/agents",                           states: ALL },
  { id: "agent",             title: "Agent",                       hash: "/{org}/core-platform/agents/triage",                    states: ALL },
  { id: "agent-source",      title: "Agent source",                hash: "/{org}/core-platform/agents/release-manager/source",    states: NO_EMPTY },
  { id: "mandate",           title: "Mandate",                     hash: "/{org}/finops/agents/invoice-bot/mandates/mnd_7K2ETQ4", states: ALL },
  { id: "tools",             title: "Tools",                       hash: "/{org}/core-platform/tools",                            states: ALL },
  { id: "ontology",          title: "Ontology",                    hash: "/{org}/core-platform/ontology",                         states: ALL },
  { id: "steering",          title: "Steering",                    hash: "/{org}/core-platform/steering",                         states: ALL },
  { id: "spend",             title: "Spend",                       hash: "/{org}/core-platform/spend",                            states: ALL },
  // organization scope (pages 8–10)
  { id: "organization",      title: "Organization",                hash: "/{org}",                                                states: ALL },
  { id: "organization-api-keys", title: "Organization · API keys", hash: "/{org}/api-keys",                                       states: ALL },
  { id: "organization-roles",    title: "Organization · Roles",    hash: "/{org}/roles",                                          states: ALL },
  { id: "billing",           title: "Billing",                     hash: "/{org}/billing",                                        states: ALL },
  { id: "audit",             title: "Audit",                       hash: "/{org}/audit",                                          states: ALL },
  // register an agent (the gate Fleet opens; three steps)
  { id: "register-name",     title: "Register agent · Name",       hash: "/{org}/core-platform/register/name",                    states: ["loaded", "loading", "denied"] },
  { id: "register-wrap",     title: "Register agent · Wrap",       hash: "/{org}/core-platform/register/wrap",                    states: ["loaded", "loading", "denied"] },
  { id: "register-run",      title: "Register agent · First run",  hash: "/{org}/core-platform/register/run",                     states: ["loaded", "loading", "error", "denied"] },
  // sign-in flows (Appendix F: seven of them, not counted as pages) and the onboarding gate
  { id: "signup",            title: "Sign up",                     hash: "/welcome/signup",                                       states: ["loaded", "loading", "error"] },
  { id: "verify-email",      title: "Verify email",                hash: "/welcome/verify",                                       states: ["loaded", "loading", "error"] },
  { id: "login",             title: "Log in",                      hash: "/welcome/login",                                        states: ["loaded", "loading", "error", "denied"] },
  { id: "two-factor",        title: "Two-factor",                  hash: "/welcome/two-factor",                                   states: ["loaded", "loading", "error"] },
  { id: "forgot-password",   title: "Forgot password",             hash: "/welcome/forgot",                                       states: ["loaded", "loading", "error"] },
  { id: "reset-password",    title: "Reset password",              hash: "/welcome/reset",                                        states: ["loaded", "loading", "error", "denied"] },
  { id: "accept-invitation", title: "Accept invitation",           hash: "/welcome/invite",                                       states: ["loaded", "loading", "error", "denied"] },
  { id: "onboarding-organization", title: "Onboarding · Organization", hash: "/welcome/organization",                             states: ["loaded", "loading", "error", "denied"] },
  { id: "onboarding-wrap",   title: "Onboarding · Wrap an agent",  hash: "/welcome/wrap",                                         states: ["loaded", "loading", "denied"] },
  { id: "onboarding-run",    title: "Onboarding · First run",      hash: "/welcome/run",                                          states: ["loaded", "loading", "error", "denied"] },
  { id: "installer",         title: "Installer",                   hash: "/welcome/installer",                                    states: ["loaded"] },
];

function once(haystack, needle, what) {
  const n = haystack.split(needle).length - 1;
  if (n !== 1) throw new Error(`mc.html: expected exactly one ${what}, found ${n}`);
}
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");


// mc.html has no <html>/<head>/<body>: line 1 is the title, line 2 the font link, then one
// <style>, the shell markup, and one <script>. Take it apart once.
export function splitMc(mc) {
  const TITLE = "<title>The Ten Pages</title>";
  once(mc, TITLE, "title");
  const styleA = mc.indexOf("<style>"), styleB = mc.indexOf("</style>");
  const scriptA = mc.indexOf("<script>"), scriptB = mc.lastIndexOf("</script>");
  if (styleA < 0 || styleB < 0 || scriptA < 0 || scriptB < 0) throw new Error("mc.html: no style/script pair");
  if (mc.indexOf("<script>", scriptA + 1) >= 0 && mc.indexOf("<script>", scriptA + 1) < scriptB) throw new Error("mc.html: more than one <script>");
  const head = mc.slice(0, styleA);
  const fontLink = (head.match(/<link[^>]*fonts\.googleapis\.com[^>]*>/) || [""])[0];
  if (!fontLink) throw new Error("mc.html: no font link");
  return {
    css: mc.slice(styleA + 7, styleB),
    body: mc.slice(styleB + 8, scriptA),
    js: mc.slice(scriptA + 8, scriptB),
    fontLink,
  };
}

// The product transform: PRODUCT on, chrome markup and stylesheet off.
export function productize(parts) {
  const FLAG = "var PRODUCT=false;";
  once(parts.js, FLAG, "PRODUCT flag");
  const BOOT = 'var BOOT=window.BOOT||{state:null,mobile:null,theme:null,hash:null};';
  once(parts.js, BOOT, "BOOT line");
  const chrome = /<div id="chrome">[\s\S]*?<\/div>\n<\/div>\n/;
  if (!chrome.test(parts.body)) throw new Error("mc.html: no #chrome block");
  const chromeCss = /\/\* -{10} mockup chrome \(never product UI\) -{10} \*\/[\s\S]*?(?=\n\/\* -{8})/;
  if (!chromeCss.test(parts.css)) throw new Error("mc.html: no #chrome stylesheet block");
  return {
    ...parts,
    js: parts.js.replace(FLAG, () => "var PRODUCT=true; /* generated by tools/build-pages.mjs from mc.html */"),
    body: parts.body.replace(chrome, ""),
    css: parts.css.replace(chromeCss, "/* the mockup chrome is not in this file: see tools/build-pages.mjs */"),
    BOOT,
  };
}

function bootLiteral(b) {
  return `{state:${b.state ? JSON.stringify(b.state) : "null"},mobile:${b.mobile == null ? "null" : String(!!b.mobile)},theme:null,hash:${JSON.stringify(b.hash)}}`;
}

function head(title, parts, extraHead) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0A0A09">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${parts.fontLink}
${extraHead}
</head>
<body>`;
}

// One self-contained product file.
function selfContained(title, parts, boot) {
  const js = parts.js.replace(parts.BOOT, () => `var BOOT=window.BOOT||${bootLiteral(boot)};`);
  return `${head(title, parts, "<style>" + parts.css + "</style>")}
${parts.body.trim()}
<script>${js}</script>
</body>
</html>
`;
}

// One thin page file: shell markup + BOOT, engine shared.
function thin(title, parts, boot) {
  return `${head(title, parts, '<link rel="stylesheet" href="_engine/mc.css">')}
${parts.body.trim()}
<script>window.BOOT=${bootLiteral(boot)};</script>
<script src="_engine/mc.js"></script>
</body>
</html>
`;
}

const STATE_WORD = { loaded: "loaded", empty: "empty", loading: "loading", error: "error", denied: "access denied" };

function indexPage(slug, files) {
  const rows = PAGES.map(p => {
    const cells = ALL.map(st => {
      if (!p.states.includes(st)) return '<td class="na">—</td>';
      return `<td><a href="${p.id}-${st}.html">desktop</a> · <a href="${p.id}-${st}-mobile.html">mobile</a></td>`;
    }).join("");
    return `<tr><th><a href="${p.id}.md">${esc(p.title)}</a><span>${esc("#" + p.hash.replace("{org}", slug))}</span></th>${cells}<td class="doc"><a href="${p.id}.md">spec</a> · <a href="${p.id}.audit-prompt.md">audit</a></td></tr>`;
  }).join("\n");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mission Control · pages and states</title>
<style>
:root{color-scheme:dark;--ink:#10100F;--panel:#181715;--border:#292722;--fg:#F2EEE5;--muted:#9B958A;--dim:#6E6A62;--gold:#D6962C;--mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace}
body{margin:0;background:var(--ink);color:var(--fg);font:14px/1.5 "Space Grotesk","Helvetica Neue",Arial,sans-serif;padding:28px 20px 60px}
main{max-width:1200px;margin:0 auto}h1{font-size:22px;margin:0 0 4px}p{color:var(--muted);margin:0 0 18px;max-width:80ch}
.tw{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:760px}th,td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--border);vertical-align:top;font-size:13px}
thead th{color:var(--dim);font-size:11px;letter-spacing:.1em;text-transform:uppercase}
tbody th{font-weight:600}tbody th span{display:block;font-family:var(--mono);font-size:11px;color:var(--dim);font-weight:400}
a{color:var(--gold);text-decoration:none}a:hover{text-decoration:underline}.na{color:var(--dim)}.doc{white-space:nowrap}
code{font-family:var(--mono);font-size:12px;background:var(--panel);border:1px solid var(--border);border-radius:5px;padding:1px 5px}
</style></head><body><main>
<h1>Mission Control · every page in every state</h1>
<p>${files} files, generated from <code>mc.html</code> by <code>tools/build-pages.mjs</code>. Each cell opens the page pinned to that state, in the desktop shell or the mobile shell. A dash means the design has no such state for that page. The <em>spec</em> column is the page's data sources and functionality; <em>audit</em> is the prompt that checks a build against it.</p>
<div class="tw"><table><thead><tr><th>Page</th>${ALL.map(s => `<th>${STATE_WORD[s]}</th>`).join("")}<th>Docs</th></tr></thead><tbody>
${rows}
</tbody></table></div>
</main></body></html>
`;
}

function main() {
  const mc = readFileSync(path.join(root, "mc.html"), "utf8");
  const slugM = mc.match(/var ORG = \{slug:"([a-z0-9-]+)"/);
  if (!slugM) throw new Error("mc.html: no ORG slug");
  const SLUG = slugM[1];
  const parts = productize(splitMc(mc));
  const home = `#/${SLUG}/core-platform`;

  const outs = new Map();
  outs.set("consolidated.html", selfContained("Oxagen Mission Control", parts, { state: null, mobile: null, hash: home }));
  outs.set("consolidated-loaded.html", selfContained("Oxagen Mission Control", parts, { state: "loaded", mobile: false, hash: home }));
  outs.set("consolidated-loaded-mobile.html", selfContained("Oxagen Mission Control", parts, { state: "loaded", mobile: true, hash: home }));
  outs.set("pages/_engine/mc.css", parts.css);
  outs.set("pages/_engine/mc.js", parts.js);
  let n = 0;
  for (const p of PAGES) for (const st of p.states) {
    const hash = "#" + p.hash.replace("{org}", SLUG);
    const t = `${p.title} · ${STATE_WORD[st]}`;
    outs.set(`pages/${p.id}-${st}.html`, thin(t, parts, { state: st, mobile: false, hash }));
    outs.set(`pages/${p.id}-${st}-mobile.html`, thin(t + " · mobile", parts, { state: st, mobile: true, hash }));
    n += 2;
  }
  outs.set("pages/index.html", indexPage(SLUG, n));

  // A generated page file that no PAGES entry produces any more is stale; it goes.
  const pagesDir = path.join(root, "pages");
  const stale = existsSync(pagesDir)
    ? readdirSync(pagesDir).filter(f => /^[a-z0-9-]+-(loaded|empty|loading|error|denied)(-mobile)?\.html$/.test(f) && !outs.has("pages/" + f))
    : [];

  let failed = 0;
  for (const [file, out] of outs) {
    const dst = path.join(root, file);
    if (check) {
      const same = existsSync(dst) && readFileSync(dst, "utf8") === out;
      if (!same) { console.log(`DIFF ${file}`); failed++; }
    } else {
      mkdirSync(path.dirname(dst), { recursive: true });
      writeFileSync(dst, out);
    }
  }
  for (const f of stale) {
    if (check) { console.log(`STALE pages/${f}`); failed++; }
    else { unlinkSync(path.join(pagesDir, f)); console.log(`removed stale pages/${f}`); }
  }
  if (check) {
    if (failed) { console.error(`\n${failed} generated file(s) differ from mc.html. Run: node tools/build-pages.mjs`); process.exit(1); }
    console.log(`ok   ${outs.size} files match mc.html`);
  } else {
    console.log(`wrote ${outs.size} files: 3 consolidated, pages/_engine (2), ${n} page files, pages/index.html`);
  }
}

// Only build when run directly; tools/check-pages.mjs imports PAGES from here.
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
