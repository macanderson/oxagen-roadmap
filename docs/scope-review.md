# Oxagen Mission Control: the scope review, and what it changed

| | |
|---|---|
| **Status** | Applied on 2026-09-14 to the spec, the plan, the mockups and the page specs. Amended 2026-09-15: the maintainer kept the in-app agent (2026-09-14) and Neo4j in the architecture (2026-09-15), and GAU pricing is the one price list (2026-09-14, reaffirmed 2026-09-15). Amended 2026-09-18: see "Amendment of 2026-09-18" at the end |
| **Date** | 2026-09-14 |
| **Owner** | Mac Anderson |
| **Source** | A product review of the Mission Control spec and the Witness spec against the oxagen repository, written for the council meeting of Wednesday 2026-09-16 |
| **Related** | `mission-control-spec.md`, `implementation-plan.md`, `dod-spec.md` |

## The call

An investor read the Mission Control spec and said to build less. He read a real signal and prescribed the wrong fix. The problem is not that ten pages is too many. The problem was that all ten were load-bearing, so nothing in the product answered the question a buyer asks first: what do I turn off the day I sign?

The review's answer, applied in full:

| Decision | What | Why |
|---|---|---|
| **Cut** | The ontology engine | Three connectors, entity resolution, embeddings and a Cypher layer. |
| **Keep** | Fleet, Run, Spend, and the toolbelt | The flight recorder, the money, and the reason security signs off. These work on day one with no configuration, which is the only thing that matters when the install is sixty seconds. |
| **Move** | The proof to the front | It was scheduled last, at weeks 18 to 24. It is the most defensible idea in either document and the only one that makes an outside party depend on Oxagen's records. |

The review also proposed cutting the in-app agent and Neo4j. The maintainer kept the in-app agent the same day (2026-09-14, "dont cut the in app agent"), and it opens as a flyout from the sidebar (2026-09-15). Neo4j stays in the architecture, and there is no retirement ADR (2026-09-15).

## Surface by surface

Each row asks the same four questions: who buys because of it, does it work before the customer configures anything, how long it takes, and what it costs to carry.

| Surface | Who buys it | Day one | Verdict | What changed |
|---|---|---|---|---|
| Run, the flight recorder | Engineering lead | Yes | Keep | Gains the Done tab (`dod-spec.md`). |
| Spend, cost and findings | Engineering lead, finance | Yes | Keep | Reconciliation to the cent against provider statements is out; every figure carries its basis instead. |
| Fleet, live and recent runs | Engineering lead | Yes | Keep | Gains the Done column and the held tile. Approvals stay a panel here and never get a page. |
| Agents, identity and toolbelt | Security review | Yes | Keep | Unchanged. "The agent holds no credentials at all" is the best sentence in the document. |
| Tools, registry and policy | Security review | Yes | Thin | Registry, approval rules, mandates and kill switches stay. Policy simulation against real history, two-person mandates and the published assurance suite are out. |
| Billing, plan and invoices | Procurement | Yes | Thin | Billing sells governed action units (below). |
| Organization, people and roles | Buyer's admin | Yes | Thin | Members, roles, invitations and API keys stay. SSO and SCIM wait for the customer who blocks on them. |
| Steering, records and Steering PRs | Engineering lead | After setup | Thin | Record to proposal to pull request stays. Effect metrics, retirement candidates and promotion thresholds are out until someone has merged fifty of these. |
| Audit, archive and exports | Compliance | Yes | Defer | The write-once archive at seal time stays, because it is nearly free and the chain depends on it. Legal holds, crypto-shredding and cent-level reconciliation are out. |
| Ontology, graph and connectors | Nobody yet | No | Cut | The largest cost in the spec and the weakest link to first revenue. The code graph of the main repo stays, because the witness author reads it. |

## The sequence

The roadmap built the moat last. Two blocks that did not close a deal sat in the middle of the year; the block no competitor can copy sat at the end. Pulling the ontology (M4) and the audit archive (M5) out and putting the proof where M4 sat makes the plan about fifteen weeks, not twenty-four, and the first release carries the recorder, the money, the governance and the proof. That is a complete story a customer can act on, and a shorter one.

The definition of done (`dod-spec.md`) is what makes the proof a gate rather than a badge, so it sits beside the witness in the plan (M3 Done, M4 Prove), and the witness is one of its checks.

## The price list

The review proposed pricing the proven run. The maintainer set governed action units (GAUs) as the one price list on 2026-09-14 and reaffirmed it on 2026-09-15 (spec §12.1):

- **One unit.** $5 per 1,000 GAU list, bought in 5,000-GAU blocks at $25. Volume bands are $5, $4, $3 and $2 per 1,000 by annual volume. `resolve_approval` is the only billable governed action, and membership writes are free.
- **Tiers by allowance.** Free has 5,000 GAU a month, Build at $199 has 50,000, Scale at $999 has 300,000, and Enterprise is negotiated per contract (a `billing.contract_terms` row). Every feature is on for every tier, the hosted witness runner included.
- **Proven spend is reported.** Proven spend and held runs are figures on Spend and Billing, and they carry no price.

## Two documents, one company

The Mission Control spec and the Witness spec described two businesses: one bills runs on an allowance and proves one thing (a test flip), the other bills stamps and proves fourteen classes with a verify endpoint an auditor can call. They are not alternatives. Mission Control is how the witness gets fed, and the witness is why Mission Control is worth more than a dashboard. The definition of done is the sentence that joins them: an agent cannot finish until the checks hold, the witness is one of the checks, and the certificate records that the checks held.

## Three questions for Wednesday

The whole argument rests on assumptions the council can test in an hour. If an answer is wrong, the ranking above changes.

1. **What did the three paying partners actually buy?** Spend is ranked first because the pain is budgeted, urgent and needs no configuration. If all three bought for governance or the recorder alone, the ranking should follow their money.
2. **Has any of them asked for the ontology?** Cutting it is the largest decision on this page. It is right if nobody has asked. Discount any answer that sounds like enthusiasm rather than a scheduled use.
3. **Would they pay for a stamp?** Describe the certificate, the verify endpoint, and an invoice line that links to evidence an outsider can recompute. If two of nine lean in, the proof stays at the front of the build.

## Where each cut landed

| Cut | Spec | Plan | Mockups |
|---|---|---|---|
| In-app agent (kept, 2026-09-14) | §0 row 1, §1, §2, §4.4, §16 and App. A.10 state it in scope (2026-09-15) | the sidebar flyout is lane P11 (decision 9, 2026-09-15; `implementation-plan.md` Batch 2) | the sidebar launcher, the top-bar button, the panel and the ⌘K agent-tools group were removed on 2026-09-14, before the reversal the same day, and **restored on 2026-09-15** — with the engine (Stella over HTTP) and the organization's model key written into §4.4 and §4.5. The W11 assistant steps stay removed; W11 is "the account" |
| The ontology; Neo4j kept (2026-09-15) | §0 rows 4 and 5, §4.1, §4.2, §5.3, §11, §13.3, App. B; §0 row 5 and §4.2 state what each store holds | Neo4j lanes removed | "Graph isolation" is "Tenant isolation"; every store label reads Postgres |
| SSO and SCIM | §12.1 enterprise row, §14, App. A.1 | none | the SSO and SCIM panels and dialogs, the SSO column, the Okta copy |
| Policy simulation | §6.12, §14, App. A.5, App. E | none | the simulation panel, the Activate dialog, the Simulate footer |
| Assurance suite | §6.13, §14, App. F | none | the Assurance tabs on Tools and Audit, the suite dialogs, the assurance-gap incident |
| Two-person mandates | §6.9, §12.1, App. A.5 | none | the two-person badge and warning; one person with the finance role grants |
| Effect metrics, retirement, thresholds | §9.2, §10.4, §14, App. F | none | the Effect and Retirement tabs, the threshold tiles and the blocked state on proposals |
| Legal holds, crypto-shredding | §2, §5.4, §13.4, §13.5, §15, App. A.9, App. E | none | the Legal holds tab, the erasure table, the hold and erasure dialogs |
| Reconciliation | §0 row 12, §2, §4.1, §12.1, §12.4, §12.9, App. A.7, App. E | none | the Reconciliation tab and dialog; the Mandate page's ledger note reads from the connection's webhook |
| Roadmap | §17 | the batch plan | W14 added |
| The price list | §0 row 12, §12.1, §12.10, §18 | billing lane (P8, A8, G13) | the Billing page still prints the proven-run price list; its page spec (`billing.md`) carries the GAU price list (2026-09-14, reaffirmed 2026-09-15) |

## Amendment of 2026-09-18

This review stands. One of its cuts needs a sentence of precision after the steering, graph and gateway review of 2026-09-18, which the maintainer approved in full (`reviews/2026-09-18-steering-graph-gateway-review.md`).

| What | Verdict | What it means |
|---|---|---|
| The ontology **engine** | Stays cut | No connectors, no entity resolution, no inferred ontology, no Cypher layer and no Ontology page. Nothing in this review's reasoning changed |
| An Ontology **tab** under Steering | New, and small | Steering becomes the hub for everything that can steer an agent, with seven tabs: Records, Skills, Memory, Ontology, Policy, Proposals, Preview. The Ontology tab is a home for ontology notes that steer: a term, its definition and what it is about, written by a person and published through a pull request like a record. It is a file somebody wrote and somebody merged. It is not the engine, and it brings none of the engine's cost |
| The graph | Becomes the steering index, later | Neo4j stays in the architecture (2026-09-15). In Phase 3 of the refactor path every steering item is projected into the graph as a `:Record` node with `ABOUT` edges, one direction from the Postgres registry, verified by hash, and the assembler's relevance stage reads it. Postgres stays as the fallback behind the same port, and Phase 3 waits until the knowledge graph is on by default. Delivery never waits for the graph (`mission-control-spec.md` §4.2, §10.5, §17.2) |
| Skills | Move under Steering | Skills is a tab of the hub and has no top-level navigation entry. This review did not rule on Skills, which postdates it |

The question this review asked of every surface still applies to the new tab: it works before the customer configures anything, because an empty Ontology tab costs nothing and steers nothing.
