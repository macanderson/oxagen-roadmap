// Page header: the eyebrow, the page h1, one line of subtext, and the page's actions.
export default {
  slug: "page-header",
  name: "Page header",
  group: "Page structure",
  order: 10,
  summary: "The eyebrow, the page title, one line of subtext, and the page's actions.",
  lead: "Every page opens with a page header. The eyebrow names where the page sits, the h1 names the page or the record, the subtext says what the page holds, and the actions on the right are what you can do from here. It holds the only Space Grotesk on the page.",
  root: ".phead",
  css: "lines 56 to 59, 127 to 132, phone 681",
  usedOn: ["Work", "Agents", "Spend", "Steering", "Tools", "Run", "Repositories", "Organization"],
  stories: [
    {
      id: "default",
      name: "Default",
      note: "Workspace eyebrow, page title, subtext, and two actions with one gold.",
      html: `
        <div class="phead">
          <div class="t">
            <p class="eyebrow">Core platform</p>
            <h1>Spend</h1>
            <p>What the tokens bought, with the basis on every number.</p>
          </div>
          <div class="acts">
            <button class="btn">Export report</button>
            <button class="btn primary">Set a budget</button>
          </div>
        </div>`,
    },
    {
      id: "three-actions",
      name: "Three actions",
      note: "Neutral actions first, the one gold action last.",
      html: `
        <div class="phead">
          <div class="t">
            <p class="eyebrow">Core platform</p>
            <h1>Agents</h1>
            <p>Every actor in this workspace and what it is made of.</p>
          </div>
          <div class="acts">
            <button class="btn">Steer</button>
            <button class="btn">New agent</button>
            <button class="btn primary">Register agent</button>
          </div>
        </div>`,
    },
    {
      id: "no-actions",
      name: "No actions",
      note: "A read-only page drops the actions cluster.",
      html: `
        <div class="phead">
          <div class="t">
            <p class="eyebrow">a-intel</p>
            <h1>Audit</h1>
            <p>Every event the record holds for this organization.</p>
          </div>
        </div>`,
    },
    {
      id: "back-link",
      name: "Record with a back link and badges",
      note: "A record page links its parent in the eyebrow and sets its badges in a `.row` under the title.",
      html: `
        <div class="phead">
          <div class="t">
            <p class="eyebrow"><a href="#/a-intel/core-platform/steering">Steering</a></p>
            <h1>Do not re-read CHANGELOG.md more than once in a run</h1>
            <div class="row" style="margin-top:8px"><span class="b b-allowed"><span class="d"></span>published</span><span class="b b-q mono">ctx.release.no-reread-changelog</span><span class="b b-q">v3</span></div>
            <p style="margin-top:8px">Supported by 682 duplicate tool calls across 212 runs of the release manager.</p>
          </div>
          <div class="acts">
            <button class="btn">Archive</button>
            <button class="btn primary">Edit</button>
          </div>
        </div>`,
    },
    {
      id: "id-title",
      name: "Identifier as the title",
      note: "A file path or an id is set in mono at 18px with `h1.mono`.",
      html: `
        <div class="phead">
          <div class="t">
            <p class="eyebrow"><a href="#/a-intel/core-platform/agents/release-manager">Agent</a></p>
            <h1 class="mono" style="font-size:18px">.oxagen/agents/release-manager.toml</h1>
            <div class="row" style="margin-top:8px"><span class="b b-q mono">main</span><span class="b b-q mono">main @ a4c91e2</span><span class="b b-q">source of truth</span></div>
          </div>
          <div class="acts"><button class="btn">Open in GitHub</button></div>
        </div>`,
    },
    {
      id: "long-title",
      name: "Long title",
      note: "A title over 90 characters drops to 20px, the display face's floor.",
      html: `
        <div class="phead">
          <div class="t">
            <p class="eyebrow"><a href="#/a-intel/core-platform/steering">Steering</a></p>
            <h1 style="font-size:20px">Before a release branch is cut, confirm that every pull request merged since the last tag has a changelog entry</h1>
          </div>
        </div>`,
    },
  ],
  anatomy: [
    ["Container", "`.phead`", "A wrapping flex row with an 18px gap and 18px below it. The title block sits left and the actions right."],
    ["Title block", "`.phead .t`", "The eyebrow, the h1, any badge row, and the subtext. It may shrink (`min-width:0`) so a long title wraps."],
    ["Eyebrow", "`.eyebrow`", "12px Geist 600 at 0.14em, capitals by CSS, in `--accent-text`, with 10px below. It names the workspace, or links the parent record."],
    ["Quiet eyebrow", "`.eyebrow.q`", "The same label in `--muted`. Use it for any eyebrow after the first on a page."],
    ["Title", "`.phead h1`", "Space Grotesk 24px 700 at −0.015em, with 4px below. It is the page's only h1."],
    ["Id title", "`h1.mono`", "Monaspace Neon at 18px, set inline, for a path or an id."],
    ["Badge row", "`.phead .t .row`", "Badges under the title on a record page, 8px above."],
    ["Subtext", "`.phead p`", "13px `--muted`, at most 70 characters wide."],
    ["Actions", "`.phead .acts`", "A wrapping flex row pushed right (`margin-left:auto`) with an 8px gap."],
  ],
  usage: {
    when: [
      "The top of every routed page and every record page.",
      "The page's own actions: the ones that act on the whole page, such as Export report or Register agent.",
    ],
    not: [
      "A section inside the page: use an h2, or a [panel](panel.html) header.",
      "A dialog's title: use the [dialog](dialog.html) header.",
      "A figure: put the page's key figures in [stat boxes](stat-box.html) under the header.",
    ],
    examples: [
      { kind: "avoid", html: `<div class="phead" style="margin:0;width:100%"><div class="t"><p class="eyebrow"><a href="#">Steering</a> · Skill</p><h1>Release Notes Style</h1></div><div class="acts"><button class="btn primary">Edit</button><button class="btn primary">Publish</button></div></div>`, why: "A mid-dot in the eyebrow, a title in title case, and two gold actions." },
      { kind: "use", html: `<div class="phead" style="margin:0;width:100%"><div class="t"><p class="eyebrow"><a href="#">Steering</a></p><h1>Release notes style</h1></div><div class="acts"><button class="btn">Edit</button><button class="btn primary">Publish</button></div></div>`, why: "The eyebrow links the parent, the title is sentence case, and one action is gold." },
      { kind: "avoid", html: `<div class="phead" style="margin:0;width:100%"><div class="t"><p class="eyebrow">Core platform</p><h1>Work</h1><p>This page is where the agents' work lives. It is ordered by the frames, not by kind, so you see what matters first.</p></div></div>`, why: "Subtext that explains the design. It is two sentences and a not contrast." },
      { kind: "use", html: `<div class="phead" style="margin:0;width:100%"><div class="t"><p class="eyebrow">Core platform</p><h1>Work</h1><p>What the agents work on, and what waits on you.</p></div></div>`, why: "One sentence that says what the page holds." },
    ],
    rules: [
      "A page has one page header and one h1. Tabs, stat boxes, and panels follow it.",
      "The first eyebrow on a page is gold and counts as the page's identity. Every later eyebrow is `.eyebrow.q`.",
      "The gold action, when there is one, sits last in the actions row.",
    ],
  },
  content: [
    "**Title**: the page name as a plain noun (\"Work\", \"Agents\", \"Spend\"), or the record's own name. Sentence case.",
    "**Eyebrow**: the workspace name, or a link to the parent record (\"Steering\", \"Agent\"). One word or name, with no mid-dot and no second label.",
    "**Subtext**: one sentence that says what the page holds, with no design reasoning. Omit it on a record page that has badges and a lead.",
    "**Actions**: a verb and a noun in sentence case (\"Export report\", \"Set a budget\", \"Register agent\"). At most one gold.",
    "**Ids**: a path or an id in the title is set in mono and keeps its case.",
  ],
  a11y: [
    "The h1 is the page's only h1, and every other heading on the page sits below it in the outline.",
    "The eyebrow is a paragraph, not a heading, so it does not break the outline.",
    "A back link in the eyebrow is a real link with a destination. The actions are real buttons with visible text.",
    "The eyebrow's `--accent-text` is 8.43:1 on `--panel` in dark and 4.65:1 on white in light.",
  ],
  phone: [
    "The h1 drops to 20px (engine.css 681).",
    "The actions leave the right edge and take the full width under the title (engine.css 132). Buttons grow to 40px tall.",
    "A long title wraps. It never truncates.",
  ],
  tokens: [
    ["--font-display", "The h1"],
    ["--accent-text", "The first eyebrow"],
    ["--muted", "The quiet eyebrow and the subtext"],
    ["--fg", "The title"],
    ["--gold, --on-gold", "The one primary action"],
  ],
  helpers: [
    ["srcHead(o, kindLabel, title, badges, lead, acts)", "wedge.js:1057", "The header of a Steering source: back link, title, badge row, lead, and actions. It drops a title over 90 characters to 20px."],
    ["pWork()", "wedge.js:74", "A plain page header, written inline, as most pages write theirs."],
  ],
  sourceNotes: [
    "No shared helper draws the page header. 18 page functions write `.phead` inline (14 in engine.js, 4 in wedge.js).",
    "An id title's 18px and a long title's 20px are inline styles, not modifier classes.",
  ],
  findings: [
    { tag: "open", title: "Mid-dot in the eyebrow", body: "Record pages write the parent link and the kind in one eyebrow, such as \"Agent · Source\" (engine.js 1196) and \"Steering · Skill\" in `srcHead()`. The label rule allows no mid-dot. The kind belongs in the badge row." },
    { tag: "note", title: "Sizes by inline style", body: "The 18px id title and the 20px long title are inline `style` attributes on the h1. A `.phead h1.long` and `h1.mono` rule would let an audit find them." },
    { tag: "note", title: "Every eyebrow is gold", body: "Each page's first eyebrow is gold, which the brand allows as identity. Eyebrows inside panels and dialogs use `.eyebrow.q`, and an audit should find no second gold eyebrow on a page." },
  ],
  audit: {
    checks: [
      "Structure. Every routed page opens with one page header: an eyebrow, one h1, optional subtext or badge row, and an actions cluster on the right. A page with no header, or a header below its tabs, is a FAIL.",
      "Title. The h1 is Space Grotesk at 24px and 700, and 20px on a phone. It is the only h1 on the page. A second h1, or a page title in Geist, is a FAIL.",
      "Eyebrow. 12px Geist 600 at 0.14em, capitals by CSS, `--accent-text` for the first on the page and `--muted` for any later one. It names the workspace or links the parent. A mid-dot or a second label in the eyebrow is a FAIL.",
      "Subtext. 13px `--muted`, at most 70 characters wide, and one sentence that says what the page holds. Design reasoning, a second sentence, or a not contrast is a FAIL.",
      "Actions. Right-aligned, wrapping, 8px apart, with at most one gold button and the gold one last. Labels are a verb and a noun in sentence case.",
      "Ids and long titles. A path or an id in the title is set in Monaspace Neon and keeps its case. A title over 90 characters renders at 20px. Space Grotesk below 20px is a FAIL.",
      "Back link. A record page's eyebrow links to its parent with a real `a href`, and the link works.",
    ],
  },
};
