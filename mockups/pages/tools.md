# Tools

| | |
|---|---|
| Route | `#/a-intel/core-platform/tools`. `#/…/tools/tools` and `#/…/tools/registry` land here in place, and so does any tab id `pTools()` does not serve (`fleet-operations-routes.md`, Tools) |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: Unchanged (the five Tools tabs keep their design), Navigation, D17, and the Emissions rows for a policy and a toolbelt. `docs/fleet-operations-ia.md`: Workspace navigation (the Tools count) and Tools. `docs/fleet-operations-routes.md`: Tools. `docs/mission-control-spec.md` §6.4 (the registry) and §6.9 (classification). `docs/creation-spec.md` for the New tool wizard |
| Design | `mockups/src/engine.js` → `pTools()`: the header, the tab bar and the Tools tab (`t==="tools"`), with `toolCell()`, `catBadge()`, `catChips()`, `namesToggle()`, `hazard()`, `toolGate()`, `toolGateKind()`, `originBadge()`, `finBadge()`, `beltsWithTool()`, `agentsWithTool()`, `proposals()`, `verCount()`, `toolDlg()`, `schemaDlg()`, `toolCatsBody()` and `DLG_EXT.import`. The list controls come from `ltTable()`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / Tools / Tools`: Loaded, Empty, Loading, Error and Access denied, and the same five as mobile stories (`Loaded · mobile` and so on). The catalog gives this view no `future` flag, so it has no future-only story |
| Audit | `tools.audit-prompt.md` |

## Job

Every tool version the workspace registry holds: the provider it came from, how it is classified, the gate it meets today, and the toolbelts that put it in front of agents. The registry is the only source of tools an agent can see.

This spec covers the header and tab bar that all five Tools tabs share, and the Tools tab. Each other tab has its own spec: `tools-toolbelts.md`, `tools-providers.md`, `tools-policy.md` and `tools-switches.md`.

A tool version is named `name@version` everywhere: the registry, an approval, a kill switch and a `tool_requested` frame. The page reads the chain Provider → Tool → Toolbelt → Agent. A tool is called a tool, a toolbelt a toolbelt and a provider a provider. MCP keeps its name only where it is the mechanism: a provider's transport, and the importer that reads `tools/list`. `capability` appears only as the frame type a belt's tool emits, in mono (`tools-toolbelts.md`).

The fleet operations wedge left this tab's design alone. Two things around it moved: Tools › Policy now owns every gate (`tools-policy.md`), and the mandates ledger moved to each agent's Delegation section (`/tools/mandates` lands on Agents).

## What is on the page

**Shell.** The workspace sidebar lists Work (8), Agents, Tools (29), Steering (9), Runtimes (2), Spend and Repositories (5), then Organization, Billing and Audit (3). Tools is lit. Its count is the observed output schemas waiting for approval (`proposals().length`), the one thing on this page that waits on a person. The foot carries the Stella launcher, "278 agents · shared plane" and the connection badge. The top bar carries the breadcrumb "Anderson Intelligence Corp. / Core platform / Tools", **Search or run an action** with ⌘K, notifications, the approvals button (17 waiting, opening the drawer in `approvals-drawer.md`) and the account avatar.

**Header** (every Tools tab). Eyebrow: the workspace name, "Core platform" (the eyebrow style sets it in capitals). H1 "Tools". Subtext "The registry is the only source of tools an agent can see." Actions, in order:

- **Import a provider** (plain) opens `import`.
- **New tool** opens the tool creation wizard (`wzOpen('tool')`). It is gold on the Tools and Kill switches tabs. On Toolbelts, Providers and Policy it is plain, because those tabs carry their own gold.
- **Flip a kill switch** (danger) opens `switch` on the class switch "every moves_funds tool".

After a switch is flipped, a banner sits between the header and the tab bar on every tab. `tools-switches.md` specifies it.

**Tab bar.** A `role="tablist"` of five buttons, each with `aria-selected` and each a path segment, `#/…/tools/<tab>`:

| Tab | Count | What the count is |
|---|---|---|
| Tools | "29 to approve" in the approval colour | Observed output schemas waiting. With none waiting, the registry's version count, 703 |
| Toolbelts | 9 | Belts in the catalogue |
| Providers | 19 | Providers in the roster |
| Policy | 9 | Policy versions |
| Kill switches | 2 | Switches denying now |

`pTools()` reads the tab from the path. A tab id it does not serve falls back to Tools, and `servers` (the Providers tab's name before rev1) lands on Providers.

**Tools tab.**

- **Banner**, shown while observed schemas wait: the badge "29 awaiting approval", then "29 output schemas were observed, not declared." in bold, then "The slack, github, linear, stripe, snowflake, jira, datadog, pagerduty, salesforce, kubernetes, sentry, hubspot, notion, zendesk servers declare no outputSchema for these tools. The gateway recorded the outputs, inferred a schema, and filed it as a registry proposal. Until an admin approves, outputs are validated only for size and type, and every run that used them says so in its completeness record." The list names each provider that has a waiting schema. **Review** opens `schema`. The design's word "servers" here breaks the vocabulary rule below, and a build says providers.
- **Tools** panel. Caption: "Every version imported from every provider. RBAC reaches the version, so a provider shipping a new one does not widen a toolbelt." The panel header carries the **Labels** / **API names** toggle (`aria-pressed`), the badge "703 of 703 shown" (the versions in the chosen category, of the registry's total) and **Import a provider** (plain, opens `import`).
- **Category chips**, on their own row: "All 703", then one chip per category that holds a version, least to most consequential: Read-only 383, Data query 10, Record write 252, Messaging & authoring 15, File mutation 11, Code execution 10, Source control 15, Infrastructure 2, Access & identity 2, Financial control 3. Each chip carries `aria-pressed` and the category's meaning as its title. **What the categories mean** (ghost) opens `toolcats`.
- **List controls**, the ones every list in the product carries (`ltTable()`): the search field "Search this list", the filters "All · Schema origin", "All · Egress" and "All · Financial", **Rows** (5, 10, 25, 50 or All, with 10 by default), sortable column headers, and the pager (`1–10 of 703`).
- **Table**, columns in order: Tool version · Provider · Category · Hazard · Gate today · Egress · Financial · Schema origin · Digest · Toolbelts · Agents · Calls 30d.
  - *Tool version*: the category icon, the label ("Create pull request") over the API name (`github__create_pull_request@3`). The toggle swaps the two lines.
  - *Provider*: a button with the provider's registry name (`github`). It opens `server` (`tools-providers.md`).
  - *Category*: the category badge ("SOURCE CONTROL").
  - *Hazard*: the risk mark and word (low, medium, high or critical, with the filled triangle kept for critical) and the side-effect glyph and word (read, write, irreversible).
  - *Gate today*: allowed, needs approval, mandate + approval, or kill switch. The tooltip names the rule or the switch.
  - *Egress*: `internal`, `none` or `third_party`.
  - *Financial*: `moves_funds` or `commits_spend` in the critical colour, or "none".
  - *Schema origin*: declared, imported, observed (a dot, in the approval colour) or observed, approved.
  - *Digest*: `sha256:` and six hex characters, or `sha256:pending` while the schema is observed.
  - *Toolbelts*: one badge per belt that carries the version, or a dash.
  - *Agents*: how many agents those belts reach.
  - *Calls 30d*: calls in the last 30 days.
  - Each row carries a left rule in its risk colour and opens `tool`.
- **Note**: "The gate shown is today’s: the version’s own kill switch, then its provider’s, then pol_v41. A toolbelt decides which agents are shown the tool; the gate decides whether the call survives. Open a provider on any row to see what it imported and the connection it is reached with."

**Dialogs this tab opens.**

- `import`, in three steps. The step is the dialog's argument, so opening it always starts at Connect. A strip heads each step: "1 · Connect → 2 · Review tools/list → 3 · Classify and import", a done step marked ✓.
  1. "Import tools from a provider", subtitle "The registry is the only source of tools an agent can see. Nothing reaches a belt until it is here." Fields: Endpoint URL (`https://mcp.confluence.a-intel.internal/mcp`), Transport (streamable-http, sse, stdio), Connection ("Create one after import", or one of the 16 connections by id and name). Note: "Oxagen calls tools/list, versions every tool it finds, and stores both schemas. Where a provider declares no outputSchema, the gateway records observed outputs and files a registry proposal for an admin to approve." Footer: Cancel, **Connect** (gold).
  2. "Review tools/list", subtitle "8 tools returned by mcp.confluence.a-intel.internal · protocol 2025-06-18". One checkbox per tool, with the tool cell, its description, its hazard, and an "outputSchema" or "no outputSchema" badge. Warning: "2 are unchecked by default. delete_page and export_space are irreversible or bulk egress and declare no output schema. Importing them grants nothing, but they would land denied by workspace policy until someone decides otherwise." Footer: "6 of 8 selected", Back, **Classify** (gold, disabled with nothing selected).
  3. "Classify and import", subtitle "Risk, side effect, egress and financial class are what policy decides on." Table: Tool version · Hazard · Egress · Financial · Output schema. Note: "What import does not do. It grants nothing. These 6 versions take the registry from 703 to 709 tool versions and sit there, callable by nobody, until a role grant puts them on a belt." Footer: "Credential kind api_key · downscoping none available", Back, **Import 6 tools** (gold). The toast reads "Imported 6 tool versions from confluence. They are in the registry and on no belt."
- `schema`, "Approve an observed output schema" (wide). An eyebrow names the version and the provider ("slack__list_channels@1 · the slack server declares no outputSchema for this tool"). The design fixes the words "the slack server" whatever the provider, and a build names the version's own provider.. A note, "What has been happening until now.", says outputs were validated only for size and type and that approving turns strict validation on from the next call. Then Observations ("341 responses over 30 days, from 0 agents"), Inferred from ("the intersection of every observation · 0 outliers discarded") and Digest on approval, the inferred schema beside one recorded response, and "28 more waiting after this one." Footer: "Approving is a governed action: approve_tool_schema. It is audited, and it bumps the tool version’s schema digest, which every future frame records." **Not yet** and **Approve schema** (gold). With nothing left to review it reads "Every observed schema is approved", "Nothing to review.", and **Done**.
- `toolcats`, "Tool categories" (wide): the ten categories in order, each with its meaning and three example tools. Then "The two axes that carry a decision": Risk (low, medium, high, critical), Side effect (read, write, irreversible) and Gate (allowed, needs approval, mandate + approval, denied, kill switch), with "dashed = a person still stands in the way". Footer: "Category is a registry attribute, not a policy: a rule may reference it, but only risk, side effect, financial effect and egress carry a decision by themselves." and **Close**.
- `tool` (wide). Title: the API name. The tool cell, large, with "provider <id>". A row of the category badge, the hazard, the gate, "egress <class>" and the financial badge, then the category's meaning. Schema digest, Schema origin, Credential (`github_app → installation token`, "The agent never sees it."), Price ("$0.00 USD", "per call, from the price book"). A financial tool adds `amount_path`, `currency_path`, `counterparty_path` and `idempotency`, and the warning "Financial tool. The amount is read from the call by $.amount, never from prose. A call without a mandate is denied before dispatch; one over its mandate is denied or routed to approval by the mandate’s own rule." Then "Input schema" as JSON, and a note that validation is strict both ways and a failure is `schema_violation`. The footer counts the belts and the 30-day calls, then **Close**. No gold.
- `switch`, from Flip a kill switch (`tools-switches.md`).
- `wz`, the tool creation wizard: Describe, Recommendation, Manifest, Code, Pull request (`docs/creation-spec.md`).
- `server`, from a Provider cell (`tools-providers.md`).
- `connection` (from the empty state), `request-access` (from denied) and `incident` (from error).

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Backing checked against `macanderson/oxagen` `main` at `bf14d158a` (2026-09-24). The mockup collection names a file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or a constant in `mockups/src/engine.js`, and `volume()` grows the fixtures to the organization's size. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Tool versions: identity, provider, digest, schema origin, calls 30d | `TOOLS` (`FIXTURES.TOOLS`) | `tools.tool_versions` (spec Appendix A.5), `list_tool_versions` | `list_tool_versions` returns name, version, `serverId`, `schemaOrigin`, `schemaDigest`, `gate` and `calls30d` (`packages/oxagen/src/contracts/tool.version.list.ts:17-45`, `:47-82`). Calls come from ClickHouse `tool_invocations` and are null when it does not answer (`:42-43`). Rows live in `agent.tools` and `agent.tool_versions` (`packages/database/src/schema/agent.ts:1229`, `:1274`) | ✅ |
| Hazard | `TOOLS[].risk`, `.eff` | the version's classification | `riskGrade` and `classification.sideEffect` (`packages/oxagen/src/contracts/tool.classification.ts:37-41`, `:47-52`). The classification is null until an admin classifies the version (`tool.version.list.ts:34-35`) | 🟡 |
| Egress | `TOOLS[].eg` | the version's classification | `classification.egress` is `local`, `org_tenant` or `third_party` (`tool.classification.ts:42-46`), null until classified. The design's `internal` and `none` are not values | 🟡 |
| Financial | `TOOLS[].fin` | consequence tags (spec §6.9) | Consequence tags from the starter set `moves_money`, `destroys_data` and others (`tool.classification.ts:20-27`), stored in `consequence_tags` (`agent.ts:1327`). `moves_funds` and `commits_spend` are not tags | 🟡 |
| Category and its chips | `TCAT`, `toolMeta()` | a registry attribute | None. The app shows consequence tags in its place (`apps/app/src/features/tools/registry.tsx:11-13`), gap #3921 (`apps/app/src/features/tools/gaps.ts:16-17`) | ❌ |
| Gate today | `toolGate()`, `toolGateKind()` over `SWITCHES` | the gate each version meets | `gate.kind` names a kill switch only: `open`, `killed_version`, `killed_server` or `killed_class` (`tool.version.list.ts:9-15`). Approval and mandate outcomes are not on the row | 🟡 |
| Observed schemas: origin `observed` and `observed, approved`, `sha256:pending`, the banner, Review, `schema`, the "to approve" tab count, the sidebar count | `OBSERVED_SCHEMAS`, `TOOLS[].proposal`, `S.approved` | `schema_origin` `observed_proposed` and `observed_approved` (spec Appendix A.5) | `schemaOrigin` is `declared` or `imported` (`tool.version.list.ts:37`). `agent.tool_versions` has no output schema column (`agent.ts:1274-1340`), and no capability named `approve_tool_schema` exists. Gap #3921 | ❌ |
| Toolbelts and Agents cells | `TOOLBELTS`, `TOOLBELT_ASSIGN` through `beltsWithTool()` and `agentsWithTool()` | `tools.toolbelts`, `tools.toolbelt_assignments` | None (`registry.tsx:14`), gap #3852 (`gaps.ts:8-9`) | ❌ |
| Tab counts | `proposals()`, `verCount()`, `TOOLBELTS`, `PROVIDERS`, `POLICIES`, `switchesOn()` | each tab's own read | Providers counts the `list_mcp_servers` roster and Kill switches counts switches on. Tools counts one cursor page and marks it a floor, because the read carries no total. Toolbelts and Policy carry no count (`apps/app/src/features/tools/tabs.tsx:1-11`) | 🟡 |
| Import a provider | `IMPORT_TOOLS` | `register_mcp_server`, `import_tools` | `import_tools` versions a registered MCP server's pinned tools and stamps its last import (`packages/oxagen/src/contracts/tool.import.ts:76-136`). `register_mcp_server` registers the server first (`packages/oxagen/src/contracts/agent.mcp.register.ts:4-31`). Transports are `streamable-http`, `sse` and `stdio` only (`packages/database/src/schema/mcp.ts:191-194`) | 🟡 |
| Tool dialog | `toolDlg()` over `TOOLS` | the version with its input and output schemas, price and credential scope | Version facts come from `list_tool_versions`. `agent.tool_versions` stores the input schema (`agent.ts:1283`) and the measures (`agent.ts:1331`). The app reaches the input schema through an agent's belt (`packages/oxagen/src/contracts/agent.toolbelt.get.ts:48-83`). No price, output schema or credential scope is stored on a version | 🟡 |
| New tool | `DLG_EXT.wz` | the creation wizard (`docs/creation-spec.md`) | None, gap #3924 (`gaps.ts:22-23`) | ❌ |
| Flip a kill switch | `switchDialog()` | `set_kill_switch` | `packages/oxagen/src/contracts/kill_switch.set.ts:54-96` (`tools-switches.md`) | ✅ |

The app build also offers reclassification in the tool dialog through `set_tool_classification` (`packages/oxagen/src/contracts/tool.classification.set.ts:8-45`, `apps/app/src/features/tools/tool-dialog.tsx:1-10`). The design draws no control for it.

## Future-only fields

The renderer puts no `data-future` mark on this view, and the catalog gives it no future-only story. These fields have no contract today all the same. A build renders each as not recorded, with its gap issue as `data-gap` (the pattern of `apps/app/src/features/tools/gaps.ts`), and never as a zero or an empty table:

- The Category column and the category chips (#3921). The build shows the consequence tags the classification records.
- Every observed-schema element: the banner, Review and `schema`, the origins `observed` and `observed, approved`, `sha256:pending`, "29 to approve" and the sidebar count (#3921). The Tools tab count is the registry's.
- The Toolbelts and Agents columns (#3852).
- The New tool wizard (#3924).
- In the tool dialog: the price and the credential line.

## Functionality

- A tool version is `name@version` in every place it appears. The Labels / API names toggle swaps the human label and the API name on every tool cell of the page.
- Category is a registry attribute and decides nothing. Only risk, side effect, financial effect and egress carry a decision by themselves.
- Gate today is today's gate, in the order `toolGateKind()` applies it: a switch on the version or on its provider (kill switch), then a financial class (mandate + approval), then an irreversible side effect (needs approval), else allowed. Flipping or clearing a switch changes the column on the next render.
- The Toolbelts and Agents cells are derived from the belt catalogue and the assignment record (`beltsWithTool()`, `agentsWithTool()`). Removing a tool from a belt changes the row. The fixture carries no count of either.
- A chip filters the table, and the badge counts the rows the filter leaves. The chip counts are counts of the registry's rows.
- Until an observed output schema is approved, its outputs are validated only for size and type, and every run that used it says so in its completeness record. Approving a schema moves its row to "observed, approved", gives it a digest, and takes one from every waiting count on the page and in the sidebar.
- Importing grants nothing. An imported version sits in the registry, callable by nobody, until it is on a belt and a grant reaches it.
- Every write on this tab is a governed action recorded in Audit.

## States

`pTools()` branches on the state before it draws the header, so every state but loaded replaces the whole page body, header and tab bar included. The shell stays. Every Tools tab shows the same four panels.

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: "No provider is registered". "Until a provider is imported, no agent in this workspace has a toolbelt, and every call by name is unknown_tool. Importing a provider pulls its tool list, versions each tool, and stores both schemas." Actions: **Import a provider** (gold, opens `import`) and **Add a connection** (opens `connection`).
- **loading**: the skeleton, four tile blocks and a panel of seven rows.
- **error**: "Tools could not be loaded". "The control plane answered 503 tool_registry_unavailable. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen." Actions: **Try again** (gold) and **Open an incident** (opens `incident`). Then "trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z".
- **access denied**: "You cannot see the tool registry". "Your roles on Anderson Intelligence Corp. do not include tools.read on core-platform. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it." Actions: **Request access** (gold, opens `request-access`) and **Back to Work** (`#/a-intel/core-platform/work`). Below: Signed in as "Marcus Bell · workspace.owner · core-platform", Needed "tools.read on core-platform", Decided by "pol_v41 · deny wins over every allow".

## Mobile

At 390 × 844 the top bar collapses to the hamburger, the current crumb ("Tools"), search, notifications, the approvals button and the avatar. The thumb bar holds Work (8), Agents, Tools, Spend and More (3, the open critical incidents). Tools is the lit slot. More is a bottom sheet with Steering, Runtimes, Repositories, Organization, Billing, Audit, Ask Stella, Search, Notifications, Account, Switch organization and Switch workspace.

The header actions wrap onto two rows. The tab bar scrolls in its own row. The category chips wrap, one to a line. Every list table becomes a stack of cards, each cell labelled with its column header. Every dialog rises from the bottom edge as a sheet. Touch targets are at least 44 px, inputs are 16 px, and the page never scrolls sideways.

## Permissions

The design names these permissions. The capability that binds each today is in parentheses.

- Read: `tools.read` (`list_tool_versions` admits an org Owner or Admin and a workspace Owner, Member or Viewer: `tool.version.list.ts:67-70`).
- Writes, each a governed action recorded in Audit: `tools.import` (`register_mcp_server` and `import_tools`, org Owner or Admin), `tools.schema.approve` (no capability), `tools.create` (the wizard, whose design names `tools.admin`, and no capability), `switch.flip` (`set_kill_switch`, org Owner or Admin).

## Backend gaps this page depends on

- #3921: a tool's category as a registry attribute, and output schemas observed rather than declared, with a store, an approval capability and a waiting count.
- #3852: toolbelts and who carries them, for the Toolbelts and Agents columns.
- #3924: the tool creation wizard.
- #3917: providers stored apart from their MCP transport, so a Provider cell can name a provider reached over `http` or a harness hook.
- Approval and mandate outcomes on `list_tool_versions`' `gate`, and a price per call on the version.
- #3820 (request access from a denied page) and #3847 (an incident from a failed page).

## Rules every build of this page must keep

- No heading, tab, panel, column, button or note calls a provider an MCP server or a server. Transport is a column on Providers, and `mcp` is one of its values.
- A tool is named `name@version` everywhere, and the toggle is the only thing that changes how it reads.
- Every badge that describes trust (hazard, gate, schema origin) shows the recorded value and nothing stronger. An observed schema reads observed until a person approves it.
- Every enforcement claim states the tier. A gate is enforced for calls routed through Oxagen. On the `harness` tier the hook refuses a call, client-attested and fail-open. On `observe` nothing refuses.
- Headers are rollups of the rows beneath them: the "N of N shown" badge, the chip counts, the tab counts and the sidebar count are counted from the rows and never typed.
- A Steering Source and a SteeringFrame are never shown as each other. A tool on a belt emits a `capability` SteeringFrame, and this tab shows the tool.
- No person is scored or ranked.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: New tool on this tab.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- A not-loaded state replaces the page body and keeps the shell. A stub control says what the product would do. Nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
