# Fleet operations deletion list

| | |
|---|---|
| **Status** | Draft for review. Updated as the mockup change lands |
| **Date** | 2026-09-24 |
| **Owner** | Mac Anderson |
| **Design authority** | `fleet-operations-wedge.md` |

This list has two halves. The first is what this change deletes or merges in this repository: surfaces in the mockup, page specs, stories, fixtures and scenarios. The second is what the app build deletes or merges in `macanderson/oxagen` when a lane builds the wedge. Check `DEREGISTERED.md` in that repository before deleting a feature's files there.

## Surfaces

| Surface | Action | Into |
|---|---|---|
| Fleet page | Delete | Work (the waiting count, live work), Agents (the population, Steer, Register agent), each work order's runs |
| Tasks page | Rename | Work |
| Tasks tabs Providers, Fields, People | Merge | The Intake dialog on Backlog |
| Spend › Findings | Move | Work › Findings |
| Skills console: Catalog, Search, In the loop, Reflection, Versions | Delete | Skills are Steering Sources. Search is the Compiler. The interjection stays in the Approvals drawer |
| Skill reflection | Delete | Nothing |
| Skill source page | Merge | The skill's Steering source page |
| Mandate page | Delete | Agent › Permissions › Delegation |
| Fork replay, Bisect, the frame player transport, the transcript playback, replay grades | Delete | Nothing. The chain and seal stay under Evidence |
| Run tabs Issues, Governed actions, Policy, Context, Chain and seal | Merge | Decision trace and Evidence |
| Steering Library and its shelves | Merge | Sources, with a kind filter |
| Steering › Memory and Steering › Ontology | Merge | Source kinds `memory` and `glossary` on Sources. Promotion is a proposal |
| Steering › Gates | Move | Tools › Policy, and constraint frames on Sources |
| Context record page | Rename | Steering source page, kind `record` |
| Spend tabs Tokens, Coaching, By operator, By agent, By model, By tool, Wasted spend | Merge | Overview (grouping) and Optimization |
| Spend drill pages | Delete | The Overview side panel |
| Operator coaching severity and ranking | Delete | Operator habits as rules to adopt, with no rank |
| Agent › Definition in git | Merge | The agent source page |

## Page specs, stories and scenarios

Filled in with the file lists when the mockup change lands.

## In the app

Filled in with the lane's list when the mockup change lands.
