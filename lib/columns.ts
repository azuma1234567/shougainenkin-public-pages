import type { Metadata } from "next";
import { AUTHOR_NAME, SITE_NAME, SITE_URL } from "@/lib/constants";

// コラム記事のメタデータ。一覧・sitemap・JSON-LDで共通利用する。
// slugは計測用キャンペーンリンクのctにも使うため変更しないこと。

export type Column = {
  slug: string;
  title: string;
  // 検索結果用の短いtitle(全角32文字前後)。未指定ならtitleを使う。
  // h1・一覧・パンくずの表示はtitleのまま変えない。
  metaTitle?: string;
  description: string;
  datePublished: string; // YYYY-MM-DD
  dateModified: string; // YYYY-MM-DD
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

export const COLUMNS: Column[] = [
  {
    slug: "tekio-shogai-shogai-nenkin",
    title:
      "適応障害でも障害年金は申請できる? — 確認する順番と、自分の状況を整理する4つのシート",
    metaTitle: "適応障害でも障害年金は申請できる?｜確認する順番と4つのシート",
    description:
      "適応障害で障害年金を申請できるのか。病名だけで決まらない理由と、確認すべき順番を整理します。日常生活・就労・初診日・受診歴を書き出す4つのシート、記入例、休職中の人のタイムライン、並行して使える制度、主治医への3つの質問、よくある質問まで。",
    datePublished: "2026-07-30",
    dateModified: "2026-07-30",
  },
  {
    slug: "moushitatesho-mijushin-kikan",
    title:
      "病歴・就労状況等申立書の未受診期間はどう書く? — 空白を「軽快」と読ませないための書き方と、5パターンのフル記入例",
    metaTitle: "病歴・就労状況等申立書の未受診期間の書き方",
    description:
      "病歴・就労状況等申立書の未受診期間(空白期間)の書き方を徹底解説。空白が「軽快」と読まれる理由、中断理由5パターン別のフル記入例、社会的治癒で初診日が動くリスク、証拠がないときの補強材料、認定日が未受診期間に重なる場合の対処、よくある質問まで。",
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
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
  },
  {
    slug: "nenkin-jimusho-soudan",
    title:
      "障害年金を年金事務所で相談するときの持ち物｜予約前に準備するもの",
    description:
      "障害年金について年金事務所へ相談するときの持ち物、予約方法、当日に聞かれることを解説します。初診日や通院歴が整理できていない場合の準備方法も紹介します。",
    datePublished: "2026-07-23",
    dateModified: "2026-07-30",
  },
  {
    slug: "jushinjokyo-shomeisho",
    title: "受診状況等証明書とは？病院への依頼方法・郵送・確認ポイント",
    description:
      "障害年金の受診状況等証明書について、依頼する病院、電話や郵送での頼み方、発行後に確認するポイントを解説します。カルテが残っていない場合の対応も紹介します。",
    datePublished: "2026-07-23",
    dateModified: "2026-07-30",
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
    dateModified: "2026-07-23",
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
  },
  {
    slug: "shinsei-kikan",
    title: "障害年金の申請結果はいつ届く？審査期間と結果待ちの過ごし方",
    description:
      "障害年金の申請から結果が届くまでの流れを解説します。審査中の連絡、追加書類、結果が遅い場合の確認方法や、結果待ちの間にしておきたい準備も紹介します。",
    datePublished: "2026-07-23",
    dateModified: "2026-07-30",
  },
  {
    slug: "moushitatesho-kikan-kugiri",
    title:
      "障害年金の申立書は期間をどう区切る？通院・就労・症状変化の書き方",
    description:
      "障害年金の病歴・就労状況等申立書で期間を区切る考え方を解説します。転院、休職、退職、症状の悪化、未受診期間など、区切りを作る具体例も紹介します。",
    datePublished: "2026-07-21",
    dateModified: "2026-07-30",
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
  },
  {
    slug: "taishou-shoubyou-kyoukai",
    title:
      "適応障害・不安障害・神経症は障害年金の対象外？— 「病名で門前払い」されないための境界線の知識",
    metaTitle: "適応障害・不安障害・神経症は障害年金の対象外？",
    description:
      "神経症が原則として認定対象外とされる基準と、精神病の病態を示す場合の扱いを解説。併存疾患、診断名の変化、診断書の確認点を整理します。",
    datePublished: "2026-07-21",
    dateModified: "2026-07-21",
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
  },
  {
    slug: "nichijo-seikatsu-7koumoku",
    title:
      "診断書の裏面「日常生活能力の判定」7項目 — 精神の障害年金は、ほぼここで決まる",
    metaTitle: "日常生活能力の判定7項目｜精神の障害年金と診断書",
    description:
      "精神の障害年金で重視される日常生活能力の判定7項目を解説。単身生活を想定する評価ルール、実態より軽く評価されやすい点、医師へ渡す本人・家族メモの作り方を紹介します。",
    datePublished: "2026-07-20",
    dateModified: "2026-07-20",
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
  },
  {
    slug: "koushin-kakuninhodo",
    title:
      "障害年金の更新（障害状態確認届）— 何年ごと？落ちたらどうなる？受給してからが本番という話",
    metaTitle: "障害年金の更新（障害状態確認届）｜時期・支給停止への備え",
    description:
      "障害年金の更新時期、障害状態確認届の提出期限、就労中の注意点、支給停止や級落ちへの対応を解説。更新前から準備したい生活記録と診断書の確認事項も紹介します。",
    datePublished: "2026-07-20",
    dateModified: "2026-07-20",
  },
  {
    slug: "shindansho-kaitekurenai",
    title:
      "障害年金の診断書を医師が書いてくれない — 断られる理由は5つの型に分かれる。型別の対処と依頼文の完成形",
    metaTitle: "障害年金の診断書を医師が書いてくれないときの対処法",
    description:
      "障害年金の診断書を主治医に断られた場合の対処法を5つの理由別に解説。口頭での頼み方、依頼文、家族や支援職への相談、転院前の注意点を紹介します。",
    datePublished: "2026-07-20",
    dateModified: "2026-07-20",
  },
  {
    slug: "ninteibi-jigojusho",
    title: "障害認定日請求と事後重症請求の違い｜最大5年さかのぼるための条件",
    metaTitle: "障害認定日請求と事後重症請求の違い｜最大5年遡及の条件",
    description:
      "障害認定日請求と事後重症請求の違い、最大5年分の遡及、認定日頃の診断書が取れない場合の確認事項、額改定請求までわかりやすく解説します。",
    datePublished: NEW_COLUMN_DATES["ninteibi-jigojusho"],
    dateModified: "2026-07-19",
  },
  {
    slug: "shindansho-kakunin",
    title:
      "障害年金の診断書を受け取ったら確認すべき7つのポイント — 「実際より軽く書かれていた」を提出前に防ぐ",
    metaTitle: "障害年金の診断書を受け取ったら確認すべき7つのポイント",
    description:
      "障害年金の診断書が実際より軽いと感じる理由と、提出前に確認したい7つのポイントを解説。事実と異なる記載があったときの伝え方、更新時の注意も紹介します。",
    datePublished: NEW_COLUMN_DATES["shindansho-kakunin"],
    dateModified: "2026-07-19",
  },
  {
    slug: "techou-to-nenkin",
    title: "障害者手帳と障害年金の違い — 手帳の等級と年金の等級は別物です",
    description:
      "精神障害者保健福祉手帳と障害年金は、別の制度・別の審査です。手帳3級でも年金を受給できる場合があること、手帳がなくても年金申請できること、年金証書で手帳を取得できる制度を解説します。",
    datePublished: NEW_COLUMN_DATES["techou-to-nenkin"],
    dateModified: NEW_COLUMN_DATES["techou-to-nenkin"],
  },
  {
    slug: "shoubyou-teatekin",
    title: "傷病手当金と障害年金は同時にもらえる？併給調整と申請準備の流れ",
    metaTitle: "傷病手当金と障害年金は同時にもらえる？併給調整と申請準備",
    description:
      "傷病手当金と障害年金の併給調整、同じ傷病で受け取る場合の差額支給、遡及時の返還、休職中から始めたい障害年金の準備を解説します。",
    datePublished: NEW_COLUMN_DATES["shoubyou-teatekin"],
    dateModified: "2026-07-19",
  },
  {
    slug: "hattatsu-shougai",
    title:
      "発達障害（ADHD・ASD）で障害年金を申請する方法｜初診日・診断書・申立書",
    metaTitle: "発達障害（ADHD・ASD）の障害年金｜初診日・診断書・申立書",
    description:
      "発達障害で障害年金を申請する際の初診日の分岐、診断書の確認点、出生から書く申立書、就労中の伝え方、遡及・更新まで具体例付きで解説します。",
    datePublished: NEW_COLUMN_DATES["hattatsu-shougai"],
    dateModified: "2026-07-19",
  },
  {
    slug: "hatachi-mae",
    title:
      "20歳前傷病の障害基礎年金 — 納付要件を問われない特例と、10代の記録が大切な理由",
    metaTitle: "20歳前傷病の障害基礎年金 — 納付要件と10代の記録",
    description:
      "20歳前傷病による障害基礎年金を解説。納付要件が不要となる条件、請求時期、本人の所得による支給制限、10代の通院・学校記録を残す理由を紹介します。",
    datePublished: NEW_COLUMN_DATES["hatachi-mae"],
    dateModified: "2026-07-19",
  },
  {
    slug: "fushikyuu-shinsa-seikyu",
    title:
      "障害年金が不支給になったら｜審査請求・再審査請求・再請求の選び方",
    metaTitle: "障害年金が不支給になったときの審査請求・再審査請求・再請求",
    description:
      "障害年金の不支給後に選べる審査請求、再審査請求、再請求の違いと期限、不支給理由の確認方法、書類を立て直す手順を解説します。",
    datePublished: NEW_COLUMN_DATES["fushikyuu-shinsa-seikyu"],
    dateModified: "2026-07-19",
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
  },
  {
    slug: "hatarakinagara",
    title: "働きながら障害年金はもらえる？「働ける＝改善」と誤解されない伝え方",
    metaTitle: "働きながら障害年金はもらえる？就労実態の伝え方",
    description:
      "働きながら障害年金を受給する際に、就労実態、職場の配慮、欠勤、帰宅後の生活を診断書・申立書へ反映する方法を具体例付きで解説します。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-19",
  },
  {
    slug: "nofu-yoken",
    title:
      "障害年金の保険料納付要件とは — 未納があると受け取れない?3分の2要件と直近1年の特例",
    metaTitle: "障害年金の保険料納付要件とは — 3分の2要件と直近1年の特例",
    description:
      "障害年金には保険料納付要件があります。3分の2要件と直近1年特例のしくみ、免除・学生納付特例の扱い、初診日より後に納めても間に合わない理由、納付状況の確認方法を解説します。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-17",
  },
  {
    slug: "shoshinbi-wakaranai",
    title:
      "障害年金の初診日がわからないときの調べ方｜証明できない場合も解説",
    description:
      "障害年金を申請したいものの初診日がわからない場合の調べ方を解説します。病院、診察券、お薬手帳、健康保険の記録など、確認の手がかりを順番に紹介します。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-30",
  },
  {
    slug: "moushitatesho-kakikata",
    title:
      "病歴・就労状況等申立書の書き方【精神疾患】受給者・実務者の発信から学ぶ、審査で落ちる書き方・伝わる書き方(期間別フル記入例つき)",
    metaTitle:
      "病歴・就労状況等申立書の書き方【精神疾患】審査で落ちる書き方・伝わる書き方",
    description:
      "病歴・就労状況等申立書の書き方を、障害年金の受給者・実務者がXで発信し続けている「実際に差がつくポイント」の分析から解説。うつ病の発病から現在までの期間別フル記入例、就労欄の落とし穴、未受診期間の扱い、よくある質問まで。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-19",
  },
  {
    slug: "moushitatesho-a4-insatsu",
    title: "障害年金の申立書をA4で印刷する方法｜PDF・コンビニ印刷も解説",
    description:
      "障害年金の病歴・就労状況等申立書をA4用紙へ印刷する方法を解説します。自宅、スマートフォン、コンビニでの印刷手順や、印刷後の確認点も紹介します。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-30",
  },
  {
    slug: "shinsatsu-mae-memo",
    title:
      "診察で「大丈夫です」と言ってしまう人へ — 受給者・実務者の発信から学ぶ、診断書に生活の実態を反映させる診察前メモ(A4一枚の完成形つき)",
    metaTitle:
      "診察で「大丈夫です」と言ってしまう人へ — 生活実態を伝える診察前メモ",
    description:
      "「診断書が実際より軽かった」は申請者が最も多く語る後悔のひとつ。診察の数分で生活実態を伝える診察前メモの作り方を、障害年金の当事者・実務者のX発信の分析から解説。A4一枚の完成形、渡し方、更新(障害状態確認届)での使い方まで。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-19",
  },
];

export const COLUMNS_BY_DATE = [...COLUMNS].sort(
  (a, b) =>
    b.datePublished.localeCompare(a.datePublished) ||
    b.dateModified.localeCompare(a.dateModified),
);

export function getColumn(slug: string): Column {
  const column = COLUMNS.find((c) => c.slug === slug);
  if (!column) {
    throw new Error(`コラム記事が見つかりません: ${slug}`);
  }
  return column;
}

export function columnJsonLd(column: Column) {
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
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "トップ",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "コラム",
            item: `${SITE_URL}/columns`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: column.title,
            item: `${SITE_URL}/columns/${column.slug}`,
          },
        ],
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
