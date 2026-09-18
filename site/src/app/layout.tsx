import "./global.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import { SiteHeader } from "@/components/site-header";
import { ThumbBar, ThumbProvider } from "@/components/thumb-bar";
import { navFromTree } from "@/lib/nav";
import { source } from "@/lib/source";

export const metadata: Metadata = {
  title: { default: "Oxagen internal docs", template: "%s · Oxagen internal docs" },
  description: "Mission Control, page by page: the walkthrough, every mocked page, the scenarios, the spec and the implementation plan.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
  ],
};

function Wordmark() {
  return (
    <span className="ox-wordmark">
      <span>
        O<span className="ox-x">x</span>agen
      </span>
      <span className="ox-wordmark-sub">internal docs</span>
    </span>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" />
      </head>
      <body className="flex min-h-screen flex-col">
        <RootProvider search={{ options: { type: "static" } }} theme={{ defaultTheme: "system", enableSystem: true }}>
          <ThumbProvider>
            <DocsLayout tree={source.pageTree} nav={{ title: <Wordmark />, url: "/" }} themeSwitch={{ enabled: false }} slots={{ header: SiteHeader }}>
              {children}
            </DocsLayout>
            <ThumbBar nav={navFromTree(source.pageTree)} />
          </ThumbProvider>
        </RootProvider>
      </body>
    </html>
  );
}
