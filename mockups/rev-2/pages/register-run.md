# Register agent · First run

| | |
|---|---|
| Route | `#/a-intel/core-platform/register/run` |
| Scope | workspace gate |
| Spec | §14 Mission Control; Appendix F page 3 |
| Design | `mockups/src/engine.js` → `pRegister(r) → regRun()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / … / register-run`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `register-run.audit-prompt.md` |

## Job

Step 3 of 3: wait for the first frame. Registration completes the moment the first frame from the new key reaches Oxagen and lands you on Fleet looking at its run. There is no Done button: the frame is the completion.

## What is on the page

**Header.** Eyebrow “Step 3 of 3”, h1 “Wait for the first frame”, lead “Registration completes the moment the first frame from `a-intel.core.perf-watch` reaches Oxagen and lands you on Fleet looking at its run.”
Actions (card footer) while waiting: **Cancel** · **Back** · caption “There is no Done button — the frame is the completion.” No gold action. After the frame: **Cancel** · countdown caption (`#regAuto`) · **Open in Fleet** (gold).

- **Waiting for the first frame** (the loaded story): card header with a spinner, h3 “Waiting for the first frame”, and “polling · 1s”. Chips: `a-intel.core.perf-watch` · the harness label (“Claude Code”) · “host mbell-mbp.local”. A log (`regLines`) that fills one line at a time, then “waiting…”: `14:01:48 host enrolled · device key ed25519:7f3a…c19e`, `14:01:52 collector oxagend running · pid 4412 · launchd com.oxagen.oxagend`, `14:01:55 hooks written · ~/.claude/settings.json · 5 events` (Codex CLI: `~/.codex/config.toml written · notify hook → collector`; SDK: `oxagen.agent.wrap() attached · frame emitter, checkpoint gate`), `14:01:58 signed policy bundle fetched · v41 · cached for offline` (SDK: `OXAGEN_AGENT_TOKEN accepted · run token minted`), `14:02:01 hooks answered · SessionStart 41 ms · tier harness`, `14:02:04 MCP endpoint registered · 0 tools granted yet`. Below: “Start Claude Code in any repository on `mbell-mbp.local`. The installer already ran a one-turn smoke session; if it is still in flight this flips on its own.”
- **First frame received** (after the poll flips): header “connected” (dot and word), h3 “First frame received”, “14:02:11.402”. Two frame rows: seq 0 `14:02:11.402` `agent_start` “harness=claude-code · host=mbell-mbp.local · attested=device-key · countersigned”; seq 1 `14:02:11.418` `oxagen:run.start` “agent=a-intel.core.perf-watch · operator=Marcus Bell · tier=harness · steering=none published”. Badges: tier `harness` · “replay grade: full” · “chain intact”. Copy: “The tier is computed from what was actually routed, not from what the adapter can do on paper. The hooks answered, so this run is harness: delivered, recorded, client-attested, fail-open.”

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The gate shell (`regShell`): brandmark, `marcus@a-intel.example`, **Cancel**; the rail with steps 1 and 2 done (✓, buttons back), step 3 current; the caption “Registration does not complete until the agent has talked to Oxagen. That first frame is also the installer’s smoke test, so there is one path, not two. Cancel at any time — nothing is kept until the frame arrives.” The phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| First frame poll and log | `regSchedule`, `regLines`, `S.reg.log` | `:Frame` seq 0 and 1 for the principal | `agent_run_events` / `tacho_events` | 🟡 |
| Agent and smoke run written on unlock | `obUnlock` (`AGENTS`, `RUNS`) | `iam.principals`, `runs` (task `smoke`, tier `harness`, basis `client_attested`, grade `full`) | `tacho.hosts`, `agent_runs` | ✅ / 🟡 unlock (G16) |

## Functionality

- The poll (`regSchedule`) starts 520 ms after the loaded render and adds a log line every 780 ms. At the sixth line it flips to First frame received. It stops when you leave the step or the state is not loaded.
- After the flip a six-second countdown runs in `#regAuto` (“Opening automatically…”, then “Opening automatically in N…”) and then `regFinish` runs. **Open in Fleet** runs it at once.
- `regFinish` writes the agent (status enrolled, tier `harness`) and its smoke run (“Installer smoke session”, cost 0.02 with basis `client_attested`, replay grade full) once per flow, clears `S.reg`, goes to Fleet, and toasts “a-intel.core.perf-watch registered — first frame received. Its smoke run is live on Fleet.” in gold. The smoke session opens the Steering PR that adds `.oxagen/agents/<slug>.toml`.
- **Back** returns to the wrap step and resets the log. Cancel after the frame toasts “Registration cancelled. The enrollment was revoked and the smoke run discarded.”; before it, the toast in `register-name.md`.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell). The story captures the waiting card with an empty log; the flip happens in the browser about five seconds later.
- **loading**: the shell and the rail stay. The card is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: the header stays. The card reads h2 “The collector cannot reach Oxagen”, then “The host `mbell-mbp.local` enrolled, but every request to `https://ingest.oxagen.com/v1` has been refused for 94 seconds (`ECONNREFUSED`, 6 attempts). No frame has arrived, so registration will not complete.”, then “Check that outbound 443 to `ingest.oxagen.com` is allowed, then run `oxagen agent status`.”, then `request req_01JQ8F4B1PC7QM · host mbell-mbp.local`. Action **Check again** (toast “Checked again — still refused. Nothing has changed on the host.”). Footer: **Cancel** · **Back**. No gold action.
- **access denied**: “You cannot see agent registration”, then “Your roles on Anderson Intelligence Corp. do not include `agent.register on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (gold, opens dialog `request-access`), **Back to Fleet**. Below: *Signed in as* “Marcus Bell · workspace.owner · core-platform”, *Needed* “agent.register on core-platform”, *Decided by* “pol_v41 · deny wins over every allow”.

## Mobile

The card fills the width with 16 px gutters. Buttons are full width and at least 44 px tall. The log and the frame rows keep their monospace columns and scroll sideways if they must.

## Permissions

- Read: `agent.register`
- Writes (each a governed action recorded in Audit): none from this page. The agent and its smoke run are written by ingest on the first frame.

## Backend gaps this page depends on

- G16 first-frame unlock

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger. A client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen. Gold is identity and never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do. Nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
- Headings are plain nouns: no heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence or nothing.
- Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
