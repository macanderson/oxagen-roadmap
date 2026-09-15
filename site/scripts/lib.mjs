// Shared by the prepare step, the scenario generator and the MDX pipeline. Everything here reads
// the repo's own sources (pages/README.md, tools/build-pages.mjs, tools/build-w.mjs, the markdown)
// and never writes into them.
import fs from "node:fs";
import path from "node:path";
import { docSlug } from "../src/lib/doc-slugs.mjs";

// Scripts and the MDX config both run with the site directory as the working directory.
export const SITE = process.cwd();
export const REPO = path.resolve(SITE, "..");
export const GEN = path.join(SITE, ".generated");
export const GEN_CONTENT = path.join(GEN, "content");
export const GITHUB = "https://github.com/macanderson/tmp-oxagen-mockups";
export const ORG = "a-intel";

export const STATES = ["loaded", "empty", "loading", "error", "denied"];
export const GROUPS = ["Workspace", "Organization", "Auth & onboarding"];

const read = (rel) => fs.readFileSync(path.join(REPO, rel), "utf8");

/** Markdown inline syntax reduced to its text. */
export function plain(md) {
  return String(md)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|\W)[*_]([^*_]+)[*_](?=\W|$)/g, "$1$2")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Lines outside fenced code blocks, with their index. */
function proseLines(source) {
  const out = [];
  let fence = null;
  source.split("\n").forEach((line, i) => {
    const m = /^\s*(```+|~~~+)/.exec(line);
    if (m) {
      if (!fence) fence = m[1][0];
      else if (m[1][0] === fence) fence = null;
      return;
    }
    if (!fence) out.push([line, i]);
  });
  return out;
}

export function firstHeading(source) {
  for (const [line] of proseLines(source)) {
    const m = /^#\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) return plain(m[1]);
  }
  return undefined;
}

/** The first prose paragraph after the title: not a table, heading, rule, list, quote or HTML. */
export function firstParagraph(source, max = 220) {
  const lines = proseLines(source);
  const start = lines.findIndex(([l]) => /^#\s/.test(l));
  let para = [];
  let lastIndex = -2;
  for (const [line, i] of lines.slice(start + 1)) {
    const t = line.trim();
    const isProse = t && !/^(\||#|---|\*\*\*|>|[-*+]\s|\d+\.\s|<)/.test(t);
    if (para.length) {
      if (isProse && i === lastIndex + 1) {
        para.push(t);
        lastIndex = i;
        continue;
      }
      break;
    }
    if (isProse) {
      para.push(t);
      lastIndex = i;
    }
  }
  if (!para.length) return undefined;
  const text = plain(para.join(" "));
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "") + "…";
}

/** GitHub-style heading anchor. */
export function slugify(text) {
  return plain(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

/**
 * A relative link written in a repo markdown file, turned into the site URL for the same thing:
 * a page spec, an audit prompt, a spec or plan section, or a generated HTML file under /mock.
 * Returns null for links that are already absolute or point outside the repo.
 */
export function rewriteRepoUrl(url, fromFile) {
  if (!url || !fromFile || /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("#") || url.startsWith("/")) return null;
  const hashAt = url.indexOf("#");
  const target = hashAt === -1 ? url : url.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : url.slice(hashAt);
  if (!target) return null;
  let rel;
  try {
    rel = path.relative(REPO, path.resolve(path.dirname(fromFile), decodeURI(target))).split(path.sep).join("/");
  } catch {
    return null;
  }
  if (rel.startsWith("..")) return null;
  let m;
  if ((m = /^pages\/([\w-]+)\.audit-prompt\.md$/.exec(rel))) return `/audit-prompts/${m[1]}/${hash}`;
  if (rel === "pages/audit-prompt.md") return `/audit-prompts/${hash}`;
  if (rel === "pages/README.md") return `/pages/${hash}`;
  if ((m = /^pages\/([\w-]+)\.md$/.exec(rel))) return `/pages/${m[1]}/${hash}`;
  if (rel === "docs/walkthrough.md") return `/${hash}`;
  if ((m = /^docs\/([^/]+\.md)$/.exec(rel))) return `/specs/${docSlug(m[1])}/${hash}`;
  if (
    /^pages\/.+/.test(rel) ||
    /^docs\/_house\/.+/.test(rel) ||
    /^badges\/.+/.test(rel) ||
    /^docs\/[^/]+\.html$/.test(rel) ||
    /^[^/]+\.html$/.test(rel)
  )
    return `/mock/${rel}${hash}`;
  return `${GITHUB}/blob/main/${rel}${hash}`;
}

/** The W files and the scenario each one boots, as tools/build-w.mjs declares them. */
export function readWFiles() {
  const src = read("tools/build-w.mjs");
  const out = [];
  for (const m of src.matchAll(/\[\s*"(w\d+-[\w-]+\.html)",\s*"([\w-]+)",\s*"((?:[^"\\]|\\.)*)"\s*\]/g)) {
    out.push({ file: m[1], scenario: m[2], title: m[3], label: m[1].match(/^w(\d+)/)[0].toUpperCase() });
  }
  return out;
}

/**
 * Every page, in the order pages/README.md lists them, with its title, group (from the Scope row
 * of its spec), the states that exist on disk, and whether it has an audit prompt. The page ids
 * and boot hashes come from PAGES in tools/build-pages.mjs.
 */
export function readPages() {
  const build = read("tools/build-pages.mjs");
  const declared = [...build.matchAll(/\{\s*id:\s*"([\w-]+)",\s*title:\s*"([^"]*)",\s*hash:\s*"([^"]*)"/g)].map((m) => ({
    id: m[1],
    shortTitle: m[2],
    hash: m[3],
  }));
  const readme = read("pages/README.md");
  const listed = /Pages \(\d+\):([\s\S]*?)\.\s*(?:\n\s*\n|$)/.exec(readme);
  const order = listed ? listed[1].split("·").map((s) => s.trim()).filter(Boolean) : [];
  const ids = [...new Set([...order, ...declared.map((d) => d.id)])].filter((id) => fs.existsSync(path.join(REPO, "pages", `${id}.md`)));
  return ids.map((id) => {
    const md = read(`pages/${id}.md`);
    const scope = (/^\|\s*Scope\s*\|\s*([^|]+?)\s*\|/m.exec(md)?.[1] ?? "").toLowerCase();
    const group = scope.startsWith("organization") ? GROUPS[1] : scope.startsWith("auth") || scope.startsWith("onboarding") ? GROUPS[2] : GROUPS[0];
    const d = declared.find((x) => x.id === id);
    return {
      id,
      title: firstHeading(md) ?? d?.shortTitle ?? id,
      shortTitle: d?.shortTitle ?? id,
      hash: d?.hash ?? null,
      group,
      states: STATES.filter((s) => fs.existsSync(path.join(REPO, "pages", `${id}-${s}.html`))),
      audit: fs.existsSync(path.join(REPO, "pages", `${id}.audit-prompt.md`)),
    };
  });
}

export function writeGenerated(rel, content) {
  const file = path.join(GEN_CONTENT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

/** Escape text for an MDX paragraph. */
export function mdxText(text) {
  return String(text).replace(/[\\`*_{}[\]<>|~&]/g, "\\$&").replace(/\s*\n\s*/g, " ");
}

export function yamlString(text) {
  return JSON.stringify(String(text));
}
