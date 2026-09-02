import { HUB_BY_PATH } from "@/lib/hubs";

// 本文から張る内部リンクのうち、公開済みのページへのものだけを通す。
// 未公開のハブ(/erabu/hiyou-souba など)へのリンクは、公開されるまで出さない。
const ALWAYS_PUBLISHED_PREFIXES = ["/columns/", "/yougo/", "/gokai/"];

export function isPublishedInternalPath(href: string): boolean {
  if (ALWAYS_PUBLISHED_PREFIXES.some((prefix) => href.startsWith(prefix))) return true;
  if (href === "/jitsurei") return true;
  return HUB_BY_PATH.get(href)?.published === true;
}
