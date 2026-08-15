// サイト全体のトピッククラスタ(柱ページ)の定義。
//
// このファイルは「どんなテーマがあるか」だけを持つ。どの記事がどのテーマに属するかは
// lib/columns.ts の primaryCluster / secondaryClusters が唯一の情報源で、
// クラスタ側から記事を数え上げる関数も lib/columns.ts に置いてある
// (COLUMNS を参照する必要があるため。依存は columns.ts → clusters.ts の一方向)。
//
// 柱ページを公開する手順:
//   1. content/columns/<slug>.ts と app/columns/<slug>/page.tsx を追加する
//      (primaryCluster にそのクラスタのidを入れて COLUMNS へも登録する)
//   2. ここの published を true にする
// これだけで、コラム一覧のテーマ導線・記事からの親ページ導線・パンくず・
// ヘッダー・フッター・トップの「もっと詳しく知る」・sitemap がまとめて切り替わる。
//
// published を先に true にしてもページが無ければリンクは出ない
// (lib/columns.ts の isPillarAvailable が実在チェックをしている)。

export type ClusterId =
  | "application"
  | "conditions"
  | "mental"
  | "medical-certificate"
  | "depression";

export type Cluster = {
  id: ClusterId;
  /** 見出し・パンくず・リンク文言で使う正式名 */
  label: string;
  /** ヘッダー・フッターなど幅の狭い場所で使う短い名前 */
  navLabel: string;
  /** 一覧でテーマを説明する1〜2文 */
  lead: string;
  /** 柱ページのパス。"/" はトップページが柱を兼ねることを表す */
  pillarPath: string;
  /** 柱ページの本文を公開したら true にする */
  published: boolean;
  /** 概念上の親クラスタ(うつ病は精神疾患の下) */
  parent?: ClusterId;
  /** 公開後にヘッダーのナビへ出すかどうか */
  inHeader?: boolean;
};

// 並び順は、コラム一覧「知りたいことから探す」の表示順でもある。
export const CLUSTERS: Cluster[] = [
  {
    id: "application",
    label: "障害年金の申請",
    navLabel: "申請の流れ",
    lead: "初診日の確認から結果が届くまで、申請全体の流れと必要書類。",
    // 申請の全体像はトップページが担う。同じ検索意図の記事は作らない。
    pillarPath: "/",
    published: true,
  },
  {
    id: "conditions",
    label: "障害年金の条件",
    navLabel: "受給条件",
    lead: "初診日・保険料納付要件・障害の状態など、受け取れるかどうかを分ける条件。",
    pillarPath: "/columns/shougainenkin-joken",
    published: false,
  },
  {
    id: "mental",
    label: "精神疾患の障害年金",
    navLabel: "精神疾患",
    lead: "うつ病・発達障害・適応障害など、精神の障害で申請するときに読む記事。",
    pillarPath: "/columns/shougainenkin-seishin",
    published: false,
    inHeader: true,
  },
  {
    id: "medical-certificate",
    label: "障害年金の診断書",
    navLabel: "診断書",
    lead: "日常生活の実態を主治医にどう伝えるか。診断書をめぐる記事。",
    pillarPath: "/columns/shougainenkin-shindansho",
    published: false,
    inHeader: true,
  },
  {
    id: "depression",
    label: "うつ病の障害年金",
    navLabel: "うつ病",
    lead: "うつ病で申請するときに、とくに関わりの深い記事。",
    pillarPath: "/columns/utsu-shougainenkin",
    published: false,
    parent: "mental",
  },
];

export function getCluster(id: ClusterId): Cluster {
  const cluster = CLUSTERS.find((c) => c.id === id);
  if (!cluster) {
    throw new Error(`クラスタが見つかりません: ${id}`);
  }
  return cluster;
}

/** 柱ページが /columns 配下の記事の場合、そのslug。トップが柱の場合はnull。 */
export function clusterPillarSlug(cluster: Cluster): string | null {
  if (!cluster.pillarPath.startsWith("/columns/")) return null;
  return cluster.pillarPath.slice("/columns/".length);
}
