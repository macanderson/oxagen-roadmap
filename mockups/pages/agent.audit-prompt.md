# Audit prompt: Agent

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Agent** page of Oxagen (`#/a-intel/core-platform/agents/<slug>[/<tab>]`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/agent.md` (read it first, in full).
2. The design, rendered: the `agent` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. The checker is `node tools/check-mockup.mjs`.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), §12.6 (token classes), §12.7 (attribution), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/agents/<slug>`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route and every tab route; the sidebar (Workspace: Fleet, Agent IAM, Tools, Steering, Repositories, Spend; Organization: Organization, Billing, Audit; the assistant launcher at the foot), breadcrumbs (… / Agent IAM / <slug>), ⌘K search, notifications, the approvals button, and account are present and match the spec’s shell. No assistant button in the top bar. The document title names the page.
2. **Header.** Eyebrow “Agent”, h1 the agent card in the detail layout with no score. Badges: status, tier, “replay <grade>”, “operator <name>”; then the description. Actions present, in order, with the same labels: Edit avatar · Rotate credential · Suspend · Deregister · See the belt as the model sees it. Exactly one gold (primary) action on the screen. No score strip, no auto-approvals note, no proof rate, no business value.
3. **Coaching strip.** Two panels above the tabs. 30-day token use: badge “N tok · $ · <basis>”; eight composition bars in order (Conversation, Tool results, Context frames, Tool definitions, Steering, System, Output, Reasoning) each with tokens and share; Cache hit rate · Per run · Per model call · Basis. Coaching: badge “N from the token record”; at most three items, each a severity badge with a title, a signal line, “$ a month at stake” where there is a figure, and one action button; the empty copy verbatim; the footer link to the workspace’s coaching.
4. **Sections, tabs, and tables.** For each item below, the build has it, with the same tab labels (and live counts), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Tabs: Identity · Toolbelt (N) · Mandates (N) · Budgets · Runs · Enrollment · Tamper incidents (N) · Definition in git.
   - Identity: Identity (Agent key · Principal · Kind · Harness · Model tier · Operator · Status · First frame), Credentials (badge “none”; See the connections that mint them), Run credential (Key · Purpose lock · Issued · Last used · Run tokens · Host device key; Change identity, Revoke credential), Roles (the ∩ formula; Resource scope · Spend ceiling · Can move money; Assign a role), Tier delivery (the four-rung ladder with “this agent” on the earned rung and no rung marked not yet available; Model calls · MCP tool calls · Harness-native tools · Budgets · Steering · Credentials held by this agent · Replay · Tamper incidents; the note verbatim), Definition in git (Path · Repo · Commit · `definition_digest` · Generated beside it; Open the file).
   - Toolbelt: Belt computation (Searchable belt / Full belt), Model view, Belt search (five queries, Run), Per-tool decision rules (By category / Flat, What the categories mean): Tool · Category · Decision · Hazard · Egress · Financial · Schema digest; Off the belt (Tool · Reason).
   - Mandates: Mandates held (Mandate · Effect · Per call · Per period · Remaining · Expires · Status), or No mandate with Request a mandate.
   - Budgets: Budgets (the lead sentence; Mode · On a breach · Spend 30d · Tokens 30d · Productive ratio · Runs 30d · Cost per run; Set budget), Token accounting (Class · Tokens 30d · Rate · Cost), Findings (Evidence, Fix, Open on Spend). No proven spend row.
   - Runs: Run · Status · Tokens · Cost · Frames · Started; Open the audit record. No Verdict column.
   - Enrollment: Host (Device · Device key · Collector · Hook binary · Hooks written · Model proxy · Oxagen MCP server · Settings · Tier earned · Last checkpoint; Run a smoke session), Rollback (Unenroll); an agent with no host offers Wrap it and Show the CLI path.
   - Tamper incidents: one card per incident (What happened · What it stopped · Closed · Owner · Incident; Open on Audit) or the empty panel with Open the incident register; the count equals the Audit page’s.
   - Definition in git: Identity · Model and budget · Tools · Instructions · Harness · Source (Repository · `definition_digest` · At commit · Generated beside it; Open the source) · Changing this agent (Save changes or Open a pull request, Discard).
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`delagent`, `assignrole`, `identity`, `avatar`, `budget`, `evidence`, `fix`, `mandate`, `toolcats`, `commit`, `wrap`, `register`, `request-access` from denied, `incident` from error), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Approvals button and drawer.** The topbar button is left of the avatar with aria-label “Approvals, N waiting”; it opens `#apdrawer`; Escape closes it; a row selected shows the full card with Approve and Deny.
7. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the gap named. A fixture reaching production is a FAIL. Coaching must be derived from the token rollup at read time, never stored as a model’s text.
8. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): “This agent has never run”; registered and enrolled, no frame yet; the belt is computed at run start so there is nothing to show for tools either. Action: Back to Fleet.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “This agent could not be loaded”; `503 iam_principals_unavailable`; nothing was changed; runs kept recording; frames are written by the collector on each host. Actions: Try again, Open an incident; a trace id, region, and timestamp line.
   - **access denied** (`state=denied`): “You cannot see this agent”; the missing permission `agent.read on core-platform`; an owner can grant it and the grant is a governed action. Actions: Request access, Back to Fleet. Below: Signed in as, Needed, Decided by (`pol_v41` · deny wins over every allow).
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
9. **Trust language.** Every tier, replay grade, attestation, and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows (`observe`, `harness`, `gateway`, and `contained` are each shown only where recorded; only `contained` is described as enforced; a self-reported token figure says so in its Basis line; nothing says proven, score, or percentile). Money always carries its basis.
10. **Token figures.** The 30-day token use total equals the sum of its eight bars; the Token accounting rows on Budgets sum to the same total; Tokens 30d on Budgets and the agent’s row on Agent IAM show it too; each coaching item’s tokens and dollars derive from that rollup (recompute one and compare). A constant or a typed figure is a FAIL.
11. **Headings.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence.
12. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; the two coaching panels stack; the tab strip scrolls in its own row; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px.
13. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; the tier ladder is an ordered list with `aria-label`; the belt mode and view toggles carry `aria-pressed`; icon buttons have `aria-label`; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end.
14. **Permissions.** Read requires `agent.read`; each write (agent.credential.rotate/revoke; agent.suspend; agent.deregister; agent.role.assign; budget.set; enrollment.revoke; agent.write) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
15. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Agent audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected NotBacked, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption; open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
