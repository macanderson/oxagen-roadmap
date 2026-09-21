# Onboarding · Wrap an agent

| | |
|---|---|
| Route | `#/welcome/wrap` |
| Scope | onboarding gate |
| Spec | §14 Mission Control; Appendix F onboarding (the gate) |
| Design | `mockups/src/engine.js` → `pWelcome(r) → regWrap()` in onboard mode, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · access denied |
| Storybook | `Oxagen / … / onboarding-wrap`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `onboarding-wrap.audit-prompt.md` |

## Job

Step 2 of 3 of the gate: wrap the first agent. This is the Register agent wrap screen in onboard mode, carrying the enrollment token for the organization’s first agent key, `a-intel.core.release-manager`.

## What is on the page

**Header.** Eyebrow “Step 2 of 3”, h1 “Wrap an agent”, lead “The installer carries a one-time enrollment token for `a-intel.core.release-manager`, so nothing is copied or pasted.”
Actions (card footer): **Cancel** · **Back** · caption “Nothing completes until a frame arrives.” · **I have already installed it — continue**. The gold action is **Download for <OS>** inside the Claude Code and Codex CLI panels. The SDK panel has no gold action.

- Harness tabs (`role=tablist`, “How to wrap the agent”): **Claude Code** “one click · harness” · **Codex CLI** “one click · harness” · **SDK agent** “five lines · harness”. Claude Code is preselected (the onboarding record’s harness is `claude-code`).
- The three panels are the ones in `register-wrap.md`, word for word, with the key `a-intel.core.release-manager` in the SDK code: Claude Code (h3 with “recommended”, the installer copy, the tier ladder This agent `harness` · Next rung `gateway` · Top rung `contained`, the tier sentence, the Download column with OS tabs macOS · Windows · Linux, **Download for macOS**, the `REG_PKG` package line, the token box with `oxe_1time_7QK4M2NV9XR3T8ZP` and “expires in 30 min · single use”, and `oxagen agent enroll --token …`); Codex CLI (the `~/.codex/config.toml` copy, “or observe” on the ladder, “profile: codex-cli”, `oxagen agent enroll --harness codex-cli`); SDK agent (the five-line copy, the “Agent credential” box, the install line, language tabs TypeScript · Python · Go, **Copy the five lines**, the code).

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The gate shell (`regShell` in onboard mode): brandmark, `marcus@a-intel.example`, **Cancel**; the rail (`nav` labelled “Onboarding”) with step 1 Name the organization done (✓, a button back), step 2 Wrap an agent current, step 3 Start a run disabled; the caption “The operator console does not open until an agent has talked to Oxagen. That first frame is also the installer’s smoke test, so there is one path, not two.” The phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Enrollment token, harness tab | `S.reg` (mode `onboard`, `obNew`), `REG_TABS`, `REG_TOKEN` | `control.enrollments` | `tacho.hosts`; `tacho.enrollment.create` | ✅ |
| Signed packages | `REG_PKG` | release artefacts (signed) | release pipeline | 🟡 |
| Tier ladder | `TIERS`, `tierBadge` | `iam.principals.tier` (per run, from what was routed) | `tacho` run records | ✅ |

## Functionality

- Identical to `register-wrap.md`. **Download for <OS>** records the harness, toasts “Signed installer for <OS> downloaded with the one-time token embedded.”, and moves to Start a run. **I have already installed it — continue** moves there without changing the harness.
- **Back** returns to Name the organization, not to an agent name step. Either Cancel (`obExit`) clears the onboarding state and goes to Fleet.
- The tier ladder shows all four tiers as real: `harness` for this agent, `gateway` and `contained` as the next rungs, and `observe` as the fallback for a Codex CLI without an approval hook.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell), Claude Code tab and macOS selected.
- **loading**: the shell and the rail stay. The card is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **access denied**: “You cannot see onboarding”, then “Your roles on Anderson Intelligence Corp. do not include `org.create for marcus@a-intel.example`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (gold, opens dialog `request-access`), **Back to Fleet**. Below: *Signed in as* “Marcus Bell · workspace.owner · core-platform”, *Needed* “org.create for marcus@a-intel.example”, *Decided by* “pol_v41 · deny wins over every allow”.

## Mobile

The card fills the width with 16 px gutters. The two panel columns stack. Buttons are full width and at least 44 px tall. Code blocks scroll sideways inside the card.

## Permissions

- Read: `authenticated`
- Writes (each a governed action recorded in Audit): `enrollment.create`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger. A client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen. Gold is identity and never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do. Nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
- Headings are plain nouns: no heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence or nothing.
- Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
