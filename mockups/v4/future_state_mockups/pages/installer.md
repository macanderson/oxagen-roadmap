# Installer

| | |
|---|---|
| Route | `#/welcome/installer` |
| Scope | auth |
| Spec | §14 Mission Control; Appendix F not a page — the signed package’s own screens |
| Design | `mockups/src/engine.js` → `obInstaller()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / … / installer`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `installer.audit-prompt.md` |

## Job

The signed installer package’s own screens: download, install, connected. Shown so the whole path from sign-up to the first frame can be walked; the package, not Oxagen, renders these.

## What is on the page

**Header** — eyebrow “”, h1 “Oxagen Agent Installer / Install the Oxagen agent”. Facts: Package · Size · Signature · Checksum · Token. Progress: Installing → Connected.
Actions: **Download** · **Install** · **Cancel**

- Three panes: the download (signed package with checksum), the install (what it writes: collector, hooks, base URL), and Connected (**Back to Oxagen**; the operator console is already unlocking). The uninstall line `oxagen agent unenroll --host <host> --restore` is shown.


**Shell.** No sidebar or top bar: the brandmark, then a centred card; the phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Package facts | fixture | release artefacts (signed) | release pipeline | 🟡 |

## Functionality

- Nothing here is an Oxagen write; the installer carries the one-time enrollment token from the wrap step.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).

## Mobile

The card fills the width with 16 px gutters; buttons are full width and at least 44 px tall; inputs are 16 px so iOS does not zoom on focus; code inputs are numeric-keypad (`inputmode="numeric"`).

## Permissions

- Read: `installer token`
- Writes (each a governed action recorded in Audit): `enrollment (by the package)`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
