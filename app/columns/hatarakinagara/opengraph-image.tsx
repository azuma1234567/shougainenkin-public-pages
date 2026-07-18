import { getColumn } from "@/lib/columns";
import { OG_CONTENT_TYPE, OG_SIZE, columnOgImage } from "@/lib/column-og";

const column = getColumn("hatarakinagara");

export const alt = column.title;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpenGraphImage() {
  return columnOgImage(column.title);
}
