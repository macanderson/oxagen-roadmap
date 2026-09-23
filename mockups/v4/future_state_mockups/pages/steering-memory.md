# Steering · Memory

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/memory` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 1, 4, 5, and 9); `steering.md` is the hub this tab belongs to |
| Design | `mockups/src/engine.js` → `stgMemoryTab()`, inside `pSteering()` and `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / steering-memory`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering-memory.audit-prompt.md` |

## Job

What an agent's own runs left behind, and how it competes. Memory is recalled, never published, so it enters only the volatile selection and gives way to anything published that says otherwise.

## What is on the page

**Hub header.** Eyebrow “Workspace · <workspace name>”, h1 “Steering”, and one lead paragraph: everything that can steer an agent in this workspace competes in one assembler, each item is a file proposed as a pull request and published by a merge, and Preview shows what an agent would receive, what was cut, and why.

**The seven tabs, in this order:** Records (N published) · Skills (N in scope) · Memory (N) · Ontology (N) · Policy (N gates) · Proposals (N candidates plus open pull requests) · Preview. Each tab is a URL segment, `#/:org/:ws/steering/<tab>`. The hash is read on load and on `hashchange`; a tab changed by code writes the hash back with `replaceState`, so every view is a link. The bare route `#/:org/:ws/steering` is Records.

Header action: **Write a context record** (gold; opens the record wizard: describe, kind, statement, checks, pull request).

- A lead note states the precedence rule in its own words: **A published must beats recalled memory.** Memory competes only in the volatile selection, as `may` or `info`. To make a memory binding, promote it: a proposal, a pull request, a merge.
- **Recalled memory** table: Memory (the body, with its id and provenance: run, frame, and whether a steer or a reflection wrote it) · Class (`RULE`, `FACT`, `EPISODE`, `PREFERENCE`) · Force · Scope (workspace, or agent with the agent's slug) · Last recalled (with recalls in 30 days) · Token cost · In the assembler.
- **In the assembler** has three values. **competes**: the item is ranked per prompt like any other. **yields**: a published `must` contradicts it, and the cell links the record. **superseded**: a published record replaced it, and the cell links the record.
- **See one yield in Preview** sets the Preview prompt to “CI is green, merge the release pull request” and opens Preview, where `mem_01K5QX7C` is cut as lower precedence by `ctx.release.never-merge`.
- A closing line: recall used to reach only the in-app agent, capped at six items. It now goes through the same assembler as every other source.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Repositories · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · connection badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). Skills has no nav entry of its own: it is a tab of Steering.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Memory items | `MEMORY` | `:AgentMemory` in the graph, read by the assembler's memory adapter | `packages/agent/src/runtime/assistant-recall.ts` recalls for the in-app agent only, capped at 6 | 🟡 |

## Functionality

- Nothing on this tab is authored here. A memory is written by a run and leaves by being superseded or promoted.
- The status cell is computed by the same precedence code the assembler runs, so the tab and Preview cannot disagree.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header and the seven tabs stay, and the tab body is “Nothing has been recalled yet”. No run in this workspace has written a memory, so nothing competes from here. No action: nothing on this tab is authored here.
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton (four tile blocks and a panel of seven rows).
- **error**: “Steering could not be loaded”, `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied**: “You cannot see this workspace’s steering”. The roles the signed-in person holds on the organization do not include `steering.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The seven tabs are one scrolling strip with scroll snap, and the tab in view is scrolled to on render; the page itself never scrolls sideways. Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet**, **Agents**, **Tools**, **Spend**, **More**. **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace, and it is the lit slot on every Steering tab. Every dialog rises from the bottom edge as a sheet; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- No writes on this tab.

## Backend gaps this page depends on

- The `:AgentMemory` source adapter for wrapped agents (Phase 1). Today recall reaches only the in-app agent.

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen". `gateway` and `contained` appear only as tiers not yet available.
- Every badge that describes trust (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, or a dashed outline, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
