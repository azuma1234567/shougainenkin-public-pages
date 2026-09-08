import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/fushikyu-85ken";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("fushikyu-85ken"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return <ColumnArticle column={column} source={articleSource} faqs={faqs}
    relatedSlugs={["fushikyuu-shinsa-seikyu", "shindansho-jittai-chigau", "nichijo-seikatsu-7koumoku"]} />;
}
