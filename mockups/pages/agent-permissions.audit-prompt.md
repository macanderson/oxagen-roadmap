# Audit prompt: Agent › Permissions

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Permissions** tab of one agent in Oxagen (`#/a-intel/finops/agents/<slug>/permissions`, and `?delegation=<mandate>`): its roles, its budgets, and Delegation, every mandate it holds with the delegation frame each emits. The tab replaces the mandate page. Check it for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/agent-permissions.md`. Read it first, in full. The agent header and the tab bar are specified in `mockups/pages/agent.md`.
2. The design, rendered: the stories `Oxagen / Agents / Permissions` (Loaded, Loaded · mobile, Loaded · future-only fields marked) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/finops/agents/invoice-bot/permissions`, with `?delegation=mnd_7K2ETQ4` on the hash to open one mandate and `&future=1` on the query to outline the future-only fields. For the no-mandate panel, open `#/a-intel/core-platform/agents/triage/permissions`. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (D5, D11, D17, the Frame types row for `delegation`, the Emissions row for Mandate, the Cuts row for the Mandate page), `docs/fleet-operations-ia.md` (Agents) and `docs/fleet-operations-routes.md` (Agents, Tools). ADR-059 in `macanderson/oxagen`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/finops/agents/<slug>/permissions`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The route opens the agent page with Permissions selected; its count equals the mandates held. `/budgets` and `/mandates` show this tab. `/{org}/{ws}/mandates/<id>` answers a lookup 308 to `/{org}/{ws}/agents/<agent>/permissions?delegation=<id>`, and no mandate page exists. `/{org}/{ws}/tools/mandates` answers 308 to Agents.
2. **Roles.** No subtext. Assign a role opens the assign dialog for this agent. The wire joins each held role and the operator into the toolbelt with its width. One row per held role with its permission ids and description, then Resource scope, Spend ceiling (per run and per day) and Can move money ("no · no mandate" without one). With no role, the one "None held" row. No closing note: the subagent rule and why assigning a toolbelt grants nothing are absent from the page and present in `mockups/help/agent-permissions.md`, Roles. No tool is listed on this tab.
3. **Budgets.** No subtext. The breach and fail-open explanation is absent from the page and present in `mockups/help/agent-permissions.md`, Budgets. Set budget opens the budget dialog scoped to this agent. Two meters, "Per-run hard limit" and "Per-day hard limit", each with its figure, bar and caption. Then Mode (it states the agent's tier, as the spec gives it), On a breach and Delegation ceiling (`max_hops 2`).
4. **Delegation.** No subtext, and the badge counting active mandates. One block per mandate held, active or ended. Each header has the id in mono, the status as a dot and a word, the purpose, Change limits and Revoke (danger). Rows Granted by, Window, Effect, Limits, Position (with the bar), Tools, Counterparties, Approval and SteeringFrame. No closing note: the ledger mechanics and the toolbelt gating are absent from the page and present in `mockups/help/agent-permissions.md`, Delegation.
5. **One mandate opened.** With `?delegation=<id>`, that block is highlighted and shows its ledger: When · Call · Amount · State · External · Receipt, state as a dot and a word (settled, reserved, released). Every other block shows Show the ledger, which writes `?delegation=<id>`. An agent with one mandate shows its ledger without the query.
6. **The frame.** Each active mandate shows a `delegation` frame with its id and body naming the purpose, the per-call and per-period limits, the tools, the end of the window and the approval threshold. An ended mandate shows no frame. The same frame appears on the Steering tab's Session start for this agent.
7. **No mandate.** An agent with none shows the heading "No mandate", the badge "cannot move money" and Request a mandate, which files a request for this agent. It carries no subtext and no paragraph. It draws the four-step chain the shipped app draws, labelled "How a financial call from this agent is decided": Call ("a tool call whose version declares a financial class"), Financial class ("read from the tool version’s declared consequence tags"), Mandate lookup ("none for <agent key>") and Decision (Blocked · `no_mandate` · mandate ledger unchanged · no credential minted). A chain with a made-up amount is a FAIL. Why the gate decides in that order is in `mockups/help/agent-permissions.md`, Delegation.
8. **Dialogs.** Change limits opens "Edit <id>" with the agent key and edits that mandate only. Its only note names the second approver. Revoke opens "Revoke <id>?", names what is reserved and released and what settled stays, and keeps the ledger. No note follows the warning. The grant form's Effect carries no hint and no note closes it. The removed dialog notes are in `mockups/help/agent-permissions.md` (Grant a mandate, Change limits, Revoke a mandate). Both are offered on active mandates only. A receipt id opens its receipt. Request a mandate files `request_mandate` for this agent. A dialog that names another agent, or grants instead of requesting, is a FAIL. Each write reaches its contract (`assign_agent_role`, `update_mandate_limits`, `revoke_mandate`, `request_mandate`), passes IAM, writes an audit event and shows a receipt or reference.
9. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it (`list_agent_roles`, `get_agent_role`, `list_mandates`, `get_mandate`, `get_agent_toolbelt`). ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named. A fixture reaching production is a FAIL.
10. **Future-only fields.** The SteeringFrame row renders as not recorded until delegation frames ship. Resource scope, the `max_hops` ceiling, the second approver and the ledger's receipts render as not recorded. Values drawn from fixtures for any of them are a FAIL.
11. **Ledger figures.** For each mandate, settled plus reserved plus remaining equals the period limit; settled equals the sum of the settled rows this period; reserved equals the reserved rows. The Position bar agrees. The Approvals drawer's card for a parked call under this mandate moves the same record. A constant or a typed figure is a FAIL.
12. **Trust language.** A reservation reads reserved until a receipt settles or releases it, and nothing calls a reserved amount spent. Every amount carries its currency. The Budgets Mode row states the agent's tier: on `gateway` and `contained` "Hard limit, blocked at the proxy before the call is sent", otherwise "Hard limit, checked at each checkpoint against reported spend · fail-open". Force an agent on each tier and compare. The long form is in `mockups/help/agent-permissions.md`, Budgets. Nothing says proven, verdict, score or percentile.
13. **States.** The design has the loaded state only. The build uses the shell's standard loading, error, empty and denied panels; each replaces the page body, never the shell, and loading never flashes zeros. A reader without the mandates read sees the mandates as not available, never as none.
14. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. The panels stack; each mandate block's columns stack and its actions wrap; the ledger is cards with labelled cells; dialogs are bottom sheets; nothing scrolls sideways; touch targets are at least 44 px.
15. **Accessibility.** The Position bar has an accessible label stating settled, reserved and remaining; dialogs are `role=dialog aria-modal` with a labelled close; state is never colour alone; focus is visible; the tab works by keyboard end to end.
16. **Permissions.** Reading mandates is limited to the accountable org roles and to workspace members for the agents they created or mandates they requested, checked server-side. `update_mandate_limits` and `revoke_mandate` are refused to a person without the consequence's role. Verify with a role that lacks each.
17. **Rules.** The mandate (a Steering Source) and its delegation frame (a SteeringFrame) are shown apart and labelled. No person is scored or ranked. No heading or label carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. At most one gold action per screen, none on the tab itself.
18. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Agent Permissions audit {{DATE}}
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
