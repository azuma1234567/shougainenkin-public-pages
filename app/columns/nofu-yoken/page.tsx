import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, { lead } from "@/content/columns/nofu-yoken";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("nofu-yoken"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      relatedSlugs={[
        "shoshinbi-wakaranai",
        "hatachi-mae",
        "shoshinbi-karute-nashi",
        "nenkin-jimusho-soudan",
        "techou-to-nenkin",
      ]}
      references={[
        NENKIN_REFERENCES.jukyuYoken,
        NENKIN_REFERENCES.beforeTwenty,
        NENKIN_REFERENCES.seido,
      ]}
    />
  );
}
