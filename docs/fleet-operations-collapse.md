# Fleet operations deletion list

| | |
|---|---|
| **Status** | Proposed with the mockup change |
| **Date** | 2026-09-24 |
| **Owner** | Mac Anderson |
| **Design authority** | `fleet-operations-wedge.md` |

This list has two halves. The first is what this change deletes or merges in this repository: surfaces in the mockup, page specs, stories, fixtures and scenarios. The second is what the app build deletes or merges in `macanderson/oxagen` when a lane builds the wedge. Check `DEREGISTERED.md` in that repository before deleting a feature's files there.

## Surfaces

| Surface | Action | Into |
|---|---|---|
| Fleet page | Delete | Work (the waiting count, live work), Agents (the population, Steer, Register agent), each work order's runs |
| Tasks page | Rename | Work |
| Tasks tabs Providers, Fields, People | Merge | The Intake dialog on Backlog |
| Spend › Findings | Move | Work › Findings |
| Skills console: Catalog, Search, In the loop, Reflection, Versions | Delete | Skills are Steering Sources. Search is the Compiler. The interjection stays in the Approvals drawer |
| Skill reflection | Delete | Nothing |
| Skill source page | Merge | The skill's Steering source page |
| Mandate page | Delete | Agent › Permissions › Delegation |
| Fork replay, Bisect, the frame player transport, the transcript playback, replay grades | Delete | Nothing. The chain and seal stay under Evidence |
| Run tabs Issues, Governed actions, Policy, Context, Chain and seal | Merge | Decision trace and Evidence |
| Steering Library and its shelves | Merge | Sources, with a kind filter |
| Steering › Memory and Steering › Ontology | Merge | Source kinds `memory` and `glossary` on Sources. Promotion is a proposal |
| Steering › Gates | Move | Tools › Policy, and constraint frames on Sources |
| The record page | Rename | Steering source page, kind `record` |
| Spend tabs Tokens, Coaching, By operator, By agent, By model, By tool, Wasted spend | Merge | Overview (grouping) and Optimization |
| Spend drill pages | Delete | The Overview side panel |
| Operator coaching severity and ranking | Delete | Operator habits as rules to adopt, with no rank |
| Agent › Definition in git | Merge | The agent source page |

## Page specs, stories and scenarios

### Page specs

Each deleted spec's content that still holds moved into the spec that replaces it. The audit prompt
beside each deleted spec is deleted with it.

| Deleted spec | Replaced by |
|---|---|
| `mockups/pages/fleet.md` | `work-backlog.md`, `work-orders.md` (first run) and `agents.md` (tiles, Steer, Register agent) |
| `mockups/pages/tasks.md` | `work-backlog.md`, `work-orders.md`, `work-workflows.md` |
| `mockups/pages/tasks-providers.md` | `work-intake.md` |
| `mockups/pages/task.md` | `work-item.md` |
| `mockups/pages/mandate.md` | `agent-permissions.md` (Delegation) |
| `mockups/pages/skills.md`, `skills-off.md` | `steering.md` (Sources, kind skill), `steering-compiler.md`, `run-interjection.md` |
| `mockups/pages/skill-source.md` | `steering-source-skill.md` |
| `mockups/pages/record.md` | `steering-source.md` |
| `mockups/pages/steering-records.md`, `steering-memory.md`, `steering-ontology.md` | `steering.md` (Sources) and `steering-source.md` |
| `mockups/pages/steering-gates.md` | `tools-policy.md`, and policy sources on `steering.md` |

New specs, one per unique view (`fleet-operations-ia.md`, Unique views): `work-backlog`, `work-intake`,
`work-item`, `work-orders`, `work-workflows`, `work-findings`, `run-transcript`, `run-cost`,
`run-evidence`, `approvals-drawer`, `stella-drawer`, `agent-identity`, `agent-steering`,
`agent-toolbelt`, `agent-runtime`, `agent-permissions`, `agent-activity`, `tools-toolbelts`,
`tools-providers`, `tools-policy`, `tools-switches`, `steering-source`, `steering-source-skill`,
`steering-prs`, `runtime`, `spend-budgets`, `spend-optimization`, `repositories-copies`,
`repositories-changes` and `repositories-config`. Rewritten: `run`, `run-interjection`, `agents`,
`agent`, `agent-source`, `work-order`, `tools`, `steering`, `steering-assignments`,
`steering-compiler`, `steering-proposals`, `runtimes`, `spend` and `repositories`.

### Stories

`node tools/build-stories.mjs` removed the stories of every deleted page (`fleet`, `tasks`,
`tasks-work-orders`, `tasks-workflows`, `tasks-providers`, `tasks-fields`, `tasks-people`, `task`,
`mandate`, `toolbelts`, `providers`, `record`, `skills`, `skills-off`, `skill-source`,
`steering-records`, `steering-memory`, `steering-ontology` and `steering-gates`) and of the two retired
scenarios. It writes one story file per unique view. A redesigned view has a loaded story in each
shell, and a view with future-only fields has a third story that outlines them.
`mockups/stories/_view.js`, which every story imports and which was missing on `main`, is restored with
`future` and `drawer` controls.

### Scenarios

| Scenario | Action |
|---|---|
| W4 The flight recorder | Retired. It walked the frame player, the Context tab, fork replay and bisect, all cut |
| W13 In the loop | Retired. It walked the skills console. The interjection it ended on stays in the Approvals drawer |
| W1 Sixty seconds to governed | Step 6 lands on Work, on the smoke run's direct work order |
| W2 Stop it, steer it | Opens on the work order, reads the steer as an `invocation` frame in the Decision trace, and steers the fleet from Agents |
| W3 Money asked, a human answered | Answers from the Approvals drawer, reads the mandate as Delegation and as a `delegation` frame |
| W6 Learned, approved, changed | Walks Sources, the pull request, the Compiler and the Decision trace |
| W8 Every dollar, every operator | Groups spend by work order, operator and agent, reads operator habits, and picks up a finding in Work |
| W11 Whose account it is | Opens from Work |

### Fixtures and code

- Deleted fixtures: `sk-created.json`, `sk-hist.json`, `sk-queries.json` and `sk-reflect.json`, read only
  by the skills console.
- Added fixtures: `sources.json` (the registration, documents, skill bundles, withheld skills and a run's
  skill resolution). `tasks.json` gained a dispatched work order, its work item and a work item opened
  from a finding. `transcripts.json` gained the live release run's `TodoWrite` plan versions and an
  `oxagen__report_status` call.
- `mockups/src/wedge.js` holds the new views and `mockups/src/boot.js` the first render.
  `tools/build-mockup.mjs` appends both to `engine.js`.
- 119 functions and 17 variables left `mockups/src/engine.js` once nothing reached them: the Fleet
  page, the Tasks list, the mandate page, the skills console and reflection, the Library shelves and
  the Memory, Ontology and Gates tabs, the old Compiler, the spend drill pages and coaching severity,
  the frame player, fork replay, bisect and the transcript playback.

## In the app

What a lane that builds the wedge in `macanderson/oxagen` deletes, merges or adds. Read `DEREGISTERED.md`
first: a feature taken off the surfaces whose code stays is registered there, and its files are not
deleted without an ADR. Every route change keeps the old address working (`fleet-operations-routes.md`).

| Lane or path | Action | Into |
|---|---|---|
| `apps/app/src/app/[org]/[ws]/(fleet)` and `apps/app/src/features/fleet/` | Merge | Work becomes the workspace root. `stat-strip` tiles and `steer-fleet` move to Agents. The runs table becomes each work order's Runs panel. `approval-decision` stays with the Approvals drawer |
| `apps/app/src/features/spend/fleet-tiles.tsx` | Move | The Agents tiles |
| `apps/app/src/app/[org]/[ws]/mandates/[mandate]` and `apps/app/src/features/mandate/` | Merge | Agent › Permissions › Delegation. The route redirects to `agents/{agent}/permissions?delegation={mandate}` |
| `apps/app/src/app/[org]/[ws]/skills` and `apps/app/src/features/skills/` (console, search, versions) | Merge | Sources, kind skill, and the skill's source page. The interjection stays |
| `apps/app/src/features/steering/` (shelves, library, memory shelf, records shelf, deliveries, freshness) | Merge | Sources, Assignments, Compiler and Proposals. Freshness and the gate settings move to Tools › Policy |
| `apps/app/src/features/record/` | Rename | The Steering source page, kind `record` |
| `apps/app/src/features/run/` (`frame-player.tsx`, `player-bar.tsx`, `player-model.ts`, `player-hues.ts`, `replay-actions.tsx`, `timeline.tsx`, `policy-tab.tsx`, `context-tab.tsx`, `issues-tab.tsx`) | Merge or delete | The Decision trace and Evidence. The player, replay and bisect are cut |
| `apps/app/src/features/spend/` (`drill.tsx`, `coaching.tsx`, `findings*.tsx`) | Merge or move | The Overview side panel and Optimization. Findings move to Work |
| `apps/app/src/shared/safe-path.ts` | Change | The route builders in `fleet-operations-routes.md` |
| `apps/app/e2e/routes.ts` | Change | The page-load route table follows the new routes. The suite keeps exactly `login`, `pay` and `page-load` |
| `apps/app/capability-ui-map.json` | Change | Bindings for the moved controls, checked by `pnpm check:ui-parity` |
| `apps/app/messages/` and `src/i18n/messages.d.ts` | Change | The new strings, regenerated with `pnpm --filter @oxagen/app gen:messages` |
| New: work items, work orders, workflows and intake | Add | Contracts, handlers and stores. Every Work view is future-only until they ship |
| New: frame types and per-frame provenance on `steering.manifest`, and a Compiler capability | Add | The Decision trace envelope and the Compiler (#3879) |
| New: `report_status` | Add | Self-reported uncertainty in the Decision trace |
