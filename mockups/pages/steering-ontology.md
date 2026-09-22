# Steering · Ontology

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/ontology` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 4, 7, and 9); `steering.md` is the hub, and Ontology is a shelf of its Library tab |
| Design | `mockups/src/engine.js` → `stgOntologyTab()`, inside `pSteering()` and `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / steering-ontology`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering-ontology.audit-prompt.md` |

## Job

A home for the entity and term definitions that steer. It is a small tab, not a product area. The scope review of 2026-09-14 cut the ontology engine and the connectors pages, and this tab does not bring them back.

## What is on the page

**Hub header.** Eyebrow: the workspace name, h1 “Steering”, subtext “Everything that can steer an agent in this workspace competes in one assembler.” Actions: the governance chip **Governance: team** and **Write a context record** (gold; opens the record wizard). The chip and its `govmode` dialog are specified in `steering.md`.

**The five tabs, in this order:** Library (75) · Assignments (4) · Gates (6) · Proposals (15) · Compiler. Each tab is a URL segment, `#/:org/:ws/steering/<tab>`. The hash is read on load and on `hashchange`; a tab changed by code writes the hash back with `replaceState`, so every view is a link. Library is selected, and the shelf row beneath it presses Ontology (4 of 75): All · Records · Skills · Memory · Ontology, each a chip with a count and `aria-pressed`. `/steering/ontology` still resolves and lights this shelf.

- A lead note, verbatim: “An ontology note defines one entity or one term the way this workspace uses it. It compiles to text like any other item, enters the volatile selection as info, and grants nothing.”
- **Definitions** panel, badge “4”. Filter: Kind (entity, term); Rows; pager (“1–4 of 4”). Columns: Term (bold, with its id under it, `ont.release-train`) · Kind (`term` or `entity`) · Definition (the body, at most 52ch wide) · Force (`info`) · About (the repositories, records, or skills it is linked to, one per line in mono) · Token cost (“34 tok”) · File (`.oxagen/ontology/<name>.toml @ <commit>`).
- **Index** panel, three rows of a key-value list. **Today**: “The Postgres registry. The assembler reads every item, these notes included, from the registry behind one port.” **Later**: “The graph becomes the index (Phase 3 of the plan), once the knowledge graph is on by default. Each item is projected one way, registry to graph, and verified by hash. Postgres stays as the fallback behind the same port.” **Not here**: “There is no ontology engine and there are no connectors on this tab. A note is a file somebody wrote and somebody merged.”

**Dialogs this page opens:** `govmode`, `wz (record wizard)`.

**Shell.** As `steering.md`: sidebar with Steering lit and Runtimes between Steering and Repositories, top bar with breadcrumbs, ⌘K search-or-run, notifications, the **Approvals** button (count of everything waiting on you across the organization) that opens the drawer `#apdrawer`, and the account avatar. No assistant button in the top bar. Skills has no nav entry of its own.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Ontology notes | `ONTOLOGY` (`term`, `noteKind`, `body`, `force`, `entities`, `token_cost`, `provenance`) | `.oxagen/ontology/*.toml` in git; indexed in the Postgres registry | none; `packages/ontology` holds no steering | ❌ |

## Functionality

- A note is authored through the same pull request flow as a record: Write a context record, kind chosen in the wizard.
- Delivery never waits for the graph.
- The badge count is the row count and the tab count is the same number.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header, the chip, and the five tabs stay; the header holds no gold. The body is “No ontology notes yet”: “A note defines one entity or one term the way this workspace uses it. Notes are files under `.oxagen/ontology/` on a-intel/platform, published by a merge.” Action: **Write a context record** (gold).
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton (four tile blocks and a panel of seven rows).
- **error**: “Steering could not be loaded”. “The control plane answered `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the trace line.
- **access denied**: “You cannot see this workspace’s steering”, naming `steering.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The five tabs are one scrolling strip with scroll snap, and the tab in view is scrolled to on render; the page itself never scrolls sideways. The shelf row wraps under the Library tab, Ontology pressed among it. Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet**, **Agents**, **Tools**, **Spend**, **More**. **More** is a bottom sheet listing Steering (with its shelves inside), Runtimes, Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace, and it is the lit slot on every Steering tab. Every dialog rises from the bottom edge as a sheet; the table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- Writes: `context.propose`, the same governed action that opens any Context PR.

## Backend gaps this page depends on

- The ontology note source adapter (Phase 1)
- Projection of items as `:Record` nodes with `ABOUT` edges (Phase 3)

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen".
- Every badge that describes trust (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, or a dashed outline, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
