// Timeline: a short sequence of steps read top to bottom or left to right. See tools/build-components.mjs
// for the shape of this module, and stat-box.mjs as the reference.
export default {
  slug: "timeline",
  name: "Timeline",
  group: "Data display",
  order: 70,
  summary: "A short sequence of steps, read top to bottom or left to right.",
  lead: "A timeline lays out the steps of a fixed sequence: how a figure was priced, the stages of a workflow, how to apply a fix. The vertical `.chain` reads top to bottom with a rule and a dot per step. The horizontal `.stages` variant, written by `stageChain()`, reads left to right and carries a live state per stage: waiting, on, or done.",
  root: ".chain",
  css: "lines 312 to 317, 2206 to 2218, 2397 to 2403",
  usedOn: ["Billing", "Spend (evidence and fix dialogs)", "Work orders (Stages)"],
  stories: [
    {
      id: "vertical",
      name: "Vertical chain",
      note: "From the Billing page's Billable units panel. Every item here renders `li.on`, so the gold dot marks each row alike.",
      html: `
        <ul class="chain">
          <li class="on"><span class="h">Priced</span><div>A governed action: a call oxagen decided, delivered and recorded, with its receipt in the chain.</div></li>
          <li class="on"><span class="h">Reported</span><div>Sealed runs, tokens by class and retained evidence. Reported, never priced.</div></li>
          <li class="on"><span class="h">Free</span><div>Denials, runs oxagen halted before a model call, and runs of the in-app agent.</div></li>
        </ul>`,
    },
    {
      id: "steps",
      name: "Plain steps",
      note: "From the fix dialog's \"How to apply it\" list. No `.h` label, just the step text.",
      html: `
        <ul class="chain">
          <li class="on"><div style="font-size:12.5px;color:var(--body)">Add <span class="mono">page_size</span> to the billing call.</div></li>
          <li class="on"><div style="font-size:12.5px;color:var(--body)">Cache the first page for the rest of the run.</div></li>
          <li class="on"><div style="font-size:12.5px;color:var(--body)">Open a pull request. The Spend page confirms the drop on the next sealed run.</div></li>
        </ul>`,
    },
    {
      id: "stages",
      name: "Stage chain",
      note: "The horizontal variant, written by `stageChain()`, for a work order's Stages panel. State per stage: waiting (plain), `on` (current, gold), `done` (`--st-allowed`).",
      canvas: "panel",
      html: `
        <div class="stages">
          <div class="stage done"><span class="r"><i>1</i>Draft</span><span class="ag"><span class="avx agent tn-solid f-mono" style="width:18px;height:18px;font-size:8px">CI</span><b>stella CI</b></span><span class="sub">owns tests, lint</span></div>
          <span class="stage-arrow" aria-hidden="true">→</span>
          <div class="stage on"><span class="r"><i>2</i>Review</span><span class="ag"><span class="avx agent tn-solid" style="width:18px;height:18px;font-size:8px">RM</span><b>Release manager</b></span><span class="sub">owns changelog, release notes</span></div>
          <span class="stage-arrow" aria-hidden="true">→</span>
          <div class="stage you"><span class="r"><i>3</i>Accept</span><span class="ag"><span class="avx person tn-soft f-serif" style="width:18px;height:18px;font-size:8px">MB</span><b>You</b></span><span class="sub">a person accepts every item</span></div>
        </div>`,
    },
  ],
  anatomy: [
    ["Vertical list", "`.chain`", "A `ul` with no default list marker, laid out as a single-column grid with no row gap."],
    ["Step", "`.chain li`", "A 22px left rule in `--rule`, 14px padding below, a 5px left margin so the dot sits on the rule."],
    ["Step dot", "`.chain li::before`", "A 9px `--panel` circle with a 2px `--rule` border, positioned on the rule."],
    ["Current step dot", "`.chain li.on::before`", "The dot and its border turn `--gold` (see Findings)."],
    ["Step label", "`.chain .h`", "10.5px Geist 600 at 0.1em, capitals by CSS, `--dim`."],
    ["Stage row", "`.stages`", "A wrapping flex row with an 8px gap, for `stageChain()`'s horizontal variant."],
    ["Stage card", "`.stage`", "A `--ink` box with a 1px `--border`, a 10px radius, holding the role, the agent, and the sub line."],
    ["Stage arrow", "`.stage-arrow`", "A `--dim` arrow between stage cards, hidden on a phone."],
    ["Current stage", "`.stage.on`", "A `--gold`-tinted border and glow (see Findings)."],
    ["Done stage", "`.stage.done`", "A `--st-allowed`-tinted border and a filled numbered circle."],
    ["Your stage", "`.stage.you`", "A dashed border, for the person-accepts step at the end of every workflow."],
  ],
  usage: {
    when: [
      "A fixed sequence a person reads once: how a number was priced, the steps to apply a fix.",
      "A workflow's stages and which one is current, in the horizontal `.stages` layout.",
    ],
    not: [
      "A record's changing state with timestamps: use the run's own transcript or frame list.",
      "A single current status with no history: use a [badge](badge.html).",
      "Many parallel branches: the layered `.stages.layered` variant handles that, but a graph belongs in its own view.",
    ],
    examples: [
      { kind: "avoid", html: `<ul class="chain" style="width:100%"><li class="on"><span class="h">Step 1</span><div>Priced.</div></li><li class="on"><span class="h">Step 2</span><div>Reported.</div></li><li class="on"><span class="h">Step 3</span><div>Free.</div></li></ul>`, why: "Every step marked \"on\" in gold. Nothing is current, so the gold dot means nothing." },
      { kind: "use", html: `<ul class="chain" style="width:100%"><li class="on"><span class="h">Priced</span><div>A governed action, billed at the rate on record.</div></li><li><span class="h">Reported</span><div>Sealed runs and retained evidence. Reported, never priced.</div></li></ul>`, why: "Gold marks the one step that is current or true right now, and a later step waits in the plain rule color." },
    ],
    rules: [
      "A vertical chain lists a fixed set of facts or steps, not a live progress state, unless one step is genuinely current.",
      "A horizontal stage chain's `on` state is the stage a work order is at right now. Every other stage is `done`, waiting, or `you`.",
      "The step label, when there is one, is a plain noun or a short phrase, not a numbered instruction (\"Step 1\").",
    ],
  },
  content: [
    "**Step label**: a plain noun in sentence case (\"Priced\", \"Reported\"). CSS sets the capitals.",
    "**Step body**: one or two sentences, present tense, stating a fact or an instruction.",
    "**Stage role**: a plain noun for the job the stage does (\"Draft\", \"Review\", \"Accept\"), never a comma tail.",
    "**Stage sub line**: what the stage owns, or its current run state (\"Running\", \"Sent back\", \"Done\"), never a design rationale.",
  ],
  a11y: [
    "`.chain` is a real `ul`/`li` list, so a screen reader announces the step count and reads each step in order.",
    "The step dot is CSS-generated content (`::before`), so it carries no text of its own. The color it turns is decoration, not the only signal: a stage's state also changes its border color and, in `.stages`, its numbered circle.",
    "A stage's state word (\"Running\", \"Sent back\", \"Done\") is visible text beside the stage, not color alone.",
  ],
  phone: [
    "`.stages` wraps to one column and `.stage-arrow` is hidden, so stages stack without a dangling arrow.",
    "`.chain` needs no phone rule: it is already a single column with no fixed width.",
  ],
  tokens: [
    ["--rule", "Chain rule and step dot border at rest"],
    ["--panel", "Step dot fill at rest"],
    ["--gold", "Current chain dot, current stage border (see Findings)"],
    ["--dim", "Step label, stage role, stage arrow"],
    ["--ink", "Stage card ground"],
    ["--border", "Stage card border at rest"],
    ["--st-allowed", "Done stage border and numbered circle"],
    ["--st-approval", "`.stage.again`, a stage sent back for another pass"],
  ],
  helpers: [
    ["stageChain(wf, opts)", "engine.js:15059", "Writes the `.stages` row from a workflow's stage list, plus a final Accept card. `opts.state(i)` returns each stage's class."],
    ["stState(i)", "engine.js:15678", "A work order's per-stage state function: `done` once sealed and not returned, `on` while live or next up, empty while queued."],
  ],
  sourceNotes: [
    "The vertical `.chain` is written inline in three places: `pBilling()` (engine.js 7923), the evidence dialog's \"How we know\" list (9451), and the fix dialog's \"How to apply it\" list (9495). None goes through a shared helper.",
    "In all three inline sites every `<li>` carries `.on`. `stageChain()` is the only caller that varies the state per item.",
  ],
  findings: [
    { tag: "open", title: "Gold marks every row, not a state", body: "The three inline `.chain` lists (Billing, the evidence dialog, the fix dialog) mark every `<li>` with `.on`, so `li.on::before` (engine.css 316) turns every dot gold. Gold is identity plus one action, never decoration, and a dot that is gold on every row carries no information at all." },
    { tag: "open", title: "Gold marks the current stage", body: "`.stage.on` (engine.css 2215) tints the current stage's border and glow with `--gold`, while `.stage.done` (2206) correctly uses the `--st-allowed` state token. The same component marks one state with a state token and another with the identity color, so the rule is inconsistent inside a single call to `stageChain()`." },
    { tag: "note", title: "No shared vertical helper", body: "The three inline `.chain` lists and `stageChain()`'s Accept card are hand-written HTML strings in four places. A `chainList(steps)` helper would draw the vertical variant once." },
  ],
  audit: {
    checks: [
      "Structure. The vertical variant is a `ul` of `li`, each with a rule to its left and a dot on the rule. A `div`-based imitation with no list semantics is a FAIL.",
      "Current state. Gold marks at most one step or stage as current on a chain. Every step gold, or none, when the source data has a real current step, is a FAIL.",
      "Stage states. A stage chain's `done` stages use a state token (`--st-allowed`), never gold. Report any stage state colored gold outside the current stage.",
      "Labels. A step label, when present, is a plain noun in sentence case with capitals set by CSS, not typed in capitals in the source.",
      "Stage card. Role, agent (with its avatar), and a sub line naming what the stage owns or its run state, inside a bordered `--ink` card.",
      "Arrow. `.stage-arrow` sits between stage cards on desktop and is hidden on a phone width, where stages stack in one column.",
      "Content. A step or stage state word is visible text beside the color, never color alone.",
      "One implementation. List every place the build draws a vertical or horizontal timeline by hand, with its file and line.",
    ],
  },
};
