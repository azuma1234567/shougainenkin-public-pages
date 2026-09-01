import type { Metadata } from "next";
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
        機種変更の際は、事前に無料のバックアップ機能でファイルを保存し、
        新しい端末で読み込んでください。
      </p>

      <h3>Q. AIの回数上限に達しました。</h3>
      <p>AI機能は月400回まで無料です。月が変わると再び使えます。メモの保存と閲覧、書類のプレビュー、申請ガイドはそのまま使えます。通信エラーや固定の文章だけの応答は数えません。</p>
      <h3>Q. 以前の購読はどうすればよいですか?</h3>
      <p>全機能無料となり、購読の継続は不要です。App Store のサブスクリプション管理から解約できます。解約しても機能は変わりません。</p>

      <h3>Q. 購入を復元できますか?</h3>
      <p>
        同じストアアカウントをお使いの端末では、アプリの設定にある「購入の復元」から、
        有効な伝えるプランを復元できます。
      </p>

      <h3>Q. 「これからの整理」で話した内容は残りますか?</h3>
      <p>
        残りません。やり取りは端末の中だけで進み、画面を閉じると消えます。
        運営者のサーバーにも保存されず、過去のやり取りを見返す機能もありません。
        残しておきたいときは、区切りの画面で、あなたが書いた言葉だけを
        「今日のメモ」へ移すことができます。
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
    </>
  );
}
