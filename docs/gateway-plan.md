# The Oxagen gateways

| | |
|---|---|
| **Status** | Plan v3, for review. Nothing in it is built. |
| **Date** | 2026-09-25 |
| **Owner** | Mac Anderson |
| **Decision** | ADR-187 in `macanderson/oxagen` (proposed, #4321): every customer agent's model and MCP calls pass a local gateway and then a cloud gateway, and Oxagen holds the keys. This plan holds the detail the ADR leaves out. |
| **Tracks** | `oxagen` #3299 (Phase 4), #4319 (the ADR) |
| **Source** | `macanderson/oxagen` at `main` `22902576f`, and the vendor documentation linked below, read 2026-09-25 |
| **Related** | `tier-ladder-spec.md`, `dod-spec.md`, `mission-control-spec.md` §7.6, `oxagen` #4310 (the in-app agent leaves the toolbelt) |

---

## Terms

- **Local gateway.** The process on the machine the agent runs on. Today this is the model proxy inside `tachod`.
- **Cloud gateway.** The service that holds the keys and governs every call. Oxagen hosts it by default, and a customer may host it in its own network.

## Path

```
agent ──> local gateway ──> cloud gateway ──> model provider, MCP server
          screens for         holds the keys, applies policy,
          sensitive data      budgets, and operator commands,
                              meters, and records
```

ADR-187 records what each gateway does, the operator commands, the live run view, the work record, and the proposals still open. This plan covers the screen, commands per harness, waste, harness setup, steering record delivery, and the build order.

## Sensitive-data screen

- **What it sees.** A model request carries the whole conversation: the prompt, the files the agent read, and every tool result. Screening the request screens everything the provider would see. Responses pass through.
- **What it does.** It rejects the request or strips the sensitive data out. Proposal 2 in ADR-187 makes this a workspace setting: off, flag, strip, or reject.
- **How it detects.** Open. A language model running on the machine is one candidate. Pattern rules for keys and passwords are another.
- **Where it runs.** On every enrolled machine, and inside a contained runtime's sandbox. Claude Code on the web has no local gateway, so its calls are unscreened.
- **Skipping it.** The machine's owner could point a harness straight at the cloud gateway. Proposal 3 in ADR-187 has the local gateway sign each request with its scan verdict, so a workspace that requires screening can refuse unsigned calls. Budgets and commands hold either way, because the keys are in the cloud.

## Commands per harness

Where the cloud gateway carries a run's model calls, it applies each command directly. Where it does not, the hooks are the only way in.

| Command | Model calls through the cloud gateway (Claude Code, Codex, Stella) | Model calls outside it (Cursor, Claude Code on the web) |
|---|---|---|
| Steer | Added to the next model request | Delivered at the next hook |
| Interrupt | The call in flight is aborted, and the steer rides the retry | The next tool call is refused, with the steer as the reason |
| Pause | The call in flight is aborted and new calls are refused. The hooks refuse tool calls | The hooks refuse the next tool call and prompt |
| Resume | Calls are accepted again | The hooks allow again |
| Cancel | The call in flight is aborted, the run token is revoked, every later call is refused, and the run is sealed | The hooks refuse every tool call and prompt, and the run is sealed |

A bulk command goes to every live run of the selected agents. The report lists each run with the command's result and the record entry that proves it (`mission-control-spec.md` §7.6).

## Send To

**Send To...** on the work backlog starts a run. The send menu and the work order dialog in `mockups/pages/work-backlog.md` stay: work items, definition of done, brief, repositories, and spend cap. The dialog gains three choices, or one existing agent that fixes them:

| Choice | Options |
|---|---|
| Harness | Claude Code, Codex, Cursor, or Stella |
| Runtime | An enrolled machine, a contained CI runner, or a customer-hosted runner |
| Toolbelt | The workspace toolbelt, narrowed to the tools this work needs |

On **Send**, Oxagen creates the work order and hands it to the chosen runtime, which starts the harness headless with the brief. On an enrolled machine the local gateway starts it. On a CI runner the contained launcher starts it (ADR-152). The run is bound to the work order from its first call.

## Waste

The cloud gateway assigns each call a waste reason code, by a rule an operator can read:

| Reason | How it is measured |
|---|---|
| Failed outcome | Spend on runs that failed verification or were abandoned |
| Errors and retries | Calls that errored, timed out, or were cancelled, and the retries they caused |
| Cache misses | A repeated prompt prefix that missed the provider's cache, found by comparing prefix digests |
| Loops | The same tool call, or a near-identical model request, repeated within a run |
| Reverted work | Runs whose changes were reverted, or whose pull request closed without merging |
| Oversized model | A costlier model where a cheaper one passes verification at the same rate on the same kind of task. This needs verification data, so it comes last |

The headline figure is cost per verified outcome.

## Harness setup

Enrollment points each harness's model calls and MCP servers at the local gateway. It edits the user's config directly and restores it on `unenroll`. It changes a repository's config through a pull request, as a steering record lands, which also reaches cloud sessions that clone the repository.

| Harness | Model calls | MCP servers | Pinning on a managed device |
|---|---|---|---|
| Claude Code | `ANTHROPIC_BASE_URL`, with `apiKeyHelper` fetching the run token | `~/.claude.json`, and `.mcp.json` by pull request | `managed-mcp.json` with `allowManagedMcpServersOnly: true`, and hooks in managed settings ([managed MCP](https://code.claude.com/docs/en/managed-mcp)) |
| Codex | `openai_base_url`, with a whole-run token (proposal 7) | `~/.codex/config.toml`, and `.codex/config.toml` by pull request | `requirements.toml` server identities, and `features.apps = false` ([managed configuration](https://learn.chatgpt.com/docs/enterprise/managed-configuration)) |
| Cursor | None. Cursor's model calls go to Cursor's servers | `~/.cursor/mcp.json`, and `.cursor/mcp.json` by pull request | The MCP allowlist in Cursor's team dashboard, which only the customer's admin can set, and enterprise hooks ([integration management](https://cursor.com/docs/enterprise/model-and-integration-management)) |
| Stella | `providers.<id>.base_url` | `.stella/mcp.toml` by pull request. Stella skips it in an untrusted checkout | None. Stella has no managed server list |
| Claude Desktop | None | Oxagen's MCP entry, as today | An on/off policy for local servers |
| Claude Code on the web | None. Anthropic's infrastructure calls Anthropic with the user's subscription | `.mcp.json` by pull request, pointed at the cloud gateway, with its domain on the environment's network allowlist ([cloud environments](https://code.claude.com/docs/en/cloud-environments)) | Server-managed settings |

Tools a vendor runs never pass either gateway: claude.ai connectors, Codex apps and hosted web search, Cursor Cloud Agents and its built-in browser and search, and Claude Desktop's remote connectors. On a managed device Oxagen turns them off (proposal 8). Elsewhere the record marks them as unrouted.

## Steering record delivery

Each steering record is a Markdown file with frontmatter under `.oxagen/steering/` (ADR-187). A steering record's kinds include skills, business rules, code rules, style preferences, facts, and memories, alongside the kinds in use today.

| Kind | How it reaches the agent |
|---|---|
| Business rules, code rules, style preferences, facts | The cloud gateway adds the ones that fit each turn. Where model calls skip it, the session-start hook delivers them |
| Skills | A pull request puts each skill in the directory each harness reads, such as `.claude/skills/` |
| Memories | Stored in Oxagen. The cloud gateway adds the recalled ones to each turn |

Two kinds move in the code: memories live in Neo4j as `AgentMemory` today, and skills live in `.oxagen/skills/`, both separate from the other records.

## Proposed build order

1. Keys and run tokens, and the cloud gateway's model entry point with metering, budgets, and operator commands. The local gateway forwards to it.
2. The live run view and the work record, with pull request and CI changes arriving by webhook.
3. Send To: work orders that launch a harness on an enrolled machine or a CI runner.
4. The signed record and the SOC 2 evidence export.
5. The MCP entry point and toolbelt, enrollment's import, and pinning.
6. The sensitive-data screen, once its detection design is chosen.
7. Skills and memories as steering record kinds, and their delivery.
8. Verification of done, spend by outcome, and waste reason codes.
9. Agent messages and triggers, HTTP egress, and the customer-hosted cloud gateway.

## Definition of done

- An enrolled Claude Code, Codex, or Stella run makes every model call through the local gateway and then the cloud gateway, and its record says so.
- No vendor key or MCP credential is on the enrolled machine.
- A request with a planted secret is rejected, or reaches the provider with the secret stripped, according to the workspace's setting.
- An operator steers, pauses, resumes, interrupts, and cancels a live run, and a bulk command reaches every selected agent's live runs, each with a record entry.
- An operator opens a live run and sees spend so far, tool calls by name, the diff, the pull request, and CI status, updating as the run goes.
- Each run records its repository, branch, directory, files changed, pull request, CI status, and related issues.
- Send To on selected work items creates a work order and starts the chosen harness on the chosen runtime, and the run carries the work order from its first call.
- A run that lasts several days keeps working across token refreshes and through a control plane outage.
