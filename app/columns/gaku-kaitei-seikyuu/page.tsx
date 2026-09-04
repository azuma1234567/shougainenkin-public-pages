import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/gaku-kaitei-seikyuu";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("gaku-kaitei-seikyuu"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["koushin-kakuninhodo", "shikyuu-teishi-fukkatsu", "tokyu-hantei-guideline"]}
      references={[
      {
            "label": "日本年金機構「障害の程度が変わったとき」",
            "href": "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/jukyu/20140421-24.html"
      },
      {
            "label": "日本年金機構「障害給付 額改定請求書（様式・記入例）」",
            "href": "https://www.nenkin.go.jp/shinsei/jukyu/shougai/20180213.html"
      },
      {
            "label": "厚生労働省「精神の障害に係る等級判定ガイドライン」",
            "href": "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000130379.html"
      }
]}
    />
  );
}
