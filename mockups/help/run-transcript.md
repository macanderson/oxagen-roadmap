<!-- run-transcript: the Transcript tab of a run -->

## Transcript filters

The filters row narrows the transcript by search text, by entry kind, and to failed calls, and folds or opens the provider's thinking.

### Purpose
A run of 38 entries reads in a minute. A run of 400 does not. You come to the Transcript to find one thing: the call that failed, the moment a steer landed, every mention of a file. The filters row gets you there without scrolling the whole run.

### Rationale
The transcript is read, never played. The old tools row carried a playback transport, with play, pause, step, a speed control and a position counter. D14 cut replay from the interface, so this row holds only tools that narrow what you read. The kind chips follow the kinds the contract accepts (`TRANSCRIPT_KINDS` in `packages/tacho/src/evidence/transcript-kinds.ts:15-45`), so a filter set here is a filter a build can pass to `get_run_transcript`. Returned thinking is folded by default because it is the provider's text, not the model's hidden reasoning (the Decision trace honesty rule 2), and the button that opens it says whose text it is.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Kind chips and counts | `TX_GROUPS`, `txKindChips()` over `txEntries()` | the `kinds` input of `get_run_transcript` | live |
| Errors count | failed `tool` entries in `TRANSCRIPTS` | the `errors` kind | live |
| Search | `txVisible()`, `txQ()` | none. The contract has no query input | partial |
| Thinking toggle | `S.tx.think` | the `thinking` content block (`run.transcript.get.ts:144-152`) | live |

### Logic
1. The search field calls `txQ()`, which waits 160 ms, re-renders, and puts the cursor back at the end of the query. A query matches the entry text, the tool name and arguments, the output, the diff and the model id, case-insensitively. While a query is set, a mono count reads "<shown> of <all> entries".
2. The kind chips are `TX_GROUPS` in order: prompt (prompts and steers), responses, provider thinking, tools, usage, recall and seal. Each shows its dot in the frame-class hue, its word and the number of entries of that kind. `txGroup()` toggles one chip and `aria-pressed` follows it.
3. The last chip reads "none" while every chip is on and "all" while any is off. `txAll()` sets every chip to match.
4. "✗ errors" sets `S.tx.errs`. With it on, only failed tool calls show and the run bar adds "errors only". Its title reads "show only failed calls", or "no failures in this run" when the count is zero.
5. "expand the provider’s thinking" sets `S.tx.think` and clears every row you opened by hand. The label turns to "collapse the provider’s thinking".
6. Filters narrow the rows. They never change the burn total the run bar compares against.

### States
Opening another run resets the query, the errors filter and every opened row. On a phone the row wraps: the search field first, with 16 px text so the phone does not zoom on focus, then the chips on as many lines as they need. A build gives each chip a 44 px hit area.

## Transcript

The transcript lists the run's entries in the order they happened: prompts, steers, model text, returned thinking, tool calls with their output, usage, recall and the seal.

### Purpose
You want to read what the agent did in conversation order: what it was asked, what it said, what it ran and what came back, what each model step cost, and where Oxagen decided something. The Decision trace explains the run from the record. This tab is the record itself, one row per entry, with a chip wherever a frame backs the row.

### Rationale
The Decision trace is the one explanation of a run, and the Transcript records it (D8). The transcript is what the agent showed its operator: prompts, answers, tool calls and their output. The gateway's own frames sit behind the ⚖ and frame chips, and the transcript never replaces them. Select a ⚖ chip to see what the gateway recorded for that call. Every row is on the page at once, the feed does not scroll itself, and nothing reveals rows over time (D14). A parked call is held at the gateway for up to 10 minutes, and the model sees a wait with a reason, not a failure. The mockup's parked line once told you to answer from "the card under Governed actions". That tab is gone, and a build names the Approvals drawer and the frame. A compacted run's frames were moved out of the live record into the archive segment, and nothing was recomputed, so the transcript reads the same bytes.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Entries in order | `TRANSCRIPTS`, `txEntries()` | `get_run_transcript` at the `steps` zoom (`run.transcript.get.ts:396`) | live |
| Returned thinking | `TRANSCRIPTS` entries of kind `reasoning` | the `thinking` block (`run.transcript.get.ts:144-152`) | live |
| Decision chips | `TRANSCRIPTS[].gov`, `txGovChip()` | the tool verdict (`run.transcript.get.ts:122-132`) | live |
| Steer rows | entries of kind `steer` | the folded operator command. The delivery mode is on `dispatch_command` | partial |
| Usage, step cost, cost so far, burn | `TRANSCRIPTS[].meta`, `txCostTotal()` | `usage`, `cost`, `cumulativeCost` (`run.transcript.get.ts:298-306`) | live |
| Recall row | `CTXF` | the `recall` kind and the `context.assembled` frame | partial |
| File change blocks | `TRANSCRIPTS[].diff`, `txDiffBlock()` | the tool input, and `get_run_frame_body` for the whole | partial |
| Parked chip | `TRANSCRIPTS[].parked`, `APPROVALS` | the verdict `routed` with `waitingOn`, `list_approvals` | live |
| Compacted banner | `RUNS[].status` | `archiveSegmentRef` on the seal (`run.chain.get.ts:125`) | partial |

### Logic
1. `txEntries()` returns the run's recorded transcript. A run with none gets a projection built from its record: the prompt (the task title and task), the generated summary as text, one usage rollup, and the seal when sealed. The run bar then reads "projected from the run record" in place of the entry count.
2. The run bar shows the task reference, or the run id, the harness mark, agent, model, turns, steps and entries, a status chip ("● live", "⏸ paused", "⏸ parked"), and "burn": the cost of the usage rows in view against the run's total.
3. `txRow()` draws each entry with its clock:
   - prompt: "YOU", the text, the operator, the task and "first prompt".
   - steer: "STEER", the quoted text, who sent it, "delivered at the next boundary", its tokens and a `control.steer` frame chip.
   - text: "AGENT", or "ANSWER" on the last text of a finished run. `txFold()` folds a multi-sentence text to its first sentence.
   - reasoning: "thinking the provider returned" with its line count, folded unless opened.
   - usage: model, input, cache and output tokens, the step's cost, the cost so far (Σ) and a `model.response` chip.
   - recall: the frames, tokens and scores from `CTXF`, the first 3 frames, then the rest on open.
   - tool: ● or ✗, the tool name and arguments on one line, chips for the diff stat, duration, line count, parked approval or "running…", the ⚖ decision, and "⋯" for the raw arguments.
   - complete: "sealed <time>".
4. Tool output shows 6 lines anchored on the first line `txSalient()` finds that starts with error, warning, failed, panic, assert, fatal or exception. A diff shows its first 12 lines. "⋯ N more lines" opens the rest.
5. Every frame chip and ⚖ chip calls `openFrame()`. The recall row's "open the Context tab" opens the Decision trace, and a build labels it by where it goes.
6. With no rows, the feed says "No failed calls in this run.", "Nothing matches this search." or "Nothing to show with these filters."

### States
A compacted run shows the banner "Compacted. This transcript is read from the archive." above the filters. A live run has no ANSWER row and a pending call reads "running…". On a phone each row keeps its clock beside the entry, outputs and diffs scroll inside their own block, and the side column stacks under the feed.
