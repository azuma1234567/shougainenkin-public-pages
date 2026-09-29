// 描画後の /jitsurei と記事の裁決 PDF リンクが 05-r02_03 を指し、05-r2_r3 が残っていないか。
//   node docs/verification/saiketsu-urls-2026-09-28/check-rendered-links.mjs http://localhost:3210
import { parse } from "node-html-parser";
const origin = process.argv[2] ?? "http://localhost:3210";
const pages = ["/jitsurei", "/jitsurei?case=r02_03-12_06", "/columns/shoshinbi-wakaranai", "/columns/koushin-kakuninhodo", "/columns/sokyuu-seikyuu"];
for (const p of pages) {
  const html = await (await fetch(`${origin}${p}`)).text();
  const dom = parse(html);
  const hrefs = dom.querySelectorAll("a[href]").map((a) => a.getAttribute("href"));
  const r2r3 = hrefs.filter((h) => h.includes("05-r2_r3")).length;
  const r0203 = [...new Set(hrefs.filter((h) => h.includes("05-r02_03")))];
  console.log(`${p}: 05-r02_03 のリンク ${r0203.length} 本(異なる URL)、05-r2_r3 の残り ${r2r3} 本、r02_03-05_04 の言及 ${(html.match(/r02_03-05_04/g) ?? []).length}`);
  if (p === "/jitsurei") for (const h of r0203) console.log(`   ${h.replace("https://www.mhlw.go.jp/topics/bukyoku/shinsa/syakai/dl/", "")}`);
}
