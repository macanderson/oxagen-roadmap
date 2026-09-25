// Tool cell: the one component every tool name goes through, its category icon, its label, and its
// API name. See tools/build-components.mjs for the shape of this module, and stat-box.mjs as the
// reference.
export default {
  slug: "tool-cell",
  name: "Tool cell",
  group: "Data display",
  order: 65,
  summary: "A tool's category icon, its plain-language label, and its API name, in one cell.",
  lead: "A tool cell is how a tool call reads anywhere in the product: on the Tools page, in a toolbelt, in an approval, in the command menu. It leads with the label a person understands (\"Merge pull request\") and keeps the literal API name (`github__merge_pull_request@3`) second, in mono, so the two never have to be reconciled by eye. A category icon and color mark what kind of thing the tool does before either name is read.",
  root: ".tc",
  css: "lines 253 to 263, 297",
  usedOn: ["Tools", "Agent (Toolbelt tab)", "Approvals", "Tool dialogs", "Command menu", "Registration and connection wizards"],
  stories: [
    {
      id: "default",
      name: "Default",
      note: "Label first, API name second, from a Toolbelt row.",
      html: `
        <span class="tc t-vcs" title="github__merge_pull_request@3: Merge pull request · Source control">
          <span class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></svg></span>
          <span class="tl">Merge pull request</span><span class="ta">github__merge_pull_request<span class="v">@3</span></span>
        </span>`,
    },
    {
      id: "sub",
      name: "With a sub-fact",
      note: "`{sub}` appends one more fact after the API name, from the approve dialog.",
      html: `
        <span class="tc t-finance" title="stripe__create_payment@4: Create payment · Financial control">
          <span class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg></span>
          <span class="tl">Create payment</span><span class="ta">stripe__create_payment<span class="v">@4</span> · provider Stripe</span>
        </span>`,
    },
    {
      id: "sizes",
      name: "Sizes",
      note: "`.sm` for a table row, the plain size for a list, `.lg` for a dialog's own subject line.",
      html: `
        <div class="row" style="gap:20px;align-items:center;flex-wrap:wrap">
          <span class="tc sm t-read" title="github__get_file_contents@2: Get file contents · Read-only">
            <span class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg></span>
            <span class="tl">Get file contents</span><span class="ta">github__get_file_contents<span class="v">@2</span></span>
          </span>
          <span class="tc t-vcs" title="github__create_pull_request@3: Create pull request · Source control">
            <span class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></svg></span>
            <span class="tl">Create pull request</span><span class="ta">github__create_pull_request<span class="v">@3</span></span>
          </span>
          <span class="tc lg t-finance" title="stripe__create_payment@4: Create payment · Financial control">
            <span class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg></span>
            <span class="tl">Create payment</span><span class="ta">stripe__create_payment<span class="v">@4</span></span>
          </span>
        </div>`,
    },
    {
      id: "api-mode",
      name: "API-name mode",
      note: "`.api`, from `S.toolNames===\"api\"`, swaps the order: the API name leads in mono, the label follows.",
      html: `
        <span class="tc api t-vcs" title="github__merge_pull_request@3: Merge pull request · Source control">
          <span class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></svg></span>
          <span class="tl">github__merge_pull_request<span class="v">@3</span></span><span class="ta">Merge pull request</span>
        </span>`,
    },
  ],
  anatomy: [
    ["Cell", "`.tc`", "An inline grid, icon column then two stacked text rows, 10px column gap, left-aligned, clipped to its width."],
    ["Icon tile", "`.tc .ti`", "A 28px `--hl` tile, 8px radius, 1px `--border`, holding a 15px category icon in `--fg`."],
    ["Label", "`.tc .tl`", "13px Geist 600, `--fg`, one line, ellipsis when it runs out of room."],
    ["API name", "`.tc .ta`", "11px Monaspace Neon, `--muted`, one line, ellipsis when it runs out of room."],
    ["Version", "`.tc .ta .v`", "The `@N` suffix of the API name, in `--dim`."],
    ["Small size", "`.tc.sm`", "22px icon tile, 12.5px label, 10.5px API name, for a table row."],
    ["Large size", "`.tc.lg`", "42px icon tile, 18px label, 12px API name, for a dialog's own subject line."],
    ["API-name mode", "`.tc.api`", "Swaps the two rows: the API name leads in mono, the label follows in the font face."],
    ["Category tint", "`.tc.t-*`", "Each of the ten call categories sets the icon tile's tone via `TCAT`, such as `.t-vcs` for source control."],
  ],
  usage: {
    when: [
      "Any place a tool call or a tool definition is named: a table row, a toolbelt, an approval, a dialog title, the command menu.",
      "A place that needs the category (read-only, financial, source control, and so on) visible before either name is read.",
    ],
    not: [
      "A tool's full input or output: use a [code block](code-block.html) or a readout.",
      "A hazard or a decision on a call: pair the tool cell with a risk badge, never fold the risk into the cell itself.",
    ],
    examples: [
      { kind: "avoid", html: `<span style="font-family:var(--mono);font-size:12px">github__merge_pull_request@3</span>`, why: "The literal API name with no label, no category icon, and no version styling. A person has to already know what the call does." },
      { kind: "use", html: `<span class="tc t-vcs" title="github__merge_pull_request@3: Merge pull request"><span class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></svg></span><span class="tl">Merge pull request</span><span class="ta">github__merge_pull_request<span class="v">@3</span></span></span>`, why: "The label leads, the API name and version stay available in mono, and the category icon marks it as source control before either name is read." },
    ],
    rules: [
      "The label leads and the API name follows, everywhere, except in API-name mode, which every reader on the page shares via `S.toolNames`. A page never mixes the two orders.",
      "The category tint always matches the tool's actual category from `TCAT`. A generic or default tint on an unrecognized tool is still a real category (`record`), never a blank tile.",
      "A tool cell never carries its own risk or decision. Those sit beside it as a separate [badge](badge.html).",
    ],
  },
  content: [
    "**Label**: a plain, verb-first phrase in sentence case (\"Merge pull request\", \"Create payment\"), never the raw function name reformatted.",
    "**API name**: the literal tool id exactly as called, with its harness or MCP prefix kept when the tool is not harness-native.",
    "**Version**: the `@N` suffix, always attached to the API name, never dropped even when the label is unambiguous.",
    "**Sub-fact**: one short fact appended after the API name, such as the provider it is called through, never a second sentence.",
  ],
  a11y: [
    "The whole cell carries a `title` with the API name, version, label, and category, so someone with a pointer gets the full identity on hover.",
    "Label and API name are two separate text nodes in DOM order, so a screen reader reads the plain-language name first and the literal id second.",
    "Category is carried by an icon plus a named class, never by tile color alone: the `title` also states the category in words.",
  ],
  phone: [
    "The label and API name switch from a single truncated line to normal wrapping (`white-space:normal`) inside the phone shell, so neither name is cut off.",
    "Inside a table, a tool cell drops its 220px minimum width on a phone, since the table itself becomes labelled cards.",
  ],
  tokens: [
    ["--hl", "Icon tile ground"],
    ["--border", "Icon tile border"],
    ["--fg", "Icon glyph, label"],
    ["--muted", "API name"],
    ["--dim", "Version suffix"],
    ["--mono", "API name and version"],
  ],
  helpers: [
    ["toolCell(id, o)", "engine.js:767", "The one component every tool display goes through. `o.sz` picks a size, `o.sub` appends a fact, `S.toolNames===\"api\"` swaps label and API name. 16 calls."],
    ["toolMeta(id)", "engine.js:749", "Resolves a tool id to its label and category, from `TOOLMETA` or a verb-based guess for an id the table does not name."],
    ["catSvg(c)", "engine.js:764", "The category's icon, from the shared `TCAT` map."],
  ],
  sourceNotes: [
    "`TCAT` (engine.js 701 to 723) defines the ten categories a call can belong to: read-only, data query, record write, messaging, file mutation, code execution, source control, infrastructure, access, and financial control, each with its own icon and one-sentence description.",
    "A tool id `toolMeta()` does not recognize still gets a category, guessed from its verb (get, post, deploy, and so on), so no tool cell ever renders with an empty or default tile.",
  ],
  findings: [
    { tag: "note", title: "Order is a shared setting, not a per-cell choice", body: "API-name mode is the single flag `S.toolNames`, read fresh by every `toolCell()` call at render. A build that lets one screen show the API name first and another show the label first, without one shared setting driving both, would break the rule that a page never mixes the two orders." },
  ],
  audit: {
    checks: [
      "Anatomy. Every tool cell renders a category icon tile, a label, and an API name with its version, in that DOM order regardless of which line displays first.",
      "Order. The label leads and the API name follows by default. API-name mode reverses both lines together, driven by one shared setting. A cell that mixes the two orders on the same screen is a FAIL.",
      "Category. The icon tile's tint and glyph match the tool's real category. An unrecognized tool id still resolves to a category by its verb, never a blank or ungrouped tile.",
      "Sizes. `.sm` and `.lg` scale the icon tile, label, and API name together. Report any size where only one part scales.",
      "Truncation. The label and API name each ellipsis on overflow at their fixed sizes, and switch to wrapping in the phone shell so nothing is cut off with no way to read it.",
      "Version. The `@N` suffix is always attached to the API name in `--dim`, never dropped or merged into the name itself.",
      "Accessibility. The cell's `title` states the API name, version, label, and category together, so someone with a pointer gets the full identity without opening anything.",
      "One implementation. List every place the build renders a tool's name and icon by hand instead of through one shared component, with its file and line.",
    ],
  },
};
