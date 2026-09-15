import { docs, generated, pages } from "@/.source/server";
import { loader, type MetaData, type Source } from "fumadocs-core/source";
import { DOCS, docSlug } from "./doc-slugs.mjs";
import { GROUPS, manifest } from "./manifest";

type Entry = (typeof docs)[number] | (typeof pages)[number] | (typeof generated)[number];
export type Kind = "walkthrough" | "page" | "audit" | "scenario" | "spec" | "index";
export type SiteData = Entry & { kind: Kind; pageId?: string };

type Files = Source<{ pageData: SiteData; metaData: MetaData }>["files"];
const files: Files = [];

const rel = (e: Entry) => e.info.path.replace(/\\/g, "/");
const addPage = (path: string, entry: Entry, kind: Kind, pageId?: string) =>
  files.push({ type: "page", path, absolutePath: entry.info.fullPath, data: { ...entry, kind, pageId } });
const addMeta = (path: string, data: MetaData) => files.push({ type: "meta", path, data });

// Walkthrough first: docs/walkthrough.md once it lands, the generated stub until then.
const walkthrough = docs.find((e) => rel(e) === "walkthrough.md") ?? generated.find((e) => rel(e) === "walkthrough.md");
if (walkthrough) addPage("index.md", walkthrough, "walkthrough");

for (const e of pages) {
  const f = rel(e);
  if (f === "README.md") addPage("pages/index.md", e, "index");
  else if (f === "audit-prompt.md") addPage("audit-prompts/index.md", e, "index");
  else if (f.endsWith(".audit-prompt.md")) {
    const id = f.slice(0, -".audit-prompt.md".length);
    addPage(`audit-prompts/${id}.md`, e, "audit", id);
  } else {
    const id = f.slice(0, -".md".length);
    addPage(`pages/${id}.md`, e, "page", id);
  }
}

for (const e of docs) {
  const f = rel(e);
  if (f !== "walkthrough.md") addPage(`specs/${docSlug(f)}.md`, e, "spec");
}

for (const e of generated) {
  const f = rel(e);
  if (f === "walkthrough.md") continue;
  addPage(f, e, f.endsWith("/index.mdx") ? "index" : f.startsWith("scenarios/") ? "scenario" : "spec");
}

const grouped = (ids: (p: (typeof manifest.pages)[number]) => boolean) =>
  GROUPS.flatMap((g) => {
    const list = manifest.pages.filter((p) => p.group === g && ids(p)).map((p) => p.id);
    return list.length ? [`---${g}---`, ...list] : [];
  });

addMeta("meta.json", { pages: ["index", "pages", "scenarios", "specs", "audit-prompts"] });
addMeta("pages/meta.json", { title: "Pages", defaultOpen: true, pages: grouped(() => true) });
addMeta("scenarios/meta.json", { title: "Scenarios", defaultOpen: true, pages: manifest.scenarios.map((s) => s.id) });
// Catalog: the Storybook catalog, built by `npm run build-storybook` and copied to out/storybook/ by
// scripts/catalog.mjs as the last step of `pnpm build`.
addMeta("specs/meta.json", { title: "Specs & plans", pages: [...DOCS.map(([, slug]) => slug), "...", "rendered-html", "[Catalog](/storybook/)"] });
addMeta("audit-prompts/meta.json", { title: "Audit prompts", pages: grouped((p) => p.audit) });

export const source = loader({ baseUrl: "/", source: { files } });
