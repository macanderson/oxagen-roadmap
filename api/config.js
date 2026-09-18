// GET /api/config   what this deployment can do, so the page lights up only what works.
import { json, canEdit } from "./_lib.js";

export default function handler(req, res) {
  json(res, 200, {
    hosted: true,
    store: !!process.env.BLOB_READ_WRITE_TOKEN,
    claude: !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN),
    edit_key_set: !!process.env.EDIT_KEY,
    can_edit: canEdit(req),
  });
}
