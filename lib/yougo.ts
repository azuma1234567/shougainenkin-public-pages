import { HUB_BY_PATH } from "@/lib/hubs";

const ALWAYS_PUBLISHED_PREFIXES = ["/columns/", "/yougo/"];

export function isPublishedRelatedPath(href: string): boolean {
  if (ALWAYS_PUBLISHED_PREFIXES.some((prefix) => href.startsWith(prefix))) return true;
  if (href === "/jitsurei") return true;
  return HUB_BY_PATH.get(href)?.published === true;
}

const KANA_GROUPS = ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ"] as const;
export const YOUGO_KANA_GROUPS = KANA_GROUPS;

const missingYomi: Record<string, string> = {
  "tenpu-dekinai-moushitatesho": "じゅしんじょうきょうとうしょうめいしょがてんぷできないもうしたてしょ",
};

export function searchableYomi(slug: string, yomi: string): string {
  return yomi || missingYomi[slug] || "";
}

export function kanaGroup(slug: string, yomi: string): (typeof KANA_GROUPS)[number] {
  const first = searchableYomi(slug, yomi).charAt(0);
  if (/^[あいうえお]$/.test(first)) return "あ";
  if (/^[かきくけこがぎぐげご]$/.test(first)) return "か";
  if (/^[さしすせそざじずぜぞ]$/.test(first)) return "さ";
  if (/^[たちつてとだぢづでど]$/.test(first)) return "た";
  if (/^[なにぬねの]$/.test(first)) return "な";
  if (/^[はひふへほばびぶべぼぱぴぷぺぽ]$/.test(first)) return "は";
  if (/^[まみむめも]$/.test(first)) return "ま";
  if (/^[やゆよ]$/.test(first)) return "や";
  if (/^[らりるれろ]$/.test(first)) return "ら";
  return "わ";
}
