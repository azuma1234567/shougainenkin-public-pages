/* llms.txt(監査 §4-6 / T6)。sitemap と同じ一覧から作るので、ページが増えれば自動で載る。
   効果が実証された仕組みではないが、置く手間が小さいので置いておく。
   中身は「このサイトは何か」と「どこに何があるか」だけ。売り込みは書かない。 */
import sitemap from "@/app/sitemap";
import { SITE_URL } from "@/lib/constants";
import { COLUMNS_BY_DATE } from "@/lib/columns";
import { HUB_CONTENT } from "@/lib/hub-content";
import { GOKAI } from "@/data/gokai";

export const dynamic = "force-static";

const line = (url: string, title: string) => `- [${title}](${url})`;

export function GET() {
  const entries = sitemap();
  const path = (url: string) => url.replace(SITE_URL, "") || "/";
  const has = (prefix: string) => entries.filter((e) => path(String(e.url)).startsWith(prefix));

  const hubs = Object.entries(HUB_CONTENT)
    .map(([p, c]) => line(`${SITE_URL}${p}`, c.title))
    .sort();
  const columns = COLUMNS_BY_DATE.map((c) => line(`${SITE_URL}/columns/${c.slug}`, c.title));
  const gokai = GOKAI.map((c) => line(`${SITE_URL}/gokai/${c.slug}`, c.misconception));
  const tools = has("/dougu/").map((e) => line(String(e.url), path(String(e.url))));

  const body = `# 障害年金申請サポート

> 障害年金について、公的資料の出典と確認日をつけて説明するサイトです。
> 公開されている裁決例の原文つきの実例と、自分の場合を確かめる道具を置いています。
> 特定の事務所を推薦・選定しません。

すべてのページに、その記述の出典(法令・厚生労働省・日本年金機構の公表資料)と確認日を書いています。
金額は令和8年度の年金額です。制度は変わるため、最後は年金事務所で確認してください。

## 道具(入力はブラウザの中だけで処理し、サーバーへ送りません)

${tools.join("\n")}

## 病気・状況・お金・悩みから探す

${hubs.join("\n")}

## よくある誤解

${gokai.join("\n")}

## 記事

${columns.join("\n")}

## 一覧

- [sitemap.xml](${SITE_URL}/sitemap.xml)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
