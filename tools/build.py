"""Re-apply the a-intel rename and the volume block to a base mc.html.

    python3 tools/build.py "$(git show main:mc.html > /tmp/base.html; echo /tmp/base.html)" mc.html

main moves several commits an hour while the mockup jobs run, and this change rewrites
most of mc.html, so it is kept as a transform rather than as a merge: hand it whatever
mc.html is current and it produces the renamed, business-scale version. Every edit
asserts it matched exactly once, so a base that has drifted fails loudly instead of
half-applying. With no argument it reads the Specs scratch copy and refuses a torn read.

tools/volume.js holds the generated dataset and is spliced in verbatim.
"""
import filecmp, shutil, subprocess, sys, time, os

# Base file: argv[1] if given (used to re-apply this transform onto main after other
# branches land), otherwise the canonical Specs copy.
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Documents/Oxagen/Specs/mockups/mc.html')
TMP = os.path.dirname(os.path.abspath(__file__))   # volume.js sits beside this script
DST = sys.argv[2] if len(sys.argv) > 2 else 'mc.html'

# 1. snapshot twice; a cp taken mid-write is torn, and two identical reads rule that out
a, b = f'{TMP}/base.a.html', f'{TMP}/base.b.html'
if len(sys.argv) > 1:
    s = open(SRC).read()
else:
    shutil.copyfile(SRC, a)
    time.sleep(1.5)
    shutil.copyfile(SRC, b)
    if not filecmp.cmp(a, b, shallow=False):
        sys.exit('BASE IS MOVING: two reads of Specs/mockups/mc.html differ. Retry.')
    s = open(a).read()
print('base bytes', len(s))
if 'function govCount' not in s:
    sys.exit('BASE INCOMPLETE: govCount missing — torn read. Retry.')

# 2. tenant rename: Acme Robotics (acme) -> Anderson Intelligence Corp. (a-intel)
import re
s = s.replace('Acme Robotics', 'Anderson Intelligence Corp.')
s = s.replace('kek_acme_', 'kek_aintel_').replace('key_ox_acme_', 'key_ox_aintel_')
s = s.replace('pk_acme_', 'pk_aintel_').replace('cus_acme', 'cus_aintel').replace('acme_prod', 'aintel_prod')
s = s.replace('acme', 'a-intel')
assert 'acme' not in s.lower(), 'rename left a trace'

# 3. the volume block, after every seed array is declared and before the first render
vol = open(f'{TMP}/volume.js').read().strip()
anchor = 'if(!location.hash)location.hash='
assert s.count(anchor) == 1
i = s.index(anchor)
s = s[:i] + vol + '\nseedApprovals();\n\n' + s[i:]

# 4. the copy that quoted fixed organization totals now reads them off the data
def rep(a_, b_, n=1):
    global s
    assert s.count(a_) == n, (s.count(a_), a_[:80])
    s = s.replace(a_, b_)

rep('''<span class="mono dim" style="font-size:10.5px">50 agents · '+ORG.dataPlane+' plane</span>''',
    '''<span class="mono dim" style="font-size:10.5px">'+ic0(ORG.agents)+' agents · '+ORG.dataPlane+' plane</span>''')
rep('''<span class="s">50 across the organization</span>''',
    '''<span class="s">'+ic0(ORG.agents)+' across the organization</span>''')
rep('''<div class="stat"><span class="k">Holding a mandate</span><span class="v">1</span><span class="s">a-intel.finops.invoice-bot · in FinOps</span></div>'+''',
    '''<div class="stat"><span class="k">Holding a mandate</span><span class="v">'+MANDATES.filter(function(m){return m.status==="active";}).length+'</span><span class="s">every one of them in FinOps</span></div>'+''')
rep('''<div class="stat"><span class="k">Tamper incidents</span><span class="v" style="color:var(--st-critical)">1</span><span class="s">a-intel.core.triage · hooks_removed, 2026-09-02</span></div></div>'+''',
    '''<div class="stat"><span class="k">Tamper incidents</span><span class="v" style="color:var(--st-critical)">'+AGENTS.reduce(function(n,a){return n+(a.incidents||0);},0)+'</span><span class="s">across '+AGENTS.filter(function(a){return a.incidents;}).length+' agents · hooks_removed or a moved fingerprint</span></div></div>'+''')
rep('''<p class="muted" style="margin:2px 0 0;font-size:12px">Eight servers, 3,182 tool versions. The registry is the catalog; a belt is what one agent may reach.</p>''',
    '''<p class="muted" style="margin:2px 0 0;font-size:12px">'+SERVERS.length+' servers, '+ic0(TOOLS.length)+' tool versions. The registry is the catalog; a belt is what one agent may reach.</p>''')
rep(""" of 3,182 shown</span>""", """ of '+ic0(TOOLS.length)+' shown</span>""")
rep('''  return auditStats([["Events · 30 days","12,418","every IAM decision is recorded, allowed or not"],
    ["Denied","96","denials are recorded and cost nothing"],
    ["By a service principal","4,117","Terraform, CI, exports, the archiver"],
    ["By the in-app agent","212","each one a governed action with a receipt"]])+''',
    '''  var ev30=ORG.events30||12418;
  return auditStats([["Events · 30 days",ic0(ev30),"every IAM decision is recorded, allowed or not"],
    ["Denied",ic0(Math.round(ev30*0.0077)),"denials are recorded and cost nothing"],
    ["By a service principal",ic0(Math.round(ev30*0.33)),"Terraform, CI, exports, the archiver"],
    ["By the in-app agent",ic0(Math.round(ev30*0.017)),"each one a governed action with a receipt"]])+''')
rep('''<div class="note">12,418 events in the last 30 days,''', '''<div class="note">'+ic0(ORG.events30||12418)+' events in the last 30 days,''')
rep("""'<div class="panel-b"><div class="note">'+hits.length+' of 1,204 receipts shown.""",
    """'<div class="panel-b"><div class="note">'+hits.length+' of '+ic0(ORG.receipts||1204)+' receipts shown.""")
rep('''<span class="dim mono" style="font-size:11px">a-intel · Team · 50 agents</span>''',
    '''<span class="dim mono" style="font-size:11px">a-intel · Team · \'+ic0(ORG.agents)+\' agents</span>''')
rep('''<div class="stat"><span class="k">Spend today</span><span class="v">'+usd(spendToday)+'</span><span class="s"><span class="basis">gateway_observed</span> · USD</span></div>''',
    '''<div class="stat"><span class="k">Spend · runs shown</span><span class="v">'+usd(fmt2(parseFloat(spendToday)))+'</span><span class="s"><span class="basis">gateway_observed</span> · USD</span></div>''')
rep("""    var legend=FINDINGS.map(function(f,i){return '<span><i style="opacity:'+ramp[i%ramp.length]+'"></i>'+h(f.kind)+' <span class="mono">'+Math.round(parseFloat(f.save)/total*100)+'%</span></span>';}).join("");""",
    """    /* The legend names the biggest few and rolls the rest into one entry; at forty findings
       a name per slice is unreadable and every tail slice rounds to 0%. */
    var LEG=8, lead=FINDINGS.slice(0,LEG), tail=FINDINGS.slice(LEG);
    var legend=lead.map(function(f,i){return '<span><i style="opacity:'+ramp[i%ramp.length]+'"></i>'+h(f.kind)+' <span class="mono">'+Math.round(parseFloat(f.save)/total*100)+'%</span></span>';}).join("")+
      (tail.length?'<span><i style="opacity:.22"></i>'+tail.length+' smaller findings <span class="mono">'+Math.round(tail.reduce(function(s,f){return s+parseFloat(f.save);},0)/total*100)+'%</span></span>':'');""")
rep('''function per(n){return Math.round(n*100)+"%";}''',
    '''function per(n){return Math.round(n*100)+"%";}
function ic0(n){return Math.round(n).toLocaleString("en-US");}''')

# f.save stays comma-free so the page's parseFloat arithmetic works; the separator is
# added at the one place the amount is displayed.
rep("""'<div class="amt"><div class="v">'+usd(f.save)+'</div>""",
    """'<div class="amt"><div class="v">'+usd(fmt2(n$(f.save)))+'</div>""")

# Agent money columns: value stays comma-free for the page's own arithmetic, display gets separators.
rep("""'<td class="num">'+usd(a.spend30)+'</td>'+
     '<td class="num">'+usd(a.proven30)+'</td>'+""",
    """'<td class="num">'+usd(fmt2(n$(a.spend30)))+'</td>'+
     '<td class="num">'+usd(fmt2(n$(a.proven30)))+'</td>'+""")

# The by-agent footnote counted two agents by name; at this size it counts them.
rep("""<div class="note">Two agents show no proven spend: <span class="mono">invoice-bot</span> does finance work no witness covers, and <span class="mono">docs-writer</span>\u2019s output is accepted by a human, which is reported separately and never folded""",
    """<div class="note">'+SPEND.byAgent.filter(function(x){return n$(x.proven)===0;}).length+' agents show no proven spend: finance work no witness covers, and output accepted by a human, which is reported separately and never folded""")

# The proposal banner named one server; proposals now come from several, so it names them.
rep("""      'The <span class="mono">slack</span> server declares no <span class="mono">outputSchema</span> for '+(props.length>1?'these tools':'this tool')+'. '+""",
    """      'The '+(function(){var ss={};props.forEach(function(t){ss[t.s]=1;});var k=Object.keys(ss);
        return k.map(function(n){return '<span class="mono">'+h(n)+'</span>';}).join(k.length>2?', ':' and ');})()+
        (Object.keys(props.reduce(function(m,t){m[t.s]=1;return m;},{})).length>1?' servers declare':' server declares')+
        ' no <span class="mono">outputSchema</span> for '+(props.length>1?'these tools':'this tool')+'. '+""")

open(DST, 'w').write(s)
print('wrote', DST, len(s))
