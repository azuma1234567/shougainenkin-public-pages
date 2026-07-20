import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/sokyuu-seikyuu";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("sokyuu-seikyuu");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["ninteibi-jigojusho","shoshinbi-wakaranai","shindansho-kaitekurenai"]}
      references={[
        {
                "label": "日本年金機構「障害厚生年金を受けられるとき」",
                "href": "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/seikyu/20140519-02.html"
        },
        {
                "label": "日本年金機構「年金の時効」",
                "href": "https://www.nenkin.go.jp/service/jukyu/seido/kyotsu/shikyu/20140421-01.html"
        },
        {
                "label": "日本年金機構「令和8年度の年金額」",
                "href": "https://www.nenkin.go.jp/oshirase/taisetu/kojin/2026/202604/0401.html"
        }
]}
    />
  );
}
