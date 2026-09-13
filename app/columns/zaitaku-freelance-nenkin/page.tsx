import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/zaitaku-freelance-nenkin";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("zaitaku-freelance-nenkin"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "hatachi-mae",
        "hikazei-shuunyuu",
        "shindansho-shurojokyo",
        "koushin-hatarakinagara",
        "nofu-yoken",
      ]}
      references={[
        {
          label: "日本年金機構「20歳前の傷病による障害基礎年金にかかる支給制限等」",
          href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20200805.html",
        },
        {
          label: "厚生労働省「障害年金の診断書(精神の障害用)記載要領」",
          href: "https://www.mhlw.go.jp/file/04-Houdouhappyou-12512000-Nenkinkyoku-Jigyoukanrika/0000130048.pdf",
        },
        {
          label: "全国健康保険協会「用語集」(被扶養者)",
          href: "https://www.kyoukaikenpo.or.jp/glossary/",
        },
      ]}
    />
  );
}
