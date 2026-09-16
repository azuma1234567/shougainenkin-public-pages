/* 開示ブロック: 「掲載(広告)」ラベル＋箇条書き(docs/claude-code-sharoushi-list-2026-09-16-instructions.md §2)。
   無料掲載にも広告掲載規約が及ぶので、一覧・都道府県・事務所ページの全部に出す(lib/hubs.ts の2条件)。 */
import type { ReactNode } from "react";
import AdLabel from "@/components/AdLabel";

export default function Disclose({ items }: { items: ReactNode[] }) {
  return (
    <div className="sr-disclose">
      <AdLabel kind="掲載(広告)" />
      <ul>
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>
  );
}
