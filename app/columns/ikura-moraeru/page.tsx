import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/ikura-moraeru";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("ikura-moraeru");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["kiso-kousei-chigai", "sokyuu-seikyuu", "hatarakinagara"]}
      references={[
      {
            "label": "日本年金機構「令和8年度の年金額および年金生活者支援給付金支給金額の改定について」",
            "href": "https://www.nenkin.go.jp/tokusetsu/nenkingakutou_kaitei.html"
      },
      {
            "label": "日本年金機構「障害年金ガイド」",
            "href": "https://www.nenkin.go.jp/service/pamphlet/kyufu.html"
      },
      {
            "label": "日本年金機構「20歳前の傷病による障害基礎年金にかかる支給制限等」",
            "href": "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20200805.html"
      }
]}
    />
  );
}
