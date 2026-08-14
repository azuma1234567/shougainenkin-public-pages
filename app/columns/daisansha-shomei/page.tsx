import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/daisansha-shomei";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("daisansha-shomei");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["shoshinbi-karute-nashi", "shoshinbi-haiin", "jushinjokyo-shomeisho"]}
      references={[
      {
            "label": "日本年金機構「初診日に関する第三者からの申立書を提出するとき」",
            "href": "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/2018042601.html"
      },
      {
            "label": "日本年金機構「受診状況等証明書を提出するとき」",
            "href": "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/20140421-20.html"
      },
      {
            "label": "日本年金機構「障害年金の請求手続き等に使用する診断書・関連書類」",
            "href": "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/index.html"
      }
]}
    />
  );
}
