import type { Metadata } from "next";
import ColumnArticle from "@/components/ColumnArticle";
import articleSource, { lead, faqs } from "@/content/columns/nenkin-jimusho-soudan";
import { columnMetadata, getColumn } from "@/lib/columns";

const column = { ...getColumn("nenkin-jimusho-soudan"), lead };

// 持ち物チェックリスト(本文のカードと同じ内容)を ItemList で出す。
const ITEMS = [
  "本人確認書類(マイナンバーカード、運転免許証など)",
  "基礎年金番号がわかるもの(基礎年金番号通知書、年金手帳、ねんきん定期便のいずれか)",
  "筆記用具とメモ(その場で言われたことを書き留めるため)",
  "初診日の見当がつく資料(お薬手帳、診察券、領収書、紹介状、健診の記録)",
  "通院してきた病院を、時期順に書き出したメモ",
  "現在の症状と、生活で困っていることのメモ",
  "障害者手帳(持っている場合)",
  "委任状(家族が代わりに行く場合。本人の署名。年金機構の様式があり、必要事項がそろえば手書きでも可)",
  "代理人自身の本人確認書類(家族が代わりに行く場合)",
];
const ITEM_LIST_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "年金事務所に持っていくもの(チェックリスト)",
  itemListOrder: "https://schema.org/ItemListUnordered",
  numberOfItems: ITEMS.length,
  itemListElement: ITEMS.map((name, index) => ({ "@type": "ListItem", position: index + 1, name })),
};
export const metadata: Metadata = columnMetadata(column);

export default function Page() {
  return (
    <ColumnArticle
      column={column}
      source={articleSource}
      faqs={faqs}
      extraJsonLd={[ITEM_LIST_JSON_LD]}
      relatedSlugs={[
        "shoshinbi-wakaranai",
        "jushinjokyo-shomeisho",
        "hitsuyou-shorui-seishin",
        "shindansho-irai-timing",
      ]}
      references={[
  {
    "label": "日本年金機構「予約相談について」",
    "href": "https://www.nenkin.go.jp/section/guidance/yoyaku.html"
  },
  {
    "label": "日本年金機構「病気やけがで障害が残ったとき」",
    "href": "https://www.nenkin.go.jp/service/scenebetsu/shougai.html"
  }
]}
    />
  );
}
