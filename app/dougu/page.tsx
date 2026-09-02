import type { Metadata } from "next";
import { Breadcrumb } from "@/components/platform/Platform";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "障害年金の等級の目安、金額、必要書類、年金事務所、申立書を、ひとつずつ確認・準備するための道具をまとめています。";

export const metadata: Metadata = pageMetadata({
  title: "道具の置き場所",
  description: DESCRIPTION,
  path: "/dougu",
});

const tools = [
  {
    number: "01",
    title: "等級の目安をしらべる",
    description: "自分がどのあたりかを、国の基準に沿って確認します。",
  },
  {
    number: "02",
    title: "障害年金の金額",
    description: "等級や加入していた制度などから、受け取る金額の目安を内訳つきで確認します。",
  },
  {
    number: "03",
    title: "必要書類チェックリスト",
    description: "自分の場合に必要な書類と、そろえる順番を確認します。",
  },
  {
    number: "04",
    title: "年金事務所を探す",
    description: "相談や提出に行く年金事務所と、当日の準備を確認します。",
  },
  {
    number: "05",
    title: "申立書をつくる",
    description: "発病から現在までを期間に分けて、申立書の下書きをつくります。",
    href: "/dougu/moushitatesho",
  },
] as const;

export default function DouguPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "トップ", path: "/" },
    { name: "道具の置き場所", path: "/dougu" },
  ]);

  return (
    <div className="platform dougu-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <header className="dougu-hero">
        <div className="p-container dougu-width">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { label: "道具" }]} currentPath="/dougu" />
          <p className="dougu-kicker">申請の準備を、ひとつずつ</p>
          <h1>道具の置き場所</h1>
          <p className="p-hero-copy">
            調べる、見積もる、そろえる、書く、出す。障害年金の準備で必要になる道具を、ここにまとめていきます。
          </p>
        </div>
      </header>

      <section className="dougu-section" aria-labelledby="dougu-list-heading">
        <div className="p-container dougu-width">
          <div className="dougu-section-head">
            <h2 id="dougu-list-heading">5つの道具</h2>
            <p>まだ公開していない道具は「準備中」と表示しています。</p>
          </div>

          <div className="dougu-grid">
            {tools.map((tool) => {
              const href = "href" in tool ? tool.href : undefined;
              const content = <>
                <div className="dougu-card-top">
                  <span className="dougu-number" aria-hidden="true">{tool.number}</span>
                  <span className="dougu-status">{href ? "公開中" : "準備中"}</span>
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
              </>;
              return href ? <a className="dougu-card dougu-card-link" href={href} key={tool.number}>{content}</a> : <article className="dougu-card" key={tool.number}>{content}</article>;
            })}
          </div>

          <p className="dougu-note">
            準備中の道具を使うための登録や予約は必要ありません。公開できたものから、このページでお知らせします。
          </p>
        </div>
      </section>
    </div>
  );
}
