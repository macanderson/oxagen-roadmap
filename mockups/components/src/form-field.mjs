// Form field: a label, a control, and a hint, plus the checkbox card and the small select.
export default {
  slug: "form-field",
  name: "Form field",
  group: "Actions and input",
  order: 20,
  summary: "A label, a control, and a one-sentence hint, with the checkbox card and the small select.",
  lead: "A form field is a label above a control with an optional hint below it. The control is a text input, a select, or a textarea on the page ground. Two fields can sit side by side, a read-only field shows a value you cannot change here, and a checkbox card holds a choice with its consequence written out. Most fields live in dialogs.",
  root: ".field",
  css: "lines 479 to 483, 569 to 576, check card 577 to 582, 1366 to 1368, 2249, 2266, small select 773 to 774, read-only 931, phone 677 to 679",
  usedOn: ["every dialog", "Set a budget", "Invite a person", "Retire agent", "the connection wizard", "Account"],
  stories: [
    {
      id: "text",
      name: "Text inputs",
      note: "A label tied to its control, and a hint that says what a valid value looks like.",
      canvas: "panel",
      html: `
        <div style="max-width:480px">
          <div class="field"><label for="f-email">Email</label><input id="f-email" type="email" value="rowan@a-intel.example"><div class="hint">The invitation goes to this address and expires in seven days.</div></div>
          <div class="field"><label for="f-role">Role</label><select id="f-role"><option>Workspace member</option><option>Workspace admin</option><option>Billing</option></select></div>
          <div class="field"><label for="f-why">Reason</label><textarea id="f-why" rows="3">The push to main skips review. Push to a branch and open a pull request.</textarea><div class="hint">The agent reads this as the reason for the denial.</div></div>
        </div>`,
    },
    {
      id: "two-up",
      name: "Two fields in a row",
      note: "`.fields` puts two fields side by side and stacks them under 560px.",
      canvas: "panel",
      html: `
        <div class="fields" style="max-width:520px">
          <div class="field"><label for="f-limit">Monthly limit</label><input id="f-limit" value="$2,000.00"><div class="hint">In US dollars.</div></div>
          <div class="field"><label for="f-mode">Mode</label><select id="f-mode"><option>Enforced</option><option>Recorded only</option></select></div>
        </div>`,
    },
    {
      id: "readonly",
      name: "Read-only",
      note: "A value set elsewhere, on `--hl` in `--muted`, with a hint that says where to change it.",
      canvas: "panel",
      html: `
        <div style="max-width:480px">
          <div class="field"><label for="f-mail">Email</label><input id="f-mail" readonly value="marcus@a-intel.example"><div class="hint">Your identity provider sets this.</div></div>
        </div>`,
    },
    {
      id: "check",
      name: "Checkbox card",
      note: "A choice with its consequence. The title is mono by default, for a permission or a key.",
      canvas: "panel",
      html: `
        <div style="max-width:480px">
          <label class="check"><input type="checkbox" checked><span class="grow"><span class="n">spend.read</span><span class="d">See spend, budgets, and the findings on this workspace.</span></span></label>
          <label class="check"><input type="checkbox"><span class="grow"><span class="n" style="font-family:var(--font)">I understand this cannot be undone</span><span class="d">Registering again creates a new principal.</span></span></label>
          <label class="check off"><input type="checkbox" disabled><span class="grow"><span class="n">billing.write</span><span class="d">Only an org owner can grant this.</span></span></label>
        </div>`,
    },
    {
      id: "small-select",
      name: "Small select",
      note: "`.sel-sm` sits inside a table row or a list item.",
      row: true,
      html: `
        <span class="muted" style="font-size:12px">Tag</span>
        <select class="sel-sm" aria-label="Tag of item 1"><option>code</option><option selected>test</option><option>docs</option><option>review</option></select>`,
    },
  ],
  anatomy: [
    ["Field", "`.field`", "A block with 14px below it."],
    ["Label", "`.field label`", "12px Geist 600 in `--muted`, 5px above the control."],
    ["Control", "`.field input`, `select`, `textarea`", "Full width on `--ink`, a 1px `--border`, a 9px radius, 8px by 11px padding, 13px text. Focus turns the border gold."],
    ["Hint", "`.field .hint`", "11.5px in `--dim`, 5px below. Inside a dialog it is `--muted` at line height 1.5."],
    ["Read-only", "`.field input[readonly]`", "`--muted` text on `--hl`, default cursor."],
    ["Two up", "`.fields`", "Two equal columns, 12px apart. One column under 560px and in the phone dialog layer."],
    ["Checkbox card", "`.check`", "A bordered row on `--ink`: a gold-accent checkbox, a title (`.n`, 12.5px Monaspace Neon 500), and a line (`.d`, 12px `--muted`)."],
    ["Disabled card", "`.check.off`", "55% opacity and a not-allowed cursor."],
    ["Small select", "`.sel-sm`", "12px on `--ink`, a 7px radius, 4px by 8px padding."],
  ],
  usageNote: "Label above, control, hint below. Nothing else in a field.",
  usage: {
    when: [
      "Any value a person types or picks in a dialog or a wizard.",
      "A consequence a person must accept before a destructive action: the checkbox card.",
      "A per-row choice in a table: the small select.",
    ],
    not: [
      "Searching or filtering a list: the [list table](list-table.html) adds its own search and filters.",
      "An on or off setting that applies at once: use a [switch](switch.html).",
      "Two to five choices that change a view: use a [segmented control](segmented-control.html).",
    ],
    examples: [
      { kind: "avoid", row: false, html: `<div class="field" style="width:100%"><input placeholder="Email"></div>`, why: "A placeholder as the only label. It disappears as you type, and a screen reader may not read it." },
      { kind: "use", row: false, html: `<div class="field" style="width:100%"><label for="dd-email">Email</label><input id="dd-email" placeholder="name@a-intel.example"></div>`, why: "A label tied to the input, and a placeholder that shows the format." },
    ],
    rules: [
      "The label is tied to its control with `for` and `id`, or the control sits inside the label.",
      "A hint is one sentence. It says what a valid value looks like or what happens when you save.",
      "Validation says what is wrong and what to write, under the field, when you leave it or save. See Findings.",
      "A money field shows dollars. The store keeps micros, and the field never shows them.",
      "A destructive dialog keeps its action disabled until the checkbox card is ticked.",
    ],
  },
  content: [
    "**Label**: a noun in sentence case, no colon: \"Monthly limit\", \"Reason\".",
    "**Placeholder**: an example of the format, never the label: `name@a-intel.example`.",
    "**Hint**: one sentence, present tense: \"In US dollars.\" \"Your identity provider sets this.\"",
    "**Error**: what is wrong, then what to write: \"The limit is below this month's spend of $2,450.00. Set it at $2,450.00 or more.\"",
    "**Checkbox title**: a permission or key in mono (`spend.read`), or a plain statement in Geist when it is a sentence the person agrees to.",
  ],
  a11y: [
    "Every control has a programmatic label. 112 fields in the mockup put a bare `label` beside an input and name the input with `aria-label` instead. See Findings.",
    "The hint is tied to its control with `aria-describedby`, so it is read after the label.",
    "An invalid field sets `aria-invalid=\"true\"` and ties its message with `aria-describedby`.",
    "The focus border is gold and the global focus ring also shows. Both clear 3:1 on `--ink`.",
    "The hint in `--dim` outside a dialog is 3.67:1 on `--panel` in dark. A hint a person needs to act belongs on `--muted`.",
  ],
  phone: [
    "Inputs, selects, and textareas are 16px so iOS does not zoom on focus, and inputs and selects are at least 44px tall.",
    "`.fields` stacks to one column.",
    "The small select is at least 36px tall.",
  ],
  tokens: [
    ["--ink", "Control and checkbox card ground"],
    ["--border", "Control and card border"],
    ["--gold", "Focus border and checkbox accent"],
    ["--muted", "Label, read-only text, card line, dialog hint"],
    ["--dim", "Hint outside a dialog"],
    ["--hl", "Read-only ground"],
    ["--rule", "Card hover border"],
  ],
  helpers: [
    ["dialog()", "engine.js:9759", "Renders the fields a dialog body holds."],
  ],
  sourceNotes: [
    "Fields are written inline, about 258 of them, mostly in dialogs. There are 11 checkbox cards.",
    "The onboarding screens have their own invalid state, `.field input.ob-bad` (engine.css 1476). Nothing else in the engine draws an invalid field.",
  ],
  findings: [
    { tag: "open", title: "Half the labels are not tied to their controls", body: "112 fields write `<label>Name</label><input aria-label=\"Name\">` and 109 use `for`. Clicking the bare label does not focus the input. Every label should use `for`." },
    { tag: "open", title: "No shared invalid state", body: "Only onboarding draws an invalid field, and `aria-invalid` appears once in the engine. A build needs one error style and message slot for every field." },
    { tag: "note", title: "Mono checkbox titles by default", body: "`.check .n` is Monaspace Neon. A title that is a sentence must override it inline, as the retire dialog does. A modifier class would be clearer." },
    { tag: "note", title: "Hint color changes with its container", body: "A hint is `--dim` on a page and `--muted` in a dialog. One rule, `--muted`, would read the same everywhere." },
  ],
  audit: {
    checks: [
      "Labels. Every input, select, and textarea has a visible label tied to it with for and id, or wrapped by it. aria-label alone beside a visible label is a FAIL.",
      "Look. Labels are 12px Geist 600 in --muted. Controls are full width on --ink with a 1px --border, a 9px radius, 8px by 11px padding, and 13px text. Focus shows a gold border and the focus ring.",
      "Hints. Each hint is one sentence tied with aria-describedby.",
      "Validation. Submit each form empty and with a bad value. Each invalid field shows its message beside it, sets aria-invalid, and the message says what is wrong and what to write. A message only in a toast is a FAIL.",
      "Money. A money field shows and accepts dollars with separators, and stores micros. Micros in a field are a FAIL.",
      "Read-only. A read-only value is visibly read-only and its hint says where it is changed.",
      "Checkbox cards. The title and line are one label for the checkbox, a disabled card says why, and a destructive action stays disabled until its card is ticked.",
      "Phone. Controls are 16px and at least 44px tall, and two-up fields stack.",
    ],
  },
};
