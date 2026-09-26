# Steering

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering[/records]` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 1, 3, 4, 5, 6, 7, 8, 9, and 13 (Phase 2)); `steering.md` is the hub this tab belongs to |
| Design | `mockups/src/engine.js` → `pSteering()`, inside `pSteering()` and `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / steering`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering.audit-prompt.md` |

## Job

Steering is the hub: the one screen for everything that can steer an agent in a workspace. It has seven tabs, and this page specifies the hub and its first tab, Records. The other tabs have their own specs: `skills.md` (with `skills-off.md` and `skill-source.md`), `steering-memory.md`, `steering-ontology.md`, `steering-policy.md`, `steering-proposals.md`, and `steering-preview.md`.

The page depicts Phase 2 of the steering and gateway plan as shipped. Phases 0, 1, and 2 are live: records, skills, memory, ontology notes, gate notices, and workspace instructions all compete in one assembler, `assembleSteering(run, budget)`, and every run carries a `steering.manifest` frame. Phases 3, 4, and 5 are not live: the index is the Postgres registry, not the graph, and no screen claims a model proxy, observed metering, an enforced budget, a real interrupt, or a sandbox.

## What is on the page

**Hub header.** Eyebrow “Workspace · <workspace name>”, h1 “Steering”, and one lead paragraph: everything that can steer an agent in this workspace competes in one assembler, each item is a file proposed as a pull request and published by a merge, and Preview shows what an agent would receive, what was cut, and why.

**The seven tabs, in this order:** Records (N published) · Skills (N in scope) · Memory (N) · Ontology (N) · Policy (N gates) · Proposals (N candidates plus open pull requests) · Preview. Each tab is a URL segment, `#/:org/:ws/steering/<tab>`. The hash is read on load and on `hashchange`; a tab changed by code writes the hash back with `replaceState`, so every view is a link. The bare route `#/:org/:ws/steering` is Records.

Header action: **Write a steering record** (gold; opens the record wizard: describe, kind, statement, checks, pull request). On Records the header holds the gold action. A tab that holds its own primary action takes the gold from the header.

**Two planes that never merge.** Steering is what the model reads: advisory, ranked, budgeted, and it may be dropped. Gating is what gets refused: deterministic, never budgeted, never ranked. There is one authoring surface and two compilations. Every item compiles to text. An item with an enforcement grant also compiles to a gate, and every gate puts a one-line gate notice back into steering. The first six tabs and Preview are the text plane. Policy is the gate plane.

**One item type.** Every source is read into `SteeringItem`: `id`, `lineage`, `kind`, `force`, `scope`, `body`, `token_cost`, `enforcement_grant?`, `provenance`, `hash`, `valid_from`. `kind` is one of record, skill, memory, ontology, policy (a gate notice), instruction (workspace additional instructions). `force` is one of `must`, `should`, `may`, `info`.

**Precedence, fixed in one place.** A gate beats everything. A published `must` beats recalled memory. Repository scope may narrow workspace scope and never widen it.

### Records tab

- **Published records** as cards, newest first, with kind chips (All · rule · constraint · procedure · fact · memory · preference; the six kinds of `steering-record/v0.1`, icon and hue per kind, the statement always the headline), search, sort, and pager. The panel badge reads “newest first · git decides what is in force, and the Postgres registry indexes it”.
- Each card shows the SteeringItem fields an operator needs to predict the assembler: the record's **kind**, its **force** (`must`, `should`, `may`, `info`), its **constraint effect** where it has one, its **token cost** (“214 tok”), its **compilation** chip, its **scope**, its effect line, its id, commit, and publication date. A card carries **Open**, which routes to `record.md`.
- The compilation chip has two values. **compiles to text**: no enforcement grant, the model reads it and nothing refuses a call because of it. **compiles to text and a gate**: the record carries an enforcement grant; the chip is a button that opens the Policy tab, where the gate and its notice are listed. State reads by shape: the gate chip carries a dot, the text chip does not.
- A closing note: every record compiles to text; a record with a grant also compiles to a gate; a record can never grant authority (the checks enforce `constraint_effect ∈ {require, forbid}`); a repository record may narrow what a workspace record allows, never widen it.
- **On disk**: the `.oxagen/` tree, now with `skills/<name>/SKILL.md` (governed files, delivered by sync) and `ontology/*.toml` beside `rules/`, `proposals/`, and `agents/`. Stella symlinks into it.
- **Where Oxagen can inject**: “five points · four in use”. The harness owns the context window, and Oxagen competes for its own slice of it at exactly five points: (1) SessionStart additional context, capped at 16 KiB, the stable prefix; (2) UserPromptSubmit additional context, the volatile selection; (3) MCP tool results; (4) files in the checkout, skills included; (5) the model request itself, shown dashed and “not available yet” because it needs the `gateway` tier.

**Dialogs this page opens:** `wz (record wizard)`. Every creation wizard is `DLG_EXT.wz`; its spec is `docs/creation-spec.md`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Repositories · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · connection badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). Skills has no nav entry of its own: it is a tab of Steering.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Records | `RECORDS` (with `tok`, `grant`, `about`, `hash`, `repo`) | git `.oxagen/rules/` is the system of record; the Postgres registry is the index | `agent.steering_records`, `steering_record_versions`; `steering.record.*` | ✅ |
| Compiled bundle | `STEER_BUNDLE` in `engine.js` | `context.system` in the signed bundle (Phase 0) | compiled from active `must` and `should` records | 🟡 |
| Token cost and enforcement grant | `RECORDS[].tok`, `RECORDS[].grant` | `SteeringItem.token_cost`, `SteeringItem.enforcement_grant` | every row carries `kind` and `force` after the two publish paths collapse (Phase 1) | 🟡 |

## Functionality

- A record can never grant authority. An enforcement grant compiles a gate the policy already allows a record to narrow; it never widens one.
- Nav count on Steering is the proposals waiting for a person, plus 1 while a Skills interjection waits on one.
- The old routes `#/:org/:ws/skills`, `#/:org/:ws/skills/<view>`, and `#/:org/:ws/skills/<id>/source` still resolve. `route()` rewrites them in place to `#/:org/:ws/steering/skills…`, so no link in the mockup, a scenario, or a document breaks.
- `#/:org/:ws/steering/prs` is kept as an alias of `#/:org/:ws/steering/proposals/prs`.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header and the seven tabs stay, and the tab body is “Nothing steers this workspace yet”. Published records live in `.oxagen/rules/` on the main repo. A record becomes published by being merged, never by being saved here. Action: **Write a steering record**.
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton (four tile blocks and a panel of seven rows).
- **error**: “Steering could not be loaded”, `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied**: “You cannot see this workspace’s steering”. The roles the signed-in person holds on the organization do not include `steering.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The seven tabs are one scrolling strip with scroll snap, and the tab in view is scrolled to on render; the page itself never scrolls sideways. Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet**, **Agents**, **Tools**, **Spend**, **More**. **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace, and it is the lit slot on every Steering tab. Every dialog rises from the bottom edge as a sheet; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- Writes (each a governed action recorded in Audit): `context.propose (open a Steering PR)`, `context.review`, `context.retire`

## Backend gaps this page depends on

- Steering PR state from GitHub
- The registry port the assembler reads through (Phase 1), and its move to the graph behind the same port (Phase 3)

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen". `gateway` and `contained` appear only as tiers not yet available.
- Every badge that describes trust (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, or a dashed outline, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
