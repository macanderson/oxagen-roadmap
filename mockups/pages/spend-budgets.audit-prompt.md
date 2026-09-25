# Audit prompt: Spend budgets

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Budgets** view of Spend in Oxagen (`#/a-intel/core-platform/spend/budgets`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/spend-budgets.md`. Read it first, in full, and `mockups/pages/spend.md` for the header, tiles and tabs this view shares.
2. The design, rendered: the `Oxagen / Spend / Budgets` stories in Storybook (`npm run storybook`): Loaded and Loaded · mobile. Or open `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/spend/budgets`.
3. The design authority: `docs/fleet-operations-wedge.md` (D10), `docs/fleet-operations-ia.md` (Spend), `docs/mission-control-spec.md` §12.5 (budgets).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/spend/budgets`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/spend/budgets` with the Budgets tab selected and its count equal to the rows in the table. Spend is lit in the sidebar with no count. The breadcrumb ends on Spend.
2. **Header, tiles and tabs.** As `spend.md`: Export report, and Set a budget as the one gold action; the four tiles; Overview · Budgets (N) · Optimization.
3. **Budgets panel.** Heading "Budgets" with a small, non-gold Set a budget beside it. Search, the Period and Mode filters, Rows and a pager. Columns in order: Scope · Period · Limit · Used · Mode · Position · row actions. Missing or renamed columns are FAILs.
4. **Rows.** One row per ceiling that governs this workspace: the organization's, this workspace's, and each agent's per-run ceiling in this workspace. A row for another workspace is a FAIL. Mode is a badge with its word. Position is a bar over the percentage, red above 80%. Each row has Edit and Remove.
5. **The enforcement note.** The build's note says where each ceiling is checked and at which tier: the admission gate for the organization and workspace ceilings, and the loopback model proxy for an agent's per-run ceiling, both for calls routed through Oxagen. A note that claims a check at each checkpoint, or a stop on the `observe` or `harness` tier, is a FAIL.
6. **Set a budget.** The dialog offers the scopes, periods and modes a contract accepts: the organization or this workspace, monthly or a rolling window in days, a limit in USD stored as micros, and enforced or not. An option the backend cannot store (an operator scope, a daily or per-run period on a budget row, soft mode) is absent or marked not available. Saving is `set_spend_budget`, passes IAM, lands in Audit, and replaces the ceiling its scope already has.
7. **Edit.** The dialog is filled from the row, and says that a lower limit applies from the next check and that a limit below Used reads as breached at once. Saving is `set_spend_budget`.
8. **Remove.** The confirm says the scope has no ceiling afterwards, that runs stay metered, and that recorded spend stays on the ledger, and warns on a hard ceiling. No capability deletes a ceiling today: the build either disables a ceiling with `enabled: false` and says so, or marks Remove as not available. A Remove that appears to work and changes nothing is a FAIL.
9. **Figures.** Used reads the recorders' running counter or the rollup, and no projection is shown as spent. Position equals Used over Limit. Nothing prints a zero it was not given.
10. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. The organization and workspace ceilings are wired to `get_spend_budget`. An agent's per-run ceiling may read from the agent definition, and its Used and Position print "not recorded" until a read carries them. Every ❌ row renders as not recorded or is absent. A fixture reaching production is a FAIL.
11. **Future-only fields.** Another workspace's ceiling, the operator scope, the daily period, soft mode, Remove and the "Highest run this month" hint are future-only. None may render as if backed.
12. **States.** The design has the loaded state only. The build uses the shell's standard loading, error, empty and denied panels. An empty table says no ceiling is set for this workspace or its organization.
13. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with Spend lit; the table becomes labelled cards with Edit and Remove at each card's foot; the three dialogs are bottom sheets with full-width footer buttons. The Position figure stays readable in the card. Nothing scrolls sideways. Touch targets are at least 44 px and inputs 16 px.
14. **Accessibility.** The dialogs are `role=dialog` with `aria-modal` and a labelled close. State is never colour alone: Mode carries its word and Position its percentage. The page is operable by keyboard end to end.
15. **Permissions.** Read requires `spend.read`. `set_spend_budget` is refused server-side to anyone but org Owner, Admin or Billing, or workspace Owner or Admin for this workspace's own ceiling. Verify with a role that lacks it, and confirm the refusal names who can set it.
16. **Rules.** Check each rule in the spec's last section: frames and SteeringFrames never share a name; no source shown as a frame; Used reads the record; no person scored or ranked; every enforcement claim states its tier; the tab count is a rollup of the rows; plain-noun headings with one-sentence subtext; exactly one gold action; future-only fields render as not recorded.
17. **Nothing extra.** List anything on the built page that is not in the spec. The app's gateway model lists and the recorded session ceiling sit on this tab today and are not in the design: note them for the reviewer.

## Output

Return a single markdown report:

```
# Spend budgets: audit {{DATE}}
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

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
