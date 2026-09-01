import dataset from "@/data/saiketsu-cases-2026-08-26.json";

export type SaiketsuCase = {
  id: string;
  url: string;
  seido: string;
  shobyo: string;
  seishin: boolean;
  request_type: string;
  request_type_group: string;
  soten: string[];
  ketsuron: "容認" | "一部容認" | "棄却" | "却下";
  nichijo_quote: boolean;
  youshi: string;
  verified: boolean;
  excluded?: boolean;
};

export const SAIKETSU_CASES = (dataset.cases as SaiketsuCase[]).filter(
  (item) => item.verified && !item.excluded,
);

export const SAIKETSU_COUNTS = {
  all: SAIKETSU_CASES.length,
  mental: SAIKETSU_CASES.filter((item) => item.seishin).length,
  firstVisit: SAIKETSU_CASES.filter((item) => item.soten.includes("初診日")).length,
  accepted: SAIKETSU_CASES.filter((item) => item.ketsuron === "容認" || item.ketsuron === "一部容認").length,
};

export function findCases(predicate: (item: SaiketsuCase) => boolean, limit = 3) {
  return SAIKETSU_CASES.filter(predicate).slice(0, limit);
}
