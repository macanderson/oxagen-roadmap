// The data the review island (mockups/src/island.js) reads, built from files a person edits:
//
//   pages   one entry per page in mockups/catalog.mjs: its group, the states its renderer has, the
//           title from the first `# ` line of mockups/pages/<id>.md, and the first paragraph of
//           that spec's `## Job` section as the page description.
//   help    one entry per `## ` section of mockups/help/*.md, keyed `<file>/<slug of the heading>`,
//           or by the key a heading names itself with a trailing `{#key}`. The island opens the entry
//           whose key a page part carries.
//
// The markdown is rendered here, at build time, by a small renderer that covers what the help and
// the specs use: headings, paragraphs, lists (nested by indent), tables, fenced code, block quotes,
// rules, and inline code, bold, italic and links. Raw HTML in the markdown is escaped, never passed.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

export const SPEC_BASE = "https://github.com/macanderson/oxagen-roadmap/blob/main/mockups/pages/";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function slug(s) {
  return String(s || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function inline(src) {
  const codes = [];
  let s = String(src).replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => {
    const safe = /^(https?:|#|\.{0,2}\/|[a-z0-9_-]+\.md)/i.test(u) ? u : "#";
    const ext = /^https?:/i.test(safe);
    return `<a href="${safe}"${ext ? ' target="_blank" rel="noopener"' : ""}>${t}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  s = s.replace(/(^|[^\w*])\*([^*\s][^*]*?)\*(?!\w)/g, "$1<i>$2</i>");
  s = s.replace(/(^|[^\w])_([^_\s][^_]*?)_(?!\w)/g, "$1<i>$2</i>");
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
}

const cells = (row) => row.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));

// Markdown → HTML for the subset above. Headings drop `shift` levels (a help section's `###` is an h3).
export function markdown(md) {
  const L = String(md).replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  const isList = (l) => /^\s*([-*+]|\d+[.)])\s+/.test(l);
  const isTable = (a, b) => /^\s*\|.*\|\s*$/.test(a || "") && /^\s*\|?\s*:?-{3,}/.test(b || "");
  function list(start) {
    const base = L[start].match(/^\s*/)[0].length;
    const ordered = /^\s*\d+[.)]/.test(L[start]);
    const items = [];
    let j = start;
    while (j < L.length) {
      const l = L[j];
      if (!l.trim()) { if (j + 1 < L.length && isList(L[j + 1]) && L[j + 1].match(/^\s*/)[0].length >= base) { j++; continue; } break; }
      const ind = l.match(/^\s*/)[0].length;
      if (isList(l) && ind === base) { items.push({ text: l.replace(/^\s*([-*+]|\d+[.)])\s+/, ""), sub: "" }); j++; continue; }
      if (isList(l) && ind > base) { const r = list(j); items[items.length - 1].sub += r.html; j = r.end; continue; }
      if (ind > base && items.length) { items[items.length - 1].text += " " + l.trim(); j++; continue; }
      break;
    }
    const tag = ordered ? "ol" : "ul";
    // A list a table interrupts goes on from its own number.
    const n = ordered ? parseInt(L[start].trim(), 10) : 1;
    const at = ordered && n > 1 ? ` start="${n}"` : "";
    return { html: `<${tag}${at}>${items.map((it) => `<li>${inline(it.text)}${it.sub}</li>`).join("")}</${tag}>`, end: j };
  }
  while (i < L.length) {
    const l = L[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = /^```/.exec(l))) {
      const buf = []; i++;
      while (i < L.length && !/^```/.test(L[i])) buf.push(L[i++]);
      i++;
      out.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }
    if ((m = /^(#{1,6})\s+(.*)$/.exec(l))) { const n = Math.min(6, m[1].length); out.push(`<h${n}>${inline(m[2])}</h${n}>`); i++; continue; }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { out.push("<hr>"); i++; continue; }
    if (isTable(l, L[i + 1])) {
      const head = cells(l); i += 2;
      const rows = [];
      while (i < L.length && /^\s*\|/.test(L[i])) rows.push(cells(L[i++]));
      out.push(`<div class="ih-tw"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>` +
        rows.map((r) => `<tr>${head.map((_, k) => `<td>${inline(r[k] || "")}</td>`).join("")}</tr>`).join("") + "</tbody></table></div>");
      continue;
    }
    if (/^\s*>/.test(l)) {
      const buf = [];
      while (i < L.length && /^\s*>/.test(L[i])) buf.push(L[i++].replace(/^\s*>\s?/, ""));
      out.push(`<blockquote>${markdown(buf.join("\n"))}</blockquote>`);
      continue;
    }
    if (isList(l)) { const r = list(i); out.push(r.html); i = r.end; continue; }
    const buf = [];
    while (i < L.length && L[i].trim() && !/^(#{1,6}\s|```|\s*>)/.test(L[i]) && !isList(L[i]) && !isTable(L[i], L[i + 1])) buf.push(L[i++].trim());
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }
  return out.join("\n");
}

// One help file → its sections. The `# ` line is the file's title and is not a section.
export function helpSections(file, text) {
  const ns = path.basename(file, ".md");
  const out = [];
  let cur = null;
  let fence = false;
  for (const line of text.replace(/\r/g, "").split("\n")) {
    if (/^```/.test(line)) fence = !fence;
    const m = !fence && /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      const k = /\{#([a-z0-9/_-]+)\}\s*$/.exec(m[1]);
      const title = m[1].replace(/\s*\{#[a-z0-9/_-]+\}\s*$/, "").trim();
      cur = { key: k ? k[1] : `${ns}/${slug(title)}`, title, body: [], file };
      out.push(cur);
      continue;
    }
    if (cur) cur.body.push(line);
  }
  // An HTML comment is a note to the next editor and never renders. `<!-- open: <js> -->` tells
  // tools/check-help.mjs how to open a dialog the sources give no literal call for.
  return out.map((s) => {
    const raw = s.body.join("\n");
    const open = /<!--\s*open:\s*([\s\S]+?)\s*-->/.exec(raw);
    return { key: s.key, title: s.title, file: s.file, open: open ? open[1] : null, md: raw.replace(/<!--[\s\S]*?-->/g, "").trim() };
  });
}

export function helpOpeners(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "README.md").sort()
    .flatMap((f) => helpSections(f, readFileSync(path.join(dir, f), "utf8")))
    .filter((s) => s.open).map((s) => ({ key: s.key, js: s.open }));
}

export function readHelp(dir) {
  const help = {};
  const dup = [];
  if (!existsSync(dir)) return { help, dup };
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "README.md").sort()) {
    for (const s of helpSections(f, readFileSync(path.join(dir, f), "utf8"))) {
      if (help[s.key]) dup.push(`${s.key} (${help[s.key].f} and ${f})`);
      help[s.key] = { t: s.title, h: markdown(s.md), f };
    }
  }
  return { help, dup };
}

// The page's title and the first paragraph of its Job section, from mockups/pages/<id>.md.
export function pageMeta(file) {
  if (!existsSync(file)) return null;
  const L = readFileSync(file, "utf8").replace(/\r/g, "").split("\n");
  const title = (L.find((l) => /^#\s+/.test(l)) || "").replace(/^#\s+/, "").trim();
  const j = L.findIndex((l) => /^##\s+Job\s*$/.test(l));
  let job = "";
  if (j >= 0) {
    let k = j + 1;
    while (k < L.length && !L[k].trim()) k++;
    const buf = [];
    while (k < L.length && L[k].trim() && !/^#/.test(L[k])) buf.push(L[k++].trim());
    job = buf.join(" ");
  }
  return { title, job };
}

export function reviewData({ pages, pagesDir, helpDir, states }) {
  const out = { spec: SPEC_BASE, states, pages: {}, help: {} };
  for (const p of pages) {
    const meta = pageMeta(path.join(pagesDir, `${p.id}.md`)) || { title: p.title, job: "" };
    out.pages[p.id] = { t: meta.title || p.title, g: p.group, states: p.states, job: inline(meta.job), jobLong: meta.job.length > 300 };
  }
  const { help, dup } = readHelp(helpDir);
  if (dup.length) throw new Error(`mockups/help: a key is written twice: ${dup.join("; ")}`);
  out.help = help;
  return out;
}
