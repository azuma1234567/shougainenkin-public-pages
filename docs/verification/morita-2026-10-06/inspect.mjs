const pages=["/morita","/morita/qa/ayashii","/morita/qa/kouka","/morita/shoujou/shakou-fuan","/morita/shoujou/kyouhaku","/morita/shoujou/panic","/morita/qa/dokode","/morita/jissen/nikki","/morita/shoujou/shintai","/morita/kangaekata/arugamama","/morita/jissen/yarikata"];
for (const p of pages) {
  const res=await fetch("http://localhost:3210"+p); const h=await res.text();
  const main=h.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
  const lead=main.indexOf("column-conclusion-heading"), safety=main.indexOf("morita-safety"), toc=main.indexOf("article-toc");
  const order=(0<lead&&lead<safety&&safety<toc)?"lead<safety<toc":`ORDER? ${lead} ${safety} ${toc}`;
  const bad=["app-cta","mt-column-card","dougu-","ad-label",'class="references"',"sharoushi","nenkin.go.jp","mhlw.go.jp","sources-internal","App Store","column-theme-block"].filter(c=>main.includes(c));
  const scripts=[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const types=scripts.map(d=>(d["@graph"]??[d]).map(g=>g["@type"]));
  const title=h.match(/<title>([^<]*)<\/title>/)[1];
  const chars=main.replace(/<[^>]+>/g,"").replace(/\s/g,"").length;
  const links=new Set([...main.matchAll(/href="(\/morita[^"]*)"/g)].map(m=>m[1]));
  const author=main.lastIndexOf("morita-author")>main.lastIndexOf("morita-next");
  console.log(`${res.status} ${p}\n  title: ${title}\n  ${order} | 著者欄が末尾: ${author} | 準備中 ×${main.split("準備中").length-1} | 禁止物: ${bad.length?bad.join(","):"なし"}\n  ld+json ${scripts.length} 本 ${JSON.stringify(types)} | 文字数 ${chars} | /morita へのリンク ${links.size}: ${[...links].join(" ")}`);
}
const nay=await (await fetch("http://localhost:3210/nayami")).text(); console.log("nayami /morita links:", (nay.match(/href="\/morita"/g)||[]).length, (nay.match(/不安と付き合いながら暮らす[^<]*<a[^>]*>[^<]*/)||[""])[0]);
