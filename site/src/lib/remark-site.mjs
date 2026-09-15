// Site-side transforms over the repo markdown, so the files themselves stay as they are:
// - the first `#` heading is dropped (the page title renders it),
// - relative links to other repo files become site URLs (page specs, audit prompts, spec
//   sections, /mock HTML), or GitHub URLs for files the site does not carry,
// - ```mermaid fences render as diagrams.
import { rewriteRepoUrl } from "../../scripts/lib.mjs";

function walk(node, visit, parent = null, index = 0) {
  visit(node, parent, index);
  if (Array.isArray(node.children)) node.children.forEach((child, i) => walk(child, visit, node, i));
}

export function remarkSite() {
  return (tree, file) => {
    const first = tree.children.findIndex((n) => !["yaml", "toml", "mdxjsEsm"].includes(n.type));
    if (first !== -1 && tree.children[first].type === "heading" && tree.children[first].depth === 1) tree.children.splice(first, 1);

    const from = file.path ?? file.history?.[0];
    walk(tree, (node, parent, index) => {
      if ((node.type === "link" || node.type === "definition") && typeof node.url === "string") {
        const next = rewriteRepoUrl(node.url, from);
        if (next) node.url = next;
      }
      if (node.type === "code" && node.lang === "mermaid" && parent) {
        parent.children[index] = {
          type: "mdxJsxFlowElement",
          name: "Mermaid",
          attributes: [{ type: "mdxJsxAttribute", name: "chart", value: node.value }],
          children: [],
        };
      }
    });
  };
}
