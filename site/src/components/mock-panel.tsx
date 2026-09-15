"use client";

import { useEffect, useRef, useState } from "react";

const LABEL: Record<string, string> = { loaded: "Loaded", empty: "Empty", loading: "Loading", error: "Error", denied: "Denied" };
const FRAME = { desktop: { w: 1280, h: 800 }, mobile: { w: 390, h: 844 } };

/** One state of the page in the master mockup, desktop or mobile, scaled to the column. */
export function MockPanel({ title, hash, states }: { title: string; hash: string | null; states: string[] }) {
  const [state, setState] = useState(states.includes("loaded") ? "loaded" : states[0]);
  const [mobile, setMobile] = useState(false);
  const [width, setWidth] = useState(0);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) setMobile(true);
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!state) return null;
  const frame = mobile ? FRAME.mobile : FRAME.desktop;
  const scale = width ? Math.min(1, width / frame.w) : 0;
  const src = `/mock/mockups/missioncontrol.html?product=1&state=${state}&mobile=${mobile ? 1 : 0}${hash ?? ""}`;

  return (
    <figure className="ox-mock not-prose" aria-label="Mocked page">
      <figcaption className="ox-mock-bar">
        <span className="ox-mock-title">Mocked page</span>
        <span className="ox-seg" role="group" aria-label="State">
          {states.map((s) => (
            <button key={s} type="button" aria-pressed={s === state} onClick={() => setState(s)}>
              {LABEL[s] ?? s}
            </button>
          ))}
        </span>
        <span className="ox-seg" role="group" aria-label="Viewport">
          <button type="button" aria-pressed={!mobile} onClick={() => setMobile(false)}>
            Desktop
          </button>
          <button type="button" aria-pressed={mobile} onClick={() => setMobile(true)}>
            Mobile
          </button>
        </span>
        <a className="ox-mock-open" href={src} target="_blank" rel="noopener">
          Open full page
        </a>
      </figcaption>
      <div ref={stage} className="ox-mock-stage" style={scale ? { height: frame.h * scale } : { aspectRatio: `${frame.w} / ${frame.h}` }}>
        {scale > 0 ? (
          <div className={mobile ? "ox-mock-frame ox-mock-phone" : "ox-mock-frame"} style={{ width: frame.w * scale, height: frame.h * scale }}>
            <iframe
              key={src}
              src={src}
              title={`${title}, ${LABEL[state] ?? state}, ${mobile ? "mobile" : "desktop"}`}
              sandbox="allow-scripts allow-same-origin allow-popups"
              loading="lazy"
              style={{ width: frame.w, height: frame.h, transform: `scale(${scale})`, transformOrigin: "0 0" }}
            />
          </div>
        ) : null}
      </div>
    </figure>
  );
}
