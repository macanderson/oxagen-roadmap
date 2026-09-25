# Onboarding · Wrap an agent

## Page header {#onboarding-wrap/header}

The second step of the onboarding gate: its eyebrow, its title, and the footer that moves you to the first run.

### Purpose
You have named the organization and now wrap its first agent. The header names the step, and the footer takes you back to the organization, on to the first run, or out of onboarding.

### Rationale
This step is the Register agent wrap screen in onboard mode (`regWrap()` with `S.reg.mode === "onboard"`), because the gate and Register agent are one component (`docs/mission-control-spec.md` §4.4). Only the title, the key and the Back target differ. The title reads "Wrap an agent", since no agent exists yet, where Register agent reads "Wrap the agent".

The step has no lead. What the old lead said moved here: the installer carries a one-time enrollment token for `a-intel.core.release-manager`, so nothing is copied or pasted. The key comes from `obNew()`, which names the first agent `release-manager` instead of asking for a name, so onboarding keeps its three steps.

Every other part on this step opens the Register agent sections: the harness tabs, the Claude Code, Codex CLI and SDK agent panels, the Download column, the OS tabs, the enrollment token, the agent credential and the SDK snippet (`register-wrap/*`). They are written once, there.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow and title | literal in `regWrap()` | none, static copy | live |
| Agent key | `regKey()` over `S.reg` from `obNew()` | `control.enrollments` | live |
| Onboarding progress | `S.reg.mode` | `org.onboarding_state` (G16) | not backed |

### Logic
- `pWelcome(r)` renders this step for `#/welcome/wrap`. It creates the onboarding state with `obNew()` when none exists, so the step also opens directly from its link.
- **Back** calls `regNav('organization')` and returns to Name the organization, not to an agent name step.
- **Cancel** calls `obExit`: it clears `S.reg` and its timers and goes to Work. The demo labels it **Exit demo**, toasts "Onboarding demo closed. Nothing was written.", and hides both under `?product=1`. The build says **Cancel**.
- **I already installed it** calls `regInstall(null)` and moves to Start a run without changing the harness. The footer caption "Nothing completes until a frame arrives." stays, as on Register agent.
- **Download for <OS>** records the harness, toasts "Signed installer for <OS> downloaded with the one-time token embedded.", and moves to Start a run.
- The build must mint the enrollment token for the first agent key when this step opens (`enrollment.create`, a governed action in Audit).

### States
- **Loaded**: eyebrow "Step 2 of 3", title "Wrap an agent", the Claude Code tab and macOS selected, since the onboarding record's harness is `claude-code`.
- **Loading** and **denied**: the header is not drawn. The gate shell and the step rail stay, and the skeleton or the denied block (`org.create for marcus@a-intel.example`) fills the body.
- **Mobile**: the title fills the width, and the footer wraps as on Register agent.
