# Audit prompt — Run

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Run** page of Oxagen Mission Control (`#/a-intel/core-platform/runs/<run id>`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/run.md` (read it first, in full).
2. The design, rendered: `pages/run-<state>.html` and `pages/run-<state>-mobile.html` for each state (loaded, empty, loading, error, access denied); open them in a browser or with Playwright. `pages/index.html` links all of them.
3. The product spec for context: `docs/2026-09-11-oxagen-mission-control-spec.md` §14 (Mission Control), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/2026-09-12-mission-control-app-implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/runs/<run id>`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar, breadcrumbs, ⌘K search, notifications, assistant and account are present and match the spec’s shell; the breadcrumb ends on this page. The document title names the page.
2. **Header.** Eyebrow “Run”, h1 “<run id> (mono)”. Actions present, in order, with the same labels: ❙❙ Pause run · Steer · Cancel · Export. Exactly one gold (primary) action on the screen.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Sections, tabs and tables.** For each item below, the build has it, with the same tab labels (and live counts where the design shows them), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Linked work graph panels: Repositories · Issues and tasks · Pull requests and artifacts · Files changed (with `txDiffBlock` diffs) · The prompt · Timeline.
   - Tabs (counts are live): Transcript (N) · Governed actions (N) · Proof · Cost ($) · Policy (N) · Context (N) · Chain and seal (live/sealed).
   - Transcript — the row-for-row view the operator saw: prompt, prose, each tool call with the output it read, and what every model step cost. Filter chips: prompt · responses · thinking · tools · usage · recall · proof · errors; expand thinking. Transport: ⏮ ◀ ❙❙ ▶ ⏭ and speed 1× 2× 3× 6×. ⚖ chips open the gateway’s own frame (`allow rg_0088`, `approve rg_0093`); the transcript never replaces the frames. Check it against the frames jumps to the governed-actions view.
   - Governed actions — the frames the gateway wrote: frame N · kind (`approval_request`, `control.steer`, `tool_requested`…), and the Approvals strip for this run with the four hops (Approval · Call · Rule · Approvers · Waited).
   - Proof — Witness · Target · Disclosure grain · “Reaches this agent as”; the flip (failing on target sha, passing on PR sha), the oracle, the sealed-at time.
   - Cost — Calls, concurrency and prefetch (Batches · Widest batch · Mean fan-out · Wall clock won; a Family/Calls/Share/Wall clock/Failed table), Run waterfall (Turn · Steps · Frames · Cache hit · Cost · Running total · Pinned; an SVG with evidence pins that open the evidence dialog), Spend by token class (Class · Tokens · Cost · Share), Prompt composition (Eligible · Hit rate · Wall clock saved · Billed · Effective input price · Cache write cost share · Proven spend · Productive ratio); Duplicate tool calls finding.
   - Policy — “Every policy decision on this run”: Frame · Call · Outcome · Rules that fired · Taint · Latency.
   - Context — the window as it was sent (block by block), `context.frames` (Kind · Frame · Tok · Score · Cited), Walk the window, Retrieval in numbers (Candidates scored · Admitted · Held back · Below the floor · Headroom left · Composition digest).
   - Chain and seal — Hash chain (Frames · Rule · `telemetry_gap` frames), Seal and attestation, Replay grade (Grade · What was recorded · What it allows), Checkpoints; Fork replay from frame N (opens the fork-replay dialog), Bisect (dialog: run A vs run B; Stella only for re-run).
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`pause`, `steer`, `forkreplay`, `bisect`, `runexport`, `evidence (a pinned finding)`, `approve / deny (from the approvals strip)`), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`run-empty.html`): “This run has no frames yet” — a run token was minted and the agent has not made its first model call; a run with no frames has cost nothing and is not billable. Action: Back to Fleet.
   - **loading** (`run-loading.html`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`run-error.html`): “This run could not be loaded” — `502 frame_store_unreachable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: Try again, Open an incident; a trace id, region and timestamp line.
   - **access denied** (`run-denied.html`): “You cannot see this run” — the roles the signed-in person holds on the organization do not include `run.read on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: Request access (opens the request-access dialog), Back to Fleet. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · den
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
8. **Trust language.** Every tier, replay grade, attestation and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows (e.g. “gateway” for a client-attested window). Money always carries its basis.
9. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; More opens a bottom sheet; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px. Compare against `pages/run-loaded-mobile.html`.
10. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; icon buttons have `aria-label`; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end.
11. **Permissions.** Read requires `run.read`; each write (run.command (pause/resume/cancel/steer); approval.resolve; run.export; run.fork (Series A)) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
12. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Run — audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong> — <where> — <what the design shows> — <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected NotBacked, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption — open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
