import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter from "@/components/ColumnFooter";
import { columnJsonLd, columnMetadata, formatDate, getColumn } from "@/lib/columns";

const column = getColumn("hatachi-mae");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }} />
      <Breadcrumb current={column.title} />
      <h1>20歳前傷病の障害基礎年金とは — 納付要件なし・所得制限ありのしくみ</h1>
      <p className="meta-line">公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}/ 最終更新日: <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time></p>
      <ArticleToc />

      <p>障害年金は「保険」の仕組みなので、原則として保険料の納付要件があります。では、保険料を納める立場になる<strong>20歳より前</strong>に初診日がある場合はどうなるのか。そのための制度が「20歳前傷病による障害基礎年金」です。</p>

      <h2>納付要件が問われない</h2>
      <p>20歳前の、年金制度に加入していない期間に初診日がある場合、<strong>保険料納付要件は問われません。</strong> 保険料を納めようがない時期の傷病だからです。10代で精神科や心療内科の受診歴がある方は、この制度の対象になる可能性があります。</p>
      <p>対象となるのは障害基礎年金(1級・2級)です。20歳前に厚生年金に加入して働いていた場合(就職後に初診日がある場合)は、通常の障害厚生年金の枠組みになります。</p>

      <h2>いつから請求できるか</h2>
      <p>障害認定日は次のように扱われます。</p>
      <ul>
        <li>初診日から1年6か月経過した日が20歳より前 → <strong>20歳に達した日</strong>が認定日</li>
        <li>初診日から1年6か月経過した日が20歳より後 → その<strong>1年6か月経過日</strong>が認定日</li>
      </ul>
      <p>つまり、早くから通院していた方は、<strong>20歳の誕生日を迎えたタイミングで請求を検討できる</strong>ということです。認定日時点の診断書が必要になるため、20歳前後の時期の受診記録・生活の記録が大切になります。</p>
      <p>認定日に等級へ該当しなかった場合でも、その後悪化したときは事後重症による請求ができます(「<Link href="/columns/ninteibi-jigojusho">障害認定日と事後重症</Link>」参照)。</p>

      <h2>ほかの障害年金と違う点: 所得制限がある</h2>
      <p>20歳前傷病の障害基礎年金には、<strong>本人の所得による支給制限</strong>があります。保険料の納付を前提としない給付であるため、所得が一定額を超えると、年金の全部または2分の1が支給停止になる2段階の仕組みです。具体的な基準額は改定されることがあるため、日本年金機構の「<a href="https://www.nenkin.go.jp/service/jukyu/shougainenkin/jukyu-yoken/20150514-02.html" target="_blank" rel="noopener">20歳前の傷病による障害基礎年金にかかる支給制限等</a>」で最新の情報を確認してください。</p>
      <p>働いて所得がある方でも、基準以下であれば受給できます。「働いているから対象外」と自己判断せず、まず確認を。</p>

      <h2>昔の受診記録が鍵になる — 早めに確認を</h2>
      <p>20歳前傷病の申請では、10代の頃の初診日を証明する必要があります。カルテの保存期間の問題があるため、<strong>受診から年月が経つほど証明は難しくなります。</strong> 心当たりの医療機関には早めに記録の有無を確認しましょう。カルテがない場合の対処は「<Link href="/columns/shoshinbi-wakaranai">初診日がわからない・カルテがないときの調べ方</Link>」にまとめています。</p>
      <p>また、10代のお子さんの通院を支えているご家族の方へ。<strong>当時の生活のようすの記録は、将来の申請でお子さん自身の力になります。</strong> 通院の記録、学校生活での困りごと、家庭での援助の内容。日々の短いメモで十分です。</p>

      <AppCta ct={column.slug} />
      <h2>まとめ</h2>
      <ul>
        <li>20歳前(年金未加入期間)に初診日がある場合、納付要件は問われない</li>
        <li>認定日は「20歳に達した日」または「初診日から1年6か月後」の遅いほう</li>
        <li>本人の所得による支給制限がある(基準額は年金機構で確認)</li>
        <li>10代の受診記録は時間が経つほど証明が難しくなる。早めの確認と日々の記録を</li>
      </ul>
      <div className="note-box"><p>※本記事は一般的な情報提供であり、受給を保証するものではありません。支給制限の基準額など最新の制度内容は日本年金機構および年金事務所でご確認ください。(最終更新: {formatDate(column.dateModified)})</p></div>
      <ColumnFooter currentSlug={column.slug} relatedSlugs={["hattatsu-shougai", "shoshinbi-wakaranai"]} />
    </article>
  );
}
