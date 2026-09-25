# Installer

## Installer window

The card that stands in for the signed installer package's own window: its title and the package file name.

### Purpose
It shows what a person sees on their own machine after pressing **Download for <OS>** on the wrap step. The window holds three screens, Download, Installing and Connected, and one error screen.

### Rationale
The package, not Oxagen, renders these screens. They are in the mockup so the whole path from sign-up to the first frame can be walked in one place (`docs/mission-control-spec.md` §4.4). That is why the page has no eyebrow and no h1 of its own: the card header is the package's title bar. Nothing here is an Oxagen write from the browser. The package carries the one-time enrollment token from the wrap step and enrolls the host itself. Appendix F counts neither the sign-in flows nor the gate as pages, and the installer is not an Oxagen page at all.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Package file name | `REG_PKG.macos.f` | release artefacts (signed) | partial |
| Current screen | `S.ob.inst` | none, client state | mockup only |

### Logic
- `obInstaller()` draws the card inside the auth shell in its wide form (`obShell(..., true)`), with h3 "oxagen Agent Installer" and `oxagen-agent-2.4.0.pkg` at the right.
- It picks the screen from `S.ob.inst`: 0 Download, 1 Installing, 2 Connected. The error state replaces the body with Token rejected.
- The mockup always shows the macOS package, whatever OS you chose on the wrap step. The build is the package for the host's OS.
- You reach the page from **Open the installer** on the onboarding Start a run step (outside a scenario walk), from the account dialog's Onboarding tab, or from `#/welcome/installer`.

### States
- **Loaded**: the Download screen.
- **Error**: the Token rejected screen, and the screen switch is hidden.
- The page has no loading, empty or denied state.
- **Mobile**: the card fills the width with 16 px gutters.

## Download screen

The package's first screen: what it installs, the facts about the package, and Install.

### Purpose
You see what the package will put on your machine and for which organization and workspace, check its signature and checksum, and start the install.

### Rationale
Nothing was moved off this screen. Its copy is the package's own disclosure, shown before anything is installed. Enrollment is file edits plus a daemon, not a supervisor (`docs/mission-control-spec.md` §7.2): the package installs the collector, the hook binary and a login item, then enrolls the host with a device key. The token is embedded, so the one-click promise of §4.4 holds and there is nothing to paste. The scope line says the install stays in your user account, with no sudo and no system extension. The facts list lets a careful person verify the package before running it.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Organization and workspace | `ORG.name`, `ws().name` | `org.organizations`, `wrk.workspaces` | live |
| Package, size, signature, checksum | `REG_PKG.macos` | release artefacts (signed) | partial |
| Token | `REG_TOKEN` | `control.enrollments` | partial |

### Logic
- h2 "Install the oxagen agent", then one paragraph that names **Anderson Intelligence Corp. / Core platform**.
- The facts (`kvl`) are Package, Size (14.2 MB), Signature (notarized · Developer ID), Checksum (`sha256:3f9c71d2…b40a`), and Token (`oxe_1time_7QK4M2NV9XR3T8ZP`).
- **Install** (gold) runs `obInstall` and moves to Installing. **Cancel** runs `obGo('wrap')` and returns to Wrap an agent.
- The dim line under the buttons states the install scope.
- The build shows the token the wrap step minted. The token works once and expires 30 minutes after it is minted.

### States
- **Loaded**: this screen.
- **Mobile**: the facts stack label over value, and the buttons go full width.

## Installing screen

The package's progress screen: eight steps, a bar, and "Step N of 8".

### Purpose
You watch the install run step by step. If it stops, the step it stopped on is the one to report.

### Rationale
The eight steps are what enrollment does, in order (§7.2). The last one is a one-turn smoke session, and that session sends the first frame. The install test and the unlock are one event, so there is one path, not two (§4.4).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Steps | `OB_INSTALL` | `control.enrollments`, `:Frame` seq 0 | partial |
| Progress | `S.ob.instDone` | none, client state | mockup only |

### Logic
- The eight steps: install the collector to `/usr/local/bin`, install the hook binary, register a login item with launchd, write Claude Code hooks to `~/.claude/settings.json`, fetch and cache the signed policy bundle, register the MCP endpoint as a tool provider, enroll the host with an Ed25519 device key, and run a one-turn smoke session.
- Each step shows ✓ when done, › when running, and · when pending. The bar fills by steps done over 8, and the counter reads "Step N of 8".
- `obInstall` advances one step every 380 ms, so the screen lasts about 3 seconds, then moves to Connected. It stops if you leave the route.
- The screen has no buttons.
- The mockup always writes Claude Code hooks. The build lists the steps for the harness the token was minted for: the Codex profile writes `~/.codex/config.toml` instead.

### States
- **Loaded**: reached from Install or from the screen switch. From the switch it stays on step 1.
- **Mobile**: the steps wrap inside the card.

## Connected screen

The package's last screen: the first frame arrived, how to roll back, and the way back to Oxagen.

### Purpose
It confirms the host is enrolled and the agent is wrapped, shows the first frame as the evidence, and gives you the one command that undoes the install.

### Rationale
The first frame is the proof the install worked, so the screen shows it, countersigned on ingest. It names the tier the run earned, `harness`, and nothing stronger (§7.1). The rollback command is on this screen because unenroll restores what enrollment displaced (§7.2), and a person who installs on their own machine should see how to take it back. The rollback sentence names the base URL. Today's enrollment writes no model base URL. That arrives with Phase 4 (§7.2), so the build names it only when enrollment wrote one.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Frame time, device key | `regLines()` | `:Frame` seq 0 | partial |
| Agent key | `ORG.slug`, `ws().slug`, `obNew().slug` | `iam.principals` | partial (G16) |
| Host in the rollback command | `REG_HOST` | `control.enrollments` | live |

### Logic
- "connected" shows as a dot and a word, with `14:02:11` at the right. h2 "Connected to Anderson Intelligence Corp.".
- One sentence says the smoke session produced its first frame and Oxagen countersigned it, and that `a-intel.core.release-manager` is wrapped at **harness** tier.
- One frame row: seq 0, `agent_start`, the device key, "countersigned on ingest".
- The rollback command is `oxagen agent unenroll --host mbell-mbp.local --restore`.
- **Back to oxagen** (gold) runs `obGo('run')` and returns to Start a run. The note beside it says the console is already unlocking. In the mockup the Start a run step runs its own poll, which flips about 4.4 seconds later. The build must show the frame as already received.

### States
- **Loaded**: reached after Installing or from the screen switch.
- **Mobile**: the rollback command scrolls sideways.

## Token rejected

The error screen for an enrollment token that was already used.

### Purpose
It says the token was refused, when and by which host it was used, that nothing was installed, and what to do: generate a fresh token on the wrap step and run the installer again.

### Rationale
Enrollment tokens are single use, as the token box on the wrap step says. A reused token must fail before anything is installed, so the host is never left half enrolled. The screen names the host that used it (`mbp-marcus`) so you can tell whether it was you on another machine.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Token | `REG_TOKEN` | `control.enrollments` | partial |
| First use: time, date, host | literals in `obInstaller()`, date from `obDate(0)` | `control.enrollments` | partial |

### Logic
- The card body is h2 "Enrollment token rejected", a red box that says the token has already been used, a paragraph with 13:58 on 11 Sep 2026 and host `mbp-marcus`, and a paragraph that says nothing was installed.
- **Back to wrap an agent** (plain) runs `obGo('wrap')`. The screen has no gold action.
- The screen switch is hidden.
- The build must refuse the token on the server, not only in the package.

### States
- **Error** only.
- **Mobile**: the card fills the width and the button goes full width.

## Screen switch

A row under the card that jumps between the three installer screens.

### Purpose
It lets a reviewer or a story open Download, Installing or Connected directly, without waiting for the install to run.

### Rationale
This is a mockup-only control. The real installer is a native package, and its screens follow each other as the install runs. The row exists to drive the mockup. The build has no such row.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Screen shown | `S.ob.inst` | none | mockup only |

### Logic
- The row reads "Installer screen" and three buttons: **Download**, **Installing**, **Connected**. The one showing is selected and carries `aria-pressed="true"`.
- `obInstallScreen(n)` stops the install timer and shows screen `n`. Installing opens at step 1 and does not advance. Connected opens with all eight steps done.

### States
- **Loaded**: under the card.
- **Error**: hidden.
- **Mobile**: the row wraps when it does not fit on one line.
