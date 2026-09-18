# Oxagen Mission Control: mockup prompts, one per demo flow

**Purpose.** Each prompt below produced one high-fidelity, clickable mockup of Oxagen Mission Control, built on the Oxagen house brand. This is the record of how the W flows were made; the flows themselves now live as guided scenarios inside `mockups/missioncontrol.html` and as stories in the Storybook catalog, and the coverage audit prompt 12 ran is replaced by `tools/check-mockup.mjs`, which walks every page in every state and every scenario. The W7 (ontology) and assistant prompts were cut by the scope review of 2026-09-14 (`scope-review.md`); W11 survives as the account.

**How to use.** Paste **Part A (the common brief)** followed by **one** Part B prompt into a fresh agent session. Run the prompts in order; later flows reuse screens from earlier ones. Run prompt 12 last.

---

## Part A. Common brief (paste before every prompt)

You are building a high-fidelity, clickable mockup of one flow of **Oxagen Mission Control**, the product specified in `docs/mission-control-spec.md`. Read the whole spec before you design; sections 3 (vocabulary), 6 (identity and the toolbelt), 7 (gateway and intervention), 8 (runs and frames), 10 (repository and Context PRs), 12 (spend), 14 (Mission Control pages), and Appendix F (the nine pages and what each absorbs) are binding. The mockup is not a concept: it is what the app should be, screen for screen, control for control, in the real information architecture (the sidebar with the six workspace pages and three organization pages, the top bar with the assistant toggle and the command menu, breadcrumbs, and the organization and workspace switchers).

**Brand, no exceptions.** Use the Oxagen house system in `/Users/macanderson/Projects/oxagen-house-brand`: read `tokens/house-tokens.css`, the CSS and conventions in `playbook.html`, and inline `logo/svg/oxagen-lockup-adaptive.svg` (strip its internal `<style>` block; color it with `currentColor`). Rules from the kit: Space Grotesk everywhere (load from Google Fonts, weights 400, 500, 600, 700; display 700, headings 600, body 400); dark-first, ink `#09090B` canvas with paper `#FFFFFF` in light mode; panels `#18181B` / `#FFFFFF`; hairlines `#27272A` / `#E4E4E7`; gold `#D4AF37` is identity and at most one primary action per screen and never encodes a state (`#8A7223` for gold text on paper, `#F1CE65` for hover on ink); semantic state colors (allowed, needs approval, denied, proven, failed, critical) are separate from gold and used consistently; code and identifiers in the system monospace stack; panels with 10 to 14 px radius; eyebrows 12 px uppercase letter-spaced. Both themes must be complete: define the full dark palette on `:root`, override tokens under `@media (prefers-color-scheme: light)` guarded as `:root:not([data-theme="dark"])`, and again under `:root[data-theme="light"]`; give `body` an explicit token background.

**Vocabulary, locked.** Use exactly: operator, agent, run, turn, step, model call, tool call, frame, context frame, context record (or record), steering, Context PR, governed action (shown as "action"), agent tool, toolbelt, main repo, linked repo, production branch, mandate, receipt, witness, enforcement tier, data plane, funding source, price book, findings, proven run, kill switch, connection, credential grant, policy version, entity, code graph. Never use: capability, tacho, execution, invocation, session (except "session id" as a harness field), `.stella`. The wrapper is invoked as `oxagen.agent.wrap({})`; the directory in a repo is `.oxagen/`.

**Fidelity.** Real content, never placeholder text. Use one consistent demo customer across every prompt: **Anderson Intelligence Corp.**, organization `a-intel`, workspaces `core-platform` (main repo `a-intel/platform`, production branch `main`, linked repos `a-intel/billing`, `a-intel/mobile`) and `finops` (main repo `a-intel/finops-agents`). Operators: Priya Natarajan (org owner), Marcus Bell (workspace owner, core-platform), Dana Okafor (billing role, finops). Agents: `a-intel.core.release-manager` (Claude Code), `a-intel.core.stella-ci` (Stella), `a-intel.core.triage` (Codex CLI), `a-intel.finops.invoice-bot` (OpenAI Agents SDK, holds a mandate), `a-intel.core.docs-writer` (custom, SDK-wrapped). Fifty agents in total in the fleet counts. Costs shown to the cent with their basis; token counts by class; cache hit rates; enforcement tiers; replay grades; verdicts from the closed vocabulary (`flipped`, `failing`, `unmoved`, `unsatisfied`, `tampered`, `unverified`, `waived`). Every number that is money shows its currency; the organization's display currency is USD.

**Every screen has five states** where they apply: loaded, empty, loading, error, and permission-denied, plus a phone-width (400 px) reflow. Show the loaded state by default and make the others reachable from a small "states" control in the mockup's own chrome (kept visually separate from the app, bottom right, monospace, so it can never be mistaken for product UI).

**Clickable.** Build one self-contained HTML file (inline CSS and JS; only the fonts and, if truly needed, a pinned UMD library from cdnjs are external). Navigation is real: clicking a run opens the run, clicking pause changes state, clicking approve mints the token and updates the receipt, tabs switch, dialogs open and close, and the browser back button works (use hash routes). No backend; state lives in the page. Keyboard focus is visible; motion respects `prefers-reduced-motion`; nothing horizontal-scrolls except tables, code, and diagrams in their own containers. The page opens at rest on the flow's first screen with everything readable.

**Publish, then update the spec.** Publish the file with the Artifact tool (title: the flow name from the prompt, favicon `🛰️`, one-sentence description). Then edit `/Users/macanderson/Documents/Oxagen/Specs/2026-09-11-oxagen-mission-control-spec.md`: in the section `## 19. Demo Wow! Scenarios`, find the table row whose first cell is the flow id from your prompt (for example `W1`) and set its **Mockup** cell to a Markdown link to the published artifact and its **Status** cell to `mocked`; in the **Page coverage** table in the same section, set the **Mockup** cell of every page, panel, dialog, or flow your mockup covers to the same link (append with a comma if a link is already there). Change nothing else in the spec. If the section does not exist yet, stop and report; do not create it.

**Report.** End with the artifact link, the list of pages and states you mocked, and anything in the spec you found ambiguous while building (quote the sentence).

---

## Part B. One prompt per flow

### W1. Sixty seconds to governed

**Wow moment.** A developer goes from a blank browser to watching their own Claude Code agent governed on the Fleet page in about a minute, without pasting anything.

Build every sign-in and onboarding screen and the first Fleet view. Screens, in order: sign up (email and password, SSO buttons), verify email, log in, two-factor, forgot and reset password, accept an invitation (shows who invited, organization, role); then the onboarding gate for a new organization: step 1 name the organization (one field), step 2 wrap an agent (three cards: Claude Code, Codex CLI, SDK agent; the Claude Code card offers "Download for macOS / Windows / Linux" with the one-time token embedded and a "or run `oxagen agent enroll`" line; the SDK card shows the five-line `oxagen.agent.wrap({})` snippet in TypeScript with a language switch to Python and Go), step 3 start a run (a waiting state that polls, then flips the moment the first frame arrives). The gate shows the detected git remote and a one-click "Bind a-intel/platform as the main repo" with the GitHub App install, and a "skip for now, provisional for 14 days" link with the consequence stated. On unlock: the full app appears for the first time, landing on Fleet with exactly one run in it, and a dismissible offer card beside it: "Convert during onboarding: 20% off usage for 12 months," with the run's actual cost shown next to it. Also mock the installer's own three screens as a separate small panel (download, installing with steps ticking, connected with a rollback command).

### W2. Stop it. Steer it.

**Wow moment.** An operator watches fifty agents live, pauses one mid-loop, types a steer, and sees the exact frame where the agent received it.

Build the Fleet page in full (live runs table with agent, operator, harness, enforcement tier, current step, cost so far, replay grade, verdict, and the approvals panel collapsed on the right), the filters (by operator, agent, tier, verdict, task), and the run detail page in its live state: the frame timeline streaming, the current model call, pause, resume, steer (a text box that sends at the next model call), cancel, and revoke. Show the steer as a `control.steer` frame and then the next `model.request` frame with the injected message highlighted. Add the mass-steer control: a message composer with `@all`, `@release-manager`, and `@finops` addressing, the grant check ("you can @all in core-platform"), and the delivery report (delivered before the next model call, or undelivered with the reason) as a list of agents with per-agent status.

### W3. Money asked, a human answered

**Wow moment.** A finance bot tries to pay an invoice above its mandate; the call parks, a human approves from the queue with the full chain in front of them, and the receipt shows the credential Oxagen minted for that one call.

Build the approvals panel on Fleet and the approval strip on the run page; the approval card with the four-hop chain (operator, agent, action, rule), the mandate with its remaining authority as a bar, the taint sources if any, the input digest, approve and deny with a reason, the timeout; the moment of approval minting a single-use token and the call dispatching. Then the receipt view (opened from the run and from Audit): who, what, authority, credential, effect, integrity, with the external transaction id and the mandate ledger movement. Also build the mandate detail on the Agents page for `invoice-bot` (limits, counterparties, tools, approval rules, two-person flag, remaining this period) and the mandates ledger tab on Tools.

### W4. The flight recorder

**Wow moment.** Anyone with the right role opens a finished run and steps through it frame by frame, seeing what the agent was told, what it asked, what came back, what it cost, and why each decision was made.

Build the run page in its sealed state completely: the timeline with turns as bands and steps inside them; the frame inspector for each kind (`context.assembled` with the context frames and their citations and token costs, `model.request` with steering and messages highlighted, `model.response` with usage by class and cost and cache hit rate, `tool_requested` with validated input, `tool_call` with validated output and redactions, `policy.decision` with the rule ids and policy version, `control.*`, `record.appended`, `proof.observed`); the cost strip accumulating across the run; the chain status and seal with the attestation key id; fork replay from a chosen frame (a dialog that explains what will be re-run and what will be served from the recording); bisect between two runs of the same task (side by side, first differing frame highlighted); export (signed bundle with verifier). Include the compacted-run state (frames served from the archive segment, with a note) and the replay-grade explanation.

### W5. Proven, not claimed

**Wow moment.** A run is marked proven because a witness the agent never saw failed on `main` and passed on the pull request, and the agent's own frames show it received nothing but the word "pass."

Build the proof frame inspector on the run page (witness id, oracle kind, target and PR refs and shas, verdict, fail fingerprint, tamper exclusion, disclosure grain `L0`, the witness run link, the runner attestation); the witness run itself as a run of the witness runner service principal; the pass/fail airlock shown from the agent's side (the frame that says only `pass`); the Tools page tab that shows the assurance suite's last result per case; and the Spend page's proven versus unproven spend for the day with this run contributing. Show the `tampered` state on a second run where the PR edited the test harness.

### W6. It learned, you approved, it changed

**Wow moment.** An agent learned something across several runs; it became a proposal, then a pull request with checks, a person merged it, and the next run shows the new rule in its context.

Build the Steering page: published records (kind, statement, scope, effect metrics: rendered, cited, violated, proof rate before and after), proposals with their supporting runs and evidence links and the promoter's rationale, retirement candidates; the "open Context PR" action showing the branch, the single record file diff, the PR body, and the check runs (schema, hash, conflicts, secrets, probes) as they complete; the merge state creating the `promotion_event`; and the run page of the next run with the new steering visible in the `model.request` frame. Include the agent definition flow on the same page family: creating `a-intel.core.docs-writer` in the UI opens a Context PR that adds `.oxagen/agents/docs-writer.toml` and the generated `.claude/agents/docs-writer.md` beside it, and the Agents page shows the agent as `unenrolled` until merge.

### W8. Every dollar, every operator

**Wow moment.** A team lead sees exactly what their agents' tokens bought, which runs turned into proven work, and three findings ranked by money that would cut the bill next month.

Build the Spend page: findings ranked by money at stake with the frames that prove each; spend by operator, agent, model, provider key, repository, and task; proven versus unproven versus accepted spend; productive ratio; cache hit rate trend; the operator view (Marcus Bell: his agents, runs, spend, budget position); the agent view (`stella-ci`: spend per proven run over time, tool-call mix); the run waterfall; reconciliation status with a matched-to-the-cent month and one open exception; budgets at every level with hard and soft modes; and the multicurrency state (display currency switch showing the rate and its source). Also build the Billing page: the plan, the free 1,000 runs, this period's runs against the tiers, the two secondary meters, invoices linked to Stripe, and the annual prepay offer.

### W9. The toolbelt, governed

**Wow moment.** A CIO sees that an agent can only see the tools it was granted, that it holds no credentials at all, and that a policy change can be simulated against last month's real calls before it is switched on.

Build the Agents page (list; agent detail with identity, run credential, roles, the toolbelt as the model sees it including the searchable-belt state with `search_tools`, per-tool decision rules, mandates, budgets, enrollment status with the host device, tamper incidents, and the definition file link) and the Tools page (registry with servers, tools, versions, schemas and the approve-observed-schema flow; connections with owners, review dates, downscoping method, and the two-person flag; credential grants log; mandates ledger; policy versions with tests, the simulation view showing would-deny, would-approve, would-allow against thirty days of calls with the runs listed; kill switches at every level with the class-wide "every moves_funds tool" switch; the assurance suite results). Include the import-tools flow from an MCP server.

### W10. The CIO's console

**Wow moment.** Every control the security review asks about is on two pages: who can do what, where the data lives, what happened, and what can be proven.

Build the Organization page (members with org and workspace roles, invitations, workspaces list and create-workspace with main repo binding, model funding source and routes per tier with the OpenRouter defaults and an in-firewall route, data plane binding with the dedicated and behind-the-firewall states, API keys, workspace settings) and the Audit page (control-plane events, incidents with severity and resolution, receipt search, legal holds, exports with the verifier, key rotation with validity windows, the assurance suite per release, retention settings and the archive tiers, GDPR erasure request state with crypto-shredding explained in one line). Include the behind-the-firewall deployment status card (version, bundle signature, outbound connections in use, air-gapped mode).

### W11. The account

*Cut down on 2026-09-14: the assistant half of this prompt went with the in-app agent (`scope-review.md`). What remains is the account.*

**Wow moment.** Whose account it is: the person behind every governed action, how they sign in, what reaches them, and a command menu that cannot find a tool outside the belt.

Build the Account dialog (profile, preferences as governed actions, security and sessions, privacy and export), the notifications list where every kind maps to a frame kind or an audit event, and the ⌘K command menu (`search_tools`) that returns navigation, actions and the belt's tools with their hazards, and nothing outside the belt.

### W12. Coverage audit

**Job.** Prove nothing is unmocked. Read section 19 of the spec and Appendix F. For every page, tab, panel, dialog, sign-in flow, and the five states plus phone width, check that a mockup link exists in the Page coverage table and that the linked artifact actually contains that screen and state (open each artifact and walk it). Produce a table of gaps. For each gap, build the missing screen or state as an addendum artifact in the same brand and conventions, publish it, and add the link. Do not mark the audit complete while any cell in the Page coverage table is empty. Finish by setting the section's status line to `complete` with the date, and report the gaps you filled.

### W13. In the loop

**Added 2026-09-12, after the W12 audit closed.** W13 introduces capability the spec does not yet carry, so it is the one prompt that changes section 2 as well as section 19. Read the Known gaps note in `w13-in-the-loop-scenario.md` before starting.

**Wow moment.** An agent starts a run in a repository nobody has bound. Skills are on, so there is a config to resolve and nothing to resolve it against — the loop stops before the first model call and the question reaches a person *through the agent*. The operator answers in the agent's own window; the pause, the question, the wait and the answer are frames in the same chain as the work.

**The cut to hold.** Section 2 says Oxagen has no skills engine, and W13 keeps that. Oxagen does not run a skill; the harness does. What Oxagen governs is **resolution**: which skills a workspace's config lets an agent find, which it may load, what that cost, and what was held back and why — the same shape the toolbelt has in W9, where Oxagen holds no credential and runs no tool and still decides every call. Adopting W13 means section 2 gains one sentence separating *running* a skill from *resolving* one; the "no skills engine" line stays.

**Vocabulary this adds.** `skill`, `skill source`, `skill config`, `skill resolution`, `interjection`, `reflection`, `quarantine`. **Frame kinds this adds.** `skills.searched`, `skills.loaded`, `skills.resolved`, `repo.unknown`, `repo.bound`, `control.interject`, `control.answer`, `workspace.created`, `reflection.captured`.

Build the Skills page and all its tabs, the interjection where it appears on Fleet and on the run, and the reflection record. **Off, the shipping default**: a workspace with `skills.enabled = false`, which is the value a workspace is created with and not one an admin set — state what turning it on does (adds `search_skills` to every belt, lets the harness load a skill file at a priced token cost, starts `skills.searched` and `skills.loaded` frames, makes `.oxagen/skills.toml` a governed file) and what it does not (grants no tool, raises no tier, does not reach into an unbound repo, does not turn on reflection), with a table of every workspace in the organization showing the value each was created with. Turning it on is a Context PR against the main repo, not a settings screen; runs already in flight finish without skills, because a run resolves its config once at the start. **Catalog**: every skill the config resolves to, with source, version, digest, kind, token cost to load, decision tier, citation count and proof rate before and after; and a held-back section for the two withholding classes. **Search**: the `search_skills` console answered exactly as the gateway would answer it in a run — same config version, same top-k and minimum score, same withholding — with the four result shapes (hits, an empty result carrying a reason, a scope withholding, an unapproved-digest withholding), the panel naming what decided it, and the `skills.searched` frame it wrote. The agent receives the count withheld and the reason class and never the names, because a withholding that names what it withholds has not withheld it; replay resolves the run's config version, never today's. **In the loop**: what the seat may do (ask a person, stop before a guess, ask for a reflection, record all three) and what it may not (rewrite the agent's output, answer on the operator's behalf, feed a reflection back into the work, hide that it happened). **The interjection itself, from three sides at once** — the agent's own window where the question reaches the operator, Oxagen's card with the two paths and their real consequences, and the frame strip with the frames that have not happened yet greyed. Both paths must be walkable: link the repo to an existing workspace (inherits the config, the belt, the budget, the tier) or create a new workspace (which ships with skills off, in the middle of a run that was asking for skills — show its `.oxagen/workspace.toml` with no `[skills]` block). An unanswered interjection times out to `deny` at thirty minutes. **Reflection**: the injected out-of-band turn after the seal, drawn dashed and excluded from the sealed chain and from a fork; the rubric with the agent's self-grade beside the record, including at least two axes where they disagree and the frame that contradicts each; and the quarantine panel stating the five rules that make the feature allowable — never enters a context frame, cannot be promoted to a proposal or steering, billed as overhead and excluded from the productive ratio, readable only under an organization-level `research.read` grant, and expires with a retention clock. `use = "research"` is the only value the config accepts. **Versions**: the history of `.oxagen/skills.toml` as pull requests, ending on the line that shows the workspace was created with skills off and stayed off until somebody opened a PR.

Publish as **In the loop**, favicon `🛰️`. Then update the spec: add the W13 row to the section 19 table and to the Page coverage table, add the one sentence to section 2 separating running from resolving, and add the new vocabulary and frame kinds to sections 3 and 8. Section 19's status line reads `complete` as of the W12 audit — reopen it as `in progress` while W13 is unmocked, and set it back when the row is filled.

---

## Part C. Section text to insert into the spec

Insert the following as `## 19. Demo Wow! Scenarios` after section 18 and before the appendices. Prompts update the two tables; nothing else in this section changes.

```markdown
## 19. Demo Wow! Scenarios

Status: `in progress` (set to `complete` with a date by the coverage audit, prompt W12).

Each scenario is one moment an investor or a customer should remember. The mockups are the app, screen for screen, in the house brand. The prompts that produce them are in `2026-09-11-oxagen-demo-mockup-prompts.md`.

| Id | Wow moment | Pages covered | Mockup | Status |
|---|---|---|---|---|
| W1 | Sixty seconds to governed: sign up, wrap Claude Code with one click, first run on Fleet | sign-in flows, onboarding gate, installer, Fleet (first run), discount offer | | not started |
| W2 | Stop it. Steer it.: watch fifty agents, pause one, steer it, see the frame that received it; mass steer with @all | Fleet, Run (live), messages | | not started |
| W3 | Money asked, a human answered: a mandate-bound payment parks, is approved with the full chain, and the receipt shows the one-call credential | Approvals panel, Run strip, Agents (mandate), Tools (mandates ledger), receipt | | not started |
| W4 | The flight recorder: a sealed run replayed frame by frame with cost, fork, bisect, export | Run (sealed, compacted) | | not started |
| W5 | Proven, not claimed: the witness flipped on main and the PR; the agent saw only "pass" | Run (proof), witness run, Tools (assurance), Spend (proven) | | not started |
| W6 | It learned, you approved, it changed: record to proposal to Context PR to merge to the next run | Steering, Run, Agents (definition in git) | | not started |
| W8 | Every dollar, every operator: proven spend, findings ranked by money, wasted spend | Spend, Billing | | not started |
| W9 | The toolbelt, governed: only granted tools visible, no credentials held, approval rules and kill switches | Agents, Tools | | not started |
| W10 | The CIO's console: who can do what, where data lives, what happened, what can be proven, behind the firewall | Organization, Audit | | not started |
| W11 | Whose account it is: security, preferences, notifications, the command menu | Account dialog, notifications, command menu | | not started |
| W12 | Coverage audit: every page and state mocked | all | | not started |

**Page coverage.** Every row must carry at least one link before the section is complete.

| Page, panel, dialog, or flow | Route | States required | Mockup |
|---|---|---|---|
| Sign up, verify, log in, two-factor, forgot and reset, accept invite, create organization | `(auth)/*`, `(onboarding)/new-organization` | loaded, error, phone | |
| Onboarding gate (name, wrap, run) and installer screens | `/{org}` before unlock | loaded, waiting, unlocked, phone | |
| Fleet | `/{org}/{ws}` | loaded, empty (first run), loading, error, denied, phone | |
| Approvals panel | on Fleet and Run | loaded, empty, phone | |
| Run (live, sealed, compacted) | `/{org}/{ws}/runs/{run}` | loaded, loading, error, denied, phone | |
| Agents (list, detail, mandate detail) | `/{org}/{ws}/agents`, `/{agent}` | loaded, empty, error, denied, phone | |
| Tools (registry, connections, mandates, policy, kill switches, assurance) | `/{org}/{ws}/tools` | loaded, empty, error, denied, phone | |
| Steering (records, proposals, Context PR, retirement) | `/{org}/{ws}/steering` | loaded, empty, error, denied, phone | |
| Spend (findings, operator, agent, waterfall, reconciliation, budgets) | `/{org}/{ws}/spend` | loaded, empty, loading, error, denied, phone | |
| Organization | `/{org}` | loaded, denied, phone | |
| Billing | `/{org}/billing` | loaded, error, denied, phone | |
| Audit | `/{org}/audit` | loaded, empty, error, denied, phone | |
| Account dialog, notifications, command menu | user menu, top bar | loaded, phone | |
```
