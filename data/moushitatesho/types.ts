export type Waku = { id: string; from: string; to: string; jushin: boolean; kikan: string; text: string };
export type BackSide = { work: boolean | null; reasons: number[]; job: string; commuteMethod: string; commuteHours: string; commuteMinutes: string; daysPrev: string; daysPrevPrev: string; cond: string; daily: Record<number, 1 | 2 | 3 | 4> };
export type MoushitateshoState = { version: 1; byoumei: string; hatsubyou: string; shoshin: string; seinengappi: string; waku: Waku[]; back: { nintei: BackSide; genzai: BackSide }; sonota: string; techou: null | "ari" | "nashi" | "shinsei"; techouInfo: { shurui: string; kofu: string; tokyu: string; namae: string }; seikyuuType: "honrai" | "jigojuushou" | "sokyuu" | null; updatedAt: string };

export const DAILY_ITEMS = ["着替え", "洗面", "トイレ", "入浴", "食事", "散歩", "炊事", "洗濯", "掃除", "買物"] as const;
export const WORK_REASONS_NINTEI = ["体力に自信がなかったから", "医師から働くことを止められていたから", "働く意欲がなかったから", "働きたかったが適切な職場がなかったから", "その他"] as const;
export const WORK_REASONS_GENZAI = ["体力に自信がないから", "医師から働くことを止められているから", "働く意欲がないから", "働きたいが適切な職場がないから", "その他"] as const;
export const DAILY_LEVELS_NINTEI = ["自発的にできた", "自発的にできたが援助が必要だった", "自発的にできないが援助があればできた", "できなかった"] as const;
export const DAILY_LEVELS_GENZAI = ["自発的にできる", "自発的にできるが援助が必要である", "自発的にできないが援助があればできる", "できない"] as const;

export const emptyBack = (): BackSide => ({ work: null, reasons: [], job: "", commuteMethod: "", commuteHours: "", commuteMinutes: "", daysPrev: "", daysPrevPrev: "", cond: "", daily: {} });
export const newWaku = (): Waku => ({ id: crypto.randomUUID(), from: "", to: "", jushin: true, kikan: "", text: "" });
export const emptyState = (): MoushitateshoState => ({ version: 1, byoumei: "", hatsubyou: "", shoshin: "", seinengappi: "", waku: [newWaku()], back: { nintei: emptyBack(), genzai: emptyBack() }, sonota: "", techou: null, techouInfo: { shurui: "", kofu: "", tokyu: "", namae: "" }, seikyuuType: null, updatedAt: new Date().toISOString() });
