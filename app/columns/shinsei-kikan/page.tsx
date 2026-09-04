import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/shinsei-kikan";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("shinsei-kikan"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "shindansho-kakunin",
        "shinsatsu-mae-memo",
        "nichijo-seikatsu-7koumoku",
        "fushikyuu-shinsa-seikyu",
      ]}
      references={[
  {
    "label": "日本年金機構「障害年金を請求する方の手続き」",
    "href": "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/seikyu/index.html"
  },
  {
    "label": "日本年金機構「障害年金ガイド」",
    "href": "https://www.nenkin.go.jp/service/pamphlet/kyufu.files/LK03-2.pdf"
  },
  {
    "label": "日本年金機構「年金はいつ支払われますか。」",
    "href": "https://www.nenkin.go.jp/section/faq/jukyu/uketori/uketori/shiharaiduki/20140421-01.html"
  }
]}
    />
  );
}
