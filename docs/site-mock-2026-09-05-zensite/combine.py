# -*- coding: utf-8 -*-
"""out/*.html(16ページ+索引)を、1枚のHTMLにまとめる(レビュー用)。
ページ切替は #<key>、ページ内リンクは #<key>--<id>。CSSは共通。トップだけの追加CSSは .pg-index に限定する。"""
import re, os, sys, html

OUT = sys.argv[1] if len(sys.argv) > 1 else "out"
PAGES = [("index","トップ"),("hajimete","はじめての方へ"),("shinsei","申請の流れ"),("byoki","病気から探す(一覧)"),("byoki-utsu","病気ハブ: うつ病・双極性障害"),
         ("nayami-hub","困りごと: 不支給と言われたとき"),("joukyou-hub","状況: 働きながら"),("okane-hub","お金: いくら受け取れるか"),("erabu-hub","自分でやるか、頼むか"),
         ("jitsurei","実例と数字"),("gokai","よくある誤解(一覧)"),("gokai-card","誤解1枚: 働いていたら無理"),("column","コラム記事: 更新の仕組み"),
         ("mitate","機能: 等級の目安をしらべる"),("jukyuugo","受給が始まってから"),("yougo","用語辞典"),("app","無料アプリ")]
keys = [k for k,_ in PAGES]

def prefix_css(css, pre):
    out=[]; i=0
    for m in re.finditer(r"([^{}]+)\{", css):
        out.append(css[i:m.start()])
        sel = m.group(1)
        if sel.strip().startswith("@"):
            out.append(sel+"{")
        else:
            parts=[p.strip() for p in sel.split(",")]
            out.append(",".join(f"{pre} {p}" if not p.startswith(":root") else p for p in parts)+"{")
        i=m.end()
    out.append(css[i:])
    return "".join(out)

# 共通CSSは(トップ以外の)ページから取る。トップは共通CSSの後ろに独自CSSが足されている
common_css=re.findall(r"<style>(.*?)</style>",open(os.path.join(OUT,"hajimete.html"),encoding="utf-8").read(),flags=re.S)[0]
sections=[]; extra_css=""
for key,label in PAGES:
    s=open(os.path.join(OUT,key+".html"),encoding="utf-8").read()
    styles=re.findall(r"<style>(.*?)</style>",s,flags=re.S)
    if key=="index":
        assert styles[0].startswith(common_css)
        extra_css = styles[0][len(common_css):]
    body=re.search(r"<body>(.*)</body>",s,flags=re.S).group(1)
    # id / ページ内アンカーに接頭辞
    body=re.sub(r'id="([^"]+)"', lambda m: f'id="{key}--{m.group(1)}"', body)
    body=re.sub(r'href="#([^"]+)"', lambda m: f'href="#{key}--{m.group(1)}"', body)
    # ページ間リンク
    def pl(m):
        k=m.group(1); return f'href="#{k}"' if k in keys else 'href="#"'
    body=re.sub(r'href="([a-z\-]+)\.html(?:#[^"]*)?"', pl, body)
    body=body.replace('href="#"','href="javascript:void(0)"')
    sections.append(f'<div class="pg pg-{key}" id="{key}" hidden>{body}</div>')

if extra_css:
    extra_css=prefix_css(extra_css, ".pg-index")

switch="".join(f'<a href="#{k}" data-k="{k}">{html.escape(l)}</a>' for k,l in PAGES)
doc=f'''<title>全サイトモック 2026-09-05</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap">
<style>{common_css}
{extra_css}
body{{background:#fff}}
.mock-sw{{position:sticky;top:0;z-index:20;background:#14425e;color:#fff;font-family:var(--font);font-size:12.5px;padding:6px 12px;display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center;line-height:1.5}}
.mock-sw b{{margin-right:8px;font-size:12px;opacity:.85}}
.mock-sw a{{color:#fff;text-decoration:none;padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.35)}}
.mock-sw a.on{{background:#fff;color:#14425e;font-weight:700}}
.pg .hd{{top:auto;position:static}}
.pg .rail{{top:76px}}
.pg,.pg [id]{{scroll-margin-top:70px}}
[hidden]{{display:none!important}}
</style>
<div class="mock-sw"><b>モック 16ページ(2026-09-05)</b>{switch}</div>
{"".join(sections)}
<script>
(function(){{
  var keys={keys!r};
  function show(k, el){{
    document.querySelectorAll('.pg').forEach(function(p){{p.hidden=(p.id!==k);}});
    document.querySelectorAll('.mock-sw a').forEach(function(a){{a.classList.toggle('on',a.getAttribute('data-k')===k);}});
    if(el){{ el.scrollIntoView({{block:'start'}}); }} else {{ window.scrollTo(0,0); }}
  }}
  function route(){{
    var h=decodeURIComponent(location.hash.slice(1));
    if(!h){{ show('index'); return; }}
    var k=h.split('--')[0];
    if(keys.indexOf(k)<0){{ show('index'); return; }}
    var el=h.indexOf('--')>0?document.getElementById(h):null;
    show(k, el);
  }}
  window.addEventListener('hashchange', route); route();
}})();
</script>
'''
open(os.path.join(OUT,"zensite-all.html"),"w",encoding="utf-8").write(doc)
print("zensite-all.html", len(doc))
