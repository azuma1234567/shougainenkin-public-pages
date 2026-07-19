import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource from "@/content/columns/shoshinbi-wakaranai";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("shoshinbi-wakaranai");
export const metadata: Metadata = columnMetadata(column);

const faqs = [
  {
    question: "初診日は精神科・心療内科でないとダメですか?",
    answer:
      "いいえ。障害の原因となった傷病について初めて医師等の診療を受けた日が初診日です。関連する症状で受診した内科が初診日となる場合もあります。",
  },
  {
    question: "初診の病院が閉院・カルテ破棄でした。もう無理ですか?",
    answer:
      "転院先のカルテや紹介状、第三者証明などで確認できる場合があります。必要書類は年金事務所で個別に確認してください。",
  },
  {
    question: "受診状況等証明書とは何ですか?",
    answer:
      "初診の医療機関に作成してもらう、初診日を証明する書類です。診断書を作成する医療機関と初診の医療機関が同じ場合は原則不要です。",
  },
  {
    question: "だいたいの時期しかわかりません。申請できますか?",
    answer:
      "お薬手帳、診察券、明細、健診結果などから候補時期を絞り、医療機関や年金事務所へ確認してください。",
  },
  {
    question: "体調が悪くて、病院への照会や年金事務所に行けません。",
    answer:
      "一般的な制度相談は本人以外でもできます。個人情報を含む相談や代理手続きには原則として委任状が必要です。",
  },
  {
    question: "初診日が変わると何が変わりますか?",
    answer:
      "対象となる年金の種類、納付要件の判定期間、障害認定日などが変わる可能性があります。",
  },
];

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "moushitatesho-kakikata",
        "hatachi-mae",
        "nofu-yoken",
      ]}
      references={[
        NENKIN_REFERENCES.firstVisit,
        NENKIN_REFERENCES.thirdParty,
        NENKIN_REFERENCES.moushitatesho,
      ]}
    />
  );
}
