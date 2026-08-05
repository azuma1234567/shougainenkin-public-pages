import { getColumn } from "@/lib/columns";
import { OG_CONTENT_TYPE, OG_SIZE, columnOgImage } from "@/lib/column-og";

const column = getColumn("teishutsusaki-yuusou");

export const alt =
  "障害年金の書類はどこに提出する? — 年金事務所・市役所・郵送";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpenGraphImage() {
  return columnOgImage(column.title);
}
