# Tools

| | |
|---|---|
| Route | `#/a-intel/core-platform/tools[/<tab>]` |
| Scope | workspace |
| Spec | §14 Mission Control; Appendix F page 4 |
| Design | `mc.html` → `pTools()` (the single source; `consolidated.html` is the product build of it) |
| States | loaded · empty · loading · error · access denied |
| Files | `tools-loaded.html` / `tools-loaded-mobile.html`, `tools-empty.html` / `tools-empty-mobile.html`, `tools-loading.html` / `tools-loading-mobile.html`, `tools-error.html` / `tools-error-mobile.html`, `tools-denied.html` / `tools-denied-mobile.html` |
| Audit | `tools.audit-prompt.md` |

## Job

The registry (servers, tool versions, schemas, safety classification), connections and their owners with credential grants, the mandates ledger, policy versions with tests and simulation, kill switches, auto-approval rules, and the last assurance result.

## What is on the page

**Header** — eyebrow “Workspace · <workspace name>”, h1 “Tools”.
Actions: **Import server** (opens the import dialog: pull `tools/list` from an MCP server, version it, store both schemas) · **Flip a kill switch** (gold; opens the switch dialog)

- **Tabs** (`/tools/<tab>`): Registry (N to approve) · Connections (N) · Mandates ledger (N) · Policy (N) · Kill switches (N on) · Auto-approvals (N) · Assurance.
- **Registry** — banner “N awaiting approval: output schemas were observed, not declared” (**Review** opens the schema dialog); Tool servers table: Server · Kind · Tools · Health · Schemas · Connection · Last import (**Import tools from an MCP server**); Tool versions table: Tool version · Category · Hazard · Gate today · Egress · Financial · Schema origin · Digest · On belts · Calls 30d (Labels / API names toggle; category chips with counts across the ten categories, By category / Flat). A row opens the tool dialog. Note: the gate shown is today’s — the version’s own kill switch, then its server’s, then the mandate rule, then `pol_v41`.
- **Connections** — the customer’s credentials in the vault: Connection · Kind · Owner · Servers · Downscope · Grants 30d · Reviewed · Next review · Status (**Add a connection**); Credential grants log: Grant · Tool version · Agent · run · Connection · Scope · TTL · State; How the broker chooses: Provider capability · What the broker mints · Here; Financial connections carry extra rules: Named human owner · Mandate per agent · Full-scope keys · Two-person rule.
- **Mandates ledger** — Mandate · Agent · Granted by · Purpose · Per call · Per period · Settled · Reserved · Remaining · Valid to · Status (**Grant a mandate** opens the mandate dialog).
- **Policy** — Policy versions: Version · State · Author · When · Rules · Tests · What changed (**Edit** opens the policy dialog); Simulation of the draft against this workspace’s real history (tiles: Would now be denied · Would now need approval · Would now be allowed, each with share and per-day rate; **Simulate over 90 days**, **Activate <version>**); Conditions available to policy.
- **Kill switches** — “Deny is available at every level”: platform-wide classes (every `moves_funds` tool, every irreversible tool, every tool with egress: third_party), organization, workspace, server, tool version, connection, key, category, agent, person. Each switch: allowing / denying toggle, Blast radius · Takes effect · Flipped by · Reason. Flipping bumps `deny_generation` so every live run token is re-checked at the next call.
- **Auto-approvals** — trust-gated rules: Rule · Applies to · Requires · Qualifying now · Approved 30d · On (**Create rule**, **Edit**, **Delete**); tiles: Rules on · Auto-approved 30d (each one a frame with the rule id) · Held by a floor (tainted, critical, or above a ceiling) · Median wait saved.
- **Assurance** — Adversarial tool-governance suite: Case · Result · What happened; Suite · Ran · Against; **Run against this deployment**, **Download the bundle** (“Hand this to an auditor”).

**Dialogs this page opens:** `import`, `connection`, `tool`, `schema (approve observed)`, `mandate`, `policy (edit + simulate)`, `switch`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Ontology · Steering · Spend; Organization nav: Organization · Billing · Audit; Assistant launcher; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, Assistant toggle, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/2026-09-12-mission-control-app-implementation-plan.md` §3; the *mockup collection* column names the constant in `mc.html` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Servers | `SERVERS` | `tools.tool_servers` | `mcp.mcp_servers`, `mcp.registries` | ✅ |
| Tool versions + classification | `TOOLS` | `tools.tool_versions` | `agent.tools`/`tool_versions`, `mcp.tool_snapshots` | 🟡 risk/side-effect/consequence tags to verify |
| Connections, grants | `CONNECTIONS` | `tools.connections` | `ingestion.source_connections`, `mcp.credentials` | 🟡 |
| Mandates ledger | `MANDATES` | `tools.mandate_ledger` | none | ❌ (G1) |
| Policy versions + simulation | `POLICIES`, `SIM` | `tools.policy_versions` (Cedar) | none | ❌ (G2) |
| Kill switches | `SWITCHES`, `S.switches`, `S.denyGen` | `control.commands` + `deny_generation` | `iam.emergency_denies`, `authorization_deny_generations` | 🟡 |
| Auto-approval rules | `AUTORULES` | not in App. A | none | ❌ (G12, spec decision first) |
| Assurance | `ASSURANCE` | M2 suite | none | ❌ |
| Observed schemas | `OBSERVED_SCHEMAS` | `schema_origin=observed_proposed` | none | ❌ |

## Functionality

- Tool identity is `name@schema-version` everywhere (registry, approval, kill switch, `tool_requested` frame). The cell shows the human label over the mono API name; a toggle swaps them.
- Category is a registry attribute, never a policy: only risk, side effect, financial effect and egress carry a decision by themselves.
- Until an observed output schema is approved, outputs are validated only for size and type and every run that used them says so in its completeness record.
- Policy is deterministic and versioned; a draft is simulated against real history before activation; activation is a governed action.
- A kill switch flip is recorded with who, when and why (`S.flipMeta`) and shows its blast radius before confirming.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “No tool server is registered” — no belt, every call by name is `unknown_tool`. Actions: **Import from an MCP server**, **Add a connection**.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Tools could not be loaded” — `503 tool_registry_unavailable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see the tool registry” — the roles the signed-in person holds on the organization do not include `tools.read on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · assistant · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Ontology, Steering, Organization, Billing, Audit, Assistant, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `tools.read`
- Writes (each a governed action recorded in Audit): `tools.import`, `tools.schema.approve`, `connection.add`, `mandate.grant`, `policy.edit / policy.activate`, `switch.flip`, `autorule.edit`, `assurance.run`

## Backend gaps this page depends on

- G1 mandates
- G2 policy versions + Cedar simulation
- G12 auto-approval store
- assurance suite (M2)
- observed-schema proposals

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
