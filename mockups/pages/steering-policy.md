# Steering · Policy

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/policy` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 3, 5, and 9); `steering.md` is the hub this tab belongs to |
| Design | `mockups/src/engine.js` → `stgPolicyTab()` with `stgGateEdit()`, inside `pSteering()` and `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / steering-policy`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering-policy.audit-prompt.md` |

## Job

The gates, shown as the second compilation. A gate is deterministic, never budgeted, and never ranked. This tab lists each gate with the one-line gate notice it puts into steering, and links to where the gate is edited. It edits nothing.

## What is on the page

**Hub header.** Eyebrow: the workspace name, h1 “Steering”, subtext “Everything that can steer an agent in this workspace competes in one assembler.” Actions: the governance chip **Governance: team** and **Write a context record** (gold; opens the record wizard). The chip and its `govmode` dialog are specified in `steering.md`.

**The seven tabs, in this order:** Records (59) · Skills (6) · Memory (6) · Ontology (4) · Policy (6) · Proposals (15) · Preview. Each tab is a URL segment, `#/:org/:ws/steering/<tab>`. The hash is read on load and on `hashchange`; a tab changed by code writes the hash back with `replaceState`, so every view is a link. Policy is selected.

- Two panels side by side. **Text compilation**: “Every item compiles to text the model reads. Text is advisory: it is ranked, budgeted, and may be dropped. The other six tabs are this plane.” **Gate compilation**: “An item with an enforcement grant also compiles to a gate. A gate is deterministic, never budgeted and never ranked, and it answers when the index is down. This tab is that plane.”
- **Gate notices** panel, badge “6”. Filters: Outcome (denied, kill switch, needs approval), Edited on; Rows; pager. Columns: Gate (its kind in bold, `decision rule`, `mandate`, or `kill switch`, with its source under it: a policy rule id `pol_v41 · rg_0093`, a mandate line `no mandate on this agent`, a switch id `ks_srv_slack`, or the record whose grant compiled it, `ctx.release.never-merge · enforcement grant`) · Outcome (the same gate badge Tools renders: needs approval, denied, kill switch) · Applies to (“every agent in core-platform”, “a-intel.core.release-manager”, “agents that hold a slack tool: triage, docs-writer”, or “no agent holds this tool version, so no notice is injected”) · Gate notice (the one line, with the notice's item id under it, `gate.rg_0093`) · Notice cost (“33 tok”) · Edited on (a button).
- **Edited on** links out. A decision rule opens **Open the policy tab**. A kill switch opens **Open the kill switches tab**. A mandate gate opens **Open the mandate**, which is its own Mandate page. A gate whose editor is an agent's own grants opens **Open Agent IAM**. A gate compiled from a record's grant opens **Open the record**. No editor is duplicated here.
- A closing note, verbatim: “A gate notice is one line, so the agent does not spend turns walking into a denial. The assembler puts every notice that applies at the head of the stable prefix and never drops one. Gates are edited where they always were: decision rules and kill switches on Tools, a mandate on its own page. Nothing is edited here.”
- A second note carries the status vocabulary, verbatim: “What a gate can refuse depends on the tier. For actions routed through Oxagen, the call is refused on the server. On the harness tier the four blocking hook events refuse a harness-native call: client-attested and fail-open. No screen says more than that.”

**Dialogs this page opens:** `govmode`, `wz (record wizard)`.

**Shell.** As `steering.md`: sidebar with Steering lit and Repositories between Steering and Spend, top bar with breadcrumbs, ⌘K search-or-run, notifications, the **Approvals** button (count of everything waiting on you across the organization) that opens the drawer `#apdrawer`, and the account avatar. No assistant button in the top bar. Skills has no nav entry of its own.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Gates and notices | `GATES` (`gate`, `source`, `outcome`, `applies`, `body`, `id`, `token_cost`, `edit`, `agents`) | compiled from `workspaces.settings.decisionRules`, `tools.mandates`, kill switches, and records with an enforcement grant | rules and mandates refuse calls at `kernel.invoke()`; none produces prompt text today | 🟡 |
| Notice cost | `GATES[].token_cost` | `SteeringItem.token_cost` on the notice; rolled into `cost.run_totals` `steering_tokens` on a run | 🟡 ClickHouse `token_usage` | 🟡 |

## Functionality

- A gate notice is a `SteeringItem` of kind `policy` and force `must`. It is never budgeted and never ranked.
- A gate whose tool no agent holds emits no notice, and its Applies to cell says so.
- The badge's token total is the sum of the Notice cost column, never typed.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header, the chip, and the seven tabs stay; the header holds no gold. The body is “No gate applies to this workspace yet”: “No decision rule, mandate or kill switch reaches an agent here, so no gate notice enters steering. Gates are written on Tools and on a mandate’s own page.” Action: **Open the policy tab** (not gold; nothing here is authored).
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton (four tile blocks and a panel of seven rows).
- **error**: “Steering could not be loaded”. “The control plane answered `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the trace line.
- **access denied**: “You cannot see this workspace’s steering”, naming `steering.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The seven tabs are one scrolling strip with scroll snap, and the tab in view is scrolled to on render; the page itself never scrolls sideways. The two compilation panels stack. Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet**, **Agents**, **Tools**, **Spend**, **More**. **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace, and it is the lit slot on every Steering tab. Every dialog rises from the bottom edge as a sheet; the table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- No writes on this tab. Gates are edited on Tools and on the Mandate page, under their own permissions.

## Backend gaps this page depends on

- The gate notice source adapter, from rules and mandates (Phase 1)
- Bundle permissions filled from the second compilation (Phase 4)

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen".
- Every badge that describes trust (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger.
- Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, or a dashed outline, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
