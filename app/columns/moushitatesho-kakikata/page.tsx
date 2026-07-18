import type { Metadata } from "next";
import ColumnArticlePage from "@/components/ColumnArticlePage";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import { getColumnContent } from "@/lib/column-content";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("moushitatesho-kakikata");
const markdown = getColumnContent(column.slug);

export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticlePage
      column={column}
      markdown={markdown}
      ctaHeading="この記事の書き方を、質問に答えるだけで"
      ctaBody="期間の枠づくりから4要素の入力、文章の整形、印刷まで、この記事の手順をそのまま進められるアプリを作りました。ログイン不要・記録は端末の中だけ。基本機能は無料です。"
      relatedSlugs={[
        "moushitatesho-a4-insatsu",
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
