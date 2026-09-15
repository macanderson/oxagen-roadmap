import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";
import { Mermaid } from "@/components/mermaid";

/** Generated HTML under /mock is a plain file, outside the app router: open it as a document. */
function Anchor(props: ComponentProps<"a">) {
  if (props.href?.startsWith("/mock/")) return <a {...props} target="_blank" rel="noopener" />;
  const DefaultAnchor = defaultMdxComponents.a as (p: ComponentProps<"a">) => React.ReactNode;
  return <DefaultAnchor {...props} />;
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    a: Anchor,
    Mermaid,
    ...components,
  };
}
