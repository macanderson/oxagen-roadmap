// Segmented control: two to five mutually exclusive choices that change how one view is drawn or filtered.
export default {
  slug: "segmented-control",
  name: "Segmented control",
  group: "Page structure",
  order: 50,
  summary: "Two to five choices, one pressed, that change how one list is drawn or filtered.",
  lead: "A segmented control switches how the view under it is drawn or which rows it shows, and the view keeps its header. Tool names as labels or API names, a toolbelt grouped by category or listed flat, a work order list filtered to live runs. The mockup draws it four ways today, and this page names the one to build.",
  root: ".seg",
  css: "lines 284 to 287, kind filter 221 to 223, selected button 144",
  usedOn: ["Agents", "Tools", "agent Toolbelt", "Organization deployment mode", "import wizard", "Work orders", "Backlog"],
  stories: [
    {
      id: "seg",
      name: "Segmented control",
      note: "The pattern to build: `.seg` holds small buttons, and `aria-pressed` marks the one that is on.",
      html: `
        <div class="seg" role="group" aria-label="Tool names">
          <button class="btn sm" aria-pressed="true">Labels</button>
          <button class="btn sm" aria-pressed="false">API names</button>
        </div>`,
    },
    {
      id: "layout",
      name: "Layout pick",
      note: "The toolbelt layout on an agent's Toolbelt tab, beside a count of what is shown.",
      html: `
        <div class="row" style="gap:10px">
          <div class="seg" role="group" aria-label="Layout">
            <button class="btn sm" aria-pressed="true">By category</button>
            <button class="btn sm" aria-pressed="false">Flat</button>
          </div>
          <span class="b b-q">18 of 52 shown</span>
        </div>`,
    },
    {
      id: "filter-counts",
      name: "Filter with counts",
      note: "A filter row in a panel header. The count sits in `.dim` inside each button.",
      canvas: "panel",
      html: `
        <div class="panel">
          <div class="panel-h">
            <h3>Work orders</h3>
            <div class="sp">
              <div class="seg" role="group" aria-label="Show">
                <button class="btn sm" aria-pressed="true">All <span class="dim">6</span></button>
                <button class="btn sm" aria-pressed="false">Live <span class="dim">2</span></button>
                <button class="btn sm" aria-pressed="false">Waiting on you <span class="dim">1</span></button>
                <button class="btn sm" aria-pressed="false">Done <span class="dim">3</span></button>
              </div>
            </div>
          </div>
        </div>`,
    },
    {
      id: "columns",
      name: "Column set on the Agents panel",
      note: "The Agents panel header reuses the kind filter row `.kf`, with its padding and border set to zero inline, as a two-way pick.",
      canvas: "panel",
      html: `
        <div class="panel">
          <div class="panel-h">
            <h3>Registered in Core platform</h3>
            <div class="sp">
              <div class="kf" role="group" aria-label="Columns" style="padding:0;border:0">
                <button class="btn sm" aria-pressed="true">Composition</button>
                <button class="btn sm" aria-pressed="false">Operations</button>
              </div>
            </div>
          </div>
        </div>`,
    },
    {
      id: "idioms",
      name: "The two idioms to retire",
      note: "A `.btn.sm.sel` group with no pressed state, and a `span.chips` group that draws an input box around its buttons.",
      html: `
        <div style="display:grid;gap:14px">
          <div class="row" style="gap:6px"><button class="btn sm sel">All <span class="dim">6</span></button><button class="btn sm">Live <span class="dim">2</span></button><button class="btn sm">Done <span class="dim">3</span></button></div>
          <span class="chips" role="group" aria-label="View" style="max-width:220px;margin:0"><button class="btn sm sel" aria-pressed="true">List</button><button class="btn sm" aria-pressed="false">Graph</button></span>
        </div>`,
    },
  ],
  anatomy: [
    ["Track", "`.seg`", "An inline flex group on `--void` with a 1px `--border`, an 8px radius, 2px padding, and 2px between segments."],
    ["Segment", "`.seg .btn.sm`", "A small button with a transparent border and ground: 12px Geist 500, 4px by 9px padding."],
    ["Pressed segment", "`.seg .btn[aria-pressed=\"true\"]`", "`--hl` ground, a `--rule` border, and `--fg` text."],
    ["Count", "`.btn .dim`", "A number after the label in `--dim`."],
    ["Kind filter row", "`.kf`", "A wrapping row with a bottom border, made for kind filters. Its pressed style matches `.seg`. The Agents panel uses it as a column pick."],
    ["Category row", "`.row.tcs`", "The tool category filter from `catChips()`, with the same pressed style."],
  ],
  usageNote: "A segmented control changes the view under it and never leaves the page.",
  usage: {
    when: [
      "Two to five ways to draw the same list: labels or API names, grouped or flat.",
      "A small, fixed set of filters in a panel header, each with its count.",
      "A setting with a few named values, such as the deployment mode.",
    ],
    not: [
      "Views with their own content and route: use [tabs](tabs.html).",
      "A long or open-ended list of values: use a select in a [form field](form-field.html), or the list table's filters.",
      "An on or off setting: use a [switch](switch.html).",
    ],
    examples: [
      { kind: "avoid", html: `<div class="row" style="gap:6px"><button class="btn sm sel">All</button><button class="btn sm">Live</button><button class="btn sm">Done</button></div>`, why: "A `.sel` group with no `aria-pressed`. A screen reader hears three buttons and no choice." },
      { kind: "use", html: `<div class="seg" role="group" aria-label="Show"><button class="btn sm" aria-pressed="true">All</button><button class="btn sm" aria-pressed="false">Live</button><button class="btn sm" aria-pressed="false">Done</button></div>`, why: "One track, a group label, and a pressed state on every segment." },
    ],
    rules: [
      "Exactly one segment is pressed.",
      "The choice holds until the page reloads. The engine keeps it in `S` and re-renders.",
      "A filter's counts come from the same rows the list shows, so All equals the list's total.",
      "Never gold. A pressed segment uses `--hl` and `--fg`.",
    ],
  },
  content: [
    "**Segment labels**: one or two words in sentence case, the same part of speech across the group: \"Labels\" and \"API names\", \"By category\" and \"Flat\".",
    "**Counts**: a plain number with thousands separators, in `.dim` after the label.",
    "**Group label**: the `aria-label` names what the choice changes: \"Tool names\", \"Layout\", \"Show\".",
  ],
  a11y: [
    "The track is `role=\"group\"` with an `aria-label`, and each segment is a `button` with `aria-pressed`. A radio group (`role=\"radiogroup\"`, `role=\"radio\"`, `aria-checked`, arrow keys) is also correct. Pick one for the whole build.",
    "The pressed segment differs by ground, border, and text color, not by color alone.",
    "Every segment is reachable with Tab and toggles with Enter or Space.",
  ],
  phone: [
    "Segments take the small button's phone size: 36px tall at 13px.",
    "A track wider than the screen wraps. A control with more than three segments moves below the panel title.",
  ],
  tokens: [
    ["--void", "Track ground"],
    ["--border", "Track border"],
    ["--hl", "Pressed segment ground"],
    ["--rule", "Pressed segment border"],
    ["--fg", "Pressed segment text"],
    ["--dim", "Count"],
  ],
  helpers: [
    ["namesToggle()", "engine.js:890", "Labels or API names for tools. The reference `.seg`."],
    ["catChips(counts, sel, pick, total)", "engine.js:895", "The tool category filter row, `.row.tcs`, with `aria-pressed`."],
  ],
  sourceNotes: [
    "`.seg` is written inline at four more sites: toolbelt presentation (engine.js 4561), toolbelt layout (4607), deployment mode (7799), and the import wizard (12096). The Agents column pick is `.kf` (3961).",
    "Work orders draw their filter as a `.btn.sm.sel` row (`wedge.js` 181), and Backlog draws List and Graph as `span.chips[role=group]` (`wedge.js` 137).",
  ],
  findings: [
    { tag: "open", title: "Four idioms for one control", body: "`.seg` with `aria-pressed` (five sites), `.btn.sm.sel` rows (seven sites), `span.chips[role=group]` (Backlog), and `.kf` with inline overrides (the Agents panel's Composition and Operations). `.chips` is also the bordered input box of a tag field (engine.css 924), so Backlog's view switch looks like a text input. Build `.seg` only." },
    { tag: "note", title: "The kind filter row has lost its job", body: "`.kf` was made for Steering's kind filters, which the fleet operations wedge removed. Its one remaining use is the Agents column pick, which is a `.seg`." },
    { tag: "open", title: "No pressed state on the work order filter", body: "`wedge.js` 181 marks the chosen filter with `.sel` and no `aria-pressed`, so a screen reader cannot tell which filter is on." },
    { tag: "note", title: "Two definitions of .chips", body: "`.chips` is defined at engine.css 770 as a plain row and at 924 as an input box. The later one wins everywhere." },
  ],
  audit: {
    checks: [
      "One idiom. Every control that switches or filters one view uses the same component. List each site that draws it another way, with its file and line.",
      "Pressed state. Each segment exposes its state with aria-pressed, or the group is a radiogroup with aria-checked. A segment whose state is only a class is a FAIL.",
      "Group name. Each group has an accessible name that says what the choice changes.",
      "Look. The track is --void with a --border outline, the pressed segment is --hl with a --rule border and --fg text, and no segment is gold.",
      "Counts. A count beside a filter equals the rows the list shows under that filter, and All equals the list's total.",
      "Behavior. Choosing a segment re-renders the view under it without leaving the page, and the choice survives a re-render.",
      "Labels. Segment labels are sentence case, one or two words, and parallel in form.",
    ],
  },
};
