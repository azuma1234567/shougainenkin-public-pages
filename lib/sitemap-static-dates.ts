/* sitemap の lastModified に使う、静的ページの最終更新日(監査 §4-1)。
   初期値は各ページの最終コミット日(`git log -1 --format=%cs -- app/<path>/page.tsx`)。
   **ページの中身を変えたら、この表の日付も同じ PR で更新すること。**
   忘れると公開前チェック C-6 が「表の日付 < page.tsx の最終コミット日」で警告する。

   ハブ(/byoki/utsu-soukyoku など)はここに置かない。data/hubs/*.json の dateModified を使う。 */
export const SITEMAP_STATIC_DATES: Record<string, string> = {
  "/": "2026-09-05",
  "/hajimete": "2026-09-05",
  "/shinsei": "2026-09-01",
  "/jitsurei": "2026-09-05",
  "/columns": "2026-09-02",
  "/about": "2026-09-03",
  "/support": "2026-09-02",
  "/privacy": "2026-09-03",
  "/terms": "2026-09-03",
  "/ads": "2026-09-03",
  "/app": "2026-09-03",
  "/app/privacy": "2026-09-03",
  "/app/terms": "2026-09-03",
  "/quality": "2026-09-03",
  "/yougo": "2026-09-02",
  "/gokai": "2026-09-02",
  "/suuji": "2026-09-02",
  "/byoki": "2026-09-02",
  "/nayami": "2026-09-02",
  "/joukyou": "2026-09-02",
  "/okane": "2026-09-02",
  "/erabu": "2026-09-02",
  "/dougu/mitate": "2026-09-03",
  "/dougu/kingaku": "2026-09-03",
  "/dougu/shorui": "2026-09-03",
  "/dougu/madoguchi": "2026-09-03",
  "/dougu/moushitatesho": "2026-09-04",
};

/* この表が対応する page.tsx の場所。公開前チェックが git の日付と突き合わせるのに使う。 */
export const sitemapStaticSource = (path: string): string =>
  path === "/" ? "app/page.tsx" : `app${path}/page.tsx`;
