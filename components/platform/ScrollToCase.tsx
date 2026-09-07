"use client";
/* /jitsurei?case=<id>: サーバーが該当事案のページを描いたあと、クライアントで #<id> へスクロールする。
   アンカーは既存の <div id={item.id}> をそのまま使う。送信も保存もしない。 */
import { useEffect } from "react";

export default function ScrollToCase({ id }: { id: string }) {
  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;
    /* ヘッダーが sticky なので、その高さぶん下げて止める(隠れないように) */
    const header = document.querySelector("header.site-header");
    el.style.scrollMarginTop = `${(header?.getBoundingClientRect().height ?? 0) + 8}px`;
    el.scrollIntoView({ block: "start" });
  }, [id]);
  return null;
}
