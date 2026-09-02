import { GOKAI, type GokaiCard } from "@/data/gokai";
import { isPublishedInternalPath } from "@/lib/published-links";

export { isPublishedInternalPath };

// ハブページの「よくある誤解」欄に出す枚数。これを超える分は /gokai で見てもらう。
export const HUB_GOKAI_LIMIT = 3;

export function gokaiCardsForHub(hubPath: string): GokaiCard[] {
  return GOKAI.filter((card) => card.hubs.includes(hubPath));
}

export function gokaiCardBySlug(slug: string): GokaiCard | null {
  return GOKAI.find((card) => card.slug === slug) ?? null;
}

// 一覧・OGPで使う「誤解の一文」。原稿では鉤括弧つきで書かれている。
export function gokaiPlainMisconception(card: GokaiCard): string {
  return card.misconception.replace(/^「|」$/g, "");
}
