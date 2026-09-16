/* /sharoushi の計測(docs/claude-code-sharoushi-list-2026-09-16-instructions.md §5、v0 §3)。
   送るのは事務所 id・都道府県・絞り込みのラベル・遷移元の区分だけ。閲覧者の情報、氏名、
   電話番号、URL、パスの全文は送らない。window.gtag が無ければ(計測を止めている人)何もしない。
   コールトラッキング番号は使わない。 */

import { previousPathname } from "@/lib/nav-from";

type Params = Record<string, string | number | boolean>;

function send(name: string, params: Params) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

const firstSegment = (pathname: string): string => pathname.split("/").filter(Boolean)[0] ?? "top";

/* §5-2: 参照元が自サイトなら先頭セグメント(erabu / nayami / dougu / top / sharoushi など)。外部・直接なら external。
   <Link> の遷移では document.referrer が変わらないので、まず lib/nav-from.ts の直前パスを見る。 */
export function fromReferrer(): string {
  if (typeof document === "undefined") return "external";
  const prev = previousPathname();
  if (prev) return firstSegment(prev);
  try {
    if (!document.referrer) return "external";
    const ref = new URL(document.referrer);
    if (ref.origin !== window.location.origin) return "external";
    return firstSegment(ref.pathname);
  } catch {
    return "external";
  }
}

export const trackListView = (pref: string) => send("sharoushi_list_view", { pref, from: fromReferrer() });
export const trackFilter = (pref: string, filter: string, on: boolean, resultCount: number) =>
  send("sharoushi_filter", { pref, filter, on, result_count: resultCount });
export const trackProfileView = (officeId: string, pref: string) =>
  send("sharoushi_profile_view", { office_id: officeId, pref, from: fromReferrer() });
export const trackTelTap = (officeId: string) => send("sharoushi_tel_tap", { office_id: officeId });
export const trackMailTap = (officeId: string) => send("sharoushi_mail_tap", { office_id: officeId });
export const trackSiteClick = (officeId: string) => send("sharoushi_site_click", { office_id: officeId });
