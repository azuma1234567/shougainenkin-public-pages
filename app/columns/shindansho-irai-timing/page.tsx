import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/shindansho-irai-timing";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("shindansho-irai-timing");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["shinsatsu-mae-memo","shindansho-kaitekurenai","shindansho-kakunin"]}
      references={[
  {
    "label": "日本年金機構「障害年金の診断書を作成する医師の方へ」",
    "href": "https://www.nenkin.go.jp/tokusetsu/ishimuke.html"
  },
  {
    "label": "日本年金機構「障害年金の請求手続き等に使用する診断書・関連書類」",
    "href": "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/index.html"
  }
]}
    />
  );
}
