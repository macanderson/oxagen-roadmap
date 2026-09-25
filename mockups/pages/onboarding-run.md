# Onboarding · First run

| | |
|---|---|
| Route | `#/welcome/run` |
| Scope | onboarding gate |
| Spec | §14; Appendix F onboarding (the gate); §10.1 Repositories |
| Design | `mockups/src/engine.js` → `pWelcome(r) → regRun()` in onboard mode with `obRepoPanel()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / … / onboarding-run`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `onboarding-run.audit-prompt.md` |

## Job

Step 3 of 3 of the gate: start a run. The operator console opens the moment the first frame reaches Oxagen and lands you on Work looking at your own run. The repository the installer saw can be linked now or later.

## What is on the page

**Header.** Eyebrow “Step 3 of 3”, h1 “Start a run”, lead “The operator console opens the moment the first frame from `a-intel.core.release-manager` reaches oxagen, and lands you on Work looking at your own run.”
Actions (card footer) while waiting: **Cancel** · **Back** · **Open the installer** (ghost, goes to `installer.md`) · caption “This step completes when the first frame arrives.” After the frame: **Cancel** · countdown caption (`#regAuto`) · **Open oxagen** (gold).

- **Waiting for the first frame**: the card in `register-run.md` with this page’s key: spinner, h3, “polling · 1s”, chips `a-intel.core.release-manager` · “Claude Code” · “host mbell-mbp.local”, the log (`regLines`) filling one line at a time, “waiting…”, and “Start Claude Code in any repository on `mbell-mbp.local`. The installer already ran a one-turn smoke session; if it is still in flight this flips on its own.” After the flip: **First frame received**, the two frame rows, the badges `harness` · “replay grade: full” · “chain intact”, and the tier sentence, as in `register-run.md`.
- **Repository detected** (`obRepoPanel`, below the frame card): h3 “Repository detected”, “reported by the installer”. Chip `git@github.com:a-intel/platform.git`. Copy: “Read from the git remote of `~/src/platform`, the directory the installer ran in. Production branch `main`.” Button **Link a-intel/platform as the main repo** with the GitHub glyph: gold while waiting, plain once the frame has arrived. Copy: “One click installs the GitHub App on `a-intel/platform`: repository link, pull requests, checks, merge handling and the code graph.” Divider, then “**Skip for now** — core-platform stays **provisional for 14 days**. Runs record and spend counts, but Steering records and agent definitions stay off until a main repo is linked.” (Skip for now is a link button.)
- After Link, the panel becomes **Main repo**: “linked” (dot and word), chips `a-intel/platform` · “production branch: main” · “GitHub App installed” (green dot), and “Steering records and agent definitions will live in `a-intel/platform` under `.oxagen/`, published through pull requests.”
- After Skip, the panel becomes **No main repo linked** with a badge “provisional”: “**core-platform is provisional until 25 Sep 2026** (14 days). Runs record and spend counts. Steering records and agent definitions stay off until a main repo is linked.” and **Link a-intel/platform now**.

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The gate shell (`regShell` in onboard mode): brandmark, `marcus@a-intel.example`, **Cancel**; the rail (`nav` labelled “Onboarding”) with steps 1 and 2 done (✓, buttons back), step 3 Start a run current; the caption “The operator console opens when an agent first connects to oxagen. That connection also tests the install.” The phone layout is the same cards at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Repo binding, provisional window | `S.reg.repo`, `ws().provisional` (`OB_PROVISIONAL_DAYS`) | `wrk.repositories`, GitHub App installation | `ingestion.repository_bindings`, `github_installations` | ✅ |
| First frame poll and log | `regSchedule`, `regLines`, `S.reg.log` | `:Frame` seq 0 and 1 for the principal | `agent_run_events` | 🟡 |
| Agent and smoke run written on unlock | `obUnlock` (`AGENTS`, `RUNS`), `S.firstRun` | `iam.principals`, `runs` (task `smoke`, tier `harness`, basis `client_attested`) | `agent_runs` | 🟡 unlock (G16) |

## Functionality

- The poll and the countdown are those of `register-run.md`. **Open oxagen** or the countdown runs `regFinish`: it writes the agent and its smoke run, sets Work’s first-run view (`S.firstRun`), goes to Work, and toasts “Welcome to oxagen. First frame received from a-intel.core.release-manager, its run is live under a direct work order, and the organization is out of the gate.” in gold. Work then shows its first-run banner, and its provisional banner if the repo was skipped.
- **Link** (`obBind`) installs the GitHub App on `a-intel/platform`, clears the provisional flag, and toasts “GitHub App installed on a-intel/platform. Main repo linked. Pull requests, checks, and the code graph are on.”
- **Skip for now** (`obSkip`) marks the workspace provisional for 14 days from today. Skipping is reversible from this panel and from the provisional banner on Work.
- **Back** returns to Wrap an agent. **Open the installer** shows the package’s own screens; it renders only outside a scenario walk. Either Cancel (`obExit`) clears the onboarding state and goes to Work.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell). The story captures the waiting card with an empty log and the Repository detected panel; the flip happens in the browser about five seconds later.
- **loading**: the shell and the rail stay. The cards are replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: the header stays. The card reads h2 “The collector cannot reach Oxagen”, the two paragraphs and the request line of `register-run.md` (`https://ingest.oxagen.com/v1`, `ECONNREFUSED`, 6 attempts, 94 seconds, `req_01JQ8F4B1PC7QM · host mbell-mbp.local`), and **Check again**. Footer: **Cancel** · **Back**. No repository panel and no gold action.
- **access denied**: “You cannot see onboarding”, then “Your roles on Anderson Intelligence Corp. do not include `org.create for marcus@a-intel.example`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (gold, opens dialog `request-access`), **Back to Work**. Below: *Signed in as* “Marcus Bell · workspace.owner · core-platform”, *Needed* “org.create for marcus@a-intel.example”, *Decided by* “pol_v41 · deny wins over every allow”.

## Mobile

The cards fill the width with 16 px gutters. Buttons are full width and at least 44 px tall. The log and the frame rows keep their monospace columns and scroll sideways if they must.

## Permissions

- Read: `authenticated`
- Writes (each a governed action recorded in Audit): `repo.bind` (Link); the agent and its smoke run are written by ingest on the first frame

## Backend gaps this page depends on

- G16 first-frame unlock

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger. A window the harness reported is labeled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen. Gold is identity and never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do. Nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
- Headings are plain nouns: no heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence or nothing.
- Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
