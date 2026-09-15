"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch";

/** Desktop header (768px and up): section links and the light / dark / system switch. */
export function SiteHeader(props: ComponentProps<"header">) {
  return (
    <header id="nd-subnav" {...props} className="ox-header">
      <nav className="ox-header-links" aria-label="Sections">
        <Link href="/">Walkthrough</Link>
        <Link href="/pages/">Pages</Link>
        <Link href="/scenarios/">Scenarios</Link>
        <Link href="/specs/mission-control-spec/">Spec</Link>
        <Link href="/specs/implementation-plan/">Plan</Link>
        <a href="/mock/pages/index.html" target="_blank" rel="noopener">
          Page map
        </a>
        <a href="/mock/mc.html" target="_blank" rel="noopener">
          mc.html
        </a>
      </nav>
      <ThemeSwitch mode="light-dark-system" />
    </header>
  );
}
