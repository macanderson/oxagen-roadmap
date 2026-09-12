/* Contrast guard for consolidated.html.
 *
 * The tokens are PARSED OUT OF THE FILE, not copied here. An earlier version
 * held its own table, which meant the check could pass while the stylesheet
 * said something else — the guard was verifying a copy of itself.
 *
 * Every text token is checked against every surface it can land on: the four
 * backgrounds (ink, panel, panel-2 and the row-hover highlight) and, for the
 * state colours, its own wash composited over each of those. The wash is built
 * from the same colour as the text that sits on it, so darkening the text also
 * darkens its background — that coupling is why these values look oddly
 * specific and why they must be re-solved rather than nudged.
 *
 * Run:  node tools/verify-contrast.js
 */
const fs = require('node:fs');
const path = require('node:path');

const file = process.env.TARGET || path.resolve(__dirname, '..', 'consolidated.html');
const html = fs.readFileSync(file, 'utf8');

/* ── parse ── */
function block(selector){
  const i = html.indexOf(selector);
  if(i < 0) return null;
  const open = html.indexOf('{', i);
  const close = html.indexOf('}', open);
  return html.slice(open + 1, close);
}
function vars(src){
  const out = {};
  for(const m of src.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}
const lightSrc = block(':root{');
const darkSrc  = block(':root[data-theme="dark"]{');
if(!lightSrc || !darkSrc){ console.error('FATAL: could not find the token blocks'); process.exit(2); }
const LIGHT = vars(lightSrc), DARK = vars(darkSrc);

/* The media-query block must agree with the [data-theme] block, or the two
   dark paths disagree and only one of them is ever checked. */
const mq = html.match(/@media \(prefers-color-scheme:dark\)\{ :root:not\(\[data-theme="light"\]\)\{([\s\S]*?)\n\}\}/);
const MQ = mq ? vars(mq[1]) : null;

/* ── colour ── */
const parse = c => {
  c = c.trim();
  if(c.startsWith('#')){
    const h = c.slice(1);
    const f = h.length === 3 ? h.split('').map(x => x + x).join('') : h;
    return {rgb: [0,2,4].map(i => parseInt(f.slice(i, i+2), 16)), a: 1};
  }
  const m = c.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if(!m) return null;
  return {rgb: [+m[1], +m[2], +m[3]], a: m[4] === undefined ? 1 : +m[4]};
};
const lin = c => { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
const L = rgb => { const [r,g,b] = rgb.map(lin); return 0.2126*r + 0.7152*g + 0.0722*b; };
const ratio = (a, b) => { const l1 = L(a), l2 = L(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05); };
const over = (fg, alpha, bg) => fg.map((c, i) => c*alpha + bg[i]*(1-alpha));

const SURFACES = ['ink', 'panel', 'panel-2', 'hl'];
const TEXT = ['fg', 'body', 'muted', 'dim'];
const STATES = ['ok', 'proven', 'wait', 'deny', 'fail', 'crit', 'neutral', 'gold'];
const MIN = 4.5;

let fails = 0, checks = 0;
function check(theme, label, fgHex, bgRgb, where){
  const fg = parse(fgHex);
  if(!fg){ fails++; console.log(`FAIL  ${theme} ${label}: cannot parse ${fgHex}`); return; }
  const r = ratio(fg.rgb, bgRgb);
  checks++;
  if(r < MIN){ fails++; console.log(`FAIL  ${theme.padEnd(5)} ${label.padEnd(20)} on ${where.padEnd(18)} ${r.toFixed(2)}`); }
}

for(const [theme, T] of [['light', LIGHT], ['dark', DARK]]){
  const surf = Object.fromEntries(SURFACES.map(s => [s, parse(T[s]).rgb]));
  for(const name of TEXT)
    for(const s of SURFACES) check(theme, '--' + name, T[name], surf[s], s);
  for(const name of STATES){
    const base = parse(T[name]);
    const wash = parse(T[name + '-wash']);
    if(!base){ fails++; checks++; console.log(`FAIL  ${theme} --${name} is missing`); continue; }
    for(const s of SURFACES){
      check(theme, `.st.${name}`, T[name], over(wash ? wash.rgb : base.rgb, wash ? wash.a : 0, surf[s]),
        `${name}-wash/${s}`);
      check(theme, `${name} as text`, T[name], surf[s], s);
    }
  }
  /* The one place ink sits on a solid fill. */
  check(theme, 'btn-primary ink', T['gold-ink'], parse(T['gold-solid']).rgb, 'gold-solid');
}

/* Both dark paths have to define the same values, or only one is ever tested:
   a viewer on "system" gets the media query, a viewer who chose dark gets the
   attribute block. */
if(MQ){
  const drift = Object.keys(DARK).filter(k => MQ[k] !== DARK[k]);
  checks++;
  if(drift.length){ fails++;
    console.log(`FAIL  the two dark paths disagree on: ${drift.map(k => `--${k} (${MQ[k]} vs ${DARK[k]})`).join(', ')}`); }
} else {
  checks++; fails++;
  console.log('FAIL  could not find the prefers-color-scheme dark block to compare');
}

console.log(fails === 0
  ? `ALL PASS — ${checks} contrast pairs at ${MIN}:1, tokens read from ${path.basename(file)}`
  : `${fails} of ${checks} contrast checks FAILED`);
process.exit(fails ? 1 : 0);
