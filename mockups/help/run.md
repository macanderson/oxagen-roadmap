<!-- run: the Decision trace tab and the parts every run tab shares -->

## Page header {#run/header}

The header names the run, who ran it, what it ran on, where its work landed, and the actions its status allows.

### Purpose
You land here from a work order, an approval, a finding or a link, and the first question is which run this is and whether it is still moving. The header answers that on every tab: the run id, the agent and its status, the tier the record was kept at, and the work order the run belongs to. The actions on the right are the only controls on the page that change the run itself.

### Rationale
A run is a child record of exactly one work order (D2), so the header carries a work order chip and the breadcrumb ends with the work order and the run. A run started outside Oxagen still gets one: Oxagen files it under a direct work order and the chip reads " · direct". The rig strip exists because the model an agent runs on is the largest lever on what a run costs, and a person reading a run should see the model and the effort setting next to the fit reading that argues about them. The checkout strip exists because a person reading a sealed run needs to walk to the files. The path is a fact about the run. Fork replay and Bisect used to sit in the actions. D14 cut them, so Export is the one action every status keeps.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Run id, status, tier, started, sealed | `RUNS` (`fixtures/runs.json`), `runStatus()` over `S.runCtl` | `get_run`, `run.list.ts:261`, `:293`, `:299`, `:340` | live |
| Agent card | `AGENTS`, `agentCard()` | `list_agents` (`runs30d`, `spend30d`) | live |
| Work order chip | `WORKORDERS`, `runParent()`, `fileDirect()` | a `work_order_id` on the run (wedge Open decision 5) | none |
| Task chip | `RUNS[].task` | `taskRef`, `run.list.ts:291` | partial |
| Harness, model | `AGENTS[].harnessLabel`, `RUNS[].model` | the run item, `run.list.ts:374`, `:410-417` | live |
| Effort | `runEffort()` over `RUNS[].effort` | `effort`, `run.list.ts:380` | partial |
| Fit badges | `runFit()` over `runMetrics()` | no contract, computed in `apps/app/src/features/run/fit.ts` | partial |
| Repository, branch, pull requests, checkout | `runWork()` over `RUNGRAPH`, `WORKCOPIES`, `OXPRS` | `get_run_work`, `run.work.get.ts:15-26`, `:77-109` | partial |
| Actions | `pRun()`, `S.runCtl` | `dispatch_command`, `export_run` | live |

### Logic
1. `pRun()` builds the header. The eyebrow reads "Run" and the h1 is the run id in mono.
2. The first row holds `agentCard()` in its compact layout, `statusBadge(runStatus(R))`, `tierBadge(R.tier)`, the work order chip from `runParent()` and the task chip. A run with no task shows "No linked task".
3. `runRig()` draws the harness and its version, the model id, and "effort" with the recorded value. `runEffort()` reports "model default" when a gateway-tier run sent no effort setting, and "not captured" when the model call never passed through Oxagen, because Oxagen reads effort from the request body. `fitBadge()` draws a green badge for a fit and an approval-coloured badge for a heavier or lighter model or effort than the run needed. A reading the page could not make draws nothing. The Cost tab argues each reading in full.
4. `runWhere()` draws the repository, the branch and one chip per pull request from `runPrs()`, or "no pull request". `runBranch()` reads the branch from the run graph and falls back to `agents/<slug>/<issue>`, marked "derived". `runWork()` finds an enrolled checkout for that repository on the agent's host. When the branch differs from the checkout's branch, the path points into a worktree under `.worktrees/`. The copy button's tooltip says whether Oxagen recorded the path, worked it out from an enrolled checkout, or worked it out from the repository name alone. `copyPath()` shows the path in a toast when the browser refuses the clipboard.
5. The actions follow `runStatus()`: live shows Pause run, Steer, Cancel and Export. Pausing shows a disabled Pausing and Steer. Paused shows Resume run, Steer and Cancel. Resuming shows a disabled Resuming. Sealed and halted runs show Export only. Pause opens `pause`, Steer calls `openSteer()`, Cancel opens `cancelrun`, Export opens `runexport`, and Resume calls `resumeRun()`, which writes a `control.resume` frame. No header action is gold.

### States
Loaded only in this design. Loading, error and denied replace the page body with the shell's standard panels, and the denied panel names `run.read on core-platform`. On a phone the header rows wrap, the checkout chip truncates with an ellipsis and still copies the whole path, and a build gives each action a 44 px target. The held run `run_01K6QW3D5N7TYBA2` renders its own header (see `run-interjection`).

## Summary

The Summary is the one model-written paragraph on the run page, labelled as generated and set above the record it summarizes.

### Purpose
You want the gist before you read the trace: what the run set out to do, how far it got, and what it is waiting on. The Summary gives that in a few sentences, names who acted and on whose behalf, and hands you a button to check it against the frames.

### Rationale
The Decision trace adds no model-written account of why (D8, honesty rule 1). A reader still needs a plain-language gist, so the page keeps one generated paragraph and fences it off: it sits outside the trace, carries the badge "generated · not the record", and names the model and the frames it read. The badge breaks the label rule with its mid-dot and contrast. It is the honesty label the app ships (`apps/app/messages/run.json:948`), and the page spec keeps that conflict open. "Check it against the frames" exists so the claim can be tested in one click, not taken on trust.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Prose | `RUNS[].summary` | `summary` on the run, `summarize_run` (`run.summarize.ts:29`) | partial |
| Model, when, frame count | `RUNS[].gen` | `run.list.ts:98-107` | partial |
| Agent and operator | `involved()` over `AGENTS`, `PEOPLE` | `get_run` (`operatorName`, `run.list.ts:251`) | live |

### Logic
1. `runSummary()` returns nothing when the run has no summary.
2. `involved()` draws the compact agent card with the agent's name, "on behalf of →", and the operator with their role. The operator links to that person's spend through `spendGo('operator', …)`.
3. The generation line reads "Summary by <model> <when> · from <N> frames · cost included in this run" from `R.gen`. On the demo run it says the summary is regenerated at each turn boundary.
4. "Check it against the frames" calls `openFrame(0)`, which opens the frame dialog on the first frame in view.
5. The cost of generating the summary is counted in the run's own cost, so the Cost tile already includes it.

### States
A run without a summary shows no Summary section, and the stat row moves up. `summarize_run` refuses a live run today, so a build shows the summary only once a run seals until a live summary ships. On a phone the generation line wraps, and a build puts the button under the line.

## Stat row {#run/tiles}

Six tiles give the run's size and cost in one row: tokens, prompts, cost, unproductive spend, wall clock and cache hit.

### Purpose
You want to know in two seconds whether this run was cheap or dear, quick or slow, and whether it needed correcting. Each tile answers one of those with one number and one line, and the Cost tab holds the detail behind every one.

### Rationale
The row replaced a wider instrument strip at the top of the run. Six numbers read at a glance, and each is a rollup of something the tabs show in full, so the two can never disagree (`runMetrics()` is the one derivation behind every number). Prompts sits beside Cost because a follow-up prompt is a correction: it fixes or fills what the first prompt left out, so the count is a wasted-spend cause and a coaching signal for the operator's own brief. Unproductive spend is shown even though no contract records it, because it is the number an operator acts on.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tokens in and out | `runMetrics()` | `get_run_cost` (`run.cost.ts:124`) | live |
| Prompts | `runPrompts()` over `txEntries()` | counted from `get_run_transcript` | partial |
| Cost and basis | `RUNS[].cost`, `RUNS[].basis`, `basisChip()` | `get_run_cost`, `spend.shared.ts:13-18` | live |
| Unproductive | `runWaste()` over `SPEND.wasteRunsList` | none | none |
| Wall clock split | `runMetrics()` (`modelMs`, `toolMs`, `waitMs`, `overMs`) | counted from the transcript | partial |
| Cache hit and saving | `RUNS[].cache`, `runSeries().saved` | `get_run_cost` (`cacheHitRate`, `cacheSaving`) | live |

### Logic
1. `runStatRow()` draws six `.stat` tiles in a fixed order: Tokens, Prompts, Cost, Unproductive, Wall clock, Cache hit.
2. Tokens is `tokIn + tokOut`. `runMetrics()` derives tokens from cost at the effective input price the Cost tab publishes, so tokens and cost agree.
3. Prompts is `R.prompts` when the record states it, else the count of `prompt` and `steer` entries in the transcript, at least 1. The line reads "No follow-up prompts" at one and "<N> follow-up prompts" above it. Above two prompts the number takes the approval colour.
4. Cost shows `usd(R.cost)` and the basis chip, "Observed by gateway" or "Reported by harness".
5. Unproductive is the listed waste for this run plus the corrective share: with `p` prompts, `cost × (p − 1)/p × 0.55`. Above zero the number takes the critical colour. The line names the follow-up prompts, the listed waste cause, or "None".
6. Wall clock is `msDur(m.wall)`. The line names the largest share: waiting on a person, the model, tool calls or the harness.
7. Cache hit is `R.cache`, and the line gives the saving against no cache.

### States
On a phone the tiles wrap two per row. A run from the generator with no authored frames uses the seeded derivation, so its numbers stay stable across renders.

## Tab bar {#run/tabs}

The tab bar switches between the five views of one run: Decision trace, Transcript, Cost, Memories and Evidence.

### Purpose
You move from why the run acted, to what it said, to what it cost, to what it left behind, to what proves its outcome. Each tab carries a count so you know what is behind it before you open it.

### Rationale
The Decision trace is first because it is the one explanation of a run (D8). It absorbed the old Context, Policy and Governed actions tabs, and Evidence absorbed the Issues and Chain and seal tabs. The player tab is gone with the replay interface (D14). Old addresses still land somewhere sensible, so a link someone saved last month does not break. Each tab is a path segment so reloading keeps your place and a link can point at one tab.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Transcript count | `txEntries()` | `get_run_transcript` (`run.transcript.get.ts:397`) | live |
| Cost | `RUNS[].cost` | `get_run_cost` | live |
| Memories count | `runMemories()` over `MEMORY` | none: `list_memories` has no run filter | none |
| Evidence word | `RUNS[].sealed` | `get_run` | live |
| Parked dot | `FRAMES` (`policy_decision` that routes to a person) | `policy_decision` and approval frames | live |

### Logic
1. `runTabs()` draws a `role=tablist` labelled "Run", with `aria-selected` on the current tab.
2. `runTabKey()` reads `S.tab.run`. An old id maps through `RUN_TAB_ALIAS`: `player`, `policy`, `context`, `frames` and `approvals` land on the trace, and `issues`, `chain`, `proof`, `dod` and `ladder` land on Evidence. Anything else lands on the trace.
3. The Decision trace carries a dot, titled "A call is parked for approval", while any `policy_decision` frame in view routes a call to a person.
4. Transcript shows the entry count, Cost the run's cost, Memories the number of memories the run wrote (blank at zero), and Evidence "live" or "sealed".
5. `runTab()` writes the tab into the hash: the trace is the bare run path, and each other tab is `/transcript`, `/cost`, `/memory` or `/evidence`.

### States
On a phone the bar scrolls sideways with snap, and each tab is 44 px tall.

## Pause banner

The pause banner says a pause is pending or in force, where the run stopped, who paused it and why.

### Purpose
A paused run looks like a quiet run. The banner makes the pause impossible to miss, gives you the reason in the operator's words, and puts Resume and the pause frame one click away.

### Rationale
A pause is a governed action, not a process signal. It takes effect at the next boundary: the model call or tool call in flight completes, and nothing new is dispatched. The run keeps its run token and its budget reservation, and any pending approval keeps counting down against its timeout. Nothing new starts until someone resumes. A pause is recorded as a `control.pause` frame attributed to the operator, so the gap is visible in the chain and the receipts. The banner used to repeat that in a second line. It now lives here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Status, turn, step, who, when, reason | `S.runCtl[runId]` written by `pauseRun()` | `dispatch_command` (`tacho.command.dispatch.ts:108`), `commandBlock` on the run (`run.list.ts:362`) | live |
| The pause frame | `FRAMES` (`control.pause`) | `get_run` frames | live |

### Logic
1. `pauseBanner()` returns nothing unless `S.runCtl[R.id]` exists and is not resuming.
2. While pausing it reads "Pausing at turn N · step M · takes effect at the next checkpoint". `pauseRun()` flips it to paused after the boundary, stamps the time, and appends a `control.pause` frame.
3. While paused it reads "Paused at turn N · step M · by <name> at <time>", with the reason in quotes, and shows "▶ Resume run".
4. "Open the pause frame" opens the frame dialog on the last frame, the `control.pause` frame.
5. `resumeRun()` sets resuming, writes a `control.resume` frame whose reason reaches the model, and removes the banner.

### States
It appears only on a pausing or paused run, above both columns, on every tab. A build gives each button a 44 px target on a phone.

## Changes

The Changes panel shows what the run did to the repository: its pull request, the base branch, the checks, any release, and the diff.

### Purpose
You want to know whether the run touched anything a person has to review, and whether the production branch is safe. This panel answers both on every tab, and "Open the diff in the transcript" takes you to the edits themselves.

### Rationale
The right column keeps the repository panel and the outputs on every tab (`fleet-operations-ia.md`, Run). The panel reads pull requests the same way the header's checkout strip does, through `runWork()`, so the two can never disagree. A run that pushed to a pull request head has a pull request whether or not it opened it. The Base row states that the base branch is untouched because "No agent merges to main" is an invariant, and this is where a reader checks it held.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Pull requests and state | `runWork().prs` over `RUNGRAPH`, `OXPRS` | `get_run_work`, `run.work.get.ts:77-109` | partial |
| Base branch | `REPOS[].branch` | the repository's production branch | live |
| Checks | `R.outputs` of kind `check` | `get_run_work` (CI) | partial |
| Release | `runGraphOf(R).artifacts` of kind `release` | none in the contract | none |
| Diff and files | `runGraphOf(R).files`, `runMetrics()` (`add`, `del`) | `get_run_work` diff files | partial |

### Logic
1. `runSide()` builds the panel. The heading badge shows the checks state, or the first pull request's state when no check reported.
2. Pull request lists each pull request with its state chip, or "none yet", with ", the run is still working" on a live run.
3. Base names the repository's production branch and "untouched by this run".
4. Checks is passed when every check passed, failing when any failed or is blocked, and pending otherwise, followed by each check and its state. No check reads "none reported".
5. A Release row appears only when the run graph holds a release.
6. Diff sums additions and deletions over `txDiffRows()` for each file. Each file follows with its own stat.
7. "Open the diff in the transcript" calls `runTab('transcript')`.

### States
On a phone the columns stack and this panel follows the main column. A run with no file change reads "no file change recorded" and shows no file list.

## Outputs

The outputs spine lists what the run produced, in the order it produced it, with the state of each and the frame that produced it.

### Purpose
You want to know what this run left in the world: a branch, a file, a comment, a release held at a gate. The spine tells that as a short story, so the pending approval on a live run reads as the most important thing about its outputs.

### Rationale
The organising principle is time, decided on 2026-09-17 (`design/run-outputs/DECISION.md`, feedback item 7). Outputs read in frame order: read, wrote, cut a branch, then the gate the run is parked on, then what it would do next, then the seal. Disposition is the state badge on each node and artifact kind is its glyph, so neither competes with the order. A gate is a node at the position it stopped the run, because that position is the fact. Reads never get a node. They are quiet marks on the spine, which stops "CHANGELOG.md · read once" reading like a change. Gold is identity and never a state, so no badge here is gold.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Nodes | `R.outputs` (`fixtures/runs.json`), else `roDerive()` over `R.touched` | `get_run_outputs` (`run.outputs.get.ts:162`) | partial |
| Kinds | `RO_ICON` | `file`, `media`, `change`, `commit`, `pr`, `gate`, `would`, `read` (`run.outputs.get.ts:57-66`) | partial |
| Frame links | `n.fr` | the producing frame | live |

### Logic
1. `roNodes()` reads `R.outputs`. A generated run carries only `R.touched`, so `roDerive()` rebuilds nodes from it and adds a gate on a parked run and a seal on a sealed one.
2. The tally counts durable nodes (`roDurable()` excludes read, task, would, seal and halt), reads and gates.
3. `roGroup()` groups consecutive nodes of one kind. More than three in a row fold to the first two and "N more … items". "fold these back" reopens the fold.
4. A run of reads becomes one mark, "read <names>", with "and N more". "Hide reads" and "Show reads" toggle every read mark through `roToggleReads()`.
5. Each node shows its glyph, name, state badge from `RO_STATE`, diff stat, "Frame N" (`openFrame()`), where it landed and a note.
6. A gate node adds "Review the approval", which opens the Decision trace, and the line "the run is stopped here until someone answers". A `would` node is dashed.
7. The spine carries no caption. Its order is frame order, and the "Frame N" chips show it.
8. A node's note is record data from `R.outputs[].note`. The gate note says where the call is parked: "parked at oxagen, on a call routed through it". While the call waits, the model sees a wait with a reason, not a failure. A seal on a `harness` tier run reads "harness tier · reported by the harness": its outputs come from what the harness reported, and Oxagen did not observe them at the gateway.

### States
A run with no node shows no section. A live or parked run draws the spine as live. The halted run shows a blocked "hooks removed" node.

## Trace record

The line at the top of the Decision trace says what the trace was read from: the frame count, the steering manifests, the work order's send, and the run's tier.

### Purpose
Before you read seven sections of evidence, you want to know how much record there is and how far to trust its enforcement claims. This line gives the size of the record and the tier it was kept at.

### Rationale
The Decision trace is the one explanation of a run, and it reads the record and adds nothing to it (D8). It adds no inference, no score and no model-written account of why. Every enforcement claim states the run's tier (honesty rule 6). On `gateway` and `contained`, calls routed through Oxagen were checked and recorded. On `observe`, the run was recorded and not enforced. Oxagen has no access to the model's hidden reasoning (honesty rule 2). Thinking text a provider returns is in the Transcript, labelled as the provider's text, and the trace never presents it as how the model decided. The page used to say both of these in the intro. The tier badge carries the tier, and the explanation lives here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Frame count | `RUNS[].frames` | `get_run` | live |
| Steering manifests | `runFrames()` (`steering.manifest`, `context.assembled`) | `steering.manifest` frames (`wire.ts:190-200`) | partial |
| Work order send | `runParent()` (dispatched only) | the work order's send | none |
| Tier | `RUNS[].tier`, `tierBadge()` | `enforcementTier` (`run.list.ts:340`) | live |

### Logic
1. `decisionTrace()` counts `steering.manifest` and `context.assembled` frames in view, at least 1.
2. The send clause, "and the send of `wo_…`", appears only for a dispatched work order. A direct work order has no send.
3. The tier badge is the recorded tier, never the tier the adapter supports.

### States
The line is the same on every run status. On the halted run it reads "14 frames, 1 steering manifest. Tier gateway."

## Envelope

Section 1 lists every SteeringFrame the run received, grouped by where it entered and filterable by type.

### Purpose
You want to know what the agent was told before it acted: its goals, the invariants it could not relax, the constraints of this work order, the procedures and context it received, and the tools it was offered. The Envelope shows each input with its source, the source version and its hash, so you can walk from any frame to the file or record that produced it.

### Rationale
A Steering Source and a SteeringFrame are two objects and never collapse (D4). Every runtime input is a SteeringFrame of one of eight types (D5), and every frame carries its source, the source version and a hash (D6). The Envelope groups frames by injection point, because where a frame entered decides whether it was cached, cut first or never cut. Type says what the frame is for, and force (`must`, `should`, `may`, `info`, ADR-093) decides between the prefix and the volatile selection. The same resolver builds the Compiler, the agent's Steering tab and this section, so for the same sources, agent and brief the three cannot disagree. The trace resolves at the bundle the run started on, bundle 41 on the demo run, so a record merged later is not in what the run received. The section used to add ", by where they entered" under its heading. The grouping shows it.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Frames by point, type, source, version, hash | `runEnvelope()` → `resolveEnvelope()` over `assembleSteering()`, `SOURCES`, `RECORDS`, `MEMORY`, `ONTOLOGY`, `GATES`, `SKILLS`, `TOOLBELTS`, `STEERING_MANIFESTS` | `steering.manifest` with frame types and provenance (`wire.ts:626-697`) | partial |
| Meters | `E.prefixTok`, `E.volatileTok`, the bundle's budget | `budget_tokens`, `spent_tokens` (`wire.ts:666-677`) | partial |
| Work order and delegation frames, vision and ADR sources | `woFrames()`, `MANDATES`, `SOURCES.documents` | frame types, `.oxagen/sources.toml` | none |

### Logic
1. `runEnvelope()` passes the agent, the work order's sent brief (or the task title), the repository, the work order, the run's steers (`runSteers()`) and the bundle version to `resolveEnvelope()`.
2. The heading line is `ftLead()`: "53 SteeringFrames reached this run", or "N <type> of 53 SteeringFrames" under a filter.
3. Two meters: Session-start prefix is the Session start rows plus the bundle's 38-token compile header, against a cap of 16 KiB at the bytes-per-token rate. Per-prompt selection is the Prompt submit rows against the workspace's volatile budget.
4. `typeStrip()` draws one button per type present, in type order, with `aria-pressed`. `dtType()` filters the Envelope and the Exclusions together, adds "Show every type", and a second press clears it.
5. Points appear in the order Session start, Prompt, Prompt submit, Model request, Checkout files and Tool list, each with its caption and a tally of frames and tokens. A point with no frame is not drawn.
6. Each point is a table Type · SteeringFrame · Source · Force · Tokens. A gate-backed frame carries "enforced by <gate>". `srcCell()` names the source kind, links the source id with `srcHref()`, and shows the version and the frame hash.
7. Rows sort by type, then force, then id (`frameOrder()`). A point shows 4 rows and "Show all N" (`dtAll()`). Under a filter every row shows.

### States
Marked future-only with `?future=1`. A build shows the manifest items as recorded (id, kind, force, tokens, included or cut) until frame types and provenance ship. On a phone every table becomes labelled cards.

## Exclusions

Section 2 lists each SteeringFrame Oxagen resolved and did not deliver, with its reason and the numbers that decided it.

### Purpose
You want to know what the agent did not see and why: a record that was out of scope, a memory a published `must` outranked, a context frame that did not fit the budget. Each row names a reason from a closed list and the numbers behind it.

### Rationale
An exclusion is deterministic (honesty rule 3). It names a reason from the closed vocabulary of spec §10.5 and the numbers that decided it: the budget, what was already spent, the frame's cost, its score, or the newer version. The same sources, run and budget always give the same exclusions. The vocabulary is closed so a build cannot invent a reason, and each badge reads the reason in words with its key in the title for anyone matching it to a manifest. A withheld skill is excluded before ranking: the agent is told the count and the reason, never the name (ADR-090).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Rows | the cut list of `resolveEnvelope()` | the manifest's cut items | partial |
| Reason | `XR`, `xrBadge()`, `mapCut()` | `tier`, `budget`, `superseded` (`wire.ts:641`, `:652`) | partial |
| Numbers that decided it | `f.why` from `resolveEnvelope()` | tokens per item only | none |

### Logic
1. Rows sort by reason, then by `frameOrder()`.
2. The heading line is `ftLead()`: "24 SteeringFrames excluded", or the filtered count.
3. `exclusionsHtml()` draws one table Type · SteeringFrame · Source · Reason · Tokens. The SteeringFrame cell names the injection point it would have entered.
4. The reason badge reads the word form of the key (`xrLabel()`). Its title carries the key and its meaning from `XR`.
5. The line under the badge carries the numbers: "relevance 0 for this brief", "rank 11 of 14 · needs 25 tok, 15 left", the scope that did not match, or the gate rule.
6. Only `tier`, `over_budget` and `superseded` are recorded today (`XR_SHIPPED`). Every other badge is marked future-only.
7. The table shows 6 rows and "Show all N". Nothing excluded reads "Nothing was excluded."

### States
Under a type filter with nothing of that type cut, it reads "Nothing of this type was excluded." On a phone the table becomes labelled cards.

## Choices

Section 3 lists every call the agent chose and the answer the rule gave it.

### Purpose
You want to know what the agent did with its toolbelt: which calls it made, which a rule allowed, which went to a person, and which failed. Each row names the rule and the policy version that decided it, and links the frame that recorded the decision.

### Rationale
Choices replaced the old Policy and Governed actions tabs. The heading counts the tools the toolbelt offered, which is the number of capability frames in the Tool list, because what the agent could have called frames what it did call. A harness adds its own tools, such as Bash in Claude Code, and Oxagen did not put them there, so they are labelled "harness tool" and decided by the bundle's permissions rather than a rule. `TodoWrite` calls are plan versions, not choices, so they appear in section 5.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Calls and arguments | `runChoices()` over `TRANSCRIPTS` (tool entries) | `tool_requested` frames (`envelope.ts:622-631`) | live |
| Answer and rule | `e.gov`, `e.parked` | `policy_decision`, `harness_permission` and approval frames (`envelope.ts:67-74`), the transcript verdict (`run.transcript.get.ts:122-132`) | live |
| Tools offered | `E.byPoint.tools.length` | capability frames | none |

### Logic
1. `runChoices()` walks the transcript's `tool` entries and skips `TodoWrite`.
2. A tool whose name has no `__`, or whose prefix is a harness (`claude_code`, `codex`, `cursor`, `stella`), is a harness tool.
3. The answer maps through `ANSWER`: a parked call or `approve` is "routed to a person", `allow` is "allowed", and `deny` is "denied". A call with no decision is "allowed".
4. Decided by reads `rule <id> · pol_v41` for a policy rule, "the bundle's permissions (PreToolUse)" for a harness tool, or "agent tool default".
5. A failed call carries a "failed" badge. A routed call carries its approval id and "waiting".
6. "frame N" opens the frame dialog on the decision frame. A call with no frame shows a dash.
7. The heading line reads "13 tools on the toolbelt, 11 calls." With no call in view: "No call is in view for this run. Its frames are in the Transcript."

### States
The halted run lists no call. On a phone the table becomes labelled cards.

## Skills

The Skills block under Choices shows the skill config the run resolved and each skill as synced, withheld or loaded.

### Purpose
You want to know which procedures the agent had in its checkout, which Oxagen held back, and which one it actually read. The block answers that for the run, with the config version it resolved.

### Rationale
A skill is a Steering Source (D12): a bundle of instructions, references and optional entrypoints, and Oxagen never runs an entrypoint. A skill the workspace has not approved is withheld before ranking. The agent is told the count of withheld skills and the reason class, never the names, so it cannot ask for one by name (ADR-090). The row used to repeat that sentence on every withheld skill. The Skills console was cut, so this block is where a run's skill resolution is read.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Config version | `SOURCES.resolutions[runId].config` | `skills.resolved` frame | none |
| Synced | `SOURCES.resolutions[runId].synced` | `skills.resolved` frame | none |
| Withheld and reason | `SOURCES.withheld` | `skills.searched` frame, `unapproved_digest` and `out_of_scope` (`skill.search.preview.ts:14`, `:46`) | none |
| Loaded, time, how | `SOURCES.resolutions[runId].loaded` | `skills.loaded` frame | none |

### Logic
1. The block appears only when `SOURCES.resolutions` holds this run.
2. The heading names the config, "skills.toml @ skl_v7 (commit a4c91e2)" on the demo run.
3. Each synced skill reads "synced", its id and version, and "in the checkout".
4. Each withheld skill reads "withheld", its id and version, and its reason key, `unapproved_digest` or `out_of_scope`.
5. Each loaded skill reads "loaded", its id and version, the clock time from `runClock()`, and how the harness loaded it.

### States
Marked future-only. A build shows nothing here until skill resolution frames ship.

## Frames

Section 4 counts the frames the run recorded and holds the timeline that opens each one.

### Purpose
You want to see the shape of the run over time and open any single event in it. The section gives the total, how many are in view, the timeline, and a count by class.

### Rationale
A frame is one recorded event in a run, hash-chained. A SteeringFrame is a resolved input. The two never share a name on screen, so this section says frame and sections 1 and 2 say SteeringFrame. The frame dialog replaced the player: stepping through frames is reading, and there is no playback (D14). The heading used to say each tick opens the frame it names. The timeline shows it.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Frames | `FRAMES_BY_RUN` via `runFrames()`, or `framesFromRunSynth()` | `get_run` (`run.get.ts:109`) | live |
| Turns | frame `turn` fields | `get_run_turns` (`run.turns.get.ts:76`) | live |
| Classes | `fkOf()`, `fkCounts()` | frame `type` | live |

### Logic
1. The heading line reads "<N> recorded, <M> in view". A live run's authored frames are a window onto a longer run, so M can be less than N.
2. `fkOf()` folds each kind into one class: `model.*` model calls, `tool*` tool calls, `policy`, `token`, `approval` and `credential` governance, `context*` context, `control.*` operator, and the rest lifecycle.
3. The chips under the timeline count each class in `FK_ORDER` and skip empty classes.
4. "Open the transcript" calls `runTab('transcript')`.

### States
A generated run gets a frame list built from its record by `framesFromRunSynth()`, exactly `R.frames` long.

## Timeline

The Timeline draws every frame in view as a tick on a time axis, banded by turn.

### Purpose
You want to see where the run spent its time, where an operator stepped in, and where it waited for a person. The timeline shows that at a glance, and each tick opens its frame.

### Rationale
Every tick is one frame. Tall ticks mark the frames that need a person: operator frames, approval requests, and policy decisions that route a call to a person. The marks "steer" and "parked for approval" label the two moments a reader looks for first. Hover shows the frame's kind, time, cost and summary, so you can scan without opening anything. The panel used to say this in a foot line. It lives here now.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Ticks, times, kinds | `FRAMES` | `get_run` | live |
| Turn bands | `agent_start`, `turn_start`, `control.steer` frames | `get_run_turns` | live |

### Logic
1. `runTimeline()` places each frame by its time between the first and the last. Ticks closer than 1.7 % are pushed apart, and the axis rescales to 97 % when the push overflows.
2. A band starts at `agent_start`, each `turn_start` and each `control.steer`. A band after a steer reads "turn N · after steer". A narrow band reads "tN".
3. A tick is tall for an operator frame, an `approval_request`, or a `policy_decision` that routes to a person. A frame with a cost gets the cost style.
4. `tipAttr()` gives each tick a hover and focus tip with the frame number, kind, time, cost and summary. A click calls `openFrame(i)`.
5. The legend counts each class. The axis reads the first time and "+<elapsed> · <last time>", with "· live" on a live run. The foot counts turns in view.

### States
The halted run shows one turn and one parked mark. A build gives each tick an accessible name and a larger hit area on a phone.

## Plan changes

Section 5 shows each version of the plan the harness recorded and what changed between versions.

### Purpose
You want to see how the agent's plan moved: what it added after a steer, what it finished, what it dropped. Each version shows its time and marks the items that changed.

### Rationale
A plan change appears only when the harness recorded a plan (honesty rule 4): a `TodoWrite` call, an `oxagen:task` frame, or a Stella plan event. Oxagen does not rebuild a plan from the agent's prose. The heading names the harness and the record it came from, because a plan is the harness's claim.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Versions and items | `runPlan()` over `TRANSCRIPTS` (`TodoWrite` entries with `plan`) | a plan-version frame (`hooks.ts:748-764`, `envelope.ts:673` record `oxagen:task`) | partial |

### Logic
1. `runPlan()` collects the `TodoWrite` entries that carry a plan, with version, clock time and items.
2. The heading reads "<N> versions, recorded by <harness> as TodoWrite calls."
3. Each item shows a state glyph: pending, in progress, or completed and struck through.
4. From version 2 on, `planDiff()` compares each item with the previous version. A new item reads "added", and a changed state reads "now completed" or "now in progress".

### States
Absent when no plan is recorded. Marked future-only. A build shows the `TodoWrite` calls in the Transcript until a plan-version frame ships.

## Self-reported uncertainty

Section 6 quotes each doubt the agent reported in a structured field, with the call and the report id.

### Purpose
You want to know where the agent itself was unsure, in its own words, so you can check that point first. Each doubt is quoted verbatim with where and when it was reported.

### Rationale
Uncertainty appears only when the agent reported it in a structured field (honesty rule 5): a call to Oxagen's `report_status` tool, or the uncertainty field of a Stella or ARP report. Oxagen quotes the agent's own report. It does not estimate confidence and does not read doubt out of prose. The section used to say so under its heading. `report_status` is a new capability that needs a contract (wedge Open decision 4).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Doubts, time, report id | `runDoubts()` over `TRANSCRIPTS` (`oxagen__report_status` calls) | `report_status` | none |

### Logic
1. `runDoubts()` reads each `oxagen__report_status` call's raw arguments and takes every entry in `uncertain`.
2. Each doubt is a blockquote with the footer `oxagen__report_status`, the clock time and the report id from the result.
3. A run with no plan and no doubt shows one line in place of sections 5 and 6: "The harness recorded no plan, and the agent reported no uncertainty." The Evidence section keeps the number 7.

### States
Absent when nothing is reported. Marked future-only. The halted run shows the one-line fallback.

## Evidence

Section 7 sums up what supports the run's outcome so far: its outputs, its definition of done, its approvals, and the state of its record.

### Purpose
You want the short answer to "can I trust what this run produced" before you open the Evidence tab. Four rows give it, and "Open Evidence" takes you to the full claims, approvals, issues, linked work, chain and seal.

### Rationale
Evidence replaced the Issues and Chain and seal tabs. The trace keeps a four-row summary so a reader does not have to leave the explanation to see whether the outcome is backed. A claim is the agent's word and an acceptance is a person's, so the definition of done counts both. The section used to carry a subtitle saying what it was for. The rows say it.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Outputs | `R.outputs` filtered by `roDurable()` | `get_run_outputs` (`run.outputs.get.ts:162`) | live |
| Definition of done | `woItems()`, `woClaimed()`, `wo.claims` | the work order's claims | none |
| Approvals | `APPROVALS` with `apState()` pending | `list_approvals` with `runId` (`agent.approval.list.ts:81`) | live |
| Record | `R.frames`, `R.sealed` | `get_run_chain` (`run.chain.get.ts:146`) | live |

### Logic
1. Outputs lists each durable output and its state, or "none recorded".
2. Definition of done reads "<claimed> of <items> claimed by the agent · <accepted> accepted by a person", or "none: a direct work order". It is marked future-only.
3. Approvals lists each pending approval on this run and the tool it waits on, or "none waiting".
4. Record reads "<N> frames, hash-chained with no gaps", then "sealed <time>" or "not sealed yet, the run is live".
5. "Open Evidence" calls `runTab('evidence')`.

### States
The halted run reads "none recorded", "none: a direct work order", "none waiting" and "sealed 07:41:39".

## Pause this run {#dialog/pause}

The Pause dialog stops a live run at its next boundary, with a reason the agent reads when you resume it.

### Purpose
You want a run to stop making calls for a while without losing it: finance has to confirm a line, a reviewer is out, or a steer needs thinking about. The dialog names the run and its position, takes a reason, and queues the pause. You resume from the same header later.

### Rationale
A pause is a governed command, not a process signal. It goes through `dispatch_command` like a steer or a cancel, and it lands in the record as a frame attributed to you, so the gap in the run shows up in the chain and in the receipts. Pause and cancel are different acts. A pause revokes nothing: the run keeps its run token and its budget reservation, pending approvals keep their clocks, and the run resumes where it stopped. Cancel revokes the token and cannot be undone. The dialog used to explain all of this in a lede, a closing note and a footer line. The facts now sit in the Recorded as row and on this page.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Run, position (turn, step, frame) | `RUNS` via `run(S.dlgArg)` | `get_run` (`run.get.ts:109`) | live |
| The pause and the resume | `pauseRun()`, `resumeRun()`, `S.runCtl` | `dispatch_command` (`tacho.command.dispatch.ts:108`), `commandBlock` on the run (`run.list.ts:362`) | live |
| `control.pause`, `control.resume` frames | pushed onto `FRAMES` | the run's frames | live |
| Reason | the `pause-reason` textarea | the command's reason, delivered on resume | partial |

### Logic
1. "❙❙ Pause run" in the header opens `pause` on a live run. Its tooltip reads "Takes effect at the next boundary · run.pause".
2. `pauseBody()` shows Run, Position ("turn N · step M · frame F") and Recorded as ("`control.pause` frame · operator authority"), then the Reason field.
3. "Pause at the next boundary" calls `pauseRun()`. It sets `S.runCtl[id]` to `pausing` with your name, the time and the reason, and toasts "Pause queued for <run>."
4. The model call or tool call in flight completes, and nothing new is dispatched. The mockup simulates the boundary after 1.4 seconds: the status turns `paused`, a `control.pause` frame is pushed, and a second toast names the turn and step.
5. While pausing or paused, the header shows the pause banner, and the actions change (see Page header).
6. "▶ Resume run" calls `resumeRun()`. The status turns `resuming`, and after 1.2 seconds a `control.resume` frame is pushed, `S.runCtl` is cleared, and the toast reads "<run> is live again. The agent was told your reason."
7. The seed `RUNS` is never mutated. A reload returns the run to its recorded status.

### States
Only a live run offers Pause. A ledger run fences ingress instead (`ingressPaused`, `run.list.ts:237`). Permission: `dispatch_command` for organization Owner and Admin and workspace Owner and Member (`tacho.command.dispatch.ts:122-125`). On a phone the dialog rises as a bottom sheet.

## Steer this run {#dialog/steer}

The Steer dialog sends a short instruction to one run, delivered at its next model call or by interrupting the call in flight.

### Purpose
You watch a run head the wrong way and want to correct it without stopping it. You write the steer, choose whether it waits for the boundary or interrupts, and send it. The steer becomes a frame on the run, and the Decision trace shows it as an `invocation` SteeringFrame at the model request.

### Rationale
Oxagen never executes a steer as an instruction. It enters the run as evidence at the steering position, quoted and carrying your authority, and whether the harness treats it as an order is up to the harness. That keeps an operator's words in the same provenance model as every other SteeringFrame (D5, D6). Delivery depends on the tier. On `gateway` and `contained` runs, Interrupt cuts the call in flight at the proxy. On a `harness` run a steer lands at the next checkpoint. An `observe` run cannot receive a steer. The dialog used to carry these rules as a closing note and two hints. `steerModeField()` is shared with the `steerfleet` dialog on the Agents page, so its Delivery switch reads the same in both.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Steering text | `steerTextField()`, `S.steerText`, `STEER_DEFAULT` | `dispatch_command` with a steer block (`run.list.ts:369`) | live |
| Address | the Address select | the command's target | partial |
| Delivery mode | `steerModeField()`, `S.steerInt` | the command's mode | partial |
| `control.steer`, `control.interrupt`, carrying `model.request` | `steerWrite()`, `steerApply()` | the run's frames | live |
| Token count | `steerTok()` | the steer's token cost | partial |

### Logic
1. "Steer" in the header calls `openSteer()`, which resets the draft and opens `steer` on the run in view.
2. The Address select offers "this run" or every live run of this agent. Its hint points to Steer on the Agents page for the whole workspace.
3. The Delivery switch toggles `S.steerInt`. "At the boundary" lets the agent finish its turn and read the steer before its next model call. "Interrupt now" stops the call in flight and makes the steer the first thing the agent reads.
4. `steerFoot()` reads "this run · at the boundary" or "· interrupt", and the primary button becomes "Send & Interrupt" (danger) when interrupting.
5. `steerSend()` refuses empty text with the toast "A steer needs text." Otherwise `steerWrite()` pushes a `control.interrupt` frame (interrupt only) and a `control.steer` frame with status `queued`, the text, the mode, `steerTok()` (four characters a token plus seven for the envelope) and a digest. The toast reads "Steer queued at seq N on <run>.", or "<run> is paused, so it waits for the resume."
6. `steerWatch()` polls. When `steerCanApply()` holds (live, or parked with no pending approval), `steerApply()` appends a `model.request` that carries the steer and flips it to `applied`. The toast names that frame.
7. A steer nobody reads inside `STEER_TTL`, 10 minutes, expires through `steerExpire()`.

### States
A paused run and a run parked on an approval keep the steer queued. Permission: `dispatch_command`, the same roles as Pause.

## Cancel this run {#dialog/cancelrun}

The Cancel dialog ends a run for good: the run token is revoked and the run seals where it stopped.

### Purpose
You decide a run should not continue at all: the brief was wrong, the agent is looping, or the work is no longer wanted. The dialog asks you to confirm, warns that nothing is rolled back, and issues the cancel.

### Rationale
Cancel is not a pause. A pause holds the run token and the budget reservation and can be resumed. Cancel revokes the run token at once, so every later call to Oxagen from that run is refused. Killing the agent's process is best effort: a host that is offline stops when it next checks in. Work already written to a working copy stays written, because Oxagen does not own the checkout. The run seals where it stopped, so the record of what it did before the cancel is kept whole. The dialog used to explain the difference from pause in two notes. It now keeps one warning, the one fact you must accept before you press the button.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The cancel | `DLG_EXT.cancelrun` | `dispatch_command` (`tacho.command.dispatch.ts:108`) | live |
| Token revocation | none in the mockup | `ingressRevoked` on a ledger run (`run.list.ts:238`) | live |

### Logic
1. "Cancel" (danger) in the header opens `cancelrun` on a live or paused run.
2. The body is one warning: "Nothing is rolled back. The run seals where it stopped."
3. "Let it run" closes the dialog.
4. "Cancel the run" closes it and toasts "Cancel issued. Run token revoked." The mockup changes no state. A build writes the command, revokes the token, and seals the run on its next terminal frame.

### States
Offered on live and paused runs only. Permission: `dispatch_command`, the same roles as Pause. On a phone the dialog rises as a bottom sheet.

## Export this run {#dialog/runexport}

The Export dialog builds a signed bundle of the run's record that an auditor can verify offline.

### Purpose
You need to hand the run to someone outside Oxagen: an auditor, a customer, a regulator. You choose what to export and in which format, see which segment and seal go in, and build the bundle.

### Rationale
The seal and the hash chain exist so a third party can check the record without trusting Oxagen's servers. Export is the way out. When the replay interface was cut (D14), Fork replay and Bisect left this menu, and Export stayed as the one header action on a sealed or halted run. Export runs as `export_data`, a governed action with third-party egress, so it is audited like any other write. Bodies for erased subjects are not in the bundle. Their digests are, so the chain still verifies. The dialog used to carry these facts in a subtitle and a callout.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Scope, format | the `ex-scope` and Format selects | `export_run` (`run.export.ts:27`) | partial |
| Segment | `seg_<run>.ndjson.zst`, `R.frames` | the archive segment | partial |
| Seal | `R.status` | the seal envelope | live |
| The built bundle | `queueExport()` adds a row to `EXPORTS` | `get_run_export` (`run.export.get.ts:39`) | partial |

### Logic
1. "Export" in the header opens `runexport` on the run in view (`S.frameRun`). The Seal and attestation panel on the Evidence tab opens it too.
2. Scope offers this run with its frame count (and the seal once sealed), the task's every run where the run has a task, and the agent's runs.
3. Format offers a signed bundle (segment and verifier), frames as NDJSON, or receipts as CSV.
4. Segment names the archive file and the frame envelope count. Seal reads "included · verifies offline", or "not yet" with checkpoints only on an open run.
5. "Build bundle" calls `queueExport()`. It adds a `building` row to Audit › Exports, writes an `export.created` audit event, opens that tab, and toasts the export id. The mockup attributes the export to Priya Natarajan. A build attributes it to you.

### States
The contract refuses a live run (`run.export.ts:14`), so a build offers Export on a live run only once a checkpoint-only bundle ships. Permission: `export_run` for organization Owner and Admin, on a sealed run (`run.export.ts:40-43`).

## Frame {#dialog/frame}
<!-- open: openFrame(0) -->

The frame dialog shows one recorded frame: its summary, the panel for its kind, and Previous and Next through the frames in view.

### Purpose
Every claim on the run page ends at a frame. A tick on the Timeline, "frame N" in Choices, a "Frame N" chip on the Outputs spine and "Check it against the frames" under the Summary all open this dialog, so you can read the recorded event behind a number or a sentence and step to its neighbours.

### Rationale
The frame inspector replaced the player (D14). Stepping is reading: there is no playback, no speed and no transport. A frame is a recorded event and never a SteeringFrame, so the dialog says frame throughout. The per-kind panels show what the record holds for that kind and state their facts as data. Explanations that used to sit under the panels now live here:
- A pause holds the run token and the budget reservation, pending approvals keep counting down, and nothing new starts. The pause and resume frames are both in the chain, so the gap shows in the receipts.
- A steer is evidence, quoted and cited. Oxagen never runs it as an instruction. Whether the harness treats it as one is up to the harness.
- At replay grade `digest` the producer sent digests, not bodies. What the dialog shows is the envelope Oxagen countersigned, and the content is as the harness reported it.
- The same call under the same policy version always gets the same decision, and no model is involved. The conditions derive from the call and the record only.
- Redaction runs before the bytes are written. The digest of each removed field lets an auditor confirm what was removed without recovering it.
- A resolved approval is a frame of its own. A parked call tells the agent to wait, and why.
- A correction to a record is a new record on the same lineage, and each record links to the frame it came from.
- A checkpoint pins the chain mid-run, so a crash or a network drop cannot cost the frames already recorded. Oxagen attests that it received the frames and that the chain is intact. It does not attest that a body the harness reported is true.
- A turn runs from one prompt, schedule or resumed context until the agent stops. Turns are derived from the frames and stored in the rollups, and the Cost tab charts them.
- Oxagen builds the `agent_start` facts, never the agent. An agent cannot name its own operator or choose its own tier.
- The agent never sees a minted credential. It holds one run token, which works only for calls to Oxagen.
- After the seal the post-run review writes one `context_use_feedback` record per context frame served, marking it cited, rendered or ignored. A low citation rate on a large budget is the context bloat finding. Context frames are identified by provider, frame id and content digest.
- On `model.response`, input is priced at the published effective rate and split by class, and output at list.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Frame kind, time, summary, digest | `runFrames()` over `FRAMES_BY_RUN` | `get_run` frames (`run.get.ts:65-92`) | live |
| Frame body | `frameDetail()`, `FD_KIND` panels | `get_run_frame_body` (`run.frame_body.get.ts:28`) | partial |
| Conditions evaluated, message stack, cost split | `fdPolicy()`, `fdRequest()`, `fdResponse()` | not a recorded structure | none |
| Approve and Deny | `fdApproval()`, `APPROVALS`, `apState()` | `resolve_approval` (`agent.approval.resolve.ts:50-53`) | live |

### Logic
1. `openFrame(i)` clamps `i` to the frames in view on the run in view, sets `S.frame` and `S.frameRun`, and opens `frame`. `openFrameSeq(seq)` finds a frame by sequence number.
2. Another page opens a frame on a run with `openFrameIn(runId, i)`. It sets `S.pendingFrame` and navigates to the run. When `pRun()` renders that run, it moves `S.pendingFrame` into `S.frame` and opens the dialog.
3. `DLG_EXT.frame` titles the dialog "Frame N · <kind>" with the subtitle "<run id> · <time>", prints the summary line, then `frameDetail(f)`.
4. `frameDetail()` renders `control.pause`, `control.resume` and `control.steer` itself, then dispatches through `FD_KIND`: `fdContext`, `fdRequest`, `fdResponse`, `fdToolReq`, `fdToolCall`, `fdPolicy`, `fdApproval`, `fdRecord`, `fdCheckpoint`, `fdError`, `fdTurn` (turn start and end), `fdAgent` (agent start and stop) and `fdToken`. A kind with no panel shows its frame hash, previous hash, where its body is kept and who attested it.
5. A `digest`-grade run prefixes the panel with "Reported by harness at the <tier> tier, with replay grade digest. The producer sent digests, not bodies."
6. A parked `approval_request` carries "Approve" and "Deny", which open the `approve` and `deny` dialogs.
7. The footer reads "frame i of N shown · <frames> in the run". "Previous" and "Next" step `S.frame` and are disabled at either end. "Close" is the one gold action.

### States
With no frame in view the body reads "No frame recorded here." On a phone the dialog rises as a bottom sheet.
