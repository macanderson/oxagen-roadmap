# Audit prompt: Agents

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Agents** page of Oxagen (`#/a-intel/core-platform/agents`), the fleet as one population, for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/agents.md`. Read it first, in full.
2. The design, rendered: the stories `Oxagen / Agents / Agents` (Loaded, Loaded · mobile) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/agents`. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (D3, D11, D15, D16, D17 and the Cuts table), `docs/fleet-operations-ia.md` (Agents), `docs/fleet-operations-routes.md` (Agents, Tools) and `docs/fleet-operations-collapse.md` (the Fleet tiles and Steer).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/agents`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route. `/{org}/{ws}/tools/mandates` answers 308 to it. The sidebar lists Work, Agents, Tools, Steering, Runtimes, Spend and Repositories, then Organization, Billing and Audit, with Agents lit and carrying no count. The breadcrumb ends on Agents. The top bar has search with ⌘K, notifications, the Approvals button with the organization-wide count, and the avatar. No assistant button in the top bar.
2. **Header.** Eyebrow the workspace name, h1 "Agents", subtext "Every actor in this workspace and what it is made of." Actions in this order: Steer, New agent, Register agent. Register agent is the one gold action on the screen. There is no Wrap Claude Code button and no Fleet page link.
3. **Tiles.** Exactly four, in this order: Live now, Waiting on you, Spend against budget, Delegations held. Each is one number over one caption. Recompute each from the records it names and compare:
   - Live now: live runs in the workspace, counted the same way Work counts them. The caption carries "<N> parked on a person" only when a run is parked, then "<N> agents registered". Clicking opens Work › Work orders.
   - Waiting on you: pending approvals in this workspace, and those that name no run. Caption "approvals in the drawer", singular at one. Clicking opens the Approvals drawer.
   - Spend against budget: the workspace budget's used share as a percent, over used, limit, mode and period. With no workspace budget, a dash and "no workspace budget set". Clicking opens Spend › Budgets.
   - Delegations held: active mandates held by agents in the workspace, over the holders' slugs or "no agent here holds a mandate".
   No score tile, no proven tile, no runs table.
4. **Column sets.** The panel "Registered in <workspace>" has a group labelled Columns with Composition and Operations, each with `aria-pressed`, exactly one pressed, and Composition pressed on a fresh load. The subtext follows the set: "Each row names the reusable objects this agent holds a reference to." or "Each row is what this agent did and what it cost over the last 30 days." The header shows `.oxagen/agents/ @ <commit>`. Switching changes the columns and never the agents listed.
5. **Composition columns.** Agent · Purpose · Owner · Steering · Toolbelt · Runtime · Principal · Health · Activity · actions, in that order. Steering reads "N items" over "N tok" (with " · not delivered" when the agent earns no hook) or a dash. Toolbelt reads "N belts" over "N tools · full|searchable". Runtime reads the host over "kind · tier", or a dash over the tier. Principal reads `prn_…` or `prn_pending`. Health is one of `tamper`, `not enrolled`, `observe`, `healthy`, decided in that order. Missing or renamed columns are FAILs; extra columns are findings.
6. **Operations columns.** Agent · Harness · Operator · Status · Tier · Belt · Runs 30d · Spend 30d · Tokens 30d · Mandates · Incidents · actions, in that order. Tier is one ladder word. Tokens 30d shows the total over "N% cached". No proven column, no score column.
7. **Rows and list controls.** Every row has Edit, Roles and Deregister (danger), and clicking elsewhere opens the agent's Overview. Edit opens the agent page. The list has search, sortable headers with `aria-sort`, facets derived from the columns in view (a facet naming a column not in view is a FAIL), Rows (5, 10, 25, 50, All) and a pager. The note under the table is verbatim: "An agent has one principal and runs on one runtime. Its steering, its toolbelts and its tools are workspace objects it refers to, so changing one changes every agent that refers to it."
8. **Steer.** Steer opens "Steer the fleet": every agent in the workspace selected by default with All and None, each row with its run in flight and status or "no run in flight · reads this at its next model call", the Steering text, the Delivery block with At the boundary and an Interrupt switch, the two hints, the note that Oxagen never executes steering as an instruction, and the footer "<N> agents · <N> in flight · at the boundary" with Cancel and Steer. With Interrupt on, the send button reads "Send & Interrupt". Sending queues `dispatch_command` `steer` per recipient and opens the delivery report: counts in the title, Applied, Queued and Undelivered, the text with its digest, and a table Agent and run · Status · Mode used · Time · Why. Only `applied` counts as delivered. Confirm with the build that each recipient's status is read from its command row, not assumed.
9. **Other actions and dialogs.** New agent opens the agent wizard (Describe, Identity, Definition, Toolbelt, Pull request) and ends on a pull request adding `.oxagen/agents/<slug>.toml` through `propose_agent`. Register agent opens the Register agent gate, not a dialog. Roles opens "Assign a role" for that agent. Deregister opens "Deregister agent" and ends in `retire_agent`. Each write passes IAM, writes an audit event and shows a receipt or reference. A control that silently does nothing is a FAIL.
10. **Approvals drawer.** The top bar button has `aria-label` "Approvals, N waiting", sits left of the avatar and opens the drawer; Escape closes it. The Waiting on you tile opens the same drawer.
11. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named. A fixture reaching production is a FAIL.
12. **Future-only fields.** The Steering column and the belt count in the Toolbelt column render as not recorded until their contracts ship (an envelope per agent, #3879; stored toolbelts). A belt count or a steering count invented client-side is a FAIL. The computed tool count may render from `get_agent_toolbelt`.
13. **Rollups.** Each tile equals its recount. Live now on Agents equals the live count on Work. Waiting on you equals the pending approvals in this workspace in the drawer. Delegations held equals the sum of the Mandates column over this workspace's agents. Each row's Incidents, its Health, and its agent's Activity tab count read the same incident record the Audit page reads. Each row's Tokens 30d equals the same agent's Overview. A constant or a typed figure is a FAIL.
14. **Trust language.** Every tier, health word and cost basis shows the recorded value. `observe`, `harness`, `gateway` and `contained` appear only where recorded. Nothing says proven, verdict, score or percentile. Money carries its basis where the spec shows one.
15. **States.** The design has the loaded state only. The build uses the shell's standard loading, error, empty and denied panels; each replaces the page body, never the shell, and loading never flashes zeros.
16. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit; More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The tiles go two by two; the Columns toggle keeps its own row; every table row is a card with labelled cells and the row actions at its foot; every dialog is a bottom sheet; nothing scrolls sideways; touch targets are at least 44 px; inputs are 16 px.
17. **Accessibility.** The Columns group is `role=group` with an `aria-label`, both buttons carry `aria-pressed`, sortable headers carry `aria-sort`, the Interrupt switch is `role=switch` with `aria-checked`, dialogs are `role=dialog aria-modal` with a labelled close, state is never colour alone (a dot and a word), focus is visible, and the page works by keyboard end to end.
18. **Permissions.** Reading requires the agents read (`list_agents`). `dispatch_command`, `propose_agent`, `register_agent`, `assign_agent_role` and `retire_agent` are gated server-side, not only hidden. Verify with a role that lacks each.
19. **Rules.** No person is scored or ranked. A frame and a SteeringFrame never share a name on screen. No heading or label carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. Exactly one gold action per screen. A navigation count appears only where something waits on a person.
20. **Nothing extra.** List anything on the built page that is not in the spec (tiles, columns, buttons, copy). Each is a finding.

## Output

Return a single markdown report:

```
# Agents audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
