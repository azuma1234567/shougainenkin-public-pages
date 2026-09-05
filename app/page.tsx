import type { Metadata } from "next";
import Link from "next/link";
import StepFlow from "@/components/platform/StepFlow";
import {
  Card,
  CaseCard,
  CheckIcon,
  PageDate,
  SectionHeader,
  TopicIcon,
} from "@/components/platform/Platform";
import SiteSearch, { type SearchItem } from "@/components/platform/SiteSearch";
import AdLabel from "@/components/AdLabel";
import { SHOW_LISTINGS } from "@/lib/ads";
import { COLUMNS } from "@/lib/columns";
import { SITE_NAME, SITE_PAGES_CHECKED, SITE_URL } from "@/lib/constants";
import { findCases, SAIKETSU_CASES, SAIKETSU_COUNTS } from "@/lib/saiketsu";
import { formatPercent, stats, type StatCell } from "@/lib/stats";
import { AMOUNTS_2026 as A } from "@/data/amounts";
import { ABOUT_PUBLISHER_ID, pageMetadata } from "@/lib/seo";
import { YOUGO } from "@/data/yougo";
import { GOKAI } from "@/data/gokai";
import { searchableYomi } from "@/lib/yougo";

const TITLE = "障害年金の疑問に、公的根拠と実例で答える｜障害年金申請サポート";
const DESCRIPTION = "障害年金がはじめての方へ。病気、申請の段階、いまの悩みから、公的資料の根拠と公開裁決例を使って自分に近い情報を探せます。";

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
  {
    href: "/suuji",
    title: "数字で見る障害年金",
    description: "新規裁定、支給割合、病気の種類、更新結果を公的統計から確認できます。",
    category: "実例と数字",
    keywords: "統計 支給率 非該当 更新 再認定 精神障害 件数",
  },
  ...GOKAI.map((card) => ({
    href: `/gokai/${card.slug}`,
    title: card.misconception,
    description: card.truth,
    category: "よくある誤解",
    keywords: `${card.misconception} ${card.truth} ${card.category}`,
  })),
  ...YOUGO.map((item) => ({
    href: `/yougo#${item.slug}`,
    title: item.term,
    description: item.paraphrase,
    category: "用語辞典",
    keywords: `${item.term} ${searchableYomi(item.slug, item.yomi)} ${item.paraphrase}`,
  })),
  ...COLUMNS.map((column) => ({
    href: `/columns/${column.slug}`,
    title: column.metaTitle ?? column.title,
    description: column.description,
    category: `コラム・${column.category}`,
    keywords: column.title,
  })),
];

export const metadata: Metadata = pageMetadata({
  showAppBanner: true,
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
    ["認知症(若年性を含む)", "/byoki/ninchishou"], ["高次脳機能障害", "/byoki/koujinou"], ["依存症", "/byoki/izon"],
  ] },
  { label: "内部疾患", items: [["腎臓病・人工透析", "/byoki/jinzou-touseki"], ["糖尿病", "/byoki/tounyou"], ["心臓病", "/byoki/shinzou"], ["がん", "/byoki/gan"], ["肝臓の病気", "/byoki/kanzou"], ["呼吸器の病気", "/byoki/kokyuuki"], ["血液・造血器の病気", "/byoki/ketsueki"]] },
  { label: "身体・感覚", items: [["肢体の障害", "/byoki/shitai"], ["目の障害", "/byoki/shikaku"], ["耳の障害・めまい", "/byoki/choukaku"], ["話す・食べる機能の障害", "/byoki/gengo"]] },
  { label: "その他", items: [["難病・その他の病気", "/byoki/nanbyou"]] },
] as const;

/* 病気別のチップは上位10だけ出し、残りは「…ほか11」で一覧へ送る。
   並びは既存の diseaseGroups の順(精神・発達 → 内部 → 身体・感覚 → その他)。 */
const topDiseases: readonly (readonly [string, string])[] = diseaseGroups
  .flatMap((group) => group.items as readonly (readonly [string, string])[])
  .filter(([, href]) => !["/byoki/shikaku", "/byoki/choukaku-heikou", "/byoki/nanbyou-sonota"].includes(href))
  .slice(0, 10);


// 「頼むかどうか」を決めるための3本に絞る。
// 「頼んだほうがいいケース」は jibun-ka-irai の中に、
// 「不支給のあと」は /nayami/fushikyu にあるので、トップには出さない。
const situations = [
  ["働きながら", "/joukyou/hatarakinagara"], ["20歳前", "/joukyou/hatachi-mae"],
  ["一人暮らし", "/joukyou/hitorigurashi"], ["傷病手当金から", "/joukyou/shoubyou-teatekin-kara"],
  ["65歳以上", "/joukyou/65sai-ijou"], ["主婦(主夫)・無職", "/joukyou/shufu-mushoku"],
  ["学生", "/joukyou/gakusei"], ["家族が手伝う", "/joukyou/kazoku-ga-tetsudau"],
  ["生活保護", "/joukyou/seikatsu-hogo"],
] as const;

const moneyTopics = [
  ["いくらもらえる?", "/okane/ikura"], ["税金と収入の扱い", "/okane/zeikin"],
  ["他の制度との調整", "/okane/chousei"],
] as const;

/* トップの「困りごと別」の1行リスト。右の数字は SAIKETSU_CASES と公的統計から。 */
const newDecisions = stats.r06["決定区分別件数"]["新規裁定・合計"];
const mentalShare = stats.nintei["診断書種類別・新規裁定"]["精神障害"]["件数"] as StatCell;
const renewalContinued = stats.nintei["再認定・抽出10000件"]["合計"]["継続"] as StatCell;
const shindanshoIssue = SAIKETSU_CASES.filter((item) => item.soten.includes("診断書の信頼性・整合性")).length;

const troubles = [
  { label: "不支給と言われた", href: "/nayami/fushikyu", data: "期限 3か月" },
  { label: "初診日がわからない・カルテがない", href: "/nayami/shoshinbi-karute", data: `争点 ${SAIKETSU_COUNTS.firstVisit}件` },
  { label: "診断書で困っている", href: "/nayami/shindansho-komatta", data: `争点 ${shindanshoIssue}件` },
  { label: "更新が不安・支給が止まった", href: "/nayami/koushin", data: `継続 ${formatPercent(renewalContinued.pct ?? 0)}` },
  { label: "さかのぼって請求したい", href: "/nayami/sokyuu", data: "最大5年" },
] as const;

const misconceptions = [
  { label: "誤解「貯金があると通らない」", href: "/gokai/chokin-ga-aru", title: "貯金や資産は審査に関係ありません", copy: "障害年金は保険の給付なので、貯金・資産・持ち家の有無は要件に含まれず、審査もされません。所得の制限があるのは20歳前傷病の場合だけです。", source: "日本年金機構" },
  { label: "誤解「入院してないと無理」", href: "/gokai/nyuuin-shitenai", title: "入院歴は要件ではありません", copy: "審査で見られるのは日常生活がどれだけ制限されているかです。在宅・通院のみでも、生活の実態が基準に該当すれば認定されます。", source: "国民年金・厚生年金保険 障害認定基準" },
  { label: "誤解「一生の記録に残る」", href: "/gokai/kaisha-ni-shirareru", title: "戸籍や運転免許に載ることはありません", copy: "受給が戸籍・住民票・運転免許に記載されることはありません。年金の記録として管理されるだけで、「公的なレッテルになる」という不安は実態と異なります。", source: "日本年金機構" },
] as const;

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
        <Card><AdLabel kind="掲載(広告)" /><p className="p-card-title">掲載事務所情報</p><p className="p-card-copy">当サイトは特定の事務所を推薦・選定しません。掲載の条件は<Link href="/ads">広告掲載について</Link>をご覧ください。</p></Card>
      </div>
    </section>
  );
}

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: DESCRIPTION,
    // 発行元の実体は /about に置いている(lib/seo.ts の publisherJsonLd)。
    publisher: { "@id": ABOUT_PUBLISHER_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="platform">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="p-hero" aria-labelledby="home-title">
        <div className="p-container p-hero-inner">
          <p className="p-trust-pill"><CheckIcon size={15} />掲載情報はすべて公的資料の出典つき・確認日を明記しています</p>
          <h1 id="home-title">「自分の場合は<br className="p-title-break-mobile" />どうなる？」に、<br className="p-title-break-desktop" />根拠つきで答えます</h1>
          <PageDate updated={SITE_PAGES_CHECKED} />
          <p className="p-hero-copy">はじめての方にも、むずかしい言葉を使わずに案内します。<br />知識240項目と、原文を確認できた公開実例{SAIKETSU_COUNTS.all}件から、あなたに近い答えを探せます。</p>
          <SiteSearch items={searchItems} />
          <div className="p-stats" aria-label="障害年金の数字">
            <div className="p-stat"><b>{formatPercent(newDecisions["支給"].pct ?? 0)}</b><span>支給に至った割合（令和6年度）</span></div>
            <div className="p-stat"><b>{formatPercent(mentalShare.pct ?? 0)}</b><span>精神の障害の割合</span></div>
            <div className="p-stat"><b>{SAIKETSU_COUNTS.all}</b><span>結論が分かれた実例（原文つき）</span></div>
            <div className="p-stat"><b>全件</b><span>公的資料の出典・確認日つき</span></div>
          </div>
          <p className="p-stats-note">新しく決まった障害年金の10件のうち7件は、精神の障害です。</p>
        </div>
      </section>

      <section className="p-section-lg" aria-labelledby="steps-heading">
        <div className="p-container">
          <SectionHeader title="申請の流れ ― 8つのステップ" lead="初診日の確認から結果が届くまで。左から右へ、順番に進みます。" href="/shinsei" linkLabel="申請の流れを詳しく見る" />
          <StepFlow />
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

      <section className="p-section-lg" aria-labelledby="find-heading">
        <div className="p-container">
          <SectionHeader
            title="どこから探しますか"
            lead="入口は5つあります。どこから入っても、必要なところへつながります。"
          />

          {/* 入口ごとに型を変える(原則 §3「型は内容で選ぶ」)。
              病気別・状況別=チップ / 困りごと別=1行リスト / お金=金額の組版 / 選ぶ=2枚のカード。 */}
          <div className="p-find">
            <div className="p-find-block">
              <div className="p-find-head">
                <h3 className="p-find-title">病気別</h3>
                <Link className="p-find-more" href="/byoki">21の病気 →</Link>
              </div>
              <p className="p-find-copy">病名では決まりませんが、審査で見られるところは病気ごとに違います。</p>
              <div className="p-chips">
                {topDiseases.map(([item, href]) => <Link className="p-chip" href={href} key={href}>{item}</Link>)}
                <Link className="p-chip is-soft" href="/byoki">…ほか{21 - topDiseases.length}</Link>
              </div>
            </div>

            <div className="p-find-block">
              <div className="p-find-head">
                <h3 className="p-find-title">状況別</h3>
                <Link className="p-find-more" href="/joukyou">9つの状況 →</Link>
              </div>
              <p className="p-find-copy">同じ病気でも、暮らし方によって見られるところが変わります。</p>
              <div className="p-chips">
                {situations.map(([label, href]) => <Link className="p-chip" href={href} key={href}>{label}</Link>)}
              </div>
            </div>

            <div className="p-find-block">
              <div className="p-find-head">
                <h3 className="p-find-title">困りごと別</h3>
                <Link className="p-find-more" href="/nayami">一覧を見る →</Link>
              </div>
              <p className="p-find-copy">実際に申請した人がつまずいた場面を、そのまま入口にしました。</p>
              <ul className="p-trouble-list">
                {troubles.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}<span>{item.data}</span></Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-find-small-grid">
              <div className="p-find-block p-find-block-small">
                <div className="p-find-head">
                  <h3 className="p-find-title">お金</h3>
                  <Link className="p-find-more" href="/okane">一覧を見る →</Link>
                </div>
                <p className="p-find-copy">受け取れる額、税金、ほかの制度との調整。</p>
                <div className="p-money-lines">
                  <p><span>障害基礎年金 2級</span><strong>{A.basicGrade2}円</strong><small>/年</small></p>
                  <p><span>上乗せ 給付金 2級</span><strong>{A.supportGrade2Monthly}円</strong><small>/月</small></p>
                </div>
                <p className="p-find-copy">税金はかからず、貯金があっても関係ありません</p>
                <div className="p-chips">
                  {moneyTopics.map(([label, href]) => <Link className="p-chip" href={href} key={href}>{label}</Link>)}
                </div>
              </div>
              <div className="p-find-block p-find-block-small">
                <div className="p-find-head">
                  <h3 className="p-find-title">自分でやるか、頼むか</h3>
                  <Link className="p-find-more" href="/erabu">ぜんぶ見る →</Link>
                </div>
                <p className="p-find-copy">申請は自分でもできますし、専門家に頼むこともできます。どちらが向いているかは状況によって変わります。ここでは判断材料だけを置きます。</p>
                <div className="p-choice-grid">
                  <Link className="p-card p-choice" href="/erabu/jibun-ka-irai">
                    <h4 className="p-card-title">自分で進める</h4>
                    <p className="p-card-copy">書類の集め方と、つまずきやすい場所を先に知る。</p>
                  </Link>
                  <Link className="p-card p-choice" href="/erabu/irai-subeki-case">
                    <h4 className="p-card-title">専門家に頼む</h4>
                    <p className="p-card-copy">頼めることの範囲と、依頼先の見分け方。</p>
                  </Link>
                </div>
                <Link className="p-card-link" href="/erabu/hiyou-souba">費用の相場を見る →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="p-section" aria-labelledby="misconception-heading">
        <div className="p-container">
          <SectionHeader title="その心配、誤解かもしれません" lead="あきらめる前に確認してほしい、よくある思い込みです。すべて公的資料で確認済み。" href="/gokai" linkLabel="よくある誤解を全部見る" />
          <div className="p-grid p-grid-3">
            {misconceptions.map((item) => (
              <Card key={item.title}>
                <span className="p-label p-label-misconception">{item.label}</span>
                <h3 className="p-card-title">{item.title}</h3>
                <p className="p-card-copy">{item.copy}</p>
                <p className="p-source">出典: {item.source} ・ 確認日 2026-08-31</p>
                <Link className="p-card-link" href={item.href}>くわしく見る →</Link>
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
            <Link className="p-chip is-soft" href="/suuji">数字で見る障害年金 →</Link>
          </div>
          <div className="p-grid">
            {featuredCases.map((item) => <CaseCard key={item.id} item={item} />)}
          </div>
        </div>
      </section>

      <Listings />
    </div>
  );
}
