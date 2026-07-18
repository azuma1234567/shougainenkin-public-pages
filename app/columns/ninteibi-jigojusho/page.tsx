import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter, { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import { columnJsonLd, columnMetadata, formatDate, getColumn } from "@/lib/columns";

const column = getColumn("ninteibi-jigojusho");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }} />
      <Breadcrumb current={column.title} />
      <h1>障害認定日とは?事後重症との違いと、さかのぼり請求(遡及請求)の基本</h1>
      <p className="meta-line">公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}/ 最終更新日: <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time></p>
      <ArticleToc />

      <p>障害年金を調べていると必ず出てくるのが「障害認定日」「事後重症」「遡及(そきゅう)請求」という言葉です。どれも、<strong>いつの時点の障害状態で審査するか、いつの分から年金を受け取れるか</strong>に関わる大切な概念です。この記事で整理します。</p>

      <h2>障害認定日とは</h2>
      <p>障害認定日とは、障害の程度を判定する基準日のことで、原則として<strong>初診日から1年6か月を経過した日</strong>です。それより前に症状が固定した(治療をしてもこれ以上の回復が見込めない)場合は、その日が認定日になることもあります。</p>
      <p>つまり、初診日から1年6か月経つまでは、原則として障害年金の請求はできません(20歳前傷病など例外的な扱いはあります)。「発病してすぐは請求できない」という制度設計になっています。</p>

      <h2>認定日請求 — 認定日の翌月分から受け取れる</h2>
      <p>障害認定日の時点で障害等級に該当する状態だった場合、<strong>認定日にさかのぼって請求</strong>できます。これを認定日請求(本来請求)といい、認められれば<strong>認定日の翌月分から</strong>年金を受け取れます。</p>
      <p>請求が認定日より後になった場合でも、さかのぼって請求できます(遡及請求)。ただし、年金の支払いには<strong>5年の時効</strong>があるため、さかのぼって受け取れるのは最大で過去5年分です。</p>
      <p>認定日請求には、<strong>障害認定日時点(認定日から3か月以内の現症)の診断書</strong>が必要です。請求から時間が経っている場合は、現在の状態の診断書もあわせて必要になります。当時のカルテが残っているかが鍵になるので、さかのぼりを考えている方は早めに医療機関へ確認しましょう。</p>

      <h2>事後重症請求 — 請求した翌月分から</h2>
      <p>障害認定日の時点では等級に該当しなかった(または当時の診断書が用意できない)ものの、<strong>その後症状が悪化して該当する状態になった</strong>場合は、事後重症による請求ができます。</p>
      <p>事後重症請求で受け取れるのは、<strong>請求日の翌月分から</strong>です。ここが認定日請求との大きな違いで、さかのぼりはありません。</p>

      <h2>「請求を先延ばしにしない」が鉄則の理由</h2>
      <p>事後重症請求は請求日の翌月分からしか支給されないため、<strong>請求が1か月遅れると、その1か月分は受け取れません。</strong> 「もう少し調べてから」「体調がよくなってから」と先延ばしにしている間も、時間は戻りません。</p>
      <p>また、認定日請求のさかのぼりも時効は5年です。認定日から時間が経つほど、受け取れたはずの期間が消えていきます。</p>
      <p>準備に時間がかかるのは当然です。だからこそ、<strong>完璧を待たずに、準備を今日から少しずつ始める</strong>ことに意味があります。全体の段取りは「<Link href="/columns/shinsei-nagare">申請の流れと必要書類</Link>」にまとめています。</p>

      <AppCta ct={column.slug} />
      <h2>まとめ</h2>
      <ul>
        <li>障害認定日は原則、初診日から1年6か月後</li>
        <li>認定日時点で該当していれば認定日請求(認定日の翌月分から。さかのぼりは最大5年)</li>
        <li>認定日に該当しなくても、悪化後に事後重症請求ができる(請求日の翌月分から)</li>
        <li>事後重症は請求が遅れた分だけ受け取れない。先延ばしにしない</li>
      </ul>
      <div className="note-box"><p>※本記事は一般的な情報提供であり、受給や遡及の認定を保証するものではありません。個別の判断は年金事務所や社会保険労務士にご相談ください。(最終更新: {formatDate(column.dateModified)})</p></div>
      <ColumnFooter currentSlug={column.slug} relatedSlugs={["shinsei-nagare", "shoubyou-teatekin"]} references={[NENKIN_REFERENCES.jukyuYoken, NENKIN_REFERENCES.seido]} />
    </article>
  );
}
