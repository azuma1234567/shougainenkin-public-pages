import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter from "@/components/ColumnFooter";
import { columnJsonLd, columnMetadata, formatDate, getColumn } from "@/lib/columns";

const column = getColumn("hattatsu-shougai");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }} />
      <Breadcrumb current={column.title} />
      <h1>発達障害(ADHD・ASD)で障害年金は受給できる?初診日の考え方と申請のポイント</h1>
      <p className="meta-line">公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}/ 最終更新日: <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time></p>
      <ArticleToc />

      <p>「発達障害でも障害年金の対象になるのですか?」——なります。ADHD(注意欠如・多動症)やASD(自閉スペクトラム症)などの発達障害は、障害年金の認定の対象です。</p>
      <p>ただし発達障害の申請には、初診日の考え方など、独特のポイントがあります。この記事で整理します。</p>

      <h2>大人になってから診断された場合の初診日</h2>
      <p>発達障害は生まれつきの特性ですが、障害年金の取り扱いでは、<strong>20歳を過ぎてから初めて医療機関を受診した場合、その受診日が初診日</strong>とされています。「生まれつきだから20歳前扱いになるのでは」と迷う方が多いのですが、大人になって初めて受診したケースでは、その日が初診日です。</p>
      <p>これは重要な意味を持ちます。初診日が20歳以降で、その時点で厚生年金に加入していれば、<strong>障害厚生年金(3級まである)の対象になりうる</strong>からです。一方、20歳前に受診歴がある場合は20歳前傷病の扱いになります(詳しくは「<Link href="/columns/hatachi-mae">20歳前傷病の障害基礎年金</Link>」をご覧ください)。</p>
      <p>なお、うつ症状などで先に受診していて、後から発達障害が判明したケースでは、どこを初診日とみるかの判断が分かれることがあります。迷う場合は「<Link href="/columns/shoshinbi-wakaranai">初診日がわからないときの調べ方</Link>」を参考に、年金事務所へ相談しながら進めてください。</p>

      <h2>二次障害(うつ病など)がある場合</h2>
      <p>発達障害のある方が、うつ病や適応障害などの二次障害を抱えているケースは少なくありません。認定の取り扱いでは、発達障害とうつ病などの精神疾患が併存する場合、<strong>別々ではなく全体をひとつの障害として認定する</strong>扱いがされています。申請にあたっては、発達障害の特性による困難と、二次障害による症状の両方を、診断書と申立書に反映させることが大切です。</p>

      <h2>「できているように見える」を、実態で伝える</h2>
      <p>発達障害の申請で難しいのは、<strong>場面によってはできてしまう・取り繕えてしまう</strong>ことです。短い診察では会話が成立し、身なりも整っている。でも実際は——</p>
      <ul>
        <li>金銭管理: 衝動買いで毎月お金がなくなり、家族が管理している</li>
        <li>対人関係: 職場で暗黙のルールが分からずトラブルが繰り返し起きる</li>
        <li>身辺: 優先順位がつけられず、部屋が片付けられない。郵便物を開封できず滞納が起きる</li>
        <li>仕事: 口頭指示を覚えていられない。マルチタスクでミスが頻発し、単純作業に限定してもらっている</li>
      </ul>
      <p>こうした<strong>具体的な場面・頻度・受けている援助</strong>を、日々記録して、診察で医師に伝え、申立書に書く。これが発達障害の申請でもっとも大切な作業です。書き方の基本は「<Link href="/columns/moushitatesho-kakikata">病歴・就労状況等申立書の書き方</Link>」、医師への伝え方は「<Link href="/columns/shinsatsu-mae-memo">診察前メモのすすめ</Link>」で解説しています。</p>
      <p>働いている方は、障害者雇用かどうか・職場の配慮の内容も重要な事実です(「<Link href="/columns/hatarakinagara">働きながら障害年金は受け取れる?</Link>」)。</p>

      <AppCta ct={column.slug} />
      <h2>まとめ</h2>
      <ul>
        <li>発達障害(ADHD・ASD)は障害年金の対象</li>
        <li>20歳以降に初めて受診した場合は、その日が初診日(厚生年金加入中なら障害厚生年金の対象になりうる)</li>
        <li>二次障害がある場合は、全体をひとつの障害として認定される扱い</li>
        <li>「できているように見える」実態を、場面・頻度・援助の記録で具体的に伝える</li>
      </ul>
      <div className="note-box"><p>※本記事は一般的な情報提供であり、受給や等級の認定を保証するものではありません。個別の判断は年金事務所や社会保険労務士にご相談ください。(最終更新: {formatDate(column.dateModified)})</p></div>
      <ColumnFooter currentSlug={column.slug} relatedSlugs={["hatachi-mae", "moushitatesho-kakikata"]} />
    </article>
  );
}
