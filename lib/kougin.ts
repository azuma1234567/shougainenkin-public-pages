// /dougu/kougin「工賃・賃金と年金の計算」。docs/dougu-2hon-2026-09-06-instructions.md §A-3。
// 判定はしない: 国が公表している線に、入力した数字を当てた結果だけを出す。
// 数字は data/amounts.ts の KOUGIN_2026 経由。ここに数字を直書きしないこと。
import { KINGAKU_2026, KOUGIN_2026 as K } from "@/data/amounts";

export type Shoshin = "before20" | "after20" | "unknown";
export type Work = "kougin" | "kyuyo" | "jiei";
export type Pension = "kiso1" | "kiso2" | "kousei";

export type KouginInput = {
  shoshin: Shoshin | null;
  work: Work | null;
  /* 年収(給与・工賃)または所得(自営)。円 */
  income: number | null;
  /* B型の補助入力: 月の工賃(円)。入れると income = ×12 */
  monthlyKougin: number | null;
  /* 扶養親族の人数(合計)、うち老人(70歳以上の同一生計配偶者・老人扶養親族)、うち特定等(特定扶養親族・19歳未満の控除対象扶養親族) */
  dependents: number;
  elderly: number;
  specified: number;
  /* 任意: 社会保険料の年額(円) */
  shakaiHoken: number | null;
  /* 結果2のため: 受けている(見込みの)年金 */
  pension: Pension | null;
  kouseiAmount: number | null;
};

export type Verdict = "full" | "half" | "stop";

export type KouginResult = {
  /* 所得制限の対象か */
  applies: "yes" | "no" | "unknown";
  /* 所得の計算 */
  incomeAmount: number | null;
  salaryDeduction: number;
  shotoku: number | null;
  shakaiHoken: number;
  judged: number | null;
  /* 線(扶養親族の加算込み) */
  halfBefore: number;
  fullBefore: number;
  halfAfter: number;
  fullAfter: number;
  verdictBefore: Verdict | null;
  verdictAfter: Verdict | null;
  /* 半額の線までの余裕(所得ベース)と、年収に戻したおよその額 */
  marginBefore: number | null;
  marginIncomeBefore: number | null;
  marginAfter: number | null;
  marginIncomeAfter: number | null;
  /* 健康保険の扶養の線 */
  pensionAmount: number | null;
  fuyouTotal: number | null;
  overDisabledLimit: boolean | null;
  overGeneralLimit: boolean | null;
};

export const emptyInput = (): KouginInput => ({
  shoshin: null, work: null, income: null, monthlyKougin: null,
  dependents: 0, elderly: 0, specified: 0, shakaiHoken: null,
  pension: null, kouseiAmount: null,
});

export function normalizeKougin(value: unknown): KouginInput {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const n = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) && x >= 0 ? Math.floor(x) : null);
  const c = (x: unknown): number => n(x) ?? 0;
  const pick = <T extends string>(x: unknown, list: readonly T[]): T | null => (list as readonly string[]).includes(String(x)) ? (x as T) : null;
  return {
    shoshin: pick(v.shoshin, ["before20", "after20", "unknown"] as const),
    work: pick(v.work, ["kougin", "kyuyo", "jiei"] as const),
    income: n(v.income), monthlyKougin: n(v.monthlyKougin),
    dependents: c(v.dependents), elderly: c(v.elderly), specified: c(v.specified),
    shakaiHoken: n(v.shakaiHoken),
    pension: pick(v.pension, ["kiso1", "kiso2", "kousei"] as const),
    kouseiAmount: n(v.kouseiAmount),
  };
}

/* 給与所得控除(国税庁 No.1410 の表)。 */
export function salaryDeduction(income: number): number {
  for (const row of K.salaryDeduction) {
    if (income <= row.upTo) return Math.floor(income * row.rate + row.add);
  }
  return K.salaryDeduction[K.salaryDeduction.length - 1].add;
}

/* 所得 T になる年収(給与)を、控除表を逆に当てて求める。「およそ」の額。 */
export function salaryFromIncome(target: number): number {
  let lower = 0;
  for (const row of K.salaryDeduction) {
    const income = row.rate >= 1 ? Number.POSITIVE_INFINITY : (target + row.add) / (1 - row.rate);
    if (income > lower && income <= row.upTo) return Math.round(income);
    lower = row.upTo;
  }
  return Math.round(target + K.salaryDeduction[K.salaryDeduction.length - 1].add);
}

export function verdict(judged: number, half: number, full: number): Verdict {
  if (judged <= half) return "full";
  if (judged <= full) return "half";
  return "stop";
}

export function pensionAmount(s: KouginInput): number | null {
  if (s.pension === "kiso1") return KINGAKU_2026.basicGrade1;
  if (s.pension === "kiso2") return KINGAKU_2026.basicGrade2;
  if (s.pension === "kousei") return s.kouseiAmount;
  return null;
}

export function calcKougin(s: KouginInput): KouginResult {
  const applies: KouginResult["applies"] = s.shoshin === "after20" ? "no" : s.shoshin === "before20" ? "yes" : "unknown";
  const incomeAmount = s.work === "kougin" && s.monthlyKougin !== null && s.income === null ? s.monthlyKougin * 12 : s.income;

  /* 所得 */
  let shotoku: number | null = null;
  let deduction = 0;
  if (incomeAmount !== null && s.work !== null) {
    if (s.work === "kyuyo") { deduction = salaryDeduction(incomeAmount); shotoku = Math.max(0, incomeAmount - deduction); }
    else shotoku = incomeAmount; // 工賃は控除なし(厳しめ)、自営は所得を直接入力
  }
  const shakaiHoken = s.shakaiHoken ?? 0;
  const judged = shotoku === null ? null : Math.max(0, shotoku - shakaiHoken);

  /* 線。人数の内訳が合計を超えないよう丸める */
  const total = Math.max(0, s.dependents);
  const elderly = Math.min(Math.max(0, s.elderly), total);
  const specified = Math.min(Math.max(0, s.specified), total - elderly);
  const general = total - elderly - specified;
  const halfAdd = general * K.dependentAddition + elderly * K.dependentElderlyAddition + specified * K.dependentSpecifiedAddition;
  const fullAdd = total * K.fullLineDependentAddition;
  const halfBefore = K.halfBeforeOctober + halfAdd, fullBefore = K.fullBeforeOctober + fullAdd;
  const halfAfter = K.halfFromOctober + halfAdd, fullAfter = K.fullFromOctober + fullAdd;

  const verdictBefore = judged === null ? null : verdict(judged, halfBefore, fullBefore);
  const verdictAfter = judged === null ? null : verdict(judged, halfAfter, fullAfter);
  const marginBefore = judged === null ? null : halfBefore - judged;
  const marginAfter = judged === null ? null : halfAfter - judged;
  const toIncome = (margin: number | null, half: number): number | null => {
    if (margin === null || judged === null || incomeAmount === null) return null;
    if (s.work === "kyuyo") return salaryFromIncome(half + shakaiHoken) - incomeAmount;
    return margin; // 工賃・自営は 所得 = 年収 として扱う
  };

  /* 健康保険の扶養の線 */
  const pension = pensionAmount(s);
  const fuyouTotal = pension !== null && incomeAmount !== null ? pension + incomeAmount : null;

  return {
    applies, incomeAmount, salaryDeduction: deduction, shotoku, shakaiHoken, judged,
    halfBefore, fullBefore, halfAfter, fullAfter, verdictBefore, verdictAfter,
    marginBefore, marginIncomeBefore: toIncome(marginBefore, halfBefore),
    marginAfter, marginIncomeAfter: toIncome(marginAfter, halfAfter),
    pensionAmount: pension, fuyouTotal,
    overDisabledLimit: fuyouTotal === null ? null : fuyouTotal >= K.dependentLimitDisabled,
    overGeneralLimit: fuyouTotal === null ? null : fuyouTotal >= K.dependentLimitGeneral,
  };
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  full: "全額支給の範囲です",
  half: "2分の1停止の範囲に入ります",
  stop: "全額停止の範囲に入ります",
};

export const num = (n: number): string => Math.round(n).toLocaleString("ja-JP");
