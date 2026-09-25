# Approvals drawer

| | |
|---|---|
| Route | None of its own. It opens over any page from the top bar. The story opens it over Work: `#/a-intel/core-platform/work`, with `?drawer=approvals` on the file URL (`missioncontrol.html?product=1&drawer=approvals#/a-intel/core-platform/work`). What it replaces: the approvals panel and the "Waiting on a human" tile of the retired Fleet page (`#/a-intel/core-platform`, which now lands on Work); the Agents page's "Waiting on you" tile opens this drawer |
| Scope | organization. It lists what waits on the viewer in every workspace of the organization |
| Spec | `docs/fleet-operations-wedge.md`: D3 (the Fleet waiting count is the drawer's count, shown on every page), D16 (Approvals and Stella are drawers that open from every page), D2 (each row names the run's work order), Cuts (the question stays in this drawer), D17 (future-only marks). `docs/fleet-operations-ia.md` (Drawers). The approval card and its dialogs were specified in `fleet.md`, which this spec replaces for them. `docs/mission-control-spec.md` §7.5 (the single-use approval token) |
| Design | `mockups/src/engine.js` → `apdButton()`, `apdToggle()`, `apdSelect()`, `apdBack()`, `apdHtml()`, `apdBody()`, `apdRow()`, `apdInterjectionRow()`, `apdPending()`, `apdInterjections()`, `apdCount()`, `approvalCard()`, `fourHop()`, `mandateBar()`, `rulesList()`, `taintBlock()`, `decisionFoot()`, `resolveApproval()`, `approvalSettle()`, `tick()`, and the `approve`, `deny` and `receipt` dialogs in `dialog()`; `mockups/src/boot.js` opens it for `?drawer=approvals`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Drawers / Approvals`: Loaded and Loaded · mobile |
| Audit | `approvals-drawer.audit-prompt.md` |

## Job

Put every decision that waits on a person in one place that opens from every page: each call parked for a person across the organization, and each run Oxagen holds for an answer. Picking one shows the whole approval card, the same card a run shows, so a decision never needs a page of its own. Each row says which run and which work order the call belongs to.

## What is on the page

**The button**, in the top bar left of the avatar, on every page including the organization pages: a shield glyph and the count of everything waiting ("17" on the demo record; "99+" above 99). aria-label "Approvals, 17 waiting on you across all workspaces", `aria-pressed` while open, `aria-controls="apdrawer"`.

**The drawer**: `aside#apdrawer`, `role=complementary`, aria-label "Approvals", sliding in from the right over a scrim. Closed, it is `inert` and `aria-hidden`.

- Header: h3 "Approvals", the badge "17 waiting on you in all workspaces" (approval colour while anything waits), and the close button (×, aria-label "Close approvals").

**The list**, the drawer's first view.

- The eyebrow "17 waiting on you".
- Questions first, one row per run Oxagen holds for an answer: the glyph, "release-manager is paused and needs a decision", the sentence "It’s working in `a-intel/edge-proxy`, which isn’t linked to any workspace, so there’s no skill configuration to apply. No cost since 09:14. If nobody answers within 30 min, the request is denied.", and "Answer" (gold), which closes the drawer and opens the held run (`run-interjection.md`). The row is a pointer; the answer is given on the run.
- Then one row per pending approval across the organization, soonest expiry first (the order `list_approvals` returns; the mockup keeps its fixture order). Each row is a button (aria-label "Open approval <id>") with:
  - the shield glyph;
  - the title: the amount, currency and tool ("$2,450.00 USD · stripe__create_payment@4"), or the tool alone ("github__create_release@2");
  - the agent's harness mark and short name, the run's title and the workspace ("release-manager · Cut 4.11.0 release notes · Core platform");
  - the run's work order in mono: "work order · wo_01K5RS7M4N" for a dispatched one, "direct · wo_01K5RN8F3J2GHY6T" for a direct one;
  - the badges: risk ("high", "critical"), "Irreversible" and "tainted" where they apply;
  - on the right, the countdown in m:ss, in warning ink under two minutes.
  - A row whose risk is critical, or whose side effect is irreversible, or which is tainted, carries the critical border.
- Then the eyebrow "1 resolved today" and one row per approval resolved today, with its outcome ("approved", "denied", "expired") in place of the countdown. A resolved row opens its card too.
- Under the lists, the note: "Approving allows this exact call once. When the approval expires, the call ends and the agent is told why."
- With nothing waiting: "Nothing is waiting on you." and "A call parks here when policy returns approve. A denied call never parks. It ends at once and costs nothing."

The demo record lists 1 question and 16 pending approvals from six workspaces (Core platform, FinOps, Data platform, Mobile, Growth and Security), and 1 resolved today.

**The card**, the drawer's second view: "‹ All approvals" above the full approval card for the row picked. It is the same card a run's parked approval shows.

- The head: the eyebrow "Approval required" (or "Approval approved", "Approval denied", "Approval expired"), the amount with its currency or the tool, the compact agent card, the tool and counterparty ("stripe__create_payment@4 → vendor:aws") with the task under it, and the badges: risk, `side_effect <value>`, "tainted", `egress <value>`, and the tier the approval recorded. On the right: "times out in" and the countdown (or "resolved" and a dash), "parked 09:31:08Z · timeout 10m", and "When it expires, the call ends and the agent is told why.".
- The four-hop chain, numbered: 1 Operator (the name, the role in the workspace, the task), 2 Agent (the key, the harness mark and name, the tier, the run id), 3 Action (the tool's label and id, the amount and counterparty, risk, side effect and egress), 4 Rule ("4 rules required approval", the policy and the mandate, the rule that parked it).
- Remaining authority, when a mandate backs the call: a bar of settled, reserved by this call, and remaining, "of $5,000.00 USD", with the legend "settled $1,284.60 (25.7%)", "reserved by this call $2,450.00 (49.0%)" and "remaining $1,265.40".
- Two columns. Mandate (Mandate, a link to the agent's Delegation; Granted by; Purpose; Auto-approve limit; Valid to), or Grant when no mandate backs it (Operator; Policy, with when and by whom it was activated; Rule; Tier, with one line on what that tier means for this call). Then The call (Tool version, Input digest, Idempotency, "Amount" when an amount leads, Requested, and Run, a link to the run).
- Taint, when tainted: "tainted · 1 source", the line "Arguments that derive from untrusted tool output. Taint on a write raises the decision to approval.", and each source: its frame (a link), the argument path and the tool and note.
- "Rules that fired": one line per rule with its verdict ("approve", "allow", "constrain"), the rule id in mono and its text.
- "Eligible approvers: …", naming the role and the people, and anyone a rule excludes.
- The footer, pending: one line on what approving and denying do (approving mints a single-use token bound to this exact call digest; denying ends the call, releases any reservation back to the mandate, and the reason reaches the model), then "Open run", "Deny" or "Deny payment" (danger; opens `deny`) and "Approve" or "Approve $2,450.00 USD" (gold; opens `approve`). Resolved: the outcome badge, what happened (who, the token and its dispatch, or what was released and that nothing dispatched), "Open receipt" where a receipt exists, and "Open run".

**Dialogs the drawer opens:**

- `approve`: "Approve this action", the call's badges and tool, "The exact call you are approving" (the tool version, the input digest and the idempotency key), a Reason field labelled "Reason (the agent is told it)", the note "Approving allows this exact call once.", and "Cancel" and "Approve this call" (gold).
- `deny`: "Deny this action", a Reason field the model reads, a line that deny, approve and expiry are all frames and that a denial ends the call and costs nothing, and "Cancel" and "Deny with this reason" (danger).
- `receipt`: the receipt of a resolved approval, from "Open receipt".

## Data sources

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen (file paths) | Status |
|---|---|---|---|---|
| The button's count | `apdCount()` over `APPROVALS`, `S.ap` and `skWaiting()` | pending approvals across the organization, plus open questions | `get_nav_counts` counts one workspace (`packages/oxagen/src/contracts/shell.nav_counts.get.ts:18`, `:38`); the app sums `list_approvals` over the organization's workspaces and says "+" past the ones it reads (`apps/app/src/features/shell/shell-data.ts:16-40`). Questions are not counted (#3849) | 🟡 |
| Pending rows: id, tool, run, expiry, mandate, rule | `APPROVALS` (`fixtures/approvals.json`) + `S.ap` | `list_approvals` | `packages/oxagen/src/contracts/agent.approval.list.ts:81`, items `:26-78`, workspace-scoped, soonest expiry first | ✅ |
| Rows: amount, risk, side effect, taint, run title | `APPROVALS` | the approval row | not returned by `list_approvals` (`apps/app/src/features/shell/approvals-drawer.tsx:17-21`, #3848) | ❌ |
| Rows: agent | `APPROVALS[].agent` | the approval row | `chain.agentKey` is "Not recorded today" (`agent.approval.list.ts:65-68`); the run it names carries `agentKey` (`packages/oxagen/src/contracts/run.list.ts:240`) | 🟡 |
| Rows: the run's work order | `runParent()` | a `work_order_id` on the run (wedge Open decision 5) | none | ❌ |
| Resolved today | `APPROVALS` with `S.ap` resolved | `list_resolved_approvals` | `packages/oxagen/src/contracts/agent.approval.list_resolved.ts:77` (resolution, resolved by, auto rule) | ✅ |
| Question rows | `skWaiting()`, `SKRUN` | open questions | none (`approvals-drawer.tsx:21-22`, #3849) | ❌ |
| Card: operator, run, rule, mandate, auto-approval eligibility | `APPROVALS`, `PEOPLE` | `list_approvals`; `get_auto_eligibility` | `requester`, `runId`, `chain.rule`, `mandateId`, `autoEligibility` (`agent.approval.list.ts:26-78`); `packages/oxagen/src/contracts/approval.auto_eligibility.get.ts:21` | ✅ |
| Card: remaining authority and the mandate block | `MANDATES`, `mandateBar()` | `get_mandate` | the grant, remaining authority by measure, and the ledger (`packages/oxagen/src/contracts/mandate.get.ts:19`) | ✅ |
| Card: amount, counterparty, egress, side effect, taint sources, input digest, idempotency, approvers, tier | `APPROVALS` | the approval row | not returned (#3848) | ❌ |
| Card: rules that fired | `APPROVALS[].rules` | the approval row's rule ids | the first rule only, `chain.rule` (`agent.approval.list.ts:69-74`); the rest and their texts are not returned | 🟡 |
| Approve and Deny | `resolveApproval()`, `approvalSettle()` | `resolve_approval` | `packages/oxagen/src/contracts/agent.approval.resolve.ts:39`, with the mandate settlement (held or released) in its output | ✅ |
| Receipt | `RECEIPTS`, `approvalReceipt()` | a receipt read by id | no capability reads a receipt | ❌ |

## Future-only fields

The drawer carries no future-only mark, and the catalog gives it no future story. The ❌ rows above are future-only nonetheless. A build draws what `list_approvals` returns and says once, in a line, what a row cannot show yet, as the app's drawer does today (#3848, #3849): no amount, risk, side effect, taint or task on a row, and no question row.

## Functionality

- The count is every pending approval across the organization plus every open question. It is on every page, in the button, and nowhere else: no sidebar count includes it. The Agents page's "Waiting on you" tile opens the drawer.
- Opening the drawer closes any open menu. Escape closes it when no dialog is open, and so do the scrim and the close button. Closing returns the drawer to the list.
- The countdowns tick every second in place, in the list and on the card. An approval that reaches zero expires: the call ends, the reason "approval timeout" reaches the model as the permission decision, any reservation is released, nothing dispatches, and a toast says so.
- Approve mints a single-use token bound to the call digest, the agent, the run and an expiry. The call dispatches with a brokered credential the agent never holds, a receipt is written and chained on the run, and a mandate reservation settles. Deny needs a reason; without one, a toast asks for it. A denial ends the call, dispatches nothing, releases any reservation, and the reason reaches the model.
- A decision is written once. Resolving an approval already resolved says who resolved it.
- Resolving from the drawer is the same governed action as from a run's parked frame or its Evidence card: one record, one clock.
- Each row names the run's work order, dispatched or direct (D2), so a decision can be read against the work it belongs to.
- The walk W3 (`money-asked`) opens this drawer, reads the card, and approves from it.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed. The list's own empty text is part of the loaded design, and a read that failed never shows it.

## Mobile

- The button stays in the compact top bar with its count.
- The drawer is full width over the page. Rows keep their title, lines, badges and countdown, with the title truncated to one line.
- The card's two body columns (Mandate or Grant, and The call) stack. The four-hop chain stays four columns of about 89 px in the mockup, breaks words mid-word and clips the Action hop's tool label; a build stacks the four hops.
- `approve`, `deny` and `receipt` rise from the bottom as sheets with full-width buttons.
- Every row and button has a hit area of at least 44 px, and nothing scrolls sideways.

## Permissions

- Read: `list_approvals` and `list_resolved_approvals` in each workspace, allowed by default to organization Owner and Admin and to workspace Owner and Member (`agent.approval.list.ts:94-97`). A workspace the viewer cannot read contributes nothing to the list or the count.
- Write: `resolve_approval` for Approve and Deny, a governed action in Audit, allowed by default to organization Owner and Admin and workspace Owner and Member (`agent.approval.resolve.ts:50-53`), and checked in the handler. A rule can exclude a person from resolving (the card's "fin.no_self_approval" excludes the run's operator), and the eligible approvers line names who remains.

## Backend gaps this page depends on

- The approval row's amount, currency, counterparty, risk, side effect, egress, taint sources, input digest, idempotency key, tier, eligible approvers and every rule that fired, on `list_approvals` (#3848).
- The agent that raised the call on the approval row (`chain.agentKey`).
- Open questions as records, joined into the count and the list (#3849).
- One organization-wide read, so the count needs no read per workspace.
- A `work_order_id` on the run, for the work order line.
- A receipt read by id, for "Open receipt".
- The single-use approval token a resolution mints, bound to the call digest, the agent, the run and an expiry. The v2 design contract names it (`packages/oxagen/src/contracts/v2/resolve-approval.ts:111-121`), and no handler returns it. The shipped `resolve_approval` returns the decision and the mandate settlement.
- A refusal of a second decision that names who made the first. The handler answers `conflict` with the reason `approval_expired` for any row that is not pending (`packages/agent/src/handlers/agent.approval.resolve.ts:70-75`).

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. The card's taint sources and runs link to frames.
- The drawer reads the record. The rules that fired are lines somebody wrote; nothing on the card is a model's opinion, a score or an inference.
- No person is scored or ranked. The eligible approvers line names roles and people, and never grades them.
- Every enforcement claim states the tier. The card's tier is the one the approval recorded, and "routed through oxagen" appears only for calls that were.
- Headers are rollups of the rows beneath them: the button's count, the header's "N waiting on you in all workspaces" and "N waiting on you" are the rows listed, and "N resolved today" is its rows.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: "Answer" in the list while a question waits, "Approve" on the card, or the open dialog's primary.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
