"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const loadRequestedRef = useRef(false);

  const loadPost = useCallback(() => {
    const container = containerRef.current;
    if (!container || !window.twttr?.widgets || loadRequestedRef.current) {
      return;
    }

    loadRequestedRef.current = true;
    container.dataset.state = "loading";
    window.twttr.widgets.load(container);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const markAsLoaded = () => {
      if (container.querySelector('iframe[id^="twitter-widget"]')) {
        container.dataset.state = "loaded";
        return true;
      }
      return false;
    };

    const observer = new MutationObserver(markAsLoaded);
    observer.observe(container, { childList: true, subtree: true });

    const fallbackTimer = window.setTimeout(() => {
      if (!markAsLoaded()) {
        container.dataset.state = "fallback";
      }
    }, 10000);

    loadPost();

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, [loadPost]);

  return (
    <div ref={containerRef} className="x-post-embed" data-state="loading">
      <blockquote
        className="twitter-tweet"
        data-dnt="true"
        data-lang="ja"
        data-theme="light"
      >
        <div className="x-post-fallback">
          <p>Xの投稿を表示できない場合は、Xで直接ご覧ください。</p>
          <a href={url} target="_blank" rel="noopener noreferrer external">
            Xで投稿を見る
          </a>
        </div>
      </blockquote>
      <Script
        id="x-widgets"
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onReady={loadPost}
        onError={() => {
          if (containerRef.current) {
            containerRef.current.dataset.state = "fallback";
          }
        }}
      />
    </div>
  );
}
