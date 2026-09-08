// §4 の 5〜8。node --import ./scripts/lib/ts-alias.mjs docs/verification/seo-2026-09-08/check.mjs http://127.0.0.1:3000
import { writeFileSync } from "node:fs";
import { parse } from "node-html-parser";
import sitemapFn from "../../../app/sitemap.ts";
import { SITE_URL } from "../../../lib/constants.ts";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const out = []; const say = (s) => { out.push(s); console.log(s); };

// 5. /llms.txt
{
  const res = await fetch(`${origin}/llms.txt`);
  const text = await res.text();
  const lines = text.split("\n");
  const urls = [...new Set([...text.matchAll(/\]\((https:\/\/shougainenkin-note\.net[^)]*)\)/g)].map((m) => m[1]))]
    .filter((u) => !u.endsWith("/sitemap.xml"));
  const sm = [...new Set(sitemapFn().map((e) => String(e.url)))];
  const missing = sm.filter((u) => !urls.includes(u));
  const extra = urls.filter((u) => !sm.includes(u));
  say(`5. /llms.txt: status ${res.status} / Content-Type ${res.headers.get("content-type")}`);
  say(`5. 1行目「${lines[0]}」/ 収録 URL ${urls.length} 件 ・ sitemap ${sm.length} 件 ・ 一致=${missing.length === 0 && extra.length === 0}`);
  if (missing.length) say(`5. llms.txt に無い: ${missing.slice(0, 8).join(", ")}`);
  if (extra.length) say(`5. sitemap に無い: ${extra.slice(0, 8).join(", ")}`);
  const noTitle = lines.filter((l) => /^- \[\//.test(l));
  say(`5. 題名がパスのままの行: ${noTitle.length}${noTitle.length ? " → " + noTitle.slice(0, 5).join(" / ") : ""}`);
  say(`5. 節: ${lines.filter((l) => l.startsWith("## ")).map((l) => l.slice(3)).join(" / ")} / 全体 ${text.length} 字`);
}
// 6. トップの JSON-LD
{
  const root = parse((await (await fetch(`${origin}/`)).text()).replaceAll("<!-- -->", ""));
  const scripts = root.querySelectorAll('script[type="application/ld+json"]');
  const parsed = scripts.map((s) => JSON.parse(s.textContent));
  const graph = parsed[0]?.["@graph"] ?? [];
  const org = graph.find((n) => n["@type"] === "Organization");
  const web = graph.find((n) => n["@type"] === "WebSite");
  say(`6. トップの ld+json は ${scripts.length} 個 / @graph の型 ${graph.map((n) => n["@type"]).join(", ")}`);
  say(`6. WebSite: @id=${web?.["@id"]} inLanguage=${web?.inLanguage} publisher=${JSON.stringify(web?.publisher)}`);
  say(`6. Organization: @id=${org?.["@id"]} sameAs=${JSON.stringify(org?.sameAs)}(${org?.sameAs?.length ?? 0} 件)`);
  say(`6. SearchAction: ${JSON.stringify(parsed).includes("SearchAction") ? "あり(入れない約束に反する)" : "なし"}`);
  // /about の Organization が同じ @id を指しているか
  const about = parse(await (await fetch(`${origin}/about`)).text());
  const aboutOrg = about.querySelectorAll('script[type="application/ld+json"]').map((s) => JSON.parse(s.textContent)).flatMap((j) => j["@graph"] ?? [j]).find((n) => n["@type"] === "Organization");
  say(`6. /about の Organization: @id=${aboutOrg?.["@id"]} sameAs ${aboutOrg?.sameAs?.length ?? 0} 件(トップと同じ @id=${aboutOrg?.["@id"] === org?.["@id"]})`);
}
// 7. §3 の6ページ
{
  const want = [
    ["/columns/shinsei-kikan", "結果待ち"],
    ["/dougu/moushitatesho", "スマホ"],
    ["/columns/jushinjokyo-shomeisho", "郵送"],
    ["/columns/nenkin-jimusho-soudan", "持ち物"],
    ["/nayami/koushin", "落ちる"],
    ["/columns/shoshinbi-wakaranai", "初診日"],
  ];
  for (const [path, word] of want) {
    const html = (await (await fetch(`${origin}${path}`)).text()).replaceAll("<!-- -->", "");
    const root = parse(html);
    const title = root.querySelector("title")?.textContent ?? "";
    const h2 = root.querySelectorAll("main h2, main h3").map((h) => h.textContent.trim());
    const inTitle = title.includes(word);
    const hit = h2.filter((h) => h.includes(word));
    say(`7. ${path}「${word}」: title=${inTitle}「${title}」/ 見出し ${hit.length} 本${hit.length ? " → " + hit.slice(0, 2).join(" / ") : ""}`);
  }
}
// 8. 「道具」が公開ページの表示テキストに 0
{
  const paths = [...new Set(sitemapFn().map((e) => String(e.url).replace(SITE_URL, "") || "/"))];
  const hits = [];
  for (const path of paths) {
    const html = await (await fetch(`${origin}${path}`)).text();
    const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "";
    const text = main.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ");
    const n = (text.match(/道具/g) ?? []).length;
    if (n) hits.push(`${path}: ${n}`);
  }
  say(`8. 「道具」: ${paths.length} ページ中 ${hits.length} ページ${hits.length ? " → " + hits.join(", ") : "(0件)"}`);
}
writeFileSync("docs/verification/seo-2026-09-08/checks.txt", out.join("\n") + "\n");
