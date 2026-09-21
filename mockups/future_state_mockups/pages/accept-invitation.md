# Accept invitation

| | |
|---|---|
| Route | `#/welcome/invite` |
| Scope | auth |
| Spec | §14 Mission Control; Appendix F sign-in flows |
| Design | `mockups/src/engine.js` → `obInvite()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / … / accept-invitation`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `accept-invitation.audit-prompt.md` |

## Job

Join an organization someone else created: who invited you, the organization and workspace roles offered, and what they let you do.

## What is on the page

**Header** — eyebrow “Invitation”, h1 “Join <organization> on Oxagen”.
Actions: **Accept invitation** (gold) · **Decline**

- Inviter card (avatar, name, “organization owner · invited you on <date>”). Facts: Organization (slug) · Organization role · Workspace (main repo) · Workspace role · Invitation expires. What the workspace role lets you do and not do. Footer: “Signed in as <email> · Not you?”.


**Shell.** No sidebar or top bar: the brandmark, then a centred card; the phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Invitation | `INVITES`, `PEOPLE` | `org.invitations` | `org.invitations`; `org.member.*` | ✅ |

## Functionality

- Accept signs in and lands on Fleet; Decline tells the inviter and changes nothing else.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading** — Accept button busy: “Accepting…”.
- **error** — “This invitation has already been accepted. It was used on <date> at <time>. Log in instead.”
- **access denied** — Full-card state: “This invitation is for a different account” — sent to X, you are logged in as Y. Action: **Log in as someone else**.

## Mobile

The card fills the width with 16 px gutters; buttons are full width and at least 44 px tall; inputs are 16 px so iOS does not zoom on focus; code inputs are numeric-keypad (`inputmode="numeric"`).

## Permissions

- Read: `invitation token`
- Writes (each a governed action recorded in Audit): `org.invitation.accept / decline`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
