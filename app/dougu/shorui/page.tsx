import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import ShoruiTool from "@/components/tools/ShoruiTool";
import { TOOLS } from "@/data/dougu";
import { SHINDANSHO_FORMS, SHINDANSHO_NAIBU, SHORUI_DOCS, SHORUI_URLS, emptyShoruiAnswers } from "@/data/shorui";
import { shoruiDocs, shoruiSections } from "@/lib/shorui";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";

const UPDATED = "2026-09-08";
/* 書類データの照合日(data/shorui.ts §6。日本年金機構の公式ページから転記した日) */
const CHECKED_ON = "2026-09-03";

const DESCRIPTION =
  "誰にでも要る書類を先に出しています。下の質問に答えると、自分の場合に要るものが足されます。年金事務所へ行く日の持ち物と、窓口で聞くことも一緒にA4 1枚で印刷できます。入力内容は送信されません。";

const isPublished = isPublishedInternalPath("/dougu/shorui");

export const metadata: Metadata = {
  ...pageMetadata({ title: TOOLS.shorui.question, description: DESCRIPTION, path: "/dougu/shorui", showAppBanner: true, appBannerArgument: "https://shougainenkin-note.net/dougu/shorui" }),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};

/* よくある質問(docs/seo-nokori-2026-09-07-instructions.md §2-1)。本文と FAQPage の JSON-LD で同じ文字列(JSON-LD には文字だけ。リンクは本文側だけ)。 */
const FAQ = [
  { q: "診断書は、初診の病院に頼むのですか", a: "いいえ。いまの状態を書けるのは、いま通っている病院の医師です。初診の病院には、初診日を証明する受診状況等証明書を頼みます(同じ病院なら不要)。" },
  { q: "診断書の日付に決まりはありますか", a: "あります。事後重症請求では、現症日(診断書に書かれた「現在の状態」の日)が請求日より前3か月以内。認定日請求では、障害認定日から3か月以内の現症日が必要です。" },
  { q: "用紙はどこでもらえますか", a: "年金事務所と市区町村の年金窓口、または日本年金機構のサイトから印刷。診断書の様式は障害の種類ごとに違います。" },
  { q: "国に払う手数料はありますか", a: "ありません。かかるのは病院の文書料(診断書・受診状況等証明書)と、戸籍や住民票の発行手数料、郵送費です。" },
  { q: "書類が足りないと、どうなりますか", a: "年金事務所の窓口で点検してもらえます。足りないものは後から出せることが多く、受付日が動く場合があるので、窓口で確認してください。" },
] as const;
const faqLd = faqJsonLd(FAQ.map((f) => ({ question: f.q, answer: f.a })));

/* 静的な本文(検索エンジンと AI に読める分)。書類名・説明・様式名・URL はすべて data/shorui.ts から。 */
const ALWAYS = new Set(shoruiDocs(emptyShoruiAnswers()).map((d) => d.id));
const SECTIONS = shoruiSections(SHORUI_DOCS);

function StaticBody() {
  return (
    <div className="sr-static">
      <section aria-labelledby="sr-static-all">
        <h2 id="sr-static-all">書類の全体像</h2>
        <p>もらう場所ごとに並べています。「誰にでも要るもの」は全員に、「条件つき」は当てはまる人だけに要ります。上の質問に答えると、自分の場合の一覧になります。</p>
        {SECTIONS.map((sec) => (
          <div className="sr-static-sec" key={sec.sec}>
            <h3>{sec.sec}</h3>
            <ul>
              {sec.docs.map((d) => (
                <li key={d.id}>
                  <b>{d.n}</b><span className="sr-static-tag">{ALWAYS.has(d.id) ? "誰にでも要るもの" : `条件つき${d.why ? `(${d.why})` : ""}`}</span>
                  {d.stuck ? <span className="sr-static-note">{d.stuck}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <section aria-labelledby="sr-static-forms">
        <h2 id="sr-static-forms">診断書は障害の種類で様式が違う</h2>
        <p>用紙は年金事務所でもらえるほか、日本年金機構のサイトから印刷できます。</p>
        <ul>
          {SHINDANSHO_FORMS.map((f) => <li key={f.key}><a href={f.url} rel="noreferrer">{f.name}</a></li>)}
          {SHINDANSHO_NAIBU.map((f) => <li key={f.name}><a href={f.url} rel="noreferrer">{f.name}</a></li>)}
        </ul>
      </section>
      <section aria-labelledby="sr-static-shoshin">
        <h2 id="sr-static-shoshin">初診の病院と、診断書を書く病院が違うとき</h2>
        <p>初診の病院で受診状況等証明書をもらいます。取れないときは「受診状況等証明書が添付できない申立書」と、初診日を示す参考資料を出します。 → <Link href="/nayami/shoshinbi-karute">初診日のカルテがないとき</Link></p>
      </section>
      <section aria-labelledby="sr-static-faq">
        <h2 id="sr-static-faq">よくある質問</h2>
        <dl>{FAQ.map((f) => <div key={f.q}><dt>{f.q}</dt><dd>{f.a}{f.q === "国に払う手数料はありますか" && <> <Link href="/erabu/hiyou-souba">→ 障害年金にかかるお金の話</Link></>}</dd></div>)}</dl>
      </section>
      <p className="sr-static-src">出典: 日本年金機構 <a href={SHORUI_URLS.kisoSeikyuu} rel="noreferrer">障害基礎年金を請求するとき</a> ／ <a href={SHORUI_URLS.kouseiSeikyuu} rel="noreferrer">障害厚生年金を請求するとき</a> ／ <a href={SHORUI_URLS.shindanshoIndex} rel="noreferrer">障害年金の請求手続き等に使用する診断書・関連書類</a>(確認日 {CHECKED_ON})</p>
    </div>
  );
}

export default function Page() {
  return (
    <div className="platform sr-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <header className="no-print">
        <div className="p-container sr-width sr-top">
          <Breadcrumb
            items={[{ href: "/", label: "トップ" }, { href: "/shinsei", label: "申請の流れ" }, { label: "必要書類チェックリスト" }]}
            currentPath="/dougu/shorui"
          />
          <h1>{TOOLS.shorui.question}</h1>
          <p className="sr-lead">誰にでも要る書類を先に出しています。下の質問に答えると、自分の場合に要るものが足されます。</p>
          <p className="jc-hero-meta jc--shorui">
            <span className="jc-time">{TOOLS.shorui.time}</span>
            <span className="jc-basis">入力した内容は送信しません</span>
          </p>
        </div>
      </header>

      <div className="p-container sr-width sr-main">
        <p className="sr-printhead">
          障害年金の必要書類チェックリスト（障害年金申請サポート）。これで全部とは限りません。最後は年金事務所で確認してください。
        </p>
        <ShoruiTool />
        <div className="no-print">
          <StaticBody />
          <p><Link href="/shinsei">申請の流れへ戻る</Link></p>
          <p className="dougu-app-link"><Link href="/app">同じ機能をアプリで続ける →</Link></p>
          <PageDate updated={UPDATED} />
        </div>
      </div>
    </div>
  );
}
