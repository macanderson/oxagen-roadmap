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

The registry (servers, tool versions, schemas, safety classification), connections and their owners with credential grants, the mandates ledger, policy versions with their tests, kill switches, and the auto-approval rules. An auto-approval rule qualifies an agent on the record: its tier, its runs in 30 days, an amount ceiling, and zero tamper incidents. There is no score.

## What is on the page

**Header**: eyebrow is the workspace name (“Core platform”), h1 “Tools”, subtext “The registry is the only source of tools an agent can see.”
Actions: **Import server** (opens `import`: pull `tools/list` from an MCP server, version it, store both schemas; three steps Connect → Classify → Import N tools) · **New tool** (gold; opens the tool wizard) · **Flip a kill switch** (danger; opens `switch`).

- **Tabs** (`/tools/<tab>`): Registry (N to approve) · Connections (N) · Mandates ledger (N) · Policy (N) · Kill switches (N on) · Auto-approvals (N).
- **Registry**: banner “N awaiting approval: N output schemas were observed, not declared…” (**Review** opens `schema`); **Tool servers** (“N servers, N tool versions. The registry is the catalog; a belt is what one agent may reach.”; **Import tools from an MCP server**): Server · Kind · Tools · Health · Schemas · Connection · Last import, facets Health and Kind, pager; **Tool versions** (“RBAC reaches the version. A server shipping a new version does not silently widen a belt.”; Labels / API names toggle; badge “N of N shown”; category chips with counts across the ten categories; facets Schema origin, Egress, Financial): Tool version · Category · Hazard · Gate today · Egress · Financial · Schema origin · Digest · On belts · Calls 30d. A row opens `tool`. **Tool categories** panel with the eyebrow “The two axes that carry a decision” and the note: “A financial tool whose schema does not expose an amount cannot be granted a mandate and is denied by construction. The gate shown is today’s: the version’s own kill switch, then its server’s, then the mandate rule, then pol_v41.”
- **Connections**: **Connections** (**Add a connection** opens `connection`): Connection · Kind · Owner · Servers · Downscope · Grants 30d · Reviewed · Next review · Status; **Credential grants log**: Grant · Tool version · Agent and run · Connection · Scope · TTL · State; **Broker selection**: Provider capability · What the broker mints · Here; **Financial connections carry extra rules**: Named human owner · Mandate per agent · Full-scope keys.
- **Mandates ledger** (heading “Mandates ledger”; **Grant a mandate** opens `mandate`): Mandate · Agent · Granted by · Purpose · Per call · Per period · Settled · Reserved · Remaining · Valid to · Status; a row opens the mandate page.
- **Policy**: **Policy versions** (**Edit** opens `policy`): Version · State · Author · When · Rules · Tests · What changed; a note that activation is a governed action with approval and the superseded version is kept; **Conditions available to policy**; the “Sequence rule” example as shipped.
- **Kill switches**: **Deny is available at every level**: “Class switches” (every `moves_funds` tool, every irreversible tool, every tool with egress: third_party) and “Scoped switches” (organization, workspace, server, tool version, connection, key, category, agent, person). Each switch: allowing / denying toggle, Blast radius · Takes effect · Flipped by · Reason. Flipping bumps `deny_generation` so every live run token is re-checked at the next call.
- **Auto-approvals** (`autoRulesBody`): tiles **Rules on** (“of N · in the policy bundle”) · **Auto-approved 30d** (“each one a frame with the rule id”) · **Held by a floor** (“tainted, critical, or above a ceiling”) · **Median wait saved** (“per call, against a human gate”). Panel heading “Auto-approvals”, caption “a rule replaces the human gate for agents whose tier, run count and incident record meet its floor”, **Create rule** (gold). One card per rule: an on/off switch (aria-label “Disable <name>” / “Enable <name>”), the name, the workspace chip (or “every workspace”), “Off” when disabled, the provenance line (id · by · date), Tool (the pattern), Requires (chips from `ruleReq`: “<tier> tier or above”, “N runs in 30 days”, “no tamper incident”, and “≤ $” when a ceiling is set), Qualifying now (“N of N” with up to two agent slugs, computed by `ruleQualifies`), a rail with “N approved 30d” and “N held by a floor”, **Edit** (opens `ruleedit`) and **Delete** (opens `ruledel`). The note: “Deny wins. A rule never auto-approves tainted input, a critical hazard, a call outside a mandate, or an agent with a tamper incident in the window. Every auto-approval is a `policy.decision` frame naming the rule, so a replay shows who decided: the rule, and the person who created it.”
- **Rule dialog** (`ruleedit`, “Create an auto-approval rule” or “Edit rule”): Name · Workspace (or every workspace) · Applies to (a tool version pattern; “The rule only matters where the gate is `require_approval`; a deny stays a deny.”) · Minimum tier (select `ruleTier`: harness, gateway, contained; “Computed per run from what was routed. Only `gateway` and above have observed metering; only `contained` is enforced against the host.”) · Minimum runs in 30 days (number `ruleRuns`; “Runs sealed in the window with no tamper incident against the agent. One incident and the agent drops out of every rule until the window clears.”) · Amount ceiling (USD, optional; read by `amount_path`) · State (Enabled; “Off keeps the rule but parks every call for a human.”); a live banner “N of N agents qualify now: <slugs>.” that recomputes on every change; the note on the floors you cannot switch off; **Cancel**, **Create rule** / **Save changes**. `ruledel`: the calls park for a human again from the next bundle, the approvals it made stay in the record; **Cancel**, **Switch off instead**, **Delete rule**.

**Dialogs this page opens:** `import`, `wz` (tool wizard: describe → recommendation → manifest or import → code in four languages → pull request), `connection`, `tool`, `schema` (approve observed), `mandate`, `policy` (edit), `switch`, `ruleedit`, `ruledel`, `request-access` (from denied), `incident` (from error).

Every creation wizard is `DLG_EXT.wz`; its spec is `docs/creation-spec.md`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Repositories · Spend; Organization nav: Organization · Billing · Audit; foot: the assistant launcher, agent count · data plane, connection badge). Top bar: hamburger, breadcrumbs, ⌘K search-or-run, notifications with unread dot, the approvals button (left of the avatar, count of everything waiting on you across the organization; opens the drawer described in `fleet.md`; the approval card there shows the auto-approval eligibility line, `autoEligibilityLine`, naming the rule and why the call parked), account avatar → user menu. No assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Servers | `SERVERS` | `tools.tool_servers` | `mcp.mcp_servers`, `mcp.registries` | ✅ |
| Tool versions + classification | `TOOLS` | `tools.tool_versions` | `agent.tools`/`tool_versions`, `mcp.tool_snapshots` | 🟡 risk/side-effect/consequence tags to verify |
| Connections, grants | `CONNECTIONS` | `tools.connections` | `ingestion.source_connections`, `mcp.credentials` | 🟡 |
| Mandates ledger | `MANDATES` | `tools.mandate_ledger` | none | ❌ (G1) |
| Policy versions | `POLICIES` | `tools.policy_versions` (Cedar, tests) | none | ❌ (G2) |
| Kill switches | `SWITCHES`, `S.switches`, `S.denyGen` | `control.commands` + `deny_generation` | `iam.emergency_denies`, `authorization_deny_generations` | 🟡 |
| Auto-approval rules | `AUTORULES`, `ruleQualifies`, `ruleReq` | not in App. A; the rule carries `minTier`, `minRuns`, `maxAmount`, and qualifies on the agent’s tier (G6), `runs30`, and `tamperCount` | none | ❌ (G12, spec decision first) |
| Observed schemas | `OBSERVED_SCHEMAS` | `schema_origin=observed_proposed` | none | ❌ |

## Functionality

- Tool identity is `name@schema-version` everywhere (registry, approval, kill switch, `tool_requested` frame). The cell shows the human label over the mono API name; a toggle swaps them.
- Category is a registry attribute, never a policy: only risk, side effect, financial effect, and egress carry a decision by themselves.
- Until an observed output schema is approved, outputs are validated only for size and type and every run that used them says so in its completeness record.
- Policy is deterministic, versioned, and tested; activation is a governed action with approval.
- A kill switch flip is recorded with who, when, and why (`S.flipMeta`) and shows its blast radius before confirming.
- A rule qualifies an agent when its tier is at or above `minTier`, its runs in 30 days are at or above `minRuns`, and it has zero tamper incidents in the window; an amount above `maxAmount`, tainted input, a critical hazard, or a call outside a mandate holds the call for a human whatever the rule says. Creating, editing, toggling, or deleting a rule bumps the bundle; the approvals a deleted rule made stay in the record with its id, which is never reused.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: “No tool server is registered”. “Until a server is imported, no agent in this workspace has a belt, and every call by name is `unknown_tool`. Import an MCP server to pull its `tools/list`, version it, and store both schemas.” Actions: **Import from an MCP server** (gold), **Add a connection**. The wizard reaches the same importer, from a description rather than a URL.
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: “Tools could not be loaded”. “The control plane answered `503 tool_registry_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the line “trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z”.
- **access denied**: “You cannot see the tool registry”. “Your roles on Anderson Intelligence Corp. do not include `tools.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (opens `request-access`), **Back to Fleet**. Below: *Signed in as* (Marcus Bell · workspace.owner · core-platform), *Needed* (`tools.read on core-platform`), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting plus an interjection), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The tab strip scrolls in its own row; rule cards stack their rail under the facts. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing else scrolls sideways.

## Permissions

- Read: `tools.read`
- Writes (each a governed action recorded in Audit): `tools.import`, `tools.schema.approve`, `connection.add`, `mandate.grant`, `policy.edit / policy.activate`, `switch.flip`, `autorule.edit`

## Backend gaps this page depends on

- G1 mandates
- G2 policy versions with tests
- G6 the tier computed per run (a rule’s `minTier` reads it)
- G12 auto-approval store
- observed-schema proposals

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, hazard, gate, schema origin) shows the recorded value and nothing stronger; a rule’s Requires chips name the floor as written, never a score.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice; Qualifying now is recomputed from the agent records on every render.
- Every explanation is a chain of links to frames, records, and commits, not a summary; every auto-approval is a frame naming its rule.
- Exactly one gold action per screen (New tool; Create rule inside the Auto-approvals tab is the tab’s primary and the header’s New tool is the page’s). Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- No heading carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence or nothing.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
