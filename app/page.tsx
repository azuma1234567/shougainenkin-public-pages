import type { Metadata } from "next";
import Link from "next/link";
import AppStoreBadge from "@/components/AppStoreBadge";
import { COLUMNS_BY_DATE, formatDate } from "@/lib/columns";
import { APP_STORE_URL, SITE_NAME, SITE_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

const PAGE_TITLE =
  "障害年金の申請の流れと必要書類｜初めての方へ8ステップで解説";
const PAGE_DESCRIPTION =
  "障害年金の申請を何から始めればよいか、初診日の確認、納付要件、年金事務所への相談、必要書類、診断書、申立書、提出、結果待ちまで8ステップで分かりやすく解説します。";

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
    why: "初診日(その傷病で初めて医師にかかった日)は、保険料納付要件の判定期間も、障害基礎年金か障害厚生年金かも、障害認定日も決める起点です。ここがずれると、申請全体をやり直すことになる場合があります。",
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
      { href: "/columns/shoshinbi-wakaranai", label: "初診日がわからない・証明できないときの調べ方" },
      { href: "/columns/hatachi-mae", label: "20歳前の傷病による障害基礎年金" },
      { href: "/columns/hattatsu-shougai", label: "発達障害(ADHD・ASD)の初診日の考え方" },
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
      "ねんきんネットや年金事務所で、これまでの納付状況を確認できます。",
      "20歳前に初診日がある場合は、この要件は原則として問われません。",
    ],
    prepare: [
      "基礎年金番号がわかるもの",
      "ねんきんネットのアカウント(あれば)",
    ],
    mistakes: [
      "初診日より後に未納分を納めても、要件の判定には反映されない",
      "免除や学生納付特例を「未納」と思い込んで諦めてしまう",
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
    why: "障害年金の申請書類一式は、年金事務所や街角の年金相談センターで受け取ります。納付要件の確認もその場でできます。相談は無料です。",
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
      { href: "/columns/jibun-de-shinsei", label: "自分で申請するか、社会保険労務士に依頼するか" },
    ],
    linksNote:
      "年金事務所での相談そのものを扱う詳しい記事は準備中です。相談の予約方法や持ち物は、日本年金機構のホームページでもご確認いただけます。",
    next: "ステップ4: 必要書類をそろえる",
  },
  {
    id: "step-4",
    num: 4,
    title: "必要書類をそろえる",
    why: "障害年金の申請には複数の書類が必要です。初診の医療機関と診断書を書く医療機関が違う場合などは、追加の書類が要ります。早めに全体像をつかむと、後戻りが減ります。",
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
      { href: "/columns/shoshinbi-wakaranai", label: "受診状況等証明書・初診日の証明の集め方" },
    ],
    next: "ステップ5: 診断書の準備をする",
  },
  {
    id: "step-5",
    num: 5,
    title: "診断書の準備をする",
    why: "診断書は審査の中心になる書類です。とくに精神の障害では、日常生活の様子が診断書にどう書かれるかで結果が大きく変わります。医師が診察室で見えているのは、あなたの一部だけです。",
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
      { href: "/columns/shinsatsu-mae-memo", label: "生活の実態を伝える診察前メモの作り方" },
      { href: "/columns/shindansho-kakunin", label: "診断書を受け取ったら確認すべき7つのポイント" },
      { href: "/columns/shindansho-kaitekurenai", label: "診断書を医師が書いてくれないときの対処法" },
      { href: "/columns/nichijo-seikatsu-7koumoku", label: "診断書裏面「日常生活能力の判定」7項目" },
      { href: "/columns/tokyu-hantei-guideline", label: "精神の等級判定ガイドラインと目安表の読み方" },
    ],
    appCta: true,
    next: "ステップ6: 病歴・就労状況等申立書を作成する",
  },
  {
    id: "step-6",
    num: 6,
    title: "病歴・就労状況等申立書を作成する",
    why: "申立書は、自分で書く唯一の書類です。発病から現在までの生活・通院・就労の実態を、あなた自身の言葉で伝えられます。診断書と食い違わないように整えることも大切です。",
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
      { href: "/columns/moushitatesho-kikan-kugiri", label: "申立書「期間の区切り方」と続紙の使い方" },
      { href: "/columns/moushitatesho-a4-insatsu", label: "申立書はA4で出せる?用紙・PDF・印刷の実際" },
      { href: "/columns/hatarakinagara", label: "働きながら申請する場合の伝え方" },
    ],
    appCta: true,
    next: "ステップ7: 年金事務所へ提出する",
  },
  {
    id: "step-7",
    num: 7,
    title: "年金事務所へ提出する",
    why: "提出の前が、書類全体を見直せる最後の機会です。診断書と申立書の内容が食い違っていると、審査で不利になることがあります。",
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
      { href: "/columns/moushitatesho-a4-insatsu", label: "控えを残す理由と印刷のしかた" },
    ],
    next: "ステップ8: 結果を待つ",
  },
  {
    id: "step-8",
    num: 8,
    title: "結果を待つ",
    why: "提出後は日本年金機構で審査が行われます。結果が届くまでの目安は、おおむね3か月程度とされています(状況により前後します)。",
    todo: [
      "結果が届くのを待つ。結果は「年金証書」または「不支給決定通知書」などの形で届きます。",
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
      { href: "/columns/fushikyuu-shinsa-seikyu", label: "不支給になったら|審査請求・再審査請求・再請求" },
      { href: "/columns/ninteibi-jigojusho", label: "障害認定日請求と事後重症請求の違い" },
      { href: "/columns/sokyuu-seikyuu", label: "最大5年分をさかのぼる遡及請求の条件" },
    ],
    next: "",
  },
];

// アプリの現行仕様に沿ったメリットの短い紹介。
const APP_POINTS = [
  "初めての障害年金申請を、ひとつずつガイド",
  "いまの段階と、次にすることが分かる",
  "申請ガイドと日々の記録は無料。日々の記録は件数無制限",
  "診察メモは、主治医が約30秒で読めるまとめに",
  "診察メモ・申立書PDF・AI文章整理・食い違いチェック・バックアップは申請準備パック(買い切り2,980円)",
  "月額の支払いはありません",
];

const RELATED_COLUMNS = [
  { slug: "shoubyou-teatekin", label: "傷病手当金と障害年金は同時にもらえる?" },
  { slug: "techou-to-nenkin", label: "障害者手帳と障害年金の違い" },
  { slug: "taishou-shoubyou-kyoukai", label: "適応障害・不安障害・神経症は対象外?" },
  { slug: "shougaisha-koyou-nenkin", label: "障害者雇用で働きながら受給できる?" },
];

const LATEST_COLUMNS = COLUMNS_BY_DATE.slice(0, 4);

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
      // 申請ガイドと日々の記録は無料。申請準備パックは買い切り(月額なし)。
      offers: [
        {
          "@type": "Offer",
          name: "申請ガイド・日々の記録(無料)",
          price: "0",
          priceCurrency: "JPY",
        },
        {
          "@type": "Offer",
          name: "申請準備パック(買い切り)",
          price: "2980",
          priceCurrency: "JPY",
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
        <p className="guide-eyebrow">初めての障害年金申請ガイド</p>
        <h1 className="guide-h1">障害年金の申請の流れと必要書類</h1>
        <p className="guide-lead">
          障害年金の申請は、初診日の確認、保険料納付要件、年金事務所への相談、
          診断書、申立書など、複数の手続きを順番に進める必要があります。
        </p>
        <p className="guide-lead">
          初めて申請する方が「いま何をすればよいか」を確認できるように、
          申請から結果が届くまでを8つの段階に分けて案内します。
        </p>
        <div className="guide-cta-row">
          <a className="guide-btn guide-btn-primary" href="#steps">
            申請の流れを見る
          </a>
          <a
            className="guide-btn guide-btn-secondary"
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer external"
          >
            無料の申請ガイドをアプリで使う
          </a>
        </div>
      </section>

      {/* B. 最初に知っておきたいこと */}
      <section className="guide-section" aria-labelledby="guide-intro-heading">
        <h2 id="guide-intro-heading" className="guide-heading">
          最初に知っておきたいこと
        </h2>
        <div className="note-box">
          <ul className="guide-intro-list">
            <li>障害年金は、病名だけで決まる制度ではありません。</li>
            <li>
              初診日・保険料の納付要件・障害の状態など、いくつかの条件を確認する
              必要があります。
            </li>
            <li>必要な書類は、一人ひとりの状況によって変わります。</li>
            <li>正式な確認は、年金事務所や日本年金機構で行ってください。</li>
            <li>
              このサイトは一般的な情報提供であり、受給を保証するものではありません。
            </li>
          </ul>
        </div>
      </section>

      {/* C. 8ステップの全体図 */}
      <section className="guide-section" id="steps" aria-labelledby="guide-overview-heading">
        <h2 id="guide-overview-heading" className="guide-heading">
          申請の流れ 8ステップ
        </h2>
        <p>
          全体像です。各ステップをタップすると、下の詳しい説明へ移動します。
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

      {/* 受給後の案内(更新は結果待ちとは分けて案内する) */}
      <section className="guide-section" aria-labelledby="guide-after-heading">
        <h2 id="guide-after-heading" className="guide-heading">
          受給が決まったあとに
        </h2>
        <div className="note-box">
          <p>
            障害年金は、受け取り始めてからも、定期的な更新(障害状態確認届)が
            あります。受給後の手続きについては、こちらをご覧ください。
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
          申請の現在地と次にすることを、アプリで
        </h2>
        <p>
          「障害年金申請サポート」は、申請を代行するアプリではありません。
          いまの段階と次にすることを確認しながら、日々の記録・診察メモ・
          申立書の準備を、自分のペースで進めるための道具です。
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

      {/* コラム導線 */}
      <section className="guide-section" aria-labelledby="guide-columns-heading">
        <h2 id="guide-columns-heading" className="guide-heading">
          制度をもっと知りたい方へ
        </h2>
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
            コラム一覧を見る
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
