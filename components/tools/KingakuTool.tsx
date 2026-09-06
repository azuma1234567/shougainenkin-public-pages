"use client";
// /dougu/kingaku の入力と結果。docs/kingaku-madoguchi-sasshin-2026-09-06-instructions.md A が画面の正
// (答えの箱を最上部に。3問だけ。報酬比例は折りたたみ。09-03 の「答えが先に見える形」を土台にした)。
// 計算は lib/kingaku.ts、金額は data/amounts.ts、件数は lib/stats.ts。ここに数字を直書きしないこと。
// 入力内容はサーバーへ送らず、この端末にも保存しない(送信・保存のAPIを一切呼ばない)。
import Link from "next/link";
import { useState } from "react";
import { DouguCards } from "@/components/platform/DouguCard";
import { KINGAKU_2026 as A } from "@/data/amounts";
import { bimonthly, calcKingaku, emptyInput, houshuHirei, kyuufukinMonthly, monthly, num, yearly, type Grade, type KingakuInput, type Seido } from "@/lib/kingaku";
import { approx100, hyoujunFromNenshu } from "@/lib/kingaku-hosoku";
import { stats } from "@/lib/stats";

const GRADES: Grade[] = [1, 2, 3];
/* 「初診日のとき、会社員・公務員でしたか(厚生年金)」。はい=厚生年金 / いいえ=国民年金 / わからない=制度未定(国民年金の額で見せる) */
const SEIDO: { v: Seido | null; label: string }[] = [{ v: "kousei", label: "はい" }, { v: "kokumin", label: "いいえ" }, { v: null, label: "わからない" }];
const KIDS: { v: number; label: string }[] = [{ v: 0, label: "いない" }, { v: 1, label: "1人" }, { v: 2, label: "2人" }, { v: 3, label: "3人以上" }];
/* 例: 月30万円・120月(300月みなし)の上乗せ。値は lib/kingaku.ts で計算する。 */
const EXAMPLE = { hyoujun: 300000, tsuki: 120 } as const;
const GRADE2_SHARE = stats.nintei["新規裁定・抽出1000件"]["合計"]["2級"].pct;

export default function KingakuTool() {
  const [s, setS] = useState<KingakuInput>({ ...emptyInput(), seido: "kokumin" });
  /* 3問の答え。null = まだ答えていない(既定の国民年金で見せる)。"fumei" = わからない(制度未定) */
  const [seidoChoice, setSeidoChoice] = useState<Seido | "fumei" | null>(null);
  const [salaryMode, setSalaryMode] = useState<"nenshu" | "hyoujun">("nenshu");
  const [nenshu, setNenshu] = useState<number | null>(null);
  const patch = (p: Partial<KingakuInput>) => setS((prev) => ({ ...prev, ...p }));
  // マイナスや指数表記が入ると §4 の式が意味を失うので、欄の段階で0以上の整数に丸める。
  const numberField = (value: string) => {
    if (value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null;
  };

  const result = calcKingaku(s);
  const kousei = s.seido === "kousei";
  const spouseActive = kousei && s.grade <= 2;
  const kyuufukin = kyuufukinMonthly(s.grade);
  const hh = houshuHirei(s);
  const example = houshuHirei({ ...emptyInput(), seido: "kousei", hyoujun: EXAMPLE.hyoujun, tsuki: EXAMPLE.tsuki });

  const chooseSeido = (v: Seido | null) => {
    setSeidoChoice(v === null ? "fumei" : v);
    patch({ seido: v, spouse: v === "kousei" ? s.spouse : false });
  };
  const chooseGrade = (g: Grade) => {
    patch(g === 3 ? { grade: g, seido: "kousei" } : { grade: g });
    if (g === 3) setSeidoChoice("kousei");
  };
  const switchSalary = (mode: "nenshu" | "hyoujun") => { setSalaryMode(mode); setNenshu(null); patch({ hyoujun: null }); };

  /* 答えの箱の1行(A-2) */
  const caption = s.grade === 3 && hh.value === null
    ? `3級は障害厚生年金だけです。給与からの上乗せを下で入れてください(最低保障 年${num(A.employeesGrade3Minimum)}円)`
    : seidoChoice === "fumei" ? "初診日に入っていた制度で変わります。まず国民年金の額を出しています"
    : kousei && hh.value === null ? `障害基礎年金 ${s.grade}級 + 障害厚生年金。給与からの上乗せは、下で入れると足せます`
    : kousei ? `障害基礎年金 ${s.grade}級 + 障害厚生年金(給与からの上乗せを含む)`
    : s.kids === 0 && s.grade === 2 ? "障害基礎年金 2級・単身の場合(いちばん多いケース)"
    : `障害基礎年金 ${s.grade}級の場合`;

  return (
    <>
      {/* 答え。開いた瞬間から数字が出ている(A-1)。 */}
      <section className="kg-card kg-answer" aria-labelledby="kg-answer-heading">
        <h2 id="kg-answer-heading" className="kg-sr">計算の結果</h2>
        <div className="kg-big" aria-live="polite">
          <p className="kg-y">{result.known ? <>年 {num(yearly(result.total))}<small>円</small></> : "年 —"}<span className="kg-m-inline">月 <b>{result.known ? `約${num(approx100(monthly(result.total)))}円` : "—"}</b></span></p>
          <p className="kg-pay">偶数月の15日に、前2か月分{result.known ? `(約${num(approx100(bimonthly(result.total)))}円)` : ""}が振り込まれます。15日が土日祝なら前の平日です。</p>
          <p className="kg-caption">{caption}</p>
        </div>
        <p className="kg-f kg-f-first" id="kg-grade-label">等級</p>
        <div className="kg-chips" role="group" aria-labelledby="kg-grade-label">
          {GRADES.map((g) => <button type="button" key={g} aria-pressed={s.grade === g} onClick={() => chooseGrade(g)}>{g}級</button>)}
        </div>
        <p className="kg-hintline">まだ分からない方は2級で見てください。新しく決まる人の {GRADE2_SHARE}% が2級です(令和6年度)。</p>
        <div className="dougu-band kg-dougu"><DouguCards placements={["mitate"]} variant="grid" /></div>
      </section>

      {/* 3問。答えるたびに上の数字が変わる。 */}
      <section className="kg-card" aria-labelledby="kg-q-heading">
        <h2 id="kg-q-heading">自分の場合に近づける</h2>
        <p className="kg-f" id="kg-seido-label">初診日のとき、会社員・公務員でしたか(厚生年金)</p>
        <div className="kg-chips" role="group" aria-labelledby="kg-seido-label">
          {SEIDO.map((o) => (
            <button type="button" key={o.label} disabled={s.grade === 3 && o.v === "kokumin"} aria-pressed={seidoChoice === (o.v === null ? "fumei" : o.v)} onClick={() => chooseSeido(o.v)}>{o.label}</button>
          ))}
        </div>
        <p className="kg-hintline">{s.grade === 3 ? "3級は厚生年金だけの等級です。" : "会社員・公務員なら厚生年金。自営・学生・無職・扶養に入っていたなら国民年金です。"}</p>

        <p className="kg-f" id="kg-kids-label">18歳までの子ども</p>
        <div className="kg-chips" role="group" aria-labelledby="kg-kids-label">
          {KIDS.map((o) => <button type="button" key={o.v} aria-pressed={s.kids === o.v} onClick={() => patch({ kids: o.v })}>{o.label}</button>)}
        </div>
        <p className="kg-hintline">18歳の年度末までの子。20歳未満で障害等級1・2級の子も数えます。{s.kids >= 3 && <>4人目以降は1人 {num(A.childThird)}円ずつ増えます。</>}</p>

        {spouseActive && (
          <>
            <p className="kg-f" id="kg-spouse-label">生計を維持している65歳未満の配偶者</p>
            <div className="kg-chips" role="group" aria-labelledby="kg-spouse-label">
              <button type="button" aria-pressed={s.spouse} onClick={() => patch({ spouse: true })}>いる</button>
              <button type="button" aria-pressed={!s.spouse} onClick={() => patch({ spouse: false })}>いない</button>
            </div>
            <p className="kg-hintline">障害厚生年金の1級・2級のときだけ加算されます。</p>
          </>
        )}
      </section>

      {/* 会社員だった方: 給与からの上乗せ。「はい」なら最初から開く。 */}
      <details className="kg-card kg-fold" open={kousei}>
        <summary>会社員だった方: 給与からの上乗せ(障害厚生年金の報酬比例部分)</summary>
        <div className="kg-fold-in">
          {!kousei && <p className="kg-hintline">初診日に厚生年金に入っていた方だけの上乗せです。上の質問で「はい」を選ぶと計算に入ります。</p>}
          <p className="kg-f" id="kg-salary-mode-label">入れ方を選ぶ</p>
          <div className="kg-chips" role="group" aria-labelledby="kg-salary-mode-label">
            <button type="button" aria-pressed={salaryMode === "nenshu"} onClick={() => switchSalary("nenshu")}>年収から(かんたん)</button>
            <button type="button" aria-pressed={salaryMode === "hyoujun"} onClick={() => switchSalary("hyoujun")}>平均標準報酬額から(正確)</button>
          </div>
          <div className="kg-grid2">
            {salaryMode === "nenshu" ? (
              <div>
                <label className="kg-f" htmlFor="kg-nenshu">厚生年金に入っていた頃の年収(ボーナス込み・円)</label>
                <input type="number" inputMode="numeric" min={0} step={1} id="kg-nenshu" placeholder="例: 3600000"
                  value={nenshu ?? ""} onChange={(e) => { const v = numberField(e.target.value); setNenshu(v); patch({ hyoujun: hyoujunFromNenshu(v) }); }} />
                <p className="kg-hintline">12で割った額{s.hyoujun !== null && nenshu !== null ? `(月 ${num(s.hyoujun)}円)` : ""}を平均標準報酬額として使います。目安です。標準報酬月額と賞与には上限があるため、高い年収では実際より多く出ることがあります。</p>
              </div>
            ) : (
              <div>
                <label className="kg-f" htmlFor="kg-hyoujun">平均標準報酬額(月・円)</label>
                <input type="number" inputMode="numeric" min={0} step={1} id="kg-hyoujun" placeholder="例: 300000"
                  value={s.hyoujun ?? ""} onChange={(e) => patch({ hyoujun: numberField(e.target.value) })} />
                <p className="kg-hintline">ねんきん定期便・ねんきんネット・年金事務所で分かります。</p>
              </div>
            )}
            <div>
              <label className="kg-f" htmlFor="kg-tsuki">厚生年金の加入月数</label>
              <input type="number" inputMode="numeric" min={0} step={1} id="kg-tsuki" placeholder="例: 120"
                value={s.tsuki ?? ""} onChange={(e) => patch({ tsuki: numberField(e.target.value) })} />
              <p className="kg-hintline">障害認定日(原則、初診日から1年6か月後)の月までの、厚生年金に入っていた月数。{A.minashiMonths}月未満なら{A.minashiMonths}月として計算します。</p>
            </div>
          </div>

          <details className="kg-details">
            <summary>平成15年3月以前にも厚生年金に入っていた</summary>
            <div className="kg-in">
              平成15年3月までと4月以降で計算の乗率が違います。分けて入れると正確になります。
              <div className="kg-grid2 kg-grid2-inner">
                <div>
                  <label className="kg-f" htmlFor="kg-kyu-tsuki">平成15年3月以前の月数</label>
                  <input type="number" inputMode="numeric" min={0} step={1} id="kg-kyu-tsuki" placeholder="0"
                    value={s.kyuTsuki ?? ""} onChange={(e) => patch({ kyuTsuki: numberField(e.target.value) })} />
                </div>
                <div>
                  <label className="kg-f" htmlFor="kg-kyu-hyoujun">その頃の平均標準報酬月額(円)</label>
                  <input type="number" inputMode="numeric" min={0} step={1} id="kg-kyu-hyoujun" placeholder="例: 250000"
                    value={s.kyuHyoujun ?? ""} onChange={(e) => patch({ kyuHyoujun: numberField(e.target.value) })} />
                </div>
              </div>
            </div>
          </details>
          <p className="kg-hintline">例: 月{num(EXAMPLE.hyoujun)}円・{EXAMPLE.tsuki}月 → {A.minashiMonths}月として計算し、年 約{num(Math.round(example.value ?? 0))}円が上乗せ(2級)。</p>
        </div>
      </details>

      <section className="kg-card" aria-labelledby="kg-result-heading">
        <h2 id="kg-result-heading">内訳</h2>
        <div className="kg-flags">{result.flags.map((f) => <span className="kg-flag" key={f}>{f}</span>)}</div>
        <table className="kg-br">
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}{r.why && <span className="kg-why">{r.why}</span>}</th>
                <td className={`kg-n${r.amount === 0 || r.amount === null ? " kg-zero" : ""}`}>
                  {r.amount === null ? "—" : `${num(Math.round(r.amount))}円`}
                </td>
              </tr>
            ))}
            <tr className="kg-total">
              <th scope="row">合計(年額)</th>
              <td className="kg-n">{result.known ? `${num(yearly(result.total))}円` : "—"}</td>
            </tr>
          </tbody>
        </table>

        <h3>上乗せ(参考)</h3>
        <div className="kg-note">
          {kyuufukin === null ? (
            <><strong>年金生活者支援給付金は、3級では受け取れません。</strong>この給付金は障害基礎年金の受給者が対象で、障害厚生年金3級のみの方は対象外です。</>
          ) : (
            <>
              <strong>年金生活者支援給付金</strong>(所得が一定以下の場合)<br />
              {s.grade}級なら 月 {num(kyuufukin)}円(年 {num(kyuufukin * 12)}円)が上乗せされます。合計額には含めていません。<br />
              障害年金を請求するときに<strong>同時に請求するのが原則</strong>で、出し忘れの多い書類です。
            </>
          )}
        </div>

        <h3>知っておくこと</h3>
        <ul className="kg-know">
          <li>これは概算です。実際の額は日本年金機構が決定します。障害厚生年金は、機構が従前額保障という別の計算とも比べて高いほうで決定するため、ここで出した額より高くなることがあります。</li>
          <li>金額は毎年4月に改定されます。表示しているのは{A.fiscalYear}の額です。</li>
          <li>生活保護・傷病手当金・労災・老齢年金とは調整があります(ここでは計算していません)。 → <Link href="/okane/chousei">他の制度との調整</Link></li>
          <li>障害年金は非課税ですが、健康保険の扶養認定では収入として数えます。 → <Link href="/gokai/hikazei-shuunyuu-zero">非課税と収入扱いのちがい</Link></li>
          <li>配偶者加給年金額は、配偶者自身が20年以上の加入期間による老齢厚生年金や障害年金を受けている間は止まります。</li>
          <li>20歳前に初診日がある方は、所得で止まることがあります。 → <Link href="/dougu/kougin">工賃・賃金と年金の計算</Link></li>
        </ul>
      </section>
    </>
  );
}
