import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AppStoreBadge from "@/components/AppStoreBadge";
import { Breadcrumb, Card, CheckIcon, SectionHeader } from "@/components/platform/Platform";
import { APP_STORE_URL, SITE_NAME, SITE_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

const TITLE = "障害年金申請サポート｜AI相談・申請ガイドアプリ";
const DESCRIPTION = "障害年金の申請準備を8つの段階で案内する無料iPhoneアプリ。AI相談、日々の記録、診察メモ、病歴・就労状況等申立書の下書きに対応。アカウント登録は不要です。";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/app", absoluteTitle: true });

const features = [
  ["AIに相談", "診察で話しきれなかったことや日々の不安を、一言から自分のペースで整理できます。"],
  ["申請を8段階で案内", "初診日の確認から結果を待つまで、いまの段階と次にすることが分かります。"],
  ["診察メモを作成", "日々の記録から、主治医へ見せられるA4一枚のメモを作れます。"],
  ["申立書の下書き", "記録をもとに、病歴・就労状況等申立書の各欄に入る文章を整理できます。"],
  ["食い違いを確認", "診察メモ、申立書、元の記録の間で内容が食い違っていないか確認できます。"],
  ["端末内に保存", "記録と相談履歴は端末内に保存。アカウント登録もアプリ内購入もありません。"],
] as const;

const screenshots = [
  ["/app/screenshot-home.png", "障害年金申請サポートのホーム画面"],
  ["/app/screenshot-shinsatsu-memo.png", "診察メモを作成する画面"],
  ["/app/screenshot-moushitatesho.png", "病歴・就労状況等申立書を準備する画面"],
  ["/app/screenshot-hitokoto-memo.png", "日々の様子を一言で記録する画面"],
] as const;

export default function AppPage() {
  const jsonLd = {
    "@context": "https://schema.org", "@type": "MobileApplication", name: SITE_NAME,
    operatingSystem: "iOS 15.1以降", applicationCategory: "HealthApplication", description: DESCRIPTION,
    url: `${SITE_URL}/app`, downloadUrl: APP_STORE_URL, installUrl: APP_STORE_URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  };

  return (
    <div className="platform app-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="p-container"><Breadcrumb currentPath="/app" items={[{ href: "/", label: "トップ" }, { label: "アプリ" }]} /></div>
      <section className="p-hero" aria-labelledby="app-title"><div className="p-container p-hero-inner">
        <p className="p-trust-pill"><CheckIcon size={15} />すべての機能が無料・アカウント登録不要</p>
        <h1 id="app-title">障害年金の申請準備を、<br />ひとつずつ手元で。</h1>
        <p className="p-hero-copy">「障害年金申請サポート」は、AI相談、日々の記録、診察メモ、申立書の下書きを一つにまとめたiPhoneアプリです。申請を代行せず、ご自身の準備を支えます。</p>
        <AppStoreBadge href={APP_STORE_URL} />
      </div></section>
      <section className="p-section-lg" aria-labelledby="features-heading"><div className="p-container">
        <SectionHeader title="申請と診察の準備に使えること" lead="書けるときに、できるところから。途中でやめても、あとから続けられます。" />
        <div className="p-grid p-grid-3">{features.map(([title, copy]) => <Card key={title} className="p-card-lg"><h2 className="p-card-title">{title}</h2><p className="p-card-copy">{copy}</p></Card>)}</div>
      </div></section>
      <section className="p-section app-screenshots" aria-labelledby="screenshots-heading"><div className="p-container">
        <SectionHeader title="実際の画面" lead="大きな文字と落ち着いた画面で、迷わず次へ進めるように設計しています。" />
        <div className="app-screenshot-grid">{screenshots.map(([src, alt]) => <Image key={src} src={src} alt={alt} width={390} height={844} sizes="(max-width: 640px) 72vw, 240px" />)}</div>
      </div></section>
      <section className="p-section-lg" aria-labelledby="safety-heading"><div className="p-container app-safety">
        <SectionHeader title="安心して使うために" />
        <p>記録と相談履歴は端末内に保存されます。AI機能を使うときだけ、対象の文章が処理のために送信されます。受給可否や等級の判定、医療上の診断、申請代行は行いません。</p>
        <p><Link href="/app/privacy">アプリのプライバシーポリシー</Link> ／ <Link href="/app/terms">アプリの利用規約</Link> ／ <Link href="/support">サポート</Link></p>
        <AppStoreBadge href={APP_STORE_URL} />
      </div></section>
    </div>
  );
}
