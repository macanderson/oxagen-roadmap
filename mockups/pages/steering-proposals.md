# Steering · Proposals

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/proposals[/prs]` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 8, 9, and 13); `steering.md` is the hub this tab belongs to |
| Design | `mockups/src/engine.js` → `pSteering() (the proposals branch), prpDetail(), ctxprTab()`, inside `pSteering()` and `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Mission Control / … / steering-proposals`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering-proposals.audit-prompt.md` |

## Job

The way in: a record becomes a proposal, a proposal becomes a pull request, a merge publishes it. This is the flow the Steering page already had, unchanged in substance. Context PRs is now a view inside this tab instead of a tab of its own.

## What is on the page

**Hub header.** Eyebrow “Workspace · <workspace name>”, h1 “Steering”, and one lead paragraph: everything that can steer an agent in this workspace competes in one assembler, each item is a file proposed as a pull request and published by a merge, and Preview shows what an agent would receive, what was cut, and why.

**The seven tabs, in this order:** Records (N published) · Skills (N in scope) · Memory (N) · Ontology (N) · Policy (N gates) · Proposals (N candidates plus open pull requests) · Preview. Each tab is a URL segment, `#/:org/:ws/steering/<tab>`. The hash is read on load and on `hashchange`; a tab changed by code writes the hash back with `replaceState`, so every view is a link. The bare route `#/:org/:ws/steering` is Records.

Header action: **Write a context record** (gold; opens the record wizard: describe, kind, statement, checks, pull request). The header gives up the gold when the view below holds the one primary action (Open the Context PR on a proposal, Merge pull request on a pull request that passed).

- A two-way control under the tabs: **Candidates (N)** and **Context PRs (N)**, with the line “a record becomes a proposal, a proposal becomes a pull request, a merge publishes it”. Candidates is `/steering/proposals`; Context PRs is `/steering/proposals/prs` (`/steering/prs` still resolves).
- **Candidates**: proposals that steer nothing until merged, each a record card with its source, its support line computed from the supporting runs, its id, its state badge, and **Review**. Review opens the proposal: rationale, the measure, the supporting runs, the drafted record file, and **Open the Context PR**.
- **Context PRs**: Pull request · Branch · **Opened by** · State. A row is selectable; the selected pull request is shown below it. Two things open one, and the table says which: the **promoter**, out of runs it aggregated into a proposal, and **a person**, out of the record wizard. The lifecycle is the same for both.
  - Several operator pull requests may be open at once. Each keeps its own state, its own file, and its own checks.
  - The selected PR shows the file it carries (`.oxagen/rules/<lineage>.toml`), the pull request body, the Checks list with each check's own result text computed for that record, and either **What merge will do** or, once merged, the **promotion_event**.
  - **A check can fail, and a failed check stops the run where it stopped.** Merge stays disabled and nothing is published.
  - **Every check with a predicate is re-run at merge.** The lineage check counts published records and competing open pull requests; the pull request opened first keeps the claim.
  - Publishing compiles a bundle version and derives that version's digest from the rules it contains.
  - The file is serialised as TOML, not interpolated into it, and survives the round trip through the reader unchanged.
  - **Merge pull request** is disabled until every check reports, and is a no-op if called anyway. An operator's PR also offers **Close without merging**.
  - On merge: the record enters `RECORDS`, the bundle gains its rule and one version, one `steering_published` audit event is written, and the panel offers **Open the record** and **See it in Records**.
  - **While a pull request is open the record steers nothing.** It is not in Records, not in the compiled bundle, not in the audit log, and the bundle version has not moved. `tools/check-record-e2e.mjs` asserts each of those separately.
- Skills use the same flow: a skill is authored through a pull request of kind `skill`, listed on Repositories · Changes beside the record pull requests.

**Dialogs this tab opens:** `wz (record wizard)`, `ctxpr` (opened from a proposal), `review (proposal)`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Repositories · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · connection badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). Skills has no nav entry of its own: it is a tab of Steering.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Proposals | `PROPOSALS`, `PRP_SUPPORT`, `PRP_META` | `PROPOSES`, `PROMOTED_BY` | `agent.context_promotions`; `agent.memory_promotion.*` | 🟡 |
| Context PRs | `CTXPR`, `S.recprs`, `OXPRS` | GitHub pull requests on the main repo | the promotions ledger; Context PR state from GitHub is a gap | 🟡 |

## Functionality

- The tab count is candidates plus open pull requests.
- Merging is done on GitHub through the Context PR. The page shows what merge will do and the check results.
- A pull request opened from the record wizard lands here, on the Context PRs view, with its row selected.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header and the seven tabs stay, and the tab body is “No proposals yet”. Nothing has been proposed from this workspace's runs, and no pull request is open against `.oxagen/rules/`. Action: **Write a context record**.
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton (four tile blocks and a panel of seven rows).
- **error**: “Steering could not be loaded”, `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied**: “You cannot see this workspace’s steering”. The roles the signed-in person holds on the organization do not include `steering.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The seven tabs are one scrolling strip with scroll snap, and the tab in view is scrolled to on render; the page itself never scrolls sideways. Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet**, **Agents**, **Tools**, **Spend**, **More**. **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace, and it is the lit slot on every Steering tab. Every dialog rises from the bottom edge as a sheet; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- Writes (each a governed action recorded in Audit): `context.propose (open a Context PR)`, `context.review`, `context.retire`

## Backend gaps this page depends on

- Context PR state from GitHub

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen". `gateway` and `contained` appear only as tiers not yet available.
- Every badge that describes trust (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, or a dashed outline, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
