// The index of the component reference: its groups in order, the components that live on one page,
// the rules and findings that span components, and the audit prompt for the whole set.
// tools/build-components.mjs reads it with every <slug>.mjs beside it.
export default {
  summary: "The reusable components inside Oxagen's pages, each with live examples, rules, and an audit prompt.",
  lead: "Every component on this page is drawn by `mockups/src/engine.css`, the same stylesheet the mockup ships, so an example here is the component a build is measured against. Each has its own page with its anatomy, examples in both themes, usage, content, accessibility and phone rules, the tokens it uses, where the mockup defines it, and an audit prompt. The app shell (the sidebar, the top bar, the phone thumb bar) is out of scope.",
  groups: [
    { name: "Page structure", summary: "What a page is built from: its header, its panels, its grid, and the controls that switch its views." },
    { name: "Data display", summary: "Figures, records, and states: the parts that carry what the record says." },
    { name: "Code", summary: "Source, diffs, and the editor, all set in Monaspace Neon." },
    { name: "Actions and input", summary: "Buttons, fields, switches, and menus." },
    { name: "Overlays", summary: "Surfaces that open over the page." },
    { name: "Feedback", summary: "Empty, loading, error, and denied states, and the notes that explain a page." },
  ],
  pageBound: [
    ["Generated summary", "`.sumry`", "Run"],
    ["Column chart", "`.cols`, `.ax`", "Run"],
    ["Instrument tile", "`.inst`", "Run"],
    ["Run timeline", "`.rt`", "Run"],
    ["Decision trace section", "`dtSection()` in `wedge.js`", "Run"],
    ["Transcript", "`.tx-*`", "Run, Transcript tab"],
    ["Finding card", "`.fnd`", "Work, Findings tab"],
  ],
  pageAnatomy: [
    ["Examples", "Live examples of every variant and state, rendered from markup in `<template>` elements. Markup under each one copies with a button."],
    ["Anatomy", "Each part, its selector, and what it holds."],
    ["Usage", "When to use it, when to use something else, and paired examples to use and to avoid."],
    ["Content", "The copy rules that apply to its words and figures. [Prose](prose.html) has the full set."],
    ["Accessibility", "Roles, labels, keyboard, focus, and contrast."],
    ["Phone", "What changes in the phone shell at 390px."],
    ["Tokens", "Every token it reads. [Colors](colors.html) and [Typography](typography.html) define them."],
    ["Source", "The `engine.css` lines and the `engine.js` helpers that render it."],
    ["Findings", "Where the mockup departs from its own rules today."],
    ["Audit prompt", "A prompt to paste into an agent session that audits a build's version, check by check."],
  ],
  storybook: [
    "Each component is one module in `mockups/components/src/`. Its `stories` array holds every example as markup, and `node tools/build-components.mjs` writes the pages from it. `--check` fails when a committed page is stale, and `npm run check` runs it.",
    "`mockups/components/manifest.json` lists every component with each story's markup. A component-level Storybook can read it and render one story per entry inside a decorator that loads `src/engine.css` and `docs-kit/fonts.css`.",
    "Example markup carries every class and ARIA attribute the engine emits, and no `onclick` or `onkeydown`. A story wires its own handlers.",
    "The page-level stories in `mockups/stories/` stay as they are. They frame whole pages of `missioncontrol.html`.",
  ],
  rules: [
    "Use a component that exists before inventing one. A new pattern gets a module here first.",
    "One gold action per screen. Every component's secondary actions are neutral.",
    "Headings follow the page outline: the page h1 in the page header, h2 for a section or a dialog, h3 for a panel or a card, h4 for a group.",
    "A table lives in a panel. The engine's `listify()` adds the search, filters, rows, and pager to every table, so no page writes its own.",
    "An empty value is `—` in `--dim`, with a reason where one fits. A field no source backs reads \"not recorded\".",
    "State is a word first, then a shape, then a color.",
  ],
  a11y: [
    "Every interactive element shows the gold focus ring (`:focus-visible`, 2px, offset 2px).",
    "A row or card that opens something is keyboard operable: `rowClick()` gives it `role=\"button\"`, `tabindex=\"0\"`, a label, and Enter and Space.",
    "An icon-only button has an `aria-label`. A list of chips carries a hidden `, ` between items (`SEP`), so it reads and copies as a list.",
    "In the phone shell, touch targets are at least 44px and inputs are 16px.",
  ],
  findings: [
    { tag: "open", title: "Three segmented control idioms", body: "`.seg` with `aria-pressed` buttons (5 sites), `.btn.sm.sel` groups (7 sites), and `span.chips[role=group]` (Backlog). One idiom would give one keyboard model and one look. See [Segmented control](components/segmented-control.html)." },
    { tag: "open", title: "Label colors do not follow the theme", body: "Work item labels take an inline `--lc` hex from `LBL_SWATCHES` (engine.js 15943) and `fixtures/tasks.json`. Nine are dark-theme token values frozen as hex and three match no token (`#E0803A`, `#C9A227`, `#3B82F6`), so none switch in light." },
    { tag: "open", title: "No destructive token", body: "The brand kit defines `--destructive`, the one red that clears 4.5:1 as text and as a fill in both themes. `engine.css` uses `--st-failed` for danger buttons instead, which is 3.51:1 on `--panel` in dark." },
    { tag: "note", title: "Rules with no emitter", body: "`.srclink`, `.compbar`, `.legend`, `.mtr`, `.rl-tog`, `.fp-bar`, `.def-bar`, `.avat`, `.tid`, `.ctxi`, `.ctxg`, `.stack`, and `.agc .scs` are styled but nothing renders them. `approvalCardSm()` is never called, so the `.apsm*` rules are unused except `.apsm-clk`." },
    { tag: "note", title: "Rules defined twice", body: "`.chips` (763 and 917), `.lst` and `.li` (551 and 589), and `.meter .lab` (321 and 2057) each have two definitions, and the later one wins." },
    { tag: "note", title: "Short part names", body: "`.k`, `.v`, `.s`, `.d`, `.n`, `.t`, and `.sub` mean different parts under `.stat`, `.b`, `.check`, and `pre`. Every page here names a part with its root." },
    { tag: "note", title: "Hard-coded values", body: "`.scrim` and `.apd-scrim` use `rgba(0,0,0,…)`, `.btn.danger.solid` uses `#fff`, and `.iconbtn .cnt` uses `#000`. Each is correct in dark and none follows a token." },
  ],
  auditPrompt: (comps) => `You are auditing every reusable component in the Oxagen build at {{APP_ROOT}}, served at {{APP_URL}}, against the component reference. Be exact and adversarial: the reference is the spec, and close enough is a fail.

## Inputs

1. mockups/components.html in the roadmap repo, then every page it links. Each component page ends with its own audit prompt.
2. mockups/typography.html, mockups/colors.html, and mockups/prose.html, which every component inherits.
3. The build's component library and every route that renders a page.

## Procedure

1. Inventory. For each component below, find the build's shared implementation and every place that draws it by hand. A component with no shared implementation is a FAIL.
${comps.map((c) => `   - ${c.name} (${c.root}): mockups/components/${c.slug}.html`).join("\n")}
2. Run each component's audit prompt in turn and keep its report.
3. Gold. On every routed page, count gold elements that are not the marks, the focus ring, or a focused input. More than one is a FAIL.
4. Headings. Every page has one h1; panels use h3, dialogs h2, groups h4; no heading carries a comma, a mid-dot, or a "not" contrast.
5. Lists. Every table sits in a panel and carries the search, filters, rows, and pager, with an empty result that reads "No rows match."
6. Empty values. Every missing value renders as a dash in --dim with its reason, and no fixture value reaches production.
7. Phone. At 390 by 844, tables become labelled cards, dialogs become bottom sheets, and nothing scrolls sideways.
8. New patterns. List every component in the build that matches nothing in the reference. Each is a note for the reviewer: document it or replace it.

## Output

Return one markdown report:

# Components: audit {{DATE}}
Verdict: PASS or FAIL (n fails, m notes)

| Component | Shared implementation | Hand-drawn copies | Result | Worst fail |
|---|---|---|---|---|

Then each component's report, in the order above, and a final list of fails ranked most severe first.

Rules: never mark PASS on an assumption. Open the file or read the computed style. If the build cannot be started, stop and report that as the single FAIL.`,
};
