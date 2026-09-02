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
  return ["A", "H1", "H2", "H3", "CODE", "PRE"].includes(String(tagName).toUpperCase());
}
