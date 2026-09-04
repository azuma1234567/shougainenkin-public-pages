// v1 の localStorage / JSON を読むと v2 に移行される(設計書 §10-10)。
import assert from "node:assert/strict";
import test from "node:test";
import { migrateV1, normalize } from "../lib/moushitatesho-storage.ts";

const v1 = {
  version: 1, byoumei: "うつ病", hatsubyou: "2018-04-01", shoshin: "2018-06-15", seinengappi: "1985-01-01",
  waku: [{ id: "a", from: "2018-06", to: "2019-03", jushin: true, kikan: "A病院", text: "本文" }],
  back: { nintei: { job: "事務", reasons: [1] }, genzai: { job: "" } },
  sonota: "その他", techou: "ari",
  techouInfo: { shurui: "精神障害者保健福祉手帳", kofu: "2020-05-01", tokyu: "2", namae: "うつ病" },
  seikyuuType: "sokyuu", updatedAt: "2026-01-01T00:00:00.000Z",
};

test("v1 → v2。techouInfo が techouList[0] に入る", () => {
  const v2 = migrateV1(v1);
  assert.equal(v2.version, 2);
  assert.equal(v2.techouList.length, 1);
  assert.deepEqual(v2.techouList[0], { shurui: "sei", taName: "", kofu: "2020-05-01", tokyu: "2", shougaimei: "うつ病" });
});

test("様式に無い seinengappi は捨てる", () => {
  assert.equal("seinengappi" in migrateV1(v1), false);
});

test("障害認定日は初診日+1年6か月が既定", () => {
  assert.equal(migrateV1(v1).ninteibi, "2019-12-15");
});

test("本文・期間・その他は消えない", () => {
  const v2 = migrateV1(v1);
  assert.equal(v2.byoumei, "うつ病");
  assert.equal(v2.waku[0].text, "本文");
  assert.equal(v2.sonota, "その他");
  assert.equal(v2.seikyuuType, "sokyuu");
  assert.equal(v2.back.nintei.job, "事務");
  assert.deepEqual(v2.back.nintei.reasons, [1]);
  assert.equal(v2.back.nintei.reasonsOther, "");   // v2 で足した欄は空で入る
});

test("手帳の種類が読めない文字列なら「他」+ 手帳名", () => {
  const v2 = migrateV1({ ...v1, techouInfo: { ...v1.techouInfo, shurui: "○○手帳" } });
  assert.equal(v2.techouList[0].shurui, "ta");
  assert.equal(v2.techouList[0].taName, "○○手帳");
});

test("JSON 読み込みも v1/v2 両対応", () => {
  assert.equal(normalize(v1).version, 2);
  assert.equal(normalize({ ...migrateV1(v1) }).version, 2);
  assert.equal(normalize({ version: 3 }), null);
  assert.equal(normalize(null), null);
});
