// /dougu/kingaku の補足の計算(docs/kingaku-madoguchi-sasshin-2026-09-06-instructions.md A-2)。
// lib/kingaku.ts は触らず、その外側で使う小さな関数だけを置く。数字を直書きしない(月数の決まりを除く)。

/* 「年収から」: 厚生年金に入っていた頃の年収(ボーナス込み)÷12 を平均標準報酬額の目安にする。
   標準報酬月額・賞与に上限があるため目安(画面で明記)。 */
export const hyoujunFromNenshu = (nenshu: number | null): number | null =>
  nenshu === null || !Number.isFinite(nenshu) || nenshu <= 0 ? null : Math.floor(nenshu / 12);

/* 表示用: 月額・偶数月の振込は百円で丸めて「約」を付ける。 */
export const approx100 = (n: number): number => Math.round(n / 100) * 100;
