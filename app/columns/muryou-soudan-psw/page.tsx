import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/muryou-soudan-psw";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("muryou-soudan-psw"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "sharoushi-kawaranai-koto",
        "nenkin-jimusho-soudan",
        "jibun-de-shinsei",
        "sagyousho-hajimeru-tsutaeru",
        "shinsei-shindoi",
      ]}
      references={[
        {
          label: "日本年金機構「予約相談について」",
          href: "https://www.nenkin.go.jp/section/guidance/yoyaku.html",
        },
        {
          label: "厚生労働省「障害福祉サービスの内容」",
          href: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/shougaishahukushi/service/naiyou.html",
        },
        {
          label: "日本年金機構「病歴・就労状況等申立書を提出するとき」",
          href: "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/20140516.html",
        },
      ]}
    />
  );
}
