/* 記事の末尾に置く「次にすること」。
   docs/columns-parts-2026-09-05-instructions.md §2-5。
   道具を1つ、次に読む記事を3本、そして「今日はここまでで大丈夫です。」で終える。
   新しい説明文は書かない(道具の文言は data/dougu.ts、記事名は lib/columns.ts のもの)。 */
import Link from "next/link";
import { DouguCard } from "@/components/platform/DouguCard";
import { PLACEMENTS, TOOLS, placementCard, visiblePlacements, type Placement, type ToolId } from "@/data/dougu";
import { isPublishedInternalPath } from "@/lib/published-links";
import { relatedColumns } from "@/lib/columns";

/* 「今日はここまでで大丈夫です。」の後ろに、次の道具や外部リンクを置かない。 */
export const CLOSING_LINE = "今日はここまでで大丈夫です。";

export default function ColumnNext({ slug, relatedSlugs, tool }: {
  slug: string;
  relatedSlugs: string[];
  /* 記事に置き場所の指定が無いときに使う道具(data/columns/checkpoints.json)。 */
  tool?: string;
}) {
  /* 本文の後ろに出す道具。指定があればその文言のまま、無ければ checkpoints.json の道具を1つ。
     本文の前に同じ道具のカードが出ている記事では、二重に出さない(§2-5)。 */
  const placements = visiblePlacements(PLACEMENTS.columns[slug]);
  const after = placements.filter((p) => placementCard(p).position === "after");
  const shownBefore = new Set(placements.filter((p) => placementCard(p).position === "before").map((p) => placementCard(p).id));
  const canFallback = Boolean(tool)
    && after.length === 0
    && TOOLS[tool as ToolId] !== undefined
    && isPublishedInternalPath(TOOLS[tool as ToolId].path)
    && !shownBefore.has(tool as ToolId);
  const placement: Placement | null = after[0] ?? (canFallback ? (tool as ToolId) : null);

  const reads = relatedColumns(slug, relatedSlugs, 3);

  return (
    <section className="col-next" aria-labelledby="col-next-title">
      <h2 id="col-next-title">次にすること</h2>
      {placement ? <div className="col-next-tool"><DouguCard placement={placement} /></div> : null}
      {reads.length > 0 ? (
        <>
          <p className="col-next-read-title">次に読む</p>
          <ol className="col-next-read">
            {reads.map((column) => (
              <li key={column.slug}><Link href={`/columns/${column.slug}`}>{column.title}</Link></li>
            ))}
          </ol>
        </>
      ) : null}
      <p className="col-next-close">{CLOSING_LINE}</p>
    </section>
  );
}
