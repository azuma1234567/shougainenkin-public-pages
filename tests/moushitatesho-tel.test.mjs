// 電話番号の3分割(指示書 2026-09-04 §3-1)。
import assert from "node:assert/strict";
import test from "node:test";
import { splitTel } from "../lib/moushitatesho-tel.ts";

const segs = (v) => { const r = splitTel(v); return r.ok ? r.segments : r.reason; };

test("ハイフン3種で区切れる", () => {
  assert.deepEqual(segs("090-1234-5678"), ["090", "1234", "5678"]);
  assert.deepEqual(segs("090－1234－5678"), ["090", "1234", "5678"]);
  assert.deepEqual(segs("090ー1234ー5678"), ["090", "1234", "5678"]);
});

test("ハイフン無しの11桁は 3-4-4", () => {
  assert.deepEqual(segs("09012345678"), ["090", "1234", "5678"]);
});

test("ハイフン無しの10桁フリーダイヤルは 4-2-4", () => {
  assert.deepEqual(segs("0120345678"), ["0120", "34", "5678"]);
  assert.deepEqual(segs("0800345678"), ["0800", "34", "5678"]);
});

test("ハイフン無しのその他の10桁は区切らない(紙に書かない)", () => {
  assert.equal(segs("0312345678"), "needsHyphen");
  assert.equal(segs("0451234567"), "needsHyphen");
});

test("全角数字は半角に直す", () => {
  assert.deepEqual(segs("０９０－１２３４－５６７８"), ["090", "1234", "5678"]);
  assert.deepEqual(segs("０９０１２３４５６７８"), ["090", "1234", "5678"]);
});

test("2個に分かれたら真ん中は空", () => {
  assert.deepEqual(segs("0120-345678"), ["0120", "", "345678"]);
});

test("4個以上に分かれたら3個目に残りをつなげる", () => {
  assert.deepEqual(segs("090-1234-5678-9"), ["090", "1234", "56789"]);
});

test("空・数字なしは empty", () => {
  assert.equal(segs(""), "empty");
  assert.equal(segs("   "), "empty");
  assert.equal(segs("--"), "empty");
});

test("かっこや空白が混ざっても数字だけ拾う", () => {
  assert.deepEqual(segs("03 (1234) 5678"), "needsHyphen");
  assert.deepEqual(segs("03-1234-5678"), ["03", "1234", "5678"]);
});
