# Steering · Ontology

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/ontology` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 4, 7, and 9); `steering.md` is the hub this tab belongs to |
| Design | `mockups/src/engine.js` → `stgOntologyTab()`, inside `pSteering()` and `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / steering-ontology`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering-ontology.audit-prompt.md` |

## Job

A home for the entity and term definitions that steer. It is a small tab, not a product area. The scope review of 2026-09-14 cut the ontology engine and the connectors pages, and this tab does not bring them back.

## What is on the page

**Hub header.** Eyebrow “Workspace · <workspace name>”, h1 “Steering”, and one lead paragraph: everything that can steer an agent in this workspace competes in one assembler, each item is a file proposed as a pull request and published by a merge, and Preview shows what an agent would receive, what was cut, and why.

**The seven tabs, in this order:** Records (N published) · Skills (N in scope) · Memory (N) · Ontology (N) · Policy (N gates) · Proposals (N candidates plus open pull requests) · Preview. Each tab is a URL segment, `#/:org/:ws/steering/<tab>`. The hash is read on load and on `hashchange`; a tab changed by code writes the hash back with `replaceState`, so every view is a link. The bare route `#/:org/:ws/steering` is Records.

Header action: **Write a context record** (gold; opens the record wizard: describe, kind, statement, checks, pull request).

- A lead note: an ontology note defines one entity or one term the way this workspace uses it. It compiles to text like any other item, enters the volatile selection as `info`, and grants nothing.
- **Entity and term definitions** table: Term (with its id) · Kind (`entity` or `term`) · Definition · Force · About (the repositories, records, or skills it is linked to) · Token cost · File (`.oxagen/ontology/<id>.toml @ <commit>`).
- **Where these are indexed**, three rows. **Today**: the Postgres registry; the assembler reads every item, these notes included, from the registry behind one port. **Later**: the graph becomes the index (Phase 3 of the plan), once the knowledge graph is on by default; each item is projected one way, registry to graph, and verified by hash; Postgres stays as the fallback behind the same port. **Not here**: no ontology engine and no connectors; a note is a file somebody wrote and somebody merged.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Repositories · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · connection badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). Skills has no nav entry of its own: it is a tab of Steering.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Ontology notes | `ONTOLOGY` | `.oxagen/ontology/*.toml` in git; indexed in the Postgres registry | none; `packages/ontology` holds no steering | ❌ |

## Functionality

- A note is authored through the same pull request flow as a record.
- Delivery never waits for the graph.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header and the seven tabs stay, and the tab body is “No ontology notes yet”. Notes are files under `.oxagen/ontology/` on the main repo, published by a merge. Action: **Write a context record**.
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton (four tile blocks and a panel of seven rows).
- **error**: “Steering could not be loaded”, `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied**: “You cannot see this workspace’s steering”. The roles the signed-in person holds on the organization do not include `steering.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The seven tabs are one scrolling strip with scroll snap, and the tab in view is scrolled to on render; the page itself never scrolls sideways. Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet**, **Agents**, **Tools**, **Spend**, **More**. **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace, and it is the lit slot on every Steering tab. Every dialog rises from the bottom edge as a sheet; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- Writes: `context.propose`, the same governed action that opens any Context PR.

## Backend gaps this page depends on

- The ontology note source adapter (Phase 1)
- Projection of items as `:Record` nodes with `ABOUT` edges (Phase 3)

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen". `gateway` and `contained` appear only as tiers not yet available.
- Every badge that describes trust (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, or a dashed outline, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
