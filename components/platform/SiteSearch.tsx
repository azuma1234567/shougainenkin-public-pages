"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { SearchIcon } from "@/components/platform/Platform";

export type SearchItem = {
  href: string;
  title: string;
  description: string;
  category: string;
  keywords?: string;
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase("ja")
    .normalize("NFKC")
    .replace(/[、。・／/｜|?？!！「」『』（）()\-—–]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function search(items: SearchItem[], query: string) {
  const normalizedQuery = normalize(query);
  const terms = normalizedQuery.split(" ").filter(Boolean);
  if (terms.length === 0) return [];

  return items
    .map((item) => {
      const title = normalize(item.title);
      const category = normalize(item.category);
      const description = normalize(item.description);
      const keywords = normalize(item.keywords ?? "");
      const searchable = `${title} ${category} ${description} ${keywords}`;
      if (!terms.every((term) => searchable.includes(term))) return null;

      const score = terms.reduce((total, term) => {
        if (title === term) return total + 20;
        if (title.includes(term)) return total + 8;
        if (category.includes(term)) return total + 4;
        if (keywords.includes(term)) return total + 3;
        return total + 1;
      }, title.includes(normalizedQuery) ? 10 : 0);

      return { item, score };
    })
    .filter((result): result is { item: SearchItem; score: number } => result !== null)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "ja"))
    .slice(0, 8)
    .map(({ item }) => item);
}

export default function SiteSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  useEffect(() => {
    const initialQuery = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
    if (initialQuery) {
      setQuery(initialQuery);
      setSubmittedQuery(initialQuery);
    }
  }, []);

  const results = useMemo(
    () => search(items, submittedQuery),
    [items, submittedQuery],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    setSubmittedQuery(nextQuery);
    const url = new URL(window.location.href);
    if (nextQuery) url.searchParams.set("q", nextQuery);
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  return (
    <div className="p-search-wrap">
      <form className="p-search" role="search" aria-label="サイト内検索" onSubmit={submit}>
        <SearchIcon />
        <label className="p-visually-hidden" htmlFor="site-search-input">知りたいことを入力</label>
        <input
          id="site-search-input"
          className="p-search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="例: うつ病 働きながら / 初診日 カルテがない / 不支給"
          autoComplete="off"
        />
        <button className="p-search-action" type="submit">調べる</button>
      </form>

      {submittedQuery && (
        <section className="p-search-results" aria-live="polite" aria-label="検索結果">
          <div className="p-search-results-head">
            <strong>「{submittedQuery}」の検索結果</strong>
            <span>{results.length > 0 ? `${results.length}件を表示` : "該当する情報が見つかりませんでした"}</span>
          </div>
          {results.length > 0 ? (
            <div className="p-search-result-list">
              {results.map((item) => (
                <Link className="p-search-result" href={item.href} key={item.href}>
                  <span className="p-search-result-category">{item.category}</span>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="p-search-empty">言葉を短くするか、空白で区切って試してください。例:「初診日 カルテ」「うつ病 仕事」</p>
          )}
        </section>
      )}
    </div>
  );
}
