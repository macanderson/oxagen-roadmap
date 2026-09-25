// CI light: one dot for a set of checks, and how many have reported. See tools/build-components.mjs
// for the shape of this module, and stat-box.mjs as the reference.
export default {
  slug: "ci-light",
  name: "CI light",
  group: "Data display",
  order: 50,
  summary: "One dot for a set of checks, and how many of them have reported.",
  lead: "A CI light reports a pull request's checks as GitHub itself reports them: one dot and a done-of-total count, nothing more until someone opens the checks. It blinks blue while anything runs, turns a pulsing red the moment one job fails, and settles to a static green once every job has passed or a static grey while every job still waits.",
  root: ".ci",
  css: "lines 2135 to 2145",
  usedOn: ["Repositories (Changes table)", "Steering (Context PRs)"],
  stories: [
    {
      id: "states",
      name: "The four states",
      note: "Queued, running, passed, and failed while others still run, each with its done-of-total count.",
      html: `
        <div class="row" style="gap:18px;flex-wrap:wrap">
          <span class="ci" title="queued"><span class="ci-l queued" aria-label="queued"></span><span class="mono">0 / 5</span></span>
          <span class="ci" title="running"><span class="ci-l run" aria-label="running"></span><span class="mono">3 / 5</span></span>
          <span class="ci" title="all passed"><span class="ci-l pass" aria-label="all passed"></span><span class="mono">5 / 5</span></span>
          <span class="ci" title="1 failed"><span class="ci-l fail pulse" aria-label="1 failed"></span><span class="mono">4 / 5</span></span>
        </div>`,
    },
    {
      id: "settled-fail",
      name: "Failed and settled",
      note: "Once every job has reported, the failed light stops pulsing: `.fail` with no `.pulse`.",
      html: `
        <span class="ci" title="1 failed"><span class="ci-l fail" aria-label="1 failed"></span><span class="mono">5 / 5</span></span>`,
    },
    {
      id: "table",
      name: "In the Changes table",
      note: "The light sits in its own column beside the pull request's status badge, from the Repositories page.",
      canvas: "panel",
      html: `
        <div class="panel"><div class="tw"><table class="narrow">
          <thead><tr><th>Change</th><th>Checks</th><th>State</th></tr></thead>
          <tbody>
            <tr><td><b>context/release-manager-no-reread</b></td><td><span class="ci" title="running"><span class="ci-l run" aria-label="running"></span><span class="mono">3 / 5</span></span></td><td><span class="b b-q">Open</span></td></tr>
            <tr><td><b>context/triage-label-map</b></td><td><span class="ci" title="all passed"><span class="ci-l pass" aria-label="all passed"></span><span class="mono">5 / 5</span></span></td><td><span class="b b-allowed"><span class="d"></span>Ready</span></td></tr>
          </tbody>
        </table></div></div>`,
    },
  ],
  anatomy: [
    ["Wrapper", "`.ci`", "An inline flex row with a 7px gap, 11.5px `--muted` text, holding the light and the count."],
    ["Light", "`.ci-l`", "A 10px circle, or 12px when it carries the failure mark."],
    ["Queued", "`.ci-l.queued`", "Static `--rule` fill, no animation."],
    ["Running", "`.ci-l.run`", "`--st-approval` fill, blinking on a 1s ease-in-out loop."],
    ["Passed", "`.ci-l.pass`", "Static `--st-allowed` fill."],
    ["Failed", "`.ci-l.fail`", "Transparent fill with an `--st-failed` ✕ mark, static once every job has reported."],
    ["Failed, others running", "`.ci-l.fail.pulse`", "The same ✕ mark, pulsing on a 1.1s loop while other jobs are still in flight."],
    ["Count", "`.ci .mono`", "The done-of-total count in Monaspace Neon, right beside the light."],
  ],
  usage: {
    when: [
      "A pull request or a proposed change with a set of automated checks: the Repositories Changes table, a Context PR.",
      "Any place that needs one glance at whether checks are done, passing, or blocked, without opening the list.",
    ],
    not: [
      "A single pass or fail with no in-between: use a [badge](badge.html).",
      "The checks themselves, once opened: list each one with its own name and result in a table.",
    ],
    examples: [
      { kind: "avoid", html: `<span style="display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--muted)"><span style="width:10px;height:10px;border-radius:50%;background:#22c55e"></span>5/5 passed</span>`, why: "A raw hex green and a state spelled out in words beside a light that already shows it. Neither is one of the four tokened states." },
      { kind: "use", html: `<span class="ci" title="all passed"><span class="ci-l pass" aria-label="all passed"></span><span class="mono">5 / 5</span></span>`, why: "One of the four states, a token color, and the count in mono, matching every other CI light in the product." },
    ],
    rules: [
      "There are exactly four states: queued, running, passed, failed. A fifth ad hoc state is a new component, not a variant of this one.",
      "A failed light pulses only while other jobs are still running. Once every job has reported, it goes static, so a settled failure does not compete for attention with a live one elsewhere on the page.",
      "The done-of-total count always sits beside the light. The light alone does not say how many checks exist.",
    ],
  },
  content: [
    "**Title**: the light's `title` attribute names its state in one or two words (\"running\", \"1 failed\", \"all passed\", \"queued\"), read on hover.",
    "**Label**: the dot's `aria-label` repeats the same words, since the dot carries no text of its own.",
    "**Count**: always \"done / total\" in mono, never a percentage or a fraction spelled out in words.",
  ],
  a11y: [
    "The dot is a non-text element with an `aria-label` naming its state, so a screen reader announces \"running\" or \"1 failed\" rather than nothing.",
    "State is never color alone: failed adds a ✕ mark, running adds motion, and the done-of-total count is always visible text beside the light.",
    "The running blink and the failure pulse both stop under `prefers-reduced-motion: reduce` (engine.css 2145), leaving the light static but still correctly colored.",
  ],
  phone: [
    "The light keeps its size and layout at 390px. Nothing about `.ci` has a phone-specific rule.",
    "Inside a phone card table, the light sits in its own labelled cell the same way any other cell does.",
  ],
  tokens: [
    ["--muted", "Wrapper text"],
    ["--rule", "Queued fill"],
    ["--st-approval", "Running fill"],
    ["--st-allowed", "Passed fill"],
    ["--st-failed", "Failed ✕ mark"],
    ["--mono", "The done/total count"],
  ],
  helpers: [
    ["ciLight(c, label)", "engine.js:7159", "Picks the state from a counts object and writes the dot, title, and count. An optional label appends a `.dim` caption."],
    ["ciCounts(list)", "engine.js:7149", "Tallies an array of per-check states into `{pass, fail, running, queued, total, done}`."],
    ["ciFromSt(def, st)", "engine.js:7154", "Builds a plausible per-check state list from a change's overall status, for fixture data with no real per-check log."],
    ["oxprCiLight(p)", "engine.js:7165", "The Repositories Changes table's own wrapper: counts a proposal's checks and calls `ciLight()`."],
  ],
  sourceNotes: [
    "The design rule, from the CSS comment at engine.css 2133 to 2134: blink blue while anything runs, a red ✕ the moment one job fails, pulsing while others still run, static green once every job has passed, static grey while everything queues.",
    "`--st-approval`, the token behind the running blink, is itself a blue (`#5B93D6` in dark, `#2E6BA8` in light), so the rule's \"blink blue\" and the token it uses agree.",
  ],
  findings: [
    { tag: "note", title: "Failure mark shares a known contrast gap", body: "The failed light's ✕ mark is `--st-failed`, the same token [Colors](../colors.html#findings) already flags as small text: 3.94:1 on `--ink` and 3.51:1 on `--panel` in dark, both under 4.5:1. The mark is 12px, so it counts as text a person must be able to read." },
  ],
  audit: {
    checks: [
      "States. Exactly four states render: queued (static grey), running (blinking blue), passed (static green), failed (a red ✕, pulsing while other checks run and static once every check has reported). A fifth state or a missing one is a FAIL.",
      "Count. The done-of-total count sits beside the light in Monaspace Neon and always matches the light's own state. A light showing 5 / 5 in the running color is a FAIL.",
      "Reduced motion. Both the running blink and the failure pulse stop under `prefers-reduced-motion: reduce`, leaving the light static but correctly colored. Motion that ignores the setting is a FAIL.",
      "Non-color signal. The failed state carries a ✕ mark, not color alone. Report whether a colorblind simulation still distinguishes passed from queued, since both are static dots that differ only by color and the visible count.",
      "Accessibility. The light carries an `aria-label` naming its state. A bare `<span>` with no accessible name on the dot is a FAIL.",
      "Tokens. Every color on the light resolves to a state token. A raw hex or an inline style in place of `.ci-l.pass` / `.run` / `.fail` / `.queued` is a FAIL.",
      "One implementation. List every place the build renders a CI or check-status light by hand instead of through one shared component, with its file and line.",
    ],
  },
};
