"use client";
/* ヒーローの分類チップの右に置く、病名の絞り込み。
   モック docs/site-mock-2026-09-05-all/site.html の /byoki の板と同じ形。
   入力はこのブラウザの中だけで扱う。何も送信しない。 */
import { useSyncExternalStore } from "react";
import { getQuery, getServerQuery, setQuery, subscribe } from "@/components/platform/hubIndexFilter";

export function HubIndexSearch() {
  const query = useSyncExternalStore(subscribe, getQuery, getServerQuery);
  return (
    <div className="hub-index-search" role="search">
      <label className="p-visually-hidden" htmlFor="hub-index-q">病名で絞り込む</label>
      <svg aria-hidden="true" fill="none" height="17" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="17">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        autoComplete="off"
        id="hub-index-q"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="病名で絞り込む(ADHD、透析…)"
        type="search"
        value={query}
      />
    </div>
  );
}

export default HubIndexSearch;
