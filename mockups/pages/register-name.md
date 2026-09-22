# Register agent · Name

| | |
|---|---|
| Route | `#/a-intel/core-platform/register/name` |
| Scope | workspace gate |
| Spec | §14 Mission Control; Appendix F page 3 |
| Design | `mockups/src/engine.js` → `pRegister(r) → regName()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · access denied |
| Storybook | `Oxagen / … / register-name`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `register-name.audit-prompt.md` |

## Job

Step 1 of 3 of Register agent: reserve the agent key. The key is reserved now and is immutable. The agent exists only after its first frame reaches Oxagen.

## What is on the page

**Header.** Eyebrow “Step 1 of 3”, h1 “Name the agent”, lead “The key is reserved now and is immutable.”
Actions (card footer): **Cancel** · **Continue** (gold). The shell carries a second **Cancel** at the top right.

- Card, a two-by-two grid of fields:
  - **Slug**: input `#regSlug`, demo value `perf-watch`. Hint “The agent key becomes `a-intel.core.perf-watch`.” The key in the hint and in the note below rewrites on every keystroke (`regKeyLive`).
  - **Workspace**: read-only input, “Core platform · a-intel/platform”. Hint “Its definition file lands in `.oxagen/agents/` in the main repo.”
  - **Harness**: select with `claude-code`, `codex-cli`, `stella`, `claude-agent-sdk`, `custom`. Hint “Picks the installer on the next step. It can be changed there.”
  - **Model tier**: select with `complex`, `light`. Hint “The harness calls the model with its own key. The tier is recorded on every frame.”
- Note under the grid: “Continue mints a one-time enrollment token for `a-intel.core.perf-watch`. Nothing is written to Postgres and no PR is opened until the first frame arrives; the smoke session then opens the Context PR that adds the definition file.”

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The gate shell (`regShell`) is the brandmark, the signed-in email `marcus@a-intel.example`, and a **Cancel** button, then a three-step rail (`nav` labelled “Register an agent”): 1 Name the agent, 2 Wrap the agent, 3 Wait for the first frame. The current step carries `aria-current="step"`, a done step shows ✓ and is a button back to that step, and a later step is disabled. Under the card a caption reads “Registration does not complete until the agent has talked to Oxagen. That first frame is also the installer’s smoke test, so there is one path, not two. Cancel at any time. Nothing is kept until the frame arrives.” The phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Key reservation, enrollment token | `S.reg` (`regNew`, `regKey`) | `iam.principals` (minted at first frame), `control.enrollments` | `tacho.enrollment.create` | ✅ / 🟡 no gate state (G16) |
| Workspace and main repo | `FIXTURES.WS` (`ws()`) | `wrk.workspaces`, `wrk.repositories` | `workspace.workspaces`, `ingestion.repository_bindings` | ✅ |

## Functionality

- The slug is normalised live: lower case, letters, digits, and hyphens only, and `agent` when empty (`regSlug`). The key is `<org>.<first segment of the workspace slug>.<slug>`, so `core-platform` gives `a-intel.core.perf-watch`.
- Changing the harness preselects the matching tab on the wrap step (`regTabFor`: Claude Code, Codex CLI, or SDK agent for everything else).
- Continue goes to `/register/wrap`. Nothing is written yet.
- Either Cancel (`regCancel`) clears `S.reg` and its timers, returns to Fleet, and toasts “Registration cancelled. Nothing was installed and nothing was written.”

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading**: the shell and the rail stay. The card is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **access denied**: “You cannot see agent registration”, then “Your roles on Anderson Intelligence Corp. do not include `agent.register on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (gold, opens dialog `request-access`), **Back to Fleet**. Below: *Signed in as* “Marcus Bell · workspace.owner · core-platform”, *Needed* “agent.register on core-platform”, *Decided by* “pol_v41 · deny wins over every allow”.

## Mobile

The card fills the width with 16 px gutters. Buttons are full width and at least 44 px tall. Inputs are 16 px so iOS does not zoom on focus. There is no thumb bar on a gate page.

## Permissions

- Read: `agent.register`
- Writes (each a governed action recorded in Audit): `agent.register` (the token mint on Continue)

## Backend gaps this page depends on

- G16 `org.onboarding_state` and the first-frame unlock

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger. A client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen. Gold is identity and never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do. Nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
- Headings are plain nouns: no heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence or nothing.
- Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
