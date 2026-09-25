# Run evidence

| | |
|---|---|
| Route | `#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/evidence`. Old routes that land here: in the app, `/{org}/{ws}/runs/{run}?tab=issues`, `chain`, `proof`, `dod` and `ladder` (308 to the segment), with `?reads=` and `?spine=` keeping their names; in the mockup, `…/runs/{run}/issues`, `chain`, `proof`, `dod` and `ladder` (rewritten in place by `route()`, `RUN_TAB_ALIAS`) |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D2 (a run is a child of one work order), D14 (no fork replay, no bisect, no replay grades; the chain and the seal stay under Evidence), D17 (future-only marks); the Runs vocabulary (Evidence) and the Decision trace section 7. `docs/fleet-operations-ia.md` (Run, Evidence). `docs/tasks-spec.md` §8 and §11 (the definition of done, claims and acceptance). `run.md` owns the header, the Summary, the stat row, the tab bar and the side column this tab shares |
| Design | `mockups/src/wedge.js` → `runEvidence()`; `mockups/src/engine.js` → `approvalCardSm()`, `apToggle()`, `issuesTab()`, `runIssues()`, `linkedWork()`, `runGraphOf()`, `edgeChip()`, `chainTab()`, inside `pRun()`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Runs / Evidence`: Loaded, Loaded · mobile, and Loaded · future-only fields marked |
| Audit | `run-evidence.audit-prompt.md` |

## Job

Show what supports the run's outcome: the definition-of-done items the agent claimed and the ones a person accepted, the approvals on the run, the issues the session touched, the repositories and pull requests it worked in, the files it changed, and the chain and seal that make the record tamper-evident. A claim is the agent's word; an acceptance is a person's. The outputs are the side column's spine, on this tab as on every other.

Fork replay, bisect and replay grades are gone (D14). The chain and the seal stay here.

## What is on the page

**Shared.** The run header, the Summary, the stat row, the tab bar with "Evidence" selected ("live", or "sealed" once sealed), and the side column with Changes and Outputs, as `run.md` specifies them.

The tab's panels, in this order. A panel with nothing to show is absent. With component help on, each part carries a `?` that opens its section in `mockups/help/run-evidence.md` (Definition of done, Approvals, Issues, Linked work, Repositories, Pull requests and artifacts, Files changed, Hash chain, Seal and attestation, Checkpoints). The Linked work legend carries the `data-help` key `linked-work`.

**Compacted note**, on a compacted run whose segment is not rendered: "**Compacted.** This run is read from its archive segment." The hot window and the archive are explained in the Hash chain section of the component help.

**Definition of done**, when the run's work order carries items. Marked future-only. Heading "Definition of done" and the line "From `wo_01K5RS7M4N`" (the work order id is a link). What a claim and an acceptance mean is in the component help (Definition of done). A table Item · State · Evidence:

- State is a dot and a word: "accepted", "claimed" or "open".
- Evidence is what the agent cited for its claim, or a dash.
- On the demo run: "Every pull request merged into a-intel/platform since v4.10.3 appears once, linked" claimed ("release/4.11.0-notes.md lists 27 entries; compare v4.10.3...main counts 27"); "Breaking changes come before Fixes, each with its migration note" claimed; "The draft is on a release branch and main is untouched" claimed; "The GitHub release is a draft, and a person publishes it" open.

A direct work order has no items, and the panel is absent.

**Approvals**, when an approval names this run. Heading "Approvals". One small card per approval, pending or resolved:

- The shield glyph, the amount or the tool (`github__create_release@2`), "<agent> · <run title>", and the countdown (`9:13`, warning ink under two minutes), or a dash once resolved.
- The badges: risk (`high`), side effect (`irreversible`), "tainted" where it is, and the tier the approval recorded.
- "Tool <tool>" when an amount leads, "To <counterparty>" (`a-intel/platform`), and "Times out in 10m, then the call ends" while pending.
- Pending: "Approve" (gold; opens `approve`), "Deny" (danger; opens `deny`) and "Details" (`aria-expanded`), which reads "Hide details" when open. Resolved: the outcome as a badge with who resolved it ("approved by Marcus Bell").

"Details" is meant to expand the full approval card in place, the card the Approvals drawer shows (`approvals-drawer.md`). In the mockup it changes its label and expands nothing; a build expands the full card.

**Issues.** Heading "Issues" and the badge "4 in this session". The list controls: a Status filter, "Rows" (5, 10, 25, 50, All) and the pager (the rows shown out of the total, then the page numbers). A table Issue · Status · Relation · Edge · an unlabelled link column:

- Issue: the reference in mono and the title under it.
- Status: "open", "closed", "in progress" or "blocked", as a dot and a word.
- Relation: "task", "referenced", or the relation with its reason ("resolves · the draft lists each fix once").
- Edge: "stated", "observed", or "inferred" with its confidence ("inferred · 70%"), and one chip per frame it cites ("frame 9", "frame 12"), each opening that frame.
- "View ↗", the tracker's own page for the issue, or "no link".

The demo run lists `a-intel/platform#482` (task, stated), `#480` (referenced, closed, observed), `#471` and `#465` (inferred). With none: "No issue is linked to this session." The panel has no note under the table. Why a session touches more than one issue, and what relation, edge and status each say, is in the component help (Issues).

**Linked work.** Eyebrow "Linked work" and a legend of three edge chips, each with its count: "observed 3", "stated 0" and "inferred 2" on the demo run. Each chip's tooltip carries its meaning ("Written by Oxagen from a tool call routed through it", "Carried by the task", "Proposed by a light model that read the frames"). The full account is in the component help (Linked work). Two panels, each with a count:

- Repositories: one row per repository, a link to the forge, with its ref and note and its edge chip (`a-intel/platform`, "a4c91e2 · main · read; branch release/4.11.0-notes pushed · main untouched", observed, frame 5, frame 7). Empty: "No repository was touched."
- Pull requests and artifacts: one row per branch, release, pull request or file, each reference a link to the forge where it has one, with its state and edge chip. Empty: "Nothing produced yet."

Then **Files changed**: "+20 −0 · 1 file · as the harness reported them", and one row per file with its note and stat (`release/4.11.0-notes.md`, "new file · 2 writes", +20 −0) that opens its diff in place.

**Chain and seal**, three panels:

- **Hash chain**, with the badge "no gaps": Frames ("186 · dense seq 0 … 185", then "· the seal is envelope <N>" once sealed), Rule ("hash = SHA256(prev_hash ‖ canonical(envelope))"), Telemetry gap frames ("0"), Checkpoints ("9 · every 20 frames") and Completeness gaps ("none, every body recorded"). The panel has no note. How a gap is kept, who signs a checkpoint, and what Oxagen attests for a frame reported by harness are in the component help (Hash chain).
- **Seal and attestation**. Live: "Not sealed yet. The run is still recording." Sealed: the badge "sealed", Merkle root, Over, Archive segment, Signature ("ed25519 · <attester key>"), Signs over ("run_id, attempt_id, frame_count, merkle_root, archive_segment_digest, enforcement_tier, completeness_gaps"), Enforcement tier (the tier badge alone), and Verify offline with "Export the bundle", which opens `runexport`.
- **Checkpoints**, with "<in view> of <total>": a table Frame · Covers · Chain head · Signature ("countersigned"), each frame a link to it. With none in view: "No checkpoint frame is shown." When the seal is computed and how often the recorder writes a checkpoint are in the component help (Seal and attestation, Checkpoints).

There is no replay grade, no replay ladder, no Fork replay and no Bisect on this tab.

**Dialogs this tab opens:** `approve` and `deny` from a pending card, `frame` from every "fr N" and checkpoint link, `runexport` from "Export the bundle", and the run dialogs from the header (`run.md`).

## Data sources

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen (file paths) | Status |
|---|---|---|---|---|
| Definition of done: items, claims, acceptances | `WORKORDERS[].claims` (`fixtures/tasks.json`), `woItems()` | the work order's items and claims (`docs/tasks-spec.md` §8, §11) | none. Nothing stores a work item or a work order (wedge, Work, Shipped today) | ❌ |
| Approvals: id, tool, run, created and expiry, mandate, rule | `APPROVALS` + `S.ap` | `list_approvals` and `list_resolved_approvals` with `runId` | `packages/oxagen/src/contracts/agent.approval.list.ts:81`, items `:26-78`; `packages/oxagen/src/contracts/agent.approval.list_resolved.ts:77` | ✅ |
| Approvals: amount, risk, side effect, taint, counterparty, tier | `APPROVALS` | the approval row | not returned by `list_approvals`; the app's drawer draws none of them (`apps/app/src/features/shell/approvals-drawer.tsx:17-21`, #3848) | ❌ |
| Approve and Deny | `resolveApproval()`, `approvalSettle()` | `resolve_approval` | `packages/oxagen/src/contracts/agent.approval.resolve.ts:39` | ✅ |
| Issues: the task | `RUNS[].task` | `taskRef` | `packages/oxagen/src/contracts/run.list.ts:291`, ledger runs only | 🟡 |
| Issues: what the run's pull requests close, and their status | `RUNS[].issues`, `RUNGRAPH` | `get_run_work` closing issues | `packages/oxagen/src/contracts/run.work.get.ts:60-76` (closing issues with state) | ✅ |
| Issues: other relations, inferred edges and confidence | `RUNGRAPH`, `runIssues()` | none | not recorded | ❌ |
| Linked work: repositories and pull requests | `RUNGRAPH`, `OXPRS` | `get_run_work` | checkouts with their repository, pull requests with state, CI and diff (`run.work.get.ts:15-26`, `:77-109`) | ✅ |
| Linked work: inferred items | `RUNGRAPH` edges of kind `inferred` | none | not recorded | ❌ |
| Files changed | `RUNGRAPH.files`, `txDiffRows()` | `get_run_work` diffs; `get_run_outputs` file stats | `run.work.get.ts:27-44` (captured diffs), `:45-54` (pull request diff files); `packages/oxagen/src/contracts/run.outputs.get.ts:162` | ✅ |
| Hash chain: rule, frames, gaps, completeness | `RUNS[].frames`, `RUNS[].grade`, `runFrames()` | `get_run_chain` | `hashRule`, `frameCount`, `gaps` (`packages/oxagen/src/contracts/run.chain.get.ts:146`, `:87-106`) | ✅ |
| Seal and attestation | `RUNS[].sealed`, `ORG.attester` | `get_run_chain` seals; `export_run` attestation | `merkleRoot`, `seals` (`run.chain.get.ts:108-127`), `enforcementTier`; the attestation in the export (`packages/oxagen/src/contracts/run.export.ts:27`) | ✅ |
| Checkpoints | `FRAMES` of kind `checkpoint` | `get_run_chain` checkpoints | `run.chain.get.ts:57-77` (seq, chain head, event count, device key, countersignature) | ✅ |

## Future-only fields

With `?future=1` the design outlines these, each with the reason it gives. A build renders each as not recorded until its contract ships.

| Mark | Reason in the design | What a build shows today |
|---|---|---|
| The work order chip in the shared header | "work orders" | No chip (`run.md`) |
| The Definition of done panel | "work orders" | The panel is absent |

The ❌ rows above that the design does not mark (the approval fields past the row's id, tool and clock; the issue relations and inferred edges; the inferred linked items) render as not recorded in a build.

## Functionality

- The tab reads the record. A claim is the agent's word and an acceptance is a person's, and the panel never shows a claim as accepted.
- "Approve" and "Deny" on a pending card open the same dialogs as the Approvals drawer and resolve the same record. Approve mints a single-use token bound to the call digest, the agent, the run and an expiry. Deny needs a reason, which reaches the model as the permission decision reason. Both are governed actions in Audit, and the card turns into its outcome.
- The countdown on a pending card keeps ticking, and an approval nobody answers expires: the call ends and the reason reaches the model.
- An issue's status is read from the tracker when the page loads. The relation says which link it is, and the edge says how Oxagen knows. An inferred edge is labelled inferred everywhere it appears and never stands beside a record it contradicts.
- Every "fr N" chip and every checkpoint opens that frame in the frame dialog (`run.md`).
- The Hash chain panel and the Record row of the Decision trace read the same chain, so they cannot disagree about gaps or the seal.
- "Export the bundle" opens `runexport`. A build exports a sealed run only (`export_run` refuses a live one).

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

- The shell is as `run.md` describes, with Work lit in the thumb bar.
- The panels stack in the order above, and the side column stacks under them.
- The Definition of done, Issues and Checkpoints tables become stacks of labelled cards. The Linked work panels stack. The Chain and seal panels stack to one column.
- `approve` and `deny` rise from the bottom as sheets with full-width buttons.
- Every button, chip and link has a hit area of at least 44 px, and the page never scrolls sideways.

## Permissions

- Read: `get_run_chain` and `get_run_outputs` (organization Owner, Admin and Member; workspace Owner and Member), `get_run_work`, `list_approvals` and `list_resolved_approvals` (organization Owner and Admin; workspace Owner and Member).
- Write: `resolve_approval` for Approve and Deny, a governed action in Audit, gated server-side (`agent.approval.resolve.ts:50-53`). `export_run` from "Export the bundle" (organization Owner and Admin).

## Backend gaps this page depends on

- Work items, work orders, their definition-of-done items, claims and acceptances, and a `work_order_id` on the run (wedge Open decision 5).
- The approval row's amount, risk, side effect, taint, counterparty, tier and approvers on `list_approvals` (#3848).
- The single-use approval token a resolution mints, bound to the call digest, the agent, the run and an expiry. The v2 design contract names it (`packages/oxagen/src/contracts/v2/resolve-approval.ts:111-121`), and no handler returns it. The shipped `resolve_approval` returns the decision and the mandate settlement.
- Issue relations beyond a pull request's closing issues, and edges with their provenance.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- The tab reads the record. No inference is shown as a record: an inferred edge is labelled inferred with its confidence and the frames it leaned on. No score and no model-written account of why.
- No person is scored or ranked. The definition of done says who claimed and who accepted, and nothing more.
- Every enforcement claim states the tier. The seal's enforcement tier is the one computed from what was routed. Frames a wrapped agent produced are reported by harness, and the component help says so (Hash chain).
- No replay grade, no Fork replay and no Bisect.
- Headers are rollups of the rows beneath them: "<N> in this session" counts the issue rows, each Linked work panel counts its rows, and the Checkpoints count is its rows against the recorder's total.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. On the demo run it is "Approve" on the one pending card.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
