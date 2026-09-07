import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/sharoushi-kawaranai-koto";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("sharoushi-kawaranai-koto"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return <ColumnArticle column={column} source={articleSource} faqs={faqs}
    relatedSlugs={["jibun-de-shinsei", "shindansho-ishi-ni-tsutaeru", "fushikyuu-shinsa-seikyu"]} />;
}
