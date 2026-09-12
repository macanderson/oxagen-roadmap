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
