# `<RunOutputs>` — decision

**Decided 2026-09-17 by Mac. Option Story: the organising principle is time.**

This closes the design decision `docs/implementation-plan.md` §2 W2 held open for item 7 of
`docs/feedback-mockups.md`. The brief that framed the three options is `BRIEF.md`, beside this file.

---

## The decision

A run's outputs render as **one vertical spine in the order the run produced them** — read, wrote,
cut a branch, the gate it is parked on, what it would do next, the seal. The two rejected options
are not discarded; they are folded in so they stop competing with the spine:

- **Disposition** (Option Ledger) becomes the **state badge on each node** — created · written ·
  read · awaiting · blocked · withheld. Grouping by disposition is what a reader does with their
  eye; it did not need to be the page's structure.
- **Artifact** (Option Artifacts) becomes the **node's glyph and its own second line** — a file
  carries a diff stat, a branch its commit count, a media asset a thumbnail. A card per output was
  the right instinct about media and the wrong instinct about scale.

### Why time won

Item 7 said the frames are *bland and boring* and that *it is hard to tell the story of a run*.
Ledger answers "what changed" and barely answers "what is the story", which is the complaint.
Story answers the complaint directly, and it does one thing neither other option can: it puts the
pending gate **in its true position**. On the live release run the single most important fact about
the outputs is that `github__create_release` is waiting on approval and nothing has been published.
Under Ledger that is a row in a Pending group; under Artifacts it is one card among cards. On the
spine it is where the run stopped, followed by a dashed node naming the thing that has *not*
happened. That position is the fact.

A sealed run degrades into a finished narrative that ends at the seal, which the brief predicted
and the built mockup confirms.

### The tradeoffs, and what was done about them

| Tradeoff named in the brief | What the build does |
|---|---|
| Time order is not always the order a human cares about | The tally in the header (`3 artifacts · 2 reads · 1 gate`) answers "what came out of this" without reading the spine, and **Hide reads** strips it to durable artifacts only. |
| A run touching 40 files needs a collapse rule | More than three durable nodes of one kind in a row fold to the first two plus a count, expandable. Consecutive reads fold to a single quiet line. |
| It competes visually with the Governed-actions tab | It does not repeat that tab. A governed moment appears here only when it is *why the outputs stop*, and its one action links into the tab rather than reproducing it. |

### What this changes in the data

The flat `run.touched` list is no longer the source. It flattened three different things — what the
run made, what it only looked at, and governance objects — into one array of strings with the
qualifier smuggled in after a `·`. `runs[].outputs` gives each of those its own field; the shape is
documented in `mockups/fixtures/README.md`. `touched` stays in the fixture because `RUNGRAPH`,
`frPath()` and the generated fleet still read it, and a run with no `outputs` derives a spine from
it so nothing goes blank.

**Reads never get a node.** They are hairline ticks with one line of text. That is what finally
stops `CHANGELOG.md · read once` from reading like a change.

**Nothing on the spine is gold.** Gold is identity, not state: the pending gate is `--st-approval`,
a failure `--st-failed`, a tampered seal `--st-critical`. A seal's badge carries its verdict with
the same class `verdictBadge()` gives it everywhere else, so a tampered seal cannot read like a
proven one.

---

## Where it is built

| | |
|---|---|
| Component | `mockups/src/engine.js` → `runOutputs(R)`, rendered by `pRun()` between the summary and the linked-work graph |
| Styles | `mockups/src/engine.css`, the `.ro*` block |
| Data | `mockups/fixtures/runs.json` → `runs[].outputs`, one authored spine per seed run |
| Page doc | `mockups/pages/run.md` |
| Seam | `<RunOutputs>` in `docs/implementation-plan.md` §2 W2 and lane P2b — no longer waiting on a design |

## The one thing the fixtures do not exercise

Item 7 names *new media assets*. The component renders a `media` node with a real thumbnail
(`thumb` / `dim` on the node, `.ro-thumb` in the stylesheet) and `roDerive()` classifies an image,
video or audio path as media, but **no seed run produces a media asset**, so no fixture exercises
the thumbnail. Grounding a media node needs a run that genuinely generates one rather than a
picture invented for the mockup; when that run exists, give its node a `thumb` and it renders. This
is the only part of item 7 not visible in the built mockup today, and it is tracked as issue #39,
which carries the constraints already found.
