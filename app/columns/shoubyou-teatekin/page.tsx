import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter from "@/components/ColumnFooter";
import { columnJsonLd, columnMetadata, formatDate, getColumn } from "@/lib/columns";

const column = getColumn("shoubyou-teatekin");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }} />
      <Breadcrumb current={column.title} />
      <h1>傷病手当金と障害年金は両方もらえる?関係と切り替えのタイミング</h1>
      <p className="meta-line">公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}/ 最終更新日: <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time></p>
      <ArticleToc />

      <p>精神疾患で休職している方の多くが、健康保険の<strong>傷病手当金</strong>を受け取っています。そして、その支給には期限があります。「傷病手当金が終わったら、その先はどうすれば…」——この不安に対する備えのひとつが、障害年金です。</p>
      <p>この記事では、2つの制度の関係と、切り替えを考えるタイミングを整理します。</p>

      <h2>傷病手当金は「最長1年6か月」</h2>
      <p>傷病手当金は、健康保険(会社員などが加入)の制度で、病気やけがで働けない期間の生活を支える給付です。支給されるのは、同じ傷病について<strong>支給開始から通算で最長1年6か月</strong>です。</p>
      <p>一方、障害年金の障害認定日は原則「初診日から1年6か月後」。<strong>傷病手当金の支給終了時期と、障害年金の請求を検討できる時期は重なることがあります。</strong>そのため、次の生活保障への切り替えを早めに考えることが大切です。</p>

      <h2>同じ傷病では「両取り」はできない — 併給調整</h2>
      <p>同じ傷病について、傷病手当金と<strong>障害厚生年金</strong>の両方を受けられる場合は、併給調整が行われます。基本的には障害厚生年金が優先され、傷病手当金は年金額(日額換算)を上回る差額があればその分だけ支給される、という仕組みです。障害年金のほうが少ない場合に差額で調整されるため、<strong>もらいすぎになることも、二重に全額もらえることもない</strong>、と理解しておけば十分です。</p>
      <p>なお、別の傷病どうしであれば調整されない場合があるなど、細かな条件があります。自分のケースの正確な扱いは、加入している健康保険組合・協会けんぽと年金事務所に確認してください。</p>

      <h2>切り替えを見据えたスケジュール</h2>
      <p>大切なのは、<strong>傷病手当金が終わってから障害年金の準備を始めると、収入の空白期間が生まれやすい</strong>ということです。障害年金は、診断書の依頼や申立書の作成など準備に時間がかかり、提出後の審査にも数か月かかります。</p>
      <p>おすすめのスケジュール感は次のとおりです。</p>
      <ol>
        <li><strong>休職・療養が長引きそうだと感じた時点</strong>: 初診日の確認と、日々の生活の記録を始める(記録は診察にも申立書にも使えます)</li>
        <li><strong>傷病手当金の支給が残り半年を切った頃</strong>: 年金事務所に相談し、納付要件の確認と書類一式の受け取りを済ませる</li>
        <li><strong>障害認定日(初診日から1年6か月)が来たら</strong>: 診断書を依頼し、申立書を仕上げて請求する</li>
      </ol>
      <p>段取りの全体像は「<Link href="/columns/shinsei-nagare">申請の流れと必要書類</Link>」で詳しく解説しています。</p>

      <h2>退職を考えている方へ、ひとつだけ</h2>
      <p>傷病手当金は、条件を満たせば退職後も継続して受給できる場合があります(資格喪失前に継続し1年以上の被保険者期間がある、退職日に受給している等の条件)。また、障害年金では<strong>初診日に厚生年金に加入していたかどうか</strong>で対象の年金(障害厚生年金か障害基礎年金か)が決まるため、退職後に初めて受診するのと在職中に受診しておくのとでは、使える制度が変わることがあります。退職の判断の前に、この2点は確認しておく価値があります。</p>

      <AppCta ct={column.slug} />
      <h2>まとめ</h2>
      <ul>
        <li>傷病手当金は最長1年6か月。終わる頃に障害年金の請求が可能になる関係</li>
        <li>同じ傷病では併給調整があり、二重に全額はもらえない</li>
        <li>傷病手当金が終わってから動くと空白ができやすい。残り半年を切ったら準備開始</li>
        <li>退職を考えている場合は、退職後の継続給付と初診日の加入状況を先に確認</li>
      </ul>
      <div className="note-box"><p>※本記事は一般的な情報提供です。併給調整や継続給付の可否は個別の条件によります。健康保険組合・協会けんぽおよび年金事務所でご確認ください。(最終更新: {formatDate(column.dateModified)})</p></div>
      <ColumnFooter currentSlug={column.slug} relatedSlugs={["ninteibi-jigojusho", "shinsei-nagare"]} />
    </article>
  );
}
