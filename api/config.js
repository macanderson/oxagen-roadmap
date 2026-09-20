// GET /api/config   what this deployment can do, so the page lights up only what works.
import { json, canEdit } from "./_lib.js";

export default function handler(req, res) {
  json(res, 200, {
    hosted: true,
    store: !!process.env.BLOB_READ_WRITE_TOKEN,
    assistant: !!process.env.OPENROUTER_API_KEY,
    // The drawer names the model it is about to spend on, so the label matches the bill.
    model: process.env.OPENROUTER_MODEL || "moonshotai/kimi-k3",
    edit_key_set: !!process.env.EDIT_KEY,
    can_edit: canEdit(req),
  });
}
