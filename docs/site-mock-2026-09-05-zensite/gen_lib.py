# -*- coding: utf-8 -*-
"""共通部品: CSS / ヘッダー / フッター / 数字の表と図 / markdown→HTML / 知識ユニット読込。図は「数字の形に意味があるとき」だけ"""
import re, json, html, os

CSS = r"""
:root{--c-text:#1e3a4d;--c-heading:#14425e;--c-body-muted:#4a6a80;--c-meta:#4f6f87;--c-border:#dcebf5;--c-band:#eef6fc;--c-primary:#0273ad;--c-primary-deep:#015d8c;--c-ok:#1a7f4b;--c-ok-bg:#e9f6ee;--c-warn:#b7791f;--c-warn-text:#8b6a1f;--c-warn-bg:#fdf5e6;--c-danger:#b3261e;--c-danger-bg:#fdf1ef;--chart-1:#0273ad;--chart-2:#2b76a6;--chart-3:#9cc6e0;--chart-4:#dcebf5;--white:#fff;
--fs-h1:30px;--fs-h2:22px;--fs-h3:18px;--fs-num:28px;--fs-body:17px;--fs-small:14.5px;--fs-meta:13px;--fs-note:12.5px;--r-s:8px;--r-m:14px;--r-pill:999px;--shadow:0 1px 3px rgba(20,66,94,.08);--font:"Zen Kaku Gothic New","Hiragino Sans","Noto Sans JP",sans-serif;--w:1180px;--rw:760px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;font-family:var(--font);color:var(--c-text);background:var(--white);font-size:var(--fs-body);line-height:1.9}
a{color:var(--c-primary);text-decoration:none}a:hover{text-decoration:underline}
h1,h2,h3,h4{color:var(--c-heading);line-height:1.4;margin:0}h1{font-size:var(--fs-h1)}h2{font-size:var(--fs-h2)}h3{font-size:var(--fs-h3)}h4{font-size:16px}
p{margin:0 0 1.1em}ul,ol{margin:0 0 1.1em;padding-left:1.4em}li{margin:.25em 0}
table{border-collapse:collapse;width:100%;font-size:var(--fs-small);margin:0 0 1.2em}th,td{border:1px solid var(--c-border);padding:8px 10px;text-align:left;vertical-align:top}th{background:var(--c-band);color:var(--c-heading);font-weight:700}
blockquote{margin:0 0 1.1em;padding:12px 16px;border-left:4px solid var(--c-primary);background:var(--c-band);border-radius:0 8px 8px 0;font-size:var(--fs-small)}
.wrap{max-width:var(--w);margin:0 auto;padding:0 20px}.rw{max-width:var(--rw);margin:0 auto;padding:0 20px}
.hd{border-bottom:1px solid var(--c-border);background:var(--white);position:sticky;top:0;z-index:5}.hd .wrap{display:flex;align-items:center;justify-content:space-between;height:64px}.hd .logo{font-weight:700;font-size:20px;color:var(--c-heading)}.hd nav{display:flex;gap:18px;font-size:15px;align-items:center}.hd nav a{color:var(--c-text)}.hd nav a[aria-current]{color:var(--c-primary);text-decoration:underline;text-underline-offset:6px;text-decoration-thickness:2px}.hd .app{background:var(--c-primary);color:#fff;padding:8px 16px;border-radius:var(--r-pill);font-weight:700}
.crumb{font-size:var(--fs-meta);color:var(--c-meta);margin:0 0 10px}.crumb a{color:var(--c-meta)}
.hero{background:var(--c-band);padding:36px 0 28px}.hero h1{margin:0 0 6px}.hero .date{margin:0 0 10px;font-size:var(--fs-small);color:var(--c-meta)}.hero .lead{margin:0;color:var(--c-text);max-width:820px}
.hito{margin:16px 0 0;padding:14px 18px;background:var(--white);border:1px solid var(--c-border);border-left:4px solid var(--c-primary);border-radius:0 8px 8px 0;max-width:820px}.hito b{display:block;font-size:var(--fs-meta);color:var(--c-meta);margin-bottom:2px}
section.sec{padding:44px 0}section.band{background:var(--c-band)}
.sh{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:20px}.sh p{margin:6px 0 0;color:var(--c-body-muted);font-size:var(--fs-small)}.sh a.more{white-space:nowrap;font-weight:700;font-size:var(--fs-small)}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.cards.two{grid-template-columns:1fr 1fr}.cards.four{grid-template-columns:repeat(4,1fr)}
.card{background:var(--white);border:1px solid var(--c-border);border-radius:var(--r-m);padding:18px 20px;display:grid;gap:8px;align-content:start;box-shadow:var(--shadow)}.card p{margin:0;font-size:var(--fs-small)}.card .src{font-size:var(--fs-note);color:var(--c-meta)}.card a.more{font-size:var(--fs-small);font-weight:700}.card h3{font-size:16px}
.card .q{display:inline-block;background:var(--c-warn-bg);color:var(--c-warn-text);font-size:var(--fs-meta);font-weight:700;padding:2px 10px;border-radius:var(--r-s);max-width:100%;line-height:1.6}
.know .card{background:var(--white)}.know h3{font-size:15.5px}.know p{font-size:var(--fs-meta);line-height:1.8}
.fig{background:var(--white);border:1px solid var(--c-border);border-radius:var(--r-m);padding:16px 20px;display:grid;gap:8px;align-content:start}.fig h3{font-size:14.5px;color:var(--c-meta)}.fig .big{font-size:var(--fs-num);color:var(--c-heading);font-weight:700;line-height:1.2}.fig .big small{font-size:var(--fs-meta);color:var(--c-meta);font-weight:400;margin-left:6px}.fig p{margin:0;font-size:var(--fs-small)}.fig .src{font-size:var(--fs-note);color:var(--c-meta)}
.fig svg{width:100%;max-width:340px;height:auto;display:block}.fig svg text{font-family:var(--font);font-size:12px;fill:var(--c-heading)}.fig svg text.m{fill:var(--c-meta);font-size:11px}
.figs{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.figs.two{grid-template-columns:1fr 1fr}
.hb{display:flex;height:24px;border-radius:6px;overflow:hidden;font-size:12.5px;line-height:24px}.hb span{white-space:nowrap;overflow:hidden;padding:0 8px}.hb .a{background:var(--chart-1);color:#fff}.hb .b{background:var(--chart-2)}.hb .c{background:var(--chart-3)}.hb .d{background:var(--chart-4);color:var(--c-heading)}.hb .k{background:var(--c-heading)}
.legend{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:var(--fs-meta);color:var(--c-meta);margin:0}.legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.chips{display:flex;flex-wrap:wrap;gap:8px}.chips a{border:1px solid var(--c-border);border-radius:var(--r-pill);padding:6px 12px;font-size:var(--fs-small);color:var(--c-heading);background:var(--white)}.chips a.on{background:var(--c-primary);border-color:var(--c-primary);color:#fff}
.grp{display:grid;grid-template-columns:140px 1fr;gap:10px 16px;align-items:start;margin-bottom:12px}.grp b{font-size:var(--fs-small);color:var(--c-heading);padding-top:6px}.grp .n{font-size:var(--fs-note);color:var(--c-meta);display:block;font-weight:400}
.two{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
.layout{display:grid;grid-template-columns:230px minmax(0,760px);gap:40px;align-items:start}.rail{position:sticky;top:84px;font-size:var(--fs-meta)}.rail b{display:block;color:var(--c-meta);margin-bottom:6px}.rail a{display:block;padding:5px 0 5px 12px;border-left:3px solid var(--c-border);color:var(--c-text)}.rail a.cur{border-color:var(--c-primary);color:var(--c-primary);font-weight:700}
.body h2{margin:2.2em 0 .8em;padding-left:14px;border-left:4px solid var(--c-primary);font-size:var(--fs-h2)}.body h3{margin:1.6em 0 .6em}.body p{line-height:1.9}
.check{margin:1.4em 0;padding:14px 18px;background:var(--c-band);border-left:4px solid var(--c-primary);border-radius:0 8px 8px 0}.check b{display:block;font-size:var(--fs-meta);color:var(--c-meta);margin-bottom:4px}.check p{margin:0;font-size:var(--fs-body)}.check .rest{margin-top:6px;font-size:var(--fs-small);color:var(--c-body-muted)}
.faq dt{font-weight:700;color:var(--c-heading);margin-top:14px}.faq dd{margin:4px 0 0}
.tool{border:1px solid var(--c-border);border-radius:var(--r-m);padding:18px 20px;background:var(--white);display:grid;gap:8px;align-content:start;justify-items:start}.tool b{color:var(--c-heading);font-size:16px}.tool .cta{display:inline-block;background:var(--c-primary);color:#fff;border-radius:var(--r-pill);padding:8px 18px;font-weight:700;width:max-content}.tool small{color:var(--c-meta);font-size:var(--fs-note)}
.case{background:var(--white);border:1px solid var(--c-border);border-radius:var(--r-m);padding:14px 18px;display:grid;grid-template-columns:auto 1fr;gap:6px 14px;align-items:start;margin-bottom:10px}.case .tag{background:var(--c-ok-bg);color:var(--c-ok);font-weight:700;font-size:var(--fs-meta);padding:4px 10px;border-radius:var(--r-s);white-space:nowrap}.case .tag.no{background:var(--c-band);color:var(--c-heading)}.case b{color:var(--c-heading);font-size:15.5px}.case p{margin:0;font-size:var(--fs-small)}.case .src{font-size:var(--fs-note);color:var(--c-meta)}
.grid-table{display:grid;grid-template-columns:110px repeat(5,1fr);gap:4px;font-size:12.5px}.grid-table div{padding:8px 4px;text-align:center;border-radius:6px;background:var(--c-band);color:var(--c-heading)}.grid-table .h{background:none;font-weight:700;color:var(--c-meta)}.grid-table .g1{background:var(--chart-1);color:#fff;font-weight:700}.grid-table .g2{background:var(--chart-2);color:#fff;font-weight:700}.grid-table .g3{background:var(--chart-3);font-weight:700}.grid-table .g0{background:var(--white);border:1px solid var(--c-border);color:var(--c-meta)}
.steps{display:grid;grid-template-columns:repeat(8,1fr);gap:8px;margin-top:8px}.step{display:grid;gap:6px;justify-items:center;text-align:center;font-size:var(--fs-small)}.step i{width:36px;height:36px;border-radius:50%;background:var(--c-primary);color:#fff;font-style:normal;font-weight:700;display:grid;place-items:center}.step.tool i{outline:2px solid var(--c-border);outline-offset:4px}
.stepcard{border:1px solid var(--c-border);border-radius:var(--r-m);background:var(--white);padding:18px 20px;margin-bottom:14px;display:grid;gap:8px}.stepcard .hd2{display:flex;justify-content:space-between;align-items:baseline;gap:10px}.stepcard .hd2 b{font-size:var(--fs-h3);color:var(--c-heading)}.stepcard .chip{font-size:var(--fs-meta);color:var(--c-meta);white-space:nowrap}.stepcard p{margin:0;font-size:var(--fs-small)}.stepcard .stumble{background:var(--c-warn-bg);border-left:3px solid var(--c-warn);padding:8px 12px;border-radius:0 6px 6px 0;font-size:var(--fs-small)}.stepcard .stumble b{color:var(--c-warn-text);font-size:var(--fs-meta)}
.note{font-size:var(--fs-small);color:var(--c-body-muted);margin:12px 0 0}
.money{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.money div{background:var(--c-band);border-radius:var(--r-s);padding:10px 12px;font-size:var(--fs-meta);color:var(--c-meta)}.money b{display:block;font-size:20px;color:var(--c-heading)}
.appc{background:var(--c-band);border-radius:var(--r-m);padding:18px 22px;display:flex;flex-wrap:wrap;gap:8px 24px;align-items:center;justify-content:space-between;font-size:var(--fs-small)}.appc b{color:var(--c-heading);font-size:var(--fs-h3)}
.dl dt{font-weight:700;color:var(--c-heading);margin-top:10px}.dl dd{margin:2px 0 0;font-size:var(--fs-small)}
.mock-note{background:var(--c-warn-bg);color:var(--c-warn-text);font-size:var(--fs-meta);padding:6px 20px;text-align:center}
footer{border-top:1px solid var(--c-border);padding:24px 0;font-size:var(--fs-meta);color:var(--c-meta)}footer .cols{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}footer h4{font-size:14px;margin-bottom:6px}footer a{display:block;color:var(--c-meta);font-size:13px}
@media (max-width:900px){.cards,.cards.four,.figs{grid-template-columns:1fr 1fr}.two,.figs.two,.cards.two{grid-template-columns:1fr}.layout{grid-template-columns:1fr}.rail{position:static}.steps{grid-template-columns:repeat(4,1fr)}.hd nav{display:none}.grp{grid-template-columns:1fr}.grp b{padding-top:0}.money{grid-template-columns:1fr 1fr}footer .cols{grid-template-columns:1fr 1fr}}
@media (max-width:600px){.cards,.cards.four,.figs,.money{grid-template-columns:1fr}.steps{grid-template-columns:1fr 1fr}:root{--fs-h1:26px;--fs-h2:20px}.sh{flex-direction:column;align-items:start}.grid-table{grid-template-columns:90px repeat(5,1fr);font-size:11px}}
"""

NAV = [("はじめての方へ","hajimete"),("申請の流れ","shinsei"),("病気別","byoki"),("状況別","joukyou-hub"),("困りごと別","nayami-hub"),("お金","okane-hub"),("実例と数字","jitsurei"),("コラム","column")]

def header(current=None):
    links="".join('<a href="%s.html"%s>%s</a>'%(f,' aria-current="page"' if f==current else '',l) for l,f in NAV)
    return f'<div class="hd"><div class="wrap"><a class="logo" href="index.html">障害年金申請サポート</a><nav>{links}<a class="app" href="app.html">無料アプリ</a></nav></div></div>'

def footer():
    return '''<footer><div class="wrap"><div class="cols">
<div><h4>病気・状況・困りごと別</h4><a href="byoki.html">病気別</a><a href="joukyou-hub.html">状況別</a><a href="nayami-hub.html">困りごと別</a><a href="mitate.html">等級の目安をしらべる</a><a href="erabu-hub.html">自分でやるか、頼むか</a></div>
<div><h4>申請の進め方</h4><a href="hajimete.html">はじめての方へ</a><a href="shinsei.html">申請の流れ</a><a href="#">必要書類チェックリスト</a><a href="#">年金事務所を探す</a><a href="#">申立書をつくる</a><a href="gokai.html">よくある誤解</a><a href="column.html">コラム</a><a href="yougo.html">用語辞典</a><a href="jukyuugo.html">受給が始まってから</a></div>
<div><h4>お金と数字</h4><a href="#">障害年金の金額(計算)</a><a href="okane-hub.html">お金</a><a href="jitsurei.html">実例</a><a href="#">数字で見る障害年金</a></div>
<div><h4>このサイトについて</h4><a href="#">運営者情報</a><a href="#">情報の品質について</a><a href="#">お問い合わせ</a><a href="#">プライバシーポリシー</a><a href="#">利用規約</a><a href="#">広告掲載について</a><a href="app.html">無料iPhoneアプリ</a></div>
</div><p style="margin:18px 0 0">© 障害年金申請サポート ・ 掲載情報はすべて公的資料の出典つき・確認日を明記しています</p></div></footer>'''

def page(title, desc, body, current=None, mock_note=""):
    note = f'<div class="mock-note">モック: {html.escape(mock_note)}</div>' if mock_note else ""
    return f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{html.escape(title)}</title><meta name="description" content="{html.escape(desc)}"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"><style>{CSS}</style></head><body>{note}{header(current)}<main>{body}</main>{footer()}</body></html>'''

# ---------- 図(数字の「形」に意味があるときだけ使う: 推移の跳ね・大多数・順位。数字は必ず文字でも併記) ----------
def band(parts, label):
    """横一本の帯。parts: list of (cls, pct, text)"""
    spans="".join('<span class="%s" style="width:%s%%%s">%s</span>'%(c,p,'' if t else ';padding:0',t) for c,p,t in parts)
    return f'<div class="hb" role="img" aria-label="{html.escape(label)}">{spans}</div>'

def hbars(rows, maxv, w=300, unit="", lw=88):
    """横棒(順位を見せる)。rows: list of (label, value, cls)"""
    h=32*len(rows); out=[f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="{html.escape("、".join(f"{l}{v}{unit}" for l,v,_ in rows))}">']
    for i,(l,v,c) in enumerate(rows):
        y=i*32; bw=max(4,round((w-lw-52)*v/maxv))
        out.append(f'<text x="0" y="{y+18}">{l}</text><rect x="{lw}" y="{y+6}" width="{bw}" height="16" rx="3" fill="var(--{c})"/><text x="{lw+bw+6}" y="{y+18}">{v}{unit}</text>')
    out.append('</svg>'); return "".join(out)

def vbars(rows, maxv, hi=None, w=300, h=110):
    """縦棒(推移の跳ねを見せる)。rows: list of (label, value). hi = 強調する index"""
    n=len(rows); gap=w/n; out=[f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="{html.escape("、".join(f"{l}{v}" for l,v in rows))}">']
    for i,(l,v) in enumerate(rows):
        bh=round((h-40)*v/maxv); x=i*gap+gap*0.18; bw=gap*0.64; y=h-14-bh
        c="chart-1" if i==hi else "chart-3"
        fw=' font-weight="700"' if i==hi else ''
        out.append('<rect x="%.0f" y="%s" width="%.0f" height="%s" fill="var(--%s)"/><text x="%.0f" y="%s" text-anchor="middle"%s>%s</text><text x="%.0f" y="%s" text-anchor="middle" class="m">%s</text>'%(x,y,bw,bh,c,x+bw/2,y-6,fw,v,x+bw/2,h-2,l))
    out.append(f'<line x1="0" y1="{h-14}" x2="{w}" y2="{h-14}" stroke="var(--c-border)"/></svg>'); return "".join(out)

def fig(title, big, small, body, text, src):
    """図1枚の枠。big=いちばん伝えたい数字(文字)、body=帯/棒、text=1文の読み方、src=出典・確認日"""
    bigh = '<div class="big">%s<small>%s</small></div>'%(big,small) if big else ''
    return '<div class="fig"><h3>%s</h3>%s%s<p>%s</p><span class="src">%s</span></div>'%(title,bigh,body,text,src)

def numtable(rows, head=("項目","数字")):
    """数字の表(図ではなく表で示す)"""
    return "<table><thead><tr>"+"".join(f"<th>{h}</th>" for h in head)+"</tr></thead><tbody>"+"".join("<tr>"+"".join(f"<td>{c}</td>" for c in r)+"</tr>" for r in rows)+"</tbody></table>"

# ---------- knowledge units ----------
def load_units(paths):
    units={}
    for pth in paths:
        txt=open(pth,encoding="utf-8").read()
        for m in re.finditer(r"^### (ku-[a-z]+-\d+) (.+?)\n(meta:.*?\n)?((?:>.*\n?)+)",txt,flags=re.M):
            body=re.sub(r"^>\s?","",m.group(4),flags=re.M).replace("\n","").strip()
            body=re.sub(r"\*\*(.+?)\*\*",r"\1",body)
            meta=m.group(3) or ""
            srcs=re.findall(r'"(SRC-[A-Z0-9-]+)"',meta); ver=re.search(r'"verified":"([^"]+)"',meta)
            units[m.group(1)]=dict(id=m.group(1),title=m.group(2).strip(),body=body,sources=srcs,verified=ver.group(1) if ver else "")
    return units

SRC_LABEL={"A":"日本年金機構","B":"日本年金機構(様式・記載要領)","C":"日本年金機構","D":"厚生労働省"}
def unit_card(u, href="#", label="くわしく →", src_label=None):
    src = src_label or ("厚生労働省・日本年金機構" if u["sources"] else "公的資料")
    return f'<div class="card"><h3>{html.escape(u["title"])}</h3><p>{html.escape(u["body"])}</p><span class="src">出典: {src} ・ 確認日 {u["verified"]}</span><a class="more" href="{href}">{label}</a></div>'

def know_block(units, ids, heading="知っておくと迷わないこと", lead="知識240項目から、このページに関わるものを選びました。すべて公的資料の出典つきです。", hrefs=None):
    cards="".join(unit_card(units[i], (hrefs or {}).get(i,"#")) for i in ids if i in units)
    n=len(ids)
    return f'<section class="sec band know"><div class="wrap"><div class="sh"><div><h2>{heading}</h2><p>{lead}</p></div></div><div class="cards{" four" if n==4 else (" two" if n==2 else "")}">{cards}</div></div></section>'

# ---------- markdown ----------
def inline(t):
    t=html.escape(t,quote=False)
    t=re.sub(r"\[([^\]]+)\]\(([^)]+)\)",r'<a href="\2">\1</a>',t)
    t=re.sub(r"→ ([^()\n]+?)\((/[^)]+)\)",r'→ <a href="\2">\1</a>',t)
    t=re.sub(r"([^\s(（)>]+)\((/[A-Za-z0-9\-/#?=._]+)\)",r'<a href="\2">\1</a>',t)
    t=re.sub(r"\*\*(.+?)\*\*",r"<strong>\1</strong>",t)
    return t

def md_to_html(md, drop_sections=(), checkpoints=None, skip_first_h2=False):
    """簡易 markdown → HTML。checkpoints: {h2_index: text} で節末に「ここまでの要約」を差し込む"""
    out=[]; lines=md.split("\n"); i=0; h2i=-1; in_list=None; para=[]; table=[]; quote=[]
    def flush_para():
        nonlocal para
        if para: out.append("<p>"+inline(" ".join(para))+"</p>"); para=[]
    def flush_list():
        nonlocal in_list
        if in_list: out.append(f"</{in_list}>"); in_list=None
    def flush_table():
        nonlocal table
        if table:
            rows=[r for r in table if not re.match(r"^\|?\s*-",r)]
            th=rows[0]; tds=rows[1:]
            cells=lambda r:[c.strip() for c in r.strip().strip("|").split("|")]
            out.append("<div style=\"overflow-x:auto\"><table><thead><tr>"+"".join(f"<th>{inline(c)}</th>" for c in cells(th))+"</tr></thead><tbody>"+"".join("<tr>"+"".join(f"<td>{inline(c)}</td>" for c in cells(r))+"</tr>" for r in tds)+"</tbody></table></div>"); table=[]
    def flush_quote():
        nonlocal quote
        if quote: out.append("<blockquote>"+inline(" ".join(quote))+"</blockquote>"); quote=[]
    def flush_all(): flush_para(); flush_list(); flush_table(); flush_quote()
    skipping=False
    def close_section():
        if checkpoints and h2i in checkpoints:
            cp=checkpoints[h2i]; first = (h2i==min(checkpoints))
            rest = '<div class="rest">ここまで読めば、今日は十分です。続きは、次に開いたときで大丈夫です。</div>' if first else ''
            out.append('<aside class="check"><b>ここまでの要約</b><p>'+html.escape(cp)+'</p>'+rest+'</aside>')
    while i<len(lines):
        l=lines[i].rstrip()
        if l.startswith("## "):
            flush_all();
            if h2i>=0 and not skipping: close_section()
            h2i+=1; title=l[3:].strip()
            skipping = title in drop_sections or (skip_first_h2 and h2i==0)
            if not skipping: out.append(f'<h2 id="s{h2i}">{inline(title)}</h2>')
            i+=1; continue
        if skipping: i+=1; continue
        if l.startswith("### "): flush_all(); out.append(f"<h3>{inline(l[4:].strip())}</h3>"); i+=1; continue
        if l.startswith("#### "): flush_all(); out.append(f"<h4>{inline(l[5:].strip())}</h4>"); i+=1; continue
        if l.strip()=="---": flush_all(); i+=1; continue
        if l.startswith("|"): flush_para(); flush_list(); flush_quote(); table.append(l); i+=1; continue
        else: flush_table()
        if l.startswith(">"): flush_para(); flush_list(); quote.append(l[1:].strip()); i+=1; continue
        else: flush_quote()
        m=re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)",l)
        if m:
            flush_para(); kind="ol" if m.group(2)[0].isdigit() else "ul"
            if in_list!=kind: flush_list(); out.append(f"<{kind}>"); in_list=kind
            out.append(f"<li>{inline(m.group(3))}</li>"); i+=1; continue
        if not l.strip(): flush_para(); flush_list(); i+=1; continue
        para.append(l.strip()); i+=1
    flush_all()
    if h2i>=0 and not skipping: close_section()
    return "\n".join(out)

def h2_titles(md):
    return [l[3:].strip() for l in md.split("\n") if l.startswith("## ")]

def rail(titles, extra=None):
    items="".join('<a href="#s%d"%s>%s</a>'%(i,' class="cur"' if i==0 else '',html.escape(t)) for i,t in enumerate(titles))
    return f'<nav class="rail" aria-label="目次"><b>目次</b>{items}{extra or ""}</nav>'

def faq_html(pairs):
    return '<dl class="faq">'+"".join(f"<dt>Q. {html.escape(q)}</dt><dd>A. {html.escape(a)}</dd>" for q,a in pairs)+"</dl>"
