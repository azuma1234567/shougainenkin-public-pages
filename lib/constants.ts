// サイト全体で使う定数。

export const SITE_NAME = "障害年金申請サポート";

// SEOで使う正式URLは、プレビュー用の環境変数に左右されないよう固定する。
export const SITE_URL = "https://shougainenkin-note.net";

export const APP_STORE_ID = "6790402509";
const APP_STORE_FALLBACK_URL =
  "https://apps.apple.com/jp/app/%E9%9A%9C%E5%AE%B3%E5%B9%B4%E9%87%91%E7%94%B3%E8%AB%8B%E3%82%B5%E3%83%9D%E3%83%BC%E3%83%88/id6790402509";

function resolveAppStoreUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_STORE_URL?.trim();
  if (!configuredUrl) return APP_STORE_FALLBACK_URL;

  try {
    const url = new URL(configuredUrl);
    return url.protocol === "https:" ? url.toString() : APP_STORE_FALLBACK_URL;
  } catch {
    return APP_STORE_FALLBACK_URL;
  }
}

export const APP_STORE_URL = resolveAppStoreUrl();

// 記事ごとの流入計測用キャンペーンリンクを生成する
// ct = キャンペーン名(記事slugを渡す)
export const appStoreLink = (_ct: string) => APP_STORE_URL;

// アプリ「障害年金申請サポート」の利用規約・プライバシーポリシーの制定日。
// 次の4か所は常に同じ値・同じ文面にすること(原本は shougainenkin リポジトリの
// docs/public-pages.md)。過去に公開サイトだけが古いまま取り残された実績がある。
//   1. docs/public-pages.md               … 原本
//   2. ここ(公開サイト /app/terms・/app/privacy)… 利用者が実際に読むページ
//   3. server/app/{terms,privacy}/page.tsx … LEGAL_VERSION
//   4. src/MockupV4App 14.tsx             … LEGAL_VERSION(アプリ内表示)
//
// 制定日は、条文そのものを改定したときだけ動かす。文言を1文字も変えていない
// 同期作業や表示の修正では動かさないこと。
//
// 2026-09-03: 公開サイトの /terms・/privacy はサイト向けの文面(広告・アクセス
// 解析・掲載)へ切り替わり、アプリ向けの文面は /app/terms・/app/privacy へ移した。
// この定数はアプリ向け2ページだけが使う。
export const LEGAL_VERSION = "2026年8月28日";

// 公開サイト自身の利用規約・プライバシーポリシー・広告掲載規約・運営者情報の
// 最終更新日。アプリ側の制定日(LEGAL_VERSION)とは系統が別で、混ぜないこと。
// サイト側は広告主・解析ツールの変更のたびに改定するため、独立して動かす。
export const SITE_LEGAL_UPDATED = "2026年9月3日";

// 出典を最後に確かめた日。トップ・実例・申請の流れのように、1本の原稿ではなく
// 複数の出典を束ねているページが使う(PageDate の「最終確認日」)。
// ここ1か所で持ち、ページごとに書かない。出典を見直したらこの日付を上げる。
export const SITE_PAGES_CHECKED = "2026-09-04";

export const CONTACT_EMAIL = "shougainenkinsupport@gmail.com";

export const AUTHOR_NAME = "あずまたいすけ";
