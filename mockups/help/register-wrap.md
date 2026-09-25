# Register agent · Wrap

## Page header {#register-wrap/header}

The step's eyebrow and title, and the footer that moves you on once the agent is installed.

### Purpose
You are on step 2 of 3. The header names the step, and the footer gives you the three ways off it: back to the name, on to the first frame once you have installed, or out of the flow.

### Rationale
The step has no lead. What the old lead said moved here: the installer carries a one-time enrollment token for the agent key (`a-intel.core.perf-watch` on the demo record), so nothing is copied or pasted. The token is minted for this key alone, and the download or the enroll command carries it. You never handle a secret on this screen (`docs/mission-control-spec.md` §4.4, "one click for Claude Code or Codex").

The footer keeps one caption, "Nothing completes until a frame arrives." It tells you why there is no Done button. Registration ends at the first frame on step 3, and that frame is also the installer's smoke test, so there is one path to finish and not two.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow and title | literal in `regWrap()` | none, static copy | live |
| Agent key in the token and the SDK code | `regKey()` over `S.reg` | `control.enrollments` | live |

### Logic
- `pRegister(r)` renders `regWrap()` for `/register/wrap`. The title reads "Wrap the agent" in register mode and "Wrap an agent" in onboard mode (`S.reg.mode`).
- **Cancel** is `regCancelBtn()`, which calls `regCancel`: it clears `S.reg` and its timers, returns to Work, and toasts "Registration canceled. Nothing was installed and nothing was written."
- **Back** calls `regNav('name')` in register mode and `regNav('organization')` in onboard mode. Your choices on step 1 survive, since `S.reg` is kept.
- **I already installed it** calls `regInstall(null)`: it keeps the harness from step 1, resets the first-frame log (`S.reg.log = 0`, `S.reg.first = false`), clears the timers, and moves to step 3. It is plain, not gold. The gold action on this screen is **Download for <OS>** inside the Claude Code and Codex CLI panels. The SDK panel has no gold action.
- The build must write the enrollment when the token is minted (`enrollment.create`, a governed action in Audit). The mockup writes nothing on this step.

### States
- **Loaded**: eyebrow "Step 2 of 3", title "Wrap the agent", the Claude Code tab and macOS selected.
- **Loading** and **denied**: the header is not drawn. The gate shell and the step rail stay, and the skeleton or the denied block fills the body.
- **Mobile**: the title fills the width. The footer wraps, and the caption and **I already installed it** drop to a row of their own.

## Harness tabs

Three tabs, one per way to wrap an agent: Claude Code, Codex CLI and SDK agent.

### Purpose
You pick how your agent gets wrapped. Each tab shows its harness mark, its name, and a sub-line that says how much work it is and which tier it earns.

### Rationale
The three tabs are the three wrapping paths in `docs/mission-control-spec.md` §4.4: one click for Claude Code or Codex through the installer, or the five-line `oxagen.agent.wrap({})` snippet for an SDK agent. Every other harness on step 1 (`stella`, `claude-agent-sdk`, `custom`) falls under the SDK tab, so three tabs cover five harness values. Register agent and onboarding share this component, so onboarding-wrap opens this section too.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tab list and sub-lines | `REG_TABS` | none, static copy | live |
| Selected tab | `S.reg.tab`, preset by `regTabFor(S.reg.harness)` | `control.enrollments` (the harness) | live |
| Harness marks | `hxIcon()` over `HX` | none, static marks | live |

### Logic
- `REG_TABS` lists `cc` "Claude Code" ("one click · harness"), `codex` "Codex CLI" ("one click · harness") and `sdk` "SDK agent" ("five lines · harness").
- The tab preselected is the one `regTabFor` picks from the step-1 harness: `claude-code` gives `cc`, `codex-cli` gives `codex`, and every other value gives `sdk`.
- The SDK agent tab shows the mark of the step-1 harness when that harness maps to `sdk` (Stella, Claude Agent SDK, or the plug of Other (SDK-wrapped)). Otherwise it shows the plug.
- Clicking a tab sets `S.reg.tab` and re-renders. It does not change `S.reg.harness`. Only **Download for <OS>** records a new harness.
- The tabs are a `role="tablist"` named "How to wrap the agent". Each tab carries `aria-selected`, and the panel below is a `role="tabpanel"`.

### States
- **Loaded**: Claude Code selected on the demo record.
- **Mobile**: the three tabs keep one row, and the sub-lines hide.

## Claude Code panel

What the Claude Code installer puts on the machine, and the tier ladder the agent sits on.

### Purpose
You see what the installer will change before you download it, and which tier the agent will be recorded at.

### Rationale
The panel says what gets written to the host because an operator installs it on their own machine and should know what it touches: the hooks, the `oxagend` collector, the `oxagen-hook` binary, the login item, and an Ed25519 device key. The UI keeps the names `oxagend` and `oxagen-hook`. The tree still calls the daemon `tachod`, and the rename has not happened (`docs/mission-control-spec.md` §7.2).

Two sentences moved here. Nothing is copied or pasted, because the one-time enrollment token is embedded in the download. And the tier paragraph: the tier is computed per run from what was actually routed, not from what the adapter can do on paper. Hooks deliver steering and can refuse at four events. The harness reports what they did, and they fail open.

The ladder follows ADR-095: four words, computed from what was routed. `harness` means hooks are installed, steering is delivered, and the four blocking events (`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PermissionRequest`) can refuse. It may claim "delivered", "recorded", "client-attested" and "fail-open", and it may not claim "enforced". Fail-open describes the tier: a person at the keyboard can remove the hook and the action proceeds (§7.1).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tier ladder | `earn()` over `TIERS`, `tierBadge` | `iam.principals.tier` (per run, from what was routed) | live |
| Tier descriptions (badge tooltips) | `TIERS` | none, static copy | live |

### Logic
- `earn()` draws three rows: This agent `harness`, Next rung `gateway`, Top rung `contained`. `observe` appears only on the Codex CLI panel.
- `tierBadge` colors `harness` as approval, `gateway` as allowed and `contained` as proven, and puts the `TIERS` sentence in each badge's tooltip.
- The **recommended** badge sits on this tab only.
- Today `gateway` is reachable for a wrapped harness only with Phase 4 (the loopback model proxy and the MCP aggregator), which is in build, and `contained` only with Phase 5, which is not built. The mockup shows both as real rungs because `TIER_NA` is empty. Until those phases land, the build must mark both "not yet available" (§7.1, "Today").

### States
- **Mobile**: the panel's two columns stack, with the ladder above the Download column.

## Codex CLI panel

What the Codex CLI installer writes, and the ladder with its `or observe` fallback.

### Purpose
You see which Codex file the installer changes and that this agent may record at a lower tier than Claude Code, depending on your Codex version.

### Rationale
The panel's copy is one sentence: the installer writes `~/.codex/config.toml` with the Oxagen MCP endpoint, the notify hook to the collector, and the approval policy routed through Oxagen. What it replaced moved here. It is the same installer as Claude Code, with the Codex profile (`codex-writer.ts` in the tree, `docs/mission-control-spec.md` §7.2).

The dim paragraph under the ladder also moved here. Which of the two tiers the native tools earn depends on the harness version. On a Codex version that does not expose an approval hook, the agent is recorded only, and the run says so. That is why the first rung carries a second chip, **or observe**. Codex exports no spend today, so a Codex run's spend is absent from the record until Phase 4 routes its model traffic (§7.2).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tier ladder with fallback | `earn()` over `TIERS`, `tierBadge` | `iam.principals.tier` (per run, from what was routed) | live |
| Profile line | literal "profile: codex-cli" | release artefacts (signed) | partial |

### Logic
- The first ladder row is This agent `harness` with the chip `or observe`. The next rungs are `gateway` and `contained`, as on Claude Code.
- The Download column shows the same package as Claude Code and replaces the checksum line with "profile: codex-cli".
- The command under "or run" is `oxagen agent enroll --harness codex-cli`. It carries no token in the mockup.
- The tier a run records is computed from its traffic, so a run shows `observe` when no approval hook answered.

### States
- **Mobile**: the columns stack, as on Claude Code.

## SDK agent panel

What the SDK wrapper installs in your own process, and the ladder it would earn.

### Purpose
You wrap an agent you wrote yourself, in any loop, by adding a call around it. The panel says what that call installs.

### Rationale
The copy is one sentence: `oxagen.agent.wrap({})` installs a frame emitter, the checkpoint gate before each turn, and the Oxagen MCP endpoint as the agent's tool provider. Two sentences moved here. It is five lines in your own process. It works with the OpenAI Agents SDK, the Claude Agent SDK, Stella, and any custom loop.

The wrapper is a target, not a shipped path. `docs/mission-control-spec.md` §7.2 lists SDK agents as "Not built": `oxagen.agent.wrap(agent)` is outside the six phases of §17.2, and its tier today is none. The build must not present this tab as working until the wrapper exists. The ladder here shows `harness` as the first rung to match the tab's sub-line, which is the design target.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Wrapper description | literal in `regWrap()` | none, static copy | not backed |
| Tier ladder | `earn()` over `TIERS` | `iam.principals.tier` (per run, from what was routed) | not backed |

### Logic
- The panel has no download and no enrollment token. The right column is the agent credential instead, and the snippet sits under both columns at full width.
- The ladder rows are This agent `harness`, Next rung `gateway`, Top rung `contained`.
- There is no gold action on this tab. You continue with **I already installed it** in the footer.

### States
- **Mobile**: the columns stack, and the snippet scrolls sideways inside the card.

## Download

The download column on the Claude Code and Codex CLI tabs: the OS switch, the gold download button, the package facts, the token and the enroll command.

### Purpose
You get the signed installer for your operating system with the token already inside, or copy one command that does the same.

### Rationale
The download is the one-click path of `docs/mission-control-spec.md` §4.4. The package facts (file, size, signature, checksum) are shown so you can check what you run before you run it. The command under "or run" serves a managed fleet, where a script installs the agent and nobody clicks (§7.2, `oxagen agent enroll --token`).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Package file, size, signature, checksum | `REG_PKG[S.reg.os]` | release artefacts (signed) | partial |
| Token in the command | `REG_TOKEN` | `control.enrollments` | live |

### Logic
- **Download for <OS>** is the gold action. It calls `regInstall('claude-code')` or `regInstall('codex-cli')`: it records the harness on `S.reg.harness`, toasts "Signed installer for <OS> downloaded with the one-time token embedded.", resets the first-frame log, clears the timers, and moves to step 3.
- The package lines come from `REG_PKG`: `oxagen-agent-2.4.0.pkg`, 14.2 MB, notarized with Developer ID (macOS). `oxagen-agent-2.4.0.msi`, 16.8 MB, EV certificate (Windows). `oxagen-agent_2.4.0_amd64.deb`, 12.9 MB, deb, rpm and curl script (Linux). Each has its own `sha256` line.
- "or run" shows `oxagen agent enroll --token oxe_1time_7QK4M2NV9XR3T8ZP` on Claude Code and `oxagen agent enroll --harness codex-cli` on Codex CLI.
- The mockup downloads nothing. The build must serve the signed artefact for the chosen OS with the token embedded.

### States
- **Mobile**: the column drops below the panel copy and fills the width. The command scrolls sideways.

## OS tabs

The macOS, Windows and Linux switch above the download button.

### Purpose
You pick the operating system of the machine the agent runs on, and the button and package facts follow it.

### Rationale
The installer is a signed native package per platform, so the file, the signature scheme and the checksum differ by OS. A switch keeps all three one click apart without three buttons competing for the gold action.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Selected OS | `S.reg.os` (`regNew` sets `macos`) | none, client state | mockup only |
| Package per OS | `REG_PKG` | release artefacts (signed) | partial |

### Logic
- `osTabs()` draws three tabs from `["macos", "windows", "linux"]`. Clicking one sets `S.reg.os` and re-renders.
- The button label, the package file, the size and signature line, and the checksum all read from `REG_PKG[S.reg.os]`. The toast on download names the OS.
- The switch is a `role="tablist"` named "Operating system", with `aria-selected` on the current tab.
- The build could preselect the OS from the browser's user agent. The mockup always starts on macOS.

### States
- **Loaded**: macOS selected.
- **Mobile**: the three tabs keep one row inside the full-width column.

## Enrollment token

The box that shows the one-time token inside the installer, with its expiry.

### Purpose
You can see which token the package carries and how long it is good for, so a stale download is easy to spot.

### Rationale
The token is how a host joins without pasting a secret. It is minted for one agent key, it is good for 30 minutes, and it works once. A second host that runs the same package is refused, which is the installer's own error state ("Enrollment token rejected"). Showing the token and its limits here explains that error before it happens.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Token | `REG_TOKEN` (`oxe_1time_7QK4M2NV9XR3T8ZP`) | `control.enrollments` | live |
| Expiry and single use | literal "expires in 30 min · single use" | `control.enrollments` | live |

### Logic
- `tok()` draws three lines: "one-time enrollment token embedded", the token, and "expires in 30 min · single use".
- The same token appears in the Claude Code enroll command and on the installer's Download screen.
- The mockup uses one fixed token for every flow. The build must mint a fresh token per enrollment (`enrollment.create`), show the live expiry, and revoke it when you cancel.

### States
- **Mobile**: the token wraps inside the box.

## Agent credential

The SDK tab's right column: the long-lived credential issued to the operator, and where to put it.

### Purpose
You learn which secret your SDK agent needs and the environment variable it reads, `OXAGEN_AGENT_TOKEN`.

### Rationale
An SDK agent has no installer to carry a token, so it authenticates with the agent credential: an API key issued to the operator once, stored as a hash, locked to one purpose, and revocable (`docs/mission-control-spec.md` §6.2). The box shows only its prefix and last four characters.

Two sentences moved here. Oxagen mints short-lived run tokens from the credential at run start. Revoking the credential kills every run token at the next call. The spec sets a run token's default life at fifteen minutes, and that revocation is what makes a halt stick.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Masked credential | literal `ox_live_••••••••••••3f7a` | none named in the page spec | not backed |
| Install line | `sdk.install` per `S.reg.lang` | none, static copy | live |

### Logic
- The box reads "issued once to the operator", the masked credential, and "hashed at rest · purpose-locked · revocable".
- The one instruction left on the page is "Set it as `OXAGEN_AGENT_TOKEN`."
- The install line follows the language tab: `npm i @oxagen/sdk`, `pip install oxagen`, or `go get github.com/oxagen/oxagen-go`.
- The build must show the full credential once, at issue, and only the masked form after.

### States
- **Mobile**: the column stacks under the panel copy.

## SDK snippet

The five-line wrap in TypeScript, Python or Go, with the agent key filled in.

### Purpose
You copy a working call with your agent key already in it, in the language your agent is written in.

### Rationale
The snippet is the whole integration for an SDK agent, so the page shows all of it rather than a link to docs. The key is interpolated so the copied code is correct for this agent without editing.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Language | `S.reg.lang` (`regNew` sets `ts`) | none, client state | mockup only |
| Agent key in the code | `regKey()` | `control.enrollments` | live |

### Logic
- The language tabs are a `role="tablist"` named "Language": TypeScript, Python and Go. Clicking one sets `S.reg.lang` and re-renders the code and the install line.
- Each variant calls `oxagen.agent.wrap` (Go: `oxagen.Agent.Wrap`) with `key` set to the agent key and the token read from `OXAGEN_AGENT_TOKEN`.
- **Copy the five lines** toasts "Five lines copied." The mockup copies nothing to the clipboard. The build must.

### States
- **Mobile**: the code scrolls sideways inside the card.
