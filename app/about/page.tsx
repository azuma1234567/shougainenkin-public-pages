import type { Metadata } from "next";
import Link from "next/link";
import { adSourceList, HAS_ACTIVE_ADS } from "@/lib/ads";
import {
  APP_STORE_URL,
  AUTHOR_NAME,
  CONTACT_EMAIL,
  SITE_LEGAL_UPDATED,
  SITE_NAME,
} from "@/lib/constants";
import { breadcrumbJsonLd, pageMetadata, publisherJsonLd } from "@/lib/seo";

const DESCRIPTION =
  `「${SITE_NAME}」の運営者情報です。サイトの目的、運営者、情報の作り方(監修の有無・訂正の扱い)、広告についての約束、情報の位置づけ、お問い合わせ先をご案内します。`;

export const metadata: Metadata = pageMetadata({
  title: "運営者情報",
  description: DESCRIPTION,
  path: "/about",
});

const breadcrumb = breadcrumbJsonLd([
  { name: "トップ", path: "/" },
  { name: "運営者情報", path: "/about" },
]);

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(publisherJsonLd) }}
      />

      <h1>運営者情報</h1>

      <p className="meta-line">最終更新日: {SITE_LEGAL_UPDATED}</p>

      <h2>このサイトについて</h2>

      <p>
        「{SITE_NAME}」(shougainenkin-note.net)は、障害年金の申請を考えている方とそのご家族に向けて、
        制度の仕組み、申請の流れ、診断書や申立書の準備、公開されている裁決例を整理して届けるサイトです。
      </p>

      <p>
        障害年金の審査は書類で行われます。そして書類には、本人が日々どう暮らしているかと、
        診察室で主治医に伝わっている内容との差が、そのまま映ります。
        この差を小さくするための材料を、申請の段階ごとにたどれる形で並べています。
      </p>

      <h2>なぜ作っているか</h2>

      <p>
        障害年金は、病気や障害で生活が難しくなったときに支えとなる制度です。けれど実際には、
        そもそも制度を知らなかった、自分が対象になるとは思わなかった、調べてみたが難しくて途中でやめた
        ——そうした理由で、使えるはずの制度にたどり着けないことがあります。
        知っていたかどうかで、その後の暮らしが変わってしまうことがあります。
      </p>

      <p>
        必要としている人が、必要な情報にたどり着ける場所をつくる。それが、このサイトを始めた理由です。
      </p>

      <p>
        このサイトだけで問題が解決するとは考えていません。それでも、情報を見つけやすくすること、
        難しい制度を少しでも分かりやすくすること、「自分の場合はどうなのだろう」と迷っている人が
        次の一歩を考えられる材料を届けることは、支えのひとつになると考えています。
      </p>

      <p>記事はすべて無料で、会員登録もなく読めます。読んだ方が、何かを返す必要はありません。</p>

      <h2>運営者</h2>

      <p>
        <strong>{AUTHOR_NAME}</strong>
      </p>

      <p>
        「{SITE_NAME}」の企画・編集・開発・運営を行っています。医療機関、行政機関、
        社会保険労務士事務所ではなく、特定の事務所や団体に所属していません。
      </p>

      <h2>情報の作り方</h2>

      <p>
        記事は、日本年金機構および厚生労働省の公表資料、法令や通知、社会保険審査会の公開裁決例といった
        一次資料に基づいて書いています。根拠となる資料と、内容を確認した日を各ページに示しています。
        金額や期限は毎年4月の改定にあわせて見直しています。記事の作り方と見直しの基準は「
        <Link href="/quality">情報の品質について</Link>」にまとめています。
      </p>

      <p>
        医師や社会保険労務士による監修は受けていません。そのぶん、出典をたどれる形にすることと、
        断定を避けることを、書くうえでの原則にしています。
      </p>

      <p>
        誤りのご指摘は歓迎します。いただいた内容は一次資料と照らして確認し、修正した場合は、
        そのページの更新日を改めます。
      </p>

      {/* /quality からこの節の約束へリンクするため、見出しに id を置く。 */}
      <h2 id="ad-promises">運営のしかたと、広告についての約束</h2>

      {/* 収益源の列挙だけを lib/ads.ts のフラグで出し分ける。
          続く約束6項目は、未導入のうちから掲げておくことに意味があるので常時表示する。 */}
      <p>
        このサイトは、広告収入によって
        {HAS_ACTIVE_ADS ? "運営しています" : "運営することを予定しています"}。
        具体的には、{adSourceList("about")}です。
      </p>

      <p>読んでくださる方の利益を、広告主の利益より先に置きます。そのために、次のことを守ります。</p>

      <ul>
        <li>記事はすべて無料で、会員登録もなく読めるようにします。</li>
        <li>広告・PR であるものには、その表示を付けます。記事と広告を混ぜません。</li>
        <li>掲載料の額によって、掲載の順序や、記事の内容を変えません。</li>
        <li>
          不安をあおって相談や契約へ誘導しません。「必ず受給できる」といった表現の広告は掲載しません。
        </li>
        <li>
          特定の事務所を推薦・選定しません。依頼の仲介や斡旋も行わず、
          閲覧された方の情報を事務所へ渡しません。
        </li>
        <li>記事に何を書くかは、広告主から独立して決めます。</li>
      </ul>

      <p>
        掲載の条件は「<Link href="/ads">広告掲載について</Link>」に、情報の取扱いは「
        <Link href="/privacy">プライバシーポリシー</Link>」に定めています。
      </p>

      <h2>情報の位置づけ</h2>

      <p>
        このサイトの内容は一般的な情報提供であり、医療上の診断や、障害年金の受給可否・等級の判断を
        行うものではありません。審査は日本年金機構が行い、結果は個々の状況と提出書類によって異なります。
        個別の判断が必要な場合は、主治医、年金事務所、社会保険労務士にご相談ください。
        制度の正式な情報は、日本年金機構のホームページと年金事務所でご確認ください。
      </p>

      <h2>iPhoneアプリ版について</h2>

      <p>
        日々の状態や診察の内容を記録し、申立書の下書きを整えるための iPhone アプリも提供しています。
        記録は端末の中に保存され、AI機能を使うときだけ、選んだ文章が処理のために送信されます。
        サイトとは別に、<Link href="/app/terms">iPhoneアプリ版の利用規約</Link>と
        <Link href="/app/privacy">プライバシーポリシー</Link>を定めています。
      </p>

      <p>
        App Store:{" "}
        <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer external">
          iPhoneアプリ版のページ
        </a>
      </p>

      <h2>お問い合わせ</h2>

      <p>
        メール: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <p>
        記事の誤りのご指摘、掲載のご相談、アプリの使い方のご質問は、いずれもこのアドレスへお送りください。
        返信に数日いただくことがあります。アプリの使い方は「
        <Link href="/support">サポート</Link>」にもまとめています。
      </p>
    </>
  );
}
