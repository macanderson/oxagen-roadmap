# Audit prompt: Work order

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Work order** page of Oxagen (`#/a-intel/core-platform/tasks/work-orders/<woId>`), its `woaccept` and `wostop` dialogs, and the delivery path behind it, for conformance to their design. Be exact and adversarial: the design is the spec, and "close enough" is a fail.

## Inputs

1. The page spec: `mockups/pages/work-order.md` (read it first, in full).
2. The design, rendered: the `work-order` stories, or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/tasks/work-orders/<id>` for `wo_01K6T9QX` (a workflow at stage 2 after a return), `wo_01K6TA2M` (waiting on you), `wo_01K6RZ41` (accepted). The flow check is `node tools/check-tasks.mjs` (flows 5 and 7).
3. The product spec: `docs/tasks-spec.md` §9.5, §9.6, §10, §11.
4. The build under audit: `{{APP_ROOT}}`, served at `{{APP_URL}}`.

## Procedure

Record PASS, FAIL, or N/A (with why) for every check, with evidence.

1. **Header.** The id as eyebrow, the title as h1, "Sent by <name> on <time> to <target>." **Stop the work order** (red) from the start receipt on, and **Withdraw** (red) before it (check 15). **Accept the work** is gold only when every item is claimed and the work order is not accepted; otherwise disabled with its reason. One gold on the screen. **Copy prompt** (plain) copies the prompt as sent, character for character, then the work order id, link, and digest, and every task's number, issue link, and Oxagen task id and link.
2. **Tiles.** State, Items claimed, Items accepted, Returns, each read from the rows below.
3. **Stages.** One card per stage plus Accept by You. Each card shows the step, role, harness mark, avatar, name, **tier**, and the latest run (`live` or `sealed`, id, run count) or "waiting". Done, current and waiting stages are distinguishable without colour alone.
4. **Definition of done table.** Columns in order: Item · Task · Stage · State · Evidence. States are exactly `open`, `claimed`, `accepted`. A claim shows the evidence, the agent and the run. Verify that no code path marks an item `accepted` without a signed-in person.
5. **Handoffs.** Every stage run in order with its note, returns labelled "returned the work", and the note that a handoff is quoted evidence. Verify in the delivery code that a handoff note reaches the next agent inside a quoted-evidence frame, never as an instruction.
6. **Returns.** A stage returns only to a stage its file names, at most `max_returns` times; the next return parks the work order for the operator in the Approvals drawer. Verify both bounds on the server.
7. **Tasks, repositories, prompt.** Tasks link to their pages. Repositories list only what was confirmed at send, with the production-branch note. The prompt is the text as sent with its digest; recompute the digest; no control edits it.
8. **Delivery.** For each runtime path in spec §9.6 that the build implements, verify the run records the work order and its tasks as its task reference, that the brief loads in Claude Code, Codex, Cursor and Stella (ADR-101), and that Oxagen itself starts no agent process outside the launcher ADR-096 allows.
9. **Enforcement.** A write to a repository outside the work order is refused on `gateway` and `contained`, and the page never claims more than the agent's tier enforces. The spend cap counts every stage but a Cursor one, and the page says so for a Cursor stage.
10. **Accept.** `woaccept` says what accepting records, that it merges nothing, and what the close switch does. Accepting records `accept_work_order`, marks every item `accepted`, the work order `accepted`, and each task `accepted`, and closes each task in its provider as Done, in the provider's word for the unit of work, only when the switch is on.
11. **Stop.** `wostop` cancels the live run through `dispatch_command` at its next boundary, starts no later stage, leaves branches and pull requests, and returns the tasks to ready with their certifications intact.
12. **Not found and states.** An unknown id renders "No work order has this id" with **Back to work orders**. loading, error (`503 work_order_store_unavailable`), denied (`work_order.read on core-platform`).
13. **Trust language, plain nouns, mobile, accessibility.** No verdict vocabulary; headings plain; the chain stacks without arrows on a phone; the table becomes labelled cards; dialogs are `role=dialog aria-modal`.
14. **Permissions.** `work_order.accept` gated server-side for accept and stop, and `work_order.send` for send now, withdraw and send again. Verify with a role that lacks it.
15. **Queued, released, withdrawn, expired.** A `queued` work order shows the queued subtext with its blocker and expiry, **Send now** (plain, never gold) and **Withdraw** (red), every stage "waiting", and the Order panel naming the blockers outside it. `worelease` quotes the line the prompt gains and records `release_work_order` with the blockers still open. `wowithdraw` applies only before the start receipt, records `withdraw_work_order`, and returns the tasks to ready; from the receipt on the button is **Stop the work order**. An expired work order shows "expired on <date>" and **Send again**, which opens the dialog pre-filled and records `retry_of`; cost stays on the old record. The state reads `in progress` only after `record_work_order_start`; verify a released work order with no receipt reads `sent`.
16. **Stages by layer.** Stages that need the same stage sit in one column, the arrows come from the stages each needs, and a card reads "after <role> and <role>" when it needs more than one. Two ready stages start as two runs with two holds against the one cap. A return marks downstream stages `to run again` in the approval colour, a run recorded before the return is marked "before the return", and a fan-in stage's Handoffs list a note from each stage it needed. A parked or stopped stage holds everything downstream while a parallel stage already running finishes and hands off.
17. **Send with several work orders.** The header reads "N of M in send snd_…", the Send panel lists each sibling with target, state, items claimed and cost with basis, in send order and with no rank, and `woaccept` names the siblings accepting will stop.
18. **Nothing extra.** List anything not in the spec.

## Output

The report format of `tasks.audit-prompt.md`, titled `# Work order: audit {{DATE}}`.

Rules: never mark PASS on an assumption. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
