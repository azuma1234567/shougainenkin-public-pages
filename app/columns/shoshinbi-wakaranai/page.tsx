import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter from "@/components/ColumnFooter";
import { columnJsonLd, columnMetadata, formatDate, getColumn } from "@/lib/columns";

const column = getColumn("shoshinbi-wakaranai");

export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }}
      />

      <Breadcrumb current={column.title} />

      <h1>障害年金の初診日がわからない・カルテがないときの調べ方</h1>

      <p className="meta-line">
        公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}
        / 最終更新日:{" "}
        <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time>
      </p>

      <ArticleToc />

      <p>
        障害年金の申請は、「初診日をいつにするか」を確定するところから始まります。初診日は、
        <Link href="/columns/nofu-yoken">保険料納付要件</Link>
        の判定にも、障害基礎年金か障害厚生年金かの区別にも、
        <Link href="/columns/ninteibi-jigojusho">障害認定日</Link>
        の計算にも使われる、申請全体の土台です。
      </p>
      <p>
        ところが、この初診日の特定でつまずく方がとても多いのです。「最初に病院にかかったのが何年も前で覚えていない」「当時の病院のカルテがもう残っていない」——この記事では、そんなときの調べ方と対処法を解説します。
      </p>

      <h2>初診日とは — 「今の病院に最初にかかった日」ではない</h2>
      <p>
        初診日とは、<strong>障害の原因となった病気やけがについて、初めて医師または歯科医師の診療を受けた日</strong>のことです。ポイントは2つあります。
      </p>
      <ul>
        <li>
          転院していても、<strong>いちばん最初の医療機関</strong>を受診した日が初診日です。今の主治医のところに初めてかかった日ではありません。
        </li>
        <li>
          <strong>精神科の受診日とは限りません。</strong> 精神疾患では、最初は不眠や倦怠感、食欲不振などの体調不良として内科やかかりつけ医を受診していることがよくあります。その症状が今の傷病につながるものであれば、その内科受診日が初診日となる場合があります。
        </li>
      </ul>
      <p>
        「どこまでさかのぼるのか」は個別の判断になる部分なので、迷う場合は年金事務所に相談しながら決めていきます。
      </p>

      <h2>初診日を証明する書類 — 受診状況等証明書</h2>
      <p>
        初診の医療機関と、診断書を書いてもらう医療機関が異なる場合は、初診の医療機関に<strong>「受診状況等証明書」</strong>を書いてもらい、初診日を証明します。カルテに基づいて医療機関が作成する書類で、様式は年金事務所でもらえるほか、日本年金機構のホームページからもダウンロードできます。
      </p>
      <p>
        まずは記憶をたどって、最初にかかった医療機関に電話で問い合わせてみましょう。「◯年ごろ受診した記録が残っているか」「受診状況等証明書を書いてもらえるか」の2点を聞けば十分です。
      </p>

      <h2>カルテが残っていないとき</h2>
      <p>
        医療機関のカルテの保存義務は5年とされているため、受診から年月が経っていると、カルテが破棄されていることがあります。廃院している場合もあります。それでも道が閉ざされるわけではありません。
      </p>
      <p>
        <strong>① 2番目以降の医療機関で証明を取る。</strong> 2番目にかかった医療機関のカルテに「◯◯クリニックから紹介」「◯年から△△医院に通院していた」といった記載があれば、それが初診日の参考資料になります。古い順に、記録が残っている医療機関を探していきます。
      </p>
      <p>
        <strong>② 「受診状況等証明書が添付できない申立書」+参考資料で申し立てる。</strong> どの医療機関でも証明が取れない場合は、その旨を申し立てる書類を提出し、あわせて当時の受診を示す参考資料を添付します。参考資料の例:
      </p>
      <ul>
        <li>お薬手帳、処方箋の控え</li>
        <li>診察券(日付や診療科がわかるもの)</li>
        <li>医療機関や薬局の領収書</li>
        <li>健康診断の記録</li>
        <li>障害者手帳を申請したときの診断書の写し</li>
        <li>生命保険や傷病手当金の請求時の書類</li>
        <li>第三者による証明(当時の状況を知る人の申立て)</li>
      </ul>
      <p>
        当時のものが1枚でも残っていないか、探してみてください。単体では弱い資料でも、複数組み合わせることで初診日が認められる場合があります。
      </p>

      <h2>探す作業も、記録しながら進める</h2>
      <p>
        初診日探しは「電話する→記録の有無を聞く→結果をメモする」の繰り返しです。体調に波がある中でこの作業をするのは大変なので、問い合わせた医療機関と結果を一覧にして、少しずつ進めることをおすすめします。
      </p>

      <AppCta ct={column.slug} />

      <h2>まとめ</h2>
      <ul>
        <li>初診日は「その傷病で最初に医師の診療を受けた日」。精神疾患では内科の受診日になることもある</li>
        <li>初診の医療機関と診断書の医療機関が違うときは、受診状況等証明書で証明する</li>
        <li>カルテがなくても、2番目以降の医療機関の記録や、お薬手帳・領収書などの参考資料で申し立てる道がある</li>
        <li>迷ったら年金事務所に相談しながら進める</li>
      </ul>

      <div className="note-box">
        <p>
          ※本記事は一般的な情報提供であり、初診日の認定や受給を保証するものではありません。個別の判断については年金事務所や社会保険労務士にご相談ください。(最終更新: {formatDate(column.dateModified)})
        </p>
      </div>

      <ColumnFooter
        currentSlug={column.slug}
        relatedSlugs={["nofu-yoken", "shinsei-nagare"]}
      />
    </article>
  );
}
