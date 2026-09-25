# Runtimes

| | |
|---|---|
| Route | `#/a-intel/core-platform/runtimes`. Unchanged by the fleet operations wedge (`fleet-operations-routes.md`, Runtimes and Repositories). One host is `runtime.md` |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: Navigation, Unchanged (Runtimes keeps its design) and D17. `docs/fleet-operations-ia.md`: Workspace navigation (the Runtimes count) and Runtimes and Repositories. `docs/mission-control-spec.md` §7.1 (the tiers). ADR-095 (the tier ladder is four words, computed from what was routed) and ADR-078 (wrapped and connected) in `macanderson/oxagen` |
| Design | `mockups/src/engine.js` → `pRuntimes(r)` (the list, when the route names no runtime), with `rtAgents()`, `rtHealth()`, `tierBadge()`, `tierLadder()`, `TIERS` and `TIER_RANK`. Enroll a runtime calls `openDialog('wrap')`, which starts Register agent (`regStart()`). Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / Runtimes / Runtimes`: Loaded, Empty, Loading, Error and Access denied, and the same five as mobile stories. The catalog gives this view no `future` flag, so it has no future-only story |
| Audit | `runtimes.audit-prompt.md` |

## Job

The hosts agents run on, and the tier each host's hooks earn. A runtime is a workstation, a CI runner or a hosted container. Several agents can run on one host through one set of hooks, so a runtime is an object of its own and not a field on an agent.

What a runtime earns is the tier, and the tier bounds every claim Oxagen makes about a run, so the ladder lives here. Nothing on this page enrolls a host. Enrollment is an installer run on the host itself, and Enroll a runtime starts Register agent, whose Wrap step shows the command.

The fleet operations wedge left this page's design alone. Its strings changed where the rest of the product's did: the phone's thumb bar and the denied state's Back to Work.

## What is on the page

**Shell.** The workspace sidebar lists Work, Agents, Tools, Steering, Runtimes, Spend and Repositories, then Organization, Billing and Audit. Runtimes is lit, and its count, 2, is the runtimes whose health is not ok. The breadcrumb reads "Anderson Intelligence Corp. / Core platform / Runtimes". The top bar carries search with ⌘K, notifications, the approvals button (it opens the drawer in `approvals-drawer.md`) and the account avatar.

**Header.** Eyebrow: the workspace name, "Core platform". H1 "Runtimes", and no subtext. What the page is for is in the component help (`mockups/help/runtimes.md`, Header). One action, **Enroll a runtime** (gold). It opens Register agent at its first step, "Name the agent" (`#/a-intel/core-platform/register`, `register-name.md`).

**Stat strip**, four tiles, each counted over the workspace's runtimes:

| Tile | Value | Line under it |
|---|---|---|
| Runtimes | 5 | "1 not enrolled" |
| Agents hosted | 67 | "On 4 hosts", the hosts that carry at least one agent |
| Highest tier | the `contained` tier badge | "ci-runner-07", the host that holds it |
| Health | "1 degraded" | "mbp-01 has telemetry gaps" while any enrolled host is not ok, else the value "Healthy" over "Every collector is reporting". The design counts only enrolled hosts, so the not-enrolled `ci-runner-08` stays out of this tile |

Each caption states one fact, as the plain-noun rule asks: the Agents hosted and Highest tier lines, the Health line, the Agents cell's "No agent assigned" and the Hooks cell's "Some calls are recorded without a decision".

**Hosts** panel. Title "Hosts", with the runtime count as a badge (5).

- **List controls** (`ltTable()`): "Search this list", the filters "Any kind", "Any model surface" and "Any health", **Rows** (10 by default) and the pager (`1–5 of 5`).
- **Table**, columns in order: Runtime · Kind · Harness · Model surface · Tier · Agents · Collector · Hooks · Health · Last checkpoint.
  - *Runtime*: the host name over its operating system in mono ("mbell-mbp-16" over "macOS 15.6 · arm64").
  - *Kind*: a badge, "workstation" or "CI runner" in the demo (a hosted container reads "hosted").
  - *Harness*: the harness mark and name, with its version in mono ("Claude Code 2.1.4", "Codex CLI 1.4.0", "stella 0.9.2", "Other (SDK-wrapped) 0.4.0").
  - *Model surface*: "loopback proxy", "provider direct" or "not routed".
  - *Tier*: the tier badge.
  - *Agents*: how many agents the host carries over their keys in mono, or "0" over "No agent assigned" on an enrolled host and over "Not enrolled" on one that is not.
  - *Collector*: "oxagend <version>" over "0 gaps in 24h" or "2 telemetry gaps in 24h".
  - *Hooks*: "5 of 5", or fewer over "Some calls are recorded without a decision", and "0 of 5" over "No hooks installed".
  - *Health*: healthy, degraded or not enrolled, each a dot and a word.
  - *Last checkpoint*: the sequence number and time ("seq 41,208 · 2026-09-11 09:12:44Z"), or a dash.
  - A row opens the runtime, `#/a-intel/core-platform/runtimes/<runtime>` (`runtime.md`).
  - The demo holds five hosts: `mbell-mbp-16` (workstation, Claude Code, loopback proxy, `gateway`, 28 agents, healthy), `ci-runner-07` (CI runner, Stella, `contained`, 5 agents, healthy), `mbp-01` (workstation, Codex CLI, `gateway`, 23 agents, 2 telemetry gaps, degraded), `priya-mbp-14` (workstation, Other (SDK-wrapped), provider direct, `harness`, 11 agents, 4 of 5 hooks, healthy) and `ci-runner-08` (CI runner, Stella, not routed, `observe`, no agent, 0 of 5 hooks, not enrolled). The design lists `ci-runner-08` under Hosts with "Not enrolled" in its Agents cell, "Not installed" in its Collector cell, "No hooks installed" in its Hooks cell and "not enrolled" as its health.
- The Agents cell names at most three agent keys, then "and <n> more", so a host with 28 agents keeps a row of normal height.
- No note closes the panel. Why the tier belongs to the host is in the component help (`mockups/help/runtimes.md`, Hosts).

**Tier ladder** panel. `tierLadder(null)`: an ordered list labelled "The tier ladder", with no rung marked current, because this page reads no run. It draws what the app draws (`apps/app/src/features/runtimes/parts.tsx:329-336`): each rung's name and what it needs.

| Rung | What it needs |
|---|---|
| `observe` | "Recorded only. No hook is installed and nothing is delivered." |
| `harness` | "Hooks installed. Steering is delivered and four hook events can refuse a call. The harness reports spend, and a call goes ahead if its hook fails." |
| `gateway` | "Model and MCP traffic goes through the gateway. The gateway meters it and enforces budgets on it." |
| `contained` | "The agent runs in an OS sandbox whose only network exit is the gateway." |

No note sits under the ladder. What each rung may claim, and that only `contained` is fully enforced, are in the component help (`mockups/help/runtimes.md`, Tier ladder).

**Dialogs and flows this page opens.** Enroll a runtime starts Register agent (`register-name.md`, `register-wrap.md`, `register-run.md`). It is a flow, and no dialog opens. The empty state's **Show CLI steps** opens `register`, the Register an agent dialog, which carries no CLI path. A build shows the installers that put the CLI on the host's path and the command to run, as the app does (`apps/app/src/features/runtimes/controls.tsx:97`). The error state opens `incident`, and the denied state `request-access`.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Backing checked against `macanderson/oxagen` `main` at `bf14d158a` (2026-09-24). A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| A row per host | `RUNTIMES` (`FIXTURES.RUNTIMES`) | a host row per enrolled machine, written by the installer | `list_tacho_hosts` (`packages/oxagen/src/contracts/tacho.host.list.ts:6-43`) returns one row per enrollment, one agent key on one machine, from `tacho.hosts`, which keeps one live row per agent key (`packages/database/src/schema/tacho.ts:172`, `:305-307`). Two agents on one workstation are two rows. The app lists the enrollments and does not group them by hostname (`apps/app/src/data/contracts/runtimes.ts:1-14`). Gap #3816 (`apps/app/src/features/runtimes/parts.tsx:27-44`) | 🟡 enrollments, no host |
| Name and operating system | `RUNTIMES[].name`, `.os` | the host's facts | `hostname`, `platform`, `osVersion` and `arch` per enrollment (`packages/oxagen/src/tacho/schemas.ts:50-64`) | ✅ per enrollment |
| Kind | `RUNTIMES[].kind` | the host kind | None, #3816 | ❌ |
| Harness and version | `RUNTIMES[].harness`, `.harnessV` | every harness on the host with its version | The harnesses the daemon reported, per enrollment (`schemas.ts:66`), with a version only for Claude Code, as it was at enrollment (`claudeVersionAtEnroll`, `schemas.ts:105`). Gap #3919 | 🟡 |
| Model surface | `RUNTIMES[].model` | where model traffic goes | Whether each routed harness's config still names the loopback proxy (`modelBaseUrls`, `schemas.ts:81-104`), which the app reads as loopback, mixed or direct (`apps/app/src/data/contracts/runtimes.ts:24-34`) | 🟡 |
| Tier | `RUNTIMES[].tier` | the tier each run earned, rolled up to the host | Each run records `enforcement_tier`, one of `contained`, `gateway`, `harness`, `observe` (`tacho.ts:98-103`, `:509`). An enrollment reports a tier per harness, `gateway` or `harness` (`schemas.ts:67-80`). Nothing rolls a tier up per host. Gap #3817 | 🟡 |
| Agents on a host | `AGENTS[].host` through `rtAgents()` | the host row, joined from the agent | The enrollment's `agent_key`, joined to `list_agents` (`apps/app/src/data/ports.ts:544-547`) | 🟡 one agent per enrollment |
| Collector version | `RUNTIMES[].collector` | the collector's own report | `wrapper_version` on the enrollment (`tacho.ts:197`), read by the app as the collector version | ✅ |
| Telemetry gaps in 24 hours | `RUNTIMES[].gaps` | the collector's heartbeat | None. Gap #3818 | ❌ |
| Hooks written | `RUNTIMES[].hookCount`, `.hooks` | the settings file the installer wrote, read back at check-in | `hooks_ok`, a yes or no for Claude Code's settings file (`tacho.ts:244`, and the app's `hooksReadBack()` at `apps/app/src/features/runtimes/parts.tsx:208`). No count and no list, #3818 | 🟡 |
| Health | `RUNTIMES[].health`, `rtHealth()` | healthy or degraded from the gaps, not enrolled from the enrollment | Not enrolled is judged from `status`, `revokedAt` and `expiresAt` (`parts.tsx:188`, `:224`). Healthy and degraded depend on the gap count, #3818 | 🟡 |
| Last checkpoint | `RUNTIMES[].checkpoint` | the chain's last checkpoint per host | Checkpoints are per session (`tacho.checkpoints`, `tacho.ts:875-905`). Gap #3817 | ❌ |
| Stat tiles | counts over `RUNTIMES` | counts over host rows | Runtimes and Highest tier wait on #3816 and #3817, and Health on #3818. Agents hosted counts the distinct agent keys on live enrollments (`apps/app/src/features/runtimes/runtimes.tsx:75`) | 🟡 Agents hosted only |
| The tier ladder | `TIERS` | the tier vocabulary | ADR-095's four words. The app draws the same four rungs (`parts.tsx:329-336`) | ✅ |
| Enroll a runtime | `regStart()` | the Register agent flow | `create_enrollment_token` and `enroll_host` (`packages/oxagen/src/contracts/tacho.enrollment_token.create.ts:30`, `tacho.host.enroll.ts:27`). The app's Enroll a runtime links Register agent at its first step (`apps/app/src/features/runtimes/controls.tsx:34-52`) | ✅ |

## Future-only fields

The renderer puts no `data-future` mark on this page, and the catalog gives it no future-only story. These fields have no contract today all the same. A build renders each as not recorded with its gap as `data-gap`, as `apps/app/src/features/runtimes/parts.tsx` does, and never as a number the record cannot back:

- A row per host and its Kind (#3816). The build lists enrollments and says so.
- The tier rolled up per host and the Highest tier tile (#3817).
- The telemetry gap count, the Health tile, and healthy or degraded (#3818). A revoked or expired enrollment still reads not enrolled.
- The hooks as a count and a list (#3818).
- Every harness version but Claude Code's at enrollment (#3919).
- The last checkpoint per host (#3817).

## Functionality

- The tier belongs to the host. Two agents on one host earn the same tier through the same hooks, and the same agent on a host with a lower tier gets that lower tier.
- A tier is computed per run from what was actually routed. It is never assigned at enrollment and never upgraded after the fact (ADR-095). For a wrapped harness the ladder is cumulative. A connected app's `gateway` has no `harness` rung under it.
- Highest tier is the highest-ranked tier among the workspace's enrolled runtimes (`TIER_RANK`). No tier is rendered as a score, a percentage or "fully governed".
- Every tile is a count over the rows: Runtimes counts the hosts and those not enrolled (or, with every host enrolled, those with no agent), Agents hosted sums each host's agents, and Health counts the enrolled hosts whose health is not ok.
- A telemetry gap is a hole in the record, not a failed run. Health says degraded and the Collector cell says how many gaps.
- Enrollment happens on the host. Enroll a runtime starts Register agent, whose Wrap step shows the installer command. Nothing on this page installs a hook.
- The sidebar's Runtimes count is the runtimes whose health is not ok, the one thing here that waits on a person.

## States

From `pRuntimes()`:

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the header stays, with its gold Enroll a runtime. The body is "No runtime is enrolled": "Until a host enrolls, an agent has an identity and a toolbelt but no hooks. Its runs are recorded at the observe tier." Actions: **Enroll a runtime** (gold) and **Show CLI steps** (opens `register`). The design draws the panel's Enroll a runtime in gold beside the header's, two gold actions on one screen. A build keeps one. The panel also renders whenever the workspace holds no runtime.
- **loading**: the shell stays, and the page body, header included, is the skeleton: four tile blocks and a panel of seven rows.
- **error**: the body, header included, is "Runtimes could not be loaded": "The control plane answered 503 collector_unreachable. Nothing was changed. Runs kept recording while this page was down." Actions: **Try again** (gold) and **Open an incident**, then "trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z".
- **access denied**: the body, header included, is "You cannot see the runtimes of this workspace": "Your roles on Anderson Intelligence Corp. do not include runtime.read on core-platform. An organization owner can grant it." Actions: **Request access** (gold, opens `request-access`) and **Back to Work** (`#/a-intel/core-platform/work`). Below: Signed in as "Marcus Bell · workspace.owner · core-platform", Needed "runtime.read on core-platform", Decided by "pol_v41".

## Mobile

At 390 × 844 the top bar collapses to the hamburger, the current crumb ("Runtimes"), search, notifications, the approvals button and the avatar. The thumb bar holds Work (8), Agents, Tools, Spend and More (3). Runtimes lives in More, so More is the lit slot on this page. The More sheet lists Steering, Runtimes (2, in the hot colour), Repositories, Organization, Billing, Audit, Ask Stella, Search, Notifications, Account, Switch organization and Switch workspace.

The four tiles sit two to a row. The hosts table becomes a stack of cards, each cell labelled with its column header, and the ladder wraps. Every dialog rises from the bottom edge as a sheet. Touch targets are at least 44 px, inputs are 16 px, and the page never scrolls sideways.

## Permissions

- Read: `runtime.read` (today `list_tacho_hosts`, which admits an org Owner or Admin and a workspace Owner, Member or Viewer: `tacho.host.list.ts:26-29`).
- Writes, each a governed action recorded in Audit: `runtime.enroll`, through Register agent (`create_enrollment_token`, org Owner or Admin, after which `enroll_host` takes the single-use token as its credential).

## Backend gaps this page depends on

- #3816: a host row per machine, and the host kind. Enrollment is recorded per agent, so two agents on one workstation look like two runtimes.
- #3817: a tier rolled up per host from the per-run values, and a checkpoint per host.
- #3818: the collector's 24-hour gap count, and the settings file read back at check-in for every harness.
- #3919: a version for every harness on the host.
- #3820 (request access from a denied page) and #3841 (the trace id of a failed read and the policy that refused one).

## Rules every build of this page must keep

- Every enforcement claim states the tier. "Enforced" appears only for budgets on `gateway` traffic and for `contained`, and a control claim carries its scope: for actions routed through Oxagen. The `harness` tier is delivered, recorded, reported by the harness and fail-open.
- A tier shows the recorded value and nothing stronger. It is never upgraded after the fact, and never rendered as a score, a percentage or a rank.
- Headers are rollups of the rows beneath them: every tile, the panel badge and the sidebar count are counted from the rows. The Health tile counts degraded hosts.
- The trace and every run view read the record. This page adds no inference: a host's health comes from its gaps and its enrollment.
- No person is scored or ranked.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: Enroll a runtime. The empty state keeps that one and draws no second.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- A not-loaded state replaces the page body and keeps the shell. A stub control says what the product would do. Nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
