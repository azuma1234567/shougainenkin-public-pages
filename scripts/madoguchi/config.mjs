/* /dougu/madoguchi の窓口データ取得の設定。
   docs/madoguchi-tool-design-2026-09-02.md §5 / docs/madoguchi-research-2026-09-03.md §6 */
export const CHECKED_ON = process.env.MADOGUCHI_DATE ?? "2026-09-03";
export const BASE = "https://www.nenkin.go.jp";
export const ENTRY = `${BASE}/section/soudan/index.html`;
/* サイト名と連絡先を入れる(研究文書 §6)。 */
export const USER_AGENT = "shougainenkin-note.net (window data update; contact: taisuke03417@gmail.com)";
/* 取得間隔。robots.txt に Crawl-delay の指定は無いが、1秒以上あける。 */
export const DELAY_MS = Number(process.env.MADOGUCHI_DELAY ?? 1200);

export const SOURCE_DIR = `docs/verification/madoguchi-source-${CHECKED_ON}`;
export const RESULT_DIR = `docs/verification/madoguchi-${CHECKED_ON}`;
export const DATA_DIR = "data/madoguchi";

/* slug は47個。新潟は nigata(niigata ではない)。 */
export const PREFS = [
  ["hokkaido", "北海道"], ["aomori", "青森県"], ["iwate", "岩手県"], ["miyagi", "宮城県"],
  ["akita", "秋田県"], ["yamagata", "山形県"], ["fukushima", "福島県"], ["ibaraki", "茨城県"],
  ["tochigi", "栃木県"], ["gunma", "群馬県"], ["saitama", "埼玉県"], ["nigata", "新潟県"],
  ["nagano", "長野県"], ["chiba", "千葉県"], ["tokyo", "東京都"], ["kanagawa", "神奈川県"],
  ["yamanashi", "山梨県"], ["toyama", "富山県"], ["ishikawa", "石川県"], ["gifu", "岐阜県"],
  ["shizuoka", "静岡県"], ["aichi", "愛知県"], ["mie", "三重県"], ["fukui", "福井県"],
  ["shiga", "滋賀県"], ["kyoto", "京都府"], ["osaka", "大阪府"], ["hyogo", "兵庫県"],
  ["nara", "奈良県"], ["wakayama", "和歌山県"], ["tottori", "鳥取県"], ["shimane", "島根県"],
  ["okayama", "岡山県"], ["hiroshima", "広島県"], ["yamaguchi", "山口県"], ["tokushima", "徳島県"],
  ["kagawa", "香川県"], ["ehime", "愛媛県"], ["kochi", "高知県"], ["fukuoka", "福岡県"],
  ["saga", "佐賀県"], ["nagasaki", "長崎県"], ["kumamoto", "熊本県"], ["oita", "大分県"],
  ["miyazaki", "宮崎県"], ["kagoshima", "鹿児島県"], ["okinawa", "沖縄県"],
];
export const PREF_NAME = Object.fromEntries(PREFS);

/* 全事務所で同じ番号。1件ごとに保存しない(研究文書 §3-1)。 */
export const COMMON_TEL = {
  nenkinDial: "0570-05-1165",
  yoyaku: "0570-05-4890",
  kanyuuKokumin: "0570-003-004",
  kanyuuKousei: "0570-007-123",
  teikibin: "0570-058-555",
};
export const COMMON_TEL_DIGITS = new Set(Object.values(COMMON_TEL).map((t) => t.replaceAll("-", "")));
