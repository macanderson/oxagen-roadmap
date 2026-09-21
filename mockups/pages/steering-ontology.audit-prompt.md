# Audit prompt: Steering · Ontology

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering · Ontology** tab of Oxagen (`#/a-intel/core-platform/steering/ontology`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering-ontology.md`, and the hub it belongs to, `mockups/pages/steering.md` (read both first, in full).
2. The design, rendered: the `steering-ontology` stories in Storybook (`npm run storybook`), one per state, desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>`. The checker is `node tools/check-mockup.mjs`.
3. The decisions this tab renders: the story sheet of 2026-09-18, decisions 4, 7, and 9.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route. Steering is lit in the sidebar. There is no Skills nav entry. The breadcrumb ends on Steering. The top bar has the Approvals button left of the avatar with the organization-wide waiting count; it opens the drawer `#apdrawer`, a selected row shows the approval card with Approve and Deny, and Escape closes it. No assistant button in the top bar.
2. **Hub header, chip, and tabs.** Eyebrow is the workspace name, h1 “Steering”, the one-sentence subtext, the governance chip “Governance: <mode>”. Seven tabs in this order: Records, Skills, Memory, Ontology, Policy, Proposals, Preview, with counts. This tab is selected. Each tab is a URL segment, and reloading the URL lands on the same tab.
3. **One gold action.** Write a context record in the hub header is the one gold action. The chip is not gold, and neither is New definition.
4. **Sections and tables.** The build has each item below with the same headings and every column named, in that order.
   - The lead note, verbatim.
   - Definitions with its badge and New definition: Term · Kind · Definition · Force · About · Token cost · File, then the row actions.
   - No Index panel. Today, Later and Not here were a roadmap on a working screen and were cut; the one fact kept from them, that a note is a file somebody wrote and somebody merged, is in the lead note.
5. **Actions.** Write a context record opens the record wizard. A row opens `ontology`, which reads the note out and carries Edit and Retire; the row carries the same two.
   - `ontnew` takes Term, Kind (term, entity, alias, boundary), Definition with the wand, and About. A note with no term or no definition is refused, and so is a second definition of a term this workspace already defines. The wand rewrites what you wrote and does not decide what the term means.
   - `ontedit` takes the same four fields and refuses when a removal is already open, saying to close that pull request first.
   - `ontretire` names the file it removes and refuses a second retirement.
   - Each of the three opens a pull request against `a-intel/platform` that adds, modifies or removes `.oxagen/ontology/<term>.toml`, and the row changes the moment it opens. A note being retired reads `retiring` in its Force cell and keeps informing the model until the removal merges. A screen that shows the note gone before the merge is a FAIL.
   - Token cost is computed from the words of the definition. Recompute it and compare; a written-in number is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named store; 🟡 rows are wired for the fields that exist and render `NotBacked` for the rest; ❌ rows render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design:
   - **empty** (`state=empty`): the hub header, chip, and tabs stay; the body is “No ontology notes yet” with its sentences and Write a context record.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “Steering could not be loaded”, `503 record_index_unavailable`, Try again, Open an incident, and the trace line.
   - **access denied** (`state=denied`): “You cannot see this workspace’s steering”, naming `steering.read on core-platform`, with Request access and Back to Fleet.
8. **Trust language.** No copy names an ontology engine or a connector. The index today is the Postgres registry. A note grants nothing. No verdict, proof, or witness vocabulary.
9. **Plain nouns.** No heading on the built tab carries a comma, a mid-dot, or a not/never contrast; subtext is one sentence.
10. **Mobile.** At 390 × 844 with a touch pointer: the seven tabs are one scrolling strip and the selected tab is in view; the table renders as labelled cards; the page never scrolls sideways; tap targets are ≥ 44 px; inputs are 16 px; More is the lit thumb-bar slot.
11. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; grouped toggles use `aria-pressed`; state is never colour alone; focus is visible; the tab is operable by keyboard end to end.
12. **Permissions.** Read requires `steering.read`, checked server-side. `context.propose` is gated server-side.
13. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Steering · Ontology: audit {{DATE}}
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
