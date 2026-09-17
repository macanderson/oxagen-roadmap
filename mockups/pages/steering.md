# Steering

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering[/<tab>]` |
| Scope | workspace |
| Spec | §14 Mission Control; Appendix F page 6 |
| Design | `mockups/src/engine.js` → `pSteering()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Mission Control / … / steering`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering.audit-prompt.md` |

## Job

Published context records, proposals, and open Context PRs. A record becomes published by being merged, never by being saved here.

## What is on the page

**Header** — eyebrow “Workspace · <workspace name>”, h1 “Steering”.
Actions: **Write a context record** (gold; opens the record wizard: describe → kind → statement → checks → pull request)

- **Tabs**: Records (N) · Proposals (N) · Context PRs (N). The Context PRs count includes an operator's open pull request as well as the promoter's.
- Published records are listed **newest first**. Without an order, a record merged a moment ago lands wherever the collection happens to put it, which on a workspace with sixty of them is the one record the operator cannot find.
- **Records** — Published records as cards grouped by kind (chips: All · rule · constraint · procedure · fact · memory · preference; the six kinds of `context-record/v0.1`, icon + hue per kind, the statement always the headline); search, sort, pager. On disk: the `.oxagen/` tree (Stella symlinks into it). Delivery — three ways, all recorded.
- **Proposals** — candidates that steer nothing until merged: each with its evidence and **Review**.
- **Context PRs** — Pull request · Branch · **Opened by** · State. A row is selectable; the selected pull request is shown below it. Two things open one, and the table says which: the **promoter**, out of runs it aggregated into a proposal, and **a person**, out of the record wizard. The lifecycle is the same for both — the same six checks, run one at a time, the same merge, the same promotion event, the same bundle bump — and only the pull request body differs, because a promoter argues from runs and a person argues from the person.
  - The selected PR shows: the file it carries (`.oxagen/rules/<lineage>.toml`), the pull request body, the Checks list with each check's own result text computed for *that* record, and either **What merge will do** (five numbered consequences) or, once merged, the **promotion_event**.
  - **Merge pull request** is disabled until every check reports, and is a no-op if called anyway. An operator's PR also offers **Close without merging**, which discards the branch and publishes nothing; a merged one cannot be closed, because taking a published record back out of force is its own pull request.
  - On merge: the record enters `RECORDS`, the bundle gains its rule and one version, one `steering_published` audit event is written, and the panel offers **Open the record** and **See it in Records**.
  - **While a pull request is open the record steers nothing** — it is not in Records, not in the compiled bundle, not in the audit log, and the bundle version has not moved. `tools/check-record-e2e.mjs` asserts each of those separately.

**Dialogs this page opens:** `wz (record wizard)`, `ctxpr` (opened from a proposal, which already has its concern, kind and evidence), `review (proposal)`.

Every published record card carries **Open**, which routes to `pages/record.md`. Every creation wizard is `DLG_EXT.wz`; its spec is `docs/creation-spec.md`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Skills · Steering · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Records | `RECORDS` | `:Record` + git `.oxagen/rules/` | `agent.context_records`, `context_record_versions`; `context.record.*` | ✅ |
| Proposals, Context PRs | `PROPOSALS` | `PROPOSES`, `PROMOTED_BY` | `agent.context_promotions`; `agent.memory_promotion.*` | 🟡 |

## Functionality

- A record can never grant authority: checks enforce `constraint_effect ∈ {require, forbid}` and a repository record may narrow what a workspace record allows, never widen it.
- Nav count on Steering = proposals waiting for a person.
- Merging is done on GitHub through the Context PR; the page shows what merge will do and the check results.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “Nothing steers this workspace yet” — published records live in `.oxagen/rules/` on the main repo. Action: **Write a context record** (opens the record wizard, which ends on a Context PR).
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Steering could not be loaded” — `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see this workspace’s steering” — the roles the signed-in person holds on the organization do not include `steering.read on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering, Skills, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `steering.read`
- Writes (each a governed action recorded in Audit): `context.propose (open a Context PR)`, `context.review`, `context.retire`

## Backend gaps this page depends on

- Context PR state from GitHub

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
