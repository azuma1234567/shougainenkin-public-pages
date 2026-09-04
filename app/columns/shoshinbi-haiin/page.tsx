import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, { lead, faqs } from "@/content/columns/shoshinbi-haiin";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("shoshinbi-haiin"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "shoshinbi-wakaranai",
        "shoshinbi-karute-nashi",
        "jushinjokyo-shomeisho",
        "nenkin-jimusho-soudan",
        "hatachi-mae",
      ]}
      references={[
        NENKIN_REFERENCES.firstVisit,
        NENKIN_REFERENCES.thirdParty,
        NENKIN_REFERENCES.moushitatesho,
      ]}
    />
  );
}
