## View switch {#steering-proposals/view-switch}

Two buttons that switch the Proposals tab between the proposals and their pull requests.

### Purpose
A person on this tab asks what waits at each stage of a change to steering. **Proposals** shows the candidates, and **Pull requests** shows the ones already on a branch with their checks. From here they either review a proposal or merge a pull request.

### Rationale
A proposal becomes a pull request, and a merge publishes it. Those are two stages of one concern, so the IA gives them one tab, Proposals, with the pull requests as a view inside it at `/steering/proposals/prs` (`docs/fleet-operations-ia.md`, Steering). The old `/steering/prs` address resolves there. The line that stated the lifecycle beside the buttons explained the design to a reviewer, so it moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Proposals count | `PROPOSALS.length` | `list_proposals` | shipped |
| Pull requests count | `stgOpenCount()` over `CTXPR`, `RECPRS` and `PROPOSALS[].pr` | `list_proposals` `pr` and `status` | shipped |

### Logic
- `stgProposalsTab(w, t)` draws the group, labeled "Proposals or pull requests", with `aria-pressed` on the view in use. The same group, with the same key, sits on both views.
- **Proposals** calls `stgTab('proposals')` and **Pull requests** calls `stgTab('prs')`. `stgHash()` writes `/steering/proposals` or `/steering/proposals/prs`, so each view has an address a person can send.
- The Proposals count is `PROPOSALS.length`: 10 at load.
- The Pull requests count is `stgOpenCount()`. It adds three things: the promoter's pull request (`CTXPR`) while `S.ctxpr.st` is none of `none`, `merged` and `closed`, every pull request a person opened that is neither merged nor closed (`recprOpenCount()`), and every other proposal whose `pr` is set. That is 6 at load.
- The Proposals tab in the tab bar reads the sum of both, 16.
- A closed pull request leaves both counts, the promoter's and a person's alike.

### States
Loaded only. On a phone the two buttons wrap under the tabs. Neither button is gold.

## Proposals

The workspace's proposals, one record card each, with the state, the checks and the support each one cites.

### Purpose
The list answers which changes to steering are waiting, where each came from, and how far each has gone. **Review** opens one proposal in place.

### Rationale
Proposals come from four places: an agent's memory, a finding, an operator's steer and a person. A proposal steers nothing until its pull request merges. It is in no envelope, no bundle and no Sources row before then. A memory reaches a Steering record only through a proposal (D13 in `docs/fleet-operations-wedge.md`). The promoter shows its support and sets no threshold, so a person decides (`docs/mission-control-spec.md` §9.2). The card is the same `recordCard` a published record uses, so a proposal reads like the record it would publish. The panel's caption carried the first two facts above and moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Kind, force, statement, lineage | `PROPOSALS` (`fixtures/proposals.json` plus six pushed in `engine.js`) | `agent.context_proposals` via `list_proposals` | shipped |
| State badge | `PROPOSALS[].state`, `prpBadge()` | Proposal `status` | shipped |
| Checks badge | `PROPOSALS[].checks`, `S.ctxpr` | `checks` passed of total | shipped |
| "from <source>" | `PROPOSALS[].from` | `source` | shipped |
| The promoter, findings job and post-run review as authors | `PROPOSALS[].from` | Jobs that raise proposals (ADR-061) | future-only |
| Support line | `PRP_META[].support` over `PRP_SUPPORT`, else `PROPOSALS[].support` | A measure over the supporting runs (#3881) | partial |

### Logic
- `stgProposalsTab()` maps `PROPOSALS` in fixture order through `recordCard()`, with `prpBadge(p)` and **Review** at the right, and "from", the support line and the proposal id in the meta line.
- `prpBadge()` for the promoter's proposal (`CTXPR.prp`, `prp_01K5RU4A`) follows the pull request: "ready for a pull request" before it opens, "open pull request" with the checks label while open, and "published" once merged. Any other proposal shows its fixture state, grey for "candidate" and amber otherwise, and a checks badge that is green only at "6 / 6".
- **Review** sets `S.prpSel` and re-renders. The address stays `/steering/proposals`.
- The shared list controls (Sort, Rows, pager) come from `listify()`.
- The card's scope is fixed to "workspace". The mockup lists every proposal in the organization. A build lists this workspace's only.
- Fixture defects a build does not copy: the third card's "open Context PR", and checks counted out of 5, 7 and 4 where every record pull request runs six.

### States
Loaded only. On a phone each card stacks its badges over the statement and wraps its meta line.

## Proposal tiles {#steering-proposals/tiles}

Three counts at the top of a proposal's review: supporting runs, distinct agents, and the promoter's confidence.

### Purpose
A person sees how much support a proposal has before reading a single run, and whether a person or the promoter raised it.

### Rationale
The promoter argues from the runs it cites, the distinct agents among them and its own confidence, and there is no promotion threshold (`docs/mission-control-spec.md` §9.2). The first two tiles are counts of the Supporting runs rows below, so a tile never claims more than the rows show. The confidence is the promoter's own estimate, and a person decides whether the support is enough. A person's proposal carries no confidence, so its third tile says the same six checks apply to it as to any record.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Supporting runs | `prpStats(id).runs` over `PRP_SUPPORT` | `support.runs` | shipped |
| Distinct agents | `prpStats(id).agents` | `support.agents` | shipped |
| Confidence | `PRP_META[id].confidence` | The promoter's estimate (#3881) | future-only |

### Logic
- `prpDetail(p)` renders the tiles with `tile()` inside `[data-prp-tiles]`.
- `prpStats(id)` reads the rows of `PRP_SUPPORT[id]`: `runs` is the row count, `agents` the distinct `agent` values, `dups` the sum of repeat reads, `kept` the rows with outcome `kept`, and `keptRate` their share. `met` is always true, because no threshold exists.
- Sub-lines: Supporting runs reads "sealed runs", or "proposed by a person" when `PRP_META[id].person` is set. Distinct agents reads "in the supporting runs". Confidence reads the value to two decimals and "the promoter's estimate". A person's proposal shows **Checks**, "apply", "the same six as any record".
- At load:
  - `prp_01K5RU4A`: 212, 1 and 0.97.
  - `prp_01K5RU7B`: 14, 1 and 0.64.
  - `prp_01K5RU9C`, raised by Marcus Bell: 3, 2 and Checks.
  - `prp_01K5RX1N`: 3, 2 and 0.71, where the 3 counts sayings.
- Every value renders in the allowed green. Nothing colors a tile by a threshold.

### States
Loaded only. A proposal with no `PRP_META` entry (the six generated for other workspaces) has no confidence, so its Confidence tile reads "—" over "not recorded". On a phone the three tiles wrap.

## Proposed record

The record the proposal would publish, drawn as the card it will be once merged.

### Purpose
A person reads the exact statement, kind, force and lineage under review, and sees that it steers nothing yet.

### Rationale
A proposal is a candidate change to a Steering Source, not a source. Drawing it with `recordCard`, the card a published record uses, shows what merging would add without letting it pass for a published record. The "steers nothing yet" badge replaces the "published" badge the card would otherwise carry, so the two states never look alike. The proposal id rides on the panel heading because a person quotes it on the pull request and in Audit.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Kind, force, statement, lineage | `PROPOSALS[]` | `list_proposals` | shipped |
| Proposal id badge | `PROPOSALS[].id` | Proposal `id` | shipped |
| "from <source>" | `PROPOSALS[].from` | `source` | shipped |
| Scope on the card | fixed to `workspace` | Proposal `scope` | shipped |

### Logic
- `prpDetail(p)` draws the panel "Proposed record" with `p.id` as a mono badge at the right.
- The card is `recordCard({kind, force, st, scope: "workspace", id: lineage})` with the right slot set to "steers nothing yet" and the meta set to "from <source>".
- The kind badge carries its glyph and the kind in capitals, the force sits beside it, and a constraint effect shows only when the record carries one. The mockup passes no effect here, so a constraint proposal shows none. A build shows the effect the proposal carries.
- The scope is always "workspace" in the mockup. A build shows the scope the proposal asks for, which decides whether the pull request opens on the main repository or on a linked one.

### States
Loaded only. On a phone the card stacks its badges over the statement.

## Promoter evidence

The argument for the proposal, in prose, with the numbers it rests on.

### Purpose
A person reads why the record is proposed: what the runs did, how often, and what the proposed record would change.

### Rationale
The promoter aggregates runs and argues, and a person decides (`docs/mission-control-spec.md` §9.2). The argument is written from the supporting rows so every number in it matches the table below it. It names the tool, the input digest and the count rather than a judgement, because a proposal carries an outcome for each run and never a verdict. A person's proposal says who raised it and that it faces the same six checks.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Rationale text | `PRP_META[id].rationale(s)` | Proposal `rationale` | shipped |
| Numbers inside it | `prpStats(id)` over `PRP_SUPPORT` | The proposal's support (#3881) | partial |

### Logic
- `prpDetail()` prints `m.rationale(s)` as one paragraph, where `s` is `prpStats(id)`.
- `prp_01K5RU4A`: `github__get_file_contents@2` on CHANGELOG.md with an identical input digest 682 times beyond the first read across 212 sealed runs, 3.2 repeat reads a run, each repeat returning the first read's response digest and putting the 2,900-token file back in the window. It closes that a rule to cache the first read changes the behavior without editing the brief.
- `prp_01K5RU7B`: 14 triage runs the post-run review marked unsatisfied, each an issue labeled before it was reproduced, and the note that support is one agent so far.
- `prp_01K5RU9C`: Marcus Bell raised it from 3 drift findings across 2 agents.
- `prp_01K5RX1N`: the fold's account. It quotes each saying as "<agent> wrote “<saying>” in <run> at frame <n>.", then the setting it reached (`S.memFold`) and that as a record it reaches every run in core-platform at `should`.

### States
Loaded only. A proposal with no `PRP_META` entry has no rationale, so the panel reads "No promoter evidence was recorded for this proposal." Supporting runs and If it publishes fall back to the proposal's own support line.

## Supporting runs

The runs the proposal cites, one row each, with the frame and record that support it and the run's outcome.

### Purpose
A person checks the evidence behind the tiles run by run, and filters by outcome to see the runs that went the other way.

### Rationale
The tiles are rollups of these rows, so the rows are the proof. Each row carries the outcome the record shows for that run, `kept`, `reverted`, `no change` or `halted`, and never a grade: the proposal argues and a person decides. The promoter aggregates sealed runs only, so a live run is never a row.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Run | `PRP_SUPPORT[id][].run` | `support.runs` | shipped |
| Agent, date, Frame, Outcome, Record | `PRP_SUPPORT[id][]` | Each run's terminal status, citing frame and record (#3881) | future-only |
| Badge (support line) | `PRP_META[id].support(s)` | A measure over the rows (#3881) | partial |
| Memory-fold rows | `MEMORY[].sayings` where `proposedAs` is `prp_01K5RX1N` | A saying per run on the memory | future-only |

### Logic
- `PRP_SUPPORT` is built once. `prp_01K5RU4A` opens with the three sealed runs finding `fnd_01K5RT6C` names, then 209 generated rows over 30 days. `dups` is repeat reads beyond the first. `prp_01K5RU7B` holds 14 halted triage runs, and `prp_01K5RU9C` 3 reverted runs from two agents.
- `prp_01K5RX1N` holds one row per saying of `mem_01K5R0N2`. Frame is the frame the saying was made in, Record is the memory with "memory · saying", and the badge reads "3 sayings from 3 runs".
- Columns: Run (id, with agent and date under it), Frame ("seq 31"), Outcome (a dot and a word, colored by `vcls`) and Record (id, with `PRP_META[id].recKind` and "×<dups>").
- The shared list controls add an Outcome filter.
- Defects a build does not copy: the third row reads "failing", and the fold rows read `passed` or `failed`, words taken from each run's summary, and all carry 2026-09-11. A build shows the recorded outcome in the four words, and each run's own date.

### States
Loaded only. On a phone the table becomes labeled cards.

## Pull request

Where the proposal's pull request goes, and the one action its state allows.

### Purpose
A person sees the repository, branch, file and review rule the pull request will use, then opens it, follows it, or learns there is no path yet.

### Rationale
One concern is one pull request, so the panel offers to open one only while the proposal has none. The branch and file are derived from the lineage, `context/<lineage>` and `.oxagen/rules/<lineage>.toml`, which is how a published record is found in git (`docs/mission-control-spec.md` §10.3). Governance names who may merge, because the mode is read off `governance.toml` on the main repository.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Target, Branch, File | fixed to `a-intel/platform`, derived from `p.lineage` | `get_context_pr` repository, branch, path | shipped |
| Governance | fixed text "team · a code-owner review is required" | `get_context_pr` `governanceMode` | shipped |
| Action state | `S.ctxpr`, `PROPOSALS[].pr` and `checks` | Proposal `status` and `pr` | shipped |

### Logic
The action, in order:
1. The promoter's proposal with no pull request (`S.ctxpr.st` is `none`): **Open a pull request**, gold, which opens `ctxpr`.
2. The promoter's proposal with one open or merged: **Open a-intel/platform#519** or **Merged in a-intel/platform#519**, plain. It clears `S.prpSel`, selects the promoter's pull request (`S.prSel = "ctxpr"`) and calls `stgTab("prs")`, so the address becomes `/steering/proposals/prs`.
3. Another proposal with a pull request: its number and checks in mono ("a-intel/platform#520 · 5 / 6 · conflict check running").
4. A candidate with no path in the design: a disabled **Open a pull request**.

The mockup fixes Target and Governance. A build reads both from `get_context_pr`.

### States
Loaded only. While the header's New source is gold, case 1 puts a second gold on the screen. A build keeps one.

## If it publishes

What merging the proposal would change: who it reaches, how it compiles, what it costs and the baseline it moves.

### Purpose
A person weighs the proposal's cost against its evidence before opening a pull request.

### Rationale
A published record costs tokens on every turn in scope, so the price belongs beside the argument. Baseline repeats the measure the evidence rests on, so the change can be read against it after the merge. A published record reads back on a run the same way: every run that renders it cites the record in its context frame, and the run's page shows where it landed (`docs/mission-control-spec.md` §9.2). That row moved here from the panel.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Reaches | fixed text | Proposal scope | shipped |
| As (bundle version, force) | `STEER_BUNDLE.v`, `p.force` | `get_context_pr` `onMerge.bundleVersion` | shipped |
| Costs | `PRP_META[id].tok`, `stgBundle().tok` | Tokens a turn before and after | future-only |
| Baseline | `PRP_META[id].measure(s)`, `prpStats().keptRate` | The baseline measure | future-only |

### Logic
- Reaches is fixed: "every run in core-platform on a-intel/platform, from its next model call". The PR spec's delivery row applies here too: a record reaches a run at its next session start, and a build says so.
- As names bundle `v<STEER_BUNDLE.v + 1>` (v42 before the merge, v42 after it) and the force in the stable prefix.
- Costs reads `m.tok` steering tokens a turn and `stgBundle().tok` before and after: "46 steering tokens a turn · 1,340 → 1,386" for `prp_01K5RU4A`, "24 · 1,340 → 1,364" for `prp_01K5RX1N`.
- Baseline is `m.measure(s)`, plus "side effects kept on <keptRate> of runs" when the rows carry repeat reads.
- "stable prefix" is fixed. A `may` or `info` proposal would land in the per-prompt selection, and a build says so by force.

### States
Loaded only. On a phone the panel follows Pull request under the left column.

## Open a pull request {#dialog/ctxpr}

The dialog that turns a proposal into a pull request on its `context/<lineage>` branch.

### Purpose
A person confirms the concern, kind, scope and effect, then opens the pull request that runs the six checks.

### Rationale
One concern per pull request, so the dialog shows a callout and offers **Go to** when one is already open. The promoter picks the scope from where the evidence came: all supporting runs on one repository makes a repository record, runs across repositories a workspace record (`docs/mission-control-spec.md` §10.3). A record can never grant authority, so a constraint's effect has two values, `require` and `forbid`, and no third. Merge is the publication. The six checks run the same rules as `stella context validate`: Schema, Lineage uniqueness, `record_hash` recomputation, Secret and PII scan, Conflict against active records, and constraint effect is require or forbid. Those hints and the note moved off the dialog to here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Concern, kind, force | `PROPOSALS[]` | Proposal fields | shipped |
| Supporting evidence | `PRP_META[id].support(s)`, finding id | `support` | partial |
| Open | `ctxprOpen()`, `prRun()` | `open_context_pr` | shipped |

### Logic
- `DLG_EXT.ctxpr(id)` shows the callout "a-intel/platform#519 is already open for this concern." while `S.ctxpr.st` is not `none`.
- Fields restate the proposal. `open_context_pr` takes the proposal id alone, so editing a field changes nothing in the mockup or in the contract.
- Footer: Cancel, and **Go to a-intel/platform#519** when open, **Open the pull request** for the promoter's proposal, or, for any other, a close with the toast "Branch context/<lineage> pushed and a pull request opened on a-intel/platform."
- `ctxprOpen()` sets the Pull requests view, calls `prRun(CTXPR, S.ctxpr, …)` and toasts "Branch context/ctx.release.no-reread-changelog pushed and a-intel/platform#519 opened. 6 checks queued."
- The Constraint effect field shows for every kind. The contract refuses an effect on anything but a constraint.

### States
One state per proposal. On a phone the dialog is a bottom sheet with full-width buttons.
