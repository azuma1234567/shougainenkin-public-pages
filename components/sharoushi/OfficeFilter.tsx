"use client";
/* 都道府県ページの絞り込み(docs/claude-code-sharoushi-list-2026-09-16-instructions.md §3-2)。
   チップは aria-pressed、複数選択は AND。状態は URL に載せずページ内で持つ(共有リンクに条件が乗らない)。
   初期描画は絞り込みなしの全件をサーバーが出す(この部品も初回は全件を描く)ので、JS 無効でも全件が読める。
   チップ操作は sharoushi_filter を送る(ラベルと件数だけ)。 */
import { useState } from "react";
import Link from "next/link";
import OfficeCard from "@/components/sharoushi/OfficeCard";
import { SHAROUSHI_FLAGS, SHAROUSHI_KINDS, SHAROUSHI_TOPICS, SHAROUSHI_WAYS } from "@/data/sharoushi/options";
import { applyFilters, type Filters, type Office } from "@/lib/sharoushi";
import { trackFilter } from "@/lib/sharoushi-track";

const EMPTY: Filters = { ways: [], topics: [], kinds: [] };

export default function OfficeFilter({ offices, pref, prefName }: { offices: Office[]; pref: string; prefName: string }) {
  const [sel, setSel] = useState<Filters>(EMPTY);
  const shown = applyFilters(offices, sel);
  const active = sel.ways.length + sel.topics.length + sel.kinds.length > 0;

  const toggle = (key: keyof Filters, value: string) => {
    const on = !sel[key].includes(value);
    const next = { ...sel, [key]: on ? [...sel[key], value] : sel[key].filter((v) => v !== value) };
    setSel(next);
    trackFilter(pref, value, on, applyFilters(offices, next).length);
  };
  const clear = () => setSel(EMPTY);

  const row = (label: string, key: keyof Filters, values: readonly string[]) => (
    <div className="sr-row" role="group" aria-label={label}>
      <span className="sr-lbl">{label}</span>
      {values.map((v) => (
        <button key={v} type="button" className="sr-chip" aria-pressed={sel[key].includes(v)} onClick={() => toggle(key, v)}>{v}</button>
      ))}
    </div>
  );

  return (
    <>
      <div className="sr-filters">
        {row("相談のしかた・条件", "ways", [...SHAROUSHI_WAYS, ...SHAROUSHI_FLAGS])}
        {row("対応できる相談", "topics", SHAROUSHI_TOPICS.map((t) => t.label))}
        {row("得意な障害の種類", "kinds", SHAROUSHI_KINDS)}
        <div className="sr-row">
          <span className="sr-count" aria-live="polite">{shown.length}事務所(更新日の新しい順)</span>
          <button type="button" className="sr-chip sr-clear" onClick={clear} disabled={!active}>絞り込みを解除</button>
        </div>
      </div>
      {offices.length === 0 ? (
        <p className="sr-empty">{prefName}の事務所は、いまのところ掲載がありません。全国(オンライン・郵送)対応の事務所は<Link href="/sharoushi#nationwide">一覧</Link>にあります。</p>
      ) : shown.length === 0 ? (
        <p className="sr-empty">この条件に合う事務所は、いまのところ掲載がありません。条件を減らすか、全国(オンライン・郵送)対応の事務所をご覧ください。</p>
      ) : (
        shown.map((o) => <OfficeCard key={o.id} office={o} headingLevel={2} />)
      )}
    </>
  );
}
