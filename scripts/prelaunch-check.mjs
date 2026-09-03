// 公開前チェックリスト(docs/prelaunch-checklist-2026-09-02.md)の A〜C を機械検査し、
// D の確認用一覧(URL・タイトル・文字数)を書き出す。
//
//   npm run prelaunch:check -- http://localhost:3000 [出力ファイル名]
//   (省略時は VERIFY_ORIGIN、なければ http://localhost:3000)
//
// A に×が1つでもあれば exit 1。B/C の×は報告のみ。
// 「公開前」の基準は git の main ブランチ(本番に出ている内容)から取る。
//
// 判定基準の変更履歴
// 2026-09-02 (docs/codex-prelaunch-fix-2026-09-02-instructions.md):
//   A-8: 「直書き0」ではなく、出力HTMLの10万円以上の金額が data/amounts.ts の値から導出できるか
//        (値そのもの / 年額2〜4個の和 / ×1.25 / ÷12・÷12×2(±100円) / 本文に明示した前年度額 / 「超」の+1)で判定する。
//        直書きのファイル数は参考として付記に出すだけ。検算式は scripts/lib/amounts-derive.mjs。
//   B-1: 法務・案内ページ(about/privacy/terms/quality/support)はフッターからのリンクが正常な設計なので孤立の検査から外す。
//   B-2: パンくず(nav[aria-label="パンくずリスト"])と誤解カードの「一覧へ戻る」(.gokai-back)由来のリンクは被リンク数に数えない。
//   B-9: BreadcrumbList が2つ以上あるページも数える(コラム記事は columnJsonLd の分だけ)。
//   C-2: 分割sitemapは対象外(Google の分割要件は 50,000 URL / 50MB。現状は単一 sitemap.xml で十分)。
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { explainAmount, findAmounts, paragraphAround } from "./lib/amounts-derive.mjs";

const toNumber = (text) => Number(String(text).replace(/[,円]/g, ""));

const origin = (process.argv[2] ?? process.env.VERIFY_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");
const root = process.cwd();
const outDir = path.join(root, "docs/verification/prelaunch-2026-09-02");
mkdirSync(outDir, { recursive: true });

const { SITE_URL } = await import("../lib/constants.ts");
const { HUBS } = await import("../lib/hubs.ts");
const { AMOUNTS_2026 } = await import("../data/amounts.ts");
const { SITEMAP_EXCLUDED } = await import("../lib/sitemap-excluded.ts");

const results = [];
const record = (id, label, ok, count, detail = [], note = "") => results.push({ id, label, ok, count, detail, note });

// ---------- 取得 ----------
const fetchText = async (p) => {
  const response = await fetch(origin + p, { redirect: "manual" });
  return { status: response.status, text: response.status === 200 ? await response.text() : "", location: response.headers.get("location") };
};
const stripTags = (html) => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&[a-z#0-9]+;/g, " ");
const visible = (html) => stripTags(html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "");
const charCount = (html) => visible(html).replace(/\s+/g, "").length;
const normalizePath = (href) => {
  if (!href) return null;
  if (/^(https?:)?\/\//.test(href)) {
    if (!href.startsWith(SITE_URL)) return null;
    href = href.slice(SITE_URL.length) || "/";
  }
  if (!href.startsWith("/")) return null;
  return href.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
};

const sitemapXml = (await fetchText("/sitemap.xml")).text;
const sitemapPaths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => normalizePath(m[1]));
const pages = new Map();
for (const p of sitemapPaths) {
  const { status, text } = await fetchText(p);
  // 動的ページ(searchParams を使う一覧など)は <head> の外にメタ情報がストリーミングされるので、HTML全体から取る
  const head = text;
  const main = text.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "";
  const attr = (re) => head.match(re)?.[1] ?? "";
  pages.set(p, {
    status,
    html: text,
    title: (head.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ?? "").trim(),
    description: attr(/<meta name="description" content="([^"]*)"/),
    canonical: attr(/<link rel="canonical" href="([^"]*)"/),
    robots: attr(/<meta name="robots" content="([^"]*)"/),
    ogImage: attr(/<meta property="og:image" content="([^"]*)"/),
    h1: (text.match(/<h1[\s>]/g) ?? []).length,
    jsonLd: [...text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch { return { "@type": "PARSE_ERROR" }; } }),
    chars: charCount(text),
    visible: visible(text),
    mainLinks: [...new Set([...main.matchAll(/href="([^"]+)"/g)].map((m) => normalizePath(m[1])).filter(Boolean))],
    // 被リンク数の集計用: パンくず(nav[aria-label="パンくずリスト"])と誤解カードの「一覧へ戻る」(.gokai-back)は数えない(2026-09-02)
    countedLinks: [...new Set([...main.replace(/<nav[^>]*aria-label="パンくずリスト"[\s\S]*?<\/nav>/g, " ").replace(/<a[^>]*class="gokai-back"[^>]*>[\s\S]*?<\/a>/g, " ").matchAll(/href="([^"]+)"/g)].map((m) => normalizePath(m[1])).filter(Boolean))],
    allLinks: [...new Set([...text.matchAll(/href="([^"]+)"/g)].map((m) => normalizePath(m[1])).filter(Boolean))],
    hasDate: /<time dateTime=|最終更新日|更新日|確認日/.test(stripTags(main)),
  });
}
const sitemapSet = new Set(pages.keys());
const isHtmlPath = (p) => !/\.(xml|txt|png|jpg|ico|webp)$/.test(p) && !p.startsWith("/_next") && !p.startsWith("/opengraph-image") && !/\/opengraph-image$/.test(p);

// ---------- A. 致命的 ----------
// A-1 / A-2 / C-5: main ブランチ(公開前)の記事一覧・本文長と突き合わせ
const gitShow = (file) => { try { return execFileSync("git", ["show", `main:${file}`], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch { return null; } };
const baselineSlugs = [...new Set([...(gitShow("lib/columns.ts") ?? "").matchAll(/^    slug: "([^"]+)",/gm)].map((m) => m[1]))];
const extractContent = (src) => { const m = src?.match(/const (content|rawContent) = (`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*");/); if (!m) return null; try { return eval(m[2]); } catch { return null; } };
{
  const missing = [];
  for (const slug of baselineSlugs) {
    const p = `/columns/${slug}`;
    const status = pages.get(p)?.status ?? (await fetchText(p)).status;
    if (status !== 200) missing.push(`${p} (${status})`);
  }
  record("A-1", "既存記事のURLが1本も変わっていない", missing.length === 0, `${baselineSlugs.length - missing.length}/${baselineSlugs.length} が同一URLで200`, missing);

  const shrunk = [];
  const lost = [];
  let compared = 0;
  for (const slug of baselineSlugs) {
    const before = extractContent(gitShow(`content/columns/${slug}.ts`));
    if (before === null) continue;
    let after = null;
    try { after = extractContent(readFileSync(path.join(root, `content/columns/${slug}.ts`), "utf8")); } catch { /* 消えている */ }
    compared += 1;
    if (after === null || after.length < before.length * 0.8) lost.push(`/columns/${slug} (${before.length} → ${after?.length ?? "本文なし"}字)`);
    else if (after.length < before.length) shrunk.push(`/columns/${slug} (${before.length} → ${after.length}字, ${Math.round((after.length / before.length) * 100)}%)`);
  }
  globalThis.__shrunk = shrunk;
  record("A-2", "既存記事の本文が消えていない(公開前の8割未満・本文なしを×)", lost.length === 0, `本文が消えた/8割未満 ${lost.length}、方針上の削除で減ったもの ${shrunk.length}(いずれも8割以上を維持)、${compared} 記事を比較`, lost.length ? lost : [], "main ブランチの本文文字列と比較。減少分は docs/verification/prelaunch-2026-09-02/RESULT.md 末尾に一覧");
}

// A-3 内部リンク破損 / A-4 未公開(予約)slugへのリンク
const reservedPaths = HUBS.filter((hub) => !hub.published).map((hub) => hub.path);
{
  const targets = new Map(); // path -> from
  for (const [from, page] of pages) for (const to of page.allLinks) if (isHtmlPath(to) && !targets.has(to)) targets.set(to, from);
  const broken = [];
  const statusCache = new Map();
  for (const [to, from] of targets) {
    let status = pages.get(to)?.status;
    if (status === undefined) { if (!statusCache.has(to)) statusCache.set(to, (await fetchText(to)).status); status = statusCache.get(to); }
    if (status !== 200) broken.push(`${to} (${status}) ← ${from}`);
  }
  record("A-3", "404が出るリンクがゼロ", broken.length === 0, `リンク先 ${targets.size} 件を検査、破損 ${broken.length}`, broken);
  const reservedLinks = [];
  for (const [from, page] of pages) for (const to of page.allLinks) if (reservedPaths.includes(to)) reservedLinks.push(`${to} ← ${from}`);
  record("A-4", "未公開ページへのリンクがゼロ", reservedLinks.length === 0, `予約slug ${reservedPaths.length} 件へのリンク ${reservedLinks.length}`, reservedLinks);
}
// A-5 noindex / A-6 canonical
{
  const noindex = [...pages].filter(([, page]) => /noindex/i.test(page.robots)).map(([p]) => p);
  record("A-5", "noindex が残っていない", noindex.length === 0, `noindex ${noindex.length} / ${pages.size}`, noindex);
  const bad = [...pages].filter(([p, page]) => !(page.canonical === `${SITE_URL}${p === "/" ? "" : p}` || page.canonical === `${SITE_URL}${p === "/" ? "/" : p}`)).map(([p, page]) => `${p} → canonical=${page.canonical || "(なし)"}`);
  record("A-6", "canonical が自分自身を指している", bad.length === 0, `自己参照 ${pages.size - bad.length} / ${pages.size}`, bad);
}
// A-7 robots.txt
{
  const robots = (await fetchText("/robots.txt")).text;
  const disallows = [...robots.matchAll(/^Disallow:\s*(\S+)/gm)].map((m) => m[1]);
  const blocked = [...sitemapSet].filter((p) => disallows.some((d) => d !== "" && p.startsWith(d)));
  record("A-7", "robots.txt が全ページを許可している", blocked.length === 0 && /Allow:\s*\//.test(robots), `Disallow ${disallows.length} 件、公開対象の該当 ${blocked.length}`, blocked, robots.trim().replace(/\n/g, " / "));
}
// A-8 金額: 出力HTMLの金額が data/amounts.ts から導出できるか(2026-09-02 に判定基準を変更)
{
  const amounts = Object.values(AMOUNTS_2026).filter((v) => v.includes(","));
  const re = new RegExp(amounts.join("|"), "g");
  const hardcoded = [];
  const walk = (dir) => { for (const name of readdirSync(dir)) { const full = path.join(dir, name); if (statSync(full).isDirectory()) walk(full); else if (/\.(tsx?|json|mjs)$/.test(name) && !full.endsWith("data/amounts.ts")) { const src = readFileSync(full, "utf8"); const n = (src.match(re) ?? []).length; if (n) hardcoded.push(`${path.relative(root, full)} (${n})`); } } };
  for (const dir of ["app", "components", "content", "lib", "data"]) walk(path.join(root, dir));
  const explained = new Map();
  const unexplained = [];
  for (const [p, page] of pages) {
    for (const found of findAmounts(page.visible, 100000)) {
      const expr = explainAmount(found.text, AMOUNTS_2026, paragraphAround(page.visible, found.index));
      if (expr) explained.set(found.text, expr);
      else unexplained.push(`未説明額: ${p}: ${found.text}`);
    }
  }
  const explainedList = [...explained].sort((a, b) => toNumber(a[0]) - toNumber(b[0])).map(([text, expr]) => `説明済み: ${text} = ${expr}`);
  record("A-8", "金額が全ページで一致している(data/amounts.ts から導出できる)", unexplained.length === 0, `10万円以上の金額 ${explained.size + new Set(unexplained).size} 種のうち説明済み ${explained.size}、未説明 ${new Set(unexplained).size}(参考: 直書きのあるファイル ${hardcoded.length})`, [...new Set(unexplained)], "説明済みの式は末尾の付記に全件");
  globalThis.__a8Explained = explainedList;
  globalThis.__a8Hardcoded = hardcoded;
}
// A-9 / A-10 執筆メモ・調査元
{
  const memo = [], at = [], sources = [];
  for (const [p, page] of pages) {
    const text = page.visible;
    if (/執筆メモ|実装メモ/.test(text)) memo.push(`${p}: 執筆メモ`);
    if (/x\.com/.test(text)) memo.push(`${p}: x.com`);
    for (const m of text.matchAll(/@[A-Za-z0-9_.]{4,}/g)) at.push(`${p}: ${m[0]}`);
    for (const m of text.matchAll(/twitter|youtube|youtu\.be|note\.com|ameblo|呟き人|岸野|nenkin109|coco_ruuchan|ツイート|Xで(発信|見かける|語られる|投稿|最も|本当に)|X上で/g)) sources.push(`${p}: ${m[0]}`);
  }
  const atNonMail = at.filter((a) => !/@gmail\.com/.test(a));
  record("A-9", "「執筆メモ」「x.com」「@」が出力に含まれていない", memo.length === 0 && atNonMail.length === 0, `執筆メモ/x.com ${memo.length}、@ ${atNonMail.length}(連絡先メールの @ ${at.length - atNonMail.length} 件は除外)`, [...memo, ...atNonMail]);
  record("A-10", "調査元(X/YouTube/note等)への言及がゼロ", sources.length === 0, `ドメイン名・アカウント名・X固有語 ${sources.length}`, [...new Set(sources)]);
}

// ---------- B. 重要 ----------
{
  const inbound = new Map([...sitemapSet].map((p) => [p, new Set()]));
  for (const [from, page] of pages) for (const to of page.mainLinks) if (to !== from && inbound.has(to)) inbound.get(to).add(from);
  const inboundCounted = new Map([...sitemapSet].map((p) => [p, new Set()]));
  for (const [from, page] of pages) for (const to of page.countedLinks) if (to !== from && inboundCounted.has(to)) inboundCounted.get(to).add(from);
  // 法務・案内ページはフッターからのリンクが正常な設計なので、孤立の検査から外す(2026-09-02)
  const UTILITY_PAGES = ["/about", "/privacy", "/terms", "/quality", "/support"];
  const isolated = [...inbound].filter(([p, set]) => set.size === 0 && p !== "/" && !UTILITY_PAGES.includes(p)).map(([p]) => p);
  record("B-1", "孤立ページがゼロ(本文からの内部リンクが最低1本)", isolated.length === 0, `孤立 ${isolated.length} / ${pages.size}(除外 ${UTILITY_PAGES.filter((p) => sitemapSet.has(p)).length})`, isolated, "ヘッダー・フッターのリンクは数えない。法務・案内ページ(about/privacy/terms/quality/support)はフッターのみで可");
  const over = [...inboundCounted].filter(([, set]) => set.size > 50).map(([p, set]) => `${p} (${set.size}本)`);
  record("B-2", "被内部リンクが50本を超えるページがゼロ", over.length === 0, `50本超 ${over.length}`, over, "パンくずと誤解カードの「一覧へ戻る」由来のリンクは数えない");
  const thin = [...pages].filter(([, page]) => page.chars < 500).sort((a, b) => a[1].chars - b[1].chars).map(([p, page]) => `${p} (${page.chars}字)`);
  const jitsurei = [...pages].filter(([p]) => /^\/jitsurei\/./.test(p));
  const gokaiThin = thin.filter((t) => t.startsWith("/gokai/"));
  record("B-3", "500字未満のページの一覧", thin.length === 0, `500字未満 ${thin.length}(うち誤解カード ${gokaiThin.length})。実例の個別ページ ${jitsurei.length} 件`, thin, jitsurei.length === 0 ? "実例94件の個別ページはサイトマップに無い(未実装)" : "");
  const h1Bad = [...pages].filter(([, page]) => page.h1 !== 1).map(([p, page]) => `${p} (h1 ${page.h1})`);
  record("B-4", "h1が1ページに1つだけ", h1Bad.length === 0, `複数/なし ${h1Bad.length}`, h1Bad);
  const metaBad = [...pages].filter(([, page]) => !page.title || !page.description).map(([p, page]) => `${p} (title=${page.title ? "○" : "×"}, description=${page.description ? "○" : "×"})`);
  const descDup = Object.entries([...pages].reduce((acc, [p, page]) => ((acc[page.description] ??= []).push(p), acc), {})).filter(([d, list]) => d && list.length > 1).map(([, list]) => list.join(", "));
  record("B-5", "titleとmeta descriptionが全ページにある", metaBad.length === 0 && descDup.length === 0, `空 ${metaBad.length}、description重複 ${descDup.length}組`, [...metaBad, ...descDup.map((d) => `description重複: ${d}`)]);
  const titleDup = Object.entries([...pages].reduce((acc, [p, page]) => ((acc[page.title] ??= []).push(p), acc), {})).filter(([, list]) => list.length > 1).map(([t, list]) => `「${t}」: ${list.join(", ")}`);
  record("B-6", "titleの重複がない", titleDup.length === 0, `重複 ${titleDup.length}組`, titleDup);
  const noOg = [...pages].filter(([, page]) => !page.ogImage).map(([p]) => p);
  const gokaiOwnOg = [...pages].filter(([p, page]) => p.startsWith("/gokai/") && page.ogImage.includes(`${p}/opengraph-image`)).length;
  record("B-7", "OGP画像が全ページにある", noOg.length === 0, `og:image なし ${noOg.length}。誤解カードの自動生成画像 ${gokaiOwnOg}/48`, noOg);
  const ldErrors = [];
  const typeCount = {};
  const checkLd = (p, item) => {
    const t = item["@type"]; typeCount[t] = (typeCount[t] ?? 0) + 1;
    const bad = (msg) => ldErrors.push(`${p}: ${t} — ${msg}`);
    if (t === "PARSE_ERROR") bad("JSONとして読めない");
    if (t === "FAQPage" && !(Array.isArray(item.mainEntity) && item.mainEntity.length && item.mainEntity.every((q) => q["@type"] === "Question" && q.name && q.acceptedAnswer?.text))) bad("Question/acceptedAnswer.text が不足");
    if (t === "HowTo" && !(item.name && Array.isArray(item.step) && item.step.length && item.step.every((s) => s["@type"] === "HowToStep" && s.text))) bad("name/step[].text が不足");
    if (t === "DefinedTermSet" && !(item.name && Array.isArray(item.hasDefinedTerm) && item.hasDefinedTerm.every((d) => d["@type"] === "DefinedTerm" && d.name && d.description))) bad("hasDefinedTerm[].name/description が不足");
    if (t === "ItemList" && !(Array.isArray(item.itemListElement) && item.itemListElement.every((li) => li["@type"] === "ListItem" && li.position && li.name))) bad("itemListElement[].position/name が不足");
    if (t === "BreadcrumbList" && !(Array.isArray(item.itemListElement) && item.itemListElement.every((li) => li["@type"] === "ListItem" && li.position && li.name && li.item))) bad("itemListElement[].item が不足");
    if (Array.isArray(item["@graph"])) for (const g of item["@graph"]) checkLd(p, g);
  };
  for (const [p, page] of pages) for (const item of page.jsonLd) checkLd(p, item);
  record("B-8", "構造化データが妥当", ldErrors.length === 0, `型別件数 ${Object.entries(typeCount).map(([t, n]) => `${t}:${n}`).join(" ")}、エラー ${ldErrors.length}`, ldErrors, "スキーマ必須項目の静的検査。Google のリッチリザルトテストは公開URLで別途実施");
  const hasBreadcrumb = (page) => page.jsonLd.some((item) => item["@type"] === "BreadcrumbList" || item["@graph"]?.some((g) => g["@type"] === "BreadcrumbList")) || /class="p-breadcrumb"|aria-label="パンくず/.test(page.html);
  const noCrumbLd = [...pages].filter(([p, page]) => p !== "/" && !page.jsonLd.some((item) => item["@type"] === "BreadcrumbList" || item["@graph"]?.some((g) => g["@type"] === "BreadcrumbList"))).map(([p]) => p);
  const noCrumb = [...pages].filter(([p, page]) => p !== "/" && !hasBreadcrumb(page)).map(([p]) => p);
  const countCrumbLd = (page) => page.jsonLd.reduce((n, item) => n + (item["@type"] === "BreadcrumbList" ? 1 : 0) + (item["@graph"]?.filter((g) => g["@type"] === "BreadcrumbList").length ?? 0), 0);
  const dupCrumbLd = [...pages].filter(([, page]) => countCrumbLd(page) >= 2).map(([p, page]) => `BreadcrumbListが${countCrumbLd(page)}つ: ${p}`);
  record("B-9", "パンくずが全ページにある(BreadcrumbList を含む・二重なし)", noCrumb.length === 0 && noCrumbLd.length === 0 && dupCrumbLd.length === 0, `表示なし ${noCrumb.length}、BreadcrumbList(構造化データ)なし ${noCrumbLd.length}、2つ以上 ${dupCrumbLd.length}`, [...noCrumb, ...noCrumbLd.map((p) => `BreadcrumbListなし: ${p}`), ...dupCrumbLd], "表示のパンくずはあるが構造化データが無いページと、二重に出ているページを別に数える");
  const noDate = [...pages].filter(([p, page]) => p !== "/" && !page.hasDate).map(([p]) => p);
  record("B-10", "更新日が全ページに表示されている", noDate.length === 0, `更新日/確認日の表示なし ${noDate.length}`, noDate);
}

// ---------- C. サイトマップ ----------
{
  const reachable = new Set();
  for (const page of pages.values()) for (const to of page.allLinks) if (isHtmlPath(to)) reachable.add(to);
  /* sitemap に意図的に入れないページ(lib/sitemap-excluded.ts)は「未収録」に数えない。
     入れ忘れと区別するための明示リストなので、リストに無いのに未収録なら従来どおり×。
     あわせて、リストにあるページが本当に noindex かも見る(除外と noindex のちぐはぐを防ぐ)。 */
  const excludedPaths = SITEMAP_EXCLUDED.map((e) => e.path);
  const notInSitemap = [...reachable].filter((p) => !sitemapSet.has(p) && !reservedPaths.includes(p) && !excludedPaths.includes(p) && !p.startsWith("/columns/") && !["/", "/nayami/fushikyu"].includes(p));
  const reservedInSitemap = [...sitemapSet].filter((p) => reservedPaths.includes(p));
  const excludedInSitemap = [...sitemapSet].filter((p) => excludedPaths.includes(p));
  const notNoindex = [];
  for (const e of SITEMAP_EXCLUDED) {
    const { status, text } = await fetchText(e.path);
    if (status !== 200) { notNoindex.push(`${e.path}: ${status}(ページが無い。リストから消すか、パスを直す)`); continue; }
    const robots = text.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? "";
    if (!/noindex/i.test(robots)) notNoindex.push(`${e.path}: sitemap から外しているのに noindex でない(robots=${robots || "なし"})`);
  }
  const stale = [];
  for (const p of sitemapSet) if (pages.get(p).status !== 200) stale.push(`${p} (${pages.get(p).status})`);
  record("C-1", "sitemap.xml: 全公開ページが入り、未公開ページが入っていない",
    notInSitemap.length === 0 && reservedInSitemap.length === 0 && stale.length === 0 && notNoindex.length === 0 && excludedInSitemap.length === 0,
    `収録 ${sitemapSet.size}、リンクはあるが未収録 ${notInSitemap.length}、予約slugの混入 ${reservedInSitemap.length}、200以外 ${stale.length}、意図的な除外 ${SITEMAP_EXCLUDED.length}(noindexでない ${notNoindex.length})`,
    [...notInSitemap.map((p) => `未収録: ${p}`), ...reservedInSitemap.map((p) => `予約slug: ${p}`), ...stale,
     ...excludedInSitemap.map((p) => `意図的な除外なのに sitemap に入っている: ${p}`), ...notNoindex,
    ],
    `意図的な除外は lib/sitemap-excluded.ts の明示リスト。リストに無いのに未収録なら×。リストにあるのに noindex でなくても×。<br>${SITEMAP_EXCLUDED.map((e) => `${e.path} — ${e.reason}${e.until ? `(${e.until})` : ""}`).join("<br>")}`);
  record("C-2", "sitemapの分割", null, `対象外(${sitemapSet.size}ページ・単一 sitemap.xml で十分。50,000 URL 超で再検討)`, [], "Google の分割要件は 50,000 URL または 50MB。2026-09-02 に対象外とした");
  record("C-3", "Search Console にサイトマップを送信", null, "手動作業(スクリプト対象外)", [], "sitemap.xml を送る");
  const key = ["/", "/nayami/fushikyu", "/nayami/shindansho-komatta", "/nayami/shoshinbi-karute", "/nayami/koushin", "/nayami/shikyuu-teishi", "/nayami/sokyuu", "/jitsurei", "/suuji", "/yougo"];
  const keyStatus = [];
  for (const p of key) keyStatus.push(`${p} (${pages.get(p)?.status ?? (await fetchText(p)).status})`);
  record("C-4", "主要10ページの URL検査(インデックス登録リクエスト)", keyStatus.every((s) => s.includes("(200)")) ? null : false, `10ページとも200: ${keyStatus.every((s) => s.includes("(200)")) ? "○" : "×"}(送信自体は手動)`, keyStatus);
  const oldStatic = [...(gitShow("app/sitemap.ts") ?? "").matchAll(/^    "([^"]+)",$/gm)].map((m) => m[1]);
  const oldUrls = [...new Set([...oldStatic, ...baselineSlugs.map((s) => `/columns/${s}`)])];
  const changed = [];
  const redirected = [];
  for (const p of oldUrls) {
    const response = pages.get(p) ?? await fetchText(p);
    if (p === "/dougu" && response.status === 301 && response.location === "/shinsei") redirected.push(`${p} → ${response.location} (${response.status})`);
    else if (response.status !== 200) changed.push(`${p} (${response.status}${response.location ? ` → ${response.location}` : ""})`);
  }
  if (!oldUrls.includes("/dougu")) {
    const response = await fetchText("/dougu");
    if (response.status === 301 && response.location === "/shinsei") redirected.push(`/dougu → ${response.location} (${response.status})`);
    else changed.push(`/dougu (${response.status}${response.location ? ` → ${response.location}` : ""})`);
  }
  record("C-5", "旧URLの維持または301リダイレクト", changed.length === 0 && redirected.length === 1, `公開前URL ${oldUrls.length} 件のうち /dougu → /shinsei 301: ${redirected.length === 1 ? "○" : "×"}、その他200以外 ${changed.length}`, [...redirected, ...changed], "main ブランチの sitemap 静的ページ + 記事URL");
}

// ---------- D. 人が見る用の一覧 ----------
{
  const rows = [...pages].map(([p, page]) => [p, page.title, page.chars]);
  writeFileSync(path.join(outDir, "pages.tsv"), "url\ttitle\tchars\n" + rows.map((r) => r.join("\t")).join("\n") + "\n");
}

// ---------- 出力 ----------
const mark = (ok) => (ok === null ? "手動" : ok ? "○" : "×");
const lines = [];
lines.push(`# 公開前チェック 実行結果 (${new Date().toISOString().slice(0, 10)})`, "", `origin: ${origin} / ページ数: ${pages.size} / 基準: git main`, "");
for (const section of ["A", "B", "C"]) {
  lines.push(`## ${section}`, "", "| # | 判定 | 項目 | 件数 |", "|---|---|---|---|");
  for (const r of results.filter((r) => r.id.startsWith(section))) lines.push(`| ${r.id} | ${mark(r.ok)} | ${r.label} | ${r.count}${r.note ? `<br>※${r.note}` : ""} |`);
  lines.push("");
  for (const r of results.filter((r) => r.id.startsWith(section) && r.ok === false && r.detail.length)) {
    lines.push(`### ${r.id} の該当一覧(${r.detail.length}件)`, "");
    for (const d of r.detail.slice(0, 200)) lines.push(`- ${d}`);
    if (r.detail.length > 200) lines.push(`- …ほか ${r.detail.length - 200} 件`);
    lines.push("");
  }
}
const d8 = ["/columns/moushitatesho-a4-insatsu", "/columns/moushitatesho-kikan-kugiri", "/columns/teishutsusaki-yuusou"];
lines.push("## D(人が見る): 確認用の一覧", "", `全ページの URL・タイトル・文字数は \`${path.relative(root, path.join(outDir, "pages.tsv"))}\` に出力。`, "", "| URL | タイトル | 文字数 |", "|---|---|---|");
for (const p of d8) lines.push(`| ${p} | ${pages.get(p)?.title ?? "(取得不可)"} | ${pages.get(p)?.chars ?? "-"} |`);
lines.push("");
if (globalThis.__a8Explained) {
  lines.push("## A-8 付記: 金額の検算(data/amounts.ts からの導出)", "");
  for (const d of globalThis.__a8Explained) lines.push(`- ${d}`);
  lines.push("", `参考: amounts.ts の値を直書きしているファイル ${globalThis.__a8Hardcoded.length} 件(判定には使わない): ${globalThis.__a8Hardcoded.join(", ")}`, "");
}
if (globalThis.__shrunk?.length) { lines.push("## 参考: 公開前より本文が減った既存記事(8割以上は維持)", ""); for (const d of globalThis.__shrunk) lines.push(`- ${d}`); lines.push(""); }
const report = lines.join("\n");
// 3つ目の引数で出力ファイル名を変えられる(既定 RESULT-latest.md。手で整理した RESULT.md を上書きしない)
writeFileSync(path.join(outDir, process.argv[3] ?? "RESULT-latest.md"), report);
console.log(report);
const fatal = results.filter((r) => r.id.startsWith("A") && r.ok === false);
console.log(fatal.length ? `\nA に × が ${fatal.length} 件: 公開しない` : "\nA はすべて ○");
process.exit(fatal.length ? 1 : 0);
