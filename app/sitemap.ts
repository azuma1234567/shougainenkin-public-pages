import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { COLUMNS_BY_DATE } from "@/lib/columns";
import { PUBLISHED_CONTENT_HUBS } from "@/lib/hubs";
import { YOUGO } from "@/data/yougo";

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
    "/quality",
    "/yougo",
  ].map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
  }));

  const columnPages: MetadataRoute.Sitemap = COLUMNS_BY_DATE.map((column) => ({
    url: `${SITE_URL}/columns/${column.slug}`,
    lastModified: new Date(column.dateModified),
  }));

  const yougoPages: MetadataRoute.Sitemap = YOUGO.map((item) => ({
    url: `${SITE_URL}/yougo/${item.slug}`,
  }));

  const existing = new Set(staticPages.map((item) => item.url));
  const hubPages: MetadataRoute.Sitemap = PUBLISHED_CONTENT_HUBS
    .filter((hub) => !existing.has(`${SITE_URL}${hub.path}`))
    .map((hub) => ({ url: `${SITE_URL}${hub.path}` }));
  return [...staticPages, ...hubPages, ...yougoPages, ...columnPages];
}
