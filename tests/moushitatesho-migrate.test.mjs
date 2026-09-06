// v1 / v2 の localStorage / JSON を読むと v3 に移行される(設計書 §10-10、docs/moushitatesho-kinyuu-ran-2026-09-06-instructions.md §1-2)。
import assert from "node:assert/strict";
import test from "node:test";
import { dateFromV2, migrateV1, migrateV2, normalize } from "../lib/moushitatesho-storage.ts";

const v1 = {
  version: 1, byoumei: "うつ病", hatsubyou: "2018-04-01", shoshin: "2018-06-15", seinengappi: "1985-01-01",
  waku: [{ id: "a", from: "2018-06", to: "2019-03", jushin: true, kikan: "A病院", text: "本文" }],
  back: { nintei: { job: "事務", reasons: [1] }, genzai: { job: "" } },
  sonota: "その他", techou: "ari",
  techouInfo: { shurui: "精神障害者保健福祉手帳", kofu: "2020-05-01", tokyu: "2", namae: "うつ病" },
  seikyuuType: "sokyuu", updatedAt: "2026-01-01T00:00:00.000Z",
};

/* v2 の画面は年月しか入力できず、保存値は必ず "-01" だった。 */
const v2 = {
  version: 2, byoumei: "双極性障害", hatsubyou: "2020-01-01", shoshin: "2020-06-01", ninteibi: "2021-12-15",
  waku: [{ id: "a", from: "2020-06", to: "2021-03", jushin: true, kikan: "B病院", text: "本文" }],
  back: { nintei: { job: "事務", reasons: [1] }, genzai: { job: "" } },
  sonota: "家族の支援を受けて生活しています。", techou: "ari",
  techouList: [{ shurui: "sei", taName: "", kofu: "2020-05-01", tokyu: "2", shougaimei: "双極性障害" }],
  seikyuusha: { name: "年金 花子", address: "", tel: "" }, moushitateDate: "2026-09-04",
  daihitsu: null, seikyuuType: "sokyuu", fontPt: 10.5, updatedAt: "2026-09-04T00:00:00.000Z",
};

test("v1 → v2。techouInfo が techouList[0] に入る", () => {
  const out = migrateV1(v1);
  assert.equal(out.version, 2);
  assert.equal(out.techouList.length, 1);
  assert.deepEqual(out.techouList[0], { shurui: "sei", taName: "", kofu: "2020-05-01", tokyu: "2", shougaimei: "うつ病" });
});

test("様式に無い seinengappi は捨てる", () => {
  assert.equal("seinengappi" in migrateV1(v1), false);
});

test("障害認定日は初診日+1年6か月が既定", () => {
  assert.equal(migrateV1(v1).ninteibi, "2019-12-15");
});

test("本文・期間・その他は消えない(v1 → v3)", () => {
  const out = normalize(v1);
  assert.equal(out.version, 3);
  assert.equal(out.byoumei, "うつ病");
  assert.equal(out.waku[0].text, "本文");
  assert.equal(out.back.nintei.sonota, "その他");
  assert.equal(out.back.genzai.sonota, "その他");
  assert.equal(out.seikyuuType, "sokyuu");
  assert.equal(out.back.nintei.job, "事務");
  assert.deepEqual(out.back.nintei.reasons, [1]);
  assert.equal(out.back.nintei.reasonsOther, "");   // v2 で足した欄は空で入る
  assert.equal(out.shoshin, "2018-06-15");           // v1 の日は本物なのでそのまま
});

test("手帳の種類が読めない文字列なら「他」+ 手帳名", () => {
  const out = migrateV1({ ...v1, techouInfo: { ...v1.techouInfo, shurui: "○○手帳" } });
  assert.equal(out.techouList[0].shurui, "ta");
  assert.equal(out.techouList[0].taName, "○○手帳");
});

/* ---- v2 → v3 ---- */
test("v2 → v3。\"-01\" で終わる発病日・初診日は YYYY-MM(日不明)になる", () => {
  const out = migrateV2(v2);
  assert.equal(out.version, 3);
  assert.equal(out.hatsubyou, "2020-01");
  assert.equal(out.shoshin, "2020-06");
  assert.equal(out.ninteibi, "2021-12-15");   // 本人が直している可能性があるので v2 の値をそのまま
});

test("v2 → v3。\"-15\" など 01 以外の日はそのまま", () => {
  assert.equal(dateFromV2("2020-06-15"), "2020-06-15");
  assert.equal(migrateV2({ ...v2, shoshin: "2020-06-15" }).shoshin, "2020-06-15");
  assert.equal(dateFromV2("2020-06"), "2020-06");
  assert.equal(dateFromV2(""), "");
});

test("v2 → v3。sonota が裏面の1・2の両方に入り、トップレベルからは消える", () => {
  const out = migrateV2(v2);
  assert.equal(out.back.nintei.sonota, "家族の支援を受けて生活しています。");
  assert.equal(out.back.genzai.sonota, "家族の支援を受けて生活しています。");
  assert.equal("sonota" in out, false);
  assert.equal(out.waku[0].work, null);      // 期間ごとの work は null で入る
});

test("JSON 読み込みは v1/v2/v3 に対応", () => {
  assert.equal(normalize(v1).version, 3);
  assert.equal(normalize(v2).version, 3);
  assert.equal(normalize({ ...migrateV2(v2) }).version, 3);
  assert.equal(normalize({ version: 4 }), null);
  assert.equal(normalize(null), null);
});
