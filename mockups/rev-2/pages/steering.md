# Steering

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering[/records]` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 1, 3, 4, 5, 6, 7, 8, 9, and 13 (Phase 2)); §14 Mission Control; Appendix F page 8 (Steering); `steering.md` is the hub every Steering tab belongs to |
| Design | `mockups/src/engine.js` → `pSteering()`, with `stgHub()`, `govChip()`, `DLG_EXT.govmode`, and `recordCard()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / steering`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering.audit-prompt.md` |

## Job

Steering is the hub: the one screen for everything that can steer an agent in a workspace. It has seven tabs, and this page specifies the hub, the governance mode chip and its dialog, and the first tab, Records. The other tabs have their own specs: `skills.md` (with `skills-off.md` and `skill-source.md`), `steering-memory.md`, `steering-ontology.md`, `steering-policy.md`, `steering-proposals.md`, and `steering-preview.md`.

The page depicts every phase of the steering and gateway plan (0 to 5) as shipped. Records, skills, memory, ontology notes, gate notices, and workspace instructions all compete in one assembler, `assembleSteering(run, budget)`, and every run carries a `steering.manifest` frame. The index is the Postgres registry, not the graph. No screen claims an enforced budget or a real interrupt.

## What is on the page

**Hub header.** Eyebrow: the workspace name (“Core platform”), h1 “Steering”, subtext “Everything that can steer an agent in this workspace competes in one assembler.” Actions, left to right: the governance chip **Governance: team** (`govChip`, the mode in mono) and **Write a steering record** (gold; opens the record wizard: describe, kind, statement, checks, pull request). On Records the header holds the gold action. A tab that holds its own primary action takes the gold from the header. The chip stays on every tab and in the empty state.

**Governance mode dialog** (`govmode`, opened by the chip). Title “Governance mode · <workspace name>”, subtitle “.oxagen/rules/governance.toml on <main repo>”. Three cards in one column, `solo` (“The author may merge their own.”), `team` (“A code-owner review is required.”), `regulated` (“A named approver from a role must approve, and the promotion ledger is hash-chained.”), each with its hint line, the current mode marked “· now”, the picked card highlighted. Under the cards, the `governance.toml` the pick would write (`oxGovernanceToml`: `mode = "<mode>"`, `separation_of_duties = true` only for `regulated`). A note: the mode is read off the file when a pull request is opened and again when it is merged, so raising it takes effect on everything already in flight; lowering it is an org-owner action with approval, recorded as a security event. Footer **Cancel** · **Open the Steering PR** (gold). Confirming sets the workspace mode and reports “Steering PR opened on <main repo>: .oxagen/rules/governance.toml sets mode = <mode>. It takes effect on merge for everything already in flight; nothing else in Oxagen writes that file.”; picking the current mode reports that nothing changed. The Edit workspace dialog (`editws`) carries the same value as a select, `wsGov`.

**The seven tabs, in this order:** Records (59) · Skills (6) · Memory (6) · Ontology (4) · Policy (6) · Proposals (15) · Preview. The count is published records, skills in scope while skills are on, memory items, ontology notes, gates, and candidates plus open pull requests; Preview carries none. Each tab is a URL segment, `#/:org/:ws/steering/<tab>`. The hash is read on load and on `hashchange`; a tab changed by code writes the hash back with `replaceState`, so every view is a link. The bare route `#/:org/:ws/steering` is Records.

**Two planes that never merge.** Steering is what the model reads: advisory, ranked, budgeted, and it may be dropped. Gating is what gets refused: deterministic, never budgeted, never ranked. There is one authoring surface and two compilations. Every item compiles to text. An item with an enforcement grant also compiles to a gate, and every gate puts a one-line gate notice back into steering. The first six tabs and Preview are the text plane. Policy is the gate plane.

**One item type.** Every source is read into `SteeringItem`: `id`, `lineage`, `kind`, `force`, `scope`, `body`, `token_cost`, `enforcement_grant?`, `provenance`, `hash`, `valid_from`. `kind` is one of record, skill, memory, ontology, policy (a gate notice), instruction. `force` is one of `must`, `should`, `may`, `info`. Precedence is fixed in one place: a gate beats everything, a published `must` beats recalled memory, and repository scope may narrow workspace scope and never widen it.

### Records tab

- **Published records** panel. Kind chips with counts: All 59 · rule 25 · constraint 12 · procedure 5 · fact 10 · memory 3 · preference 4 (`aria-pressed`, icon and hue per kind). List controls: Sort (Shown order, Statement A–Z, Statement Z–A), Rows (5, 10, 25, 50, All), and a pager (“1–10 of 59”, ‹ 1 2 3 4 5 6 ›). Cards are newest first, and the statement is always the headline.
- Each card (`recordCard` with `item`): the kind badge, its **force**, its **constraint effect** where it has one, its **token cost** (“214 tok”), its **compilation** chip, the state badge **published** (or “new · bundle vN” beside it for a record the last merge published), and **Open**, which routes to `record.md`. The meta line: scope, the effect line (“rendered 212 · cited 188 · violated 3”), the lineage id, the commit, and the publication date.
- The compilation chip has two values. **compiles to text**: no enforcement grant; the model reads it and nothing refuses a call because of it. **compiles to text and a gate**: the record carries an enforcement grant; the chip is a button that opens the Policy tab, where the gate and its notice are listed. State reads by shape: the gate chip carries a dot, the text chip does not.
- A closing note, verbatim: “Every record compiles to text. A record with an enforcement grant also compiles to a gate, which is listed on Policy with the notice it puts back into steering. A record can never grant authority: the checks enforce constraint_effect ∈ {require, forbid}, and a repository record may narrow what a workspace record allows, never widen it.”
- **On disk** panel: the `.oxagen/` tree as a pre: `workspace.toml`, `rules/` with `governance.toml` (“mode = team”), `promotions.jsonl` (“hash-chained ledger (regulated mode)”), three record files, then `skills/<name>/SKILL.md` (“governed files, delivered by sync”), `ontology/*.toml`, `proposals/*.toml` (“candidates; steer nothing”), `agents/<slug>.toml`. A note: Stella symlinks into this directory rather than copying it; Oxagen reads `.oxagen/` and nothing else.
- **Injection points** panel, badge “five points”, lead sentence “The harness owns the context window. Oxagen competes for its own slice of it, at exactly these points, and every delivery is recorded.” Five items: (1) SessionStart additional context, the stable prefix, capped at 16 KiB, cached in the signed bundle, works offline; (2) UserPromptSubmit additional context, the volatile selection under a token budget; (3) MCP tool results; (4) Files in the checkout, skills delivered by sync; (5) the model request itself, written at the proxy on the gateway and contained tiers, counted as `steering_tokens` and `context_frame_tokens`.

**Dialogs this page opens:** `govmode`, `wz (record wizard)`. Every creation wizard is `DLG_EXT.wz`; its spec is `docs/creation-spec.md`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Repositories · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · connection badge; the assistant launcher at its foot), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, the **Approvals** button with the count of everything waiting on you across the organization (pending approvals plus an open interjection), account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). The Approvals button opens the right-hand drawer `#apdrawer` (`apdHtml`, `apdRow`, `apdBody`) listing what waits; one selected shows the full approval card with Approve and Deny; Escape closes it. The top bar has no assistant button. Skills has no nav entry of its own: it is a tab of Steering. The Steering nav count is proposals waiting for a person, plus 1 while a Skills interjection waits on one.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Records | `RECORDS` (with `tok`, `grant`, `about`, `hash`, `repo`) | git `.oxagen/rules/` is the system of record; the Postgres registry is the index | `agent.steering_records`, `steering_record_versions`; `steering.record.*` | ✅ |
| Compiled bundle | `STEER_BUNDLE` in `engine.js` | `context.system` in the signed bundle (Phase 0) | compiled from active `must` and `should` records | 🟡 |
| Token cost and enforcement grant | `RECORDS[].tok`, `RECORDS[].grant` | `SteeringItem.token_cost`, `SteeringItem.enforcement_grant` | every row carries `kind` and `force` after the two publish paths collapse (Phase 1) | 🟡 |
| Governance mode | `WS[].governance` via `wsGov()` | `.oxagen/rules/governance.toml` on the main repo, read on open and on merge | read by `context.steering.policy.ts`; nothing writes it | 🟡 |
| Effect line per record | `RECORDS[].effect` | rollups over `frame.context_rendered` and `context_cited` | frame index | 🟡 |

## Functionality

- A record can never grant authority. An enforcement grant compiles a gate the policy already allows a record to narrow; it never widens one.
- Changing the governance mode is a Steering PR against `governance.toml`, never a settings write. The chip reads the workspace's current value; the dialog's pick is session state until Open the Steering PR.
- The old routes `#/:org/:ws/skills`, `#/:org/:ws/skills/<view>`, and `#/:org/:ws/skills/<id>/source` still resolve. `route()` rewrites them in place to `#/:org/:ws/steering/skills…`, so no link in the mockup, a scenario, or a document breaks.
- `#/:org/:ws/steering/prs` is kept as an alias of `#/:org/:ws/steering/proposals/prs`.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header, the governance chip, and the seven tabs stay; the header holds no gold. The body is “Nothing steers this workspace yet”: “Published records live in `.oxagen/rules/` on a-intel/platform. A record becomes published by being merged, never by being saved here.” Action: **Write a steering record** (gold).
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton (four tile blocks and a panel of seven rows).
- **error**: “Steering could not be loaded”. “The control plane answered `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the line “trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z”.
- **access denied**: “You cannot see this workspace’s steering”. “Your roles on Anderson Intelligence Corp. do not include `steering.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access**, **Back to Fleet**. Below: *Signed in as* (Marcus Bell · workspace.owner · core-platform), *Needed* (`steering.read on core-platform`), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The seven tabs are one scrolling strip with scroll snap, and the tab in view is scrolled to on render; the page itself never scrolls sideways. Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar; the approvals drawer opens full width. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = 1 while something in it waits). **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace, and it is the lit slot on every Steering tab. Every dialog rises from the bottom edge as a sheet; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- Writes (each a governed action recorded in Audit): `context.propose (open a Steering PR)`, `context.review`, `context.retire`; changing the governance mode opens a Steering PR under `context.propose`, and lowering it needs an org-owner approval.

## Backend gaps this page depends on

- Steering PR state from GitHub
- The registry port the assembler reads through (Phase 1), and its move to the graph behind the same port (Phase 3)
- Writing `governance.toml`: it is read on every open and merge and written by nothing today

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen".
- Every badge that describes trust (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, or a dashed outline, so it survives greyscale. The governance chip is never gold.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
