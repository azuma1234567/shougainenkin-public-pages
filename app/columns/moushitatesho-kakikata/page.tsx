import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, { lead, faqs } from "@/content/columns/moushitatesho-kakikata";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("moushitatesho-kakikata"), lead };

export const metadata: Metadata = columnMetadata(column);



export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "moushitatesho-a4-insatsu",
        "shinsatsu-mae-memo",
        "moushitatesho-kikan-kugiri",
        "shindansho-ishi-ni-tsutaeru",
      ]}
      references={[
        NENKIN_REFERENCES.moushitatesho,
        NENKIN_REFERENCES.seido,
      ]}
    />
  );
}
