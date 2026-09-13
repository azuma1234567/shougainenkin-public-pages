// 金額の説明ルール(scripts/lib/amounts-derive.mjs)の単体検査。2026-09-13 の締め直しの約束を固定する。
//   node scripts/verify-amounts-rule.mjs
import assert from "node:assert/strict";
import { explainAmount, contextAround } from "./lib/amounts-derive.mjs";
import { AMOUNTS_2026, REFERENCE_AMOUNTS, STATISTICS } from "../data/amounts.ts";

const extra = { reference: REFERENCE_AMOUNTS, statistics: STATISTICS };
const explain = (value, context = "月額の文脈") => explainAmount(value, AMOUNTS_2026, context, extra);

// 当たるべき値(月額の文脈で)
const shouldMatch = {
  "70,600円": /basicGrade2\(847,300\)\) ÷ 12 ≒ 70,600\(100円単位の丸め\)/,
  "70,608円": /basicGrade2\(847,300\)\) ÷ 12 ≒ 70,608\(円未満の丸め\)/,
  "88,300円": /basicGrade1\(1,059,125\)\) ÷ 12 ≒ 88,300\(100円単位の丸め\)/,
  "141,200円": /basicGrade2\(847,300\)\) ÷ 12 × 2 ≒ 141,200\(100円単位の丸め\)/,
  "111,242円": /basicGrade2\(847,300\) \+ childFirstSecond\(243,800\) \+ childFirstSecond\(243,800\)\) ÷ 12 ≒ 111,242/,
  "135,669円": /basicGrade1\(1,059,125\) \+ childFirstSecond\(243,800\) \+ childFirstSecond\(243,800\) \+ childThird\(81,300\)\) ÷ 12 ≒ 135,669/,
  "52,958円": /employeesGrade3Minimum\(635,500\)\) ÷ 12 ≒ 52,958\(円未満の丸め\)/,
  "20,300円": /childFirstSecond\(243,800\)\) ÷ 12 ≒ 20,300\(100円単位の丸め\)/,
  "90,900円": /basicGrade2\(847,300\) \+ childFirstSecond\(243,800\)\) ÷ 12 ≒ 90,900\(100円単位の丸め\)/,
  "76,200円": /basicGrade2\(847,300\) \+ supportGrade2Monthly×12\(67,440\)\) ÷ 12 ≒ 76,200\(100円単位の丸め\)/,
};
for (const [value, re] of Object.entries(shouldMatch)) assert.match(explain(value) ?? "(説明なし)", re, value);
// 3級の最低保障(文脈に依らない)
assert.equal(explain("635,500円", ""), "basicGrade2(847,300) × 3/4(百円未満四捨五入)");
assert.equal(explain("633,700円", ""), "basicGrade2Old(844,900) × 3/4(百円未満四捨五入)");

// 当たってはいけない値(月額の文脈でも)
for (const value of ["635,475円", "17,920円", "37,200円", "545,760円", "300,000円"]) {
  assert.equal(explainAmount(value, AMOUNTS_2026, "月額の文脈。約。差。"), null, `${value} は AMOUNTS_2026 だけでは説明しない`);
}
// 制度の額・統計値は、表に宣言したもの(REFERENCE_AMOUNTS / STATISTICS)だけ値そのままで通る
assert.match(explain("17,920円", ""), /^制度の額: kokuminNenkinPremiumMonthly\(国民年金保険料\(月額\)、令和8年度/);
assert.match(explain("545,760円", ""), /^制度の額: specialDisabilityBenefitGrade2Yearly/);
assert.match(explain("91,451円", ""), /^統計値: kouginATypeMonthly2024/);
assert.equal(explain("300,000円"), null, "試算例は amounts-assumed.mjs の宣言で通す(ここでは通らない)");

// 文脈の門: 月の語が無ければ月額の近似は使わない。「約」が無ければ 1,000円の丸めは使わない
assert.equal(explain("70,600円", "年額の話"), null);
assert.match(explain("53,000円", "月にすると53,000円"), /employeesGrade3Minimum\(635,500\)\) ÷ 12 ≒ 53,000\(100円単位の丸め\)/, "52,958.3 の百円四捨五入");
assert.equal(explain("71,000円", "月にすると71,000円"), null, "70,608 → 71,000 は千円の丸めなので「約」が要る");
assert.match(explain("71,000円", "月にすると約71,000円"), /basicGrade2\(847,300\)\) ÷ 12 ≒ 71,000\(1,000円単位の丸め\)/);
assert.match(explain("106,000円", "2か月に一度、約106,000円"), /employeesGrade3Minimum\(635,500\)\) ÷ 12 × 2 ≒ 106,000\((100|1,000)円単位の丸め\)/, "105,916.7 の百円切り上げ(千円四捨五入でも一致)");
assert.equal(explainAmount("105,917円", AMOUNTS_2026, "月"), "(employeesGrade3Minimum(635,500)) ÷ 12 × 2 ≒ 105,917(円未満の丸め)", "障害手当金÷12 ではなく 3級の2か月分として説明する");

// 差: 「差」の段落だけ
assert.equal(explain("211,825円", "年211,825円の差です"), "basicGrade1(1,059,125) − basicGrade2(847,300)(差)");
assert.equal(explain("211,825円", "年211,825円です"), null);

// 使わなくなった組み合わせ: Old と今年度の混在、基準額どうしの和、×1.25、所得の線を和の材料にする
assert.equal(explain("1,478,600円", ""), null, "basicGrade2 + employeesGrade3MinimumOld は基準額どうしの和");
assert.equal(explain("1,694,600円", ""), null, "basicGrade2 × 2 は基準額どうしの和");
assert.equal(explain("2,647,300円", ""), null, "dependentDisabledIncomeLimitYen + basicGrade2(所得の線は材料にしない)");
// 使える組み合わせ: 基準額 + 加算、加算だけ
assert.equal(explain("1,334,900円", ""), "basicGrade2(847,300) + childFirstSecond(243,800) + childFirstSecond(243,800)");
assert.equal(explain("914,740円", ""), "basicGrade2(847,300) + supportGrade2Monthly×12(67,440)");
assert.equal(explain("487,600円", ""), "childFirstSecond(243,800) + childFirstSecond(243,800)");
assert.equal(explain("4,141,000円", ""), "incomeHalfBeforeOctober(3,761,000) + incomeLimitDependentAddition(380,000) × 1(扶養親族等の加算)");

// 表のセルの文脈: 見出し行に「月」があれば月額の文脈
const md = "本文\n| 何の額 | 月額 |\n|---|---|\n| 障害基礎年金2級 | 70,608円 |\n";
assert.equal(contextAround(md, md.indexOf("70,608")), "| 何の額 | 月額 |\n| 障害基礎年金2級 | 70,608円 |");
assert.match(explain("70,608円", contextAround(md, md.indexOf("70,608"))), /÷ 12 ≒ 70,608/);
const flat = "前の段落\n ⟨th⟩ 何の額 ｜  ⟨th⟩ 月額 ｜ \n 障害基礎年金2級 ｜  70,608円 ｜ \n";
assert.match(contextAround(flat, flat.indexOf("70,608")), /⟨th⟩ 月額/);
const plain = "年額の一覧\n70,608円\n";
assert.equal(contextAround(plain, plain.indexOf("70,608")), "70,608円");

console.log("金額の説明ルール: 当たるべき値 12、当たってはいけない値 5、文脈の門、差、組み合わせの制限、表のセル OK");

// 2026-09-13 の差分で見つけた取りこぼしを固定する
assert.equal(explain("84,300円", "年にすると84,300円"), "supportGrade1Monthly×12(84,300)", "給付金の年額は値そのまま");
assert.equal(explain("67,440円", ""), "supportGrade2Monthly×12(67,440)");
// 95,000 は「1級 + 給付金1級」÷12 ≒ 95,285 の千円四捨五入でもあり、式では弾けない。宣言(amounts-assumed)を式より先に見る呼び出し側で扱う
assert.match(explain("95,000円", "月およそ95,000円"), /basicGrade1\(1,059,125\) \+ supportGrade1Monthly×12\(84,300\)\) ÷ 12 ≒ 95,000/, "Old ではなく今年度の1級で説明する");
assert.equal(explain("95,035円", "月に95,035円"), null, "1級Old + 給付金1級 ÷12 は「昭和31年4月1日以前生まれ」の段落でしか使わない");
assert.match(explain("88,000円", "昭和31年4月1日以前生まれの1級は月約88,000円"), /basicGrade1Old\(1,056,125\)\) ÷ 12 ≒ 88,000\(1,000円単位の丸め\)/);
assert.equal(explain("633,700円", ""), "basicGrade2Old(844,900) × 3/4(百円未満四捨五入)", "Old の単独の値は文脈なしでも通る(3級の式)");
assert.equal(explain("844,900円", ""), "basicGrade2Old(844,900)", "Old の単独の値は文脈なしでも通る");
assert.equal(explain("112,000円", "月に約112,000円"), null, "111,241.7 の千円切り上げは認めない(千円は四捨五入だけ)");
console.log("差分で見つけた取りこぼし: 給付金の年額、Old の文脈、千円の切り上げ OK");
