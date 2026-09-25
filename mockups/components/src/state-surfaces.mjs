// State surfaces: what a page shows when it is loading, empty, failed, or not yours to see.
const ICO_EMPTY = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>';
const ICO_ERROR = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>';
const ICO_DENIED = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';

export default {
  slug: "state-surfaces",
  name: "State surfaces",
  group: "Feedback",
  order: 10,
  summary: "What a page shows while it loads, when it is empty, when it fails, and when you lack the role.",
  lead: "Every page has four states besides loaded. Loading draws the page's shape in shimmering blocks. Empty says what is missing, where it comes from, and the one action that fills it. Error says what failed and that nothing changed, then offers to try again. Denied names the permission you lack and who can grant it. The mockup pins a state with `?state=` so each one can be reviewed.",
  root: ".state-wrap, .sk",
  css: "lines 366 to 375",
  usedOn: ["Work", "Run", "Agents", "an agent", "Tools", "Steering", "Spend", "Repositories", "Runtimes", "Organization", "Billing", "Audit"],
  stories: [
    {
      id: "empty",
      name: "Empty",
      note: "Work with no connected issue tracker. The heading names what is missing and the one gold action fills it.",
      html: `
        <div class="state-wrap" style="padding:36px 20px">
          <div class="ico" aria-hidden="true">${ICO_EMPTY}</div>
          <h2>No work in Core platform yet</h2>
          <p>Work arrives from a connected issue tracker, from a finding a person picks up, or written here. A run an agent starts on its own is filed under a direct work order.</p>
          <div class="acts"><button class="btn primary">Connect an issue tracker</button></div>
        </div>`,
    },
    {
      id: "loading",
      name: "Loading",
      note: "`skeleton()` draws four stat boxes and a panel of seven rows. The shimmer stops under reduced motion.",
      html: `
        <div aria-busy="true" aria-label="Loading">
          <div class="grid g4" style="margin-bottom:16px"><div class="sk b"></div><div class="sk b"></div><div class="sk b"></div><div class="sk b"></div></div>
          <div class="panel"><div class="panel-h"><div class="sk t" style="width:180px"></div></div>
            <div class="panel-b"><div class="sk r" style="margin-bottom:8px"></div><div class="sk r" style="margin-bottom:8px"></div><div class="sk r" style="margin-bottom:8px"></div><div class="sk r" style="margin-bottom:8px"></div></div></div>
        </div>`,
    },
    {
      id: "error",
      name: "Error",
      note: "What failed, the code the control plane gave, that nothing changed, and what still ran. Try again is the one action.",
      html: `
        <div class="state-wrap" style="padding:36px 20px">
          <div class="ico" style="color:var(--st-failed);border-color:color-mix(in srgb,var(--st-failed) 40%,transparent)" aria-hidden="true">${ICO_ERROR}</div>
          <h2>This file could not be loaded</h2>
          <p>The control plane answered <code>502 git_read_unreachable</code>. Nothing was changed. Runs kept recording while this page was down. The collector on each host writes the frames.</p>
          <div class="acts"><button class="btn primary">Try again</button><button class="btn">Open an incident</button></div>
          <p class="mono dim" style="margin-top:16px;font-size:11.5px">request 01K5RSXQ7F2E, us-east-1, 2026-09-11 09:16:04Z</p>
        </div>`,
    },
    {
      id: "denied",
      name: "Denied",
      note: "The permission you lack, who can grant it, and how the refusal was decided.",
      html: `
        <div class="state-wrap" style="padding:36px 20px">
          <div class="ico" style="color:var(--st-denied);border-color:color-mix(in srgb,var(--st-denied) 40%,transparent)" aria-hidden="true">${ICO_DENIED}</div>
          <h2>You need access to this agent's definition</h2>
          <p>Your roles on <b>a-intel</b> do not include <code>agent.write on core-platform</code>. An organization owner can grant it. The grant is a governed action and lands in the audit record with your name on it.</p>
          <div class="acts"><button class="btn primary">Request access</button><button class="btn">Back to Work</button></div>
          <dl class="kv" style="margin-top:20px;text-align:left;max-width:420px">
            <dt>Signed in as</dt><dd>Marcus Bell <span class="mono">workspace.member</span></dd>
            <dt>Needed</dt><dd><span class="mono">agent.write on core-platform</span></dd>
            <dt>Decided by</dt><dd><span class="mono">pol_v41</span>, where a deny outranks every allow</dd>
          </dl>
        </div>`,
    },
    {
      id: "in-panel",
      name: "Empty inside a panel",
      note: "A section with nothing in it keeps its panel and says so in one line, with the action beside it.",
      canvas: "panel",
      html: `
        <div class="panel">
          <div class="panel-h"><h3>Budgets</h3><div class="sp"><button class="btn sm">Set a budget</button></div></div>
          <div class="panel-b"><p class="muted" style="margin:0;font-size:13px">No ceiling is set for Core platform or for a-intel.</p></div>
        </div>`,
    },
  ],
  anatomy: [
    ["Surface", "`.state-wrap`", "A centered grid with 60px by 20px padding, replacing the page body under its header."],
    ["Icon", "`.state-wrap .ico`", "A 44px tile on `--panel` with a 12px radius and a `--border` edge. Error tints it `--st-failed` and denied `--st-denied`."],
    ["Heading", "`.state-wrap h2`", "The state in words, 7px above the text. Geist, like every h2."],
    ["Text", "`.state-wrap p`", "13px `--muted`, at most 52 characters wide."],
    ["Actions", "`.state-wrap .acts`", "Centered buttons, the one gold action first."],
    ["Detail", "`.state-wrap .kv`, `p.mono.dim`", "The facts behind a denial, or the request id behind an error."],
    ["Skeleton block", "`.sk`", "A shimmering bar from `--hl` to `--panel`, 11px tall, 6px radius, cycling every 1.5 seconds."],
    ["Skeleton sizes", "`.sk.t`, `.sk.b`, `.sk.r`", "A title (22px), a stat box (64px), and a row (38px)."],
  ],
  usageNote: "A page has all four states. The mockup draws the states each renderer branches on.",
  usage: {
    when: [
      "Loading: before the first answer for a page, never for a background refresh.",
      "Empty: the page loaded and holds nothing yet.",
      "Error: the page's data could not be read.",
      "Denied: your roles do not include the permission the page needs.",
    ],
    not: [
      "One empty section of a loaded page: keep its [panel](panel.html) and write one line inside it.",
      "A list that a search emptied: the [list table](list-table.html) says \"No rows match.\"",
      "An action that failed: say so in a [toast](toast.html) or beside the field.",
    ],
    examples: [
      { kind: "avoid", row: false, html: `<div class="state-wrap" style="padding:20px;width:100%"><h2>Oops! Something went wrong</h2><p>Sorry, we couldn't load this page. Please try again later.</p></div>`, why: "An apology and no facts. It names nothing that failed, and says nothing about whether anything changed." },
      { kind: "use", row: false, html: `<div class="state-wrap" style="padding:20px;width:100%"><h2>This file could not be loaded</h2><p>The control plane answered <code>502 git_read_unreachable</code>. Nothing was changed.</p><div class="acts"><button class="btn primary">Try again</button></div></div>`, why: "What failed, the code, what did not change, and one action." },
    ],
    rules: [
      "Every state keeps the page header, so you know where you are.",
      "An empty state has exactly one action, the one that fills it, and it is the gold primary.",
      "An error says what did not change and what kept running. A page that could not load never implies data was lost.",
      "A denied state names the exact permission, who can grant it, and a way to ask.",
      "A field no source backs yet renders as not recorded inside a loaded page. That is not an empty state.",
    ],
  },
  content: [
    "**Empty heading**: what is missing and where: \"No work in Core platform yet\".",
    "**Empty text**: where the thing comes from, in one or two sentences.",
    "**Error heading**: the thing and the verb: \"This file could not be loaded\".",
    "**Error text**: the control plane's code in `code`, then \"Nothing was changed.\" Never an apology, and never blame.",
    "**Denied heading**: what you need, stated positively: \"You need access to this agent's definition\".",
    "**Denied text**: the permission in `code`, who can grant it, and what the grant records.",
    "**Request id**: the id, region, and time in mono, separated by commas.",
  ],
  a11y: [
    "The state's heading is an h2 under the page h1, so the outline stays whole.",
    "The icon is `aria-hidden`. The heading carries the meaning.",
    "Loading marks its region `aria-busy=\"true\"`, and the loaded page announces itself by moving focus or through a polite live region. The mockup does neither. See Findings.",
    "The shimmer stops under `prefers-reduced-motion` through the global rule at engine.css 49.",
    "Error and denied text is `--muted`, 6.91:1 on `--ink` in dark and 4.83:1 in light.",
  ],
  phone: [
    "The surface keeps its centered layout with 16px page padding. Buttons wrap and take the phone button height.",
    "The skeleton's four stat blocks sit two to a row.",
  ],
  tokens: [
    ["--panel, --border", "Icon tile"],
    ["--st-failed", "Error icon"],
    ["--st-denied", "Denied icon"],
    ["--muted", "Text"],
    ["--dim", "Request id"],
    ["--hl, --panel", "Skeleton shimmer"],
  ],
  helpers: [
    ["skeleton()", "engine.js:852", "The loading state: four stat blocks and a panel of seven rows."],
    ["emptyState(t, p, acts)", "engine.js:859", "The empty state with a heading, text, and actions."],
    ["errorState(what, code)", "engine.js:864", "The error state with the control plane's code, Try again, and Open an incident."],
    ["deniedState(what, need)", "engine.js:873", "The denied state with the permission, Request access, and the facts."],
  ],
  sourceNotes: [
    "Each page renderer branches on `S.state`, which `?state=loaded|empty|loading|error|denied` sets. `mockups/catalog.mjs` records which states each page has.",
    "About 19 to 21 page functions call each helper.",
  ],
  findings: [
    { tag: "open", title: "Rule breaks in the error and denied copy", body: "The error text ends \"Frames are written by the collector on each host, not by oxagen\", a \"not\" contrast in the passive voice. Its id line reads `trace 01K5RSXQ7F2E · us-east-1 · …`, which uses a retired word and mid-dots. The denied text joins two sentences with a semicolon, and its heading reads \"You cannot see\". The examples above show the rewrites." },
    { tag: "open", title: "Definition terms outside a list", body: "`deniedState()` writes `dt` and `dd` inside a `div.kv`. They are only valid inside a `dl`." },
    { tag: "open", title: "Loading is silent", body: "The skeleton sets no `aria-busy`, and nothing announces when the page arrives. A screen reader hears nothing until you move." },
    { tag: "note", title: "One icon for every empty page", body: "Every empty state uses the same table icon, whatever is missing." },
  ],
  audit: {
    checks: [
      "Coverage. Every page renders loading, empty, error, and denied. Force each one (a slow response, an empty workspace, a 502, and a role without the permission) and record what each page shows.",
      "Header. Each state keeps the page header and the tabs.",
      "Empty. The heading names what is missing, the text says where it comes from, and there is exactly one action, the gold primary, that fills it.",
      "Error. The heading names what failed, the text quotes the control plane's code and says nothing was changed, and Try again reloads only the failed data. An apology, a vague message, or a stack trace is a FAIL.",
      "Denied. The text names the exact permission and who can grant it, and offers a way to request it. The request lands in the audit record.",
      "Loading. The skeleton matches the page's shape, marks its region busy, and the arrival of the page is announced. The shimmer stops under reduced motion.",
      "Copy. No state's text uses a semicolon, a mid-dot, a \"not\" contrast, the word trace, or an apology.",
      "Markup. Definition terms sit inside a dl, and the state's heading is an h2.",
    ],
  },
};
