import { getColumn } from "@/lib/columns";
import { OG_CONTENT_TYPE, OG_SIZE, columnOgImage } from "@/lib/column-og";

const column = getColumn("shindansho-tanomikata");

export const alt =
  "障害年金の診断書を主治医にどう頼む? — 切り出し方と依頼メモ";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpenGraphImage() {
  return columnOgImage(column.title);
}
