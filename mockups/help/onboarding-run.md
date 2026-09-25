# Onboarding · First run

## Page header {#onboarding-run/header}

The last onboarding step's eyebrow and title, and the footer that opens Oxagen once the first frame arrives.

### Purpose
You arrive here after the wrap step. The header names what is left: a first run from the agent you just wrapped. The footer tells you the step finishes itself, offers the installer's own screens, and, once the frame is in, opens Oxagen on that run.

### Rationale
A new organization does not see the app until its first frame arrives (`docs/mission-control-spec.md` §4.4). The lead that sat under the title moved here: the operator console opens the moment the first frame from the new key reaches Oxagen, and lands you on Work looking at your own run. Work is the primary surface (D1 in `docs/fleet-operations-wedge.md`), and a run started from your own terminal is filed under a direct work order Oxagen opens for it (D2).

This step reuses the Register agent screen in onboard mode. The frame cards are the same components, so their sections live in `register-run.md`: Waiting for the first frame, Setup log, First frame received, and Collector unreachable. The key here is `a-intel.core.release-manager`, from `obNew`.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow and title | literal in `regRun()`, onboard mode | none, static copy | live |
| First-frame unlock | `regFinish`, `obUnlock` | `org.onboarding_state` + first-frame unlock (G16) | not backed |
| First-run view on Work | `S.firstRun` | `runs` | partial (G16) |

### Logic
- While waiting, the footer is **Cancel**, **Back** (`regNav('wrap')`, to Wrap an agent), **Open the installer** (ghost, `obGo('installer')`), and the caption "This step completes when the first frame arrives." Open the installer renders only outside a scenario walk. The one gold action is the Link button in the repository panel.
- Cancel runs `obExit`. The demo labels it **Exit demo** and hides it under `?product=1`.
- After the frame, the footer is **Cancel**, the countdown caption `#regAuto`, and **Open oxagen** (gold). The countdown runs six seconds, then calls `regFinish`.
- Outside a scenario, `regFinish` calls `obUnlock`, clears `S.reg`, sets `S.firstRun` to the new run's id, goes to `#/<org>/<ws>/work/orders`, and toasts a gold welcome that names the key and says the organization is out of the gate. Work then shows its first-run banner, the onboarding offer, and the provisional banner if you skipped the repository.
- Inside the W1 scenario (`S.scn`), the first press unlocks in place so the scenario rail stays, and toasts that Oxagen is unlocked. A second press moves to the scenario's Work step.
- The build must unlock on ingest, when the frame arrives, and record the organization's gate state in `org.onboarding_state`.

### States
- **Loaded**: "Step 3 of 3", "Start a run", the waiting card, and the repository panel.
- **Error**: the header stays, Collector unreachable replaces the cards, and the footer is Cancel and Back with no gold action.
- **Loading** and **denied**: the header is not drawn. The denied block names `org.create for marcus@a-intel.example`.
- **Mobile**: the cards fill the width and the footer buttons stack.

## Repository panel

The card under the frame card that links the workspace's main repo, the one the installer saw, or leaves the workspace provisional.

### Purpose
You link the repository the installer ran in as the workspace's main repo with one click, or you skip and link it later. The panel then shows which of the two you chose.

### Rationale
The installer reads the git remote of the directory it ran in, so binding the main repo is one click (`docs/mission-control-spec.md` §4.4). Three sentences moved off the panel into this section:
- The detected remote comes from `~/src/platform`, the directory the installer ran in.
- Before you skip: runs record and spend counts, but Steering records and agent definitions stay off until a main repo is linked.
- Once linked: Steering records and agent definitions live in the main repo under `.oxagen/`, published through pull requests.

Steering records and agent definitions are files in the main repo, so without one there is nowhere to publish them. The skipped state keeps its consequence sentence, because it describes this workspace as it now is. The Link button is gold while you wait and plain after the frame, so the screen always has one gold action: Open oxagen takes it once the frame is in.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Detected remote and branch | `ws().main`, `ws().branch`, the literal `~/src/platform` | the installer's report, no store named in the page spec | not backed |
| Repo binding | `S.reg.repo` | `wrk.repositories`, GitHub App installation | live |
| Provisional window | `ws().provisional`, `OB_PROVISIONAL_DAYS` (14) | `wrk.repositories`, GitHub App installation | live |

### Logic
- `obRepoPanel` draws one of three cards from `S.reg.repo`.
- `null`, **Repository detected**: "reported by the installer", the chip `git@github.com:a-intel/platform.git`, the remote and production branch, **Link a-intel/platform as the main repo** with the GitHub glyph, one sentence on what the GitHub App installs, and **Skip for now** with "provisional for 14 days".
- `bound`, **Main repo**: "linked" as a dot and a word, and chips for the repo, "production branch: main", and "GitHub App installed".
- `skipped`, **No main repo linked**: the "provisional" badge, the date the window ends (25 Sep 2026, 14 days from 11 Sep 2026), the consequence sentence, and **Link a-intel/platform now**.
- `obBind` sets `bound`, clears the workspace's provisional flag, and toasts that the GitHub App is installed and the main repo linked. It is `repo.bind`, a governed action.
- `obSkip` sets `skipped` and gives the workspace a provisional window from `obDate(0)` to `obDate(14)`. Inside the W1 scenario it records the flag so leaving the scenario takes it back.
- The build opens GitHub's App installation for the repository. The mockup completes it in place.

### States
- **Loaded** only, in onboard mode. Error, loading and denied do not draw it.
- **Mobile**: the chips wrap and the card fills the width.
