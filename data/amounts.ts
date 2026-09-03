export const AMOUNTS_2026 = {
  basicGrade1: "1,059,125", basicGrade2: "847,300", childFirstSecond: "243,800", childThird: "81,300",
  spouseAddition: "243,800",             // 配偶者加給年金額(障害厚生年金1・2級のみ)
  employeesGrade3Minimum: "635,500", supportGrade1Monthly: "7,025", supportGrade2Monthly: "5,620",
  incomeHalfBeforeOctober: "3,761,000", incomeFullBeforeOctober: "4,794,000",
  incomeHalfFromOctober: "3,858,000", incomeFullFromOctober: "4,918,000",
  dependentDisabledIncomeLimit: "180", dependentGeneralIncomeLimit: "130",
  basicGrade1Old: "1,056,125",           // 昭和31年4月1日以前生まれの1級
  basicGrade2Old: "844,900",             // 同 2級
  employeesGrade3MinimumOld: "633,700",  // 同 3級最低保障
  disabilityAllowanceMinimum: "1,271,000", // 障害手当金の最低保障(3級最低保障×2)
} as const;

const values = Object.values(AMOUNTS_2026);
export function apply2026Amounts(text: string): string {
  const tokenized = Object.entries(AMOUNTS_2026).reduce(
    (result, [key, amount]) => result.replaceAll(`{{${key}}}`, amount),
    text,
  );
  return values.reduce((result, amount) => result.replaceAll(amount, amount), tokenized);
}

// 表示している年度。4月の改定でこの1行と上の表を差し替える。
export const FISCAL_YEAR = "令和8年度";

// 計算に使う数値。上の表(本文用の文字列)から導出するので、数字を二重に持たない。
const yen = (formatted: string): number => Number(formatted.replaceAll(",", ""));

// 報酬比例部分の乗率と300月みなし。年度改定ではなく法令で決まる値だが、
// 金額の一次情報をこのファイルに集めるため、ここに置く(docs/kingaku-tool-design-2026-09-02.md §4)。
export const KINGAKU_2026 = {
  fiscalYear: FISCAL_YEAR,
  basicGrade1: yen(AMOUNTS_2026.basicGrade1),
  basicGrade2: yen(AMOUNTS_2026.basicGrade2),
  childFirstSecond: yen(AMOUNTS_2026.childFirstSecond),
  childThird: yen(AMOUNTS_2026.childThird),
  spouseAddition: yen(AMOUNTS_2026.spouseAddition),
  employeesGrade3Minimum: yen(AMOUNTS_2026.employeesGrade3Minimum),
  supportGrade1Monthly: yen(AMOUNTS_2026.supportGrade1Monthly),
  supportGrade2Monthly: yen(AMOUNTS_2026.supportGrade2Monthly),
  rateOld: 7.125 / 1000,   // 平成15年3月以前
  rateNew: 5.481 / 1000,   // 平成15年4月以降
  minashiMonths: 300,      // 300月みなし
  grade1Rate: 1.25,        // 1級の報酬比例部分
} as const;
