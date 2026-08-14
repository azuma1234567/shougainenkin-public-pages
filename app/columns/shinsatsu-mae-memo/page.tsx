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
      "事実だけをA4一枚にまとめたメモなら、多くの医師にとってむしろ診断書作成の助けになります。嫌がられやすいのは「等級のお願い」や長文の訴えです。消極的な反応だった場合は無理に渡さず、メモを見ながら口頭で伝える台本として使ってください。",
  },
  {
    question: "「2級をとりたい」と正直に伝えてもいいですか?",
    answer:
      "障害年金を申請する意思を伝えること自体は必要です(診断書を依頼するので)。ただし「○級で書いてほしい」という依頼は逆効果です。等級は医学的判断と審査で決まるもので、事実と異なる診断書は医師と本人の双方が重大なリスクを負うと実務者は警告しています。",
  },
  {
    question: "調子が悪くてメモが書けません。",
    answer:
      "書けない日は書かなくて大丈夫です。書けた日の1〜2行に意味があります。また、家族が代わりに書いた「見た様子」の記録にも価値があります。実務者の発信でも、家族・支援者による第三者記述は書類の整合性の裏付けになるとされています。",
  },
  {
    question: "診察で元気にふるまってしまうのは、治すべき癖ですか?",
    answer:
      "癖というより、外出できる状態を整えて診察に行く以上、避けにくい構造です。当事者の発信を見ても、状態は日々大きく波打つのに診察はその一瞬しか切り取れません。だからこそ、波の全体を紙で渡す方法に意味があります。",
  },
  {
    question: "更新(障害状態確認届)のときは何をすればいいですか?",
    answer:
      "やることは申請時と同じで、直近数か月の生活実態を医師に伝えることです。加えて、提出期限から逆算して早めに診察予約を取ること、就労している場合は欠勤・配慮の実態まで伝えることが、実務者が挙げる更新の要点です。",
  },
  {
    question: "主治医が障害年金の診断書を書きたがりません。どうすれば?",
    answer:
      "まず理由を確認してください。「初診から日が浅く評価できない」「通院間隔が空いていて直近の状態が把握できない」など、医学的に妥当な理由のことも多く、その場合は通院を重ねながら生活実態の記録を伝え続けるのが近道です。診察のたびにA4メモで実態が積み上がっていれば、医師が「書ける」状態に近づきます。方針の相違が根本にある場合は、年金事務所や社労士への相談も選択肢です。",
  },
  {
    question: "メモはどんな形式でもいいですか?",
    answer:
      "A4一枚・事実と頻度のみ・生活の場面ごと(食事、清潔保持、買い物と金銭、服薬と通院、対人関係、就労)に整理されていれば、手書きでもスマホ印刷でも構いません。本記事の完成形をそのまま型として使ってください。",
  },
  {
    question: "主治医に渡すメモに決まった様式はありますか?",
    answer:
      "ありません。A4で1〜2枚、生活の場面ごとに事実を書けば十分です。10枚の手記は読まれません。7項目の順番に沿って書くと、医師が診断書の該当欄と突き合わせやすくなります。",
  },
  {
    question: "メモは毎回渡すべきですか?",
    answer:
      "診断書の依頼直前に1回渡すより、普段の診察から渡し続けるほうが確実です。カルテに実態が蓄積し、依頼した時点で医師の手元に材料が揃います。",
  },
  {
    question: "診察で何を話せばいいか分かりません。",
    answer:
      "前回からの生活の変化、薬を飲んでも残っている症状、危ないことの3つを優先してください。7項目の生活実態は口頭では伝えきれないので、紙にまとめて渡す方法が確実です。",
  },
  {
    question: "メモを渡すのが恥ずかしい・言い出せません。",
    answer:
      "診察の冒頭に「うまく話せないので紙にまとめました。お時間のあるときに読んでください」と置くだけで十分です。渡せなかった日があっても、書いたメモは次回も使えますし、そのまま病歴・就労状況等申立書の材料になります。",
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
