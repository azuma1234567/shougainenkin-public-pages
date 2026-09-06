/* /dougu/koushin の保存。localStorage だけ。それ以外へ出さない(lib/mitate-storage.ts と同じ型)。
   保存すると、次に開いたときに残り日数が更新されて出る(端末の中だけ)。 */
import { normalizeKoushin, type KoushinInput } from "@/lib/koushin";

export const KOUSHIN_STORAGE_KEY = "shougainenkin-note:koushin:v1";

export function loadKoushin(): KoushinInput | null {
  try {
    const raw = localStorage.getItem(KOUSHIN_STORAGE_KEY);
    if (!raw) return null;
    return normalizeKoushin(JSON.parse(raw));
  } catch { return null; }
}

export function saveKoushin(value: KoushinInput): boolean {
  try { localStorage.setItem(KOUSHIN_STORAGE_KEY, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function clearKoushin(): boolean {
  try { localStorage.removeItem(KOUSHIN_STORAGE_KEY); return true; }
  catch { return false; }
}
