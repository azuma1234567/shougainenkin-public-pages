import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { COLUMNS_BY_DATE } from "@/lib/columns";
import { PUBLISHED_CONTENT_HUBS } from "@/lib/hubs";
import { GOKAI } from "@/data/gokai";
import { GOKAI_BODIES_UPDATED } from "@/data/gokai-bodies";
import { HUB_CONTENT } from "@/lib/hub-content";
import { SITEMAP_STATIC_DATES } from "@/lib/sitemap-static-dates";

// 全エントリに lastModified を付ける(監査 §4-1)。changeFrequency と priority は付けない
// (Google は見ていない。付けるとノイズになる)。
// sitemap に意図的に入れないページは lib/sitemap-excluded.ts に理由つきで並べている。
// (理由をここに二重に書かない。公開前チェック C-1 はそのリストを見て、入れ忘れと区別する。)
/* 日付の出どころが無いまま new Date(undefined) にすると Invalid Date になり、
   ビルドが「/sitemap.xml の prerender に失敗」とだけ言って理由が分からない。ここで落とす。 */
function dateFor(path: string): string {
  const date = HUB_CONTENT[path]?.dateModified ?? SITEMAP_STATIC_DATES[path];
  if (!date) throw new Error(`sitemap: ${path} の lastModified が無い。lib/sitemap-static-dates.ts に足すこと`);
  return date;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    "/",
    "/hajimete",
    "/shinsei",
    "/byoki/utsu-soukyoku",
    "/jitsurei",
    "/nayami/fushikyu",
    "/columns",
    "/about",
    "/support",
    "/privacy",
    "/terms",
    "/ads",
    "/app",
    // アプリ向けの法務ページ。サイト向けの /privacy /terms とは別文書。
    "/app/privacy",
    "/app/terms",
    "/quality",
    "/yougo",
    "/gokai",
    "/suuji",
    "/byoki",
    "/nayami",
    "/joukyou",
    "/okane",
    "/erabu",
    "/jukyuugo",
    "/dougu/mitate",
    "/dougu/kingaku",
    "/dougu/shorui",
    "/dougu/madoguchi",
    "/dougu/moushitatesho",
  ].map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    /* 一覧に入れているがハブが中身を持つページ(/byoki/utsu-soukyoku など)は、ハブの日付を使う */
    lastModified: new Date(dateFor(path)),
  }));

  const columnPages: MetadataRoute.Sitemap = COLUMNS_BY_DATE.map((column) => ({
    url: `${SITE_URL}/columns/${column.slug}`,
    lastModified: new Date(column.dateModified),
  }));

  const gokaiPages: MetadataRoute.Sitemap = GOKAI.map((card) => ({
    url: `${SITE_URL}/gokai/${card.slug}`,
    lastModified: new Date(GOKAI_BODIES_UPDATED),
  }));

  const existing = new Set(staticPages.map((item) => item.url));
  const hubPages: MetadataRoute.Sitemap = PUBLISHED_CONTENT_HUBS
    .filter((hub) => !existing.has(`${SITE_URL}${hub.path}`))
    .map((hub) => ({ url: `${SITE_URL}${hub.path}`, lastModified: new Date(HUB_CONTENT[hub.path].dateModified) }));
  return [...staticPages, ...hubPages, ...gokaiPages, ...columnPages];
}
