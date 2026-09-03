/* 機構ページのパース。CSSクラスではなく見出し・ラベル文字列で拾う(研究文書 §6)。
   ネットワークには触らない。scripts/madoguchi/parse.test.mjs が fixtures だけで通ること。 */
import { parse as parseHtml } from "node-html-parser";
import { COMMON_TEL_DIGITS } from "./config.mjs";

const squash = (s) => (s ?? "").replace(/\s+/g, " ").trim();
const tight = (s) => (s ?? "").replace(/\s+/g, "");

function doc(html) {
  const root = parseHtml(html);
  root.querySelectorAll("script,style").forEach((e) => e.remove());
  return root;
}

/* 「所在地」「受付時間」のようなラベル行を表から拾う。 */
function labelled(root, label) {
  for (const tr of root.querySelectorAll("table tr")) {
    const cells = tr.querySelectorAll("th,td");
    if (cells.length < 2) continue;
    if (tight(cells[0].text) === label) return squash(cells[1].text);
  }
  return "";
}

/* 見出し(h2/h3)の直後の本文。 */
function afterHeading(root, heading) {
  const all = root.querySelectorAll("h2,h3,p,li");
  const i = all.findIndex((e) => /^H[23]$/.test(e.tagName) && tight(e.text) === heading);
  if (i < 0) return "";
  for (const e of all.slice(i + 1)) {
    if (/^H[23]$/.test(e.tagName)) return "";
    const s = squash(e.text);
    if (s) return s;
  }
  return "";
}

/* 都道府県ページの一覧。名称とリンクだけがある。 */
export function parsePrefIndex(html) {
  const root = doc(html);
  const out = [];
  for (const tr of root.querySelectorAll("table tr")) {
    const a = tr.querySelector("a");
    if (!a) continue;
    const href = a.getAttribute("href") ?? "";
    if (!/\/section\/soudan\/[a-z]+\/[a-z0-9_-]+\.html$/.test(href)) continue;
    const name = tight(tr.querySelectorAll("th,td")[0]?.text ?? a.text);
    if (!name) continue;
    const machikado = name.includes("街角の年金相談センター");
    out.push({
      name,
      href,
      kind: machikado ? "machikado" : "nenkin",
      sub: machikado ? (name.includes("（オフィス）") ? "office" : "center") : undefined,
    });
  }
  return out;
}

/* 「足立（あだち）年金事務所」→「足立」。管轄表との突合キー。 */
export function shortName(name) {
  return tight(name)
    .replace(/^街角の年金相談センター/, "")
    .replace(/（[^）]*）/g, "")
    .replace(/年金事務所$/, "")
    .trim();
}

const ZIP_RE = /〒?\s*(\d{3}-\d{4})/;

/* 事務所・街角の詳細ページ。 */
export function parseOffice(html, { kind }) {
  const root = doc(html);
  const name = tight(root.querySelector("h1")?.text ?? "");
  const shozai = labelled(root, "所在地");
  const zip = ZIP_RE.exec(shozai)?.[1] ?? "";
  const addr = squash(shozai.replace(ZIP_RE, "").trim());

  /* 事務所固有の電話。共通番号(0570-*)を除いた tel: リンクが1本残る。
     表記はページ内のハイフン付きの文字列を優先し、無ければ tel: の数字から作らない(空にする)。 */
  const telDigits = [...new Set(root.querySelectorAll('a[href^="tel:"]')
    .map((a) => (a.getAttribute("href") ?? "").replace("tel:", "").replace(/\D/g, "")))]
    .filter((d) => d && !COMMON_TEL_DIGITS.has(d));
  const hyphenated = new Map();
  const text = root.text + root.querySelectorAll("img").map((i) => i.getAttribute("alt") ?? "").join(" ");
  for (const m of text.matchAll(/0\d{1,4}-\d{1,4}-\d{4}/g)) hyphenated.set(m[0].replaceAll("-", ""), m[0]);
  const fax = (() => {
    for (const tr of root.querySelectorAll("table tr")) {
      const cells = tr.querySelectorAll("th,td").map((c) => squash(c.text));
      if (cells.some((c) => c.includes("FAX"))) {
        const m = cells.join(" ").match(/0\d{1,4}-\d{1,4}-\d{4}/);
        if (m) return m[0];
      }
    }
    return "";
  })();
  const faxDigits = fax.replaceAll("-", "");
  const own = telDigits.filter((d) => d !== faxDigits);
  const tel = own.length === 1 ? (hyphenated.get(own[0]) ?? "") : "";

  /* 自動音声案内かどうか。事務所ページは alt に書かれている。 */
  const telNote = /自動音声/.test(text) && kind === "nenkin" ? "自動音声案内"
    : kind === "machikado" && /職員にご用の方/.test(tight(root.text)) ? "職員へのご用" : "";

  const hours = {
    weekday: "", weekStartExt: "", secondSat: "",
    closed: labelled(root, "休業日"),
  };
  const uketsuke = labelled(root, "受付時間");
  for (const part of uketsuke.split(/\s+(?=[月週第])/)) {
    if (/^月曜から金曜/.test(part)) hours.weekday = part;
    else if (/^週初/.test(part)) hours.weekStartExt = part;
    else if (/^第\d土曜/.test(part)) hours.secondSat = part;
    else if (part && !hours.weekday) hours.weekday = part;
  }

  return {
    name,
    nameShort: shortName(name),
    zip,
    addr,
    tel,
    telNote,
    fax,
    hours,
    access: afterHeading(root, "交通機関"),
    parking: afterHeading(root, "駐車場"),
    telCandidates: own,          // 1本に絞れなかったときの確認用
    rawUketsuke: uketsuke,
  };
}

/* 管轄区域ページ。列は 事務所名 / 健康保険・厚生年金保険 / 国民年金 /(まれに)船員保険。 */
export function parseKankatsu(html) {
  const root = doc(html);
  const rows = [];
  const notes = [];
  for (const tr of root.querySelectorAll("table tr")) {
    const cells = tr.querySelectorAll("th,td").map((c) => squash(c.text));
    if (cells.length < 3) continue;
    const head = tight(cells[0]);
    if (!head || head === "年金事務所" || head === "健康保険・厚生年金保険") continue;
    rows.push({ office: head, kousei: cells[1] ?? "", kokumin: cells[2] ?? "", senin: cells[3] ?? "" });
  }
  /* 「※1 横浜市緑区」のような脚注。政令市の区の特定に使う。 */
  /* 「※1 横浜市緑区」「※2 横浜市南区」。管轄セル内の「南区※2 磯子区」を脚注と読まないよう、
     市名から始まる表記だけを採る。 */
  for (const m of root.text.matchAll(/※\s*(\d+)\s*([^\s※、。]*?[市][^\s※、。]*?区)/g)) {
    const value = tight(m[2]);
    if (!notes.some((n) => n.mark === m[1] && n.value === value)) notes.push({ mark: m[1], value });
  }
  return { rows, notes };
}

/* 管轄セルを個々の語に割る。機構の表記は次の形が混ざる:
     「新宿区 杉並区 中野区」            … 空白区切りの列挙
     「石狩郡」                          … 郡まるごと
     「虻田郡のうち豊浦町及び洞爺湖町」  … 郡の一部を町村名で列挙(確定できる)
     「水戸市のうち赤尾関町、秋成町、…」… 市の一部を大字で列挙(市区町村より細かい)
     「北区（岡山東年金事務所管内の地域を除く。）」… 市区の一部(相方の裏返し)
     「大島支庁管内、三宅支庁管内」      … 支庁単位
     「南区※2」                          … 政令市の区を脚注で特定
   ここでは**書かれているとおりに**種別を付けて返す。推測はしない。 */
export function splitJurisdiction(cell) {
  const text = squash(cell);
  if (!text || /^[-―－]$/.test(text)) return [];
  /* セル全体が「※◯◯年金事務所が管轄する区域の…」という注記のことがある(長野北)。
     管轄する市区町村は書かれていないので空で返す。「南区※2」のような脚注参照とは別。 */
  if (text.startsWith("※")) return [];
  const out = [];

  /* 「◯◯のうち…」「◯◯（…を除く。）」を先に切り出す。括弧の中に読点があるので、
     素朴に読点で割ると壊れる。 */
  const rest = [];
  let buf = text;

  /* 1) 「A市のうち<大字の列>」。A が市区町村なら「一部」として1件にする。 */
  const uchi = /([^\s、。（(）)]+?[市区町村郡])\s*のうち/g;
  let m; const partials = [];
  while ((m = uchi.exec(buf)) !== null) partials.push(m[1]);
  if (partials.length) {
    /* 「郡のうち町村」だけは町村名を確定できるので拾う */
    for (const g of buf.matchAll(/([^\s、。（(）)]+?郡)\s*のうち([^（(]*?)(?=(?:[^\s、。（(）)]+?[市区町村郡]\s*のうち)|$)/g)) {
      for (const name of g[2].split(/(?:、|,|及び|並びに|\s)+/).map((s) => s.trim()).filter(Boolean)) {
        if (/[町村]$/.test(name)) out.push({ value: name, type: "name" });
      }
    }
    for (const p of partials) {
      if (/郡$/.test(p)) continue;
      out.push({ value: p, type: "partial", note: "市区町村より細かい単位で分けられている(「のうち」)" });
    }
    /* 「のうち」の内訳を落とす。郡は「上北郡のうち六戸町及びおいらせ町 三戸郡」のように
       空白の手前で終わり、後ろに別の管轄が続く。市区町村は大字の列がセルの最後まで続く。 */
    buf = buf.replace(/([^\s、。（(）)]+?郡)\s*のうち[^\s（(]*/g, " ");
    buf = buf.replace(/([^\s、。（(）)]+?[市区町村])\s*のうち[\s\S]*$/g, " ");
  }

  /* 2) 「A（…を除く。）」→ A の一部 */
  for (const g of buf.matchAll(/([^\s、。（(）)]+?[市区町村郡])\s*[（(][^）)]*除く[^）)]*[）)]/g)) {
    out.push({ value: g[1], type: "partial", note: "ほかの年金事務所の管内を除いた残り(「除く」)" });
  }
  buf = buf.replace(/([^\s、。（(）)]+?[市区町村郡])\s*[（(][^）)]*除く[^）)]*[）)]/g, " ");

  /* 3) 残りの括弧(範囲の但し書きなど)は落とす */
  buf = buf.replace(/[（(][^）)]*[）)]/g, " ");

  /* 4) 残りを列挙として割る */
  for (const raw of buf.split(/(?:、|,|／|\/|及び|並びに|\s)+/)) {
    const s = raw.trim();
    if (!s || /^[-―－]$/.test(s)) continue;
    if (s.startsWith("※")) continue;   /* 「※◯◯年金事務所が管轄する区域の…」は注記 */
    if (/支庁管内$|振興局管内$/.test(s)) { out.push({ value: s, type: "area" }); continue; }
    if (/郡$/.test(s)) { out.push({ value: s, type: "gun" }); continue; }
    if (/[市区町村]$|[市区町村]※\d+$/.test(s)) { out.push({ value: s, type: "name" }); continue; }
    out.push({ value: s, type: "unknown" });
  }
  return rest.concat(out);
}
