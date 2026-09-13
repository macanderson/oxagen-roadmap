# Consolidating W1–W11 into one design

Published: https://claude.ai/code/artifact/25a71da8-dc9d-49b6-b57d-9240da40310e
Source: `consolidated.html` (71 KB, against 135–201 KB for each single-flow original)

Eleven agents each drew the whole app to show one flow. They agreed on the brand
almost perfectly and diverged everywhere above it. This picks one version of each
shared thing, optimising for **usability over completeness** — the brief was that the
set had grown fat.

## Shared layout and components — who won

| Thing | Winner | Why, and what was dropped |
|---|---|---|
| Token base | W8 | Most complete set, and the only one with `proven` and `allowed` as distinct hues. W2 defined them as the same hex, so two different governance states rendered identically. |
| Org / workspace switcher | **W11's breadcrumb chips** | Every other version put two bordered boxes in the sidebar, costing ~110 px of vertical furniture for a control you touch monthly. W8 and W2 also shipped a layout bug there — label and value collided and overflowed the rail. Moving the switchers into the breadcrumb deletes the furniture *and* the bug. |
| Sidebar nav | W2 / W8 | Icons plus section headers. W4's two-letter mono codes (FL, RN) are lighter but slower to scan. |
| Nav counts | new rule | A count appears **only where something waits on a person** — Fleet approvals, Steering proposals, Audit incidents. Dropped the decorative ones (`Tools 214`, `Agents 50`, `Spend $412.66`), which read as alerts and are not. |
| Sidebar footer | W2 | Account button only. Dropped W6's version block and W10's enforcement meter to the Organization page, where someone is actually looking for them. |
| Top bar | W7 | Labelled `Assistant` button beats an unlabelled icon. Theme moved into the account dialog; W11's top bar had a broken oversized search icon. |
| Summary tiles | W10, capped at 3 | W4 shipped seven tiles plus a second row; W8 five. Three, each one number and one basis line. |
| Run header | W5 | Id, four inline chips, meta, task. W4's six chips over two rows is the single fattest element in the set. |
| Run body | W4, reduced to two panes | Frame list plus inspector. Chain and seal becomes a tab rather than a permanent third column. |
| Tabs | ceiling of 5 | W8's Spend page had eight. |
| Approvals | W11 list + W3 chain | Compact rows on Fleet; W3's four-hop chain is the detail, not the list item. |
| Fleet table | W2, 8 columns → 6 | Dropped harness and tier as columns; harness sits under the agent name. |
| Ontology map | W7 | Classes grouped by source. |
| Agents, Steering, Spend, Organization, Audit | W9, W6, W8, W10, W10 | Each trimmed to the ceilings above. |
| Assistant dock | W11 | Same panel on every page, showing the governed actions it took with receipt links. |
| States control | W7 / W10 | One row. W11's six-group panel was itself an example of the problem. |

## Rules the consolidated file holds to

- Three summary tiles per page, maximum. Five tabs, maximum.
- Exactly one gold action per screen. Gold is identity; it never encodes state.
- State reads as form as well as colour — a dot and a word, so it survives greyscale.
- Not-loaded states replace the page body, never the shell, so the operator keeps their bearings.
- The phone container query sits on a wrapper, never on the element it sizes.

## Known

- W2's source was still being edited when this was cut (16:31). Nothing from W2 was
  taken verbatim except the Fleet column set, so a later W2 revision does not
  invalidate this.
- Every stub control says "Not in this mockup" rather than silently doing nothing.

## Tool grammar (2026-09-11, shared by mc.html and W1–W11)

Every place a tool is displayed goes through one component and three orthogonal axes.
mc.html carries it as `toolCell` / `catBadge` / `hazard` / `gate`; the standalone W files
carry the same thing namespaced as a `TG` object (`TG.cell`, `TG.cat`, `TG.hazard`,
`TG.gate`, `TG.legend`, `TG.chips`, `TG.seg`) with `tg-` CSS classes so nothing collides.

| Axis | Question it answers | Grammar |
|---|---|---|
| Category | What does the tool act on? | Icon badge, one hue per category, never gold, never a state hue. Ten categories, least to most consequential: Read-only, Data query, Record write, Messaging & authoring, File mutation, Code execution, Source control, Infrastructure, Access & identity, Financial control. |
| Hazard | How bad is a wrong call? | Risk mark (circle · diamond · triangle · filled triangle for critical) plus a side-effect glyph (read · write · irreversible), in the state hues. |
| Gate | What did the belt decide? | Badge: allowed, needs approval, mandate + approval, denied, kill switch. A dashed border means a person still stands in the way. |

`consolidated.html` carries a deliberate subset of this, because it is one lean file and
the full grammar would outweigh it: one identity (`name@schema-version`, the same string in
the registry, in an approval, in a kill switch and in a `tool_requested` frame), a category
word as a flat badge, a hazard mark on `irreversible` and `moves_funds`, and a gate badge.
It has no label/API toggle, no category chips and no per-category hue — category there is a
word and a glyph, never a colour. Earlier revisions of this section said consolidated.html
displayed no tools; it displays them in five places, and did so before this note was written.

The cell shows the human label first and the mono API name and version beneath it
(`Create pull request` over `github__create_pull_request@3`); a Labels / API names toggle
swaps them. Tool lists offer category chips with counts and a By category / Flat layout.
Category is a registry attribute, not a policy: a rule may reference it, but only risk,
side effect, financial effect and egress carry a decision by themselves.

## One source (2026-09-12)

`mc.html` is the design. W1–W11 used to be eleven hand-drawn apps that each disagreed with it
somewhere (the bottom dock, approval size, the Agents naming, a run page that showed one run's
frames for every run). Everything each W file showed that `mc.html` lacked was ported into
`mc.html`, each flow became a `SCENARIOS` entry, and the W files are now generated from it by
`tools/build-w.mjs`. Where a W file and `mc.html` disagreed on a decision already recorded in
`tools/baseline/README.md`, the baseline won and nothing was ported. Superseded and not ported:
W1's right-side assistant drawer, W2's three delivery modes and @-addressing, W3's run strip (runMetrics instruments won),
W6's "create an agent opens a PR",
W7's page-local assistant, W8's display-currency switch, W11's right rail.
