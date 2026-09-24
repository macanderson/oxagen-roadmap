# Audit prompt: Run

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Run** page of Oxagen (`#/a-intel/core-platform/runs/<run id>`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/run.md` (read it first, in full).
2. The design, rendered: the `run` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. The checker is `node tools/check-mockup.mjs`.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), §12.6 (token classes), §12.7 (attribution), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/runs/<run id>`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar (Workspace: Fleet, Agents, Tools, Steering, Runtimes, Repositories, Spend; Organization: Organization, Billing, Audit; the assistant launcher at the foot), breadcrumbs (… / Fleet / <run id>), ⌘K search, notifications, the approvals button, and account are present and match the spec’s shell. No assistant button in the top bar. The document title names the page.
2. **Header.** Eyebrow “Run”, h1 the run id in mono. Under it: the compact agent card, status dot and word, tier badge, replay badge, task chip, and “<task title> · started <time>”; then the rig strip and the checkout strip, both above the tab bar (checks 11 and 12). Actions by status, in order and with the same labels: live ❙❙ Pause run · Steer · Cancel · Export; paused ▶ Resume run · Steer · Cancel · Export; sealed Fork replay · Bisect · Export. Never more than one gold action visible at once. No verdict badge, no done badge, no score on the agent card.
3. **Summary and stat row.** The Summary section comes before everything else in the main column: eyebrow “Summary”, the badge “generated · not the record”, who was involved, the prose, the generated-by line, and Check it against the frames. There is no first-prompt panel; the prompt is the first row of the transcript. Then six stat boxes in this order: Tokens · Prompts · Cost · Wasted · Wall clock · Cache hit, each with the one-line caption the spec gives. No other tiles.
4. **Sections, tabs, and tables.** For each item below, the build has it, with the same tab labels (and live counts), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Tabs: Transcript (N) · Governed actions (N) · Cost ($) · Policy (N) · Context (N) · Chain and seal (live/sealed). Transcript is the default and is open above the fold. No Proof tab, no Done tab.
   - Transcript: kind chips prompt · responses · thinking · tools · usage · recall · seal with counts, all/none, ✗ errors; expand thinking; the search field; transport ⏮ ◀ ❙❙ pause ▶ ⏭ and 1× 2× 3× 6×; the position; the header line; ⚖ chips that open Oxagen’s own frame; the note under the feed. A compacted run shows the Archive segment panel with Render from the segment and Verify offline.
   - Governed actions: the Timeline at the top (frames shown, legend, turn bands, steer and parked marks), the frame player, “Frame N · <kind>” with Previous and Next, the Timeline list; no Approvals panel, and a parked approval frame's detail carries the call's card with Approve and Deny.
   - Cost: the instruments strip at the top (Cost so far · Wall clock · Tokens · Shape of the run · Tool calls · Productive ratio), then Tool calls (Family · Calls · Share · Wall clock · Failed; Batches · Widest batch · Mean fan-out · Wall clock won; Eligible · Hit rate · Wall clock saved · Billed), Waterfall (Turn · Steps · Frames · Cache hit · Cost · Running total · Pinned), Spend by token class (Class · Tokens · Cost · Share over input_uncached, cache_read, cache_write_5m, output, reasoning), Prompt composition (Conversation, Context frames, Tool definitions, Steering, System; Effective input price · Cache write cost share · Basis · Productive ratio). No proven spend, no productive ratio labelled proven.
   - Policy: “Policy decisions”: Frame · Call · Outcome · Rules that fired · Taint · Latency.
   - Context: the Prompt panel at the top (tok written and sent, Open the window, Written by, First request bars), then the `steering.manifest` spine (tally “N rendered · N cut · N tok”, Open in Preview, each row with the Library's kind badge and its force, cuts dashed with a reason, “Assembled, not delivered.” on an observe run), then Prompt window block by block, the detail panel, `context.frames` (Kind · Frame · Tok · Score · Cited), Walk the window, Retrieval stats (Candidates scored · Admitted · Held back · Below the floor · Headroom left · Composition digest).
   - Chain and seal: Hash chain, Seal and attestation, Replay grade (Grade · What was recorded · What it allows), Checkpoints (Frame · Chain head · Covers · Signature); Fork replay from frame N, Bisect against another run, Export the bundle.
   - Side column, in order: Changes (Pull request · Base · Checks · Release when present · Diff, then the changed files and Open the diff in the transcript; one panel, not three; it does not repeat the repository or the branch, which the header strip carries) · Outputs (tally, Hide reads, nodes in frame order, a read as a tick not a card, the gate with Review the approval, the dashed withheld node, “In frame order.”). Two panels; Spend by area is on the Cost tab.
   - Transcript rows: every tool call leads with the tool's short name (Read, Bash, github__create_pull_request) and its arguments on the first line (Read shows the file paths); the raw JSON and the frame link fold under it; no row is titled `llm_call` or `model.response`.
   - Issues tab: Issue · Status · Relation · Edge · View ↗, every issue the session touched with a working link to its tracker page; the note that a session can touch more than one issue. Below it, Linked work: Repositories, Pull requests and artifacts, and Files changed, every reference a link to the forge, each row with its edge chip. The issues table appears once; a second copy inside Linked work is a FAIL.
   - Governed actions tab: the timeline, the frame player and the frame list; no approvals panel (approvals live in the drawer).
   - Cost tab: Model fit first (check 11), then the instruments strip, Spend by area (seven areas, the dearest tools, the note), calls, waterfall, token classes and prompt composition.
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`pause`, `steer`, `forkreplay`, `bisect`, `runexport`, `evidence`, `approve` / `deny` from a parked approval frame, `request-access` from denied, `incident` from error), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Approvals button and drawer.** The topbar button is left of the avatar with aria-label “Approvals, N waiting”; it opens `#apdrawer`; Escape closes it; a row selected shows the full card with Approve and Deny; the same request resolved from the drawer and from this page’s parked approval frame reads one record.
7. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the gap named. A fixture reaching production is a FAIL.
8. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): “This run has no frames yet”; a run token was minted and the agent has not made its first model call; a run with no frames has cost nothing and is not billable. Action: Back to Fleet.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “This run could not be loaded”; `502 frame_store_unreachable`; nothing was changed; runs kept recording; frames are written by the collector on each host. Actions: Try again, Open an incident; a trace id, region, and timestamp line.
   - **access denied** (`state=denied`): “You cannot see this run”; the missing permission `run.read on core-platform`; an owner can grant it and the grant is a governed action. Actions: Request access, Back to Fleet. Below: Signed in as, Needed, Decided by (`pol_v41` · deny wins over every allow).
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
9. **Trust language.** Every tier, replay grade, attestation, and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows (`observe`, `harness`, `gateway`, and `contained` are each shown only where recorded; a `client_attested` basis is labelled as such; nothing says proven, verdict, held, or witness). Money always carries its basis. The Summary panel is labelled generated.
10. **Token figures.** The Tokens box equals the total row of Spend by token class; “N in, N out” equals the sum of the input classes and the output classes; the Tokens instrument shows the same total; the Prompt panel’s “tok sent” equals the Prompt window total; the manifest tally equals the `steering.compiled` block. The Prompts box, the Wasted caption, and the first-prompt badge agree on the corrective count. A constant or a typed figure is a FAIL.
11. **Model and effort.** The rig strip sits above the tab bar and prints the harness label with its version, the model id in mono, and the effort setting. Effort renders a value only where Oxagen read it out of the request body, which is the gateway and contained tiers. On an `observe` or `harness` run the chip must read “not captured” and the Model fit card must name the reason; a value rendered on those tiers is a FAIL, and so is a value that matches no frame. A gateway run whose agent sent no setting reads “not captured” with its own reason, never the model's default printed as a fact.
    The Model fit panel is first on the Cost tab, carries the badge “generated · not the record”, and holds one card for the model and one for effort. A card reading over or under states what it read, and its only action opens a pull request against `.oxagen/agents/<slug>.toml`; a card that writes the model on the run record instead is a FAIL, because a sealed run keeps the model it ran on. Check that the reading is keyed on prompts, failed tool calls, turns, and steps; a reading keyed on reasoning share is a FAIL, because reasoning is a fixed fraction of output per model family and so describes the model, not the run. Force all four directions (model over, model under, effort over, effort under) and confirm each renders its badge in the header.

12. **The checkout.** The second header strip prints the repository, the branch, every pull request the run pushed to, and `<machine>:<path>`. The repository and each pull request link to the forge; a branch that is a pull request head links to the pull request, never to `/tree/refs/pull/...`. The path is a copy button and copying reports what was copied; a browser that refuses clipboard permission must not throw. A path Oxagen holds as an enrolled checkout on that host is stated; one worked out from the repository name is marked `derived` and its tooltip says so. A derived path presented as a record is a FAIL, and so is a path borrowed from a checkout on a different host. The strip, the Changes panel, and Linked work must name the same pull request; any disagreement between them is a FAIL.

13. **Headings.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence.
14. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; the two columns stack with the main column first; the six stat boxes wrap; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px.
15. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; the side column is an `aside` with `aria-label`; icon buttons and transport buttons have labels or titles; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end.
16. **Permissions.** Read requires `run.read`; each write (run.command (pause/resume/cancel/steer); approval.resolve; run.export; run.fork (Series A)) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
17. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Run audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected NotBacked, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption; open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
