// Note: the small print that explains a page, in four weights. See tools/build-components.mjs for
// the shape of this module, and stat-box.mjs for the depth and tone every module matches.
export default {
  slug: "note",
  name: "Note",
  group: "Feedback",
  order: 20,
  summary: "The small print that explains a rule, a caution, or a fact beside its field.",
  lead: "A note is one or two sentences that explain how the page works, set beside the field or the section it describes. Oxagen writes four weights of it: a quiet note for a rule worth knowing, a warn box for a caution, a banner for a fact that spans the width of a panel, and a callout for a fact that deserves more room. None of the four is an error state. That is a [state surface](state-surfaces.html).",
  root: ".note",
  css: "lines 323 to 325, 332 to 334, 761, 769",
  usedOn: ["most pages"],
  stories: [
    {
      id: "note",
      name: "Note",
      note: "A gold left rule and quiet, muted text. The default weight, used about 270 times.",
      html: `
        <div class="note">oxagen never executes steering as an instruction. It enters as evidence at the steering position with operator authority.</div>`,
    },
    {
      id: "deny",
      name: "Denial note",
      note: "`.note.deny` swaps the left rule to `--st-denied`, for a note that explains a refusal.",
      html: `
        <div class="note deny"><b>This is a class switch.</b> It names no provider or agent. It matches each tool version by the class it declares. A tool imported tomorrow that declares the same class is blocked as soon as it enters the registry.</div>`,
    },
    {
      id: "warn",
      name: "Warn",
      note: "A tinted box with a bold lead, for a caution. Used about 46 times, most of them not about a critical event.",
      html: `
        <div class="warn"><b>Compacted.</b> This transcript is read from the archive. Its frames were moved out of the live record, and nothing was recomputed.</div>`,
    },
    {
      id: "banner",
      name: "Banner",
      note: "A full-width fact, with an optional lead in `b` and `.grow` to let a control sit beside it.",
      html: `
        <div class="banner"><span class="b b-approval" style="flex:none"><span class="d"></span>2 awaiting approval</span><span class="grow">Two proposed changes to <span class="mono">.oxagen/steering/</span> are waiting on a reviewer before they compile into any agent's context.</span></div>`,
    },
    {
      id: "callout",
      name: "Callout",
      note: "A gold left rule on a tinted ground, for a fact that deserves more room than a note.",
      html: `
        <div class="callout">An export is a verifiable bundle: archive segments, attestations, key ids, and a verifier script. The segment was written once, at seal time, and holds the same bytes the graph indexed. A customer's auditor checks it offline, without trusting oxagen or the worker's harness.</div>`,
    },
  ],
  anatomy: [
    ["Note", "`.note`", "A 2px `--gold` left rule, 2px by 12px padding (left only), 12.5px `--muted` text."],
    ["Note, deny", "`.note.deny`", "The same box with the left rule in `--st-denied`, for a note that explains a refusal."],
    ["Warn", "`.warn`", "A box border and background tinted from `--st-critical` (45% border, 9% fill), 11px by 14px padding, 10px radius, 12.5px `--body` text. `.warn b` sets the lead in `--st-critical`."],
    ["Banner", "`.banner`", "A `--hl` box with a 1px `--border`, 10px radius, 12px by 15px padding, flex row with an 11px gap. `.banner b` is a bold `--fg` lead line. `.banner .grow` is the flexible fact, at least 24 characters wide."],
    ["Callout", "`.callout`", "A `--hl` box with a 1px `--border` plus a 2px `--gold` left rule, 10px radius, 11px by 13px padding, 12.5px `--body` text at 1.5 line height."],
  ],
  usage: {
    when: [
      "**Note**: a rule worth knowing beside the field or section it governs, such as how steering is applied or what an export contains.",
      "**Warn**: any caution a person should read before acting, whether or not the underlying event is severe.",
      "**Banner**: a fact that spans a panel's width, often paired with a count badge or a control.",
      "**Callout**: a fact substantial enough to want its own paragraph, such as what a governed action actually does.",
    ],
    not: [
      "An error, an empty result, or a denied view: use a [state surface](state-surfaces.html).",
      "The result of an action that already ran: use a [toast](toast.html).",
      "A single field's inline hint: keep it as `.hint` under the field.",
    ],
    examples: [
      { kind: "avoid", html: `<div class="note" style="border-left-color:var(--gold)">Every field on this page autosaves. Changes are versioned and export includes cost, spend and every audit event across the organization for the last ninety days.</div>`, why: "Three facts in one note and a gold rule doing decoration, not marking one action. Split it, and let the panel's own border carry the box." },
      { kind: "use", html: `<div class="note">Every field on this page autosaves. Changes are versioned.</div>`, why: "One idea, stated once, in the quiet weight a rule deserves." },
    ],
    rules: [
      "One fact per note. A second fact is a second note, not a mid-dot list.",
      "A warn box states the caution first, in the bold lead, then the one sentence that explains it.",
      "A callout is prose, not a list. A list of facts belongs in a [key-value list](key-value-list.html) instead.",
    ],
  },
  content: [
    "**Note**: starts mid-thought is fine (\"oxagen never executes...\"), since it reads as a footnote to the field above it.",
    "**Warn lead**: a short bold phrase naming the state (\"Compacted.\", \"Provisional.\"), then the sentence that explains what it means for what the person is looking at.",
    "**Banner**: a badge for the count when there is one, then the fact in a full sentence.",
    "**Callout**: two to four sentences, the same length a lead paragraph would take, no bullet points.",
  ],
  a11y: [
    "None of the four is announced as an alert. A caution that must interrupt reading belongs in a dialog, not a warn box.",
    "Color never carries the caution alone: the warn box's bold lead states the word, and the tint reinforces it.",
    "A note beside a field is in reading order right after the field it explains, so a screen reader hears them together.",
  ],
  phone: [
    "All four keep their padding and font size on phone. None is hidden or truncated.",
    "A banner's `.grow` wraps under a leading badge rather than truncating, since `min-width:24ch` stops it from collapsing to nothing.",
  ],
  tokens: [
    ["--gold", "Note and callout left rule (see Findings)"],
    ["--muted", "Note text"],
    ["--st-denied", "Note, deny variant"],
    ["--st-critical", "Warn border, fill, and lead"],
    ["--body", "Warn and callout text"],
    ["--hl", "Banner and callout ground"],
    ["--border", "Banner and callout border"],
    ["--fg", "Banner lead"],
  ],
  sourceNotes: [
    "`.note` appears about 270 times, `.warn` about 45, `.banner` about 10, and `.callout` 7. `.note.deny` has one caller, the tool class-switch explanation (engine.js 8413).",
  ],
  findings: [
    { tag: "open", title: "Gold beyond identity and one action", body: "`.note` and `.callout` both draw a 2px `--gold` left rule on every instance, about 275 notes and 7 callouts on a typical page load. Gold is identity plus at most one action per screen. A rule on every note spends it as decoration instead. A neutral `--border` or `--rule` would mark the same shape without the cost." },
    { tag: "note", title: "Warn is not only for critical events", body: "`.warn` is styled from `--st-critical` at every one of its roughly 46 sites, but its actual uses range from a compacted-transcript notice to a provisional-workspace caution, most of which are not critical severity. The box's color says \"critical\" for every caution, regardless of how serious the one it wraps actually is." },
  ],
  audit: {
    checks: [
      "Anatomy. Each of the four renders the border, background, padding, and radius this page lists, in both themes.",
      "One fact. A note, warn, banner, or callout with more than one idea, or a mid-dot list of facts, is a FAIL.",
      "Gold. Count `.note` and `.callout` instances on a routed page. Every one with a gold left rule counts toward the page's gold total. More than one gold element total on the screen is a FAIL under the one-action rule.",
      "Warn severity. Sample five warn boxes across the build. If none is actually critical, the component is being used correctly as a general caution. If the copy claims \"critical\" language it does not mean, that is a content FAIL, not a component one.",
      "Placement. A note sits directly after the field or section it explains, in DOM order, not floated elsewhere on the page.",
      "No actions inside. None of the four carries a button or a link that performs a write. A fact that needs an action beside it puts the control next to the note, not inside it, or the action belongs in a [dialog](dialog.html).",
      "Contrast. Warn and callout text meets 4.5:1 against their tinted grounds in both themes.",
    ],
  },
};
