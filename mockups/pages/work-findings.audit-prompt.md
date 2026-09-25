# Audit prompt: Findings

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Findings** tab of Work in Oxagen (`/a-intel/core-platform/work/findings`), with its Evidence dialog (`?finding=<id>`) and Fix dialog, for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarize what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/work-findings.md` (read it first, in full), and `mockups/pages/work-backlog.md` for the Work header and tabs.
2. The design, rendered: the stories `Oxagen / Work / Findings` (Loaded, Loaded · mobile, Loaded · future-only fields marked), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>[&future=1]#/a-intel/core-platform/work/findings`, and `…/work/findings?finding=fnd_01K5RHD7B` for the Evidence dialog.
3. The product specs: `docs/fleet-operations-wedge.md` (D9, D10, D15, D17), `docs/fleet-operations-routes.md` › Work, `docs/mission-control-spec.md` §12.8, and ADR-062 in `macanderson/oxagen`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/work/findings`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/a-intel/core-platform/work/findings`, and `?finding=<id>` opens that finding’s evidence. `/a-intel/core-platform/spend/findings` and `/a-intel/core-platform/spend?finding=<id>` answer 308 to the Work addresses, the second keeping its finding. Spend shows no findings tab. Work is lit, and the Findings tab is selected with its count of open findings nobody picked up.
2. **Header.** As `work-backlog.md`, with no header action on this tab. A gold control on the tab itself is a FAIL.
3. **Tiles.** At stake, Findings, Evidence and Basis with their captions (Basis reads “at the price each call paid”). No note sits under the card list; how a finding becomes work is in `mockups/help/work-findings.md`, Findings. Recompute At stake as the sum of the listed savings and Findings as the count of cards. The open and in-work split must agree with the cards. A typed figure is a FAIL.
4. **List bar.** Search, the Level facet (agent, operator, tool, workspace), the Confidence facet (high, medium), Sort (Rank; Savings, high first; Savings, low first; Finding A–Z), Rows and the pager. Each control changes the list as its label says.
5. **Cards.** Ranked by the money at stake. Each shows the rank, the kind, the level and confidence badges, the operator and the subject, the why sentence, the evidence line with runs, calls and the window, the saving with “at stake · N% of identified” and its bar, and **Create work item** (or **In work · <number>**), **Evidence** and **Fix**. Every saving shows its recorded basis. No card scores or ranks a person.
6. **Create work item.** It writes a work item with the finding as its source and a drafted definition of done, keeps the tab open, turns the card to **In work · <number>**, and toasts. The work item’s page offers **Open the finding**, which returns here with the evidence open. Verify on the server that the link from the finding to the item is stored, and that a second **Create work item** on the same finding is refused.
7. **Evidence dialog.** Title “Evidence · <kind>” and the subtitle with the id, level, window and basis. The four figures, the runs table (Run · Task · Started · Cost · Wasted · What was wasted) with its total row, How we know with the counterfactual (“Counterfactual: <the alternative>.” and nothing after it), Who is involved, and the footer with **Close** and **Fix** and no sentence beside them. Recompute the total row from the rows: a run listed twice must not count its cost twice. Each row opens its run, and each run is sealed.
8. **Fix dialog.** The shape follows the finding’s kind. The pull request shape shows the branch (“Branch <branch> · one concern per PR”), the Steering record file with the finding as evidence, an Evidence column with the link to the evidence, the six checks, and **Open the pull request**, with no note under the checks (why a pull request is in `mockups/help/work-findings.md`, Fix dialog), which opens the pull request through the proposal path with the finding as supporting evidence. The help article shape shows why it costs money, the before and after code, the steps, the three figures (Where the fix lives with no caption), the footer “oxagen records the change as a definition change when you apply it.”, and the kind’s action, which records `record_finding_fix`. Verify the record: the finding becomes applied with the request id its audit row carries.
9. **Data sources.** For each row of the spec’s Data sources table, find what feeds it in the build. ✅ rows are wired to `list_findings`, `get_finding_evidence` and `record_finding_fix`. 🟡 rows (the operator and agent on a card, the share of spend, the pull request) are wired for what exists and render `not recorded` for the rest. ❌ rows (five kinds, the trend, the in-work link, parts of the evidence, the article) render `not recorded` or are left out, never a zero and never a fixture.
10. **Future-only fields.** **Create work item** and **In work** are left out or say what they will do until the work item link ships. A finding of a kind the job does not detect must not appear. A control that silently does nothing is a FAIL.
11. **States.** The design has the loaded state only. Force loading, error, empty and denied: each must be the shell’s standard panel inside the shell. Record which panel the build uses.
12. **Mobile.** At 390 × 844: the thumb bar (Work, Agents, Tools, Spend, More); the tab strip scrolls inside itself; the tiles sit two by two; each card runs full width with its three actions on one row; the dialogs are bottom sheets with full-width footer buttons and a runs table of labelled cards; nothing scrolls sideways; touch targets at least 44 px.
13. **Rules.** At most one gold action on the screen, and none on the tab itself. No heading, dialog title or caption carries a comma, a mid-dot, or a not/never contrast, and no product copy says “we”. Money shows its basis. Tiles are rollups of the cards. No person is scored or ranked. A finding becomes work only when a person picks it up.
14. **Accessibility.** Cards and their actions are keyboard operable. Dialogs are `role=dialog aria-modal` with a labelled close. State is never colour alone.
15. **Permissions.** `list_findings` and `get_finding_evidence` for reading, as their contracts allow. `record_finding_fix` for org Owner or Admin, gated on the server. **Create work item** gated by the permission its contract names. Verify with a role that lacks each.
16. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding, and the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Findings audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
