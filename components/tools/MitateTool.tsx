"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DouguCards } from "@/components/platform/DouguCard";
import { TOOLS } from "@/data/dougu";
import { MITATE_ABILITY_ITEMS, MITATE_AVERAGE_BANDS, MITATE_DEGREE_CHOICES, MITATE_GRADE_TABLE, MITATE_GUIDE_AUTO, MITATE_SOURCE, type MitateAbilityValue, type MitateDegree, type MitateGuideItem, type MitateKind } from "@/data/mitate";
import { emptyMitateState, hasBias, isNearBoundary, mitateAverage, mitateBandLabel, mitateGuideHits, mitateGuideSet, mitateLookup, type MitateState } from "@/lib/mitate";
import { saveMitate } from "@/lib/mitate-storage";
import { stats } from "@/lib/stats";

const QUESTIONS = [
  ["食事は、自分で用意して食べられていますか", "適切な食事"],
  ["入浴や着替え、洗濯は、自分でできていますか", "身辺の清潔保持"],
  ["お金の管理と買い物は、自分でできていますか", "金銭管理と買い物"],
  ["通院と薬は、自分で続けられていますか", "通院と服薬"],
  ["人と話したり、用件を伝えたりできていますか", "他人との意思伝達及び対人関係"],
  ["危ないことを避けたり、困ったときに助けを求めたりできますか", "身辺の安全保持及び危機対応"],
  ["役所や銀行の手続き、近所づきあいなどはできていますか", "社会性"],
] as const;

const ABILITY_CHOICES: { value: MitateAbilityValue; plain: string; formal: string }[] = [
  { value: 1, plain: "ひとりでできる", formal: "できる" },
  { value: 2, plain: "だいたいできるが、ときどき助言や手助けがいる", formal: "おおむねできるが時には助言や指導を必要とする" },
  { value: 3, plain: "助言や手助けがあればできる", formal: "助言や指導があればできる" },
  { value: 4, plain: "助言や手助けがあっても、できない・しない", formal: "助言や指導をしてもできない若しくは行わない" },
];

const DEGREE_PLAIN = [
  "病気はあるが、社会生活はふつうにできている",
  "家の中のことはできるが、外の社会生活には手助けがいる",
  "家の中の簡単なことはできるが、ときどき手助けがいる",
  "身のまわりのことにも、多くの手助けがいる",
  "身のまわりのことがほとんどできず、いつも手助けがいる",
] as const;

const DIAGNOSES: { label: string; kind?: MitateKind }[] = [
  { label: "うつ病・双極性障害", kind: "seishin" }, { label: "不安障害・適応障害", kind: "seishin" },
  { label: "統合失調症", kind: "seishin" }, { label: "発達障害", kind: "hattatsu" },
  { label: "知的障害", kind: "chiteki" }, { label: "その他・わからない" },
];

/* 診断書(精神の障害用)様式第120号の4 記載要領: 判断にあたっては、単身で生活するとしたら可能かどうかで判断する。 */
const PREMISE_LINE = "ひとりで暮らすとしたら、を前提に。家族がしてくれていることは「できる」に入れません。";

/* children = page.tsx の静的な本文。入口(step 0)のときだけ道具の下に描く(SSR は step 0 なので HTML に載る)。 */
export default function MitateTool({ children }: { children?: React.ReactNode }) {
  const [state, setState] = useState<MitateState>(emptyMitateState);
  const [step, setStep] = useState(0);
  const [shindansho, setShindansho] = useState(false);
  /* 結果の「答えの一覧」から1問だけ戻ったとき true。選び直すと結果へ直行する。 */
  const [revisit, setRevisit] = useState(false);

  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("mode") === "shindansho";
    setShindansho(selected);
    setState((current) => ({ ...current, mode: selected ? "A" : "B" }));
  }, []);

  const patch = (next: Partial<MitateState>) => setState((current) => ({ ...current, ...next }));
  const move = (next: number) => { setStep(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const back = (to: number) => { setRevisit(false); move(to); };

  if (step === 0) return <>
    <section className="mi-intro" aria-labelledby="mi-intro-title">
      <h1 id="mi-intro-title">等級の目安をしらべる</h1>
      {shindansho ? <p className="mi-shindansho-lead">診断書の裏面の欄を、そのまま写してください</p> : <p className="mi-big-line">「私は、障害年金の対象になるのかな」と思ったら、3分で。</p>}
      <p>精神の障害の審査では、国が公表している「等級判定ガイドライン」の目安表が使われます。<br />診断書に書かれる、毎日の生活の7つの項目と、全体の程度の組み合わせで、目安が決まります。<br />ここでは、その表に、いまの毎日を当てはめてみます。</p>
      <div className="mi-assurances" aria-label="この機能について"><span>約3分</span><span>判定ではありません</span><span>入力はこの端末の中だけ。送信も保存もしません</span></div>
      <div className="mi-start-row"><button type="button" className="mi-start" onClick={() => move(1)}>はじめる</button>{!shindansho && <Link className="mi-start mi-start-alt" href="?mode=shindansho">診断書を持っている</Link>}</div>
    </section>
    {children}
  </>;

  if (step >= 1 && step <= 7) {
    const index = step - 1, item = MITATE_ABILITY_ITEMS[index], [plainQuestion, formalQuestion] = QUESTIONS[index];
    const next = () => { if (revisit) { setRevisit(false); move(10); } else move(step === 7 ? 8 : step + 1); };
    return <QuestionShell progress={`${step}/8`} onBack={() => back(step - 1)}>
      {step === 1 && <p className="mi-one-line">調子のいい日ではなく、ふつうの日を思い浮かべて答えてください。</p>}
      <h2 className="mi-question">{plainQuestion}</h2><p className="mi-formal-name">{formalQuestion}</p>
      {!shindansho && <p className="mi-premise">{PREMISE_LINE}</p>}
      <div className={`mi-answer-list ${shindansho ? "is-shindansho" : ""}`} role="group" aria-label={plainQuestion}>{ABILITY_CHOICES.map((choice) => <button type="button" key={choice.value} onClick={() => { patch({ ability: { ...state.ability, [item.id]: choice.value } }); next(); }}><strong>{shindansho ? choice.formal : choice.plain}</strong><small>{shindansho ? choice.plain : choice.formal}</small></button>)}</div>
      <button type="button" className="mi-quiet-action" onClick={() => { const ability = { ...state.ability }; delete ability[item.id]; patch({ ability }); next(); }}>わからない・答えたくない</button>
    </QuestionShell>;
  }

  if (step === 8) return <QuestionShell progress="8/8" onBack={() => back(7)}>
    <h2 className="mi-question">全体として、いまの生活はどれに近いですか</h2>
    <div className={`mi-answer-list ${shindansho ? "is-shindansho" : ""}`} role="group" aria-label="全体として、いまの生活はどれに近いですか">{MITATE_DEGREE_CHOICES.map((choice, index) => <button type="button" key={choice.value} onClick={() => { patch({ degree: choice.value as MitateDegree }); move(9); }}><strong>{shindansho ? choice.label : DEGREE_PLAIN[index]}</strong><small>{shindansho ? DEGREE_PLAIN[index] : choice.label}</small></button>)}</div>
  </QuestionShell>;

  if (step === 9) return <QuestionShell onBack={() => back(8)}>
    <h2 className="mi-question">診断名に近いものはありますか</h2><p className="mi-formal-name">ガイドラインが、診断名ごとに見るところを出すために使います</p>
    <div className="mi-answer-list mi-diagnoses" role="group" aria-label="診断名に近いものはありますか">{DIAGNOSES.map((choice) => <button type="button" key={choice.label} onClick={() => { patch({ kind: choice.kind }); move(10); }}><strong>{choice.label}</strong></button>)}</div>
    <button type="button" className="mi-skip-large" onClick={() => { patch({ kind: undefined }); move(10); }}>飛ばす</button>
  </QuestionShell>;

  return <Result state={state} shindansho={shindansho} onRevisit={(index) => { setRevisit(true); move(index + 1); }} onGuide={(id, on) => { const guide = { ...state.guide }; if (on) guide[id] = true; else delete guide[id]; patch({ guide }); }} />;
}

function QuestionShell({ progress, onBack, children }: { progress?: string; onBack: () => void; children: React.ReactNode }) {
  return <section className="mi-question-screen">{progress && <><div className="mi-progress"><span style={{ width: `${(Number(progress.split("/")[0]) / 8) * 100}%` }} /></div><p className="mi-progress-text">{progress}</p></>}<button type="button" className="mi-back" onClick={onBack}>戻る</button>{children}</section>;
}

/* 表の行の区切り(min)のうち、平均にいちばん近いもの。 */
function nearestBoundary(average: number): number {
  return MITATE_AVERAGE_BANDS.map((b) => b.min).filter((min) => min > 0)
    .reduce((best, min) => (Math.abs(average - min) < Math.abs(average - best) ? min : best));
}

function Result({ state, shindansho, onRevisit, onGuide }: { state: MitateState; shindansho: boolean; onRevisit: (index: number) => void; onGuide: (id: string, on: boolean) => void }) {
  const [saved, setSaved] = useState(false), [withGrade, setWithGrade] = useState(false);
  const average = mitateAverage(state), lookup = mitateLookup(state), band = lookup.kind === "none" ? null : lookup.band;
  /* 共通8 + 診断名別。診断名を飛ばしたら共通8だけ(mitateGuideSet は kind 未指定を精神として扱うので、ここで絞る)。 */
  const guides = state.kind ? mitateGuideSet(state.kind) : mitateGuideSet(state.kind).filter((g) => /^g\d/.test(g.id));
  const autoGuides = [...(lookup.kind === "blank" ? [MITATE_GUIDE_AUTO.gap] : []), ...(hasBias(state) ? [MITATE_GUIDE_AUTO.bias] : [])];
  const pressed = guides.filter((g) => state.guide[g.id]);
  const hits = mitateGuideHits(state, lookup);
  const rejectedPct = stats.nintei["精神障害・不支給事案"]["上記2区分の合計"]["割合"].value;
  const heading = lookup.kind === "found" ? `国の目安表では、この組み合わせは「${lookup.grade}」のところにあります。` : lookup.kind === "blank" ? "国の目安表では、この組み合わせに目安が定められていません。" : "国の目安表に当てはめるには、7項目の回答と全体の程度が必要です。";
  const avg = average.value, unanswered = average.total - average.answered;
  return <div className="mi-result">
    <section className="mi-result-heading"><h2>{heading}</h2><p>これは等級の判定ではありません。判定するのは国で、材料は医師が書く診断書と、働き方や生活の実態です。</p></section>
    <section className="mi-result-section"><h3>7項目に、こう答えました</h3>
      <div className="mi-answers" role="table" aria-label="7項目に、こう答えました">
        <div className="mi-answers-head" role="row"><span role="columnheader">項目</span><span role="columnheader">答え</span><span role="columnheader">数値</span></div>
        {MITATE_ABILITY_ITEMS.map((item, index) => { const value = state.ability[item.id], choice = ABILITY_CHOICES.find((c) => c.value === value); return <button type="button" key={item.id} className="mi-answer-row" role="row" onClick={() => onRevisit(index)} aria-label={`${item.label}: ${choice ? choice.plain : "答えていない"}。この質問へ戻る`}><span role="cell">{item.label}</span><span role="cell">{choice ? (shindansho ? choice.formal : choice.plain) : "—"}</span><span role="cell">{value ?? "—"}</span></button>; })}
      </div>
      <p className="mi-answers-hint">行を押すと、その質問へ戻って選び直せます。</p>
      {avg !== null && <p className="mi-result-number">7項目の平均 {avg.toFixed(2)}(表の行「{mitateBandLabel(avg)}」)× 全体の程度({state.degree ?? "—"})</p>}
      {avg !== null && unanswered > 0 && <p className="mi-answers-note">答えなかった項目が {unanswered} つ。答えた {average.answered} 項目の平均で当てはめています。診断書では7項目すべてに記入されます。</p>}
      {avg !== null && isNearBoundary(avg) && <p className="mi-answers-note">平均 {avg.toFixed(2)} は、表の行の区切り({nearestBoundary(avg).toFixed(1)}) に近い位置です。1項目の答えが1段階変わると、行が変わります。</p>}
    </section>
    <section className="mi-result-section"><h3>答えは、表のここ</h3><p>行が7項目の平均、列が全体の程度です</p><div className="mi-tbl-scroll"><table className="mi-gt"><thead><tr><th>判定平均</th>{[1,2,3,4,5].map((degree) => <th key={degree}>程度({degree})</th>)}</tr></thead><tbody>{MITATE_AVERAGE_BANDS.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{[1,2,3,4,5].map((degree) => { const value = MITATE_GRADE_TABLE[row.label][degree - 1], hit = row.label === band && degree === state.degree; return <td key={degree} className={hit ? "mi-hit" : value === null ? "mi-na" : ""} aria-current={hit ? "true" : undefined}>{value === null ? "—" : value}</td>; })}</tr>)}</tbody></table></div></section>
    <section className="mi-result-section"><h3>これが意味すること</h3>{meaningLines(lookup).map((line) => <p key={line}>{line}</p>)}</section>
    <section className="mi-result-section mi-screen-only"><h3>数字で見る</h3><p>目安表の位置は保証ではありません。令和6年度の調査では、精神の障害で不支給になった事案のうち {rejectedPct}% が、目安表の位置より下の結論でした。診断書に生活の実態が載っているかで、同じ位置でも結論が分かれます。</p><p><Link href="/suuji">→ 数字で見る障害年金</Link></p></section>
    <section className="mi-result-section"><h3>ガイドラインが、ほかに見るところ</h3><p>当てはまるものがあれば押してください。ガイドラインの原文が出ます。点数にはしません。</p>
      <div className="mi-guide-list">
        {autoGuides.map((item) => <div key={item.id} className="mi-guide-row is-auto"><p className="mi-guide-q"><span className="mi-auto-tag">答えから自動で当たりました</span>{item.question}</p><GuideBlock item={item} /></div>)}
        {guides.map((item) => { const on = !!state.guide[item.id]; return <div key={item.id} className={`mi-guide-row ${on ? "is-on" : ""}`}><button type="button" className="mi-guide-btn" aria-pressed={on} onClick={() => onGuide(item.id, !on)}><span className="mi-guide-mark" aria-hidden="true" /><span>{item.question}</span></button>{on && <GuideBlock item={item} />}</div>; })}
      </div>
      {pressed.length > 0 && <p className="mi-answers-note">押したことが、診断書と申立書に事実として書かれているかを確認してください。書かれていなければ、審査には届きません。</p>}
    </section>
    <section className="mi-result-section mi-next-lines"><h3>もし申請するなら、次に</h3>{shindansho ? <><Link href="/dougu/shorui">→ 何をそろえればいい？</Link><Link href="/dougu/moushitatesho">→ 申立書を、自分で書きたい</Link><Link href="/nayami/shindansho-komatta">→ 診断書で困ったとき</Link></> : <><Link href="/hajimete">→ はじめての方へ</Link><Link href="/nayami/shoshinbi-karute">→ 初診日がわからないとき</Link><Link href="/shinsei">→ 申請の流れ</Link></>}
      {/* shorui の既定の一言(blurb)は二人称を含む(この道具では使わない語)ので、同じ道具の what(既存文)を使う */}
      <div className="dougu-band mi-dougu"><DouguCards placements={shindansho ? ["moushitatesho", "madoguchi"] : [{ tool: "shorui", blurb: TOOLS.shorui.what }, "moushitatesho"]} variant="grid" /></div>
      <Link href="/columns/nichijo-seikatsu-7koumoku">→ 7項目は、こう書かれる</Link><Link href="/columns/shindansho-tanomikata">→ 診断書の頼み方</Link>
    </section>
    <p className="mi-calm-note">{shindansho ? "診断書の記載をそのまま当てはめた結果です。" : "この結果は、本人の答えから出しています。実際の審査は医師の診断書をもとに行われるので、違う結果になることがあります。"}</p>
    <section className="mi-result-actions no-print"><div><button type="button" onClick={() => setSaved(saveMitate(state))}>この結果を、この端末に残す</button><small>共用のパソコンでは押さないでください</small></div><div><button type="button" onClick={() => window.print()}>主治医に見せる用に印刷する</button><label className="mi-print-opt"><input type="checkbox" checked={withGrade} onChange={(e) => setWithGrade(e.target.checked)} />目安表の位置も載せる</label></div>{saved && <p role="status">この端末に残しました</p>}</section>
    <section className="mi-result-section"><h3>出典</h3><p className="mi-src">{MITATE_SOURCE.name} 表1「障害等級の目安」/ 第3「総合評価」<br /><a href={MITATE_SOURCE.url}>{MITATE_SOURCE.url}</a><br />日本年金機構 診断書(精神の障害用)様式第120号の4 記載要領(単身で生活するとしたら可能かどうかで判断)<br />このサイトが判定したものではなく、国が公表している表に当てはめた結果です。</p></section>
    <DoctorSheet state={state} hits={hits} grade={withGrade && lookup.kind === "found" ? lookup.grade : null} />
  </div>;
}

function meaningLines(lookup: ReturnType<typeof mitateLookup>): string[] {
  if (lookup.kind === "blank") return ["表に目安が無いのは、対象外という意味ではありません。", "7項目の答えと全体の程度の組み合わせが珍しい、ということです。", "申請するなら、医師に生活の実態を伝えて、診断書の記載を整えてもらうところからです。"];
  if (lookup.kind === "found" && ["1級", "2級", "1級又は2級"].includes(lookup.grade)) return ["国の表の上では、障害年金の対象になりうる位置です。", "次に必要なのは、初診日(その症状で最初に医師にかかった日)と、診断書を書いてもらえる医師です。", "初診日が国民年金でも厚生年金でも、1級・2級は対象です。"];
  if (lookup.kind === "found") return ["初診日に厚生年金に入っていたなら、3級があります。", "初診日が国民年金のときは3級が無いので、2級に当たるかどうかが分かれ目になります。", "分かれ目は、診断書に生活の実態がどれだけ書かれているかです。"];
  return ["7項目の回答と全体の程度を選ぶと、国の目安表に当てはめられます。"];
}

/* 主治医に見せる1枚。画面では出さず、印刷のときだけ A4 1枚に出す(app/globals.css の @media print)。
   載せるのは 7項目の正式文言・全体の程度・押した総合評価の項目(最大6)・出典。原文引用は載せない。 */
function DoctorSheet({ state, hits, grade }: { state: MitateState; hits: MitateGuideItem[]; grade: string | null }) {
  const today = new Date(), date = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const degree = MITATE_DEGREE_CHOICES.find((c) => c.value === state.degree);
  return <section className="mi-doctor-sheet" aria-hidden="true">
    <h2>日常生活の状態(本人の記録)</h2>
    <p className="mi-ds-meta">{date} / 障害年金申請サポート /dougu/mitate で本人が答えたもの</p>
    <table className="mi-ds-table"><thead><tr><th>日常生活能力の判定</th><th>本人の答え</th></tr></thead><tbody>{MITATE_ABILITY_ITEMS.map((item) => { const value = state.ability[item.id]; return <tr key={item.id}><th scope="row">{item.label}</th><td>{value ? ABILITY_CHOICES.find((c) => c.value === value)?.formal : ""}</td></tr>; })}</tbody></table>
    <p className="mi-ds-line"><b>日常生活能力の程度</b> {degree ? degree.label : ""}</p>
    {hits.length > 0 && <div className="mi-ds-line"><b>ガイドラインの総合評価で、当てはまると本人が押した項目</b><ul>{hits.map((h) => <li key={h.id}>{h.question}</li>)}</ul></div>}
    {grade && <p className="mi-ds-line mi-ds-grade">国の目安表では「{grade}」の位置(本人の答えを当てはめたもの。等級の判定ではない)</p>}
    <p className="mi-ds-src">出典: 精神の障害に係る等級判定ガイドライン(平成28年9月)。判断の前提: 単身で生活するとしたら可能かどうか(診断書 記載要領)</p>
  </section>;
}

function GuideBlock({ item }: { item: MitateGuideItem }) { return <div className="mi-guide"><blockquote className="mi-quote">{item.quote}</blockquote><p className="mi-qsrc">{MITATE_SOURCE.name} {item.source}</p></div>; }
