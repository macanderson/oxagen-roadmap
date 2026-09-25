# Policy version

## Page header {#tools-policy-version/header}

The header names one policy version, its state, the version it was based on, its author and its date, and holds the actions its state allows.

### Purpose

It answers "which version am I looking at, and what can I do to it". A draft offers **Discard**, **Save the draft** and **Activate**. The active version offers **Draft new version**. A superseded version offers **Restore**.

### Rationale

Only a draft changes, because nothing cites it yet. Every decision the active or a superseded version made cites it, so its rules and tests are fixed, and the page opens them read-only with the one action that moves forward from them. **Activate** is the draft's gold action. **Save the draft** stays plain and is disabled until the editor holds a change, so a person always knows whether the rules they see are the rules that would be activated.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Version, state, author, date | `POLICIES[]` | `tools.policy_versions` (#3920) | future |
| Based on | `polBase(p)`: `p.from`, else the next older version | `tools.policy_versions.based_on` | future |
| Save the draft | `polSave(v)` | `policy.edit` (#3920) | future |

### Logic

1. `pPolicyVersion(r)` finds the version with `polBy()`. No match draws "Policy version not found" and **Back to Policy**.
2. The eyebrow links back to the Policy tab. The h1 is the version id in mono.
3. The state badge uses the list's colours: active allowed, draft approval, superseded quiet. "based on" links to that version's page.
4. **Save the draft** carries `data-ced-dirty`, so `cedPaint()` enables it on the first keystroke. ⌘S in the editor saves too. Saving with an empty sentence refuses: "Say what the version changes before you save it." A save with problems succeeds and says how many are left to fix.

### States

The catalog lists loaded, loading, error and denied. Loading draws the skeleton. Error names `503 policy_store_unavailable`. Denied names `tools.read on <workspace>`. On a phone the badges and the actions wrap under the h1.

## What changes {#tools-policy-version/what-changes}

The one sentence that says what this version changes against the version it was based on.

### Purpose

It answers "what is this version for" in the words the Policy list, the restore dialog and the activation dialog repeat.

### Rationale

A reviewer reads the sentence before the diff. On a draft it is a field, saved with the draft. On any other version it is fixed, and an activated version also shows the reason recorded when it was activated.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Sentence | `p.note` | `tools.policy_versions.note` | future |
| Reason | `p.reason`, written by `policyActivate()` | the activation's audit event | future |

### Logic

1. On a draft, `#pv-note` writes `p.note` on change through `polNote()`. An empty value keeps the old sentence.
2. On any other state the part is a key-value list: What changed, then Reason when one was recorded.

### States

- **Mobile**: the field spans the column.

## Tab bar {#tools-policy-version/tabs}

Three tabs: Rules, Tests and Changes, each with its count.

### Purpose

It answers "how many rules, how many tests, and how much changed" before you open any of them.

### Rationale

Each count is a rollup of what its tab shows. Rules counts the rules in the editor as you type, Tests counts the version's tests, and Changes counts the rules added, changed or removed against the base version. The rules and changes counts follow the editor through `polLive()`, so they never disagree with the list beside it.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Rules | `polParse(text).rules.length` | the version's rules | future |
| Tests | `polTests(p).length` | the version's tests | future |
| Changes | `polChanges(base, parsed)` | a diff of the two versions | future |

### Logic

1. Each tab is an address: `#/…/tools/policy/<version>`, `/tests` and `/changes`.
2. A count of zero draws no count.

### States

- **Mobile**: the tab bar scrolls in its own row.

## Rules {#tools-policy-version/rules}

The rules in this version, one row each: its `@id`, its decision, whether it is new or changed, and the comment above it.

### Purpose

It answers "what does this version decide" without reading the source. Select a rule and the editor puts the caret on it.

### Rationale

A policy file of forty rules is too long to scan as text. The comment above each rule is the sentence a person reads, and the `@id` is the handle every decision and every test cites. The decision is read from the rule itself: a `permit` allows, a `forbid` with `@decision("require_approval")` parks the call for a person, and any other `forbid` denies. **Add rule** opens a builder for people who do not write the source by hand.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Rules | `polParse(cedText("pol:<version>"))` | the version's rules | future |
| New and changed | `polChanges()` against `polBase(p)` | a diff of the two versions | future |

### Logic

1. `polOutline()` draws one button per rule in source order. It reads "new" when the base has no rule with that `@id`, and "changed" when the text differs.
2. A click runs `polJump()`, which moves the caret to the rule's first line and scrolls the editor to it.
3. **Add rule** shows on a draft only and opens `policyrule`.

### States

- **Empty source**: "No rules yet."
- **Mobile**: the list sits above the editor and scrolls in a 260 px block. Each row is at least 44 px tall.

## Editor {#tools-policy-version/editor}

The version's rule source in the shared source editor, with line numbers, find, and the grammar named in the status bar.

### Purpose

It answers "what exactly does this version say", and on a draft it is where you change it.

### Rationale

The rules are Cedar. Tool policy is written in Cedar because its evaluator is formally verified and its policies can be analysed, so a question such as "could any agent ever delete a repository" has an answer from the text (`docs/mission-control-spec.md` §6.12, ADR 0004). The editor names the grammar in its status bar as it names TOML on an agent's source, because a person writing a rule needs to know which language to look up. The rest of the page names no policy language.

A rule is a `permit` or a `forbid` over the principal (the agent), the action (the tool) and the resource, with `when` and `unless` conditions over the call's context. `@id` names the rule. Cedar has no third effect, so a rule that parks a call for a person is a `forbid` with `@decision("require_approval")` that lifts once `context.approval.granted` holds. Every condition comes from the call and the record, never from prose.

An active or superseded version opens read-only, because decisions cite it.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Source | `polSrc(v)`: the library rules in the version, or a local draft's own copy | `tools.policy_versions.rules` | future |
| Saved copy | `S.cedBase["pol:<version>"]` | the stored version | future |
| Highlighting | `CED_LANG.cedar` through `hlLang()` | none, client only | live |

### Logic

1. `cedHtml(key, "<version>.cedar", "cedar", {readonly})` draws the editor. On a non-draft the textarea is `readonly`, the status bar says read-only, and `cedKey()` ignores every key but find.
2. Every keystroke runs `polLive()`, which redraws the rule list, the problems and the tab counts.
3. ⌘S saves the draft.

### States

- **Mobile**: the source scrolls inside its block. Lines do not wrap.

## Problems {#tools-policy-version/problems}

What is wrong with the source, one line each, with a button that jumps to the line.

### Purpose

It answers "will this compile" while you type, before you save or run a test.

### Rationale

A draft with problems saves, because a draft is work in progress. It does not activate: the activation dialog refuses while the saved rules have a problem. The editor checks what it can see without the schema service: an effect other than `permit` or `forbid`, a bracket left open or closed twice, a string never closed, a rule with no `;`, a rule with no `@id` or a repeated one, a `@decision` other than `require_approval` on a `forbid`, and a `context` path the schema does not hold. The full validation against the Cedar schema runs on save in the product.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Problems | `polParse(text).problems` | the policy validator | future |
| Schema paths | `POL_CTX` | the Cedar schema for tool calls | future |

### Logic

1. Problems sort by line. Each has a **Line n** button that runs `polJump()`.
2. With none, the panel reads "No problems."

### States

- **Mobile**: the panel sits under the editor.

## Tests {#tools-policy-version/tests}

The version's tests: each call, the agent that makes it, the facts it carries, the decision it must get, the result of the last run, and the rule that decided it.

### Purpose

It answers "does this version decide the calls we care about the way we expect". **Run tests** runs them against the text in the editor. **Add test** adds one.

### Rationale

A version ships with its tests (§6.12), and they run on every change. A result belongs to the text it ran against: edit the source or add a test and every result reads "not run" until the next run, so a pass is never shown for rules it did not test. Decided by names the rule the evaluator reports, so a failure points at the rule to read. When no rule permits a call, Cedar denies it, and the row says so.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tests | `polTests(p)`: the library tests in the version, or a local draft's own list | `tools.policy_versions.tests` | future |
| Results | `S.polRun[v]`, written by `polRun()` | the test run on save | future |
| Decided by | `polDecide()`: the rule a library test names, or `polMatch()` for a test added here | the evaluator's determining policies | future |

### Logic

1. `polRunOf(v, text)` returns a run only when it ran against this exact text and this many tests. Otherwise every result reads "not run" and the badge reads "not run yet".
2. A fixture version's tests ran when it was saved. A draft made here has run none.
3. A library test names the rule that decides it. The run reads that rule's decision, or a deny when the rule is gone.
4. A test added here names no rule. `polMatch()` stands in for the evaluator: it reads each rule's scope and its tests of the tool's classification, skips a rule that also reads arguments, taint, time, rate, budget or mandate, and orders a deny, then an approval, then an allow.
5. The toast reads "<n> tests ran against <version>. <n> pass." with the fail count when there is one.

### States

- **Draft**: Add test and Run tests. **Active or superseded**: Run tests only.
- **Mobile**: labelled cards.

## Changes {#tools-policy-version/changes}

What this version changes against the version it was based on: the rules added, changed and removed, then a side-by-side diff.

### Purpose

It answers the reviewer's question before anyone activates the version: "what exactly is different".

### Rationale

The sentence says what the author meant to change. The diff shows what they did change, and the two can differ. A draft diffs against the version it was drafted from. Any other version diffs against the next older version kept here, so the list of superseded versions reads as a history. The diff includes unsaved edits, so an author reviews their own change before saving it.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Added, changed, removed | `polChanges()` by `@id` | a diff of the two versions | future |
| Diff | `diffSplitHtml(diffLines(base, text))` | same | future |

### Logic

1. Each added or changed id links to the rule in this version.
2. When the texts match line for line, the panel says so in place of the diff.
3. The oldest version kept here has no base, and the panel says so.

### States

- **Mobile**: the diff falls back to one column.

## Add a rule {#dialog/policyrule}
<!-- open: openDialog('policyrule', 'pol_v42') -->

A builder that writes one rule into the draft from a sentence, a decision, the tools, the agents and one condition.

### Purpose

It answers "how do I add a rule if I do not write the source". The rule it writes shows in the dialog as you choose, then lands at the end of the draft, where you can edit it as text.

### Rationale

The source is the truth, and the builder only writes source. It covers the shapes most rules take: allow, require approval or deny, for every tool, a class of tools or one tool, for every agent, a workspace or one agent, with one condition from the list a rule may test. Anything it cannot express, you write in the editor.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tools | `polToolNames()` from `TOOLS` | the tool registry | partial |
| Agents | `WS`, `AGENTS` | the workspace's agents | partial |
| Rule | `polRuleSrc(id, values)` | the draft's rules | future |

### Logic

1. `polNextId()` takes the next `rg_` number after every id in the draft and the library.
2. `polRulePrev()` redraws the preview on every change and sets the value field's placeholder for the chosen condition.
3. **Add to the draft** refuses without a sentence ("Say what the rule does before you add it.") and without a value when the condition needs one ("Give the value the rule tests.").
4. The rule is appended unsaved. The page opens on the Rules tab with the caret on it, and the toast says to save the draft to keep it. The tests read "not run" until the next run.

### States

- On an active or superseded version the dialog refuses with "<version> cannot be edited" and offers **Draft new version**.
- **Mobile**: a bottom sheet.

## Add a test {#dialog/policytest}
<!-- open: openDialog('policytest', 'pol_v42') -->

A form that adds one test to the draft: a tool, an agent, the facts the call carries, and the decision it must get.

### Purpose

It answers "how do I pin a decision so a later change cannot break it quietly".

### Rationale

A test is a call and its expected decision. It does not name the rule that should decide, because the evaluator decides that and the result reports it. A test lives with the version and is copied into every draft made from it.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tool | `polToolVers()`, the newest version of each tool | the tool registry | partial |
| Agent | `AGENTS` | the workspace's agents | partial |
| Test | `p.testList` | `tools.policy_versions.tests` | future |

### Logic

1. `polAddTest()` copies the library tests into `p.testList` on the first add, then appends the new test with the next `pt_` number.
2. The page opens on the Tests tab. The run no longer matches, so every result reads "not run" until **Run tests**.

### States

- On an active or superseded version the dialog refuses with "<version> cannot be edited" and offers **Draft new version**.
- **Mobile**: a bottom sheet.
