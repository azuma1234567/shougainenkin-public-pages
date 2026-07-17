import type { Metadata } from "next";
import AppCta from "@/components/AppCta";
import ColumnFooter from "@/components/ColumnFooter";
import { columnJsonLd, formatDate, getColumn } from "@/lib/columns";

const column = getColumn("moushitatesho-a4-insatsu");

export const metadata: Metadata = {
  title: column.title,
  description: column.description,
};

export default function Page() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }}
      />

      <h1>
        病歴・就労状況等申立書はA4印刷で提出できる?用紙の入手方法と印刷のコツ
      </h1>

      <p className="meta-line">
        公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}
        / 最終更新日:{" "}
        <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time>
      </p>

      <p>
        障害年金の申請で自分が書く書類「病歴・就労状況等申立書」。いざ書こうと
        して、「用紙はどこでもらうの?」「家のプリンタはA4までしか刷れないけど
        大丈夫?」と手が止まる方は少なくありません。
      </p>

      <p>
        この記事では、用紙の入手方法と、A4印刷での提出について、実務でどう
        扱われているかを整理します。
      </p>

      <h2>用紙の入手方法は3つ</h2>

      <p>病歴・就労状況等申立書の様式は、次のいずれかで入手できます。</p>

      <ol>
        <li>
          <strong>年金事務所や街角の年金相談センターでもらう</strong>
          (申請の相談に行くと一式渡されます)
        </li>
        <li>
          <strong>日本年金機構のホームページからダウンロードする</strong>
          (PDF形式とExcel形式が公開されています)
        </li>
        <li>
          <strong>ダウンロードしたExcel様式にパソコンで入力して作成する</strong>
        </li>
      </ol>

      <p>
        ダウンロードは日本年金機構の「
        <a
          href="https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/20140516.html"
          target="_blank"
          rel="noopener"
        >
          病歴・就労状況等申立書を提出するとき
        </a>
        」のページから行えます。記載要領(書き方の説明)も同じページにあります。
      </p>

      <h2>原本はA3サイズ。A4で印刷して提出できる?</h2>

      <p>
        年金事務所で渡される用紙はA3サイズの両面です。一方、家庭用プリンタの
        多くはA4までしか印刷できません。
      </p>

      <p>
        結論として、
        <strong>A4サイズで印刷したものも、実務では広く受け付けられています。</strong>{" "}
        日本年金機構自身が、家庭のプリンタで印刷することを前提としたPDF・Excel
        様式を公開していることからも、A4での作成が想定されていることがわかります。
        社会保険労務士の実務情報でも、A4サイズ・片面・白黒印刷で問題なく受理される
        という案内が一般的です。
      </p>

      <p>A4で提出する場合のポイントは2つです。</p>

      <ul>
        <li>
          <strong>
            枚数が複数になる場合は、ばらばらにならないようホチキスなどで留める
          </strong>
        </li>
        <li>記入欄が小さく感じる場合は無理に詰め込まず、続紙(別紙)を使う</li>
      </ul>

      <p>
        ただし、公式に「A4可」と明文化されているわけではないため、
        <strong>
          心配な場合は提出前に管轄の年金事務所へ一言確認しておくと安心です。
        </strong>{" "}
        電話で「ホームページの様式をA4で印刷して提出してよいですか」と聞くだけで
        済みます。
      </p>

      <h2>手書きとパソコン作成、どちらでもよい</h2>

      <p>
        申立書は手書きである必要はありません。Excel様式への入力や、パソコンで
        作成したものの印刷でも受け付けられています。手の震えや集中の続きにくさが
        ある方は、無理に手書きにこだわらなくて大丈夫です。
      </p>

      <h2>自宅にプリンタがない・A3で原寸印刷したい場合</h2>

      <p>
        コンビニのマルチコピー機はA3印刷に対応しています。作成した申立書をPDFに
        して、セブン‐イレブンの「ネットプリント」やローソン・ファミリーマートの
        「ネットワークプリント」に登録すれば、原寸のA3で印刷できます。
      </p>

      <p>手順はシンプルです。</p>

      <ol>
        <li>申立書をPDFで保存する</li>
        <li>
          各コンビニの印刷サービス(アプリまたはWebサイト)にPDFを登録し、
          予約番号を受け取る
        </li>
        <li>
          店頭のマルチコピー機で予約番号を入力し、用紙サイズにA3を選んで印刷する
        </li>
      </ol>

      <AppCta ct={column.slug} />

      <h2>まとめ</h2>

      <ul>
        <li>
          様式は年金事務所でもらうか、日本年金機構のホームページからダウンロード
          できる
        </li>
        <li>
          A4印刷での提出は実務で広く受け付けられている(複数枚はホチキス留め。
          不安なら年金事務所に確認)
        </li>
        <li>手書きでもパソコン作成でもよい</li>
        <li>A3で原寸印刷したいときはコンビニのネットプリントが使える</li>
      </ul>

      <p>
        用紙の問題は、実は申請のつまずきポイントの中でいちばん簡単に解決できる
        部分です。安心して、中身を書くことに集中してください。
      </p>

      <div className="note-box">
        <p>
          ※本記事は一般的な情報提供であり、個別の申請の受理・受給を保証するもの
          ではありません。様式や取り扱いは変更されることがあります。最新の情報は
          日本年金機構および管轄の年金事務所でご確認ください。(最終更新:{" "}
          {formatDate(column.dateModified)})
        </p>
      </div>

      <ColumnFooter currentSlug={column.slug} />
    </article>
  );
}
