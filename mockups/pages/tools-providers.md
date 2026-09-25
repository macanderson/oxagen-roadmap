# Providers

| | |
|---|---|
| Route | `#/a-intel/core-platform/tools/providers`. `#/…/tools/servers` (the tab's name before rev1) lands here in place. `fleet-operations-routes.md` also lands `#/…/tools/connections` here |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: Unchanged (the five Tools tabs keep their design) and D17. `docs/fleet-operations-ia.md`: Tools. `docs/fleet-operations-routes.md`: Tools. `docs/mission-control-spec.md` §6.4 (tool sources), §6.8 (the credential broker) and Appendix A.5 (`tools.tool_servers`, `tools.connections`, `tools.credential_grants`). `docs/agent-ontology-ia.md` for the provider and transport vocabulary. `tools.md` owns the header and tab bar this tab shares |
| Design | `mockups/src/engine.js` → `pTools()`, the `t==="providers"` branch, with `providerBelts()`, `providerAgents()`, `connByServer()`, `serverConns()`, `needsAuth()`, `authBadge()`, `grantsLog()`, `brokerMints()`, `DLG_EXT.server`, `DLG_EXT.serveredit`, `DLG_EXT.serverdel`, `DLG_EXT.oauth`, `DLG_EXT.conn`, `DLG_EXT.connedit`, `DLG_EXT.connrevoke` and `DLG_EXT.import`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / Tools / Providers`: Loaded, Empty, Loading, Error and Access denied, and the same five as mobile stories. The catalog gives this view no `future` flag, so it has no future-only story |
| Audit | `tools-providers.audit-prompt.md` |

## Job

The systems the registry's tools belong to, each with the transport Oxagen reaches it over, the connection that holds its credential, and the grants the broker minted from that credential. A provider is where a person authorizes, re-imports and removes a system's tools.

A provider is named by the system it is: GitHub, Stripe, the harness on a host. The transport is how Oxagen reaches it, and `mcp` is one of eight values a transport may take. The fleet operations wedge left this tab's design alone.

## What is on the page

**Header and tab bar** as in `tools.md`, with Providers selected. New tool is plain on this tab, because Add a provider carries the gold.

**Providers panel.** Title "Providers". Caption: "19 providers hold 703 tool versions. A provider is the system the tools belong to; the transport is how Oxagen reaches it." Both numbers are counted from the rows. The caption states three facts and joins two of them with a semicolon, where the plain-noun rule allows a caption one fact. It is listed as a design defect. The panel header carries **Add a provider** (gold, opens `import`).

- **List controls** (`ltTable()`): "Search this list", the filters "All · Health" and "All · Agents", **Rows** (10 by default) and the pager (`1–10 of 19`).
- **Table**, columns in order: Provider · Transport · Tools · Toolbelts · Agents · Health · Connection · Authorization · Last import, then an unlabelled actions column.
  - *Provider*: the system in bold over what it is ("GitHub" over "Source control and pull requests.").
  - *Transport*: the transport badge (`mcp`, `http`, `native`, `local`) over the wire and the endpoint in mono ("streamable-http · https://mcp.github.com/a-intel", "in-process · contract registry", "hook · claude-code 2.1.4, codex-cli 1.4.0, stella 0.9.2").
  - *Tools*: the distinct tools over "N versions" ("48" over "81 versions").
  - *Toolbelts*: one badge per belt that reaches the provider, or a dash.
  - *Agents*: how many agents those belts reach, or a dash.
  - *Health*: "ok" (allowed colour) or "degraded" (approval colour), each with a dot.
  - *Connection*: a button naming the connection ("GitHub · a-intel org installation", opening `conn`) over its kind in mono (`github_app`, `oauth`, `api_key`, `cloud_role`). Where no connection record matches, the provider's connection text in a dim face ("Snowflake key · analytics"), or "none".
  - *Authorization*: a badge over the token's expiry: connected, token expired, key held, role assumed, or not connected. A provider reached in-process or over a harness hook reads "none needed".
  - *Last import*: a timestamp, or "ships with the release" (Oxagen agent tools) or "per harness version" (Harness-native tools).
  - *Actions*: **Open** (opens `server`), then **Connect**, or **Reconnect** when the token expired, on a provider that takes a credential (opens `oauth`), then **Remove** (danger, opens `serverdel`). The design draws Connect and Reconnect in gold on every such row, eight gold buttons on the first page beside Add a provider. That breaks the one-gold rule below, and a build draws them plain.
  - A row opens `server`. It is keyboard reachable, with `role="button"` and the label "Open <name>".
- The demo roster holds 19 providers. The first eight (GitHub, Linear, Stripe, AWS Billing, Slack, Snowflake, Oxagen agent tools, Harness-native tools) carry every field. The eleven that `volume()` adds (jira, datadog, pagerduty, salesforce, gdrive, postgres-prod, kubernetes, sentry, hubspot, notion, zendesk) carry no system, description or wire, so the design renders an empty Provider cell and a wire value in the Transport badge for them, and their dialog's subtitle reads "undefined". A build names every provider's system and transport.
- **Note**: "MCP is one transport among several. A provider reached over http, native or a harness local hook is imported, versioned and decided the same way, so the transport is a property of the row and never the name of the collection."
- **Warning**, counted from the connections: "3 connections need attention. Slack · a-intel.slack.com has an expired token; calls through it are denied until it is reconnected. Pagerduty · a-intel workspace was due for review 2026-08-30. Hubspot · a-intel workspace was due for review 2026-09-11."

**Credential grants log** panel. Title "Credential grants log". Caption: "45,722 grants in 30 days across 16 connections. Each one is recorded on its call’s frames and receipt." Badge: "4 most recent shown". This table carries no list controls. Columns in order: Grant · Tool version · Agent and run · Connection · Scope · TTL · State.

- *Grant*: the grant id (`cg_01K5RS8`), or a dash when nothing was minted, over its time.
- *Tool version*: the tool cell.
- *Agent and run*: the agent key over the run id and "seq N".
- *Connection*: the connection id as a link (opens `conn`) over its downscope ("installation token", "token exchange", "restricted key").
- *Scope*: what the minted credential could reach, in mono ("repos [a-intel/platform]"). A parked call adds "Parked for approval apr_01K5RN9T4. The broker mints only after a human answers." A settled one adds "receipt" and a link to its receipt.
- *TTL*: "5m", "2m", "10m".
- *State*: expired, not minted (a dot, approval colour) or settled (a dot, allowed colour).
- Footer: "TTL defaults to the call’s expected duration plus a margin, never more than one hour. The agent sees the result, never the credential."

**Dialogs this tab opens.**

- `import` (Add a provider): the three-step importer in `tools.md`.
- `server` (wide), one provider. Title: the system. Subtitle: transport, wire and endpoint ("mcp · streamable-http · https://mcp.github.com/a-intel").
  - Warnings where they apply. Degraded: "This provider is degraded. Calls to it are retried once and then denied; the run says so on its frames." Expired token: "The token expired 2026-09-12 00:00 UTC. Reconnect to bring the 30 tools below back into reach." Waiting schemas: "6 schemas are awaiting approval. Until an admin approves, outputs are validated only for size and type."
  - System (the description), Transport ("mcp · streamable-http", with "how Oxagen reaches it. The registry, the policy and the receipts are the same whichever it is."), Registry name, Schemas, Tool versions ("81 across 48 tools"), Toolbelts (badges, or "on no toolbelt in this workspace"), Agents reached (badges, or "none"), Last import.
  - "Authorization". With a connection: Connection (a link to `conn`, with its id and kind), Authorization (the badge and the expiry), Scopes, Owner ("Marcus Bell · reviewed 2026-08-14, next 2026-11-14"), What the broker mints ("a token limited to the repositories the call names"), Grants 30d. Then the buttons the connection's state allows. **Reconfigure OAuth**, or **Reconnect** when the token expired, appears for OAuth and GitHub App connections. **Refresh the token** and **Disconnect** appear for a connected OAuth connection. **Edit the connection** (opens `connedit`) and **Revoke** (danger, opens `connrevoke`) always appear. With no connection on a provider that needs one: "This provider is reached as somebody, and nobody is connected yet. Every call to it is denied until it is." with **Connect with OAuth** and **Add a key or a role instead** (opens `connection`). With no credential to hold: "Reached native, with no credential to hold. There is nothing here to authorize." (or "Reached local, …").
  - "Tools imported from <registry name>": Tool version · Hazard · Gate today · Agents · Calls 30d. A row opens `tool`. Under it, "81 of the 81 versions this provider has shipped are in the registry. Re-import to pull the rest." With nothing imported: "Nothing from this provider is in the registry yet. Re-import to pull its tool list."
  - Footer: **Remove** (danger, opens `serverdel`), **Re-import tools** ("Re-imported github from tools/list. New versions land as new rows; nothing widens a belt on its own."), **Edit** (gold, opens `serveredit`). The design also draws Reconfigure OAuth, Reconnect and Connect with OAuth in gold, which puts two gold actions in one dialog. A build keeps Edit as the dialog's one gold action.
- `serveredit`, "Edit <system>", subtitle "The endpoint and the credential it is reached with." Fields: Endpoint, Transport (`mcp`, `http`, `graphql`, `sdk`, `cli`, `native`, `local` or `rpc`), Wire (`streamable-http`, `https`, `stdio`, `in-process` or `hook`) and Connection ("none" or a connection by name). Note: "Changing the endpoint does not re-import. Tool versions already on a belt keep their digest until a re-import brings a new one." Footer: Cancel, **Save** ("Saved. GitHub is reached at https://mcp.github.com/a-intel from the next call."). An empty endpoint is refused with "A provider needs an endpoint."
- `serverdel`, "Remove <registry name>?". Warning: "81 tool versions leave the registry. 3 toolbelts lose a tool and the calls they cover are denied as unknown_tool from the next call boundary." For a provider no belt reaches: "No belt reaches it, so nothing in flight is denied." Note: "The registry rows are kept for replay: a run that already called this server still cites the version it called. Re-importing the same endpoint restores it." The design's word "server" there breaks the vocabulary rule below, and a build says provider. Footer: Cancel, **Remove it** (danger).
- `oauth`, "Connect <registry name>" or "Reconnect <registry name>", subtitle "OAuth · you authorize it, Oxagen holds the token". On an expired token, the warning "The token expired <time>. Calls through this connection are denied until you authorize it again. Nothing else about the connection changes." Fields: Client id, Client secret, Authorization URL, Scopes (with "Ask for the narrowest set the tools need. The broker downscopes again per call, but it cannot ask for less than nothing."), and the read-only Redirect URL `https://engine.oxagen.sh/v1/oauth/callback` with "Register this with <provider> before you authorize." Note: "Authorizing opens <provider> in a new tab. When it redirects back, Oxagen exchanges the code, envelopes the token under the organization key, and records who authorized it. The token is never returned to a screen and never sent to an agent." Footer: Cancel, **Authorize with <registry name>** (gold), which refuses without a client id and an authorization URL ("A client id and an authorization URL come first. <provider> issues both when you register Oxagen as an app."). Success reads "<provider> authorized as Marcus Bell. The token is enveloped under the organization key and expires 2026-12-20 09:00 UTC." Refresh reads "Refreshed against the provider. The new token expires 2026-12-20 09:00 UTC; grants already minted keep their own TTL." Disconnect reads "Disconnected <connection>. Every call through it is denied until it is authorized again."
- `conn`, one connection. Title: its name. Subtitle: its id and kind. A passed review date adds "The review date passed on <date>. It has issued <n> grants since. Marking it reviewed sets the next date 90 days out and is recorded with your name on it." Then Owner (a financial connection adds "a finance role, required on a financial connection"), Providers, Downscope, What the broker mints, Grants 30d, Reviewed ("2026-08-14 · next 2026-11-14"). Then "Recent grants" (Tool version · Scope · TTL · State), and the note "No agent holds this credential. The secret was enveloped under the organization key at save and cannot be read back." Footer: **Revoke** (danger), **Mark reviewed** (when due: "Reviewed. The next date is 2026-12-10, recorded with your name on it."), **Edit** (opens `connedit`).
- `connedit`, "Edit <connection>", subtitle "The secret itself is never readable. Replace it to rotate." Fields: Name, Owner (a person), Next review, Replace the secret (with "A replacement is tested against the provider before it is saved. Grants already minted keep their TTL."). Footer: Cancel, **Save**. An empty name is refused with "A connection needs a name people will read in the audit record."
- `connrevoke`, "Revoke <connection>?". Warning: "Every grant it minted stops at the next use. 23 were minted in 30 days. Calls to stripe are denied until another connection covers them." A financial connection adds "This connection is financial. Revoking it leaves its mandates in place with nothing to draw on; reserved amounts are released at the next boundary." Footer: Cancel, **Revoke it** (danger).
- `connection`, "Add a connection", subtitle "The customer’s credential to a provider. It is tested before it is saved, and it is never readable afterwards." Fields: Name, Kind (`oauth`, `api_key`, `cloud_role`, `github_app`), Owner (a person), Review date, Secret ("Enveloped under the organization’s key. Every read is audited. There is no way to read it back."), and the `two_person` check ("Required for any connection whose tools carry a financial effect."). Footer: "Downscoping for this provider: restricted key.", Cancel, **Test and save**.
- `tool`, from a row of the provider dialog (`tools.md`).

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Backing checked against `macanderson/oxagen` `main` at `bf14d158a` (2026-09-24). A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Provider: registry name, system, description | `PROVIDERS` (`FIXTURES.SERVERS`, grown by `volume()`) | `tools.tool_servers` (spec Appendix A.5) | `list_mcp_servers` returns `publicId`, `name`, `transportType`, `endpointUrl`, `healthStatus`, `lastHealthcheckAt` and `toolCount` (`packages/oxagen/src/contracts/agent.mcp.list.ts:21-57`) from `mcp.mcp_servers` (`packages/database/src/schema/mcp.ts:131-199`). No system name or description apart from the registry name is stored, #3917 (`apps/app/src/features/tools/gaps.ts:10-11`) | 🟡 the registry name only |
| Transport and wire | `PROVIDERS[].transport`, `.wire`, `.url` | a transport of eight values and a wire of five | Every row on the roster is an MCP server, and `transport_type` holds a wire: `streamable-http`, `sse` or `stdio` (`mcp.ts:191-194`). A provider reached over `http`, `native` or a harness hook has nowhere to live, #3917 (`apps/app/src/features/tools/providers.tsx:7-9`) | 🟡 |
| Tools and versions | `PROVIDERS[].tools`, `.versions` | counts per provider | `toolCount` on each server. Versions are counted from `list_tool_versions` by `serverId`, one cursor page at a time | 🟡 |
| Toolbelts and Agents | `providerBelts()`, `providerAgents()` | derived from belts | None, #3852 (`gaps.ts:8-9`) | ❌ |
| Health | `PROVIDERS[].health` | the provider's health | `healthStatus` is `healthy`, `degraded`, `unreachable` or `unknown` (`mcp.ts:187-190`) | ✅ |
| Last import | `PROVIDERS[].imported` | `last_import_at` | Stored on `mcp.mcp_servers` (`mcp.ts:163-167`) and stamped by `import_tools`. `list_mcp_servers` does not return it (`agent.mcp.list.ts:44-55`), so the app renders not recorded | 🟡 |
| Connection per provider | `CONNECTIONS` (`FIXTURES.CONNECTIONS`), `connByServer()` | `tools.connections` bound to providers | `mcp.credentials` holds one credential per installed plugin and workspace, with its OAuth client, scopes, expiry and status (`mcp.ts:82-129`). `list_connections` lists data-source connections (`packages/oxagen/src/contracts/connection.list.ts:4-58`). No Tools read joins a connection to a provider | 🟡 |
| Authorization badge and token expiry | `authBadge()` over `CONNECTIONS[].authState`, `.tokenExp` | the connection's OAuth state | `mcp.credentials.status` (`active`, `needs_reauth`, `revoked`) and `expires_at` exist (`mcp.ts:97-98`), and no Tools read returns them. Client registration, code exchange, refresh, expiry and review dates on a connection are #3918 (`gaps.ts:12-13`) | ❌ |
| Attention warning | derived from `CONNECTIONS` | expired tokens and passed review dates | Neither is recorded on a connection (#3918). The app says it cannot count them (`providers.tsx:11-13`) | ❌ |
| Credential grants log | `GRANTS`, `receiptById()` | `tools.credential_grants` | `list_credential_grants` returns the grant, its connection, server, run, scope (endpoint, auth kind, downscope), provider token id, issue, expiry, revocation and status (`packages/oxagen/src/contracts/credential.grant.list.ts:4-40`, `:42-74`) from `mcp.credential_grants`, whose check keeps a TTL at or under one hour (`mcp.ts:415-468`). The tool version and the agent behind a grant are #3923 (`gaps.ts:20-21`). `installation token` is not a downscope value, and a parked call's "not minted" row has no store | 🟡 |
| Grants in 30 days, per connection and in the caption | `CONNECTIONS[].grants30` | a count over grants | No read returns a count | ❌ |
| Add a provider | `IMPORT_TOOLS` | `register_mcp_server`, `import_tools` | For an MCP server (`packages/oxagen/src/contracts/agent.mcp.register.ts:4-31`, `packages/oxagen/src/contracts/tool.import.ts:76-136`) | 🟡 |
| Re-import tools | `serverReimport()` | `import_tools` | `tool.import.ts:76-136` | ✅ |
| Remove | `serverDelete()` | `delete_mcp_server` | Soft-deletes the server and keeps its tool snapshots at least 365 days for replay (`packages/oxagen/src/contracts/agent.mcp.delete.ts:4-26`). While a kill switch names it, the delete is refused (ADR-071) | ✅ |
| Edit a provider | `serverSave()` | `tools.provider.edit` | None, #3917 | ❌ |
| OAuth: authorize, refresh, disconnect | `oauthAuthorize()`, `oauthRefresh()`, `oauthDisconnect()` | `connection.authorize` | Plugin OAuth exists for installed plugins (`packages/plugins/src/oauth/`). Nothing on Tools reaches it, #3918 | 🟡 |
| Connection open, edit, review, revoke, add | `DLG_EXT.conn`, `connedit`, `connrevoke`, `connection` | `tools.connections` | Credential rows exist (`mcp.ts:82-129`). No owner, review date or downscope is stored on them, #3918 | 🟡 |

## Future-only fields

The renderer puts no `data-future` mark on this tab, and the catalog gives it no future-only story. These fields have no contract today all the same. A build renders each as not recorded, with its gap as `data-gap`, and never as a zero, a blank or a green word:

- The system name and description, a transport other than MCP, and editing a provider (#3917).
- Toolbelts and Agents, on the table and in the dialog (#3852).
- The Authorization badge, the token expiry, the attention warning, and every OAuth and review control (#3918). The app renders the warning as a statement that it cannot count them.
- Last import, until `list_mcp_servers` returns `last_import_at` (#3917).
- In the grants log, the tool version and the agent (#3923), the "not minted" row and the 30-day totals.

## Functionality

- A provider is identified by the system it is, never by its transport. Changing a provider's transport changes one column and nothing about its tools, its policy or its receipts.
- `#/…/tools/servers` lands here, so every link written before the rename still works.
- Toolbelts and Agents are derived from the belts (`providerBelts()`, `providerAgents()`). No count is typed.
- A connection is authorized by a person, never by an agent. Oxagen exchanges the code, envelopes the token under the organization key, and never returns it to a screen. The broker downscopes the credential again for each call, and the agent sees the result, never the credential.
- An expired token denies every call through its connection until somebody reconnects. The provider row, the dialog and the warning read the same record.
- A provider reached in-process or over a harness hook holds no credential and has nothing to authorize.
- Removing a provider takes its versions out of the registry. Belts that carried them lose a tool, and calls to it are denied as `unknown_tool` from the next call boundary. The registry rows are kept for replay.
- A grant's TTL is never more than one hour. The broker mints nothing for a parked call until a person answers.
- Every destructive action says what stops working before it asks, and every write is a governed action recorded in Audit.

## States

`pTools()` branches on the state before it draws anything, so every state but loaded replaces the whole page body, header and tab bar included. The four panels are the ones `tools.md` quotes:

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: "No provider is registered", with **Import a provider** (gold) and **Add a connection**.
- **loading**: the skeleton, four tile blocks and a panel of seven rows.
- **error**: "Tools could not be loaded", `503 tool_registry_unavailable`, **Try again** (gold), **Open an incident** and the trace line.
- **access denied**: "You cannot see the tool registry", naming `tools.read on core-platform`, with **Request access** (gold) and **Back to Work**, then Signed in as, Needed and Decided by.

## Mobile

The shell is as in `tools.md`: the thumb bar holds Work, Agents, Tools, Spend and More, with Tools lit. The tab bar scrolls in its own row. Both tables become stacks of cards, each cell labelled with its column header, and a provider card ends with its Open, Connect and Remove buttons. Every dialog, the provider dialog included, rises from the bottom edge as a sheet, and its tables stack as cards. Touch targets are at least 44 px, inputs are 16 px, and the page never scrolls sideways.

## Permissions

The design names these permissions. The capability that binds each today is in parentheses.

- Read: `tools.read` (`list_mcp_servers` and `list_connections` admit an org Owner or Admin and a workspace Owner or Member, and `list_credential_grants` admits an org Owner, Admin or Compliance member).
- Writes, each a governed action recorded in Audit: `tools.import` (`register_mcp_server`, `import_tools`), `tools.provider.edit` (none), `tools.provider.remove` (`delete_mcp_server`, org Owner or Admin, or workspace Owner), `connection.add`, `connection.authorize`, `connection.edit`, `connection.review` and `connection.revoke` (none on Tools).

## Backend gaps this page depends on

- #3917: providers stored apart from their MCP transport (system, description, transport, wire), editing one, and `last_import_at` on the roster read.
- #3918: the OAuth token lifecycle on a connection: client registration, code exchange, refresh, expiry, owner and review dates.
- #3923: the tool version and the agent behind each credential grant, and a grant count per connection.
- #3852: toolbelts, for the Toolbelts and Agents columns.

## Rules every build of this page must keep

- No heading, tab, panel, column, button or note calls a provider an MCP server or a server. Transport is a column, and `mcp` is one of its values.
- Every badge that describes trust (health, authorization, gate, schema origin) shows the recorded value and nothing stronger.
- Every enforcement claim states the tier. A refused call is refused for calls routed through Oxagen.
- A provider row names the belts and the agents it reaches, and both are derived. Headers are rollups of the rows beneath them: the caption, the warning and the grants caption count the rows they describe.
- A secret is never returned to a screen, and no screen implies an agent holds a credential.
- No person is scored or ranked.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: Add a provider. A row's Connect is not gold.
- Every record this page creates can be opened, edited and removed from the row that names it. A destructive action says what stops working before it asks, and what is kept for replay.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- A not-loaded state replaces the page body and keeps the shell. A stub control says what the product would do. Nothing silently does nothing.
