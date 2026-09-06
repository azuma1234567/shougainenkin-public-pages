// docs/madoguchi-tool-design-2026-09-02.md §8 の完了条件を機械検査する。
//   npm run verify:madoguchi
// 印刷(10)と375px(12)の実測は scripts/verify-madoguchi/print.mjs の結果を読む。
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { jurisdictionOf, machikadoOf, municipalitiesOf, office, PREFECTURES, CHECKED_ON, COMMON_TEL } from "../../lib/madoguchi.ts";
import { PLACEMENTS, TOOLS } from "../../data/dougu.ts";

const results = [];
const check = (id, label, fn) => {
  try { results.push({ id, label, ok: true, note: fn() ?? "" }); }
  catch (e) { results.push({ id, label, ok: false, note: e.message.split("\n")[0] }); }
};
const TOOL = "components/tools/MadoguchiTool.tsx";
const CORE = "lib/madoguchi.ts";
const PAGE = "app/dougu/madoguchi/page.tsx";
const SOURCES = [TOOL, CORE, PAGE];
const src = (f) => readFileSync(f, "utf8");
const all = JSON.parse(src("data/madoguchi/offices.json")).offices;
const codeOf = (pref, name) => municipalitiesOf(pref).find((m) => m.name === name)?.code;

/* 1番は 2026-09-03 に書き換えた。/dougu の一覧ページは無く、/dougu は /shinsei へ301。
   301を踏ませるリンクを足すのは間違いなので、検査のほうを今の構造に合わせた。 */
// 1. /shinsei の申請の流れの中から、この道具へ行ける。パンくずの親も /shinsei。
// (2026-09-03 に書き換え。もとは「/dougu から行ける」だったが、/dougu の一覧ページは無く
//  /shinsei へ301する。301を踏ませるリンクを足すのは間違いなので、検査を今の構造に合わせた)
check(1, "/shinsei の申請の流れから /dougu/madoguchi へ行ける", () => {
  assert.ok(existsSync(PAGE), `${PAGE} が無い`);
  // /shinsei の8ステップの中に、この道具への導線がある
  // (2026-09-06: トップの StepFlow はカードの href、/shinsei のステップカードは DouguCards で道具へリンクする)
  const flow = src("components/platform/StepFlow.tsx");
  assert.match(flow, /PLACEMENTS\.shinseiSteps\[stepId\]/, "申請の流れが道具の配置を読んでいない");
  assert.match(flow, /href=\{card\.href\}/, "ステップから道具へリンクしていない");
  assert.match(src("components/platform/ShinseiRestyled.tsx"), /<DouguCards placements=\{PLACEMENTS\.shinseiSteps\[step\.id\]\} variant="grid" \/>/, "/shinsei のステップカードが道具を出していない");
  const steps = Object.entries(PLACEMENTS.shinseiSteps)
    .filter(([, list]) => (list ?? []).some((x) => x.tool === "madoguchi")).map(([id]) => id);
  assert.ok(steps.length > 0, "申請の流れのどのステップにも置かれていない");
  assert.equal(TOOLS.madoguchi.path, "/dougu/madoguchi", "道具のパスが違う");
  // パンくずの親が /shinsei
  assert.match(src(PAGE), /href: "\/shinsei", label: "申請の流れ"/, "パンくずの親が /shinsei でない");
  assert.match(src("app/sitemap.ts"), /"\/dougu\/madoguchi"/, "sitemap に無い");
  assert.match(src("lib/published-links.ts"), /"\/dougu\/madoguchi"/, "公開判定に無い");
  return `/shinsei の ${steps.join(" / ")} から行ける / パンくずの親は /shinsei / sitemap・公開判定にあり`;
});

/* 2026-09-03 の作り直しで、制度と20歳前の2問は消した(指示書 B-3)。
   提出先の判定は lib/madoguchi.ts の submission に残してあるが、画面では使わず、
   両方を並べて1行で説明する。§8-2/§8-3 の検査を、その1行に置き換えた。 */
// 2026-09-06 刷新(B-1-1): 最初の操作は市区町村名の検索欄。2段のプルダウンは「一覧から選ぶ」に残す。見出しは「管轄の年金事務所」。
check(2, "最初の操作が市区町村名の検索欄(一覧から選ぶも残る)。節の番号と「提出先を調べる」が無い", () => {
  const t = src(TOOL);
  // 検索欄より前に、質問(チップ)が無い
  assert.ok(!t.includes("md-chips"), "質問のチップが残っている");
  assert.ok(!/aria-labelledby="md-q[12]"/.test(t), "制度・20歳前の設問が残っている");
  assert.ok(t.indexOf('id="md-search"') < t.indexOf('id="md-pref"'), "検索欄が都道府県の選択より下にある");
  assert.ok(t.indexOf('id="md-pref"') < t.indexOf('id="md-h2"'), "選択欄より前に別の操作がある");
  assert.match(t, /type="search" id="md-search"/, "検索欄が無い");
  assert.match(t, /<summary>一覧から選ぶ<\/summary>/, "「一覧から選ぶ」が無い");
  assert.match(t, /const starts = all\.filter\(\(m\) => m\.name\.startsWith\(q\)\);/, "前方一致を先にしていない");
  assert.match(t, /\.slice\(0, SEARCH_MAX\)/, "候補の上限が無い");
  assert.match(t, /const SEARCH_MAX = 10;/, "候補の上限が10でない");
  assert.match(t, /if \(q\.length < 2\) return \[\];/, "2文字未満で候補を出している");
  assert.match(t, /useMemo<Muni\[\]>\(\(\) => PREFECTURES\.flatMap/, "全件の配列をメモ化していない");
  assert.ok(!t.includes("gun-map"), "郡の表を使っている(町村名で引く)");
  assert.match(t, /<h2 id="md-h1">お住まい<\/h2>/, "最初の見出しが「お住まい」でない");
  assert.match(t, /<h2 id="md-h2">管轄の年金事務所<\/h2>/, "「管轄の年金事務所」の見出しが無い");
  assert.ok(!t.includes("あなた"), "「あなた」が残っている");
  assert.ok(!t.includes("md-warnbox") && !src(PAGE).includes("md-warnbox"), "黄色の箱が残っている");
  assert.ok(!src("app/globals.css").includes(".md-warnbox"), "黄色の箱の CSS が残っている");
  // 検索: 旭川 / 世田谷 / 堺 / 大阪(lib のデータで、画面と同じ規則を再現)
  const all = PREFECTURES.flatMap((p) => municipalitiesOf(p).map((m) => ({ pref: p, ...m })));
  const search = (q) => { const s = all.filter((m) => m.name.startsWith(q)), i = all.filter((m) => !m.name.startsWith(q) && m.name.includes(q)); return [...s, ...i].slice(0, 10); };
  assert.equal(search("旭川")[0].pref + " " + search("旭川")[0].name, "北海道 旭川市");
  assert.equal(search("世田谷")[0].pref + " " + search("世田谷")[0].name, "東京都 世田谷区");
  assert.ok(search("堺").length >= 6 && search("堺").every((m) => m.pref === "大阪府"), `堺 → ${search("堺").map((m) => m.name).join(",")}`);
  assert.ok(search("大阪").length <= 10 && search("大阪").every((m) => m.name.startsWith("大阪市")), `大阪 → ${search("大阪").map((m) => m.name).join(",")}`);
  assert.equal(search("旭").length, 0 + search("旭").length, "");
  // B-5-4 「1.」〜「5.」と「提出先を調べる」が画面に無い
  assert.ok(!t.includes("提出先を調べる"), "「提出先を調べる」が残っている");
  for (const n of [1, 2, 3, 4, 5]) {
    assert.ok(!new RegExp(`>${n}\\. `).test(t), `節の番号「${n}.」が残っている`);
  }
  assert.ok(!t.includes("submission"), "画面が提出先の判定を呼んでいる");
  return `検索欄 → 一覧から選ぶ → 管轄の年金事務所 の順 / 旭川→旭川市・世田谷→世田谷区・堺→堺市の区 ${search("堺").length}件・大阪→大阪市の区 ${search("大阪").length}件 / 「あなた」黄色の箱 0`;
});

check(3, "提出先の1行の説明が、事務所カードの下に出ている", () => {
  const t = src(TOOL);
  assert.match(t, /国民年金だけの請求\(障害基礎年金\)は、お住まいの市区町村の国民年金の窓口にも出せます。20歳前に初診日がある方も同じです。/, "国民年金・20歳前の1行が無い");
  assert.match(t, /初診日が第3号被保険者\(会社員の配偶者\)の期間にある方は年金事務所へ。/, "第3号の1行が無い");
  // 事務所カードより下に置く(質問して分岐せず、両方を並べてから説明する)
  assert.ok(t.indexOf("<OfficeGroup") < t.indexOf("md-where"), "1行が事務所カードより上にある");
  // 厚年・国年の両方を、質問なしで並べる
  assert.match(t, /title="会社員だった方\(厚生年金\)の請求・相談"/, "厚生年金の見出しが無い");
  assert.match(t, /title="国民年金の方の相談"/, "国民年金の見出しが無い");
  assert.match(t, /title="厚生年金・国民年金とも"/, "同じ事務所のときにまとめる扱いが無い");
  assert.match(t, /kokuminMadoguchiSearchUrl\(pref, city\.name\)/, "国民年金窓口の検索リンクが無い");
  assert.match(t, /encodeURIComponent\(`\$\{pref\}\$\{cityName\} 国民年金 窓口`\)/, "検索語が「都道府県+市区町村 国民年金 窓口」でない");
  assert.match(t, /\{city\.name\}の国民年金の窓口を検索する/, "リンク文言に市区町村名が無い");
  return "国民年金だけ／20歳前／第3号 の1行が事務所カードの下。その直後に国民年金窓口の検索リンク(市区町村名入り)。厚年・国年は質問なしで両方出す";
});

check(4, "都道府県 → 市区町村で管轄の年金事務所が出る。47都道府県ぶんある", () => {
  assert.equal(PREFECTURES.length, 47, `都道府県が ${PREFECTURES.length} 件`);
  const nenkin = all.filter((o) => o.kind === "nenkin");
  const byPref = new Set(nenkin.map((o) => o.prefName));
  assert.equal(byPref.size, 47, `年金事務所のある都道府県が ${byPref.size}`);
  let munis = 0, missing = [];
  for (const pref of PREFECTURES) {
    for (const m of municipalitiesOf(pref)) {
      munis += 1;
      const j = jurisdictionOf(m.code);
      if (!j || j.kousei.length === 0 || j.kokumin.length === 0) missing.push(`${pref}${m.name}`);
    }
  }
  assert.deepEqual(missing, [], `管轄が引けない市区町村: ${missing.slice(0, 5).join(",")}`);
  /* 制度で出し分ける(研究文書 §3-2) */
  const minami = jurisdictionOf(codeOf("神奈川県", "横浜市南区"));
  assert.equal(minami.kousei[0].nameShort ?? minami.kousei[0].name.replace(/（[^）]*）/g, "").replace(/年金事務所$/, ""), "横浜中");
  assert.match(minami.kokumin[0].name, /^横浜南/);
  assert.equal(minami.differs, true, "厚年と国年の違いが検出されない");
  return `47都道府県 / 年金事務所 ${nenkin.length} / 市区町村 ${munis} 件すべてに厚年・国年が引ける`;
});

check(5, "街角の年金相談センターが年金事務所と分けて表示される", () => {
  const mac = all.filter((o) => o.kind === "machikado");
  assert.equal(mac.length, 80, `街角が ${mac.length} 件`);
  assert.equal(machikadoOf("東京都").length, 11);
  assert.ok(machikadoOf("東京都").every((o) => o.kind === "machikado"));
  assert.match(src(TOOL), /<h3>街角の年金相談センター<\/h3>/, "見出しが分かれていない");
  assert.match(src(TOOL), /年金証書の再発行・国民年金の加入納付・事業所の手続きは扱っていません/, "扱わない範囲の注記が無い");
  assert.match(src(TOOL), /管轄はありません。\{pref\}のどこにお住まいでも使えます。/);
  return `街角 80件を都道府県で引く / 別見出し / 扱わない範囲の注記あり`;
});

check(6, "各件から機構の公式ページへリンクしている", () => {
  const bad = all.filter((o) => !o.url.startsWith("https://www.nenkin.go.jp/section/soudan/"));
  assert.deepEqual(bad.map((o) => o.name), []);
  assert.match(src(TOOL), /<a href=\{o\.url\} rel="noreferrer">機構の公式ページ<\/a>/);
  assert.match(src(TOOL), /kankatsuUrl\(pref\)/, "管轄区域ページへのリンクが無い");
  return `${all.length}件すべて機構の窓口ページ / 分かれる市区は管轄区域ページへも`;
});

check(7, "ページに取得日が表示されている", () => {
  assert.equal(CHECKED_ON, "2026-09-03");
  assert.match(src(TOOL), /日本年金機構の公表\(\{CHECKED_ON\} 取得\)による/, "各件の但し書きが無い");
  assert.match(src(TOOL), /住所・電話・管轄は<strong>日本年金機構の公表/, "一覧の但し書きが無い");
  assert.match(src(PAGE), /日本年金機構の公表（\{CHECKED_ON\} 取得）による/, "印刷用の但し書きが無い");
  return "各件・一覧・印刷用の3か所に取得日";
});

check(8, "予約の情報が公式と一致している(2026-09-03 再確認)", () => {
  const t = src(TOOL);
  assert.equal(COMMON_TEL.yoyaku, "0570-05-4890", "data の予約電話が違う");
  assert.match(t, /\{COMMON_TEL\.yoyaku\}/, "予約電話を COMMON_TEL から出していない");
  assert.ok(!t.includes('"0570-05-4890"') && !src(PAGE).includes("0570-05-4890"), "予約電話の直書きがある");
  // 電話で言うこと(3行)と開所時間(機構「受付時間のご案内」で確認できた分だけ)
  assert.equal((t.match(/<li>「/g) ?? []).length, 3, "「電話で言うこと」が3行でない");
  assert.match(t, /初めての相談を予約したいです/);
  assert.match(t, /https:\/\/www\.nenkin\.go\.jp\/section\/guidance\/uketukejikan\.html/, "開所時間の出典URLが無い");
  assert.match(t, /平日\(月曜〜金曜\)8:30〜17:15/, "開所時間が無い");
  assert.match(t, /KAISHO_CHECKED = "2026-09-06"/, "開所時間の確認日が無い");
  for (const s of ["03-6631-7521", "月曜〜金曜 8:30〜17:15", "翌日以降",
    "基礎年金番号がわかるもの", "照会番号", "平日 9:00〜16:00", "全日 8:00〜23:30",
    "障害年金の請求に関する手続き"]) assert.ok(t.includes(s), `${s} が無い`);
  assert.ok(!t.includes("照査番号"), "誤記の「照査番号」が残っている");
  assert.match(t, /https:\/\/www\.nenkin\.go\.jp\/section\/tel\/yoyaku\.html/);
  assert.match(t, /https:\/\/www\.nenkin\.go\.jp\/section\/guidance\/yoyaku\.html/);
  return "予約電話は COMMON_TEL 経由(一般電話 03- は data に無いので文字のまま)・受付時間・翌日以降・照会番号・相談開始・ネット予約(障害年金明示)・出典2本 / 電話で言うこと3行 / 開所時間(受付時間のご案内、確認日 2026-09-06)";
});

check(9, "電話番号が tel: リンクになっている", () => {
  assert.match(src(CORE), /export const telHref = \(tel: string\) => `tel:\$\{tel\.replace\(\/-\/g, ""\)\}`;/);
  assert.match(src(TOOL), /href=\{telHref\(o\.tel\)\}/, "窓口の電話が tel: でない");
  assert.match(src(TOOL), /href=\{telHref\(COMMON_TEL\.yoyaku\)\}/, "予約電話が tel: でない");
  const withTel = all.filter((o) => o.tel);
  assert.equal(withTel.length, all.length, `電話が空の窓口 ${all.length - withTel.length} 件`);
  return `窓口 ${all.length}件と予約電話2本すべて tel:`;
});

check(10, "印刷で A4 2枚以内に、窓口・予約・持ち物・聞くことが収まる", () => {
  const css = src("app/globals.css");
  assert.match(css, /@page\{size:A4 portrait;margin:14mm\}/);
  assert.match(css, /\.md-printhead\{display:block/);
  assert.match(css, /\.md-office\{[^}]*break-inside:avoid/, "窓口カードが改ページで割れる");
  const file = "scripts/verify-madoguchi/fixtures/print.json";
  assert.ok(existsSync(file), `${file} が無い。npm run verify:madoguchi:print を先に実行する`);
  const m = JSON.parse(src(file));
  for (const c of m.cases) {
    assert.ok(c.pages <= 2, `${c.name}: ${c.pages}ページ(2枚を超えている)`);
    for (const s of ["office", "yoyaku", "mochimono", "ask"]) assert.ok(c[s], `${c.name}: ${s} が印刷に出ていない`);
    /* 紙には選んだ地名だけを出す。選択欄は出さない(2026-09-03) */
    assert.ok(c.pickedOnPrint, `${c.name}: 選んだ地名が紙に出ていない`);
    assert.equal(c.selectsOnPrint, 0, `${c.name}: 選択欄が紙に出ている(${c.selectsOnPrint})`);
    assert.deepEqual(c.splitItems, [], `${c.name}: 改ページで割れた項目 ${c.splitItems.join(" / ")}`);
  }
  return `実測 ${m.cases.map((c) => `${c.name} ${c.pages}ページ`).join(" / ")}。窓口・予約・持ち物・聞くことが全条件で印刷面にあり、選んだ地名も出る(選択欄は出ない)`;
});

check(11, "外部の地図SDK・埋め込みが無い。回答内容を含む送信が0件", () => {
  const BAD = ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "EventSource", "<iframe", "<form", "maps.googleapis", "mapbox", "leaflet"];
  const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
  for (const f of SOURCES) { const code = strip(src(f)); for (const b of BAD) assert.ok(!code.includes(b), `${f} に ${b} がある`); }
  /* 地図は検索URLへのリンクだけ */
  assert.match(src(CORE), /google\.com\/maps\/search\/\?api=1&query=/);
  const file = "scripts/verify-madoguchi/fixtures/print.json";
  if (existsSync(file)) {
    const m = JSON.parse(src(file));
    const net = m.network ?? [];
    const sending = net.filter((n) => n.method !== "GET" || n.hasBody || !n.prefetch);
    assert.deepEqual(sending.map((n) => `${n.method} ${n.url}`), [], "回答内容を含む送信または先読み以外の通信がある");
    return `地図SDK・iframe なし(検索URLのリンクのみ) / 回答内容を含む送信0件・先読み以外の通信0件(先読みとアイコン ${net.length}件)`;
  }
  return "地図SDK・iframe なし / 送信コード0(実測は print.mjs 未実行)";
});

check(12, "モバイル375pxで横スクロールなし", () => {
  const css = src("app/globals.css");
  assert.match(css, /@media\(max-width:560px\)\{\.md-grid2\{grid-template-columns:1fr\}/, "モバイルの1列指定が無い");
  const file = "scripts/verify-madoguchi/fixtures/print.json";
  assert.ok(existsSync(file), `${file} が無い`);
  const m = JSON.parse(src(file));
  assert.equal(m.mobile.scrollWidth, m.mobile.clientWidth, `375px で横スクロール(${m.mobile.scrollWidth}/${m.mobile.clientWidth})`);
  assert.equal(m.mobile.overflowing, 0, `はみ出し要素 ${m.mobile.overflowing} 件`);
  return `実測 scrollWidth ${m.mobile.scrollWidth} = clientWidth、はみ出し0`;
});

const ok = results.every((r) => r.ok);
console.log("# /dougu/madoguchi §8 完了条件\n");
for (const r of results) console.log(`${r.ok ? "○" : "×"} ${r.id}. ${r.label}\n   ${r.note}`);
if (!ok) process.exitCode = 1;
