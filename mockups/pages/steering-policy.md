# Steering · Policy

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/policy` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 3, 5, and 9); `steering.md` is the hub this tab belongs to |
| Design | `mockups/src/engine.js` → `stgPolicyTab()`, inside `pSteering()` and `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / steering-policy`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering-policy.audit-prompt.md` |

## Job

The gates, shown as the second compilation. A gate is deterministic, never budgeted, and never ranked. This tab lists each gate with the one-line gate notice it puts into steering, and links to where the gate is edited. It edits nothing.

## What is on the page

**Hub header.** Eyebrow “Workspace · <workspace name>”, h1 “Steering”, and one lead paragraph: everything that can steer an agent in this workspace competes in one assembler, each item is a file proposed as a pull request and published by a merge, and Preview shows what an agent would receive, what was cut, and why.

**The seven tabs, in this order:** Records (N published) · Skills (N in scope) · Memory (N) · Ontology (N) · Policy (N gates) · Proposals (N candidates plus open pull requests) · Preview. Each tab is a URL segment, `#/:org/:ws/steering/<tab>`. The hash is read on load and on `hashchange`; a tab changed by code writes the hash back with `replaceState`, so every view is a link. The bare route `#/:org/:ws/steering` is Records.

Header action: **Write a context record** (gold; opens the record wizard: describe, kind, statement, checks, pull request).

- Two panels side by side. **The first compilation: text**: every item compiles to text the model reads; text is advisory, ranked, budgeted, and may be dropped. **The second compilation: gates**: an item with an enforcement grant also compiles to a gate; a gate is deterministic, never budgeted, never ranked, and it answers when the index is down.
- **Gates, and the notice each one puts into steering** table: Gate (its kind, `decision rule`, `mandate`, or `kill switch`, with its source: a policy rule id, a mandate id, a switch id, or the record whose grant compiled it) · Outcome (the same gate badge Tools renders: needs approval, denied, kill switch) · Applies to · Gate notice (the one line, with the notice's item id) · Notice cost (tokens) · Edited on (a button).
- **Edited on** links out. A decision rule opens Tools · Policy. A kill switch opens Tools · Kill switches. A mandate opens its own Mandate page. A gate compiled from a record's grant opens the record. The missing-mandate gate opens Tools · Mandates. No editor is duplicated here.
- A closing note: a gate notice is one line, so the agent does not spend turns walking into a denial. The assembler puts every notice that applies at the head of the stable prefix and never drops one.
- A second note carries the status vocabulary: for actions routed through Oxagen, the call is refused on the server. On the `harness` tier the four blocking hook events refuse a harness-native call, client-attested and fail-open.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Repositories · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · connection badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). Skills has no nav entry of its own: it is a tab of Steering.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Gates and notices | `GATES` | compiled from `workspaces.settings.decisionRules`, `tools.mandates`, kill switches, and records with an enforcement grant | rules and mandates refuse calls at `kernel.invoke()`; none produces prompt text today | 🟡 |

## Functionality

- A gate notice is a `SteeringItem` of kind `policy` and force `must`. It is never budgeted and never ranked.
- A gate whose tool no agent holds emits no notice, and its row says so.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header and the seven tabs stay, and the tab body is “No gate applies to this workspace yet”. No decision rule, mandate, or kill switch reaches an agent here, so no gate notice enters steering. Action: **Open Tools · Policy**.
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton (four tile blocks and a panel of seven rows).
- **error**: “Steering could not be loaded”, `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied**: “You cannot see this workspace’s steering”. The roles the signed-in person holds on the organization do not include `steering.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The seven tabs are one scrolling strip with scroll snap, and the tab in view is scrolled to on render; the page itself never scrolls sideways. Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet**, **Agents**, **Tools**, **Spend**, **More**. **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace, and it is the lit slot on every Steering tab. Every dialog rises from the bottom edge as a sheet; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- No writes on this tab. Gates are edited on Tools and on the Mandate page, under their own permissions.

## Backend gaps this page depends on

- The gate notice source adapter, from rules and mandates (Phase 1)
- Bundle permissions filled from the second compilation (Phase 4)

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen". `gateway` and `contained` appear only as tiers not yet available.
- Every badge that describes trust (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, or a dashed outline, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
