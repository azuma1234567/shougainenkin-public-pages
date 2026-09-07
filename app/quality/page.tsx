import type { Metadata } from "next";
import Link from "next/link";
import { CORRECTIONS } from "@/data/corrections";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";
import { QUALITY_METRICS } from "@/lib/quality";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

/* 原稿: docs/about-quality-support-2026-09-07-instructions.md §2。訂正の記録は data/corrections.ts から描く。 */

const DESCRIPTION =
  `出典の決まり、数字の決まり、引用の決まり、機械で検査していること、書かないこと、そして訂正の記録。${SITE_NAME}の記事と道具が、どう作られ、どう直されているかを書いています。`;

export const metadata: Metadata = pageMetadata({
  title: "情報の作り方と、訂正の記録",
  description: DESCRIPTION,
  path: "/quality",
});

const breadcrumb = breadcrumbJsonLd([
  { name: "トップ", path: "/" },
  { name: "情報の作り方", path: "/quality" },
]);

export default function QualityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <h1>情報の作り方</h1>

      <h2>出典の決まり</h2>
      <p>
        事実の出典にするのは、日本年金機構・厚生労働省・法令(e-Gov)・社会保険審査会の公開裁決の4つだけです。
      </p>
      <p>
        SNS・ブログ・体験談・伝聞は、「何が知られていないか」「どこでつまずくか」を知るためには読みますが、事実の出典にはしません。誰かが「こう言っていた」を、制度の説明として書くことはありません。
      </p>
      <p>
        各ページの末尾に、資料の名前と確認日を置いています。確認日が古くなったページは、年度改定のある毎年4月にまとめて見直します。
      </p>

      <h2>数字の決まり</h2>
      <p>
        金額(年金額・加算・所得制限の線・扶養の線)は、サイトの中の1か所で管理しています。記事も道具も、そこから同じ値を引きます。ページごとに違う数字が出ることを、仕組みで防いでいます。
      </p>
      <p>
        統計は、資料名と年度を必ず添えます。同じ「支給停止」でも、業務統計(全件)と認定状況調査(抽出)では値が違うので、混ぜません。
      </p>

      <h2>引用の決まり</h2>
      <p>
        国の基準(精神の障害に係る等級判定ガイドラインなど)を引くときは、原文のまま引きます。要約して意味を変えないためです。目安表の30のセルと、総合評価の引用25件は、原本のPDFと1字ずつ一致することを機械で検査しています。
      </p>

      <h2>機械で検査していること</h2>
      <p>人の目だけに頼らず、公開のたびに次を機械で検査しています。</p>
      <ul>
        <li>目安表と引用が、原本と1字一致すること</li>
        <li>金額が、管理している1か所の値と一致し、ページに直接書かれた数字が無いこと</li>
        <li>道具の中に、入力を送信するコード(fetch・XMLHttpRequest・sendBeacon・WebSocket・フォーム送信)が無いこと</li>
        <li>「あなたは◯級」「◯級相当」「通りそう」「もらえそう」のような、判定や予測に読める言葉が無いこと</li>
        <li>サイト内のリンクが切れていないこと、各ページに本文から2本以上のリンクが届いていること</li>
        <li>申立書の道具が、公式様式の座標どおりに印字し、紙に色が付かないこと</li>
      </ul>
      <p>検査に通らないものは公開しません。</p>

      <h2>書かないこと</h2>
      <ul>
        <li>「あなたは◯級」「受給できる」「難しい」。判定と予測は書きません。</li>
        <li>「◯割が受給」のような、根拠の無い確率。</li>
        <li>社会保険労務士の報酬の相場。公的な統計が無いためです(かかる費用の種類と、契約前に確認することは書いています)。</li>
        <li>体験談を、制度の事実として。</li>
        <li>調べるときに参考にした個人の発信(アカウント名や投稿)。参考にしても、出典にはしません。</li>
      </ul>

      <h2 id="corrections">訂正の記録</h2>
      <p>直したことは、ここに残します。消して無かったことにはしません。</p>
      <div className="article-table-wrap" tabIndex={0}>
        <table>
          <thead>
            <tr><th scope="col">日付</th><th scope="col">ページ</th><th scope="col">直したこと</th><th scope="col">理由</th></tr>
          </thead>
          <tbody>
            {CORRECTIONS.map((c) => (
              <tr key={`${c.date}-${c.path}`}>
                <td>{c.date}</td>
                <td>{c.page}(<Link href={c.path}>{c.path}</Link>{c.others ? " ほか" : ""})</td>
                <td>{c.what}</td>
                <td>{c.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>iPhoneアプリの知識について</h2>
      <p>
        アプリの相談機能は、サイトと同じ出典の決まりで作った制度情報 {QUALITY_METRICS.knowledgeUnits} 項目と、確認済みの出典 {QUALITY_METRICS.verifiedSources} 件をもとに答えます。確認できないことは「確認できません」と答え、受給の可否や等級は断定せず、年金事務所などをご案内します。答えには出典を表示します。
      </p>

      <h2>誤りのご連絡</h2>
      <p>
        情報の誤りにお気づきの場合は、
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        までお知らせください。病歴などの記載は不要です。
      </p>

      <h2>免責</h2>
      <p>
        最終的な確認は年金事務所・市区町村で行ってください。本サイトとアプリは、個別の受給可否や等級を判断するものではありません。
      </p>
    </>
  );
}
