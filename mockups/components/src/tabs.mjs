// Tabs: the views of one record or one page, one of them open.
export default {
  slug: "tabs",
  name: "Tabs",
  group: "Page structure",
  order: 40,
  summary: "The views of one page or record, with one open and a count beside each.",
  lead: "Tabs split one page or one record into views that share its header: a run's Decision trace, Transcript, Cost, Memories, and Evidence, or Work's Backlog, Work orders, Workflows, and Findings. Each tab is a route, so a tab can be linked and the back button returns to it. A count beside a tab says how many rows the view holds.",
  root: ".tabs",
  css: "lines 227 to 231, 1439 to 1441, 1597, dialog 489 to 490, phone 674 to 676",
  usedOn: ["Work", "Run", "Agent", "Agent source", "Tools", "Steering", "Spend", "Repositories", "Organization", "Audit", "Account dialog"],
  stories: [
    {
      id: "page",
      name: "Page tabs with counts",
      note: "Work's four tabs. A count renders only when it is above zero.",
      html: `
        <div class="tabs" role="tablist" aria-label="Work">
          <button class="tab" role="tab" aria-selected="true">Backlog<span class="vh"> </span><span class="n">3</span></button>
          <button class="tab" role="tab" aria-selected="false">Work orders<span class="vh"> </span><span class="n">2</span></button>
          <button class="tab" role="tab" aria-selected="false">Workflows</button>
          <button class="tab" role="tab" aria-selected="false">Findings<span class="vh"> </span><span class="n">7</span></button>
        </div>`,
    },
    {
      id: "record",
      name: "Record tabs with a state and a figure",
      note: "The Run page. A dot marks a tab that holds something waiting, and Cost carries its figure.",
      html: `
        <div class="tabs" role="tablist" aria-label="Run">
          <button class="tab" role="tab" aria-selected="true" title="1">Decision trace<span class="st" title="A call is parked for approval"></span></button>
          <button class="tab" role="tab" aria-selected="false" title="2">Transcript<span class="vh"> </span><span class="n" title="48 transcript entries">48</span></button>
          <button class="tab" role="tab" aria-selected="false" title="3">Cost<span class="vh"> </span><span class="n money" title="Cost of this run">$4.13</span></button>
          <button class="tab" role="tab" aria-selected="false" title="4">Memories<span class="vh"> </span><span class="n" title="2 memories">2</span></button>
          <button class="tab" role="tab" aria-selected="false" title="5">Evidence<span class="vh"> </span><span class="n" title="The chain is sealed">sealed</span></button>
        </div>`,
    },
    {
      id: "states",
      name: "Tab state dots",
      note: "`.st` is waiting, `.st.ok` is healthy, and `.st.bad` is failing. Each dot has a title that says which.",
      html: `
        <div class="tabs" role="tablist" aria-label="Tools">
          <button class="tab" role="tab" aria-selected="false">Tools<span class="vh"> </span><span class="n" style="color:var(--st-approval)" title="2 schemas need approval">2</span></button>
          <button class="tab" role="tab" aria-selected="true">Toolbelts<span class="vh"> </span><span class="n" title="6 toolbelts">6</span></button>
          <button class="tab" role="tab" aria-selected="false">Providers<span class="st ok" title="Every provider is connected"></span></button>
          <button class="tab" role="tab" aria-selected="false">Kill switches<span class="st bad" title="1 kill switch on"></span></button>
        </div>`,
    },
    {
      id: "dialog",
      name: "Tabs in a dialog",
      note: "Inside `.dlg` the strip loses its bottom margin and takes the dialog's 18px side padding.",
      canvas: "panel",
      html: `
        <div class="dlg" role="dialog" aria-modal="true" aria-label="Account" style="position:relative;max-width:520px;margin:0">
          <div class="dlg-h"><h2>Account</h2><button class="iconbtn x" aria-label="Close">×</button></div>
          <div class="tabs" role="tablist" aria-label="Account">
            <button class="tab" role="tab" aria-selected="true">Profile</button>
            <button class="tab" role="tab" aria-selected="false">Preferences</button>
            <button class="tab" role="tab" aria-selected="false">Security</button>
          </div>
          <div class="dlg-b"><p class="muted" style="margin:0">The profile fields sit here.</p></div>
        </div>`,
    },
  ],
  anatomy: [
    ["Strip", "`.tabs`", "A flex row with a 1px `--border` underline, 16px below it, scrolling sideways when the tabs overflow."],
    ["Tab", "`.tab`", "A button: 13px Geist 500 in `--muted`, 8px by 13px padding, a 2px transparent underline."],
    ["Selected tab", "`.tab[aria-selected=\"true\"]`", "Text in `--fg` and a 2px `--gold` underline."],
    ["Count", "`.tab .n`", "10.5px Monaspace Neon in `--dim`, 5px after the name, with a hidden space before it so it reads as \"Backlog 3\"."],
    ["Money count", "`.tab .n.money`", "A figure in `--muted`, such as the Cost tab's total."],
    ["State dot", "`.tab .st`", "A 6px dot, `--st-approval` by default. `.ok` is `--st-allowed` and `.bad` is `--st-failed`."],
  ],
  usageNote: "Tabs switch views of the same subject. Anything else is a different component.",
  usage: {
    when: [
      "Views of one record that share its header: a run, an agent, a tool.",
      "Views of one page that share its header and stat row: Work, Tools, Spend.",
      "Sections of one dialog, such as Account.",
    ],
    not: [
      "Filtering or regrouping one list: use a [segmented control](segmented-control.html).",
      "Moving between pages: use the sidebar.",
      "Steps in a sequence: use a [timeline](timeline.html) or the wizard's steps.",
    ],
    examples: [
      { kind: "avoid", html: `<div class="tabs" role="tablist" style="margin:0"><button class="tab" role="tab" aria-selected="true">Table</button><button class="tab" role="tab" aria-selected="false">Graph</button></div>`, why: "Tabs that switch how one list is drawn. That is a segmented control, and the list keeps its header." },
      { kind: "use", html: `<div class="seg" role="group" aria-label="View"><button class="btn sm" aria-pressed="true">List</button><button class="btn sm" aria-pressed="false">Graph</button></div>`, why: "A segmented control for two views of the same list." },
      { kind: "avoid", html: `<div class="tabs" role="tablist" style="margin:0"><button class="tab" role="tab" aria-selected="true">Overview of the agent</button><button class="tab" role="tab" aria-selected="false">Runs, costs · 30d</button></div>`, why: "Long labels, a comma, and a mid-dot. A tab name is one or two plain words." },
      { kind: "use", html: `<div class="tabs" role="tablist" style="margin:0"><button class="tab" role="tab" aria-selected="true">Overview</button><button class="tab" role="tab" aria-selected="false">Activity<span class="vh"> </span><span class="n">1,340</span></button></div>`, why: "Plain nouns, and the figure sits in the count." },
    ],
    rules: [
      "Each tab is a route. Selecting one changes the address, so a link opens that tab and the back button returns to the last one.",
      "The first tab is the default view of the record. The Run page opens on the Decision trace.",
      "The tab count equals the rows its view holds. Spend's Budgets tab and the table under it show the same number.",
      "When the strip overflows, the selected tab scrolls into view.",
    ],
  },
  content: [
    "**Name**: one or two words, a plain noun, in sentence case: \"Decision trace\", \"Kill switches\".",
    "**Count**: a number formatted with thousands separators, rendered only above zero. A figure such as the Cost tab's total goes through `usd()` and takes `.money`.",
    "**Title**: a count or a dot carries a `title` with the full phrase, such as \"48 transcript entries\" or \"A call is parked for approval\".",
    "**Word counts**: a word in the count slot is lowercase and names a state (\"sealed\", \"live\").",
  ],
  a11y: [
    "The strip is `role=\"tablist\"` with an `aria-label` naming the page or record. Each tab is a `button` with `role=\"tab\"` and `aria-selected`.",
    "A hidden space (`.vh`) sits between the name and the count, so a screen reader says \"Transcript 48\", not \"Transcript48\".",
    "The state dot is color only. Its `title` carries the words, and the build must also expose them to a screen reader, such as with `aria-describedby` or hidden text.",
    "Keyboard: Tab reaches each tab and Enter or Space opens it. Arrow keys between tabs are the WAI-ARIA pattern and the mockup does not implement them. See Findings.",
    "The selected underline is 2px of gold, and the selected text changes from `--muted` to `--fg`, so the state does not rest on color alone.",
  ],
  phone: [
    "Tabs grow to 44px tall at 14px, with 12px by 14px padding.",
    "The strip bleeds to the screen edges (negative 16px margins) and snaps each tab to its start as it scrolls.",
  ],
  tokens: [
    ["--border", "Strip underline"],
    ["--muted", "Tab name at rest, money count"],
    ["--fg", "Selected and hovered tab name"],
    ["--gold", "Selected underline (see Findings)"],
    ["--dim", "Count"],
    ["--st-approval, --st-allowed, --st-failed", "State dot"],
  ],
  helpers: [
    ["runTabs(R, t)", "engine.js:2786", "The Run page's five tabs, with the state dot and the Cost figure."],
    ["tabN(n, title, style)", "engine.js:678", "A count with its hidden space and title. Renders nothing for zero."],
    ["dialog()", "engine.js:9569", "Renders `d.tabs` into a strip between a dialog's header and body."],
  ],
  sourceNotes: [
    "Pages write the strip inline: Work (`WORK_TABS` in `wedge.js`), Tools (engine.js 4831), agent, Steering, Spend, Repositories, Organization, and Audit. There are 15 `role=\"tab\"` sites.",
    "`render()` scrolls the selected tab into view when the strip overflows.",
  ],
  findings: [
    { tag: "open", title: "Gold marks the selected tab", body: "The selected underline is `--gold`. By the brand's rule gold is identity plus one action, never a state. `--fg` would carry the same meaning. See [Colors](../colors.html#gold)." },
    { tag: "open", title: "No arrow keys or tab panels", body: "Tabs are reached with Tab only, and no view carries `role=\"tabpanel\"` or `aria-controls`. Because each tab is a route, a build may render them as links in a `nav` instead. Either pattern is fine, and the build must pick one." },
    { tag: "open", title: "Unlabelled strips", body: "Six strips have `role=\"tablist\"` with no `aria-label` (engine.js 1199, 4251, 4831, 7229, 7403, 8057, and every dialog through `dialog()`)." },
    { tag: "note", title: "Count color by inline style", body: "The Tools tab colors its count `--st-approval` with an inline style when a schema waits. A modifier class would let an audit find every colored count." },
    { tag: "open", title: "Count contrast", body: "The count is `--dim`, which is 3.67:1 on `--panel` in dark and 2.56:1 in light. A count is a figure a person reads." },
  ],
  audit: {
    checks: [
      "Structure. Each strip is a tablist with an accessible name, and each tab has role tab and aria-selected, or the build renders the strip as navigation links with aria-current. A mix of the two is a FAIL.",
      "Routes. Every tab changes the address. Opening the address directly opens that tab, and the back button returns to the previous tab. A tab that only toggles local state is a FAIL.",
      "Selected state. The selected tab's text is --fg with a 2px underline, and unselected tabs are --muted. Report the underline color. Gold is a finding against the brand rule.",
      "Counts. A count renders only above zero, uses thousands separators, sits in 10.5px Monaspace Neon, and equals the rows of the view it opens. Quote any count that disagrees with its view.",
      "State dots. Each dot has words a screen reader can reach. A dot with only a color is a FAIL.",
      "Overflow. With the window narrowed until the strip overflows, the strip scrolls sideways, the page does not, and the selected tab stays in view.",
      "Keyboard. Tab reaches every tab, and Enter or Space opens it. Record whether arrow keys move between tabs.",
      "Names. Every tab name is one or two words in sentence case, with no comma, mid-dot, or trailing count in the name itself.",
    ],
  },
};
