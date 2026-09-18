"""Prove the sections shared by the roadmap and oxagen spec copies are byte-identical.

No build step joins the two repositories, so the headers of the spec, the plan and
the desktop spec name sections that must match. This compares them.

    python3 tools/check-spec-sync.py <roadmap checkout> <oxagen checkout>

Exit 0 when every section and line matches, 1 otherwise. A section's bytes are
compared after trimming only the trailing blank lines and '---' separators that
sit between it and the next heading.
"""
import hashlib, re, sys

if len(sys.argv) != 3:
    sys.exit(__doc__)
RMR = sys.argv[1].rstrip('/') + '/'
OXR = sys.argv[2].rstrip('/') + '/'
PAIRS = {
    'spec': (OXR + 'docs/specs/mission-control/spec.md', RMR + 'docs/mission-control-spec.md'),
    'plan': (OXR + 'docs/specs/mission-control/plan.md', RMR + 'docs/implementation-plan.md'),
    'desktop': (OXR + 'docs/specs/oxagen-desktop/spec.md', RMR + 'docs/desktop-spec.md'),
}
SECTIONS = {
    'spec': ['### 4.2 ', '### 7.1 ', '### 7.2 ', '### 7.3 ', '### 10.4 ', '### 10.5 ', '### 10.6 ',
             '### 10.7 ', '### 12.5 ', '### 13.6 ', '### 17.2 ', '## 21. '],
    'plan': ['### 0.2 ', '## 8. '],
    'desktop': ['## 14. '],
}
# single lines that must exist exactly once in each copy and be identical
LINES = {
    'spec': ["| 6 | Oxagen's connection", '| 7 | Intervention is', '| **Enforcement tier** | ', '| **Gateway** | ',
             '| `steering.manifest` | ', '| Claude Code and Codex model calls | ',
             '| **Decided 2026-09-18: subscription logins', '| Sandbox scope | ', '| `budget` | '],
}


def sec(text, h):
    L = text.split('\n')
    s = [i for i, l in enumerate(L) if l.startswith(h)]
    assert len(s) == 1, (h, s)
    s = s[0]
    lvl = len(h.split(' ')[0])
    e = len(L)
    for j in range(s + 1, len(L)):
        m = re.match(r'^(#{1,6}) ', L[j])
        if m and len(m.group(1)) <= lvl and not L[j].startswith('# .oxagen'):
            e = j
            break
    while e > s and L[e - 1].strip() in ('', '---'):
        e -= 1
    return '\n'.join(L[s:e])


def line(text, prefix):
    hits = [l for l in text.split('\n') if l.startswith(prefix)]
    assert len(hits) == 1, (prefix, len(hits))
    return hits[0]


bad = 0
for key, (ox, rm) in PAIRS.items():
    a, b = open(ox).read(), open(rm).read()
    for h in SECTIONS.get(key, []):
        x, y = sec(a, h), sec(b, h)
        same = x.encode() == y.encode()
        bad += not same
        print(f"{key:8s} {h:10s} {'identical' if same else 'DIFFERENT'}  sha256 {hashlib.sha256(x.encode()).hexdigest()[:12]} / {hashlib.sha256(y.encode()).hexdigest()[:12]}  {len(x.encode())} bytes")
    for p in LINES.get(key, []):
        x, y = line(a, p), line(b, p)
        same = x.encode() == y.encode()
        bad += not same
        print(f"{key:8s} line {p[:44]!r:48s} {'identical' if same else 'DIFFERENT'}")
print('FAIL' if bad else 'OK', bad, 'difference(s)')
sys.exit(1 if bad else 0)
