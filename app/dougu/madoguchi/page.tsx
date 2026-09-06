import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import MadoguchiTool from "@/components/tools/MadoguchiTool";
import { CHECKED_ON, COMMON_TEL } from "@/lib/madoguchi";
import { TOOLS } from "@/data/dougu";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";

const UPDATED = "2026-09-06";
const TITLE = "年金事務所を探す — 管轄と予約のしかた";

const DESCRIPTION =
  "市区町村名を打つと、管轄の年金事務所(電話・住所・機構ページ)が出ます。予約のしかたと電話で言うこと、行く日の持ち物と窓口で聞くことまで1枚に。街角の年金相談センターや市区町村の窓口に出せる場合も。入力内容は送信されません。";

const isPublished = isPublishedInternalPath("/dougu/madoguchi");

export const metadata: Metadata = {
  ...pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/dougu/madoguchi", showAppBanner: true, appBannerArgument: "https://shougainenkin-note.net/dougu/madoguchi" }),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};

/* よくある質問。本文と FAQPage の JSON-LD で同じ文字列(電話番号は data の COMMON_TEL から。JSON-LD には文字だけ)。 */
const FAQ = [
  { q: "年金事務所はどこでもいいですか", a: "相談はどこの年金事務所でもできますが、請求書の提出は原則として住所地の管轄の年金事務所です。管轄はこのページで市区町村名から引けます。" },
  { q: "予約は必要ですか", a: `相談は予約制です。予約受付専用電話(${COMMON_TEL.yoyaku})か、ネット予約(年金請求の手続き)で取れます。予約なしの場合は、当日に直接年金事務所へ行くことになります。` },
  { q: "街角の年金相談センターでも出せますか", a: "相談と請求の受付はできます。年金証書の再発行、国民年金の加入・納付、事業所の手続きは扱っていないので、これらは年金事務所へ。" },
  { q: "市役所でも出せますか", a: "障害基礎年金だけの請求なら、市区町村の国民年金の窓口にも出せます。厚生年金の請求(障害厚生年金)は年金事務所です。" },
  { q: "何を持っていけばいいですか", a: "基礎年金番号がわかるもの、本人確認書類、お薬手帳や診察券、書きかけの申立書です。必要書類は「必要書類チェックリスト」で自分の場合の分だけを出せます。" },
] as const;
const faqLd = faqJsonLd(FAQ.map((f) => ({ question: f.q, answer: f.a })));

/* 静的な本文(検索エンジンと AI に読める分。B-1-5)。 */
function StaticBody() {
  return (
    <div className="md-static">
      <section aria-labelledby="md-static-diff">
        <h2 id="md-static-diff">年金事務所と街角の年金相談センターの違い</h2>
        <p>年金事務所には住所地ごとの管轄があり、請求書の提出は原則として管轄の年金事務所です。街角の年金相談センターには管轄が無く、都道府県内のどこにお住まいでも相談と請求の受付ができます。ただし街角は、年金証書の再発行・国民年金の加入納付・事業所の手続きを扱っていません。</p>
      </section>
      <section aria-labelledby="md-static-shichouson">
        <h2 id="md-static-shichouson">市区町村の窓口に出せる場合</h2>
        <p>障害基礎年金だけの請求(初診日が国民年金の期間にある方)は、お住まいの市区町村の国民年金の窓口にも出せます。20歳前に初診日がある方も同じです。初診日が第3号被保険者(会社員・公務員の配偶者)の期間にある方は、年金事務所へ出します。</p>
      </section>
      <section aria-labelledby="md-static-yuusou">
        <h2 id="md-static-yuusou">郵送で出す</h2>
        <p>郵送でも出せます。控えを取り、送った記録が残る方法で送ってください。 → <Link href="/columns/teishutsusaki-yuusou">提出先と郵送のしかた</Link></p>
      </section>
      <section aria-labelledby="md-static-faq">
        <h2 id="md-static-faq">よくある質問</h2>
        <dl>{FAQ.map((f) => <div key={f.q}><dt>{f.q}</dt><dd>{f.a}{f.q === "何を持っていけばいいですか" && <> <Link href="/dougu/shorui">→ 必要書類チェックリスト</Link></>}</dd></div>)}</dl>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <div className="platform md-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <header className="no-print">
        <div className="p-container md-width md-top">
          <Breadcrumb
            items={[{ href: "/", label: "トップ" }, { href: "/shinsei", label: "申請の流れ" }, { label: "年金事務所を探す" }]}
            currentPath="/dougu/madoguchi"
          />
          <h1>{TITLE}</h1>
          <p className="md-lead">市区町村名を打つと、管轄の年金事務所が出ます。日本年金機構の公表({CHECKED_ON} 取得)によります。</p>
          <p className="jc-hero-meta jc--madoguchi">
            <span className="jc-time">{TOOLS.madoguchi.time}</span>
            <span className="jc-basis">入力した内容は送信しません</span>
          </p>
        </div>
      </header>

      <div className="p-container md-width md-main">
        <p className="md-printhead">
          障害年金の窓口メモ（障害年金申請サポート）。窓口の情報は日本年金機構の公表（{CHECKED_ON} 取得）によるものです。統廃合や移転があるため、行く前に機構の公式ページで確認してください。
        </p>
        <MadoguchiTool />
        <div className="no-print">
          <StaticBody />
          <p><Link href="/shinsei">申請の流れへ戻る</Link></p>
          <p className="dougu-app-link"><Link href="/app">同じ機能をアプリで続ける →</Link></p>
          <PageDate updated={UPDATED} />
        </div>
      </div>
    </div>
  );
}
