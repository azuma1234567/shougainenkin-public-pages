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
      "書けます。ただし順序が逆で、先に初診日の候補を絞る作業をしてください。お薬手帳、診察券、健康診断の記録、家計簿やカードの明細、転院時の紹介状の記憶が手がかりになります。実務者の発信でも、紹介状などの医療機関間の書類で初診日が確定するケースは多いとされています。",
  },
  {
    question: "働きながらの申請ですが、就労していると不利ですか?",
    answer:
      "「就労の事実」だけが伝わると「働ける=改善」と誤読されやすいのは事実です。ただし実務者が明言している通り、就労と受給は両立し得ます。欠勤・遅刻・早退の頻度、受けている配慮、障害者雇用か否か、業務内容の変更まで具体的に書き、実態を伝えてください。",
  },
  {
    question: "症状を少し重めに書いたほうが通りやすいですか?",
    answer:
      "逆です。診断書と食い違った時点で申立書全体の信頼が下がります。虚偽が過ぎれば、利息つきの返還請求や刑事罰に至った例まであると実務者は警告しています。事実を頻度と具体例で書くことがいちばん強い書き方です。",
  },
  {
    question: "通院していなかった期間は書かなくてもいいですか?",
    answer:
      "必ず書いてください。空白は「良くなって通院をやめた」と読まれる余地を生みます。通えなかった理由(症状、経済事情、通院への抵抗感)と、その間の生活実態をひとつの枠として書きます。",
  },
  {
    question: "申立書は誰かに代わりに書いてもらえますか?",
    answer:
      "本人の申立てとして提出しますが、作成を家族が手伝うこと自体は問題ありません。請求手続き自体も、委任状があれば第三者が行えます。家族から見た生活の様子は、むしろ書類の整合性を支える材料になります。",
  },
  {
    question: "どのくらいの分量を書けばいいですか?",
    answer:
      "長さより密度です。各期間に「頻度・続いた期間・受けていた援助・できなかったことの具体例」の4要素が入っていれば、本記事のフル記入例程度(全体で1,000字前後)でも十分伝わります。逆に、感情の描写だけで枠が埋まっている申立書は、長くても伝わりません。",
  },
  {
    question: "障害年金を申請したことは会社に知られますか?",
    answer:
      "申請したこと自体が勤務先へ通知される仕組みはありません。申立書に勤務実態を書いても、会社へ共有されるものではないので、実態を正直に書いてください。一方で、当事者の発信では「職場で自分から年金の話をしない」ことが処世術として強く勧められています。",
  },
  {
    question: "社労士に依頼したほうがいいですか?",
    answer:
      "初診日の証明が難航しているケース、不支給後の審査請求、カルテが破棄されているケースなどは専門家の力が大きい領域です。一方、通院歴が整理できていて事実を書ける状態なら、自分で書くことは十分可能です。",
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
        "moushitatesho-kikan-kugiri",
        "shindansho-ishi-ni-tsutaeru",
      ]}
      references={[
        NENKIN_REFERENCES.moushitatesho,
        NENKIN_REFERENCES.seido,
      ]}
    />
  );
}
