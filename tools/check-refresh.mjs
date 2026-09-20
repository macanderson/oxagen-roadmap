// Proves the refresh rules on fixtures, and that roadmap/refresh.json (when present) has the shape
// the app reads. Part of `npm run check`; needs no network.
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import {
  parseRefs, gapIssueRefs, labelsToMeta, appRouteCandidates, pageFor, touchedEvidence, deriveStatus,
  matchAdrToDecision, milestoneRollup, stableStringify, decisionAsked,
} from "./lib/refresh-rules.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let n = 0;
const t = (name, fn) => { fn(); n++; };

t("parseRefs reads closing keywords, refs, ADRs and spec paths", () => {
  const r = parseRefs("Fixes #12, closes https://github.com/o/r/issues/9 and resolves: #9. Refs #4. See ADR-098 and docs/specs/tacho/spec.md.");
  assert.deepEqual(r.closes, [12, 9]);
  assert.deepEqual(r.refs, [4]);
  assert.deepEqual(r.adrs, ["ADR-098"]);
  assert.deepEqual(r.specs, ["docs/specs/tacho/spec.md"]);
  assert.deepEqual(parseRefs(""), { closes: [], refs: [], adrs: [], specs: [] });
});

t("gapIssueRefs collects every #NNN a gap line cites, once", () => {
  assert.deepEqual(gapIssueRefs(["Approve/deny (#2970 app half)", "Steer dialog (#2953)", "Same again #2970", "no ref"]), [2970, 2953]);
});

t("labelsToMeta reads oxagen's label scheme", () => {
  const m = labelsToMeta([{ name: "P1" }, "kind:gap", "pillar:reliability", "needs:decision", "area:app"]);
  assert.equal(m.kind, "gap"); assert.equal(m.priority, "P1"); assert.equal(m.pillar, "reliability");
  assert.equal(m.needs_decision, true); assert.equal(m.triage, false);
});

t("decisionAsked reads the question a needs:decision issue puts to the maintainer", () => {
  assert.equal(
    decisionAsked("## Summary\n\nThis needs a maintainer decision on whether `labeled` should remain a trigger at all."),
    "On whether labeled should remain a trigger at all");
  assert.equal(
    decisionAsked("It is a decision only the maintainer can make: which layer owns the event."),
    "Which layer owns the event");
  assert.match(
    decisionAsked("## Options\n\n1. Do nothing, which is right when the query returns no rows.\n2. Rename the workspace."),
    /^1\. Do nothing/);
});

t("decisionAsked refuses an issue that only wears the label", () => {
  // Triage applies needs:decision to ordinary work, so the label alone is not a question.
  assert.equal(decisionAsked("## Summary\n\nThe workflow starts one run per label. Group them."), null);
  // Reciting the filing rule names nothing that has to be decided.
  assert.equal(decisionAsked("Case 1 is a decision only the maintainer can make. Case 2 needs a rig."), null);
  assert.equal(decisionAsked("This falls under case 3, a decision only the maintainer can make, real spend, or bigger than one session."), null);
  assert.equal(decisionAsked(""), null);
  assert.equal(decisionAsked(null), null);
});

const PAGES = [
  "apps/app/src/app/(auth)/signup/page.tsx", "apps/app/src/app/[org]/[ws]/agents/[agent]/page.tsx",
  "apps/app/src/app/[org]/[ws]/agents/page.tsx", "apps/app/src/app/[org]/[ws]/page.tsx",
  "apps/app/src/app/[org]/[ws]/register/[step]/page.tsx", "apps/app/src/app/[org]/[ws]/runs/[run]/page.tsx",
  "apps/app/src/app/[org]/billing/page.tsx", "apps/app/src/app/[org]/page.tsx",
];
t("appRouteCandidates maps mockup routes onto the app's folders", () => {
  assert.deepEqual(appRouteCandidates("#/welcome/signup"), ["apps/app/src/app/(auth)/signup"]);
  assert.deepEqual(appRouteCandidates("#/a-intel"), ["apps/app/src/app/[org]"]);
  assert.deepEqual(appRouteCandidates("#/a-intel/billing"), ["apps/app/src/app/[org]/{billing}"]);
  assert.deepEqual(appRouteCandidates("#/a-intel/core-platform/agents/triage"), ["apps/app/src/app/[org]/[ws]/{agents}/{triage}"]);
  assert.deepEqual(appRouteCandidates("#/a-intel/core-platform/agents (New agent)"), []);
});
t("pageFor finds the page.tsx that serves a route, and nothing for one that has none", () => {
  assert.equal(pageFor("#/welcome/signup", PAGES), "apps/app/src/app/(auth)/signup/page.tsx");
  assert.equal(pageFor("#/a-intel", PAGES), "apps/app/src/app/[org]/page.tsx");
  assert.equal(pageFor("#/a-intel/core-platform", PAGES), "apps/app/src/app/[org]/[ws]/page.tsx");
  assert.equal(pageFor("#/a-intel/billing", PAGES), "apps/app/src/app/[org]/billing/page.tsx");
  assert.equal(pageFor("#/a-intel/core-platform/agents", PAGES), "apps/app/src/app/[org]/[ws]/agents/page.tsx");
  assert.equal(pageFor("#/a-intel/core-platform/agents/triage", PAGES), "apps/app/src/app/[org]/[ws]/agents/[agent]/page.tsx");
  assert.equal(pageFor("#/a-intel/core-platform/register/wrap", PAGES), "apps/app/src/app/[org]/[ws]/register/[step]/page.tsx");
  assert.equal(pageFor("#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW", PAGES), "apps/app/src/app/[org]/[ws]/runs/[run]/page.tsx");
  assert.equal(pageFor("#/a-intel/finops/agents/invoice-bot/mandates/mnd_7K2ETQ4", PAGES), null);
  assert.equal(pageFor("#/a-intel/core-platform/tools", PAGES), null);
  assert.equal(pageFor("#/a-intel/core-platform/tools (New tool)", PAGES), null);
});

t("touchedEvidence matches files and directories, ignoring the note in parentheses", () => {
  const files = ["apps/app/src/features/fleet/runs-table.tsx", "packages/run-evidence/src/proof.ts", "docs/adr/ADR-100.md"];
  assert.deepEqual(touchedEvidence(files, ["apps/app/src/features/fleet", "packages/run-evidence/src/proof.ts (enums only)", "apps/app/src/features/spend/tiles.tsx"]),
    ["apps/app/src/features/fleet", "packages/run-evidence/src/proof.ts"]);
  assert.deepEqual(touchedEvidence([], ["a/b.ts"]), []);
});

t("deriveStatus moves forward only, and only on proof", () => {
  const L = (...s) => s.map((state, i) => ({ repo: "oxagen", number: i + 1, state }));
  assert.deepEqual(deriveStatus({ status: "not-started", page: "apps/app/src/app/[org]/x/page.tsx", linked: [], gapRefs: [], closedByPr: [] }).built_status, "partial");
  assert.equal(deriveStatus({ status: "not-started", page: null, linked: L("closed"), gapRefs: [], closedByPr: [77] }).built_status, "partial");
  assert.equal(deriveStatus({ status: "not-started", page: null, linked: L("open"), gapRefs: [], closedByPr: [] }).built_status, "not-started");
  assert.equal(deriveStatus({ status: "partial", page: "p", linked: L("closed", "closed"), gapRefs: [{ number: 5, state: "closed" }], closedByPr: [] }).built_status, "built");
  assert.equal(deriveStatus({ status: "partial", page: "p", linked: L("closed", "open"), gapRefs: [{ number: 5, state: "closed" }], closedByPr: [] }).built_status, "partial");
  assert.equal(deriveStatus({ status: "partial", page: "p", linked: L("closed"), gapRefs: [{ number: 5, state: "open" }], closedByPr: [] }).built_status, "partial");
  const rv = deriveStatus({ status: "partial", page: "p", linked: L("closed"), gapRefs: [], closedByPr: [] });
  assert.equal(rv.built_status, "partial"); assert.match(rv.ready_for_review, /a person confirms/);
  assert.equal(deriveStatus({ status: "partial", page: "p", linked: [], gapRefs: [], closedByPr: [] }).built_status, "partial");
  assert.equal(deriveStatus({ status: "partial", page: "p", linked: L("closed", "unknown"), gapRefs: [], closedByPr: [] }).ready_for_review, undefined);
  assert.equal(deriveStatus({ status: "built", page: null, linked: L("open"), gapRefs: [], closedByPr: [] }).built_status, "built");
});

t("matchAdrToDecision settles a decision by its words or its issue", () => {
  const decisions = [
    { id: "D3", title: "Mobile navigation (feedback 3)", question: "What is the one-thumb mobile navigation that stays out of the way?", status: "open" },
    { id: "D7", title: "Witness record shape", question: "Which witness record shape is canonical?", status: "open" },
    { id: "D1", title: "Integration branch or main", status: "decided" },
  ];
  assert.equal(matchAdrToDecision({ title: "The witness record shape is the MC spec's", body: "" }, decisions), "D7");
  assert.equal(matchAdrToDecision({ title: "Billing plans sync by hand", body: "" }, decisions), null);
  assert.equal(matchAdrToDecision({ title: "Something else", body: "Settles #3401." }, [{ id: "D9", title: "x", status: "open", issue: { repo: "oxagen", number: 3401 } }]), "D9");
  assert.equal(matchAdrToDecision({ title: "Integration branch or main", body: "" }, decisions), null, "a decided decision is never re-matched");
});

t("milestoneRollup counts what the row shows", () => {
  const r = milestoneRollup({ id: "M1", surfaces: ["a", "b", "c"] }, { a: "built", b: "partial" }, { a: [{ repo: "oxagen", number: 1, state: "open" }], b: [{ repo: "oxagen", number: 1, state: "open" }, { repo: "oxagen", number: 2, state: "closed" }] },
    { a: [{ repo: "oxagen", number: 9, title: "old", merged_at: "2026-09-10T00:00:00Z" }], b: [{ repo: "oxagen", number: 10, title: "new", merged_at: "2026-09-18T00:00:00Z" }] });
  assert.deepEqual(r, { total: 3, built: 1, partial: 1, not_started: 1, open_issues: 1, merged_prs: 2, last_merge: { repo: "oxagen", number: 10, title: "new", merged_at: "2026-09-18T00:00:00Z" } });
});

t("stableStringify sorts keys so an unchanged record is byte-identical", () => {
  assert.equal(stableStringify({ b: 1, a: [{ d: 1, c: 2 }] }), stableStringify({ a: [{ c: 2, d: 1 }], b: 1 }));
});

t("roadmap/refresh.json, when present, has the shape the app reads", () => {
  const p = resolve(root, "roadmap/refresh.json");
  if (!existsSync(p)) return;
  const R = JSON.parse(readFileSync(p, "utf8"));
  for (const k of ["generated_at", "baseline", "since", "issues", "prs", "items", "decisions", "decisions_added", "milestones"]) assert.ok(k in R, `refresh.json lacks ${k}`);
  const data = JSON.parse(readFileSync(resolve(root, "roadmap/data.json"), "utf8"));
  assert.equal(R.baseline, data.generated_at, "refresh.json was built against a different data.json; run tools/refresh-roadmap.mjs");
  for (const [id, it] of Object.entries(R.items)) {
    assert.ok(Array.isArray(it.links) && Array.isArray(it.merged_prs), `item ${id} is malformed`);
    if (it.built_status) assert.ok(["partial", "built"].includes(it.built_status), `item ${id}: the machine may only move status forward`);
  }
  for (const d of Object.values(R.decisions_added)) assert.ok(["open", "decided"].includes(d.status) && d.id && d.title, "a raised decision is malformed");
  // An open issue card has to state its question, or the Now page fills with work items again.
  for (const d of Object.values(R.decisions_added)) {
    if (d.origin !== "issue" || d.status !== "open") continue;
    assert.notEqual(d.question, d.title, `${d.id} repeats its title instead of asking something`);
    assert.ok(String(d.question || "").length >= 25, `${d.id} has no question`);
  }
  assert.equal(readFileSync(p, "utf8"), stableStringify(R), "refresh.json is not in stable key order; it was hand-edited");
});

console.log(`check-refresh: ${n} checks passed`);
