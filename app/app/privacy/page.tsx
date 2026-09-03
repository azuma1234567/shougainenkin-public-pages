import type { Metadata } from "next";
import Link from "next/link";
import { APP_LEGAL_VERSION, APP_PRIVACY_SECTIONS } from "@/lib/app-legal";
import { SITE_NAME } from "@/lib/constants";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  `iPhoneアプリ「${SITE_NAME}」のプライバシーポリシーです。記録の端末内保存、AI機能で送信する情報、送信先、同意について説明します。`;

export const metadata: Metadata = pageMetadata({
  title: "アプリのプライバシーポリシー",
  description: DESCRIPTION,
  path: "/app/privacy",
});

const breadcrumb = breadcrumbJsonLd([
  { name: "トップ", path: "/" },
  { name: "アプリのプライバシーポリシー", path: "/app/privacy" },
]);

export default function AppPrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* サイト名とアプリ名が同じなので、どちらの版かは前後の語で見分けてもらう。
          「ウェブサイト」「iPhoneアプリ」を必ず添えること。 */}
      <aside className="legal-crosslink">
        ウェブサイト「{SITE_NAME}」(shougainenkin-note.net)の閲覧・お問い合わせ・広告に関するポリシーは
        <Link href="/privacy">ウェブサイト版のプライバシーポリシー</Link>をご覧ください。
        このページは、iPhoneアプリ「{SITE_NAME}」の記録・AI機能に関するものです。
      </aside>

      <h1>プライバシーポリシー(アプリ)</h1>

      <p className="meta-line">制定日: {APP_LEGAL_VERSION}</p>
      <p className="meta-line">運営者: あずまたいすけ(個人)</p>

      <p>
        本ポリシーは、iPhoneアプリ「{SITE_NAME}」(以下「本アプリ」)における
        情報の取扱いを説明するものです。
      </p>

      {APP_PRIVACY_SECTIONS.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {/* 本文に改行(\n)を含む条があるため pre-wrap で改行を保持する。
              指定が無いとHTMLでは改行が空白へ潰れ、箇条書きが1行に繋がる。 */}
          <p style={{ whiteSpace: "pre-wrap" }}>{section.body}</p>
        </section>
      ))}

      <p className="small-note">
        <Link href="/app/terms">iPhoneアプリ版の利用規約</Link> ／{" "}
        <Link href="/quality">情報の品質について</Link>
      </p>
    </>
  );
}
