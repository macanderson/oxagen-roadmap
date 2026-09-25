# Log in

## Page header {#login/header}

The eyebrow "Welcome back" and the title "Log in to oxagen", with no lead.

### Purpose
You are a returning operator and want to get back to Work. The header confirms you are on the right screen and gets out of the way.

### Rationale
There is no lead because there is nothing to explain: the form below is the whole task. Log in is the first of two steps for a password sign-in. Two-factor is the second, which is why that screen's eyebrow reads "Step 2 of 2" while this one has no step count. A Google or GitHub sign-in finishes here in one step.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow and title | literal in `obLogin()` | none, static copy | live |

### Logic
- The header has no controls.
- The footer under the card reads "New to oxagen? **Create an account** · Have an invitation? **Accept it**". Create an account goes to `#/welcome` (sign-up) and Accept it to `#/welcome/invite`.

### States
- **Loading** and **error**: the header does not change.
- **Denied**: the header is not drawn. The Suspended account card replaces the whole card.
- **Mobile**: the title drops from 28 px to 23 px.

## Log-in form

Work email, password with a **Forgot password?** link, the 30-day checkbox, and the gold **Log in** button.

### Purpose
You enter your email and password and move on to the second factor. If you forgot the password, the link sits beside its label, where you notice it.

### Rationale
The password field is the Password field of Sign up in its bare form: no meter and no requirement list, since a returning password is checked, not chosen. The browser's password manager fills the form because the email carries `autocomplete=username` and the password `autocomplete=current-password`.

Signing in is itself a governed action. The toast after a successful sign-in used to add "The session is recorded like any other governed action." That sentence moved here. `obSignedIn` now toasts only "Signed in as Marcus Bell." The build records `auth.login` as a governed action in Audit, so a session start appears there like any other write (`docs/walkthrough.md`, Part 1, section 3).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Work email | `PEOPLE.marcus.email` | `auth.sessions` (Better Auth) | live |
| Password | `S.ob.pw` | `auth.sessions` (Better Auth) | live |
| Keep me logged in | literal, checked | `auth.sessions` (Better Auth) | live |

### Logic
- `obLogin()` draws the Single sign-on buttons, the "or" rule and this form.
- Fields: **Work email** (`#ob-li-email`), **Password** (`#ob-li-pw`, `obPwField` with `bare`), and the checkbox "Keep me logged in on this device for 30 days", checked by default.
- **Forgot password?** goes to `#/welcome/forgot`.
- Submit calls `obGo('two-factor')`. The build checks the password first and moves to Two-factor only when it matches.
- **Log in** is the one gold action on the screen.
- With the box checked the build keeps the session on this device for 30 days, as the label says. The mockup stores nothing.

### States
- **Loading**: **Log in** shows a spinner and "Logging in…" and is `aria-disabled`.
- **Error**: a red message above the sign-on buttons, "**Email or password is wrong.** Check both and try again, or reset your password." The email field is marked bad (`ob-bad`). The message does not say which of the two was wrong, so the screen never confirms that an address has an account.
- **Mobile**: inputs are 16 px so iOS does not zoom, and the button fills the width.

## Suspended account

The card that replaces the form when an organization owner has suspended your account: who did it, when, and what still works.

### Purpose
You tried to log in and cannot. The card tells you why, who can change it, and gives you one way to reach them.

### Rationale
A suspension is a decision a person made, so the card names the person, their role and the date, instead of a generic "access denied". It also says what the suspension does to your work: runs already recorded are kept, and no new run tokens are minted. That is state of this account, not an explanation, so it stays on the card. The only action is to contact the owner, because nothing you do on this screen can lift a suspension.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Owner who suspended | `PEOPLE.priya` | `org.members.status` | live |
| Suspended address and date | `PEOPLE.marcus.email`, literal `9 Sep 2026` | `org.members.status` | live |
| Organization | `ORG.name` | `org.members.status` | live |

### Logic
- `obLogin()` returns this card when the state is `denied`. It uses `.ob-state.deny` with a lock glyph.
- The title is "This account is suspended". The body reads "Priya Natarajan (organization owner, Anderson Intelligence Corp.) suspended `marcus@a-intel.example` on 9 Sep 2026. Runs already recorded are kept; no new run tokens are minted."
- **Contact your organization owner** toasts "A message to the organization owner is drafted. Nothing else changes until they act." The build must send that message, or open a mail draft to the owner.
- The card has no gold action.
- The build must show this card only after the password is correct, so a wrong password never reveals that an account exists and is suspended.

### States
- **Denied**: this card, in place of the header, the sign-on buttons and the form.
- **Mobile**: the card fills the width and the button is at least 44 px tall.
