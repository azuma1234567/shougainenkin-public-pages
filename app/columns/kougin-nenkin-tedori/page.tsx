import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead } from "@/content/columns/kougin-nenkin-tedori";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("kougin-nenkin-tedori"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      relatedSlugs={[
        "sagyousho-hajimeru-tsutaeru",
        "sagyousho-kayoenai",
        "hikazei-shuunyuu",
        "ikura-moraeru",
        "jukyuugo-tetsuduki",
      ]}
      references={[
        {
          label: "厚生労働省「令和6年度 工賃(賃金)の実績について」",
          href: "https://www.mhlw.go.jp/content/12200000/001637154.pdf",
        },
        {
          label: "厚生労働省「障害者の利用者負担」",
          href: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/shougaishahukushi/service/hutan1.html",
        },
        {
          label: "厚生労働省「年金生活者支援給付金制度について」",
          href: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000143356_00002.html",
        },
      ]}
    />
  );
}
