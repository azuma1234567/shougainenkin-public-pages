export const AMOUNTS_2026 = {
  basicGrade1: "1,059,125", basicGrade2: "847,300", childFirstSecond: "243,800", childThird: "81,300",
  employeesGrade3Minimum: "635,500", supportGrade1Monthly: "7,025", supportGrade2Monthly: "5,620",
  incomeHalfBeforeOctober: "3,761,000", incomeFullBeforeOctober: "4,794,000",
  incomeHalfFromOctober: "3,858,000", incomeFullFromOctober: "4,918,000",
  dependentDisabledIncomeLimit: "180", dependentGeneralIncomeLimit: "130",
} as const;

const values = Object.values(AMOUNTS_2026);
export function apply2026Amounts(text: string): string {
  const tokenized = Object.entries(AMOUNTS_2026).reduce(
    (result, [key, amount]) => result.replaceAll(`{{${key}}}`, amount),
    text,
  );
  return values.reduce((result, amount) => result.replaceAll(amount, amount), tokenized);
}
