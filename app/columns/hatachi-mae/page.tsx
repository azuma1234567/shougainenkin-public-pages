import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource from "@/content/columns/hatachi-mae";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("hatachi-mae");
export const metadata: Metadata = columnMetadata(column);

const faqs = [
  {
    question: "保険料を一度も払っていませんが、本当に受給できますか?",
    answer:
      "年金制度に加入していない20歳前に初診日がある場合、保険料の納付要件は問われません。ただし障害等級1級または2級に該当する状態であることなどが必要です。",
  },
  {
    question: "通常の障害年金と何が違いますか?",
    answer:
      "納付要件が不要な一方、本人の前年所得による支給制限があります。障害基礎年金には3級がありません。",
  },
  {
    question: "高校卒業後すぐ就職し、在職中(19歳)に初診でした。20歳前傷病ですか?",
    answer:
      "20歳前でも厚生年金加入中の初診は障害厚生年金の対象となり得ます。納付要件を含め、年金事務所で確認してください。",
  },
  {
    question: "20歳になったら自動的にもらえますか?",
    answer:
      "自動ではなく請求手続きが必要です。初診日と障害認定日に応じた診断書などを準備します。",
  },
  {
    question: "10代の頃の病院がもう閉院しています。",
    answer:
      "転院先の紹介状やカルテ、学校の記録などが参考資料になる場合があります。年金事務所で必要書類を確認してください。",
  },
  {
    question: "親が代わりに手続きできますか?",
    answer:
      "一般的な制度相談は親もできます。個人情報を含む相談や代理手続きには原則として本人の委任状が必要です。",
  },
  {
    question: "発達障害と知的障害で扱いは違いますか?",
    answer:
      "先天性の知的障害は出生日が初診日として扱われます。後天的な知的障害や発達障害は扱いが異なるため個別に確認してください。",
  },
];

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "hattatsu-shougai",
        "shoshinbi-wakaranai",
        "moushitatesho-kakikata",
      ]}
      references={[
        NENKIN_REFERENCES.jukyuYoken,
        NENKIN_REFERENCES.beforeTwenty,
        NENKIN_REFERENCES.firstVisitProof,
      ]}
    />
  );
}
