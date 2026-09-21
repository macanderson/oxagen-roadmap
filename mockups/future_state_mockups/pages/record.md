# Context record

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/records/<lineage>` |
| Scope | workspace |
| Spec | §10 Context and steering; `docs/creation-spec.md` §5; Appendix F page 8 (Steering) |
| Design | `mockups/src/engine.js` → `pRecord(r)`, `crecPanel(rec)`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / Workspace / Context record`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `record.audit-prompt.md` |

## Job

One published context record, presented by its kind. The statement is the record, so the statement is the headline; the lineage, the commit and the counters are metadata and read like it. The statement itself is editable in a real source editor, and saving opens a pull request — a published record is changed the way it was published.

## What is on the page

**Header** — eyebrow “**Steering** · record” (Steering is a link back to the Records tab of the hub, `#/…/steering/records`); breadcrumbs Steering / <lineage>. The kind glyph in a tinted tile, then the statement as the h1 (up to 62ch, never truncated). Chips: the kind badge, the steering force, the constraint effect where the kind has one, the scope, `published` (or `archived`), and the pending branch badge when a proposal is open against it. A line under it: what the kind is, and that the record is in force because its commit merged and stops being in force the same way.
Actions: **Discard** (enabled only when the statement is modified) · **Propose a change** (gold)

- **Statement editor** — the shared code editor (`cedHtml`) over the statement and nothing else, path `.oxagen/rules/<lineage>.toml · statement`. Line-number gutter, markdown syntax highlighting, current-line band, **Find ⌘F** with a match count, a status line with `Ln/Col`, the grammar, a line and character count, and the key hints. The bar carries the record’s token cost in the compiled bundle.
- **Lineage** panel — lineage, file path on the main repo, the commit that published it and when, the effect line (`rendered · cited · violated`), and the schema (`context-record/v0.1`).
- **The kind panel** — one per kind, and no two alike. This is the page’s reason to exist:

| Kind | What its panel shows |
|---|---|
| `rule` | Where it sits: force → the stable prefix (`must`/`should`) or selection by relevance (`may`/`info`), its share of the bundle’s tokens, and three meters — rendered, cited, went against. |
| `constraint` | A `require`/`forbid` boundary block, in the state hue, saying what happens to a call that crosses it — denied before dispatch for a call routed through Oxagen, with this record cited. That holds only where the record carries an enforcement grant: the grant compiles a gate, listed on Steering · Policy with its gate notice. A record with no grant compiles to text only, and nothing refuses a call because of it. Then the conflict rule: every merge re-runs the check across all published records, so a `forbid` and a `require` on the same subject can never both be in force. Then the three meters. |
| `procedure` | The statement rendered as an ordered list, one step per row, marker in the kind hue — because the order is the record, and a run that did every step in another order did not follow this procedure. |
| `fact` | The claim and how it is checked: what would falsify it, `valid_from` (the merge time of its commit), how many runs read it without contradicting it, and that it steers nothing by itself. |
| `memory` | When it happened, what it explains, that it is selected by relevance and never pinned, and that nothing decays automatically — a memory that stops being true is archived by a pull request. |
| `preference` | That nothing here blocks a call, that “violated” reads as *not followed*, and three meters where the not-followed count is grey rather than red. |

Every kind panel ends with **What it can never do** — the one sentence that stops the kind being read as stronger than it is.

- **Other records of this kind** — up to three, as record cards with an **Open** button; or a line saying this is the only one in the workspace.

**Dialogs this page opens:** `srcpr` — Propose a change: the statement diff against what is in force, the branch, and the six checks the pull request will run.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · connection badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| The record | `RECORDS` (`fixtures/records.json`) via `stgRecord(id)` | `.oxagen/rules/<lineage>.toml` on the workspace main repo; the Postgres registry indexes it (the graph becomes the index in Phase 3) | `agent.context_records` | 🟡 |
| The statement draft | `S.cedVal["rec:<id>"]` / `S.cedBase` | the working tree of a branch, never a row | — | ❌ |
| Bundle share | `STEER_BUNDLE` via `stgBundle()` | compiled policy bundle, per version | `agent.policy_bundles` | 🟡 |
| Effect counters | `rec.effect` | rollups over `frame.context_rendered` / `context_cited` | frame index | 🟡 |
| Pending proposal | `S.recPending[id]` | Context PR lifecycle (spec §10.3) | `agent.context_promotions` | 🟡 |

## Functionality

- The editor holds the statement only. The lineage, force, scope and effect are the rest of the file and each is changed the same way — a pull request against the main repo.
- **Discard** is disabled until the draft differs from what is in force, and returns it to that.
- **Propose a change** opens `srcpr` with the real line diff (`diffLines` / `diffHtml`) and a `+n / −n` count; its primary is disabled when nothing changed. Opening the pull request takes the draft as the new base and records `S.recPending[id]`, which shows as a branch badge in the header — the record in force is unchanged until merge.
- The six checks named on the proposal are the publication checks re-run for an amendment: schema, lineage unchanged (an amended record is the same record), hash recomputed over the new bytes while the old hash stays on every run that carried it, secret and PII scan, the conflict check re-run in full because the words changed, and `constraint_effect` unchanged.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading** — the shell stays; the page body is replaced by the skeleton, so the operator keeps their bearings.
- **error** — “This record could not be loaded” — `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see this record” — the roles the signed-in person holds do not include `steering.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

There is no empty state: the route names one record, and a lineage nothing holds is a 404, not an empty page.

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar; the five-slot thumb bar replaces the sidebar. The two-column grid becomes one column, statement editor first and the kind panel under it. The h1 drops to 18px. The proposal dialog rises as a bottom sheet with full-width footer buttons. Nothing scrolls sideways; tap targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- Writes (each a governed action recorded in Audit): `steering.write (commit to a branch)`, `repo.pr.open`

## Backend gaps this page depends on

- Records are DB-backed today; the app must read and write `.oxagen/rules/*.toml` through the repo binding, and the commit that published a record must be the record’s provenance rather than a column somebody set.
- Effect counters need the frame rollup that counts rendered and cited per record per run.

## Rules every build of this page must keep

- The statement is the headline. A build that leads with the lineage, the id or the status has inverted the record.
- Kind is an icon and a hue, never a hue alone, and the kind hues never reuse a state hue and never use gold.
- Each of the six kinds gets its own panel. Six kinds sharing one generic panel is a FAIL, whatever the copy says.
- A record can never grant authority, and every kind panel says what its kind can never do.
- Exactly one gold action per screen. Gold is identity; it never encodes state.
- Nothing on this page writes a row. Every write ends on a pull request.
- A not-loaded state replaces the page body, never the shell.
