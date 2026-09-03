import type { Metadata } from "next";
import Link from "next/link";
import MoushitateshoTool from "@/components/tools/MoushitateshoTool";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import { pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";

const UPDATED = "2026-09-03";
const isPublished = isPublishedInternalPath("/dougu/moushitatesho");
export const metadata:Metadata={
  ...pageMetadata({title:"病歴・就労状況等申立書をつくる",description:"入力内容をサーバーへ送らず、ブラウザの中だけで申立書の下書きを作成します。",path:"/dougu/moushitatesho"}),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};
export default function Page(){return <div className="platform mt-page"><div className="mt-tool no-print"><Breadcrumb items={[{ href: "/", label: "トップ" }, { href: "/shinsei", label: "申請の流れ" }, { label: "申立書をつくる" }]} currentPath="/dougu/moushitatesho" /></div><MoushitateshoTool/><div className="mt-tool no-print"><p><Link href="/shinsei">申請の流れへ戻る</Link></p><PageDate updated={UPDATED} /></div></div>}
