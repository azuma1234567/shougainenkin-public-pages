import type { Metadata } from "next";
import Link from "next/link";
import { APP_STORE_URL, AUTHOR_NAME, CONTACT_EMAIL } from "@/lib/constants";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { PageDate } from "@/components/platform/Platform";

const DESCRIPTION =
  "「障害年金ノート」の運営者情報です。運営者、サイトの目的、運営のしかた(広告収入)、情報の位置づけ、お問い合わせ先をご案内します。";

export const metadata: Metadata = pageMetadata({
  title: "運営者情報",
  description: DESCRIPTION,
  path: "/about",
});

// このページの内容を変えたら、手でこの日付を更新する。
const UPDATED = "2026-09-03";

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

      <h1>運営者情報</h1>
      <PageDate updated={UPDATED} />

      <h2>このサイトについて</h2>

      <p>
        「障害年金ノート」(shougainenkin-note.net)は、障害年金の申請を考えている方とそのご家族に向けて、
        制度の仕組み、申請の流れ、診断書や申立書の準備、公開されている裁決例を、
        できるだけ平易に整理して届ける情報サイトです。
      </p>

      <p>
        このサイトが目指しているのは、本人の生活のようすと、診察室で主治医に伝わっている内容との差を
        小さくすることです。障害年金の審査は書類で行われ、書類はその差をそのまま映します。
        差を減らすための情報を、申請の段階ごとにたどれるように並べています。
      </p>

      <h2>運営者</h2>

      <p>
        個人({AUTHOR_NAME})が企画・執筆・開発・運営しています。医療機関、行政機関、
        社会保険労務士事務所ではなく、特定の事務所や団体に所属していません。
      </p>

      <p>
        執筆にあたっては、日本年金機構の公式情報、厚生労働省の通知、社会保険審査会の公開裁決例などの
        一次情報を出典として明示し、金額や期限は毎年の改定にあわせて見直しています。
        記事の作り方や見直しの基準は「
        <Link href="/quality">情報の品質について</Link>」にまとめています。
      </p>

      <h2>運営のしかた</h2>

      <p>
        このサイトは、広告収入によって運営しています。具体的には、Google AdSense による広告、
        記事内のアフィリエイト広告、社会保険労務士事務所などからの掲載料です。
        広告・PR であるものには、その旨を表示します。
      </p>

      <p>
        社会保険労務士事務所の掲載は、閲覧者が「自分でやるか、専門家に頼むか」を決めるときの
        選択肢を示すためのものです。当サイトは特定の事務所を推薦・選定せず、依頼の仲介や斡旋も行いません。
        相談や依頼は、閲覧者ご自身が事務所へ直接行ってください。掲載の条件は「
        <Link href="/ads">広告掲載について</Link>」をご覧ください。
      </p>

      <h2>情報の位置づけ</h2>

      <p>
        このサイトの内容は一般的な情報提供であり、医療上の診断や、障害年金の受給可否・等級の判断を
        行うものではありません。審査は日本年金機構が行い、結果は個々の状況と提出書類によって異なります。
        個別の判断は主治医、年金事務所、社会保険労務士にご相談ください。
        制度の正式な情報は、日本年金機構のホームページと年金事務所でご確認ください。
      </p>

      <h2>iPhoneアプリ「障害年金申請サポート」</h2>

      <p>
        運営者は、日々の状態や診察の内容を記録し、申立書の下書きを整えるための iPhone アプリ
        「障害年金申請サポート」も開発しています。記録は端末の中に保存され、AI機能を使うときだけ、
        選んだ文章が処理のために送信されます。このサイトとは別に、アプリの
        <Link href="/app/terms">利用規約</Link>と
        <Link href="/app/privacy">プライバシーポリシー</Link>を定めています。
      </p>

      <p>
        App Store:{" "}
        <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer external">
          障害年金申請サポート
        </a>
      </p>

      <h2>お問い合わせ</h2>

      <p>
        メール: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <p>
        記事の誤りのご指摘、掲載のご相談、アプリの使い方のご質問は、いずれもこのアドレスへお送りください。
        個人での運営のため、返信に数日いただくことがあります。アプリの使い方は「
        <Link href="/support">サポート</Link>」にもまとめています。
      </p>
    </>
  );
}
