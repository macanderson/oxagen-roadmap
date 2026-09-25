# Decision trace

| | |
|---|---|
| Route | `#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW`, the bare run path. Old routes that land here: in the app, `/{org}/{ws}/runs/{run}?tab=context`, `policy`, `frames`, `player` and `approvals` (308 to the bare path); in the mockup, `…/runs/{run}/player`, `policy`, `context`, `frames` and `approvals` (rewritten in place by `route()`, `RUN_TAB_ALIAS`) |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D2 (a run is a child of one work order), D4, D5 and D6 (Steering Source and SteeringFrame, the eight frame types, provenance), D8 (the one explanation), D14 (no fork replay, no bisect, no player), D16 (drawers), D17 (future-only marks); the sections Runs (vocabulary), Frame types, Provenance, Exclusion reasons, Decision trace (Sections, Honesty rules, Shipped today) and Work (Rules 2 and 3). `docs/fleet-operations-ia.md` (Run). `docs/tasks-spec.md` §9.6 (the brief is the run's first prompt) |
| Design | `mockups/src/engine.js` → `pRun()` (header, actions, layout), `runRig()`, `runWhere()`, `runSummary()`, `runStatRow()`, `runTabs()`, `pauseBanner()`, `runSide()`, `runOutputs()`, `runTimeline()`, `frameDetail()`; `mockups/src/wedge.js` → `decisionTrace()`, `runEnvelope()`, `resolveEnvelope()`, `envelopeHtml()`, `exclusionsHtml()`, `frameTable()`, `typeStrip()`, `srcCell()`, `runChoices()`, `runPlan()`, `planDiff()`, `runDoubts()`, `openFrame()`, `DLG_EXT.frame`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Runs / Decision trace`: Loaded, Loaded · mobile, and Loaded · future-only fields marked |
| Audit | `run.audit-prompt.md` |

## Job

Say why a run did what it did, from the record alone. The Decision trace is the first tab of every run and the one explanation of it (D8). It lists the SteeringFrames the run received, what was resolved and not delivered, the calls the agent chose and the rule's answer to each, the frames it recorded, the plan versions and the doubts the agent reported where it reported them, and the evidence so far. It adds no inference, no score and no model-written account of why.

A run is a child record of one work order (D2). The page names that work order in its header and its breadcrumb. The other three tabs are specified in `run-transcript.md`, `run-cost.md` and `run-evidence.md`. A run Oxagen holds for an answer renders a different page at the same route: `run-interjection.md`.

## What is on the page

The header, the Summary, the stat row, the tab bar and the side column are shared by all four tabs. This spec owns them. The other three tab specs refer here.

**Shell.** The sidebar with Work lit. The breadcrumb reads Anderson Intelligence Corp. / Core platform / Work orders / `wo_01K5RS7M4N` / `run_01K5RS7M2E8FJ3QW`. Every crumb but the last is a link: the organization, Work (`#/a-intel/core-platform/work`), Work orders (`…/work/orders`) and the work order (`…/work/orders/wo_01K5RS7M4N`). The top bar holds search ("Search or run an action", ⌘K), notifications, the Approvals button (the shield with the organization-wide waiting count, 17 on the demo record; see `approvals-drawer.md`) and the account avatar.

**Header.**

- Eyebrow "Run". The h1 is the run id in mono: `run_01K5RS7M2E8FJ3QW`.
- One row: the compact agent card (avatar, `a-intel.core.release-manager`, "Claude Code · 212 runs 30d · $612.48", a link to the agent), the status dot and word ("live"), the tier badge (`gateway`), the work order chip "work order `wo_01K5RS7M4N`" (a link to the work order, title "The work order this run belongs to", " · direct" after the id on a direct work order), and the task chip "task a-intel/platform#482".
- The rig strip: the harness and its version ("Claude Code 2.1.4"), the model id in mono (`claude-opus-5`), "effort medium" (or "effort not captured"), and one badge per fit reading: "● Model fit" (green) and "● Wrong effort setting" (approval colour). A reading the page could not make draws no badge. The readings are argued on the Cost tab (`run-cost.md`).
- The checkout strip: the repository (`a-intel/platform`, a link to the forge), the branch (`release/4.11.0-notes`, a link to the tree, or to the pull request when the branch is a pull request head; a branch no push was observed for carries "derived"), one chip per pull request the run pushed to ("no pull request" when there is none), and the checkout as a copy button, `mbell-mbp-16:~/src/platform/.worktrees/release-4.11.0-notes`, which carries "derived" when Oxagen holds no enrolled checkout for that repository and branch on that host. Its tooltip says whether the path was recorded or worked out.
- The line "Cut 4.11.0 release notes · started 09:14:02", with " · sealed <time>" once sealed.

**Actions**, by status, with no gold among them:

| Status | Actions, in order |
|---|---|
| live | "❙❙ Pause run" (opens `pause`), "Steer" (opens `steer`), "Cancel" (danger; opens `cancelrun`), "Export" |
| pausing | "❙❙ Pausing…" (disabled), "Steer", "Export" |
| paused | "▶ Resume run", "Steer", "Cancel", "Export" |
| resuming | "▶ Resuming…" (disabled), "Export" |
| sealed or halted | "Export" |

"Export" opens `runexport`. Fork replay and Bisect are gone (D14).

**Pause banner**, while pausing or paused, above the columns: "Pausing" or "Paused" at turn N · step M, then "takes effect at the next boundary" or "by <name> at <time>", and the reason in quotes; a second line "run token held · budget reservation held · pending approvals keep their clocks · nothing new dispatches"; "▶ Resume run" when paused; "Open the pause frame".

**Layout.** A main column of two thirds and a side column of one third (`aside`, aria-label "The work"). The main column holds, in order, the Summary, the stat row, the tab bar and the tab.

**Summary.** Eyebrow "Summary" and the badge "generated · not the record". Who was involved: the agent card ("a-intel.core.release-manager", "Release manager · Claude Code"), "on behalf of →", and the operator ("Marcus Bell", "operator · workspace.owner · core-platform", a link to that operator's spend). The generated prose. The line "generated by claude-haiku-4-5 · turn 7 · regenerated at each turn boundary · read 186 frames · light tier · cost accounted to this run", and "Check it against the frames", which opens the frame dialog on frame 0. The Summary is the one model-written text on the run page. It says what happened, is labelled generated, and never appears inside the Decision trace.

**Stat row**, six boxes with one number and one line each:

| Box | Number | Line |
|---|---|---|
| Tokens | 768,981 | "732,270 in, 36,711 out" |
| Prompts | 2 | "1 corrective"; "one-shot session" at one prompt; the approval colour above two |
| Cost | $4.13 | the basis, `gateway_observed` |
| Wasted | $1.75 | "1 corrective prompt"; the listed waste cause; "nothing bought nothing" at zero; the critical colour above zero |
| Wall clock | 13m 3s | "mostly waiting on a person", "mostly in the model", "mostly in tool calls" or "mostly in harness calls" |
| Cache hit | 83% | "saved about $1.71" |

**Tab bar** (`role=tablist`, aria-label "Run"): "Decision trace" (a dot, title "a call is parked for approval", while a call is parked), "Transcript" with the entry count (38), "Cost" with the cost ($4.13), and "Evidence" with "live" or "sealed". Each tab is a path segment. The Decision trace is the bare path.

### The Decision trace

**Intro.** "**Read from the record.** 186 frames, 1 steering manifest, and the send of `wo_01K5RS7M4N`. Tier `gateway`: calls routed through Oxagen were checked and recorded." The send clause appears only for a dispatched work order. On an `observe` run the sentence ends "recorded, not enforced." A second line: "Oxagen has no access to the model’s hidden reasoning. Thinking a provider returns is in the Transcript, labelled as the provider’s text."

Each section has a number, a heading and one sentence under it.

**1 Envelope.** "53 SteeringFrames reached this run, grouped by where they entered. Select a type to filter." Marked future-only.

- Two meters. "Session-start prefix", "1,102 of 4,096 tok", caption "16 KiB in the signed bundle, header included". "Volatile selection", "415 of 430 tok", caption "picked for this brief under the workspace budget".
- The type strip: one button per frame type present, with its count, in type order: goal 2, invariant 1, constraint 15, procedure 9, context 10, invocation 2, capability 14. A type with no frame is not drawn (this agent holds no mandate, so there is no `delegation`). Each button carries `aria-pressed`. Pressing one filters the Envelope and the Exclusions to that type and adds "Show every type". Pressing it again clears the filter.
- The injection points, in this order. A point with no frame is not drawn. Each point has its name, one caption, and a tally of frames and tokens.

| Point | Caption | Demo tally |
|---|---|---|
| Session start | "the stable prefix, delivered in the signed bundle" | "14 frames · 1,064 tok" |
| Prompt | "the brief the run started with" | "8 frames · 228 tok" |
| Prompt submit | "the volatile selection, picked for this prompt" | "8 frames · 415 tok" |
| Model request | "added at the gateway, between turns" | "1 frame · 22 tok" |
| Checkout files | "synced into the checkout, loaded by the harness" | "9 frames · 9,140 tok" |
| Tool list | "the tool definitions the belt shows the model" | "13 frames · 979 tok" |

- Each point is a table with the columns Type · Frame · Source · Force · Tokens.
  - Type: the frame type badge, whose title is the type's meaning.
  - Frame: the body. A frame a gate backs carries a second line, "enforced by <gate>" (`gate.never-merge`, "decision rule", "mandate", "kill switch"). A capability frame carries no such line.
  - Source: the source kind (Product vision, ADR, Steering record, Policy, Agent definition, Work order, Skill, Memory, Glossary term, Operator steer, Toolbelt, Mandate), the source id as a link to that source, and the source version with the frame's hash as `#` and the first 8 hex digits (`a4c91e2 · #bdec8418`). The hash is marked future-only.
  - Force: `must`, `should`, `may` or `info`.
  - Tokens: the frame's token cost, or "—" when it has none.
- Rows sort by type, then force, then id. A point shows its first 4 rows and "Show all N", then "Show the first 4". Under a type filter every row shows.
- On the demo run: Session start carries a `goal` and a `constraint` from the product vision, an `invariant` and a `procedure` from ADR-021, `constraint` frames from four Steering records, three policy gate notices and ADR-033, and `procedure` frames from the agent definition and ADR-014. Prompt carries the send of `wo_01K5RS7M4N` at `sha256:5d0e81c2`: the `invocation` (the brief, 103 tok), the `goal` "Cut 4.11.0 release notes (a-intel/platform#482)", one `constraint` per definition-of-done item, the repository constraint "Change only a-intel/platform, on branches and pull requests. The production branch is never pushed." and the cap "Spend at most $10.00 across this work order." Prompt submit carries a skill's description line, two memories, ADR and vision context, a Steering record and two glossary terms. Model request carries the operator's steer as an `invocation` ("Skip the mobile repo this cycle; 4.11.0 is platform only.", source Operator steer `cmd_01K5RS7M_10`, version "seq 10"). Checkout files carries five `SKILL.md` procedures, three reference files as `context` and one entrypoint as a `capability` descriptor. Tool list carries one `capability` per tool Oxagen's belt shows the model. A harness's own tools are not frames.

**2 Exclusions.** "23 resolved and not delivered. The same sources, run and budget give the same exclusions." One table with the columns Type · Frame · Source · Reason · Tokens. Frame carries the body, the "enforced by" line where a gate backs it, and the injection point it would have entered. Reason is the reason in mono, from the closed vocabulary, with the numbers that decided it under it. The table shows the first 6 rows and "Show all 23", then "Show the first 6". With nothing excluded it reads "Nothing was excluded."

The closed vocabulary, each badge titled with its meaning: `tier`, `over_budget`, `superseded`, `below_relevance_floor`, `out_of_scope`, `widens_workspace_scope`, `overridden_by_gate`, `steering_drift`, `prefix_overflow`, `duplicate`, `source_unavailable`, `overridden_by_must` and `unapproved_digest`. Every badge but `tier`, `over_budget` and `superseded` is marked future-only. The demo run excludes:

| Reason | Count | What decided it, as the row states it |
|---|---|---|
| `below_relevance_floor` | 4 | "relevance 0 for this brief" |
| `out_of_scope` | 8 | "scoped to a-intel/mobile; this agent works in a-intel/platform", "applies to triage, docs-writer", "no agent holds the tool it gates", "scoped to the agent docs-writer" |
| `over_budget` | 6 | "ranked 11 of 14 for this brief, relevance 2. 25 tok did not fit in the 15 left" |
| `overridden_by_gate` | 2 | the gate's rule, "definition deny_tools: github__delete_*@*" |
| `overridden_by_must` | 1 | "a published must beats recalled memory: ctx.release.never-merge" |
| `superseded` | 1 | "replaced by ctx.platform.safari-e2e-flake, published 2026-09-02" |
| `unapproved_digest` | 1 | "Its digest changed on 2026-09-09 after Priya Natarajan approved 1.3.2. Nobody has approved the new one." |

A withheld skill is excluded before ranking. Its row body reads "Withheld before ranking. The agent is told the count and the reason, never the name." and its tokens read "—".

**3 Choices.** "The belt offered 13 tools from Oxagen, and the harness adds its own. Each call below with the rule's answer." The count is the number of capability frames in the Tool list. One table with the columns At · Call · Answer · Decided by · Frame:

- At: the clock time in mono.
- Call: the tool name in mono, "harness tool" after a harness's own tool, and the call's arguments on a second line.
- Answer: "allowed", "routed to a person" or "denied", as a dot and a word; a "failed" badge beside a call that failed; for a routed call, the approval id and "waiting" under it (`apr_01K5RS3K7 · waiting`).
- Decided by: `rule rg_0088 · pol_v41`, "the bundle's permissions (PreToolUse)" for a harness tool, or "agent tool default".
- Frame: "frame N", which opens the frame dialog, or "—".

`TodoWrite` calls are not rows: they are plan versions in section 5. The demo run lists 11 calls, the last being `github__create_release` "routed to a person" by `rule rg_0093 · pol_v41` at frame 14. With no call in view: "No call is in view for this run. Its frames are in the Transcript."

Under the table, the **Skills** block, marked future-only: "Skills" and the config it resolved, "skills.toml @ skl_v7 (commit a4c91e2)", then one row per skill with a state badge: "synced" (`a-intel.release-notes-from-prs@2.1.0` and `a-intel.rollback-a-bad-release@1.4.2`, "in the checkout"), "withheld" (`a-intel.changelog-bot@1.4.0` and `a-intel.mobile-release-notes@2.0.1`, each with its reason and "The agent was told the count and the reason, never the name.") and "loaded" (`a-intel.release-notes-from-prs@2.1.0`, "09:14:19 · Claude Code read SKILL.md from the checkout after matching its description").

**4 Frames.** "186 recorded, 16 in view. Each opens the frame it names." The Timeline panel: heading "Timeline", "16 frames shown · 186 in the run", and a legend by class with counts (model calls 6, tool calls 3, governance 4, context 1, operator 1, lifecycle 1). Turn bands ("TURN 1", "TURN 2 · AFTER STEER"), one tick per frame (taller for operator frames, approval requests and decisions that route to a person), the marks "steer" and "parked · approval", the axis "09:14:02" to "+49 s · 09:14:51 · live", the foot line, and "2 turns in view". The foot line says every tick is a frame, the taller ones need a person, and a click opens the frame. The mockup's copy still says the click opens it "in the Player"; that word is stale since D14, and a build names the frame dialog. Every tick opens its frame in the frame dialog and shows the frame on hover. Under the panel, the class counts again and "Open the transcript".

**5 Plan changes**, only when the harness recorded a plan. "3 versions, recorded by Claude Code as TodoWrite calls." Marked future-only. One block per version: "Version N" and its time (09:14:10, 09:14:51, 09:15:12), then the items with a state glyph (pending, in progress, completed and struck through). From version 2 on, an item that changed carries a badge: "added", "now completed" or "now in progress".

**6 Self-reported uncertainty**, only when the agent reported a doubt in a structured field. "Quoted from the agent’s own report. Oxagen does not estimate confidence." Marked future-only. One quote per doubt, verbatim ("#481 changes the default decision for unmatched untainted calls to approve. I listed it under Breaking, but I could not confirm whether any existing rule depends on the old default."), with the footer `oxagen__report_status` · 09:15:39 · `rep_01K5RS9Q`.

A run with neither shows one line in their place: "The harness recorded no plan, and the agent reported no uncertainty." The Evidence section keeps the number 7.

**7 Evidence.** "What supports the outcome so far." Four rows:

- Outputs: each durable output and its state ("release/4.11.0-notes created", "RELEASE-4.11.0.md written", "github__create_release awaiting"), or "none recorded".
- Definition of done: "3 of 4 claimed by the agent · 0 accepted by a person", or "none: a direct work order". Marked future-only.
- Approvals: "apr_01K5RS3K7 waiting on a person for github__create_release@2", or "none waiting".
- Record: "186 frames, hash-chained with no gaps · not sealed yet, the run is live", or "· sealed <time>".

"Open Evidence" opens the Evidence tab.

### Side column

Two panels, on every tab.

- **Changes.** Heading "Changes", with a badge for the checks state, or for the pull request's state where no check reported. Rows: Pull request (one link per pull request with its state chip; "none yet, the run is still working"), Base ("main untouched by this run"), Checks (the state chip and each check; "none reported"), Release when one exists ("v4.11.0 · draft" with "pending"), Diff ("+20 −0 in 1 file", or "no file change recorded"). Then one row per changed file with its stat (`release/4.11.0-notes.md` +20 −0) and "Open the diff in the transcript".
- **Outputs.** Eyebrow "Outputs", the tally "3 artifacts · 2 reads · 1 gate", and "Hide reads" (then "Show reads"). One node per thing the run produced, in frame order, each with its glyph, name, state badge, where it landed, a note and an "fr N" chip that opens the frame: the task (`a-intel/platform#482`, "linked"), a read mark ("read CHANGELOG.md, 38 merged pull requests", "read once, never modified · since 4.10.3"), the branch (`release/4.11.0-notes`, "created"), the file (`RELEASE-4.11.0.md`, "written", +118 −0), the gate (`github__create_release`, "awaiting", "Oxagen · rule rg_0093", with "Review the approval" and "the run is stopped here until someone answers"), and the dashed withheld node ("4.11.0 release", "withheld", "not published; main untouched"). More than three durable nodes of one kind in a row fold to the first two and a count. Foot: "In frame order."

### The frame dialog

`openFrame(i)` opens the dialog `frame`. It replaces the player: stepping is reading, and there is no playback, no speed and no transport.

- Title "Frame N · <kind>" and the subtitle "<run id> · <time>".
- Body: the frame's summary line, then the panel for its kind. `policy_decision`: the decision badge ("allow" or "approve"), "decided in 6 ms", "Conditions evaluated" (Condition · Value · Result, captioned "derived from the call and the record, none from prose") and the "Decision" record. `approval_request`: "Parked.", the facts Approval, Call, Rule, Approvers and Waited, and "Approve" and "Deny", which open the `approve` and `deny` dialogs. `control.steer`: "Delivery", the quoted steer, Issuer, Injected into (a link to the `model.request` that carried it) and Digest. `context.assembled`: Budget, Used, Context frames, Assembled by, the table Frame · Kind · Evidence · Tokens · Use, and "Open the steering.manifest frame". `model.request`: Provider · model, Parameters, Tools offered, Context frames, Prompt tokens, "Prompt composition" and "Message stack". `agent_start`: Run, Agent, Operator, Workspace, Task, Policy version and Enforcement tier. A kind with no panel shows its frame hash, `prev_hash`, where its body is kept, and who attested it.
- Footer: "frame i of N shown · 186 in the run", "Previous" and "Next" (disabled at either end), and "Close", the dialog's one gold action.

**Dialogs this page opens:** `frame`, `pause`, `steer`, `cancelrun`, `runexport`, and `approve` or `deny` from a parked approval frame. The shared dialogs:

- `pause`: "Pause this run", what a pause holds, the facts Run, Position and Recorded as, a Reason field the model reads on resume, the note "Pause is not cancel.", and "Cancel" and "Pause at the next boundary".
- `steer`: "Steer this run", a "Steering text" field, Address ("this run", or every live run of this agent), "To steer every live run in the workspace at once, use Steer on the Agents page.", Delivery ("At the boundary" or "Interrupt"; "Interrupt cuts the call in flight at the proxy on the gateway and contained tiers. On the harness tier a steer lands at the next hook boundary."), "Recorded per run as a control.steer frame attributed to you.", and "Cancel" and "Steer".
- `cancelrun`: "Cancel this run?", three lines on what cancel does (the run token is revoked at once, killing the process is best effort, nothing is rolled back), and "Let it run" and "Cancel the run".
- `runexport`: "Export this run", subtitle "segment, attestation, key ids and the verifier", Scope and Format selects, the facts Segment and Seal, and "Cancel" and "Build bundle".

## Data sources

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen (file paths) | Status |
|---|---|---|---|---|
| Run id, status, tier, agent, operator, started, sealed, frame count | `RUNS` (`fixtures/runs.json`) | `get_run` → the run item | `packages/oxagen/src/contracts/run.get.ts:109`; run item `packages/oxagen/src/contracts/run.list.ts:232-428` (`status` 261, `frames` 271, `startedAt` 293, `sealedAt` 299, `enforcementTier` 340, `operatorName` 251) | ✅ |
| Agent card figures | `AGENTS` | `list_agents` | `runs30d` and `spend30d`, `packages/oxagen/src/contracts/agent.list.ts:87`, `:94` | ✅ |
| Work order chip and breadcrumb | `WORKORDERS` (`fixtures/tasks.json`), `fileDirect()` | a `work_order_id` on the run (wedge Open decision 5) | none. The run's only link to work is `taskRef`, `run.list.ts:291`, null for a wrapped run (`packages/handlers/src/run.list.ts:1278`) | ❌ |
| Task chip | `RUNS[].task` | `taskRef` | `run.list.ts:291` (ledger runs only) | 🟡 |
| Rig: harness, model | `AGENTS`, `RUNS[].model` | the run item | `harness` `run.list.ts:410-417`, `model` `:374` | ✅ |
| Rig: effort | `RUNS[].effort` | the run item | `effort` `run.list.ts:380`, as the harness reported it; null for a ledger run | 🟡 |
| Rig: fit badges | `runFit()` over `runMetrics()` | a reading over the run and its cost | no contract. The app computes it: `apps/app/src/features/run/fit.ts` | 🟡 |
| Checkout strip | `RUNGRAPH`, `WORKCOPIES`, `OXPRS`; `runWork()` | `get_run_work` | checkouts, pull requests and machine, `packages/oxagen/src/contracts/run.work.get.ts:15-26`, `:77-109`, `:144-157`. A derived path is the design's; the contract returns recorded checkouts only | 🟡 |
| Pause, resume, steer, cancel | `S.runCtl`, `pauseRun()`, `steerSend` | `dispatch_command` | `packages/oxagen/src/contracts/tacho.command.dispatch.ts:108`, with `commandBlock` and `steerBlock` on the run (`run.list.ts:362`, `:369`). A ledger run fences ingress instead (`ingressPaused`, `ingressRevoked`, `run.list.ts:237-238`) | ✅ |
| Export | `DLG_EXT.runexport` | `export_run`, `get_run_export` | `packages/oxagen/src/contracts/run.export.ts:27`, `run.export.get.ts:39`. It refuses a live run (`run.export.ts:14`) | 🟡 |
| Summary | `RUNS[].summary`, `RUNS[].gen` | `summarize_run`; `summary` on the run | `packages/oxagen/src/contracts/run.summarize.ts:29`; `run.list.ts:98-107`, `:427`. It refuses a live run, so "regenerated at each turn boundary" is future-only | 🟡 |
| Stat row: tokens, cost and basis, cache hit, cache saving | `runMetrics()` | `get_run_cost` | `packages/oxagen/src/contracts/run.cost.ts:124` (tokens, `cacheHitRate`, `cacheSaving` per model); basis `packages/oxagen/src/contracts/spend.shared.ts:13-18` | ✅ |
| Stat row: prompts, wall clock split | `runPrompts()`, `runMetrics()` | the transcript | counted in the app from `get_run_transcript` (`apps/app/src/features/run/metrics.ts`); "corrective" is the design's reading of any prompt after the first | 🟡 |
| Stat row: wasted | `runWaste()` | none | not recorded (`apps/app/src/features/run/stats.tsx` renders it as not recorded) | ❌ |
| Tab counts | `txEntries()`, `RUNS` | `get_run_transcript`, `get_run_cost`, `get_run` | `packages/oxagen/src/contracts/run.transcript.get.ts:397` | ✅ |
| Intro: frames, manifests, tier | `RUNS`, `runFrames()` | `get_run`; `steering.manifest` frames | `steering.manifest` is sealed at SessionStart by a host that advertises `steering_manifest`, `packages/tacho/src/wire.ts:190-200` | 🟡 |
| 1 Envelope: frames by injection point, type, source, version, hash | `SOURCES`, `RECORDS`, `MEMORY`, `ONTOLOGY`, `GATES`, `SKILLS`, `TOOLBELTS`, `STEERING_MANIFESTS`; `resolveEnvelope()` over `assembleSteering()` | `steering.manifest` with frame types and provenance | manifest items carry id, kind, force, tokens, outcome and reason, with no type, scope, source version, hash, body or injection point: `packages/tacho/src/wire.ts:626-697`. Only `record` and `steer` candidates are produced (`packages/handlers/src/lib/tacho-steering.ts:210`, `packages/tacho/src/collector/steering-manifest.ts:38`) | 🟡 |
| 1 Envelope: meters | `assembleSteering().tok`, `STEERING_PREVIEW.budget` | the manifest's budget and spend | `budget_tokens`, `spent_tokens` (`wire.ts:666-677`). The shipped prefix budget is 2,000 tokens (`packages/steering-assembler/src/assemble.ts:93-100`); no volatile selection is delivered | 🟡 |
| 1 Envelope: work order and delegation frames, vision and ADR sources | `WORKORDERS`, `MANDATES`, `SOURCES.documents` | frame types; `.oxagen/sources.toml` | none | ❌ |
| 2 Exclusions: reason | the cut list of `resolveEnvelope()` | the manifest's cut reason | `tier`, `budget` and `superseded` with `superseded_by` (`wire.ts:641`, `:652`); `out_of_scope` and `unapproved_digest` for skills only, outside a run (`packages/oxagen/src/contracts/skill.search.preview.ts:14`, `:46`) | 🟡 |
| 2 Exclusions: the numbers that decided it | `resolveEnvelope()` | the manifest | tokens per item only | ❌ |
| 3 Choices: calls and answers | `TRANSCRIPTS` (tool entries and their `gov`) | `tool_requested`, `policy_decision`, `harness_permission` and approval frames; the transcript's tool verdict | `packages/tacho/src/envelope.ts:67-74` (decisions and sources), `:256-263` (policy facts), `:622-631` (kinds); verdict `run.transcript.get.ts:122-132` | ✅ |
| 3 Choices: Skills block | `SOURCES.resolutions`, `SOURCES.withheld` | `skills.searched`, `skills.resolved`, `skills.loaded` frames | none produced. `preview_skill_search` resolves a config version for a person, outside a run (`skill.search.preview.ts:14`) | ❌ |
| 4 Frames: timeline, class counts, turns | `FRAMES` (`fixtures/frames.json`), `runFrames()` | `get_run`, `get_run_turns` | `run.get.ts:109`; `packages/oxagen/src/contracts/run.turns.get.ts:76` | ✅ |
| Frame dialog | `FRAMES`, `frameDetail()` | `get_run` frames, `get_run_frame_body` | `run.get.ts:65-92` (type, observedAt, digest, summary, body reference); `packages/oxagen/src/contracts/run.frame_body.get.ts:28`. The per-kind panels such as "Conditions evaluated" are not a recorded structure | 🟡 |
| 5 Plan changes | `TRANSCRIPTS` (`TodoWrite` entries with `plan`) | a plan-version frame | `TodoWrite` is an ordinary tool call; `oxagen:task` records Claude Code's task list (`packages/tacho/src/claude-code/hooks.ts:748-764`, `packages/tacho/src/envelope.ts:673`) | 🟡 |
| 6 Self-reported uncertainty | `TRANSCRIPTS` (`oxagen__report_status`) | `report_status` (wedge Open decision 4) | none | ❌ |
| 7 Evidence: outputs | `RUNS[].outputs` | `get_run_outputs` | `packages/oxagen/src/contracts/run.outputs.get.ts:162` | ✅ |
| 7 Evidence: definition of done | `WORKORDERS[].claims` | the work order's claims | none | ❌ |
| 7 Evidence: approvals | `APPROVALS` + `S.ap` | `list_approvals` with `runId` | `packages/oxagen/src/contracts/agent.approval.list.ts:81` | ✅ |
| 7 Evidence: record | `RUNS[].frames` | `get_run_chain` | `packages/oxagen/src/contracts/run.chain.get.ts:146` | ✅ |
| Changes panel | `RUNGRAPH`, `OXPRS`, `REPOS` | `get_run_work` | pull requests with state, CI and diff files, `run.work.get.ts:77-109`. A release row is not in the contract | 🟡 |
| Outputs spine | `RUNS[].outputs` | `get_run_outputs` | kinds `file`, `media`, `change`, `commit`, `pr`, `gate`, `would`, `read` (`run.outputs.get.ts:57-66`). The design's `task`, `branch` and `release` nodes and the `linked` state are not in it | 🟡 |

## Future-only fields

With `?future=1` the design outlines these, each with the reason it gives. A build renders each as not recorded until its contract ships.

| Mark | Reason in the design | What a build shows today |
|---|---|---|
| The work order chip in the header | "work orders" | No chip. The breadcrumb ends Work orders / the run, and the task chip carries `taskRef` where the run has one |
| Section 1 Envelope, whole | "frame types and per-frame provenance" | The `steering.manifest` items as recorded: id, kind, force, tokens, included or cut |
| The `#hash` in every Source cell | "per-frame provenance" | The source id and version only, where the record carries them |
| Exclusion badges other than `tier`, `over_budget` and `superseded` | "steering.manifest records tier, budget and superseded today" | The three recorded reasons. `over_budget` is recorded as `budget` |
| The Skills block in section 3 | "skill resolution frames" | Nothing. The block is absent |
| Section 5 Plan changes | "a plan-version frame" | The `TodoWrite` calls in the Transcript |
| Section 6 Self-reported uncertainty | "report_status" | The section is absent |
| Definition of done in section 7 | "work orders" | The row is absent |

## Functionality

- One resolver builds the Envelope and the Exclusions (`runEnvelope()` calls `resolveEnvelope()`, which calls the assembler), the same one the Compiler and the agent's Steering tab use. For the same sources, agent and brief the three cannot disagree. The trace resolves at the bundle the run started on (bundle 41 on the demo run), so a record merged later is not in what the run received.
- The same source at the same version always yields the same frame, and the same sources, run and budget always give the same exclusions. Each exclusion names its reason and the numbers that decided it.
- The type filter narrows the Envelope and the Exclusions together. "Show all" and "Show the first" open and close one point at a time.
- Every source id links to that source's page: a Steering record, a skill, the vision, an ADR, a memory or a glossary term to `…/steering/sources/{kind}/{id}`, a work order to its page, a toolbelt to Tools › Toolbelts, a policy gate to Tools › Policy, the agent definition to the agent's Source tab. A frame row never renders as its source, and the source page lists the frames it emits (D4).
- "frame N" in Choices, every tick in the Timeline, each "fr N" chip on the Outputs spine and "Check it against the frames" open the frame dialog. "Previous" and "Next" step through the frames in view.
- "Review the approval" on the spine's gate node opens the Decision trace, where Choices names the approval and its frame. The frame dialog of a parked `approval_request` carries "Approve" and "Deny", the same dialogs and the same record as the Approvals drawer.
- Pause, Resume, Steer and Cancel are governed commands. Each writes a control frame on this run (`control.pause`, `control.resume`, `control.steer`); Cancel revokes the run token at once.
- Plan changes appear only when the harness recorded a plan (`TodoWrite`, an `oxagen:task` frame, or a Stella plan event). Oxagen does not rebuild a plan from the agent's prose. Uncertainty appears only when the agent reported it in a structured field. Oxagen does not estimate confidence or read doubt out of prose.
- The intro states the run's tier and what it means: on `gateway` and `contained`, calls routed through Oxagen were checked and recorded; on `observe`, the run was recorded and not enforced.
- The walk W2 (`stop-it-steer-it`) reads the operator's steer here as an `invocation` frame at the model request.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

- The top bar collapses to the hamburger, the current crumb, search, notifications, Approvals and the avatar. The thumb bar holds Work, Agents, Tools, Spend and More, with Work lit on a run. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers.
- The header rows wrap. The checkout chip truncates with an ellipsis and still copies the whole path.
- The two columns stack, main first. The six stat boxes wrap to two per row. The tab bar scrolls sideways with snap, and each tab is 44 px tall.
- Every table becomes a stack of cards with each cell labelled by its column: the Envelope points, Exclusions and Choices. The type strip wraps.
- The frame dialog and every other dialog rise from the bottom as a sheet. The page never scrolls sideways.
- In the mockup the header actions are 40 px tall, and the type buttons, "frame N" links, source links, "Show all" links and "fr N" chips are 17 to 29 px. A build gives each a hit area of at least 44 px.
- The Summary's generated-by line keeps "Check it against the frames" beside it and wraps to one or two words a line in the mockup. A build puts the button under the line on a phone.

## Permissions

- Read: `get_run`, allowed by default to organization Owner, Admin and Member and to workspace Owner and Member (`run.get.ts:121-124`). `get_run_chain`, `get_run_outputs` and `get_run_turns` take the same roles (the turns add organization Billing). `get_run_work` and `list_approvals` leave out the organization Member (`run.work.get.ts:139-142`, `packages/oxagen/src/contracts/agent.approval.list.ts:94-97`). The denied state names `run.read on core-platform`.
- Writes, each a governed action in Audit: `dispatch_command` for pause, resume, cancel and steer (organization Owner and Admin, workspace Owner and Member; `tacho.command.dispatch.ts:122-125`); `resolve_approval` from a parked approval frame (the same roles; `packages/oxagen/src/contracts/agent.approval.resolve.ts:50-53`); `export_run` (organization Owner and Admin, a sealed run only; `run.export.ts:40-43`).

## Backend gaps this page depends on

- Frame types, per-frame provenance (source kind, id, version, hash, injection point, body) and the volatile selection on `steering.manifest`, and a capability that resolves without delivering (#3879).
- The exclusion reasons past `tier`, `budget` and `superseded`, each with the numbers that decided it.
- Candidate adapters for skills, memory, glossary terms, policy notices, instructions, mandates, toolbelts, the vision and ADRs (only `record` and `steer` are produced), and `.oxagen/sources.toml` with its ADR (wedge Open decision 3).
- A `work_order_id` on the run record (wedge Open decision 5) and the work order store behind the chip, the breadcrumb and the definition of done.
- Skill resolution frames: `skills.searched`, `skills.resolved` and `skills.loaded`.
- A plan-version frame from `TodoWrite`, `oxagen:task` and Stella plan events.
- `report_status`, the Oxagen MCP tool an agent calls to report its status and doubts (wedge Open decision 4).
- A summary of a live run, and an export of a live run that carries checkpoints only.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. Section 4 and the frame dialog say frame; sections 1 and 2 say SteeringFrame and frame type.
- A Steering Source and a SteeringFrame are never shown as each other. A frame row links to its source at the version it names, and a source page links back to the frames it emits.
- The trace reads the record. No inference, no score, no model-written account of why. Oxagen has no access to hidden reasoning, and the trace never presents returned thinking as how the model decided. The Summary is labelled generated and stays outside the trace.
- An exclusion names a reason from the closed vocabulary and the numbers that decided it. The same sources, run and budget give the same exclusions.
- Plan changes and self-reported uncertainty appear only when the record holds them, quoted, never estimated.
- No person is scored or ranked.
- Every enforcement claim states the tier. "Enforced" appears only for calls routed through Oxagen. An `observe` run was recorded, not enforced.
- Headers are rollups of the rows beneath them: a point's tally is the sum of its rows, the meters are the sums of their points, the type strip counts the frames in the Envelope, the Exclusions count is its row count, and the tab counts read the same record as the tabs.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. The run page has none of its own; an open dialog's primary is the one.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
