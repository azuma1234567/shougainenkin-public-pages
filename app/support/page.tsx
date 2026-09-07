import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";
import { TOOLS } from "@/data/dougu";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { PageDate } from "@/components/platform/Platform";

/* 原稿: docs/about-quality-support-2026-09-07-instructions.md §3。
   道具の表の名前は data/dougu.ts の TOOLS から(直書きしない)。
   端末に残るものは各道具の実装(lib/*-storage.ts と components/tools/*)のとおり。 */

const DESCRIPTION =
  "サイトの道具(等級の目安・金額・書類・年金事務所・申立書・工賃・更新)で何が端末に残るか、不具合の連絡に添えるもの、iPhoneアプリのよくある質問、連絡先。";

export const metadata: Metadata = pageMetadata({
  title: "お問い合わせ・サポート",
  description: DESCRIPTION,
  path: "/support",
});

// このページの内容を変えたら、手でこの日付を更新する。
const UPDATED = "2026-09-08";

const breadcrumb = breadcrumbJsonLd([
  { name: "トップ", path: "/" },
  { name: "お問い合わせ・サポート", path: "/support" },
]);

/* 道具ごとに、端末に残るものと残さない方法。名前は TOOLS から。 */
const TOOL_STORAGE = [
  { id: "mitate", keeps: "結果画面で「この端末に残す」を押したときだけ、答えを保存", avoid: "押さなければ何も残らない" },
  { id: "kingaku", keeps: "何も残らない", avoid: "—" },
  { id: "shorui", keeps: "チェックの状態を自動で保存", avoid: "「共用のパソコンを使っています」を押す" },
  { id: "madoguchi", keeps: "選んだ都道府県と市区町村を自動で保存", avoid: "「共用のパソコンを使っています」を押す" },
  { id: "moushitatesho", keeps: "下書きを自動で保存(この端末だけ)。ファイルへの書き出し・読み込みもできる", avoid: "「共用のパソコンなので、この端末に残さない」にチェック。「この端末の下書きを消す」で削除" },
  { id: "kougin", keeps: "「この端末に保存する」を押したときだけ", avoid: "押さなければ何も残らない。「入力を消す」で削除" },
  { id: "koushin", keeps: "「この端末に保存する」を押したときだけ", avoid: "同上" },
] as const;

export default function SupportPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <h1>お問い合わせ・サポート</h1>
      <PageDate updated={UPDATED} />

      <h2>サイトの道具について</h2>
      <p>
        7本の道具は、どれも入力した内容をサーバーへ送りません。計算は端末のブラウザの中だけで行います。何が端末に残るかは、道具ごとに違います。
      </p>
      <div className="article-table-wrap" tabIndex={0}>
        <table>
          <thead>
            <tr><th scope="col">道具</th><th scope="col">端末に残るもの</th><th scope="col">残さない方法</th></tr>
          </thead>
          <tbody>
            {TOOL_STORAGE.map((row) => (
              <tr key={row.id}>
                <td><Link href={TOOLS[row.id].path}>{TOOLS[row.id].name}</Link></td>
                <td>{row.keeps}</td>
                <td>{row.avoid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        残るのは、お使いのブラウザの保存領域(localStorage)です。ブラウザの閲覧データを消すと、一緒に消えます。運営者はこの内容を見ることができません。
      </p>

      <h3>道具がうまく動かないとき</h3>
      <p>
        次を添えて <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> へお知らせください。入力した内容(病名・日付・金額など)は書かないでください。不具合の再現に必要ありません。
      </p>
      <ul>
        <li>お使いの端末とブラウザ(例: iPhone の Safari、Windows の Chrome)</li>
        <li>どの道具の、どの画面で</li>
        <li>何をしたら、何が起きたか(できれば画面の写真。入力内容が写らないように)</li>
      </ul>

      <h3>記事の誤りに気づいたとき</h3>
      <p>
        「<Link href="/quality">情報の作り方</Link>」の「誤りのご連絡」へ。直した場合は「訂正の記録」に残します。
      </p>

      <h2>iPhoneアプリについて</h2>

      <h3>Q. 記録が消えてしまいました / 機種変更でデータを移せますか</h3>
      <p>
        記録はお使いの端末の中に保存されており、運営者のサーバーにはありません。
        そのため、アプリを削除すると記録も削除され、運営者側で復元することはできません。
        機種変更の際は、事前に無料のバックアップ機能でファイルを保存し、
        新しい端末で読み込んでください。
      </p>

      <h3>Q. AIの回数上限に達しました</h3>
      <p>AI機能は月400回まで無料です。月が変わると再び使えます。メモの保存と閲覧、書類のプレビュー、申請ガイドはそのまま使えます。通信エラーや固定の文章だけの応答は数えません。</p>

      <h3>Q. 以前の購読(伝えるプラン)はどうすればよいですか</h3>
      <p>
        全機能が無料になったため、購読の継続は不要です。App Store のサブスクリプション管理から解約できます。解約しても使える機能は変わりません。
        過去に購入した方が「購入の復元」を押しても、機能は変わりません(復元の操作は不要です)。
      </p>

      <h3>Q. 「これからの整理」で話した内容は残りますか</h3>
      <p>
        残りません。やり取りは端末の中だけで進み、画面を閉じると消えます。運営者のサーバーにも保存されず、過去のやり取りを見返す機能もありません。残しておきたいときは、区切りの画面で、本人が書いた言葉だけを「今日のメモ」へ移すことができます。
      </p>

      <h3>Q. アプリの内容をそのまま提出すれば受給できますか</h3>
      <p>
        本アプリは申請準備を補助する記録・整理ツールで、受給を保証するものではありません。
        提出前に必ずご自身で内容を確認し、必要に応じて医師・年金事務所・社会保険労務士
        などの専門家にご相談ください。
      </p>

      <h3>アプリの不具合の連絡に添えるもの</h3>
      <ul>
        <li>お使いの機種(例: iPhone 15)とOSのバージョン</li>
        <li>アプリのバージョン(設定画面に表示されます)</li>
        <li>起きたことと、その直前の操作</li>
      </ul>

      <h2>お問い合わせ</h2>

      <p>
        メール:{" "}
        <strong>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </strong>
      </p>

      <p>
        記事の誤り、道具の不具合、アプリの使い方、広告掲載のご相談は、いずれもこのアドレスへ。返信に数日いただくことがあります。病歴などの記載は不要です。
      </p>
    </>
  );
}
