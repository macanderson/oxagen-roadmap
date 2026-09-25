# The enforcement tier ladder

| | |
|---|---|
| **Status** | Spec v1, for review. It describes the four tiers as decided and as built, and it lists where the page copy, the ADRs, and the code disagree. |
| **Date** | 2026-09-25 |
| **Owner** | Mac Anderson |
| **Source** | `macanderson/oxagen` at `main` `4a21610ef` (2026-09-25): `packages/tacho` (the daemon `tachod`, the hook binary `tacho-hook`, the model proxy, and the contained launcher), `packages/handlers/src/tacho.events.ingest.ts` (where the tier is computed), `packages/handlers/src/tacho.command.dispatch.ts` (steering delivery), and `packages/handlers/src/lib/tacho-host.ts` (the signed bundle) |
| **Builds on** | ADR-095 (the ladder), ADR-096 (the contained tier), ADR-152 (the contained launcher), ADR-094 (the gateway), ADR-143 (credential custody), ADR-056 (delivery modes), ADR-078 (wrapped and connected), ADR-163 (commands reach every tier), ADR-067 (every claim states its scope) |
| **Related** | `mission-control-spec.md` §7.1 and §7.2 (the first statement of the ladder, written before Phase 4 and Phase 5 merged; where the two disagree on status, this spec is current), `dod-spec.md` "What the tier ladder means for a dod", `fleet-operations-ia.md` Vocabulary |
| **Copy** | `mockups/src/engine.js:713-721` (`TIERS`), quoted in `mockups/pages/runtimes.md` and `mockups/pages/agent-runtime.md` |

---

## The ladder

Every agent run you open carries one of four words: `observe`, `harness`, `gateway`, or `contained`. The word tells you how much of the run passed through Oxagen, and so how much of it Oxagen could record, steer, meter, or refuse. The control plane computes the word from the run's own record after the traffic arrives. Nobody assigns it, and no host can set it for itself.

| Tier | Page copy | What passes through Oxagen | Who can undo it |
|---|---|---|---|
| `observe` | Recorded only. No hook is installed and nothing is delivered. | Events the harness exports, or hook events from a host in observe mode | Anyone. Nothing is refused on a rule |
| `harness` | Hooks installed. Steering is delivered and four hook events can refuse a call. The harness reports spend, and a call goes ahead if its hook fails. | Harness lifecycle events, through five command hooks | The person at the keyboard: delete the hook entry, disable hooks, or run another build |
| `gateway` | Model and MCP traffic goes through the gateway. The gateway meters it and enforces budgets on it. | Model requests and responses through the loopback proxy, and MCP calls through the gateway | The person who owns the machine: unset the base URL, or decrypt the custody file |
| `contained` | The agent runs in an OS sandbox whose only network exit is the gateway. | Every network request from every process in the sandbox | The host's administrator only. The agent and its child processes cannot |

Each rung adds one route to the ones below it, for a wrapped harness. The ladder is cumulative there. For a connected app it is not: Claude Desktop reaches `gateway` through its Oxagen MCP calls and has no `harness` rung under it (ADR-078 §2, kept by ADR-095).

The claims each tier may make, from ADR-095:

| Tier | It may say | It may never say |
|---|---|---|
| `observe` | "recorded" | Anything about refusal or delivery |
| `harness` | "delivered", "recorded", "client-attested", "fail-open" | "enforced" |
| `gateway` | "observed" metering, "enforced" budgets on routed traffic | "enforced" against the machine's operator, or anything about traffic that did not route |
| `contained` | "enforced" for routed traffic and the filesystem boundary | Anything about a run the launcher did not start, or whose receipt lacks one of the three controls |

Every control claim carries its scope: "for actions routed through Oxagen" (ADR-067).

## Terms

- **Tier.** One of the four words above. It belongs to a run. A host or agent page shows the tier its runs earned.
- **Harness.** Two meanings share this word. The `harness` tier is a rung of the ladder. A harness product is the agent program itself: Claude Code, Codex, Cursor, or Stella. The harness marks on agent and run rows (`hxIcon()`) name the product, not the tier. Write "the `harness` tier" when you mean the rung.
- **Routed.** A request passed through a process Oxagen runs and the record shows it. A base URL written into a config file is intent. A request the proxy sealed is routing.
- **Recorded.** The event is on the run's hash-chained record.
- **Delivered.** Oxagen handed steering text to the harness through a hook.
- **Client-attested.** The evidence comes from a process on the customer's machine that the person at the keyboard can change.
- **Observed.** The gateway saw the bytes and metered them itself (`oxagen.metering: observed`, `source: collector`, `fidelity: proxy`).
- **Enforced.** A request that breaks the rule does not reach its destination, and the party named in the claim cannot route around the check.
- **Fail-open.** Two senses, and this spec always says which. The hook process fails closed against its cached bundle. The `harness` tier as a whole fails open against the person at the keyboard, because that person can remove the hook.
- **Operator, owner, administrator.** The operator is the person or system that runs the agent. On a laptop the operator is also the machine's owner. On a CI runner or a managed device, the host administrator is someone else.
- **Mode.** A host's signed bundle is in `observe` or `enforce` mode (`wire.ts:519`). Mode is a host setting. Tier is a run's result. An `enforce`-mode host produces `harness` runs at least, and an `observe`-mode host produces `observe` runs unless traffic routes through the gateway.

## How a tier is computed

The control plane computes the tier when it ingests a batch of events (`enforcementTierOf`, `tacho.events.ingest.ts:762-843`, then `containedTierOf` and `promotedTier`, `lib/tacho-containment.ts:43-69`). It reads the chain, the host row, and the launch receipts. It never reads the `oxagen.enforcement_tier` attribute the daemon writes on each event (`ingest:753-760`). That attribute is true of one event and says nothing the control plane can check about the session.

1. **Start from the host's mode.** An `enforce`-mode host gives `harness`. An `observe`-mode host gives `observe` (`ingest:842`).
2. **Promote to `gateway` on model traffic.** The chain verifies and holds a model call the loopback proxy sealed (`ingest:810`). The call must carry `source: collector` and `fidelity: proxy`, which a record posted through the local OTLP endpoint cannot carry.
3. **Promote to `gateway` on MCP traffic.** The control plane served a gateway call for this chain, the chain's genesis hash matches the session's, and the chain verifies (`ingest:812-841`).
4. **Promote to `contained`.** The run is already `gateway`, and a registered contained launch carries the same genesis hash (`containedTierOf`).
5. **Keep the highest word.** A live session's tier only rises. A sealed session's tier is final (`promotedTier`). ADR-159 lets a tier still rise after an idle close, before the seal.

One observed model call is enough for `gateway`. The tier then covers the traffic that routed, and every claim names that scope.

**What the tier is not.**

- It is not a score, a percentage, or "fully governed" (ADR-078 §2).
- It is not what the adapter supports on paper. A host with the base URL written, whose run went around the proxy, stays on its mode's word.
- It is not the harness name. `wire.ts:317-324` and `:475-480` still map harness names to ADR-078's two words for display only.

## observe

`observe` means Oxagen recorded the run and nothing more. It is the floor of the ladder and the default mode of a new bundle (`docs/specs/tacho/plan.md:45` in `oxagen`).

**How a run lands here.**

- The host is enrolled in `observe` mode, and no model or MCP traffic routed.
- The run arrived without hooks: a CLI that exports telemetry Oxagen ingests, such as Gemini CLI, or a run backfilled from a transcript (ADR-161).

**What is recorded.** The events the harness exported, or the hook events an `observe`-mode host sent. For an `observe`-mode host, each rule result is recorded with the answer the rule would have given, and the hook answers allow (`bundle.ts:724-727`).

**What refuses.** No rule refuses anything. Operator state still applies in both modes: a suspended, revoked, or paused host, or a paused or cancelled session, is refused at the hooks (`bundle.ts:724-727`). A `[containment] required` clause is recorded and refuses nothing (ADR-152).

**What is delivered.** The page copy says nothing is. For a run with no hooks that holds. For an `observe`-mode host with hooks it does not hold: steering reaches the run through `UserPromptSubmit` and the step hooks, because ADR-163 lets commands reach a run at every tier and dispatch treats `observe` like `harness` (`tacho.command.dispatch.ts:127-146`). See "Conflicts".

**Spend.** Whatever the harness reported, labelled "Reported by harness". Codex and Stella export none, so an `observe` Codex run has no spend.

**What the page says.** "recorded". A backfilled run reads "Nothing was enforced" (ADR-161). The Decision trace opens with "Tier observe: recorded, not enforced." (`wedge.js:584-585`). Steering assignments under an `observe` badge read "assembled, not delivered" (`wedge.js:848`).

## harness

`harness` means the host has Oxagen's hooks installed in the harness's settings, in `enforce` mode. The hooks deliver steering and can refuse at four points in the harness's lifecycle. Everything the tier does runs on the customer's machine, inside a file the person at the keyboard can edit.

### Hooks

Enrollment writes five command hooks that run `tacho-hook` (`host/settings-writer.ts:11-18`). Four can refuse. `Stop` cannot.

| Event | Harness timeout | Daemon answer budget | Can refuse | How it refuses | What it refuses on |
|---|---|---|---|---|---|
| `SessionStart` | 10 s | 5 s | Yes | `continue: false` (`hook-handler.ts:856-875`) | Operator state: host suspended, revoked, or paused; session paused or cancelled; containment required and unmet |
| `UserPromptSubmit` | 10 s | 5 s | Yes | `decision: "block"` (`:932-938`) | Operator state, as above |
| `PreToolUse` | 15 s | 10 s | Yes | Deny (`:1084-1091`) | Operator state, the bundle's rules, and a steer sent as an interrupt (`steer_interrupt`, `:1004-1038`) |
| `PermissionRequest` | 600 s | 595 s | Yes | `behavior: "deny"` (`:1230-1241`) | Operator state. Offline, the bundle's rules (`hook-client.ts:534-560`). Otherwise it falls through to the harness's own prompt |
| `Stop` | 10 s | 5 s | No | None. `decision: "block"` here only delivers a queued steer (`:1268-1294`) | Nothing |

The harness timeouts are `COMMAND_HOOK_TIMEOUTS_S` (`settings-writer.ts:108-117`). The daemon answer budgets are in `hook-client.ts:287-307`, with a 50 ms budget to connect to the daemon. Only `PreToolUse` evaluates the bundle's rules while the daemon is up. Control-plane elevation at `PermissionRequest` (Biscuit tokens, `docs/specs/tacho/spec.md:371`) is not built (`hook-handler.ts:1242-1244`).

Claude Code also posts 26 events to the daemon as HTTP hooks (`settings-writer.ts:20-48`). Those record and never refuse. A failure there becomes a `telemetry_gap` frame on the chain.

**Harness differences.**

- **Codex** runs the same five events, all as command hooks. It turns a hook's `ask` into a deny (`hook-client.ts:615-642`).
- **Cursor** also refuses at `SubagentStart` (`hook-client.ts:572-609`). It is the one harness with a `failClosed` setting that catches a crashed hook (`:829-836`).
- **Stella** is wrapped through the same hooks until it speaks the control contract natively, and its hook evidence is client-attested like the others (ADR-080).

### Steering delivery

Dispatch picks the strongest delivery mode the host can carry at or below the one requested (`resolveDeliveryMode`, `tacho.command.dispatch.ts:127-146`).

| Requested | At `harness` | Why |
|---|---|---|
| `turn_boundary` | Delivered at the next `UserPromptSubmit` | Every host carries it |
| `next_step` | Delivered at the next `PostToolUse` or `Stop` on Claude Code and Codex. Elsewhere it waits for the next prompt (`no_step_carrier`) | Needs the `steer_next_step` bundle feature and a step-carrier runtime |
| `interrupt` | Degrades to `next_step` (`harness_tier`) | Nothing on the run's path can cut a model call in flight |

The closest the `harness` tier comes to an interrupt is refusing the next tool call with the steer as the reason (`steer_interrupt`). The applied frame carries `command.interrupted: 0`.

### Spend

The harness reports its own spend. A self-reported `llm_call` comes from Claude Code's OTel export (`otel_log`), the transcript, or a hook, and the first sighting counts (`ingest:359-372`). Codex and Stella export no spend, so their `harness` runs have none. Pages label it "Reported by harness" (`fleet-operations-ia.md:160-161`). A budget at this tier is counted from those numbers and refuses nothing.

### Failure behavior

| What fails | What happens | Where |
|---|---|---|
| The hook binary crashes, or prints nothing | The harness reads no output as allow. Cursor with `failClosed` is the exception | `hook-client.ts:993-998`, `:829-836` |
| The bundle is unverified (bad signature, or signed for another host) | Read-only tools are allowed. Mutating tools are denied, in either mode | `bundle.ts:26-32`, `:800-821` |
| The bundle is stale (its 24-hour signed window has passed since the last confirmation, or the deny generation was bumped) | With the daemon up, the hook refreshes synchronously, then denies a mutating tool if still stale. With the control plane unreachable, a mutating tool is denied in `enforce` mode and allowed in `observe` mode | `bundle.ts:594-632`, `:841-848`; `hook-handler.ts:972-993` |
| The daemon is down | The hook decides from the cached bundle. `ask` and `no_rule` outcomes fall to the harness's own prompt (`hook_fail_open`, signed into the bundle). A deny from the bundle still holds | `hook-client.ts:340-370` |
| `host.json` is unreadable and the daemon is down | `PreToolUse` and `PermissionRequest` deny | `hook-client.ts:916-940` |
| `host.json` is missing | Allow. The host was never enrolled, or was unenrolled | `hook-client.ts:942-948` |
| A telemetry hook fails | A `telemetry_gap` frame. Never a block | `settings-writer.ts:20-48` |

So the hook fails closed against its bundle. The tier fails open against the person at the keyboard: delete the hook entry, set `disableAllHooks`, kill the daemon, add another MCP server, or run a build of the harness without the hooks, and the call goes ahead (ADR-094:51-53). Oxagen detects tampering after the fact, from the gap it leaves in the record.

### What the page says

"delivered", "recorded", "client-attested", "fail-open". Never "enforced". On rendered pages `tools/check-copy.mjs` bans the literal "client-attested", so pages say "Reported by harness" for spend and state the fail-open property in the tier's tooltip.

## gateway

`gateway` means the run's model traffic, its MCP traffic, or both went through a process Oxagen runs: the loopback model proxy inside `tachod` (ADR-094), or the Oxagen MCP gateway. The gateway saw the bytes. It meters them itself and can refuse a call before the vendor receives it.

### Routes

Enrollment points the harness at the loopback proxy by rewriting its base URL (`wire.ts:388-410`). The proxy listens on the port after the collector's.

| Harness | Setting written | Proxy prefix | Credential brokered (ADR-143) |
|---|---|---|---|
| Claude Code | `env.ANTHROPIC_BASE_URL` | `/anthropic` | Yes. An `apiKeyHelper` hands the harness a run token |
| Codex | `openai_base_url` | `/backend-api/codex` | Yes, with a static run token. A ChatGPT login stays `harness_held` |
| Stella | `providers.anthropic.base_url` | `/stella/anthropic` | No (`brokerable: false`) |
| Cursor | None. Hooks only | None | No |
| Claude Desktop | The Oxagen MCP gateway in its config (`CONNECTED_HARNESSES`, `wire.ts:343`) | None. No model traffic routes | No |

The proxy speaks Anthropic Messages, OpenAI Responses, and OpenAI Chat Completions, streamed or not. A websocket upgrade gets `426`, and Codex falls back to HTTP. The proxy ties each call to a session by, in order: the `x-oxagen-session` header (read and removed), the harness's own session header, the session id inside Anthropic `metadata.user_id`, a Responses `prompt_cache_key` that names a known session, and the one live session of that harness. A call that matches none is sealed on the daemon's own chain and marked `unattributed` (`model-proxy.ts:73-83`).

The MCP aggregator that re-serves a wrapped harness's MCP servers through loopback (ADR-094 part 3) is not on `main` (`oxagen` #3299, open). Today a wrapped harness reaches `gateway` through model traffic only, and Claude Desktop through its Oxagen MCP calls only.

### Metering

The proxy seals one `llm_call` frame per call with `fidelity: proxy` and `oxagen.metering: observed`. The frame carries request and response digests, usage, latency, status, `oxagen.credential_basis`, and `oxagen.run_token_id` when the call was brokered (`model-proxy.ts:29-44`, `wire.ts:123-132`). Once a session has one observed call, the control plane drops the harness's self-reported calls from its counts (`ingest:280-296`), and the session's `cost_basis` is written `observed` (`ingest:1849-1851`). Pages label it "Observed by gateway".

### Budgets

A budget is enforced only when the agent's published definition declares one. The bundle's `budget.mode` stays `observed` when the host names no agent, the agent has no published version, or its active definition has no budget table (`tacho-host.ts:464-477`, `deriveBundleBudget`). With `budget.mode: enforced`:

1. The proxy checks the budget when it admits a call. A session whose observed spend reached `budget.session_limit_usd`, or an agent whose observed spend for the UTC day reached `budget.daily_limit_usd` (ADR-160), has its next call refused.
2. The refusal is a `403` in the vendor's error shape, with `x-oxagen-refusal: session_budget_exceeded` or `daily_budget_exceeded` and `x-should-retry: false`. It is sealed as a `policy_decision`.
3. A call in flight holds its ceiling (its request bytes as input and its output cap) against the session limit until it settles, so parallel calls cannot all pass on the same settled figure.
4. A call already streaming is never cut for budget. The check runs at admission only.

Prices arrive in the signed bundle as `model_prices`. An unpriced model costs the budget nothing and its frame says `observed_unpriced`.

The workspace can also turn on a model allowlist (`update_tacho_session_policy`). A model outside `models.allow`, or inside `models.deny`, is refused with `model_not_permitted`.

### Interrupt

At `gateway`, `interrupt` is real. Pause, cancel, kill, and a steer sent as `interrupt` abort the session's in-flight model calls (`packages/tacho/README.md:295-297`). A call cut by a steer gets a `503` with `steered_by_operator`, which the harness retries (`model-proxy.ts:1257-1268`). A paused session's new calls are refused until `resume`. The applied frame carries `command.interrupted: 1` only when a call was cut.

### Credential custody

`tacho enroll` seals the vendor key in `credentials.json` (AES-256-GCM, mode 0600) (ADR-143:58-67). A brokered harness holds an `oxrt_` run token that lasts at most 15 minutes. The proxy verifies the token and swaps in the custody key. An expired token gets a `401`. A vendor key the harness brings from its shell environment is refused as `foreign_credential`. The key stays on the machine. Oxagen's servers never hold it.

### Failure behavior

- **A fault of Oxagen's never stops a call.** An unpriced model, an unreachable control plane, an unreadable response, and a `beforeForward` that throws or takes over 250 ms all let the call through (`model-proxy.ts:46-64`).
- **An operator decision always stops one.** A budget at its limit, a paused or cancelled session, and a suspended or revoked host all refuse.
- **The daemon is down.** The harness gets a refused connection. It does not fall through to the vendor, because its base URL points at loopback.
- **The control plane is down.** The proxy keeps deciding from the cached bundle (ADR-094:83-84).

### Routing around it

The machine's owner can still leave the gateway:

- Unset the base URL. The host's health report shows it as `model_base_urls.ours: false` (`wire.ts:1006-1019`).
- For a brokered harness, decrypt `credentials.json` and call the vendor directly.
- Add an MCP server that does not go through the gateway.
- Use the harness's built-in tools (Bash, Edit, Write). They never touch the gateway, so they stay at the `harness` tier's strength even on a `gateway` run.

### What the page says

"Observed" for metering. "Enforced" for budgets on routed traffic, with the scope stated. Never "enforced" against the machine's operator, and nothing about traffic that did not route.

## contained

`contained` means Oxagen's launcher started the agent inside an OS sandbox, attested three controls, and the run's traffic reached the gateway. It is the only tier that earns "enforced" against the machine's operator. It targets CI runners, headless runs, cloud runners, and managed devices. It is never mandatory on a developer's own laptop, where nothing is enforceable against the owner (ADR-096).

### Three controls

A sandbox alone does not earn the tier. The launcher attests all three, and a run whose receipt lacks any one earns `gateway` at most (ADR-096).

1. **Gateway-only egress.** Every model and MCP request from every process in the sandbox goes through the gateway or fails. This turns model and MCP traffic from attested to enforced.
2. **A filesystem policy.** The writable set is the workspace the launcher was given. The harness's settings file, its hook entries, and the `tacho-hook` binary are read-only inside the sandbox.
3. **Hook integrity at launch.** The launcher starts the binary it chose with the hook entries it wrote, records a digest of that configuration, and the sandbox denies writes to it for the life of the run.

Egress alone leaves the hooks client-attested, because a process inside the sandbox could edit the settings file, set `disableAllHooks`, or start a second copy of the harness. The second and third controls close that.

### The profile

The first profile is `oxagen-linux-docker-v1` (ADR-152): a Docker container on Linux, created by an unprivileged user in the `docker` group. GitHub's hosted runners provide exactly that.

```sh
tacho run --contained -- claude [args]
oxagen run -- codex [args]   # delegates to tacho run --contained
```

`oxagen run export <run-id>` still parses as a subcommand.

The launcher creates the container with:

- `--network none`. Loopback only.
- `--read-only`, `--cap-drop ALL`, `--security-opt no-new-privileges`, and private IPC and cgroup namespaces.
- Limits of 512 processes, 4 GB of memory, and 2 CPUs.
- `--user` set to the launching user's uid and gid. Never root.
- Two mounts: the repository root, read-write, at `/workspace`, and a per-run session directory, read-only, at `/opt/oxagen/session`.

### The one exit

The only way out of the container is a Unix socket in the session directory. Inside, `entry.mjs` relays `127.0.0.1:43801` to that socket. Outside, the bridge (`contained/bridge.ts`) serves four routes. It refuses every other path and records a `contained_gateway_route` denial.

| Route | Destination | Credential |
|---|---|---|
| `/model/v1/...` | The loopback model proxy, for one harness's paths only | A 15-minute run token from the daemon's custody, set by the bridge |
| `/hook` | The daemon's hook handler, with `session_id` and `cwd` pinned to the launched session | None |
| `/mcp` | The local MCP gateway, then the Oxagen API | The host's gateway credential, held by the daemon |
| `/github/...` | `github.com` smart-HTTP git and `api.github.com/repos/<owner>/<repo>`, for one repository, only when the operator supplied a token | The run's installation token, set by the bridge. Each request is a `contained_github_route` decision |

No credential enters the container. The harness inside holds a placeholder key, and the bridge replaces every inbound credential header. The operator's GitHub token must reach exactly the one named repository, or the launcher refuses it. The launcher revokes it when the run ends or when any check refuses the launch.

### The launch

Before any agent process runs, the launcher:

1. Refuses a workspace that is not the repository root, or that holds a nested mount, a symbolic link leaving the checkout, a hard-linked file, a socket or device, or a credential file (`.env`, `.env.local`, `.aws`, `.ssh`, `.netrc`, `.npmrc`, and similar). Committed templates (`.env.example`, `.env.sample`, `.env.template`) pass.
2. Refuses harness arguments outside a short allowlist, so no flag can point the harness at another settings file or endpoint.
3. Writes the hook configuration into the session directory, mode 0400. The image links Claude Code's managed settings and Codex's `requirements.toml` to those files, and both set managed hooks only.
4. Runs `docker create`, then `docker inspect`, and checks every setting against what Docker reports. A mismatch stops the launch.
5. Computes the measurement: the profile name, the container id, the image digest, a digest over the sorted configuration files, and three flags (`gatewayOnlyEgress`, `workspaceOnlyWrites`, `readOnlyHooks`).
6. Posts the measurement with the session's chain genesis hash to `POST /v1/tacho/contained-launch`, authenticated by the host's gateway credential. The API requires the enrolling operator to hold Owner or Admin.
7. Runs `docker start` only after the API accepts the receipt.

The launcher refuses to start when the environment cannot provide the profile: not Linux, running as root, no Docker, a Docker daemon that is not Linux, a missing image, an inspect mismatch, or a refused registration. It never falls back to an uncontained run.

### Who decides the tier

The launcher never labels a run `contained`, and neither does the daemon. The daemon reports `gateway` or lower, as it does for any wrapped session. The control plane computes `contained` at ingest from three things it holds: a verified chain, gateway traffic in that chain, and a receipt whose genesis hash matches the chain's (`register_contained_launch`, `tacho.contained_launches`). A run started outside the launcher on the same machine has no receipt, so it earns `gateway` at most.

### Required containment

An agent definition can require the tier:

```toml
[containment]
required = true
```

The control plane signs `containment: { required: true }` into the bundle of a host that advertises the `containment` bundle feature. It suspends a host that does not advertise it, because that host's strict bundle schema would drop the clause and run the agent uncontained (`tacho-host.ts:590-603`). In `enforce` mode, the hook refuses the start, every prompt, and every tool call of a session the launcher did not start, with `containment_required` (`bundle.ts:823-832`). In `observe` mode the requirement is recorded and refuses nothing.

### Trust boundary

`contained` holds against the agent and every process it starts. It does not hold against whoever administers the host, because membership in the `docker` group is root on that machine. That person can:

- Run a modified `tachod` that registers a measurement for a process it never confined. The receipt is the launcher's attestation. No hardware or remote attestation signs it.
- Change the container after it was measured, with `docker network connect`, `docker exec`, or a new mount.
- Read the vendor key from custody, and the GitHub token while the run is live.
- Build a different image. Its digest lands in the receipt, and nothing compares it with a known-good list.
- Stop the daemon or drop events before they ship. The record shows silence, not a violation.

Two gaps remain against the agent itself:

- The agent can write anything under `/workspace`, including `.git/hooks`. A git command the host later runs in that checkout runs those hooks outside the container. The CI example discards the checkout after the run.
- The model and MCP routes are open for the run's life. The gateway governs and meters what the agent sends through them. The container refuses none of it.

### Stella in-app runs

A Stella in-app run (`arun_`) sends no gateway traffic, because the engine runs outside the sandbox. The Stella in-app roadmap proposes rule D1 for those runs: `contained` needs a receipt naming all three controls, plus a frame for every tool call showing it entered through the host (`stella-in-app-agent-roadmap.html:443-468`). D1 is a proposal and is not built.

### What the page says

"Enforced", for routed traffic and the filesystem boundary, against the agent and every process it starts. Never "enforced" against the host administrator, and nothing about a run the launcher did not start.

## Delivery modes by tier

| Mode | `observe` | `harness` | `gateway` | `contained` |
|---|---|---|---|---|
| `turn_boundary` | Delivered at the next prompt if hooks are installed. Recorded as assembled otherwise | Delivered at the next prompt | Delivered at the next prompt | Delivered at the next prompt |
| `next_step` | As `harness`, if hooks are installed | Delivered at the next step on Claude Code and Codex | Delivered at the next step | Delivered at the next step |
| `interrupt` | Degrades to `next_step` | Degrades to `next_step` (`harness_tier`) | Cuts the model call in flight | Cuts the model call in flight |

A command that cannot reach a run is refused for a reason about the run, never about its tier: `run_sealed`, `no_host`, `host_revoked`, or `host_offline` (ADR-163). A Stella steer is refused with `no_prompt_carrier`.

## Copy rules

- **A tier word is shown as a word.** It is never a score, a percentage, a progress bar, or "fully governed" or "partially governed" (ADR-078:88-91).
- **No surface shows a stronger word than the run's tier.** This covers the UI, exports, attestation reports, and docs (`docs/oxagen/specs/tacho/plan.md:19`).
- **"Enforced" appears in two places only.** Budgets on `gateway` traffic, and `contained` runs. Each carries its scope.
- **"Enforced on every call" and "enforced on every run" are banned** without a scope. The replacement is "checked on governed calls, for actions routed through Oxagen" (`oxagen` `.claude/skills/oxagen-branding/references/words.md:81`, `:104`).
- **Page vocabulary.** Pages say "tier", never "seam" or "client tier" (`fleet-operations-ia.md:151`). Spend sources read "Observed by gateway" and "Reported by harness" (`:160-161`). `tools/check-copy.mjs` bans "seams", "client-attested", "earns the word", and "stronger word than" on rendered pages. Specs in `docs/` may use them.
- **A tier that is not built yet** shows a dashed badge and a hatched rung, and claims nothing as present (`engine.js:725`, `engine.css:2057-2059`). `TIER_NA` is empty today because every rung has code on `main`.

## Surfaces

**Badge.** `tierBadge(t)` (`engine.js:723-728`) draws a lowercase badge in 10.5 px Monaspace Neon (`.b-tier`, `engine.css:193`) whose tooltip is the rung's page copy.

| Tier | Badge tone |
|---|---|
| `observe` | `b-q` (neutral) |
| `harness` | `b-approval` |
| `gateway` | `b-allowed` |
| `contained` | `b-proven` |

**Ladder.** `tierLadder(cur)` (`engine.js:729-732`) draws the four rungs as an ordered list labelled "The tier ladder", four columns wide and two on a phone (`engine.css:2052-2063`). It highlights the current rung and badges it "this agent".

**Where a tier appears.**

- The run header (`engine.js:2066`) and the Decision trace intro (`wedge.js:584-585`).
- The `agent_start` frame (`engine.js:3608`) and the evidence seal, which signs `enforcement_tier` (`engine.js:3921-3922`).
- The Agent runtime tab: the ladder and the "Tier earned" row (`engine.js:4493`, `:4538`).
- The Runtimes page: the table cell, the ladder, and the tier row (`engine.js:6808`, `:6838`, `:6861`).
- Agent lists and cards, and steering assignments.

## Data model

| Object | Where | Values |
|---|---|---|
| Wire enum `ENFORCEMENT_TIERS` | `packages/tacho/src/envelope.ts:64` | `gateway`, `harness`, `observe`. `contained` is missing. See "Conflicts" |
| Database enum `TACHO_ENFORCEMENT_TIERS` | `packages/database/src/schema/tacho.ts` | All four |
| Session column | `tacho.sessions.enforcement_tier` | All four. Default `observe` |
| Event column | ClickHouse `tacho_events.enforcement_tier` (`packages/telemetry/src/migrations/0027_tacho_events.sql:25`) | Generated from the wire enum |
| Seal and cost columns | `agent.agent_run_attempt_seals`, `cost.run_totals` | All four, by CHECK constraint |
| Replay grade | `GRADE_ENFORCEMENT_TIERS` (`packages/tacho/src/evidence/replay-grade.ts`) | All four |
| Launch receipts | `tacho.contained_launches`, unique on `(host_id, session_uuid)`, with row-level security | Migration `20260923230000_tacho_contained_launches.sql` |
| Receipt route | `POST /v1/tacho/contained-launch` (`apps/api/src/routes/v1/tacho.contained_launch.register.ts:30`), capability `register_contained_launch` | Refuses with `containment_not_ready` before the migration and `contained_launch_mismatch` on a conflicting registration |
| Refusal codes | Proxy and hooks | `session_budget_exceeded`, `daily_budget_exceeded`, `model_not_permitted`, `model_ambiguous`, `foreign_credential`, `containment_required`, `steer_interrupt`, `steered_by_operator` |

## Status

Checked at `oxagen` `main` `4a21610ef` on 2026-09-25.

| Tier | Built | Running in production |
|---|---|---|
| `observe` | Yes | Yes |
| `harness` | Yes. Claude Code, Codex, Cursor, and Stella through hooks | Yes |
| `gateway` | Model proxy, credential custody, budgets, allowlist, and interrupt are on `main`. The MCP aggregator for wrapped harnesses is not (#3299 open). Claude Desktop's MCP gateway is on `main` | Model traffic for enrolled Claude Code, Codex, and Stella hosts. MCP for Claude Desktop only |
| `contained` | Receipt route and tier binding (#3772) and the launcher (#3813) merged 2026-09-23. Phase 5 (#3300) is open with `needs:rig`. Contained runs pushing through the Git proxy (#3815) are open | No. The `contained-run` CI job waits on the repository variable `OXAGEN_CONTAINED_ENABLED`, and `docs/VISION.md:107-110` says no production run has reached the tier |

## Conflicts

These are places where the page copy, the ADRs, and the code disagree today. Each needs one side changed.

1. **The `observe` copy says "No hook is installed and nothing is delivered."** An `observe`-mode host has hooks installed. It delivers steering, refuses on operator state, and records every rule result. The copy holds only for runs with no hooks. Proposed copy: "Recorded only. Rules are checked and recorded, and none refuses a call." The same line lives in `oxagen` `apps/app/messages/runtimes.json` and `agents.json`.
2. **The `gateway` copy says "Model and MCP traffic goes through the gateway."** Today a wrapped harness routes model traffic only, and Claude Desktop routes MCP only. One call of either kind earns the tier. Proposed copy: "Model or MCP traffic goes through the gateway. The gateway meters it and enforces budgets on it."
3. **The `gateway` copy says the gateway "enforces budgets".** It enforces a budget only when the agent's definition declares one. Otherwise `budget.mode` is `observed` and the budget refuses nothing. The run page should say which.
4. **The `contained` copy names one control.** A sandbox whose only exit is the gateway earns `gateway` at most unless the receipt also attests the filesystem policy and hook integrity. Proposed copy: "The agent runs in an OS sandbox the launcher set up. Its only network exit is the gateway, and its hooks cannot be changed."
5. **The wire enum lacks `contained`.** `ENFORCEMENT_TIERS` in `envelope.ts:64` has three values while every database list has four. ClickHouse `tacho_events.enforcement_tier` is generated from the wire enum, so a `contained` event value has no slot there. #3300 work item 4 is half done.
6. **The hook crash case contradicts the fail-closed framing.** ADR-095 says the hook fails closed against its bundle, and it does for rule decisions. A hook process that crashes or prints nothing is read as allow by every harness except Cursor with `failClosed` (`hook-client.ts:993-998`).
7. **The Tacho spec lags the code.** `docs/specs/tacho/spec.md` in `oxagen` defines `gateway` as "every tool routed" (`:278`), has no `contained` in §6.3, still refuses commands to `observe` runs with `observe_tier` (`:391`, reversed by ADR-163), and says `per_day_micros` is not signed (`:405`). The spec's status is still `Proposed`.
8. **Phase status reads three ways.** `docs/VISION.md:106` and `packages/tacho/README.md:395` say Phase 4 is in build. `README.md:415-416` says the proxy is on `main`. `README.md:375-376` says there is no sandbox. `README.md:239-240` and ADR-143:154 say Stella does not route, and `wire.ts:403-409` routes it.
9. **The default retention mode disagrees.** With no retention policy, a workspace defaults to `content_exact` (`tacho-host.ts:256-268`), and the proxy ships request and response bodies under it. ADR-094:71-75 and #3299's definition of done say no prompt body reaches Oxagen's servers. `packages/tacho/README.md:167` says `digest_only` is the default. This does not change a tier, and it changes what a `gateway` run's record holds.
10. **`mission-control-spec.md` §7.1 and §7.2 are out of date** on status: they show `gateway` for a wrapped harness and `contained` as not built. This spec supersedes them for tier facts. `README.md:132-134` in this repo describes the mockup's fixtures, where most agents run `gateway` and Stella CI runs `contained`, which production has not reached.

## Rules every build keeps

1. The control plane computes the tier from the run's record. No launcher, daemon, adapter, or enrollment setting assigns it.
2. A live tier only rises. A sealed tier never changes.
3. No surface shows a word stronger than the run's tier, and every control claim states its scope.
4. `contained` needs a receipt naming all three controls, a verified chain, and gateway traffic in that chain.
5. A launcher that cannot provide its profile refuses to start. It never runs the agent uncontained.
6. No vendor or GitHub credential enters a contained sandbox.
7. A tier word is never rendered as a score.
