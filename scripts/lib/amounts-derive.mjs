// 出力に出てくる金額が data/amounts.ts の値から導出できるかを検算する。
// docs/codex-prelaunch-fix-2026-09-02-instructions.md §1-2 の順で「説明」を探す:
//   1. amounts.ts の値そのもの
//   2. amounts.ts の値 2〜4個の和(同じ値を繰り返してよい。子の加算など)
//   3. 上記の ×1.25(1級)
//   4. 上記の ÷12(月額)、または ÷12×2(2か月分)。丸め誤差は ±100円 まで許す
//   5. 前年度額として明示されているもの(同じ段落に「前年度」「令和7年度」がある場合のみ)
//   6. 繰上げ・繰り上げの段落のみ、basicGrade2/basicGrade2Old × (1 − 0.004 × 1〜60か月)、円未満切り捨て
//   7. 「超」の整数表現(amounts.ts の値 +1 円)
// 説明できたときは式の文字列、できなければ null を返す。

const toNumber = (text) => Number(String(text).replace(/[,円]/g, ""));
const fmt = (n) => Math.round(n).toLocaleString("ja-JP");

// amounts.ts の値を3種に分ける:
//   annual   … 年額の給付額。和・×1.25・÷12 の材料にしてよい(月額の給付金は ×12 で年額化して加える)
//   monthly  … 月額の給付金。そのままの値としてだけ許す
//   threshold… 所得基準。そのままの値と「超(+1)」だけ許す(和の材料にはしない)
export function amountEntries(AMOUNTS) {
  return Object.entries(AMOUNTS).filter(([, value]) => /,/.test(value)).map(([key, value]) => ({ key, value: toNumber(value) }));
}
function classify(entries) {
  const annual = [], monthly = [], threshold = [];
  for (const e of entries) {
    if (/^income/.test(e.key)) threshold.push(e);
    else if (/Monthly$/.test(e.key)) { monthly.push(e); annual.push({ key: `${e.key}×12`, value: e.value * 12 }); }
    else annual.push(e);
  }
  return { annual, monthly, threshold };
}

function buildCandidates(entries) {
  const { annual, monthly, threshold } = classify(entries);
  const label = (e) => `${e.key}(${fmt(e.value)})`;
  const exact = [...annual, ...monthly, ...threshold].map((e) => ({ value: e.value, expr: label(e), terms: 1 }));
  // 年額の和(2〜4個、重複可)。項数の少ない式を優先する
  const sums = [];
  const n = annual.length;
  const rec = (start, sum, parts) => {
    if (parts.length >= 2) sums.push({ value: sum, expr: parts.join(" + "), terms: parts.length });
    if (parts.length === 4) return;
    for (let i = start; i < n; i += 1) rec(i, sum + annual[i].value, [...parts, label(annual[i])]);
  };
  for (let i = 0; i < n; i += 1) rec(i, annual[i].value, [label(annual[i])]);
  sums.sort((a, b) => a.terms - b.terms);
  const annualExact = annual.map((e) => ({ value: e.value, expr: label(e), terms: 1 }));
  const grade1 = [...annualExact, ...sums].map((c) => ({ value: c.value * 1.25, expr: `(${c.expr}) × 1.25`, terms: c.terms + 1 }));
  const yearly = [...annualExact, ...sums, ...grade1];
  const monthlyOf = yearly.flatMap((c) => [
    { value: c.value / 12, expr: `(${c.expr}) ÷ 12`, terms: c.terms + 1, tolerance: 100 },
    { value: (c.value / 12) * 2, expr: `(${c.expr}) ÷ 12 × 2`, terms: c.terms + 2, tolerance: 100 },
  ]);
  return { exact, sums, grade1, monthlyOf };
}

let cache = null;
function candidates(AMOUNTS) {
  if (!cache || cache.source !== AMOUNTS) cache = { source: AMOUNTS, list: buildCandidates(amountEntries(AMOUNTS)) };
  return cache.list;
}

/**
 * @param {string|number} raw   例: "1,334,900円" / 1334900
 * @param {Record<string,string>} AMOUNTS  data/amounts.ts の AMOUNTS_2026
 * @param {string} [context]  金額が出てくる段落のテキスト(前年度・超 の判定に使う)
 * @returns {string|null} 説明の式。説明できなければ null
 */
export function explainAmount(raw, AMOUNTS, context = "") {
  const value = toNumber(raw);
  const { exact, sums, grade1, monthlyOf } = candidates(AMOUNTS);
  const hit = (list) => list.find((c) => Math.round(c.value) === value);
  const found = hit(exact) ?? hit(sums) ?? hit(grade1);
  if (found) return found.expr;
  const near = monthlyOf.filter((c) => Math.abs(c.value - value) <= c.tolerance).sort((a, b) => Math.abs(a.value - value) - Math.abs(b.value - value) || a.terms - b.terms)[0];
  if (near) return `${near.expr} ≒ ${fmt(value)}`;
  if (/前年度|令和7年度/.test(context)) return "前年度額(本文に明示)";
  if (/繰上げ|繰り上げ/.test(context)) {
    for (const entry of amountEntries(AMOUNTS).filter(e => ["basicGrade2", "basicGrade2Old"].includes(e.key))) {
      for (let n = 1; n <= 60; n++) {
        // 整数比で計算し、浮動小数点の誤差による1円の切り捨て過ぎを防ぐ。
        if (Math.floor(entry.value * (1000 - 4 * n) / 1000) === value) {
          return `${entry.key}(${fmt(entry.value)}) × (1 − 0.004 × ${n})(繰上げ減額)`;
        }
      }
    }
  }
  const plusOne = amountEntries(AMOUNTS).find((e) => e.value + 1 === value);
  if (plusOne) return `${plusOne.key}(${fmt(plusOne.value)}) + 1(「超」の整数表現)`;
  return null;
}

// テキスト中の「N,NNN円」形式の金額をすべて抜き出す(10万円以上だけを対象にしたいときは min を渡す)
export function findAmounts(text, min = 0) {
  return [...text.matchAll(/\d{1,3}(?:,\d{3}){1,2}円/g)].map((m) => ({ text: m[0], value: toNumber(m[0]), index: m.index })).filter((a) => a.value >= min);
}

// 段落(前後の改行まで)を取り出す。前年度・超 の文脈判定用
export function paragraphAround(text, index) {
  const start = text.lastIndexOf("\n", index) + 1;
  const end = text.indexOf("\n", index);
  return text.slice(start, end === -1 ? text.length : end);
}
