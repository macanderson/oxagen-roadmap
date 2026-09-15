"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import type { TOCItemType } from "fumadocs-core/toc";
import { createContext, use, useEffect, useState, type ReactNode } from "react";
import type { Nav, NavGroup } from "@/lib/nav";

type Sheet = "pages" | "scenarios" | "more" | null;

const TocContext = createContext<{ toc: TOCItemType[]; setToc: (toc: TOCItemType[]) => void }>({ toc: [], setToc: () => {} });

export function ThumbProvider({ children }: { children: ReactNode }) {
  const [toc, setToc] = useState<TOCItemType[]>([]);
  return <TocContext value={{ toc, setToc }}>{children}</TocContext>;
}

/** Hands the current page's table of contents to the thumb bar's More sheet. */
export function TocRegister({ toc }: { toc: TOCItemType[] }) {
  const { setToc } = use(TocContext);
  useEffect(() => {
    setToc(toc);
    return () => setToc([]);
  }, [toc, setToc]);
  return null;
}

const icon = {
  walkthrough: "M4 5h16M4 12h10M4 19h7",
  pages: "M5 4h10l4 4v12H5zM15 4v4h4",
  scenarios: "M6 5v14l6-4 6 4V5z",
  search: "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm5-2 4 4",
  more: "M5 12h.01M12 12h.01M19 12h.01",
};

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function SheetFrame({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="ox-sheet-root">
      <button type="button" className="ox-scrim" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="ox-sheet"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) onClose();
        }}
      >
        <div className="ox-sheet-head">
          <span className="ox-sheet-grip" aria-hidden="true" />
          <h2>{title}</h2>
          <button type="button" className="ox-sheet-close" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="ox-sheet-body">{children}</div>
      </div>
    </div>
  );
}

function GroupList({ group, pathname }: { group: NavGroup; pathname: string }) {
  const current = (url: string) => pathname.replace(/\/$/, "") === url.replace(/\/$/, "");
  return (
    <ul className="ox-sheet-list">
      {group.url ? (
        <li>
          <Link href={group.url} aria-current={current(group.url) ? "page" : undefined}>
            Overview
          </Link>
        </li>
      ) : null}
      {group.items.map((item, i) =>
        item.type === "separator" ? (
          <li key={`s${i}`} className="ox-sheet-sep">
            {item.name}
          </li>
        ) : (
          <li key={item.url}>
            <Link href={item.url} aria-current={current(item.url) ? "page" : undefined}>
              {item.name}
            </Link>
          </li>
        ),
      )}
    </ul>
  );
}

function ThemeChoice() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="ox-seg ox-seg-wide" role="group" aria-label="Theme">
      {(["light", "dark", "system"] as const).map((t) => (
        <button key={t} type="button" aria-pressed={mounted && theme === t} onClick={() => setTheme(t)}>
          {t[0].toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}

/** Below 768px: the only navigation. Five thumb slots on the bottom edge; lists open as sheets. */
export function ThumbBar({ nav }: { nav: Nav }) {
  const pathname = usePathname();
  const { toc } = use(TocContext);
  const { setOpenSearch } = useSearchContext();
  const [sheet, setSheet] = useState<Sheet>(null);
  const close = () => setSheet(null);

  useEffect(() => setSheet(null), [pathname]);

  const inPath = (prefix: string) => pathname.startsWith(prefix);
  const tocItems = toc.filter((t) => t.depth <= 3);

  return (
    <>
      <nav className="ox-thumb" aria-label="Docs">
        <Link href={nav.walkthrough} className="ox-slot" aria-current={pathname === "/" ? "page" : undefined}>
          <Icon d={icon.walkthrough} />
          <span>Walkthrough</span>
        </Link>
        <button type="button" className="ox-slot" aria-expanded={sheet === "pages"} data-active={inPath("/pages") || undefined} onClick={() => setSheet("pages")}>
          <Icon d={icon.pages} />
          <span>Pages</span>
        </button>
        <button
          type="button"
          className="ox-slot"
          aria-expanded={sheet === "scenarios"}
          data-active={inPath("/scenarios") || undefined}
          onClick={() => setSheet("scenarios")}
        >
          <Icon d={icon.scenarios} />
          <span>Scenarios</span>
        </button>
        <button type="button" className="ox-slot" onClick={() => setOpenSearch(true)}>
          <Icon d={icon.search} />
          <span>Search</span>
        </button>
        <button
          type="button"
          className="ox-slot"
          aria-expanded={sheet === "more"}
          data-active={inPath("/specs") || inPath("/audit-prompts") || undefined}
          onClick={() => setSheet("more")}
        >
          <Icon d={icon.more} />
          <span>More</span>
        </button>
      </nav>

      {sheet === "pages" ? (
        <SheetFrame title={nav.groups.pages.name} onClose={close}>
          <GroupList group={nav.groups.pages} pathname={pathname} />
        </SheetFrame>
      ) : null}
      {sheet === "scenarios" ? (
        <SheetFrame title={nav.groups.scenarios.name} onClose={close}>
          <GroupList group={nav.groups.scenarios} pathname={pathname} />
        </SheetFrame>
      ) : null}
      {sheet === "more" ? (
        <SheetFrame title="More" onClose={close}>
          <section className="ox-sheet-section">
            <h3>Theme</h3>
            <ThemeChoice />
          </section>
          {tocItems.length ? (
            <section className="ox-sheet-section">
              <h3>On this page</h3>
              <ul className="ox-sheet-list ox-sheet-toc">
                {tocItems.map((t) => (
                  <li key={t.url} data-depth={t.depth}>
                    <a href={t.url}>{t.title}</a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="ox-sheet-section">
            <h3>{nav.groups.specs.name}</h3>
            <GroupList group={nav.groups.specs} pathname={pathname} />
          </section>
          <section className="ox-sheet-section">
            <details>
              <summary>{nav.groups.audit.name}</summary>
              <GroupList group={nav.groups.audit} pathname={pathname} />
            </details>
          </section>
        </SheetFrame>
      ) : null}
    </>
  );
}
