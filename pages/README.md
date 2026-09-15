# pages/ — every page, every state, desktop and mobile

Generated from `mc.html` by `node tools/build-pages.mjs`. **Do not edit the `.html` files**; edit
`mc.html` and rebuild. The `.md` files are hand-written and are the spec for the app build.

Open `index.html` for the map.

| File | What it is |
|---|---|
| `<page>-<state>.html` | The page pinned to one state (`loaded`, `empty`, `loading`, `error`, `denied`), in the desktop shell. |
| `<page>-<state>-mobile.html` | The same, in the mobile shell: thumb bar, bottom-sheet dialogs, card tables. |
| `<page>.md` | The page’s spec: route, job, everything on it (header, tiles, tabs, tables with columns, dialogs), data sources (mockup collection → target store → what backs it today → status), functionality, every state’s copy, mobile behaviour, permissions, backend gaps. |
| `<page>.audit-prompt.md` | A prompt to paste into an agent session that audits the built page against `<page>.md`, check by check, and reports PASS/FAIL with evidence. |
| `audit-prompt.md` | The whole-app prompt: shell, mobile shell, auth sequences, cross-cutting rules; it runs every per-page prompt. |
| `_engine/mc.css`, `_engine/mc.js` | The product stylesheet and script, split out of `consolidated.html`, shared by every page file. |

A page file is thin — the shell markup plus a `BOOT` object (`{state, mobile, theme, hash}`)
that pins what the engine renders — so 250 of them weigh 2 MB instead of 350 MB, and none can
drift from `consolidated.html`: it is the same bytes. Open them from disk (`file://`) or serve
the repo folder (`python3 -m http.server`); the engine is loaded by relative path.

Which states a page has is decided by `mc.html`: a page gets a file for a state only if its
renderer branches on it. The auth screens have no empty state; the installer has only loaded;
the gate steps have loading and denied, and the first-run step an error.

Pages (31): fleet · run · agents · agent · agent-source · mandate · tools · skills ·
skills-off · run-interjection · steering · spend · organization · organization-api-keys · organization-roles · billing · audit ·
register-name · register-wrap · register-run · signup · verify-email · login · two-factor ·
forgot-password · reset-password · accept-invitation · onboarding-organization ·
onboarding-wrap · onboarding-run · installer.

Guards: `node tools/build-pages.mjs --check` (every file is what `mc.html` produces) and
`node tools/check-pages.mjs` (every file renders its page in its state in its shell, with no
mockup chrome and no JavaScript error). See `tools/README.md`.
