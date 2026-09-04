import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/shinsei-shindoi";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("shinsei-shindoi"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["nenkin-jimusho-soudan","moushitatesho-kakikata","shinsei-kikan"]}
      references={[
      {
            "label": "日本年金機構「障害年金」",
            "href": "https://www.nenkin.go.jp/service/jukyu/shougainenkin/"
      }
]}
    />
  );
}
