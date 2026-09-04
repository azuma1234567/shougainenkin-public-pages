import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { MHLW_REFERENCES, NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, { lead, faqs } from "@/content/columns/shindansho-jittai-chigau";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("shindansho-jittai-chigau"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "shindansho-kakunin",
        "shindansho-ishi-ni-tsutaeru",
        "fushikyuu-shinsa-seikyu",
        "koushin-kakuninhodo",
      ]}
      references={[NENKIN_REFERENCES.diagnosis, MHLW_REFERENCES.seishinGuideline]}
    />
  );
}
