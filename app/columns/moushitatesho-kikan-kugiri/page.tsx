import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/moushitatesho-kikan-kugiri";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("moushitatesho-kikan-kugiri");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["moushitatesho-kakikata","moushitatesho-a4-insatsu","shoshinbi-wakaranai"]}
      references={[
        {
                "label": "日本年金機構「病歴・就労状況等申立書（続紙）」",
                "href": "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/20140516.files/03.pdf"
        },
        {
                "label": "日本年金機構「障害基礎年金を受けられるとき」",
                "href": "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/seikyu/20140519-01.html"
        }
]}
    />
  );
}
