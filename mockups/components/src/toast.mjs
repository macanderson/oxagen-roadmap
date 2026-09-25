// Toast: one fact, stated after the fact. See tools/build-components.mjs for the shape of this
// module, and stat-box.mjs for the depth and tone every module matches.
export default {
  slug: "toast",
  name: "Toast",
  group: "Overlays",
  order: 30,
  summary: "One fact, stated in past tense, after an action finishes.",
  lead: "A toast reports what an action did: what was written, what changed, what a decision meant. It appears at the bottom of the screen, states one fact in past tense, and removes itself after 4.2 seconds. Toasts stack, newest at the bottom, so more than one event in quick succession is never lost.",
  root: "#toast",
  css: "lines 888 to 892, phone 643",
  usedOn: ["every page"],
  stories: [
    {
      id: "tones",
      name: "Tones",
      note: "The dot carries the tone. Allowed is the default, and each other tone matches the decision vocabulary the rest of the mockup uses.",
      html: `
        <div id="toast" role="status" aria-live="polite" style="position:relative;left:auto;bottom:auto;transform:none;display:grid;gap:8px;justify-items:start">
          <div class="toast"><span class="d" style="background:var(--st-allowed)"></span><span>Committed +12 &minus;3 to feature/rotate-key on core-platform.</span></div>
          <div class="toast"><span class="d" style="background:var(--st-approval)"></span><span>Already approved by Priya Natarajan. A decision is written once.</span></div>
          <div class="toast"><span class="d" style="background:var(--st-denied)"></span><span>A denial needs a reason. The agent is told it.</span></div>
          <div class="toast"><span class="d" style="background:var(--st-failed)"></span><span>Approval expired after 10 minutes. stripe__create_payment was not sent, and the agent was told the request timed out.</span></div>
          <div class="toast"><span class="d" style="background:var(--st-critical)"></span><span>Pause queued for run_01K5RS7M2E8FJ3QW. It takes effect at the next boundary.</span></div>
          <div class="toast"><span class="d" style="background:var(--gold)"></span><span>oxagen/roadmap#523 opened for feature/rotate-key &middot; Rotate the Stripe restricted key.</span></div>
        </div>`,
    },
    {
      id: "stack",
      name: "Stack",
      note: "One row per event, newest at the bottom, each on its own timer.",
      html: `
        <div id="toast" role="status" aria-live="polite" style="position:relative;left:auto;bottom:auto;transform:none;display:grid;gap:8px;justify-items:start">
          <div class="toast"><span class="d" style="background:var(--st-allowed)"></span><span>Avatar updated on a-intel.core.triage. The definition change opens as a pull request. The badge shows here now.</span></div>
          <div class="toast"><span class="d" style="background:var(--st-allowed)"></span><span>All notifications marked read. Audit records who read each one.</span></div>
        </div>`,
    },
    {
      id: "long",
      name: "Long message",
      note: "A toast wraps to `min(560px, 92vw)`. It states one fact, however many clauses that fact needs.",
      html: `
        <div id="toast" role="status" aria-live="polite" style="position:relative;left:auto;bottom:auto;transform:none;display:grid;gap:8px;justify-items:start">
          <div class="toast"><span class="d" style="background:var(--st-allowed)"></span><span>Token apt_1bc4f9a07b02 minted. It is single-use and bound to the call digest, this agent, this run, and a 60-second expiry. Credential brokered, stripe__create_payment dispatched.</span></div>
        </div>`,
    },
  ],
  anatomy: [
    ["Stack", "`#toast`", "Fixed at the bottom center, `z-index:300`, a `justify-items:center` grid that grows upward as rows are appended. `pointer-events:none` on the stack. Rows below need none either."],
    ["Row", "`.toast`", "A `--panel` pill, 1px `--rule` border, 11px radius, `--shadow`, 11px by 16px padding, at most `min(560px, 92vw)` wide, 12.5px `--fg` text."],
    ["Tone dot", "`.toast .d`", "A 7px circle, colored inline per call from the tone map. It carries the tone. The words carry the fact."],
  ],
  usage: {
    when: [
      "The result of an action that already ran: a commit, a decision, a reset, a copy.",
      "A quick validation refusal before an action runs, such as a missing field.",
    ],
    not: [
      "A task or a decision still open: use a [dialog](dialog.html).",
      "Something parked for a person to act on later: use the [drawer](drawer.html).",
      "A caution that belongs on the page itself, not a moment in time: use a [note](note.html).",
    ],
    examples: [
      { kind: "avoid", html: `<div class="toast"><span class="d" style="background:var(--st-allowed)"></span><span>Saving...</span></div>`, why: "Present tense and no fact. A toast fires after the action finishes, so it reports what happened, not what is happening." },
      { kind: "use", html: `<div class="toast"><span class="d" style="background:var(--st-allowed)"></span><span>Removed the switch on payment-gateway.</span></div>`, why: "Past tense, one fact, the record it acted on." },
    ],
    rules: [
      "One toast per event. Two facts from one action are two toasts, not one joined by a mid-dot.",
      "A toast never carries an action button. If the result needs a next step, that step lives on the page or in the record it just changed.",
      "The tone matches the outcome's own vocabulary: approval, denied, failed, or critical, the same words the badges and the drawer use.",
    ],
  },
  content: [
    "**Tense**: past tense always. \"Committed\", \"Removed\", \"Approval expired\", never \"Committing\" or \"Removing\".",
    "**One fact per toast**: what happened, to what record, and the one consequence that matters (\"...released back to the mandate\").",
    "**Record ids and tool names**: in the sentence as written elsewhere, not reformatted: `stripe__create_payment`, `run_01K5RS7M2E8FJ3QW`.",
    "**No design language**: a toast never explains itself (\"in the mockup's decision vocabulary\") or names its own tone.",
  ],
  a11y: [
    "The stack is `role=\"status\"` with `aria-live=\"polite\"`, so an assistive technology announces each row as it is appended, in the page shell (`mockups/missioncontrol.html`), not in a template `toast()` writes.",
    "Color is not the only signal: the tone dot pairs with the sentence's own words (\"Denied\", \"expired\", \"approved\"), so the tone never carries the outcome alone.",
    "A toast never receives focus and never traps it. It reports. It does not ask.",
  ],
  phone: [
    "The stack caps each row at 368px wide instead of `min(560px, 92vw)`.",
    "When the phone thumb bar is showing, the stack's bottom offset increases so a toast never sits under it (engine.css 643).",
  ],
  tokens: [
    ["--panel", "Row ground"],
    ["--rule", "Row border"],
    ["--shadow", "Row shadow"],
    ["--fg", "Row text"],
    ["--st-allowed", "Allowed tone (default)"],
    ["--st-approval", "Approval tone"],
    ["--st-denied", "Denied tone"],
    ["--st-failed", "Failed tone"],
    ["--st-critical", "Critical tone"],
    ["--gold", "Gold tone (see Findings)"],
  ],
  helpers: [
    ["toast(msg, tone)", "engine.js:2040", "Appends one row to `#toast` and removes it after 4.2 seconds. 17 calls."],
    ["act(msg, tone)", "engine.js:2039", "Records the message on state and calls `toast()`. Over 200 calls. The usual way a change reports itself."],
  ],
  sourceNotes: [
    "The stack container itself, `<div id=\"toast\" role=\"status\" aria-live=\"polite\">`, is written once in the page shell rather than by any function in `engine.js`.",
  ],
  findings: [
    { tag: "open", title: "Gold used as a state, not the one action", body: "`toast()`'s tone map sends `\"gold\"` to `var(--gold)` (engine.js 1977), used for a pull request opening or a reset. Gold is identity plus at most one action per screen. A toast is neither. `--st-allowed` or `--fg` would say \"this happened\" without spending gold on a report." },
    { tag: "note", title: "Two idioms for the same message", body: "Most call sites call `toast()` directly. `act(msg, tone)` (engine.js 1974) does the same thing after also recording the message on `S.toast`. Both idioms are live and neither is documented as the default." },
  ],
  audit: {
    checks: [
      "Live region. `#toast` (or its equivalent) is `role=\"status\"` with `aria-live=\"polite\"`, present once in the page shell, not recreated per toast.",
      "Timing. A row is removed automatically after about 4.2 seconds, and an event that fires again re-adds its own row rather than resetting an existing one.",
      "Stacking. Two events close together render as two rows, newest last, each on its own timer. No row is dropped.",
      "Tense and content. Every message is past tense and states one fact. A message with no verb, or in the present or future tense, is a FAIL.",
      "Tone. The dot's color matches one of allowed, approval, denied, failed, critical, or gold, and never carries the outcome alone. The words repeat it.",
      "Gold. Count toasts using the gold tone on a routed page. Gold spent on a report rather than the screen's one action is a FAIL.",
      "No actions. A toast carries no button, link, or dismiss control beyond its automatic timeout.",
      "Position. The stack sits centered at the bottom of the viewport, above the phone thumb bar when one is showing, and never covers a dialog or the drawer.",
    ],
  },
};
