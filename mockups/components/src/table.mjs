// Table: rows of records with one column per field. The list controls that listify() adds at render
// have their own page, list-table.mjs. See tools/build-components.mjs for the shape of this module.
export default {
  slug: "table",
  name: "Table",
  group: "Data display",
  order: 20,
  summary: "Rows of records with one column per field, inside a panel.",
  lead: "A table lists records of one kind: agents, runs, tools, work items, budgets. Each row is one record and each column one field. Tables sit inside a panel and scroll sideways inside it, never the page. A row that opens its record is a keyboard button, and a missing value is a dash.",
  root: "table",
  css: "lines 234 to 245, 1341, 2181 to 2184, 2357, phone 703 to 715",
  usedOn: ["Work", "Agents", "Tools", "Spend", "Repositories", "Organization", "Audit"],
  stories: [
    {
      id: "default",
      name: "Records in a panel",
      note: "Clickable rows, a `.sub` second line, right-aligned figures, and an empty cell.",
      html: `
        <div class="panel">
          <div class="panel-h"><h3>Agents</h3></div>
          <div class="tw">
            <table>
              <thead><tr><th>Agent</th><th>Runtime</th><th>Owner</th><th class="num">Runs</th><th class="num">Spend</th></tr></thead>
              <tbody>
                <tr class="click" tabindex="0" role="button" aria-label="Open a-intel.core.release-manager">
                  <td><span class="tkey">a-intel.core.release-manager</span><span class="sub">Prepares release notes and cuts the tag</span></td>
                  <td class="mono">mbell-mbp-16</td>
                  <td>Marcus Bell</td>
                  <td class="num">412</td>
                  <td class="num">$186.40</td>
                </tr>
                <tr class="click" tabindex="0" role="button" aria-label="Open a-intel.core.triage">
                  <td><span class="tkey">a-intel.core.triage</span><span class="sub">Labels and routes new issues</span></td>
                  <td class="mono">ci-runner-04</td>
                  <td>Priya Natarajan</td>
                  <td class="num">1,340</td>
                  <td class="num">$402.11</td>
                </tr>
                <tr class="click" tabindex="0" role="button" aria-label="Open a-intel.finops.invoice-bot">
                  <td><span class="tkey">a-intel.finops.invoice-bot</span><span class="sub">Reconciles supplier invoices</span></td>
                  <td class="mono">ci-runner-08</td>
                  <td>Amara Lindqvist</td>
                  <td class="num">88</td>
                  <td class="num"><span class="dim">—</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>`,
    },
    {
      id: "narrow",
      name: "Narrow table",
      note: "`table.narrow` drops the 560px minimum for a side column or a dialog.",
      html: `
        <div class="panel" style="max-width:340px">
          <div class="panel-h"><h3>Tool calls by tool</h3></div>
          <div class="tw">
            <table class="narrow">
              <thead><tr><th>Tool</th><th class="num">Calls</th></tr></thead>
              <tbody>
                <tr><td class="mono">github__create_pull_request</td><td class="num">41</td></tr>
                <tr><td class="mono">github__list_commits</td><td class="num">1,206</td></tr>
                <tr><td class="mono">fs__read_file</td><td class="num">318</td></tr>
              </tbody>
            </table>
          </div>
        </div>`,
    },
    {
      id: "selection",
      name: "Selectable rows",
      note: "A checkbox column, a selected row tinted gold, and a row that cannot be selected says why.",
      html: `
        <div class="panel">
          <div class="panel-h"><h3>Backlog</h3><div class="sp"><span class="b b-q">1 selected</span><button class="btn sm">Clear</button></div></div>
          <div class="tw">
            <table>
              <thead><tr><th class="ck"><span class="vh">Select</span></th><th>Work item</th><th>Status</th><th>Updated</th></tr></thead>
              <tbody>
                <tr class="click" tabindex="0" role="button" aria-label="Open PLAT-1893" aria-selected="true">
                  <td class="ck"><input type="checkbox" aria-label="Select PLAT-1893" checked></td>
                  <td><span class="mono dim" style="font-size:11.5px">PLAT-1893</span><div>Cut 4.11.0 release notes</div></td>
                  <td><span class="b b-allowed"><span class="d"></span>Ready</span></td>
                  <td class="mono dim" style="font-size:11.5px">2026-09-24 14:02</td>
                </tr>
                <tr class="click" tabindex="0" role="button" aria-label="Open PLAT-1901">
                  <td class="ck"><input type="checkbox" aria-label="Select PLAT-1901" disabled title="Not ready: its definition of done is not certified"></td>
                  <td><span class="mono dim" style="font-size:11.5px">PLAT-1901</span><div>Retry flaky checkout test</div></td>
                  <td><span class="b b-approval"><span class="d"></span>Needs certification</span></td>
                  <td class="mono dim" style="font-size:11.5px">2026-09-24 09:41</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>`,
    },
    {
      id: "groups",
      name: "Grouped rows",
      note: "A `tr.tgrp` heads each group, and a critical or high-risk row carries a left rule.",
      html: `
        <div class="panel">
          <div class="tw">
            <table>
              <thead><tr><th>Tool</th><th>Decision</th><th class="num">Calls</th></tr></thead>
              <tbody>
                <tr class="tgrp t-vcs"><td colspan="2"><span class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></svg></span><b>Source control</b><span class="muted">Changes code history: branches, pull requests, merges, releases, repositories.</span></td><td class="dim" style="font-size:11px;white-space:nowrap">2 tools</td></tr>
                <tr class="hz-row-high click" tabindex="0" role="button" aria-label="Open github__merge_pull_request"><td class="mono">github__merge_pull_request</td><td><span class="b b-approval"><span class="d"></span>Needs approval</span></td><td class="num">12</td></tr>
                <tr class="click" tabindex="0" role="button" aria-label="Open github__create_pull_request"><td class="mono">github__create_pull_request</td><td><span class="b b-allowed"><span class="d"></span>Allowed</span></td><td class="num">41</td></tr>
                <tr class="tgrp t-finance"><td colspan="2"><span class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg></span><b>Financial control</b><span class="muted">Moves funds or commits spend.</span></td><td class="dim" style="font-size:11px;white-space:nowrap">1 tool</td></tr>
                <tr class="hz-row-critical click" tabindex="0" role="button" aria-label="Open stripe__create_payment"><td class="mono">stripe__create_payment</td><td><span class="b b-approval"><span class="d"></span>Needs approval</span></td><td class="num">3</td></tr>
              </tbody>
            </table>
          </div>
        </div>`,
    },
    {
      id: "current",
      name: "Current row",
      note: "`tr.on` marks the row whose detail the side panel shows, on `--panel-h`.",
      html: `
        <div class="panel" style="max-width:560px">
          <div class="tw">
            <table class="narrow">
              <thead><tr><th>Operator</th><th class="num">Runs</th><th class="num">Spend</th></tr></thead>
              <tbody>
                <tr class="click on" aria-selected="true"><td>Priya Natarajan</td><td class="num">612</td><td class="num">$1,284.60</td></tr>
                <tr class="click" aria-selected="false"><td>Marcus Bell</td><td class="num">431</td><td class="num">$904.12</td></tr>
                <tr class="click" aria-selected="false"><td>Amara Lindqvist</td><td class="num">97</td><td class="num">$212.08</td></tr>
              </tbody>
            </table>
          </div>
        </div>`,
    },
  ],
  anatomy: [
    ["Scroller", "`.tw`", "Holds the table and scrolls sideways inside the panel, with touch momentum."],
    ["Table", "`table`", "Full width, 13px, collapsed borders, and a 560px minimum so columns never crush."],
    ["Narrow table", "`table.narrow`", "Drops the minimum width for a side column, a card, or a dialog."],
    ["Header cell", "`th`", "10.5px Geist 600 in capitals at 0.09em, `--dim`, sticky to the top of the scroller, on `--panel`."],
    ["Body cell", "`td`", "9px by 12px padding, a 1px `--border` rule below, vertically centered. The last row has no rule."],
    ["Figure column", "`th.num`, `td.num`", "Right-aligned with tabular figures, so amounts line up."],
    ["Second line", "`.sub`", "A 11px `--dim` line under the cell's main value."],
    ["Record key", "`.tkey`", "An agent key or event name in 12px Monaspace Neon, `--fg`."],
    ["Clickable row", "`tr.click`", "Pointer cursor and a `--hl` hover. `rowClick()` adds the keyboard role and label."],
    ["Selection", "`th.ck`, `td.ck`, `tr[aria-selected=\"true\"]`", "A 34px checkbox column, and a 7% gold tint on a selected row."],
    ["Current row", "`tr.on`", "The row the side panel describes, on `--panel-h`."],
    ["Group row", "`tr.tgrp`", "A band on `--hl` with an icon tile, a bold name, and a muted description."],
    ["Risk rule", "`tr.hz-row-critical`, `tr.hz-row-high`", "A 3px left rule in the critical or denied hue on the first cell."],
  ],
  usage: {
    when: [
      "Records of one kind that a person scans, compares, sorts, or opens.",
      "Figures that line up in columns: runs, calls, spend, tokens.",
      "A list long enough to need search and paging. The engine adds those, see [List table](list-table.html).",
    ],
    not: [
      "One record's fields: use a [key-value list](key-value-list.html).",
      "Two or three figures a person checks at a glance: use [stat boxes](stat-box.html).",
      "Records with long prose, such as findings or steering records: use a card list.",
    ],
    examples: [
      { kind: "avoid", row: false, html: `<div class="panel"><div class="tw"><table class="narrow"><thead><tr><th>Agent</th><th>Spend</th></tr></thead><tbody><tr onclick=""><td>Release manager</td><td>186.4</td></tr><tr><td>Invoice bot</td><td></td></tr></tbody></table></div></div>`, why: "A row that only answers a mouse click, a left-aligned amount with no format, and a blank cell." },
      { kind: "use", row: false, html: `<div class="panel"><div class="tw"><table class="narrow"><thead><tr><th>Agent</th><th class="num">Spend</th></tr></thead><tbody><tr class="click" tabindex="0" role="button" aria-label="Open release manager"><td>Release manager</td><td class="num">$186.40</td></tr><tr><td>Invoice bot</td><td class="num"><span class="dim">—</span></td></tr></tbody></table></div></div>`, why: "A keyboard row with a label, a formatted amount in a `.num` column, and a dash for the missing value." },
    ],
    rules: [
      "A table sits in a [panel](panel.html). The panel header names what the rows are.",
      "The first column names the record. An id or key is set in mono (`.tkey`, `.mono`), and a person or an agent can lead with an [avatar](avatar.html).",
      "Every row that opens something uses `rowClick()`. A bare `class=\"click\"` is not reachable by keyboard.",
      "Put figures in `.num` columns and format them with `usd()`, `plural()`, and thousands separators.",
      "A row of a different weight (a group, a total) spans the columns and uses its own class, never an inline style.",
    ],
  },
  content: [
    "**Headers**: plain nouns in sentence case in the source (\"Agent\", \"Spend\"). CSS sets the capitals. An id in a header keeps its case with `.id`.",
    "**Cells**: one value each. A second fact goes on a `.sub` line, never after a mid-dot.",
    "**Empty cell**: `—` in `--dim`. The engine treats a dash as empty, so a column of counts with a few dashes still sorts as numbers.",
    "**Figures**: money through `usd()`, counts with thousands separators, a true minus sign for a negative value.",
    "**Stored keys**: shown by their label (\"Observed by gateway\"), with the key in a tooltip, through `keyLabel()`.",
  ],
  a11y: [
    "A clickable row has `tabindex=\"0\"`, `role=\"button\"`, an `aria-label` that names the record (\"Open PLAT-1893\"), and opens on Enter and Space. `rowClick()` writes all four.",
    "A checkbox column has a visually hidden header (`<span class=\"vh\">Select</span>`), and each checkbox has its own `aria-label`. A disabled checkbox says why in its `title`.",
    "A link or a checkbox inside a clickable row stops the click from reaching the row, so one press does one thing.",
    "Header text is `--dim`, which is 3.67:1 on `--panel` in dark and 2.56:1 in light. Headers are words a person reads, so they need 4.5:1. See Findings.",
  ],
  phone: [
    "`cardTables()` (engine.js 13812) marks every table with a single header row as `.cards`, and gives each cell a `data-l` label from its column.",
    "In the phone shell each row becomes a card on `--ink` with a 12px radius. The first cell is the card's title, and each other cell shows its column label on the left in 10.5px capitals.",
    "Nothing scrolls sideways. A tool cell drops its 220px minimum.",
  ],
  tokens: [
    ["--panel", "Header cell ground"],
    ["--border", "Row rules"],
    ["--dim", "Header text, `.sub` lines, empty cells"],
    ["--fg", "Cell text and `.tkey`"],
    ["--hl", "Hover on a clickable row, group row ground"],
    ["--panel-h", "Current row"],
    ["--gold", "Selected row tint (7%) and the checkbox accent"],
    ["--st-critical, --st-denied", "Risk rule on critical and high rows"],
  ],
  helpers: [
    ["rowClick(on, label)", "engine.js:6975", "Makes a row a keyboard button. 17 calls."],
    ["cardTables()", "engine.js:13924", "Turns every single-header table into labelled cards on a phone."],
    ["keyLabel(k)", "engine.js:694", "Shows a stored key as its label with the key in a tooltip."],
  ],
  sourceNotes: [
    "Pages write tables as HTML strings, and `listify()` adds the list controls to every one at render. See [List table](list-table.html).",
    "`table{color:inherit}` at line 1334 exists because a page with no doctype gave tables a color of their own in Chrome.",
  ],
  findings: [
    { tag: "open", title: "Header contrast", body: "`th` is `--dim`: 3.67:1 on `--panel` in dark and 2.56:1 in light. Column headers are words a person reads, so they belong on `--muted`. See [Colors](../colors.html#findings)." },
    { tag: "open", title: "Rows a keyboard cannot reach", body: "15 rows use a bare `class=\"click\"` with an `onclick` and no `tabindex`, role, or label, such as the toolbelt rows at engine.js 4484 and 4826. `rowClick()` exists to replace them." },
    { tag: "note", title: "Selection state on a button", body: "A selected Backlog row carries `aria-selected=\"true\"` on a `role=\"button\"` row. Buttons do not support that state, so a screen reader does not announce the selection. The checkbox does." },
    { tag: "note", title: "Gold on a row", body: "A selected row takes a 7% gold tint (line 2177). The brand rule keeps gold off rows. `--hl` or `--panel-h` would mark it without spending gold." },
    { tag: "note", title: "Dead rule", body: "`.tid` (line 244) has no emitter in engine.js or wedge.js." },
  ],
  audit: {
    checks: [
      "Container. Every table sits in a panel inside a horizontal scroller, and the page itself never scrolls sideways. A table on the page ground with no panel is a FAIL unless the build draws the free list bar around it.",
      "Header cells. 10.5px Geist 600 at 0.09em, capitals by `text-transform`, sticky to the top, sentence case in the source. Report the header color and its ratio on the header ground. Below 4.5:1 is a FAIL.",
      "Body cells. 13px, 9px by 12px padding, a 1px `--border` rule below each row and none below the last, vertically centered.",
      "Figures. Every column of amounts or counts is right-aligned with tabular figures, and money matches `usd()`. A left-aligned figure column is a FAIL.",
      "Empty cells. A missing value renders a dash in `--dim`. A blank cell, `undefined`, `null`, `NaN`, or a zero the record did not give is a FAIL.",
      "Clickable rows. Every row that opens a record is reachable by Tab, has a button role and a label naming the record, and opens on Enter and Space. A row that responds only to the mouse is a FAIL. List each one.",
      "Selection. A selectable table has a checkbox column with a hidden header label and a label per checkbox, and a disabled checkbox names its reason. Selecting a row does not open it.",
      "Second lines and keys. A second fact sits on its own `.sub` line, and ids and keys are set in Monaspace Neon. A mid-dot joining two facts in a cell is a FAIL.",
    ],
  },
};
