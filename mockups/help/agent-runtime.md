# Agent runtime

## Host

The host this agent runs on, read from the runtime record: harness, keys, collector, hooks, proxy, settings, and the tier its runs earn.

### Purpose
It answers where the agent runs and how that machine is wired. A person checks here whether the hooks are all installed, whether model traffic goes through the proxy, and whether the collector is current, then opens the runtime for the host's full record. The health badge in the header says whether anything on the host needs attention.

### Rationale
The panel reads the runtime record through `agentRuntime(a)`, so this tab and the Runtimes page cannot disagree about the collector, the hooks, or the last checkpoint. The agent row carries only its own key (`a.host`). The spec for the host itself is `mockups/pages/runtime.md`.

The runtime is shared. Every agent on it is seen through the same hooks, so a hook missing on the host is missing for all of them.

The device key signs checkpoints on the host, and Oxagen countersigns them at ingest. With the loopback proxy in place, every model call leaves through it, and Oxagen counts tokens from the bytes that pass. Without it, model traffic goes from the harness straight to its provider, and routing that traffic is what the `gateway` tier adds. Providers registered at the workspace's MCP endpoint are routed through Oxagen, which decides each call. An enterprise managed enrollment writes locked settings instead of user settings.

The hook binary fails closed against its cached bundle. That is a property of the hook process. The `harness` tier is still fail-open against the person at the keyboard, who can remove a hook entry (`docs/desktop-spec.md`, "Two senses of failure").

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Runtime name, OS | `RUNTIMES` via `agentRuntime()` | `get_agent` `hosts`; `list_tacho_hosts` | live |
| Kind and how it started | `rt.kind`, `rt.started` | A host kind and launcher | future |
| Health badge | `rt.health` | Host `status`, `hooksOk`, `otelOk` | partial |
| Harness and version | `rt.harness`, `rt.harnessV` | `harnesses`; `harnessVersion` per session | partial |
| Device key | `a.devKey` | `deviceKeyFingerprint` | live |
| Collector and gaps | `rt.collector`, `rt.gaps` | `wrapperVersion`; `telemetry_gap` incidents | partial |
| Hook binary | `rt.collector` | The hook binary's version | partial |
| Hooks written | `rt.hooks`, `rt.hookCount` | The wired hook events | partial |
| Model proxy | `TIER_RANK[a.tier]` | `modelBaseUrls` (`ours`, `shadowedBy`) | live |
| MCP endpoint | fixed per workspace | The workspace's MCP address | partial |
| Settings | `rt.settings` | `managed` | live |
| Tier earned | `a.tier` | `list_agents` `enforcementTier`; `tiers` per harness | live |
| First frame | `a.firstFrame` | `get_agent` `identity.firstFrameAt` | live |
| Last checkpoint | `rt.checkpoint` | `lastIngestAt`; `get_run_chain` | partial |
| Note | `rt.note` | A note on the runtime | future |

### Logic
1. The badge shows `rt.health` in the approval tone when it is anything but `ok`, else the allowed tone. With no runtime record it reads "connected".
2. **Open the runtime** opens `#/:org/:ws/runtimes/<id>`.
3. The Collector sub-line shows "N telemetry gaps in the last 24h" when `rt.gaps` is set, else "last frame 4 seconds ago · 0 telemetry gaps in the last 24h".
4. Hooks written lists the wired events, by default SessionStart, UserPromptSubmit, PreToolUse, PermissionRequest, and Stop. All five run as command hooks, and the first four can refuse. When `rt.hookCount` is under 5 the sub-line reads "N of 5 events wired": the unwired events are recorded rather than decided.
5. Model proxy reads "loopback proxy on the host" at `TIER_RANK` 2 or above (`gateway`, `contained`), else "not routed".
6. Last checkpoint appends "chain intact". The Note row appears only when `rt.note` is set.

### States
- **Loaded**: the demo shows Triage on `mbp-01`, `gateway`, degraded, with 2 telemetry gaps.
- **No host enrolled**: the tab shows one panel instead of three, "No runtime is enrolled" with "Runs are recorded at the `observe` tier." On that tier nothing is delivered and nothing can be refused. **Enroll a runtime** is the gold action and **Show CLI steps** opens `register`. The mockup's Enroll a runtime opens `wrap`; a build opens the Register agent gate. `register` shows a pull request, not CLI steps; a build shows the enrollment command for this agent. The demo is `#/a-intel/core-platform/agents/pr-reviewer/runtime`.
- **Loading, error, denied**: the agent page replaces the body (`agent/header`).
- **Mobile**: the health badge and Open the runtime wrap under the heading.

## What this tier delivers

The four-rung tier ladder with this agent's rung marked, and what that tier does for model calls, tools, budgets, steering, and credentials.

### Purpose
It answers what Oxagen can and cannot do for this agent at the tier its runs earn. A person reads the six rows to see which calls Oxagen decides, which it only records, and whether a budget is a stop or a number. **All runtimes** opens Runtimes, where a host can be moved up a rung.

### Rationale
Every enforcement claim states the tier (`docs/fleet-operations-wedge.md`, honesty rule 6 of the Decision trace). The six rows change with the tier, so the tab never claims a delivery the tier does not make. Oxagen computes the tier per run from what was actually routed, not from what the adapter could do on paper. A tamper incident never raises it.

"Enforced" is reserved for calls routed through Oxagen. That covers budgets and MCP calls on `gateway`, and all traffic on `contained`, where the sandbox's only network exit is the gateway. The page used to close on "Only contained is fully enforced: all traffic must pass through oxagen." That note conflicted with the `gateway` rung and the Budgets row, so the rule a build keeps is the wedge's: enforced for routed calls, with the tier named.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Ladder rungs and copy | `TIERS` via `tierLadder()` | The tier vocabulary (`agent.list.ts:52-57`) | live |
| This agent's rung | `a.tier` | `list_agents` `enforcementTier` | live |
| The six answers | `TIER_RANK[a.tier]` in `aRuntime()` | The design's statement of each tier | live |

`tierLadder()` and `TIERS` are shared with the Runtimes page. A change to a rung's copy changes both.

### Logic
`TIER_RANK` is `observe` 0, `harness` 1, `gateway` 2, `contained` 3. The ladder is an ordered list (`aria-label` "The tier ladder") with "this agent" on the recorded rung. The six rows answer per tier:

- **Model calls.** At rank 2 or above: routed through the loopback proxy on the host. Oxagen counts tokens from the bytes that pass, and the run token is the only credential the call carries. Spend is `gateway_observed`. Below 2: not routed through Oxagen. The harness calls its provider with its own key and reports usage. Spend is `client_attested`.
- **Tool calls over MCP.** Rank 2 or above: every provider the harness reaches over MCP goes through the gateway, and Oxagen decides each call. `harness`: the providers registered with Oxagen are routed and decided. Any other MCP tool the harness holds is only recorded. `observe`: recorded only.
- **Harness-native tools.** `contained`: the four blocking hook events can refuse, and the sandbox refuses a write to the settings file, the hook entries, or the hook binary. `harness` and `gateway`: the four blocking hook events can refuse. The harness reports the result, and a failed hook lets the call through (fail-open). `observe`: recorded only.
- **Budgets.** Rank 2 or above: enforced before the call, a run budget by the proxy and a shared budget by a reservation on the control plane. Below 2: a recorded number and a notice in steering. Nothing stops the run.
- **Steering.** Rank 1 or above: delivered at SessionStart and UserPromptSubmit, and as files in the checkout. `observe`: not delivered, because no hook is installed.
- **Credentials held by this agent.** None, on every tier.

### States
- **Loaded**: ladder and rows for the recorded tier.
- **Mobile**: the ladder stays an ordered list above the rows.
- No rung is marked not yet available. `TIER_NA` is empty.

## Unenroll this host from the CLI

The command that takes this host back out, a test session, and the Unenroll action.

### Purpose
It answers how to reverse the enrollment cleanly. A person copies the command, runs a one-turn test session to confirm the wiring, or unenrolls the host from here.

### Rationale
Removing the hooks by hand is not a clean exit. If hooks are stripped by hand, the next run records `hooks_removed` (shown as Hooks removed), and the tier falls to `observe`. Oxagen never upgrades a tier after the fact. The designed command revokes the enrollment and restores the harness's settings in one step, so the record shows an unenrollment rather than a tamper incident.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Rollback command | fixed text with `a.host` | `oxagen agent unenroll` (`apps/cli/src/commands/agent.ts:14`, `:285`) | partial |
| Run a test session | `act()` toast | A one-turn test run | future |
| Unenroll | `openDialog('unenroll', a.key)` | `revoke_tacho_enrollment` | live |

### Logic
1. The code block reads `oxagen agent unenroll --host <host> \` over `--restore-settings`. The shipped CLI takes `oxagen agent unenroll <agent> [--host <tch_id>] [--reason <text>]`: it has no `--restore-settings` flag, and `--host` takes a host enrollment id. A build shows the command the CLI accepts.
2. **Run a test session** raises the toast "Test session queued." No run is created in the mockup. A build either starts a recorded one-turn run or leaves the control out until the capability ships.
3. **Unenroll** (danger) opens the `unenroll` dialog. Unenrolling refuses calls routed through Oxagen from the host at once and removes the hooks at the host's next check-in. Checkpoints after it are unsigned, and the chain records the gap.

### States
- **Loaded**: shown only when a host is enrolled. With no host, the tab shows the one-panel empty state described under Host.
- **Mobile**: the command scrolls inside its own block, and the page does not scroll sideways.
