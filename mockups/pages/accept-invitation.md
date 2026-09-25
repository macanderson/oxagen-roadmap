# Accept invitation

| | |
|---|---|
| Route | `#/welcome/invite` |
| Scope | auth |
| Spec | §14; Appendix F sign-in flows |
| Design | `mockups/src/engine.js` → `pWelcome(r) → obInvite()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / … / accept-invitation`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `accept-invitation.audit-prompt.md` |

## Job

Join an organization someone else created. The page shows who invited you, the organization and workspace roles offered, and what they let you do.

## What is on the page

**Header.** Eyebrow “Invitation”, h1 “Join Anderson Intelligence Corp. on Oxagen”. No lead.
Actions (inside the card): **Accept invitation** (gold) · **Decline**

- Inviter row: Priya Natarajan’s avatar (initials “PN”), name “Priya Natarajan”, and “organization owner · invited you on 11 Sep 2026”. A rule beneath it.
- Facts (`kvl`): **Organization** “Anderson Intelligence Corp. (a-intel)” · **Organization role** “member” · **Workspace** “core-platform (main repo a-intel/platform)” · **Workspace role** “owner” · **Invitation expires** “18 Sep 2026”.
- Dim copy: “As workspace owner you can register agents, grant tools, set budgets, and approve parked calls in core-platform. You cannot change organization billing or the data plane.”
- Footer: “Signed in as `marcus@a-intel.example` · **Not you?**” (a link to Log in).

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The auth shell (`obShell`) is the brandmark at the top, then a centred card in its wide form. The phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Invitation, inviter, roles | `FIXTURES.INVITES`, `PEOPLE.priya`, `FIXTURES.ORG`, `FIXTURES.WS[0]` | `org.invitations`, `iam.role_grants` | `org.invitations`; `org.member.*` | ✅ |

## Functionality

- **Accept invitation** (`obSignedIn`) signs in and lands on Work with the toast “Signed in as Marcus Bell.”
- **Decline** toasts “Invitation declined. The inviter is told.”
- Not you? goes to Log in so the invited address can sign in.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading**: the Accept button shows a spinner and “Accepting…”. Decline stays.
- **error**: an inline error at the top of the card: “**This invitation has already been accepted.** It was used on 10 Sep 2026 at 09:14. Log in instead.” The rest of the card stays.
- **access denied**: the card is replaced by a full-card state with a lock glyph: h2 “This invitation is for a different account”, then “Priya Natarajan sent it to `marcus@a-intel.example`. You are logged in as `dana@a-intel.example`. Log out and back in as the invited address, or ask Priya Natarajan to send a new invitation.” Action: **Log in as someone else** (goes to Log in). No gold action.

## Mobile

The card fills the width with 16 px gutters. The facts list stacks label over value. Buttons are full width and at least 44 px tall.

## Permissions

- Read: `invitation token`
- Writes (each a governed action recorded in Audit): `org.invitation.accept`, `org.invitation.decline`

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
- Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
