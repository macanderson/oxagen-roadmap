# Agent ontology and information architecture

The design of rev1 grew three surfaces independently: Agent IAM, Tools, and Steering. Each one
exposes the mechanism that built it rather than the object a person came to look at. This document
sets the ontology those three surfaces are rebuilt on, names every rename, and says what moves where.
It is the reasoning behind the changes to `mockups/src/engine.js` and the page specs in
`mockups/pages/`.

## What this change lands

The ontology below is the target. What is built now is its navigation, the surfaces the navigation
needed, and the two registry tables that had to name the objects the navigation introduced.

Landed:

- The workspace nav: **Agent IAM becomes Agents**, and **Runtimes** is added.
- Tools carries five tabs: Tools, **Toolbelts** (new), **Providers** (was MCP servers), Policy,
  Kill switches. `#/:org/:ws/tools/servers` still resolves.
- Steering carries five tabs: **Library** (Records, Skills, Memory and Ontology as its shelves),
  **Assignments** (new), **Gates** (was Policy), Proposals, **Compiler** (was Preview). Every rev1
  Steering URL still lands.
- The agent detail carries seven tabs: **Overview** (new), Identity, **Steering** (new), Toolbelt,
  **Runtime** (was Enrollment), **Permissions** (Roles, Mandates and Budgets), **Activity** (Runs,
  Tamper incidents and the accounting). Every rev1 tab id still resolves to the tab that absorbed it.
- **Runtimes**: the host registry and one host, with the agents on it and the tier its seam earns.
- The toolbelt, provider and runtime registries behind those surfaces, with the toolbelt
  drill-down and the provider drill-down.
- The **Composition** column set on the Agents registry, with the column-set control beside it.
  **Operations** holds the rev1 columns, renamed from Identity to Agent, and no number is deleted.
- The **Toolbelts** and **Agents** columns on the Tools registry, in place of On belts. Both are
  derived from the assignment record, so removing a tool from a belt changes the row.

Left for a later change:

- Every other column, tile and panel on a page that already existed.

## The object

An agent is the primary object. Everything else is something the agent has, uses, is assigned, or
runs on.

```
Agent
├── Identity          who the agent is
│   └── Principal     the durable security principal, owned by the agent
├── Steering          everything that influences how it behaves
├── Toolbelt          the reusable collection of tools assigned to it
├── Runtime           where and with what model and environment it executes
└── Activity          runs, traces, spend, incidents, provenance
```

The relationships, and the direction each one points:

```
Agent ──has──────────▶ Principal        one, durable, never shared
Agent ──uses─────────▶ Steering         many, reusable, shared across agents
Agent ──is assigned──▶ Toolbelt         many, reusable, shared across agents
Agent ──runs on──────▶ Runtime          one at a time, shared across agents
Principal ──decides──▶ Authorization    what this agent may actually call

Provider ──exposes───▶ Tool             one provider, many tools
Tool ──composes into─▶ Toolbelt         one tool, many toolbelts
Toolbelt ──assigned──▶ Agent            one toolbelt, many agents

Steering source ─▶ typed artifact ─▶ assignment ─▶ compiled frame ─▶ execution
```

### Identity is not steering

An agent's identity is stable. Its persona, instructions, skills, tools, model and machine all
change under it, and the principal that carries its authorization does not move when they do. A run
from a year ago and a run from this morning are the same actor even when nothing else about the
agent is the same.

That single rule decides most of this redesign. Identity, credentials and the principal live on the
agent and nowhere else. Steering, toolbelts, tools, providers and runtimes are reusable objects with
their own registries, and an agent holds a reference to them, not a copy.

### Toolbelt assignment is not permission

A toolbelt says which tools an agent can see. The principal and the policy say which calls it may
make. Two agents can carry the identical Engineering toolbelt and be authorized differently, because
their principals differ. The belt is computed at run start from grants × policy; the page shows what
the model receives, and Permissions shows what the principal may do with it.

### A provider is not an MCP server

A provider is a system, service, integration, runtime surface or protocol adapter that exposes tools
to Oxagen. MCP is one way it may do that. GitHub is GitHub whether Oxagen reaches it over MCP today or a native
SDK tomorrow, so transport is a column on a provider and never its identity.

Transports in rev1: `mcp`, `http`, `graphql`, `sdk`, `cli`, `native`, `local`, `rpc`.

## What was wrong

| Symptom | Cause |
|---|---|
| "Agent IAM" is a nav item | The security subsystem named the whole page, so an agent reads as an IAM record rather than an actor. |
| The agent page answers eight questions and not the first one | Eight tabs of mechanism (Identity, Toolbelt, Mandates, Budgets, Runs, Enrollment, Tamper incidents, Definition) with no surface that says what the agent is made of. |
| Steering has seven tabs at one level | Records, Skills, Memory and Ontology are artifact types; Proposals is a lifecycle state; Policy is the gate plane; Preview is the compiler. Four different categories, one nav level. |
| "Policy" means two things | Steering/Policy is the gate plane compiled from records. Tools/Policy is the Cedar policy that decides a call. Same word, two surfaces. |
| Tools has no reusable composition | A belt exists only as a computed per-agent list, so nothing in the product carries the sentence "these four tools, assigned to these six agents". |
| "MCP servers" is a nav-level word | It names the transport that happens to be in use, and it cannot hold an HTTP, SDK, CLI or native integration. |
| Steering reads as a second agent registry | It is a library of reusable artifacts, and nothing on it says so. |

## Workspace navigation

| Before | After | Why |
|---|---|---|
| Fleet | Fleet | Unchanged. It is the live activity surface and already answers the Activity question for the workspace. |
| Agent IAM | **Agents** | The registry of actors. IAM becomes part of the agent, not the name of the page. |
| Tools | Tools | Unchanged as a nav word; its tabs change. |
| Steering | Steering | Unchanged as a nav word; its tabs change. |
| — | **Runtimes** | New. Where agents execute, today readable only by opening one agent's Enrollment tab at a time. |
| Repositories | Repositories | Unchanged. |
| Spend | Spend | Unchanged. |

Organization nav (Organization, Billing, Audit) is unchanged.

## Agents

The registry of actors. Each row answers who the agent is, what it is for, who owns it, what steers
it, what it can reach, where it runs, which principal represents it, whether it is healthy, and what
it did recently.

The table carries two column sets, and the choice is a control on the panel header.

**Composition** (the default): Agent · Purpose · Owner · Steering · Toolbelt · Runtime · Principal ·
Health · Activity.

**Operations**: the rev1 columns, unchanged. Identity · Harness · Operator · Status · Tier · Belt ·
Runs 30d · Spend 30d · Tokens 30d · Mandates · Incidents.

No number is deleted. The default view answers what the agent is. The second answers how it is
doing. Both read the same records.

### Agent detail

| Tab | What is on it | Where it came from |
|---|---|---|
| **Overview** | The composition card (principal, steering, toolbelt, runtime, owner), the 30-day token panel, coaching, and the definition in git | New surface; token panel and coaching move down off the header |
| **Identity** | Agent key, principal, kind, harness, model tier, operator, status, first frame; credentials; the run credential | Identity, minus roles |
| **Steering** | What steering reaches this agent, why, from where, at what precedence and token cost, and what it compiled into | New; the agent-scoped view of the steering library |
| **Toolbelt** | The assigned toolbelts, the computed belt, the model view, belt search, per-tool decision rules, what is off the belt | Toolbelt, plus the assignment it was missing |
| **Runtime** | Host, device key, collector, hook binary, hooks written, model proxy, MCP server, settings, tier earned, last checkpoint, the tier ladder with this agent's rung | Enrollment + Tier delivery |
| **Permissions** | Roles and the ∩ formula, resource scope, spend ceiling, delegation ceiling, mandates held, budgets | Roles (out of Identity) + Mandates + Budgets |
| **Activity** | Runs, tamper incidents, token accounting, findings, the audit record | Runs + Tamper incidents + the accounting half of Budgets |

Eight tabs become seven, and the first one is the answer to "what makes up this agent".

Permissions is where authorization lives, and it never lists tools. A mandate and a budget are both
ceilings on what the principal may do, so both sit there rather than beside the belt.

## Tools

| Tab | Before | Change |
|---|---|---|
| **Tools** | Tools | The Server column becomes **Provider**; a row gains the toolbelts and agents it reaches |
| **Toolbelts** | — | New. The reusable composition that the product could not previously name |
| **Providers** | MCP servers | Renamed. `Kind` becomes **Transport**; `mcp` is one of eight values |
| **Policy** | Policy | Unchanged |
| **Kill switches** | Kill switches | Unchanged |

The relationships the page has to make obvious, in the order a person reads them:

```
Provider  ──exposes──▶  Tool  ──composes into──▶  Toolbelt  ──assigned to──▶  Agent
```

**A provider row** carries: provider · transport · tools exposed · connection health ·
authorization · toolbelts depending on it · agents depending on it · last import.

**A tool row** carries: tool version · provider · category · hazard · gate today · egress ·
financial · schema origin · digest · toolbelts · agents · calls 30d.

**A toolbelt row** carries: toolbelt · tools · providers represented · agents assigned · policy
bindings · effective availability (what is denied right now by a switch, an expired token or a
policy).

Opening a tool says which provider exposes it, which toolbelts include it, which agents receive it
through them, what governs it, whether it is healthy, whether a switch applies, and whether access is
denied right now. Opening a provider says what system it is, how it is connected, what it exposes,
and which agents ultimately depend on it.

### Where governance sits

Policy and kill switches stay on Tools. Both decide a tool call at call time, and moving them to a
governance surface would separate a rule from the rows it governs. The gate state they produce is
already on every tool row as **Gate today**, so the browsing experience carries the outcome without
carrying the control.

The name collision is fixed on the other side: Steering's Policy tab becomes **Gates**, because what
it lists are gates compiled from records, not the policy that decides a call.

## Steering

A reusable library of the things that influence behaviour, and the compiler that turns them into a
window. Seven tabs become five, and each one is a different kind of thing.

| Tab | Holds | Absorbed |
|---|---|---|
| **Library** | Every steering artifact, with its kind as a filter | Records, Skills, Memory, Ontology |
| **Assignments** | Which artifacts reach which agents, and by what scope | New |
| **Gates** | The gate plane: what refuses a call, and the notice each gate puts back into steering | Policy, renamed |
| **Proposals** | Candidates and open Steering PRs | Proposals |
| **Compiler** | What compiled, from what, at what precedence and token cost, what was dropped, what conflicted | Preview, renamed |

The kind filter on Library carries every type in the ontology: rule, constraint, procedure, fact,
preference, memory, ontology, skill, instruction. A skill is a steering artifact delivered as a file
rather than a paragraph, so the skill-specific controls (the master switch, sync state, and the source
link) appear when the skill kind is in view, and the `skills` routes keep resolving.

The conceptual model the five tabs implement, left to right:

```
source ──▶ typed artifact ──▶ assignment ──▶ compiled frame ──▶ execution
 Library ─────────┘              Assignments        Compiler
```

Gates and Proposals cut across it: Gates is the other compilation target, Proposals is the lifecycle
an artifact enters the library through.

## Runtimes

New page. A runtime is a host, a CI runner or a cloud surface, with a harness, a model surface and an
enforcement tier, and agents execute on it. Today the only way to read one is to open an agent and
look at its Enrollment tab, which means nothing in the product can answer "what is on this machine"
or "which agents lose their hooks if this collector stops".

Columns: Runtime · Kind · Harness · Model surface · Tier · Agents · Collector · Hooks · Health ·
Last checkpoint.

The drill-down is the panel the agent Runtime tab already renders, read from the host rather than
from the agent, plus the agents on it.

## Composition and administration

**Composition** happens on the agent. From the agent detail page a person assigns identity, steering,
a toolbelt, a runtime and permissions without leaving it.

**Administration** happens on the registries. Tools, Providers, Toolbelts, Steering and Runtimes are
where the reusable objects are managed for the whole workspace.

Neither duplicates the other. The agent page assigns a reference and shows what it resolved to; the
registry page owns the object. A toolbelt is edited on Tools and assigned on the agent; a steering
artifact is written on Steering and its reach is read on the agent.

## Words

| Use | Replaces |
|---|---|
| Agent | IAM record, identity (as the name of an actor) |
| Identity | — |
| Principal | service account |
| Steering | prompts, context files |
| Tool | capability |
| Toolbelt | toolset, tool group |
| Provider | MCP server, integration source |
| Transport | kind, protocol (as the name of a provider) |
| Runtime | enrollment (as the name of a place) |
| Permission | entitlement |
| Assignment | binding |
| Run · Trace · Provenance | — |

MCP keeps its name wherever it is the mechanism: a provider's transport, the Oxagen MCP server on a
host, an MCP tool call in a transcript, the importer that reads `tools/list`.

## What stays

The visual language is untouched: dark, dense, one restrained gold action per screen, state as a dot
and a word, strong tables, no decoration. Every operational number rev1 showed is still on a screen.
The rules every page keeps are unchanged, and the redesign is measured against them: trust badges
show the recorded value, money shows its basis, headings are plain nouns, and a not-loaded state
replaces the body rather than the shell.
