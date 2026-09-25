# Policy

| | |
|---|---|
| Route | `#/a-intel/core-platform/tools/policy`. `#/…/steering/gates`, `#/…/steering/policy`, `#/…/steering/settings` and `#/…/steering/freshness` land here (308 in the app; the mockup rewrites the hash with `history.replaceState`). `fleet-operations-routes.md` also lands `#/…/tools/autoapprovals` here in place |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: Emissions (the Policy row), Exclusion reasons (`overridden_by_gate`), Cuts (Steering › Gates), Unchanged, D4 and D17. `docs/fleet-operations-ia.md`: Tools ("Policy now owns every gate"). `docs/fleet-operations-routes.md`: Steering and Tools. `docs/fleet-operations-collapse.md`: Steering › Gates moves here, with the freshness gates and the gate settings. `docs/mission-control-spec.md` §6.9 (approval rules) and §6.12 (policy: deterministic, versioned, tested). `tools.md` owns the header and tab bar this tab shares |
| Design | `mockups/src/engine.js` → `pTools()`, the `t==="policy"` branch, with `DLG_EXT.policyver`, `DLG_EXT.policynew`, `DLG_EXT.policyedit`, `DLG_EXT.policyactivate`, `DLG_EXT.policydiscard`, `DLG_EXT.policyrestore`, `policyDraft()`, `policyNextV()`, `policySaveDraft()`, `policyActivate()`, `policyDiscard()` and `policyRestore()`. The gate notices are drawn on Steering › Sources by `steeringSources()` and `gateHome()` in `mockups/src/wedge.js`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / Tools / Policy`: Loaded, Empty, Loading, Error and Access denied, and the same five as mobile stories. The catalog gives this view no `future` flag, so it has no future-only story |
| Audit | `tools-policy.audit-prompt.md` |

## Job

What decides a tool call before it leaves: the policy versions, each with its rules and its tests, and which version decides today. The gateway evaluates the active version on every tool call, with no model in the decision path, so the same call under the same version always gets the same answer.

Policy owns every gate. A gate refuses a call, parks it for a person, or lets it through. Each gate also has a notice: one line that tells the agent about the gate so it does not spend turns walking into a denial. The notice reaches the agent as a `constraint` SteeringFrame whose Steering Source has kind `policy`. It is listed on Steering › Sources, whose Managed in column links each notice to where its gate is edited: a decision rule here, a switch on Kill switches, a Steering record's enforcement grant on that record, or a missing mandate on Agents. Removing a notice never removes its gate.

The Gates tab of Steering is gone. Its list of notices is Sources filtered to Policy (`steering.md`), and its routes land here.

## What is on the page

**Header and tab bar** as in `tools.md`, with Policy selected. New tool is plain on this tab, because the tab carries its own gold.

**Policy versions** panel. Title "Policy versions". The panel header carries the store name `tools.policy_versions` as a mono badge, in place of a language badge, and **Draft a version** (plain, opens `policynew`).

- **List controls** (`ltTable()`): "Search this list", the filters "All · State" and "All · Author", **Rows** (10 by default) and the pager (`1–9 of 9`).
- **Table**, columns in order: Version · State · Author · When · Rules · Tests · What changed, then an unlabelled actions column.
  - *Version*: the version id in mono (`pol_v41`).
  - *State*: active (allowed colour), draft (approval colour) or superseded (quiet), each with a dot.
  - *Author*: the person who wrote the version.
  - *When*: a timestamp.
  - *Rules*: how many rules the version holds.
  - *Tests*: a pass badge ("42 / 42 pass") once the tests have run, or "not run yet" on a fresh draft.
  - *What changed*: one sentence.
  - *Actions*: **Open** (opens `policyver`), then by state. Active: **Draft a change** (opens `policynew` based on it). Draft: **Edit** (`policyedit`), **Activate** (gold, `policyactivate`) and **Discard** (danger, `policydiscard`). Superseded: **Restore** (`policyrestore`).
  - The demo holds nine versions: `pol_v41` active (Priya Natarajan, 2026-09-08 16:22, 38 rules, "42 / 42 pass", "Raises any tainted write to approval; adds aws_billing to the financial class."), `pol_v42` a draft ("Would require approval for every irreversible tool call in core-platform."), and seven superseded, `pol_v40` and `pol_v39` down to `pol_v34`. The rows keep the fixture's order, so the draft sits third.
- **Note**: "A version is activated by a governed action with approval, and in regulated mode it is a pull request instead. A draft is the only version you can edit or discard: once a version has decided anything it is kept, because every decision cites the version that made it."

**Where a version lives** panel, a key-value list:

- *Store*: "One row in Postgres, tools.policy_versions, holding the rules, the tests and the version string. A policy version is not a Steering record and never reaches a model."
- *In regulated mode*: "The rules are a file in .oxagen/policy/ in the main repo, and a change is a pull request. Postgres holds the compiled copy the gateway reads."
- *Compiled from*: "The rules you write here, plus the enforcement grants on each agent and the role grants on each operator. A rule can read those, so you do not restate a grant as a rule."
- *Who reads it*: "The gateway, on every tool call, before the call leaves. No model is in the decision path, so the same call and the same version always decide the same way."
- *What it writes*: "One policy.decision frame per call, naming the version and the rules that fired. A replay reads the decision back without re-running it."

**Conditions a rule may test**: an eyebrow over 18 chips: tool version, risk, side effect, egress, financial class, amount by path, counterparty, repository, path prefix, recipient domain, taint and its sources, time window, rate, sequence, operator role, enforcement tier, budget position, mandate position.

**Sequence rule**: an eyebrow, then the plain sentence "A rule names the call it governs, then the condition that lets it through. This one denies a payment unless the same run already priced it.", then the rule source: a comment line, `// a payment requires a prior quote call in the same run`, and a rule that forbids `stripe__create_payment` unless the run already called `stripe__list_prices`. The page names no policy language.

**Dialogs this tab opens.**

- `policyver`, one version. Title: the version. Subtitle: "The version every decision cites today" on the active version, and "Superseded, and kept because decisions cite it" on every other, the draft included. State, Author, Activated, Rules, Tests, What changed, and Stored in ("tools.policy_versions, one row. In regulated mode the rules are a file in .oxagen/policy/ and this row is the compiled copy."). Note: "The gateway evaluates these rules on every tool call, with no model in the decision path. Every policy.decision frame names the version that made it, so a replay reads the same either way." Footer: Close, then **Draft a change** (gold) on the active version, **Edit** and **Activate** (gold) on a draft, or **Restore** (gold) on a superseded one.
- `policynew`, "Draft a policy version", subtitle "A draft decides nothing until an approver activates it". Based on: a select of every version that is not a draft, each with its state and rule count, defaulting to the active version or the one the dialog was opened from; hint "The draft opens as a copy of this version’s rules." What changes: one sentence (placeholder "Raises any egress call to approval"; hint "One sentence. The version list and every restore dialog show it."). Note: "Its rules compile and its tests run against it, and nothing it says reaches a call until it is activated." Footer: Cancel, **Create the draft** (gold). With no sentence it refuses: "Say what the version changes before you create it." Otherwise the next version (`pol_v43`) lands at the top of the list as a draft with tests "not run yet", and the toast reads "Drafted pol_v43 from pol_v41. It decides nothing until an approver activates it."
- `policyedit`. On a draft: "Edit pol_v42", subtitle "A draft, so it is the one version you can change". What changes; Rules, a code block of the draft's source under its one-sentence comment, with "39 rules in this draft. Editing the source is a pull request against the policy record."; "Tests that ship with it", three rows each with a pass badge ("github__create_release@2 must require approval", "github__get_file_contents@2 must be allowed", "stripe__create_payment@4 with no mandate must be denied"); note "Activation is a governed action with approval. In regulated mode it is a pull request instead." Footer: Cancel, **Discard** (danger), **Save the draft** (gold; "pol_v42 saved. Activating it is a governed action with approval."). On an active or superseded version it refuses: "pol_v41 cannot be edited", "pol_v41 is active. Every decision it made cites it, so its rules are fixed. Draft a version from it instead.", with Close and **Draft a change** (gold).
- `policyactivate`, "Activate pol_v42?". Note: "pol_v41 is superseded and kept, because every decision it made cites it. From the next call boundary every policy.decision frame names pol_v42." Rules, Tests, What changes. Warning: "This is a governed action. It records your name, and in regulated mode it is a pull request instead of a button." Footer: Cancel, **Activate it** (gold). Activating supersedes the active version, bumps the deny generation, and reads "pol_v42 is active. Deny generation is now 119."
- `policydiscard`. On a draft: "Discard pol_v42?", a warning that quotes the draft's sentence and says it goes with it, and the note "A draft has decided nothing, so nothing cites it and the row is removed outright. The active version is untouched." Footer: **Keep it**, **Discard** (danger; "Discarded pol_v42."). On any other state it refuses: "pol_v40 cannot be discarded", "pol_v40 is superseded. Every decision it made cites it, so it is kept. Supersede it with a new version instead.", with Close and **Draft a change** (gold).
- `policyrestore`, "Restore pol_v40?". Note: "A restore does not move the pointer back. It copies pol_v40’s rules into a new version above pol_v41, which activates by a governed action with approval. The record keeps both." A warning quotes what the restored version changed and says the restore undoes it. Footer: Cancel, **Draft the restore** (gold). The new draft reads "restores pol_v40", and the toast "Drafted pol_v43 from pol_v40. It decides nothing until an approver activates it."

**Gate notices, on Steering.** Sources filtered to Policy lists six notices in core-platform, each a `constraint` from a source of kind `policy`. `gate.rg_0093` (version `pol_v41`, "A call with an irreversible side effect parks for a person's approval. github__create_release is one. Ask once, then wait.") is managed here. `gate.ks_srv_slack` and `gate.ks_tv_del` are managed on Kill switches, `gate.never-merge` and `gate.mobile-codegen` on their Steering records, and `gate.no-mandate` on Agents. `steering.md` specifies that list.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Backing checked against `macanderson/oxagen` `main` at `bf14d158a` (2026-09-24). A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Policy versions: version, state, author, when, rules, tests, what changed | `POLICIES` (`FIXTURES.POLICIES`, grown by `volume()`) | `tools.policy_versions`, one row per version with its rules and tests | None. Decision rules are one current set per workspace in `workspaces.settings.decisionRules`, with no version, author or test (`packages/rules/src/rule-store.ts:24-40`). Gap #3920 (`apps/app/src/features/tools/gaps.ts:14-15`; `apps/app/src/features/tools/policy.tsx:1-5`) | ❌ |
| Draft, edit, activate, discard and restore | `policyDraft()`, `policySaveDraft()`, `policyActivate()`, `policyDiscard()`, `policyRestore()` | `policy.draft`, `policy.edit`, `policy.activate`, `policy.discard` | None, #3920 | ❌ |
| The rules the gateway evaluates on every call | `POLICIES[].rules` (a count) | the active version | The decision-rules gate runs after IAM and entitlement and before the handler (`packages/rules/src/gate.ts:1-10`). A rule compares facts reached by path with a fixed operator set (`packages/rules/src/types.ts:50-73`), and its effect is `allow`, `deny` or `require_approval` (`:86`) | 🟡 one rule set, no versions |
| A `policy.decision` frame naming the version and the rules that fired | prose | `policy_decision` frames | A `policy_decision` frame carries the decision, the rule, its source, a reason code, the risk grade, the bundle version and both deny generations (`packages/tacho/src/envelope.ts:257-269`). It names no policy version | 🟡 |
| Where a version lives, Conditions a rule may test, Sequence rule | static text in `pTools()` | spec §6.12 | Describes `tools.policy_versions` as specified. No `.oxagen/policy/` file is read. Which of the 18 conditions the fact resolver supplies is not verified here | ❌ describes a missing store |
| Gate notices as `constraint` frames from a `policy` source | `GATES` (`FIXTURES.GATES`) through `steeringSources()` and `gateHome()` | one `constraint` SteeringFrame per gate | The assembler names a `policy` item kind (`packages/steering-assembler/src/assemble.ts:48-56`) and nothing produces one. Only `record` items (`packages/handlers/src/lib/tacho-steering.ts:210`) and `steer` items (`packages/tacho/src/collector/steering-manifest.ts:38`) are made | ❌ |
| The Policy tab count | `POLICIES.length` | the versions | None; the app draws no count (`apps/app/src/features/tools/tabs.tsx:1-11`) | ❌ |

Three things ship on this tab in the app that the design does not draw:

- **Auto-approval rules** (ADR-070): `list_approval_rules`, `set_approval_rules`, `set_approval_rule_enabled` and `delete_approval_rule` (`packages/oxagen/src/contracts/approval_rule.list.ts:36-62`, `approval_rule.set.ts:24`, `approval_rule.enabled.set.ts:13`, `approval_rule.delete.ts:13`). The app draws them here with Create rule as the tab's gold (`policy.tsx:8-13`), and `/tools/autoapprovals` lands here.
- **The mandates ledger**: `list_mandates` and `grant_mandate` (`packages/oxagen/src/contracts/mandate.list.ts:28-62`, `mandate.grant.ts:17`). The app draws it here today. The wedge moves it to each agent's Delegation section (`agent-permissions.md`), and `/tools/mandates` lands on Agents.
- **The two freshness gates**, auto sync and block stale runs, written through `update_workspace_settings` (`apps/app/src/features/steering/freshness.tsx:1-12`, `apps/app/src/features/steering/actions.ts:77-88`). The collapse list moves them and the gate settings here. The design draws neither yet.

## Future-only fields

The renderer puts no `data-future` mark on this tab, and the catalog gives it no future-only story. Every policy version row, every version dialog, the tab count and each gate notice's frame have no contract today all the same (#3920). A build keeps the panel's heading, the store name and Draft a version, and says the versions are not recorded in place of the rows, as `apps/app/src/features/tools/policy.tsx` does. Where a version lives, the conditions and the sequence rule describe that store as it is specified, and a build says so in one line.

## Functionality

- Policy is deterministic. The same call under the same version always decides the same way, and no model is in the decision path.
- Every decision cites the version that made it, so a version that has decided anything is kept. A draft is the only version that edits or discards. Editing or discarding an active or superseded version refuses and offers Draft a change.
- A draft decides nothing until it is activated. Activation is a governed action with approval, and a pull request in regulated mode. Activating supersedes the active version and bumps the deny generation, so every live run token is re-checked at its next call.
- Restore never moves the pointer back. It drafts a new version above the active one with the old rules, and the record keeps both.
- A version compiles from the rules written here, the enforcement grants on each agent and the role grants on each operator. A grant is never restated as a rule.
- The Tests badge reads as a pass only when the tests have run. A fresh draft reads "not run yet".
- A policy version is not a Steering record and never reaches a model. What reaches the model is each gate's notice: one `constraint` SteeringFrame per gate, force `must`, delivered in the session start prefix and never cut for budget. A frame a gate disagrees with is excluded as `overridden_by_gate`, and the gate's notice is delivered instead. The notice names the gate that enforces it.
- The page names no policy language. Where rule source is shown, a plain sentence above it says what the rule denies and what lets it through.
- Every write is a governed action recorded in Audit.

## States

`pTools()` branches on the state before it draws anything, so every state but loaded replaces the whole page body, header and tab bar included. The four panels are the ones `tools.md` quotes:

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: "No provider is registered", with **Import a provider** (gold) and **Add a connection**. The Policy tab has no empty panel of its own.
- **loading**: the skeleton, four tile blocks and a panel of seven rows.
- **error**: "Tools could not be loaded", `503 tool_registry_unavailable`, **Try again** (gold), **Open an incident** and the trace line.
- **access denied**: "You cannot see the tool registry", naming `tools.read on core-platform`, with **Request access** (gold) and **Back to Work**, then Signed in as, Needed and Decided by.

## Mobile

The shell is as in `tools.md`: the thumb bar holds Work, Agents, Tools, Spend and More, with Tools lit. The tab bar scrolls in its own row, and the Policy tab must be scrolled into view. The versions table becomes a stack of cards, each cell labelled with its column header, and each card ends with its actions. The key-value list and the chips stack, and the rule source scrolls inside its own block. Every dialog rises from the bottom edge as a sheet. Touch targets are at least 44 px, inputs are 16 px, and the page never scrolls sideways.

## Permissions

- Read: `tools.read`.
- Writes, each a governed action recorded in Audit: `policy.draft`, `policy.edit`, `policy.discard` and `policy.activate`, which needs an approver. No capability binds them today. The rules that do ship are written by an org Owner or Admin (`set_approval_rules`), and the freshness gates by an org or workspace Owner or Admin (`update_workspace_settings`).

## Backend gaps this page depends on

- #3920 (G2): policy versions with their rules and tests, drafted, activated, discarded and restored.
- A policy version on every `policy_decision` frame, so a decision cites the version that made it.
- Gate notices produced as `policy` items and recorded as `constraint` frames with provenance to their gate.
- An address for one version, so a notice's source link opens `pol_v41` rather than the tab.
- In the design: auto-approval rules, the freshness gates and the gate settings on this tab, which the collapse list places here and the mockup does not draw.

## Rules every build of this page must keep

- A Steering Source and a SteeringFrame are never shown as each other. A gate's notice row on Sources links here, and a notice's frame names the version it came from.
- A policy version is never shown as a Steering record, and nothing on this tab reaches a model.
- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. `policy.decision` names a recorded frame.
- Every enforcement claim states the tier. A gate refuses a call for calls routed through Oxagen. On the `harness` tier the hook refuses a harness-native call, client-attested and fail-open. On `observe` nothing refuses.
- A version that has decided anything is never edited or deleted.
- Headers are rollups of the rows beneath them. The tab count counts the versions.
- No person is scored or ranked.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing. The page names no policy language.
- Exactly one gold action per screen. In the design it is Activate on the draft row, so a tab with no draft has none and a tab with two drafts has two; a build keeps one gold action in every case.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- A not-loaded state replaces the page body and keeps the shell. A stub control says what the product would do. Nothing silently does nothing.
