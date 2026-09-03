/* /dougu/madoguchi の窓口の引き当てと、提出先の判定。
   docs/madoguchi-tool-design-2026-09-02.md §3・§3-2・§5、
   docs/madoguchi-research-2026-09-03.md §3-2・§7。
   データは data/madoguchi/client.json(scripts/madoguchi/build.mjs が生成)。
   固定ロジックのみ。fetch / XMLHttpRequest / sendBeacon / WebSocket を書かない。 */
import data from "@/data/madoguchi/client.json";

export type Seido = "kokumin" | "kousei" | "fumei";
export type Hatachi = "mae" | "ato" | "fumei";

export type Office = {
  id: string; name: string; kind: "nenkin" | "machikado"; sub?: "center" | "office";
  zip: string; addr: string; tel: string; telNote?: string; access?: string; url: string; pref: string;
};

export const CHECKED_ON: string = data.checkedOn;
export const COMMON_TEL = data.commonTel;

const OFFICES = data.offices as unknown as Record<string, { n: string; k: "nenkin" | "machikado"; s?: "center" | "office"; z: string; a: string; t: string; tn?: string; ac?: string; u: string; p: string }>;
const INDEX = data.index as unknown as Record<string, { kousei: string | string[] | null; kokumin: string | string[] | null; split?: boolean; splitText?: Record<string, string[]> }>;

export function office(id: string): Office | null {
  const o = OFFICES[id];
  if (!o) return null;
  return { id, name: o.n, kind: o.k, sub: o.s, zip: o.z, addr: o.a, tel: o.t, telNote: o.tn, access: o.ac, url: o.u, pref: o.p };
}

export const PREFECTURES: string[] = Object.keys(data.municipalities);
export const municipalitiesOf = (pref: string): { code: string; name: string }[] =>
  ((data.municipalities as unknown as Record<string, [string, string][]>)[pref] ?? []).map(([code, name]) => ({ code, name }));

/* 機構の管轄区域ページ(市が2つの事務所に分かれるときにリンクする)。 */
export const kankatsuUrl = (pref: string): string => {
  const slug = (data.prefSlug as Record<string, string>)[pref];
  return slug ? `${data.kankatsuUrl}${slug}.html` : "";
};

const asList = (v: string | string[] | null | undefined): string[] => (Array.isArray(v) ? v : v ? [v] : []);

export type Jurisdiction = {
  kousei: Office[];
  kokumin: Office[];
  /* 機構が市区町村より細かい単位(大字)で振り分けている市区。両方を出し、断定しない。 */
  split: boolean;
  splitText: { kousei: string[]; kokumin: string[] };
  /* 厚年と国年で事務所が違う。「相談と提出で行く場所が違うことがあります」を添える。 */
  differs: boolean;
};

export function jurisdictionOf(code: string): Jurisdiction | null {
  const entry = INDEX[code];
  if (!entry) return null;
  const kousei = asList(entry.kousei).map(office).filter((o): o is Office => !!o);
  const kokumin = asList(entry.kokumin).map(office).filter((o): o is Office => !!o);
  const ids = (list: Office[]) => list.map((o) => o.id).sort().join(",");
  return {
    kousei, kokumin,
    split: !!entry.split,
    splitText: { kousei: entry.splitText?.kousei ?? [], kokumin: entry.splitText?.kokumin ?? [] },
    differs: ids(kousei) !== ids(kokumin),
  };
}

/* 街角は管轄が無く、誰でもどこでも使える。都道府県で引く。 */
export const machikadoOf = (pref: string): Office[] =>
  ((data.machikado as Record<string, string[]>)[pref] ?? []).map(office).filter((o): o is Office => !!o);

/* ===== §3 提出先の判定 ===== */
export type Submission = {
  where: string;
  why: string;
  /* 第3号被保険者の但し書き。国民年金を選んだときだけ出す(§8-3)。 */
  dai3: boolean;
  /* 「窓口を探す」でどちらの管轄を出すか。 */
  show: ("kousei" | "kokumin")[];
};

export function submission(seido: Seido | null, hatachi: Hatachi | null): Submission | null {
  if (!seido && !hatachi) return null;
  const kiso = seido === "kokumin" || hatachi === "mae";
  if (seido === "kousei" && hatachi !== "mae") {
    return {
      where: "年金事務所",
      why: "初診日に厚生年金に入っていたので、障害厚生年金の請求になります。",
      dai3: false, show: ["kousei"],
    };
  }
  if (kiso && seido !== "kousei") {
    return {
      where: "お住まいの市区町村の国民年金の窓口",
      why: "障害基礎年金だけの請求になるためです。",
      dai3: seido === "kokumin", show: ["kokumin"],
    };
  }
  return {
    where: "年金事務所(まずはこちらで大丈夫です)",
    why: "初診日にどの制度に入っていたかで決まります。分からないときは、年金事務所で記録を見てもらえます。",
    dai3: false, show: ["kousei", "kokumin"],
  };
}

/* 地図は埋め込まず、検索URLへのリンクだけ(設計書 §6・§7)。 */
export const mapUrl = (addr: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
export const telHref = (tel: string) => `tel:${tel.replace(/-/g, "")}`;
