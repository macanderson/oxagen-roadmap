"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

/** A mermaid fence drawn as a diagram in the active theme; the source shows until it renders. */
export function Mermaid({ chart }: { chart: string }) {
  const id = `m${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    import("mermaid")
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: resolvedTheme === "dark" ? "dark" : "neutral",
          fontFamily: 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, monospace',
        });
        const { svg: out } = await mermaid.render(`${id}-${resolvedTheme ?? "light"}`, chart);
        if (live) setSvg(out);
      })
      .catch(() => {
        if (live) setSvg(null);
      });
    return () => {
      live = false;
    };
  }, [chart, id, resolvedTheme]);

  if (!svg) {
    return (
      <pre className="ox-mermaid-source">
        <code>{chart}</code>
      </pre>
    );
  }
  return <div className="ox-mermaid" dangerouslySetInnerHTML={{ __html: svg }} />;
}
