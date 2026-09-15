import { defineCollections, defineConfig } from "fumadocs-mdx/config";
import rehypeRaw from "rehype-raw";
import { z } from "zod";
import { firstHeading, summary } from "./scripts/lib.mjs";
import { remarkSite } from "./src/lib/remark-site.mjs";

// The repo markdown carries no frontmatter: the title is its first heading and the description a
// summary taken from the body (see summary() in scripts/lib.mjs). Generated MDX may set both in
// frontmatter, which wins. A description taken from the body is already on the page, so the page
// renders only frontmatter descriptions under the title; the others serve metadata and search.
const schema = ({ source }: { source: string }) =>
  z
    .object({ title: z.string().optional(), description: z.string().optional() })
    .passthrough()
    .transform((data) => ({
      ...data,
      title: data.title ?? firstHeading(source) ?? "Untitled",
      description: data.description ?? summary(source),
      descriptionInBody: data.description === undefined,
    }));

/** docs/*.md: the spec, the plan, the desktop spec, the prompts, the W13 doc, and the walkthrough. */
export const docs = defineCollections({ type: "doc", dir: "../docs", files: ["*.md"], schema });

/** pages/*.md: every page spec, every audit prompt, and the pages README. */
export const pages = defineCollections({ type: "doc", dir: "../pages", files: ["*.md"], schema });

/** Written by scripts/prepare.mjs: scenario outlines, indexes, and the walkthrough stub. */
export const generated = defineCollections({ type: "doc", dir: ".generated/content", files: ["**/*.md", "**/*.mdx"], schema });

// Raw HTML in the markdown (the desktop spec's comparison table) renders; MDX nodes pass through.
const passThrough = ["mdxjsEsm", "mdxFlowExpression", "mdxJsxFlowElement", "mdxJsxTextElement", "mdxTextExpression"];

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (plugins) => [remarkSite, ...plugins],
    rehypePlugins: (plugins) => [[rehypeRaw, { passThrough }], ...plugins],
    rehypeCodeOptions: {
      themes: { light: "github-light", dark: "github-dark" },
    },
  },
});
