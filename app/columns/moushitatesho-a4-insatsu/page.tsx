import type { Metadata } from "next";
import ColumnArticlePage from "@/components/ColumnArticlePage";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import { getColumnContent } from "@/lib/column-content";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("moushitatesho-a4-insatsu");
const markdown = getColumnContent(column.slug);

export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticlePage
      column={column}
      markdown={markdown}
      ctaHeading="入力から印刷プレビューまで、アプリで"
      ctaBody="質問に答えて入力した内容が、申立書の様式に沿ったPDFになるアプリを作りました。自宅のA4プリンタでもコンビニでも、そのまま印刷できます。ログイン不要・記録は端末の中だけ。基本機能は無料です。"
      relatedSlugs={[
        "moushitatesho-kakikata",
        "shinsatsu-mae-memo",
        "shinsei-nagare",
      ]}
      references={[
        NENKIN_REFERENCES.moushitatesho,
        NENKIN_REFERENCES.seido,
      ]}
    />
  );
}
