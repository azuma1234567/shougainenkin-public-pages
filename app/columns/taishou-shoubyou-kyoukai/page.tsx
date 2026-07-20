import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/taishou-shoubyou-kyoukai";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("taishou-shoubyou-kyoukai");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["hattatsu-shougai","nichijo-seikatsu-7koumoku","shoubyou-teatekin"]}
      references={[
        {
                "label": "日本年金機構「障害認定基準（精神の障害）」",
                "href": "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/ninteikijun/20140604.files/3-1-8.pdf"
        },
        {
                "label": "日本年金機構「精神の障害に係る等級判定ガイドライン」",
                "href": "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/ninteikijun/20160715.html"
        }
]}
    />
  );
}
