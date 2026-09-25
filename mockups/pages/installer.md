# Installer

| | |
|---|---|
| Route | `#/welcome/installer` |
| Scope | auth |
| Spec | §14; Appendix F not a page. These are the signed package’s own screens |
| Design | `mockups/src/engine.js` → `pWelcome(r) → obInstaller()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · error |
| Storybook | `Oxagen / … / installer`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `installer.audit-prompt.md` |

## Job

The signed installer package’s own screens: download, installing, connected. They are shown so the whole path from sign-up to the first frame can be walked. The package, not Oxagen, renders them.

## What is on the page

**Header.** No eyebrow and no h1. The card header is h3 “Oxagen Agent Installer” with `Oxagen-Agent-2.4.0.pkg` at the right. Each screen has its own h2.
Actions: **Install** (gold) · **Cancel** on the Download screen; **Back to Oxagen** (gold) on the Connected screen. Under the card, a switch row “Installer screen” with **Download** · **Installing** · **Connected** (`aria-pressed` on the one showing).

- **Download** (screen 0): h2 “Install the Oxagen agent”. Copy: “One signed package installs the collector, the hook binary and a login item, then enrolls this host to **Anderson Intelligence Corp. / Core platform**. The one-time enrollment token is embedded, so there is nothing to paste.” Facts (`kvl`): **Package** `Oxagen-Agent-2.4.0.pkg` · **Size** 14.2 MB · **Signature** notarized · Developer ID · **Checksum** `sha256:3f9c71d2…b40a` · **Token** `oxe_1time_7QK4M2NV9XR3T8ZP`. Buttons **Install** · **Cancel**. Dim: “Installs to your user account only. No sudo, no kernel extension, and nothing leaves the host except frames.”
- **Installing** (screen 1): h2 “Installing”, “Step N of 8”, a progress bar, and the eight steps (`OB_INSTALL`) with ✓ done, › now, · pending: Install the oxagend collector to /usr/local/bin · Install the oxagen-hook binary · Register a login item (launchd: com.oxagen.oxagend) · Write Claude Code hooks to ~/.claude/settings.json · Fetch the signed policy bundle and cache it · Register the Oxagen MCP endpoint as a tool server · Enroll this host with an Ed25519 device key · Run a one-turn smoke session. No buttons.
- **Connected** (screen 2): “connected” (dot and word) with `14:02:11` at the right. h2 “Connected to Anderson Intelligence Corp.”. Copy: “The smoke session produced its first frame and Oxagen countersigned it. `a-intel.core.release-manager` is wrapped at **harness** tier.” One frame row: seq 0 `14:02:11` `agent_start` “device key ed25519:7f3a…c19e · countersigned on ingest”. Copy: “Roll back at any time. This removes the hooks, the login item and the base URL, and restores your previous settings file:” then `oxagen agent unenroll --host mbell-mbp.local --restore`. **Back to Oxagen** · “The operator console is already unlocking in your browser.”

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The auth shell (`obShell`) is the brandmark at the top, then a centred card in its wide form. The phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Package facts | `REG_PKG.macos`, `REG_TOKEN` | release artefacts (signed) | release pipeline | 🟡 |
| Install steps, first frame | `OB_INSTALL`, `regLines` | `control.enrollments`, `:Frame` seq 0 | `tacho.hosts`, `agent_run_events` | 🟡 |

## Functionality

- **Install** (`obInstall`) moves to Installing and advances one step every 380 ms, then lands on Connected. **Cancel** returns to Wrap an agent.
- **Back to Oxagen** returns to Start a run, where the first frame has unlocked the console.
- Nothing here is an Oxagen write from the browser. The package carries the one-time enrollment token from the wrap step and enrolls the host itself.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell), on the Download screen.
- **error**: the card body is replaced and the screen switch row is hidden. h2 “Enrollment token rejected”, then “The token `oxe_1time_7QK4M2NV9XR3T8ZP` has already been used, at 13:58 on 11 Sep 2026 by host `mbp-marcus`. Enrollment tokens are single use.”, then “Nothing was installed. Generate a fresh token from the wrap step and run the installer again.” Action: **Back to wrap an agent** (returns to Wrap an agent). No gold action.

## Mobile

The card fills the width with 16 px gutters. Buttons are full width and at least 44 px tall. The facts stack label over value. The rollback command scrolls sideways.

## Permissions

- Read: `installer token`
- Writes (each a governed action recorded in Audit): `enrollment (by the package)`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger. A client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen. Gold is identity and never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do. Nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
- Headings are plain nouns: no heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence or nothing.
- Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
