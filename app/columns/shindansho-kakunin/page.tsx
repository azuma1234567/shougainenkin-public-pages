import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { MHLW_REFERENCES, NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource from "@/content/columns/shindansho-kakunin";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("shindansho-kakunin");
export const metadata: Metadata = columnMetadata(column);

// 記事末尾のQ&Aと同一の文字列。構造化データ(FAQPage)にも使う。
// 本文を正とし、ここは本文からそのまま写す。片方だけ直さないこと。
const faqs = [
  {
    question: "診断書を開封して読んだら無効になりませんか?",
    answer:
      "無効にはなりません。封筒や医療機関から開封しないよう個別の指示がなければ、本人が内容を確認できます。年金事務所の窓口でも開封されます。個別に指示がある場合は、開封前に医療機関または提出先へ確認してください。",
  },
  {
    question: "診断書の内容が実態より軽いです。書き直しをお願いできますか?",
    answer:
      "「等級が上がるように」という依頼はできません(医師・本人双方のリスクになります)。できるのは、伝わっていなかった生活の事実を追加で伝えることです。事実の誤りや記載漏れであれば訂正を依頼できます。事実を伝えたうえでの評価は、医師の医学的判断に委ねてください。",
  },
  {
    question: "医師に生活の実態を伝えるには、どうするのが確実ですか?",
    answer:
      "食事・清潔保持・買い物と金銭管理・服薬と通院・対人関係・危機対応・社会性という7項目の順に、事実と頻度をA4一枚程度にまとめて渡す方法が確実です。日記形式ではなく、医師が診断書の欄をそのまま埋められる並びにしてください。",
  },
  {
    question: "働いていることは診断書に書かないほうが有利ですか?",
    answer:
      "隠すのは虚偽です。就労と受給は両立し得ます。大事なのは勤務の事実だけでなく、欠勤や早退の頻度、職場で受けている配慮、指示の出し方といった実態まで記載してもらうことです。",
  },
  {
    question: "診断書の作成料はいくらくらいですか?",
    answer:
      "作成料は医療機関ごとに異なります。事実の訂正には通常あらためて料金がかからないことが多い一方、まったく新しく書き直す場合は費用が発生する可能性があります。依頼前に医療機関へ確認してください。",
  },
  {
    question: "更新のたびに同じ確認が必要ですか?",
    answer:
      "必要です。更新用の障害状態確認届も直近の状態で書かれるため、確認ポイントは申請時と同じです。前回のコピーと7項目を並べて比べるのが、いちばん実効性のある確認方法です。",
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
        "shindansho-jittai-chigau",
        "nichijo-seikatsu-7koumoku",
        "tokyu-hantei-guideline",
        "koushin-kakuninhodo",
      ]}
      references={[
        NENKIN_REFERENCES.diagnosis,
        MHLW_REFERENCES.seishinGuideline,
      ]}
    />
  );
}
