import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import KouginTool from "@/components/tools/KouginTool";
import { TOOLS, TOOL_CROSS_LINKS } from "@/data/dougu";
import { pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";

/* docs/dougu-2hon-2026-09-06-instructions.md §A-4 の文言をそのまま使う。 */
const UPDATED = "2026-09-06";
const TITLE = "工賃・賃金と障害年金の計算 — 働いたら、年金は減るか";
const DESCRIPTION =
  "所得で年金が止まる仕組みがあるのは、初診日が20歳前にある障害基礎年金だけです。20歳前の人は、前年の所得を令和8年度の線に当てると、全額・2分の1停止・全額停止のどれになるかが分かります。健康保険の扶養の線(年収180万円未満)にも当てます。入力は送信されません。";

const isPublished = isPublishedInternalPath("/dougu/kougin");

export const metadata: Metadata = {
  ...pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/dougu/kougin", showAppBanner: true, appBannerArgument: "https://shougainenkin-note.net/dougu/kougin" }),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};

/* FAQ。答えは /jukyuugo/hataraku と同じ。 */
const FAQ = [
  { q: "働き始めたら、年金事務所に届け出が要りますか。", a: "就労そのものの届出はありません。20歳前傷病の人の所得は、原則として市区町村の所得情報で確認されるので、毎年の届出も多くの場合は不要です(通知が来たらそれに従ってください)。厚生年金に入る手続きは勤め先が行います。" },
  { q: "親の収入は関係ありますか。", a: "関係ありません。20歳前傷病の所得制限で見るのは、本人の前年の所得だけです。同居している家族の収入は数えません。" },
  { q: "B型の工賃が上がると、年金が減りますか。", a: "20歳前傷病でなければ、所得の審査はありません。20歳前傷病でも、B型の工賃(平均で年約29万円)は線から遠く離れています。" },
  { q: "10月から線が変わるのはなぜですか。", a: "所得制限は前年(1〜12月)の所得で決まり、その年の10月分から翌年9月分までの支給に反映されます。区切りが10月なので、9月分までと10月分からで当てる基準額が違います。" },
] as const;

const SOURCES = [
  "日本年金機構「20歳前の傷病による障害基礎年金にかかる支給制限等」",
  "厚生労働省 障発0715第2号・年発0715第1号(令和8年7月15日)",
  "国民年金法施行令 第5条の4・第6条の2",
  "国税庁 タックスアンサー No.1410「給与所得控除」(令和7年分以降の表)",
  "厚生労働省通知「収入がある者についての被扶養者の認定について」",
  "厚生労働省「令和6年度工賃(賃金)の実績について」",
  "確認日: 2026-09-06",
];

const NEXT = [
  { title: "働くと年金はどうなるか", note: "4つの働き方と、見られる4つのこと。所得制限の線までの距離も", href: "/jukyuugo/hataraku" },
  { title: "B型・A型作業所と障害年金", note: "工賃・賃金は年金にどう関わるか", href: "/jukyuugo/sagyousho" },
  ...TOOL_CROSS_LINKS.kougin.map((id) => ({ title: TOOLS[id].name, note: TOOLS[id].what, href: TOOLS[id].path })),
] as const;

export default function Page() {
  return (
    <div className="platform kg-page">
      <header className="dougu-hero">
        <div className="p-container kg-width">
          <Breadcrumb
            items={[{ href: "/", label: "トップ" }, { href: "/jukyuugo", label: "受給が始まってから" }, { label: TOOLS.kougin.name }]}
            currentPath="/dougu/kougin"
          />
          <h1>{TITLE}</h1>
          <p className="kg-lead">
            所得で年金が止まる仕組みがあるのは、初診日が20歳前にある障害基礎年金だけです。それ以外の人には、所得制限はありません。20歳前の人は、前年の所得を国の線に当てはめると、全額・2分の1停止・全額停止のどれになるかが分かります。あわせて、健康保険の扶養の線(年収180万円未満)にも当てます。入力した内容はサーバーへ送らず、この端末の中だけで動きます。
          </p>
          <p className="jc-hero-meta jc--kingaku">
            <span className="jc-time">{TOOLS.kougin.time}</span>
            <span className="jc-basis">入力した内容は送信しません</span>
          </p>
          <PageDate updated={UPDATED} />
        </div>
      </header>

      <div className="p-container kg-width kg-main">
        <KouginTool />

        <section className="kg-card" aria-labelledby="kg-faq-heading">
          <h2 id="kg-faq-heading">よくある質問</h2>
          {FAQ.map((item) => (
            <details className="kg-details" key={item.q}>
              <summary>{item.q}</summary>
              <div className="kg-in">{item.a}</div>
            </details>
          ))}
        </section>

        <section className="kg-card" aria-labelledby="kg-next-heading">
          <h2 id="kg-next-heading">ここからできること</h2>
          <div className="kg-next">
            {NEXT.map((item) => {
              const body = <><b>{item.title}</b><span>{item.note}</span></>;
              return isPublishedInternalPath(item.href)
                ? <Link className="kg-next-item" href={item.href} key={item.title}>{body}</Link>
                : <p className="kg-next-item kg-next-soon" key={item.title}>{body}<span className="kg-soon">準備中</span></p>;
            })}
          </div>
        </section>

        <p className="p-source">出典: {SOURCES.join(" ／ ")}</p>
        <p><Link href="/jukyuugo">受給が始まってからへ戻る</Link></p>
        <p className="dougu-app-link"><Link href="/app">同じ機能をアプリで続ける →</Link></p>
      </div>
    </div>
  );
}
