import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import {
  MHLW_REFERENCES,
  NENKIN_REFERENCES,
} from "@/components/ColumnFooter";
import articleSource from "@/content/columns/shinsatsu-mae-memo";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("shinsatsu-mae-memo");

export const metadata: Metadata = columnMetadata(column);

const faqs = [
  {
    question: "メモを渡したら、医師に嫌がられませんか?",
    answer:
      "事実だけをA4一枚にまとめたメモなら診断書作成の助けになります。消極的な反応なら無理に渡さず、口頭で伝える台本として使ってください。",
  },
  {
    question: "「2級をとりたい」と正直に伝えてもいいですか?",
    answer:
      "申請の意思を伝えることは必要ですが、等級を指定する依頼は逆効果です。等級は医学的判断と審査で決まります。",
  },
  {
    question: "調子が悪くてメモが書けません。",
    answer:
      "書けない日は書かなくて大丈夫です。家族が代わりに書いた記録にも価値があります。",
  },
  {
    question: "診察で元気にふるまってしまうのは、治すべき癖ですか?",
    answer:
      "避けにくい構造です。状態の波の全体を紙で渡す方法に意味があります。",
  },
  {
    question: "更新(障害状態確認届)のときは何をすればいいですか?",
    answer:
      "直近数か月の生活実態を医師に伝えること、期限から逆算して早めに診察予約を取ること、就労中なら欠勤・配慮の実態まで伝えることです。",
  },
  {
    question: "主治医が障害年金の診断書を書きたがりません。どうすれば?",
    answer:
      "まず理由を確認してください。評価に必要な通院実績が足りない場合は、通院を重ねながら生活実態の記録を伝え続けるのが近道です。年金事務所や社労士への相談も選択肢です。",
  },
  {
    question: "メモはどんな形式でもいいですか?",
    answer:
      "A4一枚・事実と頻度のみ・生活の場面ごとに整理されていれば、手書きでもスマホ印刷でも構いません。",
  },
  {
    question: "主治医に渡す生活状況メモに決まった様式はありますか?",
    answer:
      "決まった様式はありません。A4で1〜2枚、生活の場面ごとに事実を書けば十分です。日常生活能力の判定7項目の順番に沿って書くと、医師が診断書の該当欄と突き合わせやすくなります。",
  },
  {
    question: "生活状況メモは毎回の診察で渡すべきですか?",
    answer:
      "診断書の依頼直前に一度渡すより、普段の診察から渡し続けるほうが確実です。カルテに実態が蓄積し、依頼した時点で医師の手元に材料が揃います。",
  },
  {
    question: "障害年金のために精神科の診察で何を話せばいいですか?",
    answer:
      "前回からの生活の変化、薬を飲んでも残っている症状、危ないことの3つを優先してください。日常生活能力7項目の実態は口頭では伝えきれないため、紙にまとめて渡す方法が確実です。",
  },
  {
    question: "メモを医師に渡すのが恥ずかしくて言い出せません。",
    answer:
      "診察の冒頭に「うまく話せないので紙にまとめました。お時間のあるときに読んでください」と置くだけで十分です。渡せなかった場合も、書いたメモは次回使えますし申立書の材料になります。",
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
        "moushitatesho-a4-insatsu",
        "shindansho-kakunin",
        "shindansho-ishi-ni-tsutaeru",
      ]}
      references={[
        MHLW_REFERENCES.seishinGuideline,
        NENKIN_REFERENCES.seido,
      ]}
    />
  );
}
