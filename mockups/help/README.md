# mockups/help: the spec of every page part

Turn on **Component help** in the review island and every page part in `mockups/missioncontrol.html`
shows a blue `?`. The `?` opens that part's section from this directory. The page spec in
`mockups/pages/<id>.md` says what is on the page. A help section says why one part exists, where
its data comes from, and how it decides what to show.

Explanations live here and never on the page. With component help off, the mockup shows what the app
shows.

## Files and keys

One file per page, named for its id in `mockups/catalog.mjs` (`agents.md`, `agent-toolbelt.md`), plus
`shell.md` for the sidebar, top bar and thumb bar, and `approvals-drawer.md` and `stella-drawer.md`
for the drawers. A dialog's section lives in the file of the page that opens it.

Each `## ` heading is one section. Its key is `<file name>/<slug of the heading>`: `## Model view` in
`agent-toolbelt.md` is `agent-toolbelt/model-view`. A heading that must answer another key names it
at the end: `## Approve this action {#dialog/approve}`. A key is written once across the directory,
or the build fails.

## Which part gets which key

`mockups/src/island.js` (`islTargets()`) finds the parts and the key each one carries:

| Part | Key |
|---|---|
| Any element with `data-help="<key>"` | that key, or `<page>/<key>` when it has no `/` |
| The page header (`.phead`) | `<page>/header` |
| A row of tiles (the parent of `.stat` tiles outside a panel) | `<page>/tiles`, then `tiles-2`, `tiles-3` |
| The run summary (`.sumry`) | `<page>/summary` |
| The page's tab bar (`.tabs` outside a panel or dialog) | `<page>/tabs` |
| A panel with a heading (`.panel` > `.panel-h` h3) | `<page>/<slug of the heading text>` |
| The sidebar, the top bar, the thumb bar | `shell/sidebar`, `shell/top-bar`, `shell/thumb-bar` |
| The open Approvals or Stella drawer | `approvals-drawer/drawer`, `stella-drawer/drawer` |
| The open dialog | `dialog/<S.dlg>`, and `dialog/wz-<kind>` for a creation wizard |

`<page>` is the catalog id of the view on screen. A tab falls back to the first tab of its page when
its own key has no section: `agent-toolbelt/header` opens `agent/header` if `agent-toolbelt.md` has
no Page header section. The tab families are the agent tabs (`agent`), the run tabs (`run`), Tools
(`tools`), the Steering tabs (`steering`), Spend (`spend`), Repositories (`repositories`),
Organization (`organization`), and the Work tabs (`work-backlog`). A record page (a work item, a
work order, a source, a runtime) has no fallback, so a part it lacks a section for shows as missing.

A heading whose text changes with the record (`Registered in Core platform`) needs a fixed key: put
`data-help="registered-agents"` on the panel in `mockups/src`. So does a part the rules above do not
find, such as a card in a side column or a layout on the auth screens.

## A section

```md
## Model view

One sentence that says what the part shows.

### Purpose
The question it answers for the person on the page, and what they do next from it.

### Rationale
Why the part exists and why it looks this way: the decision it rests on (a D number in
docs/fleet-operations-wedge.md, an ADR, a spec section), and what it replaced.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tool count | `beltTotal()` over `TOOLBELTS` | `tools.toolbelt_members` | live |

### Logic
The rules in order: how each value is computed, sorted, filtered or thresholded, when a badge or
state changes, what each control does, and the frame or audit event it writes. Name the functions
in mockups/src.

### States
Loaded, empty, loading, error, denied and mobile, for this part, where they differ from the page.
```

Write in the `clear-prose` rules: plain nouns for headings, no em dashes, active voice, numbers over
adjectives, and no claim the record cannot back. A sentence moved off the page goes into the section
where it answers the question, usually Rationale or Logic.

A dialog the sources open only with a record they build at run time can tell
`tools/check-help.mjs` how to open it, in a comment that never renders:

```md
## Deny this action {#dialog/deny}
<!-- open: openDialog('deny', APPROVALS[0].id) -->
```

## Check

`node tools/check-help.mjs` opens every catalog view in every state with `?help=1`, then the drawers
and every dialog, and fails on a `?` that no section answers. `--only <page id>` checks one page, and
`--only <word> --dialogs` the dialogs whose kind contains the word. `--list` prints every key it saw.
