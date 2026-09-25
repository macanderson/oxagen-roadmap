# Runtimes

## Header

The page header for Runtimes: the workspace name, the title, and the one way to add a host.

### Purpose
It names the workspace whose hosts are listed and offers **Enroll a runtime**, the gold action. A person who wants a new host starts here.

### Rationale
The header used to carry the subtitle "The hosts your agents run on, and the enforcement tier each one supports." It described the page to a reviewer, so it moved here. A runtime is the host an agent runs on: a workstation, a CI runner or a hosted container. What a host earns is the tier, and the tier bounds every claim Oxagen makes about a run (mission-control-spec §7.1, ADR-095).

Nothing on this page installs a hook. Enrollment is an installer run on the host itself, so **Enroll a runtime** starts Register agent, whose Wrap step shows the command. The fleet operations wedge left this page's design alone ("Unchanged" in `docs/fleet-operations-wedge.md`).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow | `ws().name` | the workspace | shipped |
| Enroll a runtime | `openDialog('wrap')`, which calls `regStart()` | `create_enrollment_token`, then `enroll_host` | shipped |

The shipped contracts are `packages/oxagen/src/contracts/tacho.enrollment_token.create.ts:30` and `tacho.host.enroll.ts:27`. The app's button links Register agent at its first step (`apps/app/src/features/runtimes/controls.tsx:34-52`).

### Logic
1. `pRuntimes(r)` builds the header once and prepends it to the list, to one host's page and to the empty state.
2. **Enroll a runtime** opens Register agent at "Name the agent" (`register-name.md`). It is a flow, and no dialog stays open.
3. One host's page (`runtime.md`) keeps this header. Its `?` falls back to this section.
4. Creating an enrollment token needs `runtime.enroll`, an org Owner or Admin. The token is then the host's single-use credential for `enroll_host`.

### States
- **Loaded** and **empty**: the header shows. The empty state adds its own **Enroll a runtime** in gold, two gold actions on one screen. A build keeps one.
- **Loading**, **error** and **denied**: the shell's panels replace the body, header included.
- **Mobile**: the action sits under the title.

## Tiles

Four counts over the workspace's runtimes: hosts, agents hosted, the highest tier, and health.

### Purpose
It answers "how many hosts do I have, how many agents run on them, what is the best tier any of them earns, and is anything broken" before the person reads a row.

### Rationale
Every tile is a rollup of the Hosts rows, so a tile cannot disagree with the table. Two captions described the design and moved here. Agents hosted read "Several agents can share one host": several agents can run on one host through one set of hooks, which is why a runtime is an object of its own. Highest tier read "Computed per run from routed traffic": a tier is derived from what the record shows was routed, never assigned at enrollment and never raised afterward (ADR-095). The Health tile keeps its tooltip, "A telemetry gap is a hole in the record, not a failed run."

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Runtimes | `RUNTIMES` in the workspace | a host row per machine | partial, #3816 |
| Agents hosted | `rtAgents()` per host | distinct agent keys on live enrollments | partial |
| Highest tier | `RUNTIMES[].tier`, `TIER_RANK` | the tier rolled up per host | partial, #3817 |
| Health | `RUNTIMES[].health`, `.gaps` | the collector's 24-hour gap count | partial, #3818 |

The app counts Agents hosted from live enrollments (`apps/app/src/features/runtimes/runtimes.tsx:75`).

### Logic
1. **Runtimes** counts the workspace's hosts. Its caption names the hosts not enrolled, else the enrolled hosts with no agent, else "All enrolled".
2. **Agents hosted** sums `rtAgents(id)` over the hosts. Its caption reads "On <N> hosts", the hosts that carry at least one agent.
3. **Highest tier** ranks the enrolled hosts by `TIER_RANK` (`observe` 0 to `contained` 3) and shows the top one's badge. Its caption names that host, or reads "No host is enrolled".
4. **Health** counts the enrolled hosts whose health is not `ok` and names each, else "Healthy" over "Every collector is reporting". A host that is not enrolled stays out of this tile.

### States
The tiles show on the loaded list only. The empty state, one host's page and the not-loaded states have no tiles. On a phone the tiles sit two to a row.

## Hosts

The workspace's hosts, one row each, with the harness, the tier, the agents, the collector, the hooks, the health and the last checkpoint.

### Purpose
It shows where each agent runs and what that host can enforce. A person finds a degraded host or one with missing hooks and opens it.

### Rationale
The tier belongs to the host, not the agent. Two agents on one host get the same tier, and an agent moved to a host with a lower tier gets that lower tier. The tier is computed per run from what was actually routed and is never raised afterward (ADR-095). That note sat under the table.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Row per host, name, OS | `RUNTIMES` | `list_tacho_hosts` | partial: enrollments, no host (#3816) |
| Kind | `RUNTIMES[].kind` | the host kind | future-only (#3816) |
| Harness and version | `.harness`, `.harnessV` | every harness with its version | partial (#3919) |
| Model surface | `.model` | `modelBaseUrls` | partial |
| Tier | `.tier` | tier rolled up per host | partial (#3817) |
| Agents | `rtAgents()` over `AGENTS[].host` | the enrollment's agent key | partial |
| Collector | `.collector` | `wrapper_version` | shipped |
| Gaps in 24h | `.gaps` | the collector's heartbeat | future-only (#3818) |
| Hooks | `.hookCount` | the settings file read back | partial (#3818) |
| Last checkpoint | `.checkpoint` | a checkpoint per host | future-only (#3817) |

`list_tacho_hosts` returns one row per enrollment, one agent key on one machine (`packages/oxagen/src/contracts/tacho.host.list.ts:6-43`). Two agents on one workstation are two rows today.

### Logic
1. `pRuntimes()` lists the workspace's `RUNTIMES`, filtered by `ws`.
2. The Agents cell prints the count, then at most three agent keys and "and N more". The fixture puts 28 agents on `mbell-mbp-16`, and the full list made that row about 800 px tall, so the cell stops at three.
3. `rtEnrolled()` is false when health is `not enrolled`. Such a host reads "Not enrolled" under Agents, a dash over "Not installed" under Collector, and "0 of 5" over "No hooks installed".
4. Hooks prints "<n> of 5". Below five it adds "Some calls are recorded without a decision."
5. `rtHealth()` prints healthy, degraded or not enrolled.
6. A row opens `#/<org>/<ws>/runtimes/<id>`.

### States
Loaded only. The list tools filter by kind, model surface and health. On a phone each row becomes a card.

## Tier ladder

The four tiers a run can earn, from `observe` to `contained`, with what each needs.

### Purpose
It gives a person the vocabulary every tier badge on every page uses. They read which rung a host sits on and what the next rung would take.

### Rationale
Mission-control-spec §7.1 and ADR-095 fix the ladder at four words, computed from what was routed. Only `contained` is fully enforced: all traffic must pass through Oxagen. On `observe`, nothing is delivered and nothing can be blocked. An agent with no runtime still has an identity and a toolbelt, but it receives no steering. That note sat under the ladder.

What each rung may claim, per §7.1:

| Tier | May claim |
|---|---|
| `observe` | recorded |
| `harness` | delivered, recorded, client-attested, fail-open |
| `gateway` | observed metering, enforced budgets on routed traffic |
| `contained` | enforced, against the machine's operator |

A control claim always carries its scope: for actions routed through Oxagen.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The four rungs and their text | `TIERS` through `tierLadder(null)` | ADR-095's vocabulary | shipped |

The app draws the same four rungs (`apps/app/src/features/runtimes/parts.tsx:329-336`).

### Logic
1. `tierLadder(null)` renders an ordered list labelled "The tier ladder".
2. It marks no rung as current, because this page reads no run. The agent's Runtime tab calls the same helper with the agent's tier and marks that rung.
3. A rung in `TIER_NA` would show "not yet available". None does in the design.
4. Each `tierBadge()` elsewhere carries the rung's text as its tooltip.

### States
Loaded only. On a phone the rungs wrap.
