# Audit

## Page header {#audit/header}

The header names the page, states the organization's retention policy in one mono line, and carries the page's one gold action, **Export evidence bundle**.

### Purpose
Audit answers four questions about anything that happened in the organization: what happened, who allowed it, under what authority, and what it cost. An auditor, a security lead or a finance reader starts here. The gold action builds the bundle they take away.

### Rationale
Audit is one of the three organization pages in `docs/mission-control-spec.md` §14, with the job "control-plane audit events, incidents, receipts, exports, keys, and retention". Oxagen writes the record, and an agent cannot. The mock used to print "What happened, who allowed it, under what authority, and what it cost." under the h1. It described the page, so it moved here.

The retention line stays on the page because it is policy data, not an explanation: control-plane events for 7 years, the run ledger forever, and bodies for 7 years by default (§13.1, §13.3). An auditor reads it before trusting any empty result.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Retention line | fixed text in `pAudit()` | `evidence.retention_policy_versions` | partial |
| Export evidence bundle | `openDialog('newexport')` | archive exports (`privacy.data.export`) | partial |
| Read permission | `deniedState("the audit record", …)` | IAM, `org.auditor` or `org.owner` | live |

### Logic
1. `pAudit()` reads the tab with `tab("audit","events")`, then branches on `S.state`: `loading` returns `skeleton()`, `error` returns `errorState("Audit","503 audit_store_unavailable")`, `denied` names `org.auditor or org.owner`, and `empty` returns "No audit events yet" with **Open Organization**.
2. Loaded, it draws the header, `auditTabs(t)` and the body of the tab from a map of six renderers: `auditEvents`, `auditIncidents`, `auditReceipts`, `auditExports`, `auditKeys` and `auditRetention`.
3. The retention line is typed text in the mock. The build reads it from the organization's policy, the same record the Retention tab and the Retention policy dialog read.

### States
- Empty: "No audit events yet". An empty record means nothing has happened in this organization yet. It never means recording is off.
- Error: `503 audit_store_unavailable`, with **Try again** and **Open an incident**.
- Denied: you hold neither `org.auditor` nor `org.owner`.
- Mobile: the page spec's Mobile section applies. Every list table becomes a stack of labelled cards.

## Tab bar {#audit/tabs}

Six tabs split the audit record by kind: Events, Incidents, Receipts, Exports, Keys and Retention.

### Purpose
You pick the part of the record you need. Each tab has its own address, so a link from a notification, an incident or the docs lands on the right tab.

### Rationale
§14 lists the six parts of the Audit page. They are separate tabs because each reads a different store: control-plane events, incidents, receipt frames, archive exports, KMS keys and the retention policy (§13.3). The counts give the size of each list, and Incidents counts only what is open, because an open incident waits on a person.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Events count | `auditRecent()` over `AUDIT` | `audit.audit_events` | partial |
| Incidents count | open rows of `INCIDENTS` | `tacho.incidents` | live |
| Receipts count | `RECEIPTS.length` | receipt frames | not built |
| Exports count | `EXPORTS.length` | archive exports | partial |

### Logic
1. `auditTabs(t)` renders a `role=tablist` with one `role=tab` button per tab and `aria-selected` on the current one.
2. The routes are `#/a-intel/audit/events`, `/incidents`, `/receipts`, `/exports`, `/keys` and `/retention`. `auditGo(t)` sets `S.tab.audit`, writes the hash and renders.
3. Events counts the last 30 days through `auditRecent()`, which keeps events whose calendar age from `auditAge()` is 30 days or less. The Events table under its default range shows the same rows, so the tab count and the table agree.
4. Incidents reads "N open", with the title "N open incidents of M".
5. Receipts and Exports count their whole lists. Keys and Retention carry no count.
6. The sidebar's Audit count is the open critical incidents. That is the one number on the page that waits on someone.

### States
Loaded only. The tab bar is not drawn in the empty, loading, error or denied states.

## Event tiles

Four tiles count the control-plane events of the last 30 days: all of them, the denied ones, those by a service principal and those by an agent.

### Purpose
Before reading 400 rows, you see how many events there were, how many were refused, and how much of the activity came from services and agents rather than people.

### Rationale
Every IAM decision is recorded, allowed or not, and denials are recorded and cost nothing. Service principals such as Terraform, CI, exports and the audit archive act in the record the same way people do. Each agent event is a governed action with a receipt. The tiles used to say those four things as their basis lines. They explained the record rather than qualifying the number, so they moved here. The basis lines now state what each count is out of.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Events · 30 days | `auditRecent()` over `AUDIT` | `audit.audit_events` | partial |
| Denied | `auditResult()` | `audit.audit_events` result | partial |
| By a service principal, by an agent | `auditActorKind()` | `audit.audit_events` actor kind | partial |

### Logic
1. `auditEvents()` calls `auditRecent()` once and counts from that list, so all four tiles cover the same 30 days.
2. `auditResult(e)` returns the event's `res`, or `denied` for `tool_call.denied`, or `allowed`.
3. `auditActorKind(who)` returns `agent` for a key that starts with `a-intel.`, `service` for `svc_*`, the verifier, the gateway and the policy engine, and `human` for anyone else. The table uses the same function, so the strip and the list cannot disagree.
4. The basis lines read "allowed and denied" on the first tile and "of N events" on the other three.
5. `auditStats(tiles,"event-tiles")` draws the strip and puts `data-help="event-tiles"` on it, so this strip and the Incidents strip answer different sections.

### States
The tiles count the whole 30 days and ignore the Actor and Range selects. A filtered table can show fewer rows than the tiles count.

## Control-plane events

The table of every control-plane event: admin actions, IAM changes, repository links, plane changes and key rotations, with who did it, the result and a reference.

### Purpose
You answer "who did what, and was it allowed" for anything outside a run: a role change, an API key, an invitation, a kill switch, a key rotation. The Reference column links the event to the frame or record behind it.

### Rationale
Oxagen writes this record, and an agent cannot write to it. A call the harness reported is labeled as reported, and the record never shows it as decided by Oxagen (§6.5, the threat table). The panel used to carry the caption "admin actions, IAM changes, repository links, plane changes, key rotations" and a note saying those things. Both explained the table, so they moved here.

The control-plane audit tier keeps these events for 7 years (§13.3). The API filters by actor kind and by range with `since` and `until`, and the two selects here take the same parameters.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Events | `AUDIT`: the seed in `mockups/fixtures/audit.json` plus the events `volume()` generates | ClickHouse `audit_events` and `security.security_events`, read by `audit.log.query` | partial |
| Actor kind | `auditActorKind()` | `actor_kind` on the event | partial |
| Result | `auditResult()` | the event's result | partial |

### Logic
1. `auditEvents()` reads the Actor select from `S.auditActor` (default `all`) and the Range select from `S.auditRange` (default `30d`). Changing either sets the value and calls `render()`.
2. `AUDIT_RANGES` holds three ranges. "Last 30 days" and "Last 7 days" compare whole calendar days, and "Last 48 hours" compares hours. `auditAge(t)` measures both against the mock's now, 2026-09-11 09:14 UTC. A bare time means today, and a dated stamp gives its day.
3. A row shows When, Event, Actor with its kind, What, Result, Severity and Reference. Result reads Allowed or Denied through `AUD_DEC_LABEL`.
4. The shared table helper adds a search box over the rows, Result and Severity filters, sorting and a pager.
5. **Export CSV** opens `exportevents`.
6. The search field above the table is not wired in the mock. The build searches events, receipts, actors and external ids.
7. Before the selects worked, changing one toasted "Filtering is a mockup here". They filter the rows now.

### States
- A filter that matches nothing shows "No event matches this actor and range." in place of the table.
- The page's empty state covers an organization with no events at all.

## Incident tiles

Four tiles give the open incidents, the open criticals, the median time to resolve, and the money moved without a receipt.

### Purpose
You see at once whether anything is open, whether any of it is critical, how long incidents take to close, and whether money moved that Oxagen did not govern.

### Rationale
The money tile is the one a finance reader looks for. It becomes non-zero only through an exception: an external transaction on a governed connection with no receipt (§6.9). The Open tile used to say "one critical · money moved without a receipt" as typed text. It now counts the open criticals, and the money tile carries the money.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Open, Critical open | `INCIDENTS` | `tacho.incidents` | live |
| Median time to resolve | `incidentStamp()`, `incidentSpan()` over resolved rows | `tacho.incidents` opened and closed times | partial |
| Money moved without a receipt | the open `mandate.exception` incident | the mandate ledger exceptions | fixture only |

### Logic
1. `auditIncidents()` takes the open incidents and, from them, the open criticals.
2. Open prints the count, with "N critical" or "none critical" beneath. The number turns red when a critical is open.
3. Critical open prints the count and "since" the time the oldest open critical opened.
4. Median time to resolve takes every resolved incident with a closed time. `incidentStamp()` parses the opened and closed times, and the median of the gaps prints through `incidentSpan()` as days and hours, or hours and minutes. The basis line names how many resolved incidents it covers.
5. Money moved without a receipt reads $18.00 USD while the `mandate.exception` incident is open, and $0.00 when it is not. The amount is fixture text. The build sums the amounts on open exceptions.
6. `auditStats(tiles,"incident-tiles")` puts `data-help="incident-tiles"` on the strip.

### States
With nothing open, Open reads 0 with "none critical" and Critical open reads "none open".

## Incidents

Every incident the organization has recorded, open or resolved, with its severity, what happened, when, and who detected it.

### Purpose
You find what is open, open the full record, and resolve it once it is accounted for. You can also raise an incident by hand from here.

### Rationale
The policy engine, the gateway and the verifier raise incidents, and a person can raise one too. The panel used to carry the caption "raised by the policy engine, the gateway and the verifier". It also carried a note saying that an external transaction on a governed connection with no receipt is a critical exception: money moved that Oxagen did not govern. Both explained the list, so they moved here. The rule itself is §6.8: where a connection reports its own activity by webhook, the gateway matches each event to a receipt, and an unmatched event is a critical exception.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Incidents | `INCIDENTS`: six seed rows in `engine.js` plus the rows `volume()` generates, including one tamper incident per flagged agent | `tacho.incidents` | live |
| Kinds | `mandate.exception`, `taint_raised`, `receipt_modified`, `chain_break`, `hooks_removed`, `credential_probe` and the generated kinds | incident kinds | live |

### Logic
1. `auditIncidents()` renders one row per incident: the severity badge, the title with kind and scope, the opened time, Detected by, and the state with the closed time beneath.
2. A row or its **Open** button opens `incidentview`. An open row also carries **Resolve**, which opens `incidentclose`. The row buttons are plain, so **Export evidence bundle** stays the one gold action on the screen.
3. The critical banner shows while the `mandate.exception` incident is open. It names the charge, the amount and the connection, and links **Open the incident**.
4. **Open an incident** opens `incident`.
5. The shared table helper adds State and Severity filters, sorting and a pager.

### States
With the money exception resolved, the banner goes away and the tiles fall to $0.00.

## Receipt search

Search over the receipts: the signed record of every tool call, with its decision, amount, external effect and tier.

### Purpose
You find the one call behind a charge, a pull request or a denial, by agent key, tool, external effect id, call digest or receipt id, and open its full receipt.

### Rationale
A receipt is the signed record of one tool call (§6.10). The gateway assembles it from the call's frames and stores it as its own frame. It is the unit the Audit page searches. Frame rows live in the database and bodies in object storage (§13.3). The panel used to carry the caption "One signed record per tool call" and a store chip naming those two stores. Both explained the panel, so they moved here.

A denied call has a receipt too. It records the denial, and nothing was dispatched. That line used to sit in the empty result. It moved here, and the empty result now says only what you can search by.

The footer used to claim that harness-reported receipts say "Recorded" and routed calls say "Decided by oxagen". The page never showed those words. Each row shows the recorded decision badge and the recorded tier badge (`observe`, `harness`, `gateway` or `contained`), and a harness-reported call is never shown as gateway-enforced.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Receipts | `RECEIPTS`: three seed receipts, the approval receipts from `approvalReceipt()`, the mandate receipts, and the receipts `volume()` generates | receipt frames | not built |
| Tier | `r.tier`, through `tierBadge()` | the frame's enforcement tier | not built |

### Logic
1. `auditReceipts()` reads the query from `S.rq`. Enter or **Search** sets it and renders.
2. A receipt matches when its id, agent, tool, external effect, operator, workspace, decision, tier or amount contains the query, ignoring case.
3. The chips are fixed example queries: `stripe`, `harness`, `observe`, `deny`, an agent key and a Stripe payment id. **clear** empties the query.
4. A row shows the receipt id, the time, the agent led by its harness mark with the operator and workspace beneath, the tool through `toolCell()`, the decision, the amount, the external effect and the tier. A row opens `receipt`.
5. The footer reads "N of N receipts shown".

### States
A query with no match shows "No receipt matches" with the query, what you can search by, and **Clear the search**.

## Export card {#audit/export}

One card per export: its title, a Ready or Building badge, **Verify bundle**, **Download**, and the export's facts.

### Purpose
You find an export someone built, check that it verifies, and download it to hand to an auditor.

### Rationale
An export is a verifiable bundle: archive segments, attestations, key ids and a verifier script (§13.4). Each segment was written once, at seal time, and holds the same bytes the graph indexed (§13.3). A customer's auditor checks it offline, without trusting Oxagen or the worker's harness. A callout at the top of the tab used to say all this. It explained the product, so it moved here. Each card carries `data-help="export"`, so every card answers this one section whatever its title.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Exports | `EXPORTS`: three seed rows plus nine `volume()` generates | archive exports (`privacy.data.export`) | partial |
| Signature, key ids | `x.sig`, `x.keys` | the bundle manifest | partial |

### Logic
1. `auditExports()` renders one card per export in a two-column grid.
2. A card with `st` of `ready` shows Ready and enables both buttons. A generated export with `st` of `expired` shows a neutral Expired badge. Any other status shows "Building…". Both disable the buttons.
3. **Verify bundle** sets `S.verified[id]` and renders the verifier's output under the facts.
4. **Download** toasts "Downloading <id> with its verifier." and writes nothing in the mock.
5. The facts are Export id, Range, Contents, Size, Created, Signature ("Signature pending" while building) and Key ids.
6. A bundle built from **Export evidence bundle** lands first in the list as Building.

### States
A building export shows Building and "Signature pending", with both buttons disabled.

## Verifier

The transcript of `oxagen-verify` checking one bundle offline.

### Purpose
You see what an auditor sees when they run the verifier on a bundle, and you can copy the two commands to run it yourself.

### Rationale
The verifier runs offline and needs no Oxagen service. It recomputes every Merkle root and checks every seal signature against the published key, so an auditor never has to take Oxagen's word for the chain (§13.4). A note under the transcript used to say so, and a chip said the verifier ships inside every bundle. Both explained the panel, so they moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Transcript | fixed `<pre>` in `auditExports()`, with `ORG.attester` | the verifier's output for `exp_01K4Q7M1` | fixture only |

### Logic
1. `auditExports()` prints a fixed transcript for `exp_01K4Q7M1`: the manifest (31 segments and 188,440 frame envelopes), 31 of 31 Merkle roots matched, 962 of 962 seal signatures verified, chain continuity, the key ids present, and the tiers (harness 953, observe 9).
2. The last line reads OK and names the release key `rel-2026-03`.
3. The transcript does not change with the cards. **Verify bundle** on a card prints a shorter result under that card.

### States
Static.

## Outbound events

The event kinds this organization sends to its own systems, and how they are delivered.

### Purpose
A security lead checks which events leave Oxagen, where they go, and whether any failed to arrive.

### Rationale
Subscriptions name the event kinds, and only those are emitted. Everything else never leaves. Payloads carry ids and a link to the run and frame, never raw prompt or tool bodies (§7.7). A paragraph above the kinds used to say so. It explained the mechanism, so it moved here. §7.7 is a Series A item, so the build ships this panel when subscriptions ship.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Subscription and kinds | fixed in `auditExports()` | event subscriptions (`list_event_subscriptions`) | not built |
| Dead-letter view, delivery | fixed text | delivery log | not built |

### Logic
1. `auditExports()` prints the badge "Webhook: security-feed" and five kinds: `run.sealed`, `approval.requested`, `tool_call.denied`, `kill_switch.flipped` and `mandate.exception`.
2. Dead-letter view reads "0 undelivered". Delivery reads signed webhook, HMAC with a rotating secret, ordered per run, at least once with backoff.
3. Nothing here is editable. Creating or changing a subscription is a governed action with the third-party egress class (`set_event_subscription`).

### States
Static in the mock.

## Keys

Every key the organization's record depends on: the key-encryption key generations, the run attestation keys and the host device keys, with their validity and state.

### Purpose
You check which key protects new data, which older generations still decrypt, which key signs receipts, and whether a host's device key has expired. You rotate the key-encryption key from here.

### Rationale
Each organization has one key-encryption key in KMS, and data-encryption keys exist per object and per subject (§5.4, §13.4). The panel used to carry that as a caption. Rotation does not rewrite history. A retiring generation stays valid for decryption until every object it wrapped has been re-wrapped. A receipt keeps citing the signing generation it was signed under, so a four-month-old receipt still verifies after a rotation. Key ids and validity windows are published per organization, so a customer can verify an export offline years later. A note under the table used to say all this, and it moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Keys | `KEYS` in `engine.js` | KMS per organization, `kek_key_id` on the organization | not built |
| Re-wrap progress | fixed 61 percent | the re-wrap job's progress | not built |

### Logic
1. `auditKeys()` renders one row per key: name and id, algorithm, generation, valid from, valid to, state and what it covers.
2. The state badges map active to green, retiring to amber, and retired and expired to neutral.
3. The active KEK row carries **Rotate**. **Rotate KEK** in the panel header opens the same `rotatekek` dialog.
4. The bar under the table reads "Re-wrap kek_aintel_2026Q2 →" and the active KEK id, at a fixed 61 percent (866k of 1.42M objects). After a rotation the arrow names the new generation while the bar still reads 61 percent. The build reads the progress from the re-wrap job.
5. `rotateKek()` marks the current KEK retiring, adds the next generation as active and writes `key.rotated` to `AUDIT`.

### States
Loaded only. The shared table helper adds Algorithm and State filters and a pager.

## Retention

The organization's retention policy: how long bodies are kept, the hot window, the per-workspace override and the storage price.

### Purpose
You check how long the record lasts before you rely on it, and what keeping it costs. **Edit policy** changes the policy.

### Rationale
Oxagen keeps everything at full fidelity for 7 years from the seal and makes it cheap by writing it once (§13.1). Organizations may set a longer period. The hot window is 13 months, then frame rows are compacted into the segment. Bodies are never moved, and a compacted run reads from the segment instead of the hot table, the same bytes (§13.2, §13.3). The page used to carry those explanations as a caption, clauses on two facts, and a row called "A compacted run". They moved here, and the facts keep only the values.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Body retention, hot window | fixed in `auditRetention()` | `evidence.retention_policy_versions` | partial |
| Per-workspace override | `WS[].retention` | the workspace's retention mode | partial |
| Storage price | `retainedGbText()` over `BILLING.retainedGb` | evidence store size by organization | partial |

### Logic
1. `auditRetention()` prints four facts through `auditFacts()`.
2. Per-workspace override reads "Full content (all workspaces)" when every workspace shares one mode. Otherwise it lists each workspace with its mode through `keyText()`.
3. Storage price reads the retained gigabytes from `retainedGbText()`, the same figure Billing shows, then "included for 13 months, then $0.10 per GB-month" with the monthly amount.
4. The chip "organization policy" names the scope. **Edit policy** opens `retention`.

§12.1 includes 12 months of evidence on the Build and Scale tiers, where the mock says 13. The build prints the organization's own terms.

### States
Loaded only.

## Archive tiers

The four stores the record lives in, what each holds, how long, and how much it holds today.

### Purpose
You see where each part of the record is kept and for how long, so you know what a query or an export can reach.

### Rationale
§13.3 defines three stores under one policy: the ledger, the frame rows and the bodies with their segments, plus the control-plane audit. The ledger is kept forever, frame rows for the hot window, bodies for 7 years, and control-plane events for 7 years. A chip in the header used to say "three stores, one policy". It explained the table, so it moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tiers | `RETENTION_TIERS` in `engine.js` | the §13.3 tiers | partial |
| Held today | fixed counts, and `retainedGbText()` for bodies | store sizes | partial |

### Logic
1. `auditRetention()` renders one row per tier: Tier, Where, What it holds, Retention and Held today.
2. The bodies row reads its size from `retainedGbText()`, so it matches Billing and the Retention panel.
3. The other counts (412k runs, 2.6M frames, 118k events) are fixture text.

### States
Loaded only.

## Redaction

Two facts about redaction: the detectors run before each body is written, and the archive has no edit path.

### Purpose
A privacy or compliance reader checks that personal data is removed before it is stored, and that nothing written can be changed later.

### Rationale
Redaction detectors run before a body is written, so personal data never enters the archive (§13.5). What is written once stays written. The archive has no edit path, and that is what makes an export verifiable. The panel used to say this in a caption and a note. It explained the design, so it moved here, and the panel keeps the two facts. Crypto-shredding was cut by the scope review, and a GDPR erasure request goes to support against the retention policy and the redaction record (§13.5).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Detectors, archive edit path | fixed facts in `auditRetention()` | the collector's redaction detectors | partial |

### Logic
1. `auditRetention()` prints two facts through `auditFacts()`: Detectors, "run before each body is written", and Archive edit path, "none".
2. The build can list the detectors in effect and the redaction count per period, from the redaction record.

### States
Static in the mock.

## Open an incident {#dialog/incident}

The dialog raises an incident by hand, with a subject, a severity and the records it concerns.

### Purpose
You record something the detectors did not raise, or you raise one from what you found in the record, so it has an owner, a due date and a place in every export.

### Rationale
An incident is a security event with who raised it, why, and what it stopped. The raise toast used to say so. It explained the record, so it moved here, and the toast now says only that the incident is open.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Subject, severity | `#in-title`, `#in-sev` | `tacho.incidents` | live |
| Attached records | three fixed chips | the incident's scope | fixture only |

### Logic
1. **Open an incident** on the Incidents panel, or on an error state, calls `openDialog('incident')`.
2. Severity offers critical ("money moved that oxagen did not govern"), warning and info.
3. Attach shows `con_01K2A9`, `mnd_7K2ETQ4` and `inc_01K5RN2P` as fixed chips. The build lets you pick the connection, mandate, run or incident.
4. **Raise it** calls `incidentRaise()`. It adds an open incident of kind `raised_by_operator`, with you as the detector and no owner, to the top of `INCIDENTS`. It toasts "<id> is open."
5. It writes `incident.opened` to `AUDIT` with the subject, the severity and the new id. Opening an incident is a governed action (`incident.open`).

### States
An empty subject does nothing.

## Incident {#dialog/incidentview}
<!-- open: openDialog('incidentview','inc_01K5RN2P') -->

The full record of one incident: what happened, where it stands or how it was resolved, and who owns it.

### Purpose
You read the detail, see the owner and the due date, take it on yourself, and resolve it.

### Rationale
An incident is a chain of records, not a summary. The dialog shows the detail as the detector wrote it and the scope as ids you can follow. It never rewrites what happened after the fact.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Title, kind, opened, scope, detail | `INCIDENTS` | `tacho.incidents` | live |
| Owner, due, resolution | `INCIDENTS` | `tacho.incidents` | live |

### Logic
1. `incidentDlgTitle()`, `incidentDlgSub()` and `incidentDlgBody()` read the incident named by `S.dlgArg`.
2. The body shows the severity, the state and the scope, then What happened.
3. An open incident shows Where it stands with Owner, Due and Detected by. A resolved one shows Resolution with Closed, Detected by and Runs affected.
4. `incidentDlgFoot()` gives **Close** and **Export incident**. An open incident also gets **Assign to me**, disabled when it is already yours, and the gold **Resolve**, which opens `incidentclose`.
5. **Assign to me** calls `incidentAssign()`. It sets you as owner, writes `incident.assigned` to `AUDIT`, and toasts that the assignment is in the audit record.
6. **Export incident** toasts "Downloading <id> with its frames." and writes nothing in the mock. The build downloads the incident with its frames.

### States
An id that is no longer there shows "No incident selected."

## Resolve an incident {#dialog/incidentclose}
<!-- open: openDialog('incidentclose','inc_01K5RN2P') -->

The dialog closes an incident and records who closed it and when.

### Purpose
You mark an incident accounted for, so it leaves the open count and the critical banner.

### Rationale
Resolving changes nothing about what happened. The detail, the scope and the chain stay as they are, and a resolved incident stays in the list and in every export that covers its date. The dialog and the toast used to say so. That explained the record, so it moved here. A money exception holds the mandate ledger open for its connection while it is open, and resolving it clears that exception (§6.9). That warning stays in the dialog, because it is a consequence you should see before you act.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Incident | `INCIDENTS` | `tacho.incidents` | live |
| Mandate exception | `i.kind`, `i.scope` | the mandate ledger | not built |

### Logic
1. `incidentResolveDlg()` reads the incident and shows its id and severity under the title.
2. The body says that resolving records who closed it and when.
3. For a `mandate.exception` incident, a warning names the connection from the scope and asks you to resolve it only once the money is accounted for. Other incidents get no warning.
4. **Resolve** calls `incidentResolve()`. It sets the status to resolved with a closed time and your name, and toasts "<id> is resolved."
5. It writes `incident.resolved` to `AUDIT` with the id and the title.

### States
An id that is no longer there shows "That incident is no longer here."

## Receipt {#dialog/receipt}
<!-- open: openDialog('receipt','rcp_01K4X8M2E') -->

The full receipt of one tool call, in six groups: Who, What, Authority, Credential, Effect and Integrity.

### Purpose
You answer "who allowed this, under what authority, and what happened" for one call. An auditor, a security lead or a finance reader opens it from a receipt row, an approval or a mandate draw.

### Rationale
§6.10 defines the receipt and its six field groups. The gateway signs it, and the frame hash is its identity. An export carries the same bytes. The footer used to say so in a line beside the buttons. It explained the record, so it moved here.

The tier badge reads the recorded tier through `tierBadge(r.tier)`. The mock used to draw every non-observe receipt as "harness · routed through oxagen", which showed a gateway receipt as harness. A receipt for a harness-reported call exists too. Its Authority group says `observed` where the gateway would have said enforced (§6.10).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Receipt groups | `RECEIPTS[].who`, `what`, `authority`, `credential`, `effectRows`, `integrity` | receipt frames | not built |
| Tier | `r.tier` | the frame's enforcement tier | not built |

### Logic
1. `receiptDlgTitle()` and `receiptDlgSub()` give the receipt id, then the tool, the time and the agent.
2. `receiptDlgBody()` shows the decision badge, the tier badge, the amount when there is one, and chips for the tool and the workspace.
3. It prints the six groups through `auditFacts()`, in order.
4. `receiptDlgFoot()` gives **Close**, **Export receipt** and, when the run exists, the gold **Open the run**, which goes to the run's Decision trace.
5. **Export receipt** toasts "Downloading <id> as signed JSON." and writes nothing in the mock.

### States
An id that is no longer there shows "No receipt selected." A receipt whose run is not in the mock has no **Open the run**.

## Export an evidence bundle {#dialog/newexport}

The dialog builds a signed export: a scope, a date range and a format.

### Purpose
You produce the bundle an auditor asks for, for one workspace, one agent or every financial tool call, over a range you choose.

### Rationale
A bundle holds the archive segments, the attestations, the key ids and the verifier (§13.4). It runs as `export_data`, a governed action with third-party egress. The bundle carries the verifier, so whoever receives it can check it without Oxagen. It is signed when it finishes. The dialog's subtitle, a callout and the queue toast used to say these things. They explained the action, so they moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Scope, from, to, format | `#ex-scope`, `#ex-from`, `#ex-to`, the Format select | the `export_data` request | partial |
| New export | `queueExport()` into `EXPORTS` | archive exports | partial |

### Logic
1. **Export evidence bundle** in the header calls `openDialog('newexport')`.
2. Scope offers `core-platform`, `finops`, financial tool calls across every workspace, and one agent. Format offers a signed bundle, receipts as CSV, and receipts as JSON.
3. **Build bundle** calls `queueExport()`. It adds a Building export with "Signature pending", writes `export.created` to `AUDIT`, goes to Audit › Exports and toasts "Export queued as <id>."
4. The export and the event name the signed-in person (`me()`) as the creator.
5. The mock ignores the Format select.

### States
One state.

## Export events {#dialog/exportevents}

The dialog downloads the last 30 days of control-plane events as CSV.

### Purpose
You take the event list into a spreadsheet or a SIEM.

### Rationale
The CSV holds the same rows the API and MCP return. Nothing in a control-plane event is a prompt or tool body, so this export has no redaction step. The subtitle and the note used to say so, and they moved here. The note keeps the count and the columns.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Event count | `auditRecent()` | `audit.audit_events` | partial |
| Columns | fixed list | `query_audit_log` fields | partial |

### Logic
1. **Export CSV** on the Control-plane events panel calls `openDialog('exportevents')`.
2. The note counts the events of the last 30 days through `auditRecent()`, the same count as the Events tab, and lists the columns: actor, actor kind, action, target, result, severity and event id.
3. **Download CSV** toasts "Downloading events.csv." and writes nothing in the mock.
4. The export ignores the Actor and Range selects. The build carries the filters that are set.

### States
One state.

## Rotate the key-encryption key {#dialog/rotatekek}

The dialog makes a new generation of the organization's key-encryption key and retires the current one.

### Purpose
You rotate the key on a schedule, or after a suspected exposure. It opens from Audit › Keys and from Organization › Data plane › **Rotate keys**.

### Rationale
A rotation adds a generation and rewrites nothing. The retiring generation decrypts until the background re-wrap finishes. Receipts keep citing the signing generation they were signed under, so an old receipt still verifies. The subtitle, a Receipts row and part of the toast used to say this. They explained the mechanism, so they moved here. The dialog keeps the facts of the change.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| New and old generation | fixed text | KMS per organization | not built |
| Rotation | `rotateKek()` into `KEYS` and `AUDIT` | KMS, `key.rotated` event | not built |

### Logic
1. The body lists New generation (`kek_aintel_2026Q4` in the fixture, and its KMS ARN), Takes effect (at once for new bodies, segments and subject keys), Old generation (retiring, decrypts until re-wrap completes), Re-wrap (in the background, about 6 days at current volume) and Recorded as (`key.rotated`).
2. **Rotate** calls `rotateKek()`. It marks the active KEK retiring, adds the new generation as active, writes `key.rotated` to `AUDIT`, goes to Audit › Keys and toasts "Rotated. Generation N is active for new writes. Recorded as key.rotated."
3. `rotateKek()` names the new generation for the quarter after the active one (`kek_aintel_2026Q4`, then `kek_aintel_2027Q1`), so a second rotation never repeats an id. The event names the signed-in person (`me()`). The dialog body still prints `kek_aintel_2026Q4` whatever the active generation.

### States
One state.

## Retention policy {#dialog/retention}

The dialog sets the organization's body retention and frame hot window.

### Purpose
You lengthen body retention for a customer contract or change how long frame rows stay in the hot table.

### Rationale
Shortening the hot window compacts frame rows sooner and saves database cost. It does not touch bodies, and a compacted run reads from the segment byte for byte (§13.2, §13.3). A callout in the dialog used to say so, and it moved here. Nothing in the product shortens retention below the organization's policy, and legal holds were cut by the scope review (§13.4).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Body retention, hot window | two fixed selects | `evidence.retention_policy_versions` | partial |

### Logic
1. **Edit policy** on the Retention panel calls `openDialog('retention')`.
2. Body retention offers 7 years (default), 10 years and indefinite. Frame hot window offers 13 months (default), 6 months and 24 months.
3. **Save policy** writes `retention.policy_changed` to `AUDIT` and toasts "Policy saved. Recorded as retention.policy_changed. It applies to new seals from now." The mock ignores the chosen values, so the Retention panel does not change.
4. The build writes a new policy version, records `retention.policy_changed`, and applies it to seals from that moment. Editing is a governed action (`retention.edit`).

### States
One state.
