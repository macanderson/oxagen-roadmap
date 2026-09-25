// Record card: one context record, statement first. See tools/build-components.mjs for the shape
// of this module. The kind badge and its hues are shared with typed-badges.mjs.
export default {
  slug: "record-card",
  name: "Record card",
  group: "Data display",
  order: 75,
  summary: "One context record: its statement first, its kind second, and its scope, id, and publish facts last.",
  lead: "A record card is one steering record in a list: a rule, a constraint, a procedure, a fact, a memory, or a preference. The statement is the record. Everything else, the kind badge, the scope, the force, is the second thing a reader sees, drawn smaller and never ahead of the sentence itself.",
  root: ".rec",
  css: "lines 208 to 224 (recs, rec, kt, rm, r-top, r-st, r-meta, archived, kf), the shared kind hues at 196 to 207 (see [Typed badges](typed-badges.html))",
  usedOn: ["Steering"],
  stories: [
    {
      id: "kinds",
      name: "All six kinds",
      note: "Statement first, kind badge second. Each record's left rule and icon tile take the kind's own hue.",
      html: `
        <div class="recs">
          <div class="rec k-rule"><div class="kt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h14M13 7l5 5-5 5"/></svg></div><div class="rm">
            <div class="r-top"><span class="kb k-rule" title="A directive that steers behavior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h14M13 7l5 5-5 5"/></svg>rule</span><span class="b b-q" title="steering force">must</span><span class="sp"><span class="b b-allowed"><span class="d"></span>published</span></span></div>
            <p class="r-st">Every pull request into main needs one human review before merge.</p>
            <div class="r-meta"><span><b>workspace: core-platform</b></span><span class="mono">rec_pr_review</span><span class="mono">a1b2c3d</span><span>2026-08-14</span></div>
          </div></div>
          <div class="rec k-constraint"><div class="kt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3.5v5c0 4.6-3.2 8.6-8 9.5-4.8-.9-8-4.9-8-9.5v-5z"/><path d="M9 12h6"/></svg></div><div class="rm">
            <div class="r-top"><span class="kb k-constraint" title="A hard boundary: require or forbid"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3.5v5c0 4.6-3.2 8.6-8 9.5-4.8-.9-8-4.9-8-9.5v-5z"/><path d="M9 12h6"/></svg>constraint</span><span class="b b-denied" title="constraint effect">forbid</span><span class="sp"><span class="b b-allowed"><span class="d"></span>published</span></span></div>
            <p class="r-st">Never delete a repository without an organization owner's approval.</p>
            <div class="r-meta"><span><b>organization: a-intel</b></span><span class="mono">rec_no_repo_delete</span><span>2026-07-02</span></div>
          </div></div>
          <div class="rec k-procedure"><div class="kt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg></div><div class="rm">
            <div class="r-top"><span class="kb k-procedure" title="Steps, in order"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>procedure</span><span class="sp"><span class="b b-allowed"><span class="d"></span>published</span></span></div>
            <p class="r-st">1. Open the failing check. 2. Reproduce it locally. 3. Fix the root cause. 4. Add a regression test. 5. Open a pull request.</p>
            <div class="r-meta"><span><b>workspace: core-platform</b></span><span class="mono">rec_ci_fix_procedure</span><span>2026-06-19</span></div>
          </div></div>
          <div class="rec k-fact"><div class="kt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/></svg></div><div class="rm">
            <div class="r-top"><span class="kb k-fact" title="A checkable claim about the world"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/></svg>fact</span><span class="sp"><span class="b b-allowed"><span class="d"></span>published</span></span></div>
            <p class="r-st">The billing workspace's production database lives in us-east-1.</p>
            <div class="r-meta"><span><b>workspace: finops</b></span><span>delivered at run start</span><span class="mono">rec_billing_region</span><span>2026-05-30</span></div>
          </div></div>
          <div class="rec k-memory"><div class="kt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg></div><div class="rm">
            <div class="r-top"><span class="kb k-memory" title="A durable recollection"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>memory</span><span class="sp"><span class="b b-q">steers nothing yet</span></span></div>
            <p class="r-st">The team prefers pull requests under 400 lines, reviewed the same day.</p>
            <div class="r-meta"><span>from <b>3 runs</b></span><span><b>workspace: core-platform</b></span><span class="mono">rec_small_prs</span></div>
          </div></div>
          <div class="rec k-preference"><div class="kt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg></div><div class="rm">
            <div class="r-top"><span class="kb k-preference" title="Soft and often unfalsifiable"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>preference</span><span class="sp"><button class="btn sm">Open</button></span></div>
            <p class="r-st">Release notes read better in an active voice, not a passive one.</p>
            <div class="r-meta"><span><b>workspace: core-platform</b></span><span class="mono">rec_release_notes_voice</span><span>2026-04-11</span></div>
          </div></div>
        </div>`,
    },
    {
      id: "archived",
      name: "Archived",
      note: "The whole record dims to 60% opacity. The status badge, not the dimming, is what a screen reader gets.",
      html: `
        <div class="recs">
          <div class="rec k-rule archived"><div class="kt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h14M13 7l5 5-5 5"/></svg></div><div class="rm">
            <div class="r-top"><span class="kb k-rule" title="A directive that steers behavior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h14M13 7l5 5-5 5"/></svg>rule</span><span class="sp"><span class="b b-q">archived</span></span></div>
            <p class="r-st">Squash every pull request on merge. Superseded by the merge-queue rule.</p>
            <div class="r-meta"><span><b>workspace: core-platform</b></span><span class="mono">rec_squash_merge</span><span>2026-02-03</span></div>
          </div></div>
        </div>`,
    },
    {
      id: "kind-filter",
      name: "Kind filter row",
      note: "Rebuilt from the CSS contract: each button colored by its own kind. No page pairs `.kf` with per-kind icon coloring today. See Findings.",
      html: `
        <div class="kf" role="group" aria-label="Filter by kind">
          <button type="button" class="btn sm k-rule" aria-pressed="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h14M13 7l5 5-5 5"/></svg>rule</button>
          <button type="button" class="btn sm k-constraint" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3.5v5c0 4.6-3.2 8.6-8 9.5-4.8-.9-8-4.9-8-9.5v-5z"/><path d="M9 12h6"/></svg>constraint</button>
          <button type="button" class="btn sm k-procedure" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>procedure</button>
          <button type="button" class="btn sm k-fact" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/></svg>fact</button>
          <button type="button" class="btn sm k-memory" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>memory</button>
          <button type="button" class="btn sm k-preference" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>preference</button>
          <button type="button" class="btn sm k-item" aria-pressed="false">item</button>
        </div>`,
    },
  ],
  anatomy: [
    ["Record", "`.rec`", "One record: a 3px left rule and a grid of an icon tile beside its body, both in the kind's hue."],
    ["Kind hue", "`.k-rule`, `.k-constraint`, `.k-procedure`, `.k-fact`, `.k-memory`, `.k-preference`, `.k-item`", "Sets `--kc`, shared with [Typed badges](typed-badges.html)'s kind badge and glyph."],
    ["Icon tile", "`.rec .kt`", "A 34px rounded tile in a 14% tint of the kind's hue, holding the kind's icon at 17px."],
    ["Body", "`.rec .rm`", "The top row, the statement, and the meta line."],
    ["Top row", "`.rec .r-top`", "The kind badge plus any force, constraint-effect badge, or token-cost badge, wrapping as needed."],
    ["Status slot", "`.rec .r-top .sp`", "Pushed to the far right: a status badge, a \"steers nothing yet\" note, or an action button, depending on where the card is used."],
    ["Statement", "`.rec .r-st`", "The record's own sentence, 15px, up to 78 characters wide, wrapping anywhere a long word needs it."],
    ["Meta line", "`.rec .r-meta`", "Scope, effect, id, commit, and publish date, each a short fact in `--dim`."],
    ["Archived", "`.rec.archived`", "The whole record at 60% opacity. The status badge, not the opacity, is what states \"archived\"."],
    ["Kind filter row", "`.kf`", "A row of pressable buttons, one per kind, each meant to color its icon by `--kc` and toggle with `aria-pressed`."],
  ],
  usage: {
    when: [
      "A list of steering records of mixed kinds: proposals, a workspace's related records, a compiler preview.",
    ],
    not: [
      "One record's full detail, its lineage, its compiled form: the record's own page holds those in panels beside this card.",
      "A kind with no statement attached: use [Typed badges](typed-badges.html)'s kind badge alone.",
    ],
    examples: [
      { kind: "avoid", html: `<div class="panel pad"><b style="font-size:14px">rule</b><p style="margin:6px 0 0;font-size:12px">Every pull request into main needs one human review before merge.</p></div>`, why: "The kind reads before the statement, and the kind is a bold label instead of the badge that carries its hue and icon." },
      { kind: "use", html: `<div class="rec k-rule" style="border-top:0;padding-top:0"><div class="kt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h14M13 7l5 5-5 5"/></svg></div><div class="rm"><div class="r-top"><span class="kb k-rule" title="A directive that steers behavior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h14M13 7l5 5-5 5"/></svg>rule</span></div><p class="r-st">Every pull request into main needs one human review before merge.</p></div></div>`, why: "The statement leads at 15px. The kind is the badge underneath it, in its own hue and icon." },
    ],
    rules: [
      "The statement is the record. Every other part is smaller and comes after it, never ahead of it in size or position.",
      "A record's left rule and icon tile always match its kind badge's hue, never a state hue.",
      "An archived record keeps every fact, dimmed, rather than being removed from the list it appears in.",
    ],
  },
  content: [
    "**Statement**: the record's own sentence, verbatim, never summarized or truncated.",
    "**Scope**: \"{level}: {name}\" (\"workspace: core-platform\", \"organization: a-intel\").",
    "**Meta facts**: short and unpunctuated, no verb, no sentence: an id, a commit, a date.",
    "**Force and constraint effect**: single words from a fixed vocabulary (\"must\", \"should\", \"forbid\"), never a sentence.",
  ],
  a11y: [
    "The kind badge in the top row carries a `title` with the kind's description, the same fact [Typed badges](typed-badges.html) documents.",
    "The kind filter row's buttons carry `aria-pressed`, so a screen reader states which kinds are active the same way the colored icons do for a sighted reader.",
    "Archived is stated in words, in the status badge. The 60% opacity is a visual reinforcement, not the only signal.",
    "The meta line's facts are `--dim`, which is 3.67:1 on `--panel` in dark and 2.56:1 in light. A scope, an id, and a publish date are words a person reads, not decoration, so this falls under the same rule [Colors](../colors.html) uses to fail `--dim` body text. See Findings.",
  ],
  phone: [
    "Below 640px the icon tile disappears (`.rec .kt{display:none}`) and the record collapses to one column. The kind badge in the top row is what carries the kind at this width.",
    "The status slot (`.r-top .sp`) stops being pushed to the far edge and sits inline after the other top-row badges.",
  ],
  tokens: [
    ["--k-rule, --k-constraint, --k-procedure, --k-fact, --k-memory, --k-preference, --muted", "Kind hue, shared with Typed badges"],
    ["--border", "Row divider between records"],
    ["--fg", "Statement text"],
    ["--dim", "Meta line facts (see Findings)"],
  ],
  helpers: [
    ["recordCard(r, x)", "engine.js:1570", "The one function that draws a context record. `x.right` replaces the status badge and `x.meta` prepends a fact to the meta line. 4 calls."],
  ],
  sourceNotes: [
    "The four call sites are Steering's proposals list (wedge.js:919 and engine.js:5816), the compiler wizard's live preview (engine.js:13201), and a record's own page's related-records panel (engine.js:13511). All four supply their own `x.right`.",
    "`.kf`, styled for a kind filter with icon-colored buttons (engine.css 221 to 223), renders three times in wedge.js today, none of them a kind filter: a brief picker, a proposals-or-pull-requests toggle, and a column picker. None sets a `k-*` class on its buttons, so the icon-coloring rule never fires anywhere live.",
  ],
  findings: [
    { tag: "open", title: "Meta line fails the mockup's own dim rule", body: "`.r-meta` renders scope, id, commit, and date in `--dim` (3.67:1 on `--panel` in dark, 2.56:1 in light). [Colors](../colors.html) reserves `--dim` for placeholders, disabled text, separators, and decoration, and treats every other `--dim` text as a failure. A record's scope and id are facts a person reads to tell records apart, not decoration." },
    { tag: "note", title: "The kind filter has no real per-kind coloring", body: "`.kf .btn svg{color:var(--kc)}` expects a `k-*` class on the button, but every live `.kf` renders plain buttons with no icon and no kind class. The story on this page is rebuilt from the CSS contract, not observed." },
    { tag: "note", title: "Two branches of `recordCard()` never render", body: "The token-cost badge and `compileChip()` (drawn when `x.item` is true) and the \"new · bundle v\" badge (drawn when `r.isNew` is true and `x.right` is null) both depend on conditions none of the four call sites ever create: no caller passes `item:true`, and every caller supplies its own `x.right`." },
  ],
  audit: {
    checks: [
      "Statement first. The statement renders at 15px above the meta line, and the kind badge sits in the top row, never larger than or ahead of the statement. A kind label reading before the statement is a FAIL.",
      "Kind hue. The left rule, the icon tile, and the kind badge all resolve to the same `--k-*` (or `--muted` for item) hue for a given record. A mismatch between them is a FAIL.",
      "Six kinds plus item. Rule, constraint, procedure, fact, memory, and preference each render with their own icon and hue. An item (none of the six) takes the neutral hue with the same shape.",
      "Archived. `.rec.archived` dims the whole card and states \"archived\" in its status badge. Dimming with no status word, or a status word with no dimming, is a FAIL.",
      "Meta line contrast. Report the computed color and ratio of `.r-meta`'s text on `--panel` in both themes. Below 4.5:1 is the known finding above, not a new one, but report it.",
      "Kind filter. If the build renders a kind filter, confirm each button is colored by its own kind and carries `aria-pressed`. If it renders none, this is a known gap, not a new one.",
      "One implementation. Every record card on every sampled route comes from one shared component. List any hand-built copy.",
      "Dead branches. Confirm whether the build's version of `recordCard()` ever sets `item:true` or leaves `isNew` with no `right` override. If neither ever happens, note it as inherited from the mockup rather than a new defect.",
    ],
  },
};
