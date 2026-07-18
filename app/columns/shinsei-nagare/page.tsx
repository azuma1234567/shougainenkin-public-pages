import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter from "@/components/ColumnFooter";
import { columnJsonLd, columnMetadata, formatDate, getColumn } from "@/lib/columns";

const column = getColumn("shinsei-nagare");

export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }} />
      <Breadcrumb current={column.title} />
      <h1>障害年金の申請の流れと必要書類 — 何から始めればいいかを順番に解説</h1>
      <p className="meta-line">
        公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}/ 最終更新日:{" "}
        <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time>
      </p>

      <ArticleToc />

      <p>障害年金の申請は、やることが多く、順番もわかりにくい手続きです。「何から手をつければいいのか」で止まってしまっている方のために、この記事では申請の全体像を7つのステップに分けて解説します。</p>
      <p>各ステップの詳しい解説記事へのリンクも載せているので、この記事を地図として使ってください。</p>

      <h2>ステップ1: 初診日を確認する</h2>
      <p>すべての起点は初診日(その傷病で初めて医師の診療を受けた日)です。初診日によって、納付要件の判定期間も、障害基礎年金か障害厚生年金かも、障害認定日も決まります。転院している場合はいちばん最初の医療機関、精神疾患では最初の内科受診が初診日になることもあります。</p>
      <p>→ 詳しくは「<Link href="/columns/shoshinbi-wakaranai">初診日がわからない・カルテがないときの調べ方</Link>」</p>

      <h2>ステップ2: 保険料納付要件を確認する</h2>
      <p>初診日の前日時点で、保険料の納付状況が要件を満たしているかを確認します。3分の2要件か直近1年要件のどちらかを満たせばOKです。ねんきんネットで自分でも確認できますが、次のステップで年金事務所に相談すれば、その場で確認してもらえます。</p>
      <p>→ 詳しくは「<Link href="/columns/nofu-yoken">保険料納付要件とは</Link>」</p>

      <h2>ステップ3: 年金事務所に相談し、書類一式を受け取る</h2>
      <p>初診日の見当がついたら、年金事務所(または街角の年金相談センター)に相談予約をして訪ねます。ここで納付要件の確認と、申請書類一式(年金請求書、診断書の様式、病歴・就労状況等申立書、受診状況等証明書の様式など)の受け取りができます。相談は無料です。</p>
      <p>障害年金の相談では、初診日・通院歴・現在の生活状況を聞かれます。通院歴のメモを持っていくと、相談がスムーズです。</p>

      <h2>ステップ4: 医師に診断書を依頼する</h2>
      <p>年金事務所でもらった様式で、主治医に診断書を依頼します。診断書には「障害認定日」(原則、初診日から1年6か月を経過した日)時点、または現在の状態を書いてもらいます。</p>
      <ul>
        <li>障害認定日の時点で障害の状態に該当していた場合 → 認定日での請求(さかのぼりの請求ができる場合があります)</li>
        <li>認定日には該当せず、その後悪化した場合 → 事後重症による請求(請求日の翌月分から)</li>
      </ul>
      <p>診断書は、医師が診察室で見えている範囲の情報で書かれます。日常生活の実態を医師に伝えてから書いてもらうことが、実態に合った診断書への近道です。</p>
      <p>→ 詳しくは「<Link href="/columns/shinsatsu-mae-memo">主治医に日常の大変さが伝わらないと感じたら</Link>」</p>

      <h2>ステップ5: 病歴・就労状況等申立書を書く</h2>
      <p>自分で書く書類です。発病から現在までを期間ごとに区切り、それぞれの期間の通院状況・日常生活・就労の実態を書きます。一気に書こうとせず、メモを溜めてから整えるのがおすすめです。</p>
      <p>
        → 書き方は「<Link href="/columns/moushitatesho-kakikata">病歴・就労状況等申立書の書き方</Link>」<br />
        → 印刷・用紙は「<Link href="/columns/moushitatesho-a4-insatsu">A4印刷で提出できる?</Link>」<br />
        → 働いている方は「<Link href="/columns/hatarakinagara">働きながら障害年金は受け取れる?</Link>」
      </p>

      <h2>ステップ6: 必要書類をそろえて提出する</h2>
      <p>主な必要書類は次のとおりです(個別の状況で追加書類があります。年金事務所の案内に従ってください)。</p>
      <ul>
        <li>年金請求書</li>
        <li>医師の診断書</li>
        <li>病歴・就労状況等申立書</li>
        <li>受診状況等証明書(初診の医療機関と診断書の医療機関が異なる場合)</li>
        <li>基礎年金番号がわかるもの(年金手帳・基礎年金番号通知書など)</li>
        <li>戸籍・住民票関係の書類(マイナンバーの記載で省略できる場合があります)</li>
        <li>受け取り口座がわかるもの</li>
        <li>配偶者や子がいる場合は、その関係書類</li>
      </ul>
      <p>提出前に、診断書と申立書の内容に食い違いがないかを確認しましょう。提出先は年金事務所などです。</p>

      <h2>ステップ7: 審査と結果</h2>
      <p>提出後は日本年金機構での審査となり、結果が届くまでの目安はおおむね3か月程度とされています(状況により前後します)。結果は「年金証書」または「不支給決定通知書」などの形で届きます。不支給や等級に不服がある場合は、審査請求という不服申立ての制度があります。</p>

      <h2>全体を通してのコツ: 進み具合を見える化する</h2>
      <p>
        このように、申請は「調べる→相談する→依頼する→書く→そろえる→出す」という長い道のりです。体調に波がある中で進めるには、<strong>いま自分がどのステップにいて、何が済んでいて、何が残っているか</strong>をいつでも見える状態にしておくことが、いちばんの助けになります。
      </p>

      <AppCta ct={column.slug} />

      <div className="note-box">
        <p>※本記事は一般的な情報提供です。必要書類や手続きの詳細は個別の状況により異なります。日本年金機構の「<a href="https://www.nenkin.go.jp/service/jukyu/shougainenkin/index.html" target="_blank" rel="noopener">障害年金</a>」のページおよび年金事務所でご確認ください。(最終更新: {formatDate(column.dateModified)})</p>
      </div>

      <ColumnFooter
        currentSlug={column.slug}
        relatedSlugs={[
          "ninteibi-jigojusho",
          "shoshinbi-wakaranai",
          "nofu-yoken",
          "hatarakinagara",
          "jibun-de-shinsei",
          "moushitatesho-kakikata",
          "moushitatesho-a4-insatsu",
          "shinsatsu-mae-memo",
        ]}
      />
    </article>
  );
}
