import type { Metadata } from "next";
import Link from "next/link";
import MoushitateshoTool from "@/components/tools/MoushitateshoTool";
import AppCta from "@/components/AppCta";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import { SITE_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";

const UPDATED = "2026-09-04";
const PATH = "/dougu/moushitatesho";
const isPublished = isPublishedInternalPath(PATH);

const TITLE = "病歴・就労状況等申立書を、公式の様式にそのまま入力して印刷する";
const DESCRIPTION =
  "日本年金機構の様式(A3・続紙A4)に、パソコンの文字で記入した紙が出ます。元号は○、年月日は数字。記入していない欄は空欄のまま。入力内容はこの端末の中にだけ残ります。送信しません。";

/* 本文の Q&A と同じ文字列。構造化データ(FAQPage)にも使う。 */
const FAQ: { q: string; a: string }[] = [
  { q: "手書きと混ぜて出してもいいですか",
    a: "混ぜて出せます。入力していない欄は空欄のまま印刷されるので、印刷したあとにペンで書き足せます。" },
  { q: "日付の「日」が空欄のままですが、大丈夫ですか",
    a: "期間は月まで入力する作りなので、「日」は空欄のまま印刷します。書いていないことを埋めないためです。日まで書きたいときは、印刷してから手で書き足してください。" },
  { q: "続紙の番号はどうなりますか",
    a: "本紙の1〜5に続けて、続紙の左の欄に6、7…と通し番号が入ります。No. と 枚中 は、続紙があるときだけ数字が入ります(記載要領のとおり、1枚だけのときは空欄です)。" },
  { q: "入力した内容は保存されますか",
    a: "この端末のブラウザの中にだけ残ります。サーバーへは送りません。共用のパソコンを使うときは「この端末に残さない」を選べます。ファイルに書き出して別の端末で読み込むこともできます。" },
  { q: "スマートフォンでも印刷できますか",
    a: "画面は375pxの幅でも操作できます。印刷はA3が原寸です。家庭用のプリンターならA4に分割して印刷し、提出できるかは年金事務所に確認してください。" },
];

export const metadata: Metadata = {
  ...pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH }),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};

const jsonLd = [
  {
    "@context": "https://schema.org", "@type": "WebApplication",
    name: "病歴・就労状況等申立書をつくる",
    url: `${SITE_URL}${PATH}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
    description: DESCRIPTION,
  },
  {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question", name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

export default function Page() {
  return (
    <div className="platform mt-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mt-tool no-print">
        <Breadcrumb
          items={[{ href: "/", label: "トップ" }, { href: "/shinsei", label: "申請の流れ" }, { label: "申立書をつくる" }]}
          currentPath={PATH}
        />
        {/* 道具の上は3行まで。離脱を作らない(設計 §11) */}
        <h1 className="mt-page-h1">{TITLE}</h1>
        <p className="mt-page-lead">
          日本年金機構の様式（A3・続紙A4）に、パソコンの文字で記入した紙が出ます。<br />
          元号は○、年月日は数字。記入していない欄は空欄のままです。<br />
          入力内容はこの端末の中にだけ残ります。送信しません。
        </p>
      </div>

      <MoushitateshoTool />

      <div className="mt-tool no-print mt-about">
        <section>
          <h2>印刷した紙はこう見える</h2>
          <p>入力すると、公式の様式のこの位置に文字が入ります。<strong>名前や病名は架空のものです。</strong></p>
          <img src="/img/moushitatesho/sample-front.png" width={900} height={1272}
            alt="記入済みの病歴・就労状況等申立書の表面。発病日と初診日の元号に○が付き、年月日が空欄に入っている" />
        </section>

        <section>
          <h2>A4で印刷する・A3で印刷する</h2>
          <p>
            様式はA3です。原寸で出すならA3、家庭用のプリンターならA4に分割して印刷します。
            A4での出し方は <Link href="/columns/moushitatesho-a4-insatsu">申立書をA4で印刷する方法</Link> にまとめています。
          </p>
        </section>

        <section>
          <h2>期間が5つを超えたら</h2>
          <p>
            本紙に書けるのは5つまでです。6つ目からは公式の続紙（A4）に自動で送られ、
            左の欄に6、7…と通し番号が入ります。続紙1枚に11期間（表5・裏6）入ります。
            No. と 枚中 は、続紙があるときだけ数字が入ります。
          </p>
        </section>

        <section>
          <h2>控えを取る</h2>
          <p>
            提出する前に、同じものをもう1部印刷して手元に残してください。
            あとで年金事務所に問い合わせるときや、不服申立てをするときに、何を書いたかが分かります。
            入力した内容はファイルに書き出しておくこともできます。
          </p>
        </section>

        <section>
          <h2>よくある質問</h2>
          <dl className="mt-faq">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <AppCta ct="日々の記録から、この申立書の下書きを作る" />

        <p><Link href="/shinsei">申請の流れへ戻る</Link></p>
        <p className="dougu-app-link"><Link href="/app">同じ機能をアプリで続ける →</Link></p>
        <PageDate updated={UPDATED} />
      </div>
    </div>
  );
}
