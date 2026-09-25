// Meter: a figure shown as a fraction of its ceiling, and a total shown as its named parts. See
// tools/build-components.mjs for the shape of this module.
export default {
  slug: "meter",
  name: "Meter",
  group: "Data display",
  order: 45,
  summary: "A figure shown as a fraction of a ceiling, or a total shown as its named parts, in a thin bar.",
  lead: "A meter answers one question: how much of what's allowed is used. A budget, a token cap, a cache rate. A stacked meter answers a related one: what is a total made of. Both draw a thin bar and both name their figures in words beside it, so the bar is never the only place the number lives.",
  root: ".bar, .meter, .stk",
  css: "lines 318 to 322 (bar and meter), 772 (bar hold), 1402 to 1405 (stacked ratio), 1383 to 1386 (legend), 2064 to 2067 (meter, defined a second time)",
  usedOn: ["Run (Decision trace, Tokens, Instruments)", "Spend", "Agents (30-day token use, mandates)", "Steering (record page)"],
  stories: [
    {
      id: "budget",
      name: "Single-value meter",
      note: "The label and figure come first, then the bar, then a one-line reason. At 90% or more the fill takes `.hold` and turns from allowed-green to approval-blue.",
      html: `
        <div class="meter"><div class="lab"><span>Session-start prefix</span><b>1,161 of 4,096 tok</b></div><div class="bar" role="img" aria-label="Session-start prefix: 28 percent used"><i style="width:28%"></i></div><div class="dim" style="font-size:11.5px">16 KiB in the signed bundle, header included</div></div>
        <div class="meter" style="margin-top:14px"><div class="lab"><span>Volatile selection</span><b>3,844 of 4,096 tok</b></div><div class="bar" role="img" aria-label="Volatile selection: 94 percent used"><i class="hold" style="width:94%"></i></div><div class="dim" style="font-size:11.5px">picked for this brief under the workspace budget</div></div>`,
    },
    {
      id: "composition",
      name: "Composition meter",
      note: "One meter per prompt part, each in its own hue, tallest first. `tokBars()` sets no `role` or `aria-label` on these. See Findings.",
      html: `
        <div style="display:grid;gap:9px">
          <div class="meter"><div class="lab">Conversation<b>18,204 <span class="dim" style="font-weight:500">· 41%</span></b></div><div class="bar"><i style="width:100%;background:var(--st-allowed)"></i></div></div>
          <div class="meter"><div class="lab">Tool definitions<b>9,880 <span class="dim" style="font-weight:500">· 22%</span></b></div><div class="bar"><i style="width:54%;background:var(--st-approval)"></i></div></div>
          <div class="meter"><div class="lab">Context frames<b>7,412 <span class="dim" style="font-weight:500">· 17%</span></b></div><div class="bar"><i style="width:41%;background:var(--st-proven)"></i></div></div>
          <div class="meter"><div class="lab">Tool results<b>5,006 <span class="dim" style="font-weight:500">· 11%</span></b></div><div class="bar"><i style="width:27%;background:var(--muted)"></i></div></div>
          <div class="meter"><div class="lab">Output<b>2,890 <span class="dim" style="font-weight:500">· 6%</span></b></div><div class="bar"><i style="width:16%;background:var(--fg)"></i></div></div>
          <div class="meter"><div class="lab">Reasoning<b>1,240 <span class="dim" style="font-weight:500">· 3%</span></b></div><div class="bar"><i style="width:7%;background:var(--muted)"></i></div></div>
        </div>`,
    },
    {
      id: "stacked",
      name: "Stacked ratio",
      note: "One bar, several named segments. `stackLeg()` is the legend below it, each swatch matching a segment's hue.",
      html: `
        <div>
          <div class="stk"><i class="fk-model" style="flex:41" title="model · 41%"></i><i class="fk-tool" style="flex:33" title="tool · 33%"></i><i class="fk-gov" style="flex:20" title="waiting on a person · 20%"></i><i class="neu" style="flex:6" title="harness · 6%"></i></div>
          <div class="leg" style="margin-top:8px"><span><i class="fk-model"></i>model <b>2m 04s</b></span><span><i class="fk-tool"></i>tool <b>1m 40s</b></span><span><i class="fk-gov"></i>waiting on a person <b>1m 01s</b></span><span><i class="neu"></i>harness <b>18s</b></span></div>
        </div>`,
    },
  ],
  anatomy: [
    ["Bar", "`.bar`", "The track: 7px tall, `--hl` ground with a 1px `--border`, corners rounded and clipped."],
    ["Fill", "`.bar i`", "The filled portion, `--st-allowed` by default, its width set by an inline percent."],
    ["Hold fill", "`.bar i.hold`", "The fill in `--st-approval`, applied once the value reaches 90% used."],
    ["Meter", "`.meter`", "The label-and-bar unit, a grid with a 5px gap. Defined twice (engine.css 321 and 2064). The later definition wins."],
    ["Meter label", "`.meter .lab`", "The name and the figure on one line, the figure pushed to the far side."],
    ["Meter's own bar", "`.meter .bar`", "A 6px track from the second `.meter .bar` rule, thinner than a bare `.bar`."],
    ["Stacked ratio", "`.stk`", "Several fills in one 8px track, 2px gaps, the first and last corners rounded, with an optional reference tick (`.stk .ref`)."],
    ["Legend", "`.leg`", "A row naming each stacked segment: a small swatch, the part's name in `--muted`, and its figure in `--fg`."],
    ["Budget bar", "`.mbar` (page-bound)", "A 12px pill track with a settled segment and, for a call in flight, a diagonally hatched reserved segment, with its own `.mlegend` below. Mandate cards and the mandate page."],
    ["Family bar", "`.fb` (page-bound)", "A bare 7px bar with no border, always the `--fk-model` hue, beside a count. Run's tool-family and concurrency rows."],
  ],
  usage: {
    when: [
      "A figure with a ceiling worth showing as a fraction: a token budget, a spend cap, a cache rate.",
      "A total made of named parts, shown as one bar: wall clock by phase, tokens by prompt part.",
    ],
    not: [
      "A figure with no ceiling: use a [stat box](stat-box.html).",
      "A history over time: a run's per-turn cost is a column chart, not a meter.",
    ],
    examples: [
      { kind: "avoid", html: `<div class="bar" style="max-width:220px"><i style="width:92%;background:var(--gold)"></i></div>`, why: "No label names what is 92% of what, and the fill is gold, which is reserved for identity and the one action on a screen." },
      { kind: "use", html: `<div class="meter" style="max-width:220px"><div class="lab"><span>Monthly budget</span><b>$1,840 of $2,000</b></div><div class="bar" role="img" aria-label="Monthly budget: 92 percent used"><i class="hold" style="width:92%"></i></div></div>`, why: "The figure states both numbers before the bar draws them, and the bar itself carries the percent to a screen reader." },
    ],
    rules: [
      "A meter's fill is a state hue (`--st-allowed`, holding to `--st-approval`) or a fixed categorical hue (`--fk-*`). Never gold.",
      "A single-value meter states its percent to assistive technology through `role=\"img\"` and an `aria-label`, not through the bar's width alone.",
      "At 90% or more, a single-value meter's fill switches to `.hold`, a state change a person should notice before the ceiling, not only a color.",
    ],
  },
  content: [
    "**Label**: the figure's name, sentence case (\"Session-start prefix\", \"Monthly budget\").",
    "**Figure**: \"{used} of {max} {unit}\", formatted with `tokn()` or `usd()` so thousands separators and currency match the rest of the page.",
    "**Sub line**: one fact in `--dim` under the bar, such as \"16 KiB in the signed bundle, header included\".",
    "**Legend entry**: the part's name in `--muted` and its formatted figure in `<b>`.",
  ],
  a11y: [
    "`stgMeter()`'s `.bar` carries `role=\"img\"` and an `aria-label` stating the label and the percent in words. `tokBars()`'s composition meters carry neither. See Findings.",
    "Getting close to a ceiling is never color alone. The hold state also changes the fill's hue, and the label states the raw numbers beside it.",
    "A stacked bar's segments carry a `title` naming the part and its share, so a pointer or a screen reader gets the same fact the legend gives a sighted reader.",
  ],
  phone: [
    "The label and the bar keep their sizes at 390px. `.lab` is a flex row with no `nowrap`, so a long figure wraps under the name rather than truncating.",
    "A stacked bar's segments keep a 2px minimum width so a small share stays visible and tappable for its tooltip.",
  ],
  tokens: [
    ["--hl, --border", "Bar track ground and border"],
    ["--st-allowed", "Default single-value fill"],
    ["--st-approval", "Hold fill at 90% or more, and the budget bar's reserved segment"],
    ["--fk-model, --fk-tool, --fk-gov", "Stacked-ratio and composition-meter hues"],
    ["--rule", "The `.neu` segment (\"harness\", \"other\")"],
    ["--fg, --muted, --dim", "Figure, legend text, and sub line"],
  ],
  helpers: [
    ["stgMeter(label, used, max, unit, sub)", "engine.js:6353", "Single-value meter with `role=\"img\"` and an aria-label stating the percent. Holds at 90%."],
    ["tokBars(t, opts)", "engine.js:196", "One composition meter per prompt part, plus output and reasoning, each in its own hue."],
    ["stack3(parts, total)", "engine.js:2654", "One `.stk` segment per part, sized by flex, each with a tooltip."],
    ["stackLeg(parts)", "engine.js:2657", "The `.leg` row naming each part `stack3()` drew."],
    ["mandateBar(m, showReserve)", "engine.js:1796", "The `.mbar` budget bar plus its own `.mlegend`, for a mandate card and the mandate page."],
  ],
  sourceNotes: [
    "A third local meter, `crecMeter()` (engine.js:13304), draws a Steering record's rendered, cited, and violated counts with the same `.meter`, `.lab`, and `.bar` markup as `stgMeter()`, but takes its own arguments and sets no `role` or `aria-label`.",
    "`.fb` and `.pr-bar` are declared beside `.mbar` in the CSS (engine.css 1555 to 1566) as page-bound variants. `.fb` is live on Run. `.pr-bar` renders nowhere. See Findings.",
  ],
  findings: [
    { tag: "open", title: "Composition meters carry no ARIA percent", body: "`tokBars()`'s `.bar` has neither `role=\"img\"` nor an `aria-label`, unlike `stgMeter()`'s. A screen reader gets the part's name and figure but never the percent the fill visually conveys." },
    { tag: "note", title: "`.pr-bar` has no emitter", body: "Declared at engine.css 1562 to 1566 with its own label, track, and value columns. Nothing in engine.js or wedge.js renders one." },
    { tag: "note", title: "A third meter shadows `stgMeter()`", body: "`crecMeter()` (engine.js 13304) draws the same `.meter` markup with its own signature and no ARIA attributes, for the Steering record page alone." },
    { tag: "note", title: "`.meter .lab` is defined twice", body: "Once at engine.css 321 (`margin-left:auto` pushes the figure right) and again at 2057 (`justify-content:space-between`). The two render alike, but a component with two rules for the same part should have one." },
  ],
  audit: {
    checks: [
      "Bar and fill. `.bar` is a 7px `--hl` track with a 1px `--border`. `.bar i` fills it in `--st-allowed`, switching to `--st-approval` under `.hold` at 90% or more used. A gold fill at any percent is a FAIL.",
      "Meter shell. `.meter` pairs a `.lab` (name and figure) with a `.bar`, label first, so a screen reader reads the name and the figure before the bar. A meter with the bar before its label is a FAIL.",
      "ARIA percent. A single-value meter's `.bar` carries `role=\"img\"` and an `aria-label` stating the label and the percent in words. Report every meter on the sampled route that lacks it; the composition meter's gap is a known finding, not a new one.",
      "Stacked ratio. `.stk` draws each part as a flex segment in its own categorical hue with a 2px gap and no border between segments, and `.leg` names every part with its own swatch and figure. A stacked bar with no legend is a FAIL.",
      "Hold threshold. A single-value meter reaches `.hold` at 90% used, not before and not after. Report the exact percent your build switches at.",
      "Figure format. Every meter's figure uses the engine's number helpers (`tokn()`, `usd()`, `pct()`), so separators and currency match the rest of the page.",
      "Budget bar. `.mbar`, where present, shows a settled segment and, for a call in flight, a diagonally hatched reserved segment, both named in `.mlegend` below it. Omitting the reserved segment for a call in flight is a FAIL.",
      "No dead meters. `.pr-bar` renders nowhere in the reference. If a build's mockup renders it, treat it as a new pattern for the index audit, not as this page's subject.",
    ],
  },
};
