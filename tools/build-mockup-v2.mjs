import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { buildMockup, root } from './build-mockup.mjs';
const dir = path.join(root, 'mockups/v2');
export function buildMockupV2() {
  const assets = Object.fromEntries(readdirSync(path.join(dir, 'assets')).filter(f => f.endsWith('.svg')).map(f => [f, 'data:image/svg+xml;base64,' + readFileSync(path.join(dir, 'assets', f)).toString('base64')]));
  const css = readFileSync(path.join(dir, 'src/style.css'), 'utf8');
  const data = readFileSync(path.join(dir, 'src/data.js'), 'utf8');
  const js = readFileSync(path.join(dir, 'src/engine.js'), 'utf8');
  // Extend the original engine after fixture expansion, before its first render.
  // Original registration, record, skill and agent wizard functions are reused verbatim.
  const marker = 'if(PRODUCT){var chromeEl=';
  let html = buildMockup();
  if (html.split(marker).length !== 2) throw new Error('Original mockup boot marker changed');
  html = html.replace('</head>', `<style>${css}</style></head>`)
    .replace(marker, `var V2_ASSETS=${JSON.stringify(assets)};\n${data}\n${js}\n${marker}`)
    .replace('var PRODUCT=BOOT.product;', 'var PRODUCT=true;');
  return html;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const i = process.argv.indexOf('--out');
  const out = i >= 0 ? path.resolve(process.argv[i + 1]) : path.join(dir, 'missioncontrol.html');
  const html = buildMockupV2();
  if (process.argv.includes('--check')) {
    if (readFileSync(out, 'utf8') !== html) throw new Error('V2 output is stale');
    console.log('V2 output matches sources');
  } else { mkdirSync(path.dirname(out), {recursive:true}); writeFileSync(out, html); console.log(`Wrote ${out}`); }
}
