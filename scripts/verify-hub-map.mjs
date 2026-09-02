import { existsSync } from "node:fs";
import { COLUMN_HUB_ASSIGNMENTS, HUBS, PUBLISHED_CONTENT_HUBS } from "../lib/hubs.ts";

const origin = process.argv[2] ?? "http://localhost:3000";
const assignedSlugs = Object.keys(COLUMN_HUB_ASSIGNMENTS).sort();
const articleSlugs = assignedSlugs;
const missingPages = articleSlugs.filter((slug) => !existsSync(`app/columns/${slug}/page.tsx`));
const published = HUBS.filter((hub) => hub.published);
const reachable = new Set(published.flatMap((hub) => hub.relatedSlugs));
const isolated = articleSlugs.filter((slug) => !reachable.has(slug));

const expectedCounts = new Map(Object.entries({
  "/nayami/shoshinbi-karute": 7, "/nayami/shindansho-komatta": 8, "/nayami/fushikyu": 4,
  "/nayami/koushin": 4, "/nayami/shikyuu-teishi": 2, "/nayami/sokyuu": 3,
  "/joukyou/hatarakinagara": 3, "/joukyou/hatachi-mae": 2, "/joukyou/hitorigurashi": 2,
  "/joukyou/shoubyou-teatekin-kara": 2, "/byoki/utsu-soukyoku": 7, "/byoki/tekiou-fuan": 3,
  "/byoki/hattatsu": 2, "/okane/ikura": 6, "/erabu/jibun-ka-irai": 3,
}));
const countMismatches = [...expectedCounts].flatMap(([path, expected]) => {
  const actual = HUBS.find((hub) => hub.path === path)?.relatedSlugs.length ?? -1;
  return actual === expected ? [] : [{ path, expected, actual }];
});

const starPaths = PUBLISHED_CONTENT_HUBS.map((hub) => hub.path);
const routeResults = await Promise.all(starPaths.map(async (path) => ({ path, status: (await fetch(`${origin}${path}`)).status })));
const routeFailures = routeResults.filter((item) => item.status !== 200);

const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
const sitemapPaths = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((match) => match[1] || "/");
const pages = [...new Set([...sitemapPaths, ...starPaths])];
const hrefs = [];
const pageFailures = [];
for (const path of pages) {
  const response = await fetch(`${origin}${path}`);
  if (response.status !== 200) pageFailures.push({ path, status: response.status });
  const html = await response.text();
  const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? html)
    .replace(/<nav[^>]*class="(?:breadcrumb|p-breadcrumb)"[\s\S]*?<\/nav>/g, "");
  for (const match of main.matchAll(/href="([^"#]+(?:#[^"]*)?)"/g)) {
    const href = match[1];
    if (href.startsWith("/") && !href.startsWith("//")) hrefs.push({ from: path, href });
  }
}
const normalizedTargets = [...new Set(hrefs.map(({ href }) => href.split("#")[0].split("?")[0] || "/"))];
const broken = [];
for (const path of normalizedTargets) {
  const status = (await fetch(`${origin}${path}`)).status;
  if (status >= 400) broken.push({ path, status });
}
const reservedPaths = new Set(HUBS.filter((hub) => !hub.published).map((hub) => hub.path));
const reservedLinks = hrefs.filter(({ href }) => reservedPaths.has(href.split("#")[0].split("?")[0]));
const incoming = new Map();
for (const { from, href } of hrefs) {
  const path = href.split("#")[0].split("?")[0];
  if (path.startsWith("/_next/") || path === "/icon.png") continue;
  const sources = incoming.get(path) ?? new Set();
  sources.add(from);
  incoming.set(path, sources);
}
const overFifty = [...incoming].map(([path, sources]) => [path, sources.size]).filter(([, count]) => count > 50).sort((a, b) => b[1] - a[1]);

const result = {
  articles: articleSlugs.length, assignments: assignedSlugs.length, missingPages, isolated,
  publishedHubRoutes: starPaths.length, routeFailures, countMismatches,
  checkedPages: pages.length, pageFailures, checkedInternalTargets: normalizedTargets.length, broken,
  reservedLinks: reservedLinks.length, overFifty,
};
console.log(JSON.stringify(result, null, 2));
if (missingPages.length || isolated.length || routeFailures.length || countMismatches.length || pageFailures.length || broken.length || reservedLinks.length || overFifty.length) process.exitCode = 1;
