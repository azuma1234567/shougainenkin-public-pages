import { appStoreLink } from "@/lib/constants";

// 記事に挿入する共通の「アプリ紹介」CTA。
// ct には記事slugを渡す(App Storeキャンペーンリンクの計測用)。
export default function AppCta({
  ct,
  heading = "申請準備を、アプリでひとつずつ",
  body = "この記事の内容を、質問に答えるだけで進められるアプリを作りました。日々の記録が診察で医師に渡せる資料になり、申立書の下書きになります。ログイン不要・記録は端末の中に。基本機能は無料です。",
}: {
  ct: string;
  heading?: string;
  body?: string;
}) {
  return (
    <aside className="app-cta">
      <p className="app-cta-title">{heading}</p>
      <p>{body}</p>
      <p>
        <a
          className="store-button"
          href={appStoreLink(ct)}
          target="_blank"
          rel="noopener noreferrer external"
          aria-label="App Storeで障害年金申請サポートを見る（新しいタブで開きます）"
        >
          App Storeで見る
        </a>
      </p>
    </aside>
  );
}
