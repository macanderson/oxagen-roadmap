# Audit prompt: Tools

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Tools** page of Oxagen (`#/a-intel/core-platform/tools[/<tab>]`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/tools.md` (read it first, in full).
2. The ontology the page implements: `docs/agent-ontology-ia.md`, sections “A provider is not an MCP server”, “Toolbelt assignment is not permission”, “Tools”, and “Words”.
3. The design, rendered: the `tools` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. The checker is `node tools/check-mockup.mjs`.
4. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
5. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/tools`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route and every tab route; the sidebar (Workspace: Fleet, Agents, Tools, Steering, Runtimes, Repositories, Spend; Organization: Organization, Billing, Audit; the assistant launcher at the foot), breadcrumbs, ⌘K search, notifications, the approvals button, and account are present and match the spec's shell; the breadcrumb ends on this page. No nav item reads “Agent IAM”. No assistant button in the top bar. The document title names the page.
2. **The servers alias.** `#/a-intel/core-platform/tools/servers` resolves and lands on **Providers**, with Providers selected in the tab strip and the Providers panel rendered. It must not fall back to Tools, 404, or redirect to a dead route. Check the same for any `?tab=servers` form the build accepts.
3. **Provider vocabulary.** Search the rendered DOM and the build's source for “MCP server”, “MCP servers”, “Server” as a tab, heading, panel title, column header, button label, or empty-state copy on this page. Every hit is a FAIL. `mcp` is allowed in exactly three places: a Transport cell value, the Transport select in the edit dialog, and prose about the importer that reads `tools/list`. Record each hit with its selector and text.
4. **Transport is a column.** The Providers table has a **Transport** column carrying one of `mcp`, `http`, `graphql`, `sdk`, `cli`, `native`, `local`, `rpc`, with the wire and the endpoint beneath it. The provider's identity cell is the system name (GitHub, Stripe, Harness-native tools), never the transport. The edit dialog offers all eight transports and the five wires (`streamable-http`, `https`, `stdio`, `in-process`, `hook`). A provider whose transport is not `mcp` renders the same columns, the same drill-down and the same actions as one whose transport is `mcp`; open one of each and compare.
5. **Header.** Eyebrow is the workspace name, h1 “Tools”, subtext “The registry is the only source of tools an agent can see.” Actions present, in order, with the same labels: Import provider · New tool · Flip a kill switch. Exactly one gold (primary) action in the header, New tool.
6. **Summary tiles.** None on any tab. Every count on this page is a rollup of rows you can see: the Tools tab badge, the Toolbelts badge (“N belts · N tool versions”), the Providers caption, and the warning under the Providers table are recomputed from the tables beneath them (recompute and compare).
7. **Sections, tabs, and tables.** For each item below, the build has it, with the same tab labels (and live counts), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Tabs: Tools (N versions, or “N to approve” in approval colour) · Toolbelts (N) · Providers (N) · Policy (N) · Kill switches (N on). A tab id no longer served falls back to Tools.
   - Tools: the awaiting-approval banner with Review; Tools (Labels / API names; category chips with counts; Tool version · Provider · Category · Hazard · Gate today · Egress · Financial · Schema origin · Digest · Toolbelts · Agents · Calls 30d; What the categories mean beside the chips; Import a provider) and the note. A row opens `tool`, the Provider cell opens that provider, and the Toolbelts cell names every belt carrying the version. No `verify@1` in the registry.
   - Toolbelts: Toolbelts (Toolbelt · Owner · Tools · Providers · Agents assigned · Gates on its tools · Availability today · Updated; New toolbelt) and the note that assignment is not a permission; then Assignments (Agent · Toolbelts · Tool versions · Providers · Tier). A belt no agent carries reads “unassigned”, not `0` and not blank.
   - Toolbelt drill-down: the unavailable-versions warning where one applies; Owner · Providers · Agents assigned · Gates on its tools; Tool versions on this belt (Tool version · Provider · Hazard · Gate today · Calls 30d); Remove, Assign to an agent, Edit tools. A version not in the registry says a call by that name is `unknown_tool`.
   - Providers: Providers (Provider · Transport · Tools · Toolbelts · Agents · Health · Connection · Authorization · Last import; Add a provider) with an Authorization badge on every row, the transport note, the warning that counts expired tokens and passed reviews, and the Credential grants log. A row opens the drill-down and carries Open · Connect or Reconnect · Remove.
   - Provider drill-down: the degraded, expired-token and schema warnings; System · Transport · Registry name · Schemas · Tool versions · Toolbelts · Agents reached · Last import; Authorization (connection, id and kind, badge, scopes, owner with review dates, what the broker mints, grants 30d) with Reconfigure OAuth or Reconnect, Refresh the token, Edit the connection, Disconnect, Revoke; then only that provider's tool versions. A provider that holds no credential says there is nothing to authorize.
   - OAuth dialog: Client id · Client secret · Authorization URL · Scopes · the read-only Redirect URL, and Authorize with <provider>, which refuses without a client id and an authorization URL.
   - Connections: the Connection cell opens `conn` (Owner · Servers · Downscope · What the broker mints · Grants 30d · Reviewed and next review, recent grants, Revoke · Mark reviewed when due · Edit); Credential grants log (Grant · Tool version · Agent and run · Connection · Scope · TTL · State).
   - Policy: Policy versions (Version · State · Author · When · Rules · Tests · What changed; the header carries the store name `tools.policy_versions` and drafts a version; a row carries Open and then, by state, Draft a change when active, Edit · Activate · Discard when a draft, Restore when superseded); the activation note; Where a version lives (Store · In regulated mode · Compiled from · Who reads it · What it writes); Conditions a rule may test; the Sequence rule with a plain sentence above it. The page names no policy language; naming one is a FAIL.
   - A draft is the only version that edits or deletes. Editing or discarding an active or superseded version must refuse and offer to draft a change instead. A draft whose tests have not run must not show a pass badge.
   - Kill switches: Class switches with the deny generation badge, and Scoped switches whose header carries Create a switch; each switch with its toggle, Blast radius · Takes effect · Flipped by · Reason.
   - The create dialog (`switchnew`): Scope (Agent, Enrolled device, Operator’s agents) · Target · a blast radius that recomputes as either changes · Why it exists; Cancel and Create it. A new switch is created allowing, and a second switch on a target something already covers must be refused.
   - The organization, workspace and class switches ship with the workspace and must refuse both Edit and Remove. A switch you created carries Edit and Remove on its card, and removing one that is denying must refuse and offer to clear it first.
8. **The chain reads both ways.** Pick one toolbelt row and follow it: its Providers cells reach the provider drill-down, and its Agents assigned cells reach that agent's Toolbelt tab. Pick one provider row and follow its Toolbelts cell into a belt, then that belt into an agent. Pick one tool row and follow its Provider cell into a provider. Every leg must be a link or a button, not plain text; a dead end on any leg is a FAIL.
9. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`import`, `wz`, `connection`, `tool`, `toolcats`, `schema`, `belt`, `beltnew`, `server`, `serveredit`, `serverdel`, `oauth`, `conn`, `connedit`, `connrevoke`, `policynew`, `policyedit`, `policyver`, `policyactivate`, `policydiscard`, `policyrestore`, `switch`, `switchnew`, `switchedit`, `switchdel`, `request-access` from denied, `incident` from error), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
10. **Approvals button and drawer.** The topbar button is left of the avatar with aria-label “Approvals, N waiting”; it opens `#apdrawer`; Escape closes it; a selected approval card names the tool or amount, the agent, its badges and its countdown.
11. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the gap named. Toolbelts and toolbelt assignments have no store: check that the build says so rather than showing an empty table as if no belt existed. A fixture reaching production is a FAIL.
12. **Belt arithmetic.** Recompute from the assignment record: the agents on each belt row, the providers on each belt row, the tool-version count per agent on Assignments, the Toolbelts and Agents cells on each tool row, and the Toolbelts and Agents counts on each provider row. Each must equal what the build renders. A constant, a typed figure, or a count that survives removing a tool from a belt is a FAIL.
13. **Gates and availability.** For each belt, recompute the gate counts from the gate each of its versions meets today (kill switch first, then financial effect, then irreversible side effect, then allow) and compare with the Gates on its tools cell. Availability today must read unavailable exactly when a version is behind a live kill switch or absent from the registry. Flip a kill switch that covers a belt's tool and confirm the belt row and the drill-down both change on the next render.
14. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): “No provider is registered”; no toolbelt, every call by name is `unknown_tool`; importing a provider pulls its tool list, versions each tool, and stores both schemas. Actions: Import a provider, Add a connection.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “Tools could not be loaded”; `503 tool_registry_unavailable`; nothing was changed; runs kept recording; frames are written by the collector on each host. Actions: Try again, Open an incident; a trace id, region, and timestamp line.
   - **access denied** (`state=denied`): “You cannot see the tool registry”; the missing permission `tools.read on core-platform`; an owner can grant it and the grant is a governed action. Actions: Request access, Back to Fleet. Below: Signed in as, Needed, Decided by (`pol_v41` · deny wins over every allow).
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
15. **Trust language.** Every tier, hazard, gate, schema origin, and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows (a tier is one of observe, harness, gateway, contained, and only contained is described as enforced; nothing says proven, score, or trust band). Nothing on Toolbelts calls an assignment a permission or a grant. Money always carries its basis.
16. **Headings.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence.
17. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; More lists Steering, Runtimes, Repositories, Organization, Billing, Audit; the five-tab strip scrolls in its own row; switch cards stack in one column; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px.
18. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; the kill switches are `role=switch` with `aria-checked` and a label naming the switch; dialogs are `role=dialog aria-modal` with a labelled close; the Labels / API names and category toggles carry `aria-pressed`; a clickable row exposes its action to the keyboard and names what it opens; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end.
19. **Permissions.** Read requires `tools.read`; each write (`tools.import`, `tools.provider.edit`, `tools.provider.remove`, `tools.schema.approve`, `toolbelt.create`, `toolbelt.edit`, `toolbelt.assign`, `connection.add`, `connection.authorize`, `connection.revoke`, `policy.draft / policy.edit / policy.discard / policy.activate`, `switch.create / switch.edit / switch.remove / switch.flip`) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
20. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

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

## Vocabulary hits
- <selector> · <text> · <the word the design uses instead>

## Not in the spec
- …

## Data sources not backed (expected NotBacked, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption; open the file or the DOM. Quote the design's copy verbatim when a label differs. A vocabulary hit is always a FAIL, never a note. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
