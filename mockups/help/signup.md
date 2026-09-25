# Sign up

## Auth shell

The frame around every sign-in screen and the installer: the brandmark bar, a centered card, and no sidebar or top bar.

### Purpose
It tells you that you are outside the app, on a screen that comes before a session exists. There is one thing to do on each screen, and the card holds it.

### Rationale
The seven sign-in flows are not pages of Mission Control. `docs/mission-control-spec.md` Appendix F names them (log in, sign up, password reset, two-factor, verify, accept an invite, create the first organization), leaves them out of the count of nine, and says they stay as the auth screens they are today. A person on these screens has no session, or a session that has not passed its second factor, so a sidebar would offer pages that cannot open. The shell is written once here and every screen that `obShell` draws opens this section: Sign up, Verify email, Log in, Two-factor, Forgot password, Reset password, Accept invitation and the installer.

The installer uses the same frame for a different reason. Its card stands in for the signed package's own window, which runs on the host and not in the browser.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Brandmark | `LOGO` | none, static asset | live |
| Screen state for the forms | `S.ob` (`pw`, `pwShown`, `forgotSent`) | none, client state | mockup only |

### Logic
- `obShell(inner, wide)` draws `.ob-auth`: the brandmark bar (`.ob-top`), then `.ob-card` with the screen's content. The card is 448 px wide. `wide` makes it 560 px, and only Accept invitation and the installer pass it, because a facts list or a package window needs the room.
- A grid of 48 px squares sits behind the card and fades out down the page (`.ob-auth::before`). It is decoration and carries no data.
- The demo adds **Exit demo** at the right of the bar. It calls `obExit`, which clears the onboarding state, returns to Work and toasts "Onboarding demo closed. Nothing was written." Under `?product=1` the button is not drawn, and the build has no such button.
- The demo reaches these screens from the account dialog's Onboarding tab, the user menu's **Onboarding demo** entry and ⌘K. The build reaches them from the public routes and from emailed links.
- The W1 scenario, `sixty-seconds-to-governed`, draws its rail beside the shell (`scnRailFloat`) because there is no sidebar to hold it.

### States
- **Loading**, **error** and **denied** are drawn inside the card by each screen. The shell never changes.
- **Mobile**: the side gutters drop to 16 px, the card starts 26 px below the bar instead of 44 px, and the card fills the width.

## Page header {#signup/header}

The eyebrow "Create your account", the headline "Govern the agents you already run.", one line on what the account includes, and the three plan tags under the footer.

### Purpose
You land here from the marketing site or a shared link and decide whether to create an account. The header says what Oxagen does for you in one line and what the free account includes, so you can decide before you type.

### Rationale
Sign up is the first screen of the sixty-seconds-to-governed path: sign up, verify the email, name the organization, wrap an agent, start a run (`docs/walkthrough.md`, Part 1). The headline speaks to someone who already runs Claude Code, Codex CLI, Stella or an SDK agent and wants them governed. The lead is product copy that the shipped screen carries, so it stays on the page.

The tags repeat three facts about the plan in badge form: the included monthly allowance, no token markup, and SOC 2 evidence built in. They have no `?` of their own, so they are specified here. The allowance is the governed-action allowance of the GAU billing in ADR-055 (`docs/mission-control-spec.md` §12.1). One billable governed action is one GAU.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow, headline, lead | literal in `obSignup()` | none, static copy | live |
| Included allowance tag | literal in `obSignup()`, which the page spec maps to `BILLING` (ADR-055) | `billing.plans` | live |
| Other two tags | literal in `obSignup()` | none, static copy | live |

### Logic
- The header has no controls.
- The tags are `.b.b-q` badges in `.ob-tags`, centered under the "Already have an account?" footer.
- The build must read the allowance tag from `billing.plans`, so the tag and the Billing page describe the same plan.

### States
- **Loading** and **error**: the header does not change.
- **Mobile**: the headline drops from 28 px to 23 px, and the tags wrap onto two rows.

## Single sign-on

**Continue with Google** and **Continue with GitHub**, each with its glyph, above a rule that reads "or".

### Purpose
You create the account, or log in, with an identity you already have, and skip the password and the email code.

### Rationale
The buttons let you use an identity you already hold instead of a new password. The same two buttons sit on Sign up and Log in, so this section is written once here and both screens open it. These are Google and GitHub accounts through Better Auth. Enterprise SSO and SCIM were cut from the first release by the scope review of 2026-09-14 (`docs/mission-control-spec.md`, amendment line).

On Sign up the provider has already verified the email, so the buttons skip Verify email and go straight to Name the organization. On Log in the provider's session stands in for the password and the second factor, so the buttons sign you in.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Account created or matched | `S.ob`, `PEOPLE.marcus` | `auth.users` (Better Auth) | live |
| Session | `obSignedIn()` | `auth.sessions` (Better Auth) | live |

### Logic
- `obSso(next)` draws both buttons. With `next` of `"organization"` (Sign up) each calls `obGo('organization')`. With `"work"` (Log in) each calls `obSignedIn()`, which clears any onboarding state, goes to Work and toasts "Signed in as Marcus Bell."
- Both buttons are plain, never gold. The gold action on each screen is the form's submit button.
- The build must start the provider's OAuth flow through Better Auth and return to the same next step. The mockup skips the provider's consent screen.

### States
- **Error** on Sign up or Log in: the red message sits above the buttons, and the buttons stay.
- **Loading**: the buttons stay enabled. Only the form's submit button shows the spinner.
- **Mobile**: the buttons fill the width and are at least 44 px tall.

## Sign-up form

Name, work email and password, the gold **Create account** button, the terms line, and the link to log in.

### Purpose
You create an account with an email and a password. Submitting sends a six-digit code to the address and moves you to Verify email.

### Rationale
The form asks for three things and nothing about the organization, because the organization is its own gate step after the email is proven. A second sentence used to follow the terms line: "Oxagen never stores your model provider keys in plain text, and never returns them once saved." It moved here. It is true of the organization's model key (`docs/mission-control-spec.md` §4.5: stored enveloped, tested before save, never returned, every read audited), but nobody enters a key at sign-up, so the sentence answered a question the screen does not ask. Organization → Funding, where a key is entered, is where the product states it.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, work email | `PEOPLE.marcus` | `auth.users` (Better Auth) | live |
| Password | `S.ob.pw` | `auth.users` (Better Auth) | live |
| Terms and privacy links | literal URLs `oxagen.sh/terms`, `oxagen.sh/privacy` | none, static copy | live |

### Logic
- Fields: **Name** (`#ob-name`, `autocomplete=name`), **Work email** (`#ob-email`, `type=email`, `autocomplete=email`), **Password** (`#ob-pw`, the Password field section).
- Submit calls `obGo('verify')`. The build sends the code and records `auth.signup` as a governed action in Audit.
- The terms line reads "By creating an account you agree to the oxagen Terms and Privacy Notice." Both links open in a new tab.
- The footer's **Log in** goes to `#/welcome/login`.

### States
- **Loading**: **Create account** shows a spinner and "Creating account…" and is `aria-disabled`. The fields stay.
- **Error**: a red message above the sign-on buttons, "**That email is already registered.** Log in instead, or reset your password." The email field is marked bad (`ob-bad`) with the hint "An account for this address was created on 9 Sep 2026."
- **Mobile**: inputs are 16 px so iOS does not zoom on focus, and the button fills the width.

## Password field

A password input with a Show or Hide toggle, a four-segment strength meter, and three requirements that tick as you type.

### Purpose
You see whether the password meets the rules before you submit, not after a server round trip. Show lets you check what you typed.

### Rationale
The same field sits on Sign up and on Reset password, so it is written once here and both screens open this section. Three rules are shown because three are enforced: at least 12 characters, one symbol and one digit. The meter adds a coarse length signal for passwords that pass the rules. Log in uses the same input without the meter or the rules, since a returning password is checked, not chosen.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Typed value | `S.ob.pw` | `auth.users` (Better Auth), on submit | live |
| Shown or hidden | `S.ob.pwShown` | none, client state | mockup only |
| Meter and requirements | `obPwBits()` | none, computed in the browser | live |

### Logic
- `obPwField(id, auto, bare)` draws the input, the toggle and, unless `bare`, the meter (`#obMeter`) and the requirement list (`#obReqs`).
- `obPwBits` fills `min(4, floor(length / 4))` of the four segments, so 16 characters fill all four. Each requirement shows ✓ and turns green when met, and · when not: length of 12 or more, any character outside letters and digits, any digit.
- Every keystroke stores the value in `S.ob.pw` and calls `obPwMeter`, which rewrites only the meter and the list. The page does not re-render, so the input keeps focus.
- **Show** and **Hide** flip `S.ob.pwShown` and re-render, which switches the input between `text` and `password` and swaps the label.
- The meter is `aria-hidden`. The requirement list is the accessible statement of the rules.
- The build must enforce the same three rules on the server and reject a password that fails them, whatever the browser showed.

### States
- **Loaded**: the field is empty, the meter is grey, and all three requirements show ·.
- **Mobile**: the input fills the width and is 16 px, so iOS does not zoom on focus.
