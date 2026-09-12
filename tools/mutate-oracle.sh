#!/bin/bash
# Negative test for tools/audit-oracle.mjs.
#
# A guard that only ever prints OK is worthless. This reverts one fix at a time
# in a throwaway copy of consolidated.html and checks that the oracle actually
# fails. MISSED means the oracle has an assertion that cannot catch its own
# defect — fix the assertion, not the mutation. SKIP means the pattern has
# drifted away from the source, so that fix is silently no longer tested;
# treat it as a failure too.
#
# Escape `@` in the perl patterns (\@) — unescaped, perl reads it as the start
# of an array interpolation and the pattern never matches.
#
# Run:  PW_EXE="<chromium binary>" bash tools/mutate-oracle.sh
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/consolidated.html"
ORACLE="$ROOT/tools/audit-oracle.mjs"
TMP="${TMPDIR:-/tmp}/mutate-oracle.$$"
mkdir -p "$TMP"
trap 'rm -rf "$TMP"' EXIT

missed=0 caught=0 skipped=0

# Each mutation launches a browser, so the full sweep is long and memory-hungry.
# Pass a space-separated list of leading numbers to run a subset:
#   bash tools/mutate-oracle.sh "46 47 48"
ONLY="${1:-}"

run_mut () {
  local name="$1"; shift
  if [ -n "$ONLY" ]; then
    local num="${name%% *}"
    case " $ONLY " in *" $num "*) ;; *) return ;; esac
  fi
  cp "$SRC" "$TMP/m.html"
  perl -0pi -e "$1" "$TMP/m.html"
  if cmp -s "$SRC" "$TMP/m.html"; then
    echo "SKIP    $name — mutation did not apply, its pattern has drifted"
    skipped=$((skipped+1)); return
  fi
  local out n rc
  out=$(TARGET="file://$TMP/m.html" node "$ORACLE" 2>&1); rc=$?
  n=$(printf '%s\n' "$out" | grep -c '^FAIL')
  if [ "$n" -gt 0 ] || [ "$rc" -gt 1 ]; then
    echo "CAUGHT  $name  ($n assertions)"
    printf '%s\n' "$out" | grep '^FAIL' | head -2 | sed 's/^/          /'
    caught=$((caught+1))
  else
    echo "MISSED  $name — the oracle still passed with the fix reverted"
    missed=$((missed+1))
  fi
}

# ── first round: the original 44 findings ───────────────────────────────────
run_mut "01 remove [hidden]{display:none!important}" \
  's/\[hidden\]\{display:none!important\}//'
run_mut "06 let the Runs note compare a figure to itself" \
  's/\$\{rows\.length\} of \$\{int\(WS\.runsMTD\)\} this month/\${rows.length} of \${rows.length}/'
run_mut "07 hard-code the live-runs tile" \
  's/\["Runs live", liveRuns\(\)\.length,/["Runs live", 6,/'
run_mut "18 charge only the run meter" \
  's/\["Charges to date", money\(CHARGES\)/["Charges to date", money(RUN_CHARGE)/'
run_mut "21 count one class group under two connectors" \
  's/groups:\["github"\]/groups:["github","linear"]/'
run_mut "25 take the handler off the org switcher" \
  's/ data-act="switch-org"//'
run_mut "26 send every run row to the same run" \
  's/<a class="mono rowlink" href="#\/run\/\$\{esc\(r\.id\)\}">/<a class="mono rowlink" href="#\/run">/'
run_mut "27 leave a frame with no detail" \
  's/\bkv:\[\s*\["Sent to", who\]/kvGone:[["Sent to", who]/'
run_mut "28 write the approval receipt to the DOM only" \
  's/a\.resolved = \{granted, receipt: mintReceipt\(\)\};/;/'
run_mut "29 hard-code the receipt id" \
  's/receipt: mintReceipt\(\)/receipt: "rcp_01K6R41D"/'
run_mut "32 drop the double-click guard on stubs" \
  's/if\(!b \|\| b\.dataset\.stub\) return;/if(!b) return;/'
run_mut "34 move the container query back onto .frame" \
  's/\.canvas\{container-type:inline-size;container-name:canvas\}//'
run_mut "35 bring back the retired record kind" \
  's/kind:"rule", before:84\.1/kind:"directive", before:84.1/'
run_mut "41 give org pages the workspace denial copy" \
  's/SCOPE\[S\.page\] === "ws"/true/g'
run_mut "43 drop aria-controls from the tabs" \
  's/aria-controls="panel-\$\{key\}"//'
run_mut "44 restore the failing --dim" \
  's/--dim:#6D675C/--dim:#948E83/'

# ── second round: what the independent re-audits found ──────────────────────
run_mut "45 take the link out of the run row" \
  's/<a class="mono rowlink" href="#\/run\/\$\{esc\(r\.id\)\}">\$\{esc\(r\.id\)\}<\/a>/\${esc(r.id)}/'
run_mut "46 stop announcing the approval" \
  's/say\(`\$\{granted \? "Approved" : "Denied"\}/0 \&\& (`\${granted ? "Approved" : "Denied"}/'
run_mut "47 let the re-render eat the focus" \
  's/if\(key\) \(v\.querySelector\(key\).*$//m'
run_mut "48 let the phone simulator leak its overlays" \
  's/body\[data-w="phone"\] \.rail,\nbody\[data-w="phone"\] \.asst,\nbody\[data-w="phone"\] \.scrim\{position:absolute\}//'
run_mut "49 scope a finding above what its agent spends" \
  's/scope:"acme\.core\.release-manager", at:291\.44/scope:"acme.core.release-manager", at:1842.16/'
run_mut "50 type the turn label instead of deriving it" \
  's/d:`claude-fable-5-1 · turn \$\{t\.i\} · \$\{t\.what\.toLowerCase\(\)\}`/d:`claude-fable-5-1 · turn 3 · \${t.what.toLowerCase()}`/'
run_mut "51 break the ULID ordering" \
  's/\{id:"run_01K6QW2A8C"/{id:"run_01K6QXZ9Z9"/'
run_mut "52 give every empty state the same run-shaped copy" \
  's/ontology:\["No model in force yet", "The ontology fills from connectors, not from runs\. Connect a source and the classes it resolves appear here\.", "connect", "Connect a source"\]/ontology:["Nothing here yet", "The first run appears here the moment its first frame arrives.", "wrap", "Wrap an agent"]/'
run_mut "53 leave the shell identity behind in the denied state" \
  's/\$\("#acctName"\)\.textContent = v\.name;//'
run_mut "54 take the scrollbar off the rail" \
  's/height:100vh;overflow-y:auto\}/height:100vh}/'
run_mut "56 put a link back inside each listbox option" \
  's/>\$\{esc\(c\[0\]\)\}<span class="k" aria-hidden="true">↵<\/span><\/li>/><a href="\${c[1]}">\${esc(c[0])}<\/a><span class="k" aria-hidden="true">↵<\/span><\/li>/'
run_mut "57 drop a class the version history says was added" \
  's/\{n:"WarrantyClaim", c:148, g:"sales_crm"\},//'
run_mut "58 dress every table row as navigable" \
  's/tbody tr\[data-go\]:hover td/tbody tr:hover td/'
run_mut "60 leave the approved run parked" \
  's/run\.state = "live";//'
run_mut "61 let the chrome open over the primary action" \
  's/if\(innerWidth < 700\) S\.chrome = false;//'
# NOTE: `$(` in a replacement is perl's GID variable and interpolates, which
# turns the mutant into a syntax error instead of the defect you meant — escape
# it as \$( . The same trap as an unescaped `@` in a pattern.
run_mut "62 stop inerting what the drawer covers" \
  's/  \$\("#main"\)\.inert = true;\n(  \$\("\.navsec a"\)\.focus\(\);)/$1/'

# ── the feedback items built after the audit closed ─────────────────────────
run_mut "63 take the handler off the cost basis" \
  's/<button class="rc-b" data-act="cost-basis">/<button class="rc-b" data-act="nope">/'
run_mut "63b shrink the run total back to body size" \
  's/\.rc-n\{font-size:38px/.rc-n{font-size:14px/'
run_mut "64 open the prompt on page load" \
  's/<details class="more"><summary>/<details class="more" open><summary>/'
run_mut "65 break an operator subtotal by a cent" \
  's/runs:704,  spend:4918\.02/runs:704,  spend:4918.03/'
run_mut "66 stop marking the generated run name" \
  's/<span class="gen" title="written by the classifier, not by a person">auto<\/span>//'

# ── the tool grammar and the Agent IAM surface ──────────────────────────────
run_mut "67 put the sidebar label back to just Agents" \
  's/<\/svg>Agents &amp; IAM<\/a>/<\/svg>Agents<\/a>/'
run_mut "68 send every agent row to the same agent" \
  's/<a class="rowlink" href="#\/agents\/\$\{esc\(a\.slug\)\}">/<a class="rowlink" href="#\/agents\/release-manager">/'
run_mut "69 drop the invoking person from the intersection" \
  's/\.concat\(\[\[a\.operator, "the person invoking it · " \+ a\.opRole\]\]\)/.concat([])/'
run_mut "70 give an agent a belt it holds no role for" \
  's/  "acme\.core\.docs-writer":\[\],/  "acme.core.docs-writer":[{id:"repo.search\@2", dec:"allow", rule:"grant:none"}],/'
run_mut "71 lose a tool from both the belt and the hidden list" \
  's/return TOOLS\.filter\(t => !on\.has\(t\.id\)\)\.map\(t => \(\{\.\.\.t,/return TOOLS.filter(t => !on.has(t.id)).slice(1).map(t => ({...t,/'
run_mut "72 shorten the denial so it stops showing its reasoning" \
  's/      \["Financial class", `<span class="mono">moves_funds<\/span>, read from the tool version.s declared amount path`\],\n//'
run_mut "73 stop making an agent tab a place you can link to" \
  's/    location\.hash = `#\/agents\/\$\{S\.agentSlug\}\/\$\{t\.dataset\.val\}`;\n    return;/    S.agentTab = t.dataset.val; render(); return;/'
run_mut "74 take the dashed border off the gates that stop for a person" \
  's/\.gt\.g-require_approval,\.gt\.g-mandate\{color:var\(--wait\);border-style:dashed;/.gt.g-require_approval,.gt.g-mandate{color:var(--wait);/'

echo
echo "caught $caught · missed $missed · skipped $skipped"
[ "$missed" -eq 0 ] && [ "$skipped" -eq 0 ]
