# Sign up

| | |
|---|---|
| Route | `#/welcome/signup` |
| Scope | auth |
| Spec | §14 Mission Control; Appendix F sign-in flows (not a page) |
| Design | `mc.html` → `obSignup()` (the single source; `consolidated.html` is the product build of it) |
| States | loaded · loading · error |
| Files | `signup-loaded.html` / `signup-loaded-mobile.html`, `signup-loading.html` / `signup-loading-mobile.html`, `signup-error.html` / `signup-error-mobile.html` |
| Audit | `signup.audit-prompt.md` |

## Job

Create the account — SSO, or email and password. The first of the sixty-seconds-to-governed path: sign up → verify email → name the organization → wrap an agent → start a run.

## What is on the page

**Header** — eyebrow “Create your account”, h1 “Govern the agents you already run.”. Lead: wrap Claude Code, Codex CLI, Stella or an SDK agent; the first 1,000 runs a month free with every governance feature on. Tags: runs free / month · no token markup · SOC 2 evidence built in.
Actions: **Create account** (gold, full width)

- SSO: **Continue with Google** · **Continue with GitHub** · **Continue with SAML SSO** — then “or”.
- Form: Name · Work email · Password (show/hide, strength meter, requirements: ≥ 12 characters, one symbol, one digit). Terms line: Oxagen never stores model provider keys in plain text and never returns them once saved.
- Footer: “Already have an account? Log in”.


**Shell.** No sidebar or top bar: the brandmark, then a centred card; the phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/2026-09-12-mission-control-app-implementation-plan.md` §3; the *mockup collection* column names the constant in `mc.html` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Account | `S.ob`, `PEOPLE.marcus` | `auth.users` (Better Auth) | Better Auth pages | ✅ |

## Functionality

- Submit goes to Verify email; SSO goes straight to Name the organization.
- Loading disables the primary button with a spinner (“Creating account…”).

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading** — The primary button shows a spinner and “Creating account…” and is `aria-disabled`.
- **error** — Inline error above the form: “That email is already registered. Log in instead, or reset your password.” The email field is marked bad with the hint “An account for this address was created on <date>.”

## Mobile

The card fills the width with 16 px gutters; buttons are full width and at least 44 px tall; inputs are 16 px so iOS does not zoom on focus; code inputs are numeric-keypad (`inputmode="numeric"`).

## Permissions

- Read: `public`
- Writes (each a governed action recorded in Audit): `auth.signup`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
