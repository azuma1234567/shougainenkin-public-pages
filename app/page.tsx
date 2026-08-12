import type { Metadata } from "next";
import Link from "next/link";
import AppStoreBadge from "@/components/AppStoreBadge";
import { COLUMNS_BY_DATE, formatDate } from "@/lib/columns";
import { APP_STORE_URL, SITE_NAME, SITE_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

const PAGE_TITLE =
  "障害年金の申請の流れと必要書類｜初めての方へ8ステップで解説【2026年度対応】";
const PAGE_DESCRIPTION =
  "障害年金の申請を何から始めればよいか、初診日の確認、納付要件、年金事務所への相談、必要書類、診断書、申立書、提出、結果待ちまで8ステップで解説します。令和8年度(2026年度)の年金額と、納付要件の特例が令和18年3月末まで延長された点にも対応。";

// 制度の数値を更新したら、この日付も必ず更新する(構造化データの dateModified と共用)。
const LAST_UPDATED = "2026-08-13";

export const metadata: Metadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

type StepLink = { href: string; label: string };

type Step = {
  id: string;
  num: number;
  title: string;
  why: string;
  todo: string[];
  prepare: string[];
  mistakes: string[];
  links: StepLink[];
  // 該当する詳しい記事がまだ無いステップ向けの注記(存在しないURLは作らない)
  linksNote?: string;
  appCta?: boolean;
  next: string;
};

const STEPS: Step[] = [
  {
    id: "step-1",
    num: 1,
    title: "初診日を確認する",
    why: "初診日(その傷病で初めて医師にかかった日)は、申請全体の「起点」です。保険料納付要件の判定期間も、障害基礎年金か障害厚生年金かも、障害認定日も、すべてここから決まります。ここがずれると申請をやり直すことになる場合があるので、最初にゆっくり確かめましょう。",
    todo: [
      "その傷病で初めて医師にかかった日を思い出す。",
      "転院している場合は、いちばん最初にかかった医療機関を確認する。",
      "精神疾患では、最初に相談した内科などが初診日になることもあります。",
    ],
    prepare: [
      "通院してきた医療機関の名前と、かかった時期のメモ",
      "健康保険証の使用履歴やお薬手帳など、受診の手がかりになるもの",
    ],
    mistakes: [
      "「いまの主治医にかかった日」を初診日と思い込む",
      "数年前の受診が初診日と気づかず、証明を取り損ねる",
    ],
    links: [
      {
        href: "/columns/shoshinbi-wakaranai",
        label: "障害年金の初診日がわからないときの調べ方",
      },
      {
        href: "/columns/shoshinbi-karute-nashi",
        label: "初診日のカルテがない・破棄されたときの証明方法と代替資料",
      },
      {
        href: "/columns/shoshinbi-haiin",
        label: "昔の病院が廃院しているときの調べ方と、行き先の探し方",
      },
      { href: "/columns/hatachi-mae", label: "20歳前の傷病による障害基礎年金" },
      { href: "/columns/hattatsu-shougai", label: "発達障害(ADHD・ASD)の初診日の考え方" },
      {
        href: "/columns/tekio-shogai-shogai-nenkin",
        label: "適応障害と診断された場合の初診日の確認",
      },
    ],
    next: "ステップ2: 保険料納付要件を確認する",
  },
  {
    id: "step-2",
    num: 2,
    title: "保険料納付要件を確認する",
    why: "障害年金は、初診日の前日までの保険料の納め方が一定の条件を満たしている必要があります。症状が重くても、この要件を満たさないと受け取れないことがあります。",
    todo: [
      "初診日の前日時点で「3分の2要件」か「直近1年要件」のどちらかを満たしているか確認する。",
      "直近1年要件(初診日の前々月までの1年間に未納がない)の特例は、初診日が令和18年(2036年)3月末日までで、初診日に65歳未満であることが条件です。以前は令和8年3月末までとされていましたが、10年延長されました。",
      "ねんきんネットや年金事務所で、これまでの納付状況を確認できます。",
      "20歳前の、年金制度に加入していない期間に初診日がある場合は、納付要件は問われません。",
    ],
    prepare: [
      "基礎年金番号がわかるもの",
      "ねんきんネットのアカウント(あれば)",
    ],
    mistakes: [
      "初診日より後に未納分を納めても、要件の判定には反映されない",
      "免除や学生納付特例を「未納」と思い込んで諦めてしまう",
      "「特例は令和8年3月で終わる」という古い情報のまま諦めてしまう(令和18年3月末まで延長されています)",
    ],
    links: [
      { href: "/columns/nofu-yoken", label: "保険料納付要件とは — 3分の2要件と直近1年の特例" },
      { href: "/columns/hatachi-mae", label: "納付要件が不要になる20歳前傷病の特例" },
    ],
    next: "ステップ3: 年金事務所へ相談・予約する",
  },
  {
    id: "step-3",
    num: 3,
    title: "年金事務所へ相談・予約する",
    why: "申請書類一式は、年金事務所や街角の年金相談センターで受け取ります。納付要件の確認もその場でできます。相談は無料で、何度でも大丈夫です。「まだ何も分からない」段階で行っても、ちゃんと案内してもらえます。",
    todo: [
      "最寄りの年金事務所へ電話などで相談を予約する。",
      "初診日・通院歴・いまの生活の様子を伝えられるよう、簡単なメモを持っていく。",
      "書類一式(年金請求書、診断書の様式、病歴・就労状況等申立書、受診状況等証明書の様式など)を受け取る。",
    ],
    prepare: [
      "基礎年金番号がわかるもの",
      "通院してきた医療機関と時期のメモ",
      "本人確認書類",
    ],
    mistakes: [
      "予約なしで行き、長く待つ・その日に相談できない",
      "聞きたいことを整理せずに行き、確認漏れが出る",
    ],
    links: [
      {
        href: "/columns/nenkin-jimusho-soudan",
        label: "年金事務所で相談するときの持ち物と、当日に聞かれること",
      },
      { href: "/columns/jibun-de-shinsei", label: "自分で申請するか、社会保険労務士に依頼するか" },
    ],
    next: "ステップ4: 必要書類をそろえる",
  },
  {
    id: "step-4",
    num: 4,
    title: "必要書類をそろえる",
    why: "障害年金の申請には複数の書類が必要です。初診の医療機関と診断書を書く医療機関が違う場合などは、追加の書類が要ります。最初に全体像をつかんでおくと、後戻りが減って、気持ちにも余裕が生まれます。",
    todo: [
      "年金事務所の案内に沿って、自分に必要な書類を確認する。",
      "主な書類:年金請求書 / 医師の診断書 / 病歴・就労状況等申立書 / 受診状況等証明書(初診と診断書の医療機関が異なる場合) / 基礎年金番号がわかるもの / 戸籍・住民票関係 / 受け取り口座がわかるもの / 配偶者や子がいる場合の関係書類。",
    ],
    prepare: [
      "書類を集めるためのチェックリスト",
      "受診状況等証明書が必要かどうかの確認(初診と診断書の病院が同じなら不要な場合があります)",
    ],
    mistakes: [
      "受診状況等証明書が必要なことに、後から気づく",
      "マイナンバーの記載で省略できる書類を、重ねて取り寄せてしまう",
    ],
    links: [
      {
        href: "/columns/hitsuyou-shorui-seishin",
        label: "精神疾患の必要書類チェックリスト — 入手先・費用・取得順序",
      },
      {
        href: "/columns/jushinjokyo-shomeisho",
        label: "受診状況等証明書とは — 病院への依頼方法と確認ポイント",
      },
      {
        href: "/columns/shoshinbi-wakaranai",
        label: "障害年金の初診日がわからないときの調べ方",
      },
    ],
    next: "ステップ5: 診断書の準備をする",
  },
  {
    id: "step-5",
    num: 5,
    title: "診断書の準備をする",
    why: "診断書は審査の中心になる書類です。とくに精神の障害では、日常生活の様子が診断書にどう書かれるかで結果が大きく変わります。医師が診察室で見えているのは、あなたの生活のごく一部です。だからこそ、ふだんの大変さを伝える準備に意味があります。",
    todo: [
      "年金事務所でもらった様式で、主治医に診断書を依頼する。",
      "障害認定日(原則、初診日から1年6か月を経過した日)時点、または現在の状態を書いてもらう。",
      "診察の前に、ふだんの生活の大変さを伝えるメモを用意しておくと、実態が伝わりやすくなります。",
    ],
    prepare: [
      "診断書の様式",
      "日常生活の困りごとをまとめたメモ",
      "これまでの通院の記録",
    ],
    mistakes: [
      "診察室で「大丈夫です」と言ってしまい、実態より軽く書かれる",
      "受け取った診断書を確認せず、そのまま提出してしまう",
    ],
    links: [
      {
        href: "/columns/shindansho-irai-timing",
        label: "障害年金の診断書はいつ頼む?依頼タイミングと準備",
      },
      {
        href: "/columns/shindansho-tanomikata",
        label: "診断書を主治医にどう頼む?— 切り出し方の台本と渡すメモ",
      },
      {
        href: "/columns/shindansho-ishi-ni-tsutaeru",
        label: "診断書で医師に伝えること全リスト — 6分野と言葉の例",
      },
      { href: "/columns/shinsatsu-mae-memo", label: "生活の実態を伝える診察前メモの作り方" },
      { href: "/columns/shindansho-kakunin", label: "診断書を受け取ったら確認すべき7つのポイント" },
      {
        href: "/columns/shindansho-jittai-chigau",
        label: "診断書が実態と違う・軽く書かれたときの対処",
      },
      { href: "/columns/shindansho-kaitekurenai", label: "診断書を医師が書いてくれないときの対処法" },
      { href: "/columns/nichijo-seikatsu-7koumoku", label: "診断書裏面「日常生活能力の判定」7項目" },
      { href: "/columns/hitorigurashi-furi", label: "障害年金は一人暮らしだと不利？日常生活能力の見られ方" },
      { href: "/columns/tokyu-hantei-guideline", label: "精神の等級判定ガイドラインと目安表の読み方" },
    ],
    appCta: true,
    next: "ステップ6: 病歴・就労状況等申立書を作成する",
  },
  {
    id: "step-6",
    num: 6,
    title: "病歴・就労状況等申立書を作成する",
    why: "申立書は、自分で書く唯一の書類です。発病から現在までの生活・通院・就労の実態を、あなた自身の言葉で伝えられる大切な機会でもあります。診断書と食い違わないように整えることも忘れずに。",
    todo: [
      "発病から現在までを、期間ごとに区切る。",
      "それぞれの期間の通院状況・日常生活・就労の様子を書く。",
      "一度に書こうとせず、メモを溜めてから整えるのがおすすめです。",
    ],
    prepare: [
      "通院してきた期間の一覧",
      "日々の困りごとのメモ",
      "働いていた時期の状況(勤務日数・休んだ日・職場の配慮など)",
    ],
    mistakes: [
      "期間の区切り方があいまいで、審査側が経過を追えない",
      "「働けている」ことだけが伝わり、実態より軽く見える書き方になる",
    ],
    links: [
      { href: "/columns/moushitatesho-kakikata", label: "病歴・就労状況等申立書の書き方【精神疾患】" },
      {
        href: "/columns/moushitatesho-kikan-kugiri",
        label: "申立書の期間はどう区切る?通院・就労・症状変化の書き方",
      },
      { href: "/columns/moushitatesho-mijushin-kikan", label: "申立書の未受診期間はどう書く？理由と生活状況の伝え方" },
      {
        href: "/columns/moushitatesho-a4-insatsu",
        label: "申立書をA4で印刷する方法 — PDF・コンビニ印刷の手順",
      },
      { href: "/columns/hatarakinagara", label: "働きながら申請する場合の伝え方" },
      {
        href: "/columns/kazoku-enjo-kakikata",
        label: "申立書に家族の援助をどう書く?— 具体例と書き分け",
      },
    ],
    appCta: true,
    next: "ステップ7: 年金事務所へ提出する",
  },
  {
    id: "step-7",
    num: 7,
    title: "年金事務所へ提出する",
    why: "提出の前が、書類全体を見直せる最後の機会です。診断書と申立書の内容が食い違っていると、審査で不利になることがあります。ここまで来たら、あと少しです。",
    todo: [
      "診断書と申立書の内容に、食い違いがないか確認する。",
      "必要書類がそろっているか、年金事務所の案内と照らし合わせる。",
      "控え(コピー)を手元に残してから、年金事務所などへ提出する。",
    ],
    prepare: [
      "そろえたすべての必要書類",
      "提出書類の控え(コピー)",
    ],
    mistakes: [
      "控えを残さず、あとで内容を確認できなくなる",
      "診断書と申立書の食い違いに気づかないまま提出してしまう",
    ],
    links: [
      { href: "/columns/shindansho-kakunin", label: "提出前に診断書を確認する7つのポイント" },
      {
        href: "/columns/shindansho-jittai-chigau",
        label: "診断書が実態と違うとき — 出す/出さないの判断",
      },
      {
        href: "/columns/moushitatesho-a4-insatsu",
        label: "印刷後に確認するポイントと、控えを残す理由",
      },
      {
        href: "/columns/teishutsusaki-yuusou",
        label: "書類はどこに提出する?— 窓口・郵送の使い分けと最終チェック",
      },
    ],
    next: "ステップ8: 結果を待つ",
  },
  {
    id: "step-8",
    num: 8,
    title: "結果を待つ",
    why: "提出後は日本年金機構で審査が行われます。日本年金機構が目標として公表している事務処理期間は、障害基礎年金が約3か月、障害厚生年金が約3か月半です。長く感じる期間ですが、ここまで来たら、待つことも「申請のうち」です。追加の照会が来たら、早めに対応しましょう。",
    todo: [
      "結果が届くのを待つ。結果は「年金証書・年金決定通知書」または「不支給決定通知書」などの形で届きます。",
      "審査の途中で、日本年金機構から書類の追加や確認の連絡が来ることがあります。届いたら早めに対応する。",
      "不支給や等級に納得できない場合は、期限内であれば審査請求という不服申立ての制度があります。",
    ],
    prepare: [
      "提出書類の控え",
      "届いた通知書の保管",
    ],
    mistakes: [
      "不支給の通知に、期限のある不服申立て(審査請求)ができることを知らずに諦める",
    ],
    links: [
      {
        href: "/columns/shinsei-kikan",
        label: "障害年金の申請結果はいつ届く?審査期間と結果待ちの過ごし方",
      },
      { href: "/columns/fushikyuu-shinsa-seikyu", label: "不支給になったら|審査請求・再審査請求・再請求" },
      { href: "/columns/ninteibi-jigojusho", label: "障害認定日請求と事後重症請求の違い" },
      { href: "/columns/sokyuu-seikyuu", label: "最大5年分をさかのぼる遡及請求の条件" },
      {
        href: "/columns/shinsa-shikumi-nintei-i",
        label: "審査は誰がどう行う?— 認定医と書類審査の仕組み",
      },
    ],
    next: "",
  },
];

// 令和8年度(2026年度)の年金額。出典は日本年金機構(更新日 2026年4月1日)。
// 令和8年4月分(令和8年6月支給分)から適用。数値を変えたら LAST_UPDATED も更新すること。
const AMOUNT_ROWS: { grade: string; kiso: string; kousei: string }[] = [
  {
    grade: "1級",
    kiso: "1,059,125円 + 子の加算額",
    kousei: "報酬比例の年金額 × 1.25 + 配偶者の加給年金額",
  },
  {
    grade: "2級",
    kiso: "847,300円 + 子の加算額",
    kousei: "報酬比例の年金額 + 配偶者の加給年金額",
  },
  {
    grade: "3級",
    kiso: "(対象外)",
    kousei: "報酬比例の年金額(最低保障額 635,500円)",
  },
];

// アプリの現行仕様に沿ったメリットの短い紹介。
// AI上限は src/lib(アプリ本体)の定数が正。数値を変えるときは規約・サポートと同時に直すこと。
const APP_POINTS = [
  "初めての障害年金申請を、ひとつずつガイド",
  "いまの段階と、次にすることが分かる",
  "申請ガイドと日々の記録は無料。日々の記録は件数無制限",
  "診察メモは、主治医が約30秒で読めるまとめに",
  "診察メモ・申立書PDF・AI文章整理・食い違いチェック・バックアップは伝えるプラン(月額・自動更新)",
  "AI機能は1契約期間につき合計700回まで。価格はApp Storeの表示が優先されます",
];

const RELATED_COLUMNS = [
  { slug: "shoubyou-teatekin", label: "傷病手当金と障害年金は同時にもらえる?" },
  { slug: "techou-to-nenkin", label: "障害者手帳と障害年金の違い" },
  {
    slug: "tekio-shogai-shogai-nenkin",
    label: "適応障害でも障害年金は申請できる?確認したいポイント",
  },
  { slug: "taishou-shoubyou-kyoukai", label: "適応障害・不安障害・神経症は対象外?" },
  { slug: "shougaisha-koyou-nenkin", label: "障害者雇用で働きながら受給できる?" },
];

const LATEST_COLUMNS = COLUMNS_BY_DATE.slice(0, 4);

// 構造化データ(FAQPage)と画面表示の両方で使う。数値は本文と必ずそろえること。
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "障害年金の申請にはどのくらい時間がかかりますか?",
    a: "書類をそろえる期間は人によって異なりますが、提出後の審査について日本年金機構が目標として公表している事務処理期間は、障害基礎年金が約3か月、障害厚生年金が約3か月半です。診断書の作成や初診日の証明に時間がかかると、準備段階だけで数か月かかることもあります。",
  },
  {
    q: "保険料に未納があると障害年金は受けられませんか?",
    a: "初診日の前日時点で、加入期間の3分の2以上が納付済み・免除済みであれば要件を満たします。これを満たさない場合でも、初診日が令和18年3月末日までで初診日に65歳未満であれば、初診日がある月の前々月までの直近1年間に未納がなければよいという特例があります。また、20歳前の年金制度に加入していない期間に初診日がある場合は、納付要件は問われません。",
  },
  {
    q: "障害年金はいくら受け取れますか?",
    a: "令和8年度(2026年度)の障害基礎年金は、1級が年額1,059,125円、2級が年額847,300円です(昭和31年4月2日以後生まれの方)。子がいる場合は2人目まで1人につき243,800円、3人目以降は1人につき81,300円が加算されます。障害厚生年金はこれに報酬比例の年金額が上乗せされ、金額は加入期間と報酬によって一人ひとり異なります。",
  },
  {
    q: "病名が決まっていれば障害年金は受け取れますか?",
    a: "受け取れるとは限りません。障害年金は病名だけで決まる制度ではなく、初診日、保険料の納付要件、障害認定日時点および現在の障害の状態という複数の条件で判断されます。とくに精神の障害では、日常生活能力がどの程度制限されているかが診断書でどう書かれるかが結果に影響します。",
  },
  {
    q: "不支給になったらもう受け取れませんか?",
    a: "決定に納得できない場合は、期限内であれば審査請求という不服申立ての制度があります。また、その後に症状が悪化した場合は、事後重症請求として改めて請求することもできます。事後重症請求の請求書は、65歳の誕生日の前々日までに提出する必要があります。",
  },
];

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      inLanguage: "ja-JP",
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: `${SITE_URL}/`,
      name: "障害年金の申請の流れと必要書類",
      description: PAGE_DESCRIPTION,
      inLanguage: "ja-JP",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@type": "Thing", name: "障害年金の申請" },
      dateModified: LAST_UPDATED,
    },
    {
      "@type": "HowTo",
      "@id": `${SITE_URL}/#howto`,
      name: "障害年金の申請の流れ(8ステップ)",
      inLanguage: "ja-JP",
      step: STEPS.map((s) => ({
        "@type": "HowToStep",
        position: s.num,
        name: s.title,
        url: `${SITE_URL}/#${s.id}`,
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      inLanguage: "ja-JP",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#application`,
      name: SITE_NAME,
      description:
        "障害年金の申請の現在地と次にすることを確認し、日々の記録・診察メモ・申立書の準備を進めるためのiOSアプリ。",
      operatingSystem: "iOS 15.1以降",
      applicationCategory: "LifestyleApplication",
      inLanguage: "ja-JP",
      url: `${SITE_URL}/`,
      downloadUrl: APP_STORE_URL,
      sameAs: APP_STORE_URL,
      // 申請ガイドと日々の記録は無料。伝えるプランは月額の自動更新サブスクリプション。
      // 価格は storekit/Subscription.storekit の displayPrice と一致させること。
      // ここに入れるのは「はじめて割」の導入価格ではなく通常価格(880円)。
      offers: [
        {
          "@type": "Offer",
          name: "申請ガイド・日々の記録(無料)",
          price: "0",
          priceCurrency: "JPY",
        },
        {
          "@type": "Offer",
          name: "伝えるプラン(月額・自動更新)",
          price: "880",
          priceCurrency: "JPY",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "880",
            priceCurrency: "JPY",
            billingDuration: 1,
            billingIncrement: 1,
            unitCode: "MON",
          },
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* A. ファーストビュー */}
      <section className="guide-hero">
        <p className="guide-eyebrow">はじめての障害年金申請ガイド</p>
        <h1 className="guide-h1">障害年金の申請の流れと必要書類</h1>
        <p className="guide-h1-sub">
          <span className="guide-h1-marker">「いま、なにをすればいいか」</span>
          がわかる<span style={{ whiteSpace: "nowrap" }}>8ステップ</span>
        </p>
        <p className="guide-lead">
          体調がすぐれないなかで、慣れない制度や書類に向き合うのは、それだけで力のいることです。
          このページは、はじめて障害年金を申請する方が「いま、なにをすればいいか」をひとつずつ確かめられるように、
          初診日の確認から結果が届くまでを8つのステップに分けて案内します。
        </p>
        <p className="guide-lead">
          むずかしい言葉はできるだけかみくだいて。内容は、日本年金機構の公表情報にもとづいて正確に。
          一度に読み切る必要はありません。あなたのいまの段階から、あなたのペースでどうぞ。
        </p>
        <div className="guide-cta-row">
          <a className="guide-btn guide-btn-primary" href="#steps">
            8つのステップを見る
          </a>
          <a
            className="guide-btn guide-btn-secondary"
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer external"
          >
            無料アプリでガイドを使う
          </a>
        </div>
        <dl className="guide-facts">
          <div className="guide-fact">
            <dt>ステップ</dt>
            <dd className="guide-fact-value">
              8<span className="guide-fact-unit">段階</span>
            </dd>
            <dd className="guide-fact-note">初診日の確認から結果が届くまで</dd>
          </div>
          <div className="guide-fact">
            <dt>審査の目安</dt>
            <dd className="guide-fact-value">
              約3<span className="guide-fact-unit">か月</span>
            </dd>
            <dd className="guide-fact-note">障害厚生年金は約3か月半</dd>
          </div>
          <div className="guide-fact">
            <dt>納付要件の特例</dt>
            <dd className="guide-fact-value">
              令和18<span className="guide-fact-unit">年3月末まで</span>
            </dd>
            <dd className="guide-fact-note">10年延長されました</dd>
          </div>
        </dl>
        <p className="guide-updated small-note">
          最終更新:{" "}
          <time dateTime={LAST_UPDATED}>{formatDate(LAST_UPDATED)}</time>
          ／令和8年度(2026年度)の年金額に対応
        </p>
      </section>

      {/* 信頼ストリップ */}
      <div className="guide-trust" role="note" aria-label="このサイトについて">
        <div className="guide-trust-inner">
          <p className="guide-trust-item">
            <span className="guide-trust-mark" aria-hidden="true">
              ✓
            </span>
            数値・制度はすべて日本年金機構の公表情報にもとづき、出典を明記しています
          </p>
          <p className="guide-trust-item">
            <span className="guide-trust-mark" aria-hidden="true">
              ✓
            </span>
            受給を保証したり、不安をあおったりしません。正式な確認先も必ず案内します
          </p>
          <p className="guide-trust-item">
            <span className="guide-trust-mark" aria-hidden="true">
              ✓
            </span>
            当事者に伴走するために、個人で開発・運営しています(
            <Link href="/about">運営者情報</Link>)
          </p>
        </div>
      </div>

      {/* B. はじめに、知っておいてほしいこと */}
      <section className="guide-section" aria-labelledby="guide-intro-heading">
        <h2 id="guide-intro-heading" className="guide-heading">
          はじめに、知っておいてほしいこと
        </h2>
        <div className="note-box">
          <ul className="guide-intro-list">
            <li>
              障害年金は、病名だけで決まる制度ではありません。
              <strong>初診日・保険料の納付・障害の状態</strong>
              という条件を、順番に確認していきます。
            </li>
            <li>
              必要な書類は、一人ひとりの状況によって変わります。このページは、
              迷わないための<strong>「全体の地図」</strong>としてお使いください。
            </li>
            <li>
              正式な確認は、年金事務所や日本年金機構で行ってください。相談は無料で、
              何度でもできます。
            </li>
            <li>
              このサイトは一般的な情報提供であり、受給を保証するものではありません。
              だからこそ、「知らなかった」で損をしないための情報を、ていねいにまとめています。
            </li>
          </ul>
        </div>
      </section>

      {/* B2. 受け取れる金額の目安 */}
      <section className="guide-section" aria-labelledby="guide-amount-heading">
        <p className="guide-section-tag">令和8年度(2026年度)</p>
        <h2 id="guide-amount-heading" className="guide-heading">
          受け取れる金額の目安
        </h2>
        <p>
          これからの生活を考えるうえで、まず気になるところだと思います。
          障害基礎年金は等級ごとに決まった額、障害厚生年金は加入期間と報酬に応じて
          一人ひとり変わります(令和8年4月分・6月支給分から)。
        </p>
        <div className="article-table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">等級</th>
                <th scope="col">障害基礎年金(年額)</th>
                <th scope="col">障害厚生年金(年額)</th>
              </tr>
            </thead>
            <tbody>
              {AMOUNT_ROWS.map((row) => (
                <tr key={row.grade}>
                  <th scope="row">{row.grade}</th>
                  <td>{row.kiso}</td>
                  <td>{row.kousei}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="guide-block-list">
          <li>
            障害基礎年金の額は昭和31年4月2日以後生まれの方のものです。
            それ以前に生まれた方は1級1,056,125円・2級844,900円になります。
          </li>
          <li>
            子の加算額は、2人目まで1人につき243,800円、3人目以降は1人につき81,300円です。
          </li>
          <li>
            障害厚生年金の配偶者加給年金額は243,800円、3級の最低保障額は635,500円
            (昭和31年4月1日以前生まれの方は633,700円)です。
          </li>
        </ul>
        <p className="small-note">
          出典:
          日本年金機構「障害基礎年金の受給要件・請求時期・年金額」「障害厚生年金の受給要件・請求時期・年金額」(2026年4月1日更新)
        </p>
      </section>

      {/* C. 8ステップの全体図 */}
      <section className="guide-section" id="steps" aria-labelledby="guide-overview-heading">
        <h2 id="guide-overview-heading" className="guide-heading">
          申請の流れ 8ステップ
        </h2>
        <p>
          全体像です。いまの自分がどのあたりにいるか、確かめながら進めてください。
          各ステップから詳しい説明へ移動できます。
        </p>
        <ol className="guide-overview">
          {STEPS.map((step) => (
            <li key={step.id}>
              <a href={`#${step.id}`}>
                <span className="guide-overview-num" aria-hidden="true">
                  {step.num}
                </span>
                <span className="guide-overview-text">{step.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* D. 各ステップの詳細 */}
      <div className="guide-steps">
        {STEPS.map((step) => (
          <section
            key={step.id}
            id={step.id}
            className="guide-step"
            aria-labelledby={`${step.id}-title`}
          >
            <div className="guide-step-head">
              <span className="guide-step-num" aria-hidden="true">
                {step.num}
              </span>
              <div>
                <p className="guide-step-label">ステップ{step.num}</p>
                <h2 id={`${step.id}-title`} className="guide-step-title">
                  {step.title}
                </h2>
              </div>
            </div>

            <div className="guide-block">
              <p className="guide-block-label">なぜ必要か</p>
              <p>{step.why}</p>
            </div>

            <div className="guide-block">
              <p className="guide-block-label">この段階ですること</p>
              <ul className="guide-block-list">
                {step.todo.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="guide-block">
              <p className="guide-block-label">準備するもの</p>
              <ul className="guide-block-list">
                {step.prepare.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="guide-block">
              <p className="guide-block-label">よくある間違い</p>
              <ul className="guide-block-list">
                {step.mistakes.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>

            {step.links.length > 0 && (
              <div className="guide-block">
                <p className="guide-block-label">詳しく知りたいとき</p>
                <ul className="guide-links">
                  {step.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step.linksNote && (
              <p className="guide-links-note small-note">{step.linksNote}</p>
            )}

            {step.appCta && (
              <div className="guide-inline-cta">
                <p className="guide-inline-cta-title">
                  アプリで準備を進められます
                </p>
                <p>
                  この段階の準備は、無料の申請ガイドアプリでも進められます。
                  日々の記録が診察メモや申立書の下書きになります。
                </p>
                <p>
                  <a
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer external"
                  >
                    無料の申請ガイドをアプリで使う(App Store)
                  </a>
                </p>
              </div>
            )}

            {step.next && (
              <p className="guide-next">
                <a href={`#${step.id.replace(/\d+$/, (n) => String(Number(n) + 1))}`}>
                  次へ {step.next}
                </a>
              </p>
            )}
          </section>
        ))}
      </div>

      {/* しんどくなったら */}
      <section className="guide-breather" aria-labelledby="guide-breather-heading">
        <h2 id="guide-breather-heading">申請の途中で、しんどくなったら</h2>
        <p>
          書類集めの途中で疲れてしまう日があるのは、あなただけではありません。
          書類は逃げません。小さく分けて、休みながらで大丈夫です。
        </p>
        <p>
          →{" "}
          <Link href="/columns/shinsei-shindoi">
            「障害年金の申請がしんどい」— 疲れ果てない小分けの進め方
          </Link>
        </p>
      </section>

      {/* 受給後の案内(更新は結果待ちとは分けて案内する) */}
      <section className="guide-section" aria-labelledby="guide-after-heading">
        <h2 id="guide-after-heading" className="guide-heading">
          受給が決まったあとに
        </h2>
        <div className="note-box">
          <p>
            障害年金は、受け取り始めてからも定期的な更新(障害状態確認届)があります。
            落ち着いたころで構いませんので、更新の時期だけ頭の片隅に置いておいてください。
          </p>
          <p>
            →{" "}
            <Link href="/columns/koushin-kakuninhodo">
              障害年金の更新(障害状態確認届)— 時期と支給停止への備え
            </Link>
          </p>
        </div>
      </section>

      {/* アプリの導線(主役ではなく、申請準備を進めるための道具として) */}
      <section className="guide-app" aria-labelledby="guide-app-heading">
        <p className="guide-section-tag">申請準備の道具</p>
        <h2 id="guide-app-heading" className="guide-heading">
          申請の現在地と、次の一歩を、いつでも手元に
        </h2>
        <p>
          「障害年金申請サポート」は、申請を代行するアプリではありません。
          いまの段階と次にすることを確かめながら、日々の記録・診察メモ・
          申立書の準備を、自分のペースで進めるための道具です。ログイン不要で、
          記録は端末の中に残ります。
        </p>
        <ul className="guide-app-points">
          {APP_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <AppStoreBadge href={APP_STORE_URL} />
        <p className="guide-app-note small-note">
          iOS対応・ログイン不要。申請ガイドと日々の記録は無料で使えます。
        </p>
      </section>

      {/* よくある質問 */}
      <section className="guide-section" aria-labelledby="guide-faq-heading">
        <h2 id="guide-faq-heading" className="guide-heading">
          よくある質問
        </h2>
        <p className="guide-heading-sub small-note">
          多くの方が最初に不安に感じるポイントをまとめました。
        </p>
        <div className="guide-faq">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="guide-faq-item">
              <summary>{item.q}</summary>
              <p className="guide-faq-a">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* コラム導線 */}
      <section className="guide-section" aria-labelledby="guide-columns-heading">
        <h2 id="guide-columns-heading" className="guide-heading">
          もっと詳しく知りたいときに
        </h2>
        <p className="guide-heading-sub small-note">
          制度の境目や書類のつまずきどころは、コラムでひとつずつ掘り下げています。
        </p>
        <ul className="guide-related-links">
          {RELATED_COLUMNS.map((c) => (
            <li key={c.slug}>
              <Link href={`/columns/${c.slug}`}>{c.label}</Link>
            </li>
          ))}
        </ul>
        <ul className="column-list">
          {LATEST_COLUMNS.map((c) => (
            <li key={c.slug} className="column-card">
              <p className="meta-line">
                <time dateTime={c.datePublished}>
                  {formatDate(c.datePublished)}
                </time>
              </p>
              <p className="column-card-title">
                <Link href={`/columns/${c.slug}`}>{c.title}</Link>
              </p>
              <p className="small-note">{c.description}</p>
            </li>
          ))}
        </ul>
        <p className="lp-columns-more">
          <Link href="/columns" className="lp-columns-more-link">
            コラム一覧を見る(全{COLUMNS_BY_DATE.length}本)
          </Link>
        </p>
      </section>

      {/* 出典・免責 */}
      <div className="note-box">
        <p>
          ※本ページは一般的な情報提供です。必要書類や手続きの詳細は個別の状況により
          異なります。正式な内容は、日本年金機構の「
          <a
            href="https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/index.html"
            target="_blank"
            rel="noopener"
          >
            障害年金の制度
          </a>
          」および年金事務所でご確認ください。
        </p>
      </div>
    </>
  );
}
