// docs/claude-code-seo-2026-09-13-instructions.md 作業2 の確認。
// node --import ./scripts/lib/ts-alias.mjs docs/verification/seo-2026-09-13/check.mjs http://localhost:3200
// h1 と本文(<main> の文字)は、本番(変更前)と同じであることを見る。
import { mkdirSync, writeFileSync } from "node:fs";
import { parse } from "node-html-parser";
const origin = process.argv[2] ?? "http://localhost:3200";
const production = "https://shougainenkin-note.net";
const SITE = "｜障害年金申請サポート";
const out = []; const say = (s) => { out.push(s); console.log(s); };

const pages = [
  {
    path: "/",
    title: "障害年金申請サポート｜社労士に頼まず自分で申請する人の、初診日・診断書・申立書の進め方",
    description: "障害年金を自分で申請する人のための無料サイト。初診日の探し方、診断書で見られる7項目、申立書をスマホで作って印刷する機能、不支給85件の公開裁決例まで、公的資料の根拠つきで案内します。",
  },
  {
    path: "/gokai/shufu-mushoku",
    title: `専業主婦(主夫)・無職でも障害年金は請求できる｜第3号被保険者の期間は「納付済み」扱い${SITE}`,
    description: "働いていなくても、収入がなくても、障害基礎年金は請求できます。会社員の配偶者に扶養されていた第3号被保険者の期間は、自分で保険料を払っていなくても納付済期間です。あきらめる前に、年金事務所かねんきんネットで納付記録を確認してください。",
    headline: "Article",
  },
  {
    path: "/columns/jukyuugo-tetsuduki",
    title: `障害年金が決まったら｜年金証書が届いた後にやる手続き（給付金・法定免除・扶養・手帳）${SITE}`,
    description: null, // 変えない
    headline: "Article",
  },
  {
    path: "/dougu/moushitatesho",
    title: `病歴・就労状況等申立書をスマホで入力して、公式様式のまま印刷する【無料・送信なし】${SITE}`,
    description: "日本年金機構の様式(A3・続紙A4)に、パソコンの文字で書いた紙がそのまま出ます。手書きで清書し直す必要はありません。元号は○、年月日は数字、未記入欄は空欄のまま。入力内容はこの端末にだけ残り、送信しません。",
  },
  {
    path: "/columns/koushin-kakuninhodo",
    title: `障害年金の更新は何年ごと？障害状態確認届の期限と、止まる人は1.1%という数字${SITE}`,
    description: "障害年金の更新（障害状態確認届）は1〜5年ごと。提出期限、就労中の注意点、支給停止や級落ちへの備えを解説します。令和6年度の再認定304,456件のうち96.7%はそのまま継続、支給停止は1.1%（日本年金機構「障害年金業務統計」）。",
    headline: "Article",
  },
];

const load = async (base, path) => parse((await (await fetch(`${base}${path}`)).text()).replaceAll("<!-- -->", ""));
const meta = (root, selector) => root.querySelector(selector)?.getAttribute("content") ?? "";
// <main> の中に JSON-LD(description を含む)があるので、本文の比較からは script を除く。
// 元の DOM から消すと後の headline の確認で JSON-LD が読めなくなるので、コピーから消す。
const mainText = (root) => {
  const main = parse(root.querySelector("main")?.toString() ?? "");
  main.querySelectorAll("script").forEach((script) => script.remove());
  return main.textContent.replace(/\s/g, "");
};
const graph = (root) => root.querySelectorAll('script[type="application/ld+json"]').map((s) => JSON.parse(s.textContent)).flatMap((j) => [j].flat()).flatMap((j) => j["@graph"] ?? [j]);

let ok = true;
const check = (label, condition, detail = "") => { ok &&= condition; say(`${condition ? "○" : "×"} ${label}${detail ? ` ${detail}` : ""}`); };

for (const page of pages) {
  const [local, prod] = await Promise.all([load(origin, page.path), load(production, page.path)]);
  const title = local.querySelector("title")?.textContent ?? "";
  say(`\n## ${page.path}`);
  say(`title(${[...title].length}字): ${title}`);
  check("title が指示どおり", title === page.title);
  check("og:title / twitter:title も同じ", meta(local, 'meta[property="og:title"]') === page.title && meta(local, 'meta[name="twitter:title"]') === page.title);
  const description = meta(local, 'meta[name="description"]');
  say(`description(${[...description].length}字): ${description}`);
  if (page.description) {
    check("description が指示どおり", description === page.description);
    check("og:description / twitter:description も同じ", meta(local, 'meta[property="og:description"]') === page.description && meta(local, 'meta[name="twitter:description"]') === page.description);
    check("JSON-LD の description も同じ", graph(local).some((node) => node.description === page.description));
  } else {
    check("description は本番と同じ(変えない)", description === meta(prod, 'meta[name="description"]'));
  }
  const h1 = local.querySelectorAll("h1").map((h) => h.textContent.trim());
  const prodH1 = prod.querySelectorAll("h1").map((h) => h.textContent.trim());
  check("h1 は本番と同じ", JSON.stringify(h1) === JSON.stringify(prodH1), `「${h1.join(" / ").replace(/\s+/g, "")}」`);
  const [localMain, prodMain] = [mainText(local), mainText(prod)];
  check("<main> の本文(script を除く)は本番と同じ", localMain === prodMain, `(${localMain.length}字)`);
  if (page.headline) {
    const article = graph(local).find((n) => n["@type"] === page.headline);
    check("Article の headline は h1 のまま", article?.headline === h1[0]);
  }
}

// OG 画像: 記事の OG は column.title(h1)を描くので、metaTitle を変えても画像は変わらない
{
  const path = "/columns/koushin-kakuninhodo/opengraph-image";
  const [local, prod] = await Promise.all([fetch(`${origin}${path}`), fetch(`${production}${path}`)]);
  const [a, b] = await Promise.all([local.arrayBuffer(), prod.arrayBuffer()]);
  say(`\n## ${path}`);
  check("OG 画像は本番と同じバイト列", local.status === 200 && Buffer.from(a).equals(Buffer.from(b)), `(${local.headers.get("content-type")}, ${a.byteLength} bytes / 本番 ${b.byteLength} bytes)`);
}

// 誤解カード49枚の生成HTML: h1=title、<title>/og/twitter=metaTitle ?? title、headline=title
// verifyBuiltBodies は最初の失敗で止まるので、1枚ずつ verifyBodyHtml を呼ぶ。
{
  const { readFile } = await import("node:fs/promises");
  const { GOKAI_BODIES } = await import("../../../data/gokai-bodies.ts");
  const { verifyBodyHtml } = await import("../../../scripts/verify-gokai-bodies.mjs");
  // hataraitara-make は FAQ の無いカードとして e5c5feb で足され、この作業の前から「FAQPageは1つ」で落ちる
  const KNOWN = { "hataraitara-make": "FAQPageは1つ" };
  const slugs = Object.keys(GOKAI_BODIES);
  const failed = [];
  for (const slug of slugs) {
    try {
      verifyBodyHtml(await readFile(new URL(`../../../.next/server/app/gokai/${slug}.html`, import.meta.url), "utf8"), slug);
    } catch (error) {
      failed.push({ slug, message: String(error.message).split("\n")[0] });
    }
  }
  const unexpected = failed.filter(({ slug, message }) => !(KNOWN[slug] && message.includes(KNOWN[slug])));
  say(`\n## verifyBodyHtml(.next の gokai ${slugs.length}枚)`);
  check(`${slugs.length - failed.length}/${slugs.length} 枚が通る。新しい失敗なし`, unexpected.length === 0, failed.map(({ slug, message }) => `${KNOWN[slug] ? "(作業前から)" : ""}${message}`).join(" / "));
  check("shufu-mushoku が通る(metaTitle あり)", !failed.some(({ slug }) => slug === "shufu-mushoku"));
}

mkdirSync("docs/verification/seo-2026-09-13", { recursive: true });
writeFileSync("docs/verification/seo-2026-09-13/checks.txt", out.join("\n").trimStart() + "\n");
if (!ok) process.exitCode = 1;
