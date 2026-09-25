# Runtime

| | |
|---|---|
| Route | `#/a-intel/core-platform/runtimes/mbell-mbp-16`, the pattern `#/…/runtimes/<runtime>`. Unchanged by the fleet operations wedge. In the app the segment is the enrollment's public id (`tch_…`), because the enrollment is the row the record holds, and an id the list does not hold is a 404 (`apps/app/src/features/runtimes/runtime.tsx:1-6`) |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: Unchanged (Runtimes keeps its design) and D17. `docs/fleet-operations-ia.md`: Runtimes and Repositories. `docs/mission-control-spec.md` §7.1 (the tiers). ADR-095 (the tier ladder) in `macanderson/oxagen`. `runtimes.md` is the list this host belongs to |
| Design | `mockups/src/engine.js` → `pRuntimes(r)`, which renders `rtDetail(rt)` when the route names a runtime, with `rtAgents()`, `rtHealth()`, `rtWs()`, `agentCard()`, `tierBadge()` and `DLG_EXT.unenroll`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, loading, error, access denied (no empty state) |
| Storybook | `Oxagen / Runtimes / Runtime`: Loaded, Loading, Error and Access denied, and the same four as mobile stories. The catalog gives this view no `future` flag, so it has no future-only story |
| Audit | `runtime.audit-prompt.md` |

## Job

One host: what it is, the hooks it runs, the tier those hooks earn, the agents that run through it, and how to take it back out. Every agent on a host runs through the same hooks. An agent's identity, its steering and its toolbelt are its own, and only the hooks and their tier are shared.

The fleet operations wedge left this page's design alone. `runtime` is now a unique view with its own spec, split out of `runtimes.md`.

## What is on the page

**Shell and header.** As in `runtimes.md`, with Runtimes lit in the sidebar. The breadcrumb reads "Anderson Intelligence Corp. / Core platform / Runtimes / mbell-mbp-16", and on a phone the current crumb is the host name in mono. The page header stays the list's: eyebrow "Core platform", h1 "Runtimes", the subtext, and **Enroll a runtime** (gold).

**Back.** **← All runtimes** returns to `#/a-intel/core-platform/runtimes`.

**Host panel.** Title: the host name. Caption: "workstation · macOS 15.6 · arm64 · started by launchd at login" (kind, operating system and what starts the collector). The health badge sits in the panel header: healthy, degraded or not enrolled. Then a key-value list, in order:

| Key | Value on `mbell-mbp-16` |
|---|---|
| Workspace | Core platform |
| Owner | Marcus Bell |
| Harness | Claude Code 2.1.4 |
| Collector | oxagend 1.6.2, over "0 telemetry gaps in the last 24h" (on `mbp-01`, "2 telemetry gaps in the last 24h") |
| Hook binary | "oxagen-hook 1.6.2" |
| Hooks installed | `SessionStart, UserPromptSubmit, PreToolUse, PermissionRequest, Stop`, over "5 of 5". A host with fewer reads "4 of 5. Some calls are recorded without a decision." What each hook can refuse is in the component help (`mockups/help/runtime.md`, Host) |
| Model surface | loopback proxy, with no line beneath. What each surface means for metering is in the component help (`mockups/help/runtime.md`, Host) |
| Settings | user settings (managed settings, locked, on `ci-runner-07`) |
| Tier | the `gateway` badge |
| Last checkpoint | "seq 41,208 · 2026-09-11 09:12:44Z · chain intact" |
| Note | only where the host has one. `ci-runner-07`: "The only runtime here in an OS sandbox whose only network exit is the gateway. That is what makes it contained." |

At `gateway` and above, the Model surface line still joins two facts in one sentence, which the plain-noun rule bars in a caption. A build keeps both facts and gives each its own sentence.

**Agents on this host** panel. Title "Agents on this host", with the agent count as a badge (28). List controls: "Search this list", **Rows** and the pager (the table has too few rows for a filter). Columns in order: Agent · Operator · Tier · Principal · Runs 30d.

- *Agent*: the agent card, with its harness mark, its avatar, its key and its harness ("a-intel.core.release-manager" over "Claude Code").
- *Operator*: the operator accountable for the agent, by name (Marcus Bell).
- *Tier*: the agent's tier badge.
- *Principal*: the principal id in mono (`prn_01JQ8W3F2M6XKD7A9RZT4BVCNE`), or a dash.
- *Runs 30d*: runs in the last 30 days.
- A row opens the agent. The design binds the click to the row alone, with no keyboard access. A build makes each row reachable and operable by keyboard.
- The design named three agents on the demo host: `a-intel.core.release-manager` (Claude Code, `gateway`, 212 runs), `a-intel.core.bug-fixer` (Claude Code, `gateway`, 46) and `a-intel.core.documenter` (Cursor, `harness`, 22). The fixtures now place 28 agents on it, ten to a page, and several run a harness other than Claude Code (Codex CLI, LangGraph, Claude Agent SDK, stella). The documenter row contradicts the panel note and the host's single harness: a Cursor agent at `harness` on a Claude Code host that earns `gateway`. A build shows each harness the host carries and the tier the record holds for each.
- An enrolled host with no agent reads "No agent is assigned to this host. It records nothing until one runs here."
- No note closes the panel. What the agents on one host share, and what each keeps, is in the component help (`mockups/help/runtime.md`, Agents on this host).

**Unenroll this host from the CLI** panel. Title "Unenroll this host from the CLI". The command in a code block: `oxagen agent unenroll --host mbell-mbp-16 \` and `--restore-settings` on the next line. No note: what happens when hooks are removed by hand is in the component help (`mockups/help/runtime.md`, Unenroll this host from the CLI). Actions: **Run a test session** ("Test session queued on mbell-mbp-16.") and **Unenroll** (danger, opens `unenroll`). The design's command does not match the shipped CLI (see Data sources).

**A host that is not enrolled.** On `ci-runner-08` the design reads not enrolled in every line: the Collector is "—" over "Not installed. This host is not enrolled.", no Hook binary row renders, Hooks installed is "None" over "Runs here are recorded only.", the Last checkpoint is "—" over "No run has been recorded here", and the agents panel reads "This host is not enrolled, so no agent runs here yet." In place of the CLI panel, "Enroll this host" reads "Run the installer on the host itself." and offers no Unenroll. Its **Enroll a runtime** is gold beside the header's, two gold actions on one screen. A build keeps one.

**Dialogs this page opens.**

- `unenroll`, "Unenroll mbell-mbp-16?". Note: "Calls routed through oxagen are refused from this host from now on." Warning: "Checkpoints from this host are unsigned after this, and the chain records the gap." Footer: **Keep it enrolled** and **Unenroll it** (danger: "Host revoked."). No gold. When the hooks leave the host is in the component help (`mockups/help/runtime.md`, Host unenrollment).
- Enroll a runtime starts Register agent (`register-name.md`). The error state opens `incident`, and the denied state `request-access`.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Backing checked against `macanderson/oxagen` `main` at `bf14d158a` (2026-09-24). A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| The host | `RUNTIMES` via `rtById()` | a host row per machine | One enrollment per agent key on one machine (`packages/database/src/schema/tacho.ts:172`, `:305-307`), read through `list_tacho_hosts` (`packages/oxagen/src/contracts/tacho.host.list.ts:6-43`). The app's detail shows one enrollment (`apps/app/src/features/runtimes/runtime.tsx:1-6`). Gap #3816 | 🟡 an enrollment, not a host |
| Kind, and what starts the collector | `RUNTIMES[].kind`, `.started` | the host's kind and service | None, #3816 | ❌ |
| Operating system | `RUNTIMES[].os` | the host's facts | `platform`, `osVersion` and `arch` (`packages/oxagen/src/tacho/schemas.ts:55-62`) | ✅ |
| Workspace | `rtWs()` | the enrollment's workspace | The enrollment carries its workspace (`tacho.ts:177`, `orgScopeMixin`, `packages/database/src/schema/_mixins.ts:98-101`) | ✅ |
| Owner | `RUNTIMES[].owner` | the person or OS account behind the host | `osUser`, the OS account the daemon runs as (`schemas.ts:63`) | ✅ as the OS account |
| Harness | `RUNTIMES[].harness`, `.harnessV` | every harness with its version | The harnesses reported (`schemas.ts:66`), with Claude Code's version at enrollment only (`schemas.ts:105`). Gap #3919 | 🟡 |
| Collector and hook binary version | `RUNTIMES[].collector` | the collector's report | `wrapper_version` (`tacho.ts:197`) | ✅ |
| Telemetry gaps in the last 24 hours | `RUNTIMES[].gaps` | the collector's heartbeat | None, #3818 | ❌ |
| Hooks installed | `RUNTIMES[].hooks`, `.hookCount` | the settings file, read back at check-in | `hooks_ok` for Claude Code's settings file (`tacho.ts:244`). The five command hooks Tacho writes are `COMMAND_HOOK_EVENTS` (`packages/tacho/src/host/settings-writer.ts:12-18`). No list is read back per host, #3818 | 🟡 |
| Model surface | `RUNTIMES[].model` | where model traffic goes | `modelBaseUrls` (`schemas.ts:81-104`), read by the app as loopback, mixed or direct (`apps/app/src/data/contracts/runtimes.ts:24-34`) | 🟡 |
| Settings | `RUNTIMES[].settings` | user or managed settings, and whether they are locked | `managed` (`schemas.ts:107`) and the settings digests on the enrollment (`tacho.ts:207-213`) | 🟡 |
| Health | `rtHealth()` | healthy or degraded from the gaps, not enrolled from the enrollment | Not enrolled from `status`, `revokedAt` and `expiresAt` (`apps/app/src/features/runtimes/parts.tsx:188`, `:224`). Healthy or degraded waits on #3818 | 🟡 |
| Tier | `RUNTIMES[].tier` | the tier each run earned, rolled up per host | Per run `enforcement_tier` (`tacho.ts:509`), and per harness on the enrollment, `gateway` or `harness` (`schemas.ts:67-80`). No rollup per host, #3817 | 🟡 |
| Last checkpoint | `RUNTIMES[].checkpoint` | the chain's last checkpoint per host | Checkpoints are per session (`tacho.ts:875-905`), #3817 | ❌ |
| Note | `RUNTIMES[].note` | none | No field holds a note on a host | ❌ |
| Agents on this host | `rtAgents()` over `AGENTS[].host` | the host row joined to its agents | The enrollment's agent key joined to `list_agents`: slug, name, harness, operator, principal and runs in 30 days (`apps/app/src/data/contracts/runtimes.ts:91-101`). One enrollment names one agent | 🟡 |
| An agent's tier | `AGENTS[].tier` | the tier its runs earned | Per run only (`tacho.ts:509`) | 🟡 |
| Unenroll | `DLG_EXT.unenroll` | `runtime.unenroll`, every agent on the host | `revoke_tacho_enrollment` revokes one enrollment: its key is retired and every session on it is denied at its next boundary (`packages/oxagen/src/contracts/tacho.enrollment.revoke.ts:1-46`). The app binds Unenroll to it (`apps/app/src/features/runtimes/actions.ts:1-28`) | 🟡 one enrollment |
| The unenroll command | static | the CLI | `oxagen agent unenroll [agent] [--host <tch_id>] [--reason <text>]`. With no agent it removes this machine's hooks and service, revokes its enrollment and deletes its host key (`apps/cli/src/commands/agent.ts:14`, `apps/cli/src/program.ts:1472-1490`). The CLI has no `--restore-settings` flag, and `--host` takes an enrollment id | 🟡 |
| Run a test session | toast | a test session started from the console | None, #3819 (`apps/app/src/features/runtimes/controls.tsx:1-13`) | ❌ |

## Future-only fields

The renderer puts no `data-future` mark on this page, and the catalog gives it no future-only story. These fields have no contract today all the same. A build renders each as not recorded with its gap as `data-gap` (the pattern of `apps/app/src/features/runtimes/parts.tsx`):

- The kind and what starts the collector (#3816).
- The telemetry gap count, and healthy or degraded (#3818).
- The hooks installed as a list and a count, beyond Claude Code's read-back (#3818).
- Every harness version but Claude Code's at enrollment (#3919).
- The tier earned per host and the last checkpoint per host (#3817).
- The note.
- Run a test session (#3819), which a build offers as a stub that says what it would do.

## Functionality

- Every agent on a host runs through the same hooks. The tier belongs to the host, is computed per run from what was actually routed, and is never upgraded after the fact.
- The hooks line reads from the count: five command hooks, of which the first four can refuse a call, or fewer, so some calls are recorded without a decision.
- The model surface line reads from the tier: at `gateway` and above every model call goes through the loopback proxy and tokens are counted from the traffic. Below it, model calls go from the harness straight to its provider.
- Unenrolling revokes the host. Calls routed through Oxagen are refused from then on, the hooks are removed at the host's next check-in, and checkpoints from the host are unsigned afterwards, a gap the chain records. Hooks stripped by hand instead make the next run record `hooks_removed`, and the tier falls to `observe`.
- An agent row opens the agent. Its identity, steering and toolbelt stay on the agent's own pages.
- A runtime id the list does not hold has no page. The app answers 404.

## States

From `pRuntimes()`. The design gives this page no empty state: the host exists or the route is a 404.

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading**: the shell stays, and the page body, header included, is the skeleton: four tile blocks and a panel of seven rows.
- **error**: "Runtimes could not be loaded", with `503 collector_unreachable`, "Nothing was changed. Runs kept recording while this page was down.", **Try again** (gold), **Open an incident** and "trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z".
- **access denied**: "You cannot see the runtimes of this workspace", naming `runtime.read on core-platform`, with **Request access** (gold) and **Back to Work**, then Signed in as "Marcus Bell · workspace.owner · core-platform", Needed "runtime.read on core-platform" and Decided by "pol_v41".

## Mobile

At 390 × 844 the top bar collapses to the hamburger, the host name in mono as the current crumb, search, notifications, the approvals button and the avatar. The thumb bar holds Work, Agents, Tools, Spend and More, and More is the lit slot, because Runtimes lives in its sheet. The host's key-value list stacks, the agents table becomes a stack of cards led by the agent card, and the unenroll command scrolls inside its block. The unenroll dialog rises from the bottom edge as a sheet with full-width buttons. Touch targets are at least 44 px, inputs are 16 px, and the page never scrolls sideways.

## Permissions

- Read: `runtime.read` (today `list_tacho_hosts`: an org Owner or Admin, or a workspace Owner, Member or Viewer).
- Writes, each a governed action recorded in Audit: `runtime.unenroll` (today `revoke_tacho_enrollment`, org Owner or Admin, `packages/oxagen/src/contracts/tacho.enrollment.revoke.ts:29-32`). Running a test session needs `agent.run`.

## Backend gaps this page depends on

- #3816: a host row per machine, its kind and what starts its collector, so Unenroll can revoke a host and every agent on it.
- #3817: the tier rolled up per host, and the last checkpoint per host.
- #3818: the 24-hour gap count, and the hooks read back at check-in for every harness.
- #3919: a version for every harness on the host.
- #3819: starting a test session on a host from the console.
- An unenroll command that matches the CLI, which takes an enrollment id and has no `--restore-settings`.

## Rules every build of this page must keep

- Every enforcement claim states the tier. "Enforced" appears only for budgets on `gateway` traffic and for `contained`, and a control claim carries its scope: for actions routed through Oxagen.
- A tier shows the recorded value and nothing stronger, and is never upgraded after the fact. Every agent row and the note agree: agents on one host earn one tier.
- The page reads the record and adds no inference. A path, a count or a checkpoint that the record does not hold is marked, never presented as recorded.
- A host that is not enrolled is described as not enrolled everywhere on the page: no "chain intact", no hook binary version and no "enrolled" line.
- Show records by their human label. The Operator cell names the person, and a raw id stays copyable in details.
- No person is scored or ranked.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: Enroll a runtime in the header. Unenroll reads as danger.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- A not-loaded state replaces the page body and keeps the shell. A stub control says what the product would do. Nothing silently does nothing.
