/* /dougu/mitate の保存。localStorage だけ。それ以外へ出さない。
   localStorage が使えなくても入力と結果表示は動く(すべて try/catch)。 */
import { normalizeMitate, type MitateState } from "@/lib/mitate";

export const MITATE_STORAGE_KEY = "shougainenkin-note:mitate:v1";

export function loadMitate(): MitateState | null {
  try {
    const raw = localStorage.getItem(MITATE_STORAGE_KEY);
    if (!raw) return null;
    return normalizeMitate(JSON.parse(raw));
  } catch { return null; }
}

export function saveMitate(value: MitateState): boolean {
  try { localStorage.setItem(MITATE_STORAGE_KEY, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function clearMitate(): boolean {
  try { localStorage.removeItem(MITATE_STORAGE_KEY); return true; }
  catch { return false; }
}
