# Guards for consolidated.html

Five scripts. They exist because three independent audits found 80 defects in
`consolidated.html`, and most of them were the kind that come straight back: a
figure typed on two pages, a control with no handler, a colour that fails
contrast, a table only a mouse can use. Fixing those is cheap. Keeping them
fixed is what these are for.

Three of the scripts check the file. Two check the checkers.

## Running them

The two `verify-*` scripts need only Node. The oracle and `mutate-oracle.sh`
also need the Playwright Chromium that Homebrew's `playwright` already
downloaded. `playwright-core` is nested under `@playwright/cli`, and `launch()`
needs an explicit `executablePath`, so both are passed by environment variable
rather than guessed:

```sh
node tools/verify-data.js          # 242 arithmetic and narrative invariants
node tools/verify-contrast.js      # 163 colour pairs, tokens read from the file
bash tools/mutate-data.sh          # proves both of the above can fail

export PW_EXE="$HOME/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
# optional, if playwright-core lives somewhere else:
# export PW_CORE=/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.js

node tools/audit-oracle.mjs        # ~110 assertions against the rendered page
bash tools/mutate-oracle.sh        # proves the oracle can fail (slow: one browser run per mutation)
```

Run the two fast ones on every edit. Run the browser pair before you ship.

The Chromium build number in that path changes when Playwright updates. If the
binary is missing, `ls ~/Library/Caches/ms-playwright` and use whatever
`chromium-*` is there — note the app inside is called *Google Chrome for
Testing*, not *Chromium*.

## What each one is for

**`verify-data.js`** lifts the data `<script>` straight out of the file, runs
it, and checks the invariants the pages assume: the org totals are the
workspaces added up, billing meters both of them, each connector owns whole
class groups so nothing is counted twice, a run's cost and frame count come
from its own per-turn ledger, a frame that names a turn agrees with that
ledger, run ids sort into their start order the way ULIDs must, no finding
claims more monthly waste than its agent spends, and every panel that shows a
sample says how big the whole is. No browser, milliseconds, no excuse.

**`verify-contrast.js`** parses the token blocks out of the stylesheet and
checks every text colour against every surface it can land on — including the
row-hover highlight and its own state wash — plus that the two dark paths
(`prefers-color-scheme` and `[data-theme="dark"]`) still define the same
values. It used to hold its own copy of the tokens, which meant it could pass
while the stylesheet said something else; it reads the file now.

**`audit-oracle.mjs`** drives the page in a real browser and asserts one or
more things per finding — the tile equals the rows it counts, a run row opens
its own run, every frame opens *its own* detail, a receipt survives leaving the
page, approving moves the run it is about, focus survives the re-render, the
split collapses when the assistant takes the width, a full-screen overlay makes
what it covers inert. Each finding is isolated in a `step()`, so one broken
interaction cannot hide the other hundred. It also shells out to
`verify-contrast.js`, so one command covers the colour arithmetic too.

**`mutate-oracle.sh` / `mutate-data.sh`** revert one fix at a time in a
throwaway copy and check the guard fails. `MISSED` means an assertion cannot
catch its own defect. That has already happened twice: the run-row check read
the run id out of the very `data-go` attribute the bug corrupts, so it passed
with every row pointing at the same run; and the tab check asserted on
`aria-selected`, which `.click()` sets by itself, so it passed with the
focus-restoring line deleted. An assertion has to compare two independent
sources, and a keyboard assertion has to read `document.activeElement`.

If a mutation reports `SKIP`, its pattern has drifted away from the file — fix
the pattern. Both scripts treat `SKIP` as a failure, because a drifted pattern
silently stops testing that fix.

## Four things that will waste your afternoon

`page.goto()` to a URL that differs only in the `#fragment` does **not** reload
the page. State — an open assistant dock, a resolved approval — leaks between
checks. Go to `about:blank` first when you want a clean load.

`element.innerText` applies `text-transform`, so the summary tile labels come
back **UPPERCASED** while everything else does not. Match them
case-insensitively or read `textContent`.

Escape `@` in the `perl` patterns in the mutation scripts (`\@`), and `$(` in
the replacements (`\$(`). Unescaped, `@` reads as the start of an array
interpolation and the pattern never matches — a `SKIP`, which is a silent hole.
Unescaped `$(` is perl's GID variable and interpolates into the replacement,
which turns the mutant into a syntax error: the guard then "catches" it, but
for the wrong reason, and every assertion times out on a page that never runs.
If one mutation takes many minutes while the others take two, that is what
happened.

Every handler that calls `render()` replaces `#view.innerHTML` and destroys
whatever was focused. Test any keyboard interaction **twice in a row**: these
bugs work exactly once.

# Guards for mc.html and the W files

W1–W11 are generated from `mc.html` (see the README). Three checks keep that true:

```sh
node tools/build-w.mjs --check              # every w1–w11 file is exactly mc.html + its title + its boot hash
node tools/check-scenarios.mjs [--only id]   # walks every scenario step in Chromium
node tools/baseline/check-baseline.mjs mc.html
```

`check-scenarios.mjs` opens each W flow's scenario and, per step, asserts the rail is on screen
and on that step, the page under it rendered, the step's act runs, Next closes any dialog the act
opened and lands on the following step, and no page error fired; then phone mode has no
horizontal overflow and both themes render. An act may be the product's own forward control
(onboarding's Continue), in which case it moves the scenario on and Next is not pressed.

Writing a scenario: `SCENARIOS["id"]={title:"…", ws:"…", blurb:"…", steps:[…]}` in the flow's slot,
`title` then `ws` first because `build-w.mjs` reads `ws` by pattern. `route()` runs on every
render, but a step's `setup` runs once on arriving at it, and nothing undoes it, so each step sets
every piece of state it relies on. Scenario routes skip `route()`'s own tab parsing: set tabs in
`setup`. Dialogs go in `DLG_EXT` beside the code they belong to; frames for a run go in
`FRAMES_BY_RUN`, and a run without authored frames gets `framesFromRun(R)`, which is exactly
`R.frames` long. Authored lists may carry sparse seqs, so read a run's list by position.
