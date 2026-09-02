import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CaseCard,
  CheckIcon,
  SectionHeader,
  TopicIcon,
} from "@/components/platform/Platform";
import SiteSearch, { type SearchItem } from "@/components/platform/SiteSearch";
import { COLUMNS } from "@/lib/columns";
import { SITE_URL } from "@/lib/constants";
import { findCases, SAIKETSU_COUNTS } from "@/lib/saiketsu";
import { pageMetadata } from "@/lib/seo";

const TITLE = "障害年金の疑問に、公的根拠と実例で答える";
const DESCRIPTION = "障害年金がはじめての方へ。病気、申請の段階、いまの悩みから、公的資料の根拠と公開裁決例を使って自分に近い情報を探せます。";
const SHOW_LISTINGS = false;

const searchItems: SearchItem[] = [
  {
    href: "/hajimete",
    title: "障害年金が、ゼロからわかる",
    description: "障害年金の基本と、受給要件をやさしい言葉で確認できます。",
    category: "はじめての方へ",
    keywords: "もらえる 対象 条件 初心者 基礎 厚生",
  },
  {
    href: "/byoki/utsu-soukyoku",
    title: "うつ病・双極性障害の障害年金",
    description: "精神の障害で審査されるポイント、実例、つまずきやすい場面をまとめています。",
    category: "病気から探す",
    keywords: "鬱 うつ 双極 躁うつ 精神 働きながら 日常生活",
  },
  {
    href: "/shinsei",
    title: "障害年金の申請の流れと必要書類",
    description: "初診日の確認から提出、結果が届くまでを8ステップで案内します。",
    category: "申請の流れ",
    keywords: "手続き やり方 必要書類 診断書 申立書 年金事務所",
  },
  {
    href: "/nayami/fushikyu",
    title: "不支給と言われたとき",
    description: "不支給通知を受け取った後の期限と、確認できる選択肢をまとめています。",
    category: "悩みから探す",
    keywords: "不服申立て 審査請求 再審査請求 却下 認められない",
  },
  {
    href: "/jitsurei",
    title: "結論が変わった実例",
    description: "公的PDFを確認した実例を、精神・発達、初診日、結論から探せます。",
    category: "実例と数字",
    keywords: "裁決例 容認 棄却 不支給 初診日 原文 PDF",
  },
  ...COLUMNS.map((column) => ({
    href: `/columns/${column.slug}`,
    title: column.metaTitle ?? column.title,
    description: column.description,
    category: `コラム・${column.category}`,
    keywords: column.title,
  })),
];

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

const beginnerCards = [
  {
    title: "障害年金ってなに？",
    copy: "病気やけがで生活や仕事がむずかしくなったときに、国から受け取れるお金です。うつ病などの心の病気も対象で、20代でも受け取れます。",
    href: "/hajimete#what",
    label: "1分でわかる説明を読む",
  },
  {
    title: "わたしはもらえる？",
    copy: "確認することは3つだけ。「最初に病院へ行った日」「保険料の納め方」「いまの生活の大変さ」。やさしい言葉で順番に確認できます。",
    href: "/hajimete#checks",
    label: "3つの確認をはじめる",
  },
  {
    title: "何から始めればいい？",
    copy: "最初の一歩はひとつだけ。「その症状で、いちばん最初に病院へ行った日」を思い出すことです。ここがすべての出発点になります。",
    href: "/shinsei#step-1",
    label: "最初の一歩を見る",
  },
] as const;

const diseaseGroups = [
  { label: "精神・発達", items: [
    ["うつ病・双極性障害", "/byoki/utsu-soukyoku"], ["適応障害・不安障害", "/byoki/tekiou-fuan"],
    ["発達障害", "/byoki/hattatsu"], ["統合失調症", "/byoki/tougou"], ["知的障害", "/byoki/chiteki"], ["てんかん", "/byoki/tenkan"],
  ] },
  { label: "内部疾患", items: [["腎臓病・人工透析", "/byoki/jinzou-touseki"], ["がん", "/byoki/gan"], ["心臓病", "/byoki/shinzou"], ["糖尿病", "/byoki/tounyou"]] },
  { label: "身体・その他", items: [["肢体の障害", "/byoki/shitai"], ["目の障害", "/byoki/shikaku"], ["耳・平衡", "/byoki/choukaku-heikou"], ["難病・その他", "/byoki/nanbyou-sonota"]] },
] as const;

const worries = [
  { title: "不支給と言われた", copy: "一度の不支給が最終結論とは限りません。不服申立ての期限と、実際に結論が変わった裁決例へ。", href: "/nayami/fushikyu" },
  { title: "初診日のカルテがない", copy: "閉院・カルテ破棄でも道はあります。第三者証明と、認められた実例。", href: "/columns/shoshinbi-karute-nashi" },
  { title: "診断書を書いてもらえない", copy: "医師との向き合い方と、生活の実態を伝える準備のしかた。", href: "/columns/shindansho-kaitekurenai" },
  { title: "働きながら申請したい", copy: "働いていること自体だけでは決まりません。ガイドラインの根拠つきで解説。", href: "/columns/hatarakinagara" },
  { title: "更新が不安", copy: "更新で止まる場合・戻る場合。支給停止から復活した裁決例も。", href: "/columns/koushin-kakuninhodo" },
  { title: "さかのぼって請求したい", copy: "遡及請求の条件と時効。5年という期間の正しい理解。", href: "/columns/sokyuu-seikyuu" },
  { title: "申立書が書けない", copy: "病歴・就労状況等申立書の書き方。生活の実態をありのまま伝える方法。", href: "/columns/moushitatesho-kakikata" },
  { title: "20歳前の障害・家族の申請", copy: "納付要件が不問になる場合や、家族が代わりに動くときの手順。", href: "/columns/hatachi-mae" },
] as const;

const misconceptions = [
  { label: "誤解「貯金があると通らない」", title: "貯金や資産は審査に関係ありません", copy: "障害年金は保険の給付なので、貯金・資産・持ち家の有無は要件に含まれず、審査もされません。所得の制限があるのは20歳前傷病の場合だけです。", source: "日本年金機構" },
  { label: "誤解「入院してないと無理」", title: "入院歴は要件ではありません", copy: "審査で見られるのは日常生活がどれだけ制限されているかです。在宅・通院のみでも、生活の実態が基準に該当すれば認定されます。", source: "国民年金・厚生年金保険 障害認定基準" },
  { label: "誤解「一生の記録に残る」", title: "戸籍や運転免許に載ることはありません", copy: "受給が戸籍・住民票・運転免許に記載されることはありません。年金の記録として管理されるだけで、「公的なレッテルになる」という不安は実態と異なります。", source: "日本年金機構" },
] as const;

const steps = ["初診日を確認する", "納付要件を確認する", "年金事務所へ相談する", "必要書類をそろえる", "診断書の準備をする", "申立書を作成する", "年金事務所へ提出する", "結果を待つ"];

const featuredCases = [
  ...findCases((item) => item.shobyo.includes("統合失調症") && item.soten.includes("初診日"), 1),
  ...findCases((item) => item.shobyo.includes("自閉") && item.ketsuron === "容認", 1),
];

function Listings() {
  if (!SHOW_LISTINGS) return null;
  return (
    <section className="p-section p-soft-band" aria-labelledby="listings-heading">
      <div className="p-container">
        <SectionHeader title="専門家に相談したいとき" lead="自力での申請が難しいと感じたら、障害年金を扱う社会保険労務士に相談する道もあります。" />
        <Card><span className="p-label">掲載</span><p className="p-card-title">掲載事務所情報</p><p className="p-card-copy">当サイトは特定の事務所を推薦・選定しません。</p></Card>
      </div>
    </section>
  );
}

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "障害年金ノート",
    url: SITE_URL,
    description: DESCRIPTION,
  };

  return (
    <div className="platform">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="p-hero" aria-labelledby="home-title">
        <div className="p-container p-hero-inner">
          <p className="p-trust-pill"><CheckIcon size={15} />掲載情報はすべて公的資料の出典つき・確認日を明記しています</p>
          <h1 id="home-title">「自分の場合は<br className="p-title-break-mobile" />どうなる？」に、<br className="p-title-break-desktop" />根拠つきで答えます</h1>
          <p className="p-hero-copy">はじめての方にも、むずかしい言葉を使わずに案内します。<br />知識240項目と、原文を確認できた公開実例{SAIKETSU_COUNTS.all}件から、あなたに近い答えを探せます。</p>
          <SiteSearch items={searchItems} />
          <div className="p-stats" aria-label="掲載情報の件数">
            <div className="p-stat"><b>240</b><span>知識項目（全件出典つき）</span></div>
            <div className="p-stat"><b>{SAIKETSU_COUNTS.all}</b><span>原文確認済みの公開実例</span></div>
            <div className="p-stat"><b>67</b><span>公的出典</span></div>
            <div className="p-stat"><b>毎朝</b><span>最新情報を巡回・更新</span></div>
          </div>
        </div>
      </section>

      <section className="p-section-lg" aria-labelledby="beginner-heading">
        <div className="p-container">
          <SectionHeader title="障害年金、はじめてですか？" lead="知識ゼロで大丈夫です。この3つから始めてください。" />
          <div className="p-grid p-grid-3">
            {beginnerCards.map((item, index) => (
              <Card key={item.title} className="p-card-lg p-card-primary">
                <span className="p-number">{index + 1}</span>
                <h3 className="p-card-title">{item.title}</h3>
                <p className="p-card-copy">{item.copy}</p>
                <Link className="p-card-link" href={item.href}>{item.label} →</Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="p-section" aria-labelledby="disease-heading">
        <div className="p-container">
          <SectionHeader title="病気から探す" lead="病気ごとに「審査で見られるポイント」と「結論を分けた実例」をまとめています。" href="/byoki/utsu-soukyoku" linkLabel="公開中の病気を見る" />
          <div className="p-chip-groups">
            {diseaseGroups.map((group) => (
              <div className="p-chip-row" key={group.label}>
                <span className="p-chip-label">{group.label}</span>
                <div className="p-chips">
                  {group.items.map(([item, href]) => href && !["/byoki/shikaku", "/byoki/choukaku-heikou", "/byoki/nanbyou-sonota"].includes(href) ? <Link className="p-chip" href={href} key={item}>{item}</Link> : <span className="p-chip" key={item}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="p-section-lg" aria-labelledby="worry-heading">
        <div className="p-container">
          <SectionHeader title="いま困っていることから探す" lead="実際に申請した人がつまずいた場面を、そのまま入口にしました。" />
          <div className="p-grid p-grid-4">
            {worries.map((item) => (
              <Link className="p-card" href={item.href} key={item.title}>
                <TopicIcon />
                <h3 className="p-card-title">{item.title}</h3>
                <p className="p-card-copy">{item.copy}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="p-section" aria-labelledby="misconception-heading">
        <div className="p-container">
          <SectionHeader title="その心配、誤解かもしれません" lead="あきらめる前に確認してほしい、よくある思い込みです。すべて公的資料で確認済み。" />
          <div className="p-grid p-grid-3">
            {misconceptions.map((item) => (
              <Card key={item.title}>
                <span className="p-label p-label-misconception">{item.label}</span>
                <h3 className="p-card-title">{item.title}</h3>
                <p className="p-card-copy">{item.copy}</p>
                <p className="p-source">出典: {item.source} ・ 確認日 2026-08-31</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="p-section-lg p-band" aria-labelledby="cases-heading">
        <div className="p-container">
          <SectionHeader title="一度「不支給」でも、結論が変わった実例があります" lead={`一度は認められなかったあと、国の再審査で結論が見直された実例を含む${SAIKETSU_COUNTS.all}件を集めました。全件、原文（公的PDF）つき。`} href="/jitsurei" linkLabel="実例集を開く" />
          <div className="p-chips" style={{ marginBottom: 18 }}>
            <Link className="p-chip is-active" href="/jitsurei">すべて ({SAIKETSU_COUNTS.all})</Link>
            <Link className="p-chip is-soft" href="/jitsurei?kind=mental">精神・発達 ({SAIKETSU_COUNTS.mental})</Link>
            <Link className="p-chip is-soft" href="/jitsurei?issue=first-visit">初診日が争点 ({SAIKETSU_COUNTS.firstVisit})</Link>
            <Link className="p-chip is-soft" href="/jitsurei?outcome=accepted">容認された例 ({SAIKETSU_COUNTS.accepted})</Link>
          </div>
          <div className="p-grid">
            {featuredCases.map((item) => <CaseCard key={item.id} item={item} />)}
          </div>
        </div>
      </section>

      <section className="p-section-lg" aria-labelledby="steps-heading">
        <div className="p-container">
          <SectionHeader title="はじめての方は、8つのステップで" lead="初診日の確認から結果が届くまで。全体の地図を持ってから動くと、迷いにくくなります。" href="/shinsei" linkLabel="申請の流れを詳しく見る" />
          <div className="p-grid p-grid-8">
            {steps.map((step, index) => (
              <Link className="p-card p-step-card" href={`/shinsei#step-${index + 1}`} key={step}>
                <span className="p-step-label">STEP {index + 1}</span>
                <span className="p-step-title">{step}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Listings />
    </div>
  );
}
