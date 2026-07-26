import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource, {
  faqs,
} from "@/content/columns/moushitatesho-mijushin-kikan";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("moushitatesho-mijushin-kikan");
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "moushitatesho-kikan-kugiri",
        "moushitatesho-kakikata",
        "sokyuu-seikyuu",
      ]}
      references={[
        NENKIN_REFERENCES.moushitatesho,
        NENKIN_REFERENCES.seido,
      ]}
    />
  );
}
