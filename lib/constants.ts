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

export const CONTACT_EMAIL = "shougainenkinsupport@gmail.com";

export const AUTHOR_NAME = "あずまたいすけ";
