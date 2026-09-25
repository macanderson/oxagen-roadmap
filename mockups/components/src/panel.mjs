// Panel: the bordered box that holds one subject, with a shaded header band.
export default {
  slug: "panel",
  name: "Panel",
  group: "Page structure",
  order: 20,
  summary: "A bordered box that holds one subject under a shaded header.",
  lead: "A panel groups one subject on a page: a table, a list of keys and values, a chart, or a section of a form. Its header band names the subject and holds the actions that apply to it. Almost every page is a stack of panels under the page header.",
  root: ".panel",
  css: "lines 147 to 152, 730 to 731, 2252 to 2253",
  usedOn: ["Work", "Agents", "Run", "Spend", "Steering", "Tools", "Billing", "every dialog body"],
  stories: [
    {
      id: "title-body",
      name: "Title and body",
      note: "The plain case: an h3 in the header band and a padded body.",
      html: `
        <div class="panel">
          <div class="panel-h"><h3>Billable units</h3></div>
          <div class="panel-b">
            <p style="margin:0">A governed action is a call oxagen decided, delivered, and recorded, with its receipt in the chain.</p>
          </div>
        </div>`,
    },
    {
      id: "subtext-actions",
      name: "Subtext and actions",
      note: "A one-sentence subtext under the title, and small neutral actions in `.sp` on the right.",
      html: `
        <div class="panel">
          <div class="panel-h">
            <div style="flex:1;min-width:0"><h3>Budgets</h3><p class="muted" style="margin:2px 0 0;font-size:12px">Every ceiling that governs Core platform.</p></div>
            <div class="sp"><button class="btn sm">Export CSV</button><button class="btn sm">Set a budget</button></div>
          </div>
          <div class="panel-b"><p class="muted" style="margin:0;font-size:12.5px">3 ceilings apply: the organization's, this workspace's, and one agent's per-run ceiling.</p></div>
        </div>`,
    },
    {
      id: "table-footer",
      name: "Table and footer note",
      note: "A table sits in `.tw` directly under the header, and a footer note sits in a `.panel-b` with a top border.",
      html: `
        <div class="panel">
          <div class="panel-h"><h3>Work orders</h3></div>
          <div class="tw"><table class="narrow">
            <thead><tr><th>Work order</th><th>Agent</th><th class="num">Spend</th></tr></thead>
            <tbody>
              <tr><td><b>Cut 4.11.0 release notes</b></td><td class="mono" style="font-size:12px">a-intel.core.release-manager</td><td class="num">$4.13</td></tr>
              <tr><td><b>Triage new issues</b></td><td class="mono" style="font-size:12px">a-intel.core.triage</td><td class="num"><span class="dim">—</span></td></tr>
            </tbody>
          </table></div>
          <div class="panel-b" style="border-top:1px solid var(--border)"><div class="note">A work order is done when you accept every item, and nothing merges without a person.</div></div>
        </div>`,
    },
    {
      id: "padded",
      name: "Padded panel",
      note: "`.panel.pad` has no header band. Use it for one short block, such as a notice inside a page.",
      html: `
        <div class="panel pad">
          <p class="eyebrow q">Plan</p>
          <p style="margin:0">Team, billed monthly. 12 of 20 seats in use.</p>
        </div>`,
    },
    {
      id: "available",
      name: "Available card",
      note: "An option you have not set up yet takes a dashed border (`.ipc.avail`), from the Intake dialog's provider cards.",
      html: `
        <div class="grid g2">
          <div class="panel ipc"><div class="panel-h"><h3>GitHub Issues</h3><span class="b b-allowed" style="margin-left:auto"><span class="d"></span>connected</span></div><div class="panel-b"><p class="muted" style="margin:0;font-size:12.5px">a-intel/platform, 214 open issues.</p></div></div>
          <div class="panel ipc avail"><div class="panel-h"><h3>Linear</h3></div><div class="panel-b"><p class="muted" style="margin:0;font-size:12.5px">Not connected.</p></div></div>
        </div>`,
    },
  ],
  anatomy: [
    ["Container", "`.panel`", "`--panel` ground, a 1px `--border`, a 12px radius, and `overflow:hidden` so the header and table corners follow the radius."],
    ["Header band", "`.panel-h`", "A `--panel-h` band, 12px by 16px, with a bottom border. A wrapping flex row with a 12px gap."],
    ["Title", "`.panel-h h3`", "Geist 13.5px 600. Never Space Grotesk."],
    ["Subtext", "`.panel-h p.muted`", "One sentence under the title, 12px `--muted`, 2px above. It sits with the title in a `flex:1` block."],
    ["Actions", "`.panel-h .sp`", "A wrapping flex row pushed right with a 7px gap. Small neutral buttons, filters, or a badge."],
    ["Body", "`.panel-b`", "14px by 16px padding for text, a key-value list, a meter, or a form."],
    ["Table well", "`.panel .tw`", "A table goes in `.tw` straight under the header, with no body padding. `listify()` adds its controls."],
    ["Footer", "`.panel-b` with a top border", "A closing note under a table, set by an inline `border-top`."],
    ["Padded", "`.panel.pad`", "A panel with no header, padded 16px by 18px."],
  ],
  usage: {
    when: [
      "One subject on a page that needs a heading: a table, a key-value list, a chart, a form section.",
      "Actions that apply to that subject only, in the header's `.sp`.",
    ],
    not: [
      "One figure: use a [stat box](stat-box.html).",
      "A warning or an explanation: use a [note](note.html).",
      "Content that opens over the page: use a [dialog](dialog.html) or a [drawer](drawer.html).",
      "A table's search and pager: `listify()` adds them. See [List table](list-table.html).",
    ],
    examples: [
      { kind: "avoid", html: `<div class="panel" style="width:100%"><div class="panel-h"><h3 style="font-family:var(--font-display)">Registered in Core platform, by owner</h3><div class="sp"><button class="btn sm primary">Register agent</button></div></div><div class="panel-b"><p class="muted" style="margin:0;font-size:12.5px">14 agents.</p></div></div>`, why: "A comma tail in the title, the title in the display face, and a gold button in the header." },
      { kind: "use", html: `<div class="panel" style="width:100%"><div class="panel-h"><h3>Registered agents</h3><div class="sp"><button class="btn sm">Register agent</button></div></div><div class="panel-b"><p class="muted" style="margin:0;font-size:12.5px">14 agents.</p></div></div>`, why: "A plain-noun title in Geist and a small neutral action. The page header holds the gold one." },
    ],
    rules: [
      "Stack panels in a [layout grid](layout-grid.html) with a 14px gap. A panel never nests inside another panel.",
      "A table in a panel starts right under the header band, with no body padding around it.",
      "A panel header's buttons are `.btn.sm` and neutral. The page's one gold action lives in the page header or a dialog footer.",
    ],
  },
  content: [
    "**Title**: a plain noun in sentence case (\"Budgets\", \"Work orders\", \"Billable units\"). No comma tail, no mid-dot, no count, no not contrast.",
    "**Subtext**: one sentence or nothing. It says what the panel holds or what scope it covers, never why it was designed that way.",
    "**Footer note**: one or two sentences that state a rule the rows follow.",
    "**Actions**: a verb and a noun in sentence case, as small buttons.",
  ],
  a11y: [
    "The title is an h3, under the page h1 or a section h2. A panel title written as bold text is not a heading and breaks the outline.",
    "The subtext is a paragraph that follows the h3, so a screen reader reads it after the title.",
    "The header's actions are real buttons with visible text.",
    "The subtext is `--muted` on `--panel-h`: 6.41:1 in dark and 4.40:1 in light, which falls short of 4.5:1. See Findings.",
  ],
  phone: [
    "The header band wraps: the actions drop under the title when the row is full.",
    "A table in the panel turns into labelled cards (`cardTables()`).",
    "Padding stays the same, so a panel keeps its edges at 390px.",
  ],
  tokens: [
    ["--panel", "Ground"],
    ["--panel-h", "Header band"],
    ["--border", "Border and header rule"],
    ["--fg", "Title"],
    ["--muted", "Subtext"],
  ],
  helpers: [
    ["panel(title, sub, btn, head, rows)", "engine.js:3229", "A local helper inside `tkFieldsTab()` for the Work fields tables. It is the only one."],
    ["listify()", "engine.js:13867", "Adds the list controls to every table inside a panel after each render."],
  ],
  sourceNotes: [
    "Panels are written inline: 154 `class=\"panel\"` in engine.js and 25 in wedge.js.",
    "The subtext is an inline-styled `p.muted` (`margin:2px 0 0;font-size:12px`) repeated at each site. `.panel-h .ks-grow p` (723 to 724) is the one class-based subtext, used on Tools.",
    "The footer's top border is an inline `style` in 20 places.",
  ],
  findings: [
    { tag: "open", title: "Subtext contrast in light", body: "The subtext is `--muted` on `--panel-h`, which is 4.40:1 in light. See [Colors](../colors.html#findings)." },
    { tag: "note", title: "Subtext and footer by inline style", body: "Neither the header subtext nor the footer border has a class. A `.panel-h .sub` and a `.panel-f` would make every copy match and let an audit find them." },
    { tag: "note", title: "No shared helper", body: "One local `panel()` exists for one tab. The other 178 panels are hand-written strings, so a build should draw its panel from one component." },
  ],
  audit: {
    checks: [
      "Container. `--panel` ground, 1px `--border`, 12px radius, and clipped corners, so a table's first header row follows the radius.",
      "Header band. A `--panel-h` band, 12px by 16px, with a 1px bottom border, holding the title left and any actions right. A header with no band shade, or a panel with its title outside the box, is a FAIL.",
      "Title. An h3 in Geist 13.5px 600, a plain noun in sentence case. Space Grotesk, a comma tail, a mid-dot, a count in the title, or bold text in place of a heading is a FAIL.",
      "Subtext. At most one sentence, 12px `--muted`, under the title. It states scope, never design reasoning.",
      "Actions. Small neutral buttons (`.btn.sm`) in a right-aligned wrapping cluster with a 7px gap. A gold button in a panel header is a FAIL.",
      "Body. Text, lists, and forms sit in a 14px by 16px body. A table sits in its scroll well straight under the header with no body padding.",
      "Footer. A closing note sits in a body with a 1px top border, below the table.",
      "Nesting. No panel sits inside another panel.",
    ],
  },
};
