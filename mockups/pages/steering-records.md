# Steering · Library · Records

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/records` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 1, 3, 4, 5, 6, 7, 8, and 9); §14 Mission Control; Appendix F page 8 (Steering); `steering.md` is the hub this shelf belongs to |
| Design | `mockups/src/engine.js` → `stgRecordsTab()` with `recordCard()`, inside `pSteering()` and `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / steering-records`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering-records.audit-prompt.md` |

## Job

What this workspace has written down and merged. A record is the published form of steering: it lives in `.oxagen/rules/` on the main repo, it becomes published by being merged, and nothing here writes one. This shelf lists the published records and says, per record, what it compiles to.

Records is a shelf of the **Library** tab, not a tab of its own. The route it had in rev1 still resolves: `/steering/records` lights the Library tab and presses the Records chip.

## What is on the page

**Hub header, tabs, and shelf row.** As specified in `steering.md`: the eyebrow, h1 “Steering”, the one-sentence subtext, the governance chip, the five tabs (Library, Assignments, Gates, Proposals, Compiler) with Library selected, and the shelf row (All · Records · Skills · Memory · Ontology) with Records pressed. The gold action on this shelf is **Write a context record**, in the page header. **Import Markdown** sits before it, plain.

- **Published records** panel. Kind chips with counts: All 59 · rule 25 · constraint 12 · procedure 5 · fact 10 · memory 3 · preference 4 (`aria-pressed`, icon and hue per kind). List controls: Sort (Shown order, Statement A–Z, Statement Z–A), Rows (5, 10, 25, 50, All), and a pager (“1–10 of 59”, ‹ 1 2 3 4 5 6 ›). Cards are newest first, and the statement is always the headline.
- Each card (`recordCard` with `item`): the kind badge, its **force**, its **constraint effect** where it has one, its **token cost** (“214 tok”), its **compilation** chip, the state badge **published** (or “new · bundle vN” beside it for a record the last merge published), and **Open**, which routes to `record.md`. The meta line: scope, the effect line (“rendered 212 · cited 188 · violated 3”), the lineage id, the commit, and the publication date.
- The compilation chip has two values. **compiles to text**: no enforcement grant; the model reads it and nothing refuses a call because of it. **compiles to text and a gate**: the record carries an enforcement grant; the chip is a button that opens the Gates tab, where the gate and its notice are listed. State reads by shape: the gate chip carries a dot, the text chip does not.
- A closing note, verbatim: “Every record compiles to text. A record with an enforcement grant also compiles to a gate, which is listed on Gates with the notice it puts back into steering. A record can never grant authority: the checks enforce constraint_effect ∈ {require, forbid}, and a repository record may narrow what a workspace record allows, never widen it.”
- **On disk** panel: the `.oxagen/` tree as a pre: `workspace.toml`, `rules/` with `governance.toml` (“mode = team”), `promotions.jsonl` (“hash-chained ledger (regulated mode)”), three record files, then `skills/<name>/SKILL.md` (“governed files, delivered by sync”), `ontology/*.toml`, `proposals/*.toml` (“candidates; steer nothing”), `agents/<slug>.toml`. A note: Stella symlinks into this directory rather than copying it; Oxagen reads `.oxagen/` and nothing else.
- **Injection points** panel, badge “five points”, lead sentence “The harness owns the context window. Oxagen competes for its own slice of it, at exactly these points, and every delivery is recorded.” Five items: (1) SessionStart additional context, the stable prefix, capped at 16 KiB, cached in the signed bundle, works offline; (2) UserPromptSubmit additional context, the volatile selection under a token budget; (3) MCP tool results; (4) Files in the checkout, skills delivered by sync; (5) the model request itself, written at the proxy on the gateway and contained tiers, counted as `steering_tokens` and `context_frame_tokens`.

**Dialogs this page opens:** `govmode`, `wz (record wizard)`, `wz (Markdown import)`.

**Shell.** As `steering.md`: sidebar with Steering lit and Runtimes between Steering and Repositories, top bar with breadcrumbs, ⌘K search-or-run, notifications, the **Approvals** button that opens the drawer `#apdrawer`, and the account avatar. The top bar has no assistant button. Skills has no nav entry of its own.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Records | `RECORDS` (with `tok`, `grant`, `about`, `hash`, `repo`) | git `.oxagen/rules/` is the system of record; the Postgres registry is the index | `agent.context_records`, `context_record_versions`; `context.record.*` | ✅ |
| Compiled bundle | `STEER_BUNDLE` in `engine.js` | `context.system` in the signed bundle (Phase 0) | compiled from active `must` and `should` records | 🟡 |
| Token cost and enforcement grant | `RECORDS[].tok`, `RECORDS[].grant` | `SteeringItem.token_cost`, `SteeringItem.enforcement_grant` | every row carries `kind` and `force` after the two publish paths collapse (Phase 1) | 🟡 |
| Effect line per record | `RECORDS[].effect` | rollups over `frame.context_rendered` and `context_cited` | frame index | 🟡 |
| The `.oxagen/` tree | `oxTree()` in `engine.js` | the main repo's working tree | read by the collector at run start | 🟡 |

## Functionality

- A record becomes published by being merged. Nothing on this shelf writes to the registry: **Write a context record** opens the wizard, and the wizard ends on a Context PR listed under Proposals.
- **Import Markdown** opens the Markdown import (`steering.md`). It puts the lines accepted as records from one source file into one Context PR on the branch `context/import-<file slug>`, listed under Proposals, and they reach this shelf only when that pull request merges. Each gets the lineage `ctx.<first segment of the workspace slug>.<first four words>`, with `-2`, `-3` added where a record already holds it. A line that overlaps a published record's statement by 50% or more starts rejected with the note “Already published as <record> (N% word overlap).”
- A record can never grant authority. An enforcement grant compiles a gate the policy already allows a record to narrow; it never widens one.
- The compilation chip is a button only where the record carries a grant, and it opens Gates.
- **Open** routes to the record page, `record.md`.

## States

- **loaded**: the shelf as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header, the governance chip, the five tabs, and the shelf row stay; the header holds no gold. The body is “Nothing steers this workspace yet”: “Published records live in `.oxagen/rules/` on a-intel/platform. A record becomes published by being merged, never by being saved here.” Actions: **Import Markdown** (plain) and **Write a context record** (gold).
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton.
- **error**: “Steering could not be loaded”. “The control plane answered `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the line “trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z”.
- **access denied**: “You cannot see this workspace’s steering”. “Your roles on Anderson Intelligence Corp. do not include `steering.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by*.

## Mobile

The five tabs are one scrolling strip and the shelf row is a second strip under it; the selected tab and the pressed shelf are both scrolled into view, and the page never scrolls sideways. Record cards stack. Every dialog rises from the bottom edge as a sheet; touch targets are ≥ 44 px; inputs are 16 px. **More** is the lit thumb-bar slot.

## Permissions

- Read: `steering.read`
- Writes (each a governed action recorded in Audit): `context.propose (open a Context PR)`, `context.review`, `context.retire`.
- The Markdown import names `steering.write · memory.write` in its footer. The mockup checks neither before the wizard opens.

## Backend gaps this page depends on

- Context PR state from GitHub
- The registry port the assembler reads through (Phase 1), and its move to the graph behind the same port (Phase 3)
- The effect line: it needs the frame rollups per record

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen".
- Every badge that describes trust shows the recorded value and nothing stronger.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast.
- Exactly one gold action per screen. The governance chip is never gold.
- A not-loaded state replaces the page body, never the shell.
