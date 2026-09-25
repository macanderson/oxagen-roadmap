// Chips: small inline blocks that name one thing inside a list. Eight families share the shape,
// each with its own hue rule and its own reason to exist. See tools/build-components.mjs for the
// shape of this module.
export default {
  slug: "chips",
  name: "Chips",
  group: "Data display",
  order: 40,
  summary: "Eight small inline blocks that each name one thing inside a list: a role, a check, a provenance edge, a work item, a label, a DoD tag, a person, or a mention.",
  lead: "A chip is one item inside a list that would be cramped as a table row and lost as plain text: a role an agent holds, a provenance edge behind a claim, a work item pinned to an order, a tracker label. Every family here renders inline, wraps at the row, and truncates its own label before it breaks anything around it. A chip that can be removed carries a real button, never a click handler on the whole block.",
  root: ".rl-chip, .sx-chip, .edge, .chip, .lbl, .tg, .tkp, .mref",
  css: "lines 770 and 924 to 931 (chip and chips), 1234 to 1239 (edge), 1350 to 1357 (role chip), 1604 to 1606 and 1644 to 1648 (self-check chip and its tokens), 2169 (person), 2186 to 2189 (label), 2194 to 2195 (dod tag), 2246 to 2248 (mention)",
  usedOn: ["Agents", "Work", "Run (Decision trace, Transcript)", "Steering"],
  stories: [
    {
      id: "role",
      name: "Role chip",
      note: "Every role an agent holds, each removable, joined by a hidden `, ` so the list reads and copies correctly.",
      html: `
        <div>
          <span class="rl-chip"><span>a-intel.platform.writer</span><button type="button" aria-label="Remove a-intel.platform.writer" title="Remove role">×</button></span><span class="vh">, </span><span class="rl-chip"><span>a-intel.pr.author</span><button type="button" aria-label="Remove a-intel.pr.author" title="Remove role">×</button></span>
          <div><button class="btn sm" style="margin-top:6px">Assign role</button></div>
        </div>`,
    },
    {
      id: "self-check",
      name: "Self-check chip",
      note: "Facts about a skill review, in `--sk-*` hues. The plain, uncolored chip carries a fact with no state at all.",
      html: `
        <div class="row" style="gap:6px;flex-wrap:wrap">
          <span class="sx-chip src">a-intel/platform</span>
          <span class="sx-chip">rule</span>
          <span class="sx-chip">1,204 tok</span>
          <span class="sx-chip ok">cited 41% → 68% of loads</span>
          <span class="sx-chip held">the loop is held</span>
          <span class="sx-chip res">research only</span>
        </div>`,
    },
    {
      id: "provenance",
      name: "Provenance edge",
      note: "What kind of evidence backs a claim, plus the frames that cite it. `button.edge` opens the frame it names.",
      html: `
        <span class="ev"><span class="edge observed">observed</span></span>
        <span class="ev" style="margin-left:10px"><span class="edge stated">stated</span></span>
        <span class="ev" style="margin-left:10px"><span class="edge inferred">inferred · 74%</span><button class="edge" type="button">fr 12</button><button class="edge" type="button">fr 14</button></span>`,
    },
    {
      id: "removable",
      name: "Removable chip",
      note: "A work item pinned to a work order. The inline override below stands in for the dialog's real width.",
      html: `
        <div class="wo-work items" style="max-width:420px">
          <span class="chip"><span class="ipl" title="GitHub"><svg width="12" height="12" viewBox="0 0 24 24" role="img" aria-label="GitHub"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></span><span class="mono">PLAT-1893</span><span>Cut 4.11.0 release notes</span></span>
          <span class="chip"><span class="ipl" title="GitHub"><svg width="12" height="12" viewBox="0 0 24 24" role="img" aria-label="GitHub"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></span><span class="mono">PLAT-1901</span><span>Retry flaky checkout test</span><button type="button" aria-label="Remove PLAT-1901">×</button></span>
        </div>`,
    },
    {
      id: "label",
      name: "Label",
      note: "A tracker label, colored from the tracker's own value, not a token. See Findings.",
      html: `
        <span class="lbls">
          <span class="lbl" style="--lc:#D6455E"><i aria-hidden="true"></i>P0</span>
          <span class="lbl" style="--lc:#C0453C"><i aria-hidden="true"></i>Bug</span>
          <span class="lbl" style="--lc:#9D8BE3"><i aria-hidden="true"></i>Documentation</span>
        </span>`,
    },
    {
      id: "dod-tag",
      name: "DoD tag",
      note: "Which part of the definition of done an item belongs to, one of four fixed words.",
      html: `
        <div class="row" style="gap:6px">
          <span class="tg tg-code">code</span>
          <span class="tg tg-test">test</span>
          <span class="tg tg-docs">docs</span>
          <span class="tg tg-review">review</span>
        </div>`,
    },
    {
      id: "person",
      name: "Person chip",
      note: "A provider account: a mapped workspace member by name, or a raw handle marked not mapped.",
      html: `
        <div class="row" style="gap:16px;flex-wrap:wrap">
          <span class="tkp"><span class="avx person f-sans tn-soft" style="width:20px;height:20px;font-size:8px" aria-hidden="true">PN</span><span>Priya Natarajan</span></span>
          <span class="tkp"><span class="ipl" title="GitHub"><svg width="14" height="14" viewBox="0 0 24 24" role="img" aria-label="GitHub"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></span><span class="mono">rwan-oss</span><span class="vh"> (</span><span class="b b-q" style="font-size:10px" title="Not mapped to a workspace member">not mapped</span><span class="vh">)</span></span>
        </div>`,
    },
    {
      id: "mention",
      name: "Mention chip",
      note: "A record or an agent named in a work-order brief, and a mention nothing could resolve.",
      html: `
        <div class="mrefs">
          <span class="mref"><span class="kg k-rule" title="rule"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h14M13 7l5 5-5 5"/></svg></span><span class="mono">rec_release_gate</span><span class="dim">340 tok</span></span>
          <span class="mref"><span class="hx" style="width:13px;height:13px" title="claude-code"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#D97757" d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg></span><span>a-intel.core.release-manager</span><span class="dim">profile</span></span>
          <span class="mref bad"><span class="mono">@marcus.b</span><span>not found</span></span>
        </div>`,
    },
  ],
  anatomy: [
    ["Role chip", "`.rl-chip`", "The role id in mono and a remove button, in `--hl` on `--border`."],
    ["Self-check chip", "`.sx-chip`, `.sx-chip.src/.held/.ok/.res`", "A short mono fact, plain by default or tinted from a `--sk-*` hue by state class."],
    ["Provenance edge", "`.edge`, `.edge.observed/.stated/.inferred`, `button.edge`", "The kind of evidence behind a claim, and a clickable variant that opens the frame it cites."],
    ["Removable chip", "`.chip`, `.chips`", "A record's short name and a remove button. `.chips` is the bordered, focusable field the chip is meant to sit inside."],
    ["Label", "`.lbl`", "A pill with a colored dot (`.lbl i`) and the tracker's own label name, colored by an inline `--lc`."],
    ["DoD tag", "`.tg`, `.tg-code/-test/-docs/-review`", "A mono word naming which part of the definition of done an item belongs to."],
    ["Person chip", "`.tkp`", "An avatar or a provider logo, a name or a handle, and a hidden aside for an unmapped account."],
    ["Mention chip", "`.mref`, `.mref.bad`", "An icon, a name, and a qualifier for a record or an agent named in text, or a denied-hue chip for a reference nothing could resolve."],
  ],
  usage: {
    when: [
      "A short list of named things beside each other: roles, labels, tags, mentions, provenance edges.",
      "One item a person can remove from a list without leaving the field they are editing.",
    ],
    not: [
      "A record with fields of its own: use a [record card](record-card.html) or a table row.",
      "A single fact with a state that changes: use a [badge](badge.html).",
    ],
    examples: [
      { kind: "avoid", html: `<span class="chip">github__merge_pull_request<span onclick="">×</span></span>`, why: "The remove control is a span with a click handler, not a button. It has no label and cannot be reached by keyboard." },
      { kind: "use", html: `<span class="chip"><span class="mono">github__merge_pull_request</span><button type="button" aria-label="Remove github__merge_pull_request">×</button></span>`, why: "A real button, labeled with what it removes, reachable by keyboard." },
    ],
    rules: [
      "A chip that can be removed is a real `button` with an `aria-label` naming the thing it removes.",
      "A list of chips of the same kind is joined by the hidden separator (`SEP`, a visually hidden `, `), so it reads and copies as a list.",
      "A chip truncates its own label before it wraps or pushes its row wider.",
    ],
  },
  content: [
    "**Role chip word**: the role id verbatim, in mono, with no casing change.",
    "**Self-check chip word**: whatever the record calls it (a source label, a digest, a token count). CSS applies no capitals here, unlike `.tcb` or `.kb`.",
    "**Provenance edge word**: one of exactly three, lowercase: observed, stated, inferred. Inferred may add a confidence percent.",
    "**Removable chip label**: the record's short name or id, ellipsized when the field runs out of room.",
    "**Label name**: whatever the tracker calls it (\"P0\", \"New Feature\"). Its casing is the tracker's own.",
    "**DoD tag word**: one of exactly four, lowercase, mono: code, test, docs, review.",
    "**Person chip**: the workspace member's real name when mapped, or the provider's raw handle when not. Never a guess at a name.",
    "**Mention word**: the record's id or the agent's name, with a token count or \"profile\" as a qualifier.",
  ],
  a11y: [
    "A chip that removes something is a real `button` with an `aria-label` naming what it removes (\"Remove a-intel.pr.author\").",
    "A list of same-kind chips is joined by the hidden separator `SEP`, so a screen reader and a copy-paste both read them as a list, not one run-on word.",
    "An unmapped person chip states \"not mapped\" inside a visually hidden pair of parentheses, so it reads as an aside on the handle rather than a second badge.",
    "`.mref.bad` sets the denied hue as both text and border. Report its contrast on `--hl` in both themes.",
  ],
  phone: [
    "Every chip keeps `white-space:nowrap` on its own text and truncates before the row wraps.",
    "A chip's remove button stays reachable at 390px even where the chip itself shrinks to fit two per row.",
  ],
  tokens: [
    ["--hl, --border, --fg", "Role chip and removable chip ground"],
    ["--dim, --st-failed", "Remove button, and its hover"],
    ["--sk-on, --sk-off, --sk-held, --sk-res", "Self-check chip hues"],
    ["--accent-text", "Self-check chip's `.src` variant"],
    ["--st-proven, --st-approval, --k-rule", "Provenance edge: observed, stated, inferred"],
    ["--lc (inline, per record)", "Label hue. Not a fixed token. See Findings."],
    ["--fk-model, --fk-gov, --k-rule, --fk-op", "DoD tag: code, test, docs, review"],
    ["--muted, --dim", "Person chip's unmapped state"],
    ["--st-denied", "Mention chip's not-found state"],
  ],
  helpers: [
    ["agentRoleChips(a)", "engine.js:10310", "Every role an agent holds, as removable chips joined by `SEP`, with an Assign role button."],
    ["edgeChip(it)", "engine.js:3204", "One provenance edge, plus a `button.edge` per frame it cites."],
    ["lblChip(k)", "engine.js:14859", "One work-item label, colored from the tracker's own value."],
    ["lblChips(ks)", "engine.js:14863", "A `.lbls` row of `lblChip()`."],
    ["tagChip(t)", "engine.js:14890", "One DoD tag."],
    ["tkPerson(id, opts)", "engine.js:14881", "A provider account as a mapped teammate or a raw handle."],
  ],
  sourceNotes: [
    "`.chips` is defined twice (engine.css 770 and 924). The later definition, the input-styled field with a focus ring, wins. `.chip` is only ever used inside the work order dialog's `wo-work items` container, which is neither of those two, so it never gets either definition's border, background, or minimum height.",
    "`.rl-tog`, the toggle beside a role chip in the CSS (engine.css 1354 to 1357), has no emitter in engine.js or wedge.js.",
    "The self-check tokens (`--sk-on`, `--sk-off`, `--sk-held`, `--sk-res`) live in their own `:root` block (engine.css 1604), apart from the token blocks [Colors](../colors.html) documents.",
  ],
  findings: [
    { tag: "open", title: "Label colors do not follow the theme", body: "`lblChip()` reads a hex straight off the record (`LBL_SWATCHES`, engine.js 16012, and `fixtures/tasks.json`). Of the twelve swatches, nine equal a dark-theme token exactly (P0's `#D6455E` is `--st-critical`, Documentation's `#9D8BE3` is `--k-rule`, and so on), and three (`#E0803A`, `#C9A227`, `#3B82F6`) match no token at all. None of the twelve switches for light." },
    { tag: "note", title: "The removable chip never reaches its own field", body: "`.chip` renders inside a plain div today, never inside `.chips`, so the bordered, focus-ringed field this chip was styled for has nothing in it. See Source." },
    { tag: "note", title: "A role's toggle has no emitter", body: "`.rl-tog` sits right beside `.rl-chip` in the CSS, styled as an on or off switch, but nothing in engine.js or wedge.js renders one." },
    { tag: "note", title: "Self-check chips keep the source's casing", body: "`.sx-chip` applies no `text-transform`, so whatever string the record supplies (a digest, a raw kind) reaches the page unchanged. Every other typed chip in this family (`.tg`, `.lbl`) either enforces a fixed vocabulary or is free text by design. `.sx-chip` mixes both, with no rule saying which fields get to be plain text." },
  ],
  audit: {
    checks: [
      "Role chip. The role id in mono plus a labeled remove button, with `SEP` between chips. A role list with no separator, or a remove button with no `aria-label`, is a FAIL.",
      "Self-check chip. Plain text by default, or a `--sk-*` hue by state class (`src`, `held`, `ok`, `res`). A self-check chip colored from a state token (`--st-*`) instead of `--sk-*` is a FAIL.",
      "Provenance edge. One of exactly three words in its own hue (observed, stated, inferred), and a clickable `button.edge` that opens the frame it names with a visible focus ring.",
      "Removable chip. A label and a remove button that only removes. Report whether the chip sits inside `.chips` or a plain container, and cite the difference in border, background, and focus ring.",
      "Label. `--lc` set inline from the record's own color, a colored dot, and the tracker's own name. Report every label's color in both themes; a color that resolves to no token is a known finding, not a new one.",
      "DoD tag. One of exactly four words (code, test, docs, review), each in its own hue, in mono. A fifth word or an inline color is a FAIL.",
      "Person chip. A mapped teammate shows an avatar and a real name. An unmapped account shows the provider's logo, its raw handle, and \"not mapped\" inside a hidden aside. A person chip with no avatar or logo is a FAIL.",
      "Mention chip. A record or an agent mention shows an icon and a name. A not-found mention uses `.mref.bad`'s denied hue. Report its text and border contrast on `--hl` in both themes.",
    ],
  },
};
