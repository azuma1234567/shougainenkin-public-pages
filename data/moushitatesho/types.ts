/* 申立書の入力データ。version 2(設計書 §6-1)。
   v1 との違い: 様式にあって v1 に無かった欄を足し、様式に無い seinengappi を捨てた。
   移行は lib/moushitatesho-storage.ts の migrate。 */

export type Waku = { id: string; from: string; to: string; jushin: boolean; kikan: string; text: string };

export type BackSide = {
  work: boolean | null; reasons: number[]; reasonsOther: string;
  job: string; commuteMethod: string; commuteHours: string; commuteMinutes: string;
  daysPrev: string; daysPrevPrev: string; cond: string; daily: Record<number, 1 | 2 | 3 | 4>;
};

/* 障害者手帳。様式は2冊ぶん(①②)ある。 */
export type TechouKind = "shin" | "sei" | "ryou" | "ta";
export type Techou = { shurui: TechouKind | null; taName: string; kofu: string; tokyu: string; shougaimei: string };

export type Seikyuusha = { name: string; address: string; tel: string };
export type Daihitsu = { name: string; zokugara: string; tel: string };

export type MoushitateshoState = {
  version: 2;
  byoumei: string; hatsubyou: string; shoshin: string;
  /* 障害認定日 YYYY-MM-DD。初診日+1年6か月を既定、変更可(§6-2) */
  ninteibi: string;
  waku: Waku[];
  back: { nintei: BackSide; genzai: BackSide };
  sonota: string;
  techou: null | "ari" | "nashi" | "shinsei";
  techouList: Techou[];               // 最大2
  seikyuusha: Seikyuusha;
  moushitateDate: string;             // YYYY-MM-DD
  daihitsu: Daihitsu | null;
  seikyuuType: "honrai" | "jigojuushou" | "sokyuu" | null;
  fontPt: 10.5 | 9;
  updatedAt: string;
};

export const DAILY_ITEMS = ["着替え", "洗面", "トイレ", "入浴", "食事", "散歩", "炊事", "洗濯", "掃除", "買物"] as const;
export const WORK_REASONS_NINTEI = ["体力に自信がなかったから", "医師から働くことを止められていたから", "働く意欲がなかったから", "働きたかったが適切な職場がなかったから", "その他"] as const;
export const WORK_REASONS_GENZAI = ["体力に自信がないから", "医師から働くことを止められているから", "働く意欲がないから", "働きたいが適切な職場がないから", "その他"] as const;
export const DAILY_LEVELS_NINTEI = ["自発的にできた", "自発的にできたが援助が必要だった", "自発的にできないが援助があればできた", "できなかった"] as const;
export const DAILY_LEVELS_GENZAI = ["自発的にできる", "自発的にできるが援助が必要である", "自発的にできないが援助があればできる", "できない"] as const;
/* 「その他」の理由。ここを選んだときだけ、理由の1行を書く(§5) */
export const REASON_OTHER_INDEX = 4;
export const TECHOU_KINDS: { key: TechouKind; label: string }[] = [
  { key: "shin", label: "身体障害者手帳" }, { key: "sei", label: "精神障害者保健福祉手帳" },
  { key: "ryou", label: "療育手帳" }, { key: "ta", label: "その他" },
];

export const emptyBack = (): BackSide => ({
  work: null, reasons: [], reasonsOther: "", job: "", commuteMethod: "", commuteHours: "",
  commuteMinutes: "", daysPrev: "", daysPrevPrev: "", cond: "", daily: {},
});
export const emptyTechou = (): Techou => ({ shurui: null, taName: "", kofu: "", tokyu: "", shougaimei: "" });
export const newWaku = (): Waku => ({ id: crypto.randomUUID(), from: "", to: "", jushin: true, kikan: "", text: "" });
export const today = () => new Date().toISOString().slice(0, 10);

export const emptyState = (): MoushitateshoState => ({
  version: 2, byoumei: "", hatsubyou: "", shoshin: "", ninteibi: "",
  waku: [newWaku()], back: { nintei: emptyBack(), genzai: emptyBack() }, sonota: "",
  techou: null, techouList: [], seikyuusha: { name: "", address: "", tel: "" },
  moushitateDate: today(), daihitsu: null, seikyuuType: null, fontPt: 10.5,
  updatedAt: new Date().toISOString(),
});

/* 初診日 + 1年6か月。障害認定日の既定(§6-2)。 */
export function ninteibiFrom(shoshin: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((shoshin ?? "").trim());
  if (!m) return "";
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  d.setUTCMonth(d.getUTCMonth() + 18);
  return d.toISOString().slice(0, 10);
}
