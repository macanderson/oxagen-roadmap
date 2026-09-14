# Fleet

| | |
|---|---|
| Route | `#/a-intel/core-platform` |
| Scope | workspace |
| Spec | §14 Mission Control; Appendix F page 1 |
| Design | `mockups/src/engine.js` → `pFleet()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Mission Control / … / fleet`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `fleet.audit-prompt.md` |

## Job

Every run in the workspace, live and recent, with its enforcement tier, replay grade, verdict, definition-of-done state, cost so far and frames; the approvals queue as a panel, because an approval is always about a run. Runs are not started here — agents start them; this is where an operator stops, steers, or opens one.

## What is on the page

**Header** — eyebrow “Workspace · <workspace name>”, h1 “Fleet”.
Actions: **Steer** (opens the steer dialog: a message delivered into the loop of one or many runs, with a delivery mode) · **Register Agent** (gold; opens the three-step Register Agent gate at `/register/name`)

**Summary tiles** (one number and one basis line each):
- **Live runs** — count of live runs · “of N agents in this workspace”
- **Waiting on a human** — pending approvals plus outstanding dod signatures · “oldest approval has waited m:ss of 10m · N signatures outstanding” — the clock is live, from the approval’s deadline
- **Spend, runs shown** — sum of cost over the rows listed · basis line `gateway_observed + client_attested · USD`
- **Definition of done held** — held / sealed runs shown · “sealed runs shown whose checks held · cache hit N%”

- **Approvals** panel — badge “N parked”. One card per pending approval: tool version (`github__create_release@2`), agent · task, parked-at time, hazard/side-effect/tier chips, counterparty, timeout (“Times out in 10m, then the call ends”), **Approve** (gold; opens the approve dialog), **Deny** (opens the deny dialog), **Details** (the four-hop chain: who asked, which agent, which action, which rule). Resolution state lives on `S.ap`; the seed `APPROVALS` is never mutated.
- **Runs** table — columns: Run · Agent · Operator · Status · Tier · Replay · Verdict · Done (the dod badge by shape: double held, dashed pending, single broken, dotted locked; under it the certificate id, “signature outstanding”, the reason, or “N checks locked”) · Cost · Frames · Started. Row filter chips: all · live · held · proven. Per-row: **Pause** (live runs; opens the pause dialog), **Export**. Clicking a row opens the Run page. List controls: search, sortable columns, facet filters (Tier, Replay, Status), rows-per-page (5/10/25/50/All), pager.
- First-run banners (onboarding only): *provisional* workspace until a main repo is bound (**Bind <repo>**), *first run* (“one run so far”, **Show the seeded fleet**), and the onboarding offer card (**See plans**, **Not now**).

**Dialogs this page opens:** `steer`, `pause`, `approve`, `deny`, `approval details (four-hop chain)`, `request-access (from denied)`, `incident (from error)`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Runs list | `RUNS` | `:Run` + `cost.run_totals` | `agent.agent_runs` (+attempts, seals) via `@oxagen/run-ledger` `RunStore`; wrapped agents in `tacho.sessions`; cost from ClickHouse `token_usage` | 🟡 status/turns/steps ✅; tier, replay grade, verdict, proven spend ❌ |
| Approvals panel | `APPROVALS` + `S.ap` | `control.approvals` | `agent.approval_requests`; `resolve_approval` | ✅ request/decision · 🟡 four-hop chain (rules, taint, mandate ❌) |
| Tiles (live, waiting, spend, cache) | rollups over `RUNS` / `APPROVALS` | `cost.run_totals` grouped | ClickHouse `readUsageBreakdown` | 🟡 |
| Pause / resume / cancel | toast + `pauseRun` | `control.commands` | `tacho.control_commands` via `dispatch_tacho_command` | 🟡 wrapped (tacho) runs ✅ · ledger runs ❌ |
| Steer | `steerSend` | `control.commands` `steer` with delivery mode | tacho `message` command | 🟡 no delivery mode (G9) |

## Functionality

- Approve mints a single-use token bound to the call digest, the agent, the run and an expiry; the reason typed reaches the model as the permission decision reason. Deny requires a reason. Both are governed actions and land in the audit record.
- An approval that times out is never dispatched; the run ends on the permission decision and the Fleet card shows *expired*.
- Pause holds the run at the model proxy before the next call; resume continues; cancel ends it. Every command is a frame on the run.
- The tile figures are computed from the rows (`liveCount`, `pendingCount`, sum of cost) so a header can never disagree with its table.
- Nav count on Fleet = approvals waiting; it is the only count on the Workspace nav besides Steering proposals.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “No runs yet in <workspace>” — nothing has reached Oxagen; a run appears at the first model call of a registered agent. Actions: **Register Agent**, **Open Agents**.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Fleet could not be loaded” — `503 run_index_unavailable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see this workspace” — the roles the signed-in person holds on the organization do not include `workspace.read on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `workspace.read`
- Writes (each a governed action recorded in Audit): `approval.resolve (Approve/Deny)`, `run.command (pause/resume/cancel/steer)`, `agent.register (Register Agent)`

## Backend gaps this page depends on

- G3 cost rollup with basis
- G6 run recorder (tier, replay grade)
- G7 verdict
- G9 steer with delivery mode on ledger runs
- G1 mandate hop of the approval chain
- G15 the definition of done (`dod-spec.md`): sets and certificates

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
