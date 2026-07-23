import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/hitsuyou-shorui-seishin";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("hitsuyou-shorui-seishin");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["nenkin-jimusho-soudan","jushinjokyo-shomeisho","shindansho-irai-timing"]}
      references={[
  {
    "label": "日本年金機構「障害基礎年金を受けられるとき」",
    "href": "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/seikyu/20140519-01.html"
  },
  {
    "label": "日本年金機構「障害厚生年金を受けられるとき」",
    "href": "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/seikyu/20140519-02.html"
  }
]}
    />
  );
}
