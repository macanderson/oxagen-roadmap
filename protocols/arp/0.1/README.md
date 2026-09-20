# Agent Run Protocol 0.1 design artifacts

Read the [protocol design](../../../docs/agent-run-protocol.md). This directory is a proposed contract, not an installed integration or a published standard.

- `arp.schema.json`: strict Draft 2020-12 schemas for checkpoints, adapter capabilities, launch requests, compatibility reports, lifecycle receipts, experiments, evaluations, selections, workspace inventories and detached attestations.
- `fixtures/`: a self-contained synthetic checkpoint, two candidate launches (Codex and Claude Code labels), a report, an experiment, content-addressed blobs and a signed successful lifecycle.
- `fixtures/trusted-test-key.json`: a **test-only** public key trusted by the checker. The signing key is not stored. Never import this trust binding into a production verifier.

From the repository root:

```sh
python3 tools/check-arp.py
python3 tools/build-docs.py --check
```

The checker needs Python `jsonschema` and `cryptography`. It validates documents and their relationships, hashes all transitive blob references, checks detached Ed25519 signatures, verifies the synthetic source-prefix hash, and rejects deliberately malformed cases.

The source prefix is intentionally a minimal **hash-rule vector**, not a schema-valid native Tacho export. No real agent was run. The checker is not a production importer, a safe archive extractor, a harness test, or a complete native evidence verifier. The fixture's `ready` report is synthetic and conveys no actual launch authorization.

Sequences use decimal strings. Checkpoint and receipt signatures sign `ARP/0.1\n` followed by the canonical subject digest; the newline is one LF byte. Blob digests cover stored plaintext bytes. The checker covers the integer-only control-document canonicalization profile; native vendor payloads retain their own byte/digest rules.

JSON Schema handles shapes; the design specifies additional semantic and runtime requirements. Examples include exact boundary reconstruction, source fencing, current destination admission, resource limits, trusted issuer/key resolution, fresh compatibility reports, credential rebinding, and crash recovery. Passing these fixtures alone does not earn production ARP conformance.

Evaluation and selection fixtures include a losing candidate and a signed winner record. The checker validates eligibility and the fixture's single-eligible-candidate selection; it is not a general ranking engine. Recorded-tool replay is a subsequent profile. This bundle defines the exchange contracts, not the execution engines.
