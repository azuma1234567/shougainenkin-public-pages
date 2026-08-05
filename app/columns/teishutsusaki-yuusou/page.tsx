import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/teishutsusaki-yuusou";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("teishutsusaki-yuusou");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "hitsuyou-shorui-seishin",
        "nenkin-jimusho-soudan",
        "shinsei-kikan",
      ]}
      references={[
        {
          label: "日本年金機構「障害年金を請求する方の手続き」",
          href: "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/seikyu/index.html",
        },
        {
          label: "日本年金機構「全国の相談・手続き窓口」",
          href: "https://www.nenkin.go.jp/section/soudan/",
        },
      ]}
    />
  );
}
