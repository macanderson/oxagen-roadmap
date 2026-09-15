import type * as PageTree from "fumadocs-core/page-tree";
import type { ReactNode } from "react";

export type NavItem = { type: "page"; name: string; url: string } | { type: "separator"; name: string };
export interface NavGroup {
  name: string;
  url?: string;
  items: NavItem[];
}
export interface Nav {
  walkthrough: string;
  groups: Record<"pages" | "scenarios" | "specs" | "audit", NavGroup>;
}

const text = (n: ReactNode): string => (typeof n === "string" || typeof n === "number" ? String(n) : "");

function items(nodes: PageTree.Node[]): NavItem[] {
  return nodes.flatMap((node): NavItem[] => {
    if (node.type === "page") return [{ type: "page", name: text(node.name), url: node.url }];
    if (node.type === "separator") return [{ type: "separator", name: text(node.name) }];
    return [
      { type: "separator", name: text(node.name) },
      ...(node.index ? [{ type: "page" as const, name: text(node.index.name), url: node.index.url }] : []),
      ...items(node.children),
    ];
  });
}

/** The page tree as plain strings, for the mobile thumb bar's sheets. */
export function navFromTree(tree: PageTree.Root): Nav {
  const folder = (prefix: string): NavGroup => {
    const node = tree.children.find(
      (n): n is PageTree.Folder => n.type === "folder" && (n.index?.url === prefix || n.children.some((c) => c.type === "page" && c.url.startsWith(`${prefix}/`))),
    );
    return { name: node ? text(node.name) : prefix, url: node?.index?.url, items: node ? items(node.children) : [] };
  };
  const first = tree.children.find((n): n is PageTree.Item => n.type === "page");
  return {
    walkthrough: first?.url ?? "/",
    groups: { pages: folder("/pages"), scenarios: folder("/scenarios"), specs: folder("/specs"), audit: folder("/audit-prompts") },
  };
}
