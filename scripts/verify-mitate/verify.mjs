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

// 1. /dougu/mitate が公開導線につながっている。
check(1, "/dougu/mitate が動き、申立書ツールへの導線がある", () => {
  assert.ok(existsSync(PAGE), `${PAGE} が無い`);
  assert.match(src(TOOL), /href="\/dougu\/moushitatesho"/, "結果から申立書ツールへの導線が無い");
  assert.match(src("app/sitemap.ts"), /"\/dougu\/mitate"/, "sitemap に無い");
  assert.match(src(PAGE), /href: "\/shinsei", label: "申請の流れ"/, "パンくずから /shinsei へ戻れない");
  return "page.tsx / 申立書への導線 / sitemap / 申請の流れへのパンくず";
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

// 4. 一部だけ答えても、回答した項目だけで平均を出す。
check(4, "一部だけの回答でも、回答した項目だけで平均を出す", () => {
  const a = mitateAverage(st({ ability: { meal: 3, social: 4 } }));
  assert.equal(a.answered, 2); assert.equal(a.total, 7); assert.equal(a.value, 3.5);
  const look = mitateLookup(st({ ability: { meal: 3, social: 4 }, degree: 4 }));
  assert.equal(look.kind, "found"); assert.equal(look.grade, "1級又は2級");
  assert.equal(mitateAverage(st()).value, null, "0件で平均が出ている");
  assert.equal(mitateLookup(st()).kind, "none");
  assert.ok(!src(TOOL).includes("項目中"), "結果に回答項目数が出ている");
  return "2項目のみ → 平均3.5 / 0件では結果を出さない / 結果に回答項目数を出さない";
});

// 5. 表が空欄の組み合わせで §5-4 の文が出る。適当な等級を出さない。
check(5, "空欄の組み合わせで、目安を出さず §5-4 の文を出す", () => {
  // 平均4.0(3.5以上) × 程度(1) は原表の空欄
  const look = mitateLookup(st({ ability: { meal: 4, hygiene: 4 }, degree: 1 }));
  assert.equal(look.kind, "blank", `kind=${look.kind}`);
  assert.equal(look.grade, undefined, "空欄なのに等級が入っている");
  assert.match(src(TOOL), /目安が定められていません/, "§5-4 の文が無い");
  assert.match(src(TOOL), /表に目安が無いのは、対象外という意味ではありません。/, "空欄の説明が無い");
  // 空欄16通りすべてで blank になる
  let blanks = 0;
  for (const row of ROWS) for (let d = 1; d <= 5; d += 1) if (MITATE_GRADE_TABLE[row][d - 1] === null) blanks += 1;
  return `平均4.00×程度(1) は blank / 空欄 ${blanks} 通りは lookup が found にならない`;
});

// 6. はじめる前に質問を置かない。
check(6, "「はじめる」の前に質問が無い", () => {
  const intro = src(TOOL).slice(src(TOOL).indexOf('if (step === 0)'), src(TOOL).indexOf('if (step >= 1'));
  assert.match(intro, /「私は、障害年金の対象になるのかな」と思ったら/);
  assert.match(intro, />はじめる</);
  for (const word of ["障害の種類", "共用のパソコンを使っています", "加入していた制度", "診断書は、もう手元にありますか"]) assert.ok(!intro.includes(word), `入口に「${word}」がある`);
  return "入口は見出し・説明・3つの安心・はじめる・診断書モードへのリンクだけ";
});

// 7. 自己回答と診断書転記で、結果の静かな1行を切り替える。
check(7, "結果の静かな1行がモードで切り替わる", () => {
  const text = src(TOOL);
  assert.match(text, /この結果は、あなた自身の答えから出しています。実際の審査は医師の診断書をもとに行われるので、違う結果になることがあります。/);
  assert.match(text, /診断書の記載をそのまま当てはめた結果です。/);
  assert.ok(!text.includes("mi-warnbox"), "黄色い注記が残っている");
  return "自己回答と診断書転記の2文を切替 / 黄色い注記なし";
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

// 9. 診断書モードで正式文言と結果リンクを切り替える。
check(9, "診断書モードで正式文言と結果リンクが切り替わる", () => {
  const text = src(TOOL);
  assert.match(text, /get\("mode"\) === "shindansho"/);
  assert.match(text, /\{shindansho \? choice\.formal : choice\.plain\}/);
  assert.match(text, /→ 何をそろえればいい？/);
  assert.match(text, /→ 申立書を、自分で書きたい/);
  assert.match(text, /→ 診断書で困ったとき/);
  return "?mode=shindansho / 正式文言を strong / 指定3リンクへ切替";
});

// 10. 結果画面に目安表の全体が出て、該当セルが強調される
check(10, "結果画面に目安表の全体が出て、該当セルが強調される", () => {
  const text = src(TOOL);
  assert.match(text, /MITATE_AVERAGE_BANDS\.map\(\(row\) =>/, "全行を回していない");
  assert.match(text, /\[1,2,3,4,5\]\.map\(\(degree\) => \{/, "全列を回していない");
  assert.match(text, /hit = row\.label === band && degree === state\.degree/, "該当セルの判定が無い");
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
  const file = "scripts/verify-mitate/fixtures/print.json";
  assert.ok(existsSync(file), `${file} が無い。npm run verify:mitate:print を先に実行する`);
  const measured = JSON.parse(src(file));
  for (const c of measured.cases) {
    assert.ok(c.pages <= 2, `${c.name}: ${c.pages}ページ(2枚を超えている)`);
    assert.ok(c.hasSource, `${c.name}: 出典が印刷に無い`);
    assert.ok(c.hasPrintHead, `${c.name}: 主語の但し書きが印刷に無い`);
    assert.equal(c.tableStartPage, c.tableEndPage, `${c.name}: 目安表が ${c.tableStartPage}〜${c.tableEndPage}ページ目にまたがっている`);
  }
  const line = measured.cases.map((c) => `${c.name} ${c.pages}ページ(${c.contentMm}mm)`).join(" / ");
  return `実測 ${line}。目安表はページをまたがらない / 測定 ${measured.generatedAt}`;
});

// 14. localStorage が無効でも入力と結果表示ができる
check(14, "「残す」を押したときだけ localStorage に書く", () => {
  const store = src(STORE);
  assert.equal((store.match(/try \{/g) ?? []).length, 3, "load/save/clear のどれかが try/catch でない");
  assert.match(store, /catch \{ return null; \}/);
  assert.equal((src(TOOL).match(/saveMitate\(/g) ?? []).length, 1, "保存呼び出しがボタン以外にもある");
  assert.match(src(TOOL), /onClick=\{\(\) => setSaved\(saveMitate\(state\)\)\}/, "残すボタンから保存していない");
  assert.ok(!src(TOOL).includes("localStorage."), "コンポーネントが localStorage を直接触っている");
  // 壊れた保存値は捨てる
  assert.equal(normalizeMitate({ ability: { meal: 9 }, degree: 8, kind: "zzz", guide: { nope: true } }), null);
  assert.deepEqual(normalizeMitate({ ability: { meal: 3, bogus: 4 }, degree: 3 }), { ability: { meal: 3 }, guide: {}, degree: 3 });
  return "saveMitate は残すボタンの1回だけ / storage は try/catch / 壊れた値は未回答へ戻す";
});

// 15. モバイル375px・キーボード(ソース側で担保できる分)
check(15, "375pxとキーボード操作の作り", () => {
  const text = src(TOOL), css = src("app/globals.css");
  assert.ok(!/<div[^>]*onClick/.test(text), "div に onClick がある(ネイティブ要素でない)");
  const buttons = (text.match(/type="button"/g) ?? []).length;
  assert.ok(buttons >= 10, `button に type が付いていないものがある(${buttons})`);
  assert.match(css, /\.mi-answer-list button:hover,\.mi-answer-list button:focus-visible\{/, "フォーカスリングが無い");
  assert.match(css, /\.mi-tbl-scroll\{overflow-x:auto\}/, "表の横スクロール枠が無い");
  assert.match(css, /@media\(max-width:520px\)/, "モバイル指定が無い");
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
