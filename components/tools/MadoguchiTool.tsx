"use client";
/* /dougu/madoguchi。docs/shorui-madoguchi-redesign-2026-09-03-instructions.md B が画面の正。
   (もとの設計は docs/madoguchi-tool-design-2026-09-02.md §3・§6。順番と言葉だけ差し替えた)
   窓口データは data/madoguchi(機構サイトから 2026-09-03 に取得)。lib/madoguchi は触っていない。
   住所・電話を自サイトの言い切りにしない。各件から機構ページへリンクする。
   地図は埋め込まず検索URLへのリンクだけ。入力はサーバーへ送らない。 */
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CHECKED_ON, PREFECTURES, jurisdictionOf, kankatsuUrl, machikadoOf, mapUrl,
  municipalitiesOf, telHref, type Office,
} from "@/lib/madoguchi";
import { SHORUI_ASK, SHORUI_MOCHIMONO } from "@/data/shorui";

const STORAGE_KEY = "shougainenkin-note:madoguchi:v1";
const asOf = `${CHECKED_ON.slice(0, 4)}年${Number(CHECKED_ON.slice(5, 7))}月${Number(CHECKED_ON.slice(8, 10))}日`;

export default function MadoguchiTool() {
  const [pref, setPref] = useState("");
  const [code, setCode] = useState("");
  const [shared, setShared] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const v = JSON.parse(raw);
      if (typeof v?.pref === "string" && PREFECTURES.includes(v.pref)) setPref(v.pref);
      if (typeof v?.code === "string") setCode(v.code);
    } catch { /* 使えなくても画面は動く */ }
  }, []);
  useEffect(() => {
    if (shared) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ pref, code })); } catch { /* 同上 */ }
  }, [pref, code, shared]);

  const cities = pref ? municipalitiesOf(pref) : [];
  const city = cities.find((c) => c.code === code);
  const jur = code ? jurisdictionOf(code) : null;
  const machikado = pref ? machikadoOf(pref) : [];

  return (
    <>
      {/* 本人が確実に知っているのは住所。最初の操作をそれにする(指示書 B-2)。 */}
      <section className="md-card" aria-labelledby="md-h1">
        <h2 id="md-h1">お住まい</h2>
        <div className="md-grid2">
          <div>
            <label className="md-label" htmlFor="md-pref">都道府県</label>
            <select id="md-pref" value={pref} onChange={(e) => { setPref(e.target.value); setCode(""); }}>
              <option value="">選んでください</option>
              {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="md-label" htmlFor="md-city">市区町村</label>
            <select id="md-city" value={code} onChange={(e) => setCode(e.target.value)} disabled={!pref}>
              <option value="">{pref ? "選んでください" : "都道府県を先に選んでください"}</option>
              {cities.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
        </div>
        {!pref && <p className="md-note">都道府県と市区町村を選ぶと、管轄の窓口が出ます。</p>}
        {pref && !code && <p className="md-note">市区町村を選ぶと、管轄の年金事務所が出ます。街角の年金相談センターは下に出しています。</p>}
      </section>

      {jur && city && (
        <section className="md-card" aria-labelledby="md-h2">
          <h2 id="md-h2">あなたの年金事務所</h2>
          {jur.differs && (
            <p className="md-warnbox">
              <b>{city.name}は、厚生年金と国民年金で管轄の年金事務所が違います。</b>
              相談と提出で行く場所が違うことがあります。どちらに行けばよいか迷ったら、窓口で確かめてください。
            </p>
          )}
          {jur.differs ? (
            <>
              <OfficeGroup title="会社員だった方(厚生年金)の請求・相談"
                offices={jur.kousei} split={jur.split} splitText={jur.splitText.kousei} pref={pref} cityName={city.name} />
              <OfficeGroup title="国民年金の方の相談"
                offices={jur.kokumin} split={jur.split} splitText={jur.splitText.kokumin} pref={pref} cityName={city.name} />
            </>
          ) : (
            <OfficeGroup title="厚生年金・国民年金とも"
              offices={jur.kousei} split={jur.split} splitText={jur.splitText.kousei} pref={pref} cityName={city.name} />
          )}

          {/* 質問して分岐せず、両方を並べて1行で説明する(指示書 B-3)。 */}
          <p className="md-note md-where">
            国民年金だけの請求(障害基礎年金)は、お住まいの市区町村の国民年金の窓口にも出せます。20歳前に初診日がある方も同じです。
            初診日が第3号被保険者(会社員の配偶者)の期間にある方は年金事務所へ。
          </p>
          <p className="md-note no-print">
            郵送でも出せます。控えを取り、送った記録が残る方法で送ってください。 → <Link href="/columns/teishutsusaki-yuusou" prefetch={false}>提出先と郵送のしかた</Link>
          </p>

          <p className="md-asof">
            住所・電話・管轄は<strong>日本年金機構の公表({CHECKED_ON} 取得)による</strong>ものです。統廃合や移転があるため、行く前に各件の「機構の公式ページ」で確認してください({asOf}時点)。
          </p>
        </section>
      )}

      {/* 街角は県内どこでも使えるので一覧が長い。紙は「行く窓口」に絞るため印刷しない。 */}
      {pref && machikado.length > 0 && (
        <section className="md-card md-screen-only" aria-label="街角の年金相談センター">
          <h3>街角の年金相談センター</h3>
          <p className="md-note md-note-tight">
            管轄はありません。{pref}のどこにお住まいでも使えます。
            <br /><strong>年金証書の再発行・国民年金の加入納付・事業所の手続きは扱っていません。</strong>これらは年金事務所へ。
          </p>
          {machikado.map((o) => <OfficeCard key={o.id} office={o} />)}
        </section>
      )}

      <section className="md-card" aria-labelledby="md-h4">
        <h2 id="md-h4">予約のしかた</h2>
        <p className="md-warnbox"><b>予約なしで行くと、長く待つことがあります。</b>相談は予約制です。当日に相談したい場合は、直接年金事務所へ行くことになります。</p>
        <table className="md-yoyaku">
          <tbody>
            <tr><th scope="row">予約受付専用電話</th><td>
              <a className="md-tel" href={telHref("0570-05-4890")}>0570-05-4890</a>(ナビダイヤル)<br />
              <a className="md-tel" href={telHref("03-6631-7521")}>03-6631-7521</a>(一般電話)<br />
              <span className="md-small">ナビダイヤルは通話料がかかります。一般電話のほうが安くなることがあります。</span>
            </td></tr>
            <tr><th scope="row">受付時間</th><td>月曜〜金曜 8:30〜17:15<br /><span className="md-small">土日祝と12月29日〜1月3日は利用できません</span></td></tr>
            <tr><th scope="row">いつの予約が取れるか</th><td>翌日以降<br /><span className="md-small">当日に相談したい場合は、直接年金事務所へ</span></td></tr>
            <tr><th scope="row">電話するとき手元に</th><td>基礎年金番号がわかるもの<br /><span className="md-small">または、通知書などに書かれた照会番号</span></td></tr>
            <tr><th scope="row">窓口の相談開始時間</th><td>平日 9:00〜16:00 ／ 土曜開所日 10:00〜15:00 ／ 延長開所日 9:00〜18:00</td></tr>
            <tr><th scope="row">ネット予約</th><td>年金請求の手続きのみ(マイナポータル・ねんきんネット・インターネット予約サイト)<br /><span className="md-small">「老齢」「障害年金の請求に関する手続き」「遺族・未支給」の3つが対象。受付は全日 8:00〜23:30</span></td></tr>
          </tbody>
        </table>
        <p className="md-asof">
          出典: 日本年金機構{" "}
          <a href="https://www.nenkin.go.jp/section/tel/yoyaku.html" rel="noreferrer">予約受付専用電話</a>{" ・ "}
          <a href="https://www.nenkin.go.jp/section/guidance/yoyaku.html" rel="noreferrer">予約相談について</a>{" "}
          / 確認日 {CHECKED_ON}
        </p>
      </section>

      {/* 見出しだけ出して折りたたむ(指示書 B-2)。印刷では開いた状態で出す。 */}
      <details className="md-card md-fold">
        <summary>行く日の持ち物</summary>
        <ul className="md-list">{SHORUI_MOCHIMONO.map((m) => <li key={m}>{m}</li>)}</ul>
      </details>

      <details className="md-card md-fold">
        <summary>窓口で聞くこと</summary>
        <ul className="md-list">{SHORUI_ASK.map((a) => <li key={a.text}>{a.strong ? <b>{a.text}</b> : a.text}</li>)}</ul>
      </details>

      <div className="md-row no-print">
        <button type="button" className="md-btn" onClick={() => window.print()}>この紙を印刷する</button>
        <Link className="md-btn md-ghost" href="/columns/teishutsusaki-yuusou" prefetch={false}>郵送で出したいとき</Link>
        <button type="button" className="md-opt-btn" aria-pressed={shared}
          onClick={() => { const next = !shared; setShared(next); if (next) { try { localStorage.removeItem(STORAGE_KEY); } catch { /* 同上 */ } } }}>
          共用のパソコンを使っています(この端末に保存しない)
        </button>
      </div>

      <section className="md-card no-print" aria-labelledby="md-next">
        <h2 id="md-next">ここからできること</h2>
        <div className="dougu-cross">
          <Link className="dougu-band-card" href="/dougu/shorui" prefetch={false}><b>何をそろえればいい？</b><span>自分の場合に要る書類だけを、持ち物と一緒に1枚にします</span></Link>
          <Link className="dougu-band-card" href="/dougu/moushitatesho" prefetch={false}><b>申立書を、自分で書きたい</b><span>いちばん重い書類を、フォームに沿って書きます</span></Link>
        </div>
      </section>
    </>
  );
}

function OfficeGroup({ title, offices, split, splitText, pref, cityName }: {
  title: string; offices: Office[]; split: boolean; splitText: string[]; pref: string; cityName: string;
}) {
  if (offices.length === 0) return null;
  return (
    <div className="md-group">
      <h3>{title}</h3>
      {split && offices.length > 1 && (
        <p className="md-warnbox">
          <b>{cityName}は、町名によって事務所が分かれます。</b>下の2か所のどちらになるかは、機構の管轄区域表で確認してください。
          {splitText[0] && <><br /><span className="md-splittext">機構の記載: {splitText[0].slice(0, 60)}…ほか</span></>}
          <br /><a href={kankatsuUrl(pref)} rel="noreferrer">{pref}の年金事務所管轄区域(機構)</a>
        </p>
      )}
      {offices.map((o) => <OfficeCard key={o.id} office={o} />)}
    </div>
  );
}

function OfficeCard({ office: o }: { office: Office }) {
  return (
    <div className="md-office">
      <p className="md-n">
        {o.name}
        <span className="md-kind">{o.kind === "nenkin" ? "年金事務所" : o.sub === "office" ? "街角(オフィス)" : "街角(センター)"}</span>
      </p>
      <p className="md-a">〒{o.zip}　{o.addr}{o.access && <><br />{o.access}</>}</p>
      {o.tel && (
        <p className="md-tel-row">電話 <a className="md-tel" href={telHref(o.tel)}>{o.tel}</a>{o.telNote && <span className="md-small">（{o.telNote}）</span>}</p>
      )}
      <p className="md-source">日本年金機構の公表({CHECKED_ON} 取得)による</p>
      <p className="md-lk no-print">
        <a href={mapUrl(o.addr)} rel="noreferrer">地図を開く</a>
        <a href={o.url} rel="noreferrer">機構の公式ページ</a>
      </p>
    </div>
  );
}
