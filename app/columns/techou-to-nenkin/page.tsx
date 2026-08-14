import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import { MHLW_REFERENCES, NENKIN_REFERENCES } from "@/components/ColumnFooter";
import articleSource from "@/content/columns/techou-to-nenkin";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = getColumn("techou-to-nenkin");
export const metadata: Metadata = columnMetadata(column);

const faqs = [
  {
    question: "障害者手帳が3級でも障害年金を受給できますか?",
    answer:
      "できる場合があります。手帳の等級と年金の等級は連動しません。手帳が3級でも年金2級と認定されることはありますし、その逆もあります。年金の審査は、年金用の診断書と病歴・就労状況等申立書に書かれた日常生活と就労の実態をもとに、年金制度の基準で行われます。",
  },
  {
    question: "障害者手帳がなくても障害年金は申請できますか?",
    answer:
      "できます。障害年金の請求に手帳は必要ありません。請求書類に手帳の提出欄もありません。初診日・納付要件・障害の状態という条件を満たしていれば申請できます。",
  },
  {
    question: "年金証書で手帳を取ると、手帳の等級はどうなりますか?",
    answer:
      "年金の等級に連動します。年金1級なら手帳1級、2級なら2級、3級なら3級です。生活の実態としてはもっと重いと感じる場合は、このルートを使わず、手帳用の診断書を書いてもらって申請したほうが上の等級になることがあります。",
  },
  {
    question: "手帳と自立支援医療は別々に申請するのですか?",
    answer:
      "同時に申請でき、そのとき診断書は1通で足ります。ただし診断書の特定の欄に記載がないと自立支援医療に使えないことがあるので、医師に依頼するときに「自立支援医療も同時に申請します」と伝えてください。",
  },
  {
    question: "手帳を持っていることは会社に知られますか?",
    answer:
      "自動的には知られません。実質的な経路は年末調整で障害者控除を申告した場合です。年末調整では申告せず自分で確定申告することもできますが、翌年の住民税額から推測される可能性は残ります。",
  },
  {
    question: "障害基礎年金に3級はないのですか?",
    answer:
      "ありません。初診日に国民年金だった方は、1級・2級・非該当のいずれかになります。3級と障害手当金があるのは、初診日に厚生年金に加入していた場合(障害厚生年金)です。",
  },
];

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      relatedSlugs={[
        "nofu-yoken",
        "hatachi-mae",
        "shoshinbi-wakaranai",
        "shougaisha-koyou-nenkin",
        "tokyu-hantei-guideline",
      ]}
      references={[
        NENKIN_REFERENCES.seido,
        NENKIN_REFERENCES.jukyuYoken,
        MHLW_REFERENCES.seishinGuideline,
      ]}
    />
  );
}
