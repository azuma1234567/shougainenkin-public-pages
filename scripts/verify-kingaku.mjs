// docs/kingaku-tool-design-2026-09-02.md §9 の完了条件のうち、
// ソースと計算だけで判定できるもの(1,2,3,4,5,6,7,8,9,10,11)を機械検査する。
// 12(375px・キーボード)と 1・11 の実挙動はブラウザで別途確認する。
//   node --import ./scripts/lib/ts-alias.mjs scripts/verify-kingaku.mjs
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { AMOUNTS_2026, KINGAKU_2026 as A } from "../data/amounts.ts";
import { calcKingaku, emptyInput, houshuHirei, kyuufukinMonthly, monthly, yearly } from "../lib/kingaku.ts";
import { SAKANOBORI_MAX_MONTHS, approx100, hyoujunFromNenshu, ninteiFromShoshin, sakanobori, sakanoboriMonths } from "../lib/kingaku-hosoku.ts";

const results = [];
const check = (id, label, fn) => {
  try { const note = fn() ?? ""; results.push({ id, label, ok: true, note }); }
  catch (error) { results.push({ id, label, ok: false, note: error.message.split("\n")[0] }); }
};

const input = (p) => ({ ...emptyInput(), ...p });
const row = (result, label) => result.rows.find((r) => r.label.startsWith(label));

const TOOL = "components/tools/KingakuTool.tsx";
const CALC = "lib/kingaku.ts";
const PAGE = "app/dougu/kingaku/page.tsx";
const src = (f) => readFileSync(f, "utf8");
const HOSOKU = "lib/kingaku-hosoku.ts";
const sources = [TOOL, CALC, PAGE, HOSOKU].map((f) => [f, src(f)]);

// 1. /dougu/kingaku が動く。/dougu から行ける。
// (2026-09-06 に書き換え。/dougu の一覧ページは無く /shinsei へ301するので、
//  sitemap・公開判定・道具カードの配置(data/dougu.ts)・パンくずの親 /okane で見る)
check(1, "/dougu/kingaku が存在し、公開導線につながっている", () => {
  assert.ok(existsSync(PAGE), `${PAGE} が無い`);
  assert.match(src("app/sitemap.ts"), /"\/dougu\/kingaku"/, "sitemap に無い");
  assert.match(src("lib/published-links.ts"), /"\/dougu\/kingaku"/, "公開判定に無い");
  assert.match(src("data/dougu.ts"), /"kingaku"\]|tool: "kingaku"/, "道具カードの配置に無い");
  assert.match(src(PAGE), /href: "\/okane", label: "お金"/, "パンくずの親が /okane でない");
  return "page.tsx あり / sitemap・公開判定・道具カードの配置あり / パンくずの親は /okane";
});

// 2. 300月みなし(加入120月・平均標準報酬額30万・2級 → 約493,290円)
check(2, "300月みなしが効いている", () => {
  const r = houshuHirei(input({ seido: "kousei", tsuki: 120, hyoujun: 300000 }));
  assert.equal(Math.round(r.value), 493290, `報酬比例が ${Math.round(r.value)} 円`);
  assert.equal(r.minashi, true, "みなしフラグが立っていない");
  const full = calcKingaku(input({ seido: "kousei", tsuki: 120, hyoujun: 300000 }));
  assert.ok(full.flags.some((f) => f.includes("300月")), "300月みなしの表示が無い");
  // 300月以上のときは効かない
  const over = houshuHirei(input({ seido: "kousei", tsuki: 360, hyoujun: 300000 }));
  assert.equal(over.minashi, false, "360月でみなしが効いている");
  assert.equal(Math.round(over.value), Math.round(300000 * A.rateNew * 360), "360月の計算が合わない");
  return "120月・30万・2級 → 493,290円 / 360月では未適用";
});

// 3. 国民年金 × 3級 が選べない
check(3, "国民年金 × 3級 が選べない", () => {
  assert.match(src(TOOL), /disabled=\{s\.grade === 3 && o\.v === "kokumin"\}/, "国民年金ボタンが無効化されていない");
  assert.match(src(TOOL), /g === 3 \? \{ grade: g, seido: "kousei" \}/, "3級選択時に厚生年金へ切り替えていない");
  return "3級で国民年金ボタンを disabled / 3級選択で厚生年金へ切替";
});

// 4. 3級の最低保障
check(4, "3級の最低保障が適用され、表示される", () => {
  const low = calcKingaku(input({ grade: 3, seido: "kousei", tsuki: 300, hyoujun: 200000 }));
  assert.ok(low.total < A.employeesGrade3Minimum + 1, "");
  assert.equal(low.total, A.employeesGrade3Minimum, `最低保障が適用されていない(${low.total})`);
  assert.equal(low.saiteiHoshou, true);
  assert.ok(low.flags.some((f) => f.includes("最低保障")), "最低保障の表示が無い");
  const high = calcKingaku(input({ grade: 3, seido: "kousei", tsuki: 400, hyoujun: 500000 }));
  assert.equal(high.saiteiHoshou, false, "報酬比例が上回るのに最低保障が適用されている");
  return `下回るとき ${low.total.toLocaleString("ja-JP")}円 / 上回るとき ${Math.round(high.total).toLocaleString("ja-JP")}円`;
});

// 5. 障害基礎年金に配偶者加給が出ない。3級に子の加算・配偶者加給が出ない。
check(5, "配偶者加給と子の加算の制度差", () => {
  const kiso = calcKingaku(input({ grade: 2, seido: "kokumin", spouse: true, kids: 2 }));
  assert.equal(row(kiso, "配偶者加給年金額").amount, 0, "障害基礎年金に配偶者加給が出ている");
  assert.match(row(kiso, "配偶者加給年金額").why, /障害基礎年金に配偶者の加算はありません/);
  assert.equal(row(kiso, "子の加算").amount, A.childFirstSecond * 2, "国民年金でも子の加算は出る");
  const g3 = calcKingaku(input({ grade: 3, seido: "kousei", spouse: true, kids: 3, tsuki: 300, hyoujun: 400000 }));
  assert.equal(row(g3, "子の加算").amount, 0, "3級に子の加算が出ている");
  assert.match(row(g3, "子の加算").why, /3級には子の加算がありません/);
  assert.equal(row(g3, "配偶者加給年金額").amount, 0, "3級に配偶者加給が出ている");
  assert.match(row(g3, "配偶者加給年金額").why, /3級には配偶者の加算がありません/);
  assert.equal(row(g3, "障害基礎年金").amount, 0, "3級に障害基礎年金が出ている");
  const kousei2 = calcKingaku(input({ grade: 2, seido: "kousei", spouse: true }));
  assert.equal(row(kousei2, "配偶者加給年金額").amount, A.spouseAddition, "厚生2級で配偶者加給が出ない");
  return "国民年金2級=0円 / 3級=0円 / 厚生2級=243,800円";
});

// 6. 年金生活者支援給付金が3級では出ない。合計に含まれない。
check(6, "年金生活者支援給付金が3級では出ず、合計に含まれない", () => {
  assert.equal(kyuufukinMonthly(3), null, "3級で給付金が出ている");
  assert.equal(kyuufukinMonthly(1), A.supportGrade1Monthly);
  assert.equal(kyuufukinMonthly(2), A.supportGrade2Monthly);
  const r = calcKingaku(input({ grade: 2, seido: "kokumin" }));
  assert.equal(r.total, A.basicGrade2, "合計に給付金が混ざっている");
  assert.match(src(TOOL), /合計額には含めていません/, "合計に含めない旨の表示が無い");
  assert.match(src(TOOL), /年金生活者支援給付金は、3級では受け取れません/, "3級の説明が無い");
  return "3級 null / 2級合計は障害基礎年金のみ";
});

// 7. 未入力のとき報酬比例が「—」(0円ではない)
check(7, "未入力のとき報酬比例が「—」", () => {
  for (const [name, p] of [
    ["制度未選択", {}],
    ["厚生・全未入力", { seido: "kousei" }],
    ["月数のみ", { seido: "kousei", tsuki: 120 }],
    ["報酬のみ", { seido: "kousei", hyoujun: 300000 }],
    ["国民年金", { seido: "kokumin" }],
  ]) {
    assert.equal(row(calcKingaku(input(p)), "報酬比例部分").amount, null, `${name} で null にならない`);
  }
  const g3 = calcKingaku(input({ grade: 3, seido: "kousei" }));
  assert.equal(g3.known, false, "3級・未入力で合計が出ている");
  assert.match(src(TOOL), /r\.amount === null \? "—"/, "「—」の描画が無い");
  return "5パターンとも null / 3級未入力は合計も「—」";
});

// 8. 金額がすべて data/amounts.ts 経由(直書き0件)
check(8, "金額の直書きが0件", () => {
  const literals = Object.values(AMOUNTS_2026).filter((v) => v.includes(","));
  const bare = [...new Set(literals.map((v) => v.replaceAll(",", "")))];
  const hits = [];
  for (const [file, text] of sources) {
    for (const v of literals) if (text.includes(v)) hits.push(`${file}: ${v}`);
    for (const v of bare) if (new RegExp(`(?<![\\d.])${v}(?![\\d.])`).test(text)) hits.push(`${file}: ${v}`);
    for (const v of ["5.481", "7.125", "1.25", "令和8年度"]) if (text.includes(v)) hits.push(`${file}: ${v}`);
    if (/minashiMonths|A\.rate|A\.grade1Rate|A\.basic|A\.child|A\.spouse|A\.employees|A\.support|A\.fiscalYear/.test(text) === false && file !== PAGE && file !== HOSOKU) hits.push(`${file}: amounts.ts を参照していない`);
  }
  assert.deepEqual(hits, [], `直書き: ${hits.join(" / ")}`);
  assert.match(src(CALC), /from "@\/data\/amounts"/, "lib/kingaku.ts が amounts.ts を読んでいない");
  assert.match(src(PAGE), /FISCAL_YEAR/, "page.tsx が年度を data/amounts.ts から読んでいない");
  return `${literals.length}個の金額・乗率・年度をソース4ファイルで検索して0件`;
});

// 9. 内訳表に0円の行も理由つきで出る
check(9, "0円の行が理由つきで出る", () => {
  const r = calcKingaku(input({ grade: 2, seido: "kokumin" }));
  assert.equal(r.rows.length, 4, "内訳が4行でない");
  for (const x of r.rows) {
    if (x.amount === 0 || x.amount === null) assert.ok(x.why.length > 0, `${x.label} に理由が無い`);
  }
  assert.match(src(TOOL), /r\.why && <span className="kg-why">/, "理由の描画が無い");
  return r.rows.map((x) => `${x.label}=${x.amount === null ? "—" : x.amount}`).join(" / ");
});

// 10. §7 の4つの但し書きがすべて出る
check(10, "§7 の4つの但し書き", () => {
  const text = src(TOOL);
  const notes = [
    ["概算・従前額保障", /これは概算です。[\s\S]*従前額保障[\s\S]*高くなることがあります/],
    ["4月改定と年度", /毎年4月に改定[\s\S]*A\.fiscalYear/],
    ["他制度との調整", /調整があります[\s\S]*\/okane\/chousei/],
    ["非課税と扶養認定", /非課税[\s\S]*扶養認定では収入[\s\S]*\/gokai\/hikazei-shuunyuu-zero/],
    // 2026-09-06 刷新で足した2行
    ["配偶者加給が止まる条件", /配偶者自身が20年以上[\s\S]*受けている間は止まります/],
    ["20歳前の所得制限", /所得で止まることがあります[\s\S]*\/dougu\/kougin/],
  ];
  for (const [name, re] of notes) assert.match(text, re, `${name} が無い`);
  return notes.map(([n]) => n).join(" / ");
});

// 11. ネットワーク送信0件(送信するコードが無い)
check(11, "入力をサーバーへ送るコードが無い", () => {
  for (const [file, text] of sources) {
    for (const bad of ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "<form", "localStorage", "sessionStorage", "navigator.send"]) {
      assert.ok(!text.includes(bad), `${file} に ${bad} がある`);
    }
  }
  return "fetch / XHR / sendBeacon / form / storage いずれも無し";
});

// 12. モバイル375px・キーボード(ソース側で担保できる分)
check(12, "キーボードだけで操作できる作り", () => {
  const text = src(TOOL);
  assert.ok(!/<div[^>]*onClick/.test(text), "div に onClick がある(ネイティブ要素でない)");
  const ids = [...text.matchAll(/id="(kg-[a-z-]+)"/g)].map((m) => m[1]).filter((id) => !id.endsWith("-label") && !id.endsWith("-heading"));
  for (const id of ids) assert.ok(text.includes(`htmlFor="${id}"`), `${id} に label が無い`);
  assert.match(text, /type="button"/, "button に type が無い");
  assert.match(src("app/globals.css"), /\.kg-chips button:focus-visible/, "フォーカスリングの指定が無い");
  assert.match(src("app/globals.css"), /@media\(max-width:560px\)\{\.kg-grid2\{grid-template-columns:1fr\}/, "375pxの1列指定が無い");
  return `label付きフィールド ${ids.length}個 / チップは <button type="button"> / focus-visible あり`;
});

// 13. 2026-09-06 刷新(A-4-3・7・8): 答えの箱が最上部、3問、加入月数の説明、「準備中」「あなた」黄色の箱が 0
check(13, "答えの箱が最上部にあり、3問で近づける。加入月数の説明が「障害認定日の月まで」", () => {
  const t = src(TOOL), page = src(PAGE);
  assert.ok(t.indexOf('className="kg-card kg-answer"') < t.indexOf('id="kg-seido-label"'), "答えの箱が3問より下にある");
  assert.match(t, /aria-live="polite"/, "答えの箱に aria-live が無い");
  assert.match(t, /偶数月の15日に、前2か月分/, "振込日の1行が無い");
  assert.match(t, /新しく決まる人の \{GRADE2_SHARE\}% が2級です/, "2級の割合が無い");
  assert.match(t, /stats\.nintei\["新規裁定・抽出1000件"\]\["合計"\]\["2級"\]\.pct/, "2級の割合を lib/stats.ts から読んでいない");
  assert.ok(!/53\.9/.test(t), "2級の割合が直書き");
  for (const q of ["初診日のとき、会社員・公務員でしたか(厚生年金)", "18歳までの子ども", "生計を維持している65歳未満の配偶者"]) assert.ok(t.includes(q), `質問「${q}」が無い`);
  assert.match(t, /\{spouseActive && \(/, "配偶者の質問が「はい」のときだけになっていない");
  assert.match(t, /障害認定日\(原則、初診日から1年6か月後\)の月までの、厚生年金に入っていた月数/, "加入月数の説明が「障害認定日の月まで」でない");
  for (const f of [TOOL, PAGE]) {
    for (const bad of ["初診日の前月", "準備中", "あなた", "kg-warnbox"]) assert.ok(!src(f).includes(bad), `${f} に「${bad}」がある`);
  }
  assert.match(t, /placements=\{\["mitate"\]\}/, "等級の目安をしらべる への道具カードが無い");
  assert.match(page, /placements=\{\["shorui", "koushin"\]\}/, "ここからできること の道具カードが無い");
  assert.match(t, /配偶者自身が20年以上/, "配偶者加給が止まる条件が無い");
  return "答えの箱 → 3問 → 上乗せ → 内訳 の順 / 振込日・2級の割合(stats 経由)/ 加入月数は障害認定日の月まで / 準備中・あなた・黄色の箱 0";
});

// 14. 年収から: 360万 → 平均標準報酬額 300,000 → #2 と同じ結果
check(14, "「年収から」が年収÷12を平均標準報酬額として使う", () => {
  assert.equal(hyoujunFromNenshu(3600000), 300000);
  assert.equal(hyoujunFromNenshu(null), null);
  assert.equal(hyoujunFromNenshu(0), null);
  const viaNenshu = calcKingaku(input({ seido: "kousei", tsuki: 120, hyoujun: hyoujunFromNenshu(3600000) }));
  const direct = calcKingaku(input({ seido: "kousei", tsuki: 120, hyoujun: 300000 }));
  assert.equal(yearly(viaNenshu.total), yearly(direct.total));
  assert.equal(yearly(direct.total), Math.round(A.basicGrade2 + 300000 * A.rateNew * A.minashiMonths), "厚生2級・月30万・120月の合計が合わない");
  assert.match(src(TOOL), /patch\(\{ hyoujun: hyoujunFromNenshu\(v\) \}\)/, "年収から hyoujun に入れていない");
  assert.match(src(TOOL), /const switchSalary = \(mode[^)]*\) => \{ setSalaryMode\(mode\); setNenshu\(null\); patch\(\{ hyoujun: null \}\); \}/, "入れ方を切り替えたとき、もう一方の値を消していない");
  assert.match(src(TOOL), /標準報酬月額と賞与には上限があるため/, "目安の但し書きが無い");
  assert.equal(approx100(monthly(A.basicGrade2)), Math.round(A.basicGrade2 / 12 / 100) * 100, "月額の「約」の丸めが百円単位でない");
  return `360万 → ${hyoujunFromNenshu(3600000).toLocaleString("ja-JP")} → 合計 ${yearly(direct.total).toLocaleString("ja-JP")}円(平均標準報酬額から と同じ)/ 切替で消す / 目安の但し書き`;
});

// 15. さかのぼり(A-4-6): 初診日 2023-01 → 認定日 2024-07 → 翌月 2024-08 から 2026-09 まで 26か月 → 約70,600×26。2015-01 → 60か月で頭打ち
check(15, "さかのぼって受け取れる分の目安(認定日 = 初診日+1年6か月、翌月から今月まで、60か月で頭打ち)", () => {
  assert.equal(ninteiFromShoshin("2023-01"), "2024-07");
  assert.equal(sakanoboriMonths("2024-07", "2026-09-06"), 26);
  const r = sakanobori(A.basicGrade2, "2024-07", "2026-09-06");
  assert.equal(r.months, 26); assert.equal(r.counted, 26); assert.equal(r.capped, false);
  assert.equal(r.amount, approx100(monthly(A.basicGrade2)) * 26, "額 = 約月額 × 月数 でない");
  const old = sakanobori(A.basicGrade2, ninteiFromShoshin("2015-01"), "2026-09-06");
  assert.equal(old.counted, SAKANOBORI_MAX_MONTHS); assert.equal(old.capped, true); assert.equal(old.months, 122);
  assert.equal(sakanobori(A.basicGrade2, "2026-09", "2026-09-06"), null, "認定日が今月なのに出ている");
  assert.equal(sakanobori(A.basicGrade2, "2027-01", "2026-09-06"), null, "認定日が未来なのに出ている");
  assert.match(src(TOOL), /\{saka\.months\}か月のうち \$\{saka\.counted\}か月分/, "頭打ちの表示が無い");
  assert.match(src(TOOL), /認定日請求が認められた場合の目安です/, "但し書きが無い");
  return `2023-01 → 認定日 2024-07 → 26か月 → 約${r.amount.toLocaleString("ja-JP")}円(2級・国民年金)/ 2015-01 → ${old.months}か月のうち ${old.counted}か月分`;
});

// 16. 静的な本文(A-4-9): 表の値が AMOUNTS_2026、FAQPage 5問、<a 0
check(16, "静的な表が AMOUNTS_2026 から描かれ、FAQPage 5問で <a が無い", () => {
  const page = src(PAGE);
  for (const key of ["basicGrade1", "basicGrade2", "childFirstSecond", "childThird", "spouseAddition", "employeesGrade3Minimum", "supportGrade1Monthly", "supportGrade2Monthly"]) {
    assert.ok(page.includes(`AMOUNTS_2026.${key}`), `表に ${key} が無い`);
  }
  assert.equal((page.match(/\{ q: "/g) ?? []).length, 5, "FAQ が5問でない");
  assert.match(page, /faqJsonLd\(FAQ\.map/, "FAQPage の JSON-LD が無い");
  assert.ok(!/a: [`"][^`"]*<a/.test(page), "FAQ の回答に <a がある");
  assert.match(page, /stats\.sources\.sources/, "出典を data/stats/sources.json から読んでいない");
  assert.match(page, /\(A\.rateNew \* 1000\)\.toFixed\(3\)/, "乗率を data/amounts.ts から出していない");
  return "表8行が AMOUNTS_2026 / FAQ 5問・JSON-LD・<a 0 / 出典は sources.json / 乗率・年度も data から";
});

// 補助: §4-2 の旧・新の分割計算と1級の1.25倍(モックの houshuHirei と一致するか)
check("4-2", "旧(平成15年3月以前)・新の分割計算と1級1.25倍", () => {
  const s = input({ grade: 1, seido: "kousei", tsuki: 480, kyuTsuki: 200, hyoujun: 650000, kyuHyoujun: 620000 });
  const expected = (620000 * A.rateOld * 200 + 650000 * A.rateNew * 280) * A.grade1Rate;
  const got = houshuHirei(s);
  assert.equal(Math.round(got.value), Math.round(expected));
  assert.equal(got.minashi, false);
  // 旧の平均標準報酬月額が空なら、新の平均標準報酬額で代用する(モックの挙動)
  const fallback = houshuHirei(input({ seido: "kousei", tsuki: 480, kyuTsuki: 200, hyoujun: 650000 }));
  assert.equal(Math.round(fallback.value), Math.round(650000 * A.rateOld * 200 + 650000 * A.rateNew * 280));
  // 途中で丸めない: 合計は行の合計と一致する
  const full = calcKingaku(s);
  const sum = full.rows.reduce((n, r) => n + (r.amount ?? 0), 0);
  assert.equal(yearly(full.total), Math.round(sum), "合計が内訳の和と合わない");
  return `1級・480月(うち旧200月) → ${Math.round(got.value).toLocaleString("ja-JP")}円 / 合計 ${yearly(full.total).toLocaleString("ja-JP")}円`;
});

// 参考: 設計書 §6 の例(2級・子1人・国民年金)
const sample = calcKingaku(input({ grade: 2, seido: "kokumin", kids: 1 }));
const sampleLine = `2級・子1人・国民年金 → 年額 ${yearly(sample.total).toLocaleString("ja-JP")}円 / 月 約${monthly(sample.total).toLocaleString("ja-JP")}円`;

const ok = results.every((r) => r.ok);
console.log(`# /dougu/kingaku §9 完了条件\n`);
for (const r of results) console.log(`${r.ok ? "○" : "×"} ${r.id}. ${r.label}\n   ${r.note}`);
console.log(`\n参考: ${sampleLine}`);
console.log(`\n実ブラウザでの確認(375px の横スクロール・実際の計算表示・送信0件)は docs/verification/dougu-kingaku-2026-09-03/RESULT.md。`);
if (!ok) process.exitCode = 1;
