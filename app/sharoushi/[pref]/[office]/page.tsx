import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdLabel from "@/components/AdLabel";
import Breadcrumb from "@/components/Breadcrumb";
import Disclose from "@/components/sharoushi/Disclose";
import ProfileButtons from "@/components/sharoushi/ProfileButtons";
import TrackView from "@/components/sharoushi/TrackView";
import { SHAROUSHI_NATIONWIDE } from "@/data/sharoushi/options";
import { prefectureBySlug } from "@/data/sharoushi/prefectures";
import { TOPIC_LINKS } from "@/data/sharoushi/topic-links";
import { SHOW_LISTINGS } from "@/lib/ads";
import { SITE_URL } from "@/lib/constants";
import { jurisdictionOf, municipalitiesOf } from "@/lib/madoguchi";
import { isPublishedInternalPath } from "@/lib/published-links";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { OFFICES, officeBySlug } from "@/lib/sharoushi";

/* 事務所ページ(docs/claude-code-sharoushi-list-2026-09-16-instructions.md §2-3)。
   「掲載(広告)」ラベルと免責は電話ボタンより上(景表法の位置の要件)。
   JSON-LD は ProfessionalService ＋ BreadcrumbList。aggregateRating・review は入れない(§6)。 */

type Params = { pref: string; office: string };

export function generateStaticParams(): Params[] {
  return SHOW_LISTINGS ? OFFICES.map((o) => ({ pref: o.pref, office: o.id })) : [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { pref, office } = await params;
  const p = prefectureBySlug(pref);
  const o = officeBySlug(pref, office);
  if (!SHOW_LISTINGS || !p || !o) return {};
  return pageMetadata({
    title: `${o.name}(障害年金・${p.prefName})`,
    description: `${p.prefName}${o.city}の社会保険労務士事務所。対応: ${o.topics.slice(0, 3).join("、")}。${o.firstConsult}。掲載内容は事務所の申告です。`,
    path: `/sharoushi/${o.pref}/${o.id}`,
  });
}

/* 近くの年金事務所(§2-3): 市区町村名が年金事務所データにあれば管轄(厚生年金側)の名前を出す。 */
function nearbyOffice(prefName: string, city: string): string | null {
  const muni = municipalitiesOf(prefName).find((m) => m.name === city);
  if (!muni) return null;
  const jur = jurisdictionOf(muni.code);
  return jur?.kousei[0]?.name ?? null;
}

export default async function OfficePage({ params }: { params: Promise<Params> }) {
  const { pref, office } = await params;
  const p = prefectureBySlug(pref);
  const o = officeBySlug(pref, office);
  if (!SHOW_LISTINGS || !p || !o) notFound();
  const path = `/sharoushi/${o.pref}/${o.id}`;
  const breadcrumb = breadcrumbJsonLd([
    { name: "トップ", path: "/" },
    { name: "社労士を探す", path: "/sharoushi" },
    { name: p.prefName, path: `/sharoushi/${p.pref}` },
    { name: o.name, path },
  ]);
  const areaServed = o.areas.filter((a) => a !== SHAROUSHI_NATIONWIDE);
  const service = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: o.name,
    url: `${SITE_URL}${path}`,
    address: { "@type": "PostalAddress", addressRegion: p.prefName, addressLocality: o.city, addressCountry: "JP" },
    ...(o.tel ? { telephone: o.tel } : {}),
    ...(o.url ? { sameAs: o.url } : {}),
    areaServed: areaServed.map((name) => ({ "@type": "AdministrativeArea", name })),
  };
  const nearby = nearbyOffice(p.prefName, o.city);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service).replace(/</g, "\\u003c") }} />
      <TrackView pref={o.pref} officeId={o.id} />
      <Breadcrumb current={o.name} parents={[{ name: "社労士を探す", path: "/sharoushi" }, { name: p.prefName, path: `/sharoushi/${p.pref}` }]} showColumns={false} />

      <header className="sr-prof-head">
        <p className="sr-prof-meta"><AdLabel kind="掲載(広告)" /><span className="sr-sub">掲載日 {o.registeredAt} ／ 更新日 {o.updatedAt}</span></p>
        {/* 免責は電話ボタンより上(§1・景表法の位置の要件)。文は一覧の開示ブロックと同じ。 */}
        <p className="sr-sub sr-prof-disclaim">掲載内容は各事務所の申告です。当サイトは特定の事務所を推薦・選定しません。</p>
        <h1>{o.name}</h1>
        <p className="sr-sub">社会保険労務士 {o.person} ／ {p.prefName}{o.city}{o.addr ? o.addr : ""} ／ {o.kai}社会保険労務士会</p>
        <div className="sr-tags">
          {o.flags.map((f) => <span key={f} className="sr-tag sr-tag-f">{f}</span>)}
          {o.ways.map((w) => <span key={w} className="sr-tag">{w}</span>)}
        </div>
        <ProfileButtons officeId={o.id} tel={o.tel} mail={o.mail} url={o.url} />
        <p className="sr-sub sr-direct">連絡は事務所へ直接届きます。当サイトは内容を受け取りません。</p>
      </header>

      <div className="sr-decide">
        <span>まだ依頼するか決めていない方へ:</span>
        <Link href="/erabu/jibun-ka-irai">自分で申請するか、依頼するか</Link> ／{" "}
        <Link href="/erabu/hiyou-souba">かかるお金</Link>
      </div>

      <h2>対応地域と相談のしかた</h2>
      <dl className="sr-spec">
        <dt>対応地域</dt><dd>{o.areas.join("、")}</dd>
        <dt>相談のしかた</dt><dd>{o.ways.join("・")}</dd>
        <dt>初回相談</dt><dd>{o.firstConsult}</dd>
        <dt>相談の条件</dt><dd>{o.flags.length ? o.flags.join("・") : "申告なし"}</dd>
      </dl>

      <h2>料金の型</h2>
      <p className="sr-lead">金額は事務所の申告どおりです。契約前に「<Link href="/erabu/hiyou-souba">かかるお金</Link>」の3点を確認してください。</p>
      <dl className="sr-spec">
        <dt>着手金</dt><dd>{o.fee.start}</dd>
        <dt>成功報酬</dt><dd>{o.fee.success}</dd>
        <dt>不支給のとき</dt><dd>{o.fee.fail}</dd>
        <dt>審査請求</dt><dd>{o.fee.appeal}</dd>
      </dl>

      <h2>対応できる相談</h2>
      <div className="sr-topic-links">
        {o.topics.map((t) => {
          const link = TOPIC_LINKS[t];
          return link && isPublishedInternalPath(link.href)
            ? <Link key={t} href={link.href}>{t}<span>{link.hint}</span></Link>
            : <span key={t} className="sr-topic-plain">{t}</span>;
        })}
      </div>
      <p className="sr-lead">得意な障害の種類: {o.kinds.join(" ／ ")}</p>

      {o.note && (
        <>
          <h2>事務所から一言</h2>
          <p>{o.note.split("\n").map((line, i, all) => <span key={i}>{line}{i < all.length - 1 ? <br /> : null}</span>)}</p>
        </>
      )}

      <Disclose items={[
        "このページの内容は事務所の申告にもとづきます。当サイトは内容の正確さを保証せず、特定の事務所を推薦・選定しません。",
        <>受給率・実績件数・口コミは掲載していません(<Link href="/ads/sharoushi#nosenai">掲載の方針</Link>)。</>,
        <>内容の誤りに気づいた方は <Link href="/support">訂正窓口</Link> へ。</>,
      ]} />

      <h2>近くの年金事務所</h2>
      {nearby ? (
        <p>{o.city}の管轄は「{nearby}」です(市区町村から引く → <Link href="/dougu/madoguchi">年金事務所を探す</Link>)。</p>
      ) : (
        <p>請求書の提出先は住所地の管轄の年金事務所です。→ <Link href="/dougu/madoguchi">年金事務所を探す</Link></p>
      )}

      <p className="small-note">{p.prefName}のほかの事務所 → <Link href={`/sharoushi/${p.pref}`}>{p.prefName}の一覧</Link></p>
    </>
  );
}
