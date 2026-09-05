"use client";
/* 一覧ページの絞り込み語。ヒーローの検索欄(HubIndexSearch)と、その下のカード一覧
   (HubIndexList)は離れた場所に置くので、状態はこのモジュールで持つ。
   ブラウザの中だけで動き、何も送信しない。 */

let query = "";
const listeners = new Set<() => void>();

export function getQuery() {
  return query;
}

/* サーバー側の描画では、絞り込みは効いていない状態(=全部見える)。 */
export function getServerQuery() {
  return "";
}

export function setQuery(value: string) {
  query = value;
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
