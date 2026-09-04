import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/jushinjokyo-shomeisho";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("jushinjokyo-shomeisho"), lead };

// 本文「依頼の流れ」の5ステップを HowTo で出す。
const STEPS = [
  { name: "初診の病院に電話する", text: "障害年金用の受診状況等証明書を作成してもらえるか確認する(カルテが残っているかの確認を含む)" },
  { name: "様式を持参または郵送する", text: "病院によっては郵送での受付・返送に対応" },
  { name: "作成を待つ", text: "かかる期間は病院によって異なります" },
  { name: "受け取り、費用を支払う", text: "文書料は病院によって異なります" },
  { name: "内容を確認し、コピーを取る", text: "初診日の日付、傷病名、記載の有無を確認し、必ずコピーを取ってから提出します" },
];
const HOW_TO_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "受診状況等証明書を病院に依頼する流れ",
  description: "障害年金の初診日を証明する受診状況等証明書を、初診の病院に依頼して受け取るまでの5ステップ。",
  step: STEPS.map((step, index) => ({ "@type": "HowToStep", position: index + 1, name: step.name, text: step.text })),
};
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      extraJsonLd={[HOW_TO_JSON_LD]}
      relatedSlugs={[
        "shoshinbi-wakaranai",
        "shoshinbi-karute-nashi",
        "shoshinbi-haiin",
        "nenkin-jimusho-soudan",
        "hitsuyou-shorui-seishin",
        "shindansho-irai-timing",
      ]}
      references={[
  {
    "label": "日本年金機構「障害年金の請求手続き等に使用する診断書・関連書類」",
    "href": "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/index.html"
  },
  {
    "label": "日本年金機構「初診日」",
    "href": "https://www.nenkin.go.jp/service/yougo/sagyo/syosinbi.html"
  }
]}
    />
  );
}
