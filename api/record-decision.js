// POST /api/record-decision   write a decision back to the source that asked for it.
//
// Deciding something on this page used to change the roadmap and nothing else, so the GitHub issue
// that asked the question stayed open and the next person to read it learned nothing. This closes
// that gap: the model drafts the record in two or three sentences, the function posts it as a
// comment on the issue, drops the `needs:decision` label, and closes the issue when you ask it to.
//
// The model writes the wording, not the outcome. The decision text, the issue and the close are
// yours. If the model is down or slow the deterministic draft below is posted instead, because a
// model outage is not a reason to lose the record.
//
// Body: {id, title, question, decided, decided_on, repo, number, close}
// Reply: {url, body, drafted_by: "model"|"template", label_removed, closed}
import { json, signedIn, readBody, UNAUTHORIZED } from "./_lib.js";
import { complete } from "./_model.js";

const OWNER = process.env.GITHUB_OWNER || "macanderson";
// The roadmap tracks three repositories. A token with issue write is not a licence to comment
// anywhere, so the target is checked against that list before anything is posted.
const REPOS = (process.env.GITHUB_REPOS || "roadmap,oxagen,stella").split(",").map((s) => s.trim()).filter(Boolean);
const DECISION_LABEL = "needs:decision";
const ROADMAP_URL = "https://oxagen-roadmap.vercel.app/#/decisions";

// The model writes the wording and nothing else, which is a narrower job than it will take on if
// you let it. Given only "it works", an earlier draft added "the automated workflow is now
// unblocked for production use. No further changes to the integration are needed." Nobody decided
// either of those, and both would have gone onto a real issue under the decider's name. So the
// rules below forbid the shapes the invention arrives in: a closing summary, an actor nobody
// named, and a consequence that was not written down.
const SYSTEM = `You write the record of a decision onto the GitHub issue that asked for it.

Rules:
- Two or three sentences of GitHub-flavoured Markdown. No heading, no preamble, no sign-off.
- Say what was decided, then what it means for this issue: what to build, what to stop, or what is now unblocked.
- Every clause restates something in the decision text. If the decision does not say what happens next, do not say it.
- No closing or summary sentence. Stop after the last thing the decision actually settles.
- Name no actor the decision does not name. Write "the roadmap records" or the passive, not "the team confirmed".
- Plain language, active voice. One idea per sentence.
- No em dashes. No exclamation points. No praise and no filler.
- Never claim the work is done, unblocked, validated, verified, complete, or ready to ship unless the decision says so in those words. A decision settles a question, not the build.`;

function template({ title, decided, decided_on }) {
  return `**Decided${decided_on ? ` ${decided_on}` : ""}: ${title}**\n\n${decided}`;
}

function footer({ id, decided_on }) {
  return `\n\n<sub>Recorded from the [Oxagen roadmap](${ROADMAP_URL}) as decision \`${id}\`${decided_on ? ` on ${decided_on}` : ""}.</sub>`;
}

async function gh(token, method, path, body) {
  const r = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "oxagen-roadmap",
      ...(body ? { "content-type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!r.ok) {
    const e = new Error((await r.text().catch(() => "")).slice(0, 300) || `github ${r.status}`);
    e.status = r.status;
    throw e;
  }
  return r.status === 204 ? null : r.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "method" });
  if (!signedIn(req)) return json(res, 401, UNAUTHORIZED);
  const token = process.env.GITHUB_TOKEN;
  if (!token) return json(res, 503, { error: "no_github_token", message: "This deployment has no GitHub token, so a decision is recorded on the roadmap only." });

  let body;
  try { body = await readBody(req, 64 * 1024); } catch { return json(res, 400, { error: "body" }); }
  const repo = String(body.repo || "");
  const number = Number(body.number);
  const decided = String(body.decided || "").trim().slice(0, 4000);
  if (!REPOS.includes(repo)) return json(res, 400, { error: "repo", message: `This roadmap only writes to ${REPOS.join(", ")}.` });
  if (!Number.isInteger(number) || number < 1) return json(res, 400, { error: "number" });
  if (!decided) return json(res, 400, { error: "decided", message: "There is nothing to record." });

  const meta = {
    id: String(body.id || "").slice(0, 80),
    title: String(body.title || "").slice(0, 300),
    question: String(body.question || "").slice(0, 2000),
    decided_on: /^\d{4}-\d{2}-\d{2}$/.test(String(body.decided_on || "")) ? body.decided_on : null,
    decided,
  };

  const drafted = await complete({
    tier: "quick",
    system: SYSTEM,
    prompt: `Issue: ${OWNER}/${repo}#${number}\nDecision title: ${meta.title}\nThe question it asked: ${meta.question || "(not recorded)"}\n\nWhat was decided:\n${decided}`,
  });
  const text = (drafted || template(meta)) + footer(meta);

  let comment;
  try {
    comment = await gh(token, "POST", `/repos/${OWNER}/${repo}/issues/${number}/comments`, { body: text });
  } catch (e) {
    console.error("record-decision: comment failed", e?.status, e?.message);
    const code = e?.status === 404 ? "not_found" : e?.status === 401 || e?.status === 403 ? "github_auth" : "github";
    return json(res, e?.status === 404 ? 404 : 502, { error: code, message: String(e?.message || e).slice(0, 300) });
  }

  // The label and the close are housekeeping. Neither failing loses the comment that was posted,
  // so both are reported rather than thrown.
  let label_removed = false, closed = false;
  try {
    await gh(token, "DELETE", `/repos/${OWNER}/${repo}/issues/${number}/labels/${encodeURIComponent(DECISION_LABEL)}`);
    label_removed = true;
  } catch (e) { if (e?.status !== 404) console.error("record-decision: label", e?.status, e?.message); }

  if (body.close) {
    try {
      await gh(token, "PATCH", `/repos/${OWNER}/${repo}/issues/${number}`, { state: "closed", state_reason: "completed" });
      closed = true;
    } catch (e) { console.error("record-decision: close", e?.status, e?.message); }
  }

  return json(res, 200, { url: comment?.html_url || null, body: text, drafted_by: drafted ? "model" : "template", label_removed, closed });
}
