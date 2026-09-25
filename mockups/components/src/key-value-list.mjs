// Key-value list: a record's own fields, one label and one value per row. See tools/build-components.mjs
// for the shape of this module, and stat-box.mjs as the reference.
export default {
  slug: "key-value-list",
  name: "Key-value list",
  group: "Data display",
  order: 60,
  summary: "One record's fields, a label and a value per row.",
  lead: "A key-value list reads one record top to bottom: an approval's tool version and digest, an agent's principal and credential, a run's frame hash. Each row is a label and a value, never a table of many records. A value can carry a second line of context, and a missing value reads as a dash.",
  root: ".kv",
  css: "lines 307 to 309, 557, 2123",
  usedOn: ["Approvals (approval card)", "Agents (Identity tab)", "Organization (API keys)", "Run (Chain tab, frame detail)", "Spend", "Billing"],
  stories: [
    {
      id: "default",
      name: "Default rows",
      note: "A `dl.kv`, from the approval card's \"The call\" block: `frKv()` writes this shape.",
      html: `
        <dl class="kv">
          <dt>Tool version</dt><dd class="mono">stripe__create_payment@4</dd>
          <dt>Input digest</dt><dd class="mono">sha256:c81f04ea6b2d93a7</dd>
          <dt>Idempotency</dt><dd class="mono">idk_c81f04ea</dd>
        </dl>`,
    },
    {
      id: "sub",
      name: "Second line",
      note: "A value can carry one more fact on a `.sub` line, from the agent Identity tab.",
      html: `
        <dl class="kv">
          <dt>Agent key</dt><dd class="mono">a-intel.core.release-manager</dd>
          <dt>Principal</dt><dd class="mono">prn_01JQ8W3F2M6XKD7A9RZT4BVCNE<span class="sub">minted at registration and never reused, so a retired agent's runs keep their identity</span></dd>
          <dt>Operator</dt><dd>Marcus Bell<span class="sub">accountable for every run · IAM field <span class="mono">initiating_principal</span></span></dd>
        </dl>`,
    },
    {
      id: "mono-list",
      name: "All-mono list",
      note: "`.kv.code` sets every value in Monaspace Neon at 12px, from the account preferences preview.",
      html: `
        <dl class="kv code">
          <dt>date</dt><dd>11 September 2026, 15:47 UTC</dd>
          <dt>number</dt><dd>18,472.36</dd>
          <dt>money</dt><dd>$18,472.36 USD</dd>
          <dt>duration</dt><dd>6 m 11 s</dd>
        </dl>`,
    },
    {
      id: "empty",
      name: "Empty value",
      note: "A record with nothing to show reads a dash in `.dim`, from a frame's control record.",
      html: `
        <dl class="kv">
          <dt>Source</dt><dd>the agent's hooks</dd>
          <dt>Cause</dt><dd><span class="dim">—</span></dd>
          <dt>Billed</dt><dd><span style="color:var(--st-allowed)">no</span></dd>
        </dl>`,
    },
    {
      id: "chain-tab",
      name: "Run chain tab",
      note: "Two panels of `dl.kv`, from the Run page's Chain tab.",
      canvas: "panel",
      html: `
        <div class="grid g2">
          <div class="panel"><div class="panel-h"><h3>Hash chain</h3><span class="b b-allowed" style="margin-left:auto"><span class="d"></span>no gaps</span></div><div class="panel-b">
            <dl class="kv"><dt>Frames</dt><dd class="num">212 · dense seq 0 … 211</dd>
            <dt>Rule</dt><dd class="mono" style="font-size:11.5px">hash = SHA256(prev_hash ‖ canonical(envelope))</dd>
            <dt>Checkpoints</dt><dd>10 · every 20 frames · signed by the host device key, countersigned by oxagen at ingest</dd></dl>
          </div></div>
          <div class="panel"><div class="panel-h"><h3>Seal and attestation</h3><span class="b b-allowed" style="margin-left:auto"><span class="d"></span>sealed</span></div><div class="panel-b">
            <dl class="kv"><dt>Merkle root</dt><dd class="mono" style="word-break:break-all">sha256:b41e07c9a2f5308d6e14bb90c7f2a331</dd>
            <dt>Archive segment</dt><dd class="mono">seg_01K5RS7M2E8FJ3QW.ndjson.zst</dd>
            <dt>Signature</dt><dd class="mono">ed25519 · a-intel</dd></dl>
          </div></div>
        </div>`,
    },
    {
      id: "denied",
      name: "Denied state",
      note: "The denied state writes a bare `div.kv` with no `dl`, from `deniedState()`.",
      canvas: "panel",
      html: `
        <div class="kv" style="margin-top:0;text-align:left;max-width:420px">
          <dt>Signed in as</dt><dd>Marcus Bell · <span class="mono">workspace.member</span></dd>
          <dt>Needed</dt><dd><span class="mono">agent.read on core-platform</span></dd>
          <dt>Decided by</dt><dd><span class="mono">pol_v41</span> · deny wins over every allow</dd>
        </div>`,
    },
  ],
  anatomy: [
    ["List", "`.kv`", "A two-column grid, auto by 1fr, with a 7px by 16px gap, 12.5px, baseline-aligned rows."],
    ["Label", "`.kv dt`", "`--dim` text that does not wrap (see Findings for its contrast)."],
    ["Value", "`.kv dd`", "`--body` text with no default margin, wraps at any character so a long id never overflows the row."],
    ["Second line", "`.kv dd .sub`", "One more fact under the value, in the shared `.sub` style."],
    ["All-mono values", "`.kv.code dd`", "Every value in Monaspace Neon at 11.5px, for a row of formatted figures."],
    ["Empty value", "`.kv dd .dim`", "A dash in `--dim` where a field has no value to show."],
  ],
  usage: {
    when: [
      "One record's fields, read top to bottom: an approval, a credential, a hash chain, a seal.",
      "A field that needs one more sentence of context, on the value's `.sub` line.",
      "A short, fixed set of facts inside a panel body or a dialog body.",
    ],
    not: [
      "Many records of the same shape: use a [table](table.html).",
      "Two or three figures a person checks at a glance: use [stat boxes](stat-box.html).",
      "A record's changing state over time: use a [timeline](timeline.html).",
    ],
    examples: [
      { kind: "avoid", html: `<div style="display:flex;gap:18px;width:100%"><div><b>Tool version</b><div>stripe__create_payment@4</div></div><div><b>Input digest</b><div style="word-break:break-all">sha256:c81f04ea6b2d93a7</div></div></div>`, why: "Hand-built rows with bold labels and no `dt`/`dd` pairing. A screen reader cannot tell a label from its value." },
      { kind: "use", html: `<dl class="kv" style="width:100%;margin:0"><dt>Tool version</dt><dd class="mono">stripe__create_payment@4</dd><dt>Input digest</dt><dd class="mono">sha256:c81f04ea6b2d93a7</dd></dl>`, why: "A real definition list. The label and value pair is explicit in the markup, not just in the layout." },
    ],
    rules: [
      "Every row is a `dt` and a `dd` inside one `dl`. A `div.kv` with no `dl` is a departure from the pattern, not a variant of it (see Findings).",
      "An id, a hash, or a stored key is set in mono, either row by row with `dd.mono` or for the whole list with `.kv.code`.",
      "A missing value is a dash in `.dim`, never a blank cell or the word \"none\" dressed up as a value.",
    ],
  },
  content: [
    "**Label**: a plain noun or a short phrase in sentence case (\"Tool version\", \"Input digest\"). No question mark, no colon: the grid column does that job.",
    "**Value**: the fact itself, formatted for what it is: `usd()` for money, a full id or hash in mono, a sentence for a rule or a purpose.",
    "**Second line**: one sentence of context under the value, starting in lowercase, with no design reasoning.",
    "**Empty value**: `—` in `.dim`. A field nothing recorded reads \"not recorded\" as the value instead, when a bare dash would read as an error.",
  ],
  a11y: [
    "A `.kv` is a real `dl`, so a screen reader can associate each `dt` with the `dd` that follows it.",
    "The denied-state list writes `dt` and `dd` directly inside a `div`, with no `dl` ancestor. That breaks the list semantics the same markup relies on everywhere else. See Findings.",
    "The label is `--dim`, which is 3.67:1 on `--panel` in dark and 2.56:1 in light. A label is a word a person reads to understand the row, so it falls short of 4.5:1. See [Colors](../colors.html#findings).",
  ],
  phone: [
    "The grid keeps its two columns. A long value wraps under its own label rather than the row reflowing to one column.",
    "Inside a dialog sheet the list keeps its padding and font size: nothing shrinks below 12.5px.",
  ],
  tokens: [
    ["--dim", "Label, empty value (see Findings)"],
    ["--body", "Value"],
    ["--mono", "`.kv.code` values and any `dd.mono`"],
  ],
  helpers: [
    ["frKv(rows)", "engine.js:3419", "Writes a `dl.kv` from an array of `[label, value]` pairs, dropping any falsy row. About 15 calls, mostly frame detail."],
    ["kvl(pairs, cls)", "engine.js:9886", "The same shape again: a `dl.kv` from pairs, with an optional extra class. 7 calls, all in the account dialog."],
  ],
  sourceNotes: [
    "87 more sites write `<dl class=\"kv\">` or `<div class=\"kv\">` inline as strings, across the approval card, the agent tabs, Organization, Billing, Steering, and every frame-detail reader that does not go through `frKv()`.",
    "`frKv()` and `kvl()` do the same job in near-identical code: build the same markup from the same shape of input, one for frame detail, one for the account dialog. A build needs only one.",
  ],
  findings: [
    { tag: "open", title: "A key-value block with no list", body: "`deniedState()` (engine.js 872) writes `dt` and `dd` directly inside a `div.kv`, with no `dl`. `dt` and `dd` are only valid inside a `dl`, so a screen reader reads the six rows as six unrelated pieces of text with no label-value pairing." },
    { tag: "open", title: "Label contrast", body: "`.kv dt` is `--dim`, which is 3.67:1 on `--panel` in dark and 2.56:1 in light. A row's label is a word a person reads to use the row, so it belongs on `--muted` (6.91:1 dark, 4.83:1 light), the same finding as the stat box label. See [Colors](../colors.html#findings)." },
    { tag: "note", title: "Two helpers, one shape", body: "`frKv()` and `kvl()` both turn an array of pairs into the same `dl.kv` markup. One shared helper would replace both, and the 87 inline copies besides them." },
  ],
  audit: {
    checks: [
      "Structure. Every key-value list is one `dl` with a `dt` and a `dd` per row, in that order. A `div.kv` with bare `dt`/`dd` and no `dl` ancestor is a FAIL.",
      "Grid. Two columns, auto width for the label and `1fr` for the value, 7px by 16px gap, baseline-aligned, 12.5px text.",
      "Label. `--dim` text, sentence case, no trailing colon or question mark. Report its contrast on the ground it sits on; below 4.5:1 is a FAIL to note, not to block on, since the reference carries the same gap.",
      "Value. `--body` text that wraps at any character, so a full hash or id never pushes the row wider than its column.",
      "Mono values. An id, a hash, a key, or a digest renders in Monaspace Neon, either per row (`dd.mono`) or for the whole list (`.kv.code`). A raw monospace fallback in first position is a FAIL.",
      "Second line. A `.sub` line under a value is one sentence, starting in lowercase, and never a second unrelated fact.",
      "Empty value. A field with nothing to report renders `—` in `--dim`, or the words \"not recorded\" when a bare dash would read as broken. A blank `dd` is a FAIL.",
      "One implementation. List every place the build draws a key-value list by hand instead of through one shared component, with its file and line.",
    ],
  },
};
