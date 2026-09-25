# Register agent · First run

## Page header {#register-run/header}

The last step's eyebrow and title, and the footer that finishes registration once the first frame arrives.

### Purpose
You arrive here after downloading the installer or pressing **I already installed it** on the wrap step. The header names the one thing left to happen: the agent's first frame. The footer tells you the step finishes itself and, once the frame is in, takes you to the agent's run.

### Rationale
There is no Done button. The frame is the completion, because the frame is the only evidence that the install works. The lead that sat under the title moved here: registration completes the moment the first frame from the new key reaches Oxagen, and lands you on Work looking at its run.

Work is where you land because Work is the primary surface (D1 in `docs/fleet-operations-wedge.md`). The smoke run started from your own terminal, so Oxagen files it under a direct work order that it opens for the run (D2). `docs/mission-control-spec.md` §4.4 still says "Fleet". D3 retired Fleet, and its runs now live under work orders.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow and title | literal in `regRun()` | none, static copy | live |
| Countdown and unlock | `regSchedule`, `regFinish` | `:Frame` seq 0 and 1 for the principal | partial |
| Agent and smoke run written on unlock | `obUnlock` (`AGENTS`, `RUNS`) | `iam.principals`, `runs` | partial (G16) |

### Logic
- While waiting, the footer is **Cancel** (`regCancel`), **Back** (`regNav('wrap')`), and the caption "This step completes when the first frame arrives." No action is gold.
- Back returns to the wrap step. The log starts over when you come back through **Download for <OS>** or **I already installed it**, because `regInstall` resets `S.reg.log` and `S.reg.first`.
- After the frame, the footer is **Cancel**, the caption `#regAuto`, and **Open in Work** (gold). `regSchedule` runs a six-second countdown: the caption reads "Opening automatically…", then "Opening automatically in 5…" down to 1, and then `regFinish` runs. Open in Work runs it at once.
- `regFinish` calls `obUnlock`, clears `S.reg`, sets the run filter to all, goes to `#/<org>/<ws>/work/orders`, and toasts in gold that the key is registered and its smoke run is live under a direct work order.
- Cancel after the frame toasts that the enrollment was revoked and the smoke run discarded. Before it, the toast says nothing was installed and nothing was written.
- The build must write the agent and its run on ingest, when the frame arrives. The mockup writes them in `regFinish`, after the countdown.

### States
- **Loaded**: "Step 3 of 3", "Wait for the first frame", then the waiting card.
- **Error**: the header stays. The Collector unreachable card replaces the waiting card, and the footer is Cancel and Back.
- **Loading** and **denied**: the header is not drawn. The gate shell and the step rail stay.
- **Mobile**: the footer buttons stack full width.

## Waiting for the first frame

The card that holds the step while Oxagen waits: the key, the harness and the host as chips, the setup log, and one instruction.

### Purpose
It shows that Oxagen knows which agent, harness and host to expect, and what has already arrived from that host. If nothing moves, the instruction tells you what to do: start the harness in a repository on that host.

### Rationale
The installer ends with a one-turn smoke session (the eighth step on the installer's Installing screen), and that session sends the first frame. The sentence that followed the instruction moved here: the installer already ran a one-turn smoke session, and if it is still in flight the card flips on its own. The install test and the unlock are one event, so there is one path, not two (`docs/mission-control-spec.md` §4.4). The instruction stays because it is the one thing you can do when the smoke session did not reach Oxagen.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent key chip | `regKey()` | `iam.principals`, minted at the first frame | partial (G16) |
| Harness chip | `REG_HARNESS[S.reg.harness]` | `control.enrollments` | live |
| Host chip | `REG_HOST` (`mbell-mbp.local`) | `control.enrollments` | live |
| Poll | `regSchedule`, `S.reg.log` | `:Frame` seq 0 and 1 for the principal | partial |

### Logic
- The header has a spinner, the title, and "polling · 1s" at the right. The label is literal. The mockup's poll ticks every 780 ms, and the build must show its real interval or none.
- The chips are the key (`a-intel.core.perf-watch` in the demo), the harness label ("Claude Code"), and "host mbell-mbp.local".
- The instruction reads "Start <harness label> in any repository on `mbell-mbp.local`."
- When the poll reaches its sixth tick, `regSchedule` sets `S.reg.first`, and the card becomes First frame received.
- The spinner's animation stops under `prefers-reduced-motion`.

### States
- **Loaded**: the story captures the card with an empty log. The flip happens in the browser about 4.4 seconds later.
- **Error**: the card is replaced by Collector unreachable.
- **Loading** and **denied**: the card is not drawn.
- **Mobile**: the chips wrap and the card fills the width.

## Setup log

The host's setup events, one line at a time as they reach Oxagen, from enrollment to the first frame.

### Purpose
It shows how far the host got. When the flip never comes, the last line tells you where setup stopped: enrollment, the collector, the hooks, the policy bundle, or the MCP endpoint.

### Rationale
A spinner alone says only that something is pending. Each line is an event the host reports, with its time, so a stalled install names its own stopping point without a support ticket. The lines follow what enrollment does: it writes hook entries, installs the collector, registers it to start at login, and enrolls the host with a device key (`docs/mission-control-spec.md` §7.2). The tree names the collector `tachod`. The mockup uses the older names `oxagend` and `oxagen-hook`, which §7.2 says have not landed.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Log lines and times | `regLines()`, fixed times from 14:01:48 | `:Frame` seq 0 and 1 for the principal | partial |
| Lines shown | `S.reg.log` | none, client state | mockup only |

### Logic
- `regLines` returns seven lines. Lines 1, 2, 5 and 6 are the same for every harness: the host enrolled with device key `ed25519:7f3a…c19e`, the collector running under launchd, the hooks answering `SessionStart` in 41 ms at tier `harness`, and the MCP endpoint registered with 0 tools granted.
- Lines 3 and 4 follow the tab you left the wrap step on (`S.reg.tab`). Claude Code: hooks written to `~/.claude/settings.json` for 5 events, then the signed policy bundle v41 fetched and cached. Codex CLI: `~/.codex/config.toml` written with the notify hook, then the same bundle. SDK agent: `oxagen.agent.wrap()` attached, then `OXAGEN_AGENT_TOKEN` accepted and a run token minted.
- `regSchedule` starts the poll on a loaded render of the step. The first tick comes after 520 ms and each later tick after 780 ms. Each tick adds one line and re-renders, and the newest line fades in unless you prefer reduced motion.
- At the sixth tick the card flips without drawing a sixth line, so the log shows at most five lines. The seventh line, the frame itself, is what First frame received shows.
- The poll stops when you leave the step or the state is not loaded.
- The build must print only events the host sent, in the order they arrived.

### States
- **Loaded**: empty, then filling. "waiting…" stays as the last row.
- **Mobile**: the lines keep their monospace columns and scroll sideways if they must.

## First frame received

The card the waiting card becomes: the connection, the first two frames, and the tier the run earned.

### Purpose
It confirms the agent is wrapped and shows the evidence: frame 0 from the host and frame 1 from Oxagen, with the tier the record supports. From here the step finishes itself.

### Rationale
The two frames are the proof the install works, so the card shows them and not a success message. The tier sentence that sat under the badges moved here. The tier is computed from what was actually routed, not from what the adapter can do on paper. The hooks answered, so this run is `harness`: delivered, recorded, reported by the harness, and fail-open (ADR-095, `docs/mission-control-spec.md` §7.1). The badge carries the recorded word and nothing stronger. `harness` never claims "enforced". D14 took the replay grade out of the interface, so the card shows none. The chain stays, as "chain intact".

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Frame rows | literals in `regRun()` | `:Frame` seq 0 and 1 for the principal | partial |
| Tier badge | `tierBadge("harness")`, title from `TIERS` | `iam.principals.tier` | live |
| Agent and smoke run | `obUnlock` (`AGENTS`, `RUNS`) | `iam.principals`, `runs` | partial (G16) |

### Logic
- The header shows "connected" as a dot and a word, the title, and `14:02:11.402`.
- Frame 0 is `agent_start` at `14:02:11.402`: the harness, the host, `attested=device-key`, and `countersigned`. Frame 1 is `oxagen:run.start` at `14:02:11.418`: the key, the operator, `tier=harness`, and `steering=none published`.
- The badges are the `harness` tier and "chain intact".
- `obUnlock` writes once per flow, guarded by `S.reg.runId`. It adds the agent when the key is new: status `enrolled`, tier `harness`, an empty toolbelt, a 2.00 budget. It always adds the smoke run: "Installer smoke session", status `live`, cost 0.02 on basis `client_attested`, and the model from the model class.
- Today the tier is assigned from the harness name. The build must compute it from the traffic the record shows (§7.1, Phase 4).

### States
- **Loaded**: reached about 4.4 seconds after the waiting card renders.
- **Mobile**: the frame rows keep their columns and scroll sideways if they must.

## Collector unreachable

The error card for a host that enrolled but whose frames never reach Oxagen.

### Purpose
It says what failed and what to try: the host enrolled, but its requests to ingest are refused. You check outbound 443 to `ingest.oxagen.com` and run `oxagen agent status` on the host.

### Rationale
Once the token worked, the likely failure is egress: a firewall or proxy between the host and ingest. The card says what happened and then what to do, and it names the request id and the host so support can find the attempt. Registration does not complete without a frame, so the card says that too.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Host | `REG_HOST` | `control.enrollments` | live |
| Refusals, duration, error, request id | literals in `regRun()` | none named in the page spec | not backed |

### Logic
- The card reads h2 "The collector cannot reach oxagen", then the host, `https://ingest.oxagen.com/v1`, 94 seconds of refusals, `ECONNREFUSED`, and 6 attempts, then the instruction, then `request req_01JQ8F4B1PC7QM · host mbell-mbp.local`.
- **Check again** toasts that the request is still refused and nothing changed on the host. No action is gold.
- The footer is Cancel and Back. The poll does not run in this state.
- Oxagen sees the enrollment but not the refused requests, since none arrived. The build needs a source for the refusal count and duration, or it must drop them and say only that no frame has arrived since enrollment.

### States
- **Error** only. In onboarding the repository panel is not drawn under it.
- **Mobile**: the card fills the width.
