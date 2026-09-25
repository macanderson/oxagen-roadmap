// Button: an action a person takes, in the engine's variants.
const WAND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>';
const BELL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';

export default {
  slug: "button",
  name: "Button",
  group: "Actions and input",
  order: 10,
  summary: "An action a person takes, with one gold primary per screen.",
  lead: "A button runs an action on the page it sits on: save, deny, open a dialog, close a pull request. The default button is neutral. One button per screen may be the gold primary, and it marks the action the screen exists for. Destructive actions are red, and icon buttons carry a label a screen reader can speak.",
  root: ".btn",
  css: "lines 135 to 144, icon button 117 to 120, wand 1028 to 1031, solid danger 2121 to 2122, link 1775 to 1776, phone 665 to 666",
  usedOn: ["every page", "every dialog", "the approvals drawer"],
  stories: [
    {
      id: "variants",
      name: "Variants",
      note: "Default, the one gold primary, danger, ghost, and selected.",
      row: true,
      html: `
        <button class="btn">Export report</button>
        <button class="btn primary">Set a budget</button>
        <button class="btn danger">Deny with this reason</button>
        <button class="btn ghost">Details</button>
        <button class="btn sel">Live <span class="dim">2</span></button>`,
    },
    {
      id: "small",
      name: "Small",
      note: "`.sm` for actions inside a panel header, a row, or a card.",
      row: true,
      html: `
        <button class="btn sm">Edit</button>
        <button class="btn sm primary">Approve</button>
        <button class="btn sm danger">Remove</button>
        <button class="btn sm ghost" aria-expanded="false">Details</button>`,
    },
    {
      id: "disabled",
      name: "Disabled",
      note: "Disabled drops to 45% opacity. A disabled action says why nearby.",
      row: true,
      html: `
        <button class="btn primary" disabled>Retire agent</button>
        <button class="btn danger" disabled>Retire agent</button>
        <span class="muted" style="font-size:12px">Tick the check to confirm.</span>`,
    },
    {
      id: "dialog-footer",
      name: "Dialog footer",
      note: "Cancel first, then the action. A destructive dialog's action is the danger button, and the dialog has no gold button.",
      canvas: "panel",
      html: `
        <div style="display:grid;gap:14px">
          <div class="dlg-f" style="border:1px solid var(--border);border-radius:10px"><button class="btn">Cancel</button><button class="btn primary">Send the invitation</button></div>
          <div class="dlg-f" style="border:1px solid var(--border);border-radius:10px"><button class="btn">Cancel</button><button class="btn danger">Retire agent</button></div>
          <div class="dlg-f" style="border:1px solid var(--border);border-radius:10px"><button class="btn">Keep it open</button><button class="btn danger solid">Close pull request</button></div>
        </div>`,
    },
    {
      id: "icon",
      name: "Icon buttons",
      note: "32px square. Pressed turns the border and icon gold. A count sits on the top right.",
      row: true,
      html: `
        <button class="iconbtn" aria-label="Close">×</button>
        <button class="iconbtn" aria-label="Notifications">${BELL}<span class="dot"></span></button>
        <button class="iconbtn apd-btn" aria-pressed="false" aria-controls="apdrawer" aria-label="Approvals, 3 waiting on you across all workspaces">${BELL}<span class="cnt">3</span></button>
        <button class="iconbtn" aria-pressed="true" aria-label="Approvals, 3 waiting on you across all workspaces">${BELL}</button>`,
    },
    {
      id: "wand",
      name: "Assist button",
      note: "The wand asks the assistant to write a field. It is the one fill that is neither panel nor gold.",
      row: true,
      html: `
        <label class="muted" style="font-size:12px;font-weight:600">Description</label>
        <button class="btn wand" title="Have the assistant write it" aria-label="Have the assistant write it">${WAND}</button>
        <button class="btn wand" disabled title="Have the assistant write it" aria-label="Have the assistant write it">${WAND}</button>`,
    },
    {
      id: "link",
      name: "Link button",
      note: "`.lnk` is a button that reads as a link inside a sentence.",
      html: `
        <p style="margin:0;font-size:13px">Showing constraints and procedures. <button class="lnk" style="font-size:12px">Show every type</button></p>`,
    },
  ],
  anatomy: [
    ["Button", "`.btn`", "13px Geist 500, 7px by 13px padding, a 9px radius, a `--border` edge on `--panel`, `--fg` text. Hover lifts the border to `--rule` and the ground to `--hl`."],
    ["Primary", "`.btn.primary`", "`--gold` ground and border, `--on-gold` text, 600. Hover is `--gold-bright`."],
    ["Small", "`.btn.sm`", "12px, 4px by 9px padding, a 7px radius."],
    ["Danger", "`.btn.danger`", "`--st-failed` text and a border at 40% of it. Hover tints the ground at 12%."],
    ["Solid danger", "`.btn.danger.solid`", "A `--st-failed` fill with white text, for the final step of an irreversible action."],
    ["Ghost", "`.btn.ghost`", "No ground. For a secondary action that should recede, such as Details."],
    ["Selected", "`.btn.sel`", "`--hl` ground, `--rule` border, `--fg` 600. Used by filter rows."],
    ["Disabled", "`.btn:disabled`", "45% opacity and a not-allowed cursor."],
    ["Icon button", "`.iconbtn`", "32px square, an 8px radius, `--muted` icon. Pressed is gold. `.dot` is a 6px `--st-approval` marker and `.cnt` a count pill."],
    ["Assist", "`.btn.wand`", "A 30px square filled with `--fg` and a 16px wand icon in `--ink`."],
    ["Link button", "`.lnk`", "No box. `--accent-text`, underlined, in the surrounding type."],
  ],
  usageNote: "One gold action per screen. Every other button is neutral.",
  usage: {
    when: [
      "An action on this page: save, approve, deny, open a dialog, export.",
      "A dialog's footer: Cancel, then the action.",
      "A row or card action, as `.sm`.",
    ],
    not: [
      "Moving to another page: use a link. A button that only navigates is a link styled as a button.",
      "Switching a view of one list: use a [segmented control](segmented-control.html).",
      "An on or off setting: use a [switch](switch.html).",
    ],
    examples: [
      { kind: "avoid", html: `<button class="btn primary">Save</button><button class="btn primary">Save and publish</button>`, why: "Two gold buttons. The screen no longer says which action matters." },
      { kind: "use", html: `<button class="btn">Save draft</button><button class="btn primary">Publish</button>`, why: "One gold primary, and the other action is neutral." },
      { kind: "avoid", html: `<button class="btn">OK</button><button class="btn">Click here</button>`, why: "Labels that name no action. A person must read the dialog to know what OK does." },
      { kind: "use", html: `<button class="btn">Cancel</button><button class="btn danger">Retire agent</button>`, why: "A verb and its object. The destructive action is red and says what goes." },
    ],
    rules: [
      "**One primary.** At most one `.btn.primary` is visible on a screen, dialog included. A dialog over a page takes the page's place.",
      "**Order.** In a dialog footer, Cancel comes first and the action last, at the right. On a phone the order reverses, so the action sits first under the thumb.",
      "**Destructive.** A reversible removal is `.danger`. An irreversible one asks for confirmation, names what ends and what is kept, and uses `.danger.solid` or a disabled `.danger` until the person ticks a check.",
      "**Assist.** The wand is the one assist action in a field. It is never gold, because gold is already spent on the step's primary action.",
      "**Loading.** A button that waits on the control plane keeps its label and is disabled until the answer arrives. The result arrives as a [toast](toast.html).",
    ],
  },
  content: [
    "**Label**: a verb, then its object when the verb alone is unclear: \"Set a budget\", \"Retire agent\", \"Deny with this reason\". Sentence case, no end punctuation.",
    "**Never**: OK, Submit, Click here, Yes, or No. The label names the action.",
    "**Counts** inside a button sit in `.dim` after the label: \"Live 2\".",
    "**Icon labels**: an icon button's `aria-label` names the action and its object, and a count is part of it: \"Approvals, 3 waiting on you across all workspaces\".",
  ],
  a11y: [
    "Every button is a `button` element with `type=\"button\"` unless it submits a form.",
    "An icon-only button has an `aria-label`. A toggle has `aria-pressed`. A button that opens a panel has `aria-expanded` or `aria-controls`.",
    "Focus shows the gold ring (`:focus-visible`, 2px, offset 2px).",
    "Disabled buttons cannot take focus, so the reason they are disabled must sit in text nearby, not in a tooltip on the button.",
    "Danger text is `--st-failed`, which is 3.51:1 on `--panel` in dark. See Findings.",
  ],
  phone: [
    "Buttons grow to 40px tall at 14px, and `.sm` to 36px at 13px.",
    "A dialog footer reverses its order, and each button takes half the width at 46px tall (engine.css 687 to 688).",
    "Icon buttons keep 32px but sit in a 44px hit area in the thumb bar and headers.",
  ],
  tokens: [
    ["--panel, --border, --fg", "Default button"],
    ["--hl, --rule", "Hover and selected"],
    ["--gold, --gold-bright, --on-gold", "The one primary"],
    ["--st-failed", "Danger text, border, and solid fill"],
    ["--muted", "Icon button icon"],
    ["--st-approval", "Icon button dot and count"],
    ["--accent-text", "Link button (see Findings)"],
  ],
  helpers: [
    ["dialog()", "engine.js:9514", "Writes a dialog's footer buttons from `d.f`."],
    ["act(msg, tone)", "engine.js:1981", "What most buttons call when they finish: a toast in the button's tone."],
  ],
  sourceNotes: [
    "Buttons are written inline: about 173 `btn primary`, 226 `btn sm`, 60 `btn danger`, 5 `btn ghost`, and 18 wand buttons.",
  ],
  findings: [
    { tag: "open", title: "No destructive token", body: "`.btn.danger` uses `--st-failed`, which is 3.51:1 on `--panel` and 3.94:1 on `--ink` in dark, below 4.5:1 for 13px text. The brand kit's `--destructive` (`#D5584D` dark, `#992F28` light) clears 4.5:1 both ways and is not in `engine.css`." },
    { tag: "open", title: "Hard-coded white and black", body: "`.btn.danger.solid` sets `#fff` text and mixes `#000` into its hover. `.iconbtn .cnt` sets `#000` text. None follows a token." },
    { tag: "open", title: "Gold beyond the one action", body: "A pressed icon button turns gold, and `.lnk` sets link text in `--accent-text`. Pressed is a state and a link is not the screen's action. `--fg` would carry both." },
    { tag: "note", title: "Many hand-written buttons", body: "The mockup writes every button inline. The build should draw them from one component with a variant, a size, and a disabled reason." },
  ],
  audit: {
    checks: [
      "Gold count. On every route, dialog, and drawer, count visible gold buttons. More than one is a FAIL. List the route and both labels.",
      "Labels. Every button label is a verb or a verb and object in sentence case. OK, Submit, Yes, No, Click here, or a label that names no action is a FAIL.",
      "Variants. Default, primary, small, danger, solid danger, ghost, selected, and disabled match the reference's sizes, radius, padding, weight, and tokens in both themes.",
      "Danger contrast. Measure danger text against its ground in both themes. Under 4.5:1 is a FAIL, and report which token the build uses.",
      "Destructive flow. Every irreversible action names what ends and what is kept, and its button stays disabled until the person confirms.",
      "Icon buttons. Each has an aria-label that names the action and object, and a toggle exposes aria-pressed. A count badge is part of the label.",
      "Order. Dialog footers put Cancel first and the action last. On a phone the order reverses and each button is at least 46px tall.",
      "Disabled reason. Every disabled button has its reason in visible text nearby.",
      "Native element. Every clickable control that acts on the page is a button element. A div or span with a click handler is a FAIL.",
    ],
  },
};
