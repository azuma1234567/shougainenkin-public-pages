import type { Metadata } from "next";
import ColumnArticlePage from "@/components/ColumnArticlePage";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import { getColumnContent } from "@/lib/column-content";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("shinsatsu-mae-memo");
const markdown = getColumnContent(column.slug);

export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticlePage
      column={column}
      markdown={markdown}
      ctaHeading="今日の1〜2行が、先生に渡せる紙になる"
      ctaBody="その日あったことを短くメモすると、診断書の7項目に沿った『先生に渡せる資料』に整理されるアプリを作りました。そのまま申立書の下書きにもなります。ログイン不要・記録は端末の中だけ。基本機能は無料です。"
      relatedSlugs={[
        "moushitatesho-kakikata",
        "moushitatesho-a4-insatsu",
        "shinsei-nagare",
      ]}
      references={[NENKIN_REFERENCES.seido]}
    />
  );
}
