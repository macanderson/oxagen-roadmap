<!-- run-evidence: the Evidence tab of a run -->

## Definition of done

The Definition of done panel lists each item of the run's work order with its state and the evidence the agent cited for it.

### Purpose
You want to know whether the run did what the work order asked. The panel answers item by item. An item is `open`, `claimed` or `accepted`, and the Evidence column shows what the agent cited when it claimed the item. From here you open the work order to accept the claims.

### Rationale
A run is a child of one work order (D2 in `docs/fleet-operations-wedge.md`), and the definition of done belongs to the work order, not to the run (`docs/tasks-spec.md` §8 and §11). The panel keeps two words apart because they carry different authority. A claim is the agent's word. An acceptance is a person's. The panel never shows a claim as accepted, and nothing merges without a person. The subtitle names the work order the items came from, so the claim can be traced back to the send.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Items | `woItems()` over `WORKORDERS` (`fixtures/tasks.json`) | the work order's definition-of-done items | none |
| Claims and evidence | `WORKORDERS[].claims` | the work order's claims (`docs/tasks-spec.md` §11) | none |
| Acceptance | `claims[i].ok` | the work order's acceptances | none |
| Work order link | `runParent()`, `woUrl()` | a `work_order_id` on the run (wedge Open decision 5) | none |

### Logic
1. `runEvidence()` in `mockups/src/wedge.js` reads the run's work order with `runParent()` and its items with `woItems()`.
2. The panel renders only when the work order carries items. A direct work order has none, so the panel is absent.
3. Each row pairs item `i` with `claims[i]`. A claim with `ok` reads `accepted` in the allowed colour. A claim without it reads `claimed` in the approval colour. No claim reads `open`.
4. Evidence shows the claim's `ev` text, or a dash.
5. The subtitle reads "From `wo_01K5RS7M4N`" with a link to the work order.
6. Section 7 of the Decision trace counts the same claims with `woClaimed()`, so the two views agree.

### States
The whole panel is marked future-only with the reason "work orders". A build omits it until a store holds work orders and their claims. On the catalog run it shows 3 claimed items and 1 open item. On a phone the table becomes labelled cards.

## Approvals

The Approvals panel shows one small card for each approval that names this run, pending or resolved.

### Purpose
You want to see what the run is waiting on and what a person already decided. A pending card lets you approve or deny the call from here. A resolved card says who decided and how.

### Rationale
An approval belongs to the run that asked for it. The panel reads the same record as the Approvals drawer (`approvals-drawer.md`) and opens the same `approve` and `deny` dialogs, so a decision taken here and one taken in the drawer are the same governed action. The card is the compact form. The full card with its explanation lives behind Details in the drawer.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Id, tool, run, clock | `APPROVALS` filtered on `run`, `apState()`, `apLeft()` | `list_approvals` and `list_resolved_approvals` with `runId` | live |
| Amount, risk, side effect, taint, counterparty, tier | `APPROVALS` | the approval row | none |
| Decision | `S.ap`, `resolveApproval()` | `resolve_approval` | live |

### Logic
1. `runEvidence()` collects every approval whose `run` is this run and maps each through `approvalCardSm()` in `mockups/src/engine.js`.
2. The card shows the amount or the tool, the agent and the run title, and a countdown from `apLeft()`. Under 120 seconds the countdown turns to the warning ink.
3. The badges are risk, side effect, `tainted` when set, and the tier the approval recorded.
4. A pending card shows "Approve" (the one gold action on the tab), "Deny" and "Details". Approve and Deny open the `approve` and `deny` dialogs. Details toggles `S.apOpen` and its label.
5. A resolved card shows the outcome badge and who resolved it.
6. Each resolution is a frame on the run and an entry in Audit.

### States
The panel is absent when no approval names the run. In the mockup Details changes its label and expands nothing. A build expands the full card in place. On a phone the approve and deny dialogs rise as sheets.

## Issues

The Issues panel lists every issue the session touched: the task it started for and any issue it read, referenced or closed.

### Purpose
You want to know which tracker items this run bears on. The table gives each issue's status, its relation to the run, how Oxagen knows about the link, and a link to the tracker.

### Rationale
A session is not one issue. A run starts for one task and often reads or closes others on the way. The relation column says which link it is. The edge column says how Oxagen knows: `stated` (carried by the task), `observed` (a tool call routed through Oxagen) or `inferred` (proposed by a light model, with its confidence). An inferred edge is always labelled as inferred and never stands beside a record it contradicts. The status is read from the tracker when the page loads, so it can differ from the status when the run ended.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The task | `RUNS[].task`, `RUNS[].taskTitle` | `taskRef`, `run.list.ts:291` | partial |
| Closing issues and status | `RUNS[].issues`, `RUNGRAPH` | `get_run_work` closing issues, `run.work.get.ts:60-76` | live |
| Other relations, inferred edges, confidence | `runIssues()` over `RUNGRAPH` and `R.outputs` | none | none |
| Tracker link | `issueUrl()` | the tracker's own address | live |

### Logic
1. `runIssues()` builds the list without duplicates, in this order: the run's task (relation `task`, edge `stated`, frame 1), `R.issues`, the run graph's issues, and any output of kind `task` other than the run's task.
2. An entry with a frame is `observed`. One without is `inferred` at 70 percent.
3. `issuesTab()` renders Issue (reference and title), Status (`open`, `closed`, `in progress` or `blocked`), Relation, Edge (`edgeChip()` with one chip per cited frame) and a link.
4. `issueUrl()` maps `owner/repo#N` to GitHub, `PLAT-` and `INFRA-` to Linear, and `PO-` to the ERP. Anything else reads "no link".
5. The badge "N in this session" counts the rows.
6. The shared list controls add a Status filter, Rows and a pager.

### States
With no issue the table reads "No issue is linked to this session." Frame chips open the frame dialog. On a phone the table becomes labelled cards.

## Linked work

The Linked work line is the legend for the three kinds of edge on this tab, with the count of inferred items.

### Purpose
You want to know how far to trust each repository, branch, pull request and file listed under it. The line names each kind of edge in a few words and tells you how many of the rows a model inferred.

### Rationale
The panels under this line mix three kinds of knowledge, and they must never read as one. `observed` means Oxagen wrote the edge from a tool call routed through it. `stated` means the task carried it. `inferred` means a light model read the frames and proposed it, scored and cited. An artifact the outputs spine cites a frame for is observed. Before `runs[].outputs` existed, the only source was the flat `touched` list, which nothing cited, so every item read as inferred at 70 percent. That label is no longer honest for a node with a frame, because the same artifact would show twice: once citing its frame, and once as a guess. `runGraphOf()` now marks a node with a frame as observed.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Observed items | `runGraphOf()` nodes with `fr` | `get_run_work` | live |
| Stated items | the task's repository in `runGraphOf()` | `taskRef` | partial |
| Inferred items | `RUNGRAPH` edges of kind `inferred` | none | none |

### Logic
1. `linkedWork()` draws the legend as the app draws it (`apps/app/src/features/run/linked-work.tsx`, `Legend`): each edge chip and its short meaning, "recorded by Oxagen from the run's frames", "carried by the run's task reference" and "proposed by a model that read the frames".
2. The inferred entry ends with the count of inferred rows over all rows, "2 of 5 rows.", or "None of 5 rows." when nothing was inferred.
3. The count covers the Repositories and the Pull requests and artifacts panels below. Files changed carries no edge.
4. The page used to add "scored and cited" to the inferred meaning. The scoring and the citation are what this section's Rationale describes.

### States
A run with no artifacts derives its items from `R.touched`, each inferred at 70 percent and titled "named in the generated summary". On the catalog run the inferred entry reads "2 of 5 rows."

## Repositories

The Repositories panel lists each repository the run touched, with its ref, a note and the edge that links it to the run.

### Purpose
You want to walk from the run to the code it worked in. Each row links to the repository on the forge and says what the run did there.

### Rationale
Evidence gathers what supports the run's outcome (`docs/fleet-operations-ia.md`, Evidence). The repository is the first fact a reviewer checks: where the work happened, which commit it read, and whether the production branch stayed untouched. The row carries its edge, so a repository Oxagen observed through a routed call reads apart from one the task only named.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Repository, ref, note | `RUNGRAPH[run].repos`, `runGraphOf()` | `get_run_work` checkouts, `run.work.get.ts:15-26` | live |
| Edge and frames | `repos[].edge`, `repos[].fr` | `get_run_work` | partial |
| Forge link | `ghRepoUrl()` | the repository's address | live |

### Logic
1. `runGraphOf()` returns the authored graph from `RUNGRAPH` when the run has one.
2. Without one it derives a repository from the task reference, with the ref "from the task", the note "no tool call on this repository was observed", and the edge `stated`.
3. `lwItem()` renders the glyph, the name as a link, the ref and the note, and `edgeChip()` with one chip per frame.
4. The badge counts the rows.

### States
With none the panel reads "No repository was touched." On the catalog run it shows `a-intel/platform` with "a4c91e2 · main · read; branch release/4.11.0-notes pushed · main untouched", observed at frames 5 and 7. On a phone the two Linked work panels stack.

## Pull requests and artifacts

The Pull requests and artifacts panel lists each branch, release, pull request, file and record the run produced, with its state and edge.

### Purpose
You want the durable things the run made, each one link away from where it lives. The panel is the list form of the outputs spine in the side column.

### Rationale
The side column's spine tells the story in frame order. This panel is the reference list a reviewer scans on the Evidence tab. Both read the same nodes, and the glyph map in `linkedWork()` covers every kind the spine can carry, so an artifact keeps one glyph on both surfaces. A state badge shares the spine's vocabulary.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Artifacts | `runGraphOf().artifacts` from `R.outputs` filtered by `roDurable()` | `get_run_outputs`, `run.outputs.get.ts:162` | partial |
| State | `artifacts[].state` | `get_run_outputs` | partial |
| Forge link | `artRef()` with `runWork()` | `get_run_work` | live |

### Logic
1. `runGraphOf()` keeps durable outputs only. Reads, the task, a would-do node, the seal and a halt are left out.
2. `artRef()` links a pull request to its page, a branch to its tree, a check to the first pull request's checks, and a release to the releases page. Anything else stays plain text.
3. The state badge maps `created` and `written` to allowed, `open` and `pending` to approval, `failing` and `blocked` to denied, `pushed`, `sealed` and `posted` to proven, and `merged` to allowed.
4. The title line and `edgeChip()` follow.
5. The badge counts the rows.

### States
With none the panel reads "Nothing produced yet." The design's `task`, `branch` and `release` kinds are not in the shipped outputs contract, so a build shows them as not recorded.

## Files changed

The Files changed panel lists each file the run changed, with its diff stat, and opens the diff in place.

### Purpose
You want to read what the run wrote without leaving the page. Each row expands to its diff.

### Rationale
The diff is the most direct evidence of what a run did to code. The heading carries the totals so the size of the change reads first. The caption "as the harness reported them" states the basis: the file contents come from the harness, not from a fetch Oxagen made.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Files, before and after | `RUNGRAPH[run].files` | `get_run_work` captured diffs, `run.work.get.ts:27-54` | live |
| Additions and deletions | `runMetrics()` `add` and `del` | `get_run_outputs` file stats | live |

### Logic
1. The panel renders only when the run graph holds files.
2. The heading sums additions and deletions from `runMetrics()`, draws a bar split between the two, and counts the files.
3. Each file is a `<details>` row with its path, its note, and its stat from `diffStat()` over `txDiffRows()`.
4. Opening a row draws the diff with `diffHtml()` and three lines of context.
5. The Changes panel in the side column shows the same totals.

### States
The panel is absent on a run with no file change. On the catalog run it shows `release/4.11.0-notes.md`, "new file · 2 writes", +20 −0.

## Hash chain

The Hash chain panel states the facts that make the run's record tamper-evident: the frame count, the hash rule, gaps, checkpoints and completeness.

### Purpose
You want to know whether the record is whole and unaltered. The panel answers with the badge "no gaps" and five rows an auditor can check.

### Rationale
Replay and bisect left the interface, and the chain and the seal stay under Evidence (D14). Each frame's hash covers the frame before it, `hash = SHA256(prev_hash ‖ canonical(envelope))`, and `seq` is dense from 0 (`docs/mission-control-spec.md` §8.3). A gap is recorded as a `telemetry_gap` frame and never repaired. Checkpoints fix the chain every 20 frames. The producer's key signs each one, the host device key for a wrapped agent, and Oxagen countersigns it at ingest.

What Oxagen attests depends on who wrote the frame. A wrapped agent's frames are reported by the harness: signed by the producer and countersigned at ingest. For those, Oxagen attests that it received them and that the chain is intact. It does not attest that their content is true. Frames Oxagen writes itself, such as a decision on a routed call, are attested by Oxagen.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Frames and seq | `RUNS[].frames` | `get_run_chain` `frameCount`, `run.chain.get.ts:146` | live |
| Rule | fixed in `chainTab()` | `get_run_chain` `hashRule` | live |
| Gap frames | fixed at 0 | `get_run_chain` `gaps`, `run.chain.get.ts:87-106` | live |
| Checkpoints | checkpoint frames in `runFrames()` | `get_run_chain` checkpoints | live |
| Completeness gaps | `RUNS[].grade` | `get_run_chain` | live |

### Logic
1. `chainTab()` treats a run as sealed when its status is neither `live` nor `parked`.
2. Frames reads the count and "dense seq 0 … N−1", then "the seal is envelope N" once sealed.
3. Checkpoints counts checkpoint frames when the frames in view cover the whole run. Otherwise it is the frame count divided by 20.
4. Completeness gaps reads from `R.grade`: `full` has none, `partial` means some frames lack bodies, and `digest` means only digests were sent.
5. The Decision trace's Record row reads the same chain, so the two cannot disagree.

### States
A compacted run whose segment is not rendered shows the banner "Compacted. This run is read from its archive segment." Frame rows leave the hot table after the thirteen-month hot window, and the archive segment holds the same bytes, written once at seal (`docs/mission-control-spec.md` §13). On a phone the three chain panels stack.

## Seal and attestation

The Seal and attestation panel shows the run's Merkle root, its archive segment and the signed attestation, or that the run has not sealed.

### Purpose
You want proof that the record is closed and signed, and a way to check it offline. The panel gives the root, the signature and the fields signed over, and "Export the bundle" opens the export.

### Rationale
The seal is computed at run end for every terminal outcome (`docs/mission-control-spec.md` §8.3). It computes an RFC 6962 Merkle root over every frame hash, writes the archive segment, and produces the run attestation: an Ed25519 signature by the organization's attester key over `run_id`, `attempt_id`, `frame_count`, `merkle_root`, `archive_segment_digest`, `enforcement_tier` and `completeness_gaps`. The enforcement tier is computed from what was routed through Oxagen, not from what the adapter supports (ADR-095). Until the seal, the chain is verifiable frame by frame, and there is no Merkle root and no attestation.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Merkle root | `frHex()` over the run id | `get_run_chain` `merkleRoot`, `run.chain.get.ts:108-127` | live |
| Archive segment | derived from the run id | `get_run_chain` seals | live |
| Signature and key | `ORG.attester` | `export_run` attestation, `run.export.ts:27` | live |
| Enforcement tier | `RUNS[].tier` | `enforcementTier` | live |

### Logic
1. A sealed run shows the badge "sealed" and the rows Merkle root, Over, Archive segment, Signature, Signs over, Enforcement tier and Verify offline.
2. Over reads "frames 0 … N−1" and the seal time.
3. The archive segment is `seg_<run id>.ndjson.zst`.
4. "Export the bundle" opens `runexport`.
5. A live or parked run shows "Not sealed yet. The run is still recording."

### States
On the catalog run, which is live, the panel shows only the unsealed line. A build exports a sealed run only, because `export_run` refuses a live one.

## Checkpoints

The Checkpoints panel lists the checkpoint frames in view, each with the range it covers, its chain head and its signature.

### Purpose
You want to see where the chain was pinned mid-run. Each row opens its checkpoint frame.

### Rationale
A checkpoint pins the chain so a crash or a dropped connection cannot cost the frames already recorded (`docs/mission-control-spec.md` §8.3). The recorder writes one every 20 frames. The heading count reads the checkpoints in view against the recorder's total, so a run whose frames are only partly in view says so.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Checkpoint frames | `runFrames()` of kind `checkpoint` | `get_run_chain` checkpoints, `run.chain.get.ts:57-77` | live |
| Chain head | `f.head` or `frDig()` | `get_run_chain` | live |
| Countersignature | fixed as countersigned | `get_run_chain` | live |

### Logic
1. `chainTab()` filters the run's frames to checkpoints.
2. The heading reads "<in view> of <total>", where the total is the checkpoint count from the Hash chain panel.
3. Each row shows the frame as a link (`frameBtn()`), the range it covers from `f.from` to its seq, the chain head, and "countersigned".
4. A frame link opens the frame dialog on that checkpoint.

### States
With no checkpoint in view the panel reads "No checkpoint frame is shown." On a phone the table becomes labelled cards.
