import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, { faqs } from "@/content/columns/shoshinbi-wakaranai";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("shoshinbi-wakaranai");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "jushinjokyo-shomeisho",
        "nenkin-jimusho-soudan",
        "sokyuu-seikyuu",
        "ninteibi-jigojusho",
      ]}
      references={[
        NENKIN_REFERENCES.firstVisit,
        NENKIN_REFERENCES.thirdParty,
        NENKIN_REFERENCES.moushitatesho,
      ]}
    />
  );
}
