/* 都道府県のスラッグと名前の対応(docs/claude-code-sharoushi-list-2026-09-16-instructions.md §1)。
   /sharoushi/[pref] の URL に使う。スラッグは data/madoguchi/offices.json の pref と同じローマ字で、
   同じであることを tests/sharoushi.test.mjs が固定する。並びは data/sharoushi/options.ts の PREFECTURE_REGIONS 順。 */
export type Prefecture = { pref: string; prefName: string };

export const PREFECTURES_47: readonly Prefecture[] = [
  { pref: "hokkaido", prefName: "北海道" },
  { pref: "aomori", prefName: "青森県" },
  { pref: "iwate", prefName: "岩手県" },
  { pref: "miyagi", prefName: "宮城県" },
  { pref: "akita", prefName: "秋田県" },
  { pref: "yamagata", prefName: "山形県" },
  { pref: "fukushima", prefName: "福島県" },
  { pref: "ibaraki", prefName: "茨城県" },
  { pref: "tochigi", prefName: "栃木県" },
  { pref: "gunma", prefName: "群馬県" },
  { pref: "saitama", prefName: "埼玉県" },
  { pref: "chiba", prefName: "千葉県" },
  { pref: "tokyo", prefName: "東京都" },
  { pref: "kanagawa", prefName: "神奈川県" },
  { pref: "nigata", prefName: "新潟県" },
  { pref: "toyama", prefName: "富山県" },
  { pref: "ishikawa", prefName: "石川県" },
  { pref: "fukui", prefName: "福井県" },
  { pref: "yamanashi", prefName: "山梨県" },
  { pref: "nagano", prefName: "長野県" },
  { pref: "gifu", prefName: "岐阜県" },
  { pref: "shizuoka", prefName: "静岡県" },
  { pref: "aichi", prefName: "愛知県" },
  { pref: "mie", prefName: "三重県" },
  { pref: "shiga", prefName: "滋賀県" },
  { pref: "kyoto", prefName: "京都府" },
  { pref: "osaka", prefName: "大阪府" },
  { pref: "hyogo", prefName: "兵庫県" },
  { pref: "nara", prefName: "奈良県" },
  { pref: "wakayama", prefName: "和歌山県" },
  { pref: "tottori", prefName: "鳥取県" },
  { pref: "shimane", prefName: "島根県" },
  { pref: "okayama", prefName: "岡山県" },
  { pref: "hiroshima", prefName: "広島県" },
  { pref: "yamaguchi", prefName: "山口県" },
  { pref: "tokushima", prefName: "徳島県" },
  { pref: "kagawa", prefName: "香川県" },
  { pref: "ehime", prefName: "愛媛県" },
  { pref: "kochi", prefName: "高知県" },
  { pref: "fukuoka", prefName: "福岡県" },
  { pref: "saga", prefName: "佐賀県" },
  { pref: "nagasaki", prefName: "長崎県" },
  { pref: "kumamoto", prefName: "熊本県" },
  { pref: "oita", prefName: "大分県" },
  { pref: "miyazaki", prefName: "宮崎県" },
  { pref: "kagoshima", prefName: "鹿児島県" },
  { pref: "okinawa", prefName: "沖縄県" },
];

const BY_SLUG = new Map(PREFECTURES_47.map((p) => [p.pref, p]));
const BY_NAME = new Map(PREFECTURES_47.map((p) => [p.prefName, p]));

export const prefectureBySlug = (slug: string): Prefecture | undefined => BY_SLUG.get(slug);
export const prefectureByName = (name: string): Prefecture | undefined => BY_NAME.get(name);
/* 都道府県名 → スラッグ。無ければ空文字(呼び出し側でリンクを出さない)。 */
export const prefSlugOf = (name: string): string => BY_NAME.get(name)?.pref ?? "";
