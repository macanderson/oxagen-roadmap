// Stat box: one figure with its label and one line of context. See tools/build-components.mjs for
// the shape of this module; every other component module follows it.
export default {
  slug: "stat-box",
  name: "Stat box",
  group: "Data display",
  order: 10,
  summary: "One figure with its label and one line of context.",
  lead: "A stat box shows one figure a person checks at a glance: a count, an amount, a rate. The label names the figure, the value states it, and the subline gives the one fact that makes it readable. Stat boxes sit in a row at the top of a page or a tab.",
  root: ".stat",
  css: "lines 177 to 181, 764, 2087 to 2093, phone 679 to 680",
  usedOn: ["Work", "Run", "Agents", "Spend", "Runtimes", "Billing", "agent Overview"],
  stories: [
    {
      id: "row",
      name: "Row of four",
      note: "The common case: a `.grid.g4` row at the top of a page.",
      html: `
        <div class="grid g4">
          <div class="stat"><span class="k">Runs</span><span class="v">1,340</span><span class="s">last 30 days</span></div>
          <div class="stat"><span class="k">Spend</span><span class="v">$402.11</span><span class="s"><span class="basis" title="gateway_observed">Observed by gateway</span></span></div>
          <div class="stat"><span class="k">Cache hit</span><span class="v">62%</span><span class="s">of input tokens</span></div>
          <div class="stat"><span class="k">Wasted</span><span class="v">$38.20</span><span class="s">9% of spend</span></div>
        </div>`,
    },
    {
      id: "unit",
      name: "Value with a unit",
      note: "A unit that is not part of the figure goes in `small`.",
      html: `
        <div class="grid g3">
          <div class="stat"><span class="k">Tokens per run</span><span class="v">41,200<small>tokens</small></span><span class="s">median of 88 runs</span></div>
          <div class="stat"><span class="k">Wall clock</span><span class="v">12m 04s</span><span class="s">from first prompt to seal</span></div>
          <div class="stat"><span class="k">Tier</span><span class="v" style="font-size:17px">gateway</span><span class="s">metered at the gateway</span></div>
        </div>`,
    },
    {
      id: "tone",
      name: "State tone",
      note: "Color on the value only, and the label or subline names the state.",
      html: `
        <div class="grid g3">
          <div class="stat"><span class="k">Waiting on you</span><span class="v" style="color:var(--st-approval)">3</span><span class="s">approvals past their first hour</span></div>
          <div class="stat"><span class="k">Over budget</span><span class="v" style="color:var(--st-failed)">2</span><span class="s">agents above their monthly ceiling</span></div>
          <div class="stat"><span class="k">Healthy runtimes</span><span class="v" style="color:var(--st-allowed)">14</span><span class="s">of 15 enrolled</span></div>
        </div>`,
    },
    {
      id: "empty",
      name: "Empty value",
      note: "No figure renders as a dash, and the subline says why.",
      html: `
        <div class="grid g3">
          <div class="stat"><span class="k">Cache hit</span><span class="v">—</span><span class="s">not recorded for harness runs</span></div>
          <div class="stat"><span class="k">Spend</span><span class="v">$0.00</span><span class="s">no governed calls this month</span></div>
        </div>`,
    },
    {
      id: "click",
      name: "Clickable",
      note: "A stat that opens a filtered view is a `button.stat.click` with a label that names where it goes.",
      html: `
        <div class="grid g3">
          <button class="stat click" aria-label="Open the work orders with a live run"><span class="k">Live now</span><span class="v">2</span><span class="s">work orders with a live run</span></button>
          <button class="stat click" aria-label="Open the approvals waiting on you"><span class="k">Waiting on you</span><span class="v" style="color:var(--st-approval)">3</span><span class="s">open the approvals</span></button>
        </div>`,
    },
  ],
  anatomy: [
    ["Container", "`.stat`", "A `--panel` box with a 1px `--border`, a 12px radius, and 13px by 15px padding."],
    ["Label", "`.stat .k`", "The name of the figure: 10.5px Geist 600 at 0.1em, set in capitals by CSS."],
    ["Value", "`.stat .v`", "The figure: 23px Geist 700, tabular figures, line height 1.15."],
    ["Unit", "`.stat .v small`", "A unit or qualifier beside the figure: 12px, 500, `--muted`."],
    ["Subline", "`.stat .s`", "One fact that makes the figure readable: 11.5px, `--muted`."],
    ["Basis chip", "`.stat .s .basis`", "Where a spend figure came from, drawn by `basisChip()`: 10.5px Monaspace Neon."],
    ["Clickable", "`button.stat.click`", "The whole box is one button. Hover lifts the border to `--rule`."],
  ],
  usage: {
    when: [
      "A figure a person checks every visit: runs, spend, waiting approvals, cache hit.",
      "The first row of a page or a tab, three to six boxes wide.",
      "A figure that opens the view behind it, as a clickable stat.",
    ],
    not: [
      "A figure with a history: use a [meter](meter.html) or a chart beside it.",
      "A list of values: use a [key-value list](key-value-list.html).",
      "A state with no figure: use a [badge](badge.html).",
    ],
    examples: [
      { kind: "avoid", html: `<div class="stat" style="width:240px"><span class="k">Runs and spend</span><span class="v">1,340 / $402</span><span class="s">runs · spend · 30 days</span></div>`, why: "Two figures in one value and three facts in the subline. Nobody can read either figure at a glance." },
      { kind: "use", html: `<div class="grid g2" style="width:100%"><div class="stat"><span class="k">Runs</span><span class="v">1,340</span><span class="s">last 30 days</span></div><div class="stat"><span class="k">Spend</span><span class="v">$402.11</span><span class="s">last 30 days</span></div></div>`, why: "One figure per box, and each subline states one fact." },
      { kind: "avoid", html: `<div class="stat" style="width:240px"><span class="k">Budget left</span><span class="v" style="color:var(--gold)">$1,240.00</span><span class="s">of $2,000.00</span></div>`, why: "A gold value. Gold is identity and the one action, never a figure or a state." },
      { kind: "use", html: `<div class="stat" style="width:240px"><span class="k">Budget left</span><span class="v">$1,240.00</span><span class="s">of $2,000.00 this month</span></div>`, why: "A neutral value. Color it with a state token only when the state is named beside it." },
    ],
    rules: [
      "A row of stat boxes has one subject. The Run page's row is Tokens, Prompts, Cost, Wasted, Wall clock, and Cache hit.",
      "Every figure agrees with the same figure elsewhere on the page and in the navigation: a tab count, a table total, a drawer badge.",
      "Only a stat that opens something is clickable. A clickable stat needs no chevron. The hover border and the pointer say it opens.",
    ],
  },
  content: [
    "**Label**: a plain noun of one to three words, written in sentence case (\"Waiting on you\", \"Cache hit\"). CSS sets the capitals. An id inside a label is wrapped in `.id` so it keeps its case.",
    "**Value**: one figure, formatted by the engine's helpers: `usd()` for money (\"$1,284.50\", a true minus \"−$4.20\"), `plural()` for counts, `dur()` for durations (\"12m 04s\"). Thousands take separators.",
    "**Unit**: in `small` when it is not part of the figure (\"41,200 tokens\"). A percent sign or a dollar sign stays in the figure.",
    "**Empty value**: `—`, with the reason in the subline (\"not recorded for harness runs\"). Never blank, never `undefined` or `NaN`, and never a zero the record did not give.",
    "**Subline**: one fact, starting in lowercase, with no mid-dot, comma list, or design reasoning. A spend figure names its basis with `basisChip()`: Observed by gateway or Reported by harness.",
  ],
  a11y: [
    "The DOM order is label, value, subline, so a screen reader reads \"Runs, 1,340, last 30 days\".",
    "A static stat box is not focusable. A clickable one is a real `button` with an `aria-label` that names where it goes.",
    "Color never carries the state alone. A toned value has its state in the label or the subline.",
    "The label and subline must clear 4.5:1 on `--panel`. The label's `--dim` does not today. See Findings.",
  ],
  phone: [
    "Padding drops to 11px by 12px and the value to 17px, so an eleven-digit token total fits half the width (engine.css 676 to 680).",
    "Stat boxes sit two to a row, and a clickable stat keeps a 44px minimum touch height.",
  ],
  tokens: [
    ["--panel", "Ground"],
    ["--border", "Border at rest"],
    ["--rule", "Border on hover, clickable only"],
    ["--dim", "Label (see Findings)"],
    ["--fg", "Value"],
    ["--muted", "Subline and unit"],
    ["--st-approval, --st-failed, --st-allowed", "Value tone, with the state named beside it"],
  ],
  helpers: [
    ["tile(k, v, s, col)", "engine.js:2487", "Writes one stat box. `col` sets the value's tone. About 15 calls."],
    ["runStatRow(R)", "engine.js:2484", "The Run page's row of six, with a local tile of its own."],
    ["basisChip(k)", "engine.js:637", "The spend basis chip in the subline."],
  ],
  sourceNotes: [
    "44 more stat boxes are written inline as strings (Spend, Runtimes, Billing, agent Overview, Memory, and the evidence and fix dialogs), and three local functions shadow `tile()`: `runStatRow` (2483), the import wizard (12152), and a pass or fail tile at 5798.",
    "Compact contexts shrink the value: `.recon-tiles` (17px), `.ev-claim .stat` (19px), and `.rstats .stat` in the Run side column.",
  ],
  findings: [
    { tag: "open", title: "Label contrast", body: "The label is `--dim`, which is 3.67:1 on `--panel` in dark and 2.56:1 in light. A label is a word a person reads, so it belongs on `--muted` (6.91:1 and 4.83:1). See [Colors](../colors.html#findings)." },
    { tag: "note", title: "Many hand-written copies", body: "One helper and 44 inline copies draw the stat box, and three local functions shadow the helper. One shared implementation in the build keeps them identical." },
    { tag: "note", title: "Tone by inline style", body: "The value's tone is an inline `style=\"color:var(--st-…)\"`. A modifier class (`.v.t-approval`) would let an audit find every toned value." },
    { tag: "note", title: "Two facts in a subline", body: "Some sublines join two facts with a mid-dot, such as \"2 to certify · 1 to accept\". The caption rule allows one fact." },
  ],
  audit: {
    checks: [
      "Anatomy. Every stat box renders the label, the value, and the subline in that DOM order, in a `--panel` box with a 1px `--border`, a 12px radius, and 13px by 15px padding.",
      "Label. 10.5px Geist 600 at 0.1em tracking, capitals by `text-transform` only. The source string is sentence case. An id inside the label keeps its case.",
      "Value. 23px Geist 700 at −0.02em, tabular figures, line height 1.15. Money matches `usd()` (dollar sign, separators, two decimals, a true minus). A unit sits in a 12px 500 `--muted` `small`.",
      "Empty value. A missing figure renders \"—\" with the reason in the subline. A blank value, `undefined`, `NaN`, or a zero the record did not give is a FAIL.",
      "Tone. Only the value takes a color, only from a state token, and the label or subline names the state. A gold value is a FAIL.",
      "Clickable stat. A stat that navigates is a `button` with an `aria-label` naming its destination, a `--rule` border on hover, and the gold focus ring on keyboard focus. A clickable `div` is a FAIL.",
      "Agreement. Each figure equals the same figure elsewhere on the page: a tab count, a table total, a navigation or drawer badge. Quote any pair that disagrees.",
      "Subline. One fact, no mid-dot, no comma list, no design reasoning.",
    ],
  },
};
