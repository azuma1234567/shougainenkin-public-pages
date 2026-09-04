/* 検証用の5サンプル(設計 §9-2)。実在しない架空の人。 */
const back = (o = {}) => ({ work: null, reasons: [], reasonsOther: "", job: "", commuteMethod: "",
  commuteHours: "", commuteMinutes: "", daysPrev: "", daysPrevPrev: "", cond: "", daily: {}, ...o });
const waku = (i, o = {}) => ({ id: `w${i}`, from: "2020-06", to: "2021-03", jushin: true,
  kikan: "さくら病院", text: "通院を続けた。", ...o });
const base = (o = {}) => ({
  version: 2, byoumei: "", hatsubyou: "", shoshin: "", ninteibi: "", waku: [],
  back: { nintei: back(), genzai: back() }, sonota: "", techou: null, techouList: [],
  seikyuusha: { name: "", address: "", tel: "" }, moushitateDate: "2026-09-04",
  daihitsu: null, seikyuuType: null, fontPt: 10.5, updatedAt: "", ...o,
});

const LONG = "朝は起き上がれず、家族に声をかけられてやっと動けることが多かった。"
  + "食事は用意されたものを少し食べるだけで、片づけまでは手が回らなかった。"
  + "外出は月に一度の通院だけで、それも付き添いが必要だった。";

export const SAMPLES = {
  /* 全部空。何も描かれないこと */
  empty: base({ waku: [waku(1, { from: "", to: "", kikan: "", text: "", jushin: true })] }),

  /* 表1期間・裏 S=0。§10-5 が見るサンプル */
  minimal: base({
    byoumei: "うつ病", hatsubyou: "2020-01-01", shoshin: "2020-06-15", ninteibi: "2021-12-15",
    seikyuuType: "honrai", waku: [waku(1)],
    seikyuusha: { name: "年金 太郎", address: "東京都新宿区西新宿1-2-3", tel: "03-1234-5678" },
  }),

  /* 3期間・裏 S=0/S=1 両方・手帳①・代筆者なし。就労は S=0「はい」/ S=1「いいえ・オ」 */
  typical: base({
    byoumei: "双極性障害", hatsubyou: "2015-04-01", shoshin: "2015-09-10", ninteibi: "2017-03-10",
    seikyuuType: "sokyuu",
    waku: [waku(1, { from: "2015-09", to: "2017-03" }),
           waku(2, { from: "2017-04", to: "2020-03", kikan: "みどり病院", jushin: true }),
           waku(3, { from: "2020-04", to: "", jushin: false, kikan: "", text: "通院をやめていた期間。" })],
    back: {
      nintei: back({ work: true, job: "飲食店で接客業務", commuteMethod: "電車とバス",
        commuteHours: "1", commuteMinutes: "20", daysPrev: "12", daysPrevPrev: "9",
        cond: "立ち仕事が続くと動悸がして、終わったあとは動けなかった。",
        daily: { 0: 2, 1: 2, 2: 1, 3: 3, 4: 2, 5: 3, 6: 3, 7: 2, 8: 3, 9: 3 } }),
      genzai: back({ work: false, reasons: [0, 4], reasonsOther: "通院の回数が多く続けられない",
        daily: { 0: 3, 1: 3, 2: 2, 3: 4, 4: 3, 5: 4, 6: 4, 7: 3, 8: 4, 9: 4 } }),
    },
    sonota: "家族の支援を受けて生活しています。",
    techou: "ari",
    techouList: [{ shurui: "sei", taName: "", kofu: "2018-05-01", tokyu: "2", shougaimei: "双極性障害" }],
    seikyuusha: { name: "年金 花子", address: "神奈川県横浜市南区南太田1-2-3 サンプル荘101", tel: "045-123-4567" },
  }),

  /* 7期間 → 続紙1枚(表2行・裏なし)。No.2 / 枚中2 */
  seven: base({
    byoumei: "統合失調症", hatsubyou: "2010-01-01", shoshin: "2010-05-20", ninteibi: "2011-11-20",
    seikyuuType: "jigojuushou",
    waku: Array.from({ length: 7 }, (_, i) => waku(i + 1, { from: `201${i}-01`, to: `201${i}-12` })),
    back: { nintei: back(), genzai: back({ work: false, reasons: [1], daily: { 0: 3, 2: 3 } }) },
    seikyuusha: { name: "年金 一郎", address: "大阪府大阪市北区1-1", tel: "06-6666-7777" },
    daihitsu: { name: "年金 次郎", zokugara: "長男", tel: "09012345678" },
  }),

  /* 16期間 → 続紙2枚。全欄最長。絵文字・URL・半角英数・改行を混ぜる */
  max: base({
    byoumei: "気分障害（うつ病）・不安障害・パニック障害の併発", hatsubyou: "2005-03-01",
    shoshin: "2005-08-08", ninteibi: "2007-02-08", seikyuuType: "sokyuu", fontPt: 10.5,
    waku: Array.from({ length: 16 }, (_, i) => waku(i + 1, {
      from: `20${String(5 + i).padStart(2, "0")}-01`, to: `20${String(5 + i).padStart(2, "0")}-12`,
      kikan: "医療法人社団さくら会 さくらメンタルクリニック本院",
      text: `${LONG}\n${LONG}\nhttps://example.com/very/long/path?a=1&b=2 ABCdef123 😀🙂\n${LONG}`,
    })),
    back: {
      nintei: back({ work: true, job: "工事現場で交通誘導員（早番・遅番の交替制）",
        commuteMethod: "自転車と電車を乗り継いで", commuteHours: "2", commuteMinutes: "05",
        daysPrev: "20", daysPrevPrev: "18", cond: `${LONG}\n${LONG}` }),
      genzai: back({ work: false, reasons: [0, 1, 2, 3, 4],
        reasonsOther: "主治医から就労を止められており、体力も続かないため",
        daily: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i, 4])) }),
    },
    sonota: `${LONG}\n${LONG}`,
    techou: "ari",
    techouList: [
      { shurui: "sei", taName: "", kofu: "2008-04-01", tokyu: "2", shougaimei: "気分障害" },
      { shurui: "ta", taName: "自治体独自の福祉手帳", kofu: "2012-10-01", tokyu: "3", shougaimei: "不安障害・パニック障害" },
    ],
    seikyuusha: { name: "年金 三四郎", address: "北海道札幌市中央区北一条西一丁目1番地1号 サンプルマンション1001号室", tel: "0120345678" },
    daihitsu: { name: "年金 四郎", zokugara: "配偶者", tel: "０９０－１２３４－５６７８" },
  }),
};
