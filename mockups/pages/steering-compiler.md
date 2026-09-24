# Steering · Compiler

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/compiler[/<agent>]` (`/steering/preview[/<agent>]` still resolves here) |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 1, 5, 6, 8, 9, and 11); §12.6 token classes (steering, context frames); `steering.md` is the hub this tab belongs to |
| Design | `mockups/src/engine.js` → `stgPreviewTab()`, `pvResult()`, `stgCutTable()`, `assembleSteering()`, inside `pSteering()` and `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / steering-compiler`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering-compiler.audit-prompt.md` |

## Job

The page that makes the competition visible. Pick an agent and a prompt, and see exactly what would be injected, what was cut, and why. It runs the same assembler a run does, so the Compiler and the `steering.manifest` frame on a run cannot disagree.

This tab is called Compiler. It was called Preview. The old route, `#/:org/:ws/steering/preview[/<agent>]`, still resolves here, rewritten to `/steering/compiler/<agent>`.

## What is on the page

**Hub header.** Eyebrow: the workspace name, h1 “Steering”, subtext “Everything that can steer an agent in this workspace competes in one assembler.” Actions: the governance chip **Governance: team** and **Write a context record** (gold; opens the record wizard). The chip and its `govmode` dialog are specified in `steering.md`.

**The five tabs, in this order:** Library (75) · Assignments (4) · Gates (6) · Proposals (15) · Compiler. Each tab is a URL segment; Compiler's segment carries the agent, `/steering/compiler/<agent>`. Compiler is selected.

- **Controls.** *Agent*: a select of the workspace's agents, each option “name · harness · tier” (“Release manager · Claude Code · gateway”, “Stella CI · Stella · contained”, “Triage · Codex CLI · gateway”, “Docs writer · Custom (SDK-wrapped) · harness”); under it the tier badge and “works in <repository>”. Changing the agent updates the URL segment. *Prompt*: a textarea you type in (placeholder “Type what the operator would type”); the result repaints on every keystroke and the caret stays put. Under the controls, six prompt chips (“Cut the 4.11.0 release notes”, “CI is green, merge the release pull request”, “Label the flaky checkout e2e test on Safari”, “Plan the ledger entries migration for billing”, “Tighten the CLI reference style guide”, “Pay the September AWS invoice”), `aria-pressed` on the one in use.
- **The delivery warning.** An agent whose runs carry no hook shows a warning first: “Nothing below reaches this agent today. <Agent> is on the observe tier: its runs are recorded and no hook is installed, so Oxagen has no injection point. This is what the assembler would deliver on the harness tier.” The mockup renders it for every agent not on the `harness` tier, so the demo agent (gateway) shows it.
- **Two meters.** *Stable prefix · SessionStart additional context*: bytes used of 16,384 (“3,652 of 16,384 bytes”), with the split under it: “913 tok: compile header 38, gate notices 92, must and should 783. Capped at 16 KiB.” *Volatile selection · token budget*: tokens used of the budget (“427 of 430 tok”), “2 of 16 ranked items fit. 23 items cut in all.” The bar carries `role=img` with a percent label.
- **1 · Stable prefix**, tally “SessionStart additional context · capped at 16 KiB”, sub “Gate notices first, then must, then should. Cached in the signed bundle, so it still arrives when the machine is offline. Never ranked.” Gate notices first (each with its gate badge: denied, needs approval), then `must`, then `should`. A record with a grant carries the “compiles to text and a gate” chip. Empty text: “Nothing in the stable prefix.”
- **2 · Volatile selection**, tally “UserPromptSubmit additional context · 430 tok budget”, sub “may and info items, ranked against this prompt (<the prompt's words>) and packed until the budget is spent.” Each row shows “rank N · relevance N”. Empty text: “No may or info item fit this prompt.”
- **3 · Skills**, tally “files in the checkout · <repository>”, sub “Sync is in sync for this repository, at <commit>.” Each file row: the path, `@version`, “N tok if loaded”, and “Loaded by the harness’s own progressive disclosure, not by the assembler. Only its description line competes above.” The path opens the `skill` dialog. Empty text: “No skill is synced into this repository.”
- Every row in the three parts shows the item's id (a link to where it is authored), its kind badge (the **Kind** column in `steering.md`: **CONSTRAINT**, **GATE NOTICE**, **MEMORY** with the class beside it), its force, its token cost, and its body.
- **Manifest cuts** panel, badge “23 cut · recorded on a run as a steering.manifest frame”. Filters: Kind (the word on the badge, such as constraint, gate notice, memory, ontology, or procedure; a skill filters as its kind), Force, Cut because; Rows; pager. Columns: Item · Kind (the kind badge) · Force · Token cost · Cut because · Why. *Cut because* is one of four reasons. **over budget** (with a dot): “ranked N of M for this prompt, relevance R; T tok did not fit in the L left”. **lower precedence**: “a published must beats recalled memory: <record>”. **superseded**: “replaced by <record>, published <date>”. **out of scope**: “scoped to <repository>; this agent works in <repository>”, “scoped to the agent <slug>”, or “no agent holds the tool it gates”. Empty text: “Nothing was cut.”
- A closing note, verbatim: “Two injection points are not on this page. MCP tool results carry their own text, call by call. The model request itself is written at the proxy on the gateway and contained tiers, and the Context tab of a run shows what it carried.”

**Dialogs this page opens:** `govmode`, `wz (record wizard)`, `skill`.

**Shell.** As `steering.md`: sidebar with Steering lit and Runtimes and Repositories between Steering and Spend, top bar with breadcrumbs, ⌘K search-or-run, notifications, the **Approvals** button (count of everything waiting on you across the organization) that opens the drawer `#apdrawer`, and the account avatar. No assistant button in the top bar. Skills has no nav entry of its own: it is a shelf of the Library tab.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Items | `RECORDS`, `STEER_BUNDLE`, `SKILLS`, `MEMORY`, `ONTOLOGY`, `GATES`, `STEERING_PREVIEW.instructions`, read into one shape by `stgItems()` | the assembler's source adapters behind the registry port | `packages/context-provider` (`packWithinBudget`) has no production importer today | ❌ |
| Agents, prompts, and budgets | `STEERING_PREVIEW` (`agents`, `prompts`, `budget`) | the agent registry; the budget in the signed bundle | none | ❌ |
| Sync state | `SKILL_SYNC` | per-repository sync status | none | ❌ |
| Token figures | `assembleSteering().tok` (`header`, `gates`, `prefix`, `volatile`, `total`) | `cost.run_totals` `steering_tokens` and `context_frame_tokens` on a run | 🟡 ClickHouse `token_usage` | 🟡 |

## Functionality

- Deterministic. Same agent, same repository, same prompt, same answer. There is no clock and no model in the assembler.
- Scope first (repository scope narrows, agent scope narrows), then superseded items, then precedence, then the stable prefix under the byte cap, then the volatile selection ranked and packed under the token budget. A gate notice is never what gives way.
- Ties in relevance break by kind (gate notice, record, instruction, skill, ontology, memory), then force, then id.
- The meters are sums of the rows beneath them: prefix tokens are the compile header plus the gate notices plus the must and should rows; volatile tokens are the sum of the volatile rows; the cut count is the row count of Manifest cuts.
- The run page's **Open the compiler** lands here with that run's agent and prompt.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header, the chip, and the five tabs stay; the header holds no gold. The body is “Nothing to compile yet”: “No item is published in this workspace, so the assembler has nothing to select from. Publish a record and this tab shows what an agent would receive.” Action: **Write a context record** (gold). A workspace with no preview agent renders “No agent in this workspace is set up for preview.”
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton (four tile blocks and a panel of seven rows).
- **error**: “Steering could not be loaded”. “The control plane answered `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the trace line.
- **access denied**: “You cannot see this workspace’s steering”, naming `steering.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The five tabs are one scrolling strip with scroll snap, and the tab in view is scrolled to on render; the page itself never scrolls sideways. The agent and prompt controls stack; the two meters stack; the cut table becomes cards. Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet**, **Agents**, **Tools**, **Spend**, **More**. **More** is a bottom sheet listing Steering (with its shelves inside), Runtimes, Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace, and it is the lit slot on every Steering tab. Every dialog rises from the bottom edge as a sheet; touch targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- No writes on this tab. Compiler reads and computes.

## Backend gaps this page depends on

- `assembleSteering(run, budget)` and its source adapters (Phase 1)
- A preview endpoint that runs the assembler for an agent and a prompt without starting a run

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen".
- Every badge that describes trust (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger.
- Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, or a dashed outline, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
