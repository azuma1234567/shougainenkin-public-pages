import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/hatarakinagara";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("hatarakinagara");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["moushitatesho-kakikata", "shinsatsu-mae-memo", "shindansho-kakunin"]}
      references={[
        { label: "日本年金機構「障害基礎年金の受給要件・請求時期・年金額」", href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20150514.html" },
        { label: "日本年金機構「精神の障害に係る等級判定ガイドライン」", href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/ninteikijun/20160715.html" },
        { label: "日本年金機構「障害年金業務統計（令和6年度）」", href: "https://www.nenkin.go.jp/info/kokaitokei/johokokai/uneihyogikai/62.files/62-07.pdf" },
        { label: "ハローワーク「基本手当の所定給付日数」", href: "https://www.hellowork.mhlw.go.jp/help/question05.html" },
      ]}
    />
  );
}
