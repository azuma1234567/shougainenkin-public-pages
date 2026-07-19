import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/shindansho-kaitekurenai";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("shindansho-kaitekurenai");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["shinsatsu-mae-memo","nichijo-seikatsu-7koumoku","shindansho-kakunin"]}
      references={[
        {
                "label": "厚生労働省「医師法」",
                "href": "https://www.mhlw.go.jp/web/t_doc?dataId=80001000&dataType=0&pageNo=1"
        },
        {
                "label": "日本年金機構「障害年金の診断書を作成する医師の方へ」",
                "href": "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/sakusei.html"
        },
        {
                "label": "日本年金機構「年金相談や手続きを代理人に委任するとき」",
                "href": "https://www.nenkin.go.jp/service/jukyu/tetsuduki/kyotsu/sonota/20140306.html"
        }
]}
    />
  );
}

