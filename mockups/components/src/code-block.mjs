// Code block: source, payloads, and commands set in Monaspace Neon, with the readout and code pair
// that frame them. Shape: see tools/build-components.mjs and stat-box.mjs.
export default {
  slug: "code-block",
  name: "Code block",
  group: "Code",
  order: 10,
  summary: "Source, payloads, and commands in Monaspace Neon, with a labelled readout and a side-by-side pair.",
  lead: "A code block shows text a person reads character by character: a tool call's input, a TOML file, a command, a JSON payload. It is set in Monaspace Neon (`--mono`) on the deepest ground. Inline code marks one identifier inside a sentence. A readout labels a slab of what the model read, and a code pair sets two sources side by side.",
  root: "pre, code",
  css: "lines 300 to 304, 359 to 363, 390, 461 to 467, 1539 to 1540",
  usedOn: ["Run frame detail", "Run transcript", "Tools schema dialog", "Fix dialog", "Steering sources", "Organization API keys"],
  stories: [
    {
      id: "block",
      name: "Code block",
      note: "A `pre` with comment, key, and string tokens. `frJson()` writes JSON this way.",
      html: `
        <pre><span class="c">// the tools block of the next model request, verbatim</span>
{
  <span class="k">"name"</span>: <span class="s">"github__create_pull_request"</span>,
  <span class="k">"version"</span>: 3,
  <span class="k">"input"</span>: {
    <span class="k">"repo"</span>: <span class="s">"a-intel/platform"</span>,
    <span class="k">"base"</span>: <span class="s">"main"</span>,
    <span class="k">"head"</span>: <span class="s">"release/4.11.0"</span>
  }
}</pre>`,
    },
    {
      id: "states",
      name: "Value tones",
      note: "`.n` marks a number or a pending value, `.dn` a denied one, and `.bad` a failure.",
      html: `
        <pre><span class="c"># policy v41, the rule that answered</span>
rule        = <span class="s">"merge.requires_approval"</span>
answer      = <span class="dn">"routed"</span>
wait_s      = <span class="n">600</span>
tamper      = <span class="bad">"chain_break at frame 188"</span></pre>`,
    },
    {
      id: "inline",
      name: "Inline code",
      note: "One identifier, path, or command inside a sentence.",
      canvas: "panel",
      html: `
        <p style="margin:0">The control plane answered <code>503 work_index_unavailable</code>. Nothing was changed. Retry after <code>oxagen status</code> reports the index as ready.</p>`,
    },
    {
      id: "readout",
      name: "Readout",
      note: "A labelled slab of what the model or the gateway read, written by `readout()`.",
      html: `
        <div class="readout"><div class="rh">canonical input<span class="sp">exactly what the gateway will dispatch</span></div><pre style="white-space:pre-wrap;word-break:break-word">{
  <span class="k">"amount"</span>: 1284,
  <span class="k">"currency"</span>: <span class="s">"usd"</span>,
  <span class="k">"customer"</span>: <span class="s">"cus_Q2x81"</span>
}</pre></div>`,
    },
    {
      id: "pair",
      name: "Code pair",
      note: "Two labelled sources read across, written by `codePair()`. `.cpair.one` holds a single pane.",
      html: `
        <div class="cpair"><div><div class="lab">What your agent does today<span class="sp">python</span></div><pre>rows = billing.get_line_items(
    days=<span class="n">30</span>)
<span class="c"># 41,200 tokens enter the context</span></pre></div><div><div class="lab">What the fix does<span class="sp">python</span></div><pre>rows = billing.get_line_items(
    days=<span class="n">30</span>, page_size=<span class="n">200</span>)
<span class="c"># one page per call</span></pre></div></div>`,
    },
  ],
  anatomy: [
    ["Block", "`pre`", "Monaspace Neon 12px on a 1.55 line, `--body` on `--void`, a 1px `--border`, a 10px radius, 12px by 14px padding. Scrolls sideways."],
    ["Comment", "`pre .c`", "A comment or an annotation in `--dim`."],
    ["Key", "`pre .k`", "An object key in `--gold` (see Findings)."],
    ["String", "`pre .s`", "A string value in `--st-allowed`."],
    ["Number", "`pre .n`", "A number or a pending value in `--st-approval`."],
    ["Denied value", "`pre .dn`", "A value a rule denied, in `--st-denied`."],
    ["Failure", "`pre .bad`", "A broken value, in `--st-failed`."],
    ["Inline code", "`code`", "0.9em Monaspace Neon on `--hl`, with a 4px radius."],
    ["Readout", "`.readout`, `.rh`, `.rh .sp`, `.rb`", "A `--void` frame with a 10.5px mono capital label on `--hl`. Its `pre` drops its own border."],
    ["Code pair", "`.cpair`, `.lab`, `.lab .sp`", "Two equal columns that never stack in a dialog. Each pane caps at 300px and scrolls."],
  ],
  usage: {
    when: [
      "A payload, a file, or a command a person compares or copies exactly.",
      "What the model or the gateway read, as a readout with its label.",
      "One source against another, as a code pair.",
    ],
    not: [
      "A changed file: use a [diff](diff.html).",
      "A file a person edits: use the [source editor](source-editor.html).",
      "A handful of fields: use a [key-value list](key-value-list.html) with mono values.",
    ],
    examples: [
      { kind: "avoid", html: `<div style="display:grid;gap:8px;width:100%"><pre>before: page_size unset</pre><pre>after: page_size = 200</pre></div>`, why: "Two sources stacked. The reader holds the first in their head to compare it with the second." },
      { kind: "use", html: `<div class="cpair" style="width:100%;margin:0"><div><div class="lab">Before</div><pre>page_size unset</pre></div><div><div class="lab">After</div><pre>page_size = 200</pre></div></div>`, why: "A code pair reads across, one label per pane." },
      { kind: "avoid", html: `<p style="margin:0;color:var(--body)">Run <b>oxagen status</b> and check <b>index_ready</b>.</p>`, why: "Commands and keys in bold body text. They copy with the wrong characters and read as emphasis." },
      { kind: "use", html: `<p style="margin:0;color:var(--body)">Run <code>oxagen status</code> and check <code>index_ready</code>.</p>`, why: "Inline code for every command, key, and path." },
    ],
    rules: [
      "A code block holds text the record holds. Label a generated or redacted block with a readout that says so (\"1 field redacted before write\").",
      "Keep the language's own words inside a block. The product's glossary applies to the prose around it, and `check-copy.mjs` skips `pre` and `code` for that reason.",
      "Wrap long payloads with `white-space:pre-wrap` only when the block is a readout of a record. Source code scrolls sideways so its lines stay whole.",
    ],
  },
  content: [
    "The face is Monaspace Neon (`--mono`) for every block, inline span, and readout label. Its texture healing rides `calt` and its code ligatures ride `liga`. Both are on by default, and nothing may turn them off. [Typography](../typography.html#mono) has the rule.",
    "A comment in a block states one fact in the product's voice (\"one page per call\"). It never argues for a design.",
    "A readout label names the slab in lowercase (\"canonical input\", \"output\"). Its right side states one fact about it.",
    "A code pair's labels are plain nouns or a short phrase in sentence case. The right side names the language or what the pane enforces.",
    "Inline code carries ids, keys, paths, commands, frame kinds, and verdict values. A key shown to a person as a word uses its label instead (\"Observed by gateway\", with `gateway_observed` in a tooltip).",
  ],
  a11y: [
    "A `pre` is read line by line by a screen reader, so every block carries a label before it: a readout header, a code pair label, or a sentence.",
    "Token colors are the third signal. The key, string, and value positions carry the meaning without them.",
    "A block that scrolls sideways is reachable by keyboard: it scrolls with the arrow keys once focused, or it wraps.",
    "Block text is `--body` on `--void`, 16.55:1 in dark and 13.55:1 in light.",
  ],
  phone: [
    "A block keeps its 12px size and scrolls sideways inside its own box. The page never scrolls sideways.",
    "A code pair stacks to one column in the phone dialog layer (`#layer.phone .cpair`).",
  ],
  tokens: [
    ["--mono", "Face for every part"],
    ["--void", "Block and readout ground"],
    ["--border", "Block border"],
    ["--body", "Block text"],
    ["--hl", "Inline code ground and readout header"],
    ["--dim", "Comments, readout label, code pair label"],
    ["--gold", "Object keys (see Findings)"],
    ["--st-allowed, --st-approval, --st-denied, --st-failed", "String, number, denied, and failure tones"],
  ],
  helpers: [
    ["frJson(o, ind)", "engine.js:3416", "Writes a JSON value with `.k` keys and `.s` strings."],
    ["frPre(o)", "engine.js:3425", "Wraps `frJson()` in a wrapping `pre` for the frame detail."],
    ["readout(title, right, inner)", "engine.js:3774", "The labelled slab of what the model read. Two calls, both in frame detail."],
    ["codePair(panes, cls)", "engine.js:1396", "Two labelled panes. Used by the fix dialog and the schema dialog."],
  ],
  sourceNotes: [
    "The engine writes 44 more `pre` blocks and four `code` spans inline as strings.",
    "`.readout pre` drops its border and ground so the frame's border is the only one.",
  ],
  findings: [
    { tag: "open", title: "Gold object keys", body: "`pre .k` colors every JSON key `--gold`, and the source editor's `.tk-k` uses `--accent-text`. A frame with twenty keys puts twenty gold marks on the screen. The brand keeps gold to identity and one action. A neutral key color (`--fg`) would keep the structure readable." },
    { tag: "open", title: "Quiet labels", body: "The readout label and the code pair label are `--dim`. On `--hl` in dark that is 3.08:1, and on `--panel` 3.67:1, both below 4.5:1 for 10.5px text." },
    { tag: "note", title: "Failure red on the deepest ground", body: "`pre .bad` uses `--st-failed`, which is 4.16:1 on `--void` in dark. A broken value is a word a person must read." },
  ],
  audit: {
    checks: [
      "Face. Every `pre`, `code`, readout label, and code pair label computes to Monaspace Neon. A fallback family (ui-monospace, SF Mono, Menlo, Consolas, JetBrains Mono, Geist Mono, Courier) in first position is a FAIL. `font-variant-ligatures:none` on any of them is a FAIL.",
      "Block. 12px on a 1.55 line, `--body` on `--void`, a 1px `--border`, a 10px radius, and 12px by 14px padding. A long line scrolls inside the block, and the page does not scroll sideways.",
      "Inline code. 0.9em Monaspace Neon on `--hl` with 0.12em by 0.38em padding and a 4px radius. Commands, keys, paths, ids, and verdict values in prose use it. Bold or quoted body text in their place is a FAIL.",
      "Tokens. Comments, keys, strings, numbers, denied values, and failures use the six token classes and their tokens. A raw hex color on a token is a FAIL. Report whether keys are gold.",
      "Readout. A labelled frame on `--void` with a 10.5px mono capital label on `--hl` and an optional right-side fact. Its inner `pre` has no border of its own. A redacted payload says how many fields were redacted.",
      "Code pair. Two equal columns that stay side by side in a desktop dialog, each labelled, each capped at 300px with its own scroll. Two sources stacked vertically on desktop is a FAIL.",
      "Content. The text inside a block is what the record holds, byte for byte. A block that paraphrases a payload is a FAIL.",
    ],
  },
};
