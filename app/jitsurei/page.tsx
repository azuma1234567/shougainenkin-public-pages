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
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { label: "結論が変わった実例" }]} currentPath="/jitsurei" />
          <h1>結論が変わった実例</h1>
          <p className="p-page-intro">
            同じような状況なのに、結論が分かれた事例を{SAIKETSU_COUNTS.all}件集めています。体験談ではありません。<strong>国の再審査（社会保険審査会）の裁決</strong>から取ったもので、全件、裁決の原文（PDF）へのリンクつきです。<strong>通ったものだけを並べていません。</strong>通らなかったものも、同じ密度で載せています。通った話だけを見せられても、自分がどちらに近いかは分からないからです。
          </p>
        </div>
      </header>

      <section className="p-section" style={{ paddingTop: 0, paddingBottom: 8 }} aria-labelledby="howto-heading">
        <div className="p-container">
          <div className="p-grid p-grid-2">
            <div className="p-card">
              <h2 id="howto-heading" style={{ fontSize: 15 }}>この実例が、どこから来たものか</h2>
              <p className="p-card-copy">
                障害年金の結果に納得できないとき、2段階の不服申立てがあります。①<strong>審査請求</strong>（社会保険審査官へ。決定を知った日の翌日から3か月以内）、②<strong>再審査請求</strong>（社会保険審査会へ。審査請求の決定書の謄本が送られた日の翌日から2か月以内）。ここに集めているのは、その<strong>2段階目の裁決</strong>です。
              </p>
              <p className="p-card-copy">
                争いになった事例だけが集まっている場所なので、ふつうの申請より論点がはっきりしています。だから「<strong>何が判断を分けたのか</strong>」が読み取れます。
              </p>
            </div>
            <div className="p-card">
              <h2 style={{ fontSize: 15 }}>読み方 — どこを見るか</h2>
              <p className="p-card-copy">見てほしいのは結論そのものではなく、<strong>その手前</strong>です。</p>
              <ul className="p-list">
                <li>何が足りなくて、原処分では認められなかったのか</li>
                <li>何が加わって、結論が変わったのか（診察券、薬袋、修正した診断書、就労の実態、援助の状況）</li>
                <li>自分の状況と、どこが同じで、どこが違うか</li>
              </ul>
              <p className="p-card-copy">
                <strong>認められなかった事例のほうが、学べることが多いこともあります。</strong>「職場の配慮を受けつつ一般雇用で週4日勤務し、日常生活能力も比較的保たれていた」——ここから、就労の中身がどう見られるかが分かります。
              </p>
              <p className="p-note"><strong>自分と同じ争点の3件だけ</strong>読めば十分です。全部読む必要はありません。</p>
            </div>
          </div>
        </div>
      </section>

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
              {visible.map((item) => <div key={item.id} id={item.id}><CaseCard item={item} /></div>)}
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
              <p className="p-source">収録{SAIKETSU_COUNTS.all}件のうち、容認・一部容認は{SAIKETSU_COUNTS.accepted}件です。</p>
              <p className="p-note" style={{ marginTop: 8 }}><strong>この割合は、申請全体の支給割合ではありません。</strong>公開されている裁決から集めたものです。「審査請求すれば6割通る」という意味にはなりません。申請全体では、令和6年度に新しく決まった146,225件のうち非該当は18,982件（13.0%）でした。</p>
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

      <section className="p-section p-band" aria-labelledby="caution-heading">
        <div className="p-container">
          <div className="p-grid p-grid-2">
            <div className="p-card">
              <h2 id="caution-heading" style={{ fontSize: 15 }}>気をつけてほしいこと</h2>
              <ul className="p-list">
                <li>裁決は、<strong>その事案の事実関係にもとづく個別の判断</strong>です。似ていても、結論が同じになるとは限りません</li>
                <li>ここにあるのは<strong>争いになった事例</strong>です。ふつうに通った申請はここに現れません</li>
                <li>数字の分布は、<strong>申請全体の傾向ではありません</strong>。申請全体の数字は <Link href="/suuji">数字で見る障害年金</Link> で</li>
              </ul>
            </div>
            <div className="p-card">
              <h2 style={{ fontSize: 15 }}>ここからできること</h2>
              <ul className="p-list">
                <li>自分と同じ争点の実例を3件読む</li>
                <li><Link href="/columns/tokyu-hantei-guideline">等級の目安を、国の表で確かめる</Link></li>
                <li><Link href="/suuji">数字で見る障害年金</Link>で、全体の分布を確認する</li>
                <li><Link href="/nayami/fushikyu">不支給と言われたとき</Link>で、次の一手を決める</li>
              </ul>
              <p className="p-source">出典: 社会保険審査会 裁決例（厚生労働省が公開）／厚生労働省「障害年金の業務統計等（令和6年度）」／社会保険審査官及び社会保険審査会法 ・ 確認日 2026-08-31</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
