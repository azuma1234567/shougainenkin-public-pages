// 計算例の仮定値と、統計値を含む概算。制度の額ではなく、記事が「〜なら」と置いた入力や、
// 統計値(工賃実績など)を足した概算なので、data/amounts.ts からは導けない。
// ここに挙げたものだけを説明済みとして扱い、一覧には必ず「仮定値」と明示して出す(黙って消さない)。
// キーは金額(円)、値は「slug: 何の額か」。verify-columns.mjs の検査6と prelaunch-check.mjs の A-8 が使う。
export const ASSUMED_EXAMPLE_AMOUNTS = {
  300000: "shoubyou-teatekin: 標準報酬月額の平均(「30万円なら」)",
  600000: "shoubyou-teatekin: 報酬比例部分(「報酬比例60万円」)",
  1800000: "shoubyou-teatekin: 年金の合計(「年180万円なら」)",
  1447300: "shoubyou-teatekin: 600,000 + basicGrade2(847,300)",
  // 2026-09-13 ユーザー承認。年金額が改定されたら、この概算も見直す。
  162000: "kougin-nenkin-tedori: A型の平均賃金 91,451(令和6年度工賃実績) + basicGrade2 の月額 70,608 ≒ 162,059(「約162,000円」)",
};
