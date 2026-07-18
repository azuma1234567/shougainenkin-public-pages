import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  `「${SITE_NAME}」のサポートページです。よくあるご質問とお問い合わせ先をご案内します。`;

export const metadata: Metadata = pageMetadata({
  title: "サポート",
  description: DESCRIPTION,
  path: "/support",
});

const breadcrumb = breadcrumbJsonLd([
  { name: "トップ", path: "/" },
  { name: "サポート", path: "/support" },
]);

export default function SupportPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <h1>サポート</h1>

      <p>
        「{SITE_NAME}」をご利用いただきありがとうございます。
        お困りのことがあれば、このページをご確認のうえ、お気軽にお問い合わせください。
      </p>

      <h2>よくあるご質問</h2>

      <h3>Q. 記録が消えてしまいました / 機種変更でデータを移せますか?</h3>
      <p>
        記録はお使いの端末の中に保存されており、運営者のサーバーにはありません。
        そのため、アプリを削除すると記録も削除され、運営者側で復元することはできません。
        機種変更の際は、事前にバックアップ機能(プレミアムプラン)でファイルを保存し、
        新しい端末で読み込んでください。
      </p>

      <h3>Q. AIの回数上限に達しました。</h3>
      <p>
        無料プランでは、AIによる文章の整えを月75回(1日25回)までご利用いただけます。
        1日の上限に達した場合は翌日、月間の上限に達した場合は翌月になると、
        再びAI機能をご利用いただけます。
        通信エラーなどで失敗した分は、回数に数えていません。
      </p>

      <h3>Q. プレミアムプランの解約方法は?</h3>
      <p>
        購入はApp StoreのアカウントIDに請求されます。解約は、お使いの端末の
        「設定」→ Apple ID →「サブスクリプション」からいつでも行えます。
        アプリを削除しただけでは解約になりませんのでご注意ください。
      </p>

      <h3>Q. アプリの内容をそのまま提出すれば受給できますか?</h3>
      <p>
        本アプリは申請準備を補助する記録・整理ツールで、受給を保証するものではありません。
        提出前に必ずご自身で内容を確認し、必要に応じて医師・年金事務所・社会保険労務士
        などの専門家にご相談ください。
      </p>

      <h2>お問い合わせ</h2>

      <p>
        メール:{" "}
        <strong>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </strong>
      </p>

      <p>お問い合わせの際は、次の情報を添えていただけるとスムーズです。</p>
      <ul>
        <li>お使いの機種(例: iPhone 15)とOSのバージョン</li>
        <li>アプリのバージョン(設定画面に表示されます)</li>
        <li>起きたことと、その直前の操作</li>
      </ul>

      <div className="note-box">
        <p>※個人で運営しているため、返信まで数日いただくことがあります。</p>
        <p>
          ※お問い合わせ内容に病歴などの記載は不要です。不具合の状況だけお知らせください。
        </p>
      </div>

      <p className="page-links">
        <Link href="/">トップへ戻る</Link> ・{" "}
        <Link href="/privacy">プライバシーポリシー</Link> ・{" "}
        <Link href="/terms">利用規約</Link>
      </p>
    </>
  );
}
