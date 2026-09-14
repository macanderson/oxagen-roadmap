# Guards for the generated product files, and the mc.html dataset transform

`consolidated.html`, `consolidated-loaded.html`, `consolidated-loaded-mobile.html` and everything
under `pages/` are generated from `mc.html` by `tools/build-pages.mjs` (the README says what each
one is). Two scripts keep that true, and the mc.html guards further down keep the source true.

```sh
node tools/build-pages.mjs            # regenerate the three consolidated files and pages/ from mc.html
node tools/build-pages.mjs --check    # exit 1 if any generated file is not exactly what mc.html produces
node tools/check-pages.mjs            # open every generated file in Chromium and assert it is what its name says
node tools/check-pages.mjs --only fleet --shots out/   # one page id; write a screenshot per file
```

`check-pages.mjs` needs the Playwright Chromium that Homebrew's `playwright` already downloaded
(it looks in `~/Library/Caches/ms-playwright` for the headless shell, the same way
`check-scenarios.mjs` does). Per file it asserts: no JavaScript error; `PRODUCT` is true and the
`#chrome` bar, the scenario rail, the Scenarios nav item and every piece of onboarding-demo copy
are gone; `S.state` and `S.mobile` are pinned to what the file name says; the state's own markup
is on screen (the skeleton, the empty / error / denied panel, or a loaded page with a heading and
no state panel); a mobile shell page has the thumb bar and never scrolls sideways. Then, on
`consolidated-loaded-mobile.html`, it checks the mobile shell's own guarantees: five thumb-bar
slots at least 44 px tall in the bottom quarter of the screen, More opening as a full-width sheet
on the bottom edge with the rest of the app in it, the drawer opening over a scrim and closing
when the scrim is tapped, list tables rendered as cards, and every input 16 px or larger.

Run `build-pages.mjs --check` on every edit to `mc.html`; run `check-pages.mjs` before you ship.

The five guards that used to live here (`verify-data.js`, `verify-contrast.js`,
`audit-oracle.mjs`, `mutate-data.sh`, `mutate-oracle.sh`) guarded the hand-drawn
`consolidated.html` that preceded the generated one. They parsed that file's own data block and
token blocks and cannot read the generated file, so they were removed with it; the last commit
carrying both is `61f88e1`. The lessons they taught are kept below because they apply to
`check-pages.mjs` and `check-scenarios.mjs` just as much.

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

## The mc.html dataset: `build.py` and `volume.js`

These two are not guards. They produce the shipped `mc.html` from a base copy of it: the
demo tenant renamed to Anderson Intelligence Corp. (`a-intel`), and a seeded, deterministic
dataset that grows the organization around the hand-written story (nine workspaces,
274 agents, 700-odd tool versions, 1,163 runs shown of about 116,000 in thirty days).

```sh
git show origin/main:mc.html > /tmp/base.html
python3 tools/build.py /tmp/base.html mc.html
```

`mc.html` changes several times an hour while mockup work is in flight, and this change
rewrites most of it, so it is kept as a transform instead of being merged by hand. Every edit
asserts it matched exactly once, so a drifted base fails loudly rather than half-applying,
and the script refuses a base that is missing `govCount`, which is what a torn read looks
like. `volume.js` is spliced in verbatim after every seed array is declared.

Two traps it already hit. Money is stored as display strings and the page divides them with
`parseFloat`, which stops at a thousands separator, so stored amounts stay comma-free and the
separator is added where they are shown. And a count the page derives from another record,
such as an agent's tamper incidents from the incident register, must be derived the same way
in the dataset, or the two pages disagree.

`build.py` is the one file in the repo that still contains the old tenant name, because it
is the file that replaces it.
