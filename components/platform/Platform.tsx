import Link from "next/link";
import type { ReactNode } from "react";
import type { SaiketsuCase } from "@/lib/saiketsu";
import { breadcrumbJsonLd } from "@/lib/seo";

export function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function TopicIcon() {
  return (
    <svg className="p-topic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M9 8h6" />
    </svg>
  );
}

// パンくず。jsonLd が true(既定)のとき BreadcrumbList の構造化データも出す。
// 最後の項目(href なし)は currentPath を現在のページの path として使う。
// currentPath が無いときは最後の項目を JSON-LD から落とす(item 無しの ListItem は出さない)。
// href の無い中間項目も JSON-LD からは落とす。
// コラム記事は lib/columns.ts の columnJsonLd が BreadcrumbList を持つので、そちらでは使わない。
export function Breadcrumb({ items, currentPath, jsonLd = true }: { items: { href?: string; label: string }[]; currentPath?: string; jsonLd?: boolean }) {
  const jsonLdItems = items.flatMap((item, index) => {
    if (item.href) return [{ name: item.label, path: item.href }];
    if (index === items.length - 1 && currentPath) return [{ name: item.label, path: currentPath }];
    return [];
  });
  return (
    <>
      <nav className="p-breadcrumb" aria-label="パンくずリスト">
        {items.map((item, index) => (
          <span key={`${item.label}-${index}`}>
            {index > 0 && " / "}
            {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
          </span>
        ))}
      </nav>
      {jsonLd && jsonLdItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(jsonLdItems)).replace(/</g, "\\u003c") }}
        />
      )}
    </>
  );
}

export function SectionHeader({ title, lead, href, linkLabel }: { title: string; lead?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="p-section-head">
      <div className="p-section-copy">
        <h2>{title}</h2>
        {lead && <p className="p-lead">{lead}</p>}
      </div>
      {href && linkLabel && <Link className="p-more" href={href}>{linkLabel} →</Link>}
    </div>
  );
}

// 日付の表示は全ページこれ1つ(指示書 §3-4)。h1 の直下に置く。
// 出典を確かめた日 = このサイトの信頼の根なので、画面に出すのは「最終確認日」だけ。
// 公開日は機械が読む <time> としてだけ残す。
function formatPageDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}
export function PageDate({ updated, checked, published, readMinutes }: { updated: string; checked?: string; published?: string; readMinutes?: number }) {
  const confirmed = checked ?? updated;
  return (
    <p className="p-page-date">
      {published ? <time dateTime={published} /> : null}
      <time dateTime={confirmed}>最終確認日 {formatPageDate(confirmed)}</time>
      {readMinutes ? <> / 読む目安 約{readMinutes}分</> : null}
    </p>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-card ${className}`.trim()}>{children}</div>;
}

export function outcomeLabel(outcome: SaiketsuCase["ketsuron"]) {
  if (outcome === "容認") return "結論が変わった";
  if (outcome === "一部容認") return "一部で結論が変わった";
  return "認められなかった";
}

export function OutcomeBadge({ outcome }: { outcome: SaiketsuCase["ketsuron"] }) {
  const positive = outcome === "容認" || outcome === "一部容認";
  return (
    <span className={`p-label ${positive ? "p-label-success" : "p-label-warning"}`}>
      {outcomeLabel(outcome)}
    </span>
  );
}

export function CaseCard({ item }: { item: SaiketsuCase }) {
  const title = `${item.shobyo} ── ${item.youshi.split("。")[0]}`;
  return (
    <article className="p-card p-case">
      <div className="p-case-head">
        <OutcomeBadge outcome={item.ketsuron} />
        <span className="p-case-meta">{item.seido} ・ {item.request_type_group}</span>
      </div>
      <h3 className="p-case-title">{title}</h3>
      <p className="p-case-summary">{item.youshi}</p>
      <div className="p-case-foot">
        <span>争点: {item.soten.join(" / ")}</span>
        <a href={item.url} target="_blank" rel="noopener noreferrer">裁決の原文(PDF)を読む →</a>
      </div>
    </article>
  );
}
