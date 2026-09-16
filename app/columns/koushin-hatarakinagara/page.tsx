import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead } from "@/content/columns/koushin-hatarakinagara";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("koushin-hatarakinagara"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      relatedSlugs={[
        "koushin-kakuninhodo",
        "shindansho-shurojokyo",
        "kousei-3kyu-hataraku",
        "shikyuu-teishi-fukkatsu",
        "fushikyuu-shinsa-seikyu",
      ]}
      references={[
        {
          label: "日本年金機構「障害状態確認届（診断書）が届いたとき」",
          href: "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/jukyu/2019091905.html",
        },
        {
          label: "厚生労働省「障害年金の診断書(精神の障害用)記載要領」",
          href: "https://www.mhlw.go.jp/file/04-Houdouhappyou-12512000-Nenkinkyoku-Jigyoukanrika/0000130048.pdf",
        },
        {
          label: "厚生労働省「精神の障害に係る等級判定ガイドライン」",
          href: "https://www.mhlw.go.jp/file/04-Houdouhappyou-12512000-Nenkinkyoku-Jigyoukanrika/0000130045.pdf",
        },
      ]}
    />
  );
}
