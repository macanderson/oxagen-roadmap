# Fleet

| | |
|---|---|
| Route | `#/a-intel/core-platform` |
| Scope | workspace |
| Spec | §14 Mission Control; §12.6 token classes; Appendix F page 1 |
| Design | `mockups/src/engine.js` → `pFleet()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / fleet`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `fleet.audit-prompt.md` |

## Job

Every run in the workspace, live and recent, with its enforcement tier, replay grade, tokens, cost so far, and frames. Runs are not started here. Agents start them; this is where you stop, steer, or open one. Everything waiting on a person (pending approvals and an open interjection) lives in the approvals drawer behind the topbar button; Fleet counts it in one tile and opens the drawer from it. There is no approvals panel and no interjection banner on this page.

## What is on the page

**Header**: eyebrow is the workspace name (“Core platform”), h1 “Fleet”, subtext “Every run in this workspace, live and recent.”
Actions: **Steer** (opens `steerfleet`, “Steer the fleet”: every agent in the workspace pre-selected with All and None, a Steering text field, and a Delivery block whose Interrupt switch is disabled with “not yet available”; footer “N agents · M in flight · at the boundary”, **Cancel**, **Steer**) · **Register Agent** (opens the three-step Register Agent gate at `/register/name`). Neither header action is gold.

**Summary tiles** (one number and one basis line each, four across):
- **Live runs**: count of live runs among the rows listed · “of N agents in this workspace”.
- **Waiting on a human**: a button (aria-label “Open approvals”) that opens the approvals drawer. Number = pending approvals in this workspace plus an open interjection, in the approval colour · “oldest approval has waited m:ss of 10m · 1 interjection · open the drawer”; with no approval, “an interjection has waited 3m 36s of 30m”; with nothing, “nothing is parked”. The clock is live, from the approval’s deadline.
- **Spend shown**: sum of cost over the rows listed · the bases read off those rows, joined with “+” (`gateway_observed + client_attested · USD`), or “no basis recorded”.
- **Tokens shown**: sum of `runMetrics(r).tokTotal` over the rows listed · “N% served from cache” (spend-weighted cache read rate over the same rows) or “no cache figure recorded”.

- **Runs** panel. Filter chips in the panel header: **all** · **live** (live and parked) · **parked** (parked and paused) · **sealed** (sealed and compacted). Columns: Run (id, task title beneath) · Agent (avatar, key, harness label) · Operator (avatar, name) · Status · Tier · Replay · Tokens (total, “N% cached” beneath) · Cost (USD, basis beneath) · Frames · Started · an unlabelled action column: **Pause** on a live run (opens `pause`), **Resolve** on a parked run (opens the Run page), **Export** otherwise (toast “Export bundle queued for <run id>.”). Clicking a row opens the Run page. List controls: search, sortable columns, facet filters (Tier: contained, gateway, harness; Replay: digest only, full replay, ledger only, partial; Status: compacted, halted, live, parked for approval, sealed), Rows 5/10/25/50/All, pager (“1–10 of 279”, ‹ 1 2 … 28 ›).
- First-run banners (onboarding only): *provisional* workspace until a main repo is bound (**Bind <repo>**), *first run* (“One run so far.”, **Show the seeded fleet**), and the **Onboarding offer** card (**See plans**, **Not now**).

**Approvals drawer** (this spec owns the card and its dialogs). Topbar button “Approvals, N waiting” with the count of everything waiting across the organization; it opens `#apdrawer` (role `complementary`, h3 “Approvals”, badge “N waiting”, close button “Close approvals”, Escape closes). The list, eyebrow “N waiting on you”: an interjection row first (“Interjection · <agent> is paused”, the copy from `run-interjection.md`, button **Answer it**), then one `apdRow` per pending approval (amount and tool or tool, agent · task · workspace, risk, `irreversible` and `tainted` badges, live countdown), then “N resolved today”. Empty: “Nothing is waiting on a human.” Selecting a row shows **‹ All approvals** and the full `approvalCard`: eyebrow “Approval required”, the amount or the tool, the agent, counterparty and task, badges (risk, `side_effect`, `tainted`, `egress`, tier), the countdown with “parked <time> · timeout 10m”, the four-hop chain (Operator, Agent, Action, Rule), the mandate bar or Grant block, “The call” (Tool version, Input digest, Idempotency, Requested, Run), Taint, “Rules that fired”, and a footer with **Open run**, **Deny** (opens `deny`), **Approve** (gold; opens `approve`). A note under the list: a resolution mints a single-use token bound to the call digest, the agent, the run, and an expiry. Resolution state lives on `S.ap`; the seed `APPROVALS` is never mutated.

**Dialogs this page opens:** `steerfleet`, `pause`, `approve`, `deny` (from the drawer), `request-access` (from denied), `incident` (from error).

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet (count = approvals waiting plus an interjection) · Agent IAM (agent count) · Tools · Steering (proposals plus a waiting interjection) · Repositories (open Context PRs) · Spend; Organization nav: Organization · Billing · Audit (open critical incidents); foot: the assistant launcher, agent count · data plane, connection badge). Top bar: hamburger, breadcrumbs, ⌘K search-or-run, notifications with unread dot, the approvals button (left of the avatar, count of everything waiting on you across the organization), account avatar → user menu (Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). No assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Runs list | `RUNS` | `:Run` + `cost.run_totals` | `agent.agent_runs` (+attempts, seals) via `@oxagen/run-ledger` `RunStore`; wrapped agents in `tacho.sessions`; cost from ClickHouse `token_usage` | 🟡 status/turns/steps ✅; tier, replay grade ❌ (G6) |
| Tokens column and tile | `runMetrics(r)` over `RUNS` | `cost.run_totals` (`tool_definition_tokens`, `context_frame_tokens`, `steering_tokens`, `cache_hit_rate`, `retries`); `list_runs` with `tokens`, `cacheHitRate` | 🟡 ClickHouse `token_usage` | 🟡 totals ✅ · classes and cache rate ❌ |
| Approvals drawer | `APPROVALS` + `S.ap` | `control.approvals` | `agent.approval_requests`; `resolve_approval` | ✅ request/decision · 🟡 four-hop chain (rules, taint, mandate ❌) |
| Tiles (live, waiting, spend) | rollups over `RUNS` / `APPROVALS` | `cost.run_totals` grouped | ClickHouse `readUsageBreakdown` | 🟡 |
| Pause / resume / cancel | toast + `pauseRun` | `control.commands` | `tacho.control_commands` via `dispatch_tacho_command` | 🟡 wrapped (tacho) runs ✅ · ledger runs ❌ (G17: revocable run token on the ledger ingest contract, built now) |
| Steer | `steerSend` | `control.commands` `steer` with delivery mode | tacho `message` command | 🟡 no delivery mode (G9) |

## Functionality

- Approve mints a single-use token bound to the call digest, the agent, the run, and an expiry; the reason typed reaches the model as the permission decision reason. Deny requires a reason. Both are governed actions and land in the audit record.
- An approval that times out is never dispatched; the run ends on the permission decision and the drawer row shows *expired*.
- Pause holds the run at the next boundary; resume continues; cancel ends it. Every command is a frame on the run.
- Halt and Cancel work on ledger-ingested runs as on wrapped runs: the ledger ingest contract carries a revocable run token, and cancel or halt revokes it (2026-09-15, maintainer decision).
- The drawer lists every pending request across the organization, including one raised outside a run (no `run_id`); the Run page lists only its own run's.
- The tile figures are computed from the rows (`live`, `pend.length`, sum of cost, sum of tokens) so a header can never disagree with its table. The filter chips change the Spend shown and Tokens shown figures, and the labels say “shown” for that reason.
- Nav count on Fleet = approvals waiting plus an open interjection; the topbar approvals button carries the organization-wide count.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: “No runs yet in Core platform”. “Nothing has reached Oxagen from this workspace. A run appears the moment a registered agent makes its first model call — you do not create runs here, agents do.” Actions: **Register Agent**, **Open Agents**.
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: “Fleet could not be loaded”. “The control plane answered `503 run_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the line “trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z”.
- **access denied**: “You cannot see this workspace”. “Your roles on Anderson Intelligence Corp. do not include `workspace.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (opens `request-access`), **Back to Fleet**. Below: *Signed in as* (Marcus Bell · workspace.owner · core-platform), *Needed* (`workspace.read on core-platform`), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting plus an interjection), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. The approvals drawer is full-width on a phone. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `workspace.read`
- Writes (each a governed action recorded in Audit): `approval.resolve (Approve/Deny)`, `run.command (pause/resume/cancel/steer)`, `agent.register (Register Agent)`

## Backend gaps this page depends on

- G3 cost rollup with basis, and the token classes of §12.6 on `cost.run_totals`
- G6 run recorder (tier, replay grade)
- G9 steer with delivery mode on ledger runs
- G17 revocable run token on the ledger ingest contract (Halt and Cancel on ledger-ingested runs)
- G1 mandate hop of the approval chain

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Every token figure is a sum of the rows beneath it. Headers are rollups of the rows, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Never more than one gold action visible at once (on this page it is Approve in the drawer or the primary button of an open dialog). Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- No heading carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence or nothing.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
