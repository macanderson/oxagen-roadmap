# Audit prompt: Steering · Library · Records

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Records** shelf of the Steering library in Oxagen (`#/a-intel/core-platform/steering/records`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering-records.md` (read it first, in full), and `mockups/pages/steering.md` for the hub, the chip, the tabs, and the shelf row.
2. The design, rendered: the `steering-records` stories in Storybook (`npm run storybook`), one per state, desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>`. The checker is `node tools/check-mockup.mjs`.
3. The decisions this shelf renders: the story sheet of 2026-09-18, decisions 1, 3, 4, 5, 6, 7, 8, and 9; the product spec §14 and Appendix F page 8.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** `/steering/records` resolves, lights the **Library** tab, and presses the **Records** chip. The workspace nav reads Fleet, Agents, Tools, Steering, Runtimes, Repositories, Spend. The breadcrumb ends on Steering. The Approvals button and its drawer behave as `steering.md` specifies.
2. **Hub, tabs, and shelf row.** The header, the governance chip, the five tabs (Library, Assignments, Gates, Proposals, Compiler), and the shelf row (All, Records, Skills, Memory, Ontology) are all present, with Library selected and Records pressed.
3. **One gold action.** Write a context record is the one gold action. The chip is not gold. Import Markdown sits before it and is plain. In the empty state the gold is the empty-state button.
4. **Published records.** Kind chips All, rule, constraint, procedure, fact, memory, preference, each with a count and `aria-pressed`. Sort (Shown order, Statement A–Z, Statement Z–A), Rows (5, 10, 25, 50, All), and the pager. Cards are newest first and the statement is the headline.
5. **The record card.** Kind badge, force, constraint effect where it has one, token cost, the compilation chip, the state badge published (or “new · bundle vN”), and Open. The meta line: scope, the effect line, the lineage id, the commit, and the publication date.
6. **The compilation chip.** Two values only: “compiles to text” and “compiles to text and a gate”. The second is a button and opens the **Gates** tab, not a tab called Policy. The text chip is not a button. The gate chip carries a dot and the text chip does not, so state survives greyscale.
7. **The closing note** is verbatim, and it names Gates, not Policy.
8. **On disk.** The `.oxagen/` tree with `governance.toml`, `promotions.jsonl`, `skills/`, `ontology/`, `proposals/`, `agents/`, and the Stella symlink note.
9. **Injection points.** Badge “five points”, the lead sentence verbatim, and five items in order with the copy the spec gives.
10. **Actions and dialogs.** Open routes to the record page. Write a context record opens the record wizard, which ends on a Context PR listed under Proposals. Import Markdown opens the Markdown import, which puts the records accepted from one source file into one Context PR on `context/import-<file slug>`. A line that overlaps a published record by 50% or more starts rejected with “Already published as <record> (N% word overlap).” Nothing on this shelf writes to the registry.
11. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named store; 🟡 rows are wired for the fields that exist and render `NotBacked` for the rest; ❌ rows render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
12. **States.** Force each state and compare copy and controls with the design: **empty** keeps the header, the chip, the tabs, and the shelf row and reads “Nothing steers this workspace yet”, with Import Markdown (plain) and Write a context record (gold); **loading** keeps the shell and shows the skeleton; **error** is `503 record_index_unavailable` with Try again, Open an incident, and the trace line; **access denied** names `steering.read on core-platform` with Request access, Back to Fleet, Signed in as, Needed, and Decided by.
13. **Trust language.** The panel says the Postgres registry is the index, never the graph. No copy says a record is enforced: a record with a grant compiles to a gate, and the gate is described on Gates. No verdict, proof, or witness vocabulary anywhere on the shelf.
14. **Plain nouns.** No heading carries a comma, a mid-dot, or a not/never contrast; subtext under the h1 is one sentence.
15. **Mobile.** At 390 × 844 with a touch pointer: the tabs and the shelf row are two scrolling strips with the selected items in view, cards stack, the page never scrolls sideways, tap targets are ≥ 44 px, inputs are 16 px, and More is the lit thumb-bar slot.
16. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; the shelf chips and kind chips carry `aria-pressed`; state is never colour alone; focus is visible; the shelf is operable by keyboard end to end.
17. **Permissions.** Read requires `steering.read`, checked server-side. Each write (`context.propose`, `context.review`, `context.retire`) is gated server-side. The Markdown import footer names `steering.write · memory.write`. The mockup checks neither before the wizard opens, so record the missing check as a note.
18. **Nothing extra.** List anything on the built shelf that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Steering · Library · Records: audit {{DATE}}
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
