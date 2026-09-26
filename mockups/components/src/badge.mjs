// Badge: a short word that names a state or a label, in a small bordered pill.
export default {
  slug: "badge",
  name: "Badge",
  group: "Data display",
  order: 30,
  summary: "A short word in a bordered pill that names a state or a label.",
  lead: "A badge names one state or one label in a word or two: the answer a rule gave, a run's status, a tier, a risk level. A badge with a dot is a state, and a badge without one is a label. The word always carries the meaning, and the color repeats it.",
  root: ".b",
  css: "lines 184 to 193, 59, 2056, link chips 2154 to 2156, live 376 to 378",
  usedOn: ["every page", "Agents", "Run", "Tools", "Work", "Spend", "approvals drawer"],
  stories: [
    {
      id: "states",
      name: "State badges",
      note: "A dot badge is a state. Each tone maps to one meaning.",
      row: true,
      html: `
        <span class="b b-allowed"><span class="d"></span>allowed</span>
        <span class="b b-approval"><span class="d"></span>waiting on Priya</span>
        <span class="b b-denied"><span class="d"></span>denied</span>
        <span class="b b-proven"><span class="d"></span>sealed</span>
        <span class="b b-failed"><span class="d"></span>failed</span>
        <span class="b b-critical"><span class="d"></span>tamper incident</span>`,
    },
    {
      id: "labels",
      name: "Label badges",
      note: "No dot. A neutral `.b-q` label names a kind or a source. A toned label names a level.",
      row: true,
      html: `
        <span class="b b-q">direct</span>
        <span class="b b-q">compacted</span>
        <span class="b b-q">low</span>
        <span class="b b-approval">medium</span>
        <span class="b b-denied">high</span>
        <span class="b b-critical">critical</span>
        <span class="b b-denied">irreversible</span>
        <span class="b b-approval">write</span>`,
    },
    {
      id: "tier",
      name: "Tier badges",
      note: "A tier is lowercase Monaspace Neon. Its title says what the tier governs.",
      row: true,
      html: `
        <span class="b b-tier b-q" title="Recorded only. No hook is installed and nothing is delivered.">observe</span>
        <span class="b b-tier b-approval" title="Hooks installed. Steering is delivered and four hook events can refuse a call.">harness</span>
        <span class="b b-tier b-allowed" title="Model and MCP traffic goes through the gateway. The gateway meters it and enforces budgets on it.">gateway</span>
        <span class="b b-tier b-proven" title="The agent runs in an OS sandbox whose only network exit is the gateway.">contained</span>`,
    },
    {
      id: "live",
      name: "Live run",
      note: "A live run is the one state drawn without a pill: a pulsing dot and the word.",
      row: true,
      html: `
        <span class="live"><span class="p"></span>live</span>
        <span class="b b-approval">parked for approval</span>
        <span class="b b-denied">halted</span>
        <span class="b b-q">sealed</span>`,
    },
    {
      id: "in-table",
      name: "In a table",
      note: "Badges sit in cells next to the facts they qualify. An empty count is a dash.",
      canvas: "panel",
      html: `
        <div class="panel"><div class="tw"><table class="narrow">
          <thead><tr><th>Tool</th><th>Risk</th><th>Effect</th><th>Mandates</th></tr></thead>
          <tbody>
            <tr><td class="tkey">github__merge_pull_request</td><td><span class="b b-denied">high</span></td><td><span class="b b-denied">irreversible</span></td><td><span class="b b-approval"><span class="d"></span>2</span></td></tr>
            <tr><td class="tkey">github__list_commits</td><td><span class="b b-q">low</span></td><td><span class="b b-q">read</span></td><td><span class="dim">—</span></td></tr>
          </tbody>
        </table></div></div>`,
    },
    {
      id: "link",
      name: "Link badge and id",
      note: "`a.b.lk` makes a badge a link, such as a repository. `.id` keeps an identifier's case.",
      row: true,
      html: `
        <a class="b b-q lk" href="#">a-intel/platform</a>
        <span class="b b-q"><span class="id mono">wo_01K6T9QX</span></span>
        <span class="b b-tier b-na" title="not yet available">contained · not yet available</span>`,
    },
  ],
  anatomy: [
    ["Pill", "`.b`", "An inline flex pill: 11px Geist 600 at 0.02em, 2px by 7px padding, a 6px radius, a 1px border, line height 1.5, no wrapping."],
    ["Dot", "`.b .d`", "A 5px circle in the text color. It marks the badge as a state."],
    ["Tone", "`.b-allowed`, `.b-approval`, `.b-denied`, `.b-proven`, `.b-failed`, `.b-critical`", "Text in the state token, a border at 42% of it, and a ground at 11% (12% for critical)."],
    ["Neutral", "`.b-q`", "Text in `--muted` on `--hl` with a `--border` edge."],
    ["Tier", "`.b-tier`", "10.5px Monaspace Neon 500, lowercase. Combined with a tone."],
    ["Not available", "`.b-tier.b-na`", "A dashed border and `--dim` text."],
    ["Identifier", "`.b .id`", "Keeps an id's case inside a badge."],
    ["Link", "`a.b.lk`, `button.b.lk`", "A badge that opens something. The border turns gold on hover."],
    ["Live", "`.live`, `.live .p`", "11px 600 in `--st-allowed` with a 6px dot that pulses every 1.8 seconds."],
  ],
  usageNote: "Word first, shape second, color third.",
  usage: {
    when: [
      "The answer a rule gave: allowed, denied, routed to a person.",
      "A run's or a record's status: live, parked, sealed, halted.",
      "A level or a kind a person filters on: risk, side effect, tier, origin.",
    ],
    not: [
      "A context kind, a frame type, a tool category, a hazard, or a gate: use the [typed badges](typed-badges.html). Each has its own grammar.",
      "A removable value, a label with a color, or a person: use a [chip](chips.html).",
      "A number that matters on its own: put it in a [stat box](stat-box.html) or a table cell.",
    ],
    examples: [
      { kind: "avoid", html: `<span class="b b-allowed"><span class="d"></span></span><span class="b b-failed"><span class="d"></span></span>`, why: "Dots with no word. A reader in grayscale, or with a screen reader, gets nothing." },
      { kind: "use", html: `<span class="b b-allowed"><span class="d"></span>allowed</span><span class="b b-failed"><span class="d"></span>failed</span>`, why: "The word carries the state and the tone repeats it." },
      { kind: "avoid", html: `<span class="b" style="color:var(--gold);border-color:var(--gold)"><span class="d"></span>recommended</span>`, why: "A gold badge. Gold is identity and one action per screen, never a state." },
      { kind: "use", html: `<span class="b b-q">recommended</span>`, why: "A neutral label for anything that is not a state." },
    ],
    rules: [
      "One badge, one meaning. A tone always means the same thing across the product: allowed is healthy or permitted, approval is waiting or in flight, denied is refused or a warning, failed is broken, critical needs a person now.",
      "A dot means state and no dot means label. Kind badges never use a dot and never use a state hue.",
      "A badge sits next to the thing it qualifies, after the name in a row or a header.",
      "A list of badges carries the hidden separator `SEP` between them, so it reads and copies as a list.",
    ],
  },
  content: [
    "**Word**: one to three words, lowercase, in the record's own vocabulary: allowed, denied, waiting on Priya, parked for approval, sealed.",
    "**No punctuation** inside a badge: no mid-dot, no comma. `observed, approved` and `pausing · next boundary` are two facts. See Findings.",
    "**Counts** in a badge are plain numbers. A zero count is a dash in `--dim` outside the badge, not a badge reading 0.",
    "**Title**: a badge whose word is a term (a tier, a risk level) carries a `title` with its definition.",
    "**Keys**: a stored key shows its label (`keyText()`), never the raw key.",
  ],
  a11y: [
    "The word is real text, so a screen reader reads it. The dot is decoration.",
    "A badge that opens something is an `a` or a `button` (`.lk`), never a `span` with a click handler.",
    "Contrast: a badge word is 11px, so it needs 4.5:1 on its tinted ground. Several tones fall short today. See Findings and [Colors](../colors.html#state).",
    "The live dot's pulse stops under `prefers-reduced-motion` through the global rule at engine.css 49.",
  ],
  phone: [
    "Badges keep their size. In a card table they wrap to the next line rather than truncating.",
  ],
  tokens: [
    ["--st-allowed", "Allowed, healthy, live"],
    ["--st-approval", "Waiting on a person, in flight, write"],
    ["--st-denied", "Denied, warning, high risk, irreversible"],
    ["--st-proven", "Sealed, posted, published"],
    ["--st-failed", "Failed, broken"],
    ["--st-critical", "Critical, tamper incident"],
    ["--muted, --hl, --border", "Neutral label"],
    ["--dim", "Not available"],
  ],
  helpers: [
    ["statusBadge(st)", "engine.js:708", "A run's status. `live` returns the pulsing `.live` instead of a pill."],
    ["tierBadge(t)", "engine.js:726", "A tier with its definition as the title. 25 calls."],
    ["riskBadge(r)", "engine.js:736", "low, medium, high, critical."],
    ["effBadge(e)", "engine.js:740", "A side effect: irreversible or write."],
    ["finBadge(f)", "engine.js:744", "A financial class as a critical label, or a dim none."],
    ["originBadge(o)", "engine.js:747", "Where a tool schema came from: observed, or observed and approved."],
    ["stBadge(m)", "engine.js:6863", "A dot badge from a status map. 13 calls."],
    ["tStatusBadge(k)", "engine.js:14704", "A work item's status."],
    ["readyBadge(t)", "engine.js:14718", "A work item's readiness."],
    ["permChips(perms, max)", "engine.js:9904", "Permissions as mono neutral badges with `SEP` between them."],
  ],
  sourceNotes: [
    "About 313 more badges are written inline as `class=\"b b-…\"`.",
  ],
  findings: [
    { tag: "open", title: "Badge words below 4.5:1", body: "On `--panel` in dark, denied is 4.15:1, critical 3.69:1, and failed 3.21:1 on their own tint. In light, allowed is 4.36:1. [Colors](../colors.html#state) computes the live values." },
    { tag: "open", title: "Two facts in one badge", body: "`statusBadge()` writes `pausing · next boundary`, `originBadge()` writes `observed, approved`, and `tierBadge()` appends `· not yet available`. A badge holds one fact." },
    { tag: "open", title: "A symbol in a word", body: "`statusBadge()` writes the paused state as `⏸ paused`. A symbol inside a badge reads aloud as its Unicode name." },
    { tag: "open", title: "Gold on hover", body: "A link badge's border turns gold on hover. Hover is a state, and `--rule` would carry it." },
    { tag: "note", title: "Sealed has two looks", body: "`statusBadge()` and the run list's status map (engine.js 400) draw sealed as a neutral label, while the artifact state map (3150) draws it as `.b-proven`. One state should have one badge." },
  ],
  audit: {
    checks: [
      "Word. Every badge has visible text. A badge that is only a dot or only a color is a FAIL.",
      "Dot means state. Every badge with a dot names a state, and no label or kind badge has a dot.",
      "Tone map. Each tone means one thing across the build: allowed, approval, denied, proven, failed, critical. List every badge whose tone disagrees with its word, such as a failed state in the approval tone.",
      "Look. 11px Geist 600, a 6px radius, 2px by 7px padding, a border at 42% and a ground at 11% of the tone. Tier badges are lowercase 10.5px Monaspace Neon.",
      "Contrast. Measure each tone's word against its blended tint on --panel and --ink in both themes. Under 4.5:1 is a FAIL.",
      "One fact. No badge contains a mid-dot, a comma, or two facts.",
      "Links. A badge that opens something is a link or a button with a name that says where it goes.",
      "No gold. No badge uses gold for its text, border, or ground, at rest or on hover.",
      "Keys. No badge shows a raw stored key.",
    ],
  },
};
