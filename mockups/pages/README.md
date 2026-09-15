# mockups/pages: the spec of every page

One `.md` per page, hand-written, and the spec for the app build; beside each, `<page>.audit-prompt.md`,
a prompt that audits a build of that page against it. `audit-prompt.md` audits the whole app.

The rendered page lives in the master mockup, not here. Every page in every state, desktop and
mobile, is a story in Storybook (`npm run storybook`), with this spec on the page's Docs tab; the same
view is a URL of `mockups/missioncontrol.html` (`?product=1&state=<state>&mobile=<0|1>#<route>`).
Which states a page has is decided by `mockups/catalog.mjs`, which reads what the renderer in
`mockups/src/engine.js` branches on: the auth screens have no empty state, the installer has only
loaded, the gate steps have loading and denied, and the first-run step an error.

| File | What it is |
|---|---|
| `<page>.md` | The page's spec: route, job, everything on it (header, tiles, tabs, tables with columns, dialogs), data sources (mockup collection → target store → what backs it today → status), functionality, every state's copy, mobile behaviour, permissions, backend gaps. |
| `<page>.audit-prompt.md` | A prompt to paste into an agent session that audits the built page against `<page>.md`, check by check, and reports PASS/FAIL with evidence. |
| `audit-prompt.md` | The whole-app prompt: shell, mobile shell, auth sequences, cross-cutting rules; it runs every per-page prompt. |

Pages (28): fleet · run · agents · agent · agent-source · mandate · tools · steering · spend ·
organization · organization-api-keys · organization-roles · billing · audit · register-name ·
register-wrap · register-run · signup · verify-email · login · two-factor · forgot-password ·
reset-password · accept-invitation · onboarding-organization · onboarding-wrap · onboarding-run ·
installer.

Guards: `node tools/build-mockup.mjs --check` (the master is what the sources produce) and
`node tools/check-mockup.mjs` (every page renders in every state in either shell, with no mockup
chrome and no JavaScript error; every scenario walks). See `tools/README.md`.
