# Run

| | |
|---|---|
| Route | `#/a-intel/core-platform/runs/<run id>` |
| Scope | workspace |
| Spec | §14 Mission Control; §12.6 token classes; §12.7 attribution; Appendix F page 2 |
| Design | `mockups/src/engine.js` → `pRun(r)`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / run`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `run.audit-prompt.md` |

## Job

A run whose loop Oxagen has stopped on an interjection renders a different page at the same route: `run-interjection.md`.

One run, read top down: the first prompt, what it cost in tokens, prompts, money, waste, and time, then the transcript. Beside it, the work the run touched. Every explanation is a chain of links to frames, records, and commits.

## What is on the page

**Header**: eyebrow “Run”, h1 the run id (mono). Under the id: the agent card (compact: avatar, key, harness label · runs 30d · spend 30d), status dot and word (live, parked, paused, sealed, halted, compacted), tier badge (`observe`, `harness`, `gateway`, or `contained`, as recorded), replay badge, task chip (`task a-intel/platform#482`); then “<task title> · started <time>” with “· sealed <time>” once sealed.
Under that line, two strips, both above the fold.
**The rig** (`runRig`): the harness label with its version, the model id (mono), and `effort <value>`; effort reads “not captured” where Oxagen did not proxy the model call. Then one badge per fit reading, `● Model fit`, `● Wrong model tier`, or `● Wrong effort setting`, each opening the Cost tab.
**The checkout** (`runWhere`): the repository (links to the forge), the branch (links to the tree, or to the pull request when the branch is a pull request head), one chip per pull request the run pushed to (“no pull request” when there is none), and `<machine>:<path>`, the directory on the host where the work sits, as a copy button. The path chip reads `derived` when Oxagen holds no enrolled checkout for that repository on that host; its tooltip says whether the path was recorded or worked out.

Actions depend on status. Live: **❙❙ Pause run** (opens `pause`) · **Steer** (opens `steer`) · **Cancel** (danger; toast “Cancel issued. Run token revoked; process kill is best effort and recorded.”). Paused: **▶ Resume run** · Steer · Cancel. Pausing or resuming: the disabled “❙❙ Pausing…” or “▶ Resuming…”. Sealed, halted, or compacted: **Fork replay** (opens `forkreplay`) · **Bisect** (opens `bisect`). Always last: **Export** (opens `runexport`). While pausing or paused a banner reads “Pausing” or “Paused at turn N · step M · by <name> at <time> · “<reason>””, with **▶ Resume run** and **Open the pause frame**.

**Layout.** A 2/3 main column and a 1/3 side column (`run-cols`). Main, in order:

- **Summary** (`runSummary`), first in the main column: eyebrow “Summary”, badge “generated · not the record”, who was involved (agent card, operator), the prose, the generated-by line, **Check it against the frames**.
- **Issues tab** (`issuesTab`): panel “Issues”, badge “N in this session”; table Issue (ref and title) · Status (open, closed, in progress, blocked) · Relation (task, referenced, blocked by, duplicate of) · Edge (observed with its `fr N` chip, stated, or inferred) · **View ↗** (the tracker's own page for the issue). Note: a session can touch more than one issue; the relation says which, the edge says how Oxagen knows, and the status is read from the tracker on load. Below the table, **Linked work** (`linkedWork`): panels **Repositories** and **Pull requests and artifacts**, one row each with its edge chip, every reference a link to the forge; then **Files changed**, one row per file with its stat and its diff. A legend counts the inferred rows against the total.
- **Model fit** (`runFitPanel`), first on the Cost tab: badge “generated · not the record”, one card for the model and one for the effort setting. A card that reads over or under states what it read and offers **Move this agent to <model>** or **Set effort to <value>**, which opens `fitchange`, a Context pull request against `.oxagen/agents/<slug>.toml`. A card that reads fit, or that could not read the effort setting, states the reason and offers nothing. The footer names what the reading read and says a reading changes nothing until somebody merges it.
- **Cost tab**, after Model fit: the instruments strip, **Spend by area** in full (every area, up to eight dearest tools, and the note on how the split is computed), the calls panel, the waterfall, spend by token class and prompt composition.
- **Stat row** (`runStatRow`), six boxes, one number and one line each: **Tokens** (“N in, N out”) · **Prompts** (“one-shot session” or “N corrective”; approval colour above two) · **Cost** (the basis, `gateway_observed` or `client_attested`) · **Wasted** (`runWaste(R)`: “N corrective prompts”, the listed waste cause, or “nothing bought nothing”; critical colour when above zero) · **Wall clock** (“mostly waiting on a person”, “mostly in the model”, “mostly in tool calls”, or “mostly in harness calls”) · **Cache hit** (“saved about $X”).
- **Tabs** (`runTabs`; counts are live; a tab routes from the hash `/runs/<id>/<tab>`; the old proof, dod, and ladder keys land on Cost): **Transcript** (entries; a tool call is one row that leads with the tool's short name and its arguments on the first line, for Read the file paths, with a duration chip, a lines chip, the governance chip and a fold for the raw call and the result; a model response whose only content is a tool call renders as that tool row, never as an `llm_call` row with JSON to open) · **Issues** (the issues this session touched) · **Governed actions** (policy decisions; “Player” with the frame count when a run has none; a dot when a call is parked; the timeline, the frame player and the frame list, no approvals panel) · **Cost** ($) · **Policy** (decisions; a dot when parked) · **Context** (context frames) · **Memories** (the sayings this run wrote; blank when it wrote none) · **Chain and seal** (live or sealed). Transcript is the default.
- **Transcript**: kind chips prompt · responses · thinking · tools · usage · recall · seal, each with its count, an all/none toggle, and **✗ errors**; **expand thinking**; a search field (“search the transcript”); transport ⏮ ◀ ❙❙ pause ▶ ⏭ and 1× 2× 3× 6×; the position “n / N”; the header line “<task> · <agent> · <model> · N turns · N steps · N entries · ● live · burn $ of $”. Rows: the prompt (YOU, “<operator> · operator · task <ref> · first prompt”), the model’s text, each tool call with the output it read, and what every model step cost. ⚖ chips open Oxagen’s own frame (`allow rg_0088`, `approve rg_0093`). Note: “The transcript is what the agent showed its operator. The gateway’s own frames sit behind the ⚖ chips.” A compacted run shows “Compacted.” and an **Archive segment** panel (Segment · Merkle root · Attestation · Retained until · What remains in the graph) with **Render from the segment** (gold) and **Verify offline**.
- **Governed actions**: the **Timeline** at the top (“N frames shown · N in the run”, a legend of model calls, tool calls, governance, context, operator, lifecycle; turn bands; “steer” and “parked · approval” marks; every tick opens its frame), the frame player bar, then a split: “Frame N · <kind>” (tier, time, summary, the frame detail, **◀ Previous**, **Next ▶**, “frame i of N shown · N in the run”) beside a **Timeline** list (“live”, “paused”, or “sealed”). There is no Approvals panel: approvals live in the drawer. The frame detail of a parked `approval_request` carries the call's card (“Parked.” with Approval · Call · Rule · Approvers · Waited, and **Approve** and **Deny**); a resolved one says who resolved it; an expired one says nobody answered.
- **Cost**: the instruments strip (`runInstruments`): **Cost so far** (basis; per turn, dearest turn, delta against the agent’s median run; a per-turn column chart; cache hit and saved) · **Wall clock** (“so far” or “start to seal”; model, tool, waiting on a person, harness as a stacked bar; batches together against one at a time) · **Tokens** (“in and out”; cache read, fresh input, output; per model call; effective input price) · **Shape of the run** (turns · steps · frames; steps per turn; tools per batch) · **Tool calls** (families; failed; batches in parallel) · **Productive ratio** (advanced against did not; delta against 30 days). Then **Tool calls** (Calls by family: Family · Calls · Share · Wall clock · Failed; Tools per batch: Batches · Widest batch · Mean fan-out · Wall clock won; Speculative prefetch: Eligible · Hit rate · Wall clock saved · Billed), **Waterfall** (chart with finding pins that open `evidence`; table Turn · Steps · Frames · Cache hit · Cost · Running total · Pinned; a total row “of $ recorded”), **Spend by token class** (Class · Tokens · Cost · Share over `input_uncached`, `cache_read`, `cache_write_5m`, `output`, `reasoning`, total), **Prompt composition** (“N tok”; meters Conversation, Context frames, Tool definitions, Steering, System; Effective input price · Cache write cost share · Basis · Productive ratio).
- **Policy**: “Policy decisions”: Frame · Call · Outcome · Rules that fired · Taint · Latency.
- **Context**: the **Prompt** panel first (`promptRow`: “N tok written · N tok sent”, **Open the window**; “Written by <operator>” and the quoted title; “First request” bars for the operator’s words, tools and steering, and system, context, and brief; the cache sentence). Then the `steering.manifest` frame as a spine (`runManifestPanel`): tally “N rendered · N cut · N tok”, **Open in Preview**, gate notices, the stable prefix, the volatile selection with ranks (each row with its kind badge from `steering.md` and its force), the cuts dashed with a reason and a why, “N more cut”, and a footer naming the bundle version and `context.assembled`; an `observe` run says “Assembled, not delivered.” Then **Prompt window** block by block (`system.identity`, `steering.compiled · bundle vN`, `tools.definitions`, `context.frames`, the brief, an appended `control.steer`) with a detail panel (Tokens · Cache · Source, “Why it was in the window”, “Where the cache stops”), the `context.frames` table (Kind · Frame · Tok · Score · Cited), **Walk the window**, and **Retrieval stats** (Candidates scored · Admitted · Held back · Below the floor · Headroom left · Composition digest). With no `model.request` in view: “No window on record”.
- **Memories** (`runMemoryTab`): the lead note “**oxagen writes these after the seal.** Each lesson becomes a memory, or joins a memory that already says the same thing. At 3 sayings from 2 runs, a memory becomes a steering proposal that cites every saying.” Its two numbers are the workspace's fold setting (`S.memFold`), which the Memory tab on Steering sets. Then the panel **Memories from this run**, with a count badge when the run wrote any. A run that has not sealed reads “Nothing is written until the seal. This run is <status>. When its chain seals, oxagen reads it and writes what it learned here.” A sealed run that wrote none reads “This run wrote no memories. oxagen read the sealed run and found nothing another run would need, and no operator steered it.” Otherwise a table in frame order: Memory (the memory's text in bold, this run's saying in quotes, and who wrote it) · Frame · Fold (“new” with “this run started it”, or “joined” with “saying N of M”, and “proposed as <id>” once the memory became a proposal) · Class · In the assembler (“competes”; “yields” with “to <record>, a published must”; or “superseded” with “by <record>”). A row opens the `memory` dialog. Below it, the **Self-grade** panel with the chip “research only”. Before the seal it reads “Captured after the seal. This run is <status>. When its chain seals, oxagen asks the agent the four questions of rubric `rfl_v3` in one out-of-band turn.” After the retention window it reads “Deleted on <date>, 180 days after capture. The run’s frames, its seal and the memories it wrote are untouched.” A viewer without `research.read` sees the lock “Reading a self-grade takes `research.read`” and “An organization grant that no workspace role inherits. <name> does not hold it.”, the Captured, Rubric, Model, Cost, and Retention list, and **Request access** (gold) beside **How reflection works**. A viewer with it sees the four questions, each with a “self” bar and a “the record” bar out of 5, the agent's answer in quotes, and “the record says: …”, with the flag “calibration gap” where the self score exceeds the record by two or more. The note under them reads “**Research only.** A self-grade never enters a context frame and has no promote action. It cannot become a memory, a proposal or steering, and its tokens never count as productive work.”
- **Chain and seal**: **Hash chain** (Frames · Rule · `telemetry_gap` frames · Completeness gaps), **Seal and attestation** (Signature · Signs over · Merkle root · Enforcement tier · Archive segment · Verify offline), **Replay grade** (Grade · What was recorded · What it allows: full, partial, digest, ledger), **Checkpoints** (Frame · Chain head · Covers · Signature); **Fork replay from frame N**, **Bisect against another run**, **Export the bundle**.

**Side column** (`runSide`, aria-label “The work”), two panels in this order: **Changes** (badge: the checks state, or the pull request state where no check reported; rows Pull request (one link per pull request the run pushed to, with its state chip; “none yet”) · Base (the repository's default branch, “untouched by this run”) · Checks (state chip and each check) · Release (when one exists) · Diff (“+N −N in N files” or “no file change recorded”); then one row per changed file with its stat, and **Open the diff in the transcript**) · **Outputs** (eyebrow “Outputs”, tally “N artifacts · N reads · N gates”, **Hide reads**; one node per thing produced in frame order with a state badge and an `fr N` chip; a read is a hairline tick; a governed gate sits where it stopped the run with **Review the approval**; the dashed withheld node; footer “In frame order.”). Spend by area is on the Cost tab, in full.

**Dialogs this page opens:** `pause`, `steer`, `forkreplay`, `bisect`, `runexport`, `evidence` (a pinned finding), `approve` / `deny` (from a parked approval frame on Governed actions), `memory` (a row on Memories), `request-access` (from denied, and from the self-grade lock), `incident` (from error).

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agents · Tools · Steering · Runtimes · Repositories · Spend; Organization nav: Organization · Billing · Audit; foot: the assistant launcher, agent count · data plane, connection badge). Top bar: hamburger, breadcrumbs (… / Fleet / <run id>), ⌘K search-or-run, notifications with unread dot, the approvals button (left of the avatar, count of everything waiting on you across the organization; opens the drawer described in `fleet.md`), account avatar → user menu. No assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Header, stat row, instruments | `RUNS[id]`, `runMetrics`, `runWaste` | `:Run`, `cost.run_totals` (`tool_definition_tokens`, `context_frame_tokens`, `steering_tokens`, `cache_hit_rate`, `retries`); `get_run_cost` | `RunStore.getRunByPublicId`, `sumTokenUsageByExecutionStep`; 🟡 ClickHouse `token_usage` | 🟡 totals ✅ · classes, prompts, waste ❌ |
| Prompts (first prompt, corrective count) | `R.prompts`, `runPrompts` | `:Run.prompts` | none | ❌ |
| Frames / transport | `FRAMES`, `TRANSCRIPTS` | `:Frame` + object bodies | `agent_run_events` via `readAttemptEventsSince`; `tacho_events` (ClickHouse) | 🟡 events ✅, digest chain ✅; model/tool frame kinds partial; bodies ❌ |
| Chain / seal | chain tab | `:Checkpoint`, `:Seal` | `agent_run_attempt_seals`; `tacho.checkpoints` | ✅ |
| Steer (delivery mode) | `steerSend` | `control.commands` `steer` | tacho `message` command | 🟡 no delivery mode (G9) |
| Outputs (the spine) | `RUNS[id].outputs` | `:Frame` tool I/O classified by artifact kind, + `control.approvals` for the gate | none; the gate is `agent.approval_requests`, the artifacts are not classified anywhere | ❌ |
| Side column (pull request, files, task), linked work | `RUNGRAPH`, `OXPRS`, `runPrs` | `FOR_TASK`, `OPENED_BY`, code graph | none | ❌ |
| Effort setting | `R.effort` | the `model.request` frame body, read at the gateway | none; the request body is only visible where Oxagen proxies the call | ❌ (G6) |
| Checkout path | `WORKCOPIES` matched on repository and host | `:WorkingCopy` enrolled on the host | none | ❌ |
| Model fit reading | `runFit` over `runMetrics` | `light` tier classifier over the sealed run | none | ❌ (G14) |
| Context window | `CTXW/CTXB/CTXF/CTXX` | `USED_CONTEXT` edges | `run-evidence` ContextFrame schemas, not persisted | ❌ (G10) |
| Steering manifest | `STG_MANIFESTS` (the run’s prompt and bundle version); the lists come from `assembleSteering()` | the `steering.manifest` frame the assembler records on every run | none; no assembler exists on `main` | ❌ |
| Summary | `R.summary`, `R.gen` | `light` tier classifier | none | ❌ (G14) |
| File diffs | `RUNGRAPH.files`, `txDiffBlock` | tool I/O with file-tool classification | `tacho.session_files` | 🟡 |
| Fork / bisect / export | toast | Series A / M1 | none | ❌ |
| Pause / cancel | toast + `pauseRun` | `control.commands` | `tacho.control_commands` via `dispatch_tacho_command`; ledger-ingested runs through a revocable run token (G17) | 🟡 wrapped runs ✅ · ledger runs ❌ (G17, built now) |
| Approvals on this run | `APPROVALS` filtered by run | `control.approvals` | `agent.approval_requests` filtered on `run_id` (nullable, set from `ctx.agentRun`) | ✅ / 🟡 chain |
| Memories from this run | `MEMORY[].sayings` where the saying's `run` is this run, sorted by `frame`; the fold setting `S.memFold` | `:Memory` and its sayings, each saying linked to the run and frame that wrote it | none; no reflector writes memories on `main` | ❌ |
| Self-grade | `SELF_GRADES` keyed by run id; rubric and model from `SK_REFLECT`; retention from `SK_CFG.reflect.retain` | the reflection skill's out-of-band turn after the seal, stored apart from the run's frames | none | ❌ |

## Functionality

- The transcript plays back at 1× to 6× with scrub, step, and pause; the frame player on Governed actions steps frame by frame.
- Every trust badge (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- One derivation (`runMetrics`) feeds the stat row, the instruments, the Cost tab, and the Context tab, so no two panels can disagree; the header total is the sum of the per-turn ledger (`RUN_TURNS`).
- A prompt after the first is corrective. The Prompts box, the Wasted box, and the first-prompt badge read the same `runPrompts` count.
- Approvals on the run resolve through the same approve and deny dialogs as the drawer; the panel here and the drawer read the same `S.ap` record. The panel lists the requests whose `run_id` is this run (2026-09-15, maintainer decision).
- Cancel works on a ledger-ingested run as on a wrapped run: the ledger ingest contract carries a revocable run token, and cancel revokes it (2026-09-15, maintainer decision; G17).
- The effort setting renders a value only where Oxagen read it out of the request body, which is the gateway and contained tiers. Everywhere else it reads “not captured” and the Model fit card names the reason. Oxagen never guesses an effort value.
- The fit reading is keyed on what the run record varies: prompts, failed tool calls, turns, and steps. It is never keyed on reasoning share, which is a fixed fraction of output per model family and so describes the model rather than the run.
- The rig strip, the checkout strip, the Changes panel, and Linked work all read `runWork` and `runPrs`, so no two of them can name a different pull request.
- A checkout path Oxagen holds is stated; one it worked out is marked `derived`. The page never presents a derived path as a record.
- Finding pins on the waterfall open the evidence dialog for the finding they cite; a pin never asserts more than the frame it points at.
- Memories lists every saying this run wrote, in frame order, whether the saying started a memory or joined one. A saying imported from a Markdown file carries a file and a line and no run, so it never appears on any run's Memories tab.
- The route `/runs/<id>/memory` opens the Memories tab. The lead note and the Memory tab on Steering read the same `S.memFold`, so the fold threshold cannot read differently on the two pages.
- Nothing on the Self-grade panel promotes it. It offers no action that turns it into a memory, a proposal, or steering.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: “This run has no frames yet”. “Oxagen minted a run token and the agent has not made its first model call. Nothing is wrong; a run with no frames has cost nothing and is not billable.” Action: **Back to Fleet**.
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: “This run could not be loaded”. “The control plane answered `502 frame_store_unreachable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the line “trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z”.
- **access denied**: “You cannot see this run”. “Your roles on Anderson Intelligence Corp. do not include `run.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (opens `request-access`), **Back to Fleet**. Below: *Signed in as* (Marcus Bell · workspace.owner · core-platform), *Needed* (`run.read on core-platform`), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting plus an interjection), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The two columns stack, main first; the six stat boxes wrap to two rows; the instruments stack. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `run.read`
- Read the self-grade: `research.read`, an organization grant that no workspace role inherits
- Writes (each a governed action recorded in Audit): `run.command (pause/resume/cancel/steer)`, `approval.resolve`, `run.export`, `run.fork (Series A)`

## Backend gaps this page depends on

- G3 the token classes of §12.6 on `cost.run_totals`, and `prompts` on the run record
- G6 recorder + frame bodies
- G9 steer delivery mode
- G10 USED_CONTEXT edges
- G14 run namer/summariser
- G17 revocable run token on the ledger ingest contract (Cancel on ledger-ingested runs)
- The reflector that reads a sealed run and writes each lesson as a memory or a saying on one
- Self-grade capture: one out-of-band turn after the seal, stored apart from the frames and deleted after its retention window

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Every token figure reconciles to the rows beneath it (the stat row to the token classes, the token classes to the total). Headers are rollups, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary; the Summary panel is labelled generated and offers the frames beside it.
- Never more than one gold action visible at once. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- No heading carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence or nothing.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
