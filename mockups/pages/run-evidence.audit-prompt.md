# Audit prompt: Run evidence

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Evidence** tab of a run in Oxagen (`#/a-intel/core-platform/runs/<run id>/evidence`) for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/run-evidence.md`, and `mockups/pages/run.md` for the header, Summary, stat row, tab bar, side column and frame dialog this tab shares. Read both first, in full. The approval card this tab expands is specified in `mockups/pages/approvals-drawer.md`.
2. The design, rendered: the stories `Oxagen / Runs / Evidence` (Loaded, Loaded · mobile, Loaded · future-only fields marked) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/evidence`, adding `&future=1` to outline the future-only fields. A sealed run to compare: `#/a-intel/core-platform/runs/run_01K5RG6H1L4OIU9Y/evidence`. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (D2, D14, D17; the Decision trace section 7), `docs/fleet-operations-routes.md` (Runs) and `docs/tasks-spec.md` §8 and §11.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/runs/<run id>/evidence`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route.** `/runs/<run>/evidence` opens this tab with Evidence selected. The old app addresses `?tab=issues`, `chain`, `proof`, `dod` and `ladder` answer 308 to the segment, and `?reads=` and `?spine=` keep their names on it. Reloading keeps the tab.
2. **Shared parts.** The header, Summary, stat row, tab bar and side column match `run.md` (run its checks 2 to 5 and 13 here, or cite that audit). The Outputs spine is in the side column.
3. **Order.** The panels appear in this order, each only when it has something to show: the Compacted note, Definition of done, Approvals, Issues, Linked work with Files changed, then Hash chain, Seal and attestation and Checkpoints.
4. **Definition of done.** The heading, the sentence "From <work order>. A claim is the agent’s word. An acceptance is a person’s." with the work order linked, and the table Item · State · Evidence with the states "accepted", "claimed" and "open" as a dot and a word. A claim never renders as accepted. Absent on a direct work order. Until work orders ship, the build renders the panel as not recorded or leaves it out; drawing fixture items is a FAIL.
5. **Approvals.** One card per approval on the run, pending or resolved, with the glyph, the amount or tool, the agent and run title, the ticking countdown (warning ink under two minutes) or a dash, the badges, "To <counterparty>", "Times out in <timeout>, then the call ends", and "Approve", "Deny" and "Details". "Details" expands the full approval card in place. "Approve" and "Deny" open the same dialogs as the Approvals drawer; a decision made here shows in the drawer and on the frame, and the reverse. A resolved card shows its outcome and who resolved it.
6. **Issues.** The heading with "<N> in this session", the Status filter, Rows and the pager, and the table Issue · Status · Relation · Edge · link. Each edge reads "stated", "observed" or "inferred · <N>%", with a chip per cited frame that opens it. Each "View ↗" opens the tracker's page. The empty text and the note under the table, verbatim. The issues table appears once on the page.
7. **Linked work.** The eyebrow, the legend with the inferred count against the total, the Repositories and Pull requests and artifacts panels with their counts, edge chips and forge links, their empty texts, and Files changed with the stat, "as the harness reported them" and one row per file that opens its diff. An inferred item never stands beside a record it contradicts.
8. **Chain and seal.** Hash chain with its badge, Frames, Rule, `telemetry_gap` frames, Checkpoints and Completeness gaps, and the attestation note. Seal and attestation: the live sentence on a live run; on a sealed run, Merkle root, Over, Archive segment, Signature, Signs over, Enforcement tier and "Export the bundle". Checkpoints with its table or its empty sentence. The gap badge reads the chain: force a run with a missing sequence and confirm the badge changes. The note names no witness.
9. **What is gone.** No replay grade, no replay ladder, no Fork replay and no Bisect anywhere on the tab or in the export dialog.
10. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows read the named contract. ❌ rows render not recorded with the gap named. A fixture reaching production is a FAIL.
11. **Future-only fields.** The work order chip and the Definition of done panel render as not recorded, or are absent, until their contracts ship. The approval card's amount, risk, side effect, taint, counterparty and tier render as not recorded until `list_approvals` returns them.
12. **Rollups.** "<N> in this session" equals the issue rows. Each Linked work count equals its rows. The inferred count equals the inferred rows. The Checkpoints count equals its rows. The Files changed stat equals the sum of the file rows and the Changes panel's Diff.
13. **States.** The design has the loaded state only. The build uses the shell's standard loading, error, empty and denied panels; each replaces the page body, never the shell, and loading never flashes zeros.
14. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar with Work lit; the panels stack; the tables become labelled cards; `approve` and `deny` rise as bottom sheets with full-width buttons; hit areas are at least 44 px; nothing scrolls sideways.
15. **Accessibility.** "Details" carries `aria-expanded`; the tables have headers; state is never colour alone; dialogs are `role=dialog aria-modal` with a labelled close; the tab works by keyboard end to end.
16. **Permissions.** Reading requires the run reads the spec lists, checked server-side. `resolve_approval` is gated server-side, not only hidden, and a person the rules exclude (the run's operator under a no-self-approval rule) cannot resolve. Verify with a role that lacks it.
17. **Rules.** A frame and a SteeringFrame never share a name on screen. No score and no model-written account of why. Every enforcement claim states the tier. No heading or label carries a comma, a mid-dot, or a not/never contrast. Exactly one gold action per screen.
18. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Run evidence audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
