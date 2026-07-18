import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter from "@/components/ColumnFooter";
import { columnJsonLd, columnMetadata, formatDate, getColumn } from "@/lib/columns";
import { faqJsonLd } from "@/lib/seo";

const column = getColumn("hatarakinagara");

export const metadata: Metadata = columnMetadata(column);

// 本文にある質問と回答のみを構造化データ化する(内容の追加はしない)
const faq = faqJsonLd([
  {
    question: "働きながら障害年金は受け取れますか?",
    answer:
      "就労していることだけを理由に不支給になるわけではなく、働きながら受給している方は実際にいます。ただし精神疾患の場合、就労の状況が審査で考慮されます。審査で見られるのは就労の有無そのものではなく、雇用形態・配慮・援助・欠勤の頻度といった働き方の実態です。",
  },
  {
    question: "就労状況は障害年金の審査でどう見られますか?",
    answer:
      "どのような条件・支えのもとで働けているかという実態が判断材料になります。援助や配慮があってはじめて就労が成り立っている場合はその事実が考慮されます。一方、配慮のない一般雇用でフルタイム勤務を続けられている場合は、日常生活能力への支障は軽いと評価されやすくなります。実態は医師の診断書と病歴・就労状況等申立書で伝えます。",
  },
]);

export default function Page() {
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <Breadcrumb current={column.title} />
      <h1>働きながら障害年金は受け取れる?精神疾患と就労の関係</h1>
      <p className="meta-line">
        公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}/ 最終更新日:{" "}
        <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time>
      </p>

      <ArticleToc />

      <p>「働いていると障害年金はもらえない」と思い込んで、申請をあきらめている方がいます。</p>
      <p>
        これは正確ではありません。<strong>就労していることだけを理由に不支給になるわけではなく、働きながら受給している方は実際にいます。</strong> ただし、精神疾患の場合、就労の状況が審査で考慮されるのも事実です。この記事では、その関係を整理します。
      </p>

      <h2>「働いている」だけでは判断されない — 見られるのは働き方の中身</h2>
      <p>
        障害年金の審査で見られるのは、就労の有無そのものではなく、<strong>どのような条件・支えのもとで働けているか</strong>という実態です。同じ「週5日勤務」でも、次の2つはまったく違います。
      </p>
      <ul>
        <li>一般雇用で、特別な配慮なく、他の社員と同じ業務をこなしている</li>
        <li>障害者雇用で、業務内容を限定してもらい、上司が毎日声かけと確認をし、通院のための欠勤が認められている</li>
      </ul>
      <p>
        後者のように、<strong>援助や配慮があってはじめて就労が成り立っている</strong>のであれば、その事実が審査の判断材料になります。逆に、配慮のない一般雇用でフルタイム勤務を続けられている場合、日常生活能力への支障は軽いと評価されやすくなるのが実情です。ここは正直にお伝えしておきます。
      </p>

      <h2>実態を伝える場所は、診断書と申立書</h2>
      <p>働き方の実態は、黙っていても審査には伝わりません。伝える場所は2つあります。</p>
      <p>
        <strong>① 医師の診断書。</strong> 診断書には就労状況を記載する欄があります。医師が職場での実態を知らないまま「就労中」とだけ書かれると、実際より軽く見える診断書になりかねません。勤務形態(障害者雇用か)、受けている配慮、欠勤や早退の頻度は、診察のときに医師に伝えておきましょう。口頭で伝えにくければ、メモにして渡す方法があります(詳しくは「<Link href="/columns/shinsatsu-mae-memo">主治医に日常の大変さが伝わらないと感じたら</Link>」で解説しています)。
      </p>
      <p><strong>② 病歴・就労状況等申立書。</strong> 申立書には就労状況を書く欄があります。書くべきは具体的な事実です。</p>
      <ul>
        <li>雇用形態(一般雇用/障害者雇用/就労移行支援・就労継続支援など)</li>
        <li>勤務日数・時間と、欠勤・早退・遅刻の頻度</li>
        <li>職場で受けている配慮や援助の内容(業務の限定、声かけ、通院への配慮など)</li>
        <li>仕事が生活に与えている影響(帰宅後は動けない、休日は寝て回復に充てている、など)</li>
      </ul>
      <p>
        「仕事はなんとか行けているが、それ以外の生活が回っていない」という状態の方は多くいます。その場合、<strong>仕事以外の生活の実態</strong>(家事ができない、食事が作れない、など)を具体的に書くことが重要です。
      </p>

      <h2>障害厚生年金3級という枠組み</h2>
      <p>
        初診日に厚生年金に加入していた場合は障害厚生年金の対象となり、1級・2級に加えて<strong>3級</strong>があります。3級は「労働が著しい制限を受ける」程度が目安とされており、働き方に大きな制約を受けながら就労している方が該当しうる枠組みです。一方、障害基礎年金(国民年金)には3級がなく1級・2級のみです。自分がどちらの制度の対象かは初診日の加入状況で決まります(初診日の考え方は「<Link href="/columns/shoshinbi-wakaranai">初診日がわからない・カルテがないときの調べ方</Link>」をご覧ください)。
      </p>

      <h2>就労を隠す必要はない。盛る必要もない</h2>
      <p>
        就労の事実を隠して申請することはできませんし、すべきでもありません。同時に、実態より重く見せる必要もありません。<strong>援助・配慮・頻度という事実を、そのまま具体的に伝える。</strong> それが、働きながらの申請でやるべきことのすべてです。
      </p>

      <AppCta ct={column.slug} />

      <h2>まとめ</h2>
      <ul>
        <li>就労していることだけを理由に不支給になるわけではない</li>
        <li>審査で見られるのは働き方の中身(雇用形態・配慮・援助・欠勤の実態)</li>
        <li>実態は診断書と申立書で伝える。医師にも職場の状況を伝えておく</li>
        <li>仕事以外の生活が回っていないなら、その実態も具体的に書く</li>
        <li>初診日に厚生年金加入なら3級の枠組みがある</li>
      </ul>

      <div className="note-box"><p>※本記事は一般的な情報提供であり、受給の可否や等級を保証するものではありません。個別のご事情については年金事務所や社会保険労務士にご相談ください。(最終更新: {formatDate(column.dateModified)})</p></div>

      <ColumnFooter currentSlug={column.slug} relatedSlugs={["moushitatesho-kakikata", "shinsatsu-mae-memo"]} />
    </article>
  );
}
