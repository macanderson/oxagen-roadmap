// Dialog: a task or a decision that needs an answer before the page goes on. The shell comes from
// dialog() in engine.js; every dialog is a {t, s, w, tabs, b, f} record rendered into #layer.
export default {
  slug: "dialog",
  name: "Dialog",
  group: "Overlays",
  order: 10,
  summary: "A task or a decision that needs an answer before the page goes on.",
  lead: "A dialog opens over the page for one task: invite a person, set a budget, approve a schema, retire an agent. It has a header that names the task, a body that holds the fields or the facts, and a footer with Cancel and the one action. On a phone it rises from the bottom edge as a sheet.",
  root: ".dlg",
  css: "lines 471 to 490, phone 689 to 701",
  usedOn: ["Work (Intake)", "Agents", "Spend (Set a budget)", "Organization (Invite a person)", "Tools", "Steering"],
  stories: [
    {
      id: "form",
      name: "Form dialog",
      note: "Shown over its scrim. The scrim is `position:fixed` in the product. The inline override keeps it in this canvas.",
      html: `
        <div class="scrim" style="position:relative;inset:auto;z-index:auto;padding:28px 18px;border-radius:12px">
          <div class="dlg" role="dialog" aria-modal="true" aria-label="Invite a person">
            <div class="dlg-h"><h2>Invite a person</h2><button class="iconbtn x" aria-label="Close">×</button></div>
            <div class="dlg-b">
              <div class="field"><label for="iv-email">Email</label><input id="iv-email" value="rowan@a-intel.example"></div>
              <div class="field"><label for="iv-role">Role</label><select id="iv-role"><option>workspace.member · core-platform</option><option>workspace.owner · core-platform</option><option>org.auditor</option><option>org.billing</option></select></div>
              <div class="note">An invitation is the only way into the organization. It expires in seven days, and accepting it requires a verified email and two-factor.</div>
            </div>
            <div class="dlg-f"><button class="btn">Cancel</button><button class="btn primary">Send the invitation</button></div>
          </div>
        </div>`,
    },
    {
      id: "confirm",
      name: "Destructive confirm",
      note: "The subtitle names the record, the body says what ends and what is kept, and the danger button stays disabled until the check is ticked.",
      html: `
        <div class="dlg" role="dialog" aria-modal="true" aria-label="Retire agent">
          <div class="dlg-h sub"><div class="grow"><h2>Retire agent</h2><p>a-intel.core.triage</p></div><button class="iconbtn x" aria-label="Close">×</button></div>
          <div class="dlg-b">
            <p style="font-size:13px">This ends the agent’s identity. Its credential is revoked, every run token dies at the next call, and a pull request archives <span class="mono">.oxagen/agents/triage.toml</span>.</p>
            <dl class="kv"><dt>Kept</dt><dd>every run, frame and receipt</dd><dt>Ends</dt><dd>2 roles, 1 mandate, the host enrollment</dd><dt>In flight</dt><dd><span style="color:var(--st-failed)">1 live run</span>, canceled at the next boundary and recorded</dd></dl>
            <label class="check" style="margin-top:12px"><input type="checkbox"><span class="grow"><span class="n" style="font-family:var(--font)">I understand this cannot be undone</span><span class="d">Registering again creates a new principal.</span></span></label>
          </div>
          <div class="dlg-f"><button class="btn">Cancel</button><button class="btn danger" disabled>Retire agent</button></div>
        </div>`,
    },
    {
      id: "tabs",
      name: "Tabs in a dialog",
      note: "Tabs sit flush between the header and the body, with the dialog's 18px side padding.",
      html: `
        <div class="dlg" role="dialog" aria-modal="true" aria-label="Account">
          <div class="dlg-h"><h2>Account</h2><button class="iconbtn x" aria-label="Close">×</button></div>
          <div class="tabs" role="tablist"><button class="tab" role="tab" aria-selected="true">Profile</button><button class="tab" role="tab" aria-selected="false">Preferences</button><button class="tab" role="tab" aria-selected="false">Security</button><button class="tab" role="tab" aria-selected="false">Privacy</button></div>
          <div class="dlg-b">
            <div class="fields"><div class="field"><label for="ac-name">Name</label><input id="ac-name" value="Marcus Bell"></div><div class="field"><label for="ac-email">Email</label><input id="ac-email" value="marcus@a-intel.example" readonly></div></div>
            <div class="field"><label for="ac-tz">Time zone</label><select id="ac-tz"><option>America/New_York</option><option>UTC</option></select><div class="hint">Times on every page read in this zone. Frames keep UTC.</div></div>
          </div>
          <div class="dlg-f"><button class="btn">Cancel</button><button class="btn primary">Save profile</button></div>
        </div>`,
    },
    {
      id: "wide",
      name: "Wide review",
      note: "`.dlg.wide` is 820px for a review that compares two sources side by side. The footer note names the governed action.",
      html: `
        <div class="dlg wide" role="dialog" aria-modal="true" aria-label="Approve an observed output schema">
          <div class="dlg-h"><h2>Approve an observed output schema</h2><button class="iconbtn x" aria-label="Close">×</button></div>
          <div class="dlg-b">
            <dl class="kv" style="margin-bottom:14px"><dt>Observations</dt><dd><span class="num">1,284</span> responses over 30 days, from 3 agents</dd><dt>Digest on approval</dt><dd class="mono">sha256:1bc4f9a07b02</dd></dl>
            <div class="cpair"><div><div class="lab">Inferred output schema<span class="sp">what approval enforces</span></div><pre>{
  "ok": "boolean",
  "channel": "string",
  "ts": "string"
}</pre></div><div><div class="lab">One recorded response<span class="sp">for comparison</span></div><pre>{
  "ok": true,
  "channel": "C07RELEASE",
  "ts": "1726650112.004"
}</pre></div></div>
          </div>
          <div class="dlg-f"><span class="grow">Approving records <span class="mono">approve_tool_schema</span> as a governed action.</span><button class="btn">Not yet</button><button class="btn primary">Approve schema</button></div>
        </div>`,
    },
  ],
  anatomy: [
    ["Scrim", "`.scrim`", "The fixed backdrop: `rgba(0,0,0,.68)` with a 3px blur. It places the dialog 70px from the top and scrolls when the dialog is taller than the window."],
    ["Shell", "`.dlg`", "A `--panel` box with a 1px `--rule` border, a 14px radius, and `--shadow`, at most 600px wide."],
    ["Wide shell", "`.dlg.wide`", "The same shell at most 820px wide, for side-by-side reviews."],
    ["Header", "`.dlg-h`", "The h2 title (16px Geist 600) and the close button, 15px by 18px padding, with a bottom border."],
    ["Subtitle", "`.dlg-h.sub .grow p`", "One line under the title: a record id or one fact, 12.5px `--muted`."],
    ["Close", "`.iconbtn.x`", "A 32px icon button pushed to the right edge, labelled Close."],
    ["Tabs", "`.dlg .tabs`", "Optional tabs between the header and the body, flush with the body's padding."],
    ["Body", "`.dlg-b`", "The fields and facts, 17px by 18px padding. It scrolls inside a 62vh ceiling."],
    ["Footer", "`.dlg-f`", "Cancel then the action, right-aligned, 13px by 18px padding, with a top border."],
    ["Footer note", "`.dlg-f .grow`", "One sentence at the left of the footer, 12px `--muted`."],
  ],
  usage: {
    when: [
      "A task that needs input before it runs: invite a person, set a budget, connect an issue tracker.",
      "A confirm for an action that ends something: retire an agent, remove a budget, revoke a key.",
      "A review that compares two sources before a governed action, in the wide shell.",
    ],
    not: [
      "Items waiting on a person across the organization: use the [drawer](drawer.html).",
      "The result of an action: use a [toast](toast.html).",
      "Reading a record: link to its page.",
      "A short list of choices: use a [menu](menu.html).",
    ],
    examples: [
      { kind: "avoid", html: `<div class="dlg" style="max-width:340px"><div class="dlg-h"><h2>Are you sure?</h2></div><div class="dlg-b"><p style="font-size:13px;margin:0">This action cannot be undone.</p></div><div class="dlg-f"><button class="btn primary">Cancel</button><button class="btn primary">OK</button></div></div>`, why: "A title that names nothing, a body that says nothing about what ends, two gold buttons, and an OK that could mean anything." },
      { kind: "use", html: `<div class="dlg" style="max-width:340px"><div class="dlg-h"><h2>Revoke key</h2></div><div class="dlg-b"><dl class="kv"><dt>Ends</dt><dd>every call signed with <span class="mono">oxk_live_4F2A</span></dd><dt>Kept</dt><dd>the audit record of each use</dd></dl></div><div class="dlg-f"><button class="btn">Cancel</button><button class="btn danger">Revoke key</button></div></div>`, why: "The title and the button name the act, and the body says what ends and what is kept." },
    ],
    rules: [
      "One dialog at a time. A dialog opened from Intake returns to Intake when it closes (`S.dlgBack`), so the person never loses the step they were on.",
      "The footer holds at most one gold button. A destructive action uses `.btn.danger` and no gold.",
      "Cancel comes first and the action last. A review that can wait may say \"Not yet\" in place of Cancel.",
    ],
  },
  content: [
    "**Title**: names the task in sentence case: \"Invite a person\", \"Set a budget\", \"Approve an observed output schema\". Never \"Are you sure?\" or \"Confirm\".",
    "**Subtitle**: one line, the record the dialog acts on (`a-intel.core.triage`) or one fact.",
    "**Action button**: the act, and the record where it helps: \"Send the invitation\", \"Approve schema\", \"Retire agent\". Never OK, Submit, Yes, or Done for an action that writes.",
    "**Destructive confirm**: a key-value list that names what is kept, what ends, and what is in flight, and a check card that reads \"I understand this cannot be undone\" with the consequence under it.",
    "**Footer note**: one sentence that names the governed action the button records, with the action name in mono.",
    "**Hints**: under the field they explain, one or two sentences, in the present tense.",
  ],
  a11y: [
    "The shell is `role=\"dialog\"` with `aria-modal=\"true\"` and an `aria-label` equal to its title.",
    "The close button is labelled Close. Escape closes the dialog, and so does a click on the scrim outside it.",
    "Opening moves focus into the dialog, to the first field or the close button. Tab stays inside while it is open. Closing returns focus to the control that opened it. The mockup does not do this yet. See Findings.",
    "Every field has a visible label tied to it with `for`. A disabled danger button says why in the check card beside it.",
  ],
  phone: [
    "The dialog becomes a bottom sheet: full width, an 18px top radius, a 36 by 4px grab handle in `--rule`, and a rise from the bottom edge (none under reduced motion).",
    "The sheet is at most the window height minus 24px, and only the body scrolls.",
    "The footer reverses so the action comes first, each button takes half the row at 46px tall, and a footer note takes its own line.",
    "Inputs are 16px and 44px tall, and `.fields` stacks to one column.",
  ],
  tokens: [
    ["--panel", "Shell ground"],
    ["--rule", "Shell border"],
    ["--border", "Header and footer dividers"],
    ["--shadow", "Shell shadow"],
    ["--fg", "Title"],
    ["--muted", "Subtitle and footer note"],
    ["--gold, --on-gold", "The one primary action"],
    ["--st-failed", "The danger action"],
  ],
  helpers: [
    ["dialog()", "engine.js:9588", "Builds the scrim, shell, header, tabs, body, and footer from a `{t, s, w, tabs, b, f}` record. The shell markup is at 9662 to 9667."],
    ["openDialog(kind, arg)", "engine.js:8343", "Opens a dialog by kind and remembers the dialog to return to."],
    ["closeDialog()", "engine.js:8520", "Closes it, or returns to the dialog it was opened from."],
    ["DLG_EXT", "engine.js:23", "The registry of dialogs defined outside `dialog()`, such as `budgetedit` and `budgetdel`."],
  ],
  sourceNotes: [
    "Escape closes the open dialog through the document key handler at engine.js 13895.",
    "The account dialog's tabs come from `accountTabs()` (engine.js 9795). The wide review is `schemaDlg()` (9691).",
  ],
  findings: [
    { tag: "open", title: "No focus management", body: "`render()` writes the dialog into `#layer` and moves no focus. Focus stays on the page behind, Tab walks out of the dialog, and closing does not return focus to the opener. A build needs all three." },
    { tag: "fixed", title: "Retired term in the retire dialog", body: "The retire dialog read \"Deregister agent\" with a Deregister button, a term the copy review retired, and `check-copy.mjs` never opened it. It reads Retire agent now, the page specs quote it, and `check-copy.mjs` opens the dialog." },
    { tag: "note", title: "Scrim color is fixed", body: "The scrim is `rgba(0,0,0,.68)` in both themes (engine.css 471). It follows no token." },
    { tag: "note", title: "Two footer note idioms", body: "Most footers use `.dlg-f .grow`. The schema review writes an inline `margin-right:auto` span instead (engine.js 9707)." },
    { tag: "note", title: "Vague action labels", body: "Set a budget's action reads \"Set it\" (engine.js 9569). The action names its record elsewhere, as in \"Send the invitation\"." },
  ],
  audit: {
    checks: [
      "Shell. Every dialog is one `role=\"dialog\"` element with `aria-modal=\"true\"` and an accessible name equal to its visible title. A dialog without both is a FAIL.",
      "Layout. The shell is at most 600px wide (820px for a wide review), on `--panel` with a 1px `--rule` border, a 14px radius, and `--shadow`, 70px from the top of the window, over a scrim with a 3px blur.",
      "Header. The title is an h2 at 16px Geist 600. A subtitle is one 12.5px `--muted` line. The close button is last in the header, 32px, and labelled Close.",
      "Footer. Buttons are right-aligned with Cancel first and the action last. At most one gold button, and none when the action is destructive. An action labelled OK, Submit, or Yes is a FAIL.",
      "Destructive confirm. The body names what is kept, what ends, and what is in flight. The danger button is disabled until the \"I understand\" check is ticked. A destructive action that runs on one click is a FAIL.",
      "Focus. Opening moves focus into the dialog. Tab and Shift+Tab stay inside. Escape and a click on the scrim close it. Closing returns focus to the opener. Any one missing is a FAIL.",
      "Return path. A dialog opened from another dialog (Intake to the connection wizard) returns to it on close. Only one dialog shows at a time.",
      "Body scroll. A long body scrolls inside the dialog at a 62vh ceiling while the header and footer stay put, and the page behind does not scroll.",
    ],
  },
};
