# Approvals drawer

## Drawer

The Approvals drawer lists every call parked for a person across the organization, and every run Oxagen holds for an answer, behind the shield button in the top bar.

### Purpose
It answers "what is waiting on me, and how long do I have". You scan the rows, soonest expiry first, pick one, and decide it on the full card without leaving the page you were on. Resolved rows stay listed for the day, so you can see what a colleague already decided.

### Rationale
The Fleet page retired, and its waiting count became this drawer's count, shown on every page (D3 in `docs/fleet-operations-wedge.md`). Approvals and Stella are drawers that open from every page (D16), so a decision never needs a page of its own. Each row names its run's work order, dispatched or direct, because a run is a child of exactly one work order (D2). The interjection question stays here too (Cuts). A call parks when policy returns `approve`. A denied call does not park: it ends at once and costs nothing, which is why a call you expected to see may be absent from the list. Approving allows the exact call once, and when an approval expires the call ends and the agent is told why.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Button and header count | `apdCount()` over `APPROVALS`, `S.ap` and `skWaiting()` | pending approvals across the organization, plus open questions | partial: `get_nav_counts` counts one workspace; questions are not counted (#3849) |
| Pending rows: id, tool, run, expiry, mandate, rule | `APPROVALS` (`fixtures/approvals.json` plus the rows `volume()` adds) and `S.ap` | `list_approvals` (`agent.approval.list.ts`), soonest expiry first | shipped |
| Rows: amount, risk, side effect, taint, run title | `APPROVALS` | the approval row | future-only (#3848) |
| Rows: agent | `APPROVALS[].agent` | `chain.agentKey`, not recorded today; the run carries `agentKey` | partial |
| Rows: work order | `runParent()` | a `work_order_id` on the run (wedge Open decision 5) | future-only |
| Resolved today | `APPROVALS` resolved in `S.ap` | `list_resolved_approvals` (`agent.approval.list_resolved.ts`) | shipped |
| Question rows | `skWaiting()`, `SKRUN` | open questions | future-only (#3849) |

### Logic
1. `apdPending()` keeps approvals whose state is pending. `apdInterjections()` keeps workspaces with a held question. `apdCount()` adds the two.
2. `apdButton()` shows the count ("99+" above 99) with `aria-pressed` and `aria-controls="apdrawer"`. `apdToggle()` opens or closes the drawer, clears the selection on close, and closes any open menu.
3. `apdBody()` draws the eyebrow "N waiting on you", question rows first (`apdInterjectionRow()`), then one `apdRow()` per pending approval, then "N resolved today" and its rows.
4. A row whose risk is critical, whose side effect is irreversible, or which is tainted gets the critical border.
5. Each countdown ticks every second in place (`tick()` updates every `[data-countdown]`), in warning ink under two minutes. At zero the approval expires: nothing dispatches, any reservation is released, and a toast says so.
6. Picking a row calls `apdSelect(id)` and draws the approval card. "‹ All approvals" calls `apdBack()`.
7. Escape closes the drawer when no dialog is open, and so do the scrim and the close button.

### States
Loaded, and the empty list: "Nothing is waiting on you." A failed read uses the shell's error panel and never shows the empty text. On a phone the drawer is full width over the page and rows truncate their title to one line.

## Question row

A question row is a run Oxagen holds until a person answers it.

### Purpose
It tells you an agent is paused and needs a decision, why, what it has cost since, and what happens if nobody answers. Answer takes you to the held run, where you give the answer.

### Rationale
The skills console was cut, and its interjection moved into this drawer (Cuts in `docs/fleet-operations-wedge.md`), so everything waiting on a person has one home. The row is a pointer, not a form: the answer needs the run's context, so it is given on the run (`mockups/pages/run-interjection.md`). It sits above the approvals because a held run costs time on every turn it waits.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent, harness, repository, time | `SKRUN` (`fixtures/skrun.json`) | open questions as records | future-only (#3849) |
| Whether it shows | `skWaiting(w)`: skills on, the question's workspace, not yet answered | the question's state | future-only |

### Logic
1. `apdInterjectionRow(x)` draws the glyph, the title "<agent> is paused and needs a decision", and the sentence naming the unlinked repository, the time cost stopped, and the 30 minute timeout.
2. The row is not a button (`cursor:default`). Answer is the one gold action on the list, and it closes the drawer and opens the run.
3. Once the question is answered, `skWaiting()` returns 0 and the row and its count go.

### States
Shown only while a question is open.

## Approval card

The approval card is the whole record of one parked call: what it does, who asked, which rule parked it, what authority is left, and the two decisions.

### Purpose
You read enough to decide without opening the run: the amount or tool, the agent, the counterparty, the four-hop chain from operator to rule, the mandate's remaining authority, the exact call, any taint, and every rule that fired. Then you approve or deny.

### Rationale
It is the same card a run's parked approval shows, so a decision in the drawer and on the run is one governed action on one record with one clock (`mockups/pages/approvals-drawer.md`, Functionality). The four hops follow `docs/mission-control-spec.md` §7.5: an approval request carries the operator, the agent, the call and the rule. When it expires, the call ends and the agent is told why. The Tier row states the tier the approval recorded. At `gateway` or above, the call was routed through the gateway, so Oxagen decided before it left the host. At `harness`, Oxagen decided the routed call, while the agent's native tools are reported by the harness and fail open. At `observe`, the call was recorded only. Taint marks arguments that derive from untrusted tool output, and taint on a write raises the decision to approval (§6.7). Approving allows this exact call once. Denying ends the call, releases any reservation back to the mandate, and the agent is told your reason.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Operator, run, rule, mandate, auto-approval | `APPROVALS`, `PEOPLE` | `list_approvals`; `get_auto_eligibility` | shipped |
| Remaining authority and the mandate block | `MANDATES`, `mandateBar()` | `get_mandate` (`mandate.get.ts`) | shipped |
| Amount, counterparty, egress, side effect, taint sources, input digest, idempotency, approvers, tier | `APPROVALS` | the approval row | future-only (#3848) |
| Rules that fired | `APPROVALS[].rules` | `chain.rule`, the first rule only | partial |
| Receipt | `RECEIPTS`, `approvalReceipt()` | a receipt read by id | future-only |

### Logic
1. `approvalCard(a)` draws the head: "Approval required" or "Approval <outcome>", the amount or tool, `agentCard()`, the tool and counterparty, the task, and the badges (risk, side effect, taint, egress, tier). The right side shows the countdown, or "resolved" and a dash, and the parked time and timeout.
2. `fourHop(a)` numbers Operator, Agent, Action and Rule. The Rule hop counts the rules whose verdict is `approve`.
3. With a mandate, `mandateBar(m, true)` splits the period limit into settled, reserved by this call, and remaining, and the Mandate block links the agent's Delegation. Without one, the Grant block shows the operator, the policy with who activated it, the rule and the tier.
4. `taintBlock(a)` lists each source: its frame, the argument path, and the tool and note.
5. `rulesList(a)` shows each rule with its verdict, id and text. "Eligible approvers" names the role, the people, and anyone a rule excludes.
6. `decisionFoot(a)`: pending shows Open run, Deny (Deny payment when an amount leads), and Approve with the amount. Resolved shows the outcome, what happened, Open receipt where one exists, and Open run.
7. A decision is written once. `resolveApproval()` refuses a second one and names who made the first.

### States
Pending, approved, denied, expired and canceled, each with its footer. On a phone the Mandate or Grant and The call columns stack. The four hops stay in four columns in the mockup, and a build stacks them.

## Approve this action {#dialog/approve}

The approve dialog confirms the exact call you are approving and records your reason.

### Purpose
It shows the call's badges, the tool, the amount and counterparty, the exact call (tool version, input digest, amount, idempotency key), and the mandate position after this call. You give a reason and approve.

### Rationale
An approval binds to one call, not to a tool or an agent, so the dialog shows the digest the token will be bound to. Each call reserves its amount against the mandate before it is sent, so two calls cannot overspend the remaining balance. The reason reaches the model as the permission decision reason (`docs/mission-control-spec.md` §7.5).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Badges, tool, amount, counterparty, digest | `APPROVALS` | the approval row | future-only (#3848) |
| Mandate position | `mandateFor(a)` | `get_mandate` | shipped |
| The decision | `resolveApproval(id, "approved")`, `approvalSettle()` | `resolve_approval` (`agent.approval.resolve.ts`), with the mandate settlement in its output | shipped |
| The single-use token | `apt_` plus the digest | the v2 contract names it; no handler returns it | future-only |

### Logic
1. `approveBody()` finds the approval by `S.dlgArg`, falling back to the first.
2. Approve this call calls `resolveApproval()`. It refuses an approval already resolved, then `approvalSettle()` appends the decision, token and dispatch frames to the run, writes the receipt, and turns the reservation into a settlement.
3. Two toasts follow: the token minted and the tool dispatched, then the receipt written and chained, with the mandate's balance when one backs the call.

### States
Loaded. On a phone the dialog rises as a bottom sheet with full-width buttons.

## Deny this action {#dialog/deny}

The deny dialog ends the parked call and tells the agent why.

### Purpose
You give the reason the agent will read, then deny. Nothing dispatches.

### Rationale
Deny, approve and expiry are all frames on the run (`docs/mission-control-spec.md` §7.5), so a denial is as much a part of the record as an approval. A reason is required because it reaches the model as the permission decision reason. An unexplained refusal leaves the agent guessing.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Reason | the dialog's textarea | `resolve_approval` reason | shipped |
| Reservation release | `approvalSettle()` | `resolve_approval` settlement | shipped |

### Logic
1. `denyBody()` draws the Reason field and the warning line.
2. Deny with this reason calls `resolveApproval(id, "denied")`. With an empty reason it keeps the dialog open, focuses the field, and posts "A denial needs a reason. The agent is told it."
3. A denial dispatches nothing, mints no credential, releases any reservation back to the mandate, and posts a toast that says so.

### States
Loaded. On a phone the dialog rises as a bottom sheet with full-width buttons.
