# Findings

| | |
|---|---|
| Route | `#/a-intel/core-platform/work/findings` (app `/{org}/{ws}/work/findings`). A finding’s evidence opens as a dialog: `?finding=<id>`, for example `?finding=fnd_01K5RHD7B`. Old routes that land here: the app’s `/{org}/{ws}/spend/findings` (308) and `/{org}/{ws}/spend?finding=<id>` (308, to `/work/findings?finding=<id>`); the mockup’s `#/:org/:ws/spend/findings`, rewritten in place with its query |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D9 (findings are work, and a finding becomes a work item when a person picks it up), D10 (Spend keeps no findings), D15 (no person is scored or ranked), D17; Vocabulary › Work (Finding); Cuts. `docs/fleet-operations-ia.md` › Work. `docs/fleet-operations-routes.md` › Work. `docs/mission-control-spec.md` §12.8 (the findings job and its kinds). ADR-062 in `macanderson/oxagen` |
| Design | `mockups/src/wedge.js` → `findingsTab()`, `findingItem()`, `findingsOpen()`, `findingToWork()`, `FINDING_KINDS_SHIPPED`; `mockups/src/engine.js` → `fndCard()`, `tile()`, `evidenceDlg()`, `fixDlg()`, `findingById()`, `spendMonthTotal()`; data `mockups/fixtures/findings.json` (`FINDINGS`), `evidence.json` (`EVIDENCE`) and `fix.json` (`FIX`). Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Work / Findings`: Loaded, Loaded · mobile, Loaded · future-only fields marked |
| Audit | `work-findings.audit-prompt.md` |

## Job

Recorded problems with money behind them, and the evidence for each: a cache write never read, a repeated call, an unpaged result. Findings are work, so they live in Work: a person reads the evidence, then picks the finding up as a work item for an agent, or records the fix directly when no agent needs to do it. Findings rank by the money at stake. Each saving is the measured cost minus the estimated cost without the issue, over the runs the finding cites, at the price each call paid.

## What is on the page

Component help for this tab lives in `mockups/help/work-findings.md`.

**Header.** As `work-backlog.md`: eyebrow the workspace name and h1 “Work”, with no subtext. The explanation is in `mockups/help/work-backlog.md`, Header. The Findings tab has no header action.

**Tabs**: Backlog `7` · In progress · Work orders `1` · Workflows · Findings `36`, with Findings selected. Its count is the open findings nobody has picked up.

**Tiles**, four across, one value and one caption each:

| Tile | Value on the demo record | Caption |
|---|---|---|
| At stake | $30,682.11 | “7.0% of $439,705.21 this month” |
| Findings | 37 | “36 open · 1 in work” |
| Evidence | every one | “opens to the runs it cites” |
| Basis | measured | “at the price each call paid”. The derivation is in `mockups/help/work-findings.md`, Tiles |

**The list.** The shared list bar: a search field (“Search findings”), facets Level (“Any level”: agent, operator, tool, workspace) and Confidence (“Any confidence”: high, medium), **Sort** (Rank; Savings, high first; Savings, low first; Finding A–Z), Rows (5, 10, 25, 50, All), and a pager (“1–10 of 37 (page 1 of 4)”). One card per finding, ranked by the money at stake:

- the rank;
- the kind in bold (“Unpaged results”), the level badge (`tool`), and the confidence badge (“high confidence” or “medium confidence”);
- the operator whose runs the finding cites (avatar and name) and the subject in mono (“Diego Marchetti · a-intel.mobile.backlog-groomer-canary”);
- one sentence of why (“Across 8,388 calls in 30 days the result body averaged 27k tokens and re-entered the context on every later turn of the run.”);
- the evidence line in mono (“evidence 6,256 runs · 8,388 tool calls · last 30 days · trend −6% over 30 days”);
- on the right, the saving (“$3,981.89”), “at stake · 13% of identified”, and a bar of that share;
- the actions **Create work item**, **Evidence** and **Fix**. A finding already picked up shows **In work · WI-14**, a link to its work item, in place of **Create work item**.

The demo record holds 37 findings of nine kinds: Unpaged results, Refetching a stable list, Duplicate tool calls, Unproductive tail, Wrong model class, Repeated shell commands, Tool-list bloat, Cache misses after a stable prefix changed, and Cache writes never read. One is in work: `fnd_01K5RT2A` (Tool-list bloat on triage, $188.40) became WI-14.

No note sits under the list. How a finding becomes work is in `mockups/help/work-findings.md`, Findings.

**Create work item** opens a work item written in Oxagen: the next number (“WI-15”), the finding’s fix as its subject, “Picked up from finding fnd_01K5RGZ9J. <why>” as its description, the labels P2 and Improvement, and readiness `drafting`. The tab stays open, the card turns to **In work · WI-15**, and a gold toast reads “Work item WI-15 opened from fnd_01K5RGZ9J. oxagen.assistant is drafting its definition of done.” The work item page (`work-item.md`) shows **Open the finding**, which comes back here with the evidence open.

### The Evidence dialog (`evidence`)

Opened by **Evidence**, by the address `?finding=<id>`, and from a work item’s **Open the finding**. Title “Evidence for duplicate tool calls”. Subtitle “fnd_01K5RHD7B · agent · last 30 days · basis client_attested”.

- Four figures: **At stake** (“$2,398.16”, “measured cost minus the estimated cost without the issue”), **Confidence** (“High”, the trend “+11% over 30 days”), **Signal** (“12 steps”, “identical input digests per run · baseline 1 step”), **Evidence** (“1,313 runs · 6,007 model calls”, “client_attested · every run sealed”).
- **Recent runs with unproductive spend**: Run · Task · Started · Cost · Unproductive · What was wasted, then a total row: “3 most recent of 1,313 runs”, the cost total, the unproductive total, and “45% of what these runs cost”. A row closes the dialog and opens the run.
- **How we know**: the method, step by step (Measured, Re-read, Never used, Counterfactual), then “Counterfactual: <the alternative>.” The arithmetic is in `mockups/help/work-findings.md`, Evidence dialog.
- **Who is involved**: the operator (avatar, name, “workspace.owner · core-platform · operator on every run below”, and one line on the pattern) and the agent’s card (harness, toolbelt, runs and spend over 30 days).
- Footer: **Close** and **Fix** (gold; opens the Fix dialog), with no sentence beside them.

### The Fix dialog (`fix`)

Chosen by the finding’s kind. Two shapes:

- **A pull request** (Duplicate tool calls). Title “Fix for duplicate tool calls”, subtitle “Pull request for a-intel.core.status-poster-us · $2,398.16 at stake”. An eyebrow naming the branch (`context/ctx.release.no-reread-changelog`) and “one concern per PR”. The Steering record file it adds (`.oxagen/rules/ctx.release.no-reread-changelog.toml`: schema, lineage, kind `rule`, workspace scope, the statement “Do not re-read CHANGELOG.md more than once in a run; cache the first read.”, strength `should`, `constraint_effect = "forbid"`, and the finding, its runs and its saving as evidence). **Evidence**, the link to the evidence dialog. Why a pull request is in `mockups/help/work-findings.md`, Fix dialog. **Checks that will run**: Schema, Lineage uniqueness, record_hash recomputation, Secret and PII scan, Conflict against active records, and `constraint_effect ∈ {require, forbid}`, each “on push”. No note under the checks. Footer “Opens on a-intel/platform as a-intel/platform#519 · team mode, a code-owner review is required.”, **Cancel**, **Open the pull request** (gold). It toasts “Branch context/ctx.release.no-reread-changelog pushed and a-intel/platform#519 opened with fnd_01K5RHD7B as supporting evidence.”
- **A help article** (every other kind). Title “Fix for <kind>” (Unpaged results: “Fix for unpaged results”), subtitle the article’s title (“Why a month of line items should never enter the context window”). **Why this costs money**; the pair **What your agent does today** and **The fix**, as code; **How to apply it**, the steps; three figures: **What you save** (“$3981.89”, “per 30 days on <subject>”), **Evidence** (a link to the evidence dialog, “high confidence”), **Where the fix lives** (“the agent’s own code” or “workspace config”, with no caption). Footer “oxagen records the change as a definition change when you apply it.”, **Close**, and the kind’s action (gold; Unpaged results: **Request grouped totals**).

**Shell.** The sidebar with Work lit and its count. Breadcrumbs “Anderson Intelligence Corp. / Core platform / Work”. ⌘K, notifications, the Approvals button with the organization’s count, and the avatar.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Checked against `macanderson/oxagen` `origin/main` at `1ba160dbc`. Findings ship: the findings job writes `cost.findings` (`packages/database/atlas/migrations/20260915201000_cost_findings.sql`; the job in `packages/billing/src/findings.ts` and `packages/inngest-functions/src/functions/cost.findings.ts`), and `list_findings`, `get_finding_evidence`, `record_finding_fix` and `dismiss_finding` read and decide them. What does not ship is the link from a finding to a work item, five of the nine kinds, and part of what the design shows on a card and in the evidence.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Findings of four kinds: Cache writes never read, Duplicate tool calls, Repeated shell commands, Unpaged results | `FINDINGS` | `list_findings` | `packages/oxagen/src/contracts/finding.list.ts:23-69`; the kinds at `finding.shared.ts:15-20` and the table check at `20260915201000_cost_findings.sql:51` | ✅ |
| Findings of five more kinds: Refetching a stable list, Unproductive tail, Wrong model class, Tool-list bloat, Cache misses after a stable prefix changed | `FINDINGS` | the findings job (`mission-control-spec.md` §12.8) | none. The job detects the four kinds above | ❌ |
| Level, subject, saving with its basis, confidence, window, why, fix, runs and calls | `FINDINGS[]`, `EVIDENCE[].confidence` | `list_findings` | `finding.shared.ts:33-56`: `level`, `subject`, `saving`, `confidence`, `window`, `why`, `fix`, `runs`, `calls` | ✅ |
| Rank, share of identified, and the share bar | derived from `save` | derived from `saving` | the list is ranked by saving (`finding.list.ts:2`) | ✅ |
| Trend | `EVIDENCE[].trend` | a trend over the window | none | ❌ |
| The operator and the agent on a card | `EVIDENCE[].who` | the finding’s subject, and the people on its runs | `subject` is one key: a tool name, an agent key, an operator’s `prn_…`, or the workspace id (`finding.shared.ts:38-39`). A card that names both an operator and an agent draws on more than one finding carries | 🟡 |
| At stake tile | sum of `save` | `list_findings` `saving` | `finding.list.ts:50` | ✅ |
| “N% of $X this month” | `spendMonthTotal()` | `list_findings` `spend` and `share` | `spend` is the priced spend over the findings’ window, and `share` is the annualised saving over it (`finding.list.ts:51-54`), not a share of this month | 🟡 |
| Findings tile: count and open | `FINDINGS.length`, `findingsOpen()` | `counts.findings` and `status` | `finding.list.ts:57-65`, `finding.shared.ts:26` | ✅ |
| “1 in work” and **In work · WI-14** | `findingItem()` over `TASKS[].finding` | a finding’s work item | none | ❌ |
| **Create work item** | `findingToWork()` | a work item written from a finding, with its source | none | ❌ |
| Evidence: calls, covered calls, measured and counterfactual tokens and money, up to ten runs | `EVIDENCE[]` | `get_finding_evidence` | `packages/oxagen/src/contracts/finding.evidence.get.ts:15-36`, `finding.shared.ts:59-85` | ✅ |
| Evidence: the signal and its baseline, the trend, each run’s task reference, its cost and what was wasted, the method, who is involved | `EVIDENCE[]` | `get_finding_evidence` | none. A cited run carries its measured and counterfactual money, not the run’s cost or task reference | ❌ |
| Fix, the help article: why, before and after, steps | `FIX[kind]` | help content by finding kind | The finding’s one-sentence `fix` ships (`finding.shared.ts:46`). No article | ❌ |
| Fix, the action that records the change | the article’s action | `record_finding_fix` | `packages/oxagen/src/contracts/finding.fix.record.ts:16-34` (org Owner or Admin; on the agent surface it waits for a person’s approval) | ✅ |
| Fix, the pull request | `FIX[kind].shape` `pr` | a proposal from the finding, then `open_steering_pr` | `open_steering_pr` opens a pull request for a proposal (`packages/oxagen/src/contracts/steering.pr.open.ts:96`). Nothing turns a finding into a proposal. The app’s Fix dialog drafts one through the create flow (`apps/app/src/features/spend/fix-dialog.tsx:1-4`) | 🟡 |
| Dismiss | none | `dismiss_finding` | `packages/oxagen/src/contracts/finding.dismiss.ts:12-29`. The design draws no Dismiss control | ✅ |

## Future-only fields

The mockup marks these with `data-future` (`?future=1` outlines them):

| Mark | Reason in the mockup | What a build shows instead today |
|---|---|---|
| **Create work item**, and **In work · WI-14** | “finding to work item” | Left out. Findings render today on Spend › Findings (`apps/app/src/features/spend/findings.tsx`), from `list_findings`, with Evidence and Fix |
| The kind name on a finding of a kind the job does not detect | “list_findings kinds: cache writes never read, duplicate tool calls, repeated shell commands, unpaged results” | No such finding. The build lists only the four kinds `list_findings` returns |

The mockup marks nothing else, but the trend, the “in work” count, and the parts of the Evidence and Fix dialogs the Data sources table marks ❌ are future-only too. A build renders each as `not recorded` until its contract ships.

## Functionality

- Findings rank by the money at stake. The Sort select reorders them by saving or by name, and the facets narrow them by level and confidence.
- Each saving is the measured cost minus the estimated cost without the issue, over the runs the finding cites, at the price each call paid. The evidence shows the runs, the people and the arithmetic, and every run it cites is sealed.
- A finding becomes a work item only when a person picks it up. **Create work item** writes the item with the finding as its source, and `oxagen.assistant` drafts its definition of done. The finding keeps its evidence, and its card links to the item.
- **Fix** opens the change that removes the waste, chosen by the finding’s kind: a pull request that adds a Steering record, or a help article whose action records the fix. Recording a fix is a governed action: the finding becomes applied, and later passes of the job cite only runs that start after it.
- Every tile is a rollup of the cards: At stake is the sum of the savings, Findings counts them, and each card’s share is its saving over that sum.
- The findings job keeps at most ten findings per kind, largest saving first, and writes a finding only when the counterfactual covers at least half of the calls it cites. High confidence is coverage of 90% or more.

## States

Loaded only. This change designs the loaded state. The build uses the shell’s standard loading, error, empty and denied panels until they are designed.

## Mobile

The thumb bar holds Work (lit, with its count), Agents, Tools, Spend and More. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The tab strip scrolls sideways inside itself. The tiles sit two by two. The list bar stacks. Each card runs full width: the kind and its badges wrap, the saving and its bar sit under the evidence line, and the three actions share one row. The Evidence and Fix dialogs are bottom sheets with full-width footer buttons, their figures stack, and the runs table becomes labelled cards. Touch targets are at least 44 px. Nothing scrolls sideways.

## Permissions

- Read: `work.read` for the tab, as the design names it (not in `packages/iam` today). `list_findings` and `get_finding_evidence` allow org Owner, Admin, Billing and Member, and workspace Owner and Member (`finding.list.ts:35-39`, `finding.evidence.get.ts:27-31`).
- Writes, each a governed action recorded in Audit: `record_finding_fix` (org Owner or Admin, `finding.fix.record.ts:30`), `open_steering_pr` for a pull request, and **Create work item**, which no contract or permission carries yet.

## Backend gaps this page depends on

- A work item written from a finding, with the finding as its source, and the finding’s link to it (the “in work” count)
- The five kinds `mission-control-spec.md` §12.8 lists that the job does not detect
- A trend per finding, and the signal and baseline the evidence dialog shows
- The operator on a finding’s runs beside its subject
- Each cited run’s cost, task reference and cause of waste in `get_finding_evidence`
- A proposal from a finding, so **Fix** can open its pull request through `open_steering_pr`
- Help articles per finding kind

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. The evidence reads frames, the recorded events of sealed runs.
- A Steering Source and a SteeringFrame are never shown as each other. The pull request a fix opens adds a Steering record, a source.
- The page reads the record. Every figure is the findings job’s, computed from frames. No model rates a finding, and the Fix article is chosen by the finding’s kind.
- No person is scored or ranked. Findings rank by money at stake. A card names the operator whose runs it cites and gives that person no score and no rank.
- Every enforcement claim states the tier. The tab makes none.
- Headers are rollups of the rows beneath them: At stake is the sum of the savings, and Findings counts the cards.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. The tab has none of its own. In the Evidence dialog it is **Fix**, and in the Fix dialog its action.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- Every number that is money shows its basis: `gateway_observed`, `client_attested`, `mixed` or `estimated`, as the job recorded it.
- A finding becomes work only when a person picks it up.
