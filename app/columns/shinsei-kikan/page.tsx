import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/shinsei-kikan";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("shinsei-kikan");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["hitsuyou-shorui-seishin","koushin-kakuninhodo","fushikyuu-shinsa-seikyu"]}
      references={[
  {
    "label": "日本年金機構「障害年金を請求する方の手続き」",
    "href": "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/seikyu/index.html"
  },
  {
    "label": "日本年金機構「障害年金ガイド」",
    "href": "https://www.nenkin.go.jp/service/pamphlet/kyufu.files/LK03-2.pdf"
  }
]}
    />
  );
}
