// 出力に出てくる金額が data/amounts.ts の値から導出できるかを検算する。
// 2026-09-13 に「月額に近い値」の規則を締め直した(docs/verification/amounts-rule-2026-09-13/)。
// 「説明」を探す順:
//   1. 障害厚生年金3級の最低保障 = basicGrade2 × 3/4 を百円未満四捨五入(丸める前の値は説明しない)
//   2. amounts.ts の値そのもの。REFERENCE_AMOUNTS(年金額でない制度の額)・STATISTICS(統計値)は値そのものだけ
//   3. 年額の和: 基準額(1・2級、3級最低保障、その Old)1つ + 加算(子の加算・配偶者加給・給付金×12)1〜3個、
//      または加算だけ 2〜3個。Old と今年度の混在、基準額どうしの和、×1.25 は使わない
//   4. 20歳前傷病の所得制限 + 扶養親族等の加算 × 人数
//   5. 「差」の段落だけ: 基準額どうしの差(1級−2級 など)
//   6. 月額(段落に 月・か月・÷12 があるときだけ): 3 の年額(単独の年額を含む) ÷12 か ÷12×2 を、
//      1円・10円・100円で丸めた値(四捨五入・切り捨て・切り上げ)。「約」などがあるときだけ 1,000円の丸めも許す
//   7. 前年度額として明示されているもの(同じ段落に「前年度」「令和7年度」がある場合のみ)
//   8. 繰上げ・繰り上げの段落のみ、basicGrade2/basicGrade2Old × (1 − 0.004 × 1〜60か月)、円未満切り捨て
//   9. 「超」の整数表現(amounts.ts の値 +1 円)
// 説明できたときは式の文字列、できなければ null を返す。式で導けない概算・試算例は scripts/lib/amounts-assumed.mjs に
// 宣言する(呼び出し側が見る)。

const toNumber = (text) => Number(String(text).replace(/[,円]/g, ""));
const fmt = (n) => Math.round(n).toLocaleString("ja-JP");

// amounts.ts の値を3種に分ける:
//   annual   … 年額の給付額
//   monthly  … 月額の給付金。そのままの値と、×12 した年額(加算として)だけ許す
//   threshold… 所得・収入の基準。そのままの値と「超(+1)」だけ許す(和の材料にはしない)
export function amountEntries(AMOUNTS) {
  return Object.entries(AMOUNTS).filter(([, value]) => /,/.test(value)).map(([key, value]) => ({ key, value: toNumber(value) }));
}
function classify(entries) {
  const annual = [], monthly = [], threshold = [];
  for (const e of entries) {
    if (/^income|IncomeLimit/.test(e.key)) threshold.push(e);
    else if (/Monthly$/.test(e.key)) monthly.push(e);
    else annual.push(e);
  }
  return { annual, monthly, threshold };
}
const BASE_KEY = /^(basicGrade[12](Old)?|employeesGrade3Minimum(Old)?|disabilityAllowanceMinimum)$/;
const ADDITION_KEY = /^(childFirstSecond|childThird|spouseAddition)$/;
const label = (e) => `${e.key}(${fmt(e.value)})`;

function buildCandidates(entries) {
  const { annual, monthly, threshold } = classify(entries);
  const monthlyTimes12 = monthly.map((e) => ({ key: `${e.key}×12`, value: e.value * 12 }));
  // 値そのもの: 年額・月額・基準に加えて、月額の給付金を年にした額(「年にすると84,300円」)
  const exact = [...annual, ...monthly, ...threshold, ...monthlyTimes12].map((e) => ({ value: e.value, expr: label(e), terms: 1 }));
  const bases = annual.filter((e) => BASE_KEY.test(e.key));
  const additions = [...annual.filter((e) => ADDITION_KEY.test(e.key)), ...monthlyTimes12];
  // 加算の組み合わせ(1〜3個、同じ加算の繰り返し可。子3人など)。制度上ありえない組み合わせは作らない:
  //   子の加算は1・2人目が2つまで、3人目以降はその後にだけ付く。配偶者加給は1つまで。
  //   年金生活者支援給付金は1級用か2級用のどちらか1つだけ(基準額が1級なら1級用、2級なら2級用)。
  //   3級の最低保障と障害手当金には、子の加算・配偶者加給・給付金は付かない。
  const count = (set, re) => set.filter((e) => re.test(e.key)).length;
  const plausible = (set, base) => {
    const c12 = count(set, /^childFirstSecond$/), c3 = count(set, /^childThird$/), sp = count(set, /^spouseAddition$/);
    const s1 = count(set, /^supportGrade1Monthly×12$/), s2 = count(set, /^supportGrade2Monthly×12$/);
    if (c12 > 2 || (c3 > 0 && c12 !== 2) || sp > 1 || s1 + s2 > 1) return false;
    if (!base) return true;
    if (/^(employeesGrade3Minimum|disabilityAllowanceMinimum)/.test(base.key)) return set.length === 0;
    if (/^basicGrade1/.test(base.key)) return s2 === 0;
    if (/^basicGrade2/.test(base.key)) return s1 === 0;
    return true;
  };
  const additionSets = [];
  const rec = (start, parts) => {
    if (parts.length) additionSets.push(parts);
    if (parts.length === 3) return;
    for (let i = start; i < additions.length; i += 1) rec(i, [...parts, additions[i]]);
  };
  rec(0, []);
  const sumOf = (parts) => parts.reduce((s, e) => s + e.value, 0);
  const sums = [];
  for (const base of bases) for (const set of additionSets.filter((s) => plausible(s, base))) sums.push({ value: base.value + sumOf(set), expr: [base, ...set].map(label).join(" + "), terms: 1 + set.length });
  for (const set of additionSets.filter((s) => s.length >= 2 && plausible(s, null))) sums.push({ value: sumOf(set), expr: set.map(label).join(" + "), terms: set.length });
  sums.sort((a, b) => a.terms - b.terms);
  // 月額の元になる年額: 単独の年額(基準額・加算・給付金×12)と、上の和。障害手当金は一時金なので月額にしない
  const isLumpSum = (expr) => /disabilityAllowanceMinimum/.test(expr);
  const yearly = [...bases, ...additions].map((e) => ({ value: e.value, expr: label(e), terms: 1 })).concat(sums).filter((c) => !isLumpSum(c.expr));
  const monthlyOf = yearly.flatMap((c) => [
    { value: c.value / 12, expr: `(${c.expr}) ÷ 12`, terms: c.terms + 1 },
    { value: (c.value / 12) * 2, expr: `(${c.expr}) ÷ 12 × 2`, terms: c.terms + 2 },
  ]);
  const differences = [];
  for (const a of bases) for (const b of bases) if (a.value > b.value) differences.push({ value: a.value - b.value, expr: `${label(a)} − ${label(b)}`, terms: 2 });
  return { exact, sums, monthlyOf, differences };
}

let cache = null;
function candidates(AMOUNTS) {
  if (!cache || cache.source !== AMOUNTS) cache = { source: AMOUNTS, list: buildCandidates(amountEntries(AMOUNTS)) };
  return cache.list;
}

const MONTHLY_CONTEXT = /月|÷\s*12|12で割/;
const APPROX_CONTEXT = /約|およそ|ほど|くらい|ぐらい|ざっと|前後/;
// 昭和31年4月1日以前生まれの額(〜Old)は、その話をしている段落でだけ使う
const OLD_CONTEXT = /昭和31年|以前生まれ|前年度|令和7年度/;
const usesOld = (expr) => /Old\(/.test(expr);

// 計算値 exact を、丸め方 unit(1・10・100・1000)で丸めた値が value に一致するか。
// 1・10・100円は四捨五入・切り捨て・切り上げのどれでもよいが、1,000円は四捨五入だけ(切り上げまで許すと当たりすぎる)。
// 粗い単位から当てる(70,608.3 → 70,600 は「100円単位」と説明する)
function roundsTo(exact, value, units) {
  for (const unit of [...units].sort((a, b) => b - a)) {
    for (const f of unit >= 1000 ? [Math.round] : [Math.round, Math.floor, Math.ceil]) {
      if (f(exact / unit) * unit === value) return unit === 1 ? "円未満の丸め" : `${unit.toLocaleString("ja-JP")}円単位の丸め`;
    }
  }
  return null;
}

// 年金額でない制度の額・統計値(data/amounts.ts の REFERENCE_AMOUNTS / STATISTICS)。値そのものだけ許す
function explainKnown(value, table, kind) {
  for (const [key, item] of Object.entries(table ?? {})) {
    if (toNumber(item.value) === value) return `${kind}: ${key}(${item.label}、${item.fiscalYear}、${item.source})`;
  }
  return null;
}

/**
 * @param {string|number} raw   例: "1,334,900円" / 1334900
 * @param {Record<string,string>} AMOUNTS  data/amounts.ts の AMOUNTS_2026
 * @param {string} [context]  金額が出てくる段落(表なら見出し行+同じ行)のテキスト。月額・約・前年度・超・差 の判定に使う
 * @param {{reference?: object, statistics?: object}} [extra]  data/amounts.ts の REFERENCE_AMOUNTS / STATISTICS
 * @returns {string|null} 説明の式。説明できなければ null
 */
export function explainAmount(raw, AMOUNTS, context = "", extra = {}) {
  const value = toNumber(raw);
  const { exact, sums, monthlyOf, differences } = candidates(AMOUNTS);
  // 1. 3級の最低保障 = 2級 × 3/4 を百円未満四捨五入。丸める前の値(635,475 など)は公式額ではないので説明しない
  for (const e of amountEntries(AMOUNTS).filter((e) => ["basicGrade2", "basicGrade2Old"].includes(e.key))) {
    const threeQuarters = (e.value * 3) / 4;
    const rounded = Math.round(threeQuarters / 100) * 100;
    if (rounded === value) return `${e.key}(${fmt(e.value)}) × 3/4(百円未満四捨五入)`;
    if (threeQuarters === value && rounded !== value) return null;
  }
  // 2. 値そのもの
  const oldOk = OLD_CONTEXT.test(context);
  const hit = (list) => list.find((c) => Math.round(c.value) === value && (oldOk || !usesOld(c.expr) || c.terms === 1));
  const found = hit(exact) ?? explainKnown(value, extra.reference, "制度の額") ?? explainKnown(value, extra.statistics, "統計値") ?? hit(sums);
  if (found) return typeof found === "string" ? found : found.expr;
  // 4. 20歳前傷病の所得制限の線に、扶養親族等の加算を人数分足した額(国民年金法施行令 第5条の4)
  for (const base of amountEntries(AMOUNTS).filter((e) => /^income(Half|Full)(Before|From)October$/.test(e.key))) {
    for (const add of amountEntries(AMOUNTS).filter((e) => /^incomeLimit(Dependent|Elderly|Specified)Addition$/.test(e.key))) {
      for (let n = 1; n <= 5; n++) {
        if (base.value + add.value * n === value) return `${base.key}(${fmt(base.value)}) + ${add.key}(${fmt(add.value)}) × ${n}(扶養親族等の加算)`;
      }
    }
  }
  // 5. 差
  if (/差/.test(context)) {
    const diff = hit(differences);
    if (diff) return `${diff.expr}(差)`;
  }
  // 6. 月額。段落に月の語があるときだけ。丸め方が説明できるものだけ
  if (MONTHLY_CONTEXT.test(context)) {
    const units = APPROX_CONTEXT.test(context) ? [1, 10, 100, 1000] : [1, 10, 100];
    const matches = monthlyOf
      .filter((c) => oldOk || !usesOld(c.expr))
      .map((c) => ({ c, how: roundsTo(c.value, value, units) }))
      .filter((m) => m.how)
      .sort((a, b) => a.c.terms - b.c.terms || Math.abs(a.c.value - value) - Math.abs(b.c.value - value));
    if (matches[0]) return `${matches[0].c.expr} ≒ ${fmt(value)}(${matches[0].how})`;
  }
  // 7. 前年度
  if (/前年度|令和7年度/.test(context)) return "前年度額(本文に明示)";
  // 8. 繰上げ
  if (/繰上げ|繰り上げ/.test(context)) {
    for (const entry of amountEntries(AMOUNTS).filter((e) => ["basicGrade2", "basicGrade2Old"].includes(e.key))) {
      for (let n = 1; n <= 60; n++) {
        // 整数比で計算し、浮動小数点の誤差による1円の切り捨て過ぎを防ぐ。
        if (Math.floor((entry.value * (1000 - 4 * n)) / 1000) === value) {
          return `${entry.key}(${fmt(entry.value)}) × (1 − 0.004 × ${n})(繰上げ減額)`;
        }
      }
    }
  }
  // 9. 超
  const plusOne = amountEntries(AMOUNTS).find((e) => e.value + 1 === value);
  if (plusOne) return `${plusOne.key}(${fmt(plusOne.value)}) + 1(「超」の整数表現)`;
  return null;
}

// テキスト中の「N,NNN円」形式の金額をすべて抜き出す(10万円以上だけを対象にしたいときは min を渡す)
export function findAmounts(text, min = 0) {
  return [...text.matchAll(/\d{1,3}(?:,\d{3}){1,2}円/g)].map((m) => ({ text: m[0], value: toNumber(m[0]), index: m.index })).filter((a) => a.value >= min);
}

// 段落(前後の改行まで)を取り出す
export function paragraphAround(text, index) {
  const start = text.lastIndexOf("\n", index) + 1;
  const end = text.indexOf("\n", index);
  return text.slice(start, end === -1 ? text.length : end);
}

// 金額の文脈。段落と同じだが、表のセルなら見出し行も足す(見出し行か同じ行に「月」があれば月額の文脈になる)。
//   Markdown の表: 行が "|" で始まる。上へたどって、"|" で始まる行の最初(見出し行)を足す
//   HTML を平文にした表(prelaunch): セルは " ｜ " 区切り、見出しセルには "⟨th⟩" が付く。上へたどって ⟨th⟩ のある行を足す
export function contextAround(text, index) {
  const line = paragraphAround(text, index);
  const lineStart = text.lastIndexOf("\n", index) + 1;
  // その行より前の行(末尾の改行を含めない)
  const lines = lineStart > 0 ? text.slice(0, lineStart - 1).split("\n") : [];
  if (line.trim().startsWith("|")) {
    let header = null;
    for (let i = lines.length - 1; i >= 0 && lines[i].trim().startsWith("|"); i -= 1) header = lines[i];
    return header && header !== line ? `${header}\n${line}` : line;
  }
  if (line.includes("｜") && !line.includes("⟨th⟩")) {
    for (let i = lines.length - 1; i >= 0 && lines[i].includes("｜"); i -= 1) if (lines[i].includes("⟨th⟩")) return `${lines[i]}\n${line}`;
  }
  return line;
}

// HTML の <main> を、段落・箇条書き・表の行ごとに改行した平文にする(contextAround 用)。見出しセルに ⟨th⟩ を付ける
export function amountTextFromHtml(html) {
  return (html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "")
    .replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<\/(p|li|h[1-6]|dt|dd|blockquote|figcaption|caption|tr|section|article)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<th\b[^>]*>/gi, " ⟨th⟩ ").replace(/<\/t[dh]>/gi, " ｜ ")
    .replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&[a-z#0-9]+;/g, " ")
    .replace(/<!-- -->/g, "");
}
