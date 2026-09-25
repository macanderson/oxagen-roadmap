# Audit prompt: Work order

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Work order** page of Oxagen (`/a-intel/core-platform/work/orders/<order>`), a dispatched work order and a direct one, with its `woaccept` and `wostop` dialogs and the delivery path behind it, for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarize what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/work-order.md` (read it first, in full).
2. The design, rendered: the stories `Oxagen / Work / Work order` (Loaded, Loaded · mobile, Loaded · future-only fields marked), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>[&future=1]#/a-intel/core-platform/work/orders/<id>` for `wo_01K5RS7M4N` (dispatched to one agent, live), `wo_01K6T9QX` (a workflow at stage 2 after a return), `wo_01K6TA2M` (waiting on you), `wo_01K6RZ41` (accepted), `wo_01K5RQ4B9C7XTN2P` (direct, sealed) and `wo_01K53TV12GW6ARFD` (direct, live, no work item). The flow check is `node tools/check-tasks.mjs` (flows 5, 7 and 8).
3. The product specs: `docs/fleet-operations-wedge.md` (D2, D4 to D6, D17; Steering › Emissions; Work), `docs/tasks-spec.md` §9.5, §9.6, §10.3, §11, §14.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

5. The work graph: `docs/work-graph-spec.md` §6, §7, §8.2, §11.3, §12.3, §12.4.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/a-intel/core-platform/work/orders/<order>`, with Work lit and the breadcrumbs ending “Work orders / <id>”, the id in mono. The run page of each of its runs names this work order in its header and breadcrumb.
2. **Header, dispatched.** The id and `dispatched` as the eyebrow, the title as h1, “Sent by <name> on <time> to <agent, or the <name> workflow>.” **Copy brief** (plain), **Stop work order** (red) while open, and **Accept all items**: gold only when every item is claimed and the work order is open, otherwise plain and disabled with its reason. On an accepted work order the reason must not say an item is unclaimed. One gold on the screen at most. After a copy, **Copy brief** shows a green check and “Copied” for about 1.6 seconds, then its label again. A button that does not change is a FAIL.
3. **Header, direct.** The id and `direct`, the title from the run’s task reference or first prompt, and “Oxagen opened it on <time> for a run <operator> started outside Oxagen …”. **Stop work order** only while the run is live, parked or paused, and **Attach to a work item** as the design shows it. Where the record attributes the run to its host’s enroller, the sentence must not say that person started it.
4. **Tiles.** State, Items claimed (“by the agents, with evidence”), Items accepted (“by a person”) and Spend (with the cap when one was set, and each run’s own basis). Recompute each from the rows below: Items claimed and accepted from the Definition of done table, Spend from the Runs table. A typed figure is a FAIL. Send a new work order with a cap and confirm the cap reaches this tile.
5. **Stages.** One card per stage plus Accept by You. Each card shows the step, role, harness mark, avatar, name, **tier**, and the latest run (`live` or `sealed`, the id, the run count) or “waiting”. Done, current and waiting stages are distinguishable without colour alone.
6. **Runs.** Columns in order: Run · Stage · Agent · Status · Tier · Cost · Started, one row per run the work order started, each opening its run. Cost carries its basis. The Agent cell is the agent card, led by the harness mark. Every run listed must name this work order as its parent on its own record.
7. **Definition of done.** Columns in order: Item · Work item · Stage · State · Evidence. States are exactly `open`, `claimed`, `accepted`. A claim shows its evidence, the agent and the run. Verify that no code path marks an item `accepted` without a signed-in person. A direct work order shows “None.” and nothing more. Why it has none is in `mockups/help/work-order.md`, Definition of done.
8. **Handoffs.** Every stage run in order with its note and a return labeled “sent the work back”, with no note under the list. That a handoff is quoted evidence is in `mockups/help/work-order.md`, Handoffs. Verify in the delivery code that a handoff note reaches the next agent inside a quoted-evidence frame, never as an instruction. A sealed run is never labelled “running”, and a direct work order shows no Handoffs panel.
9. **Returns.** A stage returns only to a stage its file names, at most `max_returns` times, and the next return parks the work order for the operator in the Approvals drawer. Verify both bounds on the server.
10. **Work items, repositories, brief.** Work items link to their pages. Repositories list only what was confirmed at send, and the note on branches and pull requests appears only where a work order set that limit. The brief is the text as sent with its digest: recompute the digest, and confirm no control edits it. A direct work order shows no brief, only “None. Its first prompt is on the run.”
11. **SteeringFrames from this send.** One `invocation` for the brief, one `goal` per work item, one `constraint` per definition-of-done item, one for the repositories and one for the cap when set, each with its hash, and the provenance note naming the work order and the brief digest, with no subtext under the heading. None is called a frame, and the work order is never listed as one. Absent on a direct work order.
12. **Delivery.** For each runtime path in `tasks-spec.md` §9.6 that the build implements, verify the run records this work order as its parent, that the brief loads in Claude Code, Codex, Cursor and Stella (ADR-101), and that Oxagen itself starts no agent process outside the launcher ADR-096 allows.
13. **Accept.** `woaccept` says that accepting merges nothing, names the pull request a person merges, and says what the close switch does in the provider. What accepting records is in `mockups/help/work-order.md`, Accept dialog. Accepting records `accept_work_order`, marks every item, the work order and each work item `accepted`, and closes each work item in its provider as Done, in the provider’s word for the unit, only when the switch is on.
14. **Stop.** `wostop` cancels the live run through `dispatch_command` at its next boundary, starts no later stage, leaves branches and pull requests, and returns the work items to ready with their certifications intact.
15. **Data sources.** For each row of the spec’s Data sources table, find what feeds it in the build. ✅ rows (each stage agent’s harness and tier, each run’s fields, the pull request) are wired to the named contract. 🟡 rows (a direct work order’s sender and task reference, the Spend tile, Stop) are wired for what exists and render `not recorded` for the rest. ❌ rows render `not recorded` or are left out, never a zero and never a fixture.
16. **Future-only fields.** The tiles, the SteeringFrames panel, the `direct` badge and **Attach to a work item**, and every other field the spec lists, render `not recorded` or are left out until their contracts ship. A control that silently does nothing is a FAIL.
17. **States.** The design has the loaded state only. Force loading, error, empty and denied: each must be the shell’s standard panel inside the shell. An unknown id renders “No work order has this id” with **Back to work orders**, inside the shell.
18. **Mobile.** At 390 × 844: the thumb bar (Work, Agents, Tools, Spend, More); the stage chain stacks without arrows; the columns stack, main first; the tables are labelled cards; dialogs are bottom sheets with full-width footer buttons; nothing scrolls sideways; touch targets at least 44 px.
19. **Rules.** No verdict vocabulary. No heading or caption carries a comma, a mid-dot, or a not/never contrast. Money shows its basis. A claim is never shown as accepted. The page never claims more enforcement than a stage agent’s tier gives. The object is a work item, never a task, in every string a person reads, a work order’s title included.
20. **Accessibility.** Dialogs are `role=dialog aria-modal` with a labelled close. Run links and rows are keyboard operable. State is never colour alone.
21. **Permissions.** `work_order.read` to see the page, and `work_order.accept` gated on the server for accept and stop. Verify with a role that lacks each.
22. **Queued, released, withdrawn, expired.** A `queued` work order shows the queued subtext with its blocker and expiry, **Send now** (plain, never gold) and **Withdraw** (red), every stage “waiting”, and the Order panel naming the blockers outside it. `worelease` quotes the line the brief gains and records `release_work_order` with the blockers still open. `wowithdraw` applies only before the start receipt, records `withdraw_work_order`, and returns the items to ready; from the receipt on the button is **Stop work order**. An expired work order shows “expired on <date>” and **Send again**, which opens the dialog pre-filled and records `retry_of`; cost stays on the old record. The state reads `in progress` only after `record_work_order_start`; a released work order with no receipt reads `sent`.
23. **Stages by layer.** Stages that need the same stage sit in one column, the arrows come from the stages each needs, and a card reads “after <role> and <role>” when it needs more than one. Two ready stages start as two runs with two holds against the one cap. A fan-in stage’s Handoffs list a note from each stage it needed. A parked or stopped stage holds everything downstream while a parallel stage already running finishes and hands off.
24. **Send with several work orders.** The header reads “k of N in send snd_…”, the Send panel lists each sibling with target, state, items claimed and cost with basis, in send order and with no rank, and `woaccept` names the siblings accepting will stop.
25. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding, and the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Work order audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
