/* 「社労士を探す」/sharoushi の型・読み込み・検証・並び替え・抽出
   (docs/claude-code-sharoushi-list-2026-09-16-instructions.md §1・§3-1)。
   データは data/sharoushi/offices.json。運営者が手で書く(自動収集しない)。
   ラベル外の値・重複 id・日付の逆転・連絡先ゼロ・note の実績表現があれば、
   読み込み時に throw して build を落とす(§3-1・§8)。 */
import raw from "@/data/sharoushi/offices.json";
import {
  SHAROUSHI_FLAGS,
  SHAROUSHI_KINDS,
  SHAROUSHI_NATIONWIDE,
  SHAROUSHI_TOPICS,
  SHAROUSHI_WAYS,
} from "@/data/sharoushi/options";
import { PREFECTURES_47, prefectureBySlug } from "@/data/sharoushi/prefectures";

export type Office = {
  id: string;
  pref: string;
  name: string;
  person: string;
  regno: string;
  kai: string;
  city: string;
  addr: string;
  areas: string[];
  ways: string[];
  flags: string[];
  topics: string[];
  kinds: string[];
  firstConsult: string;
  fee: { start: string; success: string; fail: string; appeal: string };
  tel: string;
  mail: string;
  url: string;
  note: string;
  registeredAt: string;
  updatedAt: string;
  verified: { registryCheckedOn: string; by: string };
};

export type OfficesFile = { checkedOn: string; offices: Office[] };

const PREF_NAMES = new Set(PREFECTURES_47.map((p) => p.prefName));
const PREF_SLUGS = new Set(PREFECTURES_47.map((p) => p.pref));
const AREA_LABELS = new Set<string>([...PREF_NAMES, SHAROUSHI_NATIONWIDE]);
const TOPIC_LABELS = new Set<string>(SHAROUSHI_TOPICS.map((t) => t.label));
const isYmd = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

/* JSON の検証。誤りを日本語の1行ずつで返す(空なら正常)。tests/sharoushi.test.mjs がこれを直接使う。 */
export function validateOffices(file: OfficesFile): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const inSet = (id: string, field: string, values: string[], allowed: ReadonlySet<string> | readonly string[]) => {
    const ok = allowed instanceof Set ? (v: string) => allowed.has(v) : (v: string) => (allowed as readonly string[]).includes(v);
    for (const v of values) if (!ok(v)) errors.push(`${id}: ${field} にラベル外の値「${v}」`);
  };
  for (const o of file.offices ?? []) {
    const id = o.id ?? "(id なし)";
    if (!/^[a-z0-9-]+$/.test(o.id ?? "")) errors.push(`${id}: id は [a-z0-9-]+ にする`);
    if (ids.has(o.id)) errors.push(`${id}: id が重複`);
    ids.add(o.id);
    if (!PREF_SLUGS.has(o.pref)) errors.push(`${id}: pref「${o.pref}」が prefectures.ts に無い`);
    if (!o.name?.trim()) errors.push(`${id}: name が空`);
    if (!o.person?.trim()) errors.push(`${id}: person が空`);
    if (!/^[0-9-]+$/.test(o.regno ?? "")) errors.push(`${id}: regno は数字とハイフンのみ`);
    if (!PREF_NAMES.has(o.kai)) errors.push(`${id}: kai「${o.kai}」が都道府県名でない`);
    if (!o.city?.trim()) errors.push(`${id}: city が空`);
    inSet(id, "areas", o.areas ?? [], AREA_LABELS);
    inSet(id, "ways", o.ways ?? [], SHAROUSHI_WAYS);
    inSet(id, "flags", o.flags ?? [], SHAROUSHI_FLAGS);
    inSet(id, "topics", o.topics ?? [], TOPIC_LABELS);
    inSet(id, "kinds", o.kinds ?? [], SHAROUSHI_KINDS);
    if (!(o.areas ?? []).length) errors.push(`${id}: areas が空`);
    if (!(o.ways ?? []).length) errors.push(`${id}: ways が空`);
    if (!(o.topics ?? []).length) errors.push(`${id}: topics が空`);
    if (!(o.kinds ?? []).length) errors.push(`${id}: kinds が空`);
    for (const k of ["start", "success", "fail", "appeal"] as const) if (!o.fee?.[k]?.trim()) errors.push(`${id}: fee.${k} が空`);
    if (!isYmd(o.registeredAt ?? "")) errors.push(`${id}: registeredAt は YYYY-MM-DD`);
    if (!isYmd(o.updatedAt ?? "")) errors.push(`${id}: updatedAt は YYYY-MM-DD`);
    if (isYmd(o.registeredAt ?? "") && isYmd(o.updatedAt ?? "") && o.updatedAt < o.registeredAt) errors.push(`${id}: updatedAt が registeredAt より前`);
    if (!o.tel?.trim() && !o.mail?.trim() && !o.url?.trim()) errors.push(`${id}: tel・mail・url が全部空`);
    if (o.tel?.trim() && !/^[0-9-]+$/.test(o.tel.trim())) errors.push(`${id}: tel は数字とハイフンのみ`);
    if (o.url?.trim() && !/^https:\/\//.test(o.url.trim())) errors.push(`${id}: url は https:// から`);
    /* 受給率・実績件数は載せない(§8)。事務所が書いてきたら掲載前に運営者が外す。 */
    for (const ng of ["%", "％", "件", "率"]) if ((o.note ?? "").includes(ng)) errors.push(`${id}: note に「${ng}」が含まれる(受給率・実績件数は載せない)`);
    if ((o.note ?? "").length > 200) errors.push(`${id}: note が200字を超える`);
  }
  return errors;
}

const FILE = raw as OfficesFile;
{
  const errors = validateOffices(FILE);
  if (errors.length) throw new Error(`data/sharoushi/offices.json:\n${errors.join("\n")}`);
}

export const CHECKED_ON: string = FILE.checkedOn;

/* 並び順: updatedAt の新しい順、同日は name の五十音順(§1)。有料でも変えない。 */
export function sortOffices(list: readonly Office[]): Office[] {
  return [...list].sort((a, b) => (a.updatedAt === b.updatedAt ? a.name.localeCompare(b.name, "ja") : b.updatedAt.localeCompare(a.updatedAt)));
}

export const OFFICES: readonly Office[] = sortOffices(FILE.offices);

export const isNationwide = (o: Office) => o.areas.includes(SHAROUSHI_NATIONWIDE);

/* 都道府県の一覧に出す条件(§1): 所在地がその都道府県、対応地域に含む、または全国対応。 */
export function officesForPref(prefSlug: string, list: readonly Office[] = OFFICES): Office[] {
  const p = prefectureBySlug(prefSlug);
  if (!p) return [];
  return list.filter((o) => o.pref === p.pref || o.areas.includes(p.prefName) || isNationwide(o));
}

export const nationwideOffices = (list: readonly Office[] = OFFICES): Office[] => list.filter(isNationwide);

export const countByPref = (list: readonly Office[] = OFFICES): Record<string, number> =>
  Object.fromEntries(PREFECTURES_47.map((p) => [p.pref, officesForPref(p.pref, list).length]));

export const officeBySlug = (prefSlug: string, id: string): Office | undefined =>
  OFFICES.find((o) => o.pref === prefSlug && o.id === id);

export const prefNameOf = (o: Office): string => prefectureBySlug(o.pref)?.prefName ?? o.pref;

/* 一覧のカードに出す一言(先頭60字＋…)。 */
export const shortNote = (note: string): string => (note.length > 60 ? `${note.slice(0, 60)}…` : note);

/* 絞り込み(§3-2): 3群とも AND。「相談のしかた・条件」は ways と flags をまとめて見る。 */
export type Filters = { ways: string[]; topics: string[]; kinds: string[] };
export function applyFilters(list: readonly Office[], f: Filters): Office[] {
  return list.filter(
    (o) =>
      f.ways.every((v) => o.ways.includes(v) || o.flags.includes(v)) &&
      f.topics.every((v) => o.topics.includes(v)) &&
      f.kinds.every((v) => o.kinds.includes(v)),
  );
}

/* sitemap の lastmod(§4-4): 事務所は updatedAt、都道府県は配下の最大、一覧は全体の最大。無ければ checkedOn。 */
export const latestUpdated = (list: readonly Office[]): string =>
  list.reduce((max, o) => (o.updatedAt > max ? o.updatedAt : max), "") || CHECKED_ON;
