import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StepFlow from "@/components/platform/StepFlow";
import { Card, SectionHeader } from "@/components/platform/Platform";
import SiteSearch, { type SearchItem } from "@/components/platform/SiteSearch";
import { DoctorNoteIcon, FirstVisitIcon, ResultIcon, StatementIcon, SubmitIcon, WaitingIcon } from "@/components/platform/NextStepIcons";
import AdLabel from "@/components/AdLabel";
import { SHOW_LISTINGS } from "@/lib/ads";
import { COLUMNS } from "@/lib/columns";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { SAIKETSU_COUNTS } from "@/lib/saiketsu";
import { ABOUT_PUBLISHER_ID, organizationJsonLd, pageMetadata } from "@/lib/seo";
import { formatPercent, MENTAL_NON_PAYMENT_CASES, stats } from "@/lib/stats";
import { TOOLS } from "@/data/dougu";
import { YOUGO } from "@/data/yougo";
import { GOKAI } from "@/data/gokai";
import { searchableYomi } from "@/lib/yougo";

const TITLE = "障害年金申請サポート｜社労士に頼まず自分で申請する人の、初診日・診断書・申立書の進め方";
const DESCRIPTION = "障害年金を自分で申請する人のための無料サイト。初診日の探し方、診断書で見られる7項目、申立書をスマホで作って印刷する機能、不支給85件の公開裁決例まで、公的資料の根拠つきで案内します。";

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
    category: "困りごと別",
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

/* 統計はすべて data/stats から(scripts/verify-stats.mjs がこのファイルに直書きが無いことを見る)。 */
const newDecisions = stats.r06["決定区分別件数"]["新規裁定・合計"];
const renewals = stats.r06["決定区分別件数"]["再認定・合計"];
const renewalStopRate = formatPercent(renewals["支給停止"].pct ?? 0);

/* 入口の「次にやること」6枚(docs/top-2026-09-15-instructions.md §2-2。文言はモックのまま)。
   答えの中の数字は、リンク先の本文に同じ値があることを確かめてある(5つ・4か所・約3か月・3か月以内)。
   更新で止まる割合だけは統計(data/stats)から出す。アンカーの id は MarkdownArticle の headingId が作るもの。 */
const nextSteps = [
  {
    title: "初診日を確かめる",
    Icon: FirstVisitIcon,
    answer: "最初にかかった病院に、受診状況等証明書を郵送で頼めます。記憶があいまいでも、探す方法は5つあります。",
    links: [["初診日の探し方", "/columns/shoshinbi-wakaranai"], ["郵送で頼む手順", "/columns/jushinjokyo-shomeisho"]],
  },
  {
    title: "診断書を医師に頼む",
    Icon: DoctorNoteIcon,
    answer: "診察の数分で、ふだんの生活を伝えるための紙1枚を用意します。受け取ったら、提出前に見ておく場所は4か所です。",
    links: [["診察前に書いておくメモ", "/columns/shinsatsu-mae-memo"], ["受け取ったら見る4か所", "/nayami/shindansho-komatta#審査で本当に見られているのはこの4つ"]],
  },
  {
    title: "申立書を書く",
    Icon: StatementIcon,
    answer: "公式の様式に、スマホでそのまま入力して印刷できます。書いた内容はあなたの端末の中だけに残ります。",
    links: [["スマホで入力して印刷する", "/dougu/moushitatesho"], ["期間の区切り方", "/columns/moushitatesho-kikan-kugiri"]],
  },
  {
    title: "書類をそろえて提出する",
    Icon: SubmitIcon,
    answer: "誰にでも要る書類は決まっています。あとは自分の場合に足すものだけ。年金事務所へ持参しても、郵送でも出せます。",
    links: [["自分に要る書類を確かめる", "/dougu/shorui"], ["提出先と郵送のしかた", "/columns/teishutsusaki-yuusou"]],
  },
  {
    title: "結果を待つあいだにすること",
    Icon: WaitingIcon,
    answer: "届くまでの目安は約3か月。途中の連絡は基本ありません。長引いても、受け取る額が減ることはありません。",
    links: [["待っている間にできること", "/columns/shinsei-kikan"], ["遅いときの確認先", "/columns/shinsei-kikan#結果が遅いときの確認方法"]],
  },
  {
    title: "結果が届いたあと",
    Icon: ResultIcon,
    answer: `認められたら、次は更新です。止まる人は${renewalStopRate}。認められなかったら、3か月以内に審査請求ができ、結論が変わった実例があります。`,
    links: [["受け取り始めてからの手続き", "/jukyuugo"], ["不支給のあとにできること", "/nayami/fushikyu"]],
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

const situations = [
  ["働きながら", "/joukyou/hatarakinagara"], ["20歳前", "/joukyou/hatachi-mae"],
  ["一人暮らし", "/joukyou/hitorigurashi"], ["傷病手当金から", "/joukyou/shoubyou-teatekin-kara"],
  ["65歳以上", "/joukyou/65sai-ijou"], ["主婦(主夫)・無職", "/joukyou/shufu-mushoku"],
  ["学生", "/joukyou/gakusei"], ["家族が手伝う", "/joukyou/kazoku-ga-tetsudau"],
  ["生活保護", "/joukyou/seikatsu-hogo"],
] as const;

const misconceptions = [
  { label: "誤解「貯金があると通らない」", href: "/gokai/chokin-ga-aru", title: "貯金や資産は審査に関係ありません", copy: "障害年金は保険の給付なので、貯金・資産・持ち家の有無は要件に含まれず、審査もされません。所得の制限があるのは20歳前傷病の場合だけです。", source: "日本年金機構" },
  { label: "誤解「入院してないと無理」", href: "/gokai/nyuuin-shitenai", title: "入院歴は要件ではありません", copy: "審査で見られるのは日常生活がどれだけ制限されているかです。在宅・通院のみでも、生活の実態が基準に該当すれば認定されます。", source: "国民年金・厚生年金保険 障害認定基準" },
  { label: "誤解「一生の記録に残る」", href: "/gokai/kaisha-ni-shirareru", title: "戸籍や運転免許に載ることはありません", copy: "受給が戸籍・住民票・運転免許に記載されることはありません。年金の記録として管理されるだけで、「公的なレッテルになる」という不安は実態と異なります。", source: "日本年金機構" },
] as const;

/* 「ほかの人はどうだったか」の4つ(§2-5)。値は data/stats と SAIKETSU_COUNTS から。 */
const proofs = [
  { value: formatPercent(newDecisions["非該当"].pct ?? 0), copy: `新規申請の非該当率(令和6年度・${newDecisions["計"].value.toLocaleString("ja-JP")}件)` },
  { value: `${MENTAL_NON_PAYMENT_CASES}件`, copy: "精神の不支給の内訳。4つの型に分かれる", href: "/columns/fushikyu-85ken" },
  { value: renewalStopRate, copy: `更新で支給停止になる割合(${renewals["計"].value.toLocaleString("ja-JP")}件中)` },
  { value: `${SAIKETSU_COUNTS.all}件`, copy: "結論が分かれた公開裁決。原文PDFつき", href: "/jitsurei" },
];

function Listings() {
  if (!SHOW_LISTINGS) return null;
  return (
    <section className="p-section p-soft-band" aria-labelledby="listings-heading">
      <div className="p-container">
        <SectionHeader title="専門家に相談したいとき" lead="自力での申請が難しいと感じたら、障害年金を扱う社会保険労務士に相談する道もあります。" />
        <Card><AdLabel kind="掲載(広告)" /><p className="p-card-title"><Link href="/sharoushi">社労士を探す</Link></p><p className="p-card-copy">都道府県から、障害年金を扱う社労士事務所を探せます。当サイトは特定の事務所を推薦・選定しません。掲載の条件は<Link href="/ads">広告掲載について</Link>をご覧ください。</p></Card>
      </div>
    </section>
  );
}

export default function HomePage() {
  /* WebSite と Organization を1つの @graph で結ぶ(docs/seo-2026-09-08-instructions.md §2)。
     script は1つだけにする。サイト内検索が無いので SearchAction は入れない。6枚は ItemList にしない(§3)。 */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description: DESCRIPTION,
        inLanguage: "ja",
        publisher: { "@id": ABOUT_PUBLISHER_ID },
      },
      organizationJsonLd,
    ],
  };

  return (
    <div className="platform">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* 入口は申請の時間順の作業6枚(docs/top-2026-09-15-instructions.md)。各枚の見出しはページの主構造なので h2 */}
      <section className="p-hero p-hero-next" aria-labelledby="home-title">
        <div className="p-container p-hero-inner">
          {/* 900px 以上は 左:文 / 右:水彩イラスト(44%)、未満は 文 → 画像 → 6枚 の1列(docs/top-hero-image-2026-09-15-instructions.md)。
              LCP になるので priority。他の画像には付けない。 */}
          <div className="p-hero-top">
            <div className="p-hero-text">
              <h1 id="home-title">次にやることは、どれですか。</h1>
              <p className="p-hero-copy">障害年金の申請は、やることが順番に6つあります。自分で進める人のために、それぞれの「やり方」を公的資料の根拠つきでまとめました。いちばん近いものからどうぞ。<br /><Link className="p-hero-start" href="/hajimete">まだ何も始めていない方は、こちらから →</Link></p>
            </div>
            <Image
              className="p-hero-image"
              src="/img/top/hero-1600.webp"
              alt="家でベッドにもたれて座り、スマートフォンで障害年金の手続きを調べている人。床には書きかけの書類とペン"
              width={1600} height={900}
              priority
              quality={60}
              sizes="(max-width: 899px) calc(100vw - 40px), 44vw"
            />
          </div>
          <div className="p-next">
            {nextSteps.map((step, index) => (
              <article className="p-next-card" key={step.title}>
                <span className="p-next-n" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <step.Icon />
                <h2>{step.title}</h2>
                <p className="p-next-a">{step.answer}</p>
                <p className="p-next-go">
                  {step.links.map(([label, href]) => <Link href={href} key={href}>→ {label}</Link>)}
                </p>
              </article>
            ))}
          </div>
          <SiteSearch items={searchItems} placeholder="病名・言葉・気になることで探す(例: 一人暮らし、第三者証明、傷病手当金)" />
        </div>
      </section>

      <section className="p-section-lg" aria-labelledby="tools-heading">
        <div className="p-container">
          <SectionHeader title="自分の手で進めるための3つ" lead="無料・登録なし。入力した内容はあなたの端末から出ません。" />
          {/* 説明文は data/dougu.ts の既存文言(§2-3) */}
          <div className="p-tools3">
            <Link className="p-tool-card" href={TOOLS.moushitatesho.path}>
              <h3>申立書をスマホで作る</h3>
              <p>{TOOLS.moushitatesho.blurb}</p>
              <span className="p-card-link">{TOOLS.moushitatesho.cta} →</span>
            </Link>
            <Link className="p-tool-card" href={TOOLS.shorui.path}>
              <h3>必要書類をそろえる</h3>
              <p>{TOOLS.shorui.blurb}</p>
              <span className="p-card-link">{TOOLS.shorui.cta} →</span>
            </Link>
            <div className="p-tool-card">
              <h3>何級くらいか・いくらか、先に知る</h3>
              <p>{TOOLS.mitate.blurb}</p>
              <p>{TOOLS.kingaku.blurb}</p>
              <span className="p-tool-links">
                <Link className="p-card-link" href={TOOLS.mitate.path}>{TOOLS.mitate.cta} →</Link>
                <Link className="p-card-link" href={TOOLS.kingaku.path}>{TOOLS.kingaku.cta} →</Link>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="p-section-lg p-band" aria-labelledby="steps-heading">
        <div className="p-container">
          <SectionHeader title="申請の流れ ― 8つのステップ" lead="初診日の確認から結果が届くまで。上の6つは、この流れの中のどこかです。" href="/shinsei" linkLabel="申請の流れを詳しく見る" />
          <StepFlow tools={false} />
        </div>
      </section>

      <section className="p-section-lg" aria-labelledby="find-heading">
        <div className="p-container">
          <div className="p-grid p-grid-2 p-find-row">
            <div>
              <SectionHeader title="病気から" lead="病名では決まりませんが、審査で見られるところは病気ごとに違います。" href="/byoki" linkLabel="一覧を見る" />
              <div className="p-chip-groups">
                {diseaseGroups.map((group) => (
                  <div className="p-chip-row" key={group.label}>
                    <span className="p-chip-label">{group.label}</span>
                    <div className="p-chips">
                      {group.items.map(([item, href]) => <Link className="p-chip" href={href} key={href}>{item}</Link>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionHeader title="いまの状況から" lead="同じ病気でも、暮らし方によって見られるところが変わります。" href="/joukyou" linkLabel="一覧を見る" />
              <div className="p-chips">
                {situations.map(([label, href]) => <Link className="p-chip" href={href} key={href}>{label}</Link>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="p-section-lg p-band" aria-labelledby="proof-heading">
        <div className="p-container">
          <SectionHeader title="ほかの人はどうだったか" lead="国の統計と、公開されている裁決の原文から。すべて出典・確認日つき。" href="/jitsurei" linkLabel="実例集" />
          <div className="p-proof">
            {proofs.map((item) => item.href
              ? <Link className="p-proof-card" href={item.href} key={item.copy}><b>{item.value}</b><span>{item.copy}</span></Link>
              : <div className="p-proof-card" key={item.copy}><b>{item.value}</b><span>{item.copy}</span></div>)}
          </div>
        </div>
      </section>

      <section className="p-section-lg" aria-labelledby="misconception-heading">
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

      <Listings />
    </div>
  );
}
