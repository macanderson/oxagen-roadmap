# Organization: Roles

## Roles

Every role in the organization: what it grants, who holds it, and where it came from.

### Purpose
The panel answers two questions an admin asks before a grant goes out: what can a holder of this role do, and who holds it now. It is also where custom roles are created, edited, duplicated and deleted. Click a row, or **View** or **Edit**, to open the role editor. **Create role** opens it empty.

### Rationale
An agent can only do what four things all allow: its roles, its operator's permissions, the policy, and the kill switches. Roles are the first of the four, so they get a list of their own with the holder count beside each. Org roles, workspace roles and agent roles come from one grant table, not from a second system (§5.1). Custom roles are on for every tier, because no feature is gated on the enterprise license (2026-09-15, maintainer decision). A built-in role is read-only, so the path to a variant is **Duplicate**. A role's name is immutable, so duplicating is also how you rename one. `org.*` is the only wildcard, and only `org.owner` carries it. The Held by column replaced a Roles in use panel that sat under People.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Role, description, kind, scope | `ROLES` | `iam.roles` through `iam.role.list` | live |
| Permissions | `ROLES[].perms`, chips from `permChips()` | `iam.roles` | live |
| Held by | `roleAssignees()` over `MEMBERS`, `S.agentRoles` and `APIKEYS` | `iam.roles` assignments, `org.org_users` | partial |
| Origin | `builtin`, `by`, `at` | `iam.roles` | live |
| Permission catalog | `PERMS` | none, pending a spec decision | not built |

### Logic
1. `rolesBody()` renders one row per role in `ROLES`, in fixture order: seven built-in and three custom.
2. Role shows the id and its description. Kind is a badge from `roleKindBadge()`: `agent` green, `service` amber, `human` neutral. Scope reads organization, workspace or repository.
3. Permissions shows the first four chips and "+N more" past four.
4. Held by counts three kinds of holder in `roleAssignees()`. People are `MEMBERS` whose role starts with the id. Agents are entries in `S.agentRoles` that hold the role, counting a repository-scoped assignment such as `agent.repo.write(a-intel/platform)` by its base. Keys are `APIKEYS` whose grants include the id or whose principal equals it. The cell reads "N people · N agents · N keys", or "Not assigned".
5. Keys carry permissions such as `cost.read`, and principals are named `svc_*`, so no key matches a role id. The keys count reads 0 on every row. The build counts the service principals that hold the role.
6. Origin reads "built-in", or who created the role and when.
7. A built-in row offers **View** and **Duplicate**. A custom row offers **Edit**, **Duplicate** and **Delete**. **Delete** is disabled while anyone holds the role, with the tooltip "Reassign N holders first".
8. **Duplicate** calls `roleDup()`, which opens the editor on a copy named `<id>.copy`.
9. The Kind, Scope, Origin and Rows filters come from the shared table controls.
10. **Create role** is a plain small button. **Create a workspace** in the header is the one gold action on the screen.

### States
Loading, error, denied and empty belong to the Organization page: the header and tab bar share the family's section. On a phone each role row becomes a card with every cell labelled by its column.

## Role editor {#dialog/roleedit}
<!-- open: roleNew() -->

The dialog that creates, edits or shows one role: its name, kind, scope and permission matrix.

### Purpose
It opens three ways. **Create role** opens it empty. **Edit** on a custom role opens it for change. **View** on a built-in role opens it read-only, with **Duplicate as custom** as the way forward. It answers exactly which permissions a role carries, and what saving will change for the people, agents and keys that hold it.

### Rationale
Saving a role is a governed action: it passes IAM and writes an audit record with your name. It is recorded and not billed, because `resolve_approval` is the only billable governed action (§12.1). A change reaches each holder at its next call, and nothing in flight is cut. That is why the editor names the holder count before you save. A role can never grant more than the delegation ceiling of the person assigning it. `org.*` is the only wildcard, and only `org.owner` carries it.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Role name, description, kind, scope | `S.roleEdit`, from `ROLES` | `iam.roles` | live |
| Permission matrix | `PERMS`, 31 permissions in 7 groups | not in App. A | not built |
| Holders | `roleAssignees(d.orig)` | `iam.roles` assignments | partial |
| Writes | `roleSave()` | `iam.role.create`, `iam.role.edit` | partial |

### Logic
1. `roleNew()` starts a draft of kind `agent` and scope `workspace` with no permissions. `roleOpen(id)` loads a role. `roleDup(id)` loads a copy named `<id>.copy`. Each sets `S.roleEdit` and opens `roleedit`.
2. `roleEditDlg()` titles the dialog "Create a role", "Edit role" or "Built-in role", with the role id under it when it exists.
3. The name is editable only on a new role. Its hint asks for the kind as the prefix: `agent.`, `org.`, `workspace.` or `svc.`. On an existing role the hint reads "Names are immutable; duplicate the role to rename it."
4. Kind limits who can hold the role. An agent role can be assigned only to agents. Scope sets where it applies. A repository-scoped role names its repo at assignment.
5. The matrix groups `PERMS` into Runs, Agents, Tools and policy, Repository, Graph and steering, Money, and Audit. Each checkbox calls `rolePerm()`, which updates the selected count in place.
6. A held role shows the banner "Held by N principals. Saving changes their effective permission at the next call."
7. **Create role** or **Save changes** calls `roleSave()`. It lowercases the name and turns any other character into a dot. An empty name toasts "A role needs a name." No permission toasts "A role with no permissions grants nothing. Pick at least one." A new name already taken toasts "A role named <id> already exists."
8. A new role is pushed to `ROLES` and toasts "Role <id> created and recorded in Audit with your name." An edit rewrites the description, kind, scope and permissions and toasts "Role <id> updated. Each holder gets the new permissions at its next call."
9. A new role writes `role.created` and an edit writes `role.updated` to `AUDIT`, both with the signed-in person (`me()`), who is also the new role's Origin. The build calls `iam.role.create` or `iam.role.edit` and writes the same event.
10. The mockup lets anyone tick `org.*`, and lets a held role change kind. The build refuses `org.*` outside `org.owner`, refuses a permission above the saver's delegation ceiling, and refuses a kind change while the role is held.

### States
A built-in role renders every field read-only, with the badge "built-in · read-only" and a **Close** button in place of **Cancel**. The dialog is wide on a desktop and a bottom sheet on a phone.

## Delete a role {#dialog/roledel}
<!-- open: openDialog('roledel','svc.ci') -->

The confirmation that deletes one custom role, refused while anyone holds it.

### Purpose
You open it with **Delete** on a custom role's row. It says what deleting does and whether anyone still holds the role.

### Rationale
Deleting removes the role from IAM. Its definition and every grant it carried stay in the audit record, so the history of who could do what survives the delete. A role cannot be deleted out from under a holder, because the holder would lose access with no record of a decision about them. So the dialog sends you to reassign first. Deleting is a governed action and is recorded.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Role | `roleById(S.dlgArg)` | `iam.roles` | live |
| Holders | `roleAssignees(id)` | `iam.roles` assignments | partial |

### Logic
1. `roleDelDlg()` titles the dialog "Delete role" with the role id under it.
2. The body reads "This removes <id> from IAM."
3. With holders, a warning reads "Held by N principals. Reassign them first." and **Delete role** is disabled.
4. With none, a note reads "Nobody holds it." and **Delete role** calls `roleDeleteConfirm(id)`. It removes the role from `ROLES` and toasts "Role <id> deleted. The audit record keeps its definition and every grant it ever carried."
5. A built-in role has no **Delete**. In the fixture only `svc.ci` has no holder, so it is the one role you can delete.
6. The mockup writes `role.deleted` to `AUDIT`. The build calls `iam.role.delete` and writes the event with the definition.

### States
With no role, the dialog reads "Delete role" with an empty body. On a phone it rises as a bottom sheet.
