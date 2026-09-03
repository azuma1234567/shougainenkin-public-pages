// docs/shorui-tool-design-2026-09-02.md §8 の完了条件を機械検査する。
//   npm run verify:shorui
// 印刷(8)と実挙動(1,10,11)の実測は scripts/verify-shorui/print.mjs の結果を読む。
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { SHINDANSHO_FORMS, SHINDANSHO_NAIBU, SHORUI_DOCS, SHORUI_QUESTIONS, SHORUI_STORAGE_KEY, SHORUI_URLS, emptyShoruiAnswers } from "../../data/shorui.ts";
import { shoruiDocs, seikyuushoForms, shindanshoForms, showKokuminHaiguNote, showSokyuuNote, feeText, waitText } from "../../lib/shorui.ts";

const results = [];
const check = (id, label, fn) => {
  try { results.push({ id, label, ok: true, note: fn() ?? "" }); }
  catch (e) { results.push({ id, label, ok: false, note: e.message.split("\n")[0] }); }
};

const TOOL = "components/tools/ShoruiTool.tsx";
const DATA = "data/shorui.ts";
const CORE = "lib/shorui.ts";
const PAGE = "app/dougu/shorui/page.tsx";
const SOURCES = [TOOL, DATA, CORE, PAGE];
const src = (f) => readFileSync(f, "utf8");
const a = (p = {}) => ({ ...emptyShoruiAnswers(), ...p });
const ids = (s) => shoruiDocs(s).map((d) => d.id);

// 1. /dougu/shorui が動く。/dougu から行ける。
check(1, "/dougu/shorui が動き、/dougu から行ける", () => {
  assert.ok(existsSync(PAGE), `${PAGE} が無い`);
  assert.match(src("app/dougu/page.tsx"), /href: "\/dougu\/shorui"/, "/dougu の一覧に href が無い");
  assert.match(src("app/sitemap.ts"), /"\/dougu\/shorui"/, "sitemap に無い");
  assert.match(src("lib/published-links.ts"), /"\/dougu\/shorui"/, "公開判定に無い");
  assert.match(src(PAGE), /href: "\/dougu", label: "道具"/, "パンくずから /dougu へ戻れない");
  return "page.tsx / 一覧の href / sitemap / 公開判定 / パンくず";
});

// 2. 共通6件が最初から出る。7問すべて飛ばせる。役所の言葉を画面に出さない。
// (2026-09-03 の作り直し。docs/shorui-madoguchi-redesign-2026-09-03-instructions.md A-5 の 1・2・5)
check(2, "共通6件が最初から出て、7問とも飛ばせる。役所の言葉が画面に無い", () => {
  assert.equal(SHORUI_QUESTIONS.length, 7, "質問が7問でない");
  const always = SHORUI_DOCS.filter((d) => d.always).map((d) => d.id);
  assert.deepEqual(ids(a()), always, `未回答で出る書類が違う: ${ids(a()).join(",")}`);
  assert.equal(always.length, 6, `共通の書類が6件でない(${always.length})`);
  // 質問に「必須」の仕掛けが無い(選ばなくても結果が出る)
  assert.ok(!src(TOOL).includes("required"), "required がある");
  assert.match(src(TOOL), /prev\[id\] === v \? undefined : v/, "同じ選択肢をもう一度押して未回答へ戻せない");
  // 書類の一覧が質問より先に出ている(ソース上の並び)
  assert.ok(src(TOOL).indexOf('id="sr-docs"') < src(TOOL).indexOf('id="sr-q"'), "質問が書類より先にある");
  // A-5-2 「質問」「1.」〜「7.」「本来請求」「事後重症」「遡及」が画面に無い
  const screen = [SHORUI_QUESTIONS.map((q) => `${q.t} ${q.o.map(([, l]) => l).join(" ")}`).join("\n"),
    src(TOOL).replace(/\/\*[\s\S]*?\*\//g, " ")].join("\n");
  for (const w of ["本来請求", "事後重症", "遡及"]) assert.ok(!screen.includes(w), `画面に「${w}」がある`);
  assert.ok(!/<h2 id="sr-q">質問<\/h2>/.test(src(TOOL)), "見出しが「質問」のまま");
  assert.match(src(TOOL), /<h2 id="sr-q">あなたの場合に足すもの<\/h2>/, "見出しが「あなたの場合に足すもの」でない");
  assert.match(src(TOOL), />答えを消す</, "「答えを消す」が無い");
  for (const q of SHORUI_QUESTIONS) assert.ok(!/^\d/.test(q.t), `質問に番号が残っている: ${q.t}`);
  // A-5-5 回答で足された行に「あなたの場合」の印がある
  assert.match(src(TOOL), /const added = !d\.always;/, "足された行を見分けていない");
  assert.match(src(TOOL), /<span className="sr-mine">あなたの場合<\/span>/, "「あなたの場合」の印が無い");
  assert.match(src("app/globals.css"), /\.sr-added\{background:#e8f4fc\}/, "足された行の薄い primary 背景が無い");
  return `共通6件: ${always.join(" / ")} / 質問は番号なし7問・見出しは「あなたの場合に足すもの」・本来請求/事後重症/遡及は画面に無い`;
});

// 3. §4 の分岐が全部動く(7パターン)
check(3, "§4 の分岐が7パターンとも動く", () => {
  const base = ids(a());
  const cases = [
    ["Q5=違う → 受診状況等証明書", a({ byouin: "chigau" }), ["jushinjokyo"], []],
    ["Q5=不明 → 受診状況等証明書", a({ byouin: "fumei" }), ["jushinjokyo"], []],
    ["Q5=カルテ無し → 添付できない申立書+第三者証明", a({ byouin: "karute" }), ["jushinjokyo", "tenpudekinai", "daisansha"], []],
    ["Q3=遡及 → 診断書2通目", a({ kata: "sokyuu" }), ["shindansho2"], []],
    ["Q6=子 → 戸籍・住民票・在学証明", a({ kazoku: ["ko"] }), ["koseki", "juminhyou", "zaigaku"], ["haigushotoku"]],
    ["Q6=配偶者 → 戸籍・住民票・配偶者の所得", a({ kazoku: ["haigu"] }), ["koseki", "juminhyou", "haigushotoku"], ["zaigaku"]],
    ["Q2=20歳前 → 本人の所得", a({ hatachi: "mae" }), ["honninshotoku"], []],
    ["Q7=はい → 第三者行為事故状況届", a({ jiko: "hai" }), ["jikojoukyou"], []],
    ["Q1=厚生 → 年金加入期間確認通知書", a({ seido: "kousei" }), ["kanyuukikan"], []],
    ["Q5=同じ → 受診状況等証明書は出ない", a({ byouin: "onaji" }), [], ["jushinjokyo"]],
    ["Q6=どちらもいない → 家族の書類は出ない", a({ kazoku: ["nashi"] }), [], ["koseki", "juminhyou", "zaigaku", "haigushotoku"]],
  ];
  const lines = [];
  for (const [name, state, expect, notExpect] of cases) {
    const got = ids(state);
    for (const id of expect) assert.ok(got.includes(id), `${name}: ${id} が出ない`);
    for (const id of notExpect) assert.ok(!got.includes(id), `${name}: ${id} が出てしまう`);
    for (const id of base) assert.ok(got.includes(id), `${name}: 共通の ${id} が消えた`);
    lines.push(`${name} → +${got.length - base.length}`);
  }
  // Q4 → 診断書の様式が決まる
  const shurui = [["seishin", 1], ["shitai", 1], ["me", 1], ["kikaku", 1], ["naibu", 3], ["ketsueki", 1], ["sonota", 1]];
  for (const [k, n] of shurui) assert.equal(shindanshoForms(a({ shurui: k })).length, n, `Q4=${k} の様式が ${n} 件でない`);
  assert.equal(shindanshoForms(a()).length, 0, "Q4 未回答で様式が出ている");
  return `${cases.length}パターン一致 / Q4 は7種すべてで様式が決まる(内部は3様式)`;
});

// 4. 国民年金 × 配偶者あり で「加算はつきません」
check(4, "国民年金 × 配偶者あり で「加算はつきません」の注記", () => {
  assert.equal(showKokuminHaiguNote(a({ seido: "kokumin", kazoku: ["haigu"] })), true);
  assert.equal(showKokuminHaiguNote(a({ seido: "kousei", kazoku: ["haigu"] })), false, "厚生年金でも注記が出る");
  assert.equal(showKokuminHaiguNote(a({ seido: "kokumin", kazoku: ["ko"] })), false, "子だけで注記が出る");
  assert.match(src(TOOL), /配偶者の加算はつきません。/, "注記の文言が無い");
  assert.match(src(TOOL), /配偶者の加算があるのは障害厚生年金の1級・2級だけです。/);
  // 注記が出ても書類自体は出る(窓口で求められる場合があるため)
  assert.ok(ids(a({ seido: "kokumin", kazoku: ["haigu"] })).includes("haigushotoku"), "書類まで消えている");
  return "国民年金×配偶者のみ true / 書類は残す";
});

// 5. 遡及で診断書が2通
check(5, "遡及を選ぶと診断書が2通になる", () => {
  const got = ids(a({ kata: "sokyuu" }));
  assert.ok(got.includes("shindansho") && got.includes("shindansho2"), "2通になっていない");
  for (const k of ["honrai", "jigo", "mitei"]) assert.ok(!ids(a({ kata: k })).includes("shindansho2"), `${k} で2通目が出る`);
  assert.equal(showSokyuuNote(a({ kata: "sokyuu" })), true);
  assert.match(src(TOOL), /診断書が2通になります。/);
  return "遡及のみ shindansho + shindansho2 / 本来・事後重症・未定では1通";
});

// 6. 文書料の金額が1つも書かれていない
check(6, "文書料の金額が1つも書かれていない", () => {
  const MONEY = [/\d{1,3},\d{3}\s*円/, /[０-９0-9]+\s*円/, /[０-９0-9]+\s*千円/, /[０-９0-9]+\s*万円/];
  const hits = [];
  for (const f of SOURCES) {
    const text = src(f);
    for (const re of MONEY) { const m = text.match(re); if (m) hits.push(`${f}: ${m[0]}`); }
  }
  assert.deepEqual(hits, [], hits.join(" / "));
  assert.equal(feeText("byouin"), "文書料がかかります(病院ごとに決まっています)");
  assert.equal(feeText("yakusho"), "役所の手数料がかかります");
  assert.equal(feeText(null), "");
  assert.match(waitText("byouin"), /経験として、依頼から1か月近くかかることもあると語られています/, "待ちを断定している");
  return "円・千円・万円 の表記0件 / 文書料は「病院ごとに決まっています」";
});

// 7. 様式のリンクがすべて機構の公式URL。自サイトにPDFを置かない。
check(7, "様式のリンクがすべて機構の公式URL", () => {
  // 画面に実際に出るURLを集める(ソースの正規表現ではなく、データの実体から)
  const urls = new Set([
    ...Object.values(SHORUI_URLS),
    ...SHINDANSHO_FORMS.map((f) => f.url),
    ...SHINDANSHO_NAIBU.map((f) => f.url),
    ...SHORUI_DOCS.map((d) => d.url).filter(Boolean),
    ...seikyuushoForms(a()).map((f) => f.url),
    ...["seishin", "shitai", "me", "kikaku", "naibu", "ketsueki", "sonota"].flatMap((k) => shindanshoForms(a({ shurui: k })).map((f) => f.url)),
  ]);
  const bad = [...urls].filter((u) => !u.startsWith("https://www.nenkin.go.jp/shinsei/jukyu/shougai/"));
  assert.deepEqual(bad, [], "機構の障害年金ページ以外を指している");
  assert.ok(urls.size >= 12, `様式のURLが ${urls.size} 件しかない`);
  // ソースにも機構以外の外部URLが無いこと
  for (const f of SOURCES) {
    for (const m of src(f).matchAll(/https?:\/\/[^"'\s)]+/g)) {
      assert.ok(m[0].startsWith("https://www.nenkin.go.jp/"), `${f} に ${m[0]}`);
    }
  }
  // 自サイトにPDFを置いていない
  assert.ok(!existsSync("public/forms/shorui"), "public に様式PDFを置いている");
  for (const f of SOURCES) assert.ok(!/\/forms?\/[^"']*\.pdf/.test(src(f)), `${f} が自サイトのPDFを指している`);
  // PDF直リンクではなく公式ページへ張る(改定でPDF名が変わるため)
  assert.deepEqual([...urls].filter((u) => u.endsWith(".pdf")), [], "PDFへ直リンクしている");
  return `${urls.size}件すべて機構の公式ページ(https://www.nenkin.go.jp/shinsei/jukyu/shougai/ 配下)。PDF直リンク0・自サイトにPDFなし`;
});

// 8. 印刷でA4 2枚以内。チェック欄は状態を反映した箱。持ち物と窓口を落とさない。項目を割らない。
// (§8-8。当初の「1枚」「空欄で印刷」は実測で成立せず、2026-09-03 に条件を変更)
check(8, "A4 2枚以内・チェック欄が書き込める箱・持ち物と窓口を落とさない", () => {
  const css = src("app/globals.css");
  assert.match(css, /@page\{size:A4 portrait;margin:14mm\}/, "A4の指定が無い");
  assert.match(css, /\.sr-printhead\{display:block/, "印刷用の見出しが出ない");
  assert.match(css, /\.sr-doc input\{display:none!important\}/, "印刷で input を隠していない");
  assert.match(css, /\.sr-box::before\{content:"";[^}]*border:1px solid #333/, "::before の枠線で箱を描いていない");
  assert.match(css, /\.sr-doc input:checked\+\.sr-box::before\{content:"\\2713"/, "チェック済みの印が無い");
  assert.ok(!/\.sr-box::before\{[^}]*background/.test(css), "箱を背景色で描いている(背景グラフィックをオフにすると消える)");
  assert.match(css, /\.sr-doc\{padding:6px 2px;break-inside:avoid/, "項目に break-inside: avoid が無い");
  assert.match(css, /ul\.sr-ask li\{margin:2px 0;break-inside:avoid/, "窓口の質問に break-inside: avoid が無い");
  assert.match(src(TOOL), /<span className="sr-box" aria-hidden="true" \/>/, "箱の要素が無い");

  const file = "scripts/verify-shorui/fixtures/print.json";
  assert.ok(existsSync(file), `${file} が無い。npm run verify:shorui:print を先に実行する`);
  const m = JSON.parse(src(file));
  for (const c of m.cases) {
    assert.ok(c.pages <= 2, `${c.name}: ${c.pages}ページ(2枚を超えている)`);
    assert.equal(c.rawInputsVisible, 0, `${c.name}: 生のチェックボックスが印刷される`);
    assert.ok(c.boxesDrawn > 0, `${c.name}: 箱が描かれていない`);
    assert.equal(c.boxesTicked, c.checkedOnScreen, `${c.name}: 印つきの箱 ${c.boxesTicked} と画面のチェック ${c.checkedOnScreen} が合わない`);
    assert.equal(c.boxUsesBackground, false, `${c.name}: 箱に背景色を使っている`);
    assert.ok(c.mochimonoOnPrint, `${c.name}: 持ち物が印刷から落ちている`);
    assert.ok(c.askOnPrint, `${c.name}: 窓口で聞くことが印刷から落ちている`);
    assert.deepEqual(c.splitItems, [], `${c.name}: 改ページで割れた項目 ${c.splitItems.join(" / ")}`);
  }
  const line = m.cases.map((c) => `${c.name} ${c.pages}ページ(${c.contentMm}mm・箱${c.boxesDrawn}/印つき${c.boxesTicked})`).join(" / ");
  return `実測 ${line}。生のinput 0・背景色なし・持ち物と窓口は印刷に残る・${m.cases[0].itemCount}項目とも改ページで割れない(PDFのページ本文で確認)`;
});

// 9. 「年金事務所で最終確認してください」が結果と印刷物の両方に出る
check(9, "「最後は年金事務所で確認してください」が結果と印刷の両方に出る", () => {
  assert.match(src(TOOL), /最後は年金事務所で確認してください。/, "結果に無い");
  assert.match(src(PAGE), /最後は年金事務所で確認してください。/, "印刷用の見出しに無い");
  const css = src("app/globals.css");
  assert.ok(!/@media print\{[\s\S]*?\.sr-warnbox\{[^}]*display:\s*none/.test(css), "印刷で消えている");
  const file = "scripts/verify-shorui/fixtures/print.json";
  if (existsSync(file)) for (const c of JSON.parse(src(file)).cases) assert.ok(c.finalCheckOnPrint, `${c.name}: 印刷面に出ていない`);
  return "結果カードの警告と、印刷用見出しの両方。印刷でも消さない";
});

// 10. チェック状態が保存され復元される。共用のパソコンなら保存しない。
check(10, "チェックが保存・復元され、共用のパソコンでは保存しない", () => {
  const core = src(CORE), tool = src(TOOL);
  assert.equal((core.match(/try \{/g) ?? []).length, 3, "load/save/clear のどれかが try/catch でない");
  assert.equal(SHORUI_STORAGE_KEY, "shougainenkin-note:shorui:v1", "保存キーが違う");
  assert.match(core, /SHORUI_STORAGE_KEY/, "lib がデータ側の保存キーを使っていない");
  assert.match(tool, /setChecks\(loadShoruiChecks\(\)\);/, "復元していない");
  assert.match(tool, /if \(shared\) return;/, "共用のパソコンでも保存している");
  assert.match(tool, /if \(next\) \{ clearShoruiChecks\(\); setSaveNote\(""\); \}/, "共用に切り替えても消えない");
  assert.ok(!tool.includes("localStorage."), "コンポーネントが localStorage を直接触っている");
  return "load/save/clear は try/catch / shared のとき保存せず、既存の保存も消す";
});

// 11. ネットワーク送信0件。モバイル375pxで横スクロールなし。
check(11, "回答内容を含む送信が0件・375pxで横スクロールなし", () => {
  const BAD = ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "EventSource", "<form", "navigator.send"];
  const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
  for (const f of SOURCES) { const code = strip(src(f)); for (const b of BAD) assert.ok(!code.includes(b), `${f} に ${b} がある`); }
  const css = src("app/globals.css");
  assert.match(css, /@media\(max-width:520px\)\{\.sr-card\{padding:18px 16px\}/, "モバイルの詰めが無い");
  assert.match(css, /\.sr-b\{flex:1;min-width:0\}/, "長い行が縮まない");
  const file = "scripts/verify-shorui/fixtures/print.json";
  if (existsSync(file)) {
    const m = JSON.parse(src(file));
    if (m.mobile) {
      assert.equal(m.mobile.scrollWidth, m.mobile.clientWidth, `375px で横スクロール(${m.mobile.scrollWidth}/${m.mobile.clientWidth})`);
      assert.equal(m.mobile.overflowing, 0, `はみ出し要素 ${m.mobile.overflowing} 件`);
      // 入力を載せうる送信(POST/本文つき/プリフェッチ以外)は0。
      // Next.js の Link は次の画面を GET で先読みするが、入力は乗らない。
      // 「回答内容を含む送信」と「先読み・アイコン以外の通信」を分けて数える(§8-11)。
      const net = m.network ?? [];
      const answerBearing = net.filter((n) => n.method !== "GET" || n.hasBody || /shorui|seido|kazoku|byouin|kata=/.test(n.url));
      const others = net.filter((n) => !n.prefetch);
      const prefetch = net.filter((n) => n.prefetch);
      assert.deepEqual(answerBearing.map((n) => `${n.method} ${n.url}`), [], "回答内容を含む送信がある");
      assert.deepEqual(others.map((n) => `${n.method} ${n.url}`), [], "先読み・アイコン以外の通信がある");
      assert.match(src(TOOL), /prefetch=\{false\}/, "このページのリンクを prefetch={false} にしていない");
      const list = prefetch.map((n) => n.url.replace(/^https?:\/\/[^/]+/, "").replace(/\?.*$/, "")).join(" ");
      return `回答内容を含む送信 0件 / 先読み・アイコン以外の通信 0件 / 先読みとアイコン ${prefetch.length}件(${list}。共通ヘッダー・パンくず・フッター由来で回答は乗らない) / 375px scrollWidth ${m.mobile.scrollWidth}=clientWidth・はみ出し0`;
    }
  }
  return "送信コード0(実測は print.mjs 未実行)";
});

const ok = results.every((r) => r.ok);
console.log("# /dougu/shorui §8 完了条件\n");
for (const r of results) console.log(`${r.ok ? "○" : "×"} ${r.id}. ${r.label}\n   ${r.note}`);
if (!ok) process.exitCode = 1;
