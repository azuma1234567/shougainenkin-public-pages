"use client";
// /dougu/kingaku の入力と結果。docs/kingaku-tool-design-2026-09-02.md と
// docs/site-mock-2026-09-02-tools/Kingaku.html が見た目とロジックの正。
// 計算は lib/kingaku.ts、金額は data/amounts.ts。ここに数字を直書きしないこと。
// 入力内容はサーバーへ送らず、この端末にも保存しない(送信・保存のAPIを一切呼ばない)。
import Link from "next/link";
import { useState } from "react";
import { KINGAKU_2026 as A } from "@/data/amounts";
import { bimonthly, calcKingaku, emptyInput, kyuufukinMonthly, monthly, num, yearly, type Grade, type KingakuInput, type Seido } from "@/lib/kingaku";

const GRADES: Grade[] = [1, 2, 3];
const SEIDO: { v: Seido; label: string }[] = [{ v: "kokumin", label: "国民年金" }, { v: "kousei", label: "厚生年金" }];

export default function KingakuTool() {
  const [s, setS] = useState<KingakuInput>(emptyInput());
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

  return (
    <>
      <section className="kg-card" aria-labelledby="kg-input-heading">
        <h2 id="kg-input-heading">入力</h2>

        <p className="kg-f" id="kg-grade-label">1. 等級</p>
        <div className="kg-chips" role="group" aria-labelledby="kg-grade-label">
          {GRADES.map((g) => (
            <button
              type="button"
              key={g}
              aria-pressed={s.grade === g}
              onClick={() => patch(g === 3 ? { grade: g, seido: "kousei" } : { grade: g })}
            >{g}級</button>
          ))}
        </div>
        <p className="kg-hintline">まだ分からないときは 等級の目安をしらべる(準備中)から。</p>

        <p className="kg-f" id="kg-seido-label">2. 初診日に入っていた制度</p>
        <div className="kg-chips" role="group" aria-labelledby="kg-seido-label">
          {SEIDO.map((o) => (
            <button
              type="button"
              key={o.v}
              disabled={s.grade === 3 && o.v === "kokumin"}
              aria-pressed={s.seido === o.v}
              onClick={() => patch({ seido: o.v })}
            >{o.label}</button>
          ))}
        </div>
        <p className="kg-hintline">会社員・公務員なら厚生年金。自営・学生・無職・扶養に入っていたなら国民年金です。</p>
        {s.grade === 3 && (
          <p className="kg-warnbox"><b>3級は障害厚生年金だけの等級です。</b>障害基礎年金に3級はありません。</p>
        )}

        <div className="kg-grid2">
          <div>
            <label className="kg-f" htmlFor="kg-kids">3. 18歳の年度末までの子</label>
            <select id="kg-kids" value={s.kids} onChange={(e) => patch({ kids: Number(e.target.value) })}>
              <option value={0}>いない</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <p className="kg-hintline">20歳未満で障害等級1・2級の子も数えます。</p>
          </div>
          <div className={spouseActive ? undefined : "kg-inactive"}>
            <label className="kg-f" htmlFor="kg-spouse">4. 生計を維持している65歳未満の配偶者</label>
            <select id="kg-spouse" value={s.spouse ? 1 : 0} onChange={(e) => patch({ spouse: e.target.value === "1" })}>
              <option value={0}>いない</option>
              <option value={1}>いる</option>
            </select>
            <p className="kg-hintline">障害厚生年金の1級・2級のときだけ加算されます。</p>
          </div>
        </div>

        {kousei && (
          <div>
            <h3>厚生年金の報酬比例部分</h3>
            <div className="kg-grid2">
              <div>
                <label className="kg-f" htmlFor="kg-hyoujun">5. 平均標準報酬額(月・円)</label>
                <input type="number" inputMode="numeric" min={0} step={1} id="kg-hyoujun" placeholder="例: 300000"
                  value={s.hyoujun ?? ""} onChange={(e) => patch({ hyoujun: numberField(e.target.value) })} />
              </div>
              <div>
                <label className="kg-f" htmlFor="kg-tsuki">6. 厚生年金の加入月数</label>
                <input type="number" inputMode="numeric" min={0} step={1} id="kg-tsuki" placeholder="例: 120"
                  value={s.tsuki ?? ""} onChange={(e) => patch({ tsuki: numberField(e.target.value) })} />
                <p className="kg-hintline">初診日の前月までの月数です。</p>
              </div>
            </div>

            <details className="kg-details">
              <summary>平均標準報酬額が分からない</summary>
              <div className="kg-in">
                <b>ねんきん定期便</b>(毎年の誕生月に届くハガキ)の「これまでの年金加入期間」と「これまでの保険料納付額」から見当がつきます。<br />
                <b>ねんきんネット</b>でも確認できます(基礎年金番号が必要です)。<br />
                <b>年金事務所</b>でも教えてもらえます。<br /><br />
                ざっくりでよければ、<b>厚生年金に入っていた頃の、月々の給与とボーナスを12で割った額</b>をおおよそで入れてください。目安になります。
              </div>
            </details>

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
          </div>
        )}
      </section>

      <section className="kg-card" aria-labelledby="kg-result-heading">
        <h2 id="kg-result-heading">計算の結果</h2>
        <div className="kg-big" aria-live="polite">
          <p className="kg-y">{result.known ? <>{num(yearly(result.total))}<small>円 / 年</small></> : "—"}</p>
          <p className="kg-m">
            <span>月あたり <b>{result.known ? `約${num(monthly(result.total))}円` : "—"}</b></span>
            <span>偶数月の振込 <b>{result.known ? `約${num(bimonthly(result.total))}円` : "—"}</b></span>
          </p>
        </div>

        <div className="kg-flags">{result.flags.map((f) => <span className="kg-flag" key={f}>{f}</span>)}</div>

        <h3>内訳</h3>
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

        <p className="kg-warnbox">
          <b>これは概算です。</b>実際の額は日本年金機構が決定します。とくに障害厚生年金は、機構が<b>従前額保障</b>という別の計算とも比べて高いほうで決定するため、<b>ここで出した額より高くなることがあります。</b>
        </p>
        <div className="kg-note">
          金額は<strong>毎年4月に改定</strong>されます。表示しているのは<strong>{A.fiscalYear}</strong>の額です。<br />
          生活保護・傷病手当金・労災・老齢年金とは<strong>調整があります</strong>(ここでは計算していません)。 → <Link href="/okane/chousei">他の制度との調整</Link><br />
          障害年金は<strong>非課税</strong>ですが、健康保険の扶養認定では収入として数えます。 → <Link href="/gokai/hikazei-shuunyuu-zero">非課税と収入扱いのちがい</Link>
        </div>
      </section>
    </>
  );
}
