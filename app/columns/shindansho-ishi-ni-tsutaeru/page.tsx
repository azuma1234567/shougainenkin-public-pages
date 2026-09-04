import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { MHLW_REFERENCES, NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, { lead, faqs } from "@/content/columns/shindansho-ishi-ni-tsutaeru";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("shindansho-ishi-ni-tsutaeru"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "shinsatsu-mae-memo",
        "nichijo-seikatsu-7koumoku",
        "shindansho-kakunin",
        "shindansho-jittai-chigau",
      ]}
      references={[NENKIN_REFERENCES.diagnosis, MHLW_REFERENCES.seishinGuideline]}
    />
  );
}
