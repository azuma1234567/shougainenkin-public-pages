export function sortedYougoTerms(entries) {
  return [...entries].sort((a, b) => b.term.length - a.term.length || a.slug.localeCompare(b.slug));
}

export function findFirstYougoTerm(text, entries, linkedSlugs = new Set(), selfSlug = "") {
  let best = null;
  for (const entry of sortedYougoTerms(entries)) {
    if (linkedSlugs.has(entry.slug) || entry.slug === selfSlug) continue;
    const index = text.indexOf(entry.term);
    if (index < 0) continue;
    if (!best || index < best.index || (index === best.index && entry.term.length > best.entry.term.length)) {
      best = { index, entry };
    }
  }
  return best;
}

export function isYougoExcludedTag(tagName) {
  /* SCRIPT/STYLE/TEMPLATE/NOSCRIPT/TEXTAREA の中は、見た目の文章ではない。
     とくに <script type="application/ld+json"> に <a> を差し込むと、
     構造化データが JSON として読めなくなる(Search Console「解析不能な構造化データ」)。 */
  return ["A", "H1", "H2", "H3", "CODE", "PRE", "SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT", "TEXTAREA"]
    .includes(String(tagName).toUpperCase());
}
