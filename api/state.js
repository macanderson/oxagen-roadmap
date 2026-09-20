// GET  /api/state   the shared roadmap state: item overrides, decisions, recent activity. Public.
// POST /api/state   {op: "override"|"decision"|"activity", id?, patch?, activity?, text?, item?, route?}
//                   Needs the password. Read-modify-write on one JSON blob; last writer wins.
import { json, signedIn, readBody, readState, writeState, pick, UNAUTHORIZED } from "./_lib.js";

const ID = /^[A-Za-z0-9_.:-]{1,80}$/;

export default async function handler(req, res) {
  if (req.method === "GET") {
    const state = await readState();
    return json(res, 200, { ...state, can_edit: signedIn(req) });
  }
  if (req.method !== "POST") return json(res, 405, { error: "method" });
  if (!signedIn(req)) return json(res, 401, UNAUTHORIZED);
  if (!process.env.BLOB_READ_WRITE_TOKEN) return json(res, 503, { error: "store_not_configured" });

  let body;
  try { body = await readBody(req, 64 * 1024); } catch { return json(res, 400, { error: "body" }); }
  const state = await readState();
  const now = new Date().toISOString();
  const log = (text, item, route) => {
    if (!text) return;
    state.activity.unshift({ ts: now, text: String(text).slice(0, 400), item: item || null, route: route || null });
    state.activity = state.activity.slice(0, 200);
  };

  if (body.op === "override" || body.op === "decision") {
    if (!ID.test(String(body.id || ""))) return json(res, 400, { error: "id" });
    const bucket = body.op === "override" ? state.overrides : state.decisions;
    bucket[body.id] = { ...(bucket[body.id] || {}), ...pick(body.patch, body.op), updated_at: now };
    log(body.activity, body.op === "override" ? body.id : null, body.route);
  } else if (body.op === "activity") {
    log(body.text, body.item, body.route);
  } else return json(res, 400, { error: "op" });

  try { await writeState(state); } catch (e) { console.error("state write failed", e?.message || e); return json(res, 500, { error: "store_write" }); }
  return json(res, 200, { ...state, can_edit: true });
}
