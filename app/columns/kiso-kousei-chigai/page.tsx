import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/kiso-kousei-chigai";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("kiso-kousei-chigai");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["ikura-moraeru", "shoshinbi-wakaranai", "nofu-yoken"]}
      references={[
      {
            "label": "日本年金機構「障害基礎年金の受給要件・請求時期・年金額」",
            "href": "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20150514.html"
      },
      {
            "label": "日本年金機構「障害厚生年金の受給要件・請求時期・年金額」",
            "href": "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20150401-02.html"
      },
      {
            "label": "日本年金機構「年金の併給または選択」",
            "href": "https://www.nenkin.go.jp/service/jukyu/seido/kyotsu/shikyu/20140421-02.html"
      }
]}
    />
  );
}
