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
      "初診日が20歳前(厚生年金非加入期間)にあれば、納付要件は問われません。それが20歳前傷病による障害基礎年金の核心です。ただし1級・2級に該当する障害状態であることは必要です。",
  },
  {
    question: "通常の障害年金と何が違いますか?",
    answer:
      "納付要件が不要な代わりに、本人の前年所得による支給制限(半額停止・全額停止)があります。また基礎年金のみなので3級相当では受給できません。",
  },
  {
    question: "高校卒業後すぐ就職し、在職中(19歳)に初診でした。20歳前傷病ですか?",
    answer:
      "いいえ。20歳前でも厚生年金加入中の初診は通常の障害厚生年金の扱いです。納付要件は問われますが、3級や障害手当金を含む厚生年金の保障対象になります。",
  },
  {
    question: "20歳になったら自動的にもらえますか?",
    answer:
      "自動ではありません。請求手続きが必要です。障害認定日(20歳前初診で認定日が20歳前に来る場合は20歳到達日)の前後3か月以内の診断書を用意して請求します。",
  },
  {
    question: "10代の頃の病院がもう閉院しています。",
    answer: "転院先の紹介状やカルテに前医の情報が残っていれば初診日を確定できるケースがあります。学校の記録などの参考資料も使えます。",
  },
  {
    question: "親が代わりに手続きできますか?",
    answer:
      "一般的な制度相談は親もできます。個人情報を含む相談や代理手続きには原則として本人の委任状が必要です。医療機関への照会に必要な書類も事前に確認してください。親が見てきた生活状況のメモは、申立書などを作る際の材料にもなります。",
  },
  {
    question: "発達障害と知的障害で扱いは違いますか?",
    answer:
      "先天性の知的障害(精神遅滞)は出生日が初診日として扱われます。後天的な原因による知的障害は扱いが異なります。発達障害は原則として、その傷病について初めて診療を受けた日が初診日です。10代で受診していれば20歳前傷病、成人後の初受診なら通常の類型になります。",
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
