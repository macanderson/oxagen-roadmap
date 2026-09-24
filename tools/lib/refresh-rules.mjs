// The pure rules behind tools/refresh-roadmap.mjs: how a GitHub issue, a merged pull request,
// an ADR and the app's route tree turn into roadmap status. No I/O here, so tools/check-refresh.mjs
// can prove each rule on fixtures.

// "Closes #12", "fixes: #3", "resolves https://github.com/o/r/issues/9", "Refs #4".
const CLOSE_RE = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s*:?\s*(?:https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:issues|pull)\/)?#?(\d+)/gi;
const REF_RE = /\brefs?\s*:?\s*(?:https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:issues|pull)\/)?#?(\d+)/gi;
const ADR_RE = /\bADR-(\d{3})\b/g;
const SPEC_RE = /\bdocs\/specs\/[\w./-]+/g;
const ISSUE_RE = /#(\d{3,5})\b/g;

const uniq = (xs) => [...new Set(xs)];

/** Issue numbers and spec references named in a title or body. */
export function parseRefs(text) {
  const t = String(text || "");
  const pull = (re) => uniq([...t.matchAll(re)].map((m) => Number(m[1])).filter(Boolean));
  return {
    closes: pull(CLOSE_RE),
    refs: pull(REF_RE),
    adrs: uniq([...t.matchAll(ADR_RE)].map((m) => "ADR-" + m[1])),
    specs: uniq([...t.matchAll(SPEC_RE)].map((m) => m[0].replace(/[.,)]+$/, ""))),
  };
}

/** Every `#NNN` an item's gap lines cite: the issues that must close before the gap is gone. */
export function gapIssueRefs(gaps) {
  return uniq((gaps || []).flatMap((g) => [...String(g).matchAll(ISSUE_RE)].map((m) => Number(m[1]))));
}

/** The triage dimensions oxagen's label scheme carries (CLAUDE.md "Issues and labels"). */
export function labelsToMeta(labels) {
  const names = (labels || []).map((l) => (typeof l === "string" ? l : l?.name || "")).filter(Boolean);
  const first = (prefix) => names.find((n) => n.startsWith(prefix))?.slice(prefix.length) || null;
  return {
    labels: names,
    kind: first("kind:"),
    priority: names.find((n) => /^P[0-4]$/.test(n)) || null,
    pillar: first("pillar:"),
    needs_decision: names.includes("needs:decision"),
    triage: names.includes("triage"),
  };
}

/**
 * The question a `needs:decision` issue puts to the maintainer, or null when it puts none.
 *
 * The label alone is not evidence. Triage applies `needs:decision` to ordinary work, so on
 * 2026-09-20 it sat on 69 open oxagen issues while 10 of them actually asked the maintainer
 * something. A decision card that cannot state its question is not a decision, so this reads the
 * question out of the body and the caller drops the issue when it finds none.
 *
 * Two shapes count. A heading (`## Decision needed`, `## Options`) means the paragraph under it is
 * the question. A sentence that names the maintainer counts only when the clause after it says what
 * is being decided, which is what the connector test does: reciting the filing rule ("case 1 is a
 * decision only the maintainer can make, real spend, or is bigger than one session") names nothing
 * and stops here.
 */
const DECISION_ASK = /(?:needs?|requires?|wants?) (?:a |an )?(?:maintainer|owner|human)(?:'s|\u2019s)? (?:decision|call|choice|answer)|(?:a |the )?decision (?:that )?only (?:the )?(?:maintainer|owner|you) (?:can|must) (?:make|take)|maintainer (?:must|has to|needs to) (?:decide|choose|pick)/i;
// What a full run keeps from the closed list: merged PRs, and closed issues that carry
// `needs:decision`. Closing such an issue is how a decision gets settled, so dropping it would
// leave those decisions off the page.
export function keptOnFirstRun(it) {
  if (it.pull_request) return !!it.pull_request.merged_at;
  return labelsToMeta(it.labels).needs_decision;
}

const DECISION_LEAD = /^\s*(?:[:\u2014\u2013-]\s*|(?:on |about )?(?:whether|which|what|how|if)\b)/i;
const DECISION_HEAD = /^#{1,4}\s*(?:the )?(?:decision needed|decision required|open questions?|the question|questions? for the maintainer|options|the choice)\s*$/im;
const plain = (s) => String(s).replace(/`([^`]+)`/g, "$1").replace(/\*\*?([^*]+)\*\*?/g, "$1")
  .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();

export function decisionAsked(body) {
  const src = String(body || "").replace(/<!--[\s\S]*?-->/g, "").replace(/```[\s\S]*?```/g, " ");
  const head = DECISION_HEAD.exec(src);
  if (head) {
    const para = src.slice(head.index + head[0].length).replace(/^\s+/, "").split(/\n\s*\n/)[0] || "";
    const q = plain(para);
    if (q.length >= 30) return q.slice(0, 400);
  }
  const m = DECISION_ASK.exec(src);
  if (!m) return null;
  const tail = src.slice(m.index + m[0].length);
  if (!DECISION_LEAD.test(tail)) return null;
  const stop = /(?:[.!?](?:\s|$)|\n\s*\n|\n\s*[-*#])/.exec(tail);
  const q = plain(stop ? tail.slice(0, stop.index) : tail.slice(0, 400)).replace(/^[,:;\u2014\u2013\s-]+/, "");
  if (q.length < 25) return null;
  return (q.charAt(0).toUpperCase() + q.slice(1)).slice(0, 400);
}

// The mockup's welcome routes do not follow the org/workspace pattern; this is where each one lives.
const WELCOME = {
  signup: "(auth)/signup", verify: "(auth)/verify", login: "(auth)/login", "two-factor": "(auth)/two-factor",
  forgot: "(auth)/forgot-password", reset: "(auth)/reset-password", invite: "(auth)/invite/[token]",
  organization: "(onboarding)/new-organization", wrap: "[org]/[ws]/register/[step]", run: "[org]/[ws]/register/[step]",
  installer: "[org]/[ws]/register/[step]",
};
const ID_SEGMENT = /^(run_|mnd_|ctx\.|[a-z0-9-]+\.[a-z0-9.-]+$)/;

/**
 * Where the app would keep the page for a mockup route: a list of `apps/app/src/app/...` directories,
 * most specific first. Dynamic mockup segments (an agent name, a run id, a record id) become the
 * app's `[x]` folders, matched by position. Dialog routes ("... (New agent)") have no page.
 */
export function appRouteCandidates(route) {
  const r = String(route || "").replace(/^#\/?/, "");
  if (!r || /\(.*\)$/.test(r)) return [];
  const seg = r.split("/").filter(Boolean);
  if (seg[0] === "welcome") return WELCOME[seg[1]] ? ["apps/app/src/app/" + WELCOME[seg[1]]] : [];
  // seg[0] is the org; seg[1] is a workspace unless it is an org-level page.
  const orgPages = new Set(["billing", "api-keys", "roles", "audit", "model-funding", "members", "settings"]);
  const base = ["[org]"];
  let rest = seg.slice(1);
  if (rest.length && !orgPages.has(rest[0])) { base.push("[ws]"); rest = rest.slice(1); }
  return [base.concat(rest).map((s, i) => (i < base.length ? s : `{${s}}`)).join("/")].map((p) => "apps/app/src/app/" + p);
}

/**
 * The page.tsx that serves a mockup route, or null. `pages` is every `apps/app/src/app/**\/page.tsx`
 * path in the tree. A `{segment}` in the candidate matches the literal folder or any `[dynamic]` one.
 */
export function pageFor(route, pages) {
  for (const cand of appRouteCandidates(route)) {
    const parts = cand.split("/");
    const hit = (pages || []).find((p) => {
      const ps = p.replace(/\/page\.tsx$/, "").split("/");
      if (ps.length !== parts.length) return false;
      return parts.every((c, i) => {
        if (!c.startsWith("{")) return c === ps[i];
        const lit = c.slice(1, -1);
        return ps[i] === lit || (/^\[.+\]$/.test(ps[i]) && (ID_SEGMENT.test(lit) || !pagesHasLiteral(pages, ps.slice(0, i), lit)));
      });
    });
    if (hit) return hit;
  }
  return null;
}
function pagesHasLiteral(pages, prefix, lit) {
  const want = prefix.concat(lit).join("/") + "/";
  return pages.some((p) => p.startsWith(want));
}

/** Which of an item's evidence paths a merged pull request touched. Evidence may carry a "(note)". */
export function touchedEvidence(files, evidence) {
  const paths = (evidence || []).map((e) => String(e).replace(/\s*\(.*$/, "").trim()).filter(Boolean);
  const fs = new Set(files || []);
  return paths.filter((p) => fs.has(p) || [...fs].some((f) => f.startsWith(p.replace(/\/$/, "") + "/")));
}

/**
 * The one place status moves by machine. Monotone: nothing here demotes.
 *   not-started → partial  when the page for its route exists in the tree, or a merged PR closed one
 *                          of its linked issues.
 *   partial     → built    when it has linked issues, every one is closed, and every issue its gap
 *                          lines cite is closed too. Gaps that cite nothing keep a human in the loop:
 *                          the item is flagged ready_for_review instead.
 */
export function deriveStatus({ status, page, linked, gapRefs, closedByPr }) {
  const cur = status || "not-started";
  const open = linked.filter((l) => l.state === "open").length;
  const closed = linked.filter((l) => l.state === "closed").length;
  const unknown = linked.length - open - closed;
  const gapsOpen = gapRefs.filter((g) => g.state !== "closed").length;
  if (cur === "not-started") {
    if (page) return { built_status: "partial", reason: `page exists: ${page}` };
    if (closedByPr.length) return { built_status: "partial", reason: `${closedByPr.map((p) => "#" + p).join(", ")} closed a linked issue` };
    return { built_status: cur, reason: null };
  }
  if (cur === "partial" || cur === "fixtures-only") {
    if (linked.length && !open && !unknown) {
      if (gapRefs.length && !gapsOpen) return { built_status: "built", reason: `all ${closed} linked issues and every issue the gaps cite are closed` };
      if (!gapRefs.length) return { built_status: cur, reason: null, ready_for_review: `all ${closed} linked issues are closed; the gaps cite no issue, so a person confirms` };
    }
    return { built_status: cur, reason: null };
  }
  return { built_status: cur, reason: null };
}

const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "it", "as", "by", "with", "vs", "versus", "from", "at", "be", "do", "we", "our", "one", "two"]);
const words = (s) => uniq(String(s || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/[\s-]+/).filter((w) => w.length > 2 && !STOP.has(w)));

/**
 * An ADR settles an open decision when they share most of their words, or when the ADR names the
 * issue the decision was opened as. Returns the decision id or null.
 */
export function matchAdrToDecision(adr, decisions) {
  const aw = new Set(words(adr.title));
  const body = String(adr.body || "");
  let best = null, bestScore = 0;
  for (const d of decisions) {
    if (d.status === "decided") continue;
    if (d.issue?.number && new RegExp(`#${d.issue.number}\\b`).test(body)) return d.id;
    const dw = words(d.title + " " + (d.question || ""));
    if (!dw.length || !aw.size) continue;
    const hit = dw.filter((w) => aw.has(w)).length;
    const score = hit / Math.min(dw.length, aw.size);
    if (score > bestScore) { bestScore = score; best = d.id; }
  }
  return bestScore >= 0.6 ? best : null;
}

/** The counts a milestone row shows: built / partial / to go, its open issues, and the last merge. */
export function milestoneRollup(milestone, itemStatus, itemLinks, prs) {
  const ids = milestone.surfaces || [];
  const st = ids.map((id) => itemStatus[id] || "not-started");
  const linked = ids.flatMap((id) => itemLinks[id] || []);
  const merged = ids.flatMap((id) => prs[id] || []).sort((a, b) => (a.merged_at < b.merged_at ? 1 : -1));
  const last = merged[0] || null;
  return {
    total: ids.length,
    built: st.filter((s) => s === "built").length,
    partial: st.filter((s) => s === "partial" || s === "fixtures-only").length,
    not_started: st.filter((s) => s === "not-started").length,
    open_issues: uniq(linked.filter((l) => l.state === "open").map((l) => l.repo + "#" + l.number)).length,
    merged_prs: uniq(merged.map((p) => p.repo + "#" + p.number)).length,
    last_merge: last ? { repo: last.repo, number: last.number, title: last.title, merged_at: last.merged_at } : null,
  };
}

/** A stable JSON body: sorted keys, so a run that found nothing writes nothing. */
export function stableStringify(v) {
  const sort = (x) => Array.isArray(x) ? x.map(sort) : x && typeof x === "object" ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, sort(x[k])])) : x;
  return JSON.stringify(sort(v), null, 2) + "\n";
}
