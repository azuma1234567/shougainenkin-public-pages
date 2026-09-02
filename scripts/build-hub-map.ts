import { writeFileSync, mkdirSync, readFileSync } from "node:fs";

const source = readFileSync("lib/hubs.ts", "utf8");
const assignmentSource = source.slice(source.indexOf("export const COLUMN_HUB_ASSIGNMENTS"), source.indexOf("export function getHub"));
const columns = [...assignmentSource.matchAll(/^\s+"([^"]+)": assignment\("([^"]+)", "(promote|core|leaf)"(?:, \[([^\]]*)\])?(?:, "([^"]+)")?\),$/gm)].map((match) => ({
  slug: match[1],
  hubPrimary: match[2],
  role: match[3],
  hubSecondary: [...(match[4] ?? "").matchAll(/"([^"]+)"/g)].map((item) => item[1]),
  mergeCandidate: match[5] ?? null,
}));
const hubPaths = [...source.matchAll(/^\s+hub\("([^"]+)",/gm)].map((match) => match[1]);

const unitPackRules = {
  firstVisit: ["/shinsei#step-2", "/nayami/shoshinbi-karute"],
  doctorPrep: ["/shinsei#step-5", "/nayami/shindansho-komatta"],
  statement: ["/shinsei#step-6"],
  payment: ["/okane/ikura", "/joukyou/hatachi-mae", "/nayami/sokyuu"],
  position: ["/byoki/utsu-soukyoku", "/byoki/tekiou-fuan", "/byoki/hattatsu"],
};

const output = {
  generatedAt: new Date().toISOString(),
  columns,
  hubPaths,
  unitPackRules,
};

mkdirSync("docs/generated", { recursive: true });
writeFileSync("docs/generated/hub-map.json", `${JSON.stringify(output, null, 2)}\n`);
console.log(`hub-map: ${output.columns.length} articles / ${output.hubPaths.length} direct hub definitions`);
