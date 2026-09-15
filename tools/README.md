# The builds and the guards

Three things are built from sources, and each build has a `--check` that says whether the
committed output is what the sources produce. `npm run build` runs the builds; `npm run check`
runs the checks and then the browser guard.

| Script | Builds | From |
|---|---|---|
| `node tools/build-mockup.mjs` | `mockups/missioncontrol.html`, the one self-contained master | `mockups/src/{engine.css,shell.html,engine.js}` and `mockups/fixtures/*.json` (inlined as `FIXTURES`) |
| `node tools/build-stories.mjs` | `mockups/stories/**`, the Storybook catalog | `mockups/catalog.mjs` (every page with its states; every scenario) |
| `python3 tools/build-docs.py` | `docs/missioncontrol-docs.html`, every document on one page | `docs/*.md` and `docs/_house/oxagen-doc.css` (needs `markdown-it-py`) |

Edit the sources, run the build, commit both. A `--check` failure means the two drifted.

## The browser guard

```sh
node tools/check-mockup.mjs                 # every page × state × shell, then every scenario
node tools/check-mockup.mjs --only fleet    # one page id, or one scenario id
node tools/check-mockup.mjs --pages         # pages only;  --scenarios  scenarios only
node tools/check-mockup.mjs --shots out/    # a screenshot per view
```

It opens `mockups/missioncontrol.html` in headless Chromium once per view in `mockups/catalog.mjs`
(the Playwright Chromium that Homebrew's `playwright` already downloaded, from
`~/Library/Caches/ms-playwright`). Per page view it asserts: no JavaScript error; `PRODUCT` is true
and the `#chrome` bar, the scenario rail, the Scenarios nav item and every piece of onboarding-demo
copy are gone; `S.state` and `S.mobile` are pinned to what the URL says; the state's own markup is on
screen (the skeleton, the empty / error / denied panel, or a loaded page with a heading and no state
panel); a mobile shell page has the thumb bar and never scrolls sideways. On the loaded mobile
fleet it checks the mobile shell's own guarantees: five thumb-bar slots at least 44 px tall in the
bottom quarter, More as a full-width bottom sheet with the rest of the app in it, the drawer over a
scrim that closes it, list tables as cards, every input 16 px or larger. Per scenario it opens step
1 and, for every step, asserts the rail is on screen and names the step, the page under it
rendered, the step's act runs, Next closes any dialog the act opened and lands on the following
step, and no page error fired; then phone mode has no horizontal overflow and both themes render.
A scenario in the catalog with no `SCENARIOS` entry fails; nothing skips.

Run `build-mockup.mjs --check` on every edit to the sources; run `check-mockup.mjs` before you ship.

## Writing a scenario

`SCENARIOS["id"]={title:"…", ws:"…", blurb:"…", steps:[…]}` in `mockups/src/engine.js`, and a row in
`mockups/catalog.mjs` (`n`, `id`, `ws`, `title`; the checker asserts the two agree on `ws`).
`route()` runs on every render, but a step's `setup` runs once on arriving at it, and nothing undoes
it, so each step sets every piece of state it relies on. Scenario routes skip `route()`'s own tab
parsing: set tabs in `setup`. Dialogs go in `DLG_EXT` beside the code they belong to; frames for a
run go in `FRAMES_BY_RUN`, and a run without authored frames gets `framesFromRun(R)`, which is
exactly `R.frames` long. Authored lists may carry sparse seqs, so read a run's list by position.

## The fixtures

`mockups/fixtures/*.json` is the seed dataset, one file per collection, bound in the engine as
`FIXTURES.<NAME>` (`spend-detail.json` is `FIXTURES.SPEND_DETAIL`); `mockups/fixtures/README.md`
says what each is. The volume generator at the end of `engine.js` grows the organization around
the seed rows at load, deterministically, so every list pages and every total is business-sized.
Money is stored as comma-free display strings (the engine divides them with `parseFloat`, which
stops at a thousands separator). A count one page derives from another record must be derived the
same way in the fixture, or two pages disagree.

## Four things that will waste your afternoon

`page.goto()` to a URL that differs only in the `#fragment` does **not** reload the page. State (an
open dialog, a resolved approval) leaks between checks. Go to `about:blank` first when you want a
clean load.

`element.innerText` applies `text-transform`, so the summary tile labels come back **UPPERCASED**
while everything else does not. Match them case-insensitively or read `textContent`.

Storybook indexes stories statically: a story file's default export and every story must be
object literals, which is why `build-stories.mjs` writes them out rather than building them at
run time.

Every handler that calls `render()` replaces `#view.innerHTML` and destroys whatever was focused.
Test any keyboard interaction **twice in a row**: these bugs work exactly once.
