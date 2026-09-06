import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import { DouguCards } from "@/components/platform/DouguCard";
import KingakuTool from "@/components/tools/KingakuTool";
import { AMOUNTS_2026, FISCAL_YEAR, KINGAKU_2026 as A } from "@/data/amounts";
import { TOOLS } from "@/data/dougu";
import { monthly, num } from "@/lib/kingaku";
import { approx100 } from "@/lib/kingaku-hosoku";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { stats } from "@/lib/stats";
import { isPublishedInternalPath } from "@/lib/published-links";

const UPDATED = "2026-09-06";
const TITLE = `障害年金の金額 — ${FISCAL_YEAR}の額で計算`;

const DESCRIPTION =
  `等級と、初診日に入っていた制度と、家族の状況から、障害年金の年額と月額を${FISCAL_YEAR}の額で出します。開いた瞬間に2級・国民年金の額が出て、3問で自分の場合に近づけます。厚生年金の上乗せは年収からも入れられます。入力内容は送信されません。`;

const isPublished = isPublishedInternalPath("/dougu/kingaku");

export const metadata: Metadata = {
  ...pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/dougu/kingaku", showAppBanner: true, appBannerArgument: "https://shougainenkin-note.net/dougu/kingaku" }),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};

/* 今年度の額(一覧)。値は AMOUNTS_2026、年度は FISCAL_YEAR。出典は data/stats/sources.json。 */
const SRC = stats.sources.sources;
const AMOUNT_ROWS = [
  { label: "障害基礎年金 1級(年額)", value: `${AMOUNTS_2026.basicGrade1}円` },
  { label: "障害基礎年金 2級(年額)", value: `${AMOUNTS_2026.basicGrade2}円` },
  { label: "子の加算(1人目・2人目、1人につき年額)", value: `${AMOUNTS_2026.childFirstSecond}円` },
  { label: "子の加算(3人目以降、1人につき年額)", value: `${AMOUNTS_2026.childThird}円` },
  { label: "配偶者加給年金額(障害厚生年金1級・2級、年額)", value: `${AMOUNTS_2026.spouseAddition}円` },
  { label: "障害厚生年金 3級の最低保障(年額)", value: `${AMOUNTS_2026.employeesGrade3Minimum}円` },
  { label: "年金生活者支援給付金 1級(月額)", value: `${AMOUNTS_2026.supportGrade1Monthly}円` },
  { label: "年金生活者支援給付金 2級(月額)", value: `${AMOUNTS_2026.supportGrade2Monthly}円` },
] as const;

/* よくある質問。本文と FAQPage の JSON-LD で同じ文字列(数字は AMOUNTS_2026 / lib/kingaku.ts から)。 */
const FAQ = [
  { q: "障害年金は月にいくらですか", a: `2級の障害基礎年金は年${AMOUNTS_2026.basicGrade2}円で、月にならすと約${num(approx100(monthly(A.basicGrade2)))}円です。1級はその${A.grade1Rate}倍です。障害厚生年金は、給与と加入期間で変わります。` },
  { q: "3級はいくらですか", a: `3級は障害厚生年金だけです。給与と加入期間から計算する報酬比例の額で、最低保障は年${AMOUNTS_2026.employeesGrade3Minimum}円です。` },
  { q: "子どもがいると増えますか", a: `18歳の年度末までの子(20歳未満で障害等級1級・2級の子も)1人につき年${AMOUNTS_2026.childFirstSecond}円、3人目からは${AMOUNTS_2026.childThird}円が加算されます。1級・2級だけです。` },
  { q: "いつ振り込まれますか", a: "偶数月の15日に、前2か月分が振り込まれます。15日が土日祝なら、その前の平日です。" },
  { q: "税金はかかりますか", a: "かかりません。障害年金は非課税です。ただし、健康保険の扶養では収入に数えます。" },
] as const;
const faqLd = faqJsonLd(FAQ.map((f) => ({ question: f.q, answer: f.a })));

function StaticBody() {
  return (
    <div className="kg-static">
      <section aria-labelledby="kg-static-table">
        <h2 id="kg-static-table">{FISCAL_YEAR}の額(一覧)</h2>
        <div className="article-table-wrap"><table className="kg-amounts"><tbody>{AMOUNT_ROWS.map((r) => <tr key={r.label}><th scope="row">{r.label}</th><td>{r.value}</td></tr>)}</tbody></table></div>
        <p className="kg-src">出典: <a href={SRC.shougaiKisoGakuR08.url}>{SRC.shougaiKisoGakuR08.title}</a> / <a href={SRC.shougaiKouseiGakuR08.url}>{SRC.shougaiKouseiGakuR08.title}</a> / <a href={SRC.nenkingakuKaiteiR08.url}>{SRC.nenkingakuKaiteiR08.title}</a>(確認日 {SRC.shougaiKisoGakuR08.checkedAt})</p>
      </section>
      <section aria-labelledby="kg-static-how">
        <h2 id="kg-static-how">計算のしくみ</h2>
        <p>障害基礎年金は等級ごとの定額で、1級は2級の{A.grade1Rate}倍です。障害厚生年金は報酬比例で、平均標準報酬額 × {(A.rateNew * 1000).toFixed(3)}/1000 × 加入月数で計算し、加入月数が{A.minashiMonths}月未満なら{A.minashiMonths}月として計算します(1級は{A.grade1Rate}倍)。3級は障害厚生年金だけで、障害基礎年金はありません。加算は、18歳の年度末までの子(1級・2級)と、生計を維持している65歳未満の配偶者(障害厚生年金の1級・2級)です。</p>
      </section>
      <section aria-labelledby="kg-static-faq">
        <h2 id="kg-static-faq">よくある質問</h2>
        <dl>{FAQ.map((f) => <div key={f.q}><dt>{f.q}</dt><dd>{f.a}</dd></div>)}</dl>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <div className="platform kg-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <header className="dougu-hero">
        <div className="p-container kg-width">
          <Breadcrumb
            items={[{ href: "/", label: "トップ" }, { href: "/okane", label: "お金" }, { label: "障害年金の金額" }]}
            currentPath="/dougu/kingaku"
          />
          <h1>{TITLE}</h1>
          <p className="kg-lead">{FISCAL_YEAR}の額で、年額と月額を出します。入力はこの端末の中だけです。</p>
          <p className="jc-hero-meta jc--kingaku">
            <span className="jc-time">{TOOLS.kingaku.time}</span>
            <span className="jc-basis">入力した内容は送信しません</span>
          </p>
        </div>
      </header>

      <div className="p-container kg-width kg-main">
        <KingakuTool />

        <section className="kg-card" aria-labelledby="kg-next-heading">
          <h2 id="kg-next-heading">ここからできること</h2>
          <div className="dougu-band kg-dougu"><DouguCards placements={["shorui", "koushin"]} variant="grid" /></div>
          <div className="kg-next">
            <Link className="kg-next-item" href="/shinsei"><b>申請の流れ</b><span>初診日の確認から結果が届くまで、8つのステップで見ます</span></Link>
            <Link className="kg-next-item" href="/okane/ikura"><b>いくら・いつ振り込まれるか</b><span>金額の決まり方と振込の時期を、まとめて読む</span></Link>
          </div>
        </section>
        <StaticBody />
        <p><Link href="/okane">お金の話へ戻る</Link></p>
        <p className="dougu-app-link"><Link href="/app">同じ機能をアプリで続ける →</Link></p>
        <PageDate updated={UPDATED} />
      </div>
    </div>
  );
}
