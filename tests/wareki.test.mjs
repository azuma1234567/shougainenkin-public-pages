// lib/wareki.ts の元号判定。境界日4つ(設計書 §3-3)。
import assert from "node:assert/strict";
import test from "node:test";
import { toWareki } from "../lib/wareki.ts";

test("改元の境界4つ", () => {
  assert.deepEqual(toWareki("1989-01-07"), { gengou: "showa", year: 64, month: 1, day: 7 });
  assert.deepEqual(toWareki("1989-01-08"), { gengou: "heisei", year: 1, month: 1, day: 8 });
  assert.deepEqual(toWareki("2019-04-30"), { gengou: "heisei", year: 31, month: 4, day: 30 });
  assert.deepEqual(toWareki("2019-05-01"), { gengou: "reiwa", year: 1, month: 5, day: 1 });
});

test("昭和のはじまり。それより前は様式に無いので null", () => {
  assert.deepEqual(toWareki("1926-12-25"), { gengou: "showa", year: 1, month: 12, day: 25 });
  assert.equal(toWareki("1926-12-24"), null);
});

test("令和元年は 1", () => {
  assert.equal(toWareki("2019-12-31").year, 1);
  assert.equal(toWareki("2020-01-01").year, 2);
});

test("月まで(YYYY-MM)は day が null", () => {
  assert.deepEqual(toWareki("2021-02"), { gengou: "reiwa", year: 3, month: 2, day: null });
  // 改元をまたぐ月は、月初の元号を採る(どちらとも決められないので寄せない)
  assert.equal(toWareki("2019-05").gengou, "reiwa");
  assert.equal(toWareki("1989-01").gengou, "showa");
});

test("形が違うものは null", () => {
  for (const v of ["", "2020", "2020/01", "abc", "2020-13", "2020-01-32"]) assert.equal(toWareki(v), null);
});
