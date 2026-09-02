import type { YougoEntry } from "@/data/yougo";
export function sortedYougoTerms(entries: YougoEntry[]): YougoEntry[];
export function findFirstYougoTerm(text: string, entries: YougoEntry[], linkedSlugs?: Set<string>, selfSlug?: string): { index: number; entry: YougoEntry } | null;
export function isYougoExcludedTag(tagName: string): boolean;
