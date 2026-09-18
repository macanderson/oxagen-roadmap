#!/usr/bin/env python3
"""The docs site is one file: docs/missioncontrol-docs.html, every docs/*.md rendered into it.

    python3 tools/build-docs.py            # write docs/missioncontrol-docs.html
    python3 tools/build-docs.py --check    # exit 1 if the committed file is not what docs/*.md produce

The markdown is the source. Each document's first `# ` line is its title and the table right
under it (`| **Status** | Draft |` rows) is its facts block; every `##` is a line in that document's
contents rail. The page shows one document at a time (the hash names it: `#spec`, `#spec/8-6-...`),
with a rail of every document on the left, so the whole set travels as one file and every section
of every document has a link. The stylesheet is docs/_house/oxagen-doc.css, inlined.
"""
import html, pathlib, re, sys
from markdown_it import MarkdownIt

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
OUT = DOCS / "missioncontrol-docs.html"
CSS = (DOCS / "_house" / "oxagen-doc.css").read_text()

# The documents, in the order the rail lists them. id is the hash; kind is the eyebrow.
CATALOG = [
    ("Specifications", [
        ("spec", "mission-control-spec.md", "Specification"),
        ("dod", "dod-spec.md", "Specification"),
        ("witness", "witness-spec.md", "Specification"),
        ("desktop", "desktop-spec.md", "Specification"),
        ("creation", "creation-spec.md", "Specification"),
        ("portability", "agent-portability-atlas.md", "Specification"),
    ]),
    ("Plans and decisions", [
        ("plan", "implementation-plan.md", "Plan"),
        ("scope", "scope-review.md", "Decision record"),
        ("scaleback", "scale-back-prompt.md", "Record"),
    ]),
    ("The mockups", [
        ("prompts", "demo-mockup-prompts.md", "Record"),
        ("consolidation", "consolidation.md", "Record"),
        ("feedback", "feedback-mockups.md", "Feedback"),
        ("videos", "videos-mockup-narrated.md", "Record"),
        ("w13", "w13-in-the-loop-scenario.md", "Scenario"),
    ]),
]

def slug(s):
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "section"

def split_front(md):
    """(title, facts:list[(k,v)], body_md). A doc with no facts table is fine."""
    lines = md.splitlines()
    i = 0
    while i < len(lines) and not lines[i].strip(): i += 1
    if i >= len(lines) or not lines[i].startswith("# "):
        raise SystemExit("first non-blank line must be the `# Title`")
    title = lines[i][2:].strip(); i += 1
    while i < len(lines) and not lines[i].strip(): i += 1
    facts = []
    if i < len(lines) and lines[i].strip().startswith("|"):
        rows = []
        while i < len(lines) and lines[i].strip().startswith("|"):
            rows.append(lines[i]); i += 1
        for r in rows:
            cells = [c.strip() for c in r.strip().strip("|").split("|")]
            if len(cells) < 2 or set(cells[0]) <= set("-: ") or not cells[0]: continue
            k = re.sub(r"^\*\*(.+)\*\*$", r"\1", cells[0])
            facts.append((k, "|".join(cells[1:]).strip()))
        while i < len(lines) and (not lines[i].strip() or lines[i].strip() == "---"): i += 1
    return title, facts, "\n".join(lines[i:])

md = MarkdownIt("commonmark", {"html": True}).enable(["table", "strikethrough"])
inline = lambda s: md.renderInline(s)

# Links between documents: `mission-control-spec.md` → the document's hash; `foo.md#x` too.
FILE_TO_ID = {f: i for _, docs in CATALOG for i, f, _ in docs}
def relink(body_html, this_id):
    def rep(m):
        f, frag = m.group(1), m.group(2) or ""
        if f in FILE_TO_ID:
            return 'href="#' + FILE_TO_ID[f] + (("/" + frag.lstrip("#")) if frag else "") + '"'
        return m.group(0)
    return re.sub(r'href="([a-z0-9-]+\.md)(#[^"]*)?"', rep, body_html)

def render_doc(doc_id, fname, kind):
    src = DOCS / fname
    title, facts, body = split_front(src.read_text())
    tokens = md.parse(body)
    toc, seen = [], {}
    for j, tok in enumerate(tokens):
        if tok.type == "heading_open" and tok.tag in ("h2", "h3"):
            text = tokens[j + 1].content
            s = slug(text); n = seen.get(s, 0); seen[s] = n + 1
            if n: s = f"{s}-{n}"
            tok.attrSet("id", f"{doc_id}/{s}")
            if tok.tag == "h2": toc.append((s, inline(text)))
    body_html = md.renderer.render(tokens, md.options, {})
    body_html = body_html.replace("<table>", '<div class="tw"><table>').replace("</table>", "</table></div>")
    body_html = relink(body_html, doc_id)
    facts_html = "".join(f"<dt>{html.escape(k)}</dt><dd>{relink(inline(v), doc_id)}</dd>" for k, v in facts)
    toc_html = "".join(f'<li><a href="#{doc_id}/{s}">{t}</a></li>' for s, t in toc)
    return {
        "id": doc_id, "file": fname, "kind": kind, "title": inline(title),
        "plain_title": html.unescape(re.sub(r"<[^>]+>", "", inline(title))),
        "html": f"""<article id="{doc_id}" class="doc" hidden>
<header class="mast">
  <p class="eyebrow">Oxagen · {html.escape(kind)}</p>
  <h1>{inline(title)}</h1>
  {'<dl class="facts">' + facts_html + '</dl>' if facts else ''}
</header>
<div class="grid">
<nav class="toc" aria-label="Contents of this document"><p>Contents</p><ol>{toc_html}</ol></nav>
<main>
{body_html}
<footer class="colophon"><span>Oxagen · {html.escape(kind)}</span><span>Source: <code>docs/{html.escape(fname)}</code></span></footer>
</main>
</div>
</article>""",
    }

def build():
    docs = []
    rail = []
    for group, entries in CATALOG:
        items = []
        for doc_id, fname, kind in entries:
            d = render_doc(doc_id, fname, kind)
            docs.append(d)
            items.append(f'<li><a href="#{doc_id}" data-doc="{doc_id}">{d["title"]}</a></li>')
        rail.append(f'<p>{html.escape(group)}</p><ol>{"".join(items)}</ol>')
    first = docs[0]["id"]
    titles = {d["id"]: d["plain_title"] for d in docs}
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Oxagen Mission Control: the documents</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap">
<style>
{CSS}
/* the site around the documents: a rail of documents, one shown at a time */
.site{{display:grid;grid-template-columns:250px minmax(0,1fr);gap:48px;align-items:start;max-width:1500px;margin-inline:auto;padding-block:28px 96px}}
nav.docs{{position:sticky;top:24px;font-size:var(--s-1);max-height:calc(100vh - 48px);overflow:auto}}
nav.docs .wordmark{{display:block;margin-bottom:22px}}
nav.docs p{{margin:18px 0 8px;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}}
nav.docs ol{{list-style:none;margin:0;padding:0;display:grid;gap:2px}}
nav.docs a{{display:block;padding:6px 10px;border-radius:var(--r);color:var(--muted);text-decoration:none;line-height:1.35}}
nav.docs a:hover{{color:var(--text);background:var(--hl)}}
nav.docs a[aria-current="page"]{{color:var(--text);background:var(--panel);border:1px solid var(--line)}}
nav.docs .foot{{margin-top:26px;font-size:12px;color:var(--dim)}}
.doc[hidden]{{display:none}}
.doc header.mast{{padding-top:0}}
main hr+h2{{border-top:0;padding-top:0;margin-top:0}}
@media (max-width:1000px){{.site{{grid-template-columns:1fr;gap:20px}}nav.docs{{position:static;max-height:none}}nav.docs ol{{display:flex;flex-wrap:wrap;gap:4px}}}}
</style>
</head>
<body>
<div class="site">
<nav class="docs" aria-label="Documents">
  <a class="wordmark" href="#{first}">o<span class="x">x</span>agen</a>
  {"".join(rail)}
  <div class="foot">One file, every document. The markdown in <code>docs/</code> is the source; <code>tools/build-docs.py</code> writes this page.</div>
</nav>
<div>
{"".join(d["html"] for d in docs)}
</div>
</div>
<script>
(function(){{
  var TITLES={titles!r};
  var first={first!r};
  function show(){{
    var h=location.hash.replace(/^#/,""), id=h.split("/")[0];
    if(!TITLES[id]) id=first;
    document.querySelectorAll("article.doc").forEach(function(a){{a.hidden=a.id!==id;}});
    document.querySelectorAll("nav.docs a[data-doc]").forEach(function(a){{
      if(a.getAttribute("data-doc")===id)a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current");}});
    document.title=TITLES[id]+" · Oxagen";
    if(h.indexOf("/")>0){{var el=document.getElementById(h);if(el)el.scrollIntoView({{block:"start"}});}}
    else window.scrollTo(0,0);
  }}
  window.addEventListener("hashchange",show);
  show();
}})();
</script>
</body>
</html>
"""

def main():
    check = "--check" in sys.argv
    page = build()
    if check:
        if not OUT.exists() or OUT.read_text() != page:
            print(f"DIFF {OUT.relative_to(ROOT)} is not what docs/*.md produce. Run: python3 tools/build-docs.py"); sys.exit(1)
        print(f"ok   {OUT.relative_to(ROOT)} matches docs/*.md")
    else:
        OUT.write_text(page)
        n = sum(len(e) for _, e in CATALOG)
        print(f"wrote {OUT.relative_to(ROOT)} ({len(page)//1024} KB, {n} documents)")

if __name__ == "__main__":
    main()
