#!/bin/bash
# Negative test for tools/verify-data.js.
#
# Same contract as tools/mutate-oracle.sh: break one invariant at a time in a
# throwaway copy and require the guard to notice. No browser, so this is fast —
# run it every time either file changes.
#
# Note: escape `@` in the perl patterns (\@). Unescaped, perl treats it as the
# start of an array interpolation, the pattern never matches, and the mutation
# reports SKIP — a silent hole rather than a failure.
#
# Run:  bash tools/mutate-data.sh
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/consolidated.html"
GUARD="$ROOT/tools/verify-data.js"
TMP="${TMPDIR:-/tmp}/mutate-data.$$"
mkdir -p "$TMP"
trap 'rm -rf "$TMP"' EXIT

missed=0 caught=0 skipped=0

run () {
  cp "$SRC" "$TMP/m.html"
  perl -0pi -e "$2" "$TMP/m.html"
  if cmp -s "$SRC" "$TMP/m.html"; then
    echo "SKIP    $1 — pattern has drifted, this invariant is no longer being tested"
    skipped=$((skipped+1)); return
  fi
  local out rc
  out=$(TARGET="$TMP/m.html" node "$GUARD" 2>&1); rc=$?
  # A crash is a detection too, but a silent one — count it, and treat the
  # guard's own inability to report it as something to fix.
  if printf '%s' "$out" | grep -q '^FAIL' || [ "$rc" -ne 0 ]; then
    echo "CAUGHT  $1"
    printf '%s\n' "$out" | grep '^FAIL' | head -2 | sed 's/^/          /'
    caught=$((caught+1))
  else
    echo "MISSED  $1 — $(printf '%s' "$out" | tail -1)"
    missed=$((missed+1))
  fi
}

run "org agent total stops being derived" \
  's/const ORG_AGENTS = WS\.agents \+ WS2\.agents;/const ORG_AGENTS = 50;\nWS.agents = 5;/'
run "charges drop a meter their basis cites" \
  's/const CHARGES    = RUN_CHARGE \+ ARCHIVE;/const CHARGES = RUN_CHARGE;/'
run "one class group counted under two connectors" \
  's/groups:\["github"\]/groups:["github","linear"]/'
run "a retired record kind returns" \
  's/kind:"rule", before:84\.1/kind:"directive", before:84.1/'
run "a frame index lands past the seal" \
  's/F\.stop\(runFrames\(r\) - 1, r\)/F.stop(runFrames(r), r)/'
run "a finding scoped to an agent that spent nothing" \
  's/scope:"acme\.core\.stella-ci",       at:555\.19/scope:"acme.core.docs-writer",     at:555.19/'
run "an approval points at a run that is not parked" \
  's/run:"run_01K6QXD4M9"/run:"run_01K6QXF6N2"/'
run "the proposed record is already published" \
  's/id:"ctx\.core\.no-plaintext-secrets-in-ci-logs"/id:"ctx.core.no-secrets-in-workflow-inputs"/'
run "90 days holds fewer runs than 11 days" \
  's/proven90:9612, witnessed90:10998/proven90:806, witnessed90:1066/'
run "a tool identity loses its schema version" \
  's/\{id:"bash\@1",/{id:"bash",/'
run "an approval names a tool that is not gated" \
  's/tool:"bash\@1", args:"rm -rf node_modules"/tool:"linear__get_issue\@2", args:"rm -rf node_modules"/'
run "the simulation outcomes stop partitioning the calls" \
  's/SIM\.unchanged = SIM\.calls - SIM\.deny - SIM\.ask;/SIM.unchanged = 65060; SIM.calls = 67000;/'
run "the mandate reserves more than its authority" \
  's/authority:60000\.00, settled:31280\.00/authority:40000.00, settled:31280.00/'
run "a live run is given an end time" \
  's/step:"turn 3 · tool call", started:"2026-09-11 13:52:19Z", ended:null/step:"turn 3 · tool call", started:"2026-09-11 13:52:19Z", ended:"2026-09-11 14:00:00Z"/'

# ── invariants added after the independent re-audits ────────────────────────
run "a finding claims more than its agent spends" \
  's/scope:"acme\.core\.release-manager", at:291\.44/scope:"acme.core.release-manager", at:1842.16/'
run "the 30-day window exceeds the months it spans" \
  's/WS\.spend30d = Math\.round\(\(19 \/ 31 \* WS\.augLedger \+ WS\.spendMTD\) \* 100\) \/ 100;/WS.spend30d = 50188.34;/'
run "the agent sample is relabelled as the top five" \
  's/· one of each state and tier ·/· by spend ·/'
run "a run id sorts against its own start time" \
  's/\{id:"run_01K6QW2A8C"/{id:"run_01K6QXZ9Z9"/'
run "a turn label is typed instead of derived" \
  's/d:`claude-fable-5-1 · turn \$\{t\.i\} · \$\{t\.what\.toLowerCase\(\)\}`/d:`claude-fable-5-1 · turn 3 · \${t.what.toLowerCase()}`/'
run "an agent loses its belt size" \
  's/"acme\.core\.fleet-ops-bot":6,//'
run "a class named in the version history goes missing" \
  's/\{n:"WarrantyClaim", c:148, g:"sales_crm"\},//'
run "the registry stops being ordered by consequence" \
  's/\{id:"repo\.search\@2",                server:"builtin",cls:"read_only",    gate:"allowed",        calls:12880\},\n  \{id:"linear__get_issue\@2",          server:"linear", cls:"read_only",    gate:"allowed",        calls:3914\},\n  \{id:"bash\@1",                       server:"harness",cls:"irreversible", gate:"needs approval", calls:6102\},/{id:"bash\@1",                       server:"harness",cls:"irreversible", gate:"needs approval", calls:6102},\n  {id:"repo.search\@2",                server:"builtin",cls:"read_only",    gate:"allowed",        calls:12880},\n  {id:"linear__get_issue\@2",          server:"linear", cls:"read_only",    gate:"allowed",        calls:3914},/'
run "two versions claim to be active" \
  's/\["v13", "Split <span class=\\"mono\\">Site<\/span> into DeploymentSite and Depot", "PR #1098 · 2026-08-21 · Marcus Bell", false\]/["v13", "Split <span class=\\"mono\\">Site<\/span> into DeploymentSite and Depot", "PR #1098 · 2026-08-21 · Marcus Bell", true]/'

# ── the feedback items built after the audit closed ─────────────────────────
run "an operator subtotal drifts from the workspace spend" \
  's/runs:704,  spend:4918\.02/runs:704,  spend:4918.03/'
run "an operator run count drifts from the workspace run count" \
  's/\{name:"Priya Natarajan", role:"org billing",     runs:358,/{name:"Priya Natarajan", role:"org billing",     runs:359,/'
run "an operator proves more runs than they ran" \
  's/runs:358,  spend:2284\.72,  proven:146/runs:358,  spend:2284.72,  proven:1460/'
run "a run loses its classifier summary" \
  's/  run_01K6QXK9R6:"Read the Halvorsen deployment sites and is staging firmware 4\.2 across the fleet it found\."//'
run "a summary is written for a run that does not exist" \
  's/const SUMMARY = \{/const SUMMARY = {\n  run_01K6QZZZZZ:"A summary for a run that is not in the table, which nothing would ever show.",/'
run "the prompt stops carrying the records in force" \
  's/  \$\{RECORDS\.map\(x => "· " \+ x\.s\)\.join\("\\n  "\)\}//'

# ── the contrast guard, same contract ───────────────────────────────────────
runc () {
  cp "$SRC" "$TMP/m.html"
  perl -0pi -e "$2" "$TMP/m.html"
  if cmp -s "$SRC" "$TMP/m.html"; then
    echo "SKIP    $1 — pattern has drifted"; skipped=$((skipped+1)); return
  fi
  local out rc
  out=$(TARGET="$TMP/m.html" node "$ROOT/tools/verify-contrast.js" 2>&1); rc=$?
  if printf '%s' "$out" | grep -q '^FAIL' || [ "$rc" -ne 0 ]; then
    echo "CAUGHT  $1"
    printf '%s\n' "$out" | grep '^FAIL' | head -2 | sed 's/^/          /'
    caught=$((caught+1))
  else
    echo "MISSED  $1 — $(printf '%s' "$out" | tail -1)"; missed=$((missed+1))
  fi
}

runc "contrast: a failing --dim returns" \
  's/--fg:#10100F; --body:#2A2823; --muted:#5F5B54; --dim:#6D675C;/--fg:#10100F; --body:#2A2823; --muted:#5F5B54; --dim:#948E83;/'
runc "contrast: the row-hover ground darkens under light text" \
  's/--ink:#F2EEE5; --panel:#F8F5EE; --panel-2:#FFFDF8; --hl:#EDE7DA;/--ink:#F2EEE5; --panel:#F8F5EE; --panel-2:#FFFDF8; --hl:#8A8578;/'
runc "contrast: a state wash gets too strong for its own text" \
  's/--crit:#AD271F;    --crit-wash:rgba\(173,39,31,\.12\)/--crit:#AD271F;    --crit-wash:rgba(173,39,31,.55)/'
runc "contrast: the two dark paths drift apart" \
  's/:root\[data-theme="dark"\]\{\n  --ink:#10100F; --panel:#181715; --panel-2:#1D1C19; --hl:#201F1C;/:root[data-theme="dark"]{\n  --ink:#10100F; --panel:#191816; --panel-2:#1D1C19; --hl:#201F1C;/'
runc "contrast: the primary button loses its ink" \
  's/--gold-ink:#10100F; --gold-solid:#D6962C;\n  --gold-wash:rgba\(130,85,17,\.10\)/--gold-ink:#C9BCA6; --gold-solid:#D6962C;\n  --gold-wash:rgba(130,85,17,.10)/'

echo
echo "caught $caught · missed $missed · skipped $skipped"
[ "$missed" -eq 0 ] && [ "$skipped" -eq 0 ]
