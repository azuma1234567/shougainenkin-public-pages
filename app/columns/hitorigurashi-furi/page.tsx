import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import {
  MHLW_REFERENCES,
  NENKIN_REFERENCES,
} from "@/components/ColumnFooter";
import articleSource, { lead, faqs } from "@/content/columns/hitorigurashi-furi";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("hitorigurashi-furi"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "nichijo-seikatsu-7koumoku",
        "shinsatsu-mae-memo",
        "koushin-kakuninhodo",
      ]}
      references={[
        MHLW_REFERENCES.seishinGuideline,
        NENKIN_REFERENCES.diagnosis,
      ]}
    />
  );
}
