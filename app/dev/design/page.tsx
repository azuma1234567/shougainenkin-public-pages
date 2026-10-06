import type { Metadata } from "next";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import CaseLead from "@/components/platform/CaseLead";
import { DouguCard } from "@/components/platform/DouguCard";
import { CaseCard } from "@/components/platform/Platform";
import { GOKAI_BODIES } from "@/data/gokai-bodies";
import { extractColumnFaqs, getColumn } from "@/lib/columns";
import { gokaiCardBySlug } from "@/lib/gokai";
import { SAIKETSU_CASES } from "@/lib/saiketsu";
import { pageMetadata } from "@/lib/seo";
import shinsatsuSource, { lead as shinsatsuLead } from "@/content/columns/shinsatsu-mae-memo";
import "@/app/columns/columns.css";

/* 部品の見本ページ(docs/design-system.md §2-4、docs/design-system-2026-10-06-instructions.md §3-2)。
   いまの CSS がどう見えるかを、実データで 1 か所に並べる。公開ページではないので noindex・sitemap 外
   (lib/sitemap-excluded.ts)。ここに専用の CSS は足さない: 各部品は本番と同じクラスで描き、見本ページだけの
   見出し・注記は下の <style> に閉じる(globals.css を増やさない)。 */

const PATH = "/dev/design";
const COLUMN_SLUG = "shinsatsu-mae-memo";
const GOKAI_SLUG = "chokin-ga-aru";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "部品の見本(デザインシステム)",
    description: "サイトで使う部品(結論の箱・次に読む・誤解カード・裁決リード・表・FAQ・出典・CTA・ボタン・リンク)を実データで並べた、運営者向けの確認ページです。",
    path: PATH,
  }),
  robots: { index: false, follow: false },
};

/* 裁決リードを持つ誤解カードを 1 枚、原稿から探す(手で id を書かない。原稿が変わっても実在する 1 件を出す) */
function firstCaseBlock() {
  for (const body of Object.values(GOKAI_BODIES)) {
    for (const section of body.sections) {
      for (const block of section.blocks) {
        if (block.type === "case") return { body, block };
      }
    }
  }
  throw new Error("裁決リードを持つ誤解カードが無い");
}

const TOKENS: { group: string; names: string[] }[] = [
  { group: "無彩色", names: ["--ink", "--ink-muted", "--ink-faint", "--paper", "--paper-deep", "--paper-card", "--line", "--line-strong"] },
  { group: "primary", names: ["--primary", "--primary-deep", "--primary-wash"] },
  { group: "強調・意味色", names: ["--mark", "--ok", "--warn", "--danger"] },
];

function Note({ children }: { children: React.ReactNode }) {
  return <p className="ds-note">{children}</p>;
}

export default function DesignSamplePage() {
  const column = getColumn(COLUMN_SLUG);
  const next = column.nextSlug ? getColumn(column.nextSlug) : null;
  const faq = extractColumnFaqs(shinsatsuSource)[0];
  const gokai = gokaiCardBySlug(GOKAI_SLUG);
  if (!gokai) throw new Error(`誤解カードが無い: ${GOKAI_SLUG}`);
  const { body: caseBody, block: caseBlock } = firstCaseBlock();
  const saiketsu = SAIKETSU_CASES.find((item) => item.id === caseBlock.caseId);
  if (!saiketsu) throw new Error(`裁決が無い: ${caseBlock.caseId}`);

  return (
    <>
      <style>{`
        .ds-page h2.ds-h { margin: 56px 0 8px; padding: 0 0 6px; border: 0; border-bottom: 2px solid var(--line-strong); font-family: inherit; font-size: 1.05rem; color: var(--ink-muted); }
        .ds-note { margin: 0 0 16px; color: var(--ink-muted); font-size: 0.88rem; line-height: 1.7; }
        .ds-swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin: 12px 0 20px; padding: 0; list-style: none; }
        .ds-swatches li { margin: 0; padding: 10px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--paper-card); font-size: 12px; line-height: 1.5; }
        .ds-swatches i { display: block; height: 36px; margin-bottom: 6px; border: 1px solid var(--line); border-radius: 6px; }
        .ds-swatches code { font-size: 11px; color: var(--ink-muted); }
        .ds-scale li { margin: 10px 0; list-style: none; }
        .ds-scale { padding: 0; }
        .ds-buttons { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin: 0 0 12px; }
        .ds-buttons .guide-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0.6rem 1.2rem; }
        .ds-page .platform { padding: 24px 0 40px; }
        .ds-page .platform .p-container { max-width: 760px; margin-inline: auto; padding-inline: 20px; }
        .ds-page .platform h2.ds-h { margin-top: 32px; }
        .ds-grid-2 { display: grid; gap: 14px; }
        @media (min-width: 640px) { .ds-grid-2 { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <article className="column-article ds-page">
        <Breadcrumb current="部品の見本" showColumns={false} />
        <h1>部品の見本(デザインシステム 第1段)</h1>
        <p className="meta-line">運営者向け。noindex。docs/design-system.md の §2-4 と対応。描かれているのは本番と同じクラス・同じ CSS。</p>

        <h2 className="ds-h">色のトークン(app/design-tokens.css)</h2>
        <Note>意味で命名した色。旧名(--green など)はこの値のエイリアス。第1段では値を変えていない。</Note>
        {TOKENS.map((group) => (
          <ul className="ds-swatches" key={group.group} aria-label={group.group}>
            {group.names.map((name) => (
              <li key={name}><i style={{ background: `var(${name})` }} /> <code>{name}</code></li>
            ))}
          </ul>
        ))}

        <h2 className="ds-h">型スケール 6 段(第2段で適用。いまは見本だけ)</h2>
        <ul className="ds-scale">
          <li style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-h1)", lineHeight: "var(--leading-heading)", letterSpacing: "var(--tracking-heading)" }}>h1 30px 障害年金の診断書、主治医に渡すメモ</li>
          <li style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-h2)", lineHeight: "var(--leading-heading)", letterSpacing: "var(--tracking-heading)" }}>h2 24px メモに書く 3 つのこと</li>
          <li style={{ fontWeight: 700, fontSize: "var(--text-h3)", lineHeight: "var(--leading-heading)" }}>h3 19px 事実・頻度・誰の助けがあるか</li>
          <li style={{ fontSize: "var(--text-body)", lineHeight: "var(--leading-body)", letterSpacing: "var(--tracking-body)" }}>本文 17px 「入浴できています」ではなく「入浴は週2回、母に声をかけられて」と書く。</li>
          <li style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)" }}>小 15px 補足や表の中の文字。</li>
          <li style={{ fontSize: "var(--text-note)", lineHeight: "var(--leading-body)", color: "var(--ink-muted)" }}>注 13px 出典・日付・件数。</li>
          <li style={{ fontVariantNumeric: "tabular-nums", fontSize: "var(--text-body)" }}>数字 tabular-nums: 1,039,625円 / 831,700円 / 34.0%</li>
        </ul>

        <h2 className="ds-h">結論の箱(lead) — {column.title.split(/\s*—\s*/)[0]}</h2>
        <Note>記事の冒頭。地 --paper-deep、角丸 12px。実物は content/columns の lead(実在の記事 {COLUMN_SLUG})。</Note>
        <section className="column-conclusion" aria-labelledby="ds-conclusion-heading">
          <h2 id="ds-conclusion-heading">この記事の結論</h2>
          {shinsatsuLead.map((line, index) => <p key={index}>{line}</p>)}
        </section>

        <h2 className="ds-h">次に読む 1 本</h2>
        <Note>結論の箱の直後に 1 行。hover で矢印が 4px 右へ動くのは第2段。</Note>
        {next && (
          <p className="column-next">
            <span className="column-next-label">次に読む</span>
            <span aria-hidden="true"> → </span>
            <Link href={`/columns/${next.slug}`}>{next.title.split(/\s*—\s*/)[0]}</Link>
          </p>
        )}

        <h2 className="ds-h">目次(ArticleToc)</h2>
        <Note>article の h2 から自動生成。このページでは見本の見出しが並ぶ。</Note>
        <ArticleToc />

        <h2 className="ds-h">表(横スクロール)</h2>
        <Note>見出し行の地 --paper-deep(現行 --green-pale)。数字の右寄せ・tabular は第2段。</Note>
        <div className="column-body">
          <figure className="article-table-figure">
            <p className="article-table-hint">→ 横にスクロールできます</p>
            <div className="article-table-wrap" tabIndex={0}>
              <table>
                <thead><tr><th>書類</th><th>誰が用意するか</th><th>注意点</th></tr></thead>
                <tbody>
                  <tr><th scope="row">受診状況等証明書</th><td>初診の医療機関</td><td>初診日の証明。診断書を書く病院と同じなら不要</td></tr>
                  <tr><th scope="row">診断書</th><td>いまの主治医</td><td>障害認定日請求は認定日から 3 か月以内の現症</td></tr>
                  <tr><th scope="row">病歴・就労状況等申立書</th><td>自分(家族でも可)</td><td>診断書と同じ生活が書かれているかを見られる</td></tr>
                </tbody>
              </table>
            </div>
          </figure>
        </div>

        <h2 className="ds-h">FAQ(開閉なし)</h2>
        <Note>AIO のため全文表示。Q は h3。実在の記事 {COLUMN_SLUG} の FAQ 1 問目。</Note>
        <div className="column-body">
          <h3 className="column-faq-question" data-yougo-skip>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>

        <h2 className="ds-h">出典</h2>
        <Note>13px・--ink-muted は第2段。いまは本文と同じ大きさ。</Note>
        <section className="references">
          <h2>出典</h2>
          <ul>
            <li><a href={NENKIN_REFERENCES.seido.href} target="_blank" rel="noopener noreferrer">{NENKIN_REFERENCES.seido.label}</a></li>
          </ul>
          <p className="small-note">記事の最終確認日時点の内容です。</p>
        </section>

        <h2 className="ds-h">CTA(App Store)</h2>
        <Note>1 ページ 2 か所まで。</Note>
        <AppCta ct="dev-design" />

        <h2 className="ds-h">ボタン 3 種・リンク</h2>
        <Note>primary(塗り)/ secondary(罫)/ text。最小タップ領域 44px。本文中のリンクは下線あり。</Note>
        <div className="ds-buttons">
          <a className="guide-btn guide-btn-primary" href="#ds-top">申請の流れを見る</a>
          <a className="guide-btn guide-btn-secondary" href="#ds-top">つまずきやすい点</a>
          <Link href="/columns">コラムの一覧へ →</Link>
        </div>
        <p>本文中のリンクはこう見えます: <a href="/jitsurei">公開されている裁決例</a> を読むと、審査が何を見ているかが分かります。Tab キーで移動すると 3px の青いアウトラインが出ます。</p>

        <h2 className="ds-h">道具カード(dougu)</h2>
        <Note>記事中(.mt-column-card)とハブ用。</Note>
        <DouguCard placement="mitate" />
        <DouguCard placement="kingaku" variant="hub" />

        <h2 className="ds-h">裁決リード(記事中)</h2>
        <Note>札(容認 = --ok、棄却 = --ink-muted)+ 1 行要旨 + PDF リンク。実在の誤解カード「{caseBody.title}」の 1 件。</Note>
        <div className="column-body">
          <div className="gokai-case"><p><CaseLead lead={caseBlock.lead} caseId={caseBlock.caseId} /> — {caseBlock.text.replace(/\*\*/g, "")}</p></div>
        </div>
      </article>

      <div className="platform ds-page">
        <div className="p-container">
          <h2 className="ds-h">誤解カード(一覧)</h2>
          <Note>押せることが分かる手触り(hover で 1px 浮く + 影)は第2段。実在のカード {GOKAI_SLUG}。</Note>
          <div className="gokai-grid">
            <Link className="gokai-card" href={`/gokai/${gokai.slug}`}>
              <span className="gokai-card-category">{gokai.category}</span>
              <h3>{gokai.misconception}</h3>
              <p><b>本当は</b>{gokai.truth}</p>
            </Link>
          </div>

          <h2 className="ds-h">裁決カード(jitsurei の一覧)</h2>
          <Note>実在の裁決 {saiketsu.id}。</Note>
          <CaseCard item={saiketsu} />

          <h2 className="ds-h">ハブの章カード</h2>
          <Note>/byoki などの一覧カード(.hub-card)。</Note>
          <div className="ds-grid-2">
            <Link className="hub-card" href="/byoki/utsu-soukyoku">
              <h3>うつ病・双極性障害</h3>
              <p>精神の障害で最も申請が多い病名。</p>
              <span className="hub-card-meta"><span>記事と実例</span><b>読む →</b></span>
            </Link>
          </div>

          <h2 className="ds-h">パンくず(platform 版)・ヘッダー・フッター</h2>
          <Note>ヘッダーとフッターはこのページの上下に本番のものが出ている。パンくずは記事版(.breadcrumb)がページ最上部、platform 版(.p-breadcrumb)が下。</Note>
          <nav className="p-breadcrumb" aria-label="見本のパンくず"><span><Link href="/">トップ</Link></span><span> / <Link href="/byoki">病気別</Link></span><span> / うつ病・双極性障害</span></nav>
        </div>
      </div>
    </>
  );
}
