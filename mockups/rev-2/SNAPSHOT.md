# rev-2 snapshot

A copy of `mockups/` taken on 2026-09-21, before mandates and approvals were removed from
rev1. It is the only place either feature still exists in full.

## Why it is here

Rev1 does not ship mandates or approvals. Neither is built, so both were cut from the
authoritative mockup rather than left as a design nobody can hold to. The code, the
fixtures, and the page specs for both are preserved here, so a later revision can restore
them without reading them back out of git history.

## What it holds

`src/`, `fixtures/`, `pages/`, `catalog.mjs`, and a built `missioncontrol.html`, all as
they stood at the snapshot. Nothing here is edited again. To read it:

```sh
open mockups/rev-2/missioncontrol.html
MOCKUP=rev-2 node tools/check-mockup.mjs
```

## What to look for when restoring

- Mandates: the `mandates` tab on the agent page, `aMandates`, the `mandate`, `mandateedit`
  and `mandaterevoke` dialogs, the `MANDATES` fixture, and `mockups/pages/agent.md`.
- Approvals: the approval drawer, the parked-run state, the waiting-on-a-human count on
  Fleet, and the W13 scenario.
