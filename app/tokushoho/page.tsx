import type { Metadata } from "next";
import Link from "next/link";
import { AUTHOR_NAME, CONTACT_EMAIL, SITE_LEGAL_UPDATED, SITE_NAME } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  `「${SITE_NAME}」の広告掲載に関する、特定商取引法に基づく表記です。`;

// 有料掲載を受け付けるまでは未確定の項目が残るため、検索結果に出さない。
// 【 】をすべて埋めたら DRAFT を false にして、app/sitemap.ts にも追加する。
const DRAFT = true;

export const metadata: Metadata = {
  ...pageMetadata({
    title: "特定商取引法に基づく表記",
    description: DESCRIPTION,
    path: "/tokushoho",
  }),
  robots: DRAFT ? { index: false, follow: false } : { index: true, follow: true },
};

export default function TokushohoPage() {
  return (
    <>
      <h1>特定商取引法に基づく表記</h1>

      <p className="meta-line">最終更新日: {SITE_LEGAL_UPDATED}</p>

      {DRAFT ? (
        <aside className="legal-crosslink">
          有料の広告掲載は、まだ受け付けていません。
          このページは準備中で、【 】の項目は有料掲載を開始する時点で確定します。
          掲載のご相談は「<Link href="/ads">広告掲載について</Link>」をご覧ください。
        </aside>
      ) : null}

      <dl className="tokushoho-list">
        <dt>販売事業者名</dt>
        <dd>{AUTHOR_NAME}</dd>

        <dt>運営責任者</dt>
        <dd>{AUTHOR_NAME}</dd>

        <dt>所在地</dt>
        <dd>請求があれば遅滞なく開示します(メールでご請求ください)</dd>

        <dt>電話番号</dt>
        <dd>請求があれば遅滞なく開示します(メールでご請求ください)</dd>

        <dt>メールアドレス</dt>
        <dd>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </dd>

        <dt>販売価格</dt>
        <dd>
          <Link href="/ads">広告掲載のご案内</Link>に記載の料金(消費税【込み/別】)
        </dd>

        <dt>商品代金以外の必要料金</dt>
        <dd>振込手数料</dd>

        <dt>支払方法</dt>
        <dd>銀行振込【・その他あれば記載】</dd>

        <dt>支払時期</dt>
        <dd>申込み確定後、運営者が指定する期日までの前払い</dd>

        <dt>提供時期</dt>
        <dd>入金確認と掲載内容の確認が完了した後、【5】営業日以内に掲載開始</dd>

        <dt>キャンセル・返金</dt>
        <dd>
          掲載開始後の返金は、運営者の責任で掲載できなかった場合を除き行いません。
          詳細は<Link href="/ads">広告掲載規約</Link>第5条〜第7条をご覧ください。
        </dd>
      </dl>
    </>
  );
}
