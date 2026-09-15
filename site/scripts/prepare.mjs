// Runs before dev and build. Everything it writes is gitignored:
//   public/mock/            the served HTML (mockups/missioncontrol.html, docs/*.html, docs/_house,
//                           badges), copied so relative paths keep working
//   .generated/content/     scenario outlines, the scenarios index, the rendered-HTML index, and a
//                           walkthrough stub while docs/walkthrough.md is absent
//   .generated/manifest.json  page states, groups, audit prompts, walkthrough and scenario links
import fs from "node:fs";
import path from "node:path";
import { CATALOG_SCENARIO_LINKS, GEN, GEN_CONTENT, MOCKUP, REPO, SITE, mdxText, plain, readPages, rewriteRepoUrl, slugify, writeGenerated } from "./lib.mjs";
import { generateScenarios } from "./gen-scenarios.mjs";

const MOCK = path.join(SITE, "public", "mock");

function syncMock() {
  fs.rmSync(MOCK, { recursive: true, force: true });
  fs.mkdirSync(path.join(MOCK, "docs"), { recursive: true });
  const copy = (rel) => fs.cpSync(path.join(REPO, rel), path.join(MOCK, rel), { recursive: true });
  let n = 0;
  for (const rel of ["mockups/missioncontrol.html", "badges", "docs/_house"]) {
    if (fs.existsSync(path.join(REPO, rel))) {
      copy(rel);
      n++;
    }
  }
  for (const f of fs.readdirSync(path.join(REPO, "docs"))) {
    if (f.endsWith(".html")) {
      copy(`docs/${f}`);
      n++;
    }
  }
  return n;
}

/** Per page: the walkthrough sections that link it, and the spec and plan links in those sections. */
function walkthroughLinks(file) {
  const byPage = new Map();
  if (!fs.existsSync(file)) return byPage;
  let fence = false;
  let section = null;
  const sections = [];
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (fence) continue;
    const h = /^(#{2,4})\s+(.+?)\s*$/.exec(line);
    if (h) {
      section = { title: plain(h[2]), anchor: slugify(h[2]), links: [] };
      sections.push(section);
      continue;
    }
    if (!section) continue;
    for (const m of line.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) {
      section.links.push({ text: plain(m[1]), href: rewriteRepoUrl(m[2], file) ?? m[2] });
    }
  }
  for (const s of sections) {
    const pageIds = new Set(s.links.map((l) => /^\/pages\/([\w-]+)\/$/.exec(l.href.split("#")[0])?.[1]).filter(Boolean));
    const spec = s.links.filter((l) => l.href.startsWith("/specs/mission-control-spec/"));
    const plan = s.links.filter((l) => l.href.startsWith("/specs/implementation-plan/"));
    for (const id of pageIds) {
      const entry = byPage.get(id) ?? { walkthrough: [], spec: [], plan: [] };
      entry.walkthrough.push({ text: s.title, href: `/#${s.anchor}` });
      for (const l of spec) if (!entry.spec.some((x) => x.href === l.href)) entry.spec.push(l);
      for (const l of plan) if (!entry.plan.some((x) => x.href === l.href)) entry.plan.push(l);
      byPage.set(id, entry);
    }
  }
  return byPage;
}

function writeWalkthroughStub(pages, scenarios) {
  writeGenerated(
    "walkthrough.md",
    [
      "# Walkthrough",
      "",
      "`docs/walkthrough.md` is not on this branch yet. This page is generated from mockups/pages/README.md and mockups/catalog.mjs until it lands, and lists every page in build order and every scenario.",
      "",
      ...["Workspace", "Organization", "Auth & onboarding"].flatMap((g) => [
        `## ${g}`,
        "",
        ...pages.filter((p) => p.group === g).map((p) => `- [${mdxText(p.title)}](/pages/${p.id}/)`),
        "",
      ]),
      "## Scenarios",
      "",
      ...scenarios.map((s) => `- [${mdxText(s.title)}](/scenarios/${s.id}/)`),
      "",
    ].join("\n"),
  );
}

function writeRenderedIndex() {
  const titleOf = (rel) => {
    const html = fs.readFileSync(path.join(REPO, rel), "utf8").slice(0, 4000);
    return plain(/<title>([^<]*)<\/title>/i.exec(html)?.[1] ?? rel);
  };
  const row = (rel) => `- [${mdxText(titleOf(rel))}](/mock/${rel}) \`${rel}\``;
  const docsHtml = fs.readdirSync(path.join(REPO, "docs")).filter((f) => f.endsWith(".html")).sort().map((f) => `docs/${f}`);
  writeGenerated(
    "specs/rendered-html.mdx",
    [
      "---",
      'title: "Rendered HTML"',
      'description: "The house-rendered companions of the docs, and the master mockup, served as they are."',
      "---",
      "",
      "## Specs, plans and reviews",
      "",
      ...docsHtml.map(row),
      "",
      "## The master mockup",
      "",
      ...["mockups/missioncontrol.html", "badges/index.html"].filter((f) => fs.existsSync(path.join(REPO, f))).map(row),
      `- [The product build, without the mockup chrome](${MOCKUP}?product=1)`,
      "",
      "## Scenarios in the mockup",
      "",
      ...CATALOG_SCENARIO_LINKS().map((l) => `- [${mdxText(l.text)}](${l.href})`),
      "",
    ].join("\n"),
  );
}

fs.rmSync(GEN_CONTENT, { recursive: true, force: true });
fs.mkdirSync(GEN_CONTENT, { recursive: true });

const copied = syncMock();
const pages = readPages();
const scenarios = generateScenarios({ pages });
const walkFile = path.join(REPO, "docs", "walkthrough.md");
const hasWalkthrough = fs.existsSync(walkFile);
if (!hasWalkthrough) writeWalkthroughStub(pages, scenarios);
writeRenderedIndex();

const walk = walkthroughLinks(walkFile);
const manifest = {
  walkthrough: hasWalkthrough ? "docs/walkthrough.md" : null,
  pages: pages.map((p) => ({
    ...p,
    walkthrough: walk.get(p.id)?.walkthrough ?? [],
    spec: walk.get(p.id)?.spec ?? [],
    plan: walk.get(p.id)?.plan ?? [],
    scenarios: scenarios
      .map((s) => ({ id: s.id, title: s.title, steps: s.steps.filter((st) => st.page === p.id).map((st) => st.n) }))
      .filter((s) => s.steps.length),
  })),
  scenarios,
};
fs.mkdirSync(GEN, { recursive: true });
fs.writeFileSync(path.join(GEN, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(
  `prepare: ${copied} mock sources → public/mock; ${pages.length} pages; ${scenarios.length} scenarios; walkthrough ${hasWalkthrough ? "docs/walkthrough.md" : "stub"}`,
);
