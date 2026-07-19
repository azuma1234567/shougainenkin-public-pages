import type { Metadata } from "next";
import Link from "next/link";
import AppStoreBadge from "@/components/AppStoreBadge";
import {
  APP_STORE_URL,
  AUTHOR_NAME,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

const PAGE_TITLE = "障害年金申請サポート｜申請準備・記録・申立書の下書きを支援";
const PAGE_DESCRIPTION =
  "障害年金の申請準備を、ひとつずつ。日々の困りごとを記録し、診察で医師に見せる資料や病歴・就労状況等申立書の下書き作成を支援するiPhoneアプリです。";

export const metadata: Metadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

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

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <section className="hero">
        <h1>{SITE_NAME}</h1>

        <p className="catchcopy">障害年金の申請準備を、ひとつずつ。</p>

        <p className="lead">
          日々の記録が、診察で医師に渡せる資料になり、申立書の下書きになる。
          ログイン不要・記録は端末の中に。申請準備のための記録・整理アプリです。
        </p>

      </section>

      <section className="app-store-section" aria-labelledby="app-store-heading">
        <h2 id="app-store-heading">障害年金申請サポートをApp Storeで公開中</h2>
        <p>
          日々の「困ったこと」を記録し、診察で医師に見せる資料や、
          病歴・就労状況等申立書の下書きづくりにつなげられるiPhoneアプリです。
        </p>
        <p className="small-note">無料・アプリ内課金あり</p>
        <p>
          <AppStoreBadge href={APP_STORE_URL} />
        </p>
      </section>

      <h2>こんな方のためのアプリです</h2>

      <p>
        障害年金の申請を考えているけれど、何から手をつければいいか分からない。
        日々の大変さを、診察や書類でうまく伝えられない。
        そんな方が、ひとりで抱え込まずに準備を進められるようにつくりました。
      </p>

      <h2>できること</h2>

      <div className="feature-cards">
        <section className="feature-card">
          <h3>
            <span className="feature-num">1</span>
            毎回の診察で医師に渡せる、あなたの生活の記録
          </h3>

          <p>
            医師があなたを診られるのは、診察室にいる短い時間だけです。
            このアプリでは、日々の煩わしかったこと・辛かったことを短いメモで残していくだけで、
            診察のたびに医師へ渡せる1枚の資料ができあがります。
          </p>
          <p>
            書けることが少ない日でも大丈夫。押さえておきたいところをAIが質問で引き出し、
            事実を変えずに、伝わる文章へ整えます。整えた文章は、必ずあなた自身が内容を
            確認してから保存される仕組みです。
          </p>
        </section>

        <section className="feature-card">
          <h3>
            <span className="feature-num">2</span>
            記憶をたどる申立書づくりを、AIが手助け
          </h3>

          <p>
            病歴・就労状況等申立書は、発病から現在までの出来事を期間ごとに書いていく書類で、
            1人で書き上げるのはとても大変です。忘れていることがあっても、AIが質問しながら
            記憶をたどるお手伝いをします。アプリの質問に順番に答えていくだけで下書きが形になり、
            提出を想定したフォーマットで印刷できます。
          </p>
        </section>

        <section className="feature-card">
          <h3>
            <span className="feature-num">3</span>
            いま自分がどの段階にいるか、一目でわかる
          </h3>

          <p>
            初診日の確認、保険料納付要件、年金事務所への相談、書類の準備、提出、結果の記録まで。
            自分がいまどのステップにいて、何がまだ済んでいないのかが、ホーム画面でいつでも
            分かります。
          </p>
        </section>
      </div>

      <p className="small-note">
        <Link href="/columns">コラム: 申請準備に役立つ記事</Link>
      </p>

      <h2>料金</h2>

      <p>
        基本機能(記録、診察前メモ、申立書の下書き、書類の表示・印刷)は無料です。
        AIによる文章の整えも、無料で月75回(1日25回)までご利用いただけます。
      </p>
      <p>
        もっと使いたい方のために、プレミアムプラン(月額600円・自動更新)をご用意しています。
        AIの利用が無制限になり、書類のPDF保存・共有、記録のバックアップが使えます。
        いつでも解約できます。
      </p>

      <h2>安心して使えるように</h2>

      <ul className="check-list">
        <li>ログイン・本名・メールアドレスは不要です</li>
        <li>記録はお使いの端末の中に保存されます</li>
        <li>
          AI機能を使うときだけ、対象の文章がサーバー経由でAIに送信されます
          (サーバーには本文を残さない方針です)
        </li>
      </ul>

      <h2>大切なお願い</h2>

      <div className="note-box">
        <p>
          このアプリは、障害年金申請の準備を補助する記録・整理ツールです。
          医療診断、治療方針の判断、年金受給の可否判断は行いません。
          本アプリの利用により受給が保証されるものではありません。
          申請内容は必ずご本人が確認し、必要に応じて医師・年金事務所・
          社会保険労務士などの専門家にご相談ください。
        </p>
      </div>
    </>
  );
}
