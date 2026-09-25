# Tools › Policy › Version

| | |
|---|---|
| Route | `#/a-intel/core-platform/tools/policy/pol_v42`, with `/tests` and `/changes` for the other two tabs. `?rule=<id>` lands the editor's caret on that rule and drops the query in place. The Policy tab's version id, **Open** and **Edit** land here, and so does a gate notice's Managed in link for a decision rule |
| Scope | workspace |
| Spec | `docs/mission-control-spec.md` §6.12 (policy: deterministic, versioned, tested, written in Cedar). `docs/oxagen/specs/tacho/design/adr-0004-tacho-policy-engine-cedar.md` (why Cedar) and `approval-tokens.md` (a rule that requires approval is a `forbid` that lifts once approval is granted). `tools-policy.md` owns the version list, the activation, discard and restore dialogs, and every rule a build of Policy keeps |
| Design | `mockups/src/engine.js` → `pPolicyVersion()`, with `polSrc()`, `polSaved()`, `polParse()`, `polOutline()`, `polProblemsHtml()`, `polLive()`, `polJump()`, `polMount()`, `polSave()`, `polNote()`, `polTests()`, `polRun()`, `polRunOf()`, `polDecide()`, `polMatch()`, `polChanges()`, `polBase()`, `DLG_EXT.policyrule`, `polRuleSrc()`, `polAddRule()`, `DLG_EXT.policytest`, `polAddTest()`, and the shared editor (`cedHtml()`, `cedMount()`, `cedKey()`, `CED_LANG.cedar`). Data in `mockups/fixtures/policy-rules.json`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, loading, error, access denied |
| Storybook | `Oxagen / Tools / Policy version`: Loaded, Loading, Error and Access denied, and the same four as mobile stories. The catalog gives this view no `future` flag |
| Audit | `tools-policy-version.audit-prompt.md` |

## Job

Read and change one policy version: its rules as source, the tests that ship with it, and what it changes against the version it came from. A draft is written here and made ready to activate. Every other version is read here.

A version is Cedar source. A rule is a `permit` or a `forbid` over the agent, the tool and the resource, with `when` and `unless` conditions over the call's context, and an `@id` that every decision and test cites. Cedar has no third effect, so a rule that parks a call for a person is a `forbid` with `@decision("require_approval")` that lifts once `context.approval.granted` holds.

## What is on the page

**Header.** Eyebrow "Policy", a link to the Policy tab. The h1 is the version id in mono. Badges: the state (active allowed, draft approval, superseded quiet, each with a dot), "based on pol_v41" linking to that version, the author, and the date. Actions by state:

- Draft: **Discard** (danger, `policydiscard`), **Save the draft** (plain, disabled until the editor holds a change) and **Activate** (gold, `policyactivate`).
- Active: **Draft new version** (gold, `policynew` based on it).
- Superseded: **Restore** (gold, `policyrestore`).

**What changes** (`data-help="what-changes"`). On a draft, a field holding the version's sentence with the hint "One sentence.", saved with the draft. On any other version, a key-value list: What changed, then Reason once an activation recorded one.

**Tab bar.** Rules, Tests and Changes, each with its count: the rules in the editor, the version's tests, and the rules added, changed or removed against the base. The rules and changes counts follow the editor as you type.

**Rules tab.** Two columns.

- **Rules** panel, with **Add rule** (plain, `policyrule`) on a draft. One row per rule in source order: its `@id` in mono, its decision (allow, require approval or deny), "new" or "changed" against the base, and the comment above it. A row puts the editor's caret on the rule. With no rules: "No rules yet."
- **Editor** (`data-help="editor"`): the shared source editor on `<version>.cedar`, with line numbers, find, the modified dot and the status bar, which names Cedar. On an active or superseded version it is read-only and says so.
- **Problems** panel, under the editor. One row per problem, sorted by line, each with a **Line n** button: "A rule starts with permit or forbid. This one starts with advice.", "context.tool.side_efect is not in the schema.", "This rule has no @id, so no test or decision can name it.", "Two rules use @id(\"rg_0093\").", "This { is never closed.", "This rule has no closing ;.". With none: "No problems."

**Tests tab.** A **Tests** panel. The header carries the run badge ("44 / 44 pass", a failed badge "43 / 44 pass", or "not run yet"), **Add test** (plain, `policytest`) on a draft, and **Run tests** (plain). Columns in order: Call · Agent · Facts · Expected · Result · Decided by.

- *Call*: the tool and its version in mono (`github__create_release@2`).
- *Agent*: the agent key in mono.
- *Facts*: what the call carries that a rule reads ("repository a-intel/mobile, branch main"), or "none".
- *Expected*: allow, require approval or deny.
- *Result*: pass, fail with "got deny", or "not run".
- *Decided by*: the rule's `@id`, a link to it on the Rules tab, or "no rule permits it".

**Changes tab.** A **Changes** panel with a badge "against pol_v41". Added, Changed and Removed, each a list of rule ids or "none". Then a side-by-side diff of the base's saved source and the text in the editor, labelled with both versions. When the two match: "The rules match pol_v41 line for line." The oldest version kept here has no base: "pol_v34 is the oldest version kept here."

**Dialogs this page opens.**

- `policyrule`, "Add a rule to pol_v42". What the rule does: one sentence, placeholder "Parks a pod delete in prod-east for approval", hint "One sentence. It becomes the comment above the rule." Decision: Allow, Require approval (default) or Deny. Tools: Every tool, Every irreversible tool, Every tool that writes, Every tool that moves money, then One tool. Agents: Every agent, Every agent in each workspace, then One agent. Only when: Always, The input is tainted, The amount is above, The repository is, The path starts with, Outside weekday hours (09:00 to 17:00 UTC), The budget left is below, The run has not called. Value: an amount in USD, a repository, a path or a tool name. Rule: the source it writes, redrawn on every change, with the hint "It goes at the end of the draft, where you can edit it." Footer: Cancel, **Add to the draft** (gold). It refuses without a sentence ("Say what the rule does before you add it.") and without a value the condition needs ("Give the value the rule tests."). Otherwise the rule is appended unsaved with the next `rg_` id, the page opens on Rules with the caret on it, and the toast reads "Added rg_0132 to pol_v42. Save the draft to keep it."
- `policytest`, "Add a test to pol_v42". Tool (the newest version of each tool), Agent, Facts (placeholder "amount $720.00", hint "What the call carries that a rule reads: an amount, a repository, a path, taint."), Expected (Allow, Require approval, Deny). Footer: Cancel, **Add the test** (gold). The page opens on Tests, and the toast reads "Added a test to pol_v42. Run the tests to see which rule decides it."
- On an active or superseded version both refuse: "pol_v41 cannot be edited", "pol_v41 is active, so its rules and tests are fixed. Draft a new version from it instead.", with Close and **Draft new version** (gold).
- `policyactivate`, `policydiscard`, `policyrestore` and `policynew` are specified in `tools-policy.md`.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Backing checked against `macanderson/oxagen` `main` at `bf14d158a` (2026-09-24). A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Version, state, author, date, sentence, reason | `POLICIES` | `tools.policy_versions` | None. Decision rules are one current set per workspace in `workspaces.settings.decisionRules`, with no version (`packages/rules/src/rule-store.ts:24-40`). #3920 | ❌ |
| Rule source | `FIXTURES.POLICY_RULES.rules`: a rule is in version N when `since <= N < until`. A draft made here holds its own copy | `tools.policy_versions.rules`, Cedar text | None. A shipped rule compares facts reached by path with a fixed operator set (`packages/rules/src/types.ts:50-73`) and is not Cedar | ❌ |
| Problems | `polParse()` against `POL_CTX` | the policy validator and the Cedar schema for tool calls | None | ❌ |
| Tests | `FIXTURES.POLICY_RULES.tests`, by the same `since` and `until`, or a draft's `testList` | `tools.policy_versions.tests` | None | ❌ |
| Test results and Decided by | `polRun()`, `polDecide()`, `polMatch()` | the test run, and the evaluator's determining policies | None | ❌ |
| Changes | `polChanges()`, `diffLines()`, `diffSplitHtml()` | a diff of two stored versions | None | ❌ |
| Save the draft | `polSave()` | `policy.edit` | None, #3920 | ❌ |

## Future-only fields

The renderer puts no `data-future` mark on this page, and the catalog gives it no future-only story. Every part of it has no contract today all the same (#3920). A build draws the header and says the version is not recorded in place of the tabs until versions ship.

## Functionality

- A draft is the one version you change. Its editor is writable, and Add rule and Add test show. An active or superseded version opens read-only with its one forward action, because every decision it made cites it.
- The source is the truth. The rule list, the counts, the problems and the changes are all read from it, and they follow the editor as you type.
- The Add rule builder only writes source. What it cannot express, you write in the editor.
- Saving keeps what the editor holds as the draft's rules. A draft with problems saves, because it is work in progress.
- A test result belongs to the text and the tests it ran against. Any edit to the rules, or a new test, turns every result back to "not run" until **Run tests**.
- A test is a call and its expected decision. The result names the rule that decided it. When no rule permits a call, Cedar denies it.
- A draft diffs against the version it was drafted from. Any other version diffs against the next older version kept here.
- Activation (`tools-policy.md`) refuses until the draft is saved, the saved rules have no problems, and every test ran against them and passed.
- The page's prose names no policy language. The editor names Cedar in its status bar, as every source editor names its grammar.

## States

`pPolicyVersion()` branches on the state before it draws anything:

- **loaded**: the page as described, on `pol_v42` (draft, 39 rules, 44 tests, one rule added against `pol_v41`).
- **loading**: the skeleton.
- **error**: "This policy version could not be loaded", `503 policy_store_unavailable`, **Try again** (gold), **Open an incident** and the trace line.
- **access denied**: "You cannot see this policy version", naming `tools.read on core-platform`, with **Request access** (gold) and **Back to Work**.
- **not found**: "Policy version not found", "No version named <id>", "A discarded draft leaves no version behind.", with **Back to Policy** (gold).

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with Tools lit. The header's badges and actions wrap under the h1. The Rules panel sits above the editor and scrolls in a 260 px block, with rows at least 44 px tall. The source scrolls inside its block and never wraps. The tests table becomes labelled cards. The diff falls back to one column. Every dialog rises from the bottom edge as a sheet. Inputs are 16 px, and the page never scrolls sideways.

## Permissions

- Read: `tools.read`.
- Writes, each a governed action recorded in Audit: `policy.edit` for Save the draft, Add rule and Add test. No capability binds it today.

## Backend gaps this page depends on

- #3920 (G2): policy versions with their Cedar source and their tests.
- A validator for the Cedar source against the tool-call schema, run on save.
- A test runner that reports each test's decision and its determining policies.
- An address for one version and one rule in it, which the design uses for gate notices.

## Rules every build of this page must keep

- Only a draft changes. A version that has decided anything is never edited.
- The source is the truth. Nothing on the page states a count, a decision or a change that the source does not hold.
- A test result is shown only for the text it ran against. A pass is never shown for rules it did not test.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. The page's prose names no policy language. The editor's status bar names Cedar.
- Exactly one gold action per screen: Activate on a draft, Draft new version on the active version, Restore on a superseded one.
- A not-loaded state replaces the page body and keeps the shell.
