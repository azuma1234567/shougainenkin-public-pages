import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (name) => JSON.parse(readFileSync(join(root, "data/stats", name), "utf8"));
const r02 = read("gyoumu-toukei-r02.json");
const r03 = read("gyoumu-toukei-r03.json");
const r04 = read("gyoumu-toukei-r04.json");
const r05 = read("gyoumu-toukei-r05.json");
const r06 = read("gyoumu-toukei-r06.json");
const nintei = read("nintei-chousa-r06.json");
const tenken = read("tenken.json");
const sources = read("sources.json");
const origin = process.argv[2];

const failures = [];
const expect = (label, actual, expected) => {
  if (actual !== expected) failures.push({ label, expected, actual });
};

const newTotal = r06["決定区分別件数"]["新規裁定・合計"];
const renewalTotal = r06["決定区分別件数"]["再認定・合計"];
expect("新規裁定 合計", newTotal["計"].value, 146225);
expect("新規裁定 非該当", newTotal["非該当"].value, 18982);
expect("新規裁定 非該当率", newTotal["非該当"].pct, 13.0);
expect("再認定 合計", renewalTotal["計"].value, 304456);
expect("精神障害・知的障害の診断書", r06["診断書種類別件数・新規裁定"]["精神障害・知的障害"]["決定"].value, 99386);

const mentalAverage = Math.round([r04, r05, r06].reduce((sum, year) => (
  sum + year["診断書種類別件数・新規裁定"]["精神障害・知的障害"]["決定"].value
), 0) / 3);
expect("精神障害・知的障害 令和4〜6年度平均", mentalAverage, 95173);

const newSample = nintei["新規裁定・抽出1000件"]["合計"];
expect("抽出 新規合計", newSample["計"].value, 1000);
expect("抽出 新規非該当", newSample["非該当"].value, 130);
expect("抽出 新規非該当率", newSample["非該当"].pct, 13.0);
expect("抽出 1級", newSample["1級"].value, 109);
expect("抽出 2級", newSample["2級"].value, 539);
expect("抽出 3級", newSample["3級"].value, 221);

const types = nintei["診断書種類別・新規裁定"];
expect("抽出 精神", types["精神障害"]["件数"].value, 703);
expect("抽出 外部", types["外部障害"]["件数"].value, 194);
expect("抽出 内部", types["内部障害"]["件数"].value, 131);
expect("精神 非該当率", types["精神障害"]["非該当"].pct, 12.1);
expect("外部 非該当率", types["外部障害"]["非該当"].pct, 10.8);
expect("内部 非該当率", types["内部障害"]["非該当"].pct, 20.6);
expect("精神 不支給の目安下位合計", nintei["精神障害・不支給事案"]["上記2区分の合計"]["割合"].value, 75.3);

const renewalSample = nintei["再認定・抽出10000件"]["合計"];
expect("抽出 再認定合計", renewalSample["計"].value, 10000);
expect("抽出 継続", renewalSample["継続"].value, 9681);
expect("抽出 継続率", renewalSample["継続"].pct, 96.8);
expect("抽出 増額", renewalSample["増額改定"].value, 139);
expect("抽出 増額率", renewalSample["増額改定"].pct, 1.4);
expect("抽出 減額", renewalSample["減額改定"].value, 75);
expect("抽出 減額率", renewalSample["減額改定"].pct, 0.8);
expect("抽出 停止", renewalSample["支給停止"].value, 105);
expect("抽出 停止率", renewalSample["支給停止"].pct, 1.0);

expect("点検 不支給事案", tenken["不支給事案"]["令和8年3月31日現在"]["点検済"].value, 14841);
expect("点検 支給へ変更", tenken["不支給事案"]["令和8年3月31日現在"]["支給へ変更"].value, 444);
expect("点検 支給事案", tenken["支給事案"]["令和8年8月31日現在"]["点検済"].value, 12918);
expect("点検 上位等級へ変更", tenken["支給事案"]["令和8年8月31日現在"]["上位等級へ変更"].value, 0);

expect("訂正反映", sources.sources.gyoumuToukeiR06.correction, "訂正反映: あり(令和7年10月31日)");
for (const [name, expected] of Object.entries({
  "精神障害・知的障害": 87697,
  "呼吸器疾患": 636,
  "循環器疾患": 3990,
  "腎疾患・肝疾患・糖尿病": 6953,
  "血液・造血器・その他": 4451,
  "眼": 2837,
  "聴覚等": 2859,
  "肢体": 21425
})) {
  expect(`訂正後支給件数 ${name}`, r06["診断書種類別件数・新規裁定"][name]["支給"].value, expected);
}

const nonApplicableNote = sources.sources.gyoumuToukeiR06.notes.join("\n");
if (!nonApplicableNote.includes("障害の程度以外の理由も含む")) {
  failures.push({ label: "非該当の定義注記", expected: "障害の程度以外の理由も含む", actual: nonApplicableNote });
}

const years = [r02, r03, r04, r05, r06].map((year) => year["年度"]);
expect("年次推移 年度数", years.length, 5);

const pageSource = readFileSync(join(root, "app/suuji/page.tsx"), "utf8");
const forbiddenLiterals = [
  "146225", "146,225", "18982", "18,982", "304456", "304,456",
  "99386", "99,386", "95173", "95,173", "75.3", "9681", "9,681",
  "14841", "14,841", "12918", "12,918", "444件"
];
for (const literal of forbiddenLiterals) {
  if (pageSource.includes(literal)) failures.push({ label: "本文の統計値ハードコード", expected: "data/statsから描画", actual: literal });
}

if (origin) {
  const response = await fetch(`${origin.replace(/\/$/, "")}/suuji`);
  const html = await response.text();
  expect("/suuji status", response.status, 200);
  for (const marker of ["suuji-stat-grid", "suuji-bar-track", "suuji-stacked", "suuji-donut", "suuji-line-chart"]) {
    if (!html.includes(marker)) failures.push({ label: `グラフ ${marker}`, expected: "rendered", actual: "missing" });
  }
  for (const text of ["146,225件", "87.0%", "99,386件", "304,456件", "75.3%", "14,841件", "444件", "12,918件"]) {
    if (!html.includes(text)) failures.push({ label: `本文表示 ${text}`, expected: "rendered from data", actual: "missing" });
  }
  if (html.includes("執筆メモ")) failures.push({ label: "執筆メモ", expected: "not rendered", actual: "rendered" });
}

console.log(JSON.stringify({
  anchors: failures.length === 0 ? "ok" : "failed",
  years,
  mentalAverage,
  correction: sources.sources.gyoumuToukeiR06.correction,
  nonApplicableDefinition: "障害の程度以外の理由も含む",
  hardcodedStatisticLiterals: failures.filter((item) => item.label === "本文の統計値ハードコード").length,
  failures
}, null, 2));

if (failures.length) process.exitCode = 1;
