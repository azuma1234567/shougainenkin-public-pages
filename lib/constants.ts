// サイト全体で使う定数。
// App Store公開後は、環境変数 NEXT_PUBLIC_APP_STORE_URL を設定するか、
// ここの APP_STORE_URL に直接URLを入れるだけでダウンロードボタンが表示されます。

export const SITE_NAME = "障害年金サポート";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? "";

export const CONTACT_EMAIL = "shougainenkinsupport@gmail.com";

export const COPYRIGHT = "© 2026 あずまたいすけ";
