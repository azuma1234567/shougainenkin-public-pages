import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter, { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import { columnJsonLd, columnMetadata, formatDate, getColumn } from "@/lib/columns";

const column = getColumn("moushitatesho-kakikata");

export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }}
      />

      <Breadcrumb current={column.title} />

      <h1>
        【うつ病などの精神疾患】病歴・就労状況等申立書の書き方 —
        期間の区切り方から文例まで
      </h1>

      <p className="meta-line">
        公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}
        / 最終更新日:{" "}
        <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time>
      </p>

      <ArticleToc />

      <p>
        病歴・就労状況等申立書は、障害年金の申請書類の中で、
        <strong>自分自身の言葉で状況を伝えられる唯一の書類</strong>です。
        診断書は医師が書きますが、診察室の外での生活のしんどさ——家事ができない、
        外出できない、人と話せない——を審査に伝えられるのは、この書類だけです。
      </p>

      <p>
        その一方で、「発病から現在までを全部思い出して書く」という作業は、
        精神疾患のある方にとって、とても負担の大きいものです。この記事では、
        負担を減らしながら、審査に伝わる申立書を書くための手順を解説します。
      </p>

      <h2>この書類が審査で果たす役割</h2>

      <p>
        障害年金の審査は書類のみで行われます。中心になるのは医師の診断書ですが、
        申立書は診断書を補完し、日常生活の実態を伝える資料として扱われます。
        診断書に書かれた内容と申立書の内容が食い違っていると、審査でマイナスに
        働くことがあります。<strong>事実を、事実のとおりに、具体的に書く</strong>
        ——これが申立書の大原則です。
      </p>

      <p>
        申立書が申請全体のどの段階で必要になるかは「
        <Link href="/columns/shinsei-nagare">
          障害年金の申請の流れと必要書類
        </Link>
        」をご覧ください。
      </p>

      <h2>書く前に用意するもの</h2>

      <p>いきなり書き始めず、まず記憶の手がかりになるものを集めます。</p>

      <ul>
        <li>お薬手帳(通院の時期と処方の変化がわかります)</li>
        <li>診察券、医療機関の領収書</li>
        <li>母子手帳(先天性・幼少期からの傷病の場合)</li>
        <li>職歴のメモ(在籍期間、辞めた理由)</li>
        <li>家族に聞ける場合は、当時の様子</li>
      </ul>

      <p>
        時期が正確に思い出せなくても、「◯年ごろ」「高校を卒業した年の夏」の
        ような書き方で構いません。
      </p>

      <h2>期間の区切り方 — いちばんのつまずきポイント</h2>

      <p>
        申立書は、発病から現在までを期間ごとに区切って書きます。区切りのルールは
        次のとおりです。
      </p>

      <ul>
        <li>
          <strong>受診した医療機関ごと</strong>に区切る(転院したら新しい期間)
        </li>
        <li>
          <strong>受診していなかった期間</strong>も、飛ばさずにひとつの期間として
          書く(なぜ受診しなかったか、その間の状態はどうだったかを書く)
        </li>
        <li>
          同じ医療機関に長く通っている場合は、<strong>おおむね3〜5年ごと</strong>
          に区切る
        </li>
      </ul>

      <p>
        「通院をやめていた時期」は書きにくいものですが、審査ではむしろ重要です。
        「症状が重くて外出できず通院が途絶えた」のか「よくなったので通院しなく
        なった」のかで、伝わる内容がまったく違うからです。
      </p>

      <h2>各期間に書くべき4つの要素</h2>

      <p>
        それぞれの期間について、次の4つを意識して書くと、生活の実態が伝わる
        文章になります。
      </p>

      <ol>
        <li>
          <strong>頻度</strong> —
          どのくらいの頻度でその状態だったか(週に何日、月に何回)
        </li>
        <li>
          <strong>続いた期間</strong> — その状態がどのくらい続いたか
        </li>
        <li>
          <strong>援助の有無</strong> — 家族や周囲のどんな助けを受けていたか
        </li>
        <li>
          <strong>できなかったことの具体例</strong> —
          食事・入浴・買い物・仕事などで、具体的に何ができなかったか
        </li>
      </ol>

      <p>
        医師の診断書には「日常生活能力の判定」という欄があり、食事・身辺の清潔保持・
        金銭管理・通院と服薬・対人関係・危機対応・社会性といった項目で評価されます。
        申立書でも同じ場面(食事、入浴、買い物、通院、人づきあい)について具体的に
        書いておくと、診断書と申立書が同じ生活を別の角度から描くことになり、審査に
        伝わりやすくなります。
      </p>

      <p>
        生活の実態を医師に伝えておく方法は「
        <Link href="/columns/shinsatsu-mae-memo">
          診察前メモで生活の実態を伝える方法
        </Link>
        」で解説しています。
      </p>

      <h2>伝わる文例 — 書き直しでこう変わる</h2>

      <p>
        同じ事実でも、書き方で伝わり方が変わります。ポイントは「気持ちの言葉」を
        「具体的な事実」に置き換えることです。
      </p>

      <p>
        <strong>例1: 生活の様子</strong>
      </p>

      <ul>
        <li>書き直し前: 「毎日つらくて、何もできませんでした。」</li>
        <li>
          書き直し後:
          「週の半分ほどは朝起き上がれず、食事は母が枕元まで運んでくれる日が
          続きました。入浴は週に1回できるかどうかでした。」
        </li>
      </ul>

      <p>
        <strong>例2: 仕事の様子</strong>
      </p>

      <ul>
        <li>書き直し前: 「仕事がうまくいかず退職しました。」</li>
        <li>
          書き直し後:
          「入力ミスや聞き漏らしが続き、上司に毎回確認してもらいながら勤務して
          いましたが、出勤できない日が月に5日を超えるようになり、8か月で退職
          しました。」
        </li>
      </ul>

      <p>
        <strong>例3: 外出・対人関係</strong>
      </p>

      <ul>
        <li>書き直し前: 「人と会うのが怖かったです。」</li>
        <li>
          書き直し後:
          「近所の人に会うのが怖く、買い物は週1回、人の少ない夜の時間帯に行って
          いました。それ以外の外出は通院のみで、付き添いが必要でした。」
        </li>
      </ul>

      <p>
        つらかった気持ちを消す必要はありません。気持ちに、頻度と具体例を添える
        イメージです。
      </p>

      <h2>一気に書かない — 書けないときの対処</h2>

      <p>
        申立書がしんどい最大の理由は、「過去のつらい時期を一気に思い出す」作業
        だからです。無理に1日で書き上げようとせず、次の順番をおすすめします。
      </p>

      <ol>
        <li>まず期間の区切りだけを決める(医療機関と時期を並べるだけ)</li>
        <li>期間ごとに、思い出せたことを短いメモで溜めていく</li>
        <li>
          メモがある程度たまってから、4つの要素(頻度・期間・援助・具体例)の形に
          整える
        </li>
      </ol>

      <p>
        思い出す作業と、文章に整える作業を分けるだけで、負担はかなり軽くなります。
      </p>

      <AppCta ct={column.slug} />

      <h2>まとめ</h2>

      <ul>
        <li>申立書は、自分の言葉で生活の実態を伝えられる唯一の書類</li>
        <li>
          期間は「医療機関ごと+受診していない期間も+長い場合は3〜5年ごと」で
          区切る
        </li>
        <li>各期間は「頻度・続いた期間・援助の有無・具体例」の4要素で書く</li>
        <li>気持ちの言葉に、具体的な事実を添える</li>
        <li>一気に書かず、メモを溜めてから整える</li>
      </ul>

      <div className="note-box">
        <p>
          ※本記事は一般的な情報提供であり、受給の可否や等級を保証するものでは
          ありません。書き方に迷う場合は、年金事務所や社会保険労務士にご相談
          ください。様式と記載要領は
          <a
            href="https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/20140516.html"
            target="_blank"
            rel="noopener"
          >
            日本年金機構のホームページ
          </a>
          で確認できます。(最終更新: {formatDate(column.dateModified)})
        </p>
      </div>

      <ColumnFooter
        currentSlug={column.slug}
        relatedSlugs={[
          "moushitatesho-a4-insatsu",
          "shinsatsu-mae-memo",
          "shinsei-nagare",
        ]}
        references={[
          NENKIN_REFERENCES.moushitatesho,
          NENKIN_REFERENCES.seido,
        ]}
      />
    </article>
  );
}
