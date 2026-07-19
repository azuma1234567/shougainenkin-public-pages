import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import {
  MHLW_REFERENCES,
  NENKIN_REFERENCES,
} from "@/components/ColumnFooter";
import articleSource from "@/content/columns/shindansho-kakunin";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("shindansho-kakunin");
export const metadata: Metadata = columnMetadata(column);

const faqs = [
  {
    question: "診断書を開封して読んだら無効になりませんか?",
    answer:
      "封筒や医療機関から開封しないよう個別の指示がなければ、本人が内容を確認できます。指示がある場合は、開封前に医療機関または提出先へ確認してください。",
  },
  {
    question: "診断書の内容が実態より軽いです。書き直しをお願いできますか?",
    answer:
      "等級を指定するのではなく、伝わっていなかった生活上の事実を医師に伝えます。評価は医師の医学的判断に委ねてください。",
  },
  {
    question: "医師に生活の実態を伝えるには、どうするのが確実ですか?",
    answer:
      "食事・清潔保持・買い物や金銭管理・服薬や通院・対人関係・就労について、事実と頻度をA4一枚程度に整理すると伝えやすくなります。",
  },
  {
    question: "働いていることは診断書に書かないほうが有利ですか?",
    answer:
      "事実を隠さず、欠勤や早退の頻度、職場の配慮などを含む就労の実態を伝えることが大切です。",
  },
  {
    question: "診断書の作成料はいくらくらいですか?",
    answer:
      "作成料は医療機関ごとに異なります。再作成時の扱いも含め、依頼前に医療機関へ確認してください。",
  },
  {
    question: "更新のたびに同じ確認が必要ですか?",
    answer:
      "更新用の障害状態確認届も直近の状態をもとに作られます。日々の記録を続け、事実誤認や記載漏れがないか確認してください。",
  },
];

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "shinsatsu-mae-memo",
        "moushitatesho-kakikata",
        "shoshinbi-wakaranai",
      ]}
      references={[
        NENKIN_REFERENCES.diagnosis,
        MHLW_REFERENCES.seishinGuideline,
      ]}
    />
  );
}
