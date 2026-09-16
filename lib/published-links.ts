import { SHOW_LISTINGS } from "@/lib/ads";
import { HUB_BY_PATH } from "@/lib/hubs";

// 本文から張る内部リンクのうち、公開済みのページへのものだけを通す。
// 未公開のハブ(/erabu/hiyou-souba など)へのリンクは、公開されるまで出さない。
/* /jitsurei?case=<裁決id> は実例集の該当事案のページを開く(記事の本文から張る)。
   /jitsurei?争点=<争点> は実例集を争点で絞り込む(4dd8fc6。値は lib/jitsurei-filters.ts) */
const ALWAYS_PUBLISHED_PREFIXES = ["/columns/", "/yougo#", "/gokai/", "/jitsurei?case=", "/jitsurei?争点="];
/* 病気別・状況別・困りごと別・お金・自分でやるか頼むか の入口ページ(app/<section>/page.tsx)。
   ハブではないので HUB_BY_PATH に無い。事務所ページの対応表(data/sharoushi/topic-links.ts)が /byoki を指す。 */
const SECTION_INDEX_PATHS = ["/byoki", "/joukyou", "/nayami", "/okane", "/erabu"];
const ALWAYS_PUBLISHED_PATHS = [...SECTION_INDEX_PATHS, "/jitsurei", "/dougu/moushitatesho", "/dougu/kingaku", "/dougu/mitate", "/dougu/shorui", "/dougu/madoguchi", "/dougu/kougin", "/dougu/koushin"];
// 実装が入るまで非公開にしているページ。ここにある間は本文からリンクしない。
const UNPUBLISHED_PATHS: string[] = [];

export function isPublishedInternalPath(href: string): boolean {
  /* /sharoushi(社労士を探す)配下は SHOW_LISTINGS が true のときだけ公開扱い
     (docs/claude-code-sharoushi-list-2026-09-16-instructions.md §4-2)。 */
  if (href === "/sharoushi" || href.startsWith("/sharoushi/") || href.startsWith("/sharoushi#")) return SHOW_LISTINGS;
  if (UNPUBLISHED_PATHS.some((p) => href === p || href.startsWith(`${p}/`))) return false;
  if (ALWAYS_PUBLISHED_PATHS.includes(href)) return true;
  if (ALWAYS_PUBLISHED_PREFIXES.some((prefix) => href.startsWith(prefix))) return true;
  return HUB_BY_PATH.get(href)?.published === true;
}
