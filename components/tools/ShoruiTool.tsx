"use client";
/* /dougu/shorui。docs/shorui-tool-design-2026-09-02.md と
   docs/site-mock-2026-09-02-tools/Shorui.html が見た目とロジックの正。
   分岐は data/shorui.ts の when(モックのまま)。文書料の金額と待ち日数は書かない。
   入力はサーバーへ送らず、この端末のチェック状態だけを localStorage に置く。 */
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  SHORUI_ASK, SHORUI_MOCHIMONO, SHORUI_QUESTIONS, emptyShoruiAnswers,
  type ShoruiAnswers, type ShoruiDoc,
} from "@/data/shorui";
import {
  clearShoruiChecks, feeText, loadShoruiChecks, saveShoruiChecks, seikyuushoForms,
  shindanshoForms, shoruiDocs, shoruiSections, showKokuminHaiguNote, showSokyuuNote, waitText,
} from "@/lib/shorui";

export default function ShoruiTool() {
  const [s, setS] = useState<ShoruiAnswers>(emptyShoruiAnswers);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [shared, setShared] = useState(false);
  const [saveNote, setSaveNote] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => { setChecks(loadShoruiChecks()); }, []);
  useEffect(() => {
    if (shared) return;
    const t = setTimeout(() => { setSaveNote(saveShoruiChecks(checks) ? "" : "この端末に保存できませんでした。チェックは画面の中だけで動きます。"); }, 300);
    return () => clearTimeout(t);
  }, [checks, shared]);

  const pick = (id: keyof ShoruiAnswers, v: string, multi?: boolean) => setS((prev) => {
    if (!multi) return { ...prev, [id]: prev[id] === v ? undefined : v };
    const cur = prev.kazoku;
    /* 「どちらもいない」と他は同時に選べない(モックのまま) */
    if (v === "nashi") return { ...prev, kazoku: cur.includes("nashi") ? [] : ["nashi"] };
    const rest = cur.filter((x) => x !== "nashi");
    return { ...prev, kazoku: rest.includes(v) ? rest.filter((x) => x !== v) : [...rest, v] };
  });

  const docs = shoruiDocs(s);
  const sections = shoruiSections(docs);
  const forms = shindanshoForms(s);
  const seikyuusho = seikyuushoForms(s);
  const toggle = (key: string) => setChecks((c) => ({ ...c, [key]: !c[key] }));

  return (
    <>
      <section className="sr-card no-print" aria-labelledby="sr-q">
        <h2 id="sr-q">質問</h2>
        {SHORUI_QUESTIONS.map((q) => (
          <div className="sr-q" key={q.id}>
            <p className="sr-t" id={`sr-q-${q.id}`}>{q.t}</p>
            <div className="sr-chips" role="group" aria-labelledby={`sr-q-${q.id}`}>
              {q.o.map(([v, label]) => {
                const on = q.multi ? s.kazoku.includes(v) : s[q.id] === v;
                return <button type="button" key={v} aria-pressed={on} onClick={() => pick(q.id, v, q.multi)}>{label}</button>;
              })}
            </div>
          </div>
        ))}
        <div className="sr-row">
          <button type="button" className="sr-btn sr-ghost sr-sm" onClick={() => setS(emptyShoruiAnswers())}>選び直す</button>
        </div>
      </section>

      <section className="sr-card" aria-labelledby="sr-docs">
        <h2 id="sr-docs">そろえる書類</h2>
        <p className="sr-note no-print"><strong>チェックはこの端末に保存されます。</strong>集め終わったものに印をつけながら進めてください。</p>
        {saveNote && <p className="sr-warnbox no-print" role="status">{saveNote}</p>}

        {sections.map(({ sec, docs: list }) => (
          <div key={sec}>
            <p className="sr-sec">{sec}</p>
            {list.map((d) => (
              <DocRow key={d.id} d={d} checked={!!checks[`c-${d.id}`]} onToggle={() => toggle(`c-${d.id}`)}
                extra={d.id === "seikyuusho" ? seikyuusho : d.id === "shindansho" ? forms : []} />
            ))}
          </div>
        ))}

        {showKokuminHaiguNote(s) && (
          <p className="sr-warnbox sr-mt"><b>配偶者の加算はつきません。</b>配偶者の加算があるのは障害厚生年金の1級・2級だけです。障害基礎年金にあるのは子の加算です。ただし窓口で書類を求められる場合があります。</p>
        )}
        {showSokyuuNote(s) && (
          <p className="sr-note sr-mt"><strong>診断書が2通になります。</strong>障害認定日ころのものと、現在のもの。当時の病院にカルテが残っているかを、先に電話で確かめてください。</p>
        )}

        <p className="sr-warnbox sr-mt2">
          <b>これで全部とは限りません。</b>制度は変わりますし、事情によって窓口で追加を求められることがあります。<b>最後は年金事務所で確認してください。</b>
        </p>
      </section>

      <section className="sr-card" aria-labelledby="sr-mochi">
        <h2 id="sr-mochi">年金事務所へ行く日の持ち物</h2>
        {SHORUI_MOCHIMONO.map((m, i) => (
          <label className="sr-doc" key={m}>
            <input type="checkbox" checked={!!checks[`m-${i}`]} onChange={() => toggle(`m-${i}`)} />
            <span className="sr-box" aria-hidden="true" />
            <span className="sr-b"><span className="sr-n sr-plain">{m}</span></span>
          </label>
        ))}
      </section>

      <section className="sr-card" aria-labelledby="sr-ask">
        <h2 id="sr-ask">窓口で聞くこと</h2>
        <ul className="sr-ask">
          {SHORUI_ASK.map((a) => <li key={a.text}>{a.strong ? <b>{a.text}</b> : a.text}</li>)}
        </ul>
        <div className="sr-row no-print">
          <button type="button" className="sr-btn" onClick={() => window.print()}>この1枚を印刷する</button>
          <button type="button" className="sr-opt-btn" aria-pressed={shared}
            onClick={() => { const next = !shared; setShared(next); if (next) { clearShoruiChecks(); setSaveNote(""); } }}>
            共用のパソコンを使っています(この端末に保存しない)
          </button>
          {!confirmClear
            ? <button type="button" className="sr-btn sr-ghost sr-sm" onClick={() => setConfirmClear(true)}>この端末から消す</button>
            : <span className="sr-confirm">チェックを消しますか。{" "}
                <button type="button" className="sr-link" onClick={() => { clearShoruiChecks(); setChecks({}); setConfirmClear(false); }}>消す</button>{" ／ "}
                <button type="button" className="sr-link" onClick={() => setConfirmClear(false)}>やめる</button>
              </span>}
        </div>
      </section>

      <section className="sr-card no-print" aria-labelledby="sr-next">
        <h2 id="sr-next">ここからできること</h2>
        <div className="dougu-cross">
          <Link className="dougu-band-card" href="/dougu/madoguchi"><b>年金事務所を探す</b><span>出す前に行き先を確かめる。管轄の窓口と予約のしかたを出します</span></Link>
          <Link className="dougu-band-card" href="/dougu/moushitatesho"><b>申立書をつくる</b><span>いちばん重い書類を、フォームに沿って書きます</span></Link>
        </div>
      </section>
    </>
  );
}

function DocRow({ d, checked, onToggle, extra }: { d: ShoruiDoc; checked: boolean; onToggle: () => void; extra: { name: string; url: string }[] }) {
  const meta = [d.where, feeText(d.fee), waitText(d.wait)].filter(Boolean);
  return (
    <div className="sr-doc">
      <input type="checkbox" id={`c-${d.id}`} checked={checked} onChange={onToggle} aria-label={`${d.n} をそろえた`} />
      <span className="sr-box" aria-hidden="true" />
      <div className="sr-b">
        <label className="sr-n" htmlFor={`c-${d.id}`}>
          {d.n}
          {d.why && <span className="sr-why">{d.why}</span>}
        </label>
        <span className="sr-links no-print">
          {d.url && !extra.length && <a href={d.url} rel="noreferrer">様式(機構)</a>}
          {d.tool && <Link href={d.tool[1]} prefetch={false}>{d.tool[0]}</Link>}
        </span>
        {meta.length > 0 && <p className="sr-meta">{meta.map((m) => <span key={m}>{m}</span>)}</p>}
        {d.stuck && <p className="sr-stuck">{d.stuck}</p>}
        {extra.length > 0 && (
          <p className="sr-forms">
            {extra.map((f) => (
              <span key={f.url}>
                {f.name}
                <a className="no-print" href={f.url} rel="noreferrer">様式(機構)</a>
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
