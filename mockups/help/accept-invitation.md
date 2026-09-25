# Accept invitation

## Page header {#accept-invitation/header}

The eyebrow "Invitation" and the title "Join Anderson Intelligence Corp. on oxagen", with no lead.

### Purpose
You followed an invitation link. The header names the organization you are being asked to join, so you know at a glance whether the invitation is one you expected.

### Rationale
The organization's name is the title because it is the one fact that decides whether you accept. Everything else, who sent it and what role it carries, sits in the card below where you can read it before you act. There is no lead because the card says it all. This is the path for someone joining an organization another person created: it skips sign-up's organization step and the onboarding gate, since the organization and its workspace already exist.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Organization name | `ORG.name` | `org.invitations` | live |

### Logic
- The header has no controls.
- `obInvite()` draws it inside the wide form of the auth shell, 560 px, so the facts list fits on one line per row.

### States
- **Loading** and **error**: the header does not change.
- **Denied**: the header is not drawn. The Wrong account card replaces the whole card.
- **Mobile**: the title drops from 28 px to 23 px and wraps.

## Invitation card

Who invited you and when, the organization and workspace roles on offer, what the workspace role lets you do, and **Accept invitation** or **Decline**.

### Purpose
You check who sent the invitation and what access it gives, then accept or decline it. The footer under the card confirms which account will join.

### Rationale
An invitation grants roles, and roles grant authority, so the card shows the exact grants before you accept: organization role `member` and workspace role `owner` on `core-platform`. The paragraph under the facts says what the workspace role lets you do and what it does not: "As workspace owner you can register agents, grant tools, set budgets, and approve parked calls in core-platform. You cannot change organization billing or the data plane." It stays on the page because it describes this invitation's grant, not how Oxagen works in general. The inviter's name and role come first because who sent it is what tells you whether to trust it.

The Decline toast used to add "nothing else changes". It now reads "Invitation declined. The inviter is told." Declining touches only the invitation.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Inviter, role and sent date | `PEOPLE.priya`, literal `11 Sep 2026` | `org.invitations` | live |
| Organization and namespace | `ORG.name`, `ORG.slug` | `org.invitations` | live |
| Workspace and main repo | `ws()` over `FIXTURES.WS` | `org.invitations` | live |
| Organization role, workspace role | literals `member`, `owner` | `iam.role_grants` | live |
| Expiry | literal `18 Sep 2026` | `org.invitations` | live |
| Role paragraph | literal in `obInvite()` | `iam.role_grants` | live |
| Signed-in address | `PEOPLE.marcus.email` | `auth.sessions` | live |

### Logic
- The inviter row shows Priya Natarajan's avatar (`personAv("priya", 38)`), her name, and "organization owner · invited you on 11 Sep 2026".
- The facts list (`kvl`) has five rows: Organization, Organization role, Workspace, Workspace role, Invitation expires.
- The renderer writes the roles and dates as literals. The page spec names `FIXTURES.INVITES` as the source, and those rows are for other invitees. The build must read every fact from the invitation record and write the role paragraph from the offered workspace role.
- **Accept invitation** (gold) calls `obSignedIn()`, which goes to Work and toasts "Signed in as Marcus Bell." The build grants both roles and records `org.invitation.accept` in Audit.
- **Decline** toasts the line above. The build records `org.invitation.decline` and notifies the inviter.
- The footer reads "Signed in as `marcus@a-intel.example` · **Not you?**". Not you? goes to Log in, so the invited address can sign in.

### States
- **Loading**: **Accept invitation** shows a spinner and "Accepting…". **Decline** stays.
- **Error**: a red message at the top of the card, "**This invitation has already been accepted.** It was used on 10 Sep 2026 at 09:14. Log in instead." The rest of the card stays.
- **Mobile**: the facts stack label over value, and the buttons fill the width.

## Wrong account

The card that replaces the invitation when you are signed in as someone other than the invited address.

### Purpose
The invitation cannot be accepted by the account you are using. The card names both addresses and gives you the way to switch.

### Rationale
An invitation is bound to one address, so the grant goes to the person the inviter chose and not to whoever opened the link. The card names the inviter, the invited address and your current address, because the fix depends on which of the three is wrong. It offers two ways out in prose, log in as the invited address or ask the inviter to send a new invitation, and one button for the first. It has no gold action because accepting is not possible from here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Inviter | `PEOPLE.priya` | `org.invitations` | live |
| Invited address | `PEOPLE.marcus.email` | `org.invitations` | live |
| Current address | `PEOPLE.dana.email` | `auth.sessions` | live |

### Logic
- `obInvite()` returns this card when the state is `denied`. It uses `.ob-state.deny` with a lock glyph.
- The title is "This invitation is for a different account". The body reads "Priya Natarajan sent it to `marcus@a-intel.example`. You are logged in as `dana@a-intel.example`. Log out and back in as the invited address, or ask Priya Natarajan to send a new invitation."
- **Log in as someone else** goes to Log in. The build ends the current session first.

### States
- **Denied**: this card, in place of the header and the invitation.
- **Mobile**: the card fills the width and the button is at least 44 px tall.
