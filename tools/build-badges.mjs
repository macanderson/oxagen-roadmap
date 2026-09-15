#!/usr/bin/env node
/* The Oxagen verification badge for pull requests and branches.

   One SVG per state and theme, written to badges/. The state words are the spec's, not ours:
   the witness verdict vocabulary is closed (§8.5: flipped, failing, unmoved, unsatisfied, tampered,
   unverified, waived), and every badge says which attestation it carries (§8.3: Oxagen-attested for
   gateway-observed frames, producer-signed and countersigned for client-attested ones). The badge
   renders the word the record holds and never a stronger one.

   Colours are the Mission Control tokens (mockups/src/engine.css), light and dark. GitHub cannot load a webfont
   into an image, so the text is locked with textLength and drawn in the platform's UI fonts.

     node tools/build-badges.mjs           # write badges/*.svg, badges/index.html, badges/README.md
     node tools/build-badges.mjs --check   # exit 1 if what is on disk is not what this writes */
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "badges");

/* ---- tokens, lifted from the engine's two palettes (mockups/src/engine.css) ---- */
const THEMES = {
  light: { ink: "#F8F5EE", fg: "#10100F", muted: "#6B665C", border: "#D8CDBD",
    allowed: "#2F7D52", proven: "#1F7676", failed: "#992F28", critical: "#AE2540", denied: "#9B4526", observe: "#6B665C", gold: "#8B5E1A" },
  dark:  { ink: "#181715", fg: "#F2EEE5", muted: "#9B958A", border: "#292722",
    allowed: "#57A97C", proven: "#3FA2A2", failed: "#C0453C", critical: "#D6455E", denied: "#C66A4A", observe: "#9B958A", gold: "#D6962C" },
};

/* ---- the states. word = what the record holds; detail = the qualifier the spec requires the badge
   to carry; tone = which token colours it; asks = the request this state answers. ---- */
export const STATES = [
  { id: "verifying",       word: "verifying",   detail: "witness running", tone: "gold",     live: true,
    spec: "§8.5 · the witness runs on the target, then on the PR head; only pass or fail comes back", asks: "VERIFYING" },
  { id: "proven",          word: "proven",      detail: "fail → pass",     tone: "proven",
    spec: "§8.5 · verdict flipped: the witness failed on the target and passed on the PR head; the only verdict that proves a run", asks: "SUCCESSFUL VERIFICATION" },
  { id: "failing",         word: "failing",     detail: "on the PR head",  tone: "failed",
    spec: "§8.5 · verdict failing: the witness fails on the PR head", asks: "FAILED VERIFICATION" },
  { id: "unmoved",         word: "unmoved",     detail: "passes on both",  tone: "observe",
    spec: "§8.5 · verdict unmoved: the witness passes on target and head, so it proves nothing about the change", asks: null },
  { id: "unsatisfied",     word: "unsatisfied", detail: "fails on both",   tone: "denied",
    spec: "§8.5 · verdict unsatisfied: the witness fails on target and head", asks: null },
  { id: "tampered",        word: "tampered",    detail: "witness reached", tone: "critical",
    spec: "§8.5 · verdict tampered: the tamper exclusion tripped; the worker reached the witness or its environment", asks: "TAMPERED" },
  { id: "unverified",      word: "unverified",  detail: "no conclusion",   tone: "observe",
    spec: "§8.5 · verdict unverified: the runner could not reach a conclusion; never resolved by a model", asks: null },
  { id: "waived",          word: "waived",      detail: "per policy",      tone: "observe",
    spec: "§8.5 · verdict waived: nothing changed and nothing tried, per policy", asks: null },
  { id: "attested",        word: "attested",    detail: "gateway",         tone: "allowed",
    spec: "§8.3 · chain intact and the run attestation verifies; gateway-observed frames are Oxagen-attested", asks: "VERIFIED" },
  { id: "client-attested", word: "attested",    detail: "client",          tone: "observe",
    spec: "§8.3 · producer-signed, Oxagen-countersigned at ingest: Oxagen attests receipt and chain integrity, not the truth of the content", asks: "UNVERIFIED - ATTESTATION" },
  { id: "chain-break",     word: "chain break", detail: "hash refused",    tone: "critical",
    spec: "§8.3 · the same seq with a different hash, or a gap that is not a telemetry_gap frame; refused and reported as a security incident", asks: "UNVERIFIED - TAMPERED" },
];

/* ---- geometry ---- */
const H = 24, R = 6, PAD = 8, GAP = 6, MARK = 14;
const WORD_PX = 12, DETAIL_PX = 11;
const wordW = s => Math.round(s.length * WORD_PX * 0.62);    /* monospace at 12px */
const detailW = s => Math.round(s.length * DETAIL_PX * 0.56); /* sans at 11px */
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

/* The mark: the four-hexagon lockup from the Oxagen logo, on a 32 × 34 box, drawn in currentColor. */
const MARK_PATH = "M6.3 0l6.3 3.32v6.64L6.3 13.28 0 9.96V3.32zM1 3.885v5.51l5.3 2.755 5.3-2.755v-5.51L6.3 1.13zM19.376 0l6.3 3.32v6.64l-6.3 3.32-6.3-3.32V3.32zm-5.3 3.885v5.51l5.3 2.755 5.3-2.755v-5.51l-5.3-2.755zM12.838 10.24l6.3 3.32v6.64l-6.3 3.32-6.3-3.32v-6.64zm-5.3 3.885v5.51l5.3 2.755 5.3-2.755v-5.51l-5.3-2.755zM19.376 20.48l6.3 3.32v6.64l-6.3 3.32-6.3-3.32V23.8zm-5.3 3.885v5.51l5.3 2.755 5.3-2.755v-5.51l-5.3-2.755z";
const MARK_SOLID = "M25.914 10.24l6.3 3.32v6.64l-6.3 3.32-6.3-3.32v-6.64zM6.3 20.48l6.3 3.32v6.64L6.3 33.76 0 30.44V23.8z";

const hex2rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

export function badgeSVG(state, theme) {
  const t = THEMES[theme], c = t[state.tone];
  const ww = wordW(state.word), dw = detailW(state.detail);
  const W = PAD + MARK + GAP + ww + GAP + dw + PAD;
  const s = MARK / 34;
  const pulse = state.live
    ? `<animate attributeName="opacity" values="1;.35;1" dur="1.6s" repeatCount="indefinite"/>` : "";
  const title = `Oxagen · ${state.word}${state.detail ? " · " + state.detail : ""}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">
<title>${title}</title>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${R}" fill="${t.ink}" stroke="${hex2rgba(c, .55)}"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${R}" fill="${hex2rgba(c, .11)}"/>
<g transform="translate(${PAD},${(H - 34 * s) / 2}) scale(${s})" fill="${c}"><path d="${MARK_PATH}"/><path d="${MARK_SOLID}" opacity=".55">${pulse}</path></g>
<text x="${PAD + MARK + GAP}" y="${H / 2 + 4.3}" font-family="${MONO}" font-size="${WORD_PX}" font-weight="700" fill="${c}" textLength="${ww}" lengthAdjust="spacingAndGlyphs">${state.word}</text>
<text x="${PAD + MARK + GAP + ww + GAP}" y="${H / 2 + 4}" font-family="${SANS}" font-size="${DETAIL_PX}" fill="${t.muted}" textLength="${dw}" lengthAdjust="spacingAndGlyphs">${state.detail}</text>
</svg>
`;
}

/* ---- the preview sheet and the README ---- */
function indexHTML() {
  const row = st => `<tr><td><span class="pair">${["light", "dark"].map(th =>
      `<span class="sw ${th}"><img src="${st.id}-${th}.svg" alt="${st.word} · ${st.detail} (${th})"></span>`).join("")}</span></td>
    <td><code>${st.id}</code></td><td>${st.asks ? `<code>${st.asks}</code>` : '<span class="dim">no request; spec state</span>'}</td><td>${st.spec}</td></tr>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Oxagen verification badge</title>
<style>
:root{--ink:#F8F5EE;--fg:#10100F;--muted:#6B665C;--border:#D8CDBD;--panel:#FFFDF8;--gold:#8B5E1A;--mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
@media(prefers-color-scheme:dark){:root{--ink:#0A0A09;--fg:#F2EEE5;--muted:#9B958A;--border:#292722;--panel:#181715;--gold:#D6962C}}
body{margin:0;padding:32px 20px 60px;background:var(--ink);color:var(--fg);font:14px/1.5 "Space Grotesk","Helvetica Neue",Arial,sans-serif;max-width:1080px;margin-inline:auto}
h1{font-size:22px;margin:0 0 6px}h2{font-size:15px;margin:32px 0 10px;text-transform:uppercase;letter-spacing:.09em;color:var(--muted)}
p{max-width:70ch;color:var(--muted)}code{font-family:var(--mono);font-size:12px}
table{border-collapse:collapse;width:100%;font-size:13px}th,td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--border);vertical-align:middle}
th{font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted)}
.pair{display:inline-flex;gap:6px;align-items:center}.sw{display:inline-flex;padding:6px;border-radius:8px}.sw.light{background:#F8F5EE}.sw.dark{background:#181715}
.dim{color:var(--muted)}
.gh{border:1px solid var(--border);border-radius:8px;background:var(--panel);padding:14px 16px;margin-top:10px}
.gh .t{font-size:18px;font-weight:600;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.gh .m{font-size:12.5px;color:var(--muted);margin-top:6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.gh .st{display:inline-block;padding:2px 9px;border-radius:999px;font-size:12px;font-weight:600;color:#fff;background:#1f883d}
.gh .br{font-family:var(--mono);font-size:12px;padding:1px 6px;border-radius:5px;background:rgba(9,105,218,.12);color:#0969da}
pre{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:12px 14px;font-size:12px;overflow-x:auto}
</style></head><body>
<h1>Oxagen verification badge</h1>
<p>What a pull request or branch carries once Oxagen has looked at it. The word on the badge is the word the record holds: the witness verdict (spec §8.5, a closed vocabulary) or the attestation the chain carries (§8.3). It never shows a stronger word than the record. One SVG per state and theme, built by <code>tools/build-badges.mjs</code>.</p>

<h2>On a pull request</h2>
<div class="gh"><div class="t">Cut 4.11.0 release notes <span class="dim" style="font-weight:400">#482</span> <img src="proven-light.svg" alt="proven · fail → pass"></div>
<div class="m"><span class="st">Open</span> <b>a-intel.core.release-manager</b> wants to merge 3 commits into <span class="br">main</span> from <span class="br">release/4.11.0</span></div></div>
<div class="gh"><div class="t">Retry budget exhaustion drops webhooks <span class="dim" style="font-weight:400">#478</span> <img src="verifying-light.svg" alt="verifying · witness running"></div>
<div class="m"><span class="st" style="background:#8250df">Draft</span> <b>a-intel.core.triage</b> wants to merge 1 commit into <span class="br">main</span> from <span class="br">fix/retry-budget</span></div></div>
<div class="gh"><div class="t">Sync warehouse partitions <span class="dim" style="font-weight:400">#471</span> <img src="tampered-light.svg" alt="tampered · witness reached"></div>
<div class="m"><span class="st" style="background:#cf222e">Closed</span> <b>a-intel.data.dbt-runner</b> wanted to merge 2 commits into <span class="br">main</span> from <span class="br">data/partitions</span></div></div>

<h2>Every state</h2>
<table><thead><tr><th>Badge · light, dark</th><th>File</th><th>Asked for as</th><th>What the record holds</th></tr></thead>
<tbody>${STATES.map(row).join("\n")}</tbody></table>

<h2>Embed</h2>
<p>GitHub picks the theme with <code>&lt;picture&gt;</code>. Both files are committed; nothing is fetched at render time.</p>
<pre>&lt;picture&gt;
  &lt;source media="(prefers-color-scheme: dark)" srcset="badges/proven-dark.svg"&gt;
  &lt;img alt="Oxagen: proven · fail → pass" src="badges/proven-light.svg"&gt;
&lt;/picture&gt;</pre>
</body></html>
`;
}

function readme() {
  const rows = STATES.map(s => `| \`${s.id}\` | ${s.asks ? "`" + s.asks + "`" : "spec state, not requested"} | ${s.spec} |`).join("\n");
  return `# Oxagen verification badge

The badge a pull request or branch carries once Oxagen has looked at it. One SVG per state
and theme, generated by \`tools/build-badges.mjs\`; do not edit the SVGs by hand.

The word on the badge is the word the record holds. The witness verdict vocabulary is closed
(spec §8.5) and every badge says which attestation the chain carries (§8.3), so the badge can
never show a stronger word than the record. Colours are the Mission Control tokens.

| File | Asked for as | What the record holds |
|---|---|---|
${rows}

Open \`badges/index.html\` for the sheet, both themes, and the badge on a pull request row.

## Embed

\`\`\`html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="badges/proven-dark.svg">
  <img alt="Oxagen: proven · fail → pass" src="badges/proven-light.svg">
</picture>
\`\`\`

\`\`\`sh
node tools/build-badges.mjs           # regenerate
node tools/build-badges.mjs --check   # exit 1 if badges/ is not what the script writes
\`\`\`
`;
}

/* ---- main ---- */
const check = process.argv.includes("--check");
const files = {};
for (const st of STATES) for (const th of Object.keys(THEMES)) files[`${st.id}-${th}.svg`] = badgeSVG(st, th);
files["index.html"] = indexHTML();
files["README.md"] = readme();

if (check) {
  let bad = 0;
  for (const [name, body] of Object.entries(files)) {
    const p = join(OUT, name);
    const ok = existsSync(p) && readFileSync(p, "utf8") === body;
    console.log((ok ? "ok   " : "DRIFT") + " badges/" + name);
    if (!ok) bad++;
  }
  process.exit(bad ? 1 : 0);
}
mkdirSync(OUT, { recursive: true });
for (const [name, body] of Object.entries(files)) writeFileSync(join(OUT, name), body);
console.log(`wrote ${Object.keys(files).length} files to badges/`);
