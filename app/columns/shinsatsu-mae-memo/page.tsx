import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import {
  MHLW_REFERENCES,
  NENKIN_REFERENCES,
} from "@/components/ColumnFooter";
import articleSource, { lead, faqs } from "@/content/columns/shinsatsu-mae-memo";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("shinsatsu-mae-memo"), lead };

export const metadata: Metadata = columnMetadata(column);



export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "moushitatesho-kakikata",
        "moushitatesho-a4-insatsu",
        "shindansho-kakunin",
        "shindansho-ishi-ni-tsutaeru",
      ]}
      references={[
        MHLW_REFERENCES.seishinGuideline,
        NENKIN_REFERENCES.seido,
      ]}
    />
  );
}
