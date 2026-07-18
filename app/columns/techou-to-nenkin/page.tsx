import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter from "@/components/ColumnFooter";
import { columnJsonLd, columnMetadata, formatDate, getColumn } from "@/lib/columns";

const column = getColumn("techou-to-nenkin");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }} />
      <Breadcrumb current={column.title} />
      <h1>障害者手帳と障害年金の違い — 手帳の等級と年金の等級は別物です</h1>
      <p className="meta-line">公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}/ 最終更新日: <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time></p>
      <ArticleToc />

      <p>「手帳が3級だから、年金は無理だと思っていた」「手帳を持っていないと年金は申請できないんですよね?」——どちらも、とてもよくある誤解です。</p>
      <p>結論: <strong>障害者手帳と障害年金は、まったく別の制度で、審査も等級も別です。</strong> この記事でその関係を整理します。</p>

      <h2>別の制度、別の窓口、別の審査</h2>
      <p>精神疾患の場合に関係するのは、次の2つです。</p>
      <ul>
        <li><strong>精神障害者保健福祉手帳</strong>: 福祉サービスや税の優遇、公共料金の割引などを受けるための制度。窓口は市区町村。等級は1〜3級</li>
        <li><strong>障害年金</strong>: 生活を支える年金給付。窓口は年金事務所など。等級は障害基礎年金が1〜2級、障害厚生年金が1〜3級</li>
      </ul>
      <p>名前が似ていて等級の数字も重なるため混同しやすいのですが、<strong>審査する機関も、審査の基準も、判定に使う書類も別</strong>です。</p>

      <h2>「手帳3級だから年金は無理」ではない</h2>
      <p>手帳の等級と年金の等級は連動しません。手帳が3級でも、障害年金の審査で2級と認定される場合はありますし、その逆もあります。年金の審査は、診断書(年金用の様式)と病歴・就労状況等申立書に書かれた<strong>日常生活と就労の実態</strong>に基づいて、年金制度の基準で行われます。</p>
      <p>手帳の等級を理由に申請をあきらめる必要はありません。迷ったら、まず年金事務所に相談してみてください。</p>

      <h2>手帳を持っていなくても、年金は申請できる</h2>
      <p>障害年金の申請に、障害者手帳は必要ありません。手帳を取得していない方でも、初診日・納付要件・障害状態の要件を満たせば申請できます(要件の全体像は「<Link href="/columns/shinsei-nagare">申請の流れと必要書類</Link>」をご覧ください)。</p>

      <h2>逆方向の連携はある: 年金証書で手帳を申請できる</h2>
      <p>別制度ですが、一方向の連携はあります。<strong>障害年金(精神の障害)を受給している場合、年金証書等を添えることで、医師の診断書を省略して手帳を申請できる</strong>制度があります。この場合、手帳の等級は年金の等級に応じたものになります。年金2級を受給している方が、この方法で手帳2級を取得する、といった形です。</p>
      <p>つまり「手帳がないと年金が取れない」のではなく、むしろ「年金が取れると手帳が取りやすくなる」という関係です。</p>

      <h2>どちらも、実態を伝える書類が土台になる</h2>
      <p>制度は別でも、共通していることがあります。どちらの審査も、<strong>日常生活の実態がどれだけ正確に書類へ反映されるか</strong>で結果が左右されるという点です。日々の生活の記録を残しておくことは、年金にも手帳にも、そして日々の診察にも活きる、いちばん汎用性の高い備えです。</p>

      <AppCta ct={column.slug} />
      <h2>まとめ</h2>
      <ul>
        <li>障害者手帳と障害年金は別制度・別審査。等級は連動しない</li>
        <li>手帳3級でも年金2級に認定される場合がある。手帳の等級で自己判断しない</li>
        <li>手帳を持っていなくても障害年金は申請できる</li>
        <li>年金受給者は年金証書で手帳を申請できる制度がある(診断書の省略)</li>
      </ul>
      <div className="note-box"><p>※本記事は一般的な情報提供であり、受給や等級の認定を保証するものではありません。手帳の手続きは市区町村、年金は年金事務所にご確認ください。(最終更新: {formatDate(column.dateModified)})</p></div>
      <ColumnFooter currentSlug={column.slug} relatedSlugs={["shinsei-nagare", "nofu-yoken"]} />
    </article>
  );
}
