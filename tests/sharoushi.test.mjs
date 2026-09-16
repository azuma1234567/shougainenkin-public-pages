// /sharoushi のデータ検証(lib/sharoushi.ts の validateOffices)と都道府県の対応表。
//   node --import ./scripts/lib/ts-alias.mjs --test tests/sharoushi.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { applyFilters, officesForPref, sortOffices, validateOffices } from "@/lib/sharoushi";
import { PREFECTURES_47 } from "@/data/sharoushi/prefectures";
import { PREFECTURES } from "@/data/sharoushi/options";
import { TOPIC_LINKS } from "@/data/sharoushi/topic-links";
import { SHAROUSHI_TOPICS } from "@/data/sharoushi/options";

/* §3-1 の型の例(架空ではなく「型の例」。データには入れない) */
const example = {
  id: "osaka-example", pref: "osaka", name: "事務所名", person: "代表者名", regno: "12345678", kai: "大阪府",
  city: "大阪市北区", addr: "", areas: ["大阪府", "全国(オンライン・郵送)"], ways: ["来所", "電話"], flags: ["初回相談無料"],
  topics: ["初診日・受診歴の確認"], kinds: ["精神"], firstConsult: "無料(60分まで)",
  fee: { start: "なし", success: "年金額の2か月分", fail: "不要", appeal: "別料金" },
  tel: "06-0000-0000", mail: "", url: "https://example.com/", note: "",
  registeredAt: "2026-09-20", updatedAt: "2026-09-20", verified: { registryCheckedOn: "2026-09-19", by: "連合会名簿" },
};
const file = (...offices) => ({ checkedOn: "2026-09-16", offices });

test("正しい1件は誤り0", () => {
  assert.deepEqual(validateOffices(file(example)), []);
});

test("§9-6 落ちるべき5つ: ラベル外の値・重複 id・updatedAt < registeredAt・連絡先ゼロ・note の実績表現", () => {
  const cases = {
    "ラベル外の値(ways)": file({ ...example, ways: ["LINE"] }),
    "ラベル外の値(topics)": file({ ...example, topics: ["なんでも"] }),
    "ラベル外の値(areas)": file({ ...example, areas: ["関西"] }),
    "重複 id": file(example, { ...example, name: "別の事務所" }),
    "updatedAt < registeredAt": file({ ...example, updatedAt: "2026-09-19" }),
    "連絡先ゼロ": file({ ...example, tel: "", mail: "", url: "" }),
    "note に %": file({ ...example, note: "受給率90%" }),
    "note に 件": file({ ...example, note: "実績300件" }),
    "note に 率": file({ ...example, note: "高い認定率" }),
  };
  for (const [name, data] of Object.entries(cases)) {
    assert.ok(validateOffices(data).length > 0, `${name} が通ってしまう`);
  }
});

test("そのほかの検証: id の文字・pref・regno・https", () => {
  assert.ok(validateOffices(file({ ...example, id: "Osaka_1" })).length > 0);
  assert.ok(validateOffices(file({ ...example, pref: "kansai" })).length > 0);
  assert.ok(validateOffices(file({ ...example, regno: "12ab" })).length > 0);
  assert.ok(validateOffices(file({ ...example, url: "http://example.com/" })).length > 0);
});

test("§9-6 prefectures.ts の47件が data/madoguchi/offices.json の pref/prefName と一致", () => {
  const madoguchi = JSON.parse(readFileSync(new URL("../data/madoguchi/offices.json", import.meta.url), "utf-8")).offices;
  const pairs = new Map(madoguchi.map((o) => [o.pref, o.prefName]));
  assert.equal(PREFECTURES_47.length, 47);
  assert.equal(new Set(PREFECTURES_47.map((p) => p.pref)).size, 47);
  for (const p of PREFECTURES_47) assert.equal(pairs.get(p.pref), p.prefName, p.pref);
  assert.equal(pairs.size, 47);
  /* options.ts の47都道府県名とも同じ集合 */
  assert.deepEqual(new Set(PREFECTURES_47.map((p) => p.prefName)), new Set(PREFECTURES));
});

test("§1 都道府県の一覧に出す条件と並び順", () => {
  const osakaOnly = { ...example, id: "a", areas: ["大阪府"], updatedAt: "2026-09-18", name: "い" };
  const kyotoArea = { ...example, id: "b", pref: "kyoto", kai: "京都府", city: "京都市", areas: ["京都府", "大阪府"], updatedAt: "2026-09-18", name: "あ" };
  const nationwide = { ...example, id: "c", pref: "tokyo", kai: "東京都", city: "新宿区", areas: ["全国(オンライン・郵送)"], updatedAt: "2026-09-15" };
  const list = sortOffices([osakaOnly, kyotoArea, nationwide]);
  assert.deepEqual(list.map((o) => o.id), ["b", "a", "c"], "同日は五十音順、それ以外は更新日の新しい順");
  assert.deepEqual(officesForPref("osaka", list).map((o) => o.id), ["b", "a", "c"]);
  assert.deepEqual(officesForPref("hyogo", list).map((o) => o.id), ["c"], "兵庫県は全国対応だけ");
  assert.deepEqual(officesForPref("kyoto", list).map((o) => o.id), ["b", "c"]);
});

test("§3-2 絞り込みは AND。相談のしかた・条件は ways と flags をまとめて見る", () => {
  const a = { ...example, id: "a", ways: ["来所"], flags: ["土日祝"], topics: ["申請の前の相談"], kinds: ["精神"] };
  const b = { ...example, id: "b", ways: ["オンライン"], flags: [], topics: ["申請の前の相談", "家族からの相談"], kinds: ["内部"] };
  const ids = (f) => applyFilters([a, b], { ways: [], topics: [], kinds: [], ...f }).map((o) => o.id);
  assert.deepEqual(ids({}), ["a", "b"]);
  assert.deepEqual(ids({ ways: ["土日祝"] }), ["a"]);
  assert.deepEqual(ids({ ways: ["オンライン"] }), ["b"]);
  assert.deepEqual(ids({ topics: ["申請の前の相談"] }), ["a", "b"]);
  assert.deepEqual(ids({ topics: ["申請の前の相談", "家族からの相談"] }), ["b"]);
  assert.deepEqual(ids({ topics: ["家族からの相談"], kinds: ["精神"] }), []);
});

test("§3-4 対応表は9分類すべてを持つ", () => {
  for (const t of SHAROUSHI_TOPICS) assert.ok(TOPIC_LINKS[t.label], t.label);
  assert.equal(Object.keys(TOPIC_LINKS).length, 9);
});
