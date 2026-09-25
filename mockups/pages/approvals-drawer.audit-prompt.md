# Audit prompt: Approvals drawer

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built drawer against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Approvals drawer** of Oxagen, which opens from the top bar on every page, for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/approvals-drawer.md`. Read it first, in full. Also read `mockups/pages/run-interjection.md` for the question row it lists first.
2. The design, rendered: the stories `Oxagen / Drawers / Approvals` (Loaded, Loaded · mobile) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>&drawer=approvals#/a-intel/core-platform/work`. Pick the `$2,450.00 USD · stripe__create_payment@4` row for a card with a mandate and taint, and `github__create_release@2` for one without. The walk W3 (`money-asked`) uses the drawer. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (D2, D3, D16, and the Cuts row on the question) and `docs/fleet-operations-ia.md` (Drawers).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **The button.** In the top bar left of the avatar on every page, organization pages included: the shield glyph and the count ("99+" above 99), aria-label "Approvals, N waiting on you across all workspaces", `aria-pressed` while open, `aria-controls` naming the drawer. The count is every pending approval across the organization plus every open question, and no sidebar count repeats it. The Agents page's "Waiting on you" tile opens the drawer.
2. **The drawer.** An `aside` with `role=complementary` and the label "Approvals", from the right over a scrim, `inert` when closed. The header: "Approvals", the badge "N waiting on you in all workspaces", and a close button labelled "Close approvals". Escape (with no dialog open), the scrim and the close button each close it, and closing returns it to the list.
3. **The list.** The eyebrow "N waiting on you". Question rows first, each with its sentence and "Answer", which closes the drawer and opens the held run. Then one row per pending approval across the organization, in soonest-expiry order, each a button naming its approval, with the title (amount, currency and tool, or the tool), the agent, the run title and the workspace, the run's work order ("work order · <id>" or "direct · <id>"), the risk, "Irreversible" and "tainted" badges where they apply, the countdown, and the critical border where the spec says. Then "N resolved today" and its rows with their outcomes. Then the token note, verbatim. With nothing waiting, the two empty lines, verbatim.
4. **The card.** Picking a row shows "‹ All approvals" and the full card: the head (eyebrow, amount or tool, agent, tool and counterparty, task, badges, the countdown with "parked <time> · timeout <t>" and the expiry line), the four numbered hops (Operator, Agent, Action, Rule), Remaining authority when a mandate backs the call (settled, reserved by this call, remaining, of the limit), Mandate or Grant, The call, Taint when tainted, Rules that fired with their verdicts, Eligible approvers, and the footer. It is the same card a run's parked approval frame shows.
5. **Decisions.** Pending: "Open run", "Deny" ("Deny payment" when an amount leads) and "Approve" (with the amount when one leads). `approve` shows the exact call (tool version, input digest, idempotency key), a Reason field, the token line, and "Approve this call". `deny` requires a reason before it resolves, and ends with "Deny with this reason". Approve mints a single-use token bound to the call digest, the agent, the run and an expiry, dispatches the call, writes the receipt on the run and settles any reservation. Deny dispatches nothing and releases any reservation, and its reason reaches the model. A second decision on the same approval is refused with who made the first. A resolved card shows its outcome, "Open receipt" where a receipt exists, and "Open run".
6. **One record.** Resolve an approval in the drawer, then open its run: the parked frame and the Evidence card show the same outcome, and the reverse. The countdown is the same clock everywhere.
7. **Countdowns and expiry.** The countdowns tick every second in the list and on the card, with warning ink under two minutes. At zero the approval expires: the call ends, "approval timeout" reaches the model, nothing dispatches, and the row moves to resolved.
8. **Work orders.** Every row names its run's work order. A row whose run has no work order yet names the direct work order Oxagen opened for it. Until the run records its work order, the build renders the line as not recorded, never a fixture id.
9. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows read the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named, and the drawer says once what a row cannot show yet. A fixture reaching production is a FAIL.
10. **Rollups.** The button's count, the header's "N waiting on you in all workspaces" and the eyebrow's "N waiting on you" equal the rows listed; "N resolved today" equals its rows. A count that includes an approval from a workspace the viewer cannot read is a FAIL.
11. **States.** The design has the loaded state only, with the list's own empty text. The build uses the shell's standard loading, error and denied treatment until they are designed, and a failed read never reads as "Nothing is waiting on you."
12. **Mobile.** At 390 × 844 with a touch pointer: the button is in the compact top bar with its count; the drawer is full width; rows keep title, lines, badges and countdown; the card's body columns and the four hops stack; `approve`, `deny` and `receipt` are bottom sheets with full-width buttons; hit areas are at least 44 px; nothing scrolls sideways.
13. **Accessibility.** The rows are buttons with names; the close button is labelled; state is never colour alone; the drawer works by keyboard end to end.
14. **Permissions.** Listing needs `list_approvals` in each workspace, and resolving needs `resolve_approval`, checked in the handler. Verify with a role that lacks it, and with the run's operator on a call a no-self-approval rule covers: both see the card and cannot resolve it.
15. **Rules.** Nothing on the card is a model's opinion, a score or an inference. The tier shown is the one the approval recorded. No heading or label carries a comma, a mid-dot, or a not/never contrast. Exactly one gold action per screen.
16. **Nothing extra.** List anything in the built drawer that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Approvals drawer audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | The button | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started, stop and report that as the single FAIL.
