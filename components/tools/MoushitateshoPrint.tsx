"use client";
/* /dougu/moushitatesho/insatsu。設計書 §8。
   プレビューと印刷は同じ DOM(components/tools/MoushitateshoSheet.tsx)。
   自動縮小はしない(§3-3)。収まらない欄は入力画面で知らせる(§6-3)。
   入力はサーバーへ送らない。fetch/XHR/sendBeacon/WebSocket を書かない。 */
import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sheet from "@/components/tools/MoushitateshoSheet";
import { FONT_SIZES } from "@/data/moushitatesho/layout";
import type { MoushitateshoState } from "@/data/moushitatesho/types";
import { loadMoushitatesho, normalize, saveMoushitatesho } from "@/lib/moushitatesho-storage";
import { planSheets } from "@/lib/moushitatesho-sheets";

type Format = "a4" | "a3";
const WINDOW_NAME_PREFIX = "moushitatesho:";

export default function MoushitateshoPrint() {
  const router = useRouter();
  const [state, setState] = useState<MoushitateshoState | null>(null);
  const [format, setFormat] = useState<Format>("a4");
  /* 紙に入りきらなかった欄。入力画面だけでなく、印刷の直前にも見せる(指示書2 §2)。 */
  const [tooLong, setTooLong] = useState<string[]>([]);

  useEffect(() => {
    let value: MoushitateshoState | null = null;
    if (window.name.startsWith(WINDOW_NAME_PREFIX)) {
      try { value = normalize(JSON.parse(window.name.slice(WINDOW_NAME_PREFIX.length))); } catch { value = null; }
    }
    value = value ?? loadMoushitatesho();
    if (!value) router.replace("/dougu/moushitatesho");
    else setState({ ...value, moushitateDate: value.moushitateDate || new Date().toISOString().slice(0, 10) });
  }, [router]);

  useLayoutEffect(() => {
    let live = true;
    const measure = () => {
      if (!live) return;
      const names = new Set<string>();
      document.querySelectorAll<HTMLElement>('.mt-slot-text').forEach((el) => {
        if (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) {
          names.add(el.dataset.field || "(名前のない欄)");
        }
      });
      /* 中身が同じなら state を触らない(毎レンダリング走るので、置き換えると無限ループになる) */
      const next = [...names];
      setTooLong((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next));
    };
    (document.fonts?.ready ?? Promise.resolve()).then(measure);
    measure();
    return () => { live = false; };
  });

  if (!state) return <p>入力画面へ戻ります…</p>;

  const plan = planSheets(state.waku);
  const setFont = (pt: (typeof FONT_SIZES)[number]) => {
    const next = { ...state, fontPt: pt };
    setState(next);
    saveMoushitatesho(next);
  };
  const missing = [
    !state.seikyuusha.name && "氏名", !state.seikyuusha.address && "現住所", !state.seikyuusha.tel && "電話番号",
  ].filter(Boolean) as string[];

  const sheets = [
    <Sheet key="mf" kind="main-front" state={state} no={1} total={plan.total} />,
    <Sheet key="mb" kind="main-back" state={state} no={1} total={plan.total} />,
    ...plan.conts.flatMap((c) => [
      <Sheet key={`cf${c.index}`} kind="cont-front" state={state} cont={c} no={c.index + 1} total={plan.total} />,
      /* 裏が空の続紙は裏を印刷しない(§7-1) */
      ...(c.back.length ? [<Sheet key={`cb${c.index}`} kind="cont-back" state={state} cont={c} no={c.index + 1} total={plan.total} />] : []),
    ]),
  ];

  return (
    <div className={`mt-print mt-format-${format}`}>
      <section className="no-print mt-print-controls">
        <Link href="/dougu/moushitatesho">入力に戻る</Link>
        <h1>印刷プレビュー</h1>
        <p className="mt-print-how">
          元号は○で囲み、年月日は数字で入ります。<br />
          記入していない欄は空欄のままです。
        </p>
        <fieldset>
          <legend>用紙</legend>
          <label><input type="radio" checked={format === "a4"} onChange={() => setFormat("a4")} />A4分割（家庭用プリンター）</label>
          <label><input type="radio" checked={format === "a3"} onChange={() => setFormat("a3")} />A3原寸</label>
        </fieldset>
        <fieldset>
          <legend>文字の大きさ</legend>
          <label><input type="radio" name="mt-font" checked={state.fontPt === 10.5} onChange={() => setFont(10.5)} />標準（10.5pt）</label>
          <label><input type="radio" name="mt-font" checked={state.fontPt === 9} onChange={() => setFont(9)} />小さめ（9pt）</label>
        </fieldset>
        <div className="mt-print-note">
          <p><strong>A3は倍率100%（等倍）</strong>にし、「用紙に合わせる」は選ばないでください。</p>
          <p>A4分割で提出できるかは、提出前に年金事務所へご確認ください。</p>
          <p>Chrome／Edgeは「その他の設定」、Safariは印刷設定で「ヘッダーとフッター」をオフにしてください。</p>
          <p>この紙は本紙1枚{plan.conts.length > 0 && `と続紙${plan.conts.length}枚`}です。{plan.total >= 2 ? `No. は 1 ― ${plan.total}枚中 から順に入ります。` : "1枚だけなので No. と枚中は空欄のままです（記載要領のとおり）。"}</p>
        </div>
        {tooLong.length > 0 && (
          <p className="mt-print-overflow">
            <strong>紙に入りきらなかった欄があります。</strong>
            {tooLong.join("・")}。入りきらない分は印刷されません。
            <Link href="/dougu/moushitatesho">入力に戻って</Link>期間を分けるか、上の「文字の大きさ」を小さめ（9pt）にしてください。
          </p>
        )}
        {missing.length > 0 && (
          <p className="mt-print-missing">請求者の{missing.join("・")}が未記入です。様式としては書いておく欄です（印刷は止めません）。</p>
        )}
        <button className="mt-primary" onClick={() => window.print()}>印刷画面を開く</button>
      </section>

      <div className="mt-preview-stage">
        {format === "a3" ? sheets : sheets.map((s, i) => <A4Split key={i}>{s}</A4Split>)}
      </div>
    </div>
  );
}

/* A4分割。A3の紙を上下half に割って2枚のA4に載せる(現行どおり)。 */
function A4Split({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mt-a4-half mt-half-top"><div>{children}</div></div>
      <div className="mt-a4-half mt-half-bottom"><div>{children}</div></div>
    </>
  );
}
