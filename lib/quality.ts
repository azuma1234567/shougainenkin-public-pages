// アプリ本体の知識ビルドで検証済みの件数を、公開ページの表示へ同期する。
// 知識ユニットまたは出典台帳を更新したときは、この値も同じリリースで更新する。
export const QUALITY_METRICS = {
  knowledgeUnits: 240,
  verifiedSources: 69,
} as const;
