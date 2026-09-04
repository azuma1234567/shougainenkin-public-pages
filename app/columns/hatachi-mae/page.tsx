import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, { lead, faqs } from "@/content/columns/hatachi-mae";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("hatachi-mae"), lead };
export const metadata: Metadata = columnMetadata(column);



export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "hattatsu-shougai",
        "shoshinbi-wakaranai",
        "moushitatesho-kakikata",
      ]}
      references={[
        NENKIN_REFERENCES.jukyuYoken,
        NENKIN_REFERENCES.beforeTwenty,
        NENKIN_REFERENCES.firstVisitProof,
      ]}
    />
  );
}
