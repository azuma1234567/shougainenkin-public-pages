import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/shoubyou-teatekin";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("shoubyou-teatekin");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={["ninteibi-jigojusho", "hatarakinagara", "shoshinbi-wakaranai"]}
      references={[
        { label: "協会けんぽ「傷病手当金」", href: "https://www.kyoukaikenpo.or.jp/benefit/injury_and_sickness_allowance/index.html" },
        { label: "協会けんぽ「電子申請システムQ&A」", href: "https://www.kyoukaikenpo.or.jp/electronic_application/faq/index.html" },
        { label: "日本年金機構「障害基礎年金の受給要件・請求時期・年金額」", href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20150514.html" },
        { label: "ハローワーク「基本手当・受給期間延長」", href: "https://www.hellowork.mhlw.go.jp/help/question05.html" },
      ]}
    />
  );
}
