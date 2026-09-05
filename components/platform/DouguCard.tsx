/* 道具カード。置き場所は data/dougu.ts の PLACEMENTS にまとめている。
   未公開の道具(lib/published-links.ts)は何も描画しない。 */
import Link from "next/link";
import { placementCard, visiblePlacements, type Placement } from "@/data/dougu";

type Variant = "column" | "hub" | "grid" | "chip";

/* 1枚。variant で見た目を変える。
   column は既存記事で動いている .mt-column-card のまま(見た目を変えない)。 */
export function DouguCard({ placement, variant = "column", className = "" }: { placement: Placement; variant?: Variant; className?: string }) {
  const c = placementCard(placement);
  if (variant === "chip") {
    /* ステップの footer の先頭に置く小さな道具リンク。文言は data/dougu.ts のまま。 */
    return <Link className={`dougu-chip ${className}`.trim()} href={c.href}>{c.cta}</Link>;
  }
  if (variant === "grid") {
    return (
      <Link className={`dougu-band-card ${className}`.trim()} href={c.href}>
        <b>{c.title}</b>
        <span>{c.blurb}</span>
      </Link>
    );
  }
  return (
    <aside className={`${variant === "hub" ? "mt-column-card dougu-hub-card" : "mt-column-card"} ${className}`.trim()}>
      <strong>{c.title}</strong>
      <p>{c.blurb}</p>
      <Link href={c.href}>{c.cta}</Link>
    </aside>
  );
}

/* 置き場所の一覧をまとめて出す。position で本文の前後を出し分ける。 */
export function DouguCards({ placements, position, variant = "column", className = "" }: {
  placements: Placement[] | undefined;
  position?: "before" | "after";
  variant?: Variant;
  className?: string;
}) {
  const list = visiblePlacements(placements).filter((p) => !position || placementCard(p).position === position);
  if (list.length === 0) return null;
  return <>{list.map((p) => <DouguCard key={`${placementCard(p).id}-${placementCard(p).href}`} placement={p} variant={variant} className={className} />)}</>;
}
