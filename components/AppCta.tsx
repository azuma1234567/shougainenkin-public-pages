import { appStoreLink } from "@/lib/constants";
import AppStoreBadge from "@/components/AppStoreBadge";

// 記事に挿入する共通の「アプリ紹介」CTA。
// ct には記事slugを渡す(App Storeキャンペーンリンクの計測用)。
export default function AppCta({ ct }: { ct: string }) {
  return (
    <aside className="app-cta">
      <p className="app-cta-title">申請準備を、アプリでひとつずつ</p>
      <p>
        この記事の内容を、質問に答えるだけで進められるアプリを作りました。
        日々の記録が診察で医師に渡せる資料になり、申立書の下書きになります。
        ログイン不要・記録は端末の中に。基本機能は無料です。
      </p>
      <p>
        <AppStoreBadge href={appStoreLink(ct)} />
      </p>
    </aside>
  );
}
