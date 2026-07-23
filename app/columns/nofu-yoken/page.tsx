import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter, { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import { columnJsonLd, columnMetadata, formatDate, getColumn } from "@/lib/columns";

const column = getColumn("nofu-yoken");

export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }}
      />

      <Breadcrumb current={column.title} />

      <h1>障害年金の保険料納付要件とは — 未納があると受け取れない?3分の2要件と直近1年の特例</h1>

      <p className="meta-line">
        公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}
        / 最終更新日:{" "}
        <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time>
      </p>

      <ArticleToc />

      <p>「国民年金に未納の時期があるから、障害年金はもらえないのでは」——申請をためらう理由として、とても多い不安です。</p>
      <p>
        結論から言うと、<strong>未納期間があっても、要件を満たしていれば受給できます。</strong> この記事では、保険料納付要件のしくみと確認方法を解説します。
      </p>

      <h2>納付要件は2つ。どちらかを満たせばよい</h2>
      <p>
        障害年金の保険料納付要件は、次のどちらかを満たせば足ります。判定の基準日は<strong>初診日の前日</strong>です(初診日の考え方は「
        <Link href="/columns/shoshinbi-wakaranai">
          初診日がわからない・カルテがないときの調べ方
        </Link>
        」をご覧ください)。
      </p>
      <p><strong>① 3分の2要件(原則)</strong><br />初診日のある月の前々月までの被保険者期間のうち、保険料を納めた期間と免除された期間の合計が3分の2以上あること。</p>
      <p><strong>② 直近1年要件(特例)</strong><br />初診日において65歳未満で、初診日のある月の前々月までの直近1年間に保険料の未納がないこと。この特例は、初診日が令和18年3月末日までにある場合に適用されます。</p>
      <p>
        過去に未納が多くても、<strong>直近1年さえ未納がなければ②で要件を満たせます。</strong> 詳しい条件は日本年金機構の「<a href="https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20150514.html" target="_blank" rel="noopener">障害基礎年金の受給要件</a>」のページで確認できます。
      </p>

      <h2>「免除」は未納ではない</h2>
      <p>
        ここを誤解している方が多いのですが、<strong>免除や猶予の承認を受けた期間は、未納ではありません。</strong> 納付要件の判定では、全額免除・学生納付特例・納付猶予の期間は「納めた期間」と同じ側にカウントされます。
      </p>
      <p>注意が必要なのは一部免除(4分の1免除・半額免除・4分の3免除)です。免除されなかった残りの保険料を納めていないと、その月は未納扱いになります。</p>

      <h2>なぜ「初診日の前日」で判定するのか — 後から納めても間に合わない</h2>
      <p>
        納付要件は初診日の<strong>前日</strong>時点の納付状況で判定されます。つまり、<strong>初診日より後にさかのぼって保険料を納めても、納付要件の判定には算入されません。</strong> 病気になってから慌てて納める、ということができない仕組みです。
      </p>
      <p>
        これは裏を返すと、<strong>保険料を納めるのが難しいときは、未納のまま放置せず、免除・猶予の申請をしておくことがいちばんの備え</strong>だということです。免除なら未納になりません。いま体調を崩していて保険料が払えていない方は、市区町村の窓口か年金事務所で免除の相談をしておくことをおすすめします。
      </p>

      <h2>自分の納付状況を確認する方法</h2>
      <ul>
        <li><strong>ねんきんネット</strong>(日本年金機構のWebサービス)で月ごとの納付状況を確認できます</li>
        <li><strong>年金事務所</strong>の窓口や電話でも確認できます。障害年金の相談に行くと、納付要件を満たしているかを最初に確認してもらえます</li>
      </ul>
      <p>
        なお、<strong>20歳前に初診日がある場合</strong>(20歳前傷病)は、納付要件は問われません。詳しくは「
        <Link href="/columns/hatachi-mae">
          20歳前傷病の障害基礎年金とは
        </Link>
        」で解説しています。
      </p>

      <h2>要件を満たしているか不安なまま悩まない</h2>
      <p>納付要件は、自分で計算しようとすると複雑ですが、年金事務所に行けばその場で確認してもらえる事項です。「未納があるから無理だろう」と自己判断で諦めてしまう前に、まず確認だけしてみてください。</p>

      <AppCta ct={column.slug} />

      <h2>まとめ</h2>
      <ul>
        <li>納付要件は「3分の2要件」か「直近1年要件」のどちらかを満たせばよい</li>
        <li>免除・学生納付特例・納付猶予は未納ではない(一部免除は残額の納付が必要)</li>
        <li>判定は初診日の前日時点。初診日より後に納めても算入されない</li>
        <li>保険料が納められないときは免除・猶予の申請をしておくことが備えになる</li>
        <li>20歳前に初診日がある場合は納付要件不要</li>
        <li>ねんきんネットか年金事務所で確認できる</li>
      </ul>

      <div className="note-box">
        <p>※本記事は一般的な情報提供であり、受給を保証するものではありません。制度は改正されることがあります。最新の要件は日本年金機構および年金事務所でご確認ください。(最終更新: {formatDate(column.dateModified)})</p>
      </div>

      <ColumnFooter
        currentSlug={column.slug}
        relatedSlugs={["shoshinbi-wakaranai", "hatachi-mae"]}
        references={[NENKIN_REFERENCES.jukyuYoken, NENKIN_REFERENCES.seido]}
      />
    </article>
  );
}
