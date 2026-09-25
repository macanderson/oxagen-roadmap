# Runtime

## Page header {#runtime/header}

The header on one host's page: the workspace name, the Runtimes title, and **Enroll a runtime**, the same header the host list carries.

### Purpose
It keeps a person inside Runtimes while they read one host, and it keeps the one way to add a host within reach. The host itself is named by the breadcrumb ("Anderson Intelligence Corp. / Core platform / Runtimes / mbell-mbp-16") and by the Host panel's title, so the header does not repeat it.

### Rationale
A runtime is a record page under the Runtimes list, not a tab of it, so the design gives it no header of its own: `pRuntimes(r)` builds one header and prepends it to the list, to a host, and to the empty state. Keeping the list's title makes the route read as a place in Runtimes, and **← All runtimes**, the row under the header, is the way back.

The header carries no subtext. The list's subtitle, "The hosts your agents run on, and the enforcement tier each one supports.", described the page to a reviewer and moved to the list's own help (`runtimes/header`). Nothing on a host's page enrolls it: enrollment is an installer run on the host itself, so **Enroll a runtime** starts Register agent, whose Wrap step shows the command (mission-control-spec §7.1).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow | `ws().name` | the workspace | shipped |
| Title | the constant "Runtimes" | none | shipped |
| Enroll a runtime | `openDialog('wrap')`, which starts Register agent (`regStart()`) | `create_enrollment_token`, then `enroll_host` | shipped |
| The host in the breadcrumb | the route's runtime id through `rtById()` | the enrollment's public id (`tch_…`) | partial (#3816) |

In the app the route segment is the enrollment's public id, because an enrollment is the row the record holds, and an id the list does not hold answers 404 (`apps/app/src/features/runtimes/runtime.tsx:1-6`).

### Logic
1. `pRuntimes(r)` reads `r.id`. With an id it finds the host through `rtById()` and renders the header, then `rtDetail(rt)`.
2. An id the workspace does not hold renders the header over "No runtime here", which names the id, with **All runtimes**.
3. **Enroll a runtime** is the one gold action on the page. It opens Register agent at "Name the agent" (`#/a-intel/core-platform/register`).
4. On a host that is not enrolled (`ci-runner-08`), the Enroll this host panel draws a second gold **Enroll a runtime**. A build keeps one gold action on the screen.
5. Creating an enrollment token needs `runtime.enroll`, an org Owner or Admin. The token is then the host's single-use credential for `enroll_host`.

### States
- **Loaded**: the header, then **← All runtimes** and the host's panels.
- **Loading, error and denied**: the shell's panels replace the page body, header included. Error names `503 collector_unreachable`, and denied names `runtime.read on core-platform`.
- **No such host**: the header stays over "No runtime here".
- **Mobile**: the action sits under the title, and the current crumb is the host name in mono.

## Host

One host's facts: what it is, who owns it, the harness, the collector, the hooks, the model surface, the tier, and the last checkpoint.

### Purpose
It answers "what runs on this machine, and what can Oxagen see and refuse here". A person checks the hooks and the tier before they trust a run from this host.

### Rationale
Every agent on a host runs through the same hooks, so the host's facts bound every run on it. Several explanations sat under the values and moved here:

- A telemetry gap is a hole in the record, not a failed run.
- The hook binary refuses a call if it cannot reach Oxagen and has no cached policy.
- Five events run as command hooks: `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PermissionRequest` and `Stop`. The first four can refuse a call (mission-control-spec §7.1). Fewer than five events wired means some calls are recorded without a decision.
- At `gateway` and above every model call goes through the loopback proxy, and tokens are counted from the traffic. Below it, model calls go from the harness straight to its provider. Routing them through Oxagen is the `gateway` tier.
- The tier is computed per run from routed traffic, never assigned at enrollment (ADR-095).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, OS | `RUNTIMES` via `rtById()` | `platform`, `osVersion`, `arch` | shipped |
| Kind, started by | `.kind`, `.started` | host kind and service | future-only (#3816) |
| Workspace, owner | `rtWs()`, `.owner` | the enrollment, `osUser` | shipped |
| Harness | `.harness`, `.harnessV` | every harness with its version | partial (#3919) |
| Collector, hook binary | `.collector` | `wrapper_version` | shipped |
| Gaps | `.gaps` | the collector's heartbeat | future-only (#3818) |
| Hooks installed | `.hooks`, `.hookCount` | the settings file read back | partial (#3818) |
| Model surface | `.model` | `modelBaseUrls` | partial |
| Settings | `.settings` | `managed` and the settings digests | partial |
| Tier | `.tier` | per-run `enforcement_tier`, rolled up | partial (#3817) |
| Last checkpoint | `.checkpoint` | a checkpoint per host | future-only (#3817) |
| Note | `.note` | none | future-only |

The paths are in `packages/oxagen/src/tacho/schemas.ts:50-107` and `packages/database/src/schema/tacho.ts`.

### Logic
1. `rtDetail(rt)` titles the panel with the host name and captions it "<kind> · <os> · started by <service>". `rtHealth()` sits at the right.
2. An enrolled host shows Collector with its gap count and Hook binary. A host that is not enrolled (`ci-runner-08`) shows a dash over "Not installed. This host is not enrolled." and no Hook binary row.
3. Hooks installed lists the events. Its line reads "<n> of 5", adds "Some calls are recorded without a decision." below five, and reads "Runs here are recorded only." at zero.
4. Settings reads "Not written until the host enrolls" when absent.
5. Last checkpoint appends "chain intact" on an enrolled host, else "No run has been recorded here".
6. The Note row renders the record's own note where the fixture holds one.

### States
Loaded, loading, error and denied. There is no empty state: the host exists, or the route answers "No runtime here". On a phone the list stacks.

## Agents on this host

The agents that run through this host's hooks, with their operator, tier, principal and runs.

### Purpose
It answers "who runs here". A person opens an agent to change its identity, its steering or its toolbelt, which stay on the agent's own pages.

### Rationale
Every agent here runs through the same hooks and gets the same tier. Each agent keeps its own identity, steering and toolbelt. That note sat under the table. Only the hooks and their tier are shared, which is why a runtime is an object of its own and not a field on an agent.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agents | `rtAgents()` over `AGENTS[].host` | the enrollment's agent key joined to `list_agents` | partial, one agent per enrollment |
| Operator, principal, runs 30d | `AGENTS[]` | `list_agents` | partial |
| Tier | `AGENTS[].tier` | the tier its runs earned | partial, per run only |

The app joins these in `apps/app/src/data/contracts/runtimes.ts:91-101`.

### Logic
1. `rtDetail()` lists `rtAgents(rt.id)`, ten to a page, with the count as a badge.
2. Each row draws `agentCard()`, the operator's name, `tierBadge(a.tier)`, the principal in mono, and runs in 30 days.
3. A row opens the agent. The design binds the click to the row alone. A build makes each row reachable by keyboard.
4. The page spec lists three agents on `mbell-mbp-16`. The fixture now puts 28 there.
5. The spec's documenter row is a Cursor agent at `harness` on a Claude Code host that earns `gateway`, which contradicts the shared tier. A build shows each harness the host carries and the tier the record holds for each.

### States
An enrolled host with no agent reads "No agent is assigned to this host. It records nothing until one runs here." A host that is not enrolled reads "This host is not enrolled, so no agent runs here yet." On a phone each row becomes a card led by the agent card.

## Unenroll this host from the CLI

The command that takes this host out of Oxagen, a test session, and Unenroll.

### Purpose
It shows the person how to remove Oxagen from the host cleanly, and lets them check the host with one recorded turn first.

### Rationale
Unenrolling from the CLI restores the harness settings the installer changed. If someone removes the hooks by hand instead, the next run records Hooks removed (`hooks_removed`) and the tier drops to `observe`. The tier is never raised afterward. That note sat under the command. The test session exists so a person can confirm the hooks answer before trusting a run.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The command | a string in `rtDetail()` | `oxagen agent unenroll` | partial |
| Run a test session | a notice from `act()` | a test session started from the console | future-only (#3819) |
| Unenroll | `openDialog('unenroll', rt.id)` | `revoke_tacho_enrollment` | partial, one enrollment |

The shipped CLI is `oxagen agent unenroll [agent] [--host <tch_id>] [--reason <text>]` (`apps/cli/src/program.ts:1472-1490`). It has no `--restore-settings` flag, and `--host` takes an enrollment id, not a host name.

### Logic
1. The panel renders only on an enrolled host.
2. **Run a test session** shows "Test session queued on <host>." It used to add "One turn, recorded like any other run." A build offers it as a stub that says what it would do until #3819 ships.
3. **Unenroll** opens the `unenroll` dialog with the runtime id.
4. A build prints the command the CLI ships.

### States
Loaded only, on an enrolled host. On a phone the command scrolls inside its block.

## Enroll this host

The panel a host that is not enrolled shows in place of the unenroll command.

### Purpose
It tells the person how this host joins Oxagen: they run the installer on the host.

### Rationale
Nothing in the browser can enroll a machine. Enrolling installs the hooks and the collector on the host itself, which is why the panel says where to run the installer and nothing more. That second sentence sat on the page.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Enrollment state | `rtEnrolled()` over `RUNTIMES[].health` | `status`, `revokedAt`, `expiresAt` on the enrollment | partial |
| Enroll a runtime | `openDialog('wrap')` | `create_enrollment_token`, `enroll_host` | shipped |

### Logic
1. `rtDetail()` renders this panel when `rtEnrolled(rt)` is false.
2. It keeps one line, "Run the installer on the host itself.", and **Enroll a runtime**, which starts Register agent.
3. The rest of the page says not enrolled in every line: no hook binary, no "chain intact", and no Unenroll.

### States
Only on a host that is not enrolled, such as `ci-runner-08`. The design draws its button in gold beside the header's, two gold actions on one screen. A build keeps one.

## Host unenrollment {#dialog/unenroll}
<!-- open: openDialog('unenroll','mbell-mbp-16') -->

The confirmation before Oxagen revokes a host.

### Purpose
It makes the person confirm an action that cuts every agent on the host off from routed calls.

### Rationale
Unenrolling cannot be undone from the browser: the host must enroll again with a new token. The dialog keeps one sentence on what the action does and one warning. The hooks on the host are removed at its next check-in, so a host that is offline keeps them until it returns. That sentence sat in the dialog and moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The host | `rtById(key)`, or `agent(key).host` | the enrollment | partial |
| Unenroll it | a notice from `act()` | `revoke_tacho_enrollment` | partial, one enrollment |

`revoke_tacho_enrollment` retires one enrollment's key, and every session on it is denied at its next boundary (`packages/oxagen/src/contracts/tacho.enrollment.revoke.ts:1-46`). It needs an org Owner or Admin.

### Logic
1. `DLG_EXT.unenroll(key)` accepts an agent key, from the agent's Runtime tab, or a runtime id, from this page. Both revoke the same host.
2. The title names the host: "Unenroll <host>?".
3. The note reads "Calls routed through oxagen are refused from this host from now on."
4. The warning reads "Checkpoints from this host are unsigned after this, and the chain records the gap."
5. **Keep it enrolled** closes. **Unenroll it** is danger, and its notice reads "Host revoked."
6. A build revokes every enrollment on the host once #3816 gives it a host row.

### States
One state. An unknown key shows the shared no-such dialog. On a phone the dialog rises as a sheet with full-width buttons.
