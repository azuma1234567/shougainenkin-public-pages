/* 道具カードの置き場所を、ここ1か所にまとめる。
   以前は components/ColumnArticle.tsx に slug がベタ書きされていて、
   道具5つ × 十数か所へ増やすと追えなくなるため、表に出した。

   記事・ハブの本文(content/columns, data/hubs)には手を入れない。
   カードはコンポーネント側の挿入で出す。 */
import { isPublishedInternalPath } from "@/lib/published-links";

export type ToolId = "mitate" | "kingaku" | "shorui" | "madoguchi" | "moushitatesho";

export type Tool = {
  id: ToolId;
  path: string;
  /* 一覧・帯で使う短い名前 */
  name: string;
  /* カードの見出し */
  title: string;
  /* 1文の説明 */
  blurb: string;
  /* リンクの文言 */
  cta: string;
};

export const TOOLS: Record<ToolId, Tool> = {
  mitate: {
    id: "mitate", path: "/dougu/mitate", name: "等級の目安をしらべる",
    title: "国の目安に当てはめてみる",
    blurb: "診断書に書かれる2つの欄の組み合わせで、国が公表している目安がどうなるかを見られます。判定ではありません。",
    cta: "目安をしらべる",
  },
  kingaku: {
    id: "kingaku", path: "/dougu/kingaku", name: "障害年金の金額",
    title: "自分の場合の金額を出す",
    blurb: "等級・制度・家族の状況を選ぶと、年額と月額を内訳つきで出します。入力は送信されません。",
    cta: "金額を計算する",
  },
  shorui: {
    id: "shorui", path: "/dougu/shorui", name: "必要書類チェックリスト",
    title: "自分に必要な書類だけを出す",
    blurb: "7つの質問に答えると、あなたの場合に要る書類だけが出ます。持ち物と窓口で聞くことも一緒に印刷できます。",
    cta: "必要書類をしらべる",
  },
  madoguchi: {
    id: "madoguchi", path: "/dougu/madoguchi", name: "年金事務所を探す",
    title: "出す前に、行き先を確かめる",
    blurb: "初診日に入っていた制度で、提出先が年金事務所か市区町村かに分かれます。管轄の窓口と予約のしかたを出します。",
    cta: "年金事務所を探す",
  },
  moushitatesho: {
    id: "moushitatesho", path: "/dougu/moushitatesho", name: "申立書をつくる",
    title: "申立書の下書きをつくる",
    blurb: "期間ごとに入力し、公式様式に重ねて印刷できます。入力内容はこの端末の中だけに保存します。",
    cta: "申立書をつくる",
  },
};

/* 置き場所ごとに文言やリンク先を変えたいことがある(本番で動いている記事の見た目を変えないため)。
   ToolId をそのまま書けば TOOLS の既定、上書きしたいときだけオブジェクトで書く。 */
export type Placement = ToolId | {
  tool: ToolId;
  title?: string;
  blurb?: string;
  cta?: string;
  /* リンク先の上書き(アンカーつきなど) */
  href?: string;
  /* 記事本文の前に出すか後に出すか。既定は "before" */
  position?: "before" | "after";
};

export const placementTool = (p: Placement): Tool => TOOLS[typeof p === "string" ? p : p.tool];
export const placementCard = (p: Placement) => {
  const tool = placementTool(p);
  const o: Exclude<Placement, ToolId> | { tool: ToolId } = typeof p === "string" ? { tool: p } : p;
  return {
    id: tool.id,
    path: tool.path,
    href: ("href" in o && o.href) || tool.path,
    title: ("title" in o && o.title) || tool.title,
    blurb: ("blurb" in o && o.blurb) || tool.blurb,
    cta: ("cta" in o && o.cta) || tool.cta,
    position: (typeof p === "string" ? "before" : p.position) ?? "before",
  };
};
/* 未公開の道具は出さない。 */
export const visiblePlacements = (list: Placement[] | undefined): Placement[] =>
  (list ?? []).filter((p) => isPublishedInternalPath(placementTool(p).path));

export const PLACEMENTS: {
  columns: Record<string, Placement[]>;
  hubs: Record<string, Placement[]>;
  shinseiSteps: Record<string, Placement[]>;
} = {
  columns: {
    /* 本番で動いている3記事。文言と位置は従来のまま(見た目を変えない)。 */
    "moushitatesho-a4-insatsu": [{
      tool: "moushitatesho",
      title: "この様式を、ブラウザで書いてそのまま印刷できます",
      blurb: "入力内容はサーバーへ送らず、この端末のブラウザの中だけに保存します。",
      cta: "申立書をつくる",
    }],
    "moushitatesho-kikan-kugiri": [{
      tool: "moushitatesho",
      title: "この様式を、ブラウザで書いてそのまま印刷できます",
      blurb: "入力内容はサーバーへ送らず、この端末のブラウザの中だけに保存します。",
      cta: "申立書をつくる",
      href: "/dougu/moushitatesho#kikan",
    }],
    "moushitatesho-kakikata": [{
      tool: "moushitatesho",
      title: "申立書の下書きをつくる",
      blurb: "期間ごとに入力し、公式様式に重ねて印刷できます。",
      cta: "道具を開く",
      position: "after",
    }],
  },
  hubs: {},
  shinseiSteps: {},
};
