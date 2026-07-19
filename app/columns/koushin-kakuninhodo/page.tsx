import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/koushin-kakuninhodo";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("koushin-kakuninhodo");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["shinsatsu-mae-memo","nichijo-seikatsu-7koumoku","fushikyuu-shinsa-seikyu"]}
      references={[
        {
                "label": "日本年金機構「障害状態確認届（診断書）が届いたとき」",
                "href": "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/jukyu/2019091905.html"
        },
        {
                "label": "日本年金機構「障害状態確認届（診断書）のQ&A」",
                "href": "https://www.nenkin.go.jp/section/faq/jukyu/jukyushatodoke/shougai/kakunintodoke/2019091901.html"
        }
]}
    />
  );
}

