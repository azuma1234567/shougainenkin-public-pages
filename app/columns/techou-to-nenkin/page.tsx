import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { MHLW_REFERENCES, NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, { lead } from "@/content/columns/techou-to-nenkin";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("techou-to-nenkin"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      relatedSlugs={[
        "nofu-yoken",
        "hatachi-mae",
        "shoshinbi-wakaranai",
        "shougaisha-koyou-nenkin",
        "tokyu-hantei-guideline",
      ]}
      references={[
        NENKIN_REFERENCES.seido,
        NENKIN_REFERENCES.jukyuYoken,
        MHLW_REFERENCES.seishinGuideline,
        {
          label:
            "厚生労働省「年金証書等の写しによる精神障害者保健福祉手帳の障害等級の認定事務について」",
          href: "https://www.mhlw.go.jp/web/t_doc?dataId=00ta4623&dataType=1&pageNo=1",
        },
      ]}
    />
  );
}
