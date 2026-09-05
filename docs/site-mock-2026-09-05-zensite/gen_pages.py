# -*- coding: utf-8 -*-
"""全サイトのモック生成。図は「数字の形に意味があるとき」だけ(推移の跳ね・大多数・順位)、それ以外は表とタイルで。
使い方: python3 gen_pages.py <public-pages repo root> <app repo docs dir> <out dir>"""
import sys, os, re, json, html
from gen_lib import *

PUB, APPDOCS, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
U = load_units([os.path.join(APPDOCS, f) for f in ["knowledge-units-v1-part1-2026-08-19.md","knowledge-units-v1-part2-2026-08-19.md","knowledge-units-v2-2026-08-31.md"]])
assert len(U)==240, len(U)
HUBS = {}
_dump = os.path.join(PUB,"docs/_tmp-hubs-dump.json")
_dumped = json.load(open(_dump,encoding="utf-8")) if os.path.exists(_dump) else {}
for h in ["byoki-utsu-soukyoku","nayami-fushikyu","joukyou-hatarakinagara","okane-ikura","erabu-jibun-ka-irai"]:
    fp=os.path.join(PUB,"data/hubs",h+".json")
    HUBS[h]=json.load(open(fp,encoding="utf-8")) if os.path.exists(fp) else _dumped[h]
DATE="2026年9月5日"; CHK="2026-09-05"
E=lambda s: html.escape(s, quote=False)

def fix_nums(t):
    """96.8/1.0(認定状況調査の抽出値)と 304,456件(業務統計)の混在を、業務統計の値にそろえる(top-sasshin-2 §7)"""
    return (t.replace("96.8%はそのまま継続でした(増額1.4%、減額0.8%、支給停止1.0%)","96.7%はそのまま継続でした(増額1.4%、減額0.8%、支給停止1.1%)")
             .replace("再認定は96.8%が継続","再認定は96.7%が継続")
             .replace("継続96.8%・増額1.4%・減額0.8%・支給停止1.0%","継続96.7%・増額1.4%・減額0.8%・支給停止1.1%")
             .replace("304,456件のうち96.8%","304,456件のうち96.7%")
             .replace("厚生労働省「障害年金受給者実態調査」令和6年度(再認定304,456件","日本年金機構「障害年金業務統計(令和6年度決定分)」(再認定304,456件"))

def crumb(*parts):
    items=[]
    for i,(label,href) in enumerate(parts):
        items.append(f'<a href="{href}">{E(label)}</a>' if href else E(label))
    return '<p class="crumb">'+" / ".join(items)+'</p>'

def hero(title, lead, crumbs, hito=None, date=DATE, extra=""):
    h = f'<div class="hito"><b>一言でいうと</b>{E(hito)}</div>' if hito else ""
    return f'<section class="hero"><div class="wrap">{crumb(*crumbs)}<h1>{E(title)}</h1><p class="date">最終確認日 {date}</p><p class="lead">{E(lead)}</p>{h}{extra}</div></section>'

def sec(title, inner, lead="", band=False, more=None):
    m = f'<a class="more" href="{more[1]}">{E(more[0])} →</a>' if more else ""
    return f'<section class="sec{" band" if band else ""}"><div class="wrap"><div class="sh"><div><h2>{E(title)}</h2>{f"<p>{E(lead)}</p>" if lead else ""}</div>{m}</div>{inner}</div></section>'

def tool_card(name, blurb, href="#"):
    return f'<div class="tool"><b>{E(name)}</b><span style="font-size:var(--fs-small)">{E(blurb)}</span><a class="cta" href="{href}">{E(name)} →</a><small>入力した内容はサーバーへ送りません。この端末の中だけで動きます。</small></div>'

def hub_page(key, fname, title_override=None, crumbs=(), units=(), unit_hrefs=None, tool=None, cases=(), extra_after_lead="", current=None, articles=(), stats_rows=None, stats_src=""):
    j=HUBS[key]; md=j["source"]; titles=h2_titles(md)
    lead_md = md.split("\n## ",1)[0]
    lead_md = re.sub(r"^## .*\n", "", lead_md)   # 「リード(直答)」の見出しラベルは画面に出さない
    lead_html = md_to_html(lead_md)
    # 本文に「数字で見る」「実例」の節がすでにあるハブは、テンプレ側の数字・実例を重ねない
    has_stats = any(t.startswith("数字で見る") for t in titles)
    has_cases = any("実例" in t for t in titles)
    # 「次の一歩」は本文から外し、末尾の帯(道具カードと横並び)へ移す
    next_titles = [t for t in titles if t.startswith("次の一歩") or t.endswith("次の一歩")]
    body = md_to_html(md, skip_first_h2=True, drop_sections=tuple(next_titles))
    body_titles = [t for t in titles[1:] if t not in next_titles]
    # 本文の id は s1.. で振られる(リード=s0 を飛ばす)ので、レールと合わせて s0.. に詰める
    body = re.sub(r'id="s(\d+)"', lambda m: 'id="s%d"' % (int(m.group(1))-1), body)
    rail_html = rail(body_titles)
    know = know_block(U, list(units), hrefs=unit_hrefs) if units else ""
    stats = "" if (has_stats or not stats_rows) else f'<section class="sec"><div class="wrap"><div class="sh"><div><h2>数字で見る</h2><p>{E(stats_src)}</p></div></div>{numtable(stats_rows)}</div></section>'
    cases_html = "".join('<div class="case"><span class="tag%s">%s</span><div><b>%s</b><p>%s</p><span class="src">%s</span></div></div>'%('' if ok else ' no','結論が変わった' if ok else '認められなかった',E(t),E(s2),E(f)) for ok,t,s2,f in cases)
    cases_sec = "" if (has_cases or not cases) else sec("結論を分けた実例", cases_html+'<p class="note">公開されている裁決から集めた実例です。申請全体の支給割合(87.0%)とは別の数字です。</p>', "国の再審査(社会保険審査会)の公開裁決から。全件、原文つき。", band=True, more=("実例集を開く","jitsurei.html"))
    arts = "".join(f'<a href="column.html" style="display:block;padding:10px 0;border-bottom:1px solid var(--c-border);font-size:var(--fs-small)">{E(a)}</a>' for a in articles)
    arts_sec = sec("このテーマの記事", f'<div>{arts}</div>', f"{len(articles)}本。読む目安は各記事の冒頭に。", more=("コラム一覧","column.html")) if articles else ""
    next_md = ""
    if next_titles:
        seg = md.split("\n## "+next_titles[0],1)[1]
        seg = seg.split("\n## ",1)[0]
        next_md = seg.split("\n",1)[1] if "\n" in seg else ""
    tool_sec = sec("次の一歩と、使える機能", f'<div class="two"><div>{md_to_html(next_md)}</div>{tool_card(*tool) if tool else ""}</div>', band=True) if (tool or next_md) else ""
    page_body = hero(title_override or j["title"], "", crumbs, hito=None, extra=f'<div style="max-width:820px;margin-top:6px">{lead_html}</div>{extra_after_lead}')
    page_body += stats + know + f'<section class="sec"><div class="wrap"><div class="layout">{rail_html}<div class="body">{body}</div></div></div></section>' + cases_sec + arts_sec + tool_sec
    return page(title_override or j["title"], "", page_body, current=current, mock_note="ハブの型。本文は現行の原稿そのまま(数字・実例・FAQは本文の節を使う)。追加=知識ユニット・左レール目次・このテーマの記事・末尾の道具")

# ---------------- 1. トップ ----------------
def top():
    # トップの原稿は docs/site-mock-2026-09-05-top/mock.html(第4稿: 図表の節なし)。同じ場所に無ければ同梱の top/mock.html
    cand=[os.path.join(os.path.dirname(os.path.abspath(__file__)),"top/mock.html"), os.path.join(PUB,"docs/site-mock-2026-09-05-top/mock.html")]
    src=open([c for c in cand if os.path.exists(c)][0],encoding="utf-8").read()
    body=src[src.index("<main>")+6:src.index("</main>")]
    # リンクを相対に
    body=body.replace('href="/hajimete','href="hajimete.html').replace('href="/byoki"','href="byoki.html"').replace('href="/nayami"','href="nayami-hub.html"').replace('href="/jitsurei','href="jitsurei.html').replace('href="/shinsei"','href="shinsei.html"').replace('href="/gokai"','href="gokai.html"').replace('href="/jukyuugo"','href="jukyuugo.html"').replace('href="/app"','href="app.html"').replace('href="/okane"','href="okane-hub.html"').replace('href="/joukyou"','href="joukyou-hub.html"').replace('href="/dougu/mitate"','href="mitate.html"').replace('href="/yougo"','href="yougo.html"')
    body=body.replace('href="/byoki/utsu-soukyoku"','href="byoki-utsu.html"').replace('href="/nayami/fushikyu"','href="nayami-hub.html"').replace('href="/joukyou/hatarakinagara"','href="joukyou-hub.html"').replace('href="/okane/ikura"','href="okane-hub.html"').replace('href="/erabu/jibun-ka-irai"','href="erabu-hub.html"').replace('href="/gokai/','href="gokai-card.html#')
    css_extra = re.search(r"<style>(.*?)</style>",src,flags=re.S).group(1)
    # トップだけ独自CSS(ヒーロー等)を使う: 共通CSSの後に足す
    p = page("障害年金申請サポート｜「自分の場合はどうなる？」に根拠つきで答える","障害年金がはじめての方へ。知識240項目と、原文を確認できた公開実例91件、公的資料の出典69件から、自分の場合に近い答えを探せます。", body, current=None, mock_note="トップ(第4稿・ヒーローは本番のデザイン)。図は「数字の形に意味がある」3枚だけ(推移・種類別・更新)")
    p = p.replace("</style>", css_extra+"\n.stats{max-width:100%}.stat{min-width:0}.stat span{white-space:normal;max-width:150px}.hero .wrap{max-width:900px;overflow:hidden}\n</style>",1)
    open(os.path.join(OUT,"index.html"),"w",encoding="utf-8").write(p)

# ---------------- 2. はじめての方へ ----------------
def hajimete():
    checks=[("その症状で、最初に病院へ行った日がわかる","この日を「初診日(しょしんび)」と呼びます。障害年金のすべては、この日を起点に決まります。",["精神科でなくてもかまいません。眠れなくて行った内科でも初診日になります","薬が出ていなくてもかまいません。「様子を見ましょう」で終わった受診も、検査だけの受診も、初診日になりえます","病名がついた日ではありません。その症状ではじめて医師にかかった日です"],"思い出せなくても、あきらめないでください。何月何日まで特定できなくても、請求できる取り扱いがあります。","初診日がわからないときの調べ方"),
            ("年金の保険料を、ある程度納めていた","初診日の前日の時点で、保険料を一定期間納めていた(または免除の手続きをしていた)ことが条件です。",["「免除」や「猶予」の期間は、未納とは違います。ちゃんと数えられます。学生納付特例も同じです","判定は初診日ごとです。昔に未納があっても、その後納めていれば、別の傷病では要件を満たせます","20歳になる前の病気やけがなら、この条件はそもそも問われません"],"記録は年金事務所で確認できます。思い込みで諦める前に、記録を見てください。","納付要件をくわしく"),
            ("生活や仕事に、はっきりした支障がある","家事ができない日がある、外出がむずかしい、仕事を続けられない・配慮を受けている——そうした「生活の実態」で審査されます。",["入院しているかどうかは条件ではありません","働いていても対象になります。国のガイドラインに「労働に従事していることをもって、直ちに日常生活能力が向上したものと捉えない」と明記されています","貯金や持ち家は、審査されません。資産を調べるのは生活保護のほうです"],"","審査で見られる「日常生活能力」の7項目")]
    def _chk(i,t,c,pts,n,l):
        note = '<p style="background:var(--c-ok-bg);border-left:3px solid var(--c-ok);padding:8px 12px;border-radius:0 6px 6px 0">'+E(n)+'</p>' if n else ''
        lis = "".join("<li>"+E(x)+"</li>" for x in pts)
        return '<div class="card"><span style="width:32px;height:32px;border-radius:50%;background:var(--c-primary);color:#fff;font-weight:700;display:grid;place-items:center">'+str(i+1)+'</span><h3>'+E(t)+'</h3><p>'+E(c)+'</p><ul style="margin:0;padding-left:1.2em;font-size:var(--fs-small)">'+lis+'</ul>'+note+'<a class="more" href="#">'+E(l)+' →</a></div>'
    cards="".join(_chk(i,*x) for i,x in enumerate(checks))
    q3='<div class="cards" style="margin-top:14px"><div class="card"><h3>もらえる？</h3><p>確認することは3つ。初診日・保険料・いまの生活。</p><a class="more" href="#checks">3つの確認へ →</a></div><div class="card"><h3>いくら？</h3><p>障害基礎年金2級で年847,300円(令和8年度)。1級は1,059,125円。</p><a class="more" href="#money">金額の目安へ →</a></div><div class="card"><h3>まず何を？</h3><p>「その症状で最初に病院へ行った日」を思い出すこと。ここがすべての出発点です。</p><a class="more" href="#first">最初の一歩へ →</a></div></div>'
    h=hero("障害年金がゼロからわかる ― はじめての方へ","障害年金は、病気やけがで生活や仕事がむずかしくなったときに、国から受け取れる年金です。うつ病や発達障害などの精神の障害も対象で、20代でも受け取れます。令和6年度は、新たに決定した146,225件のうち87.0%で支給が認められました。むずかしい言葉を使わずに、順番に案内します。",(("トップ","index.html"),("はじめての方へ",None)),extra=q3)
    what=sec("障害年金とは ― 1分でわかる説明", '<div style="max-width:820px"><p>障害年金は、病気やけがで生活や仕事に支障があるときに、国民年金・厚生年金から受け取れる年金です。老齢年金と同じ「年金」なので、貯金や資産の審査はありません。対象になる病気は広く、うつ病・双極性障害・統合失調症・発達障害などの精神の障害、がん・心臓病・腎臓病・糖尿病などの内部の病気、目・耳・手足の障害、難病も含まれます。</p><p>受け取れるかどうかは、①初診日が特定できること、②保険料の納付要件を満たすこと、③障害の状態が等級に該当すること、の3つで決まります。等級は1級・2級・3級(3級は障害厚生年金だけ)と障害手当金の4段階です。</p><p>令和6年度に新たに決定した146,225件のうち、87.0%で支給が認められました。精神の障害が70.3%を占め、制度の中でもっとも標準的な申請です。</p></div><div class="dl" style="max-width:820px"><dl><dt>初診日</dt><dd>その症状で最初に病院へ行った日。すべての起点。</dd><dt>診断書</dt><dd>医師に書いてもらう、審査でいちばん重視される書類。</dd><dt>申立書</dt><dd>自分(や家族)が生活の実態を書く書類。正式名は「病歴・就労状況等申立書」。</dd><dt>等級</dt><dd>障害の重さの区分(1〜3級)。金額が変わる。手帳の等級とは別もの。</dd></dl></div>', "はじめて聞く言葉は4つだけ。")
    chk=f'<div id="checks"></div>'+sec("受け取れる条件 ― 確認することは3つ", f'<div class="cards">{cards}</div><p class="note">3つとも当てはまりそうなら、申請を考えてよい状態です。1つでも不安があるなら、そこだけ先に確かめます。</p>', "3つとも、自分で確かめられます。", band=True)
    money=f'<div id="money"></div>'+sec("金額の目安 ― 令和8年度の額", '<div class="money"><div>障害基礎年金 2級<b>847,300円/年</b>月あたり約70,600円</div><div>障害基礎年金 1級<b>1,059,125円/年</b>2級の1.25倍</div><div>障害厚生年金 3級(最低保障)<b>635,500円/年</b>会社員のときに初診日がある人</div><div>年金生活者支援給付金 2級<b>5,620円/月</b>所得要件あり。別に請求が必要</div></div><p class="note">子の加算: 第1子・第2子は各243,800円、第3子以降は各81,300円(18歳の年度末まで)。障害厚生年金には配偶者の加給年金243,800円があります。年金額は毎年4月に改定されます。</p><p style="margin-top:12px"><a href="#" style="font-weight:700">自分の場合を計算する →</a>　<a href="okane-hub.html" style="font-weight:700">いくら・いつ振り込まれるか →</a></p>', "障害基礎年金は定額。未納や免除があっても、額は減りません。")
    hurry=sec("急いだほうがいい理由 ― 記録は時間とともに失われる", '<div style="max-width:820px"><p>申請そのものに締切はありません。初診日が30年前でも請求できます。ただし、初診日を証明する記録には期限があります。カルテの保存義務は5年。病院の閉院や、担当医の異動もあります。だから、申請を急ぐ必要はなくても、<strong>初診の病院に記録が残っているかの確認だけは早いほうがいい</strong>のです。</p><p style="background:var(--c-danger-bg);border-left:4px solid var(--c-danger);padding:10px 14px;border-radius:0 8px 8px 0">さかのぼって受け取れるのは最大5年分まで。障害認定日から5年を過ぎている人は、請求が1か月遅れるごとに、過去分が1か月分ずつ消えます。</p></div>', band=True)
    first='<div id="first"></div>'+sec("最初の一歩 ― 今日できること", '<div class="cards"><div class="card"><h3>1. その症状で最初に病院へ行った日を思い出す</h3><p>手がかり: お薬手帳、診察券、領収書、健康保険を使った記録、当時の手帳・日記・家計簿。退職や引っ越し、子どもの入学など生活の節目から挟むと、期間が絞れます。</p></div><div class="card"><h3>2. 年金事務所に予約を入れる</h3><p>相談は予約制で無料です。「障害年金の相談」と伝え、年金手帳(基礎年金番号)と、分かる範囲の初診日を持っていきます。納付記録はその場で確認できます。</p></div><div class="card"><h3>3. 普段の大変なときを、紙に書く</h3><p>診察で伝わっていないことが、診断書に載らない原因です。1日1〜2行で足ります。書けない日があっても構いません。</p></div></div><p class="note">全部を一度にやる必要はありません。今日は1つ進めば十分です。</p>')
    anx=[("「申請するのは甘えでは…」","障害年金は、保険料を納めてきた人のための制度上の正当な権利です。新しく決まった障害年金の70.3%が精神の障害によるもので、制度の中でもっとも標準的なケースです。この迷い自体が、症状の一部であることもあります。","gokai-card.html#amae"),("「周りに知られたくない…」","受給が戸籍・住民票・運転免許に載ることはありません。請求は年金事務所か市区町村に出す手続きで、勤務先を経由しません。受給が始まっても、機構から会社へ通知は行きません。","gokai-card.html#kaisha-ni-shirareru"),("「手帳を持っていないけど…」","手帳と障害年金は別々の制度です。手帳がなくても請求できますし、等級も連動しません。手帳3級で年金2級の人もいます。","gokai-card.html#techou-ga-nai"),("「働いているから無理では…」","働いていること自体は、対象外の理由になりません。見られるのは、どんな支えの中で働けているかです。就労継続支援A型・B型や障害者雇用で働いている場合、ガイドラインは1級または2級の可能性を検討するとしています。","gokai-card.html"),("「昔、保険料を払っていなかった…」","判定は初診日ごとです。免除や猶予の手続きをした期間は未納ではありません。まず年金事務所で記録を見てください。","gokai-card.html#mukashi-minou"),("「もう何年も前のことだから…」","申請そのものに時効はありません。初診日が30年前でも請求できます。時効があるのは、さかのぼって受け取れる分(直近5年)のほうです。","gokai-card.html#jikou-de-muri")]
    anx_html="".join(f'<div class="card"><h3>{E(t)}</h3><p>{E(c)}</p><a class="more" href="{h}">この誤解をくわしく →</a></div>' for t,c,h in anx)
    anxs=sec("よくある不安 ― 公的資料で確かめた答え", f'<div class="cards">{anx_html}</div>', "すべて公的資料で確認済みです。", band=True, more=("よくある誤解をもっと見る","gokai.html"))
    know=know_block(U,["ku-fv-23","ku-fv-25","ku-pos-06","ku-pos-83"], heading="はじめての人が、ここでつまずきやすいこと", lead="知識240項目から、最初の1か月で効く4つ。")
    steps=sec("この先の全体像 ― 申請の8ステップ", '<div class="steps">'+"".join('<div class="step%s"><i>%d</i>%s</div>'%(' tool' if i in (3,4,5,6,7) else '',i,st) for i,st in enumerate(["初診日を確認する","納付要件を確認する","年金事務所へ相談する","必要書類をそろえる","診断書の準備をする","申立書を作成する","年金事務所へ提出する","結果を待つ"],1))+'</div><p class="note">提出から結果までの目安は3か月。年金証書が届いてから約1〜2か月後に、最初の振込があります。</p>', more=("申請の流れを詳しく見る","shinsei.html"))
    body=h+what+chk+money+hurry+first+know+anxs+steps
    open(os.path.join(OUT,"hajimete.html"),"w",encoding="utf-8").write(page("障害年金がゼロからわかる｜はじめての方へ","",body,current="hajimete",mock_note="はじめての方へ。3問→説明→3つの確認→金額→急ぐ理由→最初の一歩→知識4つ→不安6つ→8ステップ"))

# ---------------- 3. 病気から探す(一覧) ----------------
def byoki():
    groups=[("精神・発達","診断書の裏面の7項目と「程度」の組み合わせで、国の目安表に当てはめられます。病名では決まりません。",[("うつ病・双極性障害","記事5・実例13"),("適応障害・不安障害","記事3"),("発達障害","記事2・実例4"),("統合失調症","実例12"),("知的障害","実例3"),("てんかん",""),("認知症",""),("高次脳機能障害",""),("依存症","")]),
            ("内部の病気","検査の数値と「一般状態区分」(日常生活の制限度、5段階)の組み合わせで見られます。数値だけでは決まりません。",[("腎臓病・人工透析","実例2"),("心臓病","実例3"),("糖尿病","実例2"),("がん","実例4"),("肝臓",""),("呼吸器",""),("血液・造血器","実例2")]),
            ("体・感覚の障害","測定値(視力・視野・聴力・関節可動域など)と日常生活の動作で見られます。",[("肢体の障害","実例6"),("目","実例3"),("耳・めまい","実例2"),("話す・食べる",""),("難病・その他","実例5")])]
    hints={"うつ病・双極性障害":"うつ病でも双極性障害でも請求できます。診断書の2つの欄の組み合わせで目安が決まります。","適応障害・不安障害":"精神病の病態を示していれば対象になります。診断名だけで決まりません。","発達障害":"大人になってからの受診でも、その日が初診日です。IQではなく社会生活の困難で判断されます。","統合失調症":"発病からの経過を含めて判断されます。いまの症状だけでは決まりません。","知的障害":"初診日は出生日として扱われます。援助の必要度で判断されます。","てんかん":"発作の型と頻度で判断されます。服薬で抑制されていれば原則対象外です。","認知症":"若年性を含めて対象です。","高次脳機能障害":"精神と神経の症状を分けず、全体像で判断されます。","依存症":"精神病性障害を示す場合に対象です。","腎臓病・人工透析":"人工透析を受けている方は、原則2級です。透析前でも検査値と全身状態で対象になりえます。","心臓病":"ペースメーカー・ICD・人工弁は原則3級。装着物がなくても心不全は対象です。","糖尿病":"合併症があるか、インスリンを使っても血糖が安定しないなら対象です。糖尿病そのものだけでは、原則、等級に該当しません。","がん":"検査数値だけでなく全身の状態で判断されます。血液のがんも対象です。","肝臓":"検査値と全身状態の組み合わせで判断されます。","呼吸器":"在宅酸素療法をしている場合は原則3級です。","血液・造血器":"貧血・血小板減少・血友病なども対象です。","肢体の障害":"人工関節は原則3級。歩く・座る・立つの障害も対象です。","目":"視力だけでなく視野の障害も対象です。","耳・めまい":"平均聴力レベルと語音明瞭度で判断。めまい(平衡機能)も対象です。","話す・食べる":"音声・言語、そしゃく・嚥下の障害も対象です。","難病・その他":"どの節にも当てはまらない傷病は「その他の疾患」として総合的に認定されます。"}
    rows=[]
    for gname,gnote,items in groups:
        cards="".join('<div class="card"><h3>%s</h3><p>%s</p><span class="src">%s</span><a class="more" href="%s">このページへ →</a></div>'%(E(n),E(hints.get(n,"")),E(c),'byoki-utsu.html' if n.startswith("うつ") else '#') for n,c in items)
        rows.append(f'<div class="sh" style="margin-top:28px"><div><h3 style="font-size:var(--fs-h2)">{E(gname)}</h3><p>{E(gnote)}</p></div></div><div class="cards">{cards}</div>')
    h=hero("病気から探す ― 21の病気","障害年金は、病名で決まる制度ではありません。ただし、審査で見られるところは病気ごとに違います。精神の障害は診断書の裏面の7項目と程度、内部の病気は検査値と一般状態区分、体・感覚の障害は測定値。自分の病気で、どこが見られるのかから確認してください。",(("トップ","index.html"),("病気別",None)),extra='<div class="chips" style="margin-top:14px"><a class="on" href="#">すべて 21</a><a href="#">精神・発達 9</a><a href="#">内部の病気 7</a><a href="#">体・感覚の障害 5</a></div><p class="note">病名の一部で絞り込めます(例: ADHD → 発達障害、透析 → 腎臓病・人工透析)。端末の中だけで動き、何も送信しません。</p>')
    # 診断書の種類ごとの非該当率は「順位」が情報なので横棒で。件数は表で併記
    bars=hbars([("呼吸器",36.9,"chart-1"),("血液・その他",34.1,"chart-1"),("循環器",18.4,"chart-2"),("肢体",13.2,"chart-2"),("腎・肝・糖尿病",12.1,"chart-2"),("精神・知的",11.8,"chart-2"),("聴覚等",7.3,"chart-3"),("眼",6.5,"chart-3")],40,w=320,unit="%",lw=96)
    figA=fig("診断書の種類ごとの非該当の割合(令和6年度)","13.0%","全体(146,225件)",bars,"呼吸器・血液その他は3件に1件が非該当。精神・知的(11.8%)と肢体(13.2%)は全体並みです。","日本年金機構 障害年金業務統計(令和6年度決定分)。非該当÷決定件数で計算 ・ 確認日 2026-09-02")
    tbl=numtable([("精神障害・知的障害","11.8%","99,386件"),("肢体","13.2%","24,692件"),("循環器疾患","18.4%","4,891件"),("腎疾患・肝疾患・糖尿病","12.1%","7,912件"),("呼吸器疾患","36.9%","1,008件"),("血液・造血器・その他","34.1%","6,753件"),("眼","6.5%","3,035件"),("聴覚等","7.3%","3,083件")],head=("診断書の種類","非該当の割合","決定件数"))
    stats=sec("数字で見る ― 障害の種類ごとの非該当の割合", f'<div class="two">{figA}<div>{tbl}<p class="note">厚生労働省の認定状況調査(令和6年度・抽出1,000件)では、精神 12.1%・外部障害 10.8%・内部障害 20.6%。内部障害は検査値と生活の両方が見られます。</p></div></div>', "病気ごとに見られる場所が違うので、非該当の割合も違います。", band=True)
    know=know_block(U,["ku-dr-20","ku-pos-07","ku-pos-17","ku-pos-37"], heading="病名より先に、知っておくこと", lead="知識240項目から4つ。")
    body=h+f'<section class="sec"><div class="wrap">{"".join(rows)}</div></section>'+stats+know
    open(os.path.join(OUT,"byoki.html"),"w",encoding="utf-8").write(page("病気から探す｜障害年金申請サポート","",body,current="byoki",mock_note="病気から探す(一覧)。3群・21枚。一言は「当てはまる側」から。数字は表で"))

# ---------------- 4. 病気ハブ(うつ病・双極性障害) ----------------
def byoki_utsu():
    cases=[(True,"うつ病 ・ 3級→2級","家族の援助を要する日常生活能力と、就労支援での短時間作業も続かなかった経過を総合し、障害認定日に2級に該当するとして3級の原処分を取り消した。","厚生年金 ・ 争点: 障害の程度 ・ 原文PDFあり"),(True,"うつ病 ・ 初診日","診察券と初診時に処方された抗うつ薬の薬袋などから申立てた受診日を初診日と認定し、初診日を確認できないとした原処分を取り消した。","国民年金 ・ 争点: 初診日 ・ 原文PDFあり"),(False,"うつ病 ・ 障害の程度","日常生活の制限が診断書に十分に記載されず、2級には該当しないとして請求を棄却。","国民年金 ・ 争点: 障害の程度 ・ 原文PDFあり")]
    rows=[("新たに決定した障害年金のうち、精神の障害によるもの","70.3%"),("精神の障害の非該当(不支給)の割合","12.1%(全体は13.0%、内部障害は20.6%)"),("決まった等級の分布(新規・全体)","1級 10.9% ／ 2級 53.9% ／ 3級 22.1% ／ 非該当 13.0%"),("精神の不支給のうち、目安表で軽い側の区分だったもの","75.3%"),("精神の再認定(更新)で継続した件数","238,772件(支給停止 1,026件)")]
    return hub_page("byoki-utsu-soukyoku","byoki-utsu.html",crumbs=(("トップ","index.html"),("病気別","byoki.html"),("うつ病・双極性障害",None)),units=["ku-pos-22","ku-dr-14","ku-dr-16","ku-dr-02"],tool=("等級の目安をしらべる","受け取った診断書の裏面の7項目と程度を、国の目安表に当てはめます。判定ではなく、国が公表している表を持つだけの機能です。","mitate.html"),cases=cases,current="byoki",articles=["うつ病で障害年金 ― 診断書の裏面が結果を決める","主治医に伝えること6つ ― 5分診療の現実解","等級判定ガイドラインの読み方 ― 目安表で自分の位置を出す","診察前メモの作り方 ― 1日1〜2行でいい","更新が怖くて働けない人へ ― 再認定304,456件の中身"],stats_rows=rows,stats_src="厚生労働省 認定状況調査(令和6年度・抽出)と日本年金機構 業務統計(令和6年度決定分)から。確認日 2026-09-02")

# ---------------- 5. 申請の流れ ----------------
def shinsei():
    steps=[("初診日を確認する","すべての起点。制度・納付要件・金額の見通しにつながります。",["その症状で最初にかかった病院と日付を確認する","転院していれば、いちばん最初の病院での受診日","病名がついた日・診断がついた日ではない"],"診断名がついた日が初診日とは限りません。カルテがなくても、診察券・薬袋・転院先の記録・第三者証明など、確認できる道が残る場合があります。","争点 初診日 35件(裁決91件中)",["ku-fv-01","ku-fv-06"]),
           ("納付要件を確認する","初診日の前日時点の、保険料の納め方を確認します。",["年金事務所で納付記録を見る(予約制・無料)","3分の2以上か、直近1年に未納なしか、どちらか一方","20歳前の初診なら、この要件は問われない"],"記憶だけで未納だと思い込み、確認前に結論を出さないことが大切です。判定されるのは初診日の前日時点で、初診日より後の納付は反映されません。","争点 納付要件 10件",["ku-pay-01","ku-pay-02"]),
           ("年金事務所へ相談する","必要な様式を受け取り、確認する順番を整理します。",["予約の電話で「障害年金の相談」と伝える","年金手帳(基礎年金番号)・分かる範囲の初診日・お薬手帳を持参","家族が代わりに行くなら委任状"],"窓口での見立ては審査結果そのものではありません。説明がわかりにくいときは、日付と確認した内容をメモし、次回もう一度聞いても構いません。","相談は無料・予約制",["ku-pos-09","ku-doc-11"]),
           ("必要書類をそろえる","自分の請求に必要な書類を、ひとつずつ集めます。",["年金請求書・診断書・受診状況等証明書(初診と今の病院が違うとき)・病歴就労状況等申立書","戸籍・住民票はマイナンバーで省略できる場合がある","出した書類はすべてコピーを残す"],"すべてを同時に集める必要はありません。診断書など現症日の期限がある書類と、初診日の証明の進み具合を見ながら順番を決めます。","書類の期限: 診断書は現症日から3か月以内",["ku-doc-01","ku-doc-15"]),
           ("診断書の準備をする","診察室の外での生活が、主治医に伝わるように整えます。",["普段のいちばん大変なときを、紙に書いて渡す","「誰が・何を・どのくらい」援助しているかを伝える","受け取った診断書は、封を開けて確認してよい"],"診察では反射的に「大丈夫です」と答えることがあります。渡せなくても失敗ではありません。自分の手元でメモを見ながら話す方法でも十分です。","精神の不支給の75.3%は、目安表で軽い側",["ku-dr-04","ku-dr-05"]),
           ("申立書を作成する","病歴と生活・仕事の実態を、診断書と同じ方向で伝えます。",["発病から今までを、期間ごとに区切って書く","「動けない時間」を数字で(週何日・1日何時間)","一気に書かなくていい。家族が代筆してもよい"],"「つらかった」だけで終えず、入浴回数や家族の声かけなど、読み手が生活を想像できる事実に置き換えると伝わりやすくなります。","申立書は本人が書ける唯一の書類",["ku-st-01","ku-st-03"]),
           ("年金事務所へ提出する","控えを残し、受付日と不足書類の有無を確認します。",["初診日に国民年金なら市区町村の窓口でも出せる","郵送でも審査は不利にならない(簡易書留・折らない・送付状)","診断書と申立書の食い違いを最後に確認"],"診断書は封を開けて内容を確認して構いません。事実関係の誤りがあれば、提出前に医療機関へ確認します。評価そのものは医師の判断です。","提出先は初診日の制度で決まる",["ku-doc-04","ku-doc-07"]),
           ("結果を待つ","照会に対応しながら、届いた通知の内容を確認します。",["目安は提出から約3か月(複数回審査なら4か月)","途中経過の連絡は基本的にない。照会が来ても不支給のサインではない","不支給なら、通知を知った日の翌日から3か月が審査請求の期限"],"不支給が生活の行き止まりになるわけではありません。不服申立てには期限があるため、通知を知った日を記録し、相談先と次の選択肢を確認してください。","支給 87.0%(令和6年度)",["ku-pos-11","ku-up-05"])]
    tools={2:("年金事務所を探す","管轄の年金事務所と、予約のしかた"),3:("必要書類チェックリスト","自分の場合に要る書類だけを一覧に"),4:("等級の目安をしらべる","受け取った診断書の裏面を、国の目安表に当てはめる"),5:("申立書をつくる","期間ごとに書いて、公式様式に重ねて印刷"),6:("年金事務所を探す","どこに出せばいい？")}
    cards=[]
    for i,(t,one,tasks,stumble,chip,ids) in enumerate(steps):
        tool=tools.get(i)
        lis="".join("<li>"+E(x)+"</li>" for x in tasks)
        kus="".join('<p><span style="color:var(--c-meta);font-size:var(--fs-meta)">知識ユニット</span> <strong>'+E(U[k]['title'])+'</strong> ― '+E(U[k]['body'][:120])+'…</p>' for k in ids)
        tl='<div class="tool" style="padding:12px 16px"><b>'+E(tool[0])+'</b><span style="font-size:var(--fs-small)">'+E(tool[1])+'</span><a class="cta" href="#">'+E(tool[0])+' →</a></div>' if tool else ''
        cards.append('<div class="stepcard" id="step-%d"><div class="hd2"><b>%d. %s</b><span class="chip">%s</span></div><p>%s</p><ul style="margin:0;padding-left:1.2em;font-size:var(--fs-small)">%s</ul><div class="stumble"><b>つまずきやすいところ</b><br>%s</div>%s%s</div>'%(i+1,i+1,E(t),E(chip),E(one),lis,E(stumble),kus,tl))
    rail_html='<nav class="rail" aria-label="目次"><b>8つのステップ</b>'+"".join('<a href="#step-%d"%s>%d. %s</a>'%(i+1,' class="cur"' if i==0 else '',i+1,E(st[0])) for i,st in enumerate(steps))+'</nav>'
    h=hero("障害年金の申請の流れ ― 8つのステップ","初診日の確認から結果が届くまで。左から右へ順番に進みます。一度に全部を進める必要はありません。提出から結果までの目安は3か月、令和6年度は新たに決定した146,225件のうち87.0%で支給が認められました。",(("トップ","index.html"),("申請の流れ",None)),extra='<div class="steps" style="margin-top:14px">'+"".join('<div class="step%s"><i>%d</i>%s</div>'%(' tool' if i in (3,4,5,6,7) else '',i,st[0]) for i,st in enumerate(steps,1))+'</div>')
    body=h+f'<section class="sec"><div class="wrap"><div class="layout">{rail_html}<div>{"".join(cards)}</div></div></div></section>'
    body+=sec("時間の目安", numtable([("準備(初診日の確認〜提出)","1〜3か月が多い。カルテ探しがあれば長くなる"),("提出〜結果(年金証書)","約3か月(標準処理期間)。複数回審査なら4か月"),("年金証書〜初回振込","約1〜2か月"),("初回振込の中身","受給権が発生した月の翌月分からまとめて(事後重症は請求月の翌月分から)"),("不支給のときの審査請求","決定を知った日の翌日から3か月以内")],head=("区間","目安")), "数字は日本年金機構の公表資料から。確認日 2026-09-05", band=True)
    open(os.path.join(OUT,"shinsei.html"),"w",encoding="utf-8").write(page("障害年金の申請の流れ ― 8つのステップ｜障害年金申請サポート","",body,current="shinsei",mock_note="申請の流れ。左の固定目次(チェック欄なし)。各ステップ=1文+やること3つ+つまずき+知識ユニット2+その場で使える機能"))

# ---------------- 6. 困りごとハブ(不支給) ----------------
def nayami_hub():
    cases=[(True,"統合失調症 ・ 初診日","初診日を確認できないとして却下された請求について、複数医療機関の資料を総合して初診日を認定し、2級該当として原処分取消。","併給(国年+厚年) ・ 争点: 初診日 / 障害の程度 ・ 原文PDFあり"),(True,"自閉スペクトラム症 ・ 診断書の現症日","感染症への不安で通院できなかった事情等を考慮し、現症日が3か月を超えた診断書で判断できるとして原処分取消。","国民年金 ・ 争点: 診断書の信頼性 / 手続 ・ 原文PDFあり"),(False,"うつ病 ・ 障害の程度","日常生活の制限が診断書に十分に記載されず、2級には該当しないとして請求を棄却。","国民年金 ・ 争点: 障害の程度 ・ 原文PDFあり")]
    rows=[("令和6年度に新たに決定した件数","146,225件"),("そのうち非該当","18,982件(13.0%)"),("非該当の割合(障害の種類別)","精神 12.1% ／ 外部 10.8% ／ 内部 20.6%"),("日本年金機構の点検で、不支給から支給に変わった件数","444件 ／ 点検済 14,841件(3.0%、令和8年3月31日現在)"),("公開裁決例91件のうち、結論が変わった件数","59件(争点: 障害の程度57・初診日35・診断書15・納付要件10)")]
    return hub_page("nayami-fushikyu","nayami-hub.html",crumbs=(("トップ","index.html"),("困りごと別","#"),("不支給と言われたとき",None)),units=["ku-up-05","ku-up-12","ku-up-06","ku-pos-16"],tool=("等級の目安をしらべる","診断書が手元にあるなら、書かれた数字で自分の位置を確かめられます。","mitate.html"),cases=cases,current="nayami-hub",articles=["不支給のあとの審査請求 ― 3か月の使い方","同じ資料で出し直しても結果は変わらない ― 何を足すか","診断書が実態と違うとき ― 提出前・提出後にできること","審査の仕組みと認定医 ― 窓口で話したことは審査に届かない"],stats_rows=rows,stats_src="日本年金機構 業務統計・点検結果、厚生労働省 認定状況調査、社会保険審査会 裁決集から。確認日 2026-09-02")

# ---------------- 7. 実例と数字 ----------------
def jitsurei():
    h=hero("実例と数字 ― 公開裁決例91件","一度は認められなかったあと、国の再審査で結論が見直された実例を含む91件です。すべて原文(公的PDF)を確認できます。結論が変わった59件と、認められなかった32件を、同じ密度で載せています。通った話だけを見ても、自分がどちらに近いかは分からないからです。",(("トップ","index.html"),("実例と数字",None)),extra='<div class="chips" style="margin-top:14px"><a class="on" href="#">すべて 91</a><a href="#">結論が変わった 59</a><a href="#">認められなかった 32</a><a href="#">精神の障害 39</a><a href="#">初めての申請 75</a><a href="#">更新・支給停止 11</a></div><p class="note">この割合は、申請全体の支給割合ではありません。公開されている裁決から集めたものです。全体の支給割合は87.0%です。</p>')
    yomi=sec("読み方 ― 3つの数字", numtable([("91件","原文のPDFを確認できた裁決例。構造化した94件のうち、原文が404だった3件は載せていません"),("59件","容認54件と一部容認5件。「結論が変わった」= 原処分の取消し"),("32件","棄却。認められなかった理由も、同じ密度で載せています")],head=("数字","意味")), band=True)
    soten=sec("争点で絞り込む", numtable([("障害の程度・等級該当性","57件","診断書に生活の実態が書かれていたかが分かれ目"),("初診日","35件","診察券・薬袋・紹介状・第三者証明で認められた例がある"),("診断書の信頼性・整合性","15件","現症日・申立書との食い違い"),("手続その他","13件",""),("納付要件","10件","免除・猶予の期間の扱い、初診日が動いた例"),("相当因果関係","5件",""),("社会的治癒","4件",""),("遡及・時効","2件","")],head=("争点","件数","分かれ目"))+numtable([("年金の種類","厚生年金 36 ／ 国民年金 36 ／ 併給 19"),("請求の種類","初回 75 ／ 更新・支給停止 11 ／ 額改定 4 ／ その他 1"),("病名(多い順)","統合失調症 11 ／ うつ病 5 ／ 全身型重症筋無力症 2 ／ 眼瞼けいれん 2 ／ 糖尿病性腎症 2 ／ 心原性脳塞栓症 2")],head=("区分","内訳")))
    cases=[(True,"統合失調症 ・ 併給(国年+厚年) ・ 初回 ・ 令和4・5年","初診日を確認できないとして却下された請求について、複数医療機関の資料を総合して初診日を認定し、2級該当として原処分取消。","争点: 初診日 / 障害の程度・等級該当性 ・ 裁決の原文(PDF)を読む →"),(True,"自閉スペクトラム症 ・ 国民年金 ・ 初回","感染症への不安で通院できなかった事情等を考慮し、その診断書で判断できるとして原処分が取り消された。","争点: 診断書の信頼性 / 手続 ・ 裁決の原文(PDF)を読む →"),(False,"うつ病 ・ 国民年金 ・ 初回","日常生活の制限が診断書に十分に記載されず、2級には該当しないとして請求を棄却。","争点: 障害の程度 ・ 裁決の原文(PDF)を読む →"),(True,"糖尿病性腎症 ・ 厚生年金 ・ 更新","人工透析を導入した時点の状態を再評価し、2級に該当するとして支給停止処分を取り消した。","争点: 障害の程度 ・ 裁決の原文(PDF)を読む →")]
    list_html="".join('<div class="case"><span class="tag%s">%s</span><div><b>%s</b><p>%s</p><span class="src">%s</span></div></div>'%('' if ok else ' no','結論が変わった' if ok else '認められなかった',E(t),E(s2),E(f)) for ok,t,s2,f in cases)
    lst=sec("実例(1〜4件目 / 91件)", list_html+'<p class="note">1ページ12件。番号つきのページ送りで、途中からでも戻れます。</p>', band=True)
    know=know_block(U,["ku-pos-90","ku-up-10","ku-up-13"], heading="実例を読む前に", lead="知識240項目から3つ。")
    f1=fig("非該当の割合の推移(令和2〜6年度)","13.0%","令和6年度",vbars([("R2",8.0),("R3",7.8),("R4",7.7),("R5",8.4),("R6",13.0)],16,hi=4),"令和2〜5年度は8%前後でしたが、令和6年度は13.0%に上がりました。","日本年金機構 障害年金業務統計(令和2〜6年度決定分) ・ 確認日 2026-09-02")
    f2=fig("更新(再認定)の結果(令和6年度)","96.7%","304,456件のうち、継続",band([("a",96.7,"継続 96.7%"),("c",1.4,""),("b",0.8,""),("k",1.1,"")],"継続96.7%、増額1.4%、減額0.8%、支給停止1.1%")+'<p class="legend"><span><i style="background:var(--chart-3)"></i>増額 1.4%</span><span><i style="background:var(--chart-2)"></i>減額 0.8%</span><span><i style="background:var(--c-heading)"></i>支給停止 1.1%</span></p>',"100件のうち約97件は、そのまま続いています。","日本年金機構 障害年金業務統計(令和6年度決定分) ・ 確認日 2026-09-02")
    suuji=sec("数字で見る障害年金 ― 全体の数字", f'<div class="figs two" style="margin-bottom:18px">{f1}{f2}</div>'+numtable([("新たに決定した件数(令和6年度)","146,225件"),("支給が認められた割合","87.0%(127,243件)"),("非該当","13.0%(18,982件)。令和2〜5年度は 8.0 / 7.8 / 7.7 / 8.4%"),("精神の障害が占める割合","70.3%(認定状況調査・抽出1,000件)"),("再認定(更新)","304,456件。継続 96.7% ／ 増額 1.4% ／ 減額 0.8% ／ 支給停止 1.1%"),("機構の点検","不支給14,841件のうち444件(3.0%)が支給に(令和8年3月31日現在)")],head=("項目","数字")), "日本年金機構 障害年金業務統計(令和6年度決定分)・厚生労働省 認定状況調査(令和6年度)。確認日 2026-09-02", more=("数字のページをすべて見る","#"))
    body=h+yomi+soten+lst+know+suuji
    open(os.path.join(OUT,"jitsurei.html"),"w",encoding="utf-8").write(page("実例と数字 ― 公開裁決例91件｜障害年金申請サポート","",body,current="jitsurei",mock_note="実例と数字。図は推移(跳ね)と更新(大多数)の2枚だけ。争点は表で(分かれ目の説明が要るため)"))

# ---------------- 8. 誤解(一覧+1枚) ----------------
def gokai():
    src=open(os.path.join(PUB,"data/gokai.ts"),encoding="utf-8").read()
    cards=re.findall(r'"slug": "([^"]+)",\s*"misconception": "([^"]+)",\s*"truth": "([^"]+)"',src)
    groups={}
    for slug,mis,truth in cards:
        groups.setdefault("その他",[]).append((slug,mis,truth))
    items="".join(f'<div class="card"><span class="q">{E(m)}</span><p>{E(t)}</p><a class="more" href="gokai-card.html#{s}">くわしく見る →</a></div>' for s,m,t in cards[:12])
    h=hero("よくある誤解 ― 49の思い込みを、公的資料で確かめる","あきらめる前に確かめてほしい、よくある思い込みです。1つの誤解に1ページ。それぞれに「本当はこう」「なぜそう思われているか」「制度ではこうなっている」「確認すること」「主治医や窓口で聞くこと」を置いています。すべて公的資料で確認し、確認日を明記しています。",(("トップ","index.html"),("よくある誤解",None)),extra='<div class="chips" style="margin-top:14px"><a class="on" href="#">すべて 49</a><a href="#">申請の前に</a><a href="#">初診日・納付</a><a href="#">診断書・審査</a><a href="#">お金</a><a href="#">受給後</a></div>')
    lst=sec("誤解の一覧(先頭12件)", f'<div class="cards">{items}</div><p class="note">全49件。ページの上のチップで絞り込めます。</p>')
    body=h+lst
    open(os.path.join(OUT,"gokai.html"),"w",encoding="utf-8").write(page("よくある誤解｜障害年金申請サポート","",body,current=None,mock_note="誤解の一覧。誤解の帯→本当はこう→くわしく"))
    # 1枚
    b=open(os.path.join(PUB,"data/gokai-bodies.ts"),encoding="utf-8").read()
    i=b.index('"hataraitetara-muri"'); jend=b.find('\n  },\n  "', i); blk=b[i:jend if jend>0 else i+12000]
    secs=re.findall(r'"heading": "([^"]+)",\s*"blocks": \[(.*?)\]\s*\}',blk,flags=re.S)
    out=[]
    for hd,blocks in secs:
        out.append(f"<h2>{E(hd)}</h2>")
        for typ,text in re.findall(r'"type": "(\w+)",\s*"text": "([^"]+)"',blocks):
            out.append(f"<h3>{E(text)}</h3>" if typ=="h3" else f"<p>{E(text)}</p>")
    body_html="\n".join(out)
    h=hero("働いていたら障害年金は無理？ ― 国のガイドラインは「働いている事実だけで判断しない」と書いています","働いていること自体は対象外の理由になりません。見られるのは、どんな配慮や援助の中で働けているかです。障害者雇用や就労支援での就労は、1級・2級の可能性を検討する対象と国のガイドラインに書かれています。",(("トップ","index.html"),("よくある誤解","gokai.html"),("働いていたら無理",None)),hito="働いていても、請求できます。落ちる原因の多くは、働いている事実ではなく、配慮や援助が書類に書かれていないことです。",date="2026年9月3日")
    chk='<div class="card"><h3>確認すること</h3><ul style="margin:0;padding-left:1.2em;font-size:var(--fs-small)"><li>診断書の就労欄に、仕事の中身と配慮が書かれているか</li><li>申立書に「週何日・1日何時間・免除されている業務・休んだ日数・誰の助け」があるか</li><li>帰宅後の状態(横になる時間、家事は誰がしているか)を書いたか</li></ul></div><div class="card"><h3>主治医に聞くこと</h3><p>「働いていますが、どんな配慮を受けているか、それでも起きていることを診断書に書いていただけますか」</p></div>'
    stats=numtable([("新たに決定した障害年金のうち、精神の障害","70.3%"),("再認定(更新)で継続","96.7%(304,456件中)"),("ガイドラインの原文","就労系障害福祉サービス(就労継続支援A型・B型)及び障害者雇用制度による就労については、1級または2級の可能性を検討する")],head=("数字・根拠","内容"))
    # 現行の誤解ページは 結論/なぜ/制度/数字/実例/自分の場合/窓口/FAQ/次に読む/出典 を本文に持つ。テンプレで足すのは 一言・左レール・知識ユニット だけ(重ねない)
    body2=h+f'<section class="sec"><div class="wrap"><div class="layout"><nav class="rail"><b>目次</b>'+"".join(f'<a href="#">{E(hd)}</a>' for hd,_ in secs)+f'</nav><div class="body">{body_html}</div></div></div></section>'+know_block(U,["ku-pos-15","ku-dr-19","ku-st-07"],heading="この誤解に関わる知識",lead="知識240項目から3つ。")
    open(os.path.join(OUT,"gokai-card.html"),"w",encoding="utf-8").write(page("働いていたら障害年金は無理？｜よくある誤解","",body2,current=None,mock_note="誤解1枚。本文は現行の原稿そのまま。追加=一言・左レール目次・知識ユニット"))

# ---------------- 9. コラム記事 ----------------
def column():
    src=open(os.path.join(PUB,"content/columns/koushin-kakuninhodo.ts"),encoding="utf-8").read()
    lead=re.findall(r'export const lead = \[(.*?)\];',src,flags=re.S)[0]
    leads=[fix_nums(html.unescape(x)) for x in re.findall(r'"((?:[^"\\]|\\.)*)"',lead)]
    m=re.search(r'const content = "((?:[^"\\]|\\.)*)";',src,flags=re.S)
    mdtxt=json.loads('"'+m.group(1)+'"') if m else ""
    # 96.8/1.0 の混在は top-sasshin-2 §7 で直す前提。モックでは業務統計の値に置換して見せる
    mdtxt=fix_nums(mdtxt)
    titles=h2_titles(mdtxt)
    cps={0:leads[0],1:leads[1],2:leads[2],11:leads[3]} if len(leads)>=4 else {}
    body=md_to_html(mdtxt, checkpoints=cps)
    chars=len(re.sub(r"\s","",mdtxt)); mins=-(-chars//500)
    concl='<div class="card" style="margin-bottom:22px"><h3>この記事の結論</h3>'+"".join(f"<p>{E(l)}</p>" for l in leads)+'</div>'
    h=hero("障害年金の更新(障害状態確認届)の仕組みと備え ― 更新は診断書1枚の勝負","",(("トップ","index.html"),("更新が不安なとき","nayami-hub.html"),("更新の仕組みと備え",None)),date=f"2026年9月4日 ／ 読む目安 約{mins}分")
    nxt=sec("次にすること", '<div class="two"><div class="tool"><b>等級の目安をしらべる</b><span style="font-size:var(--fs-small)">更新の診断書を受け取ったら、書かれた数字で自分の位置を確かめられます。</span><a class="cta" href="mitate.html">等級の目安をしらべる →</a><small>入力した内容はサーバーへ送りません。</small></div><div><p style="font-size:var(--fs-meta);color:var(--c-meta);margin:0 0 6px">次に読む</p><ol style="margin:0;padding-left:1.2em;font-size:var(--fs-small)"><li><a href="#">支給停止からの復活 ― 支給停止事由消滅届</a></li><li><a href="#">額改定請求 ― 原則1年待ち、精神に例外なし</a></li><li><a href="joukyou-hub.html">働きながら申請する・受け取る</a></li></ol><p class="note">今日はここまでで大丈夫です。</p></div></div>', band=True)
    body_all=h+f'<section class="sec"><div class="wrap"><div class="layout">{rail(titles)}<div class="body">{concl}{body}</div></div></div></section>'+nxt
    open(os.path.join(OUT,"column.html"),"w",encoding="utf-8").write(page("障害年金の更新(障害状態確認届)の仕組みと備え｜コラム","",body_all,current="column",mock_note="コラム記事。結論の箱・左レール目次・ここまでの要約(リード再掲)・末尾の次にすること"))

# ---------------- 10. 道具(等級の目安) ----------------
def mitate():
    table={'3.5以上':[None,None,None,'1級又は2級','1級'],'3.0以上3.5未満':[None,None,'2級','2級','1級又は2級'],'2.5以上3.0未満':[None,None,'2級又は3級','2級',None],'2.0以上2.5未満':[None,'3級又は3級非該当','2級又は3級','2級',None],'1.5以上2.0未満':[None,'3級又は3級非該当','3級',None,None],'1.5未満':['3級非該当','3級非該当',None,None,None]}
    def cls(v):
        if not v: return "g0"
        if v.startswith("1級"): return "g1"
        if v.startswith("2級"): return "g2"
        return "g3"
    grid='<div class="grid-table"><div class="h">判定の平均 ＼ 程度</div>'+"".join('<div class="h">(%d)</div>'%i for i in range(5,0,-1))
    for row,vals in table.items():
        grid+='<div class="h" style="text-align:left">'+row+'</div>'+"".join('<div class="%s">%s</div>'%(cls(v),v or '―') for v in reversed(vals))
    grid+='</div>'
    items=["適切な食事","身辺の清潔保持","金銭管理と買い物","通院と服薬","他人との意思伝達及び対人関係","身辺の安全保持及び危機対応","社会性"]
    form='<div class="cards two"><div class="card"><h3>1. 診断書の裏面「日常生活能力の判定」7項目</h3>'+"".join('<p><b style="color:var(--c-heading)">'+E(x)+'</b><br><span style="font-size:var(--fs-meta);color:var(--c-meta)">○ できる ／ ○ おおむねできるが時には助言や指導を必要とする ／ ○ 助言や指導があればできる ／ ○ 助言や指導をしてもできない若しくは行わない</span></p>' for x in items)+'</div><div class="card"><h3>2. 「日常生活能力の程度」(1)〜(5)</h3><p>(1) 精神障害を認めるが、社会生活は普通にできる<br>(2) 家庭内での日常生活は普通にできるが、社会生活には援助が必要<br>(3) 家庭内での単純な日常生活はできるが、時に応じて援助が必要<br>(4) 日常生活における身のまわりのことも、多くの援助が必要<br>(5) 身のまわりのことはほとんどできないため、常時の援助が必要</p><h3 style="margin-top:12px">3. 結果(例)</h3><p>7項目の平均 <b class="num" style="font-size:22px">2.71</b> ／ 程度 <b class="num" style="font-size:22px">(3)</b> → 目安表の位置: <b style="color:var(--c-heading)">2級又は3級</b></p><p class="note">これは国が公表している目安表に当てはめた結果です。このサイトが判定したものではありません。ガイドラインは、目安に加えて総合評価(就労状況・援助の内容・治療の経過など)で最終的に判断するとしています。</p><a class="cta" href="#" style="display:inline-block;background:var(--c-primary);color:#fff;border-radius:var(--r-pill);padding:8px 18px;font-weight:700">この結果を印刷する</a></div></div>'
    h=hero("等級の目安をしらべる ― 国の目安表に、診断書の数字を当てはめる","受け取った診断書(精神の障害用)の裏面にある「日常生活能力の判定」7項目と「日常生活能力の程度」を入れると、厚生労働省の等級判定ガイドラインの目安表のどこに位置するかが分かります。判定ではありません。国が公表している表を、そのまま持っているだけの機能です。入力した内容はサーバーへ送らず、この端末の中だけで動きます。",(("トップ","index.html"),("申請の流れ","shinsei.html"),("等級の目安をしらべる",None)))
    body=h+f'<section class="sec"><div class="wrap">{form}</div></section>'+sec("目安表(ガイドライン 表1)", grid+'<p class="note">空欄は「判定と程度の整合性が低い」ことを意味し、ガイドラインは診断書作成医への内容確認等を求めています。原本PDFと全セルを照合しています。</p>', "縦=7項目の平均、横=程度。", band=True)+sec("使う前に知っておくこと", numtable([("精神の不支給のうち、目安表で軽い側の区分だったもの","75.3%(令和6年度・認定状況調査)"),("1項目1点の差","平均で0.14。7項目が重なると帯が1つ動く"),("評価の前提","単身で生活し、援助を受けていない場合を想定して評価される"),("目安と最終判断","目安は保証ではない。総合評価(就労・援助・治療経過)で決まる")],head=("項目","内容")))+know_block(U,["ku-dr-15","ku-dr-16","ku-dr-18","ku-dr-17"],heading="この表を読むための知識",lead="知識240項目から4つ。")+sec("次の一歩",'<div class="cards"><div class="card"><h3>軽く出ていたら</h3><p>等級の書き換えを頼むのではなく、事実の追加提供を。事実の誤り・記載漏れは訂正を頼めます。</p><a class="more" href="#">診断書が実態と違うとき →</a></div><div class="card"><h3>まだ診断書がないなら</h3><p>普段のいちばん大変なときを、7項目の順に紙に書いて主治医に渡します。</p><a class="more" href="#">診察前メモの作り方 →</a></div><div class="card"><h3>記録を続けるなら</h3><p>診察前メモと日々の記録を、無料iPhoneアプリで。入力した内容はサーバーへ送りません。</p><a class="more" href="app.html">無料アプリについて →</a></div></div>',band=True)
    open(os.path.join(OUT,"mitate.html"),"w",encoding="utf-8").write(page("等級の目安をしらべる｜障害年金申請サポート","",body,current="shinsei",mock_note="道具(等級の目安)。入力→結果→目安表→知っておくこと→知識→次の一歩"))

# ---------------- 11. 受給が始まってから ----------------
def jukyuugo():
    rows=[("届いた月","年金証書の3か所(等級・次回診断書提出年月・年金の種類)を確認。法定免除・給付金・扶養の届出","受給が決まった後の手続き"),("1〜2か月後","初回の振込。決定月の翌月分からまとめて入る","いくら、いつ振り込まれるか"),("毎年","20歳前傷病の人だけ、前年所得で10月〜翌9月の支給が決まる","働くと年金はどうなるか"),("1〜5年ごと","更新(障害状態確認届)。誕生月の3か月前の月末に用紙が届き、誕生月の末日までに提出","更新が不安なとき"),("働き始めたとき","等級は「働いているか」ではなく「どう働いているか」で見られる","働くと年金はどうなるか"),("作業所・A型を使うとき","工賃・賃金は原則、年金に影響しない。20歳前傷病だけ所得の線がある","B型・A型作業所と障害年金"),("事業所が閉鎖したとき","年金は止まらない。失業給付と転所の順番がある","A型事業所が閉鎖したとき"),("止まったとき","支給停止事由消滅届か、審査請求","支給停止になったとき"),("65歳の前","事後重症請求は65歳の誕生日の前々日まで。65歳から老齢厚生年金と併給を選べる","65歳の選択")]
    tl="".join(f'<div class="stepcard"><div class="hd2"><b>{E(w)}</b><span class="chip"><a href="#">{E(l)} →</a></span></div><p>{E(t)}</p></div>' for w,t,l in rows)
    h=hero("受給が始まってから ― 更新・働く・お金・65歳","年金証書が届いたら、手続きは終わりではなく、続きが始まります。続くのは「更新」「働く」「お金」「65歳」の4つです。障害年金の受給権者は約255万人(令和4年度末)。毎年約30万件の更新(再認定)があり、そのうち96.7%はそのまま続いています。止まったのは1.1%です。多くの人は続きます。ただし、続くかどうかは診断書1枚で決まるので、普段の記録が効きます。",(("トップ","index.html"),("受給が始まってから",None)),hito="多くの人は続きます。続くかどうかは診断書1枚で決まるので、普段の記録が効きます。")
    body=h+sec("年金証書が届いてからの流れ", tl, "時間の順に並べています。読むのは、いま当てはまる1つだけで構いません。")
    body+=sec("多い不安3つと、その答え", '<div class="cards"><div class="card"><h3>働いたら止まる？</h3><p>止まりません。認定基準にもガイドラインにも「働いていたら対象外」とは書かれていません。ガイドラインは、就労継続支援A型・B型と障害者雇用での就労について「1級または2級の可能性を検討する」としています。</p></div><div class="card"><h3>更新で落ちる？</h3><p>令和6年度の再認定304,456件のうち、支給停止は1.1%でした。等級が下がった人を含めても、続いた人が大多数です。判断は診断書1枚で行われるので、普段の状態が診断書に書かれているかが分かれ目です。</p></div><div class="card"><h3>お金の話は誰に聞けばいい？</h3><p>障害年金は所得税がかかりません(国民年金法25条)。健康保険の扶養は年収180万円未満、20歳前傷病の所得制限は前年所得で決まります。線は3本しかないので、自分の数字を当てるだけで分かります。</p></div></div>', band=True)
    fb=fig("更新(再認定)の結果(令和6年度)","96.7%","304,456件のうち、継続",band([("a",96.7,"継続 96.7%"),("c",1.4,""),("b",0.8,""),("k",1.1,"")],"継続96.7%、増額1.4%、減額0.8%、支給停止1.1%")+'<p class="legend"><span><i style="background:var(--chart-3)"></i>増額 1.4%</span><span><i style="background:var(--chart-2)"></i>減額 0.8%</span><span><i style="background:var(--c-heading)"></i>支給停止 1.1%</span></p>',"100件のうち約97件は、そのまま続いています。止まったのは約1件です。","日本年金機構 障害年金業務統計(令和6年度決定分) ・ 確認日 2026-09-02")
    body+=sec("数字で見る ― 受給後", f'<div class="figs two" style="margin-bottom:18px">{fb}<div></div></div>'+numtable([("障害年金の受給権者","約255万人(令和4年度末)"),("再認定(更新)の件数","304,456件(令和6年度)"),("そのうち継続","96.7%(増額 1.4% ／ 減額 0.8% ／ 支給停止 1.1%)"),("就労継続支援B型の平均工賃","月24,141円(令和6年度)"),("就労継続支援A型の平均賃金","月91,451円(令和6年度)"),("20歳前傷病の所得制限","前年所得 3,761,000円超で2分の1停止、4,794,000円超で全額停止(令和8年度。10月分から 3,858,000円・4,918,000円)"),("A型事業所の利用者だった解雇者(令和6年度)","7,292人(うちB型等へ 3,834人・再就職 2,171人)")],head=("項目","数字")), "厚生労働省 年金部会資料・工賃実績・障害者部会資料、日本年金機構 業務統計・所得制限の通達から。確認日 2026-09-05")
    body+=know_block(U,["ku-pos-93","ku-up-14","ku-up-16","ku-pos-100"],heading="受給が始まってからの、知っておくこと",lead="知識240項目から4つ。")
    body+=sec("受給が始まってからのページ",'<div class="cards"><div class="card"><h3>働くと年金はどうなるか</h3><p>B型・A型・障害者雇用・一般就労の4つを横に並べて、等級・所得制限・保険料・更新で何が起きるかを1枚に。</p><a class="more" href="#">読む →</a></div><div class="card"><h3>B型・A型作業所と障害年金</h3><p>工賃・賃金は年金にどう関わるか。ガイドラインは作業所での就労を「1級または2級の可能性を検討する」としています。</p><a class="more" href="#">読む →</a></div><div class="card"><h3>抜け出すロードマップ</h3><p>B型から一般就労まで、段階ごとに年金はどうなるか。戻る道も。</p><a class="more" href="#">読む →</a></div><div class="card"><h3>受給後のお金の設計</h3><p>税金・扶養・保険料・生活保護・iDeCo・貯蓄の6本の線。</p><a class="more" href="#">読む →</a></div><div class="card"><h3>A型事業所が閉鎖したとき</h3><p>年金は止まらない。失業給付と転所の順番。</p><a class="more" href="#">読む →</a></div><div class="card"><h3>65歳の選択</h3><p>事後重症請求は65歳の誕生日の前々日まで。障害基礎年金と老齢厚生年金の併給。</p><a class="more" href="#">読む →</a></div></div>',band=True)
    open(os.path.join(OUT,"jukyuugo.html"),"w",encoding="utf-8").write(page("受給が始まってから ― 更新・働く・お金・65歳｜障害年金申請サポート","",body,current=None,mock_note="幹10の索引。年表→不安3つ→数字(更新の帯+表)→知識4つ→6ページ"))

# ---------------- 12〜14. 状況・お金・自分でやるか ----------------
def joukyou_hub():
    cases=[(True,"うつ病 ・ 3級→2級","家族の援助を要する日常生活の状態と、就労支援での短時間の作業も続かなかった経過を合わせて評価され、障害認定日に2級に該当するとして処分が取り消された。","厚生年金 ・ 争点: 障害の程度 ・ 原文PDFあり"),(True,"発達障害 ・ 厚生年金加入中の初診","障害者雇用で働きながらの請求で、就労の中身と援助を踏まえて3級が認められた。","厚生年金 ・ 争点: 障害の程度 ・ 原文PDFあり")]
    rows=[("新たに決定した障害年金のうち、精神の障害","70.3%"),("就労継続支援B型の平均工賃 ／ A型の平均賃金","月24,141円 ／ 月91,451円(令和6年度)"),("障害厚生年金の報酬比例部分","加入300月未満は300月とみなして計算"),("ガイドラインの原文","労働に従事していることをもって、直ちに日常生活能力が向上したものと捉えない")]
    return hub_page("joukyou-hatarakinagara","joukyou-hub.html",crumbs=(("トップ","index.html"),("状況別","#"),("働きながら申請するとき",None)),units=["ku-pos-15","ku-st-07","ku-dr-19","ku-pos-100"],tool=("申立書をつくる","就労状況の欄に「週何日・1日何時間・免除されている業務・休んだ日数・誰の助け」を書けます。期間ごとに書いて、公式様式に重ねて印刷。","#"),cases=cases,current="joukyou-hub",articles=["働きながら障害年金はもらえる？ ― ガイドラインの根拠つき","障害者雇用と障害年金 ― 手帳・雇用枠・年金は別の制度","更新が怖くて働けない人へ","働くと年金はどうなるか(受給後)"],stats_rows=rows,stats_src="厚生労働省 認定状況調査・工賃実績・等級判定ガイドライン、日本年金機構から。確認日 2026-09-05")

def okane_hub():
    rows=[("障害基礎年金 2級 ／ 1級","847,300円 ／ 1,059,125円(令和8年度)"),("障害厚生年金 3級の最低保障","635,500円"),("子の加算","第1子・第2子 各243,800円、第3子以降 各81,300円"),("配偶者の加給年金(障害厚生年金1・2級)","243,800円"),("年金生活者支援給付金","1級 7,025円/月 ／ 2級 5,620円/月"),("支払い","偶数月に2か月分ずつ。初回は受給権が発生した月の翌月分から"),("健康保険の扶養の線","年収180万円未満(障害年金を受けられる程度の障害がある人)")]
    return hub_page("okane-ikura","okane-hub.html",crumbs=(("トップ","index.html"),("お金","#"),("いくら受け取れるか",None)),units=["ku-amt-01","ku-amt-02","ku-amt-11","ku-pay-12"],tool=("障害年金の金額を計算する","等級・制度・子の人数を入れると、令和8年度の額で自分の場合の目安が出ます。","#"),cases=(),current="okane-hub",articles=["障害年金はいくらもらえる？ ― 令和8年度の額と計算","障害基礎年金と障害厚生年金の違い","非課税でも「収入」になる場面 ― 扶養の線","傷病手当金と障害年金 ― 減るのは手当金の側"],stats_rows=rows,stats_src="日本年金機構「障害基礎年金の受給要件・請求時期・年金額」ほか。確認日 2026-09-05")

def erabu_hub():
    rows=[("新たに決定した146,225件のうち、支給","87.0%(自分で申請した人も、頼んだ人も含む)"),("非該当の主な理由","初診日の証明、診断書と実態のずれ、納付要件"),("年金事務所の予約相談","無料。書類の点検もしてもらえる"),("有償で代行できるのは","社会保険労務士だけ(「公認の代行業者」は存在しない)")]
    return hub_page("erabu-jibun-ka-irai","erabu-hub.html",crumbs=(("トップ","index.html"),("自分でやるか、頼むか","#"),("自分で申請するか、依頼するか",None)),units=["ku-pos-74","ku-pos-95","ku-doc-14","ku-pos-94"],tool=("必要書類チェックリスト","自分の場合に要る書類だけを一覧に。自分で進めるなら、まずここから。","#"),cases=(),current=None,articles=["自分で申請する ― 書類の集め方と、つまずきやすい場所","社労士の選び方 ― 3つの基準","障害年金にかかるお金の話 ― 文書料・交通費・報酬の型","不支給と言われたあと、何ができるか"],stats_rows=rows,stats_src="日本年金機構 業務統計(令和6年度決定分)ほか。確認日 2026-09-05")

# ---------------- 15. 用語辞典 ----------------
def yougo():
    src=open(os.path.join(PUB,"data/yougo.ts"),encoding="utf-8").read()
    entries=re.findall(r'"term": "([^"]+)",\s*"yomi": "([^"]*)",\s*"paraphrase": "([^"]+)",\s*"body": "([^"]+)",\s*"note": "([^"]*)",\s*"category": "([^"]+)"',src)
    cats={}
    for t,y,p,b,n,c in entries: cats.setdefault(c,[]).append((t,y,p,b,n))
    secs=""
    for c,items in cats.items():
        dl="".join('<dt id="%s">%s <span style="font-weight:400;color:var(--c-meta);font-size:var(--fs-meta)">%s</span></dt><dd><b style="color:var(--c-heading)">%s</b><br>%s%s</dd>'%(E(t),E(t),E(y),E(p),E(b),('<br><span style="color:var(--c-meta);font-size:var(--fs-meta)">'+E(n)+'</span>') if n else '') for t,y,p,b,n in items)
        secs+=f'<h2 id="c-{E(c)}">{E(c)}({len(items)})</h2><dl class="dl">{dl}</dl>'
    h=hero("障害年金の用語辞典 ― 40語","申請で出会う言葉を、1行の言い換えと、3行の説明で。記事の中の用語は、この辞典に自動でつながります。",(("トップ","index.html"),("用語辞典",None)),extra='<div class="chips" style="margin-top:14px">'+"".join(f'<a href="#c-{E(c)}">{E(c)} {len(v)}</a>' for c,v in cats.items())+'</div>')
    body=h+f'<section class="sec"><div class="wrap"><div class="layout"><nav class="rail"><b>分類</b>'+"".join(f'<a href="#c-{E(c)}">{E(c)}</a>' for c in cats)+f'</nav><div class="body">{secs}</div></div></div></section>'
    open(os.path.join(OUT,"yougo.html"),"w",encoding="utf-8").write(page("障害年金の用語辞典｜障害年金申請サポート","",body,current=None,mock_note="用語辞典。分類5・40語。言い換え→説明→注"))

# ---------------- 16. アプリ ----------------
def app():
    feats=[("AIに相談","診察で話しきれなかったことや日々の不安を、一言から自分のペースで整理できます。"),("申請を8段階で案内","初診日の確認から結果を待つまで、いまの段階と次にすることが分かります。"),("診察メモを作成","日々の記録から、主治医へ見せられるA4一枚のメモを作れます。"),("申立書の下書き","記録をもとに、病歴・就労状況等申立書の各欄に入る文章を整理できます。"),("食い違いを確認","診察メモ、申立書、元の記録の間で内容が食い違っていないか確認できます。"),("端末内に保存","記録と相談履歴は端末内に保存。アカウント登録もアプリ内購入もありません。")]
    h=hero("障害年金の申請準備を、ひとつずつ手元で ― 無料iPhoneアプリ","「障害年金申請サポート」は、AI相談、日々の記録、診察メモ、申立書の下書きを一つにまとめたiPhoneアプリです。すべての機能が無料・アカウント登録不要。このサイトの8ステップと同じ順番で進みます。",(("トップ","index.html"),("無料アプリ",None)),extra='<p style="margin-top:12px"><a href="#" style="display:inline-block;background:var(--c-primary);color:#fff;border-radius:var(--r-pill);padding:10px 22px;font-weight:700">App Storeで見る</a>　<span style="font-size:var(--fs-meta);color:var(--c-meta)">iOS 15.1以降 ・ 無料 ・ アプリ内購入なし</span></p>')
    body=h+sec("申請と診察の準備に使えること",'<div class="cards">'+"".join(f'<div class="card"><h3>{E(t)}</h3><p>{E(c)}</p></div>' for t,c in feats)+'</div>',"書けるときに、できるところから。途中でやめても、あとから続けられます。")
    body+=sec("記録が結果を左右する理由", '<div style="max-width:820px"><p>障害年金の審査は書類だけで行われ、診断書に載っていないことは審査上「なかったこと」になります。診断書の裏面の7項目は診察室では観察できず、本人や家族からの聴き取りで書かれます。令和6年度、精神の障害で不支給になった人の75.3%は、診断書の「程度」が目安表の軽い側でした。診察室の数分で何が伝わるかが、そのまま結果になります。</p><p>だから、記録です。1日1〜2行でよく、書けない日があっても構いません。記録は診察で話す台本になり、診察メモになり、申立書の材料になります。</p></div>', band=True)
    body+=know_block(U,["ku-dr-05","ku-st-10","ku-dr-04"],heading="アプリが前提にしている3つのこと",lead="知識240項目から。")
    body+=sec("データの扱い",'<div style="max-width:820px"><p>記録と相談履歴は端末内に保存されます。AI機能を使うときだけ、対象の文章が処理のために送信されます。受給可否や等級の判定、医療や法律の助言は行いません。</p><p><a href="#">アプリのプライバシーポリシー</a> ／ <a href="#">アプリの利用規約</a> ／ <a href="#">サポート</a></p></div>')
    open(os.path.join(OUT,"app.html"),"w",encoding="utf-8").write(page("無料iPhoneアプリ｜障害年金申請サポート","",body,current=None,mock_note="アプリ紹介。機能6→なぜ記録か(数字)→知識3→安心"))

# ---------------- index of mocks ----------------
def mock_index(files):
    items="".join(f'<li><a href="{f}">{E(t)}</a> <span style="color:var(--c-meta);font-size:13px">{E(d)}</span></li>' for f,t,d in files)
    body=f'<section class="sec"><div class="wrap"><h1>全サイトのモック(2026-09-05・第3稿)</h1><p style="color:var(--c-body-muted)">図は「数字の形に意味があるとき」だけ(推移の跳ね・大多数・順位)。それ以外は文と表で。文言は知識ユニット240件・既存の原稿・公的資料の数字から。</p><ol style="line-height:2.2">{items}</ol></div></section>'
    open(os.path.join(OUT,"mocks.html"),"w",encoding="utf-8").write(page("全サイトのモック一覧","",body))

if __name__=="__main__":
    top(); hajimete(); byoki(); open(os.path.join(OUT,"byoki-utsu.html"),"w",encoding="utf-8").write(byoki_utsu()); shinsei()
    open(os.path.join(OUT,"nayami-hub.html"),"w",encoding="utf-8").write(nayami_hub()); jitsurei(); gokai(); column(); mitate(); jukyuugo()
    open(os.path.join(OUT,"joukyou-hub.html"),"w",encoding="utf-8").write(joukyou_hub()); open(os.path.join(OUT,"okane-hub.html"),"w",encoding="utf-8").write(okane_hub()); open(os.path.join(OUT,"erabu-hub.html"),"w",encoding="utf-8").write(erabu_hub())
    yougo(); app()
    mock_index([("index.html","トップ","第4稿。ヒーローは本番のデザイン、図は3枚"),("hajimete.html","はじめての方へ",""),("byoki.html","病気から探す(一覧)",""),("byoki-utsu.html","病気ハブ: うつ病・双極性障害",""),("shinsei.html","申請の流れ ― 8つのステップ","チェック欄なし"),("nayami-hub.html","困りごとハブ: 不支給と言われたとき",""),("jitsurei.html","実例と数字",""),("gokai.html","よくある誤解(一覧)",""),("gokai-card.html","誤解1枚: 働いていたら無理",""),("column.html","コラム記事: 更新の仕組みと備え",""),("mitate.html","道具: 等級の目安をしらべる",""),("jukyuugo.html","受給が始まってから(幹10)",""),("joukyou-hub.html","状況ハブ: 働きながら",""),("okane-hub.html","お金: いくら受け取れるか",""),("erabu-hub.html","自分でやるか、頼むか",""),("yougo.html","用語辞典",""),("app.html","無料アプリ","")])
    print("done", OUT)
