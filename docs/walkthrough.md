# Oxagen, soup to nuts

This tour follows Oxagen in the order a new user meets it (sign-up, the onboarding gate, the first run) and then in the order an operator works in it every day (Work, a run, the agents and their tools, steering, runtimes, money, repositories, the organization). Each section says what the user does on a page and why, in a few sentences, and ends with its sources: the audit prompt and the demo prompt that produced the screen, the spec section that governs it, the plan section that builds it, and the mockup page with its hand-written page spec. The page specs in `mockups/pages/` and the documents in `docs/` hold the detail; this file links to them and does not repeat them. Every screen uses the same demo record: Anderson Intelligence Corp. (`a-intel`), workspace `core-platform`, operator Marcus Bell. The full design is [`mockups/missioncontrol.html`](../mockups/missioncontrol.html), the product build is [`?product=1`](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0) (phone: [`&mobile=1`](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1)), and [`mockups/catalog.mjs`](../mockups/catalog.mjs) maps every page in every state.

Scope decisions made after 2026-09-14 (the Ontology cut, Audit moved out of the first release, witness first, GAU billing) come from [the scope review](scope-review.md) and the spec's amendments, and `missioncontrol.html` still shows some screens that will not ship in that release (Audit, per-run Billing), as recorded in [the scale-back prompt](scale-back-prompt.md). The fleet operations wedge of 2026-09-24 made Work the workspace's home and cut the Fleet page, the frame player, fork replay, bisect, the mandate page and the skills console ([the wedge](fleet-operations-wedge.md), [what it cut](fleet-operations-collapse.md)).

---

## Part 1. First contact

### 1. Sign up

A new operator creates an account with SSO or with an email and password. The screen is the first of the sixty-seconds-to-governed path: sign up, verify the email, name the organization, wrap an agent, start a run. Submitting goes to email verification; SSO skips it and goes straight to naming the organization. Sign-in flows are not counted among the pages in the spec; they stay as the auth screens they are today.

Scenario: `sixty-seconds-to-governed` starts here ([W1](../mockups/missioncontrol.html#/a-intel/core-platform/scenarios/sixty-seconds-to-governed/1)), and walks sign-up through the onboarding gate to the first run, on Work under its direct work order.

**Sources** · Prompt: [signup.audit-prompt.md](../mockups/pages/signup.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed) · Spec: [Appendix F, sign-in flows](mission-control-spec.md#appendix-f-the-pages-that-survive) · Plan: [Batch 1, lane L5](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [Sign up](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/welcome/signup) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/welcome/signup)), [signup.md](../mockups/pages/signup.md)

### 2. Verify the email

The operator types the six-digit code sent to the work email, which is good for ten minutes. Sending a new code voids the old one. A correct code continues to naming the organization.

**Sources** · Prompt: [verify-email.audit-prompt.md](../mockups/pages/verify-email.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed) · Spec: [Appendix F, sign-in flows](mission-control-spec.md#appendix-f-the-pages-that-survive) · Plan: [Batch 1, lane L5](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [Verify email](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/welcome/verify) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/welcome/verify)), [verify-email.md](../mockups/pages/verify-email.md)

### 3. Log in and two-factor

A returning operator signs in with SSO, or with email and password followed by a six-digit code from an authenticator app. SSO lands directly on Work; the password path goes through two-factor first. Three wrong codes lock the account for fifteen minutes, and signing in is recorded like any other governed action.

**Sources (log in)** · Prompt: [login.audit-prompt.md](../mockups/pages/login.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed) · Spec: [Appendix F, sign-in flows](mission-control-spec.md#appendix-f-the-pages-that-survive) · Plan: [Batch 1, lane L5](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [Log in](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/welcome/login) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/welcome/login)), [login.md](../mockups/pages/login.md)

**Sources (two-factor)** · Prompt: [two-factor.audit-prompt.md](../mockups/pages/two-factor.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed) · Spec: [Appendix F, sign-in flows](mission-control-spec.md#appendix-f-the-pages-that-survive) · Plan: [Batch 1, lane L5](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [Two-factor](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/welcome/two-factor) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/welcome/two-factor)), [two-factor.md](../mockups/pages/two-factor.md)

### 4. Recover a password

An operator who has lost a password asks for a reset link, which is good for sixty minutes and works once. The sent state reads the same whether or not the address exists. Setting a new password from the link returns to log in and signs out every other device.

**Sources (forgot password)** · Prompt: [forgot-password.audit-prompt.md](../mockups/pages/forgot-password.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed) · Spec: [Appendix F, sign-in flows](mission-control-spec.md#appendix-f-the-pages-that-survive) · Plan: [Batch 1, lane L5](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [Forgot password](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/welcome/forgot) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/welcome/forgot)), [forgot-password.md](../mockups/pages/forgot-password.md)

**Sources (reset password)** · Prompt: [reset-password.audit-prompt.md](../mockups/pages/reset-password.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed) · Spec: [Appendix F, sign-in flows](mission-control-spec.md#appendix-f-the-pages-that-survive) · Plan: [Batch 1, lane L5](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [Reset password](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/welcome/reset) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/welcome/reset)), [reset-password.md](../mockups/pages/reset-password.md)

### 5. Accept an invitation

A person joining an organization someone else created sees who invited them, the organization and workspace roles on offer, the workspace's main repo, when the invitation expires, and what the workspace role does and does not allow. Accepting signs them in and lands on Work. Declining tells the inviter and changes nothing else.

**Sources** · Prompt: [accept-invitation.audit-prompt.md](../mockups/pages/accept-invitation.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed) · Spec: [Appendix F, sign-in flows](mission-control-spec.md#appendix-f-the-pages-that-survive) · Plan: [Batch 1, lane L5](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [Accept invitation](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/welcome/invite) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/welcome/invite)), [accept-invitation.md](../mockups/pages/accept-invitation.md)

### 6. Name the organization

The first of three gate steps after sign-up names the organization and its first workspace. The organization is the tenant: it owns its own encryption key, billing account, retention policy and the namespace inside every agent key. Continuing provisions the tenant and moves to wrapping an agent. The app stays locked until a first frame arrives, which is why these steps are a gate and have no app shell around them.

**Sources** · Prompt: [onboarding-organization.audit-prompt.md](../mockups/pages/onboarding-organization.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed) · Spec: [§5.1 Tenancy, the model](mission-control-spec.md#51-the-model) · Plan: [Batch 1, lane L5](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [Onboarding · Organization](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/welcome/organization) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/welcome/organization)), [onboarding-organization.md](../mockups/pages/onboarding-organization.md)

### 7. Wrap the first agent

The second gate step wraps the organization's first agent, and it is the same screen as step 2 of Register Agent with a different rail and Cancel target. The operator picks Claude Code, Codex or an SDK agent; wrapping installs the hooks and the `tachod` daemon, which puts the agent on the `harness` tier: steering is delivered and four of the five command hook events can refuse. The tier is client-attested, and it is fail-open against the person at the keyboard, who can remove the hook entry. The model proxy and the MCP aggregator that earn the `gateway` tier arrive with Phase 4 of the refactor path (spec §7.1, §17.2) and are not built yet. Nothing is pasted: the installer download carries the one-time enrollment token.

**Sources** · Prompt: [onboarding-wrap.audit-prompt.md](../mockups/pages/onboarding-wrap.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed) · Spec: [§7.2 Adapters and supported agents](mission-control-spec.md#72-adapters-and-supported-agents) · Plan: [Batch 1, lane L5](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [Onboarding · Wrap an agent](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/welcome/wrap) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/welcome/wrap)), [onboarding-wrap.md](../mockups/pages/onboarding-wrap.md)

### 8. Start the first run

The third gate step waits for the first frame, showing a live log and an auto-open countdown. The app opens the moment that frame reaches Oxagen and lands the operator on Work, on the direct work order that holds their own run. The installer reports the git remote it saw, and the operator either binds that repository as the workspace's main repo (one click, which installs the GitHub App) or skips and leaves the workspace provisional for a stated number of days; Work's provisional banner reverses the skip.

**Sources** · Prompt: [onboarding-run.audit-prompt.md](../mockups/pages/onboarding-run.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed) · Spec: [§10.1 Repositories](mission-control-spec.md#101-repositories-one-main-repo-any-number-of-linked-repos) · Plan: [Batch 1, lane L5](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel), [gap G16](implementation-plan.md#34-backend-gaps-not-app-work-but-the-apps-notbacked-states-point-at-them) · Page: [Onboarding · First run](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/welcome/run) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/welcome/run)), [onboarding-run.md](../mockups/pages/onboarding-run.md)

### 9. The installer

The signed installer package renders its own three screens: download (package, size, signature, checksum, token), install (what it writes: the collector and the hooks today, and the base URL once the gateway's loopback proxy ships in Phase 4, which is in build) and connected, with the uninstall command beside it. The mockup shows them so the whole path from sign-up to the first frame can be walked; the package draws them, and none of them writes to the app. Oxagen Desktop, the app that manages a machine after install, has its own spec.

**Sources** · Prompt: [installer.audit-prompt.md](../mockups/pages/installer.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed) · Spec: [§7.2 Adapters and supported agents](mission-control-spec.md#72-adapters-and-supported-agents), [Desktop spec §1](desktop-spec.md#1-what-rev-1-ships) · Plan: [Auth and onboarding gate row](implementation-plan.md#32-organization-pages-and-shell) (the package is outside `apps/app`) · Page: [Installer](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/welcome/installer) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/welcome/installer)), [installer.md](../mockups/pages/installer.md)

---

## Part 2. The daily loop

### 10. The shell around every page

Once unlocked, every page sits in one shell: a sidebar with organization and workspace switchers, the Workspace nav (Work, Agents, Tools, Steering, Runtimes, Spend, Repositories) and the Organization nav (Organization, Billing, Audit), a top bar with breadcrumbs, ⌘K search-or-run, notifications and the Approvals button, and an Account dialog from the user menu. A count sits beside a nav item only when something there waits on a person. On a phone the sidebar becomes a five-slot thumb bar (Work, Agents, Tools, Spend, More) with dialogs as bottom sheets. Stella, the in-app agent, is in scope for the first release (maintainer decisions, 2026-09-14 and 2026-09-15). It opens as a drawer from the foot of the sidebar, and each of its turns is a run of its own, acting through the same governed actions as the screens.

Scenario: `the-account` ([W11](../mockups/missioncontrol.html#/a-intel/core-platform/scenarios/the-account/1)) opens on Work and walks the Account dialog: how the operator signs in, preferences as governed actions, notifications, and the command menu as `search_tools`.

**Sources** · Prompt: [audit-prompt.md (whole app, shell)](../mockups/pages/audit-prompt.md), [W11 prompt](demo-mockup-prompts.md#w11-the-account) · Spec: [§14.1 Surfaces](mission-control-spec.md#141-surfaces), [§4.4, the in-app agent](mission-control-spec.md#44-onboarding-and-oxagens-own-model-calls), [the information architecture](fleet-operations-ia.md) · Plan: [Batch 1, lane L3](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [the product build](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0), [mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1)

### 11. Work

Work is the workspace's home. It answers what the agents should work on and what they are working on now. Backlog lists every open work item from GitHub, Linear or Jira with its readiness and the work order it is in, under four tiles: ready, drafts waiting on you, in work orders, and live now. A work item is ready when a person certifies the definition of done Oxagen drafted for it. Picking ready items and choosing **Create work order and send to agent** opens the work order: one brief that merges every definition of done, an editable prompt, and the repositories the agent may change. Every run is a child of one work order. A run started from an operator's own terminal is filed under a direct work order, so nothing live is missing from Work.

Scenarios: `sixty-seconds-to-governed` ends here, on the first run's direct work order ([W1](../mockups/missioncontrol.html#/a-intel/core-platform/scenarios/sixty-seconds-to-governed/6)); `every-dollar-every-operator` ends here too, picking up a finding ([W8](../mockups/missioncontrol.html#/a-intel/core-platform/scenarios/every-dollar-every-operator/1)).

**Sources** · Prompt: [work-backlog.audit-prompt.md](../mockups/pages/work-backlog.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed), [W8 prompt](demo-mockup-prompts.md#w8-every-dollar-every-operator) · Spec: [Work](fleet-operations-wedge.md#work), [Tasks spec §8](tasks-spec.md#8-the-definition-of-done) · Plan: [In the app](fleet-operations-collapse.md#in-the-app) · Page: [Work](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/work) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/work)), [work-backlog.md](../mockups/pages/work-backlog.md)

#### Intake

The Intake dialog opens from the Backlog header. It connects an issue tracker or a help desk in six steps, maps the provider's fields to the work item record, and maps its accounts to members, leaving any account it cannot match unmapped. It holds what were the Providers, Fields and People tabs.

**Sources** · Prompt: [work-intake.audit-prompt.md](../mockups/pages/work-intake.audit-prompt.md) · Spec: [Tasks spec §5](tasks-spec.md#5-connecting-a-provider), [§7 People](tasks-spec.md#7-people) · Plan: [In the app](fleet-operations-collapse.md#in-the-app) · Page: [Work · Intake](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/work?intake=providers) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/work?intake=providers)), [work-intake.md](../mockups/pages/work-intake.md)

#### A work item

A work item shows the item as its provider holds it, its definition of done and who certified it, the work orders it was sent in, and each one's runs.

**Sources** · Prompt: [work-item.audit-prompt.md](../mockups/pages/work-item.audit-prompt.md) · Spec: [Tasks spec §8](tasks-spec.md#8-the-definition-of-done), [Work](fleet-operations-wedge.md#work) · Plan: [In the app](fleet-operations-collapse.md#in-the-app) · Page: [Work item](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/work/items/tsk_01K5RS482Q) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/work/items/tsk_01K5RS482Q)), [work-item.md](../mockups/pages/work-item.md)

#### Work orders

Work orders lists every work order in the workspace, dispatched or direct, with its target, stage, runs, the items it claims, its state and its spend.

**Sources** · Prompt: [work-orders.audit-prompt.md](../mockups/pages/work-orders.audit-prompt.md), [W2 prompt](demo-mockup-prompts.md#w2-stop-it-steer-it) · Spec: [§9 Sending work](tasks-spec.md#9-sending-work), [Work](fleet-operations-wedge.md#work) · Plan: [In the app](fleet-operations-collapse.md#in-the-app) · Page: [Work orders](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/work/orders) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/work/orders)), [work-orders.md](../mockups/pages/work-orders.md)

#### A work order

A work order holds the stage chain, the definition of done with each claim and its evidence, the brief as sent, the SteeringFrames the send emitted, and the runs it started. When every item is claimed, the work order waits on you, and accepting the work is a person's step. It merges nothing.

Scenario: `stop-it-steer-it` opens on the work order of a live release run ([W2](../mockups/missioncontrol.html#/a-intel/core-platform/scenarios/stop-it-steer-it/1)), then pauses and steers the run.

**Sources** · Prompt: [work-order.audit-prompt.md](../mockups/pages/work-order.audit-prompt.md), [W2 prompt](demo-mockup-prompts.md#w2-stop-it-steer-it) · Spec: [§9 Sending work](tasks-spec.md#9-sending-work), [§11 Completing work](tasks-spec.md#11-completing-work) · Plan: [In the app](fleet-operations-collapse.md#in-the-app) · Page: [Work order](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/work/orders/wo_01K5RS7M4N) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/work/orders/wo_01K5RS7M4N)), [work-order.md](../mockups/pages/work-order.md)

#### Workflows

A workflow chains agents through stages, so a bug fixer hands to a validator and then to a documenter, and it ends with a person. A workflow is a file in the repository, and publishing one opens a pull request.

**Sources** · Prompt: [work-workflows.audit-prompt.md](../mockups/pages/work-workflows.audit-prompt.md) · Spec: [Tasks spec §10](tasks-spec.md#10-workflows) · Plan: [In the app](fleet-operations-collapse.md#in-the-app) · Page: [Work · Workflows](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/work/workflows) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/work/workflows)), [work-workflows.md](../mockups/pages/work-workflows.md)

#### Findings

A finding is money the record shows was lost, with the arithmetic behind it and the runs that evidence it. Creating a work item from a finding puts the fix in the backlog, where it goes to an agent like any other item.

**Sources** · Prompt: [work-findings.audit-prompt.md](../mockups/pages/work-findings.audit-prompt.md), [W8 prompt](demo-mockup-prompts.md#w8-every-dollar-every-operator) · Spec: [§12.8 Value](mission-control-spec.md#128-value-how-much-of-the-money-turned-into-progress), [Work](fleet-operations-wedge.md#work) · Plan: [In the app](fleet-operations-collapse.md#in-the-app) · Page: [Work · Findings](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/work/findings) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/work/findings)), [work-findings.md](../mockups/pages/work-findings.md)

### 12. A run

A run is the record of one execution, and its header and breadcrumb name its work order. It opens on the Decision trace: the envelope the agent received, by injection point and frame type; the frames excluded, each with a reason from a closed list; the tools and skills chosen and the rule that answered each call; the execution frames; the plan's versions when the harness records them; the agent's own statement of uncertainty when it reports one; and the evidence. The trace reads the record. It never claims to show hidden reasoning or every branch a model considered. The header carries Pause, Resume, Steer, Cancel and Export by the run's state, and every trust badge shows the recorded value and nothing stronger.

Scenarios: `stop-it-steer-it` reads its steer back as an `invocation` frame ([W2](../mockups/missioncontrol.html#/a-intel/core-platform/scenarios/stop-it-steer-it/1)); `learned-approved-changed` ends on the frame a merged record emitted ([W6](../mockups/missioncontrol.html#/a-intel/core-platform/scenarios/learned-approved-changed/1)).

**Sources** · Prompt: [run.audit-prompt.md](../mockups/pages/run.audit-prompt.md), [W2 prompt](demo-mockup-prompts.md#w2-stop-it-steer-it), [W6 prompt](demo-mockup-prompts.md#w6-it-learned-you-approved-it-changed) · Spec: [§8 Runs and frames](mission-control-spec.md#8-runs-and-frames), [Decision trace](fleet-operations-wedge.md#decision-trace) · Plan: [Batch 2, lanes P2a and P2b](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel), [data mapping](implementation-plan.md#31-workspace-pages) · Page: [Run](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW)), [run.md](../mockups/pages/run.md)

#### Transcript

The Transcript is the recorded conversation and calls, with search and kind filters. Thinking a provider returned is labelled as the provider's text. It is read, not played: every row is on the page at once.

**Sources** · Prompt: [run-transcript.audit-prompt.md](../mockups/pages/run-transcript.audit-prompt.md) · Spec: [§8 Runs and frames](mission-control-spec.md#8-runs-and-frames), [Decision trace](fleet-operations-wedge.md#decision-trace) · Plan: [Batch 2, lanes P2a and P2b](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Run · Transcript](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/transcript) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/transcript)), [run-transcript.md](../mockups/pages/run-transcript.md)

#### Cost

Cost shows the run's tokens by class with each class's basis, spend by area, the per-turn waterfall, and whether the model fit the work.

**Sources** · Prompt: [run-cost.audit-prompt.md](../mockups/pages/run-cost.audit-prompt.md) · Spec: [§12.6 Token accounting](mission-control-spec.md#126-token-accounting-on-every-model-call), [§12 Cost](mission-control-spec.md#12-cost-accounted-to-the-token-attributed-to-the-operator-charged-on-two-meters) · Plan: [Batch 2, lanes P2a and P2b](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Run · Cost](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/cost) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/cost)), [run-cost.md](../mockups/pages/run-cost.md)

#### Evidence

Evidence holds the outputs, the issues the run touched, the definition-of-done claims, the approvals decided, and the chain and seal, which verify offline.

**Sources** · Prompt: [run-evidence.audit-prompt.md](../mockups/pages/run-evidence.audit-prompt.md) · Spec: [§8 Runs and frames](mission-control-spec.md#8-runs-and-frames), [Decision trace](fleet-operations-wedge.md#decision-trace) · Plan: [Batch 2, lanes P2a and P2b](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Run · Evidence](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/evidence) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/evidence)), [run-evidence.md](../mockups/pages/run-evidence.md)

### 13. A run stopped on an interjection

A run that starts in a repository no workspace owns, with skills on, has a config to resolve and nothing to resolve it against, so Oxagen stops the loop before the first model call and puts the question to a person through the agent. The run page shows the moment from three sides: the agent's own window, Oxagen's card with the two paths (link the repository to an existing workspace, or create a new one) and their consequences, and the frames still to come. Either answer is a governed action, and an unanswered interjection times out to `deny` at thirty minutes. The Approvals drawer lists it with **Answer it**. The spec does not describe interjection yet; the W13 scenario doc carries it, and W13 itself retired with the skills console.

**Sources** · Prompt: [run-interjection.audit-prompt.md](../mockups/pages/run-interjection.audit-prompt.md) · Spec: [W13, where this sits against the spec](w13-in-the-loop-scenario.md#where-this-sits-against-the-spec), [§7.3 Steering into the loop](mission-control-spec.md#73-steering-into-the-loop) · Plan: none yet, the interjection postdates the [Batch 2 lanes](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Run · interjection](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/runs/run_01K6QW3D5N7TYBA2) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/runs/run_01K6QW3D5N7TYBA2)), [run-interjection.md](../mockups/pages/run-interjection.md)

### 14. Approvals and Stella

Approvals is a drawer, opened from the shield button in the top bar on every page, with the count of everything waiting on you across the organization. It lists every call parked for a person and every open interjection, and each row names the run's work order. Picking one opens the same approval card the run shows: the four-hop chain (who asked, which agent, which action, which rule), the rules that fired, the mandate bar and a live countdown. Approving mints a single-use token bound to that exact call, and a timed-out approval never dispatches.

Stella opens as a drawer from the foot of the sidebar. It reads the page it was opened from, so on a run it answers from that run's Decision trace, and its changes go through the same governed actions a person uses.

Scenario: `money-asked` starts in the `finops` workspace ([W3](../mockups/missioncontrol.html#/a-intel/finops/scenarios/money-asked/1)), a payment above its mandate parked for a person and answered from the drawer.

**Sources (approvals)** · Prompt: [approvals-drawer.audit-prompt.md](../mockups/pages/approvals-drawer.audit-prompt.md), [W3 prompt](demo-mockup-prompts.md#w3-money-asked-a-human-answered) · Spec: [§7.5 Human approval](mission-control-spec.md#75-human-approval), [§6.9 Safety classification, approval rules, auto-approval, and mandates](mission-control-spec.md#69-safety-classification-approval-rules-auto-approval-and-mandates) · Plan: [Batch 1, lane L3](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [Approvals drawer](../mockups/missioncontrol.html?product=1&state=loaded&drawer=approvals&mobile=0#/a-intel/core-platform/work) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&drawer=approvals&mobile=1#/a-intel/core-platform/work)), [approvals-drawer.md](../mockups/pages/approvals-drawer.md)

**Sources (Stella)** · Prompt: [stella-drawer.audit-prompt.md](../mockups/pages/stella-drawer.audit-prompt.md) · Spec: [§4.4, the in-app agent](mission-control-spec.md#44-onboarding-and-oxagens-own-model-calls), [§14.1 Surfaces](mission-control-spec.md#141-surfaces) · Plan: [Batch 1, lane L3](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [Stella drawer](../mockups/missioncontrol.html?product=1&state=loaded&drawer=stella&mobile=0#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&drawer=stella&mobile=1#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW)), [stella-drawer.md](../mockups/pages/stella-drawer.md)

### 15. Agents

Agents is the fleet as one population. Tiles show live runs, what waits on you, spend against budget, and the delegations held. The roster lists every agent identity with a Composition and an Operations column set. Identity lives in Postgres and the definition lives in git, joined by the agent key and the definition digest. From here an operator steers one agent or the whole fleet, registers an agent, and retires one, which retires the principal so its runs keep their identity.

**Sources** · Prompt: [agents.audit-prompt.md](../mockups/pages/agents.audit-prompt.md), [W2 prompt](demo-mockup-prompts.md#w2-stop-it-steer-it), [W9 prompt](demo-mockup-prompts.md#w9-the-toolbelt-governed) · Spec: [§6.2 Agent identity and credentials](mission-control-spec.md#62-agent-identity-and-credentials), [§7.4 Halting and commands](mission-control-spec.md#74-halting-and-commands) · Plan: [Batch 2, lane P3](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel), [data mapping](implementation-plan.md#31-workspace-pages) · Page: [Agents](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/agents) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/agents)), [agents.md](../mockups/pages/agents.md)

### 16. One agent

An agent's page answers what it is and what it may reach. Overview shows its composition, its current work, its tokens, and the changes the record recommends. Rotating the credential or suspending the agent kills every live run token at the next call, and both land in the audit record.

Scenario: `toolbelt-governed` starts on the Toolbelt tab ([W9](../mockups/missioncontrol.html#/a-intel/core-platform/scenarios/toolbelt-governed/1)), then walks the credential the agent never holds and a policy change simulated before it is switched on.

**Sources** · Prompt: [agent.audit-prompt.md](../mockups/pages/agent.audit-prompt.md), [W9 prompt](demo-mockup-prompts.md#w9-the-toolbelt-governed) · Spec: [§6.2 Agent identity and credentials](mission-control-spec.md#62-agent-identity-and-credentials) · Plan: [Batch 2, lane P3](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel), [data mapping](implementation-plan.md#31-workspace-pages) · Page: [Agent](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/agents/triage) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/agents/triage)), [agent.md](../mockups/pages/agent.md)

#### Identity

Identity holds the principal and the credentials. The agent holds no provider credential, only one run token, and that token reaches Oxagen and nothing else.

**Sources** · Prompt: [agent-identity.audit-prompt.md](../mockups/pages/agent-identity.audit-prompt.md) · Spec: [§6.2 Agent identity and credentials](mission-control-spec.md#62-agent-identity-and-credentials) · Plan: [Batch 2, lane P3](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Agent · Identity](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/agents/triage/identity) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/agents/triage/identity)), [agent-identity.md](../mockups/pages/agent-identity.md)

#### Steering

An agent's Steering tab shows the SteeringFrames it receives, by type, and the sources they come from. The same resolver builds the Compiler and every run's Decision trace, so the three agree.

**Sources** · Prompt: [agent-steering.audit-prompt.md](../mockups/pages/agent-steering.audit-prompt.md) · Spec: [Steering](fleet-operations-wedge.md#steering), [§10.5 The assembler contract](mission-control-spec.md#105-the-assembler-contract) · Plan: [Batch 2, lane P3](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Agent · Steering](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/agents/release-manager/steering) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/agents/release-manager/steering)), [agent-steering.md](../mockups/pages/agent-steering.md)

#### Toolbelt

The toolbelt is the belt exactly as the model receives it, with each tool's decision and the rule behind it, and what is off the belt. It is computed at run start from grants and policy, and a searchable belt shows the `search_tools` view.

**Sources** · Prompt: [agent-toolbelt.audit-prompt.md](../mockups/pages/agent-toolbelt.audit-prompt.md), [W9 prompt](demo-mockup-prompts.md#w9-the-toolbelt-governed) · Spec: [§6.6 The toolbelt and how a model sees it](mission-control-spec.md#66-the-toolbelt-and-how-a-model-sees-it) · Plan: [Batch 2, lane P3](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Agent · Toolbelt](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/agents/triage/toolbelt) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/agents/triage/toolbelt)), [agent-toolbelt.md](../mockups/pages/agent-toolbelt.md)

#### Runtime

Runtime shows the host the agent runs on, its harness, its hooks and proxy, and the tier they earn.

**Sources** · Prompt: [agent-runtime.audit-prompt.md](../mockups/pages/agent-runtime.audit-prompt.md) · Spec: [§7.1 The three seams](mission-control-spec.md#71-the-three-seams), [§7.2 Adapters and supported agents](mission-control-spec.md#72-adapters-and-supported-agents) · Plan: [Batch 2, lane P3](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Agent · Runtime](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/agents/triage/runtime) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/agents/triage/runtime)), [agent-runtime.md](../mockups/pages/agent-runtime.md)

#### Permissions

Permissions holds the agent's roles, its budgets, and Delegation. A mandate is delegated financial authority: per-call and per-period limits, what has been settled and reserved, the grant that created it, and the reconciliation of every draw to a receipt. Each mandate appears under Delegation with the delegation frames it emits, and the old mandate address lands there.

Scenario: `money-asked` reads the mandate as Delegation ([W3](../mockups/missioncontrol.html#/a-intel/finops/scenarios/money-asked/1)).

**Sources** · Prompt: [agent-permissions.audit-prompt.md](../mockups/pages/agent-permissions.audit-prompt.md), [W3 prompt](demo-mockup-prompts.md#w3-money-asked-a-human-answered) · Spec: [§6.9 Safety classification, approval rules, auto-approval, and mandates](mission-control-spec.md#69-safety-classification-approval-rules-auto-approval-and-mandates) · Plan: [Batch 2, lane P3](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel), [gap G1](implementation-plan.md#34-backend-gaps-not-app-work-but-the-apps-notbacked-states-point-at-them) · Page: [Agent · Permissions](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/finops/agents/invoice-bot/permissions) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/finops/agents/invoice-bot/permissions)), [agent-permissions.md](../mockups/pages/agent-permissions.md)

#### Activity

Activity lists the work orders the agent worked, their runs, its tamper incidents, and its accounting.

**Sources** · Prompt: [agent-activity.audit-prompt.md](../mockups/pages/agent-activity.audit-prompt.md) · Spec: [§6.2 Agent identity and credentials](mission-control-spec.md#62-agent-identity-and-credentials), [§12 Cost](mission-control-spec.md#12-cost-accounted-to-the-token-attributed-to-the-operator-charged-on-two-meters) · Plan: [Batch 2, lane P3](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Agent · Activity](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/agents/triage/activity) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/agents/triage/activity)), [agent-activity.md](../mockups/pages/agent-activity.md)

### 17. The agent's source

The agent's definition file, `.oxagen/agents/<slug>.toml`, opens in a source editor. Every field on the agent's pages is a view of this file. Saving opens a pull request, and nothing is written to Postgres.

**Sources** · Prompt: [agent-source.audit-prompt.md](../mockups/pages/agent-source.audit-prompt.md), [W6 prompt](demo-mockup-prompts.md#w6-it-learned-you-approved-it-changed) · Spec: [§10.2 On-disk layout](mission-control-spec.md#102-on-disk-layout-oxagen) · Plan: [Batch 2, lane P3](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel), [data mapping](implementation-plan.md#31-workspace-pages) · Page: [Agent source](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/agents/release-manager/source) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/agents/release-manager/source)), [agent-source.md](../mockups/pages/agent-source.md)

### 18. Tools

Tools governs everything an agent can call, in five tabs. Tools is the registry of servers, tool versions, schemas and safety classification, and a tool is `name@schema-version` everywhere it appears.

**Sources** · Prompt: [tools.audit-prompt.md](../mockups/pages/tools.audit-prompt.md), [W9 prompt](demo-mockup-prompts.md#w9-the-toolbelt-governed) · Spec: [§6.4 Tools: RBAC to the tool version](mission-control-spec.md#64-tools-rbac-to-the-tool-version-schemas-on-both-sides) · Plan: [Batch 2, lane P4](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel), [data mapping](implementation-plan.md#31-workspace-pages) · Page: [Tools](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/tools) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/tools)), [tools.md](../mockups/pages/tools.md)

#### Toolbelts

A toolbelt is a named set of tool versions assigned to agents, and it decides what a model is shown. Each belt lists its tools, its providers, the agents assigned, the gates on its tools, and whether every version is reachable today.

**Sources** · Prompt: [tools-toolbelts.audit-prompt.md](../mockups/pages/tools-toolbelts.audit-prompt.md) · Spec: [§6.6 The toolbelt and how a model sees it](mission-control-spec.md#66-the-toolbelt-and-how-a-model-sees-it) · Plan: [Batch 2, lane P4](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Tools · Toolbelts](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/tools/toolbelts) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/tools/toolbelts)), [tools-toolbelts.md](../mockups/pages/tools-toolbelts.md)

#### Providers

A provider is the system a set of tools belongs to, with the transport Oxagen reaches it by, its connection, and how each call is authorized.

**Sources** · Prompt: [tools-providers.audit-prompt.md](../mockups/pages/tools-providers.audit-prompt.md) · Spec: [§6.4 Tools: RBAC to the tool version](mission-control-spec.md#64-tools-rbac-to-the-tool-version-schemas-on-both-sides) · Plan: [Batch 2, lane P4](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Tools · Providers](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/tools/providers) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/tools/providers)), [tools-providers.md](../mockups/pages/tools-providers.md)

#### Policy

Policy is deterministic and versioned, and it owns every gate. A draft is tested before it is switched on, and each gate's notice reaches Steering as a constraint frame from a policy source.

**Sources** · Prompt: [tools-policy.audit-prompt.md](../mockups/pages/tools-policy.audit-prompt.md) · Spec: [§6.9 Safety classification, approval rules, auto-approval, and mandates](mission-control-spec.md#69-safety-classification-approval-rules-auto-approval-and-mandates) · Plan: [Batch 2, lane P4](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Tools · Policy](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/tools/policy) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/tools/policy)), [tools-policy.md](../mockups/pages/tools-policy.md)

#### Kill switches

A kill switch denies by agent, device or operator. Every flip records who, when and why, and the switches that ship with the workspace cannot be removed.

**Sources** · Prompt: [tools-switches.audit-prompt.md](../mockups/pages/tools-switches.audit-prompt.md) · Spec: [§7.4 Halting and commands](mission-control-spec.md#74-halting-and-commands) · Plan: [Batch 2, lane P4](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Tools · Kill switches](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/tools/switches) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/tools/switches)), [tools-switches.md](../mockups/pages/tools-switches.md)

### 19. Steering

Steering is everything that can steer an agent. Sources lists every Steering Source in one list with a kind filter: Steering records, documents, skills, agent definitions, instructions, glossary terms, memory, policy, mandates and toolbelts. A source is durable material with a version and a hash. At runtime the assembler resolves sources into SteeringFrames of eight types (goal, invariant, constraint, delegation, procedure, context, invocation and capability), and every frame keeps its source, version and hash. The header carries the governance mode and the skills setting.

Scenario: `learned-approved-changed` starts on Sources ([W6](../mockups/missioncontrol.html#/a-intel/core-platform/scenarios/learned-approved-changed/1)), from a learned rule to a merged pull request to the next model call carrying it.

**Sources** · Prompt: [steering.audit-prompt.md](../mockups/pages/steering.audit-prompt.md), [W6 prompt](demo-mockup-prompts.md#w6-it-learned-you-approved-it-changed) · Spec: [Steering](fleet-operations-wedge.md#steering), [§10.5 The assembler contract](mission-control-spec.md#105-the-assembler-contract), [§10.7 One screen](mission-control-spec.md#107-one-screen-steering-is-the-hub) · Plan: [§8 the refactor path](implementation-plan.md#8-the-steering-and-gateway-refactor-path-2026-09-18), [Batch 2, lane P5](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel), [data mapping](implementation-plan.md#31-workspace-pages) · Page: [Steering](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/steering) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/steering)), [steering.md](../mockups/pages/steering.md)

#### A source

A source page shows the file or record, its versions, the frames it emits with their types and hashes, its assignments, the runs that received its frames, and its pull requests. Editing it opens a pull request.

**Sources** · Prompt: [steering-source.audit-prompt.md](../mockups/pages/steering-source.audit-prompt.md), [W6 prompt](demo-mockup-prompts.md#w6-it-learned-you-approved-it-changed) · Spec: [Steering](fleet-operations-wedge.md#steering), [§10.3 Context PR lifecycle](mission-control-spec.md#103-context-pr-lifecycle) · Plan: [Batch 2, lane P5](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Steering source](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/steering/sources/record/ctx.release.notes-format) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/steering/sources/record/ctx.release.notes-format)), [steering-source.md](../mockups/pages/steering-source.md)

#### A skill

A skill is a bundle: its instructions, its references, and its entrypoints. Each entrypoint becomes a capability frame that describes it, and Oxagen never runs it.

**Sources** · Prompt: [steering-source-skill.audit-prompt.md](../mockups/pages/steering-source-skill.audit-prompt.md) · Spec: [§10.6 Skills are steering, and they are files](mission-control-spec.md#106-skills-are-steering-and-they-are-files), [Steering](fleet-operations-wedge.md#steering) · Plan: [Batch 2, lane P5](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Steering source · skill](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/steering/sources/skill/a-intel.release-notes-from-prs) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/steering/sources/skill/a-intel.release-notes-from-prs)), [steering-source-skill.md](../mockups/pages/steering-source-skill.md)

#### Assignments

Assignments shows which sources reach which agents, by scope, with the frame count by type.

**Sources** · Prompt: [steering-assignments.audit-prompt.md](../mockups/pages/steering-assignments.audit-prompt.md) · Spec: [Steering](fleet-operations-wedge.md#steering) · Plan: [Batch 2, lane P5](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Steering · Assignments](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/steering/assignments) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/steering/assignments)), [steering-assignments.md](../mockups/pages/steering-assignments.md)

#### Compiler

The Compiler takes an agent and a brief and shows the envelope the assembler would build: the frames selected, by injection point and type, the exclusions with their reasons, and the budget. It sends nothing.

**Sources** · Prompt: [steering-compiler.audit-prompt.md](../mockups/pages/steering-compiler.audit-prompt.md), [W6 prompt](demo-mockup-prompts.md#w6-it-learned-you-approved-it-changed) · Spec: [§10.5 The assembler contract](mission-control-spec.md#105-the-assembler-contract), [Steering](fleet-operations-wedge.md#steering) · Plan: [§8 the refactor path](implementation-plan.md#8-the-steering-and-gateway-refactor-path-2026-09-18) · Page: [Steering · Compiler](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/steering/compiler/release-manager) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/steering/compiler/release-manager)), [steering-compiler.md](../mockups/pages/steering-compiler.md)

#### Proposals

Proposals are candidates from memory, findings, steers and people, each with its support. Accepting one opens a Steering record pull request.

**Sources** · Prompt: [steering-proposals.audit-prompt.md](../mockups/pages/steering-proposals.audit-prompt.md), [W6 prompt](demo-mockup-prompts.md#w6-it-learned-you-approved-it-changed) · Spec: [§10.3 Context PR lifecycle](mission-control-spec.md#103-context-pr-lifecycle) · Plan: [Batch 2, lane P5](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Steering · Proposals](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/steering/proposals) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/steering/proposals)), [steering-proposals.md](../mockups/pages/steering-proposals.md)

#### Pull requests

Open Steering record pull requests with their six checks. Merge is on when every check passed, and the merge is the publication.

**Sources** · Prompt: [steering-prs.audit-prompt.md](../mockups/pages/steering-prs.audit-prompt.md), [W6 prompt](demo-mockup-prompts.md#w6-it-learned-you-approved-it-changed) · Spec: [§10.3 Context PR lifecycle](mission-control-spec.md#103-context-pr-lifecycle) · Plan: [Batch 2, lane P5](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Steering · Pull requests](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/steering/proposals/prs) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/steering/proposals/prs)), [steering-prs.md](../mockups/pages/steering-prs.md)

### 20. Runtimes

Runtimes lists the hosts enrolled in the workspace with their health. One host shows the agents on it, their harnesses and hooks, and the tier its seam earns: `observe`, `harness`, `gateway` or `contained`, computed from what was actually routed.

**Sources** · Prompt: [runtimes.audit-prompt.md](../mockups/pages/runtimes.audit-prompt.md) · Spec: [§7.1 The three seams](mission-control-spec.md#71-the-three-seams), [§7.2 Adapters and supported agents](mission-control-spec.md#72-adapters-and-supported-agents) · Plan: [Batch 2, lane P3](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Runtimes](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/runtimes) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/runtimes)), [runtimes.md](../mockups/pages/runtimes.md)

#### One runtime

**Sources** · Prompt: [runtime.audit-prompt.md](../mockups/pages/runtime.audit-prompt.md) · Spec: [§7.1 The three seams](mission-control-spec.md#71-the-three-seams) · Plan: [Batch 2, lane P3](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Runtime](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/runtimes/mbell-mbp-16) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/runtimes/mbell-mbp-16)), [runtime.md](../mockups/pages/runtime.md)

### 21. Spend

Spend answers what the tokens bought. Overview has tiles, the month by day, and one table grouped by work order, operator, agent, model, tool or cost center. Picking a row opens its side panel, and there is no drill page. Every figure carries its basis: `gateway_observed` when the gateway's proxy counted it, `client_attested` otherwise.

Scenario: `every-dollar-every-operator` starts here ([W8](../mockups/missioncontrol.html#/a-intel/core-platform/scenarios/every-dollar-every-operator/1)), grouping spend by work order, operator and agent before it reads the operator habits.

**Sources** · Prompt: [spend.audit-prompt.md](../mockups/pages/spend.audit-prompt.md), [W8 prompt](demo-mockup-prompts.md#w8-every-dollar-every-operator) · Spec: [§12 Cost](mission-control-spec.md#12-cost-accounted-to-the-token-attributed-to-the-operator-charged-on-two-meters), [§12.6 Token accounting](mission-control-spec.md#126-token-accounting-on-every-model-call) · Plan: [Batch 2, lane P6](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel), [data mapping](implementation-plan.md#31-workspace-pages) · Page: [Spend](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/spend) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/spend)), [spend.md](../mockups/pages/spend.md)

#### Budgets

Budgets lists every budget by scope, period and mode, with its position against the limit.

**Sources** · Prompt: [spend-budgets.audit-prompt.md](../mockups/pages/spend-budgets.audit-prompt.md) · Spec: [§12.5 Budgets](mission-control-spec.md#125-budgets) · Plan: [Batch 2, lane P6](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Spend · Budgets](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/spend/budgets) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/spend/budgets)), [spend-budgets.md](../mockups/pages/spend-budgets.md)

#### Optimization

Optimization shows wasted spend by cause, token composition and cache, recommendations for agents, and operator habits from the recorded turns, each written as a rule the operator can adopt. It reports what the record shows and never ranks or scores a person.

**Sources** · Prompt: [spend-optimization.audit-prompt.md](../mockups/pages/spend-optimization.audit-prompt.md), [W8 prompt](demo-mockup-prompts.md#w8-every-dollar-every-operator) · Spec: [§12.8 Value](mission-control-spec.md#128-value-how-much-of-the-money-turned-into-progress), [§12.6 Token accounting](mission-control-spec.md#126-token-accounting-on-every-model-call) · Plan: [Batch 2, lane P6](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel) · Page: [Spend · Optimization](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/spend/optimization) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/spend/optimization)), [spend-optimization.md](../mockups/pages/spend-optimization.md)

### 22. Repositories

Repositories lists the repositories the workspace governs, its main repo first, with each one's `.oxagen/` state. A repository without the directory has nowhere to publish a Steering record, so it offers to add it by pull request.

**Sources** · Prompt: [repositories.audit-prompt.md](../mockups/pages/repositories.audit-prompt.md) · Spec: [§10.1 Repositories](mission-control-spec.md#101-repositories-one-main-repo-any-number-of-linked-repos), [§10.2 On-disk layout](mission-control-spec.md#102-on-disk-layout-oxagen) · Plan: [data mapping](implementation-plan.md#31-workspace-pages) · Page: [Repositories](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/repositories) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/repositories)), [repositories.md](../mockups/pages/repositories.md)

#### Working copies

Working copies are the checkouts on operators' machines linked to the workspace. The link is a gitignored file, so it is never reviewed or merged.

**Sources** · Prompt: [repositories-copies.audit-prompt.md](../mockups/pages/repositories-copies.audit-prompt.md) · Spec: [§10.2 On-disk layout](mission-control-spec.md#102-on-disk-layout-oxagen) · Plan: [data mapping](implementation-plan.md#31-workspace-pages) · Page: [Repositories · Working copies](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/repositories/working-copies) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/repositories/working-copies)), [repositories-copies.md](../mockups/pages/repositories-copies.md)

#### Changes

Changes lists the pull requests Oxagen opened, Steering record pull requests among them, with their checks. Every creation wizard ends here.

**Sources** · Prompt: [repositories-changes.audit-prompt.md](../mockups/pages/repositories-changes.audit-prompt.md) · Spec: [§10.3 Context PR lifecycle](mission-control-spec.md#103-context-pr-lifecycle) · Plan: [data mapping](implementation-plan.md#31-workspace-pages) · Page: [Repositories · Changes](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/repositories/changes) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/repositories/changes)), [repositories-changes.md](../mockups/pages/repositories-changes.md)

#### Configuration

Configuration shows `.oxagen/workspace.toml` and the governance file. A change to either is a pull request.

**Sources** · Prompt: [repositories-config.audit-prompt.md](../mockups/pages/repositories-config.audit-prompt.md) · Spec: [§10.2 On-disk layout](mission-control-spec.md#102-on-disk-layout-oxagen) · Plan: [data mapping](implementation-plan.md#31-workspace-pages) · Page: [Repositories · Configuration](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/repositories/configuration) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/repositories/configuration)), [repositories-config.md](../mockups/pages/repositories-config.md)

### 23. Organization

The Organization page is the tenant's administration: people, roles, invitations, workspaces, model funding and routes for Oxagen's own model work, the data plane, and API keys. A workspace owns one main repo, one steering set, its agents, tool grants and budgets, and a workspace with no main repo stays provisional. Changing a role is a governed action that passes IAM and writes an audit record, the same path the in-app agent takes. The first release leaves out SSO and SCIM.

Scenario: `cio-console` starts here on People ([W10](../mockups/missioncontrol.html#/a-intel/core-platform/scenarios/cio-console/1)), then walks workspaces, funding, the data plane and Audit.

**Sources** · Prompt: [organization.audit-prompt.md](../mockups/pages/organization.audit-prompt.md), [W10 prompt](demo-mockup-prompts.md#w10-the-cios-console) · Spec: [§5 Tenancy and isolation](mission-control-spec.md#5-tenancy-and-isolation) · Plan: [Batch 2, lane P7](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel), [data mapping](implementation-plan.md#32-organization-pages-and-shell) · Page: [Organization](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel)), [organization.md](../mockups/pages/organization.md)

#### Roles

The Roles route opens the organization page on its Roles tab: every role with its kind, scope, permissions, holders and origin, and the role editor. Built-in roles are read-only and Duplicate is the way to a custom one. A role can never grant more than the delegation ceiling of the person assigning it.

**Sources** · Prompt: [organization-roles.audit-prompt.md](../mockups/pages/organization-roles.audit-prompt.md), [W10 prompt](demo-mockup-prompts.md#w10-the-cios-console) · Spec: [§6.3 Roles and grants](mission-control-spec.md#63-roles-and-grants) · Plan: [Batch 2, lane P7](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel), [data mapping](implementation-plan.md#32-organization-pages-and-shell) · Page: [Organization · Roles](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/roles) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/roles)), [organization-roles.md](../mockups/pages/organization-roles.md)

#### API keys

The API keys route opens the organization page on its keys tab: keys minted for service principals, what each may do, who created it, when it was last used and when it expires. Each key is bound to a service principal with explicit grants, and create, rotate and revoke are governed actions with audit records.

**Sources** · Prompt: [organization-api-keys.audit-prompt.md](../mockups/pages/organization-api-keys.audit-prompt.md), [W10 prompt](demo-mockup-prompts.md#w10-the-cios-console) · Spec: [§6.1 Principals](mission-control-spec.md#61-principals) · Plan: [Batch 2, lane P7](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel), [data mapping](implementation-plan.md#32-organization-pages-and-shell) · Page: [Organization · API keys](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/api-keys) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/api-keys)), [organization-api-keys.md](../mockups/pages/organization-api-keys.md)

### 24. Billing

Billing is readable by a finance role and shows the plan, this period's lines, the meters and the invoices, with a row opening the Stripe-hosted invoice and Change plan going to Stripe checkout. Billing charges on two meters ([spec §12.1](mission-control-spec.md#121-what-is-tracked-and-what-is-priced); 2026-09-15, maintainer decision). Governed actions are priced in governed action units on one price list (maintainer decisions of 2026-09-14, reaffirmed 2026-09-15): $5 per 1,000 GAU list, a monthly allowance of 5,000 GAU on Free, 50,000 on Build at $199 and 300,000 on Scale at $999, 5,000-GAU blocks at $25, and Enterprise negotiated per contract, with every feature on every tier. The page prints the customer's contracted rate, and `resolve_approval` is the only billable governed action. In-app AI usage, the in-app agent's model calls, is priced in usage credits: 1 credit = $0.01, debited at provider cost times the meter markup, funded by the $5 signup grant and topped up with credit packs. Tokens are not passed through at cost. Proven spend is a report figure. The mockup still prints the proven-run price list, which the spec no longer carries. The customer-spend accounting on Spend is unchanged. The billing decisions of 2026-09-15 (the two meters, credit packs for usage credits, negotiated enterprise with every feature on for every tier, invoice billing, the Build and Scale upgrade through Stripe Checkout, suspension) are in [spec §12.10](mission-control-spec.md#1210-billing-decisions-of-2026-09-15).

**Sources** · Prompt: [billing.audit-prompt.md](../mockups/pages/billing.audit-prompt.md), [W8 prompt](demo-mockup-prompts.md#w8-every-dollar-every-operator) · Spec: [§12.1 What is tracked, and what is priced](mission-control-spec.md#121-what-is-tracked-and-what-is-priced) · Plan: [Batch 2, lane P8](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel), [gap G13](implementation-plan.md#34-backend-gaps-not-app-work-but-the-apps-notbacked-states-point-at-them) · Page: [Billing](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/billing) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/billing)), [billing.md](../mockups/pages/billing.md)

### 25. Audit

Audit is the organization's record, written by the kernel and never by an agent: control-plane events, incidents, receipt search, legal holds, signed exports with a verifier, keys and KEK rotation, assurance results, retention and erasure. Every governed action lands here with who, what, result and a reference to its frame or record, and a denial is recorded and costs nothing. The first release does not ship the Audit page; the write-once archive at seal time stays, and the page sits in the "Already built" group.

**Sources** · Prompt: [audit.audit-prompt.md](../mockups/pages/audit.audit-prompt.md), [W10 prompt](demo-mockup-prompts.md#w10-the-cios-console) · Spec: [§13 Audit, retention, and the fidelity call](mission-control-spec.md#13-audit-retention-and-the-fidelity-call) · Plan: [Batch 2, lane P9](implementation-plan.md#batch-2-pages-on-fixtures-10-lanes-in-parallel), [data mapping](implementation-plan.md#32-organization-pages-and-shell) · Page: [Audit](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/audit) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/audit)), [audit.md](../mockups/pages/audit.md)

### 26. Register another agent

Every later agent arrives through Register Agent, opened from Agents, which reuses the onboarding gate's wrap and first-frame components in three steps. Step 1 reserves the agent key, which is immutable once the first frame arrives. Step 2 wraps the agent with the harness chosen in step 1, and the installer carries the enrollment token. Step 3 waits for the first frame; registration completes when it arrives, the smoke session opens the Context PR that adds the agent's definition file, and the operator lands on Fleet looking at its run.

**Sources (name)** · Prompt: [register-name.audit-prompt.md](../mockups/pages/register-name.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed) · Spec: [§6.2 Agent identity and credentials](mission-control-spec.md#62-agent-identity-and-credentials) · Plan: [Batch 1, lane L5](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [Register agent · Name](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/register/name) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/register/name)), [register-name.md](../mockups/pages/register-name.md)

**Sources (wrap)** · Prompt: [register-wrap.audit-prompt.md](../mockups/pages/register-wrap.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed) · Spec: [§7.2 Adapters and supported agents](mission-control-spec.md#72-adapters-and-supported-agents) · Plan: [Batch 1, lane L5](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [Register agent · Wrap](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/register/wrap) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/register/wrap)), [register-wrap.md](../mockups/pages/register-wrap.md)

**Sources (first frame)** · Prompt: [register-run.audit-prompt.md](../mockups/pages/register-run.audit-prompt.md), [W1 prompt](demo-mockup-prompts.md#w1-sixty-seconds-to-governed) · Spec: [§8.1 Run](mission-control-spec.md#81-run) · Plan: [Batch 1, lane L5](implementation-plan.md#batch-1-foundations-5-lanes-in-parallel) · Page: [Register agent · First run](../mockups/missioncontrol.html?product=1&state=loaded&mobile=0#/a-intel/core-platform/register/run) ([mobile](../mockups/missioncontrol.html?product=1&state=loaded&mobile=1#/a-intel/core-platform/register/run)), [register-run.md](../mockups/pages/register-run.md)

---

## Checking a build against this tour

[`mockups/pages/audit-prompt.md`](../mockups/pages/audit-prompt.md) audits a whole build (shell, mobile shell, auth sequences, cross-cutting rules) and runs every per-page prompt linked above. [Spec §19](mission-control-spec.md#19-demo-wow-scenarios) lists each scenario with the pages it covers and every page with the states it needs, and [`tools/check-mockup.mjs`](../tools/check-mockup.mjs), which replaced the W12 coverage audit, opens every one of them in the mockup. The plan's [open decisions](implementation-plan.md#6-open-decisions-each-blocks-a-named-lane-and-each-has-a-recommendation) name what still blocks a lane.
