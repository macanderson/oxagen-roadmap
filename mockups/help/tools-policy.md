# Policy

The versions of the policy that decides tool calls, where a version is kept and what reads it, what a rule may test, and the dialogs that draft, edit, activate, discard and restore a version. The header and tab bar are in `tools.md`.

## Policy versions

Every version of the policy that decides tool calls, with its state, author, rules, tests and one sentence on what it changed.

### Purpose
It answers "which rules decide our tool calls today, who wrote them, and what changed". Open a version, draft a new one from the active version, and edit, activate or discard a draft.

### Rationale
Policy is deterministic, versioned and tested (`docs/mission-control-spec.md` §6.12). The gateway evaluates the active version on every tool call, with no model in the decision path, so the same call under the same version always gets the same answer. Every decision cites the version that made it. That is why a version that has decided anything is kept, and why a draft is the only version you can edit or discard.

A version is activated by a governed action with approval, and in regulated mode it is a pull request instead. Tools › Policy owns every gate since the fleet operations wedge cut Steering › Gates (Cuts in `docs/fleet-operations-wedge.md`). Each gate's notice reaches an agent as a `constraint` SteeringFrame from a source of kind `policy`, listed on Steering › Sources and linked back here.

The panel's caption ("Every version of the policy that decides tool calls.") and the note under the table moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Version, state, author, when, rules, tests, what changed | `POLICIES` (`FIXTURES.POLICIES`, grown by `volume()`) | `tools.policy_versions` (#3920) | future |
| Draft, edit, activate, discard, restore | `policyDraft()`, `policySaveDraft()`, `policyActivate()`, `policyDiscard()`, `policyRestore()` | `policy.draft`, `policy.edit`, `policy.activate`, `policy.discard` (#3920) | future |
| Active version | `activePolicy()` | the version every `policy_decision` names | future |

### Logic
1. Rows keep the fixture's order, so a new draft sits first.
2. State reads active (allowed colour), draft (approval colour) or superseded (quiet).
3. Tests reads a pass badge once the tests ran, or "not run yet" on a fresh draft.
4. The actions follow the state. Active: **Open**, **Draft new version**. Draft: **Open**, **Edit**, **Activate** (gold), **Discard**. Superseded: **Open**, **Restore**.
5. **Draft new version** in the panel header opens `policynew` based on the active version.
6. `ltTable()` adds search, the filters Any state and Any author, and the pager.

### States
- **Loaded**: nine versions: `pol_v42` draft, `pol_v41` active, seven superseded.
- **Empty, loading, error, denied**: the page is replaced by the Tools state panel (see `tools.md`, Header). The Policy tab has no empty panel of its own.
- **Mobile**: labelled cards, each ending with its actions.
- **In the app**: decision rules are one current set per workspace with no version (`packages/rules/src/rule-store.ts`). A build keeps the heading and Draft new version and says versions are not recorded. The app also draws auto-approval rules here (ADR-070), which the design does not.

## Where a version lives

Five facts about a policy version: where it is stored, where it lives in regulated mode, what it compiles from, what reads it, and what it writes.

### Purpose
It answers "if I change a rule, where does the change live and what will it touch". A reviewer reads it before approving an activation.

### Rationale
A policy version is one stored version holding the rules, the tests and the version string. It is not a Steering record and never reaches a model. What reaches the model is each gate's notice (D4, D5).

In regulated mode the rules are a file in `.oxagen/policy/` in the main repository, and a change is a pull request. Oxagen's database holds the compiled copy the gateway reads.

A version compiles from three inputs: the rules written on this page, the enforcement grants on each agent, and the role grants on each operator (§6.12). A rule can read those grants, so you do not restate a grant as a rule.

The gateway reads the version on every tool call, before the call leaves. No model is in the decision path, so the same call and the same version always decide the same way.

Each call writes one `policy.decision` frame naming the version and the rules that fired. The Decision trace reads that decision back without re-running it (D8).

The shipped app draws this panel as the same five terms (`apps/app/src/features/tools/policy.tsx`, `WhereAVersionLives`), so it is app UI and stays. Each row on the page used to carry these explanations. The rows now carry the fact, and the explanations moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Store, regulated file, compile inputs, reader, frame | static text in `pTools()`, `ws().main` | `tools.policy_versions` (#3920) as specified | future |

### Logic
1. The regulated-mode row names the workspace's main repository from `ws().main`.
2. The page names no storage table and no policy language. `tools/check-creation.mjs` asserts both.

### States
- **In the app**: no `.oxagen/policy/` file is read and no `policy_decision` frame names a version today. A build says in one line that the panel describes the store as specified.

## Conditions

The 18 facts a policy rule can read from a call and the record.

### Purpose
It answers "can a rule express what I need". Read it before you draft a version.

### Rationale
Every condition comes from the call and the record, none from prose (§6.12). The list runs from the tool version and its classification (risk, side effect, egress, financial class), through argument values by path (amount, counterparty, repository, path prefix, recipient domain), to taint and its sources, time window, rate, sequence, operator role, enforcement tier, and budget and mandate position. Category is absent on purpose: it is a registry attribute and decides nothing. The shipped app draws the same 18 chips under the same eyebrow (`Conditions` in `apps/app/src/features/tools/policy.tsx`).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Conditions | a static list in `pTools()` | the fact resolver of `packages/rules` | future |

### Logic
1. One chip per condition, in the order above. The chips are labels and do nothing when clicked.

### States
- **In the app**: a rule today compares facts reached by path with a fixed operator set (`packages/rules/src/types.ts`). Which of the 18 conditions the resolver supplies is not verified.

## Sequence rule

One example rule, glossed in a plain sentence above its source.

### Purpose
It shows what a rule looks like: the call it governs, then the condition that lets it through. This one denies a payment unless the same run already priced it.

### Rationale
A sequence rule is the kind of rule people least expect a policy to express, and the one that stops a class of mistakes: paying before quoting. The page names no policy language, and a plain sentence above the source says what the rule denies and what lets it through, so a reader who does not know the syntax still knows the effect. The shipped app draws the same example (`SequenceRule` in `apps/app/src/features/tools/policy.tsx`). The sentence "A rule names the call it governs, then the condition that lets it through." moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Rule source | static text in `pTools()` | a rule in the active version | future |

### Logic
1. The rule forbids `stripe__create_payment` unless the run already called `stripe__list_prices`.
2. `tools/check-creation.mjs` asserts the sentence sits directly above the source.

### States
- **Mobile**: the source scrolls inside its block.

## Policy version {#dialog/policyver}
<!-- open: openDialog('policyver', 'pol_v41') -->

One policy version: its state, author, activation time (or draft time on a draft), rules, tests, what it changed, and where it is stored.

### Purpose
It answers "what is in this version". From here you draft a new version from the active one, edit or activate a draft, or restore a superseded one.

### Rationale
The gateway evaluates these rules on every tool call, with no model in the decision path. Every `policy.decision` frame names the version that made it, so a replay reads the same whichever version is active later. In regulated mode the rules are a file in `.oxagen/policy/`, and this version is the compiled copy. A superseded version is kept because decisions cite it.

The subtitle, which called every non-active version superseded (the draft included), the Stored in explanation and the note moved here. A draft's date row reads Drafted, because a draft was never activated.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| State, author, activated, rules, tests, what changed | `POLICIES[]` | `tools.policy_versions` (#3920) | future |

### Logic
1. The footer's gold action follows the state: **Draft new version** on the active version, **Activate** on a draft (with **Edit**), **Restore** on a superseded version.

### States
- An id that no longer exists reads "That record is no longer here."
- **Mobile**: a bottom sheet.

## Policy draft {#dialog/policynew}

A form that starts a new draft from an existing version.

### Purpose
It answers "I want to change a rule". The draft opens as a copy of the version it is based on, with one sentence on what it changes.

### Rationale
A draft decides nothing until an approver activates it. Its rules compile and its tests run, so a reviewer sees a pass or a failure before anyone approves. The one sentence is what the version list and every restore dialog show, so it is required. Basing a draft on any version but a draft keeps every draft rooted in something that has decided calls.

The What changes hint's second sentence and the note moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Based on | `POLICIES` without drafts | `tools.policy_versions` | future |
| What changes | `#pn-note` | `policy.draft` (#3920) | future |

### Logic
1. Based on defaults to the version the dialog was opened from, else the active version.
2. `policyDraft()` refuses an empty sentence with "Say what the version changes before you create it."
3. Otherwise it adds `policyNextV()` (`pol_v43`) at the top as a draft with tests "not run yet", and toasts "Drafted pol_v43 from pol_v41."

### States
- **Mobile**: a bottom sheet.

## Policy draft edit {#dialog/policyedit}
<!-- open: openDialog('policyedit', 'pol_v42') -->

The editor for a draft: its sentence, its rule source, and the tests that ship with it.

### Purpose
It answers "change this draft before anyone activates it".

### Rationale
A draft is the one version you can change, because nothing cites it yet. Editing the source is a pull request against the policy record. Activation is a governed action with approval, and in regulated mode it is a pull request instead. An active or superseded version refuses the edit: every decision it made cites it, so its rules are fixed.

The subtitle, the rules hint's second sentence, the note, and the refusal's middle sentence moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Sentence, rule count | `POLICIES[]` | `policy.edit` (#3920) | future |
| Rule source, tests | static text in `DLG_EXT.policyedit` | the draft's rules and tests | future |

### Logic
1. On a non-draft, the dialog reads "<version> cannot be edited" with **Draft new version**.
2. `policySaveDraft()` refuses an empty sentence, marks the tests passing, and toasts "<version> saved."
3. **Discard** opens `policydiscard`.

### States
- **Mobile**: a bottom sheet, the source scrolls in its block.

## Policy activation {#dialog/policyactivate}
<!-- open: openDialog('policyactivate', 'pol_v42') -->

A confirmation that makes a draft the version every decision names.

### Purpose
It answers "what changes if I activate this". It shows the rules, the tests and the sentence before you confirm.

### Rationale
Activation supersedes the active version and keeps it, because every decision it made cites it. From the next tool call, every policy decision names the new version. It also bumps the kill-switch generation, so every live run token is re-checked at its next call. Activation is a governed action that records your name, and in regulated mode it is a pull request, not a button.

The note's "and kept, because every decision it made cites it" and the warning's regulated-mode clause moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Rules, tests, sentence | `POLICIES[]` | `policy.activate` (#3920) | future |
| Generation | `S.denyGen` | `iam.authorization_deny_generations` | live |

### Logic
1. `policyActivate()` marks the active version superseded, marks this one active, adds one to `S.denyGen`, and toasts "<version> is active. Kill-switch generation is now <n>."

### States
- **Mobile**: a bottom sheet.

## Policy draft discard {#dialog/policydiscard}
<!-- open: openDialog('policydiscard', 'pol_v42') -->

A confirmation that deletes a draft.

### Purpose
It answers "throw this draft away". It quotes the draft's sentence so you know which one goes.

### Rationale
A draft has decided nothing, so nothing cites it and the row is removed outright. The active version is untouched. An active or superseded version refuses: every decision it made cites it, so it is kept, and the dialog offers to supersede it with a new version instead.

The note and the refusal's middle sentence moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Draft | `POLICIES[]` | `policy.discard` (#3920) | future |

### Logic
1. `policyDiscard()` removes the draft and toasts "Discarded <version>." The rows below it keep their order.
2. On a non-draft, the dialog reads "<version> cannot be discarded" with **Draft new version**.

### States
- **Mobile**: a bottom sheet.

## Policy restore {#dialog/policyrestore}
<!-- open: openDialog('policyrestore', 'pol_v40') -->

A confirmation that drafts a new version from a superseded one's rules.

### Purpose
It answers "go back to how the rules were". It warns what the restore undoes.

### Rationale
A restore does not move the pointer back. It copies the old version's rules into a new draft above the active version, which activates by a governed action with approval. The record keeps both, so every decision still cites the version that made it.

The note's first and last sentences moved here, and its middle one was cut to the fact.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Version, sentence | `POLICIES[]` | `policy.draft` (#3920) | future |

### Logic
1. `policyRestore()` adds a draft that reads "restores <version>" with the old version's rule count and tests, and toasts "Drafted <new> from <old>."
2. The warning quotes the sentence of the version being restored, because that change is what the restore undoes.

### States
- **Mobile**: a bottom sheet.
