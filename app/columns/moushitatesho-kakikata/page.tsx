import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource from "@/content/columns/moushitatesho-kakikata";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("moushitatesho-kakikata");

export const metadata: Metadata = columnMetadata(column);

const faqs = [
  {
    question: "初診日がどうしても思い出せません。申立書は書けませんか?",
    answer:
      "書けます。ただし先に初診日の候補を絞る作業をしてください。お薬手帳、診察券、健康診断の記録、転院時の紹介状などが手がかりになります。",
  },
  {
    question: "働きながらの申請ですが、就労していると不利ですか?",
    answer:
      "就労の事実だけが伝わると誤読されやすいですが、就労と受給は両立し得ます。欠勤・遅刻・早退の頻度や受けている配慮など実態を具体的に書いてください。",
  },
  {
    question: "症状を少し重めに書いたほうが通りやすいですか?",
    answer:
      "逆です。診断書と食い違うと申立書全体の信頼が下がります。事実を頻度と具体例で書くことがいちばん強い書き方です。",
  },
  {
    question: "通院していなかった期間は書かなくてもいいですか?",
    answer:
      "必ず書いてください。通えなかった理由と、その間の生活実態をひとつの枠として書きます。",
  },
  {
    question: "申立書は誰かに代わりに書いてもらえますか?",
    answer:
      "作成を家族が手伝うことは問題ありません。請求手続き自体も委任状があれば第三者が行えます。",
  },
  {
    question: "どのくらいの分量を書けばいいですか?",
    answer:
      "長さより密度です。各期間に頻度・期間・援助・具体例の4要素が入っていれば全体1,000字前後でも伝わります。",
  },
  {
    question: "障害年金を申請したことは会社に知られますか?",
    answer:
      "申請したこと自体が勤務先へ通知される仕組みはありません。申立書には実態を正直に書いてください。",
  },
  {
    question: "社労士に依頼したほうがいいですか?",
    answer:
      "初診日の証明が難航しているケースや審査請求は専門家の力が大きい領域です。通院歴が整理できていれば自分で書くことも十分可能です。",
  },
];

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "moushitatesho-a4-insatsu",
        "shinsatsu-mae-memo",
        "shinsei-nagare",
      ]}
      references={[
        NENKIN_REFERENCES.moushitatesho,
        NENKIN_REFERENCES.seido,
      ]}
    />
  );
}
