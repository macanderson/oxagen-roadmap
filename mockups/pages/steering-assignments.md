# Steering · Assignments

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/assignments` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 1, 4, 5, and 9); §12.6 token classes; `steering.md` is the hub this tab belongs to |
| Design | `mockups/src/engine.js` → `stgAssignTab()` with `stgAgents()`, `assembleSteering()`, `stgItems()`, and `agentCard()`, inside `pSteering()` and `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / steering-assignments`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering-assignments.audit-prompt.md` |

## Job

Which agent receives what. The Library says what is written down; this tab says where it lands. Every row is one agent, run through the same assembler the Compiler shows, so the two tabs can never disagree.

Nobody assigns a record to an agent by picking it. An item reaches an agent when its scope matches the run, and it is delivered when a hook is installed on the agent's runtime. This tab is where that rule is visible.

## What is on the page

**Hub header and tabs.** As specified in `steering.md`, with Assignments selected. The shelf row does not render here. The gold action stays in the page header.

- A lead note, verbatim: “Nobody assigns a record to an agent. An item reaches an agent when its scope matches the run, and it is delivered when a hook is installed on the runtime. An agent on the `observe` tier is still assembled for, and receives nothing.”
- **What each agent receives** panel, badged with the agent count, with **Open the library** in its header. Columns: **Agent** (the agent chip, its harness underneath, linking to the agent page) · **Repository** · **Delivery** (the tier badge, with “hooks deliver it” or “no hook: assembled, not delivered”) · **Gates** · **Stable prefix** (item count, with its token cost) · **Volatile** (item count, with its token cost) · **Cut** · **Skills** · **Per run** (the total token cost) · a row action, **Open the compiler**, which sets the Compiler to that agent and opens it.
- Each row is one assembly, for the prompt that agent is usually given (`STG_PREVIEW.prompts`). A panel note says so: change the prompt and the volatile selection changes with it; the gates and the stable prefix do not.
- **Scope** panel, badged with the item count. Columns: **Scope** · **Items** · **Reaches**. One row per scope that has items, in order: `org` (“Every workspace in the organization.”), `workspace` (“Every agent in this workspace.”), `repository` (“Only an agent whose run works in that repository.”), `agent` (“Only the agent named on the item.”).
- A closing note, verbatim: “A repository record may narrow what a workspace record allows. It may never widen it, and the checks enforce that before a merge.”

**Dialogs this page opens:** `govmode`, `wz (record wizard)`.

**Shell.** As `steering.md`: sidebar with Steering lit and Runtimes between Steering and Repositories, top bar with breadcrumbs, ⌘K search-or-run, notifications, the **Approvals** button that opens the drawer `#apdrawer`, and the account avatar. The top bar has no assistant button.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| The agents assembled for | `STG_PREVIEW.agents` via `stgAgents()`, joined to `AGENTS` | `agent.agents` joined to the run's repository | `agent.agents`; the repository comes from the run | 🟡 |
| The assembly per agent | `assembleSteering(slug, prompt)` over `stgItems()` | the assembler, called at SessionStart and UserPromptSubmit | the assembler exists behind one port after Phase 1 | 🟡 |
| Delivery | `AGENTS[].tier` and the hook state on its runtime | `frame.steering.manifest` per run | the collector writes the manifest; the tier is computed per run | 🟡 |
| Scope counts | `stgItems(ws)[].scope` | `SteeringItem.scope` in the registry | scope exists on records; the other four sources gain it in Phase 1 | 🟡 |

## Functionality

- A row's numbers come from one call to `assembleSteering`, the same function the Compiler renders in full. A number that differs between the two tabs is a defect.
- **Open the compiler** sets `S.pv.agent` and routes to `#/:org/:ws/steering/compiler/<slug>`, so the row and the compiled view are one link apart.
- **Open the library** routes to the Library's All shelf.
- An agent on the `observe` tier is assembled for and receives nothing. The Delivery cell says which of the two happened; no cell says an agent was steered when no hook is installed.
- The tab count in the strip is the number of agents in this workspace set up for steering.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header, the governance chip, and the five tabs stay. The body is “No agent receives steering here”: “Steering reaches an agent through a hook on its runtime. No agent in this workspace is enrolled, so nothing is delivered.” Action: **Open Agents**.
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton.
- **error**: “Steering could not be loaded”. “The control plane answered `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the trace line.
- **access denied**: “You cannot see this workspace’s steering”, naming `steering.read on core-platform`, with **Request access**, **Back to Fleet**, *Signed in as*, *Needed*, and *Decided by*.

## Mobile

The five tabs are one scrolling strip with the selected tab in view. Both tables become stacks of cards, each cell labelled with its column header; the page never scrolls sideways; touch targets are ≥ 44 px; inputs are 16 px. **More** is the lit thumb-bar slot.

## Permissions

- Read: `steering.read`
- No write on this tab. Opening an agent needs `agent.read`; the compiler needs `steering.read`.

## Backend gaps this page depends on

- `SteeringItem.scope` on all five sources, not records alone (Phase 1)
- The assembler behind one port, so the tab and the run agree item for item (Phase 1)
- Hook state per runtime, read at assembly time rather than inferred from the tier

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced".
- A row says what was assembled and what was delivered, and never conflates the two.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast.
- Exactly one gold action per screen.
- A not-loaded state replaces the page body, never the shell.
- This tab is not an agent registry. It carries no agent metric that does not come from the assembly.
