import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead } from "@/content/columns/shindansho-shurojokyo";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("shindansho-shurojokyo"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      relatedSlugs={[
        "shinsatsu-mae-memo",
        "shougaisha-koyou-nenkin",
        "shindansho-kakunin",
        "koushin-hatarakinagara",
        "nichijo-seikatsu-7koumoku",
      ]}
      references={[
        {
          label: "厚生労働省「障害年金の診断書(精神の障害用)記載要領」",
          href: "https://www.mhlw.go.jp/file/04-Houdouhappyou-12512000-Nenkinkyoku-Jigyoukanrika/0000130048.pdf",
        },
        {
          label: "厚生労働省「精神の障害に係る等級判定ガイドライン」",
          href: "https://www.mhlw.go.jp/file/04-Houdouhappyou-12512000-Nenkinkyoku-Jigyoukanrika/0000130045.pdf",
        },
        {
          label: "日本年金機構「障害年金の請求手続き等に使用する診断書・関連書類」",
          href: "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/index.html",
        },
      ]}
    />
  );
}
