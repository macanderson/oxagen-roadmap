# Audit prompt: Workflows

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Workflows** tab of Work in Oxagen (`/a-intel/core-platform/work/workflows`), with the workflow dialog (`?workflow=<id>`) and the workflow builder, for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarize what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/work-workflows.md` (read it first, in full), and `mockups/pages/work-backlog.md` for the Work header and tabs.
2. The design, rendered: the stories `Oxagen / Work / Workflows` (Loaded, Loaded · mobile, Loaded · future-only fields marked), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>[&future=1]#/a-intel/core-platform/work/workflows`, and `…/work/workflows?workflow=fix-validate-document-review` for the dialog. The flow check is `node tools/check-tasks.mjs` (flow 6).
3. The product specs: `docs/fleet-operations-wedge.md` (Vocabulary › Work, Steering › Emissions, Work › Shipped today), `docs/tasks-spec.md` §10, §12, §14, §17.2, and `docs/creation-spec.md`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/work/workflows`.

5. The work graph: `docs/work-graph-spec.md` §8.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/a-intel/core-platform/work/workflows`, and `?workflow=<id>` opens that workflow’s dialog over it. Work is lit, the breadcrumbs end on Work, and the Workflows tab is selected with no count.
2. **Header.** As `work-backlog.md`, with **New workflow** as the one gold action. A second gold control is a FAIL.
3. **Workflows table.** Heading “Workflows”, with no subtext (the explanation is in `mockups/help/work-workflows.md`, Workflows). Columns in order: Workflow (name and file path) · Stages (harness mark and role per stage, arrows, ending in You) · State (`published` with its commit, or `pull request open` with its number) · Work orders. Recompute each Work orders count from the work orders sent to that workflow: a typed or mismatched count is a FAIL. A row opens the workflow’s dialog.
4. **One panel.** The tab body is the Workflows panel at full width. A How a workflow runs panel, or any list of facts about handoffs, returns and the last stage, on the page is a FAIL: those facts live in `mockups/help/work-workflows.md`, Workflows.
5. **The workflow dialog.** The name and description, the stage chain with each stage’s role, harness mark, agent, tier, owned tags and what happens on failure, then Accept by You. The file under its path, exactly as committed (compare with the file in the repository at that commit). The note “Published at <commit>.”, or “In <pr>. It can be used when it merges.” **Close** and **Change it**.
6. **The builder.** In your own words with the wand, Name, and the stages. Each stage has a role field, an agent select listing **only** agents you operate, each with its harness, the harness mark, up, down and remove (remove absent on the only stage), Owns checkboxes (code, test, docs, review), and On failure (stop and ask you, or return to an earlier stage, with at most 1 to 3). The Accept stage for You cannot be removed. **Add a stage** adds one. The file preview follows every change. **Open pull request** is disabled without a name. The footer names `context.propose`.
7. **The wand.** It turns “A bug fixer passes a fix to a validator, which passes it to a documenter, which passes it to an architect for final review.” into Fix, Validate, Document and Review in that order, with Validate returning to stage 1 at most 2 times and Review at most once, and fills an empty name. It decides nothing else. The builder carries no subtitle and no note, and its toasts say only what happened (“oxagen.assistant drafted 4 stages from your sentence.”). Why a person reads the stages is in `mockups/help/work-workflows.md`, Workflow builder.
8. **Opening the pull request.** It opens a pull request that adds `.oxagen/workflows/<slug>.toml` and writes no row: the workflow appears as `pull request open` with its number and cannot be sent until the pull request merges. Verify the server refuses a work order sent to a workflow in a pull request.
9. **Running a workflow.** In the sequencing code, verify each stage is its own run by its own agent; a handoff note reaches the next stage as quoted evidence; a return goes only to a stage the file names, at most `max_returns` times, and the next one parks the work order in the Approvals drawer; and the last stage is a person.
10. **Data sources.** For each row of the spec’s Data sources table, find what feeds it in the build. ✅ rows (each stage agent’s harness, name and tier, and the agents you operate) are wired to `list_agents`. ❌ rows render `not recorded` or are left out, never a zero and never a fixture. A fixture reaching production is a FAIL.
11. **Future-only fields.** The whole tab body is future-only in the design, and the dialog and builder are too. Confirm the build renders `not recorded` or leaves out **New workflow**, **Change it** and **Open pull request** until the file schema and `propose_workflow` ship. A control that silently does nothing is a FAIL.
12. **States.** The design has the loaded state only. Force loading, error, empty and denied: each must be the shell’s standard panel inside the shell. Record which panel the build uses.
13. **Mobile.** At 390 × 844: the thumb bar (Work, Agents, Tools, Spend, More); **New workflow** under the h1; the panel runs full width; the table is labelled cards; the dialog and the builder are bottom sheets with full-width footer buttons and a stacked stage chain; the file preview scrolls inside its block and the page never scrolls sideways; touch targets at least 44 px; inputs 16 px.
14. **Rules.** One gold action. No heading or caption carries a comma, a mid-dot, or a not/never contrast, and every string reads in plain grammar. A workflow grants nothing. Every stage agent is one you operate and shows its recorded tier. Every harness shows its own mark, and none is the default.
15. **Accessibility.** Tabs use `role=tablist`/`tab` with `aria-selected`. Every stage control is labelled with its stage number. Dialogs are `role=dialog aria-modal` with a labelled close. State is never colour alone.
16. **Permissions.** `work.read` to see the tab, and `context.propose` gated on the server for the pull request. Verify with a role that lacks each.
17. **Stages that run beside each other.** The Stages column joins parallel stages with ∥ and the layers with arrows. `wfview` draws the chain by layer, reads “after <role> and <role>” on a fan-in card, and shows `schema = "oxagen-workflow/v0.2"` with `needs` on each stage that names one; a v0.1 file with no `needs` renders the same chain as before. The builder’s **After** checkboxes exist on every stage after the first, default to the previous stage, refuse an empty set inline, and “return to” lists only upstream stages.
18. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding, and the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Workflows audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
