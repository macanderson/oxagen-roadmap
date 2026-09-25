# Organization: API keys

## API keys

Every API key in the organization: the service principal behind it, its grants, who made it, when it was last used and when it expires.

### Purpose
The panel answers what each non-human caller can do and whether it is still in use. It is where you create, rotate and revoke a key. **Create key** opens the create dialog. **Rotate** and **Revoke** on a row open their confirmations.

### Rationale
Each key is a service principal with its own grants. Keys carry grants, not roles, so an auditor's key can read receipts and nothing else. That keeps each machine caller as narrow as its job. A key's secret is shown once, at creation, and not again. Revoking a key ends its service principal's access at the next call. Create, rotate and revoke are governed actions with audit records (§14). Rotation ships in rev1 through `rotate_api_key` (2026-09-15, maintainer decision). The tab has its own address, `#/a-intel/api-keys`, so a link from the command menu or the docs lands on the keys and not on People.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, masked key, principal, grants | `APIKEYS` (4 seed rows, 10 from `volume()`) | `iam.credentials`, `auth.api_keys` today | live |
| Created by, Expires | `APIKEYS[].by`, `.expires` | `auth.api_keys` | live |
| Last used | `APIKEYS[].last` | `auth.api_keys` | live |
| Actions 30d | `APIKEYS[].n30` | `audit.audit_events` by principal (ClickHouse `audit_events`) | partial |

### Logic
1. `pOrganization()` renders the panel when `S.tab.organization` is `keys`. `orgTab('keys')` sets the tab and the address.
2. Name shows the key's name with the masked key under it. Principal is the `svc_*` id. Grants shows one chip per grant.
3. Expires shows a state badge from `k.st` with the date under it: `ok` reads Active, `expiring` reads "Expires in N days", counted from the mock's today (2026-09-11), and `unused` reads "Never used".
4. **Rotate** opens `rotatekey` and **Revoke** opens `revokekey`, each with the row's index.
5. The Grants and Expires filters and the Rows control come from the shared table controls.
6. `apikeyCreate()`, `apikeyRotate()` and `apikeyRevoke()` write `APIKEYS` and re-render, so the row appears, changes or leaves behind the dialog.

### States
Loading, error, denied and empty belong to the Organization page: the header and tab bar share the family's section. The empty state reads "This organization has no workspaces". On a phone each key row becomes a card with every cell labelled by its column.

## Surfaces this reaches

Four `oxagen` CLI lines that show a key working outside these screens.

### Purpose
The panel shows what holding a key means in practice: the same actions from a terminal, a script or an MCP client. It gives you a command to try with a new key.

### Rationale
The API, MCP, the CLI and these screens share one set of actions: one agent tool contract. A key that can do something here can do exactly that much everywhere else, and nothing more. The panel exists so that nobody reads a key's grants as screen-only permissions.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| CLI lines | static `<pre>` in `pOrganization()` | the CLI reference | fixture only |

### Logic
1. The panel prints four commands: `oxagen login --org a-intel`, `oxagen run list --workspace core-platform --since 24h`, `oxagen run export run_01K5RS7M2E8FJ3QW --with-bodies --out ./run_01K5RS7M2E8FJ3QW.bundle` and `oxagen agent status a-intel.finops.invoice-bot`.
2. The lines are static. The build fills the organization slug, a workspace and a real run id from the record, so every line runs as written.

### States
The panel has no state of its own. On a phone the code block scrolls inside the panel, and the page does not scroll sideways.

## Create an API key {#dialog/apikey}

The form that creates one API key: a name, a set of grants and an expiry.

### Purpose
You open it with **Create key** on the API keys panel. It creates a service principal for a machine caller and adds its row to the table.

### Rationale
A key carries grants, not roles. It becomes a service principal, and every call it makes is audited against that principal. A key can reach exactly what a person with those grants can, in the API, MCP, the CLI and these screens. The secret is shown once, at creation, and stored hashed. The one line above the form says so, because it is the one thing you must act on before you close the dialog.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name | `#ak-name` | `auth.api_keys` | live |
| Grants | `#ak-grants`, three fixed bundles | `iam.credentials` grants | live |
| Expires | `#ak-exp`: 90 days, 180 days or 1 year | `auth.api_keys` | live |

### Logic
1. **Create key** calls `apikeyCreate()`. An empty name does nothing.
2. It splits the chosen bundle into grants and names the principal `svc_` plus the name in lowercase with underscores, cut to 20 characters.
3. It pushes a row with a masked key, you as creator, "Never used", 0 actions and the chosen expiry, then re-renders.
4. It writes `api_key.created` to `AUDIT` with the principal, the grants and the expiry, then toasts "Created <name>. The secret is shown once, and api_key.created is in the audit record."
5. The mockup shows no secret. The build shows the secret once in a copy field, stores it hashed, and writes `api.key.create`.
6. The bundles offer `workspace.write`, `agent.write` and `grant.write`, which are not in `PERMS`, the role editor's permission list. The two lists need one catalog, and `PERMS` waits on a spec decision.

### States
The mockup has no error state. The build shows a duplicate name or an empty grant set under its field. On a phone the dialog rises as a bottom sheet.

## Rotate an API key {#dialog/rotatekey}
<!-- open: openDialog('rotatekey',0) -->

The confirmation that issues a new secret for one API key.

### Purpose
You open it with **Rotate** on a key's row. It names the key and says what happens to the old secret.

### Rationale
Rotation issues a new secret and keeps the old one valid for 24 hours, so callers can move to the new one without an outage. Both secrets are audited while they overlap. Rotation ships in rev1 as `rotate_api_key` (2026-09-15, maintainer decision).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Key | `APIKEYS[S.dlgArg]`, or row 0 | `auth.api_keys` | live |

### Logic
1. The dialog reads the key from the index it was opened with. Any other argument falls back to the first row.
2. It shows the name, the masked key and the principal, then the one line about the 24-hour overlap.
3. **Rotate** calls `apikeyRotate(i)`. It writes a new masked key and sets the state to `ok`, then toasts "Rotated. <name> has a new secret, shown once; the old one stays valid for 24 hours."
4. Setting the state to `ok` makes an expiring or unused key read Active with its old expiry date. The build keeps the expiry state and shows the new secret once.
5. The mockup writes `api_key.rotated` to `AUDIT`. The build writes `api.key.rotate`.

### States
On a phone the dialog rises as a bottom sheet.

## Revoke an API key {#dialog/revokekey}
<!-- open: openDialog('revokekey',0) -->

The confirmation that revokes one API key and ends its service principal's access.

### Purpose
You open it with **Revoke** on a key's row. It names the key and warns that access ends at its next call.

### Rationale
Revocation cannot be undone, so the dialog carries one warning. Access ends at the principal's next call. Runs it started keep their records, because the record is append-only and revoking a key does not rewrite who did what.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Key | `APIKEYS[S.dlgArg]`, or row 0 | `auth.api_keys` | live |

### Logic
1. The dialog shows the name, the masked key and the principal, then the warning "Revocation ends the service principal's access at its next call."
2. **Revoke** calls `apikeyRevoke(i)`. It removes the row from `APIKEYS`, re-renders, and toasts "<name> is revoked. <principal> loses access at its next call; runs it started keep their records."
3. The mockup writes `api_key.revoked` to `AUDIT` and drops the row. The build writes `api.key.revoke` and keeps the key listed as revoked, so its history stays readable.

### States
On a phone the dialog rises as a bottom sheet.
