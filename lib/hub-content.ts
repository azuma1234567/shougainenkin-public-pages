import { apply2026Amounts } from "@/data/amounts";
import byokiTougou from "@/data/hubs/byoki-tougou.json";
import byokiChiteki from "@/data/hubs/byoki-chiteki.json";
import byokiTenkan from "@/data/hubs/byoki-tenkan.json";
import byokiJinzouTouseki from "@/data/hubs/byoki-jinzou-touseki.json";
import byokiGan from "@/data/hubs/byoki-gan.json";
import byokiShinzou from "@/data/hubs/byoki-shinzou.json";
import byokiTounyou from "@/data/hubs/byoki-tounyou.json";
import byokiShitai from "@/data/hubs/byoki-shitai.json";
import byokiHattatsu from "@/data/hubs/byoki-hattatsu.json";
import byokiTekiouFuan from "@/data/hubs/byoki-tekiou-fuan.json";
import byokiNinchishou from "@/data/hubs/byoki-ninchishou.json";
import byokiKoujinou from "@/data/hubs/byoki-koujinou.json";
import byokiIzon from "@/data/hubs/byoki-izon.json";
import byokiKanzou from "@/data/hubs/byoki-kanzou.json";
import byokiKokyuuki from "@/data/hubs/byoki-kokyuuki.json";
import byokiKetsueki from "@/data/hubs/byoki-ketsueki.json";
import byokiShikaku from "@/data/hubs/byoki-shikaku.json";
import byokiChoukaku from "@/data/hubs/byoki-choukaku.json";
import byokiGengo from "@/data/hubs/byoki-gengo.json";
import byokiNanbyou from "@/data/hubs/byoki-nanbyou.json";
import erabuJibunKaIrai from "@/data/hubs/erabu-jibun-ka-irai.json";
import erabuIraiSubekiCase from "@/data/hubs/erabu-irai-subeki-case.json";
import erabuHiyouSouba from "@/data/hubs/erabu-hiyou-souba.json";
import erabuErabikata from "@/data/hubs/erabu-erabikata.json";
import erabuFushikyuNoAto from "@/data/hubs/erabu-fushikyu-no-ato.json";
import joukyouHatachiMae from "@/data/hubs/joukyou-hatachi-mae.json";
import joukyouHatarakinagara from "@/data/hubs/joukyou-hatarakinagara.json";
import joukyouHitorigurashi from "@/data/hubs/joukyou-hitorigurashi.json";
import joukyouShoubyou from "@/data/hubs/joukyou-shoubyou-teatekin-kara.json";
import joukyou65sai from "@/data/hubs/joukyou-65sai-ijou.json";
import joukyouShufu from "@/data/hubs/joukyou-shufu-mushoku.json";
import joukyouGakusei from "@/data/hubs/joukyou-gakusei.json";
import joukyouKazoku from "@/data/hubs/joukyou-kazoku-ga-tetsudau.json";
import joukyouSeikatsuHogo from "@/data/hubs/joukyou-seikatsu-hogo.json";
import nayamiKoushin from "@/data/hubs/nayami-koushin.json";
import nayamiShikyuuTeishi from "@/data/hubs/nayami-shikyuu-teishi.json";
import nayamiShindansho from "@/data/hubs/nayami-shindansho-komatta.json";
import nayamiShoshinbi from "@/data/hubs/nayami-shoshinbi-karute.json";
import nayamiSokyuu from "@/data/hubs/nayami-sokyuu.json";
import nayamiFushikyu from "@/data/hubs/nayami-fushikyu.json";
import byokiUtsuSoukyoku from "@/data/hubs/byoki-utsu-soukyoku.json";
import okaneIkura from "@/data/hubs/okane-ikura.json";
import okaneZeikin from "@/data/hubs/okane-zeikin.json";
import okaneChousei from "@/data/hubs/okane-chousei.json";

const nayamiFushikyuPublished = {
  ...nayamiFushikyu,
  source: nayamiFushikyu.source
    .replace(
      "★codexが日本年金機構・厚生労働省の公表情報で確認して埋めること。確認できなければ、この項目ごと削る。",
      "地方厚生局の案内では、審査請求書を受け付けてから**概ね3〜4か月**かかっているとされています。ただし、内容によってはそれ以上かかる場合があります。",
    )
    .replace(
      "- 日本年金機構「障害年金の請求手続き(診断書の現症日)」・確認日 2026-08-31",
      "- 日本年金機構「障害年金の請求手続き(診断書の現症日)」・確認日 2026-08-31\n- 九州厚生局「社会保険審査官に対する審査請求に関するよくあるご質問Q&A」・確認日 2026-09-02",
    ),
};

/* dateModified はハブの最終更新日(YYYY-MM-DD)。sitemap の lastModified と
   画面の「最終更新」に使う(監査 §4-1・§4-2)。data/hubs/*.json が持つ。 */
export type HubContent = { title: string; dateModified: string; breadcrumb: string[]; source: string };
import jukyuugoHataraku from "@/data/hubs/jukyuugo-hataraku.json";
import jukyuugoSagyousho from "@/data/hubs/jukyuugo-sagyousho.json";
import jukyuugoNukedasu from "@/data/hubs/jukyuugo-nukedasu.json";
import jukyuugoOkane from "@/data/hubs/jukyuugo-okane.json";
import jukyuugoAGataHeisa from "@/data/hubs/jukyuugo-a-gata-heisa.json";

export const HUB_CONTENT: Record<string, HubContent> = {
  "/byoki/tougou": byokiTougou, "/byoki/chiteki": byokiChiteki, "/byoki/tenkan": byokiTenkan,
  "/byoki/jinzou-touseki": byokiJinzouTouseki, "/byoki/gan": byokiGan, "/byoki/shinzou": byokiShinzou,
  "/byoki/tounyou": byokiTounyou, "/byoki/shitai": byokiShitai,
  "/byoki/hattatsu": byokiHattatsu, "/byoki/tekiou-fuan": byokiTekiouFuan,
  "/byoki/ninchishou": byokiNinchishou, "/byoki/koujinou": byokiKoujinou, "/byoki/izon": byokiIzon,
  "/byoki/kanzou": byokiKanzou, "/byoki/kokyuuki": byokiKokyuuki, "/byoki/ketsueki": byokiKetsueki,
  "/jukyuugo/hataraku": jukyuugoHataraku, "/jukyuugo/sagyousho": jukyuugoSagyousho,
  "/jukyuugo/nukedasu": jukyuugoNukedasu, "/jukyuugo/okane": jukyuugoOkane,
  "/jukyuugo/a-gata-heisa": jukyuugoAGataHeisa,
  "/byoki/shikaku": byokiShikaku, "/byoki/choukaku": byokiChoukaku, "/byoki/gengo": byokiGengo, "/byoki/nanbyou": byokiNanbyou,
  "/erabu/jibun-ka-irai": erabuJibunKaIrai,
  "/erabu/irai-subeki-case": erabuIraiSubekiCase, "/erabu/hiyou-souba": erabuHiyouSouba,
  "/erabu/erabikata": erabuErabikata, "/erabu/fushikyu-no-ato": erabuFushikyuNoAto,
  "/joukyou/hatachi-mae": joukyouHatachiMae,
  "/joukyou/hatarakinagara": joukyouHatarakinagara, "/joukyou/hitorigurashi": joukyouHitorigurashi,
  "/joukyou/shoubyou-teatekin-kara": joukyouShoubyou, "/nayami/koushin": nayamiKoushin,
  "/joukyou/65sai-ijou": joukyou65sai, "/joukyou/shufu-mushoku": joukyouShufu,
  "/joukyou/gakusei": joukyouGakusei, "/joukyou/kazoku-ga-tetsudau": joukyouKazoku,
  "/joukyou/seikatsu-hogo": joukyouSeikatsuHogo,
  "/nayami/shikyuu-teishi": nayamiShikyuuTeishi, "/nayami/shindansho-komatta": nayamiShindansho,
  "/nayami/shoshinbi-karute": nayamiShoshinbi, "/nayami/sokyuu": nayamiSokyuu, "/nayami/fushikyu": nayamiFushikyuPublished,
  "/byoki/utsu-soukyoku": byokiUtsuSoukyoku, "/okane/ikura": okaneIkura,
  "/okane/zeikin": okaneZeikin, "/okane/chousei": okaneChousei,
};
export function getHubContent(path: string): HubContent | null {
  const item = HUB_CONTENT[path];
  if (!item) return null;
  /* 原稿の「→ ラベル(/path)」をリンクにする。1行に2本目が「、」や「/」で続くことが
     あるので、矢印のある行だけ2本目以降も変換する(変換しないと URL が本文に出る)。 */
  const linked = apply2026Amounts(item.source)
    .split("\n")
    .map((line) => {
      if (!line.includes("→ ")) return line;
      const first = line.replace(/→ ([^\n(]+)\((\/[^)]+)\)/g, "→ [$1]($2)");
      return first.replace(/(^|[、,／/]\s*)([^\n、,／/(\[\]]+)\((\/[^)]+)\)/g, "$1[$2]($3)");
    })
    .join("\n");
  return { ...item, source: linked };
}

// その種類(byoki/nayami/…)のハブ本文に書かれた「確認日 yyyy-mm-dd」の最大値。索引ページの最終更新日に使う。
export function latestHubCheckedDate(kind: string): string {
  const dates = Object.entries(HUB_CONTENT)
    .filter(([path]) => path.startsWith(`/${kind}/`))
    .flatMap(([, item]) => [...item.source.matchAll(/確認日[ :：]*(\d{4}-\d{2}-\d{2})/g)].map((m) => m[1]));
  return dates.sort().at(-1) ?? "2026-09-02";
}

/* ハブの本文から「よくある質問」を取り出す(監査 §4-2)。
   抽出の規則は components/MarkdownArticle.tsx の faqAccordion 分岐と**同じ**にしてある
   (`**Q.` で始まる行が質問、次の空行か次の `**Q.` か `## ` までが答え)。
   画面に出ている Q/A と JSON-LD の Q/A が食い違うと Google のガイドライン違反になるので、
   ここを直すときは MarkdownArticle 側も一緒に直すこと。scripts/verify-hub-content.mjs が
   40本以上のハブで「抽出した question == 画面の summary」を確かめている。 */
export function extractHubFaqs(source: string): { question: string; answer: string }[] {
  const lines = source.split("\n").map((line) => line.trim());
  const faqs: { question: string; answer: string }[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    index += 1;
    if (!/^\*\*Q[.．]/.test(line)) continue;
    /* 答えが同じ行に続く形(`**Q. …** 答え`)にも対応する。MarkdownArticle 側と同じ。 */
    const inline = /^\*\*(Q[.．][^*]*?)\*\*\s*(.*)$/.exec(line);
    const question = inline ? inline[1] : line.replace(/^\*\*/, "").replace(/\*\*$/, "");
    const answerLines: string[] = inline && inline[2] ? [inline[2]] : [];
    while (index < lines.length) {
      const next = lines[index];
      if (!next) { index += 1; break; }
      if (/^\*\*Q[.．]/.test(next) || next.startsWith("## ")) break;
      answerLines.push(next);
      index += 1;
    }
    faqs.push({ question: plainText(question), answer: plainText(answerLines.join(" ")) });
  }
  return faqs;
}

/* JSON-LD に入れるのは飾りを落とした素のテキスト。**強調** と [文字](リンク) を外す。 */
function plainText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
