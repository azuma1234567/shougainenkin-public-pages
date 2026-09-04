import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, { lead, faqs } from "@/content/columns/nofu-yoken";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("nofu-yoken"), lead };
export const metadata: Metadata = columnMetadata(column);

// 記事末尾のQ&Aと同一の文字列。構造化データ(FAQPage)にも使う。
// 本文を正とし、ここは本文からそのまま写す。片方だけ直さないこと。


export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
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
