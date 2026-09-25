// Switch: an on-or-off setting, in three variants. See tools/build-components.mjs for the shape of
// this module, and stat-box.mjs for the depth and tone every module matches.
export default {
  slug: "switch",
  name: "Switch",
  group: "Actions and input",
  order: 30,
  summary: "An on-or-off setting, with the state named in words beside it.",
  lead: "A switch flips one setting on or off: a kill switch, whether a commit opens a pull request, whether skills are on for a workspace. The knob's position and color repeat the state the label already names in words. A kill switch turning on stops real calls, so it never flips on one click: it opens a dialog that states the blast radius and asks for a reason before it takes effect.",
  root: ".ks-sw",
  css: "lines 736 to 745, commit dialog 1020 to 1024, Skills 1627 to 1630",
  usedOn: ["Tools (Kill switches tab)", "Agents (definition editor, commit dialog)", "Steering (fleet steer, Library Skills)"],
  stories: [
    {
      id: "kill",
      name: "Kill switch",
      note: "Off is neutral. On turns `--st-denied`, the same tone as a denial, because turning it on means calls are blocked.",
      row: true,
      html: `
        <button type="button" class="ks-sw" role="switch" aria-checked="false" aria-label="Flip the switch on payment-gateway"><i></i><span class="lbl">Off (calls allowed)</span></button>
        <button type="button" class="ks-sw on" role="switch" aria-checked="true" aria-label="Clear the switch on payment-gateway"><i></i><span class="lbl">On (calls blocked)</span></button>`,
    },
    {
      id: "int",
      name: "Immediate toggle",
      note: "`.ks-sw.int` turns `--st-approval` blue when on: an immediate, reversible setting, not a governed block. Used for the commit dialog's pull request toggle and the fleet steer's Interrupt delivery mode.",
      row: true,
      html: `
        <button type="button" class="ks-sw int" role="switch" aria-checked="false" aria-label="Open a pull request"><i></i><span class="lbl">PR</span></button>
        <button type="button" class="ks-sw int on" role="switch" aria-checked="true" aria-label="Open a pull request"><i></i><span class="lbl">PR</span></button>`,
    },
    {
      id: "commit",
      name: "In the commit dialog",
      note: "`.cm-sw` hides the switch's own label and prints the state as a badge and a sentence beside it instead.",
      canvas: "panel",
      html: `
        <div class="cm-sw">
          <button type="button" class="ks-sw int on" role="switch" aria-checked="true" aria-label="Open a pull request"><i></i><span class="lbl">PR</span></button>
          <div class="tx"><b>Opens the pull request for <span class="mono">feature/rotate-key</span></b>The commit is already on the branch. This asks the code owners of <span class="mono">.oxagen/agents/</span> to review it against main.</div>
        </div>`,
    },
    {
      id: "skills",
      name: "Skills preview",
      note: "`.sx-sw` in the Skills dialog always reads on: it previews the file's outcome, not a live setting. Clicking it explains that the pull request is the real control.",
      html: `
        <div class="sx-ga" style="display:flex;align-items:center;gap:10px">
          <div class="grow"><div class="n">skills.enabled</div><div class="d">false &rarr; true in <span class="mono">.oxagen/skills/config.toml</span></div></div>
          <button type="button" class="sx-sw" role="switch" aria-checked="true" aria-label="Enabled"><i></i></button>
        </div>`,
    },
    {
      id: "confirm",
      name: "The governed confirm",
      note: "Flipping a kill switch on opens this dialog instead of flipping on click. `.ks-banner` states the blast radius before the reason field.",
      canvas: "panel",
      html: `
        <div class="dlg" role="dialog" aria-modal="true" aria-label="Flip the switch on payment-gateway">
          <div class="dlg-h"><h2>Flip the switch on payment-gateway</h2><button class="iconbtn x" aria-label="Close">&times;</button></div>
          <div class="dlg-b">
            <p class="muted" style="margin:0 0 14px;font-size:12.5px">Provider &middot; every agent calling this provider</p>
            <div class="ks-banner crit"><span class="b b-critical" style="flex:none"><span class="d"></span>blast radius</span>
              <div class="g"><b>Every write call to Stripe</b>Every affected call is blocked from the next tool call. Runs in flight keep running. Their next call that changes anything is blocked, and the record names this switch and your reason.</div>
            </div>
            <div class="field"><label for="killwhy">Reason (recorded on every blocked call and read by the model)</label><textarea id="killwhy" rows="2">Suspected compromise of the Stripe restricted key. Hold every money movement until the rotation is confirmed.</textarea></div>
          </div>
          <div class="dlg-f"><span class="grow">You can clear this switch at any time. Nothing is destroyed.</span><button class="btn">Cancel</button><button class="btn danger">Block calls now</button></div>
        </div>`,
    },
  ],
  anatomy: [
    ["Kill switch", "`.ks-sw`", "An inline flex button with no border of its own, a 9px gap between its knob and label, pushed to the end of its row with `margin-left:auto`."],
    ["Knob", "`.ks-sw i`", "A 34 by 19px pill, `--hl` ground, 1px `--rule` border, with a 13px circular `--muted` dot inset 2px, `::after`. On, the dot slides 15px right."],
    ["Label", "`.ks-sw .lbl`", "12px `--muted` text beside the knob, stating the state in words."],
    ["On, denied tone", "`.ks-sw.on`", "The knob tints `--st-denied` (ground and border) and its dot fills `--st-denied`. The label turns `--st-denied` too."],
    ["On, approval tone", "`.ks-sw.int.on`", "The immediate-toggle variant: the same shapes, tinted `--st-approval` (ground, border, dot, and a bold label) instead of denied."],
    ["Commit dialog wrapper", "`.cm-sw`", "A `--ink` card, 1px `--border`, 9px radius, 10px by 12px padding, that hides the switch's own `.lbl` and prints the state as a badge and sentence (`.tx`) instead."],
    ["Skills preview switch", "`.sx-sw`", "42 by 23px, its own size and radius rather than `.ks-sw`'s, styled from `--sk-on` when checked rather than `--st-approval`."],
  ],
  usage: {
    when: [
      "A kill switch that blocks or restores real calls: Tools, Kill switches, and the incident switches on a provider, a device, or an operator's agents.",
      "An immediate, reversible setting attached to one action, such as whether a commit opens a pull request or a fleet steer interrupts in flight.",
    ],
    not: [
      "Choosing one of several options: use a [segmented control](segmented-control.html).",
      "A setting that writes through a pull request rather than taking effect at once: show the outcome as text or a badge, as the Skills preview does, and put the actual control on the confirm button.",
      "A momentary action: use a [button](button.html).",
    ],
    examples: [
      { kind: "avoid", html: `<button type="button" class="ks-sw on" role="switch" aria-checked="true" aria-label="Toggle"><i></i><span class="lbl">On</span></button>`, why: "\"Toggle\" and \"On\" say nothing about what turning it on does. A kill switch's label states the consequence: \"On (calls blocked)\"." },
      { kind: "use", html: `<button type="button" class="ks-sw on" role="switch" aria-checked="true" aria-label="Clear the switch on payment-gateway"><i></i><span class="lbl">On (calls blocked)</span></button>`, why: "The label states the effect, and the `aria-label` names the switch and the action clicking it takes next." },
    ],
    rules: [
      "A kill switch never flips on the click that lands on it. It opens a confirm dialog stating the blast radius, and the flip happens on that dialog's action button.",
      "State is a word first (the label), then a shape (the knob position), then a color. The color alone never carries it.",
      "An immediate toggle (`.int`) is for a setting with no blast radius beyond the one thing it is attached to. Anything wider gets the kill switch's confirm.",
    ],
  },
  content: [
    "**Kill switch label**: the state and its consequence, in one line: \"On (calls blocked)\", \"Off (calls allowed)\".",
    "**Kill switch `aria-label`**: the action the click performs and the target it acts on: \"Flip the switch on payment-gateway\", \"Clear the switch on payment-gateway\".",
    "**Confirm dialog**: states the blast radius first (what stops and how much), then asks for a reason that is \"recorded on every blocked call and read by the model,\" then names when it takes effect (\"Next tool call\") and that running agents lose their run token.",
    "**Confirm action label**: the effect, not a generic confirm: \"Block calls now\", \"Allow calls again\".",
    "**Reversibility note**: a switch that can be turned back off says so in the footer: \"You can clear this switch at any time. Nothing is destroyed.\"",
  ],
  a11y: [
    "Every switch is a `button` with `role=\"switch\"` and `aria-checked` reflecting its state.",
    "An icon-only or label-hidden switch (`.cm-sw .ks-sw`) still carries its own `aria-label`, since its visible `.lbl` is hidden by CSS.",
    "The knob and dot are decorative. Nothing but the button's own accessible name and `aria-checked` need to be read.",
    "The Skills preview switch (`.sx-sw`) is a `button` with `role=\"switch\"` that can never change state: clicking it shows a toast instead of toggling `aria-checked`. A control that cannot be operated should not present as an interactive switch. See Findings.",
  ],
  phone: [
    "No phone-specific rule changes the switch's size. Unlike `.menu-i`, `.tab`, and `.navitem`, which grow to a 44px minimum height on phone, `.ks-sw` and `.sx-sw` stay at their desktop height (about 19 to 23px). See Findings.",
  ],
  tokens: [
    ["--hl", "Knob ground, off"],
    ["--rule", "Knob border, off"],
    ["--muted", "Knob dot and label, off"],
    ["--st-denied", "Kill switch on"],
    ["--st-approval", "Immediate toggle on"],
    ["--sk-on", "Skills preview switch on (see Findings)"],
    ["--ink", "Commit dialog wrapper ground"],
    ["--border", "Commit dialog wrapper border"],
  ],
  helpers: [
    ["switchCard(s)", "engine.js:8347", "The kill switch row on the Tools page, with its dynamic on and off label."],
    ["switchDialog()", "engine.js:8481", "The confirm dialog: blast radius, reason field, and the effect and reversibility copy."],
    ["doFlip(id)", "engine.js:8501", "Applies the flip after the confirm dialog's action button, and raises the persistent kill banner when a switch turns on."],
    ["cmSet(k, v)", "engine.js:1453", "Sets a field on the open commit, including the PR toggle's `pr` flag."],
    ["steerToggleInt()", "engine.js:9235", "Flips the fleet steer's Interrupt delivery mode."],
  ],
  sourceNotes: [
    "The Skills preview switch appears inside `DLG_EXT.skenable` (engine.js 8701), whose dialog states outright: \"This is a governed action. It writes a file, opens a pull request, and puts your name on both.\"",
    "`--sk-on` (engine.css 1604) is the same green as `--st-allowed`, defined a second time under its own name for the Skills page.",
  ],
  findings: [
    { tag: "open", title: "The knob and label swap order between switches", body: "The commit dialog's PR toggle writes `<i></i><span class=\"lbl\">PR</span>` (engine.js 1427), knob first. The fleet steer's Interrupt toggle writes `<span class=\"lbl\">Interrupt</span><i></i>` (engine.js 9174), label first. `.ks-sw` sets no explicit order, so DOM order is visual order: one switch shows its knob on the left, the other on the right, for the same component." },
    { tag: "note", title: "Three switch classes for three different jobs", body: "`.ks-sw` (a governed block that always confirms), `.ks-sw.int` (an immediate, reversible toggle), and `.sx-sw` (a read-only preview of a future state) look almost identical but behave nothing alike. The visual similarity between a switch that asks for a reason and one that flips on a click risks a person treating a kill switch as casually as the PR toggle." },
    { tag: "note", title: "A switch that cannot be switched", body: "`.sx-sw` in the Skills dialog is `role=\"switch\"` and `aria-checked=\"true\"` forever. Its `onclick` shows a toast explaining that the pull request is the real control rather than changing state. It reads to a screen reader as an operable switch that never operates." },
    { tag: "note", title: "A second green token", body: "`--sk-on` (engine.css 1604) duplicates `--st-allowed`'s color under a page-specific name, rather than the Skills page reusing the shared state token." },
  ],
  audit: {
    checks: [
      "Anatomy. The knob is 34 by 19px with a 13px dot, the label states the state in words, and on turns the color the reference specifies for that variant (denied for a kill switch, approval for `.int`).",
      "Governed confirm. A kill switch never changes state on the click that lands on it. It opens a dialog stating the blast radius, requires a reason, and flips only on that dialog's action button. A kill switch that flips on one click is a FAIL.",
      "Label truth. The visible label and the `aria-label` both state the consequence, not a bare \"On\", \"Off\", or \"Toggle\".",
      "Role and state. Every switch is a `button` with `role=\"switch\"` and `aria-checked` matching its actual state. A switch whose `aria-checked` never changes when clicked, without an explicit read-only affordance, is a FAIL.",
      "Color is not the only signal. Confirm that the label's words change with the state, not only the knob's color and position.",
      "Reversibility. A kill switch's confirm dialog, when turning on, states that the switch can be cleared later. Its off-facing confirm restores calls and says so.",
      "Phone touch target. Measure the switch's hit area at 390px width. Under 44px tall is a FAIL, matching the same bar the reference sets for `.menu-i` and `.tab`.",
      "One idiom. List every place in the build that draws an on-or-off control by hand rather than through one shared switch component.",
    ],
  },
};
