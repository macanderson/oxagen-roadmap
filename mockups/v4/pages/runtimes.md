# Runtimes

| | |
|---|---|
| Route | `#/a-intel/core-platform/runtimes[/<runtime-id>]` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phases 0 and 4 (the hook seam and the tier ladder); §14 Mission Control; `agents.md` for the agent side of the same relation |
| Design | `mockups/src/engine.js` → `pRuntimes()` with `rtDetail()`, `rtById()`, `rtAgents()`, `rtHealth()`, `rtWs()`, `tierBadge()`, and `tierLadder()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied (the detail page has no empty state) |
| Storybook | `Oxagen / … / runtimes` and `Oxagen / … / runtime`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `runtimes.audit-prompt.md` |

## Job

The hosts agents run on, and what each host's seam earns. A runtime is a workstation, a CI runner, or a hosted container. Several agents can run on one host through one set of hooks, so a runtime is an object of its own rather than a field on an agent.

What a runtime earns is the tier, and the tier bounds every claim Oxagen makes about a run, so the ladder lives here. Nothing on this page enrolls a host: enrollment is an installer, run on the host itself.

## What is on the page

**Page header.** Eyebrow: the workspace name (“Core platform”), h1 “Runtimes”, subtext “The hosts agents run on, and what each host’s seam earns.” One action, **Enroll a runtime** (gold), which opens the wrap dialog.

**Stat strip**, four tiles, each a count over the workspace's runtimes:

- **Runtimes**, with “N with no agent assigned”.
- **Agents hosted**, with “a host is shared; its hooks see every one of them”.
- **Highest tier earned**, the tier badge of the highest-ranked runtime, with “computed per run from what was actually routed”.
- **Degraded**, with “a gap is a hole in the record, not a failed run” when any host is degraded, and “every collector is reporting” when none is.

**Enrolled hosts** panel, badged with the runtime count. A row opens the runtime. Columns: **Runtime** (the name, with the operating system in mono underneath) · **Kind** (`workstation`, `ci`, or `hosted`) · **Harness** (with its version in mono) · **Model surface** · **Tier** · **Agents** (the count, with the agent keys underneath, or “enrolled, nothing assigned”) · **Collector** (`oxagend <version>`, with the telemetry gaps in 24 hours underneath) · **Hooks** (“N of 5”, with “some calls are recorded, not decided” below five) · **Health** · **Last checkpoint**.

A panel note, verbatim: “The tier is a property of the seam, not of the agent: two agents on one host earn the same tier, and the same agent moved to a weaker host earns less. It is computed per run from what was actually routed and is never upgraded after the fact.”

**The tier ladder** panel: `tierLadder(null)`, the four rungs `observe`, `harness`, `gateway`, and `contained`, each with what it needs and what it earns. A note: only `contained` earns the word enforced, and on `observe` nothing is delivered and nothing can refuse, which is why an agent with no runtime still has an identity and a toolbelt and receives no steering.

### Runtime detail

Reached at `#/:org/:ws/runtimes/<runtime-id>`. A back button, **← All runtimes**, then three panels.

- **The host**, titled with the runtime name, subtitled “<kind> · <os> · started by <who>”, with the health badge in the header. A key-value list: **Workspace** · **Owner** · **Harness** (with its version) · **Collector** (`oxagend <version>`, with the telemetry gaps in the last 24 hours) · **Hook binary** (“oxagen-hook <version> · fails closed against its cached bundle”) · **Hooks written** (the hook list in mono, with “Fewer than five events are wired, so some calls are recorded rather than decided.” or “Five run as command hooks. The first four can refuse.”) · **Model surface** (with how model traffic is routed at this tier) · **Settings** · **Tier earned** (the badge, with “computed per run from what was actually routed”) · **Last checkpoint** (“<id> · chain intact”) · **Note**, where the host has one.
- **Agents on this host**, badged with the count. Columns: **Agent** · **Operator** · **Tier** · **Principal** · **Runs 30d**. A row opens the agent. Where no agent is assigned: “This host is enrolled and no agent is assigned to it. It records nothing until one runs here.” A panel note: “Every agent here is seen through the same hooks and earns the same tier. An agent’s identity, its steering and its toolbelt are its own; only the seam is shared.”
- **Rollback**: the unenroll command as a pre (`oxagen agent unenroll --host <id> --restore-settings`), a note that hooks stripped by hand make the next run record `hooks_removed` and drop the tier to `observe`, and two actions, **Run a smoke session** and **Unenroll** (danger).

**Dialogs this page opens:** `wrap` (enroll a runtime), `register`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agents · Tools · Steering · Runtimes · Repositories · Spend; Organization nav: Organization · Billing · Audit), top bar (breadcrumbs, ⌘K search-or-run, notifications, the **Approvals** button that opens the drawer `#apdrawer`, the account avatar). Runtimes is lit, and its nav count is the number of degraded hosts. The breadcrumb ends on Runtimes, or on the runtime name at the detail route.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Runtimes | `FIXTURES.RUNTIMES` as `RUNTIMES` | a host row per enrolled runtime, written by the installer | the enrollment record exists per agent, not per host | ❌ |
| Agents on a host | `AGENTS[].host` via `rtAgents()` | the same host row, joined from the agent | `agent.agents` carries the host today | 🟡 |
| Tier earned | `RUNTIMES[].tier` | computed per run from the frames, then rolled up to the host | computed per run; no host rollup | 🟡 |
| Collector version and gaps | `RUNTIMES[].collector`, `.gaps` | the collector's own heartbeat | heartbeats exist; the 24-hour gap count does not | 🟡 |
| Hooks written | `RUNTIMES[].hooks`, `.hookCount` | the settings file the installer wrote, read back at check-in | the installer writes it; nothing reads it back | ❌ |
| Last checkpoint | `RUNTIMES[].checkpoint` | the frame chain's last checkpoint per host | the chain is per run | 🟡 |

## Functionality

- The tier is a property of the seam. Two agents on one host earn the same tier, and the same agent on a weaker host earns less.
- A tier is computed per run from what was actually routed, and it is never upgraded after the fact.
- Enrollment happens on the host. **Enroll a runtime** opens the wrap dialog, which shows the command; nothing on this page installs a hook.
- A telemetry gap is a hole in the record, not a failed run. The Health cell says degraded; the collector cell says how many gaps.
- Unenrolling revokes the host: calls routed through Oxagen are refused from then on, and the hooks are removed at the host's next check-in. Hooks stripped by hand instead make the next run record `hooks_removed`, and the tier falls to `observe`.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: “No runtime is enrolled”: “Until a host enrolls, an agent has an identity and a toolbelt but no hook is installed. Its runs are graded `observe`, and no report can say more.” Actions: **Enroll a runtime** (gold), **Show the CLI path**.
- **loading**: the shell stays; the page body, header included, is replaced by the skeleton.
- **error**: “Runtimes could not be loaded”, `503 collector_unreachable`, with **Try again**, **Open an incident**, and the trace line.
- **access denied**: “You cannot see the runtimes of this workspace”, naming `runtime.read on core-platform`, with **Request access**, **Back to Fleet**, *Signed in as*, *Needed*, and *Decided by*.

## Mobile

Both tables become stacks of cards, each cell labelled with its column header; the page never scrolls sideways; touch targets are ≥ 44 px; inputs are 16 px. Runtimes is inside the **More** bottom sheet, which is the lit thumb-bar slot on this page. Every dialog rises from the bottom edge as a sheet.

## Permissions

- Read: `runtime.read`
- Writes (each a governed action recorded in Audit): `runtime.enroll`, `runtime.unenroll`; running a smoke session needs `agent.run`.

## Backend gaps this page depends on

- A host row: enrollment is recorded per agent today, so two agents on one workstation look like two seams
- A tier rollup per host, computed from the same per-run values
- The collector's 24-hour gap count, and the settings file read back at check-in
- A checkpoint per host, rather than per run

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced", except for `contained`, and a control claim carries its scope: "for actions routed through Oxagen".
- Every badge that describes trust shows the recorded value and nothing stronger. A tier is never upgraded after the fact.
- Every explanation is a chain of links to runs, frames, and commits, not a summary.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast.
- Exactly one gold action per screen.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do.
- A count in navigation appears only where something waits on a person.
