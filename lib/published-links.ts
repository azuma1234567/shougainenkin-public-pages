import { HUB_BY_PATH } from "@/lib/hubs";

// 本文から張る内部リンクのうち、公開済みのページへのものだけを通す。
// 未公開のハブ(/erabu/hiyou-souba など)へのリンクは、公開されるまで出さない。
const ALWAYS_PUBLISHED_PREFIXES = ["/columns/", "/yougo#", "/gokai/"];
const ALWAYS_PUBLISHED_PATHS = ["/jitsurei", "/dougu", "/dougu/moushitatesho", "/dougu/kingaku", "/dougu/mitate", "/dougu/shorui"];
// 実装が入るまで非公開にしているページ。ここにある間は本文からリンクしない。
const UNPUBLISHED_PATHS = ["/dougu/madoguchi"];

export function isPublishedInternalPath(href: string): boolean {
  if (UNPUBLISHED_PATHS.some((p) => href === p || href.startsWith(`${p}/`))) return false;
  if (ALWAYS_PUBLISHED_PATHS.includes(href)) return true;
  if (ALWAYS_PUBLISHED_PREFIXES.some((prefix) => href.startsWith(prefix))) return true;
  return HUB_BY_PATH.get(href)?.published === true;
}
