import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, { lead, faqs } from "@/content/columns/tekio-shogai-shogai-nenkin";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("tekio-shogai-shogai-nenkin"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "taishou-shoubyou-kyoukai",
        "shoshinbi-wakaranai",
        "shoubyou-teatekin",
        "shinsatsu-mae-memo",
      ]}
      references={[
        NENKIN_REFERENCES.seido,
        NENKIN_REFERENCES.jukyuYoken,
        NENKIN_REFERENCES.firstVisit,
      ]}
    />
  );
}
