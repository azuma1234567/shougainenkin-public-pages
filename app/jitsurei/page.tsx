import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, CaseCard, PageDate } from "@/components/platform/Platform";
import { SITE_PAGES_CHECKED, SITE_URL } from "@/lib/constants";
import { SAIKETSU_CASES, SAIKETSU_COUNTS, type SaiketsuCase } from "@/lib/saiketsu";
import { pageMetadata } from "@/lib/seo";

const TITLE = "結論が変わった実例｜障害年金の公開裁決例";
const DESCRIPTION = "障害年金の不支給や却下に対する不服申立ての公開実例を、傷病、争点、結論から探せます。構造化した94件のうち、原文を確認できた91件を公開しています。";
const PAGE_SIZE = 12;

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/jitsurei" });

/* 2026-09-05: 結果と争点で絞れる形へ(docs/hajimete-jitsurei-sasshin-2026-09-05-instructions.md §2)。
   既存の filter=mental / first-visit / accepted と、kind= issue= outcome= の旧リンクはそのまま動く。 */

type FilterKey = "all" | "mental" | "first-visit" | "accepted" | "rejected" | "issue-teido" | "issue-shindansho" | "issue-nofu";

const ISSUE_TEIDO = "障害の程度・等級該当性";
const ISSUE_SHINDANSHO = "診断書の信頼性・整合性";
const ISSUE_NOFU = "納付要件";

const byIssue = (issue: string) => SAIKETSU_CASES.filter((item) => item.soten.includes(issue)).length;
const REJECTED_COUNT = SAIKETSU_CASES.filter((item) => item.ketsuron === "棄却").length;

type FilterDef = { key: FilterKey; label: string; count: number; tone?: "ok" | "warn" };

/* 語の順は 支給 → 非該当(writing-techniques §5)。 */
const resultFilters: FilterDef[] = [
  { key: "all", label: "全件", count: SAIKETSU_COUNTS.all },
  { key: "accepted", label: "結論が変わった", count: SAIKETSU_COUNTS.accepted, tone: "ok" },
  { key: "rejected", label: "認められなかった", count: REJECTED_COUNT, tone: "warn" },
];

const issueFilters: FilterDef[] = [
  { key: "issue-teido", label: "障害の程度", count: byIssue(ISSUE_TEIDO) },
  { key: "first-visit", label: "初診日", count: SAIKETSU_COUNTS.firstVisit },
  { key: "issue-shindansho", label: "診断書", count: byIssue(ISSUE_SHINDANSHO) },
  { key: "issue-nofu", label: "納付要件", count: byIssue(ISSUE_NOFU) },
];

const diseaseFilters: FilterDef[] = [
  { key: "mental", label: "精神・発達", count: SAIKETSU_COUNTS.mental },
];

const allFilters = [...resultFilters, ...issueFilters, ...diseaseFilters];

/* サイドバーの争点の棒。棒の色は図表の色(--chart-1〜4)で、どの棒にも名前と件数を書く。 */
const ISSUE_BARS = [
  { key: "issue-teido" as FilterKey, label: ISSUE_TEIDO, count: byIssue(ISSUE_TEIDO) },
  { key: "first-visit" as FilterKey, label: "初診日", count: SAIKETSU_COUNTS.firstVisit },
  { key: "issue-shindansho" as FilterKey, label: ISSUE_SHINDANSHO, count: byIssue(ISSUE_SHINDANSHO) },
  { key: "issue-nofu" as FilterKey, label: ISSUE_NOFU, count: byIssue(ISSUE_NOFU) },
];

function normalizeFilter(value?: string): FilterKey {
  return allFilters.some((item) => item.key === value) ? value as FilterKey : "all";
}

function applyFilter(items: SaiketsuCase[], filter: FilterKey) {
  if (filter === "mental") return items.filter((item) => item.seishin);
  if (filter === "first-visit") return items.filter((item) => item.soten.includes("初診日"));
  if (filter === "issue-teido") return items.filter((item) => item.soten.includes(ISSUE_TEIDO));
  if (filter === "issue-shindansho") return items.filter((item) => item.soten.includes(ISSUE_SHINDANSHO));
  if (filter === "issue-nofu") return items.filter((item) => item.soten.includes(ISSUE_NOFU));
  if (filter === "accepted") return items.filter((item) => item.ketsuron === "容認" || item.ketsuron === "一部容認");
  if (filter === "rejected") return items.filter((item) => item.ketsuron === "棄却");
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

/* 「1 2 3 … 8」。両端と現在地の前後だけを出し、飛ぶところに … を置く。 */
function pageNumbers(current: number, count: number): (number | "gap")[] {
  const shown = new Set<number>([1, count, current - 2, current - 1, current, current + 1, current + 2]);
  const list: (number | "gap")[] = [];
  for (let page = 1; page <= count; page += 1) {
    if (shown.has(page)) list.push(page);
    else if (list[list.length - 1] !== "gap") list.push("gap");
  }
  return list;
}

function ChipGroup({ label, items, filter }: { label: string; items: FilterDef[]; filter: FilterKey }) {
  return (
    <div className="p-filter-group">
      <span className="p-filter-label">{label}</span>
      {items.map((item) => (
        <Link
          aria-current={filter === item.key ? "page" : undefined}
          className={`p-chip is-soft ${item.tone ? `is-${item.tone}` : ""} ${filter === item.key ? "is-active" : ""}`.replace(/\s+/g, " ").trim()}
          href={hrefFor(item.key)}
          key={item.key}
        >
          {item.label} {item.count}
        </Link>
      ))}
    </div>
  );
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
  const resultLabel = disease ? `傷病「${disease}」` : allFilters.find((item) => item.key === filter)?.label ?? "実例";
  const maxIssueCount = Math.max(...ISSUE_BARS.map((item) => item.count));
  const acceptedPercent = Math.round((SAIKETSU_COUNTS.accepted / SAIKETSU_COUNTS.all) * 100);

  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "結論が変わった実例",
    numberOfItems: visible.length,
    itemListElement: visible.map((item, index) => ({
      "@type": "ListItem",
      position: (currentPage - 1) * PAGE_SIZE + index + 1,
      name: `${item.shobyo}（${item.request_type_group}）`,
      url: `${SITE_URL}/jitsurei#${item.id}`,
    })),
  };

  return (
    <div className="platform">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd).replace(/</g, "\\u003c") }} />
      <header className="p-page-hero">
        <div className="p-container">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { label: "結論が変わった実例" }]} currentPath="/jitsurei" />
          <h1>結論が変わった実例</h1>
          <PageDate updated={SITE_PAGES_CHECKED} />
          <p className="p-page-intro">
            同じような状況なのに、結論が分かれた事例を{SAIKETSU_COUNTS.all}件集めています。体験談ではありません。<strong>国の再審査（社会保険審査会）の裁決</strong>から取ったもので、全件、裁決の原文（PDF）へのリンクつきです。<strong>通ったものだけを並べていません。</strong>通らなかったものも、同じ密度で載せています。通った話だけを見せられても、自分がどちらに近いかは分からないからです。
          </p>
          {/* 収録の内訳。左から「結論が変わった」→「認められなかった」の順。
              帯の中に割合、凡例に名前と実数を直接書く。色は図表の色で、数字は黒。 */}
          <div className="p-outcome-band">
            <p className="p-outcome-total">収録した裁決 <strong>{SAIKETSU_COUNTS.all}件</strong></p>
            <div className="p-outcome-bar" aria-hidden="true">
              <span className="is-accepted" style={{ width: `${acceptedPercent}%` }}>{acceptedPercent}%</span>
              <span className="is-rejected" style={{ width: `${100 - acceptedPercent}%` }}>{100 - acceptedPercent}%</span>
            </div>
            <ul className="p-outcome-legend">
              <li><span className="is-accepted" />結論が変わった <strong>{SAIKETSU_COUNTS.accepted}件</strong></li>
              <li><span className="is-rejected" />認められなかった <strong>{REJECTED_COUNT}件</strong></li>
            </ul>
            <p className="p-issue-lead">収録 <strong>{SAIKETSU_COUNTS.all}件</strong>のうち、結論が変わったのは <strong>{SAIKETSU_COUNTS.accepted}件</strong>。全件、原文 PDF つき。</p>
            {/* 帯を見た人が「6割通る制度」と読まないよう、注記は帯の直下に置く(文はサイドバーにあったものをそのまま移した)。 */}
            <p className="p-note" style={{ marginTop: 8 }}><strong>この割合は、申請全体の支給割合ではありません。</strong>公開されている裁決から集めたものです。「審査請求すれば6割通る」という意味にはなりません。申請全体では、令和6年度に新しく決まった146,225件のうち非該当は18,982件（13.0%）でした。</p>
          </div>
        </div>
      </header>

      <section className="p-section" style={{ paddingTop: 22, paddingBottom: 8 }} aria-labelledby="howto-heading">
        <div className="p-container">
          <h2 className="p-card-heading" id="howto-heading">読み方 — どこを見るか</h2>
          <p className="p-card-copy" style={{ margin: "6px 0 12px" }}>見てほしいのは結論そのものではなく、<strong>その手前</strong>です。</p>
          <div className="p-mini-grid is-numbered">
            <div className="p-mini"><b>何が足りなくて、原処分では認められなかったのか</b></div>
            <div className="p-mini"><b>何が加わって、結論が変わったのか（診察券、薬袋、修正した診断書、就労の実態、援助の状況）</b></div>
            <div className="p-mini"><b>自分の状況と、どこが同じで、どこが違うか</b></div>
          </div>
          <p className="p-card-copy" style={{ marginTop: 12 }}>
            <strong>認められなかった事例のほうが、学べることが多いこともあります。</strong>「職場の配慮を受けつつ一般雇用で週4日勤務し、日常生活能力も比較的保たれていた」——ここから、就労の中身がどう見られるかが分かります。
          </p>
          <p className="p-note" style={{ marginTop: 8 }}><strong>自分と同じ争点の3件だけ</strong>読めば十分です。全部読む必要はありません。</p>
          <details className="p-details" style={{ marginTop: 12 }}>
            <summary>この実例が、どこから来たものか</summary>
            <p className="p-card-copy" style={{ marginTop: 8 }}>
              障害年金の結果に納得できないとき、2段階の不服申立てがあります。①<strong>審査請求</strong>（社会保険審査官へ。決定を知った日の翌日から3か月以内）、②<strong>再審査請求</strong>（社会保険審査会へ。審査請求の決定書の謄本が送られた日の翌日から2か月以内）。ここに集めているのは、その<strong>2段階目の裁決</strong>です。
            </p>
            <p className="p-card-copy">
              争いになった事例だけが集まっている場所なので、ふつうの申請より論点がはっきりしています。だから「<strong>何が判断を分けたのか</strong>」が読み取れます。
            </p>
          </details>
        </div>
      </section>

      <nav className="p-filter-bar" aria-label="実例を絞り込む">
        <div className="p-container">
          <ChipGroup label="結果" items={resultFilters} filter={filter} />
          <ChipGroup label="争点" items={issueFilters} filter={filter} />
          <ChipGroup label="病気" items={diseaseFilters} filter={filter} />
        </div>
      </nav>

      <section className="p-section" style={{ paddingTop: 0 }} aria-label="実例の一覧">
        <div className="p-container p-database-layout">
          <div className="p-grid" style={{ gap: 18 }}>
            <p className="p-results">{resultLabel}の実例 ・ {filtered.length}件（{currentPage}/{pageCount}ページ）</p>
            <div className="p-grid" style={{ gap: 12 }}>
              {visible.map((item) => <div className="p-case-anchor" key={item.id} id={item.id}><CaseCard item={item} /></div>)}
            </div>
            {pageCount > 1 && (
              <nav className="p-pager" aria-label="実例一覧のページ">
                {currentPage > 1 && <Link href={hrefFor(filter, currentPage - 1, disease)} rel="prev">← 前へ</Link>}
                {pageNumbers(currentPage, pageCount).map((page, index) => (
                  page === "gap"
                    ? <span aria-hidden="true" key={`gap-${index}`}>…</span>
                    : <Link aria-current={page === currentPage ? "page" : undefined} href={hrefFor(filter, page, disease)} key={page}>{page}</Link>
                ))}
                {currentPage < pageCount && <Link href={hrefFor(filter, currentPage + 1, disease)} rel="next">次へ →</Link>}
              </nav>
            )}
          </div>

          <aside className="p-sidebar" aria-label="収録実例の傾向">
            <div className="p-card">
              <h2 className="p-card-heading">争点になりやすいのは</h2>
              {/* 棒は押すと絞り込める。色は図表の色。どの棒にも名前と件数を書く。 */}
              <div className="p-issue-bars" style={{ margin: "10px 0 0", padding: 0, border: 0 }}>
                {ISSUE_BARS.map((item, index) => (
                  <Link className="p-issue-bar" data-rank={index + 1} href={hrefFor(item.key)} key={item.label}>
                    <span className="p-issue-bar-label"><span>{item.label}</span><strong>{item.count}件</strong></span>
                    <span className="p-issue-bar-track"><span style={{ width: `${Math.round((item.count / maxIssueCount) * 100)}%` }} /></span>
                  </Link>
                ))}
              </div>
              <p className="p-source" style={{ marginTop: 10 }}>収録{SAIKETSU_COUNTS.all}件のうち、容認・一部容認は{SAIKETSU_COUNTS.accepted}件です。</p>
            </div>
            <div className="p-flag p-flag-danger">
              <strong>不支給の通知を受け取った方へ</strong><br />
              不服申立てには期限があります（通知を知った日の翌日から3か月）。まずは選択肢を確認してください。<br />
              <Link href="/nayami/fushikyu">「不支給と言われたとき」を読む →</Link>
            </div>
            <div className="p-card">
              <h2 className="p-card-heading">申請全体の数字を見る</h2>
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
              <h2 className="p-card-heading" id="caution-heading">気をつけてほしいこと</h2>
              <ul className="p-list">
                <li>裁決は、<strong>その事案の事実関係にもとづく個別の判断</strong>です。似ていても、結論が同じになるとは限りません</li>
                <li>ここにあるのは<strong>争いになった事例</strong>です。ふつうに通った申請はここに現れません</li>
                <li>数字の分布は、<strong>申請全体の傾向ではありません</strong>。申請全体の数字は <Link href="/suuji">数字で見る障害年金</Link> で</li>
              </ul>
            </div>
            <div className="p-card">
              <h2 className="p-card-heading">ここからできること</h2>
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
