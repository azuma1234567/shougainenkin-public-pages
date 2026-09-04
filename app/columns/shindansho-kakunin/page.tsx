import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { MHLW_REFERENCES, NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, { lead, faqs } from "@/content/columns/shindansho-kakunin";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("shindansho-kakunin"), lead };
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
