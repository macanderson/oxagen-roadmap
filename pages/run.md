# Run

| | |
|---|---|
| Route | `#/a-intel/core-platform/runs/<run id>` |
| Scope | workspace |
| Spec | §14 Mission Control; Appendix F page 2 |
| Design | `mc.html` → `pRun(r)` (the single source; `consolidated.html` is the product build of it) |
| States | loaded · empty · loading · error · access denied |
| Files | `run-loaded.html` / `run-loaded-mobile.html`, `run-empty.html` / `run-empty-mobile.html`, `run-loading.html` / `run-loading-mobile.html`, `run-error.html` / `run-error-mobile.html`, `run-denied.html` / `run-denied-mobile.html` |
| Audit | `run.audit-prompt.md` |

## Job

A frame-by-frame player for one run: the transcript at three zoom levels under a transport, what the agent was told, each model exchange, tool calls with their validation results, policy decisions, proof, a cost strip and chain status. Every explanation is a chain of links to frames, records and commits.

## What is on the page

**Header** — eyebrow “Run”, h1 “<run id> (mono)”. Under the id: the agent card (compact layout: avatar, key, harness, runs, trust and spend scores), status dot + word (live / sealed / failed…), tier badge, replay badge, task chip (`task a-intel/platform#482`), and the task line with the start time. A generated **Summary · so far** panel is labelled “generated · not the record” and lists the linked repo, branch and files with a shown-once note.
Actions: **❙❙ Pause run** (opens the pause dialog; Resume when paused) · **Steer** · **Cancel** (danger) · **Export** (opens the run-export dialog)

- **Linked work graph** panels: Repositories · Issues and tasks · Pull requests and artifacts · Files changed (with `txDiffBlock` diffs) · The prompt · Timeline.
- **Tabs** (counts are live): Transcript (N) · Governed actions (N) · Proof · Cost ($) · Policy (N) · Context (N) · Chain and seal (live/sealed).
- **Transcript** — the row-for-row view the operator saw: prompt, prose, each tool call with the output it read, and what every model step cost. Filter chips: prompt · responses · thinking · tools · usage · recall · proof · errors; **expand thinking**. Transport: ⏮ ◀ ❙❙ ▶ ⏭ and speed 1× 2× 3× 6×. ⚖ chips open the gateway’s own frame (`allow rg_0088`, `approve rg_0093`); the transcript never replaces the frames. **Check it against the frames** jumps to the governed-actions view.
- **Governed actions** — the frames the gateway wrote: frame N · kind (`approval_request`, `control.steer`, `tool_requested`…), and the **Approvals** strip for this run with the four hops (Approval · Call · Rule · Approvers · Waited).
- **Proof** — Witness · Target · Disclosure grain · “Reaches this agent as”; the flip (failing on target sha, passing on PR sha), the oracle, the sealed-at time.
- **Cost** — Calls, concurrency and prefetch (Batches · Widest batch · Mean fan-out · Wall clock won; a Family/Calls/Share/Wall clock/Failed table), Run waterfall (Turn · Steps · Frames · Cache hit · Cost · Running total · Pinned; an SVG with evidence pins that open the evidence dialog), Spend by token class (Class · Tokens · Cost · Share), Prompt composition (Eligible · Hit rate · Wall clock saved · Billed · Effective input price · Cache write cost share · Proven spend · Productive ratio); **Duplicate tool calls** finding.
- **Policy** — “Every policy decision on this run”: Frame · Call · Outcome · Rules that fired · Taint · Latency.
- **Context** — the window as it was sent (block by block), `context.frames` (Kind · Frame · Tok · Score · Cited), Walk the window, Retrieval in numbers (Candidates scored · Admitted · Held back · Below the floor · Headroom left · Composition digest).
- **Chain and seal** — Hash chain (Frames · Rule · `telemetry_gap` frames), Seal and attestation, Replay grade (Grade · What was recorded · What it allows), Checkpoints; **Fork replay from frame N** (opens the fork-replay dialog), **Bisect** (dialog: run A vs run B; Stella only for re-run).

**Dialogs this page opens:** `pause`, `steer`, `forkreplay`, `bisect`, `runexport`, `evidence (a pinned finding)`, `approve / deny (from the approvals strip)`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Ontology · Steering · Spend; Organization nav: Organization · Billing · Audit; Assistant launcher; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, Assistant toggle, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/2026-09-12-mission-control-app-implementation-plan.md` §3; the *mockup collection* column names the constant in `mc.html` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Header, cost strip | `RUNS[id]`, `runMetrics` | `:Run`, `cost.run_totals` | `RunStore.getRunByPublicId`, `sumTokenUsageByExecutionStep` | 🟡 |
| Frames / transport | `FRAMES`, `TRANSCRIPTS` | `:Frame` + object bodies | `agent_run_events` via `readAttemptEventsSince`; `tacho_events` (ClickHouse) | 🟡 events ✅, digest chain ✅; model/tool frame kinds partial; bodies ❌ |
| Chain / seal | chain tab | `:Checkpoint`, `:Seal` | `agent_run_attempt_seals`; `tacho.checkpoints` | ✅ |
| Steer (delivery mode) | `steerSend` | `control.commands` `steer` | tacho `message` command | 🟡 no delivery mode |
| Linked work graph | `RUNGRAPH` | `FOR_TASK`, `OPENED_BY`, code graph | none | ❌ |
| Context window | `CTXW/CTXB/CTXF/CTXX` | `USED_CONTEXT` edges | `run-evidence` ContextFrame schemas, not persisted | ❌ (G10) |
| Proof / flip | `R.flip` | `:Witness`, `:Verdict` | none (M6) | ❌ (G7) |
| Name + summary | `R.summary` | `light` tier classifier | none | ❌ (G14) |
| File diffs | `RUNGRAPH.files`, `txDiffBlock` | tool I/O with file-tool classification | `tacho.session_files` | 🟡 |
| Fork / bisect / export | toast | Series A / M1 | none | ❌ |
| Approvals on this run | `APPROVALS` filtered by run | `control.approvals` | `agent.approval_requests` | ✅ / 🟡 chain |

## Functionality

- Three zoom levels (turns, steps, everything) and a transport with scrub, step, play/pause and ×1–×6.
- Every trust badge (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis; cost per turn comes from the run’s own per-turn ledger (`RUN_TURNS`), and the header total is the sum of it.
- Approvals on the run resolve through the same approve/deny dialogs as Fleet; the strip and the Fleet card read the same `S.ap` record.
- Evidence pins on the waterfall open the evidence dialog for the finding they cite; a pin never asserts more than the frame it points at.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “This run has no frames yet” — a run token was minted and the agent has not made its first model call; a run with no frames has cost nothing and is not billable. Action: **Back to Fleet**.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “This run could not be loaded” — `502 frame_store_unreachable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see this run” — the roles the signed-in person holds on the organization do not include `run.read on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · assistant · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Ontology, Steering, Organization, Billing, Audit, Assistant, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `run.read`
- Writes (each a governed action recorded in Audit): `run.command (pause/resume/cancel/steer)`, `approval.resolve`, `run.export`, `run.fork (Series A)`

## Backend gaps this page depends on

- G6 recorder + frame bodies
- G7 witness/verdict
- G9 steer delivery mode
- G10 USED_CONTEXT edges
- G14 run namer/summariser

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
