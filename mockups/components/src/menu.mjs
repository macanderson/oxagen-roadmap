// Menu: a short list of choices, anchored to the control that opened it. See
// tools/build-components.mjs for the shape of this module, and stat-box.mjs for the depth and tone
// every module matches.
export default {
  slug: "menu",
  name: "Menu",
  group: "Actions and input",
  order: 40,
  summary: "A short list of choices, anchored to the button that opened it.",
  lead: "A menu opens beside the control that owns it: the account button, a dispatch action, an @-mention while typing. It lists items to pick, closes on Escape or a click outside, and never holds a field longer than a search box. A menu with a search field, such as the dispatch menu, narrows its own list as you type.",
  root: ".menu",
  css: "lines 616 to 622, 2219 to 2227",
  usedOn: ["every page (account menu)", "Work (send to agent)", "Work order (mention list)"],
  stories: [
    {
      id: "account",
      name: "Account menu",
      note: "Anchored under the avatar button with `.rel`. The inline `position:relative` on `.rel` below keeps the anchoring, but the menu itself needs `position:relative` in place of `absolute` to draw in this canvas.",
      canvas: "panel",
      html: `
        <div class="rel" style="width:250px">
          <div class="menu" style="position:relative;top:auto;right:auto">
            <div class="menu-hd"><b>Marcus Bell</b><span>marcus@a-intel.example</span></div>
            <button class="menu-i">Account</button>
            <button class="menu-i">Preferences</button>
            <button class="menu-i">Security and sessions</button>
            <button class="menu-i">Privacy and data</button>
            <div class="hr" style="margin:5px 0"></div>
            <button class="menu-i">Switch theme</button>
            <button class="menu-i">Sign out</button>
          </div>
        </div>`,
    },
    {
      id: "dispatch",
      name: "Dispatch menu",
      note: "`.dsp-menu` adds a search field and grouped, labelled sections over the plain menu shell.",
      canvas: "panel",
      html: `
        <div class="rel" style="width:360px">
          <div class="menu dsp-menu" role="menu" aria-label="Send to" style="position:relative;top:auto;right:auto">
            <div class="menu-hd"><b>Send 2 work items to</b><span>agents where you are the registered operator</span></div>
            <input class="dsp-q" type="search" placeholder="Search agents and workflows" aria-label="Search agents and workflows" value="">
            <div class="menu-l">Agents you operate</div>
            <button class="menu-i dsp-i" role="menuitem"><span class="tx"><b>a-intel.core.release-manager</b><span>Claude Code &middot; edge-runner-3</span></span></button>
            <button class="menu-i dsp-i" role="menuitem"><span class="tx"><b>a-intel.core.triage</b><span>Claude Code &middot; edge-runner-1</span></span></button>
            <div class="menu-l">Workflows</div>
            <button class="menu-i dsp-i" role="menuitem"><span class="tx"><b>Release cut</b><span>3 stages then you</span></span></button>
          </div>
        </div>`,
    },
    {
      id: "empty",
      name: "No match",
      note: "`.menu-l` labels a section. `.menu-e` is its empty line when nothing matches the search.",
      html: `
        <div class="menu" style="position:relative;top:auto;right:auto;width:280px">
          <div class="menu-l">Agents you operate</div>
          <div class="menu-e">No agent you operate matches.</div>
        </div>`,
    },
  ],
  anatomy: [
    ["Anchor", "`.rel`", "`position:relative` on the button's wrapper, so the menu positions against it."],
    ["Shell", "`.menu`", "A `--panel` box, 1px `--rule` border, 12px radius, `--shadow`, 250px wide by default, absolutely positioned 42px below and flush with the right edge of its anchor."],
    ["Item", "`.menu-i`", "A full-width, left-aligned button, 13px `--body` text, 8px by 10px padding, 8px radius. Hover sets `--hl` ground and `--fg` text."],
    ["Header", "`.menu-hd`", "A name and a detail line above the items, 10px by 11px top padding, a bottom border."],
    ["Section label", "`.menu-l`", "A 10.5px uppercase `--dim` label above a group of items."],
    ["Empty line", "`.menu-e`", "A 12px `--dim` line where a group has no matches."],
    ["Divider", "`.hr`", "A 1px `--border` rule between groups."],
    ["Dispatch shell", "`.menu.dsp-menu`", "The same shell widened to 360px (capped at `100vw - 32px`) and up to 460px tall, scrolling its list."],
    ["Dispatch item", "`.dsp-i`", "An item row with an icon, an avatar, and a two-line label (`.tx`) in place of plain text."],
    ["Dispatch search", "`.dsp-q`", "A search input inside the menu, `--ink` ground, gold border on focus, that filters the list as you type."],
  ],
  usage: {
    when: [
      "A short, fixed list of choices anchored to the control that opens it: account actions, a send-to list, an @-mention.",
      "A list long enough to want a search field, kept inside the menu itself (`.dsp-menu`).",
    ],
    not: [
      "A page-level choice among a handful of views: use a [segmented control](segmented-control.html) or [tabs](tabs.html).",
      "A task that needs more than picking one item: use a [dialog](dialog.html).",
      "An on-or-off setting: use a [switch](switch.html).",
    ],
    examples: [
      { kind: "avoid", html: `<div class="menu" style="position:relative;top:auto;right:auto;width:220px"><div class="menu-i" style="cursor:pointer">Account</div><div class="menu-i" style="cursor:pointer">Sign out</div></div>`, why: "Items are `div`s with a pointer cursor, not buttons. Nothing here is keyboard operable, and a screen reader has no reason to treat them as choices." },
      { kind: "use", html: `<div class="menu" style="position:relative;top:auto;right:auto;width:220px"><button class="menu-i">Account</button><button class="menu-i">Sign out</button></div>`, why: "Real buttons. Tab reaches each one, Enter and Space activate it." },
    ],
    rules: [
      "One menu open at a time. Opening a second closes the first.",
      "An item is a verb or a destination, never a description of what the menu contains.",
      "A menu with more than about a dozen items gets a search field rather than growing past its max height.",
    ],
  },
  content: [
    "**Items**: a short label, sentence case, no end punctuation: \"Switch theme\", \"Sign out\", \"Account\".",
    "**Header**: a name and one detail line, when the menu is scoped to a person or a task (\"Marcus Bell\", \"marcus@a-intel.example\").",
    "**Section labels**: a plain noun in capitals, set by CSS from a sentence-case string: \"Agents you operate\", \"Workflows\".",
    "**Empty line**: names what was searched and that nothing matched: \"No agent you operate matches.\"",
  ],
  a11y: [
    "The dispatch menu is `role=\"menu\"` with an `aria-label`, and its items are `role=\"menuitem\"`. The account menu and the mention list carry no such roles today. See Findings.",
    "Every item is a real `button`, reachable by Tab and activated by Enter or Space.",
    "A click anywhere outside `.rel` closes the open menu, and Escape closes it from anywhere on the page.",
    "There is no arrow-key roving focus inside a menu. Tab is the only way to move between items today. See Findings.",
  ],
  phone: [
    "The dispatch menu's width caps at `100vw - 32px`, so it never runs off the phone screen.",
    "`.menu-i` grows to a 44px minimum height on phone, so an item stays a full touch target even where its content is one short word.",
  ],
  tokens: [
    ["--panel", "Shell ground"],
    ["--rule", "Shell border"],
    ["--shadow", "Shell shadow"],
    ["--body, --fg", "Item text, at rest and on hover"],
    ["--hl", "Item hover ground"],
    ["--dim", "Section label and empty line"],
    ["--border", "Header and divider rule"],
    ["--ink", "Dispatch search field ground"],
    ["--gold", "Dispatch search field focus border"],
  ],
  helpers: [
    ["userMenu()", "engine.js:1767", "The account menu: header, four settings items, a divider, theme and sign-out."],
    ["dispatchMenu(ids)", "engine.js:15022", "The send-to menu shell: header, search field, and `dspList()`."],
    ["dspList()", "engine.js:15013", "Filters agents you operate and published workflows by the search text and renders both groups."],
    ["mentListHtml()", "engine.js:15561", "The @-mention list while typing a work item prompt, a listbox rather than a menu (see Findings)."],
  ],
  sourceNotes: [
    "A document-level click handler (engine.js 13936) closes the open layer on any click outside `.rel`, shared by the account and dispatch menus.",
    "Escape closes the open layer through the shared key handler (engine.js 13934). The mention list has its own Escape handler (engine.js 15652).",
  ],
  findings: [
    { tag: "open", title: "No arrow-key navigation", body: "Neither `userMenu()` nor `dispatchMenu()` handles `ArrowDown` or `ArrowUp`. Only the command palette (engine.js 9936) supports arrow-key roving focus. The APG menu pattern expects arrow keys to move between items. Here Tab is the only way." },
    { tag: "note", title: "The account menu carries no menu role", body: "`userMenu()`'s shell has no `role=\"menu\"` and its items no `role=\"menuitem\"`, unlike the dispatch menu, which has both. A screen reader announces the dispatch menu as a menu and the account menu as a plain group of buttons." },
    { tag: "note", title: "A second, near-identical idiom for a filtered list", body: "The @-mention list (`mentListHtml()`, engine.js 15640) uses its own classes, `.ment-list` and `.ment-i` (engine.css 2240 to 2244), styled separately from `.menu` and `.menu-i` though the shape, padding, and hover state are the same. Its `role=\"listbox\"` and `role=\"option\"` are the correct pattern for an autocomplete, but the visual duplication could share `.menu-i`'s rules." },
    { tag: "note", title: "Two knob orders under one class", body: "This finding belongs to the switch, not the menu: see [Switch](switch.html#findings)." },
  ],
  audit: {
    checks: [
      "Anchoring. A menu opens directly below and flush with the trailing edge of the control that owns it, inside a `position:relative` wrapper.",
      "Roles. Every menu is `role=\"menu\"` with items `role=\"menuitem\"`, or, for a filtered autocomplete list, `role=\"listbox\"` with `role=\"option\"`. A menu with neither role is a FAIL.",
      "Keyboard. Tab reaches every item. If the build adds arrow-key navigation (the reference does not have it yet), confirm it wraps at both ends and Home and End jump to the first and last item.",
      "Dismiss. Escape and a click outside the menu close it, and focus returns to the control that opened it.",
      "One open at a time. Opening a second menu, or a dialog, closes any menu already open.",
      "Search. A menu with a search field narrows its list as you type and shows a stated empty line when nothing matches, never a blank group.",
      "Items. Every item is a native `button`, not a `div` or `span` with a click handler.",
      "Phone. Menu items are at least 44px tall on a touch pointer, and a wide menu such as the dispatch list never exceeds the viewport width.",
    ],
  },
};
