# Steering · Memory

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/memory` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 1, 4, 5, and 9); §12.6 token classes; `steering.md` is the hub, and Memory is a shelf of its Library tab |
| Design | `mockups/src/engine.js` → `stgMemoryTab()` with `stgMemoryAgg()`, inside `pSteering()` and `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / steering-memory`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering-memory.audit-prompt.md` |

## Job

What an agent's own runs left behind, and how it competes. Memory is aggregated, not collected: every run's notes and every operator steer are folded by lineage into one item per fact, the newest provenance kept, and the recall count is the sum over the runs that pulled it. Memory is recalled, never published, so it enters only the volatile selection and gives way to anything published that says otherwise.

## What is on the page

**Hub header.** Eyebrow: the workspace name, h1 “Steering”, subtext “Everything that can steer an agent in this workspace competes in one assembler.” Actions: the governance chip **Governance: team** and **Write a context record** (gold; opens the record wizard). The chip and its `govmode` dialog are specified in `steering.md`.

**The five tabs, in this order:** Library (75) · Assignments (4) · Gates (6) · Proposals (15) · Compiler. Each tab is a URL segment, `#/:org/:ws/steering/<tab>`. The hash is read on load and on `hashchange`; a tab changed by code writes the hash back with `replaceState`, so every view is a link. Library is selected, and the shelf row beneath it presses Memory (6 of 75): All · Records · Skills · Memory · Ontology, each a chip with a count and `aria-pressed`. `/steering/memory` still resolves and lights this shelf.

- **Aggregation strip**, four stat tiles (`stgMemoryAgg`), one number and one basis line each:
  - **Memories**: the item count (6), “folded from 23 run notes and steers”.
  - **Sources**: the distinct runs in the provenance lines (6 runs), “3 operator steers and 3 agent notes”.
  - **Recalled 30d**: the sum of recalls over the items (301), “8,480 tokens delivered” (each item's token cost times its recalls).
  - **By class**: one count per class in mono (“PREFERENCE 2 · RULE 1 · EPISODE 1 · FACT 2”), “a rule is proposed as a record instead”.
- A lead note, verbatim: “A published must beats recalled memory. Memory is what an agent’s own runs left behind. It is recalled, never published, so it competes only in the volatile selection, as may or info, and it gives way wherever a published record says otherwise. To make a memory binding, promote it: a proposal, a pull request, a merge.”
- **Recalled memory** panel, badge “6 items · recalled per prompt, never in the stable prefix”. Filters: Scope (agent per slug, workspace), Force (info, may), Class (EPISODE, FACT, PREFERENCE, RULE); Rows; pager. Columns: Memory (the body, with its id and provenance: run, frame, and whether an operator steer or a reflection wrote it) · Class (`PREFERENCE`, `RULE`, `EPISODE`, `FACT`, mono) · Force · Scope (workspace, or agent with the agent's slug) · Last recalled (with “N recalls in 30 days”) · Token cost (“27 tok”) · In the assembler.
- **In the assembler** has three values. **competes**: the item is ranked per prompt like any other. **yields**: a published `must` contradicts it, and the cell links the record (“to ctx.release.never-merge, a published must”). **superseded**: a published record replaced it, and the cell links the record (“by ctx.platform.safari-e2e-flake”).
- Footer: **See one yield in the compiler** sets the compiler prompt to “CI is green, merge the release pull request” and opens the Compiler tab, where `mem_01K5QX7C` is cut as lower precedence by `ctx.release.never-merge`. Beside it: “Recall used to reach only the in-app agent, capped at six items. It now goes through the same assembler as every other source.”

**Dialogs this page opens:** `govmode`, `wz (record wizard)`.

**Shell.** As `steering.md`: sidebar with Steering lit and Runtimes between Steering and Repositories, top bar with breadcrumbs, ⌘K search-or-run, notifications, the **Approvals** button (count of everything waiting on you across the organization) that opens the drawer `#apdrawer`, and the account avatar. No assistant button in the top bar. Skills has no nav entry of its own.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Memory items | `MEMORY` (`body`, `cls`, `force`, `scope`, `provenance`, `recalls30`, `lastRecalled`, `token_cost`, `supersededBy`, `yieldsTo`) | `:AgentMemory` in the graph, read by the assembler's memory adapter | `packages/agent/src/runtime/assistant-recall.ts` recalls for the in-app agent only, capped at 6 | 🟡 |
| Aggregation strip | derived at render by `stgMemoryAgg()` | rollups over the same items; tokens delivered from `cost.run_totals` `context_frame_tokens` | 🟡 ClickHouse `token_usage` | 🟡 |

## Functionality

- Nothing on this tab is authored here. A memory is written by a run and leaves by being superseded or promoted.
- The strip is derived from the rows beneath it. Memories is the row count; Recalled 30d is the sum of the recalls column; tokens delivered is the sum of token cost times recalls. A build that types the numbers twice is a FAIL.
- The In the assembler cell is computed by the same precedence code the assembler runs, so the shelf and the Compiler cannot disagree.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header, the chip, and the five tabs stay; the header holds no gold. The body is “Nothing has been recalled yet”: “Memory is what an agent’s own runs leave behind. No run in this workspace has written one, so nothing competes from here.” No action: nothing on this tab is authored here.
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton (four tile blocks and a panel of seven rows).
- **error**: “Steering could not be loaded”. “The control plane answered `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the trace line.
- **access denied**: “You cannot see this workspace’s steering”, naming `steering.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The five tabs are one scrolling strip with scroll snap, and the tab in view is scrolled to on render; the page itself never scrolls sideways. The shelf row wraps under the Library tab, Memory pressed among it. The four tiles wrap to two columns. Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet**, **Agents**, **Tools**, **Spend**, **More**. **More** is a bottom sheet listing Steering (with its shelves inside), Runtimes, Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace, and it is the lit slot on every Steering tab. Every dialog rises from the bottom edge as a sheet; the table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- No writes on this tab.

## Backend gaps this page depends on

- The `:AgentMemory` source adapter for wrapped agents (Phase 1). Today recall reaches only the in-app agent.
- The recall counter per item, and the tokens-delivered rollup from `cost.run_totals`.

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen".
- Every badge that describes trust (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger.
- Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, or a dashed outline, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
