import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AppStoreBadge from "@/components/AppStoreBadge";
import { COLUMNS_BY_DATE, formatDate } from "@/lib/columns";
import {
  APP_STORE_URL,
  AUTHOR_NAME,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

const PAGE_TITLE =
  "障害年金申請サポート｜日々のメモが診察メモと申立書になるアプリ";
const PAGE_DESCRIPTION =
  "障害年金の申請準備を自分で進めるためのiOSアプリ。日々のひとことメモから、診察で見せられる1枚と申立書の下書きを作成。費用を抑えて、受給の可能性を高める準備を。";

export const metadata: Metadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

// 差し替え可能なスクリーンショットのパス。画像は public/app/ 配下。
const SHOT = {
  home: "/app/screenshot-home.png",
  hitokotoMemo: "/app/screenshot-hitokoto-memo.png",
  shinsatsuMemo: "/app/screenshot-shinsatsu-memo.png",
  moushitatesho: "/app/screenshot-moushitatesho.png",
  kuichigai: "/app/screenshot-kuichigai.png",
} as const;

const FEATURES = [
  {
    title: "ひとことメモ",
    body:
      "単語ひとつでも保存できます。保存すると自動で日時が付き、記録した瞬間の日時がそのまま記録の力になります。",
    image: SHOT.hitokotoMemo,
    alt: "つらいことを短いメモで記録する画面",
  },
  {
    title: "診察メモ",
    body:
      "貯まったメモから、先生が約60〜90秒で読める1枚を作成し、印刷して診察に持っていけます。日常が伝わるほど、診断書にあなたの実態が反映されます。",
    image: SHOT.shinsatsuMemo,
    alt: "診察で見せられる1枚のメモを確認する画面",
  },
  {
    title: "申立書",
    body:
      "病歴・就労状況等申立書を、記録をもとに公式様式で作成・印刷できます。診断書と食い違いのない内容に整えられます。",
    image: SHOT.moushitatesho,
    alt: "病歴・就労状況等申立書を順番に作成する画面",
  },
  {
    title: "食い違いチェック",
    body:
      "診断書を受け取ったあと、申立書との間で食い違って見える箇所を確認できます。",
    image: SHOT.kuichigai,
    alt: "診断書と申立書の食い違いを確認する画面",
  },
  {
    title: "申請ガイド",
    body: "初診日の確認から提出までの手順を、順番に進められます。",
    image: SHOT.home,
    alt: "申請の流れとやることリストを表示するホーム画面",
  },
] as const;

const FAQS = [
  {
    question: "無料で使えますか？",
    answer: "無料で始められます。AIによる文章作成には月間の無料枠があります。",
  },
  {
    question: "Androidには対応していますか？",
    answer: "現在はiOSのみです。",
  },
  {
    question: "記録した内容はどこに保存されますか？",
    answer:
      "記録は端末内に保存されます。AI機能の利用時のみ、同意のうえで対象の文章を送信します。",
  },
  {
    question: "毎日記録しないといけませんか？",
    answer:
      "いいえ。書けない日があっても大丈夫です。単語ひとつのメモでも、日時つきの記録として残ります。",
  },
  {
    question: "専門家に依頼するか迷っています。",
    answer:
      "初診日の証明が難しい場合や審査請求が必要な場合は、専門家への相談をおすすめします。まず自分で準備を進めたい方に、このアプリは向いています。",
  },
] as const;

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
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#application`,
      name: SITE_NAME,
      description: PAGE_DESCRIPTION,
      operatingSystem: "iOS 15.1以降",
      applicationCategory: "LifestyleApplication",
      inLanguage: "ja-JP",
      url: `${SITE_URL}/`,
      downloadUrl: APP_STORE_URL,
      sameAs: APP_STORE_URL,
      // 基本機能は無料、プレミアムプランは月額600円のサブスクリプション
      offers: [
        {
          "@type": "Offer",
          name: "基本機能(無料)",
          price: "0",
          priceCurrency: "JPY",
        },
        {
          "@type": "Offer",
          name: "プレミアムプラン(月額・自動更新)",
          price: "600",
          priceCurrency: "JPY",
        },
      ],
      creator: {
        "@type": "Person",
        name: AUTHOR_NAME,
      },
    },
  ],
};

const faq = faqJsonLd(
  FAQS.map((f) => ({ question: f.question, answer: f.answer })),
);

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />

      {/* 1. ヒーロー */}
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <p className="lp-eyebrow">{SITE_NAME}｜iOSアプリ</p>
          <h1 className="lp-hero-title">
            障害年金の申請、
            <br />
            <span className="lp-marker">ひとりで抱えていませんか。</span>
          </h1>
          <p className="lp-hero-sub">
            専門家に頼むか、自分でやるか。費用を考えて迷っているなら——
            日々のひとことメモから申請の準備を整えられるアプリがあります。
          </p>
          <div className="lp-cta">
            <AppStoreBadge href={APP_STORE_URL} />
            <p className="lp-cta-note">無料で始められます（iOS）</p>
          </div>
        </div>
        <div className="lp-hero-shot">
          <Image
            className="lp-shot-image"
            src={SHOT.home}
            alt="障害年金申請サポートのホーム画面"
            width={1242}
            height={2688}
            sizes="(max-width: 720px) 70vw, 320px"
            priority
          />
        </div>
      </section>

      {/* 2. 課題（審査のしくみ） */}
      <section className="lp-section" aria-labelledby="lp-problem-heading">
        <p className="lp-section-label">審査のしくみ</p>
        <h2 id="lp-problem-heading" className="lp-heading">
          審査で大切なのは、
          <span className="lp-marker">日常の実態</span>
          が書類に載ることです
        </h2>
        <p>
          障害年金の審査は、提出された書類で行われます。中心になるのは、
          主治医が書く診断書です。診断書には日常生活について先生が記入する欄が
          ありますが、先生が知っているのは診察室でのあなただけ。日常の様子は、
          伝えなければ診断書に反映されません。ここが、受給の可能性を左右する
          分かれ目になります。
        </p>
      </section>

      {/* 3. 解決（3ステップ） */}
      <section className="lp-section" aria-labelledby="lp-steps-heading">
        <p className="lp-section-label">使い方</p>
        <h2 id="lp-steps-heading" className="lp-heading">
          日々のひとことが、申請の準備になります
        </h2>
        <ol className="lp-steps">
          <li className="lp-step">
            <span className="lp-step-num" aria-hidden="true">
              1
            </span>
            <span className="lp-step-body">
              <span className="lp-step-text">つらいとき、ひとことメモ</span>
              <span className="lp-step-note">単語ひとつでも</span>
            </span>
          </li>
          <li className="lp-step">
            <span className="lp-step-num" aria-hidden="true">
              2
            </span>
            <span className="lp-step-body">
              <span className="lp-step-text">
                診察前に、先生が約60〜90秒で読める1枚に
              </span>
              <span className="lp-step-note">印刷して持っていけます</span>
            </span>
          </li>
          <li className="lp-step">
            <span className="lp-step-num" aria-hidden="true">
              3
            </span>
            <span className="lp-step-body">
              <span className="lp-step-text">
                貯まった記録から、申立書の下書きに
              </span>
              <span className="lp-step-note">公式と同じ形式で印刷</span>
            </span>
          </li>
        </ol>
        <p className="small-note lp-steps-note">
          毎日書く必要はありません。書けない日があっても大丈夫です。
        </p>
      </section>

      {/* 4. 機能紹介 */}
      <section className="lp-section" aria-labelledby="lp-features-heading">
        <p className="lp-section-label">機能</p>
        <h2 id="lp-features-heading" className="lp-heading">
          アプリでできること
        </h2>
        <div className="lp-features">
          {FEATURES.map((f, i) => (
            <article key={f.title} className="lp-feature">
              <div className="lp-feature-shot">
                <Image
                  className="lp-shot-image"
                  src={f.image}
                  alt={f.alt}
                  width={1242}
                  height={2688}
                  sizes="(max-width: 720px) 60vw, 280px"
                />
              </div>
              <div className="lp-feature-copy">
                <h3>
                  <span className="lp-feature-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {f.title}
                </h3>
                <p>{f.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. 費用 */}
      <section className="lp-section" aria-labelledby="lp-price-heading">
        <p className="lp-section-label">費用</p>
        <h2 id="lp-price-heading" className="lp-heading">
          費用を抑えて、準備を進められます
        </h2>
        <p>
          専門家への依頼には、まとまった費用がかかることがあります。
          このアプリは無料で始められ、必要な準備の多くを自分のペースで
          進められます。
        </p>
        <div className="lp-price-cards">
          <div className="lp-price-card">
            <p className="lp-price-name">基本機能</p>
            <p className="lp-price-amount">無料</p>
            <ul>
              <li>記録・診察前メモ・申立書の下書き</li>
              <li>書類の表示・印刷</li>
              <li>AIの文章整理は月75回まで</li>
            </ul>
          </div>
          <div className="lp-price-card">
            <p className="lp-price-name">プレミアムプラン</p>
            <p className="lp-price-amount">
              月額600円
              <span className="lp-price-unit">（自動更新）</span>
            </p>
            <ul>
              <li>AIの文章整理が無制限</li>
              <li>書類のPDF保存・共有</li>
              <li>記録のバックアップ</li>
            </ul>
            <p className="lp-price-note">いつでも解約できます。</p>
          </div>
        </div>
      </section>

      {/* 6. 安心して使えるように */}
      <section className="lp-section" aria-labelledby="lp-safety-heading">
        <p className="lp-section-label">プライバシー</p>
        <h2 id="lp-safety-heading" className="lp-heading">
          安心して使えるように
        </h2>
        <ul className="check-list">
          <li>ログイン・本名・メールアドレスは不要です</li>
          <li>記録はお使いの端末の中に保存されます</li>
          <li>
            AI機能を使うときだけ、同意のうえで対象の文章がサーバー経由で
            AIに送信されます(サーバーには本文を残さない方針です)
          </li>
        </ul>
      </section>

      {/* 7. できないこと */}
      <section className="lp-section" aria-labelledby="lp-cannot-heading">
        <p className="lp-section-label">正直にお伝えします</p>
        <h2 id="lp-cannot-heading" className="lp-heading">
          このアプリにできないこと
        </h2>
        <div className="note-box">
          <p>
            初診日を証明する書類の取得代行や、不支給となった場合の審査請求の
            支援は行いません。また、医療診断や、受給の可否・等級の判断を
            したり、お約束したりするものではありません。これらが必要な場合は、
            年金事務所や社会保険労務士などの専門家への相談をおすすめします。
          </p>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="lp-section" aria-labelledby="lp-faq-heading">
        <p className="lp-section-label">FAQ</p>
        <h2 id="lp-faq-heading" className="lp-heading">
          よくある質問
        </h2>
        <dl className="lp-faq">
          {FAQS.map((f) => (
            <div key={f.question} className="lp-faq-item">
              <dt>{f.question}</dt>
              <dd>{f.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 9. コラム */}
      <section className="lp-section" aria-labelledby="lp-columns-heading">
        <p className="lp-section-label">コラム</p>
        <h2 id="lp-columns-heading" className="lp-heading">
          制度を知りたい方へ、申請準備コラム
        </h2>
        <ul className="column-list lp-column-list">
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

      {/* 10. 最終CTA */}
      <section className="lp-final-cta" aria-labelledby="lp-final-heading">
        <h2 id="lp-final-heading">今日のひとことから、始められます</h2>
        <AppStoreBadge href={APP_STORE_URL} />
        <p className="lp-cta-note">無料で始められます（iOS）</p>
      </section>

      {/* モバイル追従フッターCTA */}
      <div className="lp-sticky-cta">
        <a
          className="lp-sticky-cta-button"
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer external"
        >
          App Storeで無料で始める
        </a>
      </div>
    </>
  );
}
