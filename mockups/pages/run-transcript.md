# Run transcript

| | |
|---|---|
| Route | `#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/transcript`. Old routes that land here: in the app, `/{org}/{ws}/runs/{run}?tab=transcript` (308 to the segment), and the filter values `?kinds=`, `?frames=` and `?body=`, which keep their names on `/transcript` |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D8 (the Decision trace explains; the Transcript records), D14 (no playback transport), the Decision trace honesty rule 2 (returned thinking is the provider's text), D17 (future-only marks). `docs/fleet-operations-ia.md` (Run, Transcript). `run.md` owns the header, the Summary, the stat row, the tab bar and the side column this tab shares |
| Design | `mockups/src/engine.js` → `transcriptTab()`, `txRow()`, `txKindChips()`, `txVisible()`, `txEntries()`, `txDiffBlock()`, `txGovChip()`, `txFold()`, `txSalient()`, inside `pRun()`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Runs / Transcript`: Loaded and Loaded · mobile |
| Audit | `run-transcript.audit-prompt.md` |

## Job

Read the run as it happened: the prompt the operator wrote, what the model said and returned as thinking, each tool call with its arguments and the output it read, each steer, what every model step cost, and where Oxagen's own decisions sit. The transcript is read, never played. Every row is on the page at once. The Decision trace (`run.md`) explains the run from the same record; this tab is the record in conversation order.

## What is on the page

**Shared.** The run header, the Summary, the stat row, the tab bar with "Transcript" selected, and the side column, as `run.md` specifies them.

**The tools row.**

- A search field: placeholder "Search the transcript…", aria-label "search the transcript". While a query is typed, a mono count reads "<shown> of <all> entries" ("7 of 38 entries" for "mobile").
- The kind chips, each a toggle with a dot, a word and a count, in this order: "prompt" 2, "responses" 7, "provider thinking" 7, "tools" 14, "usage" 7, "recall" 1, "seal" 0. Each carries `aria-pressed`.
- A toggle that reads "none" while every chip is on and "all" while any is off.
- "✗ errors" with the count of failed calls (1), `aria-pressed`, titled "show only failed calls", or "no failures in this run" when there are none.
- A button: "expand the provider’s thinking", then "collapse the provider’s thinking".

There is no playback transport: no play, no pause, no step, no speed and no position counter (D14).

**The run bar.** The task reference (`a-intel/platform#482`, or the run id when the run has none); the agent's harness mark, then "a-intel.core.release-manager · claude-opus-5 · 7 turns · 41 steps · 38 entries", which ends "projected from the run record" in place of the entry count on a run with no recorded transcript; the chips "errors only" while that filter is on, and "● live", "⏸ paused" or "⏸ parked"; and "burn" with a bar and "$4.13" "of $4.13", the cost of the entries in view against the run's total.

**The feed.** One row per entry, in time order, each with a clock (`09:14:02.0`), a node, and the entry:

| Entry | What it shows |
|---|---|
| Prompt | The tag "YOU", the prompt as written, and "Marcus Bell · operator", "task a-intel/platform#482" and "first prompt" |
| Steer | The tag "STEER", the steer in quotes, "Marcus Bell · operator authority", "delivered at the next boundary · 22 tok", and the chip "control.steer · frame 10" |
| Model text | The tag "AGENT", or "ANSWER" on the last text of a sealed run. A text longer than one sentence folds to its first sentence behind "⏵" and "…"; "⏶" folds it back |
| Returned thinking | "⏵ thinking the provider returned · 1 line", titled "Text the provider returned as thinking. It is not the model’s hidden reasoning.", folded to its first sentence unless opened or expanded for the whole tab |
| Usage | The model, input, cache and output tokens and the request id; the chips for the step's cost ("$0.4126"), the cost so far ("Σ $0.4126") and the frame ("model.response · frame 3") |
| Recall | "◉ recall · 6 frames · 11,204 tok · 41 scored · 3.1 ms", the first three context frames (kind, label, tokens), "⋯ 3 more · 5,218 tok · provenance", and the chip "context.assembled · frame 1" |
| Tool call | "●", or "✗" on a failed call; the tool's name ("Bash", `github__list_pull_requests`); its arguments on the same line; chips for the diff stat ("+20 −0"), the duration ("1.1 s", "41 ms"), the output's line count ("11 lines"), "⏸ parked · apr_01K5RS3K7 · frame 15" on a parked call, "running…" while no result has arrived, the decision ("⚖ allow · rg_0088 · frame 5", "⚖ approve · rg_0093 · frame 14") and "⋯", which shows the raw arguments |
| Tool output | Six lines around the first line that reads as an error or a warning, then "⋯ N more lines"; opened, the whole output and "⏶ collapse" |
| File change | The path, "new file" when the call created it, the stat, the first 12 lines of the diff and "⋯ N more lines" |
| Seal | "sealed <time>" once the run is sealed |

A `TodoWrite` call is a tool row ("6 items · plan version 1", output "Todos updated"). The Decision trace reads the same calls as plan versions.

A parked call carries a line under it saying the call is held at the gateway for up to ten minutes and the model sees a wait with a reason, not a failure. The mockup's line ends "Approve or deny it from the card under Governed actions."; that tab no longer exists, and a build names the Approvals drawer and the frame. The recall row's second chip reads "open the Context tab" in the mockup and opens the Decision trace; a build labels it by where it goes.

**Under the feed**, the note: "The transcript is what the agent showed its operator. Select ⚖ to see what the gateway recorded."

**Empty results.** "No failed calls in this run." under the errors filter, "Nothing matches this search." under a query, and "Nothing to show with these filters." when the chips hide every row.

**A compacted run** shows, above the tools row: "**Compacted.** This transcript is read from the archive. Its frames were moved out of the live record, and nothing was recomputed."

**Dialogs this tab opens:** `frame` (every "fr N" chip and every ⚖ chip), and the run dialogs from the header (`run.md`).

## Data sources

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen (file paths) | Status |
|---|---|---|---|---|
| Entries in order, with the frame each opens on | `TRANSCRIPTS` (`fixtures/transcripts.json`); `txEntries()` | `get_run_transcript` at the `steps` zoom | `packages/oxagen/src/contracts/run.transcript.get.ts:396` (zooms `:50`, entry `:308-394`) | ✅ |
| Kind chips and their filter | `TX_GROUPS` | the `kinds` input | `TRANSCRIPT_KINDS`: prompt, responses, thinking, tools, policy, usage, recall, seal and errors, `packages/tacho/src/evidence/transcript-kinds.ts:15-45` | ✅ |
| Returned thinking | `TRANSCRIPTS` entries of kind `reasoning` | the `thinking` content block | `run.transcript.get.ts:144-152`, recorded as returned; redaction removes credentials only (`packages/tacho/src/evidence/redaction.ts:1-16`, `:175-179`) | ✅ |
| Model text, prompt, tool arguments and results | `TRANSCRIPTS` | request and response halves, content blocks | `run.transcript.get.ts:134-182` (blocks), `:235-271` (halves, with digest, redactions and fidelity) | ✅ |
| Decision chips (⚖) | `TRANSCRIPTS[].gov` | the tool verdict and the folded decision | verdict `run.transcript.get.ts:122-132`; decision `:274-296` | ✅ |
| Steer rows | `TRANSCRIPTS` entries of kind `steer` | the folded operator command | the decision records `pause`, `resume`, `cancel` or `steer` (`run.transcript.get.ts:274-296`); the delivery mode is on `dispatch_command` | 🟡 |
| Usage rows, step cost, cost so far, burn | `TRANSCRIPTS[].meta` | `usage`, `cost`, `cumulativeCost` on each entry | `run.transcript.get.ts:298-306`, `:390-392` | ✅ |
| Recall row | `CTXF` | the `recall` kind and the `context.assembled` frame | the kind exists; the frame's served context and scores are not a transcript field | 🟡 |
| File change blocks | `TRANSCRIPTS[].diff` | the tool input, and the frame body for the whole | input strings fold at 400 characters (`run.transcript.get.ts:101`); the whole body through `get_run_frame_body` (`packages/oxagen/src/contracts/run.frame_body.get.ts:28`) | 🟡 |
| Search | `txVisible()` | none | the contract has no query input; a build searches the entries it has read | 🟡 |
| Parked chip | `TRANSCRIPTS[].parked`, `APPROVALS` | the verdict `routed` with `waitingOn`; `list_approvals` with `runId` | `run.transcript.get.ts:122-132`; `packages/oxagen/src/contracts/agent.approval.list.ts:81` | ✅ |
| Compacted note | `RUNS[].status` | the seal's archive segment | `archiveSegmentRef` on the seal, `packages/oxagen/src/contracts/run.chain.get.ts:125` | 🟡 |

## Future-only fields

This tab's own content carries no future-only mark, and the catalog gives it no future story. The one mark on screen is the shared header's work order chip ("work orders"), which a build leaves out until the run records its work order (`run.md`). The partial rows above render what the record holds and say not recorded for the rest.

## Functionality

- The transcript is read, never played. Every row is on the page at once, the feed does not scroll itself, and nothing reveals rows over time (D14).
- The chips filter the entries on their kinds. The errors filter shows only failed tool calls and marks the run bar "errors only". Search matches the entry text, the tool name and arguments, the output, the diff and the model id, and reports "<shown> of <all> entries".
- Returned thinking is folded by default. It is labelled as the provider's text everywhere it appears, and the tab says Oxagen has no access to hidden reasoning. The Decision trace never presents it as how the model decided.
- A tool row leads with the tool's name and its arguments on one line. The raw call folds under "⋯".
- Each "fr N" chip and each ⚖ chip opens that frame in the frame dialog (`run.md`). The Decision trace's "Open the transcript" and the side column's "Open the diff in the transcript" open this tab.
- The burn figure is the sum of the cost of the usage rows in view, against the run's total. The cost chips on each usage row sum to the run's recorded cost.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

- The shell is as `run.md` describes: the thumb bar with Work lit, and More with Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers.
- The tab bar scrolls sideways with snap, and each tab is 44 px tall.
- The tools row wraps: the search field (16 px text, so a phone does not zoom on focus), then the chips on as many lines as they need.
- Feed rows keep the clock beside the entry. Tool arguments, outputs and diffs wrap or scroll inside their own block, and the page never scrolls sideways.
- The side column stacks under the feed.
- The kind chips and the "fr N" and ⚖ chips are under 44 px tall in the mockup. A build gives each a 44 px hit area.

## Permissions

- Read: `get_run_transcript`, allowed by default to organization Owner, Admin and Member and to workspace Owner and Member, with `sensitivity: "high"` (`run.transcript.get.ts:409-412`). The frame bodies read through `get_run_frame_body` on the same roles.
- No write on this tab. The header's run commands are specified in `run.md`.

## Backend gaps this page depends on

- A delivery mode recorded on the steer entry, so the row can say how the steer was delivered.
- The served context frames and their scores on the recall entry.
- A server-side search over a run's transcript, so a query covers the whole run and not only the pages read.
- The run's work order, for the shared header (`run.md`).

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. The chips here open frames.
- The transcript reads the record. No inference, no score, no model-written account of why. Oxagen has no access to hidden reasoning; thinking a provider returns is labelled as the provider's text and is never called the model's reasoning.
- No playback transport, no speed control and no replay grade.
- No person is scored or ranked.
- Every enforcement claim states the tier. A ⚖ chip shows the decision the record holds, and "enforced" appears only for calls routed through Oxagen.
- Headers are rollups of the rows beneath them: each chip's count is the number of entries of that kind, the errors count is the failed calls, and the entry count in the run bar is the rows.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. This tab has none of its own.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
