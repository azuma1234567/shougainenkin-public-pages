import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/shinsa-shikumi-nintei-i";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("shinsa-shikumi-nintei-i"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["nichijo-seikatsu-7koumoku","tokyu-hantei-guideline","moushitatesho-kakikata"]}
      references={[
      {
            "label": "日本年金機構「障害年金」",
            "href": "https://www.nenkin.go.jp/service/jukyu/shougainenkin/"
      },
      {
            "label": "日本年金機構「国民年金・厚生年金保険 障害認定基準」",
            "href": "https://www.nenkin.go.jp/service/jukyu/shougainenkin/ninteikijun/"
      },
      {
            "label": "厚生労働省「精神の障害に係る等級判定ガイドライン」",
            "href": "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000130379.html"
      }
]}
    />
  );
}
