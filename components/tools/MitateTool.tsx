"use client";
/* /dougu/mitate。docs/mitate-tool-design-2026-09-02.md と
   docs/site-mock-2026-09-02-tools/Mitate.html が見た目とロジックの正。
   **このツールは判定しない。**主語は常に「国のガイドラインでは」。
   確率・予測の語彙を書かない。入力と結果はサーバーへ送らない
   (fetch / XMLHttpRequest / sendBeacon / WebSocket を書かない)。 */
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MITATE_ABILITY_CHOICES, MITATE_ABILITY_ITEMS, MITATE_AVERAGE_BANDS, MITATE_DEGREE_CHOICES,
  MITATE_GRADE_TABLE, MITATE_KINDS, MITATE_SEIDO_CHOICES, MITATE_SOURCE,
  type MitateDegree, type MitateGuideItem, type MitateKind, type MitateMode, type MitateSeido,
} from "@/data/mitate";
import {
  emptyMitateState, mitateAverage, mitateGuideHits, mitateGuideSet, mitateLookup, isNearBoundary,
  type MitateState,
} from "@/lib/mitate";
import { clearMitate, loadMitate, saveMitate } from "@/lib/mitate-storage";

const STEP_LABEL = ["はじめに", "障害の種類", "診断書の有無", "日常生活能力の判定", "日常生活能力の程度", "当てはまる状況", "結果"];
const STEPS = STEP_LABEL.length;

export default function MitateTool() {
  const [s, setS] = useState<MitateState>(emptyMitateState);
  const [step, setStep] = useState(0);
  const [abIdx, setAbIdx] = useState(0);
  const [shared, setShared] = useState(false);
  const [restored, setRestored] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [saveNote, setSaveNote] = useState("");

  useEffect(() => { const v = loadMitate(); if (v) { setS(v); setRestored(true); } }, []);
  useEffect(() => {
    if (shared) return;
    const t = setTimeout(() => { setSaveNote(saveMitate(s) ? "" : "この端末に保存できませんでした。入力と結果はそのまま使えます。"); }, 400);
    return () => clearTimeout(t);
  }, [s, shared]);

  const patch = (p: Partial<MitateState>) => setS((prev) => ({ ...prev, ...p }));
  const go = (n: number) => { setStep(n); if (n === 3) setAbIdx(0); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const outOfScope = s.kind === "other";
  const item = MITATE_ABILITY_ITEMS[abIdx];

  const nextAbility = () => { if (abIdx < MITATE_ABILITY_ITEMS.length - 1) { setAbIdx(abIdx + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } else go(4); };
  const skipAbility = () => { const a = { ...s.ability }; delete a[item.id]; patch({ ability: a }); nextAbility(); };

  return (
    <div className="mi-tool">
      <div className="mi-prog no-print" role="presentation">
        {Array.from({ length: STEPS }, (_, i) => <i key={i} className={i < step ? "done" : i === step ? "on" : ""} />)}
      </div>
      <p className="mi-progtxt no-print" role="status">{STEP_LABEL[step]}（{step + 1} / {STEPS}）</p>
      {saveNote && <p className="mi-savenote no-print" role="status">{saveNote}</p>}

      {/* ===== 0. はじめに ===== */}
      {step === 0 && (
        <section className="mi-card" aria-labelledby="mi-h0">
          <h2 id="mi-h0">はじめに</h2>
          <ul className="mi-plain">
            <li>この表は<strong>国が公表しているもの</strong>です。このサイトが独自に判定するものではありません。</li>
            <li>答えた内容と結果は、<strong>この端末の中だけ</strong>に残ります。送信も分析もしません。</li>
            <li>答えたくない項目は<strong>飛ばせます</strong>。答えた範囲で結果を出します。</li>
            <li>途中でやめても、<strong>続きから</strong>再開できます。</li>
          </ul>
          <button type="button" className="mi-opt mi-chk" aria-pressed={shared}
            onClick={() => { const next = !shared; setShared(next); if (next) clearMitate(); }}>
            <span className="mi-mk" /><span>共用のパソコンを使っています(この端末に保存しない)</span>
          </button>
          {restored && <p className="mi-note">前回の回答をこの端末から読み込みました。<button type="button" className="mi-skip" onClick={() => setConfirmClear(true)}>この端末から消す</button></p>}
          {confirmClear && (
            <p className="mi-note">この端末に残した回答を消します。よろしいですか。{" "}
              <button type="button" className="mi-skip" onClick={() => { clearMitate(); setS(emptyMitateState()); setRestored(false); setConfirmClear(false); setStep(0); }}>消す</button>{" ／ "}
              <button type="button" className="mi-skip" onClick={() => setConfirmClear(false)}>やめる</button>
            </p>
          )}
          <div className="mi-row"><button type="button" className="mi-btn" onClick={() => go(1)}>はじめる</button></div>
        </section>
      )}

      {/* ===== 1. 障害の種類 ===== */}
      {step === 1 && (
        <section className="mi-card" aria-labelledby="mi-h1">
          <p className="mi-qhead">1 / 6</p>
          <h2 className="mi-qtitle" id="mi-h1">どの障害で請求を考えていますか</h2>
          <div className="mi-opts" role="group" aria-labelledby="mi-h1">
            {MITATE_KINDS.map((k) => (
              <button type="button" key={k.value} className="mi-opt" aria-pressed={s.kind === k.value}
                onClick={() => patch({ kind: k.value })}><span className="mi-mk" /><span>{k.label}</span></button>
            ))}
          </div>
          {outOfScope && (
            <div>
              <p className="mi-warnbox">
                <strong>このガイドラインの対象外です。</strong><br />
                「精神の障害に係る等級判定ガイドライン」は、精神障害・知的障害・発達障害の審査のために国が公表しているものです。ほかの障害には、それぞれ別の認定基準があり、この目安表は使えません。
              </p>
              <div className="mi-next">
                <Link href="/byoki"><b>病気から探す</b><span>病名ごとに、審査で見られるところをまとめています</span></Link>
                <Link href="/shinsei"><b>障害認定基準について</b><span>障害ごとに基準がどう決まっているか</span></Link>
              </div>
            </div>
          )}
          <div className="mi-row">
            <button type="button" className="mi-btn mi-ghost mi-sm" onClick={() => go(0)}>戻る</button>
            <button type="button" className="mi-btn" disabled={!s.kind || outOfScope} onClick={() => go(2)}>次へ</button>
          </div>
        </section>
      )}

      {/* ===== 2. モード ===== */}
      {step === 2 && (
        <section className="mi-card" aria-labelledby="mi-h2">
          <p className="mi-qhead">2 / 6</p>
          <h2 className="mi-qtitle" id="mi-h2">診断書は、もう手元にありますか</h2>
          <p className="mi-sub">ここで精度が大きく変わります。</p>
          <div className="mi-opts" role="group" aria-labelledby="mi-h2">
            {([["A", "手元にある", "診断書に書かれた欄をそのまま写します。審査が見るのと同じ数字になります。"],
               ["B", "まだない(これから請求する)", "自分で見立てた数字で当てはめます。参考値になります。"]] as [MitateMode, string, string][])
              .map(([v, title, note]) => (
                <button type="button" key={v} className="mi-opt" aria-pressed={s.mode === v} onClick={() => patch({ mode: v })}>
                  <span className="mi-mk" /><span><b>{title}</b><br /><span className="mi-optnote">{note}</span></span>
                </button>
              ))}
          </div>
          {s.mode === "B" && <ModeBNote />}
          <div className="mi-row">
            <button type="button" className="mi-btn mi-ghost mi-sm" onClick={() => go(1)}>戻る</button>
            <button type="button" className="mi-btn" disabled={!s.mode} onClick={() => go(3)}>次へ</button>
          </div>
        </section>
      )}

      {/* ===== 3. 判定7項目 ===== */}
      {step === 3 && (
        <section className="mi-card" aria-labelledby="mi-h3">
          <p className="mi-qhead">3 / 6 ・ 日常生活能力の判定</p>
          <h2 className="mi-qtitle" id="mi-h3">{item.label}</h2>
          <p className="mi-note">
            <strong>ひとり暮らしかどうかにかかわらず、「援助がなかったらどうか」で考える</strong>のが、国の定めた見方です。
          </p>
          {s.mode === "B" && <ModeBNote />}
          <div className="mi-opts" role="group" aria-labelledby="mi-h3">
            {MITATE_ABILITY_CHOICES.map((c) => (
              <button type="button" key={c.value} className="mi-opt" aria-pressed={s.ability[item.id] === c.value}
                onClick={() => { patch({ ability: { ...s.ability, [item.id]: c.value } }); nextAbility(); }}>
                <span className="mi-mk" /><span className="mi-num">{c.value}</span><span>{c.label}</span>
              </button>
            ))}
          </div>
          <button type="button" className="mi-skip" onClick={skipAbility}>この項目は答えない</button>
          <div className="mi-row">
            <button type="button" className="mi-btn mi-ghost mi-sm" onClick={() => { if (abIdx > 0) setAbIdx(abIdx - 1); else go(2); }}>戻る</button>
            <span className="mi-count">{abIdx + 1} / {MITATE_ABILITY_ITEMS.length} 項目</span>
          </div>
        </section>
      )}

      {/* ===== 4. 程度 ===== */}
      {step === 4 && (
        <section className="mi-card" aria-labelledby="mi-h4">
          <p className="mi-qhead">4 / 6</p>
          <h2 className="mi-qtitle" id="mi-h4">日常生活能力の程度</h2>
          <p className="mi-sub">全体としてどのあたりかを、ひとつ選びます。</p>
          {s.mode === "B" && <ModeBNote />}
          <div className="mi-opts" role="group" aria-labelledby="mi-h4">
            {MITATE_DEGREE_CHOICES.map((d) => (
              <button type="button" key={d.value} className="mi-opt" aria-pressed={s.degree === d.value}
                onClick={() => { patch({ degree: d.value as MitateDegree }); go(5); }}>
                <span className="mi-mk" /><span>{d.label}</span>
              </button>
            ))}
          </div>
          <button type="button" className="mi-skip" onClick={() => go(5)}>選ばずに進む</button>
          <div className="mi-row"><button type="button" className="mi-btn mi-ghost mi-sm" onClick={() => go(3)}>戻る</button></div>
        </section>
      )}

      {/* ===== 5. 総合評価の質問 ===== */}
      {step === 5 && (
        <section className="mi-card" aria-labelledby="mi-h5">
          <p className="mi-qhead">5 / 6</p>
          <h2 className="mi-qtitle" id="mi-h5">当てはまるものを選んでください</h2>
          <p className="mi-sub">目安表には使いません。ガイドラインの「総合評価」で触れられている状況に当てはまるかを見ます。いくつでも選べます。</p>
          {s.mode === "B" && <ModeBNote />}
          <div className="mi-opts" role="group" aria-labelledby="mi-h5">
            {mitateGuideSet(s.kind).map((g) => (
              <button type="button" key={g.id} className="mi-opt mi-chk" aria-pressed={!!s.guide[g.id]}
                onClick={() => patch({ guide: { ...s.guide, [g.id]: !s.guide[g.id] } })}>
                <span className="mi-mk" /><span>{g.question}</span>
              </button>
            ))}
          </div>
          <h3 id="mi-seido">初診日に加入していた制度(任意)</h3>
          <div className="mi-opts" role="group" aria-labelledby="mi-seido">
            {MITATE_SEIDO_CHOICES.map((o) => (
              <button type="button" key={o.value} className="mi-opt" aria-pressed={s.seido === o.value}
                onClick={() => patch({ seido: o.value as MitateSeido })}><span className="mi-mk" /><span>{o.label}</span></button>
            ))}
          </div>
          <div className="mi-row">
            <button type="button" className="mi-btn mi-ghost mi-sm" onClick={() => go(4)}>戻る</button>
            <button type="button" className="mi-btn" onClick={() => go(6)}>目安を見る</button>
          </div>
        </section>
      )}

      {/* ===== 6. 結果 ===== */}
      {step === 6 && <Result s={s} onBack={() => go(3)} />}
    </div>
  );
}

/* モードBの注記。入力中も結果画面にも常時出る(閉じられない)。 */
function ModeBNote() {
  return (
    <p className="mi-warnbox mi-modeb">
      <strong>ここで使った数字は、あなたが自分で選んだものです。</strong><br />
      審査が見るのは、医師が診断書に書いた数字です。同じにならないことがあります。この結果は「医師に何を伝えるか」を考える材料として使ってください。
    </p>
  );
}

function Result({ s, onBack }: { s: MitateState; onBack: () => void }) {
  const avg = mitateAverage(s);
  const lookup = mitateLookup(s);
  const band = lookup.kind === "none" ? null : lookup.band;
  const grade = lookup.kind === "found" ? lookup.grade : null;
  const hits = mitateGuideHits(s, lookup);
  const hard = MITATE_ABILITY_ITEMS.filter((i) => (s.ability[i.id] ?? 0) >= 3);
  const near = avg.value !== null && lookup.kind === "found" && isNearBoundary(avg.value);

  return (
    <>
      <section className="mi-card" aria-labelledby="mi-hr">
        <h2 id="mi-hr">国のガイドラインの目安</h2>
        <p className="mi-avg"><span>判定平均 <b>{avg.value === null ? "—" : avg.value.toFixed(2)}</b></span>
          {avg.value !== null && <span>{avg.total}項目中{avg.answered}項目の回答から計算しています。</span>}</p>

        <div className="mi-verdict">
          {lookup.kind === "none" && lookup.reason === "no_ability" && <>7項目のうち、少なくとも1つに答えると目安を出せます。</>}
          {lookup.kind === "none" && lookup.reason === "no_degree" && <>「日常生活能力の程度」を選ぶと目安を出せます。</>}
          {lookup.kind === "blank" && (
            <>国のガイドラインの表では、この組み合わせ(判定平均 {avg.value?.toFixed(2)} × 程度({lookup.degree}))に<b>目安が定められていません</b>。判定(7項目)と程度の間に開きがあるためです。ガイドラインは、こうした場合は診断書を書いた医師に内容を確認したうえで、ほかの記載も含めて総合的に評価する、としています。</>
          )}
          {lookup.kind === "found" && (
            <>国のガイドラインでは、この組み合わせ(判定平均 {avg.value?.toFixed(2)} × 程度({lookup.degree}))の目安は<br /><span className="mi-g">「{lookup.grade}」</span>とされています。</>
          )}
        </div>

        {s.mode === "B" && <ModeBNote />}

        <h3>目安表(全体)</h3>
        <div className="mi-tbl-scroll">
          <table className="mi-gt">
            <thead><tr><th>判定平均</th>{[1, 2, 3, 4, 5].map((d) => <th key={d}>程度({d})</th>)}</tr></thead>
            <tbody>
              {MITATE_AVERAGE_BANDS.map((b) => (
                <tr key={b.label}>
                  <th scope="row">{b.label}</th>
                  {[1, 2, 3, 4, 5].map((d) => {
                    const v = MITATE_GRADE_TABLE[b.label][d - 1];
                    const hit = b.label === band && d === s.degree;
                    return <td key={d} className={hit ? "mi-hit" : v === null ? "mi-na" : ""}
                      aria-current={hit ? "true" : undefined}>{v === null ? "—" : v}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mi-gcap">行=日常生活能力の判定の平均 / 列=日常生活能力の程度。「—」は原表の空欄です。</p>

        <p className="mi-note">
          表の中の「3級」は、<strong>障害基礎年金として認定する場合には「2級非該当」と置き換える</strong>ことになっています。障害基礎年金には3級がないためです。初診日にどの制度に加入していたかで、扱いが変わります。
          {s.seido === "kokumin" && grade && grade.includes("3級") && (
            <><br /><br />あなたが選んだ「国民年金」の場合、この目安の「3級」は<strong>2級非該当(3級のない制度のため)</strong>と読み替えられます。</>
          )}
        </p>
      </section>

      <section className="mi-card" aria-labelledby="mi-hg">
        <h2 id="mi-hg">総合評価で動きうること</h2>
        <p className="mi-sub">ガイドラインの「総合評価」には、次のような場合が挙げられています。あなたが選んだ状況に当てはまるものです。<strong>目安を計算し直すものではありません。</strong></p>
        {hits.length === 0 && <p className="mi-sub">当てはまるものは選ばれていません。</p>}
        {hits.map((g) => <GuideBlock key={g.id} item={g} />)}
        {near && (
          <div className="mi-guide">
            <span className="mi-dirtag mi-dir-eq">境目に近い</span>
            <p className="mi-sub">判定平均が、表の区分の境目に近い位置です。こうした場合、診断書の各欄の書かれ方が結果を分けることがあります。</p>
          </div>
        )}
      </section>

      <section className="mi-card" aria-labelledby="mi-hc">
        <h2 id="mi-hc">ガイドライン自身の留保</h2>
        <p>目安はあくまで参考です。実際の認定は、診断書のほかの記載や生活の実態も含めて総合的に判断されます。ガイドラインにも「総合的に評価した結果、目安と異なる等級になることもあり得る」と書かれています。</p>
      </section>

      <section className="mi-card mi-screen-only" aria-labelledby="mi-hs">
        <h2 id="mi-hs">数字で見る実際</h2>
        <div className="mi-stat">
          <div><b>70.3%</b>新規に決まった障害年金のうち、精神の障害によるもの</div>
          <div><b>53.9%</b>決まった等級のうち2級(1級10.9% / 3級22.1%)</div>
          <div><b>13.0%</b>新規裁定のうち非該当(146,225件中18,982件)</div>
        </div>
        <p className="mi-sub">令和6年度。これは全体の分布であって、あなたの結果を予測するものではありません。 → <Link href="/suuji">数字で見る障害年金</Link></p>
      </section>

      <section className="mi-card mi-screen-only" aria-labelledby="mi-hn">
        <h2 id="mi-hn">ここからできること</h2>
        <div className="mi-note">
          <strong>診察で伝えることを整理する</strong><br />
          {hard.length > 0 ? (
            <>あなたが3・4を付けたのは、次の項目です。この項目について具体的な場面を伝えると、診断書に映りやすくなります。
              <ul className="mi-plain">{hard.map((i) => <li key={i.id}>{i.label}</li>)}</ul></>
          ) : <>3・4を付けた項目はありませんでした。</>}
        </div>
        <div className="mi-next no-print">
          <Link href="/dougu/moushitatesho"><b>申立書を書く</b><span>フォームに沿って書くと、そのまま提出できる形で印刷できます</span></Link>
          <Link href="/dougu/kingaku"><b>金額を計算する</b><span>その等級だと年額と月額がいくらになるか、内訳つきで出します</span></Link>
          <Link href="/dougu/shorui"><b>必要書類をしらべる</b><span>自分の場合に要る書類だけを、1枚にまとめます</span></Link>
          {lookup.kind === "blank" && <Link href="/nayami/shindansho-komatta"><b>診断書で困ったとき</b><span>判定と程度の開きについて</span></Link>}
          {(s.guide.g1 || s.guide.g2 || s.guide.g7 || s.guide.g8) && <Link href="/joukyou/hatarakinagara"><b>働きながら申請する</b><span>就労がどう見られるか</span></Link>}
          {s.guide.g3 && <Link href="/joukyou/hitorigurashi"><b>ひとり暮らしで申請する</b><span>独居の評価のされ方</span></Link>}
          {s.mode === "B" && <p className="mi-next-plain"><b>診断書を受け取ったら</b><span>この機能にもう一度戻って、実際に書かれた数字で確かめてください</span></p>}
        </div>
      </section>

      <section className="mi-card" aria-labelledby="mi-ho">
        <h2 id="mi-ho">出典</h2>
        <p className="mi-src">
          {MITATE_SOURCE.name} 表1「障害等級の目安」/ 第3「総合評価」<br />
          <a href={MITATE_SOURCE.url}>{MITATE_SOURCE.url}</a><br />
          このサイトが判定したものではなく、国が公表している表に当てはめた結果です。
        </p>
        <div className="mi-row no-print">
          <button type="button" className="mi-btn mi-ghost mi-sm" onClick={() => window.print()}>結果を印刷する</button>
          <button type="button" className="mi-btn mi-ghost mi-sm" onClick={onBack}>回答を見直す</button>
        </div>
      </section>
    </>
  );
}

function GuideBlock({ item }: { item: MitateGuideItem }) {
  return (
    <div className="mi-guide">
      <span className={`mi-dirtag ${item.direction === "up" ? "mi-dir-up" : "mi-dir-eq"}`}>
        {item.direction === "up" ? "上げる方向で検討される" : "整合性が見られる"}
      </span>
      <p className="mi-gq">{item.question}</p>
      <blockquote className="mi-quote">{item.quote}</blockquote>
      <p className="mi-qsrc">{MITATE_SOURCE.name} {item.source}</p>
    </div>
  );
}
