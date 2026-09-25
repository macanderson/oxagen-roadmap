// Layout grid: the grid, split, and row primitives that place panels and stat boxes on a page.
export default {
  slug: "layout-grid",
  name: "Layout grid",
  group: "Page structure",
  order: 30,
  summary: "The grids, splits, and rows that place panels and stat boxes on a page.",
  lead: "Pages are laid out with a handful of primitives: `.grid` with two, three, or four auto-fitting columns, `.split` and `.split23` for a main column beside a side column, and `.row` for an inline run of badges or buttons. They carry no color and no copy. They set the 14px gap every page uses.",
  root: ".grid",
  css: "lines 153 to 167, 310 to 311, 548 to 549, phone 675",
  usedOn: ["Work", "Run", "Spend", "Agents", "agent Overview", "Billing", "every dialog"],
  stories: [
    {
      id: "g4",
      name: "Four columns",
      note: "`.grid.g4` fits columns of at least 175px. It holds the stat box row at the top of a page.",
      html: `
        <div class="grid g4">
          <div class="stat"><span class="k">Runs</span><span class="v">1,340</span><span class="s">last 30 days</span></div>
          <div class="stat"><span class="k">Spend</span><span class="v">$402.11</span><span class="s">last 30 days</span></div>
          <div class="stat"><span class="k">Cache hit</span><span class="v">62%</span><span class="s">of input tokens</span></div>
          <div class="stat"><span class="k">Wasted</span><span class="v">$38.20</span><span class="s">9% of spend</span></div>
        </div>`,
    },
    {
      id: "g3",
      name: "Three columns",
      note: "`.grid.g3` fits columns of at least 230px.",
      html: `
        <div class="grid g3">
          <div class="panel pad"><p class="eyebrow q">Operator</p><p style="margin:0">Marcus Bell</p></div>
          <div class="panel pad"><p class="eyebrow q">Runtime</p><p class="mono" style="margin:0">mbell-mbp-16</p></div>
          <div class="panel pad"><p class="eyebrow q">Tier</p><p class="mono" style="margin:0">gateway</p></div>
        </div>`,
    },
    {
      id: "g2",
      name: "Two columns",
      note: "`.grid.g2` fits columns of at least 320px. The most used grid, with 34 sites.",
      html: `
        <div class="grid g2">
          <div class="panel"><div class="panel-h"><h3>Toolbelt</h3></div><div class="panel-b"><p class="muted" style="margin:0;font-size:12.5px">18 tools, 4 need approval.</p></div></div>
          <div class="panel"><div class="panel-h"><h3>Steering</h3></div><div class="panel-b"><p class="muted" style="margin:0;font-size:12.5px">9 sources assigned.</p></div></div>
        </div>`,
    },
    {
      id: "split",
      name: "Main and side",
      note: "`.split` gives the main column the room left after a 340px side column.",
      html: `
        <div class="split">
          <div class="panel"><div class="panel-h"><h3>Transcript</h3></div><div class="panel-b"><p class="muted" style="margin:0;font-size:12.5px">48 entries.</p></div></div>
          <div class="panel"><div class="panel-h"><h3>Repository</h3></div><div class="panel-b"><p class="mono" style="margin:0;font-size:12px">a-intel/platform</p></div></div>
        </div>`,
    },
    {
      id: "split23",
      name: "Two thirds and one third",
      note: "`.split23` sets a 2 to 1 ratio: a table beside a chart.",
      html: `
        <div class="split23">
          <div class="panel"><div class="panel-h"><h3>Spend by agent</h3></div><div class="panel-b"><p class="muted" style="margin:0;font-size:12.5px">12 agents this month.</p></div></div>
          <div class="panel"><div class="panel-h"><h3>Spend by area</h3></div><div class="panel-b"><p class="muted" style="margin:0;font-size:12.5px">6 areas.</p></div></div>
        </div>`,
    },
    {
      id: "row",
      name: "Row and divider",
      note: "`.row` is an inline flex row with a 9px gap. `.hr` is a 1px divider with 14px above and below.",
      html: `
        <div class="panel pad">
          <div class="row"><span class="b b-allowed"><span class="d"></span>live</span><span class="b b-q">direct</span><span class="b b-tier b-allowed">gateway</span><button class="btn sm">Open run</button></div>
          <div class="hr"></div>
          <div class="row2">
            <div class="field" style="margin:0"><label>Owner</label><input value="Marcus Bell" aria-label="Owner"></div>
            <div class="field" style="margin:0"><label>Runtime</label><input value="mbell-mbp-16" aria-label="Runtime"></div>
          </div>
        </div>`,
    },
  ],
  anatomy: [
    ["Grid", "`.grid`", "`display:grid` with a 14px gap. Every direct child may shrink (`min-width:0`), so a long id wraps instead of widening the column."],
    ["Two columns", "`.grid.g2`", "`repeat(auto-fit, minmax(320px, 1fr))`."],
    ["Three columns", "`.grid.g3`", "`repeat(auto-fit, minmax(230px, 1fr))`."],
    ["Four columns", "`.grid.g4`", "`repeat(auto-fit, minmax(175px, 1fr))`."],
    ["Main and side", "`.split`", "`minmax(0, 1fr) 340px` with a 14px gap, top aligned."],
    ["Two thirds", "`.split23`", "`minmax(0, 2fr) minmax(0, 1fr)`, top aligned."],
    ["Row", "`.row`", "A wrapping flex row, centered, with a 9px gap."],
    ["Field pairs", "`.row2`", "`repeat(auto-fit, minmax(230px, 1fr))` with a 12px gap, for fields side by side."],
    ["Divider", "`.hr`", "A 1px `--border` line with 14px above and below."],
  ],
  usage: {
    when: [
      "Placing panels, stat boxes, and cards on a page with the house 14px gap.",
      "A main column with a fixed side column: the Run page's transcript and its Repository panel.",
      "An inline run of badges, chips, or small buttons.",
    ],
    not: [
      "Tabular data: use a [table](table.html). A grid of cells is not a table.",
      "Switching views: use [tabs](tabs.html) or a [segmented control](segmented-control.html).",
      "Spacing inside a component: each component sets its own padding.",
    ],
    examples: [
      { kind: "avoid", html: `<div class="grid" style="grid-template-columns:repeat(4,1fr);gap:22px;width:100%"><div class="stat"><span class="k">Runs</span><span class="v">1,340</span></div><div class="stat"><span class="k">Spend</span><span class="v">$402.11</span></div><div class="stat"><span class="k">Cache hit</span><span class="v">62%</span></div><div class="stat"><span class="k">Wasted</span><span class="v">$38.20</span></div></div>`, why: "Fixed columns and a one-off gap. The row cannot reflow on a narrow screen and does not line up with the panels below." },
      { kind: "use", html: `<div class="grid g4" style="width:100%"><div class="stat"><span class="k">Runs</span><span class="v">1,340</span></div><div class="stat"><span class="k">Spend</span><span class="v">$402.11</span></div><div class="stat"><span class="k">Cache hit</span><span class="v">62%</span></div><div class="stat"><span class="k">Wasted</span><span class="v">$38.20</span></div></div>`, why: "`.grid.g4`: auto-fit columns and the 14px gap every page shares." },
    ],
    rules: [
      "Use the named grids. A page that sets its own `grid-template-columns` or gap drifts from the rest.",
      "Put the column a person reads first first in the DOM. The grid never reorders children.",
      "Space between stacked panels comes from a `.grid` wrapper or the panel's own margin, not from `br` or empty elements.",
    ],
  },
  content: [
    "A layout primitive holds no copy of its own. Each child follows its own component's content rules.",
    "Order children by reading priority: the figure or panel a person needs first comes first.",
  ],
  a11y: [
    "Visual order is DOM order in every primitive, so keyboard and screen reader order match what you see.",
    "In `.split`, the main column comes first in the DOM and the side column second, so a screen reader reaches the main content first.",
    "A `.hr` is a `div`, which is decorative. Use a heading, not a divider, to start a new section.",
  ],
  phone: [
    "`.g3` and `.g4` become two equal columns (engine.css 675). `.g2` falls to one column because two 320px columns do not fit.",
    "`.split` and `.split23` become one column below 1080px and in the phone shell, with the side column under the main one.",
    "`.row` wraps, so badges and buttons flow onto a second line instead of scrolling.",
  ],
  tokens: [
    ["--border", "The `.hr` divider"],
  ],
  helpers: [],
  sourceNotes: [
    "Pages write the primitives inline: `.grid.g2` 34 times, `.g4` 11, `.g3` 5, `.split` 5, `.split23` 3, `.row2` 4, `.row` 108, and `.hr` 16.",
    "`.recon-tiles .g3` (line 158) narrows the columns to 120px and the gap to 8px for the reconciliation tiles.",
  ],
  findings: [
    { tag: "note", title: "Inline gaps", body: "A few grids override the gap inline, such as `class=\"grid\" style=\"gap:10px\"`. The house gap is 14px, and a tighter one should be a named modifier." },
    { tag: "note", title: "Fixed side column", body: "`.split` fixes the side column at 340px from 1080px up. On a 1100px window the main column is left about 700px after the sidebar." },
  ],
  audit: {
    checks: [
      "Gap. Every page-level grid of panels or stat boxes uses a 14px gap. List every other gap with its selector.",
      "Column rules. Two, three, and four column grids auto-fit with minimums of 320, 230, and 175px. A grid with fixed column counts that does not reflow is a FAIL.",
      "Main and side. The run page and other split layouts give the side column 340px (or one third in the two-thirds split), and the main column the rest. Both columns align to the top.",
      "Shrinking. A long id or path inside a grid child wraps or truncates inside its column and never widens the page. A grid child that overflows its column is a FAIL.",
      "Order. DOM order matches visual order in every grid and split. A layout that reorders children with `order` or `grid-area` so reading order differs from visual order is a FAIL.",
      "Phone. Three and four column grids become two columns, two column grids and splits become one, and the side column falls under the main one.",
      "Rows. Inline runs of badges and buttons wrap at a 9px gap and never scroll sideways.",
    ],
  },
};
