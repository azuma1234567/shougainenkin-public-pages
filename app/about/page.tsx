import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

const DESCRIPTION = `「${SITE_NAME}」の運営者情報です。開発・運営の目的とお問い合わせ先をご案内します。`;

export const metadata: Metadata = pageMetadata({
  title: "運営者情報",
  description: DESCRIPTION,
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <h1>運営者情報</h1>

      <p>
        「{SITE_NAME}」は、個人開発者 あずまたいすけ が開発・運営しています。
      </p>

      <p>
        精神疾患のある方が障害年金の申請準備をひとりで抱え込まなくて済むように、
        記録・整理のためのアプリと、このサイトのコラムを提供しています。
      </p>

      <p>
        本サイトおよびアプリは、医療診断や受給可否の判断を行うものではありません。
        個別のご事情については、医師・年金事務所・社会保険労務士などの専門家に
        ご相談ください。
      </p>

      <p>
        お問い合わせ: <Link href="/support">サポートページ</Link>をご覧ください。
      </p>

      <p className="page-links">
        <Link href="/">トップへ戻る</Link> ・{" "}
        <Link href="/columns">コラム</Link> ・{" "}
        <Link href="/support">サポート</Link>
      </p>
    </>
  );
}
