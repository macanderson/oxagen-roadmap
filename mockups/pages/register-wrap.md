# Register agent · Wrap

| | |
|---|---|
| Route | `#/a-intel/core-platform/register/wrap` |
| Scope | workspace gate |
| Spec | §14; Appendix F page 3 |
| Design | `mockups/src/engine.js` → `pRegister(r) → regWrap()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · access denied |
| Storybook | `Oxagen / … / register-wrap`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `register-wrap.audit-prompt.md` |

## Job

Step 2 of 3: wrap the agent. A wrapped agent has Oxagen’s hooks installed and its governed tools served by Oxagen’s MCP server. Nothing is pasted: the installer carries the one-time enrollment token.

## What is on the page

**Header.** Eyebrow “Step 2 of 3”, h1 “Wrap the agent”, lead “The installer carries a one-time enrollment token for `a-intel.core.perf-watch`, so nothing is copied or pasted.”
Actions (card footer): **Cancel** · **Back** · caption “Nothing completes until a frame arrives.” · **I already installed it**. The gold action is **Download for <OS>** inside the Claude Code and Codex CLI panels. The SDK panel has no gold action.

- Harness tabs (`role=tablist`, “How to wrap the agent”), each a name over a sub-line: **Claude Code** “one click · harness” · **Codex CLI** “one click · harness” · **SDK agent** “five lines · harness”. The tab preselected is the one for the harness chosen on step 1.
- **Claude Code** panel: h3 “Claude Code” with a green badge “recommended”. Copy: “The installer writes the hooks, installs the `oxagend` collector and the `oxagen-hook` binary, registers them to start at login, and enrolls this host with an Ed25519 device key. Nothing is copied or pasted: the one-time enrollment token is embedded in the download.” Tier ladder (`reg-earn`): This agent → `harness` · Next rung → `gateway` · Top rung → `contained`, each a tier badge. Dim copy: “The tier is computed per run from what was actually routed, never from what the adapter can do on paper. Hooks deliver steering and can refuse at four events. The harness reports what they did, and they fail open.” Right column, eyebrow “Download”: OS tabs (`role=tablist`, “Operating system”) macOS · Windows · Linux; **Download for macOS** (gold); the package line (`REG_PKG`): `Oxagen-Agent-2.4.0.pkg` / “14.2 MB · notarized · Developer ID” / `sha256:3f9c71d2…b40a` (Windows: `Oxagen-Agent-2.4.0.msi`, “16.8 MB · signed · EV certificate”, `sha256:7a21ce55…19f3`; Linux: `oxagen-agent_2.4.0_amd64.deb`, “12.9 MB · deb, rpm and curl script”, `sha256:c40b8e19…62dd`); the token box “one-time enrollment token embedded / `oxe_1time_7QK4M2NV9XR3T8ZP` / expires in 30 min · single use”; “or run” `oxagen agent enroll --token oxe_1time_7QK4M2NV9XR3T8ZP`.
- **Codex CLI** panel: h3 “Codex CLI”. Copy: “The same installer, with the Codex profile. It writes `~/.codex/config.toml`: the Oxagen MCP server, the notify hook to the collector, and the approval policy routed through Oxagen.” Ladder: This agent → `harness` with a chip “or observe” · Next rung → `gateway` · Top rung → `contained`. Dim copy: “Which of the two the native tools earn depends on the harness version. On versions that do not expose an approval hook the agent is recorded only, and the run says so.” Download column as above, with “profile: codex-cli” in place of the checksum and the command `oxagen agent enroll --harness codex-cli`.
- **SDK agent** panel: h3 “SDK agent”. Copy: “Five lines in your own process. `oxagen.agent.wrap({})` installs a frame emitter, the checkpoint gate before each turn, and the Oxagen MCP endpoint as the agent’s tool server. Works with the OpenAI Agents SDK, the Claude Agent SDK, Stella, and any custom loop.” Ladder as Claude Code. Right column, eyebrow “Agent credential”: box “issued once to the operator / `oxa_live_••••••••••••3f7a` / hashed at rest · purpose-locked · revocable”; “Set it as `OXAGEN_AGENT_TOKEN`. Oxagen mints short-lived run tokens from it at run start. Revoking the credential kills every run token at the next call.”; the install line (`npm i @oxagen/sdk`, `pip install oxagen`, or `go get github.com/oxagen/oxagen-go`). Full width: language tabs (`role=tablist`, “Language”) TypeScript · Python · Go, **Copy the five lines** (toast “Five lines copied.”), and the five-line wrap with the agent key and `OXAGEN_AGENT_TOKEN`.

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The gate shell (`regShell`): brandmark, `marcus@a-intel.example`, **Cancel**; the rail with step 1 done (✓, a button back to Name the agent), step 2 current, step 3 disabled; the caption “Registration finishes when the agent first connects to oxagen. That connection also tests the install. Cancel at any time. Nothing is saved until the agent connects.” The phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Enrollment token, harness tab | `S.reg`, `REG_TABS`, `REG_TOKEN` | `control.enrollments` | `tacho.hosts`; `tacho.enrollment.create` | ✅ |
| Signed packages | `REG_PKG` | release artefacts (signed) | release pipeline | 🟡 |
| Tier ladder | `TIERS`, `tierBadge` | `iam.principals.tier` (per run, from what was routed) | `tacho` run records | ✅ |

## Functionality

- **Download for <OS>** (`regInstall(harness)`) records the harness, toasts “Signed installer for <OS> downloaded with the one-time token embedded.”, resets the first-frame log, and moves to step 3.
- **I have already installed it — continue** (`regInstall(null)`) moves to step 3 without changing the harness.
- **Back** returns to Name the agent. Either Cancel returns to Work with the toast in `register-name.md`.
- The tier ladder shows all four tiers as real: `harness` for this agent, `gateway` and `contained` as the next rungs, and `observe` as the fallback for a Codex CLI without an approval hook.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell), Claude Code tab and macOS selected.
- **loading**: the shell and the rail stay. The card is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **access denied**: “You cannot see agent registration”, then “Your roles on Anderson Intelligence Corp. do not include `agent.register on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (gold, opens dialog `request-access`), **Back to Work**. Below: *Signed in as* “Marcus Bell · workspace.owner · core-platform”, *Needed* “agent.register on core-platform”, *Decided by* “pol_v41 · deny wins over every allow”.

## Mobile

The card fills the width with 16 px gutters. The two panel columns stack. Buttons are full width and at least 44 px tall. Code blocks scroll sideways inside the card.

## Permissions

- Read: `agent.register`
- Writes (each a governed action recorded in Audit): `enrollment.create` (the token is minted once and embedded in the download)

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger. A window the harness reported is labeled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen. Gold is identity and never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do. Nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
- Headings are plain nouns: no heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence or nothing.
- Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
