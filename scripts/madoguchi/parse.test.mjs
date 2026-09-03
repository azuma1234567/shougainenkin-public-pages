/* パーサの単体テスト。機構サイトに接続せず、scripts/madoguchi/fixtures/ だけを読む。
   npm run verify:madoguchi-parse */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseKankatsu, parseOffice, parsePrefIndex, shortName, splitJurisdiction } from "./parse.mjs";

const dir = path.join(import.meta.dirname, "fixtures");
const fx = (f) => readFileSync(path.join(dir, f), "utf8");
const results = [];
const test = (name, fn) => {
  try { fn(); results.push({ name, ok: true }); }
  catch (e) { results.push({ name, ok: false, msg: e.message.split("\n")[0] }); }
};

test("都道府県ページ: 年金事務所28件・街角11件を、名称とリンクで拾う", () => {
  const list = parsePrefIndex(fx("tokyo-index.html"));
  assert.equal(list.length, 39);
  assert.equal(list.filter((x) => x.kind === "nenkin").length, 28);
  assert.equal(list.filter((x) => x.kind === "machikado").length, 11);
  const adachi = list.find((x) => x.href.endsWith("/adachi.html"));
  assert.equal(adachi.name, "足立（あだち）年金事務所");
  assert.equal(adachi.kind, "nenkin");
  const office = list.find((x) => x.href.endsWith("/adachioffice.html"));
  assert.equal(office.sub, "office");
  assert.equal(list.find((x) => x.href.endsWith("/oomori.html"))?.sub ?? list.filter((x) => x.sub === "center").length > 0, true);
});

test("年金事務所ページ: 住所・電話・FAX・受付時間・交通を、ラベルから拾う", () => {
  const o = parseOffice(fx("tokyo-adachi.html"), { kind: "nenkin" });
  assert.equal(o.name, "足立（あだち）年金事務所");
  assert.equal(o.nameShort, "足立");
  assert.equal(o.zip, "120-8580");
  assert.equal(o.addr, "東京都足立区綾瀬2-17-9");
  /* 事務所の電話は本文に無く、tel: リンクと画像の alt にしかない */
  assert.equal(o.tel, "03-3604-0111");
  assert.equal(o.telNote, "自動音声案内");
  assert.equal(o.fax, "03-3602-4449");
  assert.match(o.hours.weekday, /^月曜から金曜/);
  assert.match(o.hours.weekStartExt, /^週初の開所日/);
  assert.match(o.hours.secondSat, /^第2土曜/);
  assert.match(o.hours.closed, /年末年始/);
  assert.match(o.access, /綾瀬駅/);
  assert.equal(o.parking, "有（5台）");
});

test("街角(オフィス): 共通番号を除いた1本を電話として拾う", () => {
  const o = parseOffice(fx("tokyo-adachioffice.html"), { kind: "machikado" });
  assert.equal(o.name, "街角の年金相談センター足立（あだち）（オフィス）");
  assert.equal(o.nameShort, "足立");
  assert.equal(o.zip, "120-0005");
  assert.equal(o.tel, "03-5650-5200");   /* 0570- の共通番号5本は除かれる */
  assert.equal(o.fax, "");
  assert.equal(o.parking, "無");
  assert.equal(o.hours.weekStartExt, "");
});

test("街角(センター): オフィスと同じ形で読める", () => {
  const o = parseOffice(fx("machikado-center.html"), { kind: "machikado" });
  assert.match(o.name, /^街角の年金相談センター/);
  assert.ok(!o.name.includes("（オフィス）"));
  assert.match(o.zip, /^\d{3}-\d{4}$/);
  assert.match(o.tel, /^0\d{1,4}-\d{1,4}-\d{4}$/);
});

test("管轄区域ページ: 事務所名 / 厚年 / 国年 の3列を行ごとに取り、脚注も拾う", () => {
  const { rows, notes } = parseKankatsu(fx("kankatsu-tokyo.html"));
  assert.equal(rows.length, 28);
  const chiyoda = rows.find((r) => r.office === "千代田");
  assert.equal(chiyoda.kousei, "千代田区");
  assert.equal(chiyoda.kokumin, "千代田区");
  /* 新宿は厚年と国年で中身が違う(研究文書 §2-4) */
  const shinjuku = rows.find((r) => r.office === "新宿");
  const names = (cell) => splitJurisdiction(cell).filter((x) => x.type === "name").map((x) => x.value);
  assert.deepEqual(names(shinjuku.kousei), ["新宿区", "杉並区", "中野区"]);
  assert.deepEqual(names(shinjuku.kokumin), ["新宿区"]);
  /* 杉並は厚年が空(国年だけを持つ)。事務所側が空になるのは正常 */
  const suginami = rows.find((r) => r.office === "杉並");
  assert.deepEqual(names(suginami.kousei), []);
  assert.deepEqual(names(suginami.kokumin), ["杉並区"]);
  /* 港は支庁単位が混ざる */
  const minato = rows.find((r) => r.office === "港");
  const areas = splitJurisdiction(minato.kousei).filter((x) => x.type === "area").map((x) => x.value);
  assert.deepEqual(areas, ["大島支庁管内", "三宅支庁管内", "八丈支庁管内", "小笠原支庁管内"]);
  assert.ok(Array.isArray(notes));
});

test("管轄セルの割り方: 郡・一部・支庁を書かれているとおりに種別化する", () => {
  const t = (cell) => splitJurisdiction(cell).map((x) => `${x.type}:${x.value}`);
  assert.deepEqual(t("新宿区 杉並区 中野区"), ["name:新宿区", "name:杉並区", "name:中野区"]);
  assert.deepEqual(t("函館市 松前郡"), ["name:函館市", "gun:松前郡"]);
  /* 郡の一部が町村名で書いてあるものは確定できる */
  assert.deepEqual(t("虻田郡のうち豊浦町及び洞爺湖町"), ["name:豊浦町", "name:洞爺湖町"]);
  /* 市の一部を大字で分けているものは、市区町村より細かいので partial */
  assert.deepEqual(t("水戸市のうち赤尾関町、秋成町、圷大野"), ["partial:水戸市"]);
  /* 括弧の開きと閉じが違う表記(（…。) )も読める */
  assert.deepEqual(t("水戸市(水戸南年金事務所管内の地域を除く。)常陸太田市"), ["partial:水戸市", "name:常陸太田市"]);
  assert.deepEqual(t("大島支庁管内、三宅支庁管内"), ["area:大島支庁管内", "area:三宅支庁管内"]);
  assert.deepEqual(t("-"), []);
});

test("shortName: 読みと「年金事務所」を落とす", () => {
  assert.equal(shortName("足立（あだち）年金事務所"), "足立");
  assert.equal(shortName("街角の年金相談センター足立（あだち）（オフィス）"), "足立");
  assert.equal(shortName("横浜中（よこはまなか）年金事務所"), "横浜中");
});

for (const r of results) console.log(`${r.ok ? "○" : "×"} ${r.name}${r.ok ? "" : `\n   ${r.msg}`}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} 通過`);
if (failed) process.exitCode = 1;
