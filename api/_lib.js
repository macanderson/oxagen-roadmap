// Shared helpers for the hosted roadmap's functions.
//
// Everyone can READ the roadmap and its shared state. WRITING the state and asking Claude both
// need the edit key (env EDIT_KEY, sent as the x-edit-key header), so a public link cannot be
// vandalised and cannot spend the Anthropic key. With no EDIT_KEY set, every write is refused.
import { timingSafeEqual } from "node:crypto";
import { get, put } from "@vercel/blob";

export const STATE_PATH = "roadmap/state.json";
const EMPTY = () => ({ overrides: {}, decisions: {}, activity: [], updated_at: null });

export function json(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

export function canEdit(req) {
  const expected = process.env.EDIT_KEY || "";
  const given = String(req.headers["x-edit-key"] || "");
  if (!expected || !given) return false;
  const a = Buffer.from(expected), b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function readBody(req, limit = 512 * 1024) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (c) => { data += c; if (data.length > limit) { reject(new Error("too large")); req.destroy(); } });
    req.on("end", () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}

export async function readState() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return EMPTY();
  const r = await get(STATE_PATH, { access: "private", useCache: false }).catch(() => null);
  if (!r) return EMPTY();
  try { return { ...EMPTY(), ...JSON.parse(await new Response(r.stream).text()) }; } catch { return EMPTY(); }
}

export async function writeState(state) {
  state.updated_at = new Date().toISOString();
  await put(STATE_PATH, JSON.stringify(state), { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
  return state;
}

// Plain-data guard for what a client may store on an item or a decision.
const OVERRIDE_KEYS = ["built_status", "priority", "owner", "note", "linked_issues", "decision_needed"];
const DECISION_KEYS = ["status", "decided", "decided_on", "note", "issue"];
export function pick(patch, kind) {
  const keys = kind === "decision" ? DECISION_KEYS : OVERRIDE_KEYS;
  const out = {};
  for (const k of keys) {
    if (!(k in (patch || {}))) continue;
    const v = patch[k];
    if (k === "linked_issues") out[k] = (Array.isArray(v) ? v : []).slice(0, 50).map((l) => ({ repo: String(l.repo || "").slice(0, 100), number: Number(l.number) || 0 })).filter((l) => l.repo && l.number);
    else if (k === "issue") out[k] = v && typeof v === "object" ? { repo: String(v.repo || "").slice(0, 100), number: Number(v.number) || 0 } : null;
    else out[k] = v == null ? null : String(v).slice(0, 8000);
  }
  return out;
}
