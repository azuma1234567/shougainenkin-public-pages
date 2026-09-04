import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { MHLW_REFERENCES, NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, { lead, faqs } from "@/content/columns/techou-to-nenkin";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("techou-to-nenkin"), lead };
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
