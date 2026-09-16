import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead } from "@/content/columns/jibun-de-shinsei";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("jibun-de-shinsei"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return <ColumnArticle column={column} source={articleSource}
    relatedSlugs={["sharoushi-kawaranai-koto", "shoshinbi-wakaranai", "nofu-yoken", "shinsei-shindoi"]} />;
}
