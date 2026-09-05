import type { Metadata } from "next";
import { JibunCards } from "@/components/platform/JibunCard";
import { DouguCards } from "@/components/platform/DouguCard";
import { PRIVACY_LINE } from "@/data/dougu";
import HubGokai from "@/components/platform/HubGokai";
import Link from "next/link";
import { Breadcrumb, Card, CheckIcon, SectionHeader } from "@/components/platform/Platform";
import { AMOUNTS_2026 as A } from "@/data/amounts";
import { SAIKETSU_COUNTS } from "@/lib/saiketsu";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

const TITLE = "障害年金がゼロからわかる｜はじめての方へ";
const DESCRIPTION =
  "障害年金という言葉を初めて知った方へ。誰が対象か(3つの確認)、いくら受け取れるか(令和8年度の実額)、どのくらい時間がかかるか、最初にすることを、公的資料の出典つきでやさしく説明します。";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/hajimete" });

// 2026-09-02: 原稿 docs/hub-hajimete-v2-2026-09-02.md を反映。
// 数字は令和6年度の公的統計と令和8年度の年金額(data/amounts.ts)。

const checks = [
  {
    title: "その症状で、最初に病院へ行った日がわかる",
    copy: "この日を「初診日（しょしんび）」と呼びます。障害年金のすべては、この日を起点に決まります。",
    points: [
      "精神科でなくてもかまいません。眠れなくて行った内科でも初診日になります",
      "薬が出ていなくてもかまいません。「様子を見ましょう」で終わった受診も、検査だけの受診も、初診日になりえます",
      "病名がついた日ではありません。その症状ではじめて医師にかかった日です",
    ],
    more: [],
    tool: null,
    toolLabel: null,
    note: "思い出せなくても、あきらめないでください。何月何日まで特定できなくても、請求できる取り扱いがあります。",
    href: "/columns/shoshinbi-wakaranai",
    label: "初診日がわからないときの調べ方",
  },
  {
    title: "年金の保険料を、ある程度納めていた",
    copy: "初診日の前日の時点で、保険料を一定期間納めていた（または免除の手続きをしていた）ことが条件です。",
    points: [
      "「免除」や「猶予」の期間は、未納とは違います。ちゃんと数えられます。学生納付特例も同じです",
      "判定は初診日ごとです。昔に未納があっても、その後納めていれば、別の傷病では要件を満たせます",
      "20歳になる前の病気やけがなら、この条件はそもそも問われません",
    ],
    /* 4つ目は「もう1つ」に畳む。文は削らない。 */
    more: [
      "会社員・公務員の配偶者に扶養されていた期間（第3号被保険者）は、自分で払っていなくても納付済期間です",
    ],
    tool: null,
    toolLabel: null,
    note: "記録は年金事務所で確認できます。思い込みで諦める前に、記録を見てください。",
    href: "/columns/nofu-yoken",
    label: "納付要件をくわしく",
  },
  {
    title: "生活や仕事に、はっきりした支障がある",
    copy: "家事ができない日がある、外出がむずかしい、仕事を続けられない・配慮を受けている——そうした「生活の実態」で審査されます。",
    points: [
      "入院しているかどうかは条件ではありません",
      "働いていても対象になります。国のガイドラインに「労働に従事していることをもって、直ちに日常生活能力が向上したものと捉えない」と明記されています",
      "貯金や持ち家は、審査されません。資産を調べるのは生活保護のほうです",
    ],
    more: [],
    note: "",
    href: "/columns/nichijo-seikatsu-7koumoku",
    label: "審査で見られる「日常生活能力」の7項目",
    /* 程度の話なので、国の目安表に当てはめる道具をこのカードの最後に置く。 */
    tool: "/dougu/mitate",
    toolLabel: "国の目安に当てはめてみる",
  },
] as const;

const clues = [
  "お薬手帳、診察券、領収書",
  "健康保険を使った記録",
  "当時の手帳、日記、家計簿",
  "退職した時期、引っ越した時期、子どもの入学（生活の節目から挟むと、期間が絞れます）",
] as const;

const terms = [
  ["初診日", "その症状で最初に病院へ行った日。すべての起点。"],
  ["診断書", "医師に書いてもらう、審査でいちばん重視される書類。"],
  ["申立書", "自分（や家族）が生活の実態を書く書類。正式名は「病歴・就労状況等申立書」。"],
  ["等級", "障害の重さの区分（1〜3級）。金額が変わる。手帳の等級とは別もの。"],
] as const;

const anxieties = [
  {
    title: "「申請するのは甘えでは…」",
    copy: "障害年金は、保険料を納めてきた人のための制度上の正当な権利です。新しく決まった障害年金の70.3%が精神の障害によるもので、制度の中でもっとも標準的なケースです。この迷い自体が、症状の一部であることもあります。",
  },
  {
    title: "「周りに知られたくない…」",
    copy: "受給が戸籍・住民票・運転免許に載ることはありません。請求は年金事務所か市区町村に出す手続きで、勤務先を経由しません。受給が始まっても、機構から会社へ通知は行きません。",
  },
  {
    title: "「手帳を持っていないけど…」",
    copy: "手帳と障害年金は別々の制度です。手帳がなくても請求できますし、等級も連動しません。手帳3級で年金2級の人もいます。",
  },
  {
    title: "「働いているから無理では…」",
    copy: "働いていること自体は、対象外の理由になりません。見られるのは、どんな支えの中で働けているかです。就労継続支援A型・B型や障害者雇用で働いている場合、ガイドラインは1級または2級の可能性を検討するとしています。",
  },
  {
    title: "「昔、保険料を払っていなかった…」",
    copy: "判定は初診日ごとです。免除や猶予の手続きをした期間は未納ではありません。まず年金事務所で記録を見てください。",
  },
  {
    title: "「もう何年も前のことだから…」",
    copy: "申請そのものに時効はありません。初診日が30年前でも請求できます。時効があるのは、さかのぼって受け取れる分（直近5年）のほうです。",
  },
] as const;

/* このページが答える3つの問い。ヒーローに出して目次を兼ねる(sticky にしない)。
   答えの数字は data/amounts.ts から取る。 */
const QUESTIONS = [
  { q: "もらえる？", a: "確認することは 3 つ", href: "#checks" },
  { q: "いくら？", a: `障害基礎年金 2級で年 ${A.basicGrade2}円`, href: "#money" },
  { q: "まず何を？", a: "初診日を思い出す", href: "#first" },
] as const;

const faqSchema = faqJsonLd(anxieties.map((item) => ({ question: item.title, answer: item.copy })));

export default function HajimetePage() {
  return (
    <div className="platform">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <header className="p-page-hero">
        <div className="p-container">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { label: "はじめての方へ" }]} currentPath="/hajimete" />
          <h1>障害年金が、ゼロからわかる</h1>
          <p className="p-page-intro">
            このページは、「障害年金」という言葉を今日はじめて知った方のためのページです。むずかしい言葉は使いません。読み終わるころには、自分が対象になりそうか、いくらぐらいか、最初に何をすればいいかが分かります。
          </p>
          <div className="p-questions">
            {QUESTIONS.map((item) => (
              <div className="p-question" key={item.q}>
                <span>{item.q}</span>
                <b>{item.a}</b>
                <a href={item.href}>この節へ →</a>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="p-section" id="what" aria-labelledby="what-heading">
        <div className="p-container">
          <SectionHeader title="障害年金ってなに？ — 1分でわかる説明" />
          <Card className="p-card-lg">
            <p className="p-big-line">
              病気やけがのせいで、生活や仕事がむずかしくなったときに、<strong>国から定期的に受け取れるお金</strong>です。
            </p>
            <div className="p-grid" style={{ gap: 8, borderTop: "1px solid var(--c-border)", paddingTop: 14 }}>
              <p className="p-card-copy"><CheckIcon size={16} /> 「年金」という名前ですが、<strong>高齢者だけのものではありません</strong>。20代でも30代でも受け取れます。</p>
              <p className="p-card-copy"><CheckIcon size={16} /> うつ病や発達障害など、<strong>心の病気も対象</strong>です。新しく受け取り始める人の<strong>70.3%が精神の障害</strong>です。</p>
              <p className="p-card-copy"><CheckIcon size={16} /> これまで保険料を納めてきた人（または20歳前に障害を負った人）のための、<strong>制度上の正当な権利</strong>です。申請は甘えではありません。</p>
            </div>
            <div className="p-note" style={{ marginTop: 14 }}>
              <strong>どのくらいの人が受け取っているか。</strong>令和6年度、新しく決まったのは <strong>146,225件</strong>。同じ年に更新（再認定）の対象になったのは <strong>304,456件</strong>。数十万人が受け取っている、めずらしくない制度です。
            </div>
            <p className="p-source">出典: 厚生労働省「障害年金の業務統計等（令和6年度）」・日本年金機構「障害年金ガイド」 ・ 確認日 2026-08-31</p>
          </Card>
        </div>
      </section>

      <section className="p-section" id="checks" aria-labelledby="checks-heading">
        <div className="p-container">
          <SectionHeader title="わたしはもらえる？ — 確認することは3つだけ" lead="この3つがそろっていると、受け取れる可能性があります。いま全部わからなくても大丈夫です。" />
          <div className="p-grid p-grid-3">
            {checks.map((item, index) => (
              <Card className="p-card-lg p-check-card" key={item.title}>
                <span className="p-label">確認 {index + 1}</span>
                <h3 className="p-card-title">{item.title}</h3>
                <p className="p-card-copy">{item.copy}</p>
                <ul className="p-list">
                  {item.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
                {item.more.length > 0 && (
                  <details className="p-details">
                    <summary>もう1つ</summary>
                    <ul className="p-list">
                      {item.more.map((point) => <li key={point}>{point}</li>)}
                    </ul>
                  </details>
                )}
                {item.note ? <p className="p-flag p-flag-ok">{item.note}</p> : null}
                <Link className="p-card-link" href={item.href}>{item.label} →</Link>
                {item.tool ? <Link className="p-card-link" href={item.tool}>{item.toolLabel} →</Link> : null}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="p-section" id="money" aria-labelledby="money-heading">
        <div className="p-container">
          <SectionHeader title="いくらぐらい受け取れるの？" lead="金額は「等級」と「初診日にどの年金に入っていたか」で決まります。令和8年度の額です。" />
          {/* 金額はこの節の問い(いくら?)そのものなので、数字を先に出す。数字は黒。 */}
          <div className="p-money-grid">
            <article className="p-money-tile"><span>障害基礎年金 2級</span><strong>年 {A.basicGrade2}<em>円</em></strong><small>月あたり約70,600円。定額</small></article>
            <article className="p-money-tile"><span>障害基礎年金 1級</span><strong>年 {A.basicGrade1}<em>円</em></strong><small>2級の1.25倍</small></article>
            <article className="p-money-tile"><span>障害厚生年金 3級（最低保障）</span><strong>年 {A.employeesGrade3Minimum}<em>円</em></strong><small>3級は厚生年金だけの等級</small></article>
            <article className="p-money-tile"><span>年金生活者支援給付金</span><strong>月 {A.supportGrade2Monthly}<em>円</em></strong><small>2級。1級は月{A.supportGrade1Monthly}円。所得が一定以下のとき</small></article>
          </div>
          <DouguCards placements={["kingaku"]} variant="hub" />
          <div className="p-grid p-grid-3">
            <Card className="p-card-lg">
              <span className="p-label">障害基礎年金</span>
              <p className="p-card-copy">初診日に国民年金だった人、20歳前の人。<strong>定額</strong>です。</p>
              <p className="p-card-copy"><strong>2級 年{A.basicGrade2}円</strong>（月あたり約70,600円）<br /><strong>1級 年{A.basicGrade1}円</strong></p>
              <p className="p-card-copy">偶数月に2か月分がまとめて振り込まれます。18歳の年度末までの子がいれば、子の加算（1・2人目 各{A.childFirstSecond}円／3人目以降 各{A.childThird}円）がつきます。</p>
            </Card>
            <Card className="p-card-lg">
              <span className="p-label">障害厚生年金</span>
              <p className="p-card-copy">初診日に厚生年金だった人。上の障害基礎年金に、<strong>働いていた期間の給料に応じた額が上乗せ</strong>されます。</p>
              <p className="p-card-copy">加入期間が短くても<strong>300月（25年）分</strong>として計算されるので、若いうちに発症した人でも一定の額になります。</p>
              <p className="p-card-copy"><strong>3級</strong>は障害厚生年金だけの等級で、最低保障 年{A.employeesGrade3Minimum}円があります。</p>
            </Card>
            <Card className="p-card-lg">
              <span className="p-label">上乗せの可能性</span>
              <p className="p-card-copy"><strong>年金生活者支援給付金</strong>。所得が一定以下なら、1級で月{A.supportGrade1Monthly}円、2級で月{A.supportGrade2Monthly}円が上乗せされます。</p>
              <p className="p-card-copy">障害年金を請求するときに<strong>同時に請求するのが原則</strong>で、出し忘れの多い書類です。</p>
              <Link className="p-card-link" href="/okane/ikura">いくらもらえる? をくわしく →</Link>
            </Card>
          </div>
          <p className="p-source" style={{ marginTop: 10 }}>金額は毎年4月に改定されます。出典: 日本年金機構「障害年金ガイド」「年金生活者支援給付金」 ・ 確認日 2026-08-31</p>
        </div>
      </section>

      <section className="p-section" aria-labelledby="dougu-heading">
        <div className="p-container">
          <SectionHeader title="自分の場合を、確かめる" lead={PRIVACY_LINE} />
          <JibunCards ids={["mitate"]} />
        </div>
      </section>

      <section className="p-section" aria-labelledby="time-heading">
        <div className="p-container p-split">
          <Card className="p-card-lg">
            <h2>どのくらい時間がかかるか</h2>
            <p className="p-card-copy">心の準備のために、先に知っておいてください。</p>
            <ul className="p-list">
              <li><strong>初診日を確認して、書類をそろえる</strong> — 人によって大きく違います。数週間から数か月</li>
              <li><strong>診断書を依頼してから受け取るまで</strong> — すぐには出ません。1か月近くかかることもあると語られています</li>
              <li><strong>提出してから結果が届くまで</strong> — 機構が公表している標準的な処理期間があります。<Link href="/columns/shinsei-kikan">申請から結果までの期間</Link></li>
            </ul>
            <DouguCards placements={["shorui"]} variant="hub" />
            <p className="p-flag p-flag-danger">
              急ぐ理由がひとつだけあります。<strong>事後重症という請求のしかたは、請求した月の翌月分から</strong>なので、1か月遅れれば1か月分が消えます。ただし、体調を崩してまで急ぐ制度ではありません。動ける日に、少しずつで大丈夫です。
            </p>
          </Card>
          <div className="p-primary-panel p-grid" id="first" style={{ gap: 14 }}>
            <h2>最初の一歩は、ひとつだけ</h2>
            <p className="p-card-copy" style={{ color: "var(--c-band)" }}>
              「その症状で、いちばん最初に病院へ行ったのはいつだったか」を思い出してみてください。手がかりになるもの:
            </p>
            <ul className="p-list" style={{ color: "var(--c-band)" }}>
              {clues.map((clue) => <li key={clue}>{clue}</li>)}
            </ul>
            <Link href="/columns/shoshinbi-wakaranai">初診日の思い出し方ガイドへ →</Link>
            <p className="p-source" style={{ color: "var(--c-border)" }}>思い出せた範囲でメモしておくだけで、次に進めます。</p>
          </div>
        </div>
      </section>

      <section className="p-section" aria-labelledby="terms-heading">
        <div className="p-container">
          <SectionHeader title="これだけ知っていれば読めます — 4つの言葉" lead="サイト内でこの言葉が出てきたら、いつでもここに戻れます。" href="/yougo" linkLabel="用語をもっと見る" />
          <div className="p-grid p-grid-4">
            {terms.map(([title, copy]) => <Card key={title}><h3 className="p-card-title" style={{ color: "var(--c-primary)" }}>{title}</h3><p className="p-card-copy">{copy}</p></Card>)}
          </div>
        </div>
      </section>

      <section className="p-section" aria-labelledby="hub-gokai-heading">
        <div className="p-container">
          <HubGokai hubPath="/hajimete" />
        </div>
      </section>

      <section className="p-section-lg" aria-labelledby="anxiety-heading">
        <div className="p-container">
          <SectionHeader title="最後に、よくある不安へ" href="/gokai" linkLabel="よくある誤解をもっと見る" />
          <div className="p-grid p-grid-3" style={{ marginBottom: 18 }}>
            {anxieties.map((item) => <Card key={item.title}><h3 className="p-card-title">{item.title}</h3><p className="p-card-copy">{item.copy}</p></Card>)}
          </div>
          <div className="p-cta-row">
            <strong>準備ができたら</strong>
            <Link className="p-button" href="/shinsei">申請の流れを見る（8つのステップ） →</Link>
            <Link href="/nayami">困りごとがある方は「悩みから探す」へ</Link>
            <Link href="/jitsurei">結論が分かれた実例（{SAIKETSU_COUNTS.all}件）を見る</Link>
          </div>
          <p className="p-source" style={{ marginTop: 14 }}>
            出典: 日本年金機構「障害年金ガイド」／厚生労働省「障害年金の業務統計等（令和6年度）」／厚生労働省「精神の障害に係る等級判定ガイドライン」／国民年金法・厚生年金保険法 ・ 確認日 2026-08-31
          </p>
        </div>
      </section>
    </div>
  );
}
