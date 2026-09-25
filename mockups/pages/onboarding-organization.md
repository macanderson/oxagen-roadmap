# Onboarding · Organization

| | |
|---|---|
| Route | `#/welcome/organization` |
| Scope | onboarding gate |
| Spec | §14; Appendix F onboarding (the gate) |
| Design | `mockups/src/engine.js` → `pWelcome(r) → obOrg()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / … / onboarding-organization`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `onboarding-organization.audit-prompt.md` |

## Job

Step 1 of 3 of the gate after sign-up: name the organization and its first workspace. The organization is the tenant. It owns its graph database, its encryption key, its billing account, and the namespace in every agent key.

## What is on the page

**Header.** Eyebrow “Step 1 of 3”, h1 “Name your organization”, no lead. What the organization owns is in the component help (`mockups/help/onboarding-organization.md`, Page header).
Actions (card footer): **Cancel** · caption “Creates `org_a-intel` and its graph database.” · **Continue** (gold). The shell carries a second **Cancel** at the top right.

- **Organization name**: input `#ob-org`, demo value “Anderson Intelligence Corp.”.
- Two-column grid: **Address**: read-only input `#ob-url`, `oxagen.com/a-intel`, hint “Derived from the name. You can change it later.” · **Namespace**: input `#ob-ns` (`maxlength=6`), `a-intel`, hint “2–6 characters, **immutable**. Every agent key starts with it: `a-intel.<workspace>.<agent>`”.
- Divider, then h3 “First workspace”. Two-column grid: **Workspace name**: input `#ob-ws`, `core-platform` · **Governance mode**: select `#ob-mode` with `solo`, `team` (selected), `regulated`. No copy under the grid. What a workspace is is in the component help (`mockups/help/onboarding-organization.md`, Organization form).

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The gate shell (`regShell` in onboard mode): brandmark, `marcus@a-intel.example`, **Cancel** (the demo labels it “Exit demo”; the product build says “Cancel”); a three-step rail (`nav` labelled “Onboarding”): 1 Name the organization, 2 Wrap an agent, 3 Start a run, with step 1 current (`aria-current="step"`) and steps 2 and 3 disabled; no caption under the card (the gate's rationale is in `mockups/help/register-name.md`, Gate shell). The phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Organization, namespace, address | `FIXTURES.ORG` | `org.organizations` | `org.organizations` | ✅ / 🟡 gate state (G16) |
| First workspace | `FIXTURES.WS[0]` | `wrk.workspaces` | `workspace.workspaces` | ✅ |
| Governance mode | `ws.governance` (`solo`, `team`, `regulated`) | `wrk.workspaces.governance` (§14; the same value the Steering header chip and the Edit workspace dialog read) | none | ❌ |

## Functionality

- Continue (`regNav('wrap')`) provisions the tenant, `org_a-intel`, and its graph database, then moves to Wrap an agent, which is the Register agent wrap screen in onboard mode with the key `a-intel.core.release-manager`.
- The governance mode chosen here becomes the workspace setting that Steering shows as “Governance: team” and that the Organization workspaces table reads.
- Either Cancel (`obExit`) clears the onboarding state and goes to Work. Nothing is written until Continue.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading**: the shell and the rail stay. The card is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: an inline error above the fields: “**That namespace is taken.** `a-intel` belongs to another organization. Pick a different 2–6 character namespace.” The Namespace input is marked bad (`ob-bad`). Everything else stays.
- **access denied**: “You cannot see onboarding”, then “Your roles on Anderson Intelligence Corp. do not include `org.create for marcus@a-intel.example`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (gold, opens dialog `request-access`), **Back to Work**. Below: *Signed in as* “Marcus Bell · workspace.owner · core-platform”, *Needed* “org.create for marcus@a-intel.example”, *Decided by* “pol_v41 · deny wins over every allow”.

## Mobile

The card fills the width with 16 px gutters. The two-column grids stack. Buttons are full width and at least 44 px tall. Inputs are 16 px so iOS does not zoom on focus.

## Permissions

- Read: `authenticated`
- Writes (each a governed action recorded in Audit): `org.create`, `workspace.create`

## Backend gaps this page depends on

- G16 `org.onboarding_state`

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger. A window the harness reported is labeled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen. Gold is identity and never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do. Nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
- Headings are plain nouns: no heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence or nothing.
- Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
