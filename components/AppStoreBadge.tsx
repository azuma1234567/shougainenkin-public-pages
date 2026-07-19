import Image from "next/image";

export default function AppStoreBadge({ href }: { href: string }) {
  return (
    <a
      className="app-store-badge-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer external"
      aria-label="App Storeから障害年金申請サポートをダウンロード（新しいタブで開きます）"
    >
      <Image
        className="app-store-badge-image"
        src="/app-store-badge.png"
        alt="App Storeからダウンロード"
        width={800}
        height={237}
        sizes="(max-width: 480px) 260px, 280px"
      />
    </a>
  );
}
