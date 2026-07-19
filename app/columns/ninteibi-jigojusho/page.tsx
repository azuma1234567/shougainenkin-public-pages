import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/ninteibi-jigojusho";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("ninteibi-jigojusho");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["shoshinbi-wakaranai", "moushitatesho-kakikata", "shoubyou-teatekin"]}
      references={[
        { label: "日本年金機構「障害厚生年金の受給要件・請求時期・年金額」", href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20150401-02.html" },
        { label: "日本年金機構「障害基礎年金の受給要件・請求時期・年金額」", href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20150514.html" },
        { label: "日本年金機構「障害の程度が変わったとき」", href: "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/jukyu/20140421-24.html" },
        { label: "厚生労働省「医師法（診療録の保存）」", href: "https://www.mhlw.go.jp/web/t_doc?dataId=80001000" },
      ]}
    />
  );
}
