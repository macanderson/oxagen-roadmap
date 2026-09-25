// Source editor: the three-layer TOML and prose editor, drawn static here.
// The highlighted layer below is what hlToml() (engine.js 1161) emits for this file.
const LINES = [
  '<span class="tk-c"># The release manager. Saving opens a pull request against a-intel/platform.</span>',
  '<span class="tk-t">[agent]</span>',
  '<span class="tk-k">key</span> <span class="tk-p">=</span> <span class="tk-s">"a-intel.core.release-manager"</span>',
  '<span class="tk-k">harness</span> <span class="tk-p">=</span> <span class="tk-s">"claude-code"</span>',
  '<span class="tk-k">operator</span> <span class="tk-p">=</span> <span class="tk-s">"marcus@a-intel.example"</span>',
  '',
  '<span class="tk-t">[budget]</span>',
  '<span class="tk-k">monthly_usd</span> <span class="tk-p">=</span> <span class="tk-n">400</span>',
  '<span class="tk-k">per_run_usd</span> <span class="tk-p">=</span> <span class="tk-n">4.00</span>',
  '<span class="tk-k">enforce</span> <span class="tk-p">=</span> <span class="tk-b">true</span>',
  '',
  '<span class="tk-t">[toolbelt]</span>',
  '<span class="tk-k">name</span> <span class="tk-p">=</span> <span class="tk-s">"release"</span>',
  '<span class="tk-k">deny_tools</span> <span class="tk-p">=</span> <span class="tk-p">[</span><span class="tk-s">"git_push --force"</span><span class="tk-p">]</span>',
  '<span class="tk-k">retries</span> <span class="tk-p">=</span> <span class="tk-e">three</span>',
];
const PLAIN = LINES.map((l) => l.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"')).join("\n");
const GUTTER = LINES.map((_, i) => i + 1).join("\n");

function editor({ path, state, dirty, small, status }) {
  return `
        <div class="panel ed${small ? " ced sm" : ""}">
          <div class="ed-bar"><span class="mono" style="color:var(--fg)">${path}</span><span class="ed-dot"${dirty ? ' data-on="1"' : ""} title="unsaved changes"></span><span class="dim">${state}</span><span class="ed-sp"></span><label class="ed-find"><input placeholder="Find  ⌘F" aria-label="Find in file" value=""><span class="mono dim"></span></label></div>
          <div class="ed-scroll" style="min-height:0;max-height:none">
            <div class="ed-gut" aria-hidden="true">${GUTTER}</div>
            <div class="ed-wrap"><div class="ed-cl" style="top:calc(var(--ed-pad) + var(--ed-lh) * 2)"></div><pre class="ed-mk" aria-hidden="true"></pre><pre class="ed-hl" aria-hidden="true">${LINES.join("\n")}</pre><textarea class="ed-t" readonly spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="${path}">${PLAIN}</textarea></div>
          </div>
          <div class="ed-status">${status}</div>
        </div>`;
}

export default {
  slug: "source-editor",
  name: "Source editor",
  group: "Code",
  order: 30,
  summary: "A file editor with line numbers, syntax color, find, and a status bar, set in Monaspace Neon.",
  lead: "The source editor edits a file that lives in the repository: an agent definition, a Steering source, a skill. Saving opens a pull request, so the editor shows whether the file is modified and never writes on its own. It is a real textarea laid over a painted copy of the same text, and both layers share one font, size, line height, and padding so each glyph sits on its colored twin. The face is Monaspace Neon, with texture healing and ligatures on.",
  root: ".ed",
  css: "lines 949 to 980, ground 2130 to 2132, dialog and prose variants 1898 to 1907, phone 972",
  usedOn: ["agent Source", "Steering source", "skill source", "the agent, tool, skill, and record wizards"],
  stories: [
    {
      id: "toml",
      name: "Agent definition",
      note: "A TOML file with the current line highlighted, an unknown value underlined, and the key hints in the status bar.",
      canvas: "panel",
      html: editor({
        path: ".oxagen/agents/release-manager.toml",
        state: "unchanged",
        dirty: false,
        status: '<span>Ln 3, Col 1</span><span>TOML</span><span>Spaces: 2</span><span>LF</span><span>UTF-8</span><span class="ed-sp"></span><span class="keys dim">⌘S save, Tab indent, ⇧Tab outdent, ⌘/ comment, ⌘F find, ⌘Z undo</span>',
      }),
    },
    {
      id: "dirty",
      name: "Modified in a dialog",
      note: "`.ced.sm` shortens the editor inside a dialog. The dot fills and the state reads modified.",
      canvas: "panel",
      html: editor({
        path: ".oxagen/steering/release-train.toml",
        state: "modified",
        dirty: true,
        small: true,
        status: '<span>Ln 9, Col 20</span><span>TOML</span><span>15 lines</span><span>LF</span><span>UTF-8</span>',
      }),
    },
    {
      id: "tokens",
      name: "Syntax tokens",
      note: "Each class is one token kind. Colors come from theme tokens, so both themes follow.",
      html: `
        <pre style="margin:0"><span class="tk-c"># tk-c comment</span>
<span class="tk-t">[tk-t table]</span>
<span class="tk-k">tk_k_key</span> <span class="tk-p">=</span> <span class="tk-s">"tk-s string"</span>
<span class="tk-k">count</span> <span class="tk-p">=</span> <span class="tk-n">42</span>  <span class="tk-c"># tk-n number</span>
<span class="tk-k">on</span> <span class="tk-p">=</span> <span class="tk-b">true</span>  <span class="tk-c"># tk-b boolean</span>
<span class="tk-k">retries</span> <span class="tk-p">=</span> <span class="tk-e">three</span>  <span class="tk-c"># tk-e error</span></pre>`,
    },
  ],
  anatomy: [
    ["Editor", "`.panel.ed`", "A panel with `--ed-lh:20px` and `--ed-pad:12px`, the line height and padding every layer shares."],
    ["Bar", "`.ed-bar`", "The file path in mono `--fg`, the modified dot, the state word, and find. 12px `--muted` on `--panel-h`."],
    ["Modified dot", "`.ed-dot`, `[data-on]`", "An 8px ring in `--rule`, filled `--st-approval` when the file differs from the saved copy."],
    ["Find", "`.ed-find input`", "A 170px mono input on `--ink`. The count of matches sits beside it."],
    ["Scroll", "`.ed-scroll`", "One grid that scrolls both layers together: gutter, then content. 12.5px Monaspace Neon on a 20px line, tab size 2, on `--panel`."],
    ["Gutter", "`.ed-gut`", "Line numbers in `--dim`, right-aligned, sticky on the left with a `--border` edge."],
    ["Find marks", "`.ed-mk mark`", "The bottom layer: transparent text with gold marks at 28%, the current match at 55% with a gold outline."],
    ["Painted text", "`.ed-hl`", "The middle layer: the same text with token spans, in `--body`."],
    ["Textarea", "`.ed-t`", "The top layer: the real textarea, text transparent, caret in `--fg`. It owns the caret, the selection, and every key."],
    ["Current line", "`.ed-cl`", "A `--hl` band behind the caret's line."],
    ["Status", "`.ed-status`", "Position, language, indent, line ending, encoding, and the key hints. 11px `--muted` on `--panel-h`."],
    ["Dialog size", "`.ced.sm`", "190 to 300px tall instead of up to the viewport less 300px."],
    ["Prose wrap", "`.ced.wrap`", "Markdown and prose wrap at the column, and the gutter measures each wrapped line."],
  ],
  usageNote: "The editor edits a file in the repository. A value in the database is a form field.",
  usage: {
    when: [
      "A file under `.oxagen/`: an agent definition, a Steering source, a skill's bundle, a record.",
      "A draft a wizard writes before it opens a pull request.",
    ],
    not: [
      "Showing code that nobody edits here: use a [code block](code-block.html).",
      "Showing a change: use a [diff](diff.html).",
      "A single setting: use a [form field](form-field.html).",
    ],
    examples: [
      { kind: "avoid", row: false, html: `<div class="field" style="width:100%;margin:0"><textarea rows="3" style="font-family:var(--font)">[budget]\nmonthly_usd = 400</textarea></div>`, why: "A file in a plain textarea set in Geist. Columns drift, there are no line numbers, and nothing says it opens a pull request." },
      { kind: "use", row: false, html: `<pre style="width:100%;margin:0"><span class="tk-t">[budget]</span>\n<span class="tk-k">monthly_usd</span> <span class="tk-p">=</span> <span class="tk-n">400</span></pre>`, why: "Source is set in Monaspace Neon with its tokens colored, in the editor or a code block." },
    ],
    rules: [
      "**Monaspace Neon only.** The textarea and the painted layer both compute to `--mono` at the same size, line height, padding, and letter spacing. Any difference moves the caret off its glyph.",
      "**Ligatures and texture healing on.** `calt` and `liga` are on by default. Never set `font-variant-ligatures:none` on either layer.",
      "**Saving opens a pull request.** The page header's Save opens one, and Discard returns the file to the saved copy. The bar says modified until then.",
      "**Behavior.** `edMount()` wires the textarea, `edPaint()` repaints the highlighted layer and the gutter on every input, and `edKey()` handles Tab, Shift Tab, comment, find, and save.",
      "**Wide lines.** A long line widens the content column and the scroll container scrolls both layers as one. The textarea never scrolls on its own.",
    ],
  },
  content: [
    "**Path**: the repository path in mono, exactly as it is stored: `.oxagen/agents/release-manager.toml`.",
    "**State**: one word, `unchanged` or `modified`.",
    "**Status**: `Ln 3, Col 1`, the language name, `Spaces: 2`, `LF`, `UTF-8`, then the key hints.",
    "**Key hints**: comma-separated, with the platform's modifier symbols: ⌘S save, ⌘F find.",
  ],
  a11y: [
    "The textarea is the one focusable element and carries an `aria-label` equal to the path. The gutter, marks, and painted layer are `aria-hidden`.",
    "Tab inserts two spaces, so Escape then Tab must leave the editor. The status bar's hints should name that way out. See Findings.",
    "The caret is `--fg`, and a selection is `--st-approval` at 32%, which reads in both themes.",
    "Syntax color is decoration. Nothing in the file depends on color to be understood.",
  ],
  phone: [
    "The key hints hide (engine.css 972). The rest of the status bar wraps.",
    "The editor keeps horizontal scrolling for long lines. The page itself does not scroll sideways.",
    "The textarea is 16px in the phone shell, like every input, so the painted layer must match it there.",
  ],
  tokens: [
    ["--mono", "Every layer's face: Monaspace Neon"],
    ["--panel", "Content and gutter ground"],
    ["--panel-h", "Bar and status ground"],
    ["--hl", "Current line"],
    ["--dim", "Line numbers, comments"],
    ["--body", "Plain text"],
    ["--accent-text", "Keys (see Findings)"],
    ["--st-allowed, --st-approval, --st-proven, --k-constraint", "Strings, numbers, tables, booleans"],
    ["--st-failed", "Error underline"],
    ["--gold", "Find marks and the find input's focus"],
  ],
  helpers: [
    ["pAgentSource(r)", "engine.js:1251", "The agent Source page: the header, tabs, and the TOML editor."],
    ["edMount()", "engine.js:1278", "Wires the textarea's events and restores the selection after a render."],
    ["edPaint()", "engine.js:1295", "Repaints the highlighted layer, the gutter, the find marks, and the current line."],
    ["edKey(e)", "engine.js:1326", "Tab and Shift Tab indent, ⌘/ comments, ⌘F finds, ⌘S saves."],
    ["hlToml(src)", "engine.js:1221", "The TOML highlighter: one regex pass that writes token classes."],
    ["cedHtml(key, path, lang, opts)", "engine.js:11588", "The same editor for other languages, sized for a dialog with `small` or wrapped for prose."],
  ],
  sourceNotes: [
    "`CED_LANG` (engine.js 11405) lists the languages the shared editor highlights: TOML, Markdown, JSON, TypeScript, Python, and Go.",
    "In the product app, `apps/app/src/ui/code-editor.tsx` builds the same two-layer editor and sets both layers in `--font-mono`, which is Monaspace Neon.",
  ],
  findings: [
    { tag: "note", title: "Two grounds in the stylesheet", body: "`.ed-scroll` sets `--void` at line 953, and line 2124 overrides it to `--panel` in both themes. The comment at 2123 says the override is intended. The first rule can go." },
    { tag: "open", title: "Gold keys", body: "`.tk-k` colors TOML keys with `--accent-text`, so a definition file shows gold on every line. Gold is identity and one action. A kind hue such as `--k-rule` would separate keys without spending gold." },
    { tag: "note", title: "State hues for syntax", body: "Strings use `--st-allowed`, numbers `--st-approval`, and tables `--st-proven`. A green string reads as allowed to anyone who has learned the badges. Dedicated syntax tokens would keep the two apart." },
    { tag: "open", title: "No way out named", body: "Tab indents inside the editor, and nothing on screen says how to move focus out. Escape then Tab is the common pattern, and the status bar should say so." },
  ],
  audit: {
    checks: [
      "Face. The editor's textarea and its highlighted layer both compute to Monaspace Neon. Any other first family, including a fallback, is a FAIL. Quote getComputedStyle(textarea).fontFamily and the same for the highlighted layer.",
      "Alignment. Both layers share font size, line height, padding, letter spacing, tab size, and white-space. Type a line of 200 characters, then place the caret at its end. The caret must sit after the last glyph. Drift is a FAIL.",
      "Ligatures. Neither layer sets font-variant-ligatures none or drops calt or liga.",
      "Chrome. The bar shows the path, a modified dot, the state word, and find. The status bar shows position, language, indent, line ending, and encoding. Compare each to the reference.",
      "Saving. Editing marks the file modified. Save opens a pull request and does not write the file directly. Discard restores the saved copy.",
      "Keys. Tab and Shift Tab indent, the comment shortcut toggles comments, find highlights every match and counts them, and there is a keyboard way out of the editor.",
      "Highlighting. Comments, tables, keys, strings, numbers, booleans, and errors each get their own token class and color, in both themes.",
      "Dialog and prose. Inside a dialog the editor is shortened, and prose wraps at the column with the gutter matching each wrapped line.",
    ],
  },
};
