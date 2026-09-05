import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/platform/Platform";
import { formatCount, formatPercent, stats, type StatCell } from "@/lib/stats";
import { pageMetadata } from "@/lib/seo";

const TITLE = "数字で見る障害年金";
const DESCRIPTION = "障害年金の新規裁定、支給割合、診断書種類、更新結果を、日本年金機構と厚生労働省の公表資料から確認できます。";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/suuji" });

const r06New = stats.r06["決定区分別件数"]["新規裁定・合計"];
const r06Renewal = stats.r06["決定区分別件数"]["再認定・合計"];
const diagnosis = stats.r06["診断書種類別件数・新規裁定"];
const sampleNew = stats.nintei["新規裁定・抽出1000件"]["合計"];
const sampleTypes = stats.nintei["診断書種類別・新規裁定"];
const sampleRenewal = stats.nintei["再認定・抽出10000件"]["合計"];
const mentalCases = diagnosis["精神障害・知的障害"]["決定"] as StatCell;
const mentalShare = Math.round((mentalCases.value / r06New["計"].value) * 100);
const mentalAverage = Math.round(stats.annual.slice(-3).reduce((sum, year) => (
  sum + year["診断書種類別件数・新規裁定"]["精神障害・知的障害"]["決定"].value
), 0) / stats.annual.slice(-3).length);

const typeBars = ["精神障害", "外部障害", "内部障害"].map((name) => ({
  name,
  cell: sampleTypes[name as keyof typeof sampleTypes]["件数"] as StatCell,
}));

const gradeBars = ["1級", "2級", "3級", "非該当"].map((name) => ({
  name,
  cell: sampleNew[name as keyof typeof sampleNew] as StatCell,
}));

const nonApplicableBars = ["精神障害", "外部障害", "内部障害"].map((name) => ({
  name,
  cell: sampleTypes[name as keyof typeof sampleTypes]["非該当"] as StatCell,
}));

const renewalBars = ["継続", "増額改定", "減額改定", "支給停止"].map((name) => ({
  name,
  cell: sampleRenewal[name as keyof typeof sampleRenewal] as StatCell,
}));

const diagnosisRows = [
  "精神障害・知的障害", "眼", "聴覚等", "肢体", "呼吸器疾患", "循環器疾患", "腎疾患・肝疾患・糖尿病", "血液・造血器・その他",
] as const;

const annualPoints = stats.annual.map((year) => ({
  year: year["年度"],
  total: year["決定区分別件数"]["新規裁定・合計"]["計"] as StatCell,
  nonApplicable: year["決定区分別件数"]["新規裁定・合計"]["非該当"] as StatCell,
}));

const annualTotals = annualPoints.map((item) => item.total.value);
const annualMin = Math.min(...annualTotals);
const annualMax = Math.max(...annualTotals);
const linePoints = annualPoints.map((item, index) => {
  const x = (index / (annualPoints.length - 1)) * 100;
  const y = 82 - ((item.total.value - annualMin) / (annualMax - annualMin)) * 62;
  return `${x},${y}`;
}).join(" ");

const tenkenNonPayment = stats.tenken["不支給事案"]["令和8年3月31日現在"];
const tenkenPayment = stats.tenken["支給事案"]["令和8年8月31日現在"];
const businessSource = stats.sources.sources.gyoumuToukeiR06;
const researchSource = stats.sources.sources.ninteiChousaR06;
const tenkenSource = stats.sources.sources.tenken;

function PercentBar({ label, cell, scale = 100 }: { label: string; cell: StatCell; scale?: number }) {
  const pct = cell.pct ?? 0;
  return (
    <div className="suuji-bar-row">
      <div className="suuji-bar-label"><span>{label}</span><strong>{formatCount(cell)}・{formatPercent(pct)}</strong></div>
      <div className="suuji-bar-track" aria-hidden="true"><span style={{ width: `${Math.min((pct / scale) * 100, 100)}%` }} /></div>
    </div>
  );
}

export default function SuujiPage() {
  const renewalDonut = {
    background: `conic-gradient(#0284c7 0 ${sampleRenewal["継続"].pct}%, #38a8dc ${sampleRenewal["継続"].pct}% ${sampleRenewal["継続"].pct + sampleRenewal["増額改定"].pct}%, #8fc9e7 ${sampleRenewal["継続"].pct + sampleRenewal["増額改定"].pct}% ${sampleRenewal["継続"].pct + sampleRenewal["増額改定"].pct + sampleRenewal["減額改定"].pct}%, #c5dfea 0)`,
  } as CSSProperties;

  return (
    <div className="platform suuji-page">
      <header className="p-page-hero suuji-hero">
        <div className="p-container hub-reading-width">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { href: "/jitsurei", label: "実例と数字" }, { label: TITLE }]} currentPath="/suuji" />
          <h1>{TITLE}</h1>
          <p className="p-page-intro">障害年金は、年に約{Math.round(r06New["計"].value / 10000)}万人が新しく申請し、そのうち{formatPercent(r06New["支給"].pct ?? 0)}が支給に至っています。更新で止まる人は100人に1人。精神の障害での申請が{Math.round((sampleTypes["精神障害"]["件数"].pct ?? 0) / 10)}割を占め、いちばん標準的なケースです。</p>
          <p className="p-page-intro">このページは、国が公表している2つの資料（日本年金機構の業務統計と、厚生労働省の認定状況調査）から、申請する人が「自分の位置」を知るための数字だけを取り出したものです。不安を煽るためでも、安心させるためでもなく、実態を見るために。数字は毎年、公表後に更新します。</p>
        </div>
      </header>

      <div className="p-container hub-reading-width suuji-content">
        <section className="suuji-section" aria-labelledby="suuji-big-numbers">
          <h2 id="suuji-big-numbers">1. 大きな数字（令和6年度）</h2>
          <div className="suuji-stat-grid">
            <article className="suuji-stat-tile"><span>新規に決まった件数</span><strong>{formatCount(r06New["計"] as StatCell)}</strong><small>障害基礎年金＋障害厚生年金</small></article>
            <article className="suuji-stat-tile"><span>支給に至った割合</span><strong>{formatPercent(r06New["支給"].pct ?? 0)}</strong><small>非該当 {formatPercent(r06New["非該当"].pct ?? 0)}・{formatCount(r06New["非該当"] as StatCell)}</small></article>
            <article className="suuji-stat-tile"><span>精神障害・知的障害の診断書</span><strong>{formatCount(mentalCases)}</strong><small>新規裁定の約{mentalShare}%</small></article>
            <article className="suuji-stat-tile"><span>更新（再認定）の件数</span><strong>{formatCount(r06Renewal["計"] as StatCell)}</strong><small>抽出調査では継続 {formatPercent(sampleRenewal["継続"].pct ?? 0)}</small></article>
          </div>
        </section>

        <section className="suuji-section" aria-labelledby="suuji-types">
          <h2 id="suuji-types">2. どんな病気で申請しているか</h2>
          <div className="suuji-chart-card" aria-label="診断書種類別の構成比">
            {typeBars.map(({ name, cell }) => <PercentBar key={name} label={name} cell={cell} />)}
            <p className="suuji-chart-note">抽出調査では、複数の診断書を使う場合に診断書ごとに数えるため、種類別の合計は抽出件数と一致しません。</p>
          </div>
          <p>「精神疾患で申請していいのか」というためらいは、この数字と逆です。10人のうち7人が精神の診断書で申請しています。</p>
          <div className="suuji-table-wrap" role="region" aria-label="業務統計の診断書種類別件数" tabIndex={0}>
            <table className="suuji-table">
              <caption>令和6年度 新規裁定・診断書種類別件数</caption>
              <thead><tr><th scope="col">診断書種類</th><th scope="col">決定</th><th scope="col">支給</th><th scope="col">非該当</th></tr></thead>
              <tbody>
                {diagnosisRows.map((name) => {
                  const row = diagnosis[name];
                  return <tr key={name}><th scope="row">{name}</th><td>{formatCount(row["決定"] as StatCell)}</td><td>{formatCount(row["支給"] as StatCell)}</td><td>{formatCount(row["非該当"] as StatCell)}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="suuji-section" aria-labelledby="suuji-awards">
          <h2 id="suuji-awards">3. どれくらいの割合で支給になるか</h2>
          <div className="suuji-chart-card">
            <div className="suuji-stacked" aria-hidden="true">
              {gradeBars.map(({ name, cell }) => <span className={`is-${name}`} key={name} style={{ width: `${cell.pct ?? 0}%` }} />)}
            </div>
            <ul className="suuji-legend" aria-label="等級別の割合">
              {gradeBars.map(({ name, cell }) => <li key={name}><span className={`suuji-dot is-${name}`} />{name} <strong>{formatCount(cell)}・{formatPercent(cell.pct ?? 0)}</strong></li>)}
            </ul>
          </div>
          <p>半数以上が2級です。3級は障害厚生年金だけの等級なので、初診日に会社員だった人の分だけ現れます。</p>
          <div className="suuji-chart-card" aria-label="診断書種類別の非該当率">
            {nonApplicableBars.map(({ name, cell }) => <PercentBar key={name} label={name} cell={cell} scale={Math.max(...nonApplicableBars.map((item) => item.cell.pct ?? 0))} />)}
          </div>
          <p>意外に思われるかもしれませんが、いちばん非該当が多いのは内部障害です。検査数値と一般状態区分の両方が問われる分野で、「日中どれだけ横になっているか」が伝わっていないと、数値だけで判断されやすい。</p>
          <p className="suuji-links"><Link href="/byoki/gan">がんと障害年金</Link><Link href="/byoki/jinzou-touseki">腎臓病・人工透析と障害年金</Link></p>
        </section>

        <section className="suuji-section" aria-labelledby="suuji-renewal">
          <h2 id="suuji-renewal">4. 更新で止まる人は、どれくらいいるか</h2>
          <div className="suuji-chart-card suuji-donut-layout">
            <div className="suuji-donut" style={renewalDonut} aria-hidden="true"><span><strong>{formatPercent(sampleRenewal["継続"].pct ?? 0)}</strong>継続</span></div>
            <ul className="suuji-legend" aria-label="再認定の結果">
              {renewalBars.map(({ name, cell }) => <li key={name}><span className={`suuji-dot renewal-${name}`} />{name} <strong>{formatCount(cell)}・{formatPercent(cell.pct ?? 0)}</strong></li>)}
            </ul>
          </div>
          <p>100人が更新を迎えると、97人はそのまま続き、1人は上がり、1人は下がり、1人は止まる。「更新で切られる」不安は、数字で見ると1%の話です。ただし、その1%に入るかどうかは、更新の診断書に普段の状態が載っているかで決まります。</p>
          <p className="suuji-links"><Link href="/nayami/koushin">更新が不安・下がったとき</Link></p>
        </section>

        <section className="suuji-section" aria-labelledby="suuji-denial">
          <h2 id="suuji-denial">5. 不支給の中身</h2>
          <p>厚生労働省の調査は、精神障害の不支給事案を一件ずつ分析しています。その結果、ガイドラインの目安より下位の等級に認定されたケースと、目安が2つの等級にまたがるものについて下位の等級に認定されたケースが、あわせて<strong>{formatPercent(stats.nintei["精神障害・不支給事案"]["上記2区分の合計"]["割合"].value)}</strong>を占めました。</p>
          <p>つまり、精神の不支給の4件に3件は、「対象外の病気だった」のではなく、「目安の境目で下に振れた」ケースです。境目で何が見られているかは、診断書の日常生活能力の7項目と、就労欄、そして援助の実態です。</p>
          <p className="suuji-links"><Link href="/nayami/shindansho-komatta">診断書で困ったとき</Link></p>
          <div className="suuji-check-card">
            <p>この調査を受けて、日本年金機構は令和6年度の不支給事案と、下位等級で支給された事案の点検を行っています。</p>
            <dl>
              <div><dt>不支給事案</dt><dd>{formatCount(tenkenNonPayment["点検済"] as StatCell)}を点検し、{formatCount(tenkenNonPayment["支給へ変更"] as StatCell)}（約{formatPercent(tenkenNonPayment["支給へ変更"].pct ?? 0)}）が支給へ</dd></div>
              <div><dt>支給事案</dt><dd>{formatCount(tenkenPayment["点検済"] as StatCell)}で、上位等級への変更は{formatCount(tenkenPayment["上位等級へ変更"] as StatCell)}</dd></div>
            </dl>
            <small>取得日 {stats.tenken["取得日"]}</small>
          </div>
          <p>読み方には注意が要ります。{formatPercent(tenkenNonPayment["支給へ変更"].pct ?? 0)}は「不支給の{formatPercent(tenkenNonPayment["支給へ変更"].pct ?? 0)}が誤りだった」と読むこともできるし、「{formatPercent((sampleNew["計"].pct ?? 0) - (tenkenNonPayment["支給へ変更"].pct ?? 0))}は点検しても変わらなかった」と読むこともできる。どちらにせよ、審査には公表された物差しがあり、それは誰でも読める。「どうせ運次第」ではない、という一点だけは、この数字が支えています。</p>
        </section>

        <section className="suuji-section" aria-labelledby="suuji-years">
          <h2 id="suuji-years">6. 年ごとの動き</h2>
          <div className="suuji-chart-card suuji-line-chart">
            <svg viewBox="0 0 100 100" role="img" aria-label="令和2年度から令和6年度までの新規裁定件数の推移">
              <path d="M0 82H100" className="suuji-axis" />
              <polyline points={linePoints} className="suuji-line" />
              {linePoints.split(" ").map((point, index) => {
                const [cx, cy] = point.split(",");
                return <circle key={annualPoints[index].year} cx={cx} cy={cy} r="2.3" className="suuji-point" />;
              })}
            </svg>
            <div className="suuji-year-list">
              {annualPoints.map((item) => <div key={item.year}><strong>{item.year}</strong><span>{formatCount(item.total)}</span><small>非該当 {formatPercent(item.nonApplicable.pct ?? 0)}</small></div>)}
            </div>
          </div>
          <p>精神障害・知的障害の診断書による新規裁定は、令和4〜6年度の3年平均で{mentalAverage.toLocaleString("ja-JP")}件、令和6年度は{formatCount(mentalCases)}でした。増えています。</p>
          <p className="suuji-definition-note">業務統計の「非該当」には、障害の程度以外の理由も含まれます。審査に必要な書類等の不備で障害等級を判定できない場合などは、非該当とは別に「却下」として集計されています。</p>
        </section>

        <section className="suuji-section" aria-labelledby="suuji-use">
          <h2 id="suuji-use">7. この数字の使い方</h2>
          <p>数字は、あなたの結果を予言しません。{formatPercent(r06New["支給"].pct ?? 0)}に入るか{formatPercent(r06New["非該当"].pct ?? 0)}に入るかは、統計ではなく、書類に何が載っているかで決まります。このページの数字は、「自分だけが特別に難しい状況なのではない」「精神で申請するのは普通のことだ」「更新は毎年でも、必ず切られるものでもない」を確かめるために使ってください。</p>
          <p className="suuji-links"><Link href="/hajimete">不安が数字で消えないときは、はじめての方へ</Link></p>
        </section>

        <section className="suuji-sources" aria-labelledby="suuji-sources">
          <h2 id="suuji-sources">出典</h2>
          <ul>
            <li><a href={businessSource.url} target="_blank" rel="noopener noreferrer">{businessSource.title}</a>（{businessSource.publishedLabel}公表、{businessSource.correctionLabel}訂正）・確認日 {businessSource.checkedAt}</li>
            <li><a href={researchSource.url} target="_blank" rel="noopener noreferrer">{researchSource.title}</a>（{researchSource.publishedLabel}公表）・確認日 {researchSource.checkedAt}</li>
            <li><a href={tenkenSource.url} target="_blank" rel="noopener noreferrer">{tenkenSource.title}</a>・取得日 {stats.tenken["取得日"]}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
