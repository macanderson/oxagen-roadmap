# Agent activity

## Work orders

The work orders this agent worked, each with the runs it started, their status, and their cost.

### Purpose
Answers "what has this agent been doing". A person scans the work orders, opens one to see its stages and runs, or opens a single run. This is where the Fleet page's runs table went for one agent (D3 in `docs/fleet-operations-wedge.md`).

### Rationale
D2 makes every run a child of exactly one work order. A run the agent started from an operator's terminal is filed under a direct work order that Oxagen opens at the run's first frame. So the panel groups runs by their work order and never lists a bare run: a run always answers "what was it for". The kind badge tells a person whether someone sent the work from Work (`dispatched`) or the agent started it outside Oxagen (`direct`).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Work order id and title | `WORKORDERS`, `runParent()`, `fileDirect()` | A work order store; `work_order_id` on the run | future |
| Kind | `w.kind` via `woKindBadge()` | Dispatched and direct work orders | future |
| Runs | `RUNS` filtered to `a.key` | `list_runs` rows for the agent | partial |
| Status | `runStatus()` via `statusBadge()` | `list_runs` status; a parked run is a pending approval | partial |
| Cost | the sum of `R.cost` | `list_runs` cost with its basis | partial |
| Started | `R.started` | `list_runs` `startedAt` | partial |

### Logic
1. `actWork(a)` in `wedge.js` filters `RUNS` to this agent. With none it shows the empty line.
2. Each run finds its parent with `runParent(R)`. A run with no work order is filed by `fileDirect(R)`, which opens a direct work order titled from the run's task title, its task reference, or "Run on <agent>".
3. Runs group under their work order in the order `RUNS` lists them. The caption counts the groups and the runs: "15 work orders with 15 runs in view."
4. Per row, Status is the status of the group's last run, Cost is the sum of its runs' cost in USD, and Started is the last run's start.
5. A row opens the work order's page through `woUrl(w)`. A run id opens the run and stops the row click.
6. The panel carries `data-future` ("work orders"), and so does each `direct` badge.

### States
With no run in view: "No run of this agent is in view. It has N in the last 30 days." Every one of those runs is still in the audit record. Until work orders ship, a build lists the agent's runs from `list_runs`, one row per run, with the work order column not recorded. `list_runs` has no agent filter today, so a build reads the newest pages for the agent. On a phone the table becomes cards, and each card lists its run ids.

## Token accounting

This agent's 30 days of tokens by class, with the rate and cost of each.

### Purpose
Answers "where do this agent's tokens go, and what does each class cost". A person compares input against output, sees how much of the input the cache served, and sees what the tool definitions cost.

### Rationale
Input is priced by class, and a cache read costs a tenth of an uncached token, so the class split explains the bill better than a total. The tool-definition row matters because every definition on the toolbelt is sent with each model call on a toolbelt that sends all tools. The findings job flags a toolbelt wider than the agent uses, because those tokens are paid on every call whether the tool is used or not. The classes follow `docs/mission-control-spec.md` §12.6.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tokens by class | fixed rows in `actAccounting()` | `get_spend` grouped by agent: `tokens` by class | live |
| Rate | fixed rows | `list_price_entries` per model and class | partial |
| Cost per class | fixed rows | A priced cost per class | future |
| Tool definitions row | fixed row | `tool_definition_tokens` on `cost.run_totals` | future |
| Cache hit rate, tool-definition share | fixed text | Cache read over input, from `get_spend` | live |

The mockup draws one constant for every agent. Its rows sum to 47,139,125 tokens against Triage's 30-day total of 124,910,766 in Last 30 days beside it, and the note's 87.1% disagrees with the 83% cached there. The rows do not derive from `agentTok()`. A build reads the agent's own rollup, so the table, the note, and the Tokens row in Last 30 days agree.

### Logic
1. Five rows: input uncached, input cache write, input cache read, output, and tool definitions. Each shows tokens, the rate per million, and the cost in USD.
2. The tool-definition row reads "counted as input" in the Rate column, because those tokens are billed as input.
3. The note states the cache hit rate (cache read over input) and the tool-definition share of input.
4. The header reads "30 days".

### States
Loaded only. A build renders the cost per class and the tool-definition row as not recorded until a priced per-class cost and measured tool-definition tokens ship. On a phone the table becomes cards.

## Last 30 days

This agent's runs, spend, productive ratio, and tokens over 30 days, with every finding open against it.

### Purpose
Answers "what did this agent cost this month, and is anything wrong with how it spends". A person reads the four figures, then acts on a finding with **Evidence** or **Fix**. **Open on Spend** opens Spend for the workspace.

### Rationale
The figures come from the run records, the same rollup the Overview and Spend read, so no two pages can disagree. Findings are work (D9): the same finding is listed on Work › Findings, and picking it up there makes it a work item. A finding names the money at stake, measured minus counterfactual over the runs it cites, so a person can weigh it against the effort of the fix.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Runs | `a.runs30` | `get_spend` by agent; `list_agents` `runs30d` | live |
| Spend and its basis | `a.spend30` | `get_spend` by agent: cost with basis | live |
| Productive ratio | `a.ratio` | `productiveRatio`, null until the grading lane writes it | partial |
| Tokens and cached share | `agentTok(a)` | `list_agents` `tokens30d` | live |
| Findings | `FINDINGS` where `subject` is the agent key | `list_findings`, level `agent` | partial |
| Evidence, Fix | `evidence`, `fix` dialogs | `get_finding_evidence`, `record_finding_fix` | live |

### Logic
1. Runs, Spend, Productive ratio, and Tokens render as rows. Spend carries its basis line: "model calls as the harness reported them, plus priced tool calls".
2. The productive ratio is the share of spend on turns that produced a change.
3. Each finding is a card: its kind, a badge with the money at stake, why it was raised, **Evidence**, and **Fix**. Both dialogs belong to the Spend and Work groups.
4. The mockup's basis line reads the same for every agent, though Triage runs on `gateway`, where the Overview says observed by the gateway. The finding counts 34 of 52 tools never called where the Overview counts 11. A build reads one record for each.

### States
With no finding: "No finding is open against this agent." The demo's Tool-list bloat and Wrong model class are not kinds the findings job ships today. On a phone the finding cards keep their badge beside the title and wrap their buttons.

## Tamper incidents

One panel per tamper incident recorded against this agent, or one panel that says none was.

### Purpose
Answers "has anyone or anything interfered with how this agent is observed". A person reads what happened, what it stopped, and how it was resolved, then opens the incident on Audit.

### Rationale
The incidents here, the Activity tab count, the Overview's Tamper incidents stat, the Health badge on Agents, and the Audit page all read one incident record. A tamper incident never raises the tier of the frames it touched. The window it covers stays labeled as what was actually observed, which is why the count here and the count on Audit are the same number read from the same record. Each detection fires the same commands policy does, and each is a security event with who, why, and what it stopped.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Kind, severity, time, host, status | `INCIDENTS` via `agentTamper()` | `list_incidents` for the agent | live |
| Detected by | `i.by` | `detectedBy`: `collector`, `control_plane`, `human` | partial |
| What happened, what it stopped | `i.detail`, `i.stopped`, `i.resolution` | `evidence`, `resolutionNote` | partial |
| Closed by, owner, due date | `i.closedBy`, `i.owner`, `i.due` | A resolver and an owner | future |
| Runs affected | `i.runs` | The runs an incident touched; one `sessionId` today | partial |
| Detector list | `TAMPER_KINDS` | The shipped tamper kinds | partial |

### Logic
1. `actIncidents(a)` reads `agentTamper(a)`: every incident whose kind is in `TAMPER_KINDS` and whose scope starts with the agent key. `TAMPER_KINDS` holds `hooks_removed`, `chain_break`, `credential_probe`, `unknown_tool`, `receipt_modified`, and `seq_conflict`. `taint_raised` is a policy event, so it is left out.
2. The detectors that would raise one: hooks removed, a chain break, an unknown tool burst, a credential probe, a receipt modified after the fact, and a frame with a sequence number already seen arriving with a different hash. The shipped kinds are `hooks_removed`, `config_change`, `chain_break`, `checkpoint_lapse`, `token_replay`, and `spoofed_event`, so a build lists those.
3. Each incident panel carries `data-help="tamper-incidents"`. Its heading is the kind, its caption names the time, the detector, and the scope, and two badges give severity (critical, warning, info) and status. The border takes the severity's colour.
4. Rows: What happened, What it stopped when recorded, Resolution, then Closed with who and when, or Owner with the due date while open, then the incident id.
5. `agentTamper()` matches the scope by prefix, so `backlog-groomer-us` takes on the incidents of `backlog-groomer`. A build counts the incidents recorded against the agent itself.

### States
With none: "No tamper incident recorded", "Nothing has been detected on this agent in the retention window.", the badge "clean · 90 days", and **Open the incident register**. The demo incident names Claude Code on `mbp-01`, which runs Codex CLI. The fixture names the wrong harness.
