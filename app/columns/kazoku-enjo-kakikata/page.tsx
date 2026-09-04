import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/kazoku-enjo-kakikata";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("kazoku-enjo-kakikata"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "moushitatesho-kakikata",
        "nichijo-seikatsu-7koumoku",
        "moushitatesho-kikan-kugiri",
      ]}
      references={[
        {
          label: "日本年金機構「病歴・就労状況等申立書」",
          href: "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/20140516.files/03.pdf",
        },
        {
          label: "日本年金機構「精神の障害に係る等級判定ガイドライン」",
          href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/ninteikijun/20160715.html",
        },
      ]}
    />
  );
}
