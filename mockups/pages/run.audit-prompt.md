# Audit prompt: Decision trace

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Decision trace** of Oxagen, the first tab of a run (`#/a-intel/core-platform/runs/<run id>`), for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/run.md`. Read it first, in full. It also owns the run header, the Summary, the stat row, the tab bar, the side column, the frame dialog and the run dialogs, which the other four run tabs share.
2. The design, rendered: the stories `Oxagen / Runs / Decision trace` (Loaded, Loaded · mobile, Loaded · future-only fields marked) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW`, adding `&future=1` to outline the future-only fields. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (D2, D4, D5, D6, D8, D14, D16, D17; the sections Frame types, Provenance, Exclusion reasons and Decision trace), `docs/fleet-operations-ia.md` (Run) and `docs/fleet-operations-routes.md` (Runs).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/runs/<run id>`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The bare run path opens the Decision trace. The old app addresses `?tab=context`, `policy`, `frames`, `player` and `approvals` answer 308 to the bare path. The sidebar lights Work. The breadcrumb reads the organization, the workspace, Work orders, the work order id, then the run id, and every crumb but the last is a link. The top bar has search, notifications, the Approvals button with the organization-wide count, and the avatar. No assistant button in the top bar.
2. **Header.** Eyebrow "Run", the run id as the h1 in mono. One row with the compact agent card (harness mark, key, harness, runs in 30 days and spend in 30 days, a link to the agent), the status dot and word, the tier badge as recorded, the work order chip linking to the work order (" · direct" on a direct one), and the task chip. The rig strip: harness and version, the model id in mono, the effort setting or "effort not captured", and a fit badge only where a reading was made. The checkout strip: repository, branch, one chip per pull request or "no pull request", and the checkout path as a copy button, with "derived" on any path or branch Oxagen worked out rather than recorded. Then "<title> · started <time>", with " · sealed <time>" once sealed.
3. **Actions.** By status, in this order and with these labels: live "❙❙ Pause run", "Steer", "Cancel", "Export"; pausing "❙❙ Pausing…" (disabled), "Steer", "Export"; paused "▶ Resume run", "Steer", "Cancel", "Export"; resuming "▶ Resuming…" (disabled), "Export"; sealed or halted "Export". No action in the header is gold. There is no Fork replay, no Bisect and no replay control anywhere on the page. While pausing or paused, the pause banner shows with its line of what is held and "Open the pause frame".
4. **Summary and stat row.** The Summary is first in the main column: eyebrow "Summary", the badge "generated · not the record", the agent and the operator, the prose, the generated-by line, and "Check it against the frames", which opens frame 0. Then six boxes in this order: Tokens, Prompts, Cost, Wasted, Wall clock, Cache hit, each with the one line the spec gives. No other tile.
5. **Tab bar.** Five tabs in this order: Decision trace (a dot while a call is parked), Transcript (entry count), Cost (the cost), Memories (the count of memories the run wrote, blank when none), Evidence ("live" or "sealed"). `role=tablist` with `aria-selected`. Each tab is a path segment, and reloading keeps the tab.
6. **Intro.** "Read from the record." with the frame count, the manifest count, the send of the work order when it was dispatched, and the tier sentence: on `gateway` and `contained`, "calls routed through Oxagen were checked and recorded"; on `observe`, "recorded, not enforced." The line "Oxagen has no access to the model’s hidden reasoning. Thinking a provider returns is in the Transcript, labelled as the provider’s text." is present, verbatim.
7. **Section 1, Envelope.** The sentence "<N> SteeringFrames reached this run, grouped by where they entered. Select a type to filter." Two meters, "Session-start prefix" and "Volatile selection", each "<used> of <cap> tok" with its caption. The type strip lists only the types present, in type order, each with its count and `aria-pressed`; pressing one filters the Envelope and the Exclusions and adds "Show every type". The injection points appear in the order Session start, Prompt, Prompt submit, Model request, Checkout files, Tool list, each with its caption and "<N> frames · <N> tok", and a point with no frame is absent. Each point is a table Type · Frame · Source · Force · Tokens. A gate-backed frame carries "enforced by <gate>"; a capability frame does not. The Source cell names the source kind, the source id as a link, and the version with the frame hash. Rows sort by type, then force, then id. A point shows 4 rows and "Show all N". A work order's send appears in Prompt (the `invocation`, the `goal`, and one `constraint` per definition-of-done item, the repositories and the cap), and an operator's steer appears in Model request as an `invocation`. A harness's own tools are not frames.
8. **Section 2, Exclusions.** "<N> resolved and not delivered. The same sources, run and budget give the same exclusions." One table Type · Frame · Source · Reason · Tokens, with the injection point under each body. Every reason comes from the closed vocabulary of the wedge spec (13 words), in mono, with the numbers that decided it under it. A withheld skill reads "Withheld before ranking. The agent is told the count and the reason, never the name." The table shows 6 rows and "Show all N". With nothing excluded: "Nothing was excluded." Resolve the same run twice and compare: the exclusions must be identical.
9. **Section 3, Choices.** The sentence names the number of tools the belt offered, which equals the capability frames in Tool list. One table At · Call · Answer · Decided by · Frame. Answers are exactly "allowed", "routed to a person" and "denied", as a dot and a word, with "failed" beside a call that failed and the approval id with "waiting" under a routed call. A harness's own tool carries "harness tool". `TodoWrite` calls are not rows. Each "frame N" opens the frame dialog on that frame. The Skills block lists the config version and each skill as synced, withheld (with its reason and the count-and-reason sentence) or loaded.
10. **Section 4, Frames.** "<N> recorded, <N> in view. Each opens the frame it names." The Timeline shows the frame counts, a legend by class, turn bands, the steer and parked marks, and ticks; every tick opens that frame in the frame dialog and shows it on hover. The foot line does not name a player. "Open the transcript" opens the Transcript tab.
11. **Sections 5 and 6.** Plan changes appear only when the harness recorded a plan, one block per version with its time and a badge on each changed item ("added", "now completed", "now in progress"). Self-reported uncertainty appears only when the agent reported it in a structured field, quoted verbatim with the tool, the time and the report id. A run with neither shows exactly "The harness recorded no plan, and the agent reported no uncertainty." Find a run whose agent wrote a doubt in prose only and confirm nothing appears.
12. **Section 7, Evidence.** "What supports the outcome so far." Rows Outputs, Definition of done, Approvals and Record, with the fallbacks "none recorded", "none: a direct work order" and "none waiting". "Open Evidence" opens the Evidence tab.
13. **Side column.** An `aside` labelled "The work" with two panels. Changes: Pull request, Base, Checks, Release when one exists, Diff, the changed files and "Open the diff in the transcript". Outputs: the tally, "Hide reads", one node per output in frame order with its state badge and an "fr N" chip that opens that frame, a read as a tick rather than a card, the gate with "Review the approval", the dashed withheld node, and "In frame order."
14. **Frame dialog.** It replaces the player. Title "Frame N · <kind>", the run id and time, the frame's summary, the panel for its kind, and a footer with "frame i of N shown · <N> in the run", "Previous", "Next" and "Close". There is no play button, no speed and no scrubber. A parked `approval_request` shows "Approve" and "Deny", which open the same dialogs as the Approvals drawer and resolve the same record. "Close" is the dialog's one gold action.
15. **Run dialogs.** `pause`, `steer`, `cancelrun` and `runexport` open from the header with the titles, facts and buttons the spec lists. The export dialog shows no replay grade. Each write is a governed action: it passes IAM, writes an audit event and shows a receipt or reference.
16. **Honesty.** Search the build for any place the trace adds an inference, a score, a confidence estimate or a model-written account of why. Returned thinking never appears in the trace. No copy says a call was enforced on an `observe` run. The Summary is labelled generated and does not appear inside the trace. No person is scored or ranked.
17. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named. A fixture reaching production is a FAIL.
18. **Future-only fields.** Every field in the spec's future-only table renders as not recorded, or is absent, in the build until its contract ships: the work order chip, the Envelope's frame types and hashes, exclusion reasons past `tier`, `budget` and `superseded`, the Skills block, Plan changes, Self-reported uncertainty and the definition of done. A future-only field drawn with fixture values is a FAIL.
19. **Rollups.** A point's tally equals the sum of its rows. The session-start meter equals the compile header plus the Session start rows; the volatile meter equals the Prompt submit rows. The type strip counts equal the Envelope's frames by type. The Exclusions count equals its rows. The Choices count of tools equals the Tool list rows. The Transcript and Cost tab counts equal what those tabs show.
20. **States.** The design has the loaded state only. The build uses the shell's standard loading, error, empty and denied panels; each replaces the page body, never the shell, and loading never flashes zeros.
21. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with Work lit; More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The two columns stack, main first; the stat boxes wrap; the tab bar scrolls with snap; every table is a stack of labelled cards; the frame dialog is a bottom sheet; nothing scrolls sideways; touch targets are at least 44 px.
22. **Accessibility.** Tabs use `role=tab` and `aria-selected`; the type buttons use `aria-pressed`; dialogs are `role=dialog aria-modal` with a labelled close; timeline ticks have an accessible name; state is never colour alone; focus is visible; the page works by keyboard end to end.
23. **Permissions.** Reading requires the run read (the denied state names `run.read on core-platform`), checked server-side. `dispatch_command`, `resolve_approval` and `export_run` are gated server-side, not only hidden. Verify with a role that lacks each.
24. **Rules.** A frame and a SteeringFrame never share a name on screen. A frame row never renders as its source. No heading or label carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. The badge "generated · not the record" is the one conflict the spec names as open: record it as a note, not a fail. Exactly one gold action per screen.
25. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Decision trace audit {{DATE}}
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
