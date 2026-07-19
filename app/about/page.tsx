import type { Metadata } from "next";
import Link from "next/link";
import { AUTHOR_NAME, CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION = `「${SITE_NAME}」の運営者情報です。運営者、サイトとアプリの目的、情報の位置づけ、お問い合わせ先をご案内します。`;

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

      <h1>運営者情報</h1>

      <h2>運営者</h2>

      <p>
        「{SITE_NAME}」は、個人開発者 {AUTHOR_NAME} が開発・運営しています。
        iPhoneアプリ「{SITE_NAME}」と、このサイトのコラムの企画・開発・執筆を
        行っています。
      </p>

      <h2>このサイトとアプリの目的</h2>

      <p>
        精神疾患のある方が障害年金の申請準備をひとりで抱え込まなくて済むように、
        記録・整理のためのアプリと、申請準備に役立つコラムを提供しています。
      </p>

      <h2>情報の位置づけ</h2>

      <p>
        本サイトのコラムは、公的な制度情報や実務で広く知られている情報を、
        当事者の目線で分かりやすく整理してお届けする「一般的な情報提供」です。
        医療診断や、障害年金の受給可否・等級の判断を行うものではありません。
      </p>

      <p>
        個別のご事情についての正確な判断は、医師・年金事務所・社会保険労務士
        などの専門家にご相談ください。制度の正式な情報は、日本年金機構の
        ホームページおよび年金事務所でご確認いただけます。
      </p>

      <h2>お問い合わせ</h2>

      <p>
        メール: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <br />
        アプリの使い方やよくあるご質問は
        <Link href="/support">サポートページ</Link>をご覧ください。
      </p>

      <p className="small-note">
        ※個人で運営しているため、返信まで数日いただくことがあります。
      </p>
    </>
  );
}
