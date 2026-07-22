import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { COLUMNS_BY_DATE } from "@/lib/columns";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    "/",
    "/app",
    "/columns",
    "/about",
    "/support",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
  }));

  const columnPages: MetadataRoute.Sitemap = COLUMNS_BY_DATE.map((column) => ({
    url: `${SITE_URL}/columns/${column.slug}`,
    lastModified: new Date(column.dateModified),
  }));

  return [...staticPages, ...columnPages];
}
