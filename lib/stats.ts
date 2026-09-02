import r02 from "@/data/stats/gyoumu-toukei-r02.json";
import r03 from "@/data/stats/gyoumu-toukei-r03.json";
import r04 from "@/data/stats/gyoumu-toukei-r04.json";
import r05 from "@/data/stats/gyoumu-toukei-r05.json";
import r06 from "@/data/stats/gyoumu-toukei-r06.json";
import nintei from "@/data/stats/nintei-chousa-r06.json";
import tenken from "@/data/stats/tenken.json";
import sources from "@/data/stats/sources.json";

export type StatCell = {
  value: number;
  unit: string;
  pct: number | null;
  derived?: boolean;
};

export const stats = {
  r06,
  nintei,
  tenken,
  sources,
  annual: [r02, r03, r04, r05, r06],
} as const;

export function formatCount(cell: StatCell) {
  return `${cell.value.toLocaleString("ja-JP")}${cell.unit}`;
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}
