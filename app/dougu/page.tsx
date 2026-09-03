import type { Metadata } from "next";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import { isPublishedInternalPath } from "@/lib/published-links";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const UPDATED = "2026-09-03";

const DESCRIPTION =
  "「自分の場合はどうなるのか」に、公開されている基準と数字で答える5つの機能です。等級の目安・金額・必要書類・年金事務所・申立書を、自分の状況に当てはめて確かめられます。";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "自分の場合を確かめる",
    description: DESCRIPTION,
    path: "/dougu",
  }),
};

const tools = [
  {
    number: "01",
    title: "等級の目安をしらべる",
    description: "自分がどのあたりかを、国の基準に沿って確認します。",
    href: "/dougu/mitate",
  },
  {
    number: "02",
    title: "障害年金の金額",
    description: "等級や加入していた制度などから、受け取る金額の目安を内訳つきで確認します。",
    href: "/dougu/kingaku",
  },
  {
    number: "03",
    title: "必要書類チェックリスト",
    description: "自分の場合に必要な書類と、そろえる順番を確認します。",
    href: "/dougu/shorui",
  },
  {
    number: "04",
    title: "年金事務所を探す",
    description: "相談や提出に行く年金事務所と、当日の準備を確認します。",
    href: "/dougu/madoguchi",
  },
  {
    number: "05",
    title: "申立書をつくる",
    description: "発病から現在までを期間に分けて、申立書の下書きをつくります。",
    href: "/dougu/moushitatesho",
  },
] as const;

export default function DouguPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "トップ", path: "/" },
    { name: "自分の場合を確かめる", path: "/dougu" },
  ]);

  return (
    <div className="platform dougu-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <header className="dougu-hero">
        <div className="p-container dougu-width">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { label: "自分の場合を確かめる" }]} currentPath="/dougu" jsonLd={false} />
          <p className="dougu-kicker">申請の準備を、ひとつずつ</p>
          <h1>自分の場合を、確かめる</h1>
          <p className="p-hero-copy">
            「自分の場合はどうなるのか」に、公開されている基準と数字で答える5つの機能です。
            どれも、国や日本年金機構が公表しているものに、あなたの状況を当てはめるだけです。このサイトが判定したり、予測したりはしません。
          </p>
          <PageDate updated={UPDATED} />
        </div>
      </header>

      <section className="dougu-section" aria-labelledby="dougu-list-heading">
        <div className="p-container dougu-width">
          <div className="dougu-section-head">
            <h2 id="dougu-list-heading">どれから使うか</h2>
            <ul className="dougu-guide">
              <li>申請を考え始めたばかりなら → 「私は何級くらい？」「いくらもらえる？」</li>
              <li>申請すると決めたら → 「何をそろえればいい？」「どこに出せばいい？」</li>
              <li>書き始めたら → 「申立書を、自分で書きたい」</li>
            </ul>
          </div>

          <div className="dougu-grid">
            {tools.map((tool) => {
              const candidateHref = "href" in tool ? tool.href : undefined;
              const href = candidateHref && isPublishedInternalPath(candidateHref) ? candidateHref : undefined;
              const content = <>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
              </>;
              return href ? <a className="dougu-card dougu-card-link" href={href} key={tool.number}>{content}</a> : <article className="dougu-card" key={tool.number}>{content}</article>;
            })}
          </div>

          <p className="dougu-note">入力した内容は、この端末の中だけで処理します。サーバーには送りません。</p>
        </div>
      </section>
    </div>
  );
}
