import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/jushinjokyo-shomeisho";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("jushinjokyo-shomeisho");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["shoshinbi-wakaranai","shindansho-irai-timing","nenkin-jimusho-soudan"]}
      references={[
  {
    "label": "日本年金機構「障害年金の請求手続き等に使用する診断書・関連書類」",
    "href": "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/index.html"
  },
  {
    "label": "日本年金機構「初診日」",
    "href": "https://www.nenkin.go.jp/service/yougo/sagyo/syosinbi.html"
  }
]}
    />
  );
}
