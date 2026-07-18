import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter from "@/components/ColumnFooter";
import { columnJsonLd, columnMetadata, formatDate, getColumn } from "@/lib/columns";

const column = getColumn("shinsatsu-mae-memo");

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
        主治医に日常の大変さが伝わらないと感じたら —
        診察前メモで生活の実態を伝える方法
      </h1>

      <p className="meta-line">
        公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}
        / 最終更新日:{" "}
        <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time>
      </p>

      <ArticleToc />

      <p>
        「診察では『変わりないです』と言ってしまう」「診断書の内容が、実際の生活
        より軽く感じた」——障害年金の申請を考えている方から、よく聞く悩みです。
      </p>

      <p>
        これは主治医が悪いわけでも、あなたの伝え方が悪いわけでもありません。
        構造的な問題です。この記事では、その構造と、シンプルな対処法——
        <strong>生活の記録をメモにして渡す</strong>方法を紹介します。
      </p>

      <h2>診断書は「診察室で見えたあなた」で書かれる</h2>

      <p>
        医師があなたを直接見られるのは、診察室にいる数分〜十数分だけです。
        その場では、緊張して普段より「ちゃんと」振る舞えてしまう方も多く、
        家で寝込んでいる姿や、風呂に入れない日々は、医師からは見えません。
      </p>

      <p>
        障害年金の診断書には「日常生活能力の判定」という欄があり、食事・身辺の
        清潔保持・金銭管理と買い物・通院と服薬・対人関係・危機対応・社会性と
        いった、<strong>診察室の外の生活</strong>について医師が記入します。
        つまり、生活の実態が伝わっていないと、医師は判断材料がないまま書くことに
        なります。
      </p>

      <p>
        書き上がった診断書を受け取ったあとの確認ポイントは「
        <Link href="/columns/shindansho-kakunin">
          障害年金の診断書を受け取ったら
        </Link>
        」で解説しています。
      </p>

      <h2>社労士も勧める「生活の記録を渡す」方法</h2>

      <p>
        この問題への対処として、障害年金を扱う社会保険労務士が勧めることがある
        のが、<strong>日常生活の様子を書いたメモを主治医に渡す</strong>方法です。
        上に挙げた日常生活の項目に沿って、実際の生活の様子を短くまとめ、診察時に
        渡します。
      </p>

      <p>
        医師にとっても、短い診察時間で生活実態を把握できる資料は、診断書を書く
        うえで役に立ちます。ポイントはひとつだけ。
        <strong>事実だけを書くこと。</strong>{" "}
        大げさに書いたり、診断書の内容をお願いするような書き方をすると、かえって
        信頼を損ねます。あくまで「情報提供」です。
      </p>

      <h2>渡し方の実際</h2>

      <p>メモを渡すのに、特別な切り出し方は要りません。</p>

      <ul>
        <li>
          <strong>診察の冒頭に渡す</strong>:
          「最近の様子をメモにしてきました。読んでいただけますか」
        </li>
        <li>
          <strong>受付で渡す</strong>:
          診察室で切り出すのが難しければ、受付で「先生にお渡しください」と預ける
          方法もあります
        </li>
        <li>
          <strong>添え書きを付ける</strong>:
          メモの冒頭に一言添えると、渡しやすくなります
        </li>
      </ul>

      <p>添え書きの文例:</p>

      <blockquote>
        <p>
          診察の時間内では伝えきれない日常の様子をメモにしました。
          診察のご参考になれば幸いです。
        </p>
      </blockquote>

      <p>
        分量はA4で1枚以内、長くても数百字に収めます。医師が診察の合間に読める
        分量であることが大切です。
      </p>

      <p>
        もし医師が受け取りに消極的だったら、無理に渡し続ける必要はありません。
        主治医との関係はこれからの治療にとっても大切です。その場合も、メモを
        作ること自体には次の価値があります。
      </p>

      <h2>渡せなくても、「見ながら話す台本」になる</h2>

      <p>
        診察で言いたいことが言えないのは、その場で思い出せない・言葉にできない
        からです。事前に生活の様子をメモにしておけば、渡さなくても、
        <strong>見ながら話すだけで伝わる量が変わります。</strong>
        「今日はこれだけは伝える」という項目を決めておくのも有効です。
      </p>

      <h2>メモの作り方と続け方</h2>

      <p>その日あったことを、その日のうちに1〜2行残す。これだけで十分です。</p>

      <ul>
        <li>「今日は起きられず、夕方まで横になっていた」</li>
        <li>「スーパーでレジに並べず、何も買わずに帰った」</li>
        <li>「母に言われて3日ぶりに入浴した」</li>
      </ul>

      <p>
        日々の短いメモが溜まると、診察で渡せる資料の材料になり、そのまま病歴・
        就労状況等申立書を書くときの記録にもなります(申立書の書き方は「
        <Link href="/columns/moushitatesho-kakikata">
          病歴・就労状況等申立書の書き方
        </Link>
        」で解説しています)。書けない日があっても
        構いません。書けた日の記録だけで、十分に意味があります。
      </p>

      <AppCta ct={column.slug} />

      <h2>まとめ</h2>

      <ul>
        <li>
          診断書は診察室で見えた様子をもとに書かれる。生活の実態は伝えなければ
          伝わらない
        </li>
        <li>
          日常生活の様子を短いメモにして渡す方法は、社労士も勧めることがある
          実践的な対処法
        </li>
        <li>事実だけを書く。お願いや誇張はしない</li>
        <li>
          渡すのが難しければ、受付で預ける・添え書きを付ける・渡さずに見ながら
          話す、でもよい
        </li>
        <li>日々の1〜2行のメモが、診察の資料にも申立書の材料にもなる</li>
      </ul>

      <div className="note-box">
        <p>
          ※本記事は一般的な情報提供です。診断書の記載内容は医師の医学的判断に
          よるものであり、本記事の方法は特定の記載や受給を保証するものでは
          ありません。(最終更新: {formatDate(column.dateModified)})
        </p>
      </div>

      <ColumnFooter
        currentSlug={column.slug}
        relatedSlugs={[
          "moushitatesho-kakikata",
          "moushitatesho-a4-insatsu",
          "shinsei-nagare",
        ]}
      />
    </article>
  );
}
