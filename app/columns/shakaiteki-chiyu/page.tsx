import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/shakaiteki-chiyu";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("shakaiteki-chiyu"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "shoshinbi-wakaranai",
        "moushitatesho-mijushin-kikan",
        "nofu-yoken",
        "kiso-kousei-chigai",
      ]}
      references={[
        {
          label: "日本年金機構「初診日」",
          href: "https://www.nenkin.go.jp/service/yougo/sagyo/syosinbi.html",
        },
        {
          label: "国民年金・厚生年金保険 障害認定基準(日本年金機構)",
          href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/ninteikijun/20140604.files/01.pdf",
        },
        {
          label: "厚生労働省「社会保険審査会」",
          href: "https://www.mhlw.go.jp/topics/bukyoku/shinsa/syakai/index.html",
        },
      ]}
    />
  );
}
