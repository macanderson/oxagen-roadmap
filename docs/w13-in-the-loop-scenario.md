# W13: in the loop

| | |
|---|---|
| **Status** | In the master; not in the spec yet |
| **Mockup** | `mockups/missioncontrol.html#/a-intel/core-platform/scenarios/in-the-loop/1`, and the W13 story in Storybook |
| **Owner** | Mac Anderson |

**Wow moment.** An agent starts a run in a repository nobody has bound. Because skills are on,
there is a config to resolve and nothing to resolve it against — so Oxagen stops the loop before
the first model call and puts the question to a person *through the agent*. The operator answers in
the agent's own window, the run continues, and the pause, the question, the wait and the answer are
all frames in the same chain as the work.

The claim underneath it: **Oxagen has a seat in the loop, and here is what it does with it.**

---

## The three things this scenario proves

1. **Skills ship off.** `skills.enabled = false` is the value a workspace is *created* with, not a
   value somebody set afterwards. The scenario proves it twice: once by opening a workspace that
   never turned them on, and once by creating a brand-new workspace mid-run and watching it come up
   with skills off in the middle of a run that was asking for skills.

2. **The search is the config, not the model.** `search_skills` is a door, not a list. What comes
   back is decided by `.oxagen/skills.toml` — its sources, its scope rules, its cut-off and its
   budget. A skill that is out of scope or whose digest changed is not a low-ranked result; it is
   not a result. The agent is told the *count* withheld and the *reason class*, never the name,
   because a withholding that names what it withholds has not withheld it.

3. **The seat is usable, and fenced.** Being in the loop lets Oxagen ask a question, stop before a
   guess, and ask the agent to reflect on its own work. That last one is the sharp edge, so the
   mockup spends a whole tab on the fence: a captured self-grade is research-only, cannot enter a
   context frame, cannot be promoted to steering, is billed as overhead rather than productive
   spend, needs an organization-level grant to read, and expires.

---

## Where this sits against the spec

§ 2 of the mission-control spec says Oxagen is *not* a coding-agent runtime and has **no skills
engine**. This scenario keeps that cut rather than reversing it:

> Oxagen does not run skills. The harness runs them. What Oxagen governs is **resolution** — which
> skills a workspace's config lets an agent find, which it may load, what that cost, and what was
> held back and why.

That is the same shape as the toolbelt in W9: Oxagen holds no credential and runs no tool, and still
decides every call. Adopting W13 means § 2 needs one sentence distinguishing *running* a skill from
*resolving* one; it does not need the "no skills engine" line removed.

**New vocabulary.** `skill`, `skill source`, `skill config`, `skill resolution`, `interjection`,
`reflection`, `quarantine`. **New frame kinds.** `skills.searched`, `skills.loaded`,
`skills.resolved`, `repo.unknown`, `repo.bound`, `control.interject`, `control.answer`,
`workspace.created`, `reflection.captured`.

---

## The walk — six beats

Open **Scenarios → In the loop** in `mockups/missioncontrol.html`, or the W13 story in Storybook. The rail walks the
beats in order; each beat below names its rail step and the route it lives on, and the state bar in
the mockup chrome gives the loading, empty, error, denied and phone states of every screen.

### 1. The default (≈40s)

Rail step 1 — `#/a-intel/finops/skills`.

> "This is a workspace with skills off. Not disabled by an admin — this is what a workspace is made
> as. The screen says what turning it on would do and, just as carefully, what it would *not* do:
> it grants no tool, it raises no tier, and it does not reach into a repository this workspace does
> not own."

Point at the table underneath: both workspaces, each with its creation date and the value it shipped
with. The default is visible rather than implied.

### 2. Turning it on is a pull request (≈30s)

Rail step 2 — the same route; the step's action opens the **Turn skills on** dialog.

> "The switch in this dialog is the outcome. The control is the pull request. `.oxagen/skills.toml`
> is a file in `a-intel/platform`, so the person who turned skills on is in the git history and on a
> receipt, and the config a run resolved is a version you can go back and read."

Note the line about runs already in flight: they finish without skills. A run resolves its config
once, at the start.

### 3. The search belongs to the config (≈90s — the technical beat)

Rail step 3 — `#/a-intel/core-platform/skills/search`.

Type nothing; the box already holds `cut the first release notes`. Press **Ask as the agent**.

> "This is not a search box for me. It is the tool the agent holds, answered exactly as the gateway
> would answer it inside a run — same config, same cut-off, same withholding. Three came back.
> Two were withheld."

Then the two withholdings, which are the point:

- **`a-intel.invoice-reconciliation`** — published with `scope = workspace:finops`. It matched the
  query and was dropped *before ranking*.
- **`oxagen.pdf-extract`** — the digest the marketplace served is not the digest Priya approved.

> "The agent is told `withheld: 2` and the reason classes. It is not told these names. Otherwise the
> withholding leaks the thing it is withholding."

Try *"pay an invoice"* for an empty result with a reason — not an error, and not a guess — and
*"extract tables from a pdf"* for the digest case. Finish on the right-hand panel: the
`skills.searched` frame, and the line that replay resolves `skl_v7` rather than today's config.

### 4. The seat in the loop (≈2m — **the wow**)

Rail steps 4 and 5 — `#/a-intel/core-platform` (Fleet, the interjection banner), then `#/a-intel/core-platform/runs/run_01K6QW3D5N7TYBA2`.

> "A run just started in `a-intel/edge-proxy`. Nobody has bound that repository to a workspace. Skills
> are on, so there is a config to resolve and nothing to resolve it against — and Oxagen is not
> going to guess which one applies."

The run is **paused**, not failed and not queued. The clock is not running and nothing has been
charged since 09:14:02Z. Now walk the three panes left to right:

- **Left — what the agent shows Marcus.** The question arrives in the agent's own window, where
  Marcus already is. There is no second inbox to check. The agent is not the author of the question;
  Oxagen is, and the bubble says so.
- **Middle — what Oxagen put to a person.** `repo.unknown`, then `control.interject`, then the two
  paths side by side with their real consequences. Read the second path out loud: *creating a
  workspace ships it with skills off.* The default restates itself in the middle of a run that was
  asking for skills.
- **Right — what was written down.** Seven frames, three of them greyed because they have not
  happened. A run that is waiting has written down that it is waiting.

Pick a path and send it. Either answer is a good demo:

- **Link** → the repo becomes a linked repo of core-platform, resolves `skl_v7`, loads one skill,
  and the frame strip fills in with `repo.bound` → `skills.resolved` → `skills.searched` →
  `skills.loaded`.
- **Create** → workspace `edge` exists, and its `.oxagen/workspace.toml` has **no `[skills]` block
  at all**. The agent gets zero skills, is told so in one line, and says it will put that in the
  pull request so a reviewer knows the work was done without the procedure.

Close the beat on the timeout rule: at 30 minutes an unanswered interjection times out to **deny**.
The safe end of an unanswered question is fewer skills, not more.

### 5. Reflection, and the fence around it (≈90s)

Rail step 6 — `#/a-intel/core-platform/skills/reflect`.

> "Sitting in the loop means we can also ask the agent a question of our own, after the work is
> sealed. This run's verdict was `failing`, and `rfl_v3` always samples a failing run."

The frame strip shows the injected turn as **dashed** — out of band. It sits after the seal, is
excluded from the chain the seal covers, and is not replayed when the run is forked. A fork re-runs
the work, not the grading.

Then the rubric, where two of four axes disagree with the record:

- *"Did you verify it, or did you assert it?"* — the agent gave itself **4**. The witness returned
  `failing` three minutes earlier. The agent never saw it; the airlock passes only the word.
- *"Did you stay inside the scope you were given?"* — the agent gave itself **5**. It read
  `a-intel/mobile` at turn 5, in scope for its belt and outside the scope the operator stated.

> "That gap is the entire research value, and it is also exactly why this data is dangerous. So it
> is fenced."

Scroll to **Quarantine** and read the five rules. The fifth one — it expires — is the one security
reviewers ask about.

### 6. The history (≈30s)

Rail step 7 — `#/a-intel/core-platform/skills/versions`.

Five policy versions, each a pull request. End on the bottom row:

> "core-platform was created on 2026-07-30 with skills off, and stayed off for three days until
> Marcus opened `a-intel/platform#402`. The default is not a first-run nicety. It holds every time a
> workspace is made."

---

## Cut-downs

| Audience | Beats | Time |
|---|---|---|
| Exec / investor | 1, 4 | ~3 min |
| Practitioner | 1, 3, 4, 6 | ~5 min |
| Security review | 1, 3, 5 | ~4 min |
| Full walk | all six | ~6 min |

---

## What is mocked

| Screen | Route | States |
|---|---|---|
| Skills — off (the shipping default) | `#/a-intel/{ws}/steering/skills` with `enabled=false` (the old `…/{ws}/skills` route still resolves, rewritten in place) | loaded, phone |
| Skills — Catalog | `#/a-intel/core-platform/steering/skills/catalog` | loaded, empty, loading, error, denied, phone |
| Skills — Search (`search_skills` console) | `…/steering/skills/search` | loaded (5 query shapes), phone |
| Skills — In the loop | `…/steering/skills/loop` | open interjection, answered, phone |
| Skills — Reflection and quarantine | `…/steering/skills/reflect` | loaded, phone |
| Skills — Versions | `…/steering/skills/versions` | loaded, phone |
| Fleet — interjection queue | `…/fleet` | waiting, answered, empty, loading, error, denied, phone |
| Run — the triptych | `…/runs/{run}` | waiting, picked, answered ×2, loading, error, denied, phone |
| Dialogs | — | turn on, config file, skill detail (×8), add a skill, screens index |

## In the master

Ported on 2026-09-14, and updated 2026-09-18 when Steering became the hub: Skills is now the second
tab of Steering, not its own sidebar entry (`mockups/pages/skills.md`). The master (`mockups/src/engine.js`) has the **Skills** tab (`pSkills()`: Catalog · Search · In the
loop · Reflection · Versions), the off-by-default gate (`skGate()`, rendered for any workspace whose
`SK_ON` is false — FinOps), the interjected run (`pRun()` hands `run_01K6QW3D5N7TYBA2` to
`skRunPage()`, the triptych), an interjection banner on Fleet, Skills in the Steering hub tabs and the mobile
More sheet's Steering entry, four dialogs (`skenable`, `skcfg`, `skill`, `skadd`) and `SCENARIOS["in-the-loop"]` —
the six beats above as seven rail steps (beat 4 is two: Fleet, then the run). The Skills, skills-off and run-interjection pages
are rows in `mockups/catalog.mjs`, so Storybook shows them in every state and `tools/check-mockup.mjs`
walks them; their specs and audit prompts are in `mockups/pages/`. The `screens` index of the hand-drawn original
is replaced by the scenario rail and the state bar. Every W13 class in the master is `sx-` prefixed.

## Known gaps

- **The spec is untouched.** § 19's tables still end at W12 and its status line still reads
  `complete`; § 2 still says "no skills engine" without the run-versus-resolve distinction. Both
  need a decision before W13 is written into the spec.
