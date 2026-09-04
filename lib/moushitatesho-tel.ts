/* 電話番号を、様式に印字された「― ―」の3区画に分ける(指示書 2026-09-04 §3-1)。
   左詰めで書くと印字の ― に重なるので、区切れないときは紙に書かない。 */

export type TelSplit =
  | { ok: true; segments: [string, string, string] }
  | { ok: false; reason: "empty" | "needsHyphen" };

const HYPHENS = /[-－ー‐−―]/;

/* 全角数字を半角に。数字以外(空白・かっこ)は落とす。 */
const toHalf = (s: string) =>
  s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[^0-9]/g, "");

export function splitTel(raw: string): TelSplit {
  const value = (raw ?? "").trim();
  if (!value) return { ok: false, reason: "empty" };

  const parts = value.split(HYPHENS).map(toHalf).filter((p) => p !== "");
  if (parts.length >= 2) {
    /* 4個以上に分かれたら、3個目に残りをつなげる */
    const segs: [string, string, string] = parts.length === 2
      ? [parts[0], "", parts[1]]
      : [parts[0], parts[1], parts.slice(2).join("")];
    return { ok: true, segments: segs };
  }

  const digits = toHalf(value);
  if (!digits) return { ok: false, reason: "empty" };
  if (digits.length === 11) return { ok: true, segments: [digits.slice(0, 3), digits.slice(3, 7), digits.slice(7)] };
  if (digits.length === 10 && /^(0120|0800)/.test(digits)) {
    return { ok: true, segments: [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6)] };
  }
  /* 市外局番の桁数は番号ごとに違うので、こちらで決めない */
  return { ok: false, reason: "needsHyphen" };
}

export const TEL_HINT = "市外局番の区切りにハイフンを入れてください。";
