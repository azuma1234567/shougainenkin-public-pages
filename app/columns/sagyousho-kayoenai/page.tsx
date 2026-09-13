import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/sagyousho-kayoenai";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("sagyousho-kayoenai"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "sagyousho-hajimeru-tsutaeru",
        "kougin-nenkin-tedori",
        "gaku-kaitei-seikyuu",
        "koushin-hatarakinagara",
        "shikyuu-teishi-fukkatsu",
      ]}
      references={[
        {
          label: "ハローワーク「基本手当の所定給付日数」",
          href: "https://www.hellowork.mhlw.go.jp/insurance/insurance_benefitdays.html",
        },
        {
          label: "厚生労働省「障害年金の診断書(精神の障害用)記載要領」",
          href: "https://www.mhlw.go.jp/file/04-Houdouhappyou-12512000-Nenkinkyoku-Jigyoukanrika/0000130048.pdf",
        },
        {
          label: "日本年金機構「障害の程度が変わったとき」",
          href: "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/jukyu/20140421-24.html",
        },
      ]}
    />
  );
}
