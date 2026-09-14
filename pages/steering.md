# Steering

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering[/<tab>]` |
| Scope | workspace |
| Spec | §14 Mission Control; Appendix F page 6 |
| Design | `mc.html` → `pSteering()` (the single source; `consolidated.html` is the product build of it) |
| States | loaded · empty · loading · error · access denied |
| Files | `steering-loaded.html` / `steering-loaded-mobile.html`, `steering-empty.html` / `steering-empty-mobile.html`, `steering-loading.html` / `steering-loading-mobile.html`, `steering-error.html` / `steering-error-mobile.html`, `steering-denied.html` / `steering-denied-mobile.html` |
| Audit | `steering.audit-prompt.md` |

## Job

Published context records, proposals, open Context PRs, effect metrics per record, and retirement candidates. A record becomes published by being merged, never by being saved here.

## What is on the page

**Header** — eyebrow “Workspace · <workspace name>”, h1 “Steering”.
Actions: **Open a Context PR** (gold; opens the ctxpr dialog)

- **Tabs**: Records (N) · Proposals (N) · Context PRs (N) · Effect · Retirement (N).
- **Records** — Published records as cards grouped by kind (chips: All · rule · constraint · procedure · fact · memory · preference; the six kinds of `context-record/v0.1`, icon + hue per kind, the statement always the headline); search, sort, pager. On disk: the `.oxagen/` tree (Stella symlinks into it). Delivery — three ways, all recorded.
- **Proposals** — candidates that steer nothing until merged: each with its evidence and **Review**.
- **Context PRs** — Pull request · Branch · Kind · State; the selected PR: body, Checks, What merge will do; **Merge pull request**.
- **Effect** — measured per published record: Lineage · Runs that rendered it · Cited · Violated · Proof rate before · After · Verdict on the record.
- **Retirement** — candidates: Lineage · Rendered · Cited · Proof before · After · Delta (**Open a retirement PR** → ctxretire dialog); Archived: Lineage · Published · Rendered · Cited · Why it was retired.

**Dialogs this page opens:** `ctxpr`, `ctxretire`, `review (proposal)`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Ontology · Steering · Spend; Organization nav: Organization · Billing · Audit; Assistant launcher; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, Assistant toggle, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/2026-09-12-mission-control-app-implementation-plan.md` §3; the *mockup collection* column names the constant in `mc.html` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Records | `RECORDS` | `:Record` + git `.oxagen/rules/` | `agent.context_records`, `context_record_versions`; `context.record.*` | ✅ |
| Proposals, Context PRs | `PROPOSALS` | `PROPOSES`, `PROMOTED_BY` | `agent.context_promotions`; `agent.memory_promotion.*` | 🟡 |
| Effect, retirement | hard-coded | effect metrics (M3) | none | ❌ |

## Functionality

- A record can never grant authority: checks enforce `constraint_effect ∈ {require, forbid}` and a repository record may narrow what a workspace record allows, never widen it.
- Nav count on Steering = proposals waiting for a person.
- Merging is done on GitHub through the Context PR; the page shows what merge will do and the check results.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “Nothing steers this workspace yet” — published records live in `.oxagen/rules/` on the main repo. Action: **Open a Context PR**.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Steering could not be loaded” — `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see this workspace’s steering” — the roles the signed-in person holds on the organization do not include `steering.read on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · assistant · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Ontology, Steering, Organization, Billing, Audit, Assistant, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `steering.read`
- Writes (each a governed action recorded in Audit): `context.propose (open a Context PR)`, `context.review`, `context.retire`

## Backend gaps this page depends on

- effect metrics and retirement (M3)
- Context PR state from GitHub

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
