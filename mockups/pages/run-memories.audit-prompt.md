# Audit prompt: Run memories

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Memories** tab of a run in Oxagen (`#/a-intel/core-platform/runs/<run id>/memory`) for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/run-memories.md`, and `mockups/pages/run.md` for the header, Summary, stat row, tab bar and side column this tab shares. Read both first, in full.
2. The design, rendered: the stories `Oxagen / Runs / Memories` (Loaded, Loaded · mobile) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/runs/run_01K5RK7C2V8BNM3X/memory`. Add `&as=priya` to read the self-grade as someone who holds `research.read`. The other cases are `run_01K5RS7M2E8FJ3QW` (live), `run_01K5RF2J7M3EDC5F` (sealed, no memories) and `run_01K4QJ9E4T6YUI1O` (self-grade deleted).
3. The product spec: `docs/fleet-operations-wedge.md` (D4, D5, D8, D10), `mockups/pages/steering-source.md` (a memory's page) and `mockups/pages/steering-proposals.md` (the proposal a memory becomes).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/runs/<run id>/memory`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route.** `/runs/<run>/memory` opens this tab with Memories selected, and reloading keeps the tab.
2. **Shared parts.** The header, Summary, stat row, tab bar and side column match `run.md` (run its checks 2 to 5 here, or cite that audit). The tab bar has five tabs, and Memories carries the count of memories the run wrote, blank when it wrote none.
3. **Order.** The tab reads, top down: the lead note, Memories from this run, then Self-grade. Nothing else.
4. **Lead note.** The note names oxagen as the writer, says a memory is written after the seal, and states the fold setting of 3 sayings from 2 runs. Quote it against the spec.
5. **Table.** "Memories from this run" with a count badge and the columns Memory · Frame · Fold · Class · In the assembler, sorted by frame. Memory shows the body, this run's saying in quotes and who said it. Fold shows "new" with "this run started it", or "joined" with "saying k of n", and "proposed as <id>" when the memory became a proposal. On `run_01K5RK7C2V8BNM3X` the rows are frames 31, 37 and 58, and the third reads "proposed as prp_01K5RX1N".
6. **In the assembler.** Each row reads "superseded" with a link to the source that replaced it, "yields" with a link to a published must, or "competes". The reading matches what the Decision trace does with that memory on a run that received it.
7. **Empty and unsealed.** On `run_01K5RS7M2E8FJ3QW` the table is replaced by "Nothing is written until the seal. This run is live. …". On `run_01K5RF2J7M3EDC5F` it is replaced by "This run wrote no memories. …". A build that writes a memory before the seal is a FAIL.
8. **Memory dialog.** A row opens the memory: Class and force, Scope, Where it came from, Recalled, Cost, In force since, the Sayings list and the fold line. A run saying links to that run's Memories tab. An imported saying shows its file and line with "imported". The fold line for an imported saying says it counts toward the sayings and never toward the runs. The footer holds Close, Forget, and one gold action: "Open the proposal" when the memory was proposed, otherwise "Promote to a record".
9. **Forget.** `memforget` names what stops, the recall count, and says the runs that carried the memory are untouched. Forgetting never edits a run's frames.
10. **Self-grade states.** Unsealed or ungraded: "Captured after the seal. …". Deleted (`run_01K4QJ9E4T6YUI1O`): "Deleted on 2025-12-29, 180 days after capture. …". Locked, as Marcus: "Reading a self-grade takes research.read", the Captured, Rubric, Model, Cost and Retention list, "Request access" (gold) and "How reflection works". Readable, as Priya: four question blocks with "self" and "the record" bars out of 5, the quoted answer, "the record says: …", "calibration gap" where self exceeds the record by 2 or more, and the research-only note, with no buttons.
11. **Self-grade conflict.** The spec names the Self-grade panel as an open conflict with the wedge, which deleted skill reflection. Record it as a note, not a fail. A build that renders the panel before a maintainer decides is a note too. "How reflection works" landing on the skills list is part of the same note.
12. **Rollups.** The tab count equals the count badge and the rows. The memory dialog's "saying k of n" matches the Sayings list. A typed or seeded figure is a FAIL.
13. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows read the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named. A fixture reaching production is a FAIL.
14. **States.** The design has the loaded state, with the four run cases. The build uses the shell's standard loading, error and denied panels. Each replaces the page body, never the shell, and loading never flashes zeros.
15. **Mobile.** At 390 × 844 with a touch pointer: the table becomes labelled cards, the self-grade blocks stack, the memory dialog is a bottom sheet, the page never scrolls sideways, and hit areas are at least 44 px.
16. **Accessibility.** Each self-grade bar has a text value ("3 / 5"). State is never colour alone: "calibration gap" is a word, not only a red bar. The table and the dialog work by keyboard end to end.
17. **Permissions.** Reading requires `list_memories`, checked server-side. `promote_memory` is gated server-side. A self-grade is readable only with `research.read`. Verify with a role that lacks each.
18. **Rules.** No person is scored or ranked, and the self-grade never feeds a score, a memory, a proposal or steering. No heading or label carries a comma, a mid-dot, or a not/never contrast. One gold action per screen.
19. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Run memories audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
