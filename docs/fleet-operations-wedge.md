# Fleet operations wedge

| | |
|---|---|
| **Status** | Draft for review |
| **Date** | 2026-09-24 |
| **Owner** | Mac Anderson |
| **Replaces** | The workspace navigation of `agent-ontology-ia.md` (Fleet first, Tasks as a page, the Steering Library shelves) and the page specs `fleet-operations-collapse.md` lists |
| **Related** | ADR-043, ADR-090, ADR-091, ADR-093 and ADR-113 in `macanderson/oxagen`; `mission-control-spec.md` §8 and §10; `tasks-spec.md`; `fleet-operations-ia.md`; `fleet-operations-routes.md`; `fleet-operations-collapse.md` |
| **Checked against** | `macanderson/oxagen` `main` at `1ba160dbc`, 2026-09-24 |

## The situation

An operator's day starts from the work. A release needs notes, a bug report needs a fix, a finding says a cache write is never read. The rev1 design opens on a run log instead. Work sits on a Tasks page, steering sits on five shelves and four tabs, and the question an operator asks after every run, why it did that, has five partial answers: the Context, Policy and Governed actions tabs of the run, the Compiler, and the agent's Steering tab.

The wedge puts the work first and gives each run one explanation. The operator picks work, sends it to an agent under a mandate, follows the runs it produces, and reads why each run did what it did. Oxagen still does not run the agent (ADR-043). It hands the agent its brief and its steering, answers its governed calls, and keeps the record.

This spec is the design authority for the change. `fleet-operations-ia.md` lays out every view, `fleet-operations-routes.md` maps every old route, and `fleet-operations-collapse.md` lists what is deleted or merged. The page specs in `mockups/pages/` describe each view field by field.

## Decisions

| # | Decision |
|---|---|
| D1 | Work is the primary surface. The workspace opens on Work, whose tabs are Backlog, In progress, Work orders, Workflows and Findings. |
| D2 | A run is a child record of exactly one work order. A run an operator starts outside Oxagen is filed under a direct work order that Oxagen opens for it. |
| D3 | The Fleet page retires. Its population view moves to Agents. Its runs table becomes the runs of each work order and each agent's Activity tab. Its waiting count is the Approvals drawer's count, shown on every page. |
| D4 | A Steering Source and a SteeringFrame are two objects and never collapse into one. A source is durable material a person or an agent wrote. A SteeringFrame is what Oxagen resolved from a source for one run at one injection point. |
| D5 | Every piece of runtime input an agent receives through Oxagen is a SteeringFrame of one of eight types: goal, invariant, constraint, delegation, procedure, context, invocation and capability. |
| D6 | Every frame carries its source, the source version and a hash. A frame whose hash no longer matches its source version is excluded as `steering_drift`. |
| D7 | Steering record is the only name for a record, in product language and in files, schemas, tables, and capabilities (amended 2026-09-25 by ADR-187 in `macanderson/oxagen`). |
| D8 | The Decision trace is the one explanation of a run. It reads the record and adds nothing to it. |
| D9 | Findings are work. They move from Spend to Work, and a finding becomes a work item when a person picks it up. |
| D10 | Spend has three views: Overview, Budgets and Optimization. It has no drill pages. |
| D11 | A mandate is a Steering Source that emits delegation frames. It is managed on the agent's Permissions tab. There is no mandate page. |
| D12 | A skill is a Steering Source: a bundle of instructions, references and optional entrypoints. An entrypoint becomes a capability descriptor, and Oxagen never runs it. There is no Skills console. |
| D13 | Memory and glossary terms are source kinds in one Sources list. A memory becomes a Steering record only through a proposal. There are no Memory or Ontology tabs. |
| D14 | Replay and bisect leave the interface: no Fork replay, no Bisect, no playback transport and no replay grade. The chain and the seal stay, under Evidence. |
| D15 | No person is scored or ranked. Spend reports operator habits as rules the operator can adopt, as the operator review requires (VISION; ADR-113 decision 5). |
| D16 | Approvals and Stella are drawers that open from every page. |
| D17 | Every field in every page spec is marked shipped, partial or future-only against `macanderson/oxagen` `main`. The mockup outlines future-only fields when its URL carries `?future=1`. |

## Vocabulary

Terms are written the way the product writes them. A term in `mono` is a value in a contract or a file, not prose.

### Work

| Term | Meaning | Replaces |
|---|---|---|
| Work | The area where an operator decides what the agents do next | Tasks |
| Work item | One unit of work: an issue, incident, case or ticket from a connected provider, a finding a person picked up, or an item written in Oxagen | task |
| Backlog | Every open work item in the workspace, with its definition of done and its readiness | the Tasks tab |
| Definition of done | The checks a person certifies for one work item before it can be sent. Optional, for bounded work only | unchanged |
| Work order | One or more work items sent to an agent or a workflow, with the brief, the definition of done and the repositories it may change | unchanged |
| Dispatched work order | A work order a person sent from Oxagen | new |
| Direct work order | The work order Oxagen opens for a run an operator started outside Oxagen, titled from the run's task reference or its first prompt | new |
| Workflow | A file in `.oxagen/workflows/` that names stages in order, each with an agent, and ends with a person | unchanged |
| Stage | One step of a workflow. Each attempt at a stage is one run | unchanged |
| Finding | A recorded problem with money or time behind it, and the evidence for it: a cache write never read, a repeated call, an unpaged result | a Spend tab |
| Intake | The connection to an issue provider: what it imports, and how its fields and people map | the Providers, Fields and People tabs |

### Runs

| Term | Meaning | Replaces |
|---|---|---|
| Run | One session of one agent under one operator, on one work order. A child record of that work order | a row in the Fleet log |
| Frame | One recorded event in a run, hash-chained. The request for this change calls these execution frames. The product calls them frames | execution frame |
| Decision trace | The first tab of a run: the SteeringFrames it received, what was excluded and why, the calls it chose, the frames it recorded and the evidence | the Context, Policy and Governed actions tabs |
| Evidence | What supports the run's outcome: outputs, issues, claims, approvals, and the chain and seal | the Issues and Chain and seal tabs |
| Plan change | A new version of a plan the harness recorded: a `TodoWrite` call, an `oxagen:task` frame, or a Stella plan event | new |
| Self-reported uncertainty | A doubt the agent reported in a structured field. Quoted, never estimated | new |

### Steering

| Term | Meaning | Replaces |
|---|---|---|
| Steering Source | Durable material that can steer an agent: a Steering record, a skill, an ADR, the product vision, an agent definition, the workspace instructions, a glossary term, a memory, a policy, a mandate or a toolbelt. Versioned, and changed only by a pull request or by its own governed write | Library item, artifact |
| Steering record | A published rule, constraint, procedure, fact, preference, skill, or memory, one Markdown file per record in `.oxagen/steering/` | The record's former name |
| SteeringFrame | One resolved piece of runtime input for one run at one injection point: its type, its body or descriptor, its force, its token cost and its provenance. Fixed once recorded | SteeringItem (ADR-093), context frame |
| Frame type | One of eight: `goal`, `invariant`, `constraint`, `delegation`, `procedure`, `context`, `invocation`, `capability` | kind, for this purpose |
| Envelope | Every SteeringFrame one run received, grouped by injection point | the compiled bundle, the window |
| Injection point | Where a SteeringFrame enters: session start, the prompt (the brief that starts the run), prompt submit, MCP tool results, checkout files, the tool list (the belt's tools, as `capability` frames) or the model request. ADR-093 §4 names five of them, and the wedge adds the prompt and the tool list | ADR-093's five, plus two |
| Provenance | A frame's source kind and id, the source version (a commit, a ledger version, a grant version or a work order digest) and the frame's hash | unchanged |
| Assignment | Which sources apply to which agents, repositories and workspaces | unchanged |
| Compiler | The Steering view that resolves the envelope for one agent and one brief, and sends nothing | Preview |
| Proposal | A candidate change to a Steering Source, from an agent's memory, a finding, an operator's steer or a person | suggestion, candidate |
| Exclusion | A frame the assembler resolved and did not deliver, with a reason from a closed vocabulary | cut |

### Brand words

`frame` keeps its brand meaning: one recorded event in a run. SteeringFrame is one word, so the two never read as the same thing. The brand word list keeps invocation, execution and trace out of customer prose (`oxagen-branding`, `references/words.md`). This spec follows it, with two exceptions the wedge fixes by name: Decision trace, which names a view and never a run, and `invocation`, which is a frame type value shown in mono. Prose says brief: "the brief the work order sent".

## Work

### Objects

```
Provider issue ─┐
Finding ────────┼─▶ Work item ──sent in──▶ Work order ──starts──▶ Run ──records──▶ Frame
Written here ───┘                           │
                                  Workflow ─┴─ Stage (one run per attempt)
```

- A work item arrives from a connected provider (GitHub, Linear, Jira, ServiceNow, Salesforce Service Cloud or Zendesk), from a finding a person picked up, or from a person writing it in Oxagen.
- A work item is ready when a person certifies its definition of done (`tasks-spec.md` §8).
- A work order sends one or more ready items to an agent the sender operates, or to a published workflow. It carries the brief, the merged definition of done, the repositories it may change and a cap.
- `oxagen work start <wo>` starts the harness with the brief as its first prompt (`tasks-spec.md` §9.6). A workflow stage starts one run per attempt.
- A run started outside Oxagen, from an operator's own terminal, is filed under a direct work order. Oxagen opens it at the run's first frame, titles it from the run's task reference or first prompt, and names the operator as its sender. The operator can attach it to a backlog item later.
- A work order is done when a person accepts every item. Accepting merges nothing.

### Rules

1. No run exists without a parent work order. A direct work order is opened, never skipped.
2. The Run page names its parent work order in its header and in its breadcrumb: Work, the work order, then the run.
3. The run route stays flat: `/{org}/{ws}/runs/{run}`. A run's public id identifies it without its parent, the same reasoning `routes.mandate` in `safe-path.ts` records for a flat route.
4. Spend attributes a run to its work order. The run's task reference records the work order id (`tasks-spec.md` §9.6).

### Shipped today

Nothing in `macanderson/oxagen` stores a work item, a work order, a workflow or an intake connection. The run record's only link to work is `taskRef`, a free-text goal that is null for wrapped runs (`packages/oxagen/src/contracts/run.list.ts:285-291`, `packages/handlers/src/run.list.ts:1277`). `dispatch_command` controls a run (pause, resume, cancel, steer and message). It does not send work. Every Work view is future-only, and its page spec says so field by field.

## Steering

### Two objects

| | Steering Source | SteeringFrame |
|---|---|---|
| What it is | Durable material that can steer an agent | One resolved piece of input for one run at one injection point |
| Lifetime | Until a pull request or its own governed write retires it | Fixed when recorded |
| Written by | A person, or an agent for a memory | The assembler, from a source at a version |
| Identity | Its path or id: `ctx.release.never-merge`, `a-intel.release-notes-from-prs`, `ADR-021` | `<type>:<source id>@<first 12 hex of hash>` |
| Versioned by | Git commits, the promotion ledger or a grant version | The source version it names |
| Where a person sees it | Steering › Sources, and the source's own page | Steering › Compiler, the agent's Steering tab and the run's Decision trace |

A page never shows a frame as its source, or a source as a frame. A Sources row links to the frames it emits. A frame row links to the source version it came from.

### Frame types

| Type | Tells the agent | Delivered | Budget |
|---|---|---|---|
| `goal` | The outcome the work serves | The prefix, or the prompt when a work order carries it | Never cut for budget. A prefix that cannot hold it fails the publication check |
| `invariant` | A constraint that holds for every run in its scope and that no narrower source, work order or steer can relax | The prefix, first | Never cut |
| `constraint` | A requirement or prohibition for this scope | The prefix when `must` or `should`, the volatile selection when `may` | Cut only in the volatile selection |
| `delegation` | Authority a person delegated: what, how much and until when | The prefix | Never cut. The gate plane also enforces it |
| `procedure` | How to do something | The prefix or the volatile selection, by force | Can be cut |
| `context` | A fact the agent needs | The volatile selection, or files in the checkout | Can be cut |
| `invocation` | What the agent was asked to do, and by whom | The prompt | Never cut. It is the prompt |
| `capability` | A callable the agent may use, described: a tool on its belt or a skill entrypoint | The tool list, or files in the checkout | Excluded when a gate denies it |

Force keeps ADR-093's meaning (`must`, `should`, `may`, `info`) and decides between the prefix and the volatile selection. Type says what the frame is for. They are separate fields, the same way ADR-093 §2 keeps a record's six-way kind apart from the item kind.

### Emissions

| Source kind | Lives in | Emits | Rule |
|---|---|---|---|
| Product vision | A document named in `.oxagen/sources.toml`, such as `docs/VISION.md` | `goal`, `constraint`, `context` | Only from the sections the registration names |
| ADR | `docs/adr/*.md`, named the same way | `context`, `constraint`, `procedure`, `invariant` | Only an accepted ADR emits. An invariant comes only from a section the ADR declares as its invariants. A superseded ADR emits nothing |
| Steering record | `.oxagen/rules/ctx.*.toml` | rule and constraint as `constraint`, procedure as `procedure`, fact, preference and memory as `context` | The record's six kinds are unchanged |
| Skill | `.oxagen/skills/<id>/` | `procedure` from SKILL.md, `context` from each reference file, `capability` from each declared entrypoint | Oxagen never runs an entrypoint. A withheld skill emits nothing (ADR-090) |
| Agent definition | `.oxagen/agents/<slug>.toml` | `procedure` from its instructions | Its purpose is identity, not steering |
| Workspace instructions | Workspace settings | `procedure` | Force `should` (ADR-093 §3) |
| Glossary term | `.oxagen/ontology/*.toml` | `context` | Was an ontology note |
| Memory | Records an agent appends | `context` | Force never above `may`. It becomes a Steering record only through a proposal |
| Policy | Tools › Policy and the kill switches | `constraint`, one gate notice per gate | The notice names the gate that enforces it. Removing a notice never removes its gate |
| Mandate | The agent's Permissions tab | `delegation`, one per active mandate | Carries the person who granted it, the measures, the limits and the window |
| Toolbelt | Tools › Toolbelts | `capability`, one per tool the belt shows the model | A harness's own tools, such as Bash in Claude Code, are not frames. Oxagen did not put them there |

Three runtime inputs emit frames without being sources. Each frame carries provenance to its record.

| Input | Emits | Provenance |
|---|---|---|
| A work order, when sent | `invocation` (the brief), `goal` (each item's outcome) and `constraint` (each definition-of-done item, the repositories and the cap) | The work order id and its prompt digest |
| A workflow stage | `invocation` (the stage brief), `constraint` (the items the stage owns) and `context` (the previous stage's handoff note, quoted and never an instruction) | The work order id, the stage and the prior run id |
| An operator's steer | `invocation` | The control command id and the digest of the steer text |

### Reading a source

Oxagen reads frames out of a source by its declared structure. It never asks a model what a document means. A Steering record declares its kind and force in the file. A skill declares its entrypoints in its manifest. A document such as the vision or an ADR becomes a source when `.oxagen/sources.toml` names it and says which of its sections emit which types. That file changes by pull request, like every other source. The same source at the same version always emits the same frames.

### Provenance

Every SteeringFrame carries these fields.

| Field | Meaning |
|---|---|
| `type` | One of the eight frame types |
| `source.kind` | One of the source kinds above, or `work_order`, `stage` or `steer` |
| `source.id` | The source's id or path |
| `source.version` | A commit for a file, a ledger version for a record, a grant version for a mandate, a digest for a work order |
| `hash` | SHA-256 over the canonical frame body |
| `injection_point` | Where it entered |
| `force` | `must`, `should`, `may` or `info` |
| `token_cost` | Estimated tokens, computed once by the adapter |

The assembler checks each frame's hash against its source version before it delivers the frame. A mismatch excludes the frame as `steering_drift` and raises the incident of spec §10.2.

### Exclusion reasons

The closed vocabulary of spec §10.5, with `tier` from today's manifest, `unapproved_digest` from skill resolution and `overridden_by_must` from the assembler's precedence rule.

| Reason | Meaning | Recorded today |
|---|---|---|
| `tier` | A `may` or `info` frame that the session-start delivery does not carry | Yes, in `steering.manifest` |
| `over_budget` | It did not fit the token budget | Yes, recorded as `budget` |
| `superseded` | A newer version of the same lineage won | Yes |
| `below_relevance_floor` | It scored under the floor for this prompt | No |
| `out_of_scope` | Its scope does not match the run | Only for skills, in `preview_skill_search` |
| `widens_workspace_scope` | A repository source tried to widen a workspace source | No |
| `overridden_by_gate` | A gate disagrees, and the gate's notice is delivered instead | No |
| `steering_drift` | Its hash does not match its source version | No |
| `prefix_overflow` | The session-start prefix is full | No |
| `duplicate` | Another frame carries the same body | No |
| `source_unavailable` | Its source did not answer in time | No |
| `overridden_by_must` | A published `must` outranks recalled memory on the same concern | No. Today's manifest has no reason for it |
| `unapproved_digest` | A skill whose digest changed after a person approved it | Yes, in `preview_skill_search` |

Each exclusion names the numbers that decided it: the budget, what was already spent, the frame's cost, its score, or the newer version. The same sources, run and budget give the same exclusions.

### Shipped today

- `steering.manifest` is a recorded frame kind. Its items carry id, kind, force, tokens, outcome (`included` or `cut`) and reason (`tier`, `budget` or `superseded`). They carry no scope, hash, provenance or body (`packages/tacho/src/wire.ts:626-697`).
- The assembler (`packages/steering-assembler/src/assemble.ts`) ranks candidates of kind `record`, `steer`, `skill`, `memory`, `ontology`, `policy` and `instruction`, but only `record` and `steer` are produced. Its budget is 2,000 tokens.
- A Steering record's source fields ship through `list_records` and `get_record`: lineage, kind, force, constraint effect, sharing scope, statement, status, version, checksum, commit, path, published time, versions and the pull request.
- Proposals and Steering PRs ship through `list_proposals`, `get_steering_pr`, `open_steering_pr` and `merge_steering_pr`.
- No capability runs the assembler without delivering (#3879), so the Compiler is future-only.
- Frame types, provenance per frame, the vision and ADR source kinds, `.oxagen/sources.toml`, delegation frames, capability frames and work order frames are future-only.

## Decision trace

The first tab of every run. It answers why the run did what it did, from the record alone.

### Sections

| # | Section | Shows | Reads |
|---|---|---|---|
| 1 | Envelope | The SteeringFrames the run received, by injection point and then by type, each with its source, version, hash, force and tokens | `steering.manifest` frames, and the sources at the versions they name |
| 2 | Exclusions | Each frame resolved and not delivered, its reason and the numbers that decided it | The same manifests |
| 3 | Choices | Each call the agent chose: what its belt offered, what it called, and the rule's answer (allowed, denied or routed to a person) with the rule and the policy version. For skills: what was searched, found, withheld and loaded | `tool_requested`, `policy_decision`, `harness_permission` and approval frames; skill resolution frames |
| 4 | Frames | The run's recorded frames by turn and by class, each linking into the Transcript | `get_run`, `get_run_turns` |
| 5 | Plan changes | Each version of the plan the harness recorded, what changed, and the frame that changed it | `TodoWrite` calls, `oxagen:task` frames, Stella plan events |
| 6 | Self-reported uncertainty | Each doubt the agent reported, quoted, with its frame | A structured report: the agent's call to Oxagen's `report_status` tool, or the uncertainty field of a Stella or ARP report |
| 7 | Evidence | The outputs, the definition-of-done claims and who accepted them, the approvals decided, and the chain's state | `get_run_work`, the work order's claims, approval frames, `get_run_chain` |

Sections 5 and 6 appear only when the record holds them. A run with neither shows one line: the harness recorded no plan, and the agent reported no uncertainty.

### Honesty rules

1. The trace reads the record. It adds no inference, no score and no model-written account of why.
2. Oxagen has no access to a model's hidden reasoning. When a provider returns thinking text, the Transcript shows it as returned and says the provider may summarize or redact it. The trace never presents it as how the model decided, and never claims it is complete.
3. An exclusion is deterministic. It names a reason from the closed vocabulary and the numbers that decided it.
4. A plan change appears only when the harness recorded a plan. Oxagen does not rebuild a plan from the agent's prose.
5. Uncertainty appears only when the agent reported it in a structured field. Oxagen does not estimate confidence and does not read doubt out of prose.
6. Every enforcement claim states the run's tier. An `observe` run was recorded, not enforced.

### Shipped today

- Frames, turns, the chain and a run's checkouts, diffs and pull requests ship (`get_run`, `get_run_turns`, `get_run_chain`, `get_run_work`).
- `policy_decision` ships with the decision, its source, the rule, a reason code and the risk grade (`packages/tacho/src/envelope.ts:67-74`). Approval frames ship.
- Plan changes are partial. `TodoWrite`, `TodoRead` and `ExitPlanMode` are recorded as ordinary tool calls, and `oxagen:task` frames record Claude Code's own task list. No frame marks a plan version.
- Skill resolution frames (`skills.searched`, `skills.resolved`, `skills.loaded`) are not produced. Nothing records self-reported uncertainty, and `report_status` does not exist.
- The provider's thinking text is recorded in the transcript as `kind: "thinking"` (`packages/oxagen/src/contracts/run.transcript.get.ts:147-151`). Redaction removes credentials only.

## Navigation

Workspace: Work, Agents, Tools, Steering, Runtimes, Spend and Repositories. Organization: Organization, Billing and Audit, unchanged. Drawers: Approvals and Stella, from every page. `fleet-operations-ia.md` has every view, its tabs, its primary action and its story.

## Cuts

| Cut | Where it went |
|---|---|
| The Skills console (Catalog, Search, In the loop, Reflection, Versions) | Skills are Steering Sources. Search is the Compiler. The interjection stays in the Approvals drawer. `.oxagen/skills.toml` is a setting on Sources |
| Skill reflection | Deleted. ADR-090 decision 7 kept it research-only, and nothing reads it |
| The Mandate page | The Delegation section of the agent's Permissions tab, and delegation frames |
| Replay and bisect: Fork replay, Bisect, both playback transports and replay grades | Deleted from the interface. The chain and the seal stay under Evidence |
| The Steering shelves: Records, Instructions, Skills, Memory, Ontology | One Sources list with a kind filter |
| Memory and Ontology management | Memory and glossary terms are source kinds. A memory reaches a Steering record through a proposal |
| The Spend drill pages and seven of its nine tabs | Overview groups by work order, operator, agent, model or tool, with a side panel for one key |
| Operator scores and severity ranking | Operator habits as rules to adopt, in alphabetical order, with no rank and no verdict |
| The Fleet page | Work (what waits on you, what is live), Agents (the population), and each work order's runs |
| Steering › Gates | Tools › Policy owns gates. Gate notices are constraint frames on Sources |
| The agent's Definition in git tab | The agent's source page |
| The Providers, Fields and People tabs of Tasks | The Intake dialog on Backlog |

## Unchanged

Organization, Billing, Audit, the sign-in and onboarding flows, Register agent, Runtimes, Repositories, the five Tools tabs, the approvals card and the Stella drawer keep their design. Their page specs change only where a word changed or a link moved.

## Open decisions

1. ADR-113 decision 7 keeps Fleet as a page name. Retiring the page needs an amendment in `macanderson/oxagen` before the app changes. Fleet stays the operator's word for the enrolled agents.
2. The brand word list keeps invocation out of prose. This spec uses `invocation` only as a frame type value. The message registry in `oxagenai/oxagen-brand` decides the label a person reads.
3. `.oxagen/sources.toml` is a new file in the workspace layout (spec §10.2). It needs an ADR beside ADR-093.
4. `report_status`, the Oxagen MCP tool an agent calls to report its status and its doubts, is a new capability and needs a contract.
5. Direct work orders change what a run's parent means for Spend and Audit. The run record needs a `work_order_id` beside `taskRef`.
