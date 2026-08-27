import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { faqs } from "@/content/columns/jukyuugo-tetsuduki";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("jukyuugo-tetsuduki");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "hikazei-shuunyuu",
        "koushin-kakuninhodo",
        "ikura-moraeru",
        "hatachi-mae",
      ]}
      references={[
        {
          label: "日本年金機構「障害年金生活者支援給付金の概要」",
          href: "https://www.nenkin.go.jp/service/jukyu/seido/sonota-kyufu/shienkyufukin/syougai.html",
        },
        {
          label: "日本年金機構「国民年金保険料の法定免除制度」",
          href: "https://www.nenkin.go.jp/service/kokunen/menjo/20140710.html",
        },
        {
          label:
            "日本年金機構「20歳前の傷病による障害基礎年金にかかる支給制限等」",
          href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20200805.html",
        },
        {
          label:
            "厚生労働省「年金証書等の写しによる精神障害者保健福祉手帳の障害等級の認定事務について」",
          href: "https://www.mhlw.go.jp/web/t_doc?dataId=00ta4623&dataType=1&pageNo=1",
        },
      ]}
    />
  );
}
