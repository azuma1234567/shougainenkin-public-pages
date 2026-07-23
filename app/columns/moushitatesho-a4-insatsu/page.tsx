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
      "A4で2枚に分けて印刷したものが受け付けられるのが実務上の扱いです。ただし最終判断は提出先なので、不安なら提出前に年金事務所へ電話で確認してください。",
  },
  {
    question: "パソコン入力(エクセル様式)だと審査で不利になりませんか?",
    answer:
      "なりません。手書きが有利という根拠はなく、審査は内容で行われます。読みやすい印字はむしろ審査側の負担を減らします。エクセル様式は日本年金機構の公式サイトからダウンロードできます。",
  },
  {
    question: "コンビニ印刷で気をつけることは?",
    answer:
      "用紙サイズA3・倍率100%(原寸)の指定です。用紙に合わせて拡大縮小は必ずオフにしてください。",
  },
  {
    question: "書き損じたら修正テープを使ってもいいですか?",
    answer:
      "公的な提出書類なので、修正テープより書き直しか二重線訂正が無難です。エクセルやアプリで作れば書き損じ自体がなくなります。",
  },
  {
    question: "枠が足りません。続紙はどう使いますか?",
    answer:
      "続紙は日本年金機構からダウンロードできます。氏名を記入し、本紙からの期間の番号がつながるようにして添付します。枠に合わせて期間をまとめるより、正しく区切って続紙を使うほうが適切です。",
  },
  {
    question: "診断書が封をされた状態で渡されました。開けていいですか?",
    answer:
      "障害年金の診断書は本人が内容を確認して提出するものなので、中身を確認して差し支えありません。依頼時に封をせずに渡してほしいと伝えておくとスムーズです。不安な場合は病院の窓口に確認してください。",
  },
  {
    question: "控えのコピーは何を取ればいいですか?",
    answer:
      "申立書の全ページ・診断書・受診状況等証明書・年金請求書が基本です。数年後の更新で前回の記載と整合性を保つ土台になります。紙とデータの両方で残すと紛失や機種変更にも備えられます。",
  },
  {
    question: "症状が重くて、印刷のために外出することすら難しいです。",
    answer:
      "A4印刷なら自宅で完結できます。作成自体を数日〜数週間に分け、印刷やコピーを家族に頼むこともできます。",
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
        "moushitatesho-kikan-kugiri",
      ]}
      references={[
        NENKIN_REFERENCES.moushitatesho,
        NENKIN_REFERENCES.seido,
      ]}
    />
  );
}
