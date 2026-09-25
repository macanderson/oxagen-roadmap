# Toolbelts

| | |
|---|---|
| Route | `#/a-intel/core-platform/tools/toolbelts` |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: Steering › Two objects, Frame types (`capability`), Emissions (the Toolbelt row), Steering › Shipped today, D4, D5, D17, and Unchanged. `docs/fleet-operations-ia.md`: Tools. `docs/mission-control-spec.md` §6.4 (harness-native tools) and §6.6 (the toolbelt and how a model sees it). `tools.md` owns the header and tab bar this tab shares |
| Design | `mockups/src/engine.js` → `pTools()`, the `t==="toolbelts"` branch, with `beltCatalogById()`, `beltsOfAgent()`, `agentsOfBelt()`, `beltProviders()`, `beltToolCount()`, `beltGates()`, `beltGateCell()`, `beltAvailability()`, `beltTotal()`, `AGENT_BELTS`, `DLG_EXT.belt` and `DLG_EXT.beltnew`. The frames a toolbelt emits are drawn by `resolveEnvelope()` and the toolbelt's source row by `steeringSources()`, both in `mockups/src/wedge.js`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / Tools / Toolbelts`: Loaded, Empty, Loading, Error and Access denied, and the same five as mobile stories. The catalog gives this view no `future` flag, so it has no future-only story |
| Audit | `tools-toolbelts.audit-prompt.md` |

## Job

The named sets of tool versions that put tools in front of agents, and who carries each set. A toolbelt is the only edge from the registry to an agent. It decides what a model is shown. The agent's roles, the policy on the version, the kill switches and the agent's delegations decide whether a call survives, so assigning a toolbelt grants nothing.

A toolbelt is a Steering Source of kind `toolbelt`, managed here. It emits one `capability` SteeringFrame for each tool the toolbelt shows the model, delivered at the tool list injection point. A harness's own tools, such as Bash in Claude Code, are not frames: the harness shows them to the model, and Oxagen did not put them there. A toolbelt may still carry them, so that grants, risk grades and approval rules reach them at the hook (spec §6.6). The Workstation toolbelt is that case.

This tab is unchanged by the fleet operations wedge except for that rule. The frames themselves appear on Steering › Sources (the toolbelt's source row), the Compiler, the agent's Steering tab and each run's Decision trace, and each links back here.

## What is on the page

**Header and tab bar** as in `tools.md`, with Toolbelts selected. New tool is plain on this tab, because New toolbelt carries the gold.

**Toolbelts panel.** Title "Toolbelts". Caption: "A toolbelt is a named set of tool versions assigned to agents. It decides which tools a model can see. It grants no permission." The panel header carries the badge "9 toolbelts · 22 tool versions" (the toolbelts, and the distinct tool versions across them) and **New toolbelt** (gold, opens `beltnew`).

- **List controls** (`ltTable()`): "Search this list", the filters "Any owner", "Any availability" and "Any agents assigned", **Rows** (10 by default) and the pager.
- **Table**, columns in order: Toolbelt · Owner · Tools · Providers · Agents assigned · Gates on its tools · Availability · Updated.
  - *Toolbelt*: the name in bold over what the toolbelt is for ("Repository reader" over "Read a repository: files at a ref, a commit with its checks, and the pull requests in flight.").
  - *Owner*: the owning team over the person who last changed the toolbelt (`platform` over "Marcus Bell").
  - *Tools*: how many versions the toolbelt carries.
  - *Providers*: one badge per provider behind the toolbelt's versions (`github`, `oxagen`).
  - *Agents assigned*: one badge per agent that carries the toolbelt (`release-manager`, `triage`), or "Unassigned".
  - *Gates on its tools*: one dot badge per gate the versions meet today, with its count: "N allowed", "N need approval", "N needs a mandate", "N stopped". A dash when the toolbelt has no version.
  - *Availability*: "All reachable" (allowed colour) or "Unavailable" (critical colour), over the reason: "Every tool version is in the registry and no kill switch covers it.", "Some calls wait for a mandate or an approval.", "N stopped by a kill switch", "N not in the registry", or the last two joined.
  - *Updated*: when the toolbelt last changed.
  - A row opens `belt`. It is keyboard reachable, with `role="button"` and the label "Open <toolbelt name>".
- **Note**: "Assigning a toolbelt grants no permission. Every call from it is still checked against the agent’s roles, the policy on the tool version, the kill switches, and the agent’s mandates. If Availability shows Unavailable, agents can see a tool they can’t call today."

The demo catalogue holds nine toolbelts: Repository reader, Repository contributor, Release control, Context graph, Workstation, Issue tracker, Messaging, Payments and Cloud cost. Messaging reads "Unavailable" over "1 stopped by a kill switch", because the Slack provider switch is on and blocking `slack__post_message@2`.

**Delivery panel.** Title "Delivery". Caption: "One toolbelt can reach many agents, so review a change to it before you save." List controls with the filters "Any tier", "Any toolbelts" and "Any providers". Columns in order: Agent · Toolbelts · Tool versions · Providers · Tier.

- *Agent*: the agent key in mono (`a-intel.core.release-manager`) over the agent's description.
- *Toolbelts*: one badge per toolbelt the agent carries.
- *Tool versions*: the width of the agent's toolbelt.
- *Providers*: one badge per provider its toolbelts reach.
- *Tier*: the agent's tier badge.
- A row opens that agent's Toolbelt tab, `#/a-intel/core-platform/agents/<agent>/toolbelt`.

**Dialogs this tab opens.**

- `belt` (wide). Title: the toolbelt's name. Subtitle: what it is for.
  - A warning when a version on the toolbelt cannot be called today: "1 of the 2 tool versions on this toolbelt cannot be called today. 1 stopped by a kill switch. Agents with this toolbelt can still see them, and each call is blocked when it is sent."
  - The toolbelt's own note, where it has one. Release control: "Every tool here is irreversible or denied. A grant reaching this toolbelt still meets the policy at the call." Workstation: "Harness-native. Delivered only to an agent on the harness tier or above, because nothing below it installs a hook." Payments: "Assigning this toolbelt authorizes nothing. A financial call is denied before dispatch unless the agent holds a mandate covering it."
  - Owner (the team, with "Last changed <time> by <person>"), Providers (badges), Agents assigned (one button per agent, each opening that agent's Toolbelt tab, or, for a toolbelt nobody carries, "Unassigned. No agent carries it yet."), and Gates on its tools.
  - "Tool versions on this toolbelt": Tool version · Provider · Hazard · Gate · Calls 30d. A row opens `tool` (`tools.md`). A version missing from the registry spans the row and says "Not in the registry. A call by this name fails as an unknown tool."
  - Closing note: "Assigning this toolbelt grants no permission. It adds to what the model can see. Every call from it is still checked against the agent’s roles, the policy on the tool version, the kill switches, and the agent’s mandates."
  - Footer: **Remove** (danger: "A toolbelt cannot be removed while an agent carries it. Unassign it first."), **Assign to an agent** ("Assignment is edited on the agent. Open its Toolbelt tab to add or remove this toolbelt."), **Edit tools** (gold: "A change to this toolbelt reaches 3 agents at their next session.", counting the agents that carry it).
- `beltnew`, "New toolbelt", subtitle "A named set of tool versions that many agents can carry." Fields: Name (placeholder "Release control"), What it is for, Owner (platform, finops, security). Note: "A toolbelt is a job, not a category. Name it after the work an agent does with it, so a reviewer can tell from the name alone whether an agent should carry it." Footer: Cancel, **Create** (gold: "Toolbelt created. It reaches no agent until one is assigned it.").
- `tool`, from a row of the toolbelt dialog (`tools.md`).

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Backing checked against `macanderson/oxagen` `main` at `bf14d158a` (2026-09-24). A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Toolbelts: name, purpose, owner, last change, tools | `TOOLBELTS` (`FIXTURES.TOOLBELTS.belts`) | `tools.toolbelts` | None. A toolbelt exists only as the tool list `get_agent_toolbelt` computes for one agent (`packages/oxagen/src/contracts/agent.toolbelt.get.ts:1-13`, `:94-159`). Gap #3852 (`apps/app/src/features/tools/gaps.ts:8-9`, `apps/app/src/features/tools/toolbelts.tsx:6-12`) | ❌ |
| Who carries which toolbelt: Agents assigned, the Delivery panel | `TOOLBELT_ASSIGN` (`FIXTURES.TOOLBELTS.assign`), `AGENT_BELTS` | `tools.toolbelt_assignments` | None, #3852 | ❌ |
| Providers behind a toolbelt | `beltProviders()` over `TOOLS[].s` | derived from each version's provider | Each version names its server (`packages/oxagen/src/contracts/tool.version.list.ts:27-28`). The toolbelt to derive over does not exist | ❌ |
| Gates on its tools, Availability, the unavailable warning | `beltGates()`, `beltAvailability()` over `toolGateKind()` | the gate each version meets today | The kill switch half is on each version's `gate` (`tool.version.list.ts:9-15`). Approval and mandate outcomes are not, and the toolbelt does not exist | ❌ |
| Tool versions per agent (Delivery) | `beltTotal()`, `AGENTS[].belt` | the agent's computed toolbelt | `get_agent_toolbelt` returns the tool list an agent would be shown, with the decision, the rule and the schema digest per tool (`agent.toolbelt.get.ts:48-83`) | 🟡 computed per agent, never from named toolbelts |
| Tier (Delivery) | `AGENTS[].tier` | the tier each run earned, rolled up per agent | Each run carries `enforcement_tier` (`packages/database/src/schema/tacho.ts:509`, values `:98-103`). Nothing rolls it up per agent | 🟡 |
| The `capability` SteeringFrames a toolbelt emits | `resolveEnvelope()` and `steeringSources()` (`mockups/src/wedge.js`) | one `capability` frame per tool shown, with source, source version and hash | None. Frame types and capability frames are future-only (wedge, Steering › Shipped today). `steering.manifest` items carry the kinds `record`, `steer`, `skill`, `memory`, `ontology`, `policy` and `instruction` (`packages/tacho/src/wire.ts:630-638`) | ❌ |
| New toolbelt, Edit tools, Assign to an agent, Remove | `DLG_EXT.beltnew`, toasts | `toolbelt.create`, `toolbelt.edit`, `toolbelt.assign` | None, #3852. The app's New toolbelt is a stub dialog (`toolbelts.tsx:46-64`) | ❌ |

## Future-only fields

The renderer puts no `data-future` mark on this tab, and the catalog gives it no future-only story. Nothing on the tab has a store today all the same. A build keeps both panels' headings, captions and New toolbelt, and says in place of the rows that no store holds a named toolbelt or its assignments (#3852), as `apps/app/src/features/tools/toolbelts.tsx` does. An empty table would read as "no toolbelt exists", which the record cannot say either way. The Delivery panel links each agent's computed toolbelt on its own Toolbelt tab, so the chain does not end here. The capability frames a toolbelt emits are future-only wherever they are drawn.

## Functionality

- What a model is shown is the union of the toolbelts its agent carries, and nothing else. Assigning a toolbelt is not a permission.
- A toolbelt emits one `capability` SteeringFrame per tool it shows the model, at the tool list injection point, with force `info` and the tool version's digest as its source version. A frame for a tool a gate denies is excluded as `overridden_by_gate`, and the exclusion names the rule.
- A harness's own tools emit no frame. `resolveEnvelope()` skips every tool whose name starts `claude_code__`, `codex__`, `cursor__` or `stella__`. On the Workstation toolbelt that is all three versions.
- Every count is derived: the "9 toolbelts · 22 tool versions" badge by `beltToolCount()`, Agents assigned by `agentsOfBelt()` from the assignment record, Providers by the registry entry behind each version, and the gate counts by `beltGates()`. A figure that survives removing a tool from a toolbelt is a defect.
- Availability reads Unavailable exactly when a version is behind a live kill switch or missing from the registry. Flipping or clearing a switch that covers a toolbelt's version changes the row and the dialog on the next render.
- A toolbelt row opens the toolbelt. The toolbelt opens each agent's Toolbelt tab, and each version opens the tool. A Delivery row opens the agent's Toolbelt tab.
- A change to a toolbelt reaches every agent that carries it at that agent's next session. Edit tools says how many.
- A toolbelt cannot be removed while an agent carries it.

## States

`pTools()` branches on the state before it draws anything, so every state but loaded replaces the whole page body, header and tab bar included. The four panels are the ones `tools.md` quotes, the same on every Tools tab:

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: "No provider is registered", with **Add provider** (gold) and **Add a connection**.
- **loading**: the skeleton, four tile blocks and a panel of seven rows.
- **error**: "Tools could not be loaded", `503 tool_registry_unavailable`, **Try again** (gold), **Open an incident** and the trace line.
- **access denied**: "You cannot see the tool registry", naming `tools.read on core-platform`, with **Request access** (gold) and **Back to Work**, then Signed in as, Needed and Decided by.

## Mobile

The shell is as in `tools.md`: the thumb bar holds Work, Agents, Tools, Spend and More, with Tools lit, and More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Ask Stella, Search, Notifications, the account and both switchers. The tab bar scrolls in its own row. Both tables become stacks of cards, each cell labelled with its column header, and the toolbelt and agent badges wrap inside their cell. The toolbelt dialog rises as a sheet and its table stacks as cards. Touch targets are at least 44 px, inputs are 16 px, and the page never scrolls sideways.

## Permissions

- Read: `tools.read`.
- Writes, each a governed action recorded in Audit: `toolbelt.create`, `toolbelt.edit`, `toolbelt.assign` (assignment is edited on the agent's Toolbelt tab). No capability binds any of them today. The app offers New toolbelt to an org Owner or Admin, who would hold `toolbelt.create` (`toolbelts.tsx:30-33`).

## Backend gaps this page depends on

- #3852: a named toolbelt (`tools.toolbelts`) and who carries it (`tools.toolbelt_assignments`), with create, edit and assign capabilities.
- `capability` SteeringFrames with per-frame provenance, recorded on `steering.manifest` (the wedge's frame types, future-only).
- An address for one toolbelt, so a capability frame's source link opens the toolbelt it came from at the version it names. Today the link lands on this tab, and a toolbelt carries no version beyond its last change.
- Approval and mandate outcomes on each version's gate, so Gates on its tools can be counted from the record.
- A tier rolled up per agent for the Delivery panel.

## Rules every build of this page must keep

- A Steering Source and a SteeringFrame are never shown as each other. A toolbelt is a source. Its row links to the frames it emits, and a `capability` frame links to its toolbelt at the version it names.
- A harness's own tools are never shown as frames, and no count of a toolbelt's frames includes them.
- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- Nothing on this tab calls an assignment a permission or a grant.
- A toolbelt row names the providers behind it and the agents that carry it, and both are derived from the toolbelt's versions and the assignment record. Headers are rollups of the rows beneath them.
- Every badge that describes trust (gate, availability, tier) shows the recorded value and nothing stronger. Every enforcement claim states the tier: a call on a toolbelt is refused at dispatch for calls routed through Oxagen, and on the `harness` tier the hook refuses it, reported by the harness and fail-open.
- No person is scored or ranked.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: New toolbelt.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- A not-loaded state replaces the page body and keeps the shell. A stub control says what the product would do. Nothing silently does nothing.
