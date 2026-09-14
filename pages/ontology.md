# Ontology

| | |
|---|---|
| Route | `#/a-intel/core-platform/ontology[/<tab>]` |
| Scope | workspace |
| Spec | §14 Mission Control; Appendix F page 5 |
| Design | `mc.html` → `pOntology()` (the single source; `consolidated.html` is the product build of it) |
| States | loaded · empty · loading · error · access denied |
| Files | `ontology-loaded.html` / `ontology-loaded-mobile.html`, `ontology-empty.html` / `ontology-empty-mobile.html`, `ontology-loading.html` / `ontology-loading-mobile.html`, `ontology-error.html` / `ontology-error-mobile.html`, `ontology-denied.html` / `ontology-denied-mobile.html` |
| Audit | `ontology.audit-prompt.md` |

## Job

The workspace’s model of its own business — the page the product is known for. The live class map with its consequences, a graph explorer that answers in plain English with the Cypher and citations behind it, sources and provenance, repositories and the code graph, and the git history of `.oxagen/ontology/`.

## What is on the page

**Header** — eyebrow “Workspace · <workspace name>”, h1 “Ontology”.
Actions: **Sync now** · **Open a proposal** (gold; opens the ontology-proposal dialog — a pull request)

**Summary tiles** (one number and one basis line each):
- **Classes** — count · “active version vN”
- **Entities** — count · “instances never go to git”
- **Relation types** — count · “drawn between classes”
- **Drift found** — count · the classes affected

- **Tabs**: Model (N) · Graph · Sources (N) · Repositories (N) · Versions (N).
- **Model** — The live map (SVG: every class with entity count, freshness dot, sources, relations drawn; Map / Cards; `as_of` version picker; a class opens its consequence), Consequence (most cited by agents, rules that reference it, proven runs per class, drift found), Embedding indexes: Index · Dims · Nodes · Recall @ 10 · Citation rate · State (**Upgrade** opens the index dialog; quality is measured from every run’s `context_use_feedback`).
- **Graph** — Ask in plain English (**Ask**; sample questions incl. “a question that writes” and “a question past budget”), Answer (rows table + Accepted clauses only · EXPLAIN plan · Compiler · Ontology version · Compiler confidence · Cost), Cited context frames, The four ways to ask, Explore instances (Path · Class · Node; **Expand to hop 2**; `as of` date).
- **Sources** — Source · Kind · Source records · Last sync · Health · Cursor · Entities produced (**Add a source** opens the source dialog); Entity provenance; Resolution (Natural keys · Model-assisted match · Resolved across sources · Awaiting a human; **Resolve entities** opens the resolve dialog).
- **Repositories** — Repository · Role (main / linked) · Production branch · Head · Indexed · Issues · Event health · Symbols · Data-layer drift (**Link a repository**, **Change** production branch → branch dialog); The data layer: Object · Declared by · Confidence · Finding; Events in: Event · 30d · Health.
- **Versions** — the git history of `.oxagen/ontology/`: Version · State · Commit · Merged · By · Pull request · Diff against the pinned version · Classes; Open proposal (`<repo>#517`: Profiler run · Source records · Named by · Migration plan; Checks); **Open the map** / **View the map** at that version.

**Dialogs this page opens:** `source`, `linkrepo`, `ontprop`, `ontindex`, `ontresolve`, `ontbranch`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Ontology · Steering · Spend; Organization nav: Organization · Billing · Audit; Assistant launcher; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, Assistant toggle, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/2026-09-12-mission-control-app-implementation-plan.md` §3; the *mockup collection* column names the constant in `mc.html` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Model map | `CLASSES` | `:OntologyVersion`/`:Class` | `schema_registry.*` (Postgres) + Neo4j labels | 🟡 |
| Graph, ask in plain English | graph tab fixtures | Cypher + citations | `ontology.query`, `ontology.neighbors`, `graph.*` | 🟡 Cypher shown ❌ |
| Sources | `SOURCES` | `:Source`, `:SyncRun` | `ingestion.source_connections` | ✅ |
| Repositories | `REPOS` | `wrk.repositories` | `ingestion.repository_bindings` (+heads, `github_installations`) | ✅ |
| Versions | `ONTVERSIONS` | git `.oxagen/ontology/` | `schema_registry.schema_versions` | 🟡 |
| Embedding indexes | `INDEXES` | Voyage vector indexes | none | ❌ |

## Functionality

- An ontology is proposed, never generated in place: link a repository and the GitHub fragment merges in; connect a source and the profiler opens a pull request with the classes it actually saw.
- A question that writes or a question past budget is refused with the reason shown; the answer always carries the compiled Cypher, the accepted clauses and the cited frames.
- `as_of` renders the map as it was at a version; the freshness dot reads stale when a source feeding a class is degraded.
- Instances (entities) are in the organization’s Neo4j database, never in git; the schema is in git.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “No ontology yet in <workspace>” — link a repository or connect a source. Actions: **Add a source**, **Link a repository**.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Ontology could not be loaded” — `504 graph_read_timeout`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see this workspace’s ontology” — the roles the signed-in person holds on the organization do not include `graph.read on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · assistant · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Ontology, Steering, Organization, Billing, Audit, Assistant, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `graph.read`
- Writes (each a governed action recorded in Audit): `ontology.propose`, `repo.link / repo.branch.set`, `source.add / source.sync`, `entity.resolve`, `index.upgrade`

## Backend gaps this page depends on

- embedding indexes
- Cypher and citations surfaced from `ontology.query`
- versions from git rather than `schema_registry`

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
