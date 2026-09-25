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

The hosts your agents run on, and the enforcement tier each one supports. A runtime is a workstation, a CI runner, or a hosted container. Several agents can run on one host through one set of hooks, so a runtime is an object of its own rather than a field on an agent.

A runtime supports a tier, and the tier bounds every claim oxagen makes about a run, so the ladder lives here. Nothing on this page enrolls a host. Enrollment is an installer, run on the host itself.

## What is on the page

**Page header.** Eyebrow: the workspace name (“Core platform”), h1 “Runtimes”, subtext “The hosts your agents run on, and the enforcement tier each one supports.” One action, **Enroll a runtime** (gold), which opens the wrap dialog.

**Stat strip**, four tiles, each a count over the workspace's runtimes:

- **Runtimes**, with “N not enrolled”, or “N with no agent assigned”, or “All enrolled”.
- **Agents hosted**, with “Several agents can share one host”.
- **Highest tier**, the tier badge of the highest-ranked enrolled runtime, with “Computed per run from routed traffic”. With no enrolled host it reads “—” and “No host is enrolled”.
- **Health**, “Healthy” with “Every collector is reporting”, or “N degraded” with the hosts that have telemetry gaps. The tile's tooltip reads “A telemetry gap is a hole in the record, not a failed run.”

**Hosts** panel, badged with the runtime count. A row opens the runtime. Columns: **Runtime** (the name, with the operating system in mono underneath), **Kind** (`workstation`, `ci`, or `hosted`), **Harness** (with its version in mono), **Model surface**, **Tier**, **Agents** (the count, with the agent keys underneath, or “No agent assigned”, or “Not enrolled”), **Collector** (`oxagend <version>`, with “N telemetry gaps in 24h” underneath, or “—” and “Not installed”), **Hooks** (“N of 5”, with “Some calls are recorded without a decision” below five and “No hooks installed” at zero), **Health**, and **Last checkpoint**.

A panel note, verbatim: “The tier belongs to the host, not the agent. Two agents on one host get the same tier, and an agent moved to a host with a lower tier gets that lower tier. The tier is computed per run from what was actually routed and is never raised afterward.”

**Tier ladder** panel: `tierLadder(null)`, the four rungs `observe`, `harness`, `gateway`, and `contained`, each with what it needs and what it supports. A note, verbatim: “Only `contained` is fully enforced: all traffic must pass through oxagen. On `observe`, nothing is delivered and nothing can be blocked. An agent with no runtime still has an identity and a toolbelt, but it receives no steering.”

### Runtime detail

Reached at `#/:org/:ws/runtimes/<runtime-id>`. A back button, **← All runtimes**, then three panels.

- **The host**, titled with the runtime name, subtitled “<kind> · <os> · started by <who>”, with the health badge in the header. A key-value list: **Workspace**, **Owner** (the person's name), **Harness** (with its version), **Collector** (`oxagend <version>`, with “N telemetry gaps in the last 24h. A gap is a hole in the record, not a failed run.”), **Hook binary** (`oxagen-hook <version>`, with “Refuses a call if it cannot reach oxagen and has no cached policy”), **Hooks installed** (the hook list in mono, with “Fewer than five events are wired, so some calls are recorded without a decision.” or “Five run as command hooks. The first four can refuse a call.”), **Model surface** (with how model traffic is routed at this tier), **Settings**, **Tier** (the badge, with “Computed per run from routed traffic”), **Last checkpoint** (“<id> · chain intact”), and **Note**, where the host has one. A host that is not enrolled shows “—” with “Not installed. This host is not enrolled.” for the collector, “None” and “Runs here are recorded only.” for the hooks, and “No run has been recorded here” for the checkpoint.
- **Agents on this host**, badged with the count. Columns: **Agent**, **Operator**, **Tier**, **Principal**, and **Runs 30d**. A row opens the agent. Where no agent is assigned: “No agent is assigned to this host. It records nothing until one runs here.” Where the host is not enrolled: “This host is not enrolled, so no agent runs here yet.” A panel note: “Every agent here runs through the same hooks and gets the same tier. Each agent keeps its own identity, steering, and toolbelt.”
- **Unenroll this host from the CLI**, on an enrolled host: the unenroll command as a pre (`oxagen agent unenroll --host <id> --restore-settings`), a note that hooks removed by hand make the next run record “Hooks removed” (`hooks_removed` in the tooltip) and drop the tier to `observe`, and two actions, **Run a test session** and **Unenroll** (danger). A host that is not enrolled shows **Enroll this host** instead: “Run the installer on the host itself. Enrolling installs the hooks and the collector.” with **Enroll a runtime**.

**Dialogs this page opens:** `wrap` (enroll a runtime), `register`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agents · Tools · Steering · Runtimes · Repositories · Spend; Organization nav: Organization · Billing · Audit), top bar (breadcrumbs, ⌘K search-or-run, notifications, the **Approvals** button that opens the drawer `#apdrawer`, the account avatar). Runtimes is lit, and its nav count is the number of degraded hosts. The breadcrumb ends on Runtimes, or on the runtime name at the detail route.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Runtimes | `FIXTURES.RUNTIMES` as `RUNTIMES` | a host row per enrolled runtime, written by the installer | the enrollment record exists per agent, not per host | ❌ |
| Agents on a host | `AGENTS[].host` via `rtAgents()` | the same host row, joined from the agent | `agent.agents` carries the host today | 🟡 |
| Tier | `RUNTIMES[].tier` | computed per run from the frames, then rolled up to the host | computed per run; no host rollup | 🟡 |
| Collector version and gaps | `RUNTIMES[].collector`, `.gaps` | the collector's own heartbeat | heartbeats exist; the 24-hour gap count does not | 🟡 |
| Hooks written | `RUNTIMES[].hooks`, `.hookCount` | the settings file the installer wrote, read back at check-in | the installer writes it; nothing reads it back | ❌ |
| Last checkpoint | `RUNTIMES[].checkpoint` | the frame chain's last checkpoint per host | the chain is per run | 🟡 |

## Functionality

- The tier belongs to the host. Two agents on one host get the same tier, and an agent moved to a host with a lower tier gets that lower tier.
- A tier is computed per run from what was actually routed, and it is never upgraded after the fact.
- Enrollment happens on the host. **Enroll a runtime** opens the wrap dialog, which shows the command; nothing on this page installs a hook.
- A telemetry gap is a hole in the record, not a failed run. The Health cell says degraded, and the collector cell says how many gaps.
- Unenrolling revokes the host. Calls routed through oxagen are refused from then on, and the hooks are removed at the host's next check-in. Hooks removed by hand instead make the next run record `hooks_removed`, and the tier falls to `observe`.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: “No runtime is enrolled”: “Until a host enrolls, an agent has an identity and a toolbelt but no hooks. Its runs are recorded at the `observe` tier.” Actions: **Enroll a runtime** (gold), **Show CLI steps**.
- **loading**: the shell stays; the page body, header included, is replaced by the skeleton.
- **error**: “Runtimes could not be loaded”, `503 collector_unreachable`, with **Try again**, **Open an incident**, and the trace line.
- **access denied**: “You cannot see the runtimes of this workspace”, naming `runtime.read on core-platform`, with **Request access**, **Back to Fleet**, *Signed in as*, *Needed*, and *Decided by*.

## Mobile

Both tables become stacks of cards, each cell labeled with its column header; the page never scrolls sideways; touch targets are ≥ 44 px; inputs are 16 px. Runtimes is inside the **More** bottom sheet, which is the lit thumb-bar slot on this page. Every dialog rises from the bottom edge as a sheet.

## Permissions

- Read: `runtime.read`
- Writes (each a governed action recorded in Audit): `runtime.enroll`, `runtime.unenroll`; running a test session needs `agent.run`.

## Backend gaps this page depends on

- A host row: enrollment is recorded per agent today, so two agents on one workstation look like two seams
- A tier rollup per host, computed from the same per-run values
- The collector's 24-hour gap count, and the settings file read back at check-in
- A checkpoint per host, rather than per run

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced", except for `contained`, and a control claim carries its scope: "for actions routed through oxagen".
- Every badge that describes trust shows the recorded value and nothing stronger. A tier is never upgraded after the fact.
- Every explanation is a chain of links to runs, frames, and commits, not a summary.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast.
- Exactly one gold action per screen.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do.
- A count in navigation appears only where something waits on a person.
