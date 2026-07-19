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
      "A4で2枚に分けて印刷したものが受け付けられるのが実務上の扱いです。不安なら提出前に年金事務所へ確認してください。",
  },
  {
    question: "パソコン入力(エクセル様式)だと審査で不利になりませんか?",
    answer:
      "なりません。手書きが有利という根拠はなく、審査は内容で行われます。エクセル様式は日本年金機構の公式サイトからダウンロードできます。",
  },
  {
    question: "コンビニ印刷で気をつけることは?",
    answer:
      "用紙サイズA3・倍率100%(原寸)の指定です。用紙に合わせて拡大縮小は必ずオフにしてください。",
  },
  {
    question: "書き損じたら修正テープを使ってもいいですか?",
    answer:
      "修正テープより書き直しか二重線訂正が無難です。エクセルやアプリで作れば書き損じ自体がなくなります。",
  },
  {
    question: "控えのコピーは何を取ればいいですか?",
    answer:
      "申立書の全ページと、可能なら診断書のコピーです。数年後の更新で前回の記載との整合性を保つ土台になります。",
  },
  {
    question: "症状が重くて、印刷のために外出することすら難しいです。",
    answer:
      "A4なら自宅印刷で完結できます。作成自体を数日〜数週間に分ける、家族に印刷を頼むのも選択肢です。",
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
