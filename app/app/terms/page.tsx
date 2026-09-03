import type { Metadata } from "next";
import Link from "next/link";
import { APP_LEGAL_VERSION, APP_TERMS_SECTIONS } from "@/lib/app-legal";
import { SITE_NAME } from "@/lib/constants";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  `iPhoneアプリ「${SITE_NAME}」の利用規約です。アプリでできること、AI機能の使い方、料金、免責について定めています。`;

export const metadata: Metadata = pageMetadata({
  title: "アプリの利用規約",
  description: DESCRIPTION,
  path: "/app/terms",
});

const breadcrumb = breadcrumbJsonLd([
  { name: "トップ", path: "/" },
  { name: "アプリの利用規約", path: "/app/terms" },
]);

export default function AppTermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <aside className="legal-crosslink">
        本サイト(shougainenkin-note.net)の閲覧に関する規約は
        <Link href="/terms">利用規約</Link>をご覧ください。
        このページは、iPhoneアプリ「{SITE_NAME}」の利用条件です。
      </aside>

      <h1>利用規約(アプリ)</h1>

      <p className="meta-line">最終改定日: {APP_LEGAL_VERSION}</p>
      <p className="meta-line">運営者: あずまたいすけ(個人)</p>

      {APP_TERMS_SECTIONS.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {/* 本文に改行(\n)を含む条(禁止事項の箇条書き、免責事項、お問い合わせ)が
              あるため、pre-wrap で改行を保持する。 */}
          <p style={{ whiteSpace: "pre-wrap" }}>{section.body}</p>
        </section>
      ))}

      <p className="small-note">
        <Link href="/app/privacy">アプリのプライバシーポリシー</Link> ／{" "}
        <Link href="/quality">情報の品質について</Link>
      </p>
    </>
  );
}
