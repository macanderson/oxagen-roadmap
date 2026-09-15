# Oxagen Mission Control: the scope review, and what it changed

| | |
|---|---|
| **Status** | Applied on 2026-09-14 to the spec, the plan, the mockups and the page specs |
| **Date** | 2026-09-14 |
| **Owner** | Mac Anderson |
| **Source** | A product review of the Mission Control spec and the Witness spec against the oxagen repository, written for the council meeting of Wednesday 2026-09-16 |
| **Related** | `mission-control-spec.md`, `implementation-plan.md`, `dod-spec.md` |

## The call

An investor read the Mission Control spec and said to build less. He read a real signal and prescribed the wrong fix. The problem is not that ten pages is too many. The problem was that all ten were load-bearing, so nothing in the product answered the question a buyer asks first: what do I turn off the day I sign?

The review's answer, applied in full:

| Decision | What | Why |
|---|---|---|
| **Cut** | The ontology engine, Neo4j, and the in-app agent | Three connectors, entity resolution, embeddings, a Cypher layer, a second datastore with a capacity ceiling the spec flagged itself, and a chat assistant that sells nothing. Roughly eight weeks of the twenty-four, and one whole class of on-call. |
| **Keep** | Fleet, Run, Spend, and the toolbelt | The flight recorder, the money, and the reason security signs off. These work on day one with no configuration, which is the only thing that matters when the install is sixty seconds. |
| **Move** | The proof to the front | It was scheduled last, at weeks 18 to 24. It is the most defensible idea in either document and the only one that makes an outside party depend on Oxagen's records. |

## Surface by surface

Each row asks the same four questions: who buys because of it, does it work before the customer configures anything, how long it takes, and what it costs to carry.

| Surface | Who buys it | Day one | Verdict | What changed |
|---|---|---|---|---|
| Run, the flight recorder | Engineering lead | Yes | Keep | Gains the Done tab (`dod-spec.md`). |
| Spend, cost and findings | Engineering lead, finance | Yes | Keep | Reconciliation to the cent against provider statements is out; every figure carries its basis instead. |
| Fleet, live and recent runs | Engineering lead | Yes | Keep | Gains the Done column and the held tile. Approvals stay a panel here and never get a page. |
| Agents, identity and toolbelt | Security review | Yes | Keep | Unchanged. "The agent holds no credentials at all" is the best sentence in the document. |
| Tools, registry and policy | Security review | Yes | Thin | Registry, approval rules, mandates and kill switches stay. Policy simulation against real history, two-person mandates and the published assurance suite are out. |
| Billing, plan and invoices | Procurement | Yes | Thin | The meter is the proven run (below). |
| Organization, people and roles | Buyer's admin | Yes | Thin | Members, roles, invitations and API keys stay. SSO and SCIM wait for the customer who blocks on them. |
| Steering, records and Context PRs | Engineering lead | After setup | Thin | Record to proposal to pull request stays. Effect metrics, retirement candidates and promotion thresholds are out until someone has merged fifty of these. |
| Audit, archive and exports | Compliance | Yes | Defer | The write-once archive at seal time stays, because it is nearly free and the chain depends on it. Legal holds, crypto-shredding and cent-level reconciliation are out. |
| Ontology, graph and connectors | Nobody yet | No | Cut | The largest cost in the spec and the weakest link to first revenue. The code graph of the main repo stays, because the witness author reads it. |

## The sequence

The roadmap built the moat last. Two blocks that did not close a deal sat in the middle of the year; the block no competitor can copy sat at the end. Pulling the ontology (M4) and the audit archive (M5) out and putting the proof where M4 sat makes the plan about fifteen weeks, not twenty-four, and the first release carries the recorder, the money, the governance and the proof. That is a complete story a customer can act on, and a shorter one.

The definition of done (`dod-spec.md`) is what makes the proof a gate rather than a badge, so it sits beside the witness in the plan (M3 Done, M4 Prove) and the two share a meter.

## The meter

Four things in the commercial model worked against each other. The fixes, applied:

- **Price the finding, not the recording.** Runs were the meter at $0.30, $0.20 and $0.12. The value described is proven work. The meter is now the **proven run**, a run whose definition of done held and whose certificate Oxagen signed, at $0.30, $0.20 and $0.15 by monthly volume. Runs, governed actions and retained storage are reported as secondary meters so the price can move later without rewriting the meter.
- **The free tier is limited by retention and seats, not volume.** Every governance feature on, unlimited runs, thirty days of evidence, three seats. A ten-developer team on Claude Code installs in sixty seconds and stays free until keeping evidence longer than a month becomes a governance decision. Upgrading is a decision a team lead makes, not a volume accident.
- **State the margin at its volume.** At $0.12 and four cents of direct cost the old top tier was 67 percent, not "above 80 percent at every tier." The top tier is now $0.15, the margin is stated per tier, and the volume assumption is written beside it.
- **Pick one enterprise floor and hold it.** The spec keeps $60,000 a year. It is held for two quarters; a wrong price held is recoverable, a moving price is what makes a founder look pre-product. *This number is the one item of the review that is a decision for the owner, not for the documents; it is left as the spec had it.*

## Two documents, one company

The Mission Control spec and the Witness spec described two businesses: one bills runs on an allowance and proves one thing (a test flip), the other bills stamps and proves fourteen classes with a verify endpoint an auditor can call. They are not alternatives. Mission Control is how the witness gets fed, and the witness is why Mission Control is worth more than a dashboard. The definition of done is the sentence that joins them: an agent cannot finish until the checks hold, the witness is one of the checks, and the certificate that says the checks held is what the customer pays for.

## Three questions for Wednesday

The whole argument rests on assumptions the council can test in an hour. If an answer is wrong, the ranking above changes.

1. **What did the three paying partners actually buy?** Spend is ranked first because the pain is budgeted, urgent and needs no configuration. If all three bought for governance or the recorder alone, the ranking should follow their money.
2. **Has any of them asked for the ontology?** Cutting it is the largest decision on this page. It is right if nobody has asked. Discount any answer that sounds like enthusiasm rather than a scheduled use.
3. **Would they pay for a stamp?** Describe the certificate, the verify endpoint, and an invoice line that links to evidence an outsider can recompute. If two of nine lean in, the proof stays at the front of the build and the pricing question answers itself.

## Where each cut landed

| Cut | Spec | Plan | Mockups |
|---|---|---|---|
| In-app agent | §0 row 1, §4.4, §14.1, App. E | lanes and gaps for the assistant flyout removed | the sidebar launcher, the top-bar button, the panel, the ⌘K agent-tools group and the W11 assistant steps removed; W11 is "the account" |
| Neo4j and the ontology | §0 rows 4 and 5, §4.1, §4.2, §5.3, §11, §13.3, App. B | Neo4j lanes removed | "Graph isolation" is "Tenant isolation"; every store label reads Postgres |
| SSO and SCIM | §12.1 enterprise row, §14, App. A.1 | none | the SSO and SCIM panels and dialogs, the SSO column, the Okta copy |
| Policy simulation | §6.12, §14, App. A.5, App. E | none | the simulation panel, the Activate dialog, the Simulate footer |
| Assurance suite | §6.13, §14, App. F | none | the Assurance tabs on Tools and Audit, the suite dialogs, the assurance-gap incident |
| Two-person mandates | §6.9, §12.1, App. A.5 | none | the two-person badge and warning; one person with the finance role grants |
| Effect metrics, retirement, thresholds | §9.2, §10.4, §14, App. F | none | the Effect and Retirement tabs, the threshold tiles and the blocked state on proposals |
| Legal holds, crypto-shredding | §2, §5.4, §13.4, §13.5, §15, App. A.9, App. E | none | the Legal holds tab, the erasure table, the hold and erasure dialogs |
| Reconciliation | §0 row 12, §2, §4.1, §12.1, §12.4, §12.9, App. A.7, App. E | none | the Reconciliation tab and dialog; the Mandate page's ledger note reads from the connection's webhook |
| Roadmap | §17 | the batch plan | W14 added |
| The meter | §12.1, §18 | billing lane | Billing prices the proven run; the free tier is retention and seats |
