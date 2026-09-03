import type { Metadata } from "next";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import { JibunCards } from "@/components/platform/JibunCard";
import { PRIVACY_LINE } from "@/data/dougu";
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

          <JibunCards />

          <p className="dougu-note">{PRIVACY_LINE}</p>
        </div>
      </section>
    </div>
  );
}
