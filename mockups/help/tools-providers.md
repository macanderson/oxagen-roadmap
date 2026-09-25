# Providers

The systems the registry's tools belong to, the connections that hold their credentials, the grants the broker minted, and the dialogs that open, edit, authorize and remove each one. The header and tab bar are in `tools.md`.

## Providers

The roster of providers: each system, the transport Oxagen reaches it over, its tools, the toolbelts and agents it reaches, its health, and how it is authorized.

### Purpose
It answers "which systems can our agents reach, is each one healthy and connected, and what breaks if I remove one". Open a row for its tools and its connection, connect or reconnect a provider that needs a credential, or remove one.

### Rationale
A provider is the system the tools belong to: GitHub, Stripe, the harness on a host. The transport is how Oxagen reaches it. MCP is one transport among several. A provider reached over `http`, `native` or a harness `local` hook is imported, versioned and checked the same way, and the registry, the policy and the receipts work the same for every transport (`docs/mission-control-spec.md` §6.4). So the page names a provider by its system and shows the transport as one column, and no label calls a provider an MCP server (the vocabulary table in `docs/fleet-operations-ia.md`).

A connection is the customer's credential to a provider. A person authorizes it, never an agent (§6.8). A provider reached in-process or over a harness hook holds no credential and has nothing to authorize, which is why its Authorization cell reads "none needed".

The caption's second and third sentences and the transport note under the table moved here. The caption keeps its one fact, the two counts.

The logomark, the website, the docs and the source come from the provider's entry in the official MCP Registry (`registry.modelcontextprotocol.io`), or from the 18 vendor servers Oxagen checked by hand. They let you recognize a provider at a glance and reach its own documentation from the row. The registry has no docs field, so Docs appears only where a verified entry names its own docs page. A provider added by hand has no entry, and its row shows its first letter on a tile.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| System, description | `PROVIDERS` (`FIXTURES.SERVERS`, grown by `volume()`) | `tools.tool_servers` (#3917) | partial |
| Logomark | `PROVIDERS[].icon`, `providerMark()` | `list_mcp_servers` `iconUrl` (OAuth providers only, #4327) | partial |
| Website, Docs, Source | `PROVIDERS[].website`, `.docs`, `.source`, `providerLinks()` | `list_mcp_servers` (#4327) | future |
| Transport, wire, endpoint | `PROVIDERS[].transport`, `.wire`, `.url` | `mcp.mcp_servers.transport_type` | partial |
| Tools, versions | `PROVIDERS[].tools`, `.versions` | `list_mcp_servers` `toolCount` | partial |
| Toolbelts, Agents | `providerBelts()`, `providerAgents()` | derived from toolbelts (#3852) | future |
| Health | `PROVIDERS[].health` | `healthStatus` | live |
| Connection | `connByServer()` over `CONNECTIONS` | `tools.connections` | partial |
| Authorization | `authBadge()` over `CONNECTIONS[].authState`, `.tokenExp` | OAuth lifecycle (#3918) | future |
| Last import | `PROVIDERS[].imported` | `last_import_at` | partial |
| Attention warning | `CONNECTIONS` with `authState` expired or `status` review due | derived (#3918) | future |

### Logic
1. The caption counts `srvCount()` providers and `verCount()` versions from the rows.
2. `needsAuth(sv)` is true unless the provider's connection is `none`. Such a provider with no matching connection reads Health "Not connected".
3. `authBadge()` maps the connection's `authState` to a badge: connected, token expired, key held, role assumed, or not connected, over the token's expiry.
4. The actions column carries **Open** (opens `server`), then **Manage connection** when the provider has a live connection, **Connect** when it has none, or **Reconnect** when the token expired (both open `oauth`), then **Remove** (opens `serverdel`).
5. The warning under the table counts connections with an expired token or a passed review date and names each one. Calls through an expired connection are blocked until someone reconnects it.
6. **Add provider** is the tab's gold action and opens `import`.

### States
- **Loaded**: 19 providers. The first eight carry every field, and the eleven `volume()` adds carry a system, a description and a wire.
- **Empty, loading, error, denied**: the page is replaced by the Tools state panel (see `tools.md`, Header).
- **Mobile**: labelled cards, each ending with its buttons.
- **In the app**: every row is an MCP server named by its registry name. The system name, a non-MCP transport, the authorization badge and the attention warning render not recorded (#3917, #3918).

## Credential grants log

The most recent credentials the broker minted for single tool calls, each with its scope, its time to live, and its state.

### Purpose
It answers "what credential did Oxagen hand out for this call, how narrow was it, and is it still live". Open a connection from any row to see its other grants.

### Rationale
A wrapped agent holds no tool credential. For each dispatched call, the broker mints the narrowest credential the provider allows: a token exchange, a session policy, an installation token, a restricted key, or, where the provider supports none of those, the stored credential used by the gateway for that call only (§6.8). Each mint is a credential grant recorded on its call's frames and receipt. The TTL defaults to the call's expected duration plus a margin, never more than one hour. The agent sees the result and never the credential.

A parked call has no grant yet. A credential is issued only after someone approves, so its row reads "Not issued" and names the approval it waits on.

The caption's second sentence, the footer, and the second sentence of the parked row moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Grant, scope, TTL, state | `GRANTS` | `list_credential_grants` | partial |
| Tool version, agent, run | `GRANTS[]`, `receiptById()` | the grant's call (#3923) | future |
| Connection and downscope | `CONNECTIONS[].downscope` | `mcp.credential_grants` | partial |
| 30-day total | sum of `CONNECTIONS[].grants30` | a count over grants | future |

### Logic
1. `grantsLog()` prints four rows. A settled row reads its tool, agent and run from its receipt and links it.
2. The State badge reads Expired, Not issued, or Settled.
3. The connection cell is a link that opens `conn`, with the downscope under it.
4. The badge "4 most recent shown" counts the rows. The table carries no list controls.

### States
- **Mobile**: labelled cards.
- **In the app**: the tool version and the agent behind a grant are #3923. `installation token` is not a stored downscope value, and a parked call's row has no store.

## Provider {#dialog/server}
<!-- open: openDialog('server', 'slack') -->

One provider: its system, transport, registry name, schemas, versions, the toolbelts and agents it reaches, its authorization, and the tools imported from it.

### Purpose
It answers "what did this provider give us, how do we reach it, and who can call it". From here you reconnect or edit its connection, re-import its tools, edit its endpoint, or remove it.

### Rationale
The dialog gathers the three things a person checks before changing a provider: its health, its credential, and its tools. A degraded provider's calls are retried once and then blocked, and the run records each one on its frames. An expired token takes every tool below it out of reach until someone reconnects. Waiting schemas mean outputs are validated only for size and type until an admin approves them (§6.4).

The transport sub-line ("How oxagen reaches it. The registry, the policy, and the receipts work the same for every transport.") and the degraded warning's last sentence moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| System, transport, registry name, schemas, versions, last import | `serverById()` over `SERVERS` | `list_mcp_servers` (#3917) | partial |
| Toolbelts, agents reached | `providerBelts()`, `providerAgents()` | #3852 | future |
| Authorization block | `connByServer()`, `authBadge()`, `brokerMints()` | `tools.connections` (#3918) | future |
| Tools imported | `serverTools()` over `TOOLS` | `list_tool_versions` by `serverId` | partial |

### Logic
1. Warnings print in order: degraded, expired token, schemas awaiting approval.
2. The Authorization block has three forms. With a connection: its link, badge, scopes, owner and review dates, what is issued per call, and grants in 30 days, then the buttons its state allows (**Reconfigure OAuth** or **Reconnect** for OAuth and GitHub App connections, **Refresh the token** and **Disconnect** when connected, **Edit the connection** and **Revoke** always). With none on a provider that needs one: "Every call to it is blocked until someone connects it." With no credential to hold: "This provider holds no credential, so there is nothing to authorize."
3. **Re-import tools** stamps the import time and toasts "Re-imported GitHub. New versions appear as new rows." A new version joins no toolbelt on its own.
4. **Edit** opens `serveredit`. **Remove** opens `serverdel`.

### States
- An id that no longer exists reads "That record is no longer here."
- **Mobile**: a bottom sheet, tables as cards.

## Provider edit {#dialog/serveredit}
<!-- open: openDialog('serveredit', 'github') -->

A form that changes a provider's endpoint, transport, wire and connection.

### Purpose
It answers "the provider moved, or its credential changed: point Oxagen at the new one".

### Rationale
Changing the endpoint does not re-import. Tool versions already on a toolbelt keep their digest until a re-import brings a new one, so an endpoint change cannot silently swap the schema an agent was shown. A transport change changes one column and nothing about the provider's tools, policy or receipts.

The subtitle and the note moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Endpoint, transport, wire, connection | `SERVERS[]`, `CONNECTIONS` | `tools.provider.edit` (#3917) | future |

### Logic
1. Transport offers `mcp`, `http`, `graphql`, `sdk`, `cli`, `native`, `local` and `rpc`. Wire offers `streamable-http`, `https`, `stdio`, `in-process` and `hook`.
2. `serverSave()` refuses an empty endpoint with "A provider needs an endpoint.", writes the fields, and toasts that the provider is reached at the new endpoint from the next call.

### States
- **Mobile**: a bottom sheet.

## Provider removal {#dialog/serverdel}
<!-- open: openDialog('serverdel', 'github') -->

A confirmation that says what stops working before it removes a provider.

### Purpose
It answers "if I remove this provider, what breaks". It counts the versions that leave and the toolbelts that lose a tool.

### Rationale
Removing a provider takes its versions out of the registry. Toolbelts that carried them lose a tool, and calls to it are denied as `unknown_tool` from the next call boundary. The registry rows are kept, so a run that already called the provider still cites the version it called, and re-importing the same endpoint restores it. The build keeps the snapshots at least 365 days for replay, and refuses the delete while a kill switch names the provider (ADR-071).

The note that said this moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Versions, toolbelts | `SERVERS[].versions`, `providerBelts()` | `delete_mcp_server` | live |

### Logic
1. The warning counts versions and toolbelts. With no toolbelt: "No toolbelt reaches it, so nothing in flight is denied."
2. **Remove it** calls `serverDelete()`, which splices the provider from `SERVERS` and toasts that its versions are out of the registry and off every toolbelt.

### States
- **Mobile**: a bottom sheet.

## OAuth connection {#dialog/oauth}
<!-- open: openDialog('oauth', 'slack') -->

The form that registers Oxagen with a provider as an OAuth app and sends a person to authorize it.

### Purpose
It answers "how do I connect this provider, or bring back one whose token expired". You enter the client id, secret, authorization URL and scopes once, then authorize by clicking.

### Rationale
A connection is authorized by a person, never by an agent (§6.8). Authorizing opens the provider in a new tab. When it redirects back, Oxagen exchanges the code, encrypts the token with the organization key, and records who authorized it. The token never appears on a screen and is never sent to an agent. Oxagen narrows the scopes again on each call, so the scopes here are a ceiling, not the grant a call receives. Reconnecting an expired token changes nothing else about the connection.

The subtitle, the last sentence of the expired warning, the scopes hint's second sentence, and the note after its first sentence moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Client id, URL, scopes | `CONNECTIONS[].client`, `.authUrl`, `.scopes` | OAuth client registration (#3918) | future |
| Redirect URL | `ASST_ENGINE_URL` + `/oauth/callback` | the engine's callback | future |
| Token expiry | `CONNECTIONS[].tokenExp` | `mcp.credentials.expires_at` | partial |

### Logic
1. The title reads "Connect <system>", or "Reconnect <system>" when the token expired.
2. `oauthAuthorize()` refuses without a client id and an authorization URL. Otherwise it creates the connection if none exists, sets it connected with a new expiry, and toasts "<system> authorized as Marcus Bell. The token expires 2026-12-20 09:00 UTC."
3. `oauthRefresh()` and `oauthDisconnect()`, reached from the provider dialog, refresh or drop the token. Credentials already issued keep their own expiry.

### States
- **Mobile**: a bottom sheet.
- **In the app**: plugin OAuth exists for installed plugins, and nothing on Tools reaches it (#3918).

## Connection {#dialog/conn}
<!-- open: openDialog('conn', 'con_01K2AB') -->

One connection: its owner, providers, downscope, what the broker issues per call, its grants, and its review dates.

### Purpose
It answers "whose credential is this, how narrow is each grant, and is it due for review". Mark it reviewed, edit it, or revoke it.

### Rationale
A connection has a human owner and a review date (§6.8). A connection behind a financial tool needs an owner with a finance role. No agent holds the credential. The secret was enveloped under the organization key at save and cannot be read back. Marking a connection reviewed sets the next date 90 days out and records your name.

The note, the owner's "required on a financial connection" clause, and the review warning's last clause moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Owner, providers, downscope, review dates | `connById()` over `CONNECTIONS` | `tools.connections` (#3918) | future |
| Issued per call | `brokerMints()` over `BROKER_CAPS` | the broker's capability per provider | future |
| Recent grants | `GRANTS` filtered by connection | `list_credential_grants` | partial |

### Logic
1. A passed review date prints a warning with the grants issued since, and adds **Mark reviewed**, which calls `connReviewed()`.
2. **Edit** opens `connedit`. **Revoke** opens `connrevoke`.

### States
- **Mobile**: a bottom sheet.

## Connection edit {#dialog/connedit}
<!-- open: openDialog('connedit', 'con_01K2A7') -->

A form that renames a connection, changes its owner and next review, and replaces its secret.

### Purpose
It answers "rotate this secret" or "hand this connection to another owner".

### Rationale
The secret is never readable, so the only way to rotate it is to replace it. A replacement is tested against the provider before it is saved, and credentials already issued keep their expiry. The owner is a person, because a review needs someone who answers for it. The name is what people read in the audit record.

The subtitle and the secret hint moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, owner, next review, secret | `CONNECTIONS[]` | `connection.edit` (#3918) | future |

### Logic
1. `connSave()` refuses an empty name with "A connection needs a name." It writes the fields, and a next review after today clears a review-due status.
2. With a new secret, the toast reads "Tested against the provider, then saved. The old secret stops working at the next call."

### States
- **Mobile**: a bottom sheet.

## Connection revoke {#dialog/connrevoke}
<!-- open: openDialog('connrevoke', 'con_01K2A9') -->

A confirmation that says what stops before it revokes a connection.

### Purpose
It answers "if I revoke this credential, which calls stop". Revoke a credential you suspect leaked.

### Rationale
Every credential a connection issued stops working at its next use (§6.8). Calls to its providers are blocked until another connection covers them. A financial connection leaves its mandates in place with nothing to draw on, and reserved amounts are released at the next checkpoint. The last sentence moved here from the note.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Grants 30d, providers | `CONNECTIONS[].grants30`, `.servers` | `connection.revoke` (#3918) | future |

### Logic
1. **Revoke it** calls `connRevoke()`, which removes the connection and toasts "Revoked <name>. Its credentials stop working at their next use."
2. Revoking is a governed action recorded in Audit. The design names `connection.revoke`, and no capability binds it on Tools today. A connection kill switch on Kill switches stops the same calls without deleting the record, which is the safer first move when a leak is only suspected.

### States
- **Mobile**: a bottom sheet.

## Connection add {#dialog/connection}

A form that stores a new credential to a provider: an OAuth app, an API key, a cloud role or a GitHub App.

### Purpose
It answers "this provider takes a key or a role, not an OAuth click". It opens from the empty state and from a provider with no connection.

### Rationale
A connection is the customer's credential to a provider. It is tested before it is saved, and it is never readable afterwards: the secret is enveloped under the organization's key and every read is audited (§6.8). `two_person` is required for any connection whose tools carry a financial effect. The footer names the downscoping the provider allows, because that is how narrow each call's grant can be.

The subtitle and the secret hint's first two sentences moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, kind, owner, review date, secret | form fields | `connection.add` (#3918) | future |

### Logic
1. **Test and save** closes the dialog and toasts "Tested against the provider, then saved." The mockup writes nothing to `CONNECTIONS`.

### States
- **Mobile**: a bottom sheet.
