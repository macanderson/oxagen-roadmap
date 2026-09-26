# In-app agent capability expansion

| | |
|---|---|
| **Status** | Proposed roadmap — design and architecture review |
| **Date** | 2026-09-24 |
| **Owner** | Oxagen product and platform |
| **Audience** | Engineering, engineering management, product, design, platform and security |
| **Scope** | The in-app agent's ability to understand, visualize, create, change and distribute work |
| **Current baseline** | Execution and tracing, agent memory, knowledge graph and ontology traversal, tool discovery and loading |

## 1. Executive summary

The in-app agent should become a permissioned work copilot for engineers and engineering managers.
It should be able to answer questions about the workspace, explain the evidence behind an answer,
render charts and relationship views, create durable artifacts, and take approved actions through the
same product surfaces a person can use.

The target is not a second chat surface with a larger prompt. It is an agent that can operate across
the product's read, analysis, creation, action and distribution loops while preserving the product's
existing identity, entitlement, consent, audit and provenance controls.

The current tool set is a strong foundation for inspecting agent executions and the graph behind
them, but it is not yet a general work interface. The largest product change is to move from a
graph-centric assistant to an **app-capable agent** with four explicit abilities:

1. **Understand** — retrieve current workspace state and source evidence across connected systems.
2. **Make sense** — compare, summarize, calculate, visualize and explain uncertainty.
3. **Make** — produce charts, reports, documents, presentations, plans and other artifacts.
4. **Act** — create, edit, link, assign, approve, publish and distribute through governed mutations.

The roadmap is intentionally phased. Read and provenance capabilities arrive before writes; a
deterministic artifact layer arrives before high-stakes distribution; and every mutating capability
is mediated by a preview, consent and audit contract.

## 2. Product intent

### 2.1 North-star experience

An engineering manager can ask:

> “What is putting the Q4 platform plan at risk? Show me the evidence, chart throughput and aging,
> trace the dependencies, draft a leadership-ready brief, and prepare the three backlog changes you
> recommend. Do not apply anything until I approve the plan.”

The agent should be able to:

- find the relevant projects, repositories, tasks, designs, decisions, incidents, people, metrics and
  prior agent work;
- distinguish source facts from derived analysis and recommendations;
- show the relationships and time windows used in its reasoning;
- render a chart, graph or table inline and preserve the underlying data and query;
- produce a reviewable artifact such as HTML, Markdown, PDF, a slide deck, CSV or JSON;
- stage changes as a named plan with a precise diff and affected objects;
- ask for consent only at the boundary that needs it;
- execute approved changes through the same IAM, entitlement, policy and audit gates as the app;
- cite source records and retain the artifact's provenance for later review.

### 2.2 Primary users and jobs

| User | High-value jobs |
|---|---|
| Engineer | Understand a service, trace an incident, explain a change, find related work, prepare a technical decision record, update a task or document with approval |
| Engineering manager | See delivery health, identify risks and bottlenecks, compare plans, prepare staff/leadership updates, rebalance backlog, assign or sequence work |
| Product or technical leader | Understand strategy execution, review investment and dependency risk, generate board or leadership material, distribute a decision-ready brief |
| Platform or security operator | Inspect agent activity, verify provenance, constrain tools, review proposed mutations, investigate denied or anomalous actions |

## 3. Current state and gap

### 3.1 Current tool categories

The agent currently has access to the following categories:

| Category | Current tools | Current posture |
|---|---|---|
| Execution & tracing | `list_executions`, `get_execution_trace` | Read-only inspection of agent runs and span trees |
| Agent Memory | `recall_memory`, `save_memory`, `cite_reference` | Semantic recall plus governed memory writes and citations |
| Knowledge Graph & Ontology | `get_ontology_neighbors`, `query_ontology` | Read-only graph traversal, limited to the current model |
| Tool discovery | `search_tools`, `load_tools` | Discover and load additional tools subject to gates |

All current calls pass through IAM, entitlement and consent gates. That contract remains a
non-negotiable foundation for the roadmap.

### 3.2 Gaps to close

| Gap | User impact |
|---|---|
| No app-surface parity | The agent cannot inspect or operate on many things a person can see or change in the app |
| Graph is too narrow a mental model | Users have to ask for ontology traversal instead of asking about work, evidence or outcomes |
| No analysis runtime | The agent can retrieve relationships but cannot reliably calculate, compare or model trends |
| No first-class visual output | Answers remain text-heavy when a chart, timeline, graph or matrix would be clearer |
| No artifact lifecycle | Useful analysis disappears in chat instead of becoming a durable, reviewable deliverable |
| No governed action plan | The agent cannot prepare and apply multi-object changes with a visible preview and approval boundary |
| No distribution path | Board, leadership and team outputs require manual copying and reformatting |
| Weak source-to-output traceability | Readers cannot easily tell which records support a number, claim or recommendation |

## 4. Terminology and information architecture

### 4.1 Retire ontology as the user-facing concept

“Ontology” no longer describes the whole capability users need. It describes one implementation
concern: the typed schema and relationship vocabulary that makes workspace data traversable. It
should remain available to platform and governance teams, but it should stop being the primary product
label for the agent's understanding of work.

Use **Workspace Context** as the user-facing concept.

Workspace Context is the evidence-backed understanding of a workspace, composed of:

```
Workspace Context
├── Sources       documents, tasks, repositories, designs, events, metrics, runs
├── Entities      people, teams, services, projects, initiatives, decisions, artifacts
├── Relationships dependencies, ownership, sequence, impact, reference, contradiction
├── Evidence      source spans, timestamps, snapshots, permissions, citations
├── Measures      dimensions, metrics, time windows, aggregations and definitions
├── Insights      derived findings, risks, themes, forecasts and recommendations
└── Actions       governed plans and mutations against connected systems
```

The internal ontology is the schema layer inside Workspace Context. It supplies types, relationship
semantics, identity resolution and traversal rules. It is not the only source of truth and it is not
the user-facing answer.

### 4.2 Proposed product language

| Current term | Proposed product term | Keep internally? | Rationale |
|---|---|---:|---|
| Ontology | Workspace Context | Yes, as schema layer | Matches the user's job: understand work and evidence |
| Ontology node | Context entity | Yes | A person should see “service” or “initiative,” not a generic node |
| Ontology relationship | Context relationship | Yes | Makes graph output understandable outside platform teams |
| Ontology query | Context query | Alias during migration | Keeps API compatibility while the mental model changes |
| Graph traversal | Explore relationships | Yes | Describes the action rather than the storage model |
| Citation | Evidence link | Yes | Connects claims to source records and spans |

Compatibility rule: existing ontology tool names may remain as stable API aliases for one migration
cycle, but new tools, UI copy and artifacts should use Context terminology.

## 5. Capability model

The agent's capability surface should be organized by what a person is trying to do, not by the
backend subsystem that happens to implement it.

| Capability plane | What the agent can do | Default risk |
|---|---|---|
| Observe | Read app surfaces, connected sources, execution records, memory, context and settings in scope | Read |
| Query | Search, filter, join, aggregate, compare and retrieve source spans | Read/compute |
| Analyze | Calculate metrics, detect trends, classify themes, map dependencies, identify risks and state assumptions | Read/compute |
| Visualize | Render charts, graphs, timelines, matrices, tables and diagrams from a reproducible data spec | Read/compute |
| Create | Produce artifacts, save drafts, create steering records, create work plans and prepare exports | Draft/write |
| Change | Edit, link, assign, update status, create tasks, modify records or invoke connected-system actions | Mutating |
| Govern | Request approval, explain required consent, record decisions, cite sources and expose audit state | Controlled write |
| Distribute | Export, publish, share or deliver an artifact to approved destinations | High-impact write |

Every call should declare its plane, resource scope, side effect, data egress and approval requirement.

## 6. Proposed tool families

Tool names below are illustrative contracts for the roadmap, not a commitment to a final RPC naming
style. The key requirement is that a tool's schema makes scope, evidence, side effect and consent
visible before execution.

### 6.1 App parity and workspace context

| Family | Candidate tools | Purpose |
|---|---|---|
| Workspace navigation | `list_app_surfaces`, `get_app_surface`, `get_surface_schema` | Discover what the app exposes and retrieve a normalized surface representation |
| Source search | `search_workspace`, `search_source`, `get_source_record`, `get_source_span` | Find and inspect current records with permissions and provenance |
| Context | `query_context`, `get_context_entity`, `explore_relationships`, `compare_context_snapshots` | Replace ontology-first traversal with evidence-backed workspace queries |
| Work views | `list_work_items`, `get_work_item`, `get_project_health`, `get_dependency_map` | Make common engineering and management questions first-class |
| Agent/app state | `get_agent`, `get_toolbelt`, `get_steering`, `get_runtime`, `get_policy_state` | Give the agent parity with the operational surfaces it helps users interpret |

### 6.2 Analysis and visualization

| Family | Candidate tools | Purpose |
|---|---|---|
| Analysis | `run_analysis`, `aggregate_records`, `compare_periods`, `detect_trends`, `find_outliers` | Compute on a bounded, cited dataset with explicit assumptions |
| Metrics | `define_metric`, `evaluate_metric`, `list_metric_definitions` | Reuse agreed definitions instead of inventing measures in prose |
| Charts | `render_chart`, `render_table`, `render_timeline`, `render_matrix` | Produce deterministic inline and exportable visualizations |
| Graphs | `render_relationship_graph`, `render_dependency_graph`, `render_ownership_map` | Turn Context relationships into inspectable visual views |
| Explainability | `get_analysis_provenance`, `explain_claim`, `list_assumptions` | Show source records, query inputs, transformations and uncertainty |

### 6.3 Artifacts

| Family | Candidate tools | Purpose |
|---|---|---|
| Drafting | `create_artifact`, `update_artifact`, `append_artifact_section` | Build a durable artifact from cited content and reusable blocks |
| Packaging | `render_artifact`, `export_artifact`, `package_artifact` | Render HTML, PDF, SVG, PNG, Markdown, CSV, JSON and presentation formats |
| Review | `get_artifact`, `diff_artifact`, `validate_artifact`, `request_artifact_review` | Make outputs reviewable, reproducible and safe to distribute |
| Templates | `list_artifact_templates`, `get_artifact_template`, `apply_artifact_template` | Standardize board, leadership, incident, planning and technical outputs |

### 6.4 Governed actions and distribution

| Family | Candidate tools | Purpose |
|---|---|---|
| Plan | `draft_action_plan`, `preview_action_plan`, `diff_action_plan` | Stage one or more changes without applying them |
| Mutate | `create_work_item`, `update_work_item`, `link_records`, `assign_work`, `update_steering_record` | Apply approved changes through connected-system adapters |
| Workflow | `start_workflow`, `pause_workflow`, `resume_workflow`, `request_human_decision` | Coordinate bounded multi-step work with explicit human stops |
| Distribution | `export_to_destination`, `publish_artifact`, `share_artifact`, `schedule_delivery` | Send approved outputs to allowed repositories, drives, email, chat or presentation surfaces |
| Audit | `get_action_receipt`, `get_artifact_receipt`, `revoke_action`, `list_pending_approvals` | Make effects, provenance and reversibility visible |

## 7. Charts, graphs and analysis contract

Visualization is a product capability, not a formatting trick. A chart or graph must be backed by a
reproducible specification and the dataset that produced it.

### 7.1 Canonical visualization object

Every visualization should carry:

```json
{
  "kind": "line | bar | area | scatter | timeline | matrix | graph | table",
  "title": "Lead time by month",
  "data": { "query": "...", "snapshot": "...", "rows": [] },
  "encoding": { "x": "month", "y": "lead_time_days", "color": "team" },
  "filters": [],
  "assumptions": [],
  "provenance": { "sources": [], "generatedAt": "..." },
  "accessibility": { "alt": "...", "tableFallback": true }
}
```

The runtime should render from a declarative spec to inline SVG/HTML for inspection and to PNG/PDF
for distribution. It should also provide a table fallback and a text summary so the output remains
useful to screen readers, exports and chat clients.

### 7.2 Graph requirements

Graph views should support:

- a named relationship set and a bounded hop limit;
- filters by entity type, team, repository, project, time window and confidence;
- readable labels and edge semantics;
- clustering and “why is this connected?” explanations;
- selection of a node to retrieve supporting records;
- export as SVG/PNG and as a machine-readable graph JSON;
- a maximum node/edge budget with an explicit truncation notice.

### 7.3 Analysis safety

The agent must not silently mix incompatible metrics or time windows. Analysis results should name:

- the source snapshot or live query;
- the metric definition and aggregation;
- filters and exclusions;
- missing or stale data;
- inferred relationships or classifications;
- confidence and known limitations.

## 8. Artifact model

An artifact is a durable output with a stable identity, content, source references, render recipe,
permissions and lifecycle state. It is not merely the last assistant message saved to a file.

### 8.1 Artifact types

Day-one types:

- interactive HTML brief;
- Markdown or rich-text memo;
- chart, graph or dashboard bundle;
- PDF report;
- CSV or JSON data export;
- SVG or PNG visual export.

Next types:

- leadership or board presentation (`.pptx` or a native slide artifact);
- engineering plan and decision record;
- incident review;
- roadmap or portfolio review;
- recurring report with a refreshable data binding.

### 8.2 Artifact lifecycle

```
draft → rendered → reviewed → approved → distributed → superseded
                     ↘ rejected / needs changes
```

Each state transition is recorded with the actor, time, content digest, source snapshot and decision.
Artifacts should support version history, content diff, visual preview, source inspection and revoke
or unpublish where the destination permits it.

### 8.3 Artifact quality bar

Before an artifact is marked ready for distribution, the agent must validate:

- all required sections and data are present;
- charts render without errors and have accessible fallbacks;
- claims have evidence links or are clearly labelled as recommendations;
- stale or permission-filtered data is called out;
- the intended audience, time window and owner are explicit;
- the requested format and destination are supported;
- no secret, private record or unapproved external recipient is included.

## 9. Consent, IAM and side effects

The app-capable agent must inherit the app's controls; it must not create a parallel authorization
system.

### 9.1 Consent classes

| Class | Examples | Agent behavior |
|---|---|---|
| C0 — read | Search, inspect, summarize, calculate, render | Execute within existing read grants; cite scope |
| C1 — draft | Create a private artifact, prepare a plan, generate a proposed diff | Execute and save as draft; never publish or mutate external state |
| C2 — reversible change | Edit a task, link records, update a draft, save a steering record | Show the exact diff and affected resources; require approval unless the user has pre-authorized the operation |
| C3 — consequential change | Assign work, change status, start a workflow, publish or distribute | Named approval, destination and receipt required |
| C4 — high-impact | Financial, access, deletion, production, broad external distribution | Explicit confirmation immediately before execution, with policy and rollback details |

### 9.2 Action plan contract

Every mutating request should produce an action plan before execution:

```
intent → affected resources → proposed diff → policy check → consent request
      → execution → receipt → verification → optional rollback
```

If a tool call is refused, the agent reports the refusal reason accurately and names the missing
grant, scope, consent or policy condition. It never implies that a refused action happened.

### 9.3 Guardrails

- Least privilege and resource-scoped grants remain the default.
- Toolbelt assignment is not permission; authorization is evaluated at call time.
- Mutations are idempotent and carry a request id.
- External writes require an execution receipt and the source/destination identity.
- Distribution defaults to draft or private until a human selects an audience.
- Destructive actions require a second confirmation or a pre-approved policy with an audit trail.
- Prompt injection and untrusted source content cannot grant authority or change consent requirements.

## 10. Phased roadmap

The phases are ordered by dependency and risk. Dates are intentionally omitted; scope and exit
criteria are the commitment until capacity and integration sequencing are agreed.

### Phase 0 — Contract and foundation

**Goal:** establish the common contracts that every later capability uses.

**Deliverables**

- capability taxonomy and tool annotation schema;
- Workspace Context vocabulary and ontology-to-context compatibility aliases;
- normalized resource identity and source provenance model;
- common `read / draft / mutate / distribute` consent classes;
- action-plan, receipt and artifact metadata schemas;
- tool registry support for scope, side effect, egress, idempotency and reversibility;
- evaluation fixtures for citations, refusals, stale data and permission filtering.

**Exit criteria**

- every new tool can declare its risk and provenance contract;
- an existing ontology query can be returned as a Context query with the same evidence;
- a denied call produces a machine-readable reason and a user-readable explanation;
- a draft artifact and a draft action plan have stable IDs and digests.

### Phase 1 — Read parity and workspace understanding

**Goal:** let the agent inspect the same read surfaces a user relies on to understand work.

**Deliverables**

- app surface discovery and normalized retrieval;
- workspace search across tasks, repositories, docs, designs, decisions, incidents, metrics and runs;
- context entity resolution and relationship exploration;
- source-span retrieval and evidence citations;
- first-class work views: backlog, project health, dependencies, ownership and recent changes;
- freshness, permissions and partial-results indicators.

**Exit criteria**

- the agent can answer five representative engineering-management questions from current sources;
- every material claim links to source records or is labelled as an inference;
- responses remain correct when a source is stale, unavailable or permission-filtered;
- ontology terminology is not required in the user prompt or the default response.

### Phase 2 — Analysis and visual intelligence

**Goal:** turn workspace data into trustworthy analysis and inspectable visuals.

**Deliverables**

- bounded analysis runtime with reusable metric definitions;
- period-over-period comparison, trend, cohort and outlier analysis;
- declarative chart, table, timeline, matrix and relationship-graph rendering;
- inline rendering in chat and downloadable SVG/PNG/HTML;
- accessible table and text fallbacks;
- analysis provenance, assumptions and uncertainty panel.

**Exit criteria**

- a user can ask for throughput, aging, cycle time and dependency risk and inspect how each was calculated;
- charts re-render deterministically from the stored spec and snapshot;
- graphs explain selected nodes, edges and truncation;
- visual QA passes at desktop, mobile, print and dark/light themes.

### Phase 3 — Artifact studio

**Goal:** make analysis durable, reviewable and ready for an audience.

**Deliverables**

- artifact creation, versioning, preview, diff and validation;
- Markdown, HTML, PDF, CSV, JSON, SVG and PNG outputs;
- templates for engineering review, staff update, leadership brief, board memo and incident review;
- source-linked sections and embedded visualizations;
- private artifact workspace with shareable review links;
- artifact review state and approval history.

**Exit criteria**

- a leadership brief can be generated from a prompt, reviewed section by section and regenerated without losing citations;
- an artifact can be opened outside the app as a self-contained HTML file;
- changes to sources or prompt are visible in a version diff;
- no artifact is marked distributable while required provenance or accessibility checks fail.

### Phase 4 — Governed app actions

**Goal:** let the agent prepare and apply the changes a user can make in the app.

**Deliverables**

- action-plan drafting and exact diffs;
- create/edit/link/assign/status operations for initial work-item and steering-record surfaces;
- approval UI and conversational approval handoff;
- idempotent adapters and receipts;
- verification after mutation and rollback for supported reversible changes;
- pending approvals and action history in execution traces.

**Exit criteria**

- an agent can stage a multi-object backlog update without changing anything;
- approval applies only the reviewed plan, not a recomputed or broadened plan;
- every applied change is attributable to an agent, operator, grant, prompt, source snapshot and request ID;
- policy denial and partial failure leave an accurate, recoverable state.

### Phase 5 — Distribution and operating loops

**Goal:** deliver approved work to the places teams already use.

**Deliverables**

- export and publish to approved repositories, drives, docs, presentations, chat and email destinations;
- native or high-fidelity board and leadership presentation output;
- recurring refreshable artifacts with stale-data notices;
- audience selection, recipient preview and external-sharing controls;
- delivery receipts, revoke/unpublish where supported and distribution audit view;
- scheduled analysis and report workflows with human checkpoints.

**Exit criteria**

- a board packet can be generated, reviewed, approved, distributed and traced end to end;
- recurring reports show what changed since the previous version;
- a distribution failure cannot be reported as success;
- recipient and data-scope checks run before every external delivery.

## 11. Prioritized vertical slices

The roadmap should be tested through complete user journeys rather than isolated tools.

| Slice | User request | First release phase | Demonstrates |
|---|---|---:|---|
| Delivery health brief | “Explain why cycle time rose, chart it, and draft a staff update.” | 2–3 | Context, metrics, charts, artifact provenance |
| Dependency risk map | “Show what blocks the platform launch and who owns each dependency.” | 1–2 | Relationship graph, evidence, ownership and truncation explanations |
| Backlog planning | “Group this backlog by theme, recommend sequencing, and stage the updates.” | 2–4 | Analysis, action plan, diff and approval |
| Architecture decision | “Compare these designs, cite the tradeoffs, and create a decision record.” | 1–4 | Source retrieval, synthesis, artifact creation and governed write |
| Board packet | “Prepare the quarterly engineering packet with delivery, investment and risks.” | 2–5 | Multiple visuals, templates, PDF/slides and controlled distribution |
| Agent operations review | “Show denied calls, spend, tool usage and policy drift this month.” | 0–2 | Existing execution data plus app parity and analysis |

## 12. Technical architecture direction

The agent should call a capability gateway that normalizes app and connected-system operations into
one governed tool contract.

```
User prompt
    ↓
Agent planner ──→ Context/query layer ──→ analysis runtime ──→ visualization runtime
    │                      │                         │                  │
    │                      └──────── evidence/provenance ────────────────┘
    ↓
Artifact + action plan layer ──→ consent/policy gateway ──→ app/connectors
    │                                  │                         │
    └──────────── receipts, versions, traces, citations ◀────────┘
```

### 12.1 Required platform seams

- **Capability gateway:** one place for IAM, entitlement, consent, scope, egress and audit evaluation;
- **Context service:** source adapters, identity resolution, typed entities, relationship indexes and evidence spans;
- **Analysis runtime:** bounded compute over snapshots or explicitly declared live queries;
- **Visualization runtime:** deterministic declarative renderers and export formats;
- **Artifact service:** versions, blobs, render jobs, templates, previews and review state;
- **Action service:** plans, diffs, idempotent execution, receipts, verification and rollback;
- **Distribution adapters:** destination-specific permissions, recipient checks and delivery receipts.

### 12.2 Execution integration

Every capability call should appear in the existing execution trace as a span with:

- tool and version;
- input scope and redacted arguments;
- source snapshot or live-query marker;
- policy and consent result;
- duration, tokens and child executions;
- artifact or action-plan IDs;
- output receipt and verification state.

Memory remains separate from Workspace Context. Memory stores durable lessons or facts intentionally
captured for future agent behavior; Context represents current workspace evidence and relationships.

## 13. Evaluation and success metrics

### 13.1 Quality metrics

- evidence coverage: percentage of material claims with valid source references;
- freshness accuracy: percentage of responses that correctly disclose stale or partial data;
- analysis reproducibility: same snapshot and spec produce the same result;
- visualization validity: charts and graphs render without data or accessibility errors;
- artifact acceptance: percentage of first drafts accepted with only minor edits;
- action fidelity: applied result matches the approved plan exactly;
- refusal accuracy: denied actions are never represented as completed;
- distribution integrity: successful deliveries have a verifiable receipt.

### 13.2 Product metrics

- time from question to decision-ready artifact;
- weekly active engineering and management users;
- percentage of sessions that use a visual or artifact output;
- percentage of artifacts reused or refreshed;
- percentage of action plans approved without manual reconstruction;
- number of high-value questions answered without switching tools;
- rate of user corrections to source selection, metric definitions or relationship interpretation.

## 14. Non-goals and open decisions

### Non-goals for the first release

- autonomous production changes without a human or explicit policy boundary;
- replacing source systems as the system of record;
- presenting inferred relationships as facts;
- making every app feature available through one giant undifferentiated tool;
- using a graph database as the product experience;
- generating board or leadership material without audience, provenance and review controls.

### Open decisions

1. Which connected systems are the first read and write adapters: GitHub, Linear, Jira, docs, design and incident systems?
2. Should analysis run on a warehouse/snapshot service, an isolated query runtime, or both?
3. Which presentation target is first: PPTX, native Slides, HTML-to-PDF, or a combination?
4. What artifact repository and retention policy should the product use?
5. Which operations qualify for pre-authorized C2 execution, and which always require an immediate confirmation?
6. Is “Workspace Context” the final user-facing name, or should the product test “Work Graph” and “Workspace Intelligence” alongside it?
7. Which board and leadership templates should be designed first, and who owns their content standards?

## 15. Recommended next move

Approve Phase 0 and the first vertical slice, **Delivery health brief**. It exercises the complete
future loop with low mutation risk: retrieve current work, calculate a defined metric, render a chart,
create a cited HTML artifact, and leave distribution as an explicit later approval. In parallel,
prototype the Context vocabulary as a compatibility layer over the current ontology tools so the
product language can evolve without breaking existing agents or traces.

