import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { MHLW_REFERENCES, NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, { lead } from "@/content/columns/shindansho-kakunin";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("shindansho-kakunin"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      relatedSlugs={[
        "shinsatsu-mae-memo",
        "shindansho-jittai-chigau",
        "nichijo-seikatsu-7koumoku",
        "tokyu-hantei-guideline",
        "koushin-kakuninhodo",
      ]}
      references={[
        NENKIN_REFERENCES.diagnosis,
        MHLW_REFERENCES.seishinGuideline,
      ]}
    />
  );
}
