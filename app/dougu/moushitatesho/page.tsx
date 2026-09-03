import type { Metadata } from "next";
import MoushitateshoTool from "@/components/tools/MoushitateshoTool";
import { PageDate } from "@/components/platform/Platform";
import { pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";

const UPDATED = "2026-09-03";
const isPublished = isPublishedInternalPath("/dougu/moushitatesho");
export const metadata:Metadata={
  ...pageMetadata({title:"病歴・就労状況等申立書をつくる",description:"入力内容をサーバーへ送らず、ブラウザの中だけで申立書の下書きを作成します。",path:"/dougu/moushitatesho"}),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};
export default function Page(){return <div className="platform mt-page"><MoushitateshoTool/><div className="mt-tool no-print"><PageDate updated={UPDATED} /></div></div>}
