# Steering · Preview

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/preview[/<agent>]` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 1, 5, 6, 8, 9, and 11); `steering.md` is the hub this tab belongs to |
| Design | `mockups/src/engine.js` → `stgPreviewTab(), pvResult(), assembleSteering()`, inside `pSteering()` and `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Mission Control / … / steering-preview`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering-preview.audit-prompt.md` |

## Job

The page that makes the competition visible. Pick an agent and a prompt, and see exactly what would be injected, what was cut, and why. It runs the same assembler a run does, so the Preview and the `steering.manifest` frame on a run cannot disagree.

## What is on the page

**Hub header.** Eyebrow “Workspace · <workspace name>”, h1 “Steering”, and one lead paragraph: everything that can steer an agent in this workspace competes in one assembler, each item is a file proposed as a pull request and published by a merge, and Preview shows what an agent would receive, what was cut, and why.

**The seven tabs, in this order:** Records (N published) · Skills (N in scope) · Memory (N) · Ontology (N) · Policy (N gates) · Proposals (N candidates plus open pull requests) · Preview. Each tab is a URL segment, `#/:org/:ws/steering/<tab>`. The hash is read on load and on `hashchange`; a tab changed by code writes the hash back with `replaceState`, so every view is a link. The bare route `#/:org/:ws/steering` is Records.

Header action: **Write a context record** (gold; opens the record wizard: describe, kind, statement, checks, pull request).

- **Controls.** *Agent*: a select of the workspace's agents, each option “name · harness · tier”; under it the tier badge and the repository the agent works in. Changing the agent updates the URL segment. *Prompt*: a textarea the operator types in; the result repaints on every keystroke and the caret stays put. Under the controls, six prompt chips (“Cut the 4.11.0 release notes”, “CI is green, merge the release pull request”, “Label the flaky checkout e2e test on Safari”, “Plan the ledger entries migration for billing”, “Tighten the CLI reference style guide”, “Pay the September AWS invoice”), `aria-pressed` on the one in use.
- An agent on the `observe` tier shows a warning first: **Nothing below reaches this agent today.** Its runs are recorded and no hook is installed, so Oxagen has no injection point. The result is what the assembler would deliver on the `harness` tier.
- **Two meters.** *Stable prefix · SessionStart additional context*: bytes used of 16,384, with the split (compile header, gate notices, must and should) and “Capped at 16 KiB”. *Volatile selection · token budget*: tokens used of the budget, how many ranked items fit, and how many items were cut in all.
- **1 · Stable prefix**, injection point “SessionStart additional context · capped at 16 KiB”. Gate notices first (each with its gate badge), then `must`, then `should`. Cached in the signed bundle, so it still arrives when the machine is offline. Never ranked. A record with a grant carries the “compiles to text and a gate” chip.
- **2 · Volatile selection**, injection point “UserPromptSubmit additional context · N tok budget”. `may` and `info` items, ranked against the prompt's words and packed until the budget is spent. Each row shows its rank and relevance.
- **3 · Skills**, injection point “files in the checkout · <repository>”, with the repository's sync state. Each file row says the harness loads it by its own progressive disclosure, not the assembler, and that only its description line competes above.
- Every row in the three parts shows the item's id (a link to where it is authored), its kind, its force, its token cost, and its body.
- **The manifest: what was cut, and why** table: Item · Kind · Force · Token cost · Cut because · Why. *Cut because* is one of four reasons. **over budget**: ranked below the line, with its rank, relevance, and the room that was left. **lower precedence**: a published must beats it. **superseded**: a published item replaced it. **out of scope**: scoped to another repository or another agent. The panel badge says the manifest is recorded on a run as a `steering.manifest` frame.
- A closing note names the other two injection points: MCP tool results carry their own text, and the model request itself needs the `gateway` tier, which is not available yet.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Repositories · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · connection badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). Skills has no nav entry of its own: it is a tab of Steering.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Items | `RECORDS`, `STEER_BUNDLE`, `SKILLS`, `MEMORY`, `ONTOLOGY`, `GATES`, `STEERING_PREVIEW.instructions` | the assembler's source adapters behind the registry port | `packages/context-provider` (`packWithinBudget`) has no production importer today | ❌ |
| Agents, prompts, and budgets | `STEERING_PREVIEW` (`agents`, `prompts`, `budget`) | the agent registry; the budget in the signed bundle | none | ❌ |
| Sync state | `SKILL_SYNC` | per-repository sync status | none | ❌ |

## Functionality

- Deterministic. Same agent, same repository, same prompt, same answer. There is no clock and no model in the assembler.
- Scope first (repository scope narrows, agent scope narrows), then superseded items, then precedence, then the stable prefix under the byte cap, then the volatile selection ranked and packed under the token budget. A gate notice is never what gives way.
- Ties in relevance break by kind (record, instruction, skill, ontology, memory), then force, then id.
- The run page's **Open in Preview** lands here with that run's agent and prompt.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header and the seven tabs stay, and the tab body is “Nothing to preview yet”. No item is published in this workspace, so the assembler has nothing to select from. Action: **Write a context record**.
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton (four tile blocks and a panel of seven rows).
- **error**: “Steering could not be loaded”, `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied**: “You cannot see this workspace’s steering”. The roles the signed-in person holds on the organization do not include `steering.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The seven tabs are one scrolling strip with scroll snap, and the tab in view is scrolled to on render; the page itself never scrolls sideways. Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet**, **Agents**, **Tools**, **Spend**, **More**. **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace, and it is the lit slot on every Steering tab. Every dialog rises from the bottom edge as a sheet; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px. The agent and prompt controls stack. The cut table becomes cards.

## Permissions

- Read: `steering.read`
- No writes on this tab. Preview reads and computes.

## Backend gaps this page depends on

- `assembleSteering(run, budget)` and its source adapters (Phase 1)
- A preview endpoint that runs the assembler for an agent and a prompt without starting a run

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen". `gateway` and `contained` appear only as tiers not yet available.
- Every badge that describes trust (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, or a dashed outline, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
