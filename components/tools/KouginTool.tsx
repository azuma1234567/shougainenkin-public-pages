"use client";
// /dougu/kougin の入力と結果。docs/dougu-2hon-2026-09-06-instructions.md §A。
// 見た目は KingakuTool と同じ部品・同じ CSS(kg-*)。計算は lib/kougin.ts、数字は data/amounts.ts。
// 入力内容はサーバーへ送らない。保存は任意で、この端末の localStorage だけ(lib/kougin-storage.ts)。
// 判定はしない: 「国の基準に当てはめると」どの範囲かを出すだけで、決定は日本年金機構が行う。
import Link from "next/link";
import { useEffect, useState } from "react";
import { KOUGIN_2026 as K, KOUGIN_REFERENCE as R } from "@/data/amounts";
import { calcKougin, emptyInput, num, VERDICT_LABEL, type KouginInput, type Pension, type Shoshin, type Work } from "@/lib/kougin";
import { clearKougin, loadKougin, saveKougin } from "@/lib/kougin-storage";

const SHOSHIN: { v: Shoshin; label: string }[] = [
  { v: "before20", label: "20歳前" },
  { v: "after20", label: "20歳以降(または厚生年金の加入中)" },
  { v: "unknown", label: "わからない" },
];
const WORK: { v: Work; label: string }[] = [
  { v: "kougin", label: "B型作業所(工賃)" },
  { v: "kyuyo", label: "A型・障害者雇用・一般就労(給与)" },
  { v: "jiei", label: "自営・その他" },
];
const PENSION: { v: Pension; label: string }[] = [
  { v: "kiso1", label: "障害基礎年金 1級" },
  { v: "kiso2", label: "障害基礎年金 2級" },
  { v: "kousei", label: "障害厚生年金(額を入力)" },
];

export default function KouginTool() {
  const [s, setS] = useState<KouginInput>(emptyInput());
  const [saved, setSaved] = useState<"" | "saved" | "cleared" | "failed">("");
  useEffect(() => { const stored = loadKougin(); if (stored) setS(stored); }, []);
  const patch = (p: Partial<KouginInput>) => { setS((prev) => ({ ...prev, ...p })); setSaved(""); };
  const numberField = (value: string) => {
    if (value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null;
  };
  const yen = (n: number) => `${num(n)}円`;

  const r = calcKougin(s);
  const showLimit = r.applies !== "no";
  const kousei = s.pension === "kousei";

  return (
    <>
      <section className="kg-card" aria-labelledby="kg-ref-heading">
        <h2 id="kg-ref-heading">目安の数字</h2>
        <table className="kg-br">
          <tbody>
            <tr><th scope="row">B型作業所の平均工賃</th><td className="kg-n">月{R.bTypeMonthly}円(年{R.bTypeYearlyApprox}円)</td></tr>
            <tr><th scope="row">A型の平均賃金</th><td className="kg-n">月{R.aTypeMonthly}円(年{R.aTypeYearlyApprox}円)</td></tr>
            <tr><th scope="row">2分の1停止の線(扶養親族なし・9月分まで)</th><td className="kg-n">{yen(K.halfBeforeOctober)}</td></tr>
          </tbody>
        </table>
        <p className="kg-hintline">作業所やA型の平均は、線の数分の1です。出典: {R.source}、日本年金機構「20歳前の傷病による障害基礎年金にかかる支給制限等」。</p>
      </section>

      <section className="kg-card" aria-labelledby="kg-input-heading">
        <h2 id="kg-input-heading">入力</h2>

        <p className="kg-f" id="kg-shoshin-label">1. 初診日は20歳前(厚生年金に入っていない期間)でしたか</p>
        <div className="kg-chips" role="group" aria-labelledby="kg-shoshin-label">
          {SHOSHIN.map((o) => (
            <button type="button" key={o.v} aria-pressed={s.shoshin === o.v} onClick={() => patch({ shoshin: o.v })}>{o.label}</button>
          ))}
        </div>
        <p className="kg-hintline">年金証書の「年金の種類」が「障害基礎年金」で、初診日が20歳の誕生日の前なら「20歳前」です。</p>
        {r.applies === "no" && (
          <p className="kg-note">初診日が20歳以降(または厚生年金の加入中)なら、本人の所得制限はありません。下の入力は、健康保険の扶養の線を見るためだけに続けます。</p>
        )}

        <p className="kg-f" id="kg-work-label">2. 働き方</p>
        <div className="kg-chips" role="group" aria-labelledby="kg-work-label">
          {WORK.map((o) => (
            <button type="button" key={o.v} aria-pressed={s.work === o.v} onClick={() => patch({ work: o.v })}>{o.label}</button>
          ))}
        </div>
        {s.work === "kougin" && <p className="kg-hintline">B型の工賃は給与ではないので、ここでは控除を引かずに計算しています(厳しめ)。実際の税務上の区分は事業所や税務署に確認してください。</p>}
        {s.work === "kyuyo" && <p className="kg-hintline">給与は、年収から給与所得控除(国税庁の表)を引いた額が所得になります。</p>}
        {s.work === "jiei" && <p className="kg-hintline">自営・その他は、所得は確定申告の額です。3 には所得(収入から必要経費を引いた額)を入れてください。</p>}

        <div className="kg-grid2">
          <div>
            <label className="kg-f" htmlFor="kg-income">3. {s.work === "jiei" ? "所得" : "年収"}(円)</label>
            <input type="number" inputMode="numeric" min={0} step={1} id="kg-income" placeholder="例: 1200000"
              value={s.income ?? ""} onChange={(e) => patch({ income: numberField(e.target.value) })} />
            <p className="kg-hintline">前年(1〜12月)の額。万円単位なら 120万円 → 1200000。</p>
          </div>
          <div className={s.work === "kougin" ? undefined : "kg-inactive"}>
            <label className="kg-f" htmlFor="kg-monthly">B型なら: 月の工賃(円)</label>
            <input type="number" inputMode="numeric" min={0} step={1} id="kg-monthly" placeholder="例: 24000"
              value={s.monthlyKougin ?? ""} onChange={(e) => patch({ monthlyKougin: numberField(e.target.value), income: null })} />
            <p className="kg-hintline">年収を入れない場合、月の工賃×12 で計算します。</p>
          </div>
        </div>

        <p className="kg-f">4. 扶養親族</p>
        <div className="kg-grid2">
          <div>
            <label className="kg-f" htmlFor="kg-dep">扶養親族の人数</label>
            <select id="kg-dep" value={s.dependents} onChange={(e) => patch({ dependents: Number(e.target.value) })}>
              {[0, 1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n === 0 ? "いない" : `${n}人`}</option>)}
            </select>
            <p className="kg-hintline">本人が扶養している親族(所得税の扶養親族。30〜69歳は控除対象扶養親族)の人数です。</p>
          </div>
          <div className={s.dependents > 0 ? undefined : "kg-inactive"}>
            <label className="kg-f" htmlFor="kg-eld">うち 70歳以上の配偶者・老人扶養親族</label>
            <select id="kg-eld" value={s.elderly} onChange={(e) => patch({ elderly: Number(e.target.value) })}>
              {[0, 1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}人</option>)}
            </select>
            <label className="kg-f" htmlFor="kg-spec">うち 特定扶養親族・19歳未満の控除対象扶養親族</label>
            <select id="kg-spec" value={s.specified} onChange={(e) => patch({ specified: Number(e.target.value) })}>
              {[0, 1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}人</option>)}
            </select>
            <p className="kg-hintline">線の加算: 1人{yen(K.dependentAddition)}、70歳以上は{yen(K.dependentElderlyAddition)}、特定等は{yen(K.dependentSpecifiedAddition)}(全額停止の線は1人{yen(K.fullLineDependentAddition)}だけ)。</p>
          </div>
        </div>

        <details className="kg-details">
          <summary>5. 任意: 社会保険料の年額</summary>
          <div className="kg-in">
            <label className="kg-f" htmlFor="kg-shakai">前年に払った社会保険料(円)</label>
            <input type="number" inputMode="numeric" min={0} step={1} id="kg-shakai" placeholder="例: 180000"
              value={s.shakaiHoken ?? ""} onChange={(e) => patch({ shakaiHoken: numberField(e.target.value) })} />
            <p className="kg-hintline">所得から引けるもののうち、この機能で扱うのは社会保険料控除だけです(国民年金法施行令 第6条の2)。本人の障害者控除は、20歳前傷病の障害基礎年金の受給権者については引けないと定められているので、入力欄を置いていません。入れなければ厳しめの結果になります。</p>
          </div>
        </details>

        <p className="kg-f" id="kg-pension-label">6. 受けている(または見込みの)年金</p>
        <div className="kg-chips" role="group" aria-labelledby="kg-pension-label">
          {PENSION.map((o) => (
            <button type="button" key={o.v} aria-pressed={s.pension === o.v} onClick={() => patch({ pension: o.v })}>{o.label}</button>
          ))}
        </div>
        {kousei && (
          <div>
            <label className="kg-f" htmlFor="kg-kousei">障害厚生年金の年額(円)</label>
            <input type="number" inputMode="numeric" min={0} step={1} id="kg-kousei" placeholder="例: 1000000"
              value={s.kouseiAmount ?? ""} onChange={(e) => patch({ kouseiAmount: numberField(e.target.value) })} />
            <p className="kg-hintline">年金証書の額。分からなければ <Link href="/dougu/kingaku">障害年金の金額</Link> で出せます。</p>
          </div>
        )}

        <div className="kg-chips">
          <button type="button" onClick={() => setSaved(saveKougin(s) ? "saved" : "failed")}>この端末に保存する</button>
          <button type="button" onClick={() => { setS(emptyInput()); setSaved(clearKougin() ? "cleared" : "failed"); }}>入力を消す</button>
          <button type="button" onClick={() => window.print()}>結果を印刷する</button>
        </div>
        <p className="kg-hintline" aria-live="polite">
          {saved === "saved" && "この端末の中だけに保存しました。サーバーには送っていません。"}
          {saved === "cleared" && "入力と保存を消しました。"}
          {saved === "failed" && "この端末では保存できませんでした(入力と結果はそのまま使えます)。"}
          {saved === "" && "保存は任意です。保存してもこの端末の中だけに残り、サーバーには送りません。"}
        </p>
      </section>

      <section className="kg-card" aria-labelledby="kg-result-heading">
        <h2 id="kg-result-heading">国の基準に当てはめると</h2>
        {r.applies === "no" ? (
          <div className="kg-note">
            初診日が20歳以降(または厚生年金の加入中)なら、本人の所得制限はありません。働いても、所得を理由に年金が止まることはありません。更新で見られるのは、所得ではなく「どんな援助の中で、どう働けているか」です。→ <Link href="/jukyuugo/hataraku">働くと年金はどうなるか</Link>
          </div>
        ) : (
          <>
            {r.applies === "unknown" && <p className="kg-hintline">初診日が20歳前かどうかで、この結果が当てはまるかが決まります。年金証書の「年金の種類」と「初診日」で確認してください。20歳以降なら所得制限はありません。</p>}
            <div className="kg-big" aria-live="polite">
              <p className="kg-y">{r.verdictBefore ? VERDICT_LABEL[r.verdictBefore] : "—"}</p>
              <p className="kg-m">
                <span>9月分まで(線 {yen(r.halfBefore)} / {yen(r.fullBefore)})<b>{r.verdictBefore ? VERDICT_LABEL[r.verdictBefore] : "—"}</b></span>
                <span>10月分から(線 {yen(r.halfAfter)} / {yen(r.fullAfter)})<b>{r.verdictAfter ? VERDICT_LABEL[r.verdictAfter] : "—"}</b></span>
              </p>
            </div>
            <h3>所得の計算</h3>
            <table className="kg-br">
              <tbody>
                <tr><th scope="row">{s.work === "jiei" ? "所得(入力)" : "年収(入力)"}</th><td className="kg-n">{r.incomeAmount === null ? "—" : yen(r.incomeAmount)}</td></tr>
                {s.work === "kyuyo" && <tr><th scope="row">給与所得控除<span className="kg-why">国税庁の表(令和7年分以降)</span></th><td className="kg-n">{r.incomeAmount === null ? "—" : `−${yen(r.salaryDeduction)}`}</td></tr>}
                {s.work === "kougin" && <tr><th scope="row">控除<span className="kg-why">工賃は控除を引かずに計算</span></th><td className="kg-n kg-zero">0円</td></tr>}
                <tr><th scope="row">社会保険料控除</th><td className={`kg-n${r.shakaiHoken === 0 ? " kg-zero" : ""}`}>{r.shakaiHoken === 0 ? "0円" : `−${yen(r.shakaiHoken)}`}</td></tr>
                <tr className="kg-total"><th scope="row">線に当てる所得</th><td className="kg-n">{r.judged === null ? "—" : yen(r.judged)}</td></tr>
                <tr><th scope="row">2分の1停止の線(9月分まで / 10月分から)</th><td className="kg-n">{yen(r.halfBefore)} / {yen(r.halfAfter)}</td></tr>
                <tr><th scope="row">全額停止の線(9月分まで / 10月分から)</th><td className="kg-n">{yen(r.fullBefore)} / {yen(r.fullAfter)}</td></tr>
                <tr><th scope="row">半額の線までの余裕(所得)</th><td className={`kg-n${r.marginBefore !== null && r.marginBefore < 0 ? " kg-zero" : ""}`}>{r.marginBefore === null ? "—" : `${yen(r.marginBefore)} / ${yen(r.marginAfter ?? 0)}`}</td></tr>
                <tr><th scope="row">年収に直すと(およそ)</th><td className="kg-n">{r.marginIncomeBefore === null ? "—" : `${yen(r.marginIncomeBefore)} / ${yen(r.marginIncomeAfter ?? 0)}`}</td></tr>
              </tbody>
            </table>
            <div className="kg-note">
              前年(1〜12月)の所得で、その年の10月分から翌年9月分までの支給が決まります。線は{K.fiscalYear}のもので、10月分から基準額が変わるため両方を出しています。
            </div>
          </>
        )}
        <p className="kg-warnbox">この結果は、公表されている基準額に入力した数字を当てたものです。決定は日本年金機構が行います。線に近い場合は、年金事務所で所得の扱いを確認してください。</p>
      </section>

      <section className="kg-card" aria-labelledby="kg-fuyou-heading">
        <h2 id="kg-fuyou-heading">健康保険の扶養の線</h2>
        <table className="kg-br">
          <tbody>
            <tr><th scope="row">年金(年額)</th><td className="kg-n">{r.pensionAmount === null ? "—" : yen(r.pensionAmount)}</td></tr>
            <tr><th scope="row">年収</th><td className="kg-n">{r.incomeAmount === null ? "—" : yen(r.incomeAmount)}</td></tr>
            <tr className="kg-total"><th scope="row">合計</th><td className="kg-n">{r.fuyouTotal === null ? "—" : yen(r.fuyouTotal)}</td></tr>
            <tr><th scope="row">障害年金を受けられる程度の障害がある人の線</th><td className="kg-n">{yen(K.dependentLimitDisabled)}未満</td></tr>
          </tbody>
        </table>
        <div className="kg-big" aria-live="polite">
          <p className="kg-y">{r.overDisabledLimit === null ? "—" : r.overDisabledLimit ? `${yen(K.dependentLimitDisabled)}以上です` : `${yen(K.dependentLimitDisabled)}未満の範囲です`}</p>
        </div>
        <div className="kg-note">
          障害年金は非課税ですが、健康保険の扶養では収入として数えます(厚生労働省通知「収入がある者についての被扶養者の認定について」)。一般の線は{yen(K.dependentLimitGeneral)}未満です。扶養に入るかどうかは、加入している健康保険(協会けんぽ・健保組合)が決めます。
        </div>
      </section>

      <section className="kg-card" aria-labelledby="kg-kousei-heading">
        <h2 id="kg-kousei-heading">厚生年金に入ると</h2>
        <div className="kg-note">
          A型や給与の人は、週の労働時間などの条件を満たせば厚生年金に加入します。障害年金は止まらず、払った保険料は将来の老齢厚生年金に積み上がります。厚生年金に入ると、国民年金保険料の法定免除(1級・2級)は外れます(厚生年金の保険料を給与から納めるため)。
        </div>
      </section>
    </>
  );
}
