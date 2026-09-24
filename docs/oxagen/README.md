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
| `audits/2026-09-19-mission-control-gap-inventory-review.md` | The review that corrected the gap inventory | It feeds the build sessions in `mission-control/BUILD-CHUNKS.md` |
| `verification/` | Two 2026-09-23 baselines of the app against the mockups | Gap baselines, the work remaining |
| `ops/stella-website-aws-deploy-plan.md` | A deploy plan for the Stella website | Proposed and never built |
| `specs/top3-wedge-gap-epics.md` | The top-three wedge gap assessment and its epics | An epic roadmap |
| `specs/google-oauth-clients.md` | The login and data Google OAuth client split | The data client was never wired |
| `specs/analytics/` | PostHog product analytics requirements | A draft for work not started |
| `specs/customer-capabilities/` | Customer-built `.cap` capability packages, spec and plan (ADR-034, Proposed) | Not built |
| `specs/local-supervisor/` | What a confirmed steer and a complete recording require | A draft gap assessment |
| `specs/oxagen-workspace-config/` | The governed `CLAUDE.md` replacement | Only the `workspace.json` link exists. The resolver and interview are deferred |
| `specs/rbac-permissions-plane.md` and its `.fleet.toml` | A unified resource-grant model, and the Stella prompt pack for building it | Not built. oxagen `apps/app/ARCHITECTURE.md` cites it as the durable model for per-key service principals |
| `specs/tacho/plan.md` | The Tacho build plan, with the recorded hook latency figures | 63 of 75 tasks were open. The oxagen tacho bench tests cite its figures |
| `specs/tacho/design/` | Approval tokens, trust scoring, the insurer API, Biscuit tokens (`adr-0003`), the Cedar policy engine (`adr-0004`), and SDK examples | Designs for work not built. The built design (overview, trace model, threat model, `adr-0005`) stays in oxagen |
| `specs/tacho/*.md` | Six Stella seam documents copied from `macanderson/stella` at `0cb26c5e`: the trace drain, session receipts, enterprise authority telemetry, the witness protocol, step grading, and the agent monitor protocol | Seams Oxagen plans to meet. Nothing in them is built in Oxagen |

The two matrices the oxagen v2 contract tests read, `matrix.json` and
`full-matrix.json`, stayed in oxagen as test fixtures at
`packages/oxagen/src/contracts/v2/fixtures/`.
