import Link from "next/link";
import { HUB_GOKAI_LIMIT, gokaiCardsForHub } from "@/lib/gokai";

// 各ハブの「よくある誤解」欄。紐づくカードを最大3枚出し、
// 4枚以上あるハブは「もっと見る」で /gokai に送る。
export default function HubGokai({ hubPath }: { hubPath: string }) {
  const cards = gokaiCardsForHub(hubPath);
  if (cards.length === 0) return null;
  const shown = cards.slice(0, HUB_GOKAI_LIMIT);
  return (
    <section className="hub-gokai" aria-labelledby="hub-gokai-heading">
      <div className="hub-gokai-head">
        <h2 id="hub-gokai-heading">よくある誤解</h2>
        {cards.length > HUB_GOKAI_LIMIT && <Link className="p-more" href="/gokai">もっと見る →</Link>}
      </div>
      <div className="hub-gokai-list">
        {shown.map((card) => (
          <Link className="hub-gokai-card" href={`/gokai/${card.slug}`} key={card.slug} data-hub-gokai-slug={card.slug}>
            <strong>{card.misconception}</strong>
            <span><b>本当は</b>{card.truth}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
