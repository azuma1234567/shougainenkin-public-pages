// /ads/sharoushi の申込みフォームの検証・本文・mailto(lib/sharoushi-apply.ts)。
//   node --import ./scripts/lib/ts-alias.mjs --test tests/sharoushi-apply.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBody, buildMailto, buildSubject, EMPTY_FORM, MAILTO_BODY, validate } from "@/lib/sharoushi-apply";
import { PREFECTURES, SHAROUSHI_NATIONWIDE } from "@/data/sharoushi/options";
import { CONTACT_EMAIL } from "@/lib/constants";

const filled = {
  ...EMPTY_FORM,
  office: "テスト社労士事務所", person: "山田太郎", regno: "12345678", kai: "東京都", pref: "東京都", city: "千代田区",
  areas: ["東京都"], ways: ["来所"], flags: ["土日祝"], topics: ["申請の前の相談"], kinds: ["精神"],
  fee_start: "なし", fee_success: "年金額の○か月分", fee_note: "2か月分", fee_fail: "不要", fee_appeal: "含む",
  tel: "03-0000-0000", mail: "test@example.com", url: "https://example.com/", note: "一言です",
  draft: "運営者に下書きを作ってほしい(事務所サイトを参照)", source: "検索", agree: true,
};

test("§9-3 必須19項目: 全部そろえば誤り0、空なら日本語の1行ずつ", () => {
  assert.deepEqual(validate(filled), []);
  const empty = validate(EMPTY_FORM).map((e) => e.message);
  assert.ok(empty.length >= 16, `空の誤り ${empty.length}`);
  assert.ok(empty.every((m) => /ください$/.test(m)));
  assert.ok(empty.includes("事務所名を入力してください"));
});

test("§9-3 必須を1つ欠くと送信できない(19項目それぞれ)", () => {
  const cases = {
    office: { office: "" }, person: { person: "" }, regno: { regno: "abc" }, kai: { kai: "" }, pref: { pref: "" }, city: { city: "" },
    areas: { areas: [] }, ways: { ways: [] }, topics: { topics: [] }, kinds: { kinds: [] },
    fee_start: { fee_start: "" }, fee_success: { fee_success: "" }, fee_fail: { fee_fail: "" }, fee_appeal: { fee_appeal: "" },
    contact: { tel: "", mail: "", url: "" }, draft: { draft: "" }, agree: { agree: false },
    mail_format: { mail: "bad" }, url_https: { url: "http://example.com" }, tel_format: { tel: "03(0000)0000" },
  };
  for (const [name, patch] of Object.entries(cases)) {
    const errors = validate({ ...filled, ...patch });
    assert.equal(errors.length, 1, `${name}: ${JSON.stringify(errors)}`);
  }
  // flags・note・fee_note・source は任意
  assert.deepEqual(validate({ ...filled, flags: [], note: "", fee_note: "", source: "" }), []);
});

test("§9-4 件名と本文の形式(§3-3)", () => {
  assert.equal(buildSubject(filled), "【掲載申込み】テスト社労士事務所（東京都）");
  const body = buildBody(filled, "2026-09-16");
  assert.equal(body, `障害年金申請サポート 掲載申込み

■事務所名: テスト社労士事務所
■代表者名: 山田太郎
■社労士登録番号: 12345678
■所属会: 東京都社会保険労務士会
■所在地: 東京都 千代田区
■対応地域: 東京都
■相談のしかた: 来所
■相談の条件: 土日祝
■対応できる相談: 申請の前の相談
■得意な障害の種類: 精神
■料金の型:
  着手金: なし
  成功報酬: 年金額の○か月分(2か月分)
  不支給のとき: 不要
  審査請求: 含む
■連絡先:
  電話: 03-0000-0000
  メール: test@example.com
  サイト: https://example.com/
■一言: 一言です
■原稿: 運営者に下書きを作ってほしい(事務所サイトを参照)
■知ったきっかけ: 検索
■規約への同意: あり(2026-09-16)`);
  assert.ok(buildBody({ ...filled, flags: [] }).includes("■相談の条件: なし"));
});

test("§9-4 mailto: 宛先・件名・本文・改行は %0D%0A", () => {
  const href = buildMailto(buildSubject(filled), buildBody(filled, "2026-09-16"));
  assert.ok(href.startsWith(`mailto:${CONTACT_EMAIL}?subject=`));
  const u = new URL(href);
  assert.equal(u.searchParams.get("subject"), buildSubject(filled));
  assert.equal(u.searchParams.get("body"), buildBody(filled, "2026-09-16").replace(/\n/g, "\r\n"));
  assert.ok(!/(^|[^D])%0A/.test(href.replace(/%0D%0A/g, "")), "裸の %0A が残っている");
});

test("§9-6 主ボタンの mailto 本文は3行固定で、入力値を含まない", () => {
  const long = { ...filled, areas: [SHAROUSHI_NATIONWIDE, ...PREFECTURES], note: "あ".repeat(200) };
  const href = buildMailto(buildSubject(long), MAILTO_BODY);
  const u = new URL(href);
  assert.equal(u.pathname, CONTACT_EMAIL);
  assert.equal(u.searchParams.get("subject"), "【掲載申込み】テスト社労士事務所（東京都）");
  assert.deepEqual(u.searchParams.get("body").split("\r\n"), [
    "障害年金申請サポート 掲載申込み",
    "この下に、コピー済みの申込み内容を貼り付けてください(Windows: Ctrl+V / Mac: Cmd+V)。",
    "貼り付けられない場合は、ページの「本文をコピーする」からもう一度コピーできます。",
  ]);
  for (const value of ["山田太郎", "12345678", "千代田区", "沖縄県", "03-0000-0000", "test@example.com", "あああ"]) {
    assert.ok(!href.includes(encodeURIComponent(value)), `mailto に入力値 ${value} が入っている`);
  }
});

test("§9-6 コピーされる本文は §3-3 と一致(47都道府県でも切れない)", () => {
  const long = { ...filled, areas: [SHAROUSHI_NATIONWIDE, ...PREFECTURES], note: "あ".repeat(200) };
  const body = buildBody(long, "2026-09-16");
  assert.ok(body.startsWith("障害年金申請サポート 掲載申込み\n\n■事務所名: テスト社労士事務所\n"));
  assert.ok(body.includes(`■対応地域: ${[SHAROUSHI_NATIONWIDE, ...PREFECTURES].join("、")}\n`));
  assert.ok(body.includes(`■一言: ${"あ".repeat(200)}\n`));
  assert.ok(body.endsWith("■規約への同意: あり(2026-09-16)"));
  assert.equal(body.split("\n").length, 25);
});
