/* 社労士事務所の掲載で使う選択肢のラベル(docs/claude-code-ads-sharoushi-2026-09-16-instructions.md §6)。
   /ads/sharoushi の申込みフォームと、将来の /sharoushi 一覧の絞り込みは、必ずこの配列を使う
   (フォームと一覧でラベルが食い違うと、事務所が申告した内容と一覧の表示がずれる)。 */

/* 対応できる相談の9分類。読者が困りごとから探す入口(/nayami)と同じ分け方。
   label はフォームと一覧に出す短い名前、note は案内ページの箇条書きに添える補足。 */
export const SHAROUSHI_TOPICS = [
  { label: "申請の前の相談", note: "対象になるか、何から始めるか" },
  { label: "初診日・受診歴の確認" },
  { label: "診断書・申立書の準備" },
  { label: "働きながらの申請" },
  { label: "家族からの相談" },
  { label: "精神の障害・発達障害" },
  { label: "身体の障害・内部の病気" },
  { label: "不支給になったあと", note: "審査請求・再請求" },
  { label: "更新・支給停止のあと" },
] as const;

/* 得意な障害の種類(4種別)。 */
export const SHAROUSHI_KINDS = ["精神", "知的・発達", "内部", "外部(肢体・視覚・聴覚)"] as const;

/* 相談のしかた。 */
export const SHAROUSHI_WAYS = ["来所", "電話", "オンライン", "出張"] as const;

/* 相談の条件(任意)。 */
export const SHAROUSHI_FLAGS = ["初回相談無料", "土日祝", "19時以降", "当日"] as const;

/* 料金の型の選択肢(§3-1 の 11〜14)。 */
export const SHAROUSHI_FEE_START = ["なし", "あり", "要確認"] as const;
export const SHAROUSHI_FEE_SUCCESS = ["年金額の○か月分", "遡及分の○%", "定額", "要確認"] as const;
export const SHAROUSHI_FEE_FAIL = ["不要", "実費のみ", "あり", "要確認"] as const;
export const SHAROUSHI_FEE_APPEAL = ["含む", "別料金", "対応しない", "要確認"] as const;

/* 原稿の作り方(§3-1 の 17)。 */
export const SHAROUSHI_DRAFT_OPTIONS = [
  "運営者に下書きを作ってほしい(事務所サイトを参照)",
  "自分で書いた文を送る",
] as const;

/* どこで知ったか(§3-1 の 18)。 */
export const SHAROUSHI_SOURCES = ["検索", "X", "他の社労士から", "営業メール", "その他"] as const;

/* 対応地域の「全国」の選択肢。都道府県のチェックとは別に先頭に置く。 */
export const SHAROUSHI_NATIONWIDE = "全国(オンライン・郵送)";

/* 47都道府県を地方ごとに分けたもの。フォームの <details> の単位。 */
export const PREFECTURE_REGIONS = [
  { region: "北海道・東北", prefectures: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { region: "関東", prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"] },
  { region: "北陸・甲信越", prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県"] },
  { region: "東海", prefectures: ["岐阜県", "静岡県", "愛知県", "三重県"] },
  { region: "関西", prefectures: ["滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  { region: "中国", prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"] },
  { region: "四国", prefectures: ["徳島県", "香川県", "愛媛県", "高知県"] },
  { region: "九州・沖縄", prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
] as const;

export const PREFECTURES: readonly string[] = PREFECTURE_REGIONS.flatMap((r) => r.prefectures);
