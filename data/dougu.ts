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
  /* カードの見出し。利用者が心の中で言っている問い */
  question: string;
  /* 何が出るか */
  what: string;
  /* 何に基づくか */
  basis: string;
  /* basis を短くした1語句(カードの meta 行) */
  basisShort: string;
  /* 所要 */
  time: string;
  /* 記事内カード(mt-column-card)で使う見出し・説明・リンク文言 */
  title: string;
  blurb: string;
  cta: string;
};

/* 全カードの下、または帯の見出し直下に1回だけ出す。 */
export const PRIVACY_LINE = "入力した内容は、この端末の中だけで処理します。サーバーには送りません。";

export const TOOLS: Record<ToolId, Tool> = {
  mitate: {
    id: "mitate", path: "/dougu/mitate", name: "等級の目安をしらべる",
    question: "私は何級くらい？",
    what: "診断書に書かれる2つの欄を選ぶと、国の目安表のどこに当たるかが出ます。",
    basis: "国が公表している「精神の障害に係る等級判定ガイドライン」の目安表。判定ではなく、公開されている基準に自分を置いてみるためのものです。",
    basisShort: "国の目安表に当てはめる",
    time: "約3分",
    title: "国の目安に当てはめてみる",
    blurb: "診断書に書かれる2つの欄の組み合わせで、国が公表している目安がどうなるかを見られます。判定ではありません。",
    cta: "目安をしらべる",
  },
  kingaku: {
    id: "kingaku", path: "/dougu/kingaku", name: "障害年金の金額",
    question: "いくらもらえる？",
    what: "等級・初診日に入っていた制度・家族の状況から、年額と月額を内訳つきで出します。",
    basis: "日本年金機構が公表している令和8年度の年金額と計算式。",
    basisShort: "令和8年度の年金額で計算",
    time: "約2分",
    title: "自分の場合の金額を出す",
    blurb: "等級・制度・家族の状況を選ぶと、年額と月額を内訳つきで出します。入力は送信されません。",
    cta: "金額を計算する",
  },
  shorui: {
    id: "shorui", path: "/dougu/shorui", name: "必要書類チェックリスト",
    question: "何をそろえればいい？",
    what: "7つの質問に答えると、自分の場合に必要な書類だけが並びます。持ち物と窓口で聞くことも一緒に印刷できます。",
    basis: "日本年金機構の様式と案内。",
    basisShort: "機構の様式に沿って",
    time: "約3分",
    title: "自分に必要な書類だけを出す",
    blurb: "7つの質問に答えると、あなたの場合に要る書類だけが出ます。持ち物と窓口で聞くことも一緒に印刷できます。",
    cta: "必要書類をしらべる",
  },
  madoguchi: {
    id: "madoguchi", path: "/dougu/madoguchi", name: "年金事務所を探す",
    question: "どこに出せばいい？",
    what: "初診日の制度で提出先が変わります。お住まいの市区町村から、管轄の年金事務所と予約のしかたを出します。",
    basis: "日本年金機構が公表している全国の窓口と管轄区域(2026-09-03 取得)。",
    basisShort: "機構の管轄区域で",
    time: "約1分",
    title: "出す前に、行き先を確かめる",
    blurb: "初診日に入っていた制度で、提出先が年金事務所か市区町村かに分かれます。管轄の窓口と予約のしかたを出します。",
    cta: "年金事務所を探す",
  },
  moushitatesho: {
    id: "moushitatesho", path: "/dougu/moushitatesho", name: "申立書をつくる",
    question: "申立書を、自分で書きたい",
    what: "発病から今までを期間ごとに入力すると、公式様式に重ねて印刷できる下書きになります。",
    basis: "日本年金機構の様式(病歴・就労状況等申立書)。",
    basisShort: "公式様式に重ねて印刷",
    time: "30分から",
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
      cta: "申立書をつくる",
      position: "after",
    }],
    /* 提出先・郵送の記事。クリック上位3本の1つで、まさに「どこへ出すか」を扱っている。 */
    "teishutsusaki-yuusou": ["madoguchi"],
  },
  hubs: {
    "/okane/ikura": ["kingaku"],
    /* 精神系の病名ハブ。目安表の対象がこの3区分(精神・知的・発達)なので、そこだけに置く。 */
    "/byoki/utsu-soukyoku": ["mitate"],
    "/byoki/tekiou-fuan": ["mitate"],
    "/byoki/tougou": ["mitate"],
    "/byoki/hattatsu": ["mitate"],
    "/byoki/chiteki": ["mitate"],
    /* 診断書で困っている人・家族が手伝う人も、目安表と窓口の入口が要る。 */
    "/nayami/shindansho-komatta": ["mitate"],
    "/joukyou/kazoku-ga-tetsudau": ["madoguchi"],
  },
  shinseiSteps: {
    "step-3": [{ tool: "madoguchi", title: "どこに出せばいい？", blurb: "管轄の年金事務所と、予約のしかた" }],
    "step-4": [{ tool: "shorui", title: "何をそろえればいい？", blurb: "自分の場合に要る書類だけを一覧に" }],
    "step-5": [{ tool: "mitate", title: "私は何級くらい？", blurb: "受け取った診断書の裏面を、国の目安表に当てはめる" }],
    "step-6": [{ tool: "moushitatesho", title: "申立書を、自分で書きたい", blurb: "期間ごとに書いて、公式様式に重ねて印刷" }],
    /* 出す段でもう一度。文言はステップ3と同じ(新しい説明文は書かない)。 */
    "step-7": [{ tool: "madoguchi", title: "どこに出せばいい？", blurb: "管轄の年金事務所と、予約のしかた" }],
  },
};

/* /hajimete に並べる2枚(見出し「使える道具」)。 */
export const HAJIMETE_TOOLS: ToolId[] = ["mitate", "kingaku"];

/* トップの帯。順番は 等級の目安 / 金額 / 必要書類 / 年金事務所 / 申立書。 */
export const TOP_BAND_TOOLS: ToolId[] = ["mitate", "kingaku", "shorui", "madoguchi", "moushitatesho"];

/* 各道具ページの「ここからできること」で、ほかの道具へ渡す相互リンク。 */
export const TOOL_CROSS_LINKS: Record<ToolId, ToolId[]> = {
  mitate: ["kingaku", "shorui"],
  kingaku: ["shorui", "mitate"],
  shorui: ["madoguchi", "moushitatesho"],
  moushitatesho: ["madoguchi", "shorui"],
  madoguchi: ["shorui", "moushitatesho"],
};
