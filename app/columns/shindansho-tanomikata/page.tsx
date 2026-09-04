import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/shindansho-tanomikata";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("shindansho-tanomikata"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "shindansho-irai-timing",
        "shinsatsu-mae-memo",
        "shindansho-kakunin",
        "shindansho-ishi-ni-tsutaeru",
      ]}
      references={[
        {
          label: "日本年金機構「診断書・関連書類」",
          href: "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/index.html",
        },
        {
          label: "日本年金機構「障害年金を請求する方の手続き」",
          href: "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/seikyu/index.html",
        },
      ]}
    />
  );
}
