// 広告の導入状況。
//
// /privacy 第6条・/terms 第3条・/about「運営のしかた」・フッターの開示行は、
// すべてここのフラグから文面を組み立てる。タグを実際に入れる前に
// 「利用しています」と書くと先行記載になり、逆に入れたのに書き換え忘れると
// 開示漏れになる。導入・停止と同時にここを動かせば、4か所が一度にそろう。

// Google AdSense のタグをサイトに入れたら true にする。
export const ADSENSE_ENABLED = false;

// 参加しているアフィリエイト・サービス・プロバイダ(ASP)。
// 登録していない事業者の名前は書かないこと(/privacy 第7条)。
// 1件でも入れた時点で、アフィリエイトを利用している扱いになる。
export const AFFILIATE_ASPS: string[] = [];
export const AFFILIATE_ENABLED = AFFILIATE_ASPS.length > 0;

// 社労士事務所などの掲載枠を出しているか。
// トップの掲載枠(app/page.tsx の Listings)の出し分けも、このフラグが決める。
export const SHOW_LISTINGS = false;

// 収益源の呼び名。/terms と /about で言い回しが違うので、両方を持つ。
const AD_SOURCES = [
  {
    enabled: ADSENSE_ENABLED,
    terms: "Google AdSense",
    about: "Google AdSense による広告",
  },
  {
    enabled: AFFILIATE_ENABLED,
    terms: "アフィリエイト広告",
    about: "記事内のアフィリエイト広告",
  },
  {
    enabled: SHOW_LISTINGS,
    terms: "社会保険労務士事務所などからの掲載料",
    about: "社会保険労務士事務所などからの掲載料",
  },
] as const;

// ひとつでも稼働していれば true。文面を「運営しています」と「予定しています」で
// 切り替えるのに使う。
export const HAS_ACTIVE_ADS = AD_SOURCES.some((source) => source.enabled);

// 収益源の列挙。稼働しているものがあればそれだけを、ひとつも無ければ
// 予定しているもの全部を並べる。
export function adSourceList(field: "terms" | "about"): string {
  const active = AD_SOURCES.filter((source) => source.enabled);
  const shown = active.length > 0 ? active : AD_SOURCES;
  return shown.map((source) => source[field]).join("、");
}
