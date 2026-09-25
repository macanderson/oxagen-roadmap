# Findings

<!-- work-findings: the Findings tab of Work, and the Evidence and Fix dialogs, which Spend opens too. The header and tab bar fall back to work-backlog/header and work-backlog/tabs. -->

## Tiles

Four tiles give the money at stake, how many findings there are, what backs them, and how the saving is priced.

### Purpose
You want to know in one glance whether the findings are worth an afternoon. At stake gives the total and its share of this month's spend. Findings says how many are open and how many a person already picked up. Evidence and Basis tell you what kind of number you are reading before you trust it.

### Rationale
D9 moved findings from Spend to Work because a finding is work: a person reads it and picks it up. The tiles are rollups of the cards beneath them, so the total and the count can never disagree with the list. Every number that is money shows its basis. The Basis tile states it for the whole tab: a saving is measured, priced at what each call paid. The derivation left the caption and lives here. A saving is the measured cost minus the estimated cost without the issue, over the runs the finding cites, at the price each call paid (`mission-control-spec.md` §12.8).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| At stake | the sum of `n$(f.save)` over `FINDINGS` | `list_findings` `saving` (`finding.list.ts:50`) | live |
| "N% of $X this month" | `spendMonthTotal()` | `list_findings` `spend` and `share` (`finding.list.ts:51-54`) | partial |
| Findings, open and in work | `FINDINGS.length`, `findingsOpen()`, `findingItem()` | `counts.findings` and `status` (`finding.list.ts:57-65`); a finding's work item | partial |
| Evidence | static copy | none | none |
| Basis | static copy | the findings job's method | none |

### Logic
1. `findingsTab()` sums every finding's saving into At stake. Its caption divides that by `spendMonthTotal()` and prints one decimal. `list_findings` reports `share` as the annualised saving over the priced spend of the findings' window, not a share of this month, so a build must label the figure it has.
2. Findings counts `FINDINGS`. Its caption is `findingsOpen()` (no work item points at the finding) and the count that `findingItem()` finds in `TASKS[].finding`.
3. Evidence reads "every one" and "opens to the runs it cites". Basis reads "measured" and "at the price each call paid". Both are fixed strings. A build either computes them from the findings or leaves them out.
4. The Findings tab count is `findingsOpen().length`, 36 on the demo record.

### States
Loaded only. On a phone the tiles sit two by two.

## Findings

The ranked list of findings, one card each, with the evidence line, the saving and the three actions.

### Purpose
You pick what to fix next. Cards come ranked by money at stake, and each names the kind, the level, the confidence, the operator whose runs it cites, the subject, one sentence of why, and the evidence behind it. From a card you open the evidence, open the fix, or turn the finding into a work item for an agent.

### Rationale
Findings rank by money and nothing else. No person is scored or ranked (D15), so a card names the operator whose runs it cites and gives that person no score. The note under the list moved here. A finding becomes work when a person picks it up. **Create work item** opens a backlog item with the finding as its source and a drafted definition of done. **Fix** records the change directly when no agent needs to do it. The two paths exist because some waste needs code (an agent's work) and some needs a setting (a person's minute).

The findings job runs after each seal and writes `cost.findings` rows. It keeps at most ten findings per kind, largest saving first. It writes a finding only when the counterfactual covers at least half the calls it cites, and high confidence means coverage of 90% or more.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Four kinds: Cache writes never read, Duplicate tool calls, Repeated shell commands, Unpaged results | `FINDINGS` | `list_findings` (`finding.list.ts:23-69`, `finding.shared.ts:15-20`) | live |
| Five more kinds | `FINDINGS` | the findings job (`mission-control-spec.md` §12.8) | none |
| Level, subject, saving, confidence, window, why, fix, runs and calls | `FINDINGS[]`, `EVIDENCE[].confidence` | `list_findings` (`finding.shared.ts:33-56`) | live |
| Rank, share of identified, the bar | derived from `save` | derived from `saving` (`finding.list.ts:2`) | live |
| Trend | `EVIDENCE[].trend` | a trend over the window | none |
| Operator and agent on a card | `EVIDENCE[].who` | `subject`, one key (`finding.shared.ts:38-39`) | partial |
| **Create work item** and **In work · WI-14** | `findingToWork()`, `findingItem()` | a work item written from a finding | none |

### Logic
1. `FINDINGS` holds the nine findings in `fixtures/findings.json` plus the ones the load step generates from the fleet, 37 in all, sorted by saving.
2. `fndCard()` in engine.js, shared with Spend, draws the rank, the kind, the level badge, the confidence badge, the operator's avatar and name, the subject in mono (`who.agent` or `f.subject`), the why, and "evidence <runs and calls> · <window> · trend <trend>". The right side shows the saving, "at stake · N% of identified" and a bar sized to the largest saving.
3. `findingsTab()` adds **Create work item**, or **In work · WI-14** when `findingItem()` finds a work item. Both carry a future-only mark. A kind outside `FINDING_KINDS_SHIPPED` gets a future-only mark on its name.
4. `findingToWork()` writes a `TASKS` entry of kind `oxagen`: the next WI number, the finding's fix as the subject, "Picked up from finding <id>. <why>" as the description, labels P2 and Improvement, readiness `drafting`, and the finding id. The card turns to **In work** and a gold toast names the item.
5. **Evidence** and **Fix** open `evidence` and `fix` with the finding id.

### States
Loaded only. The shared list bar adds search, the Level and Confidence facets, Sort, Rows and a pager. On a phone each card runs full width and its three actions share one row.

## Evidence dialog {#dialog/evidence}

The Evidence dialog shows the arithmetic behind one finding: the figures, the recent runs, the method, and who is involved.

### Purpose
You read a finding and want to check it before acting. The dialog shows the saving, the confidence and its trend, the signal against its baseline, and how many runs and calls it rests on. It lists the most recent runs with their unproductive spend, walks the method step by step, and names the operator and the agent. **Fix** opens the change.

### Rationale
A finding is a claim about money, so it arrives with its evidence and not with a model's opinion. Every figure is the findings job's, computed from frames. Each cited run is sealed, so the numbers can be traced to recorded events: a run row closes the dialog and opens that run, where the frames the arithmetic came from are recorded. The counterfactual line keeps the alternative. The saving is the difference, priced at what each call paid. The dialog opens from Work › Findings, from Spend, from a work item's **Open the finding**, and from `?finding=<id>`.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Calls, covered calls, measured and counterfactual money, up to ten runs | `EVIDENCE[]` | `get_finding_evidence` (`finding.evidence.get.ts:15-36`) | live |
| Signal, baseline, trend, each run's task, cost and waste, the method, who | `EVIDENCE[]` | `get_finding_evidence` | none |

### Logic
1. `evidenceDlg()` builds only while `S.dlg` is `evidence`, because the dialog map is built on every render. With no finding it shows "No finding selected."
2. The four figures are At stake, Confidence with `e.trend`, Signal (`e.measured`, `e.signal`, baseline `e.baseline`) and Evidence (`f.frames`, the basis, "every run sealed").
3. The runs table lists `e.runs` and a total row: "N most recent of <runs>", the cost total, the unproductive total, and its share of cost.
4. How we know lists `e.method`, then "Counterfactual: <e.counterfactual>."
5. Who is involved shows the operator from `PEOPLE` and `agentCard()` for the agent, or a plain key when the agent is not in view.
6. **Fix** (gold) opens `fix` on the same finding.

### States
On a phone the dialog is a bottom sheet, the figures stack, and the runs table becomes labelled cards.

## Fix dialog {#dialog/fix}

The Fix dialog opens the change that removes one finding's waste, chosen by the finding's kind.

### Purpose
You decided to act. The dialog gives you the fix in the one shape that fits the kind: a pull request that adds a Steering record, or a help article whose action records the fix. It states what you save and links the evidence.

### Rationale
The kind picks the shape, so no model rates the fix. Duplicate tool calls is a behavior of the agent, not a flaw in its code: the brief says to confirm the changelog, so the agent re-reads the file. A Steering record changes that behavior without a deploy. It is reviewed like code, published on merge, and delivered at the steering position of the next run. The agent reads it on its next run after merge. Merge is the publication. Until then the record steers nothing. After it, Spend shows the repeat reads going away on the next run of that subject. The other kinds need a change in the agent's own code or the workspace config, which Oxagen cannot make for you. The article shows exactly where. Applying it records the change as a definition change, so the saving is attributable on Spend. The dialog opens from Work › Findings and from Spend.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Article: why, before and after, steps | `FIX[kind]` | help content by finding kind | none |
| The action that records the change | the article's action | `record_finding_fix` (`finding.fix.record.ts:16-34`) | live |
| The pull request | `FIX[kind]` `shape` `pr` | a proposal from the finding, then `open_context_pr` (`context.pr.open.ts:96`) | partial |

### Logic
1. `fixDlg()` builds only while `S.dlg` is `fix`, and reads `FIX[f.kind]`. Duplicate tool calls has `shape` `pr`. The eight other kinds are articles.
2. The pull request shape shows "Branch <branch> · one concern per PR", the record file `.oxagen/rules/<lineage>.toml` with the finding as evidence, an Evidence column with the link, and six checks marked "on push". Its footer names the repository and `x.pr`, and **Open the pull request** (gold) toasts the branch and the pull request.
3. The article shape shows Why this costs money, the before and after code (`codePair()`), How to apply it, and three figures: What you save, Evidence, and Where the fix lives ("workspace config" for a workspace finding, "the agent's own code" otherwise). Its footer says Oxagen records the change as a definition change, and the gold action toasts `x.done`.
4. The evidence link reopens `evidence` on the same finding.

### States
With no finding the dialog shows "No finding selected." On a phone it is a bottom sheet with full-width footer buttons.
