# Audit prompt: Tools

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Tools** page of Oxagen (`#/a-intel/core-platform/tools[/<tab>]`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/tools.md` (read it first, in full).
2. The design, rendered: the `tools` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. The checker is `node tools/check-mockup.mjs`.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/tools`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route and every tab route; the sidebar (Workspace: Fleet, Agent IAM, Tools, Steering, Repositories, Spend; Organization: Organization, Billing, Audit; the assistant launcher at the foot), breadcrumbs, ⌘K search, notifications, the approvals button, and account are present and match the spec’s shell; the breadcrumb ends on this page. No assistant button in the top bar. The document title names the page.
2. **Header.** Eyebrow is the workspace name, h1 “Tools”, subtext “The registry is the only source of tools an agent can see.” Actions present, in order, with the same labels: Import server · New tool · Flip a kill switch. Exactly one gold (primary) action in the header, New tool.
3. **Summary tiles.** None on any tab. Every count on this page is a rollup of rows you can see: the Tools tab badge, the servers tab caption, and the warning under the server table are recomputed from the tables beneath them (recompute and compare).
4. **Sections, tabs, and tables.** For each item below, the build has it, with the same tab labels (and live counts), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Tabs: Tools (N versions, or “N to approve” in approval colour) · MCP servers (N) · Policy (N) · Kill switches (N on). A tab id no longer served falls back to Tools.
   - Tools: the awaiting-approval banner with Review; Tools (Labels / API names; category chips with counts; Tool version · Server · Category · Hazard · Gate today · Egress · Financial · Schema origin · Digest · On belts · Calls 30d; What the categories mean beside the chips; Import from a server) and the note. A row opens `tool`, the Server cell opens that server. No `verify@1` in the registry.
   - MCP servers: MCP servers (Server · Kind · Tools · Health · Connection · Authorization · Last import; Add a server) with an Authorization badge on every row, the warning that counts expired tokens and passed reviews, and the Credential grants log. A row opens the drill-down and carries Open · Connect or Reconnect · Remove.
   - Server drill-down: the degraded, expired-token and schema warnings; Kind · Schemas · Tool versions · Last import; Authorization (connection, id and kind, badge, scopes, owner with review dates, what the broker mints, grants 30d) with Reconfigure OAuth or Reconnect, Refresh the token, Edit the connection, Disconnect, Revoke; then only that server’s tool versions. A server that holds no credential says there is nothing to authorize.
   - OAuth dialog: Client id · Client secret · Authorization URL · Scopes · the read-only Redirect URL, and Authorize with <server>, which refuses without a client id and an authorization URL.
   - Connections: Connections (Connection · Kind · Owner · Servers · Downscope · Grants 30d · Reviewed · Next review · Status; Add a connection); a row opens its drill and carries Open · Edit · Revoke; the overdue-review warning counts the rows and names none that is gone; Credential grants log (Grant · Tool version · Agent and run · Connection · Scope · TTL · State).
   - Policy: Policy versions (Version · State · Author · When · Rules · Tests · What changed; the header drafts a version; a row carries Open and then, by state, Draft a change when active, Edit · Activate · Discard when a draft, Restore when superseded); the activation note; Conditions a rule may test; the Sequence rule.
   - A draft is the only version that edits or deletes. Editing or discarding an active or superseded version must refuse and offer to draft a change instead. A draft whose tests have not run must not show a pass badge.
   - Kill switches: Class switches with the deny generation badge, and Scoped switches; each switch with its toggle, Blast radius · Takes effect · Flipped by · Reason.
   - The rule dialog: Name · Workspace · Applies to · Minimum tier (select with harness, gateway, contained) · Minimum runs in 30 days (a number) · Amount ceiling · State; the live “N of N agents qualify now” banner recomputing on every change; the floors note; Cancel and Create rule / Save changes. The delete dialog offers Switch off instead.
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`import`, `wz`, `connection`, `tool`, `schema`, `server`, `oauth`, `policynew`, `policyedit`, `policydiscard`, `switch`, `request-access` from denied, `incident` from error), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Approvals button and drawer.** The topbar button is left of the avatar with aria-label “Approvals, N waiting”; it opens `#apdrawer`; Escape closes it; a selected approval card shows the eligibility line naming the matching rule, its first two requirements, and either why the call parked anyway or why the agent does not qualify.
7. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the gap named. A fixture reaching production is a FAIL.
8. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): “No tool server is registered”; no belt, every call by name is `unknown_tool`; import to pull `tools/list`, version it, and store both schemas. Actions: Import from an MCP server, Add a connection.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “Tools could not be loaded”; `503 tool_registry_unavailable`; nothing was changed; runs kept recording; frames are written by the collector on each host. Actions: Try again, Open an incident; a trace id, region, and timestamp line.
   - **access denied** (`state=denied`): “You cannot see the tool registry”; the missing permission `tools.read on core-platform`; an owner can grant it and the grant is a governed action. Actions: Request access, Back to Fleet. Below: Signed in as, Needed, Decided by (`pol_v41` · deny wins over every allow).
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
9. **Trust language.** Every tier, hazard, gate, schema origin, and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows (a rule’s minimum tier is one of harness, gateway, contained, and only contained is described as enforced; nothing says proven, score, or trust band). Money always carries its basis.
10. **Rule qualification.** For each rule, recompute Qualifying now from the agent records (tier at or above the minimum, runs in 30 days at or above the minimum, zero tamper incidents) and compare; the tile counts equal the sums over the cards; the eligibility line on an approval card agrees with the rule that matches its tool. A constant or a typed figure is a FAIL.
11. **Headings.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence.
12. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; the tab strip scrolls in its own row; rule cards stack their rail under the facts; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px.
13. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; the rule switches are `role=switch` with `aria-checked` and a label naming the rule; dialogs are `role=dialog aria-modal` with a labelled close; the Labels / API names and category toggles carry `aria-pressed`; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end.
14. **Permissions.** Read requires `tools.read`; each write (tools.import; tools.schema.approve; connection.add; connection.authorize; connection.revoke; policy.draft / policy.edit / policy.discard / policy.activate; switch.flip) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
15. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Tools audit {{DATE}}
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
