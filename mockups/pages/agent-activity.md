# Agent › Activity

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents/triage/activity`. `…/triage/runs` and `…/triage/incidents` show this tab in place |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D1, D2 (a run is a child record of exactly one work order; a run started outside Oxagen is filed under a direct work order), D3 (the Fleet runs table becomes each work order's runs and each agent's Activity tab), D9, D17, and the Work sections Objects, Rules and Shipped today. `docs/fleet-operations-ia.md` (Agents: “The work orders this agent worked, their runs, tamper incidents and the accounting”) and `docs/tasks-spec.md` for work orders. Token classes: `docs/mission-control-spec.md` §12.6. The agent header and the tab bar are specified in `agent.md` |
| Design | `mockups/src/wedge.js` → `aActivity()`, `actWork()`, `runParent()`, `fileDirect()`, `woKindBadge()` and `woUrl()`; `mockups/src/engine.js` → `actAccounting()`, `actIncidents()`, `agentTamper()`, `agentTok()` and the dialogs `evidence` and `fix`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Agents / Activity`: Loaded, Loaded · mobile, and Loaded · future-only fields marked |
| Audit | `agent-activity.audit-prompt.md` |

## Job

What the agent did. The tab lists the work orders the agent worked with the runs each one started, what those runs cost by token class, what the last 30 days add up to with any finding open against the agent, and every tamper incident recorded against it. It is where the Fleet page's runs table went for one agent (D3).

## What is on the page

The agent header and the tab bar are as `agent.md` specifies, with Activity selected and its count (1) equal to the tamper incidents recorded against the agent. The body is Work orders across the width, Token accounting beside Last 30 days, then one panel per tamper incident.

**Work orders.** Subtext: “15 work orders with 15 runs in view. A direct one holds a run started from a terminal.” The table groups the agent's runs by the work order each one belongs to. Columns:

| Column | Cell |
|---|---|
| Work order | The work order id in mono (`wo_01K5RP2D6H4KLM8V`) over its title (“Label: flaky worker restart”) |
| Kind | `direct` for a work order Oxagen opened for a run started outside Oxagen, or `dispatched` for one a person sent from Work |
| Runs | Each run id, a link to the run |
| Status | The status of the work order's latest run: sealed, halted, parked for approval, compacted, live |
| Cost | The sum of the runs' cost, USD |
| Started | The latest run's start |

A row opens the work order's page (`#/a-intel/core-platform/work/orders/<id>`); a run id opens the run. List controls: a search field, the facets “Any kind” (when both kinds are in view) and “Any status”, Rows (5, 10, 25, 50, All) and a pager (“1–10 of 15”). On the demo record every one of Triage's work orders is direct; the release manager's include the dispatched `wo_01K5RS7M4N`. An agent with no run in view shows the panel with one line instead, with the agent's 30-day count: “No run of this agent is in view. It has 7 in the last 30 days, and every one is in the audit record.” (`a-intel.core.test-author`).

**Token accounting.** Subtext: “By class, measured on every model call.” The header reads “30 days”. Table, Class · Tokens (30 days) · Rate · Cost:

| Class | Tokens (30 days) | Rate | Cost |
|---|---|---|---|
| Input, uncached | 4,182,904 | $3.00 / M | $12.55 |
| Input, cache write | 1,904,110 | $3.75 / M | $7.14 |
| Input, cache read | 38,441,227 | $0.30 / M | $11.53 |
| Output | 2,610,884 | $15.00 / M | $39.16 |
| Tool definitions | 3,388,808 | counted as input | $10.17 |

A note under the table: “Cache hit rate 87.1% · tool-definition tokens are 7.9% of input. The findings job flags a toolbelt wider than the agent uses, because those tokens are paid on every call whether the tool is used or not.” The mockup's rows are one constant drawn for every agent. They sum to 47,139,125 tokens against Triage's 30-day total of 124,910,766, and the note's 87.1% disagrees with the 83% cached beside it. A build reads the agent's own rollup, so the table, the note and the Tokens row agree.

**Last 30 days.** Subtext: “Read from the run records.” **Open on Spend** in the header opens Spend. Rows: Runs (“1,340”), Spend (“$402.11 USD” over its basis line), Productive ratio (“31%” over “the share of spend on turns that produced a change”) and Tokens (“124,910,766 · 83% cached”). Then each finding open against the agent, as a card: its kind (“Tool-list bloat”), a badge with the money at stake (“$188.40 at stake”), why it was raised (“tool_definition_tokens averages 9,140 per model call, 3.9× the workspace median; 34 of the 52 tools on the toolbelt were not called once in 1,340 runs.”), **Evidence** (opens `evidence`) and **Fix** (opens `fix`). The demo's second finding is “Wrong model class”, $28.05 at stake. With none: “No finding is open against this agent.” Two figures on the mockup disagree with the Overview: the Spend line's basis reads “model calls as the harness reported them, plus priced tool calls” for every agent, though Triage runs on `gateway` and the Overview says “Observed by gateway”; and the finding counts 34 of 52 tools never called where the Overview's Narrow the toolbelt counts 11. A build reads one record for each.

**Tamper incidents.** One panel per incident recorded against the agent. The heading is the incident kind (“Hooks removed”); the caption names when, what detected it, the agent and the host (“2026-09-02 09:38 · Detected by: gateway · a-intel.core.triage · host mbp-01”); two badges give the severity (“warning”) and the status (“resolved”). Rows: What happened, What it stopped, Resolution, then Closed (“2026-09-02 11:20 by Marcus Bell”) or, while open, Owner with its due date, and Incident (`inc_01K4M2A8`). **Open on Audit** opens Audit › Incidents, beside the count of runs affected (“1 run affected”). The demo incident says the Claude Code harness on `mbp-01` lost its hooks, but `mbp-01` runs Codex CLI; the fixture names the wrong harness. A last panel carries the note: “A tamper incident never raises the tier of the frames it touched. The window it covers stays labeled as what was actually observed, which is why the count here and the count on the Audit page are the same number read from the same record.”

With no incident recorded, one panel: “No tamper incident recorded”, subtext “Nothing has been detected on this agent in the retention window.”, the badge “clean · 90 days”, a paragraph naming the detectors that would raise one, and **Open the incident register**.

**Dialogs this tab opens.**

- `evidence`, “Evidence · <finding kind>”, with the finding id, its level, window and basis: At stake, Confidence, Signal and Evidence, then the recent runs with unproductive spend (Run · Task · Started · Cost · Unproductive · What was wasted). The build heads the second column Work order: it names the work order each run served, and the mockup’s Task header predates that vocabulary.
- `fix`, “Fix · <title>”, a help article chosen by the finding kind: why it costs money, what the agent does today, the fix, how to apply it, what it saves, the evidence and where the fix lives, with **Close** and the fix's own action.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Contract paths are under `packages/oxagen/src/contracts/` in `macanderson/oxagen` `main`.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Work orders and their titles | `WORKORDERS`, `fileDirect()` | A work order store; a run's `work_order_id` | Nothing stores a work item, a work order or a workflow. A run's only link to work is `taskRef`, a free-text goal that is null for wrapped runs (`run.list.ts:285-291`) | ❌ |
| Kind (`direct`, `dispatched`) | `w.kind` | Dispatched and direct work orders | No store | ❌ |
| Runs, their status, cost and start | `RUNS` filtered to the agent | `list_runs` rows for the agent | `run.list.ts:476`: status `live`, `sealed` or `halted` (`:52`), cost with its basis, `startedAt`; no agent filter, so the build reads the newest pages for the agent. Parked is a pending approval (`list_approvals`, `agent.approval.list.ts:80`) | 🟡 |
| Token accounting: tokens by class | fixed rows in `actAccounting()` | `get_spend` grouped by agent: `tokens` by class | `spend.get.ts:34`; `input_uncached`, `cache_read`, `cache_write_5m`, `cache_write_1h`, `output`, `reasoning` (`spend.shared.ts:107-116`) | ✅ |
| Rate | fixed rows | The price book entry per model and class | `list_price_entries` (`cost.price_entry.list.ts:51`) | 🟡 |
| Cost per class | fixed rows | The priced cost of each class | `get_spend` prices the group as a whole (`spend.shared.ts:150-160`); no per-class cost | ❌ |
| Tool definitions row and share | fixed rows | Measured tool-definition tokens | `tool_definition_tokens` on `cost.run_totals`, null until a recorder measures it (`packages/database/src/schema/cost.ts:320-321`) | ❌ |
| Cache hit rate | fixed text | Cache read over input for the agent | Derived from `get_spend` tokens; `list_agents` `tokens30d.cacheReadRate` (`agent.list.ts:95-116`) | ✅ |
| Last 30 days: runs, spend, tokens | `a.runs30`, `a.spend30`, `agentTok(a)` | `get_spend` by agent: `runs`, `cost` with basis, `tokens`; `list_agents` | `spend.get.ts:34`; `agent.list.ts:86-116` | ✅ |
| Productive ratio | `a.ratio` | `productiveRatio` | The field exists and stays null until the grading lane writes it (`spend.shared.ts:158`) | 🟡 |
| Findings | `FINDINGS` with `subject` the agent key | `list_findings`, level `agent` | `finding.list.ts:23`; kinds `cache_writes_never_read`, `duplicate_tool_calls`, `repeated_shell_commands`, `unpaged_results` (`finding.shared.ts:15-20`). The demo's Tool-list bloat and Wrong model class are not shipped kinds | 🟡 |
| Evidence and Fix | `evidence`, `fix` | `get_finding_evidence`; `record_finding_fix` | `finding.evidence.get.ts:16`; `finding.fix.record.ts:17` | ✅ |
| Tamper incidents: kind, severity, time, host, status | `INCIDENTS` via `agentTamper()` | `list_incidents` for the agent | `tacho.incident.list.ts:44-104`: `kind`, `severity` (1, 3 or 10), `detectedAt`, `detectedBy`, `hostEnrollmentId`, `sessionId`, `evidence`, `resolvedAt`, `resolutionNote`; ids are `tin_…` | ✅ |
| Detected by | `i.by` | `detectedBy` | Values `collector`, `control_plane`, `human` (`tacho.incident.list.ts:52`); “gateway” is not one | 🟡 |
| What happened, what it stopped | `i.detail`, `i.resolution` | `evidence`; `resolutionNote` | The detector's evidence record and the resolution note, not written prose | 🟡 |
| Closed by, owner and due date | `i.closedBy`, `i.owner`, `i.due` | Who resolved it; who owns an open one | `resolvedAt` only; no resolver, owner or due date | ❌ |
| Runs affected | `i.runs` | The runs an incident touched | One `sessionId` per incident | 🟡 |
| Detector list | fixed text | The tamper kinds | `hooks_removed`, `config_change`, `chain_break`, `checkpoint_lapse`, `token_replay`, `spoofed_event` (`tacho.incident.list.ts:35-42`). The design's list names `credential_probe`, `unknown_tool` bursts, a modified receipt and a same-sequence frame, which are not kinds | 🟡 |

## Future-only fields

The design marks these with `data-future` (they outline with `?future=1`):

| Mark | Reason in the design | What a build shows today |
|---|---|---|
| The Work orders panel | “work orders” | The agent's runs from `list_runs`, one row per run (Run, Status, Cost, Started), under a heading that names runs, with the work order column rendered not recorded |
| Each `direct` badge | “direct work orders” | Not recorded |

Unmarked in the design, and future-only all the same: the cost per class, the Tool definitions row and share, and an incident's resolver, owner and due date. A build renders each as not recorded until its contract ships.

## Functionality

- Every run is a child of exactly one work order (D2). A run the agent started from an operator's terminal is filed under a direct work order that Oxagen opens at the run's first frame, titled from the run's task reference or its first prompt.
- A work order's row rolls up its runs: the cost is their sum, the status is the latest run's, and the start is the latest run's start.
- The token accounting is the agent's own 30-day rollup by class, the same record the Overview's token panel and Spend read. The cache hit rate is cache read over input.
- A finding names the money at stake, measured minus counterfactual over the runs it cites. Findings are work (D9): Work › Findings lists the same finding, and picking it up there makes it a work item.
- The incidents here, the Activity count, the Overview's Tamper incidents stat and the Audit page read one incident record. A tamper incident never raises the tier of the frames it touched.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The panels stack: Work orders, Token accounting, Last 30 days, then the incidents. The work orders table and the token table become cards with labelled cells, and a work order card lists its run ids. Finding cards keep their badge beside the title and wrap their buttons. Dialogs rise from the bottom edge as sheets. Touch targets are at least 44 px and nothing scrolls sideways.

## Permissions

- Read: the agent read (`get_agent`), the run read (`list_runs`), the spend read (`get_spend`), the findings read (`list_findings`) and the incidents read (`list_incidents`). The mockup names the permission `agent.read`.
- Writes, each a governed action recorded in Audit: applying a fix records it with `record_finding_fix`.

## Backend gaps this page depends on

- Work orders: a store, dispatched and direct kinds, and `work_order_id` on the run record beside `taskRef` (wedge spec, open decision 5).
- An agent filter on `list_runs`.
- Cost per token class, and measured tool-definition tokens per agent.
- The grading lane that writes the productive ratio.
- The resolver, owner and due date of an incident, and every run it touched.
- Finding kinds beyond the four the findings job ships, if the design keeps Tool-list bloat and Wrong model class.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- A Steering Source and a SteeringFrame are never shown as each other.
- The runs listed read the record. No inference, no score, no model-written account of why.
- No person is scored or ranked. An incident names who closed it, never a grade.
- Every enforcement claim states the tier. “Enforced” only for calls routed through Oxagen.
- Headers are rollups of the rows beneath them: the work order and run counts in the subtext equal the rows, a work order's cost is the sum of its runs, the token table sums to the agent's 30-day total, the cache rate here equals the Overview's, and the tab count equals the incident panels.
- Every number that is money shows its basis, and a client-attested figure says so.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing. A quoted string above that breaks this rule is a mockup defect to fix, not copy to reproduce.
- Exactly one gold (primary) action per screen. The tab has none of its own.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
