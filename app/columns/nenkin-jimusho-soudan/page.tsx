import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/nenkin-jimusho-soudan";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("nenkin-jimusho-soudan");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["shoshinbi-wakaranai","hitsuyou-shorui-seishin","jibun-de-shinsei"]}
      references={[
  {
    "label": "日本年金機構「予約相談について」",
    "href": "https://www.nenkin.go.jp/section/guidance/yoyaku.html"
  },
  {
    "label": "日本年金機構「病気やけがで障害が残ったとき」",
    "href": "https://www.nenkin.go.jp/service/scenebetsu/shougai.html"
  }
]}
    />
  );
}
