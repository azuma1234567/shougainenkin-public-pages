import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/nichijo-seikatsu-7koumoku";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("nichijo-seikatsu-7koumoku");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["shinsatsu-mae-memo","shindansho-kakunin","tokyu-hantei-guideline"]}
      references={[
        {
                "label": "日本年金機構「障害年金の診断書を作成する医師の方へ」",
                "href": "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/sakusei.html"
        },
        {
                "label": "日本年金機構「精神の障害に係る等級判定ガイドライン」",
                "href": "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/ninteikijun/20160715.html"
        }
]}
    />
  );
}

