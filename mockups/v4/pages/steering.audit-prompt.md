# Audit prompt: Steering

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering** hub and its Library tab in Oxagen (`#/a-intel/core-platform/steering[/library]`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering.md` (read it first, in full). The shelves and the other tabs have their own specs and audit prompts: `steering-records.md`, `skills.md`, `steering-memory.md`, `steering-ontology.md`, `steering-assignments.md`, `steering-gates.md`, `steering-proposals.md`, and `steering-compiler.md`.
2. The design, rendered: the `steering` stories in Storybook (`npm run storybook`), one per state, desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>`. The checker is `node tools/check-mockup.mjs`.
3. The decisions this hub renders: the story sheet of 2026-09-18, decisions 1, 3, 4, 5, 6, 7, 8, 9, and 13 (Phase 2); the product spec §14 and Appendix F page 8.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route. Steering is lit in the sidebar with its count (proposals waiting plus 1 while an interjection waits). The workspace nav reads Fleet, Agents, Tools, Steering, Runtimes, Repositories, Spend, in that order. No nav item is called “Agent IAM”. There is no Skills nav entry. The breadcrumb ends on Steering. The top bar has the Approvals button left of the avatar, labelled “Approvals, N waiting” with N = pending approvals plus open interjections across the organization; it opens the right-hand drawer `#apdrawer`, a selected row shows the full approval card with Approve and Deny, and Escape closes it. The top bar has no assistant button.
2. **Hub header, chip, and tabs.** Eyebrow is the workspace name, h1 “Steering”, subtext is the one sentence in the spec. The governance chip reads “Governance: <mode>” with the workspace's mode. Five tabs in this order: Library, Assignments, Gates, Proposals, Compiler, with the counts the spec names and none on Compiler. Library is selected on the bare route. Each tab is a URL segment, and reloading the URL lands on the same tab.
3. **The shelf row.** Under the tab strip, on the Library and on Skills only: All, Records, Skills, Memory, Ontology, each with a count, each carrying `aria-pressed`, inside a group labelled “Library shelves”. The row does not render on Assignments, Gates, Proposals, or the Compiler. Picking a shelf writes the hash, and the back button walks the shelves.
4. **Old URLs still land.** `/steering/records`, `/steering/skills`, `/steering/memory`, and `/steering/ontology` each resolve, light the Library tab, and press their own chip. `/steering/library` is the All shelf. `/steering/policy` lands on Gates. `/steering/preview/release-manager` lands on `/steering/compiler/release-manager`. `/steering/prs` lands on Proposals with the Context PRs segment pressed. The old `#/:org/:ws/skills…` routes still resolve.
5. **One tab, one category.** No tab names an artifact kind. No tab mixes an artifact kind with a lifecycle or an assignment. Each tab answers the one question the spec's table gives it.
6. **One gold action.** Write a context record is the one gold action, and a tab that holds its own primary action takes the gold from the header. The chip is not gold. In the empty state the gold is the empty-state button and the header holds none.
7. **The Library, All shelf.** The stat strip has Items, By kind, Compiled size, and Carry a grant, each with the basis line the spec gives. The lead note is verbatim. The **Everything written down** panel is badged with the item count and carries **Who receives it**, which opens Assignments. Columns: Item, Kind, Force, Scope, Compiles to, Token cost, Source, in that order. Order is the assembler's: record, instruction, skill, definition, memory, and within a kind by force. No gate notice appears here. The Items tile, the All chip, and the Library tab badge carry the same number, and that number is the sum of the shelf chips beside All. The Compiles to chip is a button only where the item carries a grant, and it opens Gates.
8. **Two planes.** The page says steering is advisory, ranked, and budgeted, and that gating is deterministic and never budgeted. The Library, Assignments, and the Compiler are the text plane; Gates is the gate plane. No copy says a record is enforced.
9. **The governance dialog.** The chip opens `govmode`: title, subtitle, three cards with the current one marked “· now”, the `governance.toml` preview that follows the pick, the note, Cancel, and Open the Context PR. Confirming opens a Context PR and reports it; picking the current mode reports nothing changed; nothing writes a settings row.
10. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named store; 🟡 rows are wired for the fields that exist and render `NotBacked` for the rest; ❌ rows render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
11. **States.** Force each state and compare copy and controls with the design. In **empty**, the empty state is the tab's own, and on the Library it is the shelf's: the All and Records shelves read “Nothing steers this workspace yet”, Memory reads “Nothing has been recalled yet”, Ontology reads “No ontology notes yet”. In **loading** the shell stays and the body is the skeleton. In **error**, `503 record_index_unavailable` with the three sentences, Try again, Open an incident, and the trace line. In **access denied**, `steering.read on core-platform` with Request access, Back to Fleet, Signed in as, Needed, and Decided by.
12. **Plain nouns.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast; subtext under the h1 is one sentence. Panel badges may carry a mid-dot; headings may not.
13. **Mobile.** At 390 × 844 with a touch pointer: the five tabs are one scrolling strip with the selected tab in view, the shelf row is a second strip on the Library, every list table renders as labelled cards, the page never scrolls sideways, tap targets are ≥ 44 px, inputs are 16 px, More is the lit thumb-bar slot and lists Steering and Runtimes, and the `govmode` dialog is a bottom sheet.
14. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; the shelf row is a group with `aria-pressed` on each chip; the Approvals button carries `aria-pressed` and `aria-controls`; the drawer is `role=complementary` and inert when closed; state is never colour alone; focus is visible; the page is operable by keyboard end to end.
15. **Permissions.** Read requires `steering.read`, checked server-side. Each write (`context.propose`, `context.review`, `context.retire`) is gated server-side. Lowering the governance mode requires an org-owner approval and writes a security event.
16. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding.

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

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
