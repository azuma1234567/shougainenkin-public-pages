import type { MoushitateshoState } from "@/data/moushitatesho/types";
export const STORAGE_KEY = "shougainenkin-note:moushitatesho:v1";
export function loadMoushitatesho(): MoushitateshoState | null { try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null; const value = JSON.parse(raw); return value?.version === 1 ? value : null; } catch { return null; } }
export function saveMoushitatesho(value: MoushitateshoState) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); return true; } catch { return false; } }
export function clearMoushitatesho() { try { localStorage.removeItem(STORAGE_KEY); return true; } catch { return false; } }
