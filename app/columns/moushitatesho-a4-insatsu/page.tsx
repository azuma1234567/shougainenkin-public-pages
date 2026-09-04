import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, { lead, faqs } from "@/content/columns/moushitatesho-a4-insatsu";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("moushitatesho-a4-insatsu"), lead };

export const metadata: Metadata = columnMetadata(column);



export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "moushitatesho-kikan-kugiri",
        "moushitatesho-mijushin-kikan",
        "moushitatesho-kakikata",
        "shindansho-kakunin",
      ]}
      references={[
        NENKIN_REFERENCES.moushitatesho,
        NENKIN_REFERENCES.seido,
      ]}
    />
  );
}
