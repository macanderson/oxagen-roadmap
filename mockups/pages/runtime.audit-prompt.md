# Audit prompt: Runtime

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Runtime** page of Oxagen, one host (`#/a-intel/core-platform/runtimes/mbell-mbp-16`), for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/runtime.md`. Read it first, in full. The list it belongs to is `mockups/pages/runtimes.md`.
2. The design authority: `docs/fleet-operations-wedge.md` (Unchanged, D17), `docs/fleet-operations-ia.md` (Runtimes and Repositories), `docs/mission-control-spec.md` §7.1, and ADR-095 in `macanderson/oxagen`.
3. The design, rendered: the stories under `Oxagen / Runtimes / Runtime` in Storybook (`npm run storybook`): Loaded, Loading, Error, Access denied, each also as a mobile story. Or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/runtimes/mbell-mbp-16`. The checker is `node tools/check-mockup.mjs`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/runtimes/<runtime>`, where the build's segment is an enrollment id (`tch_…`).

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves one host's route with Runtimes lit, and the breadcrumb ends on the host's name. An id the list does not hold is a 404, not the list and not a crumb naming the id.
2. **Header and back.** The page header is the list's, with Enroll a runtime as the one gold action. ← All runtimes returns to the list.
3. **Host panel.** The host's name as the title, the caption with its kind, operating system and what starts the collector, and the health badge in the panel header. The key-value list in order: Workspace, Owner, Harness, Collector, Hook binary, Hooks written, Model surface, Settings, Tier earned, Last checkpoint, and Note only where the host has one. The Hooks written and Model surface lines match the count and the tier as the spec gives them.
4. **Agents on this host.** The count badge, the list controls, and the columns Agent · Operator · Tier · Principal · Runs 30d in order. The Agent cell is the agent card. The Operator cell names the person, not a key. A row opens the agent and is operable by keyboard. The note is verbatim. A host with no agent reads the spec's sentence.
5. **One seam, one tier.** Every agent row's tier agrees with the host's tier and with the note. An agent on a host at a different tier than the host shows is a FAIL, whichever of the two the build got wrong.
6. **A host that is not enrolled.** Open a not-enrolled host. Nothing on the page calls it enrolled, prints a hook binary version, or says "chain intact" without a checkpoint.
7. **Rollback.** The panel shows the unenroll command, and the command matches the shipped CLI (`oxagen agent unenroll`, with `--host` taking an enrollment id and no `--restore-settings`). The `hooks_removed` note is verbatim. Run a smoke session either starts a recorded session or says it is a stub and what it would do (#3819). Unenroll is danger and opens the dialog.
8. **Unenroll.** The dialog carries the note and the warning verbatim, Keep it enrolled and Unenroll it. Unenroll revokes the enrollment through `revoke_tacho_enrollment`, lands in Audit, and the page shows the host as not enrolled afterwards. It passes IAM and a refusal changes nothing.
9. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named (`data-gap`: #3816, #3817, #3818, #3819, #3919). The kind, the gap count, the hooks list, the tier per host, the last checkpoint and the note render not recorded. A fixture reaching production is a FAIL.
10. **States.** Force each state and compare copy and controls with the design. The page has no empty state.
    - **loading** (`state=loading`): the shell stays and the body, header included, is the skeleton. No data, no zeros.
    - **error** (`state=error`): "Runtimes could not be loaded", `503 collector_unreachable`, Try again, Open an incident and the trace line.
    - **access denied** (`state=denied`): "You cannot see the runtimes of this workspace", `runtime.read on core-platform`, Request access and Back to Work, then Signed in as, Needed and Decided by.
11. **Trust language.** A tier is the recorded value, computed per run from what was actually routed, and never upgraded after the fact. "Enforced" appears only for budgets on `gateway` traffic and for `contained`. A telemetry gap is a hole in the record, not a failed run.
12. **Plain nouns.** No heading or label carries a comma, a mid-dot or a not/never contrast. Subtext under a heading is one sentence.
13. **One gold action.** Exactly one gold action is visible: Enroll a runtime. The unenroll dialog has none, and Unenroll it reads as danger.
14. **Mobile.** At 390 × 844 with a touch pointer: the current crumb is the host name, More is the lit thumb-bar slot, the key-value list stacks, the agents table renders as labelled cards, the command scrolls inside its block, the dialog is a bottom sheet with full-width buttons, touch targets are at least 44 px, inputs are 16 px, and nothing scrolls sideways.
15. **Accessibility.** Rows are reachable and operable by keyboard and name what they open. The dialog is `role=dialog aria-modal` with a labelled close. Health reads as a dot and a word. The danger action is labelled by its text, not by colour.
16. **Permissions.** Read requires `runtime.read`, checked server-side. `runtime.unenroll` is gated server-side (today `revoke_tacho_enrollment`, an org Owner or Admin) and lands in Audit. A smoke session requires `agent.run`.
17. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Runtime audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
