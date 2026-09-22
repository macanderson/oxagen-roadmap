# Audit prompt: Runtimes

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Runtimes** page in Oxagen (`#/a-intel/core-platform/runtimes`, and one host at `#/a-intel/core-platform/runtimes/mbell-mbp-16`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/runtimes.md` (read it first, in full). `agents.md` and `agent.md` specify the agent side of the same relation.
2. The design, rendered: the `runtimes` and `runtime` stories in Storybook (`npm run storybook`), one per state, desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>`. The checker is `node tools/check-mockup.mjs`.
3. The decisions this page renders: the steering and gateway plan, Phases 0 and 4 (the hook seam and the tier ladder); the product spec §14.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves both routes. Runtimes is lit in the sidebar, between Steering and Repositories, and its count is the number of degraded hosts. The workspace nav reads Fleet, Agents, Tools, Steering, Runtimes, Repositories, Spend. The breadcrumb ends on Runtimes, or on the host name at the detail route.
2. **Header.** Eyebrow is the workspace name, h1 “Runtimes”, subtext is the one sentence in the spec, and **Enroll a runtime** is the one gold action.
3. **Stat strip.** Four tiles: Runtimes, Agents hosted, Highest tier earned, Degraded, each with the basis line the spec gives. Highest tier earned is a tier badge, not a word on its own.
4. **Enrolled hosts.** The panel is badged with the runtime count and a row opens the host. Columns: Runtime, Kind, Harness, Model surface, Tier, Agents, Collector, Hooks, Health, Last checkpoint, in that order. The Agents cell lists the agent keys, or reads “enrolled, nothing assigned”. The Hooks cell reads “N of 5” and adds “some calls are recorded, not decided” below five.
5. **The tier is the seam's.** The panel note is verbatim, and it says two agents on one host earn the same tier. The tier ladder panel shows all four rungs with `tierLadder`, and its note says only `contained` earns the word enforced.
6. **Runtime detail.** The back button reads “← All runtimes”. The host panel's key-value list carries Workspace, Owner, Harness, Collector, Hook binary, Hooks written, Model surface, Settings, Tier earned, Last checkpoint, and Note where the host has one, in that order. **Agents on this host** has columns Agent, Operator, Tier, Principal, Runs 30d, a row opens the agent, and the panel note is verbatim. **Rollback** shows the unenroll command, the `hooks_removed` note, **Run a smoke session**, and **Unenroll** (danger).
7. **A host with no agent.** The detail page reads “This host is enrolled and no agent is assigned to it. It records nothing until one runs here.”
8. **Nothing here enrolls a host.** Enroll a runtime opens the wrap dialog and shows the command. No control on this page installs or writes a hook. A stub says what the product would do.
9. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named store; 🟡 rows are wired for the fields that exist and render `NotBacked` for the rest; ❌ rows render `NotBacked` with the milestone named. A fixture reaching production is a FAIL. The host row and the hook readback are ❌ today, so check the build says so rather than showing a number.
10. **States.** Force each state and compare copy and controls with the design: **empty** reads “No runtime is enrolled” with the two sentences, **Enroll a runtime**, and **Show the CLI path**; **loading** keeps the shell and shows the skeleton; **error** is `503 collector_unreachable` with Try again, Open an incident, and the trace line; **access denied** names `runtime.read on core-platform` with Request access, Back to Fleet, Signed in as, Needed, and Decided by. The detail route has no empty state.
11. **Trust language.** A tier is the recorded value and nothing stronger, computed per run from what was actually routed, and never upgraded after the fact. A telemetry gap is described as a hole in the record, not a failed run. No verdict, proof, or witness vocabulary anywhere.
12. **Plain nouns.** No heading carries a comma, a mid-dot, or a not/never contrast; subtext under the h1 is one sentence.
13. **Mobile.** At 390 × 844 with a touch pointer: both tables render as labelled cards, the page never scrolls sideways, tap targets are ≥ 44 px, inputs are 16 px, Runtimes is in the More bottom sheet and More is the lit thumb-bar slot, and every dialog is a bottom sheet.
14. **Accessibility.** A clickable row is reachable and operable by keyboard; state is never colour alone; focus is visible; the danger action is labelled by its own text, not by colour.
15. **Permissions.** Read requires `runtime.read`, checked server-side. `runtime.enroll` and `runtime.unenroll` are gated server-side and land in Audit. Running a smoke session requires `agent.run`.
16. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Runtimes: audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
