# Audit prompt: Runtimes

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Runtimes** page of Oxagen (`#/a-intel/core-platform/runtimes`), the list of hosts, for conformance to its design. One host is a separate page with its own prompt (`runtime.audit-prompt.md`). Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/runtimes.md`. Read it first, in full. `runtime.md` specifies one host, and `agent-runtime.md` the agent side of the same relation.
2. The design authority: `docs/fleet-operations-wedge.md` (Navigation, Unchanged, D17), `docs/fleet-operations-ia.md` (Workspace navigation, Runtimes and Repositories), `docs/mission-control-spec.md` §7.1, and ADR-095 and ADR-078 in `macanderson/oxagen`.
3. The design, rendered: the stories under `Oxagen / Runtimes / Runtimes` in Storybook (`npm run storybook`): Loaded, Empty, Loading, Error, Access denied, each also as a mobile story. Or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/runtimes`. The checker is `node tools/check-mockup.mjs`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/runtimes`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route. The sidebar reads Work, Agents, Tools, Steering, Runtimes, Spend, Repositories, with Runtimes lit, and its count is the number of runtimes whose health is not ok (absent at zero). The breadcrumb ends on Runtimes. No Fleet item anywhere.
2. **Header.** Eyebrow is the workspace name, h1 "Runtimes" with no subtext, and Enroll a runtime as the one gold action. Enroll a runtime opens Register agent at its first step.
3. **Stat strip.** Four tiles in order: Runtimes, Agents hosted, Highest tier, Health, each with the line the spec gives. Highest tier is a tier badge, not a bare word. Each caption states one fact. Each tile is a count over the rows: recompute all four. A Health tile that counts a not-enrolled host is a FAIL.
4. **Hosts.** The panel carries the runtime count, the list controls (search, filters, Rows, pager) and the columns Runtime · Kind · Harness · Model surface · Tier · Agents · Collector · Hooks · Health · Last checkpoint, in that order. The Harness cell shows the harness mark before the name. The Agents cell lists the agent keys, or says "No agent assigned" for an enrolled host. The Hooks cell reads "N of 5" and, below five, adds "Some calls are recorded without a decision", or "No hooks installed" at zero. A host that is not enrolled is not presented as enrolled. A row opens the host and is operable by keyboard.
5. **The tier is the host's.** The Hosts panel carries no note, and neither does the ladder; the explanation lives in the component help (`mockups/help/runtimes.md`). The tier ladder shows the four rungs in order, `observe`, `harness`, `gateway`, `contained`, each with the spec's line, and no rung is marked current. No claim on the page calls any tier but `contained` fully enforced.
6. **Nothing here enrolls a host.** No control on the page installs or writes a hook. Enroll a runtime leads to the flow whose Wrap step shows the command. The empty state's Show CLI steps shows the CLI steps and the command, not an agent registration form.
7. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named (`data-gap`: #3816, #3817, #3818, #3919). The record holds enrollments, not hosts: the build must say so and must not group enrollments by hostname into a host the record does not hold. Kind, the tier per host, the gap count, the hooks count and the last checkpoint render not recorded. A fixture reaching production is a FAIL.
8. **States.** Force each state and compare copy and controls with the design:
   - **empty** (`state=empty`): the header stays, then "No runtime is enrolled" with its two sentences, Enroll a runtime and Show CLI steps. Exactly one gold action on the screen.
   - **loading** (`state=loading`): the shell stays and the body, header included, is the skeleton. No data, no zeros, no stale rows.
   - **error** (`state=error`): "Runtimes could not be loaded", `503 collector_unreachable`, the three sentences, Try again, Open an incident and the trace line.
   - **access denied** (`state=denied`): "You cannot see the runtimes of this workspace", `runtime.read on core-platform`, Request access and Back to Work, then Signed in as, Needed and Decided by.
9. **Trust language.** A tier is the recorded value, computed per run from what was actually routed, and never upgraded after the fact. No tier is rendered as a score, a percentage or "fully governed". "Enforced" appears only for budgets on `gateway` traffic and for `contained`. A telemetry gap is described as a hole in the record, not a failed run. No verdict, proof or witness vocabulary anywhere.
10. **Plain nouns.** No heading or label carries a comma, a mid-dot or a not/never contrast. Subtext under the h1 is one sentence.
11. **One gold action.** Exactly one gold action is visible in every state: Enroll a runtime when loaded and when empty, Try again on error, Request access on denied.
12. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar reads Work, Agents, Tools, Spend, More, with More lit because Runtimes lives in its sheet, and the sheet lists Runtimes with its count. The tiles sit two to a row, the hosts table renders as labelled cards, touch targets are at least 44 px, inputs are 16 px, and nothing scrolls sideways.
13. **Accessibility.** A clickable row is reachable and operable by keyboard and names what it opens. The ladder is an ordered list with a label. State is never colour alone. Focus is visible.
14. **Permissions.** Read requires `runtime.read` (today `list_tacho_hosts`), checked server-side. `runtime.enroll` is gated server-side and lands in Audit.
15. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Runtimes audit {{DATE}}
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
