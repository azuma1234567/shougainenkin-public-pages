import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, CaseCard } from "@/components/platform/Platform";
import { SAIKETSU_CASES, SAIKETSU_COUNTS, type SaiketsuCase } from "@/lib/saiketsu";
import { pageMetadata } from "@/lib/seo";

const TITLE = "結論が変わった実例｜障害年金の公開裁決例";
const DESCRIPTION = "障害年金の不支給や却下に対する不服申立ての公開実例を、傷病、争点、結論から探せます。構造化した94件のうち、原文を確認できた91件を公開しています。";
const PAGE_SIZE = 12;

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/jitsurei" });

type FilterKey = "all" | "mental" | "first-visit" | "accepted";

const filters: { key: FilterKey; label: string; count: number }[] = [
  { key: "all", label: "全件", count: SAIKETSU_COUNTS.all },
  { key: "mental", label: "精神・発達", count: SAIKETSU_COUNTS.mental },
  { key: "first-visit", label: "初診日", count: SAIKETSU_COUNTS.firstVisit },
  { key: "accepted", label: "結論が変わった", count: SAIKETSU_COUNTS.accepted },
];

function normalizeFilter(value?: string): FilterKey {
  return filters.some((item) => item.key === value) ? value as FilterKey : "all";
}

function applyFilter(items: SaiketsuCase[], filter: FilterKey) {
  if (filter === "mental") return items.filter((item) => item.seishin);
  if (filter === "first-visit") return items.filter((item) => item.soten.includes("初診日"));
  if (filter === "accepted") return items.filter((item) => item.ketsuron === "容認" || item.ketsuron === "一部容認");
  return items;
}

function hrefFor(filter: FilterKey, page = 1, disease?: string) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (disease) params.set("傷病", disease);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/jitsurei${query ? `?${query}` : ""}`;
}

export default async function JitsureiPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const legacyFilter = params.kind === "mental" ? "mental" : params.issue === "first-visit" ? "first-visit" : params.outcome === "accepted" ? "accepted" : undefined;
  const filter = normalizeFilter(typeof params.filter === "string" ? params.filter : legacyFilter);
  const diseaseParam = params["傷病"];
  const disease = typeof diseaseParam === "string" && diseaseParam.trim() ? diseaseParam.trim() : undefined;
  const requestedPage = typeof params.page === "string" ? Number.parseInt(params.page, 10) : 1;
  const diseaseFiltered = disease ? SAIKETSU_CASES.filter((item) => item.shobyo.includes(disease)) : SAIKETSU_CASES;
  const filtered = applyFilter(diseaseFiltered, filter);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const resultLabel = disease ? `傷病「${disease}」` : filters.find((item) => item.key === filter)?.label ?? "実例";
  const issueCounts = [
    ["障害の程度・等級該当性", SAIKETSU_CASES.filter((item) => item.soten.includes("障害の程度・等級該当性")).length],
    ["初診日", SAIKETSU_COUNTS.firstVisit],
    ["診断書の信頼性・整合性", SAIKETSU_CASES.filter((item) => item.soten.includes("診断書の信頼性・整合性")).length],
    ["納付要件", SAIKETSU_CASES.filter((item) => item.soten.includes("納付要件")).length],
  ] as const;
  const maxIssueCount = Math.max(...issueCounts.map(([, count]) => count));

  return (
    <div className="platform">
      <header className="p-page-hero" style={{ background: "#f7fbfe", paddingBottom: 28 }}>
        <div className="p-container">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { label: "結論が変わった実例" }]} />
          <h1>結論が変わった実例</h1>
          <p className="p-page-intro">不支給や却下の決定に対して不服申立てが行われ、国の審査会が結論を出した実例です。構造化した94件のうち、原文（公的PDF）を確認できた{SAIKETSU_COUNTS.all}件を公開しています。原文を提示できない3件は表示していません。個別の結果を保証するものではありませんが、「どんな主張が、どう判断されたか」を知る手がかりになります。</p>
        </div>
      </header>

      <section className="p-section" style={{ paddingTop: 0 }} aria-label="実例の絞り込みと一覧">
        <div className="p-container p-database-layout">
          <div className="p-grid" style={{ gap: 18 }}>
            <nav className="p-filter-panel" aria-label="実例を絞り込む">
              <div className="p-filter-row">
                <span className="p-filter-label">表示する実例</span>
                <div className="p-chips">
                  {filters.map((item) => <Link aria-current={filter === item.key ? "page" : undefined} className={`p-chip is-soft ${filter === item.key ? "is-active" : ""}`} href={hrefFor(item.key)} key={item.key}>{item.label} ({item.count})</Link>)}
                </div>
              </div>
            </nav>
            <p className="p-results">{resultLabel}の実例 ・ {filtered.length}件（{currentPage}/{pageCount}ページ）</p>
            <div className="p-grid" style={{ gap: 12 }}>
              {visible.map((item) => <CaseCard key={item.id} item={item} />)}
            </div>
            {pageCount > 1 && (
              <nav className="p-chips" aria-label="実例一覧のページ">
                {currentPage > 1 && <Link className="p-chip" href={hrefFor(filter, currentPage - 1, disease)}>← 前のページ</Link>}
                {currentPage < pageCount && <Link className="p-chip" href={hrefFor(filter, currentPage + 1, disease)}>次のページ →</Link>}
              </nav>
            )}
          </div>

          <aside className="p-sidebar" aria-label="収録実例の傾向">
            <div className="p-card">
              <h2 style={{ fontSize: 14.5 }}>争点になりやすいのは</h2>
              <div className="p-grid" style={{ gap: 10 }}>
                {issueCounts.map(([label, count]) => (
                  <div className="p-bar-row" key={label}>
                    <div className="p-bar-label"><span>{label}</span><span>{count}件</span></div>
                    <div className="p-bar"><span style={{ width: `${Math.round((count / maxIssueCount) * 100)}%` }} /></div>
                  </div>
                ))}
              </div>
              <p className="p-source">収録{SAIKETSU_COUNTS.all}件のうち、容認・一部容認は{SAIKETSU_COUNTS.accepted}件です。この分布は申請全体の支給割合を表すものではありません。</p>
            </div>
            <div className="p-card" style={{ background: "#eef6fc", borderColor: "#d7e9f5" }}>
              <h2 style={{ fontSize: 13.5 }}>不支給の通知を受け取った方へ</h2>
              <p className="p-card-copy">不服申立てには期限があります（通知を知った日の翌日から3か月）。まずは選択肢を確認してください。</p>
              <Link className="p-card-link" href="/nayami/fushikyu">「不支給と言われたとき」を読む →</Link>
            </div>
            <div className="p-card">
              <h2 style={{ fontSize: 13.5 }}>申請全体の数字を見る</h2>
              <p className="p-card-copy">新規裁定、支給割合、診断書の種類、更新結果を、公的統計から確認できます。</p>
              <Link className="p-card-link" href="/suuji">「数字で見る障害年金」を読む →</Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
