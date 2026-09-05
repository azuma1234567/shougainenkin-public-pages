"use client";
/* 一覧ページのカードと、病名の絞り込み。
   絞り込みはこのブラウザの中だけで動く。何も送信しない。
   カードはサーバー側でも全部描画されるので、JS が無くても21枚すべて見える。 */
import Link from "next/link";
import { useMemo, useState } from "react";

export type HubCard = {
  path: string;
  label: string;
  hint?: string;
  columns: number;
  cases: number;
  /* 絞り込みに使う語(ラベル + 別名)。小文字に寄せてある */
  terms: string;
};

export type HubGroup = { label: string; note?: string; anchor: string; items: HubCard[] };

function Card({ card }: { card: HubCard }) {
  const meta = [
    card.columns > 0 ? `記事 ${card.columns}本` : null,
    card.cases > 0 ? `実例 ${card.cases}件` : null,
  ].filter(Boolean).join(" · ");
  return (
    <Link className="hub-card" href={card.path}>
      <h3>{card.label}</h3>
      {card.hint ? <p>{card.hint}</p> : null}
      <span className="hub-card-meta">
        <span>{meta}</span>
        <b>読む →</b>
      </span>
    </Link>
  );
}

export default function HubIndexList({ groups, filterable = false }: { groups: HubGroup[]; filterable?: boolean }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const shown = useMemo(
    () => groups
      .map((g) => ({ ...g, items: q ? g.items.filter((c) => c.terms.includes(q)) : g.items }))
      .filter((g) => g.items.length > 0),
    [groups, q],
  );
  const total = shown.reduce((n, g) => n + g.items.length, 0);
  const named = groups.length > 1 || groups[0]?.label;

  return (
    <>
      {filterable && (
        <div className="hub-index-search" role="search">
          <label htmlFor="hub-index-q">病名で絞り込む</label>
          <input
            id="hub-index-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例: ADHD、透析、ペースメーカー"
            autoComplete="off"
          />
        </div>
      )}

      {total === 0 ? (
        <p className="hub-index-empty">
          「{query.trim()}」に当てはまる病気は見つかりませんでした。見つからないときは{" "}
          <Link href="/nayami">悩みから探す</Link> か <Link href="/hajimete">はじめての方へ</Link> へ。
        </p>
      ) : (
        shown.map((group) => (
          <section className="hub-index-group" id={group.anchor} key={group.anchor}>
            {named && group.label ? (
              <div className="hub-index-group-head">
                <h2>{group.label}</h2>
                <small>{group.items.length}ページ</small>
              </div>
            ) : null}
            {group.note ? <p className="hub-index-group-note">{group.note}</p> : null}
            <div className="hub-index-grid">
              {group.items.map((card) => <Card card={card} key={card.path} />)}
            </div>
          </section>
        ))
      )}
    </>
  );
}
