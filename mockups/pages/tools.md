# Tools

| | |
|---|---|
| Route | `#/a-intel/core-platform/tools[/<tab>]` |
| Scope | workspace |
| Spec | §14 Mission Control; Appendix F page 4; `docs/agent-ontology-ia.md` for the provider, toolbelt and transport vocabulary |
| Design | `mockups/src/engine.js` → `pTools()`, with `beltCatalogById`, `beltsOfAgent`, `agentsOfBelt`, `beltsWithTool`, `beltProviders`, `beltToolCount`, `beltGates`, `beltGateCell`, `beltAvailability`, `providerBelts`, `providerAgents`, `AGENT_BELTS`, and `toolGateKind`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / tools`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `tools.audit-prompt.md` |

## Job

Every tool version imported, the provider each came from with the transport it is reached over, the toolbelts that put a tool in front of an agent, policy versions with their tests, and kill switches. A tool is identified by `name@schema-version` everywhere, and a provider is where you authorize, re-import and remove it.

The chain the page has to make obvious, in the order a person reads it, is `Provider → Tool → Toolbelt → Agent`. A provider is the system the tools belong to; the transport is how Oxagen reaches it, and `mcp` is one of eight values a transport may take. A toolbelt is the reusable set of tool versions that many agents are assigned, and it decides what a model is shown rather than what it may call.

Policy and kill switches stay on Tools because both decide a tool call, which is this page's domain; Steering's own gate tab was renamed **Gates** so the two Policy surfaces are not confused.

The vocabulary is fixed: tool, not capability; toolbelt, not toolset; provider, not MCP server. MCP keeps its name where it is the mechanism, which is a provider's transport and the importer that reads `tools/list`.

## What is on the page

**Header**: eyebrow is the workspace name (“Core platform”), h1 “Tools”, subtext “The registry is the only source of tools an agent can see.”
Actions: **Import a provider** (opens `import`: pull `tools/list`, version every tool, store both schemas; three steps Connect → Review tools/list → Classify and import) · **New tool** (opens the tool wizard; gold on Tools and Kill switches, plain where the tab carries its own primary) · **Flip a kill switch** (danger; opens `switch`). A tool belongs to a provider, so every route into a provider passes through the Providers tab, a Provider cell on the Tools tab, or a Providers cell on the Toolbelts tab.

- **Tabs** (`/tools/<tab>`): Tools (N versions, or “N to approve” in approval colour when an observed schema waits) · Toolbelts (N) · Providers (N) · Policy (N) · Kill switches (N on). A tab id that is no longer served falls back to Tools, so an old link never renders an empty page. `#/:org/:ws/tools/servers` is kept as an alias of `#/:org/:ws/tools/providers`.

### Tools tab

- Banner “N awaiting approval: N output schemas were observed, not declared…”, naming the providers that declare no `outputSchema`; **Review** opens `schema`.
- **Tools** panel. Caption: “Every version imported from every provider. RBAC reaches the version, so a provider shipping a new one does not widen a toolbelt.” Panel header carries the Labels / API names toggle, the badge “N of N shown”, and **Import a provider** (opens `import`).
- Category chips with counts sit on their own row across the ten categories, with **What the categories mean** beside them, which opens `toolcats`.
- Table: Tool version · Provider · Category · Hazard · Gate today · Egress · Financial · Schema origin · Digest · Toolbelts · Agents · Calls 30d. The Toolbelts cell lists every belt that carries the version, or a dash when no belt does, and Agents counts the agents those belts reach. Both are derived: `beltsWithTool` and `agentsWithTool` read the assignment record, so removing a tool from a belt changes the row. A row opens `tool`; the Provider cell is a button that opens that provider's drill-down.
- The note: “The gate shown is today's: the version's own kill switch, then its provider's, then `pol_v41`. A toolbelt decides which agents are shown the tool; the gate decides whether the call survives. Open a provider on any row to see what it imported and the connection it is reached with.”

### Toolbelts tab

- **Toolbelts** panel. Caption: “A toolbelt is a named set of tool versions assigned to agents. It decides what a model is shown, and nothing else.” Panel header carries the badge “N belts · N tool versions” and **New toolbelt**, the tab's primary action, which opens `beltnew`.
- Table: Toolbelt · Owner · Tools · Providers · Agents assigned · Gates on its tools · Availability today · Updated. The Toolbelt cell is the name over what the belt is for. The Owner cell is the owning team over the person who last changed it. Providers is derived from the registry entry behind each tool version. Agents assigned reads “unassigned” when no agent carries the belt. Gates on its tools counts the belt's versions by gate: allowed, approval, mandate, killed. Availability today reads “all reachable” or “N unavailable”, over the reason: a version behind a kill switch, a version not in the registry, or both. A row opens `belt`.
- The note: assigning a belt is not a permission, and every call on it still meets the agent's roles, the policy on the tool version, the kill switches, and the mandate ledger. A belt with a red availability has a tool its agents can see and cannot call today.
- **Assignments** panel. Caption: “The same belt reaches many agents, which is what makes a change to it worth reviewing.” Table: Agent · Toolbelts · Tool versions · Providers · Tier. A row opens that agent's Toolbelt tab.
- **Toolbelt drill-down** (`belt`, wide): a warning when a version on the belt cannot be called today, naming how many of how many and why; the belt's own note where it has one; then Owner (with the date and person of the last change) · Providers · Agents assigned (each a button into that agent's Toolbelt tab) · Gates on its tools. **Tool versions on this belt** lists Tool version · Provider · Hazard · Gate today · Calls 30d, and a version that is not in the registry says a call by that name is `unknown_tool`. A closing note repeats that assignment grants nothing. Footer: **Remove** (refused while an agent carries the belt) · **Assign to an agent** (assignment is edited on the agent) · **Edit tools**, which reports how many agents the change reaches at their next session.
- **New toolbelt** (`beltnew`): Name · What it is for · Owner (platform, finops, security), over the note that a belt is a job rather than a category, so a reviewer can tell from the name alone whether an agent should carry it.

### Providers tab

- **Providers** panel. Caption: “N providers hold N tool versions. A provider is the system the tools belong to; the transport is how Oxagen reaches it.” **Add a provider** is the tab's primary action and opens `import`.
- Table: Provider · Transport · Tools · Toolbelts · Agents · Health · Connection · Authorization · Last import. The Provider cell is the system name over what it is. The Transport cell is the transport badge over the wire and the endpoint in mono. Toolbelts lists the belts that reach the provider, Agents counts the agents those belts put in front of it. The Authorization cell is a badge over the token expiry: connected, token expired, key held, role assumed, not connected, or “none needed” for a provider reached in-process or over a harness hook. A row opens `server` and carries **Open** · **Connect** or **Reconnect**, when the provider takes a credential · **Remove**. The Connection cell opens `conn`.
- The note: MCP is one transport among several, a provider reached over `http`, `native` or a harness `local` hook is imported, versioned and decided the same way, and the transport is a property of the row rather than the name of the collection.
- A warning under the table counts the connections with an expired token or a passed review date and is derived from the rows.
- **Credential grants log**: Grant · Tool version · Agent and run · Connection · Scope · TTL · State.
- **Provider drill-down** (`server`, wide): title is the system, subtitle is transport · wire · endpoint. Warnings for a degraded provider, an expired token, and schemas awaiting approval; then System · Transport (with the line that the registry, the policy and the receipts are the same whichever it is) · Registry name · Schemas · Tool versions · Toolbelts · Agents reached · Last import; then **Authorization** and **Tools imported from <provider>**. Authorization shows the connection, its id and kind, the badge, the scopes granted, the owner with the review dates, what the broker mints for that downscope, and grants in 30 days, with **Reconfigure OAuth** or **Reconnect**, **Refresh the token**, **Edit the connection**, **Disconnect** and **Revoke**. A provider with no connection offers **Connect with OAuth** and **Add a key or a role instead**; a provider that holds no credential says it is reached over its transport with no credential to hold and there is nothing to authorize. The tools table lists only that provider's versions (Tool version · Hazard · Gate today · Agents · Calls 30d) and each row opens `tool`. Footer: **Remove** · **Re-import tools** · **Edit**.
- **Edit provider** (`serveredit`): Endpoint · Transport (`mcp`, `http`, `graphql`, `sdk`, `cli`, `native`, `local`, `rpc`) · Wire (`streamable-http`, `https`, `stdio`, `in-process`, `hook`) · Connection, over the note that changing the endpoint does not re-import and a version already on a belt keeps its digest until a re-import brings a new one.
- **OAuth** (`oauth`, from a provider row or its drill-down): Client id · Client secret · Authorization URL · Scopes · the read-only Redirect URL to register with the provider, over the note that authorizing opens the provider, Oxagen exchanges the code, envelopes the token under the organization key, and records who authorized it. **Authorize with <provider>** refuses without a client id and an authorization URL; on success the connection reads connected with its new expiry, and a provider that had no connection gets one. **Refresh the token** re-authorizes in place and leaves grants already minted on their own TTL. **Disconnect** keeps the connection and denies every call through it until it is authorized again.

### Policy tab

- **Policy versions** (the header carries **Draft a version**, which opens `policynew`): Version · State · Author · When · Rules · Tests · What changed. The Tests badge reads as a pass only when the tests have run; a fresh draft says “not run yet”. A row carries **Open** (`policyver`) and then, by state, **Draft a change** (`policynew`, based on that version) when it is active, **Edit** (`policyedit`) · **Activate** (`policyactivate`) · **Discard** (`policydiscard`) when it is a draft, **Restore** (`policyrestore`, which drafts a new version above the active one) when it is superseded. A draft is the only version that edits or deletes: `policyedit` and `policydiscard` opened on an active or superseded version refuse and offer **Draft a change** instead, because every decision cites the version that made it. Below the table, a note saying activation is a governed action with approval and what a draft may do. The panel header carries the store name, `tools.policy_versions`, in place of a language badge. Then **Where a version lives** (rows Store · In regulated mode · Compiled from · Who reads it · What it writes), **Conditions a rule may test**, and the “Sequence rule” example with a plain sentence above it saying what the rule denies and what lets it through.

### Kill switches tab

- “Class switches” (every `moves_funds` tool, every irreversible tool, every tool with egress: third_party), carrying the deny generation badge, and “Scoped switches”, whose header carries **Create a switch** (`switchnew`). Each switch: allowing / denying toggle, Blast radius · Takes effect · Flipped by · Reason. Flipping bumps `deny_generation` so every live run token is re-checked at the next call.
  - The organization switch, the workspace switch and the three class switches ship with the workspace and are on the page the day it exists. They cannot be edited or removed: something has to stay flippable when an incident starts.
  - `switchnew` creates a switch over one of the three identities an incident names: an **Agent**, an **Enrolled device** (the host an agent runs on, offered with its device key), or an **Operator’s agents**. The target list and the blast radius recompute as the scope changes, counted off the agent list rather than written down. A new switch is created allowing, and a second switch on a target something already covers is refused.
  - A switch you created carries **Edit** (`switchedit`) and **Remove** (`switchdel`) on its card. `switchdel` on a denying switch refuses and offers to clear it first, because clearing records who allowed the traffic and removing does not.


**Dialogs this page opens:** `import`, `wz` (tool wizard: describe → recommendation → manifest or import → code in four languages → pull request), `connection`, `tool`, `toolcats`, `schema` (approve observed), `belt` · `beltnew`, `server` · `serveredit` · `serverdel`, `oauth`, `conn` · `connedit` · `connrevoke`, `policynew` · `policyedit` · `policyver` · `policyactivate` · `policydiscard` · `policyrestore`, `switch` · `switchnew` · `switchedit` · `switchdel`, `request-access` (from denied), `incident` (from error).

Every creation wizard is `DLG_EXT.wz`; its spec is `docs/creation-spec.md`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agents · Tools · Steering · Runtimes · Repositories · Spend; Organization nav: Organization · Billing · Audit; foot: the assistant launcher, agent count · data plane, connection badge). The page once called Agent IAM is **Agents**, Runtimes is a page of its own, and Steering carries five tabs (Library, Assignments, Gates, Proposals, Compiler). Top bar: hamburger, breadcrumbs, ⌘K search-or-run, notifications with unread dot, the approvals button (left of the avatar, count of everything waiting on you across the organization; opens the drawer described in `fleet.md`), account avatar → user menu. No assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Providers | `PROVIDERS` (`FIXTURES.SERVERS`, with `system`, `transport`, `wire`) | `tools.tool_providers` | `mcp.mcp_servers`, `mcp.registries` | 🟡 transport and system name to add |
| Tool versions + classification | `TOOLS` | `tools.tool_versions` | `agent.tools`/`tool_versions`, `mcp.tool_snapshots` | 🟡 risk/side-effect/consequence tags to verify |
| Toolbelts | `TOOLBELTS` (`FIXTURES.TOOLBELTS.belts`) | `tools.toolbelts` | none | ❌ |
| Toolbelt assignments | `TOOLBELT_ASSIGN` (`FIXTURES.TOOLBELTS.assign`), read by `AGENT_BELTS` | `tools.toolbelt_assignments` | none | ❌ |
| Connections, grants, OAuth state | `CONNECTIONS` (`authState`, `scopes`, `tokenExp`, `client`, `authUrl`) | `tools.connections` | `ingestion.source_connections`, `mcp.credentials` | 🟡 token lifecycle to verify |
| Policy versions | `POLICIES` | `tools.policy_versions`, one row per version holding the rules and the tests; in regulated mode the rules are a file in `.oxagen/policy/` and the row is the compiled copy | none | ❌ (G2) |
| Kill switches | `SWITCHES`, `S.switches`, `S.denyGen` | `control.commands` + `deny_generation` | `iam.emergency_denies`, `authorization_deny_generations` | 🟡 |
| Observed schemas | `OBSERVED_SCHEMAS` | `schema_origin=observed_proposed` | none | ❌ |

## Functionality

- Tool identity is `name@schema-version` everywhere (registry, approval, kill switch, `tool_requested` frame). The cell shows the human label over the mono API name; a toggle swaps them.
- A provider is identified by the system it is, never by its transport. Changing a provider's transport changes one column and nothing else about its tools, its policy or its receipts.
- `#/:org/:ws/tools/servers` still resolves. `pTools()` rewrites the tab id to `providers`, so every link written before the rename lands on the Providers tab.
- A toolbelt is the only edge from the registry to an agent: what a model is shown is the union of the belts assigned to it and nothing else. Assigning a belt is not a permission, and the principal and the policy still decide every call.
- A belt's availability is derived, never typed: `beltGates` counts each version by the gate it meets today, and `beltAvailability` reads a version behind a kill switch or missing from the registry as unavailable.
- Every belt and agent count is derived the same way. `beltsWithTool` and `agentsWithTool` give a tool version its Toolbelts and Agents cells, `providerBelts` and `providerAgents` give a provider its own, and the tools fixture carries no count of either. A figure that survives removing a tool from a belt is a defect.
- Category is a registry attribute, never a policy: only risk, side effect, financial effect, and egress carry a decision by themselves.
- Until an observed output schema is approved, outputs are validated only for size and type and every run that used them says so in its completeness record.
- Policy is deterministic, versioned, and tested; activation is a governed action with approval.
- A policy version is a record in Postgres, not a context record, and it never reaches a model. The gateway evaluates it on every tool call before the call leaves, with no model in the decision path, and writes one `policy.decision` frame naming the version and the rules that fired.
- A version compiles from the rules on this page plus the enforcement grants on each agent and the role grants on each operator, so a grant is never restated as a rule.
- The page names no policy language. Where rule source is shown, a plain sentence above it says what the rule denies and what lets it through.
- A kill switch flip is recorded with who, when, and why (`S.flipMeta`) and shows its blast radius before confirming.
- A connection is authorized by a person, never by an agent. The token is exchanged by Oxagen, enveloped under the organization key, and never returned to a screen; the broker downscopes it again for each call.
- An expired token denies every call through its connection until somebody reconnects, and the provider row, the drill-down and the warning under the table all say so from the same record.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: “No provider is registered”. “Until a provider is imported, no agent in this workspace has a toolbelt, and every call by name is `unknown_tool`. Importing a provider pulls its tool list, versions each tool, and stores both schemas.” Actions: **Import a provider** (gold), **Add a connection**. The wizard reaches the same importer, from a description rather than a URL.
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: “Tools could not be loaded”. “The control plane answered `503 tool_registry_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the line “trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z”.
- **access denied**: “You cannot see the tool registry”. “Your roles on Anderson Intelligence Corp. do not include `tools.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (opens `request-access`), **Back to Fleet**. Below: *Signed in as* (Marcus Bell · workspace.owner · core-platform), *Needed* (`tools.read on core-platform`), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting plus an interjection), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering, Runtimes, Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The five tabs scroll in their own row; the provider and toolbelt drill-downs rise as sheets and their tables stack as cards. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing else scrolls sideways.

## Permissions

- Read: `tools.read`
- Writes (each a governed action recorded in Audit): `tools.import`, `tools.provider.edit`, `tools.provider.remove`, `tools.schema.approve`, `toolbelt.create`, `toolbelt.edit`, `toolbelt.assign`, `connection.add`, `connection.authorize`, `connection.edit`, `connection.review`, `connection.revoke`, `policy.draft / policy.edit / policy.discard / policy.activate`, `switch.create / switch.edit / switch.remove / switch.flip`

## Backend gaps this page depends on

- G2 policy versions with tests
- toolbelts and their assignments: a belt exists today only as a computed per-agent list, so nothing stores the named set or who carries it
- provider identity separate from transport: the store holds MCP servers, and a provider reached over `http`, `sdk` or a harness hook has nowhere to live
- the OAuth token lifecycle: client registration, code exchange, refresh, and the audit record of who authorized
- observed-schema proposals

## Rules every build of this page must keep

- No heading, tab, panel, column, button or note calls a provider an MCP server. Transport is a column; MCP is one of its values.
- Every badge that describes trust (enforcement tier, hazard, gate, schema origin, authorization) shows the recorded value and nothing stronger.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- A toolbelt row names the providers behind it and the agents assigned it, and both are derived from the belt's tool versions and the assignment record.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen (New tool in the header; a tab that holds its own primary takes the gold from the header, which is New toolbelt on Toolbelts, Add a provider on Providers, and Create rule on Policy). Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- No heading carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence or nothing.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- Every record this page creates can be opened, edited and removed from the row that names it. A destructive action says what stops working before it asks, and what is kept for replay.
- No panel repeats a dialog the page already opens, and no panel states a rule the rows beside it already show.
- A count in navigation appears only where something waits on a person.
