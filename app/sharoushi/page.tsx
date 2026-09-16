import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import Disclose from "@/components/sharoushi/Disclose";
import OfficeCard from "@/components/sharoushi/OfficeCard";
import TrackView from "@/components/sharoushi/TrackView";
import { PREFECTURE_REGIONS } from "@/data/sharoushi/options";
import { prefSlugOf } from "@/data/sharoushi/prefectures";
import { SHOW_LISTINGS } from "@/lib/ads";
import { countByPref, nationwideOffices, OFFICES } from "@/lib/sharoushi";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

/* 「社労士を探す」一覧(docs/claude-code-sharoushi-list-2026-09-16-instructions.md §2-1)。
   文面は指示書のまま。SHOW_LISTINGS が false の間は 404(sitemap にも載せず、どこからもリンクしない)。
   ItemList は入れない(§6)。 */

export const metadata: Metadata = pageMetadata({
  title: "障害年金を扱う社労士を探す",
  description: "都道府県から、障害年金の相談を受けている社会保険労務士事務所を探せます。掲載は事務所の申告にもとづき、順位づけをしません。連絡は事務所へ直接。",
  path: "/sharoushi",
});

const breadcrumb = breadcrumbJsonLd([
  { name: "トップ", path: "/" },
  { name: "社労士を探す", path: "/sharoushi" },
]);

export default function SharoushiListPage() {
  if (!SHOW_LISTINGS) notFound();
  const counts = countByPref();
  const nationwide = nationwideOffices();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <TrackView pref="all" />
      <Breadcrumb current="社労士を探す" showColumns={false} />

      <h1>障害年金を扱う社労士を探す</h1>
      <p className="sr-lead">都道府県から、障害年金の相談を受けている社会保険労務士事務所を探せます。掲載は事務所の申告にもとづき、一覧は更新日の新しい順です。</p>

      <Disclose items={[
        "掲載内容は各事務所の申告です。当サイトは特定の事務所を推薦・選定しません。",
        "当サイトは相談者と事務所の仲介・斡旋をしません。連絡は事務所へ直接お願いします。",
        <>掲載の条件は「<Link href="/ads">広告掲載について</Link>」をご覧ください。</>,
      ]} />

      <div className="sr-decide">
        <span>依頼するか迷っている段階なら、先に:</span>
        <Link href="/erabu/jibun-ka-irai">自分で申請するか、依頼するか</Link> ／{" "}
        <Link href="/erabu/hiyou-souba">かかるお金</Link> ／{" "}
        <Link href="/erabu/erabikata">社労士の選び方</Link>
      </div>

      {OFFICES.length === 0 && (
        <p className="sr-empty">掲載事務所は、順次追加しています。いまは掲載がありません。相談先を探す前に、<Link href="/erabu/jibun-ka-irai">自分で申請するか、依頼するか</Link>をご覧ください。</p>
      )}

      <h2>都道府県から探す</h2>
      <div className="sr-regions">
        {PREFECTURE_REGIONS.map((r) => (
          <section className="sr-region" key={r.region}>
            <h3>{r.region}</h3>
            <div className="sr-prefs">
              {r.prefectures.map((name) => {
                const slug = prefSlugOf(name);
                const n = counts[slug] ?? 0;
                return (
                  <Link key={slug} href={`/sharoushi/${slug}`} className={n === 0 ? "sr-zero" : undefined}>
                    {name}<span className="sr-n">{n}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {nationwide.length > 0 && (
        <>
          <h2 id="nationwide">全国(オンライン・郵送)に対応する事務所</h2>
          <p className="sr-lead">来所せずに相談できる事務所です。お住まいの都道府県の一覧にも同じ事務所が出ます。</p>
          {nationwide.map((o) => <OfficeCard key={o.id} office={o} />)}
        </>
      )}

      <h2>相談の前に</h2>
      <p>事務所へ連絡する前に、<Link href="/dougu/shorui">相談の持ち物</Link>と<Link href="/erabu/hiyou-souba">契約前に確認する3点</Link>(着手金の有無・成功報酬の計算方法・不支給のときの費用)を見ておくと、初回の相談が短く済みます。</p>

      <p className="small-note">掲載を希望する社労士事務所の方は「<Link href="/ads/sharoushi">社労士事務所の掲載のご案内</Link>」へ。</p>
    </>
  );
}
