// The house code face, Monaspace Neon, as an inline @font-face rule.
// It is on no public CDN, so the self-contained pages carry it as a data URI.
// Space Grotesk (display) and Geist (text) load from Google Fonts.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const FILE = resolve(dirname(fileURLToPath(import.meta.url)), "../../design/fonts/monaspace-neon-latin-wght.woff2");

export function monoFontFace() {
  const b64 = readFileSync(FILE).toString("base64");
  return `@font-face{font-family:"Monaspace Neon";font-style:normal;font-weight:200 800;font-display:swap;src:url(data:font/woff2;base64,${b64}) format("woff2")}`;
}
