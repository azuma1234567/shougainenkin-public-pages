"use client";
/* 「この枠に収まりません」を入力画面でその場に出す(設計 §6-3)。
   印刷と同じフォント・同じ幅・同じ行送りで測る。縮小はしない。赤くしない。印刷も止めない。 */
import { useLayoutEffect, useRef, useState } from "react";
import { TEXT_DEFAULT_PT, TEXT_LINE_HEIGHT, type TextSlot } from "@/data/moushitatesho/layout";

/* 印刷側(.mt-slot-text)と同じ字面にする。ここを変えたら globals.css も変える。 */
const FONT = '"MS Mincho","MS 明朝","Yu Mincho","YuMincho","Hiragino Mincho ProN",serif';

export default function Capacity({ slot, text, fontPt, hint }: { slot: TextSlot; text: string; fontPt: number; hint?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [over, setOver] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let live = true;
    const measure = () => {
      if (!live || !el) return;
      const pt = Math.min(slot.pt ?? TEXT_DEFAULT_PT, fontPt);
      el.style.width = `${slot.w}mm`;
      el.style.height = `${slot.h}mm`;
      el.style.fontSize = `${pt}pt`;
      el.textContent = text;
      const lineH = (pt * TEXT_LINE_HEIGHT * 96) / 72;
      const extra = el.scrollHeight - el.clientHeight;
      setOver(extra > 1 ? Math.ceil(extra / lineH) : 0);
    };
    (document.fonts?.ready ?? Promise.resolve()).then(measure);
    measure();
    return () => { live = false; };
  }, [slot, text, fontPt]);

  return (
    <>
      <div ref={ref} aria-hidden="true" className="mt-capacity-probe"
        style={{ fontFamily: FONT, lineHeight: TEXT_LINE_HEIGHT, whiteSpace: "pre-wrap", wordBreak: "break-all", lineBreak: "strict" }} />
      {over > 0 && (
        <p className="mt-capacity" role="status">
          この枠に収まりません（あと{over}行ぶん）。{hint ?? "文字を小さめ（9pt）にすると収まることがあります。"}
        </p>
      )}
    </>
  );
}
