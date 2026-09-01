import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, Card, CheckIcon, SectionHeader } from "@/components/platform/Platform";
import { pageMetadata } from "@/lib/seo";

const TITLE = "障害年金がゼロからわかる｜はじめての方へ";
const DESCRIPTION = "障害年金という言葉を初めて知った方へ。制度の意味、対象になる3つの条件、最初にすること、4つの基本用語をやさしく説明します。";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/hajimete" });

const checks = [
  { title: "その症状で、最初に病院へ行った日がわかる", copy: "この日を「初診日（しょしんび）」と呼びます。障害年金のすべてはこの日を起点に決まります。精神科でなくても、最初に相談した内科などでもかまいません。", note: "思い出せなくても、あきらめないでください。調べる方法があります。" },
  { title: "年金の保険料を、ある程度納めていた", copy: "初診日の前に、保険料を一定期間納めていた（または免除の手続きをしていた）ことが条件です。「免除」や「猶予」の期間は未納とは違い、ちゃんとカウントされます。", note: "20歳になる前の病気やけがなら、この条件はそもそも問われません。" },
  { title: "生活や仕事に、はっきりした支障がある", copy: "家事ができない日がある、外出がむずかしい、仕事を続けられない・配慮を受けている——そうした「生活の実態」で審査されます。入院しているかどうかは条件ではありません。", note: "働いていても対象になる場合があります。" },
] as const;

const terms = [
  ["初診日", "その症状で最初に病院へ行った日。すべての起点。"],
  ["診断書", "医師に書いてもらう、審査でいちばん重視される書類。"],
  ["申立書", "自分（や家族）が生活の実態を書く書類。正式名は「病歴・就労状況等申立書」。"],
  ["等級", "障害の重さの区分（1〜3級）。金額が変わる。手帳の等級とは別もの。"],
] as const;

const anxieties = [
  ["「申請するのは甘えでは…」", "障害年金は、保険料を納めてきた人のための制度上の正当な権利です。公式の案内にも、現役世代を含めて受け取れる年金だと明記されています。"],
  ["「周りに知られたくない…」", "受給が戸籍・住民票・運転免許に載ることはありません。会社に自動的に伝わることもありません。"],
  ["「手帳を持っていないけど…」", "障害者手帳と障害年金は別々の制度です。手帳がなくても請求できますし、等級も連動しません。"],
] as const;

export default function HajimetePage() {
  return (
    <div className="platform">
      <header className="p-page-hero">
        <div className="p-container">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { label: "はじめての方へ" }]} />
          <h1>障害年金が、ゼロからわかる</h1>
          <p className="p-page-intro">このページは、「障害年金」という言葉を今日はじめて知った方のためのページです。むずかしい言葉は使いません。読み終わるころには、自分が何をすればいいかがわかります。</p>
        </div>
      </header>

      <section className="p-section" id="what" aria-labelledby="what-heading">
        <div className="p-container">
          <SectionHeader title="障害年金ってなに？ — 1分でわかる説明" />
          <Card className="p-card-lg" >
            <p style={{ fontSize: 15.5, lineHeight: 2.1 }}>病気やけがのせいで、生活や仕事がむずかしくなったときに、<strong style={{ color: "#0273ad" }}>国から定期的に受け取れるお金</strong>です。</p>
            <div className="p-grid" style={{ gap: 8, borderTop: "1px solid #ecf4fa", paddingTop: 14 }}>
              <p className="p-card-copy"><CheckIcon size={16} /> 「年金」という名前ですが、<strong>高齢者だけのものではありません</strong>。20代や30代でも受け取れます。</p>
              <p className="p-card-copy"><CheckIcon size={16} /> うつ病や発達障害など、<strong>心の病気も対象</strong>です。実際、新しく受け取り始める人の約7割は精神の障害です。</p>
              <p className="p-card-copy"><CheckIcon size={16} /> これまで保険料を納めてきた人のための、<strong>制度上の正当な権利</strong>です。申請は甘えではありません。</p>
            </div>
            <p className="p-source">出典: 日本年金機構・厚生労働省の公表資料 ・ 確認日 2026-08-31</p>
          </Card>
        </div>
      </section>

      <section className="p-section" id="checks" aria-labelledby="checks-heading">
        <div className="p-container">
          <SectionHeader title="わたしはもらえる？ — 確認することは3つだけ" lead="この3つがそろっていると、受け取れる可能性があります。いま全部わからなくても大丈夫です。" />
          <div className="p-grid p-grid-3">
            {checks.map((item, index) => (
              <Card className="p-card-lg" key={item.title}>
                <span className="p-label">確認 {index + 1}</span>
                <h3 className="p-card-title">{item.title}</h3>
                <p className="p-card-copy">{item.copy}</p>
                <p className="p-note">{item.note}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="p-section">
        <div className="p-container p-split">
          <Card className="p-card-lg">
            <h2 style={{ fontSize: 20 }}>いくらぐらい受け取れるの？</h2>
            <p className="p-card-copy">金額は「等級」と「初診日にどの年金に入っていたか」で決まります。</p>
            <div className="p-note"><strong>障害厚生年金</strong><br />働いていた期間の給料に応じて上乗せされます。</div>
            <Link className="p-card-link" href="/columns/ikura-moraeru">公的資料で確認した金額表を見る →</Link>
          </Card>
          <div className="p-primary-panel p-grid" style={{ gap: 14 }}>
            <h2 style={{ fontSize: 20 }}>最初の一歩は、ひとつだけ</h2>
            <p className="p-card-copy" style={{ color: "#dbeefa" }}>「その症状で、いちばん最初に病院へ行ったのはいつだったか」を思い出してみてください。手帳やお薬手帳、診察券が手がかりになります。</p>
            <Link href="/columns/shoshinbi-wakaranai">初診日の思い出し方ガイドへ →</Link>
            <p className="p-source" style={{ color: "#a8d4ee" }}>確認できるときに、手がかりだけ残しておくこともできます。</p>
          </div>
        </div>
      </section>

      <section className="p-section" aria-labelledby="terms-heading">
        <div className="p-container">
          <SectionHeader title="これだけ知っていれば読めます — 4つの言葉" lead="サイト内でこの言葉が出てきたら、いつでもここに戻れます。" />
          <div className="p-grid p-grid-4">
            {terms.map(([title, copy]) => <Card key={title}><h3 className="p-card-title" style={{ color: "#0273ad" }}>{title}</h3><p className="p-card-copy">{copy}</p></Card>)}
          </div>
        </div>
      </section>

      <section className="p-section-lg" aria-labelledby="anxiety-heading">
        <div className="p-container">
          <SectionHeader title="最後に、よくある不安へ" />
          <div className="p-grid p-grid-3" style={{ marginBottom: 18 }}>
            {anxieties.map(([title, copy]) => <Card key={title}><h3 className="p-card-title">{title}</h3><p className="p-card-copy">{copy}</p></Card>)}
          </div>
          <div className="p-cta-row">
            <strong>準備ができたら、8つのステップへ</strong>
            <Link className="p-button" href="/shinsei">申請の流れを見る →</Link>
            <Link href="/nayami/fushikyu">困りごとがある方は「悩みから探す」へ</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
