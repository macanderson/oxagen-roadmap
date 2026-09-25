# The Oxagen gateway

| | |
|---|---|
| **Status** | Plan v2, for review. Nothing in it is built. v1 planned a relay on each laptop. The maintainer chose the cloud gateway model on 2026-09-25, and v2 replaces v1. |
| **Date** | 2026-09-25 |
| **Owner** | Mac Anderson |
| **Decision** | Every customer agent's model and MCP traffic routes through Oxagen's gateway. Oxagen holds the model keys and the MCP credentials. Oxagen hosts the gateway by default, and the largest customers can run it in their own network. Oxagen is the one place a team sets up steering, tools, skills, agent profiles, and memories. Agents on different runtimes message and start one another through Oxagen. |
| **Tracks** | `oxagen` #3299 item 6 (MCP), and the ADR this plan asks for (below) |
| **Source** | `macanderson/oxagen` at `main` `c0a40a9ce`: `packages/tacho/src/collector/model-proxy.ts`, `mcp-gateway.ts`, `packages/agent/src/runtime/materialize-tools.ts`, `packages/database/src/schema/mcp.ts`, `packages/iam/src/machine-key-scope.ts`, `packages/handlers/src/tacho.events.ingest.ts`. Kong's documentation, read 2026-09-25 |
| **Supersedes in part** | ADR-094 (the gateway runs on the laptop, and prompt bodies never reach Oxagen), ADR-143 (the vendor key sits in a file on the laptop), ADR-122:19 (an agent's own identity cannot call an external tool) |
| **Related** | `tier-ladder-spec.md`, `oxagen` #4310 (the in-app agent leaves the toolbelt), `stella` #6564 (Stella's MCP scope) |

---

## The problem

You set up a team's tools, rules, and budgets in Oxagen, and then your agents run without most of it. Oxagen delivers context records at session start and records what the hooks see. The rest stops at the authoring side:

| | Claude Code, Codex, Cursor, Stella CLI | Claude Desktop |
|---|---|---|
| Context records | `must` and `should` records at session start. `may` and `info` are cut | Pull only, through read-only tools |
| Toolbelt | No. The workspace's registered MCP servers reach only Oxagen's in-app agent | No |
| Skills | No. `.oxagen/skills/` is written and never delivered | No |
| Agent profile | Budget, containment, and tool rules go into the signed bundle. `instructions` do not reach the agent | No |
| Memories | No. Tacho records memory file paths, never their content | Pull only |
| Model keys | In `credentials.json` on the laptop for Claude Code and Codex, readable by the machine's owner | n/a |

The kill switch has the same gap. Today's gateway runs on the laptop. The machine's owner can unset the base URL, read the key from custody, and call the vendor directly. So a paused or cancelled run can keep going.

## What Kong does

Kong Gateway puts the AI MCP Proxy plugin between an MCP client and the upstream servers. The plugin applies OAuth, per-tool access lists (Kong Gateway 3.13 and later, with an audit log), and rate limits, and it logs each JSON-RPC call with its payload ([MCP gateway](https://developer.konghq.com/mcp/), [AI MCP Proxy](https://developer.konghq.com/plugins/ai-mcp-proxy/)). Kong runs the control plane as a service (Konnect). The data plane that carries traffic runs in one of two places:

- **Kong-hosted.** With Dedicated Cloud Gateways, Kong manages both planes ([announcement](https://konghq.com/blog/product-releases/dedicated-cloud-gateways)).
- **Customer-hosted.** In hybrid mode, the customer runs the data plane, and it pulls its configuration from the control plane. A data plane node caches that configuration and keeps proxying while the control plane is down ([hybrid mode](https://developer.konghq.com/gateway/hybrid-mode/)).

Oxagen takes the same shape: a control plane Oxagen runs, and a data plane Oxagen or the customer runs.

## Where Oxagen goes past it

Oxagen's gateway governs agents, not API consumers. Each call carries an agent's identity, a run, and the mandate the team set for that agent:

- **Spend and budgets.** The gateway meters every model call from the bytes it saw and prices it. It refuses the next call when the run's or the agent's day budget runs out, and it reserves an in-flight call's ceiling so parallel calls cannot overrun. The proxy on the laptop already does this (`model-proxy.ts`). The gateway moves it to where the owner cannot remove it.
- **A kill switch the agent cannot route around.** Oxagen holds the only key the agent's harness can use. A paused, cancelled, or killed run gets no new token, and the gateway cuts its calls in flight.
- **One place to set up the agent.** The same mandate supplies steering, tools, skills, profile, memories, and budget.
- **A record per run.** Each call lands on the run's hash-chained record, and the control plane computes the run's tier from it.

## Architecture

### Control plane

This is the existing Oxagen API and app. It holds the mandate for each agent: access, budget and rules, and equipment (toolbelt, skills, steering, profile, memories). It also holds the key vault, signs each gateway's authority to mint run tokens, ingests the record, and computes the tier. It never carries a model or MCP call.

### Data plane

The gateway is one service with two listeners:

- **Model.** It speaks Anthropic Messages, OpenAI Responses, and OpenAI Chat Completions, streamed or not. The routing, metering, budget, model allowlist, and interrupt logic in `packages/tacho/src/collector/model-proxy.ts` move here.
- **MCP.** Streamable HTTP. It serves the agent's toolbelt, one endpoint per server (below).

The gateway pulls a signed configuration for each workspace from the control plane and caches it, as the host bundle works today. It streams operator commands (pause, cancel, kill, steer) from the control plane and applies them to calls in flight.

### Deployment

| | Oxagen-hosted (default) | Customer-hosted |
|---|---|---|
| Who runs the gateway | Oxagen, in regions it chooses | The customer, in its own network, from the same image |
| Where keys and MCP credentials live | Oxagen's vault, one KMS key per organization | The customer's KMS or vault. They never reach Oxagen |
| Where prompt and tool bodies go | Through Oxagen's gateway, retained under the workspace's retention policy | They stay in the customer's network. Only digests, usage, and frames reach Oxagen |
| How it reaches the control plane | Inside Oxagen | Outbound only, over mutual TLS. The gateway dials the control plane, and nothing dials in |

Both run the same code. A customer moves from one to the other by pointing its enrollment at a new gateway URL and moving its keys.

### The laptop

`tachod` stays, with a narrower job:

- The hooks stay. They veto the harness's built-in tools (Bash, Edit, Write), deliver steering at session start, and record events. The gateway never sees those tools.
- `tachod` fetches run tokens for the harness (`apiKeyHelper` for Claude Code) and holds no vendor key.
- It syncs skills and agent files from the control plane (below).
- It relays a stdio MCP server that must run on the laptop (below).

## Keys and the kill switch

1. **Oxagen holds the vendor keys.** A team adds its Anthropic and OpenAI organization keys to Oxagen once. Enrollment removes any vendor key from the harness's config, and `credentials.json` on the laptop goes away.
2. **The harness holds a run token.** The gateway mints an `oxrt_` token for one agent, one host, and one run. A token is short-lived, and a run is not: `tachod` fetches a fresh one for as long as the run may continue. Claude Code re-runs its key helper every five minutes and on any 401 (ADR-143 §2), so a run that lasts days picks up hundreds of tokens without noticing. Codex has no key helper and reads a fixed value, so it gets a run-scoped token that lives as long as the run.
3. **The gateway swaps the token for the key.** It verifies the token, checks the mandate and the run's state on every call, and forwards the call with the organization's key.
4. **Kill means no open call and no next call.** Pause, cancel, or kill marks the run at the gateway, aborts its calls in flight, and refuses its next call, whatever the token's expiry. It also stops minting for the run. The harness has no other key to try.

The kill never waits for a token to expire. The token's short life only limits how long a stolen token stays useful.

**Long runs.** The gateway mints tokens, not the API, so a run that lasts days keeps working while the control plane is unreachable. The gateway keeps serving from its cached configuration, as a Kong data plane does, and applies a command as soon as it arrives. A customer-hosted gateway mints its own tokens.

This holds against the agent and against every process the agent starts. It holds against the machine's owner for the organization's keys. It does not hold against a key the owner brings from elsewhere. Two controls close that gap: the vendor's own organization settings, which stop members creating personal API keys, and the `contained` tier, whose sandbox reaches only the gateway.

**Subscription logins are out.** Oxagen cannot hold a Claude Pro or Max login or a ChatGPT sign-in. A run on one stays `harness_held` (ADR-143), and the kill switch does not bind it. Enrollment says so, and the run's record shows it.

**Keys at rest.** Today one platform variable, `AUTH_TOKEN_ENCRYPTION_KEY`, encrypts every workspace's MCP credentials (`packages/plugins/src/credentials/kms.ts:4-5`). Custody of model keys needs one KMS key per organization, and the customer's own KMS on a customer-hosted plane.

## MCP

### The toolbelt

The workspace already registers MCP servers in `mcp.mcp_servers`, with encrypted credentials and published tool schemas (`packages/database/src/schema/mcp.ts:131-204`). The gateway serves them.

- **One endpoint per server, under its own name.** The gateway serves `https://<gateway>/mcp/<agent>/<server>`. Enrollment writes each one into the harness's config under the server's registered name. Tool names stay `mcp__<server>__<tool>`, so each harness's per-server hook matchers, permission rules, and allowlists keep working.
- **One tool builder.** The gateway builds each agent's list with the server-side `materializeTools`, so no second copy of the builder exists (ADR-078 §4 holds).
- **Credentials stay in Oxagen.** The gateway connects upstream with the workspace's stored credential and runs OAuth itself. The harness never sees the credential.
- **Per-tool rules.** Allow, deny, or approval, plus input narrowing, apply to each call before it goes upstream.
- **Approval.** A call that needs a person is parked. The gateway returns a result that names the pending approval. The person decides in Oxagen, and the agent's retry goes through.
- **Metering and billing.** Each call is metered and billed as one governed action (ADR-165), as the in-app path does today.

### Importing what the harness has

Enrollment reads the MCP servers already configured in the harness at user scope. It proposes each one into the workspace toolbelt, moves its credential into custody, and replaces the entry with the gateway's. It uses displace-and-restore, so `unenroll` puts every file back byte for byte.

### Pinning

On a managed device the harness reaches MCP servers through the gateway only:

- **Claude Code:** `managed-mcp.json` holds the gateway entries, with `allowManagedMcpServersOnly: true`. The allowlist matches by `serverUrl` ([managed MCP](https://code.claude.com/docs/en/managed-mcp)).
- **Codex:** `requirements.toml` holds an `[mcp_servers.<id>]` entry per server, with a `url` identity, and `features.apps = false` ([managed configuration](https://learn.chatgpt.com/docs/enterprise/managed-configuration)).
- **Cursor:** the Enterprise MCP Allowlist in Cursor's team settings allows the gateway's URLs only. Oxagen cannot write it. The admin guide gives the pattern ([model and integration management](https://cursor.com/docs/enterprise/model-and-integration-management)).
- **Stella:** needs a user-scope and managed-scope server list first (`stella` #6564).
- **Claude Desktop:** its enterprise policy is an on/off switch for local servers. Oxagen's entry is the one it writes today.

### Laptop-only servers

A stdio server that reads the developer's files or a local database cannot run in a cloud gateway. Two ways to carry it:

- **In a customer-hosted gateway,** when the server needs the customer's network but not the laptop.
- **Through `tachod`,** which relays it and checks each call against the signed bundle. The daemon seals the call, and the record marks it as seen on the host, not by the gateway.

### Vendor-run tools

The vendor runs these tools, so no gateway sees them: claude.ai connectors in Claude Code, Codex apps and hosted web search, Cursor Cloud Agents, Claude Desktop's remote connectors, and the built-in web search and fetch tools. On a managed device Oxagen turns them off (`disableClaudeAiConnectors`, `features.apps = false`). Elsewhere the hooks see what they can, and the record marks the rest as unrouted.

## Delivery

| What | How it reaches the agent |
|---|---|
| Context records | Session start, as today. The gateway adds the per-prompt selection (#3296): it sees every model call, so it can add the `may` and `info` records that fit each turn |
| Style preferences | A context record of kind `preference`, delivered the same way, with its own place in the app |
| Skills | `tachod` syncs published skills into each harness's user-scope skills directory (ADR-093 §6). No file is written into the repository |
| Agent profiles | `tachod` writes the per-harness agent files from each agent definition (ADR-101:82-84). The definition's `instructions` go out at session start |
| Memories | `tachod` reads each harness's memory files, under the workspace's retention policy, and imports them into the agent's memory store. Recall goes out at session start and per prompt through the gateway |

The in-app agent is Oxagen's own and is not part of this. #4310 takes the workspace toolbelt and rules off it.

## Agent messages and triggers

An agent on one runtime can message an agent on another, or start one, through Oxagen. A Claude Code run on a laptop can ask a Codex run in CI a question, or hand work to a Stella agent. The gateway makes this possible: every agent already connects to it, whatever its runtime, so Oxagen is the one place that can address them all.

### Messages

`mission-control-spec.md` §7.6 and `work-in-flight-spec.md` §6 define the message. Neither is built. The gateway serves the capabilities to every agent as MCP tools on its Oxagen endpoint:

- **`send_agent_message`** takes a recipient (a run id, a work order id, or an agent slug), a kind (`question`, `answer`, or `notice`), a body of at most 4,000 characters, an optional `in_reply_to`, a delivery mode, and an expiry.
- **`list_agent_messages`** reads the thread.

Delivery follows the recipient's route:

- **Through the gateway.** The gateway adds the message to the recipient's next model request, right after the steering block. This works for any agent whose model traffic the gateway carries, which covers agents on the Claude Code, Codex, and Stella harnesses.
- **Through the hook.** For an agent whose model calls skip the gateway, which today means an agent on the Cursor harness, the hook delivers the message at the next boundary it has.

The existing rules hold. A message from an agent enters as quoted evidence with the sender named, never as an instruction, and a tool call built from it is marked as built from untrusted input. Each send is a governed action. Per-run inbound budgets, a rate limit per sender, duplicate suppression, expiry, and an operator mute bound it. Every status change is a frame on both runs, so "did the agent see it" points at the model request that carried it.

### Triggers

An agent can start a run of another agent on another runtime:

- **`start_agent_run`** takes the target agent, a brief (ARP carries an operator-authored brief, ADR-157), the parent run, and an optional budget.
- **The work order is the record.** A trigger creates a work order, the dispatch record `work-in-flight-spec.md` §9 defines, linked to the parent run. The child's spend rolls up to the parent and its lineage shows both.
- **The child runs under its own mandate.** A trigger passes a brief, never the parent's authority. Starting another agent needs a grant naming the sender and the target. No agent holds it by default.
- **Oxagen routes the start and runs no turn.** An agent has one runtime, so the work order goes to the target agent's own runtime, and that runtime starts it: `tachod` on the enrolled host the agent runs on, the contained launcher on the agent's CI runner, or the agent's customer-hosted runner. ADR-043 stands: Oxagen starts a process the customer chose, as the contained launcher does, and runs no turn itself.
- **The answer comes back as a message.** When the child seals, Oxagen sends its outcome to the parent as an `answer`, with the child's run linked.

## The tier ladder

The tiers keep their words (`tier-ladder-spec.md`). Two things change:

- **A new source for `gateway`.** A call the gateway carried is on the control plane's own record, which is stronger evidence than a frame the host sealed. Ingest promotes a run to `gateway` from either source.
- **A new fact on the run.** The run records who held the key: Oxagen, the customer's KMS, or the harness. "Enforced" for the kill switch is allowed only when Oxagen or the customer's KMS held it, scoped to "for calls made with the organization's keys".

## The ADR

One ADR in `oxagen` records the decision. It supersedes in part:

- **ADR-094:** a gateway Oxagen hosts carries prompt bodies, under the workspace's retention policy. The laptop proxy stays only for the stdio relay.
- **ADR-143:** vendor keys move from the laptop to Oxagen's vault or the customer's KMS.
- **ADR-122:19:** an agent's own identity can hold a grant for an external tool, so the toolbelt works without a person on the call.

It keeps ADR-078 §4. There is still one tool builder, and it is the server's.

## Build order

1. **The ADR** above, and the retention default for bodies the gateway carries.
2. **Agent identity and tokens.** An agent principal per enrolled agent, grants for external tools, run tokens minted by the gateway and refreshed for the life of the run, and a kill checked on every call.
3. **The model gateway, Oxagen-hosted.** Port the proxy's routes, metering, budgets, allowlist, and interrupt. Add the per-organization key vault. Enrollment points each harness's base URL at the gateway and removes the local key.
4. **The MCP gateway.** The toolbelt endpoint per server, OAuth and credential custody, per-tool rules, approval, metering, and billing. Enrollment imports the harness's servers and writes the gateway's entries.
5. **Pinning** for Claude Code, Codex, and Cursor. Stella follows once #6564 lands.
6. **Delivery for the rest:** skills sync, the agent-file generator, per-prompt steering, and memory import and recall.
7. **Agent messages and triggers.** `send_agent_message`, `list_agent_messages`, and `start_agent_run` on the gateway, delivery through the model request or the hook, and work orders routed to the target agent's own runtime.
8. **The customer-hosted gateway.** Packaging, the outbound control channel, and the customer's KMS.
9. **The laptop relay** for stdio servers that must stay on the machine.

## Definition of done

- A Claude Code, Codex, or Cursor run on an enrolled host makes every model call and every toolbelt call through the gateway. Its record says so, and its tier is `gateway`.
- No vendor key or MCP credential is on the enrolled machine.
- Killing a run aborts its model call in flight and refuses its next one, whatever its token's expiry.
- A run that lasts several days keeps working across token refreshes, and through a control plane outage.
- A budget refuses the next call once the run's observed spend reaches it.
- Skills, agent files, and context records published in Oxagen appear in each harness without a commit to the repository.
- A Claude Code run on a laptop sends a question to a Codex run in CI, and the Codex run's record shows the model request that carried it.
- An agent with the grant starts a run of another agent on another runtime, and the parent receives the child's outcome as a message.
- A customer-hosted gateway serves the same run with keys only in the customer's KMS, and no prompt body reaches Oxagen.
