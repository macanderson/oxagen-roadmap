# Oxagen: complete spec and delivery-plan review

15 September 2026 · Reviewed repository commit `762e495b021e40da65c34d1a891110fb6041f438`

> Historical review: subsequent main-branch changes revise several decisions and rename source documents. Source links below are pinned to the reviewed commit; findings have not been reassessed against those later changes.

## Overall opinion

**The product has a strong foundation, but these documents are not yet one executable release plan.** The strongest idea is the connection between an agent’s authority, its actual actions, their cost, and evidence of the result. Fleet, Run, approvals, agent identity, and basic Spend make that connection understandable.

The largest risk is implementing incompatible definitions of the product in parallel. Mission Control, the reduced wedge, standalone Witness, and DoD disagree about release scope, billing, verification, and the boundary between local observations and independently checked facts. More screens will not resolve those disagreements.

My recommendation is to finish one reliable customer journey: **connect an agent → see a real run → control an authorized action → inspect its receipt and cost → verify a narrowly defined outcome.** Keep GAU billing consistent with the explicit amendment. Start verification with one clearly described assurance level and one workload. Expand only after that journey works with a customer’s own data.

### Readiness assessment

| Area | Assessment |
|---|---|
| Product concept | Strong and differentiated in its combination of control and evidence |
| UI specification | Extensive; useful references, but several screens still encode superseded requirements |
| Release definition | Conflicting; needs consolidation before further work allocation |
| Security and evidence design | Thoughtful primitives; several promises exceed the specified enforcement |
| Backend contracts and lifecycle | Incomplete across integration boundaries |
| Delivery estimate | An app construction estimate, not a credible estimate for all promised features |
| Production readiness | Not established by this repository or this document review |

This is a review of requirements, sample code, mockup definitions, and plans. It is not a fresh production-code audit, live UI inspection, performance test, or security certification. Findings about executable examples refer to the examples in the specifications, not necessarily the current implementation. Build, publishing, and delegation instructions embedded in the documents were treated as review material, not executed.

## 1. Establish one authoritative release definition

The [main specification](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/2026-09-11-oxagen-mission-control-spec.md), [implementation plan](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/2026-09-12-mission-control-app-implementation-plan.md), [scale-back document](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/2026-09-14-scale-back-prompt.md), page specifications, and README do not describe the same release.

| Conflict | Why it matters | Suggested resolution |
|---|---|---|
| README sends canonical edits to `~/Documents/Oxagen/Specs/`; the implementation prompt identifies repository docs as canonical; baseline instructions pin `mc-baseline-w4` | Two implementers can faithfully build different versions | Declare one repository and immutable release manifest; treat other copies as generated publications |
| Main billing amendment uses GAUs; README, Billing, signup, and demo prompts retain run allowances | Customer promises, invoices, and UI cannot agree | Replace superseded text, rather than keeping both models as equally readable requirements |
| Main spec schedules hosted Witness late; earlier review moves it forward; README says its surface does not exist | No shared definition of the first verification release | Decide one verification slice and its prerequisites explicitly |
| DoD signs local check results; Witness independently evaluates traces; Mission Control proves test flips | The same apparent “verified” result can have very different evidence | Use a shared evidence envelope with distinct assurance levels |
| Ontology is removed and M4 retired, but code graph, embeddings, GitHub ingestion, and data-layer analysis remain | Significant work loses its milestone and owner | Give retained code intelligence its own bounded scope and dependency list |
| “Already built” groups mockup features | Design completion can be mistaken for operational readiness | Track designed, contracted, implemented, integrated, verified, and released separately |
| Whole-app audit requires full navigation, including deferred features | A correct wedge can fail its own acceptance suite | Generate route and test inventories from the chosen release manifest |

The manifest should contain a stable feature ID, target release, status, canonical requirement, contract, data source, dependencies, owner, and acceptance gate. Include backend and operational features, not only navigation entries. Counts in appendices and audit prompts should be generated: the tool-count amendment still includes a retired family, and narrative references such as `cost.findings`, `cost.daily_totals`, and `cost.turn_totals` are not consistently reflected in the “definitive” table inventory.

## 2. Feature-by-feature scope and suggestions

“First release” below is my recommendation, not a claim about what is implemented.

| Feature family | Recommended scope | Review and next requirement |
|---|---|---|
| Authentication and account recovery | First release | Cover signup, verification, login, two-factor, reset, invitations, expired/wrong-account links, sessions and logout as complete sequences. Define account recovery, rate limits, and audit redaction. Do not let an agent-onboarding gate block an administrator’s recovery path. |
| Organization, membership, roles, workspaces, API keys | First release, thin | Specify permission checks per operation, invitation acceptance races, last-owner protection, key expiry/rotation and workspace access changes. Show an API secret once; subsequent views show metadata. |
| SSO and SCIM | Customer-triggered later release | Do not advertise these before provisioning, deprovisioning, role mapping and recovery are integrated. |
| Enrollment, registration and repository binding | First release | Resolve the dependency cycle between first frame, principal creation, credentials and definition-PR merge. Model reservation, enrollment, connection, pending definition and active states explicitly. Reconcile required main repo with the 14-day provisional skip. |
| Desktop installer and host lifecycle | First release for explicitly supported platforms | Specify signed distribution, enrollment expiry, rollback, offline spool limits, upgrade/security-patch delivery and uninstall. A 60-second install is a measurable target, not established by the mockup. |
| Fleet | First release | Real recent/live runs, freshness indicator, filters and approvals. Separate idle, disconnected, delayed and failed. A page error must not assert that recording is healthy without independent evidence. |
| Run inspection and basic replay | First release | Paginated frames, source/tier, command acknowledgments, cost basis, receipt inspection, integrity and seal status. Distinguish inspecting a recording from re-executing tools. |
| Fork, bisect and re-execution | Later | Bind artifacts, tool versions and side-effect policy. Never replay an external write merely because its request was recorded. Explain nondeterminism and missing artifacts. |
| Pause, resume, steer, cancel, revoke | First release where adapters support them | Define queued, delivered, applied, rejected, expired and unknown outcomes. “Cancel requested” is not proof an already-dispatched effect stopped. Test each supported harness/version. |
| Mass steering, agent messaging and outbound events | Later | Require recipient-level authorization, delivery reports, deduplication and expiration. Preserve tenant boundaries in notifications and outbound payloads. |
| Agent IAM, toolbelt, source definitions and grants | First release | Keep git as the published definition source, with separately represented enrollment state. Define privilege-change review and recheck live grants at dispatch. Observed tool schemas must not become approved schemas automatically. |
| Tool registry, MCP import, connections and credential broker | First release, bounded connector set | Specify schema/version changes, secret ownership, credential revocation, downscoping limitations and confused-deputy defenses. Describe credential guarantees only for broker-controlled paths. |
| Mandates, approvals, budgets and kill switches | First release for supported actions | Reserve authority before dispatch; settle against the external effect; handle unknown results and retries. Keep deny/revoke and essential governance access usable at exhausted GAU balance. |
| Two-person mandates and policy simulation | Later unless a buyer requires them | Two distinct authorized people; no self-approval. Simulation must identify its historical policy/input snapshot and unknown outcomes. It does not prove live safety. |
| Spend, price book and basic attribution | First release | Separate observed provider spend, estimated normalized spend and Oxagen charges. Preserve unknown usage classes. Trace every total to immutable usage and a versioned price basis. |
| Findings and optimization | Small initial set | Begin with defensible observations and bounded estimates. Identical reads, uncited context and retries are not automatically waste. Show assumptions, confidence and overlapping savings; avoid presenting operator rankings as objective productivity. |
| Reconciliation, multicurrency and localization | Later | Reconciliation needs adjustments, statement ingestion, missing usage and FX policy. Use actual business rounding examples. These are separate integrations, not formatting tasks. |
| Billing, GAU bucket, purchases, top-up and invoices | First release under one model | Implement contracted terms and effective dates, webhook replay protection, consumption ordering, refunds/adjustments, exhaustion episodes, invoice thresholds and past-due policy. Do not expose functioning-looking controls without writes. |
| Steering records, proposals and Steering PRs | Thin release after core journey | Preserve provenance, author/reviewer roles, merge conflict behavior, rejection and rollback. Publish only to future context assembly; never rewrite a historical run. |
| Automatic promotion, retirement and effect metrics | Later | Require evidence of actual usefulness before automatic thresholds. Separate record kind from lifecycle state and version both wire contracts. |
| Skills and W13 interjections | Separate bounded feature | Ship opt-in resolution before broader research/reflection behavior. Define version pinning, visibility, grant checks, expiry and concurrent replies. See section 5. |
| Repository ingestion and code intelligence | Minimum required by first proof workload | Retain exact commit snapshots and source provenance. Do not quietly include all ORM, SQL-dialect, infrastructure and runtime-data analysis in “repo binding.” |
| Dynamic ontology, general connectors and graph exploration | Defer | A strong potential platform expansion, but not necessary to establish the first governed-run journey. Retained graph storage still needs a coherent isolation and operations plan. |
| Witness and proof badges | Early narrow pilot, then expand | One oracle family and a precise claim. Distinguish chain attestation, local checks, independent execution and human acceptance. A test flip proves that test’s behavior, not all requirements. |
| DoD completion gates | Pilot after lifecycle/security fixes | Useful acceptance-check discipline. Present local evidence honestly; fix settlement, hidden-lock, loop-bound and signature issues before treating the sample implementation as a build recipe. |
| Audit events, receipts and signed export | Basic evidence in first release | Durable access-controlled audit and receipt retrieval are core, even if the full Audit page is deferred. Define export authorization, completeness and offline verification. |
| Archive, holds, erasure and key management | Basic retention now; advanced workflows later | Choose an explicit first-release policy. Add holds, selective erasure and restore behavior only with tested key/data lifecycles; hiding the UI does not remove storage obligations. |
| Assistant | Later, or narrowly read-only first | Preserve the same kernel authorization; make proposed writes reviewable; show receipts. Excluding assistant runs from customer Fleet must not remove their audit/accounting trail. Reconcile assistant funding with the no-token-markup rule. |
| Shell, mobile, account dialog, search and notifications | First-release essentials | Keep keyboard support, focus restoration, responsive navigation and deep links. Define search permissions and notification retention. Test theme/system changes, long content and mobile approval review. |
| Dedicated/behind-firewall deployments | Separate enterprise release | Specify provisioning, upgrades, version compatibility, backup/restore, support and outbound dependencies. Air-gapped operation needs an explicit feature matrix. |
| Owned models and training export | Later research/product track | Require tenant consent, export eligibility, rights/provenance, holdout isolation, retention and evaluation gates. Do not treat accumulated runs as automatically eligible training data. |

### Page coverage

The review includes all 31 standalone page specifications, grouped above: `login`, `signup`, `verify-email`, `two-factor`, `forgot-password`, `reset-password`, `accept-invitation`; `onboarding-organization`, `onboarding-wrap`, `onboarding-run`; `register-name`, `register-wrap`, `register-run`, `installer`; `fleet`, `run`, `run-interjection`; `agents`, `agent`, `agent-source`, `mandate`; `tools`, `steering`, `skills`, `skills-off`, `spend`; `organization`, `organization-roles`, `organization-api-keys`, `billing`, `audit`. Shell-only features are included separately. Generated HTML states are design artifacts, not evidence that corresponding backend behavior exists.

## 3. Resolve the three verification designs

Sources: [Mission Control proof](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/2026-09-11-oxagen-mission-control-spec.md#L740), [Witness](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/oxagen-witness-spec.html#L119), [DoD](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/oxagen-dod-spec.html#L120), and [badges](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/badges/README.md).

Keep one evidence/certificate format, but record independent dimensions:

- **Origin:** gateway-observed, harness-reported, or external source.
- **Integrity:** signed and complete, incomplete, or broken chain.
- **Evaluation:** locally reported checks, isolated execution, or human acceptance.
- **Result:** passed/failed/pending/indeterminate under a named, versioned policy.
- **Scope:** exact run attempt, requirement set, tool/artifact versions and base/head commit digests.

A signature proves who attested to a statement. It does not transform client-supplied `ok: true` into independently established correctness. Avoid collapsing these dimensions into one green “proven” badge.

The standalone Witness promise of byte-identical certificates also conflicts with variable fields such as `duration_ms` and issuance metadata. Define a deterministic decision payload separately from an issuance envelope. Compare the former on rerun; verify signatures and issuance provenance separately.

For coding proofs, bind the exact baseline and candidate commits. Define what happens when the target branch advances. A hidden test running alongside malicious candidate code needs a concrete isolation design: filesystem visibility, process permissions, no secrets, egress restrictions, quotas and tamper detection. Using another model to draft a check does not itself establish independence from the implementation’s assumptions.

### Concrete DoD sample-code defects

These should block copying the sample into production unchanged.

| Finding | Evidence | Required correction |
|---|---|---|
| Hidden checks change the locked set | `onStop` appends hidden checks; `settleDod` compares the resulting set digest against the stored lock | Define a committed visible/hidden manifest and verify each component without changing the locked root |
| Settlement and sealing have a circular dependency | Stop calls `api.settle` before returning; settlement requires `sealedAttemptFor` | Specify pending settlement → seal acknowledgment → idempotent certificate issuance, tied to an explicit attempt |
| Stop loops are not always bounded | `stopAttempts` is checked only when a budget check exists; schema allows other check sets; `stop_hook_active` is unused | Enforce a global cap/deadline independent of optional checks; distinguish repairable failures from terminal errors |
| Only the first budget check is enforced | `checks.find(...)` selects one | Permit exactly one budget or validate and enforce all of them |
| Human completion can be asserted by the submitter in the shown handler | `signatures` is an array of check IDs and `decide` trusts membership | Resolve actual authorized signatures server-side, bound to the lock, check, signer and attempt |
| Diff scope omits tracked working-tree edits | `git diff base...HEAD` plus untracked files excludes staged/unstaged tracked changes | Validate the actual artifact snapshot being certified, including working-tree state where allowed |
| Check execution is not a sandbox | `shell: true` and an environment allowlist retain `HOME` and `NODE_OPTIONS` | Define command trust and process/filesystem isolation; terminate process groups and cap output/resources |
| Repeated settlement can mint repeated certificates and charges | Handler allocates a new certificate ID and meters it; no uniqueness boundary is shown | Enforce database uniqueness and idempotency for attempt + lock + evaluation version; reconcile with kernel metering |

Relevant examples: [decision logic](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/oxagen-dod-spec.html#L337), [Stop hook](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/oxagen-dod-spec.html#L428), [diff check](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/oxagen-dod-spec.html#L477), [settlement](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/oxagen-dod-spec.html#L575).

Also resolve the reuse of `ADR-055`, already assigned to GAU billing, and bootstrap the phase gates realistically: early local phases cannot require certificates from a cloud service scheduled for a later phase.

## 4. Security, billing and data correctness

### Workspace writes: the RLS example does not enforce its stated rule

The [sample policy](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/2026-09-11-oxagen-mission-control-spec.md#L274) permits org-wide visibility when workspace scope is absent. Its `WITH CHECK` requires a workspace, but DELETE uses `USING`, not `WITH CHECK`. Therefore an org-scoped DELETE allowed by table privileges can affect workspace rows despite the statement that all writes require workspace scope. This is a defect in the example, not evidence that production has the same policy. [PostgreSQL policy semantics](https://www.postgresql.org/docs/16/sql-createpolicy.html).

Use separate SELECT, INSERT, UPDATE and DELETE policies, with explicit workspace requirements on writes. Test with the actual non-owner application role, missing scope, wrong scope, org scope, and system-role boundaries.

### Pooled graph tenancy contradicts the proposed boundary

[Section 5.3](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/2026-09-11-oxagen-mission-control-spec.md#L293) says the database is the tenant boundary and no org filter is needed, then pools free tenants with workspace scoping. Org-wide reads in that pool need an explicit org boundary. Specify separate pooled and dedicated strategies, including search/vector retrieval and relationships. Test cross-tenant identifiers, not just ordinary filtered lists.

Shared repository nodes also conflict with a single required workspace property. Choose per-workspace projections or explicit shared identities with access-controlled edges. Free-to-paid graph migration needs a verified snapshot, catch-up, cutover and recovery protocol.

### Dispatch needs an operation identity, not only an input hash

The [dispatch pipeline](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/2026-09-11-oxagen-mission-control-spec.md#L443) calls canonical input digest the identity for idempotency. Two intentional identical operations must remain possible. Bind a logical operation ID to the payload digest; retries reuse that ID, new actions receive a new one.

Reserve mandate/budget capacity before dispatch, then settle the actual effect. A timeout after a provider accepted an action is an unknown outcome requiring reconciliation, not permission to release the reservation and repeat it. Recheck revoked grants and expired authority after human approval and immediately before dispatch.

### State the enforcement boundary honestly

A model gateway does not automatically control native shell tools. A local adapter’s report is not gateway observation. Describe enforcement per step/path, with a conservative run summary. Credential-free claims should apply to brokered credentials, not imply an agent cannot reach local secrets. Digest provenance can track exact bytes; the spec does not establish reliable detection of every semantic derivation from untrusted material.

### Separate three kinds of money

The [GAU amendment](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/2026-09-11-oxagen-mission-control-spec.md#L1010) is the clearest current commercial requirement. Make it the sole billing definition unless deliberately superseded.

Maintain separate ledgers/views for customer provider spend, Oxagen GAU charges, and Oxagen’s own service costs. DoD’s lower-tier pending charge and Witness’s funds-release model need explicit reconciliation with that definition; they must not silently add new meters.

Hard spend limits require concurrent reservations and a policy for uncertain streaming cost. Recorder-updated counters alone can overshoot under parallel calls. Keep unknown usage visibly unknown, preserve raw usage, version normalization and rates, and round only at defined settlement boundaries.

### Critical evidence needs a durable commit protocol

Reconcile “receipt durable before result” with telemetry fail-open behavior. Security decisions, dispatch intent, externally observed effect and settlement need durable recovery semantics; optional telemetry can have a different failure policy.

Specify duplicate versus divergent frames, out-of-order producers, late arrival after seal, interrupted multi-store writes, sequence allocation, compaction and offline verification. Key rotation and redaction must not make a formerly valid exported chain unverifiable.

## 5. Onboarding, desktop and W13 integration

The [desktop spec](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/2026-09-13-oxagen-desktop-spec.md) adds a real operational product, not just an installer screen. Define offline queue size/age, disk-full behavior, credential expiry, server rejection and host reassignment. Old tenant frames must retain their original scope and never be relabeled into the new organization. Reassignment needs recoverable intermediate states when old credentials are revoked but new enrollment fails.

Give administrators access to invitations, credentials and troubleshooting before their first agent frame. Report connection and enforcement separately: receiving a frame proves a reporting path works, not that every tool is governed.

[W13](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/w13-in-the-loop-scenario.md) combines several features that should be specified separately:

1. **Skill resolution:** agent grants and workspace binding determine visibility; pin a versioned resolution manifest for reproducibility.
2. **Emergency control:** revocation must override a previously pinned resolution where continued use is unsafe.
3. **Human interjections:** authorize the respondent, expire requests, and use one atomic resolution so two surfaces cannot apply conflicting answers.
4. **Research/reflection:** keep self-evaluation separate from verified outcomes and approved steering. Use a child/service run after sealing instead of appending to a sealed chain.

Do not leak withheld skill names/counts/reasons to unauthorized users. Clarify whether “deny” for unknown repo binding means no optional skills or no repository access; those have very different consequences. Research TTLs must agree with archive, export and training policies.

## 6. Operations and nonfunctional requirements

- **Webhook recovery:** the spec says GitHub redelivery is enabled as a fallback. GitHub does not automatically redeliver failed webhooks. Push-head gap detection also misses a final lost event and non-push events. Add a delivery ledger and reconciliation mechanism. [GitHub’s documentation](https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries).
- **Retention and keys:** define data classes and precedence for retention, holds, erasure and backups. A single subject-key model does not automatically solve bodies containing multiple people. Object Lock does not preserve readability when encryption keys are deleted. Test restoration and key lifecycle together. [AWS documentation](https://docs.aws.amazon.com/us_en/AmazonS3/latest/userguide/object-lock-managing.html).
- **Live streams:** define membership revocation during an open connection, token expiry, cursor scope, duplicate/reordered events, resync, backpressure and bounded client memory. Validate incoming events instead of relying on a TypeScript cast.
- **Performance:** distinguish burst and sustained loads. At 2,000 frames/second, a sustained full day is 172.8 million frames. The small-run storage example does not size that workload. Set realistic load profiles, retention volumes, replay latency and recovery objectives.
- **Economics:** replace margin conclusions based on retired per-run pricing with measured cost per workload under GAU terms. Include graph capacity, object requests, archive retrieval, reconciliation, model-assisted analysis, proof reruns and support.
- **Deployment:** retain feature/version compatibility, backup restore, migration rollback/forward recovery and operational ownership in the plan. Dedicated deployments need their own tested support matrix.

## 7. Replace the delivery schedule with verifiable milestones

The [rough 12-day estimate](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/2026-09-12-mission-control-app-implementation-plan.md#L1091) assumes ten concurrent lanes and largely covers app construction. Its own data mapping identifies substantial absent or partial backend work. It cannot be used as the estimate for the complete product, nor simply combined with the 24-week Mission Control and eight-week Witness schedules.

| Gate | Scope | Acceptance evidence |
|---|---|---|
| 0. Contract and release alignment | One feature manifest, billing definition, evidence model, lifecycle and authority boundary | Conflicts above have decisions; UI/route/contract inventories agree; dependent work has owners |
| 1. First real run | Auth, thin organization, one supported enrollment path, Fleet and Run, durable ingestion | A fresh customer can connect, inspect its own frames, reconnect after interruption and see an honest enforcement tier |
| 2. One governed effect | One brokered tool, grant, approval, reserve/settle, revoke, receipt | Duplicate delivery creates one effect; changed authority blocks dispatch; timeout reconciles; another tenant cannot inspect it |
| 3. Money that reconciles internally | Versioned usage/price basis, basic Spend, GAU bucket, purchase/top-up and invoices | Independently recomputed usage totals; webhook replay and concurrent exhaustion tests; failed payment states agree with policy |
| 4. One defensible proof | One workload, locked acceptance set, explicit local or independent assurance, signed export | Positive and negative controls, tampering and rerun tests; third party verifies exactly the claim displayed |
| 5. Customer pilot and cutover | Recovery, migration, mobile critical paths, support and rollback | Customer completes the full journey on real data; fault recovery is demonstrated; old links/history and paid balances survive cutover |
| 6. Expansion by demand | Rich findings, steering, skills, replay tools, enterprise and broader verification | Each addition has a named buyer/workflow and a measurable acceptance gate |

Parallelize implementation after shared contracts and lifecycle decisions are settled. Allocate explicit integration/review capacity, especially where Run transport, Run UI, controls and proof touch the same boundaries. Backend and UI work should complete a vertical customer journey together, rather than counting fixture-complete pages as progress toward release.

### Minimum acceptance suite

- Real permission and tenancy tests for reads, writes, search, exports and live streams.
- Integration tests for approval races, revocation, duplicate dispatch, unknown effects and settlement.
- Ledger tests for rate changes, retries, partial failures, concurrent limits and billing webhook replay.
- Evidence tests for divergent sequences, interrupted seal, redaction, archive restore, key rotation and offline verification.
- DoD/Witness tests covering missing/forged evidence, hidden-lock consistency, bounded loops, tampering and duplicate certification.
- A small set of end-to-end browser journeys for enrollment, governed action review and billing; component checks for the broader visual state matrix.
- Keyboard and mobile checks for the actions where a user grants authority or spends money.

The repository’s generated-file, scenario and baseline guards are useful design checks. They do not establish these backend guarantees. Retain them, but scope their expected navigation to the chosen release.

## 8. Suggestions for the product decision

I agree with the [earlier strategic review](https://github.com/macanderson/tmp-oxagen-mockups/blob/762e495b021e40da65c34d1a891110fb6041f438/docs/oxagen-mission-control-review.html) that sequencing matters and that broad ontology work should not delay the first useful workflow. I would not adopt its pricing change, schedule compression, competitive claims, or “already built” label without separate evidence. Its customer and revenue assertions are inputs to validate, not facts established by this repo.

Use the next customer review to establish three things: which pain they are paying to remove, which action they need governed, and who actually consumes the resulting proof. That determines whether Spend, control, or verification leads the demonstration.

Measure activation with a real governed action and inspectable evidence, not merely the first frame. Measure ongoing value with intervention success, investigation time, attributable savings and proof acceptance. Avoid committing to a percentage-complete number until the release denominator is fixed.

**My call: preserve the broad vision, narrow the first delivery contract, and finish the integrated loop.** There is enough design here to guide substantial implementation. The next investment should be in consistent contracts and demonstrated behavior, not another layer of mockup breadth.

## Review sources and limits

Reviewed the main Mission Control specification and appendices; app implementation plan; scale-back prompt; desktop specification; Witness and DoD specifications and code examples; W13 scenario; prior strategic review; README and baseline guidance; all 31 page specifications; shared audit requirements; demo-flow prompts; and badge semantics. HTML/Markdown publications and generated page states were treated as representations of the same design, not separate implemented features. Source links above identify the most consequential findings.

External verification was limited to specific PostgreSQL policy, GitHub delivery and AWS Object Lock semantics. Vendor pricing, model availability, platform capacity limits, business claims and all generated visual states were not independently revalidated. No application files or source specifications were changed as part of this review.
