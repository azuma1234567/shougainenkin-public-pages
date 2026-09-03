/* /dougu/mitate の計算。docs/mitate-tool-design-2026-09-02.md §5・§6。
   アプリ repo src/lib/mitateCore.ts の関数をそのまま移植した(関数名を変えないこと)。
   **判定しない。**国が公表している表へ機械的に当てはめて返すだけ。
   fetch / XMLHttpRequest / sendBeacon / WebSocket をここに書かない。 */
import {
  MITATE_ABILITY_ITEMS, MITATE_AVERAGE_BANDS, MITATE_GRADE_TABLE,
  MITATE_GUIDE_AUTO, MITATE_GUIDE_CHITEKI, MITATE_GUIDE_COMMON, MITATE_GUIDE_HATTATSU,
  MITATE_GUIDE_LIMIT, MITATE_GUIDE_SEISHIN, MITATE_KINDS, MITATE_SEIDO_CHOICES,
  type MitateAbilityItemId, type MitateAbilityValue, type MitateDegree, type MitateGrade,
  type MitateGuideItem, type MitateKind, type MitateMode, type MitateSeido,
} from "@/data/mitate";

export type MitateAnswers = {
  ability: Partial<Record<MitateAbilityItemId, MitateAbilityValue>>;
  degree?: MitateDegree;
};

/* 端末に保存する状態。結果も入力もここから外へ出さない。 */
export type MitateState = MitateAnswers & {
  kind?: MitateKind;
  mode?: MitateMode;
  guide: Record<string, boolean>;
  seido?: MitateSeido;
};

export const emptyMitateState = (): MitateState => ({ ability: {}, guide: {} });

/* ================= 判定平均 ================= */
export type MitateAverage = { value: number | null; answered: number; total: number };

export function mitateAverage(answers: MitateAnswers): MitateAverage {
  const values = MITATE_ABILITY_ITEMS
    .map((item) => answers.ability[item.id])
    .filter((v): v is MitateAbilityValue => v !== undefined);
  const total = MITATE_ABILITY_ITEMS.length;
  if (values.length === 0) return { value: null, answered: 0, total };
  const sum = values.reduce((a, b) => a + b, 0);
  /* 小数第2位まで。丸めてから表へ当てはめる——表示した数値と当てはめの結果が
     食い違うと、利用者が検算できない。 */
  const rounded = Math.round((sum / values.length) * 100) / 100;
  return { value: rounded, answered: values.length, total };
}

/* 境界値(1.5 / 2.0 / 2.5 / 3.0 / 3.5)は「以上」の側、つまり上の行に入る。 */
export function mitateBandLabel(average: number): string {
  const band = MITATE_AVERAGE_BANDS.find((b) => average >= b.min && (b.max === null || average < b.max));
  return band ? band.label : MITATE_AVERAGE_BANDS[MITATE_AVERAGE_BANDS.length - 1].label;
}

/* ================= 当てはめ ================= */
export type MitateLookup =
  | { kind: 'none'; reason: 'no_ability' | 'no_degree' }
  | { kind: 'found'; band: string; degree: MitateDegree; grade: MitateGrade }
  | { kind: 'blank'; band: string; degree: MitateDegree };

export function mitateLookup(answers: MitateAnswers): MitateLookup {
  const avg = mitateAverage(answers);
  if (avg.value === null) return { kind: 'none', reason: 'no_ability' };
  if (answers.degree === undefined) return { kind: 'none', reason: 'no_degree' };
  const band = mitateBandLabel(avg.value);
  const grade = MITATE_GRADE_TABLE[band][answers.degree - 1];
  if (grade === null || grade === undefined) return { kind: 'blank', band, degree: answers.degree };
  return { kind: 'found', band, degree: answers.degree, grade };
}

/* 行の区切りから ±0.15 以内か。上端(4)・下端(1)は区切りではないので数えない。 */
export const MITATE_BOUNDARY_MARGIN = 0.15;

export function isNearBoundary(average: number): boolean {
  return MITATE_AVERAGE_BANDS
    .map((b) => b.min)
    .filter((min) => min > 1 && min < 4)
    .some((min) => Math.abs(average - min) <= MITATE_BOUNDARY_MARGIN);
}

/* 特定の項目に著しい偏りがあるか(4項目以上に答えていて、最大と最小の差が2以上)。 */
export function hasBias(answers: MitateAnswers): boolean {
  const values = MITATE_ABILITY_ITEMS
    .map((item) => answers.ability[item.id])
    .filter((v): v is MitateAbilityValue => v !== undefined);
  return values.length >= 4 && Math.max(...values) - Math.min(...values) >= 2;
}

/* ================= 総合評価 ================= */
export function mitateGuideSet(kind: MitateKind | undefined): MitateGuideItem[] {
  const extra = kind === 'chiteki' ? MITATE_GUIDE_CHITEKI
    : kind === 'hattatsu' ? MITATE_GUIDE_HATTATSU
    : MITATE_GUIDE_SEISHIN;
  return [...MITATE_GUIDE_COMMON, ...extra];
}

/* 選ばれたもの + 自動で立つもの。点数化も等級の計算し直しもしない。最大6件。 */
export function mitateGuideHits(state: MitateState, lookup: MitateLookup): MitateGuideItem[] {
  const hits = mitateGuideSet(state.kind).filter((g) => state.guide[g.id]);
  if (lookup.kind === 'blank') hits.push(MITATE_GUIDE_AUTO.gap);
  if (hasBias(state)) hits.push(MITATE_GUIDE_AUTO.bias);
  return hits.slice(0, MITATE_GUIDE_LIMIT);
}

/* ================= 端末に残った回答の読み直し =================
   **知らない形は捨てて未回答へ戻す。**壊れた値のまま表へ当てはめると、
   国の表に無い目安を見せることになるため、疑わしいものは通さない。 */
export function normalizeMitate(value: unknown): MitateState | null {
  if (value === null || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const ability: MitateAnswers['ability'] = {};
  const rawAbility = raw.ability;
  if (rawAbility !== null && typeof rawAbility === 'object') {
    for (const item of MITATE_ABILITY_ITEMS) {
      const v = (rawAbility as Record<string, unknown>)[item.id];
      if (v === 1 || v === 2 || v === 3 || v === 4) ability[item.id] = v;
    }
  }
  const state: MitateState = { ability, guide: {} };
  const degree = raw.degree;
  if (degree === 1 || degree === 2 || degree === 3 || degree === 4 || degree === 5) state.degree = degree;
  if (MITATE_KINDS.some((k) => k.value === raw.kind)) state.kind = raw.kind as MitateKind;
  if (raw.mode === 'A' || raw.mode === 'B') state.mode = raw.mode;
  if (MITATE_SEIDO_CHOICES.some((s) => s.value === raw.seido)) state.seido = raw.seido as MitateSeido;
  const rawGuide = raw.guide;
  if (rawGuide !== null && typeof rawGuide === 'object') {
    /* 知らない id は通さない(表に無い引用を出さないため)。 */
    const known = new Set([
      ...MITATE_GUIDE_COMMON, ...MITATE_GUIDE_SEISHIN, ...MITATE_GUIDE_CHITEKI, ...MITATE_GUIDE_HATTATSU,
    ].map((g) => g.id));
    for (const [id, on] of Object.entries(rawGuide as Record<string, unknown>)) {
      if (known.has(id) && on === true) state.guide[id] = true;
    }
  }
  const empty = Object.keys(state.ability).length === 0 && state.degree === undefined
    && state.kind === undefined && state.mode === undefined && state.seido === undefined
    && Object.keys(state.guide).length === 0;
  return empty ? null : state;
}
