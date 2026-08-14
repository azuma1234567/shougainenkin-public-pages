import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource from "@/content/columns/moushitatesho-a4-insatsu";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("moushitatesho-a4-insatsu");

export const metadata: Metadata = columnMetadata(column);

const faqs = [
  {
    question: "A4で印刷した申立書は本当に受け付けてもらえますか?",
    answer:
      "A4で2枚に分けて印刷したものが受け付けられるのが実務上の扱いです。ただし最終判断は提出先なので、不安なら提出前に年金事務所へ電話一本で確認してください。「A4二分割で印刷した申立書で提出できますか」で通じます。",
  },
  {
    question: "パソコン入力(エクセル様式)だと審査で不利になりませんか?",
    answer:
      "なりません。手書きが有利という根拠はなく、審査は内容で行われます。むしろ読みやすい印字は審査側の負担を減らします。専門の社労士も申立書相当の資料をワープロで作成しています。エクセル様式は日本年金機構の公式サイトからダウンロードできます。",
  },
  {
    question: "コンビニ印刷で気をつけることは?",
    answer:
      "「用紙サイズA3・倍率100%(原寸)」の指定だけです。「用紙に合わせて拡大縮小」がオンだと枠の寸法が変わるので必ずオフにしてください。",
  },
  {
    question: "書き損じたら修正テープを使ってもいいですか?",
    answer:
      "公的な提出書類なので、修正テープより書き直しか二重線訂正が無難です。そもそも手書きにこだわらず、エクセルやアプリで作れば書き損じの概念自体がなくなります。",
  },
  {
    question: "枠が足りません。続紙はどう使いますか?",
    answer: "続紙も日本年金機構からダウンロードできます。氏名を記入し、本紙からの期間の番号がつながるようにして添付します。",
  },
  {
    question: "診断書が封をされた状態で渡されました。開けていいですか?",
    answer:
      "障害年金の診断書は本人が内容を確認して提出するものなので、中身を確認して差し支えありません。病院によっては封をして渡す運用があるため、受け取り時に「内容を確認したい」と伝えるか、依頼時に封をせずに渡してほしいと頼んでおくとスムーズです。開封の可否に不安があれば、その病院の窓口に確認してください。",
  },
  {
    question: "控えのコピーは何を取ればいいですか?",
    answer:
      "申立書の全ページ・診断書・受診状況等証明書・年金請求書が基本です。数年後の更新(障害状態確認届)で「前回何を書いたか」を参照できることが、記載の整合性を保つ土台になります。紙とデータの両方で残すと、機種変更や引っ越しでも失いません。",
  },
  {
    question: "症状が重くて、印刷のために外出することすら難しいです。",
    answer:
      "無理をしない前提で組み立ててください。A4なら自宅印刷で完結できますし、申立書の作成自体を数日〜数週間に分けるのが経験者の標準です。印刷やコピーを家族に頼むのも立派な選択肢で、手続きを第三者が手伝うことは制度上まったく問題ありません。",
  },
];

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "moushitatesho-kikan-kugiri",
        "moushitatesho-mijushin-kikan",
        "moushitatesho-kakikata",
        "shindansho-kakunin",
      ]}
      references={[
        NENKIN_REFERENCES.moushitatesho,
        NENKIN_REFERENCES.seido,
      ]}
    />
  );
}
