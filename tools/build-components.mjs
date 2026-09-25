#!/usr/bin/env node
// The component reference is built from a registry, one module per component, the way the page
// stories are built from mockups/catalog.mjs:
//
//   mockups/components/src/<slug>.mjs     one component: its anatomy, examples, rules, and audit checks
//   mockups/components/src/_catalog.mjs   the groups, the page-bound components, the shared findings
//
// It writes mockups/components/<slug>.html for each module, mockups/components.html (the index), and
// mockups/components/manifest.json, which lists every example's markup for a component-level
// Storybook to read.
//
//   node tools/build-components.mjs           # write the pages
//   node tools/build-components.mjs --check   # exit 1 if a committed page is not what the registry makes
//
// Registry strings take three inline marks: `code`, **bold**, and [text](href). Example markup is
// raw HTML that engine.css draws, written into its <template> exactly as dedented, since any added
// indent would shift the lines of a <pre> or a <textarea>. The audit prompt is plain text, so its
// marks stay as written.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "mockups/components/src");
const OUT = path.join(root, "mockups/components");
const INDEX = path.join(root, "mockups/components.html");
const MANIFEST = path.join(OUT, "manifest.json");
const check = process.argv.includes("--check");

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const md = (s) => esc(s)
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
const dedent = (s) => {
  const lines = String(s).replace(/^\s*\n/, "").replace(/\s+$/, "").split("\n");
  const min = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length));
  return lines.map((l) => l.slice(Number.isFinite(min) ? min : 0)).join("\n");
};

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap">';

function head(rel, title, description) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${FONTS}
<link rel="stylesheet" href="${rel}docs-kit/fonts.css">
<link rel="stylesheet" href="${rel}src/engine.css">
<link rel="stylesheet" href="${rel}docs-kit/docs.css">
<script src="${rel}docs-kit/docs.js"></script>
</head>
<body>`;
}

function topbar(rel, current) {
  const link = (href, name) => `<a href="${rel}${href}"${name === current ? ' aria-current="page"' : ""}>${name}</a>`;
  return `<header class="dx-top">
  <a class="dx-brand" href="${rel}components.html"><span class="dx-logo"></span><span class="dx-tag">design reference</span></a>
  <nav class="dx-nav" aria-label="Reference pages">
    ${link("typography.html", "Typography")}
    ${link("colors.html", "Colors")}
    ${link("prose.html", "Prose")}
    ${link("components.html", "Components")}
  </nav>
  <div class="dx-tools">
    <a class="dx-open" href="${rel}missioncontrol.html">Open the mockup</a>
    <div class="dx-seg" role="group" aria-label="Theme">
      <button type="button" data-theme-set="system">System</button>
      <button type="button" data-theme-set="dark">Dark</button>
      <button type="button" data-theme-set="light">Light</button>
    </div>
  </div>
</header>
<div class="dx-shell">
<aside class="dx-toc" aria-label="On this page"><p class="dx-toc-h">On this page</p><ol></ol></aside>
<main class="dx-main" id="main">`;
}

const foot = `</main>
</div>
</body>
</html>
`;

const sec = (id, title, sub, body) => `
<section class="dx-sec">
  <h2 id="${id}">${esc(title)}</h2>
  ${sub ? `<p class="dx-sub">${md(sub)}</p>` : ""}
${body}
</section>`;

const list = (items) => `  <ul>\n${items.map((i) => `    <li>${md(i)}</li>`).join("\n")}\n  </ul>`;

const table = (heads, rows, cls = "") => `  <div class="dx-tbl"><div class="tw"><table${cls ? ` class="${cls}"` : ""}>
    <thead><tr>${heads.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>
${rows.map((r) => `      <tr>${r.map((c) => `<td>${md(c)}</td>`).join("")}</tr>`).join("\n")}
    </tbody>
  </table></div></div>`;

const TAG = { fixed: ["b-allowed", "fixed", true], open: ["b-approval", "open", true], note: ["b-q", "note", false] };
const findingHtml = (f) => {
  const [cls, word, dot] = TAG[f.tag] || TAG.note;
  return `  <div class="dx-find"><h4><span class="b ${cls}">${dot ? '<span class="d"></span>' : ""}${word}</span>${esc(f.title)}</h4><p>${md(f.body)}</p></div>`;
};

const ICON_AVOID = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" fill="none"/></svg>';
const ICON_USE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 5" stroke="currentColor" stroke-width="2" fill="none"/></svg>';

function story(s) {
  const cls = ["dx-canvas", s.canvas === "panel" ? "on-panel" : "", s.row ? "row" : "", s.tight ? "tight" : ""].filter(Boolean).join(" ");
  return `  <figure class="dx-story" id="story-${esc(s.id)}">
    <figcaption class="dx-story-h"><b>${esc(s.name)}</b>${s.note ? `<span>${md(s.note)}</span>` : ""}</figcaption>
    <div class="${cls}"></div>
    <template data-story="${esc(s.id)}" data-name="${esc(s.name)}">
${dedent(s.html)}
    </template>
  </figure>`;
}

function promptBox(title, fill, text) {
  return `  <div class="dx-prompt" id="prompt-box">
    <div class="dx-prompt-h"><div class="t"><b>${esc(title)}</b><span>${fill}</span></div>
      <div class="acts"><button type="button" class="btn sm ghost" data-expand="#prompt-box" aria-expanded="false">Show all</button><button type="button" class="btn primary sm" data-copy="#audit-prompt" data-copied="Audit prompt copied">Copy prompt</button></div></div>
<pre id="audit-prompt">${esc(text)}</pre>
  </div>`;
}

const FILL = "Fill <code>{{APP_ROOT}}</code>, <code>{{APP_URL}}</code>, and <code>{{DATE}}</code>. The agent reports and fixes nothing.";

function componentPrompt(c) {
  const helpers = (c.helpers || []).map((h) => `${h[0]} (${h[1]})`).join(", ");
  const checks = [
    ...c.audit.checks,
    "Tokens. Every color, border, radius, and shadow in the build's version resolves to the tokens listed in the Tokens section of the reference page. A raw hex, rgb, or named color is a FAIL.",
    "Type. Text computes to Geist and ids, keys, and code compute to Monaspace Neon, at the sizes and weights the reference page's examples render. Space Grotesk anywhere in the component is a FAIL.",
    "Themes. Repeat every visual check in the light theme. A part that loses its border, its contrast, or its meaning in one theme is a FAIL.",
    `Phone. At 390 by 844 with a touch pointer: ${(c.phone || []).join(" ") || "nothing scrolls sideways and every touch target is at least 44px."}`,
    `Accessibility. ${(c.a11y || []).join(" ")}`,
    `One implementation. The build draws the ${c.name.toLowerCase()} from one shared component. List every place that draws it by hand, with its file and line.`,
  ];
  return `You are auditing the ${c.name.toLowerCase()} component in the Oxagen build at {{APP_ROOT}}, served at {{APP_URL}}, against its design reference. Be exact and adversarial: the reference is the spec, and close enough is a fail. Do not summarize what you see. Compare it.

## Inputs

1. mockups/components/${c.slug}.html in the roadmap repo. Read it in full: anatomy, examples, usage, content, accessibility, and phone rules. Open it in a browser and switch themes to see every example in both.
2. The design source: mockups/src/engine.css ${c.css}.${helpers ? ` The mockup renders it with ${helpers}.` : ""}
3. The build's implementation: find it by its root selector (${c.root}) or its name, and list every route that renders it.
4. Where to see it in the design: ${c.usedOn.join(", ")}. Open mockups/missioncontrol.html?product=1 at those routes, or the matching Storybook stories.

## Procedure

Record PASS, FAIL, or N/A for every check. Cite evidence for each: a file and line in the build, or a DOM selector with its computed style and text.

${checks.map((t, i) => `${i + 1}. ${t}`).join("\n")}

## Output

Return one markdown report:

# ${c.name}: audit {{DATE}}
Verdict: PASS or FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|

## Fails, most severe first
1. What is wrong. Where it is. What the reference shows. The smallest change that fixes it.

## Copies outside the shared component
- File and line, and what it draws differently.

Rules: never mark PASS on an assumption. Open the file or read the computed style. Quote the reference's copy when a label differs. If the build cannot be started or the component is missing, stop and report that as the single FAIL.`;
}

function componentPage(c, prev, next) {
  const u = c.usage || {};
  const dd = (u.examples || []).map((e) => `    <div class="${e.kind === "use" ? "dx-do" : "dx-dont"}"><div class="dx-ex${e.row === false ? "" : " dx-row"}">${dedent(e.html)}</div><p class="dx-why"><b>${e.kind === "use" ? ICON_USE + "Use" : ICON_AVOID + "Avoid"}</b>${md(e.why)}</p></div>`).join("\n");
  const usage = `  <div class="dx-g2">
    <div class="dx-card"><span class="dx-k">Use it for</span><ul style="margin:0;padding-left:18px;font-size:13px">${(u.when || []).map((i) => `<li>${md(i)}</li>`).join("")}</ul></div>
    <div class="dx-card"><span class="dx-k">Use something else for</span><ul style="margin:0;padding-left:18px;font-size:13px">${(u.not || []).map((i) => `<li>${md(i)}</li>`).join("")}</ul></div>
  </div>
${dd ? `  <div class="dx-dd">\n${dd}\n  </div>` : ""}
${u.rules ? list(u.rules) : ""}`;
  const source = table(["Where", "What"], [
    [`\`mockups/src/engine.css\` ${c.css}`, "The rules that draw it"],
    ...(c.helpers || []).map((h) => [`\`${h[0]}\` at \`${h[1]}\``, h[2]]),
  ]) + (c.sourceNotes ? "\n" + list(c.sourceNotes) : "");
  const pn = `<nav class="dx-pn" aria-label="Components">${prev ? `<a href="${prev.slug}.html"><span>Previous</span>${esc(prev.name)}</a>` : "<span></span>"}${next ? `<a class="nx" href="${next.slug}.html"><span>Next</span>${esc(next.name)}</a>` : "<span></span>"}</nav>`;
  return `${head("../", c.name, c.summary)}
${topbar("../", "Components")}

<div class="dx-crumb"><a href="../components.html">Components</a><span aria-hidden="true">/</span><span>${esc(c.name)}</span></div>
<div class="dx-hero">
  <p class="eyebrow">${esc(c.group)}</p>
  <h1>${esc(c.name)}</h1>
  <p class="dx-lead">${md(c.lead)}</p>
  <div class="dx-meta">
    <span><b>Root</b> <code>${esc(c.root)}</code></span>
    <span><b>CSS</b> <code>engine.css</code> ${esc(c.css)}</span>
    <span><b>Used on</b> ${esc(c.usedOn.join(", "))}</span>
  </div>
</div>
${sec("examples", "Examples", "Each example is the engine's own markup, drawn by engine.css. Open Markup to copy it.", c.stories.map(story).join("\n"))}
${sec("anatomy", "Anatomy", c.anatomyNote || "", table(["Part", "Selector", "What it holds"], c.anatomy))}
${sec("usage", "Usage", c.usageNote || "", usage)}
${sec("content", "Content", "", list(c.content))}
${sec("a11y", "Accessibility", "", list(c.a11y))}
${sec("phone", "Phone", "", list(c.phone))}
${sec("tokens", "Tokens", "", table(["Token", "Role"], c.tokens.map((t) => [`\`${t[0]}\``, t[1]]), "narrow"))}
${sec("source", "Source", "Where the mockup defines and renders it.", source)}
${c.findings && c.findings.length ? sec("findings", "Findings", "", c.findings.map(findingHtml).join("\n")) : ""}
${sec("audit", "Audit prompt", `Paste it into a fresh agent session to audit a build's ${c.name.toLowerCase()} against this page.`, promptBox(`${c.name} audit`, FILL, componentPrompt(c)))}
${pn}
${foot}`;
}

function indexPage(comps, cat) {
  const bySlug = Object.fromEntries(comps.map((c) => [c.slug, c]));
  const groups = cat.groups.map((g) => {
    const members = comps.filter((c) => c.group === g.name);
    if (!members.length) return "";
    return `  <h3>${esc(g.name)}</h3>
  <p class="dx-muted" style="margin:0 0 12px;font-size:13px">${md(g.summary)}</p>
  <div class="dx-g3">
${members.map((c) => `    <a class="dx-card" href="components/${c.slug}.html"><h3>${esc(c.name)}</h3><p>${md(c.summary)}</p><p><code>${esc(c.root)}</code></p></a>`).join("\n")}
  </div>`;
  }).join("\n");
  const missing = comps.filter((c) => !cat.groups.some((g) => g.name === c.group));
  if (missing.length) throw new Error("components with no group in _catalog.mjs: " + missing.map((c) => c.slug).join(", "));
  const anatomy = `  <ol class="dx-rules">
${cat.pageAnatomy.map((a) => `    <li><div><b>${esc(a[0])}</b><p>${md(a[1])}</p></div></li>`).join("\n")}
  </ol>`;
  return `${head("", "Components", cat.summary)}
${topbar("", "Components")}

<div class="dx-hero">
  <p class="eyebrow">Design reference</p>
  <h1>Components</h1>
  <p class="dx-lead">${md(cat.lead)}</p>
  <div class="dx-meta">
    <span><b>Components</b> ${comps.length}</span>
    <span><b>Registry</b> <code>mockups/components/src/</code></span>
    <span><b>Build</b> <code>node tools/build-components.mjs</code></span>
  </div>
</div>
${sec("catalog", "Catalog", "Every reusable component inside a page, grouped by job.", groups)}
${sec("page-bound", "Page-bound components", "Components that appear on one page. Their page spec in `mockups/pages/` documents them.", table(["Component", "Root", "Page"], cat.pageBound))}
${sec("anatomy", "Reference page anatomy", "Every component page has the same sections in the same order.", anatomy)}
${sec("storybook", "Storybook", "", list(cat.storybook))}
${sec("usage", "Composition rules", "", list(cat.rules))}
${sec("a11y", "Accessibility", "Rules every component shares.", list(cat.a11y))}
${sec("findings", "Findings", "Issues that span more than one component.", cat.findings.map(findingHtml).join("\n"))}
${sec("audit", "Audit prompt", "Paste it into a fresh agent session to audit every component in a build.", promptBox("Component set audit", FILL, cat.auditPrompt(comps)))}
${foot}`;
}

// A helper row names a function and where it is: ["listify()", "engine.js:13785", …]. The engine moves
// under every pull request, so a line number goes stale without anyone touching this registry. Each
// row's line must define or call the function it names, or the build says where it moved.
const SOURCES = {};
const sourceLines = (f) => (SOURCES[f] ??= readFileSync(path.join(root, "mockups/src", f), "utf8").split("\n"));
const lineErrors = [];
function helperDrift(c) {
  const out = [];
  for (const [sig, where] of c.helpers || []) {
    const m = /^(engine|wedge)\.js:(\d+)$/.exec(where);
    if (!m) { out.push(`${c.slug}: helper ${sig} has no engine.js:N or wedge.js:N location`); continue; }
    const name = sig.replace(/\(.*$/, "").trim();
    const lines = sourceLines(`${m[1]}.js`);
    if ((lines[+m[2] - 1] || "").includes(name)) continue;
    const def = new RegExp(`^\\s*(function ${name}\\(|var ${name}\\s*=)`);
    const at = lines.findIndex((l) => def.test(l));
    out.push(`${c.slug}: ${name} is not at ${where}${at >= 0 ? `; it is defined at ${m[1]}.js:${at + 1}` : ""}`);
  }
  return out;
}

// Every class in an example must be one the product draws: engine.css styles it, or engine.js or
// wedge.js writes it into markup as a hook with no rule of its own. Anything else is invented markup.
const CSS = readFileSync(path.join(root, "mockups/src/engine.css"), "utf8");
const JS = ["engine.js", "wedge.js"].map((f) => readFileSync(path.join(root, "mockups/src", f), "utf8")).join("\n");
// toolCell() and catChips() write the tool category as t-<category>, from TCAT_ORDER.
const TCAT = (JS.match(/var TCAT_ORDER=\[([^\]]*)\]/) || ["", ""])[1].match(/[a-z]+/g) || [];
// agentCard() writes its layout as agc-<layout>.
const EMITTED = new Set([...TCAT.map((t) => `t-${t}`), "agc-list", "agc-compact", "agc-detail"]);
for (const m of JS.matchAll(/class=\\?"([^"\\']*)/g)) for (const k of m[1].split(/\s+/)) if (/^[a-z][\w-]*$/.test(k)) EMITTED.add(k);
const esc2 = (k) => k.replace(/[-]/g, "\\-");
function unknownClasses(c) {
  const html = [...c.stories.map((s) => s.html), ...((c.usage && c.usage.examples) || []).map((e) => e.html)].join("\n");
  const seen = new Set();
  for (const m of html.matchAll(/class="([^"]*)"/g)) for (const k of m[1].split(/\s+/)) if (k) seen.add(k);
  return [...seen].filter((k) => !EMITTED.has(k) && !new RegExp(`\\.${esc2(k)}(?![\\w-])`).test(CSS))
    .map((k) => `${c.slug}: class "${k}" is neither styled by engine.css nor written by the engine`);
}

async function load() {
  const files = readdirSync(SRC).filter((f) => f.endsWith(".mjs") && !f.startsWith("_")).sort();
  const comps = [];
  for (const f of files) {
    const c = (await import(pathToFileURL(path.join(SRC, f)).href)).default;
    const slug = f.replace(/\.mjs$/, "");
    if (c.slug !== slug) throw new Error(`${f}: slug is "${c.slug}", expected "${slug}"`);
    for (const k of ["name", "group", "summary", "lead", "root", "css", "usedOn", "stories", "anatomy", "content", "a11y", "phone", "tokens", "audit"])
      if (c[k] == null) throw new Error(`${f}: missing ${k}`);
    if (!c.audit.checks || c.audit.checks.length < 5) throw new Error(`${f}: audit.checks needs at least five component checks`);
    comps.push(c);
  }
  for (const c of comps) lineErrors.push(...helperDrift(c), ...unknownClasses(c));
  const cat = (await import(pathToFileURL(path.join(SRC, "_catalog.mjs")).href)).default;
  const order = cat.groups.map((g) => g.name);
  comps.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || (a.order ?? 50) - (b.order ?? 50) || a.name.localeCompare(b.name));
  return { comps, cat };
}

// --only <slug> builds one page from one module, with no previous and next links, so a module can be
// previewed while another is half written. The full build is what gets committed.
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
if (only) {
  const c = (await import(pathToFileURL(path.join(SRC, `${only}.mjs`)).href + `?t=${Date.now()}`)).default;
  writeFileSync(path.join(OUT, `${only}.html`), componentPage(c, null, null));
  console.log(`wrote mockups/components/${only}.html (preview, no previous and next links)`);
  process.exit(0);
}

const { comps, cat } = await load();
const out = new Map();
comps.forEach((c, i) => out.set(path.join(OUT, `${c.slug}.html`), componentPage(c, comps[i - 1], comps[i + 1])));
out.set(INDEX, indexPage(comps, cat));
out.set(MANIFEST, JSON.stringify({
  generated: "by tools/build-components.mjs from mockups/components/src; do not edit",
  components: comps.map((c) => ({
    slug: c.slug, name: c.name, group: c.group, summary: c.summary, root: c.root, page: `components/${c.slug}.html`,
    stories: c.stories.map((s) => ({ id: s.id, name: s.name, canvas: s.canvas || "ink", html: dedent(s.html) })),
  })),
}, null, 2) + "\n");

if (lineErrors.length) {
  for (const e of lineErrors) console.log("drift " + e);
  console.log(`${lineErrors.length} registry errors; fix them in mockups/components/src`);
  process.exit(1);
}

// A page in mockups/components/ that no module produced is stale.
const stale = readdirSync(OUT).filter((f) => f.endsWith(".html") && !out.has(path.join(OUT, f)));
let bad = 0;
for (const [file, text] of out) {
  const rel = path.relative(root, file);
  if (check) {
    const now = existsSync(file) ? readFileSync(file, "utf8") : null;
    if (now !== text) { bad++; console.log(`stale ${rel}`); }
  } else writeFileSync(file, text);
}
for (const f of stale) { bad++; console.log(`stale mockups/components/${f}: no module in mockups/components/src makes it`); }
if (check) {
  console.log(bad ? `${bad} files differ; run node tools/build-components.mjs` : `ok   ${out.size} component reference files match the registry`);
  process.exit(bad ? 1 : 0);
}
console.log(`wrote ${out.size} files (${comps.length} components, the index, the manifest)`);
if (stale.length) { console.log("stale pages with no module: " + stale.join(", ")); process.exit(1); }
