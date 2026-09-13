#!/usr/bin/env python3
"""Put the runMetrics(R) Run-page instruments onto an mc.html base.

    python3 tools/baseline/apply-run-metrics.py mc.html [dest]

The instruments were built in the un-versioned Specs/mockups/mc.html scratch copy
and never reached a branch. run-metrics.css and run-metrics.js are that work, cut
out verbatim except for one rename (see run-metrics.js: dur(ms) -> msDur(ms)).
This script is the port, so that when main moves the baseline is rebuilt by
re-running it on main's mc.html rather than by merging hunks.

Every splice asserts it matches exactly once; the script refuses a base that
already has runMetrics or lacks what the fragments call.
"""
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1]
dest = sys.argv[2] if len(sys.argv) > 2 else src
s = open(src).read()
before = s

assert "function runMetrics(" not in s, "base already has runMetrics; nothing to port"
for need in ["function runSeries(", "function runTimeline(R){", "function runInstruments(R){", "function tipAttr(",
             "function deltaHtml(", "function toolMeta(", "function catSvg(", "function runGraphOf(", "function diffStat(",
             "function txDiffRows(", "function tokn(", "function per(", "var TCAT_ORDER", "var TCAT="]:
    assert s.count(need) >= 1, "base is missing " + need


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, "expected one match, found %d: %r" % (n, old[:80])
    s = s.replace(old, new)


# --- CSS -------------------------------------------------------------------------
# the legend is used outside a tile now (the prompt and calls panels), so it loses its .inst scope
rep(".inst .leg{display:flex;gap:10px;flex-wrap:wrap;font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums}\n",
    ".leg,.inst .leg{display:flex;gap:10px;flex-wrap:wrap;font-size:10.5px;color:var(--muted);font-variant-numeric:tabular-nums}\n"
    ".leg span,.inst .leg span{display:inline-flex;align-items:center;gap:5px}\n"
    ".leg i,.inst .leg i{width:9px;height:9px;border-radius:2px;flex:none}\n"
    ".leg b,.inst .leg b{color:var(--fg);font-weight:600}\n")
# the productive-ratio stack carries a 30-day reference tick that must overhang the bar
rep(".stk{display:flex;gap:2px;height:8px;border-radius:4px;overflow:hidden}\n",
    ".stk{display:flex;gap:2px;height:8px;border-radius:4px;position:relative;margin-top:4px}\n"
    ".stk .ref{position:absolute;top:-4px;bottom:-4px;width:2px;background:var(--fg);border-left:1px solid var(--panel);border-right:1px solid var(--panel);margin-left:-2px}\n")
css = open(os.path.join(HERE, "run-metrics.css")).read()
i = s.index("</style>")
assert s.count(".fams{") == 0
s = s[:i] + css + s[i:]

# --- JS --------------------------------------------------------------------------
js = open(os.path.join(HERE, "run-metrics.js")).read()
a = s.index("function runInstruments(R){")
b = s.index("\nfunction runTimeline(R){", a) + 1
assert s.count("function runInstruments(R){") == 1
s = s[:a] + js + s[b:]

rep("var strip=runInstruments(R)+runTimeline(R);", "var strip=runInstruments(R)+promptRow(R)+runTimeline(R);")
rep("bodyHtml=costTab(R);", "bodyHtml=callsPanel(R)+costTab(R);")

# Files changed: the diffstat in the header comes off the same derivation
rep("  var g=runGraphOf(R),inf=0,obs=0;\n", "  var g=runGraphOf(R),inf=0,obs=0,dm=runMetrics(R);\n")
rep("""<h3>Files changed</h3><span class="b b-q" style="margin-left:auto">'+g.files.length+' file'+(g.files.length===1?'':'s')+' · as the harness reported them</span>""",
    """<h3>Files changed</h3><span class="dsum"><b class="a" style="color:var(--st-allowed)">+'+dm.add+'</b> <b class="d" style="color:var(--st-denied)">\\u2212'+dm.del+'</b><span class="dbar" aria-hidden="true"><i class="a" style="flex:'+dm.add+'"></i><i class="d" style="flex:'+dm.del+'"></i></span>\\u00b7 '+g.files.length+' file'+(g.files.length===1?'':'s')+' \\u00b7 as the harness reported them</span>""")

# --- timeline: turn labels and marks get rows of their own ----------------------------
# Same scratch session. On main the "turn 2 · after steer" band label is drawn inside the
# track, on top of the steer and parked-approval marks. Main's newer mark condition
# (approval_request frames) is kept; only where the label and the marks sit changes.
rep(".rt-band .t{position:absolute;left:8px;top:4px;font-family:var(--mono);font-size:10px;color:var(--dim);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}\n", "")
rep(".rt-mark{position:absolute;top:-2px;transform:translateX(-50%);font-family:var(--mono);font-size:10px;color:var(--muted);white-space:nowrap;background:var(--panel);padding:0 4px;border-radius:4px;pointer-events:none}\n",
    ".rt-mark{position:absolute;top:0;transform:translateX(-50%);font-family:var(--mono);font-size:10px;color:var(--muted);white-space:nowrap;pointer-events:none}\n")
rep(".rt-track{position:relative;height:58px;margin:8px 0 2px}\n",
    ".rt-track{position:relative;height:50px;margin:2px 0 0}\n"
    ".rt-turns{position:relative;height:16px;font-family:var(--mono);font-size:10px;color:var(--dim);letter-spacing:.06em;text-transform:uppercase}\n"
    ".rt-turns span{position:absolute;top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-left:2px;box-sizing:border-box}\n"
    ".rt-marks{position:relative;height:14px;margin-top:3px}\n"
    "#viewport.phone .rt-marks{display:none}\n")
rep("""'%;width:'+(r-l).toFixed(2)+'%"><span class="t">turn '+(k+1)+(k?' · after steer':'')+'</span></div>';}).join("");\n""",
    """'%;width:'+(r-l).toFixed(2)+'%"></div>';}).join("");\n"""
    """  var turns=bounds.map(function(b,k){var l=Math.max(0,xs[b]-1.2),r=k+1<bounds.length?xs[bounds[k+1]]-1.2:100,w=r-l;\n"""
    """    return '<span style="left:'+l.toFixed(2)+'%;width:'+w.toFixed(2)+'%">'+(w<14?'t'+(k+1):'turn '+(k+1)+(k?' · after steer':''))+'</span>';}).join("");\n""")
rep("""'<div class="panel-b"><div class="rt-track">'+bands+marks+ticks+'<div class="rt-axis">""",
    """'<div class="panel-b"><div class="rt-turns">'+turns+'</div><div class="rt-track">'+bands+ticks+'<div class="rt-axis">""")
# One parked call is two adjacent frames (policy_decision "approve", then approval_request);
# main labelled both, so "parked · approval" was printed twice on the same spot. Label the run
# of parking frames once; both ticks stay tall.
rep("""  var marks="",ticks=fr.map(function(f,i){\n""", """  var marks="",parkedAt=-2,ticks=fr.map(function(f,i){\n""")
rep("""    if(f.kind==="approval_request"||(f.kind==="policy_decision"&&/approve/.test(f.sum)))marks+='<span class="rt-mark right" style="left:'+xs[i].toFixed(2)+'%">parked · approval</span>';\n""",
    """    if(f.kind==="approval_request"||(f.kind==="policy_decision"&&/approve/.test(f.sum))){if(i-parkedAt>1)marks+='<span class="rt-mark right" style="left:'+xs[i].toFixed(2)+'%">parked · approval</span>';parkedAt=i;}\n""")
i = s.index("function runTimeline(R){")
j = s.index("\nfunction ", i + 10)
seg = s[i:j]
old_tail = """(R.status==="live"?' · live':'')+'</span></div></div>'+"""
assert seg.count(old_tail) == 1, "runTimeline axis tail moved"
s = s[:i] + seg.replace(old_tail, """(R.status==="live"?' · live':'')+'</span></div></div><div class="rt-marks">'+marks+'</div>'+""") + s[j:]

# --- checks ----------------------------------------------------------------------
names = re.findall(r'^function ([A-Za-z_$][\w$]*)', s, re.M)
dupes = sorted({n for n in names if names.count(n) > 1})
assert not dupes, "duplicate top-level functions (the later one silently wins): %s" % dupes
assert not re.search(r'^(<<<<<<<|>>>>>>>) ', s, re.M)
blocks = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', s, re.S)
with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as t:
    t.write("\n;\n".join(blocks))
subprocess.run(["node", "--check", t.name], check=True)
os.unlink(t.name)

assert open(src).read() == before, "base changed while the port ran; re-run"
open(dest, "w").write(s)
print("ported runMetrics into %s: %+d lines" % (dest, s.count("\n") - before.count("\n")))
