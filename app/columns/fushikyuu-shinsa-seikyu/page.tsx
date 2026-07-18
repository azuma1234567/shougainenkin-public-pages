import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter from "@/components/ColumnFooter";
import { columnJsonLd, columnMetadata, formatDate, getColumn } from "@/lib/columns";

const column = getColumn("fushikyuu-shinsa-seikyu");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }} />
      <Breadcrumb current={column.title} />
      <h1>障害年金が不支給・想定より低い等級だったとき — 審査請求と再請求という選択肢</h1>
      <p className="meta-line">公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}/ 最終更新日: <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time></p>
      <ArticleToc />

      <p>準備を重ねて申請した結果が「不支給」だったり、想定より低い等級だったりしたとき。落胆は大きいと思います。でも、そこで終わりではありません。結果に対して取れる道が制度として用意されています。</p>
      <p><strong>先にいちばん大事なことを: 不服申立て(審査請求)には「結果を知った日の翌日から3か月以内」という期限があります。</strong> 落ち込んでいる間に期限が過ぎてしまうことがいちばんもったいない。この記事を、次の一歩の整理に使ってください。</p>

      <h2>まず、理由を確認する</h2>
      <p>対処を考える前に、<strong>なぜその結果になったのか</strong>を確認します。不支給の通知には理由が記載されていますが、簡潔で分かりにくいことも多いものです。</p>
      <ul>
        <li>納付要件や初診日など、<strong>入口の要件</strong>で認められなかったのか</li>
        <li>障害の状態が<strong>等級に該当しない</strong>と判断されたのか</li>
      </ul>
      <p>このどちらかで、取るべき道が変わります。通知の内容が分からなければ、年金事務所に問い合わせて説明を求めることができます。</p>

      <h2>道は大きく2つ</h2>
      <p><strong>① 審査請求(不服申立て)</strong><br />決定に不服がある場合、社会保険審査官に対して審査請求ができます。期限は<strong>結果を知った日の翌日から3か月以内</strong>。審査請求の結果にも不服がある場合は、さらに社会保険審査会への<strong>再審査請求</strong>(2か月以内)ができます。</p>
      <p>審査請求は「同じ資料で再判定してもらう」だけでは結果が変わりにくく、<strong>当初の判断のどこに誤りがあるかを、根拠をもって主張する</strong>手続きです。専門性が高い領域なので、障害年金の不服申立てを扱う社会保険労務士への相談を検討する価値が大きい場面です(「<Link href="/columns/jibun-de-shinsei">自分で申請するか社労士に依頼するか</Link>」)。</p>
      <p><strong>② あらためて請求し直す(再請求)</strong><br />症状が変わった、前回は書類に実態を書ききれていなかった——そうした場合は、新しい診断書と申立書で<strong>もう一度請求し直す</strong>道があります。事後重症の枠組みでの再請求です。期限の制約はありませんが、認められた場合の支給は請求日の翌月分からになります。</p>
      <p>「審査請求で争う」か「書類を立て直して再請求する」かは、不支給の理由によって向き不向きがあります。理由の確認が先、と言ったのはこのためです。</p>

      <h2>次に向けて、記録を積み直す</h2>
      <p>どちらの道を選ぶにしても、力になるのは<strong>日常生活の実態を示す材料</strong>です。前回の書類で伝えきれなかったことは何か。診断書に生活の実態は反映されていたか(「<Link href="/columns/shindansho-kakunin">診断書を受け取ったときの確認ポイント</Link>」)。日々の記録を積み直すことは、再請求の準備そのものです。</p>
      <p>一度の結果は、あなたの大変さを否定するものではありません。制度の手続き上の判定にすぎません。期限だけ押さえて、休みながら、次の一歩を考えてください。</p>

      <AppCta ct={column.slug} />
      <h2>まとめ</h2>
      <ul>
        <li>審査請求の期限は「結果を知った日の翌日から3か月以内」。まずこれだけ押さえる</li>
        <li>対処の前に、不支給の理由(入口の要件か、障害状態の判定か)を確認する</li>
        <li>道は「審査請求(→再審査請求)」と「事後重症での再請求」の2つ。理由によって向き不向きがある</li>
        <li>不服申立ては専門性が高く、社労士への相談を検討する価値が大きい場面</li>
      </ul>
      <div className="note-box"><p>※本記事は一般的な情報提供であり、審査請求や再請求の結果を保証するものではありません。期限や手続きの詳細は年金事務所にご確認ください。(最終更新: {formatDate(column.dateModified)})</p></div>
      <ColumnFooter currentSlug={column.slug} relatedSlugs={["jibun-de-shinsei", "shindansho-kakunin"]} />
    </article>
  );
}
