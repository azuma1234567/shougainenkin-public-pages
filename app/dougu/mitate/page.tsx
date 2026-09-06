import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import MitateTool from "@/components/tools/MitateTool";
import { MITATE_ABILITY_CHOICES, MITATE_ABILITY_ITEMS, MITATE_AVERAGE_BANDS, MITATE_DEGREE_CHOICES, MITATE_GRADE_TABLE, MITATE_SOURCE } from "@/data/mitate";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";

const UPDATED = "2026-09-06";

const DESCRIPTION =
  "精神の障害年金の審査で使われる、国の「等級判定ガイドライン」の目安表。日常生活の7項目と全体の程度を選ぶと、表のどこに当たるかが分かります。判定ではありません。入力は送信しません。";

const isPublished = isPublishedInternalPath("/dougu/mitate");

export const metadata: Metadata = {
  ...pageMetadata({ title: "等級の目安をしらべる｜国の目安表に、毎日の生活を当てはめる", description: DESCRIPTION, path: "/dougu/mitate", showAppBanner: true, appBannerArgument: "https://shougainenkin-note.net/dougu/mitate" }),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};

/* よくある質問。本文と FAQPage の構造化データで同じ文字列を使う(JSON-LD には文字だけ。リンクは本文側だけ)。 */
const FAQ = [
  { q: "ここで出た結果は、等級の判定ですか", a: "いいえ。国が公表している表に、本人の答えを当てはめた位置です。判定するのは国で、材料は医師の診断書です。" },
  { q: "診断書がなくても使えますか", a: "使えます。診断書がある場合は、裏面の欄をそのまま写す入口があります。" },
  { q: "入力した内容はどこに送られますか", a: "どこにも送られません。この端末のブラウザの中だけで計算します。「この端末に残す」を押したときだけ、この端末に保存します。" },
  { q: "「目安が定められていません」と出ました", a: "表の空欄は、対象外という意味ではなく、7項目の答えと全体の程度の組み合わせが珍しいという意味です。ガイドラインは、この場合に診断書の内容確認などを求めています。" },
  { q: "精神の障害以外でも使えますか", a: "この表は精神の障害(知的障害・発達障害を含む)の目安です。身体の障害や内部疾患は別の認定基準で決まります。" },
] as const;

const faqLd = faqJsonLd(FAQ.map((f) => ({ question: f.q, answer: f.a })));

/* 静的な本文(検索エンジンと AI に読める分。入口のときだけ画面に出す)。
   目安表は道具の結果と同じ data/mitate.ts から描く(強調なし)。 */
function StaticBody() {
  return (
    <div className="mi-static">
      <section aria-labelledby="mi-static-table">
        <h2 id="mi-static-table">国の目安表とは</h2>
        <p>精神の障害の等級は、診断書の「日常生活能力の判定」7項目の平均と、「日常生活能力の程度」の組み合わせを、国のガイドラインの表に当てはめて目安を出し、そのうえで就労状況や療養状況などを総合して決まります。表は目安で、判定ではありません。空欄は「その組み合わせに目安が無い」という意味です。</p>
        <div className="mi-tbl-scroll"><table className="mi-gt"><caption>表1「障害等級の目安」(行が7項目の平均、列が全体の程度)</caption><thead><tr><th>判定平均</th>{[1,2,3,4,5].map((degree) => <th key={degree}>程度({degree})</th>)}</tr></thead><tbody>{MITATE_AVERAGE_BANDS.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{[1,2,3,4,5].map((degree) => { const value = MITATE_GRADE_TABLE[row.label][degree - 1]; return <td key={degree} className={value === null ? "mi-na" : ""}>{value === null ? "—" : value}</td>; })}</tr>)}</tbody></table></div>
        <p className="mi-src">{MITATE_SOURCE.name} 表1「障害等級の目安」 <a href={MITATE_SOURCE.url}>{MITATE_SOURCE.url}</a></p>
      </section>
      <section aria-labelledby="mi-static-items">
        <h2 id="mi-static-items">7項目と4段階</h2>
        <p>診断書の「日常生活能力の判定」は、次の7項目です。</p>
        <ol>{MITATE_ABILITY_ITEMS.map((item) => <li key={item.id}>{item.label}</li>)}</ol>
        <p>それぞれを、次の4段階で判断します(軽いほうから1〜4の数値に置き換えます)。</p>
        <ol>{MITATE_ABILITY_CHOICES.map((c) => <li key={c.value}>{c.label}</li>)}</ol>
        <p>判断の前提は、単身で生活するとしたら可能かどうかです(日本年金機構 診断書(精神の障害用)様式第120号の4 記載要領)。</p>
      </section>
      <section aria-labelledby="mi-static-degree">
        <h2 id="mi-static-degree">全体の程度(5段階)</h2>
        <p>「日常生活能力の程度」は、次の5つから1つを選びます。</p>
        <ol>{MITATE_DEGREE_CHOICES.map((c) => <li key={c.value}>{c.label}</li>)}</ol>
      </section>
      <section aria-labelledby="mi-static-faq">
        <h2 id="mi-static-faq">よくある質問</h2>
        <dl>{FAQ.map((f) => <div key={f.q}><dt>{f.q}</dt><dd>{f.a}{f.q === "精神の障害以外でも使えますか" && <> <Link href="/byoki">→ 病気別</Link></>}</dd></div>)}</dl>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <div className="platform mi-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <header className="no-print">
        <div className="p-container mi-width mi-breadcrumb-wrap">
          <Breadcrumb
            items={[{ href: "/", label: "トップ" }, { href: "/shinsei", label: "申請の流れ" }, { label: "等級の目安をしらべる" }]}
            currentPath="/dougu/mitate"
          />
        </div>
      </header>

      <div className="p-container mi-width mi-main">
        <p className="mi-printhead">
          国が公表している目安に当てはめた結果です（障害年金申請サポート / 精神の障害に係る等級判定ガイドライン 平成28年9月）。このサイトが判定したものではありません。
        </p>
        <MitateTool><StaticBody /></MitateTool>
        <div className="no-print"><p><Link href="/shinsei">申請の流れへ戻る</Link></p><p className="dougu-app-link"><Link href="/app">同じ機能をアプリで続ける →</Link></p><PageDate updated={UPDATED} /></div>
      </div>
    </div>
  );
}
