import assert from "node:assert/strict";
import { explainAmount } from "./lib/amounts-derive.mjs";
import { AMOUNTS_2026 } from "../data/amounts.ts";

const formula = "basicGrade2(847,300) × (1 − 0.004 × 60)(繰上げ減額)";
assert.equal(explainAmount("643,948円", AMOUNTS_2026, "60歳で繰上げ"), formula);
assert.equal(explainAmount("643,948円", AMOUNTS_2026, "60歳で繰り上げ"), formula);
assert.equal(explainAmount("643,948円", AMOUNTS_2026, "文脈なし"), null);
// 他の計算パターンと干渉しない単独の入力で、許可キーと月数・端数の境界を検査。
for (const key of ["basicGrade2", "basicGrade2Old"]) {
  const amounts = { [key]: "847,301" };
  for (let n = 1; n <= 60; n++) {
    const value = Math.floor(847301 * (1000 - 4 * n) / 1000);
    assert.equal(explainAmount(value, amounts, "繰上げ"), `${key}(847,301) × (1 − 0.004 × ${n})(繰上げ減額)`);
  }
  for (const n of [0, 61]) {
    assert.doesNotMatch(explainAmount(Math.floor(847301 * (1000 - 4 * n) / 1000), amounts, "繰上げ") ?? "", /繰上げ減額/);
  }
  assert.equal(explainAmount(Math.floor(847301 * 0.70), amounts, "繰上げ"), null, "0.5%×60か月は追加しない");
}
assert.equal(explainAmount(643948, { employeesGrade3Minimum: "847,300" }, "繰上げ"), null);
console.log("繰上げ減額: 2キー×1〜60か月、切り捨て、文脈ゲート、範囲外・他キー・0.5%除外 OK");
