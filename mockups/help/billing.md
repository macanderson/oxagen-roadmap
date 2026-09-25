# Billing

## Page header {#billing/header}

The header names the page under the Organization eyebrow and carries the page's one gold action, **Change plan**.

### Purpose
You land here to answer one question: what does this organization pay Oxagen this period, and on what terms. The header tells you where you are and gives you the one write the page offers, a plan change. Everything below it reads the meter, the invoices and the price list.

### Rationale
Billing is one of the three organization pages in the product spec (`docs/mission-control-spec.md` §14). It holds Oxagen's revenue and nothing else. The customer's own model spend lives on Spend, because §12.1 tracks two different things and keeps them apart on purpose: customer spend, billed at zero, and Oxagen revenue, priced on the governed action (ADR-055).

The mock used to carry the subtitle "What Anderson Intelligence Corp. pays oxagen." under the h1. It described the page to a reviewer and the app would not print it, so it moved here. The eyebrow and the h1 already say where you are.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Title and eyebrow | fixed in `pBilling()` | none | live |
| Change plan | `openDialog('plan')` | Stripe, through `start_subscription_upgrade` | partial |
| Read permission | `deniedState("billing", …)` | IAM, `org.billing` | live |

### Logic
1. `pBilling()` branches on `S.state` before it reads any record: `loading` returns `skeleton()`, `error` returns `errorState("Billing","502 stripe_unreachable")`, `denied` returns `deniedState()` naming `org.billing`, and `empty` returns `emptyState("Nothing billable yet", …)` with **Back to Work**.
2. Loaded, it draws the header, the four tiles, a left column (This period, Meters, Invoices) and a right column (Price list, Billable units).
3. **Change plan** is the only gold button on the page. Nothing else on the page writes.
4. The page spec designs three more panels the mock does not draw yet: **Auto top-up** (`set_auto_topup`), **Buy governed actions** (`purchase_gau_bucket`, through Stripe Checkout) and **Token balance** (`purchase_credits`). The build draws them in the right column below Billable units. None of their buttons is gold, and each purchase is a governed action.

### States
- Loading: the shell stays and the body is the skeleton.
- Empty: "Nothing billable yet". In the build, **Buy governed actions** stays below the empty panel so an organization can buy its first block.
- Error: the control plane answered `502 stripe_unreachable`, with **Try again** and **Open an incident**.
- Denied: you lack `org.billing`, with **Request access**.
- Mobile: the two columns stack.

## Summary tiles {#billing/tiles}

Four tiles give the plan, the governed actions used this period, the retained evidence and the amount due.

### Purpose
The strip answers "where do we stand this month" in four numbers before you read a table. Each tile carries one number and one basis line, so a figure never stands without the rule behind it.

### Rationale
The spec rule for every page is that money shows its basis and a header figure is a rollup of the rows beneath it, never typed twice. Each tile here repeats a figure that a table below also carries: the governed-action count is the Governed actions meter, the retained evidence is the Evidence retention line, and the amount due is the This period total.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Plan | `BILLING.plan` | `billing.subscriptions`, `billing.plans` | live |
| Governed actions this period | `BILLING.used`, set to `SPEND.actions` in `volume()` | `billing.gau_buckets` | partial |
| Included allowance | `BILLING.includedGau` (250,000) | `billing.gau_buckets`, `billing.contract_terms` | partial |
| Retained evidence | `retainedGbText()` over `BILLING.retainedGb` | evidence store size by organization | partial |
| Due | `BILLING.total`, `BILLING.next` | `billing.invoices` and Stripe | live |

### Logic
1. `pBilling()` reads `gaIncl` as `BILLING.includedGau` (250,000 when unset) and `gaUsed` as `BILLING.used`, falling back to `BILLING.billable` plus the allowance.
2. The Governed actions tile prints `gaUsed` and the basis "N above the N included", where N is `BILLING.billable`.
3. `retainedGbText()` formats `BILLING.retainedGb` with one decimal and thousands separators. Billing, the Evidence retention line, the Retained evidence meter and Audit › Retention all call it, so the four places cannot disagree.
4. The Due tile prints `BILLING.total`, the This period total after the onboarding discount.

The mock's figures differ from the pricing in §12.1 (2026-09-15). The mock shows a "Team" plan with 250,000 included governed actions. §12.1 sets the tiers Free (5,000 GAU a month), Build (50,000) and Scale (300,000), and Enterprise by contract. The build reads the tier and allowance from the organization's plan or its `billing.contract_terms` row, and shows remaining units as included plus purchased plus carried, minus used. §12.1 also includes 12 months of evidence on paid tiers, where the mock says 13.

### States
Loaded only. The other states replace the whole body.

## This period

The statement for the open period: one line per charge with its basis and amount, and the total.

### Purpose
You read what this period will cost and why. Each line names the rule that produced its amount, so a finance reader can check the arithmetic without opening Stripe.

### Rationale
§12.1 prices the governed action and nothing else (ADR-055). Tokens and retained evidence appear as lines at $0.00 so the statement shows they were counted and not priced. The Total carries no basis because it is the sum of the lines above it. The spec rounds it to cents once, half-even, at the statement line.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Governed actions line | `BILLING.amount`, `BILLING.tier2` | `billing.gau_settlements`, `billing.contract_terms` | partial |
| Tokens line | fixed `$0.00` | `cost.run_totals` | partial |
| Evidence retention line | `BILLING.retention` | evidence store size by organization | partial |
| Onboarding discount | `BILLING.discount`, `BILLING.discountAmount` | none (the offer is deferred, spec §20) | not built |
| Total | `BILLING.total` | `billing.invoices` | partial |

### Logic
1. The `volume()` generator in `mockups/src/engine.js` computes the period from the fleet: `SPEND.actions` is the runs times 14.7, billable is the count above the 250,000 allowance, blocks is billable divided by 10,000 and rounded up, and the amount is blocks times $30.00.
2. It writes `BILLING.tier2` as "N blocks × $30.00 · 250,000 included", the basis on the first line.
3. The discount is 20 percent of the amount. `usd()` renders it with a true minus sign.
4. `BILLING.total` is the amount minus the discount, and the Due tile reads the same field.
5. The Tokens line always reads $0.00 with the basis "Not priced. Your own model spend is on Spend."

The build differs in four ways. §12.1 sells blocks of 5,000 GAU at $25 and lists $5 per 1,000 GAU. It bills only `resolve_approval` as a governed action, while the mock counts every action. The build prints the organization's contracted rate from `billing.contract_terms`, or its plan's terms, and each block, top-up and invoice is a `billing.gau_settlements` row. The onboarding discount has no store until the offer in §20 ships, so its line renders `NotBacked`.

### States
Loaded only. A search box, sort and a row pager come from the shared table helper.

## Meters

Every meter for the period: the one that is priced, the ones that are reported, and the ones that are free.

### Purpose
You see everything Oxagen counted this period, and which of it you pay for. A finance reader can check that runs, retained evidence and in-app turns were counted without any of them turning up on the invoice.

### Rationale
Oxagen prices one unit, the governed action: a call Oxagen decided, delivered and recorded (ADR-055, §12.1). Runs, tokens and retained evidence are reported and not priced. Denials, runs halted before a model call and runs of the in-app agent cost nothing on this meter. A note under the table used to say so. It explained the pricing model to a reviewer, so it moved here, and the Note column carries the class of each row.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Governed actions | `SPEND.actions`, through `BILLING.meters` | `billing.gau_buckets` | partial |
| Sealed runs with at least one model call | runs from `volume()` | `cost.run_totals`, `cost.daily_totals` | partial |
| Retained evidence | `retainedGbText()` | evidence store size by organization | partial |
| Runs halted before any model call | runs × 0.009 in `volume()` | `cost.run_totals` | partial |
| Runs of the in-app agent | runs × 0.03 in `volume()` | the in-app agent's run log | partial |

### Logic
1. `volume()` builds `BILLING.meters` as five rows, each with a label, a value and a note.
2. The Governed actions note reads "Priced · 250,000 included this month". The two free rows read "Free". Sealed runs reads "Reported, not priced", and retained evidence reads "Reported · 13 months included".
3. The halted and in-app counts are fixed shares of the fleet's runs (0.9 percent and 3 percent). They are fixture ratios, not measurements.
4. `pBilling()` prints the rows as they come. It adds nothing and computes nothing.

The build adds a second priced meter. §12.1 (2026-09-15) prices the in-app agent's model calls in usage credits: one credit is $0.01, debited by the credit gate at provider cost times the meter markup, against a balance separate from the governed-action bucket. The in-app agent's runs stay free on the governed-action meter.

### States
Loaded only.

## Invoices

Each closed period's invoice, with its governed actions, amount, status and a link to the Stripe-hosted copy.

### Purpose
You find a past invoice, check what it charged, and open the Stripe copy to pay it or download it.

### Rationale
Stripe holds the customer, the subscription and the invoice. Oxagen holds the meter and mirrors each invoice in `billing.invoices` (§12.1). The page shows the mirror and hands you to Stripe for the document itself. The list starts in March 2026, the month the demo organization converted to a paid plan.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Invoice, period, amount, status, paid date | `BILLING.invoices` from `volume()` | `billing.invoices` and Stripe | live |
| Governed actions | `BILLING.invoices[].runs` | `billing.gau_settlements` | partial |
| Open in Stripe | `href="#"` | the Stripe hosted invoice URL | not built |

### Logic
1. `volume()` writes six invoices, `INV-2026-08` back to `INV-2026-03`. It shrinks each earlier month's runs by 9 percent, multiplies runs by 14.7 for the governed actions, and charges the blocks above the allowance at $30.00 with the 20 percent discount.
2. The August invoice is open on a seeded 30 percent chance. The others are paid on the first of the next month.
3. The Paid column prints the date, or "Not paid" for an open invoice.
4. A paid invoice gets the green allowed badge. An open one gets the amber approval badge, so it never reads as paid.
5. **Open in Stripe ↗** goes nowhere in the mock. The build opens the hosted invoice URL.

An invoice-billed organization is suspended five days after an invoice is past due (§12.10, row 12). The page spec does not yet say how this list shows that invoice.

### States
Loaded only. The table's search, sort and pager come from the shared table helper.

## Price list

The published prices: the free tier, governed-action blocks, negotiated agreements, invoice billing, evidence retention, tokens Oxagen buys, and the annual Enterprise floor.

### Purpose
You can see what the next block, the next month of retention or an annual agreement would cost, without leaving the page or asking sales.

### Rationale
Every plan has every governance feature. Plans differ in evidence retention, seats and the included monthly allowance. A footer under the table used to say so. It explained the pricing model rather than stating a price, so it moved here. The rule comes from the 2026-09-15 maintainer decision that no feature is gated on a tier or on the enterprise license (§12.1, §12.10 row 3).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Price rows | an array literal in `pBilling()` | `billing.plans`, `billing.contract_terms` | partial |

### Logic
1. `pBilling()` renders seven fixed rows. The mock computes nothing here.
2. The rows are:
   - Free, with every governance feature, an allowance, 30 days of evidence and 3 seats.
   - Governed actions in blocks of 10,000, at $30.00 a block.
   - Negotiated agreement, priced per organization.
   - Invoice billing, never capped, with overage invoiced at the contracted rate at period end.
   - Evidence retention, 13 months included, then $0.10 per GB-month.
   - Tokens Oxagen buys for you, at cost and capped.
   - Enterprise, annual, from $60,000 a year.

The mock's prices predate §12.1 (2026-09-15), and the build follows §12.1:
- Tiers are Free at $0 with 5,000 GAU, Build at $199 a month with 50,000, Scale at $999 a month with 300,000, and Enterprise by contract.
- The list rate is $5 per 1,000 GAU, and blocks are 5,000 GAU at $25. Volume bands lower the rate above 1 million GAU a year.
- The in-app agent's tokens are sold as usage credits at provider cost times the meter markup (§12.10, row 17). They are not passed through at cost, so the "At cost, no markup" row does not survive.
- The build prints the organization's contracted rate from its `billing.contract_terms` row, where one exists.

### States
Loaded only.

## Billable units

The three classes a counted thing can fall into: priced, reported or free.

### Purpose
You check at a glance which of the things Oxagen counts cost money. It answers the question a finance reader asks after seeing the meters: why is this count on the page if I am not paying for it.

### Rationale
The priced unit is the governed action: a call Oxagen decided, delivered and recorded, with its receipt in the chain (ADR-055). Sealed runs, tokens by class and retained evidence are reported and never priced. Denials, runs Oxagen halted before a model call and runs of the in-app agent are free. The panel used to spell out those definitions in full sentences. The definitions explain the pricing model, so they moved here, and the panel keeps the classification as a list.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Priced, Reported, Free | fixed list in `pBilling()` | `billing.plans` (the billable action set) | partial |

### Logic
1. `pBilling()` draws a three-step `chain` list with the labels Priced, Reported and Free, each followed by the items in that class.
2. The list is static. It does not read the meters, and it changes only when the pricing model does.
3. It agrees with the Meters table: the Governed actions row is Priced, sealed runs and retained evidence are Reported, and halted runs and in-app runs are Free.

In the build the Priced class names `resolve_approval`, the one billable governed action in §12.1. It also names the second meter: the in-app agent's model calls, priced in usage credits. Every other governed action, `dod.held` included, is recorded in the ledger and not billed.

### States
Loaded only.

## Change plan {#dialog/plan}

The dialog stages a plan change in Stripe.

### Purpose
You move the organization to another plan. It is the one write on the Billing page and its one gold action.

### Rationale
Stripe holds the plan and the invoices. Oxagen counts the governed actions. The mock's toast used to say so, and the dialog carried a note that the free tier is inside every plan and that Enterprise adds a dedicated data plane, a behind-the-firewall deployment and support with an SLA. Both explained the product rather than the action, so they moved here. The toast now says only what happened.

A plan change is a governed action, `billing.plan.change`, and it is recorded in Audit with your name.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Plan options | fixed `<select>` in the `plan` entry of the dialog map | `billing.plans` | partial |
| The change | toast only | Stripe, through `start_subscription_upgrade` | partial |

### Logic
1. **Change plan** in the header calls `openDialog('plan')`. The dialog map renders the `plan` entry.
2. The Plan select offers "Team (usage-based, monthly, cancel any time)" and "Enterprise (annual, committed use at 20–30% off, from $60,000)".
3. **Change plan** closes the dialog and toasts "Plan change staged in Stripe." The mock writes nothing and the tiles do not change.

The build follows §12.10. Row 7 keeps an in-app upgrade to Build or Scale through Stripe Checkout, so `start_subscription_upgrade` stays. Row 3 makes Enterprise negotiated only: a `billing.contract_terms` row, with no Enterprise plan in Stripe. The build's select offers Build and Scale. Enterprise is set by contract, outside this dialog.

### States
The dialog has one state. On a phone it rises from the bottom as a sheet with full-width buttons.
