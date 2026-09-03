/* sitemap.xml に**意図的に**入れないページ。
   入れ忘れと区別するための明示リスト。公開前チェック C-1 はここにあるパスを
   「未収録」ではなく「意図的な除外」として数え、ここに無いのに未収録なら×にする。
   あわせて、ここにあるページが本当に noindex になっているかも検査する
   (sitemap から外しているのに noindex でない、というちぐはぐな状態を防ぐ)。

   ページを公開するときは、page.tsx の noindex を外し、app/sitemap.ts へ足し、ここから消す。 */
export type SitemapExclusion = {
  path: string;
  reason: string;
  /* いつ解消するか。決まっていなければ書かない。 */
  until?: string;
};

export const SITEMAP_EXCLUDED: SitemapExclusion[] = [
  {
    path: "/tokushoho",
    reason: "有料掲載を受け付けるまで未確定の項目が残るため noindex。app/tokushoho/page.tsx の DRAFT を false にするとき、ここと app/sitemap.ts から外す",
    until: "有料掲載の受付を始めるとき",
  },
];

export const SITEMAP_EXCLUDED_PATHS = SITEMAP_EXCLUDED.map((e) => e.path);
