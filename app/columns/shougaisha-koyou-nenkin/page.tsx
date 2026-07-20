import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/shougaisha-koyou-nenkin";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("shougaisha-koyou-nenkin");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["hatarakinagara","techou-to-nenkin","koushin-kakuninhodo"]}
      references={[
        {
                "label": "日本年金機構「障害認定基準（精神の障害）」",
                "href": "https://www.nenkin.go.jp/service/jukyu/shougainenkin/ninteikijun/20140604.files/3-1-8.pdf"
        },
        {
                "label": "日本年金機構「精神の障害に係る等級判定ガイドライン」",
                "href": "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/ninteikijun/20160715.html"
        },
        {
                "label": "日本年金機構「20歳前傷病による障害基礎年金の支給制限」",
                "href": "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20200805.html"
        }
]}
    />
  );
}
