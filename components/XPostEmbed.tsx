"use client";

import Script from "next/script";

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

export default function XPostEmbed({ url }: { url: string }) {
  return (
    <div className="x-post-embed">
      <blockquote
        className="twitter-tweet"
        data-dnt="true"
        data-lang="ja"
        data-theme="light"
      >
        <p>Xの公開投稿を読み込んでいます。</p>
        <a href={url} target="_blank" rel="noopener noreferrer external">
          投稿をXで開く
        </a>
      </blockquote>
      <Script
        id="x-widgets"
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        onLoad={() => window.twttr?.widgets?.load()}
      />
    </div>
  );
}
