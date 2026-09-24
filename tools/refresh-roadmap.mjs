// Refreshes roadmap/refresh.json, the machine-owned layer of the roadmap, from GitHub.
//
//   node tools/refresh-roadmap.mjs            read what changed since the last run, write the file
//   node tools/refresh-roadmap.mjs --full     forget the watermarks and read everything again
//   node tools/refresh-roadmap.mjs --dry-run  compute and print the summary, write nothing
//
// roadmap/data.json is written by people (the page-by-page comparison in the README) and this
// file never touches it. refresh.json sits on top of it in the app, under the shared store's
// human overrides, and carries only what a machine can prove:
//
//   issues      every issue and pull request touched since the watermark, with its state, labels
//               and the issues it closes; the app uses it to show closed links as closed and to
//               keep the snapshot's open count honest.
//   prs         merged pull requests in the code repos with the files they touched, so an item
//               can list the merges that moved it.
//   items       per surface, witness and DoD feature: the merged PRs on its evidence, its linked
//               issues' state, whether the page for its route exists, and the status the rules
//               in tools/lib/refresh-rules.mjs derive from that. Status only moves forward here.
//   decisions   open decisions an ADR or a closed issue settled, keyed by decision id.
//   decisions_added
//               decisions the repos raised on their own: every ADR merged since the roadmap was
//               written (decided), and every open `needs:decision` issue (open).
//   milestones  the counts each milestone row shows and its last merge.
//
// Delta only: the watermarks in `since` and `heads` mean a quiet quarter hour costs three list
// calls and one commit lookup. GITHUB_TOKEN raises the rate limit; the repos are public, so it is
// optional. ROADMAP_STORE_URL (default: the hosted store) is read so links people added in the
// app count too.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseRefs, gapIssueRefs, labelsToMeta, pageFor, touchedEvidence, deriveStatus,
  matchAdrToDecision, milestoneRollup, stableStringify, decisionAsked, keptOnFirstRun,
} from "./lib/refresh-rules.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const FULL = args.includes("--full"), DRY = args.includes("--dry-run");

const data = JSON.parse(readFileSync(resolve(root, "roadmap/data.json"), "utf8"));
const OUT = resolve(root, "roadmap/refresh.json");
const prev = !FULL && existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : null;

const ORG = data.repos?.owner || "macanderson";
const REPOS = data.repos?.tracked || ["roadmap", "oxagen", "stella"];
const CODE_REPO = "oxagen";                       // where the app and the ADRs live
const CODE_REPOS = REPOS.filter((r) => r !== (data.repos?.roadmap || "roadmap"));
const STORE_URL = process.env.ROADMAP_STORE_URL || "https://oxagen-roadmap.vercel.app/api/state";
const KEEP_DAYS = 90;                             // closed, unreferenced records older than this are dropped

/* ---------- GitHub ---------- */
const API = "https://api.github.com";
const headers = {
  accept: "application/vnd.github+json", "user-agent": "oxagen-roadmap-refresh", "x-github-api-version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};
let calls = 0;
async function gh(path, { paginate = false, optional = false } = {}) {
  const out = [];
  let url = path.startsWith("http") ? path : API + path;
  for (;;) {
    calls++;
    const res = await fetch(url, { headers });
    if (res.status === 404 && optional) return null;
    if (!res.ok) {
      const remaining = res.headers.get("x-ratelimit-remaining");
      const msg = await res.text().catch(() => "");
      throw new Error(`GitHub ${res.status} on ${url}${remaining === "0" ? " (rate limit used up; set GITHUB_TOKEN)" : ""}: ${msg.slice(0, 200)}`);
    }
    const body = await res.json();
    if (!paginate) return body;
    out.push(...body);
    const next = /<([^>]+)>;\s*rel="next"/.exec(res.headers.get("link") || "")?.[1];
    if (!next) return out;
    url = next;
  }
}
const ghText = async (path) => { calls++; const r = await fetch(API + path, { headers: { ...headers, accept: "application/vnd.github.raw+json" } }); return r.ok ? r.text() : ""; };

/* ---------- the record ---------- */
const R = prev || { generated_at: null, baseline: null, since: {}, heads: {}, issues: {}, prs: {}, items: {}, decisions: {}, decisions_added: {}, adrs: {}, milestones: {}, last_run: null };
// The roadmap's own generated_at is the earliest merge that can count as progress over it. When
// someone rewrites data.json the baseline moves with it and the older merges fall out on prune.
const BASELINE = data.generated_at || "1970-01-01T00:00:00Z";
if (R.baseline !== BASELINE) { R.baseline = BASELINE; R.items = {}; }
// Bump when the rule that turns an issue into a decision changes. Clearing the watermarks makes the
// next run re-read every open issue, so every stored record carries a verdict under the new rule
// before section 7 sweeps the cards an older rule left behind.
const DECISION_RULE = 2;
if (R.decision_rule !== DECISION_RULE) { R.decision_rule = DECISION_RULE; R.since = {}; }
const startedAt = new Date().toISOString();
const summary = { calls: 0, issues: 0, prs: 0, files: 0, items: [], decisions: [], adrs: [], quiet: true };
const key = (repo, n) => `${repo}#${n}`;

function recordIssue(repo, it) {
  const isPr = !!it.pull_request;
  const refs = parseRefs(`${it.title}\n${it.body || ""}`);
  const meta = labelsToMeta(it.labels);
  const rec = {
    repo, number: it.number, title: it.title, state: it.state === "open" ? "open" : "closed", is_pr: isPr,
    updated_at: it.updated_at, closed_at: it.closed_at || null, merged_at: isPr ? it.pull_request.merged_at || null : null,
    labels: meta.labels, kind: meta.kind, priority: meta.priority, pillar: meta.pillar, needs_decision: meta.needs_decision,
    // The question the issue puts to the maintainer, read from the body. Null means the
    // `needs:decision` label is on ordinary work, so section 7 keeps it off the decisions page.
    decision_question: !isPr && meta.needs_decision ? decisionAsked(it.body) : null,
    milestone: it.milestone?.title || null, closes: refs.closes, refs: refs.refs,
    spec_refs: refs.adrs.concat(refs.specs), has_spec_backing: refs.adrs.length + refs.specs.length > 0,
    author: it.user?.login || null, html_url: it.html_url,
  };
  const k = key(repo, it.number);
  const before = R.issues[k];
  R.issues[k] = rec;
  if (stableStringify(before ?? null) !== stableStringify(rec)) { summary.issues++; summary.quiet = false; }
  if (isPr && rec.merged_at && CODE_REPOS.includes(repo) && rec.merged_at >= BASELINE) {
    const p = R.prs[k] || { repo, number: it.number, files: null };
    Object.assign(p, { title: rec.title, merged_at: rec.merged_at, closes: rec.closes, refs: rec.refs, author: rec.author, html_url: rec.html_url });
    R.prs[k] = p;
  }
}

/* ---------- 1. issues and pull requests since the watermark ---------- */
for (const repo of REPOS) {
  const since = R.since[repo];
  let list;
  if (since) {
    list = await gh(`/repos/${ORG}/${repo}/issues?state=all&per_page=100&sort=updated&direction=asc&since=${encodeURIComponent(since)}`, { paginate: true });
  } else {
    // First run: every open issue, plus what merged or was decided since the roadmap was written.
    // Other closed history is read on demand below, only where something on the roadmap points at it.
    const open = await gh(`/repos/${ORG}/${repo}/issues?state=open&per_page=100`, { paginate: true });
    const mergedSince = CODE_REPOS.includes(repo)
      ? await gh(`/repos/${ORG}/${repo}/issues?state=closed&per_page=100&sort=updated&direction=desc&since=${encodeURIComponent(BASELINE)}`, { paginate: true })
      : [];
    list = open.concat(mergedSince.filter(keptOnFirstRun));
  }
  for (const it of list) recordIssue(repo, it);
  const newest = list.reduce((m, i) => (i.updated_at > m ? i.updated_at : m), since || "");
  // Overlap by a second so an issue updated during the run is read again next time, not missed.
  R.since[repo] = newest && newest > (since || "") ? newest : startedAt;
}

/* ---------- 2. the files each newly merged pull request touched ---------- */
for (const p of Object.values(R.prs)) {
  if (p.files) continue;
  const files = await gh(`/repos/${ORG}/${p.repo}/pulls/${p.number}/files?per_page=100`, { paginate: true, optional: true });
  p.files = (files || []).map((f) => f.filename).slice(0, 400);
  p.added = (files || []).filter((f) => f.status === "added").map((f) => f.filename).slice(0, 400);
  p.files_truncated = (files || []).length > 400;
  summary.prs++; summary.files += p.files.length; summary.quiet = false;
}

/* ---------- 3. the app's route tree, when main moved ---------- */
const head = (await gh(`/repos/${ORG}/${CODE_REPO}/commits/main`)).sha;
if (head !== R.heads[CODE_REPO] || !R.pages) {
  const tree = await gh(`/repos/${ORG}/${CODE_REPO}/git/trees/${head}?recursive=1`);
  const pages = tree.tree.filter((t) => /^apps\/app\/src\/app\/.*\/page\.tsx$/.test(t.path)).map((t) => t.path).sort();
  const adrs = tree.tree.filter((t) => /^docs\/adr\/ADR-\d{3}[^/]*\.md$/i.test(t.path)).map((t) => t.path).sort();
  // main moving is not news by itself; a page or an ADR appearing is.
  if (JSON.stringify(pages) !== JSON.stringify(R.pages) || JSON.stringify(adrs) !== JSON.stringify(R.adr_files)) summary.quiet = false;
  R.pages = pages; R.adr_files = adrs; R.heads[CODE_REPO] = head;
}

/* ---------- 4. links people added in the app ---------- */
let store = { overrides: {}, decisions: {} };
try { const r = await fetch(STORE_URL); if (r.ok) store = await r.json(); } catch {}

/* ---------- 5. the issues the roadmap points at that the delta did not carry ---------- */
const ITEMS = [
  ...(data.surfaces || []).map((s) => ({ ...s, kind: "surface", evidence: s.built_evidence || [] })),
  ...(data.witness?.features || []).map((f) => ({ ...f, kind: "witness", evidence: f.evidence || [] })),
  ...(data.dod?.features || []).map((f) => ({ ...f, kind: "dod", evidence: f.evidence || [] })),
];
const linksOf = (it) => {
  const own = it.issue_links || [];
  const added = store.overrides?.[it.id]?.linked_issues || [];
  const all = own.concat(added).filter((l) => l?.repo && l?.number);
  return all.filter((l, i) => all.findIndex((x) => x.repo === l.repo && x.number === l.number) === i);
};
const wanted = new Set();
for (const it of ITEMS) {
  for (const l of linksOf(it)) wanted.add(key(l.repo, l.number));
  for (const n of gapIssueRefs(it.gaps)) wanted.add(key(CODE_REPO, n));
}
for (const d of Object.values(store.decisions || {})) if (d?.issue?.repo && d.issue.number) wanted.add(key(d.issue.repo, d.issue.number));
for (const p of Object.values(R.prs)) for (const n of p.closes) wanted.add(key(p.repo, n));
for (const k of wanted) {
  if (R.issues[k]) continue;
  const [repo, n] = k.split("#");
  const it = await gh(`/repos/${ORG}/${repo}/issues/${n}`, { optional: true });
  if (it) recordIssue(repo, it);
}

/* ---------- 6. items: activity, links, the page, the derived status ---------- */
const pageOf = {}, pageUsers = {};
for (const it of ITEMS) {
  if (it.kind !== "surface") continue;
  const p = pageFor(it.route, R.pages);
  pageOf[it.id] = p;
  if (p) (pageUsers[p] ||= []).push(it.id);
}
const closedBy = {};   // issue key -> [pr key]
for (const p of Object.values(R.prs)) for (const n of p.closes) (closedBy[key(p.repo, n)] ||= []).push(p.number);
const itemStatus = {}, itemLinks = {}, itemPrs = {};
for (const it of ITEMS) {
  const links = linksOf(it).map((l) => ({ ...l, state: R.issues[key(l.repo, l.number)]?.state || "unknown", title: R.issues[key(l.repo, l.number)]?.title || null }));
  const gapRefs = gapIssueRefs(it.gaps).map((n) => ({ number: n, state: R.issues[key(CODE_REPO, n)]?.state || "unknown" }));
  const merged = Object.values(R.prs)
    .filter((p) => p.merged_at >= BASELINE)
    .map((p) => ({ p, touched: touchedEvidence(p.files, it.evidence), closes: p.closes.filter((n) => links.some((l) => l.repo === p.repo && l.number === n)) }))
    .filter((x) => x.touched.length || x.closes.length)
    .sort((a, b) => (a.p.merged_at < b.p.merged_at ? 1 : -1))
    .map((x) => ({ repo: x.p.repo, number: x.p.number, title: x.p.title, merged_at: x.p.merged_at, touched: x.touched.slice(0, 12), closes: x.closes }));
  // A page proves a surface started only when it is that surface's own page: the "off" state of a
  // list or an interjection on the Run page share a page.tsx with a surface that is already built.
  const page = pageOf[it.id] && pageUsers[pageOf[it.id]].length === 1 ? pageOf[it.id] : null;
  const closedByPr = links.flatMap((l) => closedBy[key(l.repo, l.number)] || []);
  // The human override in the store outranks the roadmap file; the rules move from whichever is newer.
  const humanStatus = store.overrides?.[it.id]?.built_status;
  const base = humanStatus || it.built_status || "not-started";
  const derived = deriveStatus({ status: base, page, linked: links, gapRefs, closedByPr });
  const before = R.items[it.id];
  const rec = {
    kind: it.kind, refreshed_at: startedAt,
    page: pageOf[it.id], shared_page: !!(pageOf[it.id] && pageUsers[pageOf[it.id]].length > 1),
    links, gap_refs: gapRefs, merged_prs: merged.slice(0, 20),
    open_issues: links.filter((l) => l.state === "open").length, closed_issues: links.filter((l) => l.state === "closed").length,
    last_merge: merged[0]?.merged_at || null,
  };
  if (derived.built_status !== base) { rec.built_status = derived.built_status; rec.reason = derived.reason; }
  if (derived.ready_for_review) rec.ready_for_review = derived.ready_for_review;
  // Keep the earlier refreshed_at when nothing but the clock moved, so the file stays still.
  const same = before && stableStringify({ ...before, refreshed_at: null }) === stableStringify({ ...rec, refreshed_at: null });
  R.items[it.id] = same ? before : rec;
  if (!same) { summary.items.push(it.id + (rec.built_status ? ` → ${rec.built_status}` : "")); summary.quiet = false; }
  itemStatus[it.id] = rec.built_status || base;
  // A milestone's open issues are the ones its items link and the ones their gap lines cite.
  itemLinks[it.id] = links.concat(gapRefs.map((g) => ({ repo: CODE_REPO, number: g.number, state: g.state })));
  itemPrs[it.id] = merged;
}

/* ---------- 7. decisions: ADRs merged since the baseline, needs:decision issues, closed decision issues ---------- */
const decisions = (data.decisions || []).map((d) => ({ ...d, ...(store.decisions?.[d.id] || {}), ...(R.decisions[d.id] || {}) }));
for (const path of R.adr_files || []) {
  const id = /ADR-(\d{3})/i.exec(path)[0].toUpperCase();
  if (R.adrs[id]) continue;
  const body = await ghText(`/repos/${ORG}/${CODE_REPO}/contents/${path}`);
  const title = (/^#\s+(.+)$/m.exec(body)?.[1] || id).replace(/^ADR-\d{3}[:\s—-]*/i, "").trim();
  const status = /^\*?\*?status\*?\*?[:\s]+([a-z]+)/im.exec(body)?.[1]?.toLowerCase() || null;
  const date = /^\*?\*?date\*?\*?[:\s]+(\d{4}-\d{2}-\d{2})/im.exec(body)?.[1] || null;
  const decision = (/^##\s+Decision\s*$([\s\S]*?)(?=^##\s|\Z)/im.exec(body)?.[1] || "").trim().split(/\n\s*\n/)[0].replace(/\s+/g, " ").slice(0, 600);
  const adr = { id, path, title, status, date, decision };
  R.adrs[id] = adr;
  // Only ADRs that landed after the roadmap was written are news; the earlier ones are its sources,
  // and a PR that edits one of those is not a new decision.
  const merged = Object.values(R.prs).find((p) => (p.added || []).includes(path));
  const landed = merged?.merged_at || (date ? date + "T00:00:00Z" : null);
  if (!landed || landed < BASELINE) continue;
  const settles = matchAdrToDecision({ title, body }, decisions);
  const decided = `${id}: ${title}${decision ? ". " + decision : ""}`;
  if (settles) {
    R.decisions[settles] = { status: "decided", decided_on: landed.slice(0, 10), decided, source: path, refreshed_at: startedAt };
    summary.decisions.push(`${settles} ← ${id}`);
  } else {
    R.decisions_added[id] = { id, title, question: `Decided in the repository: ${title}.`, recommendation: null, source: path, blocks: [], status: "decided", decided_on: landed.slice(0, 10), decided, origin: "adr", pr: merged ? merged.number : null };
    summary.adrs.push(id);
  }
  summary.quiet = false;
}
// An issue earns a decision card only when its body states what the maintainer must decide.
// The label by itself does not: triage puts `needs:decision` on ordinary work, and counting those
// as decisions put 68 work items on the Now page under "decisions blocking work".
const asked = new Set();
for (const rec of Object.values(R.issues)) {
  if (rec.is_pr || !rec.needs_decision || !rec.decision_question) continue;
  const id = `I-${rec.repo}#${rec.number}`;
  asked.add(id);
  const before = R.decisions_added[id];
  const common = { id, title: rec.title, question: rec.decision_question, recommendation: null, source: `${rec.repo}#${rec.number}`, blocks: [], origin: "issue", html_url: rec.html_url };
  const now = rec.state === "open"
    ? { ...common, status: "open", decided_on: null, decided: null }
    : { ...common, status: "decided", decided_on: (rec.closed_at || "").slice(0, 10), decided: `Closed${(closedBy[key(rec.repo, rec.number)] || []).length ? " by #" + closedBy[key(rec.repo, rec.number)].join(", #") : ""}.` };
  if (stableStringify(before ?? null) !== stableStringify(now)) { R.decisions_added[id] = now; summary.decisions.push(id + " " + now.status); summary.quiet = false; }
}
// Drop issue cards a past run added under the old rule, or whose body no longer asks anything.
// This file is incremental state, so without the sweep the page keeps showing what was fixed here.
// A card is dropped only on a record this run judged (`decision_question === null`). A legacy record
// carries `undefined`, and its card stays until a run reads that issue and decides.
for (const id of Object.keys(R.decisions_added)) {
  const card = R.decisions_added[id];
  if (card?.origin !== "issue" || asked.has(id)) continue;
  const rec = R.issues[String(card.source || "")];
  if (rec?.decision_question !== null) continue;
  delete R.decisions_added[id];
  summary.decisions.push(id + " dropped"); summary.quiet = false;
}
for (const d of decisions) {
  if (d.status === "decided" || !d.issue?.number) continue;
  const rec = R.issues[key(d.issue.repo, d.issue.number)];
  if (rec?.state === "closed" && !R.decisions[d.id]) {
    R.decisions[d.id] = { status: "decided", decided_on: (rec.closed_at || "").slice(0, 10), decided: `${d.issue.repo}#${d.issue.number} closed${(closedBy[key(rec.repo, rec.number)] || []).length ? " by #" + closedBy[key(rec.repo, rec.number)].join(", #") : ""}.`, source: rec.html_url, refreshed_at: startedAt };
    summary.decisions.push(`${d.id} ← ${d.issue.repo}#${d.issue.number}`); summary.quiet = false;
  }
}

/* ---------- 8. milestones ---------- */
for (const m of data.milestones || []) {
  const roll = milestoneRollup(m, itemStatus, itemLinks, itemPrs);
  if (stableStringify(R.milestones[m.id] ?? null) !== stableStringify(roll)) { R.milestones[m.id] = roll; summary.quiet = false; }
}

/* ---------- 9. prune, then write only when something moved ---------- */
const cutoff = new Date(Date.now() - KEEP_DAYS * 864e5).toISOString();
for (const [k, rec] of Object.entries(R.issues)) {
  if (rec.state === "open" || wanted.has(k) || rec.needs_decision) continue;
  if ((rec.closed_at || rec.updated_at) < cutoff) delete R.issues[k];
}
for (const [k, p] of Object.entries(R.prs)) if (p.merged_at < cutoff) delete R.prs[k];

summary.calls = calls;
R.last_run = { at: startedAt, calls, quiet: summary.quiet };
const line = summary.quiet
  ? `quiet: nothing moved since ${prev?.generated_at || "the baseline"} (${calls} calls)`
  : `refreshed: ${summary.issues} issues, ${summary.prs} PRs (${summary.files} files), ${summary.items.length} items [${summary.items.join(", ")}], ${summary.decisions.length} decisions [${summary.decisions.join(", ")}], ${summary.adrs.length} ADRs [${summary.adrs.join(", ")}] (${calls} calls)`;
console.log(line);
if (DRY) process.exit(0);
// A quiet run writes nothing, so the workflow has nothing to commit. The watermarks stay where the
// last change left them; the next run re-reads the same small delta and finds it already recorded.
if (summary.quiet && prev) process.exit(0);
R.generated_at = startedAt;
writeFileSync(OUT, stableStringify(R));
console.log(`wrote roadmap/refresh.json (${Object.keys(R.issues).length} issues, ${Object.keys(R.prs).length} PRs, ${Object.keys(R.items).length} items, ${Object.keys(R.decisions).length + Object.keys(R.decisions_added).length} decisions)`);
