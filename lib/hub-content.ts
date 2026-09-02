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
import nayamiKoushin from "@/data/hubs/nayami-koushin.json";
import nayamiShikyuuTeishi from "@/data/hubs/nayami-shikyuu-teishi.json";
import nayamiShindansho from "@/data/hubs/nayami-shindansho-komatta.json";
import nayamiShoshinbi from "@/data/hubs/nayami-shoshinbi-karute.json";
import nayamiSokyuu from "@/data/hubs/nayami-sokyuu.json";
import okaneIkura from "@/data/hubs/okane-ikura.json";

export type HubContent = { title: string; breadcrumb: string[]; source: string };
export const HUB_CONTENT: Record<string, HubContent> = {
  "/byoki/tougou": byokiTougou, "/byoki/chiteki": byokiChiteki, "/byoki/tenkan": byokiTenkan,
  "/byoki/jinzou-touseki": byokiJinzouTouseki, "/byoki/gan": byokiGan, "/byoki/shinzou": byokiShinzou,
  "/byoki/tounyou": byokiTounyou, "/byoki/shitai": byokiShitai,
  "/byoki/hattatsu": byokiHattatsu, "/byoki/tekiou-fuan": byokiTekiouFuan,
  "/byoki/ninchishou": byokiNinchishou, "/byoki/koujinou": byokiKoujinou, "/byoki/izon": byokiIzon,
  "/byoki/kanzou": byokiKanzou, "/byoki/kokyuuki": byokiKokyuuki, "/byoki/ketsueki": byokiKetsueki,
  "/byoki/shikaku": byokiShikaku, "/byoki/choukaku": byokiChoukaku, "/byoki/gengo": byokiGengo, "/byoki/nanbyou": byokiNanbyou,
  "/erabu/jibun-ka-irai": erabuJibunKaIrai,
  "/erabu/irai-subeki-case": erabuIraiSubekiCase, "/erabu/hiyou-souba": erabuHiyouSouba,
  "/erabu/erabikata": erabuErabikata, "/erabu/fushikyu-no-ato": erabuFushikyuNoAto,
  "/joukyou/hatachi-mae": joukyouHatachiMae,
  "/joukyou/hatarakinagara": joukyouHatarakinagara, "/joukyou/hitorigurashi": joukyouHitorigurashi,
  "/joukyou/shoubyou-teatekin-kara": joukyouShoubyou, "/nayami/koushin": nayamiKoushin,
  "/nayami/shikyuu-teishi": nayamiShikyuuTeishi, "/nayami/shindansho-komatta": nayamiShindansho,
  "/nayami/shoshinbi-karute": nayamiShoshinbi, "/nayami/sokyuu": nayamiSokyuu, "/okane/ikura": okaneIkura,
};
export function getHubContent(path: string): HubContent | null {
  const item = HUB_CONTENT[path];
  if (!item) return null;
  return { ...item, source: apply2026Amounts(item.source).replace(/→ ([^\n(]+)\((\/[^)]+)\)/g, "→ [$1]($2)") };
}
