import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/fushikyuu-shinsa-seikyu";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("fushikyuu-shinsa-seikyu");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["shindansho-kakunin", "moushitatesho-kakikata", "ninteibi-jigojusho"]}
      references={[
        { label: "近畿厚生局「社会保険審査官への審査請求」", href: "https://kouseikyoku.mhlw.go.jp/kinki/gyomu/bu_ka/shahoken/index.html" },
        { label: "厚生労働省「社会保険審査会」", href: "https://www.mhlw.go.jp/topics/bukyoku/shinsa/syakai/index.html" },
        { label: "日本年金機構「障害厚生年金の受給要件・請求時期・年金額」", href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20150401-02.html" },
      ]}
    />
  );
}
