"use client";
/* 表示の計測(docs/claude-code-sharoushi-list-2026-09-16-instructions.md §5)。
   一覧・都道府県は sharoushi_list_view、事務所ページは sharoushi_profile_view を1回だけ送る。何も描かない。 */
import { useEffect } from "react";
import { trackListView, trackProfileView } from "@/lib/sharoushi-track";

export default function TrackView({ pref, officeId }: { pref: string; officeId?: string }) {
  useEffect(() => {
    /* Analytics(フッター)の effect で window.gtag の待ち行列ができるのは、この effect より後。
       同じティックで送ると落ちるので、1ティック遅らせる。 */
    const timer = window.setTimeout(() => {
      if (officeId) trackProfileView(officeId, pref);
      else trackListView(pref);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pref, officeId]);
  return null;
}
