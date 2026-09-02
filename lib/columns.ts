import type { Metadata } from "next";
import {
  CLUSTERS,
  clusterPillarSlug,
  getCluster,
  type Cluster,
  type ClusterId,
} from "@/lib/clusters";
import { AUTHOR_NAME, SITE_NAME, SITE_URL } from "@/lib/constants";
import { COLUMN_HUB_ASSIGNMENTS, type HubRole } from "@/lib/hubs";

// コラム記事のメタデータ。一覧・sitemap・JSON-LDで共通利用する。
// slugは計測用キャンペーンリンクのctにも使うため変更しないこと。

// 表示軸は、トップの8ステップ(申請の旅の地図)と1:1で対応させる。
// 別の分類軸を増やすと、読者に地図の読み替えを強いることになる。
export type ColumnCategory =
  | "申請の前に"
  | "初診日"
  | "納付要件"
  | "相談・進め方"
  | "必要書類・提出"
  | "診断書 — 主治医に伝える"
  | "申立書"
  | "結果を待つ・不支給のとき"
  | "受給が始まってから";

// 同一ページ内のアンカー用のid(日本語をURLのフラグメントに出さないため)。
// idは表示名を変えても据え置く。既存の内部リンク・外部からの参照を壊さないため。
export const CATEGORY_ANCHORS: Record<ColumnCategory, string> = {
  申請の前に: "columns-cat-seido",
  初診日: "columns-cat-shoshinbi",
  納付要件: "columns-cat-nofu",
  "相談・進め方": "columns-cat-soudan",
  "必要書類・提出": "columns-cat-shorui",
  "診断書 — 主治医に伝える": "columns-cat-shindansho",
  申立書: "columns-cat-moushitatesho",
  "結果を待つ・不支給のとき": "columns-cat-shinsa",
  受給が始まってから: "columns-cat-jukyugo",
};

// コラム一覧で見出しを出す順序。申請の旅の順番そのもの。
export const CATEGORY_ORDER: ColumnCategory[] = [
  "申請の前に",
  "初診日",
  "納付要件",
  "相談・進め方",
  "必要書類・提出",
  "診断書 — 主治医に伝える",
  "申立書",
  "結果を待つ・不支給のとき",
  "受給が始まってから",
];

// カテゴリ見出しの下に出す1行説明。トップの8ステップとの対応を明記して、
// サイトとアプリが同じ地図を見せている状態を保つ。
export const CATEGORY_LEADS: Record<ColumnCategory, string> = {
  申請の前に:
    "対象になるのか、いくらもらえるのか。申請を考えはじめた人が最初に読むところ。",
  初診日: "ステップ1|最初に受診した日を確認し、証明する。",
  納付要件: "ステップ2|保険料の納付状況を確認する。",
  "相談・進め方": "ステップ3|年金事務所への相談と、無理のない進め方。",
  "必要書類・提出": "ステップ4・7|書類をそろえて、提出する。",
  "診断書 — 主治医に伝える":
    "ステップ5|ふだんの生活の実態を、主治医にありのままに伝える。",
  申立書: "ステップ6|病歴・就労状況等申立書を作る。",
  "結果を待つ・不支給のとき":
    "ステップ8|審査の見られ方、結果が届くまで、不支給だったときの道。",
  受給が始まってから: "更新・支給停止・額改定。受給してからの手続き。",
};

// 「途中から来た人」のためのショートカット。段階(カテゴリ)でも
// テーマ(クラスタ)でもなく、読者自身の言葉から記事1本へ直接つなぐ。
// コラム一覧とトップで同じデータを使う。8本より増やさないこと
// (増やすとただの一覧になり、ショートカットでなくなる)。
export const WORRY_SHORTCUTS: { label: string; slug: string }[] = [
  {
    label: "初診日がわからない・昔の病院がもうない",
    slug: "shoshinbi-wakaranai",
  },
  {
    label: "診断書が実態より軽く書かれた",
    slug: "shindansho-jittai-chigau",
  },
  {
    label: "診断書を書いてもらえない",
    slug: "shindansho-kaitekurenai",
  },
  {
    label: "働きながらの申請が不安",
    slug: "hatarakinagara",
  },
  {
    label: "一人暮らしだと不利になる?",
    slug: "hitorigurashi-furi",
  },
  {
    label: "不支給になった・年金が止まった",
    slug: "fushikyuu-shinsa-seikyu",
  },
  {
    label: "この病名でも対象になる?",
    slug: "taishou-shoubyou-kyoukai",
  },
  {
    label: "申請がしんどくて、進まない",
    slug: "shinsei-shindoi",
  },
];

export type Column = {
  slug: string;
  title: string;
  // 検索結果用の短いtitle(全角32文字前後)。未指定ならtitleを使う。
  // h1・一覧・パンくずの表示はtitleのまま変えない。
  metaTitle?: string;
  description: string;
  datePublished: string; // YYYY-MM-DD
  dateModified: string; // YYYY-MM-DD
  // 記事がいちばん強く属するトピッククラスタ。親ページ導線・パンくず・関連記事の
  // 優先順位に使う。新しい記事を足すときは必ず指定する(lib/clusters.ts を参照)。
  primaryCluster: ClusterId;
  // 併せて関連づけるクラスタ。柱ページの記事一覧や関連記事の2番手として使う。
  secondaryClusters?: ClusterId[];
  // 申請のどの段階の話か(コラム一覧・トップの索引の見出し)。
  // クラスタとは別の軸なので、両方を持つ。
  category: ColumnCategory;
  // カテゴリ節の中での表示順(小さいほど上)。
  // 未指定の記事は指定済みの記事より後ろに回り、その中では公開日の新しい順になる。
  // 「読む順」が意味を持つ大きなカテゴリにだけ付ける。
  // 将来の記事を間に挟めるよう、10刻みで付けること。
  orderInCategory?: number;
  hubPrimary: string;
  hubSecondary: string[];
  role: HubRole;
  mergeCandidate: string | null;
};

// 第3弾の記事は一覧で分散表示できるよう、公開日を1本ずつ管理する。
const NEW_COLUMN_DATES = {
  "ninteibi-jigojusho": "2026-07-18",
  "shindansho-kakunin": "2026-07-17",
  "techou-to-nenkin": "2026-07-16",
  "shoubyou-teatekin": "2026-07-15",
  "hattatsu-shougai": "2026-07-14",
  "hatachi-mae": "2026-07-13",
  "fushikyuu-shinsa-seikyu": "2026-07-12",
} as const;

const BASE_COLUMNS: Omit<Column, "hubPrimary" | "hubSecondary" | "role" | "mergeCandidate">[] = [
  {
    slug: "shakaiteki-chiyu",
    title:
      "社会的治癒 — 昔の通院があっても、初診日が動くことがある",
    metaTitle: "障害年金の社会的治癒｜初診日が動く条件と整理のしかた",
    description:
      "社会的治癒は、治療が必要なくなり相当期間ふつうに社会生活を送れていた場合に、再発後の受診を新たな初診日として扱う考え方です。法律に明文の定義がないこと、年数の基準がないこと、見られる3つのポイント、初診日が動くと納付要件や基礎・厚生の別がどう変わるか、申立書と添付資料での主張のしかた、主張しないほうがよい場合まで解説します。",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    primaryCluster: "conditions",
    secondaryClusters: ["application"],
    category: "初診日",
    orderInCategory: 50,
  },
  {
    slug: "hikazei-shuunyuu",
    title:
      "障害年金は非課税 — でも「収入ゼロ扱い」ではありません",
    metaTitle: "障害年金は非課税?｜扶養で収入に数えられる場面",
    description:
      "障害年金に所得税・住民税はかかりません。ただし健康保険の被扶養者の認定では収入に数えます。130万円と180万円の線引き、令和8年度の年金額を当てた早見表、扶養から外れたときに連鎖する国保切替えと自立支援医療の変更、生活保護や年金生活者支援給付金での扱いの違いまで整理しました。",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    primaryCluster: "application",
    secondaryClusters: ["conditions"],
    category: "受給が始まってから",
    orderInCategory: 20,
  },
  {
    slug: "jukyuugo-tetsuduki",
    title:
      "障害年金が決まったあとの手続きリスト — 年金証書が届いた日から動き出すもの",
    metaTitle: "障害年金の受給決定後の手続き｜給付金・法定免除・扶養",
    description:
      "障害年金の受給が決まったあとに必要な手続きを一覧化。請求しないと受け取れない年金生活者支援給付金(令和8年度 1級 月7,025円・2級 月5,620円)、国民年金保険料の法定免除と老齢基礎年金への影響、健康保険の扶養の確認、20歳前傷病の所得制限、年金証書で申請できる障害者手帳、初回振込までの流れまで。",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    primaryCluster: "application",
    secondaryClusters: ["conditions"],
    category: "受給が始まってから",
    orderInCategory: 10,
  },
  {
    slug: "kiso-kousei-chigai",
    title:
      "障害基礎年金と障害厚生年金の違い — 初診日の1日で、生涯数百万円が変わる",
    metaTitle: "障害基礎年金と障害厚生年金の違い｜初診日で決まる仕組み",
    description:
      "障害年金の入口は「初診日にどの年金制度に加入していたか」だけで決まります。3級・障害手当金・配偶者加給がある障害厚生年金と、子の加算がある障害基礎年金の違い、退職日と初診日の1日差で生涯数百万円変わる仕組み、第3号被保険者の不利、3級の人の65歳の壁まで、令和8年度の金額で解説します。",
    datePublished: "2026-08-14",
    dateModified: "2026-08-14",
    primaryCluster: "conditions",
    secondaryClusters: ["application"],
    category: "申請の前に",
    orderInCategory: 70,
  },
  {
    slug: "ikura-moraeru",
    title:
      "障害年金はいくらもらえる? — 令和8年度の金額と、初回入金までの流れ",
    metaTitle: "障害年金はいくらもらえる?｜令和8年度の金額と初回入金",
    description:
      "令和8年度の障害基礎年金は1級1,059,125円、2級847,300円。子の加算・配偶者加給・3級の最低保障・障害手当金・生活者支援給付金までを実際の数字で整理し、モデルケース3人分の試算、初回入金までの4〜5か月の流れ、遡及でまとまった額が入ったときの扱い、非課税と扶養の誤解まで解説します。",
    datePublished: "2026-08-14",
    dateModified: "2026-08-27",
    primaryCluster: "application",
    secondaryClusters: ["conditions"],
    category: "申請の前に",
    orderInCategory: 50,
  },
  {
    slug: "daisansha-shomei",
    title:
      "第三者証明 — 初診日をどうしても証明できないときの、最後の受け皿",
    metaTitle: "障害年金の第三者証明｜初診日が証明できないときの書き方",
    description:
      "カルテ廃棄や廃院で初診日の証明が取れないときに使う「初診日に関する第三者からの申立書」。20歳以降は2通以上と参考資料が必要で単独では通らないこと、医療従事者なら1通で足りること、「いつ知ったか」の5年ルール、頼み方の文例、書き方の良い例と悪い例までまとめました。",
    datePublished: "2026-08-14",
    dateModified: "2026-08-14",
    primaryCluster: "conditions",
    secondaryClusters: ["application"],
    category: "初診日",
    orderInCategory: 40,
  },
  {
    slug: "gaku-kaitei-seikyuu",
    title:
      "額改定請求 — 症状が重くなったときに、等級を上げてもらう手続き",
    metaTitle: "障害年金の額改定請求｜1年待機ルールと却下のリスク",
    description:
      "額改定請求は原則1年待機で、例外の27項目に精神障害は1つも含まれません。認められても増額は請求月の翌月分からで遡及なし、却下されると原則1年ロック、永久認定が有期認定に変わるリスクも。更新と同時に出す定石、3級から2級に必要な変化、65歳の期限まで解説します。",
    datePublished: "2026-08-14",
    dateModified: "2026-08-14",
    primaryCluster: "application",
    secondaryClusters: ["medical-certificate"],
    category: "受給が始まってから",
    orderInCategory: 40,
  },
  {
    slug: "shikyuu-teishi-fukkatsu",
    title:
      "障害年金が止まったら — 支給停止の原因と、復活させる手続き",
    metaTitle: "障害年金の支給停止｜止まる原因と復活の手続き",
    description:
      "更新で止まる人は統計上1000人に4人程度。支給停止・一時差し止め・失権の違い、支給停止事由消滅届で最大5年さかのぼれる仕組み、審査請求との使い分け、20歳前傷病の所得制限、そして3級相当にも該当しないまま3年と65歳で失権する「戻せない一線」までまとめました。",
    datePublished: "2026-08-14",
    dateModified: "2026-08-14",
    primaryCluster: "application",
    secondaryClusters: ["conditions"],
    category: "受給が始まってから",
    orderInCategory: 50,
  },
  {
    slug: "shinsei-shindoi",
    title:
      "障害年金の申請がしんどい — 疲れ果てないための「小分け」の進め方",
    metaTitle: "障害年金の申請がしんどい｜疲れ果てない小分けの進め方",
    description:
      "障害年金の申請は、電話・外出・待ち時間・診断書の費用が重なり、体調に波がある人ほど消耗します。しんどさの正体を7つに分解し、期限のあるもの・ないものの区別、工程別の消耗マップ、実際に完走した人たちのペース配分、止まってからの再開の仕方までまとめました。",
    datePublished: "2026-08-13",
    dateModified: "2026-08-13",
    primaryCluster: "application",
    secondaryClusters: ["mental"],
    category: "相談・進め方",
  },
  {
    slug: "shinsa-shikumi-nintei-i",
    title:
      "障害年金の審査は誰がどう行う? — 認定医が見ているポイントと、厳しくなった審査の実際",
    metaTitle: "障害年金の審査は誰がどう行う?｜認定医が見るポイントと最新傾向",
    description:
      "障害年金の審査は、会ったことのない認定医が書類だけで行います。令和6年度の非該当割合は13.0%(精神障害は12.1%)。目安表に当てはまっても不支給になる理由、認定医が実際に見ている7つのポイント、就労の見られ方、落ちたあとにできること、提出前の最終チェックまで、当事者の実感を交えて解説します。",
    datePublished: "2026-08-13",
    dateModified: "2026-08-13",
    primaryCluster: "application",
    secondaryClusters: ["medical-certificate", "mental"],
    category: "結果を待つ・不支給のとき",
  },
  {
    slug: "teishutsusaki-yuusou",
    title:
      "障害年金の書類はどこに提出する? — 年金事務所・市役所・郵送の違いと、出す前の最終チェック",
    metaTitle:
      "障害年金の書類はどこに提出する?｜年金事務所・市役所・郵送",
    description:
      "障害年金の請求書類の提出先を解説。障害基礎年金は市区町村役場か年金事務所、障害厚生年金は年金事務所、共済は各共済組合。窓口と郵送の使い分け、簡易書留の送り方、送付状の文例、提出前チェックリスト、提出後の照会と結果通知、よくある失敗まで。",
    datePublished: "2026-07-29",
    dateModified: "2026-07-29",
    primaryCluster: "application",
    category: "必要書類・提出",
  },
  {
    slug: "shindansho-tanomikata",
    title:
      "障害年金の診断書を主治医にどう頼む? — 切り出し方の台本、渡すメモ、依頼当日の流れ",
    metaTitle:
      "障害年金の診断書を主治医にどう頼む?｜切り出し方と依頼メモ",
    description:
      "障害年金の診断書を主治医に頼むときの切り出し方を解説。言い出せない人のための台本3パターン、頼むタイミング、渡すA4メモの完成形、依頼当日の流れ、費用と期間の目安、言ってはいけないNGワード、受け取り時にやること、よくある質問まで。",
    datePublished: "2026-07-29",
    dateModified: "2026-07-29",
    primaryCluster: "medical-certificate",
    secondaryClusters: ["application"],
    category: "診断書 — 主治医に伝える",
    orderInCategory: 20,
  },
  {
    slug: "kazoku-enjo-kakikata",
    title:
      "障害年金の申立書に家族の援助をどう書く? — 支援内容の具体例と、「書かないと存在しない」という審査の現実",
    metaTitle:
      "障害年金の申立書に家族の援助をどう書く?｜具体例と記入ポイント",
    description:
      "障害年金の病歴・就労状況等申立書に家族の援助をどう書くかを解説。単身生活想定ルールとの関係、7項目別の援助の棚卸しリスト、援助の3レベル(声かけ・代行・見守り)の書き分け、母の援助のフル記入例、家族が書く第三者メモの完成形、独居の人の書き方、NG例、よくある質問まで。",
    datePublished: "2026-07-29",
    dateModified: "2026-07-29",
    primaryCluster: "medical-certificate",
    secondaryClusters: ["mental"],
    category: "申立書",
    orderInCategory: 50,
  },
  {
    slug: "shindansho-ishi-ni-tsutaeru",
    title:
      "障害年金の診断書で医師に伝えること全リスト — 何を、どこまで、どう伝えるか(伝えてはいけないことも)",
    metaTitle: "障害年金の診断書で医師に伝えること全リスト",
    description:
      "障害年金の診断書を書いてもらう前に、医師に伝えるべきことを全部リスト化。日常生活能力7項目・就労の実態・家族の援助・服薬しても残る症状・症状の波・危機対応の6分野を、伝える言葉の例つきで解説。伝えてはいけないこと、伝える順番、A4一枚にまとめる完成形、よくある質問まで。",
    datePublished: "2026-07-31",
    dateModified: "2026-07-31",
    primaryCluster: "medical-certificate",
    secondaryClusters: ["mental"],
    category: "診断書 — 主治医に伝える",
    orderInCategory: 40,
  },
  {
    slug: "shindansho-jittai-chigau",
    title:
      "障害年金の診断書が実態と違う・軽く書かれた — 訂正はどこまで頼める?ケース別の対処と「出す/出さない」の判断",
    metaTitle: "障害年金の診断書が実態と違う・軽く書かれたときの対処",
    description:
      "障害年金の診断書が実態と違う、軽く書かれたときの対処法。訂正を頼めること・頼めないことの線引き、事実の誤りと評価の軽さで分かれる対応、医師への伝え方の完成形、このまま提出するかの判断基準、提出後・受給後・不支給後にできること、更新で軽く書かれた場合まで解説。",
    datePublished: "2026-07-31",
    dateModified: "2026-07-31",
    primaryCluster: "medical-certificate",
    category: "診断書 — 主治医に伝える",
    orderInCategory: 100,
  },
  {
    slug: "tekio-shogai-shogai-nenkin",
    title:
      "適応障害でも障害年金は申請できる? — 確認する順番と、自分の状況を整理する4つのシート",
    metaTitle: "適応障害でも障害年金は申請できる?｜確認する順番と4つのシート",
    description:
      "適応障害で障害年金を申請できるのか。病名だけで決まらない理由と、確認すべき順番を整理します。日常生活・就労・初診日・受診歴を書き出す4つのシート、記入例、休職中の人のタイムライン、並行して使える制度、主治医への3つの質問、よくある質問まで。",
    datePublished: "2026-07-30",
    dateModified: "2026-07-30",
    primaryCluster: "mental",
    secondaryClusters: ["conditions"],
    category: "申請の前に",
    orderInCategory: 20,
  },
  {
    slug: "moushitatesho-mijushin-kikan",
    title:
      "病歴・就労状況等申立書の未受診期間はどう書く? — 空白を「軽快」と読ませないための書き方と、5パターンのフル記入例",
    metaTitle: "病歴・就労状況等申立書の未受診期間の書き方",
    description:
      "病歴・就労状況等申立書の未受診期間(空白期間)の書き方を徹底解説。空白が「軽快」と読まれる理由、中断理由5パターン別のフル記入例、社会的治癒で初診日が動くリスク、証拠がないときの補強材料、認定日が未受診期間に重なる場合の対処、よくある質問まで。",
    datePublished: "2026-07-26",
    dateModified: "2026-08-27",
    primaryCluster: "application",
    category: "申立書",
    orderInCategory: 30,
  },
  {
    slug: "hitorigurashi-furi",
    title:
      "障害年金は一人暮らしだと不利? — 「自立している」と誤解されないための、診断書と申立書の伝え方",
    metaTitle: "障害年金は一人暮らしだと不利?｜診断書と申立書の伝え方",
    description:
      "障害年金は一人暮らしだと不利なのかを徹底解説。独居が審査でどう見られるか、受けている援助の棚卸し、生活が破綻している具体例、なぜ一人暮らしなのかの説明、主治医に渡すA4一枚の完成形、受給後に独居を始めるときの更新対策、よくある質問まで。",
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
    primaryCluster: "medical-certificate",
    secondaryClusters: ["mental"],
    category: "診断書 — 主治医に伝える",
    orderInCategory: 70,
  },
  {
    slug: "nenkin-jimusho-soudan",
    title:
      "障害年金の相談で年金事務所に持っていくもの — 初回相談の持ち物チェックリストと、予約から当日までの流れ",
    metaTitle:
      "障害年金の相談で年金事務所に持っていくもの｜初回相談の持ち物チェックリスト",
    description:
      "障害年金の相談で年金事務所に持っていくものを、初回相談の持ち物チェックリストで解説。必ず持つもの・あると話が早いもの・不要なものの3分類、初診日や通院歴が整理できていない場合の準備、予約方法、当日聞かれること、代理の家族が行く場合まで。",
    datePublished: "2026-07-23",
    dateModified: "2026-08-11",
    primaryCluster: "application",
    category: "相談・進め方",
  },
  {
    slug: "jushinjokyo-shomeisho",
    title: "受診状況等証明書とは？病院への依頼方法・郵送・確認ポイント",
    metaTitle: "受診状況等証明書の郵送での依頼方法｜遠方の病院からの取り寄せ手順",
    description:
      "受診状況等証明書を郵送で依頼する手順を解説。遠方や引っ越し先の病院からの取り寄せ、電話での伝え方、同封するもの、返信用封筒と料金の扱い、届くまでの期間、カルテがない・廃院の場合の次の一手まで。",
    datePublished: "2026-07-23",
    dateModified: "2026-08-11",
    primaryCluster: "conditions",
    secondaryClusters: ["application"],
    category: "必要書類・提出",
  },
  {
    slug: "shindansho-irai-timing",
    title:
      "障害年金の診断書はいつ頼む? — 現症日の3か月ルールから逆算する依頼タイミングと、依頼前に準備するもの",
    metaTitle:
      "障害年金の診断書はいつ頼む?｜現症日と依頼タイミング",
    description:
      "障害年金の診断書を依頼するベストタイミングを解説。請求日前3か月以内という現症日ルール、認定日請求で2枚必要なときの順番、依頼前に準備する3点セット、医師への伝え方の3ステップ台本、作成期間と費用、受け取り後の確認、更新時の依頼まで。「頼む日」ではなく「回収する日」にするための逆算術。",
    datePublished: "2026-07-23",
    dateModified: "2026-07-31",
    primaryCluster: "medical-certificate",
    secondaryClusters: ["application"],
    category: "診断書 — 主治医に伝える",
    orderInCategory: 10,
  },
  {
    slug: "hitsuyou-shorui-seishin",
    title:
      "精神疾患で障害年金を申請するときの必要書類チェックリスト — 入手先・費用・期間・取得順序まで一覧で",
    metaTitle:
      "精神疾患の障害年金｜必要書類チェックリスト",
    description:
      "精神疾患(うつ病・双極性障害・統合失調症・発達障害)で障害年金を申請するときの必要書類を完全チェックリスト化。全員に必要な5点と、ケース別の追加書類、入手先・費用・期間の一覧表、取得順序と逆算スケジュール、有効期限の落とし穴、提出前の最終確認まで。",
    datePublished: "2026-07-23",
    dateModified: "2026-07-23",
    primaryCluster: "mental",
    secondaryClusters: ["application", "depression"],
    category: "必要書類・提出",
  },
  {
    slug: "shinsei-kikan",
    title: "障害年金の申請結果はいつ届く？審査期間と結果待ちの過ごし方",
    description:
      "障害年金の申請から結果が届くまでの流れを解説します。審査中の連絡、追加書類、結果が遅い場合の確認方法や、結果待ちの間にしておきたい準備も紹介します。",
    datePublished: "2026-07-23",
    dateModified: "2026-07-30",
    primaryCluster: "application",
    category: "結果を待つ・不支給のとき",
  },
  {
    slug: "moushitatesho-kikan-kugiri",
    title:
      "障害年金の申立書は期間をどう区切る？通院・就労・症状変化の書き方",
    description:
      "障害年金の病歴・就労状況等申立書で期間を区切る考え方を解説します。転院、休職、退職、症状の悪化、未受診期間など、区切りを作る具体例も紹介します。",
    datePublished: "2026-07-21",
    dateModified: "2026-07-30",
    primaryCluster: "application",
    secondaryClusters: ["mental", "depression"],
    category: "申立書",
    orderInCategory: 20,
  },
  {
    slug: "sokyuu-seikyuu",
    title:
      "障害年金の遡及請求 — 最大5年分をさかのぼる条件と、成功を分ける「認定日の診断書」の現実",
    metaTitle: "障害年金の遡及請求｜最大5年分をさかのぼる条件",
    description:
      "障害年金の遡及請求を解説。認定日請求と事後重症請求の違い、5年の時効、認定日と現在の診断書、当時のカルテがない場合の確認事項を紹介します。",
    datePublished: "2026-07-21",
    dateModified: "2026-07-21",
    primaryCluster: "application",
    secondaryClusters: ["conditions"],
    category: "申請の前に",
    orderInCategory: 60,
  },
  {
    slug: "taishou-shoubyou-kyoukai",
    title:
      "適応障害・不安障害・神経症は障害年金の対象外？— 「病名で門前払い」されないための境界線の知識",
    metaTitle: "適応障害・不安障害・神経症は障害年金の対象外？",
    description:
      "神経症が原則として認定対象外とされる基準と、精神病の病態を示す場合の扱いを解説。併存疾患、診断名の変化、診断書の確認点を整理します。",
    datePublished: "2026-07-21",
    dateModified: "2026-08-27",
    primaryCluster: "conditions",
    secondaryClusters: ["mental", "depression"],
    category: "申請の前に",
    orderInCategory: 10,
  },
  {
    slug: "shougaisha-koyou-nenkin",
    title:
      "障害者雇用で働きながら障害年金はもらえる？— フルタイム6年で受給できた実例と、「働ける＝軽い」と読ませない書類の作り方",
    metaTitle: "障害者雇用で働きながら障害年金はもらえる？",
    description:
      "障害者雇用と障害年金の関係を解説。就労状況、職場の配慮、欠勤、仕事以外の生活を診断書や申立書へ反映する方法、更新時の注意点を紹介します。",
    datePublished: "2026-07-21",
    dateModified: "2026-07-21",
    primaryCluster: "mental",
    secondaryClusters: ["medical-certificate"],
    category: "申請の前に",
    orderInCategory: 110,
  },
  {
    slug: "nichijo-seikatsu-7koumoku",
    title:
      "障害年金「日常生活能力の判定」7項目 — できる・できないの具体例と、医師への伝え方",
    metaTitle: "障害年金「日常生活能力の判定」7項目とは?できる・できないの具体例",
    description:
      "障害年金(精神)の「日常生活能力の判定」7項目を具体例で解説。食事・清潔保持・金銭管理・通院と服薬・対人関係・危機対応・社会性の7項目それぞれについて、「できる」と評価されやすい言い方と、実態が伝わる言い方を対比。単身生活を想定する評価ルール、本人メモ・家族メモの完成形、よくある質問まで。",
    datePublished: "2026-07-20",
    dateModified: "2026-08-11",
    primaryCluster: "medical-certificate",
    secondaryClusters: ["mental", "depression"],
    category: "診断書 — 主治医に伝える",
    orderInCategory: 50,
  },
  {
    slug: "tokyu-hantei-guideline",
    title:
      "精神の等級判定ガイドラインと目安表 — 自分の診断書で「何級相当か」を読む方法と、目安どおりにならない理由",
    metaTitle: "精神の等級判定ガイドライン｜目安表の読み方",
    description:
      "精神の障害年金で使われる等級判定ガイドラインを解説。日常生活能力7項目の平均と程度から目安表を読む方法、計算例、総合評価で確認される要素を紹介します。",
    datePublished: "2026-07-20",
    dateModified: "2026-07-20",
    primaryCluster: "medical-certificate",
    secondaryClusters: ["mental", "depression"],
    category: "診断書 — 主治医に伝える",
    orderInCategory: 90,
  },
  {
    slug: "koushin-kakuninhodo",
    title:
      "障害年金の更新（障害状態確認届）— 何年ごと？落ちたらどうなる？受給してからが本番という話",
    metaTitle: "障害年金の更新（障害状態確認届）｜時期・支給停止への備え",
    description:
      "障害年金の更新時期、障害状態確認届の提出期限、就労中の注意点、支給停止や級落ちへの対応を解説。更新前から準備したい生活記録と診断書の確認事項も紹介します。",
    datePublished: "2026-07-20",
    dateModified: "2026-08-27",
    primaryCluster: "application",
    secondaryClusters: ["medical-certificate"],
    category: "受給が始まってから",
    orderInCategory: 30,
  },
  {
    slug: "shindansho-kaitekurenai",
    title:
      "障害年金の診断書を医師が書いてくれない — 断られる理由は5つの型に分かれる。型別の対処と依頼文の完成形",
    metaTitle: "障害年金の診断書を医師が書いてくれないときの対処法",
    description:
      "障害年金の診断書を主治医に断られた場合の対処法を5つの理由別に解説。口頭での頼み方、依頼文、家族や支援職への相談、転院前の注意点を紹介します。",
    datePublished: "2026-07-20",
    dateModified: "2026-07-31",
    primaryCluster: "medical-certificate",
    secondaryClusters: ["mental"],
    category: "診断書 — 主治医に伝える",
    orderInCategory: 30,
  },
  {
    slug: "ninteibi-jigojusho",
    title: "障害認定日請求と事後重症請求の違い｜最大5年さかのぼるための条件",
    metaTitle: "障害認定日請求と事後重症請求の違い｜最大5年遡及の条件",
    description:
      "障害認定日請求と事後重症請求の違い、最大5年分の遡及、認定日頃の診断書が取れない場合の確認事項、額改定請求までわかりやすく解説します。",
    datePublished: NEW_COLUMN_DATES["ninteibi-jigojusho"],
    dateModified: "2026-08-27",
    primaryCluster: "application",
    secondaryClusters: ["conditions"],
    category: "申請の前に",
    orderInCategory: 40,
  },
  {
    slug: "shindansho-kakunin",
    title:
      "障害年金の診断書を受け取ったら確認すべき7つのポイント — 「実際より軽く書かれていた」を提出前に防ぐ",
    metaTitle: "障害年金の診断書を受け取ったら確認すべき7つのポイント",
    description:
      "障害年金の診断書が実際より軽いと感じる理由と、提出前に確認したい7つのポイントを解説。事実と異なる記載があったときの伝え方、更新時の注意も紹介します。",
    datePublished: NEW_COLUMN_DATES["shindansho-kakunin"],
    dateModified: "2026-08-14",
    primaryCluster: "medical-certificate",
    secondaryClusters: ["mental"],
    category: "診断書 — 主治医に伝える",
    orderInCategory: 80,
  },
  {
    slug: "techou-to-nenkin",
    title: "障害者手帳と障害年金の違い — 手帳の等級と年金の等級は別物です",
    description:
      "精神障害者保健福祉手帳と障害年金は、別の制度・別の審査です。手帳3級でも年金を受給できる場合があること、手帳がなくても年金申請できること、年金証書で手帳を取得できる制度を解説します。",
    datePublished: NEW_COLUMN_DATES["techou-to-nenkin"],
    dateModified: "2026-08-27",
    primaryCluster: "conditions",
    secondaryClusters: ["mental"],
    category: "申請の前に",
    orderInCategory: 100,
  },
  {
    slug: "shoubyou-teatekin",
    title: "傷病手当金と障害年金は同時にもらえる？併給調整と申請準備の流れ",
    metaTitle: "傷病手当金と障害年金は同時にもらえる？併給調整と申請準備",
    description:
      "傷病手当金と障害年金の併給調整、同じ傷病で受け取る場合の差額支給、遡及時の返還、休職中から始めたい障害年金の準備を解説します。",
    datePublished: NEW_COLUMN_DATES["shoubyou-teatekin"],
    dateModified: "2026-08-14",
    primaryCluster: "application",
    category: "申請の前に",
    orderInCategory: 90,
  },
  {
    slug: "hattatsu-shougai",
    title:
      "発達障害（ADHD・ASD）で障害年金を申請する方法｜初診日・診断書・申立書",
    metaTitle: "発達障害（ADHD・ASD）の障害年金｜初診日・診断書・申立書",
    description:
      "発達障害で障害年金を申請する際の初診日の分岐、診断書の確認点、出生から書く申立書、就労中の伝え方、遡及・更新まで具体例付きで解説します。",
    datePublished: NEW_COLUMN_DATES["hattatsu-shougai"],
    dateModified: "2026-08-14",
    primaryCluster: "mental",
    secondaryClusters: ["conditions"],
    category: "申請の前に",
    orderInCategory: 30,
  },
  {
    slug: "hatachi-mae",
    title:
      "20歳前傷病の障害基礎年金 — 納付要件を問われない特例と、10代の記録が大切な理由",
    metaTitle: "20歳前傷病の障害基礎年金 — 納付要件と10代の記録",
    description:
      "20歳前傷病による障害基礎年金を解説。納付要件が不要となる条件、請求時期、本人の所得による支給制限、10代の通院・学校記録を残す理由を紹介します。",
    datePublished: NEW_COLUMN_DATES["hatachi-mae"],
    dateModified: "2026-08-27",
    primaryCluster: "conditions",
    category: "申請の前に",
    orderInCategory: 80,
  },
  {
    slug: "fushikyuu-shinsa-seikyu",
    title:
      "障害年金が不支給になったら｜審査請求・再審査請求・再請求の選び方",
    metaTitle: "障害年金が不支給になったときの審査請求・再審査請求・再請求",
    description:
      "障害年金の不支給後に選べる審査請求、再審査請求、再請求の違いと期限、不支給理由の確認方法、書類を立て直す手順を解説します。",
    datePublished: NEW_COLUMN_DATES["fushikyuu-shinsa-seikyu"],
    dateModified: "2026-08-27",
    primaryCluster: "application",
    category: "結果を待つ・不支給のとき",
  },
  {
    slug: "jibun-de-shinsei",
    title:
      "障害年金は自分で申請できる?社労士に依頼する場合との違いと判断のポイント",
    metaTitle: "障害年金は自分で申請できる?社労士に依頼する場合との違い",
    description:
      "障害年金の申請は自分でできる手続きです。自分で進める場合と社会保険労務士に依頼する場合の違い、費用の考え方、専門家に相談したほうがよいケースの判断基準を解説します。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-17",
    primaryCluster: "application",
    category: "相談・進め方",
  },
  {
    slug: "hatarakinagara",
    title: "働きながら障害年金はもらえる？「働ける＝改善」と誤解されない伝え方",
    metaTitle: "働きながら障害年金｜就労中に医師へ伝えること",
    description:
      "働きながら障害年金を申請するとき、就労のどこを医師に伝えるかを解説。勤務形態・配慮・欠勤や早退・帰宅後の生活の4点を伝える言葉の例つきで整理し、診断書の就労欄と申立書への反映方法、就労開始・更新時の注意、よくある質問まで。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-31",
    primaryCluster: "medical-certificate",
    secondaryClusters: ["mental"],
    category: "申立書",
    orderInCategory: 40,
  },
  {
    slug: "nofu-yoken",
    title:
      "障害年金の保険料納付要件とは — 未納があると受け取れない?3分の2要件と直近1年の特例",
    metaTitle: "障害年金の保険料納付要件とは — 3分の2要件と直近1年の特例",
    description:
      "障害年金には保険料納付要件があります。3分の2要件と直近1年特例のしくみ、免除・学生納付特例の扱い、初診日より後に納めても間に合わない理由、納付状況の確認方法を解説します。",
    datePublished: "2026-07-17",
    dateModified: "2026-08-27",
    primaryCluster: "conditions",
    category: "納付要件",
  },
  {
    slug: "shoshinbi-wakaranai",
    title:
      "障害年金の初診日がわからないときの調べ方｜証明できない場合も解説",
    description:
      "障害年金を申請したいものの初診日がわからない場合の調べ方を解説します。病院、診察券、お薬手帳、健康保険の記録など、確認の手がかりを順番に紹介します。",
    datePublished: "2026-07-17",
    dateModified: "2026-08-27",
    primaryCluster: "conditions",
    category: "初診日",
    orderInCategory: 10,
  },
  {
    slug: "shoshinbi-karute-nashi",
    title:
      "障害年金の初診日 — カルテがない・破棄されたときの証明方法と、代替資料の一覧",
    metaTitle:
      "障害年金の初診日｜カルテがない・破棄されたときの証明方法【代替資料の一覧つき】",
    description:
      "障害年金の初診日を証明したいのにカルテがない・破棄された場合の対処法。5年の保存期間の実際、病院に確認する3つの質問、受診状況等証明書が添付できない申立書の書き方、診察券・お薬手帳・領収書など代替資料の一覧と強さ、第三者証明の使い方、2番目の病院から攻める方法まで。",
    datePublished: "2026-08-11",
    dateModified: "2026-08-11",
    primaryCluster: "conditions",
    category: "初診日",
    orderInCategory: 20,
  },
  {
    slug: "shoshinbi-haiin",
    title:
      "障害年金の初診日 — 昔の病院が廃院しているときの調べ方と、行き先の探し方",
    metaTitle:
      "障害年金の初診日｜昔の病院が廃院しているときの調べ方【行き先の探し方つき】",
    description:
      "障害年金の初診日を証明したい病院が廃院・閉院していたときの対処法。廃院を確認する5つのルート(保健所・医師会・法人登記・後継医療機関・元院長)、カルテの行き先、廃院でも証明が取れる3つのケース、取れない場合の代替資料と申立書の書き方、第三者証明の使い方まで。",
    datePublished: "2026-08-11",
    dateModified: "2026-08-11",
    primaryCluster: "conditions",
    category: "初診日",
    orderInCategory: 30,
  },
  {
    slug: "moushitatesho-kakikata",
    title:
      "病歴・就労状況等申立書の書き方【精神疾患】— 審査で落ちる書き方と、伝わる書き方(期間別フル記入例つき)",
    metaTitle:
      "病歴・就労状況等申立書の書き方【精神疾患】審査で落ちる書き方・伝わる書き方",
    description:
      "病歴・就労状況等申立書の書き方を、審査で落ちる書き方と伝わる書き方の違いから解説。うつ病の発病から現在までの期間別フル記入例、就労欄の落とし穴、未受診期間の扱い、よくある質問まで。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-31",
    primaryCluster: "mental",
    secondaryClusters: ["application", "depression"],
    category: "申立書",
    orderInCategory: 10,
  },
  {
    slug: "moushitatesho-a4-insatsu",
    title: "障害年金の申立書をA4で印刷する方法｜PDF・コンビニ印刷も解説",
    description:
      "障害年金の病歴・就労状況等申立書をA4用紙へ印刷する方法を解説します。自宅、スマートフォン、コンビニでの印刷手順や、印刷後の確認点も紹介します。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-30",
    primaryCluster: "application",
    category: "申立書",
    orderInCategory: 60,
  },
  {
    slug: "shinsatsu-mae-memo",
    title:
      "障害年金の診断書のために、主治医に渡す「生活状況メモ」の書き方 — 診察で話せなくても、紙なら伝わる",
    metaTitle:
      "障害年金の診断書｜主治医に渡す「生活状況メモ」の書き方【具体例つき】",
    description:
      "障害年金の診断書のために主治医へ渡す「生活状況メモ」の書き方を具体例つきで解説。何を書くか(7項目・症状の波・家族の援助・就労)、書き方のコツ(頻度と具体例)、A4一枚の完成形、診察での渡し方の台本、渡せなかったときの対処、更新での使い方まで。",
    datePublished: "2026-07-17",
    dateModified: "2026-08-11",
    primaryCluster: "medical-certificate",
    secondaryClusters: ["mental"],
    category: "診断書 — 主治医に伝える",
    orderInCategory: 60,
  },
];

export const COLUMNS: Column[] = BASE_COLUMNS.map((column) => {
  const hubAssignment = COLUMN_HUB_ASSIGNMENTS[column.slug];
  if (!hubAssignment) throw new Error(`ハブ棚割りがありません: ${column.slug}`);
  return {
    ...column,
    hubPrimary: hubAssignment.primary,
    hubSecondary: hubAssignment.secondary,
    role: hubAssignment.role,
    mergeCandidate: hubAssignment.mergeCandidate,
  };
});

export const COLUMNS_BY_DATE = [...COLUMNS].sort(
  (a, b) =>
    b.datePublished.localeCompare(a.datePublished) ||
    b.dateModified.localeCompare(a.dateModified),
);

// カテゴリ節に出す記事。コラム一覧もトップの索引も必ずここを通すこと
// (2箇所で並び順がずれると、同じカテゴリを開いても順番が違うことになる)。
// orderInCategory を付けた記事が読む順に並び、未指定の記事はそのあとに新しい順で続く。
export function columnsInCategory(category: ColumnCategory): Column[] {
  return COLUMNS.filter((c) => c.category === category).sort((a, b) => {
    const ao = a.orderInCategory ?? Number.MAX_SAFE_INTEGER;
    const bo = b.orderInCategory ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return b.datePublished.localeCompare(a.datePublished);
  });
}

export function getColumn(slug: string): Column {
  const column = COLUMNS.find((c) => c.slug === slug);
  if (!column) {
    throw new Error(`コラム記事が見つかりません: ${slug}`);
  }
  return column;
}

/* ---- トピッククラスタ(柱ページ)の参照 ----
   クラスタの定義そのものは lib/clusters.ts。ここは COLUMNS と突き合わせる関数だけ。 */

const COLUMN_SLUGS = new Set(COLUMNS.map((c) => c.slug));

// 柱ページが実際にアクセスできる状態か。published を立てただけで記事ファイルが
// まだ無い場合はfalseになるので、存在しないページへリンクすることがない。
export function isPillarAvailable(cluster: Cluster): boolean {
  if (!cluster.published) return false;
  const slug = clusterPillarSlug(cluster);
  return slug === null ? true : COLUMN_SLUGS.has(slug);
}

// 公開済みでアクセスできる柱ページだけを、定義順に返す。
export function availableClusters(): Cluster[] {
  return CLUSTERS.filter(isPillarAvailable);
}

// 記事から見た親ページ。未公開・自分自身が柱ページの場合はnull。
export function parentPillar(column: Column): Cluster | null {
  const cluster = getCluster(column.primaryCluster);
  if (!isPillarAvailable(cluster)) return null;
  if (clusterPillarSlug(cluster) === column.slug) return null;
  return cluster;
}

// クラスタに属する記事。primaryCluster一致を先に、それぞれ公開日の新しい順。
// 柱ページ自身は一覧に含めない。
export function clusterColumns(id: ClusterId): Column[] {
  const pillarSlug = clusterPillarSlug(getCluster(id));
  const belongs = COLUMNS_BY_DATE.filter((c) => c.slug !== pillarSlug);
  return [
    ...belongs.filter((c) => c.primaryCluster === id),
    ...belongs.filter(
      (c) => c.primaryCluster !== id && c.secondaryClusters?.includes(id),
    ),
  ];
}

function sharesCluster(a: Column, b: Column): boolean {
  const clustersOf = (c: Column) => [c.primaryCluster, ...(c.secondaryClusters ?? [])];
  const set = new Set(clustersOf(a));
  return clustersOf(b).some((id) => set.has(id));
}

// 「あわせて読みたい」に出す記事。記事ごとに手で選んだ relatedSlugs を最優先し、
// 足りない分を同じクラスタの記事で補う(同じ主クラスタ → クラスタが重なる →
// 同じ段階、の順)。手で選んだ並びは崩さない。
export function relatedColumns(
  currentSlug: string,
  relatedSlugs?: string[],
  limit = 5,
): Column[] {
  const current = COLUMNS.find((c) => c.slug === currentSlug);
  const picked: Column[] = [];
  const seen = new Set<string>([currentSlug]);

  const add = (column: Column | undefined) => {
    if (!column || seen.has(column.slug) || picked.length >= limit) return;
    seen.add(column.slug);
    picked.push(column);
  };

  for (const slug of relatedSlugs ?? []) {
    add(COLUMNS.find((c) => c.slug === slug));
  }
  if (!current) return picked;

  const rest = COLUMNS_BY_DATE.filter((c) => !seen.has(c.slug));
  for (const c of rest.filter((c) => c.primaryCluster === current.primaryCluster)) add(c);
  for (const c of rest.filter((c) => sharesCluster(current, c))) add(c);
  for (const c of rest.filter((c) => c.category === current.category)) add(c);

  return picked;
}

// 記事のパンくずに差し込む中間階層。柱ページが公開されるまでは空配列なので、
// 構造化データにも表示にも、アクセスできないURLは出ない。
export function columnBreadcrumbParents(
  column: Column,
): { name: string; path: string }[] {
  const pillar = parentPillar(column);
  if (!pillar) return [];
  return [{ name: pillar.label, path: pillar.pillarPath }];
}

export function columnJsonLd(column: Column) {
  // BreadcrumbListには実際にアクセスできるURLだけを入れる。柱ページが未公開の間は
  // columnBreadcrumbParents が空になるので、従来どおりトップ>コラム>記事になる。
  const trail = [
    { name: "トップ", path: "/" },
    { name: "コラム", path: "/columns" },
    ...columnBreadcrumbParents(column),
    { name: column.title, path: `/columns/${column.slug}` },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: column.title,
        description: column.description,
        datePublished: column.datePublished,
        dateModified: column.dateModified,
        inLanguage: "ja-JP",
        author: {
          "@type": "Person",
          name: AUTHOR_NAME,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
        mainEntityOfPage: `${SITE_URL}/columns/${column.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: trail.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${SITE_URL}${item.path === "/" ? "/" : item.path}`,
        })),
      },
    ],
  };
}

// 記事ページ共通のメタデータ(title / description / OpenGraph)。
// og:imageは各記事フォルダの opengraph-image.tsx(タイトル入り)が使われる。
export function columnMetadata(column: Column): Metadata {
  const path = `/columns/${column.slug}`;
  const metaTitle = column.metaTitle ?? column.title;
  const fullTitle = `${metaTitle}｜${SITE_NAME}`;

  return {
    title: metaTitle,
    description: column.description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title: fullTitle,
      description: column.description,
      type: "article",
      siteName: SITE_NAME,
      url: `${SITE_URL}${path}`,
      locale: "ja_JP",
      publishedTime: column.datePublished,
      modifiedTime: column.dateModified,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: column.description,
    },
    robots: { index: true, follow: true },
  };
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}
