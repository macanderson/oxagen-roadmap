# Sign up

| | |
|---|---|
| Route | `#/welcome/signup` |
| Scope | auth |
| Spec | §14; Appendix F sign-in flows (not a page) |
| Design | `mockups/src/engine.js` → `pWelcome(r) → obSignup()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error |
| Storybook | `Oxagen / … / signup`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `signup.audit-prompt.md` |

## Job

Create the account with Google, GitHub, or email and password. This is the first screen of the sixty-seconds-to-governed path: sign up, verify email, name the organization, wrap an agent, start a run.

## What is on the page

**Header.** Eyebrow “Create your account”, h1 “Govern the agents you already run.”, lead “Wrap Claude Code, Codex CLI, Stella or an SDK agent, with an included monthly allowance of governed actions and every governance feature on.”
Actions: **Create account** (gold, full width, `type=submit`)

- Sign up with: **Continue with Google** · **Continue with GitHub** (each with its glyph), then a rule reading “or”.
- Form: **Name** (`#ob-name`, `autocomplete=name`) · **Work email** (`#ob-email`, `type=email`, `autocomplete=email`) · **Password** (`#ob-pw`, `autocomplete=new-password`, **Show** / **Hide** toggle, a four-segment strength meter, and the requirement list “✓ at least 12 characters · ✓ one symbol · ✓ one digit”, each ticking as the value meets it).
- Terms line under the button: “By creating an account you agree to the oxagen Terms and Privacy Notice.” How Oxagen stores model provider keys is in the component help (`mockups/help/signup.md`, Sign-up form).
- Footer: “Already have an account? **Log in**”.
- Tags under the footer: “included monthly allowance” · “no token markup” · “SOC 2 evidence built in”.

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The auth shell (`obShell`) is the brandmark at the top, then a centred card. The phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Account | `S.ob`, `PEOPLE.marcus` | `auth.users` (Better Auth) | Better Auth pages | ✅ |
| Included allowance (the tag) | `BILLING` (ADR-055, the governed-action allowance) | `billing.plans` | `packages/billing` | ✅ |

## Functionality

- Submit (`obGo('verify')`) goes to Verify email. Google and GitHub (`obGo('organization')`) go straight to Name the organization.
- The meter and the requirement list update on every keystroke (`obPwMeter`). Show and Hide toggle both the field type and the button label.
- Log in goes to `login.md`.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading**: the primary button shows a spinner and “Creating account…” and is `aria-disabled`. The form stays.
- **error**: an inline error above the sign-up buttons: “**That email is already registered.** Log in instead, or reset your password.” The email field is marked bad (`ob-bad`) with the hint “An account for this address was created on 9 Sep 2026.”

## Mobile

The card fills the width with 16 px gutters. Buttons are full width and at least 44 px tall. Inputs are 16 px so iOS does not zoom on focus. The tags wrap onto two rows.

## Permissions

- Read: `public`
- Writes (each a governed action recorded in Audit): `auth.signup`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger. A window the harness reported is labeled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen. Gold is identity and never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do. Nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
- Headings are plain nouns: no heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence or nothing.
- Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price. The allowance is counted in governed actions, never in runs.
