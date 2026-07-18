import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { COLUMNS } from "@/lib/columns";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    "/",
    "/columns",
    "/about",
    "/support",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
  }));

  const columnPages: MetadataRoute.Sitemap = COLUMNS.map((column) => ({
    url: `${SITE_URL}/columns/${column.slug}`,
    lastModified: new Date(column.dateModified),
  }));

  return [...staticPages, ...columnPages];
}
