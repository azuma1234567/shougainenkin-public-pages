/* 事務所カード(一覧・都道府県で共通。docs/claude-code-sharoushi-list-2026-09-16-instructions.md §2-4)。
   電話番号はカードに出さない(電話は事務所ページから。タップ計測を1か所にするため)。
   client の絞り込みからも使うので、サーバー専用の import を持たない。 */
import Link from "next/link";
import { isNationwide, prefNameOf, shortNote, type Office } from "@/lib/sharoushi";

/* headingLevel: 都道府県ページは h1 の直下に並ぶので 2、一覧は h2「全国(オンライン・郵送)…」の下なので 3(見出しの階層を飛ばさない)。 */
export default function OfficeCard({ office, headingLevel = 3 }: { office: Office; headingLevel?: 2 | 3 }) {
  const o = office;
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="sr-office">
      <H className="sr-office-title"><Link href={`/sharoushi/${o.pref}/${o.id}`}>{o.name}</Link></H>
      <p className="sr-sub">{o.person} ／ {prefNameOf(o)}{o.city}{isNationwide(o) ? " ／ 全国オンライン対応" : ""}</p>
      <div className="sr-tags">
        {o.flags.map((f) => <span key={f} className="sr-tag sr-tag-f">{f}</span>)}
        {o.ways.map((w) => <span key={w} className="sr-tag">{w}</span>)}
      </div>
      <div className="sr-tags">
        {o.topics.map((t) => <span key={t} className="sr-tag">{t}</span>)}
      </div>
      {o.note ? <p className="sr-word">{shortNote(o.note)}</p> : null}
      <p className="sr-upd">更新日 {o.updatedAt} ／ 得意: {o.kinds.join("・")}</p>
    </article>
  );
}
