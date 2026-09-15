// Shared by the prepare step, the scenario generator and the MDX pipeline. Everything here reads
// the repo's own sources (mockups/catalog.mjs, mockups/pages/README.md, the markdown) and never
// writes into them.
import fs from "node:fs";
import path from "node:path";
import { PAGES as CATALOG_PAGES, SCENARIOS as CATALOG_SCENARIOS, mockupUrl } from "../../mockups/catalog.mjs";
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

/** Where the page specs and audit prompts live. */
export const PAGE_DIR = "mockups/pages";
/** The master mockup as the site serves it: every page, state, shell and scenario is a URL of it. */
export const MOCKUP = "/mock/mockups/missioncontrol.html";

/** One view of the master mockup; `product` hides the mockup chrome (a scenario needs it shown). */
export function mockHref({ state = null, mobile = null, hash = null, product = true } = {}) {
  return mockupUrl(MOCKUP, { product, state, mobile, hash: hash ?? undefined });
}

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

/**
 * The one-line summary of a markdown file: in a page spec, the last paragraph of its Job section
 * (a lead note there points at a variant page, such as the interjection page for Fleet and Run);
 * anywhere else, the first paragraph.
 */
export function summary(source, max = 220) {
  const job = /^## Job\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(source);
  const paras = job ? job[1].split(/\n\s*\n/).filter((p) => p.trim()) : [];
  return paras.length ? firstParagraph(`# Job\n\n${paras[paras.length - 1]}`, max) ?? firstParagraph(source, max) : firstParagraph(source, max);
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
  // Page specs moved from pages/ to mockups/pages/; a link written against either resolves.
  const page = /^(?:mockups\/)?pages\/(.+)$/.exec(rel)?.[1];
  if (page !== undefined) {
    if ((m = /^([\w-]+)\.audit-prompt\.md$/.exec(page))) return `/audit-prompts/${m[1]}/${hash}`;
    if (page === "audit-prompt.md") return `/audit-prompts/${hash}`;
    if (page === "README.md") return `/pages/${hash}`;
    if ((m = /^([\w-]+)\.md$/.exec(page))) return `/pages/${m[1]}/${hash}`;
    // A per-state page file (id-state[-mobile].html) is now a URL of the master mockup.
    if ((m = /^([\w-]+?)-(loaded|empty|loading|error|denied)(-mobile)?\.html$/.exec(page))) {
      const entry = CATALOG_PAGES.find((p) => p.id === m[1]);
      if (entry) return mockHref({ state: m[2], mobile: Boolean(m[3]), hash: entry.hash });
    }
  }
  if (rel === "mockups/missioncontrol.html") return `${MOCKUP}${hash}`;
  if (rel === "docs/walkthrough.md") return `/${hash}`;
  if ((m = /^docs\/([^/]+\.md)$/.exec(rel))) return `/specs/${docSlug(m[1])}/${hash}`;
  if (/^docs\/_house\/.+/.test(rel) || /^badges\/.+/.test(rel) || /^docs\/[^/]+\.html$/.test(rel)) return `/mock/${rel}${hash}`;
  return `${GITHUB}/blob/main/${rel}${hash}`;
}

/** A link per scenario straight into the mockup, with its chrome (the scenario rail) shown. */
export function CATALOG_SCENARIO_LINKS() {
  return CATALOG_SCENARIOS.map((s) => ({
    text: `W${s.n} · ${s.title}`,
    href: mockHref({ product: false, hash: `#/${ORG}/${s.ws}/scenarios/${s.id}/1` }),
  }));
}

/** The guided scenarios in W order, as mockups/catalog.mjs declares them. */
export function readScenarioCatalog() {
  return CATALOG_SCENARIOS.map((s) => ({ scenario: s.id, title: s.title, label: `W${s.n}` }));
}

const CATALOG_GROUP = { Workspace: GROUPS[0], Register: GROUPS[0], Organization: GROUPS[1], Auth: GROUPS[2], Onboarding: GROUPS[2] };

/**
 * Every page, in the order mockups/pages/README.md lists them and then the catalog's, with its
 * title, group (from the Scope row of its spec, else the catalog group), the states the renderer
 * implements, its route, and whether it has an audit prompt. Ids, routes and states come from
 * mockups/catalog.mjs.
 */
export function readPages() {
  const readme = read(`${PAGE_DIR}/README.md`);
  const listed = /Pages \(\d+\):([\s\S]*?)\.\s*(?:\n\s*\n|$)/.exec(readme);
  const order = listed ? listed[1].split("·").map((s) => s.trim()).filter(Boolean) : [];
  const ids = [...new Set([...order, ...CATALOG_PAGES.map((p) => p.id)])].filter((id) => fs.existsSync(path.join(REPO, PAGE_DIR, `${id}.md`)));
  return ids.map((id) => {
    const md = read(`${PAGE_DIR}/${id}.md`);
    const scope = (/^\|\s*Scope\s*\|\s*([^|]+?)\s*\|/m.exec(md)?.[1] ?? "").toLowerCase();
    const d = CATALOG_PAGES.find((x) => x.id === id);
    const group = scope.startsWith("organization")
      ? GROUPS[1]
      : scope.startsWith("auth") || scope.startsWith("onboarding")
        ? GROUPS[2]
        : scope
          ? GROUPS[0]
          : (CATALOG_GROUP[d?.group] ?? GROUPS[0]);
    return {
      id,
      title: firstHeading(md) ?? d?.title ?? id,
      shortTitle: d?.title ?? id,
      hash: d?.hash ?? null,
      group,
      states: STATES.filter((s) => d?.states.includes(s)),
      audit: fs.existsSync(path.join(REPO, PAGE_DIR, `${id}.audit-prompt.md`)),
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
