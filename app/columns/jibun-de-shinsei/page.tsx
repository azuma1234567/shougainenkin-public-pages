import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter from "@/components/ColumnFooter";
import { columnJsonLd, columnMetadata, formatDate, getColumn } from "@/lib/columns";

const column = getColumn("jibun-de-shinsei");

export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }} />
      <Breadcrumb current={column.title} />
      <h1>障害年金は自分で申請できる?社労士に依頼する場合との違いと判断のポイント</h1>
      <p className="meta-line">
        公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}/ 最終更新日:{" "}
        <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time>
      </p>

      <ArticleToc />

      <p>障害年金の申請を調べていると、社会保険労務士(社労士)の事務所のサイトが多く見つかります。「専門家に頼まないと通らないのだろうか」と不安になる方もいるかもしれません。</p>
      <p>
        まず前提から。<strong>障害年金の申請は、本人(または家族)が自分で行える手続きです。</strong> 年金事務所の相談も無料です。そのうえで、社労士への依頼が力になるケースも確かにあります。この記事では、その判断基準を整理します。
      </p>

      <h2>自分で申請する場合</h2>
      <p>自分で申請する場合の負担は、費用ではなく手間と気力です。初診日を調べ、年金事務所に相談に行き、診断書を依頼し、申立書を書く——それぞれは特別な資格が要る作業ではありませんが、体調に波がある中で数か月かけて進めることになります。</p>
      <p>自分で進めやすいのは、次のような場合です。</p>
      <ul>
        <li>初診日がはっきりしていて、カルテも残っている</li>
        <li>通院歴が比較的シンプル(転院が少ない)</li>
        <li>書類を書く作業が、時間をかければできそう</li>
        <li>家族など、手伝ってくれる人がいる</li>
      </ul>
      <p>進め方の全体像は「<Link href="/columns/shinsei-nagare">申請の流れと必要書類</Link>」にまとめています。</p>

      <h2>社労士に依頼する場合</h2>
      <p>障害年金を専門に扱う社労士は、書類の収集・作成・提出の代行や、医師への診断書依頼の際の資料づくりなどを支援してくれます。費用は事務所によって異なりますが、着手金(無料〜数万円程度)と、受給が決まった場合の成功報酬(年金額の数か月分などを基準とする例が多い)という料金体系が一般的です。契約前に、料金体系と、不支給だった場合の費用を必ず確認しましょう。</p>
      <p>社労士への相談を検討したほうがよいのは、次のような場合です。</p>
      <ul>
        <li><strong>初診日の証明が難しい</strong>(カルテが破棄されている、廃院している、初診日の候補が複数ある)</li>
        <li>傷病が複数あり、どの傷病で申請するか整理が必要</li>
        <li>障害認定日にさかのぼる請求(遡及請求)を検討している</li>
        <li>一度不支給になり、審査請求(不服申立て)を考えている</li>
        <li>体調的に、手続きを進めること自体が難しい</li>
      </ul>
      <p>とくに初診日まわりの複雑なケースは、専門家の経験が結果を左右しやすい領域です。初回相談を無料にしている事務所も多いので、「依頼するかどうか」を決める前に、相談だけしてみるという使い方もできます。</p>

      <h2>「自分でやる」と「頼る」の間 — 組み合わせてよい</h2>
      <p>自分でやるか、全部任せるかの二択ではありません。たとえば、年金事務所への相談と書類集めは自分で進め、初診日の証明だけ社労士に相談する。あるいは、まず自分で進めてみて、行き詰まった段階で依頼を検討する。どこまで自分でやるかは、体調と相談しながら決めていいのです。</p>
      <p>
        大切なのは、<strong>どちらの道でも、日々の生活の記録と通院歴の整理は自分の手元に必要になる</strong>ということです。社労士に依頼する場合でも、生活の実態を伝える材料を用意するのは本人です。記録があるほど、自分で書くにも、専門家に伝えるにも、力になります。
      </p>

      <AppCta ct={column.slug} />

      <h2>まとめ</h2>
      <ul>
        <li>障害年金の申請は自分でできる手続き。年金事務所の相談は無料</li>
        <li>初診日の証明が難しいケース、遡及請求、審査請求などは社労士への相談を検討する価値がある</li>
        <li>費用体系(着手金・成功報酬・不支給時の扱い)は契約前に必ず確認する</li>
        <li>全部自分か全部依頼かの二択ではなく、組み合わせてよい</li>
        <li>どちらの道でも、生活の記録と通院歴の整理は本人の手元に必要になる</li>
      </ul>

      <div className="note-box"><p>※本記事は一般的な情報提供です。社労士の業務範囲・料金は事務所により異なります。依頼の判断はご自身でご確認のうえ行ってください。本記事および当アプリは受給を保証するものではありません。(最終更新: {formatDate(column.dateModified)})</p></div>

      <ColumnFooter currentSlug={column.slug} relatedSlugs={["shinsei-nagare", "shoshinbi-wakaranai"]} />
    </article>
  );
}
