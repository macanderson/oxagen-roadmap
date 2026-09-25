# MCP traffic through the gateway

| | |
|---|---|
| **Status** | Plan v1, for review. Nothing in it is built. |
| **Date** | 2026-09-25 |
| **Owner** | Mac Anderson |
| **Tracks** | `oxagen` #3299 item 6, "Build the MCP aggregator: re-serve the harness's existing MCP servers through the loopback proxy. Where a vendor offers managed settings, pin them." |
| **Source** | `macanderson/oxagen` at `main` `4a21610ef`: `packages/tacho/src/collector/mcp-gateway.ts`, `host/mcp-config-writer.ts`, `host/cursor-writer.ts`, `contained/bridge.ts`, `contained/configuration.ts`, `packages/handlers/src/tacho.events.ingest.ts`. `macanderson/stella`: `crates/stella-cli/src/agent.rs`, `crates/stella-mcp/`. Vendor documentation read on 2026-09-25, linked where used |
| **Builds on** | ADR-094 part 3 (the MCP aggregator), ADR-095 (the ladder), ADR-078 §3 (a second MCP server never touches Oxagen), ADR-143 (credential custody), ADR-152 (the contained bridge) |
| **Related** | `tier-ladder-spec.md` (the `gateway` tier and its conflicts), `oxagen` `docs/reference/harness-matrix.md` |

---

## The gap

You enroll Claude Code, Codex, Cursor, or Stella, and each MCP tool call the agent makes goes straight from the harness to the MCP server. The `PreToolUse` hook sees the call as `mcp__<server>__<tool>`, records it, and can refuse it. That evidence is client-attested. No wrapped run earns `gateway` through MCP today.

The one MCP gateway Oxagen has serves a different job. Enrollment registers it in Claude Desktop only (`CONNECTED_HARNESSES`, `wire.ts:343`). It relays calls to Oxagen's own remote MCP server (`apps/mcp`) and serves Oxagen's own read-only tools (`gatewayMayInvoke`, `packages/iam/src/machine-key-scope.ts:144-151`). It cannot front a third-party server, and it spawns nothing.

The contained bridge serves `/mcp` too (`contained/bridge.ts:118-128`), and nothing inside the container points at it (`contained/configuration.ts` writes only the model base URL).

## What routing adds

Routing a call through a daemon Oxagen runs adds four things over the hook:

1. **An observed record.** The gateway seals the request and the result as it saw them. The hook path does not write tool result bodies yet.
2. **A refusal outside the harness.** A pinned harness cannot reach the server except through the gateway, so the harness cannot skip the check.
3. **A tier.** Routed MCP calls earn `gateway`, scoped to those calls. Cursor has no model route, so MCP is its only road to `gateway`.
4. **Credential custody, later.** The gateway can hold an upstream server's credential so the harness never sees it (phase 6).

## Decisions

### One route per server, under its own name

The daemon serves one loopback route for each MCP server the harness had, and the harness config keeps the original server name. A single endpoint that merges every server would rename the tools. That breaks every per-server rule the harnesses key on: Claude Code's `mcp__github__.*` matchers and permission rules, Codex's `enabled_tools` and `tools.<tool>.approval_mode`, Cursor's `Mcp(server:tool)` rules, and Stella's tool policy and per-server caps (`stella-mcp/src/lib.rs:47-53`). The MCP tools specification also says an aggregating proxy should prefix tool names and should not rely on `serverInfo.name` ([tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)). One route per server avoids both.

- **An HTTP server.** Enrollment rewrites its `url` to `http://127.0.0.1:<port>/mcp/relay/<server>`. The daemon forwards each request to the original URL with the original headers.
- **A stdio server.** Enrollment replaces its command with a relay, `tacho mcp-relay --server <name> -- <original command and args>`. The harness spawns the relay with the same working directory and environment it would have given the server. The relay spawns the original server as its child and passes each JSON-RPC message through the daemon for the check and the seal. The server's environment and lifetime stay what the harness gave it, and the daemon stays the one place that decides.

The relay and the HTTP route speak both the 2025-06-18 and 2026-07-28 protocol revisions. The newer revision's `Mcp-Method` and `Mcp-Name` headers let the daemon route and log a call without parsing the body ([streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)).

### A third road to `gateway` at ingest

Today `enforcementTierOf` promotes a session to `gateway` on two kinds of evidence (`ingest:810-841`): a model call the loopback proxy sealed, or an MCP call the control plane served itself. A relayed call to a third-party server fits neither. The control plane never serves it, because the call goes from the machine to the server.

The relayed call is daemon-sealed, like a model call. So ingest gains a third road that mirrors `modelRouted`: the verified chain holds a `tool_call` frame with `source: collector`, `fidelity: proxy`, and `tool_source: mcp`. A record posted through the local OTLP endpoint cannot carry that source and fidelity. ADR-095 already licenses the road ("model and MCP requests seen by the gateway for that run give `gateway`"). This is the first thing to build, because without it routing MCP earns no tier.

### One call, one record

`PreToolUse` still fires for every `mcp__*` call after routing. The hook stays: it refuses before the call starts, and it is the only check on built-in tools. So each routed call arrives twice, once from the hook and once from the relay.

Ingest keeps both and counts the call once, the way metering already treats a model call (`ingest:280-296`). The relay frame carries the input digest the hook also records. Ingest links the two on the session, the tool name, and the input digest, and the observed frame replaces the self-reported one in every count. This answers the Cursor writer's objection (`cursor-writer.ts:42-54`: "would record the same call twice… and put one harness on two tiers"). A run earns one tier, the highest its record supports, and each call shows how it was seen.

### Oxagen does not edit repositories

Enrollment rewrites user-scope config only. A project file (`.mcp.json`, `.codex/config.toml`, `.cursor/mcp.json`, `.stella/mcp.toml`) belongs to the repository. Oxagen does not write into it, because the change would land in the customer's commits. A project-scope server stays hook-checked at `harness` strength on a laptop. On a managed device, the pin below either blocks it or lets an admin add it to the relayed set.

### Restore exactly

Each writer uses displace-and-restore, as `host/mcp-config-writer.ts` already does for Claude Desktop. `unenroll` leaves every file byte-identical to before `enroll` ran (#3299 definition of done). The health report gains `mcp_servers.ours`, the MCP counterpart of `model_base_urls.ours` (`wire.ts:1006-1019`), so an operator sees a server someone pointed back at its upstream.

### Failure behavior

The relay follows the model proxy's rule (`model-proxy.ts:46-64`):

- **A fault of Oxagen's never stops a call.** An unreachable control plane leaves the cached bundle deciding.
- **An operator decision always stops one.** A rule deny, a paused or cancelled session, and a suspended or revoked host all refuse, with the refusal sealed as a `policy_decision`.
- **The daemon is down.** The relay refuses `tools/call` with a JSON-RPC error that names the daemon. An HTTP route gets a refused connection. Neither falls through to the upstream.

### Credentials

Phases 1 to 5 pass upstream credentials through unchanged: headers on an HTTP route, the environment on a stdio relay. The daemon neither stores nor logs them. OAuth tokens are bound to the upstream's URL (RFC 8707), so a rewritten `url` breaks an OAuth server until the daemon runs discovery and holds the token itself. Phase 6 builds that. Until then enrollment leaves an OAuth server unrewritten and hook-checked, and says so in `tacho status`.

The credential-custody spec (`docs/specs/credential-custody/spec.md:29,39`) already says the gateway holds third-party credentials such as Slack and Stripe. The code does not. Phase 6 makes that sentence true, and until then the spec needs a correction.

## Harnesses

| Harness | Where servers live | What enrollment rewrites | How an admin pins it | Local veto | Result |
|---|---|---|---|---|---|
| Claude Code | `~/.claude.json` (user and local scope), `.mcp.json`, plugins, claude.ai connectors | User and local scope in `~/.claude.json` | `managed-mcp.json`, exclusive | `PreToolUse` on `mcp__*` | Possible for local servers. Connectors never route |
| Codex | `~/.codex/config.toml`, `.codex/config.toml`, plugins, apps | `[mcp_servers.*]` in `~/.codex/config.toml` | `requirements.toml` `[mcp_servers.<id>]` identities | `PreToolUse` on `mcp__*` | Possible for local servers. Apps never route |
| Cursor | `~/.cursor/mcp.json`, `.cursor/mcp.json`, plugins, extensions, team servers | `~/.cursor/mcp.json` | Cursor's team dashboard only | `beforeMCPExecution` | Possible for local servers. Cloud Agents never route. The pin is the customer's to set |
| Stella | `.stella/mcp.toml` in each workspace, plugins | Nothing | Nothing | `PreToolUse` on `mcp__*` | Not possible today. Needs a Stella change |

### Claude Code

Possible for the servers you configure locally.

- **Rewrite.** User and local scope in `~/.claude.json`: stdio commands become relays and URLs become loopback routes ([MCP](https://code.claude.com/docs/en/mcp)).
- **Pin.** On a managed device, Oxagen writes `managed-mcp.json` (`/Library/Application Support/ClaudeCode/`, `/etc/claude-code/`, or `C:\Program Files\ClaudeCode\`) with the relayed servers and sets `allowManagedMcpServersOnly: true`. The allowlist entries match the relay by exact `serverCommand` or by `serverUrl`. Oxagen never uses `serverName`, which the docs say "is not a security control" ([managed MCP](https://code.claude.com/docs/en/managed-mcp)).
- **What the pin costs.** It drops plugin servers and `--mcp-config` servers. A run that passes `--mcp-config` exits at startup, and `--strict-mcp-config` exits everywhere, which breaks Agent SDK and `-p` callers that bring their own servers. It suppresses claude.ai connectors unless the admin sets `allowAllClaudeAiMcps`. Enrollment states all of this before it writes the file.
- **Local veto.** `PreToolUse` already matches `mcp__*`. From v2.1.274 the hook input carries `mcp_server.source` ([hooks](https://code.claude.com/docs/en/hooks)), so an enforce-mode rule can refuse calls from sources the relay does not cover.
- **Never routes.**
  - claude.ai connectors. The desktop app's local and SSH sessions receive them in-process as `sdk` servers that "no MCP setting or `managed-mcp.json` reaches". In cloud and self-hosted sessions, "Anthropic calls connector tools from its own infrastructure" ([self-hosted](https://code.claude.com/docs/en/self-hosted-environments-deploy)). The Microsoft 365, Gmail, and Google Calendar connectors also reject local OAuth.
  - In-process `type: "sdk"` servers from the Agent SDK. They skip every managed check.
  - Built-in tools: `WebSearch` (runs on Anthropic's backend), `WebFetch`, Claude in Chrome, and the `ide` server. They are not MCP traffic.

### Codex

Possible for the servers you configure locally.

- **Rewrite.** `[mcp_servers.<name>]` in `~/.codex/config.toml` ([MCP](https://learn.chatgpt.com/docs/extend/mcp)). Codex supports stdio and streamable HTTP, with no SSE.
- **Pin.** `requirements.toml`, from `/etc/codex/requirements.toml`, the MDM key `com.openai.codex:requirements_toml_base64`, or the cloud bundle ([managed configuration](https://learn.chatgpt.com/docs/enterprise/managed-configuration)). Each relayed server gets an `[mcp_servers.<id>]` entry with the structured `executable` plus `args[]` identity. The string `identity.command` form ignores arguments, so it cannot tell the relay for one server from the relay for another. Oxagen also pins `features.apps = false`, because the docs do not say whether the allowlist governs the hosted apps server.
- **Sandbox.** MCP servers run outside Codex's sandbox, and its network proxy "does not filter … MCP server connections", so the relay's loopback route is reachable. `allow_local_binding = false`, the default, keeps sandboxed shell commands off the relay's port ([permissions](https://learn.chatgpt.com/docs/permissions)).
- **Local veto.** `PreToolUse` matches `mcp__server__tool` ([hooks](https://learn.chatgpt.com/docs/hooks)). Oxagen's mandate code names MCP tools only for Claude Code and Cursor (`tacho-mandate.ts:57-58`), and phase 4 adds Codex.
- **Never routes.**
  - Apps and connectors. Codex registers a hosted `codex_apps` server at `chatgpt_base_url`, and connectors "use their own service-side connections".
  - Hosted `WebSearch`. No hook fires for it.
- **Unknown.** `experimental_environment = "remote"` starts a stdio server through a remote executor. The docs do not say how identity matching treats it. The phase 4 rig tests it.

### Cursor

Possible for the servers you configure locally. The pin is a setting only the customer's Cursor admin can change.

- **Rewrite.** `~/.cursor/mcp.json`, and the second location when `CURSOR_CONFIG_DIR` or `XDG_CONFIG_HOME` moves the config directory, as the hooks writer already handles ([MCP](https://cursor.com/docs/mcp)). This lifts the refusal in `cursor-writer.ts:42-54`, once the one-record rule above is built.
- **Pin.** Cursor has no local managed MCP file. Its Enterprise MCP Allowlist lives under Team Settings > MCP Configuration in Cursor's dashboard, and matches full command strings and full URLs with `*` wildcards ([model and integration management](https://cursor.com/docs/enterprise/model-and-integration-management)). Oxagen cannot write it. The admin guide gives the two patterns to allow (`tacho mcp-relay *` and `http://127.0.0.1:<port>/mcp/relay/*`) and says to leave "User MCP extensions" off.
- **Local veto.** `beforeMCPExecution` receives the server's `url` or `command` and can deny ([hooks](https://cursor.com/docs/hooks)). Oxagen registers it in the enterprise `hooks.json` (`/Library/Application Support/Cursor/hooks.json`, `/etc/cursor/hooks.json`, or `C:\ProgramData\Cursor\hooks.json`) with `failClosed: true`, and it refuses any MCP call whose command or URL is not a relay. The event fails open on a crash or timeout unless `failClosed` is set.
- **Never routes.**
  - Cloud Agents. Team MCP servers run in Cursor's cloud, and MCP hooks are deferred there.
  - Browser, which is an MCP server running in-process as an extension, and the built-in Web search and Fetch tools.
  - Servers an extension registers through `vscode.cursor.mcp.registerServer()`. No file holds them, and the docs do not say whether the allowlist covers them.
- **Unknown.** Under the admin network mode "Deny all", stdio servers run sandboxed, and the docs do not say whether that sandbox allows loopback. If it does not, the relay cannot reach the daemon. The phase 4 rig tests it.
- **Budgets stay off.** Cursor's model calls still go to Cursor's servers, so a routed Cursor run is `gateway` for its MCP calls only, with no budget.

### Stella

Not possible today. Stella reads MCP servers only from `<workspace>/.stella/mcp.toml` and from plugin `mcp.toml` files (`stella-cli/src/agent.rs:801`, `plugin_cmd/package.rs:112-118`). It has no user-scope or managed-scope server list: `[mcp.servers]` in `stella.toml` is parsed and ignored at every scope (`settings/toml_config.rs:18-20`). Routing Stella would mean editing a file in every repository, which this plan rules out. It would still miss untrusted checkouts, where Stella loads nothing from the workspace file (`agent.rs:817-823`).

Stella is Oxagen's own harness, so this limit is Oxagen's to remove. The Stella change:

1. Read `[mcp.servers]` at user and managed scope, with the workspace file merged on top by name.
2. Add a managed allowlist of server identities (command and arguments, or URL), matching the Codex and Claude Code shape.
3. Let a managed scope forbid workspace and plugin servers.

With that in place, Stella gets the same writer and pin as the others. Two Stella details the relay must handle: a stdio child gets only its `env` table plus `PATH` (`stella-mcp/src/stdio.rs:244-262`), so the relay replaces the command and cannot be injected through the environment. Stella also replays `Mcp-Session-Id` per transport (`stella-mcp/src/http.rs:1-8`), so the HTTP route keeps one session per server.

**Stella in-app runs** (`arun_`) are a separate case. The engine runs on `stella-serve` with a `remote` tool surface, and every tool call returns to Oxagen's kernel (ADR-053). External MCP for those runs executes server-side under `mcp.<server>.<tool>` identities (ADR-122). No local relay is involved, and none is needed.

## What never routes

These calls never pass a local gateway, whatever Oxagen builds. The matrix names each one.

| Harness | Surface | Why |
|---|---|---|
| Claude Code | claude.ai connectors | The desktop app runs them in-process, and cloud sessions call them from Anthropic's infrastructure |
| Claude Code | Agent SDK `type: "sdk"` servers | In-process, outside every managed control |
| Claude Code | `WebSearch`, `WebFetch`, Chrome, `ide` | Built-in tools. `WebSearch` runs on Anthropic's backend |
| Codex | Apps and connectors | A hosted server with service-side connections |
| Codex | Hosted `WebSearch` | No hook fires |
| Cursor | Cloud Agents | Team MCP servers run in Cursor's cloud |
| Cursor | Browser, Web search, Fetch | Built-in, or in-process |
| Claude Desktop | Remote connectors | Anthropic's cloud calls them ([support](https://support.claude.com/en/articles/11175166)) |

For a managed device, Oxagen's answer to a surface it cannot route is to turn it off: `disableClaudeAiConnectors` for Claude Code and `features.apps = false` for Codex. On a laptop those calls stay hook-checked, and the record shows them as not routed.

## Build order

Each phase ships on its own and leaves the matrix true.

1. **Ingest.** The third road to `gateway`, the `tool_call` frame shape (`source: collector`, `fidelity: proxy`, `tool_source: mcp`, `oxagen.mcp_server`, input and output digests), and the one-record rule. Tests prove a hook-only MCP call stays `harness`, and a relayed one earns `gateway` and counts once.
2. **Relay.** `tacho mcp-relay` for stdio and `/mcp/relay/<server>` for HTTP in `tachod`. Each `tools/call` is checked against the bundle's `mcp__server__tool` rules, sealed, and refused on operator state. The daemon-down path refuses.
3. **Writers.** Claude Code, Codex, and Cursor user-scope rewrites with displace-and-restore, `mcp_servers.ours` in the health report, and the Cursor writer's refusal lifted. OAuth servers are left alone and listed in `tacho status`.
4. **Pins.** `managed-mcp.json` for Claude Code, `requirements.toml` for Codex, the Cursor admin guide and enterprise `beforeMCPExecution`, and Codex MCP naming in `tacho-mandate.ts`. This phase needs a rig (`needs:rig`) for the two unknowns: the Codex remote environment and Cursor's "Deny all" loopback.
5. **Contained.** The bridge serves the relay routes, and `contained/configuration.ts` writes each server's relay into the container's harness config. The `contained` CI job proves an MCP call inside the container reaches its upstream only through the bridge.
6. **Credentials and OAuth.** The daemon holds upstream credentials and runs OAuth for relayed HTTP servers. The credential-custody spec's claim becomes true.

A separate Stella track runs beside phases 1 to 3: the managed MCP scope in `macanderson/stella`, then a Stella writer.

## Definition of done

- A Claude Code, Codex, or Cursor run whose MCP call went through a relay reads `gateway` at ingest, and the call is counted once.
- A hook-only MCP call leaves the run on `harness`.
- `unenroll` leaves every MCP config byte-identical to before `enroll`.
- With the daemon stopped, a relayed call is refused, never forwarded.
- On a pinned Claude Code or Codex host, a server added outside the relay does not load.
- Inside a contained run, an MCP call reaches its upstream only through the bridge.
- The harness matrix on the website and in `docs/reference/harness-matrix.md` changes in the same pull request as each phase that changes a cell.
