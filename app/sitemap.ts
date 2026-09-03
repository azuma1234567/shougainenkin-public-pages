import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { COLUMNS_BY_DATE } from "@/lib/columns";
import { PUBLISHED_CONTENT_HUBS } from "@/lib/hubs";
import { GOKAI } from "@/data/gokai";

// /tokushoho は、有料掲載を受け付けるまで未確定の項目が残るため noindex にしている。
// sitemap にも入れない(app/tokushoho/page.tsx の DRAFT を false にするとき、ここへ足す)。
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
    "/dougu",
    "/dougu/mitate",
    "/dougu/kingaku",
    "/dougu/shorui",
    "/dougu/madoguchi",
    "/dougu/moushitatesho",
  ].map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
  }));

  const columnPages: MetadataRoute.Sitemap = COLUMNS_BY_DATE.map((column) => ({
    url: `${SITE_URL}/columns/${column.slug}`,
    lastModified: new Date(column.dateModified),
  }));

  const gokaiPages: MetadataRoute.Sitemap = GOKAI.map((card) => ({
    url: `${SITE_URL}/gokai/${card.slug}`,
  }));

  const existing = new Set(staticPages.map((item) => item.url));
  const hubPages: MetadataRoute.Sitemap = PUBLISHED_CONTENT_HUBS
    .filter((hub) => !existing.has(`${SITE_URL}${hub.path}`))
    .map((hub) => ({ url: `${SITE_URL}${hub.path}` }));
  return [...staticPages, ...hubPages, ...gokaiPages, ...columnPages];
}
