/* 訂正の記録。/quality の「訂正の記録」はここから描く。
   直したことは消さずに残す。以後、記事や道具を訂正したときは、Claude Code の報告と同時にこの配列へ1行足す
   (docs/about-quality-support-2026-09-07-instructions.md §4)。新しいものを上に。 */
export type Correction = {
  /* YYYY-MM-DD */
  date: string;
  /* 直したページの名前と path。複数ページなら代表の path に others: true(「ほか」を付けて描く) */
  page: string;
  path: string;
  others?: true;
  /* 何をどう直したか */
  what: string;
  /* 理由 */
  why: string;
};

export const CORRECTIONS: Correction[] = [
  {
    date: "2026-09-06",
    page: "申立書をつくる",
    path: "/dougu/moushitatesho",
    what: "発病日・初診日の「日」が、入力していないのに「1日」と印字されていた。年月日を入力でき、日が分からないときは空欄で印字するように直した",
    why: "年月しか入力できない作りだったため。9/6 より前にこの道具で印刷した方は、発病日・初診日の「日」を確認してください",
  },
  {
    date: "2026-09-06",
    page: "更新関連の記事・カード",
    path: "/columns/koushin-kakuninhodo",
    others: true,
    what: "「再認定304,456件のうち継続96.8%・支給停止1.0%」を「96.7%・1.1%」に",
    why: "304,456件は業務統計(全件)の数で、96.8/1.0 は認定状況調査(抽出1万件)の値。2つの資料を混ぜていた",
  },
  {
    date: "2026-09-06",
    page: "障害年金の金額",
    path: "/dougu/kingaku",
    what: "厚生年金の加入月数の説明「初診日の前月まで」を「障害認定日の属する月まで」に",
    why: "障害厚生年金の額は障害認定日の属する月までの被保険者期間で計算する(厚生年金保険法 第51条)。前々月は納付要件の話で、額の計算ではない",
  },
];
