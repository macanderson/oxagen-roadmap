// Typed badges: five fixed-vocabulary badges, one per axis. Each names what something IS, never
// what state it is in, and each has its own visual grammar so the five never read as one thing.
// See tools/build-components.mjs for the shape of this module.
export default {
  slug: "typed-badges",
  name: "Typed badges",
  group: "Data display",
  order: 35,
  summary: "Five fixed-vocabulary badges, one per axis: a record's kind, a frame's type, a tool's category, its hazard, and the gate in front of it.",
  lead: "A typed badge names what a thing is inside a closed list: a steering record's kind, a SteeringFrame's type, a tool's category, its hazard, or the gate a rule put in front of it. None of these five ever changes on its own, so none of them is a [badge](badge.html)'s dot and word for a state. Engine rule: an icon badge is a kind, a dot badge is a state, and kind hues never reuse a state hue or gold.",
  root: ".kb, .ft, .tcb, .hz, .gt",
  css: "lines 196 to 207 (kind), 264 to 265 (tool category), 266 to 270 (hazard), 271 to 276 (gate), wedge.js 234 to 236 and 2269 to 2276 (frame type)",
  usedOn: ["Steering", "Run (Decision trace, Transcript)", "Tools", "Agents (mandates)"],
  stories: [
    {
      id: "kind",
      name: "Kind badge",
      note: "The six steering-record kinds, each with its own hue and icon. `kindGlyph()` draws the same icon with no word, for a tight column.",
      html: `
        <div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">
          <span class="kb k-rule" title="A directive that steers behavior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h14M13 7l5 5-5 5"/></svg>rule</span>
          <span class="kb k-constraint" title="A hard boundary: require or forbid"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3.5v5c0 4.6-3.2 8.6-8 9.5-4.8-.9-8-4.9-8-9.5v-5z"/><path d="M9 12h6"/></svg>constraint</span>
          <span class="kb k-procedure" title="Steps, in order"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>procedure</span>
          <span class="kb k-fact" title="A checkable claim about the world"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/></svg>fact</span>
          <span class="kb k-memory" title="A durable recollection"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>memory</span>
          <span class="kb k-preference" title="Soft and often unfalsifiable"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>preference</span>
          <span class="kg k-rule" title="rule"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h14M13 7l5 5-5 5"/></svg></span>
          <span class="kg k-fact" title="fact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/></svg></span>
        </div>`,
    },
    {
      id: "frame-type",
      name: "Frame type",
      note: "Eight SteeringFrame types, lowercase and monospace. Four (`invariant`, `constraint`, `procedure`, `context`) reuse a steering-record hue. The rest have a hue of their own.",
      html: `
        <div class="ft-strip">
          <span class="ft-n"><span class="ft ft-goal" title="The outcome the work serves">goal</span><b>4</b></span>
          <span class="ft-n"><span class="ft ft-invariant" title="Holds for every run in its scope. No narrower source, work order or steer relaxes it">invariant</span><b>2</b></span>
          <span class="ft-n"><span class="ft ft-constraint" title="A requirement or prohibition for this scope">constraint</span><b>6</b></span>
          <span class="ft-n"><span class="ft ft-delegation" title="Authority a person delegated: what, how much and until when">delegation</span><b>1</b></span>
          <span class="ft-n"><span class="ft ft-procedure" title="How to do something">procedure</span><b>9</b></span>
          <span class="ft-n"><span class="ft ft-context" title="A fact the agent needs">context</span><b>12</b></span>
          <span class="ft-n"><span class="ft ft-invocation" title="What the agent was asked to do, and by whom">invocation</span><b>1</b></span>
          <span class="ft-n"><span class="ft ft-capability" title="A callable the agent may use, described. Oxagen never runs it">capability</span><b>3</b></span>
        </div>`,
    },
    {
      id: "tool-category",
      name: "Tool category",
      note: "What the tool acts on, in the house neutral scale. `catBadge()` never colors by category. Only the icon and the word change.",
      html: `
        <div class="row" style="gap:8px;flex-wrap:wrap">
          <span class="tcb t-read" title="Observes and returns. Changes nothing anywhere."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>Read-only</span>
          <span class="tcb t-vcs" title="Changes code history: branches, pull requests, merges, releases, repositories."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></svg>Source control</span>
          <span class="tcb t-finance" title="Moves funds or commits spend. Never callable without a mandate."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>Financial control</span>
        </div>`,
    },
    {
      id: "hazard",
      name: "Hazard",
      note: "A risk mark (circle, diamond, triangle, filled triangle) plus an optional side-effect glyph, both in state hues. Never a category hue.",
      html: `
        <div class="row" style="gap:14px;flex-wrap:wrap">
          <span class="hz hz-low" title="Risk: low"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 12h.01"/></svg><span>Low</span></span>
          <span class="hz hz-medium" title="Risk: medium"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9 9-9 9-9-9z"/><path d="M12 12h.01"/></svg><span>Medium</span></span><span class="hz he-write" title="Side effect: write"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L18 10l-4-4L4 16z"/><path d="M12 8l4 4"/></svg><span>Write</span></span>
          <span class="hz hz-critical" title="Risk: critical"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 20h20L12 3z" fill="currentColor"/><path d="M12 10v4M12 17.5v.5" style="stroke:var(--ink)"/></svg><span>Critical</span></span><span class="hz he-irreversible" title="Side effect: irreversible"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg><span>Irreversible</span></span>
        </div>`,
    },
    {
      id: "gate",
      name: "Gate",
      note: "What a rule decided, as a dot-style badge. A dashed border means a person still stands in the way.",
      html: `
        <div class="row" style="gap:8px;flex-wrap:wrap">
          <span class="gt gt-allow" title="Allowed by policy v14 wherever a grant reaches this version."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Allowed</span>
          <span class="gt gt-require_approval" title="Rule rg_0093 in policy v14: every irreversible call needs approval."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3.5v5c0 4.6-3.2 8.6-8 9.5-4.8-.9-8-4.9-8-9.5v-5z"/><path d="M12 8v4l2.5 1.5"/></svg>Needs approval</span>
          <span class="gt gt-mandate" title="Financial effect: moves funds. A mandate is required, and its own rule decides when a person approves."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3S7.5 5.8 7.5 7.5s2 2.7 4.5 3.3 4.5 1.6 4.5 3.5-2 3.2-4.5 3.2-4.5-1.3-4.5-3"/></svg>Mandate + approval</span>
          <span class="gt gt-deny" title="Denied by policy v14."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/></svg>Blocked</span>
          <span class="gt gt-killed" title="Turned on by Priya Natarajan. Vendor incident, rolling back until the patch ships."><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v9"/><path d="M6.3 6.3a8 8 0 1 0 11.4 0"/></svg>Stopped by kill switch</span>
        </div>`,
    },
  ],
  anatomy: [
    ["Kind badge", "`.kb`", "An SVG icon at 12px and the kind's word, in the record's hue at a 12% fill and a 45% border."],
    ["Kind hue", "`.k-rule`, `.k-constraint`, `.k-procedure`, `.k-fact`, `.k-memory`, `.k-preference`", "Sets `--kc`. Drives the kind badge, the kind glyph, and `.rec`'s left rule and icon tile on [Record card](record-card.html)."],
    ["Kind glyph", "`.kg`", "The same icon with no word, for a table cell or a caption line."],
    ["Frame type badge", "`.ft`", "A lowercase monospace word with a small square mark (`::before`) in `currentColor`, never an icon. The square keeps a type from reading as a state, which draws a round dot."],
    ["Frame type hue", "`.ft-goal`, `.ft-invariant`, `.ft-constraint`, `.ft-delegation`, `.ft-procedure`, `.ft-context`, `.ft-invocation`, `.ft-capability`", "Sets `--fc`. Four share a steering-record hue. The other four take `--fk-model`, `--fk-gov`, `--fk-op`, and `--fk-tool`."],
    ["Frame type strip", "`.ft-strip`, `.ft-n`", "Counts by type, wrapped in a flex row. `typeStrip()` makes each entry a filter button when given a view."],
    ["Tool category badge", "`.tcb`", "An SVG icon at 12px and a two-word label, colored `--body` on `--hl` with a `--rule` border. Never colored by the category."],
    ["Hazard risk mark", "`.hz.hz-low`, `.hz-medium`, `.hz-high`, `.hz-critical`", "A shape (circle, diamond, triangle, filled triangle) plus the risk word, in a state hue."],
    ["Hazard side effect", "`.hz.he-read`, `.he-write`, `.he-irreversible`", "A second glyph and word, appended with a 10px gap after the risk mark."],
    ["Gate badge", "`.gt`", "An SVG icon and a phrase from a fixed table, in a state hue at an 11% fill."],
    ["Gate outcome", "`.gt-allow`, `.gt-require_approval`, `.gt-deny`, `.gt-killed`, `.gt-mandate`", "Sets the hue and, for `require_approval` and `mandate`, a dashed border at a 65% mix instead of 42%."],
  ],
  usage: {
    when: [
      "A fact that names what something IS inside a closed list: a record's kind, a frame's type, a tool's category, its hazard, or the gate in front of it.",
      "A strip of counts by one of these axes, such as a run's frame types or a toolbelt's categories.",
    ],
    not: [
      "A fact that changes as work proceeds: allowed, pending, failed. Use a [badge](badge.html)'s dot and a state hue.",
      "Two axes at once. Category, hazard, and gate sit beside each other as three badges, per the engine's own rule comment, never merged into one.",
    ],
    examples: [
      { kind: "avoid", html: `<span class="b" style="background:orange;color:#000;border-color:orange">high · needs approval</span>`, why: "Hazard and gate folded into one invented badge with a raw color. Neither axis can be scanned or filtered on its own, and the color is not a token." },
      { kind: "use", html: `<span class="hz hz-high" title="Risk: high"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17.5v.5"/></svg><span>High</span></span> <span class="gt gt-require_approval" title="Needs approval"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3.5v5c0 4.6-3.2 8.6-8 9.5-4.8-.9-8-4.9-8-9.5v-5z"/><path d="M12 8v4l2.5 1.5"/></svg>Needs approval</span>`, why: "Two badges, two grammars. A reader scans hazard and outcome independently, and each can be filtered on its own." },
      { kind: "avoid", html: `<span class="kb k-rule" style="color:var(--gold);border-color:var(--gold)">rule</span>`, why: "A kind badge in gold. Kind hues never reuse gold, which is reserved for identity and the one action on a screen." },
    ],
    rules: [
      "Category, hazard, and gate never mix into one mark. Each keeps its own grammar: category a monochrome icon badge, hazard a risk mark plus a side-effect glyph in state hues, gate a dot-style badge.",
      "A dashed border means only one thing across this whole family: a person still stands between the request and dispatch. `gt-require_approval` and `gt-mandate` are the only two variants that use it.",
      "Kind hues and frame-type hues never reuse a state hue and never use gold, so a reader always knows a colored badge in this family is naming a kind, never a status.",
    ],
  },
  content: [
    "**Kind word**: the record's plain noun (\"rule\", \"fact\"), written lowercase in the source. `.kb` sets capitals by CSS.",
    "**Frame type word**: the frame's id (\"goal\", \"invariant\"), always lowercase, in both the source and the rendered badge, set in monospace.",
    "**Tool category word**: a fixed two-word label (\"Read-only\", \"Source control\") from a table of ten. `.tcb` sets capitals by CSS.",
    "**Hazard words**: \"Low\", \"Medium\", \"High\", \"Critical\" for risk and \"Read\", \"Write\", \"Irreversible\" for the side effect, capitalized by a helper in the source string, not by CSS.",
    "**Gate words**: a short phrase from a fixed table (\"Allowed\", \"Needs approval\", \"Blocked\", \"Stopped by kill switch\", \"Mandate + approval\").",
  ],
  a11y: [
    "Every badge in this family carries a `title` naming what its color and shape mean: a kind's description, a frame type's description, a category's blurb, \"Risk: high\", or a gate's reasoning.",
    "Color never carries the fact alone. Every badge pairs its hue with an icon, a glyph, or a word.",
    "`.ft-capability`, `.ft-delegation`, and `.ft-invocation` set their text color from `--fk-tool`, `--fk-gov`, and `--fk-op`, which fall below 3.3:1 on white. See [Colors](../colors.html#kinds) and Findings.",
  ],
  phone: [
    "Every badge in this family sets `white-space:nowrap`, so none of them wraps. A row of badges wraps at the row, not inside a badge.",
    "Icon and text sizes hold at 390px. Nothing in this family shrinks for the phone shell.",
  ],
  tokens: [
    ["--k-rule, --k-constraint, --k-procedure, --k-fact, --k-memory, --k-preference", "Kind hue"],
    ["--muted", "`.k-item`'s hue (see Findings), and the hazard \"low\" and \"read\" states"],
    ["--fk-model, --fk-gov, --fk-op, --fk-tool", "Frame-type hue not shared with a kind"],
    ["--body, --rule, --hl", "Tool category, always neutral"],
    ["--st-approval, --st-denied, --st-critical", "Hazard risk and side effect, and gate outcome"],
    ["--st-allowed", "Gate: allowed"],
    ["--ink", "The critical risk mark's exclamation stroke, for contrast against its own fill"],
  ],
  helpers: [
    ["kindBadge(k)", "engine.js:1558", "Kind badge with icon and word. 4 calls."],
    ["kindGlyph(k)", "engine.js:1559", "Icon-only kind glyph. 2 calls."],
    ["ftBadge(t)", "wedge.js:235", "Frame-type badge, word and CSS mark, no icon. 10 calls."],
    ["typeStrip(list, ctx)", "wedge.js:442", "Counts by frame type as a strip. A `ctx` turns each entry into a filter button."],
    ["catBadge(c)", "engine.js:824", "Tool category badge with icon and word. 5 calls."],
    ["hazard(risk, effect)", "engine.js:847", "Risk mark plus an optional side-effect glyph. 15 calls."],
    ["gate(g, note)", "engine.js:863", "Gate badge, with the reasoning in its title."],
    ["toolGate(t)", "engine.js:875", "Decides which gate a tool sits behind today (a kill switch outranks a mandate outranks approval) and renders it with `gate()`. 5 calls."],
  ],
  sourceNotes: [
    "The six steering-record kinds and their icons live in `KINDS` (engine.js:707). `kindBadge()` falls back to `KINDS.rule` for any kind it does not recognize.",
    "The eight frame types and their descriptions live in `FT` (wedge.js:224 to 233).",
    "The ten tool categories and their icons live in `TCAT` (engine.js:701). `toolMeta()` classifies any tool name the table does not list, by its verb.",
  ],
  findings: [
    { tag: "open", title: "Frame type text fails contrast in light", body: "`.ft` sets its own text color from `--fc`. Three of the eight frame types (`ft-capability`, `ft-delegation`, `ft-invocation`) resolve to `--fk-tool`, `--fk-gov`, and `--fk-op`, which fall below 3.3:1 on white. See [Colors](../colors.html#kinds)." },
    { tag: "note", title: "The seventh kind is unused machinery", body: "`colors.html` hand-writes a `.kb.k-item` swatch for a steering item that is none of the six kinds, but `KINDS` has no `item` entry, so `kindBadge('item')` and `kindGlyph('item')` fall back to `KINDS.rule` and draw a rule icon labeled \"rule\" in the neutral hue. `.kb-src`, the caption meant to sit under that badge, has no emitter either." },
    { tag: "note", title: "Kind and frame-type tints differ by a point", body: "The kind badge's fill is a 12% mix (engine.css 198). The frame-type badge's fill is an 11% mix (engine.css 2278). Both use a 45% border. Two badges on the same grammar should share one recipe." },
    { tag: "note", title: "Frame type carries no icon", body: "Unlike the kind badge, `.ft` has no SVG. Its mark is a CSS `::before` square dot in `currentColor`, by design, so a frame-type badge is a word plus a mark, never an icon." },
  ],
  audit: {
    checks: [
      "Kind badge. A real SVG icon at 12px, the record's hue as text and a 45% border with a 12% fill, and a word set to capitals by CSS from a lowercase source string. Six kinds resolve to six distinct hues. A kind badge with no icon, or colored by a state or gold, is a FAIL.",
      "Frame type. A lowercase monospace word, a `::before` square mark in `currentColor`, and a border and fill in its `--fc` hue. Any state hue or gold on a frame type is a FAIL.",
      "Tool category. An SVG icon at 12px and a two-word label in capitals, colored `--body` on `--hl` with a `--rule` border, never colored by the category. A category badge tinted by its category is a FAIL.",
      "Hazard. A risk shape (circle low, diamond medium, triangle high, filled triangle critical) in the matching state hue, followed by an optional side-effect glyph in `--muted`, `--st-approval`, or `--st-denied`, with a 10px gap between two `.hz` marks. A hazard shown by color with no shape or word is a FAIL.",
      "Gate. An icon and a word from the fixed gate vocabulary, in the matching state hue at an 11% fill. `require_approval` and `mandate` take a dashed 65% border; a solid border on either is a FAIL.",
      "No mixed grammar. No element combines two of these five families into one mark, and no page invents a sixth ad hoc badge for a kind, a type, a category, a hazard, or a gate. List any that do.",
      "Titles. Every badge in this family carries a `title` stating what a sighted reader gets from its color and shape, so the same fact reaches a screen reader.",
      "Contrast. Report the computed text color and ratio of every frame-type badge in the light theme. `ft-capability`, `ft-delegation`, and `ft-invocation` below 3.3:1 is a known finding, not a new one; anything else below 3:1 is a FAIL.",
    ],
  },
};
