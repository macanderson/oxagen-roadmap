# Onboarding · First run

| | |
|---|---|
| Route | `#/welcome/run` |
| Scope | onboarding gate |
| Spec | §14 Mission Control; Appendix F onboarding (the gate) |
| Design | `mockups/src/engine.js` → `pWelcome(r) → regRun() in onboard mode`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / … / onboarding-run`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `onboarding-run.audit-prompt.md` |

## Job

Step 3 of 3 of the gate: start a run. The operator console opens the moment the first frame reaches Oxagen and lands the operator on Fleet looking at their own run; the repository the installer saw can be bound now or later.

## What is on the page

**Header** — eyebrow “Step 3 of 3”, h1 “Start a run”.
Actions: **Cancel** · **Back** · **Open the installer**

- **Waiting for the first frame** — the live log and the auto-open countdown (see `register-run.md`).
- **Repository detected** — read from the git remote of the directory the installer ran in: **Bind <repo> as the main repo** (installs the GitHub App: binding, Context PRs, checks, merge handling, code graph) or **Skip for now** (the workspace stays *provisional* for N days: runs record and spend counts; steering, context records and agent definitions stay off until a main repo is bound). Bound / provisional cards afterwards.


**Shell.** No sidebar or top bar: the brandmark, then a centred card; the phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Repo binding | `S.reg.repo`, `ws().provisional` | `wrk.repositories`, GitHub App installation | `ingestion.repository_bindings`, `github_installations` | ✅ |
| First frame | `regSchedule` | `:Frame` seq 1 | `agent_run_events` | 🟡 |

## Functionality

- Binding is one click and installs the GitHub App on the repo.
- Skipping is reversible from Fleet’s provisional banner.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “The collector cannot reach the model proxy” (as `register-run.md`).
- **access denied** — “You cannot see onboarding” — the roles the signed-in person holds on the organization do not include `org.create for <email>`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The card fills the width with 16 px gutters; buttons are full width and at least 44 px tall; inputs are 16 px so iOS does not zoom on focus; code inputs are numeric-keypad (`inputmode="numeric"`).

## Permissions

- Read: `authenticated`
- Writes (each a governed action recorded in Audit): `repo.bind`

## Backend gaps this page depends on

- G16 first-frame unlock

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
