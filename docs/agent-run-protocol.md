# Agent Run Protocol (ARP)

| | |
|---|---|
| **Status** | Design draft 0.1.0; schemas and synthetic conformance fixtures, not a deployed runtime |
| **Date** | 2026-09-19 |
| **Code baseline** | `macanderson/oxagen` at `f86fbb191881d61444ad63cbecc07a7ece02cb96`; existing source inspected read-only |
| **Replaces** | Agent Execution Frame Protocol working draft |
| **Artifacts** | [Schema](../protocols/arp/0.1/arp.schema.json), [fixture bundle](../protocols/arp/0.1/fixtures/checkpoint.json), [validation guide](../protocols/arp/0.1/README.md) |

## 1. Purpose and boundary

ARP makes a unit of agent work portable: select a recorded frame, restore the work at that boundary, and start a linked run on another harness. Several independent branches can start from that same checkpoint for best-of-N selection.

The portable unit is **task + context + workspace + environment + effects + authority requirements + evidence**. Model hidden state, private reasoning, live process memory and an assurance of identical future output are outside the contract. A prompt export is useful but does not satisfy ARP's checkpoint profile.

Oxagen remains the governor and evidence recorder. A customer-controlled runner captures state, prepares environments and launches native harnesses. ARP describes their exchange. It does not replace MCP tool invocation, Context Graph Protocol records, the capability kernel or harness-native session formats.

In this document MUST, SHOULD and MAY express requirements of the proposed protocol, not claims about deployed Oxagen. The initial profile is `code-workspace/0.1`, at completed-turn boundaries. Other workloads can define additional profiles without teaching the core about browsers or databases.

## 2. What we reuse, and what we must add

The implementation differs from some September 18 roadmap text. These concrete source contracts take precedence for migration design:

| Existing contract | What ARP preserves | Missing work |
|---|---|---|
| `packages/tacho/src/envelope.ts`, `chain.ts` | `tacho/1.0`, session UUID, dense sequence from **0**, `sdk/ambient/proxy` fidelity; hash is SHA-256 of JCS(event excluding `hash`), with `prev_hash` already inside the event | Execution-state snapshots and transfer admission |
| `packages/run-ledger/src/run-store.ts`, `event-payload-registry.ts` | Immutable attempts, dense attempt sequence from **1**, separate run-global sequence, original digest algorithm, terminal seal and append fencing | Checkpoint references and external child bindings |
| `packages/run-ledger/src/run-frames.ts` | Common read projection over Tacho and ledger, including decimal sequence and source digest | Verified portable references, not a replacement hash over the UI projection |
| `run-spec-v2.ts` | Trusted server-built identity and authority; exported material cannot mint these | Destination admission from current trusted policy |
| `packages/handlers/src/run.fork.ts` | Existing cassette-fork semantics and guards | Wrapped sessions are refused today; handler mints a ledger attempt but launches no harness |
| Tacho WAL, `cli/export.ts`, frame-body stores | Native evidence export and retained bytes | A restorable package is more than NDJSON evidence |
| `collector/git-facts.ts` | Observed worktree changes | Change summaries/line counts are not file snapshots |
| ADR-100 and frame-body helpers | Capture by default, producer-side redaction, 1 MiB frame-body cap, pinned retention policy, missing-body evidence | Large workspace blobs need a separate bounded transfer path |
| ADR-043, ADR-096, ADR-101 | Governance/runtime split, permitted containment launcher, four first-class harnesses | Adapter conformance for Codex, Claude Code, Cursor and Stella |

ARP MUST NOT insert unrecognized kinds into strict Tacho or ledger parsers, rewrite historical chains, renumber native sequences, or advertise `oxagen.frame/1.0` as the implemented universal wire format. ARP lifecycle receipts form linked control-plane evidence about transfers. They do not replace native or CGP host journals. Native incorporation requires a versioned migration.

### CGP foundation

This design reuses [Context Graph Protocol at `6630d631`](https://github.com/macanderson/context-graph-protocol/tree/6630d631471f001371a9c5281012e04854786d11). CGP already defines the context contract ARP needs. ARP context MUST use existing `ContextFrame` objects and `FrameId` identities, with CGP's representation and resolution semantics. It MUST NOT define a competing context frame envelope.

- **Representations:** `full` carries canonical inline content. `compact` carries transformed inline content plus its transform and resolver reference. `reference` omits inline content and supplies a resolver reference. Resolve required content before composing it into a destination prompt.
- **Identity and provenance:** preserve provider identity, frame identity, provenance, and `content_digest`. The digest identifies inline content and is part of `FrameId`. `canonical_content_hash` identifies the complete source content for compact and reference representations. Do not substitute one hash for the other.
- **Fidelity and cost:** preserve `content_fidelity`, minimum fidelity and inline requirements, `token_cost`, and any declared `canonical_token_cost` and `tokenizer_ref`. Representation is not a claim that the transferred context contains the source's complete history.
- **Time:** preserve `valid_from`, `valid_to`, and `recorded_at`, and record any retrieval `as_of` constraint. A historical retrieval time does not reconstruct workspace files or establish present authority.
- **Trust:** frame content MUST remain untrusted data, delimited as quoted material rather than promoted into governing instructions. Provenance and a signature do not grant instruction authority.

The existing [`contextgraph-trace` journal](https://github.com/macanderson/context-graph-protocol/tree/6630d631471f001371a9c5281012e04854786d11/contextgraph-trace) covers prompt assemblies, tool pairing, side effects, crashes, and resumes. Tacho's `trace/types.ts`, `trace/project.ts`, and `trace/oracles.ts` already port this vocabulary and its replay checks. Reuse those checks and report missing evidence as skipped checks. This journal remains a sketch outside core `contextgraph/1.0`. Adapters MUST pin its explicit `TRACE_FORMAT`, currently `contextgraph-trace/0.1-sketch`, rather than infer wire compatibility from a package version.

ARP adds restorable snapshots, exact source record boundaries, destination admission and launch, and experiment contracts around those existing pieces. The checkpoint schema's opaque `context` blob reference stays unchanged. Its referenced content follows CGP rather than a new ARP context-item format. The first code slice emits a full CGP `episode` frame for the operator's supplied summary. Full means the complete supplied summary, not equivalence to native conversation history.

## 3. Objects and identities

The schema defines these document types. Identifiers are issuer-scoped opaque strings. Their spelling grants no authority. Digests identify immutable content; IDs identify objects in an issuer's namespace.

| Document | Function |
|---|---|
| `arp.checkpoint/0.1` | Immutable restorable work manifest, anchored after one source event |
| `arp.capabilities/0.1` | Adapter version/build and supported profiles, operations, boundaries and tool modes |
| `arp.report/0.1` | Target-specific compatibility, gaps and transformations, scoped to one launch request |
| `arp.launch/0.1` | Idempotent request to create one candidate from a checkpoint |
| `arp.receipt/0.1` | Hash-linked, signed lifecycle evidence for that launch |
| `arp.experiment/0.1` | Pinned candidate roster, budgets, evaluation and winner-selection contract |
| `arp.evaluation/0.1` | Candidate artifact, evaluator identity, required-check verdicts and metrics |
| `arp.selection/0.1` | All evaluation references, selection-rule digest and winner/tie/no-winner outcome |

`FrameRef` contains source format, issuer, stream ID, source sequence, native digest and optional ledger run sequence/run ID/attempt ID. Tacho references require session identity; ledger references require attempt and run identity. The source-native sequence is a decimal string, avoiding bigint rounding. `position: after` is the only boundary interpretation in v0.1.

An ARP child has a fresh `child_id`; it references the source checkpoint and boundary. The authenticated adapter binds it to a native session and evidence stream. `oxagen-ledger/v2` is an ARP source-verifier profile name, not a renamed native envelope. A Tacho `tse_…` session is not converted into a fabricated ledger attempt. For a ledger source, an attempt may be added to the same run only when trusted admission says its immutable RunSpec remains applicable. A changed agent identity, tenant or authority context requires a newly admitted run with an explicit parent link. The ARP lineage works in either case.

Fork is the default: parent and child can continue independently in isolated environments. A handoff requests exclusive transfer. It requires a runner-enforced source fence and monotonic fencing token before the child is released. If the source cannot be fenced, the adapter MUST refuse handoff; a user may explicitly request a fork instead. Imported authority never creates a fence.

## 4. Checkpoint and workspace profile

A checkpoint names:

- The exact source boundary and evidence prefix, producer identity, capture time and quiescence evidence.
- The task request and amendments, criteria and remaining work as a task document.
- Ordered CGP context frames or FrameIds with resolvable content, preserving provenance, representations, fidelity, and declared omissions. Available instruction/skill versions and supplied tool results remain historical data.
- A complete workspace inventory for the captured scope, repository/base-object metadata, file content, executable modes, directories and internal symlinks. The inventory declares exclusions and material external dependencies.
- An environment recipe with platform/runtime requirements, dependency locks and declared setup effects.
- Logical tool requirements with schema digests, expected effects and destination-binding requirements.
- Settled historical effects and receipts; unresolved operations and resources that prevent restoration.
- Source policy and retention references, requested destination constraints and secret-binding names, never reusable credentials.

These documents are content-addressed blobs; the schema validates the manifest and the workspace subdocument. Context uses CGP's existing schema and negotiated version. ARP's task, environment, tools, and authority document semantics are profile-versioned. Vendor-specific payloads remain available without inventing a replacement prompt or journal schema.

The workspace inventory is authoritative for included paths: deletions are represented by absence from a complete captured scope. Capture MUST include relevant ignored/untracked files or declare them excluded with an impact. A Git commit plus patch is only an encoding optimization if it reproduces the verified inventory, including binaries, LFS objects and submodules. Staged state, Git metadata and extra mounts require explicit resource descriptors when material to the task. v0.1 blocks unresolved merge/index state rather than pretending it captured it.

Restoration uses a fresh directory. Reject absolute paths, `..`, backslashes, NUL, duplicate paths, path-prefix collisions, unsupported modes and target filesystem name collisions. No file writes may traverse a symlink. Symlink targets are root-relative inventory identifiers in this profile; the restorer translates them to filesystem links. Internal symlinks are installed after ordinary entries and must resolve within the restored scope. Chained or cyclic symlinks require another profile and are refused in v0.1. Reject archive devices, hardlinks and implicit execution. Environment setup is executable work governed separately by current runner policy; loading a package does not authorize its scripts.

## 5. Exact-frame semantics and capture barrier

A frame's integrity checkpoint is not an execution snapshot. An execution checkpoint is eligible only when its files, task context and effects all correspond to the selected event.

For `code-workspace/0.1`, capture MUST establish a completed turn, settled tool dispatch, no active child work and no unaccounted workspace writers. The runner fences new dispatch, waits for known calls to settle, obtains a consistent snapshot, writes and verifies all blobs, and commits the signed manifest last. Capture failure produces no ready checkpoint. A cooperating host may attest quiescence, but that is labelled `client_attested`; enforced isolation is a separate claim.

An older frame is eligible only if its snapshot already exists or verified state deltas reconstruct it. The adapter MUST NOT combine old conversation with current files. An unavailable frame returns `boundary_unavailable` and exact alternative references; it never silently picks the nearest frame. Files created after the boundary and future context must not leak into the child.

Interrupted requests with unknown external outcomes block a ready checkpoint. A successful local file snapshot cannot roll back a remote service. Browsers, databases, queues and long-running processes need profile-specific resource adapters; required resources without one return `resource_unsupported`.

## 6. Context and authority transfer

The context document MUST reuse CGP `ContextFrame` objects or `FrameId` references and preserve their provenance, content identity, representation, fidelity, cost, and temporal fields. Resolve references through CGP before use and verify the relevant content hashes. Transfer metadata MUST distinguish historical user requests, source governing instructions, assistant assertions, and tool/retrieved content without granting any of them destination authority. Summaries name their covered source range and summarizer when known, and disclose unavailable provenance. Assistant-generated notes are evidence-backed claims, not an authority source. Unavailable hidden instructions are disclosed as unavailable; ARP does not request or reconstruct private reasoning.

The destination builds its normal instruction stack. An adapter composes CGP content as delimited, untrusted data through supported inputs and records a `delivered_context` digest, FrameId-to-target mapping, and omissions. It does not forge native history or turn imported content into a developer/system instruction. Context capacity, unsupported attachments, compaction, and unavailable steering are reported before start. Required material cannot be dropped; optional loss must be permitted by the launch's gap policy.

`authority` expresses requested constraints, policy provenance and secret slot names. All are untrusted inputs until destination admission resolves them through current identity, policy and credential bindings. The effective authority is bounded by the task's requested ceiling and current destination grants. A report MUST block when the runner cannot enforce a required restriction; prompt text is not enforcement. Historical approvals are receipts, not portable bearer tokens. Reevaluate revocation, expiry, remaining budget and consequential-action approval at dispatch.

ADR-100 supersedes the first draft's blanket local-only body assumption: redacted bodies may be retained and transferred where current workspace policy permits. `digest_only`, redaction, caps or expiration can make a checkpoint unavailable. ARP MUST NOT bypass them using a second snapshot channel. Snapshot content requires its own approved retention/data-class policy; a denied necessary file blocks portability. Encryption keys and blob access credentials remain outside the package. Tenant remapping requires an authorized import; copied principal IDs confer nothing.

## 7. Compatibility is a report, not a replay grade

Keep Oxagen's recorded `inspect → view → fork → retry` grades immutable. ARP reports a different fact: can this runner restore this checkpoint for this target now?

The report pins checkpoint digest, launch-request digest, target adapter/build digest, negotiated capabilities, current policy digest, expiration and findings. `ready` means all declared mandatory profile requirements pass, not identical model behavior. `degraded` means only optional gaps exist and each is explicitly permitted. `blocked` means a required gap, unresolved outcome or verification failure exists.

Compatibility dimensions are workspace, environment, context, tools, effects, authority and evidence. Each finding has a stable code, dimension, required flag and source reference where available. Common codes include `boundary_unavailable`, `body_missing`, `resource_unsupported`, `context_capacity`, `tool_unmapped`, `authority_unenforceable`, `effect_unknown`, `integrity_mismatch`, `profile_unsupported` and `source_unfenced`.

A capability declaration is an adapter's claim, not proof that a restore succeeded. Prepare and start revalidate the report's digests, expiration, policy and environment. Changes invalidate the prepared handle. Undeclared mandatory differences cannot be accepted as an optional gap.

## 8. Operations, retries and lifecycle

These are abstract protocol operations, usable over local IPC or authenticated HTTPS. Oxagen-facing names follow the existing verb-first convention; no new endpoint is claimed as shipped.

| Operation | Input → output | Ownership |
|---|---|---|
| `get_run_capabilities` | Target → capabilities | Adapter |
| `capture_run_checkpoint` | Exact source FrameRef → checkpoint | Source runner |
| `validate_run_checkpoint` | Launch → compatibility report | Destination adapter |
| `prepare_run_transfer` | Launch + report → prepared receipt | Destination runner |
| `start_run_transfer` | Launch + prepared receipt → started receipt | Destination runner |
| `get_run_transfer` | Launch ID + receipt cursor → receipts | Runner/evidence service |
| `cancel_run_transfer` | Launch ID + reason → acknowledged request, then terminal receipt | Runner |
| `record_run_evaluation` | Experiment + candidate artifact digests + evaluator evidence → evaluation record | Independent evaluator |

The runner state machine is `requested → validating → preparing → prepared → starting → running → completed | failed | cancelled`. Validation may terminate as `blocked`. A crash after possible dispatch enters `reconciling`; it is not a retryable launch failure. A lifecycle receipt records the transition and its prior receipt digest. Receipt sequences are dense decimal strings starting at `0`; only the first receipt has a null prior digest. Terminal states admit no further transitions. This control-plane receipt chain has one authorized writer per launch. It references native or CGP host evidence rather than replacing that journal. Writer handover requires a fenced ownership transfer, outside v0.1.

Idempotency is scoped by issuer/tenant and `launch_id`, with the digest of the request. Same key/same digest returns the existing state; same key/different digest is `idempotency_conflict`. Admission reserves the ID durably before restoring or starting. A stable launch marker must let the runner discover an already-started native session after a crash. If an adapter cannot disambiguate a process start, it leaves the operation in reconciliation for operator resolution, never blindly launches again.

Cancellation acknowledgement is not proof of termination. `cancelled` requires observed process termination/fencing and reconciliation of outstanding effects. Terminal receipts include artifact refs, effect outcomes, native evidence references and cost provenance when available. Missing usage is `unknown`, never zero. Retries, failed candidates and evaluation overhead remain charged and visible.

## 9. Tool modes and effects

Every launch declares `live` or `recorded`. Historical effects are never dispatched simply because their receipts are imported. Tool identity includes semantic capability and schema version; matching display names is insufficient. Argument rewrites and result transformations appear in the compatibility report.

In recorded mode, match tool identity/schema, canonical arguments and occurrence/causal position. Results come only from the frozen cassette, explicitly labelled recorded. Missing entries return `cassette_miss`; no automatic live fallback. Recorded file writes require matching verified file deltas. Code-workspace v0.1 advertises live mode only; cassette execution is a separately negotiated capability and not implemented by this design artifact.

In live mode, read freshness and external state can differ from the source. A best-of-N experiment must clone or freeze relevant external services, or record the drift as a comparison limitation. Unknown historical outcomes require lookup/reconciliation. Exactly-once behavior is possible only where provider idempotency or transaction semantics support it; ARP supplies causal IDs and receipts, not a universal exactly-once guarantee.

## 10. Best-of-N and promotion

An experiment pins one checkpoint digest, a fixed roster of launch documents, evaluator artifact/version, selection rule, per-candidate limits, aggregate limits and deadline. Launches bind the experiment ID. All candidates must use that checkpoint, the declared task, evaluation and permitted transformation policy. Each gets its own session, writable workspace and external namespace. Worktrees alone do not establish process or service isolation.

Prefer equal dollar/time envelopes rather than pretending vendor token counts and sampling parameters are equivalent. Record the concrete model/configuration, harness and adapter versions; this compares whole systems, not the causal contribution of the model alone. Shared-prefix capture cost is charged once; candidate, setup, verification and judging costs are accounted separately. Aggregate budget admission reserves capacity before candidates launch; providers that cannot enforce the cap are disclosed and may fail an experiment's required constraints.

The default selection rule is: exclude invalid/incomplete/failed-required-check candidates; compare eligible artifacts by the declared quality metric; apply declared cost/latency tie-breaks; permit ties or no winner. Evaluation occurs in a separate trusted environment using immutable artifact digests. Workers cannot edit the evaluator or read protected witnesses. Preserve Oxagen's witness disclosure and tamper-exclusion rules. Evaluation infrastructure errors are distinct from worker failures.

Evaluation results MUST bind experiment, launch, final artifact, evaluator, verdict and score/cost evidence. Metrics are signed decimal integer strings; the evaluator declares their units, ranges and direction. Selection produces an immutable record referencing one final evaluation per rostered candidate and the declared rule, including non-winners. A retry of evaluation supersedes a prior evaluation explicitly in its evidence, without deleting it. Winner requires one selected eligible launch; tie requires two or more; no-winner requires none. A selection record never authorizes promotion. The schema includes evaluation and selection documents; the evaluator and ranking engine remain external implementations.

Promotion is a separate governed action through the existing kernel/finalization path. It rechecks the destination base, authority and tests. No candidate can spend shared production authority merely by winning. A managed tournament scheduler would expand ADR-043's scope and needs its own architecture decision; customer-owned orchestration can consume ARP first.

## 11. Wire encoding, integrity and bundle transport

The schema uses strict objects and named `extensions`; unknown required extensions or schema/profile versions are rejected. Every required extension must also have a value in the extensions map. There is no silent key stripping or default insertion before hashing. Optional extension data is retained byte-for-byte at the blob level and semantically intact in canonical documents. Exact `0.1` schemas are negotiated; a field addition requires a new minor schema URI and advertised support. No wildcard compatibility is assumed.

ARP control documents use RFC-8785/JCS with a restricted number profile: JSON integers only, within ±(2^53−1). Sequences and money quantities use canonical decimal strings. Duplicate keys, non-finite numbers, negative zero and lone UTF-16 surrogates are invalid. Do not normalize Unicode. Floating-point vendor payloads can remain opaque blob bytes. This agrees with Oxagen's conservative control-document hashing domain without changing existing native digests.

Every document digest is `sha256:` plus lowercase hex over canonical UTF-8 bytes of the **entire document**. Documents carry no self-digest. Blob digests cover their exact stored plaintext bytes after approved redaction; ciphertext is an independent transport encoding. Native evidence is preserved as original bytes and verified by its source-format algorithm, never by rehashing a display projection.

Detached attestations use Ed25519 over UTF-8 bytes of `ARP/0.1\n` followed by the subject digest. They contain subject digest, key ID, algorithm and base64 signature. Trust is established by configured issuer/key bindings and key-validity/revocation policy, never by a key bundled by an unknown sender. Producer signatures attest capture claims; an Oxagen countersignature attests receipt/verification scope, not the truth of client-attested behavior. A signed source-prefix anchor is needed to prove boundary provenance; a checkpoint signature alone cannot establish native event completeness.

The directory transport is:

```text
checkpoint.json
checkpoint.attestation.json
blobs/sha256/<64 lowercase hex>
```

Manifest blob refs include byte count, media type and digest. Consumers resolve digests through an authorized content store or the bundle path; manifests cannot nominate arbitrary fetch URLs. Before execution, verify signatures/trust, document schemas, blob byte counts/digests, transitive closure, source prefix and semantic constraints. Bound depth, file count, expanded bytes and context size before extraction; advertised limits cannot be exceeded by nesting. Retention deletion leaves a verifiable manifest with unavailable content, which is no longer restorable.

Offline bundles and local IPC come first. Authenticated remote blob transport is an implementation choice; ARP requires authorization on every lookup and must not create a cross-tenant content-existence oracle. Resume large transfers by digest; write blobs atomically and publish the manifest last.

## 12. Oxagen integration and delivery

Keep implementation responsibilities at the existing seams:

1. **Shared contracts:** add a leaf ARP schema/profile package, canonical vectors and typed errors; reuse existing canonicalization utilities only after cross-implementation vectors pass.
2. **Tacho:** source FrameRef/export adapter, capture barriers and snapshot integration alongside the WAL. Preserve original `tacho/1.0` chains and fidelity. All four ADR-101 harnesses report supported/unsupported capabilities explicitly; product completion requires the four-harness matrix, even if Codex ↔ Claude is the first vertical slice.
3. **Run ledger/evidence:** immutable checkpoint descriptors and lineage bindings through the sole writers. Do not resurrect engine-state leases removed by ADR-043. Imported files remain runner-owned; the ledger stores evidence and authorized blob references.
4. **Kernel/API/MCP:** register the proposed governed capabilities with existing IAM, tenant scope, role checks, entitlement and metering patterns. Source read authority and destination launch authority are separate.
5. **Runner adapters:** restore and start native sessions, record delivered-context digests, enforce isolation and reconcile launches. Native resume stays optional; portable import uses supported inputs in a fresh session.
6. **Mission Control:** frame eligibility, “Run in…” target/report, parent/child lineage, comparison and promotion views. Display the exact selected boundary and omissions. A replay-grade badge is never a portability badge.

### First acceptance milestone

Capture an unfinished coding task with an uncommitted edit and untracked binary after a completed Codex turn. Restore it in an isolated Claude Code workspace, preserve the source, complete the task, and verify lineage, delivered context and final artifact. Repeat in reverse. Demonstrate unavailable historical-frame refusal and crash recovery without a duplicate launch.

Then prove two candidates on each harness from the same checkpoint, independent writable resources, one pinned evaluator, visible unsuccessful candidates, correct total cost and a separate promotion step. Extend the same conformance matrix to Cursor and Stella before claiming general four-harness support.

### Required conformance layers

The included checker validates schemas, byte closure, fixture signatures, source-prefix hashing, workspace relationships and deliberate corruptions. Synthetic data is labelled and its public key is trusted only by the fixture checker. It does not demonstrate actual harness interoperability, process fencing, policy enforcement or complete RFC-8785 compliance for arbitrary payloads.

Production adapters additionally need: historical snapshot consistency; context role preservation; safe extraction across target filesystems; policy revocation between prepare/start; concurrent launch-id races; uncertain dispatch reconciliation; cancellation with pending effects; credential rebinding; cassette misses; external namespace isolation; witness secrecy; budget accounting; native version skew and bidirectional harness tests. These are implementation gates, not checks this documentation run has performed.

## 13. Design decisions made here

- **Preserve native evidence, standardize the portable package.** This avoids a rewrite of two mature chain formats.
- **Reuse CGP frames and the existing host journal.** ARP adds transfer and experiment contracts rather than duplicating context identity, representations, fidelity, or host activity records.
- **Separate run identity, native session binding and authority.** Imported IDs provide provenance, not admission.
- **Make the checkpoint immutable and compatibility target-specific.** A source artifact does not change when a target gains support or policy changes.
- **Require a consistent boundary and declare losses.** Historical frames without state remain inspectable but not executable.
- **Use external runners first.** This fits Oxagen's governance boundary while enabling customer-owned cross-harness best-of-N.

These are proposed architecture decisions in the roadmap repository. They do not amend the accepted Oxagen ADR corpus or mark runtime features shipped.
