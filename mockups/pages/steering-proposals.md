# Steering › Proposals

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/proposals`. A proposal's review opens in place on the same address. The Pull requests view, `/steering/proposals/prs`, has its own spec, `steering-prs.md` |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D4, D7 (Steering record), D13 (a memory becomes a Steering record only through a proposal); the vocabulary row Proposal; the Steering section Shipped today (proposals and their pull requests ship through `list_proposals`, `get_context_pr`, `open_context_pr` and `merge_context_pr`). `docs/fleet-operations-ia.md` (Steering, Proposals). ADR-061 in `macanderson/oxagen` |
| Design | `mockups/src/wedge.js`: `stgProposalsTab`, inside `pSteering`; `mockups/src/engine.js`: `recordCard`, `prpBadge`, `prpDetail`, `prpStats`, `PRP_SUPPORT`, `PRP_META`, `DLG_EXT.ctxpr`, `ctxprOpen`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs`. Fixture: `mockups/fixtures/proposals.json` |
| States | loaded |
| Storybook | `Oxagen / Steering / Proposals`: Loaded, and Loaded · mobile |
| Audit | `steering-proposals.audit-prompt.md` |

## Job

The way into steering. A proposal is a candidate change to a Steering Source, raised from an agent's memory, a finding, an operator's steer or a person. It steers nothing. It becomes a pull request, and the merge publishes it. This view lists the proposals with the support each one cites, and a review of one proposal shows its record, its evidence, the runs that support it and what publishing it would do.

A proposal argues from runs, and a person decides whether that is enough. There is no threshold and no verdict. Each supporting run carries the outcome the record shows for it, never a grade.

## What is on the page

**Header, tabs and shell.** As `steering.md`, with Proposals selected (15: the proposals plus the open pull requests). The kind filter does not render on this tab. New source keeps the gold in the header.

**The two views.** Under the tabs, a group labelled "Proposals or pull requests" with two buttons carrying `aria-pressed`: **Proposals** 9 and **Pull requests** 6. Beside them: "A proposal becomes a pull request. A merge publishes it." Proposals is `/steering/proposals`; Pull requests is `/steering/proposals/prs` (`steering-prs.md`).

**Proposals** panel.

- Heading "Proposals". Caption: "Candidates from memory, findings, steers and people. A proposal steers nothing until its pull request merges."
- The shared list controls for a card list: Sort (Shown order, Statement A–Z, Statement Z–A), Rows and a pager ("1–9 of 9").
- Each proposal is a record card:
  - Top line: the kind badge (its icon and the kind in capitals), the force, the state badge with a dot, the checks badge where a pull request is open, and **Review**.
  - The statement, as the card's headline.
  - The meta line: "from <source>", the support line, the proposal id, the scope and the lineage.
- State badges: "candidate" (no pull request), "ready for a pull request" (the promoter's proposal before its pull request opens), "open pull request", "published" or "merged". The checks badge reads "6 / 6 checks pass", or the count so far while checks run ("5 / 6 · conflict check running").
- The nine proposals at load:

| Kind and force | State | Statement | From | Support | Lineage |
|---|---|---|---|---|---|
| RULE, should | open pull request, 6 / 6 checks pass | "Do not re-read CHANGELOG.md more than once in a run; cache the first read." | findings job · fnd_01K5RT6C | "682 duplicate tool calls across 212 runs" | `ctx.release.no-reread-changelog` |
| RULE, should | candidate | "Reproduce before labelling; if you cannot reproduce in two steps, open a proposal instead." | reflector · run_01K5RH3G8K5PAS7D | "14 unsatisfied runs in 30 days" | `ctx.triage.reproduce-first` |
| CONSTRAINT, must | open pull request, 5 / 6 · conflict check running | "Migrations run in filename order; never renumber a merged migration." | Marcus Bell | "3 data-layer drift findings" | `ctx.platform.migration-order` |
| RULE, should | open pull request, 6 / 6 pass | "Draft the first reply in the language the ticket was written in." | findings job · fnd_01K5RU9Q | "212 tickets re-routed for language in 30 days" | `ctx.support.reply-in-customers-language` |
| PROCEDURE, must | candidate | "Post the plan and wait for a review comment before any apply call." | reflector · run_01K5RD0D4ADEV8K7 | "3 halted runs, 1 incident" | `ctx.infra.plan-before-apply` |
| PROCEDURE, should | open pull request, 5 / 5 pass | "Backfill in day-sized partitions and verify row counts after each." | Amara Lindqvist | "2 quality-gate failures traced to whole-table backfills" | `ctx.data.backfill-partitions` |
| CONSTRAINT, must | merged, 7 / 7 pass | "No agent may rotate a credential it holds." | Ines Haddad | "policy review 2026-09" | `ctx.sec.never-rotate-own-credential` |
| PREFERENCE, may | candidate | "Campaign briefs are a table of channel, audience, budget and owner." | reflector · 14 runs | "9 briefs rewritten by hand" | `ctx.growth.brief-as-table` |
| FACT, info | open pull request, 4 / 4 pass | "The production branch of a-intel/mobile is release, not main." | reflector · run_01K5RMYJ6V9CRJM9 | "4 runs targeted main" | `ctx.mobile.release-branch` |

The mockup's third proposal reads "open Context PR" in its state badge; the product word is "open pull request". Every Steering record pull request runs the same six checks, so a checks badge counts out of six; the fixture's "5 / 5", "7 / 7" and "4 / 4" are not a design.

**A proposal's review.** Review replaces the list with one proposal (`prp_01K5RU4A` below). **All proposals** returns to the list.

- A row: **All proposals**, the lineage in mono, and the state badges at the right.
- Three tiles:
  - **Supporting runs**: 212, "sealed runs, from the rows below". A person's proposal reads "proposed by a person".
  - **Distinct agents**: 1, "from the rows below".
  - **Confidence**: 0.97, "the promoter's own estimate; a person decides". A person's proposal shows **Checks** instead, "apply", "the same six as any record".
- Left column:
  - **Proposed record**, with the proposal id as a badge: the record card with "steers nothing yet" and "from findings job · fnd_01K5RT6C".
  - **Promoter evidence**: the rationale in prose. For `prp_01K5RU4A` it says the release manager read CHANGELOG.md with an identical input digest 682 times beyond the first read across 212 sealed runs, that every repeat returned the first read's response digest, and that a rule to cache the first read changes the behaviour without editing the brief.
  - **Supporting runs**, with the support line as its badge ("682 duplicate tool calls across 212 runs"). The shared list controls, with an Outcome filter. Columns, in order: Run (the run id, with the agent and the date under it), Frame ("seq 31"), Outcome (a dot and a word) and Record (the record id, with its kind and repeat count under it: "observation · repeat read ×3").
- Right column:
  - **Pull request**: Target ("a-intel/platform"), Branch ("context/ctx.release.no-reread-changelog"), File (".oxagen/rules/ctx.release.no-reread-changelog.toml") and Governance ("team · a code-owner review is required"). Under them the action:
    - **Open a pull request** (gold) while the proposal has none, which opens `ctxpr`;
    - **Open a-intel/platform#519** (plain) once it is open, or **Merged in a-intel/platform#519** once merged, which opens the Pull requests view;
    - for another proposal with a pull request, its number and checks in mono ("a-intel/platform#520 · 5 / 6 · conflict check running");
    - a disabled **Open a pull request** for a candidate the design gives no path yet.
  - **If it publishes**: Reaches ("every run in core-platform on a-intel/platform, from its next model call"), As ("compiled steering in bundle v42, should in the stable prefix"), Costs ("46 steering tokens a turn · 1,340 → 1,386"), Baseline ("3.2 repeat reads a run · 1,977,800 tokens re-entered the window over these 212 runs · side effects kept on 67% of runs") and Read back as ("every run that renders it cites the record in its context frame, so the Run page shows where it landed").

**Outcome** is what the record shows for that run: `kept`, `reverted`, `no change` or `halted`, as a dot and a word. It is never a verdict. The mockup's third supporting run reads "failing", which is not one of the four; a build shows the recorded outcome in the four words.

### Dialog

**`ctxpr`**, "Open a pull request", subtitle "<lineage> · <proposal id>".

- While a pull request is already open for the proposal, a callout first: "a-intel/platform#519 is already open for this concern. One concern, one pull request."
- Fields: Concern (the statement, with the hint "One concern per pull request."), Kind (the promoter's kind first, then the six kinds, each with a short description), Scope (workspace, which opens on a-intel/platform, or repository, which opens on the linked repository; the hint "The promoter picks the scope from where the evidence came."), Constraint effect (forbid or require; the hint "A record can never grant authority. These are the only two values.") and Supporting evidence (the support line and the finding id).
- A note: "Merge is the publication. The 6 checks run the same rules as stella context validate: Schema, Lineage uniqueness, record_hash recomputation, Secret and PII scan, Conflict against active records, constraint_effect ∈ {require, forbid}."
- Footer: Cancel and **Open the pull request** (gold), or **Go to a-intel/platform#519** when one is open. Opening pushes the branch, opens the pull request, queues the six checks, and moves to the Pull requests view with it selected: "Branch context/ctx.release.no-reread-changelog pushed and a-intel/platform#519 opened. 6 checks queued."
- The mockup's Kind and Scope options join each value to its description with a dash; the build writes them as "rule: a directive that steers behaviour". The Constraint effect field applies to a constraint only (the contract refuses an effect on any other kind).

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in `macanderson/oxagen` | Status |
|---|---|---|---|---|
| The proposals | `PROPOSALS` (`fixtures/proposals.json` and six more added in `engine.js`) | `agent.context_proposals` | `list_proposals` returns id, lineage, kind, force, constraint effect, scope, statement, rationale, source, support, status, pull request and checks (`packages/oxagen/src/contracts/context.proposal.list.ts:12`, `context.steering.shared.ts:207-246`) | ✅ |
| State badge | `PROPOSALS[].state`, `prpBadge()` | The proposal's status | `status`: proposed, pr_open, checks_running, checks_passed, checks_failed, merged or rejected (`context.steering.shared.ts:57-65`) | ✅ |
| Checks badge | `PROPOSALS[].checks`, `S.ctxpr` | Passed of six | `checks` `{ passed, total }` (`context.steering.shared.ts:239-241`) | ✅ |
| "from <source>" | `PROPOSALS[].from` | Who raised it | `source` (`context.proposal.create.ts:41`) | ✅ |
| Support line ("682 duplicate tool calls across 212 runs") | `PRP_META[].support` over `PRP_SUPPORT` | A measure over the supporting runs | `support` carries run ids, agent keys, record ids and evidence links (`context.steering.shared.ts:193-204`); the counts derive from them, the measure does not (#3881) | 🟡 |
| Tiles: Supporting runs and Distinct agents | `prpStats()` | Counts of the support | `support.runs` and `support.agents` | ✅ |
| Tile: Confidence | `PRP_META[].confidence` | The promoter's estimate | None. ADR-061 records that the promoter and the reflector are not built (#3881) | ❌ |
| Promoter evidence | `PRP_META[].rationale` | The proposal's rationale | `rationale` | ✅ |
| Supporting runs: Run | `PRP_SUPPORT[].run` | The runs the proposal cites | `support.runs` | ✅ |
| Supporting runs: agent, date, Frame, Outcome and Record kind | `PRP_SUPPORT[]` | Each cited run's terminal status, citing frame and record | None. Evidence links may carry `frame:<run>/<seq>` refs, but no read joins a run's outcome (#3881) | ❌ |
| Pull request panel: Target, Branch, File, Governance | `CTXPR`, `wsGov()` | The pull request the proposal opens | `get_context_pr` returns the repository, branch, path, governance mode and who may merge (`context.pr.get.ts:9`, `context.pr.open.ts:27-94`) | ✅ |
| Open a pull request | `DLG_EXT.ctxpr`, `ctxprOpen()` | Push `context/<lineage>`, open the pull request, run the six checks | `open_context_pr` (`context.pr.open.ts:96`). It takes the proposal id only (`:113-117`); the dialog's fields restate the proposal and change nothing in it | ✅ |
| If it publishes: Reaches and As | `PRP_META`, `stgBundle()` | Scope, force and the next steering version | The scope and force ship with the proposal; `get_context_pr` `onMerge.bundleVersion` gives the version after the merge (`context.pr.open.ts:68-80`) | ✅ |
| If it publishes: Costs and Baseline | `PRP_META[].tok`, `measure()` | Tokens a turn, before and after, and the baseline measure | None | ❌ |
| The authors "the promoter", "findings job" and "reflector" | `PROPOSALS[].from` | Jobs that raise proposals from runs and findings | None of the jobs is built (ADR-061). A proposal today comes from `propose_record` (`context.proposal.create.ts:12`) or an agent's `record_proposal` append (`append_record`, `context.records.append.ts:28`) | ❌ |

## Future-only fields

The mockup marks no field on this view with `data-future`, and the catalog gives it no future-only story. These fields are future-only in `macanderson/oxagen` all the same, and a build renders each as not recorded until its contract ships: the support measure in each support line, the Confidence tile, the supporting runs' agent, date, frame, outcome and record kind, the Costs and Baseline rows, and every proposal the promoter, a findings job or the reflector would raise.

## Functionality

- The list is the workspace's proposals, newest first. A build lists this workspace's proposals only; the mockup's list is organization-wide and shows proposals whose pull requests target other workspaces' repositories (`a-intel/support-console#188`, `a-intel/data-platform#341`, `a-intel/security-tools#77`, `a-intel/mobile#96`).
- A proposal steers nothing. It is not in Sources, not in any envelope, and not in the compiled bundle until its pull request merges.
- Review opens the proposal in place; All proposals returns to the list.
- The tiles derive from the rows beneath them: Supporting runs is the row count, and Distinct agents is the distinct agents in the rows.
- Open a pull request is offered only while the proposal has none, because one concern has one pull request. Opening it pushes `context/<lineage>` with the one record file, opens the pull request, and queues the six checks. The view then shows the pull request on Pull requests.
- A memory reaches a Steering record only through a proposal (D13). Propose as a Steering record on a memory's page ends here.
- A person's proposal and the promoter's go through the same six checks and the same merge.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with More lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The four tabs are one strip that scrolls sideways with Proposals in view. The two view buttons and their line wrap. Each record card stacks its badges over the statement and wraps its meta line. In a review, the three tiles wrap, the two columns stack with the proposed record first, and the Supporting runs table becomes labelled cards. The dialog rises from the bottom edge as a sheet with full-width footer buttons. Nothing scrolls sideways; touch targets are at least 44 px and inputs are 16 px.

## Permissions

- Read: the Steering read, `steering.read on core-platform` in the mockup's denied panel. `list_proposals` and `get_context_pr` allow an organization Owner or Admin and a workspace Owner, Member or Viewer.
- Writes, each a governed action recorded in Audit:
  - Open a pull request: `open_context_pr`, an organization Owner or Admin, or a workspace Owner or Member. An agent that calls it waits for approval.
  - Raise a proposal: `propose_record`, the same roles.
  - Dismiss a proposal: `dismiss_proposal`, an organization Owner or Admin, or a workspace Owner. It ships, and this view has no control for it.

## Backend gaps this page depends on

- The support measure, each cited run's outcome, citing frame and record, and the promoter's confidence (#3881).
- The promoter, the findings job and the reflector that raise proposals from runs (ADR-061).
- The steering tokens a turn before and after a merge, and the baseline measure.

## Rules every build of this page must keep

- A proposal steers nothing until its pull request merges, and nothing on the view says otherwise.
- A supporting run carries an outcome, never a verdict, a proof or a grade. There is no threshold.
- No person is scored or ranked. "from Marcus Bell" names who raised a proposal and weighs nothing.
- A Steering Source and a SteeringFrame are never shown as each other, and a frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- Every enforcement claim states the tier. "Enforced" only for calls routed through Oxagen.
- Headers are rollups of the rows beneath them: the Proposals count is the cards, the Pull requests count is the open pull requests, and the tiles are the supporting runs.
- The vocabulary holds: Steering record and pull request. No "context record" and no "Context PR" in the view's copy.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing; the mockup's two-sentence caption under Proposals is a design defect, not a pattern to copy.
- Exactly one gold action per screen. New source holds it in the header; while the promoter's proposal has no pull request, its review offers Open a pull request as gold too, and a build gives that screen one gold only.
- A future-only field renders as not recorded in a build until its contract ships.
