// Diff: a line diff of one file, unified in narrow panels and split in the commit dialog.
// Shape: see tools/build-components.mjs and stat-box.mjs.
export default {
  slug: "diff",
  name: "Diff",
  group: "Code",
  order: 20,
  summary: "A line diff of one file, unified for narrow panels and split side by side for review.",
  lead: "A diff shows what a change does to a file, line by line. The unified form stacks removed and added lines under two line-number columns and fits a narrow panel. The split form puts the base on the left and the draft on the right, so a change reads across. Both are set in Monaspace Neon, and a `+` or `−` mark carries each change before the tint does.",
  root: ".diff",
  css: "lines 983 to 1012",
  usedOn: ["Run transcript", "Linked work", "Record save dialog", "Commit dialog", "Agent source"],
  stories: [
    {
      id: "unified",
      name: "Unified",
      note: "`diffHtml(rows, 2)`: two lines of context, and a gap row for the lines it skips.",
      html: `
        <div class="diff"><div class="dl gap"><span></span><span></span><span>⋯</span></div><div class="dl"><span>3</span><span>3</span><span>  model = "claude-sonnet-5"</span></div><div class="dl"><span>4</span><span>4</span><span>  harness = "claude-code"</span></div><div class="dl del"><span>5</span><span></span><span>- budget.per_run_usd = 20</span></div><div class="dl add"><span></span><span>5</span><span>+ budget.per_run_usd = 25</span></div><div class="dl add"><span></span><span>6</span><span>+ budget.mode = "enforced"</span></div><div class="dl"><span>6</span><span>7</span><span>  [toolbelt]</span></div><div class="dl gap"><span></span><span></span><span>⋯</span></div></div>`,
    },
    {
      id: "stat",
      name: "Change count",
      note: "`.dstat` sits in the header above a diff: additions, then deletions with a true minus.",
      canvas: "panel",
      html: `
        <p class="eyebrow q" style="margin:0"><span class="mono" style="text-transform:none;letter-spacing:0">.oxagen/agents/release-manager.toml</span> <span class="dstat"><b class="a">+2</b> <b class="d">−1</b></span></p>`,
    },
    {
      id: "split",
      name: "Split",
      note: "`diffSplitHtml(rows, 2, labels)`: base left, draft right. The missing half of a one-sided change is a hatch.",
      html: `
        <div class="diff two"><div class="dl2 hd"><span class="ln"></span><span class="tx">main</span><span class="ln"></span><span class="tx">your draft</span></div><div class="dl2 same"><span class="ln">3</span><span class="tx">  model = "claude-sonnet-5"</span><span class="ln">3</span><span class="tx">  model = "claude-sonnet-5"</span></div><div class="dl2"><span class="ln del">4</span><span class="tx del">  budget.per_run_usd = 20</span><span class="ln add">4</span><span class="tx add">  budget.per_run_usd = 25</span></div><div class="dl2"><span class="ln e"></span><span class="tx e"></span><span class="ln add">5</span><span class="tx add">  budget.mode = "enforced"</span></div><div class="dl2 same"><span class="ln">5</span><span class="tx">  [toolbelt]</span><span class="ln">6</span><span class="tx">  [toolbelt]</span></div><div class="dl2 gap"><span class="tx">⋯</span></div></div>`,
    },
    {
      id: "empty",
      name: "No change",
      note: "A draft that matches its base shows a sentence in place of an empty diff.",
      canvas: "panel",
      html: `
        <div class="panel"><div class="panel-b dim">Nothing changed yet.</div></div>`,
    },
  ],
  anatomy: [
    ["Frame", "`.diff`", "`--void` ground, a 1px `--border`, a 9px radius, Monaspace Neon 11.5px on a 1.6 line. It scrolls past 280px tall."],
    ["Unified line", "`.dl`", "Three columns: base line number, draft line number, and the text with its `+`, `-`, or space mark."],
    ["Line numbers", "`.dl>span:nth-child(-n+2)`", "34px each, right aligned, `--dim`, not selectable, with a `--border` rule."],
    ["Added line", "`.dl.add`", "A 14% `--st-allowed` tint with `--fg` text."],
    ["Removed line", "`.dl.del`", "A 14% `--st-denied` tint with `--fg` text."],
    ["Gap", "`.dl.gap`", "A centered `⋯` in `--dim` where unchanged lines are skipped."],
    ["Change count", "`.dstat .a`, `.dstat .d`", "Additions in `--st-allowed` and deletions in `--st-denied`, each with its sign."],
    ["Split frame", "`.diff.two`", "The same frame, capped at 320px."],
    ["Split line", "`.dl2`, `.ln`, `.tx`", "Four columns: base number, base text, draft number, draft text. A rule separates the halves."],
    ["Split header", "`.dl2.hd`", "Sticky labels for each side: 10px Geist capitals in `--muted` on `--panel`."],
    ["Hatch", "`.dl2 .e`", "A diagonal hatch for the empty half of a one-sided change."],
  ],
  usage: {
    when: [
      "What a draft changes in a file under `.oxagen/`, before a person commits it.",
      "What a run changed in the repository, in the transcript and the linked work panel.",
      "Review in a wide dialog: the split form.",
    ],
    not: [
      "Two different sources compared for meaning: use a [code pair](code-block.html).",
      "A field-level change to a record: use a [key-value list](key-value-list.html) with before and after.",
      "Editing the file: use the [source editor](source-editor.html).",
    ],
    examples: [
      { kind: "avoid", html: `<div class="diff" style="width:100%"><div class="dl" style="background:color-mix(in srgb,var(--st-denied) 14%,transparent)"><span>5</span><span></span><span>budget.per_run_usd = 20</span></div><div class="dl" style="background:color-mix(in srgb,var(--st-allowed) 14%,transparent)"><span></span><span>5</span><span>budget.per_run_usd = 25</span></div></div>`, why: "Tint only. In grayscale or print the two lines look the same." },
      { kind: "use", html: `<div class="diff" style="width:100%"><div class="dl del"><span>5</span><span></span><span>- budget.per_run_usd = 20</span></div><div class="dl add"><span></span><span>5</span><span>+ budget.per_run_usd = 25</span></div></div>`, why: "The mark and the line number columns carry the change. The tint is the third signal." },
    ],
    rules: [
      "Show two lines of context around each change and a gap row for the rest. Never print a whole unchanged file.",
      "The split form belongs in a dialog wide enough for two 60-character columns. Narrow panels use the unified form.",
      "Label the split header with the branch or the source on each side (\"main\", \"your draft\").",
      "A draft with no change shows \"Nothing changed yet.\" in place of an empty frame.",
    ],
  },
  content: [
    "The face is Monaspace Neon (`--mono`), with `calt` and `liga` on by default. The split header is the one part in Geist.",
    "The change count reads `+2 −1`: a plus for additions and a true minus (−) for deletions, both as numerals.",
    "Header labels are plain nouns in lowercase in the source (\"main\", \"your draft\"). CSS sets the capitals.",
    "A file path above a diff is inline mono and keeps its case inside a capital eyebrow.",
  ],
  a11y: [
    "Each line starts with `+`, `-`, or a space, so a screen reader and a copy both carry the change without the tint.",
    "Line numbers are `user-select:none`, so a copied hunk holds only the text.",
    "The hatch on the empty half is decoration. The empty line number cell says nothing.",
    "Line text is `--fg` on the tint, which clears 4.5:1 in both themes.",
  ],
  phone: [
    "In the phone dialog layer the split form collapses to two columns: the header hides, each side's lines follow each other, a line identical on both sides shows once, and the hatch goes away (engine.css 1008 to 1012).",
    "The frame scrolls sideways inside itself. The page never does.",
  ],
  tokens: [
    ["--mono", "Face"],
    ["--void", "Frame ground"],
    ["--border", "Frame border and column rules"],
    ["--dim", "Line numbers and the gap mark"],
    ["--fg", "Changed line text"],
    ["--st-allowed", "Added tint and the addition count"],
    ["--st-denied", "Removed tint and the deletion count"],
    ["--panel, --muted", "Split header ground and label"],
  ],
  helpers: [
    ["diffLines(a, b)", "engine.js:1349", "An LCS line diff of two strings into rows marked `+`, `-`, or space."],
    ["diffStat(rows)", "engine.js:1358", "Counts additions and deletions for `.dstat`."],
    ["diffHtml(rows, ctx)", "engine.js:1359", "The unified form with `ctx` lines of context. Transcript, linked work, and the record save dialog."],
    ["diffSplitHtml(rows, ctx, labels)", "engine.js:1372", "The split form. The commit dialog."],
  ],
  sourceNotes: [
    "`.dl2.same` marks a row identical on both sides, so the phone layout can drop the duplicate half.",
    "Hosts: `.tx-diffwrap` in the transcript, `.lw-files` in linked work, and `.wz-pr` in the wizards.",
  ],
  findings: [
    { tag: "note", title: "Hyphen for a removed line", body: "`diffHtml()` marks a removed line with an ASCII `-`, while `.dstat` uses a true minus. The mark is inside code, where the hyphen is the diff format's own character, so both are correct for their place." },
    { tag: "note", title: "Line numbers on the deepest ground", body: "Line numbers are `--dim` on `--void`: 4.35:1 in dark and 2.33:1 in light. They are reference marks, so 3:1 applies in dark, and light falls below it." },
  ],
  audit: {
    checks: [
      "Face and size. The frame and every line compute to Monaspace Neon at 11.5px on a 1.6 line. The split header is Geist 10px capitals. Any other face is a FAIL.",
      "Marks. Every changed line carries `+` or `-` as its first character, and every context line a space. A diff that marks changes by tint alone is a FAIL.",
      "Tints. Added lines use a 14% `--st-allowed` tint and removed lines a 14% `--st-denied` tint, with `--fg` text. Any other hue, or gold, is a FAIL.",
      "Line numbers. Two 34px columns in the unified form, right aligned, `--dim`, excluded from selection. Copy a hunk and confirm the clipboard holds no line numbers.",
      "Context. Two lines of context around each change and one gap row for each skipped run. A full unchanged file printed is a FAIL.",
      "Split form. Base on the left and draft on the right on one row per line, a sticky labelled header, and a hatch on the empty half of a one-sided change. A flat fill in place of the hatch is a FAIL, because it reads as a highlight in light.",
      "Change count. `+N −M` with a true minus, additions first, in the allowed and denied tokens.",
      "No change. A draft equal to its base shows \"Nothing changed yet.\" and no empty frame.",
    ],
  },
};
