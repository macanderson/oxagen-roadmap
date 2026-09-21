# Spend

| | |
|---|---|
| Route | `#/a-intel/core-platform/spend[/<tab>[/<drill>]]` |
| Scope | workspace |
| Spec | §12.6 token classes, §12.7 attribution, §12.8 findings, §14 Mission Control; Appendix F page 7 |
| Design | `mockups/src/engine.js` → `pSpend()` (with `spendTokens`, `spendCoaching`, `spendDrill`, `spendByTool`, `spendWaste`, `spendAgentHistory`), built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / … / spend`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `spend.audit-prompt.md` |

## Job

What the tokens bought, with the basis on every number: findings ranked by the money at stake, tokens by class, prompt part and harness, coaching for each agent and operator, spend by operator, agent, model and tool, wasted spend by cause, and budgets.

## What is on the page

**Header**: eyebrow "<workspace name>", h1 "Spend", subtext "What the tokens bought, with the basis on every number."
Actions: **Export report** (opens `spendexport`), **Set a budget** (gold; opens `budget`).

**Summary tiles** (one number and one basis line each; hidden on a drill):
- **Spend**: $ of the month, basis `gateway_observed` + `client_attested`, USD.
- **Tokens**: the month's tokens, "N% served from cache".
- **Observed by the gateway**: %, "of tokens counted by the proxy".
- **Wasted**: $ in the critical colour, "N% of spend".

**Tabs**: Findings (N), Tokens, Coaching (N), By operator, By agent, By tool, Wasted spend (N), Budgets (N).

- **Findings**: a hero (eyebrow "Savings identified", the total at stake, "N% of $ spent this month · about $ a year at this run rate", a share strip with a legend of the eight largest kinds plus "N smaller findings", and the facts N findings, N operators involved, N high confidence and N medium, "every one opens to its evidence"). Filters: Level (agent, operator, tool, workspace), Confidence (high, medium), Sort (Rank, Savings high first, Savings low first, Finding A–Z), Rows, pager. Ranked cards: rank, kind, level badge, confidence badge, operator and agent, the finding, "evidence <runs and calls> · <window> · trend", the amount "at stake · N% of identified", a share bar, **Evidence** (opens `evidence`), **Fix** (opens `fix`). A note beneath states the method.
- **Tokens**: **By token class** (Class, Tokens, Share, Cost for `input_uncached`, `cache_read`, `cache_write`, `output`, `reasoning`; header "N tokens · <month>"; beneath: Cache hit rate, Cache write cost share, Effective input price, Unmapped classes). **Prompt composition** (meters for Conversation, Tool results, Context frames, Tool definitions, Steering, System, Output, Reasoning; "measured from the request, every call"). **By harness** (badge "N% of tokens observed by the gateway"; Harness, Agents, Tokens, Cache hit, Spend, Basis). **By agent** (Agent, Runs, Tokens, Per run, Cache hit, Tool defs, Context, Tool results, Reasoning, Basis; the twelve largest; a row opens the agent page).
- **Coaching**: tiles Agent coaching (N, "$ a month at stake"), Operator coaching (N, "$ a month at stake"), Signals read (7, "from the token record"), Memories aggregated (N, link "Steering memory"). Sub-tabs **Agent coaching (N)** and **Operator coaching (N)**. Agents rank by money at stake, eight a page ("agents 1–8 of N · ranked by money at stake"); each panel shows the agent card, "N tok · cache N% · observed" or "self-reported", an "N items" badge, and one card per item: a severity badge with the title, "$ a month" or "no dollar figure", the signal line with its tokens, one paragraph, the one action (Edit the grant, Open steering, Propose a record, Preview the window, Edit the definition, Open incidents), and **Send to the operator**. Agent signals: Narrow the belt, Keep the prefix stable, Page the tool results, Lower the context budget, Route classification-shaped work to a light model, Stop the retry storms, Stop writing cache for one-turn runs. Operator panels show the person, "N agents · N tok · cache N% · N% observed", and their items: Grants are wider than the work, Prompts that make the agent re-read, Get to one prompt per session (prompts per session over 1.5, with runs and one-shot count), Publish steering between runs, Resize the budget before it stops a run, Move the last self-reported agents behind the gateway (actions Open Identities, Write a record, Open steering, Set a budget). An agent with nothing to change says "Every share is inside the workspace norm and the cache holds. Nothing to change."
- **By operator**: Operator, Role, Agents, Runs, Spend, Tokens, Cache hit, Potential savings (with the finding count), Budget position (bar and "N% of $"). A row drills to `/spend/operator/<id>`. A note says every run has exactly one operator.
- **By agent**: Agent, Runs, Spend, Tokens, Per run, Cache hit, Potential savings, Trend; a row drills to `/spend/agent/<key>`. A note says a harness-tier agent is self-reported and an absent class is marked absent, never zero. **Models and keys**: Model, Provider key, Model calls, Spend, Cache hit rate, Basis; a Total row equal to the month's spend; a footer links Oxagen's own routes to Organization → Model routes.
- **By tool**: three meter panels **Cumulative spend**, **Average per call**, **Average per run**; the table Tool, Server, Calls, Runs, Cumulative, Share, Avg per call, Avg per run, Potential savings, What the frames say; a row drills to `/spend/tool/<name>`.
- **Wasted spend**: tiles Wasted (`client_attested`, USD), Share of spend, Runs with waste, Largest cause. **By cause** meters: cache misses, corrective prompts, retry loops, context bloat, idle while parked, halted early, each with its runs, amount and one line of why. **Runs with waste**: one card per run (id, agent, operator, started, "$ wasted of $", badges naming what was wrong, a bar, the task and what was wasted, frames, steps, cache and model), **Open the run**, **Show the frames**.
- **Budgets**: Scope, Period, Limit, Used, Mode (hard or soft), Position; **Set a budget**.
- **Drill** (`/spend/<operator|agent|tool>/<id>`): a crumb bar "← By operator / <name>", eyebrow, h2 and one line of counts; actions **Open the agent** (agent only) and **Export this view**; a hero "Potential savings" with a share strip and "N on this <kind> directly · N attributed through evidence"; stat tiles (operator: Spend, Tokens, Cache hit rate, Observed, Wasted, Productive ratio, Runs, Model calls, Budget position, Trend; agent: Spend, Tokens, Cache hit rate, Tool definitions, Wasted, Spend per run, Productive ratio, Model calls, Trend, Budget; tool: Spend, Calls, Average per call, Average per run, Result body, Repeat calls, Retries, Cache hit rate, Wasted, Trend); **Spend by day** (a 30-day sparkline with peak and average); for an agent with history, **Monthly spend per run** and **Token use**; three cross-cut panels (By agent, By operator, By tool, By model as the kind allows); **Findings** for the entity.

**Dialogs this page opens:** `spendexport`, `budget`, `evidence`, `fix`, `incident` (error state), `request-access` (denied state).

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet, Agent IAM, Tools, Steering, Repositories, Spend; Organization nav: Organization, Billing, Audit; the assistant launcher, agent count, data plane and connection badge at the foot), top bar (Menu, breadcrumbs, ⌘K "Search or run an action", Notifications with the unread count, **Approvals** with the count of everything waiting on you across the organization, account avatar → Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). The Approvals button opens the right-hand drawer `#apdrawer`: heading "Approvals" with an "N waiting" badge and a close button, an open interjection row with **Answer it**, one row per pending approval (tool and amount, agent, task, workspace, risk badges, countdown), the full approval card with **Approve** and **Deny** when a row is picked and "‹ All approvals" to return, "N resolved today" beneath. Escape closes it. There is no assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the function in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Totals, by operator, agent, model | `SPEND` | `cost.run_totals`, `cost.daily_totals` | ClickHouse `token_usage`, `usage_events`; `billing.usage.breakdown` | 🟡 |
| Tokens by class, prompt part, harness | `agentTok`, `operatorTok`, `wsTok` | `cost.run_totals`, `cost.daily_totals` with `tool_definition_tokens`, `context_frame_tokens`, `steering_tokens`, `cache_hit_rate`, `retries`; `get_spend`, `get_run_cost` | ClickHouse `token_usage` | 🟡 |
| Coaching | `coachAgent`, `coachOperator`, `operatorPrompts` | derived at read time from the same rollup; `list_coaching` (read, `noBillingGate`) | none | ❌ |
| By tool | `SPEND.byTool`, `SPEND_DETAIL` | `control.tool_calls` × price | ClickHouse `tool_invocations` | 🟡 |
| Findings, evidence, fix | `FINDINGS`, `EVIDENCE`, `FIX` | findings job (M2) | none | ❌ (G4) |
| Wasted spend by cause and run | `SPEND.wasteByCause`, `SPEND.wasteRunsList`, `runWaste` | `cost.run_totals` | none | ❌ (G4) |
| Budgets | `SPEND.budgets` | `billing.budgets` | `billing.spend_budgets`; `billing.budget.{get,set}` | ✅ |

## Functionality

- Each saving is measured minus counterfactual over the runs it cites, at the price each call actually paid. Evidence opens the runs, the people and the arithmetic; Fix opens the change that removes it (a Context PR or a help article by finding kind).
- Every tile is a rollup of the rows beneath it: the Spend tile equals the Total row of Models and keys, and the Tokens tile equals the By token class total. Coaching derives at read time from the same rollup the Tokens tab prints, so the two cannot disagree.
- Tokens are counted per model call by class and by prompt part (conversation, tool results, context frames, tool definitions, steering, system). Observed means the gateway proxy counted them from the bytes that passed through it. Self-reported means the harness said so; a class it does not report is marked absent, never zero, and a cache hit rate over a mixed fleet is never computed from missing data as if it were zero.
- Every run has exactly one operator. A run that arrived without one is attributed to the agent's owning operator and flagged, never dropped and never spread.
- A prompt after the first is corrective. Its cost counts toward wasted spend as "corrective prompts", and an operator averaging more than 1.5 prompts a session gets the coaching item "Get to one prompt per session".
- Wasted is a claim about frames, not about outcomes. Work a human accepted is never counted.
- A hard budget is checked at each hook boundary from a running counter fed by what each harness reports. A breach is a `policy.decision` frame and a pause at the next boundary. A soft budget records and reports and never blocks.
- Sending a coaching note is a governed action. Nothing on this page changes an agent by itself.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: "No spend to report yet". Rollups are derived indexes rebuilt from frames. With no model call recorded there is nothing to roll up, and nothing billable. Action: **Back to Fleet**.
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: "Spend could not be loaded". The control plane answered `504 rollup_rebuild_in_progress`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied**: "You cannot see this workspace's spend". Your roles on the organization do not include `spend.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it. Actions: **Request access** (opens `request-access`), **Back to Fleet**. Below: *Signed in as* (name, role), *Needed* (the permission), *Decided by* (`pol_v41`, deny wins over every allow).

## Mobile

The top bar collapses to hamburger, current crumb, search glyph, notifications, approvals and avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. The approvals drawer opens full-width. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are at least 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `spend.read`
- Writes (each a governed action recorded in Audit): `budget.set`, `spend.export`, `incident.open`, a coaching note sent to an operator

## Backend gaps this page depends on

- G3 price book and rollup
- G4 findings job (findings, evidence, fix, wasted spend by cause)
- Token classes and prompt parts on `cost.run_totals` and `cost.daily_totals` (§12.6)
- `list_coaching` contract

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested figure is labelled as such and is never rendered as observed.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
