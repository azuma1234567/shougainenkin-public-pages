"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MITATE_ABILITY_ITEMS, MITATE_AVERAGE_BANDS, MITATE_DEGREE_CHOICES, MITATE_GRADE_TABLE, MITATE_GUIDE_COMMON, MITATE_SOURCE, type MitateAbilityValue, type MitateDegree, type MitateGuideItem, type MitateKind } from "@/data/mitate";
import { emptyMitateState, mitateAverage, mitateGuideSet, mitateLookup, type MitateState } from "@/lib/mitate";
import { saveMitate } from "@/lib/mitate-storage";

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

export default function MitateTool() {
  const [state, setState] = useState<MitateState>(emptyMitateState);
  const [step, setStep] = useState(0);
  const [diagnosis, setDiagnosis] = useState("");
  const [diagnosisSelected, setDiagnosisSelected] = useState(false);
  const [shindansho, setShindansho] = useState(false);

  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("mode") === "shindansho";
    setShindansho(selected);
    setState((current) => ({ ...current, mode: selected ? "A" : "B" }));
  }, []);

  const patch = (next: Partial<MitateState>) => setState((current) => ({ ...current, ...next }));
  const move = (next: number) => { setStep(next); window.scrollTo({ top: 0, behavior: "smooth" }); };

  if (step === 0) return <section className="mi-intro" aria-labelledby="mi-intro-title">
    <h1 id="mi-intro-title">「私は、障害年金の対象になるのかな」と思ったら</h1>
    {shindansho && <p className="mi-shindansho-lead">診断書の裏面の欄を、そのまま写してください</p>}
    <p>精神の障害の審査では、国が公表している「等級判定ガイドライン」の目安表が使われます。<br />診断書に書かれる、毎日の生活の7つの項目と、全体の程度の組み合わせで、目安が決まります。<br />ここでは、その表にあなたの毎日を当てはめてみます。</p>
    <div className="mi-assurances" aria-label="この機能について"><span>約3分</span><span>判定ではありません</span><span>入力はこの端末の中だけ。送信も保存もしません</span></div>
    <button type="button" className="mi-start" onClick={() => move(1)}>はじめる</button>
    {!shindansho && <Link className="mi-mode-link" href="?mode=shindansho">診断書をもう持っている方は、書かれた内容をそのまま写せます →</Link>}
  </section>;

  if (step >= 1 && step <= 7) {
    const index = step - 1, item = MITATE_ABILITY_ITEMS[index], [plainQuestion, formalQuestion] = QUESTIONS[index];
    const next = () => move(step === 7 ? 8 : step + 1);
    return <QuestionShell progress={`${step}/8`} onBack={() => move(step - 1)}>
      {step === 1 && <p className="mi-one-line">調子のいい日ではなく、ふつうの日を思い浮かべて答えてください。</p>}
      <h2 className="mi-question">{plainQuestion}</h2><p className="mi-formal-name">{formalQuestion}</p>
      <div className={`mi-answer-list ${shindansho ? "is-shindansho" : ""}`} role="group" aria-label={plainQuestion}>{ABILITY_CHOICES.map((choice) => <button type="button" key={choice.value} onClick={() => { patch({ ability: { ...state.ability, [item.id]: choice.value } }); next(); }}><strong>{shindansho ? choice.formal : choice.plain}</strong><small>{shindansho ? choice.plain : choice.formal}</small></button>)}</div>
      <button type="button" className="mi-quiet-action" onClick={() => { const ability = { ...state.ability }; delete ability[item.id]; patch({ ability }); next(); }}>わからない・答えたくない</button>
    </QuestionShell>;
  }

  if (step === 8) return <QuestionShell progress="8/8" onBack={() => move(7)}>
    <h2 className="mi-question">全体として、いまの生活はどれに近いですか</h2>
    <div className={`mi-answer-list ${shindansho ? "is-shindansho" : ""}`} role="group" aria-label="全体として、いまの生活はどれに近いですか">{MITATE_DEGREE_CHOICES.map((choice, index) => <button type="button" key={choice.value} onClick={() => { patch({ degree: choice.value as MitateDegree }); move(9); }}><strong>{shindansho ? choice.label : DEGREE_PLAIN[index]}</strong><small>{shindansho ? DEGREE_PLAIN[index] : choice.label}</small></button>)}</div>
  </QuestionShell>;

  if (step === 9) return <QuestionShell onBack={() => move(8)}>
    <h2 className="mi-question">診断名に近いものはありますか</h2><p className="mi-formal-name">総合評価の注記を選ぶために使う</p>
    <div className="mi-answer-list mi-diagnoses" role="group" aria-label="診断名に近いものはありますか">{DIAGNOSES.map((choice) => <button type="button" key={choice.label} onClick={() => { setDiagnosis(choice.label); setDiagnosisSelected(true); patch({ kind: choice.kind }); move(10); }}><strong>{choice.label}</strong></button>)}</div>
    <button type="button" className="mi-skip-large" onClick={() => { setDiagnosis(""); setDiagnosisSelected(false); patch({ kind: undefined }); move(10); }}>飛ばす</button>
  </QuestionShell>;

  return <Result state={state} shindansho={shindansho} diagnosis={diagnosis} diagnosisSelected={diagnosisSelected} />;
}

function QuestionShell({ progress, onBack, children }: { progress?: string; onBack: () => void; children: React.ReactNode }) {
  return <section className="mi-question-screen">{progress && <><div className="mi-progress"><span style={{ width: `${(Number(progress.split("/")[0]) / 8) * 100}%` }} /></div><p className="mi-progress-text">{progress}</p></>}<button type="button" className="mi-back" onClick={onBack}>戻る</button>{children}</section>;
}

function Result({ state, shindansho, diagnosis, diagnosisSelected }: { state: MitateState; shindansho: boolean; diagnosis: string; diagnosisSelected: boolean }) {
  const [expanded, setExpanded] = useState(false), [saved, setSaved] = useState(false);
  const average = mitateAverage(state), lookup = mitateLookup(state), band = lookup.kind === "none" ? null : lookup.band;
  const guides = (diagnosisSelected && diagnosis !== "その他・わからない" ? mitateGuideSet(state.kind) : MITATE_GUIDE_COMMON).slice(0, 6);
  const visibleGuides = expanded ? guides : guides.slice(0, 3);
  const heading = lookup.kind === "found" ? `国の目安表では、この組み合わせは「${lookup.grade}」のところにあります。` : lookup.kind === "blank" ? "国の目安表では、この組み合わせに目安が定められていません。" : "国の目安表に当てはめるには、7項目の回答と全体の程度が必要です。";
  return <div className="mi-result">
    <section className="mi-result-heading"><h2>{heading}</h2><p>これはあなたの等級ではありません。実際は、医師が診断書に書く内容と、働き方や生活の実態を合わせて、国が判断します。</p></section>
    <section className="mi-result-section"><h3>これが意味すること</h3>{meaningLines(lookup).map((line) => <p key={line}>{line}</p>)}</section>
    <section className="mi-result-section mi-next-lines"><h3>もし申請するなら、次に</h3>{shindansho ? <><Link href="/dougu/shorui">→ 何をそろえればいい？</Link><Link href="/dougu/moushitatesho">→ 申立書を、自分で書きたい</Link><Link href="/nayami/shindansho-komatta">→ 診断書で困ったとき</Link></> : <><Link href="/hajimete">→ はじめての方へ</Link><Link href="/nayami/shoshinbi-karute">→ 初診日がわからないとき</Link><Link href="/shinsei">→ 申請の流れ</Link></>}</section>
    <section className="mi-result-section"><h3>あなたの答えは、表のここ</h3><p>行が7項目の平均、列が全体の程度です</p><div className="mi-tbl-scroll"><table className="mi-gt"><thead><tr><th>判定平均</th>{[1,2,3,4,5].map((degree) => <th key={degree}>程度({degree})</th>)}</tr></thead><tbody>{MITATE_AVERAGE_BANDS.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{[1,2,3,4,5].map((degree) => { const value = MITATE_GRADE_TABLE[row.label][degree - 1], hit = row.label === band && degree === state.degree; return <td key={degree} className={hit ? "mi-hit" : value === null ? "mi-na" : ""} aria-current={hit ? "true" : undefined}>{value === null ? "—" : value}</td>; })}</tr>)}</tbody></table></div>{average.value !== null && state.degree !== undefined && <p className="mi-result-number">7項目の平均 {average.value.toFixed(1)} × 程度({state.degree})</p>}</section>
    <section className="mi-result-section"><h3>診断書では、ここも見られます</h3>{visibleGuides.map((item) => <GuideBlock key={item.id} item={item} />)}{!expanded && guides.length > 3 && <button type="button" className="mi-more" onClick={() => setExpanded(true)}>もっと見る</button>}</section>
    <p className="mi-calm-note">{shindansho ? "診断書の記載をそのまま当てはめた結果です。" : "この結果は、あなた自身の答えから出しています。実際の審査は医師の診断書をもとに行われるので、違う結果になることがあります。"}</p>
    <section className="mi-result-actions no-print"><div><button type="button" onClick={() => setSaved(saveMitate(state))}>この結果を、この端末に残す</button><small>共用のパソコンでは押さないでください</small></div><button type="button" onClick={() => window.print()}>印刷する</button>{saved && <p role="status">この端末に残しました</p>}</section>
    <section className="mi-result-section"><h3>出典</h3><p className="mi-src">{MITATE_SOURCE.name} 表1「障害等級の目安」/ 第3「総合評価」<br /><a href={MITATE_SOURCE.url}>{MITATE_SOURCE.url}</a><br />このサイトが判定したものではなく、国が公表している表に当てはめた結果です。</p></section>
    <p className="mi-screen-only"><Link href="/suuji">→ 数字で見る障害年金</Link></p>
  </div>;
}

function meaningLines(lookup: ReturnType<typeof mitateLookup>): string[] {
  if (lookup.kind === "blank") return ["表に目安が無いのは、対象外という意味ではありません。", "7項目の答えと全体の程度の組み合わせが珍しい、ということです。", "申請するなら、医師に生活の実態を伝えて、診断書の記載を整えてもらうところからです。"];
  if (lookup.kind === "found" && ["1級", "2級", "1級又は2級"].includes(lookup.grade)) return ["国の表の上では、障害年金の対象になりうる位置です。", "次に必要なのは、初診日(その症状で最初に医師にかかった日)と、診断書を書いてもらえる医師です。", "初診日が国民年金でも厚生年金でも、1級・2級は対象です。"];
  if (lookup.kind === "found") return ["初診日に厚生年金に入っていたなら、3級があります。", "初診日が国民年金のときは3級が無いので、2級に当たるかどうかが分かれ目になります。", "分かれ目は、診断書に生活の実態がどれだけ書かれているかです。"];
  return ["7項目の回答と全体の程度を選ぶと、国の目安表に当てはめられます。"];
}

function GuideBlock({ item }: { item: MitateGuideItem }) { return <div className="mi-guide"><blockquote className="mi-quote">{item.quote}</blockquote><p className="mi-qsrc">{MITATE_SOURCE.name} {item.source}</p></div>; }
