# The builds and the guards

Four things are built from sources, and each build has a `--check` that says whether the
committed output is what the sources produce. `npm run build` runs the builds; `npm run check`
runs the checks and then the browser guard.

| Script | Builds | From |
|---|---|---|
| `node tools/build-mockup.mjs` | `mockups/missioncontrol.html`, the one self-contained master | `mockups/src/{engine.css,shell.html,engine.js}`, then `wedge.js` (the fleet operations wedge views) and `boot.js` (the first render) in one script, and `mockups/fixtures/*.json` (inlined as `FIXTURES`) |
| `node tools/build-stories.mjs` | `mockups/stories/**`, the Storybook catalog | `mockups/catalog.mjs` (every page with its states, a future-only story for a view marked `future`, every scenario). The stories render through `mockups/stories/_view.js`, which is hand-written |
| `python3 tools/build-docs.py` | `docs/missioncontrol-docs.html`, every document on one page | `docs/*.md` and `docs/_house/oxagen-doc.css` (needs `markdown-it-py`) |
| `node tools/build-badges.mjs` | `badges/*.svg`, `badges/index.html`, `badges/README.md` | the verdict and attestation vocabularies in the script, coloured with the engine's tokens |

Edit the sources, run the build, commit both. A `--check` failure means the two drifted.

## The browser guard

```sh
node tools/check-mockup.mjs                 # every page × state × shell, then every scenario
node tools/check-mockup.mjs --only work-backlog  # one page id, or one scenario id
node tools/check-mockup.mjs --pages         # pages only;  --scenarios  scenarios only
node tools/check-mockup.mjs --shots out/    # a screenshot per view
```

It opens `mockups/missioncontrol.html` in headless Chromium once per view in `mockups/catalog.mjs`
(the Playwright Chromium that Homebrew's `playwright` already downloaded, from
`~/Library/Caches/ms-playwright`). Per page view it asserts: no JavaScript error; `PRODUCT` is true
and the scenario rail, the Scenarios nav item and every piece of onboarding-demo
copy are gone; `S.state` and `S.mobile` are pinned to what the URL says; the state's own markup is on
screen (the skeleton, the empty / error / denied panel, or a loaded page with a heading and no state
panel); a mobile shell page has the thumb bar and never scrolls sideways; a view with a `drawer`
has that drawer open; the future-only story of a view marked `future` outlines at least one
`data-future` field. On the loaded mobile workspace root (Work) it checks the mobile shell's own guarantees: five thumb-bar slots at least 44 px tall in the
bottom quarter, More as a full-width bottom sheet with the rest of the app in it, the drawer over a
scrim that closes it, list tables as cards, every input 16 px or larger. Per scenario it opens step
1 and, for every step, asserts the rail is on screen and names the step, the page under it
rendered, the step's act runs, Next closes any dialog the act opened and lands on the following
step, and no page error fired; then phone mode has no horizontal overflow and both themes render.
A scenario in the catalog with no `SCENARIOS` entry fails; nothing skips.

It also asserts the review island: it is on every view with component help off, and on Tools it
names the page, links the spec in a new tab, switches the state, component help and the phone
view, and Hide removes it until a reload.

## Component help

```sh
node tools/check-help.mjs                   # every catalog view, then the drawers and every dialog
node tools/check-help.mjs --only agents     # one catalog page id
node tools/check-help.mjs --dialogs --only mint   # the dialogs whose kind contains the word
node tools/check-help.mjs --list            # every key it saw, and where
```

It opens every view with `?help=1` and fails on a `?` whose key no section of `mockups/help/*.md`
answers. `mockups/help/README.md` is the format and the key rules. A section no view reached is
listed as unreached, which is not a failure: a record page other than the catalog's, a tab the
check does not open, or a dialog opened only from a flow.

Run `build-mockup.mjs --check` on every edit to the sources; run `check-mockup.mjs` before you ship.

## The Work guard

```sh
node tools/check-tasks.mjs           # every Work flow
node tools/check-tasks.mjs --shots   # also write a screenshot per step to .claude/shots/tasks/
```

Walks the Work surface (`docs/tasks-spec.md`, `docs/fleet-operations-wedge.md`) the way an operator
meets it: connecting Jira through the six-step wizard from the Intake dialog with one account left not
mapped; drafting a definition of done with the assistant, editing it and certifying it; a certified
work item that changed upstream; the send menu
listing only agents the operator runs, each with its harness mark; the work order merging every
definition of done, resolving `@` mentions and refusing to send until the repositories are
confirmed; a workflow of four agents and a person, and the builder drafting one from a sentence;
label colours; and accepting a claimed work order.

## The wizard guard

```sh
node tools/check-creation.mjs           # every creation wizard, both editing pages, the entry points
node tools/check-creation.mjs --shots   # also write a screenshot per step to .claude/shots/
```

`check-mockup.mjs` opens pages. The four creation wizards (`docs/creation-spec.md`) are dialogs, so
nothing there ever reaches them. This walks each one step by step: the tool wizard down both of its
paths (import, where it must name the matched server and hand off to the importer; and build, where
the manifest must parse, the derived chips must be read out of the file, and all four language
samples must render and read the grant off the call), the skill wizard down all three of its sources
(registry search narrowing and excluding, a bundle bumping a pinned version, a drafted file), the
agent wizard through identity, definition and belt, and the record wizard through all six kinds. It
then opens one record page per kind and asserts each kind renders **its own** treatment and borrows
no other's, opens the skill source page and asserts the editor holds text rather than markup and
that the version bumps before the merge, and checks every page's entry point is present.

Every assertion names a string the surface is supposed to render, never a value read back out of
the field the bug would corrupt. It was mutation-tested against four deliberate regressions —
collapsing the six kind panels into one, putting the tool matcher back on substring matching,
emptying the editor gutter, and scoping the phone rule to `#viewport` only — and catches all four.

## The assistant guard

```sh
node tools/check-assistant.mjs           # the flyout, its states, the org's model key
node tools/check-assistant.mjs --shots   # a screenshot per state
```

The in-app agent (spec §4.4) is neither a page nor a dialog: it is a permanent host beside `#layer`
that `render()` reclasses but never rebuilds, which is exactly the property a tidy-up of `render()`
would break. This asserts the behaviour that property exists for — a half-typed message survives a
re-render, and the host is the same DOM node afterwards — plus the closed panel being `inert` and
`aria-hidden`, the panel painting under the rail rather than over it, Escape closing it without also
changing the route, the turn badge naming whose run it is and never linking into the tenant's run
index, and both refusals (engine down, no model key) saying so by name with the message box disabled
rather than degrading into something that looks like an answer. It then walks the organization's
model key on the funding tab: the prefix rather than the secret, the provisioned id reconciliation
joins on, the two independent numbers in the reconciliation block, and mint, rotate and revoke.

It also checks Stella's marks in both forced themes. The header carries the wordmark, its letters
follow the theme, and its asterisk is gold. The launcher and the phone More tile read "Ask stella*"
in Space Grotesk, the other More tiles keep the UI face, and the close button sits at the header's
right edge.

Mutation-tested against three deliberate regressions — rebuilding the sheet on every render,
removing the no-key refusal, and dropping the `inert` guard — and catches all three.

## The record end-to-end guard

```sh
node tools/check-record-e2e.mjs           # wizard → pull request → checks → merge → published
node tools/check-record-e2e.mjs --shots   # a screenshot at each stage
```

A Steering record is the one object in the product that goes all the way from a sentence somebody
typed to something that steers every agent in a workspace, and every step between those two is a
place the guarantee can be lost. This walks the whole path in one session and asserts the things
that make it a governed publication rather than a save button: while the pull request is open the
record is **not** in Sources, **not** in the compiled bundle, **not** in the audit log and the
bundle version has not moved; merge is blocked until every check reports, and forcing it through
publishes nothing; merge publishes exactly once — one record, one rule, one version, one audit
event; and the promoter's own pull request is untouched throughout. It then opens the record's page
and finds it at the top of Sources, and separately checks that closing a pull request without merging leaves
nothing behind and that a kind which constrains nothing takes the other branch of the sixth check.

It also covers what the review of PR #36 found, each reproduced before it was fixed: a lineage that
is already published **fails** its check so nothing merges (without it, two descriptions sharing
their first four words publish two records under one id, with the tokens counted twice and the check
on screen claiming otherwise); a second operator pull request does not erase the first; and a
statement containing a quote still produces a file that parses with the app's own TOML reader.

Counts are read before and after and compared, never read back out of the thing under test.
The second review round found three more, each also reproduced first — and the first of them was a
defect introduced by fixing the first round. Making pull requests a collection opened a window where
two of them run the uniqueness predicate before either publishes, both go green, and merging both
publishes the duplicate anyway. So the check counts competing **open** pull requests (earliest claim
wins), and **every check with a predicate is re-run at merge**: one that went green five minutes ago
may not be green now. Alongside it: every compiled bundle version derives its own digest, so a panel
claiming the bundle was re-signed renders one; and the multi-line TOML writer escapes backslashes
and reaches its closing fence with a line continuation, because a bare newline before the fence is
part of the value — without it every round-trip appended a blank line, which also hit the agent
definition editor.

Mutation-tested against thirteen deliberate regressions — publishing when the pull request opens
rather than when it merges, merging without waiting for the checks, dropping the newest-first order
on the records list, replacing the per-record check text with a fixed string, removing the lineage
predicate, making the check runner ignore every test, collapsing the pull-request collection back to
one, dropping the TOML escaping, ignoring competing open pull requests, skipping the re-check at
merge, leaving a new bundle version without a digest, unescaping nothing on the way back in, and
writing a bare newline before the closing fence — and catches all thirteen. The escaping one is
worth seeing fail: with it removed, `Path:\deploy\q` comes back as `Path:deployq`.

## The copy guard

```sh
node tools/check-copy.mjs                 # every route in both workspaces, the drawer, and the dialogs
node tools/check-copy.mjs --only tools    # routes and overlays whose name contains "tools"
node tools/check-copy.mjs --dump out/     # also write each route's visible text to out/
node tools/check-copy.mjs --all           # list every finding, not the first 25 per rule
```

This opens every route the copy review names (issue #87) and reads the text a person sees. Each
rule is one regular expression from the review's acceptance list or glossary: `undefined` in a
sentence, "1 turns", a number glued to its unit, a retired term, an internal name, a capitalized
brand, a hyphen standing in for a minus sign, and the rest. It also fails a tile with a caption and
no value, and a raw key such as `gateway_observed` in prose. The same key in monospace passes, so the
raw-key rule reads the page with `.mono` hidden.

Code samples in `<pre>` and `<code>` are skipped. A TOML key or an SDK class name belongs to its
language, and the rules read only the prose around it. The same text on many routes, such as the
sidebar, counts as one finding and names the first route it appeared on.

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

## The spec copies in the oxagen repository

`docs/desktop-spec.md` has a copy in the oxagen repository, and no build step joins them. Its header names the sections that must match. After editing one of those sections in both repositories, run:

```
python3 tools/check-spec-sync.py . ~/Projects/oxagen
```

It exits 0 when every shared section is byte-identical and 1 when one differs, and it names the section. The oxagen copies of the spec and the plan were retired on 2026-09-23, so `docs/mission-control-spec.md` and `docs/implementation-plan.md` are the only live copies.
