/* llms.txt(監査 §4-6 / T6、docs/seo-2026-09-08-instructions.md §1)。
   収録するのは sitemap と同じ URL 集合。sitemap() をそのまま使うので、ページが増減すれば追随する
   (sitemap から外しているページ = lib/sitemap-excluded.ts のものは、ここにも出ない)。
   題名と説明は、すでにサイトのどこかにある文言だけを使う。ここで新しく書かない。
   効果が実証された仕組みではないが、置く手間が小さいので置いておく。 */
import sitemap from "@/app/sitemap";
import { SITE_URL } from "@/lib/constants";
import { COLUMNS } from "@/lib/columns";
import { HUBS } from "@/lib/hubs";
import { HUB_CONTENT } from "@/lib/hub-content";
import { HUB_HINTS, HUB_INDEX } from "@/lib/hub-index";
import { GOKAI } from "@/data/gokai";
import { TOOLS } from "@/data/dougu";

export const dynamic = "force-static";

/* 一覧・法務のページ。題名は各ページの metadata の title をそのまま写している
   (app/jitsurei/page.tsx の TITLE、app/about/page.tsx の title など)。 */
const STATIC_TITLES: Record<string, string> = {
  "/jitsurei": "結論が変わった実例｜障害年金の公開裁決例",
  "/columns": "障害年金の申請準備コラム",
  "/about": "運営者情報",
  "/support": "お問い合わせ・サポート",
  "/quality": "情報の作り方と、訂正の記録",
  "/privacy": "プライバシーポリシー",
  "/terms": "利用規約",
  "/ads": "広告掲載について",
  "/app": "障害年金申請サポート｜AI相談・申請ガイドアプリ",
  "/app/privacy": "アプリのプライバシーポリシー",
  "/app/terms": "アプリの利用規約",
};

const toolByPath = new Map(Object.values(TOOLS).map((tool) => [tool.path, tool]));
const columnBySlug = new Map(COLUMNS.map((column) => [column.slug, column]));
const gokaiBySlug = new Map(GOKAI.map((card) => [card.slug, card]));
const hubLabel = new Map(HUBS.map((hub) => [hub.path, hub.label]));
const indexKind = (path: string) => path.slice(1) as keyof typeof HUB_INDEX;

/* 1行分の「題名」と「説明」を、既にある文言から引く。見つからなければ説明なし。 */
function entryFor(path: string): { title: string; description?: string } {
  const tool = toolByPath.get(path);
  if (tool) return { title: tool.name, description: tool.blurb };

  const hub = HUB_CONTENT[path];
  if (hub) return { title: hub.title, description: HUB_HINTS[path] };

  if (path.startsWith("/columns/")) {
    const column = columnBySlug.get(path.slice("/columns/".length));
    if (column) return { title: column.title, description: column.description };
  }
  if (path.startsWith("/gokai/")) {
    const card = gokaiBySlug.get(path.slice("/gokai/".length));
    if (card) return { title: card.misconception, description: card.truth };
  }
  if (!path.includes("/", 1) && HUB_INDEX[indexKind(path)]) {
    const spec = HUB_INDEX[indexKind(path)];
    return { title: spec.title, description: spec.description };
  }
  const staticTitle = STATIC_TITLES[path];
  if (staticTitle) return { title: staticTitle };

  return { title: hubLabel.get(path) ?? path };
}

const line = (path: string) => {
  const { title, description } = entryFor(path);
  return `- [${title}](${SITE_URL}${path === "/" ? "" : path})${description ? `: ${description}` : ""}`;
};

export function GET() {
  const paths = sitemap().map((entry) => String(entry.url).replace(SITE_URL, "") || "/");
  const pick = (test: (path: string) => boolean) => paths.filter(test).map(line);

  /* sitemap の URL を、どれかの節に必ず1回だけ入れる(節に当てはまらないものは「主要ページ」へ)。 */
  const isTool = (path: string) => toolByPath.has(path);
  const isHub = (path: string) => !isTool(path) && Boolean(HUB_CONTENT[path]);
  const isGokaiCard = (path: string) => path.startsWith("/gokai/");
  const isColumn = (path: string) => path.startsWith("/columns/");
  const isMain = (path: string) => !isTool(path) && !isHub(path) && !isGokaiCard(path) && !isColumn(path);

  const body = `# 障害年金申請サポート

> 障害年金について、公的資料の出典と確認日をつけて説明するサイトです。
> 公開されている裁決例の原文つきの実例と、自分の場合を確かめる機能を置いています。
> 特定の事務所を推薦・選定しません。

すべてのページに、その記述の出典(法令・厚生労働省・日本年金機構の公表資料)と確認日を書いています。
金額は令和8年度の年金額です。制度は変わるため、最後は年金事務所で確認してください。

## 主要ページ

${pick(isMain).join("\n")}

## 機能(入力はブラウザの中だけで処理し、サーバーへ送りません)

${pick(isTool).join("\n")}

## 病気・状況・困りごと・お金から探す

${pick(isHub).join("\n")}

## よくある誤解

${pick(isGokaiCard).join("\n")}

## 記事

${pick(isColumn).join("\n")}

## 一覧

- [sitemap.xml](${SITE_URL}/sitemap.xml)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
