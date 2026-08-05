import { getColumn } from "@/lib/columns";
import { OG_CONTENT_TYPE, OG_SIZE, columnOgImage } from "@/lib/column-og";

const column = getColumn("kazoku-enjo-kakikata");

export const alt =
  "障害年金の申立書に家族の援助をどう書く? — 支援内容の具体例";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpenGraphImage() {
  return columnOgImage(column.title);
}
