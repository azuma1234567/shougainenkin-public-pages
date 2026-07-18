import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter from "@/components/ColumnFooter";
import { columnJsonLd, columnMetadata, formatDate, getColumn } from "@/lib/columns";

const column = getColumn("shindansho-kakunin");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }} />
      <Breadcrumb current={column.title} />
      <h1>障害年金の診断書を受け取ったら — 提出前に確認したいポイント</h1>
      <p className="meta-line">公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}/ 最終更新日: <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time></p>
      <ArticleToc />

      <p>医師に依頼していた診断書ができあがった。ほっとして、そのまま提出——ちょっと待ってください。<strong>診断書は提出前に、内容を確認してよい書類です。</strong></p>
      <p>診断書の記入項目は多く、記入漏れや、伝わっていなかったための事実と異なる記載が起きることは珍しくありません。不備のある診断書は、審査の遅れや、実態と違う判断につながりかねません。この記事では、提出前に確認したいポイントを整理します。</p>

      <h2>大前提: 確認するのは「事実と合っているか」</h2>
      <p>先にいちばん大切なことを。診断書の医学的な判断・評価は医師のものです。確認するのは判断の中身ではなく、<strong>事実関係の正確さと記入漏れ</strong>です。「もっと重く書いてほしい」というお願いはできませんし、すべきでもありません。確認の目的は、あくまで「事実が事実のとおりに書かれているか」です。</p>

      <h2>確認ポイント</h2>
      <p><strong>① 初診日・発病日</strong><br />自分が把握している初診日と一致しているか。受診状況等証明書がある場合はその日付と食い違っていないか。ここが違うと納付要件や認定日の判定に影響します。</p>
      <p><strong>② 傷病名と現症日</strong><br />現症日(いつ時点の状態を書いた診断書か)が、請求の種類(認定日請求なら認定日から3か月以内、事後重症なら請求日前3か月以内)に合っているか。</p>
      <p><strong>③ 空欄・記入漏れがないか</strong><br />記入項目が多い書類なので、空欄が残っていることがあります。とくに「日常生活能力の判定」「日常生活能力の程度」の欄、就労状況の欄は審査の中心となる項目です。空欄があれば医療機関に確認しましょう。</p>
      <p><strong>④ 生活と就労の実態が反映されているか</strong><br />「日常生活能力の判定」は、食事・清潔保持・金銭管理・通院と服薬・対人関係・危機対応・社会性について、<strong>単身で生活するとしたら</strong>という前提で評価される欄です。家族と同居していて援助を受けている場合、その援助の実態が伝わっていないと、実際より「できる」側に評価されることがあります。就労中の方は、勤務形態や職場の配慮が就労欄に反映されているかも見てください。</p>

      <h2>事実と異なる点があったら — 伝え方</h2>
      <p>事実と異なる記載や記入漏れを見つけたら、遠慮せず医療機関に相談してください。伝え方はシンプルに、事実ベースで。</p>
      <blockquote><p>「◯◯の欄が空欄のようなので、ご確認いただけますか」<br />「食事の欄が『自発的にできる』となっていますが、実際は母が毎食用意して声かけしてくれている状態です。お伝えできていなかったので、実情をご説明したいです」</p></blockquote>
      <p>「書き直してほしい」ではなく「<strong>実情が伝わっていなかったので、改めて伝えたい</strong>」という姿勢です。医師も、知らなかった事実であれば検討してくれます。そのうえで医師の判断が変わらなければ、それが医学的判断です。</p>

      <h2>そもそも論: 依頼前に実態を伝えておくのがいちばん</h2>
      <p>受け取ってから修正をお願いするのは、医師にとっても本人にとっても負担です。いちばんよいのは、<strong>診断書を依頼する前から、日常生活の実態が医師に伝わっている状態</strong>をつくっておくこと。日々の生活の記録を診察のたびに共有していれば、診断書はその積み重ねの上で書かれます。方法は「<Link href="/columns/shinsatsu-mae-memo">主治医に日常の大変さが伝わらないと感じたら</Link>」で詳しく解説しています。</p>

      <AppCta ct={column.slug} />
      <h2>まとめ</h2>
      <ul>
        <li>診断書は提出前に内容を確認してよい</li>
        <li>確認するのは「事実の正確さ」と「記入漏れ」。医学的判断への注文はしない</li>
        <li>初診日・現症日・空欄・生活と就労の実態の反映、の順にチェック</li>
        <li>相違があれば「実情が伝わっていなかった」という姿勢で相談する</li>
        <li>依頼前から実態を伝えておくことが、いちばんの予防策</li>
      </ul>
      <div className="note-box"><p>※本記事は一般的な情報提供です。診断書の記載は医師の医学的判断に基づくものであり、本記事は特定の記載や受給を保証するものではありません。(最終更新: {formatDate(column.dateModified)})</p></div>
      <ColumnFooter currentSlug={column.slug} relatedSlugs={["shinsatsu-mae-memo", "moushitatesho-kakikata"]} />
    </article>
  );
}
