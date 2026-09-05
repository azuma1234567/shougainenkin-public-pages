import type { Metadata } from "next";
import HubGokai from "@/components/platform/HubGokai";
import StepFlow from "@/components/platform/StepFlow";
import Link from "next/link";
import AppStoreBadge from "@/components/AppStoreBadge";
import { AMOUNT_ROWS, APP_POINTS, CONSIDER_PRO, FAQ_ITEMS, SELF_OK } from "@/components/ApplicationFlowPage";
import { Breadcrumb, CheckIcon, PageDate } from "@/components/platform/Platform";
import ShinseiRail from "@/components/platform/ShinseiRail";
import ShinseiTasks from "@/components/platform/ShinseiTasks";
import { DouguCards } from "@/components/platform/DouguCard";
import { PLACEMENTS } from "@/data/dougu";
import { SAIKETSU_CASES, SAIKETSU_COUNTS } from "@/lib/saiketsu";
import { formatPercent, stats } from "@/lib/stats";
import { GOKAI } from "@/data/gokai";
import { APP_STORE_URL, SITE_PAGES_CHECKED, SITE_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

const TITLE = "障害年金の申請の流れと必要書類｜8つのステップ";
const DESCRIPTION = "初診日の確認から結果が届くまで。障害年金の申請を8つのステップに分け、各段階ですること、つまずきやすいところ、関連記事を案内します。";

export const shinseiMetadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/shinsei", absoluteTitle: true });

type Step = {
  id: string;
  short: string;
  title: string;
  oneLine: string;
  body: string;
  tasks: string[];
  stumble: string;
  links: { href: string; label: string }[];
  /* つまずきに対応する誤解カード(data/gokai.ts の slug)。無いステップには置かない。 */
  gokai?: string;
};

const STEPS: Step[] = [
  {
    id: "step-1", short: "初診日を確認", title: "初診日を確認する",
    gokai: "shindan-ga-tsuita-hi",
    oneLine: "すべての起点。制度・納付要件・金額の見通しにつながります。",
    body: "その症状で、いちばん最初に医師の診療を受けた日が初診日です。精神科とは限らず、不眠や体調不良で内科を受診した日になることもあります。",
    tasks: ["最初に行った病院を、診察券やお薬手帳から確認する", "病院へ受診状況等証明書を依頼できるか確認する", "日付があいまいなときは、断定せず手がかりをメモする"],
    stumble: "診断名がついた日が初診日とは限りません。カルテがなくても、診察券・薬袋・転院先の記録・第三者証明など、確認できる道が残る場合があります。",
    links: [{ href: "/columns/shoshinbi-wakaranai", label: "初診日がわからないとき" }, { href: "/columns/shoshinbi-karute-nashi", label: "カルテがないとき" }],
  },
  {
    id: "step-2", short: "納付要件を確認", title: "納付要件を確認する",
    gokai: "mukashi-minou",
    oneLine: "初診日の前日時点の、保険料の納め方を確認します。",
    body: "3分の2要件か直近1年要件のどちらかを満たすか、年金記録で確かめます。免除・猶予の期間は、未納とは別に扱われます。",
    tasks: ["基礎年金番号がわかるものを用意する", "ねんきんネットか年金事務所で納付記録を確認する", "免除・学生納付特例・猶予の期間も含めて確認する"],
    stumble: "記憶だけで未納だと思い込み、確認前に結論を出さないことが大切です。判定されるのは初診日の前日時点で、初診日より後の納付は反映されません。",
    links: [{ href: "/columns/nofu-yoken", label: "納付要件の確認" }, { href: "/columns/hatachi-mae", label: "20歳前に初診日があるとき" }],
  },
  {
    id: "step-3", short: "年金事務所へ相談", title: "年金事務所へ相談する",
    oneLine: "必要な様式を受け取り、確認する順番を整理します。",
    body: "相談は準備が整う前でも利用できます。初診日や通院歴があいまいでも、わかる範囲のメモを持って予約すると話しやすくなります。",
    tasks: ["最寄りの年金事務所へ相談を予約する", "通院した病院と時期を、わかる範囲でメモする", "自分の請求に必要な書類一式を確認する"],
    stumble: "窓口での見立ては審査結果そのものではありません。説明がわかりにくいときは、日付と確認した内容をメモし、次回もう一度聞いても構いません。",
    links: [{ href: "/columns/nenkin-jimusho-soudan", label: "初回相談の持ち物" }, { href: "/columns/shinsei-shindoi", label: "無理のない進め方" }],
  },
  {
    id: "step-4", short: "必要書類をそろえる", title: "必要書類をそろえる",
    oneLine: "自分の請求に必要な書類を、ひとつずつ集めます。",
    body: "年金請求書、初診日の証明、診断書、申立書などを準備します。請求方法や家族構成によって追加書類があるため、一覧を窓口で確認します。",
    tasks: ["年金事務所でもらった書類一覧に印をつける", "戸籍・住民票など取得期限のある書類は後半に取る", "届いた書類は提出前にコピーできるようまとめる"],
    stumble: "すべてを同時に集める必要はありません。診断書など現症日の期限がある書類と、初診日の証明の進み具合を見ながら順番を決めます。",
    links: [{ href: "/columns/hitsuyou-shorui-seishin", label: "精神の障害の必要書類" }, { href: "/columns/jushinjokyo-shomeisho", label: "受診状況等証明書" }],
  },
  {
    id: "step-5", short: "診断書の準備", title: "診断書の準備をする",
    gokai: "omoku-misenai-to",
    oneLine: "診察室の外での生活が、主治医に伝わるように整えます。",
    body: "診断書はカルテや診察で把握された内容をもとに作られます。食事・清潔・金銭管理など、普段の生活を具体例と頻度で整理します。",
    tasks: ["日常生活の7項目を、支援がない場合で振り返る", "困った場面を頻度と具体例で短くまとめる", "依頼時に渡すメモと診断書様式を用意する"],
    stumble: "診察では反射的に「大丈夫です」と答えることがあります。渡せなくても失敗ではありません。自分の手元でメモを見ながら話す方法でも十分です。",
    links: [{ href: "/columns/shindansho-ishi-ni-tsutaeru", label: "主治医に伝えること" }, { href: "/columns/shindansho-tanomikata", label: "診断書の頼み方" }],
  },
  {
    id: "step-6", short: "申立書を作成", title: "申立書を作成する",
    gokai: "omoku-misenai-to",
    oneLine: "病歴と生活・仕事の実態を、診断書と同じ方向で伝えます。",
    body: "病歴・就労状況等申立書は、これまでの経過を本人側から説明する書類です。一気に文章にせず、期間を区切って事実を並べます。",
    tasks: ["受診歴と生活の変化を時系列に並べる", "期間ごとに治療・仕事・生活の様子を書く", "診断書と日付や生活状況が食い違わないか確認する"],
    stumble: "「つらかった」だけで終えず、入浴回数や家族の声かけなど、読み手が生活を想像できる事実に置き換えると伝わりやすくなります。",
    links: [{ href: "/columns/moushitatesho-kakikata", label: "申立書の書き方" }, { href: "/columns/moushitatesho-kikan-kugiri", label: "期間の区切り方" }],
  },
  {
    id: "step-7", short: "提出する", title: "年金事務所へ提出する",
    oneLine: "控えを残し、受付日と不足書類の有無を確認します。",
    body: "窓口または郵送で提出します。提出前に一式をコピーし、郵送なら追跡できる方法を選ぶと、あとで確認しやすくなります。",
    tasks: ["書類一式をコピーして手元に残す", "署名・日付・添付漏れを最終確認する", "受付日と、追加提出が必要かを確認する"],
    stumble: "診断書は封を開けて内容を確認して構いません。事実関係の誤りがあれば、提出前に医療機関へ確認します。評価そのものは医師の判断です。",
    links: [{ href: "/columns/teishutsusaki-yuusou", label: "提出先と郵送方法" }, { href: "/columns/shindansho-kakunin", label: "診断書の提出前確認" }],
  },
  {
    id: "step-8", short: "結果を待つ", title: "結果を待つ",
    oneLine: "照会に対応しながら、届いた通知の内容を確認します。",
    body: "審査中に追加書類の照会が届くことがあります。結果が届いたら、支給開始時期、等級、次回診断書提出年月などを確認します。",
    tasks: ["追加照会が届いたら期限と内容を確認する", "通知書・年金証書を一緒に保管する", "不支給や想定と違う結果なら、通知日と選択肢を確認する"],
    stumble: "不支給が生活の行き止まりになるわけではありません。不服申立てには期限があるため、通知を知った日を記録し、相談先と次の選択肢を確認します。",
    links: [{ href: "/jukyuugo", label: "受給が始まってから" }, { href: "/nayami/fushikyu", label: "不支給と言われたとき" }, { href: "/columns/shinsei-kikan", label: "審査期間と結果通知" }],
  },
];

const STUMBLES = [
  { step: "ステップ1で", title: "初診日の証明", copy: "昔のことで記録がない・病院が閉院した。ここで止まりそうなときにも、確認できる順番があります。", href: "#step-1" },
  { step: "ステップ5で", title: "診断書に実態が載らない", copy: "診察で「大丈夫です」と答えてしまい、普段の大変さが伝わっていない。", href: "#step-5" },
  { step: "ステップ6で", title: "申立書が書けない", copy: "何を書けばいいかわからず手が止まる。一気に書かなくて大丈夫です。", href: "#step-6" },
] as const;

/* 各ステップの右端に出す数字。出どころは公開済みの統計と裁決データだけ。
   数字を持たないステップには何も出さない(指示書 §2-2-5)。 */
const GOKAI_BY_SLUG = Object.fromEntries(GOKAI.map((card) => [card.slug, card]));

const STEP_DATA: Record<string, { label: string; value: string }> = {
  "step-1": { label: "初診日が争点の裁決", value: `${SAIKETSU_COUNTS.firstVisit}件` },
  "step-2": { label: "納付要件が争点", value: `${SAIKETSU_CASES.filter((item) => item.soten.includes("納付要件")).length}件` },
  "step-5": { label: "診断書が争点", value: `${SAIKETSU_CASES.filter((item) => item.soten.includes("診断書の信頼性・整合性")).length}件` },
  "step-7": { label: "標準処理期間", value: "3か月" },
  "step-8": { label: "支給に至った割合", value: formatPercent(stats.r06["決定区分別件数"]["新規裁定・合計"]["支給"].pct ?? 0) },
};

export default function ShinseiRestyled() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "HowTo", name: "障害年金の申請の流れ(8ステップ)", step: STEPS.map((step, index) => ({ "@type": "HowToStep", position: index + 1, name: step.title, text: step.oneLine, url: `${SITE_URL}/shinsei#${step.id}` })) },
      { "@type": "FAQPage", mainEntity: FAQ_ITEMS.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
    ],
  };
  return (
    <div className="platform shinsei-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="p-page-hero shinsei-hero"><div className="p-container shinsei-reading-width"><Breadcrumb items={[{ href: "/", label: "トップ" }, { label: "申請の流れ" }]} currentPath="/shinsei" /><h1>申請の流れ — 8つのステップ</h1><PageDate updated={SITE_PAGES_CHECKED} /><p className="p-page-intro">初診日の確認から結果が届くまで。全体の地図を先に持つと、いま自分がどこにいるかで迷いにくくなります。1ステップずつ、必要なことだけを載せています。</p><StepFlow /></div></header>
      <div className="p-container shinsei-reading-width shinsei-content">
        <section className="shinsei-section" aria-labelledby="stumbles-heading"><h2 id="stumbles-heading">つまずくのは、たいてい同じ3か所です</h2><div className="p-grid p-grid-3 shinsei-stumbles">{STUMBLES.map((item) => <a className="p-card" href={item.href} key={item.title}><span className="p-label">{item.step}</span><strong>{item.title}</strong><p>{item.copy}</p></a>)}</div></section>
        <div className="shinsei-layout">
          <ShinseiRail steps={STEPS.map((step) => ({ id: step.id, short: step.short, taskCount: step.tasks.length }))} />
          <div className="shinsei-steps">{STEPS.map((step, index) => {
            const data = STEP_DATA[step.id];
            return (
            <section className="shinsei-step-card" id={step.id} aria-labelledby={`${step.id}-title`} key={step.id}>
              <header>
                <span className="shinsei-step-number">{index + 1}</span>
                <div><h2 id={`${step.id}-title`}>{step.title}</h2><p>{step.oneLine}</p></div>
                {data ? <span className="shinsei-step-data">{data.label} <b>{data.value}</b></span> : null}
              </header>
              <p className="shinsei-step-body">{step.body}</p>
              <div className="shinsei-step-cols">
                <div className="shinsei-tasks">
                  <h3>この段階ですること</h3>
                  <ShinseiTasks stepId={step.id} tasks={step.tasks} />
                  <noscript><ul>{step.tasks.map((task) => <li key={task}>{task}</li>)}</ul></noscript>
                </div>
                <aside className="shinsei-stumble"><strong>つまずきやすいところ</strong><p>{step.stumble}</p></aside>
              </div>
              <footer>
                <nav aria-label={`ステップ${index + 1}の関連記事`}>
                  <DouguCards placements={PLACEMENTS.shinseiSteps[step.id]} variant="chip" />
                  {step.links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
                  {step.gokai ? <Link href={`/gokai/${step.gokai}`}>{GOKAI_BY_SLUG[step.gokai]?.misconception}</Link> : null}
                </nav>
                {index < STEPS.length - 1 && <a className="shinsei-next" href={`#${STEPS[index + 1].id}`}>次へ: {STEPS[index + 1].title} →</a>}
              </footer>
            </section>);
          })}</div>
        </div>

        <section className="shinsei-section" aria-labelledby="amount-heading"><h2 id="amount-heading">受け取れる金額の目安</h2><p>障害基礎年金は等級ごとに決まった額、障害厚生年金は加入期間と報酬に応じて一人ひとり変わります（令和8年4月分から）。</p><div className="shinsei-table-card"><div className="article-table-wrap"><table><thead><tr><th scope="col">等級</th><th scope="col">障害基礎年金（年額）</th><th scope="col">障害厚生年金（年額）</th></tr></thead><tbody>{AMOUNT_ROWS.map((row) => <tr key={row.grade}><th scope="row">{row.grade}</th><td>{row.kiso}</td><td>{row.kousei}</td></tr>)}</tbody></table></div><p>子の加算額は2人目まで1人につき243,800円、3人目以降は81,300円です。障害厚生年金の配偶者加給年金額は243,800円、3級の最低保障額は635,500円です。</p><small>出典: 日本年金機構 ・ 確認日 2026-04-01</small></div></section>

        <section className="shinsei-section" aria-labelledby="choice-heading"><h2 id="choice-heading">自分で進めるか、専門家に頼むか</h2><p>どちらが正しいということはありません。初診日の証明の難しさと、窓口とのやりとりを体調的にこなせるかを目安にできます。</p><div className="shinsei-choice"><article><h3>自分で進める</h3><ul>{SELF_OK.map((item) => <li key={item}><CheckIcon size={15} />{item}</li>)}</ul></article><article><h3>専門家に頼むことを考える</h3><ul>{CONSIDER_PRO.map((item) => <li key={item}><CheckIcon size={15} />{item}</li>)}</ul></article></div><Link className="p-card-link" href="/columns/jibun-de-shinsei">自分で申請するか、社会保険労務士に依頼するか →</Link></section>

        <section className="shinsei-breather" aria-labelledby="breather-heading"><h2 id="breather-heading">申請の途中で、しんどくなったら</h2><p>全部を一度にやる必要はありません。今日は1つ思い出すだけ、書類の名前を確認するだけでも構いません。体調がいちばん優先です。止まることは失敗ではありません。</p><Link href="/columns/shinsei-shindoi">疲れ果てない小分けの進め方 →</Link></section>

        <section className="shinsei-app" aria-labelledby="app-heading"><span className="p-label">申請準備の道具</span><h2 id="app-heading">申請の現在地と、次の一歩を、いつでも手元に</h2><p>「障害年金申請サポート」は、申請を代行するアプリではありません。日々の記録・診察メモ・申立書の準備を、自分のペースで進めるための道具です。</p><ul>{APP_POINTS.map((item) => <li key={item}><CheckIcon size={15} />{item}</li>)}</ul><AppStoreBadge href={APP_STORE_URL} /></section>

        <section className="shinsei-section"><HubGokai hubPath="/shinsei" /></section>

        <section className="shinsei-section" aria-labelledby="faq-heading"><h2 id="faq-heading">よくある質問</h2><div className="shinsei-faq">{FAQ_ITEMS.map((item) => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div></section>
      </div>
    </div>
  );
}
