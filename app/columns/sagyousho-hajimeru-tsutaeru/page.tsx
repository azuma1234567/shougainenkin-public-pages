import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead } from "@/content/columns/sagyousho-hajimeru-tsutaeru";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("sagyousho-hajimeru-tsutaeru"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      relatedSlugs={[
        "shindansho-shurojokyo",
        "kougin-nenkin-tedori",
        "sagyousho-kayoenai",
        "shinsatsu-mae-memo",
        "muryou-soudan-psw",
      ]}
      references={[
        {
          label: "厚生労働省「精神の障害に係る等級判定ガイドライン」",
          href: "https://www.mhlw.go.jp/file/04-Houdouhappyou-12512000-Nenkinkyoku-Jigyoukanrika/0000130045.pdf",
        },
        {
          label: "厚生労働省「障害年金の診断書(精神の障害用)記載要領」",
          href: "https://www.mhlw.go.jp/file/04-Houdouhappyou-12512000-Nenkinkyoku-Jigyoukanrika/0000130048.pdf",
        },
        {
          label: "厚生労働省「障害福祉サービス等」",
          href: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/shougaishahukushi/service/index.html",
        },
      ]}
    />
  );
}
