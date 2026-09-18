# `<RunOutputs>` — design brief

**Status: decided 2026-09-17 — Option Story.** The decision, its reasoning and where it is built
are in `DECISION.md` beside this file. The brief below is kept as it was written, as the record of
what the three options were and what each was judged on.

---

**Status when written:** blocked on a design decision, by your own plan.
`docs/implementation-plan.md` §2 W2 lists exactly two items as needing one, each with a
component seam already reserved: `<MobileNav>` (item 3) and **`<RunOutputs>` (item 7)**.
This brief covers item 7.

**The ask, verbatim** (`docs/feedback-mockups.md`, item 7):

> The way the frames look today is kind of bland and boring it is hard to tell the story of
> a run. Runs result in prs, and file changes, and new media assets etc... and we will know
> what was generated and where it was saved we should re-think how this presents in the run ui.

**Where it lives:** the Run page (`mockups/pages/run.md`), alongside the tab strip
(Transcript · Governed actions · Proof · Done · Cost · Policy · Context · Chain and seal).

---

## The actual problem

A run's outputs are today a flat list of strings on `run.touched`. From
`mockups/fixtures/runs.json`:

```json
"touched": ["a-intel/platform#482", "release/4.11.0-notes", "CHANGELOG.md · read once"]
"touched": ["a-intel/platform#482", "refs/pull/482/head · 2 pushes, main untouched", "wit_01K5RQ8M4 · verdicts only"]
"touched": ["PO-4471", "mnd_7K2ETQ4", "3 invoices · $18,472.36"]
```

Three different things are flattened into one list:

1. **What the run made** — a branch, a draft file, a PR, a media asset.
2. **What it only looked at** — `CHANGELOG.md · read once`.
3. **Governance objects** — a mandate id, a witness id.

The qualifier is smuggled into the string after a `·`. Nothing says which items are
durable artifacts a human would go open, and nothing says what is still *pending* — the
live run above is waiting on approval for `github__create_release`, which is the single
most important fact about its outputs and is currently invisible.

**The design question:** what is the organising principle — disposition, artifact, or time?

---

## Grounding data (use this, don't invent)

Run `run_01K5RS7M2E8FJ3QW` — the richest case, because it is mid-flight with a pending gate:

- Agent `a-intel.core.release-manager`, operator Marcus Bell, workspace `core-platform`
- Task `a-intel/platform#482` — "Cut 4.11.0 release notes"
- Status `live`, turn 7, 41 steps, 186 frames, cost `$4.13`, tier `gateway`, grade `full`
- Summary: drafted 4.11.0 release notes from 38 merged PRs; read `CHANGELOG.md` once;
  grouped 31 changes under Features / Fixes / Breaking; wrote the draft to
  `release/4.11.0-notes`; **waiting on approval for `github__create_release`**; nothing
  published, `main` untouched.

Outputs to render:

| What | Kind | Where it landed | State |
|---|---|---|---|
| `release/4.11.0-notes` | branch | the repo | created, 1 commit |
| release notes draft | file | on that branch | written, 31 changes grouped |
| `CHANGELOG.md` | file | repo | **read only, not modified** |
| `github__create_release` | governed action | — | **awaiting approval** |
| `a-intel/platform#482` | task | GitHub | linked |

Seal/proof vocabulary for the sealed variants: verdicts `flipped`, `unmoved`, `waived`,
`failing`; witness ids like `wit_01K5RQ8M4`.

---

## Three directions to choose between

Each explores a different organising principle. They are not three shades of one idea.

### Option Ledger — organise by disposition
Grouped list: **Created · Changed · Read only · Pending**. One row per artifact: kind glyph,
name, destination, state badge. Reuses the existing table + badge vocabulary exactly.
- *Case for:* scans fastest, matches the rest of Mission Control, cheapest to build, and
  the Read-only group finally stops `CHANGELOG.md` from looking like a change.
- *Tradeoff:* still a list. Answers "what changed" well and "what is the story" barely —
  which is the thing item 7 actually complained about.

### Option Artifacts — organise by artifact
One card per output, sized to its kind: a PR card with title and checks, a file card with a
diff stat, a media card with a real thumbnail, a branch card with its commit count. Pending
items render as a card with the gate on it.
- *Case for:* the outputs become things you can look at, not strings. Media and diffs get
  real previews, which is explicitly in the ask ("new media assets").
- *Tradeoff:* heaviest surface; a run touching 20 files becomes a wall of cards. Needs a
  collapse rule, and that rule is itself a design decision.

### Option Story — organise by time *(chosen 2026-09-17 — see `DECISION.md`)*
A vertical spine in the order the run produced things, with the governed moments inline:
read → wrote → created branch → **gate: awaiting approval** → (would publish) → seal.
Durable artifacts sit as nodes on the spine; reads are demoted to quiet inline marks.
- *Case for:* answers item 7 most directly — it *is* the story of the run, and it puts the
  pending gate in its true position rather than in a separate strip. Degrades gracefully:
  a sealed run reads as a finished narrative ending at the seal.
- *Tradeoff:* time order is not always the order a human cares about; for a run that
  touched 40 files the spine needs the same collapse rule Artifacts does, and it competes
  visually with the existing Governed-actions tab.

Build all three; keep `Main.dc.html` as **Option Story** until you pick.

---

## House vocabulary — verified values, do not round

Dark surface (`engine.css` `:root`, which is the Run page's default), and these match the
`@oxagen/ui` house tokens the design system now ships:

```
--ink   #09090B   page          --fg    #FFFFFF   primary text
--void  #000000   below page    --body  #E4E4E7   body text
--panel #18181B   panels/cards  --muted #A1A1AA   secondary text
--hl    #27272A   lifted row    --dim   #71717A   tertiary text
--border #27272A  --rule #3F3F46

--gold  #D4AF37   identity — ONE gold action per screen, never a state
--gold-bright #F1CE65   --gold-deep #977017

state: --st-allowed #57A97C · --st-approval #5B93D6 · --st-denied #C66A4A
       --st-proven  #3FA2A2 · --st-failed   #C0453C · --st-critical #D6455E
```

- Type: **Space Grotesk** — 400 body · 500 UI · 600 headings · 700 the Ox lettermark.
  (As of 2026-09-16 these are four real weights; they were all Light 300 before.)
  System monospace (`--mono`) for ids, paths and digests only.
- Icons: inline stroke SVG on a 16/20/24 grid. **Never emoji.**
- Gold is identity, not state. A pending gate is `--st-approval`, a failure is
  `--st-failed`. Do not use gold to mean "attention".
- Every path, run id, witness id and digest is monospace.

---

## How to run it

The canvas step needs you — `/design` is reserved for explicit user invocation and can't be
driven by an agent. Either:

**A. Local canvas.** Run `/design` and paste this brief. It produces a multi-artboard canvas
you can tweak by hand.

**B. Claude Design, with your real components** *(what the sync was for)*. Open
https://claude.ai/design/p/f3a06086-f960-4be5-a06c-e5cdd416ade7 and prompt the design agent
with this brief. It builds with the real `@oxagen/ui` components, so whatever you approve
maps onto shippable code instead of a picture.

B is the better path for anything you intend to build — that is the entire point of having
synced the design system. A is better if you want to sketch the three directions loose and
fast before committing.
