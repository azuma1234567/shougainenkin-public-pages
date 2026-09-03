// 障害年金の金額計算。docs/kingaku-tool-design-2026-09-02.md §4 と
// docs/site-mock-2026-09-02-tools/Kingaku.html のロジックをそのまま移した。
// 受給できるかは判定しない(「2級ならこの額」だけを出す)。
// 金額は data/amounts.ts の KINGAKU_2026 経由。ここに数字を直書きしないこと。
import { KINGAKU_2026 as A } from "@/data/amounts";

export type Grade = 1 | 2 | 3;
export type Seido = "kokumin" | "kousei";

export type KingakuInput = {
  grade: Grade;
  seido: Seido | null;
  kids: number;
  spouse: boolean;
  hyoujun: number | null;    // 平均標準報酬額(平成15年4月以降)
  tsuki: number | null;      // 厚生年金の加入月数(総月数)
  kyuTsuki: number | null;   // うち平成15年3月以前の月数
  kyuHyoujun: number | null; // その頃の平均標準報酬月額
};

export type KingakuRow = { label: string; amount: number | null; why: string };

export type KingakuResult = {
  rows: KingakuRow[];
  flags: string[];
  total: number;
  known: boolean;      // 合計を出せるか(3級で報酬比例が未入力なら false)
  minashi: boolean;    // 300月みなしが効いたか
  saiteiHoshou: boolean; // 3級の最低保障が適用されたか
};

export const emptyInput = (): KingakuInput => ({
  grade: 2, seido: null, kids: 0, spouse: false,
  hyoujun: null, tsuki: null, kyuTsuki: null, kyuHyoujun: null,
});

// §4-2 報酬比例部分。初診日が厚生年金のときだけ。未入力なら null(0円ではない)。
export function houshuHirei(s: KingakuInput): { value: number | null; minashi: boolean } {
  if (s.seido !== "kousei") return { value: null, minashi: false };
  const tsuki = Number(s.tsuki || 0), kyu = Number(s.kyuTsuki || 0);
  const shin = Math.max(0, tsuki - kyu);
  if (!tsuki || (!s.hyoujun && !s.kyuHyoujun)) return { value: null, minashi: false };
  const b = Number(s.hyoujun || 0) * A.rateNew * shin;
  const a = Number(s.kyuHyoujun || s.hyoujun || 0) * A.rateOld * kyu;
  let value = a + b, minashi = false;
  if (tsuki < A.minashiMonths) { value = (value * A.minashiMonths) / tsuki; minashi = true; } // ★300月みなし
  if (s.grade === 1) value = value * A.grade1Rate;
  return { value, minashi };
}

export function calcKingaku(s: KingakuInput): KingakuResult {
  const rows: KingakuRow[] = [], flags: string[] = [];
  const kousei = s.seido === "kousei";

  // §4-1 障害基礎年金
  let kiso = 0, kisoWhy = "";
  if (s.grade === 1) kiso = A.basicGrade1;
  else if (s.grade === 2) kiso = A.basicGrade2;
  else kisoWhy = "障害基礎年金に3級はありません";
  rows.push({ label: "障害基礎年金" + (s.grade < 3 ? ` ${s.grade}級` : ""), amount: kiso, why: kisoWhy });

  // §4-1 子の加算
  const kids = Number(s.kids || 0);
  let ko = 0, koWhy = "";
  if (s.grade < 3) ko = A.childFirstSecond * Math.min(kids, 2) + A.childThird * Math.max(kids - 2, 0);
  else koWhy = "3級には子の加算がありません";
  if (s.grade < 3 && kids === 0) koWhy = "対象の子がいないため";
  rows.push({ label: "子の加算" + (kids ? `(${kids}人)` : ""), amount: ko, why: koWhy });

  // §4-2 報酬比例部分
  const hh = houshuHirei(s);
  rows.push({
    label: "報酬比例部分",
    amount: hh.value,
    why: s.seido === null ? "初診日に入っていた制度を選ぶと計算します"
      : !kousei ? "初診日が国民年金のため、報酬比例部分はありません"
      : hh.value === null ? "平均標準報酬額と加入月数を入れると計算します" : "",
  });
  if (hh.minashi) flags.push("加入月数が300月未満のため、300月として計算しています");
  if (s.grade === 1 && hh.value !== null) flags.push(`1級のため、報酬比例部分を${A.grade1Rate}倍しています`);

  // §4-3 配偶者加給年金額
  let hai = 0, haiWhy = "";
  if (kousei && s.grade <= 2 && s.spouse) hai = A.spouseAddition;
  else if (s.seido === null) haiWhy = "初診日に入っていた制度を選ぶと分かります";
  else if (!kousei) haiWhy = "障害基礎年金に配偶者の加算はありません";
  else if (s.grade === 3) haiWhy = "3級には配偶者の加算がありません";
  else haiWhy = "対象の配偶者がいないため";
  rows.push({ label: "配偶者加給年金額", amount: hai, why: haiWhy });

  // §4-5 合計
  let total = kiso + ko + (hh.value || 0) + hai;

  // §4-4 3級の最低保障
  let saiteiHoshou = false;
  if (kousei && s.grade === 3 && hh.value !== null && total < A.employeesGrade3Minimum) {
    total = A.employeesGrade3Minimum;
    saiteiHoshou = true;
    flags.push(`3級の最低保障額(${num(A.employeesGrade3Minimum)}円)が適用されています`);
  }

  const known = s.grade < 3 || hh.value !== null;
  return { rows, flags, total, known, minashi: hh.minashi, saiteiHoshou };
}

// §4-6 年金生活者支援給付金。合計には含めない。3級は対象外。
export function kyuufukinMonthly(grade: Grade): number | null {
  if (grade === 3) return null;
  return grade === 1 ? A.supportGrade1Monthly : A.supportGrade2Monthly;
}

// §4-7 端数は最後にまとめて四捨五入する
export const yearly = (total: number) => Math.round(total);
export const monthly = (total: number) => Math.round(total / 12);
export const bimonthly = (total: number) => Math.round(total / 6);

export function num(n: number | null | undefined): string {
  return (n || 0).toLocaleString("ja-JP");
}
