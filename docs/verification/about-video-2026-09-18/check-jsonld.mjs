// §5-6 と §5-8。node docs/verification/about-video-2026-09-18/check-jsonld.mjs http://localhost:3200
import { writeFileSync, appendFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://localhost:3200";
const out = []; const say = (s) => { out.push(s); console.log(s); };
const html = await (await fetch(`${origin}/about`)).text();
const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
say(`6. /about の ld+json: ${scripts.length} 個`);
const data = JSON.parse(scripts[0]);
const graph = data["@graph"] ?? [];
const types = graph.map((n) => n["@type"]);
say(`6. @graph の型: ${types.join(", ")}`);
const video = graph.find((n) => n["@type"] === "VideoObject");
const clips = video?.hasPart ?? [];
say(`6. VideoObject: name=${video?.name} / duration=${video?.duration}(PT13M15S と一致=${video?.duration === "PT13M15S"}) / uploadDate=${video?.uploadDate} / inLanguage=${video?.inLanguage} / isFamilyFriendly=${video?.isFamilyFriendly}`);
say(`6. VideoObject: contentUrl=${video?.contentUrl} / thumbnailUrl=${JSON.stringify(video?.thumbnailUrl)} / embedUrl=${video?.embedUrl ?? "なし"}`);
say(`6. VideoObject: author=${JSON.stringify(video?.author)} publisher=${JSON.stringify(video?.publisher)} / transcript ${video?.transcript?.length} 字`);
say(`6. Clip ${clips.length} 件: ${clips.map((c) => `${c.startOffset}-${c.endOffset}`).join(" ")} / 最後の endOffset=${clips.at(-1)?.endOffset} / url の例 ${clips[1]?.url}`);
const person = graph.find((n) => n["@type"] === "Person"); const org = graph.find((n) => n["@type"] === "Organization");
say(`6. @id の参照先が @graph にある: author→Person ${video?.author?.["@id"] === person?.["@id"]} / publisher→Organization ${video?.publisher?.["@id"] === org?.["@id"]}`);
say(`6. description がページの導入文と同じ文: ${html.includes("自分が病気だと気づくまでに8年かかりました。") && video?.description?.startsWith("自分が病気だと気づくまでに8年かかりました。")}`);
// 8. 「道具」が公開ページの表示テキストに 0
const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, "") || "/");
const hits = [];
for (const p of paths) {
  const h = await (await fetch(`${origin}${p}`)).text();
  const main = (h.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "").replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ");
  const n = (main.match(/道具/g) ?? []).length; if (n) hits.push(`${p}: ${n}`);
}
say(`8. 「道具」: ${paths.length} ページ中 ${hits.length} ページ${hits.length ? " → " + hits.join(", ") : "(0件)"}`);
writeFileSync("docs/verification/about-video-2026-09-18/checks-jsonld.txt", out.join("\n") + "\n");
