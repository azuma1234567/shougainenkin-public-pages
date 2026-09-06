/* /dougu/kougin の保存。localStorage だけ。それ以外へ出さない(lib/mitate-storage.ts と同じ型)。
   localStorage が使えなくても入力と結果表示は動く(すべて try/catch)。 */
import { normalizeKougin, type KouginInput } from "@/lib/kougin";

export const KOUGIN_STORAGE_KEY = "shougainenkin-note:kougin:v1";

export function loadKougin(): KouginInput | null {
  try {
    const raw = localStorage.getItem(KOUGIN_STORAGE_KEY);
    if (!raw) return null;
    return normalizeKougin(JSON.parse(raw));
  } catch { return null; }
}

export function saveKougin(value: KouginInput): boolean {
  try { localStorage.setItem(KOUGIN_STORAGE_KEY, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function clearKougin(): boolean {
  try { localStorage.removeItem(KOUGIN_STORAGE_KEY); return true; }
  catch { return false; }
}
