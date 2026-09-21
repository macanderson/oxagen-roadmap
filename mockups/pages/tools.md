# Tools

| | |
|---|---|
| Route | `#/a-intel/core-platform/tools[/<tab>]` |
| Scope | workspace |
| Spec | §14 Mission Control; Appendix F page 4 |
| Design | `mockups/src/engine.js` → `pTools()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / tools`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `tools.audit-prompt.md` |

## Job

Every tool version imported, the MCP servers they came from with the connection each is reached through, policy versions with their tests, and kill switches. A tool is identified by `name@schema-version` everywhere, and a server is where you authorize, re-import and remove it.

## What is on the page

**Header**: eyebrow is the workspace name (“Core platform”), h1 “Tools”, subtext “The registry is the only source of tools an agent can see.”
Actions: **Import server** (opens `import`: pull `tools/list` from an MCP server, version it, store both schemas; three steps Connect → Classify → Import N tools) · **New tool** (gold; opens the tool wizard) · **Flip a kill switch** (danger; opens `switch`). A tool belongs to a server, so every route into a server passes through the MCP servers tab or a Server cell on the Tools tab.

- **Tabs** (`/tools/<tab>`): Tools (N versions, or “N to approve” in approval colour when an observed schema waits) · MCP servers (N) · Policy (N) · Kill switches (N on). A tab id that is no longer served falls back to Tools, so an old link never renders an empty page.
- **Tools**: banner “N awaiting approval: N output schemas were observed, not declared…” (**Review** opens `schema`); **Tools** (“Every version imported from every server. RBAC reaches the version, so a server shipping a new one does not widen a belt.”; Labels / API names toggle; badge “N of N shown”; category chips with counts across the ten categories; **Import from a server** opens `import`; facets Schema origin, Egress, Financial): Tool version · Server · Category · Hazard · Gate today · Egress · Financial · Schema origin · Digest · On belts · Calls 30d. A row opens `tool`; the Server cell is a button that opens that server’s drill-down. The category chips sit on their own row with **What the categories mean**, which opens `toolcats`. The note: “The gate shown is today’s: the version’s own kill switch, then its server’s, then `pol_v41`. Open a server on any row to see what it imported and the connection it is reached with.”
- **MCP servers**: **MCP servers** (“N servers hold N tool versions. Open one to authorize it, re-import its tools, or see what it imported.”; **Add a server** is the tab’s gold action and opens `import`): Server · Kind · Tools · Health · Connection · Authorization · Last import. The Authorization cell is a badge over the token expiry: connected, token expired, key held, role assumed, not connected, or “none needed” for a server reached in-process or over a harness hook. A row opens `server` and carries **Open** · **Connect** or **Reconnect**, when the server takes a credential · **Remove**. A warning under the table counts the connections with an expired token or a passed review date and is derived from the rows. **Credential grants log**: Grant · Tool version · Agent and run · Connection · Scope · TTL · State.
- **Server drill-down** (`server`, wide): warnings for a degraded server, an expired token, and schemas awaiting approval; Kind · Schemas · Tool versions · Last import; then **Authorization** and **Tools imported from <server>**. Authorization shows the connection, its id and kind, the badge, the scopes granted, the owner with the review dates, what the broker mints for that downscope, and grants in 30 days, with **Reconfigure OAuth** or **Reconnect**, **Refresh the token**, **Edit the connection**, **Disconnect** and **Revoke**. A server with no connection offers **Connect with OAuth** and **Add a key or a role instead**; a server that holds no credential says there is nothing to authorize. The tools table lists only that server’s versions (Tool version · Hazard · Gate today · On belts · Calls 30d) and each row opens `tool`. Footer: **Remove** · **Re-import tools** · **Edit**.
- **OAuth** (`oauth`, from a server row or its drill-down): Client id · Client secret · Authorization URL · Scopes · the read-only Redirect URL to register with the provider, over the note that authorizing opens the provider, Oxagen exchanges the code, envelopes the token under the organization key, and records who authorized it. **Authorize with <server>** refuses without a client id and an authorization URL; on success the connection reads connected with its new expiry, and a server that had no connection gets one. **Refresh the token** re-authorizes in place and leaves grants already minted on their own TTL. **Disconnect** keeps the connection and denies every call through it until it is authorized again.
- **Policy**: **Policy versions** (the header carries **Draft a version**, which opens `policynew`): Version · State · Author · When · Rules · Tests · What changed. The Tests badge reads as a pass only when the tests have run; a fresh draft says “not run yet”. A row carries **Open** (`policyver`) and then, by state, **Draft a change** (`policynew`, based on that version) when it is active, **Edit** (`policyedit`) · **Activate** (`policyactivate`) · **Discard** (`policydiscard`) when it is a draft, **Restore** (`policyrestore`, which drafts a new version above the active one) when it is superseded. A draft is the only version that edits or deletes: `policyedit` and `policydiscard` opened on an active or superseded version refuse and offer **Draft a change** instead, because every decision cites the version that made it. Below the table, a note saying activation is a governed action with approval and what a draft may do. The panel header carries the store name, `tools.policy_versions`, in place of a language badge. Then **Where a version lives** (rows Store · In regulated mode · Compiled from · Who reads it · What it writes), **Conditions a rule may test**, and the “Sequence rule” example with a plain sentence above it saying what the rule denies and what lets it through.
- **Kill switches**: “Class switches” (every `moves_funds` tool, every irreversible tool, every tool with egress: third_party), carrying the deny generation badge, and “Scoped switches”, whose header carries **Create a switch** (`switchnew`). Each switch: allowing / denying toggle, Blast radius · Takes effect · Flipped by · Reason. Flipping bumps `deny_generation` so every live run token is re-checked at the next call.
  - The organization switch, the workspace switch and the three class switches ship with the workspace and are on the page the day it exists. They cannot be edited or removed: something has to stay flippable when an incident starts.
  - `switchnew` creates a switch over one of the three identities an incident names: an **Agent**, an **Enrolled device** (the host an agent runs on, offered with its device key), or an **Operator’s agents**. The target list and the blast radius recompute as the scope changes, counted off the agent list rather than written down. A new switch is created allowing, and a second switch on a target something already covers is refused.
  - A switch you created carries **Edit** (`switchedit`) and **Remove** (`switchdel`) on its card. `switchdel` on a denying switch refuses and offers to clear it first, because clearing records who allowed the traffic and removing does not.

**Dialogs this page opens:** `import`, `wz` (tool wizard: describe → recommendation → manifest or import → code in four languages → pull request), `connection`, `tool`, `toolcats`, `schema` (approve observed), `server` · `serveredit` · `serverdel`, `oauth`, `connedit` · `connrevoke`, `policynew` · `policyedit` · `policyver` · `policyactivate` · `policydiscard` · `policyrestore`, `switch` · `switchnew` · `switchedit` · `switchdel`, `request-access` (from denied), `incident` (from error).

Every creation wizard is `DLG_EXT.wz`; its spec is `docs/creation-spec.md`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Repositories · Spend; Organization nav: Organization · Billing · Audit; foot: the assistant launcher, agent count · data plane, connection badge). Top bar: hamburger, breadcrumbs, ⌘K search-or-run, notifications with unread dot, the approvals button (left of the avatar, count of everything waiting on you across the organization; opens the drawer described in `fleet.md`; account avatar → user menu. No assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Servers | `SERVERS` | `tools.tool_servers` | `mcp.mcp_servers`, `mcp.registries` | ✅ |
| Tool versions + classification | `TOOLS` | `tools.tool_versions` | `agent.tools`/`tool_versions`, `mcp.tool_snapshots` | 🟡 risk/side-effect/consequence tags to verify |
| Connections, grants, OAuth state | `CONNECTIONS` (`authState`, `scopes`, `tokenExp`, `client`, `authUrl`) | `tools.connections` | `ingestion.source_connections`, `mcp.credentials` | 🟡 token lifecycle to verify |
| Policy versions | `POLICIES` | `tools.policy_versions`, one row per version holding the rules and the tests; in regulated mode the rules are a file in `.oxagen/policy/` and the row is the compiled copy | none | ❌ (G2) |
| Kill switches | `SWITCHES`, `S.switches`, `S.denyGen` | `control.commands` + `deny_generation` | `iam.emergency_denies`, `authorization_deny_generations` | 🟡 |
| Observed schemas | `OBSERVED_SCHEMAS` | `schema_origin=observed_proposed` | none | ❌ |

## Functionality

- Tool identity is `name@schema-version` everywhere (registry, approval, kill switch, `tool_requested` frame). The cell shows the human label over the mono API name; a toggle swaps them.
- Category is a registry attribute, never a policy: only risk, side effect, financial effect, and egress carry a decision by themselves.
- Until an observed output schema is approved, outputs are validated only for size and type and every run that used them says so in its completeness record.
- Policy is deterministic, versioned, and tested; activation is a governed action with approval.
- A policy version is a record in Postgres, not a context record, and it never reaches a model. The gateway evaluates it on every tool call before the call leaves, with no model in the decision path, and writes one `policy.decision` frame naming the version and the rules that fired.
- A version compiles from the rules on this page plus the enforcement grants on each agent and the role grants on each operator, so a grant is never restated as a rule.
- The page names no policy language. Where rule source is shown, a plain sentence above it says what the rule denies and what lets it through.
- A kill switch flip is recorded with who, when, and why (`S.flipMeta`) and shows its blast radius before confirming.
- A connection is authorized by a person, never by an agent. The token is exchanged by Oxagen, enveloped under the organization key, and never returned to a screen; the broker downscopes it again for each call.
- An expired token denies every call through its connection until somebody reconnects, and the server row, the drill-down and the warning under the table all say so from the same record.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: “No tool server is registered”. “Until a server is imported, no agent in this workspace has a belt, and every call by name is `unknown_tool`. Import an MCP server to pull its `tools/list`, version it, and store both schemas.” Actions: **Import from an MCP server** (gold), **Add a connection**. The wizard reaches the same importer, from a description rather than a URL.
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: “Tools could not be loaded”. “The control plane answered `503 tool_registry_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the line “trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z”.
- **access denied**: “You cannot see the tool registry”. “Your roles on Anderson Intelligence Corp. do not include `tools.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (opens `request-access`), **Back to Fleet**. Below: *Signed in as* (Marcus Bell · workspace.owner · core-platform), *Needed* (`tools.read on core-platform`), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting plus an interjection), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The tab strip scrolls in its own row; the server drill-down rises as a sheet and its two tables stack as cards. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing else scrolls sideways.

## Permissions

- Read: `tools.read`
- Writes (each a governed action recorded in Audit): `tools.import`, `tools.server.edit`, `tools.server.remove`, `tools.schema.approve`, `connection.add`, `connection.authorize`, `connection.edit`, `connection.review`, `connection.revoke`, `policy.draft / policy.edit / policy.discard / policy.activate`, `switch.create / switch.edit / switch.remove / switch.flip`

## Backend gaps this page depends on

- G2 policy versions with tests
- the OAuth token lifecycle: client registration, code exchange, refresh, and the audit record of who authorized
- observed-schema proposals

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, hazard, gate, schema origin, authorization) shows the recorded value and nothing stronger.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice; Qualifying now is recomputed from the agent records on every render.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen (New tool in the header; Add a server is the MCP servers tab’s primary). Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- No heading carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence or nothing.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- Every record this page creates can be opened, edited and removed from the row that names it. A destructive action says what stops working before it asks, and what is kept for replay.
- No panel repeats a dialog the page already opens, and no panel states a rule the rows beside it already show.
- A count in navigation appears only where something waits on a person.
