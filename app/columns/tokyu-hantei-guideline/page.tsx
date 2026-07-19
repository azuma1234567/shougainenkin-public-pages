import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/tokyu-hantei-guideline";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("tokyu-hantei-guideline");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["nichijo-seikatsu-7koumoku","shindansho-kakunin","hatarakinagara"]}
      references={[
        {
                "label": "日本年金機構「精神の障害に係る等級判定ガイドライン」",
                "href": "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/ninteikijun/20160715.html"
        },
        {
                "label": "日本年金機構「障害認定基準」",
                "href": "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/ninteikijun/index.html"
        }
]}
    />
  );
}

