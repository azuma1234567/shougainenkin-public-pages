// サイト全体で使う定数。

export const SITE_NAME = "障害年金サポート";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://shougainenkin-note.net";

// アプリは現在App Store審査中。承認・公開されたらtrueに切り替える
export const IS_APP_RELEASED = false;

// TODO: App Store Connectで確認できるアプリIDに差し替えること(審査中でもIDは確認可能)
export const APP_STORE_ID = "XXXXXXXXXX";
export const APP_STORE_URL = `https://apps.apple.com/jp/app/id${APP_STORE_ID}`;

// 記事ごとの流入計測用キャンペーンリンクを生成する
// ct = キャンペーン名(記事slugを渡す)
export const appStoreLink = (ct: string) =>
  `${APP_STORE_URL}?pt=${APP_STORE_ID}&ct=${ct}&mt=8`;

export const CONTACT_EMAIL = "shougainenkinsupport@gmail.com";

export const COPYRIGHT = "© 2026 あずまたいすけ";

export const AUTHOR_NAME = "あずまたいすけ";
