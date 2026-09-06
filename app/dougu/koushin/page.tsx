import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import KoushinTool from "@/components/tools/KoushinTool";
import { TOOLS, TOOL_CROSS_LINKS } from "@/data/dougu";
import { pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";
import { formatCount, formatPercent, stats, type StatCell } from "@/lib/stats";

/* docs/dougu-2hon-2026-09-06-instructions.md §B-4 の文言をそのまま使う。 */
const UPDATED = "2026-09-06";
const TITLE = "更新カウントダウン — 障害状態確認届の提出期限まで";
const DESCRIPTION =
  "年金証書の「次回診断書提出年月」を入れると、用紙が届く時期、診断書の現症日として使える期間、提出期限が日付で出ます。準備の順番も日付つき。入力は送信されません。";

const isPublished = isPublishedInternalPath("/dougu/koushin");

export const metadata: Metadata = {
  ...pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/dougu/koushin", showAppBanner: true, appBannerArgument: "https://shougainenkin-note.net/dougu/koushin" }),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};

/* 数字の帯。日本年金機構「障害年金業務統計(令和6年度決定分)」(data/stats/gyoumu-toukei-r06.json)。 */
const renewal = stats.r06["決定区分別件数"]["再認定・合計"];
const mental = stats.r06["診断書種類別件数・再認定"]["精神障害・知的障害"];

/* FAQ。答えは /nayami/koushin・/jukyuugo/hataraku と同じ。 */
const FAQ = [
  { q: "提出が遅れたらどうなりますか。", a: "提出が遅れると、支払いが一時止まることがあります。提出して障害の状態が確認されれば再開します。用紙が届いていないときは、年金事務所に連絡してください。" },
  { q: "更新で下がったら、それまでの年金を返すのですか。", a: "返しません。変わるのはその後の支払い分です(虚偽の申告など不正の場合は別)。" },
  { q: "更新で下がった結果に納得できません。", a: "新規の不支給と同じように、決定を知った日の翌日から3か月以内に審査請求ができます。実態が変わっていないのに下がったなら、直近の診断書に普段の状態が載っていたかを、まず確かめてください。" },
  { q: "更新は毎年ありますか。", a: "毎年ではありません。障害の状態に応じて1〜5年ごとに個別に決まります。時期は年金証書の「次回診断書提出年月」で確認できます。" },
] as const;

const SOURCES = [
  "日本年金機構「障害状態確認届(診断書)が届いたとき」「障害の程度が変わったとき」「年金の決定に不服があるとき」",
  "日本年金機構「障害年金業務統計(令和6年度決定分)」",
  "確認日: 2026-09-06",
];

const NEXT = [
  { title: "更新が不安なとき", note: "更新の仕組みと、下がった・止まったときの手続き", href: "/nayami/koushin" },
  { title: "働くと年金はどうなるか", note: "更新で見られるのは「どんな援助の中で、どう働けているか」。主治医に渡すメモの型", href: "/jukyuugo/hataraku" },
  ...TOOL_CROSS_LINKS.koushin.map((id) => ({ title: TOOLS[id].name, note: TOOLS[id].what, href: TOOLS[id].path })),
] as const;

export default function Page() {
  return (
    <div className="platform kg-page">
      <header className="dougu-hero">
        <div className="p-container kg-width">
          <Breadcrumb
            items={[{ href: "/", label: "トップ" }, { href: "/jukyuugo", label: "受給が始まってから" }, { label: TOOLS.koushin.name }]}
            currentPath="/dougu/koushin"
          />
          <h1>{TITLE}</h1>
          <p className="kg-lead">
            年金証書の「次回診断書提出年月」を入れると、用紙が届く時期、診断書の現症日として使える期間、提出期限が日付で出ます。更新で審査されるのは障害の状態だけで、初診日や納付要件のやり直しではありません。令和6年度の更新{formatCount(renewal["計"] as StatCell)}のうち、そのまま続いたのは{formatPercent(renewal["継続"].pct ?? 0)}。準備は、用紙が届いてからではなく、その1年前から始まります。入力した内容はサーバーへ送らず、この端末の中だけで動きます。
          </p>
          <p className="jc-hero-meta jc--kingaku">
            <span className="jc-time">{TOOLS.koushin.time}</span>
            <span className="jc-basis">入力した内容は送信しません</span>
          </p>
          <PageDate updated={UPDATED} />
        </div>
      </header>

      <div className="p-container kg-width kg-main">
        <section className="kg-card" aria-labelledby="kg-stats-heading">
          <h2 id="kg-stats-heading">数字で見る、更新</h2>
          <table className="kg-br">
            <tbody>
              <tr><th scope="row">更新(再認定)の件数</th><td className="kg-n">{formatCount(renewal["計"] as StatCell)}</td></tr>
              <tr><th scope="row">そのまま続いた</th><td className="kg-n">{formatCount(renewal["継続"] as StatCell)}({formatPercent(renewal["継続"].pct ?? 0)})</td></tr>
              <tr><th scope="row">支給停止</th><td className="kg-n">{formatCount(renewal["支給停止"] as StatCell)}({formatPercent(renewal["支給停止"].pct ?? 0)})</td></tr>
              <tr><th scope="row">精神障害・知的障害</th><td className="kg-n">継続 {formatCount(mental["継続"] as StatCell)} に対して 支給停止 {formatCount(mental["支給停止"] as StatCell)}</td></tr>
            </tbody>
          </table>
          <p className="kg-hintline">100人のうち約97人は、そのまま続いています。出典: 日本年金機構「障害年金業務統計(令和6年度決定分)」。</p>
        </section>

        <KoushinTool />

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
