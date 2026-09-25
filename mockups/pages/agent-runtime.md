# Agent › Runtime

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents/triage/runtime`. `…/triage/enrollment` shows this tab in place |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D17 and honesty rule 6 of the Decision trace (every enforcement claim states the tier). `docs/fleet-operations-ia.md` (Agents: “Host, harness, hooks, proxy and the tier earned”) and `docs/fleet-operations-routes.md` (Agents). The host itself is specified in `runtime.md`. The agent header and the tab bar are specified in `agent.md` |
| Design | `mockups/src/engine.js` → `aRuntime()` and `aRuntimeHost()` inside `pAgent()`, with `agentRuntime()`, `tierLadder()`, `tierBadge()`, `TIERS`, `TIER_RANK` and the dialogs `unenroll` and `register`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / Agents / Runtime`: Loaded, Loading, Error, Access denied, and each of them · mobile |
| Audit | `agent-runtime.audit-prompt.md` |

## Job

Where the agent runs and the tier its hooks earn. The tab answers which host the agent runs on, how it is wired (collector, hooks, proxy, settings), which tier its runs earn, what that tier does and does not deliver, and how to take it back out. The Host panel reads the runtime record, so this tab and the Runtimes page cannot disagree about the host.

## What is on the page

The agent header and the tab bar are as `agent.md` specifies, with Runtime selected. For an agent with an enrolled host, the body is three panels.

**Host.** The header carries the host's health badge (“degraded”) and **Open the runtime**, which opens `#/a-intel/core-platform/runtimes/mbp-01`. Rows:

| Row | Value | Sub-line |
|---|---|---|
| Runtime | `mbp-01` | “workstation · macOS 15.5 · arm64 · started by launchd at login” |
| Harness | “Codex CLI 1.4.0” | “the runtime is shared. Every agent on it is seen through the same hooks.” |
| Device key | “ed25519:9c4a…e17b” | “signs checkpoints; oxagen countersigns at ingest” |
| Collector | “oxagend 1.6.1” | “2 telemetry gaps in the last 24h”, or on a clean host “last frame 4 seconds ago · 0 telemetry gaps in the last 24h” |
| Hook binary | “oxagen-hook 1.6.1 · fails closed against its cached bundle” | none |
| Hooks written | “SessionStart, UserPromptSubmit, PreToolUse, PermissionRequest, Stop” | “Five run as command hooks. The first four can refuse.”, or “Fewer than five events are wired, so some calls are recorded rather than decided.” |
| Model proxy | “loopback proxy on the host” on `gateway` and `contained`, else “not routed” | “every model call leaves through it. Tokens are counted from the bytes that pass.”, or “model traffic goes from the harness to its provider. Routing it is the gateway tier.” |
| oxagen MCP endpoint | `mcp.oxagen.com/w/core-platform` | “providers registered here are routed through oxagen, which decides each call” |
| Settings | “user settings” | “an enterprise managed enrollment writes locked settings instead” |
| Tier earned | The tier badge (`gateway`) | none |
| First frame | “2026-04-18 09:51:33Z” | none |
| Last checkpoint | “seq 88,412 · 2026-09-11 08:41:02Z · chain intact” | none |
| Note | The runtime's note, when it has one: “The collector is a minor version behind and reported two telemetry gaps in the last 24 hours.” | none |

**What this tier delivers.** Subtext: “The tier is computed per run from what was actually routed.” **All runtimes** in the header opens Runtimes. The body starts with the tier ladder, an ordered list (`aria-label` “The tier ladder”) with the agent's rung marked “this agent”:

1. `observe`: “Recorded only. No hook is installed and nothing is delivered.”
2. `harness`: “Hooks installed. Steering is delivered and four hook events can refuse a call. The harness reports spend, and a call goes ahead if its hook fails.”
3. `gateway`: “Model and MCP traffic goes through the gateway. The gateway meters it and enforces budgets on it.”
4. `contained`: “The agent runs in an OS sandbox whose only network exit is the gateway.”

Then six rows whose answer follows the agent's tier:

| Row | `observe` | `harness` | `gateway` and `contained` |
|---|---|---|---|
| Model calls | “not routed through oxagen. The harness calls its provider with its own key and reports usage. Spend is Reported by harness.” | as `observe` | “routed through the loopback proxy on the host. Tokens are counted from the bytes that pass through it and the run token is the only credential the call carries. Spend is Observed by gateway.” |
| Tool calls over MCP | “recorded only” | “the providers registered with oxagen are routed through oxagen, which decides each call. Any other MCP tool the harness holds is not.” | “every provider the harness reaches over MCP is reached through the gateway and decided by oxagen.” |
| Harness-native tools | “recorded only” | “the four blocking hook events can refuse. The result is reported by the harness, and a failed hook lets the call through (fail-open)” | the same on `gateway`; on `contained`, “the four blocking hook events can refuse, and the sandbox refuses a write to the settings file, the hook entries or the hook binary” |
| Budgets | “a recorded number and a notice in steering, never a stop” | as `observe` | “enforced before the call: a run budget by the proxy, a shared budget by a reservation on the control plane” |
| Steering | “not delivered: no hook is installed” | “delivered at SessionStart and UserPromptSubmit, and as files in the checkout” | as `harness` |
| Credentials held by this agent | “none” | “none” | “none” |

A note closes the panel: “Only contained is fully enforced: all traffic must pass through oxagen.” The note conflicts with the `gateway` rung and the Budgets answer, which say enforced for routed traffic. The rule a build keeps is the wedge's: enforced only for calls routed through Oxagen, with the tier stated.

**Unenroll this host from the CLI.** A code block: `oxagen agent unenroll --host mbp-01 \` over `  --restore-settings`. A note: “If hooks are stripped by hand instead, the next run records Hooks removed and the tier falls to observe. It is never upgraded after the fact.” Actions: **Run a test session** (a toast: “Test session queued. One turn, recorded like any other run.”) and **Unenroll** (danger; opens `unenroll`).

**No host enrolled.** For an agent with no enrolled host, the body is one panel instead: “No runtime is enrolled”, “Until one is, runs are recorded at the observe tier: nothing is delivered and nothing can be blocked.”, **Enroll a runtime** (gold; opens the Register agent gate at `#/a-intel/core-platform/register`) and **Show CLI steps** (opens `register`). The demo shows it on `#/a-intel/core-platform/agents/pr-reviewer/runtime`.

**Dialogs this tab opens.**

- `unenroll`, titled “Unenroll mbp-01?”: “Calls routed through oxagen are refused from this host from now on. The hooks on the host are removed at its next check-in, so a host that is offline keeps them until it returns.” and “Checkpoints from this host are unsigned after this, and the chain records the gap.” **Keep it enrolled** and **Unenroll it** (danger).
- `register`, titled “Register an agent”: Agent name, Avatar, Harness (claude-code, codex, cursor, stella, claude-agent-sdk, custom), Model class, and the note that it opens a pull request adding the definition file. **Cancel** and **Open the pull request**. The button that opens it reads Show CLI steps, yet the dialog shows no CLI steps, and it always proposes the slug `perf-watch`, an agent the workspace already has; a build shows the enrollment command for this agent.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Contract paths are under `packages/oxagen/src/contracts/` in `macanderson/oxagen` `main`; host fields are in `packages/oxagen/src/tacho/schemas.ts` (`hostSummarySchema`, lines 50-124).

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Host name, platform, OS version, arch | `RUNTIMES` via `agentRuntime()` | `get_agent` `hosts`; `list_tacho_hosts` | `agent.get.ts:53-73`; `tacho.host.list.ts:6`; `hostname`, `platform`, `osVersion`, `arch` (`schemas.ts:53-62`) | ✅ |
| Host kind and how it was started | `rt.kind`, `rt.started` | The host's kind (workstation, CI runner, hosted) and launcher | Not recorded | ❌ |
| Health badge | `rt.health` | The host's condition | `status` is `active`, `paused`, `suspended` or `revoked` (`packages/tacho/src/wire.ts:513-518`); `hooksOk` and `otelOk` flags (`schemas.ts:110-111`). No health word such as degraded | 🟡 |
| Harness and version | `rt.harness`, `rt.harnessV` | The host's harnesses and their versions | `harnesses` (`schemas.ts:66`); `claudeVersionAtEnroll` for Claude Code only (`schemas.ts:105`); `harnessVersion` per session (`schemas.ts:132`) | 🟡 |
| Device key | `a.devKey` | `deviceKeyFingerprint` | `agent.get.ts:53-73` | ✅ |
| Collector version and telemetry gaps | `rt.collector`, `rt.gaps` | `wrapperVersion` or `collectorVersion`; `telemetry_gap` incidents | `schemas.ts:106`; `agent.get.ts:64`; incident kind `telemetry_gap` (`tacho.incident.list.ts:18-31`) | 🟡 |
| Hook binary | `rt.collector` | The hook binary's version and its fail-closed behaviour | Not recorded apart from the wrapper version | 🟡 |
| Hooks written | `rt.hooks`, `rt.hookCount` | The hook events wired on the host | `hooksOk`, a single flag (`schemas.ts:110`); the event list is not reported | 🟡 |
| Model proxy | `TIER_RANK[a.tier]` | Whether each harness's model calls point at the loopback proxy | `modelBaseUrls` with `ours` and `shadowedBy` (`schemas.ts:82-101`) | ✅ |
| Oxagen MCP endpoint | fixed per workspace | The workspace's MCP address | No read returns it for a host | 🟡 |
| Settings | `rt.settings` | User or managed settings | `managed` (`schemas.ts:107`) | ✅ |
| Tier earned | `a.tier` | The tier a run earns; the tier per harness on the host | `list_agents` `enforcementTier` (`agent.list.ts:78-83`); `tiers` per harness (`schemas.ts:67-80`) | ✅ |
| First frame | `a.firstFrame` | `get_agent` `identity.firstFrameAt` | `agent.get.ts:134` | ✅ |
| Last checkpoint | `rt.checkpoint` | The host's last checkpoint and the chain's state | `lastIngestAt` (`schemas.ts:109`); a run's chain through `get_run_chain`. No checkpoint sequence per host | 🟡 |
| Runtime note | `rt.note` | A note on the runtime | Not recorded | ❌ |
| The ladder and the per-tier answers | `TIERS`, `TIER_RANK` | The tier vocabulary | `observe`, `harness`, `gateway`, `contained` (`agent.list.ts:52-57`). The answers are the design's statement of each tier | ✅ |
| Rollback command | fixed text | `oxagen agent unenroll` | `apps/cli/src/commands/agent.ts:14`, `:285`: `oxagen agent unenroll <agent> [--host <tch_id>] [--reason <text>]`. There is no `--restore-settings` flag, and `--host` takes a host enrollment id | 🟡 |
| Run a test session | `act()` | A one-turn test run for the agent | No capability | ❌ |
| Unenroll | `unenroll` | `revoke_tacho_enrollment` | `tacho.enrollment.revoke.ts:11` | ✅ |
| Enroll a runtime | `openDialog('wrap')` | The Register agent gate: `register_agent`, `create_tacho_enrollment` | `agent.register.ts:17`; `tacho.enrollment.create.ts:25` | ✅ |
| Show CLI steps | `register` | The CLI enrollment command | The dialog it opens proposes a pull request (`propose_agent`, `agent.propose.ts:276`) and shows no CLI path | 🟡 |

## Future-only fields

The tab carries no `data-future` mark, and the catalog gives it no future story. These fields have no contract today and are unmarked in the design. A build renders each as not recorded, or leaves the control out, until its contract ships:

- The host kind and the line saying how the host was started.
- The runtime note.
- **Run a test session**.

## Functionality

- The Host panel reads the runtime record, so the collector, the hooks and the last checkpoint match the Runtimes page exactly. The agent row carries only its own key.
- The tier is computed per run from what was routed and rendered verbatim. No report can say a stronger word than the tier allows. A tamper incident never raises the tier of the frames it touched.
- The six answers under the ladder change with the tier, so the tab never claims a delivery the tier does not make.
- Unenroll refuses calls routed through Oxagen from the host at once and removes the hooks at the host's next check-in. Checkpoints after it are unsigned and the chain records the gap.
- Hooks stripped by hand are recorded as `hooks_removed`, and the tier falls to `observe`.

## States

- **loaded**: as described above, on the demo record (agent Triage on `mbp-01`, tier `gateway`). An agent with no enrolled host shows the one-panel variant.
- **loading**: the shell stays; the page body, the agent header included, is the skeleton.
- **error**: “This agent could not be loaded”, with `503 iam_principals_unavailable`, **Try again** (gold) and **Open an incident**, as `agent.md` gives it.
- **access denied**: “You cannot see this agent”, naming `agent.read on core-platform`, with **Request access** (gold) and **Back to Work**, as `agent.md` gives it.

The renderer shares the agent page's empty state with every tab; the catalog lists it on the Overview only.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The three panels stack: Host, What this tier delivers, Unenroll this host from the CLI. The health badge and Open the runtime wrap under the Host heading. The ladder stays an ordered list. The rollback command scrolls inside its own block and the page never scrolls sideways. Dialogs rise from the bottom edge as sheets. Touch targets are at least 44 px.

## Permissions

- Read: `get_agent` and `list_tacho_hosts` (org Owner or Admin; workspace Owner, Member or Viewer). The mockup names the permission `agent.read`.
- Writes, each a governed action recorded in Audit: Unenroll (`revoke_tacho_enrollment`: org Owner or Admin), Enroll a runtime (`register_agent` and `create_tacho_enrollment`).

## Backend gaps this page depends on

- A host kind and a runtime note on the host record.
- The hook events wired, and the hook binary's version, reported by the host.
- A health word for a host whose flags or collector disagree with its status.
- A checkpoint sequence per host.
- A test-session capability.
- A `--restore-settings` flag on `oxagen agent unenroll`, or rollback copy that matches the shipped command.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- A Steering Source and a SteeringFrame are never shown as each other. The Steering row here says whether steering is delivered on this tier; the frames are on the Steering tab.
- No person is scored or ranked.
- Every enforcement claim states the tier. “Enforced” only for calls routed through Oxagen. The tab shows the tier as recorded and never a stronger word.
- Headers are rollups of the rows beneath them: the health badge follows the host's recorded status and flags.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing. A quoted string above that breaks this rule is a mockup defect to fix, not copy to reproduce.
- Exactly one gold (primary) action per screen. The loaded tab has none of its own; with no host enrolled, Enroll a runtime is the gold action.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- A not-loaded state replaces the page body, never the shell.
