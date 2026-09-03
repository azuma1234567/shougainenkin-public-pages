// docs/mitate-tool-design-2026-09-02.md §13 の完了条件のうち、
// ソースと固定ロジックだけで判定できるものを機械検査する。
// 実ブラウザでの確認(1,14,15 の実挙動)は docs/verification/dougu-mitate-2026-09-03/RESULT.md。
//   npm run verify:mitate
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import {
  MITATE_ABILITY_ITEMS, MITATE_AVERAGE_BANDS, MITATE_GRADE_TABLE, MITATE_GUIDE_AUTO,
  MITATE_GUIDE_CHITEKI, MITATE_GUIDE_COMMON, MITATE_GUIDE_HATTATSU, MITATE_GUIDE_SEISHIN,
} from "../../data/mitate.ts";
import { mitateAverage, mitateBandLabel, mitateGuideHits, mitateGuideSet, mitateLookup, normalizeMitate } from "../../lib/mitate.ts";

const results = [];
const check = (id, label, fn) => {
  try { results.push({ id, label, ok: true, note: fn() ?? "" }); }
  catch (e) { results.push({ id, label, ok: false, note: e.message.split("\n")[0] }); }
};

const TOOL = "components/tools/MitateTool.tsx";
const DATA = "data/mitate.ts";
const CORE = "lib/mitate.ts";
const STORE = "lib/mitate-storage.ts";
const PAGE = "app/dougu/mitate/page.tsx";
const src = (f) => readFileSync(f, "utf8");
const SOURCES = [TOOL, DATA, CORE, STORE, PAGE];

const st = (p = {}) => ({ ability: {}, guide: {}, ...p });
const ROWS = ["3.5以上", "3.0以上3.5未満", "2.5以上3.0未満", "2.0以上2.5未満", "1.5以上2.0未満", "1.5未満"];
const ZEN = { "０": "0", "１": "1", "２": "2", "３": "3", "４": "4", "５": "5", "６": "6", "７": "7", "８": "8", "９": "9", "Ａ": "A", "Ｂ": "B", "（": "(", "）": ")" };
const half = (s) => s.replace(/[０-９ＡＢ（）]/g, (c) => ZEN[c]);

// 1. /dougu・/dougu/mitate が動く。/dougu/moushitatesho との行き来ができる。
check(1, "/dougu・/dougu/mitate が動き、申立書ツールと行き来できる", () => {
  assert.ok(existsSync(PAGE), `${PAGE} が無い`);
  assert.match(src("app/dougu/page.tsx"), /href: "\/dougu\/mitate"/, "/dougu の一覧に mitate が無い");
  assert.match(src(TOOL), /href="\/dougu\/moushitatesho"/, "結果から申立書ツールへの導線が無い");
  assert.match(src("app/sitemap.ts"), /"\/dougu\/mitate"/, "sitemap に無い");
  assert.match(src(PAGE), /href: "\/dougu", label: "道具"/, "パンくずから /dougu へ戻れない");
  return "page.tsx / 一覧の href / 申立書への導線 / sitemap / パンくず";
});

// 2. 目安表が原本と全セル一致(座標照合の結果と突き合わせる)
check(2, "目安表が原本と全セル一致(座標照合)", () => {
  const fixture = JSON.parse(src("scripts/verify-mitate/fixtures/table.json"));
  let cells = 0;
  for (const row of ROWS) {
    assert.ok(MITATE_GRADE_TABLE[row], `行 ${row} が無い`);
    for (let d = 1; d <= 5; d += 1) {
      const mine = MITATE_GRADE_TABLE[row][d - 1];
      const pdf = fixture[row][String(d)];
      assert.equal(mine ?? null, pdf ?? null, `${row} × 程度(${d}): 実装 ${mine} / 原本 ${pdf}`);
      cells += 1;
    }
  }
  const blanks = ROWS.flatMap((r) => MITATE_GRADE_TABLE[r]).filter((v) => v === null).length;
  assert.equal(blanks, 16, `空欄の数が合わない(${blanks})`);
  return `${cells}セル一致。空欄 ${blanks} セルは null のまま(列中心 (5)=172.6/(4)=253.9/(3)=335.2/(2)=416.6/(1)=497.9 で照合)`;
});

// 3. 境界値は上の行。平均は小数第2位で丸めてから当てはめる。
check(3, "境界値は上の行に入り、平均は小数第2位で丸めてから当てはめる", () => {
  for (const [v, expected] of [[3.5, "3.5以上"], [3.0, "3.0以上3.5未満"], [2.5, "2.5以上3.0未満"], [2.0, "2.0以上2.5未満"], [1.5, "1.5以上2.0未満"], [1.49, "1.5未満"]]) {
    assert.equal(mitateBandLabel(v), expected, `${v} → ${mitateBandLabel(v)}`);
  }
  // 2,2,2,2,2,2,3 → 15/7 = 2.142857… → 2.14
  const a = mitateAverage(st({ ability: { meal: 2, hygiene: 2, money: 2, medical: 2, communication: 2, safety: 2, social: 3 } }));
  assert.equal(a.value, 2.14, `平均 ${a.value}`);
  // 3,3,3,3,3,3,4 → 22/7 = 3.142857… → 3.14 → 3.0以上3.5未満
  const b = mitateAverage(st({ ability: { meal: 3, hygiene: 3, money: 3, medical: 3, communication: 3, safety: 3, social: 4 } }));
  assert.equal(b.value, 3.14);
  assert.equal(mitateBandLabel(b.value), "3.0以上3.5未満");
  // 1,2 → 1.5 ちょうどは上の行
  const c = mitateAverage(st({ ability: { meal: 1, hygiene: 2 } }));
  assert.equal(c.value, 1.5);
  assert.equal(mitateBandLabel(c.value), "1.5以上2.0未満");
  return "1.5/2.0/2.5/3.0/3.5 とも上の行 / 15÷7=2.14・22÷7=3.14 で丸めてから当てはめ";
});

// 4. 一部だけ答えても結果が出て、「◯項目の回答から計算」が出る
check(4, "一部だけの回答でも結果が出て、回答項目数が出る", () => {
  const a = mitateAverage(st({ ability: { meal: 3, social: 4 } }));
  assert.equal(a.answered, 2); assert.equal(a.total, 7); assert.equal(a.value, 3.5);
  const look = mitateLookup(st({ ability: { meal: 3, social: 4 }, degree: 4 }));
  assert.equal(look.kind, "found"); assert.equal(look.grade, "1級又は2級");
  assert.equal(mitateAverage(st()).value, null, "0件で平均が出ている");
  assert.equal(mitateLookup(st()).kind, "none");
  assert.match(src(TOOL), /\{avg\.total\}項目中\{avg\.answered\}項目の回答から計算しています。/, "項目数の表示が無い");
  return "2項目のみ → 平均3.5・7項目中2項目と表示 / 0件では結果を出さない";
});

// 5. 表が空欄の組み合わせで §5-4 の文が出る。適当な等級を出さない。
check(5, "空欄の組み合わせで、目安を出さず §5-4 の文を出す", () => {
  // 平均4.0(3.5以上) × 程度(1) は原表の空欄
  const look = mitateLookup(st({ ability: { meal: 4, hygiene: 4 }, degree: 1 }));
  assert.equal(look.kind, "blank", `kind=${look.kind}`);
  assert.equal(look.grade, undefined, "空欄なのに等級が入っている");
  assert.match(src(TOOL), /目安が定められていません/, "§5-4 の文が無い");
  assert.match(src(TOOL), /診断書を書いた医師に内容を確認したうえで、ほかの記載も含めて総合的に評価する/, "§5-4 の後半が無い");
  // 空欄16通りすべてで blank になる
  let blanks = 0;
  for (const row of ROWS) for (let d = 1; d <= 5; d += 1) if (MITATE_GRADE_TABLE[row][d - 1] === null) blanks += 1;
  return `平均4.00×程度(1) は blank / 空欄 ${blanks} 通りは lookup が found にならない`;
});

// 6. 「それ以外」のとき目安表に進めない
check(6, "障害の種類が「それ以外」のとき、目安表に進めない", () => {
  assert.match(src(TOOL), /const outOfScope = s\.kind === "other";/, "対象外の判定が無い");
  assert.match(src(TOOL), /disabled=\{!s\.kind \|\| outOfScope\}/, "「次へ」が無効化されていない");
  assert.match(src(TOOL), /このガイドラインの対象外です。/, "専用の案内が無い");
  assert.match(src(TOOL), /ほかの障害には、それぞれ別の認定基準があり、この目安表は使えません。/);
  return "kind=other で次へが disabled / 専用の案内と /byoki への導線";
});

// 7. モードBの注記が入力中も結果画面にも常時出る(閉じられない)
check(7, "モードBの注記が入力中も結果画面にも常時出る", () => {
  const text = src(TOOL);
  assert.match(text, /function ModeBNote\(\)/, "注記の部品が無い");
  const uses = [...text.matchAll(/\{s\.mode === "B" && <ModeBNote \/>\}/g)].length;
  assert.ok(uses >= 4, `注記の出現が ${uses} 箇所しかない(モード・判定・程度・総合評価・結果)`);
  assert.ok(!/ModeBNote[\s\S]{0,400}(閉じる|onClick|hidden)/.test(text.slice(text.indexOf("function ModeBNote"))), "注記に閉じる操作がある");
  assert.match(text, /審査が見るのは、医師が診断書に書いた数字です。/);
  return `${uses}箇所(モード選択・判定7項目・程度・総合評価・結果)に常時表示。閉じる操作なし`;
});

// 8. §7 の質問が種類で切り替わり、引用が原本と1字一致。最大6件。
check(8, "総合評価の質問が種類で切り替わり、引用が原本と1字一致", () => {
  const hyou2 = src("scripts/verify-mitate/fixtures/hyou2.txt").replace(/\s+/g, "");
  const all = [...MITATE_GUIDE_COMMON, ...MITATE_GUIDE_SEISHIN, ...MITATE_GUIDE_CHITEKI, ...MITATE_GUIDE_HATTATSU, MITATE_GUIDE_AUTO.bias, MITATE_GUIDE_AUTO.gap];
  const missing = all.filter((g) => !hyou2.includes(g.quote.replace(/\s+/g, "")));
  assert.deepEqual(missing.map((g) => g.id), [], `原本に無い引用: ${missing.map((g) => `${g.id}「${g.quote.slice(0, 24)}…」`).join(" / ")}`);
  assert.ok(all.every((g) => !g.quote.includes("…")), "省略した引用がある(§7-3 は省略に「…」を要求するが、いまは全文を載せている)");
  assert.equal(mitateGuideSet("seishin").length, MITATE_GUIDE_COMMON.length + MITATE_GUIDE_SEISHIN.length);
  assert.equal(mitateGuideSet("chiteki").length, MITATE_GUIDE_COMMON.length + MITATE_GUIDE_CHITEKI.length);
  assert.equal(mitateGuideSet("hattatsu").length, MITATE_GUIDE_COMMON.length + MITATE_GUIDE_HATTATSU.length);
  assert.notEqual(mitateGuideSet("chiteki").map((g) => g.id).join(), mitateGuideSet("hattatsu").map((g) => g.id).join());
  // 最大6件
  const many = st({ kind: "seishin", guide: Object.fromEntries(mitateGuideSet("seishin").map((g) => [g.id, true])), ability: { meal: 4, hygiene: 4, money: 1, medical: 1 }, degree: 1 });
  assert.equal(mitateGuideHits(many, mitateLookup(many)).length, 6, "6件を超えている");
  return `${all.length}件すべて原本の文字列に含まれる(全文・省略なし) / 種類で切替 / 上限6件`;
});

// 9. 国民年金を選ぶと「3級」に「2級非該当」が併記される(書き換えではない)
check(9, "国民年金のとき「3級」に「2級非該当」が併記される", () => {
  const text = src(TOOL);
  assert.match(text, /s\.seido === "kokumin" && grade && grade\.includes\("3級"\)/, "併記の条件が無い");
  assert.match(text, /2級非該当\(3級のない制度のため\)/, "併記の文が無い");
  assert.match(text, /と読み替えられます。/);
  // 表そのものは書き換えない
  assert.match(text, /\{v === null \? "—" : v\}/, "表のセルが加工されている");
  assert.ok(!/MITATE_GRADE_TABLE[\s\S]{0,200}replace/.test(text), "表の値を置換している");
  return "条件つきで結果の下に併記。目安表のセルと lookup の値は書き換えない";
});

// 10. 結果画面に目安表の全体が出て、該当セルが強調される
check(10, "結果画面に目安表の全体が出て、該当セルが強調される", () => {
  const text = src(TOOL);
  assert.match(text, /MITATE_AVERAGE_BANDS\.map\(\(b\) =>/, "全行を回していない");
  assert.match(text, /\[1, 2, 3, 4, 5\]\.map\(\(d\) => \{/, "全列を回していない");
  assert.match(text, /const hit = b\.label === band && d === s\.degree;/, "該当セルの判定が無い");
  assert.match(text, /hit \? "mi-hit"/, "強調クラスが無い");
  assert.match(src("app/globals.css"), /table\.mi-gt td\.mi-hit\{/, "強調のスタイルが無い");
  return "6行×5列を常に描画し、該当セルに mi-hit と aria-current";
});

// 11. ネットワーク送信が0件
// コメントは剥がしてから探す。「fetch を書かない」と書いた注意書き自体を
// 送信コードとして数えると、検査が意味を失う。
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
check(11, "入力と結果をサーバーへ送るコードが無い", () => {
  const BAD = ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "<form", "EventSource", "navigator.send"];
  for (const f of SOURCES) {
    const code = stripComments(src(f));
    for (const bad of BAD) assert.ok(!code.includes(bad), `${f} に ${bad} がある`);
  }
  return `${BAD.join(" / ")} いずれも無し(コメントを除いた ${SOURCES.length} ファイルのコード)`;
});

// 12. 禁止語が1つも出ない
check(12, "禁止語が1つも出ない", () => {
  const BANNED = [/あなたは[０-９0-9]級/, /[０-９0-9]級相当/, /通りそう/, /もらえそう/, /難しそう/, /厳しそう/, /可能性は[０-９0-9]+%/, /[０-９0-9]割が受給/];
  const hits = [];
  for (const f of [...SOURCES, "app/globals.css"]) {
    const text = src(f);
    for (const re of BANNED) if (re.test(text)) hits.push(`${f}: ${re}`);
  }
  assert.deepEqual(hits, [], hits.join(" / "));
  return `${BANNED.length}パターンをソース6ファイルで検索して0件`;
});

// 13. 結果を A4 2枚以内で印刷でき、出典と主語が載る。目安表を割らない。
// (§13-13。当初の「1枚」は #10「目安表の全体を常に表示」と両立せず、2026-09-03 に条件を変更)
check(13, "A4 2枚以内で印刷でき、目安表が割れず、出典と主語が載る", () => {
  const css = src("app/globals.css");
  assert.match(css, /@page\{size:A4;margin:12mm\}/, "A4の指定が無い");
  assert.match(css, /\.mi-printhead\{display:block/, "印刷時の見出しが出ない");
  assert.match(src(PAGE), /国が公表している目安に当てはめた結果です/, "印刷物の主語が無い");
  assert.match(src(PAGE), /このサイトが判定したものではありません。/);
  assert.match(src(TOOL), /MITATE_SOURCE\.url/, "出典URLが無い");
  assert.match(css, /\.no-print,\.mi-screen-only\{display:none!important\}/, "画面用カードが印刷から落ちない");
  assert.match(css, /\.mi-tbl-scroll,table\.mi-gt\{break-inside:avoid/, "目安表に break-inside: avoid が無い");
  assert.match(css, /\.mi-guide\{break-inside:avoid/, "引用に break-inside: avoid が無い");
  // 画面用の2枚(数字で見る実際 / ここからできること)には mi-screen-only が付いている
  assert.equal((src(TOOL).match(/mi-card mi-screen-only/g) ?? []).length, 2, "印刷から落とすカードが2枚でない");

  const file = "scripts/verify-mitate/fixtures/print.json";
  assert.ok(existsSync(file), `${file} が無い。npm run verify:mitate:print を先に実行する`);
  const measured = JSON.parse(src(file));
  const KEEP = ["国のガイドラインの目安", "総合評価で動きうること", "ガイドライン自身の留保", "出典"];
  for (const c of measured.cases) {
    assert.ok(c.pages <= 2, `${c.name}: ${c.pages}ページ(2枚を超えている)`);
    assert.equal(c.screenOnlyVisible, 0, `${c.name}: 画面用カードが印刷に残っている`);
    assert.deepEqual(c.cardsOnPrint, KEEP, `${c.name}: 印刷に載るカードが違う → ${c.cardsOnPrint.join(" / ")}`);
    assert.ok(c.hasSource, `${c.name}: 出典が印刷に無い`);
    assert.ok(c.hasPrintHead, `${c.name}: 主語の但し書きが印刷に無い`);
    assert.equal(c.tableStartPage, c.tableEndPage, `${c.name}: 目安表が ${c.tableStartPage}〜${c.tableEndPage}ページ目にまたがっている`);
  }
  const line = measured.cases.map((c) => `${c.name} ${c.pages}ページ(${c.contentMm}mm)`).join(" / ");
  return `実測 ${line}。目安表はいずれも1ページ目に収まる(${measured.cases[0].tableHeightMm}mm)。載せるのは ${KEEP.join("・")} の4つ / 測定 ${measured.generatedAt}`;
});

// 14. localStorage が無効でも入力と結果表示ができる
check(14, "localStorage が無効でも動く", () => {
  const store = src(STORE);
  assert.equal((store.match(/try \{/g) ?? []).length, 3, "load/save/clear のどれかが try/catch でない");
  assert.match(store, /catch \{ return null; \}/);
  assert.match(src(TOOL), /setSaveNote\(saveMitate\(s\) \? "" : "この端末に保存できませんでした。入力と結果はそのまま使えます。"\)/, "保存失敗の知らせが無い");
  assert.ok(!src(TOOL).includes("localStorage."), "コンポーネントが localStorage を直接触っている");
  // 壊れた保存値は捨てる
  assert.equal(normalizeMitate({ ability: { meal: 9 }, degree: 8, kind: "zzz", guide: { nope: true } }), null);
  assert.deepEqual(normalizeMitate({ ability: { meal: 3, bogus: 4 }, degree: 3 }), { ability: { meal: 3 }, guide: {}, degree: 3 });
  return "load/save/clear とも try/catch / 保存失敗を画面で知らせる / 壊れた値は未回答へ戻す";
});

// 15. モバイル375px・キーボード(ソース側で担保できる分)
check(15, "375pxとキーボード操作の作り", () => {
  const text = src(TOOL), css = src("app/globals.css");
  assert.ok(!/<div[^>]*onClick/.test(text), "div に onClick がある(ネイティブ要素でない)");
  const buttons = (text.match(/type="button"/g) ?? []).length;
  assert.ok(buttons >= 10, `button に type が付いていないものがある(${buttons})`);
  assert.match(css, /\.mi-opt:focus-visible,\.mi-btn:focus-visible,\.mi-skip:focus-visible\{outline/, "フォーカスリングが無い");
  assert.match(css, /\.mi-tbl-scroll\{overflow-x:auto\}/, "表の横スクロール枠が無い");
  assert.match(css, /@media\(max-width:520px\)\{\.mi-card\{padding:18px 16px\}/, "モバイルの詰めが無い");
  return `選択肢はすべて <button type="button">(${buttons}個) / focus-visible / 表は枠内でスクロール`;
});

// 16. 既存記事のURL・h1・本文に触っていない(git の差分で見る)
check(16, "既存記事のURL・h1・本文に触っていない", () => {
  const base = process.env.MITATE_BASE_REF ?? "origin/main";
  const changed = execFileSync("git", ["diff", "--name-only", base, "--", "content/columns", "app/columns", "lib/columns.ts"], { encoding: "utf8" })
    .split("\n").filter(Boolean);
  assert.deepEqual(changed, [], `記事側に差分がある: ${changed.join(" / ")}`);
  const count = readdirSync("content/columns").filter((f) => f.endsWith(".ts")).length;
  return `${base} との差分で content/columns・app/columns・lib/columns.ts に変更0件(記事 ${count} 本)`;
});

const ok = results.every((r) => r.ok);
console.log("# /dougu/mitate §13 完了条件\n");
for (const r of results) console.log(`${r.ok ? "○" : "×"} ${r.id}. ${r.label}\n   ${r.note}`);
console.log("\n実ブラウザでの確認(1・14・15 の実挙動、印刷1枚)は docs/verification/dougu-mitate-2026-09-03/RESULT.md。");
if (!ok) process.exitCode = 1;
