import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import Disclose from "@/components/sharoushi/Disclose";
import OfficeFilter from "@/components/sharoushi/OfficeFilter";
import TrackView from "@/components/sharoushi/TrackView";
import { PREFECTURES_47, prefectureBySlug } from "@/data/sharoushi/prefectures";
import { SHOW_LISTINGS } from "@/lib/ads";
import { officesForPref } from "@/lib/sharoushi";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

/* 都道府県の一覧(docs/claude-code-sharoushi-list-2026-09-16-instructions.md §2-2)。
   出す条件は §1(所在地・対応地域・全国対応)。0件の都道府県は noindex, follow(§6)。 */

type Params = { pref: string };

export function generateStaticParams(): Params[] {
  return SHOW_LISTINGS ? PREFECTURES_47.map((p) => ({ pref: p.pref })) : [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { pref } = await params;
  const p = prefectureBySlug(pref);
  if (!SHOW_LISTINGS || !p) return {};
  const empty = officesForPref(p.pref).length === 0;
  return {
    ...pageMetadata({
      title: `${p.prefName}の障害年金を扱う社労士`,
      description: `${p.prefName}に事務所がある、または対応地域にしている社会保険労務士事務所の一覧。全国オンライン対応の事務所も含みます。更新日の新しい順。`,
      path: `/sharoushi/${p.pref}`,
    }),
    ...(empty ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function PrefPage({ params }: { params: Promise<Params> }) {
  const { pref } = await params;
  const p = prefectureBySlug(pref);
  if (!SHOW_LISTINGS || !p) notFound();
  const offices = officesForPref(p.pref);
  const breadcrumb = breadcrumbJsonLd([
    { name: "トップ", path: "/" },
    { name: "社労士を探す", path: "/sharoushi" },
    { name: p.prefName, path: `/sharoushi/${p.pref}` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <TrackView pref={p.pref} />
      <Breadcrumb current={p.prefName} parents={[{ name: "社労士を探す", path: "/sharoushi" }]} showColumns={false} />

      <h1>{p.prefName}の障害年金を扱う社労士</h1>
      <p className="sr-lead">{p.prefName}に事務所がある、または{p.prefName}を対応地域にしている事務所です。全国(オンライン・郵送)対応の事務所も含みます。</p>

      <Disclose items={[
        "掲載内容は各事務所の申告です。当サイトは特定の事務所を推薦・選定しません。",
        "連絡は事務所へ直接お願いします。当サイトは仲介・斡旋をしません。",
      ]} />

      <OfficeFilter offices={offices} pref={p.pref} prefName={p.prefName} />

      <h2>{p.prefName}の年金事務所</h2>
      <p>請求書の提出先は住所地の管轄の年金事務所です。市区町村名から引けます。→ <Link href="/dougu/madoguchi">年金事務所を探す</Link></p>

      <p className="small-note">{p.prefName}で掲載を希望する社労士事務所の方は「<Link href="/ads/sharoushi">社労士事務所の掲載のご案内</Link>」へ。</p>
    </>
  );
}
