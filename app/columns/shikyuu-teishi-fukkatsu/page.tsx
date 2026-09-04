import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/shikyuu-teishi-fukkatsu";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("shikyuu-teishi-fukkatsu"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["koushin-kakuninhodo", "gaku-kaitei-seikyuu", "fushikyuu-shinsa-seikyu"]}
      references={[
      {
            "label": "日本年金機構「障害状態確認届（診断書）が届いたとき」",
            "href": "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/jukyu/2019091905.html"
      },
      {
            "label": "日本年金機構「ふたたび障害の程度が重くなったとき」",
            "href": "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/jukyu/20140421-11.html"
      },
      {
            "label": "日本年金機構「年金の決定に不服があるとき（審査請求）」",
            "href": "https://www.nenkin.go.jp/service/jukyu/seido/kyotsu/fufuku/20140709.html"
      }
]}
    />
  );
}
