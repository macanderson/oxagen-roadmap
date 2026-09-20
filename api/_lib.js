// Shared helpers for the hosted roadmap's functions.
//
// Everyone can READ the roadmap and its shared state. Writing the state, asking the assistant, and
// recording a decision back to GitHub all need the password (env ROADMAP_PASSWORD). With no
// ROADMAP_PASSWORD set, every one of those is refused, so a misconfigured deployment stays read
// only rather than open.
//
// Signing in posts the password to /api/session, which returns it as an httpOnly cookie. The page
// never holds the password after that: a script running on the page cannot read the cookie back,
// and every later call carries it automatically. The header is kept for scripts and smoke tests,
// which have no cookie jar.
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

export const SESSION_COOKIE = "rm_session";
export const PASSWORD_HEADER = "x-roadmap-password";

function sameSecret(expected, given) {
  if (!expected || !given) return false;
  const a = Buffer.from(expected), b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

// One cookie header into a plain object. Values are decoded, because Set-Cookie encodes them.
export function cookies(header) {
  const out = {};
  for (const part of String(header || "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (k) out[k] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function passwordOk(given) {
  return sameSecret(process.env.ROADMAP_PASSWORD || "", String(given || ""));
}

// True when this request carries the password, by cookie or by header.
export function signedIn(req) {
  const jar = cookies(req.headers.cookie);
  return passwordOk(jar[SESSION_COOKIE]) || passwordOk(req.headers[PASSWORD_HEADER]);
}

export const UNAUTHORIZED = { error: "password", message: "Sign in with the roadmap password first." };

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
const DECISION_KEYS = ["status", "decided", "decided_on", "note", "issue", "recorded"];
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
