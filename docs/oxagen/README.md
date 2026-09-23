# Material moved from the oxagen monorepo

The oxagen monorepo's `docs/` held roadmap and planning material next to its
reference documentation. On 2026-09-23 that material moved here (oxagen issue
[#3895](https://github.com/macanderson/oxagen/issues/3895)). Each file keeps
the path it had under `docs/` in oxagen, so `docs/specs/mission-control/plan.md`
there is `docs/oxagen/specs/mission-control/plan.md` here. The oxagen monorepo
cites these files as `oxagen-roadmap:docs/oxagen/<path>`.

Relative links that pointed at files still in the monorepo were rewritten to
absolute `https://github.com/macanderson/oxagen/blob/main/...` URLs. Links
between moved files are unchanged and still resolve.

These files are records at their date. They are not on the documents page, and
the canonical spec and plan are `docs/mission-control-spec.md` and
`docs/implementation-plan.md`.

## What moved

| Path | What it is | Why it moved |
|---|---|---|
| `mission-control/` | The rev1 build plan (`PLAN.md`), the six-session build (`BUILD-CHUNKS.md`), the gap inventory, the tool matrix, the traceability matrix, and their JSON outputs | Build planning and gap tracking. The `/mc-*` commands in oxagen read `BUILD-CHUNKS.md` from here |
| `mission-control/scripts/` | The generators that joined the spec's Appendix E and F against the live contracts and routes (from oxagen `tools/scripts/mission-control/`) | They produce the matrices above from the spec, which lives here |
| `specs/mission-control/` | The monorepo's carried copy of the spec and plan, with their HTML renders | A second copy of `docs/mission-control-spec.md` and `docs/implementation-plan.md` that had diverged from them. It alone carries ADR-090 and the de-registered rule of §2.2, which still need reconciling into the canonical spec |

The two matrices the oxagen v2 contract tests read, `matrix.json` and
`full-matrix.json`, stayed in oxagen as test fixtures at
`packages/oxagen/src/contracts/v2/fixtures/`.
