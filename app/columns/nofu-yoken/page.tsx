import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource from "@/content/columns/nofu-yoken";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("nofu-yoken");
export const metadata: Metadata = columnMetadata(column);

const faqs = [
  {
    question: "未納期間があると障害年金は受けられませんか?",
    answer:
      "未納があっても受けられる場合があります。初診日の前日時点で、加入期間の3分の2以上が納付済み・免除済みであれば要件を満たします。これを満たさなくても、初診日が令和18年3月末日までで初診日に65歳未満なら、初診日がある月の前々月までの直近1年間に未納がなければ足ります。",
  },
  {
    question: "いま未納分をまとめて納めれば要件を満たせますか?",
    answer:
      "初診日より後に納めた分は、納付要件の判定には算入されません。判定は初診日の前日時点で固定されます。ただし、まだ初診日を迎えていない傷病については意味がありますし、老齢基礎年金の額には反映されます。",
  },
  {
    question: "免除や学生納付特例の期間は未納にあたりますか?",
    answer:
      "あたりません。全額免除・学生納付特例・納付猶予・産前産後免除・法定免除は、納付要件の判定で納付済みと同じ側にカウントされます。ただし一部免除は、減額された残りの保険料を納めていないと未納扱いになります。",
  },
  {
    question: "直近1年の特例は令和8年3月で終わりますか?",
    answer:
      "令和7年の年金制度改正により、令和18年3月末日まで10年延長されています。インターネット上には改正前の記述が多く残っているため、参照するページの更新日をご確認ください。",
  },
  {
    question: "納付状況はどこで確認できますか?",
    answer:
      "ねんきんネットでも確認できますが、判定に使うなら年金事務所で「被保険者記録照会回答票」を出してもらうのが確実です。ねんきん定期便では免除の細目まで読み取れません。",
  },
  {
    question: "20歳前に初診日があれば必ず納付要件は問われませんか?",
    answer:
      "20歳前でも厚生年金に加入していた期間に初診日がある場合は、通常どおり納付要件が問われます。また20歳前傷病の障害基礎年金には所得による支給停止があります。",
  },
];

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "shoshinbi-wakaranai",
        "hatachi-mae",
        "shoshinbi-karute-nashi",
        "nenkin-jimusho-soudan",
        "techou-to-nenkin",
      ]}
      references={[
        NENKIN_REFERENCES.jukyuYoken,
        NENKIN_REFERENCES.beforeTwenty,
        NENKIN_REFERENCES.seido,
      ]}
    />
  );
}
