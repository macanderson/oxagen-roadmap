# Audit prompt: Steering

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering** hub and its Records tab in Oxagen (`#/a-intel/core-platform/steering[/records]`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering.md` (read it first, in full). The six other tabs have their own specs and audit prompts.
2. The design, rendered: the `steering` stories in Storybook (`npm run storybook`), one per state, desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>`. The checker is `node tools/check-mockup.mjs`.
3. The decisions this tab renders: the story sheet of 2026-09-18, decisions 1, 3, 4, 5, 6, 7, 8, 9, and 13 (Phase 2); the product spec §14 and Appendix F page 8.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route. Steering is lit in the sidebar with its count (proposals waiting plus 1 while an interjection waits). There is no Skills nav entry. The breadcrumb ends on Steering. The top bar has the Approvals button left of the avatar, labelled “Approvals, N waiting” with N = pending approvals plus open interjections across the organization; it opens the right-hand drawer `#apdrawer`, a selected row shows the full approval card with Approve and Deny, and Escape closes it. The top bar has no assistant button.
2. **Hub header, chip, and tabs.** Eyebrow is the workspace name, h1 “Steering”, subtext is the one sentence in the spec. The governance chip reads “Governance: <mode>” with the workspace's mode. Seven tabs in this order: Records, Skills, Memory, Ontology, Policy, Proposals, Preview, with the counts the spec names and none on Preview. Records is selected. Each tab is a URL segment, and reloading the URL lands on the same tab.
3. **One gold action.** Write a steering record is the one gold action on Records. The chip is not gold. In the empty state the gold is the empty-state button and the header holds none.
4. **Sections and tables.** The build has each item below with the same headings and every column named, in that order.
   - Published records: badge text verbatim; kind chips All · rule · constraint · procedure · fact · memory · preference with counts; Sort, Rows, and pager; cards newest first; on each card kind, force, constraint effect, token cost, the compilation chip (“compiles to text” or “compiles to text and a gate”), published, Open, then scope, effect line, id, commit, date.
   - The compilation chip with a grant is a button and opens the Policy tab; the text chip is not a button.
   - The closing note, verbatim.
   - On disk: the `.oxagen/` tree with `governance.toml`, `promotions.jsonl`, `skills/`, `ontology/`, `proposals/`, `agents/`, and the Stella symlink note.
   - Injection points: badge “five points · four in use”; five items in order; the fifth dashed and “Not available yet. It needs the gateway tier.”
5. **Actions and dialogs.** Open routes to the record page. Write a steering record opens the record wizard, which ends on a Steering PR listed under Proposals. The chip opens `govmode`: title, subtitle, three cards with the current one marked “· now”, the `governance.toml` preview that follows the pick, the note, Cancel, and Open the Steering PR. Confirming opens a Steering PR and reports it; picking the current mode reports nothing changed; nothing writes a settings row. A stub says what the product would do.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named store; 🟡 rows are wired for the fields that exist and render `NotBacked` for the rest; ❌ rows render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design:
   - **empty** (`state=empty`): the hub header, chip, and tabs stay; the body is “Nothing steers this workspace yet” with the two sentences and Write a steering record.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “Steering could not be loaded”, `503 record_index_unavailable`, the three sentences, Try again, Open an incident, and the trace line.
   - **access denied** (`state=denied`): “You cannot see this workspace’s steering”, naming `steering.read on core-platform`, with Request access, Back to Fleet, Signed in as, Needed, Decided by.
8. **Trust language.** The panel says the Postgres registry is the index, never the graph. The fifth injection point is “not available yet”. No copy says a record is enforced: a record with a grant compiles to a gate, and the gate is described on Policy. No verdict, proof, or witness vocabulary anywhere on the tab.
9. **Plain nouns.** No heading on the built tab carries a comma, a mid-dot, or a not/never contrast; subtext under the h1 is one sentence. Panel badges may carry a mid-dot; headings may not.
10. **Mobile.** At 390 × 844 with a touch pointer: the seven tabs are one scrolling strip and the selected tab is in view; every list table renders as labelled cards; the page never scrolls sideways; tap targets are ≥ 44 px; inputs are 16 px; More is the lit thumb-bar slot; the approvals drawer opens full width and the `govmode` dialog is a bottom sheet.
11. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; grouped toggles use `aria-pressed`; the Approvals button carries `aria-pressed` and `aria-controls`; the drawer is `role=complementary` and inert when closed; state is never colour alone; focus is visible; the tab is operable by keyboard end to end.
12. **Permissions.** Read requires `steering.read`, checked server-side. Each write (`context.propose`, `context.review`, `context.retire`) is gated server-side. Lowering the governance mode requires an org-owner approval and writes a security event.
13. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Steering: audit {{DATE}}
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
