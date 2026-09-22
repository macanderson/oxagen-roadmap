# Context record

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/records/<lineage>` |
| Scope | workspace |
| Spec | §10 Context and steering; §12.7 attribution (rendered, cited); `docs/creation-spec.md` §5; Appendix F page 8 (Steering) |
| Design | `mockups/src/engine.js` → `pRecord(r)`, `crecPanel(rec)`, `crecSave()`, `DLG_EXT.srcpr`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / Workspace / Context record`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `record.audit-prompt.md` |

## Job

One published context record, presented by its kind. The statement is the record, so the statement is the headline; the lineage, the commit and the counters are metadata and read like it. The statement itself is editable in a real source editor, and saving opens a pull request: a published record is changed the way it was published.

## What is on the page

**Header**: eyebrow “**Steering** · record” (Steering is a link back to the Records shelf of the hub's Library, `#/…/steering/records`); breadcrumbs Steering / <lineage>. The kind glyph in a tinted tile, then the statement as the h1 (up to 62ch, never truncated). Chips: the kind badge, the steering force, the constraint effect where the kind has one, the scope, `published` (or `archived`), and the pending branch badge when a proposal is open against it. Subtext, one line: the kind's one-line description, then “It is in force because <commit> merged, and it stops being in force the same way.”
Actions: **Discard** (enabled only when the statement is modified) · **Propose a change** (gold)

- **Statement editor**: the shared code editor (`cedHtml`) over the statement and nothing else, path label `.oxagen/rules/<lineage>.toml · statement`, bar “unchanged” (or the change state) and “188 tok in the bundle” (or “not compiled”). Line-number gutter, markdown syntax highlighting, current-line band, **Find ⌘F** with a match count, a status line with `Ln/Col`, the grammar, a line and character count, and the key hints. Under it a note: this is the statement and nothing else; the lineage, the force, the scope and the effect are the rest of the file, and each one is changed the same way, a pull request against the main repo.
- **Lineage** panel (badge “the graph remembers everything; git decides what is in force”): Lineage, File (`.oxagen/rules/<lineage>.toml` on <main repo>), Published by (<commit> on <date>), Effect (the effect line, “rendered 212 · cited 212 · violated 0”, or “never rendered”), and Schema (`context-record/v0.1`).
- **The kind panel**, headed with the kind's name and its badge. It opens with the eyebrow **How it reaches a run** and one note (rule: compiled into the steering block, `must` and `should` in the stable prefix every turn, `may` and `info` selected by relevance; constraint: compiled into the stable prefix at whatever force it carries and asserted by the checks against every other published record on the same subject). One panel per kind, and no two alike:

| Kind | What its panel shows |
|---|---|
| `rule` | **Where it sits**: Force (`must`/`should`: “the stable prefix, every turn in scope”; `may`/`info`: “selected by relevance”), Effect where it has one, Bundle (“vN · T of B tokens”, or “not in the compiled bundle”); then three meters: Runs it was rendered into, Runs that cited it, Runs that went against it. |
| `constraint` | A `require`/`forbid` boundary block in the state hue. `forbid` with a grant: “This record carries an enforcement grant, so it compiles to text and to a gate. A call routed through Oxagen that crosses this boundary is denied before it is dispatched, with this record cited as the reason. The gate and its notice are on Steering, under Gates.” `forbid` without: it compiles to text, the agent reads the boundary in its stable prefix, and nothing refuses a call because of it until a grant compiles a gate. `require`: a run that has not done this cannot proceed past the point that needs it. Then **Conflicts**: every merge re-runs the conflict check across all N published records, so a `forbid` and a `require` on the same subject can never both be in force. Then the meters: rendered, cited, Runs that crossed it. |
| `procedure` | **The steps, in order**: the statement as an ordered list, one step per row, marker in the kind hue; the note that the order is the record, and a run that did these in a different order did not follow this procedure. |
| `fact` | **The claim, and how it is checked**: Falsifiable by, `valid_from` (the merge time of its commit), Last confirmed (“N runs read it and none contradicted it”), Steers (“nothing by itself”); a note that a fact that needs to change behaviour is a rule that cites it. |
| `memory` | **When it happened**: Recorded, Explains, Selection (“by relevance, never pinned”, with cited of rendered), Decay (“none automatic. A memory that stops being true is archived by a pull request, like everything else.”). |
| `preference` | **Soft, and recorded as soft**: nothing here blocks a call, “violated” reads as *not followed*, and three meters where the third, Runs that departed from it, is grey rather than red. |

Every kind panel ends with **What it can never do.**, the one sentence that stops the kind being read as stronger than it is (constraint: “It can narrow what is allowed. It can never widen it”; rule: it cannot grant authority or make a denied call allowed; procedure: a step is not an authority; fact: it steers nothing by itself; memory: it never forbids anything and is never evidence on its own; preference: it never blocks a call).

- The three meters read from the effect line: rendered is the total, cited and the third meter are shares of it (“212 of 212”, “0 of 212”). They are the record's attribution (§12.7), never a score.
- **Related records**: up to three, as record cards with an **Open** button, under Sort, Rows, and a pager; or “None. This is the only <kind> in <workspace>.”

**Dialogs this page opens:** `srcpr`, **Propose a change to this record**: the lead (“A published record is changed the way it was published: a branch, a pull request, the same six checks, and a merge. Nothing here edits what is in force.”), the statement diff against what is in force with a `+n / −n` count, the branch `context/<lineage>.amend`, and the six checks (Schema; Lineage, an amended record is the same record; record_hash recomputation, the old hash stays on every run that carried it; Secret and PII scan; Conflict against active records, re-run in full; constraint_effect unchanged). Footer **Cancel** · **Open the pull request** (gold; disabled when nothing changed). Opening reports “a-intel/platform#528 opened. <lineage> changes when it merges; until then every run still gets the words that are in force now.”

`crecarchive`, **Archive <lineage>?**: archiving is a pull request that sets `status = "archived"` on `.oxagen/rules/<lineage>.toml`. The file stays, the lineage stays, and the record stops compiling into the bundle when it merges; it is in force until then. A record carrying a constraint effect says so, because the gate goes with it and what it refused today is allowed once this merges. Nothing is deleted: every run it steered keeps naming its hash, and a later record may supersede it instead. Footer: **Keep it in force** · **Open the pull request** (red). A record that already has a pull request open against it says so and offers Close instead, so two changes are never proposed over the same file; one already archived says so too.

**Shell.** As `steering.md`: sidebar (Workspace nav: Fleet · Agents · Tools · Steering · Runtimes · Repositories · Spend; Organization nav: Organization · Billing · Audit) with Steering lit, top bar with breadcrumbs, ⌘K search-or-run, notifications, the **Approvals** button (count of everything waiting on you across the organization) that opens the drawer `#apdrawer`, and the account avatar. No assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| The record | `RECORDS` (`fixtures/records.json`) via `stgRecord(id)` | `.oxagen/rules/<lineage>.toml` on the workspace main repo; the Postgres registry indexes it (the graph becomes the index in Phase 3) | `agent.context_records` | 🟡 |
| The statement draft | `S.cedVal["rec:<id>"]` / `S.cedBase` | the working tree of a branch, never a row | none | ❌ |
| Bundle share | `STEER_BUNDLE` via `stgBundle()`, `crecBundleRow()` | compiled policy bundle, per version; `cost.run_totals` `steering_tokens` on a run | `agent.policy_bundles`; 🟡 ClickHouse `token_usage` | 🟡 |
| Effect counters | `rec.effect` via `crecNum()` | rollups over `frame.context_rendered` / `context_cited` (§12.7) | frame index | 🟡 |
| Pending proposal | `S.recPending[id]` | Context PR lifecycle (spec §10.3) | `agent.context_promotions` | 🟡 |
| Enforcement grant | `rec.grant` | `SteeringItem.enforcement_grant`; the gate on Steering · Gates | none produces prompt text today | 🟡 |

## Functionality

- The editor holds the statement only. The lineage, force, scope and effect are the rest of the file and each is changed the same way, a pull request against the main repo.
- **Discard** is disabled until the draft differs from what is in force, and returns it to that.
- **Propose a change** opens `srcpr` with the real line diff (`diffLines` / `diffHtml`) and a `+n / −n` count; its primary is disabled when nothing changed. Opening the pull request takes the draft as the new base and records `S.recPending[id]`, which shows as a branch badge in the header; the record in force is unchanged until merge.
- The six checks named on the proposal are the publication checks re-run for an amendment: schema, lineage unchanged, hash recomputed over the new bytes while the old hash stays on every run that carried it, secret and PII scan, the conflict check re-run in full because the words changed, and `constraint_effect` unchanged.
- The bundle token figure in the editor bar is the record's row in the compiled bundle, the same number the Records shelf's card shows.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell; `ctx.release.never-merge`, a constraint with a grant).
- **loading**: the shell stays; the page body is replaced by the skeleton, so you keep your bearings.
- **error**: “This record could not be loaded”. “The control plane answered `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the trace line.
- **access denied**: “You cannot see this record”, naming `steering.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

There is no empty state: the route names one record, and a lineage nothing holds is a 404, not an empty page.

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar; the five-slot thumb bar replaces the sidebar. The two-column grid becomes one column, statement editor first and the kind panel under it. The h1 drops to 18px. The proposal dialog rises as a bottom sheet with full-width footer buttons. Nothing scrolls sideways; tap targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- Writes (each a governed action recorded in Audit): `steering.write (commit to a branch)`, `repo.pr.open`, `steering.archive (open the pull request that takes a record out of force)`

## Backend gaps this page depends on

- Records are DB-backed today; the app must read and write `.oxagen/rules/*.toml` through the repo binding, and the commit that published a record must be the record’s provenance rather than a column somebody set.
- Effect counters need the frame rollup that counts rendered, cited, and violated per record per run (§12.7).

## Rules every build of this page must keep

- The statement is the headline. A build that leads with the lineage, the id or the status has inverted the record.
- Kind is an icon and a hue, never a hue alone, and the kind hues never reuse a state hue and never use gold.
- Each of the six kinds gets its own panel. Six kinds sharing one generic panel is a FAIL, whatever the copy says.
- A record can never grant authority, and every kind panel says what its kind can never do. The counters are attribution, never a score, a verdict, or a proof.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state.
- Nothing on this page writes a row. Every write ends on a pull request.
- A not-loaded state replaces the page body, never the shell.
