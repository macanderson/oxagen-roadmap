# Audit prompt: Steering · Memory

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering · Memory** tab of Oxagen (`#/a-intel/core-platform/steering/memory`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering-memory.md`, and the hub it belongs to, `mockups/pages/steering.md` (read both first, in full).
2. The design, rendered: the `steering-memory` stories in Storybook (`npm run storybook`), one per state, desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>`. The checker is `node tools/check-mockup.mjs`.
3. The decisions this tab renders: the story sheet of 2026-09-18, decisions 1, 4, 5, and 9; the product spec §12.6.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route. Steering is lit in the sidebar. There is no Skills nav entry. The breadcrumb ends on Steering. The top bar has the Approvals button left of the avatar with the organization-wide waiting count; it opens the drawer `#apdrawer`, a selected row shows the approval card with Approve and Deny, and Escape closes it. No assistant button in the top bar.
2. **Hub header, chip, and tabs.** Eyebrow is the workspace name, h1 “Steering”, the one-sentence subtext, the governance chip “Governance: <mode>”. Seven tabs in this order: Records, Skills, Memory, Ontology, Policy, Proposals, Preview, with counts. This tab is selected. Each tab is a URL segment, and reloading the URL lands on the same tab.
3. **One gold action.** Write a context record in the hub header is the one gold action. The chip is not gold.
4. **Sections and tables.** The build has each item below with the same headings and every column named, in that order.
   - The aggregation strip: Memories, Sources, Recalled 30d, By class, each with the basis line the spec quotes.
   - The precedence note, verbatim: a published must beats recalled memory.
   - Recalled memory table with its badge, the row count: Memory · Class · Force · Scope · Last recalled · Token cost · In the assembler. No filters and no pager.
   - In the assembler renders competes, yields (linking the must that wins), or superseded (linking the record).
   - Every row opens the `memory` dialog, by click, Enter, and Space.
   - `memory` names Class, Scope, Where it came from, Recalled, Cost, and In force since, says in one sentence where the memory sits against a published record, and offers Close, Forget, and Promote to a record. Forgetting confirms first (`memforget`), says every frame stays, names the recall count, and drops the row. Promoting opens the record wizard with the memory's words already in the description.
   - The footer button and the sentence beside it.
5. **Token figures reconcile.** Memories equals the row count. Recalled 30d equals the sum of the recalls column. Tokens delivered equals the sum over rows of token cost times recalls. By class counts equal the Class column. Any figure typed rather than derived is a FAIL.
6. **Actions.** See one yield in Preview opens Preview with the merge prompt, and the yielding memory is in the manifest cuts as lower precedence.
7. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named store; 🟡 rows are wired for the fields that exist and render `NotBacked` for the rest; ❌ rows render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
8. **States.** Force each state and compare copy and controls with the design:
   - **empty** (`state=empty`): the hub header, chip, and tabs stay; the body is “Nothing has been recalled yet” with its sentence and no action.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “Steering could not be loaded”, `503 record_index_unavailable`, Try again, Open an incident, and the trace line.
   - **access denied** (`state=denied`): “You cannot see this workspace’s steering”, naming `steering.read on core-platform`, with Request access and Back to Fleet.
9. **Trust language.** Memory is never shown in the stable prefix and never shown as binding. No verdict, proof, or witness vocabulary.
10. **Plain nouns.** No heading on the built tab carries a comma, a mid-dot, or a not/never contrast; subtext is one sentence.
11. **Mobile.** At 390 × 844 with a touch pointer: the seven tabs are one scrolling strip and the selected tab is in view; the tiles wrap; the table renders as labelled cards; the page never scrolls sideways; tap targets are ≥ 44 px; inputs are 16 px; More is the lit thumb-bar slot.
12. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; grouped toggles use `aria-pressed`; state is never colour alone; focus is visible; the tab is operable by keyboard end to end.
13. **Permissions.** Read requires `steering.read`, checked server-side. There are no writes on this tab.
14. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Steering · Memory: audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
