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

export function isAccepted(outcome: SaiketsuCase["ketsuron"]) {
  return outcome === "容認" || outcome === "一部容認";
}

export function OutcomeBadge({ outcome }: { outcome: SaiketsuCase["ketsuron"] }) {
  return (
    <span className={`p-case-badge ${isAccepted(outcome) ? "is-ok" : "is-warn"}`}>
      {outcomeLabel(outcome)}
    </span>
  );
}

// 裁決の id の頭(r07 / h28_29 など)は、厚労省が裁決例を公表した年度。
// r07 → 令和7年、h28_29 → 平成28・29年。
export function saiketsuYearLabel(id: string): string {
  const m = /^([rh])(\d+)(?:_(\d+))?/.exec(id);
  if (!m) return "";
  const era = m[1] === "r" ? "令和" : "平成";
  return m[3] ? `${era}${Number(m[2])}・${Number(m[3])}年` : `${era}${Number(m[2])}年`;
}

// 実例カード。左の5px罫線とバッジで、通った/通らなかったを一目で分かるようにする。
// 見出しは病名。要旨の1文目は病名の下に小さく置き、残りを本文に出す(文は削らない)。
export function CaseCard({ item }: { item: SaiketsuCase }) {
  const accepted = isAccepted(item.ketsuron);
  const cut = item.youshi.indexOf("。");
  const lead = cut > 0 ? item.youshi.slice(0, cut) : "";
  const body = cut > 0 ? item.youshi.slice(cut + 1) : item.youshi;
  const year = saiketsuYearLabel(item.id);
  return (
    <article className={`p-card p-case ${accepted ? "is-accepted" : "is-rejected"}`}>
      <div className="p-case-head">
        <OutcomeBadge outcome={item.ketsuron} />
        <span className="p-case-meta">{item.seido} ・ {item.request_type_group}{year ? ` ・ ${year}` : ""}</span>
      </div>
      <h3 className="p-case-title">{item.shobyo}{lead ? <small>{lead}。</small> : null}</h3>
      <p className="p-case-summary">{body || item.youshi}</p>
      <div className="p-case-foot">
        <span className="p-case-tags">
          争点
          {item.soten.map((soten) => <span className="p-case-tag" key={soten}>{soten}</span>)}
        </span>
        <a href={item.url} target="_blank" rel="noopener noreferrer">裁決の原文(PDF)を読む →</a>
      </div>
    </article>
  );
}
