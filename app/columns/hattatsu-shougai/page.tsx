import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/hattatsu-shougai";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("hattatsu-shougai");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["hatachi-mae", "moushitatesho-kakikata", "hatarakinagara"]}
      references={[
        { label: "日本年金機構「精神の障害に係る等級判定ガイドライン」", href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/ninteikijun/20160715.html" },
        { label: "日本年金機構「障害基礎年金の受給要件・請求時期・年金額」", href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20150514.html" },
        { label: "日本年金機構「障害年金業務統計（令和6年度）」", href: "https://www.nenkin.go.jp/info/kokaitokei/johokokai/uneihyogikai/62.files/62-07.pdf" },
        { label: "厚生労働省「医師法（診療録の保存）」", href: "https://www.mhlw.go.jp/web/t_doc?dataId=80001000" },
      ]}
    />
  );
}
