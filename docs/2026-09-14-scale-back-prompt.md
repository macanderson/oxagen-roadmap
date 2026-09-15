# Scale back Mission Control — mockup prompt

Source of the argument: `docs/oxagen-mission-control-review.html` ("The scale-back
question", 14 September 2026). This file turns that review into a prompt you can
hand to an agent working in `tmp-oxagen-mockups`.

The review's one-line thesis, which the whole task serves: **this is an ordering
problem that looks like a surface-area problem.** Nothing gets deleted to look
smaller. Surfaces move out of the first release and into an appendix titled
"already built," and the wedge — recorder, money, governance — is what a visitor
meets first.

---

## Decide these two before running the prompt

The rest of the work is mechanical. These are not.

1. **The in-app assistant — cut, or demote?** The review says cut it ("a chat
   assistant that sells nothing"). It is not a page you can lift out: it is the
   `asstConvo` panel, `w11-assistant-and-account`, the `z-ai/glm-latest
   (assistant)` rows on Spend, and the `oxagen.assistant` actor on audit records.
   Pick one and write it into the prompt below:
   - **Cut** — remove the panel, retire w11 the way w7 was retired, drop the
     assistant model rows from Spend, reattribute the audit records to a human
     operator.
   - **Demote** — panel stays in `mc.html` behind the appendix framing, does not
     appear in the wedge tour, and w11 moves to the "already built" list.
2. **Does the Witness flow exist yet?** The review moves Witness from last to
   front. There is no witness page or scenario in `mc.html` today; `w5-proven-not-
   claimed` is the closest thing. Either the prompt scopes a new witness surface
   (a real design job, not a re-label) or it stops at re-sequencing what exists
   and Witness is a separate task. Say which.

---

## Ground truth the agent must not rediscover

- **`mc.html` is the only file you edit.** `consolidated*.html`, `pages/**` and
  `w1`–`w13` are generated from it. Editing a generated file is the one way to
  get this task wrong.
- **The ontology cut is already done** (commits `48f5e8a`, `4052cdd`). There is
  no ontology page slug, and `w7` is gone. The review's largest recommendation
  has already landed — verify, do not redo, and do not re-add it in passing.
- **Rebuild chain**, run in this order after any `mc.html` change:
  ```sh
  node tools/build-w.mjs            # regenerate w1–w13
  node tools/build-pages.mjs        # regenerate consolidated*.html and pages/
  node tools/build-w.mjs --check
  node tools/build-pages.mjs --check
  node tools/check-scenarios.mjs    # walk every scenario step in Chromium
  node tools/check-pages.mjs        # open every generated page in Chromium
  node tools/baseline/check-baseline.mjs mc.html
  ```
- **The demo record is fixed everywhere:** Anderson Intelligence Corp.
  (`a-intel`), workspace `core-platform`, operator Marcus Bell. Do not invent a
  second tenant to demonstrate the smaller product.
- **Retiring a W file follows the w7 precedent** — removed from `SCENARIOS`, the
  file deleted, the README table updated, the numbering left with its hole. Do
  not renumber survivors.

---

## The prompt

> You are working in `~/Projects/tmp-oxagen-mockups`, a repo of self-contained
> HTML mockups for Oxagen Mission Control. Read `README.md` and
> `docs/oxagen-mission-control-review.html` first.
>
> **Task: re-sequence the mockups so the first release is the wedge, and
> everything else reads as "already built" rather than "on the roadmap."** Not a
> deletion pass. The page count barely changes; what changes is what a visitor
> meets first and what the mockup chrome claims is next.
>
> Work only in `mc.html` and regenerate. Branch first, push immediately, commit
> per surface.
>
> ### 1. Establish the wedge
>
> Four surfaces are the first release: **Fleet**, **Run**, **Spend**, **Agents**.
> They must be what the product opens on, what the nav leads with, and what the
> scenario rail tours. Spend carries findings ranked by money at stake — that is
> the page the review calls the cheapest revenue in the spec, so it must not read
> as a reporting afterthought behind Billing.
>
> ### 2. Thin four surfaces
>
> Keep the page, cut the second-year features out of the mockup so it stops
> promising what the wedge does not ship:
>
> | Surface | Keep | Cut from the mockup |
> |---|---|---|
> | Tools | registry, approval rules, mandates, kill switches | policy simulation against real history, two-person mandates, the published assurance suite |
> | Billing | plan, invoices, one meter | every alternative pricing display; the meter appears once and does not vary by screen |
> | Organization | members, roles, invitations, API keys | SSO and SCIM |
> | Steering | record → proposal → pull request | effect metrics, retirement candidates, promotion thresholds |
>
> ### 3. Defer Audit to the appendix
>
> Write-once archive at seal time stays — the evidence chain depends on it.
> Legal holds, crypto-shredding and reconciliation-to-the-cent come out of the
> first-release framing and into "already built."
>
> ### 4. Handle the assistant
>
> [Paste your decision from "Decide these two" above. If **cut**: remove the
> `asstConvo` panel, retire `w11-assistant-and-account` following the w7
> precedent, drop the `z-ai/glm-latest (assistant)` rows from the Spend model
> table, and reattribute `agent:"oxagen.assistant"` audit records to Marcus Bell.
> If **demote**: leave the panel in place, remove it from the wedge tour, and
> list w11 under "already built" in the README.]
>
> ### 5. One meter, stated once
>
> The review's sharpest commercial finding is that the price has moved three
> times in a month and that the meter prices the recording rather than the
> finding. In the mockups this means: **one** pricing story, appearing
> identically on Billing, on Spend and in any onboarding screen that mentions
> cost. If two screens disagree about the meter, the mockup is wrong regardless
> of which number is right. Ask before inventing a number — the price itself is
> the founder's call, not yours.
>
> ### 6. Re-frame, do not delete
>
> Add an "already built" section to `README.md` listing the deferred surfaces and
> their W files. The review's exact framing: *not deleted, not deprecated, not on
> the roadmap — built, working, and not what you are selling this quarter.* The
> mockup chrome (state bar, scenario rail) must not present a deferred surface as
> upcoming work.
>
> ### 7. Verify
>
> Run the full rebuild chain above. Every `--check` exits 0, both Chromium walks
> pass, and the baseline check passes. Then screenshot the wedge tour —
> Fleet → Run → Spend → Agents — from `consolidated-loaded.html` and from
> `consolidated-loaded-mobile.html`, and save them under `verifications/`.
>
> ### Do not
>
> - Do not edit `consolidated*.html`, `pages/**` or `w*.html` by hand.
> - Do not re-add the ontology, Neo4j, connectors or the graph surfaces.
> - Do not renumber W files around the holes left by w7 (and w11, if cut).
> - Do not change the demo record, the tenant, or the operator.
> - Do not delete a surface the review told you to defer. Deferral is a framing
>   change; deletion loses work that is already built and already correct.

---

## What "done" looks like

- `mc.html` opens on the wedge; Fleet, Run, Spend, Agents lead the nav.
- Four surfaces thinned per the table, Audit deferred, assistant resolved per
  your decision.
- One pricing story, identical everywhere it appears.
- README carries an "already built" section; no deferred surface is presented as
  upcoming.
- Full rebuild chain green, both Chromium walks pass, wedge screenshots saved
  desktop and mobile.

## Open, and deliberately not answered here

The review closes with three questions for the customer council — what the three
paying partners actually bought, whether any asked for the ontology, and whether
any would pay for a stamp. Those answers can change the ranking above. This
prompt encodes the review's ranking; if the council contradicts it, rewrite the
wedge in step 1 before running anything.
