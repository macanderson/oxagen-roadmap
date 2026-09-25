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

**Header.** Eyebrow “Step 2 of 3”, h1 “Wrap the agent”, no lead. Why nothing is copied or pasted is in the component help (`mockups/help/register-wrap.md`, Page header).
Actions (card footer): **Cancel** · **Back** · caption “Nothing completes until a frame arrives.” · **I already installed it**. The gold action is **Download for <OS>** inside the Claude Code and Codex CLI panels. The SDK panel has no gold action.

- Harness tabs (`role=tablist`, “How to wrap the agent”), each a harness mark and name over a sub-line: **Claude Code** “one click · harness” · **Codex CLI** “one click · harness” · **SDK agent** “five lines · harness”. The SDK agent tab shows the mark of the SDK harness chosen on step 1, or a plug for Other (SDK-wrapped). The tab preselected is the one for the harness chosen on step 1.
- **Claude Code** panel: h3 “Claude Code” with a green badge “recommended”. Copy: “The installer writes the hooks, installs the `oxagend` collector and the `oxagen-hook` binary, registers them to start at login, and enrolls this host with an Ed25519 device key.” Tier ladder (`reg-earn`): This agent → `harness` · Next rung → `gateway` · Top rung → `contained`, each a tier badge, with no copy under it. How the tier is computed is in the component help (`mockups/help/register-wrap.md`, Claude Code panel). Right column, eyebrow “Download”: OS tabs (`role=tablist`, “Operating system”) macOS · Windows · Linux; **Download for macOS** (gold); the package line (`REG_PKG`): `oxagen-agent-2.4.0.pkg` / “14.2 MB · notarized · Developer ID” / `sha256:3f9c71d2…b40a` (Windows: `oxagen-agent-2.4.0.msi`, “16.8 MB · signed · EV certificate”, `sha256:7a21ce55…19f3`; Linux: `oxagen-agent_2.4.0_amd64.deb`, “12.9 MB · deb, rpm and curl script”, `sha256:c40b8e19…62dd`); the token box “one-time enrollment token embedded / `oxe_1time_7QK4M2NV9XR3T8ZP` / expires in 30 min · single use”; “or run” `oxagen agent enroll --token oxe_1time_7QK4M2NV9XR3T8ZP`.
- **Codex CLI** panel: h3 “Codex CLI”. Copy: “The installer writes `~/.codex/config.toml`: the oxagen MCP endpoint, the notify hook to the collector, and the approval policy routed through oxagen.” Ladder: This agent → `harness` with a chip “or observe” · Next rung → `gateway` · Top rung → `contained`, with no copy under it. What “or observe” means is in the component help (Codex CLI panel). Download column as above, with “profile: codex-cli” in place of the checksum and the command `oxagen agent enroll --harness codex-cli`.
- **SDK agent** panel: h3 “SDK agent”. Copy: “`oxagen.agent.wrap({})` installs a frame emitter, the checkpoint gate before each turn, and the oxagen MCP endpoint as the agent’s tool provider.” Which SDKs it works with is in the component help (SDK agent panel). Ladder as Claude Code. Right column, eyebrow “Agent credential”: box “issued once to the operator / `ox_live_••••••••••••3f7a` / hashed at rest · purpose-locked · revocable”; “Set it as `OXAGEN_AGENT_TOKEN`.” (run tokens and revocation are in the component help, Agent credential); the install line (`npm i @oxagen/sdk`, `pip install oxagen`, or `go get github.com/oxagen/oxagen-go`). Full width: language tabs (`role=tablist`, “Language”) TypeScript · Python · Go, **Copy the five lines** (toast “Five lines copied.”), and the five-line wrap with the agent key and `OXAGEN_AGENT_TOKEN`.

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The gate shell (`regShell`): brandmark, `marcus@a-intel.example`, **Cancel**; the rail with step 1 done (✓, a button back to Name the agent), step 2 current, step 3 disabled; no caption under the card. The phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Enrollment token, harness tab | `S.reg`, `REG_TABS`, `REG_TOKEN` | `control.enrollments` | `tacho.hosts`; `tacho.enrollment.create` | ✅ |
| Signed packages | `REG_PKG` | release artefacts (signed) | release pipeline | 🟡 |
| Tier ladder | `TIERS`, `tierBadge` | `iam.principals.tier` (per run, from what was routed) | `tacho` run records | ✅ |

## Functionality

- **Download for <OS>** (`regInstall(harness)`) records the harness, toasts “Signed installer for <OS> downloaded with the one-time token embedded.”, resets the first-frame log, and moves to step 3.
- **I already installed it** (`regInstall(null)`) moves to step 3 without changing the harness.
- **Back** returns to Name the agent. Either Cancel returns to Work with the toast in `register-name.md`.
- The tier ladder shows all four tiers as real: `harness` for this agent, `gateway` and `contained` as the next rungs, and `observe` as the fallback for a Codex CLI without an approval hook.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell), Claude Code tab and macOS selected.
- **loading**: the shell and the rail stay. The card is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **access denied**: “You cannot see agent registration”, then “Your roles on Anderson Intelligence Corp. do not include `agent.register on core-platform`. An organization owner can grant it.” Actions: **Request access** (gold, opens dialog `request-access`), **Back to Work**. Below: *Signed in as* “Marcus Bell · workspace.owner · core-platform”, *Needed* “agent.register on core-platform”, *Decided by* “pol_v41”.

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
