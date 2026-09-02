import { apply2026Amounts } from "@/data/amounts";
import byokiTougou from "@/data/hubs/byoki-tougou.json";
import byokiChiteki from "@/data/hubs/byoki-chiteki.json";
import byokiTenkan from "@/data/hubs/byoki-tenkan.json";
import byokiHattatsu from "@/data/hubs/byoki-hattatsu.json";
import byokiTekiouFuan from "@/data/hubs/byoki-tekiou-fuan.json";
import erabuJibunKaIrai from "@/data/hubs/erabu-jibun-ka-irai.json";
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
  "/byoki/hattatsu": byokiHattatsu, "/byoki/tekiou-fuan": byokiTekiouFuan,
  "/erabu/jibun-ka-irai": erabuJibunKaIrai, "/joukyou/hatachi-mae": joukyouHatachiMae,
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
