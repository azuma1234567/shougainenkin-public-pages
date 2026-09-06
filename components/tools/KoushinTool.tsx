"use client";
// /dougu/koushin の入力と結果。docs/dougu-2hon-2026-09-06-instructions.md §B。
// 見た目は KingakuTool と同じ部品・同じ CSS(kg-*)。計算は lib/koushin.ts(端末の日付だけ)。
// 入力内容はサーバーへ送らない。保存は任意で、この端末の localStorage だけ(lib/koushin-storage.ts)。
// .ics も端末の中で組み立てて保存するだけで、外部へは送らない。
import Link from "next/link";
import { useEffect, useState } from "react";
import { buildIcs, calcKoushin, emptyInput, formatJa, heiseiToYear, reiwaToYear, todayYmd, yearToWareki, type KoushinInput } from "@/lib/koushin";
import { clearKoushin, loadKoushin, saveKoushin } from "@/lib/koushin-storage";

type Era = "seireki" | "reiwa" | "heisei";

export default function KoushinTool() {
  const [s, setS] = useState<KoushinInput>(emptyInput());
  const [era, setEra] = useState<Era>("seireki");
  const [eraYear, setEraYear] = useState<string>("");
  const [today, setToday] = useState<string>("");
  const [saved, setSaved] = useState<"" | "saved" | "cleared" | "failed">("");
  useEffect(() => {
    setToday(todayYmd());
    const stored = loadKoushin();
    if (stored) { setS(stored); if (stored.year) setEraYear(String(stored.year)); }
  }, []);
  const patch = (p: Partial<KoushinInput>) => { setS((prev) => ({ ...prev, ...p })); setSaved(""); };

  const onYear = (value: string, nextEra: Era = era) => {
    setEraYear(value);
    const n = Number(value);
    if (value === "" || !Number.isInteger(n) || n <= 0) { patch({ year: null }); return; }
    patch({ year: nextEra === "reiwa" ? reiwaToYear(n) : nextEra === "heisei" ? heiseiToYear(n) : n });
  };
  const onEra = (next: Era) => { setEra(next); setEraYear(""); patch({ year: null }); };

  const r = calcKoushin({ ...s, today: s.today ?? (today || null) });
  const days = (n: number) => (n < 0 ? `${Math.abs(n)}日 過ぎています` : n === 0 ? "今日" : `あと${n}日`);

  const downloadIcs = () => {
    if (r.kind !== "dates") return;
    const blob = new Blob([buildIcs(r)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `koushin-${r.deadline}.ics`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <section className="kg-card" aria-labelledby="kg-input-heading">
        <h2 id="kg-input-heading">入力</h2>

        <p className="kg-f" id="kg-era-label">1. 年金証書の「次回診断書提出年月」</p>
        <div className="kg-chips" role="group" aria-labelledby="kg-era-label">
          {([["seireki", "西暦"], ["reiwa", "令和"], ["heisei", "平成"]] as const).map(([v, label]) => (
            <button type="button" key={v} aria-pressed={era === v} onClick={() => onEra(v)}>{label}</button>
          ))}
        </div>
        <div className={`kg-grid2${s.indefinite ? " kg-inactive" : ""}`}>
          <div>
            <label className="kg-f" htmlFor="kg-year">{era === "seireki" ? "年(西暦)" : era === "reiwa" ? "令和 何年" : "平成 何年"}</label>
            <input type="number" inputMode="numeric" min={1} step={1} id="kg-year" placeholder={era === "seireki" ? "例: 2027" : "例: 9"}
              value={eraYear} onChange={(e) => onYear(e.target.value)} disabled={s.indefinite} />
            {s.year !== null && era !== "seireki" && <p className="kg-hintline">西暦 {s.year}年</p>}
            {s.year !== null && era === "seireki" && <p className="kg-hintline">{yearToWareki(s.year)}</p>}
          </div>
          <div>
            <label className="kg-f" htmlFor="kg-month">月</label>
            <select id="kg-month" value={s.month ?? ""} onChange={(e) => patch({ month: e.target.value === "" ? null : Number(e.target.value) })} disabled={s.indefinite}>
              <option value="">選ぶ</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}月</option>)}
            </select>
          </div>
        </div>
        <p className="kg-hintline">
          <label><input type="checkbox" checked={s.indefinite} onChange={(e) => patch({ indefinite: e.target.checked })} /> 提出年月が書かれていない(無期限・永久認定)</label>
        </p>
        <p className="kg-hintline">年金証書の右のほう、または前回の更新のあとに届いた通知に書いてあります。誕生月と同じなので、誕生月は入力しなくて構いません。</p>

        <details className="kg-details">
          <summary>2. 任意: 今日の日付を変える</summary>
          <div className="kg-in">
            <label className="kg-f" htmlFor="kg-today">今日として計算する日</label>
            <input type="date" id="kg-today" value={s.today ?? today} onChange={(e) => patch({ today: e.target.value || null })} />
            <p className="kg-hintline">「もし来年の今日なら」を確かめるための欄です。既定はこの端末の今日です。</p>
          </div>
        </details>

        <div className="kg-chips">
          <button type="button" onClick={() => setSaved(saveKoushin(s) ? "saved" : "failed")}>この端末に保存する</button>
          <button type="button" onClick={() => { setS(emptyInput()); setEraYear(""); setSaved(clearKoushin() ? "cleared" : "failed"); }}>入力を消す</button>
          {r.kind === "dates" && <button type="button" onClick={downloadIcs}>カレンダーに入れる(.ics)</button>}
          <button type="button" onClick={() => window.print()}>結果を印刷する</button>
        </div>
        <p className="kg-hintline" aria-live="polite">
          {saved === "saved" && "この端末の中だけに保存しました。次に開いたときは、残り日数が更新されて出ます。"}
          {saved === "cleared" && "入力と保存を消しました。"}
          {saved === "failed" && "この端末では保存できませんでした(入力と結果はそのまま使えます)。"}
          {saved === "" && "保存は任意です。保存してもこの端末の中だけに残り、サーバーには送りません。"}
        </p>
      </section>

      <section className="kg-card" aria-labelledby="kg-result-heading">
        <h2 id="kg-result-heading">日付で見る、次の更新</h2>
        {r.kind === "empty" && <p className="kg-hintline">提出年月を入れると、日付が出ます。</p>}
        {r.kind === "indefinite" && (
          <div className="kg-note">
            提出年月が無い(永久認定)なら、更新はありません。状態が悪化したときは、額改定請求(等級を上げる請求)ができます。→ <Link href="/columns/gaku-kaitei-seikyuu">額改定請求</Link>
          </div>
        )}
        {r.kind === "dates" && (
          <>
            {r.past && (
              <p className="kg-warnbox">
                <b>この提出年月は過ぎています。</b>提出済みなら、次の通知の「次回診断書提出年月」を入れてください。未提出なら、支払いが一時止まることがあるので、すぐ年金事務所へ。
              </p>
            )}
            <div className="kg-big" aria-live="polite">
              <p className="kg-y">{days(r.daysToDeadline)}<small>提出期限 {formatJa(r.deadline)}</small></p>
              <p className="kg-m">
                <span>用紙が届く時期 <b>{formatJa(r.formSent)}(月末)</b> {r.daysToFormSent < 0 ? "届いているはずです。届いていなければ年金事務所へ" : days(r.daysToFormSent)}</span>
                <span>現症日として使える期間 <b>{formatJa(r.genshoStart)} 〜 {formatJa(r.deadline)}</b></span>
              </p>
            </div>
            <table className="kg-br">
              <tbody>
                <tr><th scope="row">提出期限<span className="kg-why">提出年月の末日</span></th><td className="kg-n">{formatJa(r.deadline)}</td></tr>
                <tr><th scope="row">用紙(障害状態確認届)が届く時期<span className="kg-why">提出年月の3か月前の月末</span></th><td className="kg-n">{formatJa(r.formSent)}</td></tr>
                <tr><th scope="row">診断書の現症日として使える期間<span className="kg-why">提出期限の3か月前の同日から</span></th><td className="kg-n">{formatJa(r.genshoStart)} 〜 {formatJa(r.deadline)}</td></tr>
                <tr><th scope="row">準備を始める日(目安)<span className="kg-why">提出年月の1年前の1日</span></th><td className="kg-n">{formatJa(r.prepStart)}{r.daysToPrep < 0 ? "(過ぎています。今日から始めてください)" : ""}</td></tr>
                <tr><th scope="row">今日として計算した日</th><td className="kg-n">{formatJa(r.today)}</td></tr>
              </tbody>
            </table>

            <h3>今日から、この順番で</h3>
            <table className="kg-br">
              <tbody>
                {r.steps.map((step) => (
                  <tr key={step.when}>
                    <th scope="row">{step.when}{step.date && <span className="kg-why">{formatJa(step.date)}{step.days !== null && `(${days(step.days)})`}</span>}</th>
                    <td className="kg-n">{step.what}{step.href && <> → <Link href={step.href}>{step.label}</Link></>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <p className="kg-warnbox">用紙の送付時期と提出期限は日本年金機構の公表に基づく計算です。届く時期は前後することがあります。用紙が届かない・提出年月が分からないときは、年金事務所で確認してください。</p>
      </section>
    </>
  );
}
