import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/hikazei-shuunyuu";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("hikazei-shuunyuu"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "jukyuugo-tetsuduki",
        "ikura-moraeru",
        "koushin-kakuninhodo",
        "gaku-kaitei-seikyuu",
      ]}
      references={[
        {
          label:
            "日本年金機構「障害年金や遺族年金を受けている人にも公的年金等の源泉徴収票は送付されるのでしょうか。」",
          href: "https://www.nenkin.go.jp/section/faq/jukyu/uketori/tsuchisho/gensen/20140421-05.html",
        },
        {
          label:
            "日本年金機構「従業員が家族を被扶養者にするとき、被扶養者に異動があったときの手続き」",
          href: "https://www.nenkin.go.jp/service/kounen/tekiyo/hihokensha1/20141202.html",
        },
        {
          label: "日本年金機構「障害年金生活者支援給付金の概要」",
          href: "https://www.nenkin.go.jp/service/jukyu/seido/sonota-kyufu/shienkyufukin/syougai.html",
        },
        {
          label:
            "日本年金機構「20歳前の傷病による障害基礎年金にかかる支給制限等」",
          href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20200805.html",
        },
      ]}
    />
  );
}
