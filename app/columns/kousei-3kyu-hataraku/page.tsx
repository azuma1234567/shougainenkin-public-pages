import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead } from "@/content/columns/kousei-3kyu-hataraku";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("kousei-3kyu-hataraku"), lead };
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      relatedSlugs={[
        "kiso-kousei-chigai",
        "gaku-kaitei-seikyuu",
        "shikyuu-teishi-fukkatsu",
        "koushin-hatarakinagara",
        "techou-to-nenkin",
      ]}
      references={[
        {
          label: "日本年金機構「障害厚生年金の受給要件・請求時期・年金額」",
          href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20150401-02.html",
        },
        {
          label: "日本年金機構「障害基礎年金の受給要件・請求時期・年金額」",
          href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20150514.html",
        },
        {
          label: "日本年金機構「障害の程度が変わったとき」",
          href: "https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/jukyu/20140421-24.html",
        },
      ]}
    />
  );
}
